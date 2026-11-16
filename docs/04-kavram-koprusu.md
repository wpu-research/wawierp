# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1854 düğüm · 5261 kenar · 84 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4833, INFERRED 427 · düğümler: belge ve kavram 1284, kod (mock panel) 570

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
| 0 | App.tsx / Badge() | 91 | 0.11 | App.tsx · Badge() · useStore() · Card() |
| 1 | data.ts / store.tsx | 91 | 0.04 | data.ts · store.tsx · Catalog.tsx · Channels.tsx |
| 2 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 66 | 0.05 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 3 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 64 | 0.07 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: invoices — faturalar |
| 4 | Orders.tsx / Money.tsx | 64 | 0.05 | Orders.tsx · Money.tsx · ui.tsx · Warehouse.tsx |
| 5 | Agent.tsx / account() | 61 | 0.09 | Agent.tsx · account() · Overview.tsx · Notifications.tsx |
| 6 | orders-pool / Sipariş | 49 | 0.06 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · Fatura · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden |
| 7 | customers-master / Satış faturası RE-<şirket>-<yıl>-< | 48 | 0.07 | Ekran: customers-master — müşteri ana kaydı · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) |
| 8 | warehouse_product / Ürün kartı | 47 | 0.09 | warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu · Ekran: catalog-governance — kategori kapsamı ve katalog  |
| 9 | server.mjs / assistant.mjs | 46 | 0.07 | server.mjs · assistant.mjs · handle() · Sunum yayını: /sunum/ adresi şifresiz, herkese açık (15. |
| 10 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 42 | 0.11 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price |
| 11 | warehouse-home / overview | 41 | 0.14 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 12 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 41 | 0.11 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b · Xentral |
| 13 | team / Belge 09 Güvenlik ve Uyum | 39 | 0.08 | Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi · Ekran: pin-permissions — PIN yetkileri |
| 14 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 38 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 15 | accounting / orders-ebay | 36 | 0.08 | Ekran: accounting — ön muhasebe · Ekran: orders-ebay — eBay siparişleri · Ekran: orders-kaufland — Kaufland siparişleri · eBay (mevcut) |
| 16 | Yeni panel mock / Bildirim merkezi | 36 | 0.07 | Yeni panel mock (tıklanabilir taslak) · Bildirim merkezi (zil, kısayol B) · Geliştirme panosu: konuşmalardan sistemi geliştirme · Ekip mesajlaşması (Mesajlar ekranı) |
| 17 | warehouse / Üç stok modeli | 33 | 0.11 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · Üç stok modeli (ayırt edici fikir) · Dropshipping stok modeli · Ekran: purchases — satın alma ve mal kabul |
| 18 | Karar 0006 - Panelde yapay zekâ as / Asistan: yapay zekâ bağlı biçim | 33 | 0.10 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi |
| 19 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 33 | 0.12 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 20 | Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos | 32 | 0.10 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: product-market-prices.js — Pazaryeri fiyat karşılaşt · Öneri: modüler yükleme, ES modülleri/TypeScript, tek ver |
| 21 | Beyin katmanı / WawiERP Claude Kuralları | 30 | 0.14 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 22 | WawiERP / Entegrasyonlar: mevcut | 30 | 0.11 | WawiERP (wawib2b.com) · Entegrasyonlar: mevcut (19) · Hedef pazar: Almanya / DE · JTL-Wawi entegrasyonu (mevcut) |
| 23 | Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/ | 30 | 0.17 | Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Sorun: Aynı iş her kanalda ayrı sayfa/JS/API ile yeniden · Ekran: send-kaufland — Kaufland ürün aktarımı · Ekran: shopify-pool — Shopify havuzu |
| 24 | video-uret.py / go() | 30 | 0.12 | video-uret.py · go() · scroll() · s_alerts() |
| 25 | /api/menu-counts.php / Sayac/oturum uclari | 29 | 0.12 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 26 | Benzer ürün önerisi: stoktaki diğe / Gerçek ürün fotoğrafları | 27 | 0.09 | Benzer ürün önerisi: stoktaki diğer markalardan en yakın · Gerçek ürün fotoğrafları (Wikimedia Commons, 128 piksel  · Ekran: Veri kalitesi ("sıradakini düzelt" kuyruğu) · İş akışı 5: Mükerrer birleştirme |
| 27 | /api/dhl-labels.php / dhl-labels.js | 25 | 0.11 | API: /api/dhl-labels.php · JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluş · JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ü · JS: dhl-recreate.js — Tek sipariş DHL etiketi yeniden ol |
| 28 | Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek | 25 | 0.12 | Nerede güçlüyüz, nerede eksik · S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6 · Dalga 1: Sağlam temel · S11 79 iade ilk aşamada kalmış (puan 4) |
| 29 | Mobile.tsx / Thumb() | 24 | 0.22 | Mobile.tsx · Thumb() · product() · Pack() |
| 30 | Platform.tsx / Role | 24 | 0.09 | Platform.tsx · Role · Country · fakeKey() |
| 31 | Chat.tsx / Messages() | 23 | 0.11 | Chat.tsx · Messages() · ChatProvider() · when() |
| 32 | Landing.tsx / Landing() | 23 | 0.13 | Landing.tsx · Landing() · Head() · Mark() |
| 33 | finance-documents / Çıkış belgesi defteri | 22 | 0.10 | Ekran: finance-documents — finans belgeleri · Çıkış belgesi defteri (SF/SV rozetleri, 1.763 belge Alma · İade faturası RET-<sipariş>-<n> (negatif tutar) · Tedarikçi faturası (1 kayıt, ödeme Ödenmedi) |
| 34 | package.json / devDependencies | 21 | 0.14 | package.json · devDependencies · vite.config.ts · @tailwindcss/vite |
| 35 | Güvenlik incelemesi 2026-11-15 / Karar 0009: taslak panel gerçek si | 21 | 0.11 | Belge: Güvenlik incelemesi 2026-11-15 (taslak panel, esk · Karar 0009: taslak panel gerçek sistemin davranış şartna · Konsey incelemesi 2 (Sonnet, 3 tur): ~70 bulgu, ~35 düze · Yanlış şifre sınırı: 10 dakikada 20 yanlış denemede adre |
| 36 | Selling.tsx / PriceRules() | 21 | 0.19 | Selling.tsx · PriceRules() · Replenish() · ListingWizard() |
| 37 | Pazaryerleri ve mağazalar / DHL | 20 | 0.15 | Modül: Pazaryerleri ve mağazalar · DHL (mevcut) · Modül: Toplama, paketleme, kargo · Sipariş yolculuğu (5 adım) |
| 38 | Quality.tsx / QualityQueue() | 20 | 0.15 | Quality.tsx · QualityQueue() · sel · useSales() |
| 39 | Karar 0004 - Yığın ayrıntıları / BullMQ + Redis | 19 | 0.12 | Karar 0004 - Yığın ayrıntıları · BullMQ + Redis · Ortak şema + tenant_id + satır düzeyi güvenlik (RLS) · Vite + React |

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
