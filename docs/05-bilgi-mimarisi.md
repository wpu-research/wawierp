# WawiERP Bilgi Mimarisi — Menü, Erişim Yolları, Adlandırma, Mobil

Tarih: 2026-11-14 · Kaynak: yalnız yerel belgeler (`docs/03-panel-analizi.md`, `docs/04-kavram-koprusu.md`, `docs/07-api-yuzeyi.md`, `raw/panel-harita.md`, `docs/panel/01…05`) ve daha önce indirilmiş statik ön yüz dosyaları (`mobile-workspace.js`, `mobile-list-workspace.js`, `sidebar-position.js`, `topbar-sections.js`, `sidebar-search.js`, `menu-counts.js`; yalnız okundu, çalıştırılmadı). Bu turda canlı siteye istek atılmadı. Kenar menünün ham HTML'i hiçbir belgede kayıtlı değil; menü ağacı **JS'in aradığı düğüm adlarından, sayfalardaki bağlantılardan ve belge metinlerinden yeniden kurulmuştur**. Her çıkarım "görüldü" (belgede ya da JS'te doğrudan yazıyor) veya "tahmin" (çıkarım) diye işaretlidir.

## 1. Menü ağacı

### 1.1 Üç gezinme yüzeyi
| Yüzey | Ne | İşaret |
|---|---|---|
| Kenar menü (`#erpSidebar`, içinde `#sidebarNavigation`, `.sidebar-organized`) | Sunucuda çizilen, izin filtreli ana menü; `details/summary` grupları; menü araması (`#sidebarMenuSearch`) | görüldü (JS) |
| Üst çubuk bölümleri (`[data-section-navigation]`, `topbar-sections.js`) | Kenar menüden ve bir `<template data-topbar-worklists>` içinden kopyalanan açılır paneller: Siparişler, Ürünler, Şirketler, eBay, Kaufland, Amazon, Shopify, Diğer | görüldü (JS) |
| Sayfa içi bağlantılar ve sekmeler | `company-home` sekmeleri (`otto_tab`, `amazon_tab`, `view`), `warehouse` `product_view` değerleri, `orders-pool` gelen kutusu kısayolları | görüldü (belgeler) |

JS yorumu: aynı hedefler "şirket menüsünde ve satış kanalı dizininde" iki kez bulunuyor ("Identical destinations exist in the company menu and sales-channel index"); `sidebar-position.js` bu yüzden yer imini `card:<ad>/link:<adres>` biçiminde tutuyor, ayrıca "üç erişim yolu" (company menu, sales-channel index, üçüncüsü adlandırılmamış) ifadesi geçiyor (görüldü). Üçüncü yolun ne olduğu bilinmiyor.

### 1.2 Kenar menü bölümleri (`data-nav-section`)
JS'te adı geçen bölüm anahtarları (görüldü): `orders`, `products`, `companies`, `platforms`, `marketplaces`, `management`, `operations`; bunların dışındaki bölümler üst çubukta "Diğer"e düşüyor. Ayrıca `data-nav-family-heading` başlıkları ve iki başlık grubu: `heading:german` (Almanya platformları) ve `heading:turkish` (Türkiye pazaryerleri) (görüldü). Satış kanalı kartları (`data-menu-card`): `sales-ebay`, `sales-kaufland`, `sales-amazon`, `sales-shopify`, `sales-metro`, `sales-otto`, `sales-webshop`, `sales-ozon`, `sales-trendyol`, `sales-n11` (görüldü). Şirket grupları: `company:<id>` altında `platform:<ad>` ve `stock` alt grubu (görüldü).

### 1.3 Yeniden kurulan menü ağacı
Bölümlere hangi sayfanın hangi başlık altında durduğu **kesin değil**; aşağıda sayfa türü + belgedeki bağlantı ilişkisinden kurulmuş taslak var. Sütun "İşaret" yerleşimin kendisi içindir.

```
Genel bakış (overview)                                        [görüldü: giriş sayfası]
├─ Siparişler  (data-nav-section=orders)                      [bölüm adı görüldü, içerik tahmin]
│   ├─ Birleşik sipariş havuzu (orders-pool) + gelen kutusu kısayolları
│   │     Tüm siparişler · Drop Auto · Fiziki · 2 günü aşan fiziki · Fiziki stok ·
│   │     Shopify (Mixoutlet, Lady Toner) · Drop Asterbuy · Drop BueroArena/Kosatec ·
│   │     B2B Uhren · Watch Import · BueroArena · Hollanda        [görüldü: sayaçlı kısayollar]
│   ├─ Asterbuy siparişleri (asterbuy-orders)
│   ├─ Sorunlu siparişler (problem-orders; açık/çözülen)
│   ├─ eBay siparişleri (orders-ebay) · Kaufland siparişleri (orders-kaufland)
│   ├─ Depo siparişleri (warehouse-orders)
│   ├─ Sipariş özeti (order-summary, overview-orders)
│   ├─ İadeler (returns; 9 görünüm)
│   ├─ Kargo (shipping: DHL merkezi, siparişsiz etiket) · Depolar arası sevkiyat (shipments)
│   └─ Ticketlar (tickets)
├─ Ürünler  (data-nav-section=products)                        [bölüm adı görüldü, içerik tahmin]
│   ├─ Depo ürün listesi (warehouse; Ürün havuzu / Stok yönetimi; ≥15 product_view)
│   ├─ Kaynak ürün kataloğu (products) · JTL kaynağı (pool)
│   ├─ Stok hareketleri · Stok dağıtımı (stock-transfer) · Fiziki stok kontrolü · Kritik stok
│   ├─ Toplu ürün (bulk-products) · Toplu fiyat (bulk-prices)
│   ├─ Eksik EAN · Eksik görsel · Sorunlu ürünler · Mükerrer ürünler
│   ├─ Katalog yönetimi (catalog-governance) · Satın alma (purchases) · Drop tedarikçi (dropshipping)
│   └─ TR market ürünleri (tr-market-products)  [her depo listesinin başında bant olarak da]
├─ Şirketler / Depolar  (data-nav-section=companies)            [bölüm adı görüldü, içerik tahmin]
│   ├─ Depo ağı (warehouses) → depo çalışma alanı (warehouse-home)
│   └─ Şirket → [company:<id>] → platform:<ad> → (ürün havuzu, gönder, siparişler, işçi listeleri)
├─ Platformlar (Almanya)  (platforms, heading:german)          [görüldü: başlık adı; içerik tahmin]
│   eBay · Kaufland · Amazon · Shopify · METRO · OTTO · Webshop (JTL-Shop) · Dealclub
├─ Pazaryerleri (Türkiye ve diğer)  (marketplaces, heading:turkish)   [görüldü: başlık adı]
│   Trendyol · N11 · Ozon
├─ Yönetim  (management)                                       [bölüm adı görüldü, içerik tahmin]
│   Müşteri ana kaydı/toptan (customers-master) · Faturalar (invoices) · Ön muhasebe (accounting) ·
│   Finans belgeleri (finance-documents) · Ekip (team) · PIN yetkileri (pin-permissions) ·
│   ERP özellikleri (erp-features) · Denetim kayıtları (audit-logs)
└─ Operasyon  (operations)                                     [bölüm adı görüldü, içerik tahmin]
    (barkodla sayım, depo mesajları vb. olabilir; bilinmiyor)
```
Menüde olduğu görülen ama açılmayan sayfa: `inventory` (görüldü, `docs/panel/02`). Üst çubuktaki karşılık: Siparişler / Ürünler / Şirketler panelleri + eBay / Kaufland / Amazon / Shopify hesap satırları (her satırda hesap adı ve ayrı "Siparişler" bağlantısı) + "Diğer" (görüldü, JS).

### 1.4 Bağlama göre değişen kısımlar
| Bağlam | Menüde / sayfada ne değişiyor | İşaret |
|---|---|---|
| Şirket | Kenar menüde şirket grupları (`company:<id>`) açılıp kapanıyor; şirket seçilince `company-home` kanal kartları ve ekmek kırıntısı değişiyor | görüldü |
| Depo | `warehouse` parametresi: depo 1 (merkez) menüsünde "Alt depo envanterini merkeze al", "Satış stok senkronu"; depo 2 menüsünde ayrıca `drop_bueroarena` görünümü; her depo listesinin üstünde TR market bandı | görüldü |
| Kanal / hesap | Menüdeki "işçi listeleri" bağlantıları her kanal-hesap için üç `kind` üretiyor (`issues`, `images`, `history`) | görüldü |
| Kanal türü | OTTO ve Amazon `company-home` içinde kendi sekme takımıyla; eBay, Kaufland, METRO, Shopify, Ozon, Trendyol ayrı sayfalarla; N11 Trendyol'dan az sekmeyle | görüldü |
| İzin | Kenar menü sunucuda izin filtreli; JS gizli (`hidden`) ve devre dışı (`aria-disabled`) bağlantıları arama ve üst çubuktan dışlıyor | görüldü (JS) |
| Sayaçlar | Menü rozetleri `menu-counts.js` (120 sn), iş listesi sayaçları (60 sn), iade sayacı, not sayacı; beş ayrı döngü | görüldü |
| Dil | TR ve DE; `lang` parametresi; menü araması sonuç sayısı metni Türkçe sabit ("N menü sonucu") | görüldü |

Oturumda tutulan menü durumu: açık/kapalı gruplar, kaydırma konumu ve çapa bağlantı `sessionStorage` içinde sayfadan gelen `data-position-key` anahtarıyla saklanıyor; ilk gelişte doğrudan bağlantı yalnız etkin bağlantının atalarını açıyor (görüldü, `sidebar-position.js`).

## 2. Ekranlara tıklama sayısı

Başlangıç = girişten sonra `overview`. Menünün ham yapısı görülemediği için kesin tık sayıları **bilinmiyor**; aşağıdaki sayılar şu kurala dayanıyor: kenar menüde grup açıksa **1**, kapalıysa **2** (grup + bağlantı) (tahmin; `sidebar-position.js` grupların kapalı başlayabildiğini gösteriyor); üst çubukta düğme + bağlantı = **2** (görüldü, JS); menü araması = yazı + **1** tık (görüldü, JS). Şirket → platform → sayfa zinciri için `company:<id>` ve `platform:<ad>` iki iç içe grup var: **3–4** (tahmin).

Belgelerde kaydedilmiş kesin bağlantılar "görüldü" olarak anılan yolu verir.

| Ekran (`page`) | Belgelerde görülen giriş yolu | Tık | İşaret |
|---|---|---|---|
| `overview` | Giriş sayfası | 0 | görüldü |
| `warehouses` | `shipments` ekranındaki "Depo ağı" bağlantısı; genel bakış depo kartları | 1–2 | görüldü (bağlantı), tık tahmin |
| `warehouse-home` | Depo kartı / `warehouses` kartı | 2 | tahmin |
| `warehouse` (Ürün havuzu) | `warehouses` kartında "Ürünler" bağlantısı | 2–3 | görüldü (bağlantı), tık tahmin |
| `warehouse&mode=stock` | `warehouse` içinde mod anahtarı | +1 | görüldü (mod var), tık tahmin |
| `warehouse-product` | Listede satır bağlantısı "Ürün detayı / Güncelle"; sipariş satırı "Ürün detayı ↗" | liste + 1 | görüldü |
| `product-detail` | `products` listesinde "Detay" | `products` + 1 | görüldü |
| `products`, `pool` | Menü; `pool` ayrıca `products`'tan ayrı | 1–2 | tahmin |
| `stock-movements`, `stock-transfer`, `physical-stock-check`, `critical-physical-stock`, `bulk-products`, `bulk-prices`, `missing-product-eans`, `missing-product-images`, `duplicate-products`, `catalog-governance`, `purchases` | Menü (depo parametresi taşıyor); `stock-transfer`'dan `purchases` ve `catalog-governance`'a bağlantı; `critical-physical-stock`'tan `physical-stock-check`'e bağlantı | 1–2; bağlantı zincirinde +1 | görüldü (bağlantı), tık tahmin |
| `problem-products`, `problem-orders` | Menü (ayrı sayfalar); sipariş satırında "⚑ Sorun / Not" yalnız notu açar | 1–2 | tahmin |
| `dropshipping` | Menü; `warehouse` ürün görünümü `drop_asterbuy` ile ayrı yol | 1–2 | tahmin |
| `asterbuy-orders` | `dropshipping` panelinde "Asterbuy sipariş havuzu" | `dropshipping` + 1 | görüldü |
| `orders-pool` | Menü; gelen kutusu kısayolları sayfa içinde | 1–2 (kısayol +1) | tahmin |
| `orders-ebay` | `send-ebay` içinde "eBay siparişleri"; menü | 2–4 | görüldü (bağlantı), tık tahmin |
| `orders-kaufland` | Menü / kanal sayfası | 2–4 | tahmin |
| `send-ebay`, `ebay-pool` | `orders-ebay` üstünde "eBay Ürün Yönetimi"; `ebay-pool` ↔ `send-ebay` bağlantılı | 3–4 | görüldü (bağlantı), tık tahmin |
| `send-kaufland`, `metro`, `shopify-pool`, `send-shopify`, `ozon-pool`, `send-ozon`, `tr-market`, `tr-market-products`, `mixoutlet-payments` | Şirket → platform grupları veya `data-menu-card` kartları | 2–4 | tahmin |
| `company-home` (OTTO/Amazon sekmeleri) | Şirket → platform menüsü; sekme +1 | 3–5 | tahmin |
| `channel-worklist` | Menüdeki "işçi listeleri" bağlantıları; `issues` ↔ `history` sayfa içi bağlantı | 3–4 | görüldü (bağlantı), tık tahmin |
| `shipping` | Menü; sipariş sayfasında satır düğmeleri aynı işi ayrıca yapar | 1–2 | tahmin |
| `shipments` | `erp-features`, `finance-documents` bağlantıları | 1–3 | görüldü (bağlantı), tık tahmin |
| `returns` | Menü + üstte iade sayacı (`returns-menu.js`) | 1–2 | görüldü (sayaç), tık tahmin |
| `tickets` | Menü; Shopify çubuğunda "Ticketlar" bağlantısı | 1–2 | görüldü (bağlantı), tık tahmin |
| `order-summary`, `overview-orders` | `order-summary` kartlarından "Siparişleri göster" → `overview-orders` | 1–2; +1 | görüldü (bağlantı), tık tahmin |
| `invoices` | Menü; `invoices?task=prepare` sayfa içi | 1–2 | tahmin |
| `finance-documents`, `accounting`, `customers-master`, `team`, `pin-permissions`, `erp-features`, `audit-logs` | Menü; `accounting` kartlarından `purchases`, `finance-documents`, `warehouse-home#sales-stock-sync`, `audit-logs`'a kısayol | 1–2 | görüldü (bağlantı), tık tahmin |
| `pin-permissions` içeriği | Master PIN arkasında | bilinmiyor | görüldü |
| `/allordersfilter` | Hangi menüden açıldığı bilinmiyor | bilinmiyor | görüldü |
| `inventory` | Menüde var | bilinmiyor | görüldü |

Not: Derin bağlantılı sayfalarda (`warehouse` iki aşamalı yüklemesi) kullanıcı için ek bir otomatik yönlendirme var (`load_list=1`); tıklama sayısını değiştirmiyor ama geri düğmesini bozuyor (görüldü, `docs/panel/02`).

## 3. Aynı işe giden yinelenen yollar

| İş | Yollar | Kaynak / işaret |
|---|---|---|
| Sipariş listesi | `orders-pool`, `orders-ebay`, `orders-kaufland`, `warehouse-orders`, `company-home&view=orders`, `shipping` (sipariş kartları), `metro&view=orders`, `tr-market&tab=orders`, OTTO `otto_tab=orders`, Amazon `amazon_tab=orders` | görüldü |
| Sipariş çekme / eşitleme | `orders-ebay` ("Siparişleri ve stokları senkronla"), `orders-kaufland` ("Siparişleri Al"), `accounting` ("Siparişleri al"), `company-home` ("Siparişleri yenile"), `queue_warehouse_sync` ("Stokları ve siparişleri güncelle"), kanal başına arka plan işi | görüldü |
| Sipariş özeti / rapor | `overview` satış özeti, `order-summary`, `overview-orders`, `orders-pool` "Satış özeti" + Excel, `accounting`, kanal sayfalarında CSV/Excel | görüldü |
| Ürün listesi / havuz | `warehouse`, `products`, `pool`, `send-ebay catalog=products`, `ebay-pool`, `shopify-pool`/`send-shopify`, `ozon-pool`/`send-ozon`, `tr-market-products`, `company-home&view=products`, `metro&view=pool` | görüldü |
| Ürün detayı / düzenleme | `product-detail` (salt okunur), `warehouse-product` (düzenlenebilir), satır içi düzenleyiciler, kanal sayfalarında "Ürün bilgileri / düzenle" pencereleri | görüldü |
| Stok değiştirme | `add_stock` (kart), `quick_update_inventory` (tablodan), `bulk_update_inventory`, CSV/Excel (`bulk_products_preview`), barkodla sayım, `stock-transfer`, `pull_branch_stock`, kanal satırında "Stoğu güncelle" | görüldü |
| Fiyat değiştirme | `bulk-prices`, `warehouse-product` (`sale_price`), `quick_update_inventory`, `send-ebay` satırı ("Wawi fiyatını düzenle"), Shopify "Shopify fiyatı", Trendyol "Fiyatı değiştir" | görüldü |
| Eksik EAN | `missing-product-eans`, `warehouse` `product_view=physical_missing_ean`, OTTO `eans` sekmesi, `channel-worklist` `issues` sebebi "EAN 1 ve EAN 2 boş", Shopify `ean_status=missing` | görüldü |
| Eksik görsel | `missing-product-images`, OTTO `images`, `channel-worklist kind=images`, Shopify "Eksik görseli tamamla" | görüldü |
| Sorun listesi | `problem-orders`, `problem-products`, `channel-worklist kind=issues`, Kaufland `catalog=issues`, OTTO `issues`, Amazon `issues`/`safety`, METRO `failed`, `physical-stock-check` | görüldü |
| Stok geçmişi | `stock-movements`, `warehouse-product` işlem geçmişi, `stock-transfer` hareket geçmişi, `audit-logs` | görüldü |
| DHL etiketi | `orders-pool` satırı ("Etiket yazdır"), kanal sipariş sayfaları, `shipping` (toplu), `shipping` siparişsiz etiket, `dhl-recreate` / `dhl-recreate-batch` | görüldü |
| Fatura | sipariş satırı, `invoices` (`task=prepare`), `shipping` ("Toplu fatura"), `finance-documents` (`add_outbound_document`), `customers-master` (toptan satış) | görüldü |
| İade | `returns`, sipariş satırı "İade faturası", `invoices&view=returns`, OTTO `returns` sekmesi, Trendyol/N11 siparişinde "İade" durumu | görüldü |
| Destek / mesaj | `tickets`, `tr-market&tab=questions`, METRO `view=messages`, `problem-orders` notları, depo mesajları | görüldü |
| Depolar arası stok taşıma | `stock-transfer` (dağıtım), `shipments` (fiziksel sevk), `pull_branch_stock` (geri çekme) | görüldü |
| Katalog gizleme / kategori | `catalog-governance` (kapsam + arşiv), `add_category` (global modal), `product-organization` (kategori çağrıları) | görüldü |
| Aynı hedef iki menü kopyası | Şirket menüsü ve satış kanalı dizini; üst çubuk kopyaları | görüldü (JS) |
| Müşteri ana kaydı | `customers-master` (B2B cari); sipariş satırında "Müşteri bilgileri" ve `warehouse-orders view=customers`; `company-home` "Müşteriler" sekmesi | görüldü |

## 4. Adlandırma tutarsızlıkları

| Konu | Gözlem | İşaret |
|---|---|---|
| `shipments` ↔ `shipping` | `shipments` = depolar arası sevkiyat; `shipping` = DHL etiket merkezi. Kullanıcı için aynı kelime | görüldü |
| "Pool / havuz" | `orders-pool` (sipariş havuzu); `pool` (JTL kaynağı, 2.466); `warehouse` "Ürün havuzu"; genel bakışta "Wawi ürün havuzu" (232.525); `ebay-pool`, `shopify-pool`, `ozon-pool` (kanal ilan havuzu); "Ortak ürün havuzu →" bağlantısı | görüldü |
| `products` ↔ `pool` ↔ `warehouse` | `products` = "Kaynak Ürün Kataloğu" (232.526); `pool` = "JTL Kaynak Ürünleri"; `warehouse` = depo ürün kaydı (151.075). Katalog sayısı iki yerde 232.525 / 232.526 | görüldü |
| Havuz / gönder | `shopify-pool`/`send-shopify`, `ozon-pool`/`send-ozon`; eBay ve Kaufland'da aynı sayfada iki sekme; METRO'da `view=pool` / `view=send` | görüldü |
| Filtre adları | "Hedef depo fiziki stoğu" (Kaufland) / "Platform satış stoğu" (Ozon, Trendyol) / "Wawi stok türü" (company-home) | görüldü |
| Gönderilmeyenler / Tüm siparişler / İşlem bekleyen | Aynı adlar hem üst filtre hem gelen kutusu kısayolu; "Gönderilmeyenler" ile "Tüm siparişler" aynı sayıyı veriyor | görüldü |
| Durum adları | Sipariş: "Hazırlanıyor" (havuz) / "İşlemde" (eBay, Kaufland); "İptal/iade"; eBay kanal etiketi "NEU" | görüldü |
| Dil karışımı (TR/DE/EN) | Arayüz TR; veri, rozet ve hata metinleri DE ("NEU", "Haus nr fehlt"); OTTO ve Ozon'da çift etiket ("Ara / Suchen", "Aktif / Aktiv"); "Stok Alert", "Default price", "Drop", "Wawi"; "KDV / MwSt"; geçmişte ham kod (`auto_stock_policy`, `publish`, `withdraw`) | görüldü |
| Kategori adları | Karışık TR/DE ("Erkek Parfüm" ↔ "Parfum & Düfte > Herren"); marka adları kategori olarak; 411 (katalog yönetimi) ↔ 1.139 (ürün sayfası) kategori | görüldü |
| Şirket / mağaza / kanal / hesap | Dört ayrı kavram; kullanıcı arayüzünde "mağaza", "kanal", "hesap", "platform" birbirinin yerine geçiyor ("Hedef hesap", "Gönderilecek eBay mağazası", "Hedef Metro hesabı / firma") | görüldü |
| Ticket | Menüde "Ticketlar"; içerik pazaryeri müşteri soruları; Trendyol'da ayrıca "Müşteri soruları" (`questions`) | görüldü |
| Hesap parametresi | `account=<id>` bazı sayfalarda kimlik, eBay işçi listelerinde `0`, METRO'da yok sayılıyor | görüldü |
| Belge türü | İade faturası (`RET-…`) defterde "Depo sevk belgesi (SV)" etiketiyle; `RE-` ↔ eski `WAWI-` ön eki | görüldü |
| `all` seçicisi | Fatura listesinde `all=0` seçili depo, `all=1` tüm depolar; etiket ters çağrışımlı | görüldü |
| Depo adı | "Technowelt Almanya" (depo) ↔ "Technowelt" (şirket); "Mega B" (depo) ↔ "Elec_texx" (şirket) | görüldü |
| Sorunlu | `problem-orders`, `problem-products`, "Sorunlu Fiziki Ürünler" (`physical-stock-check`), "Sorunlu Ürünler" (kanal sekmeleri): dört farklı kapsam | görüldü |

## 5. Rol başına menü

- Görülen oturum: **yalnız "Sistem yöneticisi"** (ana yönetici). Diğer rollerin menüsü bu turda ve önceki turlarda hiç görülmedi (görüldü).
- `team` ekranında 16 çalışan; rol etiketleri: Sistem yöneticisi, Kategori atama yöneticisi, Kategori sorumlusu, Depo sorumlusu, Depo çalışanı, Wawi operasyon, Ürün giriş operatörü; kapsam etiketleri: Tüm depolar, Çoklu depo yetkisi, Depo erişimi/seçimi, yetki türü "Ürün ve stok" / "Görüntüleme" (görüldü).
- Menünün role göre nasıl daraldığı: kenar menü ve arama "izin filtreli, sunucuda çizilmiş" (JS yorumu, görüldü); hangi rolde hangi bağlantının gizlendiği **bilinmiyor**. Yetkisiz bir bağlantı gizli (`hidden`) veya devre dışı (`aria-disabled`) olarak işaretleniyor (görüldü, JS).
- Rol × menü matrisi için tek ipucu: "Çalışan PIN ile girer; tüm ağ veya tek depo kapsamı ve ürün-stok yetkisi oturuma uygulanır." (`erp-features`) — yani depo kapsamı menüdeki depo seçeneklerini daraltıyor olmalı (tahmin).
- `pin-permissions` master PIN ister; yönetici oturumu menüde bu girişi görüyor ama içeriği açılmıyor (görüldü). Denetimde "Yetkisiz API erişimi engellendi" kayıtları var: menü gizlemesi tek başına sınır değil, sunucu da reddediyor (görüldü).
- Granül görev izni yok; "Ayrıntılı görev izinleri" hazırlanıyor listesinde (görüldü).
- Müşteri portalı (B2B) ayrı kullanıcı türü: yalnız kendi lokasyon stoğu, fatura, cari; menüsü bu çalışmada görülmedi (bilinmiyor).

## 6. Mobil notları

Kaynak: yalnız JS (CSS indirilmedi; `docs/07` bu notun bu belgede beklediğini söylüyor). Kesme noktası: `matchMedia('(max-width: 860px)')` (görüldü).

| Dosya | Davranış | İşaret |
|---|---|---|
| `mobile-workspace.js` | Kenar menüyü çekmeceye (drawer) çevirir: başlıkta "Menü" ve kapat düğmesi, arka plan perdesi; menü açıkken ana kabuk ve alt çubuk `inert`, kenar menü mobilde kapalıyken `inert`; Esc kapatır, Tab odak tuzağı, odak geri döner; alt çubuk (`.wawi-mobile-dock`) menü düğmesi mevcut menü düğmesine tıklatır; `data-mobile-panel-toggle` düğmeleri tek seferde tek panel açar (`body.dataset.mobilePanel`); `search` paneli açılınca `#mobileWorkspaceSearch` içindeki arama kutusuna odaklanır. Yalnız sunum: "navigation never changes account, stock or order scope". Dil `lang` ile TR/DE | görüldü |
| `mobile-list-workspace.js` | Liste ekranlarında filtreleri "Filtreler · N +/−" düğmesinin arkasına katlar; etkin filtreleri çip olarak gösterir ("Tüm kayıtlar" varsayılan); sipariş listesinde "Excel dışa aktar", "İşlemler / sipariş bilgileri", "Toplu seçim ve kargo işlemleri", "Kargo / fatura işlemleri", "Satış özeti" bölümlerini `details` içine katlar; kanal süzgeci "Platform / mağaza seç" katlanır. Mevcut formlar, alan adları, bağlantılar ve işleyiciler korunur; yeni istek yok | görüldü |
| `sidebar-position.js` | Grup açık/kapalı, kaydırma ve çapa durumu yalnız bu sekmede `sessionStorage`'da; masaüstü ve mobilde aynı | görüldü |
| `topbar-sections.js` | Üst çubuk bölümleri (Siparişler, Ürünler, Şirketler, eBay, Kaufland, Amazon, Shopify, Diğer) açılır panel olarak; panel genişliği en çok 390/350 px, `window.innerWidth − 24` ile sınırlı; mobil çekmece düğmesine basılınca panel kapanır. Mobil için ayrı kesme noktası bu dosyada yok | görüldü |
| `sidebar-search.js` | Menü araması yalnız sunucuda çizilmiş, izin filtreli menüde çalışır; Türkçe harf normalleştirme (İ/ı), kelime kelime eşleşme; grup ve başlıkları sonuca göre gizler/açar; arama bitince önceki açık/kapalı durumu geri yükler; uzak veri yok | görüldü |

Çıkarımlar:
- Mobil çözüm "ayrı mobil sayfa" değil, aynı sayfaya JS ile katlama/çekmece (tahmin: kod yapısından). Bu nedenle 43 betik ve ~857 KB her mobil sayfa yüklemesinde de iniyor (görüldü, `docs/panel/05`).
- Liste satırlarındaki yoğun düğme ve müşteri bilgisi bloğu mobilde yalnız katlanıyor, sadeleşmiyor (tahmin).
- Dokunmatik hedef boyutu, tablo kaydırma, yazı ölçeği, klavye davranışı: CSS okunmadığı için **bilinmiyor**.
- Menü arama + üst çubuk + çekmece aynı menü ağacının üç kopyası; kopyalarda kimlik/`aria` nitelikleri temizleniyor (görüldü, `cleanClone`), ama kopyalar arası durum (açık/kapalı) senkron tutulmuyor (tahmin).

## 7. Yeniden tasarım için bilgi mimarisi önerileri (öneri, karar değil)
1. Tek menü modeli, tek veri kaynağı: kenar, üst çubuk ve çekmece aynı yapıdan çizilsin; yinelenen hedefler kalksın.
2. Bağlam anahtarı (şirket · depo · kanal) rotada tek yerde; kanal değişince bağlam kaymasın.
3. Sipariş, ürün, stok, sorun, destek için her biri tek liste + durum/kanal süzgeci; kanal başına ayrı havuz sayfası yerine kanal bağdaştırıcısı.
4. `shipments` → "Depo transferi", `shipping` → "Kargo etiketleri"; "pool" yalnız tek anlam; ürün için tek "Katalog" adı.
5. Rol × depo × modül yetki matrisi önce belgelensin (bugün bilinmiyor).
6. Mobil: sütunlu tabloları kart listesine, satır eylemlerini ikincil menüye taşıyan duyarlı bileşenler; sayfa başına yalnız gereken betik.

## Görülemeyenler / Sınırlar
- Kenar menünün ham HTML'i ve gerçek başlık/sıra bilgisi hiçbir belgede yok; §1.3 ağacındaki **yerleşim tahmindir**, yalnız bölüm anahtarları ve kart adları JS'ten görülmüştür.
- Menü etiketlerinin tam metni, sıralaması ve rozet sayaçlarının hangi bağlantıda durduğu bilinmiyor.
- Tıklama sayıları ölçülmedi; §2 sayıları kurala dayalı tahmindir, yalnız bağlantı varlığı görüldü.
- Sistem yöneticisi dışındaki rollerin menüsü, B2B müşteri portalının menüsü görülmedi.
- `/allordersfilter` ve `inventory` sayfalarının menüdeki yeri/içeriği bilinmiyor; `warehouse-orders` müşteri görünümü 504 verdi.
- "Üçüncü erişim yolu" (JS yorumundaki üç yoldan biri) bilinmiyor.
- CSS (`/assets/*.css`) incelenmedi; mobil yerleşim, görsel hiyerarşi, dokunma hedefleri bilinmiyor. Mobil davranış yalnız JS'ten çıkarıldı, gerçek cihazda denenmedi.
- `session-status.php` ve satır içi betikler (HTML kaynağı) okunmadı; menüyle ilgili ek davranış olabilir.
- Hiçbir ekran bu turda yeniden açılmadı; sayılar ve adlar belgelerin yazıldığı andaki (2026-11-14) canlı veriden.
