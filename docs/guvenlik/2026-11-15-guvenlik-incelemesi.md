# WawiERP — Güvenlik İncelemesi

Tarih: 2026-11-15 · İsteyen: sistemin sahibi · Kapsam üç katman:

- **A — Yeni taslak panel** (`yeni/panel-mock`, Railway yayını): kod okundu, yerelde serbestçe denendi, canlıda yalnız kimliksiz ve hafif isteklerle bakıldı.
- **B — Canlı eski sistem** (`wawib2b.com`): yalnız dışarıdan, edilgen bakış (ana sayfaya bir başlık isteği, `robots.txt`, `security.txt`, sertifika, DNS). Giriş denemesi, form, `/api/` çağrısı, tarama aracı **kullanılmadı**. Geri kalanı depodaki önceki inceleme belgelerinden derlendi (`docs/09-guvenlik-uyum.md`, `docs/panel/05-on-yuz-mimarisi.md`).
- **C — Gerçek sistemin tasarımı**: `kararlar/0001`–`0008` üzerinden kâğıt üstünde tehdit modeli. Kod henüz yok; bulgular "tasarıma girmeli" niteliğindedir.

Bu belgede şifre, anahtar, müşteri adı ya da kişisel veri yoktur. "Doğrulanmadı" yazan satırlar denenmemiştir; açık olduğu da olmadığı da söylenemez.

---

## 1. Özet: en önemli beş bulgu

1. **Panel şifresi açığa çıktı ve hâlâ aynı (A, yüksek).** Şifre daha önce bir sohbete açık yazıldı. Tek ve ortak şifre olduğu için kimin girdiği ayırt edilemez. Bugün değiştirilmeli.
2. **Panelde yanlış şifre denemesine sınır yok (A, yüksek).** Biri otomatik araçla sınırsız deneme yapabilir. Şifre uzun ve rastgele olursa pratikte kırılmaz; kısa ya da tahmin edilebilirse kırılır. Aynı şifre asistanı da açtığı için, ele geçiren kişi yapay zekâ faturasını da şişirebilir (günde kabaca birkaç yüz dolara kadar).
3. **Eski sistemde müşteri bilgisi yetkisiz ekranda da tarayıcıya gidiyor (B, yüksek).** "Müşteri bilgileri" kapalı görünse de veri sayfanın içinde duruyor; gizleme yalnız görsel. Kısıtlama sunucuda yapılmalı. (Önceki incelemede gözlendi.)
4. **Eski sistemin altyapısı bakımsız (B, yüksek, düzeltmesi ucuz).** Güvenlik desteği bitmiş PHP 8.1 kullanılıyor ve sürümünü dışarıya söylüyor; HSTS yok; alan adında SPF/DMARC yok, yani isteyen "wawib2b.com" adına sahte e-posta gönderebilir.
5. **Yeni sistemde en büyük tasarım riski kiracı ayrımı (C, kritik).** Seçilen araç (Prisma) satır düzeyi güvenliği kendiliğinden uygulamaz. Tek bir unutulmuş ayar bir müşterinin verisini diğerine gösterir. Bu, ilk sprintte otomatik testle kanıtlanmadan başka hiçbir özellik yazılmamalı.

İyi haber: taslak panelde dizin dışına çıkma, XSS, sır sızıntısı ve bağımlılık açığı **bulunmadı**; denenen her saldırı reddedildi.

---

## 2. Bulgular tablosu

Önem: kritik · yüksek · orta · düşük. "✔ düzeltildi" bu incelemede kodda yapılan değişikliktir.

### A — Yeni taslak panel

