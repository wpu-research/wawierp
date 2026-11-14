# WawiERP — Güvenlik ve Uyum (pasif gözlem)

Tarih: 2026-11-14 · Yöntem: yalnız gözlem. Kaynaklar: giriş sayfası yanıt başlıkları (bu turda tek GET + `/assets/` dosyası başlığı), `docs/01-sirket-analizi.md`, `docs/panel/01…05`, indirilen statik JS'in okunması (`docs/07-api-yuzeyi.md`). Tarama, zorlama, yetki denemesi, parametre kurcalama yapılmadı. Hukuki görüş değildir; kontrol listesi niteliğindedir (ayrıca bir avukat/vergi danışmanı gerekir). Kişisel veri değerleri yazılmadı.

## 1. Taşıma ve başlıklar (giriş sayfası, 2026-11-14)
| Başlık / özellik | Değer | Değerlendirme |
|---|---|---|
| CSP | `default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'` | İyi. Satır içi betik yok → XSS etkisi azalır. **Not:** `connect-src` tanımsız → `default-src 'none'`e düşer; giriş sayfası için sorun değil, panel sayfalarında farklı CSP olmalı (panel başlıkları oturum kapalı olduğu için bu turda görülemedi) |
| `X-Content-Type-Options` | nosniff | İyi |
| `X-Frame-Options` | SAMEORIGIN (CSP `frame-ancestors 'none'` ile çelişkili, CSP baskın) | Küçük tutarsızlık |
| `Referrer-Policy` | strict-origin-when-cross-origin | İyi |
| `Permissions-Policy` | camera=(self), microphone=(), geolocation=() | İyi (kamera barkod sayımı için) |
| HSTS | **yok** (Cloudflare ayarı değilse sunucuda da yok) | Eksik |
| `X-Powered-By` | PHP/8.1.34 + PleskLin | Sürüm ifşası; PHP 8.1 güvenlik desteği 31.12.2025'te bitti → desteklenmeyen |
| Önbellek | `no-store, no-cache` (HTML) · `max-age=14400` (JS) | HTML için doğru; JS sürüm eki (`?v=`) var |
| Çerez (giriş öncesi) | `WAWIWELCOME`: Secure, HttpOnly, SameSite=Lax | İyi. Panel oturum çerezi bu turda görülemedi |
| Edge | Cloudflare (WAF/bot katmanı olabilir; yapılandırma bilinmiyor); DNSSEC kapalı; security.txt yok; MX/SPF/DMARC yok (`01`) | |
| Origin kararlılığı | 525/500 ve panelde 504 (`01`, `03`) | Kullanılabilirlik riski |

## 2. Kimlik doğrulama ve yetki
Görüldü (belge kaynaklı):
- Giriş: e-posta+şifre veya eski PIN; "tarayıcı kapatılınca oturum sonlanır". Riskli ekranlar (`pin-permissions`, birleştirme) ayrı master PIN / yönetim PIN'i ister. Master oturumunu açan form `master_reauthenticate`.
- Roller (team): Sistem yöneticisi, Kategori atama yöneticisi, Kategori sorumlusu, Depo sorumlusu, Depo çalışanı, Wawi operasyon, Ürün giriş operatörü; 16 çalışan. Kapsam: tüm depolar / çoklu / tek depo; yetki türü "Ürün ve stok" veya "Görüntüleme". Görev bazlı ince izin "hazırlanıyor" (yok).
- Menü sunucuda izne göre filtreleniyor; yetkisiz API çağrısı sunucuda reddediliyor ve "Yetkisiz API erişimi engellendi" olarak denetime düşüyor (7 günde 727 engellenen).
Riskler:
- PIN tabanlı kimlik: PIN çalışan adına değil tutar; denetim kaydında kullanıcı **PIN'in son 2 hanesi** → kişi ayırt edilemez, iki kullanıcı aynı iki haneyi paylaşabilir (tahmin: PIN uzunluğu bilinmiyor). Bireysel hesap verebilirlik zayıf.
- Çalışan adıyla rol adı karışık kullanılmış → paylaşılan hesap şüphesi (tahmin).
- Eylem başına yetki (`invoices.php` ≈35, `dhl-labels.php` ≈40 eylem) sunucuda denetleniyor mu bilinmiyor (statik analizle doğrulanamaz).
- Yeni oturum süresi/boşta zaman aşımı ve eşzamanlı oturum sınırı bilinmiyor; 2FA yok (görülmedi).
- Yönetim PIN korumasının tutarsızlığı (bazı geri alınamaz işlemlerde var, toplu stok düzenlemede görülemedi) — `03`.

