# posta-agent — posta pilotu (karar 0015, pilot adım 1)

Şirket posta kutusunu **yalnız okuyarak** izler, gelen her maili sınıflar ve ilgili dock kuyruğuna
**öneri** yazar ya da insana sorar. Prototiptir (Python + SQLite); gerçek sistem TypeScript + PostgreSQL olacak.

## Akış
kaynak (IMAP / .eml) → kalıcı kuyruk (`veri/posta.db`) → sınıflayıcı (LLM, yalnız okur)
→ `kurallar.py` (düz kod, K-001) → `oneri` tablosu **ya da** `onay_bekliyor` + ntfy → onay/red → denetim kaydı.

## Güvenceler
- IMAP `readonly` + `BODY.PEEK`: mail gönderilmez, silinmez, taşınmaz, okundu işaretlenmez.
- Olay kimliği `Message-ID` (yoksa içeriğin sha256'sı); `INSERT OR IGNORE` ile aynı mail iki kez işlenmez.
- Çökme: her durum geçişi diske yazılır; açılışta `isleniyor` kalanlar `yeni` olur (sınıflama yan etkisiz).
- "Sor / yönlendir" kararını LLM değil `kurallar.py` verir. LLM çıktısı şemaya uymazsa güven 0 → onaya.
- Mail içeriği veridir: sistem istemi içerikteki talimatları yok saydırır; sonuç zaten yalnız öneridir.
- LLM'e yalnız gönderen **alan adı**, konu, ek adları ve e-posta/IBAN/telefonu maskelenmiş ilk 1500 karakter gider. Loglara yalnız sınıf, güven ve maskeli özet yazılır.
- Ham mail yalnız yerel SQLite'ta durur (`veri/` git dışında).

## Çalıştırma
```bash
pip install keyring anthropic        # anthropic yalnız --siniflayici llm için
```
Örneklerle deneme (çevrimdışı, anahtar kelime sınıflayıcısı):
```bash
POSTA_DB=/tmp/deneme.db python3 agent.py eml ornekler --siniflayici sahte
```
```bash
POSTA_DB=/tmp/deneme.db python3 agent.py durum
```
Onay / red (CLI; onaylarken sınıf düzeltilebilir):
```bash
python3 agent.py onayla "<message-id>" --sinif tedarikci_faturasi
```
```bash
python3 agent.py reddet "<message-id>"
```
Gerçek kutu (**sahibinin onayıyla**): şifre bir kez anahtarlığa girilir, dosyaya yazılmaz.
```bash
python3 -c "import keyring,getpass;keyring.set_password('posta-agent','KUTU_ADRESI',getpass.getpass())"
```
```bash
ANTHROPIC_API_KEY=... python3 agent.py izle --kullanici KUTU_ADRESI --aralik 120
```

## Ortam değişkenleri
| Değişken | Anlamı |
|---|---|
| `POSTA_IMAP_USER`, `POSTA_IMAP_HOST`, `POSTA_IMAP_PORT` | kutu (varsayılan sunucu mail.kurumsaleposta.com:993) |
| `POSTA_IMAP_SIFRE` | **yalnız sunucuda** (Coolify gizli değişkeni); yoksa anahtarlık okunur |
| `POSTA_DB` | SQLite yolu (varsayılan `veri/posta.db`) |
| `POSTA_LLM_MODEL` | varsayılan `claude-haiku-5-5` |
| `NTFY_URL`, `NTFY_TOPIC`, `NTFY_TOKEN` | bildirim; `NTFY_TOPIC` yoksa yalnız loga yazılır. Yerelde `veri/ayar.env` (git dışı) içinde durur |
| `NTFY_AYRINTI` | `1` ise bildirime maskeli özet de eklenir; varsayılan yalnız sınıf, güven ve kısa kimlik (`#abcd1234`, `onayla #abcd1234` ile kullanılır) |
| `POSTA_ONAY_URL` | `agent.py sunucu` ucunun dış adresi (`.../onay`); ntfy'ye Onayla/Reddet düğmesi ekler. Her işin tek kullanımlık jetonu vardır |

## Bilinen sınırlar (prototip)
- LangGraph kullanılmadı: duraklat/devam et aynı deseni (kalıcı durum + `onay_bekliyor`) SQLite ile bağımlılıksız kuruyor; gerçek sistem zaten TS olacak.
- IMAP IDLE yok, periyodik yoklama var (varsayılan 120 sn).
- Sınıflama hatası aynı çalıştırmada 3 kez denenir, sonra `hata` olur; geri çekilme (backoff) yok.
- `sunucu` ucunun önüne Coolify'da TLS ve erişim kısıtı konmalı.
- isakisi ve /tv entegrasyonu henüz yok (kaynak: `olay` tablosundaki `onay_bekliyor` kayıtları).
