# WawiERP — Konsey İncelemesi

Tarih: 2026-11-16 · İsteyen: proje sahibi · Yöntem: altı üyeli konsey, her üye kendi alanındaki dosyaları baştan sona okudu; hiçbiri dosya değiştirmedi. En ağır iddialar ayrıca kodda denetlendi ("denetlendi" sütunu).

Kapsam: depodaki yaklaşık 12.700 satır (taslak panel kodu, sunucu, asistan, belgeler, kararlar, sunumlar). Kapsam dışı: canlı eski sistem (dokunulmadı), eski kaynak kod (elimizde yok).

Sınırlar: kimse ekranı çalışır hâlde görmedi ve gerçek kullanıcı gözlemlemedi; kullanılabilirlik ve kontrast yorumları kod okumasına dayanır. Ürün üyesi `kararlar/` ve `docs/panel/` klasörlerini okuyamadığını bildirdi; o üyenin yargıları diğer belgelere dayanır.

---

## 1. Konseyin ortak hükmü

| Üye | Alan | Hüküm |
|---|---|---|
| Ön yüz kodu (çekirdek) | iskelet, asistan, veri, hesaplar | Yeterli: tasarım olarak güçlü, şartname olarak zayıf |
| Ön yüz kodu (ekranlar) | 17 ekran dosyası, tanıtım sayfası | Yeterli, ama ekranlar birbirini çürütüyor |
| Sunucu, asistan, yayın | `server.mjs`, `assistant.mjs`, derleme | Taslak için yeterli; gerçek sisteme taşınacak kısımlar zayıf |
| Gerçek sistem mimarisi | kararlar ve tasarım belgeleri | Şartlı imza (üç şart, bölüm 4) |
| Ürün ve iş | kapsam, pilot, vaatler | 4/10: analiz güçlü, ürün tarafı kanıtsız ve dağınık |
| Kullanılabilirlik | menü, akışlar, erişilebilirlik, dil | Mobil depo ve onay kartı iyi; menü şişkin, geri alma ve odak eksik |

Altı üyenin birleştiği dört nokta:

1. **Taslak iyi bir tasarım aracı, ama şartname değil.** Stok, kâr, KDV ve fatura hesapları ekrandan ekrana tutmuyor. Bu hâliyle gerçek sisteme kopyalanırsa yanlış davranış kopyalanır.
2. **Kapsam şişti.** Eski panelde bulunan 16 sorunun üstüne mesajlaşma, geliştirme panosu, rakip teklifleri, benzer ürün, vardiya önerisi gibi yenilikler eklendi; bazı asıl sorunların karşılığı ise yok.
3. **En zor iş henüz tasarlanmadı.** Stok defteri, stok ayırma, KDV ve fatura, veri göçü. Asistan ve otomasyon bunlardan önce önceliklendirildi.
4. **Hiçbir şey gerçek kullanıcıyla sınanmadı.** Müşterinin kim olduğu ve en çok neyin acıttığı varsayım.

---

## 2. En önemli bulgular (önem sırasıyla)

### A. Taslak panel: yanlış ya da çelişen davranış

