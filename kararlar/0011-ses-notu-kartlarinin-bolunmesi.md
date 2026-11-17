# 0011 — 16.11.2026 ses notu kartlarının Wawi ile Mixoutlet arasında bölünmesi

Tarih: 2026-11-17 · Durum: **Karar verildi** (ürün sahibi, 17.11.2026)

## Bağlam

16.11.2026 tarihli "Wawi & Mixoutlet" ses notları (35 madde, 13 başlık) 30 geliştirme kartına (K-01…K-30) ve 5 hukuki sınıra çevrildi. Kart metinleri ve yol haritası `Wawi & Mixoutlet — Geliştirme Kartları` belgesinde duruyor (Claude Docs: `https://claude.ai/artifact/8wLfsNjcvSf5PnzeZGuFnn`).

Kartların hangi sisteme ait olduğu başta sorulmadı. 29 kart (K-24 dışındakilerin tamamı) Mixoutlet vitrin deposunda (`/home/wpu/Desktop/Urunler/Mixo`, `demo/`) düz JavaScript ve `node:sqlite` ile kodlandı ve testten geçti. Sonra ürün sahibi kartların bölünmesi gerektiğini söyledi: bir kısmı vitrine, büyük bölümü WawiERP'ye ait.

Kodlamadan sonra beş alanlı bir inceleme konseyi kuruldu (güvenlik, iş kuralları doğruluğu, hukuki uyum, uçtan uca işlevsellik, mimari). 92 bulgu çıktı, beşi kritik. Bulguların çoğu yığından bağımsız iş kuralı ve güvenlik tuzakları; WawiERP sıfırdan yazılırken aynı tuzaklara düşmek mümkün.

## Karar

### 1. Kartların bölünmesi

| Sistem | Kartlar | Neden |
|---|---|---|
| **WawiERP** | K-01…K-09, K-13, K-14, K-15…K-23, K-25, K-27, K-28 (23 kart) | Çok kaynaklı ürün havuzu, pazar yeri feed'leri, toplu yükleme, satış yasakları, fiyat stratejisi, çok kiracılı SaaS ve kiracı API anahtarları, fatura ve iade, lojistik, canlı pano ve hedef sayaçları, tek gelen kutusu, personel ölçümü, pazar analizi — hepsinin verisi ve iş sahibi ERP'de |
| **Mixoutlet (vitrin)** | K-10, K-11, K-12, K-29, K-30 (5 kart) | Meta/Instagram paylaşımı, Google Ads, sepet terk retargeting, ziyaretçi davranışı, çerez ve e-posta rıza kaydı — hepsinin verisi ve kullanıcısı vitrinde doğuyor |
| **Ayrı proje** | K-26 (B2B platformu), K-24 (çok dilli görüntülü destek avatarı) | İkisi de kendi başına ürün; ne ERP'nin ne vitrinin parçası |

Sınırda duran ve ürün sahibinin tek tek karara bağladığı kartlar: **K-11 Mixo'da**; **K-14, K-19, K-21, K-22, K-25 Wawi'de**.

### 2. Bölünmenin doğurduğu iki sonuç

- **Fatura serisi tek yerdedir.** K-14'ün tamamı Wawi'de olduğu için storno (iade) fatura numarası tek ve kesintisiz bir seri olarak ERP'de kalır. İki sistemin ayrı numara üretmesi sorunu hiç doğmaz. Vitrin siparişinin iadesi de ERP'ye düşer: Mixo iade talebini iletir, parayı ve faturayı Wawi yönetir.
- **Süreç içi bağ entegrasyon noktasına dönüşür.** Mixo'da sipariş kancası hedef sayacını düşürüyor ve kargo firmasını seçiyordu. Bölünmeden sonra vitrindeki sipariş kancası yerinde kalır, ama hedef sayacını (K-19) ve kargo seçimini (K-16) Wawi'ye bildirmek zorundadır. Aynı biçimde `insights` ikiye ayrılır: ziyaretçi hunisi Mixo'da, pazar ve arbitraj analizi Wawi'de.

### 3. Mixo uygulaması kod kaynağı değil, **kural kaynağıdır**

`0002` gereği eski/başka kod taşınmaz; iş kuralları okunup yeniden yazılır. Mixo'daki uygulama düz JavaScript ve SQLite'tır; `0003` TypeScript + PostgreSQL + React, `0004` NestJS + Prisma + RLS der. Mixo kodunu kopyalamak bu kararların ikisini birden çiğner.

Bu yüzden Mixo deposundan WawiERP'ye **hiçbir dosya taşınmaz**. Mixo'dan alınan tek şey şudur:

- kodlanmış iş kuralı (eşleştirme anahtarı, formül, durum makinesi, idempotans anahtarı),
- konsey raporlarındaki 92 bulgunun ortaya çıkardığı tuzaklar,
- kabul kriterlerinin ölçülebilir hâli.

