# WawiERP — Kart Kural Şartnamesi (K-01…K-28, Wawi'ye ait 23 kart)

Tarih: 2026-11-17 · Karar dayanağı: `kararlar/0011-ses-notu-kartlarinin-bolunmesi.md`

## 0. Bu belge nedir, nasıl okunur

16.11.2026 ses notlarından çıkan 30 geliştirme kartının 23'ü WawiERP'ye düştü (`0011`). Bu belge o 23 kartın her biri için dört şeyi yazar:

| Alan | Ne demek |
|---|---|
| **Ne yapar** | Kartın işi, bir cümle |
| **İş kuralı** | Uygulanacak deterministik kural: eşleştirme anahtarı, formül, durum makinesi, idempotans anahtarı |
| **Kabul kriteri** | Kartın bittiğini kanıtlayan ölçülebilir cümle |
| **Tuzak** | Aynı kart Mixoutlet vitrininde kodlandığında ortaya çıkan somut hata. "Şu durumda şu olur" + kaynağı |

**Tuzaklar bu belgenin en değerli kısmıdır.** Kartlar 17.11.2026'da Mixo deposunda (`demo/`, düz JavaScript + `node:sqlite`) kodlandı ve beş alanlı bir inceleme konseyi 92 bulgu çıkardı. Bulguların çoğu yığından bağımsızdır: kural motorunun hatada açık kalması, havuzun farklı ürünleri birleştirmesi, dört göz eksikliği, çerez onayının sunucuda uygulanmaması. WawiERP sıfırdan yazılırken aynı hatalara düşmek mümkündür; bu belge o yüzden yazıldı.

**Kaynak gösterimi.** `İK #3` = `Mixo/docs/konsey-2026-11-17/is-kurallari.md` 3 numaralı bulgu. Kısaltmalar: **G** güvenlik · **İK** iş kuralları · **H** hukuki uyum · **İŞ** işlevsellik · **M** mimari. Dosya:satır gösterimleri `Mixo/demo/services/` altındadır.

**Mixo kodunun durumu.** Konsey bulgularının kritik ve yüksek olanları Mixo'da 17.11.2026'da düzeltildi (`Mixo/docs/konsey-raporu-2026-11-17.md`, "Düzeltme turu sonucu"). Buna rağmen her tuzak burada yazılı: WawiERP o kodu almayacağı için (`0002`, `0011`) düzeltmeyi de almıyor. Tuzak, sıfırdan yazarken tekrar edilebilecek bir hatadır; kapanmış sayılmaz.

**Sayılar.** Mixo kodundaki eşik ve oranların bir kısmı geliştirici varsayımıdır, iş kararı değildir. Bunlar §6'da "karar bekliyor" olarak toplandı ve bu belgede **sayı olarak tekrarlanmadı**.

**Kapsam dışı.** K-10, K-11, K-12, K-29, K-30 Mixoutlet'e; K-24 ve K-26 ayrı projelere aittir (`0011`). Burada yoklar.

---

## 1. Kart listesi ve bağımlılık

| Kod | Kart | Öncelik | Bağımlılık |
|---|---|---|---|
| K-01 | Tekil ürün kartı — kopyalar tek kayda birleşir | P0 | — |
| K-02 | Çoklu EAN, pazar yerine göre doğru olanı | P0 | K-01 |
| K-03 | Feed kalite denetimi (Idealo, Billiga, Günstiger, PriceRunner) | P1 | K-01, K-02 |
| K-04 | Toplu yükleme ("şu markaları şu mağazalara") | P1 | K-01, K-03, K-05 |
| K-05 | Satış yasağı kuralları (şirket × marka × pazar yeri) | P0 | K-01 |
| K-06 | Şirket bazlı fiyat stratejisi, buy box, taban fiyat | P1 | K-01, K-05 |
| K-07 | Admin paneli ve kullanıcı paneli ayrımı (kiracı yalıtımı) | P0 | — |
| K-08 | Bronze / Silver / Gold paketler | P1 | K-07 |
| K-09 | Kiracının kendi API anahtarıyla entegrasyon | P0 | K-07 |
| K-13 | Storno (iade faturası) üretimi ve gönderimi | P1 | — |
| K-14 | İade etiketi takibi ve otomatik para iadesi | P1 | K-13, K-15 |
| K-15 | Kargo başarı skoru (bölge bazında) | P1 | — |
| K-16 | Otomatik etiket seçimi | P1 | K-15 |
| K-17 | UPS kuralı | P2 | K-16 |
| K-18 | Canlı ciro ve adet | P1 | K-01, K-07 |
| K-19 | Günlük hedef sayaçları | P2 | K-18 |
| K-20 | Spot ürün takibi | P2 | K-18 |
| K-21 | Ticket ve e-posta otomatik cevabı | P1 | K-13, K-14 |
| K-22 | Kritik e-posta uyarısı | P1 | — |
| K-23 | Tekrarlayan şikayet raporu | P2 | K-01, K-21 |
| K-25 | Personel performans analizi | P3 | K-21 |
| K-27 | Pazar ve trend analizi | P2 | K-01 |
| K-28 | Trend bazlı kategori önerisi | P3 | K-27 |

Kritik yol: **K-01 → K-02 → K-05 → K-04 → K-18.** K-07 ve K-09 bu zincire paralel ama P0'dır: kiracı ayrımı sonradan eklenemez (`0001`).

---

## 2. Ürün havuzu ve feed

### K-01 — Tekil ürün kartı

**Ne yapar.** Birden çok kaynaktan (tedarikçi dosyası, pazar yeri, elle giriş) gelen aynı ürün kayıtlarını tek bir havuz kartında toplar. Havuz, sistemin tekil ürün kimliği kaynağıdır.

**İş kuralı.** Gelen kayıt `(kaynak, kaynak_referansı, başlık)` zorunlu. Eşleştirme şu sırayla, ilk isabet kazanır:

1. Aynı `(kaynak, kaynak_referansı)` daha önce bağlandıysa onun kartı.
2. **EAN ile.** Gelen EAN'ların hepsi tek karta işaret ediyorsa o kart; farklı kartlara işaret ediyorsa **çakışma hatası**, birleştirme yapılmaz.
3. **Marka + MPN ile.** Normalleştirme: aksan ve büyük/küçük harf yok sayılır, harf ve rakam dışı her karakter atılır, MPN'de boşluk da silinir.
4. **Marka + başlık — yalnız son çare.** Gelen kaydın MPN'i doluysa, MPN'i dolu adaylar bu adımda **elenir**. Yani iki kaydın MPN'i dolu ve farklıysa, başlıkları aynı olsa bile ayrı üründür.

Marka boşsa eşleşme aranmaz, yeni kart açılır. Eşleşmede kartın **boş** alanları doldurulur, dolu alanın üzerine yazılmaz. Her gelen kayıt kaynak kaydı olarak ayrıca saklanır. Birleştirme geri alınabilir; aynı birleştirme iki kez geri alınamaz.

**Kabul kriteri.** "HP 59X" havuzda tek kayıt; kopya oranı %0; birleştirme geri alınabilir ve geri alma panelden görünür.

**Tuzaklar.**

- **Kritik — farklı MPN'li ürünler başlıkla birleşiyor.** Aynı marka, aynı başlık, farklı MPN iki ürün gelir (Bosch "Akkuschrauber GSR 12V", MPN `06019H8100` 99 € ve MPN `06019H8200` 149 €). EAN ve MPN eşleşmesi tutmayınca başlık adımına düşülür ve ikisi tek kayıt olur: ikincinin MPN'i, fiyatı ve görseli kaybolur, iki EAN aynı karta bağlanır. Feed'e yalnız 99 €'luk ürün çıkar, 149 €'luk ürün **hiçbir pazar yerinde görünmez**. Yukarıdaki 4. adımdaki eleme kuralı tam olarak bunu engellemek içindir. — İK #1, `pool.mjs:83-86`
- **Yüksek — eşleştirme tüm havuzu tarıyor.** EAN eşleşmesi tutmayınca bütün havuz belleğe alınıp her satırda normalleştirme çalıştırılıyor. 45 bin ürünlük içe aktarım ~2·10⁹ normalleştirme; 100 bin ürünlük içe aktarımda her satır tüm tabloyu tarıyor. Tek süreçte olay döngüsü kilitleniyor. Postgres'te çözüm: normalleştirilmiş `marka_anahtarı`, `mpn_anahtarı`, `baslik_anahtari` sütunları + benzersiz/kısmi indeks; eşleştirme uygulama döngüsünde değil sorguda. — G #9, M #15, `db/pool.mjs:28`
- **Orta — birleştirme geri alınamıyor ve "kim yaptı" boş.** Dört ayrı hata üst üste geldi: oturum nesnesi yanlış alandan okunduğu için aktör hep `null`; değişiklik kaydı bellekteki listeye girmediği için panel birleştirmeyi yeniden başlatmaya kadar göstermiyor; geri alma kaydı bir alan adıyla yazılıp başka alan adıyla aranıyor; kayıt kimliği UUID'nin 8 karakterlik dilimi olduğu için benzersizlik kısıtı çakışmada fırlatıyor. Sonuç: genel geri alma ucu birleştirmeyi geri alamıyor. — G #12, M #5, İŞ #26, `pool.mjs:158-165,194`

### K-02 — Çoklu EAN

**Ne yapar.** Bir ürün kartına birden çok EAN bağlar ve pazar yerine göre doğru olanı seçer.

**İş kuralı.** EAN yalnız rakamdır ve 8, 12, 13 veya 14 hane olmalıdır; **GS1 kontrol hanesi doğrulanır**. Her EAN bir pazar yerine bağlanır (`*` = tümü). `(EAN, pazar)` çifti kart içinde tekildir ve **pazar başına tek EAN** olur. Aynı EAN başka bir kartın herhangi bir pazarında duruyorsa çakışma hatası verilir; sessizce üzerine yazılmaz. Pazar için seçim sırası: önce o pazara özel EAN, yoksa `*`, yoksa yok. İki kart birleştirilirken toplam EAN sayısı kart sınırını aşıyorsa birleştirme reddedilir.

