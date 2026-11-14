# WawiERP Panel — Ön Yüz Mimarisi

Tarih: 2026-11-14 · Kaynak: `https://wawib2b.com/assets/js/*.js` (+ `/assets/returns-menu.js`) genel statik dosyaları; yalnız `grep`/okuma ile incelendi, hiçbiri çalıştırılmadı. Sunucu uçlarının adresleri JS içinde değil, çoğu zaman sayfa HTML'indeki `data-*` niteliklerinde; bu değerler canlı sayfanın DOM'undan (yalnız nitelik okuma) alındı. Hiçbir uç çağrılmadı. Dosya sayısı 43, toplam yaklaşık 878.000 bayt (≈ 857 KB) ve 10.207 satır.

## Özet

- Çerçevesiz, düz JS: her dosya bir IIFE ya da üst düzey fonksiyonlar. Modül sistemi, paketleyici, tip yok. **Her sayfa 43 betiğin hepsini yüklüyor** (kök sayfada da; ör. toptan satış ve DHL kodu genel bakışta da iniyor). Betik adreslerine `?v=<sürüm>-h<özet>` eklenmiş (önbellek kırma).
- Dosya boyutu çok dengesiz: `erp.js` 2.981 satır / 156 KB, `app.js` 1.424 satır / 62 KB, `dhl-labels.js` 955 satır / 120 KB; kalan 40 dosyanın çoğu 30–400 satır.
- Sunucu iletişimi: `credentials:'same-origin'` ile `fetch`, JSON; uç adresleri sunucu HTML'e `data-endpoint` (ya da `data-*-endpoint/-api/-url`) olarak koyar. İstek gövdesinde `action` + `csrf` (+ `warehouse`) alanları var. Yazma işlemleri iki biçimde: (1) klasik HTML form POST + `erp_action` (erp.js, physical-stock-sync.js) ve (2) JSON POST `/api/*.php` + `action`.
- Sayfa başına yaklaşık 10 arka plan GET çağrısı (menü sayaçları, iade sayıları, notlar, oturum durumu…); ağ günlüğünde birkaç tanesi iptal edilip yeniden gönderilmiş görünüyor (çift çağrı).
- Çoklu dil üç ayrı mekanizma: sunucudan gelen sözlük (`WawiLocale` + `ui-i18n.js`), satır içi `t(tr, de)` yardımcıları ve dosya içi Almanca hata kodu sözlükleri. Ortak çatı yok.
- Gizli anahtar benzeri dize **bulunmadı**; yalnız sabit kodlanmış kimlikler var (aşağıda).

## Dosya envanteri

Satır sayıları indirilen dosyalardan (`wc -l`); küçültülmüş dosyalarda satır az, bayt çok. Sorumluluk sütunu dosyadaki kod/yorumlardan; yalnız adından çıkarılanlar "(tahmin)" ile işaretli.