Bunlar `docs/12-kart-kural-sartnamesi.md` içine yazıldı. Mixo deposu bundan sonra WawiERP için **yalnız okunur referans**tır.

## Neden

- **Veri sahipliği bölünmeyi belirliyor.** Bir kartın verisi nerede doğuyorsa kart oradadır. Çerez onayı ve ziyaretçi hunisi tarayıcıda doğar (vitrin); fatura, stok, kiracı ve kargo ERP'de doğar.
- **Tek fatura serisi hukuki zorunluluk.** `0009` kural 5: fatura numarası şirket başına boşluksuz sıradır. İki sistem ayrı seri üretirse bu kural teknik olarak sağlanamaz. K-14'ü Wawi'ye almak sorunu doğmadan ortadan kaldırır.
- **Kural kaynağı ile kod kaynağı ayrımı `0002`'nin tekrarıdır.** Eski PHP sistemi için verilen karar (`legacy/` okunur, taşınmaz) Mixo için de aynen geçerlidir. Fark şu: Mixo kodu testli ve yeni, bu yüzden kopyalama isteği daha güçlü — karar bu yüzden açıkça yazıldı.
- **Konsey bulgularının çoğu yığından bağımsız.** Kural motorunun fail-open yüklenmesi, havuzun farklı ürünleri birleştirmesi, dört göz eksikliği, çerez onayının sunucuda uygulanmaması — bunlar SQLite'a ya da JavaScript'e özgü değil. Sıfırdan yazarken aynı hatalar tekrarlanabilir; bu yüzden tuzaklar şartnameye yazıldı.
- **B2B ve avatar ayrı tutuldu** çünkü ikisi de kendi kullanıcı kitlesi, kendi gelir modeli ve kendi uyum yükümlülüğü olan ürünlerdir; çekirdek oturmadan başlatılırsa ikisi de ERP'yi geciktirir.

## Reddedilenler

- **Mixo kodunu `yeni/` altına taşımak.** `0002` (sıfırdan) ve `0003` (TypeScript + PostgreSQL) ile çelişir. Çalışan ve testli kod olması bu iki kararı geçersiz kılmaz.
- **Kartların hepsini tek sistemde tutmak.** Vitrin kartlarını ERP'ye almak, ziyaretçi davranışı ve çerez onayını ERP'nin sorumluluğuna sokardı; ERP'nin kullanıcısı personeldir, ziyaretçi değil. Tersi de doğru değil: fatura ve stok vitrine ait olamaz.
- **K-14'ü (otomatik iade) vitrinde bırakmak.** Vitrin kendi storno numarasını üretirdi; `0009` kural 5 çiğnenirdi.
- **K-26'yı (B2B) WawiERP'nin bir modülü saymak.** Farklı taraf (Türk satıcı + Almanya'daki küçük alıcı), farklı gelir modeli (komisyon), farklı fatura sorumlusu. ERP kapsamını iki katına çıkarırdı.
- **Tuzakları atlayıp yalnız kartları yazmak.** Konsey bulguları olmadan şartname "ne yapılacak"ı söyler, "neyin yanlış gittiğini" söylemez; aynı hatalar tekrarlanır.

## Açık kalanlar

Kartlarda sayısal değeri netleşmemiş olanlar karar bekliyor; `docs/12-kart-kural-sartnamesi.md` son bölümünde toplandı. Özetle:

- K-08: Bronze/Silver/Gold paket limitleri (şirket ve mağaza sayısı) ve fiyatlandırma
- K-14: Hangi tutarın üzerindeki iade insan onayından geçecek
- K-17: UPS kuralını tetikleyen sipariş tutarı eşiği
- K-18: "Canlı" pano gerçek zamanlı mı, dakikalık yenileme mi
- K-21: %20 kısmi iade teklifinin geçerli olduğu ürün grupları ve üst sınırı
- K-23: Kaç şikayetten sonra tedarikçi raporu tetiklenecek
- K-26: B2B komisyon oranı ve faturanın kimin üzerine kesileceği (ayrı proje; burada kayıt amaçlı)

Ayrıca:

- Mixo ile Wawi arasındaki entegrasyon noktasının biçimi (vitrin siparişi → hedef sayacı, kargo seçimi, iade talebi) henüz tasarlanmadı. Olay tabanlı mı, iş kuyruğu mu, doğrudan çağrı mı — karar yazılmadı.
- Mevcut Wawi ve lojistik yazılımının hangi API'leri verdiği bilinmiyor; K-01 ve K-15 bu görülmeden tahmindir (`docs/11` §3, soru 10 ile aynı boşluk).
- Kartların WawiERP sprint sırasına yerleştirilmesi yapılmadı. Kart belgesindeki faz sırası Mixo'ya göredir; Wawi'nin kendi geçiş sırası (`0002` açık kalanlar) ayrıca kararlaştırılacak.
