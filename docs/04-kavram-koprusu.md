# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1730 düğüm · 4874 kenar · 92 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4473, INFERRED 400 · düğümler: belge ve kavram 1229, kod (mock panel) 501

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
| 0 | App.tsx / Badge() | 82 | 0.11 | App.tsx · Badge() · useStore() · Card() |
| 1 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 66 | 0.05 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 2 | invoices / accounting | 61 | 0.05 | Ekran: invoices — faturalar · Ekran: accounting — ön muhasebe · Ekran: finance-documents — finans belgeleri · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş |
| 3 | data.ts / Catalog.tsx | 57 | 0.06 | data.ts · Catalog.tsx · Channels.tsx · Catalog() |
| 4 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 54 | 0.09 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: company-home — şirket/kanal çalışma alanı (OTTO,  |
| 5 | store.tsx / Extra.tsx | 49 | 0.08 | store.tsx · Extra.tsx · data2.ts · Notifications.tsx |
| 6 | team / Belge 09 Güvenlik ve Uyum | 44 | 0.07 | Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi · Ekran: pin-permissions — PIN yetkileri |
| 7 | Selling.tsx / Portal.tsx | 44 | 0.10 | Selling.tsx · Portal.tsx · Empty() · fmtMoney() |
| 8 | warehouse / warehouse_product | 43 | 0.09 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu |
| 9 | orders-pool / Sipariş | 41 | 0.06 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · İade (DHL iade etiketinden otomatik doğar) |
| 10 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 38 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 11 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 38 | 0.10 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 12 | Beyin katmanı / WawiERP Claude Kuralları | 37 | 0.10 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 13 | ui.tsx / Agent.tsx | 37 | 0.08 | ui.tsx · Agent.tsx · Warehouse.tsx · Finance.tsx |
| 14 | Karar 0006 - Panelde yapay zekâ as / Asistan: yapay zekâ bağlı biçim | 35 | 0.09 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi |
| 15 | fmtNum() / Reservations.tsx | 34 | 0.11 | fmtNum() · Reservations.tsx · Quality.tsx · Tabs() |
| 16 | warehouse-home / overview | 32 | 0.20 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 17 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 32 | 0.14 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 18 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 30 | 0.16 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · JS: physical-stock-sync.js — Fiziki stok senkron ilerlem |
| 19 | package.json / devDependencies | 30 | 0.09 | package.json · devDependencies · react-dom · dependencies |
| 20 | Yeni panel mock / Bildirim merkezi | 29 | 0.08 | Yeni panel mock (tıklanabilir taslak) · Bildirim merkezi (zil, kısayol B) · Geliştirme panosu: konuşmalardan sistemi geliştirme · Ekip mesajlaşması (Mesajlar ekranı) |
| 21 | catalog-governance / duplicate-products | 28 | 0.11 | Ekran: catalog-governance — kategori kapsamı ve katalog  · Ekran: duplicate-products — mükerrer ürün birleştirme · Nerede güçlüyüz, nerede eksik · Ekran: physical-stock-check — sorunlu fiziki ürünler, pa |
| 22 | Ön Yüz Mimarisi / app.js | 26 | 0.11 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · JS: app.js — Ana uygulama: toast, gezinme, filtreler, JT · Sorun: Genel bakış kartlarında uzun zaman aşımı sonrası  · API: /api/accounting-orders.php |
| 23 | Landing.tsx / Landing() | 26 | 0.11 | Landing.tsx · Landing() · landing-main.tsx · Head() |
| 24 | customers-master / B2B cari | 25 | 0.15 | Ekran: customers-master — müşteri ana kaydı · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) · Müşteri |
| 25 | /api/menu-counts.php / Sayac/oturum uclari | 25 | 0.14 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 26 | Platform.tsx / VAT | 25 | 0.08 | Platform.tsx · VAT · Role · Country |
| 27 | Üç stok modeli / Ürün | 24 | 0.12 | Üç stok modeli (ayırt edici fikir) · Ürün · Modül: Ortak ürün kataloğu · Beyin düğüm türleri (Modül, Varlık, Stok modeli, Entegra |
| 28 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 24 | 0.21 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 29 | video-uret.py / go() | 24 | 0.16 | video-uret.py · go() · scroll() · s_alerts() |
| 30 | Money.tsx / Accounting() | 24 | 0.14 | Money.tsx · Accounting() · Profit() · BankMatch() |
| 31 | WawiERP / Hedef pazar: Almanya / DE | 22 | 0.15 | WawiERP (wawib2b.com) · Hedef pazar: Almanya / DE · JTL-Wawi entegrasyonu (mevcut) · Hedef pazar: Türkiye / TR |
| 32 | Chat.tsx / ChatProvider() | 21 | 0.11 | Chat.tsx · ChatProvider() · lower() · dmId() |
| 33 | Mobile.tsx / product() | 21 | 0.26 | Mobile.tsx · product() · Count() · Pack() |
| 34 | Entegrasyonlar: mevcut / tr-market | 20 | 0.13 | Entegrasyonlar: mevcut (19) · Ekran: tr-market — Türkiye pazaryeri siparişleri (n11, T · Ekran: tr-market-products — Türkiye kataloğu ürünleri · DHL (mevcut) |
| 35 | Satış Kanalları Ekranları / metro | 20 | 0.18 | Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Ekran: metro — METRO siparişleri/gönderim/hatalar · METRO (mevcut) · API: /api/metro.php |
| 36 | assistant.mjs / server.mjs | 20 | 0.14 | assistant.mjs · server.mjs · handleAssistant() · handleContent() |
| 37 | /api/dhl-labels.php / dhl-recreate.js | 18 | 0.14 | API: /api/dhl-labels.php · JS: dhl-recreate.js — Tek sipariş DHL etiketi yeniden ol · JS: dhl-recreate-batch.js — Toplu DHL etiketi yeniden ol · DHL / kargo ailesi |
| 38 | Automation.tsx / Drawer() | 18 | 0.14 | Automation.tsx · Drawer() · Rules() · Builder() |
| 39 | İlan yaşam döngüsü / Adım 3: Kategori eşleme | 17 | 0.18 | İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → d · Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim · Adım 6: Yayında (satır/toplu stok ve fiyat güncelle) · erp_action: sync_sales_listings |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (71 bağlantı)
- useStore() (70 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- Card() (62 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- fmtNum() (52 bağlantı)
- PageHead() (52 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (49 bağlantı)
