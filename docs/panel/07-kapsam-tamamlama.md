# WawiERP Panel — Kapsam Tamamlama (2. tur, yalnız okuma)

Tarih: 2026-11-14 · Yöntem: kullanıcının açtığı yönetici oturumunda tek sekme, yalnız `navigate` (GET) + DOM okuma; sayfalar arası ≥5 sn; hiçbir düğme/form/klavye. Kişisel veri, satıcı kimliği, tekil numara yazılmadı. `docs/panel/06-*` (başka oturum) ve ürün kartı ekranlarına dokunulmadı. Bu tur kapsamı: görülen sayfa sayısı 15 (aşağıdaki tablo); kalanlar "Görülemeyenler"de.

## Bulgular
| Ekran | Adres | Yeni bulgu |
|---|---|---|
| tr-market (Trendyol) sekmeleri | `tab=questions` | Müşteri soruları tablosu: Tarih/Gönderen · Sipariş/Açıklama · Tutar · Sonuç; durum filtresi: Tümü, Yanıt bekliyor, Yanıtlandı, Yanıtsız kapandı, Bildirildi, Reddedildi |
| | `tab=actions` | İşlem geçmişi: Zaman (UTC) · İşlem/Hedef · Durum · Açıklama · Kontrol; ayrıca özet: sipariş paketi sayısı, müşteri sorusu sayısı, "son tamamlanan okuma" zamanları (saatlik otomatik okuma) |
| | `tab=history` | Aktarım geçmişi: Zaman (UTC) · Adım · Durum · Varyant adedi · Açıklama (12 satır). Katalog kapsamı: 93 ürün ailesi, 113 barkod/varyant, 90 satışta, 2 onay sürecinde, **86 inceleme gereken**, 13 kategori |
| | `tab=dashboard` | Sayfa `actions`/`history` ile aynı içeriği veriyor: `tab` değeri farklı sekmeyi seçmiyor (dashboard ayrı bir sekme değil, geçersiz değer varsayılana düşüyor — tahmin) |
| tr-market N11 | `platform=n11&tab=dashboard` | Sekmeler: Siparişler · İşlem geçmişi · Genel bakış (Müşteri sorusu sekmesi **yok**). 49 ürün/SKU, 48 satışta, **45 EAN'siz ürün**, 9 sipariş paketi; ürün aktarımı ve sipariş aktarımı "N11'den güncelle" düğmesiyle, otomatik kontrol saatte bir; ilk sipariş aktarımı son 90 gün. Hesap DOCSER, depo Istanbul |
| warehouse-home 3 (Hollanda) | `warehouse=3&workspace=1` | 3 şirket, 7 satış kanalı; "Otomatik çekim günde iki kez"; "Henüz güncelleme çalıştırılmadı"; bölümler: Depo→Şirket→Kanal, depo veri akışı, ürün ve stok girişi, tedarikçiler, kanal özeti, son siparişler. Sayfa TTFB 3,2 sn |
| warehouse-home 2882 (Technowelt) | `warehouse=2882&workspace=1` | 1 şirket, 3 satış kanalı; aynı yapı. 2881 (Mega B) bu turda açılmadı |
| returns | `view=labels` | Aşağıdaki filtreler: şirket (Lady Empire GmbH, Woida, Ivobuyshop), platform (Shopify, Metro, Kaufland, Ebay), depo (yalnız Almanya Warehouse). Sayfa 0 satır; sayfalama parametresi `p` |
| invoices | `view=orders&warehouse=3` ve `=2881` | Her iki depo 0 kayıt ("Bu depoda kayıtlı fatura yok"). Sekmeler: Satış / İade / Tedarikçi / Kargo faturaları; filtre: depo (tek depo ya da "Tüm depolar"), belge durumu (Kesinleştirildi, Taslak, İptal), tarih aralığı. Önceki bulgu doğrulandı: fatura verisi yalnız Almanya deposunda |
| finance-documents | `warehouse=3` | "Çıkış belgesi merkezi": 0 satır; belge türü açıklaması: müşteri → satış faturası, farklı yasal şirket → şirketler arası fatura, aynı şirket depoları → depo sevk belgesi; kısayollar: Alış faturası gir, Sevkiyatları aç, Ön muhasebeyi aç |
| audit-logs | `outcome=denied` | Filtre adresle çalışıyor; son 7 gün sayaçları ilk turdan farklı: toplam 21.928, başarılı 15.956, **engellenen 746** (önce 727), **hata 5.204** → engellenen ve hata sayaçları saat içinde değişiyor (canlı akış). Tablo satırları bu görünümde `tbody tr` olarak bulunamadı (kart biçimi olabilir) |
| tickets | `/?page=tickets` | Filtre: şirket (7), platform (n11, trendyol, ozon, shopify, ebay, kaufland, amazon), kanal (şirket · platform · hesap), durum: Yanıtımız bekleniyor · Müşteri/platform bekleniyor · Kapalı/yanıtlandı · Okunmamış. Liste öğeleri tablo değil |
| erp-features | `warehouse=1` | 28 modül: **20 kullanıma hazır, 8 hazırlanıyor**; 6 grup: Depo ve şirket operasyonları, Depo ve stok yönetimi, Satış ve kanal operasyonları, Satın alma ve belgeler, Ön muhasebe ve finans, Yetki-entegrasyon-denetim. "Hazırlanıyor" örneği: lot/seri/son kullanma takibi |
| team | `/?page=team` | Çalışan kartları (kart başına başlık = ad). Rol dağılımı (görülen etiket sayısı): Kategori sorumlusu 5, Depo çalışanı 3, Sistem yöneticisi 1, Depo sorumlusu 1, Wawi operasyon 1, Ürün giriş operatörü 1, Kategori atama yöneticisi 1; bir kayıt "test" adlı (test hesabı üretimde). Kişi adları yazılmadı |
| order-summary | `view=cards` | "Tüm sipariş özeti": son 24 saat ↔ önceki 24 saat karşılaştırması; kapsam 4 depo · 11 firma · 14 platform · 41 kanal; son 24 saatte 148 sipariş; ödeme yöntemine göre gruplama (banka/havale/EFT ayrı, "ödeme bekliyor" ayrı gösteriliyor, toplama dahil); "Yenile" düğmesi; saat Almanya saati. Başka `view` değeri bulunamadı (sayfada bağlantı yok) |