| # | Bulgu | Önem | Kanıt | Denetlendi |
|---|---|---|---|---|
| A1 | Kargoya verilen siparişte fiziki stok düşmüyor; ayrılan azaldığı için satılabilir stok yeniden artıyor. Bu, stok ayırma ekranının önlediğini söylediği fazla satışın kendisi. Denetim kaydı "stok defterine yazıldı" diyor, defter ise sabit. | Yüksek | `store.tsx:137-139`, `store.tsx:95-96` | Evet |
| A2 | Kargoya verme faturayı sessizce "kesin" yapıyor; finans rolünü ve "önce sor" kuralını atlıyor. | Yüksek | `store.tsx:139` | Evet |
| A3 | "Tümünü kargoya ver" ekranda görünen satırları değil süzgeçteki hepsini sevk ediyor; onay ve adet özeti yok. Denetim kaydı gerçekte değişen sayıyı değil seçilen sayıyı yazıyor. | Yüksek | `pages/Extra.tsx:42`, `store.tsx:138-140` | Evet |
| A4 | Komisyon oranları iki dosyada ayrı tutuluyor ve ayrışmış (METRO %9 / %10, web mağazası %1,9 / %2, Ozon %11 / %12). Kârlılık ekranı katkıyı KDV'yi düşmeden hesaplıyor; fiyat ekranı düşerek. Aynı kanal için iki farklı oran çıkıyor. | Yüksek | `pages/Money.tsx:188,197`, `pages/Selling.tsx:16,180` | Evet |
| A5 | Fatura numarası listenin sırasından üretiliyor; taslaklar numara tüketiyor, süzgeç değişince numaralar kayıyor. KDV sekmesi "30 gün" diyor ama tarih süzmüyor. | Yüksek | `pages/Finance.tsx:54-58,65` | Hayır |
| A6 | Müşteri iade formu yalnız sipariş numarası ve posta koduyla açılıyor; "bulunamadı" ile "posta kodu eşleşmiyor" ayrı mesaj olduğu için sipariş numarası denenerek doğrulanabilir. | Yüksek | `pages/Portal.tsx:185-195` | Kısmen (ayrı mesaj doğrulandı) |
| A7 | Mobil depoda eksik toplanan sipariş pakete ve sevke geçebiliyor; eksik hiçbir yere yazılmıyor. Yanlış dokunuş geri alınamıyor; "Kargoya ver" onaysız. Kör sayımda ilk rakam girilince sistem adedi görünüyor. | Yüksek | `pages/Mobile.tsx:94-95,143-144,160-194` | Kısmen |
| A8 | Şirket ya da depo süzgeci seçilince stok ayırma hesabı eksik sayıyor: siparişler süzülüyor, stok şirketler arasında ortak kalıyor. | Yüksek | `Agent.tsx:72-83`, `Notifications.tsx:61-64` | Hayır |
| A9 | "Müşteri bilgisi asistana gösterilmez" deniyor, ama destek aracı müşterinin yazdığı metni olduğu gibi yapay zekâya gönderiyor; örnek mesajda vergi numarası var. | Yüksek | `Agent.tsx:178,580`, `data2.ts:56` | Hayır |
| A10 | Ciro hesabı iptal ve iade siparişlerini de topluyor; TL ve dolar siparişleri sessizce dışarıda kalıyor. | Orta | `Agent.tsx:132,189` | Hayır |
| A11 | Tedarikçiye sipariş ve etiket kuralları "para" olarak işaretli değil; "kendiliğinden" çalıştırılabilir. Kural değişiklikleri denetim kaydına yazılmıyor. | Orta | `pages/Automation.tsx:17-20,108-142` | Hayır |
| A12 | Yasaklı reklam sözcüğü denetimi "fırsat" ve "süper"i hiç yakalamıyor (karşılaştırma harfleri sadeleştiriyor, liste sadeleşmemiş). | Düşük | `pages/Quality.tsx:12,170,211` | Evet |
| A13 | Şirket, depo ya da rol değişince bildirimler "Çözülenler" altına düşüyor; yanlış "çözüldü" bilgisi. | Orta | `Notifications.tsx:99-104` | Hayır |
| A14 | Mesajlaşmada sayfa yenilenince sıra sayacı sıfırlanıyor; okundu işareti ve okunmamış sayısı bozuluyor. | Orta | `Chat.tsx:90,97,141` | Hayır |

### B. Asistan ve sunucu

| # | Bulgu | Önem | Kanıt | Denetlendi |
|---|---|---|---|---|
| B1 | Asistanın araçları, yanıtın yarıda kesilip kesilmediğine bakılmadan çalıştırılıyor. Yarım kalmış bir işlem taslağı onay kartına dönüşebilir. Yanıt boş ya da kesikse kullanıcıya hiçbir şey gösterilmiyor. | Yüksek | `Agent.tsx:287-297` | Evet |
| B2 | Günlük istek sınırı soruyu değil her gidiş gelişi sayıyor (soru başına sekize kadar) ve tek kullanıcı herkesin hakkını bitirebiliyor. Varsayılan model en pahalısı; kullanım ve maliyet kayda geçmiyor. | Yüksek | `assistant.mjs:7,62-71,148` | Hayır |
| B3 | Sunucu kapanma sinyalini ve yakalanmamış hataları ele almıyor; her yayında süren video ve asistan istekleri kesilir. | Yüksek | `server.mjs:89-119` | Hayır |
| B4 | Asistan isteğinde zaman aşımı ve iptal yok; takılırsa panel "düşünüyorum"da kalır. | Orta | `assistant.mjs:134-156`, `Agent.tsx:278` | Hayır |
| B5 | Yayın tanımı yok: Node sürümü sabit değil, başlatma komutu ve sağlık denetimi Railway'in tahminine bırakılmış. Test, otomatik denetim, hazırlık ortamı ve yazılı geri alma planı yok. | Orta | `package.json:8,29` | Hayır |
| B6 | Panel sayfası her açılışta sıkıştırılmadan yaklaşık 0,75 MB iniyor. | Orta | `server.mjs:90-118` | Hayır |
| B7 | `yayina-kopyala.sh` önce hedefi siliyor, sonra kopyalıyor; kopya başarısız olursa yayın klasörü boş kalır. 13 MB'lık video her üretimde depoya yeniden ekleniyor. | Orta | `sunum/yayina-kopyala.sh:8-11` | Hayır |
| B8 | Araçların tarayıcıda çalışması ve rolün tarayıcıdan gelmesi taslakta bilinçli; ama gerçek sistem için yanlış kalıbı öğretiyor. | Tasarım notu | `assistant.mjs:3-4,129` | Evet (dünkü güvenlik raporunda da var) |