| Dosya | Satır | Bayt | Sorumluluk |
|---|---:|---:|---|
| erp.js | 2.981 | 155.742 | Depo/ürün/alış-satış belgesi formları, ürün seçici, barkod arama, stok dağıtımı, toplu seçim, sayfalama, `data-endpoint` ile ürün adı/barkod arama (en büyük dosya) |
| app.js | 1.424 | 61.768 | Ana uygulama: toast/ilerleme, gezinme, ürün ve havuz filtreleri, JTL ürün havuzu (`jtl-products`), eBay/Kaufland sipariş çekme, muhasebe sipariş eşitleme, bağlantı testi, satış grafiği |
| dhl-labels.js | 955 | 119.876 | DHL gönderi etiketi: hazırlama, oluşturma, önizleme, yazdırma, iade etiketi, adres düzeltme, durum rozetleri, hesap ayarları, pdf-lib ile PDF |
| directory-picker.js | 379 | 18.943 | Dizin (şirket/depo/kanal) seçici, `directory-search` araması |
| invoice-workflow.js | 392 | 51.750 | Siparişten fatura: durum, düzenleme, iade faturası, e-posta (SMTP) ayarları, gönderim |
| mobile-list-workspace.js | 283 | 17.917 | Mobil liste çalışma alanı (yalnız sunum) |
| wholesale-sales.js | 267 | 45.492 | Toptan satış sihirbazı (cari, ürünler, doğrulama, kesinleştirme, yazdırma, taslak kurtarma) |
| product-entry-wizard.js | 232 | 28.634 | Yeni ürün/varyant giriş sihirbazı |
| operational-notes.js | 223 | 24.835 | Sipariş sorunu / ürün için iç notlar ve konuşmalar, rozet ve sayaç |
| catalog-search.js | 217 | 14.240 | Katalog/pool arama önerisi (`catalog-search`) |
| menu-counts.js | 189 | 13.262 | Kenar menü sayaçları (120 sn yenileme) |
| overview-workspace.js | 187 | 14.048 | Genel bakış raf/kart düzeni, satış özeti (`data-summary-url`), "Satış özeti yüklenemedi" mesajı bu dosyada |
| barcode-count.js | 161 | 12.994 | Barkodla sayım (kamera, hızlı sayım) |
| packing-workflow.js | 158 | 14.290 | Paketleme: seçim, pick listesi, ardışık fatura hazırlama, packing PDF |
| filter-buttons.js | 149 | 11.225 | Salt okunur filtre düğmeleri sunumu |
| bank-import.js | 140 | 10.293 | Shopify havale/banka CSV içe aktarma penceresi (tarama, eşleştirme, onay) |
| topbar-sections.js | 139 | 9.324 | Üst gezinme bölümleri (bağımsız) |
| product-list-insights.js | 139 | 18.627 | Ürün listesi içgörü penceresi (sipariş/ürün bilgisi) |
| order-customer-edit.js | 115 | 11.295 | Siparişte müşteri adresi/kargo bilgisi düzenleme |
| physical-stock-sync.js | 112 | 8.491 | Fiziki stok senkron ilerleme paneli (izleme) |
| invoice-marketplace.js | 111 | 12.545 | Pazaryeri faturası aktarım durumu (kuyruk, doğrulama, yeniden dene) |
| dhl-recreate-batch.js | 109 | 20.240 | Toplu DHL etiketi yeniden oluşturma (ardışık, oturum günlüğü) |
| mobile-workspace.js | 104 | 4.860 | Mobil kenar menü/çalışma alanı (yalnız sunum) |
| sidebar-position.js | 101 | 6.329 | Kenar menü grup durumunu oturumda tutar (API yok) |
| invoice-edit.js | 99 | 12.311 | Fatura düzenleme penceresi |
| product-market-prices.js | 95 | 14.808 | Pazaryeri fiyat karşılaştırma (eBay, idealo, Kaufland, Metro, Otto bağlantıları) |
| stock-comparison.js | 77 | 9.890 | Stok / liste bağlantısı karşılaştırma, harici ilan adresleri |
| dhl-recreate.js | 76 | 13.962 | Tek sipariş DHL etiketi yeniden oluşturma |
| order-worklist-counts.js | 72 | 4.725 | İş listesi sayaçları (60 sn) |
| external-tracking.js | 67 | 5.839 | Harici takip numarası girişi/doğrulama |
| product-platforms.js | 58 | 5.135 | Ürünün platform eşleşmeleri penceresi |
| sidebar-search.js | 57 | 3.692 | Menü araması (yalnız sunucuda çizilmiş izin filtreli menü) |
| product-pool-count.js | 51 | 3.103 | Havuz/fiziki ürün sayısı |
| invoice-order-pipeline.js | 46 | 5.967 | Sipariş kartlarında fatura hattı durumu (`order_pipeline_states`) |
| product-detail-actions.js | 35 | 2.484 | Ürün detay eylemleri (tahmin: kısa yardımcı) |
| ui-dictionary-de-entry-pack-options-20261015.js | 34 | 4.324 | Almanca ek sözlük: ürün girişi paket seçenekleri |
| marketplace-stop.js | 33 | 7.369 | Pazaryeri satışı durdurma penceresi (önizle/uygula/durum) |
| order-customer-info.js | 33 | 3.526 | Müşteri bilgisi sunumu |
| returns-menu.js | 32 | 2.013 | İade menü sayacı (BroadcastChannel ile sekmeler arası) |
| product-bestsellers.js | 28 | 2.386 | Çok satanlar bloğu |
| ui-i18n.js | 21 | 1.766 | `WawiI18n` çekirdeği: sözlükle çeviri |
| product-organization.js | 19 | 9.250 | Ürün kategori/organizasyon çağrıları (`categories`) |
| catalog-labels.js | 7 | 58.010 | Üretilmiş dosya ("Generated by scripts/build-catalog-labels.php"): katalog kategori sözlüğü TR↔DE |

