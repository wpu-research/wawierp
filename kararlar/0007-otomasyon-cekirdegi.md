# 0007 — Otomasyon: olay, kural, onay düzeyi çekirdeği

Tarih: 2026-11-14 · Durum: **Yön kararı verildi; ayrıntılar öneri**

Sahibinin sözleri: "sistemi daha otomatize bir hale getirebilecek fikirlerin var mı", ardından "bunların hepsinin entegrasyonlarını yap" ve "açıkta kalanların hepsini yap".

## Karar
Otomasyon tek tek özellik olarak değil, ortak bir çekirdek olarak kurulacak: **Olay → Kural (koşul + işlem) → Onay düzeyi**. Yeni bir otomasyon, yeni kod değil yeni kural olur.

## Mock'ta uygulanan tasarım (öneri)
- 14 hazır kural: kaynak seçimi, kargo ve etiket, fatura ve takip bildirimi, drop siparişi iletme, gecikme yakalama, kanallar arası stok eşitleme, güvenlik payı, ilanı durdur/aç, maliyete göre fiyat, reddedilen ilanı düzelt, iade onayı, "siparişim nerede" yanıtı, havale eşleştirme, eşitlemeyi yeniden deneme.
- Üç onay düzeyi: yalnız öner · önce sor · kendiliğinden. Her kural önce "yalnız öner" düzeyinde başlar.
- Para hareketi yaratan ya da fiyat değiştiren kurallar "kendiliğinden" düzeyine alınamaz.
- Her kuralın üst sınırı vardır; her çalışma, tetikleyen olayla birlikte kayda geçer.
- Stok ayırma: sipariş gelince stok ayrılır, satılabilir miktar diğer kanallarda düşer (fazla satış koruması).

## Neden
- Eski panelde gözlenen sorunlar: eksiye düşen stok, yığılan etiket hataları, haftalarca yarım kalan eşitleme.
- Beş güçlü rakibin hepsinde kural motoru var.

## Açık kalanlar
- Gerçek sistemde olay altyapısı (BullMQ üzerinde) ve kuralların saklanma biçimi.
- Hangi kuralların pilotta açılacağı.
- Kullanıcının kendi kuralını yazabilmesinin kapsamı.