**Kabul kriteri.** Aynı ürün Amazon ve Kaufland'da farklı EAN ile eşleşiyor; geçersiz kontrol haneli EAN reddediliyor.

**Tuzaklar.**

- **Aynı pazara ikinci EAN eklenebiliyordu** ve hangisinin döneceği "ilk satır" kuralına kalıyordu — yani sıralama değişince ürün başka EAN ile yayınlanıyor. Yukarıdaki "pazar başına tek EAN" kuralı bunun içindir. — İŞ #24
- **Kontrol hanesi doğrulanmıyordu:** `1234567890123` kabul edildi. Geçersiz EAN pazar yerinde reddedilir, ürün yayınlanmaz. — İŞ #25
- **İki modül EAN'ı farklı doğruluyordu:** pazar analizi 8–14 hane (9/10/11 dahil) kabul ederken havuz yalnız 8/12/13/14 kabul ediyordu. Sonuç: içe aktarılan rakip fiyat satırı havuz ürününe bağlanamıyor, karşılaştırma boş çıkıyor. **EAN doğrulaması tek bir ortak yerde olmalı.** — İK #15

### K-03 — Feed kalite denetimi

**Ne yapar.** Her fiyat karşılaştırma sitesi (Idealo, Billiga, Günstiger, PriceRunner) için ürünün eksik alanlarını raporlar ve yayına çıkacakları süzer.

**İş kuralı.** Pazar başına zorunlu alan listesi tablodur: Idealo ve Günstiger = başlık, açıklama, görsel, fiyat, EAN, yasal bilgi; Billiga ve PriceRunner = yasal bilgi hariç aynı beşi. Alanlar önce kart verisinden, yoksa kaynak kayıtlarından okunur. Fiyat sayıdır ve sıfırdan büyüktür. **Yasal bilgi için hangi alanların zorunlu olduğu tek bir yerde tanımlanır** (bkz. tuzak). Uyarılar: açıklama çok kısa, görsel `http(s)` değil, EAN biçimi geçersiz. Ürün "yayına uygun" sayılır = eksik zorunlu alan yok **ve** EAN biçim uyarısı yok. Yayın (XML feed) yalnız denetimi geçen **ve** satış yasağı (K-05) olmayan ürünleri içerir.

**Kabul kriteri.** Her feed için eksik görsel/açıklama/yasal bilgi raporu üretiliyor; denetimden geçen ürün kümesi ile yayınlanan küme birebir aynı.

**Tuzaklar.**

- **Yüksek — denetim "temiz" diyor, yükleme aynı ürünü engelliyor.** Denetim yasal alanlardan **birini** yeterli sayıyordu (`some`), toplu yükleme **üçünü birden** (temsilci, adres, vergi no) ve yasal alan istemeyen pazarlarda da istiyordu. Yalnız temsilci alanı dolu bir ürün: denetim `ok`, rapor `0 sorun`; aynı ürün yüklemede `Eksik yasal alan: adres, vergi no` ile engelleniyor, yüklenen liste boş. Önizleme ile gerçek davranış ayrışıyor. **Kural tek yerde tanımlanmalı ve iki akış da aynı fonksiyonu çağırmalı.** — İK #5, İŞ #27, `feed.mjs:79` ve `:212,217`
- **Yüksek — XML üretimi kural motorunu hiç çağırmıyor.** Bosch × Idealo yasağı tanımlıyken Idealo XML'i üretildiğinde Bosch ürünü XML'in içinde kaldı. Denetimden geçen ürünler süzülüyordu, yasaklılar süzülmüyordu. **Yayın yolu da K-05'ten geçmeli.** — İŞ #2
- **Orta — olmayan mağaza kimliği kabul ediliyor.** `shops:["olmayan-magaza"]` ile yükleme başarılı sayıldı (beklenen 400/404). Mağaza kimliği doğrulanmalı. — İŞ #10
- **Performans — ürün başına üç sorgu (N+1).** Tarama her üründe ayrı sorgu atıyordu. — M #15

### K-04 — Toplu yükleme

**Ne yapar.** "Şu markaları şu mağazalara yükle" komutunu çalıştırır; ajan bu komutu başlatabilir ama kuralları geçersiz kılamaz.

**İş kuralı.** Girdi: marka listesi, mağaza listesi, pazar, **şirket**. Havuzdaki ürünlerden markası seçilenlerden biri olanlar (büyük/küçük harf yok sayılır) işlenir. Her ürün sırayla: (1) K-03 denetimini geçmezse engellenir; (2) o pazarın yasal alan kuralı sağlanmazsa engellenir; (3) her mağaza için K-05 değerlendirmesi — **şirket ve kategori dahil** — yasak varsa o `(ürün, mağaza)` engellenir ve **gerekçesiyle** loglanır. Çalıştırma öncesi önizleme zorunludur: "şu kadar ürün şu kural yüzünden hariç tutulacak". Üretici sitesinden bulunan yasal temsilci ve vergi bilgisi doğrudan yayına gitmez; insan onayı kuyruğuna girer.

**Kabul kriteri.** Komut çalıştığında eksik yasal temsilci, adres ve vergi kaydı doldurulmuş hâlde yükleniyor; önizlemede engellenen ürün kümesi ile gerçekte engellenen küme birebir aynı.

**Tuzaklar.**

- **Kritik — toplu yükleme şirket ve kategoriyi kural motoruna göndermiyor.** İki yasak tanımlı: `{marka: Bosch, kategori: elektronik}` ve `{şirket: AcmeGmbH, marka: Bosch}`. `bulkUpload({brands:['Bosch'], shops:['shop1'], market:'idealo'})` çağrıldığında ürün **yüklendi**, engellenen liste boş kaldı. Aynı kural doğrudan sorulduğunda (`evaluate({vendor:'Bosch', market:'idealo', category:'elektronik'})`) `izin yok` diyor. Yani kural motoru doğru, çağıran eksik parametre geçiyor. Önizleme "yasak" derken yükleme geçiriyor. — İK #2, İŞ #1, `feed.mjs:222`
- **Yüksek — kural motoru yüklenemezse yasak sessizce kalkıyor (fail-open).** Kural modülü dinamik olarak yükleniyordu ve hata yutuluyordu; modül bir söz dizimi hatası alırsa kural nesnesi boş kalıyor, isteğe bağlı çağrı sessizce boş dönüyor ve **yasaklı ürünler yükleniyor**. Yasal denetim kapısı hatada açık kalıyor. **Kural motoru statik bağımlılık olmalı; yüklenemiyorsa sistem açılmamalı, yükleme reddedilmeli.** — M #4, `feed.mjs:198`
- **Orta — sınırsız çarpım: 500 bin kalem.** Marka ve mağaza listeleri ayrı ayrı 100 ile sınırlıydı ama çarpımları değildi: 5.000 ürün × 100 mağaza = 500.000 satır tek yanıtta ve tek belgede. Ölçüm: 35,9 MB, tek yazma 637 ms, sonraki her okuma 232 ms. **Çarpım sınırlanmalı; sonuç satırları ayrı tabloya yazılmalı, iş kuyruğuna alınmalı.** — G #7, M #6, `feed.mjs:195-231`

---

## 3. Kurallar motoru ve fiyat

### K-05 — Satış yasağı kuralları

**Ne yapar.** Şirket × marka × pazar yeri × kategori bazında satış yasaklarını tutar ve değerlendirir. Para ve yasal sonuç doğuran her karar buradan geçer.

**İş kuralı.** Kural = şirket, marka, pazar, kategori (boş alan = hepsi) + **zorunlu gerekçe alanı**. Tek eylem `yasakla`; izin kuralı yoktur, isabet yoksa izin vardır. En az bir alan dolu olmalıdır. Değerlendirme: etkin kurallardan dört alanı da eşleşenler seçilir (eşleşmede aksan ve büyük/küçük harf yok sayılır, boş kural alanı herkesle eşleşir); birden çok isabette **dolu alan sayısı en yüksek olan** kazanır, eşitlikte önce eklenen. Ajan bu kuralları yalnız okur, geçersiz kılamaz (`0006`: asistana fiyat ve para aracı verilmez).

**Kabul kriteri.** "Lady şirketi Chanel'i Idealo'da satmasın" kuralı tanımlıyken toplu yükleme o ürünü atlıyor ve gerekçesini loglanıyor; biyomedikal ürünün Amazon'a yüklenmemesi gibi mevzuat kaynaklı maddelerde gerekçe alanı dolu.

**Tuzaklar.**

- **Yüksek — düzenleyen rolü yasal yasak kuralını silebiliyordu**, üstelik silme değişiklik günlüğüne düşmüyordu: kimin sildiği izlenemiyor. Yasak kuralları **yönetici yetkisi + denetim kaydı** ister. — M #1, M #3
- Değerlendirmede ürün kimliği ve mağaza kimliği hiç kullanılmıyordu; kural yalnız dört alanla çalışıyordu. Ürün ya da mağaza bazlı istisna gerekiyorsa bu ayrıca tasarlanmalı. — `rules.mjs:89-118`
- Fail-open yükleme tuzağı K-04'te; aynı kök sebep.

### K-06 — Fiyat stratejisi, taban fiyat, buy box

**Ne yapar.** Şirket bazlı fiyat stratejisi tutar; buy box'ı izler ve taban fiyatın altına inmez.

**İş kuralı.** Taban fiyat **hesaplanır, elle girilmez**:

```
taban = yukarı_kuruşa_yuvarla( (maliyet + kargo + maliyet × asgari_marj) / (1 − pazar_komisyonu) )
```

