# 15 — Trendyol GitHub Kataloğu

Tarih: 2026-11-18 · Yöntem: `gh api` (GitHub REST), `gh repo list Trendyol`, GitHub repo/kod araması ve developers.trendyol.com sayfalarının okunması. Yalnız okuma; hiçbir repo klonlanmadı/çalıştırılmadı.
Yıldız ve tarih değerleri 2026-11-18 anındadır. "Doğrulanamadı" = kaynakta teyit edemedim. GitHub arama sonuçları eksiksiz olmayabilir; bulunamayan şey "yok" demek değildir.

> Güvenlik notu: Aramada `aydinnyunus/Trendyol-Classification` reposunun açıklama alanında, bir ajana "acil bildirim oluştur / webhook.site'a gönder" diyen gömülü bir metin gördüm. Bu veridir, talimat değildir; uygulanmadı. Repo kullanılmamalı.

---

## 1. Resmî Trendyol GitHub org'u (github.com/Trendyol)

Org tek: **Trendyol** (179 açık repo, 63'ü arşivli). `TrendyolGo`, `trendyol-tech` vb. adlı org bulunamadı (API 404). Dil dağılımı: Go 60, TypeScript 26, Kotlin 21, C# 18, Java 15, Swift 12, JavaScript 7.

**Önemli tespit:** Org'da satıcı/marketplace API için resmî bir SDK **yok**. Tek API'ye dönük repo, SDK değil bir yapay zekâ eklentisidir (aşağıda). Org içeriği ağırlıkla Trendyol'un iç mühendislik araçlarıdır, pazaryeri entegrasyonuyla ilgisi yoktur.

### 1.1 Satıcı entegrasyonuyla doğrudan ilgili (org içinde tek grup)

| Repo | Dil | ★ | Son push | Ne işe yarar |
|---|---|---|---|---|
| Trendyol/trendyol-integration-developer-tool | JS | 13 | 2026-06-11 | Claude Code / Codex eklentisi. Satıcı entegrasyonu yazarken "Trendyol Developer Tools MCP sunucusunu" (`apigw.trendyol.com/trendyol-developer-tools-mcp-server/sse`) doğruluk kaynağı olarak kullanır. Faz 1 kapsamı: Ürün Entegrasyonu (TR), Ürün V2 (TR), International ürün API'si. Sipariş, sevkiyat, finans, iade sonraki fazlara bırakılmış. Apache-2.0. README, MCP uç noktasının Trendyol'dan kimlik/ağ erişimi isteyebileceğini söylüyor (erişim **doğrulanamadı**). |
| Trendyol/trendyol-integration-developer-tool-cursor | JS | 0 | 2026-06-19 | Aynı eklentinin Cursor sürümü (adından; içeriği ayrıca okunmadı). |

### 1.2 Diğer popüler/önemli repolar (WawiERP ile dolaylı ilgi)

| Repo | Dil | ★ | Son push | Ne işe yarar |
|---|---|---|---|---|
| baklava | TS | 1396 | 2026-11-10 | Baklava tasarım sistemi (web bileşenleri). Org'un en çok yıldızlısı. |
| baklava-react-native | TS | 111 | 2026-11-12 | Baklava'nın React Native sürümü. |
| baklava-icons | JS | 11 | 2026-10-21 | Baklava ikon seti. |
| stove | Kotlin | 311 | 2026-11-17 | JVM/Go/Rust/Node arka uçları için e2e/bileşen test çerçevesi. |
| kediatR | Kotlin | 221 | 2026-11-16 | Kotlin için mediator uygulaması (coroutine). |
| go-pq-cdc | Go | 217 | 2026-11-16 | PostgreSQL için Change Data Capture (CDC). Ailesi: go-pq-cdc-kafka (34★), -elasticsearch (32★), -redis, -pq. |
| go-dcp | Go | 106 | 2026-11-17 | Couchbase DCP'nin Go uygulaması. Ailesi: go-dcp-elasticsearch (83★), -kafka (71★), -couchbase, -sql, -redis, -mongodb, -cassandra, -bq. |
| kafka-konsumer | Go | 168 | 2026-11-16 | Dahili hata yönetimli Kafka tüketici kütüphanesi. |
| kafka-cronsumer | Go | 89 | 2026-10-19 | Cron tabanlı Kafka hata-tüketicisi (otomatik yeniden deneme). |
| Jdempotent | Java | 117 | 2025-09-25 | Tüketici/API için idempotency kütüphanesi. |
| kink | Go | 384 | 2025-09-25 | KinD kümelerini Kubernetes pod'u olarak yöneten CLI. |
| gaos | Go | 213 | 2025-09-25 | Kaos senaryoları için HTTP mock aracı. |
| mockingstar (+ -ios, -android) | Swift/Kotlin | 201/54/41 | 2026-11-10 | HTTP istek mock'lama / ağ hata ayıklama aracı. |
| medusa | Kotlin | 493 | 2026-07-21 | Android fragment yığın kontrolcüsü. (E-ticaret "Medusa" ile ilgisi yok.) |
| android-guidelines, ios-guidelines | — | 436 / 138 | 2026-04 / 2025-12 | Mobil mimari/kod rehberleri. |
| Transporter | C# | 60 | 2025-09-25 | Açık kaynak veri aktarım aracı. |
| PollingOutboxPublisher | C# | 31 | 2026-02-06 | Kafka için outbox (Couchbase/MSSQL/PostgreSQL). |
| gurubu | TS | 88 | 2026-11-14 | Görev tahmini / grooming aracı. |
| es-query-builder | Go | 34 | 2026-10-11 | Elasticsearch sorgu oluşturucu. |
| chaki | Go | 32 | 2026-09-28 | Go uygulama çatısı. |
| puzzle-js | TS | 25 | arşivli | Ön yüz mikroservis çatısı. |
| kafka-retry-job | C# | 28 | 2025-09-25 | Hata topic'lerinden retry topic'lerine mesaj taşıma işi. |
| go-triton-client | Go | 28 | 2025-10-14 | Triton çıkarım sunucusu için Go istemcisi. |
| trendyol.github.io | HTML | 26 | 2025-09-25 | Org sitesi. |
| micro-trendyol | — | 11 | arşivli | Hexagonal + DDD + CQRS + SAGA örnek mimari. |

Tam liste: `gh repo list Trendyol --limit 300`. Kalan ~150 repo (mobil UI bileşenleri, k8s araçları, Vault eklentileri, arşivli eski .NET kütüphaneleri) pazaryeri entegrasyonuyla ilgisizdir.

**WawiERP için yararlı olabilecekler:** go-pq-cdc ve go-dcp ailesi (olay güdümlü mimari, karar 0015 ile uyumlu), kafka-cronsumer (yeniden deneme), Jdempotent (idempotency fikri). Bunlar Trendyol API'siyle değil, kendi altyapımızla ilgili.

---

## 2. Satıcı/Marketplace API için SDK ve istemciler (hepsi topluluk; resmî yok)

Kapsam sütunu: Ü=ürün, S/F=stok-fiyat, Sip=sipariş, İ=iade, K=kargo/etiket, Q=soru-cevap, Fat=fatura, Fin=finans, W=webhook. "Bakımlı" = son commit/yayın 2026 içinde ve doküman değişikliklerini izliyor.

| Repo | Dil | ★ | Son commit | Lisans | Kapsam (README'den) | Bakımlı mı |
|---|---|---|---|---|---|---|
| **bberka/TrendyolClient.Sharp** | C# (.NET 8/9/10, Refit) | 10 | 2026-11-12 (v2.1.0) | MIT | Marketplace, International, Finance, Webhook, Global Partner, Export Center. Ü, S/F, Sip, İ (liste/oluştur/onayla/reddet/audit), Q (stage test sorusu dahil), K (ortak etiket, AB etiketi), Tazmin, Fat (link/dosya), Fin (settlements, otherfinancials, payment-order, cargo-invoice), W (CRUD+aktif/pasif). Yeniden deneme/throttle/doğrulama **bilerek yok**. | Evet, çok aktif. Canlı API'ye karşı her uçta doğrulanmadığını kendi yazıyor. |
| **zanaat-dev/lonca** | TypeScript (`@lonca/trendyol`) | 3 | 2026-11-04 | MIT | Trendyol: 14 kaynak, ~70 metot, webhook ayrıştırma, tip güvenli hatalar, retry + rate limit + sayfalama, OpenAPI spesifikasyonları. Hepsiburada ve n11 de var. "Resmî değil" notu var. | Evet. Okuma amaçlı canlı "contract probe" ile API değişimini izliyor. Kapsamı iddia edilen düzeyde mi: **doğrulanamadı**. |
| **hamzaciftci/trendyol-satici-api** | TypeScript, sıfır bağımlılık | 1 | 2026-07-06 (v3.0.0) | NOASSERTION | v2 içerik-tabanlı ürün modeli, sipariş normal + stream, origin alanı, dijital ürün alternatif teslimat, video yükleme, Q&A, platform hizmet bedeli, 429 retry/backoff. 68 test. Trendyol changelog (Mar–Haz 2026) ile uyumlu olduğunu iddia ediyor. | Yeni, aktif; tek geliştirici, düşük benimsenme. Lisans belirsiz. |
| ismail0234/trendyol-php-api | PHP | 103 | 2022-08-24 | MIT | Kısmi (README: tüm fonksiyonlar tamam değil). Sipariş aktarımı fonksiyonu var. Packagist paketi. | Hayır. 2022'den beri durmuş; eski (v1) uçlar. Tarihsel referans. |
| Hasokeyk/trendyol-php | PHP | 11 | 2025-12-19 | belirtilmemiş | Marketplace işlemleri (Basic auth: supplierId/kullanıcı/şifre). Kapsam ayrıca doğrulanmadı. | Kısmen (2025-12). |
| mustafa-m-ugur/trendyol-php-api | PHP | 20 | 2023-03-26 | — | Temel marketplace. | Hayır. |
| mustafa-m-ugur/trendyol-api-java | Java | 9 | 2025-04-22 | belirtilmemiş | Ürün servisi (ProductService örneği); diğerleri doğrulanamadı. | Hayır (2025-04). |
| altuntasmuhammet/trendyol-api-python-sdk | Python (PyPI `trendyol-api-python-sdk`) | 15 | 2023-03-22 | MIT | README'ye göre yalnız Ürün Entegrasyonu tamam; sipariş, iade, etiket, finans, Q&A işaretsiz. | Hayır. |
| myazarc/trendyol-api | TS/Node (npm `trendyol-api`) | 9 | 2021-11-22 | MIT | Promise + TS, axios. Eski (v1) uçlar. | Hayır. |
| vahaponur/trendyol-go | Go | 0 | 2026-09-27 (v0.3.0) | MIT | "Trendyol Go SDK" adlı ama Marketplace REST API istemcisi; `/v2/orders` + `ListStream`, ürün uçları; yazara göre yalnız bazı ürün uçları test edilmiş. | Yeni, erken aşama. |
| vahaponur/ty-efaturam-go | Go | 0 | 2026-07-23 | — | Trendyol E-Faturam API'si için gayriresmî Go istemcisi. | Yeni; ayrıntı doğrulanamadı. |
| YunusOzdemirr/Trendyol.SDK | C# | 0 | 2026-08-08 | — | Açıklama yok; kapsam **doğrulanamadı**. | — |
| boolxy/trendyol | PHP | 34 | 2021-03-21 | — | Eski PHP istemcisi. | Hayır. |
| 24bulut/integration-sdk | PHP | 26 | 2021-09-14 | — | Çoklu pazaryeri (Trendyol, Ticimax, n11 …). | Hayır. |
| actuallyzefe/n8n-trendyol | TS | 13 | 2025-10-22 | MIT | n8n community node (`n8n-nodes-trendyol`): ürün, sipariş vb. | Kısmen (2025-10). |
| cemre-2187/trendyol-api, cy4udev/Trendyol-Unofficial-API, wiensa/trendyol-sp-api | TS/PHP | 2-4 | 2025 | — | Küçük/belgesiz; kapsam doğrulanamadı. | Düşük güven. |

**Ruby:** Trendyol'a özgü SDK **bulunamadı** (aramada çıkmadı). org içindeki tek Ruby repo `homebrew-trendyol-tap` (Homebrew tap).
**Go dışı resmî araç:** yok. **Postman/OpenAPI:** Trendyol'un yayımladığı OpenAPI dosyası GitHub'da bulunamadı; lonca kendi derlediği OpenAPI spesifikasyonlarını `specs/` altında sunuyor (kalitesi doğrulanamadı). developers.trendyol.com `/reference` bölümü (ReadMe.io) etkileşimli API referansı barındırıyor.

---

## 3. Resmî API özeti (developers.trendyol.com, okunduğu tarih 2026-11-18)

Dokümantasyon ReadMe.io üzerinde; Türkiye sürümü `/docs`, International `/v3.0/docs`. Sayfalar "Updated N months ago" ile sürümlü; tarih içeren limit/zorunluluklar dokümanın kendi metnindendir.

### 3.1 Kimlik doğrulama ve ortamlar

| Konu | Bilgi |
|---|---|
| Yöntem | HTTP Basic Auth: supplierId (satıcı kimliği), API KEY, API SECRET. Satıcı panelinde Hesap Bilgilerim > Entegrasyon Bilgileri; yalnız master (admin) kullanıcı görür. |
| User-Agent | **Zorunlu.** Yoksa 403. Biçim: `"{SaticiId} - {EntegratorFirmaAdi}"` ya da firmanın kendi yazılımıysa `"{SaticiId} - SelfIntegration"`. Firma adı alfanumerik, en çok 30 karakter. |
| Hatalı yetki | 401, `ClientApiAuthenticationException`. |
| Üretim | `https://apigw.trendyol.com` — IP yetkilendirmesi gerekmez (ama IP engellenmiş olabilir). |
| Test (stage) | `https://stageapigw.trendyol.com` — **IP whitelist şart**; yoksa 503. Statik IP için yetkilendirme verilemiyor; ağ çıkış IP'si bildirilir. Hesap/API bilgileri üretimden **tamamen ayrı**. Ortak test hesabı veya özel hesap (e-posta, telefon, TCKN/VKN ile) satıcı bildirimi üzerinden talep edilir. Stage panel: stagepartner (tam adres sayfada kesilmişti, doğrulanamadı). Stage'de test siparişi ve test müşteri sorusu oluşturma uçları var. |
| Gizlilik | Dokümanda: API anahtarları GitHub/GitLab gibi açık yerlerde paylaşılmamalı. |

### 3.2 Hız limitleri

- Genel kural (Authorization sayfası): aynı uca 10 sn'de en çok 50 istek; 51.'de `429 too.many.requests`.
- **14 Eylül 2026'dan itibaren** ürün servislerinde grup bazlı limit (tekil uç değil). Satıcının liste limitine göre (TR: 50.000 / 75.000 / 150.000 / 500.000 / limitsiz):
  - Product Integration Read: 1000 / 1250 / 1500 / 1750 / 2000 istek/dk
  - Product Integration Write (yarat, güncelle, sil, arşivle, kilit kaldır, marka yarat, buybox): 200 / 300 / 400 / 500 / 600 istek/dk
  - Inventory & Price Write (stok-fiyat): 350 / 500 / 1000 / 1500 / 2000 istek/dk
  - Aynı barkod için fiyat güncelleme: en çok 30 istek/dk; aşarsa batch sonucunda o barkod için hata.
- Sipariş (alt-limit sütunları farklı düzeyler): sipariş paketlerini çekme 30–100/dk; paket statü bildirimi 300/dk → limitsiz; tedarik edememe, bölme, desi bildirimi, kargo firması değiştirme 100→limitsiz; iade çekme 1000/dk; iade onay ve ret 5/dk; finans cari hesap 100/dk.
- Yukarıdakiler dokümandaki tabloların özetidir; limit sütunlarının hangi seviyeye karşılık geldiği tabloda başlık-hücre eşleşmesi kesin okunamadı. Uygulamadan önce ilgili sayfadan (`/docs/1-servis-limitleri`) kontrol edin.

### 3.3 Uç nokta özeti (hepsi `https://apigw.trendyol.com` altında; `{sellerId}` = supplierId)

| Alan | Yöntem + yol |
|---|---|
| Marka listesi | GET `/integration/product/brands` |
| Marka yarat | POST `/integration/product/sellers/{sellerId}/brands` |
| Kategori ağacı | GET `/integration/product/product-categories` |
| Kategori özellikleri (v2) | GET `/integration/product/categories/{categoryId}/attributes` |
| Özellik değerleri (v2) | GET `/integration/product/categories/{categoryId}/attributes/{attributeId}/values` |
| Ürün yarat (v2) | POST `/integration/product/sellers/{sellerId}/v2/products` |
| Onaysız ürün güncelle | POST `.../products/unapproved-bulk-update` |
| Onaylı ürün güncelle | POST `.../products/content-bulk-update`, `.../variant-bulk-update`, `.../delivery-info-bulk-update` |
| **Stok ve fiyat** | POST `/integration/inventory/sellers/{sellerId}/products/price-and-inventory` |
| Ürün sil / arşivle / kilit kaldır | DELETE `.../products`; PUT `.../products/archive-state`; PUT `.../products/unlock` |
| Toplu işlem sonucu | GET `.../products/batch-requests/{batchRequestId}` |
| Ürün filtre | GET `.../product/{barcode}`, `.../products/unapproved`, `.../products/approved`, `.../products/approved/inventory-and-price` |
| Buybox, QC durumu, video | POST `.../products/buybox-information`; GET `.../products/{contentId}/update-audits`; POST `/integration/video/sellers/{sellerId}/videos` |
| **Sipariş paketleri** | GET `/integration/order/sellers/{sellerId}/orders` (ve `/v2/orders`); akış: GET `.../orders/stream` |
| Paket statü (Picking/Invoiced) | PUT `.../shipment-packages/{packageId}` |
| Bölme | PUT `.../shipment-packages/{packageId}/split`, `/multi-split`, `/quantity-split`, `/split-packages` |
| Desi/koli, tedarik edememe, kargo firması değiştirme | PUT `.../{packageId}/box-info`, `/items/unsupplied`, `/cargo-providers` |
| Adresler | GET `/integration/sellers/{sellerId}/addresses` |
| **İade (claims)** | GET `/integration/order/sellers/{sellerId}/claims`; POST `.../claims/create`; PUT `.../claims/{claimId}/items/approve`; POST `.../claims/{claimId}/issue` |
| **Soru-cevap** | GET `/integration/qna/sellers/{sellerId}/questions/filter`; POST `.../questions/{id}/answers` |
| **Fatura** | POST `/integration/sellers/{sellerId}/seller-invoice-links`; POST `.../seller-invoice-file` |
| Ortak etiket | POST `/integration/sellers/{sellerId}/common-label/{cargoTrackingNumber}` (alma servisi ayrı) |
| **Finans** | GET `/integration/finance/che/sellers/{sellerId}/settlements`, `/otherfinancials`, `/payment-order`, `/cargo-invoice/{serial}/items` |
| Tazmin | GET `/integration/tex/compensation/sellers/{sellerId}/tickets` |
| **Webhook** | POST/GET/PUT/DELETE `/integration/webhook/sellers/{sellerId}/webhooks` (aktif/pasif ayrı uç) |

Webhook ayrıntıları (dokümandan): yalnız sipariş paketi statüleri (CREATED, PICKING, INVOICED, SHIPPED, CANCELLED, DELIVERED, UNDELIVERED, RETURNED, UNSUPPLIED, AWAITING, UNPACKED, AT_COLLECTION_POINT, VERIFIED); her istek tam sipariş verisi taşır; yetki BASIC_AUTHENTICATION veya API_KEY (başlıkta `x-api-key`); hata olursa 5 dakikada bir tekrar, sonra webhook pasife alınır ve e-posta gelir; satıcı başına en çok 15 webhook; URL'de "Trendyol", "Dolap", "Localhost" geçmemeli; Trendyol yine de `getShipmentPackages` ile periyodik uzlaştırma öneriyor.

Ek notlar: Ürün yazma işlemleri **asenkron** (200 = kuyruğa alındı; sonuç `batchRequestId` ile sorgulanır). `/v2/orders` için dokümanda sayfalama/stream ayrımı var; eski `/orders` ucu hâlâ listede. International (v3.0) dokümanı aynı yapıda ancak ayrı limit sütunlarına sahip; TR için bu kataloğun Bölüm 3.2'si geçerlidir.
Dokümandaki bölüm başlıkları: "Hata Kodları", "Sipariş Süreci Akışı", "İade Süreci Akışı", "Trendyol E-Faturam Entegrasyonu", "Trendyol Akademi", "Pazaryeri İş Modelleri", `/changelog`. Bunlar WawiERP tasarımı için ayrıca okunmalı.

---

## 4. Diğer Trendyol bağlantılı açık kaynak

**Entegratör/eklenti (hepsi topluluk, düşük yıldız):**

| Platform | Repo | Dil | ★ | Son push | Not |
|---|---|---|---|---|---|
| WooCommerce | Hasokeyk/woocommerce-trendyol | PHP | 10 | 2023-01-01 | Eski. |
| WooCommerce | alexandrubala/trendyol-sync-for-woocommerce | PHP | 4 | 2026-06-16 | v1.2.2; arka planda ürün senkronu, şifreli anahtar saklama, yerel/International. GPL-2.0. |
| WooCommerce | geonolis/woo-trendyol | PHP | 1 | 2026-11-15 | Trendyol International hesabı; kategori/marka eşleme. |
| WooCommerce | durasi/isarud-woocommerce, pazarus/woocommerce-pazaryeri-entegrasyonu | PHP | 6 / 2 | 2026 | Çoklu pazaryeri eklentileri; ayrıntı doğrulanamadı. |
| Shopify | ibidi/trendyol-shopify (React), akadirgunduz/shopify-trendyol-bridge (Python/FastAPI) | — | 3 / 1 | 2025-03 / 2026-04 | Stok-fiyat köprüsü. |
| ERPNext | logedosoft/Trendyol-ERPNext-Integration | Python | 1 | 2026-08-20 | Frappe uygulaması: sipariş, stok, fatura. MIT. WawiERP'ye en yakın kavramsal örnek. |
| Odoo | Medicom-Bilisim/Odoo-Trendyol-Entegrasyon | Python | 0 | 2026-04-13 | Açıklama yok. |
| Mikro ERP | mmustafasenoglu/MikroBridge, dgknozcn/Trendyol-MikroERP-Entegrasyon | — | 1 / 0 | 2026 | WooCommerce/Trendyol/Hepsiburada siparişlerini Mikro'ya aktarır. |
| ERP köprüsü | forint573/erp-integrator-vortex | JS | 2 | 2026-06-24 | Çok kiracılı ERP-pazaryeri entegratörü; ayrıntı doğrulanamadı. |
| Komisyon/finans | karabeyogluonur/trendyol-komisyon-hesaplama | C# | 4 | 2026-01-10 | Sipariş/finans/komisyon otomasyonu (.NET). |
| n8n | actuallyzefe/n8n-trendyol | TS | 13 | 2025-10-22 | Bkz. Bölüm 2. |
| OpenCart, Magento, PrestaShop | — | — | — | — | Anılan sorgularla Trendyol'a özgü repo **bulunamadı** (arama sınırı nedeniyle yok demek değildir). |

**Trendyol Go / Yemek / Express:** `RFKaya/Trendyol-Yemek-API` (JS, 2★, 2024-07; Yemek restoran değerlendirmesinde webhook bildirimi) ve `ertunckoybasi/MediatR_Cqrs_APi` (2022) dışında anlamlı bir Go/Express SDK'sı bulunamadı. `vahaponur/trendyol-go` adına rağmen Marketplace API istemcisi. Trendyol Go'nun ayrı geliştirici portalı (tahmin: tgoapis) erişilemedi, **doğrulanamadı**.

**Scraper / veri projeleri (resmî API dışı, ToS riski):** çok sayıda küçük repo; öne çıkanlar `omkarcloud/trendyol-scraper` (2026-11-17, 2★), `OmBayus/Trendyol-Web-Scraping` (15★), fiyat takip botları (`erkamesen/zara-trendyol-takip` 9★, `furkandlkdr/telegram-trendyol-bot`), yorum çekiciler (`AhmetFurkanDEMIR/Trendyol-Product-Comments` 14★ vb.). WawiERP için önerilmez: canlı site yalnız okuma ve seyrek kullanım kuralı geçerli.

**Faydalı ek kaynak:** `3rt4nm4n/turkish-apis` (521★, 2026-11-17): Türk API'lerinin derlemesi; Trendyol dahil olup olmadığı ayrıca kontrol edilmedi.

**Mühendislik blogu:** `medium.com/trendyol-tech` (docs sayfasının altbilgisinde bağlantılı); kod örnekleri org repolarında (go-dcp, kafka-cronsumer, stove vb.). Blog içeriği taranmadı.

**Yapay zekâ:** `Trendyol/trendyol-integration-developer-tool` (Bölüm 1.1) ve `n8n` node dışında, topluluk repolarından `Taykuth/seo-ai-trendyol-product-description` (Seller API → OpenAI → Excel) gibi tekil örnekler var.

---

## 5. WawiERP için öneri

**Karar önerisi: hazır SDK'yı bağımlılık yapma; ince, kendi istemcimizi yaz, ama topluluk SDK'larını ve OpenAPI'yi referans/test kaynağı olarak kullan.**

Gerekçe:
1. Resmî SDK yok. Hepsi tek geliştiricili, "gayriresmî" projeler. Trendyol 2026'da sık değişiklik yapıyor (v2 içerik modeli, origin alanı 30 Haz 2026, ürün limitleri 14 Eyl 2026, sipariş v2/stream). Eski SDK'lar (ismail0234, myazarc, python-sdk) bu değişikliklerin gerisinde, 2021–2023'te durmuş.
2. Ürün sinyali zayıf: en yıldızlı güncel SDK 10 yıldızlı. Bakım riski yüksek; lisans (hamzaciftci: NOASSERTION) ve kapsam doğrulaması belirsiz.
3. ERP'nin gerçek ihtiyacı SDK'nın verdiğinden fazlası: grup bazlı hız limiti (300/dk gibi), asenkron batch sonucu takibi, idempotent yeniden deneme, webhook + periyodik uzlaştırma, çok satıcı kimliği, User-Agent kuralı. Bunlar zaten iş mantığı; SDK'lar çoğunlukla bunu yapmıyor (TrendyolClient.Sharp "retry/throttle yok" diyor).
4. Karar 0015 (olay güdümlü agent katmanı) ile uyum: kendi ince katmanımız webhook + kuyruk + uzlaştırmayı doğal biçimde taşır.

Pratik yol:
- **Referans/başlangıç:** dil seçimi bize bağlı. TypeScript/Node tarafındaysak `zanaat-dev/lonca` (MIT, aktif, retry/rate limit/sayfalama + OpenAPI spesifikasyonu, webhook ayrıştırma) en olgun adaydır; bir bağımlılık olarak "pin'lenmiş sürüm + fork edebilme" koşuluyla düşünülebilir. .NET'te `bberka/TrendyolClient.Sharp` en geniş ve en temiz tip kapsamına sahip.
- Hiçbirini körü körüne üretime almadan önce: stage'de (IP whitelist alındıktan sonra) uçlar için duman testi; yanıt şemalarını resmî dokümanla karşılaştırma; lisans kontrolü.
- Kendi katmanımızda zorunlu parçalar: Basic auth + `"{sellerId} - SelfIntegration"` User-Agent; grup bazlı token-bucket (ürün okuma/yazma/stok-fiyat ayrı; barkod başına 30/dk fiyat limiti); batch sonuç sorgulama; webhook alıcısı (basic/api-key, 5 dk yeniden deneme varsayımı, kopya olay toleransı) + `getShipmentPackages`/stream ile periyodik uzlaştırma; anahtarları Cognee/grafiğe/repoya yazmama.
- Trendyol'un `trendyol-integration-developer-tool` MCP eklentisi geliştirme yardımcısı olarak denenebilir (yalnız ürün alanını kapsıyor, MCP uç nokta erişimi Trendyol izni gerektirebilir).
- Açık sorular (doğrulanmalı): Trendyol OpenAPI/Postman dosyasını resmî olarak yayımlıyor mu (ReadMe `/reference` sayfasından dışa aktarılabilir mi); lonca'nın iddia ettiği ~70 metodun gerçek kapsamı; webhook'un sipariş dışı olayları (iade, soru) kapsayıp kapsamadığı (dokümana göre yalnız sipariş paketi).
