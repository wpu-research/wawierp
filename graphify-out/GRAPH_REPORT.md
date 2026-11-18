# Graph Report - .  (2026-11-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2017 nodes · 5360 edges · 94 communities (87 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 439 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4f5bdf49`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- data.ts
- Orders.tsx
- Belge 12 Kart Kural Şartnamesi
- Agent.tsx
- WawiERP (wawib2b.com)
- useStore
- Ekran: orders-pool — birleşik sipariş havuzu
- Money.tsx
- Otomasyon çekirdeği: Olay → Kural → Onay düzeyi
- Sunum: WawiERP Rakipler ve Yol Haritası
- Sunum: WawiERP Yenilikler
- video-uret.py
- Badge
- Belge: Satış Kanalları Ekranları (03-satis-kanallari.md)
- Yeniden kurulan menu agaci (yerlesim tahmin)
- Ekran: team — ekip yönetimi
- Yeni panel mock (tıklanabilir taslak)
- photos.ts
- Ekran: warehouse-home — depo çalışma alanı: şirket-kanal kapsamı, veri akışı
- warehouse_product
- Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok yönetimi)
- Ekran: accounting — ön muhasebe
- Belge: Alan Modeli
- Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)
- Asistan: yapay zekâ bağlı biçim (/api/assistant)
- panel-harita.md: WawiERP panel keşif haritası
- 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma alanı
- Ekran: invoices — faturalar
- Modül: Pazaryerleri ve mağazalar
- API: /api/menu-counts.php
- Chat.tsx
- Ekran: customers-master — müşteri ana kaydı
- Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API)
- Benzer ürün önerisi: stoktaki diğer markalardan en yakın ürünler
- Landing.tsx
- Selling.tsx
- İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → durum kontrol → yayında → sorun → çıkar → kayıt)
- Belge: Panel Analizi - Birlesik Bulgular
- Karar 0006 - Panelde yapay zekâ asistanı
- server.mjs
- package.json
- Sıradaki adımlar
- Automation.tsx
- Mobile.tsx
- Belge: API Yuzeyi
- Ekran: tickets — destek talepleri
- API: /api/dhl-labels.php
- JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluşturma, önizleme, yazdırma, iade etiketi, adres düzeltme, pdf-lib
- assistant.mjs
- WawiERP Mimari ve Geçiş Sunumu
- Karar 0004 - Yığın ayrıntıları
- Nerede güçlüyüz, nerede eksik
- Çoklu dil: üç ayrı mekanizma, ortak çatı yok
- Ekran: finance-documents — finans belgeleri
- compilerOptions
- Belge: Bilgi Mimarisi
- Çok kiracılı (multi-tenant) sistem
- main.tsx
- Ekran: purchases — satın alma ve mal kabul
- typescript
- Karar 0005 - Bulut sağlayıcı
- Sidebar.tsx
- WawiERP Analiz Sunumu
- handle
- Depolar arası sevkiyat
- Sorun: eşitleme ve sağlık göstergeleri kırmızı
- İş akışı 2: Barkodla fiziki sayım
- Finans akışı 4: cari seç/oluştur
- gate
- Asterbuy siparişi (dropship tedarikçi akışı)
- product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_id + product_key birleşik anahtar)
- İş akışı 4: Depolar arası stok aktarımı
- Geçiş aşamaları 0-5
- Sunum yayını: /sunum/ adresi şifresiz, herkese açık (15.11.2026)
- Ekran: Muhasebe aktarımı
- TR entegratörleri grubu (AB pazaryeri kapsamı doğrulanamadı)
- İş akışı 6 Dropship: Oluşturulacak
- İş akışı 3 Toplama: şirket/DHL hesabı seç
- İş akışı 8 İade: DHL iade etiketi listelenir
- Sorun: sessionStorage anahtarları dağınık, 5 farklı adlandırma şeması
- İş akışı 7 Depo içi sevk: plan taslağı
- İş akışı 1: Yeni ürün girişi (sihirbaz)
- KDV/MwSt satış özeti sabit %19
- scripts
- Toplu fatura PDF/e-posta (shipping)
- İş akışı 7: EAN / görsel düzeltme
- İş akışı 1 Sipariş girişi: platform otomatik aktarım / elle çekme
- Finans akışı 2: liste İşlemler Faturayı düzenle
- Panel mock index.html
- Sıkı CSP başlıkları
- Açık soru 9: iş modeli, dışarıya hizmet ve çok kiracılık
- WawiERP Panel: Finans ve Yönetim
- Para birimleri EUR, TRY, USD, GBP (tahsilatta CZK, PLN)

## God Nodes (most connected - your core abstractions)
1. `Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)` - 99 edges
2. `useStore()` - 73 edges
3. `panel-harita.md: WawiERP panel keşif haritası` - 65 edges
4. `Badge()` - 63 edges
5. `Tek giriş noktası /?page=<ad> (54 page değeri)` - 57 edges
6. `Ekran: orders-pool — birleşik sipariş havuzu` - 52 edges
7. `Card()` - 51 edges
8. `fmtNum()` - 49 edges
9. `Belge: Satış Kanalları Ekranları (03-satis-kanallari.md)` - 49 edges
10. `Belge 12 Kart Kural Şartnamesi` - 47 edges

## Surprising Connections (you probably didn't know these)
- `AWS CDK (TypeScript)` --implements--> `typescript`  [INFERRED]
  kararlar/0005-bulut-saglayici.md → yeni/panel-mock/package.json
- `Müşteri bilgisi role göre gizli; açınca kayda geçer` --semantically_similar_to--> `Müşteri adı ve iletişim bilgisi asistana verilmez`  [INFERRED] [semantically similar]
  sunum/wawierp-yenilikler.html → kararlar/0006-asistan-katmani.md
- `Çok kiracılılık açıklaması` --semantically_similar_to--> `Çok kiracılı (multi-tenant) sistem`  [INFERRED] [semantically similar]
  sunum/wawierp-teknoloji-secenekleri.html → kararlar/0001-cok-kiracili-sistem.md
- `WawiERP mevcut sistem (54 ekran, 232.500 ürün)` --semantically_similar_to--> `Mevcut WawiERP (12 şirket, 5 depo, 41 kanal)`  [INFERRED] [semantically similar]
  sunum/wawierp-analiz-sunumu.html → kararlar/0001-cok-kiracili-sistem.md
