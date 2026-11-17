# İş Akışı Kaydı (ilk sürüm 0.1)

Ofiste tarayıcıda elle, tekrar tekrar yapılan işleri bulur (ör. "her sipariş için pazaryeri
panelinden kopyalayıp WawiERP'ye yapıştırıyor"). Çıktı: WawiERP otomasyon kurallarına
(**Olay → Kural → Onay**) girdi olacak "otomasyon adayı" listesi ve tahmini kazanılacak süre.

Kişileri değerlendirmek için **değildir**. Kişi bazlı verim puanı üretmez; raporda kimin ne
yaptığı yoktur.

## Parçalar

| Klasör | Ne |
|---|---|
| `extension/` | Chrome/Edge eklentisi (Manifest V3). Simgede durum: **●** kayıt açık · **II** duraklatıldı · **?** onay yok |
| `server/` | Toplama sunucusu + analiz + rapor ekranı. Ek paket yok (Node 18+), veriler düz dosyada |
| `AYDINLATMA.md` | Çalışan aydınlatma metni ve onay beyanı **taslağı** (hukukçu onayı gerekir) |
| `test/e2e.py` | Uçtan uca deneme (eklentiyi gerçek Chromium'a yükler, iki sahte çalışanla dener) |

## Neler kaydedilir, neler asla kaydedilmez

Yalnız `server/config.json` içindeki **iş siteleri listesinde**:
sayfa türü (`/orders/:id`, numaralar silinir) ve süresi · tıklanan düğmenin yazısı
(bağlantılarda yalnız gidilen sayfa türü) · form gönderiminde alan **adları** · kopyala→yapıştırda
**hangi siteden hangi siteye / hangi alana** · indirme/yüklemede dosya **türü**.

**Asla:** şifre alanları, alan değerleri, yazılan metin/tuşlar, kopyalanan içerik, sayfa içeriği,
dosya adları, ekran görüntüsü. Liste dışı siteler yalnız "diğer" olarak süre sayılır, adres
tutulmaz. Gizli pencerede çalışmaz. Bu kurallar iki yerde uygulanır: eklentide ve sunucuda
(sunucu eklentiye güvenmez, izinsiz alanları atar).

Diğer güvenceler: onay verilmeden tek olay bile toplanmaz (sunucu da onaysız kimlikten veri
reddeder) · rastgele takma kimlik, ad/e-posta yok · ham olaylar **30 gün** sonra silinir, yalnız
kişisiz günlük toplamlar kalır · raporda en az **2 kişide** görülmeyen akış gösterilmez ·
çalışan kendi kayıtlarının tamamını görür ve tek tıkla siler.

## Yerelde deneme (5 dakika)

```bash
cd tools/isakisi
DEMO=1 node server/server.mjs
```

1. Chrome/Edge'de `chrome://extensions` → sağ üst **Geliştirici modu** → **Paketlenmemiş öğe yükle** → `tools/isakisi/extension` klasörünü seç.
2. Açılan bilgilendirme sayfasında kutuyu işaretle → **Onaylıyorum**. Simge kırmızı nokta olur.
3. Demo sitelerde birkaç kez aynı işi yap: `http://localhost:8788/orders` → sipariş aç → kopyala (Ctrl+C) → etiketi indir → `http://localhost:8789/siparis/yeni` → takip no alanına yapıştır → Kaydet.
4. Rapor: `http://localhost:8787/rapor`. Not: rapor en az 2 kişide görülen akışları gösterir; tek başına denerken `MIN_KISI=1 DEMO=1 node server/server.mjs` ile başlat.
5. Kendi kayıtların: eklenti simgesi → **Kaydedilen verilerimi gör**.

Otomatik deneme (Python + Playwright):

```bash
DEMO=1 DATA_DIR=/tmp/isakisi-test node server/server.mjs
```

```bash
python3 test/e2e.py /tmp/isakisi-test
```

Son çalıştırma (2026-11-17): 42 denetimin hepsi geçti — onaysız kayıt yok, duraklatınca kayıt
yok, yazılan ad/adres/şifre/takip no/dosya adı ham kayıtta yok, liste dışı site yalnız "diğer",
raporda takma kimlik yok, silme sonrası sunucu veriyi reddediyor; rapor 11 adımlık
pazaryeri→ERP zincirini ve kopyala-yapıştır akışını buldu.

## Detaylı panel (/panel)

Proje sorumlusu için ham kayıtları ve ayrıntılı analizleri (ısı haritası, günlük eğilim, site geçişleri, düğme/form/dosya/yapıştırma dökümü, süzülebilir kayıt tablosu, CSV) gösteren ayrı bir sayfadır. Adres: `/panel`.

- Açmak için `PANEL_USER` ve `PANEL_PASS` ortam değişkenlerini ayarla (rapor parolasından bağımsızdır). İkisi de ayarlı değilse `/panel` ve `/api/panel` kapalıdır (404).
- Ham kayıtları yalnız proje sorumlusu görmelidir; parolayı paylaşma. Takma kimlik hiçbir yerde gösterilmez; kayıtlar kişi yerine "oturum" numarasıyla okunur ve kişi bazlı puan/döküm yoktur.
- Analizlerde "en az 2 kişi" şartı uygulanmaz (tek kişilik veriyle de çalışır). Saat dilimi `PANEL_TZ` (varsayılan `Europe/Berlin`).
- Herkese açık özet `/rapor` değişmedi; panelden `/rapor`'a bağlantı var, tersi yok.

## Gerçek ofise kurulum ve onay süreci (sırayla)

1. **Hukuk/KVKK onayı:** `AYDINLATMA.md` taslağını hukuk danışmanı tamamlasın (hukuki sebep, sunucu yeri, irtibat kişisi). Almanya'daki işyerinde Betriebsrat varsa onun onayı **kurulumdan önce** alınır.
2. **Çalışanlara anlat:** kısa toplantı — amaç, neyin toplanmadığı, duraklat düğmesi, kendi verini görme, katılmamanın hiçbir sonucu olmadığı. Aydınlatma metnini dağıt.
3. **Yazılı onay:** yalnız onay beyanını imzalayanların bilgisayarına kurulur. Eklenti ilk açılışta ayrıca kendi onayını ister.
4. **İzin listesi:** `server/config.json` → `allowlist` içindeki adresleri şirketin gerçekten kullandığı panellerle karşılaştır.

### Adım A — Sunucuyu başlat (Railway önerilir)

**Railway (bulut, önerilen):**
1. Railway'de yeni proje → GitHub deposundan servis; **Root Directory** = `tools/isakisi`
   (ya da bu klasörde `railway up`). Başlatma komutu `package.json`'da (`npm start`).
2. **Bölge:** Europe West (Amsterdam). Aydınlatma metni buna göre yazıldı.
3. **Volume** ekle, bağlama yolu `/data`. (Olmazsa her yeniden başlatmada kayıtlar silinir.)
4. **Değişkenler:**

   | Değişken | Değer |
   |---|---|
   | `HOST` | `0.0.0.0` |
   | `DATA_DIR` | `/data` |
   | `REPORT_USER` / `REPORT_PASS` | rapor girişi (güçlü parola) |
   | `ENROLL_KEY` | uzun rastgele anahtar (ör. `openssl rand -hex 24`) |
   | `STORE_URL` | mağaza bağlantısı (Adım C'den sonra) |

5. **Networking → Generate Domain** → ör. `https://isakisi-production.up.railway.app`.
   `/rapor` parola soruyorsa sunucu hazırdır.

Ağa açık çalışırken rapor parolası ve kayıt anahtarı **zorunlu**dur; ikisi yoksa sunucu başlamaz.

**Ofiste bir bilgisayarda (alternatif):**

```bash
HOST=0.0.0.0 REPORT_USER=yonetici REPORT_PASS='guclu-parola' ENROLL_KEY='uzun-rastgele' node server/server.mjs
```

### Adım B — Eklentiyi bu adres ve anahtarla paketle

```bash
python3 scripts/paketle.py https://isakisi-production.up.railway.app <ENROLL_KEY>
```

Çıktı `dist/` altında: bir klasör (elle kurulum için) ve bir `.zip` (mağaza için). Paket
yalnız bu adrese ve yalnız bu anahtarla veri gönderebilir. Adres ya da anahtar değişirse
yeniden paketle ve mağazaya yeni sürüm yükle (`manifest.json` → `version` artır).

### Adım C — Tarayıcılara kur (birini seç)

| Yol | Ne zaman | Nasıl |
|---|---|---|
| **1. Elle (geliştirici modu)** | 2–5 kişi, kısa deneme | `dist/isakisi-eklenti-0.1.0` klasörünü bilgisayara kopyala → `chrome://extensions` (Edge: `edge://extensions`) → **Geliştirici modu** → **Paketlenmemiş öğe yükle** → klasörü seç. Chrome açılışta "geliştirici modu" uyarısı gösterir; güncelleme elle yapılır. |
| **2. Chrome Web Store, "liste dışı"** (önerilen) | Çoğu küçük ofis | [Chrome geliştirici panosu](https://chrome.google.com/webstore/devconsole)'nda hesap aç (bir kerelik 5 $), `.zip`'i yükle, görünürlüğü **Liste dışı (Unlisted)** seç. İncelemeden sonra (birkaç gün) çıkan bağlantıyı yalnız onay verenlere gönder → **Chrome'a ekle**. Edge'de de aynı bağlantı çalışır. Güncellemeler otomatik gelir. |
| **3. Şirket ilkesiyle zorunlu kurulum** | Bilgisayarlar domain'e bağlı / BT yönetiyor | BT, mağazadaki eklenti kimliğini `ExtensionInstallForcelist` ilkesine ekler; yalnız onay verenlerin iş profiline uygular. Sunucu adresi ilkeyle de verilebilir (`3rdparty → extensions → <kimlik> → server`); paketlenen adresle aynı olmalı. |

**Çalışana verilecek link:** `https://<sunucu-adresi>/kur` — sayfa neyin toplandığını anlatır, aydınlatma metnine bağlanır ve "Eklentiyi kur" düğmesiyle mağaza sayfasına götürür (`STORE_URL`).

Kurulumdan sonra çalışanın tarayıcısında bilgilendirme sayfası açılır; çalışan onay verince
simgede kırmızı nokta belirir. Onaysız hiçbir şey kaydedilmez.

5. **Süre sınırı:** 2–4 hafta kayıt yeterli. Sonra eklentiyi kaldır, raporu çalışanlarla paylaş, adayları WawiERP kurallarına çevir.

## Bilinen sınırlar (0.1)

- Takma kimliği bilen, o kişinin ham kayıtlarını görebilir; kimlik yalnız çalışanın eklentisinde durur ve sunucuya URL ile gitmez (`#` sonrası).
- Kopyalama tarayıcı dışından yapılırsa (Excel vb.) kaynak "dış uygulama" görünür.
- Süre tahminleri kaba: kopyala→yapıştır arası süre ve zincir süresinin %70'i "kazanılacak" sayılır.
- Sunucu tek süreç, düz dosya; birkaç ofis çalışanı için yeterli, büyük ölçek için veritabanına geçilmeli.
- Mağaza incelemesi Google'a bağlı; ilk yüklemede birkaç gün sürebilir.
