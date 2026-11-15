# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-15 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır.

Grafik: 1782 düğüm · 5028 kenar · 86 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 4614, INFERRED 413 · düğümler: belge ve kavram 1254, kod (mock panel) 528

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
| 0 | data.ts / store.tsx | 92 | 0.05 | data.ts · store.tsx · Extra.tsx · Catalog.tsx |
| 1 | warehouse / warehouse_product | 70 | 0.06 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok · warehouse_product · Ürün kartı (katalog, 232.526): product_key, başlık, kayn · Ekran: products — kaynak ürün kataloğu |
| 2 | Orders.tsx / Agent.tsx | 70 | 0.07 | Orders.tsx · Agent.tsx · account() · Overview.tsx |
| 3 | Satış Kanalları Ekranları / company-home | 69 | 0.08 | Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Ekran: company-home — şirket/kanal çalışma alanı (OTTO,  · Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API) · Ekran: metro — METRO siparişleri/gönderim/hatalar |
| 4 | Alan Modeli / Panel Analizi - Birlesik Bulgular | 66 | 0.05 | Belge: Alan Modeli · Belge: Panel Analizi - Birlesik Bulgular · Depolar arası sevkiyat · Varlik: cikis belgesi (sales_invoice, intercompany_invoi |
| 5 | Badge() / useStore() | 65 | 0.14 | Badge() · useStore() · Card() · PageHead() |
| 6 | App.tsx / Money.tsx | 56 | 0.06 | App.tsx · Money.tsx · ui.tsx · Warehouse.tsx |
| 7 | panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad> | 53 | 0.09 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Yeniden kurulan menu agaci (yerlesim tahmin) · Ekran: shipping — kargo (DHL merkezi, manuel panel) |
| 8 | invoices / accounting | 47 | 0.07 | Ekran: invoices — faturalar · Ekran: accounting — ön muhasebe · Ekran: finance-documents — finans belgeleri · Ekran: erp-features — ERP özellik ayarları |
| 9 | Otomasyon çekirdeği: Olay → Kural / 14 hazır kural | 45 | 0.08 | Otomasyon çekirdeği: Olay → Kural → Onay düzeyi · 14 hazır kural · Karar 0007 - Otomasyon: olay, kural, onay düzeyi çekirde · Dalga 2: Otomasyon |
| 10 | Yeni panel mock / Bildirim merkezi | 42 | 0.06 | Yeni panel mock (tıklanabilir taslak) · Bildirim merkezi (zil, kısayol B) · Asistan: yapay zekâ bağlı biçim (/api/assistant) · Geliştirme panosu: konuşmalardan sistemi geliştirme |
| 11 | team / Belge 09 Güvenlik ve Uyum | 40 | 0.08 | Ekran: team — ekip yönetimi · Belge 09 Güvenlik ve Uyum · Modül: Ekip, yetki, denetim izi · Ekran: pin-permissions — PIN yetkileri |
| 12 | Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari | 39 | 0.11 | Sunum: WawiERP Rakipler ve Yol Haritası · Belge 10 Rakip ve Hedef Mimari · Nerede güçlüyüz, nerede eksik · Pazar haritası: odak (DE/TR) x derinlik (tam ERP/hafif b |
| 13 | orders-pool / Sipariş | 38 | 0.07 | Ekran: orders-pool — birleşik sipariş havuzu · Sipariş · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden · İade (DHL iade etiketinden otomatik doğar) |
| 14 | Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler | 37 | 0.09 | Sunum: WawiERP Yenilikler · Sonraki aday geliştirmeler (depo, satış, finans, yapay z · Yeni ekranlar (menüde "yeni" etiketli, 17 ekran) · Dalga 3: Fark yaratan |
| 15 | Ön Yüz Mimarisi / Çoklu dil: üç ayrı mekanizma, orta | 37 | 0.08 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · Çoklu dil: üç ayrı mekanizma, ortak çatı yok · Öneri: modüler yükleme, ES modülleri/TypeScript, tek ver · i18n 2: wawiText yardımcısı (Türkçe metin anahtar, 11 do |
| 16 | Landing.tsx / Sidebar.tsx | 36 | 0.08 | Landing.tsx · Sidebar.tsx · Landing() · Logo() |
| 17 | customers-master / Satış faturası RE-<şirket>-<yıl>-< | 32 | 0.11 | Ekran: customers-master — müşteri ana kaydı · Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleş · B2B cari (48 cari, para birimi başına ayrı bakiye) · Panel belgesi 06 Yeniden denenen ekranlar (5. tur) |
| 18 | Üç stok modeli / Dropshipping stok modeli | 31 | 0.10 | Üç stok modeli (ayırt edici fikir) · Dropshipping stok modeli · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV · İş akışı 6: Drop ürün / Asterbuy akışı |
| 19 | Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt | 31 | 0.11 | Karar 0006 - Panelde yapay zekâ asistanı · Asistan akışı: soru → veri → yanıt; iş → taslak → onay · Kendiliğinden düzeyi · Hazırla, onayla düzeyi (varsayılan) |
| 20 | package.json / devDependencies | 30 | 0.09 | package.json · devDependencies · react-dom · dependencies |
| 21 | /api/menu-counts.php / Sayac/oturum uclari | 29 | 0.12 | API: /api/menu-counts.php · Sayac/oturum uclari · Belge 08 Performans (pasif ölçüm) · API: /api/warehouse-messages.php |
| 22 | video-uret.py / go() | 29 | 0.13 | video-uret.py · go() · scroll() · s_alerts() |
| 23 | warehouse-home / overview | 28 | 0.25 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal · Ekran: overview — genel bakış: depo kartları, şirket/paz · Şirket · Almanya Warehouse (DE-WH, DE): 7 şirket, 122.934 ürün, 2 |
| 24 | /api/dhl-labels.php / dhl-labels.js | 28 | 0.10 | API: /api/dhl-labels.php · JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluş · JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ü · JS: dhl-recreate.js — Tek sipariş DHL etiketi yeniden ol |
| 25 | 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_ | 27 | 0.17 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma · Klasik form yolu POST ?page + erp_action · JS: erp.js — Depo/ürün/belge formları, ürün seçici, bark · JS: physical-stock-sync.js — Fiziki stok senkron ilerlem |
| 26 | Beyin katmanı / WawiERP Claude Kuralları | 25 | 0.18 | Beyin katmanı (graphify) · WawiERP Claude Kuralları (CLAUDE.md) · Hafıza katmanı (Cognee, [wavierp] etiketi) · Kaynak katmanı (tek doğruluk) |
| 27 | Sıradaki adımlar / Ne hazır, ne değil durum tablosu | 25 | 0.09 | Sıradaki adımlar · Ne hazır, ne değil durum tablosu · Belge 11 Yeniden Tasarım Girdileri · Bilinen mevcut durum (tek PHP girişi, stok defteri yok,  |
| 28 | Selling.tsx / Thumb() | 25 | 0.16 | Selling.tsx · Thumb() · PriceRules() · company() |
| 29 | assistant.mjs / server.mjs | 24 | 0.11 | assistant.mjs · server.mjs · handleAssistant() · handleContent() |
| 30 | Platform.tsx / Role | 24 | 0.09 | Platform.tsx · Role · Country · fakeKey() |
| 31 | WawiERP / Hedef pazar: Almanya / DE | 21 | 0.16 | WawiERP (wawib2b.com) · Hedef pazar: Almanya / DE · JTL-Wawi entegrasyonu (mevcut) · Hedef pazar: Türkiye / TR |
| 32 | Gerçek ürün fotoğrafları / İş akışı 5: Mükerrer birleştirme | 21 | 0.12 | Gerçek ürün fotoğrafları (Wikimedia Commons, 128 piksel  · İş akışı 5: Mükerrer birleştirme · Benzer ürün önerisi: stoktaki diğer markalardan en yakın · Ekran: Veri kalitesi ("sıradakini düzelt" kuyruğu) |
| 33 | Chat.tsx / ChatProvider() | 21 | 0.11 | Chat.tsx · ChatProvider() · lower() · dmId() |
| 34 | fmtNum() / Reservations.tsx | 21 | 0.20 | fmtNum() · Reservations.tsx · whName() · Catalog() |
| 35 | Mobile.tsx / Count() | 20 | 0.26 | Mobile.tsx · Count() · Pack() · Recv() |
| 36 | Automation.tsx / Drawer() | 18 | 0.14 | Automation.tsx · Drawer() · Rules() · Builder() |
| 37 | Quality.tsx / QualityQueue() | 18 | 0.16 | Quality.tsx · QualityQueue() · dupGroups() · jaccard() |
| 38 | Bilgi Mimarisi / i18n 3: Satır içi t(tr, de) yardım | 17 | 0.19 | Belge: Bilgi Mimarisi · i18n 3: Satır içi t(tr, de) yardımcıları (13 dosya) · Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici) · Desen: mobil ve görsel katman dosyaları (mobile-workspac |
| 39 | İlan yaşam döngüsü / Adım 3: Kategori eşleme | 17 | 0.18 | İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → d · Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim · Adım 6: Yayında (satır/toplu stok ve fiyat güncelle) · erp_action: sync_sales_listings |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (99 bağlantı)
- Badge() (71 bağlantı)
- useStore() (70 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- Card() (62 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- fmtNum() (54 bağlantı)
- PageHead() (53 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (52 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (49 bağlantı)