- `Karar 0003 - Teknoloji yığını` --references--> `typescript`  [EXTRACTED]
  kararlar/0003-teknoloji-yigini.md → yeni/panel-mock/package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Duvar ekranı dönen sayfalar ve kayan yazı** — kararlar_0012_duvar_ekrani_duvar_ekrani_tv_modu, kararlar_0012_duvar_ekrani_sayfa_sirket_kanal_satis, kararlar_0012_duvar_ekrani_sayfa_kategori_hedef, kararlar_0012_duvar_ekrani_sayfa_magaza_urun_durumu, kararlar_0012_duvar_ekrani_kayan_yazi_bandi [EXTRACTED 1.00]
- **Tek tanım kuralları: ciro, stok düzeyi, menü rozeti sayacı** — docs_03_panel_analizi_sayaclar_tek_kaynak, kararlar_0012_duvar_ekrani_hedef_sayacinda_iptal_geri_sayilir [INFERRED 0.85]
- **Kart kritik yolu K-01 K-02 K-05 K-04 K-18** — docs_12_kart_kural_sartnamesi_k01, docs_12_kart_kural_sartnamesi_k02, docs_12_kart_kural_sartnamesi_k05, docs_12_kart_kural_sartnamesi_k04, docs_12_kart_kural_sartnamesi_k18 [EXTRACTED 1.00]
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

## Communities (94 total, 7 thin omitted)

### Community 0 - "data.ts"
Cohesion: 0.04
Nodes (78): B2B, B2B0, b2bTotals(), carrierOf(), CARRIERS, MANUAL0, ManualLabel, Msg (+70 more)

### Community 1 - "Orders.tsx"
Cohesion: 0.08
Nodes (71): ago(), canInvoice(), canLabel(), canShip(), fmtDT(), fmtNum(), mask(), Product (+63 more)

### Community 2 - "Belge 12 Kart Kural Şartnamesi"
Cohesion: 0.06
Nodes (74): §9 açık sorular: sayısal değerler geliştirici varsayımıdır, uydurulmaz, Belge 12 Kart Kural Şartnamesi, Hukuki: kısmi iade teklifi tüketici cayma hakkını gölgeleyemez, Denetim kaydı ortak katman; 13 modülün 12'sinde yoktu, Dört göz: talebi açan onaylayamaz; onaylayan oturumdan alınır, EAN doğrulaması tek ortak yerde, Tuzak: sessiz izin (fail-open); güvenlik kapıları reddet tarafına düşer, Fatura serisi tablosu (sirket_id, yil, son_sira); SEQUENCE kullanılmaz (+66 more)

### Community 3 - "Agent.tsx"
Cohesion: 0.07
Nodes (63): Act, ActKind, Agent(), answer(), runLive(), runTool(), send(), ApiMsg (+55 more)

### Community 4 - "WawiERP (wawib2b.com)"
Cohesion: 0.06
Nodes (65): Oturum başında kuralları, Çalışırken kuralları, WawiERP Claude Kuralları (CLAUDE.md), Sınırlar: canlı siteye yalnız okuma, gizli veri yazılmaz, Oturum sonunda kuralları, Yeniden tasarım için açık sorular (4), Konumlandırma boşluğu: DE+TR pazaryeri tek panelde, Cloudflare (DNS, proxy, analitik) (+57 more)

### Community 5 - "useStore"
Cohesion: 0.06
Nodes (49): lucide-react, GOTO, NAV, Palette(), Root(), Shell(), useRoute(), VIEWS (+41 more)

### Community 6 - "Ekran: orders-pool — birleşik sipariş havuzu"
Cohesion: 0.06
Nodes (45): Sipariş, Modül: Birleşik sipariş havuzu, WawiERP Panel: Sipariş, Kargo, İade, Destek Alanı, data-dhl-order/download/settings/recreate, data-external-tracking-order: harici takip no, DHL etiketi (gidiş + ayrı iade etiketi, ücretli, yeniden oluşturulabilir), Sipariş durumu: Hazırlanıyor (İşlemde), Sipariş durumu: İptal / iade (+37 more)

### Community 7 - "Money.tsx"
Cohesion: 0.12
Nodes (41): company(), fmtMoney(), Channels(), Accounting(), aggregate(), BankMatch(), buildLines(), candidates() (+33 more)

### Community 8 - "Otomasyon çekirdeği: Olay → Kural → Onay düzeyi"
Cohesion: 0.09
Nodes (43): A+C birleşimi (önce stok defteri, sonra kanal eklentisi), İlke: stok defteri (hareket kaydı), S8 Stok modeli ayrı alanlar, hareket defteri yok (puan 6), Negatif fiziki stok kayıtları ve gizli sayı kusuru, Toplu sıfırlama niteliğinde stok düzeltmeleri (sebep kaydı yok), Açık: kullanıcının kendi kuralını yazabilmesinin kapsamı, Açık: pilotta açılacak kurallar, Her çalışma tetikleyen olayla kayda geçer (+35 more)

### Community 9 - "Sunum: WawiERP Rakipler ve Yol Haritası"
Cohesion: 0.11
Nodes (40): Belge 10 Rakip ve Hedef Mimari, Base (BaseLinker), Bilinen mevcut durum (tek PHP girişi, stok defteri yok, iki yazma yolu), Billbee, Doğrulanamayan rakip verileri (resmi fiyat sayfaları açılamadı), JTL-Wawi, Pickware, plentymarkets / PlentyONE (+32 more)

### Community 10 - "Sunum: WawiERP Yenilikler"
Cohesion: 0.08
Nodes (40): İlke: tek API katmanı, S9 Kanal başına sayfa/JS/uç kopyası (puan 6), Açık: asistan kullanımının abonelik fiyatına yansıması, Açılışta sormadan fark ettiklerini bildirme, Aday: destek yanıtı taslağı, Aday: komisyon ve kargo dahil net kâr, Aday: yavaş satan stok raporu, Dalga 3: Fark yaratan (+32 more)

### Community 11 - "video-uret.py"
Cohesion: 0.11
Nodes (38): json, os, pathlib, playwright_sync_api, secrets, shutil, subprocess, go() (+30 more)

