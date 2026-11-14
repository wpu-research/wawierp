# WawiERP — Claude Kuralları

Depo + pazaryeri ERP'si (wawib2b.com) analiz ve yeniden tasarım projesi.
Mimari: `docs/02-hafiza-beyin-mimarisi.md`. Şirket analizi: `docs/01-sirket-analizi.md`.

## Üç katman
- **Kaynak** = bu klasör. Tek doğruluk.
- **Beyin** = graphify (`graphify-out/`). Kaynaktan türetilir, elle düzenlenmez.
- **Hafıza** = Cognee, varsayılan veri kümesi, `[wavierp]` etiketi. Kararlar ve gerekçeler.

## Oturum başında
1. Cognee'de `wavierp` ile ilgili kayıtları ara (otomatik hatırlama yetmezse `cognee-search`).
2. `graphify-out/GRAPH_REPORT.md` dosyasını oku.

## Çalışırken
- Yapı / bağlantı / etki sorusu → önce `graphify query "<soru>"`, sonra kaynaktan doğrula.
- "Neden böyle?" sorusu → önce Cognee.
- Grafikteki `INFERRED` / `AMBIGUOUS` kenarlara dayanarak karar verme; önce kaynakta doğrula.

## Oturum sonunda (iş yapıldıysa)
1. Yeni karar → `kararlar/NNNN-kisa-ad.md` (Bağlam · Karar · Neden · Reddedilenler).
2. Aynı kararı Cognee'ye yaz: `[wavierp][tür][tarih] …  Neden: …  Kaynak: …`
   Tür: `gercek` · `karar` · `reddedildi` · `acik-soru` · `ders`.
3. Belge ya da kod değiştiyse `/graphify . --update`.

## Klasörler
`docs/` analiz ve tasarım · `raw/` ham dış veri · `legacy/` eski sistem kodu ve şeması ·
`kararlar/` karar kayıtları · `yeni/` yeniden tasarlanan kod · `graphify-out/` grafik çıktısı.

## Sınırlar
- Canlı siteye (wawib2b.com) yalnız okuma amaçlı, seyrek istek at; origin hassas (525/500 görüldü).
- Şifre, anahtar, müşteri kişisel verisi ne Cognee'ye ne grafiğe yazılır.
- Dil: belgeler Türkçe.