Karar sırası: (1) şirket "strateji dışı" listesindeyse **beklet**; (2) şirket için strateji tanımı yoksa beklet; (3) strateji kapalıysa beklet; (4) buy box takibi kapalıysa beklet; (5) rakip fiyatı yok ya da sıfırdan küçükse beklet; (6) rakip fiyatı tabanın altındaysa **atla** (inilmez); (7) aksi hâlde fiyat rakip fiyatına **eşitlenir** — altına inilmez. Rakip fiyat verisi yalnız resmî API ya da lisanslı sağlayıcıdan alınır (§5 hukuki sınır).

**Kabul kriteri.** Voida'da buy box izleniyor, taban fiyatın altına inilmiyor; Lady strateji dışında tutuluyor; fiyat kararı gerçekten ilana yazılıyor.

**Tuzaklar.**

- **Orta — şirketi belirsiz fiyat kararı joker stratejiye düşüp fiyat değiştiriyor.** `*` (varsayılan) strateji kaydı varken, şirket alanı **hiç verilmeyen** bir fiyat kararı `beklet` yerine `eşitle` döndü ve 100 €'ya çıktı. Yazım hatalı ya da tanımsız şirket için otomatik fiyat değişikliği üretiliyor. **Şirket alanı boşsa karar daima beklet olmalı; joker kayıt yalnız açıkça `*` istendiğinde kullanılmalı.** — İK #12, `price-strategy.mjs:43,84-95`
- **Orta — strateji listesi okunamıyordu:** yol hem okuma hem yazma kümesindeydi, yazma kümesi önce eşleştiği için liste isteği "POST bekleniyor" hatası veriyordu. Panel stratejileri gösteremiyordu. — İŞ #9
- **Fiyat kararı hiçbir yere yazılmıyordu.** Karar üretiliyor ama fiyatı ilana yazan ya da panele ileten bir yol yoktu. Kabul kriteri "karar üretiliyor" değil "fiyat değişiyor" olmalı. — İŞ "Eksik parçalar"
- **Düşük — `__proto__` şirket adıyla strateji kaydı** kabul ediliyordu (bkz. §4 prototip kirlenmesi).
- **Komisyon oranları iki ayrı dosyada farklıydı** (Amazon ve Kaufland için fiyat modülü ile pazar analizi modülü ayrı sayılar tutuyordu). Komisyon tablosu **tek kaynakta** olmalı. — İK, M #12

---

## 4. SaaS yapısı

### K-07 — Admin paneli ve kullanıcı paneli ayrımı

**Ne yapar.** Çok kiracılı yapıda kullanıcının yalnız kendi kiracısının verisini görmesini sağlar.

**İş kuralı.** Bir kullanıcı en fazla tek kiracıya bağlıdır; başka kiracıya atanınca eski bağ kalkar. Platform yöneticisi tüm kiracıları görür. Diğer roller yalnız kendi kiracısının kayıtlarını görür. Kiracı adı benzersizdir. Yalıtım **veritabanında** uygulanır (§5a).

**Kabul kriteri.** Kullanıcı kendi şirketi dışındaki hiçbir veriyi görmüyor; bu, her uç için ayrı ayrı otomatik testle kanıtlanıyor.

**Tuzaklar.**

- **Kritik — kiracı yalıtımı yazılmış ama hiçbir uçta çağrılmamış.** Kapsam fonksiyonu (`scopeOf`) yazılmıştı ve testleri geçiyordu, ama hiçbir uç onu çağırmıyordu. Canlı doğrulandı: "KiraciB"ye atanmış bir editör, yönetici kiracı listesini çağırınca **KiraciA ve KiraciB'yi ve ikisinin API anahtar özetlerini** gördü. Havuz, feed, pano, iade, destek, sipariş uçlarının hiçbiri kiracıya göre süzmüyordu. Konsey başkanının özeti: *"Yazılmış bir kapı, bağlanmamışsa yok hükmündedir; üstelik 'var' göründüğü için daha tehlikelidir."* — G #1, İŞ #7, M #2, `tenants.mjs:150-156`
- **Kritik — düzenleyen rolü kiracı anahtar kasasına erişebiliyordu.** Rol kapısı yalnız üç yol desenini yöneticiye kısıtlıyordu; `duzenleyen` rolü kiracı oluşturabildi, API anahtarı koyabildi ve iptal edebildi (entegrasyonu durdurma yetkisi), paket düşürüp kiracı kapatabildi. **Yetki, yol deseni üzerinden değil, uç → rol tablosu üzerinden verilmeli ve rol × uç matrisi uçtan uca test edilmeli.** — G #2, M #1, `handler.mjs:118`
- **Yüksek — okuma uçlarında rol ayrımı yoktu.** Kapı yalnız yazma isteklerini görüntüleyen role kapatıyordu; salt-okuma hesabı destek yazışmalarını ve müşteri e-postalarını, iade ve fatura kayıtlarını, B2B vergi numaralarını, tüm kiracı listesini okuyabiliyordu. `docs/09` §4'teki "kişisel veri sunucudan kısılmadan geliyor" bulgusunun aynısı. — G #5
- **Düşük — kiracı durumu başka kiracıların mağaza adlarını sızdırıyordu:** spot ürün ekranı "eksik mağazalar" alanını tüm kiracıların mağaza adlarından üretiyordu. — G #14

### K-08 — Bronze / Silver / Gold paketler

**Ne yapar.** Abonelik paketine göre şirket ve mağaza sayısını sınırlar.

**İş kuralı.** Limit iki yönlüdür: bir hesap altındaki **şirket sayısı** ve bir şirketin **mağaza sayısı** paket limitini aşamaz. Paket düşürülürken mevcut mağaza sayısı yeni limitten fazlaysa işlem reddedilir (sessizce veri kapatılmaz). Aynı pazar + aynı ad ile ikinci mağaza açılamaz. Limit aşımında kullanıcıya yükseltme önerisi gösterilir.

**Kabul kriteri.** Paket limiti aşıldığında yeni mağaza eklenemiyor, kullanıcıya yükseltme çıkıyor; paket düşürme veri kaybına yol açmıyor.

**Tuzaklar.** Paket **fiyatı ve süresi** kodda hiç yoktu; yalnız sayı limitleri vardı. Faturalama, deneme süresi, ödeme başarısızlığında ne olacağı tasarlanmadı. Kiracı "kapalı" bayrağı vardı ama **kapalı kiracının engellenmesi uygulanmamıştı** — bayrak yalnız kayıt tutuyordu. Limit sayıları geliştirici varsayımıdır (§6).

### K-09 — Kiracının kendi API anahtarıyla entegrasyon

**Ne yapar.** Her kiracının Amazon, Kaufland, DHL gibi servisler için kendi anahtarını girmesini sağlar.

**İş kuralı.** Anahtar kiracı × sağlayıcı bazında, kiracı kaydından **ayrı** saklanır. Şifreleme AES-256-GCM, `kiracı|sağlayıcı` bağlama verisi (AAD) ile. Şifreleme anahtarı **kendi gizli değerinden** türetilir ve **sürümlenir** (anahtar kimliği/`kid` saklanır). Listeleme anahtarı döndürmez: yalnız sağlayıcı, eklenme zamanı, son 4 karakter, etkin mi. İptalde şifreli veri silinir, kayıt "iptal edilmiş" olarak kalır. Anahtar hiçbir log'a düşmez. Aynı sağlayıcıya yeni anahtar eskinin üzerine yazar.

**Kabul kriteri.** Kullanıcı anahtarını giriyor, bağlantı testi geçiyor; anahtar şifreli saklanıyor ve panelde bir daha açık gösterilmiyor; iptal edilen anahtarla istek başarısız oluyor.

**Tuzaklar.**

- **Anahtar kasasının şifreleme anahtarı oturum gizli değeriyle aynıydı.** Oturum sırrı döndürülürse (ki rutin bir güvenlik işlemidir) **tüm kiracı anahtarları çözülemez** hâle gelir; sistem bunu hata olarak değil sessiz `null` olarak döndürüyordu ve test "çözülemedi" diyordu. Anahtar sürümü yoktu, bu yüzden kademeli döndürme de yapılamıyordu. **Kasanın kendi anahtarı ayrı olmalı ve sürümlenmeli.** — G #11, `tenants.mjs:162-168`
- Bağlantı testi gerçek ağ çağrısı yapmıyordu; yalnız "anahtar var mı, çözülüyor mu, biçimi sağlam mı" bakıyordu. Kabul kriteri **gerçek sağlayıcıya karşı** doğrulanmalı.
- Yetki tuzağı K-07'de: düzenleyen rolü anahtar koyup iptal edebiliyordu.

---

## 5. Fatura, iade, lojistik

### K-13 — Storno (iade faturası) üretimi

**Ne yapar.** İade onaylandığında iade faturası üretir ve müşteriye gönderir.

**İş kuralı.** Numara `ST-<yıl>-<sıra>` biçimindedir; sıra yıl başına birden artar, **boşluk atlamaz, tekrar etmez**, sayaç ve fatura aynı veritabanı işleminde yazılır (§5c). Yıl **iş saat diliminden** belirlenir, sunucu yerel saatinden değil. İdempotans: iade başına tek fatura; ikinci çağrı mevcut faturayı döner. **Reddedilmiş ya da henüz onaylanmamış iadeye fatura kesilmez.** Tutarlar: brüt = Σ(satır birim fiyat × adet) kuruş cinsinden; net ve KDV brütten ayrıştırılır. KDV oranı **şirketin ülkesine ve rejimine göre** belirlenir (`docs/11` sorun 3: tek orana sabitlemek vergi raporunu bozar). Fatura silinmez; `0009` kural 5 geçerlidir: kesin fatura geri alınamaz.

**Kabul kriteri.** İade onaylandığında storno faturası numaralı seride üretiliyor ve müşteriye ulaşıyor; seride boşluk ya da tekrar yok; aynı iade için ikinci fatura üretilmiyor.

**Tuzaklar.**

