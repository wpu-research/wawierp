# 0001 — WawiERP çok kiracılı (multi-tenant) sistem olacak

Tarih: 2026-11-14 · Durum: **Karar verildi** (sahibi: "Çok kiracılı sistem son kararımız")

## Bağlam
WawiERP bugün tek kurulumda 12 şirket, 5 depo ve 41 satış kanalına hizmet veriyor. Açık soru, sistemin yalnız kendi şirketleri için mi kalacağı, yoksa dışarıya hizmet olarak da sunulacağıydı (`docs/11-yeniden-tasarim-girdileri.md` §3, soru 9).

## Karar
Yeniden tasarlanan sistem çok kiracılı olacak: birden fazla bağımsız müşteri kuruluşu aynı platformu kullanacak.

## Sonuçları
- Kiracı, bugünkü hiyerarşinin üstüne yeni bir katman olarak gelir: Kiracı → Şirket → Depo → Kanal → Hesap. Mevcut 12 şirket ilk kiracı(lar) olur.
- Her tablo, sorgu, arka plan işi, dosya ve denetim kaydı kiracıya göre ayrılmak zorunda.
- Hedef mimari değerlendirmesi değişir: "yerinde yenileme" (seçenek A) tek başına yeterli değil; kiracı yalıtımı baştan tasarlanmalı (`docs/10-rakip-ve-hedef-mimari.md`).
- Abonelik, faturalama, kiracı kaydı ve kiracı başına kanal kimlik bilgisi saklama yeni gereksinimler.

## Açık kalanlar (henüz karar değil)
- Teknoloji yığını (dil, çerçeve, veritabanı, kuyruk, ön yüz, barındırma)
- Kiracı yalıtım modeli (ortak şema + satır düzeyi güvenlik / kiracı başına şema / kiracı başına veritabanı)
- Geçiş yolu (mevcut sistemle birlikte çalışma süresi)
