# Graph Report - WaviERP  (2026-11-15)

## Corpus Check
- 36 files · ~119,711 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1682 nodes · 4746 edges · 79 communities (71 shown, 8 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 392 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Badge() / Card()
- WawiERP / Beyin katmanı
- data.ts / Orders.tsx
- Alan Modeli / Panel Analizi - Birlesik Bulgular
- store.tsx / Extra.tsx
- panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad>
- Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler
- fmtNum() / Agent.tsx
- audit-logs / team
- App.tsx / Platform.tsx
- customers-master / B2B cari
- orders-pool / Sipariş
- invoices / finance-documents
- warehouse_product / Ürün kartı
- accounting / erp-features
- warehouse-home / overview
- warehouse / Üç stok modeli
- Bilgi Mimarisi / /api/menu-counts.php
- 02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_
- Landing.tsx / Landing()
- Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari
- Pazaryerleri ve mağazalar / Entegrasyonlar: mevcut
- Otomasyon çekirdeği: Olay → Kural / 14 hazır kural
- Satış Kanalları Ekranları / company-home
- Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt
- Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/
- Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos
- Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek
- video-uret.py / go()
- İlan yaşam döngüsü / Sipariş yolculuğu
- Reservations.tsx / ui.tsx
- Selling.tsx / PriceRules()
- API Yuzeyi / app.js
- Sıradaki adımlar / Asistan: yapay zekâ bağlı biçim
- package.json / devDependencies
- useStore() / Mobile.tsx
- assistant.mjs / server.mjs
- Automation.tsx / Drawer()
- Quality.tsx / QualityQueue()
- /api/dhl-labels.php / /api/invoices.php
- Karar 0004 - Yığın ayrıntıları / BullMQ + Redis
- WawiERP Analiz Sunumu / Önemli sorunlar listesi
- dhl-labels.js / Desen: request/api fetch sarmalayı
- WawiERP Mimari ve Geçiş Sunumu / WawiERP Teknoloji Seçenekleri Sunu
- İş akışı 2: Barkodla fiziki sayım / physical-stock-check
- Çoklu dil: üç ayrı mekanizma, orta / i18n 2: wawiText yardımcısı
- compilerOptions / tsconfig.json
- purchases / Tedarikçi
- Çok kiracılı / Sıfırdan geliştirme
- i18n 3: Satır içi t(tr, de) yardım / Banka içe aktarma penceresi
- aşırı yavaş/takılan listeler / problem-products
- Karar 0005 - Bulut sağlayıcı / AWS Frankfurt
- Belge 11 Yeniden Tasarım Girdileri / Bilinen mevcut durum
- bulk-products / product_key biçimi: kaynağa göre f
- Belge 08 Performans / /api/session-status.php
- İş akışı 5: Mükerrer birleştirme / Veri kalitesi
- typescript / NestJS
- Asterbuy siparişi / Asterbuy: Ödeme bekliyor
- Sipariş durumu / Sipariş durumu: Hazırlanıyor
- İş akışı 4: Depolar arası stok akt / İş akışı 4 adım 4: Dağıtımı önizle
- Muhasebe aktarımı / S3 KDV özeti %19 sabit
- TR entegratörleri grubu / Dopigo
- İş akışı 6 Dropship: Oluşturulacak / Ödeme bekliyor
- İş akışı 3 Toplama: şirket/DHL hes / Siparişleri getir ve seç
- İş akışı 8 İade: DHL iade etiketi / İncele / işle
- sessionStorage anahtarları dağınık / Depolama: sessionStorage wawi-dhl-
- İş akışı 7 Depo içi sevk: plan tas / Depodan çıkar
- İş akışı 1: Yeni ürün girişi / İş akışı 1 adım 2: Bulunamazsa yen
- scripts / build
- Toplu fatura PDF/e-posta / İş akışı 5 Fatura: satırdan yazdır
- İş akışı 7: EAN / görsel düzeltme / İş akışı 7 adım 1: Eksik EAN/görse
- İş akışı 1 Sipariş girişi: platfor / Asterbuy 5 dakikada bir kontrol
- Finans akışı 2: liste İşlemler Fat / edit_context, edit_save
- Panel mock index.html / Panel mock giriş noktası
- Sıkı CSP başlıkları
- Açık soru 9: iş modeli, dışarıya h
- WawiERP Panel: Finans ve Yönetim
- Para birimleri EUR, TRY, USD, GBP

## God Nodes (most connected - your core abstractions)
1. `Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)` - 99 edges
2. `Badge()` - 68 edges
3. `panel-harita.md: WawiERP panel keşif haritası` - 65 edges
4. `useStore()` - 65 edges
5. `Card()` - 60 edges
6. `Tek giriş noktası /?page=<ad> (54 page değeri)` - 57 edges
7. `Ekran: orders-pool — birleşik sipariş havuzu` - 52 edges
8. `fmtNum()` - 51 edges
9. `PageHead()` - 50 edges
10. `Belge: Satış Kanalları Ekranları (03-satis-kanallari.md)` - 49 edges

## Surprising Connections (you probably didn't know these)
- `AWS CDK (TypeScript)` --implements--> `typescript`  [INFERRED]
  kararlar/0005-bulut-saglayici.md → yeni/panel-mock/package.json
- `Çok kiracılılık açıklaması` --semantically_similar_to--> `Çok kiracılı (multi-tenant) sistem`  [INFERRED] [semantically similar]
  sunum/wawierp-teknoloji-secenekleri.html → kararlar/0001-cok-kiracili-sistem.md
- `WawiERP mevcut sistem (54 ekran, 232.500 ürün)` --semantically_similar_to--> `Mevcut WawiERP (12 şirket, 5 depo, 41 kanal)`  [INFERRED] [semantically similar]
  sunum/wawierp-analiz-sunumu.html → kararlar/0001-cok-kiracili-sistem.md
- `Karar 0003 - Teknoloji yığını` --references--> `typescript`  [EXTRACTED]
  kararlar/0003-teknoloji-yigini.md → yeni/panel-mock/package.json
- `NestJS` --conceptually_related_to--> `typescript`  [INFERRED]
  kararlar/0004-yigin-ayrintilari.md → yeni/panel-mock/package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **DHL etiket JS üçlüsü ve ortak uç** — docs_panel_05_on_yuz_mimarisi_js_dhl_labels, docs_panel_05_on_yuz_mimarisi_js_dhl_recreate, docs_panel_05_on_yuz_mimarisi_js_dhl_recreate_batch, docs_panel_05_on_yuz_mimarisi_api_dhl_labels [EXTRACTED 0.95]
- **Fatura/paketleme JS dosyaları ve invoices.php** — docs_panel_05_on_yuz_mimarisi_js_invoice_workflow, docs_panel_05_on_yuz_mimarisi_js_invoice_edit, docs_panel_05_on_yuz_mimarisi_js_invoice_marketplace, docs_panel_05_on_yuz_mimarisi_js_invoice_order_pipeline, docs_panel_05_on_yuz_mimarisi_js_packing_workflow, docs_panel_05_on_yuz_mimarisi_api_invoices [EXTRACTED 0.95]
- **İlan yaşam döngüsü (9 adım)** — docs_panel_03_satis_kanallari_adim_havuz, docs_panel_03_satis_kanallari_adim_hazirlik, docs_panel_03_satis_kanallari_adim_kategori_esleme, docs_panel_03_satis_kanallari_adim_onizleme_onay, docs_panel_03_satis_kanallari_adim_durum_kontrol, docs_panel_03_satis_kanallari_adim_yayinda, docs_panel_03_satis_kanallari_adim_sorun, docs_panel_03_satis_kanallari_adim_cikarma, docs_panel_03_satis_kanallari_adim_kayit [EXTRACTED 0.95]
- **Alan modelindeki durum makineleri** — docs_06_alan_modeli_durum_siparis, docs_06_alan_modeli_durum_iade, docs_06_alan_modeli_durum_ilan, docs_06_alan_modeli_durum_fatura, docs_06_alan_modeli_durum_sevkiyat, docs_06_alan_modeli_durum_ticket, docs_06_alan_modeli_durum_stok [EXTRACTED 1.00]
- **Fatura ailesi: invoices.php kullanan JS dosyalari** — docs_panel_05_on_yuz_mimarisi_api_invoices, docs_panel_05_on_yuz_mimarisi_js_invoice_workflow, docs_panel_05_on_yuz_mimarisi_js_invoice_edit, docs_panel_05_on_yuz_mimarisi_js_invoice_marketplace, docs_panel_05_on_yuz_mimarisi_js_packing_workflow [EXTRACTED 1.00]
- **Asistanın üç düzeyi** — kararlar_0006_asistan_katmani_yalniz_yanitla, kararlar_0006_asistan_katmani_hazirla_onayla, kararlar_0006_asistan_katmani_kendiliginden [EXTRACTED 1.00]
- **Asterbuy drop akışı** — docs_panel_02_urun_katalog_stok_w6, raw_panel_harita_page_dropshipping, raw_panel_harita_page_asterbuy_orders, docs_panel_02_urun_katalog_stok_asterbuy [EXTRACTED 1.00]
- **AWS Frankfurt bileşenleri** — kararlar_0005_bulut_saglayici_ecs_fargate, kararlar_0005_bulut_saglayici_rds, kararlar_0005_bulut_saglayici_elasticache, kararlar_0005_bulut_saglayici_s3, kararlar_0005_bulut_saglayici_secrets_kms, kararlar_0005_bulut_saglayici_aws_cdk, kararlar_0005_bulut_saglayici_ses [EXTRACTED 1.00]
- **Barkodla sayım -> pazaryeri adedi karşılaştırma** — docs_panel_02_urun_katalog_stok_w2, raw_panel_harita_page_physical_stock_check, raw_panel_harita_page_catalog_governance [EXTRACTED 1.00]
- **Hedef mimari seçenekleri A/B/C** — docs_10_rakip_ve_hedef_mimari_secenek_a, docs_10_rakip_ve_hedef_mimari_secenek_b, docs_10_rakip_ve_hedef_mimari_secenek_c [EXTRACTED 1.00]
- **İade yaşam döngüsü** — docs_panel_01_siparis_kargo_iade_wf_iade_1, docs_panel_01_siparis_kargo_iade_wf_iade_2, docs_panel_01_siparis_kargo_iade_wf_iade_3, docs_panel_01_siparis_kargo_iade_wf_iade_4, docs_panel_01_siparis_kargo_iade_wf_iade_5 [EXTRACTED 1.00]
- **Olay → Kural → Onay düzeyi** — kararlar_0007_otomasyon_cekirdegi_olay, kararlar_0007_otomasyon_cekirdegi_kural, kararlar_0007_otomasyon_cekirdegi_onay_duzeyi [EXTRACTED 1.00]
- **Yeniden tasarim ilkeleri (8)** — docs_03_panel_analizi_tek_kanal_baglastirici, docs_03_panel_analizi_stok_defteri, docs_03_panel_analizi_tek_yazma_yolu, docs_03_panel_analizi_arka_plan_isleri, docs_03_panel_analizi_baglam_rotada, docs_03_panel_analizi_kisisel_veri_yetkiyle, docs_03_panel_analizi_ulke_bazli_vergi, docs_03_panel_analizi_sayaclar_tek_kaynak [EXTRACTED 1.00]
- **Sipariş toplama ve DHL etiket akışı** — docs_panel_01_siparis_kargo_iade_wf_etiket_1, docs_panel_01_siparis_kargo_iade_wf_etiket_2, docs_panel_01_siparis_kargo_iade_wf_etiket_3, docs_panel_01_siparis_kargo_iade_wf_etiket_4, docs_panel_01_siparis_kargo_iade_wf_etiket_5 [EXTRACTED 1.00]
- **Sipariş yolculuğu akışı** — docs_01_sirket_analizi_y1, docs_01_sirket_analizi_y2, docs_01_sirket_analizi_y3, docs_01_sirket_analizi_y4, docs_01_sirket_analizi_y5 [EXTRACTED 1.00]
- **Siparişten faturaya belge zinciri** — docs_panel_04_finans_yonetim_wf_fatura_1, docs_panel_04_finans_yonetim_wf_fatura_2, docs_panel_04_finans_yonetim_wf_fatura_3, docs_panel_04_finans_yonetim_wf_fatura_4 [EXTRACTED 1.00]
- **Stok dağıtım: önizleme -> kayıt** — docs_panel_02_urun_katalog_stok_w4, raw_panel_harita_page_stock_transfer, erp_action_preview_stock_distribution, raw_panel_harita_depo_istanbul_warehouse [EXTRACTED 1.00]
- **Onaylanan teknoloji yığını** — ref_typescript, kararlar_0003_teknoloji_yigini_postgresql, kararlar_0003_teknoloji_yigini_react, kararlar_0004_yigin_ayrintilari_nestjs, kararlar_0004_yigin_ayrintilari_prisma, kararlar_0004_yigin_ayrintilari_bullmq [EXTRACTED 1.00]
- **Üç dalgalık yol haritası** — sunum_wawierp_rakipler_ve_yol_haritasi_dalga1, sunum_wawierp_rakipler_ve_yol_haritasi_dalga2, sunum_wawierp_rakipler_ve_yol_haritasi_dalga3 [EXTRACTED 1.00]
- **Gezinme yuzeyini kuran JS dosyalari** — docs_panel_05_on_yuz_mimarisi_js_topbar_sections, docs_panel_05_on_yuz_mimarisi_js_sidebar_position, docs_panel_05_on_yuz_mimarisi_js_sidebar_search, docs_panel_05_on_yuz_mimarisi_js_mobile_workspace [EXTRACTED 1.00]
- **Kaynak-Beyin-Hafıza üçlüsü** — docs_02_hafiza_beyin_mimarisi_kaynak, docs_02_hafiza_beyin_mimarisi_beyin, docs_02_hafiza_beyin_mimarisi_hafiza [EXTRACTED 1.00]
- **Üç stok modeli** — docs_01_sirket_analizi_s_fiziki, docs_01_sirket_analizi_s_sanal, docs_01_sirket_analizi_s_drop [EXTRACTED 1.00]
- **Kiracı yalıtımı: RLS, Prisma, BullMQ** — kararlar_0004_yigin_ayrintilari_rls, kararlar_0004_yigin_ayrintilari_prisma_rls_risk, kararlar_0004_yigin_ayrintilari_prisma, kararlar_0004_yigin_ayrintilari_bullmq, kararlar_0001_cok_kiracili_sistem_tenant [INFERRED 0.85]
- **Kişisel veri ve kimlik güvenliği kümesi (S1, S6, maskeleme ilkesi)** — docs_11_yeniden_tasarim_girdileri_s1, docs_11_yeniden_tasarim_girdileri_s6, docs_11_yeniden_tasarim_girdileri_ilke_sunucu_maskeleme, docs_09_guvenlik_uyum_kisisel_veri_dom, docs_09_guvenlik_uyum_pin_kimlik [INFERRED 0.85]
- **Sayaç tutarsızlığı ve yavaşlık sorun kümesi (S2, S4, tek kaynak ilkesi)** — docs_11_yeniden_tasarim_girdileri_s2, docs_11_yeniden_tasarim_girdileri_s4, docs_11_yeniden_tasarim_girdileri_ilke_tek_kaynak_sayac, docs_08_performans_sayac_ucu_cogullugu [INFERRED 0.85]

## Communities (79 total, 8 thin omitted)

### Community 0 - "Badge() / Card()"
Cohesion: 0.12
Nodes (69): Shell(), company(), fmtDT(), fmtMoney(), mask(), product(), whName(), AuditLog() (+61 more)

### Community 1 - "WawiERP / Beyin katmanı"
Cohesion: 0.06
Nodes (59): Oturum başında kuralları, Çalışırken kuralları, WawiERP Claude Kuralları (CLAUDE.md), Oturum sonunda kuralları, Yeniden tasarım için açık sorular (4), Cloudflare (DNS, proxy, analitik), WAWIWELCOME oturum çerezi, DNS / DNSSEC kapalı (+51 more)

### Community 2 - "data.ts / Orders.tsx"
Cohesion: 0.05
Nodes (59): ACC_BY_KEY, ACCOUNTS, AUDIT0, buildOrders(), CHANNEL, CITY, dayf, DROP_CATS (+51 more)

### Community 3 - "Alan Modeli / Panel Analizi - Birlesik Bulgular"
Cohesion: 0.06
Nodes (49): Belge: Panel Analizi - Birlesik Bulgular, Baglam adreste tasiniyor (company, warehouse, channel, account), Sorun: kanal esitlemeleri bayat (Ozon, OTTO), Koda gomulu kanal/depo kimlikleri, Hiyerarsi Depo -> Sirket -> Kanal -> Hesap, Ilan yasam dongusu (havuz -> onizle -> gonder -> kontrol -> kaldir), Sorun: musteri verisi sayfa kaynaginda duz metin, Sorun: KDV ozeti %19 sabit (+41 more)

### Community 4 - "store.tsx / Extra.tsx"
Cohesion: 0.07
Nodes (48): B2B, B2B0, b2bTotals(), carrierOf(), CARRIERS, MANUAL0, ManualLabel, Msg (+40 more)

### Community 5 - "panel-harita.md: WawiERP panel keş / Tek giriş noktası /?page=<ad>"
Cohesion: 0.09
Nodes (40): Sorun: shipments/shipping ve pool adlandirmasi, Sorun: kanal basina kopya sayfa/JS/uc, Sorun: sayac-liste ve stok/ticket tutarsizliklari, Adlandirma tutarsizliklari (shipments/shipping, pool, sorunlu, TR/DE/EN), Yeniden kurulan menu agaci (yerlesim tahmin), Ayni ise giden yinelenen yollar, Müşteri kişisel verisi DOM'da açık (istemcide gizleme), data-* düğmeleri + JS ile çalışan eylemler (erp_action yok) (+32 more)

### Community 6 - "Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler"
Cohesion: 0.07
Nodes (48): S9 Kanal başına sayfa/JS/uç kopyası (puan 6), Denetim kaydı "asistan aracılığıyla" + 10 sn geri alma, Açılışta sormadan fark ettiklerini bildirme, Aday: destek yanıtı taslağı, Aday: komisyon ve kargo dahil net kâr, Aday: yavaş satan stok raporu, Dalga 3: Fark yaratan, Eksik: kendi kendine kayıt ve açık fiyat (+40 more)

### Community 7 - "fmtNum() / Agent.tsx"
Cohesion: 0.11
Nodes (41): Act, ActKind, Agent(), answer(), runLive(), runTool(), send(), ApiMsg (+33 more)

### Community 8 - "audit-logs / team"
Cohesion: 0.07
Nodes (37): Modül: Ekip, yetki, denetim izi, Sorun: denetim kaydi DHL gurultusu, Varlik: calisan ve rol, Varlik: denetim kaydi (83.070 satir), Belge 09 Güvenlik ve Uyum, Giriş sayfası başlıkları ve CSP, Denetim kaydı kapsamı (180/30 gün saklama), DSGVO/KVKK boşlukları (Impressum, AVV, silme, aktarım) (+29 more)

### Community 9 - "App.tsx / Platform.tsx"
Cohesion: 0.07
Nodes (38): GOTO, NAV, NavItem, NoAccess(), Palette(), Shortcuts(), VIEWS, ago() (+30 more)

### Community 10 - "customers-master / B2B cari"
Cohesion: 0.08
Nodes (34): Müşteri, Modül: B2B müşteri portalı, data-customer-edit: müşteri bilgisi düzenle, Ticket (pazaryeri müşteri sorusu), Ticket durumları: Yanıtımız bekleniyor, Müşteri/platform bekleniyor, Kapalı, Okunmamış, İş akışı 9 Destek: tickets mağaza soruları (28 gün), Mesaj seç, yanıtla (tahmin), B2B cari (48 cari, para birimi başına ayrı bakiye) (+26 more)

### Community 11 - "orders-pool / Sipariş"
Cohesion: 0.07
Nodes (28): Sipariş, XML/CSV (mevcut), Modül: Birleşik sipariş havuzu, WawiERP Panel: Sipariş, Kargo, İade, Destek Alanı, data-dhl-order/download/settings/recreate, data-external-tracking-order: harici takip no, DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden oluşturulabilir), Etiket durumu: oluşturulamayan, bugün oluşturulan, hazır PDF (+20 more)