## 3. CSRF ve istemci güvenliği
- CSRF: gövde alanı `csrf` (19 dosya), değer sayfa HTML'inden; başlık tabanlı ek koruma görülmedi; SameSite=Lax çerezle birlikte makul. Çift gönderim koruması için idempotency anahtarı yalnız 8 dosyada.
- `innerHTML` yazımları (dhl-labels 12, wholesale-sales 13, erp 6, dhl-recreate 6, order-customer-edit 5, dhl-recreate-batch 5, app 2): sıkı CSP satır içi betiği engellediği için etki sınırlı, ama kaçışın her yerde uygulandığı doğrulanmadı → kaynak kodda incelenmeli.
- Gizli anahtar/token JS'te bulunmadı; SMTP parolası formu yalnız giriş alanı.

## 4. Kişisel veri: nerede açık (tür ve ekran; değer yok)
| Ekran / yüzey | Veri türü | Not |
|---|---|---|
| `orders-pool`, `orders-ebay`, `orders-kaufland`, `warehouse-orders`, `company-home` (sipariş satırları) | müşteri adı, teslimat adresi, e-posta, telefon | "Müşteri bilgileri" kapalıyken bile DOM'da açık (`01`); toplu listelenir |
| `warehouse-orders view=customers`, depo şirket kartları | kişi adı, adres, e-posta, telefon | |
| `shipping` (DHL merkezi) | alıcı adı/adresi, takip no | sipariş kartları |
| `returns`, `tickets` | müşteri adı, mesaj içeriği | ticket içeriği pazaryeri müşteri sorusu |
| `customers-master` | B2B cari: ünvan, vergi no, bakiye, e-posta | |
| `invoices`, `finance-documents` | alıcı adı, adres, vergi no, fatura tutarı | |
| `team` | çalışan adı, rol, PIN durumu | PIN değeri gösterilmiyor |
| `audit-logs` | IP adresi, kullanıcı (PIN son 2 hane), nesne türü | IP kişisel veri sayılır |
| Dışa aktarım (`accounting`: CSV/Excel/DATEV) | fatura/müşteri verisi | indirme yapılmadı; erişim kaydı bilinmiyor |
Bulgu: veri **sunucuda yetkiye göre kısılmıyor, istemcide gizleniyor** (kapalı ama DOM'da). Rol başına alan düzeyinde maskeleme yok.

## 5. Denetim kaydı kapsamı
- 83.070 kayıt; işlem kayıtları 180 gün, hata kayıtları 30 gün saklanıyor (haftalık temizlik). 7 gün: 21.969 toplam, 5.199 hata, 727 engellenen.
- Alanlar: zaman, sonuç, önem, olay, modül, kullanıcı (maskeli), oturum türü, depo/şirket, kaynak, nesne türü, IP, ağ geçidi. Kategoriler: güvenlik, ürün/stok, katalog, organizasyon, satın alma, finans, bağlantı, sistem.
- Boşluk: kişisel veri **okuma** olayları (müşteri listesi görüntüleme, dışa aktarım) kaydediliyor mu bilinmiyor; DHL rutin çağrıları gürültü yaratıyor; "önce/sonra" değerleri ayrıntıda olabilir (açılmadı); değişmezlik/yedek bilinmiyor.
- GoBD açısından: finansal belgelerle ilgili işlem kaydı 180 gün tutulursa, değişiklik izi (kim neyi değiştirdi) 10 yıllık belge saklama süresiyle uyumlu olmayabilir (aşağıya bkz.).

## 6. Uyum boşlukları (kontrol listesi)
| Alan | Gözlem | Boşluk / soru |
|---|---|---|
| Impressum / gizlilik / KVKK-GDPR metni | tanıtım sitesinde yok (`01`); **panelde** görülmedi | DE'de ticari site için Impressum (TMG/DDG) ve DSGVO bilgilendirmesi; iç panel için çalışan bilgilendirmesi |
| DSGVO işleyici sözleşmeleri / VVT | bilinmiyor | pazaryeri, DHL, Cloudflare, Plesk barındırma sağlayıcısı için AVV; işleme faaliyetleri kaydı |
| Silme/anonimleştirme | sipariş/ticket/iade müşteri verisi için saklama süresi ve silme akışı görülmedi | DSGVO Art. 17 ve saklama çatışması (fatura 10 yıl) için politika |
| Erişim talebi | müşteri verisini tek yerden getirme aracı yok | Art. 15 için müşteri bazlı arama/dışa aktarım gerekir |
| Veri aktarımı | TR (İstanbul deposu, TR şirketleri) ↔ AB | KVKK yurt dışı aktarım + DSGVO üçüncü ülke (Türkiye yeterlilik kararı yok → SCC) |
| GoBD / fatura saklama | satış faturası numarası şirket-yıl-sıra (`RE-…`), taslak/kesinleştirilmiş durumu var, iade `RET-`; denetim izi 180 gün | kesinleştirilen belge **değişmez** mi, düzeltme yalnız iptal+yeni belge ile mi (bilinmiyor); 8/10 yıl saklama, yedekleme ve veri erişimi (Z3) için DATEV/CSV dışa aktarım (kısmen var) |
| E-fatura | DE'de B2B için alıcı e-fatura alımı 2025'ten beri zorunlu, gönderme 2027–2028 kademeli (XRechnung/ZUGFeRD) | sistem PDF/e-posta çıkarıyor; yapılandırılmış e-fatura çıktısı görülmedi |
| KDV / OSS | muhasebe özeti %19 sabit (`04`); 12 şirket DE/NL/TR | ülke bazlı oran, OSS (AB içi B2C uzaktan satış eşiği €10.000), ters yük, brüt/net ayrımı yok; KDV beyanı için yanlış özet riski |
| Dönemsel kapanış | ön muhasebe 41 kanalda 0 sipariş gösteriyor | veri hattı güvenilir olmadan beyan/mutabakat yapılamaz |
| Pazaryeri API anahtarları | sunucuda şifreli kayıtlı (Asterbuy "şifreli kayıtlı") | anahtar saklama/yenileme politikası bilinmiyor |
| Yedekleme / felaket kurtarma | görülemedi | RPO/RTO, geri yükleme testi |

## 7. Öncelikli riskler (etki × olasılık, gözlenene göre)
1. Müşteri verisi DOM'da yetkisiz kullanıcıya açık (sunucu tarafı kısma yok) — yüksek.
2. Desteklenmeyen PHP 8.1 + HSTS yok + sürüm ifşası — yüksek (düzeltmesi ucuz).
3. PIN'e dayalı, maskeli kullanıcı denetimi → hesap verebilirlik zayıf — yüksek.
4. Sabit %19 KDV özeti ve boş ön muhasebe → vergi raporu hatası — yüksek.
5. Denetim süresi (180 gün) ile GoBD/ihtilaf ihtiyacı uyumsuz, DHL gürültüsü — orta.
6. Yönetim PIN'i korumasının tutarsızlığı (toplu stok) — orta.
7. İki yazma yolu için ortak denetim/CSRF garantisi yok — orta.
8. Tek origin, 504/525 — kullanılabilirlik, orta.

## 8. Görülemeyenler / Sınırlar
- Oturum kapalı olduğundan panel sayfalarının yanıt başlıkları, panel oturum çerezinin bayrakları ve panel CSP'si bu turda **gözlenemedi**; yukarıdaki başlık tablosu yalnız giriş sayfasıdır. Oturum açıldığında yalnız `navigate` ile ve tek sayfada eklenecek.
- Sunucu tarafı yetki, oturum süresi, parola politikası, 2FA, hız sınırı, yedekleme, şifreleme, log saklama: kod/şema ve yönetici beyanı gerekir.
- Hukuki sonuç çıkarılmadı; GoBD, DSGVO, KVKK, UStG/OSS ve e-fatura maddeleri güncel mevzuatla bir uzmanca doğrulanmalı (tarihler/eşikler bu belgede hatırlatma düzeyindedir).
- Hiçbir tarama veya yetki denemesi yapılmadı; dolayısıyla "açık yok" anlamına gelmez.
