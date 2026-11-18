"""IMAP / SMTP islemleri. Baglanti fabrikalari (connect_imap, connect_smtp) testlerde taklit edilir."""
import imaplib
import re
import smtplib
import time
from contextlib import contextmanager
from email import message_from_bytes, policy
from email.header import decode_header, make_header
from email.message import EmailMessage
from email.utils import formatdate, make_msgid, parseaddr

from . import utf7
from .config import env
from .sanitize import sanitize_html


class MailError(Exception):
    pass


def _cfg(name: str) -> str:
    v = env(name)
    if not v:
        raise MailError(f"Ortam degiskeni eksik: {name}")
    return v


def connect_imap() -> imaplib.IMAP4:
    m = imaplib.IMAP4_SSL(_cfg("MAIL_HOST"), int(env("IMAP_PORT", "993")), timeout=30)
    m.login(_cfg("MAIL_USER"), _cfg("MAIL_PASSWORD"))
    return m


def connect_smtp() -> smtplib.SMTP:
    host, port = _cfg("MAIL_HOST"), int(env("SMTP_PORT", "465"))
    if env("SMTP_MODE", "ssl") == "starttls":
        s = smtplib.SMTP(host, port, timeout=30)
        s.starttls()
    else:
        s = smtplib.SMTP_SSL(host, port, timeout=30)
    s.login(_cfg("MAIL_USER"), _cfg("MAIL_PASSWORD"))
    return s


@contextmanager
def imap():
    m = connect_imap()
    try:
        yield m
    finally:
        try:
            m.logout()
        except Exception:
            pass


def _q(folder: str) -> str:
    return '"' + utf7.encode(folder).replace("\\", "\\\\").replace('"', '\\"') + '"'


def _select(m, folder: str, readonly: bool = True):
    typ, data = m.select(_q(folder), readonly=readonly)
    if typ != "OK":
        raise MailError(f"Klasor acilamadi: {folder}")


def _dh(v) -> str:
    if not v:
        return ""
    try:
        return str(make_header(decode_header(str(v))))
    except Exception:
        return str(v)


_LIST_RE = re.compile(rb'\((?P<flags>.*?)\) (?P<d>"[^"]*"|NIL) (?P<name>.+)')


def list_folders() -> list[dict]:
    with imap() as m:
        typ, data = m.list()
        if typ != "OK":
            raise MailError("Klasorler listelenemedi")
        out = []
        for raw in data:
            if not isinstance(raw, bytes):
                continue
            mt = _LIST_RE.match(raw)
            if not mt:
                continue
            flags = mt.group("flags").decode().lower()
            if "\\noselect" in flags:
                continue
            name = mt.group("name").decode().strip()
            if name.startswith('"') and name.endswith('"'):
                name = name[1:-1].replace('\\"', '"').replace("\\\\", "\\")
            out.append({"name": utf7.decode(name), "flags": flags.split()})
        return out


def _snippet(raw: bytes) -> str:
    try:
        msg = message_from_bytes(raw, policy=policy.default)
        if msg.is_multipart():
            part = msg.get_body(preferencelist=("plain", "html"))
            txt = part.get_content() if part else ""
        else:
            txt = msg.get_content()
    except Exception:
        txt = raw.decode("utf-8", "replace")
    txt = re.sub(r"<[^>]+>", " ", str(txt))
    return re.sub(r"\s+", " ", txt).strip()[:140]


def _parse_fetch(data) -> dict:
    """UID FETCH yanitini {uid: {flags, header, body}} haline getirir."""
    res: dict[int, dict] = {}
    cur = None
    for item in data:
        if not isinstance(item, tuple):
            continue
        meta = item[0].decode(errors="replace")
        um = re.search(r"UID (\d+)", meta)
        if um:
            cur = int(um.group(1))
        if cur is None:
            continue
        e = res.setdefault(cur, {"flags": "", "header": b"", "body": b""})
        fm = re.search(r"FLAGS \(([^)]*)\)", meta)
        if fm:
            e["flags"] = fm.group(1)
        if "HEADER.FIELDS" in meta:
            e["header"] = item[1]
        else:
            e["body"] = item[1]
    return res


def list_messages(folder: str = "INBOX", limit: int = 30, before_uid: int | None = None) -> list[dict]:
    with imap() as m:
        _select(m, folder)
        typ, data = m.uid("SEARCH", None, "ALL")
        if typ != "OK":
            raise MailError("Arama basarisiz")
        uids = sorted((int(x) for x in data[0].split()), reverse=True)
        if before_uid:
            uids = [u for u in uids if u < before_uid]
        uids = uids[:limit]
        if not uids:
            return []
        seq = ",".join(str(u) for u in uids)
        typ, data = m.uid(
            "FETCH", seq,
            "(FLAGS BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)] BODY.PEEK[TEXT]<0.600>)",
        )
        if typ != "OK":
            raise MailError("Basliklar alinamadi")
        parsed = _parse_fetch(data)
        out = []
        for u in uids:
            e = parsed.get(u)
            if not e:
                continue
            h = message_from_bytes(e["header"], policy=policy.default)
            out.append({
                "uid": u,
                "from": _dh(h.get("From")),
                "subject": _dh(h.get("Subject")),
                "date": str(h.get("Date") or ""),
                "seen": "\\Seen" in e["flags"],
                "snippet": _snippet(e["body"]),
            })
        return out