### Community 12 - "invoices / finance-documents"
Cohesion: 0.08
Nodes (30): Fatura, Modül: Faturalar ve belgeler, Açık soru 3: faturalar yalnız Almanya deposunda mı, data-invoice-*: fatura yazdır/düzenle/gönder/iade faturası, Belge ayrıntısı: kaynak sipariş no, KDV, net/brüt, Çıkış belgesi defteri (SF/SV rozetleri, 1.763 belge Almanya), Çıkış belgesi KPI: toplam, satış faturası, şirketler arası, sevk, kesin toplam, Eski ön ek WAWI-LE-<yıl>-<sıra> (+22 more)

### Community 13 - "warehouse_product / Ürün kartı"
Cohesion: 0.12
Nodes (27): EAN, SKU, Ürün, Modül: Ortak ürün kataloğu, Beyin düğüm türleri (Modül, Varlık, Stok modeli, Entegrasyon, Akış, Altyapı, Risk, Karar), Sorun: yavas liste uclari, 504, zaman asimi, Depo EAN 3: depo sayımı barkodu, feed barkodunu değiştirmez, EAN 2: alternatif platform barkodu (+19 more)

### Community 14 - "accounting / erp-features"
Cohesion: 0.07
Nodes (29): Modül: Ön muhasebe ve cari, Sayfa başına 91-98 istek, Yavaş sayfa TTFB (warehouse-home 3,2 sn), S14 Adlandırma tutarsızlığı, tab=dashboard sessiz düşüş (puan 3), S2 Sayaç ve özetler çelişiyor (puan 9), S4 Menü sayaçları 6-8 sn, sayfa başına 91-98 istek (puan 6), Satış özeti (çoklu para birimi), İş akışı 10 Raporlama: order-summary, Excel dışa aktar, Muhasebe Kaydı (+21 more)