### Community 12 - "Badge"
Cohesion: 0.08
Nodes (36): Country, STAFF, AuditLog(), MATRIX, MODS, Team(), Billing(), CARRIER (+28 more)

### Community 13 - "Belge: Satış Kanalları Ekranları (03-satis-kanallari.md)"
Cohesion: 0.11
Nodes (37): Amazon (mevcut), idealo (mevcut), METRO (mevcut), OTTO (mevcut), Belge: Satış Kanalları Ekranları (03-satis-kanallari.md), Görülemeyen: engellenen desenlerle (import, delete, sync, send=, /api/ vb.) hiçbir adres açılmadı, Görülemeyen: send-kaufland products ve issues listeleri, Görülemeyen: METRO sipariş, havuz, gönder, Gitmeyen ürünler içerikleri (hesap seçimi boş) (+29 more)

### Community 14 - "Yeniden kurulan menu agaci (yerlesim tahmin)"
Cohesion: 0.09
Nodes (37): DHL (mevcut), PostNL (mevcut), Modül: Toplama, paketleme, kargo, Sorun: shipments/shipping ve pool adlandirmasi, Sorun: kanal basina kopya sayfa/JS/uc, Ilke: tek kanal baglastirici arayuzu, Adlandirma tutarsizliklari (shipments/shipping, pool, sorunlu, TR/DE/EN), Kenar menu bolumleri (orders, products, companies, platforms, marketplaces, management, operations) (+29 more)

### Community 15 - "Ekran: team — ekip yönetimi"
Cohesion: 0.08
Nodes (37): Modül: Ekip, yetki, denetim izi, Rol basina menu (yalniz sistem yoneticisi goruldu), Rol x depo x modul yetki matrisi belgesiz, Belge 09 Güvenlik ve Uyum, Giriş sayfası başlıkları ve CSP, DSGVO/KVKK boşlukları (Impressum, AVV, silme, aktarım), E-fatura (XRechnung/ZUGFeRD) gereksinimi, GoBD fatura saklama ve değişmezlik (+29 more)

### Community 16 - "Yeni panel mock (tıklanabilir taslak)"
Cohesion: 0.06
Nodes (36): Denetim kaydı "asistan aracılığıyla" + 10 sn geri alma, Olay, Her ekran başlığında ekran simgesi, Hareket ilkesi: kısa, yalnız transform ve opacity, hareketi azalt tercihinde kapalı, Akış şeridi: 26 ekranda işin dört adımda nasıl aktığı (gizlenebilir), Tabloda sıralı belirme, kayan çekmece, boş durum çizimi, Belge: panel-mock README, Erteleme (1 saat, yarın sabah) ve "Ben alıyorum" (+28 more)

### Community 17 - "photos.ts"
Cohesion: 0.05
Nodes (36): yeni_panel_mock_src_assets_products_00, yeni_panel_mock_src_assets_products_01, yeni_panel_mock_src_assets_products_02, yeni_panel_mock_src_assets_products_03, yeni_panel_mock_src_assets_products_04, yeni_panel_mock_src_assets_products_05, yeni_panel_mock_src_assets_products_06, yeni_panel_mock_src_assets_products_07 (+28 more)

### Community 18 - "Ekran: warehouse-home — depo çalışma alanı: şirket-kanal kapsamı, veri akışı"
Cohesion: 0.17
Nodes (36): Depo, Şirket, Modül: Çoklu depo ve şirket, En cok baglantili kavramlar, Kanal/mağaza (41), şirket (11), depo (5) süzgeç boyutları, Ana/alt depo ilişkisi: İstanbul ana; Almanya, Hollanda, Mega B, Technowelt alt depo, Sorun: kişisel veri açıkta, Tasarım: kişisel veri maskeleme / rol bazlı gösterim (+28 more)

### Community 19 - "warehouse_product"
Cohesion: 0.12
Nodes (34): EAN, SKU, Modül: Ortak ürün kataloğu, Sorun: yavas liste uclari, 504, zaman asimi, Depo EAN 3: depo sayımı barkodu, feed barkodunu değiştirmez, EAN 2: alternatif platform barkodu, Katalog arşivi: kartlar görünümden kaldırılır, stok/eşleşme/fatura korunur, Ürün kaynak dağılımı (13 kaynak): supplier-api 112.136, wawi_store 97.513, shopify 11.209, parfumarena 5.460, JTL 2.466, ebay 1.740, otto 601, shopify_admin 502, kaufland 462, manual 333, manual-count 90, bulk-import 9, ebay_pool 5 (+26 more)

### Community 20 - "Ekran: warehouse — depo ürün listesi (Ürün havuzu / Stok yönetimi)"
Cohesion: 0.11
Nodes (34): Tedarikçi, Dropshipping stok modeli, Fiziki stok, Sanal stok, Üç stok modeli (ayırt edici fikir), Drop tedarikçi: Asterbuy (796 ürün, API, alış fiyatı KDV hariç), Drop tedarikçi: B2BUhren Germany, Drop tedarikçi: BueroArena (+26 more)

### Community 21 - "Ekran: accounting — ön muhasebe"
Cohesion: 0.08
Nodes (34): Sorun: denetim kaydi DHL gurultusu, Denetim kaydı kapsamı (180/30 gün saklama), S10 Denetim kaydı 180/30 gün ve DHL gürültüsü (puan 4), S14 Adlandırma tutarsızlığı, tab=dashboard sessiz düşüş (puan 3), Banka içe aktarma penceresi (bank-import.js, Shopify havale, 5 MB CSV), erp-features: Banka ekstresi ve mutabakat hazırlanıyor, Denetim kategorileri: security, inventory, catalog, organization, purchasing, finance, integration, system, Denetim kaydı (83.070 satır; sonuç success/failure/denied; önem 4 seviye; 8 kategori) (+26 more)

### Community 22 - "Belge: Alan Modeli"
Cohesion: 0.11
Nodes (34): Ilan yasam dongusu (havuz -> onizle -> gonder -> kontrol -> kaldir), Ilke: stok defteri (tek hareket defteri), Belge: Alan Modeli, Varlik: B2B cari (musteri, lokasyon, portal kullanicisi, tahsilat), Varlik: calisan ve rol, Varlik: cikis belgesi (sales_invoice, intercompany_invoice, warehouse_dispatch), Varlik: denetim kaydi (83.070 satir), Varlik: depo urun kaydi (~151 bin; warehouse_id + product_key) (+26 more)

