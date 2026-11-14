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
Şifreli (Basic auth): kullanıcı `PANEL_USER`, şifre `PANEL_PASSWORD` Railway değişkenlerinde. Şifre depoya yazılmaz.
Servis GitHub deposuna bağlı (`wpu-research/wawierp`, dal `main`, kök `yeni/panel-mock`): `main`'e push yeniden yayınlar.
`/` herkese açık tanıtım sayfası; `/panel` şifreli panel (içinde `#/overview` ve diğer ekranlar). İki sayfa ayrı derlenir ki ana sayfa paketi panel verisini içermesin.
Geliştirme sunucusunda (`npm run dev`) panel `/panel.html` adresindedir.

## Asistan paneli (mock)

Üst çubuktaki **Asistan** düğmesi sağda bir sohbet paneli açar (`src/Agent.tsx`). Gerçek bir yapay zekâ bağlı **değildir**:
yazılanı anahtar kelimelerle eşleştirir ve yanıtı mock veriden hesaplar. Amaç hedef davranışı göstermektir:

- her rakam o anki kapsamdaki (şirket, depo, rol) veriden hesaplanır ve dayandığı ekranın bağlantısıyla gelir
- veri değiştiren işler (etiket, sevk, eşitlemeyi yeniden deneme, destek yanıtı, kural) önce taslak olarak gösterilir; kullanıcı onaylar
- tek seferde en fazla 25 kayda işlem önerilir
- asistan, kendisine yazan rolün yetkisinden fazlasını yapamaz; yetki onay anında yeniden denetlenir
- para iadesi, fiyat değişikliği, iptal ve toplu silme asistana kapalıdır
- müşteri adı ve iletişim bilgisi asistana gösterilmez
- "Kendiliğinden" düzeyi kilitlidir (pilottan sonra)

Denenebilecek örnekler panelin içinde listelidir. Henüz karar değil; öneri (`kararlar/` altında kaydı yok).