### Community 15 - "warehouse-home / overview"
Cohesion: 0.17
Nodes (30): Depo, Şirket, Modül: Çoklu depo ve şirket, En cok baglantili kavramlar, Ana/alt depo ilişkisi: İstanbul ana; Almanya, Hollanda, Mega B, Technowelt alt depo, Bağlam zinciri: şirket → depo → kanal → hesap (URL ile taşınır), Varlık: Hesap (account) — küresel sayısal kimlik, kanal başına kimlik bilgisi, Varlık: Kanal (channel) — tür + ad, küresel kimlik (+22 more)

### Community 16 - "warehouse / Üç stok modeli"
Cohesion: 0.10
Nodes (29): Dropshipping stok modeli, Fiziki stok, Sanal stok, Tedarik tipi: physical, dropship, asterbuy, bueroarena, b2buhren, watchimport, Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV hariç), Drop tedarikçi: B2BUhren Germany, Drop tedarikçi: BueroArena, Stok Alert: fiziki stok <=2 (sayımı bilinmeyen, drop ve Asterbuy hariç) (+21 more)

### Community 17 - "Bilgi Mimarisi / /api/menu-counts.php"
Cohesion: 0.10
Nodes (29): Belge: Bilgi Mimarisi, Baglama gore degisen menu (sirket, depo, kanal, izin, dil), Kenar menu bolumleri (orders, products, companies, platforms, marketplaces, management, operations), Menu agacinin uc kopyasi (kenar, ust cubuk, cekmece), Mobil notlari (860px cekmece, ayni sayfaya JS katlama), Rol basina menu (yalniz sistem yoneticisi goruldu), Ekranlara tiklama sayisi (kurala dayali tahmin), Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici) (+21 more)

