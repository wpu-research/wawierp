# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1682 düğüm · 4746 kenar · 79 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4353, INFERRED 392 · düğümler: belge ve kavram 1215, kod (mock panel) 467

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
| 0 | Badge() / Card() | 72 | 0.12 | Badge() · Card() · PageHead() · Portal.tsx |
| 1 | WawiERP / Beyin katmanı | 65 | 0.06 | WawiERP (wawib2b.com) · Beyin katmanı (graphify) · Hedef pazar: Almanya / DE · WawiERP Claude Kuralları (CLAUDE.md) |
| 2 | data.ts / Orders.tsx | 65 | 0.05 | data.ts · Orders.tsx · Catalog.tsx · Channels.tsx |
| 3 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 56 | 0.06 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 4 | store.tsx / Extra.tsx | 55 | 0.07 | store.tsx · Extra.tsx · Money.tsx · data2.ts |
| 5 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 50 | 0.09 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: shipping — kargo (DHL merkezi, manuel panel) |
| 6 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 50 | 0.07 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni panel mock (tıklanabilir taslak) · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) |
| 7 | fmtNum() / Agent.tsx | 45 | 0.11 | fmtNum() · Agent.tsx · account() · Overview.tsx |
| 8 | audit-logs / team | 42 | 0.07 | Ekran: audit-logs — denetim kayıtları · Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi |
| 9 | App.tsx / Platform.tsx | 42 | 0.07 | App.tsx · Platform.tsx · ago() · Developers() |
| 10 | customers-master / B2B cari | 41 | 0.08 | Ekran: customers-master — müşteri ana kaydı · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) · Müşteri |
| 11 | orders-pool / Sipariş | 40 | 0.07 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · İade (DHL iade etiketinden otomatik doğar) |
| 12 | invoices / finance-documents | 38 | 0.08 | Ekran: invoices — faturalar · Ekran: finance-documents — finans belgeleri · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş · Fatura |
| 13 | warehouse_product / Ürün kartı | 37 | 0.12 | warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu · Ekran: catalog-governance — kategori kapsamı ve katalog  |
| 14 | accounting / erp-features | 36 | 0.07 | Ekran: accounting — ön muhasebe · Ekran: erp-features — ERP özellik ayarları · Panel belgesi 07 Kapsam tamamlama (2. tur) · S2 Sayaç ve özetler çelişiyor (puan 9) |
| 15 | warehouse-home / overview | 35 | 0.17 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 16 | warehouse / Üç stok modeli | 35 | 0.10 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · Üç stok modeli (ayırt edici fikir) · Dropshipping stok modeli · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV |
| 17 | Bilgi Mimarisi / /api/menu-counts.php | 35 | 0.10 | Belge: Bilgi Mimarisi · API: /api/menu-counts.php · Sayac/oturum uclari · Sorun: yavaş liste uçları (15-30 sn), zaman aşımı mesajı |
| 18 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 35 | 0.13 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price |
| 19 | Landing.tsx / Landing() | 35 | 0.08 | Landing.tsx · Landing() · landing-main.tsx · main.tsx |
| 20 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 34 | 0.13 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 21 | Pazaryerleri ve mağazalar / Entegrasyonlar: mevcut | 33 | 0.09 | Modül: Pazaryerleri ve mağazalar · Entegrasyonlar: mevcut (19) · Ekran: tr-market — Türkiye pazaryeri siparişleri (n11, T · Ekran: tr-market-products — Türkiye kataloğu ürünleri |
| 22 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 33 | 0.12 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 23 | Satış Kanalları Ekranları / company-home | 30 | 0.14 | Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Ekran: company-home — şirket/kanal çalışma alanı (OTTO,  · Ekran: metro — METRO siparişleri/gönderim/hatalar · Ekran: channel-worklist — kanal iş listesi (sorunlar, gö |
| 24 | Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt | 30 | 0.11 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi · Hazırla, onayla düzeyi (varsayılan) |
| 25 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 29 | 0.18 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 26 | Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos | 26 | 0.12 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ü · API: /api/wholesale-sales.php |
| 27 | Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek | 24 | 0.13 | Nerede güçlüyüz, nerede eksik · S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6 · Dalga 1: Sağlam temel · S11 79 iade ilk aşamada kalmış (puan 4) |
| 28 | video-uret.py / go() | 24 | 0.16 | video-uret.py · go() · scroll() · s_alerts() |
| 29 | İlan yaşam döngüsü / Sipariş yolculuğu | 23 | 0.14 | İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → d · Sipariş yolculuğu (5 adım) · Adım 2: Kaynağı seç · Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim |
| 30 | Reservations.tsx / ui.tsx | 23 | 0.18 | Reservations.tsx · ui.tsx · Finance.tsx · react |
| 31 | Selling.tsx / PriceRules() | 23 | 0.16 | Selling.tsx · PriceRules() · ListingWizard() · Replenish() |
| 32 | API Yuzeyi / app.js | 21 | 0.15 | Belge: API Yuzeyi · JS: app.js — Ana uygulama: toast, gezinme, filtreler, JT · Ortak istek bicimi (fetch, JSON, same-origin, csrf govde · Sipariş alımı: arka plan işi / 10 dk senkron / elle günc |
| 33 | Sıradaki adımlar / Asistan: yapay zekâ bağlı biçim | 21 | 0.10 | Sıradaki adımlar · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Ne hazır, ne değil durum tablosu · Açık: gerçek servisle deneme (anahtar bekleniyor) |
| 34 | package.json / devDependencies | 21 | 0.14 | package.json · devDependencies · vite.config.ts · @tailwindcss/vite |
| 35 | useStore() / Mobile.tsx | 21 | 0.26 | useStore() · Mobile.tsx · Count() · Pack() |
| 36 | assistant.mjs / server.mjs | 20 | 0.14 | assistant.mjs · server.mjs · handleAssistant() · handleContent() |
| 37 | Automation.tsx / Drawer() | 19 | 0.14 | Automation.tsx · Drawer() · Rules() · Builder() |
| 38 | Quality.tsx / QualityQueue() | 19 | 0.15 | Quality.tsx · QualityQueue() · Tone · dupGroups() |
| 39 | /api/dhl-labels.php / /api/invoices.php | 18 | 0.21 | API: /api/dhl-labels.php · API: /api/invoices.php · JS: invoice-workflow.js — Siparişten fatura, iade fatura · Desen: crypto.getRandomValues ile 16 baytlık idempotency |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (68 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- useStore() (65 bağlantı)
- Card() (60 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- fmtNum() (51 bağlantı)
- PageHead() (50 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (49 bağlantı)
