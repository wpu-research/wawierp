# WawiERP Panel Analizi — Birleşik Bulgular

Tarih: 2026-11-14 · Kaynak: canlı panelde sistem yöneticisi oturumuyla **yalnız okuma** incelemesi (4 ajan). Ayrıntı: `docs/panel/01…05`, harita: `raw/panel-harita.md`. Kaynak koda ve veritabanına bakılmadı; sunucu tarafı hakkındaki her şey ekrandan ve ön yüz JS'inden çıkarımdır.

## 1. Sistem ölçeği
| Ölçü | Değer |
|---|---|
| Depo | 5 (Istanbul, Almanya, Hollanda, Mega B, Technowelt Almanya) |
| Şirket (tüzel kişilik) | 12 |
| Pazaryeri hesabı | 22 (eBay 8, Kaufland 6, Amazon 3, METRO 2, OTTO, Dealclub, Trendyol, N11, Ozon) |
| Mağaza / satış platformu | 19 (Shopify 9, webshop 7, JTL-Shop, JTL-Wawi, XML-Import) |
| Katalog kartı | ≈232.500 |
| Depo ürün kaydı | ≈151.000 |
| Drop stok adedi | ≈1,8 milyon (tamamı Almanya deposunda) |
| Sipariş havuzu | 14.258 kayıt |
| Fatura belgesi | 1.763 (1.716 satış + 47 iade; Almanya deposu) |
| Ticket | ≈3.400 (genel bakış 450 açık diyor) |
| İade | 79 |
| Denetim kaydı | 83.070 satır |
| Ekran türü | 54 `page` değeri |
| Ön yüz | 43 JS dosyası, ≈10,2 bin satır, ≈857 KB |

## 2. Mimari (dışarıdan görünen)
- **Tek giriş noktası:** `/?page=<ad>`; yazma işlemleri aynı adrese `POST` + `csrf` + `erp_action`.
- **İkinci katman:** `/api/*.php` uçları. Satır işlemleri (etiket, fatura, takip, not) form değil, `data-*` düğmeleriyle bu uçlara gidiyor. Yani iki ayrı yazma yolu var.
- **Bağlam adreste taşınıyor:** `company`, `warehouse`, `channel`, `account`. Hesap kimlikleri küresel; eBay iş listeleri `account=0` kullanıyor.
- **Ön yüz:** çerçevesiz; 43 dosyanın tamamı her sayfada yükleniyor, sayfa başına ≈10 arka plan isteği. Aynı istek sarmalayıcısı ≈12 kez kopyalanmış. Üç ayrı çeviri mekanizması (sunucu sözlüğü, satır içi `t(tr,de)`, dosya başına Almanca sözlük).
- **Kimlik:** e-posta+şifre ve PIN yan yana; riskli ekranlar ana PIN ile yeniden doğrulama istiyor. Denetim kaydında kullanıcı yalnız PIN'in son iki hanesiyle görünüyor.
- **Koda gömülü kimlikler:** `dhl-labels.js` ve `order-customer-edit.js` içinde kanal ve depo kimlikleri sabit. Amazon ucu tek şirkete özel adlandırılmış (`woida-amazon.php`).

## 3. Alan modeli (ekranlardan çıkarılan)
- **Katalog kartı** (ortak) ↔ **depo ürün kaydı** (fiyat ve stok depo bazında). `product_key` kaynağa göre farklı biçimde: `manual:`, `sku:JTL-`, `shopify:…:variant:`, `ebay-account:`, `supplier:asterbuy:`. 13 kaynak; en büyükleri tedarikçi API (≈112 bin) ve Wawi mağazası (≈97 bin).
- **Stok türleri:** fiziki, drop (Asterbuy, BueroArena/Kosatec, B2B Uhren, Watchimport), sanal (yalnız web mağazaları), tedarikçi API stoğu, paket stoğu.
- **Hiyerarşi:** Depo → Şirket → Kanal → Hesap. Bir şirket birden fazla depoya bağlanabiliyor.
- **Listeleme yaşam döngüsü (her kanalda aynı):** havuz → eksik veriyi tamamla → önizle → onayla ve gönder → durumu kontrol et → sorunlar → kaldır.
- **Sipariş:** kaynak (kanal), tedarik türü (fiziki/drop), sevk durumu, gelen kutusu; işlemler etiket, fatura, takip, not.
- **Belgeler:** sipariş faturası, iade faturası (`RET-`), tedarikçi faturası, kargo faturası, finans belgesi; cari hesap, toptan satış taslağı.