### Community 23 - "Belge: Ön Yüz Mimarisi (05-on-yuz-mimarisi.md)"
Cohesion: 0.10
Nodes (33): API: /api/catalog-search.php, API: /api/company-applications.php, API: /api/marketplace-stop.php, API: /api/product-entry.php, API: /api/product-list-insights.php, API: /api/product-organization.php, API: /api/product-platforms.php, API: /api/shopify-bank-import.php (+25 more)

### Community 24 - "Asistan: yapay zekâ bağlı biçim (/api/assistant)"
Cohesion: 0.08
Nodes (33): API anahtarı yalnız sunucuda, şifre ve istek sınırı, Asistan: yapay zekâ bağlı biçim (/api/assistant), Ziyaretçi adresi Railway X-Real-IP başlığından alınır, Güvenlik başlıkları: CSP, HSTS, X-Frame-Options, Referrer-Policy, Bulgu: istem enjeksiyonu gerçek modelle denenmedi; pilot öncesi yapılmalı, Bulgu: eski sistemde desteği bitmiş PHP 8.1, HSTS yok, SPF/DMARC yok (yüksek), Bulgu: eski sistemde müşteri bilgisi yetkisiz ekranda da tarayıcıya gidiyor (yüksek), Yanlış şifre sınırı: 10 dakikada 20 yanlış denemede adres geçici kilitlenir (+25 more)

### Community 25 - "panel-harita.md: WawiERP panel keşif haritası"
Cohesion: 0.12
Nodes (31): Sorun: negatif fiziki stok (25.061 kritik kayit), Görülemeyenler: detay sayfası, resolved notlar, DHL hesap listesi, iade diyaloğu, bulk_products_download alanı (erp_action değil): şablon/CSV dışa aktarma, Sorun: aşırı yavaş/takılan listeler (warehouse, stock-movements, critical-physical-stock, ...), Sorun: dosya/içe aktarma sınırları, Sorun: görünmeyen/açılmayan ekranlar ve erp_action boşlukları, Tasarım: sunucu tarafı sayfalama/önbellek, iskelet yükleme, otomatik tekrar, Sorun/not kaydı: sorun türleri, not, durum (Açık / Çözüldü), dosyalar (+23 more)

### Community 26 - "02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma alanı"
Cohesion: 0.16
Nodes (30): Ürün, Varlik: stok hareketi (degismez kayit), Klasik form yolu POST ?page + erp_action, Gömülü global modallar (Depo/Tedarikçi/Şirket/Stok/Kategori ekle vb.), message_action=send (depolara mesaj; erp_action yok), 02-urun-katalog-stok.md: Ürün, katalog, stok, satın alma alanı, Depo ürün kaydı (151.075): ürün kartı x depo; sale_price, physical_stock, dropship_stock, minimum_stock, bin_location, Depo EAN 3, sanal stok, Kategori: ad, renk, ürün sayısı, depo görünürlüğü (411 kategori) (+22 more)

### Community 27 - "Ekran: invoices — faturalar"
Cohesion: 0.10
Nodes (29): Fatura, Modül: Faturalar ve belgeler, Modül: Ön muhasebe ve cari, Modül: Satın alma ve tedarikçiler, Açık soru 3: faturalar yalnız Almanya deposunda mı, data-invoice-*: fatura yazdır/düzenle/gönder/iade faturası, Eski ön ek WAWI-LE-<yıl>-<sıra>, İade faturası RET-<sipariş>-<n> (negatif tutar) (+21 more)

### Community 28 - "Modül: Pazaryerleri ve mağazalar"
Cohesion: 0.10
Nodes (28): Entegrasyonlar: mevcut (19), Entegrasyonlar: kurulum talebi (≈50), DPD (kurulum talebi), eBay (mevcut), Etsy (kurulum talebi), Hepsiburada (kurulum talebi), JTL-Wawi entegrasyonu (mevcut), n11 (mevcut) (+20 more)

### Community 29 - "API: /api/menu-counts.php"
Cohesion: 0.13
Nodes (27): Baglama gore degisen menu (sirket, depo, kanal, izin, dil), Sayac/oturum uclari, Belge 08 Performans (pasif ölçüm), Önceden hesaplanmış sayaç hedefi (P95 < 500 ms), Pasif ölçüm yöntemi ve sınırları (tek ölçüm/sayfa), 5 ayrı sayaç ucu (tek summary ucu önerisi), Yavaş sayfa TTFB (warehouse-home 3,2 sn), Yinelenen istek (product-pool-count x2, 43 betik) (+19 more)

### Community 30 - "Chat.tsx"
Cohesion: 0.11
Nodes (26): react, askAssistant(), CHANNELS, ChatApi, ChatProvider(), Ctx, dmId(), Feedback() (+18 more)

### Community 31 - "Ekran: customers-master — müşteri ana kaydı"
Cohesion: 0.14
Nodes (26): Müşteri, Modül: B2B müşteri portalı, data-customer-edit: müşteri bilgisi düzenle, B2B cari (48 cari, para birimi başına ayrı bakiye), Cari borcu = satış faturaları − tahsilatlar, para birimleri toplanmaz, CARİ KAYDI EKSİK rozeti, Cari lokasyonu (teslimat, müşteri portalı stoğu), Cari portal kullanıcısı (can_adjust_stock yetkisi) (+18 more)

### Community 32 - "Kanal sınıfı: kanala özel sayfalar (ayrı JS + ayrı API)"
Cohesion: 0.22
Nodes (26): Kaufland (mevcut), Shopify (mevcut), Sorun: "Pool/havuz" isim karmaşası, Fiyat ve adet hesap bazında ayrı kayıt (Wawi fiyatı ≠ platform fiyatı), Görülemeyen: shopify-pool, send-shopify, ozon-pool, send-ozon, mixoutlet-payments, worklist images satırları, eBay: ebay-pool (tüm ilanlar) + send-ebay (gönder) ikilisi, Kaufland: send-kaufland, catalog=kaufland/products/issues, Mixoutlet / Mollie ödeme eşleştirme kanalı (+18 more)

