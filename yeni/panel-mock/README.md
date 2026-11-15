# WawiERP yeni panel — mock

Yeniden tasarım ilkelerini (`docs/03` §5, `docs/05` §7, `docs/11`) ekranda gösteren tıklanabilir taslak.
Arka uç yok; veri `src/data.ts` içinde üretilir.

```
npm install
npm run dev      # geliştirme
npm run build    # dist/index.html (açık ana sayfa) ve dist/panel.html (panel): ikisi de tek dosya, çift tıklamayla açılır
npm start        # server.mjs: / açık, /panel şifreli (PANEL_PASSWORD gerekir)
```

Veri: sipariş sayıları ve mağaza dağılımı `raw/siparis-dagilimi-30gun.json`'daki gerçek 30 günlük toplamlardan;
sipariş satırları, müşteriler, ürünler ve stoklar uydurma. Şirket–hesap eşlemesinin bir kısmı varsayım.
Yığın: Vite + React + TypeScript + Tailwind (`kararlar/0004`). shadcn/ui bileşenleri henüz eklenmedi; `src/ui.tsx` geçici.

## Canlı (Railway)

https://panel-production-80dcabfa.up.railway.app — proje `wawierp-panel-mock`, servis `panel`.
`/` ana sayfa herkese açık (`dist/index.html`); `/panel` şifreli (`dist/panel.html`, Basic auth: `PANEL_USER` / `PANEL_PASSWORD` Railway değişkenlerinde, depoya yazılmaz).
İki sayfa ayrı derlenir; ana sayfa paketi `src/data*.ts` içe aktarmaz, yani panel verisi açık sayfaya sızmaz. Bunu bozmayın.
Kanal logoları `src/assets/marks/` altında, canlı sitenin `channel-marks` klasöründen.
Servis GitHub deposuna bağlı (`wpu-research/wawierp`, dal `main`, kök `yeni/panel-mock`): `main`'e push yeniden yayınlar.
`/` herkese açık tanıtım sayfası; `/panel` şifreli panel (içinde `#/overview` ve diğer ekranlar). İki sayfa ayrı derlenir ki ana sayfa paketi panel verisini içermesin.
Geliştirme sunucusunda (`npm run dev`) panel `/panel.html` adresindedir.

## Asistan

Sağ alt köşedeki **W** düğmesi asistan panelini açar (`src/Agent.tsx`). İki çalışma biçimi var:

- **Yapay zekâ bağlı:** sunucuda `ANTHROPIC_API_KEY` tanımlıysa panel `/api/assistant` ucuna bağlanır (`server.mjs` + `assistant.mjs`).
  Model araç çağırır; araçlar tarayıcıda mock verinin üzerinde çalışır ve sonuç modele geri gider. Anahtar yalnız sunucuda durur.
- **Hazır senaryolar:** anahtar yoksa, `npm run dev` ile çalışırken ya da dosya çift tıklamayla açıldığında yazılanı anahtar kelimelerle eşleştirir.

İki biçimde de kurallar aynı:

- her rakam o anki kapsamdaki (şirket, depo, rol) veriden hesaplanır; yanıtın altında dayandığı ekranların düğmeleri görünür
- veri değiştiren işler (etiket, sevk, eşitlemeyi yeniden deneme, destek yanıtı, kural) önce taslak olarak gösterilir; kullanıcı onaylar
- tek seferde en fazla 25 kayda işlem önerilir
- asistan, kendisine yazan rolün yetkisinden fazlasını yapamaz; yetki onay anında yeniden denetlenir
- para iadesi, fiyat değişikliği, iptal ve toplu silme için araç yoktur
- müşteri adı ve iletişim bilgisi asistana verilmez; müşteri mesajları veri olarak okunur, talimat olarak değil
- "Kendiliğinden" düzeyinde yalnız başarısız eşitlemeyi yeniden deneme onaysız uygulanır; diğer her iş onay bekler
- her asistan işlemi denetim kaydına "asistan aracılığıyla" notuyla yazılır
- panel açıldığında asistan, sormadan fark ettiklerini bildirir; "Günü kapat" çok adımlı bir plan hazırlar

Sunucu ayarları (Railway değişkenleri):

