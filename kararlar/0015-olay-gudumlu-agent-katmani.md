# 0015 — Şirket geneli olay güdümlü agent katmanı (“AGI katmanı”)

Tarih: 2026-11-18 · Durum: **Öneri — açık sorular büyük ölçüde kapandı, son onay bekleniyor**
İlgili: `0006` asistan katmanı · `0007` olay–kural–onay çekirdeği · `0014` şirket ikinci beyni (`docs/13-sirket-ikinci-beyin.md`)
Kaynak: sahibinin paylaştığı “Build an Always-On Agent That Wakes on Events, Not Chat” rehberi (watchdog + kuyruk + LangGraph `interrupt()` + SQLite checkpoint + ntfy); “DOCKS - AGI altında tartışalım” oturumu.

## Bağlam
Şirket (Lady Empire GmbH / Seidel Trading) birkaç ürün işletiyor: **WaviERP**, **Mixo**, **DigiBank**, ayrıca şirket posta kutusu, zaman yönetimi (NÖBET) ve şirket ikinci beyni. Bu işlerin hepsi bugün sohbetle yürüyor: biri oturum açar, Claude çalışır. Kendiliğinden uyanan bir agent yok.
`0007` WaviERP içinde zaten **Olay → Kural → Onay düzeyi** çekirdeğine karar verdi. `0014` ise şirketin hafızasını (ne biliyoruz, neden) tasarlıyor. Eksik olan parça, şirketin **sinir sistemi**: bir şey olunca uyanmak, kurala bakmak, ya kendi başına yapmak ya da insana sormak.
Sahibinin sorusu: “Bunu ve benzer bir sistemi tüm şirketi yönetmek için kullanabilir miyiz?”

## Karar (önerilen)
1. **Tek desen, tüm dock'lar.** `0007`'deki çekirdek WaviERP'ye kapalı kalmaz, şirket geneline genişler: olay kaynağı → kalıcı kuyruk → dock agent'ı → kural katmanı → (kendin yap | dur, sor) → denetim kaydı.
2. **LLM yalnız okur.** Ayrıştırır, sınıflar, taslak çıkarır. “Kendin yap / sor” kararını düz kodla yazılmış ve onaylanmış kural verir; LLM'in görüşü bu kararı değiştiremez.
3. **Onay düzeyleri `0006` ve `0007` ile aynı:** yalnız öner · önce sor · kendiliğinden. Her yeni kural “yalnız öner” düzeyinde başlar.
4. **Değişmez sınırlar.** Para hareketi, fiyat değişikliği, müşteriye gönderilen mesaj, silme ve iptal işleri “kendiliğinden” düzeyine **hiç** alınamaz. DigiBank'ta agent yalnız izler ve alarm verir.
5. **Kalıcı ve tekrar güvenli.** Kuyruk ve duraklatılmış işler diskte (Postgres) durur; süreç çökse de kaybolmaz. Her olay tekil bir kimlik taşır ve aynı olay ikinci kez işlenmez.
6. **Tek onay kuyruğu.** Bütün dock'lardan duran işler tek yerde toplanır. Her işte ne olduğu, gerekçe, önerilen işlem ve onay/red düğmesi bulunur. Bildirim telefona gider; kuyruk isakisi'nde ve /tv'de görünür.
7. **Hafızayla döngü (`0014`).** Her karar ve onay denetim kaydına yazılır. Gece çalışan rüya işi bu kaydı okur ve aynı biçimde 3 kez onaylanan işler için kural önerisi çıkarır. Öneriyi insan onaylamadan agent'ın yetkisi genişlemez.
8. **Kurallar `seidel-beyin/kurallar/` altında** markdown ve git'te durur, her değişiklik izlenir. Ortak depo açılana kadar bu klasör geçici olarak WaviERP deposunda tutulur.
9. **Agent'lar alanlara bölünür, tek dev agent kurulmaz:** posta, WaviERP satın alma/fatura, depo, sipariş, Mixo fiyat, DigiBank izleme, NÖBET özeti. Sistemlere doğrudan SQL ile değil, yetkisi sınırlı API ile erişirler.

