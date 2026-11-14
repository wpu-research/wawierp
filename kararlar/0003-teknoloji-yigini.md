# 0003 — Teknoloji yığını: TypeScript, PostgreSQL, React

Tarih: 2026-11-14 · Durum: **Karar verildi** (sahibi "Teknoloji yığınını (TypeScript, PostgreSQL, React) onaylıyor musunuz?" sorusuna "Evet, onaylıyorum" dedi)

## Bağlam
`0001` çok kiracılı sistem, `0002` sıfırdan geliştirme (sahibi + Claude). Tek geliştiricili, yapay zekâ destekli ekipte ön yüz ve arka ucun tek dilde olması önerildi (`sunum/wawierp-teknoloji-secenekleri.html`).

## Karar
- **Dil:** TypeScript (ön yüz ve arka uç)
- **Veritabanı:** PostgreSQL
- **Ön yüz:** React

## Neden
- Tek dil: tipler uçtan uca paylaşılır, bağlam değişimi azalır.
- PostgreSQL: satır düzeyi güvenlik (kiracı yalıtımı), güçlü işlem garantisi (stok defteri), JSON alanlar (kanal verisi).
- Ölçek küçük (ayda 2.555 sipariş); tek veritabanı ve modüler tek uygulama yeterli.

## Reddedilenler
- PHP (Symfony/Laravel): eski kodla aynı dil olması avantajdı, ama eski kod taşınmayacağı için (`0002`) bu avantaj kalmadı.

## Bu kararın kapsamadıkları (hâlâ açık)
- Arka uç çerçevesi (öneri: NestJS) ve ORM
- Kiracı yalıtım modeli (öneri: ortak şema + `tenant_id` + satır düzeyi güvenlik)
- İş kuyruğu (öneri: Redis tabanlı; alternatif Postgres tabanlı)
- Ön yüz çatısı ve bileşen kütüphanesi
- Barındırma, izleme, kimlik sağlayıcı, abonelik altyapısı
- Pilot kapsamı ve geçiş sırası
