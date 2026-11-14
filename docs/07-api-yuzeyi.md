# WawiERP — Ön Yüz ve API Yüzeyi (statik analiz)

Tarih: 2026-11-14 · Kaynak: `https://wawib2b.com/assets/js/*.js` (41 dosya) + `/assets/returns-menu.js`, `curl` ile tek tek (arada 2 sn) bir scratchpad dizinine indirildi; **çalıştırılmadı, hiçbir uç çağrılmadı**. Uç adresleri JS'te değil sayfa HTML'indeki `data-*` niteliklerinde olduğundan, bu belge `05-on-yuz-mimarisi.md` içindeki DOM kaynaklı uç listesini JS'ten çıkan eylem adlarıyla birleştirir. Yöntem/okuma-yazma sınıfı eylem adından çıkarımdır; kaynak kod gelince doğrulanmalı. `/assets/*.css` indirilmedi (API yüzeyine katkısı yok; mobil/CSS notu `docs/05-bilgi-mimarisi.md` için bekliyor).

> Not: JS'te `method:'POST'` 12 yerde geçiyor; geri kalan `fetch` çağrıları GET.

## 1. İstek biçimi (ortak)
| Konu | Gözlem (JS'ten) | İşaret |
|---|---|---|
| Taşıma | `fetch`, `credentials:'same-origin'`, `cache:'no-store'`, JSON; yükleme uçları `FormData` (multipart) | görüldü |
| Uç adresi | sayfa HTML'inde `data-endpoint` (21 kullanım), `data-url` (10), `data-counts-endpoint`, `data-summary-url`, `data-directory-endpoint`, `data-search-endpoint`, `data-count-endpoint`, `data-product-url`, `data-finance-url` | görüldü |
| Gövde | `{action, csrf, warehouse?, …, idempotency_key?}`; GET'te `?action=…` | görüldü |
| Çıktı | `{success: bool, message, …}`; JSON değilse "oturumu kontrol edin" | görüldü |
| İzleme | yanıt başlığı `X-Request-ID` yalnız `dhl-labels.js` içinde okunuyor, hata ekranında "izleme kodu" olarak gösteriliyor | görüldü |
| Kimlik doğrulama | çerez oturumu (`same-origin`); ayrı Bearer/anahtar yok; oturum bitince HTML giriş sayfası dönüyor (`?session=expired`) | görüldü/çıkarım |
| CSRF | gövde alanı `csrf` (ya da `data-csrf`); değer sayfa HTML'inden (`workspace.dataset.csrf` ya da `[name=csrf]`) okunuyor; başlıkla (X-CSRF) gönderim yok | görüldü |
| Tekrar güvenliği | `crypto.getRandomValues` ile 16 bayt idempotency anahtarı (8 dosya); zaman aşımında "otomatik tekrar yok, durumu kontrol edin" | görüldü |
| Zaman aşımı | 8 sn (arama) · 12–15 sn (sayaç/okuma) · 25–30 sn (genel bakış) · 35 sn (fatura) · 45 sn (ürün kaydı) · 75 sn (pazaryeri fatura POST) · 90 sn (banka CSV) · 65–95 sn (DHL/PDF) | görüldü |
| Hata işleme | `AbortError` → "zaman aşımı" iletisi; sayaçlarda 5/15/30 sn geri çekilme; liste ve kartlarda zaman aşımı sonrası sade hata | görüldü |

## 2. Uç envanteri ve gruplama

Sınıf: **R** salt okuma · **W** yazma/dış yan etki · **R/W** karışık (eyleme göre). Sınıf, eylem adından; kesin değil.

### 2.1 Sayaç ve durum (okuma)
| Uç | Eylem/parametre | Sınıf | Kullanan | Not |
|---|---|---|---|---|
| `/api/menu-counts.php` | `?view=worklists&warehouse=` | R | menu-counts, order-worklist-counts | 120 sn / 60 sn yoklama |
| `/api/product-pool-count.php` | `warehouse`, `group=physical` | R | product-pool-count | |
| `/api/returns.php` | `action=counts` | R | returns-menu | olay + BroadcastChannel |
| `/api/operational-notes.php` | `count`, `list`, `badges`, `file` (yükleme), not kaydı | R/W | operational-notes | görünür sekmede 120 sn |
| `/api/session-status.php` | — | R | çağıran JS bulunamadı (CSP satır içi betiği yasakladığı için başka bir dış dosyada olmalı) | her sayfada çağrılıyor |
| `/api/warehouse-messages.php` | — | R | çağıran bulunamadı (indirilen 41 dosyada yok) | birden çok kez |
| `/api/physical-stock-sync.php` | — | R | physical-stock-sync | 5→10 sn yoklama |
| `/api/jtl-products.php` | — | R (POST tahmin) | app.js | |
| `/api/connector-test.php` | `connector, company, channel` | R (dış bağlantı denemesi) | app.js | |

### 2.2 Arama ve referans veri (okuma)
`/api/catalog-search.php` (`action=products`, 12 sn) · `/api/directory-search.php` · `/api/product-market-prices.php` · `/api/product-list-insights.php` · `/api/product-platforms.php` · `/api/product-organization.php` (`action=categories`; kategori ekleme POST olabilir → R/W) · `/api/barcode-count.php` (`options` R; sayım kaydı W) · `/api/product-entry.php` (`options`, `variant` R; kayıt W, 45 sn).

### 2.3 Sipariş çekme / eşitleme (dış sisteme çıkar → W)
| Uç | Yöntem | Not |
|---|---|---|
| `/api/ebay-orders.php?limit=` | POST başlat, GET durum (15 sn yoklama) | işi kuyruğa alır |
| `/api/kaufland-orders.php?limit=` | POST | gövde `channel_id`, `limit` |
| `/api/accounting-orders.php` | POST | `channel_ids` en fazla 50 |
| `data-action`: `fetch-ebay-orders`, `fetch-kaufland-orders`, `sync-accounting-orders` | düğmeler | yukarıdakileri tetikler |
| `?page=overview-orders&period=` | GET | satış özeti (sayfa yolu) |

### 2.4 Fatura ailesi — `/api/invoices.php` (tek uç, çok eylem; R/W)
Eylemler (JS'ten): `state` R · `order`, `orders`, `order_pipeline_states`, `product`, `return_context`, `return_cancel_context`, `edit_context`, `mail_settings`, `marketplace_state`, `marketplace_overview` R (tahmin) · `issue`, `recipient`, `send`, `prepare_order`, `invoice_order`, `create_order_draft`, `return_create`, `return_cancel`, `edit_save`, `save_mail`, `test_mail`, `marketplace_enqueue`, `marketplace_step`, `marketplace_tax` W (tahmin). Aynı uç: invoice-workflow, invoice-edit, invoice-marketplace (5 sn yoklama), invoice-order-pipeline, packing-workflow (`pdf`, `packing_pdf`, `packing_selection`, `external_pdf`, `send`, `state`, `prepare_order`).

### 2.5 Toptan satış — `/api/wholesale-sales.php`
`state` R · `records`, `products` R (tahmin) · `save_customer`, `save`, `create`, `finalize`, `cancel` W. Durum çağrısında zaman aşımı yok → sayfa takılıyor (bkz. `docs/panel/04`).

### 2.6 DHL / kargo — `/api/dhl-labels.php` (+ dhl-recreate*, order-customer-edit)
R: `context`, `status`, `label_states`, `orders`, `dispatch_health`, `return_context`, `return_locations`, `return_receiver`, `return_recreate_status`, `replacement_preview`, `return_recreate_preview`, `recreate_context`, `recreate_preview`, `address_context`, `preview`.
W (dış taşıyıcıda etiket → ücretli/geri alınamaz): `create`, `dispatch`, `otto_handover`, `reconcile`, `record_result`, `replacement_create`, `return_otto_prepare`, `return_recreate_create`, `recreate_create`, `address_save`, `return_address_save`, `settings`, `test`, `prepare`, `return_client_event`, `reprint_output`/`return_output`/`recreate_output` (PDF çıktısı, R). Kodda "tekrar gönderme yok / otomatik tekrar yok" disiplini var.
Harici takip: `/api/external-tracking.php` — `context` R · `save`, `verify`, `step`, `confirm_all` W.

### 2.7 Pazaryeri / banka
`/api/marketplace-stop.php` — `preview` R · `execute` W (acil satıştan kaldırma) · `status` R. `/api/shopify-bank-import.php` — `scan`, `status` R · `upload`, `apply` W (≤5 MB CSV, 90 sn).

### 2.8 Klasik form yolu — `POST ?page=<sayfa>` + `erp_action`
`erp.js` ve `physical-stock-sync.js` formları dinler. Belgelerde (docs/panel/01–04) görülen değerler: `add_warehouse`, `queue_warehouse_sync`, `pull_branch_stock`, `toggle_sales_stock_sync`, `sync_sales_listings`, `update_product`, `bulk_update_inventory`, `quick_update_inventory`, `add_stock`, `distribute_stock`, `preview_stock_distribution`, `dropship_stock`, `return_product`, `save_stock_pack_rule`, `bulk_products_preview`, `archive_catalog`, `save_category_visibility`, `shipment_create`, `add_outbound_document`, `attach_purchase_document`, `master_reauthenticate`, `logout`. Ek: muhasebe dışa aktarma `export=csv|excel|datev` (erp_action değil). Birleştirme/PIN gerektiren ve `pin-permissions` altındaki değerler görülemedi.

**Yazma yolu sayısı = 2** (form `erp_action` ve JSON `/api/*.php`); ortak CSRF/idempotency/denetim kaydı kuralı her ikisinde aynı mı bilinmiyor.

## 3. Yeniden tasarım için gruplama (öneri, karar değil)
| Hedef API grubu | Bugünkü uçlar |
|---|---|
| Sayaç/oturum (tek `GET /summary`, SSE olabilir) | menu-counts, product-pool-count, returns counts, notes count, session-status, warehouse-messages, order-worklist-counts |
| Katalog/ürün | catalog-search, product-entry, product-organization, product-platforms, product-market-prices, product-list-insights, `update_product`, `bulk_*`, `archive_catalog` |
| Stok | `add_stock`, `distribute_stock`, `physical-stock-sync`, `barcode-count`, `pull_branch_stock`, `toggle_sales_stock_sync` |
| Sipariş ve kanal | ebay/kaufland/accounting-orders, connector-test, jtl-products, marketplace-stop, `sync_sales_listings` |
| Fatura/belge | invoices.php (tüm eylemler), wholesale-sales, `add_outbound_document`, `attach_purchase_document`, shopify-bank-import |
| Kargo | dhl-labels, external-tracking, `shipment_create` |
| Kimlik/yönetim | `master_reauthenticate`, `logout`, directory-search, PIN uçları (görülemedi) |
Önerilen ortak kurallar: tek istemci (zaman aşımı, JSON denetimi, CSRF, idempotency), tek hata biçimi (`code`, `message`, `request_id` — bugün yalnız DHL'de var), her yazma için denetim kaydı, okuma uçlarında sayfalama + önbellek, bağlam (şirket/depo/kanal) rota parametresi.

## 4. Gözlemler
- Tek-uç-çok-eylem (`invoices.php`, `dhl-labels.php`): ≈35 ve ≈40 eylem; bakım ve yetkilendirme (eylem başına rol) zor.
- CSRF yalnız gövde alanı; kanıt yok ama idempotency anahtarı yalnız bazı uçlarda (8 dosya).
- `X-Request-ID` izleme yalnız DHL'de; diğer uçlarda hata kaynağı izlenemiyor.
- Oturum bitince uçlar JSON yerine HTML giriş sayfası döndürüyor; istemci bunu "JSON değil" diye yakalıyor (kırılgan sözleşme).
- `innerHTML` kullanımı: dhl-labels 12, wholesale-sales 13, dhl-recreate 6, dhl-recreate-batch 5, erp 6, order-customer-edit 5 satır — kaçışın (escapeHtml) her birinde uygulandığı doğrulanmadı (bkz. 09 güvenlik).

## 5. Görülemeyenler / Sınırlar
- Uç yöntemleri ve R/W sınıfı eylem adından çıkarımdır; sunucu tarafı yetki (eylem başına rol) bilinmiyor.
- `data-endpoint` değerleri yalnız `05` içinde kayıtlı olanlar; oturum bittiği için bu turda DOM'dan yeniden taranmadı. `/allordersfilter` adresi JS'te yok (sunucu yönlendirmesi veya satır içi betik).
- `session-status.php`, `warehouse-messages.php` çağıranı indirilen 41 dosyada yok; CSP `script-src 'self'` olduğundan satır içi betik olamaz, başka bir dış dosya olmalı.
- PIN/`pin-permissions` `erp_action` değerleri, birleştirme eylemi görülemedi.
- CSS dosyaları ve `catalog-labels.js` içeriği (üretilmiş sözlük) incelenmedi.
- Hiçbir uç çağrılmadı; parametre doğrulaması, hız sınırı, hata gövdeleri bilinmiyor.