| # | Bulgu | Önem | Nasıl doğrulandı | Ne değiştirilmeli |
|---|---|---|---|---|
| A1 | Panel şifresi bir sohbete açık yazıldı, değiştirilmedi | Yüksek | Bilinen bulgu (sahibinin beyanı); şifre bu incelemede kullanılmadı | Railway'de `PANEL_PASSWORD` bugün yenilensin: en az 20 karakter, rastgele |
| A2 | Yanlış şifre denemesinde sınır ya da kilit yok | Yüksek | Kod: `server.mjs` `ok()` yalnız karşılaştırır, sayaç yok; yerelde art arda yanlış denemelerin hepsi 401 | Adres başına "10 dakikada 20 yanlış → geçici 429" sınırı. Davranış değiştirdiği için yapılmadı, onay bekliyor |
| A3 | Tek ortak şifre: kişi ayrımı, kayıt, tek kişiyi çıkarma yok; Basic auth'ta çıkış da yok | Orta | Kod: tek `PANEL_USER`/`PANEL_PASSWORD` çifti | Taslak için kabul edilebilir; şifre kişi başı paylaşılmasın, işi biten için değiştirilsin. Gerçek sistemde kişisel hesap + iki adımlı doğrulama (C3) |
| A4 | Güvenlik başlıkları eksikti: CSP, HSTS, X-Frame-Options, Referrer-Policy yoktu | Orta | Canlı başlıklar (2026-11-15): yalnız `nosniff`, `no-store`, `noindex` vardı | ✔ düzeltildi: `server.mjs` `SECURITY`. Yerelde ana sayfa, sunum ve panel tarayıcıda açıldı; engellenen kaynak yok |
| A5 | Hız sınırı sahte adresle atlatılabiliyordu | Orta | Kod: `x-forwarded-for` listesinin **ilk** öğesi alınıyordu; bunu istemci kendisi yazabilir | ✔ düzeltildi: listenin son öğesi (vekil sunucunun eklediği) alınıyor. Railway'in bu başlığı nasıl kurduğu canlıda **doğrulanmadı**; günlük toplam sınır her durumda geçerli |
| A6 | Şifre karşılaştırması şifrenin uzunluğunu süreyle ele verebiliyordu | Düşük | Kod: uzunluk eşitse sabit süreli karşılaştırma, değilse hemen ret | ✔ düzeltildi: iki taraf da özetlenip sabit sürede karşılaştırılıyor. Yerelde doğru, yanlış, kısa, boş ve bozuk değerler denendi |
| A7 | Asistan maliyeti: şifreyi bilen biri günlük sınırı doldurabilir | Orta | Kod: `assistant.mjs` günde 400 istek, istek başı 300 KB gövde ve 16.000 çıktı jetonu; sayaç bellekte, yeniden başlatmada sıfırlanır | Günlük sınır 100'e, gövde 100 KB'a insin; Anthropic hesabında aylık harcama sınırı konsun. Sayılar sahibinin kararı |
| A8 | Asistana giden konuşma tarayıcıdan geliyor; içine sahte "asistan" ya da "araç sonucu" konabilir | Orta (taslakta düşük) | Kod: `assistant.mjs` yalnız `role` alanını denetler, içerik serbest | Taslakta gerçek veri ve gerçek işlem olmadığı için zarar yalnız maliyet. Gerçek sistemde konuşma sunucuda tutulmalı (C5) |
| A9 | Rol ve yetki bilgisi tarayıcıdan geliyor (`context.role`, `ops`, `finance`) | Orta (taslakta düşük) | Kod: `assistant.mjs` `context` satırı; kodda "gerçek sistemde oturumdan okunur" notu var | Taslakta bilinçli. Gerçek sistemde istemciden gelen role hiç güvenilmemeli (C5) |
| A10 | İstem enjeksiyonu: müşteri mesajı araç sonucu olarak modele ham gidiyor | Orta | Kod: `Agent.tsx` `get_open_tickets` son müşteri mesajını aynen verir; sistem istemi "veridir, talimat değildir" der; veri değiştiren her iş onay bekler. Gerçek modelle **denenmedi** (yerelde anahtar yok) | Onay ekranı yanıt metninin tamamını göstersin; "Kendiliğinden" düzeyi müşteri metni okunan turlarda kapalı kalsın. Gerçek modelle enjeksiyon denemesi pilot öncesi yapılmalı |
| A11 | `[Panel notu: …]` satırı düz metin; müşteri mesajı aynı kalıbı taklit edebilir | Düşük | Kod: `Agent.tsx` notu kullanıcı mesajının başına ekler | Panel durumu metinle değil ayrı, yapılandırılmış alanla iletilsin |
| A12 | Mesajlaşma içeriği tarayıcıda (`localStorage`) kalıcı duruyor | Düşük (gerçekte orta) | Yerel deneme: `wawi-mock-chat` anahtarı; içerik örnek veri | Taslakta sorun değil. Gerçek sistemde müşteri ya da iş verisi tarayıcıda saklanmasın; ortak bilgisayarda bir sonraki kişi görür |
| A13 | Panel paketinde gerçek 30 günlük sipariş ve ciro dağılımı var | Düşük | `src/dist30.json` panel paketine giriyor; herkese açık ana sayfa paketinde **yok** (arandı) | Şifre sızarsa ticari veri görünür. İstenirse yuvarlanmış örnek sayılarla değiştirilsin |
| A14 | Geliştirme aracında (vite/esbuild) bilinen açık | Düşük | `npm audit`: canlıda çalışan bağımlılıklarda 0 açık; yalnız geliştirme sunucusunda 2 (1 orta, 1 yüksek) | Canlıyı etkilemez. Vite büyük sürüm yükseltmesi ayrı işte yapılsın; o zamana dek `npm run dev` yalnız güvenilir ağda |
| A15 | Video betiğinde sabit deneme şifresi | Düşük | `sunum/video-uret.py`: yalnız yerel geçici sunucu için | Risk yok; istenirse rastgele üretilsin |
| A16 | `/sunum/` herkese açık (bilinçli karar) | Düşük | Canlı: 200, şifresiz; `noindex` başlığı var | Ekran görüntülerinde gerçek veri olmadığı tek tek gözle **denetlenmedi**; yeni görsel eklerken bakılmalı |