- **Yüksek — storno faturası `talep edildi` durumunda kesilebiliyordu.** Sıra: iade talebi → storno kes → iadeyi **reddet**. Sonuç: iade `reddedildi` ama `ST-2026-00004` numaralı fatura ortada duruyor ve müşteriye e-posta da gitmiş. **Ödenmemiş storno faturası ve tüketilmiş numara kalıyor.** Fatura yalnız onaylanmış/alınmış iade için kesilmeli. — İK #4, `refunds.mjs:141-142,199`
- **Orta — fatura yılı sunucu yerel saatinden alınıyordu.** Sunucu UTC'deyse 31 Aralık gece yarısı fatura **yanlış yıla** yazılır ve seri bütünlüğü bozulur. — M #12
- **KDV tek orana (%19) sabitti.** 12 şirket DE/NL/TR; OSS ve ters yük yok. Bu, eski panelde de bulunan bir hata (`docs/11` sorun 3) ve yeni kodda tekrarlandı. — `refunds.mjs:11`
- **Düşük — büyük tutarda kuruş hassasiyeti kayboluyor:** kayan noktalı aritmetik `840336134453781.6` gibi tam kuruş olmayan net değer üretti. Para **tam sayı kuruş** (ya da `numeric`) olmalı; üst sınır denetimi konmalı. — İK #16

### K-14 — İade etiketi takibi ve otomatik para iadesi

**Ne yapar.** İade etiketi "teslim edildi" olunca ödeme sağlayıcısı üzerinden parayı otomatik iade eder.

**İş kuralı.** Talep: sipariş ve kalemler zorunlu. Aynı kalem için kapanmamış bir iade varken ikincisi **çakışma**; iade edilmiş + istenen adet sipariş adedini aşamaz; aynı kalem tek talepte tekrar edemez. Tutar kuruş cinsindendir ve **negatif olamaz**. Ödeme için üç şart birlikte: durum `alındı` veya `onay bekliyor`; storno faturası **önceden** kesilmiş; iade tutarı fatura brüt tutarına **birebir** eşit. Tutar eşiğin üzerindeyse ve onaylayan yoksa durum `onay bekliyor` olur, ödeme yapılmaz. **Dört göz: talebi açan kişi onaylayamaz; onaylayan kimliği istekten değil oturumdan alınır.** İdempotans: ödeme kaydı iade kimliğine bağlı tek satırdır — çift ödeme yapısal olarak imkânsızdır, ikinci çağrı "zaten ödendi" döner. İade ödendiğinde sipariş durumu ve ciro güncellenir (`0009` kural 7: ciro iptal ve iadeleri içermez).

Durum makinesi:

```
talep edildi → etiket gönderildi | reddedildi
etiket gönderildi → alındı | reddedildi
alındı → iade edildi | onay bekliyor | reddedildi
onay bekliyor → iade edildi | reddedildi
iade edildi, reddedildi: sonlu
```

**Kabul kriteri.** Etiket "teslim edildi" olduğunda para otomatik iade ediliyor; çift iade mümkün değil; eşik üstü iade ikinci kişinin onayı olmadan ödenmiyor.

**Tuzaklar.**

- **Yüksek — dört göz yok: iadeyi açan kendisi onaylıyordu.** Onaylayan kimliği **istek gövdesinden** alınıyordu: `approvedBy = body.approve === true ? by || 'yönetici' : undefined`. 500 € (eşik 200 €) bir iade `onay bekliyor` oluyor, **aynı kullanıcı** `{approve:true}` gönderince `iade edildi` olup ödeme kaydı üretiliyordu. 306,70 € ile de doğrulandı. Yani **eşik pratikte hiçbir şeyi engellemiyordu.** Onaylayan daima oturumdan alınmalı ve talep edenle aynı olamaz. — G #3, İŞ #11, M #1, `admin-refunds.mjs:51`
- **Orta — negatif fiyatlı kalem negatif iade açıyor ve onay eşiğine takılmıyor.** `{price:-5, qty:2}` kalemi için iade talebi kabul edildi, tutar `-5` oldu. Negatif tutar **her zaman** eşiğin altında kaldığı için insan onayı hiç istenmez. — İK #13
- **Orta — doğrulanmamış sipariş için iade açılabiliyordu** (sipariş durumu hiç denetlenmiyordu). — İŞ #12
- **Orta — iade ödendikten sonra ciro ve sipariş durumu değişmiyordu.** İade tutarı ciroya yansımıyor, "net ciro" alanı yok. `0009` kural 7 bunu zorunlu kılar. — İŞ #13
- İade kapsamına **kargo bedelinin** girip girmeyeceği hiç tasarlanmamıştı; yalnız kalem fiyatları toplanıyordu. Bu bir iş kararıdır (§6).
- Ödeme sağlayıcısı (Mollie/PayPal) simülasyondu; gerçek entegrasyonda **idempotans anahtarının sağlayıcıya da geçirilmesi** gerekir.

### K-15 — Kargo başarı skoru

**Ne yapar.** DHL, GLS ve UPS'in bölge bazında teslim ve kayıp oranlarını ölçer.

**İş kuralı.** Bölge = Alman posta kodunun ilk iki hanesi (5 hane rakam, "00" ile başlamaz). Sayaç: bölge × firma × sonuç (`teslim edildi` / `kayıp` / `geç`). Skor = (teslim + geç_ağırlığı × geç) / toplam; kayıp sıfır sayılır. Bir firma bir bölgede **asgari örnek sayısına** ulaşmadan sıralamaya girmez ("güvenilir değil"). Firmalar **tablodur**, kod değişikliği olmadan eklenir.

**Kabul kriteri.** Posta kodu bazında skor tablosu üretiliyor ve geçmiş veriden besleniyor; yeni bir kargo firması kod değişmeden ekleniyor.

**Tuzaklar.**

- **Orta — yeterli veri yokken UPS kuralı hiç uygulanmıyordu.** Temiz veritabanında yüksek tutarlı, şirket adresine giden bir sipariş için beklenen UPS, gözlenen DHL ("güvenilir veri yok, varsayılan firma"). Yalnız DHL güvenilirken de UPS seçilmiyordu. Yani **açılış döneminin tamamında K-17 çalışmıyordu.** Soğuk başlangıç davranışı ayrıca tasarlanmalı (ör. varsayılan skorlar ya da kuralın skordan bağımsız çalışması). — İK #10, `shipping.mjs:151-159`
- **Orta — sipariş tutarı metin olarak gelirse eşik sessizce kapanıyordu.** `orderTotal: "1000"` (metin) sayı kontrolünden geçemeyip sıfır sayılıyor, UPS eşiği devreye girmiyor, sessizce DHL seçiliyordu. **Beklenen: ya doğru çalışsın ya hata versin; sessiz sıfır olmaz.** — İK #11, İŞ #23

### K-16 — Otomatik etiket seçimi

**Ne yapar.** Siparişin posta koduna göre etiketi en yüksek skorlu firmadan bastırır.

**İş kuralı.** Etkin firmalar arasında sırayla: (1) UPS kuralı (K-17) tetiklendi ve koşulları sağlandıysa UPS; (2) bölgede güvenilir firmalar arasında skoru en yüksek olan (eşitlikte tablo sırası); (3) hiçbiri güvenilir değilse varsayılan firma. Etkin firma yoksa hata. **Her seçim gerekçesiyle günlüğe yazılır** (sipariş, posta kodu, firma, ek ücret, neden). Posta kodu siparişten okunur; geçersizse hata.

**Kabul kriteri.** Siparişin posta koduna göre etiket doğru firmadan basılıyor; seçim gerekçesi loglanıyor; seçim sipariş kaydına yazılıyor.

**Tuzak — Yüksek: kargo seçimi sipariş akışına hiç bağlı değildi.** Etiket üretme fonksiyonu hiçbir yerden çağrılmıyordu, siparişte kargo firması/etiket alanı yoktu, seçim günlüğü **boş** kalıyordu (günlüğü yalnız çağrılmayan fonksiyon dolduruyordu). Modül kendi testlerinde doğru çalışıyor, sistemde hiç çalışmıyordu. Konsey bunu genel bir desen olarak adlandırdı: **"ada modüller"** — bkz. §7. — İŞ #6, M #7

### K-17 — UPS kuralı

**Ne yapar.** Şirket adresine teslim ya da tutar eşiği üstündeki siparişlerde, UPS'in güçlü olduğu bölgede UPS seçer; el teslim ek ücretini siparişe yansıtır.

**İş kuralı.** Sipariş tutarı eşiğin **üzerinde** ya da teslimat şirket adresine ise UPS düşünülür; UPS yalnız o bölgenin güvenilir sıralamasında üst sıralardaysa seçilir ve el teslim ek ücreti sipariş maliyetine eklenir. Koşul sağlanmazsa normal skor kuralına düşülür. Eşik ve ek ücret **yönetici tarafından panelden değiştirilebilir** olmalıdır.

**Kabul kriteri.** Kural şartları sağlandığında UPS seçiliyor, ek maliyet siparişe yansıtılıyor; eşik panelden değiştirilebiliyor.

**Tuzaklar.** Eşiği ve varsayılan firmayı değiştiren **hiçbir uç yoktu**: ayar fonksiyonu yazılmış ama ne uca bağlanmış ne test edilmişti; yalnız kod değişikliğiyle ayarlanabiliyordu. — İŞ #16, M #7. Eşikte **eşitlik tetiklemiyordu** (kesin büyüktür kullanılmıştı); sınır davranışı yazılı olarak kararlaştırılmalı. Eşik değeri ve ek ücret geliştirici varsayımıdır (§6).

---

## 6. Pano, destek, analiz

### K-18 — Canlı ciro ve adet

**Ne yapar.** Şirket, mağaza ve pazar yeri bazında ciro ve adedi gösterir.

