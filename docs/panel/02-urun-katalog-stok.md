# WawiERP Panel — Ürün, Katalog, Stok, Satın Alma Alanı

Tarih: 2026-11-14 · Kaynak: canlı panel (https://wawib2b.com), sistem yöneticisi oturumu, yalnız okuma. Her sayfa tek tek GET ile açıldı; hiçbir düğmeye basılmadı, form gönderilmedi. Yalnız görülenler yazıldı; tahminler "tahmin" diye işaretli. Müşteri kişisel verisi, PIN, token yazılmadı.

## Özet

- **Tek katalog, çok depo kartı.** Merkez katalog (`catalog-governance` ve `products` sayfalarında) **232.526** ürün kartı. Bunlardan **151.075'inin depo kaydı** var; "bilinen stok" 294.377 adet, "satış eşleşmesi" 347.860. Listelerde alt satır: "Aynı ürün kaydı havuzda bir kez gösterilir". Yani ürün kartı ortak, **fiyat ve stok depo bazında** (`warehouse_id` + `product_key`).
- **Fiziki ve drop stok iki ayrı alan.** Formlarda her yerde `physical_stock` ve `dropship_stock` ayrı; toplu içe aktarmada "Toplam stok bu iki alanın toplamıdır" yazıyor. Sanal stok (`Sanal stok açık / Sanal stoğu kapat`) üçüncü bir kavram, pazaryeri adedini etkiliyor; fiziki sayım ve drop stoğu değiştirmiyor. Ayrıca "Depo EAN 3" ve Asterbuy/B2BUhren gibi **tedarikçi API stoğu** (ürün satırında "Asterbuy alış stok sayısı") dördüncü bir sayı olarak görünüyor.
- **Ürün kimliği (`product_key`) kaynağa göre farklı biçimde:** `manual:<hash>`, `sku:JTL-1051`, `shopify:9:variant:<id>`, `ebay-account:16:<ilan>:<hash>`, `supplier:asterbuy:<hash>`. Kaynak dağılımı (13 kaynak): supplier-api 112.136, wawi_store 97.513, shopify 11.209, parfumarena 5.460, JTL 2.466, ebay 1.740, otto 601, shopify_admin 502, kaufland 462, manual 333, manual-count 90, bulk-import 9, ebay_pool 5.
- **EAN/SKU:** Ürün kartında SKU, EAN 1 (ana barkod), EAN 2 (alternatif platform barkodu) ve "Depo EAN 3" (depo sayımındaki barkod; feed barkodunu değiştirmez) alanları var. Sayımda SKU, EAN 1 veya EAN 2 okutulabiliyor. Varyant: aynı kartın altında "Varyantları göster · N seçenek".
- **Birçok ekran yavaş veya takılı.** `warehouse` ürün listesi iki aşamalı yükleniyor (önce kabuk, sonra sayfanın kendisi `load_list` adresine yönleniyor, 10–20 sn); `stock-movements` "Liste zamanında yanıt vermedi", `critical-physical-stock`, `missing-product-images`, `problem-products`, `duplicate-products` bekleme sırasında hiç sonuç göstermedi. `warehouse-product` ve `catalog-governance` bir kez 504 verdi, ikinci denemede açıldı.
- **Veri tutarlılığı sinyalleri:** Fiziki stok kontrol ekranında 592 "düzeltme gereken" satır, 58 "adet farklı", 912 "aktif ilan yok"; sipariş stok işlemlerinde 106 açık kayıt. Asterbuy stok kontrol görevi son başarılı kontrolü 2026-10-11 gösteriyor (1 aydan eski).
- **Depo eşitleme düğmeleri her depoda "Güncelleme tamamlanamadı".** Depo kartlarının son durumu 3 depoda hata, 2 depoda "Henüz güncellenmedi".

## Ekranlar

Ortak kabuk (her sayfada DOM'da gizli): `Yeni ürün ekle` sihirbazı, `Barkodla fiziki sayım`, `Depo tanımı`, `Tedarikçi kartı`, `Şirket tanımı`, `Stok girişi`, `Tablodan hızlı düzenleme`, `Ürün tasnifi (kategori ekle)`, `Depo mesajları`, operasyonel not / sorun diyaloğu, ürün platformları diyaloğu, "Acil satıştan kaldır", DHL, harici takip, banka CSV içe aktarma diyalogları. Alanları "Varlıklar" ve "erp_action listesi" bölümlerinde.

Genel tablo biçimi: `warehouse` listeleri `tr.wl-equipped` satırlı tablolar, her satırda ürün adı, marka, SKU, EAN, "Ürün detayı / Güncelle", mağaza bilgileri (JS ile sonradan yükleniyor), kategori etiketleri, "Düzenle", "Not / Sorun ekle", "Rakip eBay/Kaufland/Metro/Otto ↗" (EAN ile dış arama bağlantıları, "Okunan fiyatlar 24 saatte bir güncellenir"), depo tablosu (Wawi fiyatı, Fiziki stok, Tedarikçi), "Alış fiyatı ekle", "Platform ayrıntıları".

### warehouses
- Amaç: depo dizini; her depo için ürün, fiziki, drop sayısı ve eşitleme durumu.
- URL: `/?page=warehouses&warehouse_page_size=50` (parametreler: `warehouse_q`, `warehouse_page_size` 24/50, `warehouse_page`).
- Depolar: 1 Istanbul Warehouse (MAIN), 2 Almanya Warehouse (DE-WH), 3 Hollanda Warehouse (NL-WH), 2881 Mega B (DE-MEGA-B), 2882 Technowelt Almanya (DE-TECHNOWELT). Sayılar genel bakıştakiyle aynı (Ürün / Fiziki / Drop).
- Kart durumları: "Güncelleme tamamlanamadı" (1, 2, 3), "Henüz güncellenmedi" (2881, 2882).
- Eylemler: `+ Depo ekle` (erp_action `add_warehouse`), kart başına `Stokları ve siparişleri güncelle` (`queue_warehouse_sync`; gizli alanlar `request_key`, `warehouse_id`, `return_*`), kart bağlantıları Ürünler / Siparişler / Ayarlar (`page=warehouse&warehouse=N&settings=1#warehouse-settings`).
- Aşağıda aynı sayfada: Satışlar özeti (24 saat, günlük, dün, haftalık, aylık, yıllık; hepsi "Yüklenemedi" + "Yeniden dene"), "En çok satılan ürünler" ("Ürün sıralaması yüklenemedi"), Şirketler (12), Pazaryerleri (22), Satış platformları (19). Bkz. Sorunlar.
- Bağlantı: `page=inventory` (menüde görünüyor, açılmadı).

### warehouse-home (depo çalışma alanı)
- Amaç: seçili deponun şirket → satış kanalı kapsamı, veri akışı, alt depo ve tedarikçi özetleri.
- URL: `/?page=warehouse-home&warehouse=1&workspace=1`, `...warehouse=2&workspace=2`. Filtre parametreleri: `company`, `channel` (ör. `channel=source-ebay` harici/eski kanal kaynakları), `scope_company_q`, `scope_channel_q`, `legacy_channel_q`, `stock_pull_q`, `stock_pull_page_size` (20/50), `sales_sync_q`, `sales_sync_page_size` (25/50), `missing_main_company_q`.
- Üç kademeli seçici: 1 Depo → 2 Şirket (12) → 3 Satış kanalı (42), ayrıca "Haricî / eski kanal kaynakları" (Amazon, Dealclub, eBay.de, JTL Wawi, Kaufland, Shopify).
- **Depo 1 (merkez):** "DEPO VERİ AKIŞI" (stok ve sipariş güncellemesi, son işlem zamanı, `Stokları ve siparişleri güncelle`); "Alt depo envanterini merkeze al" bölümünde alt depo başına `X'dan ürün ve stokları çek` (erp_action `pull_branch_stock`, onay kutusu "işlem öncesi yedek alınacağını ve alt depo stoklarının ayrı kalacağını onaylıyorum"); "Satış stok senkronu" (erp_action `toggle_sales_stock_sync`, onay kutusu `sync_stock_ready`); depo tedarikçileri; "Satış kanalı katalog eşleştirmesi" (kanal başına ürün sayısı: Ivobuyshop 3.186, Novada Shops 2.735, Parfumkoopjes BV 1.352, Kaufplus 364, İthal Koku 11); "Satış Kanalı Özeti" ve "Son Siparişler" (hepsi 0 sipariş, "Seçili kapsam için sipariş yok"); "Ana depoya bağlı alt depolar": Almanya 122.902 ürün, Hollanda 7.689, Mega B 6.651, Technowelt 4.062 (not: depo listesindeki sayılarla uyuşmuyor: 122.934 / 7.926 / 6.651 / 4.579). Her alt depo kartında `Stokları ve siparişleri güncelle`, `+ Şirket`, `+ Alt depo`.
- **Depo 2 (Almanya):** üst sayaçlar STOK 2.055.921 (Fiziksel + Dropshipping), SİPARİŞ 25.755, MÜŞTERİ 24.091 (tekil), TOPLAM SATIŞ 1.986.950,61 EUR (para birimleri ayrı). "Alım yapılan firmalar": B2BUhren Germany, "Firma Belirsiz", Watchimport (ILA Uhren), hepsi 0 ürün / 0 alınan adet / fatura 0 / irsaliye 0 ("Satın alma merkezini aç", `Firma ekle`). "Satış Kanalı Özeti" kanal başına sipariş/ürün/tutar (ör. Kaufland.de · Ivobuyshop 8 sipariş 1.360 EUR; eBay · 3DPLady 25 sipariş 2.714 EUR; Metro.de · Lady Empire 2 sipariş 97,98 EUR).
- Şirket kartları: ad, kanal sayısı, adres/telefon/e-posta/vergi alanları (kişisel veri içerir, yazılmadı), "ATANAN DEPO", "VERİ KAYNAĞI", `Şirket bilgilerini düzenle`, `Şirket detayları →`. 12 şirket depo ağına şu dağılımda bağlı: Almanya'ya 7 (Ivobuyshop, Kaufplus, Lady Empire, Novada, Perasshop, Stockist24, Woida), Hollanda'ya 3 (Novada, Woida, Parfumkoopjes), İstanbul'a 2 (DOCSER, İthal Koku), Mega B (Elec_texx), Technowelt.

### warehouse (depo ürün listesi, varsayılan)
- Amaç: seçili depodaki ürünleri ("Ürün havuzu") listelemek ve düzenlemek. İki mod: `Ürün havuzu` ve `Stok yönetimi` (`mode=stock`).
- URL: `/?page=warehouse&warehouse=N`; parametreler: `product_view`, `mode=stock`, `stock` (physical_alert / physical_uncounted / physical_depleted vb.), `summary_warehouse`, `pool_warehouse`, `pool_platform`, `stock_kind` (all/physical/dropship), `p` (sayfa), `settings=1`, `load_list=1` (sayfanın kendi kendine yönlendiği adres; elle açılmadı).
- Yükleme: ilk gösterim "Ürün listesi arka planda hazırlanıyor…" ve "Yeniden dene"; sayfa 10–20 sn sonra kendi `load_list=1&pool_warehouse=N` adresine gidiyor. Depo 2 (123 bin ürün) varsayılan listesi 16 sn bekleyince açılmadı; depo 2882'de açıldı (4.565 ürün, 40/sayfa).
- Filtreler (Ürün havuzu): `q` arama; kategori; Şirketler; Pazaryerleri/platformlar (`pool_platforms[]`: eBay, Kaufland, Otto, ... her hesap ayrı); Stok türü (`stock_kinds[]`: Fiziki stoklu, Drop stoklu); Stok durumu (`stocks[]`: Stok var, Stok 0, Sayım yok, Negatif, Kritik); Sırala (`sort`: En ilgili, Ad A–Z/Z–A, Fiziki çok→az / az→çok, Drop çok→az / az→çok, En çok satan · 30 gün, Son güncellenen); `pool_warehouses[]` (birden çok depo birlikte); `brand`; `tag`; `provider` (onay kutusu). "Seçimler otomatik uygulanır". "Excel indir · Alan seç" (Tüm alanlar / Temel alanlar / "Seçili alanlarla Excel hazırla" / Devam et / Duraklat / "Excel'i indir").
- Satır içeriği: ürün adı (bazı satırlarda "⚠ eBay başlığı: 81 / 80 karakter · kısaltın" uyarısı), marka, SKU, EAN; kategori etiketleri; "Varyantları göster · N seçenek"; depo başına Wawi fiyatı / Fiziki stok / Tedarikçi; "Paket stoğu ... 1 paket = 10 adet" gibi paket ürün gösterimi (başlık "Fiziki stok" yerine "Paket stoğu"); "Alış fiyatı ekle"; üstteki başlıkta "TR MARKET ÜRÜNLERİ ↗ · Türkiye kataloğu ayrı tutulur; Trendyol stokları fiziki sayımla karışmaz" (bağlantı `page=tr-market-products`).
- Başlık satırı biçimi: "40 gösteriliyor · 40 / sayfa · Aynı ürün kaydı havuzda bir kez gösterilir.", sayfa numaraları, "Sayım: 16:54 · Stoklar liste açılırken güncel okunur."
- Başlık sütunları (tablo): Ürün / EAN / model · Fiyat ve depo stoğu · Satış platformları / gönderimler.
- Satır eylemleri: `Ürün detayı / Güncelle` (→ `warehouse-product`), `Wawi fiyatını düzenle`, `Düzenle` (kategori/etiket), `Not / Sorun ekle`, `Kaydet` (satır içi başlık düzenleyici, `pool-title-editor`), satır içi formlar `ebay_title`, `google_title`, `shopify_title` (erp_action yok, JS ile kaydediliyor).

**Varyantlar (denenen görünümler):**

| Görünüm (URL) | Başlık | Sayı | Not |
|---|---|---|---|
| `warehouse=2882` varsayılan | Ürün havuzu / Stok yönetimi | 4.565 ürün | Londa/Schwarzkopf boya ürünleri "Varyantları göster · 2-3 seçenek" |
| `warehouse=1&product_view=physical_low` | Fiziki ürünler · Stok 2 ve altı | 6.519 ürün, 163 sayfa | "Önce stok 0" sıralı; satırda tüm depoların stoğu görünüyor (İstanbul, Almanya, Hollanda, Mega B) |
| `warehouse=1&product_view=physical_missing_ean` | Fiziki ürünler · EAN'sız | 1 sayfa (40+) | Satırda "EAN: —" |
| `warehouse=2&product_view=drop_asterbuy` | Drop ürünler · Asterbuy | 2 sayfa (20/sayfa) | Satırda "Asterbuy alış" fiyatı (KDV hariç), "Asterbuy alış stok sayısı: 1.069 adet", "Tedarikçi kodu", "Son API okuması"; altındaki depo tablosu Wawi fiyatı 16,90 € / Fiziki stok 100 |
| `warehouse=2&product_view=drop_b2buhren` | Drop ürünler · B2BUhren Germany | 2 sayfa (40/sayfa) | "B2BUhren alış stok sayısı: 5 adet"; Wawi tarafı Fiziki stok 5 |
| `warehouse=1&product_view=active_ebay` | eBay aktif ürünler | 1.389 ürün, 35 sayfa | "Tüm kayıtlar" alt başlığı; paket ürün (1 paket = 10 adet) örneği |
| `warehouse=1&mode=stock&stock=physical_alert` | Stok yönetimi · Stok Alert | 6.386 ürün (katalog 8.985) | Ayrı tablo düzeni, aşağıda |

Diğer `product_view` değerleri (haritadan, açılmadı): `recent`, `physical_rejected`, `physical_unknown`, `physical_available`, `drop_watchimport`, `drop_bueroarena` (depo 2 menüsünde bulundu), `active_kaufland`, `active_metro`, `active_shopify`.

**Stok yönetimi modu (`mode=stock`):** "Fiziki ve drop stoklar birbirinden ayrıdır." Stok Alert tanımı: kayıtlı fiziki stok 2 ve altı (2, 1, 0 ve negatif), sayımı bilinmeyenler dahil değil, Dropshipping ve Asterbuy ürünleri hariç, "Tüm depolarda en düşük bilinen stok esas alınır". Tablo sütunları: ÜRÜN · SKU · FİYAT · her depo için bir sütun (ör. IW İstanbul), her sütunda ↑ ↓ sıralama; "Karşılaştır: İstanbul / Almanya / Hollanda" düğmeleri. Filtreler (GET): `q, provider, tag, stock, sort, brand, pool_platform, category, warehouse_category_q, supplier`. `stock` seçenekleri: Tümü, Stok var, Stok 0, Sayım yok, Negatif stok, Kritik, Stok Alert. `sort`: Stoklu önce, İsim A–Z/Z–A, Fiziki stok çok→az / az→çok, Drop stok çok→az / az→çok, Fiyat artan/azalan. Toplu düzenleme: `Toplu stok düzenle` (erp_action `bulk_update_inventory`; `selection_scope` = Sayfadaki ürünler (40) / Filtrelenen sonuçlar (6.386) / Tüm katalog (8.985); `bulk_stock_type` = Fiziksel stok | Dropshipping stok; `bulk_operation` = Stok değerini ayarla | Stok ekle | Stok düş; `bulk_quantity`). Satırda "Stokları güncelle", "Stokları düzenle", "Fiyat düzenle" (örnek fiyatlar 349,90 €, 2.500,00 €, "Tanımsız").

### warehouse-product (ürün detayı, depo kartı)
- URL: `/?page=warehouse-product&warehouse=N&product=<product_key>` (listedeki "Ürün detayı / Güncelle" düz `<a href>` bağlantısı). Açılan örnek: Technowelt kartı (`manual:` anahtarı, tuvalet kağıdı ürünü).
- Düzen: ekmek kırıntısı Depo ağı › depo › Ürün havuzu › ürün; görseller (galeri, `gallery_files` yükleme); "Kaynak ve güncellemeler / Ürün işlem geçmişi" (son 365 gün, sayfa başı 100 hareket, saatler UTC; kayıt örnekleri: "Manuel eklendi", "Ürün adı değiştirdi" (PIN son iki hane ile), "Wawi category correction · metro_product_category değiştirdi"; "Test kayıtlarını da göster"); "Ürünün belgeleri" (son 20 satış + 20 alış belgesi); "Kanalda satışı durdur" (Metro, eBay, Kaufland, Shopify için mağaza başına `Satışı durdur`, "İşlem yapılabilir ilan bağlantısı yok" durumu); sekmeler Bilgiler / Fiyat & stok / Kanal fiyatları / Varyantlar / Özellikler / Bağlantılar.
- Stok bölümü: "Stok kaynağı doğrulanmadı", "Wawi fiziki stok: Sayım yok", "Wawi drop stok: 0"; "Platformların son okunan fiyat ve adetleri aşağıdaki bağlantı kutularındadır. Stok türü Wawi kuralıdır; gönderim onayı değildir"; "Depo ve işlem geçmişi"; başka depo kartı bağlantısı (`warehouse=2` aynı ürün); `Stok gönderim durumu`, `Durumu kontrol et`, `Son 10 sipariş · Tüm mağazalar`; "Sanal stok açık / Sanal stoğu kapat (seçili depodaki tüm bağlı platformlarda geçerlidir; fiziki sayım ve drop stok değişmez)".
- Form (erp_action `update_product`, gizli: `return_page, return_product, product_key, warehouse_id, ean3_expected`): `title`, `ebay_title` (limit 80), `google_title` (150), `shopify_title` (255, MixOutlet), `description`, `tags`, `sale_price` ("Kaydet ve gönder"), `dropship_sale_price` (DROP SATIŞ FİYATI), `physical_stock`, `dropship_stock`, `minimum_stock`, `bin_location` (RAF / KONUM), `sku`, `ean`, `ean2`, `ean3` (Depo EAN 3), `brand`, `color`, `size`, `weight_grams`, `category`, `attributes_json` (ek özellikler JSON), `product_image`; KDV oranı bilgisi ("19% · Wawi satış fiyatları KDV dahildir"); ürün güvenliği ve içerik bölümü (SDS HTTPS adresi, uyarı kelimesi Gefahr/Achtung/Kein Signalwort, H kodları, P kodları, INCI, ürüne özel güvenlik bilgisi; "Kaufland ürün bilgileri hazırlanırken tekrar kullanılır"); `Değişiklikleri kaydet →`.
- Diğer formlar: `save_stock_pack_rule` (`is_pack`, `units_per_item`, "1 satışta stoktan düşen adet", `Paket ayarını kaydet`), `save_product_platform_sku` (kanal başına `platform_sku`, `company_channel_id`), "Bağlı platformları düzenle / Kaydet ve platformda güncelle / Sonucu kontrol et", "+ Varyant ekle", "eBay başlığını gönder" (yalnız tıklayınca gönderilir).
- Gözlem: aynı sayfada "Wawi fiziki stok: Sayım yok" ve başka bir kutuda "Fiziki stok: 119" yan yana (hangi karta ait olduğu net değil; tahmin: Almanya kartı).

### product-detail (kaynak ürün kaydı)
- URL: `/?page=product-detail&id=<kaynak:...>` (`products` listesinden). Salt okunur ana bilgi: SKU, EAN 1, EAN 2, Depo EAN 3, kategori, marka, kaynak, stok, fiyat, veri durumu (Yeni / Değişmedi vb.), son değişiklik, görsel kaynağı, galeri adedi, aktarım durumu; "Platformlar · çoklu seçim", "Düzenle", "Rakip fiyatlar". Form yok. Not: bu sayfa JTL kaynak kaydı gösteriyor (örnek kaynak Shopify, stok 0, fiyat 132.00).

### stock-movements
- Amaç: "Fiziki stok geçmişi", ürünlerin önceki ve sonraki depo stokları.
- URL: `/?page=stock-movements&warehouse=1`; GET alanları `q, from, to`; filtreler: 1 Ürün/kategori, 2 Tarih (Bugün, Son 7 gün, Son 30 gün, Bu hafta, Bu ay, Tarih aralığı), 3 Depo (çoklu) ve Hareket (Tümü, "Kanal kaydı olmayan hareketler"), Son 10/30/50 hareket.
- Sütunlar: ÜRÜN / KATEGORİ · TARİH / İŞLEM · DEPO / KAYNAK · FİZİKİ STOK ÖNCE → SONRA · DEĞİŞİM · GEÇMİŞ.
- Yardım metni: gerçekleşmiş fiziki hareketler; sayfa stok değiştirmez; platform filtresi hareketin kaynağıdır, pazaryerine gönderilen adet değildir; drop stok dahil değil; eski miktar kaydedilmemişse "Kayıt yok"; saat Türkiye.
- Durum: ilk bekleme "Stok geçmişi yükleniyor…", sonra "Liste güncellenemedi. Liste zamanında yanıt vermedi. Yenile ile tekrar deneyin." Hiç satır görülemedi.

### stock-transfer (Stok dağıtımı)
- Amaç: İstanbul (merkez) doğrulanmış stokunu bağlı alt depolara dağıtmak.
- URL: `/?page=stock-transfer&warehouse=1`.
- Akış (3 adım ekranda numaralı, "1 · Seçim 2 · Önizleme 3 · Kayıt"): (1) NE AKTARILACAK: `selection_type` = product (ürünleri seç) | category (tüm kategori, "Yalnız doğrulanmış pozitif stoklar aktarılır"); tedarikçiye göre süz (`supplier_id`, "Aktarılan miktar ayrı bir tedarikçi stoğundan değil, İstanbul Warehouse stokundan düşer"); kategori süz (17 kategori); ürün arama; 50'şerli sayfa, "0 ürün seçili"; (2) NASIL DAĞITILACAK: `distribution_mode` = all (eşit dağıt; bölünemeyen adetler depo sırasına göre) | proportional (yüzdeyle; kalan İstanbul'da kalır, `target_percentages[2|3|2881|2882]`); (3) HEDEF DEPOLAR: `target_warehouse_ids[]` (Almanya, Hollanda, Mega B, Technowelt), "Tüm alt depoları seç". Düğme: `Dağıtımı önizle →` (erp_action `preview_stock_distribution`; "Bu adım stok değiştirmez. Önce kesin ürün ve miktar planı hazırlanır").
- Seçici arama alanları: `distribution_supplier_q`, `distribution_category_q`, `distribution_target_q`, `distribution_employee_q`; "Önerileri getir"; "1 tedarikçi · 17 kategori · 4 hedef depo".
- "HAREKET GEÇMİŞİ · Son stok dağıtımları": bir kayıt var (7 ürün, Almanya Warehouse'a 350 adet, 2026-08-12, işlemi yapan kişi adı ile). Kaydetme adımının erp_action'ı önizleme sonrası görünüyor (tahmin; görülmedi).
- Bağlantılar: `purchases&warehouse=1#supplier-directory`, `catalog-governance&warehouse=1#category-visibility`.

### problem-products
- Amaç: ürünlere eklenen operasyonel not/sorun kayıtlarının listesi.
- URL: `/?page=problem-products`; GET alanları `warehouse` (Yetkili tüm depolar), `status` (open Açık · resolved Çözüldü · all Tümü), `reason` (Tüm sorunlar; seçenek listesi sayfada yüklenmedi), `q`. Düğmeler `Göster / Yenile`, `Önceki`, `Sonraki`.
- Durum: "Notlar yükleniyor…" ekranda kaldı, satır görülemedi (≥5 sn). Kayıt diyaloğu (gizli): çoklu "Sorunlar", Not, Durum (Açık · İşlem bekliyor / Çözüldü), dosya (PDF/PNG/JPG/WebP, 8 MB, en çok 5 dosya), düzenleme geçmişi, `Kaydet`.

### duplicate-products (Tek ürün · çoklu platform)
- Amaç: aynı ürüne ait kartları tek ana Wawi kartında birleştirmek.
- URL: `/?page=duplicate-products&warehouse=1`; `kind` radio: Tümü | Aynı EAN / GTIN | Olası · benzer isim; `q`.
- Kurallar (sayfa metni): yalnız görünür, birleştirilmemiş ürünler; kayıtlı varyantlar listeye alınmaz; farklı ml/paket/renk/model/parfüm yoğunluğu ayrı varyant sayılır; "EAN eşitliği tek başına barkod doğruluğunu kanıtlamaz"; 2–20 kart seçilir; "Stoklar otomatik toplanmaz; çelişen depo stokları önizlemede seçilir"; platform ilanları silinmez, bağlantılar ana karta toplanır; **geri alma düğmesi yok**, denetim kaydı saklanır.
- Birleştirme diyaloğu: ana kart seçimi, `acknowledge_warnings` onay kutusu, `confirmation` metni ("AYNI ÜRÜNÜ BİRLEŞTİR" yazılmalı), `emergency_pin` (yönetim işlem PIN'i, giriş PIN'inden ayrı), düğmeler `Önizlemeyi yenile`, `Birleştir ve kaydet` (erp_action değeri DOM'da görünmedi).
- Durum: "Mükerrer adayları karşılaştırılıyor…" 12 sn sonra hâlâ sürüyordu, aday listesi görülemedi.

### catalog-governance (Katalog yönetimi)
- Amaç: kategori kapsamını depolara atamak ve katalog arşivlemek ("yeni sayım için katalog hazırlığı").
- URL: `/?page=catalog-governance&warehouse=1`; GET: `category_q`, `visibility_warehouse_q`, `visibility_warehouse_page_size` (25/50).
- Bölüm 1 "Kategori kapsamı": 411 kategori, sayfa 1/17; her kategori satırında ürün sayısı ve 5 depo onay kutusu (`visible_warehouse_ids[]`), `Bu depo sayfasını kaydet` (erp_action `save_category_visibility`). Açıklama: "İstanbul merkez kataloğu korur. Alt depolarda yalnız seçilen kategoriler listelenir." `+ Kategori ekle`. Örnek satırlar: 3D-Druck 58 ürün, Accessoires > Sonnenbrillen 2.068 ürün, AMEN 582 ürün (marka adları da kategori olarak tutuluyor).
- Bölüm 2 "Katalog arşivi" (erp_action `archive_catalog`): "Ürün kartları görünümden kaldırılır; depo stokları, satış kanalı eşleşmeleri, faturalar ve hareket geçmişi korunur." Filtre: ürün ara, kategori (en fazla 50 öneri, 411), kaynak (13). Önizleme sayaçları: ÜRÜN KARTI 232.526 (arşiv kapsamı), DEPO KAYDI 151.075 (korunacak), BİLİNEN STOK 294.377 adet (korunacak), SATIŞ EŞLEŞMESİ 347.860 (korunacak). Tablo: ÜRÜN · KATEGORİ / KAYNAK · DEPO KAYDI · BİLİNEN STOK · SATIŞ EŞLEŞMESİ. Onay: `archive_confirmation` metni + `emergency_pin`; `Önizlemeyi güncelle`. Yüklemede ilk denemede 504, ikincisinde açıldı.

### physical-stock-check (Sorunlu Fiziki Ürünler)
- Amaç: Wawi fiziki stoğunun eBay / Kaufland / Metro'daki beklenen satış adediyle karşılaştırması; "bir stok sayım listesi değil, düzeltme listesi".
- URL: `/?page=physical-stock-check` → otomatik `...&q=&reason=all&status=issues&sort=problem&page_size=25&check_page=1`. Alanlar: `q` (ad/SKU/EAN1/EAN2), `platforms[]` (eBay, Kaufland, Metro), depolar ve şirketler çoklu seçim, `reason` radio (Tüm nedenler, EAN eksik, Fiyat / KDV, Varyant / SKU, Ürün eşleştirme, Sipariş stok işlemi, Senkron / bağlantı), `status` (issues Düzeltme gerekenler, all, matched Uyumlu, mismatch Adet farklı / gecikmiş, pending Senkron bekliyor, blocked İşlem engeli, stale Güncel okuma gerekli, not_live Aktif ilan yok), `sort` (Önce sorunlar, fiziki az→çok, çok→az, ad), `page_size` 25/50/100. Seçenekler: "30 saniyede yenile", "Uyarı işareti yanıp sönsün", `Yeniden karşılaştır`.
- Sayaçlar: Düzeltme gerekenler 592 · Adet farklı / gecikmiş 58 · Uyumlu 37 · Senkron bekliyor 1 · Aktif ilan yok 912. Uyarılar: "Stok işleyicisi / 10 dk kontrolü gecikmiş · İşleyici: 2026-11-14 14:24 UTC · Son karşılaştırma 15:01 UTC"; "Sipariş stok işlemlerinde açık kayıtlar (106)".
- Sütunlar: ÜRÜN · DEPO / ŞİRKET / HESAP · WAWİ FİZİKİ · BEKLENEN SATIŞ ADEDİ · PAZARYERİ ADEDİ · NE DÜZELTİLMELİ?. Örnek satır: Wawi fiziki 40, beklenen 0, fark −40, "Düzeltme gerekiyor / Bekleyen sipariş stok işlemi var" (Metro, Lady Empire).
- Kural metni: pazaryerlerinde yalnız gerçek (fiziki) stok kullanılır; fiziki 1 ise 1 adet, 0 veya eksi ise satış adedi 0; sanal stok ve fiyat çarpanı uygulanmaz; paket miktarı ve eBay ilan limiti hedef adede uygulanır; bu tablo fiyat doğrulamasını içermez.
- Not: aynı ürün birden çok satırda olabilir (ürün × pazaryeri hesabı).

### critical-physical-stock (Kritik Seviyeli Fiziki Ürünler)
- Amaç: fiziki stok 5 ve altı (sıfır ve negatif dahil), yalnız sayımı bilinen fiziki ürünler.
- URL: `/?page=critical-physical-stock`; alanlar `q`, `sort` (fiziki az→çok, çok→az, ad), `page_size` 25/50/100, depolar ve firmalar çoklu seçim ("Son filtreler bu tarayıcıda saklanır"). Belirsiz sayım, drop ve tedarikçi ürünleri hariç; "Depoların stokları toplanmaz; ortak stoklu paketler ana stok kartında bir kez gösterilir". Bağlantı: Sorunlu Fiziki Ürünler.
- Durum: "Kritik stok listesi yükleniyor…" 13 sn sonra hâlâ yükleniyordu; satır görülemedi.

### pool (Ürün havuzu · JTL Kaynak Ürünleri)
- Amaç: JTL (MariaDB) kaynak ürünlerini listelemek. İsim yanıltıcı: bu sayfa "Wawi ürün havuzu" (232.525) değil, **yalnız JTL kaynağı**: TOPLAM ÜRÜN 2.466, "JTL DURUMU Bağlı · MariaDB".
- URL: `/?page=pool`; filtreler: ürün arama, Kategoriler (çoklu), JTL Marka/Üretici, MİNİMUM STOK, SAYFA BOYUTU 25/50, `Filtreleri Temizle`. Tablo: SKU · ÜRÜN · KATEGORİ · MARKA · EAN · STOK · FİYAT · DURUM. Düğmeler: `Wawi listesini yenile`, "Kaufland Ürün Aktarımı" (→ `send-kaufland`). Satırlar yükleme sırasında boştu (5 sn).

### products (Kaynak Ürün Kataloğu)
- Amaç: tüm kaynaklardan gelen katalog kayıtları (MariaDB).
- URL: `/?page=products`; filtreler: `q`, `source` (13 kaynak, sayılarıyla), `status` (Tüm Ürünler, Yeni veya Değişen, Yeni, Stok Değişti, Fiyat Değişti, Stok ve Fiyat Değişti, Değişmedi), `categories[]` (1.139 kategori, 57 sayfa), `brands[]` (3.979 marka, 199 sayfa), `product_page_size` 10/25/50, `stock_filter` düğmeleri (Tüm Stoklar 219.647 · Stokta 6.022 · Stok 10+ 15 · Stok 50+ 2 · Stok Yok 213.625), `product_page`.
- Sayaçlar: TOPLAM ÜRÜN 232.526; YENİ / DEĞİŞEN 129.512.
- Sütunlar: GÖRSEL · SKU · ÜRÜN · KATEGORİ · KAYNAK · MARKA · EAN 1 / EAN 2 · STOK · FİYAT · VERİ DURUMU · İŞLEM. Satırda "Stok detayı bekliyor", "Kategorisiz". İşlem: `Detay` (→ `product-detail`), `Ürün detayı / Güncelle` (→ `warehouse-product&product=...`, depo parametresiz), `Düzenle`. Üstte `Seçili Ürünleri Aktar`, `Wawi listesini yenile`.

### bulk-products (Toplu ürün işlemleri · CSV / Excel)
- Amaç: ürün ve stok toplu yükleme/dışa aktarma.
- URL: `/?page=bulk-products&warehouse=1`.
- İndirme (POST, `bulk_products_download` = template | export; `format` = csv | xlsx; `warehouse`): boş CSV/Excel şablonu, depo ürünlerini CSV'ye aktarma. "Büyük envanter için Excel dışa aktarımı kapalıdır; CSV kullanın."
- Yükleme: erp_action `bulk_products_preview` (multipart; `warehouse_id` seçici, `bulk_products_file`); dosya önce kontrol edilir, önizlemede kayıt değişmez; "Bir satırdaki sorun diğer ürünleri durdurmaz"; "Eksik ürün adı: ürün eklenir ve inceleme listesinde işaretlenir"; "Stok başka depolara yazılmaz"; depolar 20'şer kayıt yüklenir.
- 20 dosya alanı: `operation` (boş/upsert; isteğe bağlı `warehouse_id`), `product_key`, `ean`, `ean2`, `sku`, `title`, `category`, `brand`, `color`, `size`, `weight_grams`, `attributes_json`, `physical_stock`, `dropship_stock`, `sale_price`, `minimum_stock`, `bin_location`, `image_url`, `supplier_id`. "Mevcut üründe boş bırakılan alanlar kayıtlı değerini korur."

### bulk-prices (Toplu Fiyat Güncelle)
- Amaç: elektronik tablo benzeri fiyat düzenleme ("Fiziki ürünler").
- URL: `/?page=bulk-prices&warehouse=1`; filtreler: `q`, `marketplaces` (ebay, shopify, metro, kaufland), `date_from`/`date_to` (Wawi'ye ilk geliş, Almanya saati), depo ve firma, ürün kapsamı (Tüm fiziki ürünler, Stoklu ürünler, Stok 0, Stok belirsiz).
- Sütunlar: Ürün · SKU / EAN, ardından "Default price" (depo fiyatı, EUR) ve 25 mağaza/kanal sütunu (amazon, 8 eBay hesabı, Kaufland, Metro, otto, ozon USD, 9 Shopify/webshop alanı, oppoffice GBP...). Hücreler "Okunuyor…" ile yükleniyor.
- Düğmeler: `Aşağı doldur`, `Geri al`, `Değişiklikleri bırak`, `Sütun ekle`, `Yenile`, `Kaydet ve gönder`, "0 fiyat değişti". Kısayollar: Shift+↓ aralık, Ctrl+D aşağı kopyala, Ctrl+C/V Excel yapıştır. Kurallar: boş hücre fiyatı silmez; Default price değişikliği depodaki ana fiyatı izleyen mağazalara uygulanır; mağazaya özel fiyatlar bağımsız; ilan yoksa fiyat saklanır, yeni ilan açılmaz.

### missing-product-images (Wawi · Fotoğraf kontrolü)
- URL: `/?page=missing-product-images&image_scope=all&filters=1&warehouse=1`; filtreler: `family` (Tüm ürünler | Parfüm | Toner), `reason` (Tüm görsel sorunları | Fotoğrafı olmayan | Sorunlu / düşük kaliteli | Kaynağı okunamayan; sorunlu = açılamayan veya özgün fotoğrafın uzun kenarı 500 pikselden küçük), depolar, firmalar (12), `q`, `sort` A→Z / Z→A, `page_size`.
- Durum: "Resimsiz ürün listesi yükleniyor…" 14 sn sonra hâlâ yükleniyordu; satır görülemedi.

### missing-product-eans (EAN'sız ürünler)
- URL: `/?page=missing-product-eans&company=1196&warehouse=2&channel=5075` → `...&q=&sort=name&page_size=25&p=1&filters=1`; alanlar `q`, `sort`, `page_size`.
- Kapsam: seçili platforma (burada eBay.de · Woida, Almanya Warehouse) bağlı Wawi ana kartları; "EAN fehlt" gibi boşluk belirten kayıtlar dahil; birleştirilmiş eski kartlar gösterilmez; platformdaki barkodun anlık kontrolü değil. Sayaç: "12 EAN'sız ürün · Son kontrol 2026-11-14 15:04 UTC".
- Sütunlar: ÜRÜN · EAN 1 / EAN 2 · YAPILACAK İŞLEM. Her satır: "EAN yok", yönerge "Ürün ambalajındaki doğru barkodu EAN 1 veya EAN 2 alanına ekleyin. Barkod uydurmayın; paket ve varyantı doğrulayın.", düğmeler `EAN ekle / düzelt`, `Kaydet`, `Not / Sorun ekle`. Örnekler çoğunlukla "2x/4x/8x" paket toner kartları (paket kartlarında EAN yok).

### purchases (Satın alma ve mal kabul)
- URL: `/?page=purchases&warehouse=1`; alt görünümler: `view=suppliers#supplier-directory`, `supplier=<id>#purchase-history`, `supplier=<id>&new_purchase=1#new-purchase-document` ve `#purchase-receive-step`; `supplier_q`, `supplier_page_size` (24/50). Üst sekmeler: Tedarikçi listesi, Tedarikçi faturaları (→ `page=invoices&warehouse=1&view=purchases`). Depo seçici GET `warehouse`.
- Sayaçlar (İstanbul): TEDARİKÇİ 1, ALIŞ FATURASI 1, İRSALİYE 0, BELGE ADEDİ 1, FATURA TOPLAMI 0,00 EUR.
- Tedarikçi kartları: "Firma Belirsiz" (tedarikçi seçilmedi; alım 0) ve bir gerçek tedarikçi kartı (ALIM 1, FATURA 1, ÜRÜN SATIRI 1, toplam 0,00 EUR). Kart eylemleri: `Alımları görüntüle`, `Fatura / belge yükle`, `Kartı düzenle`, `Tedarikçi ekle`, `Tedarikçiden ürün ekle`, `Yeni kart`, `Depo ayarları`.
- İş sırası (4 adım kartı): 1 Tedarikçi kartı → 2 Alış belgesi (fatura/irsaliye ve ürünler) → 3 Mal kabul (teslim alınan ürünleri stoğa işle) → 4 Ödeme kontrolü. "Önce tedarikçi kartı seçin" uyarısı.
- Belge yükleme ve mal kabul formları (new_purchase=1) açılmadı; alanları görülmedi.

### dropshipping (Drop tedarikçi · Asterbuy ürünleri)
- Amaç: Asterbuy tedarikçi kataloğunda model bulup alış fiyatı ve tedarikçi stoğunu Wawi kartıyla birlikte görmek.
- URL: `/?page=dropshipping&provider=asterbuy` (`tag=` etiket filtreleri, `lang=tr|de`). Yalnız `provider=asterbuy` denendi; B2BUhren / Watchimport / BueroArena için bu sayfa yok, onlar `warehouse&warehouse=2&product_view=drop_b2buhren | drop_watchimport | drop_bueroarena` listeleri.
- Sayaç: "Ürünler (796)" (Asterbuy API · alış fiyatları KDV hariç). Filtre: `source` (Asterbuy API · güncel | Asterbuy ürün dosyası | JTL Asterbuy-Produkte), `match` (Tümü | Wawi kartına bağlı | İnceleme bekliyor), platformda kayıtlı ürünler (Tümü 796, eBay 3, Metro 370, Kaufland 774, Shopify 774; kapalı ilanlar dahil), görsel (Tüm 796, Görsel kaynağı eksik 4).
- Sütunlar: ÜRÜN / MODEL · ASTERBUY ALIŞ FİYATI · ASTERBUY STOĞU · WAWİ KARTI / STOK · ÜRÜN BİLGİLERİ · METRO SATIŞLARI. Satır: Aster kodu, "Uyumlu / muadil" etiketi, alış fiyatı (örn. 1,60 €, KDV hariç birim), Asterbuy stoğu adet ("Hollanda · tedarikçi deposu", son okuma zamanı), "Stok okuma ayrıntısı", Wawi kartı (`JTL-1051` gibi; "Wawi · Almanya Warehouse · Fiziki Bilinmiyor · Drop 0"), Kaufland/Shopify etiketleri, Metro satış adedi. Eşleşmeyen satır: "Ürün kimliği değişti · inceleme gerekli · Wawi eşleşmesi yok".
- Üst "Bağlantı, otomasyon ve katalog işlemleri" paneli: stok kontrolü (20 altı günlük, 20 ve üzeri haftalık; Türkiye saatiyle 09:00'dan sonra Plesk sunucusu kontrol eder; "Plesk görevi: Kurulu · Kontrol gerekli · Son başarılı kontrol 2026-10-11 · Stok kontrolü tamamlanamadı... eski değerler korundu"); Asterbuy API (şifreli kayıtlı, "Bağlantı doğrulandı", son okuma 2026-11-14 15:00 UTC; tüm etkin firmalar aynı hesabı kullanır; yeni siparişler 5 dakikada bir); Asterbuy siparişleri (son 30 işlem: takip numarasının Shopify/Metro'dan doğrulandığı kayıtlar; `Asterbuy sipariş havuzu` → `page=asterbuy-orders`); Metro yeni Asterbuy ilanları: fiyat kuralı alanları `shipping_net`, `profit_net`, `fee_percent`, `return_percent`, `vat_percent`, `rounding` (Eski hesap ,49/,99 | En yakın kuruş), `processing_days`; formül "(Asterbuy net alış + kargo + kâr) ÷ (1 − kesinti − iade payı)", KDV eklenip brüt yuvarlanır; "Fiziki stoğu 2 veya üzeri olan ürünlerde bu tedarikçi fiyatı kullanılmaz". Düğmeler: `API bağlantısını doğrula ve kataloğu yenile`, `Yeni ilan fiyat kuralını kaydet`, `Yeni stoklu ürünleri kontrol et`, `Yeni ilanları Metro'ya gönder`, `Sonraki adımları durdur`, `Ürün dosyasını güncelle` (Asterbuy Download Product .xlsx), `Dosyayı yükle ve eşleştir`, `Wawi eşleşmelerini yenile`, `Listeyi yenile`, "Site stok kontrol kaydını aktar · yönetici" (JSON; `Stok kontrolünü kaydet`; "Depo stoklarına aktarılmaz"). Bu paneldeki formlar `erp_action` taşımıyor (GET/JS ile çalışıyor; tahmin).

## Varlıklar ve durumlar

**Depo (warehouse):** id, ad, kod (MAIN, DE-WH, NL-WH, DE-MEGA-B, DE-TECHNOWELT), ülke, adres, telefon, renk, ikon; ana/alt depo ilişkisi (İstanbul ana; Almanya, Hollanda, Mega B, Technowelt alt depo); bağlı şirketler; son eşitleme durumu ("Güncelleme tamamlanamadı", "Henüz güncelleme çalıştırılmadı", "Otomatik çekim günde iki kez çalışır").

**Şirket (company):** ad, yasal unvan, ülke, kayıt/vergi no, iletişim, atanan depo, veri kaynağı (trendyol, shopify-platform, vb.), kanallar. 12 adet.

**Satış kanalı:** şirket + pazaryeri/platform + hesap (42 kanal; pazaryeri hesapları 22, platform 19). Kanal anahtarları `channel=<id>`.

**Ürün kartı (katalog, 232.526):** `product_key`, başlık, kaynak, SKU, EAN 1, EAN 2, marka, kategori, renk, beden, ağırlık (g), açıklama, etiketler, eBay/Google/Shopify başlıkları, görseller, `attributes_json`, güvenlik/SDS alanları, varyantlar, paket kuralı (`is_pack`, `units_per_item`), veri durumu (Yeni / Değişmedi / Stok Değişti / Fiyat Değişti / ...).

**Depo ürün kaydı (151.075):** ürün kartı × depo: `sale_price` (Wawi fiyatı, KDV dahil), `dropship_sale_price`, `physical_stock`, `dropship_stock`, `minimum_stock`, `bin_location`, Depo EAN 3, sanal stok açık/kapalı, platform SKU (`platform_sku`, kanal başına).

**Stok türleri (aynı ekranda görülenler):** Fiziki stok (sayılan, Sayım yok = bilinmiyor), Drop stok (Wawi alanı), Sanal stok (platform adedini etkileyen anahtar), Tedarikçi API stoğu (Asterbuy/B2BUhren; ayrı), Paket stoğu (paket birimi). Stok durumu filtreleri: Stok var, Stok 0, Sayım yok, Negatif, Kritik (≤5; Stok Alert ≤2).

**Stok hareketi:** ürün, tarih/işlem, depo/kaynak, önce → sonra, değişim, kullanıcı (PIN son 2 hane veya ad), sipariş numarası.

**Tedarikçi kartı:** ad, yasal unvan, vergi/kayıt no, ülke, iletişim, not; alım, fatura, ürün satırı, belge adedi, fatura toplamı. **Alış belgesi:** fatura / irsaliye (mal kabul belgesi), ödeme durumu.

**Kategori:** ad, renk, ürün sayısı, depo görünürlüğü (hangi depolarda gösterilir).

**Sorun/not kaydı:** sorun türleri (çoklu), not, durum (Açık · İşlem bekliyor / Çözüldü), dosyalar, düzenleme geçmişi.

**Fiziki stok kontrol durumları:** Düzeltme gerekenler, Uyumlu, Adet farklı / gecikmiş, Senkron bekliyor, İşlem engeli, Güncel okuma gerekli, Aktif ilan yok.

## İş akışları

1. **Yeni ürün girişi (ürün havuzu sihirbazı):** `+ Ürün ekle` → "Mevcut ürünü arayabilir": EAN/Barkod ile ve/veya ürün adı/SKU/model ile havuzda ara (iki alan doluysa birlikte) → bulunamazsa "Yeni ürün ekle": `kind` (Varyantsız | Varyantlı), ürün adı*, kategori*, marka, satış fiyatı, eBay kategorisi (adından önerilir), EAN 1/2, SKU, ana görsel, açıklama; varyantlı üründe her varyant için opsiyon adı*, kart adı*, SKU, EAN 1/2, görsel ("Yalnız bu varyant düzenlenir; depo stokları ve diğer varyantlar değişmez"). Kayıt sonrası "eBay gönderimini hazırla". (Gönderen form erp_action'ı DOM'da görünmedi.)
2. **Barkodla fiziki sayım:** sayım deposu seç → işlemi yapan seç → SKU/EAN 1/EAN 2 okut (kamerayla tarama da var), her okuma listeye +1 → "Güncel stoğu kontrol et" → kayıt yöntemi: "Sayılan adedi mevcut stoğa ekle" veya "Fiziksel stoğu sayım sonucuna ayarla" (örnek: mevcut −2, sayılan 3 → yeni stok 1) → `Sayımı kaydet`. "Kaydet'e basmadan stok değişmez. Diğer depolar ve Drop-Stok değişmez." Sayım sonrası `physical-stock-check` pazaryeri adedini karşılaştırır. Yeni sayım öncesi `catalog-governance` arşivi ile eski kartlar görünümden kaldırılabilir.
3. **Stok girişi / mal kabul:** (a) ürün kartından `Stoğa adet ekle`: stok türü (Fiziksel | Dropshipping), adet*, "Mal kabul / işlem notu" (`add_stock`); işlemi yapan PIN'den otomatik; (b) satın alma merkezinde tedarikçi kartı → alış belgesi → mal kabul ("teslim alınan ürünleri stoğa işleyin") → ödeme kontrolü (`purchases`, formları görülmedi); (c) tablodan hızlı düzenleme (fiyat, fiziki, drop; `quick_update_inventory`); (d) toplu stok düzenleme (`bulk_update_inventory`); (e) CSV/Excel (`bulk_products_preview`).
4. **Depolar arası stok aktarımı (dağıtım):** `stock-transfer` (İstanbul → alt depolar): ürün/kategori seç → eşit ya da yüzdeli dağıtım → hedef depolar → `Dağıtımı önizle →` (`preview_stock_distribution`; stok değişmez) → kesin plan ve depo toplamları → kayıt (kayıt adımı görülmedi). Kayıt "HAREKET GEÇMİŞİ" listesine düşer. Ayrıca ters yönde `warehouse-home` depo 1'de "Alt depo envanterini merkeze al" (`pull_branch_stock`, işlem öncesi yedek alınır, alt depo stokları ayrı kalır).
5. **Mükerrer birleştirme:** `duplicate-products` → eşleşme türü (aynı EAN / benzer isim) → 2–20 kart seç → `Tek üründe birleştir` → ana kartı seç, çelişen depo stoklarını önizlemede seç → onay kutusu + "AYNI ÜRÜNÜ BİRLEŞTİR" yazısı + yönetim PIN'i → `Birleştir ve kaydet`. Geri alma yok, denetim kaydı var; eski kartlar ana karta yönlenir; ilanlar silinmez.
6. **Drop ürün / Asterbuy akışı:** Asterbuy API kataloğu (`dropshipping`) → Wawi kartına eşleştir (`match`) → drop stok/fiyat Wawi'ye "Drop · Asterbuy" etiketli kartta (`warehouse&product_view=drop_asterbuy`) görünür → Metro/Kaufland/Shopify ilanları (Metro için fiyat kuralıyla yeni ilan gönderimi) → sipariş geldiğinde `asterbuy-orders` havuzu ve harici takip numarası (diyalog: "Yeni kargo etiketi, satın alma veya stok düşümü oluşturulmaz") platforma bildirilir. Fiziki stoğu ≥2 olan üründe tedarikçi fiyatı kullanılmaz (fiziki öncelikli). B2BUhren / Watchimport benzer drop listeleri; "alım yapılan firmalar" kartında 0 ürün 0 alım (satın alma kaydı yok).
7. **EAN / görsel düzeltme:** `missing-product-eans` (kanal bazlı) ve `missing-product-images` listeleri eksik alanları tamamlatmak için; EAN alanı satırdan `EAN ekle / düzelt` ile kaydedilir; görsel için ürün detayında "Görselleri düzenle".
8. **Fiyat güncelleme:** `bulk-prices` ızgarasında depo (Default price) ve kanal sütunları → değişiklikler işaretlenir → `Kaydet ve gönder`. Tek ürün için detay sayfasında `sale_price` "Kaydet ve gönder".

## erp_action listesi

Bu bölümdeki sayfalarda ve ortak kabukta DOM'da görülen değerler (hiçbiri tetiklenmedi):

| erp_action | Ekran | Ne yaptığı (tahmin işaretli olanlar dışında sayfa metninden) |
|---|---|---|
| `logout` | tüm sayfalar | Oturumu kapatır |
| `queue_warehouse_sync` | warehouses, warehouse-home | Depo için stok ve sipariş güncelleme işi sıraya alır |
| `pull_branch_stock` | warehouse-home (depo 1) | Alt depodan ürün ve stokları merkeze çeker; öncesinde yedek alınır, onay kutusu zorunlu |
| `toggle_sales_stock_sync` | warehouse-home (depo 1) | Satış kanalı stok senkronunu açar/kapatır (`sync_stock_ready`) |
| `add_warehouse` | warehouses (kabuk) | Alt depo tanımlar (ad, ülke, telefon, kısa kod, renk, adres) |
| `add_supplier` | kabuk, warehouse-home, purchases | Tedarikçi kartı oluşturur veya mevcut kartı depoya bağlar |
| `add_company` | kabuk, warehouse-home | Şirket kartı oluşturur/atar, ana depoya bağlar |
| `add_stock` | kabuk | Ürüne fiziksel veya drop stok adedi ekler (mal kabul notuyla) |
| `quick_update_inventory` | kabuk (tablodan hızlı düzenleme) | Tek ürün için fiyat + fiziki + drop stok kaydeder |
| `add_category` | kabuk, warehouse (stok modu) | Yeni kategori ekler |
| `bulk_update_inventory` | warehouse (mode=stock) | Seçili/filtrelenen/tüm katalog ürünlerinde stok ayarla/ekle/düş (fiziksel veya drop) |
| `update_product` | warehouse-product | Ürün kartı alanlarını kaydeder (başlıklar, fiyat, stok, EAN, SKU, kategori, özellikler) |
| `save_stock_pack_rule` | warehouse-product | Paket ürün kuralı (`is_pack`, `units_per_item`) |
| `save_product_platform_sku` | warehouse-product | Kanal başına platform SKU'su |
| `preview_stock_distribution` | stock-transfer | Depolara dağıtım önizlemesi (stok değiştirmez) |
| `save_category_visibility` | catalog-governance | Kategorinin hangi depolarda görüneceğini kaydeder |
| `archive_catalog` | catalog-governance | Seçilen ürün kartlarını görünümden arşivler (onay metni + yönetim PIN'i) |
| `bulk_products_preview` | bulk-products | CSV/Excel yüklemesini kontrol eder, kayıt değiştirmez (ardından uygulama adımı, görülmedi) |
| `bulk_products_download` (alan adı farklı; `erp_action` değil) | bulk-products | Şablon/CSV dışa aktarma |

Not: `duplicate-products` birleştirme, stok dağıtım kaydı, sayım kaydı, `purchases` belge/mal kabul ve ürün giriş sihirbazının gönderen formlarında `erp_action` değeri görülmedi (ya JS ile `/api/*` üzerinden çalışıyor ya da açılmayan adımlarda).

## Sorunlar ve yeniden tasarım notları

1. **Aşırı yavaş / takılan listeler (warehouse, stock-movements, critical-physical-stock, missing-product-images, problem-products, duplicate-products).** Sayfa önce boş kabuk, sonra ikinci istek; birkaçında "yükleniyor…" 12–16 sn sonra hâlâ sürüyor, stock-movements "Liste zamanında yanıt vermedi" diyor. `warehouse-product` ve `catalog-governance` bir denemede 504 verdi. Tasarım: sunucu tarafı sayfalama/önbellek, iskelet yükleme, hata durumunda otomatik tekrar.
2. **İki aşamalı ürün listesi (`warehouse`).** Sayfa kendi kendine `load_list=1` URL'sine yönleniyor (adres çubuğu değişiyor, geri düğmesi karışık). Kullanıcıya "Ürün listesini gör" düğmesi ve "Yeniden dene" aynı anda gösteriliyor. Tek istekli, kısmi (önce 1. sayfa) yükleme tercih edilir.
3. **"Pool/havuz" isim karmaşası.** `pool` sayfası "Ürün havuzu · JTL Kaynak Ürünleri" (2.466), `products` "Kaynak Ürün Kataloğu" (232.526), `warehouse` listesi "Ürün havuzu", genel bakış "Wawi ürün havuzu" (232.525) ve `ebay-pool`, `shopify-pool`, `ozon-pool` ayrı sayfalar. Katalog sayısı iki yerde 232.525 / 232.526 (1 fark).
4. **Aynı ürün için üç ayrı detay sayfası:** `product-detail` (JTL kaynak kaydı, salt okunur), `warehouse-product` (düzenlenebilir depo kartı), listedeki satır içi düzenleyiciler (başlık, fiyat, stok, kategori). `products` listesinde her satırda hem "Detay" hem "Ürün detayı / Güncelle" var, ikincisinde depo parametresi yok.
5. **Stok kavramları birbirine karışıyor.** Aynı ekranda Fiziki, Drop, Sanal, tedarikçi API stoğu ve paket stoğu var. Örnekler: Asterbuy drop satırında "Asterbuy alış stok sayısı 1.069" iken Wawi depo tablosunda "Fiziki stok 100" ve fiyat 16,90 €; B2BUhren satırında tedarikçi stoğu 5 ve Wawi fiziki stok 5 (aynı sayı, hangisinin kaynağı olduğu belli değil); dropshipping sayfası aynı ürün için "Fiziki Bilinmiyor · Drop 0". Detay sayfasında "Wawi fiziki stok: Sayım yok" yanında ayrı bir kutuda "Fiziki stok: 119". Yeniden tasarımda tek bir "stok kimliği" şeması (kaynak + güven düzeyi + zaman) gerekir.
6. **Sayı tutarsızlıkları.** Depo 1 alt depo kartları: Almanya 122.902 / Hollanda 7.689 / Technowelt 4.062; depo listesi 122.934 / 7.926 / 4.579. `products` stok filtresi: Tüm Stoklar 219.647 + katalog 232.526; `stock_filter` toplamları (Stokta 6.022 + Stok Yok 213.625 = 219.647) katalogdan 12.879 az. Depo 1 alt depo özetinde dört depodan yalnız İstanbul eşleştirme sayıları gösterilmiş.
7. **Eşitleme ve sağlık göstergeleri kırmızı:** tüm depolarda "Güncelleme tamamlanamadı"; `physical-stock-check` "Stok işleyicisi / 10 dk kontrolü gecikmiş"; 106 açık sipariş-stok işlemi; 592 düzeltme satırı; Asterbuy stok kontrolü Plesk görevi son başarılı 2026-10-11. Genel bakış satış özeti ve "En çok satılan" kartları "Yüklenemedi".
8. **Veri kalitesi:** 912 "aktif ilan yok" satırı fiziki stok kontrolünde; `physical_missing_ean` listesi ve EAN'sız paket kartları (2x/4x/8x toner paketleri EAN'sız, çünkü pakete özel barkod yok); ürün başlığı 80 karakter eBay sınırını aşıyor (⚠ uyarısı pek çok satırda); `Kategorisiz` ürünler (`products` ilk satırları); `catalog-governance` kategori listesinde marka adları (AMEN, Armani, ALPINA) ve etiketler kategori olarak tutuluyor (411 kategori; `products` sayfasında 1.139 kategori / 3.979 marka; iki sayım farklı). Kategori adları karışık dil (TR/DE: "Erkek Parfüm", "Parfum & Düfte > Herren").
9. **Varyant modeli:** listede "Varyantları göster · N seçenek", ürün formunda ayrıca "Varyantlar" sekmesi ve "+ Varyant ekle"; yeni ürün sihirbazında "Varyantsız | Varyantlı". Mükerrer ekranı "kayıtlı varyantları listeye almıyor". Paketler (2x, 4x, 8x, 10x) ayrı kart ya da `is_pack` ile mi tutuluyor net değil; ikisi de görüldü (paket kuralı + "4x Original ... 4er Pack" adlı ayrı kartlar).
10. **Çoklu EAN:** EAN 1, EAN 2, Depo EAN 3 (formda); stok kontrolde "EAN: x / y" iki barkod; mükerrer eşleştirmede "EAN eşitliği barkod doğruluğunu kanıtlamaz" uyarısı. Barkod arama hangi alanlara bakıyor listede belirtilmiyor (sayım ekranında SKU/EAN1/EAN2).
11. **Yönetim PIN'i:** birleştirme ve katalog arşivi `emergency_pin` istiyor (giriş PIN'inden ayrı) ve metin onayı; ancak toplu stok düzenleme ("Tüm katalog (8.985)" kapsamı) için aynı korumanın olup olmadığı görülmedi.
12. **Çoklu silme/geri alma riski:** mükerrer birleştirmede "geri alma düğmesi yoktur"; katalog arşivi "görünümden kaldırır" (silmez). Arşiv ön izlemesi 232.526 kartın tümünü arşiv kapsamında sayıyor; filtre yanlış bırakılırsa etki büyük (tahmin).
13. **Menü/sayfa yapısı:** `warehouse` sayfasının iki ayrı mod (Ürün havuzu / Stok yönetimi) ve 15+ `product_view` değeri aynı URL'de; "Stok yönetimi" farklı bir tablo düzenine geçiyor (depo sütunları) ve filtre formu farklı (supplier, category, stock). Aynı listenin iki ayrı filtre dili var.
14. **Dosya/içe aktarma sınırları:** Excel dışa aktarma büyük envanterde kapalı (yalnız CSV); toplu yükleme "depolar 20'şer kayıt yüklenir" ifadesi belirsiz.
15. **Türkiye kataloğu ayrı:** her depo liste sayfasının üstünde "TR MARKET ÜRÜNLERİ ↗ · Türkiye kataloğu ayrı tutulur; Trendyol stokları fiziki sayımla karışmaz" bandı var, ayrı `tr-market-products` sayfasına gidiyor (bu çalışmada açılmadı).
16. **Dil:** arayüz TR; ürün başlıkları DE/NL; durum etiketlerinde İngilizce karışımı ("Stok Alert", "Default price", "Drop", "Wawi").
17. **Kişisel veri:** `warehouse-home` şirket kartlarında şirket sahibi gibi görünen kişi adı, adres, telefon, e-posta ve vergi no açıkta (oturum açan her yetkili görüyor); yeniden tasarımda maskeleme/rol bazlı gösterim düşünülmeli.

## Görülemeyenler

- **`stock-movements`:** satırlar yüklenemedi ("Liste zamanında yanıt vermedi"); sütun başlıkları ve yardım metni görüldü, hareket türü seçenekleri (Hareket açılır listesi) okunamadı.
- **`critical-physical-stock`, `missing-product-images`:** liste "yükleniyor" durumunda kaldı (13-14 sn); satır düzeni görülemedi.
- **`problem-products`:** "Notlar yükleniyor…" ekranında kaldı; "Sorun" (reason) seçenekleri boş geldi; satır görülemedi.
- **`duplicate-products`:** aday listesi yüklenmedi; birleştirme diyaloğu yalnız DOM metninden okundu.
- **`warehouse` varsayılan listesi, depo 2 (Almanya, 123 bin ürün):** 16 sn içinde açılmadı (yönlendirme gerçekleşmedi); depo 2882 ve 1 üzerinden denendi. Depo 2'de yalnız `product_view=drop_asterbuy` ve `drop_b2buhren` açıldı.
- **Açılmayan `product_view` değerleri:** `recent`, `physical_rejected`, `physical_unknown`, `physical_available`, `drop_watchimport`, `drop_bueroarena`, `active_kaufland`, `active_metro`, `active_shopify`; `mode=stock&stock=physical_uncounted | physical_depleted`.
- **Açılmayan sayfalar:** `inventory` (menü bağlantısı), `tr-market-products`, `send-*`, `*-pool` (kapsam dışı), `purchases&supplier=...` alt görünümleri (alış belgesi, mal kabul, belge yükleme formları), `warehouse&settings=1`.
- **Gönderen form `erp_action` değerleri:** ürün giriş sihirbazı kaydı, sayım kaydı (`Sayımı kaydet`), mükerrer birleştirme, stok dağıtım kaydı, Asterbuy paneli, satın alma belgeleri; bunlar DOM'da `erp_action` taşımıyor ya da adım açılmadığı için görülemedi.
- **Satırların kaydırma/sonraki sayfa içerikleri:** her listede yalnız ilk sayfa okundu.
- **Güvenlik notu:** hiçbir düğmeye basılmadı, form gönderilmedi, `/api/` veya `import|delete|sync|send=|export|download` adresi elle açılmadı. `warehouse` sayfası kendi kendine `load_list=1` adresine yönlendi ve arka planda `/api/*` isteklerini sayfa kendisi yaptı (menu-counts, product-pool-count, operational-notes, session-status, returns); bunlar tarayıcıdaki sayfanın normal işleyişi, ben tetiklemedim.
