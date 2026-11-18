# Mail API (ara katman)

Barındırılan IMAP/SMTP posta kutusunu (mail.kurumsaleposta.com) mobil uygulamaya
basit bir REST API olarak açar ve yeni mail geldiğinde Expo push bildirimi yollar.

## Kurulum
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # değerleri doldur; .env depoya girmez
```

## Ortam değişkenleri
| Ad | Açıklama |
|---|---|
| `MAIL_HOST` | Örn. `mail.kurumsaleposta.com` |
| `MAIL_USER` / `MAIL_PASSWORD` | Posta kutusu bilgileri |
| `API_TOKEN` | Mobil uygulamanın kullanacağı Bearer anahtarı (uzun, rastgele) |
| `IMAP_PORT` (993), `SMTP_PORT` (465) | İsteğe bağlı |
| `SMTP_MODE` | `ssl` (varsayılan) veya `starttls` (587 yedek için) |
| `DATA_DIR` | `tokens.json` ve `push_state.json` konumu (varsayılan `./data`) |
| `PUSH_POLL_SECONDS` | UNSEEN kontrol aralığı (60) |
| `PUSH_POLL_ENABLED` | `0` ise arka plan push görevi kapanır |

Şifre ve anahtarlar yalnız ortam değişkeninde durur, hiçbir dosyaya yazılmaz.

## Çalıştırma
```bash
set -a; source .env; set +a
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Telefondan erişmek için `--host 0.0.0.0` şart; uygulamada API adresi
`http://<bilgisayarın-LAN-IP-si>:8000` olur. Etkileşimli belgeler: `/docs` (sağ üstteki Authorize ile token girilir).

## Uçlar (hepsi `Authorization: Bearer <API_TOKEN>`)
- `GET /folders`
- `GET /messages?folder=INBOX&limit=30&before_uid=`
- `GET /messages/{uid}?folder=` — metin, temizlenmiş html, ek listesi (`BODY.PEEK`, okundu işaretlemez)
- `POST /messages/{uid}/seen?folder=`
- `POST /send` — `{to[], cc[], subject, body, in_reply_to?}`; gönderince Sent klasörüne eklemeyi dener
- `POST /push/register` — `{expo_token}`

## Push
Arka plan görevi her 60 sn INBOX'taki UNSEEN UID'lere bakar; son görülen UID
`push_state.json`'da tutulur. İlk çalışmada mevcut okunmamışlar için bildirim yollanmaz.
Geçersiz token'lar Expo yanıtına göre `tokens.json`'dan silinir.

## Test
```bash
python -m pytest -q   # IMAP/SMTP taklit edilir, gerçek sunucuya bağlanılmaz
```

## Güvenlik notu
API düz HTTP ile açılırsa token ağda görünür. Dış erişimde TLS sonlandıran bir
ters vekil (Caddy/nginx) arkasında çalıştırın.

## Bilinen sınırlar
Ek indirme ucu yok (yalnız liste); tek kullanıcı/tek posta kutusu; sayfalama UID tabanlıdır.
