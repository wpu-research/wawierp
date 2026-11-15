# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1821 düğüm · 5119 kenar · 90 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4698, INFERRED 420 · düğümler: belge ve kavram 1272, kod (mock panel) 549

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
| 0 | App.tsx / Badge() | 89 | 0.11 | App.tsx · Badge() · useStore() · Card() |
| 1 | Orders.tsx / Agent.tsx | 83 | 0.06 | Orders.tsx · Agent.tsx · fmtMoney() · account() |
| 2 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 74 | 0.06 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: accounting — ön muhasebe |
| 3 | store.tsx / Extra.tsx | 63 | 0.06 | store.tsx · Extra.tsx · Money.tsx · data2.ts |
| 4 | ui.tsx / Automation.tsx | 55 | 0.06 | ui.tsx · Automation.tsx · Reservations.tsx · Warehouse.tsx |
| 5 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 48 | 0.09 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price |
| 6 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 47 | 0.07 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Varlik: siparis (platform no, kaynak, tedarik tipi) · Belge: Kavram Kopruesu |
| 7 | Yeni panel mock / Asistan: yapay zekâ bağlı biçim | 47 | 0.06 | Yeni panel mock (tıklanabilir taslak) · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Bildirim merkezi (zil, kısayol B) · Geliştirme panosu: konuşmalardan sistemi geliştirme |
| 8 | data.ts / Catalog.tsx | 42 | 0.08 | data.ts · Catalog.tsx · Channels.tsx · Channels() |
| 9 | warehouse-home / overview | 41 | 0.14 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 10 | warehouse_product / Ürün kartı | 41 | 0.10 | warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu · Ekran: catalog-governance — kategori kapsamı ve katalog  |
| 11 | orders-pool / Sipariş | 40 | 0.07 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · Müşteri |
| 12 | team / Belge 09 Güvenlik ve Uyum | 39 | 0.07 | Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi · GoBD fatura saklama ve değişmezlik |
| 13 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 38 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 14 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 37 | 0.12 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 15 | Ön Yüz Mimarisi / Çoklu dil: üç ayrı mekanizma, orta | 33 | 0.09 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Çoklu dil: üç ayrı mekanizma, ortak çatı yok · i18n 2: wawiText yardımcısı (Türkçe metin anahtar, 11 do · JS: barcode-count.js — Barkodla sayım (kamera, hızlı say |
| 16 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 33 | 0.12 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 17 | invoices / finance-documents | 31 | 0.10 | Ekran: invoices — faturalar · Ekran: finance-documents — finans belgeleri · Ekran: purchases — satın alma ve mal kabul · Ekran: shipments — gönderiler |
| 18 | package.json / devDependencies | 31 | 0.09 | package.json · devDependencies · react-dom · dependencies |
| 19 | Beyin katmanı / WawiERP Claude Kuralları | 30 | 0.14 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 20 | warehouse / Üç stok modeli | 30 | 0.13 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · Üç stok modeli (ayırt edici fikir) · Dropshipping stok modeli · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV |
| 21 | video-uret.py / go() | 30 | 0.12 | video-uret.py · go() · scroll() · s_alerts() |
| 22 | /api/menu-counts.php / Sayac/oturum uclari | 29 | 0.12 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 23 | Platform.tsx / Role | 26 | 0.08 | Platform.tsx · Role · Health · JobStatus |
| 24 | Landing.tsx / Landing() | 26 | 0.11 | Landing.tsx · Landing() · landing-main.tsx · Head() |
| 25 | WawiERP / Hedef pazar: Almanya / DE | 25 | 0.13 | WawiERP (wawib2b.com) · Hedef pazar: Almanya / DE · JTL-Wawi entegrasyonu (mevcut) · PHP 8.1.34 (klasik PHP uygulama) |
| 26 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 25 | 0.19 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 27 | Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek | 25 | 0.12 | Nerede güçlüyüz, nerede eksik · S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6 · Dalga 1: Sağlam temel · S11 79 iade ilk aşamada kalmış (puan 4) |
| 28 | /api/dhl-labels.php / /api/invoices.php | 24 | 0.16 | API: /api/dhl-labels.php · API: /api/invoices.php · JS: invoice-workflow.js — Siparişten fatura, iade fatura · Desen: crypto.getRandomValues ile 16 baytlık idempotency |
| 29 | Selling.tsx / PriceRules() | 24 | 0.16 | Selling.tsx · PriceRules() · company() · ListingWizard() |
| 30 | Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt | 23 | 0.15 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi · Hazırla, onayla düzeyi (varsayılan) |
| 31 | Sıradaki adımlar / Ne hazır, ne değil durum tablosu | 22 | 0.10 | Sıradaki adımlar · Ne hazır, ne değil durum tablosu · Belge 11 Yeniden Tasarım Girdileri · Açık: gerçek servisle deneme (anahtar bekleniyor) |
| 32 | server.mjs / gate() | 21 | 0.14 | server.mjs · gate() · lockedFor() · noteFail() |
| 33 | Chat.tsx / ChatProvider() | 21 | 0.11 | Chat.tsx · ChatProvider() · lower() · dmId() |
| 34 | Benzer ürün önerisi: stoktaki diğe / Veri kalitesi | 20 | 0.13 | Benzer ürün önerisi: stoktaki diğer markalardan en yakın · Ekran: Veri kalitesi ("sıradakini düzelt" kuyruğu) · İş akışı 5: Mükerrer birleştirme · Rakip teklifleri: aynı ürünü aynı platformda satan diğer |
| 35 | customers-master / B2B cari | 19 | 0.19 | Ekran: customers-master — müşteri ana kaydı · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) · Modül: B2B müşteri portalı |
| 36 | dhl-labels.js / Desen: modal/dialog kabuğu her dos | 19 | 0.13 | JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluş · Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ü · Öneri: modüler yükleme, ES modülleri/TypeScript, tek ver |
| 37 | Karar 0004 - Yığın ayrıntıları / BullMQ + Redis | 19 | 0.12 | Karar 0004 - Yığın ayrıntıları · BullMQ + Redis · Ortak şema + tenant_id + satır düzeyi güvenlik (RLS) · Vite + React |
| 38 | Mobile.tsx / Count() | 19 | 0.27 | Mobile.tsx · Count() · Pack() · Recv() |
| 39 | İlan yaşam döngüsü / Adım 3: Kategori eşleme | 18 | 0.17 | İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → d · Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim · Adım 6: Yayında (satır/toplu stok ve fiyat güncelle) · Fiyat ve adet hesap bazında ayrı kayıt (Wawi fiyatı ≠ pl |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (73 bağlantı)
- useStore() (70 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- Card() (62 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- fmtNum() (54 bağlantı)
- PageHead() (53 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (49 bağlantı)