### Community 18 - "02-urun-katalog-stok.md: Ürün, kat / Klasik form yolu POST ?page + erp_"
Cohesion: 0.13
Nodes (35): Varlik: depo urun kaydi (~151 bin; warehouse_id + product_key), product_key (5 bicim, 13 kaynak), Varlik: stok hareketi (degismez kayit), Varlik: urun karti (katalog ~232,5 bin), Klasik form yolu POST ?page + erp_action, Gömülü global modallar (Depo/Tedarikçi/Şirket/Stok/Kategori ekle vb.), message_action=send (depolara mesaj; erp_action yok), 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma alanı (+27 more)

### Community 19 - "Landing.tsx / Landing()"
Cohesion: 0.08
Nodes (31): react-dom, dependencies, lucide-react@^0.460.0, react@^18.3.1, react-dom@^18.3.1, App(), Root(), useRoute() (+23 more)

### Community 20 - "Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari"
Cohesion: 0.13
Nodes (31): Belge 10 Rakip ve Hedef Mimari, Base (BaseLinker), Billbee, Doğrulanamayan rakip verileri (resmi fiyat sayfaları açılamadı), JTL-Wawi, Pickware, plentymarkets / PlentyONE, Mimari seçenek B: hazır/açık kaynak ERP çekirdeği + bağdaştırıcılar (+23 more)