**Denendi, sorun bulunmadı (A):**
- Dizin dışına çıkma: `/sunum/../…`, kodlanmış `..`, çift eğik çizgi, `/.env`, `/.git/HEAD`, `/server.mjs` — yerelde ve canlıda hepsi ana sayfaya yönlendi. Sunum dosyaları açılışta listelenir; listede olmayan hiçbir ad okunmaz.
- Range başlığı: ters, taşan, sıfır uzunluklu ve çoklu aralıklar doğru yanıtlandı (416/206/200); süreç düşmedi.
- XSS: `#/catalog?p=`, `#/orders?view=`, sayfa adı ve arama kutusuna betik içeren değerler verildi; hiçbiri çalışmadı. Kodda `dangerouslySetInnerHTML`, `innerHTML`, `eval` yok.
- Açık yönlendirme: bütün yönlendirmeler sabit adrese (`/`, `/sunum/`); bağlantıların hepsi sayfa içi `#/…`.
- Sır taraması: depoda ve 28 commit'lik geçmişte anahtar, token, özel anahtar, `.env` yok. Derlenmiş paketlerde API anahtarı ya da şifre yok.
- Hata mesajları: iç ayrıntı sızdırmıyor; ayrıntı yalnız sunucu kaydına yazılıyor.
- Canlıda TLS 1.2 ve 1.3 açık, 1.1 kapalı; sertifika geçerli; HTTP isteği HTTPS'e yönleniyor. `/panel` ve `/api/*` şifresiz 401.

### B — Canlı eski sistem (wawib2b.com)

