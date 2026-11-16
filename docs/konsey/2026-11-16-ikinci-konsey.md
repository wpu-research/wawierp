# WawiERP — İkinci konsey (3 tur)

Tarih: 2026-11-16 · İsteyen: proje sahibi · Yöntem: incele → düzelt → yeniden incele. Yedi konsey üyesi (hepsi Sonnet), kendi dosyalarını baştan sona okudu, hiçbiri dosya değiştirmedi. Düzeltmeler `yeni/panel-mock` içinde yapıldı; tur 3'te altı üye yalnız değişikliklere ve kaçanlara baktı. Dünkü rapor: `konsey-incelemesi.md`; aynı bulgular yeniden raporlanmadı.

Ölçüt: `kararlar/0009` (taslak panel gerçek sistemin davranış şartnamesidir).

## 1. Özet

| | Sayı |
|---|---|
| Tur 1 ham madde (yedi üye, örtüşenler dahil) | yaklaşık 115 |
| Tekilleştirilmiş bulgu | yaklaşık 70 |
| Tur 2.de düzeltilen (kaba sayım) | yaklaşık 35 |
| Tur 3'te çıkan yeni gerçek hata (düzeltildi) | 9 |
| Tur 3 sonrası açık, düzeltilmedi (kaba sayım) | yaklaşık 22 (bölüm 6) |
| Sahibinin kararını bekleyen | 9 (bölüm 7) |

Birçok madde birden çok üyenin raporunda geçti (ciro, etiket/sevk kapısı, sayımın deftere yazılmaması, çekmece odağı).

## 2. Tur 1 bulguları

"Doğrulandı" sütunu: **K** = kodu kendim okuyarak doğruladım, **Y** = yerelde de denedim, **R** = yalnız üyenin raporu (kaynağı okumadım), **T3** = tur 3'te başka bir üye de aynı sonucu verdi.

### Kritik / yüksek

| # | Bulgu | Kanıt | Doğrulandı |
|---|---|---|---|
| 1 | Etiket ve sevk yalnız durum denetliyordu: ödemesi gelmemiş, sorunlu ya da tedarikçiden gidecek siparişe etiket/sevk verilip stoktan düşülüyordu; etiket sorun alanını siliyordu. Kapı yalnız asistanda vardı. | `store.tsx` createLabels/ship, `Orders.tsx` | K, Y |
| 2 | Kesin fatura (toplu ve çekmece) onaysızdı; B2B "faturaya çevir" geri alınabiliyordu ve numarası şirket başına sıralı değildi | `Orders.tsx`, `store.tsx` finalizeB2B | K |
| 3 | Çok adımlı asistan planı ("Günü kapat") geri alınınca stok bozuluyordu (son adım önceki adımların stok farkını siliyordu) | `store.tsx` keep/undoLast | K, Y |
| 4 | Ciro dört ekranda dört biçimde hesaplanıyordu (iptal/iade dahil, 30 gün yok, yalnız iptal hariç) | Overview, Channels, Selling, Money, Agent | K |
| 5 | Fatura numarası güncelleyicisi saf değildi; StrictMode'da numara atlıyordu | `store.tsx` issueInvoices | K |
| 6 | KDV özeti farklı para birimlerini topluyordu | `Finance.tsx` | K |
| 7 | İade kuralı iki yerde farklıydı (portal 50 €, otomasyon 80 €); portal "kendiliğinden onay" vaat ediyordu; kargodaki ve açık iadesi olan sipariş iade formuna giriyordu | `Portal.tsx`, `Automation.tsx` | K |
| 8 | Sayım (masaüstü ve mobil) stok defterine hiçbir şey yazmıyordu; hiç sayılmamış kayıt hiç sayılmış olamıyordu; sistem adedi sayımı kör etmiyordu | `Warehouse.tsx`, `Mobile.tsx` | K |
| 9 | Transfer: sayılmamış kaynaktan çıkış atlanıp hedefe ekleniyordu (yoktan stok), yetersiz stok denetimi yoktu | `store.tsx` | K |
| 10 | Mobil: eksik toplanan sipariş etiketlenip sevk edilebiliyordu; çevrimdışı kuyruk eski durumla çalışıp "gönderildi" yazıyordu | `Mobile.tsx` | K |
| 11 | Asistan konuşması ~15 soruda sunucu sınırına (60 mesaj / 300 KB) çarpıp kalıcı olarak tıkanıyordu | `Agent.tsx`, `assistant.mjs` | R, T3 (kırpma doğru) |
| 12 | `/api/assistant` ve `/api/content` içerik türü ve Origin denetlemiyordu: açık panel oturumu olan biri başka bir sayfadan maliyet yazdırılabilirdi | `server.mjs` | R, Y (403 denendi) |
| 13 | Sunucu kapanma sinyalini ve yakalanmamış hataları ele almıyordu | `server.mjs` | K, Y |
| 14 | Çekmece, arama, kısayol ve mobil menü: odak girişi, Esc, Tab tuzağı, odak geri dönüşü yok; tablo satırları klavyeyle açılmıyordu | `ui.tsx`, `App.tsx`, 8 ekran | K, Y |
| 15 | Asistan, rolün menüde göremediği ekranın verisini (destek, kanal sağlığı) veriyordu; Birebir mesajda "Asistana sor" düğmesi vardı | `Agent.tsx`, `Chat.tsx` | K |
| 16 | Herkese açık `/sunum/` içinde eski sistemden gerçek bir rakam (resimsiz ürün sayısı) | `sunum/index.html` | K |

