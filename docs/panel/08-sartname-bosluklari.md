# 08 — Taslağın şartname olarak boş ya da çelişkili bıraktığı kurallar

Tarih: 2026-11-16 · Kaynak: ikinci konsey, tur 4 (şartname üyesi) · Durum: **öneri, sahibi onaylamadı**

`kararlar/0009`: taslak panel gerçek sistemin davranış şartnamesidir. Aşağıdaki konularda taslak ya hiçbir şey söylemiyor ya da `docs/06-alan-modeli.md` ile çelişiyor. Her satırdaki cümle bir **şartname önerisidir**; kodlanmadı, çünkü davranışı değiştirmek ya da yeni alan eklemek sahibinin kararıdır.

| # | Konu | Taslakta bugün | Önerilen şartname cümlesi |
|---|---|---|---|
| 1 | Para birimi ve kur | EUR, TRY, USD ayrı tutuluyor; ekranlar arası sabit kur (TRY 48, USD 1,08) üç yerde kopya; kur kaynağı, tarihi ve yuvarlama yok | Her tutar işlem anındaki kurla raporlama para birimine çevrilir; kur ve tarih belgeye yazılır; yuvarlama kalem toplamı üzerinde bir kez yapılır. |
| 2 | Vergi | Şirket ülkesine göre tek oran (DE %19, NL %21, TR %20); OSS ve ters yük yok | KDV oranı varış ülkesi, ürün sınıfı ve alıcı türüne göre belirlenir; iade faturası aynı dönemin KDV'sinden negatif düşer. |
| 3 | Kısmi ve çok kalemli iade | İade sipariş başına tek aşama; müşteri formda kalem seçiyor ama iade stoğa siparişin tüm kalemini yazıyor | İade kaydı sipariş kalemi ve adet bazında açılır; stok, tutar ve iade faturası yalnız kontrol edilen adet kadar yazılır. |
| 4 | İade durum makinesi | Tek eksen, dört aşama; reddetme, hasarlı ürün, ürün gelmedi, süre aşımı yok | İadede teslim ve para iki ayrı eksendir; her eksenin reddet, hasarlı ve süre aşımı çıkışı tanımlıdır. |
| 5 | Kısmi sevk / bölünmüş sipariş | Sevk bütün siparişi tek takip numarasıyla kargoya verir | Sipariş birden çok sevkiyata bölünebilir; her sevkiyatın kalemi, takip numarası ve stok hareketi ayrıdır; sipariş durumu bunlardan türetilir. |
| 6 | Kredi notu (iade faturası) | Para iadesi beklerken taslak, çözülünce kesin; kısmi tutar ve iptal yok | Kredi notu kesin satış faturasına bağlı, kalem bazlı ve numara serisi ayrıdır; kesinleşen geri alınamaz, düzeltme yeni belgeyle yapılır. |
| 7 | Komisyon mutabakatı | Kanal başına sabit örnek oran; gerçek kesinti ile karşılaştırma yok | Her ödeme dökümü satırı sipariş ve komisyonla eşleşir; fark tutarı "açık fark" olarak kapanana kadar tutulur. |
| 8 | Stok ayırma | Açık siparişlerden anlık hesaplanıyor; kayıt, süre ve çözülme yok | Ayırma sipariş kabulünde yazılan, iptal ve süre dolumunda çözülen bir kayıttır; satılabilir = fiziki − ayrılan. |
| 9 | Rol ve yetki | Rol matrisi yalnız arayüzde; docs'ta yok | Her işlem bir yetki anahtarına bağlanır ve sunucuda denetlenir; arayüz yalnız gösterir. |
| 10 | Destek konuşması | Yanıt ve kapatma var; yeniden açma, atama yok | Konuşma bir siparişe ve müşteriye bağlanır; kapanış yeniden açılabilir; atanan kişi kayıtlıdır. |
| 11 | Kanal sağlığı ve yasal | Kanal sağlığı ekranı var ama ana ekranda ürün sorun sayısıyla birlikte görünmüyor; Impressum, KVKK, e-fatura yok | Her kanalın sağlığı ürün sorun sayısıyla birlikte ana ekranda görünür; yasal sayfalar ve e-fatura yükümlülükleri dış açılıştan önce tanımlanır. |

## Notlar
- 3 ve 4 numaralı satırlar kararlarla çelişmez: `kararlar/0010` madde 5 iade stoğunu tam sipariş üzerinden yazar; kalem bazlı iade şartname olarak burada açık kalır.
- Hiçbiri kodlanmadı; sahibi onaylayınca ilgili `docs/06` bölümü ve ekran birlikte güncellenmeli.
