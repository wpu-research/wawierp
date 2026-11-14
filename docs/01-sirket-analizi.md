# WawiERP (wawib2b.com) — Şirket ve Sistem Analizi

Tarih: 2026-11-14 · Kaynak: yalnızca dışarıdan görülebilen veriler (site, DNS, whois, HTTP başlıkları, sertifika kayıtları). Kaynak koda ve giriş arkasındaki ERP'ye bakılmadı.

## 1. Özet

WawiERP, depo + pazaryeri + sipariş + ön muhasebe işlerini tek panelde toplayan, çok şirketli ve çok depolu bir e-ticaret ERP'si. Hedef kitle Avrupa (özellikle Almanya) ve Türkiye'de pazaryerlerinde satan depo sahipleri, dropshipping ekipleri ve B2B toptancılar. Ürün çalışan bir sistem (giriş ekranı, eski PIN sistemi, sürüm numaralı varlıklar var) ama pazarlama yüzü çok yeni: alan adı 3 ay önce alınmış, arama motorlarında ve trafik listelerinde izi yok, şirket kimliği sitede hiç yazmıyor.

## 2. Ürün

### Konumlandırma
- Slogan: "Tek panelden dünyaya satış" / "Depodan müşteriye".
- "Wawi" Almanca *Warenwirtschaft* (stok/mal yönetimi) kısaltması; JTL-Wawi ile aynı kelime ailesi. İsim doğrudan Alman pazarına sesleniyor.
- Satış modeli: self-servis kayıt yok. "Başvur" formu (şirket adı, yetkili, e-posta, ülke, ilk depo, kanallar) → inceleme → kurulum görüşmesi. Fiyat sayfası yok.
- 10 dil: TR, EN, DE, FR, IT, ES, NL, PL, PT, 简体中文. Giriş ekranı yalnız TR ve DE → asıl kullanıcılar Türkçe ve Almanca konuşuyor.

### Üç stok modeli (ürünün ayırt edici fikri)
| Model | Anlamı |
|---|---|
| Fiziki stok | Rafta sayılmış miktar; depo bazında sayım, fiyat, hareket geçmişi. "Sayılmamış" ile "sıfır stok" ayrı tutulur |
| Sanal stok | İlana açılacak planlı satış kapasitesi; fiziki sayımı değiştirmez |
| Dropshipping | Tedarikçi kataloğu ortak katalogla eşleştirilir; drop miktarı ve karşılama kaynağı ayrı izlenir |

### Modüller (12)
1. Ortak ürün kataloğu — SKU, birden fazla EAN, varyant, mükerrer kart birleştirme
2. Çoklu depo ve şirket — depo/şirket/kanal hiyerarşisi, transfer, yoldaki sevkiyat, mal kabul
3. Pazaryerleri ve mağazalar — hesap bazında fiyat/miktar/ürün gönderimi, yayın sonucu
4. Birleşik sipariş havuzu — tarih, durum, mağaza, depo, şirket, tedarik kaynağı filtreleri; eşleşmeyen kayıt incelemesi
5. Toplama, paketleme, kargo — toplama listesi, etiket, toplu PDF, takip
6. Satın alma ve tedarikçiler — alış faturası, ekler, son alış maliyeti
7. Faturalar ve belgeler — KDV, para birimi, vade; doğru tüzel kişilik altında belge
8. B2B müşteri portalı — müşteri kendi stok, fatura ve cari bilgisini görür
9. Ön muhasebe ve cari — EUR/USD ayrı takip, tahsilat, kanal cirosu, CSV rapor
10. Ekip, yetki, denetim izi — depo/bölüm erişimi, PIN kontrolleri, kim-ne-zaman kaydı
11. Operasyon notları ve talepler
12. Mobil ve API — mobil tarayıcı arayüzü, barkod akışları; iOS/Android **yayında değil**, yalnız API altyapısı hazır

### Sipariş yolculuğu (5 adım)
Ürünü hazırla → Kaynağı seç → Kanala gönder → Siparişi hazırla → Müşteriye ulaş