### Orta / düşük (seçmeler)

| Bulgu | Doğrulandı |
|---|---|
| Soluk metin (`--mute`) 3,6:1 ve menü başlığı 3,5:1 karşıtlıkta (hesaplandı) | K |
| Dokunma hedefi 32/24 px; bildirim yalnız fareyle okundu oluyordu | K |
| Yalnız renkle durum (belge simgeleri), ham anahtar metinleri ("hazir") | K |
| 429 yanıtı düz metin, istemci okuyamıyordu; hak geçersiz isteğe de düşüyordu; gün UTC'ye göre | R |
| Yapay zekâ çağrısında zaman aşımı ve iptal yoktu | R |
| `yayina-kopyala.sh` önce siliyor sonra kopyalıyordu; `grep` deseni dar | K |
| Otomasyon: etiket (kargo ücreti) ve tedarikçiye sipariş "para" işaretsizdi; kural değişikliği denetim kaydına yazılmıyordu; aynı olay-koşul-işlem sessizce öncekini siliyordu | K |
| Tanıtım sayfası: "takip kendiliğinden gider", "kendi stoğunu görür", "bağlı kanal", "EUR ve USD" | K |
| Geliştirici dili ("mock", "sahte", "Slider", "sunucudan") | K |
| README: arka uç var, ortam değişkenleri eksik, yol hataları | K |
| Bildirimler rolün açamayacağı ekrana bağlanıyordu; sayılmayan kayıt sayısı depo süzgecini yok sayıyordu | K |
| Veri kalitesi: barkod kontrol hanesi doğrulanmıyordu; Enter asistandaki yazıda bile kaydediyordu | K |
| Sevkte "fatura kesinleşir" metni (asistan, otomasyon r3) kural 4'e ters | K |

## 3. Yapılan düzeltmeler (commit ile)

| Commit | İçerik |
|---|---|
| `cc93e02` | Ciro tek işlevden (`revenueOrders`); etiket/sevk/fatura kapıları store'da ve onaylı; B2B fatura geri alınamaz, şirket başına sıra; saf fatura numarası; transfer koruması; çok adımlı plan tek geri alma; para iadesi adımı yalnız finansta; "sorunu giderdim" eylemi; sunumdan eski rakam |
| `4a617a8` | KDV özeti şirket × para birimi; iade faturası koşulları; iade kuralı tek eşik (14 gün, 80 €); otomasyon para işaretleri ve denetim kaydı; sayım deftere yazılıyor, sistem adedi gizli; mobil eksik toplama ve çevrimdışı kapı |
| `acf2305` | Sunucu: SIGTERM, hata yakalama, keep-alive, CSRF (JSON + Origin), JSON 429, akış kapatma, sınır sayımı, 90 sn zaman aşımı, iptal; panel konuşma kırpma |
| `c1648bf` | Yayın betiği geçici klasörde doğrulayıp yerine koyuyor; sunum kaynağında eski rakam |
| `17083b5` | `useDialog` (odak, Esc, Tab, geri dönüş), `rowProps` (klavyeyle satır), kontrast, dokunma hedefi, tek harf kısayol anahtarı, canlı bölge |
| `ab7aa10` | Asistan rol sınırı, bildirim bağlantıları, tanıtım vaatleri, akış şeritleri, geliştirici dili, README |
| `7e77417` | Barkod kontrol hanesi; Enter kapsamı |
| `31a5dac` | Tur 3 düzeltmeleri (bölüm 5) |