| Değişken | Anlamı | Varsayılan |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yapay zekâ anahtarı; yoksa hazır senaryolar çalışır | yok |
| `ASSISTANT_MODEL` | Kullanılacak model | `claude-opus-5-5` |
| `ASSISTANT_PER_MINUTE` | Adres başına dakikalık istek sınırı | 20 |
| `ASSISTANT_PER_DAY` | Günlük toplam istek sınırı | 100 |
| `ASSISTANT_MAX_BODY_KB` | İstek gövdesi üst sınırı (KB) | 300 |
| `ASSISTANT_FALLBACKS` | `off` yapılırsa yedek modele geçiş kapanır | açık |

Asistan ucu panelle aynı şifrenin arkasındadır. Mock'ta rol bilgisi tarayıcıdan gelir; gerçek sistemde oturumdan okunacak ve araçlar sunucuda çalışacak.

## Yeni ekranlar

Menüde "yeni" etiketiyle görünür; hepsi mock veri üzerinde çalışır, örnek değerler "örnek" rozetiyle işaretlidir.

| Grup | Ekranlar | Dosya |
|---|---|---|
| Operasyon | Toplama listesi (mobil depo önizlemesiyle) | `src/pages/Warehouse.tsx` |
| Ürün ve stok | Veri kalitesi, Ürün metni ve çeviri, Sayım planı, Tedarik önerileri | `Quality.tsx`, `Warehouse.tsx`, `Selling.tsx` |
| Satış kanalları | Toplu listeleme, Fiyat ve kârlılık | `Selling.tsx` |
| Otomasyon | Kurallar, Uyarılar ve özet, Vardiya önerisi | `Automation.tsx`, `Warehouse.tsx` |
| Finans | Banka mutabakatı, Muhasebe aktarımı, Kârlılık | `Money.tsx` |
| Platform | Kurulum sihirbazı, API ve bildirim uçları, Kullanım ve abonelik, Durum sayfası | `Platform.tsx` |

Her yerden arama: `Ctrl K` (ekran, hazır görünüm, sipariş numarası, ürün).

## Sonradan eklenenler

| Özellik | Nerede |
|---|---|
| Geri alma: veri değiştiren her işlemden sonra 10 saniye "Geri al" (Ctrl Z) | `src/store.tsx`, alt bildirim |
| Klavye kısayolları: `?` listeyi açar; `G` + harf ekrana gider; `A` asistan | `src/App.tsx` |
| Kayıtlı görünümler: Siparişler'de süzgeci adıyla saklama (tarayıcıda) | `src/pages/Orders.tsx` |
| Stok ayırma ve fazla satış koruması | `src/pages/Reservations.tsx` |
| Toptan müşteri portalı (müşteri görünümü): fiyat listesi, yeniden sipariş, sepet | `src/pages/Portal.tsx` |
| Müşteri iade formu (müşteri görünümü) | `src/pages/Portal.tsx` |
| Mobil depo web prototipi: topla, paketle, say, kabul; çevrimdışı kuyruk | `src/pages/Mobile.tsx`, `#/mobile` |
| Yapay zekâyla ürün metni: anahtar varsa `/api/content` | `assistant.mjs`, `src/pages/Quality.tsx` |
| Asistanın yeni araçları: stok riski, tedarik önerisi, kanal performansı | `assistant.mjs`, `src/Agent.tsx` |

Mobil depo bir web prototipidir; mağazalarda yayımlanmış bir uygulama değildir.

## Bildirim merkezi

Üst çubuktaki zil (`B` kısayolu), panelin kendiliğinden söylediklerini listeler (`src/Notifications.tsx`):

- üç tür: **Yapılacaklar** (sizi bekleyen iş), **Sorunlar** (bozulan ya da takılan), **Olanlar** (bilgi)
- her bildirim tek cümle, bir açıklama, bir zaman ve ilgili ekranı açan bir düğme taşır; uygun olanlarda "Asistana hazırlat"
- aynı türden olaylar gruplanır ("X ve 2 iş daha eşitlenemedi")
- okunmamışlar noktayla işaretlidir; sayı değişirse bildirim yeniden okunmamış olur
- "Ben alıyorum", "1 saat ertele", "Yarın sabah", "Tümünü okundu say", sessiz mod
- yalnız seçili rolü ilgilendiren bildirimler görünür; metinlerde müşteri adı ve adresi geçmez
- bildirimler panel verisinden hesaplanır: sorun düzelince kendiliğinden kapanır ve "Çözülenler" altında görünür

