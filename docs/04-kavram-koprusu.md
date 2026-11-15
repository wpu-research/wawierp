# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1765 düğüm · 4969 kenar · 84 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4558, INFERRED 410 · düğümler: belge ve kavram 1248, kod (mock panel) 517

Küme adları bu sürümde otomatik verilir: kümenin en çok bağlantılı iki kavramının adıdır.

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
| 0 | data.ts / store.tsx | 83 | 0.05 | data.ts · store.tsx · Extra.tsx · Channels.tsx |
| 1 | App.tsx / Badge() | 72 | 0.13 | App.tsx · Badge() · useStore() · Card() |
| 2 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 67 | 0.07 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: shipping — kargo (DHL merkezi, manuel panel) |
| 3 | ui.tsx / Automation.tsx | 66 | 0.05 | ui.tsx · Automation.tsx · Quality.tsx · Warehouse.tsx |
| 4 | warehouse / warehouse_product | 61 | 0.07 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu |
| 5 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 61 | 0.06 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 6 | Orders.tsx / Agent.tsx | 61 | 0.08 | Orders.tsx · Agent.tsx · account() · Overview.tsx |
| 7 | video-uret.py / go() | 59 | 0.05 | video-uret.py · go() · assistant.mjs · server.mjs |
| 8 | orders-pool / Sipariş | 52 | 0.05 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · DHL (mevcut) |
| 9 | audit-logs / team | 47 | 0.07 | Ekran: audit-logs — denetim kayıtları · Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi |
| 10 | Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos | 46 | 0.07 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ü · Çoklu dil: üç ayrı mekanizma, ortak çatı yok |
| 11 | warehouse-home / overview | 42 | 0.13 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 12 | invoices / accounting | 41 | 0.08 | Ekran: invoices — faturalar · Ekran: accounting — ön muhasebe · Ekran: finance-documents — finans belgeleri · Ekran: erp-features — ERP özellik ayarları |
| 13 | Yeni panel mock / Bildirim merkezi | 40 | 0.06 | Yeni panel mock (tıklanabilir taslak) · Bildirim merkezi (zil, kısayol B) · Geliştirme panosu: konuşmalardan sistemi geliştirme · Gerçek ürün fotoğrafları (Wikimedia Commons, 128 piksel  |
| 14 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 39 | 0.11 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 15 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 39 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 16 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 38 | 0.10 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 17 | Beyin katmanı / WawiERP Claude Kuralları | 37 | 0.10 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 18 | WawiERP / Pazaryerleri ve mağazalar | 33 | 0.11 | WawiERP (wawib2b.com) · Modül: Pazaryerleri ve mağazalar · Entegrasyonlar: mevcut (19) · Hedef pazar: Almanya / DE |
| 19 | Karar 0006 - Panelde yapay zekâ as / Asistan: yapay zekâ bağlı biçim | 32 | 0.10 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi |
| 20 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 31 | 0.15 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 21 | Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek | 29 | 0.10 | Nerede güçlüyüz, nerede eksik · S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6 · Dalga 1: Sağlam temel · S11 79 iade ilk aşamada kalmış (puan 4) |
| 22 | fmtNum() / Catalog.tsx | 28 | 0.17 | fmtNum() · Catalog.tsx · Reservations.tsx · whName() |
| 23 | package.json / devDependencies | 26 | 0.11 | package.json · devDependencies · react-dom · dependencies |
| 24 | Landing.tsx / Landing() | 26 | 0.11 | Landing.tsx · Landing() · landing-main.tsx · Head() |
| 25 | Klasik form yolu POST ?page + erp_ / erp.js | 25 | 0.16 | Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · JS: physical-stock-sync.js — Fiziki stok senkron ilerlem · erp_action: add_stock |
| 26 | 02-urun-katalog-stok.md: Ürün, kat / catalog-governance | 25 | 0.12 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Ekran: catalog-governance — kategori kapsamı ve katalog  · İş akışı 4: Depolar arası stok aktarımı · erp_action: add_category |
| 27 | Selling.tsx / PriceRules() | 24 | 0.16 | Selling.tsx · PriceRules() · company() · ListingWizard() |
| 28 | Platform.tsx / Role | 24 | 0.09 | Platform.tsx · Role · Country · fakeKey() |
| 29 | Dropshipping stok modeli / Drop tedarikçi: Asterbuy | 21 | 0.15 | Dropshipping stok modeli · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV · İş akışı 6: Drop ürün / Asterbuy akışı · Ekran: asterbuy-orders — Asterbuy drop siparişleri havuz |
| 30 | /api/menu-counts.php / Sayac/oturum uclari | 21 | 0.17 | API: /api/menu-counts.php · Sayac/oturum uclari · API: /api/warehouse-messages.php · JS: menu-counts.js — Kenar menü sayaçları (120 sn yenile |
| 31 | Chat.tsx / ChatProvider() | 21 | 0.11 | Chat.tsx · ChatProvider() · lower() · dmId() |
| 32 | API Yuzeyi / app.js | 20 | 0.16 | Belge: API Yuzeyi · JS: app.js — Ana uygulama: toast, gezinme, filtreler, JT · Ortak istek bicimi (fetch, JSON, same-origin, csrf govde · Sipariş alımı: arka plan işi / 10 dk senkron / elle günc |
| 33 | Money.tsx / Finance.tsx | 20 | 0.13 | Money.tsx · Finance.tsx · Order · Cur |
| 34 | Mobile.tsx / Count() | 20 | 0.26 | Mobile.tsx · Count() · Pack() · Recv() |
| 35 | customers-master / B2B cari | 19 | 0.21 | Ekran: customers-master — müşteri ana kaydı · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) · Müşteri |
| 36 | Satış Kanalları Ekranları / metro | 19 | 0.21 | Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Ekran: metro — METRO siparişleri/gönderim/hatalar · METRO (mevcut) · JS: product-market-prices.js — Pazaryeri fiyat karşılaşt |
| 37 | Karar 0004 - Yığın ayrıntıları / BullMQ + Redis | 18 | 0.12 | Karar 0004 - Yığın ayrıntıları · BullMQ + Redis · Ortak şema + tenant_id + satır düzeyi güvenlik (RLS) · Prisma |
| 38 | Bilgi Mimarisi / i18n 3: Satır içi t(tr, de) yardım | 17 | 0.19 | Belge: Bilgi Mimarisi · i18n 3: Satır içi t(tr, de) yardımcıları (13 dosya) · Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici) · Desen: mobil ve görsel katman dosyaları (mobile-workspac |
| 39 | /api/dhl-labels.php / dhl-labels.js | 17 | 0.18 | API: /api/dhl-labels.php · JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluş · Desen: request/api fetch sarmalayıcısı her dosyada yenid · JS: dhl-recreate.js — Tek sipariş DHL etiketi yeniden ol |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (71 bağlantı)
- useStore() (70 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- Card() (62 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- PageHead() (53 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- fmtNum() (52 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (49 bağlantı)
