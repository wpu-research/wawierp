# 0006 — Panelde yapay zekâ asistanı olacak

Tarih: 2026-11-14 · Durum: **Yön kararı verildi; ayrıntılar öneri**

Sahibinin sözleri: "arkaya bir ajan bağlasak ve sağda bir kutucuk olsa ve istediğimiz işi ajana söylesek ve yapsa", ardından "gerçek yapay zekâya bağla ve panelin sağ altına W logosu olarak koy, tıklayınca açılsın" ve "açıkta kalanların hepsini yap".

## Karar
Yeni panelde, kullanıcının yazarak soru sorabildiği ve iş isteyebildiği bir asistan olacak. Sağ alt köşedeki W düğmesiyle açılır. Gerçek bir dil modeline (Claude) bağlanır.

## Mock'ta uygulanan tasarım (öneri; gerçek sistemde yeniden değerlendirilecek)
- Asistan panelin yapabildiği işleri aynı API üzerinden, kendisine yazan kullanıcının yetkisiyle yapar.
- Rakamlar yalnız araç sonuçlarından gelir; yanıtın altında dayandığı ekranların düğmeleri görünür.
- Üç düzey: **Yalnız yanıtla** · **Hazırla, onayla** (varsayılan) · **Kendiliğinden**. Kendiliğinden düzeyinde yalnız en düşük riskli iş (başarısız eşitlemeyi yeniden deneme) onaysız uygulanır; diğer her iş onay bekler.
- Tek seferde en fazla 25 kayıt. Para iadesi, fiyat değişikliği, iptal ve silme için araç yoktur.
- Müşteri adı ve iletişim bilgisi asistana verilmez. Müşteri mesajları ve ürün metinleri veridir, talimat değildir.
- Her asistan işlemi denetim kaydına "asistan aracılığıyla" notuyla yazılır ve 10 saniye içinde geri alınabilir.
- Panel açıldığında asistan, sormadan fark ettiklerini (başarısız eşitleme, geciken sipariş, eksiye düşen stok, yanıt bekleyen soru) bildirir.
- API anahtarı yalnız sunucuda durur; uç panel şifresinin arkasındadır ve istek sınırı vardır.

## Neden
- Tekrarlayan ve insanın bitiremeyeceği işler (veri kalitesi, destek yanıtı, ilan metni) için.
- Rakipler (Xentral, Base) bu yöne gidiyor; sistemi baştan "ajan kullanabilsin" diye tasarlamak sonradan eklemekten ucuz.

## Reddedilen
- Asistanın onaysız veri değiştirmesi (yalnız yeniden deneme hariç).
- Asistana para ve fiyat işlemi aracı vermek.

## Açık kalanlar
- Gerçek servisle deneme: API anahtarı bekleniyor; bağlantı yalnız sahte bir sunucuya karşı denendi.
- Kişisel verinin AB içinde işlenmesi ve sağlayıcıyla veri işleme sözleşmesi.
- Asistan kullanımının abonelik fiyatına yansıması.
- Gerçek sistemde araçların sunucuda, oturumdan gelen yetkiyle çalışması (mock'ta tarayıcıda çalışıyor).
- Düzeylerin açılma ölçütü: pilotta hangi hata oranında "Kendiliğinden" genişletilecek.