### Community 21 - "Pazaryerleri ve mağazalar / Entegrasyonlar: mevcut"
Cohesion: 0.09
Nodes (31): Entegrasyonlar: mevcut (19), Entegrasyonlar: kurulum talebi (≈50), DHL (mevcut), DPD (kurulum talebi), eBay (mevcut), Etsy (kurulum talebi), Hepsiburada (kurulum talebi), idealo (mevcut) (+23 more)

### Community 22 - "Otomasyon çekirdeği: Olay → Kural / 14 hazır kural"
Cohesion: 0.12
Nodes (28): Her çalışma tetikleyen olayla kayda geçer, Otomasyon çekirdeği: Olay → Kural → Onay düzeyi, 14 hazır kural, Kendiliğinden düzeyi (kurallar), Kural (koşul + işlem), Kural: drop siparişi iletme, Kural: eşitlemeyi yeniden deneme, Kural: fatura ve takip bildirimi (+20 more)

### Community 23 - "Satış Kanalları Ekranları / company-home"
Cohesion: 0.14
Nodes (22): Amazon (mevcut), METRO (mevcut), OTTO (mevcut), Belge: Satış Kanalları Ekranları (03-satis-kanallari.md), Görülemeyen: engellenen desenlerle (import, delete, sync, send=, /api/ vb.) hiçbir adres açılmadı, Görülemeyen: METRO sipariş, havuz, gönder, Gitmeyen ürünler içerikleri (hesap seçimi boş), Görülemeyen: OTTO orders/history/source ve Amazon products/listings sekmeleri yüklenmedi, Amazon: company-home içinde gömülü sekme takımı (amazon_tab, yalnız Woida) (+14 more)

### Community 24 - "Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt"
Cohesion: 0.11
Nodes (23): Açık soru 1: hangi roller müşteri bilgisini görmeli, S1 Kişisel veri sunucudan kısılmadan DOM'a geliyor (puan 9), Aynı API, kullanıcının yetkisiyle, Tek seferde en fazla 25 kayıt, Hazırla, onayla düzeyi (varsayılan), Kendiliğinden düzeyi, Müşteri mesajları ve ürün metinleri veridir, talimat değildir, Müşteri adı ve iletişim bilgisi asistana verilmez (+15 more)

### Community 25 - "Kanal sınıfı: kanala özel sayfalar / Aynı iş her kanalda ayrı sayfa/JS/"
Cohesion: 0.18
Nodes (23): Kaufland (mevcut), Shopify (mevcut), Fiyat ve adet hesap bazında ayrı kayıt (Wawi fiyatı ≠ platform fiyatı), Görülemeyen: send-kaufland products ve issues listeleri, Görülemeyen: shopify-pool, send-shopify, ozon-pool, send-ozon, mixoutlet-payments, worklist images satırları, eBay: ebay-pool (tüm ilanlar) + send-ebay (gönder) ikilisi, Kaufland: send-kaufland, catalog=kaufland/products/issues, Mixoutlet / Mollie ödeme eşleştirme kanalı (+15 more)

### Community 26 - "Ön Yüz Mimarisi / Desen: modal/dialog kabuğu her dos"
Cohesion: 0.12
Nodes (23): API: /api/catalog-search.php, API: /api/company-applications.php, API: /api/marketplace-stop.php, API: /api/product-entry.php, API: /api/product-list-insights.php, API: /api/product-platforms.php, API: /api/wholesale-sales.php, Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md) (+15 more)

