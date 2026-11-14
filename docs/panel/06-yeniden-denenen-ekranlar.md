# WawiERP Panel — Yeniden Denenen Ekranlar (5. tur)

Tarih: 2026-11-14 · Yöntem: yalnız okuma, tek sekme, her sayfa `navigate` ile açıldı ve ~10 sn aralıklarla DOM okundu. Hiçbir düğmeye basılmadı, form gönderilmedi. Önceki turlarda (01-04) yüklenmeyen listeler hedeflendi.

Genel not: bu denemede sunucu önceki turlara göre belirgin biçimde hızlıydı. Hiçbir sayfada 504/5xx görülmedi. Tek gerçek hata `duplicate-products` listesinde (aşağıda).

## Özet

Denenen: 26 adres (ekran/sekme). Liste veya açık boş durum gelen: 23. Hata durumu: 1 (`duplicate-products`). Hesap seçilmeden liste vermeyen (beklenen davranış): 2 (`metro` pool/failed). 90 sn sınırına takılan ekran yok.

Süre sütunu: "sayfa" = ilk HTML yanıtı, "liste isteği" = listeyi dolduran arka plan isteği (tarayıcının kaydettiği süre). Sonucu okuduğum an ≥10 sn sonrasıydı, ama `menu-counts` ve liste istekleri 10 sn'den önce bitmiş olabilir; "≤10 sn" yazılanlar için daha ince ölçüm yok.

| Ekran | Sonuç | Süre | Bekleyen / en yavaş istek |
|---|---|---|---|
| `stock-movements` (depo 1) | Yüklendi, 23 hareket / 3 sayfa | sayfa 5,7 sn | `menu-counts.php?view=worklists` 6,7 sn |
| `critical-physical-stock` | Yüklendi, 25.061 kayıt / 1.003 sayfa | liste isteği 5,0 sn | `menu-counts.php` 15,5 sn |
| `problem-products` | Yüklendi, 5 açık kayıt | sayfa 0,5 sn | yok |
| `duplicate-products` (depo 1) | **Hata**: `merge_database_busy` (2 deneme) | 8,2 sn ve 9,2 sn sonra hata | `duplicate-products.php?kind=all&q=&p=1` |
| `missing-product-images` | Yüklendi, 43.921 kayıt / 1.757 sayfa | liste isteği 7,4 sn | `menu-counts.php` 13,3 sn |
| `warehouse` varsayılan, depo 2 | Yüklendi (40 ürün/sayfa) | liste isteği 2,6 sn | `menu-counts.php` 9,4 sn |
| `/allordersfilter` | Yüklendi, 33.600 sipariş / 1.344 sayfa | **sayfa 30,2 sn** (sunucu tarafı render) | HTML yanıtın kendisi |
| `warehouse-orders&view=customers` | Yüklendi, 34.510 kayıt / 691 sayfa | sayfa 12,4 sn | `menu-counts.php` 9,1 sn |
| `problem-orders&status=resolved` | Yüklendi, 25 kayıt | sayfa 0,3 sn | yok |
| `send-kaufland` catalog=products | Liste yüklendi (8.786 sayfa × 25); satır içi "Mağaza bilgileri yükleniyor…" 45 sn sonra hâlâ duruyor | liste isteği 13,1 sn | `kaufland-publications.php?action=products` |
| `send-kaufland` catalog=issues | Yüklendi, açık boş durum "0 ürün" | ≤10 sn | `menu-counts.php` 12,4 sn |
| `shopify-pool` | Yüklendi, 499 ürün / 20 sayfa | liste isteği 8,9 sn | `shopify-products.php?view=pool` |
| `send-shopify` | Yüklendi, 121.008 ürün / 4.841 sayfa | liste isteği 9,0 sn | `shopify-products.php?view=send` |
| `ozon-pool` | Yüklendi, 618 ürün / 25 sayfa | ≤10 sn (sunucu tarafı render) | `menu-counts.php` 14,5 sn |
| `send-ozon` | Yüklendi, 8.786 sayfa × 25 | liste isteği 11,2 sn | `ozon-products.php?action=products` |
| `mixoutlet-payments` | Yüklendi, 281 sipariş / 12 sayfa | `mixoutlet-payments.php` 1,6 sn | yok |
| `channel-worklist` kind=images | Yüklendi, 44 kayıt / 2 sayfa | liste isteği 12,3 sn | `channel-worklist.php` |
| `company-home` OTTO `otto_tab=orders` | Yüklendi, 1.337 kayıt / 54 sayfa | sayfa 1,2 sn, ≤10 sn | `menu-counts.php` 10,1 sn |
| `company-home` OTTO `otto_tab=history` | Yüklendi, 100 satır gösteriliyor | sayfa 1,0 sn | yok |
| `company-home` Amazon `amazon_tab=products` | Yüklendi, 5.793 ürün / 232 sayfa | sayfa 1,6 sn | `menu-counts.php` 9,0 sn |
| `metro&view=pool` | Hesap seçilmeden liste yok (beklenen) | 0,5 sn | — |
| `metro&view=failed` | Hesap seçilmeden liste yok (beklenen) | 0,3 sn | — |
| `customers-master` | Yüklendi, 48 cari / 2 sayfa | 0,5 sn | yok |
| `customers-master&view=wholesale&records=draft` | Yüklendi, 5 taslak | 0,4 sn | yok |
| `customers-master&view=wholesale&records=issued` | Yüklendi, 1 faturalanmış kayıt | 0,4 sn | yok |
| `invoices&view=orders&warehouse=2` | Yüklendi, 1.716 kayıt / 69 sayfa | sayfa 0,6 sn | `operational-notes.php?action=count` 4,8 sn |

Not: `metro` (2 satır) hesap seçimi gerektirdiği için liste vermedi; `stock-movements` depo 2 denemesi gerekmedi (depo 1 dolu geldi).

## Ekranlar

### stock-movements (depo 1)
- **Yüklendi.** Sayfa 5,7 sn.
- Amaç: "Fiziki stok geçmişi" — ürünlerin önceki ve sonraki depo stokları.
- URL parametreleri (sayfa kendi ekledi): `q`, `period` (last7 vb.), `from`, `to`, `page_size` (10 / 30 / 50), `warehouses[]`, `platforms`, `channels`, `categories`, `directions`, `p`.
- Süzgeç grupları: 1 · Ürün (ara, kategori), 2 · Tarih (Bugün, Son 7 gün, Son 30 gün, Bu hafta, Bu ay, Tarih aralığı), 3 · Depo ve hareket kaynağı (depo çoklu seçim; Hareket: Tümü / Giriş (+) / Çıkış (−); şirket, pazaryeri/platform, mağaza/hesap, "Kanal kaydı olmayan hareketler"; "Son 10 / 30 / 50 hareket").
- Sütunlar: Ürün / kategori · Tarih / işlem · Depo / kaynak · Fiziki stok önce → sonra · Değişim · Geçmiş.
- Özet şeridi: "23 hareket · 11 ürün", "Giriş +302", "Çıkış −267", "Net 35" (depo 1, son 7 gün). 10 hareket/sayfa, 3 sayfa.
- İşlem türleri (görülen): "Stok düzeltme", "Sipariş çıkışı". Kaynak: "Diğer / kanal kaydı yok" (stok düzeltmede) ya da kanal adı (sipariş çıkışında).
- Dikkat çeken: ilk sayfadaki 10 hareketten 6'sı toplu sıfırlama niteliğinde "Stok düzeltme" (ör. 124 → 0, 115 → 0, 10 → 0); sebep kaydı satırda görünmüyor (tahmin: sayım düzeltmesi ya da elle sıfırlama).
- Eylemler: "Geçmiş" (satır düğmesi), "Not / Sorun ekle", "Temizle", "Yenile". Sayfaya özgü `erp_action` yok (yalnız global modal formlar).
- Yardım metni "Bu liste neyi gösterir?" sayfa altında.

