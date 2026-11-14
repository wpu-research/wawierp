# WawiERP Panel — Keşif Haritası

Tarih: 2026-11-14 · Kaynak: giriş sonrası `/?page=overview` (sistem yöneticisi oturumu, canlı veri). Yalnız okuma.

## Genel bakış ekranındaki sayılar
| Depo | Kod | Ülke | Şirket | Ürün | Fiziki adet | Drop adet |
|---|---|---|---|---|---|---|
| Istanbul Warehouse | MAIN | Türkiye | 2 | 8.985 | 13.797 | 0 |
| Almanya Warehouse | DE-WH | Almanya | 7 | 122.934 | 254.160 | 1.801.761 |
| Hollanda Warehouse | NL-WH | Hollanda | 3 | 7.926 | 12.684 | 0 |
| Mega B | DE-MEGA-B | Almanya | 1 | 6.651 | 13.300 | 0 |
| Technowelt Almanya | DE-TECHNOWELT | Almanya | 1 | 4.579 | 436 | 0 |

- Wawi ürün havuzu (tekil katalog): **232.525** ürün
- Şirket: **12** — DOCSER, İthal Koku, Ivobuyshop, Kaufplus, Lady Empire GmbH (13 kanal), Novada Shops (7), Perasshop, Stockist24, Woida (8), Parfumkoopjes BV, Elec_texx (0), Technowelt (3)
- Pazaryeri hesabı: **22** — eBay ×8, Kaufland ×6, Amazon ×3, METRO ×2, OTTO, Dealclub, Trendyol, N11, Ozon
- Satış platformu: **19** — Shopify ×9, webshop ×7, JTL-Shop, JTL-Wawi, XML-Import, storefront
- Açık ticket: 450 · iade kaydı: 79
- Gözlenen sorun: genel bakışta "Satış özeti yüklenemedi", "Ürün sıralaması yüklenemedi", depo kartlarında "Güncelleme tamamlanamadı"

## Teknik
- Tek giriş noktası: `/?page=<ad>&…` (54 farklı `page` değeri); yazma işlemleri aynı sayfaya `POST` + `csrf` + `erp_action` alanı
- Ayrı uçlar: `/api/*.php` (ör. `/api/unmatched-products-download.php`, `/api/company-applications.php`), `/allordersfilter`
- Ön yüz: 42 ayrı düz JS dosyası (`/assets/js/*.js`), çerçeve yok
- Kimlik: e-posta+şifre ya da PIN; rol "Sistem yöneticisi"
- Dil: TR / DE

## Sayfa türleri (page değeri · örnek adres · menü etiketi)
### Sipariş, kargo, iade, destek
- `orders-pool` · `/?page=orders-pool&order_source=all&order_date_range=all&order_status=all&order_inbox=0&order_dispatch=unshipped&order_sort=date_desc&pool_warehouse=0` · birleşik sipariş havuzu (filtreler: order_source, order_date_range, order_status, order_inbox, order_dispatch, order_supply[], order_sort, pool_warehouse, order_channel)
- `asterbuy-orders` · `/?page=asterbuy-orders`
- `problem-orders` · `/?page=problem-orders` , `&status=resolved`
- `/allordersfilter`
- `orders-ebay` · `/?page=orders-ebay&order_channel=5075`
- `orders-kaufland` · `/?page=orders-kaufland&order_channel=5332`
- `shipments` · `/?page=shipments&warehouse=1`
- `shipping` · `/?page=shipping&warehouse=1#dhl-center` , `&manual=1#dhl-manual-panel`
- `returns` · `/?page=returns&view=all` (view: labels, received, paid, unpaid, waiting_product, resent, issues, resolved)
- `warehouse-orders` · `/?page=warehouse-orders&warehouse=1&view=customers`
- `order-summary` · `/?page=order-summary&view=cards`
- `tickets` · `/?page=tickets`

