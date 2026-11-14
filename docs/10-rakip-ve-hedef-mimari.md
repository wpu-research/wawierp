# 10 — Rakip ve Hedef Mimari Araştırması

Tarih: 2026-11-14. Bu belge karar değildir; karar için girdidir. Fiyatlar KDV hariç, kaynakta aksi belirtilmedikçe. Doğrulanamayan her şey "doğrulanamadı" diye işaretlidir. Araştırma yalnız genel web üzerinden yapıldı; wawib2b.com'a istek atılmadı. Bazı resmi siteler (plentyONE fiyat sayfası, JTL fiyat sayfası, Dopigo, Entegra) araç tarafında açılamadı (DNS/sertifika hatası); bu yüzden bu satıcılarda üçüncü taraf kaynak kullanıldı ve açıkça belirtildi.

## 1. Karşılaştırma tablosu

| Ürün | Fiyat modeli (2026-11-14 itibarıyla bulunan) | Entegrasyon mimarisi | Pazaryeri kapsamı (hedefimizden) | Stok / çok depo |
|---|---|---|---|---|
| JTL-Wawi | Start ücretsiz (500 sipariş/ay sınırı); Advanced ~99–119 €/ay; Pro ~299–369 €/ay; Enterprise teklifle. Hepsi üçüncü taraf, resmi doğrulanamadı | Masaüstü Wawi + JTL-Connector (shop) + REST API (JTL bulut geliştirici portalı) | eBay, Amazon, Kaufland, OTTO bağlı (üçüncü taraf); METRO, Trendyol, N11, Ozon doğrulanamadı | Depo/ambar nesneleri var; gelişmiş depo için ayrı JTL-WMS |
| Billbee | Starter ≤200 sipariş/ay (min 9 €/ay), Growth 200+; birim fiyat sayfada yok | Bulut; REST API (Basic Auth + API anahtarı) | Amazon, eBay, OTTO Market, Etsy ve shop sistemleri; Kaufland/METRO/TR sayfada görülmedi | Growth'ta VentoryOne depo ürünü; çok depo detayı doğrulanamadı |
| plentymarkets / PlentyONE | Resmi fiyat doğrulanamadı; üçüncü taraf: fiyatlar artık yayınlanmıyor olabilir, eski katmanlar 42–1.250 €/ay | Bulut monolit; OAuth2 REST API; eklenti (plugin) sistemi | Pazaryeri eklentileri var ama bu araştırmada tek tek doğrulanamadı | Depo / stok yönetimi API'si var (depo, stok, yeniden dağıtım) |
| Xentral | Launch 99 €/ay (+0,30 €/sipariş), Starter 349, Business 649 (API dahil), Pro 849 €/ay, Scale teklifle (resmi sayfa) | Bulut ERP; açık API (OpenAPI), Xentral Connect (düşük-kod) | Amazon, Shopify, Shopware, eBay, WooCommerce resmi sayfada; Kaufland ve OTTO ayrı entegrasyon sayfalarında | Fiyat sayfasında çok depo açık değil; depo/raf API'si beta |
| weclapp | ERP Starter 39, Dienstleistung 86–95, Handel 163–179 €/kullanıcı/ay; API Starter'da yok (resmi sayfa) | Bulut; tenant başına REST API, token | Handel paketinde pazaryeri (Amazon, eBay, Kaufland vb.) bağlantısı | Handel'de yapılandırılabilir depo yapısı |
| Pickware | ERP Starter 99–119, Advanced 299–349, Professional 599–699 €/ay + sipariş başı 0,15–0,20 € aşımı; WMS 199–229 €/cihaz/ay (resmi sayfa) | Shopware 6 içine gömülü ERP (veya Shopify uygulaması); REST API | Pazaryeri odaklı değil, shop merkezli | "Birden çok konum" yalnız Professional ve üstünde |
| Base (BaseLinker) | Freemium 0 $ (100 sipariş); Business 99 $/ay (1.000 sipariş, sonrası 0,49 $); Enterprise teklifle (resmi sayfa) | Bulut hub; tek REST uç (connector.php), 100 istek/dk | eBay, Amazon (FBA), Kaufland, OTTO, Trendyol var; N11, Ozon, METRO listede yok | Katalog + çok depo + raf/bölge/konum API'si |
| Entegra (TR) | Resmi fiyat doğrulanamadı | TR entegratör, bulut | Trendyol, Hepsiburada, Amazon, N11 (üçüncü taraf); AB pazaryerleri doğrulanamadı | Doğrulanamadı |
| Sentos (TR) | Bir yıllık lisans; resmi sayfada fiyat yok; üçüncü taraf (rakip blogu): Basic 9.500 TL/yıl ... Platinum 89.000 TL/yıl | TR entegratör; 22 pazaryeri, ihracat bağlantıları | Trendyol, Hepsiburada, Amazon, N11; ihracatta Amazon, Etsy, Zalando, Ozon; eBay/Kaufland/OTTO/METRO görülmedi | Tek kaynaktan stok; çok depo doğrulanamadı |
| StockMount (TR) | Resmi sayfada fiyat yok; 14 gün ücretsiz deneme | TR entegratör | Trendyol, Hepsiburada, Amazon, N11, Ozon, PttAVM vb. | Doğrulanamadı |
| Dopigo (TR) | Üçüncü taraf: Pazaryeri 24.999, E-Ticaret 39.999, Muhasebe 74.999 TL/yıl; resmi doğrulanamadı | TR entegratör | Bu araştırmada doğrulanamadı | Doğrulanamadı |