## 4. Kesişen sorunlar (yeniden tasarımın gerekçeleri)

### 4.1 Performans ve kararlılık
- Liste uçları 15–30 sn; birçok liste "yükleniyor"da kalıyor, zaman aşımı ve hata mesajı yok.
- 504 dönen sayfalar: `/allordersfilter`, `warehouse-orders`, ilk denemede `warehouse-product` ve `catalog-governance`.
- Genel bakışta satış özeti ve en çok satanlar yüklenmiyor; tüm depo eşitlemeleri "tamamlanamadı".
- Stok işleyicisi gecikmiş: 592 düzeltme satırı, 106 açık sipariş-stok işlemi. Asterbuy stok kontrolü son başarılı 2026-10-11.
- eBay'de kalıcı "senkronun bazı adımları tamamlanamadı" uyarısı.

### 4.2 Veri tutarlılığı
- Sipariş havuzu: kısayol sayıları (208, 102+) ile liste (26) uyuşmuyor; "gönderilmemiş" filtresi "tümü" ile aynı sonucu veriyor.
- Ticket: 450 açık ↔ ≈3.400 kayıt.
- Ürün: `pool` sayfası yalnız JTL kaynağını (2.466) gösteriyor, `products` 232 bin; alt depo sayıları ve stok filtresi toplamları tutmuyor.
- Stok: aynı ürün kartında "sayım yok" ile "fiziki stok 119" yan yana; tedarikçi stoğu ile Wawi fiziki farklı.
- Faturalar varsayılan depoda 0 kayıt gösteriyor; veri başka depoda. "Tümü" seçici değerleri ters.
- Ön muhasebe 41 kanalda 0 sipariş ve boş net/KDV/kâr gösteriyor; KDV özeti %19'a sabit (TR ve NL şirketleri için yanlış).
- İade faturaları defterde "depo sevk belgesi" diye etiketli.

### 4.3 Kod tekrarı
- Sipariş listesi şablonu 5 ekranda kopya (orders-pool, orders-ebay, orders-kaufland, warehouse-orders, company-home).
- Kanal başına ayrı sayfa + JS + uç; Shopify ve Ozon havuz/gönder çiftleri neredeyse birebir.
- Aynı ürün için 3 ayrı detay/düzenleme yüzeyi.

### 4.4 Süreç boşlukları
- 79 iadenin tamamı ilk aşamada; hiçbiri ilerlememiş.
- Banka ekstresi mutabakatı özellik listesinde "hazırlanıyor", ama `bank-import.js` içe aktarmayı zaten yapıyor.
- METRO adresteki hesabı yok sayıyor; N11 tutarında para birimi alınamıyor; işlem geçmişi ham kod gösteriyor.

### 4.5 Güvenlik ve gizlilik
- Sipariş satırları ve depo şirket kartları müşteri/kişi adını, adresini, e-postasını, telefonunu sayfa kaynağında düz metin taşıyor.
- Denetim kaydı rutin DHL çağrılarıyla doluyor (7 günde 5.199 hata, 727 engellenen); gerçek olaylar gürültüde kayboluyor.
- Geri alınamayan işlemler (mükerrer birleştirme, katalog arşivi) PIN ve onay metni istiyor; toplu stok düzenlemenin aynı korumaya sahip olup olmadığı görülemedi.
- Desteklenmeyen PHP 8.1, tek origin (bkz. `01-sirket-analizi.md`).

### 4.6 Adlandırma
- `shipments` = depolar arası transfer, `shipping` = DHL etiket merkezi.
- "Pool" üç farklı anlamda kullanılıyor (JTL havuzu, katalog, kanal havuzu).

## 5. Yeniden tasarım için çıkan ilkeler (öneri, karar değil)
1. **Tek kanal bağdaştırıcı arayüzü:** listeleme ve sipariş çekme akışı her kanalda aynı; kanal başına sayfa yerine tek akış + kanal eklentisi.
2. **Stok defteri:** fiziki, drop, sanal ve tedarikçi stoğu ayrı hesaplar olarak tek hareket defterinde; sayılar defterden türetilsin.
3. **Tek yazma yolu:** `erp_action` formları ile `/api/*.php` uçları tek API katmanında birleşsin.
4. **Arka plan işleri:** eşitleme ve stok işleyicisi kuyruk + durum ekranı; liste uçları sayfalı ve önbellekli.
5. **Bağlam oturumda/rotada, kimlikler koda gömülmeden.**
6. **Kişisel veri yalnız gerektiğinde ve yetkiyle** sunucudan gelsin.
7. **Ülke bazlı vergi:** KDV oranı şirket ülkesinden.
8. **Sayaçlar tek kaynaktan:** menü rozetleri ile liste aynı sorguyu kullansın.

