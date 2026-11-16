# WawiERP — Hafıza ve Beyin Mimarisi

Tarih: 2026-11-14 · Durum: v1 tasarım, ilk kurulum yapıldı.

Yeniden tasarımdan önce kurulan iki katman. Amaç: her oturum sıfırdan başlamasın, sistemin haritası ve alınan kararlar kalıcı olsun.

## 1. Üç katman, üç ayrı iş

| Katman | Araç | Soru | İçerik | Nasıl güncellenir |
|---|---|---|---|---|
| **Kaynak** | Bu klasör (düz metin + kod) | "Aslı nerede?" | Analizler, eski sistem kodu, şema, yeni tasarım, kararlar | Elle / commit |
| **Beyin** | graphify → `graphify-out/` | "Ne neye bağlı?" | Kaynaktan **türetilen** bilgi grafiği: modüller, tablolar, entegrasyonlar, akışlar ve aralarındaki ilişkiler | `/graphify . --update` (türetilir, elle yazılmaz) |
| **Hafıza** | Cognee, `[wavierp]` etiketi | "Neye karar verdik, neden?" | Kararlar, gerekçeler, reddedilen seçenekler, müşteri/pazar bilgisi, öğrenilen dersler | `cognee-remember` (olay olunca yazılır) |

Kural: **Kaynak tek doğruluk.** Beyin silinirse kaynaktan yeniden üretilir. Hafıza, kaynakta yeri olmayan "neden"i tutar; önemli her karar ayrıca `kararlar/` altına düz metin yazılır ki Cognee kaybolsa da geri gelsin.

## 2. Beyin (graphify)

### Ne girer
```
WaviERP/
├── docs/            analiz ve tasarım belgeleri        → anlamsal çıkarım
├── raw/             dışarıdan alınan ham veri          → anlamsal çıkarım
│                    (site metni, ekran görüntüsü, rakip sayfaları)
├── legacy/          eski sistemin kodu + SQL şeması    → AST (ücretsiz, LLM'siz)
├── kararlar/        karar kayıtları (ADR)              → anlamsal çıkarım
├── yeni/            yeniden tasarlanan sistemin kodu   → AST
└── graphify-out/    grafik çıktıları (türetilmiş)
```

### Düğüm türleri (yeniden tasarım için aranacak şeyler)
- **Modül** — Katalog, Stok, Sipariş, Kargo, Satın Alma, Fatura, Cari, B2B Portal, Yetki, API
- **Varlık** — Ürün, SKU, EAN, Depo, Şirket, Satış Hesabı, Sipariş, Tedarikçi, Müşteri, Fatura
- **Stok modeli** — Fiziki, Sanal, Drop
- **Entegrasyon** — Amazon, eBay, Kaufland, OTTO, Trendyol, DHL … (durum: mevcut / talep)
- **Akış** — 5 adımlı sipariş yolculuğu, mal kabul, transfer, sayım
- **Altyapı** — Cloudflare, Plesk, PHP 8.1, oturum, API
- **Sorun / Risk** — desteklenmeyen PHP, Impressum yok, e-posta kaydı yok …
- **Karar** — `kararlar/` dosyalarından

Kenarlar graphify'ın kendi etiketleriyle gelir: `EXTRACTED` (kaynakta açıkça yazıyor), `INFERRED` (çıkarım), `AMBIGUOUS` (emin değil). Yeniden tasarım kararları yalnız `EXTRACTED` kenarlara dayanır; diğerleri doğrulanacak iş listesidir.

### Kullanım
| Ne zaman | Komut |
|---|---|
| Yeni belge/kod eklendi | `/graphify . --update` |
| "X değişirse ne etkilenir?" | `/graphify query "..."` |
| İki kavram arası bağ | `/graphify path "Sanal stok" "Trendyol"` |
| Tek kavramı açıkla | `/graphify explain "Sipariş havuzu"` |
| Eski kod gelince | kodu `legacy/` altına koy → `/graphify . --update` |