Not: "Satış özeti yüklenemedi" / "Ürün sıralaması yüklenemedi" mesajlarının kaynakları `overview-workspace.js` (satış özeti) ve `product-bestsellers.js` (çok satanlar) dosyalarında; ilgili uçların (`data-summary-url`, `data-url`) değeri DOM'da okunmadı.

## Sunucu uçları

Yöntem sütunu: GET = sorgu parametresiyle, POST = JSON gövde (`action`, `csrf`, çoğunda `warehouse`). Adresler sayfa HTML'inden okunan `data-*` niteliklerinden; eylem adları JS'ten.

| Uç / eylem | Yöntem | Kullanan | Not |
|---|---|---|---|
| `/api/menu-counts.php` (+ `?view=worklists&warehouse=<id>`) | GET | menu-counts.js, order-worklist-counts.js | Kenar menü ve iş listesi sayaçları |
| `/api/product-pool-count.php?warehouse=<id>` ve `?group=physical&warehouse=<id>` | GET | product-pool-count.js | Havuz ve fiziki ürün sayıları |
| `/api/returns.php?action=counts` | GET | returns-menu.js | İade sayacı |
| `/api/operational-notes.php` (`action=count`, `list`, `badges`; dosya yükleme `action=file`) | GET, POST (multipart) | operational-notes.js | Sayaç yalnız sekme görünürken |
| `/api/session-status.php` | GET | (yüklenen dosyalarda çağıran bulunamadı; ağ günlüğünde görüldü — tahmin: satır içi betik) | Sayfa başına çağrılıyor |
| `/api/warehouse-messages.php` | GET | (çağıran bulunamadı; `data-message-refresh` ile ilişkili — tahmin) | Depo mesajları paneli |
| `/api/product-market-prices.php` | GET | product-market-prices.js | |
| `/api/product-list-insights.php` | GET | product-list-insights.js | |
| `/api/product-organization.php` (`action=categories`) | GET, POST JSON | product-organization.js | |
| `/api/directory-search.php` | GET | directory-picker.js | `data-directory-endpoint` |
| `/api/catalog-search.php` (`action=products`) | GET | catalog-search.js | 12 sn zaman aşımı |
| `/api/product-platforms.php` | GET/POST (tahmin: modal verisi) | product-platforms.js | |
| `/api/product-entry.php` (`action=options`, `variant`) | GET; POST FormData | product-entry-wizard.js | 45 sn kayıt zaman aşımı |
| `/api/barcode-count.php` (`action=options`) | GET, POST | barcode-count.js | |
| `/api/marketplace-stop.php` (`preview`, `execute`, `status`) | POST JSON | marketplace-stop.js | |
| `/api/external-tracking.php` (`context`, `save`, `verify`, `step`, `confirm_all`) | GET/POST | external-tracking.js | |
| `/api/shopify-bank-import.php` (`scan`, `upload`, `apply`, `status`) | POST (JSON/multipart) | bank-import.js | En fazla 5 MB CSV, 90 sn zaman aşımı |
| `/api/invoices.php` (`state`, `issue`, `recipient`, `send`, `order`, `orders`, `prepare_order`, `product`, `create_order_draft`, `return_context`, `return_create`, `return_cancel_context`, `return_cancel`, `mail_settings`, `save_mail`, `test_mail`, `edit_context`, `edit_save`, `marketplace_*`, `order_pipeline_states`, …) | GET, POST JSON | invoice-workflow.js, invoice-edit.js, invoice-marketplace.js, invoice-order-pipeline.js, packing-workflow.js | Tek uç, çok eylem; 35 sn (marketplace POST 75 sn) |
| `/api/wholesale-sales.php` (`state`, `save_customer`, `products`, `save`, `finalize`, `cancel`, `create`, `records`, `export`, `print`) | GET (`state`), POST JSON | wholesale-sales.js | Sayfa takılı kaldı (bkz. 04) |
| `/api/dhl-labels.php` (`context`, `create`, `preview`, `dispatch`, `dispatch_health`, `label_states`, `orders`, `otto_handover`, `reconcile`, `record_result`, `replacement_*`, `return_*`, `reprint_output`, `settings`, `status`, `test`, `address_save`, `prepare`) | GET, POST JSON | dhl-labels.js, dhl-recreate.js, dhl-recreate-batch.js, order-customer-edit.js (adres) | `cfg.endpoint` = `WawiDhlConfig.endpoint` |
| `/api/physical-stock-sync.php` | GET | physical-stock-sync.js | 12 sn zaman aşımı, 5 sn/10 sn yoklama |
| `/api/jtl-products.php` | GET (+ POST tahmin) | app.js | JTL ürün havuzu ve stok sayıları |
| `/api/connector-test.php?connector=&company=&channel=` | GET | app.js | Bağlantı testi |
| `/api/kaufland-orders.php?limit=` | POST | app.js | `channel_id`, `limit`, `csrf` gövdede |
| `/api/ebay-orders.php?limit=` | POST (başlat), GET (durum) | app.js | Durum 15 sn'de bir yoklanır (kuyruk/çalışıyor/yeniden denenebilir) |
| `/api/accounting-orders.php` | POST | app.js | Gövde: `channel_ids`, `limit`, `csrf`; en fazla 50 kanal |
| `?page=overview-orders&period=` | GET | overview-workspace.js | Sayfa yolu |
| `?page=warehouse-product`, `?page=metro…` | GET (bağlantı) | erp.js, stock-comparison.js | Sayfa içi gezinme |
| `/assets/vendor/pdf-lib.min.js`, `/assets/dhl-print.html` | GET (statik) | dhl-labels.js, packing-workflow.js | PDF birleştirme ve yazdırma görünümü |
| Klasik form POST `?page=<sayfa>` + `erp_action` | POST | erp.js, physical-stock-sync.js (formları dinler) | physical-stock-sync'te görülen `erp_action` değerleri: add_stock, bulk_update_inventory, distribute_stock, dropship_stock, quick_update_inventory, return_product, save_stock_pack_rule, update_product |

