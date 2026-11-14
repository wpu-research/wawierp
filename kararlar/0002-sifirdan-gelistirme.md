# 0002 — Sistem sıfırdan geliştirilecek; ekip: sahibi + Claude

Tarih: 2026-11-14 · Durum: **Karar verildi** (sahibi: "Sistemi seninle ben baştan geliştireceğiz")

## Bağlam
`0001` ile sistemin çok kiracılı olacağına karar verildi. Açık soru, mevcut PHP sisteminin yerinde mi dönüştürüleceği, yoksa yeniden mi yazılacağıydı; dil seçimi de buna bağlıydı (`sunum/wawierp-teknoloji-secenekleri.html`, tartışma 1).

## Karar
Yeni sistem sıfırdan yazılacak. Geliştirmeyi sahibi ve Claude birlikte yapacak. Eski sistem, yenisi hazır olana kadar çalışmaya devam edecek; geçiş aşamalı olacak.

## Sonuçları
- Eski kod taşınmaz; iş kuralları eski koddan ve ekranlardan **okunup** yeniden yazılır. Bu yüzden eski kaynak kod ve veritabanı şeması `legacy/` altında hâlâ gerekli (kural kaynağı olarak).
- Dil seçimi ikilemi büyük ölçüde çözülür: tek kişi + yapay zekâ destekli geliştirmede ön yüz ve arka ucun tek dilde (TypeScript) olması öneriliyor. **Bu bir öneridir; yığın henüz karar olarak onaylanmadı.**
- İki sistem bir süre birlikte çalışacak; "bir kanala aynı anda yalnız bir sistem yazar" kuralı geçişin temelidir.
- Tek geliştiricili ekip riski: test, karar kaydı, hafıza ve bilgi grafiği disiplini zorunlu.

## Açık kalanlar
- Teknoloji yığınının onayı
- Kiracı yalıtım modeli
- Pilot kapsamı ve geçiş sırası (öneri: `sunum/wawierp-mimari-ve-gecis.html`)