### Community 27 - "Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek"
Cohesion: 0.13
Nodes (22): Açık soru 6: 79 iade neden ilk aşamada, S11 79 iade ilk aşamada kalmış (puan 4), S12 Kanal sağlık göstergesi ana ekranda yok (puan 4), S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6), Amazon eşleşme/onay sorunu 4.827 / 5.793 (%83), Toplu sıfırlama niteliğinde stok düzeltmeleri (sebep kaydı yok), Kanal sağlık göstergesi yok (N11 45/49 EAN'siz, Trendyol 86 inceleme), Kural: kanallar arası stok eşitleme (+14 more)

### Community 28 - "video-uret.py / go()"
Cohesion: 0.16
Nodes (17): go(), s_agent_q(), s_alerts(), s_channels(), s_close(), s_finance(), s_landing(), s_listing() (+9 more)

### Community 29 - "İlan yaşam döngüsü / Sipariş yolculuğu"
Cohesion: 0.14
Nodes (23): Adım 1: Ürünü hazırla, Adım 2: Kaynağı seç, Adım 3: Kanala gönder, Adım 4: Siparişi hazırla, Adım 5: Müşteriye ulaş, Sipariş yolculuğu (5 adım), Adım 8: Çıkarma (Acil satıştan kaldır, withdraw), Adım 5: Durum kontrolü (eşzamansız sonuç) (+15 more)

### Community 30 - "Reservations.tsx / ui.tsx"
Cohesion: 0.18
Nodes (19): lucide-react, react, MATRIX, MODS, buildRows(), Chip(), Detail(), Flow() (+11 more)

### Community 31 - "Selling.tsx / PriceRules()"
Cohesion: 0.16
Nodes (22): VAT, WAREHOUSES, alreadyOn(), Calc(), COMM, compPrice(), estCost(), Example() (+14 more)

### Community 32 - "API Yuzeyi / app.js"
Cohesion: 0.15
Nodes (19): Iki ayri yazma yolu (erp_action formu + /api/*.php), Belge: API Yuzeyi, CSRF yalniz govde alani, header yok, 16 bayt idempotency anahtari (8 dosya), Ortak istek bicimi (fetch, JSON, same-origin, csrf govde alani), Oturum bitince JSON yerine HTML giris sayfasi (kirilgan sozlesme), Siparis cekme/esitleme uclari, Yazma yolu sayisi = 2 (+11 more)

### Community 33 - "Sıradaki adımlar / Asistan: yapay zekâ bağlı biçim"
Cohesion: 0.10
Nodes (20): API anahtarı yalnız sunucuda, şifre ve istek sınırı, Gerçek dil modeli (Claude), Sonraki adım: asistanı gerçek yapay zekâyla denemek, Sonraki adım: ekranları telefon genişliğinde gözden geçirmek, Sonraki adım: yeni ekranları ve asistanı yayına göndermek, Sizden: asistan için yapay zekâ anahtarı, Sizden: eski kaynak kod ve veritabanı yapısı, Sizden: gerçek komisyon oranları ve KDV kuralları (+12 more)

### Community 34 - "package.json / devDependencies"
Cohesion: 0.14
Nodes (19): tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, vite, vite-plugin-singlefile, @vitejs/plugin-react, devDependencies (+11 more)

### Community 35 - "useStore() / Mobile.tsx"
Cohesion: 0.26
Nodes (20): Act, Bar(), Big(), binCmp(), Count(), Empty(), Head(), Line (+12 more)

### Community 36 - "assistant.mjs / server.mjs"
Cohesion: 0.14
Nodes (14): allow(), assistantStatus(), day, handleAssistant(), handleContent(), PER_DAY, PER_MINUTE, perIp (+6 more)

### Community 37 - "Automation.tsx / Drawer()"
Cohesion: 0.14
Nodes (18): ACTS, Anom, AREAS, Builder(), CONDS, EVENTS, History(), Level (+10 more)

### Community 38 - "Quality.tsx / QualityQueue()"
Cohesion: 0.15
Nodes (18): BANNED, bullets(), CAT_SUG, CH, dupGroups(), eanCheck(), eanOk(), jaccard() (+10 more)

### Community 39 - "/api/dhl-labels.php / /api/invoices.php"
Cohesion: 0.21
Nodes (16): Fatura ailesi (invoices.php), X-Request-ID izleme yalniz DHL'de, Tek uc, cok eylem (invoices ~35, dhl-labels ~40), CSRF alanı ve sınırlı idempotency, S5 İki yazma yolu ve tek-uç-çok-eylem (puan 6), API: /api/dhl-labels.php, API: /api/invoices.php, Desen: bir uç, çok eylem + data-endpoint (invoices, dhl-labels, wholesale-sales) (+8 more)

### Community 40 - "Karar 0004 - Yığın ayrıntıları / BullMQ + Redis"
Cohesion: 0.12
Nodes (16): Karar 0004 - Yığın ayrıntıları, BullMQ + Redis, Drizzle - reddedildi, Hetzner + Coolify - reddedildi, Keycloak - reddedildi, Mantine - reddedildi, pg-boss - reddedildi, Prisma (+8 more)

### Community 41 - "WawiERP Analiz Sunumu / Önemli sorunlar listesi"
Cohesion: 0.14
Nodes (18): WawiERP Analiz Sunumu, Desteği biten PHP sürümü, Bilgi haritası ve hafıza, Müşteri bilgisinin sayfaya açık gelmesi, Seçenek A - Yerinde yenileme, Seçenek B - Hazır ERP çekirdeği, Sipariş hacmi (2.555/30 gün), WawiERP mevcut sistem (54 ekran, 232.500 ürün) (+10 more)

### Community 42 - "dhl-labels.js / Desen: request/api fetch sarmalayı"
Cohesion: 0.17
Nodes (12): innerHTML kullanimi, kacis dogrulanmadi, DHL / kargo ailesi, S13 Sabit kodlanmış kanal/depo kimlikleri (puan 2), API: /api/external-tracking.php, Depolama: localStorage wawi-dhl-recreate-warning-v1:<kapsam>, Desen: DHL üçlüsü (dhl-labels, dhl-recreate, dhl-recreate-batch) aynı akışı kopyalıyor, Desen: request/api fetch sarmalayıcısı her dosyada yeniden yazılmış (AbortController + fetch + JSON denetimi), JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluşturma, önizleme, yazdırma, iade etiketi, adres düzeltme, pdf-lib (+4 more)

### Community 43 - "WawiERP Mimari ve Geçiş Sunumu / WawiERP Teknoloji Seçenekleri Sunu"
Cohesion: 0.18
Nodes (16): Karar 0001 - Çok kiracılı sistem, Karar 0002 - Sıfırdan geliştirme, Karar 0003 - Teknoloji yığını, Küçük ölçek (ayda 2.555 sipariş), PHP (Symfony/Laravel) - reddedildi, PostgreSQL, WawiERP Mimari ve Geçiş Sunumu, Birlikte çalışma biçimi (+8 more)

### Community 44 - "İş akışı 2: Barkodla fiziki sayım / physical-stock-check"
Cohesion: 0.27
Nodes (13): Sorun: negatif fiziki stok (25.061 kritik kayit), Durum makinesi: Stok hareketi / durumu, Fiziki stok (sayılan; Sayım yok = bilinmiyor), İş akışı 2: Barkodla fiziki sayım, İş akışı 2 adım 1: Sayım deposu seç, İş akışı 2 adım 2: İşlemi yapanı seç, İş akışı 2 adım 3: SKU/EAN okut (+1), İş akışı 2 adım 4: Güncel stoğu kontrol et (+5 more)

### Community 45 - "Çoklu dil: üç ayrı mekanizma, orta / i18n 2: wawiText yardımcısı"
Cohesion: 0.17
Nodes (12): API: /api/barcode-count.php, Genel nesneler (window): WawiLocale, WawiI18n, WawiDhlConfig, WawiOrderSelection vb., Dil seçimi: lang sorgu parametresi ve <html lang>, yalnız TR ve DE, Çoklu dil: üç ayrı mekanizma, ortak çatı yok, JS: barcode-count.js — Barkodla sayım (kamera, hızlı sayım), JS: catalog-labels.js — Üretilmiş katalog kategori sözlüğü TR↔DE (58 KB), JS: sidebar-search.js — Menü araması (izin filtreli menü), JS: ui-dictionary-de-entry-pack-options-20261015.js — Almanca ek sözlük: ürün girişi paket seçenekleri (+4 more)

### Community 46 - "compilerOptions / tsconfig.json"
Cohesion: 0.15
Nodes (12): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 47 - "purchases / Tedarikçi"
Cohesion: 0.30
Nodes (12): Tedarikçi, Modül: Satın alma ve tedarikçiler, Alış belgesi: fatura / irsaliye, ödeme durumu, Tedarikçi kartı: alım, fatura, ürün satırı, belge adedi, İş akışı 3: Stok girişi / mal kabul, İş akışı 3 adım 1: Ürün kartından Stoğa adet ekle, İş akışı 3 adım 2: Satın alma merkezinden mal kabul, İş akışı 3 adım 3: Tablodan hızlı düzenleme (+4 more)

### Community 48 - "Çok kiracılı / Sıfırdan geliştirme"
Cohesion: 0.17
Nodes (10): Çok kiracılı (multi-tenant) sistem, Kiracı → Şirket → Depo → Kanal → Hesap, Mevcut WawiERP (12 şirket, 5 depo, 41 kanal), Aşamalı geçiş, Ekip: sahibi + Claude, Eski PHP sistemi (legacy), Sıfırdan geliştirme, Seçenek C - Sıfırdan yeni sistem (+2 more)

### Community 49 - "i18n 3: Satır içi t(tr, de) yardım / Banka içe aktarma penceresi"
Cohesion: 0.22
Nodes (10): Banka içe aktarma penceresi (bank-import.js, Shopify havale, 5 MB CSV), erp-features: Banka ekstresi ve mutabakat hazırlanıyor, Finans akışı 8: banka CSV tara, kontrol et ve tamamla, API: /api/product-organization.php, API: /api/shopify-bank-import.php, JS: bank-import.js — Shopify havale/banka CSV içe aktarma (tarama, eşleştirme, onay), JS: filter-buttons.js — Salt okunur filtre düğmeleri sunumu, JS: order-customer-info.js — Müşteri bilgisi sunumu (+2 more)

### Community 50 - "aşırı yavaş/takılan listeler / problem-products"
Cohesion: 0.22
Nodes (3): Sorun/not kaydı: sorun türleri, not, durum (Açık / Çözüldü), dosyalar, Sorun (reason) kodları ve durum open/resolved/all, Ekran: problem-products — ürün not/sorun kayıtları

### Community 51 - "Karar 0005 - Bulut sağlayıcı / AWS Frankfurt"
Cohesion: 0.38
Nodes (10): Karar 0005 - Bulut sağlayıcı, AWS CDK (TypeScript), AWS Frankfurt (eu-central-1), ECS Fargate, ElastiCache (Redis uyumlu), GCP Frankfurt - reddedildi, RDS for PostgreSQL, S3 (+2 more)

### Community 52 - "Belge 11 Yeniden Tasarım Girdileri / Bilinen mevcut durum"
Cohesion: 0.28
Nodes (8): Bilinen mevcut durum (tek PHP girişi, stok defteri yok, iki yazma yolu), A+C birleşimi (önce stok defteri, sonra kanal eklentisi), Mimari seçenek A: modüler monolit dönüşümü, Mimari seçenek C: yeni olay-tabanlı çekirdek + kanal eklentileri, Belge 11 Yeniden Tasarım Girdileri, Kaynak kod gelince doğrulanacak varsayımlar tablosu, Açık soru 8: öncelik güvenlik/uyum mu, performans mı, yeni özellik mi, Sonraki adım: eski kaynak koddan iş kurallarını çıkarmak

### Community 53 - "bulk-products / product_key biçimi: kaynağa göre f"
Cohesion: 0.22
Nodes (8): bulk_products_download alanı (erp_action değil): şablon/CSV dışa aktarma, product_key: ebay-account:16:<ilan>:<hash>, product_key: manual:<hash>, product_key: shopify:9:variant:<id>, product_key: sku:JTL-1051, product_key: supplier:asterbuy:<hash>, product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_id + product_key birleşik anahtar), Ekran: bulk-products — toplu ürün CSV/Excel içe-dışa aktarma

### Community 54 - "Belge 08 Performans / /api/session-status.php"
Cohesion: 0.25
Nodes (7): Belge 08 Performans (pasif ölçüm), Pasif ölçüm yöntemi ve sınırları (tek ölçüm/sayfa), Yinelenen istek (product-pool-count x2, 43 betik), Açık soru 10: session-status ve warehouse-messages hangi dosyada çağrılıyor, API: /api/directory-search.php, API: /api/session-status.php, JS: directory-picker.js — Dizin (şirket/depo/kanal) seçici ve directory-search araması

### Community 55 - "İş akışı 5: Mükerrer birleştirme / Veri kalitesi"
Cohesion: 0.39
Nodes (8): İş akışı 5: Mükerrer birleştirme, İş akışı 5 adım 1: Eşleşme türü seç, İş akışı 5 adım 2: 2-20 kart seç, İş akışı 5 adım 3: Ana kartı seç, stok çatışmasını çöz, İş akışı 5 adım 4: Onay + yönetim PIN, İş akışı 5 adım 5: Birleştir ve kaydet, Geliştirme: veri kalitesi kuyruğu (çaba orta), Ekran: Veri kalitesi ("sıradakini düzelt" kuyruğu)

### Community 56 - "typescript / NestJS"
Cohesion: 0.29
Nodes (7): React, Fastify - reddedildi, NestJS, Next.js - reddedildi, Vite + React, typescript, typescript@^5.6.3

### Community 57 - "Asterbuy siparişi / Asterbuy: Ödeme bekliyor"
Cohesion: 0.53
Nodes (6): Asterbuy: Kontrol edilecek (hata/inceleme, tahmin), Asterbuy: Ödeme bekliyor, Asterbuy: Oluşturulacak, Asterbuy: Takip aktarıldı, Asterbuy: Takip bekliyor / aktarılıyor, Asterbuy siparişi (dropship tedarikçi akışı)

### Community 58 - "Sipariş durumu / Sipariş durumu: Hazırlanıyor"
Cohesion: 0.47
Nodes (5): Sipariş durumu: Hazırlanıyor (İşlemde), Sipariş durumu: İptal / iade, Sipariş durumu: Tamamlandı, Sipariş durumu: Yeni, Sipariş durumu (Yeni, Hazırlanıyor, Tamamlandı, İptal/iade)

### Community 59 - "İş akışı 4: Depolar arası stok akt / İş akışı 4 adım 4: Dağıtımı önizle"
Cohesion: 0.60
Nodes (6): İş akışı 4: Depolar arası stok aktarımı, İş akışı 4 adım 1: Ürün/kategori seç, İş akışı 4 adım 2: Eşit/yüzdeli dağıtım, İş akışı 4 adım 3: Hedef depolar, İş akışı 4 adım 4: Dağıtımı önizle, İş akışı 4 adım 5: Kayıt (hareket geçmişi)

### Community 60 - "Muhasebe aktarımı / S3 KDV özeti %19 sabit"
Cohesion: 0.50
Nodes (4): KDV/OSS: sabit %19 özet riski, Açık soru 2: şirket başına KDV oranları/OSS ve muhasebe kaynağı, S3 KDV özeti %19 sabit (puan 6), Ekran: Muhasebe aktarımı

### Community 61 - "TR entegratörleri grubu / Dopigo"
Cohesion: 0.40
Nodes (5): Dopigo (TR entegratör), Entegra (TR entegratör), Sentos (TR entegratör), StockMount (TR entegratör), TR entegratörleri grubu (AB pazaryeri kapsamı doğrulanamadı)

### Community 62 - "İş akışı 6 Dropship: Oluşturulacak / Ödeme bekliyor"
Cohesion: 0.40
Nodes (5): İş akışı 6 Dropship: Oluşturulacak, Ödeme bekliyor, Takip alınır (4 saatte bir), Satış kanalına işlenir, Takip aktarıldı

### Community 63 - "İş akışı 3 Toplama: şirket/DHL hes / Siparişleri getir ve seç"
Cohesion: 0.40
Nodes (5): İş akışı 3 Toplama: şirket/DHL hesabı seç, Siparişleri getir ve seç, Toplama listesi, DHL etiket / toplu yazdır, Başarısızlar Oluşturulamayanlar filtresi → toplu yeniden oluştur

### Community 64 - "İş akışı 8 İade: DHL iade etiketi / İncele / işle"
Cohesion: 0.40
Nodes (5): İş akışı 8 İade: DHL iade etiketi listelenir, İncele / işle, Ürün geldi kontrolü, Müşteriye ödeme / tekrar gönderim / sorun, Çözüldü

### Community 65 - "sessionStorage anahtarları dağınık / Depolama: sessionStorage wawi-dhl-"
Cohesion: 0.40
Nodes (4): Depolama: sessionStorage wawi-dhl-recreate-batch-v1:<kapsam>, Depolama: sessionStorage wawi-physical-stock-progress-v1, Depolama: sessionStorage wawierp.product-entry-draft.v1, Depolama: sessionStorage wawi-wholesale:<taslak kapsamı>:<satış id veya new>

### Community 66 - "İş akışı 7 Depo içi sevk: plan tas / Depodan çıkar"
Cohesion: 0.50
Nodes (4): İş akışı 7 Depo içi sevk: plan taslağı, Depodan çıkar (stok hareketi), Yolda, Hedef depoda mal kabul

### Community 67 - "İş akışı 1: Yeni ürün girişi / İş akışı 1 adım 2: Bulunamazsa yen"
Cohesion: 0.83
Nodes (4): İş akışı 1: Yeni ürün girişi (sihirbaz), İş akışı 1 adım 1: Havuzda EAN/ad/SKU ile ara, İş akışı 1 adım 2: Bulunamazsa yeni ürün formu (varyantsız/varyantlı), İş akışı 1 adım 3: eBay gönderimini hazırla

### Community 68 - "scripts / build"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 69 - "Toplu fatura PDF/e-posta / İş akışı 5 Fatura: satırdan yazdır"
Cohesion: 0.67
Nodes (3): İş akışı 5 Fatura: satırdan yazdır/düzenle/gönder, Toplu fatura PDF/e-posta (shipping), İade faturası

### Community 70 - "İş akışı 7: EAN / görsel düzeltme / İş akışı 7 adım 1: Eksik EAN/görse"
Cohesion: 1.00
Nodes (3): İş akışı 7: EAN / görsel düzeltme, İş akışı 7 adım 1: Eksik EAN/görsel listesi, İş akışı 7 adım 2: EAN ekle / düzelt veya görsel düzenle

## Ambiguous Edges - Review These
- `API: /api/warehouse-messages.php` → `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`  [AMBIGUOUS]
  docs/panel/05-on-yuz-mimarisi.md · relation: calls

## Knowledge Gaps
- **147 isolated node(s):** `message_action=send (depolara mesaj; erp_action yok)`, `Varlık: Hesap (account) — küresel sayısal kimlik, kanal başına kimlik bilgisi`, `Varlık: Kanal (channel) — tür + ad, küresel kimlik`, `Doğrulanamayan rakip verileri (resmi fiyat sayfaları açılamadı)`, `Açık soru 7: gerçek günlük sipariş hacimleri ve tepe saatler` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 365 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Bildirim merkezi (zil, kısayol B)` connect `Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler` to `Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt`, `Karar 0004 - Yığın ayrıntıları / BullMQ + Redis`, `fmtNum() / Agent.tsx`?**
  _High betweenness centrality (0.361) - this node is a cross-community bridge._
- **What connects `message_action=send (depolara mesaj; erp_action yok)`, `Varlık: Hesap (account) — küresel sayısal kimlik, kanal başına kimlik bilgisi`, `Varlık: Kanal (channel) — tür + ad, küresel kimlik` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Badge() / Card()` be split into smaller, more focused modules?**
  _Cohesion score 0.1189358372456964 - nodes in this community are weakly interconnected._
- **Why does `Yeni panel mock (tıklanabilir taslak)` connect `Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler` to `typescript / NestJS`, `Sıradaki adımlar / Asistan: yapay zekâ bağlı biçim`, `Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek`, `Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **Should `WawiERP / Beyin katmanı` be split into smaller, more focused modules?**
  _Cohesion score 0.055288461538461536 - nodes in this community are weakly interconnected._
- **Why does `Sunum: WawiERP Yenilikler` connect `Sunum: WawiERP Yenilikler / Sonraki aday geliştirmeler` to `Sıradaki adımlar / Asistan: yapay zekâ bağlı biçim`, `accounting / erp-features`, `Sunum: WawiERP Rakipler ve Yol Har / Belge 10 Rakip ve Hedef Mimari`, `Otomasyon çekirdeği: Olay → Kural / 14 hazır kural`, `İş akışı 5: Mükerrer birleştirme / Veri kalitesi`, `Karar 0006 - Panelde yapay zekâ as / Asistan akışı: soru → veri → yanıt`, `Nerede güçlüyüz, nerede eksik / S8 Stok modeli ayrı alanlar, harek`?**
  _High betweenness centrality (0.210) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `API: /api/warehouse-messages.php` and `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._