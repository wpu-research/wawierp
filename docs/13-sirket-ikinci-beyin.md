# Şirket Geneli İkinci Beyin ve Hafıza Sistemi — Öneri

Tarih: 2026-11-18 · Durum: **öneri, onay bekliyor** · Kapsam: Lady Empire GmbH / Seidel Trading — Mixo (Mixoutlet), DigiBank, WawiERP
İlgili: `docs/02-hafiza-beyin-mimarisi.md` (WawiERP'nin bugünkü üç katmanı), karar `kararlar/0014-sirket-ikinci-beyin.md`

> Not: Belge şirket genelini anlatır ama şimdilik WawiERP deposunda duruyor; şirket GitHub organizasyonu açılınca ortak depoya taşınacak (bkz. §9, Aşama 1).

## 1. Özet

Bugün her proje kendi hafızasını ayrı ayrı tutuyor ve hepsi tek makinede. Öneri:

1. **Doğruluk düz markdown + git'te kalır.** Cognee ve graphify bunun üstünde türetilmiş dizinlerdir; silinse yeniden kurulur.
2. **Tek şirket deposu (`seidel-beyin`)** projeler arası bilgiyi tutar: kararlar, kurallar, sözlük, kişiler-roller, projelerin özeti. Proje depoları kendi `kararlar/` ve `docs/` klasörlerini korur.
3. **Her gerçek kaynağını taşır** (dosya:satır, commit, oturum kimliği, kişi, tarih, güven düzeyi).
4. **Gece "rüya" işi** gün içindeki oturumları ve gelen kutusunu okur, tekrarları birleştirir, çelişkileri işaretler, tekrarlanan düzeltmeleri **kural önerisine** çevirir. Kuralı insan onaylar; iş hiçbir şeyi kendi başına silmez.
5. **Şifre, anahtar ve müşteri kişisel verisi hiçbir katmana girmez**; girişte ve gece iki kez taranır.
6. **MVP hesap açmadan, bu makinede, bir haftada** kurulabilir (§10).

## 2. Bugünkü durum (2026-11-18 taraması)

| Bileşen | Durum | Sorun |
|---|---|---|
| Cognee | Yerel (`~/.cognee`), varsayılan veri kümesi, `[wavierp]` gibi etiketlerle; her mesajda otomatik hatırlama | Tek makine, tek kişi. Proje ayrımı yalnız etiketle. Yedeği yok, yalnız `kararlar/` düz metni geri getirebilir |
| graphify | 6 projede `graphify-out/` var (WaviERP, Mixo, DigiBank, DomAin, ArchAI, macademia-bilgi). WaviERP: 2017 düğüm, 5360 kenar | Her grafik kendi adası; projeler arası bağ yok |
| Karar kayıtları | WaviERP `kararlar/0001–0013` (ADR biçimi); DigiBank tek dosya `KARARLAR.md`; Mixo `docs/` içinde dağınık | Üç farklı biçim |
| Devir notları | 15 projede `_vault/continue-*.md` | İyi işliyor ama projeye kapalı |
| Claude Code dosya hafızası | `~/.claude/projects/*/memory`: 41 klasör, **26'sı boş**, en doludan 17 dosya (Kai-Velox) | Oturum yolu değişince hafıza kopuyor (ör. Windows yolu `C--Users-…`); Cognee'yle çakışıyor |
| Genel kurallar | `~/.claude/CLAUDE.md` + TOKEN-DISCIPLINE, MODEL-ROUTING, DELEGATION | Elle yazılıyor; tekrarlanan düzeltmeler kurala kendiliğinden dönmüyor |
| Kota koruması | `~/.claude/quota/session-guard.py`, `near-limit.py` | Hazır; rüya işi bunun bütçesine uymalı |

Sonuç: **Malzeme var, birleştirici yok.** Eksik olan üç şey: ortak yer, kaynak bilgisi standardı, düzenli toparlama.

## 3. Referanslar ve bizim alacağımız

Yıldız sayıları kullanıcının paylaştığı görselden; web kaynakları birbiriyle çelişiyor, doğrulanmadı. Depolar doğrudan açılmadı, ikincil kaynaklardan özetlendi.

| Referans | Ne yapıyor | Alacağımız | Almayacağımız |
|---|---|---|---|
| **gbrain** (Garry Tan) | Git'te markdown + Postgres/pgvector karma arama; CLI, MCP, HTTP; her gerçek kaynağını tutar; tüm ajanlar tek beyni paylaşır | Kaynak (provenance) alanı zorunlu; markdown doğruluk, veritabanı dizin; MCP ile her araçtan erişim | Tek kullanıcı tasarımı (incelemeler çok kişili yalıtımın hedef olmadığını söylüyor); Postgres'i şimdilik kurmuyoruz, Cognee var |
| **Karpathy LLM Wiki** (gist) | `raw/` değişmez kaynaklar + LLM'in yazdığı `wiki/` + `index.md`. İnsan kaynak seçer ve soru sorar; LLM etiketler, bağlar, birleştirir | Depo düzeni: `raw/` (dokunulmaz) ve `wiki/` (ajan yazar). Her soru yeniden türetmek yerine wiki'ye birikir | — |
| **ai-memory** (akitaonrails) | Git tabanlı düz markdown wiki, Rust ile MCP/HTTP sunucusu; Claude Code'dan Codex'e oturum ortasında geçiş | Araçtan bağımsızlık: hafıza dosya olduğu için Claude Code, Codex, Cursor aynı yeri okur | Ayrı ikili kurmak (MVP'de gerek yok; sonra değerlendirilir) |
| **COG second brain** (huytieu) | Veritabanı yok, yalnız markdown + git; `SKILL.md` biçiminde becerilerle (braindump, url-dump, knowledge-consolidation …) | Rüya, yakalama ve toparlama işlerini **beceri** (skill) olarak yazmak; her ajan aynı beceriyi kullanır | Kişisel üretkenlik becerilerinin hepsi |
| **agent-second-brain** (smixs) | Telegram ses notu → Deepgram yazıya döker → Claude Code işler → Obsidian notu veya Todoist görevi; ~25 $/ay | Aşama 3'te yakalama kanalı: sesli not → `gelen-kutusu/` | Todoist (şirket iş akışı aracı zaten var: `tools/isakisi`) |
| **open-second-brain** (itechmeat) | Obsidian kasasını ajan hafızasına çevirir; gece "rüya" geçişi tekrarlanan düzeltmeleri kurala dönüştürür (aynı konuda 3 işaret → onaylı tercih) | **Üç işaret kuralı** ve gece kural çıkarımı | Hermes Agent bağımlılığı |
| **claude second brain** (jessepinkman99) | Tek npx komutuyla Obsidian + Claude Code + yerel arama | Obsidian'ı yalnız **görüntüleyici** olarak kullanmak (ücretsiz, grafik görünümü) | npx ile dış betik çalıştırmak (güvenilirliği incelenmeden kurulmaz) |
| **Anthropic "dreaming"** (Managed Agents, araştırma önizlemesi) | Var olan hafıza deposu + 1–100 geçmiş oturum kaydı alır; denetler, tekrarları ayıklar, yeniden düzenler; asıl hafızaya dokunmadan yeni düzenli hafıza üretir. Anthropic'in yazısında wiki puanının %13'ten %48'e çıktığı aktarılıyor | Rüya işinin sözleşmesi: **girdi = hafıza + oturum kayıtları, çıktı = yeni sürüm, eski bozulmaz**. Pokémon örneğindeki gibi (413 dosya → 10 dosya) dağınık hafızayı az sayıda düzenli sayfaya indirmek | Managed Agents'a şimdi geçmek (Claude Console hesabı yok; Aşama 4'te denenir) |

Ortak ders: **Bu projelerin hiçbiri hafızayı veritabanında saklamıyor; hepsi markdown + git'te saklıyor ve aramayı üstüne kuruyor.** Bizim Cognee'yi doğruluk kaynağı yapmamamız gerekçesi bu.

## 4. Hedef mimari

```
                 YAKALAMA                         TOPLAMA (gece)                 KULLANIM
  oturum sonu notu ─┐                                                     ┌─ Claude Code / Codex / Cursor
  karar kaydı ──────┤                                                     │   (MCP + dosya okuma)
  sesli not (A3) ───┼──► gelen-kutusu/ ──► RÜYA İŞİ ──► wiki/ (PR) ───────┤
  toplantı notu ────┤        ▲              │  ├─► kurallar/oneriler.md   ├─ panel asistanları (W)
  oturum kayıtları ─┘        │              │  └─► rapor/YYYY-AA-GG.md    └─ insanlar (Obsidian, GitHub)
                             │              ▼
                       sır/KVK tarayıcı   Cognee (cognify)  +  graphify (birleşik grafik)
                                          = türetilmiş dizinler
```

### 4.1 Üç katman, şirket ölçeğinde

| Katman | Nerede | Ne | Kim yazar |
|---|---|---|---|
| **Kaynak** | Proje depoları (`docs/`, `kararlar/`, kod) + şirket deposu `seidel-beyin` | Tek doğruluk. Düz markdown, git geçmişi = denetim izi | İnsan; ajan yalnız `gelen-kutusu/` ve PR ile |
| **Beyin** | graphify: proje başına `graphify-out/` + şirket deposunda birleşik grafik | "Ne neye bağlı?" Projeler arası bağlar (ör. Mixo fiyat karşılaştırma ↔ WawiERP katalog) | Türetilir, elle yazılmaz |
| **Hafıza** | Cognee | "Neden? Ne zaman? Kim söyledi?" anlamsal arama ve otomatik hatırlama | Rüya işi `wiki/` ve `kararlar/`'dan besler; oturumda `cognee-remember` |

Değişen tek şey: **Cognee artık birincil yazma yeri değil, okuma dizini.** Oturumda Cognee'ye yazılan her kayıt, aynı gece rüya işiyle markdown'a da iner (ya da tersi). Böylece Cognee kaybolsa da hiçbir şey kaybolmaz.

### 4.2 Şirket deposu düzeni (`seidel-beyin`)

```
seidel-beyin/
├── index.md                 giriş: projeler, sözlük, son kararlar (rüya işi günceller)
├── raw/                     değişmez girdiler: toplantı notu, ses dökümü, dış belge (Karpathy)
├── gelen-kutusu/            ajanların ve insanların ham notları; rüya işi buradan alır
├── wiki/
│   ├── sirket/              şirket, ürün hatları, hedef pazar, roller (kişisel veri yok)
│   ├── projeler/mixo.md, digibank.md, wawierp.md   proje özeti + depoya bağlantı
│   ├── sozluk.md            ortak terimler (Sanal stok, Drop, SKU …; bkz. WawiERP docs/04)
│   └── dersler/             tuzaklar ("wawib2b origin'e hızlı istek → 525")
├── kararlar/                şirket geneli ADR'ler (proje kararları kendi deposunda kalır)
├── kurallar/
│   ├── genel.md             tüm ajanlar için kurallar (CLAUDE.md'ye @ ile bağlanır)
│   └── oneriler.md          rüya işinin önerdiği, onay bekleyen kurallar
├── beceriler/               SKILL.md: yakala, ruya, kaynak-denetle, kvk-tara
└── rapor/                   gece raporları
```

Proje depoları değişmez; yalnız `CLAUDE.md`'lerine tek satır eklenir: `@~/…/seidel-beyin/kurallar/genel.md`.

### 4.3 Kaynak (provenance) standardı

Her wiki sayfası ve her Cognee kaydı şu bilgiyi taşır (gbrain ilkesi, WawiERP biçiminin genişletilmişi):

```yaml
---
id: wawierp-stok-yoldaki-mal
tur: gercek | karar | reddedildi | acik-soru | ders | kural
proje: wawierp | mixo | digibank | sirket
erisim: genel | proje | gizli
kaynak:
  - dosya: WaviERP/kararlar/0010-konsey-sorulari-vekil-kararlar.md
    commit: e1329ed
  - oturum: 8d609ce2            # Claude Code oturum kimliği
  - kisi: rol:ar-ge             # ad değil rol
guven: EXTRACTED | INFERRED | AMBIGUOUS
tarih: 2026-11-17
gecerlilik: guncel | yerini-aldi:<id>
---
```

Kurallar:
- `kaynak` boş bir gerçek wiki'ye girmez; `gelen-kutusu/`'nda bekler.
- `INFERRED` / `AMBIGUOUS` gerçeklere dayanarak karar verilmez (graphify kuralının aynısı).
- Bir gerçek değişince eskisi silinmez; `gecerlilik: yerini-aldi:<yeni-id>` olur. "Neden değişti?" sorusunun cevabı böylece kalır.
- Cognee kaydı biçimi: `[proje][tür][tarih] cümle. Neden: … Kaynak: dosya§ / commit / oturum`.

### 4.4 İnsanlar ve ajanlar arası paylaşım

| Kim | Okur | Yazar |
|---|---|---|
| Her ajan (Claude Code, Codex, panel asistanı) | `wiki/`, `kurallar/`, Cognee (MCP) | Yalnız `gelen-kutusu/` + `cognee-remember` |
| Rüya işi | Hepsi + oturum kayıtları | `wiki/`, `index.md`, `rapor/`, `kurallar/oneriler.md` — **ayrı dalda, PR olarak** |
| İnsan (Ar-Ge, yönetim) | Hepsi (Obsidian ya da GitHub) | Her yere; PR'ı onaylar, kural önerisini kabul/ret eder |

Aynı anda yazma çakışması böyle önlenir: ajanlar yalnız yeni dosya ekler (gelen kutusu), birleştirmeyi tek bir iş yapar, son sözü insan söyler.

## 5. Gece rüya işi

**Ne zaman:** her gece 03:00 (makine açıksa; Aşama 2'den sonra sunucuda). **Model:** Sonnet (MODEL-ROUTING'e göre toparlama ve rapor işi). **Bütçe:** gece başına üst sınır 300 bin giriş tokenı; aşarsa en eski girdileri ertesi geceye bırakır.

**Girdi:** son 24 saatin oturum kayıtları (`~/.claude/projects/*/*.jsonl`), `gelen-kutusu/`, `~/.claude/projects/*/memory`, projelerin yeni `kararlar/` dosyaları, mevcut `wiki/`.

**Adımlar:**
1. **Tara** — sır ve kişisel veri tarayıcısı (§6). Bulursa o parçayı atlar, raporda yerini (dosya:satır) yazar, içeriği yazmaz.
2. **Çıkar** — yeni gerçek, karar, ders, açık soru adayları; her birine kaynak ekler.
3. **Birleştir** — aynı şeyi söyleyen sayfaları tek sayfada toplar (dreaming / Pokémon örneği). Hedef: sayfa sayısı artmasın, sayfalar dolsun.
4. **Çeliştir** — yeni gerçek eskisiyle çelişiyorsa ikisini de tutar, `acik-soru` açar.
5. **Kural çıkar** — aynı düzeltme (ör. "belge Türkçe olsun", "Opus kullanma", "siteye seri istek atma") **3 farklı oturumda** görüldüyse `kurallar/oneriler.md`'ye öneri yazar (open-second-brain'in üç işaret kuralı). **Kendisi CLAUDE.md'ye yazmaz.**
6. **Dizinle** — `index.md`'yi günceller; Cognee'ye yeni/değişen sayfaları verir (`cognify`); değişen depolarda `graphify --update`.
7. **Raporla** — `rapor/YYYY-AA-GG.md`: kaç girdi, ne birleşti, hangi kural önerildi, hangi çelişki açıldı, kaç token harcandı.
8. **Teslim** — her şey `ruya/YYYY-AA-GG` dalında; MVP'de yerel dal, Aşama 1'den sonra PR.

**Asla:** dosya silmez, `main`'e yazmaz, push etmez (Aşama 1'e kadar), CLAUDE.md değiştirmez, canlı siteye istek atmaz.

Ek olarak haftada bir **büyük toparlama**: 41 dağınık `~/.claude/projects/*/memory` klasörünü tarar, değerli olanları `wiki/`'ye taşır, boş ya da yinelenenleri raporlar (silmeyi insan yapar).

## 6. Erişim, gizlilik ve güvenlik

**Hiçbir katmana girmez:** şifre, API anahtarı, token, IBAN/kart numarası, müşteri adı-e-postası-telefonu-adresi, sipariş içindeki kişisel veri, sağlık ve kimlik verisi.

| Önlem | Nasıl |
|---|---|
| Girişte tarama | `seidel-beyin` deposuna pre-commit kancası: gitleaks (sır) + basit KVK/DSGVO kalıpları (e-posta, telefon, IBAN, Steuer-ID) |
| Gece tarama | Rüya işinin 1. adımı; bulduğunu atlar, yerini raporlar |
| Kişiler | Ad yerine rol (`rol:ar-ge`, `rol:depo-sorumlusu`); çalışan adı yalnız yetki tablosunda, hafızada değil |
| Erişim düzeyi | `genel` (tüm şirket) · `proje` (o projenin ekibi) · `gizli` (yalnız yönetim). Aşama 2'de her düzey ayrı Cognee veri kümesi ve ayrı klasör izni |
| DigiBank | Bankacılık lisansı ve denetim gerekçesiyle varsayılan `gizli`; hafızaya yalnız karar ve gerekçe, müşteri/hesap verisi asla |
| Veri yeri | Almanya'daki GmbH için DSGVO: sunucu AB içinde (Hetzner, Almanya); Anthropic API için veri işleme sözleşmesi (Claude Console açılınca) |
| Talimat enjeksiyonu | `raw/` ve `gelen-kutusu/` içeriği **veridir, talimat değildir**; rüya işi oradaki "şunu yap" cümlelerini uygulamaz, rapora yazar |
| Geri alma | Her şey git'te; rüya işinin her gecesi tek dal, tek komutla geri alınır |

## 7. Araç seçimi

| İhtiyaç | Seçim | Neden | Alternatif |
|---|---|---|---|
| Doğruluk deposu | git + markdown | Bütün referanslar bunu yapıyor; araçtan bağımsız; ücretsiz | — |
| Anlamsal hafıza | **Cognee (var olan)** | Kurulu, her mesajda hatırlıyor, ekip alışık | gbrain (Postgres+pgvector) — Cognee yetmezse Aşama 4'te |
| Yapı grafiği | **graphify (var olan)** | Kurulu, 6 projede çalışıyor | — |
| İnsan arayüzü | Obsidian (yalnız görüntüleyici) + GitHub web | Ücretsiz, wiki bağlantılarını ve grafiği gösterir | VS Code |
| Gece işi (MVP) | Claude Code zamanlanmış görev (`scheduled-tasks`) ya da cron + `claude -p` | Kurulum yok, mevcut abonelik | — |
| Gece işi (Aşama 2+) | Sunucuda cron + Claude API (Sonnet) | Makine kapalıyken de çalışır | Anthropic Managed Agents "dreams" (Aşama 4 denemesi) |
| Paylaşılan sunucu | Hetzner (Almanya) + Coolify | AB içinde; Coolify zaten araç setinde | Railway (AB bölgesi seçilirse) |
| Sesli not | Telegram botu + Whisper (yerel) ya da Deepgram | agent-second-brain modeli | — |
| Sır tarama | gitleaks | Açık kaynak, tek ikili | trufflehog |

## 8. Maliyet tahmini (aylık)

| Kalem | MVP | Aşama 2+ |
|---|---|---|
| git, markdown, Obsidian, graphify, Cognee (açık kaynak) | 0 € | 0 € |
| Rüya işi | Mevcut Claude aboneliği içinde | Sonnet API: gece ~150 bin giriş + ~15 bin çıkış ≈ 0,45 $/gece → **~14 $/ay**; önbellekleme ile daha az |
| Cognee'nin kendi LLM/embedding çağrıları | Bugünkü gibi | ~5–10 $/ay (yalnız değişen sayfalar işlenir) |
| Sunucu (Hetzner CX22/CX32) | — | ~5–10 €/ay |
| GitHub organizasyonu | — | Ücretsiz plan yeter; Team gerekirse kişi başı ~4 $/ay |
| Sesli not (Deepgram) | — | Ücretsiz katman; ya da yerel Whisper 0 € |
| **Toplam** | **~0 €** | **~25–40 €/ay** |

Fiyatlar 2026-11 itibarıyla tahmindir; Sonnet 2 $/10 $ (1M giriş/çıkış) üzerinden hesaplandı.

## 9. Aşamalı yol haritası

| Aşama | Ne zaman | İş | Bitti sayılır |
|---|---|---|---|
| **0 — MVP** | Hemen, 1 hafta, hesap gerekmez | §10 | 7 gece rapor üretildi; en az 1 kural önerisi onaylandı/reddedildi |
| **1 — Ortak depo** | Şirket GitHub organizasyonu açılınca (talep listesi madde 13) | `seidel-beyin`'i organizasyona taşı; dal koruması; rüya işi PR açar; ekip üyeleri okur | İlk PR insan onayıyla birleşti |
| **2 — Paylaşılan hafıza** | Claude Console + sunucu açılınca | Cognee'yi Hetzner'de Coolify ile çalıştır; erişim düzeyi başına veri kümesi; rüya işi sunucuya taşınır; Cognee MCP'si ekip makinelerine | İki farklı kişinin ajanı aynı kararı hatırlıyor |
| **3 — Yakalama** | Aşama 2 + 2 hafta | Telegram sesli not → `gelen-kutusu/`; toplantı notu şablonu; panel asistanlarının (WawiERP W, DigiBank ops) `gelen-kutusu/`'na yazması | Haftada ≥10 girdi kanaldan geliyor |
| **4 — Değerlendirme** | 1 ay kullanım sonrası | Managed Agents "dreams" ile kendi rüya işini karşılaştır; Cognee yetmiyorsa gbrain/ai-memory dene; ölçü: aynı 20 soruya doğru cevap oranı | Karar kaydı yazıldı |

## 10. MVP önerisi (Aşama 0)

Hesap açmadan, yeni yazılım kurmadan, bu makinede:

1. `~/Desktop/Urunler/seidel-beyin/` klasörü + `git init`; §4.2 düzeni; `index.md`, `wiki/projeler/{mixo,digibank,wawierp}.md` mevcut belgelerden özetlenir.
2. Mevcut `kararlar/`, `KARARLAR.md`, `_vault/continue-*` ve dolu `memory/` klasörlerinden **tek seferlik içe alma** (Sonnet alt ajanı) → `gelen-kutusu/` → ilk rüya geçişi.
3. `beceriler/ruya/SKILL.md`: §5'teki 8 adım; `beceriler/yakala/SKILL.md`: oturum sonunda `gelen-kutusu/`'na kaynaklı not bırakma.
4. Zamanlanmış görev: her gece 03:00 rüya becerisi, Sonnet, bütçe sınırlı.
5. Proje `CLAUDE.md`'lerine tek satır: şirket kurallarına bağlantı + oturum sonunda `yakala`.
6. Bir hafta sonra ölçüm: rapor sayısı, birleşen sayfa, kural önerileri, harcanan token; Aşama 1 kararı.

**MVP'de yapılmayacak:** sunucu, yeni hesap, push, Cognee'nin taşınması, sesli not, gitleaks dışında yeni araç (gitleaks da kurulmadan önce sorulur).

**Kullanıcıdan onay gereken noktalar:**
- `seidel-beyin` klasörünün açılması ve adı.
- Zamanlanmış gece görevinin kurulması.
- Proje `CLAUDE.md`'lerine satır eklenmesi.
- gitleaks kurulumu.

## 11. Açık sorular
- Şirket deposunun adı ve sahibi (Ar-Ge mi, yönetim mi?).
- DigiBank hafızasının bu sisteme hiç girip girmeyeceği (yalnız karar başlıkları mı?).
- Ekipte kaç kişi okuyacak/yazacak? (GitHub planı ve Cognee erişim düzeni buna bağlı.)
- Gece işi makine kapalıyken çalışmayacak; Aşama 2'ye kadar bu kabul edilebilir mi?

## Kaynaklar
- gbrain: [vectorize.io incelemesi](https://vectorize.io/articles/what-is-gbrain), [slite incelemesi](https://slite.com/learn/gbrain-review)
- Karpathy LLM Wiki: [gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), [aibuilderclub özeti](https://www.aibuilderclub.com/blog/karpathy-llm-wiki)
- ai-memory: [GitHub](https://github.com/akitaonrails/ai-memory), [2.0 yazısı](https://akitaonrails.com/en/2026/09/02/ai-memory-2-0-best-memory-system-for-agents-and-teams/)
- COG: [GitHub](https://github.com/huytieu/COG-second-brain)
- agent-second-brain: [README](https://cdn.jsdelivr.net/gh/smixs/agent-second-brain@main/README.md)
- open-second-brain: [README aynası](https://gh.r-mj.com/itechmeat/open-second-brain) (görseldeki "techmext" kullanıcı adı doğrulanamadı; bulunan depo `itechmeat`)
- Anthropic dreaming: [Claude Platform belgeleri](https://platform.claude.com/docs/en/managed-agents/dreams), [the-decoder haberi](https://the-decoder.com/claudes-new-dreaming-feature-is-designed-to-let-ai-agents-learn-from-their-mistakes/)
- claude second brain (jessepinkman99): doğrulanmadı.
