# WawiERP — Yeniden Tasarım Girdileri (birleşik)

Tarih: 2026-11-14 · A–G belgelerinin sentezi: `docs/panel/07`, `05`, `06`, `07-api-yuzeyi`, `08`, `09`, `10`, ayrıca `03`. Karar değildir; karar için girdidir (kararlar `kararlar/` altında, 0001–0010; yalnız sahibi karar verirse yazılır).

## 1. Önceliklendirilmiş sorun listesi (etki × sıklık)
Puan: Etki (1–3) × Sıklık (1–3). Kanıt düzeyi: **G** görüldü, **Ç** çıkarım.

| # | Sorun | Etki | Sıklık | Puan | Kanıt | Kaynak |
|---|---|---|---|---|---|---|
| 1 | Müşteri kişisel verisi sunucudan kısılmadan DOM'a geliyor (kapalı görünse de) | 3 | 3 | 9 | G | 09 §4 |
| 2 | Sayaçlar ve özetler çelişiyor: ön muhasebe 41 kanalda 0 sipariş ↔ sipariş özeti 24 saatte 148 sipariş; kısayol sayısı ↔ liste; ticket 450 ↔ ≈3.400 | 3 | 3 | 9 | G | 03 §4.2, panel/07 |
| 3 | KDV özeti %19'a sabit; 12 şirket DE/NL/TR; OSS/ters yük yok → vergi raporu hatası | 3 | 2 | 6 | G | 03, 09 §6 |
| 4 | Kenar menü sayaçları 6–8 sn'de doluyor; her sayfada 91–98 istek, 43 betik hepsi hep yüklü | 2 | 3 | 6 | G | 08 |
| 5 | İki yazma yolu (`erp_action` formları ve `/api/*.php`), CSRF/idempotency/denetim garantisi ortak değil; tek-uç-çok-eylem (≈35 ve ≈40 eylem) | 3 | 2 | 6 | G/Ç | 07-api |
| 6 | Kimlik: PIN, denetimde yalnız son 2 hane; paylaşılan/test hesap; granül görev izni yok | 3 | 2 | 6 | G | 09 §2, panel/07 |
| 7 | Desteklenmeyen PHP 8.1, HSTS yok, sürüm başlığı ifşası | 3 | 2 | 6 | G | 09 §1 |
| 8 | Stok modeli: fiziki/drop/sanal/tedarikçi stoğu ayrı alanlar, hareket defteri yok; stok işleyici gecikmesi (592 düzeltme, 106 açık işlem) | 3 | 2 | 6 | G | 03, 06 |
| 9 | Kanal başına sayfa/JS/uç kopyası (sipariş şablonu 5 kopya; DHL ve fatura üçlüleri) | 2 | 3 | 6 | G | 03 §4.3, panel/05 |
| 10 | Denetim kaydı: işlem 180 gün, hata 30 gün; DHL rutin gürültüsü (7 günde ≈5.200 hata); GoBD/ihtilaf süresi için kısa | 2 | 2 | 4 | G | 09 §5 |
| 11 | 79 iadenin hepsi ilk aşamada; iade akışı ilerlemiyor | 2 | 2 | 4 | G | 03 §4.4 |
| 12 | Kanal sağlık göstergesi ana ekranda yok: N11'de 45/49 ürün EAN'siz, Trendyol'da 86 inceleme gereken | 2 | 2 | 4 | G | panel/07 |
| 13 | Sabit kodlanmış kanal/depo kimlikleri (dhl-labels, order-customer-edit) | 2 | 1 | 2 | G | panel/05 |
| 14 | Adlandırma: shipments/shipping, pool üç anlam, TR/DE karışık, `tab=dashboard` geçersiz değeri sessizce düşüyor | 1 | 3 | 3 | G | 05-bilgi |
| 15 | Uyum boşlukları: Impressum/DSGVO/KVKK metni, silme/erişim akışı, e-fatura çıktısı (yapılandırılmış) | 3 | 1 | 3 | Ç | 09 §6 |
| 16 | Üretimde "test" adlı çalışan kaydı; banka ekstresi özelliği "hazırlanıyor" ama içe aktarma zaten var | 1 | 1 | 1 | G | panel/07, 03 |