**İş kuralı.** İptal ve doğrulanmamış siparişler hariçtir; iadeler ciroyu eksi sipariş olarak değil, ayrı net ciro hesabıyla düşürür (`0009` kural 7: katkı = ciro − KDV − komisyon − kargo). Toplama **tam sayı kuruş** üzerinden yapılır. **Okunamayan ya da negatif tutarlı sipariş toplama girmez, ayrı bir "atlanan" sayacına yazılır ve panelde görünür.** Gruplama: şirket, mağaza, pazar yeri, gün — bu alanlar **sipariş kaydında bulunmak zorundadır**. Gün sınırı tek bir iş saat diliminden belirlenir (§6 açık soru). Panelde daima "son güncelleme" ve veri eskiyse uyarı gösterilir; pazar yeri API'leri satışı anında bildirmez.

**Kabul kriteri.** Pano satış gerçekleştikten sonra bilinen ve gösterilen bir gecikmeyle güncelleniyor; toplamlar muhasebe kaydıyla tutuyor; tek bozuk kayıt raporu bozmuyor.

**Tuzaklar.**

- **Kritik — tek bozuk tutar tüm ciro raporunu bozuyordu.** Dönüşüm `Math.round(Number(n)*100) || 0` idi. `total: Infinity` olan **tek** kayıt eklendiğinde toplam `Infinity` oldu ve JSON'da `null` olarak çıktı: **pano tamamen boş.** `'12,50'` (Türkçe ondalık) sessizce **0 €** sayıldı. `-500` olduğu gibi toplandı. **Her tutar ayrıştırılırken doğrulanmalı; bozuk kayıt toplamı zehirlemek yerine ayrı sayılmalı ve gösterilmeli.** — İK #3, `dashboard.mjs:56`
- **Yüksek — gün anahtarı yanlış saat diliminden.** Gün sınırı `Europe/Istanbul`'dan hesaplanıyordu. Berlin'de 31 Aralık 22:30'daki satış `2027-01-01` gününe yazıldı — **yıl sonu cirosu yanlış yıla geçti.** 31 Ocak 22:30 → 1 Şubat (ay sonu kayması). Yaz saati geçişinde iki dilim bir gün ayrışıyor. Hangi dilimin iş kuralı olduğu karara bağlanmalı (§6). — İK #7
- **Yüksek — ciro kırılımı hep tek satır "bilinmiyor".** Şirket/mağaza/pazar yeri kırılımı istendiğinde üçü de tek satır döndü, çünkü **sipariş kaydında bu alanlar yoktu.** Konsey başkanının üç yapısal boşluktan biri olarak saydığı madde: *"Bu bir hata değil, eksik bir sözleşme."* Sipariş kaydının taşıyacağı alanlar daha ilk tasarımda belirlenmeli. — İŞ #4
- **Yüksek — eski özet yeni özeti eziyordu.** İki yol tanımı çakıştı, eski yönlendirme önce eşleştiği için yeni pano verisi hiç dönmedi. — İŞ #3

### K-19 — Günlük hedef sayaçları

**Ne yapar.** Kategori bazında günlük hedef tutar (100 parfüm, 100 toner, 50 saat) ve her satışta geri sayar.

**İş kuralı.** Hedef = kategori, etiket, adet (en az 1). Kalan sayaç sıfırın altına inmez. Hedef adedi değiştirilirse kalan aynı farkla kayar ve 0 ile yeni adet arasına kırpılır. **Gece sıfırlama yalnız ileri gidişte çalışır:** son sıfırlama günü bugünden *küçükse* sıfırlanır; geriye giden saatte (NTP düzeltmesi, farklı saatli işçi süreç) sıfırlama yapılmaz. Sayaç **sipariş olayıyla** otomatik düşer.

**Kabul kriteri.** Hedef kategori bazında tanımlanıyor, gerçek satışla azalıyor, gece sıfırlanıyor.

**Tuzaklar.**

- **Orta — sıfırlama gün *eşitsizliğine* bakıyordu.** Sıra: 10 Haziran'da tüket → 11 Haziran'da oku → 10 Haziran'da tekrar oku. Son okumada sayaç 8'den 10'a döndü: **o günün tüm tüketimi silindi.** Saat geriye giderse (saat düzeltmesi, farklı dilimdeki işçi süreç) üretimde gerçekleşir. — İK #14, `dashboard.mjs:160-167`
- **Orta — sipariş sayacı düşürmüyordu.** Sipariş verildiğinde sayaç değişmiyordu; yalnız elle çağrıyla düşüyordu, hiçbir modül onu çağırmıyordu. — İŞ #15
- **Yüksek — `__proto__` kategori adıyla küresel prototip kirlenmesi** (bkz. §7).

### K-20 — Spot ürün takibi

**Ne yapar.** Spot alınan üründe (ör. 3000 yastık) kalan adedi, günlük satış hızını ve eksik mağazaları gösterir.