## Çıkarımlar
- Ön muhasebe "41 kanalda 0 sipariş" (önceki tur) ile order-summary "41 kanal, 148 sipariş/24 sa" yan yana: sipariş verisi var, muhasebe özeti **başka kaynaktan** okuyor → tek kaynaktan sayaç ilkesi (03 §5.8) doğrulanıyor.
- Sayaçlar canlı (audit-logs engellenen 727→746 saat içinde); kısa vadeli karşılaştırma için sayfaya zaman damgası gerekir.
- N11'de 45/49 ürün EAN'siz; Trendyol'da 86 inceleme gereken ürün: kanal sağlık göstergeleri ana ekranlarda yok, her kanal kendi sekmesinde.
- `tab=dashboard` geçersiz değerde sessizce başka sekmeye düşüyor (sağlam yönlendirme/404 yok).
- Üretim sisteminde "test" adlı çalışan kaydı var.

## Görülemeyenler / Sınırlar
- Açılmayanlar: `returns` diğer 7 görünüm (received, paid, unpaid, waiting_product, resent, issues, resolved) — `labels` boş olduğundan diğerleri de bu turda denenmedi; `warehouse-home` 2881; `invoices` diğer görünümler (iade/tedarikçi/kargo) ve depo 2/2882; `finance-documents` 2881/2882; `orders-pool` filtre kombinasyonları (kaynak/tarih/durum/tedarik/depo) — müşteri verisi içerdiğinden ve sunucu yavaş olduğundan bu turda yalnız yapı belgelerden; `audit-logs` diğer filtreler (severity, category, from/to); `order-summary` başka görünüm.
- `tickets`, `audit-logs`, `team`: liste öğeleri tablo olmadığından sütun adı çıkarılamadı; içerik kişisel veri taşıdığından alınmadı.
- Ürün listeleri/filtreleri bu turda açılmadı (kapsam dışı bırakıldı, gerek yok).
- Bu tabloda her sayfa tek kez açıldı; sayılar o ana ait.
