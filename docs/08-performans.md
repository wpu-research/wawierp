# WawiERP — Performans (pasif ölçüm)

Tarih: 2026-11-14 · Yöntem: panelde gezilen 15 sayfada tarayıcının `performance` kayıtları (Navigation/Resource Timing) DOM'dan okundu; yeni istek, yenileme ya da yük üretilmedi. Sunucu yükü: sayfa başına tek yükleme, ≥5 sn ara. Örneklem küçük (sayfa başına 1 ölçüm, öğleden sonra Almanya saati, Cloudflare arkası) → rakamlar **gösterge**, istatistik değil.

## 1. Sayfa başına özet
| Ölçüt | Gözlem |
|---|---|
| İstek sayısı / sayfa | 91–98 (tr-market 94–97, tickets 98, warehouse-home 92, invoices 92, returns 93, erp-features 91) |
| Aktarılan bayt | ≈16 KB (betikler/önbellek tarayıcıda; aktarım çoğu `max-age` ile önbellekten). Açılmış (decoded) toplam ≈1,7 MB ilk bakışta |
| Sunucu TTFB (sayfa HTML) | tipik 0,2–0,6 sn; **warehouse-home (3): 3,2 sn; order-summary: 2,1 sn; finance-documents (3): 1,4 sn; warehouse-home (2882): 1,2 sn** |
| Sayfa tamamlanma | 0,4–1,5 sn; **warehouse-home (3): 3,6 sn; order-summary 2,4 sn** |
| Oturum başı arka plan API çağrısı | her sayfada 5–6: `warehouse-messages`, `menu-counts`, `returns`, `product-pool-count` (×2), `operational-notes` (+ `directory-search` depo ekranlarında) |

## 2. Yavaş uçlar (aynı sayfa yüklemesinde)
| Uç | Gözlenen süre | Not |
|---|---|---|
| `menu-counts.php` | **5,8–8,0 sn** (4 örnek: 7,97 · 6,25 · 6,99 · 5,85) | Her sayfada çağrılıyor ve en yavaş uç; bazı sayfalarda hiç görünmedi (önbellek/aynı sayfada tekrarsız) |
| `operational-notes.php` | 0,8–4,1 sn (0,83 · 1,67 · 2,10 · 3,50 · 4,08 · 2,02) | sayaç ucu için çok yüksek, dalgalı |
| `returns.php?action=counts` | 0,5–2,0 sn | sayaç |
| `product-pool-count.php` | 0,08–0,49 sn, **sayfa başına iki çağrı** | iki ayrı betik/parametre (`group=physical` ve genel) |
| `warehouse-messages.php` | 0,08–0,28 sn | hızlı ama her sayfada |
| `directory-search.php` | 0,11 sn | depo ekranlarında |
| `session-status.php` | bu turda kaynak listesinde yok | `05` bunu önceki turda gördü |

Yorum: önceki turdaki "liste uçları 15–30 sn" bu turdaki sayfalarda görülmedi; en yavaş şey **menü sayaçları**. Bu sayaçlar sayfa içeriğinin kendisini bloklamıyor (sayfa 0,4–1,5 sn'de tamamlanıyor) ama kenar menü rozetleri 6–8 sn sonra doluyor ve sayaç döngüsü 120 sn'de bir tekrar ediyor (bkz. `07-api-yuzeyi.md`).

## 3. Yinelenen / gereksiz istekler
- `product-pool-count.php` her sayfada 2 kez.
- Her sayfada 43 betik + CSS yeniden doğrulanıyor/çiziliyor (≈91 kaynak); sayfaya özel yalnız birkaçı gerekli.
- `menu-counts`, `returns`, `operational-notes`, `product-pool-count`, `warehouse-messages`: aynı bilgi sınıfı (sayaç) için **5 ayrı uç** → tek `summary` ucu ve tek yoklama döngüsü (bkz. `07` §3).
- İptal (ERR_ABORTED) bu turda Resource Timing'den görülemedi (ağ günlüğü okunmadı); önceki tur: gezinme sırasında iptaller.

## 4. İlk bulgular → hedefler (öneri değil, ölçüt)
- Sayaç ucu P95 < 500 ms hedefi gerçekçi değilse sayaçlar önceden hesaplanmalı (önbellek/maddeleştirilmiş görünüm).
- Depo ana ekranı (3,2 sn TTFB) sunucu tarafı render + dört sorgu birleşimi olabilir; ayrıştırma gerekir.
- Sayfa başına istek sayısı 91 → hedef <30 (paketleme/yalnız gereken modül).

## 5. Görülemeyenler / Sınırlar
- Tek ölçüm/sayfa, saat dilimi/ yük etkisi yok; sunucu tarafı profil (sorgu, kilit, kuyruk) bilinmiyor.
- Önceki turdaki 15–30 sn'lik liste uçları (`/allordersfilter`, `warehouse-orders`, ürün listeleri) bu turda **açılmadı** (sunucuyu yormamak ve ürün listesi/müşteri verisi nedeniyle) → güncel durumları doğrulanmadı.
- Ağ günlüğü (`read_network_requests`) okunmadı; yalnız Resource Timing. İptal/yeniden gönderim, başlık boyutu, sıkıştırma oranı ölçülmedi.
- Cloudflare önbellek/CDN etkisi (AMS) ve Türkiye'den erişim ölçülmedi.