### C. Kullanılabilirlik ve erişilebilirlik

| # | Bulgu | Önem | Kanıt |
|---|---|---|---|
| C1 | Menü işe göre değil sisteme göre gruplanmış: 8 grup, 37 öğe, 23'ünde "yeni" noktası; "Kârlılık" iki kez var; müşteriye dönük ekranlar personel menüsünde. | Yüksek | `App.tsx:31-55` |
| C2 | Asistanın onay kartı hangi kayıtlara dokunacağını göstermiyor, yalnız sayı veriyor. Destek yanıtı "düzenleyebilirsiniz" diyor ama Onayla doğrudan gönderiyor; "10 saniyede geri alınır" notu müşteriye giden yanıt için doğru olamaz. | Yüksek | `Agent.tsx:398,410,465,562` |
| C3 | Çekmece, arama penceresi ve mobil menüde odak yönetimi yok (odak taşınmıyor, Esc yok). Tablo satırları yalnız fareyle açılıyor. Tek harfli kısayollar kapatılamıyor. | Yüksek | `ui.tsx:114-128`, `App.tsx:92-97,144,208`, `Orders.tsx:95` |
| C4 | Dokunma hedefleri küçük: düğmeler 32 piksel, bildirim düğmeleri 24 piksel. | Orta | `ui.tsx:17`, `Notifications.tsx:131` |
| C5 | Açık temada soluk metin ve koyu menüdeki başlıklar yaklaşık 3,4:1 karşıtlıkta (hesap elle, yaklaşık). Etiket, fatura ve takip durumu yalnız renkle anlatılıyor. | Orta | `index.css`, `Sidebar.tsx:44`, `Orders.tsx:113-115` |
| C6 | Geliştirici dili kullanıcıya sızıyor ("sunucu da isteği reddeder", "Bu mock'ta", "Hazır senaryolar"). Mobilde "sen", panelde "siz". | Orta | `App.tsx:253`, `Agent.tsx:482,526`, `Mobile.tsx:89` |
| C7 | İadelerde "İlerlet" onaysız; sütun başına 5 kayıt görünüyor, "+N kayıt daha" tıklanamıyor. Boş durumlar çıkmaz sokak. | Orta | `pages/Finance.tsx:34,37`, `Orders.tsx:122` |

Aynı şeye farklı ad verilen terimler (birleştirilmeli): Negatif stok / Eksiye düşen / eksi · Gönderilecek / Kargoya verilecek · Etiket / Kargo etiketi · Sayım yok / Hiç sayılmamış · Kendiliğinden / Otomatik · Müşteri portalı önizleme / Toptan müşteri portalı / Cari ve B2B portal.

Depo çalışanının anlamayacağı terimler: Drop, Sanal, Eşitleme işleri, Mutabakat, Cari, Kiracı, Mükerrer, Bayat, Güvenlik payı.

### D. Tanıtım sayfası ve sunumlar: karşılığı olmayan vaatler