## 2. Kısa bölümler

### JTL-Wawi
- Fiyat: Start sürümünün ücretsiz ve aylık 500 sipariş ile sınırlı olduğu, Advanced'in 99–119 € arasında değiştiği yazılıyor; kaynaklar çelişiyor ve resmi sayfa açılamadı. Bir kaynak 1 Nisan 2026'da fiyat/sürüm yapısının değiştiğini, yaklaşık %20 artış olduğunu söylüyor (tek kaynak, doğrulanamadı). Kaynaklar: [taxandbytes](https://www.taxandbytes.de/tools/e-commerce/jtl-wawi/preise), [erp-software.org](https://erp-software.org/software/jtl/), [Qualimero](https://qualimero.com/en/blog/jtl-wawi-costs-reviews-ai-revolution-2026).
- Mimari: JTL'nin geliştirici portalında Wawi için REST API (ürün, depo, stok, pazaryeri-satıcı uçları) görünüyor: [JTL developer](https://developer.jtl-software.com/cloud/api-reference/erp/v2.1/wawi/determines-the-stock-of-an-item-across-all-warehouses.md), [pazaryeri ucu](https://developer.jtl-software.com/cloud/api-reference/erp/v2.1/marketplace-seller/partially-updates-the-configuration-sync-defaults-returns-of-the-specified-marketplace.md). Kılavuz: [guide.jtl-software.com](https://guide.jtl-software.com/en/).
- Pazaryeri: Amazon, eBay, OTTO, Kaufland, Idealo bağlanabiliyor (üçüncü taraf): [erp-software.org](https://erp-software.org/software/jtl/).
- Güçlü: Almanya'da yaygın, geniş partner ekosistemi, ücretsiz giriş. Zayıf: masaüstü Wawi mimarisi ve connector modeli; TR pazaryerleri doğrulanamadı; gelişmiş depo ayrı ürün (JTL-WMS).

### Billbee
- Fiyat: Starter ≤200 sipariş/ay, en az 9 €/ay; Growth 200+ sipariş; tüm işlevler ve sınırsız kullanıcı; sipariş başı oran sayfada yok: [Billbee fiyatlar](https://www.billbee.io/preise).
- API: Basic Auth + `X-Billbee-Api-Key`; hız sınırı kaynaklarda çelişkili (2/sn veya 50/sn): [APIs.guru Billbee spec](https://apis.guru/apis/billbee.io), [veryfront](https://veryfront.com/docs/cloud/integrations/billbee).
- Güçlü: küçük/orta satıcıya basit, düşük giriş. Zayıf: depo derinliği sınırlı görünüyor, 5 depo/12 şirket ölçeği ve TR/NL için uygunluk doğrulanamadı.

### plentymarkets / PlentyONE
- Fiyat: resmi sayfa açılamadı. Üçüncü taraf bir kaynak fiyatların artık yayınlanmadığını yazıyor; başka bir kaynak eski 5 katmanı (Lite 59 € vb.) anlatıyor: [trusted.de](https://trusted.de/plentyone-kosten), [OMR](https://omr.com/de/reviews/product/plentysystems). Güncel fiyat doğrulanamadı.
- Mimari: OAuth2 REST API, bazı uçlarda kısıtlama (throttling): [PlentyONE REST API](https://developers.plentyone.com/en-gb/developers/main/rest-api-guides/getting-started.html). Depo ve stok bilgisi: [stok yönetimi](https://knowledge.plentyone.com/en-gb/manual/main/stock-management/stock-management.html), [depo planlama](https://knowledge.plentyone.com/en-gb/manual/main/stock-management/setting-up-a-warehouse.html).
- Güçlü: tam bulut, çok depo ve çok kanal için tasarlanmış. Zayıf: fiyat şeffaflığı düşük, platforma bağımlılık; pazaryeri kapsamı bu araştırmada doğrulanamadı.

### Xentral
- Fiyat (resmi): Launch 99 €/ay (+0,30 €/sipariş; 1 shop + 1 pazaryeri), Starter 349, Business 649 (API, Connect, MCP sunucusu), Pro 849 €/ay, Scale teklifle; yapay zekâ 2026 sonuna kadar ücretsiz, sonra kredi usulü: [Xentral fiyatlar](https://xentral.com/de/preise).
- Mimari: açık API ve OpenAPI spesifikasyonu, düşük-kod Xentral Connect: [Xentral API](https://www.xentral.com/en/erp/api), [geliştirici](https://developer.xentral.com/), [Connect](https://www.xentral.com/en/connect). Depo/raf ucu var, bir kısmı beta ve bozucu değişiklik uyarılı.
- Pazaryeri: Kaufland (sipariş, takip, stok bildirimi, fatura): [Kaufland entegrasyonu](https://xentral.com/en/integrations/kaufland); eBay'de stok eşitlemesi için özel seçenek gerekiyor: [Xentral yardım](https://help.xentral.com/hc/en-us/articles/10912700326428).
- Güçlü: API-önce tutum, Alman ERP odağı. Zayıf: fiyat sayfasında çok depo açık değil; TR/NL pazaryerleri doğrulanamadı.

### weclapp
- Fiyat (resmi): kullanıcı başına aylık; Starter 39 €, Dienstleistung 86 € veya 95 €, Handel 163 € veya 179 € (iki seri açıkça etiketli değil); API Starter'da yok: [weclapp fiyatlar](https://www.weclapp.com/de/preise/).
- Mimari: tenant başına REST API, kullanıcı token'ı: [weclapp API](https://www.weclapp.com/api/).
- Pazaryeri: Handel paketinde Amazon, eBay, Kaufland vb. Güçlü: klasik ERP bütünlüğü (muhasebe, CRM, depo). Zayıf: kullanıcı başı lisans; yüksek hacimli kanal operasyonunda ölçek ve OTTO/METRO/TR kapsamı doğrulanamadı.

### Pickware
- Fiyat (resmi): ERP Starter 119/99, Advanced 349/299, Professional 699/599 €/ay (aylık/yıllık), sipariş aşımı 0,15–0,20 €; WMS cihaz başına 229/199 €; "birden çok konum" yalnız Professional ve Enterprise: [Pickware fiyatlar](https://www.pickware.com/en/pricing).
- Mimari: Shopware 6 içinde yerel ERP, ayrıca Shopify uygulaması; REST API: [Pickware geliştirici](https://developer.pickware.com/shopware-erp/latest/developer-guide/rest-api/overview.html).
- Güçlü: shop ile aynı veritabanı, senkron sorunu yok. Zayıf: Shopware/Shopify'a bağlı; bizim 22 pazaryeri hesabı ve 19 mağaza için merkezi hub değil.

### Base (BaseLinker)
- Fiyat (resmi): Freemium 0 $; Business 99 $/ay (1.000 sipariş dahil, ek sipariş 0,49 $); Enterprise 5.000+ sipariş veya 300 bin $ GMV için teklif; bağlı hesap sınırı yok: [Base fiyatlar](https://base.com/en-US/pricing/).
- Mimari: tek bağlantı ucu (`connector.php`), 100 istek/dk, katalog, depo, raf, bölge, konum yöntemleri; stok ve fiyat güncellemesi çağrı başına 1.000 ürün: [Base API](https://api.baselinker.com).
- Pazaryeri: eBay, Amazon, Kaufland, OTTO Market, Trendyol listede; N11, Ozon, METRO ve Hepsiburada yok: [Base pazaryeri listesi](https://base.com/en-EN/help/kbc/7-marketplace/), [Trendyol kurulumu](https://base.com/en-EN/help/knowledgebase/trendyol-integration-setup/) (Trendyol'da durum değişikliği tek yönlü).
- Güçlü: kanal genişliği, hesap sayısında sınır yok, yatırım gerektirmeyen hub. Zayıf: ERP/muhasebe derinliği sınırlı, çok şirketli (DE/TR/NL) vergi ve fatura yapısı doğrulanamadı.

### TR entegratörleri (Entegra, Sentos, StockMount, Dopigo)
- Hepsi Türkiye pazaryerlerine (Trendyol, Hepsiburada, N11) odaklı; AB pazaryerleri (Kaufland, OTTO, METRO) bu araştırmada hiçbirinde doğrulanamadı.
- Sentos (resmi sayfa): 22 pazaryeri, ihracatta Amazon/Etsy/Zalando/Ozon, bir yıllık lisans, 7 gün deneme; fiyat sayfada yok: [Sentos](https://sentos.com.tr). TL fiyatları yalnız rakip blogundan: [ZunaPro Sentos karşılaştırması](https://www.zunapro.com/turkey/tr/blog/sentos-alternatifi); resmi doğrulanamadı.
- StockMount (resmi sayfa): Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti, PttAVM, Pazarama, Ozon; fiyat yok, 14 gün deneme: [StockMount](https://stockmount.com).
- Entegra: Trendyol, Hepsiburada, Amazon, N11 (üçüncü taraf karşılaştırma): [Kobitime 2026 karşılaştırma](https://kobitime.com/pazaryeri-entegrasyon-firmalari-karsilastirmasi-2026/). Fiyat doğrulanamadı.
- Dopigo: üçüncü taraf TL fiyatları: [ZunaPro Dopigo karşılaştırması](https://www.zunapro.com/turkey/tr/blog/dopigo-alternatifi); kapsam ve resmi fiyat doğrulanamadı.
- Güçlü: TR e-fatura, kargo ve muhasebe bağları, TL fiyat. Zayıf: Almanya/AB kanalları, çok şirketli DE+NL yapısı ve çok depo derinliği belgelenmemiş.

## 3. Hedef mimari seçenekleri (karar için girdi)

Bilinen durum: tek giriş noktası PHP, çerezli oturum, kanal başına ayrı sayfa/JS/uç kopyası, stok defteri yok (fiziki/drop/sanal/tedarikçi stoğu ayrı alanlar), iki ayrı yazma yolu, liste uçları 15–30 sn, canlı üretim, ayrılmadan geçiş (strangler) gerekli. Ekip ve süre rakamları yalnız büyüklük mertebesidir; sistemin kod tabanı bu araştırmada incelenmedi, belirsizlik yüksektir.

### A) Mevcut sistemi modüler monolite dönüştürme
- Artılar: iş mantığı ve veri korunur; en küçük sıçrama; strangler ile en doğal uyum; kanal kopyaları ortak bağdaştırıcı arayüzüne çekilebilir; stok defteri tek modül olarak içeriye eklenebilir.
- Eksiler: PHP tek giriş noktası ve çerez oturumu eski borcu taşır; iki yazma yolunu birleştirmek disiplin ister; yavaş liste uçları sorgu/indeks işidir, mimari değil, ama dönüşümle kendiliğinden düzelmez.
- Geçiş riski: düşük–orta (canlı sistem sürekli çalışır). Asıl risk, stok defterine geçişte iki yazma yolunun tutarsız kalması.
- Büyüklük mertebesi: yaklaşık 3–5 mühendis, 9–18 ay (düşük güven).

### B) Hazır / açık kaynak ERP çekirdeği + kanal bağdaştırıcıları
- Artılar: stok, depo, muhasebe, çok şirket gibi çekirdek hazır gelir (örn. ERPNext, Odoo, veya ticari Xentral/plenty API-önce çekirdek; aday listesi bu araştırmada incelenmedi); kanal bağdaştırıcıları ayrı yazılır.
- Eksiler: 5 depo, 12 şirket, drop-shipping, TR/DE/NL vergi ve fatura özelliklerinin çekirdeğe uyumu doğrulanamadı; 232 bin kartın taşınması ve özelleştirme borcu; ticari seçenekte satıcıya bağımlılık, fiyat belirsizliği (bkz. bölüm 1).
- Geçiş riski: orta–yüksek (veri göçü, çift çalışma dönemi, kullanıcı alışkanlığı). Strangler mümkün ama sınır (hangi modül önce) dikkatle çizilmeli.
- Büyüklük mertebesi: yaklaşık 4–7 kişi, 12–24 ay (düşük güven); çekirdek seçimi sonucu büyük ölçüde değiştirir.

### C) Tamamen yeni olay-tabanlı çekirdek + kanal eklentileri
- Artılar: stok defteri ve olay akışı doğal; her kanal bağımsız eklenti; yazma yolu tek; ölçeklenme ve izlenebilirlik en güçlü.
- Eksiler: en yüksek maliyet; iş kurallarının yeniden keşfi; ekip olay-tabanlı sistem deneyimi gerektirir; tüm kanallar için eşdeğer işlevin kurulması uzun sürer.
- Geçiş riski: yüksek (canlı üretimde iki sistemi paralel tutma, veri doğruluğu, uzun süre iki bakım yükü).
- Büyüklük mertebesi: yaklaşık 6–10 kişi, 18–36 ay (çok düşük güven).

Seçenekler tam dışlayıcı değildir: A'nın modüler çekirdeği ile C'nin stok defteri/olay fikri birleştirilebilir (önce defter, sonra kanal başına eklenti). Bu birleşimin uygunluğu kod incelemesi olmadan değerlendirilemez.

## 4. Görülemeyenler / Sınırlar
- Resmi fiyat sayfaları açılamadı veya içerik vermedi: JTL, plentyONE (sertifika hatası), Dopigo, Entegra. Bu satıcıların fiyatları üçüncü taraf kaynaklara dayanır veya "doğrulanamadı"dır. Sentos TL fiyatları rakip (ZunaPro) blogundan.
- Dopigo'nun pazaryeri kapsamı, Entegra'nın fiyatı ve çok depo yetenekleri hiçbir TR entegratör için doğrulanamadı.
- N11, Ozon, METRO için Batı yazılımlarında (JTL, Billbee, plenty, Xentral, weclapp) kapsam doğrulanamadı; Base'te N11/Ozon/METRO listede yok.
- Çok depo modeli: plenty ve Base için API düzeyinde görüldü; Billbee, weclapp, Xentral için net doğrulanamadı; JTL için depo uçları görüldü ama raf/konum ayrıntısı okunmadı.
- Xentral'da API hız sınırı planlara net eşlenmiyor; Billbee hız sınırı kaynaklarda çelişkili.
- 12 şirket, 3 ülke (TR/DE/NL) vergi/fatura uyumu hiçbir üründe incelenmedi.
- Mimari seçeneklerdeki ekip/süre rakamları kaynaksız mühendislik tahminidir; WawiERP kod tabanı bu araştırmada okunmadı.
- Fiyatlar günceldir (2026-11-14) ama değişebilir; Nisan 2026'da JTL için bildirilen fiyat değişimi tek kaynaktır.