Ek: `/allordersfilter` uç adresi bu dosyalarda bulunmadı. `/api/company-applications.php` kapsam dışı. Harici adresler yalnız bağlantı olarak: ebay.de, idealo.de, kaufland.de, metro.de, otto.de, n11.com, ozon.ru, dhl.de takip, app.billbee.io.

## Durum ve depolama

**Yoklama / yenileme aralıkları**

| Aralık | Dosya | Ne |
|---|---|---|
| 120 sn (`setInterval`) | menu-counts.js | menü sayaçları; hata durumunda 5/15/30 sn yeniden dene |
| 60 sn | order-worklist-counts.js | iş listesi sayaçları; hata sonrası 5/15/30 sn; 5 dk sonra veriyi düşürür |
| 120 sn (yalnız sekme görünürken) | operational-notes.js | not sayacı |
| 60 sn | dhl-labels.js | durum rozetleri (`refreshBadges`) |
| 300 sn (+ ilk 3 sn) | dhl-labels.js | `dispatchHealth` |
| 5 sn, sonra 10 sn | physical-stock-sync.js | stok senkron ilerlemesi |
| 15 sn | app.js | eBay sipariş çekme işi durumu |
| 5 sn | invoice-marketplace.js | pazaryeri fatura durumu |
| `visibilitychange` + `BroadcastChannel('wawi-return-counts')` | returns-menu.js | sekme görünür olunca ve başka sekme iade kaydedince yenile |
| Özel olaylar | genel | `wawi-order-changed`, `wawi:menu-counts-refresh`, `wawi-dhl-state` sayaç yenilemesini tetikler |
| İstek zaman aşımları | tüm dosyalar | 12–35 sn tipik; DHL/etiket/PDF 65–95 sn |