### Community 33 - "Benzer ürün önerisi: stoktaki diğer markalardan en yakın ürünler"
Cohesion: 0.10
Nodes (25): İş akışı 5: Mükerrer birleştirme, İş akışı 5 adım 1: Eşleşme türü seç, İş akışı 5 adım 2: 2-20 kart seç, İş akışı 5 adım 3: Ana kartı seç, stok çatışmasını çöz, İş akışı 5 adım 4: Onay + yönetim PIN, İş akışı 5 adım 5: Birleştir ve kaydet, Asistan aracı find_similar_products: yanıtın altında fotoğraflı liste, Katalog ürün çekmecesinde "Benzer ürünler · diğer markalar" bölümü (+17 more)

### Community 34 - "Landing.tsx"
Cohesion: 0.12
Nodes (23): Root(), BARS, BEFORE, CH, CHANNEL, Count(), Cta(), FAQ (+15 more)

### Community 35 - "Selling.tsx"
Cohesion: 0.13
Nodes (19): COMM, VAT, WAREHOUSES, alreadyOn(), Calc(), compPrice(), estCost(), ListingWizard() (+11 more)

### Community 36 - "İlan yaşam döngüsü (havuz → hazırlık → önizle/onayla → durum kontrol → yayında → sorun → çıkar → kayıt)"
Cohesion: 0.14
Nodes (23): Adım 1: Ürünü hazırla, Adım 2: Kaynağı seç, Adım 3: Kanala gönder, Adım 4: Siparişi hazırla, Adım 5: Müşteriye ulaş, Sipariş yolculuğu (5 adım), Adım 8: Çıkarma (Acil satıştan kaldır, withdraw), Adım 5: Durum kontrolü (eşzamansız sonuç) (+15 more)