### Ürün, katalog, stok, satın alma
- `warehouses` · `/?page=warehouses&warehouse_page_size=50`
- `warehouse-home` · `/?page=warehouse-home&warehouse=1&workspace=1`
- `warehouse` · `/?page=warehouse&warehouse=1` (product_view: recent, physical_low, physical_missing_ean, physical_rejected, physical_unknown, physical_available, drop_asterbuy, drop_b2buhren, drop_watchimport, active_ebay, active_kaufland, active_metro, active_shopify; mode=stock; stock=physical_alert|physical_uncounted|physical_depleted)
- `stock-movements` · `/?page=stock-movements&warehouse=1`
- `stock-transfer` · `/?page=stock-transfer&warehouse=1`
- `problem-products` · `/?page=problem-products`
- `duplicate-products` · `/?page=duplicate-products&warehouse=1`
- `catalog-governance` · `/?page=catalog-governance&warehouse=1`
- `physical-stock-check` · `/?page=physical-stock-check`
- `critical-physical-stock` · `/?page=critical-physical-stock`
- `pool` · `/?page=pool`
- `products` · `/?page=products`
- `bulk-products` · `/?page=bulk-products&warehouse=1`
- `bulk-prices` · `/?page=bulk-prices&warehouse=1`
- `missing-product-images` · `/?page=missing-product-images&image_scope=all&filters=1&warehouse=1`
- `missing-product-eans` · `/?page=missing-product-eans&company=1196&warehouse=2&channel=5075`
- `purchases` · `/?page=purchases&warehouse=1`
- `dropshipping` · `/?page=dropshipping&provider=asterbuy`

### Satış kanalları
- `company-home` · `/?page=company-home&company=1&warehouse=2&channel=7&view=orders` , `&view=products` ; OTTO: `/?page=company-home&company=2291&warehouse=2882&channel=10283&account=30&view=products&otto_tab=products` (otto_tab: orders, products, source, issues, images, eans, returns, history) ; Amazon: `/?page=company-home&company=1196&warehouse=2&channel=10282&view=products&amazon_tab=products` (amazon_tab: orders, products, source, issues, history)
- `ebay-pool` · `/?page=ebay-pool`
- `send-ebay` · `/?page=send-ebay&company=1196&catalog=ebay` , `&catalog=products`
- `send-kaufland` · `/?page=send-kaufland&company=1196&warehouse=2&channel=5332&account=26&catalog=kaufland` (catalog: products, issues)
- `metro` · `/?page=metro&view=orders&account=25` (view: pool, send, failed)
- `shopify-pool` · `/?page=shopify-pool&company=1196&warehouse=2&channel=10281&account=28`
- `send-shopify` · `/?page=send-shopify&company=1196&warehouse=2&channel=10281&account=28`
- `ozon-pool` · `/?page=ozon-pool&company=2269&warehouse=1&channel=10266&account=11`
- `send-ozon` · `/?page=send-ozon&company=2269&warehouse=1&channel=10266&account=11`
- `tr-market` · `/?page=tr-market&tab=orders` , `&platform=n11&tab=orders`
- `tr-market-products` · `/?page=tr-market-products`
- `channel-worklist` · `/?page=channel-worklist&company=1196&warehouse=2&channel=5075&account=0&kind=issues` (kind: images, history)
- `mixoutlet-payments` · `/?page=mixoutlet-payments&company=1&warehouse=2&channel=10272&account=18`

### Finans ve yönetim
- `customers-master` · `/?page=customers-master`
- `invoices` · `/?page=invoices&view=orders&warehouse=1`
- `accounting` · `/?page=accounting`
- `finance-documents` · `/?page=finance-documents&warehouse=1`
- `team` · `/?page=team`
- `pin-permissions` · `/?page=pin-permissions`
- `erp-features` · `/?page=erp-features&warehouse=1`
- `audit-logs` · `/?page=audit-logs`
- `/api/company-applications.php?lang=tr`

## Ön yüz JS dosyaları (`https://wawib2b.com/assets/js/<ad>`)
ui-i18n, physical-stock-sync, stock-comparison, product-market-prices, catalog-labels, product-organization, product-list-insights, product-detail-actions, order-customer-info, order-customer-edit, order-worklist-counts, product-pool-count, menu-counts, sidebar-position, product-bestsellers, overview-workspace, operational-notes, marketplace-stop, app, sidebar-search, catalog-search, product-platforms, erp, product-entry-wizard, barcode-count, directory-picker, dhl-recreate, dhl-recreate-batch, dhl-labels, external-tracking, invoice-marketplace, invoice-order-pipeline, invoice-workflow, packing-workflow, invoice-edit, filter-buttons, topbar-sections, bank-import, mobile-workspace, mobile-list-workspace (+ `/assets/returns-menu.js`)
