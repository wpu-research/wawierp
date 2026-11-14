# Kavram Köprüsü — Beyin (graphify) ↔ Hafıza (Cognee)

Tarih: 2026-11-14 · Bu dosya grafikten **otomatik üretilir**; elle düzenlenmez.

Amaç: grafiğin kavram sözlüğü ile Cognee kayıtları aynı kelimeleri kullansın. Cognee'ye yazılan her kayıt aşağıdaki küme adlarından birini anar; grafikte sorgu yaparken de aynı adlar kullanılır. Böylece hafızadan gelen bir karar grafikte ilgili kümeye, grafikteki bir düğüm de hafızadaki gerekçesine bağlanabilir.

Grafik: 773 düğüm · 1909 kenar · 49 küme · kenar güveni: AMBIGUOUS 1, EXTRACTED 1697, INFERRED 211

## Düğüm kimlik kuralları

| Tür | Kimlik deseni |
|---|---|
| Ekran | `raw_panel_harita_page_<ad>` |
| Depo | `raw_panel_harita_depo_<ad>` |
| Şirket | `raw_panel_harita_sirket_<ad>` |
| API ucu | `docs_panel_05_on_yuz_mimarisi_api_<ad>` |
| JS dosyası | `docs_panel_05_on_yuz_mimarisi_js_<ad>` |
| Form eylemi | `erp_action_<değer>` |

## Kümeler