**Depolama anahtarları** (çerez okuma/yazma yok; `localStorage` yalnız bir yerde)

| Depo | Anahtar | Dosya | İçerik |
|---|---|---|---|
| sessionStorage | `wawi-physical-stock-progress-v1` | physical-stock-sync.js | ilerleme işareti |
| sessionStorage | `wawi-dhl-recreate-batch-v1:<kapsam>` | dhl-recreate-batch.js | toplu etiket oturum günlüğü |
| sessionStorage | `wawi-wholesale:<taslak kapsamı>:<satış id veya new>` | wholesale-sales.js | taslak kurtarma |
| sessionStorage | `wawierp.product-entry-draft.v1` | erp.js | ürün giriş taslağı |
| sessionStorage | anahtar sayfadan gelir (`data-position-key`) | sidebar-position.js | kenar menü açık/kapalı grupları |
| localStorage | `wawi-dhl-recreate-warning-v1:<kapsam>` | dhl-recreate.js | uyarıyı atlama tercihi (`skip`) |

**Diğer durum:** bellekte `Map`/değişkenler (kartlar, etiket durumları); işlem tekrarı için `crypto.getRandomValues` ile 16 baytlık idempotency anahtarı üretilir (barcode-count, packing-workflow, invoice-edit, operational-notes, wholesale-sales, invoice-workflow, product-entry-wizard, erp). İstek zaman aşımında "otomatik tekrar yapılmadı; durumu kontrol edin" yaklaşımı birçok dosyada (invoice-*, dhl-*, bank-import, packing-workflow).

**CSRF:** 19 dosyada `csrf` gövde alanı ya da `data-csrf`; değeri sayfa HTML'inden alır. Değerler bu belgeye yazılmadı.

**Olaylar (CustomEvent):** `wawi-order-changed`, `wawi-order-selection`, `wawi-bulk-state`, `wawi-dhl-state`, `dhl-account-changed`, `wawi-dhl-recreate-preference`, `invoice-edited`, `wawi:customer-address-saved`, `wawi:menu-counts-refresh`, `wawi:returns-saved`, `wawierp:open-count-camera`, `wawierp:barcode-scanned`, `product-picker:selected`.

**Genel nesneler (window):** `WawiLocale`, `WawiI18n`, `WawiOrderCustomer`, `WawiDhlConfig`, `WawiStockComparison`, `WawiCatalogLabel`, `WawiProductActions`, `WawiInvoiceMarketplace`, `WawiMarketplaceStop`, `WawiDhlRecreate`, `WawiOrderSelection`, `WawiDhlBatch` (+ Cloudflare `__cfBeacon`).

## Çoklu dil