### Entegrasyonlar (72+ kart; site "mevcut" ile "kurulum talebi"ni açıkça ayırıyor)
- **Mevcut (19):** Amazon, eBay, Kaufland, METRO, OTTO, Trendyol, n11, Ozon, DealClub, idealo, Stockist24, Shopify, JTL-Shop, Wawi Store API, JTL-Wawi, Billbee, Asterbuy, XML/CSV, DHL, PostNL
- **Kurulum talebi (≈50):** Etsy, Walmart, Allegro, bol, Cdiscount, Fnac Darty, Rakuten, AliExpress, Temu, TikTok Shop, SHEIN, OnBuy, Mercado Libre, Shopee, Lazada, Flipkart, noon, Hepsiburada, ÇiçekSepeti, Pazarama, eMAG, CDON, Fyndiq, Takealot, JD.com, Tmall, Taobao, Target Plus, Wayfair, Zalando, Back Market, Vinted Pro, ManoMano, Decathlon, Magento, WooCommerce, Shopware, PrestaShop, BigCommerce, Wix, Squarespace, OpenCart, Ecwid, ikas, Ticimax, IdeaSoft, T-Soft, DPD, UPS, FedEx, GLS, Hermes

Yani gerçek entegrasyon çekirdeği Almanya ağırlıklı (Kaufland, METRO, OTTO, idealo, JTL, Billbee, DHL) + Türkiye (Trendyol, n11). "72+" sayısının büyük kısmı istek listesi.

## 3. Şirket kimliği

- Sitede **tüzel kişilik, adres, telefon, Impressum, gizlilik politikası, KVKK/GDPR metni, fiyat yok.** Almanya'da ticari site için Impressum yasal zorunluluk; bu eksik hem hukuki risk hem güven sorunu.
- Whois gizli (Namecheap "Withheld for Privacy").
- Web aramasında "wawib2b.com" ve "WawiERP" için hiçbir sonuç çıkmadı (basın, dizin, sosyal medya, yorum yok).
- Çıkarım (kanıt değil): TR+DE giriş ekranı, Alman pazaryeri çekirdeği ve Türk pazaryerleri birlikte, Almanya'da faaliyet gösteren Türk kökenli bir e-ticaret/toptan ekibinin kendi operasyonu için yazdığı iç aracı ürünleştirdiğini düşündürüyor. "Eski PIN sistemi ile devam et" bağlantısı da iç araç geçmişine işaret ediyor.

## 4. Sunucu ve altyapı

| Konu | Bulgu |
|---|---|
| Alan adı | wawib2b.com · Namecheap · kayıt 2026-08-09 · bitiş 2027-08-09 (1 yıllık) |
| DNS | Cloudflare (annalise / toby.ns.cloudflare.com) · DNSSEC kapalı |
| IP | 104.21.34.217, 172.67.165.152 + IPv6 — hepsi Cloudflare proxy; **gerçek sunucu IP'si gizli** |
| Origin | Plesk (Linux) üzerinde PHP 8.1.34 (`x-powered-by: PHP/8.1.34`, `PleskLin`) |
| Uygulama | Çerçevesiz/klasik PHP: `features.php`, `?login=1`, `?welcome=1&lang=tr` gibi sorgu-parametreli yönlendirme; sunucu taraflı render; 3 adet düz JS dosyası |
| Oturum | `WAWIWELCOME` çerezi (Secure, HttpOnly, SameSite=Lax); bilinmeyen yollar `/?session=expired`'e 303 ile düşüyor |
| TLS | Google Trust Services WE1 (Cloudflare), `*.wawib2b.com` joker sertifika; ilk sertifika 2026-08-09 |
| Protokol | HTTP/2 + HTTP/3 |
| E-posta | **MX, SPF, DMARC kaydı yok** — alan adından e-posta alınıp gönderilemiyor |
| Alt alan adı | Yalnız `www` doğrulandı |
| Analitik | Yalnız Cloudflare Web Analytics; Google Analytics/Tag Manager/piksel yok |
| Hız | TTFB ≈ 0,6 sn, ana sayfa 117 KB HTML, önbellek kapalı (`no-store`) |
| robots/sitemap | robots.txt Cloudflare'in varsayılanı; **sitemap.xml yok** (303 dönüyor) |

