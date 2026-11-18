"""Sirket maili ara API'si (FastAPI)."""
import asyncio
import hmac
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from . import mailbox, push
from .config import env

bearer = HTTPBearer(auto_error=False)


def auth(cred: HTTPAuthorizationCredentials | None = Depends(bearer)) -> None:
    expected = env("API_TOKEN")
    if not expected:
        raise HTTPException(503, "API_TOKEN ayarlanmamis")
    if not cred or not hmac.compare_digest(cred.credentials, expected):
        raise HTTPException(401, "Yetkisiz", headers={"WWW-Authenticate": "Bearer"})


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = None
    if env("PUSH_POLL_ENABLED", "1") == "1":
        task = asyncio.create_task(push.poll_loop())
    yield
    if task:
        task.cancel()


app = FastAPI(title="Mail API", lifespan=lifespan, dependencies=[Depends(auth)])


def _guard(fn, *a, **kw):
    try:
        return fn(*a, **kw)
    except LookupError as e:
        raise HTTPException(404, str(e))
    except mailbox.MailError as e:
        raise HTTPException(502, str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"Mail sunucusu hatasi: {type(e).__name__}")


@app.get("/folders")
def folders():
    return _guard(mailbox.list_folders)


@app.get("/messages")
def messages(folder: str = "INBOX", limit: int = Query(30, ge=1, le=100),
             before_uid: int | None = Query(None, ge=1)):
    return _guard(mailbox.list_messages, folder, limit, before_uid)


@app.get("/messages/{uid}")
def message(uid: int, folder: str = "INBOX"):
    return _guard(mailbox.get_message, uid, folder)


@app.post("/messages/{uid}/seen")
def seen(uid: int, folder: str = "INBOX"):
    _guard(mailbox.mark_seen, uid, folder)
    return {"ok": True}


class SendBody(BaseModel):
    to: list[str] = Field(min_length=1)
    cc: list[str] = []
    subject: str = ""
    body: str = ""
    in_reply_to: str | None = None


@app.post("/send")
def send(b: SendBody):
    return _guard(mailbox.send_message, b.to, b.cc, b.subject, b.body, b.in_reply_to)


class PushBody(BaseModel):
    expo_token: str = Field(min_length=10)


@app.post("/push/register")
def push_register(b: PushBody):
    return {"ok": True, "new": push.register_token(b.expo_token)}
