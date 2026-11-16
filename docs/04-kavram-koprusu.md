# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-16 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1923 düğüm · 5367 kenar · 89 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4937, INFERRED 429

Küme adları otomatik verilir: kümenin en çok bağlantılı iki kavramının adıdır.

## Düğüm kimlik kuralları

| Tür | Kimlik deseni |
|---|---|
| Eski panel ekranı | `raw_panel_harita_page_<ad>` |
| Depo | `raw_panel_harita_depo_<ad>` |
| Şirket | `raw_panel_harita_sirket_<ad>` |
| Eski panel API ucu | `docs_panel_05_on_yuz_mimarisi_api_<ad>` |
| Eski panel JS dosyası | `docs_panel_05_on_yuz_mimarisi_js_<ad>` |
| Form eylemi | `erp_action_<değer>` |
| Karar | `kararlar_<numara_ad>_<kavram>` |
| Mock panel kodu | `yeni_panel_mock_src_<dosya>_<sembol>` (AST) |

## Kümeler (en büyük 40)

| # | Küme | Düğüm | Uyum | Merkez kavramlar |
|---|---|---|---|---|
| 0 | data.ts / store.tsx | 94 | 0.05 | data.ts · store.tsx · Extra.tsx · Orders.tsx |
| 1 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 91 | 0.05 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: accounting — ön muhasebe |
| 2 | App.tsx / Badge() | 83 | 0.12 | App.tsx · Badge() · useStore() · Card() |
| 3 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 66 | 0.05 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 4 | invoices / customers-master | 65 | 0.05 | Ekran: invoices — faturalar · Ekran: customers-master — müşteri ana kaydı · Ekran: finance-documents — finans belgeleri · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş |
| 5 | warehouse / warehouse_product | 63 | 0.07 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu |
| 6 | Agent.tsx / Catalog.tsx | 62 | 0.07 | Agent.tsx · Catalog.tsx · fmtNum() · account() |
| 7 | server.mjs / assistant.mjs | 57 | 0.05 | server.mjs · assistant.mjs · handle() · Sunum yayını: /sunum/ adresi şifresiz, herkese açık (15. |
| 8 | team / Belge 09 Güvenlik ve Uyum | 49 | 0.06 | Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi · Ekran: pin-permissions — PIN yetkileri |
| 9 | orders-pool / Sipariş | 44 | 0.06 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · İade (DHL iade etiketinden otomatik doğar) |
| 10 | Automation.tsx / Overview.tsx | 42 | 0.09 | Automation.tsx · Overview.tsx · Notifications.tsx · ago() |
| 11 | video-uret.py / time | 40 | 0.11 | video-uret.py · time · go() · scroll() |
| 12 | warehouse-home / overview | 39 | 0.15 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 13 | Selling.tsx / Money.tsx | 39 | 0.10 | Selling.tsx · Money.tsx · fmtMoney() · PriceRules() |
| 14 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 37 | 0.12 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price |
| 15 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 37 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 16 | ui.tsx / Reservations.tsx | 37 | 0.09 | ui.tsx · Reservations.tsx · Warehouse.tsx · react |
| 17 | photos.ts / PHOTO | 37 | 0.05 | photos.ts · PHOTO · yeni_panel_mock_src_assets_products_00 · yeni_panel_mock_src_assets_products_01 |
| 18 | Platform.tsx / Channels.tsx | 34 | 0.07 | Platform.tsx · Channels.tsx · Tone · JOB |
| 19 | Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos | 32 | 0.10 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: product-market-prices.js — Pazaryeri fiyat karşılaşt · Öneri: modüler yükleme, ES modülleri/TypeScript, tek ver |
| 20 | Beyin katmanı / WawiERP Claude Kuralları | 30 | 0.14 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 21 | WawiERP / Entegrasyonlar: mevcut | 30 | 0.11 | WawiERP (wawib2b.com) · Entegrasyonlar: mevcut (19) · Hedef pazar: Almanya / DE · JTL-Wawi entegrasyonu (mevcut) |
| 22 | /api/menu-counts.php / Sayac/oturum uclari | 29 | 0.12 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 23 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 29 | 0.14 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 24 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 25 | 0.19 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 25 | /api/dhl-labels.php / dhl-labels.js | 25 | 0.11 | API: /api/dhl-labels.php · JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluş · JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ü · JS: dhl-recreate.js — Tek sipariş DHL etiketi yeniden ol |
| 26 | Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt | 25 | 0.14 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi · Hazırla, onayla düzeyi (varsayılan) |
| 27 | Landing.tsx / Landing() | 25 | 0.12 | Landing.tsx · Landing() · landing-main.tsx · Head() |
| 28 | Dropshipping stok modeli / purchases | 24 | 0.14 | Dropshipping stok modeli · Ekran: purchases — satın alma ve mal kabul · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV · İş akışı 6: Drop ürün / Asterbuy akışı |
| 29 | Sunum: WawiERP Rakipler ve Yol Har / Pazar haritası: odak | 24 | 0.20 | Sunum: WawiERP Rakipler ve Yol Haritası · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral · Yetenek karşılaştırması (✓ ~ ✗ ? işaretli tablo) |
| 30 | Yeni panel mock / Bildirim merkezi | 24 | 0.10 | Yeni panel mock (tıklanabilir taslak) · Bildirim merkezi (zil, kısayol B) · Akış şeridi: 26 ekranda işin dört adımda nasıl aktığı (g · flows.tsx |
| 31 | Chat.tsx / Messages() | 23 | 0.11 | Chat.tsx · Messages() · ChatProvider() · when() |
| 32 | S8 Stok modeli ayrı alanlar, harek / Dalga 1: Sağlam temel | 22 | 0.13 | S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6 · Dalga 1: Sağlam temel · S11 79 iade ilk aşamada kalmış (puan 4) · S12 Kanal sağlık göstergesi ana ekranda yok (puan 4) |
| 33 | Belge 10 Rakip ve Hedef Mimari / Belge 11 Yeniden Tasarım Girdileri | 21 | 0.13 | Belge 10 Rakip ve Hedef Mimari · Belge 11 Yeniden Tasarım Girdileri · TR entegratörleri grubu (AB pazaryeri kapsamı doğrulanam · Bilinen mevcut durum (tek PHP girişi, stok defteri yok,  |
| 34 | package.json / devDependencies | 21 | 0.14 | package.json · devDependencies · vite.config.ts · @tailwindcss/vite |
| 35 | Mobile.tsx / Pack() | 20 | 0.26 | Mobile.tsx · Pack() · Count() · Recv() |
| 36 | Satış Kanalları Ekranları / metro | 19 | 0.20 | Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Ekran: metro — METRO siparişleri/gönderim/hatalar · METRO (mevcut) · API: /api/metro.php |
| 37 | Benzer ürün önerisi: stoktaki diğe / Gerçek ürün fotoğrafları | 19 | 0.12 | Benzer ürün önerisi: stoktaki diğer markalardan en yakın · Gerçek ürün fotoğrafları (Wikimedia Commons, 128 piksel  · Ekran: Veri kalitesi ("sıradakini düzelt" kuyruğu) · Rakip teklifleri: aynı ürünü aynı platformda satan diğer |
| 38 | Quality.tsx / revenueOrders() | 19 | 0.13 | Quality.tsx · revenueOrders() · useSales() · dupGroups() |
| 39 | Sıradaki adımlar / Ne hazır, ne değil durum tablosu | 18 | 0.11 | Sıradaki adımlar · Ne hazır, ne değil durum tablosu · Sonraki adım: asistanı gerçek yapay zekâyla denemek · Gerçek yapay zekâ: kodu hazır, gerçek servisle denenmedi |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (73 bağlantı)
- useStore() (71 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- Card() (62 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- fmtNum() (53 bağlantı)
- PageHead() (53 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- Shell() (50 bağlantı)
