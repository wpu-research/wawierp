# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-14 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1664 düğüm · 4690 kenar · 84 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4305, INFERRED 384 · düğümler: belge ve kavram 1206, kod (mock panel) 458

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
| 0 | data.ts / Extra.tsx | 86 | 0.05 | data.ts · Extra.tsx · store.tsx · Catalog.tsx |
| 1 | Badge() / useStore() | 75 | 0.13 | Badge() · useStore() · Card() · PageHead() |
| 2 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 63 | 0.06 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 3 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 61 | 0.07 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: shipping — kargo (DHL merkezi, manuel panel) |
| 4 | orders-pool / Sipariş | 51 | 0.05 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · Fatura · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden |
| 5 | audit-logs / team | 51 | 0.06 | Ekran: audit-logs — denetim kayıtları · Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi |
| 6 | customers-master / Satış faturası RE-<şirket>-<yıl>-< | 47 | 0.07 | Ekran: customers-master — müşteri ana kaydı · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) |
| 7 | Orders.tsx / Agent.tsx | 45 | 0.10 | Orders.tsx · Agent.tsx · account() · Overview.tsx |
| 8 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 43 | 0.08 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Yeni panel mock (tıklanabilir taslak) |
| 9 | ui.tsx / Quality.tsx | 43 | 0.08 | ui.tsx · Quality.tsx · Warehouse.tsx · Stat() |
| 10 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 41 | 0.11 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price |
| 11 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 41 | 0.10 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 12 | warehouse-home / overview | 38 | 0.15 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 13 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 38 | 0.12 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 14 | Beyin katmanı / WawiERP Claude Kuralları | 37 | 0.10 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 15 | warehouse / warehouse_product | 37 | 0.11 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu |
| 16 | accounting / orders-ebay | 33 | 0.08 | Ekran: accounting — ön muhasebe · Ekran: orders-ebay — eBay siparişleri · Ekran: orders-kaufland — Kaufland siparişleri · Ekran: erp-features — ERP özellik ayarları |
| 17 | Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt | 30 | 0.11 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Kendiliğinden düzeyi |
| 18 | WawiERP / Entegrasyonlar: mevcut | 29 | 0.12 | WawiERP (wawib2b.com) · Entegrasyonlar: mevcut (19) · Hedef pazar: Almanya / DE · DHL (mevcut) |
| 19 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 29 | 0.17 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 20 | invoices / finance-documents | 27 | 0.11 | Ekran: invoices — faturalar · Ekran: finance-documents — finans belgeleri · Sorun: sayac-liste ve stok/ticket tutarsizliklari · Çıkış belgesi defteri (SF/SV rozetleri, 1.763 belge Alma |
| 21 | /api/menu-counts.php / Sayac/oturum uclari | 27 | 0.13 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 22 | Nerede güçlüyüz, nerede eksik / S2 Sayaç ve özetler çelişiyor | 27 | 0.09 | Nerede güçlüyüz, nerede eksik · S2 Sayaç ve özetler çelişiyor (puan 9) · S11 79 iade ilk aşamada kalmış (puan 4) · S12 Kanal sağlık göstergesi ana ekranda yok (puan 4) |
| 23 | Ön Yüz Mimarisi / /api/wholesale-sales.php | 26 | 0.11 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · API: /api/wholesale-sales.php · JS: marketplace-stop.js — Pazaryeri satışı durdurma penc · Desen: bir uç, çok eylem + data-endpoint (invoices, dhl- |
| 24 | package.json / devDependencies | 26 | 0.11 | package.json · devDependencies · react-dom · dependencies |
| 25 | Platform.tsx / Role | 26 | 0.08 | Platform.tsx · Role · Health · JobStatus |
| 26 | Landing.tsx / Landing() | 26 | 0.11 | Landing.tsx · Landing() · landing-main.tsx · Head() |
| 27 | video-uret.py / go() | 24 | 0.16 | video-uret.py · go() · scroll() · s_alerts() |
| 28 | catalog-governance / Üç stok modeli | 23 | 0.12 | Ekran: catalog-governance — kategori kapsamı ve katalog  · Üç stok modeli (ayırt edici fikir) · Ürün · Modül: Ortak ürün kataloğu |
| 29 | Selling.tsx / PriceRules() | 22 | 0.16 | Selling.tsx · PriceRules() · ListingWizard() · Chan() |
| 30 | assistant.mjs / server.mjs | 20 | 0.14 | assistant.mjs · server.mjs · handleAssistant() · handleContent() |
| 31 | Mobile.tsx / Count() | 19 | 0.27 | Mobile.tsx · Count() · Pack() · Recv() |
| 32 | company-home / product-market-prices.js | 18 | 0.16 | Ekran: company-home — şirket/kanal çalışma alanı (OTTO,  · JS: product-market-prices.js — Pazaryeri fiyat karşılaşt · Kaynak chip sayıları (JTL 11.834, Amazon 3.895, eBay 3.8 · Amazon (mevcut) |
| 33 | /api/dhl-labels.php / dhl-recreate.js | 18 | 0.14 | API: /api/dhl-labels.php · JS: dhl-recreate.js — Tek sipariş DHL etiketi yeniden ol · JS: dhl-recreate-batch.js — Toplu DHL etiketi yeniden ol · DHL / kargo ailesi |
| 34 | Karar 0004 - Yığın ayrıntıları / Karar 0005 - Bulut sağlayıcı | 18 | 0.18 | Karar 0004 - Yığın ayrıntıları · Karar 0005 - Bulut sağlayıcı · AWS Frankfurt (eu-central-1) · AWS CDK (TypeScript) |
| 35 | Bilgi Mimarisi / i18n 3: Satır içi t(tr, de) yardım | 17 | 0.19 | Belge: Bilgi Mimarisi · i18n 3: Satır içi t(tr, de) yardımcıları (13 dosya) · Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici) · Desen: mobil ve görsel katman dosyaları (mobile-workspac |
| 36 | API Yuzeyi / app.js | 17 | 0.20 | Belge: API Yuzeyi · JS: app.js — Ana uygulama: toast, gezinme, filtreler, JT · Ortak istek bicimi (fetch, JSON, same-origin, csrf govde · Sipariş alımı: arka plan işi / 10 dk senkron / elle günc |
| 37 | İlan yaşam döngüsü / Adım 3: Kategori eşleme | 17 | 0.18 | İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → d · Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim · Adım 6: Yayında (satır/toplu stok ve fiyat güncelle) · erp_action: sync_sales_listings |
| 38 | Automation.tsx / Rules() | 17 | 0.15 | Automation.tsx · Rules() · Builder() · Switch() |
| 39 | Dropshipping stok modeli / purchases | 16 | 0.23 | Dropshipping stok modeli · Ekran: purchases — satın alma ve mal kabul · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV · İş akışı 6: Drop ürün / Asterbuy akışı |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (68 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- useStore() (63 bağlantı)
- Card() (60 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- PageHead() (50 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (49 bağlantı)
- fmtNum() (49 bağlantı)