1. **Sunucu sözlüğü:** sayfa `window.WawiLocale = {lang, dictionary}` verir (sayfada `tr`; sözlük bu sayfada 32 girdi). `ui-i18n.js` (21 satır) `WawiI18n.t(metin)` sağlar: yalnız `lang === 'de'` iken verilen sözlükten birebir metin çevirir; açıklaması "Explicit UI-literal translation. No DOM-wide replacement of business data". Ek sözlük dosyası: `ui-dictionary-de-entry-pack-options-20261015.js`.
2. **`wawiText`:** `app.js`, `barcode-count.js`, `directory-picker.js`, `sidebar-search.js` dosyalarının başına yapıştırılan `var wawiText = globalThis.WawiI18n?.t || (text => text)`; 11 dosya `wawiText("Türkçe metin")` çağırır (yapı: Türkçe kaynak metin anahtar). Bu satırın dosyaya otomatik eklenmesi bir yapı adımına işaret ediyor (tahmin).
3. **Satır içi `t(tr, de)`:** 13 dosya (bank-import, marketplace-stop, mobile-*, operational-notes, external-tracking, filter-buttons, order-customer-info/edit, product-organization, topbar-sections, invoice-workflow, catalog-labels) `document.documentElement.lang` değerine bakıp iki dilli metni kendi içinde seçer.
4. **Dosya içi Almanca sözlükler:** `invoice-marketplace.js` ve `invoice-order-pipeline.js` içinde sunucu hata/durum kodlarının (`provider_http_404`, `queued`, `checking`…) Almanca karşılıkları sabit; Türkçe metin sunucudan (`s.message`) geliyor.
5. **Kategori sözlüğü:** `catalog-labels.js` (58 KB) PHP betiğiyle üretilmiş TR↔DE kategori eşlemesi.
6. **Hiç çeviri kodu olmayan dosyalar:** menu-counts, order-worklist-counts, physical-stock-sync, returns-menu, sidebar-position (içerik sunucudan ya da çevrilecek metin yok).
7. Dil seçimi `lang` sorgu parametresi (`&lang=tr`) ve `<html lang>` ile; yalnız TR ve DE var.

## Tekrarlanan desenler

- **`request`/`api` sarmalayıcısı** her özellik dosyasında yeniden yazılmış: `AbortController` + `setTimeout` + `fetch(... credentials:'same-origin', cache:'no-store')` + "yanıt JSON değilse oturumu kontrol edin" + `success` bayrağı + `AbortError` mesajı. 25 dosya `AbortController` kullanıyor, 28 dosya `credentials:'same-origin'`; aynı "content-type JSON mu" denetimi 6 dosyada kelimesi kelimesine var (invoice-marketplace, dhl-recreate, dhl-recreate-batch, invoice-edit, invoice-workflow, dhl-labels). Ortak bir `http` yardımcısı yok.
- **Bir uç, çok eylem + `data-endpoint`:** sunucu HTML'e uç adresini koyar, JS'te `action` ile ayrışır (`invoices.php`, `dhl-labels.php`, `wholesale-sales.php`).
- **Modal/dialog kabuğu** (`<dialog>` + `showModal`, çift kapama, "busy" kilidi, "bozulmamış taslak" uyarısı) invoice-*, dhl-*, wholesale-sales, operational-notes, marketplace-stop, product-market-prices, product-list-insights, bank-import'ta ayrı ayrı yazılmış.
- **DHL üçlüsü:** `dhl-labels` (955 satır), `dhl-recreate` ve `dhl-recreate-batch` aynı etiket yeniden oluşturma akışını tekil/toplu olarak kopyalıyor.
- **Fatura üçlüsü + paketleme:** `invoice-workflow`, `invoice-edit`, `invoice-marketplace`, `invoice-order-pipeline`, `packing-workflow` aynı `request` kalıbını, aynı idempotency-anahtarı ve aynı Almanca hata sözlüğünü paylaşmadan ayrı barındırıyor.
- **Sayaçlar:** `menu-counts`, `order-worklist-counts`, `product-pool-count`, `returns-menu`, `operational-notes` (sayaç) beş ayrı yoklama döngüsü; farklı aralık (60/120 sn) ve farklı hata geri çekilmeleri.
- **Mobil sunum:** mobile-workspace ve mobile-list-workspace yalnız görünüm; `filter-buttons` ve `topbar-sections` "mevcut formlara dokunmadan" üstten bağlanan görsel katman.
- **Açık güvenlik/iş kuralı yorumları:** "Never replay a submitted carrier request", "Read-only filter presentation", "permission-filtered navigation" gibi niyet yorumları var; kod disiplini iyi, ama ortak kütüphane yok.
- **DOM yazımı:** 53 satırda `innerHTML`/`eval`/`new Function` sorgusu eşleşti (ayrıntı incelenmedi: `app.js` 2, `dhl-labels.js` 12, `erp.js` 6 `innerHTML`); `app.js` içinde `escapeHtml` yardımcısı var. Sürüm aksamlarını kontrol etmek gerekir (tahmin: çoğu kaçışlı).

## Sorunlar ve yeniden tasarım notları

