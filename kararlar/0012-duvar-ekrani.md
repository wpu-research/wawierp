# 0012 — Ofis duvar ekranı (TV modu)

Tarih: 2026-11-17 · Durum: **Karar verildi** (sahibi seçti) · Kaynak: sahibin sesli notu ve ofisteki eski TV sayfasının fotoğrafı (`?page=tv`)

## Bağlam
Ofiste bir televizyonda eski panelin TV sayfası açık duruyor: genel toplam, şirket kartları, kanal başına tutar ve sipariş sayısı, Hollanda ayrımı, dönem düğmeleri ve 5 saniyede bir değişen dönem. Toplamlar kendi içinde tutarlı. Ama:
- 9 şirketten yalnız 3'ü aynı anda görünüyor.
- Dönem 5 saniyede bir değiştiği için ekran duvardan okunmuyor.
- "Kısmi kaynak verisi" yazıyor, ama hangi kanalın verisinin eksik olduğunu söylemiyor.
- TRY tutarı euro toplamına eklenmiyor, ama sipariş sayısına ekleniyor.
- Ciroya iptal ve iadenin girip girmediği yazmıyor.
- Ürün adedi, hedef ve dünle karşılaştırma yok.

Sahibin sesli notta istedikleri:
- Şirket kartları: platformlar, ciro, ürün adetleri; bugün ve dün.
- Gösterilecek şirketleri seçebilmek.
- Altta kayan yazı ve dönen sayfalar.
- Mağaza bazlı ürün durumu yüzdesi: stokta olup kanalda olmayan, yeni gelen, bilgisi eksik ve fotoğrafı sorunlu ürünler.
- Kategori başına günlük adet hedefi; satış oldukça geri sayar.
- Kategori × mağaza ciro ve ortalama satış fiyatı raporu.

## Karar
1. Ayrı bir **duvar ekranı** sayfası olur; Genel bakışa "tam ekran" düğmesi eklenmez. Sayfalar sırayla döner, her biri 15–20 saniye kalır:
   1. Şirket × kanal satışları, bugün ve dün yan yana.
   2. Kategori hedef sayaçları.
   3. Mağaza ürün durumu yüzdeleri.

   Altta kayan yazı bandı olur. Gösterilecek şirketler, sayfalar ve süre ekranın ayarından seçilir.
2. **Tutarlar görünür** (€): tutar ve sipariş sayısı birlikte gösterilir.
3. **Hedef sayacında iptal geri sayılır:** İptal ya da iade edilen satış hedeften düşülmüş sayılmaz. Ciro kuralıyla aynıdır (0009, kural 7).
4. **Kategori ürün kartında bir alandır.** Her ürünün bir ana kategorisi olur (toner, parfüm, saat …). Hedef ve rapor bu alandan hesaplanır.
5. **TRY ayrı satırda kalır.** Euro toplamına da euro sipariş sayısına da eklenmez; kur çevrimi yapılmaz.
6. Veri eksikse ekran **hangi kanalın** eksik olduğunu ve son eşitleme zamanını yazar; yalnız "kısmi veri" demez.
7. Kategori × mağaza **ortalama satış fiyatı raporu** duvar ekranına değil, Kanal ve şirket kârı ekranına gider.

## Neden
- Tek sayfaya her şeyi sığdırmak eski ekranın sorununu tekrarlar. Ayrı ekran, ayrı okunma mesafesi ve ayrı ayar demektir.
- Ciro, sayaç ve sipariş sayısı tek kurala bağlı kalır; iki ekran aynı soruya iki yanıt vermez (0009).
- Kur çevrimi kaynağı ve günü tartışmalıdır; ayrı satır hatasızdır.

## Reddedilenler
- Genel bakışa tam ekran düğmesi: hedef sayacı ve ürün durumu yüzdesi oraya sığmaz.
- TRY'yi euroya çevirip tek toplam yapmak: kur kaynağı belirsiz.
- Yalnız adet göstermek: sahibi tutarları duvarda görmek istedi.

## Açık kalanlar
- Ürün durumu yüzdesinin formülü: dört ölçü eşit ağırlıklı mı?
- "Yeni gelen" ürünün süresi (ör. son 7 gün stoğa giren).
- Kayan yazının içeriğini kim yazacak; elle mi, kendiliğinden mi (ör. eşitleme uyarıları)?
- Sesli notun son birkaç saniyesi anlaşılamadı.