Her grupta `npx tsc --noEmit` ve `npm run build` temiz geçti.

## 4. Reddedilen ya da düşülen iddialar

- Dünkü raporun "asistandaki ciro iptal/iade içermiyor" satırı kısmen yanlıştı (asistan iptali eliyor, iadeyi eliyormuyordu); bu turda gerçekten düzeltildi.
- Tur 1 kullanılabilirlik üyesi Portal not alanı ve Reservations kaydırıcısı için "etiketsiz" demişti; tur 3 üyesi ikisinin de `label` ile sarılı olduğunu bildirdi (okuma ile; ben ayrıca bakmadım). Düşüldü; yalnız kaydırıcıya `aria-valuetext` önerisi açık.
- Tur 3 sunucu üyesi `abortOnClose` için "yanlış iptal olasılığı" aramış, olmadığını belirtti; düzeltme gerekmedi.
- Tur 3 üyesinin "Notifications açılır pencerede Esc yinelenen dinleyici çalışmıyor" bulgusu doğruydu; yinelenen dinleyici silindi.

Not: Çoğu bulguyu yalnız üyenin raporuna dayanarak değil, düzeltirken ilgili kodu okuyarak doğruladım; "R" işaretliler (bölüm 2) bunun dışında kalanlardır.

## 5. Tur 3 sonucu

Altı üye (çekirdek, ekranlar A, ekranlar B, sunucu, erişilebilirlik, iş kuralı). Ağır bir geri dönüş hatası çıkmadı; çıkan gerçek hatalar düzeltildi:

1. Sayım, geri alma kaydını silmiyordu; sevkten hemen sonra sayım + "Geri al" stoğu defterden ayrıştırıyordu (`countStock` artık kaydı siliyor).
2. Sayımda kaydedilen satır listeden kayboluyordu (satırlar oturum boyunca sabit).
3. Mobil paketleme listesinde sorunlu sipariş vardı; etiket/sevk reddedilse bile ekran "yapıldı" gösteriyordu.
4. Mobil sayımda drop (raf `—`) ürünler sayılabiliyor, kaydedilen sayılar temizlenmiyordu.
5. İç içe pencerelerde Esc ve Tab iki pencereyi birden etkiliyordu (pencere yığını); bildirim açılır penceresi Tab'ı hapsediyordu; pencere açıkken harf kısayolları çalışıyordu.
6. Ciro süzgeci asistanda, Kârlılık'ta, KDV özetinde ve Veri kalitesi satış hızında hâlâ dağınıktı.
7. Sınırlayıcıda eşzamanlı isteklerle sınır aşılabiliyordu (hak artık istek gelince ayrılıyor, geçersizse iade); sunucu port hatasında süren sağlıksız süreç kalabiliyordu.
8. Veri kalitesi "s" kısayolu kapatılamıyordu; sipariş listesi belge simgeleri ekran okuyucuya ham anahtar veriyordu.
9. Asistan stok, tedarik, veri kalitesi araçları ve destek/eşitleme onayı rol sınırını aşıyordu.

## 6. Tur 3 sonrası açık kalanlar (düzeltilmedi, yeni tur başlatılmadı)

