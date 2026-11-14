# Graph Report - WaviERP  (2026-11-14)

## Corpus Check
- 28 files · ~72,550 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1227 nodes · 3247 edges · 73 communities (63 shown, 10 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 280 edges (avg confidence: 0.8)
- Token cost: 91,888 input · 0 output

## Community Hubs (Navigation)
- 02-urun-katalog-stok.md: Ürün, katalog, stok, sa
- Ekran: audit-logs — denetim kayıtları
- Ekran: warehouse-home — depo çalışma alanı: şirk
- Extra.tsx
- Beyin katmanı (graphify)
- Catalog.tsx
- Finance.tsx
- WawiERP (wawib2b.com)
- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)
- Kanal sınıfı: kanala özel sayfalar (ayrı JS + ay
- panel-harita.md: WawiERP panel keşif haritası
- data.ts
- package.json
- Ekran: warehouse — depo ürün listesi (Ürün havuz
- API: /api/menu-counts.php
- Belge: Alan Modeli
- Belge 10 Rakip ve Hedef Mimari
- Yeniden kurulan menu agaci (yerlesim tahmin)
- Belge: Panel Analizi - Birlesik Bulgular
- Orders.tsx
- Ekran: customers-master — müşteri ana kaydı
- Üç stok modeli (ayırt edici fikir)
- JS: dhl-labels.js — DHL gönderi etiketi: hazırla
- Ekran: finance-documents — finans belgeleri
- Ekran: invoices — faturalar
- Ekran: orders-pool — birleşik sipariş havuzu
- API: /api/dhl-labels.php
- Belge: Satış Kanalları Ekranları (03-satis-kanal
- Belge: Bilgi Mimarisi
- Drop tedarikçi: Asterbuy (796 ürün, API, alış fi
- İlan yaşam döngüsü (havuz → hazırlık → önizle/on
- WawiERP Mimari ve Geçiş Sunumu
- Belge: API Yuzeyi
- Ekran: company-home — şirket/kanal çalışma alanı
- Ekran: physical-stock-check — sorunlu fiziki ürü
- Ekran: accounting — ön muhasebe
- Çoklu dil: üç ayrı mekanizma, ortak çatı yok
- Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/
- compilerOptions
- Ekran: catalog-governance — kategori kapsamı ve 
- Karar 0004 - Yığın ayrıntıları
- Modül: Pazaryerleri ve mağazalar
- Ekran: tr-market — Türkiye pazaryeri siparişleri
- WawiERP Teknoloji Seçenekleri Sunumu
- WawiERP Analiz Sunumu
- Karar 0005 - Bulut sağlayıcı
- Çok kiracılı (multi-tenant) sistem
- Depolar arası sevkiyat
- Yeni panel mock (Vite + React + TS + Tailwind)
- Finans akışı 4: cari seç/oluştur
- Ekran: erp-features — ERP özellik ayarları
- Sipariş yolculuğu (5 adım)
- Varlik: depo urun kaydi (~151 bin; warehouse_id 
- Sipariş durumu (Yeni, Hazırlanıyor, Tamamlandı, 
- İade (DHL iade etiketinden otomatik doğar)
- Banka içe aktarma penceresi (bank-import.js, Sho
- Karar 0003 - Teknoloji yığını
- İş akışı 6 Dropship: Oluşturulacak
- İş akışı 3 Toplama: şirket/DHL hesabı seç
- İş akışı 8 İade: DHL iade etiketi listelenir
- Iki ayri yazma yolu (erp_action formu + /api/*.p
- Gelen kutusu kısayolları (Fiziki 208, Drop Auto 
- İş akışı 7 Depo içi sevk: plan taslağı
- KDV/MwSt satış özeti sabit %19
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
8. `Ekran: warehouse-home — depo çalışma alanı: şirket-kanal kapsamı, veri akışı` - 36 edges
9. `WawiERP (wawib2b.com)` - 36 edges
10. `Belge: Alan Modeli` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Çok kiracılılık açıklaması` --semantically_similar_to--> `Çok kiracılı (multi-tenant) sistem`  [INFERRED] [semantically similar]
  sunum/wawierp-teknoloji-secenekleri.html → kararlar/0001-cok-kiracili-sistem.md
- `NestJS` --conceptually_related_to--> `typescript`  [INFERRED]
  kararlar/0004-yigin-ayrintilari.md → yeni/panel-mock/package.json
- `AWS CDK (TypeScript)` --implements--> `typescript`  [INFERRED]
  kararlar/0005-bulut-saglayici.md → yeni/panel-mock/package.json
- `WawiERP Claude Kuralları (CLAUDE.md)` --semantically_similar_to--> `Oturum döngüsü (başlangıç, çalışma, bitiş)`  [INFERRED] [semantically similar]
  CLAUDE.md → docs/02-hafiza-beyin-mimarisi.md
- `WawiERP mevcut sistem (54 ekran, 232.500 ürün)` --semantically_similar_to--> `Mevcut WawiERP (12 şirket, 5 depo, 41 kanal)`  [INFERRED] [semantically similar]
  sunum/wawierp-analiz-sunumu.html → kararlar/0001-cok-kiracili-sistem.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **DHL etiket JS üçlüsü ve ortak uç** — docs_panel_05_on_yuz_mimarisi_js_dhl_labels, docs_panel_05_on_yuz_mimarisi_js_dhl_recreate, docs_panel_05_on_yuz_mimarisi_js_dhl_recreate_batch, docs_panel_05_on_yuz_mimarisi_api_dhl_labels [EXTRACTED 0.95]
- **Fatura/paketleme JS dosyaları ve invoices.php** — docs_panel_05_on_yuz_mimarisi_js_invoice_workflow, docs_panel_05_on_yuz_mimarisi_js_invoice_edit, docs_panel_05_on_yuz_mimarisi_js_invoice_marketplace, docs_panel_05_on_yuz_mimarisi_js_invoice_order_pipeline, docs_panel_05_on_yuz_mimarisi_js_packing_workflow, docs_panel_05_on_yuz_mimarisi_api_invoices [EXTRACTED 0.95]
- **İlan yaşam döngüsü (9 adım)** — docs_panel_03_satis_kanallari_adim_havuz, docs_panel_03_satis_kanallari_adim_hazirlik, docs_panel_03_satis_kanallari_adim_kategori_esleme, docs_panel_03_satis_kanallari_adim_onizleme_onay, docs_panel_03_satis_kanallari_adim_durum_kontrol, docs_panel_03_satis_kanallari_adim_yayinda, docs_panel_03_satis_kanallari_adim_sorun, docs_panel_03_satis_kanallari_adim_cikarma, docs_panel_03_satis_kanallari_adim_kayit [EXTRACTED 0.95]
- **Alan modelindeki durum makineleri** — docs_06_alan_modeli_durum_siparis, docs_06_alan_modeli_durum_iade, docs_06_alan_modeli_durum_ilan, docs_06_alan_modeli_durum_fatura, docs_06_alan_modeli_durum_sevkiyat, docs_06_alan_modeli_durum_ticket, docs_06_alan_modeli_durum_stok [EXTRACTED 1.00]
- **Fatura ailesi: invoices.php kullanan JS dosyalari** — docs_panel_05_on_yuz_mimarisi_api_invoices, docs_panel_05_on_yuz_mimarisi_js_invoice_workflow, docs_panel_05_on_yuz_mimarisi_js_invoice_edit, docs_panel_05_on_yuz_mimarisi_js_invoice_marketplace, docs_panel_05_on_yuz_mimarisi_js_packing_workflow [EXTRACTED 1.00]
- **Asterbuy drop akışı** — docs_panel_02_urun_katalog_stok_w6, raw_panel_harita_page_dropshipping, raw_panel_harita_page_asterbuy_orders, docs_panel_02_urun_katalog_stok_asterbuy [EXTRACTED 1.00]
- **AWS Frankfurt bileşenleri** — kararlar_0005_bulut_saglayici_ecs_fargate, kararlar_0005_bulut_saglayici_rds, kararlar_0005_bulut_saglayici_elasticache, kararlar_0005_bulut_saglayici_s3, kararlar_0005_bulut_saglayici_secrets_kms, kararlar_0005_bulut_saglayici_aws_cdk, kararlar_0005_bulut_saglayici_ses [EXTRACTED 1.00]
- **Barkodla sayım -> pazaryeri adedi karşılaştırma** — docs_panel_02_urun_katalog_stok_w2, raw_panel_harita_page_physical_stock_check, raw_panel_harita_page_catalog_governance [EXTRACTED 1.00]
- **Hedef mimari seçenekleri A/B/C** — docs_10_rakip_ve_hedef_mimari_secenek_a, docs_10_rakip_ve_hedef_mimari_secenek_b, docs_10_rakip_ve_hedef_mimari_secenek_c [EXTRACTED 1.00]
- **İade yaşam döngüsü** — docs_panel_01_siparis_kargo_iade_wf_iade_1, docs_panel_01_siparis_kargo_iade_wf_iade_2, docs_panel_01_siparis_kargo_iade_wf_iade_3, docs_panel_01_siparis_kargo_iade_wf_iade_4, docs_panel_01_siparis_kargo_iade_wf_iade_5 [EXTRACTED 1.00]
- **Yeniden tasarim ilkeleri (8)** — docs_03_panel_analizi_tek_kanal_baglastirici, docs_03_panel_analizi_stok_defteri, docs_03_panel_analizi_tek_yazma_yolu, docs_03_panel_analizi_arka_plan_isleri, docs_03_panel_analizi_baglam_rotada, docs_03_panel_analizi_kisisel_veri_yetkiyle, docs_03_panel_analizi_ulke_bazli_vergi, docs_03_panel_analizi_sayaclar_tek_kaynak [EXTRACTED 1.00]
- **Sipariş toplama ve DHL etiket akışı** — docs_panel_01_siparis_kargo_iade_wf_etiket_1, docs_panel_01_siparis_kargo_iade_wf_etiket_2, docs_panel_01_siparis_kargo_iade_wf_etiket_3, docs_panel_01_siparis_kargo_iade_wf_etiket_4, docs_panel_01_siparis_kargo_iade_wf_etiket_5 [EXTRACTED 1.00]
- **Sipariş yolculuğu akışı** — docs_01_sirket_analizi_y1, docs_01_sirket_analizi_y2, docs_01_sirket_analizi_y3, docs_01_sirket_analizi_y4, docs_01_sirket_analizi_y5 [EXTRACTED 1.00]
- **Siparişten faturaya belge zinciri** — docs_panel_04_finans_yonetim_wf_fatura_1, docs_panel_04_finans_yonetim_wf_fatura_2, docs_panel_04_finans_yonetim_wf_fatura_3, docs_panel_04_finans_yonetim_wf_fatura_4 [EXTRACTED 1.00]
- **Stok dağıtım: önizleme -> kayıt** — docs_panel_02_urun_katalog_stok_w4, raw_panel_harita_page_stock_transfer, erp_action_preview_stock_distribution, raw_panel_harita_depo_istanbul_warehouse [EXTRACTED 1.00]
- **Onaylanan teknoloji yığını** — ref_typescript, kararlar_0003_teknoloji_yigini_postgresql, kararlar_0003_teknoloji_yigini_react, kararlar_0004_yigin_ayrintilari_nestjs, kararlar_0004_yigin_ayrintilari_prisma, kararlar_0004_yigin_ayrintilari_bullmq [EXTRACTED 1.00]
- **Gezinme yuzeyini kuran JS dosyalari** — docs_panel_05_on_yuz_mimarisi_js_topbar_sections, docs_panel_05_on_yuz_mimarisi_js_sidebar_position, docs_panel_05_on_yuz_mimarisi_js_sidebar_search, docs_panel_05_on_yuz_mimarisi_js_mobile_workspace [EXTRACTED 1.00]
- **Kaynak-Beyin-Hafıza üçlüsü** — docs_02_hafiza_beyin_mimarisi_kaynak, docs_02_hafiza_beyin_mimarisi_beyin, docs_02_hafiza_beyin_mimarisi_hafiza [EXTRACTED 1.00]
- **Üç stok modeli** — docs_01_sirket_analizi_s_fiziki, docs_01_sirket_analizi_s_sanal, docs_01_sirket_analizi_s_drop [EXTRACTED 1.00]
- **Kiracı yalıtımı: RLS, Prisma, BullMQ** — kararlar_0004_yigin_ayrintilari_rls, kararlar_0004_yigin_ayrintilari_prisma_rls_risk, kararlar_0004_yigin_ayrintilari_prisma, kararlar_0004_yigin_ayrintilari_bullmq, kararlar_0001_cok_kiracili_sistem_tenant [INFERRED 0.85]
- **Kişisel veri ve kimlik güvenliği kümesi (S1, S6, maskeleme ilkesi)** — docs_11_yeniden_tasarim_girdileri_s1, docs_11_yeniden_tasarim_girdileri_s6, docs_11_yeniden_tasarim_girdileri_ilke_sunucu_maskeleme, docs_09_guvenlik_uyum_kisisel_veri_dom, docs_09_guvenlik_uyum_pin_kimlik [INFERRED 0.85]
- **Sayaç tutarsızlığı ve yavaşlık sorun kümesi (S2, S4, tek kaynak ilkesi)** — docs_11_yeniden_tasarim_girdileri_s2, docs_11_yeniden_tasarim_girdileri_s4, docs_11_yeniden_tasarim_girdileri_ilke_tek_kaynak_sayac, docs_08_performans_sayac_ucu_cogullugu [INFERRED 0.85]

## Communities (73 total, 10 thin omitted)

### Community 0 - "02-urun-katalog-stok.md: Ürün, katalog, stok, sa"
Cohesion: 0.07
Nodes (62): Varlik: stok hareketi (degismez kayit), Klasik form yolu POST ?page + erp_action, Gömülü global modallar (Depo/Tedarikçi/Şirket/Stok/Kategori ekle vb.), message_action=send (depolara mesaj; erp_action yok), 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma alanı, Kategori: ad, renk, ürün sayısı, depo görünürlüğü (411 kategori), İş akışı 1: Yeni ürün girişi (sihirbaz), İş akışı 1 adım 1: Havuzda EAN/ad/SKU ile ara (+54 more)

### Community 1 - "Ekran: audit-logs — denetim kayıtları"
Cohesion: 0.05
Nodes (52): Modül: Ekip, yetki, denetim izi, Sorun: denetim kaydi DHL gurultusu, Rol basina menu (yalniz sistem yoneticisi goruldu), Rol x depo x modul yetki matrisi belgesiz, Belge 09 Güvenlik ve Uyum, Giriş sayfası başlıkları ve CSP, Denetim kaydı kapsamı (180/30 gün saklama), DSGVO/KVKK boşlukları (Impressum, AVV, silme, aktarım) (+44 more)

### Community 2 - "Ekran: warehouse-home — depo çalışma alanı: şirk"
Cohesion: 0.10
Nodes (47): Depo, Şirket, Tedarikçi, Modül: Çoklu depo ve şirket, Dropshipping stok modeli, En cok baglantili kavramlar, Asterbuy: Kontrol edilecek (hata/inceleme, tahmin), Asterbuy: Ödeme bekliyor (+39 more)

### Community 3 - "Extra.tsx"
Cohesion: 0.09
Nodes (38): B2B, B2B0, b2bTotals(), carrierOf(), CARRIERS, MANUAL0, ManualLabel, Msg (+30 more)

### Community 4 - "Beyin katmanı (graphify)"
Cohesion: 0.09
Nodes (35): Oturum başında kuralları, Çalışırken kuralları, WawiERP Claude Kuralları (CLAUDE.md), Oturum sonunda kuralları, Cloudflare (DNS, proxy, analitik), DNS / DNSSEC kapalı, Alan adı wawib2b.com (Namecheap), E-posta altyapısı (MX/SPF/DMARC) (+27 more)

### Community 5 - "Catalog.tsx"
Cohesion: 0.09
Nodes (32): lucide-react, react, App(), NAV, NavItem, NoAccess(), useRoute(), CHANNEL (+24 more)

### Community 6 - "Finance.tsx"
Cohesion: 0.28
Nodes (37): Shell(), ago(), company(), fmtDT(), fmtMoney(), fmtNum(), mask(), product() (+29 more)

### Community 7 - "WawiERP (wawib2b.com)"
Cohesion: 0.10
Nodes (33): Yeniden tasarım için açık sorular (4), Entegrasyonlar: mevcut (19), WAWIWELCOME oturum çerezi, PHP 8.1.34 (klasik PHP uygulama), Billbee entegrasyonu (mevcut), DHL (mevcut), DPD (kurulum talebi), idealo (mevcut) (+25 more)

### Community 8 - "Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)"
Cohesion: 0.10
Nodes (27): Rakip fiyatlar (eBay, Kaufland, Metro, Otto; 24 saatte bir okunur), API: /api/catalog-search.php, API: /api/company-applications.php, API: /api/marketplace-stop.php, API: /api/product-entry.php, API: /api/product-list-insights.php, API: /api/product-market-prices.php, API: /api/product-organization.php (+19 more)

### Community 9 - "Kanal sınıfı: kanala özel sayfalar (ayrı JS + ay"
Cohesion: 0.16
Nodes (24): Kaufland (mevcut), Shopify (mevcut), Kaufland hesap işleyişi: Sipariş alımı, Ürün havuzu aktarımı, Stok/fiyat otomasyonu, Fiyat ve adet hesap bazında ayrı kayıt (Wawi fiyatı ≠ platform fiyatı), Görülemeyen: send-kaufland products ve issues listeleri, Görülemeyen: shopify-pool, send-shopify, ozon-pool, send-ozon, mixoutlet-payments, worklist images satırları, eBay: ebay-pool (tüm ilanlar) + send-ebay (gönder) ikilisi, Kaufland: send-kaufland, catalog=kaufland/products/issues (+16 more)

### Community 10 - "panel-harita.md: WawiERP panel keşif haritası"
Cohesion: 0.11
Nodes (26): Müşteri kişisel verisi DOM'da açık (istemcide gizleme), Açık soru 6: 79 iade neden ilk aşamada, S11 79 iade ilk aşamada kalmış (puan 4), Ticket (pazaryeri müşteri sorusu), Ticket durumları: Yanıtımız bekleniyor, Müşteri/platform bekleniyor, Kapalı, Okunmamış, İş akışı 9 Destek: tickets mağaza soruları (28 gün), Mesaj seç, yanıtla (tahmin), Sorun/not kaydı: sorun türleri, not, durum (Açık / Çözüldü), dosyalar (+18 more)

### Community 11 - "data.ts"
Cohesion: 0.09
Nodes (28): ACC_BY_KEY, buildOrders(), CITY, Country, dayf, DROP_CATS, dtf, FIRST (+20 more)

### Community 12 - "package.json"
Cohesion: 0.09
Nodes (28): react-dom, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, vite, vite-plugin-singlefile, @vitejs/plugin-react (+20 more)

### Community 13 - "Ekran: warehouse — depo ürün listesi (Ürün havuz"
Cohesion: 0.15
Nodes (17): EAN, Depo EAN 3: depo sayımı barkodu, feed barkodunu değiştirmez, Depo ürün kaydı (151.075): ürün kartı x depo; sale_price, physical_stock, dropship_stock, minimum_stock, bin_location, Depo EAN 3, sanal stok, EAN 2: alternatif platform barkodu, Ürün kaynak dağılımı (13 kaynak): supplier-api 112.136, wawi_store 97.513, shopify 11.209, parfumarena 5.460, JTL 2.466, ebay 1.740, otto 601, shopify_admin 502, kaufland 462, manual 333, manual-count 90, bulk-import 9, ebay_pool 5, Paket ürün kuralı: is_pack, units_per_item (1 paket = 10 adet), Kanal başına platform SKU (platform_sku, company_channel_id), Satış kanalı: şirket + pazaryeri/platform + hesap (42 kanal) (+9 more)

### Community 14 - "API: /api/menu-counts.php"
Cohesion: 0.13
Nodes (22): Baglama gore degisen menu (sirket, depo, kanal, izin, dil), Sayac/oturum uclari, Belge 08 Performans (pasif ölçüm), Pasif ölçüm yöntemi ve sınırları (tek ölçüm/sayfa), Yavaş sayfa TTFB (warehouse-home 3,2 sn), Yinelenen istek (product-pool-count x2, 43 betik), Açık soru 10: session-status ve warehouse-messages hangi dosyada çağrılıyor, S4 Menü sayaçları 6-8 sn, sayfa başına 91-98 istek (puan 6) (+14 more)

### Community 15 - "Belge: Alan Modeli"
Cohesion: 0.14
Nodes (26): Belge: Alan Modeli, Varlik: B2B cari (musteri, lokasyon, portal kullanicisi, tahsilat), Varlik: calisan ve rol, Varlik: cikis belgesi (sales_invoice, intercompany_invoice, warehouse_dispatch), Varlik: denetim kaydi (83.070 satir), Varlik: DHL etiketi (gidis + iade), Durum makinesi: Fatura, Durum makinesi: Iade (+18 more)

### Community 16 - "Belge 10 Rakip ve Hedef Mimari"
Cohesion: 0.10
Nodes (23): Belge 10 Rakip ve Hedef Mimari, Base (BaseLinker), Bilinen mevcut durum (tek PHP girişi, stok defteri yok, iki yazma yolu), Doğrulanamayan rakip verileri (resmi fiyat sayfaları açılamadı), Dopigo (TR entegratör), Entegra (TR entegratör), JTL-Wawi, A+C birleşimi (önce stok defteri, sonra kanal eklentisi) (+15 more)

### Community 17 - "Yeniden kurulan menu agaci (yerlesim tahmin)"
Cohesion: 0.15
Nodes (18): Sorun: shipments/shipping ve pool adlandirmasi, Sorun: kanal basina kopya sayfa/JS/uc, Adlandirma tutarsizliklari (shipments/shipping, pool, sorunlu, TR/DE/EN), Yeniden kurulan menu agaci (yerlesim tahmin), Ayni ise giden yinelenen yollar, data-* düğmeleri + JS ile çalışan eylemler (erp_action yok), data-open: iade ayrıntı diyaloğu, data-pack-action: toplama listesi, toplu fatura (+10 more)

### Community 18 - "Belge: Panel Analizi - Birlesik Bulgular"
Cohesion: 0.13
Nodes (16): Belge: Panel Analizi - Birlesik Bulgular, Baglam adreste tasiniyor (company, warehouse, channel, account), Sorun: kanal esitlemeleri bayat (Ozon, OTTO), Koda gomulu kanal/depo kimlikleri, Hiyerarsi Depo -> Sirket -> Kanal -> Hesap, Sorun: musteri verisi sayfa kaynaginda duz metin, Sorun: KDV ozeti %19 sabit, Sistem olcegi (5 depo, 12 sirket, 22 hesap, 54 page, 43 JS) (+8 more)

### Community 19 - "Orders.tsx"
Cohesion: 0.15
Nodes (21): ChannelType, dayKey(), dropWaiting(), hasIssue(), isOpen(), OStatus, OSTATUS, overdue() (+13 more)

### Community 20 - "Ekran: customers-master — müşteri ana kaydı"
Cohesion: 0.18
Nodes (20): Müşteri, Modül: B2B müşteri portalı, B2B cari (48 cari, para birimi başına ayrı bakiye), Cari borcu = satış faturaları − tahsilatlar, para birimleri toplanmaz, CARİ KAYDI EKSİK rozeti, Cari lokasyonu (teslimat, müşteri portalı stoğu), Cari portal kullanıcısı (can_adjust_stock yetkisi), Müşteri portalı yetkisi: kendi lokasyon stoğu, fatura, cari (+12 more)

### Community 21 - "Üç stok modeli (ayırt edici fikir)"
Cohesion: 0.13
Nodes (20): SKU, Ürün, Modül: Ortak ürün kataloğu, Fiziki stok, Sanal stok, Beyin düğüm türleri (Modül, Varlık, Stok modeli, Entegrasyon, Akış, Altyapı, Risk, Karar), bulk_products_download alanı (erp_action değil): şablon/CSV dışa aktarma, Stok Alert: fiziki stok <=2 (sayımı bilinmeyen, drop ve Asterbuy hariç) (+12 more)

### Community 22 - "JS: dhl-labels.js — DHL gönderi etiketi: hazırla"
Cohesion: 0.12
Nodes (18): innerHTML kullanimi, kacis dogrulanmadi, DHL / kargo ailesi, S13 Sabit kodlanmış kanal/depo kimlikleri (puan 2), API: /api/external-tracking.php, API: /api/wholesale-sales.php, Depolama: sessionStorage wawi-dhl-recreate-batch-v1:<kapsam>, Depolama: localStorage wawi-dhl-recreate-warning-v1:<kapsam>, Depolama: sessionStorage wawi-physical-stock-progress-v1 (+10 more)

### Community 23 - "Ekran: finance-documents — finans belgeleri"
Cohesion: 0.11
Nodes (16): Sipariş, WawiERP Panel: Sipariş, Kargo, İade, Destek Alanı, Sipariş havuzu: 14.258 sipariş, 19 platform, Sorun durumu: Açık → Çözüldü (çözülenler 10 gün saklanır), Sorun nedenleri (10 değer: Ürün eksik, Yanlış ürün, Hasarlı ürün, Stok farkı, Adres hatalı, Fatura hatası, Kargo/etiket, Görsel, Ödeme kontrolü, Diğer), Sorun/Not (operasyonel not): sipariş veya ürüne bağlı, Not yazanı PIN son 2 hane ile gösterilir, Sipariş durumu değerleri (Trendyol/N11, OTTO, ortak ödeme süzgeci) (+8 more)

### Community 24 - "Ekran: invoices — faturalar"
Cohesion: 0.14
Nodes (18): Fatura, Modül: Faturalar ve belgeler, Modül: Satın alma ve tedarikçiler, Açık soru 3: faturalar yalnız Almanya deposunda mı, data-invoice-*: fatura yazdır/düzenle/gönder/iade faturası, İade faturası RET-<sipariş>-<n> (negatif tutar), Kargo faturası DHL/PostNL gider (0 kayıt), Tedarikçi faturası (1 kayıt, ödeme Ödenmedi) (+10 more)

### Community 25 - "Ekran: orders-pool — birleşik sipariş havuzu"
Cohesion: 0.14
Nodes (9): data-dhl-order/download/settings/recreate, data-external-tracking-order: harici takip no, DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden oluşturulabilir), Etiket durumu: oluşturulamayan, bugün oluşturulan, hazır PDF, Gönderim (dispatch): gönderilmeyen, 2 günü aşan, Kargo araçları şeridi: kargo kontrolü, toplu yeniden oluşturma, Ödeme durumu (11 değer: Ödendi, Kartla ödendi, Banka havalesi bekleniyor, Kısmen ödendi, İade edildi ...), Satır işlemleri: müşteri düzenle, not, etiket, harici takip, PDF, ağırlık, fatura, iade faturası (+1 more)

### Community 26 - "API: /api/dhl-labels.php"
Cohesion: 0.21
Nodes (16): Fatura ailesi (invoices.php), X-Request-ID izleme yalniz DHL'de, Tek uc, cok eylem (invoices ~35, dhl-labels ~40), CSRF alanı ve sınırlı idempotency, S5 İki yazma yolu ve tek-uç-çok-eylem (puan 6), API: /api/dhl-labels.php, API: /api/invoices.php, Desen: bir uç, çok eylem + data-endpoint (invoices, dhl-labels, wholesale-sales) (+8 more)

### Community 27 - "Belge: Satış Kanalları Ekranları (03-satis-kanal"
Cohesion: 0.25
Nodes (13): METRO (mevcut), Belge: Satış Kanalları Ekranları (03-satis-kanallari.md), Görülemeyen: engellenen desenlerle (import, delete, sync, send=, /api/ vb.) hiçbir adres açılmadı, Görülemeyen: METRO sipariş, havuz, gönder, Gitmeyen ürünler içerikleri (hesap seçimi boş), METRO: tek sayfa, view=pool/send/failed/orders/overview/messages/categories, API: /api/metro.php, JS: metro.js — METRO sayfa ana betiği, JS: metro-account-selection.js — METRO hesap seçimi (istemcide, tahmin) (+5 more)

### Community 28 - "Belge: Bilgi Mimarisi"
Cohesion: 0.19
Nodes (16): Belge: Bilgi Mimarisi, Kenar menu bolumleri (orders, products, companies, platforms, marketplaces, management, operations), Menu agacinin uc kopyasi (kenar, ust cubuk, cekmece), Mobil notlari (860px cekmece, ayni sayfaya JS katlama), Ekranlara tiklama sayisi (kurala dayali tahmin), Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici), Depolama: sessionStorage anahtarı sayfadan (data-position-key), Desen: mobil ve görsel katman dosyaları (mobile-workspace, mobile-list-workspace, filter-buttons, topbar-sections) (+8 more)

### Community 29 - "Drop tedarikçi: Asterbuy (796 ürün, API, alış fi"
Cohesion: 0.18
Nodes (17): data-customer-edit: müşteri bilgisi düzenle, Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV hariç), product_key: ebay-account:16:<ilan>:<hash>, product_key: manual:<hash>, product_key: shopify:9:variant:<id>, product_key: sku:JTL-1051, product_key: supplier:asterbuy:<hash>, product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_id + product_key birleşik anahtar) (+9 more)

### Community 30 - "İlan yaşam döngüsü (havuz → hazırlık → önizle/on"
Cohesion: 0.18
Nodes (17): Adım 8: Çıkarma (Acil satıştan kaldır, withdraw), Adım 5: Durum kontrolü (eşzamansız sonuç), Adım 1: Havuz (Wawi ürün havuzu → kanal gönder sekmesi), Adım 2: Hazırlık (EAN, görsel, kategori, marka/model tamamla), Adım 3: Kategori eşleme (eBay öneri, Kaufland/OTTO seçim, Ozon çeviri), Adım 9: Kayıt (işlem geçmişi: publish, withdraw, auto_stock_policy), Adım 4: Önizleme ve onay (ayrı onay adımı), Adım 7: Sorun listesi (eksik/reddedilen, EAN boş, gönderim başarısız) (+9 more)

### Community 31 - "WawiERP Mimari ve Geçiş Sunumu"
Cohesion: 0.14
Nodes (15): Aşamalı geçiş, Fastify - reddedildi, NestJS, Desteği biten PHP sürümü, Tutmayan sayılar ve negatif stok, WawiERP Mimari ve Geçiş Sunumu, Geçiş aşamaları 0-5, Birlikte çalışma biçimi (+7 more)

### Community 32 - "Belge: API Yuzeyi"
Cohesion: 0.21
Nodes (16): Belge: API Yuzeyi, CSRF yalniz govde alani, header yok, 16 bayt idempotency anahtari (8 dosya), Ortak istek bicimi (fetch, JSON, same-origin, csrf govde alani), Oturum bitince JSON yerine HTML giris sayfasi (kirilgan sozlesme), Siparis cekme/esitleme uclari, Yontem ve R/W sinifi eylem adindan cikarim, Zaman asimi degerleri (8-95 sn) (+8 more)

### Community 33 - "Ekran: company-home — şirket/kanal çalışma alanı"
Cohesion: 0.19
Nodes (13): Amazon (mevcut), OTTO (mevcut), Billbee, Görülemeyen: dedicated sayfalarda formsuz JS yazma işlemleri; erp_action ve /api/ uçları yalnız Amazon(Woida), Kaufland, Metro için gözlendi, Görülemeyen: OTTO orders/history/source ve Amazon products/listings sekmeleri yüklenmedi, Amazon: company-home içinde gömülü sekme takımı (amazon_tab, yalnız Woida), OTTO: company-home içinde gömülü sekme takımı (otto_tab), Kanal sınıfı: genel company-home görünümü (+5 more)

### Community 34 - "Ekran: physical-stock-check — sorunlu fiziki ürü"
Cohesion: 0.21
Nodes (7): Sorun: negatif fiziki stok (25.061 kritik kayit), S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6), Negatif fiziki stok kayıtları ve gizli sayı kusuru, Toplu sıfırlama niteliğinde stok düzeltmeleri (sebep kaydı yok), Ekran: critical-physical-stock — kritik seviyeli fiziki ürünler, Ekran: physical-stock-check — sorunlu fiziki ürünler, pazaryeri adedi karşılaştırma, Ekran: stock-movements — fiziki stok geçmişi

### Community 35 - "Ekran: accounting — ön muhasebe"
Cohesion: 0.19
Nodes (13): S2 Sayaç ve özetler çelişiyor (puan 9), Satış özeti (çoklu para birimi), İş akışı 10 Raporlama: order-summary, Excel dışa aktar, Muhasebe Kaydı, Kanal kartları: Siparişleri al, bağlantıyı yönet, Dışa aktarım: export=csv | excel | datev (Muhasebe CSV), Kapsam seçici: 5 depo, 11 şirket, 41 kanal, Finans akışı 7: kapsamı seç, Siparişleri al (+5 more)

### Community 36 - "Çoklu dil: üç ayrı mekanizma, ortak çatı yok"
Cohesion: 0.15
Nodes (13): API: /api/barcode-count.php, API: /api/directory-search.php, Genel nesneler (window): WawiLocale, WawiI18n, WawiDhlConfig, WawiOrderSelection vb., Dil seçimi: lang sorgu parametresi ve <html lang>, yalnız TR ve DE, Çoklu dil: üç ayrı mekanizma, ortak çatı yok, JS: barcode-count.js — Barkodla sayım (kamera, hızlı sayım), JS: catalog-labels.js — Üretilmiş katalog kategori sözlüğü TR↔DE (58 KB), JS: directory-picker.js — Dizin (şirket/depo/kanal) seçici ve directory-search araması (+5 more)

### Community 37 - "Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/"
Cohesion: 0.17
Nodes (10): Eski ön ek WAWI-LE-<yıl>-<sıra>, Muhasebe KPI: 0 sipariş, brüt 0,00, kâr/zarar —, Pazaryeri fatura aktarımı (queued→checking→creating→Metro→doğrulama), Satış faturası RE-<şirket>-<yıl>-<sıra> (Taslak/Kesinleştirildi/İptal), Siparişten fatura oluştur (task=prepare): sipariş → şirket faturası → PDF → müşteriye gönder, invoices view=orders: Satış faturaları, Finans akışı 1: siparişi bul, Şirket faturası hazırla (+2 more)

### Community 38 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 39 - "Ekran: catalog-governance — kategori kapsamı ve "
Cohesion: 0.21
Nodes (7): Sorun: yavas liste uclari, 504, zaman asimi, Katalog arşivi: kartlar görünümden kaldırılır, stok/eşleşme/fatura korunur, Merkez katalog: tek katalog, çok depo kartı; fiyat ve stok depo bazında, Shopify geçmişi 60 gün sınırı (read_all_orders), Ekran: /allordersfilter — tüm siparişler filtre ucu, Ekran: catalog-governance — kategori kapsamı ve katalog arşivi, Ekran: duplicate-products — mükerrer ürün birleştirme

### Community 40 - "Karar 0004 - Yığın ayrıntıları"
Cohesion: 0.20
Nodes (11): Karar 0004 - Yığın ayrıntıları, BullMQ + Redis, Drizzle - reddedildi, Hetzner + Coolify - reddedildi, Keycloak - reddedildi, pg-boss - reddedildi, Prisma, Ortak şema + tenant_id + satır düzeyi güvenlik (RLS) (+3 more)

### Community 41 - "Modül: Pazaryerleri ve mağazalar"
Cohesion: 0.24
Nodes (11): Entegrasyonlar: kurulum talebi (≈50), eBay (mevcut), Etsy (kurulum talebi), Hepsiburada (kurulum talebi), Temu (kurulum talebi), WooCommerce (kurulum talebi), Modül: Pazaryerleri ve mağazalar, Kaynak chip sayıları (JTL 11.834, Amazon 3.895, eBay 3.877, Kaufland 1.291 ...) (+3 more)

### Community 42 - "Ekran: tr-market — Türkiye pazaryeri siparişleri"
Cohesion: 0.24
Nodes (7): n11 (mevcut), Trendyol (mevcut), Görülemeyen: tr-market questions/actions/history/dashboard, n11 products, tr-market-products platform, Trendyol ve N11: tr-market + tr-market-products, Trendyol "aktarım dosyası" mantığı (doğrudan yayın değil — tahmin), Ekran: tr-market — Türkiye pazaryeri siparişleri (n11, Trendyol), Ekran: tr-market-products — Türkiye kataloğu ürünleri

### Community 43 - "WawiERP Teknoloji Seçenekleri Sunumu"
Cohesion: 0.20
Nodes (11): Küçük ölçek (ayda 2.555 sipariş), PostgreSQL, WawiERP Teknoloji Seçenekleri Sunumu, Abonelik ve faturalama, Pazaryeri kanal eklentisi, Verilen kararlar tablosu, Önerilen katmanlı yapı, Çok kiracılılık açıklaması (+3 more)

### Community 44 - "WawiERP Analiz Sunumu"
Cohesion: 0.24
Nodes (10): Mevcut WawiERP (12 şirket, 5 depo, 41 kanal), WawiERP Analiz Sunumu, Bilgi haritası ve hafıza, Müşteri bilgisinin sayfaya açık gelmesi, Seçenek A - Yerinde yenileme, Seçenek B - Hazır ERP çekirdeği, Sipariş hacmi (2.555/30 gün), WawiERP mevcut sistem (54 ekran, 232.500 ürün) (+2 more)

### Community 45 - "Karar 0005 - Bulut sağlayıcı"
Cohesion: 0.38
Nodes (10): Karar 0005 - Bulut sağlayıcı, AWS CDK (TypeScript), AWS Frankfurt (eu-central-1), ECS Fargate, ElastiCache (Redis uyumlu), GCP Frankfurt - reddedildi, RDS for PostgreSQL, S3 (+2 more)

### Community 46 - "Çok kiracılı (multi-tenant) sistem"
Cohesion: 0.25
Nodes (9): Karar 0001 - Çok kiracılı sistem, Çok kiracılı (multi-tenant) sistem, Kiracı → Şirket → Depo → Kanal → Hesap, Karar 0002 - Sıfırdan geliştirme, Ekip: sahibi + Claude, Eski PHP sistemi (legacy), Sıfırdan geliştirme, PHP (Symfony/Laravel) - reddedildi (+1 more)

### Community 47 - "Depolar arası sevkiyat"
Cohesion: 0.43
Nodes (8): Depolar arası sevkiyat, Sevkiyat: Depodan çıktı (stok hareketi), Sevkiyat: Sevke hazır, Sevkiyat: İptal edildi, Sevkiyat: Mal kabul tamamlandı, Sevkiyat: Taslak, Sevkiyat: Hedef depoya ulaştı, Sevkiyat: Yolda

### Community 48 - "Yeni panel mock (Vite + React + TS + Tailwind)"
Cohesion: 0.25
Nodes (8): Mantine - reddedildi, shadcn/ui + Tailwind, Panel mock index.html, Panel mock giriş noktası (src/main.tsx), Panel mock README, Yeni panel mock (Vite + React + TS + Tailwind), raw/siparis-dagilimi-30gun.json, Mock verisi (gerçek 30 günlük toplamlar + uydurma satırlar)

### Community 49 - "Finans akışı 4: cari seç/oluştur"
Cohesion: 0.29
Nodes (7): Finans akışı 4: cari seç/oluştur, Satıcı şirket + stok çıkış deposu, Ürünler, Doğrula, Kesinleştir (stok bir kez düşer), Fatura PDF, Tahsilat kaydı

### Community 50 - "Ekran: erp-features — ERP özellik ayarları"
Cohesion: 0.33
Nodes (5): Modül: Ön muhasebe ve cari, Sayfa başına 91-98 istek, ERP modül kataloğu: 28 modül, 20 hazır, 8 hazırlanan, Yavaşlık desenli büyük havuz taramalarında (220 bin kart), Ekran: erp-features — ERP özellik ayarları

### Community 51 - "Sipariş yolculuğu (5 adım)"
Cohesion: 0.60
Nodes (6): Adım 1: Ürünü hazırla, Adım 2: Kaynağı seç, Adım 3: Kanala gönder, Adım 4: Siparişi hazırla, Adım 5: Müşteriye ulaş, Sipariş yolculuğu (5 adım)

### Community 52 - "Varlik: depo urun kaydi (~151 bin; warehouse_id "
Cohesion: 0.40
Nodes (6): Ilan yasam dongusu (havuz -> onizle -> gonder -> kontrol -> kaldir), Varlik: depo urun kaydi (~151 bin; warehouse_id + product_key), Durum makinesi: Ilan, Varlik: ilan (listing), product_key (5 bicim, 13 kaynak), Varlik: urun karti (katalog ~232,5 bin)

### Community 53 - "Sipariş durumu (Yeni, Hazırlanıyor, Tamamlandı, "
Cohesion: 0.47
Nodes (5): Sipariş durumu: Hazırlanıyor (İşlemde), Sipariş durumu: İptal / iade, Sipariş durumu: Tamamlandı, Sipariş durumu: Yeni, Sipariş durumu (Yeni, Hazırlanıyor, Tamamlandı, İptal/iade)

### Community 54 - "İade (DHL iade etiketinden otomatik doğar)"
Cohesion: 0.33
Nodes (4): İade (DHL iade etiketinden otomatik doğar), İade ek durumlar: Tekrar gönderildi, Sorun bekleyen, Geciken, Çözülen, İade eksen 2 para: Müşteriye ödendi / Ödeme bekleyen, İade eksen 1 teslim: Müşteriden ürün bekleniyor → Ürün geldi

### Community 55 - "Banka içe aktarma penceresi (bank-import.js, Sho"
Cohesion: 0.47
Nodes (5): Banka içe aktarma penceresi (bank-import.js, Shopify havale, 5 MB CSV), erp-features: Banka ekstresi ve mutabakat hazırlanıyor, Finans akışı 8: banka CSV tara, kontrol et ve tamamla, API: /api/shopify-bank-import.php, JS: bank-import.js — Shopify havale/banka CSV içe aktarma (tarama, eşleştirme, onay)

### Community 56 - "Karar 0003 - Teknoloji yığını"
Cohesion: 0.40
Nodes (6): Karar 0003 - Teknoloji yığını, React, Next.js - reddedildi, Vite + React, typescript, typescript@^5.6.3

### Community 57 - "İş akışı 6 Dropship: Oluşturulacak"
Cohesion: 0.40
Nodes (5): İş akışı 6 Dropship: Oluşturulacak, Ödeme bekliyor, Takip alınır (4 saatte bir), Satış kanalına işlenir, Takip aktarıldı

### Community 58 - "İş akışı 3 Toplama: şirket/DHL hesabı seç"
Cohesion: 0.40
Nodes (5): İş akışı 3 Toplama: şirket/DHL hesabı seç, Siparişleri getir ve seç, Toplama listesi, DHL etiket / toplu yazdır, Başarısızlar Oluşturulamayanlar filtresi → toplu yeniden oluştur

### Community 59 - "İş akışı 8 İade: DHL iade etiketi listelenir"
Cohesion: 0.40
Nodes (5): İş akışı 8 İade: DHL iade etiketi listelenir, İncele / işle, Ürün geldi kontrolü, Müşteriye ödeme / tekrar gönderim / sorun, Çözüldü

### Community 61 - "Gelen kutusu kısayolları (Fiziki 208, Drop Auto "
Cohesion: 0.50
Nodes (4): Gelen kutusu kısayolları (Fiziki 208, Drop Auto 71, Hollanda 784+ ...), İş akışı 2 Triyaj: gelen kutusu kısayolları, Durum Yeni → Hazırlanıyor, Sorunlu satır: Not/Sorun ekle → problem-orders

### Community 62 - "İş akışı 7 Depo içi sevk: plan taslağı"
Cohesion: 0.50
Nodes (4): İş akışı 7 Depo içi sevk: plan taslağı, Depodan çıkar (stok hareketi), Yolda, Hedef depoda mal kabul

### Community 65 - "Toplu fatura PDF/e-posta (shipping)"
Cohesion: 0.67
Nodes (3): İş akışı 5 Fatura: satırdan yazdır/düzenle/gönder, Toplu fatura PDF/e-posta (shipping), İade faturası

## Ambiguous Edges - Review These
- `API: /api/warehouse-messages.php` → `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`  [AMBIGUOUS]
  docs/panel/05-on-yuz-mimarisi.md · relation: calls

## Knowledge Gaps
- **122 isolated node(s):** `Asterbuy: Kontrol edilecek (hata/inceleme, tahmin)`, `Takip aktarıldı`, `Alış belgesi: fatura / irsaliye, ödeme durumu`, `Varlık: Hesap (account) — küresel sayısal kimlik, kanal başına kimlik bilgisi`, `Varlık: Kanal (channel) — tür + ad, küresel kimlik` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 221 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WawiERP (wawib2b.com)` connect `WawiERP (wawib2b.com)` to `Ekran: audit-logs — denetim kayıtları`, `Ekran: warehouse-home — depo çalışma alanı: şirk`, `Beyin katmanı (graphify)`, `Modül: Pazaryerleri ve mağazalar`, `Ekran: erp-features — ERP özellik ayarları`, `Ekran: customers-master — müşteri ana kaydı`, `Üç stok modeli (ayırt edici fikir)`, `Ekran: invoices — faturalar`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Ekran: orders-pool — birleşik sipariş havuzu` (e.g. with `Ekran: orders-ebay — eBay siparişleri` and `API: /api/menu-counts.php`) actually correct?**
  _`Ekran: orders-pool — birleşik sipariş havuzu` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Asterbuy: Kontrol edilecek (hata/inceleme, tahmin)`, `Takip aktarıldı`, `Alış belgesi: fatura / irsaliye, ödeme durumu` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `02-urun-katalog-stok.md: Ürün, katalog, stok, sa` be split into smaller, more focused modules?**
  _Cohesion score 0.06504494976203067 - nodes in this community are weakly interconnected._
- **Why does `Ekran: orders-pool — birleşik sipariş havuzu` connect `Ekran: orders-pool — birleşik sipariş havuzu` to `02-urun-katalog-stok.md: Ürün, katalog, stok, sa`, `Ekran: warehouse-home — depo çalışma alanı: şirk`, `WawiERP (wawib2b.com)`, `panel-harita.md: WawiERP panel keşif haritası`, `Ekran: warehouse — depo ürün listesi (Ürün havuz`, `API: /api/menu-counts.php`, `Belge: Alan Modeli`, `Yeniden kurulan menu agaci (yerlesim tahmin)`, `Belge: Panel Analizi - Birlesik Bulgular`, `Ekran: customers-master — müşteri ana kaydı`, `Üç stok modeli (ayırt edici fikir)`, `Ekran: finance-documents — finans belgeleri`, `Ekran: invoices — faturalar`, `Drop tedarikçi: Asterbuy (796 ürün, API, alış fi`, `Belge: API Yuzeyi`, `Ekran: accounting — ön muhasebe`, `Modül: Pazaryerleri ve mağazalar`, `Sipariş durumu (Yeni, Hazırlanıyor, Tamamlandı, `, `Gelen kutusu kısayolları (Fiziki 208, Drop Auto `?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `Ekran: audit-logs — denetim kayıtları` be split into smaller, more focused modules?**
  _Cohesion score 0.05084745762711865 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `API: /api/warehouse-messages.php` and `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._