### Güvenlik gözlemleri (pasif)
İyi: sıkı CSP (`default-src 'none'`, yalnız `self`), `nosniff`, `frame-ancestors 'none'`, güvenli çerez bayrakları, tarayıcı kapanınca oturum sonu.
Zayıf:
- `x-powered-by` başlıkları PHP sürümünü ve Plesk'i ifşa ediyor.
- PHP 8.1 güvenlik desteği 31 Aralık 2025'te bitti → desteklenmeyen sürüm.
- HSTS başlığı yok.
- Arka arkaya isteklerde `525` (origin TLS el sıkışma hatası) ve `500` yanıtları görüldü → origin kararsız veya tek küçük sunucu.
- security.txt yok; DNSSEC kapalı.

## 5. Trafik

- **Tranco ilk 1 milyon listesinde yok.**
- Similarweb/Semrush/Ahrefs'te veri bulunamadı (Similarweb sayfası yüklenmedi; arama sonuçlarında da kayıt yok).
- Arama motorlarında dizinlenmiş sayfa bulunamadı; Wayback Machine'de arşiv kaydı yok.
- Sonuç: ölçülebilir organik trafik yok. Site bir pazarlama kanalı değil, mevcut müşterilerin giriş kapısı + başvuru formu. Gerçek rakam yalnızca site sahibinin Cloudflare panelinden alınabilir.

## 6. Rakipler

| Rakip | Pazar | Not |
|---|---|---|
| JTL-Wawi | DE | Pazar lideri, ücretsiz çekirdek, masaüstü/Windows ağırlıklı |
| Billbee | DE | Bulut, sipariş başı ucuz fiyat, küçük satıcı |
| plentymarkets (PlentyONE) | DE | Büyük çok kanallı satıcı |
| Xentral, weclapp | DE | Genel bulut ERP |
| Pickware | DE | Shopware/Shopify depo |
| Base (BaseLinker) | PL/AB | 1000+ entegrasyon, agresif fiyat |
| Entegra, Sentos, StockMount, Dopigo | TR | Türk pazaryeri entegratörleri |

WawiERP'nin boşluğu: **DE + TR pazaryerlerini aynı panelde** ve **çok şirket + B2B portal + ön muhasebe** ile birlikte sunmak. Rakiplerin çoğu bu ikisinden yalnız birini yapıyor.

## 7. Güçlü / zayıf yönler

Güçlü
- Fiziki/sanal/drop stok ayrımı net ve gerçek operasyon tecrübesinden geliyor
- Çok şirket, çok depo, denetim izi, B2B portal tek üründe
- Dürüst dil ("mevcut" / "kurulum talebi", "mobil uygulama yayında değil")
- 10 dilli arayüz, sıkı CSP

Zayıf
- Şirket kimliği ve yasal sayfalar yok
- Fiyat, demo, ekran görüntüsü, müşteri referansı yok
- SEO sıfır: sitemap yok, dizinlenmemiş, içerik/blog yok
- E-posta altyapısı yok
- Desteklenmeyen PHP sürümü, tek sunucu izlenimi, klasik PHP mimarisi (ölçek ve API-öncelikli mobil için sınırlayıcı)
- Self-servis kayıt yok → büyüme elle kurulum hızına bağlı

## 8. Yeniden tasarım için açık sorular
1. Kaynak koda ve veritabanı şemasına erişim var mı? (Bu analiz yalnız dış yüz.)
2. Kaç aktif şirket/depo/sipariş hacmi var?
3. Yeniden tasarımın kapsamı: yalnız pazarlama sitesi mi, ERP'nin kendisi mi, ikisi de mi?
4. Hedef pazar önceliği: DE mi TR mi?