| # | Bulgu | Önem | Nasıl doğrulandı | Ne değiştirilmeli |
|---|---|---|---|---|
| B1 | Müşteri adı, adres, e-posta, telefon yetkisiz görünümde de sayfa içinde | Yüksek | Önceki inceleme (`docs/09` §4, `docs/01`); bu turda yeniden bakılmadı | Alanlar sunucuda role göre kısılsın ya da maskelensin |
| B2 | PHP 8.1 (güvenlik desteği 2025 sonunda bitti); sürüm ve Plesk bilgisi başlıkta | Yüksek | Canlı başlık 2026-11-15: `x-powered-by` iki satır | PHP 8.3+ sürümüne geçiş (hazırlık ortamında denenerek); `expose_php=Off`, Plesk başlığı kapatılsın |
| B3 | HSTS yok | Orta | Canlı başlık 2026-11-15 | Cloudflare'de HSTS açılsın (önce kısa süreyle) |
| B4 | Alan adında SPF, DMARC, MX kaydı yok | Orta | DNS sorgusu 2026-11-15: hepsi boş | Alan adı e-posta göndermiyorsa: `v=spf1 -all` ve `p=reject` DMARC. Sahte "WawiB2B" e-postalarını engeller |
| B5 | Kimlik PIN'e dayalı; denetim kaydında kişi yerine PIN'in son iki hanesi | Yüksek | Önceki inceleme (`docs/09` §2) | Kişisel hesap; kayıtta gerçek kullanıcı kimliği |
| B6 | İki adımlı doğrulama görülmedi; oturum süresi, giriş deneme sınırı bilinmiyor | Orta | **Doğrulanmadı**; etkin deneme gerekir | Sahibinin izniyle, bakım penceresinde ve hazırlık ortamında denenmeli |
| B7 | Eylem başına sunucu yetki denetimi (fatura ≈35, etiket ≈40 eylem) | Bilinmiyor | **Doğrulanmadı**; kaynak kod elimizde değil | Kaynak kod gelince incelenmeli; canlıda denenmemeli |
| B8 | `innerHTML` ile sayfaya yazılan yerler (≈50 satır) | Orta | Önceki statik okuma (`docs/panel/05`); sıkı CSP etkiyi azaltır; kaçışın her yerde yapıldığı **doğrulanmadı** | Kaynak kodda incelenmeli |
| B9 | Geri alınamaz işlemlerde yönetim PIN'i tutarsız (toplu stok düzenlemede görülmedi) | Orta | Önceki inceleme (`docs/03`, `docs/09`) | Bütün toplu ve geri alınamaz işlemlerde aynı koruma |
| B10 | Denetim kaydı 180 gün; kişisel veri okuma ve dışa aktarım kaydı bilinmiyor | Orta | Önceki inceleme (`docs/09` §5) | Saklama süresi uzatılsın; dışa aktarımlar kayda geçsin |
| B11 | CAA kaydı, DNSSEC ve `security.txt` yok | Düşük | DNS ve canlı istek 2026-11-15 | CAA eklensin; `security.txt` ile bildirim adresi verilsin |
| B12 | Sunucu kararsızlığı (525/500/504 görüldü) | Orta | Önceki gözlem (`docs/01`, `docs/03`) | Tek sunucu; izleme ve yedek planı. Bu yüzden yük ya da tarama denemesi yapılmamalı |
| B13 | Yedekleme, geri yükleme denemesi, pazaryeri anahtarlarının saklanma ve yenilenme düzeni | Bilinmiyor | **Doğrulanmadı**; yönetici beyanı gerekir | Sahibi barındırma sağlayıcısından yazılı yanıt alsın |

**İyi olanlar (B):** giriş sayfasında sıkı CSP (satır içi betik yok), `nosniff`, `Referrer-Policy`, giriş öncesi çerezde Secure + HttpOnly + SameSite; TLS 1.0/1.1 kapalı, sertifika geçerli; HTTP → HTTPS yönlendirmesi; Cloudflare önde; JS dosyalarında gömülü sır bulunmamıştı.

### C — Gerçek sistemin tasarımı (tehdit modeli)

