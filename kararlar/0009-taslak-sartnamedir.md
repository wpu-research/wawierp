# 0009 — Taslak panel, gerçek sistemin şartnamesidir

Tarih: 2026-11-16 · Durum: kabul edildi (proje sahibi)

## Bağlam

Konsey incelemesi (`docs/konsey/2026-11-16-konsey-incelemesi.md`) taslak panelin iyi bir tasarım aracı olduğunu, ama stok, kâr, KDV ve fatura davranışının ekrandan ekrana tutmadığını buldu. Bu hâliyle gerçek sisteme kopyalanırsa yanlış davranış kopyalanırdı.

## Karar

`yeni/panel-mock` yalnız görsel taslak değil, gerçek sistemin **davranış şartnamesidir**. Bir ekranda görülen iş kuralı, gerçek sistemde aynen beklenir.

Bunun sonuçları:

- Taslakta yanlış davranış "nasılsa örnek" diye bırakılmaz; ya düzeltilir ya da ekranda "bu davranış örnek" diye işaretlenir.
- Aynı hesap (ayrılan stok, ciro, katkı, komisyon) tek yerden yapılır; iki ekran aynı soruya iki yanıt vermez.
- Veriler örnek kalır; şartname olan veri değil, davranıştır.

## Bu kararla taslağa işlenen kurallar

1. **Sevk stoktan düşer.** Kargoya verilen fiziki siparişin kalemleri fiziki stoktan düşülür ve stok defterine satış hareketi yazılır. Tedarikçiden gönderilen siparişte bizim depomuzdan stok çıkmaz.
2. **Transfer deftere yazar.** Çıkışta gönderen depodan düşülür, kabulde alan depoya eklenir.
3. **Hiç sayılmamış kayda hareket yazılmaz.** Önce sayım gerekir.
4. **Sevk faturayı kesinleştirmez.** Fatura kesinleştirme ayrı yetki ve ayrı işlemdir.
5. **Fatura numarası kesinleştirme anında verilir**, şirket başına boşluksuz sıradır ve bir daha değişmez. Taslak numara tüketmez. Kesin fatura geri alınamaz; iptali iade faturasıyla olur.
6. **Ayrılan stok bütün şirketlerin açık siparişlerinden hesaplanır.** Stok depoda ortaktır; şirket süzgeci ayrılanı azaltmaz.
7. **Ciro, iptal ve iade siparişlerini içermez.** Katkı = ciro − KDV − komisyon − kargo.
8. **Toplu işlem onay ister** ve kaç kaydı etkileyeceğini söyler; kayıt gerçekte değişen sayıyı yazar.
9. **Müşteri iade formu**, sipariş numarası ile posta kodu eşleşmezse hangisinin yanlış olduğunu söylemez.

## Açık kalanlar

- Mobilde eksik toplanan siparişin pakete geçebilmesi ve kör sayım.
- Tedarikçiye sipariş ve etiket kurallarının "para" olarak işaretlenmesi; kural değişikliklerinin denetim kaydı.
- Asistana giden müşteri metninin maskelenmesi.
- İade kabulünün stoğa geri yazılması.
- Rol denetiminin yalnız arayüzde olması (gerçek sistemde sunucuda olacak).
