import json

from app import push
from tests.conftest import FakeIMAP, FakeSMTP


def test_yetki_gerekli(client):
    client.headers.pop("Authorization")
    assert client.get("/folders").status_code == 401
    client.headers["Authorization"] = "Bearer yanlis"
    assert client.get("/folders").status_code == 401


def test_klasorler(client):
    r = client.get("/folders").json()
    names = [f["name"] for f in r]
    assert names == ["INBOX", "Sent", "Gönderilen"]  # Noselect elendi, utf7 cozuldu


def test_liste(client):
    r = client.get("/messages", params={"limit": 10}).json()
    assert [m["uid"] for m in r] == [9, 5]
    assert r[0]["seen"] is False and r[1]["seen"] is True
    assert r[1]["from"].startswith("Ayşe")
    assert "Ikinci mail" in r[0]["snippet"]
    r = client.get("/messages", params={"before_uid": 9}).json()
    assert [m["uid"] for m in r] == [5]


def test_liste_peek_kullanir(client):
    client.get("/messages")
    fetches = [c for c in FakeIMAP.calls if c[0] == "FETCH"]
    assert fetches and all("BODY.PEEK" in c[2] and "BODY[" not in c[2] for c in fetches)


def test_detay_guvenli_html_ve_ek(client):
    r = client.get("/messages/5").json()
    assert "Selam dünya" in r["text"]
    assert "<script" not in r["html"] and "onclick" not in r["html"] and "javascript:" not in r["html"]
    assert "<p>Selam</p>" in r["html"]
    assert r["attachments"][0]["filename"] == "f.pdf"
    assert r["message_id"] == "<a1@x>"
    # okundu isaretlenmemeli
    assert not [c for c in FakeIMAP.calls if c[0] == "STORE"]
    assert all(c[2] is True for c in FakeIMAP.calls if c[0] == "select")


def test_detay_yok(client):
    assert client.get("/messages/777").status_code == 404


def test_seen(client):
    assert client.post("/messages/9/seen").json() == {"ok": True}
    assert FakeIMAP.store[9][1] == "\\Seen"


def test_gonder(client):
    r = client.post("/send", json={"to": ["a@x.com"], "cc": ["c@x.com"], "subject": "Konu",
                                   "body": "Govde", "in_reply_to": "<a1@x>"})
    assert r.status_code == 200 and r.json()["saved_to_sent"] is True
    msg, frm, to = FakeSMTP.sent[0]
    assert frm == "ben@example.com" and to == ["a@x.com", "c@x.com"]
    assert msg["In-Reply-To"] == "<a1@x>" and msg["Subject"] == "Konu"
    assert FakeIMAP.appended[0][0] == '"Sent"'


def test_gonder_alici_zorunlu(client):
    assert client.post("/send", json={"to": [], "subject": "x"}).status_code == 422


def test_push_kayit(client, tmp_path):
    t = "ExponentPushToken[abcdefghij]"
    assert client.post("/push/register", json={"expo_token": t}).json()["new"] is True
    assert client.post("/push/register", json={"expo_token": t}).json()["new"] is False
    assert json.loads((tmp_path / "tokens.json").read_text()) == [t]


def test_push_kontrol(client, monkeypatch):
    sent = []
    monkeypatch.setattr(push, "send_expo", lambda msgs: sent.extend(msgs) or [])
    push.register_token("ExponentPushToken[abcdefghij]")
    assert push.check_once() == 0          # ilk tur: sadece son UID kaydedilir
    assert push.get_last_uid() == 9
    assert push.check_once() == 0          # yeni yok
    FakeIMAP.store[12] = [FakeIMAP.store[9][0], ""]
    assert push.check_once() == 1
    assert sent[0]["data"]["uid"] == 12 and push.get_last_uid() == 12


def test_push_gecersiz_token_silinir(client, monkeypatch):
    push.register_token("ExponentPushToken[abcdefghij]")
    push.set_last_uid(1)
    monkeypatch.setattr(push, "send_expo", lambda msgs: [m["to"] for m in msgs])
    push.check_once()
    assert push.load_tokens() == []