## 5b. Güncelleme — yeniden denenen ekranlar (2026-11-14, ikinci tur)

Ayrıntı: `docs/panel/06-yeniden-denenen-ekranlar.md`. Tek sekmede, 90 sn'ye kadar bekleyerek 26 adres yeniden denendi: 23'ü yüklendi, 1'i hata verdi, 2'si hesap seçimi istedi. Bu turda hiç 504 görülmedi; ilk turdaki zaman aşımlarının bir kısmı dört ajanın aynı anda yük bindirmesinden kaynaklanmış olabilir (tahmin).

Düzeltilen / eklenen sayılar:
| Ölçü | İlk tur | İkinci tur |
|---|---|---|
| Tüm siparişler (`/allordersfilter`) | görülemedi | 33.600 sipariş (havuzdaki 14.258'den farklı kapsam) |
| Depo müşteri kaydı (`warehouse-orders`) | görülemedi | 34.510 |
| Kritik fiziki stok | görülemedi | 25.061 kayıt; ilk 25 satırın tamamı **negatif stok** (−73 … −7) |
| Resimsiz ürün | görülemedi | 43.921 |
| Shopify gönderilebilir ürün | görülemedi | 121.008 |
| Amazon (Woida) | görülemedi | 5.793 ürünün 1'inde teklif var, 4.827'sinde eşleşme sorunu |
| OTTO sipariş | görülemedi | 1.337 |
| Cari / toptan | "yükleniyor" | 48 cari, 5 taslak, 1 faturalı |

Yeni sorunlar:
- **Negatif fiziki stok:** kritik stok listesinde görünür kutu boş ve devre dışı, değer gizli öğede.
- **`duplicate-products`** iki denemede de `merge_database_busy` hatası veriyor; mesaj "birleştirme kaydedilmedi" diyor, oysa yalnız liste okunuyordu.
- **Kanal eşitlemeleri bayat:** Ozon son tam aktarım 2026-10-18 ve "partial"; OTTO geçmişinde en yeni `sync/orders` kaydı `failed`, 8 `publish` kaydı `pending`.
- **`menu-counts.php`** hemen her sayfada 5–19 sn; tüm ekranları yavaşlatan ortak istek.
- **`/allordersfilter`** HTML'i 30 sn (sunucu tarafında tek seferde render).
- Yavaşlık, depo/hesap süzgeci olmadan tüm katalog havuzunu tarayan sorgularda yoğunlaşıyor (tahmin).
- Müşteri kaydında yer tutucu adlar ve silinmiş e-posta işaretleri var; veri kalitesi sorunu.

Yeni görülenler: `order-ebay-detail` sayfa türü (yasaklı parametre içermiyor), OTTO etiketlerinde Billbee/GLS, `customers-master` üzerinde 6 `erp_action` değeri, Mollie/OTTO/METRO durum kodları.

## 6. Görülemeyenler
(İkinci turdan sonra kalanlar: PIN ve yetki ekranı; METRO havuz ve gitmeyen ürün listeleri — hesap seçimi tıklama gerektiriyor; mükerrer ürün listesi — sunucu hatası; tıklayınca açılan diyaloglar; sunucu kodu ve şema. Aşağıdaki ilk tur listesi tarihsel kayıt olarak duruyor.)
- PIN ve yetki ekranı (ana PIN arkasında)
- Sipariş detay sayfası, çözülmüş sorunlu siparişler, tüm sipariş filtresi, depo müşterileri
- Kaufland ürün/sorun listeleri; Shopify, Ozon, METRO, Mixoutlet listeleri; OTTO ve Amazon'un bazı sekmeleri
- Stok hareketleri, kritik stok, resimsiz ürünler, sorunlu ve mükerrer ürün listeleri
- Toptan satış taslakları, fatura hazırlama listesi
- Sunucu kodu, veritabanı şeması, zamanlanmış görevler