| # | İddia | Durum | Kanıt | Denetlendi |
|---|---|---|---|---|
| D1 | Mobil depo için "barkod akışları dahil" | Kamera okuma yok | `pages/Landing.tsx:348` | Evet |
| D2 | "Birden fazla EAN, varyant" | Model ürün başına tek barkod tutuyor | `pages/Landing.tsx:42`, `data.ts:129` | Hayır |
| D3 | "Takip numarası kanala işlenir, stok defteri güncellenir" | Hiçbir kanal bağlı değil; defter yok | `pages/Landing.tsx` (adımlar) | Hayır |
| D4 | "Firma girişi" ve başvuru formu | Giriş ortak şifreli taslağa gidiyor; kişisel veri isteyen form hiçbir yere gitmiyor; Impressum, Datenschutz, KVKK "eklenecek" | `pages/Landing.tsx:7,151,435-470` | Hayır |
| D5 | "Rakiplerin hiçbirinin sahiplenmediği alan" | Rakiplerin resmi sayfaları açılamadı, hiçbir ürün denenmedi | `sunum/wawierp-rakipler-ve-yol-haritasi.html`, `docs/10` | Hayır |

**Reddedilen iddia:** Ürün üyesi, herkese açık `/sunum/` adresinde gerçek ciro ve sipariş rakamlarının yayınlandığını yazdı. Denetlendi, doğru değil: yayında yalnız yenilikler sunumu var ve içinde bu rakamlar geçmiyor. Rakamları içeren analiz sunumu depoda duruyor, yayında değil. Yine de o dosya ileride yayına kopyalanmamalı.

---

## 3. Ürün ve iş açısından

- **Müşteri ve acı varsayım.** Kullanıcı görüşmesi yok; inceleme yönetici oturumuyla, yalnız okuyarak yapıldı. Öncelik ve "iç araç mı, dışarıya satılan ürün mü" soruları `docs/11` içinde hâlâ açık.
- **Asıl sorunların bir kısmının karşılığı yok.** Faturaların boş depoda açılması, 25 bin eksi stok kaydının temizliği, denetim kaydındaki gürültü, yavaş sayaçlar. Bir "sorun → ekran" eşleme tablosu yok.
- **Taslak hız sorununu kanıtlamaz.** Eski panelde listeler 15–30 saniyede açılıyor; taslakta sunucu olmadığı için her şey anında. Gerçek sorguyla ölçülmeden "çözüldü" denmemeli.
- **Dışarıya satış kararı gerekçesiz.** Pazar kanıtı, fiyat, destek ve hukuk hazırlığı yok; yine de kurulum sihirbazı, abonelik ekranı ve açık tanıtım sayfası yapıldı.
- **Rakip analizi dürüst ama ince.** Kaynak sınırlamaları belgede yazılı; hiçbir rakip ürün denenmedi.

**Pilot için asgari kapsam (ürün üyesinin önerisi):** maskelenmiş müşteri verisi, tek sipariş listesi ve tek kaynaktan sayaçlar, kanal sağlığı, stok defteri ve fazla satış koruması, toplama listesi, iade akışı, ülkeye göre KDV, sade denetim kaydı.

**Ertelenmesi önerilenler:** ekip mesajlaşması ve geliştirme panosu, rakip teklifleri, benzer ürün, vardiya önerisi, ürün metni ve çeviri, kuralların "kendiliğinden" düzeyi, dışarıya satış ekranları, kârlılık, banka mutabakatı.

**Başarı ölçütü önerisi:** sayaç tutarsızlığı sıfır, liste açılışı 3 saniyenin altında, eksi stok sayısı, iade devir süresi.

---

## 4. Gerçek sistemin mimarisi: şartlı imza

Şartlar:
1. Eski kaynak kod ve veritabanı yapısı gelmeden kapsam ve takvim sözü verilmez.
2. Stok defteri ve stok ayırma için ayrı bir karar yazılır.
3. Pilot, zor parçaları sınayacak şekilde yeniden tanımlanır.

En büyük beş risk:

| # | Risk | Kanıt | Ne yapılmalı |
|---|---|---|---|
| M1 | Kaynak kodsuz yeniden yazım ve geçiş. Şema tahmin; `docs/10` bu yolu "6–10 kişi, 18–36 ay" diye tanımlıyor, ekip bir kişi ve yapay zekâ. Veri göçü, açılış bakiyeleri, çift çalışma ve geri dönüş kararı yok. | `kararlar/0002`, `docs/06:5`, `docs/10 §3`, `docs/11 §4` | Önce kod ve şema. Göç ve geçiş kararı; kanal başına geçiş kapıları |
| M2 | Stok doğruluğu tasarlanmadı. Kararda tek satır; alan modelinde stok ayırma tablosu yok; bugün 25.061 eksi stok kaydı var. | `kararlar/0007:15`, `docs/06 §4`, `docs/03:96` | Yalnız eklenen defter, süreli ayırma tablosu, bakiye satırında kilit, kanala gönderim için aynı işlem içinde kuyruk |
| M3 | Müşteri verilerinin ayrımı (Prisma ve satır düzeyi güvenlik) kısmen ele alındı. Bağlantı havuzu altındaki davranış, göç rolü ile uygulama rolü ayrımı, şirketler arası fatura belirsiz. | `kararlar/0004:29`, `kararlar/0001:12`, `docs/06:89,107` | İlk sprintte sızıntı testi; rol ayrımı; "şirket mi kiracı mı" netleşsin |
| M4 | Alan modeli eksik: vergi ve oran, kur ve yuvarlama, komisyon mutabakatı, iade ve kredi notu yaşam döngüsü yok; beş farklı ürün anahtarı biçimi var. | `docs/06 §5`, `docs/06:15,37,44,81` | Vergi motoru ve fiyat listesi ayrı varlık; tek ürün kimliği ve eşleme tablosu |
| M5 | Pilot hiçbir zor şeyi sınamıyor: İstanbul'da ayda yaklaşık 20 sipariş; faturalar yalnız Almanya deposunda. | `kararlar/0008:9-17`, `docs/03:16` | Almanya'da gölge çalışma; eski sisteme karşı günlük fark raporu |

Çelişkiler: "tek uygulama yeterli" kararı ile ayrı servisler, Redis ve altyapı kodu içeren bulut kararı (`0003:16` ↔ `0005:14`); çok kiracılı yapı var ama faturalama ertelendi (`0001` ↔ `0008:11`); asistan ve kural motoru çekirdek defterden önce önceliklendirildi.

Eksik kararlar: veri göçü ve açılış bakiyeleri · geçiş ve geri dönüş · yedekten dönüş süreleri · KVKK/GDPR ve veri konumu · Türkiye ve Almanya e-fatura yükümlülükleri · kimlik ve iki adımlı doğrulama · test stratejisi · izleme hedefleri · pazaryeri kota ve bildirim politikası · ortamlar ve otomatik yayın · çok dillilik · tek kişiye bağımlılık riski.

---

## 5. İyi yapılanlar

- Belgelerde "görüldü / tahmin" ayrımı ve "açık kalanlar" dürüstçe yazılmış.
- Asistanın sınırları iyi düşünülmüş: onay kartı, onay anında yetkinin yeniden denetlenmesi, para ve fiyat aracının olmaması, müşteri metni okununca onay zorunluluğu.
- Sayaçlar, bildirimler ve asistan aynı seçicilerden besleniyor (gönderilecek, geciken, sorunlu).
- Müşteri bilgisi maskeli; "göster" işlemi denetim kaydına yazılıyor.
- "Sayım yok, sıfır değildir" ilkesi çoğu ekranda tutarlı.
- Mobil depo ekranı: büyük hedefler, tek amaçlı ekranlar.
- Sunucu küçük ve savunmacı: izinli dosya listesi, süreye dayanıklı şifre karşılaştırması, deneme kilidi, güvenlik başlıkları.
- "Bir kanala yalnız bir sistem yazar" kuralı.
- Hareketi azalt tercihine uyum.

---

## 6. Önerilen sıra

**Hemen (taslakta, küçük işler)**
1. A4: komisyon oranlarını tek yerde topla; kâr hesabını tek işlevden yap.
2. A3 ve A7: toplu işlemlere onay ve adet özeti; mobilde geri alma ve sevk onayı.
3. B1: kesik ya da reddedilmiş yanıtta araç çalıştırma; boş yanıtta kullanıcıya mesaj göster.
4. D1–D4: tanıtım sayfasındaki karşılıksız vaatleri düzelt; ölü başvuru formunu kaldır ya da bağla.
5. A12, A13, C6: küçük hatalar ve sızan geliştirici dili.

**Karar gerektirenler**
6. Taslak şartname olacak mı? Olacaksa A1, A2, A5, A8 (stok ve fatura davranışı) düzeltilmeli; olmayacaksa ekranlara "bu davranış örnek" notu konmalı.
7. İç araç mı, dışarıya satılan ürün mü? Yanıta göre dışarıya satış ekranları ertelenir.
8. Pilotun yeri ve kapsamı (bölüm 3 ve M5).

