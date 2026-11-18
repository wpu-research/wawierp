"""IMAP degistirilmis UTF-7 (klasor adlari icin)."""
import base64
import re


def decode(s: str) -> str:
    def repl(m: re.Match) -> str:
        t = m.group(1)
        if t == "":
            return "&"
        b = t.replace(",", "/")
        b += "=" * (-len(b) % 4)
        return base64.b64decode(b).decode("utf-16-be")

    return re.sub(r"&([^-]*)-", repl, s)


def encode(s: str) -> str:
    out, buf = [], ""

    def flush():
        nonlocal buf
        if buf:
            b = base64.b64encode(buf.encode("utf-16-be")).decode().rstrip("=")
            out.append("&" + b.replace("/", ",") + "-")
            buf = ""

    for ch in s:
        if 0x20 <= ord(ch) <= 0x7E:
            flush()
            out.append("&-" if ch == "&" else ch)
        else:
            buf += ch
    flush()
    return "".join(out)
