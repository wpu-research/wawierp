# WawiERP Panel — Sipariş, Kargo, İade, Destek Alanı

Tarih: 2026-11-14 · Kaynak: canlı panel (https://wawib2b.com), sistem yöneticisi oturumu, yalnız okuma. Müşteri kişisel verisi (ad, adres, e-posta, telefon, sipariş/takip no) bilerek yazılmadı; yalnız sütun, sayı ve durum değerleri var. Tahmin olanlar "tahmin" ile işaretli.

## Özet

- Sipariş alanı tek bir birleşik havuz (`orders-pool`) etrafında kurulu: 14.258 sipariş, 19 platformdan (JTL 11.834, Amazon 3.895, eBay 3.877, JTL Shop 3.865, Kaufland 1.291, Web mağazaları 842, Shopify 253, METRO 1, Diğer 2). Sayılar kaynak chip'lerinde görünüyor; chip toplamı 14.258'i aşıyor (bir sipariş birden fazla chip'e düşüyor olabilir, tahmin).
- Kanal bazlı iki ayrı sipariş ekranı var (`orders-ebay`, `orders-kaufland`); aynı satır şablonunu paylaşıyor ama kendi üstbilgi/senkron butonları var. Amazon, Shopify, METRO, OTTO, N11 vb. için bu alanda ayrı sayfa yok (başka bölümlerde, `company-home` vb.).
- Sipariş satırı üzerinden yapılan işler: not/sorun ekleme, DHL etiketi yazdırma/PDF/ağırlık ayarı, harici takip no ekleme, fatura yazdırma/düzenleme/gönderme, iade faturası, müşteri bilgisi düzenleme. Bunlar form `erp_action` ile değil, satırdaki `data-*` düğmeleri + JS (ayrı `/api/*.php` uçları, tahmin) ile çalışıyor.
- Kargo: `shipping` = DHL etiket merkezi (şirket/DHL hesabı seçilince sipariş listesi gelir, toplu etiket, toplama listesi, toplu fatura) + "siparişsiz etiket" paneli (`manual=1`). `shipments` ise DHL değil, depolar arası sevkiyat (Istanbul → Almanya vb.) modülü; şu an boş.
- İade: `returns` DHL iade etiketlerinden otomatik doluyor. 79 iade kaydının tamamı "Açık · Müşteriden ürün bekleniyor · Henüz kontrol edilmedi" durumunda; hiçbiri ilerlememiş.
- Sorunlu siparişler (`problem-orders`) bir "operasyonel not" sistemi: not açıksa sorun; 28 açık kayıt, 10 neden kategorisi. Dropship tedarikçi akışı için ayrı `asterbuy-orders` havuzu var (11 kayıt; 10'u "Takip aktarıldı").
- Destek: `tickets` pazaryeri müşteri sorularının ortak gelen kutusu (API'den son 28 gün, 139 sayfa × 25 satır ≈ 3.400+ kayıt).
- Performans: sayfa kabukları hızlı, ama listeleri dolduran `/api/*.php` çağrıları 15-30 sn sürüyor; iki sayfa 504 verdi.

## Ekranlar

### orders-pool — Birleşik sipariş havuzu
- Amaç: tüm platform/şirket/depo siparişlerini tek listede görmek, filtrelemek, kargo-fatura-not işlemlerine girmek.
- URL parametreleri: `order_source` (all, jtl, xml, jtl-shop, shopify, ebay, amazon, dealclub, kaufland, metro, webshop, ozon, trendyol, n11, otto), `order_date_range` (all, custom ve hızlı aralıklar; `order_from`/`order_to` tarih), `order_status` (all, new=Yeni, processing=Hazırlanıyor, complete=Tamamlandı, cancelled=İptal/iade — kanal sayfalarındaki değerlerden), `order_payment` (all, paid, card_paid, bank, bank_paid, bank_unconfirmed, pending, refunded, partial_refund, partial_paid, void, failed, expired), `order_label` (all, review=Oluşturulamayanlar, today=Bugün oluşturulan PDF'ler, ready=Hazır PDF'ler), `order_dispatch` (all, unshipped=Gönderilmeyenler, overdue=2 günü aşanlar), `order_inbox` (0 = tüm siparişler, 1 = "işlem bekleyen" gelen kutusu), `order_supply[]` (physical, dropship, asterbuy, bueroarena, b2buhren, watchimport), `order_drop`, `order_channel` (kanal id), `order_companies[]` (11 şirket onay kutusu), `pool_warehouse` (0 Tümü, 1 İstanbul, 2 Almanya, 3 Hollanda, 2882 Technowelt Almanya), `order_q` (arama), `order_sort` (date_desc, date_asc, product_asc, product_desc), `order_page_size` (25, 50), `order_page`, `lang` (tr/de).
- Sağ-üst: "Excel dışa aktar" (form → `/api/orders-export.php`, POST; alanlar: from, to, depo, şirket, kaynak, saat dilimi Europe/Berlin veya UTC), "Satış özeti" (toplam ciro, Shopify, Dropshipping, Fiziki satış; çoklu para birimi "+2 para birimi").
- Üst gezinme (hızlı filtre bağlantıları): "Tüm siparişler", "Oluşturulamayanlar", "Bugün oluşturulan PDF'ler", "Hazır PDF'ler", "İşlem bekleyen siparişler", "Gönderilmeyenler", "2 günü aşanlar". Gelen kutusu kısayolları (sayılarla): Tüm siparişler 14.258 · Drop siparişler Auto 71 · Fiziki siparişler 208 · 2 günü aşan fiziki siparişler 129 · Fiziki stok siparişleri 102+ · Shopify Mixoutlet 77 · Shopify Lady Toner 53 · Drop Asterbuy 50+ · Drop BueroArena/Kosatec 20+ · B2B Uhren 0+ · Watch Import 0+ · BueroArena 14 · Hollanda siparişleri 784+.
- Tablo sütunları: (seçim kutusu) · Sipariş / müşteri · Ürün (sıralanabilir) · Tarih (sıralanabilir) · Tutar · İşlem. Sayfa başına 25 (50 seçeneği var). "1 / 571 sayfa".
- Satır içeriği: sipariş no (Shopify için dış bağlantı Shopify admin'e), müşteri adı, mağaza/platform, tedarik rozeti ("Fiziki depo siparişi"), ödeme rozeti, ödeme yöntemi, şirket · depo, ürün başlığı + "satış anındaki ad", Wawi SKU/EAN, adet, "Ürün detayı ↗" (`page=warehouse-product`), "⚑ Sorun / Not" (varsa not metni+zaman) ya da "Not / Sorun ekle", tarih, tutar, durum rozeti, genişleyen "Müşteri bilgileri" ve "İşlemler / sipariş bilgileri".
- Durum değerleri: sipariş durumu "Yeni", "Hazırlanıyor" (ayrıca "Tamamlandı", "İptal / iade" filtre seçeneği); kanal etiketi "NEU" (eBay/Kaufland, 8 satırda "Yeni" ile birlikte); ödeme rozetleri "Ödendi", "Kartla ödendi", "Banka havalesi bekleniyor".
- Satır işlemleri (düğme etiketi · `data-*`): Müşteri bilgilerini düzenle (`data-customer-edit`); Not / Sorun ekle; Etiket yazdır (`data-dhl-order`; ipucu: "Etiket yoksa otomatik oluşturulur; DHL sözleşme ücreti uygulanır"); Harici kargo / Takip numarası ekle (`data-external-tracking-order`); PDF indir (`data-dhl-download`); Ağırlık / ayarlar (`data-dhl-settings`); Fatura yazdır; Faturayı düzenle; Fatura gönder; İade faturası (`data-invoice-*`).
- "Kargo araçları · takip ve kontrol" şeridi: DHL kargo sorgula (dış site formu, takip no), "Kargo kontrolü: 12 / 12 kontrol edildi · 0 kargo kaydı" + "Yeniden kontrol et", "N etiket seçildi", "Bu sayfadakileri seç", "Seçimi temizle", "Seçilenleri yeniden oluştur" (toplu DHL yeniden oluşturma), "Son toplu işlem / devam", "Onay uyarısını yeniden göster".
- Sayfaya gömülü modallar (global şablon; bu sayfada `return_page=orders-pool`): Depo ekle, Tedarikçi ekle, Şirket ekle, Stok ekle, Hızlı stok güncelle, Kategori ekle, Ürün ekle sihirbazı, Banka havalesi yükle, Eşleşmeyenler (indirme), Mağaza dosyası yükleme (MixOutlet.de / LadyToner.de CSV tahmin), tedarikçi takip no girişi (taşıyıcı: DHL, DPD, GLS, Hermes, UPS, FedEx, PostNL), depo mesajı gönderme.
- Gözlenen varyantlar:
  - `order_inbox=0&order_dispatch=unshipped` → 14.258 sipariş, 571 sayfa (aynı sayı "Tüm siparişler" ile; "gönderilmeyen" filtresi hiçbir şeyi eliyor görünmüyor, kontrol gerekir).
  - `order_inbox=1&order_supply[0]=physical&pool_warehouse=0` → "Bugün" özeti, 26 sipariş (2 sayfa), 28 ürün adedi; 16 "Yeni" + 9 "Hazırlanıyor". Menüdeki "Fiziki siparişler 208" ile uyuşmuyor.
  - `order_source=kaufland&order_status=new&order_dispatch=overdue` → boş durum: "Bu filtrelerde sipariş bulunamadı." Üstte "Kaufland 0 · Yeni · 0 sipariş".
- Bağlantılar: `warehouse-product` (ürün detayı), `orders-pool` (kendi filtreleri), dış: Shopify admin, DHL takip. Sipariş detay sayfası yok (aşağıda "Görülemeyenler").

### asterbuy-orders — Asterbuy sipariş havuzu
- Amaç: dropshipping tedarikçisi Asterbuy'a açılan siparişleri ve takip aktarımını izlemek.
- Parametre: `q` (arama). Mağaza açılır listesi (11 kanal).
- Durum sekmeleri (sayı): Tümü (11) · Oluşturulacak (0) · Ödeme bekliyor (1) · Takip bekliyor / aktarılıyor (0) · Takip aktarıldı (10) · Kontrol edilecek (0).
- Sütunlar: Sipariş / mağaza · Asterbuy ürünleri · Durum · Takip · İşlem. Durum hücresi "Takip aktarıldı Asterbuy #…" veya "Ödeme bekliyor"; takip hücresi taşıyıcı (DHL, DPD) + tarih, "Takip henüz verilmedi" ile birlikte.
- İşlem hücresi: müşteri bilgisi (genişleyen), "Siparişi aç →" bağlantısı, müşteri düzenle düğmesi.
- Bilgi metni: siparişler 5 dakikada bir otomatik kontrol edilir, yeni takip numaraları 4 saatte bir alınıp satış kanalındaki ürünlere işlenir; karma siparişte depo paketi ayrı hazırlanır.
- Düğmeler: Yenile, Ara, Önceki/Sonraki. Liste `/api/asterbuy-orders.php` ile yükleniyor ve sayfa açıldıktan ~20 sn sonra doldu (ilk denemelerde 12-18 sn "Siparişler yükleniyor…" ekranında kaldı).

### problem-orders — Sorunlu siparişler
- Amaç: siparişlere açılmış sorun/notları (operasyonel not) tek listede görüp çözmek.
- Parametreler: `status` (open varsayılan, resolved), `warehouse` (0 = yetkili tüm depolar, Almanya, Hollanda, Istanbul, Mega B, Technowelt Almanya), `reason`, `q`, `p`.
- Sorun nedeni seçenekleri: Ürün eksik, Yanlış ürün, Hasarlı ürün, Stok farkı, Adres eksik / hatalı, Fatura hatası, Kargo / etiket sorunu, Ürün bilgisi / görsel, Ödeme kontrolü, Diğer.
- Başlık: "Sorunlu siparişler 28" (açık sayısı). `resolved` görünümünde: "Konuşmalar çözüldükten sonra 10 gün saklanır."
- Kart (tablo değil): sipariş no (bağlantı → `warehouse-orders` ... `load_list=1`), şirket · mağaza · depo, "Siparişi aç →", "Notlar / Yanıtla", ürün adı, SKU, adet, tutar, durum etiketi "Açık", yazan "PIN ••NN" (PIN ile kimlik), zaman, not metni, neden etiketi. İlk 25 kartta: hepsi "Açık"; nedenler Ürün eksik 4, Kargo / etiket sorunu 2, Diğer 1 (kalan kartlarda etiket görünmedi).
- Veri `/api/operational-notes.php?action=list&kind=order` ile yükleniyor; ilk açılışta ~25 sn "Notlar yükleniyor…" gösterdi. Çözülenler görünümü bu sürede dolmadı (okunamadı).

### /allordersfilter
- 504 Gateway time-out (iki deneme, ~25 sn ara). İçeriği görülemedi.

### orders-ebay — eBay.de siparişleri
- Amaç: eBay.de kanallarının siparişlerini OAuth bağlantısı üzerinden çekmek/izlemek.
- Parametreler: `order_channel` (Tüm eBay kanalları + 7 kanal: Ivobuyshop, Kaufplus, Lady Empire eBay, 3DPLady, Perasshop, Woida, Technowelt), `order_date_range` (all, today, 7, 30, custom), `order_status` (all, new, processing, complete, cancelled), `order_payment` (pool ile aynı liste), `order_from`/`order_to`, `order_q`, `order_page_size` (25/50), `order_page`, `order_channel_q`/`order_channel_page` (kanal arama).
- Üst özet: sipariş sayısı 359, toplam tutar 37.301,27 EUR (para birimleri ayrı), son kontrol zamanı, "200 eBay siparişi çekildi", durum "Bağlı · Otomatik sipariş aktarımı", toplam adet 577. Hızlı kartlar: Bugün 0, Dün 5, Son 7 gün 35.
- Durum chip'leri (Woida kanalı): Tüm Durumlar 359 · Yeni 4 · İşlemde 203 · Tamamlandı 150 · İptal Edildi 2.
- Sütunlar: seçim · Sipariş / müşteri · Ürün · Tarih · Tutar · İşlem (50 satır/sayfa, 8 sayfa). Satır içi işlemler orders-pool ile aynı + "Yenilenen etiket / durum" (`data-dhl-recreate`).
- Üst düğmeler: eBay Ürün Yönetimi (→ `send-ebay`), eBay Yetkisini Yenile (form POST `/api/ebay-oauth-start.php`), Siparişleri ve stokları senkronla (`data-action=fetch-ebay-orders`, limit 200), CSV Aktarımı, Excel Aktarımı (`data-export=csv|excel`), Excel hazırla / Kaldığı yerden devam et / Hazır Excel'i indir, Muhasebe Kaydı (→ `accounting&accounting_channel=ebay`), Güncel listeyi göster, Satış özeti.
- Uyarı bandı: "Senkronun bazı adımları tamamlanamadı; alınan siparişler korunuyor… 18 stok kaydı eşleştirme/kontrol bekliyor."
- Ek bölüm: "Stok ve kârlılık özeti".

### orders-kaufland — Kaufland siparişleri
- Amaç: Kaufland Seller API siparişlerini izlemek.
- Parametreler: orders-ebay ile aynı; `order_channel` değerleri: Ivobuyshop, Lady Empire, Woida (5332), Novada Shops (Hollanda), Technowelt.
- Özet: 3.211 sipariş, 210.969,47 EUR, adet 3.916, 65 sayfa, "Seller API Sipariş Servisi · Bağlı". Ek kartlar: TOPLAM STOK 2.055.921 (fiziksel + dropshipping), KÂR / ZARAR "—" ("Maliyet, komisyon, kargo ve iade verisi bekleniyor").
- Durum chip'leri (Woida): Tüm Durumlar 3.211 · Yeni 0 · İşlemde 0 · Tamamlandı 2.582 · İptal Edildi 629.
- Düğmeler: Siparişleri Al (`data-action=fetch-kaufland-orders`, limit 100), CSV / Excel Aktarımı, Excel hazırla, Muhasebe Kaydı (→ `accounting&accounting_channel=kaufland`), Yenile, Satış özeti. eBay'deki OAuth ve senkron uyarısı yok.

### shipments — Depolar arası sevkiyat
- Amaç: kaynak depodan hedef depoya fiziksel sevkiyat planı oluşturmak ve mal kabulü izlemek (DHL kargosu ile ilgisi yok).
- Parametreler: `warehouse` (1 İstanbul, 2 Almanya, 3 Hollanda, 2881 Mega B, 2882 Technowelt Almanya), `shipment_warehouse_q`, `shipment_document_q`, `shipment_q`, `shipment_status`.
- Durum değerleri: Taslak (draft) · Sevke hazır (ready) · Depodan çıktı (dispatched) · Yolda (in_transit) · Hedef depoya ulaştı (arrived) · Mal kabul tamamlandı (received) · İptal edildi (cancelled).
- Form "Sevkiyat planı oluştur" (`erp_action=shipment_create`): kaynak depo, hedef depo, bağlı sevk belgesi / şirketler arası fatura (0 uygun belge), taşıma şekli (Hava / Kara / Deniz yolu), tahmini varış, taşıyıcı, takip no, not, 5 ürün satırı (ürün anahtarı + planlanan adet). Plan taslak açılır; stok hareketi "Depodan çıkar" adımında oluşur (metne göre).
- Durum: liste boş ("Yeni sevkiyat planı oluşturun"). Sevkiyat listesi ve belge listesinde tablo yok.
- Bağlantı: "Depo ağı" → `overview`.

### shipping — DHL etiket merkezi
- Amaç: sipariş seçip DHL etiketi oluşturmak, yazdırmak, toplu işlem yapmak.
- Parametreler: `warehouse` (1 ile açılınca "DHL Paket DE için Almanya deposunu seçin" uyarısı), `shipping_channel` (kanal; 0 + 9 kanal seçeneği: N11, Trendyol, Ozon, Shopify, eBay, Kaufland, Amazon vb.), `shipping_status` (all, new, processing, complete, cancelled), `shipping_date_range` (all, today, 7, 30, custom), `shipping_from`/`shipping_to`, `shipping_q`, `shipping_page_size` (25/50), `shipping_page`, `shipping_channel_page`/`shipping_channel_q`, `order_payment`.
- Akış (ekrandan): Depo seç → Şirket / DHL hesabı seç (açılır liste "Yükleniyor…" → "Şirket seçin") → sipariş numarası ile "Siparişleri getir" → sipariş kartları (50 kart DOM'da) → "Bu sayfadaki siparişleri seç" → "Seçilenler · DHL etiket", "Hazır etiketleri toplu yazdır", "Toplama listesi", "Toplu fatura · PDF / e-posta" (`data-pack-action`).
- Metin: mevcut pazaryeri takip kayıtları kontrol edilir, bulunan DHL etiketi yeniden kullanılır; kontrol tamamlanmazsa yeni etiket oluşturulmaz; iade etiketi gidiş etiketinden ayrı saklanır.
- Bağlantılar: DHL Bağla (`#dhl-settings`), Kargo faturaları → `invoices&view=shipping`, Depo siparişleri → `warehouse-orders`, kanal bazlı `orders-pool` kısayolları; "Diğer taşıyıcılar · PostNL ve mevcut sevkiyat görünümü" bölümü.
- "Siparişsiz etiket oluştur · Create label" (`manual=1`, `#dhl-manual-panel`): sipariş, fatura, stok hareketi veya müşteriye e-posta oluşturmadan DHL etiketi. Alanlar: gönderim deposu, gönderici şirket / DHL hesabı, kargo ürünü, alıcı adı, alıcı firma (isteğe bağlı), alıcı ülkesi (AB listesi), şehir, sokak, kapı no, posta kodu, adres eki, paket ağırlığı (kg), referans. Düğmeler: DHL hesaplarını yenile, Bilgileri kontrol et, Ücretli DHL etiketi oluştur (onay kutusu `dhl-manual-agree` ile), Bilgileri düzenle, Etiketi yazdır, Durumu yenile, Yeni gönderi, Geçmişi yenile (geçmiş sayfalama). Kısıtlar: Almanya çıkışlı 1 paket; Packstation, Postfiliale, gümrüklü bölgeler desteklenmez; AB için DHL Paket International sözleşmesi gerekir. DHL hesapları ilk okumada "yükleniyor…" durumundaydı (liste boş kaldı).
- Not: "manual" ve normal görünüm aynı `shipping` sayfası; manuel panel ayrı sayfa değil, aynı sayfada bölüm.

### returns — İadeler
- Amaç: DHL iade etiketlerinden başlayarak iade yaşam döngüsünü (ürün geldi, ödeme, tekrar gönderim, sorun, çözüm) takip etmek.
- Parametreler: `view` (all, labels, received, paid, unpaid, waiting_product, resent, issues, resolved), `q`, `company`/`warehouse`/`platform` (API sorgusunda), `p`, `lang`.
- Sekmeler ve sayılar (all görünümü): Tüm iadeler 79 · Açık iadeler 79 · DHL iade etiketi 79 · Ürün geldi 0 · Müşteriye ödendi 0 · Ödeme bekleyen 0 · Tekrar gönderildi 0 · Müşteri ürün bekliyor 0 · Sorun bekleyen 0 · Geciken 0 · Çözülen iadeler 0.
- Satır (`return-row`, 25/sayfa, 4 sayfa): sipariş no, müşteri adı, şirket · mağaza, ürün, depo, rozetler "DHL iade etiketi hazır", iade takip no ("↩ …"), "Açık", "Müşteriden ürün bekleniyor", "Henüz kontrol edilmedi"; düğme "İncele / işle" (`data-open`, "İade ayrıntısı" diyaloğu açar; diyalog içeriği tıklanmadan görülemedi). İlk sayfadaki 25 kaydın hepsinde aynı dört rozet.
- Düğmeler: Yenile, "＋ İade kaydı aç" (elle iade kaydı), Ara, Temizle ("Firma / platform / depo" filtresi).
- Altbilgi: DHL etiketleri otomatik listelenir; etiket oluşması ürünün geldiği ya da ödeme yapıldığı anlamına gelmez; durum kaydı stok, fatura veya para hareketi oluşturmaz.
- Veri `/api/returns.php` ile geliyor; ilk iki açılışta (~18 sn) "İadeler yükleniyor…" kaldı, üçüncüde ~30 sn sonra doldu. `view=issues` açılışında liste dolmadı (aynı bekleme). Diğer görünümler (received, paid, unpaid, waiting_product, resent, resolved) açılmadı; sayaçlara göre 0 kayıt.

### warehouse-orders — Depo siparişleri
- `?page=warehouse-orders&warehouse=1&view=customers`: 504 Gateway time-out (iki deneme). Görülemedi. Başka ekranlardan görülen: `page=warehouse-orders&warehouse=N&channel=N&view=orders&channel_order_q=…` (sorunlu sipariş kartlarından), `shipping` sayfası "Depo siparişleri →" bağlantısı.

### order-summary — Sipariş özeti (kartlar)
- Amaç: son 24 saat / önceki 24 saat / 7 gün / 1 ay sipariş ve ciro özeti, platform ve şirket kırılımı, en çok satan ürünler.
- Parametre: `view=cards`, `lang`. Kapsam: 4 depo · 11 firma · 14 platform · 41 satış kanalı; zaman damgası "Almanya saati".
- Kartlar: Son 24 saat 152 sipariş / 13.014,08 EUR; Önceki 24 saat 141 / 13.077,53 EUR; Son 7 gün 886 / 75.664,16 EUR (+350 TRY); Son 1 ay 2.548 / 238.812,03 EUR (+TRY, USD). Her kartta "Ödendi olarak kayıtlı" tutar, "Banka · Havale / EFT" sipariş sayısı, ödendi / ödeme bekliyor / iptal-iade-kısmi / ödeme bilgisi yok kırılımı. "Siparişleri göster ↗" → `page=overview-orders&context=summary&summary_mode=cards&period=…`.
- "En çok satılan ürünler" (iadeler düşülür, iptaller dahil değil): Son 7 gün ilk 10, Son 30 gün ilk 10, Bu yıl ilk 20 — "Ürünler yükleniyor…" durumunda kaldı.
- "Veri güncelliği ve kapsam" ve "Aktarım bilgisi" açılır bölümleri; platform atlama bağlantıları (eBay 6, Kaufland 5, Shopify 4, METRO 2, Amazon 2, Webshop 4, Dealclub 1, JTL 1, JTL Shop 1, N11 1, Otto 1, Ozon 1, Trendyol 1, XML 1 kanal); şirket bazlı kartlar, her biri "Siparişleri göster ↗" (`summary_companies[]=<id>`).
- Düğmeler: Yenile. Form yok.

### tickets — Ticketlar (ortak gelen kutusu)
- Amaç: pazaryerlerinden gelen müşteri sorularını/mesajlarını tek yerde okumak ve yanıtlamak.
- Parametreler: `company` (11 şirket), `platform` (n11, trendyol, ozon, shopify, ebay, kaufland, amazon, metro, webshop), `channel` (30 mağaza), `status` (open=Yanıtımız bekleniyor, waiting=Müşteri / platform bekleniyor, closed=Kapalı / yanıtlandı, unread=Okunmamış), `q`, `from`, `to`, `ticket_page`.
- Düzen: sol liste (`ticket-row`, düğme satırları; her satırda mağaza, konu/ilk satır, zaman, ek küçük metin; 25/sayfa, "1 / 139"), sağ panel `ticket-detail` ("Bir mesaj seçin."). Üstte "Mağaza bağlantıları ve son okuma" açılır bölümü: örn. "Okuma tamamlandı · Son kontrol…, Son 28 gündeki müşteri soruları alınır."
- Düğmeler: Yenile, Filtrele, Önceki/Sonraki. Yanıtlama formu mesaj seçilmeden görünmüyor (seçmek tıklama gerektirdiği için bakılmadı).

## Varlıklar ve durumlar

- **Sipariş** (alanlar: platform sipariş no, kanal/mağaza, şirket, depo, müşteri, teslimat adresi, e-posta, telefon, ürün satırları [başlık, satış anındaki ad, SKU, EAN, adet], tarih, tutar+para birimi, ödeme yöntemi, ödeme durumu, sipariş durumu, tedarik tipi [fiziki/dropship], etiket durumu, takip, not/sorun).
  - Sipariş durumu (filtre): Yeni → Hazırlanıyor (processing; eBay/Kaufland sayfalarında "İşlemde") → Tamamlandı (complete) ; İptal / iade (cancelled). Bu geçişlerin tetikleyicisi ekranda görünmedi.
  - Ödeme durumu: Ödendi, Kartla ödendi, Havaleyle ödendi, Banka havalesi bekleniyor, Ödeme bekleniyor, Kısmen ödendi, İade edildi, Kısmen iade edildi, Ödeme iptal edildi, Ödeme başarısız, Ödeme süresi doldu.
  - Gönderim (dispatch): tümü, gönderilmeyen (unshipped), 2 günü aşan (overdue).
  - Etiket (order_label): oluşturulamayan (review), bugün oluşturulan, hazır PDF.
  - Tedarik tipi (order_supply): physical, dropship, asterbuy, bueroarena, b2buhren, watchimport.
- **DHL etiketi**: sipariş başına gidiş etiketi + ayrı iade etiketi; durumlar "etiket hazır", "oluşturulamadı", "PDF hazır"; yeniden oluşturma ("Yenilenen etiket / durum"); ücretli (sözleşme ücreti).
- **Asterbuy siparişi**: Oluşturulacak → Ödeme bekliyor → Takip bekliyor / aktarılıyor → Takip aktarıldı ; ayrıca Kontrol edilecek (hata/inceleme, tahmin).
- **Sorun/Not (operasyonel not)**: sipariş veya ürün kaydına bağlı; neden (10 değer), durum Açık → Çözüldü (çözülen 10 gün saklanır), yazan PIN, zaman, yanıt dizisi ("Notlar / Yanıtla").
- **İade**: DHL iade etiketi ile açılır ("DHL iade etiketi hazır"); eksen 1 teslim: Müşteriden ürün bekleniyor → Ürün geldi (kontrol: "Henüz kontrol edilmedi"); eksen 2 para: Müşteriye ödendi / Ödeme bekleyen; ek durumlar Tekrar gönderildi, Sorun bekleyen, Geciken; son: Çözülen. "Ödeme ve teslim bilgileri ayrı takip edilir."
- **Depolar arası sevkiyat**: Taslak → Sevke hazır → Depodan çıktı → Yolda → Hedef depoya ulaştı → Mal kabul tamamlandı ; İptal edildi. Stok hareketi çıkış adımında, mal kabul ayrı kayıt.
- **Ticket**: mağaza, konu, zaman; durum Yanıtımız bekleniyor / Müşteri-platform bekleniyor / Kapalı-yanıtlandı / Okunmamış.
- **Şirket (11 + Elec_texx 0 kanal)**, **kanal/mağaza** (41), **depo** (5) süzgeç boyutu olarak her ekranda.

## İş akışları

1. **Sipariş girişi**: platform → panel. Shopify/JTL/JTL Shop/Amazon otomatik aktarım (kaynağı bu alanda görünmedi); eBay "Siparişleri ve stokları senkronla" (200 limit) ve Kaufland "Siparişleri Al" (100 limit) düğmeleriyle elle de çekilir; Asterbuy siparişleri 5 dakikada bir otomatik kontrol edilir.
2. **Triyaj**: `orders-pool` gelen kutusu kısayolları (Fiziki / Drop / Shopify depo / Hollanda) → durum "Yeni" → "Hazırlanıyor". Eksik/hatalı adres gibi durumda satırdan "Not / Sorun ekle" ve `problem-orders` listesine düşer.
3. **Toplama ve etiket**: `shipping` (şirket/DHL hesabı seç → siparişleri getir → seç → "Toplama listesi" → "Seçilenler · DHL etiket" / "Hazır etiketleri toplu yazdır") veya sipariş satırında "Etiket yazdır". Başarısız etiketler "Oluşturulamayanlar" filtresinde toplanır; "Seçilenleri yeniden oluştur" ile toplu tekrar.
4. **Başka taşıyıcı**: satırdan "Harici kargo / Takip numarası ekle"; dropship için tedarikçi takip no girişi (DHL, DPD, GLS, Hermes, UPS, FedEx, PostNL).
5. **Fatura**: satırdan Fatura yazdır / Faturayı düzenle / Fatura gönder; toplu: `shipping` → "Toplu fatura · PDF / e-posta"; iade için "İade faturası".
6. **Dropship (Asterbuy)**: Oluşturulacak → Ödeme bekliyor → takip alınır (4 saatte bir) → satış kanalına işlenir → Takip aktarıldı.
7. **Depo içi sevk**: `shipments` → plan taslağı → "Depodan çıkar" (stok hareketi) → Yolda → hedef depoda mal kabul.
8. **İade**: müşteri iadesi → DHL iade etiketi otomatik listelenir (`returns`) → "İncele / işle" → ürün geldi kontrolü → müşteriye ödeme / tekrar gönderim / sorun → çözüldü. "İade faturası" siparişten ayrıca kesilir.
9. **Destek**: `tickets` (mağaza soruları, son 28 gün) → mesaj seç → yanıtla (tahmin); sipariş kaynaklı sorunlar `problem-orders` notlarında.
10. **Raporlama**: `order-summary` (24 saat / 7 gün / 1 ay), `orders-pool` "Excel dışa aktar", kanal sayfalarında CSV/Excel + "Muhasebe Kaydı".

## erp_action listesi

Bu alandaki sayfalarda sayfa içeriğine ait yalnız bir `erp_action` formu görüldü; geri kalan işlemler `data-*` düğmeleri ve `/api/*.php` ile çalışıyor. `orders-pool` içinde gömülü global modallardan okunan değerler aşağıdadır (hiçbiri tetiklenmedi).

| erp_action / uç | Ekran | Ne yapar (görünen) |
|---|---|---|
| `shipment_create` | shipments | Depolar arası taslak sevkiyat planı oluşturur |
| `logout` | tüm sayfalar (üst çubuk) | Oturumu kapatır |
| `add_warehouse` | orders-pool (global modal, `return_page=warehouses`) | Depo ekler |
| `add_supplier` | orders-pool (global modal) | Tedarikçi kartı ekler/günceller |
| `add_company` | orders-pool (global modal) | Şirket kartı ekler/bağlar |
| `add_stock` | orders-pool (global modal) | Fiziksel/dropship stok girişi |
| `quick_update_inventory` | orders-pool (global modal) | Fiyat ve stok hızlı güncelleme |
| `add_category` | orders-pool (global modal) | Kategori ekler |
| POST `/api/orders-export.php` | orders-pool, orders-ebay, orders-kaufland | Siparişleri Excel olarak dışa aktarır (tarih, depo, şirket, kaynak, saat dilimi) |
| POST `/api/ebay-oauth-start.php` | orders-ebay | eBay yetkisini yeniler |
| `data-action=fetch-ebay-orders` | orders-ebay | eBay siparişlerini ve stoklarını çeker (limit 200) |
| `data-action=fetch-kaufland-orders` | orders-kaufland | Kaufland siparişlerini çeker (limit 100, `channel-id`) |
| `data-dhl-order`, `data-dhl-download`, `data-dhl-settings`, `data-dhl-recreate`, `data-rcb-*` | orders-pool, kanal sayfaları, shipping | DHL etiketi yazdır / PDF / ayar / yeniden oluştur / toplu seçim |
| `data-external-tracking-order` | orders-pool | Harici taşıyıcı ve takip no ekler |
| `data-invoice-order`, `data-invoice-edit-order`, `data-invoice-return-order`, `data-invoice-intent` | orders-pool | Fatura yazdır / düzenle / gönder / iade faturası |
| `data-customer-edit` | orders-pool, asterbuy-orders | Müşteri bilgisi düzenler |
| `data-pack-action` | shipping | Toplama listesi, toplu fatura |
| `data-open` | returns | İade ayrıntı diyaloğunu açar |
| `message_action=send` | orders-pool (global modal, hidden) | Depolara mesaj gönderir (form GET; ad `message_action`, `erp_action` yok) |

## Sorunlar ve yeniden tasarım notları

- **Yavaş liste uçları** (asterbuy-orders, problem-orders, returns, tickets, shipping hesap listesi): sayfa hemen açılıyor ama `/api/asterbuy-orders.php`, `operational-notes.php`, `returns.php` 15-30 sn sonra yanıt veriyor; bu sürede "yükleniyor…" metni kalıyor, hata/zaman aşımı mesajı yok. Menü sayaçları (`menu-counts.php`, `product-pool-count.php`, `warehouse-messages.php`) çağrıları eş zamanlı iptal edilip yeniden deneniyor (`ERR_ABORTED`). Yeni tasarım: iskelet yükleme, zaman aşımı + yeniden dene mesajı, sayaçları tek çağrıya indirme.
- **504 hatası**: `/allordersfilter` ve `warehouse-orders&view=customers` iki denemede de 504 verdi. Kullanıcıya ham Cloudflare hata sayfası düşüyor (panel kabuğu yok).
- **Tutarsız sayılar** (orders-pool): "Fiziki siparişler 208" ve "Fiziki stok siparişleri 102+" ile `order_inbox=1&physical` görünümündeki 26 sipariş uyuşmuyor; "Gönderilmeyenler" filtresi ile "Tüm siparişler" aynı 14.258'i veriyor.
- **Sipariş detay sayfası yok**: sipariş no Shopify admin'e (dış) gidiyor; sorunlu sipariş kartındaki "Siparişi aç →" `warehouse-orders … load_list=1` adresine gidiyor (güvenlik kuralı nedeniyle açılmadı). Her şey satır içi genişleyen alanlarda; satır çok yoğun (müşteri, adres, ödeme, ürün, sekiz+ düğme).
- **Aynı işin birden çok yeri**: sipariş listesi `orders-pool`, `orders-ebay`, `orders-kaufland`, `warehouse-orders`, `company-home&view=orders` ve `shipping` içinde tekrar ediyor; benzer filtre ve satır şablonu üç yerde kopya. Sipariş özeti için `order-summary` ve `overview-orders` ayrı.
- **İsimlendirme karışıklığı**: `shipments` = depolar arası sevkiyat, `shipping` = DHL etiketi; kullanıcı için aynı kelime. Menüde "Gönderilmeyenler", "İşlem bekleyen siparişler", "Tüm siparişler" hem üst filtre hem gelen kutusu kısayolu olarak geçiyor.
- **İadeler hiç ilerlememiş görünüyor**: 79 kaydın 79'u "Açık · Müşteriden ürün bekleniyor · Henüz kontrol edilmedi"; "Ürün geldi" dahil tüm diğer sayaçlar 0. Ya süreç panelde yürütülmüyor ya da durum güncellenmiyor (tahmin). Kayıtlar DHL etiketinden otomatik doğuyor; iade sebebi/ödeme tutarı sütunu yok.
- **Çoğu eylem tek bir aşırı yüklü satır menüsünde**: Etiket yazdır, PDF, Ağırlık/ayarlar, Harici takip, Fatura yaz/düzenle/gönder, İade faturası aynı açılır alanda; "Etiket yazdır" ücretli işlem (ipucu metni: DHL sözleşme ücreti) ama yalnızca fare üstü ipucunda belirtiliyor.
- **Satır görselinde kişisel veri** (e-posta, telefon, adres) toplu listelenir, kolaylıkla ekran görüntüsüne düşer; "Müşteri bilgileri" kapalı olsa da DOM'da açık.
- **Ticket sayısı çelişkisi**: genel bakış "450 açık ticket" diyor, `tickets` 139 sayfa (≈3.400) listeliyor (son 28 gün, kapalılar dahil). Satırlarda durum rozeti yok (rozet sınıfı bulunamadı), "Okunmamış" ayırt edilemiyor.
- **eBay senkron uyarısı kalıcı**: "Senkronun bazı adımları tamamlanamadı… 18 stok kaydı eşleştirme/kontrol bekliyor" bandı; hangi adımın düştüğü gösterilmiyor.
- **Kâr / zarar kartı boş** (Kaufland: "—"), maliyet/komisyon verisi bekleniyor.
- **Dil karışıklığı**: arayüz TR, ama veri/rozetler Almanca ("NEU", "Handelt es sich…", "Adres eksik / hatalı — Haus nr fehlt").
- **Çoklu para birimi** özet kartlarında "+2 para birimi" ile gizleniyor; toplamı görmek için ayrıca açmak gerekiyor.
- Sayfa metinleri talimat içermedi; sayfalardan gelen herhangi bir komut yok.

## Görülemeyenler

- `/allordersfilter`: 504, iki deneme.
- `warehouse-orders&warehouse=1&view=customers`: 504, iki deneme. (Sipariş görünümü `view=orders` ayrıca `load_list` içerdiği için açılmadı.)
- Sipariş detay sayfası: sayfa içi düz `<a>` bağlantısı yok (sipariş no dış Shopify'a, "Siparişi aç" `load_list` içeren adrese gidiyor); açılmadı.
- `problem-orders&status=resolved`: ~10 sn beklemede liste dolmadı; çözülmüş kayıtlar görülemedi.
- `returns` diğer görünümleri (labels, received, paid, unpaid, waiting_product, resent, resolved): açılmadı; sayaçlara göre 0 kayıt. `view=issues` açıldı fakat ~18 sn içinde dolmadı. İade ayrıntı diyaloğu ve "İade kaydı aç" formu tıklama gerektirdiği için içeriği görülemedi.
- `tickets`: mesaj detayı ve yanıt formu (tıklama gerekir); `asterbuy-orders`: satır düğmeleri dışında detay yok.
- `orders-pool` kaynak/chip varyantlarından yalnız üç kombinasyon denendi; DE dili ve sayfa 2+ denenmedi.
- DHL hesap açılır listesi (`shipping`): içeriği yüklenmedi; hangi şirket/DHL hesapları olduğu görülemedi.
- Tüm sayfalar yalnız okuma ile gezildi; hiçbir düğmeye basılmadı, form gönderilmedi.