def get_message(uid: int, folder: str = "INBOX") -> dict:
    with imap() as m:
        _select(m, folder)
        typ, data = m.uid("FETCH", str(uid), "(FLAGS BODY.PEEK[])")
        if typ != "OK":
            raise MailError("Mail alinamadi")
        e = _parse_fetch(data).get(uid)
        if not e or not e["body"]:
            raise LookupError("Mail bulunamadi")
    msg = message_from_bytes(e["body"], policy=policy.default)
    text_part = msg.get_body(preferencelist=("plain",))
    html_part = msg.get_body(preferencelist=("html",))
    text = text_part.get_content() if text_part else ""
    html = sanitize_html(html_part.get_content()) if html_part else ""
    attachments = []
    for i, p in enumerate(msg.iter_attachments()):
        attachments.append({
            "index": i,
            "filename": _dh(p.get_filename()) or f"ek-{i}",
            "content_type": p.get_content_type(),
            "size": len(p.get_payload(decode=True) or b""),
        })
    return {
        "uid": uid,
        "folder": folder,
        "message_id": str(msg.get("Message-ID") or ""),
        "from": _dh(msg.get("From")),
        "to": _dh(msg.get("To")),
        "cc": _dh(msg.get("Cc")),
        "subject": _dh(msg.get("Subject")),
        "date": str(msg.get("Date") or ""),
        "seen": "\\Seen" in e["flags"],
        "text": text,
        "html": html,
        "attachments": attachments,
    }


def mark_seen(uid: int, folder: str = "INBOX") -> None:
    with imap() as m:
        _select(m, folder, readonly=False)
        typ, _ = m.uid("STORE", str(uid), "+FLAGS", "(\\Seen)")
        if typ != "OK":
            raise MailError("Okundu isaretlenemedi")


def _sent_folder(m) -> str | None:
    try:
        typ, data = m.list()
    except Exception:
        return None
    names = []
    for raw in data or []:
        if not isinstance(raw, bytes):
            continue
        mt = _LIST_RE.match(raw)
        if not mt:
            continue
        name = mt.group("name").decode().strip().strip('"')
        names.append((utf7.decode(name), mt.group("flags").decode().lower()))
    for n, f in names:
        if "\\sent" in f:
            return n
    for want in ("Sent", "Sent Items", "Sent Messages", "Gonderilmis Ogeler", "INBOX.Sent"):
        for n, _ in names:
            if n.lower() == want.lower():
                return n
    return None


def send_message(to: list[str], cc: list[str], subject: str, body: str,
                 in_reply_to: str | None = None) -> dict:
    user = _cfg("MAIL_USER")
    msg = EmailMessage()
    msg["From"] = user
    msg["To"] = ", ".join(to)
    if cc:
        msg["Cc"] = ", ".join(cc)
    msg["Subject"] = subject
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=parseaddr(user)[1].split("@")[-1] or None)
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    msg.set_content(body)

    s = connect_smtp()
    try:
        s.send_message(msg, from_addr=user, to_addrs=to + cc)
    finally:
        try:
            s.quit()
        except Exception:
            pass

    saved = False
    try:
        with imap() as m:
            folder = _sent_folder(m)
            if folder:
                typ, _ = m.append(_q(folder), "(\\Seen)", imaplib.Time2Internaldate(time.time()),
                                  msg.as_bytes())
                saved = typ == "OK"
    except Exception:
        saved = False
    return {"sent": True, "saved_to_sent": saved, "message_id": msg["Message-ID"]}


def unseen_uids(folder: str = "INBOX") -> list[int]:
    with imap() as m:
        _select(m, folder)
        typ, data = m.uid("SEARCH", None, "UNSEEN")
        if typ != "OK":
            raise MailError("UNSEEN aramasi basarisiz")
        return sorted(int(x) for x in data[0].split())


def header_summary(uids: list[int], folder: str = "INBOX") -> list[dict]:
    if not uids:
        return []
    with imap() as m:
        _select(m, folder)
        typ, data = m.uid("FETCH", ",".join(map(str, uids)),
                          "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT)])")
        parsed = _parse_fetch(data) if typ == "OK" else {}
    out = []
    for u in uids:
        e = parsed.get(u)
        if not e:
            continue
        h = message_from_bytes(e["header"] or e["body"], policy=policy.default)
        out.append({"uid": u, "from": _dh(h.get("From")), "subject": _dh(h.get("Subject"))})
    return out