### critical-physical-stock
- **Yüklendi.** Liste isteği (`critical-physical-stock.php`) 5,0 sn.
- Amaç: "Kritik Seviyeli Fiziki Ürünler" — fiziki stok 5 ve altı, sıfır ve negatif dahil. Yalnız sayımı bilinen fiziki ürünler; drop ve tedarikçi ürünleri hariç; depo stokları toplanmaz.
- Parametreler: `filters=1`, `q`, `sort` (stock_asc / stock_desc / ad), `page_size` (25 / 50 / 100), `p`. Süzgeçler: Depolar (5 depo), Firmalar (Ivobuyshop, Kaufplus, Lady Empire GmbH, Novada Shops, Perasshop, Technowelt, Woida; "firma süzgeci kayıtlı pazaryeri bağlantısına göre uygulanır"). Son süzgeçler tarayıcıda saklanır.
- Sütunlar: Ürün · Depo · Fiziki stok · Pazaryeri bağlantıları.
- Sayım: "25061 ürün / depo kaydı · Son okuma: 14.11.2026 15:21 UTC", sayfa 1 / 1.003.
- Pazaryeri rozetleri: "Yayın doğrulanmadı"; satır etiketi "Metro / eBay / Kaufland bağlantısı yok".
- **Kusur 1:** sayfada görünen "Fiziki stok … adet" hücresindeki sayı kutusu boş ve devre dışı (`disabled`); gerçek değer gizli bir `strong.critical-quantity` öğesinde (`hidden`). Sayfa 18 sn bekletildiğinde de dolmadı, yani kullanıcı sayıyı ekranda göremiyor (tahmin: `physical-stock-sync.js` bu sayfada sayıyı doldurmuyor).
- **Kusur 2:** ilk sayfa artan stok sırasında; gizli değerler −73'ten −7'ye kadar **negatif** (ilk 25 satır tamamı negatif). Negatif fiziki stok kayıtları gerçek. Depolar: Hollanda ve Almanya Warehouse.
- Eylemler: "Yenile", "Ara", "Filtreleri temizle", "Not / Sorun ekle", "Kaydet" (satır içi sayım düzenleyicisi, gizli), "Önceki / Sonraki". Sayfaya özgü `erp_action` yok. Bağlantı: "Sorunlu Fiziki Ürünler" (problem listesi).