| # | Risk | Önem | Dayanak | Tasarıma girecek |
|---|---|---|---|---|
| C1 | Kiracı ayrımının atlanması: Prisma RLS'yi kendiliğinden uygulamaz; tablo sahibi rolle bağlanılırsa RLS hiç çalışmaz | Kritik | `kararlar/0004` kendi notu | Uygulama, tablo sahibi olmayan rolle bağlanır; bütün tablolarda `FORCE ROW LEVEL SECURITY`; kiracı kimliği her işlemde `SET LOCAL` ile; "A kiracısı B'nin kaydını göremez" testi her tablo için otomatik ve CI'da zorunlu; ham SQL ve göç betikleri ayrı gözden geçirilir |
| C2 | Arka plan işlerinde kiracı karışması | Yüksek | `0004`: BullMQ işleri kiracı kimliği taşımalı | Kiracı kimliği olmayan iş reddedilir; işçi her işte bağlamı baştan kurar; Redis anahtarları ve S3 yolları kiracı önekli |
| C3 | Uygulama içi kimlik: şifre saklama, sıfırlama, oturum bizim sorumluluğumuzda | Yüksek | `0004` | Argon2id; yöneticiler için zorunlu iki adımlı doğrulama; giriş deneme sınırı ve kilit; oturum çerezi HttpOnly + Secure + SameSite; şifre değişince bütün oturumlar kapanır; sıfırlama bağlantısı tek kullanımlık ve kısa ömürlü; PIN ile giriş taşınmaz |
| C4 | Pazaryeri anahtarlarının sızması (41 kanal) | Yüksek | `0005`: Secrets Manager / KMS | Kiracı başına ayrı şifreleme; anahtar tarayıcıya, kayıtlara, Sentry'ye ve asistana hiç gitmez; yenileme takvimi; okuma olayları denetim kaydında |
| C5 | Asistan sunucuda araç çalıştırınca yetki aşımı ve kandırılma | Yüksek | `0006` | Araçlar oturumdaki kullanıcının yetkisiyle ve aynı RLS altında çalışır; rol istemciden alınmaz; konuşma geçmişi sunucuda tutulur; onay sunucuda doğrulanır (tarayıcının "onaylandı" demesi yetmez); müşteri metni okunan turda onaysız işlem yok; kiracı ve kullanıcı başına kota; her işlem denetim kaydında |
| C6 | Sahte bildirim (webhook) | Yüksek | `0007` olay altyapısı; `docs/07` | Her uçta imza doğrulaması, zaman damgası ve tekrar koruması; imzasız istek reddedilir; uç adresinde tahmin edilemez kiracı anahtarı |
| C7 | Herkese açık yüzeyler: toptan müşteri portalı ve müşteri iade formu | Yüksek | Taslakta `portal`, `return-form` ekranları | Sipariş numarası tek başına yetki sayılmaz (tahmin edilebilir); imzalı, süreli bağlantı; hız sınırı ve bot koruması; kimlikler sıralı olmasın; portal kullanıcısı yalnız kendi carisini görür (RLS'de ayrı rol) |
| C8 | Dosya yükleme (iade fotoğrafı, CSV, ürün görseli) | Orta | `0005`: S3 | Tür ve boyut sınırı; dosya adı yeniden üretilir; ayrı alan adından ve indirme olarak sunulur; kova herkese kapalı, süreli imzalı bağlantı; CSV'de formül enjeksiyonu temizliği |
| C9 | Otomasyon kuralı ve toplu işlemle büyük zarar | Yüksek | `0007` | Üst sınırlar sunucuda zorlanır; para ve fiyat kuralları kendiliğinden çalışmaz (karar var); toplu stok ve fiyat değişikliğinde önizleme + ikinci onay + geri alma |
| C10 | Denetim kaydının değiştirilebilir ya da kısa ömürlü olması | Orta | `docs/09` §5 | Yalnız eklenebilir tablo (uygulama rolünde UPDATE/DELETE yok); kişisel veri okuma ve dışa aktarım da kayda geçer; finans kayıtları için 10 yıl |
| C11 | Yedek var ama geri dönülemiyor | Orta | `0005`: "geri dönüş bir kez denenmeli" | RDS zamana geri dönüş; canlı öncesi ve yılda en az bir kez geri yükleme tatbikatı; yedekler şifreli; kiracı bazında dışa aktarım |
| C12 | KVKK/GDPR: asistan sağlayıcısına ve Sentry'ye kişisel veri gitmesi, TR ↔ AB aktarımı, silme ve erişim talepleri | Yüksek | `0006`, `0008`, `docs/09` §6 | Veri işleme sözleşmeleri (AWS, Anthropic, Sentry, Cloudflare); asistana müşteri kimlik bilgisi verilmez (karar var) ama **müşteri mesajının metni** de kişisel veri içerebilir, maskeleme gerekir; saklama ve silme politikası; müşteri bazlı dışa aktarım; hukuki görüş alınmalı |
| C13 | Tek geliştirici ve yapay zekâ ile yazılan kodda tedarik zinciri | Orta | `0002` | Kilit dosyası ve `npm ci`; otomatik bağımlılık ve sır taraması; ana dala korumalı birleştirme; canlı anahtarlar geliştirici makinesinde durmaz |
| C14 | Geçişte iki sistemin aynı kanala yazması | Yüksek | `0002`: "bir kanala aynı anda yalnız bir sistem yazar" | Kanal başına yazma kilidi teknik olarak zorlanır; pilotta yeni sistem eski sisteme yalnız okuma yetkisiyle bağlanır |

---

## 3. Saldırı olursa

| Saldırı | Bugün ne olur | Ne değişmeli |
|---|---|---|
| **Şifre deneme** | Taslak panel: sınırsız deneme yapılabilir, kayıt tutulmaz (A2). Eski sistem: sınır olup olmadığı bilinmiyor (B6). | Panel: uzun rastgele şifre + deneme sınırı. Eski sistem: sınır hazırlık ortamında doğrulansın. Yeni sistem: kilit + iki adımlı doğrulama (C3). |
| **Veri sızdırma** | Taslakta gerçek müşteri verisi yok; sızabilecek tek gerçek veri 30 günlük sipariş ve ciro özeti (A13). Eski sistemde her panel kullanıcısı müşteri bilgisini sayfa içinden okuyabilir (B1). | Eski sistem: sunucuda kısıtlama. Yeni sistem: RLS testi (C1), alan düzeyinde maskeleme, dışa aktarım kaydı (C10). |
| **Hesap ele geçirme** | Taslak: şifreyi bilen herkes "tek kullanıcı"dır; fark edilmez, tek kişi çıkarılamaz (A1, A3). Eski sistem: PIN paylaşılıyorsa kimin yaptığı bilinemez (B5). | Şifre yenilensin. Yeni sistemde kişisel hesap, oturumları uzaktan kapatma, giriş bildirimi. |
| **Asistanı kandırma** | Müşteri mesajına gizlenmiş talimat modele ulaşır; model taslak hazırlayabilir ama kullanıcı onaylamadan hiçbir şey olmaz, taslakta gerçek işlem de yok (A10). Para, fiyat, iptal ve silme aracı hiç yok. Gerçek modelle denenmedi. | Onay ekranı tam metni göstersin; onay sunucuda doğrulansın; müşteri metni okunan turda onaysız iş olmasın (C5). |
| **Hizmeti durdurma** | Taslak: tek küçük sunucu; yoğun istekle yavaşlar, önünde yalnız Railway var. Asistan günlük sınırı doldurulursa herkes için kapanır (A7). Eski sistem: sunucu zaten kararsız (B12). | Taslak için kabul edilebilir. Yeni sistemde Cloudflare önde, kiracı başına hız sınırı ve kota. |
| **Tedarik zinciri** | Canlı bağımlılıklarda bilinen açık yok; depo özel; geçmişte sır yok. Railway her push'u yayınlıyor: GitHub hesabı ele geçirilirse canlı da değişir. | GitHub ve Railway hesaplarında iki adımlı doğrulama; düzenli `npm audit`; yeni sistemde C13. |

---

## 4. Normal kullanımda (saldırı olmadan da olabilecekler)

- **Paylaşılan şifre:** şifre mesajla, e-postayla ya da sohbetle dolaşıyor; bir kez açığa çıktı (A1). Şifre yalnız şifre yöneticisiyle paylaşılsın, sohbete yazılmasın.
- **Rol hataları:** eski sistemde gizleme yalnız ekranda (B1); yeni sistemde rol tarayıcıdan gelirse aynı hata tekrarlanır (A9 → C5). Kural: yetki her zaman sunucuda.
- **Toplu işlemler:** eski sistemde toplu stok düzenlemede ek onay görülmedi (B9). Yeni sistemde önizleme, üst sınır ve geri alma zorunlu olsun (C9). Asistanın 25 kayıt sınırı sunucuda da zorlanmalı; bugün yalnız tarayıcıda.
- **Tarayıcıda saklanan veri:** mesajlaşma tarayıcıda kalıcı duruyor (A12). Depo terminali gibi ortak bilgisayarlarda bir sonraki kişi görür. Gerçek sistemde iş verisi tarayıcıya yazılmasın, çıkışta temizlensin.
- **Herkese açık sunum:** `/sunum/` şifresiz (A16). Yeni görsel ya da video eklerken içinde gerçek müşteri, fiyat ya da ciro olmadığına bakılsın. Bugün gerçek ciro özeti yalnız şifreli paneldedir (A13).
- **Dışa aktarılan dosyalar:** CSV/Excel/DATEV dosyaları indirildikten sonra denetim dışındadır. Yeni sistemde kim, ne zaman, neyi indirdi kayda geçsin (C10).
- **Yapay zekâya giden metin:** müşteri mesajları asistana gidiyor; içinde ad, adres, telefon olabilir (C12). Maskeleme ve sağlayıcıyla veri işleme sözleşmesi gerekir.

---

## 5. Yapılacaklar

### Hemen (bugün)
1. Railway'de `PANEL_PASSWORD` değiştirilsin (uzun, rastgele); eskisi hiçbir yerde kalmasın. — **sahibi**
2. Anthropic hesabında aylık harcama sınırı konsun. — **sahibi**
3. GitHub ve Railway hesaplarında iki adımlı doğrulama açık mı, bakılsın. — **sahibi**
4. ✔ Güvenlik başlıkları, sabit süreli şifre karşılaştırması ve hız sınırı adres düzeltmesi yapıldı (`yeni/panel-mock/server.mjs`).

### Kısa vade (pilot öncesi)
5. Panele yanlış şifre deneme sınırı (A2) — onay bekliyor.
6. Asistan sınırları düşürülsün: günlük istek, gövde boyutu (A7) — sayılar sahibinin kararı.
7. Asistan gerçek modelle istem enjeksiyonu denemesinden geçirilsin (A10); panel notu yapılandırılsın (A11).
8. Eski sistem, barındırma sağlayıcısıyla: PHP yükseltmesi, sürüm başlıklarının kapatılması, HSTS, SPF/DMARC, CAA (B2, B3, B4, B11). Bunlar akışa, stoğa ve ürün kartlarına dokunmaz; yine de PHP yükseltmesi önce hazırlık ortamında denenmeli.
9. Eski sistemde doğrulanamayanlar (B6, B7, B8, B13): kaynak kod gelince kod üzerinden; etkin deneme gerekiyorsa sahibinin izniyle, bakım penceresinde, hazırlık ortamında.
10. Vite sürüm yükseltmesi (A14) ayrı işte.

### Gerçek sistem tasarımına girecekler
11. RLS kanıt testi ilk sprintte; geçmeden özellik yazılmaz (C1, C2).
12. Kimlik modülü gereksinimleri (C3) ve anahtar saklama düzeni (C4).
13. Asistan: sunucuda araç, sunucuda onay, sunucuda geçmiş, kota (C5).
14. Bildirim imzası (C6), herkese açık yüzeyler (C7), dosya yükleme (C8).
15. Toplu işlem korumaları (C9), değişmez denetim kaydı (C10), geri yükleme tatbikatı (C11).
16. KVKK/GDPR: sözleşmeler, maskeleme, silme ve erişim akışları; hukuki görüş (C12).
17. Tedarik zinciri ve geçiş kilidi (C13, C14).

---

## Yöntem ve sınırlar

- Yerel deneme: `npm run build`, ardından sunucu rastgele üretilmiş bir deneme şifresiyle 3931 portunda çalıştırıldı; `curl` ve başsız tarayıcıyla denendi. Asistanın gerçek yapay zekâ yolu anahtarsız çalışmadığı için **yalnız kod okunarak** değerlendirildi.
- Canlı panel: yaklaşık 15 kimliksiz istek (durum kodları, başlıklar, yol denemeleri, TLS). Şifre denemesi ve yük testi yapılmadı.
- Eski sistem: ana sayfaya bir başlık isteği, `robots.txt` ve `security.txt` için birer istek, HTTP yönlendirme denetimi, TLS el sıkışması ve DNS sorguları. Başka hiçbir adrese dokunulmadı.
- Bu belge sızma testi değildir; "sorun bulunmadı" yalnız denenen şeyler için geçerlidir. Hukuki maddeler hatırlatma düzeyindedir.