## 2. Hedef mimari için girdiler
- Tek kanal bağdaştırıcı arayüzü + kanal eklentileri (sorun 9); tek API katmanı (5); stok defteri (8); sayaç/özet tek kaynaktan, önceden hesaplı (2,4); bağlam rota parametresi (13); sunucuda alan düzeyinde yetki/maskeleme (1,6); ülke bazlı vergi motoru (3); kuyruk + durum ekranı eşitleme için.
- Üç seçenek ve rakip karşılaştırması: `docs/10-rakip-ve-hedef-mimari.md` (kararsız; ekip/süre rakamları kaynaksız tahmin).
- Geçişte canlı üretim zorunluluğu: strangler yaklaşımı gerektirir; sayaç/özet ve kişisel veri maskeleme düşük riskli ilk iyileştirmeler (kaynak kod gelince doğrulanacak).

## 3. Açık sorular (sahibine)
1. Müşteri bilgisini hangi roller görmeli (ad/adres/telefon/e-posta ayrı)? Bugün roller bunu ayırıyor mu?
2. KDV: her şirket için hangi oranlar/rejimler (DE, NL, TR; OSS kaydı var mı)? Muhasebe özeti hangi kaynaktan okuyor; kim kullanıyor (DATEV)?
3. Faturalar yalnız Almanya deposunda mı (Hollanda ve Mega B 0 kayıt)? NL/TR şirketleri faturayı başka yerde mi kesiyor?
4. Kesinleşen fatura bugün değişebiliyor mu (düzeltme = iptal + yeni belge mi)? Saklama süresi/yedek nerede?
5. Çalışan hesapları: PIN kişiye mi ait; paylaşılan hesap var mı; "test" hesabı silinebilir mi?
6. İade akışı: 79 iade neden ilk aşamada? Süreç panelin dışında mı yürüyor?
7. Gerçek gün sayıları: günlük sipariş (148/24 sa normal mi), kanal başına dağılım, tepe saatler — hedef boyutlandırma için.
8. Öncelik: önce güvenlik/uyum mu, performans mı, yoksa yeni kanal/özellik mi?
9. İş modeli: yalnız kendi şirketleriniz mi, yoksa dışarıya (başvuru formu, `company-applications`) hizmet olarak da sunulacak mı? Fiyat/çok kiracılı yapı etkiler.
10. `session-status.php` / `warehouse-messages.php` hangi dosyada çağrılıyor? (JS'te yok)

## 4. Kaynak kod/şema gelince doğrulanacak varsayımlar
| Varsayım | Nerede | Nasıl doğrulanır |
|---|---|---|
| Uç yöntemleri ve R/W sınıfı eylem adından | 07-api | Uç dosyalarında yöntem/yetki denetimi |
| Eylem başına rol denetimi sunucuda var | 09 | Yetki katmanı kodu |
| Menü ağacı yerleşimi, tık sayıları tahmin | 05-bilgi | Menü şablonu |
| Durum makineleri tetikleyicileri (sipariş, iade, ilan, sevkiyat) | 06 | Durum alanı atamaları |
| 44 olası tablo ve ER ilişkileri | 06 | Gerçek şema |
| `tab=dashboard` fallback, sayaç kaynakları | panel/07 | Yönlendirme ve sayaç sorguları |
| menu-counts yavaşlığı sorgu mu yoksa kilit mi | 08 | Sorgu planı, yavaş sorgu günlüğü |
| Kişisel veri DOM'da yetkiye bakılmadan | 09 | Şablon koşulları |
| Fatura değişmezliği/numaralandırma | 09 | Fatura servisi |
| Rakip fiyat/özellik iddiaları | 10 | Tarih damgalı yeniden kontrol |

## 5. Görülemeyenler / Sınırlar
- A ve E tek ölçüm/örneklem; birçok ekran açılmadı (bkz. `panel/07` ve `08` sınırları). Ürün listeleri ve ürün kartı ekranlarına bilerek girilmedi.
- Bu belge belgeler arası sentezdir; alt belgelerdeki "tahmin" işaretli maddeler burada puanlanırken **Ç** ile işaretlendi.
- Etki/sıklık puanları yazarın yargısıdır, sahibi onayından geçmedi.
