# 0008 — İzleme araçları ve pilot kapsamı

Tarih: 2026-11-14 · Durum: **Karar verildi** (sahibi seçti)

## Kararlar
| Konu | Karar | Diğer seçenekler |
|---|---|---|
| İzleme ve hata takibi | **Sentry + CloudWatch** | Grafana Cloud (OpenTelemetry) |
| Pilot (ilk taşınacak parça) | **Istanbul deposu** — iki şirket; Trendyol, N11, Ozon | Technowelt Almanya (ayda ≈470 sipariş); eski kodu gördükten sonra karar |
| Abonelik ve ödeme altyapısı | **Ertelendi** — dış müşteri açılışına kadar gerekmiyor | Stripe Billing (önerilmişti), Mollie |

## Neden
- Sentry + CloudWatch: AWS (`0005`) üzerinde kurulumu en az uğraştıran seçenek; uygulama hataları ve yavaş istekler Sentry'de, altyapı kayıtları ve alarmlar CloudWatch'ta.
- Istanbul deposu: diğer depolardan ayrı çalışıyor ve son 30 günde yaklaşık 20 sipariş aldı (N11 10, Trendyol 9, Ozon 1); bir sorun ana işi etkilemez.

## Dikkat edilecekler
- Pilotun hacmi düşük olduğu için sistem yük altında sınanmış olmaz; Almanya kanallarına geçmeden önce gölge karşılaştırması ayrıca gerekir (`sunum/wawierp-mimari-ve-gecis.html`).
- Ozon'un son tam aktarımı 2026-10-18'de yarım kalmıştı; pilot öncesi bu bağlantının durumu netleşmeli.
- Sentry'ye müşteri kişisel verisi gönderilmemeli (hata kayıtlarında maskeleme).

## Hâlâ açık
- Abonelik ve ödeme altyapısı
- Kiracı başına kota ve asistan kullanımının fiyatlandırılması