| # | Küme | Düğüm | Uyum | Merkez kavramlar |
|---|---|---|---|---|
| 0 | Panel Haritası ve Satış Kanalları | 108 | 0.05 | panel-harita.md: WawiERP panel keşif haritası · Tek giriş noktası /?page=<ad> (54 page değeri) · Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) · Modül: Pazaryerleri ve mağazalar |
| 1 | Şirket Analizi, Hafıza ve Beyin | 68 | 0.05 | WawiERP (wawib2b.com) · Beyin katmanı (graphify) · Hedef pazar: Almanya / DE · Hafıza katmanı (Cognee, [wavierp] etiketi) |
| 2 | Depolar, Şirketler, Genel Bakış | 63 | 0.08 | Ekran: warehouse-home — depo çalışma alanı: şirket-kanal kap · Ekran: overview — genel bakış: depo kartları, şirket/pazarye · Şirket · Ekran: accounting — ön muhasebe |
| 3 | Birleşik Bulgular ve Tasarım İlkeleri | 45 | 0.06 | Belge: WawiERP Panel Analizi — Birleşik Bulgular (03-panel-a · Ekran: returns — iade yönetimi · İlke: Arka plan işleri kuyruk + durum ekranı; liste uçları s · İade (DHL iade etiketinden otomatik doğar) |
| 4 | Dropshipping ve Asterbuy | 30 | 0.11 | Dropshipping stok modeli · Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV har · İş akışı 6: Drop ürün / Asterbuy akışı · Tedarikçi |
| 5 | Depo Ürün Listesi ve Ürün Kartı | 25 | 0.18 | Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok yön · Ekran: warehouse-product — ürün detayı, düzenlenebilir depo  · Ürün kartı (katalog, 232.526): product_key, başlık, kaynak,  · Ekran: products — kaynak ürün kataloğu |
| 6 | Ön Yüz JS Mimarisi | 25 | 0.12 | Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) · JS: app.js — Ana uygulama: toast, gezinme, filtreler, JTL ha · Öneri: modüler yükleme, ES modülleri/TypeScript, tek veri ka · Sorun: Tek dosyada çok iş (erp.js 2.981, app.js, dhl-labels. |
| 7 | İlan Yaşam Döngüsü | 22 | 0.15 | İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → durum · Sipariş yolculuğu (5 adım) · Adım 2: Kaynağı seç · Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim, Oz |
| 8 | Ekip, Yetki, Denetim Kaydı | 21 | 0.16 | Modül: Ekip, yetki, denetim izi · Ekran: audit-logs — denetim kayıtları · Ekran: pin-permissions — PIN yetkileri · Ekran: team — ekip yönetimi |
| 9 | Fiziki Stok ve Sayım | 21 | 0.14 | Üç stok modeli (ayırt edici fikir) · İş akışı 2: Barkodla fiziki sayım · Ekran: physical-stock-check — sorunlu fiziki ürünler, pazary · Fiziki stok (sayılan; Sayım yok = bilinmiyor) |
| 10 | Depo Ürün Kaydı ve erp.js | 20 | 0.21 | 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma ala · Depo ürün kaydı (151.075): ürün kartı x depo; sale_price, ph · JS: erp.js — Depo/ürün/belge formları, ürün seçici, barkod a · Ürün |
| 11 | Faturalar ve Satın Alma | 18 | 0.16 | Ekran: invoices — faturalar · Fatura · İade faturası RET-<sipariş>-<n> (negatif tutar) · Tedarikçi faturası (1 kayıt, ödeme Ödenmedi) |
| 12 | Cari ve B2B Müşteri | 18 | 0.22 | Ekran: customers-master — müşteri ana kaydı · B2B cari (48 cari, para birimi başına ayrı bakiye) · Müşteri · Modül: B2B müşteri portalı |
| 13 | Depolar Arası Sevkiyat | 17 | 0.16 | Depolar arası sevkiyat · Ekran: shipments — gönderiler · Sevkiyat: Depodan çıktı (stok hareketi) · Sevkiyat: Sevke hazır |
| 14 | Sipariş Havuzu ve DHL Etiketi | 17 | 0.17 | Ekran: orders-pool — birleşik sipariş havuzu · DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden olu · Satır işlemleri: müşteri düzenle, not, etiket, harici takip, · Tedarik tipi: physical, dropship, asterbuy, bueroarena, b2bu |
| 15 | Toptan Satış ve Banka İçe Aktarma | 16 | 0.13 | JS: wholesale-sales.js — Toptan satış sihirbazı: cari, ürünl · JS: bank-import.js — Shopify havale/banka CSV içe aktarma (t · Sorun: Genel bakışta satış özeti ve en çok satanlar yüklenmi · Sorun: Genel bakış kartlarında uzun zaman aşımı sonrası hata |
| 16 | Kopyalanan Sipariş Listeleri | 15 | 0.19 | Ekran: orders-ebay — eBay siparişleri · Ekran: orders-kaufland — Kaufland siparişleri · Ekran: warehouse-orders — depo siparişleri · Sorun: Sipariş listesi şablonu 5 ekranda kopya (orders-pool, |
| 17 | Çoklu Dil Mekanizmaları | 15 | 0.14 | Çoklu dil: üç ayrı mekanizma, ortak çatı yok · i18n 2: wawiText yardımcısı (Türkçe metin anahtar, 11 dosya) · JS: barcode-count.js — Barkodla sayım (kamera, hızlı sayım) · JS: ui-i18n.js — WawiI18n çekirdeği: sözlükle çeviri |
| 18 | Yavaş Uçlar ve Sayaç Yoklama | 13 | 0.24 | Sorun: yavaş liste uçları (15-30 sn), zaman aşımı mesajı yok · API: /api/menu-counts.php · Desen: beş ayrı sayaç yoklama döngüsü (menu-counts, order-wo · Sorun: Çift ve gereksiz istekler (menu-counts 3-4 kez, ERR_A |
| 19 | Finans Belgeleri Defteri | 13 | 0.19 | Ekran: finance-documents — finans belgeleri · Çıkış belgesi defteri (SF/SV rozetleri, 1.763 belge Almanya) · Sorun: iade faturaları defterde DEPO SEVK BELGESI (SV) olara · Belge ayrıntısı: kaynak sipariş no, KDV, net/brüt |
| 20 | DHL Etiket JS ve Sabit Kimlikler | 12 | 0.30 | JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluşturm · API: /api/dhl-labels.php · Desen: request/api fetch sarmalayıcısı her dosyada yeniden y · Sorun: dhl-labs.js ve order-customer-edit.js içinde kanal/de |
| 21 | Sipariş Alımı ve Senkron | 11 | 0.18 | Sipariş · Sipariş alımı: arka plan işi / 10 dk senkron / elle güncelle · Modül: Birleşik sipariş havuzu · API: /api/kaufland-orders.php |
| 22 | Sorunlu Siparişler ve Notlar | 11 | 0.18 | Ekran: problem-orders — sorunlu siparişler · Sorun/Not (operasyonel not): sipariş veya ürüne bağlı · Sorun: sipariş detay sayfası yok, satır aşırı yoğun · Görülemeyenler: detay sayfası, resolved notlar, DHL hesap li |
| 23 | Stok Girişi ve Mal Kabul | 11 | 0.27 | Ekran: bulk-products — toplu ürün CSV/Excel içe-dışa aktarma · İş akışı 3: Stok girişi / mal kabul · Drop stok (Wawi alanı dropship_stock) · İş akışı 3 adım 3: Tablodan hızlı düzenleme |
| 24 | Katalog Yönetimi ve Mükerrerler | 11 | 0.25 | Ekran: catalog-governance — kategori kapsamı ve katalog arşi · Ekran: duplicate-products — mükerrer ürün birleştirme · Kategori: ad, renk, ürün sayısı, depo görünürlüğü (411 kateg · Sorun: yönetim PIN koruması tutarsız |
| 25 | Satır İçi Çeviri ve Görsel Katman | 11 | 0.20 | i18n 3: Satır içi t(tr, de) yardımcıları (13 dosya) · Desen: mobil ve görsel katman dosyaları (mobile-workspace, m · JS: external-tracking.js — Harici takip numarası girişi/doğr · JS: filter-buttons.js — Salt okunur filtre düğmeleri sunumu |
| 26 | Kargo Merkezi ve Taşıyıcılar | 10 | 0.24 | Ekran: shipping — kargo (DHL merkezi, manuel panel) · DHL (mevcut) · Modül: Toplama, paketleme, kargo · PostNL (mevcut) |
| 27 | Satış Faturası Akışı | 10 | 0.22 | Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleştiri · Siparişten fatura oluştur (task=prepare): sipariş → şirket f · Pazaryeri fatura aktarımı (queued→checking→creating→Metro→do · Şirket faturası hazırla |
| 28 | Fatura JS Üçlüsü | 10 | 0.36 | JS: invoice-workflow.js — Siparişten fatura, iade faturası,  · Desen: crypto.getRandomValues ile 16 baytlık idempotency ana · API: /api/invoices.php · Desen: fatura üçlüsü + paketleme aynı request/idempotency/Al |
| 29 | Stok Aktarım Akışı | 8 | 0.39 | İş akışı 4: Depolar arası stok aktarımı · Stok hareketi: ürün, tarih, depo, önce->sonra, değişim, kull · İş akışı 4 adım 4: Dağıtımı önizle · erp_action: preview_stock_distribution |
| 30 | Ortak Katman Eksikliği | 8 | 0.25 | Desen: modal/dialog kabuğu her dosyada ayrı yazılmış · JS: operational-notes.js — Sipariş/ürün iç notları, konuşmal · JS: marketplace-stop.js — Pazaryeri satışı durdurma penceres · Sorun: Ortak HTTP/i18n/modal katmanı yok (request ≥12 kez ko |
| 31 | Toptan Satış Akışı | 7 | 0.29 | Finans akışı 4: cari seç/oluştur · Satıcı şirket + stok çıkış deposu · Ürünler · Doğrula |
| 32 | Ortak Katalog ve İlan Varlığı | 6 | 0.33 | Modül: Ortak ürün kataloğu · SKU · Merkez katalog: tek katalog, çok depo kartı; fiyat ve stok d · Varlık: İlan (listing) — Wawi ürün kartıyla eşleşir |
| 33 | Sipariş Durumları | 6 | 0.47 | Sipariş durumu (Yeni, Hazırlanıyor, Tamamlandı, İptal/iade) · Sipariş durumu: Hazırlanıyor (İşlemde) · Sipariş durumu: Tamamlandı · Sipariş durumu: Yeni |
| 34 | Ticket ve Destek | 6 | 0.33 | Ticket (pazaryeri müşteri sorusu) · Sorun: ticket sayısı çelişkisi (450 açık vs 139 sayfa), duru · İş akışı 9 Destek: tickets mağaza soruları (28 gün) · Mesaj seç, yanıtla (tahmin) |
| 35 | product_key Biçimleri | 6 | 0.33 | product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_ · product_key: sku:JTL-1051 · product_key: supplier:asterbuy:<hash> · product_key: ebay-account:16:<ilan>:<hash> |
| 36 | Mükerrer Birleştirme Akışı | 6 | 0.60 | İş akışı 5: Mükerrer birleştirme · İş akışı 5 adım 2: 2-20 kart seç · İş akışı 5 adım 3: Ana kartı seç, stok çatışmasını çöz · İş akışı 5 adım 4: Onay + yönetim PIN |
| 37 | data-* Düğme Eylemleri | 5 | 0.40 | data-* düğmeleri + JS ile çalışan eylemler (erp_action yok) · data-open: iade ayrıntı diyaloğu · data-pack-action: toplama listesi, toplu fatura · data-action: fetch-ebay-orders (limit 200) |
| 38 | Yeni Ürün Sihirbazı | 4 | 0.83 | İş akışı 1: Yeni ürün girişi (sihirbaz) · İş akışı 1 adım 2: Bulunamazsa yeni ürün formu (varyantsız/v · İş akışı 1 adım 1: Havuzda EAN/ad/SKU ile ara · İş akışı 1 adım 3: eBay gönderimini hazırla |
| 39 | Sabit %19 KDV | 4 | 0.67 | KDV/MwSt satış özeti sabit %19 · KDV: satır bazında; muhasebe özeti sabit %19 · Sorun: sabit %19 KDV özeti · Yeniden tasarım: vergi özeti belge satırlarından üretilsin |
| 40 | Toptan Liste Yükleme Sorunu | 4 | 0.50 | Toptan taslak/satış faturası listeleri (hazırlanıyor… takılı · Görülemeyenler: toptan listeler, task=prepare listesi, pin-p · Sorun: toptan satış taslak/fatura listeleri açılmıyor · Yeniden tasarım: listeyi sunucuda çiz veya hata+yeniden dene |
| 41 | Toplu Fatura ve İade Faturası | 3 | 0.67 | Toplu fatura PDF/e-posta (shipping) · İş akışı 5 Fatura: satırdan yazdır/düzenle/gönder · İade faturası |
| 42 | EAN ve Görsel Düzeltme | 3 | 1.00 | İş akışı 7: EAN / görsel düzeltme · İş akışı 7 adım 1: Eksik EAN/görsel listesi · İş akışı 7 adım 2: EAN ekle / düzelt veya görsel düzenle |
| 43 | Fiyat Güncelleme Akışı | 3 | 1.00 | İş akışı 8: Fiyat güncelleme · İş akışı 8 adım 2: Kaydet ve gönder · İş akışı 8 adım 1: bulk-prices ızgarasında düzenle |
| 44 | Asterbuy Sipariş Kontrolü | 2 | 1.00 | İş akışı 1 Sipariş girişi: platform otomatik aktarım / elle  · Asterbuy 5 dakikada bir kontrol |
| 45 | Fatura Düzenleme Akışı | 2 | 1.00 | Finans akışı 2: liste İşlemler Faturayı düzenle · edit_context, edit_save |
| 46 | Güvenlik Başlıkları | 1 | 1.00 | Sıkı CSP başlıkları |
| 47 | Finans ve Yönetim Belgesi | 1 | 1.00 | WawiERP Panel: Finans ve Yönetim |
| 48 | Para Birimleri | 1 | 1.00 | Para birimleri EUR, TRY, USD, GBP (tahsilatta CZK, PLN) |

## En çok bağlantılı kavramlar

- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (100 bağlantı)
- panel-harita.md: WawiERP panel keşif haritası (65 bağlantı)
- Tek giriş noktası /?page=<ad> (54 page değeri) (57 bağlantı)
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md) (50 bağlantı)
- Belge: WawiERP Panel Analizi — Birleşik Bulgular (03-panel-analizi.md) (47 bağlantı)
- Ekran: orders-pool — birleşik sipariş havuzu (46 bağlantı)
- WawiERP (wawib2b.com) (36 bağlantı)
- Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok yönetimi) (33 bağlantı)
- Ekran: warehouse-home — depo çalışma alanı: şirket-kanal kapsamı, veri akışı (32 bağlantı)
- Ekran: overview — genel bakış: depo kartları, şirket/pazaryeri/platform sayıları, satış özeti (30 bağlantı)