## Sıra (pilot önerisi)
1. **Posta sınıflama.** Her dock'a dokunan tek kaynak bu. Gelen mail sınıflanır (tedarikçi faturası, Mixo, banka, müşteri, spam) ve ilgili kuyruğa düşer. Bu aşamada hiçbir mail gönderilmez.
2. **WaviERP:** tedarikçi faturası sipariş ve mal kabulle eşleştirilir; limit üstü ya da uyuşmayan fatura onaya gider.
3. **WaviERP depo:** transfer kabul farkları ve eksi stok için uyarı ve düzeltme önerisi.
4. **Mixo:** rakip fiyat değişince fiyat önerisi çıkar; uygulamadan önce sahibi onaylar.
5. **NÖBET:** her sabah şirket özeti (dün ne oldu, ne onay bekliyor).
6. **DigiBank:** yalnız izleme ve alarm, en son ele alınır.

## Teknik yön (öneri)
- `0003`/`0004` yığınına uyum için gerçek sistem TypeScript + PostgreSQL üzerinde kurulur. Kuyruk `0007`'deki gibi BullMQ ya da Postgres kuyruğu olur; duraklatılmış iş durumu Postgres'te tutulur.
- Rehberdeki Python + LangGraph + SQLite yığını yalnız **prototip** içindir; posta pilotunu bir haftada denemek için kullanılabilir.
- LLM çağrısı AB içinde işlenir; agent'a giden metinlerden müşteri kişisel verisi mümkün olduğunca çıkarılır (`0014` madde 5).

## Neden
- `0007` deseni zaten doğru; şirket genelinde ayrı ayrı otomasyonlar yazmak aynı dağınıklığı (`0014` bağlamı) bu kez iş akışında üretir.
- “LLM okur, kural karar verir” ayrımı, yanlış yorumlanan bir belgenin para ya da stok hatasına dönüşmesini önler.
- Rehberdeki bellek içi kuyruk süreç çökünce olayları kaybediyor; sipariş ve stok için bu kabul edilemez.
- Onay kaydı, agent'ın yetkisini ölçülü biçimde genişletmenin tek dürüst yolu: önce kanıt, sonra yetki.

## Reddedilenler
- **Tek, her şeyi yapan şirket agent'ı.** Yetkisi sınırlanamaz, hatası izlenemez.
- **Kararı LLM'e bırakmak** (“otomatik mi, sor mu?” sorusunu modele sormak). Garip yazılmış bir belge onu ikna edebilir.
- **Rehberdeki bellek içi kuyruğu üretimde kullanmak.** Olay kaybı.
- **Agent'ın kuralları kendisinin genişletmesi.** Rüya işi yalnız öneri yapar (`0014` ile aynı ilke).
- **DigiBank'ta otomatik işlem.** Bankacılık mevzuatı ve geri dönüşsüz para hareketi.

## Sahibinin kararları (2026-11-18)
- **Ortak depo:** `seidel-beyin` şimdi açılır (önce yerelde, GitHub organizasyonu açılınca oraya gönderilir). Kurallar `seidel-beyin/kurallar/` altında durur.
- **Onay kanalı:** ikisi birden. Telefona ntfy bildirimi gider; kuyruğun tamamı isakisi'nde ve /tv'de görünür.
- **Makine:** agent baştan Coolify sunucusunda çalışır (makine kapalıyken de çalışsın diye).
- **Mail şifresi:** dosyaya ya da depoya yazılmaz, gizli bir değer olarak saklanır. Agent sunucuda çalışacağı için bu yer Coolify'ın gizli ortam değişkeni olur; yerel denemelerde sistem anahtarlığı kullanılır.

## Açık kalanlar
- LLM sağlayıcısı ve AB içi işleme bölgesi (öneri: `0006` ile uyumlu olarak Claude; veri işleme sözleşmesi gerekiyor).
- Coolify sunucusunun AB'de olduğunun doğrulanması.
