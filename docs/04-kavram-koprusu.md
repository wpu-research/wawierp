# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1751 düğüm · 4948 kenar · 89 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4543, INFERRED 404 · düğümler: belge ve kavram 1238, kod (mock panel) 513

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
| 0 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 81 | 0.06 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: accounting — ön muhasebe |
| 1 | warehouse / warehouse_product | 74 | 0.05 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu |
| 2 | Satış Kanalları Ekranları / company-home | 73 | 0.07 | Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Ekran: company-home — şirket/kanal çalışma alanı (OTTO,  · Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Ekran: metro — METRO siparişleri/gönderim/hatalar |
| 3 | Platform.tsx / ui.tsx | 73 | 0.04 | Platform.tsx · ui.tsx · Catalog.tsx · Channels.tsx |
| 4 | data.ts / store.tsx | 71 | 0.06 | data.ts · store.tsx · Extra.tsx · data2.ts |
| 5 | Badge() / useStore() | 70 | 0.16 | Badge() · useStore() · Card() · PageHead() |
| 6 | Orders.tsx / Agent.tsx | 61 | 0.08 | Orders.tsx · Agent.tsx · account() · Overview.tsx |
| 7 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 52 | 0.07 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Varlik: cikis belgesi (sales_invoice, intercompany_invoi · Varlik: depo urun kaydi (~151 bin; warehouse_id + produc |
| 8 | warehouse-home / overview | 45 | 0.12 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 9 | Yeni panel mock / Bildirim merkezi | 45 | 0.05 | Yeni panel mock (tıklanabilir taslak) · Bildirim merkezi (zil, kısayol B) · Geliştirme panosu: konuşmalardan sistemi geliştirme · Gerçek ürün fotoğrafları (Wikimedia Commons, 128 piksel  |
| 10 | team / Belge 09 Güvenlik ve Uyum | 39 | 0.07 | Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi · GoBD fatura saklama ve değişmezlik |
| 11 | Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos | 39 | 0.08 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: product-market-prices.js — Pazaryeri fiyat karşılaşt · Çoklu dil: üç ayrı mekanizma, ortak çatı yok |
| 12 | orders-pool / Sipariş | 38 | 0.07 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · Tedarik tipi: physical, dropship, asterbuy, bueroarena,  |
| 13 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 38 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 14 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 37 | 0.12 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price |
| 15 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 33 | 0.14 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 16 | Karar 0006 - Panelde yapay zekâ as / Asistan: yapay zekâ bağlı biçim | 33 | 0.10 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi |
| 17 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 33 | 0.12 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 18 | /api/menu-counts.php / Sayac/oturum uclari | 30 | 0.11 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 19 | Karar 0004 - Yığın ayrıntıları / Karar 0005 - Bulut sağlayıcı | 26 | 0.12 | Karar 0004 - Yığın ayrıntıları · Karar 0005 - Bulut sağlayıcı · AWS Frankfurt (eu-central-1) · BullMQ + Redis |
| 20 | Beyin katmanı / WawiERP Claude Kuralları | 25 | 0.18 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 21 | Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek | 25 | 0.12 | Nerede güçlüyüz, nerede eksik · S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6 · Dalga 1: Sağlam temel · S11 79 iade ilk aşamada kalmış (puan 4) |
| 22 | /api/dhl-labels.php / /api/invoices.php | 24 | 0.16 | API: /api/dhl-labels.php · API: /api/invoices.php · JS: invoice-workflow.js — Siparişten fatura, iade fatura · Desen: crypto.getRandomValues ile 16 baytlık idempotency |
| 23 | video-uret.py / go() | 24 | 0.16 | video-uret.py · go() · scroll() · s_alerts() |
| 24 | Selling.tsx / Stat() | 24 | 0.16 | Selling.tsx · Stat() · PriceRules() · company() |
| 25 | customers-master / B2B cari | 23 | 0.17 | Ekran: customers-master — müşteri ana kaydı · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) · Müşteri |
| 26 | Landing.tsx / Landing() | 23 | 0.13 | Landing.tsx · Landing() · Head() · Mark() |
| 27 | invoices / Satış faturası RE-<şirket>-<yıl>-< | 22 | 0.14 | Ekran: invoices — faturalar · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş · Fatura · İade faturası RET-<sipariş>-<n> (negatif tutar) |
| 28 | WawiERP / Hedef pazar: Almanya / DE | 21 | 0.16 | WawiERP (wawib2b.com) · Hedef pazar: Almanya / DE · JTL-Wawi entegrasyonu (mevcut) · Hedef pazar: Türkiye / TR |
| 29 | package.json / devDependencies | 21 | 0.14 | package.json · devDependencies · vite.config.ts · @tailwindcss/vite |
| 30 | Chat.tsx / ChatProvider() | 21 | 0.11 | Chat.tsx · ChatProvider() · lower() · dmId() |
| 31 | assistant.mjs / server.mjs | 20 | 0.14 | assistant.mjs · server.mjs · handleAssistant() · handleContent() |
| 32 | Money.tsx / BankMatch() | 19 | 0.15 | Money.tsx · BankMatch() · Order · Cur |
| 33 | Mobile.tsx / Count() | 19 | 0.27 | Mobile.tsx · Count() · Pack() · Recv() |
| 34 | Dropshipping stok modeli / purchases | 18 | 0.20 | Dropshipping stok modeli · Ekran: purchases — satın alma ve mal kabul · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV · İş akışı 6: Drop ürün / Asterbuy akışı |
| 35 | Automation.tsx / Drawer() | 18 | 0.14 | Automation.tsx · Drawer() · Rules() · Builder() |
| 36 | Quality.tsx / QualityQueue() | 18 | 0.16 | Quality.tsx · QualityQueue() · dupGroups() · jaccard() |
| 37 | Bilgi Mimarisi / i18n 2: wawiText yardımcısı | 17 | 0.19 | Belge: Bilgi Mimarisi · i18n 2: wawiText yardımcısı (Türkçe metin anahtar, 11 do · Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici) · Desen: mobil ve görsel katman dosyaları (mobile-workspac |
| 38 | Beyin düğüm türleri / Cloudflare | 16 | 0.14 | Beyin düğüm türleri (Modül, Varlık, Stok modeli, Entegra · Cloudflare (DNS, proxy, analitik) · PHP 8.1.34 (klasik PHP uygulama) · Origin sunucu (tek, kararsız) |
| 39 | Pazaryerleri ve mağazalar / Entegrasyonlar: mevcut | 16 | 0.19 | Modül: Pazaryerleri ve mağazalar · Entegrasyonlar: mevcut (19) · DHL (mevcut) · Modül: Toplama, paketleme, kargo |

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
