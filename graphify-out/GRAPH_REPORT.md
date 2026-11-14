# Graph Report - WaviERP  (2026-11-14)

## Corpus Check
- 11 files · ~49,727 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 926 nodes · 2338 edges · 58 communities (48 shown, 10 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 248 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Ekran: warehouse-home — depo çalışma alanı: şirk
- Ekran: audit-logs — denetim kayıtları
- Belge: Alan Modeli
- Ekran: orders-pool — birleşik sipariş havuzu
- Beyin katmanı (graphify)
- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)
- API: /api/menu-counts.php
- Kanal sınıfı: kanala özel sayfalar (ayrı JS + ay
- panel-harita.md: WawiERP panel keşif haritası
- Belge 10 Rakip ve Hedef Mimari
- API: /api/dhl-labels.php
- WawiERP (wawib2b.com)
- Ekran: shipping — kargo (DHL merkezi, manuel pan
- Ekran: accounting — ön muhasebe
- Ekran: customers-master — müşteri ana kaydı
- Belge: Satış Kanalları Ekranları (03-satis-kanal
- Belge: Bilgi Mimarisi
- Belge: API Yuzeyi
- warehouse_product
- Klasik form yolu POST ?page + erp_action
- İlan yaşam döngüsü (havuz → hazırlık → önizle/on
- Modül: Pazaryerleri ve mağazalar
- Ekran: invoices — faturalar
- Ekran: warehouse — depo ürün listesi (Ürün havuz
- Ekran: physical-stock-check — sorunlu fiziki ürü
- API: /api/invoices.php
- Ürün
- Ekran: company-home — şirket/kanal çalışma alanı
- 02-urun-katalog-stok.md: Ürün, katalog, stok, sa
- Yeniden kurulan menu agaci (yerlesim tahmin)
- Çıkış belgesi defteri (SF/SV rozetleri, 1.763 be
- Entegrasyonlar: mevcut (19)
- Ekran: tr-market-products — Türkiye kataloğu ürü
- Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/
- Çoklu dil: üç ayrı mekanizma, ortak çatı yok
- Ekran: tickets — destek talepleri
- Depolar arası sevkiyat
- Toptan satış sihirbazı (save_customer, products,
- Satış kanalı: şirket + pazaryeri/platform + hesa
- İş akışı 3: Stok girişi / mal kabul
- product_key biçimi: kaynağa göre farklı (5 biçim
- İş akışı 5: Mükerrer birleştirme
- Fatura
- İş akışı 3 Toplama: şirket/DHL hesabı seç
- İş akışı 8 İade: DHL iade etiketi listelenir
- İş akışı 7 Depo içi sevk: plan taslağı
- İş akışı 1: Yeni ürün girişi (sihirbaz)
- KDV/MwSt satış özeti sabit %19
- Sorun: muhasebe özeti boş, fatura defterini kull
- Görülemeyenler: toptan listeler, task=prepare li
- Toplu fatura PDF/e-posta (shipping)
- İş akışı 1 Sipariş girişi: platform otomatik akt
- Finans akışı 2: liste İşlemler Faturayı düzenle
- Sıkı CSP başlıkları
- Açık soru 9: iş modeli, dışarıya hizmet ve çok k
- WawiERP Panel: Finans ve Yönetim
- Para birimleri EUR, TRY, USD, GBP (tahsilatta CZ

## God Nodes (most connected - your core abstractions)
1. `Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)` - 99 edges
2. `panel-harita.md: WawiERP panel keşif haritası` - 65 edges
3. `Tek giriş noktası /?page=<ad> (54 page değeri)` - 57 edges
4. `Ekran: orders-pool — birleşik sipariş havuzu` - 52 edges
5. `Belge: Satış Kanalları Ekranları (03-satis-kanallari.md)` - 49 edges
6. `Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok yönetimi)` - 39 edges
7. `Yeniden kurulan menu agaci (yerlesim tahmin)` - 37 edges
8. `WawiERP (wawib2b.com)` - 36 edges
9. `Ekran: warehouse-home — depo çalışma alanı: şirket-kanal kapsamı, veri akışı` - 36 edges
10. `Belge: Alan Modeli` - 36 edges

## Surprising Connections (you probably didn't know these)
- `WawiERP Claude Kuralları (CLAUDE.md)` --semantically_similar_to--> `Oturum döngüsü (başlangıç, çalışma, bitiş)`  [INFERRED] [semantically similar]
  CLAUDE.md → docs/02-hafiza-beyin-mimarisi.md
- `Ekran: accounting — ön muhasebe` --references--> `eBay (mevcut)`  [INFERRED]
  raw/panel-harita.md → docs/01-sirket-analizi.md
- `Ekran: accounting — ön muhasebe` --references--> `Kaufland (mevcut)`  [INFERRED]
  raw/panel-harita.md → docs/01-sirket-analizi.md
- `Ekran: erp-features — ERP özellik ayarları` --references--> `Modül: Ön muhasebe ve cari`  [INFERRED]
  raw/panel-harita.md → docs/01-sirket-analizi.md
- `Ekran: finance-documents — finans belgeleri` --references--> `Sipariş`  [INFERRED]
  raw/panel-harita.md → docs/01-sirket-analizi.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **DHL etiket JS üçlüsü ve ortak uç** — docs_panel_05_on_yuz_mimarisi_js_dhl_labels, docs_panel_05_on_yuz_mimarisi_js_dhl_recreate, docs_panel_05_on_yuz_mimarisi_js_dhl_recreate_batch, docs_panel_05_on_yuz_mimarisi_api_dhl_labels [EXTRACTED 0.95]
- **Fatura/paketleme JS dosyaları ve invoices.php** — docs_panel_05_on_yuz_mimarisi_js_invoice_workflow, docs_panel_05_on_yuz_mimarisi_js_invoice_edit, docs_panel_05_on_yuz_mimarisi_js_invoice_marketplace, docs_panel_05_on_yuz_mimarisi_js_invoice_order_pipeline, docs_panel_05_on_yuz_mimarisi_js_packing_workflow, docs_panel_05_on_yuz_mimarisi_api_invoices [EXTRACTED 0.95]
- **İlan yaşam döngüsü (9 adım)** — docs_panel_03_satis_kanallari_adim_havuz, docs_panel_03_satis_kanallari_adim_hazirlik, docs_panel_03_satis_kanallari_adim_kategori_esleme, docs_panel_03_satis_kanallari_adim_onizleme_onay, docs_panel_03_satis_kanallari_adim_durum_kontrol, docs_panel_03_satis_kanallari_adim_yayinda, docs_panel_03_satis_kanallari_adim_sorun, docs_panel_03_satis_kanallari_adim_cikarma, docs_panel_03_satis_kanallari_adim_kayit [EXTRACTED 0.95]
- **Asterbuy drop akışı** — docs_panel_02_urun_katalog_stok_w6, raw_panel_harita_page_dropshipping, raw_panel_harita_page_asterbuy_orders, docs_panel_02_urun_katalog_stok_asterbuy [EXTRACTED 1.00]
- **Barkodla sayım -> pazaryeri adedi karşılaştırma** — docs_panel_02_urun_katalog_stok_w2, raw_panel_harita_page_physical_stock_check, raw_panel_harita_page_catalog_governance [EXTRACTED 1.00]
- **İade yaşam döngüsü** — docs_panel_01_siparis_kargo_iade_wf_iade_1, docs_panel_01_siparis_kargo_iade_wf_iade_2, docs_panel_01_siparis_kargo_iade_wf_iade_3, docs_panel_01_siparis_kargo_iade_wf_iade_4, docs_panel_01_siparis_kargo_iade_wf_iade_5 [EXTRACTED 1.00]
- **Sipariş toplama ve DHL etiket akışı** — docs_panel_01_siparis_kargo_iade_wf_etiket_1, docs_panel_01_siparis_kargo_iade_wf_etiket_2, docs_panel_01_siparis_kargo_iade_wf_etiket_3, docs_panel_01_siparis_kargo_iade_wf_etiket_4, docs_panel_01_siparis_kargo_iade_wf_etiket_5 [EXTRACTED 1.00]
- **Sipariş yolculuğu akışı** — docs_01_sirket_analizi_y1, docs_01_sirket_analizi_y2, docs_01_sirket_analizi_y3, docs_01_sirket_analizi_y4, docs_01_sirket_analizi_y5 [EXTRACTED 1.00]
- **Siparişten faturaya belge zinciri** — docs_panel_04_finans_yonetim_wf_fatura_1, docs_panel_04_finans_yonetim_wf_fatura_2, docs_panel_04_finans_yonetim_wf_fatura_3, docs_panel_04_finans_yonetim_wf_fatura_4 [EXTRACTED 1.00]
- **Stok dağıtım: önizleme -> kayıt** — docs_panel_02_urun_katalog_stok_w4, raw_panel_harita_page_stock_transfer, erp_action_preview_stock_distribution, raw_panel_harita_depo_istanbul_warehouse [EXTRACTED 1.00]
- **Kaynak-Beyin-Hafıza üçlüsü** — docs_02_hafiza_beyin_mimarisi_kaynak, docs_02_hafiza_beyin_mimarisi_beyin, docs_02_hafiza_beyin_mimarisi_hafiza [EXTRACTED 1.00]
- **Üç stok modeli** — docs_01_sirket_analizi_s_fiziki, docs_01_sirket_analizi_s_sanal, docs_01_sirket_analizi_s_drop [EXTRACTED 1.00]
- **Yeniden tasarim ilkeleri (8)** — docs_03_panel_analizi_tek_kanal_baglastirici, docs_03_panel_analizi_stok_defteri, docs_03_panel_analizi_tek_yazma_yolu, docs_03_panel_analizi_arka_plan_isleri, docs_03_panel_analizi_baglam_rotada, docs_03_panel_analizi_kisisel_veri_yetkiyle, docs_03_panel_analizi_ulke_bazli_vergi, docs_03_panel_analizi_sayaclar_tek_kaynak [EXTRACTED 1.00]
- **Gezinme yuzeyini kuran JS dosyalari** — docs_panel_05_on_yuz_mimarisi_js_topbar_sections, docs_panel_05_on_yuz_mimarisi_js_sidebar_position, docs_panel_05_on_yuz_mimarisi_js_sidebar_search, docs_panel_05_on_yuz_mimarisi_js_mobile_workspace [EXTRACTED 1.00]
- **Alan modelindeki durum makineleri** — docs_06_alan_modeli_durum_siparis, docs_06_alan_modeli_durum_iade, docs_06_alan_modeli_durum_ilan, docs_06_alan_modeli_durum_fatura, docs_06_alan_modeli_durum_sevkiyat, docs_06_alan_modeli_durum_ticket, docs_06_alan_modeli_durum_stok [EXTRACTED 1.00]
- **Fatura ailesi: invoices.php kullanan JS dosyalari** — docs_panel_05_on_yuz_mimarisi_api_invoices, docs_panel_05_on_yuz_mimarisi_js_invoice_workflow, docs_panel_05_on_yuz_mimarisi_js_invoice_edit, docs_panel_05_on_yuz_mimarisi_js_invoice_marketplace, docs_panel_05_on_yuz_mimarisi_js_packing_workflow [EXTRACTED 1.00]
- **Hedef mimari seçenekleri A/B/C** — docs_10_rakip_ve_hedef_mimari_secenek_a, docs_10_rakip_ve_hedef_mimari_secenek_b, docs_10_rakip_ve_hedef_mimari_secenek_c [EXTRACTED 1.00]
- **Sayaç tutarsızlığı ve yavaşlık sorun kümesi (S2, S4, tek kaynak ilkesi)** — docs_11_yeniden_tasarim_girdileri_s2, docs_11_yeniden_tasarim_girdileri_s4, docs_11_yeniden_tasarim_girdileri_ilke_tek_kaynak_sayac, docs_08_performans_sayac_ucu_cogullugu [INFERRED 0.85]
- **Kişisel veri ve kimlik güvenliği kümesi (S1, S6, maskeleme ilkesi)** — docs_11_yeniden_tasarim_girdileri_s1, docs_11_yeniden_tasarim_girdileri_s6, docs_11_yeniden_tasarim_girdileri_ilke_sunucu_maskeleme, docs_09_guvenlik_uyum_kisisel_veri_dom, docs_09_guvenlik_uyum_pin_kimlik [INFERRED 0.85]

## Communities (58 total, 10 thin omitted)

### Community 0 - "Ekran: warehouse-home — depo çalışma alanı: şirk"
Cohesion: 0.06
Nodes (70): Depo, Şirket, Tedarikçi, Modül: Çoklu depo ve şirket, Modül: Satın alma ve tedarikçiler, Dropshipping stok modeli, En cok baglantili kavramlar, Asterbuy: Kontrol edilecek (hata/inceleme, tahmin) (+62 more)

### Community 1 - "Ekran: audit-logs — denetim kayıtları"
Cohesion: 0.05
Nodes (51): Modül: Ekip, yetki, denetim izi, Belge 09 Güvenlik ve Uyum, Giriş sayfası başlıkları ve CSP, Denetim kaydı kapsamı (180/30 gün saklama), DSGVO/KVKK boşlukları (Impressum, AVV, silme, aktarım), E-fatura (XRechnung/ZUGFeRD) gereksinimi, GoBD fatura saklama ve değişmezlik, HSTS yok (+43 more)

### Community 2 - "Belge: Alan Modeli"
Cohesion: 0.06
Nodes (45): Belge: Panel Analizi - Birlesik Bulgular, Baglam adreste tasiniyor (company, warehouse, channel, account), Sorun: kanal esitlemeleri bayat (Ozon, OTTO), Koda gomulu kanal/depo kimlikleri, Hiyerarsi Depo -> Sirket -> Kanal -> Hesap, Iki ayri yazma yolu (erp_action formu + /api/*.php), Ilan yasam dongusu (havuz -> onizle -> gonder -> kontrol -> kaldir), Sorun: musteri verisi sayfa kaynaginda duz metin (+37 more)

### Community 3 - "Ekran: orders-pool — birleşik sipariş havuzu"
Cohesion: 0.06
Nodes (33): Sipariş, XML/CSV (mevcut), Modül: Birleşik sipariş havuzu, WawiERP Panel: Sipariş, Kargo, İade, Destek Alanı, data-dhl-order/download/settings/recreate, data-external-tracking-order: harici takip no, DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden oluşturulabilir), Sipariş durumu: Hazırlanıyor (İşlemde) (+25 more)

### Community 4 - "Beyin katmanı (graphify)"
Cohesion: 0.09
Nodes (35): Oturum başında kuralları, Çalışırken kuralları, WawiERP Claude Kuralları (CLAUDE.md), Oturum sonunda kuralları, Cloudflare (DNS, proxy, analitik), DNS / DNSSEC kapalı, Alan adı wawib2b.com (Namecheap), E-posta altyapısı (MX/SPF/DMARC) (+27 more)

### Community 5 - "Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)"
Cohesion: 0.09
Nodes (31): API: /api/barcode-count.php, API: /api/catalog-search.php, API: /api/company-applications.php, API: /api/marketplace-stop.php, API: /api/product-entry.php, API: /api/product-list-insights.php, API: /api/product-organization.php, API: /api/product-platforms.php (+23 more)

### Community 6 - "API: /api/menu-counts.php"
Cohesion: 0.11
Nodes (22): Baglama gore degisen menu (sirket, depo, kanal, izin, dil), Sayac/oturum uclari, Belge 08 Performans (pasif ölçüm), Pasif ölçüm yöntemi ve sınırları (tek ölçüm/sayfa), Sayfa başına 91-98 istek, Yinelenen istek (product-pool-count x2, 43 betik), Açık soru 10: session-status ve warehouse-messages hangi dosyada çağrılıyor, S4 Menü sayaçları 6-8 sn, sayfa başına 91-98 istek (puan 6) (+14 more)

### Community 7 - "Kanal sınıfı: kanala özel sayfalar (ayrı JS + ay"
Cohesion: 0.18
Nodes (22): Kaufland (mevcut), Shopify (mevcut), Fiyat ve adet hesap bazında ayrı kayıt (Wawi fiyatı ≠ platform fiyatı), Görülemeyen: send-kaufland products ve issues listeleri, Görülemeyen: shopify-pool, send-shopify, ozon-pool, send-ozon, mixoutlet-payments, worklist images satırları, eBay: ebay-pool (tüm ilanlar) + send-ebay (gönder) ikilisi, Kaufland: send-kaufland, catalog=kaufland/products/issues, Mixoutlet / Mollie ödeme eşleştirme kanalı (+14 more)

### Community 8 - "panel-harita.md: WawiERP panel keşif haritası"
Cohesion: 0.12
Nodes (19): Sorun: yavas liste uclari, 504, zaman asimi, bulk_products_download alanı (erp_action değil): şablon/CSV dışa aktarma, Sorun/not kaydı: sorun türleri, not, durum (Açık / Çözüldü), dosyalar, Shopify geçmişi 60 gün sınırı (read_all_orders), Sorun (reason) kodları ve durum open/resolved/all, panel-harita.md: WawiERP panel keşif haritası, Dil: TR / DE, Ön yüz: 42 düz JS dosyası, çerçeve yok (+11 more)

### Community 9 - "Belge 10 Rakip ve Hedef Mimari"
Cohesion: 0.10
Nodes (25): Belge 10 Rakip ve Hedef Mimari, Base (BaseLinker), Bilinen mevcut durum (tek PHP girişi, stok defteri yok, iki yazma yolu), Billbee, Doğrulanamayan rakip verileri (resmi fiyat sayfaları açılamadı), Dopigo (TR entegratör), Entegra (TR entegratör), JTL-Wawi (+17 more)

### Community 10 - "API: /api/dhl-labels.php"
Cohesion: 0.10
Nodes (23): Sorun: denetim kaydi DHL gurultusu, Varlik: B2B cari (musteri, lokasyon, portal kullanicisi, tahsilat), innerHTML kullanimi, kacis dogrulanmadi, DHL / kargo ailesi, X-Request-ID izleme yalniz DHL'de, Tek uc, cok eylem (invoices ~35, dhl-labels ~40), S13 Sabit kodlanmış kanal/depo kimlikleri (puan 2), API: /api/dhl-labels.php (+15 more)

### Community 11 - "WawiERP (wawib2b.com)"
Cohesion: 0.12
Nodes (25): Yeniden tasarım için açık sorular (4), WAWIWELCOME oturum çerezi, PHP 8.1.34 (klasik PHP uygulama), Billbee entegrasyonu (mevcut), JTL-Wawi entegrasyonu (mevcut), Risk: fiyat, demo, referans yok, Risk: Impressum, gizlilik, KVKK/GDPR metni yok, Risk: şirket kimliği (tüzel kişilik, adres) yok (+17 more)

### Community 12 - "Ekran: shipping — kargo (DHL merkezi, manuel pan"
Cohesion: 0.16
Nodes (15): Sorun: shipments/shipping ve pool adlandirmasi, Sorun: kanal basina kopya sayfa/JS/uc, Adlandirma tutarsizliklari (shipments/shipping, pool, sorunlu, TR/DE/EN), Ayni ise giden yinelenen yollar, data-* düğmeleri + JS ile çalışan eylemler (erp_action yok), data-open: iade ayrıntı diyaloğu, data-pack-action: toplama listesi, toplu fatura, data-action: fetch-ebay-orders (limit 200) (+7 more)

### Community 13 - "Ekran: accounting — ön muhasebe"
Cohesion: 0.13
Nodes (18): Yavaş sayfa TTFB (warehouse-home 3,2 sn), KDV/OSS: sabit %19 özet riski, Açık soru 2: şirket başına KDV oranları/OSS ve muhasebe kaynağı, S2 Sayaç ve özetler çelişiyor (puan 9), S3 KDV özeti %19 sabit (puan 6), Satış özeti (çoklu para birimi), İş akışı 10 Raporlama: order-summary, Excel dışa aktar, Muhasebe Kaydı, Kanal kartları: Siparişleri al, bağlantıyı yönet (+10 more)

### Community 14 - "Ekran: customers-master — müşteri ana kaydı"
Cohesion: 0.19
Nodes (17): B2B cari (48 cari, para birimi başına ayrı bakiye), Cari borcu = satış faturaları − tahsilatlar, para birimleri toplanmaz, CARİ KAYDI EKSİK rozeti, Cari lokasyonu (teslimat, müşteri portalı stoğu), Cari portal kullanıcısı (can_adjust_stock yetkisi), Müşteri portalı yetkisi: kendi lokasyon stoğu, fatura, cari, Tahsilat (tarih, para birimi, tutar, referans), Panel belgesi 06 Yeniden denenen ekranlar (5. tur) (+9 more)

### Community 15 - "Belge: Satış Kanalları Ekranları (03-satis-kanal"
Cohesion: 0.23
Nodes (13): METRO (mevcut), Belge: Satış Kanalları Ekranları (03-satis-kanallari.md), Görülemeyen: engellenen desenlerle (import, delete, sync, send=, /api/ vb.) hiçbir adres açılmadı, Görülemeyen: METRO sipariş, havuz, gönder, Gitmeyen ürünler içerikleri (hesap seçimi boş), METRO: tek sayfa, view=pool/send/failed/orders/overview/messages/categories, API: /api/metro.php, JS: metro.js — METRO sayfa ana betiği, JS: metro-account-selection.js — METRO hesap seçimi (istemcide, tahmin) (+5 more)

### Community 16 - "Belge: Bilgi Mimarisi"
Cohesion: 0.18
Nodes (17): Belge: Bilgi Mimarisi, Kenar menu bolumleri (orders, products, companies, platforms, marketplaces, management, operations), Menu agacinin uc kopyasi (kenar, ust cubuk, cekmece), Mobil notlari (860px cekmece, ayni sayfaya JS katlama), Rol basina menu (yalniz sistem yoneticisi goruldu), Ekranlara tiklama sayisi (kurala dayali tahmin), Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici), Rol x depo x modul yetki matrisi belgesiz (+9 more)

### Community 17 - "Belge: API Yuzeyi"
Cohesion: 0.18
Nodes (18): Belge: API Yuzeyi, CSRF yalniz govde alani, header yok, 16 bayt idempotency anahtari (8 dosya), Ortak istek bicimi (fetch, JSON, same-origin, csrf govde alani), Oturum bitince JSON yerine HTML giris sayfasi (kirilgan sozlesme), Siparis cekme/esitleme uclari, Yazma yolu sayisi = 2, Yontem ve R/W sinifi eylem adindan cikarim (+10 more)

### Community 18 - "warehouse_product"
Cohesion: 0.26
Nodes (13): EAN, Depo EAN 3: depo sayımı barkodu, feed barkodunu değiştirmez, EAN 2: alternatif platform barkodu, Ürün kaynak dağılımı (13 kaynak): supplier-api 112.136, wawi_store 97.513, shopify 11.209, parfumarena 5.460, JTL 2.466, ebay 1.740, otto 601, shopify_admin 502, kaufland 462, manual 333, manual-count 90, bulk-import 9, ebay_pool 5, Paket ürün kuralı: is_pack, units_per_item (1 paket = 10 adet), Kanal başına platform SKU (platform_sku, company_channel_id), Ürün kartı (katalog, 232.526): product_key, başlık, kaynak, SKU, EAN 1/2, marka, kategori, varyantlar, paket kuralı, Ürün varyantı: "Varyantları göster · N seçenek", Varyantlar sekmesi (+5 more)

### Community 19 - "Klasik form yolu POST ?page + erp_action"
Cohesion: 0.27
Nodes (17): Varlik: stok hareketi (degismez kayit), Klasik form yolu POST ?page + erp_action, Depo ürün kaydı (151.075): ürün kartı x depo; sale_price, physical_stock, dropship_stock, minimum_stock, bin_location, Depo EAN 3, sanal stok, Stok hareketi: ürün, tarih, depo, önce->sonra, değişim, kullanıcı, Desen: iki yazma yolu — klasik form POST + erp_action ve JSON POST /api/*.php, JS: erp.js — Depo/ürün/belge formları, ürün seçici, barkod arama, stok dağıtımı, sayfalama (2.981 satır), JS: physical-stock-sync.js — Fiziki stok senkron ilerleme paneli, erp_action: add_stock (+9 more)

### Community 20 - "İlan yaşam döngüsü (havuz → hazırlık → önizle/on"
Cohesion: 0.18
Nodes (17): Adım 8: Çıkarma (Acil satıştan kaldır, withdraw), Adım 5: Durum kontrolü (eşzamansız sonuç), Adım 1: Havuz (Wawi ürün havuzu → kanal gönder sekmesi), Adım 2: Hazırlık (EAN, görsel, kategori, marka/model tamamla), Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim, Ozon çeviri), Adım 9: Kayıt (işlem geçmişi: publish, withdraw, auto_stock_policy), Adım 4: Önizleme ve onay (ayrı onay adımı), Adım 7: Sorun listesi (eksik/reddedilen, EAN boş, gönderim başarısız) (+9 more)

### Community 21 - "Modül: Pazaryerleri ve mağazalar"
Cohesion: 0.18
Nodes (15): Entegrasyonlar: kurulum talebi (≈50), eBay (mevcut), Etsy (kurulum talebi), Hepsiburada (kurulum talebi), idealo (mevcut), Temu (kurulum talebi), WooCommerce (kurulum talebi), Modül: Pazaryerleri ve mağazalar (+7 more)

### Community 22 - "Ekran: invoices — faturalar"
Cohesion: 0.20
Nodes (12): Modül: Faturalar ve belgeler, Sorun: sayac-liste ve stok/ticket tutarsizliklari, Açık soru 3: faturalar yalnız Almanya deposunda mı, Çıkış belgesi KPI: toplam, satış faturası, şirketler arası, sevk, kesin toplam, Tedarikçi faturası (1 kayıt, ödeme Ödenmedi), invoices view=purchases: Tedarikçi faturaları, Finans akışı 6: tedarikçi faturası ekle, PDF/görsel, Fatura verisi yalnız Almanya deposunda (+4 more)

### Community 23 - "Ekran: warehouse — depo ürün listesi (Ürün havuz"
Cohesion: 0.16
Nodes (9): Sanal stok, Stok Alert: fiziki stok <=2 (sayımı bilinmeyen, drop ve Asterbuy hariç), Drop stok (Wawi alanı dropship_stock), Kritik fiziki stok: <=5 (sıfır ve negatif dahil), Paket stoğu (paket birimi), Sanal stok (platform adedini etkileyen anahtar), Sanal stok yalnız web mağazası (Shopify) tedarik kapasitesi; pazaryerinde kullanılmaz, Stoksuz ve stok bilgisi belirsiz (sayılmamış) süzgeç değerleri (+1 more)

### Community 24 - "Ekran: physical-stock-check — sorunlu fiziki ürü"
Cohesion: 0.25
Nodes (15): Sorun: negatif fiziki stok (25.061 kritik kayit), S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6), Fiziki stok (sayılan; Sayım yok = bilinmiyor), İş akışı 2: Barkodla fiziki sayım, İş akışı 2 adım 1: Sayım deposu seç, İş akışı 2 adım 2: İşlemi yapanı seç, İş akışı 2 adım 3: SKU/EAN okut (+1), İş akışı 2 adım 4: Güncel stoğu kontrol et (+7 more)

### Community 25 - "API: /api/invoices.php"
Cohesion: 0.27
Nodes (13): Fatura ailesi (invoices.php), CSRF alanı ve sınırlı idempotency, S5 İki yazma yolu ve tek-uç-çok-eylem (puan 6), API: /api/invoices.php, Desen: fatura üçlüsü + paketleme aynı request/idempotency/Almanca sözlüğü paylaşmadan, Desen: request/api fetch sarmalayıcısı her dosyada yeniden yazılmış (AbortController + fetch + JSON denetimi), Desen: crypto.getRandomValues ile 16 baytlık idempotency anahtarı ve "otomatik tekrar yapılmadı" yaklaşımı, i18n: Dosya içi Almanca hata/durum sözlükleri (invoice-marketplace, invoice-order-pipeline) (+5 more)

### Community 26 - "Ürün"
Cohesion: 0.23
Nodes (14): SKU, Ürün, Modül: Ortak ürün kataloğu, Adım 1: Ürünü hazırla, Adım 2: Kaynağı seç, Adım 3: Kanala gönder, Adım 4: Siparişi hazırla, Adım 5: Müşteriye ulaş (+6 more)

### Community 27 - "Ekran: company-home — şirket/kanal çalışma alanı"
Cohesion: 0.21
Nodes (11): Amazon (mevcut), OTTO (mevcut), Kaynak chip sayıları (JTL 11.834, Amazon 3.895, eBay 3.877, Kaufland 1.291 ...), Chip toplamı 14.258i aşıyor (bir sipariş birden fazla chip, tahmin), Görülemeyen: OTTO orders/history/source ve Amazon products/listings sekmeleri yüklenmedi, Amazon: company-home içinde gömülü sekme takımı (amazon_tab, yalnız Woida), OTTO: company-home içinde gömülü sekme takımı (otto_tab), Kanal sınıfı: genel company-home görünümü (+3 more)

### Community 28 - "02-urun-katalog-stok.md: Ürün, katalog, stok, sa"
Cohesion: 0.19
Nodes (14): Gömülü global modallar (Depo/Tedarikçi/Şirket/Stok/Kategori ekle vb.), message_action=send (depolara mesaj; erp_action yok), 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma alanı, Katalog arşivi: kartlar görünümden kaldırılır, stok/eşleşme/fatura korunur, Kategori: ad, renk, ürün sayısı, depo görünürlüğü (411 kategori), İş akışı 7: EAN / görsel düzeltme, İş akışı 7 adım 1: Eksik EAN/görsel listesi, İş akışı 7 adım 2: EAN ekle / düzelt veya görsel düzenle (+6 more)

### Community 29 - "Yeniden kurulan menu agaci (yerlesim tahmin)"
Cohesion: 0.18
Nodes (12): Sorun: 79 iade ilk asamada, banka mutabakati, Yeniden kurulan menu agaci (yerlesim tahmin), Varlik: operasyonel not / sorun, Müşteri kişisel verisi DOM'da açık (istemcide gizleme), Açık soru 6: 79 iade neden ilk aşamada, S11 79 iade ilk aşamada kalmış (puan 4), API: /api/operational-notes.php, İade kaydı 79 (+4 more)

### Community 30 - "Çıkış belgesi defteri (SF/SV rozetleri, 1.763 be"
Cohesion: 0.18
Nodes (9): Belge ayrıntısı: kaynak sipariş no, KDV, net/brüt, Çıkış belgesi defteri (SF/SV rozetleri, 1.763 belge Almanya), İade faturası RET-<sipariş>-<n> (negatif tutar), Depolar arası sevk belgesi (stok değiştirmez), Şirketler arası fatura (0 kayıt), invoices view=returns: İade faturaları (47), Finans akışı 5: elle çıkış belgesi (stok hareketi ayrı), Finans akışı 3: İade faturası oluştur / satış faturası seç (+1 more)

### Community 31 - "Entegrasyonlar: mevcut (19)"
Cohesion: 0.24
Nodes (11): Entegrasyonlar: mevcut (19), DHL (mevcut), DPD (kurulum talebi), n11 (mevcut), PostNL (mevcut), Trendyol (mevcut), Modül: Toplama, paketleme, kargo, Trendyol ve N11: tr-market + tr-market-products (+3 more)

### Community 32 - "Ekran: tr-market-products — Türkiye kataloğu ürü"
Cohesion: 0.22
Nodes (7): Fiziki stok, Görülemeyen: tr-market questions/actions/history/dashboard, n11 products, tr-market-products platform, eBay gönderiminde stok kaynağı seçimi: Otomatik (Fiziki → Drop) / depo Fiziki / depo Drop, Platform satış stoğu depo sayımından ayrı kayıt (fiziki sayım değil), "Wawi'de hangi stok değişsin": Yalnız platform / Fiziki + eBay / Drop + eBay, Trendyol "aktarım dosyası" mantığı (doğrudan yayın değil — tahmin), Ekran: tr-market-products — Türkiye kataloğu ürünleri

### Community 33 - "Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/"
Cohesion: 0.25
Nodes (9): Eski ön ek WAWI-LE-<yıl>-<sıra>, Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleştirildi/İptal), Siparişten fatura oluştur (task=prepare): sipariş → şirket faturası → PDF → müşteriye gönder, invoices view=orders: Satış faturaları, Finans akışı 1: siparişi bul, Şirket faturası hazırla, PDF / yazdır, Müşteriye gönder (+1 more)

### Community 34 - "Çoklu dil: üç ayrı mekanizma, ortak çatı yok"
Cohesion: 0.22
Nodes (8): Genel nesneler (window): WawiLocale, WawiI18n, WawiDhlConfig, WawiOrderSelection vb., Dil seçimi: lang sorgu parametresi ve <html lang>, yalnız TR ve DE, Çoklu dil: üç ayrı mekanizma, ortak çatı yok, JS: catalog-labels.js — Üretilmiş katalog kategori sözlüğü TR↔DE (58 KB), JS: ui-dictionary-de-entry-pack-options-20261015.js — Almanca ek sözlük: ürün girişi paket seçenekleri, JS: ui-i18n.js — WawiI18n çekirdeği: sözlükle çeviri, i18n: Üretilmiş TR↔DE kategori sözlüğü (catalog-labels.js), i18n 1: Sunucu sözlüğü (WawiLocale + ui-i18n.js, yalnız lang=de)

### Community 35 - "Ekran: tickets — destek talepleri"
Cohesion: 0.32
Nodes (6): Ticket (pazaryeri müşteri sorusu), Ticket durumları: Yanıtımız bekleniyor, Müşteri/platform bekleniyor, Kapalı, Okunmamış, İş akışı 9 Destek: tickets mağaza soruları (28 gün), Mesaj seç, yanıtla (tahmin), Ekran: tickets — destek talepleri, Açık ticket 450

### Community 36 - "Depolar arası sevkiyat"
Cohesion: 0.43
Nodes (8): Depolar arası sevkiyat, Sevkiyat: Depodan çıktı (stok hareketi), Sevkiyat: Sevke hazır, Sevkiyat: İptal edildi, Sevkiyat: Mal kabul tamamlandı, Sevkiyat: Taslak, Sevkiyat: Hedef depoya ulaştı, Sevkiyat: Yolda

### Community 37 - "Toptan satış sihirbazı (save_customer, products,"
Cohesion: 0.25
Nodes (8): Toptan satış sihirbazı (save_customer, products, save, finalize, cancel, state, create), Finans akışı 4: cari seç/oluştur, Satıcı şirket + stok çıkış deposu, Ürünler, Doğrula, Kesinleştir (stok bir kez düşer), Fatura PDF, Tahsilat kaydı

### Community 38 - "Satış kanalı: şirket + pazaryeri/platform + hesa"
Cohesion: 0.33
Nodes (6): Satış kanalı: şirket + pazaryeri/platform + hesap (42 kanal), İş akışı 8: Fiyat güncelleme, İş akışı 8 adım 1: bulk-prices ızgarasında düzenle, İş akışı 8 adım 2: Kaydet ve gönder, erp_action: toggle_sales_stock_sync, Ekran: bulk-prices — toplu fiyat ızgarası

### Community 39 - "İş akışı 3: Stok girişi / mal kabul"
Cohesion: 0.48
Nodes (7): İş akışı 3: Stok girişi / mal kabul, İş akışı 3 adım 1: Ürün kartından Stoğa adet ekle, İş akışı 3 adım 2: Satın alma merkezinden mal kabul, İş akışı 3 adım 3: Tablodan hızlı düzenleme, İş akışı 3 adım 4: Toplu stok düzenleme, İş akışı 3 adım 5: CSV/Excel yükleme, erp_action: bulk_products_preview

### Community 40 - "product_key biçimi: kaynağa göre farklı (5 biçim"
Cohesion: 0.33
Nodes (6): product_key: ebay-account:16:<ilan>:<hash>, product_key: manual:<hash>, product_key: shopify:9:variant:<id>, product_key: sku:JTL-1051, product_key: supplier:asterbuy:<hash>, product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_id + product_key birleşik anahtar)

### Community 41 - "İş akışı 5: Mükerrer birleştirme"
Cohesion: 0.60
Nodes (6): İş akışı 5: Mükerrer birleştirme, İş akışı 5 adım 1: Eşleşme türü seç, İş akışı 5 adım 2: 2-20 kart seç, İş akışı 5 adım 3: Ana kartı seç, stok çatışmasını çöz, İş akışı 5 adım 4: Onay + yönetim PIN, İş akışı 5 adım 5: Birleştir ve kaydet

### Community 42 - "Fatura"
Cohesion: 0.50
Nodes (5): Fatura, Müşteri, Modül: B2B müşteri portalı, Modül: Ön muhasebe ve cari, data-invoice-*: fatura yazdır/düzenle/gönder/iade faturası

### Community 43 - "İş akışı 3 Toplama: şirket/DHL hesabı seç"
Cohesion: 0.40
Nodes (5): İş akışı 3 Toplama: şirket/DHL hesabı seç, Siparişleri getir ve seç, Toplama listesi, DHL etiket / toplu yazdır, Başarısızlar Oluşturulamayanlar filtresi → toplu yeniden oluştur

### Community 44 - "İş akışı 8 İade: DHL iade etiketi listelenir"
Cohesion: 0.40
Nodes (5): İş akışı 8 İade: DHL iade etiketi listelenir, İncele / işle, Ürün geldi kontrolü, Müşteriye ödeme / tekrar gönderim / sorun, Çözüldü

### Community 45 - "İş akışı 7 Depo içi sevk: plan taslağı"
Cohesion: 0.50
Nodes (4): İş akışı 7 Depo içi sevk: plan taslağı, Depodan çıkar (stok hareketi), Yolda, Hedef depoda mal kabul

### Community 46 - "İş akışı 1: Yeni ürün girişi (sihirbaz)"
Cohesion: 0.83
Nodes (4): İş akışı 1: Yeni ürün girişi (sihirbaz), İş akışı 1 adım 1: Havuzda EAN/ad/SKU ile ara, İş akışı 1 adım 2: Bulunamazsa yeni ürün formu (varyantsız/varyantlı), İş akışı 1 adım 3: eBay gönderimini hazırla

### Community 50 - "Toplu fatura PDF/e-posta (shipping)"
Cohesion: 0.67
Nodes (3): İş akışı 5 Fatura: satırdan yazdır/düzenle/gönder, Toplu fatura PDF/e-posta (shipping), İade faturası

## Ambiguous Edges - Review These
- `API: /api/warehouse-messages.php` → `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`  [AMBIGUOUS]
  docs/panel/05-on-yuz-mimarisi.md · relation: calls

## Knowledge Gaps
- **99 isolated node(s):** `Risk: DNSSEC kapalı, security.txt yok`, `Risk: fiyat, demo, referans yok`, `Risk: HSTS yok`, `Risk: şirket kimliği (tüzel kişilik, adres) yok`, `Risk: MX/SPF/DMARC kaydı yok` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 136 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)` connect `Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)` to `Çoklu dil: üç ayrı mekanizma, ortak çatı yok`, `API: /api/menu-counts.php`, `API: /api/dhl-labels.php`, `Belge: Bilgi Mimarisi`, `Belge: API Yuzeyi`, `Klasik form yolu POST ?page + erp_action`, `Modül: Pazaryerleri ve mağazalar`, `API: /api/invoices.php`, `Yeniden kurulan menu agaci (yerlesim tahmin)`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Ekran: orders-pool — birleşik sipariş havuzu` (e.g. with `Ekran: orders-ebay — eBay siparişleri` and `API: /api/menu-counts.php`) actually correct?**
  _`Ekran: orders-pool — birleşik sipariş havuzu` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Risk: DNSSEC kapalı, security.txt yok`, `Risk: fiyat, demo, referans yok`, `Risk: HSTS yok` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Ekran: warehouse-home — depo çalışma alanı: şirk` be split into smaller, more focused modules?**
  _Cohesion score 0.061668289516390785 - nodes in this community are weakly interconnected._
- **Why does `panel-harita.md: WawiERP panel keşif haritası` connect `panel-harita.md: WawiERP panel keşif haritası` to `Ekran: warehouse-home — depo çalışma alanı: şirk`, `Ekran: audit-logs — denetim kayıtları`, `Ekran: orders-pool — birleşik sipariş havuzu`, `Kanal sınıfı: kanala özel sayfalar (ayrı JS + ay`, `Ekran: shipping — kargo (DHL merkezi, manuel pan`, `Ekran: accounting — ön muhasebe`, `Ekran: customers-master — müşteri ana kaydı`, `Belge: Satış Kanalları Ekranları (03-satis-kanal`, `warehouse_product`, `Modül: Pazaryerleri ve mağazalar`, `Ekran: invoices — faturalar`, `Ekran: warehouse — depo ürün listesi (Ürün havuz`, `Ekran: physical-stock-check — sorunlu fiziki ürü`, `Ürün`, `Ekran: company-home — şirket/kanal çalışma alanı`, `Yeniden kurulan menu agaci (yerlesim tahmin)`, `Entegrasyonlar: mevcut (19)`, `Ekran: tr-market-products — Türkiye kataloğu ürü`, `Ekran: tickets — destek talepleri`, `Satış kanalı: şirket + pazaryeri/platform + hesa`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Should `Ekran: audit-logs — denetim kayıtları` be split into smaller, more focused modules?**
  _Cohesion score 0.05323653962492438 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `API: /api/warehouse-messages.php` and `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._