Okundu, erteleme ve sahiplenme bilgisi bu tarayıcıda saklanır. Tarayıcı bildirimi, e-posta özeti ve mobil bildirim gerçek sistemde gelecek; mock'ta yoktur.

## Kabuk: sol menü, asistan penceresi, hareket

- **Sol menü** (`src/Sidebar.tsx`): koyu, daraltılabilir (yalnız simge), gruplar açılıp kapanır, "Sık kullanılanlar" yıldızla sabitlenir, menü içinde aranır. Kapalı grubun sorun sayısı başlığında görünür. Tercihler tarayıcıda saklanır.
- **Asistan** artık sağda tam boy panel değil, sağ altta açılan bir sohbet penceresidir; büyütülüp küçültülür, W düğmesi açıp kapatır (`A`).
- **Genel bakış** karşılama şeridi, sayan rakamlar, büyüyen grafik çubukları; ekran geçişlerinde kısa belirme. Hareketi azalt tercihi açıksa hareket yoktur.

## Ekip mesajlaşması ve geliştirme panosu

`src/Chat.tsx`:

- **Mesajlar** (`#/messages`, `G` `M`): ortak kanallar (genel, depo-istanbul, pazaryeri, muhasebe, fikir-ve-sorun) ve birebir konuşmalar. Okunmamış sayıları menüde ve listede görünür. Mesaja "katılıyorum" denebilir, ilgili ekrana bağlantı taşıyabilir, `@asistan` ile asistana soru yönlendirilir.
- Ortak kanaldaki bir mesaj tek tıkla **öneri** ya da **sorun** olarak panoya eklenir.
- **Geliştirme panosu** (`#/feedback`): ortak kanallardaki konuşmalar konu konu sayılır (kaç kişi, kaç mesaj, örnek alıntılar), her konu için panelde bir çözüm önerilir ve tek tıkla istek açılır. İstekler oylanır; sistem yöneticisi durumu değiştirir (Yeni, İnceleniyor, Planlandı, Yapıldı) ve sonuç kanala geri yazılır.
- "Asistandan haftalık özet iste" son mesajları asistana verir; asistan tekrar eden sorunları ve çözüm önerilerini çıkarır.
- **Gizlilik:** birebir mesajlar taranmaz; yalnız ortak kanallar sayılır. Mock'ta konu çıkarımı anahtar kelimeyle yapılır, kişiler rol adlarıdır, veriler tarayıcıda saklanır. Gerçek sistemde mesajlar sunucuda tutulur, anlık iletilir ve taramayı asistan yapar.

## Ürün görselleri ve yol gösteren hareket

- `src/Thumb.tsx`: ürün adı geçen bütün listelerde (sipariş, iade, katalog, stok defteri, toplama, sayım, stok ayırma, veri kalitesi, toplu listeleme, tedarik, transfer, toptan portal, mobil depo) gerçek ürün fotoğrafı. Fotoğraflar Wikimedia Commons'tan alındı, 128 piksele küçültüldü (35 adet, toplam 71 KB); kaynak ve lisanslar `GORSEL-KAYNAKLARI.md` dosyasında. Ürün adları uydurma olduğu için fotoğraf yalnız ürün türünü gösterir. Fotoğrafı bulunamayan tür kategori çizimine düşer. Görseli olmayan ürün kırmızı kesik çizgili kutuyla görünür. Siparişte birden çok kalem varsa ilk görselin köşesinde "+n" yazar.
- İadeler ekranının üstünde dört adımlı akış şeridi (etiket, depo kontrolü, para iadesi, kapanış); bir iade ilerletilince kartı yeni sütunda kısa bir vurguyla belirir.
- Hareketler yalnız `transform` ve `opacity` kullanır, kısa sürer, "hareketi azalt" tercihinde kapanır.
- Gerçek sistemde aynı kutuya küçük boyutlu (ör. 96 piksel, WebP), geç yüklenen ürün fotoğrafı gelir; liste başına yalnız görünen satırların görseli indirilir.
- **Bütün ekranlarda:** başlığın yanında ekranın simgesi; 26 ekranın başında o işin dört adımda nasıl aktığını gösteren şerit (`src/flows.tsx`, geniş ekranda görünür, ✕ ile gizlenir, "Nasıl çalışır?" ile geri gelir); tablolarda satırların sırayla belirmesi; çekmecelerin kayarak açılması; boş listelerde küçük bir çizim; çubukların büyüyerek dolması.

