# 0004 — Yığın ayrıntıları: çerçeve, veri erişimi, kiracı ayrımı, kuyruk, ön yüz, barındırma, kimlik

Tarih: 2026-11-14 · Durum: **Karar verildi** (sahibi sekiz seçimi tek tek yaptı)

## Bağlam
`0003` ile TypeScript, PostgreSQL ve React onaylandı; kalan seçimler açıktı.

## Kararlar
| Konu | Karar | Reddedilen |
|---|---|---|
| Sunucu çerçevesi | **NestJS** | Fastify (yalın) |
| Veri erişimi (ORM) | **Prisma** | Drizzle |
| Kiracı ayrımı | **Ortak şema + `tenant_id` + satır düzeyi güvenlik (RLS)** | Karma; müşteri başına veritabanı |
| İş kuyruğu | **BullMQ + Redis** | pg-boss |
| Ön yüz çatısı | **Vite + React** | Next.js |
| Bileşen kütüphanesi | **shadcn/ui + Tailwind** | Mantine |
| Barındırma | **Yönetilen bulut, AB bölgesi (AWS ya da GCP)** | Hetzner + Coolify (önerilmişti); Railway |
| Kimlik | **Uygulama içi modül** | Keycloak; barındırılan kimlik servisi |

## Neden
- NestJS: modül, yetki koruması ve bağımlılık yönetimi hazır; çok kiracılı, çok modüllü yapıya uygun.
- Prisma: şema tek dosyada, tipler otomatik, göç araçları olgun.
- Ortak şema + RLS: en ucuz ve tek geliştirici için yönetilebilir; ayrımı veritabanı zorlar.
- BullMQ: yeniden deneme, zamanlama ve kanal başına hız sınırı hazır.
- Vite + React: giriş arkasındaki panel için yeterli; tanıtım sitesi ayrı tutulur.
- Yönetilen bulut: veritabanı yedeği ve ölçekleme hazır gelir (sahibinin tercihi; öneri Hetzner + Coolify idi, daha pahalı ama işletmesi daha az yük).

## Sonuçları ve dikkat edilecekler
- **Prisma + RLS:** Prisma satır düzeyi güvenliği kendiliğinden uygulamaz. Her istek ve her arka plan işi, veritabanı işlemi içinde kiracı kimliğini ayarlamak zorunda; uygulama veritabanına tablo sahibi olmayan bir rolle bağlanmalı (aksi halde RLS atlanır). Bu, ilk sprintte testle kanıtlanacak.
- **BullMQ işleri** kiracı kimliğini taşımalı; işçi, işi çalıştırmadan önce kiracı bağlamını kurmalı.
- **Yönetilen bulut:** yönetilen PostgreSQL, yönetilen Redis ve nesne depolama kullanılacak; bölge AB içinde (veri konumu, GDPR).
- **Uygulama içi kimlik:** şifre saklama, iki adımlı doğrulama, oturum ve şifre sıfırlama güvenliği bizim sorumluluğumuzda; hazır ve denenmiş kütüphaneler kullanılacak, kendi şifreleme kodumuz yazılmayacak.

## Hâlâ açık
- Bulut sağlayıcı: AWS mi GCP mi, hangi bölge
- Abonelik ve ödeme altyapısı
- İzleme ve hata takibi araçları
- Arama (başlangıçta PostgreSQL; ayrı motor gerekirse sonra)
- Pilot kapsamı ve geçiş sırası
