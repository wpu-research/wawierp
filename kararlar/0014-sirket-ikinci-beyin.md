# 0014 — Şirket geneli ikinci beyin: markdown doğruluk, Cognee dizin, gece rüya işi

Tarih: 2026-11-18 · Durum: **Öneri — sahibinin onayı bekleniyor**
Ayrıntı: `docs/13-sirket-ikinci-beyin.md`

## Bağlam
Mixo, DigiBank ve WawiERP hafızasını ayrı ayrı ve tek makinede tutuyor: Cognee (yerel, etiketle ayrılmış), 6 ayrı graphify grafiği, üç farklı karar biçimi, 41 Claude Code hafıza klasörü (26'sı boş). Şirket e-postası, GitHub organizasyonu ve Claude Console yakında açılacak (talep listesi madde 13). Sahibi gbrain, Karpathy LLM Wiki, ai-memory, COG, agent-second-brain, open-second-brain ve Anthropic "dreaming" örneklerini referans gösterdi.

## Karar (önerilen)
1. Doğruluk kaynağı düz markdown + git. Şirket geneli bilgi yeni `seidel-beyin` deposunda; proje bilgisi kendi deposunda kalır.
2. Cognee ve graphify türetilmiş dizinlerdir; Cognee'ye yazılan her kayıt markdown'a da iner.
3. Her gerçek kaynak, güven düzeyi ve erişim düzeyi taşır; kaynaksız gerçek wiki'ye girmez.
4. Gece rüya işi (Sonnet, bütçe sınırlı): birleştirir, çelişkiyi işaretler, 3 oturumda tekrarlanan düzeltmeyi kural önerisi yapar. Silmez, `main`'e yazmaz, CLAUDE.md'yi değiştirmez; insan onaylar.
5. Şifre, anahtar ve müşteri kişisel verisi hiçbir katmana girmez; girişte ve gece taranır. DigiBank varsayılan `gizli`.
6. Önce hesapsız, yerel MVP (1 hafta); GitHub organizasyonu ve sunucu açıldıkça paylaşıma geçilir.

## Neden
- İncelenen projelerin tamamı hafızayı markdown + git'te tutuyor; veritabanı yalnız arama için. Cognee kaybolsa da bilgi kaybolmamalı.
- Ajanların aynı anda yazması çakışma doğurur; gelen kutusu + tek birleştirici + insan onayı bunu önler.
- Tekrarlanan düzeltmeleri elle kurala çevirmek unutuluyor; gece işi bunu otomatik önerir.
- Almanya'daki GmbH için DSGVO: veri AB içinde, kişisel veri hafızada yok.

## Reddedilenler
- **Cognee'yi tek doğruluk kaynağı yapmak** — tek makine, yedeksiz, insan okuyamaz.
- **gbrain'e hemen geçmek** — tek kullanıcı tasarımı, Postgres kurulumu gerektirir; Cognee zaten çalışıyor. Aşama 4'te yeniden değerlendirilir.
- **Rüya işinin kuralları kendisinin uygulaması** — yanlış genelleme tüm ajanları bozar; insan onayı şart.
- **Managed Agents "dreams"e şimdi geçmek** — Claude Console hesabı yok, araştırma önizlemesi.
- **Her proje için ayrı ikinci beyin** — bugünkü dağınıklığın kendisi.

## Açık kalanlar
- Depo adı ve sahibi; DigiBank'ın kapsamı; ekip büyüklüğü; makine kapalıyken gece işinin çalışmaması kabul edilebilir mi.
