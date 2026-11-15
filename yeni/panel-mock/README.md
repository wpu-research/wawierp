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
| `ASSISTANT_PER_DAY` | Günlük toplam istek sınırı | 400 |
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