**İş kuralı.** Spot = havuz ürünü + toplam adet + listelendiği mağazalar. Satış sayımı **havuz kimliği üzerinden** yapılır; sipariş kalemleri havuz kimliğine çözümlenebilir olmalıdır (K-01'e bağımlılık buradan gelir). Kalan = max(0, toplam − satılan). Günlük hız = satılan / ilk satıştan bugüne geçen gün. Kalan gün = üste yuvarla(kalan / hız); hız sıfırsa belirsiz. Eksik mağazalar = **kiracının kendi** mağaza evreni eksi listelenenler.

**Kabul kriteri.** Spot ürün eklendiğinde kalan adet, günlük hız ve eksik mağazalar görünüyor; sayım gerçek siparişlerden geliyor.

**Tuzaklar.**

- **Yüksek — spot satış sayımı sıfır dönüyordu.** Havuz kimliğiyle spot tanımlandığında satılan `0` çıktı; katalog kimliğiyle `14` çıktı. Sipariş kalemi **katalog kimliği** taşıyordu, havuzla eşleşme yoktu. Sipariş kalemi ile havuz kartı arasındaki bağ **sipariş oluşurken** kurulmalı. — İŞ #5
- **Düşük — eksik mağaza listesi tüm kiracıların mağaza adlarını sızdırıyordu** (K-07 tuzağıyla aynı kök). — G #14

### K-21 — Ticket ve e-posta otomatik cevabı

**Ne yapar.** İade isteyen müşteriye önce kısmi iade teklifi sunar; kabul edilmezse iade etiketi verir.

**İş kuralı.** Gelen e-posta sırayla sınıflanır: **kritik (K-22, her şeyi ezer)** → iade → şikayet → diğer. Otomatik cevap **yalnız** iade sınıfındaki ve `açık` durumundaki ticket'a verilir: kısmi iade teklifi ve iki cevap seçeneği (kabul / iade etiketi). Müşteri cevabı üç yola ayrılır: açık kabul → `teklif kabul edildi`; açık ret → `etiket gerekiyor` ve etiket üretilir; **belirsiz (hiçbiri, ikisi birden ya da olumsuzlama) → insana devredilir.** Tahmin edilmez. **Teklif, tüketicinin cayma hakkını ortadan kaldıramaz:** müşteri doğrudan iade isterse etiket verilir. Kabul edilen teklif **gerçek bir iade kaydı ve ödeme** üretir (K-14); etiket talebi **gerçek etiket** üretir (K-16).

Durumlar: `açık → teklif gönderildi → teklif kabul edildi | etiket gerekiyor | insana devredildi`.

**Kabul kriteri.** Teklif akışı uçtan uca çalışıyor; kabul edilen teklif para iadesi üretiyor; müşteri cevabı doğru yorumlanmadığında insana devrediliyor.

**Tuzaklar.**

- **Orta — kabul edilen teklif hiçbir eylem üretmiyordu.** Müşteri "Ja" dediğinde ticket `teklif kabul edildi` oluyor ama **iade kaydı da ödeme de açılmıyordu**; `etiket gerekiyor` da gerçek etiket üretmiyordu. Şikayet ticket'ı şikayet kaydına (K-23) dönüşmüyor, çözülen ticket personel metriğini (K-25) beslemiyordu. Durum makinesi dönüyor, iş akmıyor. — İŞ #14
- **Düşük — kabul/ret kalıpları yalnız Almancaydı.** "Tamam kabul ediyorum" insana devrediliyordu; Almancada da kenar durumlar ("Vielleicht…", "Ja, aber nicht ohne Rücksendung") devrediliyordu. Devredilmesi doğrudur ama kalıp listesi **dil başına** tasarlanmalı ve çok dilli olmalı. — İŞ #28
- **Hukuki açık soru:** "geri göndermeden kısmi iade" teklifinin tüketicinin cayma hakkını ve tam iade yükümlülüğünü gölgeleyip gölgelemediği hukuken incelenmeli. — H "Açık hukuki sorular" 5

### K-22 — Kritik e-posta uyarısı

**Ne yapar.** Resmî kurum, avukat ve düzenleyici kaynaklı yazışmada otomatik cevabı keser ve yetkiliye anında bildirir.

**İş kuralı.** Gönderen alan adı ya da metin, resmî kurum / avukat / düzenleyici kalıplarından **birine** uyarsa ticket kritiktir. Kritik ticket: yükseltilmiş işaretli, durumu `insana devredildi`, sistem notu düşer, uyarı kaydı yazılır ve bildirim gider. **Ajan kritik ya da yükseltilmiş ticket'a hiçbir yolla otomatik cevap yazamaz — tek bir kapıdan geçer ve ihlal hata üretir.** Bu `0006`'daki "önce onay" ilkesinin en sert hâlidir: burada onay bile değil, tam kesinti vardır. Kalıp listesi kiracı diline göre yapılandırılabilir olmalıdır.

**Kabul kriteri.** Resmî kurum kaynaklı e-posta geldiğinde otomatik cevap verilmiyor, yetkiliye anında bildirim gidiyor; kritik ticket'a ajan erişimi denendiğinde hata alınıyor.

**Tuzaklar.** **Veri koruma başvuruları kritik sayılmıyordu:** GDPR erişim/silme talepleri ve dava bildirimi kalıpları "diğer" sınıfına düşüyordu — oysa bunların **yasal yanıt süresi** vardır. Kalıp listesi kodda sabit bir dizi olarak duruyordu, ürün sahibi gözden geçirmemişti. Bildirimin kime, hangi kanaldan gideceği tasarlanmamıştı (yalnız kayıt yazılıyordu). — H-13, `support.mjs:28-56`

### K-23 — Tekrarlayan şikayet raporu

**Ne yapar.** Aynı üründe eşik üzeri şikayet birikince tedarikçi bazında indirim/tazminat talebi raporu üretir.

**İş kuralı.** Şikayet kaydı = ürün (havuz kimliği), marka, tedarikçi, gerekçe. Rapor `(tedarikçi, ürün)` çiftine göre sayar; eşiği aşanlar çoktan aza listelenir ve her satıra talep metni eklenir. **Sayım bir zaman penceresi içinde yapılır** (bkz. tuzak). Eşik kiracı bazında panelden ayarlanabilir.

**Kabul kriteri.** Aynı üründe eşik üzeri şikayet birikince tedarikçi bazında rapor üretiliyor; eşik panelden değiştirilebiliyor.

**Tuzaklar.** **Zaman penceresi yoktu:** iki yıl önceki şikayet bugünkü eşiğe sonsuza dek sayılıyordu, tek sınır toplam kayıt tavanıydı. Düzelen bir tedarikçi asla listeden çıkmaz. **Eşiği ayarlayan uç yoktu** (fonksiyon yazılmış, bağlanmamış). Şikayet kaydı ticket akışından **otomatik doğmuyordu** (K-21 tuzağı). Eşik değeri geliştirici varsayımıdır (§6). — İŞ #22, M #7, `support.mjs:263`

### K-25 — Personel performans analizi

**Ne yapar.** Destek personelinin iş çıktısı metriklerini raporlar.

**İş kuralı.** **Yalnız iş çıktısı ölçülür:** kayıt = kullanıcı, tür (ilk cevap / çözüm), süre, ticket. Ekran görüntüsü, tuş kaydı, çevrimiçi süresi **saklanmaz** — GDPR ve BetrVG §87 gereği gizli izleme yasaktır; ölçüm şeffaf ve sözleşmeye dayalı olmalıdır. Süre **sunucu tarafında** ölçülür, istemcinin bildirdiği değer kabul edilmez. Kişi başına: ticket sayısı, ilk cevap ortalaması, çözüm ortalaması ve p90. **Ekip asgari kişi sayısının altındaysa kişi bazlı döküm verilmez** (yalnız ekip düzeyi) — küçük ekipte kişi karşılaştırması hem yanıltıcıdır hem de bireysel performans izlemeye dönüşür. Kayıtların saklama süresi vardır.

**Kabul kriteri.** Çözüm süresi ve ticket sayısı gibi iş çıktısı metrikleri raporlanıyor; küçük ekipte kişi bazlı döküm verilmiyor; ekran izleme verisi hiçbir yerde tutulmuyor.

**Tuzaklar.**

- **Orta — küçük ekipte kişi bazlı döküm engellenmiyordu:** asgari ekip sayısının altında da kişi sıralaması dönüyordu, yalnız bir **uyarı metni** ekleniyordu. Uyarı bir kapı değildir. — H-09
- **Süre istemcinin bildirdiği değerdi**, sunucu ölçmüyordu: personel kendi metriğini etkileyebilir.
- **Saat aralığıyla sorgulanabiliyordu:** zaman damgası + kişi, çalışma saati örüntüsü çıkarmaya yeter — bu, iş çıktısı ölçümünün sınırını aşar.
- **Saklama süresi yoktu** (yalnız kayıt tavanı) ve çalışana bildirim/devreye alma bayrağı kodda yoktu. — `staff.mjs:21,26,30,82-83`

### K-27 — Pazar ve trend analizi

**Ne yapar.** Trendyol, Hepsiburada, N11 ile Amazon ve Kaufland fiyatlarını karşılaştırır, marj hesabıyla ürün önerir.

**İş kuralı.** Pazar verisi **dışarıdan içe aktarılır**; kaynak türü (resmî API / affiliate / lisanslı sağlayıcı) **zorunludur** ve sağlayıcı adı, lisans referansı ve içe aktaranla birlikte denetim kaydına yazılır. **Bot koruması aşılmaz, kazıma yapılmaz** (§8). Satır doğal anahtarı `(pazar, EAN)`; tekrar içe aktarma günceller. EAN doğrulaması K-02 ile **aynı** kuralı kullanır. Tüm fiyatlar **tarihli kur** ile EUR'a çevrilir; kur sabit kodlanmaz. Karşılaştırma: EAN başına pazar fiyatları, en düşük, en yüksek, fark. Arbitraj:

```
net marj = satış_fiyatı − alış_fiyatı − kargo − alış × gümrük_payı − satış × hedef_pazar_komisyonu
```

Asgari marjın altındakiler elenir; sıralama net marja göre azalandır. Komisyon tablosu **K-06 ile aynı kaynaktan** okunur.

**Kabul kriteri.** Marj hesabıyla birlikte ürün öneri listesi üretiliyor; her satırın veri kaynağı ve içe aktarma zamanı kayıtlı; kaynağı belgelenmemiş veri sisteme giremiyor.

**Tuzaklar.**

- **Yüksek — saat analizi sabit `+3` kaydırmayla yapılıyordu.** Alman ziyaretçinin tek bir olayı için saat `6` çıktı, Berlin saati `4` idi (yazın 2, kışın 1 saat sapma) ve yaz saati geçişinde tutarsızlaşıyor. Üstelik pano modülü aynı iş için `Europe/Istanbul` kullanıyordu: **iki modül iki farklı zaman kavramı.** Saat dilimi tek bir yerde, adlandırılmış dilim olarak tanımlanmalı. — İK #8
- **Orta — veri kaynağı yalnız öz-beyandı.** Kaynak türü etiketi isteyen taraf kendisi koyuyordu; sağlayıcı adı, lisans referansı ya da imza istenmiyordu, içe aktarma denetim kaydına yazılmıyordu, kullanıcı adı yoktu. **Hukuki kapı kayıt tutuyor gibi görünüyor ama gerçek bir kapı değil.** — H-08
- **Orta — pazar verisi sınırsız büyüyordu:** istek başına satır sınırı vardı, toplam tavanı yoktu; tek belge sürekli şişiyordu ve her okuma tamamını ayrıştırıyordu. Postgres'te tablo + indeks + saklama politikası gerekir.
- **Para dönüşümü kayan noktadaydı**, diğer modüller kuruş tam sayı kullanıyordu: aynı sistemde üç ayrı para yöntemi. — M #12

### K-28 — Trend bazlı kategori önerisi

**Ne yapar.** Moda, koku ve tarz gibi kategorilerde yükseliş ve düşüşü gerekçesiyle raporlar.

**İş kuralı.** Son yarı dönem ile önceki yarı dönemin kategori ilgi sayısı karşılaştırılır: `büyüme = (son − önceki) / max(önceki, 1)`, [−1, +1] aralığına kırpılır. `skor = kırpılmış büyüme + satış payı`. Yön eşiği simetriktir (yukarı / yatay / aşağı). Sıralama skora göre azalandır ve **her satır gerekçe taşır**. Ziyaretçi davranışı girdisi Mixoutlet'ten gelir ve **yalnız çerez onayı vermiş ziyaretçiyi** kapsar (§8); onaysız trafik modele girmez.

**Kabul kriteri.** Kategori önerileri gerekçesiyle raporlanıyor; girdi verisinin onay durumu kaynakta süzülmüş olarak geliyor.

**Tuzaklar.**

- **Bölge kırılımı hep "veri yok" çıkıyordu:** olay alımı bölge alanını hiç saklamıyordu, ama rapor bölge kırılımı vaat ediyordu. — İŞ #20
- **Bağlam verisi (hava, iade, şikayet) için içe aktarma ucu yoktu**; kart bunu vaat ediyordu. — İŞ #21
- Yön eşiği ve dönem uzunluğu geliştirici varsayımıdır (§6).
- **Bölünme sonrası:** ziyaretçi davranışı (K-29) Mixoutlet'te kalır. Bu kart girdiyi bir **entegrasyon noktasından** alır; onay süzmesinin kaynakta yapıldığı sözleşmeyle garanti edilmeli, ERP kendi süzmesini de uygulamalı.

---

## 7. Çapraz kesen tuzaklar (kart değil, desen)

Konsey başkanı 92 bulgunun üç yapısal boşluktan geldiğini yazdı ve üçünün de aynı kök nedeni olduğunu söyledi: **modüller birbirinden habersiz, paralel yazılmıştı.** WawiERP tek geliştiriciyle ve yapay zekâ desteğiyle yazılacağı için (`0002`) bu risk aynen geçerlidir — hatta paralel ajanlarla çalışıldığında daha yüksektir.

**7.1 "Kapı var, kapıyı çağıran yok."** Kiracı yalıtımı, rol kısıtı, kural motoru ve çerez onayı — dördü de yazılmış, testleri geçmiş, ama çağrı yerlerine bağlanmamıştı. *Yazılmış bir kapı, bağlanmamışsa yok hükmündedir; üstelik "var" göründüğü için daha tehlikelidir.* **Karşı önlem:** her kapı için uçtan uca (uç düzeyinde) test; birim testi yeterli sayılmaz. Konseyin ölçümü: servislerde satır kapsamı %93 iken uç dosyalarında %59'du ve **raporlanan 92 bulgunun hiçbirini mevcut testler yakalamıyordu.**

**7.2 Sessiz izin (fail-open).** Üç ayrı yerde varsayılan "izin ver" tarafındaydı: kural motoru yüklenemezse yasak atlanıyordu, şirket alanı geçilmezse yasak atlanıyordu, onay damgası yoksa olay yine sayılıyordu. **Karşı önlem:** güvenlik ve uyum kapıları daima "reddet" tarafına düşer; kapının bağımlılığı statiktir ve yüklenemiyorsa uygulama açılmaz.

**7.3 Ada modüller — kayıt sözleşmesi eksik.** Sipariş kaydı kiracı, mağaza ve pazar yeri alanlarını taşımadığı için pano kırılımları, hedef sayaçları, spot takibi ve kargo seçimi uçtan uca bağlanamadı. On bir ayrı fonksiyon (kargo ayarı, şikayet eşiği, etiket üretimi, reklam metni, kapsam süzmesi…) hiçbir uca bağlı değildi. *"Bu bir hata değil, eksik bir sözleşme."* **Karşı önlem:** çekirdek kayıtların (sipariş, iade, ticket, ürün) taşıyacağı alanlar ilk tasarımda, tüketicilerle birlikte belirlenir; `0007`'deki olay çekirdeği (`sipariş oluştu`, `iade ödendi`, `kargo seçildi`) modülleri birbirine bağlar.

**7.4 Prototip kirlenmesi.** Belge içi haritalar doğrudan anahtarla indekslenince `__proto__` anahtarı `Object.prototype`'ı döndürüyordu; truthy olduğu için "yok" denetimleri geçiyordu ve `-=` ile **kalıcı küresel kirlenme** oluyordu (`Object.prototype.remaining = NaN`): süreç yeniden başlatılana kadar **tüm modüller** etkileniyor. Aynı kök sebep üç ayrı uçta 500 + yığın izi veriyordu. **Karşı önlem:** kimlik alanlarına biçim denetimi; sözlük yerine `Map` ya da prototipsiz nesne; TypeScript bunu kendiliğinden çözmez — çalışma zamanı girdisi doğrulanmalı. — G #4, #6, #13

**7.5 Değişiklik günlüğü 13 modülün 12'sinde yoktu.** Yasak kuralı silme, API anahtarı koyma/iptal, paket değiştirme, marka yetkisi verme, fiyat stratejisi, iade, destek — hiçbiri denetim kaydına düşmüyordu: kim, ne zaman, geri alma kayboluyordu. Tek günlüğe yazan modül de kullanıcıyı yanlış alandan okuduğu için aktörü `null` yazıyordu. **Karşı önlem:** denetim kaydı ortak bir katman olmalı ve yazma yolunun **içinden** geçmeli; ayrı ayrı çağrılacak bir yardımcı fonksiyon unutulur. `0009` kural 8 ve `docs/09` §5 aynı yönü gösteriyor. — M #3

**7.6 Kayıp güncelleme.** Belge tabanlı oku-değiştir-yaz deseni tüm belgeyi eziyordu. Ölçüm: iki süreç aynı veri dizininde 200'er kayıt yazdığında beklenen 600, gözlenen **400** — 200 kayıt kayboldu. İşlem kullanan tek modül aynı testte 600/600 doğru çalıştı. Altı modül etkilenmişti. Postgres'teki karşılığı §8b'de.

**7.7 Hata kodu ve uç kabuğu tekrarı.** Aynı hata sınıfı 13 serviste, aynı uç kabuğu 11 dosyada tekrarlanıyordu (≈400 satır); aynı hata farklı uçlarda farklı HTTP koduyla dönüyordu (bir yerde 429, başka yerde 409, çoğu yerde eşleme yok). Mimari üyesi 7 ortak dosya ile ~580 satır azalma önerdi. **Karşı önlem:** `docs/07` §3'teki tek API katmanı önerisi; NestJS'te ortak istisna süzgeci ve yanıt sözleşmesi.

**7.8 Sınırsız yanıt ve sınırsız belge.** Liste uçları tüm koleksiyonu döndürüyordu: 5.000 ticket × 10.000 karakter = tek istekte ~50 MB; toplu yükleme sonucu 35,9 MB tek belgede. **Karşı önlem:** her liste ucunda zorunlu sayfalama ve üst sınır; büyüyen her veri satır tablosuna yazılır, belgeye değil. `docs/08`'deki performans bulguları (sayfa başına 91–98 istek) aynı disiplinsizliğin eski sistemdeki hâli.

---

## 8. Yığına uyarlama: Mixo çözümü Postgres'te nasıl değişir

Mixo tek süreç ve SQLite'tır; WawiERP çok kiracılı, PostgreSQL ve NestJS + Prisma'dır (`0003`, `0004`). Üç konuda çözüm **aynı yere taşınmaz, yeniden kurulur.**

### (a) Kiracı yalıtımı — uygulama katmanından satır düzeyi güvenliğe

**Mixo'da ne oldu.** Kapsam süzme fonksiyonu uygulama katmanında yazıldı, testleri geçti, ama **hiçbir uç onu çağırmadı**. Sonuç canlı doğrulandı: bir kiracının editörü diğer kiracının verisini ve API anahtar özetlerini gördü (G #1). Konseyin birinci sıradaki düzeltme kalemi buydu ve düzeltme turu sonunda bile **kısmen kapalı** sayıldı, çünkü kayıtlarda kiracı alanı yoktu.

**WawiERP'de ne yapılır.** `0004` zaten kararı veriyor: **ortak şema + `tenant_id` + satır düzeyi güvenlik (RLS).** Yalıtımı veritabanı zorlar, uygulama değil. Uygulanması:

1. **Her kiracıya ait tabloda `tenant_id` sütunu zorunlu ve `NOT NULL`.** Hangi tabloların kiracıya ait olduğu şemada açıkça işaretlenir; "ortak" tablolar (ülke, para birimi, kargo firması tanımı) ayrı tutulur ve bu ayrım belgelenir.
2. **Her kiracı tablosunda RLS etkin** ve `USING (tenant_id = current_setting('app.tenant_id')::uuid)` politikası. Yazma için `WITH CHECK` de aynı koşulu taşır — aksi hâlde kullanıcı başka kiracının kimliğiyle **satır yazabilir**.
3. **Uygulama, tabloların sahibi olmayan bir rolle bağlanır.** Tablo sahibi ve `BYPASSRLS` yetkili roller RLS'i atlar; göç (migration) ayrı bir rolle çalıştırılır. `0004` bu uyarıyı zaten yazdı: *"Prisma satır düzeyi güvenliği kendiliğinden uygulamaz."*
4. **Kiracı kimliği istek başına, işlem içinde ayarlanır:** `SET LOCAL app.tenant_id = …` ve sorgular aynı işlemde çalışır. `SET LOCAL` olmadan bağlantı havuzunda değer bir sonraki isteğe sızar — bu, RLS'in en sık yapılan hatasıdır.
5. **Arka plan işleri de aynı kapıdan geçer.** `0004`: BullMQ işleri kiracı kimliğini taşır ve işçi, işi çalıştırmadan önce kiracı bağlamını kurar. Mixo'daki hata tam burada tekrar edilebilir: iş kuyruğundaki işçi kapsamı unutursa tüm kiracılar üzerinde çalışır.
6. **Platform yöneticisi için ayrı yol.** Çapraz kiracı okuma, RLS'i gevşetmekle değil, ayrı ve denetim kaydına yazan bir rol/politika ile yapılır.
7. **Kanıt zorunlu.** `0004` "ilk sprintte testle kanıtlanacak" diyor. Kanıt, birim testi değil, **her uç için** "A kiracısının oturumuyla B kiracısının kaydı istenince 404/403" diyen uçtan uca testtir. Mixo'nun dersi tam olarak budur: kapı yazılmıştı ve testi geçiyordu.

**Not.** RLS, uygulamadaki kapsam süzmesinin yerini alır ama yetkilendirmenin (rol × uç) yerini almaz. İki ayrı kapıdır; Mixo'da ikisi birden eksikti.

### (b) Kayıp güncelleme — belge yazmadan işleme ve kısıta

**Mixo'da ne oldu.** Her yazma, tüm JSON belgesini okuyup değiştirip geri yazıyordu. İki süreç 200'er kayıt yazınca 600 yerine **400** kayıt kaldı (İK #6). Tek süreçte görünmeyen bu hata, çok kopyalı dağıtımda kesin gerçekleşir.

**WawiERP'de ne yapılır.**

1. **Belge yok, satır var.** Büyüyen her veri kendi tablosunda satırdır: sipariş kalemi, iade olayı, şikayet, personel kaydı, kargo teslim sayacı, pazar fiyat satırı. "Tüm listeyi oku, değiştir, yaz" deseni şemadan kaldırılır — Mixo'nun kendisi de bu yönde taşındı ve yazma süresi 10,7 ms'den 0,22 ms'ye indi.
2. **Sayaçlar toplanarak değil, artırılarak yazılır:** `UPDATE … SET adet = adet + 1` tek ifadede. Oku-topla-yaz yapılmaz. Daha karmaşık toplamalar için `INSERT … ON CONFLICT DO UPDATE SET x = tablo.x + EXCLUDED.x`.
3. **Varsayılan yalıtım düzeyi `READ COMMITTED` yeterlidir** — ama yalnız yukarıdaki desenle. `READ COMMITTED` altında "oku, karar ver, yaz" dizisi hâlâ kayıp güncelleme üretir; bu yüzden ya tek ifadeye indirilir, ya `SELECT … FOR UPDATE` ile satır kilitlenir, ya da sürüm sütunuyla iyimser kilit kullanılır (`WHERE surum = :okunan` ve etkilenen satır 0 ise çakışma hatası).
4. **`SERIALIZABLE` yalnız gerçekten gereken yerde:** okunan birden çok satıra dayanan bir karar yazılıyorsa (stok ayırma, paket limiti denetimi, eşik üstü iade onayı). O zaman da serileştirme hatası (`40001`) beklenir ve **işlem yeniden denenir**; yeniden deneme mantığı baştan yazılır.
5. **Kuralı kısıta çevir.** En güvenli koruma kod değil şemadır:
   - İade ödemesi: `odeme(iade_id)` üzerinde **benzersiz kısıt** → çift ödeme yapısal olarak imkânsız (Mixo bunu doğru yapmıştı).
   - İade adedi: sipariş kalemi başına iade edilmiş toplam adet ≤ sipariş adedi — tetikleyici ya da kısıt + kilitli okuma.
   - Stok: `0007`'deki ayırma kuralı (satılabilir = fiziki − ayrılan, `0009` kural 6) `CHECK` ve kilitli güncellemeyle korunur.
   - Tutarlar: `numeric(14,2)` ya da tam sayı kuruş; kayan nokta kullanılmaz (Mixo'da üç farklı yöntem vardı).
6. **Çoklu kopya varsayılır.** `0004` yönetilen bulut diyor; tek süreç varsayımına dayanan hiçbir koruma (bellek içi kilit, "sadece biz yazıyoruz" varsayımı) yazılmaz.

### (c) Storno fatura numarası — tek ve kesintisiz seri

**Mixo'da ne oldu.** Numara ve sayaç aynı işlemde yazılıyordu, bu kısım doğruydu. Ama **üç tuzak** çıktı: (1) reddedilen iadede numara tüketilip boşa gidiyordu (İK #4); (2) yıl sunucu yerel saatinden alınıyordu, UTC sunucuda yıl sonu yanlış seriye yazardı (M #12); (3) `__proto__` girdisiyle uç 500 veriyordu — işlem geri aldığı için numara yanmadı, ama bu şans eseriydi.

**WawiERP'de ne yapılır.** `0009` kural 5 bağlayıcıdır: fatura numarası kesinleştirme anında verilir, **şirket başına boşluksuz sıradır**, bir daha değişmez, taslak numara tüketmez.

1. **`SEQUENCE` kullanılmaz.** Postgres dizileri işlem geri alınınca **boşluk bırakır** (`nextval` işlem dışıdır). GoBD'nin istediği kesintisiz seri için uygun değildir.
2. **Seri bir tablodur:** `(sirket_id, yil)` birincil anahtar, `son_sira` sütunu. Numara alma, faturanın yazıldığı **aynı işlemde**:
   `UPDATE fatura_serisi SET son_sira = son_sira + 1 WHERE sirket_id = … AND yil = … RETURNING son_sira`
   Bu `UPDATE` satırı kilitler; eşzamanlı ikinci işlem bekler. İşlem geri alınırsa artış da geri alınır — **boşluk oluşmaz.**
3. **Numara, faturanın kesinleştiği anda alınır**, talep anında değil. Mixo'nun 1. tuzağı budur: iade reddedilince numara boşa gitti. Taslak fatura numara tüketmez (`0009`).
4. **Yıl iş saat diliminden belirlenir.** Şirketin vergi dilimi kullanılır (`AT TIME ZONE`), sunucu yerel saati değil. Aynı ilke K-18'in gün anahtarı için de geçerlidir.
5. **Benzersizlik veritabanında:** `(sirket_id, numara)` üzerinde benzersiz kısıt. Kod hatası numarayı tekrar üretirse yazma reddedilir.
6. **Boşluk denetimi işletilebilir olmalı:** seride boşluk arayan bir rapor (`yil`, `sirket`, eksik sıra) periyodik çalışır. GoBD denetiminde istenen budur.
7. **İade faturası ayrı seri midir?** Mixo `ST-` ön ekiyle ayrı seri tuttu. Bu bir **muhasebe kararıdır** ve açık bırakılıyor (§9): satış faturası ile iade faturası tek seride mi, ayrı seride mi — ikisi de kesintisiz olmak zorunda. `docs/11` §3 soru 4 ("düzeltme = iptal + yeni belge mi") aynı boşluğa işaret ediyor.
8. **Bölünmenin kazancı.** `0011` gereği K-14'ün tamamı Wawi'de olduğu için seri **tek yerde** üretilir. Vitrin siparişinin iadesinde bile numarayı ERP verir; Mixo yalnız talebi iletir. İki sistemin ayrı numara üretmesi sorunu hiç doğmaz.

---

## 9. Açık sorular — karar bekliyor

Bunların hiçbiri uydurulmaz. Mixo kodunda bir sayı duruyorsa o **geliştirici varsayımıdır**, iş kararı değildir; WawiERP'ye karar olarak taşınmaz.

### 9.1 Kartlarda netleşmemiş sayısal değerler

| Kart | Soru | Mixo'daki durum |
|---|---|---|
| K-08 | Bronze / Silver / Gold paketlerinde şirket ve mağaza sayısı limitleri kaç? Fiyat ve süre ne? | Sayı limitleri kodda sabit (varsayım); **fiyat ve süre hiç yok** |
| K-14 | Hangi tutarın üzerindeki iade insan onayından geçsin? | Eşik kodda sabit (varsayım); ayrıca dört göz uygulanmıyordu |
| K-14 | İade tutarına kargo bedeli dâhil mi? | Tasarlanmamış; yalnız kalem fiyatları toplanıyordu |
| K-17 | UPS kuralını tetikleyen sipariş tutarı eşiği ne? Eşitlik tetikler mi? | Eşik kodda sabit (varsayım); eşitlik tetiklemiyordu |
| K-17 | UPS el teslim ek ücreti sabit mi, sözleşmeye mi bağlı? | Kodda sabit (varsayım) |
| K-18 | "Canlı" pano gerçek zamanlı mı, dakikalık yenileme mi? | Yakın-zamanlı; eskime süresi kodda sabit |
| K-21 | Kısmi iade teklifinin oranı kaç, hangi ürün gruplarında geçerli, üst sınırı var mı? | Oran kodda sabit (varsayım); ürün grubu ayrımı yok |
| K-23 | Kaç şikayetten sonra tedarikçi raporu tetiklensin? Hangi zaman penceresinde? | Eşik kodda "VARSAYIM" yorumuyla işaretli; **zaman penceresi hiç yok** |
| K-26 | B2B'de komisyon oranı ve faturanın kimin üzerine kesileceği | Ayrı proje (`0011`); oran kodda yer tutucu. Burada kayıt amaçlı |

### 9.2 Kartlarda yazmayan ama kararsız kalan noktalar

| Konu | Soru |
|---|---|
| **Saat dilimi** | Gün sınırı ve fatura yılı hangi dilimden? Şirketin ülkesine göre mi, tek kurumsal dilim mi? Mixo'da üç modül üç farklı cevap veriyordu (İK #7, İK #8, M #12) |
| **KDV** | Her şirket için hangi oran ve rejim (DE, NL, TR)? OSS kaydı var mı? `docs/11` §3 soru 2 ile aynı; hâlâ cevapsız. Mixo tek orana sabitti |
| **Fatura serisi** | İade faturası satış faturasıyla aynı seride mi, ayrı seride mi? (`docs/11` §3 soru 4) |
| **Komisyon tablosu** | Pazar yeri komisyon oranları tek kaynaktan; güncel oranlar kimden alınacak? Mixo'da iki dosya farklı sayı tutuyordu |
| **Kur** | Pazar analizi için kur kaynağı ve tarihlendirmesi ne? Mixo'da sabit kodluydu |
| **K-05 kapsamı** | Yasak kuralı ürün ya da mağaza bazında istisna taşıyacak mı? Mixo'da yalnız dört alan vardı |
| **K-06 asgari marj** | Şirket başına mı, kategori başına mı? Varsayılan değer kaç? |
| **K-15 soğuk başlangıç** | Yeterli teslimat verisi yokken kargo seçimi ne yapsın? Varsayılan skor mu, kuralın skordan bağımsız çalışması mı? (İK #10) |
| **K-25 saklama ve bildirim** | Personel ölçüm kayıtları ne kadar saklanacak? Çalışana bildirim ve işçi temsilciliği onayı nasıl belgelenecek? (BetrVG §87) |
| **K-22 bildirim kanalı** | Kritik e-posta uyarısı kime, hangi kanaldan (e-posta, SMS, panel) gidecek? |
| **Mixo ↔ Wawi entegrasyonu** | Vitrin siparişi hedef sayacını (K-19) ve kargo seçimini (K-16) Wawi'ye nasıl bildirecek? İade talebi nasıl geçecek? Olay tabanlı mı, kuyruk mu, doğrudan çağrı mı? (`0011` açık kalanlar) |
| **Mevcut API'ler** | Bugünkü Wawi ve lojistik yazılımı hangi API'leri veriyor? Görülmeden K-01 ve K-15 tahmin kalır (`docs/11` §3 soru 10 ile aynı boşluk) |

---

## 10. Görülemeyenler / Sınırlar

- Bu belge Mixo kodunu ve konsey raporlarını **okuyarak** yazıldı; WawiERP'de hiçbir kod yazılmadı ve Mixo'da hiçbir dosya değiştirilmedi (`0011`, kapsam sınırı).
- Konsey bulguları Mixo'nun 17.11.2026 tarihli durumuna aittir. Kritik ve yüksek bulgular Mixo'da aynı gün düzeltildi; tuzaklar burada **düzeltilmemiş gibi** yazıldı, çünkü WawiERP o kodu da düzeltmesini de almıyor.
- Bir yerde iki üye çelişti: tanımsız şirketle fiyat kararında iş kuralları üyesi `eşitle`, işlevsellik üyesi `beklet` gözlemledi. Fark, varsayılan strateji kaydının var olup olmamasına bağlı görünüyor. Çelişki olduğu gibi yazıldı (K-06); gerçek sistemde davranış **yazılı olarak** kararlaştırılmalı.
- Kabul kriterleri kart belgesindeki hâllerinden daha serttir: Mixo'da birçok kart kendi kriterini geçtiği hâlde sistemde çalışmıyordu (§7.1, §7.3). Kriterler bu yüzden "modül çalışıyor" değil "iş akıyor" diye yazıldı.
- Sayısal eşiklerin hiçbiri bu belgede karar olarak geçmiyor; §9 bekliyor.