## Rakip teklifleri (aynı ürün, aynı platform)

Bir ürünü aynı pazaryerinde satan diğer satıcıları ve bizim sıramızı gösterir (`src/rivals.tsx`).

- **Ürün sayfasında:** Katalog'da ürün çekmecesinde "Rakipler · aynı ürün, aynı platform" bölümü. Platform başına satıcı, fiyat, kargo, toplam, teslim süresi, satıcı puanı; bizim satırlar vurgulu. Rozet sırayı söyler: "En ucuz sizsiniz" ya da "3. sıra · x pahalı".
- **Asistanda:** `get_competitor_offers` aracı; yanıtın altında aynı liste çıkar. Anahtar yokken "rakip", "kaça satıyor" kelimeleriyle hazır senaryo çalışır. Asistan fiyatı değiştiremez; "Fiyat ve kârlılık" ekranını önerir.
- **Sıralama:** müşterinin ödediği toplam tutara (fiyat + kargo) göre.
- **Eşleştirme:** barkodla (EAN). Barkodu eksik üründe ya da aktif pazaryeri ilanı olmayan üründe liste boş kalır ve nedeni yazılır.
- **Taslakta veri örnektir:** satıcı adları uydurmadır; teklifler ürün ve platforma göre hep aynı çıkacak biçimde üretilir.
- **Gerçek sistemde:** teklifler pazaryerinin kendi arayüzünden çekilir. Her platform bunu vermez ya da sınırlar; platform platform netleştirilmeli (karar bekliyor).

## Benzer ürün önerisi

Bir ürüne, stoktaki **diğer markalardan** en yakın ürünleri gösterir (`src/similar.tsx`).

- **Ürün sayfasında:** Katalog'da ürün çekmecesinde "Benzer ürünler · diğer markalar" bölümü; satıra basınca o ürün açılır. "Asistana sor" aynı soruyu asistana gönderir.
- **Asistanda:** `find_similar_products` aracı (`assistant.mjs` tanımlar, `Agent.tsx` çalıştırır). Yanıtın altında fotoğraflı liste çıkar. Anahtar yokken "benzer", "muadil", "alternatif" kelimeleriyle hazır senaryo çalışır.
- **Nasıl hesaplanır:** aynı kategori şart; ürün türü, ortak özellikler (koku ailesi, malzeme, bağlantı tipi gibi) ve fiyat yakınlığı puanlanır. Yalnız stokta olanlar listelenir.
- **Özellik yoksa:** yalnız kategori ve fiyata bakılır; liste "yalnız kategori ve fiyat" notuyla gelir.
- **Gerçek sistemde:** özellikler ürün kartından gelir; eksik olanları asistan ürün metninden önerir, kullanıcı onaylar. Müşteriye açık sitede asistan yalnız satışa açık ürünü ve satış fiyatını görür; maliyet ve alış fiyatını görmez.
- Adres: `#/catalog?p=<ürün kimliği>` ürün çekmecesini doğrudan açar.

## Yenilikler sunumu (/sunum)

Canlıda `/sunum/` adresi, yenilikler sunumunu ve tanıtım videosunu **şifresiz**, herkese açık sunar (15.11.2026 kararı). Panel (`/panel`) ve asistan ucu şifreli kalır. Sunum herkese açık olduğu için içine müşteri adı, kişisel veri ya da gizli rakam konmaz.

- Dosyalar `sunum/` klasöründedir (`index.html`, `img/`, video, kapak). Bu klasör, depodaki üst `sunum/` klasörünün **kopyasıdır**; Railway yalnız `yeni/panel-mock` klasörünü gördüğü için kopya gerekir.
- Sunumu ya da videoyu değiştirince `sunum/yayina-kopyala.sh` çalıştırılır, sonra commitlenip gönderilir.
- Sunucu yalnız açılışta listelediği dosyaları verir; video ileri geri sarılabilsin diye parça isteğini (Range) destekler.
