# 0005 — Bulut sağlayıcı: AWS, Frankfurt

Tarih: 2026-11-14 · Durum: **Karar verildi** (sahibi seçti)

## Bağlam
`0004` ile barındırma "yönetilen bulut, AB bölgesi" olarak belirlendi; sağlayıcı açıktı. Öneri GCP Frankfurt idi (işletmesi daha sade); sahibi AWS'yi seçti.

## Karar
Yeni sistem **AWS üzerinde, Frankfurt bölgesinde (eu-central-1)** çalışacak.

## Beklenen bileşenler (ayrıntı ilk dağıtımda kesinleşir)
| İhtiyaç | AWS hizmeti |
|---|---|
| Uygulama ve işçiler | ECS Fargate (API ve BullMQ işçileri ayrı servisler) |
| Veritabanı | RDS for PostgreSQL (otomatik yedek, zamana geri dönüş) |
| Kuyruk | ElastiCache (Redis uyumlu) |
| Dosyalar | S3 (etiket, fatura PDF, ürün görseli) |
| Ön yüz | S3 + CDN (Cloudflare önde kalabilir) |
| E-posta | SES |
| Gizli bilgiler | Secrets Manager / KMS (kiracı kanal kimlik bilgileri şifreli) |
| Altyapı tanımı | AWS CDK (TypeScript) — tek dil kararıyla uyumlu |

## Neden
- En geniş hizmet yelpazesi; e-posta ve anahtar yönetimi aynı yerde.
- Altyapı TypeScript ile tanımlanabilir (CDK).
- Frankfurt: müşterilerin çoğu Almanya'da; veri AB içinde kalır.

## Reddedilen
- GCP Frankfurt (önerilmişti): işletmesi daha sade, hizmet yelpazesi daha dar.

## Dikkat edilecekler
- Ağ ve yetki (VPC, IAM) kurulumu GCP'ye göre daha karmaşık; altyapı elle değil CDK ile kurulmalı ki tekrar üretilebilsin.
- Maliyet baştan izlenmeli (bütçe alarmı); özellikle ağ geçidi ve boşta çalışan servisler.
- Veritabanı dışarıya kapalı olmalı; uygulama veritabanına tablo sahibi olmayan rolle bağlanmalı (`0004`, RLS notu).
- Canlıya çıkmadan önce yedekten geri dönüş bir kez denenmeli.

## Hâlâ açık
- Abonelik ve ödeme altyapısı
- İzleme ve hata takibi araçları
- Pilot kapsamı ve geçiş sırası