**Kod yazmadan önce**
9. Eski kaynak kod ve veritabanı yapısı.
10. Beş ila sekiz çalışanla görüşme: "en çok vakit kaybettiren üç şey".
11. Stok defteri ve stok ayırma kararı; veri göçü ve geçiş kararı.
12. KDV ve fatura: Hollanda ve Türkiye şirketleri faturayı nerede kesiyor, hangi muhasebe aktarımı gerekiyor.

---

## 7. İncelemeden sonra düzeltilenler (2026-11-16)

"Hemen" listesindeki işler taslakta yapıldı ve yerelde denendi:

| Bulgu | Yapılan |
|---|---|
| A4 | Komisyon oranları tek yerde (`data.ts`, `COMM`). Kârlılık ekranı artık KDV'yi düşüyor: katkı = ciro − KDV − komisyon − kargo; oran KDV hariç ciroya göre. |
| A3 | "Tümünü kargoya ver" ve "Tümünü yeniden dene" adet gösteriyor ve onay istiyor; sipariş listesindeki toplu sevk de onay istiyor. Kayıt ve bildirim gerçekte değişen sipariş sayısını yazıyor. İptal edilmiş ya da ödemesi gelmemiş siparişe kesin fatura kesilmiyor. |
| A7 (kısmen) | Mobil toplamada "Son satırı geri al" düğmesi; "Kargoya ver" onay istiyor. Eksik toplanan siparişin pakete geçmesi ve kör sayım düzeltilmedi. |
| B1 | Yanıt reddedilir ya da yarıda kesilirse araç çalıştırılmıyor, taslak üretilmiyor, kullanıcıya açık mesaj gösteriliyor; boş yanıtta da mesaj var. Gerçek yapay zekâyla denenmedi. |
| D1, D2 | Tanıtım sayfasında "barkod akışları dahil", "API altyapısı hazır" ve "birden fazla EAN, varyant" ifadeleri düzeltildi. |
| A12 | Yasaklı sözcük denetimi "fırsat" ve "süper"i yakalıyor. |
| A13 | Şirket, depo ya da rol değişince bildirimler "Çözülenler"e düşmüyor. |
| C6 (kısmen) | Sızan geliştirici dili ve mobildeki "sen" hitabı düzeltildi. |

Düzeltme: D4'te başvuru formu için "hiçbir yere gitmiyor" denmişti; form gönderilince zaten "Bu bir tasarım önerisi, hiçbir bilgi kaydedilmedi" yazıyor. Bulgu geri çekildi.

Açık kalanlar: A1, A2, A5, A6, A8, A9, A10, A11, A14 (stok, fatura ve iade formu davranışı; karar gerektiriyor), B2–B7, C1–C5, C7, D3, D5 ve bölüm 4'teki mimari şartlar.

## 8. "Taslak şartnamedir" kararından sonra düzeltilenler (2026-11-16)

Proje sahibi taslağın şartname olarak kullanılacağına karar verdi (`kararlar/0009`). Buna göre:

| Bulgu | Yapılan |
|---|---|
| A1 | Sevk fiziki stoktan düşüyor ve stok defterine satış hareketi yazıyor; transfer çıkışı ve kabulü de deftere yazıyor. Geri alma stoğu ve defteri de geri alıyor. Yerelde denendi: defterde yeni satır, geri alınca eski hâl. |
| A2 | Sevk faturayı kesinleştirmiyor. |
| A5 | Fatura numarası kesinleştirme anında veriliyor, siparişte saklanıyor, şirket başına sıralı; taslak numara tüketmiyor. Kesin fatura geri alınamıyor. KDV sekmesi gerçekten son 30 günü süzüyor. |
| A6 | İade formu tek hata mesajı veriyor. |
| A8 | Ayrılan stok bütün siparişlerden tek işlevle hesaplanıyor (`reservedMap`); seçili depo dışındaki satırlar sayılmıyor. |
| A10 | Asistandaki ciro iptal ve iadeyi içermiyor. |

Açık kalanlar: A7'nin kalanı, A9, A11, A14, B2–B7, C1–C5, C7, D3, D5 ve mimari şartlar.