1. **Hepsi her sayfada:** 43 betik ≈ 857 KB (sıkıştırılmamış) her sayfada yükleniyor; bölümlere ayırma/yalnız gereken modülü yükleme yok. Toptan satış, DHL, fatura kodu genel bakışta bile iniyor.
2. **Çift ve gereksiz istekler:** ağ günlüğünde `menu-counts.php` aynı sayfada 3–4 kez, `product-pool-count.php` 2 kez ve `warehouse-messages.php` birkaç kez çağrılmış; birçoğu `ERR_ABORTED`. Bu, birden fazla betiğin aynı sayacı bağımsız çekmesinden ve gezinme sırasında iptallerden geliyor (tahmin). Sayaçlar tek bir uçta ve tek bir döngüde toplanmalı.
3. **Ortak HTTP/i18n/modal katmanı yok:** aynı `request` kodu ≥ 12 kez kopya; hata iletileri bazen Türkçe sabit, bazen Almanca sözlükte. Yeniden tasarımda tek `api()` istemcisi (zaman aşımı, JSON denetimi, idempotency, CSRF), tek çeviri katmanı (anahtar tabanlı) ve ortak diyalog bileşeni.
4. **Üç farklı çeviri yöntemi** (sunucu sözlüğü, satır içi `t(tr,de)`, dosya içi sözlük) ve Türkçe cümlenin anahtar olarak kullanılması: metin değişince Almanca sessizce düşer; DE eksikliği izlenemez.
5. **Sayfa durumu sessionStorage'a dağınık:** 5 farklı anahtar adlandırma şeması (`wawi-…-v1`, `wawierp.…`, `wawi-wholesale:…`); sürüm eki yalnız bazılarında.
6. **Sabit kodlanmış kimlikler:** kanal kimlikleri `10272 | 4 | 10281` (Shopify pool referansları, `dhl-labels.js` ve `order-customer-edit.js`), `10281` (Shopify kanalı), depo `2882` (Technowelt Almanya; `dhl-labels.js` iki yerde), `channel_id === 0` (product-market-prices). Bunlar canlı veriye bağlı; yeni kanal/depo eklenince kod değişmek zorunda.
7. **Sabit sağlayıcı bilgisi:** Billbee adresi (`app.billbee.io/app_v2/`), DHL takip adresi ve pazaryeri arama adresleri JS'e gömülü; örnek e-posta yer tutucusu (`ornek@firma.com`) `wholesale-sales.js` içinde.
8. **Gizli anahtar / token:** sabit kodlanmış gizli değer bulunmadı. Şifre alanları yalnız form kodunda (SMTP parolası `invoice-workflow.js`; parolayı göster düğmesi var). CSRF değeri sayfa HTML'inden gelir. Kimlik bilgisi içerebilecek `data-*` değerleri bu belgeye yazılmadı.
9. **Tek dosyada çok iş:** `erp.js` (2.981 satır), `app.js`, `dhl-labels.js` bakımı zor; erp.js hem form, hem arama, hem dağıtım, hem satın alma satırlarını içeriyor.
10. **Hata yüzeyi:** genel bakış kartları ("Satış özeti yüklenemedi", "Ürün sıralaması yüklenemedi") bu dosyalardaki 25–30 sn zaman aşımlarına bağlı (overview-workspace 25 sn, bestsellers 30 sn); kullanıcı bekleme sonunda hata görüyor. `wholesale-sales` durum çağrısı zaman aşımı olmadan askıda kalıyor gibi (bkz. 04; bu dosyada zaman aşımı bulunmadı — tahmin).
11. **Oturum durumu:** `session-status.php` yoklaması dosyalarda bulunamadı; satır içi betikte olduğu tahmin ediliyor.
12. Yeniden tasarım önerileri: modüler yükleme (sayfa başına paket), TypeScript/ES modülleri, tek veri katmanı (sayaçlar için SSE veya tek uç), merkezi çeviri anahtarları + eksik anahtar raporu, kimlikleri sunucudan `data-*` ile verme, mobil için ayrı değil duyarlı bileşenler.