Eski sistemin kodu geldiğinde beynin asıl değeri ortaya çıkar: PHP dosyaları ve SQL şeması AST ile ücretsiz çıkarılır, "tanrı düğümler" (her şeyin bağlandığı dosya/tablo) yeniden tasarımda ilk parçalanacak yerleri gösterir.

## 3. Hafıza (Cognee)

### Veri kümesi ve kategoriler
Kayıtlar Cognee'nin varsayılan veri kümesine **`[wavierp]` etiketiyle** yazılır (ayrı veri kümesi açılmadı; çünkü her mesajda çalışan otomatik hatırlama yalnız varsayılan kümeyi arıyor). Cognee'nin üç kategorisi şöyle kullanılır:

| Kategori | Ne yazılır | Örnek |
|---|---|---|
| `project` | Sistem gerçekleri, kararlar, kısıtlar | "Gerçek entegrasyon çekirdeği 20 kanal; kalan ~50 kart istek listesi" |
| `user` | Sahibin tercihleri, öncelikleri | "Önce hafıza+beyin, sonra yeniden tasarım" |
| `agent` | Çalışma dersleri, tuzaklar | "Siteye arka arkaya istek atınca origin 525 dönüyor" |

### Kayıt biçimi (her kayıt kendi başına anlaşılır olmalı)
```
[wavierp][tür][tarih] Tek cümlelik gerçek/karar.
Neden: …
Kaynak: docs/01-sirket-analizi.md §4   (ya da kararlar/0003-….md)
```
Tür: `gercek` · `karar` · `reddedildi` · `acik-soru` · `ders`.

### Ne yazılır / ne yazılmaz
Yazılır: kararlar ve gerekçeleri, reddedilen seçenekler, sahibinden öğrenilen iş bilgisi (müşteri sayısı, hacim, hedef pazar), bir kez zor bulunan teknik bilgi.
Yazılmaz: koddan/grafikten zaten okunabilen yapı, geçici görev durumu, şifre ve anahtarlar.

## 4. İkisi birlikte nasıl çalışır

```
        soru gelir
            │
   ┌────────┴─────────┐
   ▼                  ▼
Cognee'de ara     graphify query
(neden / karar)   (yapı / bağlantı)
   └────────┬─────────┘
            ▼
   kaynaktan doğrula (dosya:satır)
            ▼
        cevap / iş
            ▼
   yeni karar çıktıysa:
   kararlar/NNNN-*.md  →  cognee-remember  →  graphify --update
```

Oturum döngüsü:
1. **Başlangıç:** Cognee otomatik hatırlar; `graphify-out/GRAPH_REPORT.md` okunur.
2. **Çalışma:** yapısal sorular grafiğe, "neden" soruları hafızaya.
3. **Bitiş:** yeni kararlar `kararlar/` + Cognee'ye; değişen dosyalar için `--update`.

## 5. Yeniden tasarım yol haritası (hafıza+beyin üzerine)

| Aşama | İş | Beyin/Hafıza çıktısı |
|---|---|---|
| 0 | Hafıza + beyin kurulumu | Bu belge, ilk grafik, ilk Cognee kayıtları ✅ |
| 1 | Eski sistemi içeri al (kod, şema, ekranlar) | `legacy/` grafiği: modül–tablo–entegrasyon haritası |
| 2 | Alan modeli çıkar | Varlık ve akış düğümleri, `docs/06-alan-modeli.md` alan sınırları |
| 3 | Hedef mimari | Karar kayıtları: dil/çerçeve, veritabanı, çok kiracılılık, entegrasyon katmanı |
| 4 | Geçiş planı | Eski→yeni eşleme kenarları, risk düğümleri |
| 5 | Uygulama | `yeni/` kodu grafikte; eski grafikle karşılaştırma |

## 6. Bilinen sınırlar
- Şu an beyin yalnız **dışarıdan görülen** bilgiyi içeriyor (site + altyapı). Kaynak kod ve veritabanı şeması gelmeden iç yapı hakkında söylenen her şey çıkarımdır.
- Cognee tek makinede; yedeği `kararlar/` düz metnidir.