### problem-products
- **Yüklendi** (0,5 sn). Önceki turda "Notlar yükleniyor…" ekranında kalmıştı; bu sefer notlar da geldi.
- Amaç: ürünlere eklenmiş operasyonel notlar/sorunların listesi.
- Süzgeçler (`select`): `warehouse` (0 = yetkili tüm depolar, 1, 2, 3, 2881, 2882), `status` (open / resolved / all; ekranda Açık, Çözüldü, Tümü), `reason`, `q`.
- **"Sorun" (reason) seçenekleri (önceki turda boştu):** missing_product (Ürün eksik), wrong_product (Yanlış ürün), damaged (Hasarlı ürün), stock_mismatch (Stok farkı), missing_address (Adres eksik / hatalı), invoice_error (Fatura hatası), shipping_error (Kargo / etiket sorunu), product_data (Ürün bilgisi / görsel), payment (Ödeme kontrolü), other (Diğer).
- Kayıt kartı alanları: ürün adı · depo · SKU · "Ürünü aç →" · "Notu aç / Düzenle" · durum rozeti (Açık) · sorun türü rozeti(leri) · serbest not metni · tarih ve "PIN ••nn" (notu yazanın PIN'inin son iki hanesi).
- Sayım: "5 kayıt gösteriliyor", hepsi Almanya Warehouse, hepsi "Açık". Sayfalama "Önceki / Sayfa 1 / Sonraki".
- **Gizlilik bulgusu:** notlar serbest metin; bir kayıtta son müşteriye ait ad ve adres alanları elle yapıştırılmış (bu belgeye yazılmadı). Ayrıca kartlarda PIN'in son iki hanesi görünüyor.
- Eylemler: "Göster / Yenile", "Notu aç / Düzenle". `erp_action` yok.

### duplicate-products (depo 1)
- **Hata, iki denemede de.** Sayfa kabuğu hızlı geldi; aday listesi isteği (`duplicate-products.php?kind=all&q=&p=1`) 8,2 sn ve 9,2 sn sonra hata ile döndü. Ekranda şu mesaj: ürün veya stok kayıtlarının başka bir işlem tarafından kullanılıyor ya da sorgu süre sınırına ulaştığı, "bu denemede birleştirme kaydedilmedi", `[merge_database_busy]` kodu ve bir kayıt (log) kimliği.
- **Kusur:** mesaj birleştirme işlemi için yazılmış; oysa bu bir liste okuma hatası. Kullanıcı yanlış anlayabilir (tahmin: aynı hata bileşeni listede de kullanılıyor).
- Görülen yapı: "Tek ürün · çoklu platform"; "Eşleşme türü" süzgeci (Tümü / Aynı EAN / GTIN / Olası · benzer isim), "İsim / SKU / EAN" arama, "0 ürün seçildi", "Tek üründe birleştir", "Seçimi temizle", sayfalama; birleştirme diyaloğu düğmeleri "Vazgeç", "Önizlemeyi yenile", "Birleştir ve kaydet".
- Kurallar (ekrandaki yardım): yalnız görünür, birleştirilmemiş ürünler; kayıtlı varyantlar listeye alınmaz; farklı ml/paket/renk/model/yoğunluk ayrı varyant sayılır; aynı ürünün 2–20 kartı seçilebilir; stoklar otomatik toplanmaz, çelişen depo stokları önizlemede seçilir; platform ilanları silinmez.
- Aday satır içeriği hâlâ görülemedi.

### missing-product-images
- **Yüklendi.** Liste isteği (`missing-product-images.php`) 7,4 sn.
- Amaç: "Wawi · Fotoğraf kontrolü" — Wawi havuzundaki eksik ve sorunlu fotoğraflar.
- Parametreler (sayfa kendi ekledi): `filters=1`, `q`, `sort` (name / name_desc), `family` (all, Parfüm, Toner), `reason` (all, Fotoğrafı olmayan, Sorunlu / düşük kaliteli, Kaynağı okunamayan), `page_size` (25 / 50 / 100), `p`, `image_scope=all`. Depo ve firma süzgeçleri düğme gruplarıdır. URL'deki `warehouse=1` göz ardı edildi; ilk sayfada Almanya ve Hollanda depoları göründü.
- Sütunlar: Ürün · Depo bağlantısı · Neden / yapılacak işlem · İşlem.
- Sayım: "43921 görsel kontrolü gereken ürün · Son okuma 14.11.2026 15:22 UTC", sayfa 1 / 1.757.
- Sebep değerleri (ilk sayfada 25 satır): "Düşük çözünürlüklü fotoğraf" (12; özgün fotoğraf boyutu px olarak yazılı), "Görsel kaynağı okunamadı" (8), "Fotoğraf yok / temsili görsel" (5). Kural: uzun kenarı 500 px'ten küçük ya da kaynağı açılamayan = "sorunlu".
- Eylem: satır düğmesi "Görsel ekle / düzelt" (ürün kartına gider; "Fiyat, stok ve platform ilanları bu ekrandan değiştirilmez"), "Not / Sorun ekle", "Yenile", "Ara", "Filtreleri temizle". `erp_action` yok.

### warehouse varsayılan listesi, depo 2
- **Yüklendi.** `/?page=warehouse&warehouse=2` kendi kendine `&summary_warehouse=2&load_list=1&pool_warehouse=2` adresine yönlendi (sayfanın kendi işleyişi; ben açmadım, yalnız okudum). Liste isteği 2,6 sn.
- Amaç: ürün havuzu, "Depo stoklarını düzenle". Üstte "TR MARKET ÜRÜNLERİ" bağlantısı.
- Süzgeç alanları: Ürün ara, Kategori, Şirketler (Ivobuyshop, Kaufplus, Lady Empire GmbH, Novada Shops, Stockist24, Woida), Pazaryerleri / platformlar (eBay, Kaufland, Metro, Amazon, Shopify, webshop, XML), Mağazalar / hesaplar (16+), Stok türü (`stock_kinds[]`: all / physical / dropship), Stok durumu (`stocks[]`: all / available / empty / unknown / negative / low = Tümü, Stok var, Stok 0, Sayım yok, Negatif, Kritik), Sıralama (`sort`: relevance, name, name_desc, stock_desc, stock_asc, drop_desc, drop_asc, sales_desc = "En çok satan · 30 gün", newest = "Son güncellenen"), `pool_warehouses[]`, `pool_platforms[]`; "Seçimler otomatik uygulanır".
- Sayım: 40 ürün/sayfa, sayfa numaraları "1 | 2 …"; "Sayılar ve filtre seçenekleri yükleniyor…" satırı 20 sn sonra da duruyor; toplam sayı okunamadı.
- Satır alanları: Ürün / EAN / model · Fiyat ve depo stoğu (Wawi fiyatı, fiziki stok, tedarikçi) · Satış platformları / gönderimler. Rakip fiyat blokları (eBay, Kaufland, Metro, Otto) ve "BueroArena / Kosatec alış" tedarikçi fiyat/stok bloğu görüldü; mağaza satırlarında "Eski veri" rozeti.
- Eylemler: "Excel indir · Alan seç", "Ürün detayı / Güncelle", "Düzenle", "Fiyatları / stokları düzenle", `data-pool-quick-actions`, `data-product-detail-action`, "Yeniden dene". Sayfaya özgü `erp_action` yok.

### /allordersfilter
- **Yüklendi, sayfa 30,2 sn** (HTML yanıtının kendisi; arka plan isteği değil, sunucu tarafında üretiliyor). Önceki iki turda 504 idi.
- Amaç: "Avrupa satış arşivi — tüm Avrupa satışları" tek listede.
- Üst özet: filtrelenmiş ciro (para birimi başına: CZK, EUR, PLN, TRY, USD), "33.600 sipariş · 31.263 müşteri". Kartlar: Tüm satışlar 33.600; JTL bağlantılı 11.934 (Almanya 11.568, Hollanda 24); Shopify 1.210; Almanya 30.113; Hollanda 616. Platform dağılımı: JTL-Shop 3.925, Shopify 1.210, eBay 10.145, Amazon 3.902, Kaufland 10.014, Metro 517, web mağazaları 2.317, diğer 8, OTTO 1.337. "JTL Avrupa ayrımı": JTL Almanya 11.568, JTL Hollanda 24.
- Süzgeç alanları: tarih aralığı (`from`, `to`) + saat dilimi (`timezone`: Europe/Berlin / UTC), depo, şirket (11 şirket), kaynak (`source`: all, jtl, xml, jtl-shop, shopify, ebay, amazon, dealclub, kaufland, metro, webshop, ozon, trendyol, n11, otto); liste süzgeçleri `all_orders_q`, `all_orders_payment`, `all_orders_product_q`, `all_orders_source`, `all_orders_country` (all / de / nl), `all_orders_from/to`, `all_orders_status` (all / new / processing / complete / cancelled), `all_orders_page_size` (25 / 50).
- Ödeme değerleri: paid, card_paid, bank, bank_paid, bank_unconfirmed, pending, refunded, partial_refund, partial_paid, void, failed, expired.
- Sayfa 1/1.344 (25/sayfa). Sütunlar: Sipariş / kaynak · Müşteri ve telefon · Teslimat · Ürün · Durum · Tutar.
- İlk sayfadaki rozetler: Yeni, İşleniyor, Ödendi, Kartla ödendi, "Fiziki depo siparişi", "Announced" (İngilizce, çevrilmemiş). Kaynak dağılımı ilk sayfada: Shopify 14, OTTO 5, eBay 3, Kaufland 3. Satır içi durum alanı kargo bilgisi taşıyor: "Etiket yok", "DHL seç", "Kargo / etiket → DHL · Bağlantı …".
- "Ürün sıralaması" bölümü: En çok satan / En çok iade; İlk 5 / 10 / 20 / 50 / 100. Özet: gösterilen ürün 5, sipariş eşleşmesi 2.036, satış adedi 23.939, iade adedi 20, 5 ürün sipariş cirosu 203.751 EUR. Örnek: bir tek siparişte 20.760 adet olarak görünen "HEMA Einwegkamera" (SKU HEMA.CAM, 1 sipariş) — **veri kusuru adayı** (tahmin: toplu/B2B satış ya da birim hatası).
- Uyarılar: "Shopify geçmişi sınırlı": Shopify API izni son 60 günü açıyor; tam geçmiş için `read_all_orders` izni gerekiyor (5 Shopify mağazası için ayrı ayrı yazılmış: Parfumverkoop.nl, EmpireParfum.de, Mixoutlet.de, Parfymonline.de vb.). "Kaynak kapsamı kısmi olabilir" uyarısı.
- Eylemler: `erp_action` = `all_orders_export` ("Filtrelenmiş Excel'i indir", "Excel dışa aktar"; tetiklenmedi); `data-pack-action` = `picking`, `invoices`; satır düğmeleri "DHL'de takip et", "Etiket yazdır", "Harici kargo / Takip numarası ekle", "PDF indir", "Ağırlık / ayarlar", "Fatura yazdır", "Faturayı düzenle", "Fatura gönder", "İade faturası", "Not / Sorun ekle".
- Sayfada iletişim bilgisi (ad, telefon, e-posta, adres) satırda açık görünüyor; bu belgeye yazılmadı.

### warehouse-orders (`&view=customers`)
- **Yüklendi.** Sayfa 12,4 sn. Önceki turda 504 idi.
- Amaç: depo ağı > depo > "Istanbul Warehouse müşterileri" (CRM görünümü).
- Üst sekmeler (depo özeti, bağlantı olarak): Ürünler 8.985 (`view=products`), Siparişler 33.600 (`view=orders`), Stoklar 13.797 toplam stok (`view=stock&stock_kind=…`), Müşteriler 34.510 (`view=customers`).
- Süzgeçler: tarih (`from`, `to`), depo, şirket, kaynak, saat dilimi; "Depo / şirket / satış kanalı filtresi" için üç ayrı kenar listesi (`scope_company_*`, `scope_channel_*`, `legacy_channel_*`, her biri kendi arama kutusu ve sayfalaması); müşteri arama `customer_q`.
- Sütunlar: Müşteri · İletişim · Konum · Satış kanalı · Şirket · Son senkron. 50 kayıt/sayfa, 691 sayfa.
- Görülen değerler: şirket sütunu "Bireysel" (ilk sayfada hepsi); kanal örnekleri "Amazon · 3DPLady", "Kaufland · Lady Empire", "Metro.de · Lady Empire", "eBay · 3DPLady".
- **Kusurlar:** (1) birçok satırda ad alanı "_" veya "-" yer tutucusu; (2) e-posta alanında "E-posta yok / Telefon yok" ve silinmiş müşteriler için "…@Deleted" biçimli yer tutucu; (3) pazaryeri vekil e-postaları (kaufland-marktplatz / marketplace.amazon) iletişim olarak listeleniyor; (4) 34.510 müşteri sayısı 33.600 sipariş sayısından büyük, ve Istanbul deposu "Siparişler 33.600" gösteriyor — bu rakam `allordersfilter` toplamıyla aynı, yani depo süzgeci rakamları daraltmıyor (tahmin: depo özeti tüm ağı sayıyor).
- Eylem: yalnız "Ara"; `erp_action` yok. "Excel dışa aktar" bağlantısı üstte.

### problem-orders `&status=resolved`
- **Yüklendi** (0,3 sn). Önceki turda ~10 sn'de dolmamıştı.
- Başlık: "Çözülen sipariş sorunları" + "Açık sorunlar" bağlantısı. Ekran notu: "Konuşmalar çözüldükten sonra 10 gün saklanır."
- Süzgeçler: `warehouse` (0 / 1 / 2 / 3 / 2881 / 2882), `reason` (problem-products ile aynı 10 değer), `q`. Durum seçici yok (bu görünüm yalnız çözülmüşleri gösteriyor).
- Sayım: "25 kayıt gösteriliyor", hepsi "Çözüldü", sayfa 1.
- Kart alanları: sipariş (no) · "şirket · kanal · mağaza · depo" · "Siparişi aç →" · "Konuşmayı aç" · ürün satırı (başlık, dahili SKU, adet, tutar EUR) · durum "Çözüldü" · PIN son iki hane · tarih · serbest not.
- Dağılım (ilk 25): Woida · eBay.de çoğunlukta; Lady Empire GmbH ve Woida · Metro.de ve Lady Empire · Shopify'dan birer kayıt (regex ile sayıldı, yaklaşık).
- **Yeni sayfa türü:** "Siparişi aç →" bağlantısı `?page=order-ebay-detail&warehouse=2&order_channel=5075&order=…` adresine gidiyor (eBay sipariş ayrıntısı). Önceki belgelerde sipariş ayrıntısı için `load_list` içeren adres yazılmıştı; bu bağlantı `load_list` içermiyor. Açılmadı.
- Eylem: "Göster / Yenile", "Konuşmayı aç". `erp_action` yok.

### send-kaufland `catalog=products` (Woida · Kaufland Connect · Almanya Warehouse, hesap 26)
- **Liste yüklendi**, `kaufland-publications.php?action=products` 13,1 sn. Önceki turda zaman aşımı olmuştu.
- Amaç: "Wawi ürün havuzu / Kaufland'a gönder". Hedef hesap seçici ("Hesap seçin": 0 ya da 26). Hesap işleyişi şeridi: "Sipariş alımı: Çalışıyor · son kayıt 14.11.2026 15:23 UTC".
- Süzgeçler: Ürün ara, Kategori (1.107 seçenek, sayılı), "Hedef depo fiziki stoğu" (Tüm ürünler, Stok var (>0), Stok yok (≤0), Stok bilinmiyor), Sıralama (Standart, İsim A–Z/Z–A, Stok çok→az / az→çok, Fiyat düşük→yüksek / yüksek→düşük), Etiket (Parfüm, Saatler, Toner, Mürekkep, Kozmetik, Oda kokusu, Takı, Elektronik, Giyim), "Filtreler +". İstek parametreleri: `q, listing, category, tag, stock, sort, ean, brand, model, min, max, status, provider, catalog, issue_kind, page`.
- Sayım: sayfa 1 / 8.786 (25 satır `ks-row`). Satır alanları: ürün başlığı · SKU · EAN · "Varyant · ayrı stok" · "Fiziksel: n · Drop: n · Sanal: n" · "Ürün detayı / Güncelle" · "Wawi fiyatını düzenle" · kategori yolu · rakip fiyat bölümü (eBay / Kaufland / Metro / Otto, "İlk fiyat taraması sırada") · "Alış fiyatı ekle".
- **Kusur:** 25 satırın tamamında "Mağaza bilgileri yükleniyor…" yazısı ~45 sn sonra da duruyor; bu sırada ağ listesinde bekleyen istek yok, tüm yanıtlar 200 (tahmin: bu alan başka bir tetikleyici bekliyor ya da JS dolduramıyor).
- Eylemler (DOM): düğmeler "Kaufland'a gönder", "Kayıtlı kaynaklarda eksikleri ara", "Doğrulanmış boş alanları ürüne kaydet", "Ürüne kaydet", "Kaydet ve ürün bilgilerini Kaufland'a gönder", "Kaydet ve Kaufland'da güncelle", "Durumu kontrol et", "Teklifi hazırla", "Ürün gönder", "Düzenle"; `data-action-dialog`, `data-action-close`, `data-action-feedback`. Gönderim diyaloğunda alanlar: `id_warehouse`, `id_shipping_group`, `condition` (6 seçenek), `vat_indicator` (3 seçenek), `category`. `erp_action` yok (yazma JS ile).

### send-kaufland `catalog=issues`
- **Yüklendi**, açık boş durum: "0 ürün", sayfa "1 / 1".
- Başlık metni: "Son Kaufland kontrollerinde sorun bildirilen ürünler. Sebep, yapılacak işlem ve son kontrol zamanı aşağıdadır. Güncel durumu görmek için Uyarıları yenile düğmesine basın."
- Ek süzgeç "Sorun türü" (`all / missing / pending / blocked` = Tüm sorunlar, Eksik / reddedilen bilgi, Kaufland onayı bekleniyor, Satış engeli). Diğer süzgeçler products ile aynı.
- Not: boş olması "sorun yok" anlamına gelmeyebilir; sayfa son kontrol sonuçlarını gösteriyor ve yenileme düğmesi ayrı (tahmin).

### shopify-pool (Parfymonline.de · Shopify, hesap 28)
- **Yüklendi**, `shopify-products.php?view=pool` 8,9 sn; önce "Ürünler yükleniyor…", sonra liste.
- Başlık: "WOIDA-DE / DE-WH · Hesap 28 · Yerel ürün verileri". Başlık bölümleri: Shopify ürün havuzu, Ürün gönder / güncelle, Siparişler (—), Ticketlar (—).
- Parametreler: `q`, `p`, `page_size` (25), `sort` (key_asc). Süzgeçler: Ürün ara, "Fiziki stok ↕" sıralama, Ürün kaynağı (Tümü, Fiziki ürünler, Drop · Asterbuy, Drop · BueroArena / Kosatec, Drop · B2BUhren, Drop · Watchimport), EAN (Tümü, EAN olanlar, EAN olmayanlar), "Diğer filtreler".
- Sayım: "499 ürün", sayfa 1 / 20. Üst şerit: "Bu sayfada: 25 aktif · 0 satışta değil"; ayrıca "Shopify'daki güncel durumlar okunuyor…" satırı.
- Satır sütunları: Ürün · Fiziki stok ↕ · Fiyat · Ayrıntılar. Satır alanları: durum ("Aktif · satışta"), SKU, EAN, kaynak etiketi (ör. idealo), Fiziki / Drop / Shopify / "Gönderilecek" adetleri, Wawi ve Shopify fiyatları, alış fiyatı, rakip fiyat bloğu.
- Toplu eylemler (en fazla 20 seçili): "Stok güncelle", "Shopify fiyatı", "Seçimi kaldır"; diyalog: "Önizlemeyi hazırla", "Onayla ve uygula", "Sonucu kontrol et", "Onayla ve Shopify'a gönder", "İşlem durumunu kontrol et", "Eksik görseli tamamla"; `data-shopify-action-help`. `erp_action` yok. Altta "Gönderim ve EAN onay kayıtları".

### send-shopify
- **Yüklendi**, `shopify-products.php?view=send` 9,0 sn.
- Başlık aynı (hesap 28). Üç adımlı akış: "1 · Ürün / varyant seç → 2 · Canlı önizlemeyi kontrol et → 3 · Onayla · Shopify sonucunu gör". Başlıkta Siparişler 3, Ticketlar 0. Not: "Yerel kayıtlar gösteriliyor. Listeyi yenilemek Shopify'a ürün göndermez."
- Sayım: "121,008 ürün" (sayfada nokta yerine virgül biçimi; **biçim tutarsızlığı**, diğer sayfalar `121.008` yazar), sayfa 1 / 4.841. Üst şerit: "Bu sayfada: 0 aktif · 25 satışta değil".
- Sütunlar: Seç · Ürün · Wawi SKU / EAN · Shopify / JTL SKU · Eşleşme · Fiziksel / Dropship · Gönderilecek adet · Wawi / Shopify fiyatları · Durum · İşlem.
- Durum değerleri: "Satışta değil", "Henüz Shopify bağlantısı yok", "Gönderilmedi". Fiyat alanları: Wawi ana fiyatı, Shopify normal fiyatı, Stok işlemi fiyatı, Shopify son okunan fiyat ("Henüz okunmadı").
- Eylemler: "Shopify'a ürün ekle", "Shopify fiyatını düzenle", "Wawi fiyatını düzenle", "Seçilenlerin stoğunu güncelle", "Seçilenlerin Shopify fiyatını düzenle", "Alış fiyatı ekle", "Kaydet", "Yenile"; `data-product-detail-action`, `data-shopify-action-help`. `erp_action` yok.
- Gözlem: satır içi "Fiyat ve stok yükleniyor…" (ek depo ayrıntısı) 10 sn sonra da duruyor.

### ozon-pool (İthal Koku · Istanbul Warehouse · Ozon, hesap 11)
- **Yüklendi** (sunucu tarafı render; liste için arka plan isteği gerekmedi). Önceki turda ürün sayısı bile görülememişti.
- Başlık: "Ozon · Ürün havuzu". Hesap notu: "İthal Koku hesabı · USD · MAIN depo. Ürünler mevcut Wawi kartlarına bağlanır; eşleşmeyenler ayrı gösterilir. Fiziki stok değiştirilmez." **"Son tam aktarım: 2026-10-18 23:16 UTC · partial"** (yani 27 gün önce, "kısmi").
- Süzgeçler: Ürün ara, "Platform satış stoğu" (Tüm ürünler, Stok var (>0), Stok yok (≤0), Stok bilinmiyor), Sıralama (Standart, İsim A–Z/Z–A, Stok çok→az / az→çok, Fiyat düşük→yüksek / yüksek→düşük), Etiket (9 etiket), "Filtreler +".
- Sayım: "618 ürün", sayfa 1 / 25.
- Satır alanları: ürün başlığı (Rusça, Ozon başlığı), SKU (ITHALKOKU-…), "Ozon · Ürün sayfası ↗", durum rozeti "Satışta" / "Arşiv", Ozon'un Rusça durum metni ("Продается", "Готов к продаже · Нет на складе"), "Mevcut Wawi kartına bağlı", Ozon satış fiyatı (USD, ör. 99.00), "Ozon satış stoğu: n", arşivdekiler için "Arşivde: fiyat güncelleme kapalı.", satır düğmeleri "İçerik ve satış stoğu", "Wawi stok, mağazalar ve diğer işlemler", "Canlı fiyatı kontrol et", "Kaydet" (yeni fiyat USD).
- Eylemler: "Ozon ürünlerini yenile", "Filtrele", "Temizle", "Taslağımı geri getir", "Başlığı Rusçaya çevir", "Açıklamayı Rusçaya çevir", "Çeviriyi geri al", "Wawi metnini al", "Kaydet ve kontrol et", "Ozon'a gönder / güncelle", "Durumu kontrol et", "Stoğu Ozon'a gönder". `erp_action` yok.

### send-ozon
- **Yüklendi**, `ozon-products.php?action=products` 11,2 sn.
- Aynı başlık ve aynı hesap notu (son tam aktarım 2026-10-18 · partial). Süzgeç olarak tam Wawi havuzu kategori listesi (binlerce kategori sayılı: "Kategorisiz · 1179", "3D Druck · 671" vb.); parametreler `account=11`, `q`, `listing`, `category`, `tag`, `stock`, `sort`, `ean`, `brand`, `model`, `min`, `max` …
- Sayım: sayfa 1 / 8.786 (tüm Wawi havuzu, 25/sayfa). Satır: başlık · "SKU · EAN" · "İçerik ve satış stoğu" · "Wawi stok, mağazalar ve diğer işlemler".
- Eylemler `ozon-pool` ile aynı düğme kümesi. `erp_action` yok.

### mixoutlet-payments (MIXOUTLET.DE · LADY EMPIRE, hesap 18)
- **Yüklendi**, `mixoutlet-payments.php` 1,6 sn (iki çağrı). Önceki turda yüklenmemişti.
- Amaç: "Mollie ödemeleri" — sipariş, ödeme yöntemi ve tahsilat tek listede; yalnız Mollie üzerinden yapılan ödemeler (manuel Shopify banka havalesi ayrı menü).
- Uyarı bandı: veriler şu an Shopify'dan geliyor; doğrudan Mollie bağlantısı kurulmadığı için kart/SEPA ve gerçek ödeyen bilgisi eksik olabilir. "Mollie'de aç ↗" bağlantısı.
- Özet kartları: Sipariş tutarı €20.733,88 · Tahsil edilen €20.790,88 · İade edilen €149,00 (seçili süzgeç için). **Tutarsızlık:** tahsil edilen, sipariş tutarından 57 EUR fazla görünüyor (tahmin: kargo/ek ücret ya da kısmi iade/tahsilat farkı).
- Süzgeçler: arama; `method` (creditcard, banktransfer, directdebit, paypal, klarna, ideal, applepay, bancontact, unknown = Yöntem bilgisi gelmeyen); `status` (paid, pending, authorized, partially_paid, partially_refunded, refunded, voided = Ödendi, Ödeme bekleniyor, Provizyon, Kısmen ödendi, Kısmen iade, İade edildi, Ödeme iptal); başlangıç / bitiş tarihi.
- Sayım: "281 sipariş", sayfa 1 / 12, 25 satır; "Son okuma: 2.11.2026 15:41 · Shopify izinli sipariş geçmişi" (**12 gün eski okuma damgası**, oysa en yeni siparişler 14.11 tarihli; tahmin: damga ayrı bir "tam tarama" zamanı).
- Sütunlar: Sipariş / tarih · Sipariş veren · Ödeyen · Neyle ödendi? · Sipariş tutarı · Tahsilat / iade · Durum. İlk sayfada "Ödeyen bilgisi iletilmedi", "Yöntem bilgisi gelmedi" ve alt etiket "Mollie - Klarna" / "Mollie - Cards"; durum "Ödendi".
- Dip not: tarihler Almanya saatidir; tahsilat sipariş için alınan ödemedir, Mollie'nin bankaya yaptığı aktarım değildir.
- Eylemler: "Ödemeleri yenile", "Filtrele", "Temizle". `erp_action` yok.

### channel-worklist `kind=images` (Woida · eBay.de, kanal 5075)
- **Yüklendi**, `channel-worklist.php` 12,3 sn.
- Başlık "Fotoğraf kontrolü · Seçili mağazanın Wawi kayıtları". Alt başlık: eBay.de · Woida · Almanya Warehouse; "44 kayıt · Son kontrol: 2026-11-14 15:28 UTC".
- Parametreler: `q`, `sort` (name / name_desc), `family` (Parfüm, Toner), `reason`, `page_size` (25 / 50 / 100), `p`, `filters=1`, `lang=tr`. Süzgeçler: Ürün türü, Görsel durumu (4 değer, `missing-product-images` ile aynı).
- Sütunlar: Ürün · Sorun / sebep · Yapılacak işlem. Görülen sebep: "Düşük çözünürlüklü fotoğraf" (ör. 93 × 140 px, 140 × 93 px, 140 × 140 px). Birçok satırda "SKU: — · EAN: —" (SKU ve EAN boş).
- Sayfa 1 / 2. Eylem: "Görsel ekle / düzelt", "Not / Sorun ekle", "Yenile", "Ara", "Filtreleri temizle". `erp_action` yok.

### company-home OTTO `otto_tab=orders` (Technowelt · OTTO · Almanya, hesap 30)
- **Yüklendi**, sayfa 1,2 sn (sunucu tarafı render + menü sayacı 10,1 sn).
- Sekmeler: Ürün havuzu, Ürün gönder / güncelle, Sorunlu Ürünler, Resimsiz ürünler, EAN'sız ürünler, Siparişler, İadeler, İşlem geçmişi; "Otto Partner Portal ↗".
- Durum süzgeci düğmeleri: Tümü, Hazırlanacak, Gönderildi, İptal. Arama "Ara / Suchen" (iki dilli etiketler: TR / DE).
- Kargo kontrol şeridi: "23 / 23 kontrol edildi · 4 kargo kaydı · 2 kontrol bekliyor", "Takip kontrolü · 17 kayıt kontrol bekliyor", alt bölümler "Oluşturulamayanlar", "Bugün oluşturulan PDF'ler", "Hazır PDF'ler".
- Sayım: "1337 kayıt · 1 / 54" (25/sayfa).
- Sütunlar: Sipariş / tarih · Müşteri / ürünler · Tutar · Durum · İşlem.
- Durum değerleri (ilk sayfa 25): "Hazırlanacak" 15, "Gönderildi" 6, "Henüz işlenemez" 3, "İptal" 1. Satır uyarıları: "Kargo kaydı kontrol edilmeli" (2); 6 kayıtta eski taşıyıcı **GLS** ve "Eski etiketin PDF'si alınamadı. Billbee'de oluşturulduysa oradan yeniden yazdırabilirsiniz." + "Billbee'den yazdır" (**Billbee: yeni, önceki belgelerde yok; eski sipariş/etiket sistemi, tahmin**); 7 satırda "İade etiketi" düğmesi. Müşteri bloğu: "Siparişte kayıtlı müşteri bilgisi yok" (OTTO siparişleri müşteri bilgisi taşımıyor).
- Eylemler: "Seçilenleri yeniden oluştur", "Son toplu işlem / devam", "Onay uyarısını yeniden göster", "Yeniden kontrol et", "Etiket yazdır", "PDF indir", "Toplama listesi", "Toplu fatura · PDF / e-posta", "Siparişi aç", "Fatura / PDF", "Ağırlık / ayarlar", "İade etiketi oluştur / PDF aç", "DHL'de takip et", "Bu sayfadakileri seç", "Seçimi temizle"; `data-pack-action`. Bir taslak diyaloğunda "Taslağı kaydet / Entwurf speichern", "Otto'ya gönder / An Otto senden", "Sonucu kontrol et / Ergebnis prüfen". `erp_action` yok.

### company-home OTTO `otto_tab=history`
- **Yüklendi**, sayfa 1,0 sn.
- Sütunlar: Tarih (UTC) · İşlem · Referans · Sonuç; her satırda "Ayrıntılar" düğmesi. Arama + "Yenile".
- Sayfada 100 satır (2026-11-07 18:17 ile 2026-11-14 14:05 UTC arası). **Kusur:** alt bilgi "0 kayıt · 1 / 1" yazıyor, oysa 100 satır listeli (sayaç yanlış/gecikmiş).
- İşlem türleri (100 satırda): `draft` 69, `publish` 8, `delivery_profile` 6, `toner_delivery` 6, `stock` 5, `shared_stock_zero` 3, `wawi_listing_origin` 2, `sync` 1.
- Sonuç değerleri: `saved` 69, `submitted` 16, `pending` 8, `verified` 2, `intent` 2, `confirmed` 2, `failed` 1. Aynı işlem için `intent → submitted → verified` üçlüsü ve `publish → pending` görülüyor (yani yayın sonucu "pending"de kalan 8 kayıt var).
- **Başarısız kayıt:** en yeni satır `sync` / `orders` → `failed` (14.11 14:05 UTC); sipariş eşitlemesi o anda başarısız olmuş. Referans sütunu boş.
- Referans değerleri: dahili SKU biçimleri (MAN-…, BON-…, JTL-…) ve ürün adları.

### company-home Amazon `amazon_tab=products` (Woida UG · Almanya deposu, Amazon.de)
- **Yüklendi**, sayfa 1,6 sn.
- Sekmeler: Fiziki ürünler, Amazon teklifleri, Siparişler, Sorunlu ürünler, Ürün güvenliği, İşlem geçmişi.
- Sayaç rozetleri (süzgeç düğmeleri): "Fiziki stok · EAN'lı 5.793", "Aktarıma hazır 0", "Teklif açılmış 1", "Eşleşme / onay sorunu 4.827", "Depo fiyatı eksik 5.180". Sayım: "5.793 ürün", sayfa 1 / 232 (25/sayfa).
- Satır alanları: başlık · SKU · EAN · ASIN · Wawi fiyatı (KDV dahil) · fiziki stok · durum. Görülen durumlar: "ASIN bulunamadı — EAN … için bu Amazon mağazasında ASIN bulunamadı" (+ "Eşleşmeyi yenile"), "Satışa kapalı · ürün güvenliği", "Amazon teklifi · fiyat · adet", "Amazon bildirimleri (3)", "Ürün güvenliği bilgilerini aç".
- Anlamlı oran: 5.793 ürünün yalnız 1'inde Amazon teklifi var; 4.827'sinde eşleşme/onay sorunu (%83).
- Eylemler: "Sayfayı seç", "ASIN'leri kontrol et", "Seçilenleri aktar", "Eşleşmeyi yenile", "Fiyat ayrıntıları", "Kaydet", "Git" (sayfa atla), "Onayla ve gönder", "Vazgeç". `erp_action` yok.

### metro `view=pool` ve `view=failed`
- Hesap seçilmeden **liste görünmüyor**; sayfa kendini `&account=0` adresine yönlendiriyor ve "Devam etmek için hedef hesabı seçin" / "Önce hedef Metro hesabını / firmasını seçin" metnini gösteriyor.
- Seçilebilecek hesaplar: Lady Empire GmbH (Hesap #12, kanal Metro.de) ve Woida (Hesap #25, WOIDA SHOP · Metro · Metro.de). Her biri "Firma seç" düğmesi. (Hesap etiketinde bir e-posta adresi görünüyor; yazılmadı.)
- Menü: Metro ürün havuzu, Wawi ürün havuzu / Metro'ya gönder, Gitmeyen ürünler, Siparişler, Diğer araçlar; "Son gönderim işlemleri" bölümü.
- `view=pool` süzgeçleri: arama + "Tüm durumlarda ara"; görünüm seçici `offers / approved / rejected / uploads / markets` (Canlı teklifler, Onaylı ürünler, Reddedilen ürünler, Ürün yüklemeleri, Pazarlar); durum `all / active / deactivated / paused / inactive / not_listed / listed / not_active` (Tüm durumlar, Aktif teklifler, Kaldırılmış, Duraklatılmış, Pasif, Henüz teklif yok, Metro'da olanlar, Aktif ilanı olmayanlar); stok (Fiziki stok, Drop stok, Sanal stok, "Stoksuz (fiziki / drop yok)", "Stok bilgisi belirsiz"); ödeme (Tüm ödemeler, Ödendi, Kartla ödendi) — son ikisi yan menüdeki sipariş görünümüne ait olabilir (tahmin). Dip not: "Metro miktarları kanal stoğudur. Wawi'ye çekim fiziksel depo stoğunu değiştirmez."
- `view=failed` ("Gitmeyen ürünler") ek düğmeler: "Wawi'ye tamamını çek", "Sayfayı CSV indir" (ikisi de tetiklenmedi).
- Hesap seçmek tıklama/ek adres gerektirdiği için bu turda seçilmedi; içerik görülemedi.

### customers-master
- **Yüklendi** (0,5 sn). Toptan satış ve cari: "Müşteriler, satışlar, faturalar ve tahsilatlar tek alanda."
- Üst sekmeler (düz bağlantı): Cari müşteriler, "＋ Yeni cari" (`new_customer=1`), "＋ Yeni toptan satış" (`view=wholesale&new=1`), Taslaklar (`view=wholesale&records=draft`), Satış faturaları (`view=wholesale&records=issued`).
- Cari listesi: "48 cari · 48 aktif hesap"; 24 satır/sayfa, 2 sayfa. Satırda baş harfler, ad (kişi veya firma + yetkili) ve bir fatura referansı (`RET-INV-…` ön eki: perakende faturadan doğan cari kayıtları). Liste kartları `customer=<id>` bağlantısı veriyor.
- Detay kartında (DOM'da var, açılmadı) düğmeler: "Bu müşteriye toptan satış →", "Faturayı görüntüle / PDF", "Eksik cari kaydını tamamla", "Ödemeyi kaydet". **`erp_action` değerleri (DOM'dan okundu, tetiklenmedi):** `create_b2b_customer`, `update_b2b_customer`, `add_b2b_customer_location`, `add_b2b_customer_user`, `publish_b2b_customer_invoice`, `record_b2b_customer_payment`.
- Gözlem: cari kayıtların çoğu bireysel müşteri (RET-INV ön ekli, perakende faturadan türetilmiş), yani "toptan satış cari" listesi aslında perakende müşterilerle karışık (tahmin: eski fatura müşterileri otomatik carileştirilmiş).

### customers-master toptan satış — Taslaklar (`view=wholesale&records=draft`)
- **Yüklendi** (0,4 sn). Önceki turda yüklenmemişti.
- Başlık "Toptan satış kayıtları · Taslağı açın, kaldığınız yerden devam edin."; sayaçlar "5 Taslak · 1 Faturalandı"; kayıt süzgeç sekmeleri: Tüm kayıtlar, Taslaklar, Faturalananlar, İptal edilenler.
- 5 taslak kartı: ✎ simgesi · oluşturan (tek kişi) · şirket (Woida) · tarih (2026-11-02 … 11-06) · "Taslak #n" · "Düzenlemeye devam et →" (`view=wholesale&sale=<id>`). Bir taslakta kaynak dosya adı (bir Excel liste dosyası, tarihli) görünüyor: taslaklar dosyadan içe aktarmayla da oluşturuluyor (tahmin).
- Eylem: "＋ Yeni toptan satış". Sayfada `erp_action` yok.

### customers-master toptan satış — Satış faturaları (`records=issued`)
- **Yüklendi** (0,4 sn). 1 kayıt: ▤ simgesi, oluşturan, şirket Woida, tarih 2026-11-06, durum "Faturalandı", belge numarası `WAWI-WO-<yıl>-<sıra>` biçiminde, "→" bağlantısı. Perakende fatura numarasından (`RE-…`) farklı bir numara serisi.
- Eylem: "＋ Yeni toptan satış".

### invoices `view=orders&warehouse=2`
- **Yüklendi** (0,6 sn). Önceki turda sipariş listesi "yükleniyor…" kalmıştı; bu adres (`view=orders`, depo 2) satış faturaları listesi olarak sunucu tarafında geliyor.
- Başlık: "Satış faturaları · Almanya Warehouse". Üst sekmeler: Satış faturaları, İade faturaları, Tedarikçi faturaları, Kargo faturaları; "+ Siparişten fatura oluştur"; "Diğer işlemler".
- Süzgeçler: Fatura ara (`q`), Depo (`all`: 0 / 1), Belge durumu (`status`: ∅ tümü, issued, draft, cancelled), Tarih aralığı.
- Sayım: "1.716 kayıt", "1–25 / 1.716 · Sayfa 1 / 69"; sıralama "Tarihe göre · En yeni önce".
- Sütunlar: Fatura / tarih · Müşteri / düzenleyen · Tutar · Belge durumu · İşlemler.
- Belge durumu (ilk 25 satır): hepsi "Kesinleştirildi". Fatura numarası biçimi `RE-<şirket kısaltması>-<yıl>-<6 haneli sıra>`; düzenleyen şirket sütunu: Lady Empire GmbH (ilk sayfanın tamamı).
- Eylemler: satır düğmesi "PDF / gönder" (ve "İşlemler" menüsü), "Ara". `erp_action` yok.

## Yeni varlıklar, durumlar ve eylemler

Yalnız önceki belgelerde (01-04) bulunmayanlar (varsayım: önceki belgeleri yalnız "Görülemeyenler" bölümleriyle karşılaştırdım; tam eşleştirme yapılmadı, bu yüzden bazı maddeler zaten yazılmış olabilir).

- **Sayfa türü `order-ebay-detail`:** `?page=order-ebay-detail&warehouse=2&order_channel=5075&order=…` — `problem-orders` çözülmüş kartlarındaki "Siparişi aç →" bağlantısının hedefi; `load_list` içermiyor.
- **Billbee ve GLS:** OTTO siparişlerinde eski etiketler GLS taşıyıcısıyla ve Billbee'de oluşturulmuş; "Billbee'den yazdır" düğmesi. Ayrı sipariş/etiket sistemi (tahmin).
- **`erp_action` değerleri (tetiklenmedi):** `all_orders_export` (`/allordersfilter`); `create_b2b_customer`, `update_b2b_customer`, `add_b2b_customer_location`, `add_b2b_customer_user`, `publish_b2b_customer_invoice`, `record_b2b_customer_payment` (`customers-master`).
- **`data-*` eylem öznitelikleri:** `data-pack-action` (picking, invoices; allordersfilter ve OTTO), `data-shopify-action-help`, `data-action-dialog / -close / -feedback` (send-kaufland), `data-pool-quick-actions`, `data-product-detail-action` (warehouse havuzu, send-shopify, ozon).
- **Sipariş durumları / ödeme değerleri (`allordersfilter`):** durum `new / processing / complete / cancelled`; ödeme `paid, card_paid, bank, bank_paid, bank_unconfirmed, pending, refunded, partial_refund, partial_paid, void, failed, expired`; rozet "Announced" çevrilmemiş.
- **Mollie ödeme durumları ve yöntemleri:** durum `paid, pending, authorized, partially_paid, partially_refunded, refunded, voided`; yöntem `creditcard, banktransfer, directdebit, paypal, klarna, ideal, applepay, bancontact, unknown`.
- **OTTO işlem geçmişi türleri ve sonuçları:** `draft, publish, delivery_profile, toner_delivery, stock, shared_stock_zero, wawi_listing_origin, sync`; `saved, submitted, pending, verified, intent, confirmed, failed`.
- **Metro görünüm / durum değerleri:** `offers, approved, rejected, uploads, markets`; `all, active, deactivated, paused, inactive, not_listed, listed, not_active`.
- **Sorun (reason) kodları (problem-products, problem-orders):** `missing_product, wrong_product, damaged, stock_mismatch, missing_address, invoice_error, shipping_error, product_data, payment, other`; durum `open / resolved / all`.
- **Depo havuzu süzgeç kodları:** `stock_kinds[]` (all, physical, dropship), `stocks[]` (all, available, empty, unknown, negative, low), `sort` (relevance, name, name_desc, stock_desc, stock_asc, drop_desc, drop_asc, sales_desc, newest); depo kimlikleri 0 / 1 / 2 / 3 / 2881 / 2882.
- **Amazon ürün rozetleri:** "Aktarıma hazır", "Teklif açılmış", "Eşleşme / onay sorunu", "Depo fiyatı eksik", "ASIN bulunamadı", "Satışa kapalı · ürün güvenliği".
- **Kaufland gönderim diyaloğu alanları:** `id_warehouse, id_shipping_group, condition, vat_indicator, category`; `kaufland-publications.php` istek parametreleri `listing, ean, brand, model, min, max, status, provider, catalog, issue_kind`.
- **Eksik / belirsiz kayıt kodları:** `merge_database_busy` (duplicate-products hata kodu).
- **Toptan satış numara serisi:** `WAWI-WO-<yıl>-<sıra>` (toptan) ve `RE-<şirket>-<yıl>-<sıra>` (perakende) farklı seriler; cari ön eki `RET-INV-…`.

## Performans gözlemleri

- **Her sayfada yavaş çağrı: `/api/menu-counts.php`.** `view=worklists&warehouse=0` varyantı 5–15 sn, çıplak `menu-counts.php` 8–19 sn sürdü (hemen her sayfa yüklemesinde 2-3 kez çağrılıyor). Sayfanın ana listesi gelse bile menü rozetleri bu yüzden geç doluyor. En yavaş: 19,4 sn (send-kaufland, products).
- **Bir sayfa HTML'i dakikaya yakın:** `/allordersfilter` 30,2 sn (tüm siparişlerin özeti + 25 satır sunucuda hesaplanıyor). Sonraki sayfalara geçişin de benzer olacağı tahmin.
- **Liste uçları 7–13 sn:** `kaufland-publications.php?action=products` 13,1 sn; `channel-worklist.php` 12,3 sn; `ozon-products.php?action=products` 11,2 sn; `shopify-products.php` 8,9 / 9,0 sn; `duplicate-products.php` 8,2–9,2 sn (hata ile); `missing-product-images.php` 7,4 sn; `critical-physical-stock.php` 5,0 sn.
- **Örüntü (tahmin):** yavaşlık büyük havuzu taramayan ve depo/hesap süzgeci olmadan tüm 220 bin kartı sayan sorgularda yoğunlaşıyor (8.786 sayfalık send-* listeleri, 43 bin kayıtlı foto kontrolü, 25 bin kayıtlı kritik stok, 33 bin siparişlik arşiv). Depo 1 (8.985 ürün) ve küçük hesaplı listeler (Ozon 618, Shopify pool 499, Mixoutlet 281) 0,3–2 sn.
- **Hızlı olanlar:** sunucu tarafında basit render edilen sayfalar (problem listeleri, cari/taslak/fatura listeleri, OTTO, Amazon) 0,3–1,6 sn.
- **Hata:** bu turda hiç 504 yok; tek hata `duplicate-products.php` (8–9 sn sonra `merge_database_busy`, iki denemede de aynı; veritabanı kilidi veya sorgu zaman aşımı).
- **Önceki turlarla fark:** `allordersfilter`, `warehouse-orders&view=customers`, `send-kaufland`, `critical-physical-stock` vb. önceki turlarda 504 veya zaman aşımı idi; bu turda yüklendi. Sunucu yükü zamana göre değişiyor (tahmin: gün içi yoğunluk ya da arka plan senkronları).
- **Takılı kalan arayüz parçaları (istek bekleyen yok):** send-kaufland satırlarında "Mağaza bilgileri yükleniyor…" (45+ sn), warehouse depo 2 listesinde "Sayılar ve filtre seçenekleri yükleniyor…" (20+ sn), send-shopify satırlarında "Fiyat ve stok yükleniyor…" (10+ sn); sonraki isteğin tetiklenmediği tahmin ediliyor.

## Hâlâ görülemeyenler

- `duplicate-products` aday satırları (iki denemede de `merge_database_busy`); depo 1 dışında depo denenmedi.
- `metro` pool / failed / orders / send için hesap seçili içerik (hesap seçimi tıklama ya da ek adres gerektiriyor; bu tur kapsam dışı).
- `critical-physical-stock` satırlarındaki görünür stok sayısı (arayüzde gösterilmiyor; yalnız gizli öğeden okundu).
- `warehouse` depo 2 listesinin toplam ürün sayısı ve filtre seçeneği sayıları ("yükleniyor…" kaldı); `warehouse-orders` `view=orders` (`load_list` içerdiği için kapsam dışı).
- `send-kaufland` satırlarındaki mağaza bilgisi (listing durumu), `send-shopify` satırlarındaki depo fiyat/stok ayrıntısı.
- `problem-orders` / `problem-products` için "Konuşmayı aç" ve "Notu aç" içeriği; çözülmüş durumdaki `problem-products` listesi (`status=resolved` adresi bu turda denenmedi).
- `customers-master` müşteri detay kartı içeriği (tıklama gerekir), `new=1` sihirbaz adımları, taslak düzenleme ekranı (`sale=<id>`).
- `invoices` iade / tedarikçi / kargo faturaları alt görünümleri ve "Siparişten fatura oluştur" akışı (kapsam dışı).
- OTTO `returns`, `eans`, `source`, `issues`, `images` sekmeleri ve Amazon `orders`, `issues`, `history` sekmeleri (bu turda hedef değildi).
- Sayfa 2 ve sonrası hiçbir listede okunmadı; yalnız ilk sayfa.
- Kapsam dışı tutulanlar: `pin-permissions` (master PIN), sipariş ayrıntı bağlantıları (`load_list`).
