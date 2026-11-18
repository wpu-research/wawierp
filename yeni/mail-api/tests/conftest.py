import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import mailbox  # noqa: E402

RAW1 = (b"From: =?utf-8?q?Ay=C5=9Fe?= <ayse@example.com>\r\nTo: biz@example.com\r\n"
        b"Subject: Merhaba\r\nDate: Mon, 16 Nov 2026 10:00:00 +0300\r\nMessage-ID: <a1@x>\r\n"
        b"MIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=B\r\n\r\n"
        b"--B\r\nContent-Type: multipart/alternative; boundary=A\r\n\r\n"
        b"--A\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nSelam d\xc3\xbcnya\r\n"
        b"--A\r\nContent-Type: text/html; charset=utf-8\r\n\r\n"
        b"<p onclick=\"x()\">Selam</p><script>alert(1)</script><a href=\"javascript:bad()\">k</a>\r\n"
        b"--A--\r\n--B\r\nContent-Type: application/pdf; name=\"f.pdf\"\r\n"
        b"Content-Disposition: attachment; filename=\"f.pdf\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        b"JVBERi0=\r\n--B--\r\n")
RAW2 = (b"From: bob@example.com\r\nSubject: Ikinci\r\nDate: Tue, 17 Nov 2026 09:00:00 +0300\r\n"
        b"Content-Type: text/plain\r\n\r\nIkinci mail govdesi\r\n")


class FakeIMAP:
    """Gercek sunucuya baglanmayan IMAP taklidi."""
    store = {5: [RAW1, "\\Seen"], 9: [RAW2, ""]}
    calls: list = []
    appended: list = []

    def select(self, folder, readonly=False):
        FakeIMAP.calls.append(("select", folder, readonly))
        return "OK", [b"2"]

    def list(self):
        return "OK", [b'(\\HasNoChildren) "/" "INBOX"', b'(\\HasNoChildren \\Sent) "/" "Sent"',
                      b'(\\Noselect) "/" "Arsiv"', b'(\\HasNoChildren) "/" "G&APY-nderilen"']

    def uid(self, cmd, *args):
        FakeIMAP.calls.append((cmd,) + args)
        if cmd == "SEARCH":
            crit = args[1]
            uids = [u for u, (_, f) in self.store.items() if crit == "ALL" or "\\Seen" not in f]
            return "OK", [" ".join(map(str, uids)).encode()]
        if cmd == "FETCH":
            seq, what = args
            out = []
            for u in map(int, seq.split(",")):
                if u not in self.store:
                    continue
                raw, flags = self.store[u]
                if "HEADER.FIELDS" in what and "TEXT" in what:
                    head, _, body = raw.partition(b"\r\n\r\n")
                    out.append((f"1 (UID {u} FLAGS ({flags}) BODY[HEADER.FIELDS (FROM SUBJECT DATE)] {{{len(head)}}}".encode(), head))
                    out.append((b" BODY[TEXT]<0> {%d}" % len(body), body[:600]))
                    out.append(b")")
                elif "HEADER.FIELDS" in what:
                    head, _, _ = raw.partition(b"\r\n\r\n")
                    out.append((f"1 (UID {u} BODY[HEADER.FIELDS (FROM SUBJECT)] {{{len(head)}}}".encode(), head))
                    out.append(b")")
                else:
                    out.append((f"1 (UID {u} FLAGS ({flags}) BODY[] {{{len(raw)}}}".encode(), raw))
                    out.append(b")")
            return "OK", out
        if cmd == "STORE":
            u = int(args[0])
            self.store[u][1] = "\\Seen"
            return "OK", [b""]
        return "NO", []

    def append(self, folder, flags, date, data):
        FakeIMAP.appended.append((folder, data))
        return "OK", [b""]

    def logout(self):
        return "BYE", []


class FakeSMTP:
    sent: list = []

    def send_message(self, msg, from_addr=None, to_addrs=None):
        FakeSMTP.sent.append((msg, from_addr, to_addrs))

    def quit(self):
        pass


@pytest.fixture(autouse=True)
def env(monkeypatch, tmp_path):
    monkeypatch.setenv("API_TOKEN", "test-token")
    monkeypatch.setenv("MAIL_USER", "ben@example.com")
    monkeypatch.setenv("MAIL_PASSWORD", "x")
    monkeypatch.setenv("MAIL_HOST", "mail.invalid")
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    monkeypatch.setenv("PUSH_POLL_ENABLED", "0")
    FakeIMAP.store = {5: [RAW1, "\\Seen"], 9: [RAW2, ""]}
    FakeIMAP.calls, FakeIMAP.appended, FakeSMTP.sent = [], [], []
    monkeypatch.setattr(mailbox, "connect_imap", lambda: FakeIMAP())
    monkeypatch.setattr(mailbox, "connect_smtp", lambda: FakeSMTP())


@pytest.fixture
def client():
    from app.main import app
    with TestClient(app) as c:
        c.headers["Authorization"] = "Bearer test-token"
        yield c