### Community 37 - "Belge: Panel Analizi - Birlesik Bulgular"
Cohesion: 0.12
Nodes (23): Belge: Panel Analizi - Birlesik Bulgular, Ilke: kuyruk + durum ekrani, sayfali onbellekli listeler, Baglam adreste tasiniyor (company, warehouse, channel, account), Ilke: baglam rotada, kimlikler koda gomulmeden, Sorun: kanal esitlemeleri bayat (Ozon, OTTO), Koda gomulu kanal/depo kimlikleri, Hiyerarsi Depo -> Sirket -> Kanal -> Hesap, Iki ayri yazma yolu (erp_action formu + /api/*.php) (+15 more)

### Community 38 - "Karar 0006 - Panelde yapay zekâ asistanı"
Cohesion: 0.15
Nodes (23): Açık: araçların sunucuda oturum yetkisiyle çalışması, Açık: Kendiliğinden düzeyinin pilotta açılma ölçütü, Açık: kişisel verinin AB içinde işlenmesi ve veri işleme sözleşmesi, Aynı API, kullanıcının yetkisiyle, Tek seferde en fazla 25 kayıt, Hazırla, onayla düzeyi (varsayılan), Karar 0006 - Panelde yapay zekâ asistanı, Kendiliğinden düzeyi (+15 more)

### Community 39 - "server.mjs"
Cohesion: 0.09
Nodes (19): ref_node_crypto, ref_node_fs, ref_node_http, ref_node_path, ref_node_url, ref_node_zlib, deck, deckDir (+11 more)

### Community 40 - "package.json"
Cohesion: 0.14
Nodes (19): tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, vite, vite-plugin-singlefile, @vitejs/plugin-react, devDependencies (+11 more)

### Community 41 - "Sıradaki adımlar"
Cohesion: 0.11
Nodes (20): Kaynak kod gelince doğrulanacak varsayımlar tablosu, Açık: gerçek servisle deneme (anahtar bekleniyor), Gerçek dil modeli (Claude), Sonraki adım: asistanı gerçek yapay zekâyla denemek, Sonraki adım: eski kaynak koddan iş kurallarını çıkarmak, Sonraki adım: ekranları telefon genişliğinde gözden geçirmek, Sonraki adım: yeni ekranları ve asistanı yayına göndermek, Sizden: asistan için yapay zekâ anahtarı (+12 more)

### Community 42 - "Automation.tsx"
Cohesion: 0.13
Nodes (19): RETURN_RULE, ACTS, Anom, AREAS, Builder(), CONDS, EVENTS, History() (+11 more)

### Community 43 - "Mobile.tsx"
Cohesion: 0.26
Nodes (19): Act, Bar(), Big(), binCmp(), Count(), Empty(), Head(), Line (+11 more)

### Community 44 - "Belge: API Yuzeyi"
Cohesion: 0.18
Nodes (18): Belge: API Yuzeyi, CSRF yalniz govde alani, header yok, 16 bayt idempotency anahtari (8 dosya), Ortak istek bicimi (fetch, JSON, same-origin, csrf govde alani), Oturum bitince JSON yerine HTML giris sayfasi (kirilgan sozlesme), Siparis cekme/esitleme uclari, Yazma yolu sayisi = 2, Yontem ve R/W sinifi eylem adindan cikarim (+10 more)

### Community 45 - "Ekran: tickets — destek talepleri"
Cohesion: 0.14
Nodes (18): Sayfa başına istek hedefi < 30, Sayfa başına 91-98 istek, Müşteri kişisel verisi DOM'da açık (istemcide gizleme), İlke: sayaç/özet tek kaynaktan, önceden hesaplı, S2 Sayaç ve özetler çelişiyor (puan 9), S4 Menü sayaçları 6-8 sn, sayfa başına 91-98 istek (puan 6), Yeniden tasarım: durum rozeti ve tutarlı sayaç, Sorun: ticket sayısı çelişkisi (450 açık vs 139 sayfa), durum rozeti yok (+10 more)

### Community 46 - "API: /api/dhl-labels.php"
Cohesion: 0.23
Nodes (17): Fatura ailesi (invoices.php), X-Request-ID izleme yalniz DHL'de, Tek uc, cok eylem (invoices ~35, dhl-labels ~40), CSRF alanı ve sınırlı idempotency, S5 İki yazma yolu ve tek-uç-çok-eylem (puan 6), API: /api/dhl-labels.php, API: /api/invoices.php, Desen: bir uç, çok eylem + data-endpoint (invoices, dhl-labels, wholesale-sales) (+9 more)

### Community 47 - "JS: dhl-labels.js — DHL gönderi etiketi: hazırlama, oluşturma, önizleme, yazdırma, iade etiketi, adres düzeltme, pdf-lib"
Cohesion: 0.17
Nodes (17): innerHTML kullanimi, kacis dogrulanmadi, DHL / kargo ailesi, İlke: bağlam rota parametresi, S13 Sabit kodlanmış kanal/depo kimlikleri (puan 2), API: /api/external-tracking.php, Depolama: localStorage wawi-dhl-recreate-warning-v1:<kapsam>, Desen: DHL üçlüsü (dhl-labels, dhl-recreate, dhl-recreate-batch) aynı akışı kopyalıyor, Desen: request/api fetch sarmalayıcısı her dosyada yeniden yazılmış (AbortController + fetch + JSON denetimi) (+9 more)

### Community 48 - "assistant.mjs"
Cohesion: 0.15
Nodes (12): ref_anthropic_ai_sdk, abortOnClose(), askLimit, assistantStatus(), contentLimit, handleAssistant(), handleContent(), PER_DAY (+4 more)

### Community 49 - "WawiERP Mimari ve Geçiş Sunumu"
Cohesion: 0.18
Nodes (16): Karar 0001 - Çok kiracılı sistem, Karar 0002 - Sıfırdan geliştirme, Karar 0003 - Teknoloji yığını, Küçük ölçek (ayda 2.555 sipariş), PHP (Symfony/Laravel) - reddedildi, PostgreSQL, WawiERP Mimari ve Geçiş Sunumu, Birlikte çalışma biçimi (+8 more)

### Community 50 - "Karar 0004 - Yığın ayrıntıları"
Cohesion: 0.14
Nodes (16): Karar 0004 - Yığın ayrıntıları, BullMQ + Redis, Drizzle - reddedildi, Hetzner + Coolify - reddedildi, Keycloak - reddedildi, Mantine - reddedildi, pg-boss - reddedildi, Prisma (+8 more)

### Community 51 - "Nerede güçlüyüz, nerede eksik"
Cohesion: 0.16
Nodes (15): İlke: kuyruk + durum ekranı ile eşitleme, Açık soru 6: 79 iade neden ilk aşamada, S11 79 iade ilk aşamada kalmış (puan 4), S12 Kanal sağlık göstergesi ana ekranda yok (puan 4), Amazon eşleşme/onay sorunu 4.827 / 5.793 (%83), Eksik: yapay zekâ özelliği, Geliştirme: iade akışı (çaba orta), Geliştirme: kanal sağlık ekranı (çaba küçük) (+7 more)

### Community 52 - "Çoklu dil: üç ayrı mekanizma, ortak çatı yok"
Cohesion: 0.15
Nodes (14): API: /api/barcode-count.php, API: /api/directory-search.php, Genel nesneler (window): WawiLocale, WawiI18n, WawiDhlConfig, WawiOrderSelection vb., Dil seçimi: lang sorgu parametresi ve <html lang>, yalnız TR ve DE, Çoklu dil: üç ayrı mekanizma, ortak çatı yok, JS: barcode-count.js — Barkodla sayım (kamera, hızlı sayım), JS: catalog-labels.js — Üretilmiş katalog kategori sözlüğü TR↔DE (58 KB), JS: directory-picker.js — Dizin (şirket/depo/kanal) seçici ve directory-search araması (+6 more)

### Community 53 - "Ekran: finance-documents — finans belgeleri"
Cohesion: 0.19
Nodes (13): Belge ayrıntısı: kaynak sipariş no, KDV, net/brüt, Çıkış belgesi defteri (SF/SV rozetleri, 1.763 belge Almanya), Çıkış belgesi KPI: toplam, satış faturası, şirketler arası, sevk, kesin toplam, Yeniden tasarım: varsayılan Tüm depolar, net etiketli seçici, Yeniden tasarım: iade/kredi notu ayrı tür, Sorun: iade faturaları defterde DEPO SEVK BELGESI (SV) olarak sınıflı, Sorun: dil karışık TR/DE/EN, büyük-küçük harf hatası, Sorun: varsayılan depo yanlış (warehouse=1 İstanbul, veri depo 2de) (+5 more)

### Community 54 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 55 - "Belge: Bilgi Mimarisi"
Cohesion: 0.30
Nodes (12): Belge: Bilgi Mimarisi, Menu agacinin uc kopyasi (kenar, ust cubuk, cekmece), Mobil notlari (860px cekmece, ayni sayfaya JS katlama), IA onerileri: tek menu modeli, tek liste + suzgec, yetki matrisi, Uc gezinme yuzeyi (kenar menu, ust cubuk, sayfa ici), Depolama: sessionStorage anahtarı sayfadan (data-position-key), Desen: mobil ve görsel katman dosyaları (mobile-workspace, mobile-list-workspace, filter-buttons, topbar-sections), JS: mobile-list-workspace.js — Mobil liste çalışma alanı (yalnız sunum) (+4 more)

### Community 56 - "Çok kiracılı (multi-tenant) sistem"
Cohesion: 0.17
Nodes (12): Çok kiracılı (multi-tenant) sistem, Kiracı → Şirket → Depo → Kanal → Hesap, Mevcut WawiERP (12 şirket, 5 depo, 41 kanal), Aşamalı geçiş, Ekip: sahibi + Claude, Eski PHP sistemi (legacy), Sıfırdan geliştirme, Tek yazan kuralı (+4 more)

### Community 57 - "main.tsx"
Cohesion: 0.17
Nodes (8): react-dom, dependencies, lucide-react@^0.460.0, react@^18.3.1, react-dom@^18.3.1, App(), yeni_panel_mock_src_index, Guard

### Community 58 - "Ekran: purchases — satın alma ve mal kabul"
Cohesion: 0.31
Nodes (10): Alış belgesi: fatura / irsaliye, ödeme durumu, Tedarikçi kartı: alım, fatura, ürün satırı, belge adedi, İş akışı 3: Stok girişi / mal kabul, İş akışı 3 adım 1: Ürün kartından Stoğa adet ekle, İş akışı 3 adım 2: Satın alma merkezinden mal kabul, İş akışı 3 adım 3: Tablodan hızlı düzenleme, İş akışı 3 adım 4: Toplu stok düzenleme, İş akışı 3 adım 5: CSV/Excel yükleme (+2 more)

### Community 59 - "typescript"
Cohesion: 0.20
Nodes (10): React, Fastify - reddedildi, NestJS, Next.js - reddedildi, Vite + React, typescript, Desteği biten PHP sürümü, Bugünkü mimari (tek PHP sunucusu) (+2 more)

### Community 60 - "Karar 0005 - Bulut sağlayıcı"
Cohesion: 0.38
Nodes (10): Karar 0005 - Bulut sağlayıcı, AWS CDK (TypeScript), AWS Frankfurt (eu-central-1), ECS Fargate, ElastiCache (Redis uyumlu), GCP Frankfurt - reddedildi, RDS for PostgreSQL, S3 (+2 more)

### Community 61 - "Sidebar.tsx"
Cohesion: 0.29
Nodes (8): Avatar(), Logo(), Badges, load(), NavGroup, NavItem, Saved, Sidebar()

### Community 62 - "WawiERP Analiz Sunumu"
Cohesion: 0.28
Nodes (9): WawiERP Analiz Sunumu, Bilgi haritası ve hafıza, Müşteri bilgisinin sayfaya açık gelmesi, Seçenek A - Yerinde yenileme, Seçenek B - Hazır ERP çekirdeği, Sipariş hacmi (2.555/30 gün), WawiERP mevcut sistem (54 ekran, 232.500 ürün), Önemli sorunlar listesi (+1 more)

### Community 63 - "handle"
Cohesion: 0.25
Nodes (9): clientIp(), handle(), isJson(), json(), sameOrigin(), sendDeck(), sendPage(), stream() (+1 more)

### Community 64 - "Depolar arası sevkiyat"
Cohesion: 0.43
Nodes (8): Depolar arası sevkiyat, Sevkiyat: Depodan çıktı (stok hareketi), Sevkiyat: Sevke hazır, Sevkiyat: İptal edildi, Sevkiyat: Mal kabul tamamlandı, Sevkiyat: Taslak, Sevkiyat: Hedef depoya ulaştı, Sevkiyat: Yolda

### Community 65 - "Sorun: eşitleme ve sağlık göstergeleri kırmızı"
Cohesion: 0.33
Nodes (7): Sorun: stok kavramları birbirine karışıyor, Sorun: sayı tutarsızlıkları, Sorun: eşitleme ve sağlık göstergeleri kırmızı, Tasarım: tek stok kimliği şeması (kaynak + güven düzeyi + zaman), Tasarım: eşitleme/sağlık göstergeleri için merkezi durum ve hata raporlaması, Ürün-katalog-stok alanı: yavaş yükleme, stok karmaşası, veri tutarsızlığı (özet), Sorun: genel bakışta Satış özeti/Ürün sıralaması yüklenemedi, depo kartlarında Güncelleme tamamlanamadı

### Community 66 - "İş akışı 2: Barkodla fiziki sayım"
Cohesion: 0.52
Nodes (7): İş akışı 2: Barkodla fiziki sayım, İş akışı 2 adım 1: Sayım deposu seç, İş akışı 2 adım 2: İşlemi yapanı seç, İş akışı 2 adım 3: SKU/EAN okut (+1), İş akışı 2 adım 4: Güncel stoğu kontrol et, İş akışı 2 adım 5: Kayıt yöntemi seç (ekle/ayarla), İş akışı 2 adım 6: Sayımı kaydet

### Community 67 - "Finans akışı 4: cari seç/oluştur"
Cohesion: 0.29
Nodes (7): Finans akışı 4: cari seç/oluştur, Satıcı şirket + stok çıkış deposu, Ürünler, Doğrula, Kesinleştir (stok bir kez düşer), Fatura PDF, Tahsilat kaydı

### Community 68 - "gate"
Cohesion: 0.43
Nodes (7): digest(), gate(), lockedFor(), noteFail(), ok(), prune(), recent()

### Community 69 - "Asterbuy siparişi (dropship tedarikçi akışı)"
Cohesion: 0.53
Nodes (6): Asterbuy: Kontrol edilecek (hata/inceleme, tahmin), Asterbuy: Ödeme bekliyor, Asterbuy: Oluşturulacak, Asterbuy: Takip aktarıldı, Asterbuy: Takip bekliyor / aktarılıyor, Asterbuy siparişi (dropship tedarikçi akışı)

### Community 70 - "product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_id + product_key birleşik anahtar)"
Cohesion: 0.33
Nodes (6): product_key: ebay-account:16:<ilan>:<hash>, product_key: manual:<hash>, product_key: shopify:9:variant:<id>, product_key: sku:JTL-1051, product_key: supplier:asterbuy:<hash>, product_key biçimi: kaynağa göre farklı (5 biçim; warehouse_id + product_key birleşik anahtar)

### Community 71 - "İş akışı 4: Depolar arası stok aktarımı"
Cohesion: 0.60
Nodes (6): İş akışı 4: Depolar arası stok aktarımı, İş akışı 4 adım 1: Ürün/kategori seç, İş akışı 4 adım 2: Eşit/yüzdeli dağıtım, İş akışı 4 adım 3: Hedef depolar, İş akışı 4 adım 4: Dağıtımı önizle, İş akışı 4 adım 5: Kayıt (hareket geçmişi)

### Community 72 - "Geçiş aşamaları 0-5"
Cohesion: 0.40
Nodes (6): Tutmayan sayılar ve negatif stok, Geçiş aşamaları 0-5, Gölgede çalışma, İstanbul pilotu, Kanal dalgaları (küçükten büyüğe), Stok defteri (yalnız ekleme hareket defteri)

### Community 73 - "Sunum yayını: /sunum/ adresi şifresiz, herkese açık (15.11.2026)"
Cohesion: 0.33
Nodes (6): Bildirimler role göre süzülür; müşteri adı ve adresi geçmez, Herkese açık sunuma müşteri adı, kişisel veri ya da gizli rakam konmaz, Yayın kopyası: yeni/panel-mock/sunum klasörü, yayina-kopyala.sh ile yenilenir, Panel (/panel) ve asistan ucu şifreli kalır, Tanıtım videosu: 22 sahne, yaklaşık dört dakika, Türkçe seslendirme, Sunum yayını: /sunum/ adresi şifresiz, herkese açık (15.11.2026)

### Community 74 - "Ekran: Muhasebe aktarımı"
Cohesion: 0.50
Nodes (5): KDV/OSS: sabit %19 özet riski, İlke: ülke bazlı vergi motoru, Açık soru 2: şirket başına KDV oranları/OSS ve muhasebe kaynağı, S3 KDV özeti %19 sabit (puan 6), Ekran: Muhasebe aktarımı

### Community 75 - "TR entegratörleri grubu (AB pazaryeri kapsamı doğrulanamadı)"
Cohesion: 0.40
Nodes (5): Dopigo (TR entegratör), Entegra (TR entegratör), Sentos (TR entegratör), StockMount (TR entegratör), TR entegratörleri grubu (AB pazaryeri kapsamı doğrulanamadı)

### Community 76 - "İş akışı 6 Dropship: Oluşturulacak"
Cohesion: 0.40
Nodes (5): İş akışı 6 Dropship: Oluşturulacak, Ödeme bekliyor, Takip alınır (4 saatte bir), Satış kanalına işlenir, Takip aktarıldı

### Community 77 - "İş akışı 3 Toplama: şirket/DHL hesabı seç"
Cohesion: 0.40
Nodes (5): İş akışı 3 Toplama: şirket/DHL hesabı seç, Siparişleri getir ve seç, Toplama listesi, DHL etiket / toplu yazdır, Başarısızlar Oluşturulamayanlar filtresi → toplu yeniden oluştur

### Community 78 - "İş akışı 8 İade: DHL iade etiketi listelenir"
Cohesion: 0.40
Nodes (5): İş akışı 8 İade: DHL iade etiketi listelenir, İncele / işle, Ürün geldi kontrolü, Müşteriye ödeme / tekrar gönderim / sorun, Çözüldü

### Community 79 - "Sorun: sessionStorage anahtarları dağınık, 5 farklı adlandırma şeması"
Cohesion: 0.40
Nodes (5): Depolama: sessionStorage wawi-dhl-recreate-batch-v1:<kapsam>, Depolama: sessionStorage wawi-physical-stock-progress-v1, Depolama: sessionStorage wawierp.product-entry-draft.v1, Depolama: sessionStorage wawi-wholesale:<taslak kapsamı>:<satış id veya new>, Sorun: sessionStorage anahtarları dağınık, 5 farklı adlandırma şeması

### Community 80 - "İş akışı 7 Depo içi sevk: plan taslağı"
Cohesion: 0.50
Nodes (4): İş akışı 7 Depo içi sevk: plan taslağı, Depodan çıkar (stok hareketi), Yolda, Hedef depoda mal kabul

### Community 81 - "İş akışı 1: Yeni ürün girişi (sihirbaz)"
Cohesion: 0.83
Nodes (4): İş akışı 1: Yeni ürün girişi (sihirbaz), İş akışı 1 adım 1: Havuzda EAN/ad/SKU ile ara, İş akışı 1 adım 2: Bulunamazsa yeni ürün formu (varyantsız/varyantlı), İş akışı 1 adım 3: eBay gönderimini hazırla

### Community 82 - "KDV/MwSt satış özeti sabit %19"
Cohesion: 0.67
Nodes (4): KDV/MwSt satış özeti sabit %19, KDV: satır bazında; muhasebe özeti sabit %19, Yeniden tasarım: vergi özeti belge satırlarından üretilsin, Sorun: sabit %19 KDV özeti

### Community 83 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 84 - "Toplu fatura PDF/e-posta (shipping)"
Cohesion: 0.67
Nodes (3): İş akışı 5 Fatura: satırdan yazdır/düzenle/gönder, Toplu fatura PDF/e-posta (shipping), İade faturası

### Community 85 - "İş akışı 7: EAN / görsel düzeltme"
Cohesion: 1.00
Nodes (3): İş akışı 7: EAN / görsel düzeltme, İş akışı 7 adım 1: Eksik EAN/görsel listesi, İş akışı 7 adım 2: EAN ekle / düzelt veya görsel düzenle

## Ambiguous Edges - Review These
- `API: /api/warehouse-messages.php` → `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`  [AMBIGUOUS]
  docs/panel/05-on-yuz-mimarisi.md · relation: calls

## Knowledge Gaps
- **386 isolated node(s):** `Msg`, `Job`, `StockRow`, `View`, `Kind` (+381 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `API: /api/warehouse-messages.php` and `JS: menu-counts.js — Kenar menü sayaçları (120 sn yenileme)`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **Why does `Yeni panel mock (tıklanabilir taslak)` connect `Yeni panel mock (tıklanabilir taslak)` to `Benzer ürün önerisi: stoktaki diğer markalardan en yakın ürünler`, `Karar 0006 - Panelde yapay zekâ asistanı`, `Otomasyon çekirdeği: Olay → Kural → Onay düzeyi`, `Sunum yayını: /sunum/ adresi şifresiz, herkese açık (15.11.2026)`, `Sunum: WawiERP Yenilikler`, `Nerede güçlüyüz, nerede eksik`, `Asistan: yapay zekâ bağlı biçim (/api/assistant)`, `typescript`?**
  _High betweenness centrality (0.301) - this node is a cross-community bridge._
- **Why does `Sunum: WawiERP Yenilikler` connect `Sunum: WawiERP Yenilikler` to `Benzer ürün önerisi: stoktaki diğer markalardan en yakın ürünler`, `Karar 0006 - Panelde yapay zekâ asistanı`, `Otomasyon çekirdeği: Olay → Kural → Onay düzeyi`, `Sunum: WawiERP Rakipler ve Yol Haritası`, `Sıradaki adımlar`, `Ekran: tickets — destek talepleri`, `Ekran: team — ekip yönetimi`, `Yeni panel mock (tıklanabilir taslak)`, `Nerede güçlüyüz, nerede eksik`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `Ekran: Veri kalitesi ("sıradakini düzelt" kuyruğu)` connect `Benzer ürün önerisi: stoktaki diğer markalardan en yakın ürünler` to `Otomasyon çekirdeği: Olay → Kural → Onay düzeyi`, `warehouse_product`, `Sunum: WawiERP Yenilikler`, `Nerede güçlüyüz, nerede eksik`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `Msg`, `Job`, `StockRow` to the rest of the system?**
  _386 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.037756497948016415 - nodes in this community are weakly interconnected._
- **Should `Orders.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07825507825507826 - nodes in this community are weakly interconnected._