Mantık:
- "Eksi stok" (Genel Bakış `fiziki<0`, diğerleri `fiziki−ayrılan<0`), "Kritik" (dört eşik) ve eşitleme sayaçları (başarısız / başarısız+kısmi) hâlâ ekrandan ekrana farklı; tek tanım gerekiyor.
- Portal: fiyat KDV hariç mi dahil mi, müşteri para birimi (TRY/USD müşteriler EUR görüyor), sepette stok ve gecikmiş bakiye denetimi yok; Selling ve Money kâr marjı farklı tanımlı (KDV dahil/hariç payda, sabit/ülkeye göre kargo).
- Transferde kabul adedi girilemiyor ("Fark" hiç dolmuyor); "Hedefe ulaştı" yoldaki stokta görünmüyor; transfer stok ayırmıyor.
- Mal kabul (mobil) deftere yazmıyor (örnek teslimat); eksik toplama yalnız ekranda (store'a yazılmıyor, masaüstünden aynı sipariş etiketlenebilir); masaüstü toplamada "bitir" hepsi tam sayıyor.
- İade kabulü stoğa geri yazmıyor (0009 açık maddesi).
- Asistan: başarısız işlem "uygulandı" gösterebilir; "kendiliğinden" mod `await` sonrası eski durumla çalışır; kural taslağı onayı kural oluşturmuyor ve denetime yazmıyor; destek yanıtı "düzenleyebilirsiniz" der ama doğrudan gönderir; sevkte stok yeterliliği denetlenmiyor.
- Birbirini bozabilecek küçükler: 1,5 sn içinde iki ayrı tıklama tek geri alma sayılır; aynı üründen iki satırlı transferde toplam stok bakılmıyor; Genel Bakış rol dışı bağlantılar.
- Otomasyon: çekmeceden kural aç/kapa denetime yazmıyor; r9 alt sınır (%12) ile Selling (%8), r7 ile sürgü, r13 "önce sor" ile "otomatik eşleşen".
- Sunucu: yedek modele geçişte `thinking` bloğu 400 verebilir (denenmedi); Railway'de `X-Real-IP` ve `Host` davranışı varsayım.

Erişilebilirlik ve dil:
- Sekme bileşenlerinde `tabpanel`/ok tuşu yok; menü rozetleri yalnız renk/sayı; kalan küçük dokunma hedefleri; kısmi terim tutarlılığı ("hesap/kanal/mağaza").
- Belge bayatlıkları (bu turda kararlar ve `docs/` değiştirilmedi): `docs/03` 22 pazaryeri hesabı (24), `docs/01` "Mevcut (19)" (20), konsey raporu "37 öğe" (menüde 37), `0008` ≈470 sipariş (461), `docs/11` ve `docs/10` bayat açıklamalar, `docs/02:107` `0001` göndermesi, `0003`↔`0005` çelişkisi, `0006:22` ve `0007:18` kanıtsız rakip iddiaları, grafik raporu bayat (`/graphify . --update` bu işin dışında bırakıldı).
- Video (`sunum/video-uret.py`) sahneleri yeni ekranlarla denenmedi; yayındaki video eski arayüzü gösteriyor.

## 7. Sahibinin kararını bekleyenler

1. Menünün yeniden gruplanması (8 grup, 37 öğe, çok "yeni" noktası; "Kârlılık" iki kez), müşteriye dönük ekranların personel menüsünden ayrılması.
2. Asistan modeli (varsayılan Opus) ve günlük/dakikalık sınır sayıları; kullanım ve maliyetin kayda geçmesi.
3. Rol tanımları (özellikle muhasebeye müşteri iletişimi "tam", depoya eşitleme ve destek).
4. Dışarıya satış ekranları (abonelik, kurulum sihirbazı, tanıtım sayfasının konumu); "Firma girişi" ve yasal sayfalar (Impressum, Datenschutz, KVKK).
5. İade stok kuralı: iade kabulü stoğa nasıl yazılır; iade süresi teslimden mi siparişten mi (taslakta teslim tarihi yok).
6. "Yalnız öner ile başlar" ilkesi (0007) ile taslakta kendiliğinden çalışan kurallar (r5, r6, r12, r14).
7. Asistana giden müşteri mesaj metni için maskeleme (0009 açık maddesi).
8. Panel şifresinin yenilendiğinin doğrulanması ve belgeye tarihli durum satırı eklenmesi (`docs/guvenlik`'te şifrenin sohbette açığa çıktığı yazıyor; yenilendiği hiçbir yerde yazmıyor).
9. Mimari kararlar: şartlı imza koşulları, tek uygulama / ayrı servis çelişkisi, veri göçü ve geçiş.

## 8. Denenemeyenler

- Yapay zekâ bağlı asistan (canlı anahtar yok): konuşma kırpma, zaman aşımı, iptal, rol denetimi yalnız kod okunarak ve yerel hazır senaryo yoluyla gözden geçirildi.
- `video-uret.py` çalıştırılmadı; ekran okuyucu, gerçek dokunmatik cihaz ve gerçek kontrast ölçümü yapılmadı (kontrast hesapla doğrulandı).
- Yerelde denenenler: sunucu (200/401/403/503, `/healthz?x`, video aralığı, SIGTERM), çekmecede klavye/Esc/odak geri dönüşü, sorunlu siparişte etiket/sevk düğmesinin gizlenmesi, etiket → sevk → geri alma, sayımın deftere yazılması ve satırın kalması.
- Railway'de gerçek yayın davranışı (Host/Origin, SIGTERM süresi) push sonrası yalnız bölüm 9'daki dört adresle denetlendi.

## 10. Tur 4 (ek tur): vekil kararlar ve yeni açılardan inceleme

Sahibi turların sürmesini ve karar bekleyen konuların önceki kararlara göre verilmesini istedi. Dokuz konu `kararlar/0010` içinde vekil karar olarak yazıldı (menü işe göre gruplandı, asistan varsayılanı Sonnet, iade kontrolünde stoğa dönüş, müşteri mesajı maskeleme, muhasebe müşteri iletişimi yalnız görüntüleme; şifre yenileme sahibine bırakıldı). Altı yeni açıdan konsey: durum makinesi, güvenlik, performans, metin, şartname boşlukları, belge doğruluğu.

Düzeltilenler: panel ve ana sayfa brotli/gzip (771 KB → 243 KB, yerelde denendi); maskPII sağlamlaştırma (büyük/küçük harf ve ayraçlı IBAN, Türkçe harfli e-posta, 2000 karakter sınırı, konu satırı); asistan araç doğrulamaları (kapsam dışı iş kimliği, `Object.hasOwn`); metin (siz hitabı, "Eksi stok", "Kargoya verilecek", hata ve boş durum yönlendirmeleri); rol sınırları (müşteri yanıtı yalnız operasyon, rol değişince asistan sıfırlanır, "Göster" ile açılan veri rol başına, iade kontrolü yalnız operasyon); bayat taslak koruması (kapatılmış konuşmaya yanıt, artık başarısız olmayan işe yeniden deneme); tahsilat girişi; Katalog geçersiz adres çökmesi.

Belgeler: `docs/` ve `kararlar/` içeriği bu turda de değiştirilmedi (yalnız README). Üyenin bulduğu mekanik sayı/yol hataları (örn. `docs/03:10` 22→24, `docs/10:53` 22→24, `docs/01:42` 19→20, `docs/02:61` 19→20, `docs/02:107` `kararlar/0001`→`docs/06-alan-modeli.md`, `docs/11:3` "kararlar boş", `kararlar/0008:9` ≈470→≈461, `kararlar/0003:16` "2.555" kaynaksız, `GORSEL-KAYNAKLARI.md:20` yazar "?") sahibinin onayı için bekliyor. Taslağın şartname boşlukları `docs/panel/08-sartname-bosluklari.md` içinde (öneri).

Tur 4 sonrası açık: Google Fonts'un dışarıdan yüklenmesi (Almanya ziyaretçisi için KVKK/GDPR; yazı tipini kendi sunucudan vermek gerekir); `X-Real-IP` güveni ve IPv6 /64 ile kilit atlatma (Railway davranışı doğrulanmadı); `script-src 'unsafe-inline'`; panel şifresine asgari uzunluk yok; `store` değeri her render'da yeniden oluşuyor ve ayırma haritası üç yerde ayrı hesaplanıyor (gerçek ölçekte yavaşlatır); ürün, ayırma, denetim ve iş listelerinde sayfalama yok; toplama listesi aynı partide donuyor; kurallar ekranının durumu sayfa değişince sıfırlanıyor; ErrorBoundary yok; saat dilimi tutarsızlığı (tarayıcı saati / Berlin); "Kendiliğinden" ile "Otomatik" tek terime indirilmedi.

## 9. Canlı denetim

Son push `148b1ff`. Yeni sürüm birkaç dakika sonra yayına girdi (`/healthz?x=1` eski sürümde 302, yenide 200 verir; ölçüt bu). Denetim: `/` 200, `/panel` 401, `/sunum/` 200, `/healthz` 200, `/healthz?x=1` 200; şifresiz `/api/assistant` 401. Panel şifresi istenmedi ve girilmedi; giriş yapılmış hâlin canlıda davranışı (CSRF reddi, SIGTERM) bu denetimde denenmedi, yalnız yerelde denendi.
