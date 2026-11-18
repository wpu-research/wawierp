"""Expo push: token kaydi + yeni UNSEEN UID'leri izleyen arka plan gorevi."""
import asyncio
import json
import logging
import threading

import httpx

from . import mailbox
from .config import data_dir, env

log = logging.getLogger("push")
EXPO_URL = "https://exp.host/--/api/v2/push/send"
_lock = threading.Lock()


def _tokens_path():
    return data_dir() / "tokens.json"


def _state_path():
    return data_dir() / "push_state.json"


def _read(path, default):
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def load_tokens() -> list[str]:
    return _read(_tokens_path(), [])


def register_token(token: str) -> bool:
    with _lock:
        toks = load_tokens()
        if token in toks:
            return False
        toks.append(token)
        _tokens_path().write_text(json.dumps(toks))
        return True


def remove_tokens(bad: list[str]) -> None:
    with _lock:
        toks = [t for t in load_tokens() if t not in bad]
        _tokens_path().write_text(json.dumps(toks))


def get_last_uid() -> int | None:
    return _read(_state_path(), {}).get("last_uid")


def set_last_uid(uid: int) -> None:
    _state_path().write_text(json.dumps({"last_uid": uid}))


def send_expo(messages: list[dict]) -> list[str]:
    """Gonderir; gecersiz (DeviceNotRegistered) tokenlari dondurur."""
    r = httpx.post(EXPO_URL, json=messages, timeout=20,
                   headers={"Accept": "application/json"})
    r.raise_for_status()
    bad = []
    for msg, tk in zip(messages, r.json().get("data", [])):
        if tk.get("status") == "error" and tk.get("details", {}).get("error") == "DeviceNotRegistered":
            bad.append(msg["to"])
    return bad


def check_once() -> int:
    """Bir tur kontrol; gonderilen bildirim sayisini dondurur."""
    unseen = mailbox.unseen_uids("INBOX")
    last = get_last_uid()
    if last is None:
        # ilk calisma: mevcut okunmamislar icin bildirim yagdirma
        set_last_uid(max(unseen) if unseen else 0)
        return 0
    new = [u for u in unseen if u > last]
    if not new:
        return 0
    set_last_uid(max(new))
    tokens = load_tokens()
    if not tokens:
        return 0
    info = mailbox.header_summary(new[-3:])
    if len(new) > 3 or not info:
        title, body, uid = "Yeni mail", f"{len(new)} yeni mail", new[-1]
    else:
        i = info[-1]
        title, body, uid = i["from"] or "Yeni mail", i["subject"] or "(konu yok)", i["uid"]
        if len(new) > 1:
            body = f"{body} (+{len(new) - 1} mail daha)"
    msgs = [{"to": t, "title": title, "body": body, "sound": "default",
             "data": {"uid": uid, "folder": "INBOX"}} for t in tokens]
    bad = send_expo(msgs)
    if bad:
        remove_tokens(bad)
    return len(msgs)


async def poll_loop():
    interval = int(env("PUSH_POLL_SECONDS", "60"))
    while True:
        try:
            await asyncio.to_thread(check_once)
        except asyncio.CancelledError:
            raise
        except Exception as e:  # sunucu gecici hata verirse dongu olmesin
            log.warning("push kontrol hatasi: %s", e)
        await asyncio.sleep(interval)
