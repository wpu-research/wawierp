# WawiERP — Satış Kanalları Ekranları (Yeniden Tasarım Belgesi)

Tarih: 2026-11-14 · Kaynak: canlı panel (https://wawib2b.com), sistem yöneticisi oturumu. Yalnız okuma: sayfalar GET adresleriyle açıldı, hiçbir düğmeye basılmadı, form gönderilmedi. Gördüğümü yazdım; tahminler "tahmin" diye işaretli. Müşteri kişisel verisi, tekil sipariş numarası, satıcı numarası, anahtar/token bu belgeye alınmadı.

## Özet

- Kanal mantığı tek zincirle kurulu: **şirket → depo → kanal → hesap**. Adreste dört kimlik birlikte taşınır (`company=…&warehouse=…&channel=…&account=…`). Hesap kimlikleri küresel (ör. account 14 Lady Empire Kaufland, 26 Woida Kaufland, 28 Parfymonline Shopify, 30 OTTO Technowelt). eBay işçi listelerinde `account=0` kullanılıyor (hesap yerine kanal kimliği belirleyici, tahmin).
- Kanallar iki sınıfa ayrılıyor: (a) **genel `company-home`** görünümü (düz sipariş + ürün listesi; OTTO ve Amazon için kendi sekmeleri var) ve (b) **kanala özel sayfalar** (`ebay-pool`, `send-ebay`, `send-kaufland`, `metro`, `shopify-pool`, `send-shopify`, `ozon-pool`, `send-ozon`, `tr-market`, `tr-market-products`, `mixoutlet-payments`). Her kanal için ayrı JS dosyası ve ayrı `/api/*.php` ucu var (ör. `kaufland-publications.php`, `metro.php`, `woida-amazon.php`). Aynı iş (havuz, filtre, gönder, stok güncelle, durum kontrol) her kanalda ayrı kodla yeniden yazılmış.
- İlan yaşam döngüsü her kanalda aynı iskeleti izliyor: **Wawi ürün havuzu → (eksik bilgi tamamla) → önizle → onayla ve gönder → durum kontrol → aktif / sorunlu → stok-fiyat güncelle → acil kaldır**. Her gönderim ayrı bir önizleme ve onay adımı gerektiriyor; "yalnız kaydet" ile "pazaryerine gönder" ayrı düğmeler.
- Stok kaynağı fiziki / drop / sanal ayrımıyla tutuluyor; filtre grubu her ekranda aynı ("Tümü, Fiziki stok, Drop stok, Sanal stok, Stoksuz, Stok bilgisi belirsiz"). Sanal stok yalnız web mağazaları (Shopify) için; pazaryerlerinde kullanılmıyor. eBay gönderiminde stok kaynağı seçilebiliyor: Otomatik (Fiziki → Drop) / depo Fiziki / depo Drop.
- Fiyat ve adet hesap bazında ayrı kayıt: eBay'de "Wawi fiyatı" ile "eBay fiyatı" ayrı, Kaufland'da gönderim penceresinde brüt fiyat / adet / hazırlama süresi / depo / kargo grubu / durum / KDV girilir, Shopify'da "Wawi önerisi" adet ve fiyat gösterilir.
- Çok sayıda liste ekranı sayfa açılınca boş açılıp JS ile yükleniyor; Kaufland, Amazon, OTTO siparişleri, Shopify ve kanal işçi listelerinde 10 saniye sonra bile "yükleniyor" kaldı; Kaufland ürün listesinde istemci zaman aşımı mesajı çıktı.
- Çözümlenemeyen/sorunlu noktalar: METRO adresindeki `account=` parametresi yok sayılıyor (sayfa `account=0` ile açılıyor, hesap seçimi boş kalıyor); N11 tutarında "Para birimi alınamadı"; işlem geçmişinde ham kod değerleri (`auto_stock_policy`, `publish`, `withdraw`).

## Kanal karşılaştırma tablosu

| Kanal | Kendi sayfası / genel | Sekme / görünümler | Sipariş çekme | Ürün gönderme | Stok / fiyat güncelleme | İade | Sorun listesi |
|---|---|---|---|---|---|---|---|
| eBay | Kendi: `ebay-pool` (havuz) + `send-ebay` (gönder); siparişler `orders-ebay`; ayrıca `company-home` | `send-ebay`: catalog=ebay (salt okunur ilan havuzu), catalog=products (Wawi havuzu → gönder); durum filtresi: Aktif, Stok 0, Belirsiz, Kapanmış, Bekleyen, Kontrol gerekli | Sipariş sayfası `orders-ebay` (bu kapsam dışı); `send-ebay` içinde "eBay siparişleri" bağlantısı | Seçilenleri gönder, eBay'de taslak kaydet, ilan ayarları (durum Yeni/Kullanılmış...), kategori seçimi ve ürün bilgisi tamamlama pencereleri | Satırda "Stoğu güncelle", "Wawi fiyatını düzenle", toplu "Stokları güncelle", "Toplu fiyat güncelle"; otomatik stok politikası geçmişte görülüyor | Bu sayfalarda görünmedi | `channel-worklist` (issues/images/history); ebay-pool durum süzgeci |
| Kaufland | Kendi: `send-kaufland` | catalog=kaufland (havuz), products (Wawi → Kaufland), issues (sorunlu) | `company-home` genel sipariş görünümü; hesap kartında "Sipariş alımı: Çalışıyor" (arka plan işi) ve `orders-kaufland` | "Teklifi hazırla", "Kaufland'a gönder", "Kaydet ve ürün bilgilerini Kaufland'a gönder", "Durumu kontrol et" (üç adım: kategori ve bilgi → durum → teklif) | "Kaydet ve Kaufland'da güncelle"; Lady Empire hesabında "Stok / fiyat otomasyonu: Çalışıyor" | Görünmedi | `catalog=issues` ve `channel-worklist` |
| METRO | Kendi: `metro` | view=pool, send, failed, orders, overview, messages, categories | `metro?view=orders`: "otomatik senkron 10 dakikada bir", "Sipariş listesini yenile" | `view=send`: "Metro'ya gönder · otomatik tamamla", "Teklif bilgilerini düzenle", "Ürün bilgilerini düzenle", en fazla 25 ürün | Teklif bilgisi düzenleme; stok güncellemesi aynı SKU'nun tüm Metro pazarlarını etkiler | Görünmedi | `view=failed` ("Gitmeyen ürünler") |
| OTTO | Genel `company-home` (kanala özel sekme takımı) | otto_tab: products, source ("Ürün gönder / güncelle"), issues, images, eans, orders, returns, history | `otto_tab=orders` (yüklenmedi) | "Düzenle / gönder", "Otto'ya gönder / An Otto senden", "Taslağı kaydet" | "Stok gönder" satır düğmesi, "Kontrol et" | `otto_tab=returns` sekmesi var | `otto_tab=issues`, `images`, `eans` |
| Amazon | Genel `company-home` + `woida-amazon.php` ucu (Woida'ya özel adlı) | amazon_tab: products, listings, orders, issues, safety (Ürün güvenliği), history | `company-home&view=orders` (düz liste) veya `amazon_tab=orders` | "ASIN'leri kontrol et", "Seçilenleri aktar", "Amazon'da önizle", "Onayla ve Amazon'a gönder" | Fiziki stok ve depo fiyatı üzerinden teklif (üstteki sayaçlar: Aktarıma hazır, Teklif açılmış, Eşleşme / onay sorunu, Depo fiyatı eksik) | Görünmedi | `amazon_tab=issues`, `safety` |
| Shopify | Kendi: `shopify-pool` + `send-shopify`; siparişler `company-home&view=orders` | Havuz ("Ürün havuzu"), "Ürün gönder / güncelle", Siparişler, Ticketlar | `company-home&view=orders` (bağlantı) | 3 adım: ürün/varyant seç → canlı önizleme → onayla; yeni ürün varsayılan taslak | "Stok güncelle", "Shopify fiyatı" (en fazla 20 seçim) | Bu sayfada yok | Havuzda durum süzgeci (aktif, pasif, bağlı değil, bilinmiyor) |
| Ozon | Kendi: `ozon-pool` + `send-ozon` | Havuz, "Wawi ürün havuzundan gönder" | Bu sayfalarda yok | "Ozon'a gönder / güncelle", başlık ve açıklama Rusçaya çevirme, "Kaydet ve kontrol et" | "Stoğu Ozon'a gönder", platform satış stoğu filtresi | Yok | Durum süzgeci: Hatalı, İncelemede vb. |
| Trendyol | Kendi: `tr-market` + `tr-market-products` | tab: orders, questions, actions (aktarım geçmişi), history, dashboard; ürünler: catalog=products / platform | `tr-market&tab=orders`: "Siparişleri güncelle", son okuma zamanı gösterilir | "Seçileni aktarım dosyasına al" (dosya mantığı, doğrudan yayın değil, tahmin) | "Fiyatı değiştir", "Stok güncelle / aç", "Acil satıştan kaldır" (önizle + onayla) | Siparişte "İade" durumu var | Ürün durumu süzgeci: İnceleme gereken, Kaynakta bulunamadı |
| N11 | Kendi: `tr-market&platform=n11` | tab: products, orders, actions, dashboard (Trendyol'dan daha az: soru ve geçmiş yok) | "N11'den güncelle" | `platform=n11&tab=products` (açılmadı) | Siparişte "Önizle · henüz gönderme" / "Onayla ve N11'e gönder" penceresi | Siparişte "İade" durumu | Görünmedi |
| Mixoutlet / Mollie | Kendi: `mixoutlet-payments` | Tek liste (ödemeler) | Ödeme kayıtları Shopify'dan geliyor | Yok | Yok | Tahsilat / iade sütunu | Ödeme durumu süzgeci |

## Ekranlar

Her ekran adresi, önce alanlar. Tüm ekranlarda üst bölüm aynı "Depo ağı › Depo › Şirketler › Şirket › Kanal" ekmek kırıntısı ve sol menüde kanal/hesap listesi.

### company-home (genel kanal görünümü) — view=orders ve view=products

Adres: `/?page=company-home&company=1&warehouse=2&channel=7&view=orders`. Amaç: seçili şirketin satış kanallarını (çok seçimli) ve seçili kanalın siparişlerini veya ürünlerini göstermek.

- Parametreler: `company`, `warehouse`, `channel`, `view` (products, stock, orders, customers, source), `stock_kind` (all ve diğerleri), `company_channel_q`, `company_channel_page`, `company_channel_page_size` (20 / 50), `channels[]` (çok seçim), `channel_order_q`, `channel_order_payment`, `channel_order_page`.
- Üst kısım: şirket kartı (JTL bağlantısı, atanan depo, ürün verisi kaynağı "JTL-Wawi ürün verisi", kanal ürünü sayısı, "Şirket bilgilerini düzenle"). Altında "Şirkete atanan satış kanalları" listesi: Lady Empire GmbH için 13 kanal (Shopify ×3, JTL-Shop, eBay ×2, Amazon ×2, JTL-Wawi, XML-Import, Dealclub, Kaufland, METRO). Her kanal kartında: ad, tür, bağlantı açıklaması, "Katalog" durumu, "Sipariş" durumu, ürün kaydı, satış stoku, yüklenen sipariş, satılan adet, satış tutarı. Kanal bazlı örnekler: Mixoutlet.de Shopify 65.692 ürün kaydı / 4.794.164 satış stoku; Metro.de Lady Empire 707 ürün / 75.848 stok.
- Durum etiketleri kanal kartında: "Bağlı · henüz sipariş yok", "JTL sipariş kaynağı", "Ürün kataloğu bağlı", "Satış stoku N belirsiz" (stok sayımı bilinmiyor).
- Sekme çubuğu: Ürünler, Stoklar, Siparişler, Müşteriler (sayaçlı) ve "JTL-Wawi ürün verisi" bağlantısı (`view=source`).
- view=orders: Amazon kanalı için 64 sipariş, 64 müşteri, 144 adet, 3.778,55 EUR; kâr/zarar kutusu "Maliyet, komisyon, kargo ve iade verisi bekleniyor" (yani hesaplanmıyor). Süzgeç: arama, ödeme (Tüm ödemeler, Ödendi, Kartla ödendi, Tüm havaleler, Havaleyle ödendi, Banka havalesi bekleniyor, Ödeme bekleniyor, İade edildi, Kısmen iade edildi, Kısmen ödendi, Ödeme iptal edildi, Ödeme başarısız). Düğmeler: "↻ Siparişleri yenile", "Ara", satırda "Not / Sorun ekle". Her satır: kanal, firma, sipariş no, müşteri kimliği (anonimleştirilmiş kısaltma), ülke, ürün satırları, adet, tutar, açılır "Müşteri bilgileri" (ad, adres, e-posta, telefon; aynı sayfada açık metin olarak DOM'da duruyor).
- view=products: "Ürün havuzu 0 ürün" (Amazon / channel 7'de boş). Süzgeç: ürün ara, "Wawi stok türü" (Tümü, Fiziki, Drop, Sanal, Stoksuz, Belirsiz). Not: "Sanal stok filtresi web mağazalarının tedarik kapasitesini gösterir (fiziki en fazla 1, drop yok); pazaryerlerinde sanal adet kullanılmaz." Eylem: "Ürün kataloğunu senkronize et" formu: `erp_action=sync_sales_listings` (gizli alanlar: `company_channel_id`, `return_page`, `return_warehouse`, `return_company`, `return_channel`, `return_view`) ve gizli bir pencerede "Kaydet ve platformda güncelle", "Sonucu kontrol et".
- Bağlantılar: `overview`, `warehouse-home`, `companies`, aynı sayfanın view=stock / customers / source varyantları.
- Dikkat: kanal listesi 13 kartı her görünümde tekrar yüklüyor; asıl içerik sayfanın altında.

### company-home — OTTO varyantı

Adres: `/?page=company-home&company=2291&warehouse=2882&channel=10283&account=30&view=products&otto_tab=products`. Başlık "TECHNOWELT · OTTO · ALMANYA", üstte "Otto Partner Portal ↗".

- Sekmeler (`otto_tab`): products ("Ürün havuzu"), source ("Ürün gönder / güncelle"), issues ("Sorunlu Ürünler"), images ("Resimsiz ürünler"), eans ("EAN'sız ürünler"), orders ("Siparişler", `view=orders`), returns ("İadeler"), history ("İşlem geçmişi").
- Ürün havuzu: arama (Ara / Suchen, Temizle / Zurücksetzen — TR ve DE karışık etiket), durum süzgeci: Tümü, Satışta, "Otto onayı bekliyor", Reddedildi; kategori ağacı kenar çubuğu (Tümü 687; en büyük kategoriler Orientteppich 136, Teppich 120, Designteppich 108, Tonerkartusche 84).
- Tablo sütunları: ÜRÜN, FİYAT, STOK, DURUM, İŞLEM. Satır: başlık, SKU, EAN (bazılarında "—"), kategori, "Rakip fiyatlar" (eBay, Kaufland, Metro, Otto dış bağlantıları; "Okunan fiyatlar 24 saatte bir güncellenir"). Durum değerleri: "Henüz doğrulanmadı", "Kısıtlı", "Reddedildi". İşlem düğmeleri: "Düzenle / gönder", "Kontrol et", "Stok gönder", "Fiyat ayrıntıları". Düzenleme penceresi: "Taslağı kaydet / Entwurf speichern", "Otto'ya gönder / An Otto senden", "Sonucu kontrol et / Ergebnis prüfen".
- Sorunlu ürünler sekmesi: 19 kayıt; örnek durumlar "Kısıtlı", "Reddedildi"; resim galeri sayacı ("Galeri (7)").
- Siparişler, İşlem geçmişi, Ürün gönder sekmeleri: sayfa açıldı, "Yükleniyor…" durumunda kaldı (siparişlerde süzgeç: Tümü, Hazırlanacak, Gönderildi, İptal).
- Formlar: yalnız GET arama; `erp_action` yok, eylemler JS ile `/api/` üzerinden çağrılıyor (tahmin).

### company-home — Amazon varyantı

Adres: `/?page=company-home&company=1196&warehouse=2&channel=10282&view=products&amazon_tab=products`. Başlık "Woida UG · Almanya deposu".

- Sekmeler (`amazon_tab`): products ("Fiziki ürünler"), listings ("Amazon teklifleri", pazar seçimi DE · Amazon.de), orders, issues ("Sorunlu ürünler"), safety ("Ürün güvenliği"), history ("İşlem geçmişi"). Haritadaki `source` değeri bu sayfada görünmedi; `listings` ve `safety` ek olarak çıktı.
- Üst sayaç düğmeleri (süzgeç): "Fiziki stok · EAN'lı", "Aktarıma hazır", "Teklif açılmış", "Eşleşme / onay sorunu", "Depo fiyatı eksik". Düğmeler: "Sayfayı seç", "ASIN'leri kontrol et", "Seçilenleri aktar", ilan penceresinde "Amazon'da önizle", "Onayla ve Amazon'a gönder", "Kapat".
- Veri `GET /api/woida-amazon.php?...&tab=physical&filter=total` ucuyla geliyor; 10+ saniye sonra bile "Ürünler yükleniyor…" kaldı, sayaçlar "—".
- Uç adı "woida-amazon" (şirkete adlı); Lady Empire Amazon kanalı (channel 7) bu sekmeleri kullanmıyor, düz `company-home` görünümüyle açılıyor (tahmin: Amazon kanalının tek "gelişmiş" uygulaması Woida için yazılmış).

### ebay-pool

Adres: `/?page=ebay-pool` (varsayılan `warehouse=0&channel=6`, yani 3DPLady). Amaç: seçili eBay hesabındaki **tüm ilanlar** (ERP ürünüyle eşleşmeyenler dahil) ve Wawi eşleşmesi.

- Parametreler: `warehouse`, `channel`, `q`, `stock_kind`, `tag`, `ean`, `brand`, `model`, `groups[]` (perfume, toner, electronics, other), `categories[]`, `ebay_status` (boş, active, out_of_stock, ended, scheduled), `p` (sayfa, 25 / sayfa).
- Üst: depo seçimi (Istanbul, Almanya, Hollanda, Mega B, Technowelt), eBay hesabı seçimi (eBay Lady Empire, eBay 3DPLady, eBay.de Ivobuyshop, Kaufplus, Perasshop, Technowelt, Woida; 8 hesap), "Aktif ilan kontrolü: <zaman>", "Kapanmış ilanların son kontrolü: Alınmadı". Düğmeler: "eBay ilanlarını yenile", "Eksik kategorileri eBay'den tamamla" (açıklama: "eBay'deki gerçek kategori okunur. İlan yayınlanmaz; fiyat ve stok değişmez"; 1091 ilanın kategorisi eksik), "Bu kayıttan sonra durdur" (toplu işlem durdurma, tahmin).
- Sayaç: 1091 ilan / varyant, 44 sayfa.
- Satır içeriği: başlık, "Stok 0 · satışa kapalı", "ERP eşleşmesi var", ilan no, "İlanın kaynağı: Wawi yayın kaydı yok", eBay SKU, Wawi SKU, eBay EAN / GTIN, Wawi EAN 1 / EAN 2, marka/model, eBay kategorisi ("Alınmadı"), hesap, Wawi fiziki stok, Wawi drop stok, "Web mağazası sanal stok", eBay stok, eBay fiyatı, "21 toplam − 21 satılan · kalan 0", eBay yayın tarihi, stok deposu.
- Satır işlemleri: "Stoğu güncelle" (hangi stok değişsin: Yalnız platform / Fiziki + eBay / Drop + eBay; "Fiziki / drop seçilmedikçe depo sayımı değişmez. Diğer pazaryerlerine gönderilmez"), "İşlem durumunu kontrol et", "Ürün ismini eBay'de güncelle", "Acil satıştan kaldır", "Wawi fiyatını düzenle", "Kaydet", "Not / Sorun ekle", "Kaydet ve platformda güncelle", "Sonucu kontrol et".
- Bağlantılar: `ebay-pool&warehouse=…&channel=…` kombinasyonları, `send-ebay&company=1&source=0`, "Ortak ürün havuzu →" (`warehouse`).
- `erp_action` yok; eylemler JS ile çağrılıyor (tahmin: `/api/`).

### send-ebay

Adres: `/?page=send-ebay&company=1196&catalog=ebay` ve `&catalog=products`. Amaç: eBay mağazasına ürün göndermek veya mevcut ilanları görmek.

- Parametreler: `company`, `catalog` (ebay, products), `source` (hangi havuz: seçili hesabın eBay ilanları, Tüm ürün havuzu, Amazon / Dealclub / eBay hesapları ürün sayılarıyla), `source_warehouses[]`, `ebay_status`, `q`, `tag`, `category`, `stock`, `sort`, `ean`, `brand`, `model`, `min`, `max`, `p`.
- Üst adımlar: "1 Gönderilecek eBay mağazası" (Woida), "2 Ürün kaynağı"; eBay hesabı "eBay.de · Woida" (mağaza kodu woida_shop); "Kaynak depolar".
- **catalog=ebay** ("eBay ilan havuzu · aktif / kapanmış", "Salt okunur eBay havuzu"): 315 ilan/varyant (Woida); durum sayaçları: Aktif 182, Stok 0 · satışa kapalı 26, Durumu belirsiz 19, Kapanmış 77, Kontrol gerekli 11; 13 sayfa. Satır: eBay SKU, Wawi SKU (WAWI-5075-… biçimli otomatik SKU'lar), EAN, ilan no, durum, "ERP ürünüyle eşleşti / eşleşmedi · ilan yine de gösteriliyor", eBay kategori yolu, "Ürün eşleşmesi gerekli", fiyat. "Bu görünüm ilanları değiştirmez."
- **catalog=products** ("Tüm ürün havuzu", 219.647 ürün, 25 / sayfa, 8786 sayfa): görselli ürünler önce. Toplu işlem çubuğu: "0 ürün seçildi", "Seçilenleri gönder", "Stokları güncelle", "Seçilenleri kaldır". Satır: görsel, SKU, EAN, kategori, "Ürün bilgileri / düzenle", stok türü rozeti ("Fiziki stok"), fiyat, "Gönder", rakip fiyatlar, "İlan ayarları · fiyat / adet sınırı", "Fiyatları düzenle · mağazalar / Wawi". Eksik veri için ürün kartı başına açılan pencereler:
  - "Ürünün kategorisini seçin" ve ürün adından eBay kategorisi önerisi (ürün giriş sihirbazında: "eBay kategorisi · değiştirilebilir / Ürün adından önerilecek / sonra seç", alanlar `ebay_category_id`, `ebay_category_query`, düğme "eBay kategorisini öner / değiştir"; "Toner ve parfüm adlarında kategori otomatik önerilir. Parfüm türü belirsizse Kadın / Erkek / Unisex").
  - "Eksik ürün bilgilerini tamamla" (marka, model vb.).
  - "Stok miktarını tamamla": "Miktar seçilen depoya yeni stok değeri olarak kaydedilir; mevcut miktara eklenmez"; kaydedilecek stok türü Fiziki / Drop; "Sorumlu çalışan" seçimi zorunlu görünüyor.
  - İlan ayarı seçenekleri: durum (Yeni · varsayılan, Yeni — diğer, Kullanılmış — çok iyi, Kullanılmış — iyi, Parça / çalışmıyor); stok kaynağı (Otomatik · Fiziki → Drop; Almanya Warehouse · Fiziki; Almanya Warehouse · Drop).
  - İlan tasarım önizlemesi ("WOIDA Classic · Lacivert / beyaz"; "Yalnız önizleme; eBay'de ilan oluşturulmaz. Gönderimde aynı HTML kullanılır").
  - Gönderim çalışma alanı: "Hedef mağaza", "Gönderilecek ürünler — fiyat ve adetleri kontrol edip gönderin", "Onayla ve uygula", "Vazgeç".
- Genel düğmeler: "İlanları yenile", "Toplu fiyat güncelle" (`bulk-prices` bağlantısı), "Son gönderimler".
- Bağlantılar: `orders-ebay&order_channel=5075`, `warehouse-product&product=…` (ürün kartı), `bulk-prices`.

### send-kaufland

Adres: `/?page=send-kaufland&company=1196&warehouse=2&channel=5332&account=26&catalog=kaufland` (catalog: kaufland, products, issues). Veri `GET /api/kaufland-publications.php?action=accounts|products&…` ucundan; sayfa iskeleti hemen geliyor, liste sonradan.

- Üst: "Hedef hesap" (örn. "Woida · Kaufland Connect · Almanya Warehouse"), "Hesap işleyişi · son kayıt": "Sipariş alımı: Çalışıyor <zaman>"; Lady Empire hesabında ayrıca "Ürün havuzu aktarımı: Çalışıyor" ve "Stok / fiyat otomasyonu: Çalışıyor" (üç arka plan işi görünür).
- Sekmeler: "Kaufland ürün havuzu" (catalog=kaufland, "Seçili mağazanın Kaufland ilanları"), "Wawi ürün havuzu / Kaufland'a gönder" (catalog=products), "Sorunlu Ürünler" (catalog=issues).
- Süzgeçler: "Kaufland · İlan durumu" (Tümü, Kaufland'da olanlar, Aktif ilanlar, Aktif ilanı olmayanlar, Kapalı / pasif ilanlar, Kaufland'da olmayanlar), ürün ara, kategori, "Hedef depo fiziki stoğu" (Tümü, Stok var, Stok yok, Stok bilinmiyor), sıralama (Standart, isim, stok, fiyat), etiket (Parfüm, Saatler, Toner, Mürekkep, Kozmetik, Oda kokusu, Takı, Elektronik, Giyim), "Filtreler +" ile EAN / marka / model / fiyat aralığı.
- Sorunlu Ürünler: "Sorun türü": Tüm sorunlar, Eksik / reddedilen bilgi, Kaufland onayı bekleniyor, Satış engeli; açıklama: sebep, yapılacak işlem ve son kontrol zamanı gösterilir, "Uyarıları yenile" düğmesi.
- Ürün işlemleri penceresi (üç adım metni): "1. Kategori ve ürün bilgileri → Kaydet ve Kaufland'a gönder. 2. Durumu kontrol et. 3. Ürün hazır olduğunda fiyat / adet ile teklifi hazırla. Yalnız 'Ürüne kaydet' pazaryerine göndermez. Kaydettiğiniz bilgiler Wawi ürün kartına da işlenir. Stok miktarı değişmez." Kırmızı alan zorunlu, mavi opsiyonel; GPSR iletişimi için e-posta veya HTTPS adresi yeterli. Teklif alanları: Brüt satış fiyatı · EUR (`price`), Satış miktarı (`amount`), Hazırlama süresi · iş günü (`handling_time`), Kaufland deposu (`id_warehouse`), Kargo grubu (`id_shipping_group`), Ürün durumu (`condition`: Yeni, Kullanılmış yeni gibi/çok iyi/iyi/kabul edilebilir), KDV (`vat_indicator`: 19%, 7%).
- Düğmeler: "Kaufland'a gönder", "Kayıtlı kaynaklarda eksikleri ara", "Doğrulanmış boş alanları ürüne kaydet", "Ürüne kaydet", "Kaydet ve ürün bilgilerini Kaufland'a gönder", "Kaydet ve Kaufland'da güncelle", "Durumu kontrol et", "Teklifi hazırla".
- Hata durumu: products ve issues görünümlerinde liste 10+ sn "Ürünler yükleniyor…" kaldı; products'ta uyarı: "Yanıt gecikti. Gönderim yaptıysanız tekrar göndermeden durumunu kontrol edin." (gönderimin sonucu istemcide bilinmeyebilir).
- Haritadaki `/?page=send-kaufland` (hesap parametresiz) sol menüde de var; hesap seçimi sayfada yapılıyor.

### metro (orders, pool, send, failed)

Adres: `/?page=metro&view=orders&account=25`. `view` değerleri: orders, pool, send, failed, overview, messages, categories. Tüm görünümler aynı iskelette; üstte "Hedef Metro hesabı / firma" seçimi ve "Devam etmek için hedef hesabı seçin." mesajı.

- Hesap seçimi sorunu: adres `account=25` taşıdığı halde sayfa `GET /api/metro.php?action=catalog&account=0` ile açıldı; hesap açılır listesinde yalnız "Hesap / firma seçin" seçeneği var (5 sn sonra da). Hesap seçmeden hiçbir liste (sipariş, havuz) açılmıyor. Yani URL ile derin bağlantı çalışmıyor; seçim istemcide (`metro-account-selection.js`) yapılıyor (tahmin).
- orders: "Wawi'ye alınmış Metro siparişleri · otomatik senkron 10 dakikada bir. Listeyi görüntülemek stok düşmez veya sipariş durumunu değiştirmez. Tüm saatler UTC." Süzgeç: ödeme, başlangıç/bitiş tarihi, sıralama (En yeni, En eski, Ürün A–Z/Z–A, Tutar). Düğmeler: "Sipariş listesini yenile", "Diğer işlemler", "Faturalar ve toplu belgeler", "Tüm durumlarda ara".
- pool ("Metro ürün havuzu"): alt sekmeler Canlı teklifler, Onaylı ürünler, Reddedilen ürünler, Ürün yüklemeleri, Pazarlar; teklif durumu süzgeci: Tüm durumlar, Aktif teklifler, Kaldırılmış, Duraklatılmış, Pasif, Henüz teklif yok, ayrıca "Metro'da olanlar", "Aktif ilanı olmayanlar". Not: "Metro miktarları kanal stoğudur. Wawi'ye çekim fiziksel depo stoğunu değiştirmez." "Son gönderim işlemleri" bölümü.
- send ("Wawi ürün havuzu / Metro'ya gönder"): "Sayfadaki ürünleri seç", "N ürün seçildi", "Metro'ya gönder · otomatik tamamla", "Teklif bilgilerini düzenle", "Ürün bilgilerini düzenle". "En fazla 25 ürün · otomatik gönderim her ürünün sonucunu ayrı gösterir." "Yeni üründe ürün verisini hazırlayın; Metro onayından sonra teklif gönderin. Net fiyat ve stok ayrıca doğrulanır. Stok güncellemesi aynı SKU'nun tüm Metro pazarlarını etkiler." (METRO'da önce ürün verisi onayı, sonra teklif: iki aşamalı.)
- failed ("Gitmeyen ürünler"): hesap seçilmeden yalnız iskelet ve "Son gönderim işlemleri" görüldü; içerik görülemedi.
- Formlar GET; `erp_action` yok.
- Metro için ayrı CSS/JS paketi var (`metro-orders.js`, `metro-publication-wizard.js`, `metro-publication-batch.js`, `metro.js`).

### shopify-pool / send-shopify

Adres: `/?page=shopify-pool&company=1196&warehouse=2&channel=10281&account=28` ve `send-shopify` aynı parametrelerle. Başlık "Parfymonline.de · Shopify" (mağaza adı), alt başlık "WOIDA-DE / DE-WH · Hesap 28", rozet "Yerel ürün verileri".

- Ortak bağlantı çubuğu: "Shopify ürün havuzu" ↔ "Ürün gönder / güncelle", "Siparişler" (→ `company-home&view=orders`), "Ticketlar" (→ `tickets&platform=shopify`). Sayaçlar "—" kaldı.
- Parametreler: `q`, `sources[]` (physical, asterbuy, bueroarena, b2buhren, watchimport, drop, uncounted, zero), `ean_status` (all, present, missing), `listing` (listed, active, not_active, inactive, unlisted), `tag`, `statuses[]` (active, inactive, unlinked, unknown), `sort`, `page_size` (25 / 50), `p`.
- Ürün kaynağı seçenekleri: Tümü, Fiziki ürünler, Drop · Asterbuy, Drop · BueroArena / Kosatec, Drop · B2BUhren, Drop · Watchimport. EAN: Tümü, EAN olanlar, EAN olmayanlar.
- **shopify-pool** sütunları: Ürün, Fiziki stok, Fiyat, Ayrıntılar; toplu işlem çubuğu ("0 seçili · en fazla 20"): "Stok güncelle", "Shopify fiyatı", "Seçimi kaldır". Pencere düğmeleri: "Onayla ve uygula", "Sonucu kontrol et", "Önizlemeyi hazırla", "Onayla ve Shopify'a gönder", "İşlem durumunu kontrol et", "Eksik görseli tamamla". Yayın durumu seçimi: "Taslak — yayına alınmaz" / "Aktif — mağazada yayınla". Altta "Gönderim ve EAN onay kayıtları".
- **send-shopify** üç adım: "1 · Ürün / varyant seç → 2 · Canlı önizlemeyi kontrol et → 3 · Onayla · Shopify sonucunu gör". Tablo sütunları: Seç, Ürün, Wawi SKU / EAN, Shopify / JTL SKU · Eşleşme, Fiziksel / Dropship, Gönderilecek adet, Wawi / Shopify fiyatları, Durum, İşlem. Düğmeler "Seçilenlerin stoğunu güncelle", "Seçilenlerin Shopify fiyatını düzenle". Kural metni: "Shopify kayıtlı adet son doğrulama zamanındaki stoktur. Ürün oluşturma ve içerik gönderimi önizleme ve ayrı onay gerektirir; yeni ürünler varsayılan olarak taslak açılır. Gönderilecek adet ve fiyat Wawi önerisidir; fiziksel depo sayımı değiştirilmez."
- Liste verisi 10 sn sonra bile "Ürünler yükleniyor… / Yükleniyor…" kaldı.
- pool ve send ayrı iki sayfa ama süzgeç kümesi ve iskelet aynı (ikisi de aynı form alanlarını taşıyor).

### ozon-pool / send-ozon

Adres: `/?page=ozon-pool&company=2269&warehouse=1&channel=10266&account=11`. Başlık "Ozon · Ürün havuzu" / "Ozon · Ürün gönder"; not: "İthal Koku hesabı · USD · MAIN depo. Ürünler mevcut Wawi kartlarına bağlanır; eşleşmeyenler ayrı gösterilir. Fiziki stok değiştirilmez." Para birimi USD (tek USD hesabı).

- Sekmeler: "Ozon ürün havuzu" ve "Wawi ürün havuzundan gönder". Düğme: "Ozon ürünlerini yenile".
- pool süzgeçleri: `listing`, `q`, `stock` ("Platform satış stoğu"), `sort`, `tag`, `ean`, `model`, `min`, `max`, `status` (Aktif / Aktiv, Stok yok / Ohne Bestand, Hazır / Bereit, İncelemede / In Prüfung, Hatalı / Fehler, Arşiv / Archiv; TR-DE karışık).
- send süzgeçleri: kategori, "Hedef depo fiziki stoğu", brand eklenir.
- Ürün düzenleme penceresi: dil seçimi (Türkçe, Deutsch, English, Русский), "Başlığı Rusçaya çevir", "Açıklamayı Rusçaya çevir", "Çeviriyi geri al", "Wawi metnini al", "Taslağımı geri getir", "Kaydet ve kontrol et", "Ozon'a gönder / güncelle", "Durumu kontrol et", "Stoğu Ozon'a gönder".
- İki sayfanın gövdesi aynı (düğme listesi birebir aynı); fark başlık ve süzgeç.
- Liste sonucu görülmedi (boş çerçeve açıldı).

### tr-market (Trendyol ve N11) — varsayılan ve platform=n11

Adres: `/?page=tr-market&tab=orders` (Trendyol, hesap DOCSER) ve `&platform=n11&tab=orders` (N11, "N11 · Docks"). URL hesabı otomatik ekliyor (`account=19` Trendyol, `account=21` N11).

- Menü: "Trendyol ürün havuzu" (`tr-market-products`), Siparişler, "Müşteri soruları" (questions), "İşlem geçmişi" (history), "Aktarım geçmişi" (actions), "Genel bakış" (dashboard). N11'de: ürün havuzu, siparişler, aktarım geçmişi, genel bakış (soru ve geçmiş sekmesi yok).
- Trendyol üst bilgi: seçili hesap, "Ürün API'si: Doğrulandı", paket sayısı (16 sipariş paketi), "Son tamamlanan okuma: <zaman> · Tamamlandı", "Siparişleri güncelle". N11: 9 sipariş paketi, depo (Istanbul Warehouse), "N11'den güncelle".
- Süzgeç: ödeme, arama, durum (Trendyol: Tüm durumlar, Yeni, Hazırlanıyor, Faturalandı, Kargoda, Teslim edildi, İptal, İade, Teslim edilemedi, Ödeme bekliyor, Paket bölündü; N11: Yeni, Hazırlanıyor, Kargoda, Teslim edildi, İptal, İade), tarih aralığı. Tarihler Türkiye saati.
- Tablo sütunları: Sipariş / müşteri, Ürünler, Tarih, Tutar, Durum / işlemler. Satırda ödeme yöntemi, paket no, ürün satırı (adet · stok kodu), tutar (TRY), "Müşteri bilgileri" (ad, teslimat/fatura adresi: DOM'da açık), kargo firması (Yurtiçi Kargo Marketplace) ve takip no, "Sipariş detayı →", "Kargoyu takip et ↗".
- Fiyat/stok değişikliği penceresi (aynı sayfada gizli): alanlar `salePrice`, `listPrice`, `quantity`, `text`; düğmeler "Değişikliği ön izle", "Onayla ve Trendyol'a gönder" / "Onayla ve N11'e gönder" ("Önizle · henüz gönderme").
- N11 tutarı: "180,00 Para birimi alınamadı" (para birimi sütunu boş; metin olarak kullanıcıya yansıyor).
- Eşleştirme: aynı hesap "DOCSER" altında Trendyol (satıcı), N11 (docks) — hesap bazında ayrı id.

### tr-market-products

Adres: `/?page=tr-market-products` (hesap 19, Trendyol). Amaç: Trendyol ürün havuzunu görmek, fiyat/stok değiştirmek, aktarım dosyası hazırlamak.

- Üst: "Katalog ve stok kapsamı", "Trendyol ürün okuması", "Son tam aktarım: <zaman>", "Trendyol'dan güncelle", sekmeler "Tüm ürün havuzu" (catalog=products) ve "Trendyol ürün havuzu" (catalog=platform).
- Süzgeç: ürün ara, kategori, "Platform satış stoğu", sıralama, etiket, EAN, marka, model, fiyat aralığı, durum: Tümü, Satışta, "Onaylı · satışta değil", "Onay sürecinde", "İnceleme gereken", "Kaynakta bulunamadı".
- Sayaç: "93 ürün ailesi · 20 aile / sayfa · 5 sayfa".
- Tablo sütunları: Seç, Ürün / SKU / barkod, Fiyat, Satış stoğu, Durum / içerik, İşlemler. Satır: aile başlığı + seçenek sayısı, marka · kategori, SKU, barkod, fiyat (₺), "Trendyol · TRY", "N adet · Fiziki sayım değil" (yani platform satış stoğu depo sayımından ayrı), durum ("Trendyol'da satışta ↗", "Onaylı · satışta değil ↗"), "1 kontrol notu", "Ürün detayı / özellikler".
- İşlemler: "Fiyatı değiştir", "Stok güncelle / aç", "Acil satıştan kaldır"; toplu: "0 varyant seçildi", "Seçileni aktarım dosyasına al", "Aktarım dosyası ne yapar?".
- Örnek: stokta "0 adet" olan "Onaylı · satışta değil" ürün ile 100-200 adetli satışta ürünler birlikte.

### channel-worklist (issues, images, history)

Adres: `/?page=channel-worklist&company=1196&warehouse=2&channel=5075&account=0&kind=issues` (kind: images, history). Sayfa açılışta kendi adresini normalize edip yönlendiriyor (`?q=&sort=name&family=all&reason=all&page_size=25&company=…&kind=…&account=0&p=1&filters=1&page=channel-worklist&lang=tr`); `family`, `reason` parametreleri var ama ekranda görünür karşılığı yok.

- Başlık: kanala ve mağazaya göre ("eBay.de · Woida · Woida · Almanya Warehouse"), sayaç ve "Son kontrol" zamanı. Süzgeç: ad/SKU/EAN arama, sıralama (A→Z, Z→A; history için En yeni / En eski), sayfa boyutu (25/50/100), "Yenile".
- **issues** ("Sorunlu Ürünler"): 24 kayıt (eBay Woida). Sütunlar: ÜRÜN, SORUN / SEBEP, YAPILACAK İŞLEM. Sebep değerleri görülen: "Son gönderim başarısız veya sonucu doğrulanamadı", "EAN 1 ve EAN 2 boş". İşlemler: "Ürünü aç / düzelt" (`warehouse-product`), "İşlem ayrıntılarını gör" (aynı sayfanın history görünümü, `q=<sku>`), "Not / Sorun ekle". Açıklama: "Ürünü açıp düzeltin, ardından ilgili kanalın gönder / güncelle ekranını kullanın."
- **images** ("Fotoğraf kontrolü"): süzgeçler "Ürün türü" (Tüm ürünler, Parfüm, Toner), "Görsel durumu" (Tüm görsel sorunları, Fotoğrafı olmayan, Sorunlu / düşük kaliteli, Kaynağı okunamayan). Tanım: "Sorunlu görsel: kaynağı açılamayan veya ölçülmüş özgün fotoğrafının uzun kenarı 500 pikselden küçük olan ürünler." Liste 10 sn sonra "Liste yükleniyor…" kaldı. Üstteki açıklama issues sayfasıyla birebir aynı ("Eksik ürün bilgileri ve son gönderiminde sorun bulunan ürünler..."), yani görsel sayfasında yanlış metin (kopya).
- **history** ("İşlem geçmişi"): 1176 kayıt (Woida eBay). Sütunlar: ÜRÜN, İŞLEM / DURUM, TARİH. Değer örnekleri: "Tamamlandı · auto_stock_policy", "Tamamlandı · publish", "Tamamlandı · withdraw", "Hata kodu:" (boş). İşlem adları ham İngilizce kod olarak gösteriliyor. Aynı ürünün `auto_stock_policy` kaydı gün içinde 3 kez (13:24, 13:36, 14:22 UTC) tekrarlıyor: otomatik stok politikası saatlik tekrar yazıyor gibi (tahmin).
- Menüdeki "İşçi listeleri" bağlantıları her kanal/hesap için üç `kind`'i üretiyor (ebay 5075, 6, 10269, 10280, 10274, 10276 gibi).

### mixoutlet-payments

Adres: `/?page=mixoutlet-payments&company=1&warehouse=2&channel=10272&account=18`. Başlık "MIXOUTLET.DE · LADY EMPIRE · Mollie ödemeleri". Amaç: Mollie üzerinden yapılan ödemeleri sipariş ile eşleştirmek.

- Süzgeç: arama (sipariş / sipariş veren), `method` (Kredi / banka kartı, SEPA Banka havalesi, SEPA Otomatik tahsilat, PayPal, Klarna, iDEAL, Apple Pay, Bancontact, Yöntem bilgisi gelmeyen), `status` (Ödendi, Ödeme bekleniyor, Provizyon, Kısmen ödendi, Kısmen iade, İade edildi, Ödeme iptal), `from`, `to`.
- Sütunlar: SİPARİŞ / TARİH, SİPARİŞ VEREN, ÖDEYEN, NEYLE ÖDENDİ?, SİPARİŞ TUTARI, TAHSİLAT / İADE, DURUM.
- Uyarı metni: "Şu an Shopify'dan gelen Mollie kayıtları gösteriliyor. Doğrudan Mollie bağlantısı henüz kurulmadığından kart/SEPA ve gerçek ödeyen bilgisi eksik olabilir." ve "Tahsilat, sipariş için alınan ödemedir; Mollie'nin banka hesabınıza yaptığı aktarım değildir." Düğme: "Ödemeleri yenile". Tarihler Almanya saati.
- Liste satırları görülmedi (açık veri DOM'a gelmeden okundu).

## Varlıklar ve durumlar

**Şirket (company):** üst sahip; bir depoya atanır ("Atanan depo") ve bir ürün verisi kaynağı vardır (ör. "JTL-Wawi ürün verisi"). Görülen kimlikler: 1 (Lady Empire GmbH), 1196 (Woida / Woida UG), 2269 (İthal Koku, Ozon), 2291 (Technowelt, OTTO), 2288, 2290, 2293 (eBay mağazaları; adları bu çalışmada eşlenmedi), 2 (NL deposu ile Kaufland hesabı; şirket adı eşlenmedi). Kimliklerin hangi şirkete ait olduğu yalnız üstteki hesap seçiminden anlaşılıyor.

**Depo (warehouse):** 1 İstanbul (MAIN), 2 Almanya (DE-WH), 3 Hollanda (NL-WH), 2881 / 2882 (Mega B, Technowelt Almanya; ebay-pool bağlantılarında 2881 ve 2882 var, hangisi hangisi belirsiz, Technowelt OTTO'su 2882 ile çalışıyor). Şirket → depo atanması URL'de `warehouse` olarak taşınır; depo aynı zamanda stok kaynağıdır ("Hedef depo fiziki stoğu").

**Kanal (channel):** bir satış kanalı kaydı: tür (eBay, Kaufland, Amazon, METRO, OTTO, Shopify, JTL-Shop, JTL-Wawi, XML-Import, Dealclub, Ozon, Trendyol, N11) + ad. Görülen kimlikler: 6 eBay 3DPLady, 7 Amazon (Lady Empire), 5075 eBay.de Woida, 5332 Kaufland Woida, 5448 Kaufland Lady Empire, 10281 Shopify Parfymonline.de, 10282 Amazon Woida, 10283 OTTO Technowelt, 10266 Ozon İthal Koku, 10272 Mixoutlet Shopify, 10263 / 10270 / 10277 Kaufland (başka şirketler), 10269 / 10280 / 10274 / 10276 eBay.

**Hesap (account):** kanal için kimlik bilgilerini taşıyan platform hesabı; global sayısal kimlik (9 Kaufland NL, 11 Ozon, 14 Kaufland Lady, 15 eBay, 16 eBay 3DPLady, 17 Kaufland, 18 Mixoutlet, 19 Trendyol, 20/22/27 eBay, 21 N11, 23 Kaufland, 25 ve 12 METRO, 26 Kaufland Woida, 28 Shopify Woida, 30 OTTO). Bir şirketin bir kanalı için tek hesap vardır (tahmin); eBay işçi listelerinde `account=0`. Hesap alanları (ör. satıcı kimlikleri, anahtarlar) ekranlarda görünüyordu, belgeye alınmadı.

**İlan (listing):** kanal üzerindeki ürün kaydı; Wawi ürün kartı (SKU, EAN) ile eşleştirilir. Eşleşme durumu: "ERP ürünüyle eşleşti" / "eşleşmedi · ilan yine de gösteriliyor" / "Ürün eşleşmesi gerekli" / "Wawi yayın kaydı yok".

**İlan durumu değerleri (gözlenen):**
- eBay: Aktif, Stok 0 · satışa kapalı, Durumu belirsiz, Kapanmış, Bekleyen (scheduled), Kontrol gerekli.
- Kaufland: Kaufland'da olanlar, Aktif ilanlar, Aktif ilanı olmayanlar, Kapalı / pasif, Kaufland'da olmayanlar; sorun türleri: Eksik / reddedilen bilgi, Kaufland onayı bekleniyor, Satış engeli.
- METRO: Aktif teklifler, Kaldırılmış, Duraklatılmış, Pasif, Henüz teklif yok; sekmeler Canlı teklifler / Onaylı ürünler / Reddedilen ürünler / Ürün yüklemeleri.
- OTTO: Satışta, Otto onayı bekliyor, Reddedildi, Kısıtlı, "Henüz doğrulanmadı".
- Shopify: aktif, pasif, bağlı değil (unlinked), bilinmiyor; yayın seçimi Taslak / Aktif.
- Ozon: Aktif, Stok yok, Hazır, İncelemede, Hatalı, Arşiv.
- Trendyol: Satışta, Onaylı · satışta değil, Onay sürecinde, İnceleme gereken, Kaynakta bulunamadı.
- Amazon: sayaçlar Aktarıma hazır, Teklif açılmış, Eşleşme / onay sorunu, Depo fiyatı eksik.

**Sipariş durumu (Trendyol/N11):** Yeni, Hazırlanıyor, Faturalandı, Kargoda, Teslim edildi, İptal, İade, Teslim edilemedi, Ödeme bekliyor, Paket bölündü. OTTO: Hazırlanacak, Gönderildi, İptal. Ödeme süzgeci ortak: Ödendi, Kartla ödendi, havale türleri, Ödeme bekleniyor, İade edildi, Kısmen iade/ödendi, Ödeme iptal edildi/başarısız.

**Stok kaynağı:** Fiziki, Drop (kaynak alt türleri: Asterbuy, BueroArena / Kosatec, B2BUhren, Watchimport), Sanal (yalnız web mağazası tedarik kapasitesi), "Stoksuz (fiziki / drop yok)", "Stok bilgisi belirsiz" (sayılmamış). Platform adedi depo stokundan ayrı kayıttır ("eBay adedi ile depo stokları ayrı kayıtlardır", "Fiziki sayım değil").

## İş akışları

**Genel ilan yaşam döngüsü (gözlenen düğme ve metinlerden):**
1. Havuz: Wawi ürün havuzu (`products`/pool) → kanal sayfasındaki "Wawi ürün havuzu / … gönder" sekmesi.
2. Hazırlık: eksik EAN, görsel, kategori, marka/model tamamlanır (kart penceresinde "Ürüne kaydet" ürün kartına yazar, pazaryerine göndermez).
3. Kategori eşleme: eBay'de ürün adından otomatik kategori önerisi (toner ve parfümde hazır kural), kanalın kategori listesi; Kaufland ve OTTO'da kategori alanı ayrıca seçilir; Ozon'da dil çevirisi (Rusça).
4. Önizleme ve onay: eBay "Onayla ve uygula", Shopify "Önizlemeyi hazırla → Onayla ve Shopify'a gönder", Amazon "Amazon'da önizle → Onayla ve Amazon'a gönder", Trendyol/N11 "Değişikliği ön izle → Onayla", Metro "otomatik tamamla" ile en fazla 25 ürün.
5. Durum kontrolü: "Durumu kontrol et" / "Sonucu kontrol et" / "İşlem durumunu kontrol et" her kanalda ayrı düğme; sonuç eşzamansız (Kaufland uyarısı: gönderimden sonra tekrar göndermeden durum sorgula).
6. Yayında: aktif ilan; stok ve fiyat güncelleme satırdan ("Stoğu güncelle", "Fiyatı değiştir", "Stok gönder", "Stoğu Ozon'a gönder") veya toplu.
7. Sorun: eksik/reddedilen bilgi, EAN boş, son gönderim başarısız → `channel-worklist kind=issues`, kanala özel sorun sekmeleri (Kaufland issues, OTTO issues/images/eans, Amazon issues/safety, Metro failed).
8. Çıkarma: "Acil satıştan kaldır" (eBay, Trendyol), "Seçilenleri kaldır" (eBay toplu), `withdraw` işlem kaydı geçmişte görülüyor.
9. Kayıt: her işlem `channel-worklist kind=history` ve kanala özel "İşlem geçmişi" sekmelerinde saklanır (publish, withdraw, auto_stock_policy).

**Fiyat ve adet (hesap bazında):** eBay'de "Wawi fiyatı" ve "eBay fiyatı" ayrı (eBay fiyatı son okunan platform fiyatı; "eBay gerçek stok ve normal satış fiyatını kullanır; stok bitince satış adedi sıfırlanır"). Kaufland'da gönderim penceresinde brüt fiyat ve satış miktarı girilir, depo ve kargo grubu hesaba bağlı. Shopify'da gönderilecek adet ve fiyat "Wawi önerisi", sonra "Shopify fiyatı" ile düzeltilir. Trendyol'da `salePrice` / `listPrice` / `quantity`. Fiyat toplu güncellemesi için `bulk-prices` sayfasına bağlantı (eBay). Rakip fiyatlar (eBay, Kaufland, Metro, Otto) 24 saatte bir okunur ve satır bazında gösterilir (eBay, OTTO sayfalarında).

**Stok kaynağı seçimi:** eBay gönderiminde "Otomatik · Fiziki → Drop" ya da depo Fiziki / depo Drop; "Wawi'de hangi stok değişsin?": Yalnız platform / Fiziki + eBay / Drop + eBay. Shopify'da ürün kaynağı süzgeci (fiziki + drop alt kaynakları + "sayılmamış" + "sıfır"). Metro ve Ozon'da stok yalnız kanal stoğu; "fiziki depo stoğunu değiştirmez".

**Sipariş alımı:** Kaufland hesabında arka plan işi "Sipariş alımı" (zaman damgalı çalışıyor mesajı); Metro "10 dakikada bir otomatik senkron"; Trendyol/N11 "Siparişleri güncelle / N11'den güncelle" ile son okuma zamanı; Amazon, eBay, Shopify, JTL sipariş kaynağı için `company-home` kanal kartı "Sipariş · JTL sipariş kaynağı" veya "Bağlı · henüz sipariş yok" der (kart ile gerçek sayı çelişiyor, aşağıya bakın). Sipariş listeleri birleşik `orders-pool` içinde de var (kapsam dışı).

## erp_action listesi

Bu bölümdeki ekranlarda yazma işlemlerinin büyük kısmı `erp_action`'lı POST formu değil, JS ile `/api/*.php` çağrıları; sayfa DOM'unda `erp_action` yalnız aşağıdakiler görüldü.

| erp_action | Ekran | Ne yapıyor görünüyor |
|---|---|---|
| `sync_sales_listings` | company-home view=products (Amazon · Lady Empire) | "Ürün kataloğunu senkronize et": platform ürünlerini bu kanala aktar (gizli `company_channel_id`, `return_*` alanları) |
| `logout`, `add_warehouse`, `add_supplier`, `add_company`, `add_stock`, `quick_update_inventory`, `add_category` | Tüm sayfalarda ortak kabuk (gizli modal) | Genel yönetim formları; kanal sayfalarına özel değil |

JS ile çağrılan işlem uçları (okunan istek adresleri): `/api/woida-amazon.php` (Amazon Woida ürünleri), `/api/kaufland-publications.php?action=accounts|products` (Kaufland), `/api/metro.php?action=catalog`. Diğer kanallar için uç adları bu çalışmada okunmadı.

## Sorunlar ve yeniden tasarım notları

1. **Aynı iş her kanalda ayrı kodla.** Havuz + gönder + durum kontrolü + stok/fiyat güncelle bir tek soyutlama, ama `ebay-pool`/`send-ebay`, `send-kaufland`, `metro`, `shopify-pool`/`send-shopify`, `ozon-pool`/`send-ozon`, `tr-market`/`tr-market-products` ayrı sayfa, ayrı JS, ayrı API. Süzgeç adları bile farklı ("Hedef depo fiziki stoğu" / "Platform satış stoğu" / "Wawi stok türü"). Ortak "kanal havuzu" bileşeni + kanal sağlayıcı eklentisi önerilir (tahmin: bu tek çatı altında toplanabilir).
2. **pool/send ayrımı gereksiz.** `shopify-pool` ile `send-shopify`, `ozon-pool` ile `send-ozon` aynı süzgeç ve aynı düğme listesini taşıyor; eBay ve Kaufland'da da aynı sayfa içinde "havuz" ve "gönder" sekmeleri var. Kullanıcı için tek liste + "durum" süzgeci yeterli görünüyor.
3. **Genel (`company-home`) ile kanala özel sayfalar arasında karışık dağılım.** OTTO ve Amazon `company-home` içinde sekmelerle gömülü, eBay/Kaufland/METRO/Shopify/Ozon/Trendyol ayrı sayfa. Amazon uygulamasının API'si `woida-amazon.php` — yalnız Woida için; Lady Empire Amazon kanalı (channel 7) gelişmiş sekmeleri açmıyor. Dedicated sayfaların kendi menü girişleri ve kendi ekmek kırıntıları var; kullanıcı kanal değiştirince bağlam (şirket/depo/hesap) kayıyor.
4. **Boş açılıp JS ile yüklenen liste ekranları.** Kaufland products/issues, Amazon, OTTO siparişleri/geçmiş/gönder, Shopify havuzu/gönderi, Ozon ve Mixoutlet listeleri okuma anında yüklenmemişti; Kaufland products'ta "Yanıt gecikti. Gönderim yaptıysanız tekrar göndermeden durumunu kontrol edin." Uygulama ilerleme göstergesi, zaman aşımı ve tekrar deneme akışını net kurmalı.
5. **METRO hesap seçimi.** `?page=metro&…&account=25` adresindeki hesap yok sayılıyor; açılır listede yalnız "Hesap / firma seçin", mesaj "Devam etmek için hedef hesabı seçin." Derin bağlantı ve yenileme sonrası durum kaybı. Aynı kanalda başka sayfalarda (`send-kaufland`, `shopify-pool`) hesap URL ile çalışıyor; tutarsızlık.
6. **Kanal kartı ile gerçek sayı çelişkisi.** `company-home` kanal kartında Amazon/eBay/Shopify için "Sipariş · Bağlı · henüz sipariş yok" yazıyor, aynı karttaki "Sipariş · yüklenen" 64 ile 5.662 arasında sayı gösteriyor. "Katalog · JTL ürün kataloğu" ile "Ürün kaydı 0" aynı kartta. Rozetler veri kaynağını tarif ediyor, boş/dolu durumunu değil.
7. **Etiket dili karışık.** OTTO ve Ozon ekranlarında TR / DE çift etiketler ("Ara / Suchen", "Temizle / Zurücksetzen", "Aktif / Aktiv"); Ozon düzenleyicide dil seçeneği TR/DE/EN/RU; Trendyol sayfasında sipariş durumları TR. Geçmiş ekranında işlem adları ham İngilizce kod (`auto_stock_policy`, `publish`, `withdraw`) ve boş "Hata kodu:".
8. **Kopya metin.** `channel-worklist kind=images` sayfasının açıklaması issues sayfasının metniyle aynı (eksik ürün bilgisi / son gönderim sorunu); görsel kontrolü için yanlış.
9. **N11 sipariş tutarı** "180,00 Para birimi alınamadı"; Trendyol'da para birimi doğru (TRY). N11 tarafında para birimi eşlemesi eksik.
10. **Kişisel veri DOM'da açık.** Sipariş satırlarında ("Müşteri bilgileri") ad, adres, e-posta, telefon sayfa açılır açılmaz DOM'da, açılır panel kapalı olsa bile. Yönetici dışı roller için yeniden tasarımda maskeleme gerekebilir (tahmin).
11. **Aynı ürün için tekrarlayan otomatik kayıt.** `auto_stock_policy` işlemi aynı ürün için gün içinde birkaç kez (13:24, 13:36, 14:22) "Tamamlandı" görünüyor; hangi koşulla tetiklendiği ekranda yok.
12. **eBay eşleşme borcu.** Woida eBay havuzunda "ERP ürünüyle eşleşmedi · ilan yine de gösteriliyor" satırları ve aynı ilan için iki satır (eşleşmiş ve eşleşmemiş kopya) görüldü; "Wawi yayın kaydı yok" ilanlar Wawi dışında yayınlanmış. 3DPLady havuzunda 1091 ilanın kategori bilgisi eksik ("Eksik kategorileri eBay'den tamamla" tek tek çalıştırılan bir düzeltme).
13. **Bir satırda çok eylem.** eBay havuz satırı: Kaydet, Stoğu güncelle, İşlem durumunu kontrol et, Ürün ismini eBay'de güncelle, Acil satıştan kaldır, Wawi fiyatını düzenle, Not / Sorun ekle birlikte; tehlikeli ("Acil satıştan kaldır") ile günlük işler aynı hizada.
14. **Sayfa başına sabit 25 / 20 öğe, 8786 sayfalık havuz.** `send-ebay catalog=products` 219.647 ürün, sayfa başına 25; arama ve süzgeç dışında hızlı gezinme yok.
15. **Mixoutlet Mollie sayfası** yalnız tek bir kanal (Mixoutlet) için ayrı sayfa; diğer ödeme sağlayıcıları için karşılığı yok. Uyarı metni doğrudan Mollie bağlantısının henüz kurulmadığını söylüyor (veri eksik olabilir).

## Görülemeyenler

- `company-home` OTTO `orders`, `history`, `source` (gönder) sekmeleri ve Amazon `products`, `listings` sekmeleri: sayfa açıldı fakat 10 sn sonra "Yükleniyor…" kaldı; sütun/satır içeriği görülemedi. OTTO `returns`, `eans` ve Amazon `orders`, `issues`, `safety`, `history` sekmeleri açılmadı (iskelet ve bağlantılar okundu).
- `send-kaufland` `catalog=products` ve `catalog=issues` listeleri: istemci zaman aşımı / yükleniyor; yeniden denendi (Lady Empire hesabı) aynı sonuç. Liste satırı görülemedi.
- `metro` hesap seçimi boş olduğundan sipariş, havuz, gönder, "Gitmeyen ürünler" içerikleri görülemedi (iskelet ve süzgeç okundu). `overview`, `messages`, `categories` görünümleri açılmadı.
- `shopify-pool`, `send-shopify`, `ozon-pool`, `send-ozon`, `mixoutlet-payments`, `channel-worklist kind=images`: liste verisi yüklenmedi, satır içeriği okunamadı. Ozon'da ürün sayısı da görülemedi.
- `tr-market` `tab=questions`, `actions`, `history`, `dashboard` ve `platform=n11&tab=products` açılmadı; `tr-market-products catalog=platform` açılmadı.
- Dedicated sayfaların çoğunda yazma işlemleri formsuz JS olduğu için `erp_action` değerleri okunamadı; hangi `/api/` uçlarının çağrıldığı yalnız Amazon (Woida), Kaufland ve Metro için gözlendi.
- Sipariş çekme ve iade akışı kanal başına ayrı sipariş sayfalarında (`orders-ebay`, `orders-kaufland`, `returns`); bu kapsam dışı olduğu için eBay/Kaufland iade detayı bu belgede yok.
- Hiçbir adres engellenen desenlerle (`import`, `load_list`, `delete`, `sync`, `send=`, `export`, `download`, `stop`, `/api/`) açılmadı. Ağ isteği listesi yalnız okundu (kendi tarayıcı sekmem).
