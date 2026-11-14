# WawiERP Panel — Finans ve Yönetim

Tarih: 2026-11-14 · Kaynak: canlı panel (sistem yöneticisi oturumu), yalnız okuma; DOM'dan form/alan/`erp_action` okundu, hiçbir düğmeye basılmadı. Üst harita: `raw/panel-harita.md`. Ön yüz mimarisi: `05-on-yuz-mimarisi.md`.

Gizlilik notu: kişi adı, e-posta, telefon, PIN, adres, vergi no ve tek tek müşteri bakiyeleri bu dosyaya bilerek yazılmadı. Sayılar toplamdır.

## Özet

- Finans alanı sekiz sayfadan oluşuyor: `customers-master` (B2B cari + toptan satış), `invoices` (4 görünümlü fatura listesi), `accounting` (ön muhasebe / sipariş özeti / dışa aktarım), `finance-documents` (çıkış belgesi defteri), `team`, `pin-permissions`, `erp-features`, `audit-logs`.
- Belge zinciri: sipariş (pazaryeri/Shopify) → **yasal şirket adına** satış faturası (`RE-<şirket>-<yıl>-<sıra>`) → PDF / müşteriye gönder → gerekirse iade faturası (`RET-<sipariş>-<n>`). Belgeler `finance-documents` defterinde, fatura listesi aynı kayıtların filtreli görünümü.
- Veri hacmi: Almanya Warehouse (id 2) defterinde **1.763 belge** (1.716 satış faturası + 47 iade kaydı = 1.763; şirketler arası 0, "sevk belgesi" KPI'si 0 olduğu halde iade kayıtları defter satırında "SV / depo sevk belgesi" rozetiyle çiziliyor; fatura listesindeki 1.751 satış faturası ile KPI'daki 1.716 arasındaki 35 farkın nedeni görülemedi); kesinleşmiş toplam 181.887,80 EUR + 3.646,14 CZK. Tüm depolarda 1.751 satış faturası listesi, 47 iade faturası, 1 tedarikçi faturası, 0 kargo faturası.
- Yönetim: 16 çalışan kaydı, PIN ile giriş, rol + depo kapsamı. PIN/yetki oluşturma sayfası ayrı bir "master PIN" ister; yönetici oturumu bu sayfaya giremiyor.
- Denetim kaydı 83.070 satır; son 7 günde 21.969 kayıt, 727 "engellendi", 5.199 hata. Saklama: işlem 180 gün, hata 30 gün.
- En önemli sorunlar: toptan satış taslak/fatura listeleri "hazırlanıyor…" durumunda takılı; muhasebe sayfası 41 kanalda 0 sipariş gösteriyor; KDV özeti sabit %19; iade faturaları defterde "depo sevk belgesi" olarak etiketli; denetim günlüğü rutin API çağrılarıyla (dhl-labels) doluyor.

## Ekranlar

Depo kimlikleri (select seçeneklerinden): 1 Istanbul, 2 Almanya, 3 Hollanda, 2881 Mega B, 2882 Technowelt Almanya. Şirket kimlikleri: 1 Lady Empire GmbH, 2 Novada Shops, 1196 Woida, 2269 İthal Koku, 2286 Parfumkoopjes BV, 2287 Elec_texx, 2288 Ivobuyshop, 2289 DOCSER, 2290 Perasshop, 2291 Technowelt, 2292 Stockist24, 2293 Kaufplus.

### 1. `customers-master` — Toptan satış ve cari
- Amaç: B2B (toptan) müşteri carileri, onlara satış, fatura yayınlama ve tahsilat kaydı.
- URL parametreleri: `customer` (seçili cari id), `customer_page`, `invoice_page`, `payment_page`, `location_page`, `user_page`, `customer_warehouse_page`, `customer_company_page`, `customer_q`, `warehouse`, `new_customer=1`, `view=wholesale` + `new=1` | `records=draft` | `records=issued`.
- Başlıklar/sayaç: "48 cari · 48 aktif hesap"; liste sayfa başına 25, 2 sayfa. Sol liste kartları (baş harfler + cari kodu `RET-INV-<n>` biçiminde), sağ detay paneli.
- Detay sekmeleri/bölümleri: Hesap özeti · Faturalar · Tahsilatlar · Cari bilgileri · Lokasyonlar ve müşteri portalı ("İsteğe bağlı işlemler").
- Cari bakiye tablosu sütunları: TARİH · REFERANS / AÇIKLAMA · BORÇ · TAHSİLAT / ALACAK. Kural metni: "Müşterinin borcu = satış faturaları − tahsilatlar. Para birimleri birbirine eklenmez." (para birimi başına ayrı bakiye).
- Cari rozetleri: AKTİF; fatura kartında "CARİ KAYDI EKSİK" (+ "Eksik cari kaydını tamamla" düğmesi); alanlar boşsa VERGİ/KAYIT, E-POSTA, TELEFON "—".
- Düğmeler: Ara · ＋ Yeni cari · ＋ Yeni toptan satış · Taslaklar · Satış faturaları · Bu müşteriye toptan satış → · Faturayı görüntüle / PDF · Kart / fatura bilgilerini düzenle · Teslimat lokasyonu ekle → · Tahsilat: Ödemeyi kaydet · yeni cari: Cariyi kaydet.
- Formlar (alanlar): cari düzenle (görünen ad, yasal ad, vergi no, sicil no, e-posta, telefon, fatura adresi); lokasyon ekle (kod, ad, depo, adres; depo seçenekleri 0/1/2/3/2881/2882); portal kullanıcısı ekle (ad, giriş e-postası, portal parolası, `can_adjust_stock` onay kutusu); tahsilat (tarih, para birimi EUR/TRY/USD/GBP/CZK/PLN, tutar, referans, açıklama); yeni cari (ad, şirket (12 seçenek), cari kodu, yasal ad, vergi no, sicil no, e-posta, telefon, fatura adresi).
- Toptan satış sihirbazı (`view=wholesale&new=1`): "Cari ve satış deposu" adımı; mevcut cari seç veya yalnız ad+şirketle yeni cari aç; "Satıcı şirket" (12) → "Stok çıkış deposu" (şirket seçilince dolar) → "Cariyi kaydet ve ürünlere geç". Sihirbazın ilerisi (ürünler, doğrulama, kesinleştirme) `wholesale-sales.js` ile istemcide çizilir; JS içinde adımlar: save_customer, products, save, finalize, cancel, state, create (bkz. 05).
- Taslaklar / Satış faturaları listesi (`records=draft|issued`): sayfa yalnızca "Toptan satış hazırlanıyor…" gösterdi, 3+ saniye sonra da değişmedi; ağ günlüğünde `wholesale-sales.php?action=state&id=0&customer=0` isteği yanıt alamamış görünüyor. Bu iki ekranın içeriği **görülemedi**.
- Başka sayfalara bağlantılar: yok (yalnız kendi alt görünümleri). Fatura kartı "Faturayı görüntüle / PDF" ile fatura belgesini açar.
- Boş/hata durumu: liste "hazırlanıyor…" ile takılıyor (yukarıda).

### 2. `invoices` — Fatura ve gönderim (4 görünüm)
- Amaç: oluşturulmuş faturaları listelemek; siparişten fatura üretme sihirbazına giriş.
- URL parametreleri: `view=orders|returns|purchases|shipping`, `warehouse`, `all` (0 = seçili depo, 1 = tüm depolar), `status` (issued, draft, cancelled), `q`, `from`, `to`, `p` (sayfa), `task=prepare` (siparişten fatura), `lang`.
- Varsayılan `warehouse=1` (Istanbul) listesi **boş** ("Bu depoda kayıtlı fatura yok"); faturalar Almanya deposunda (id 2). `all=1` ile 1.751 kayıt, 71 sayfa × 25. "Tüm depolarda göster →" bağlantısı var.
- **Satış faturaları** (`view=orders`): sütunlar FATURA / TARİH · MÜŞTERİ / DÜZENLEYEN · TUTAR · BELGE DURUMU · İŞLEMLER. İlk sayfanın 25 satırı da "Kesinleştirildi". Numara öneki `RE-LE-2026-` (LE = Lady Empire). Satır eylemleri: **PDF / gönder**; "İşlemler" menüsü: Faturayı düzenle · İade faturası oluştur. Sıralama "Tarihe göre · En yeni önce".
- **Siparişten fatura oluştur** (`task=prepare`): "SİPARİŞ → ŞİRKET FATURASI → PDF / YAZDIR → MÜŞTERİYE GÖNDER" akışı; "Sipariş fatura merkezi" metni: eBay, Metro ve bağlı mağaza siparişleri; her fatura siparişin şirketine ait; mevcut fatura varsa ikinci kez oluşturulmaz; "Pazaryeri fatura aktarımı · durum ve işlem günlüğü" bölümü; sipariş numarası ile arama ("Siparişleri bul"), Önceki/Sonraki. Liste "Siparişler yükleniyor…" ile sunucudan JS ile gelir (görülemedi).
- **İade faturaları** (`view=returns`): aynı sütunlar; 47 kayıt; tutarlar negatif (örn. −46,48 EUR); numara `RET-<sipariş>-<n>`; satır eylemleri: PDF / yazdır · İade faturasını iptal et. Başlık düğmesi: "İade için satış faturası seç".
- **Tedarikçi faturaları** (`view=purchases`): sütunlar FATURA / TARİH · TEDARİKÇİ · TUTAR · ÖDEME · İŞLEMLER; 1 kayıt (tutar 0,00 EUR, ödeme "Ödenmedi", "PDF / görsel ekle"); başlıkta "+ Tedarikçi faturası ekle". Form `erp_action=attach_purchase_document`.
- **Kargo faturaları** (`view=shipping`): 0 kayıt; açıklama: DHL ve PostNL gider faturaları burada görünür; "Diğer işlemler"den gönderi etiketlerine gidilir.
- Ortak üst menü ("Diğer işlemler"): Satış faturaları · İade faturaları · Tedarikçi faturaları · Kargo faturaları · Fatura ara.
- Bağlantılar: `finance-documents` (belge ayrıntısı ve "yeni satış faturası"), `customers-master` (toptan satış), `finance-documents&document_type=sales_invoice#new-finance-document`.
- Sayılar: 1.751 satış faturası (tüm depo), 47 iade, 1 tedarikçi, 0 kargo.

### 3. `accounting` — Ön muhasebe ve belge merkezi
- Amaç: depo → şirket → kanal kapsamı seçip sipariş bazlı satış özeti, KDV özeti ve dışa aktarım; belge merkezlerine kısayol kartları.
- Kısayol kartları: Satın alma (Alış faturası ve irsaliye → `purchases`), Çıkış belgesi (→ `finance-documents`), Stok senkronu (→ `warehouse-home#sales-stock-sync`), Denetim (→ `audit-logs`).
- Kapsam seçici: 5 depo · 11 şirket · 41 kanal; her biri arama + sayfa boyutu (12/25/50; kanal 20/50) + liste; "Kapsamı uygula / temizle". Seçim GET parametreleri `accounting_warehouses[]`, `accounting_companies[]`, kanal onay kutuları.
- Sipariş filtreleri (GET): `order_date_range` (all, today, …), `order_status` (all, new, processing, complete, cancelled), `order_payment` (all, paid, card_paid, bank, bank_paid, bank_unconfirmed, pending, refunded, partial_refund, partial_paid), `order_q`, `order_from`, `order_to`, `order_limit` (all), `order_custom_limit`, `order_page_size` (25/50), `order_page`.
- POST formu (kapsam + `from`, `to`, `warehouse`, `company`, `source`, `timezone` Europe/Berlin|UTC) üç dışa aktarım düğmesi taşır: `export=csv` (CSV Aktarımı), `export=excel` (Excel Aktarımı), `export=datev` ("Muhasebe CSV").
- Kanal kartları: her kanal için "Sipariş · bağlantı durumu", "Katalog · …", "Bu sayfada N sipariş · Satılan adet · tutar · son kontrol", "Hesabı aç" / "Bağlantıyı yönet" / "Siparişleri al". Toplu: "Bu sayfadaki kanallardan al (20)", "…bağlı kanallardan al (14)" (en fazla 50 kanal).
- KPI'lar: TOPLAM SİPARİŞ 0 · TEKİL MÜŞTERİ 0 · SATILAN ADET "0 + eksik kaynak" · BRÜT SATIŞ 0,00 EUR · AKTİF KANAL 41 · TOPLAM STOK 2.082.838 · KÂR / ZARAR "—" ("Maliyet, komisyon, kargo ve iade verisi bekleniyor").
- Sipariş tablosu sütunları: SİPARİŞ · ÜRÜN · TARİH · TUTAR · İŞLEM; boş durum: "Satış kanallarından alınmış sipariş kaydı bulunmuyor."
- KDV / MwSt satış özeti: "sipariş tutarları üzerinden %19 oranıyla hesaplanır"; NET SATIŞ ve KDV değerleri "—" ("Vergi dahil/hariç kaynak ayrımı gerekli", "doğrulanmış vergi alanı bekleniyor").
- Aktarım hazırlığı: SİPARİŞ KAYDI · AKTARIMA HAZIR · İADE (hepsi 0).
- Kanal durum metinleri (örnek): "Bağlantı kontrolü gerekli", "Bağlı · henüz sipariş yok", "JTL sipariş kaynağı", "Ürün kataloğu bağlı".

### 4. `finance-documents` — Çıkış belgesi merkezi
- Amaç: satış faturası, şirketler arası fatura ve depolar arası sevk belgesi kaydı ve defteri.
- URL parametreleri: `warehouse`, `document_page`, `document_type` (sales_invoice, intercompany_invoice, warehouse_dispatch), `document_status` (draft, issued), `q`, `finance_document` (belge id; ayrıntıyı açar), `finance_line_page`, `finance_company_page`, `finance_target_page`, `finance_recipient_company_page`, `finance_employee_page`, `lang`.
- KPI kutuları: TOPLAM BELGE (+ taslak sayısı) · SATIŞ FATURASI · ŞİRKETLER ARASI · SEVK BELGESİ · KESİN FATURA TOPLAMI ("yalnız kesinleştirilenler", para birimi başına ayrı). Depo 1: hepsi 0; depo 2: 1.763 / 1.716 / 0 / 0.
- Yeni belge formu (`erp_action=add_outbound_document`; "Yönetici işlemi · işlem günlüğüne kaydedilir"): belge türü, düzenleyen yasal şirket (12), belge numarası, belge tarihi, vade tarihi, para birimi (EUR/TRY/USD/GBP), durum (Taslak/Kesinleştirildi), hedef depo (sevk), alıcı şirket (şirketler arası), müşteri/alıcı adı, vergi no, e-posta, fatura adresi, belge notu; kalem satırları: ERP ürünü, açıklama, miktar, birim fiyat, KDV %. En fazla 50 satır. "Hesaplanan toplam" kalemlerden. Metin: "Stok miktarı değişmez"; "İşlemi yapan, giriş yaptığınız PIN'den otomatik kaydedilir: isim varsa isim, yoksa PIN'in yalnız son 2 hanesi."
- Defter satırı alanları: tür rozeti (SF = satış faturası, SV = sevk), numara, düzenleyen → alıcı, DURUM, KALEM (satır · adet), TOPLAM, SORUMLU ("PIN ••nn" ya da "Yönetici"), "Belge ayrıntısını göster".
- Belge ayrıntısı (GET `finance_document=<id>`): düzenleyen (şirket + KDV no), alıcı/hedef, işlemi yapan, **kaynak sipariş no** ("Sipariş: #…"), kalem tablosu KALEM · MİKTAR · BİRİM (net fiyat) · KDV · TOPLAM (brüt). Örnek: net 46,20 EUR × %19 = 54,98 EUR. Düğmeler: "PDF görüntüle / müşteriye gönder", "Faturayı düzenle", "Seçili belge satırlarını yenile →", "Satırlarda ara".
- Bağlantılar: `purchases#new-purchase-document`, `shipments`, `accounting`.

### 5. `team` — Çalışan erişimleri
- Amaç: çalışan rolleri, PIN durumu ve depo erişimini listelemek (salt okunur). Altbaşlık: "ÇALIŞAN · PIN · DEPO YETKİSİ".
- Parametreler: `team_q` (arama), `team_page`, `team_page_size` (25/50). "16 çalışan", sayfa 1/1; "Sunucudan sayfa başına en fazla 50 kayıt".
- Kart alanları: kısaltma, ad, rol etiketi, kapsam etiketleri, PIN durumu rozeti (PIN AKTİF · PIN AYARLA), depo adları. Alt not: "Ana yönetici erişimi: Aktif".
- Formlar/eylemler: arama ve sayfa gezgini dışında **hiç yazma formu yok**; `erp_action` yok. PIN oluşturma `pin-permissions`'ta.
- Yetki ayrıntısı bir sonraki bölümde.

### 6. `pin-permissions` — PIN ve Yetki
- Amaç: kullanıcı PIN'i ve depo yetkisi oluşturma (master yönetim).
- Sayfa yalnızca bir kapı gösteriyor: "Bu menüye ulaştınız. Kullanıcı PIN'i ve depo yetkisi oluşturmak için master yönetici girişi gereklidir."
- Formlar: `erp_action=master_reauthenticate` (alan: master PIN, parola türünde; düğme "Master oturumunu aç") ve `erp_action=logout` ("Çıkış yap ve master ile giriş yap").
- Master PIN girilmediği için sayfanın asıl içeriği **görülemedi**.

### 7. `erp-features` — ERP özellikleri
- Amaç: modül kataloğu / yol haritası (statik bilgi sayfası, form yok). Sayaçlar: ERP MODÜLÜ 28 · KULLANIMA HAZIR 20 · HAZIRLANAN 8.
- Gruplar ve modüller: Depo ve stok (depo ağı ve şirket hiyerarşisi; ürün/barkod/depo stokları; stok dağıtımı ve transfer; sevkiyat/yolda stok/mal kabul; alt depo ürün alımı ve geri dönüş; lot-seri-SKT *hazırlanıyor*) · Satış ve kanal (çoklu şirket/kanal hesapları; siparişler-müşteriler-kanal ürünleri; satış stok senkronu; iade ve kalite kontrol *hazırlanıyor*; CRM ve satış sonrası *hazırlanıyor*; B2B müşteri portalı ve müşteri stoğu) · Satın alma (tedarikçi/alış faturası/irsaliye; satış faturası ve şirketler arası belge; satın alma siparişi ve üçlü eşleştirme *hazırlanıyor*; tedarikçi maliyet geçmişi) · Finans (satış finans özeti; çıkış belgesi defteri; KDV/MwSt özeti; müşteri cari ve tahsilat; banka ekstresi ve mutabakat *hazırlanıyor*; yevmiye-hesap planı-DATEV *hazırlanıyor*; stok değerleme ve kârlılık *hazırlanıyor*) · Yetki ve denetim (depo yetkilisi/PIN/çalışma alanı; platform bağlantıları; işlem günlüğü; kritik stok ve senkron takibi; ayrıntılı görev izinleri *hazırlanıyor*).
- Bağlantılar: `warehouse-home`, `shipments`, `purchases`, `customers-master`, `finance-documents`, `accounting`, `audit-logs`.

### 8. `audit-logs` — İşlem ve hata kayıtları ("Kim, neyi, ne zaman yaptı?")
- Amaç: kritik ERP işlemlerinin ve hataların denetim izi.
- Üstte: "OTOMATİK BAKIM · Haftalık temizlik · İşlem kayıtları 180 gün, hata kayıtları 30 gün saklanır." Son 7 gün: toplam 21.969 · başarılı 16.021 · engellenen 727 ("Yetki ve güvenlik") · hata 5.199 ("Hata ve kritik kayıt"). Toplam: 83.070 kayıt, 1.662 sayfa × 50.
- Filtreler (GET): `q`, `outcome` (success=Başarılı, failure=Hata, denied=Engellendi), `severity` (info, warning, error, critical), `category` (security=Güvenlik, inventory=Ürün ve stok, catalog=Katalog, organization=Organizasyon, purchasing=Satın alma, finance=Finans ve belgeler, integration=Bağlantılar, system=Sistem), `warehouse`, `from`, `to`, `log_page`. Düğmeler: Filtreleri temizle · Kayıtları getir · Tümünü Gör · Önceki/Sonraki · Git. "Depolar 20'şer kayıt yüklenir."
- Kayıt alanları: tarih, saat (Türkiye saati), sonuç rozeti (✓ Başarılı / × Hata / engellendi), önem, olay adı, modül, kullanıcı (PIN son 2 hane maskeli), oturum türü ("Ana yönetici oturumu"), depo · şirket ("Genel sistem" olabilir), kaynak ("ERP işlemi"), nesne türü (örn. `outbound_document`), IP, ağ geçidi ("cloudflare"), "Ayrıntıyı göster".
- Gözlenen olay adları: "API işlemi · orders-export", "API işlemi · dhl-labels" (Bağlantılar), "Fatura veya sevk belgesi kaydetme" (Finans ve belgeler; başarılı ve hatalı örnekleri var; 1.708 finans kaydı), "Oturum açıldı" (Güvenlik, Bilgi), "Yetkisiz API erişimi engellendi" (Güvenlik, Uyarı). Güvenlik kategorisi 4.854 kayıt.

## Yetki modeli

Gözlenenler (`team`, `pin-permissions`, `erp-features`, `audit-logs`, `finance-documents`):

- **Giriş:** harita ve metinlere göre e-posta+şifre ya da PIN. `erp-features`: "Çalışan PIN ile girer; tüm ağ veya tek depo kapsamı ve ürün-stok yetkisi oturuma uygulanır." Belge ve denetim kayıtlarında kullanıcı **PIN'in son iki hanesiyle** gösterilir (isim tanımlıysa isim). E-posta girişiyle gelen yönetici oturumu "Yönetici" / "Ana yönetici oturumu" olarak görünüyor. PIN ile e-posta girişinin aynı kullanıcı kaydında nasıl birleştiği ekranlardan **anlaşılamadı** (PIN yönetimi master sayfasının arkasında).
- **Roller (team ekranında görülen rol etiketleri):** Sistem yöneticisi · Kategori atama yöneticisi · Kategori sorumlusu · Depo sorumlusu · Depo çalışanı · Wawi operasyon · Ürün giriş operatörü. Çalışan sayısı 16; kimi rol adı aynı zamanda kullanıcı adı olarak da kullanılmış (rol etiketi ile ad aynı: örn. "Depo Sorumlusu", "Ürün Operatörü").
- **Kapsam etiketleri:** "Tüm depolar" (ağ geneli) · "Çoklu depo yetkisi" · "Depo erişimi" / "Depo seçimi" (tek veya seçili depo) · belirli depo adları (Almanya Warehouse, Hollanda Warehouse) · yetki türü etiketleri "Ürün ve stok", "Görüntüleme".
- **PIN durumu:** PIN AKTİF veya PIN AYARLA (henüz PIN verilmemiş).
- **Master ayrımı:** PIN oluşturma ve depo yetkisi atama yalnızca "master" oturumuyla; sistem yöneticisi oturumu `pin-permissions` kapısında master PIN istiyor. Team ekranı "Ana yönetici erişimi: Aktif" der.
- **Navigasyon filtreleme:** kenar menü izin filtreli sunucuda çiziliyor (JS yorumları: "permission-filtered sidebar"); denetimde "Yetkisiz API erişimi engellendi" olayı yetkisiz uç çağrılarının sunucuda reddedildiğini gösteriyor.
- **Planlanan:** "Ayrıntılı görev izinleri — hazırlanıyor" (satın alma, senkron, finans, onay için görev bazlı profiller). Yani bugün granül görev izni yok (erp-features'a göre).
- **Müşteri portalı yetkisi:** B2B müşteriler ayrı portal kullanıcısıyla yalnız kendi lokasyon stoğu, fatura ve cari hareketlerini görür; kullanıcıya `can_adjust_stock` onay kutusu verilebilir.

## Varlıklar ve durumlar

| Varlık | Anahtar / numara | Durumlar | Notlar |
|---|---|---|---|
| Satış faturası | `RE-<şirket kodu>-<yıl>-<6 hane>` (örn. LE = Lady Empire); eski ön ek `WAWI-LE-<yıl>-<6 hane>` | Taslak (draft) · Kesinleştirildi (issued) · İptal (cancelled) | Düzenleyen = yasal şirket; kaynak sipariş no belgede; KDV satır bazında (gözlenen %19) |
| İade faturası | `RET-<sipariş no>-<n>` | aynı üç durum | Negatif tutar; "İade faturasını iptal et" eylemi; defterde "DEPO SEVK BELGESI" etiketiyle görünüyor |
| Şirketler arası fatura | serbest numara | draft / issued | Farklı yasal şirketler arası; 0 kayıt |
| Depolar arası sevk belgesi | serbest numara | draft / issued | Aynı şirketin depoları arası; stok miktarını değiştirmez |
| Tedarikçi faturası | serbest numara | ödeme: Ödenmedi (diğer değerler görülemedi) | PDF/görsel eklenir; 1 kayıt |
| Kargo faturası | – | – | DHL / PostNL gider faturaları; 0 kayıt |
| B2B cari | `customer_code` (gözlenen `RET-INV-<n>`) | AKTİF; "CARİ KAYDI EKSİK" fatura rozeti | Bir şirkete bağlı; para birimi başına ayrı bakiye |
| Cari lokasyonu | kod + ad + depo | – | Teslimat lokasyonu; müşteri portalı stoğu |
| Cari portal kullanıcısı | giriş e-postası | – | `can_adjust_stock` yetkisi |
| Tahsilat | tarih, para birimi, tutar, referans | – | "Bu işlem banka transferi yapmaz"; aynı para birimindeki cari borcu azaltır |
| Sipariş ödeme durumu (muhasebe filtresi) | – | paid, card_paid, bank, bank_paid, bank_unconfirmed, pending, refunded, partial_refund, partial_paid | |
| Denetim kaydı | – | sonuç success/failure/denied; önem info/warning/error/critical | 8 modül kategorisi |

Para birimleri: belge formunda EUR, TRY, USD, GBP; tahsilatta ayrıca CZK ve PLN; ledger toplamında EUR ve CZK görüldü. KDV: satır bazında "KDV %" alanı; muhasebe özeti sabit %19; toptan satış JS'inde varsayılan 19 ve %0 için not zorunluluğu (kaynak: `wholesale-sales.js`). Fatura–sipariş–yasal şirket bağı: fatura siparişin şirketine kesilir, kaynak sipariş numarası belge ayrıntısında yazılır, mükerrer fatura engellenir (sayfa metni).

## İş akışları

1. **Pazaryeri/Shopify siparişi → fatura:** `invoices?task=prepare` → siparişi bul → şirket faturası hazırla (müşteri, kalem, tutar kaynak siparişten) → PDF / yazdır → müşteriye gönder; Metro/eBay için "Pazaryeri fatura aktarımı" (kuyruk, kontrol, doğrulama adımları; JS: queued → checking → creating → Metro'ya gönderiliyor → doğrulanıyor).
2. **Fatura düzenleme:** liste → İşlemler → Faturayı düzenle (JS: `edit_context`, `edit_save`; müşteri adı/adres/e-posta/vergi no, KDV %).
3. **İade:** İşlemler → İade faturası oluştur; veya "İade için satış faturası seç"; iptal için "İade faturasını iptal et".
4. **Toptan satış:** cari seç/oluştur → satıcı şirket + stok çıkış deposu → ürünler → doğrula → kesinleştir (teslimatta kaynak depo stoğu bir kez düşer; taslak/fatura listeleri `records=draft|issued`) → fatura PDF → tahsilat kaydı.
5. **Elle çıkış belgesi:** `finance-documents` formu (`add_outbound_document`); stok hareketi ayrı (senkron/transfer).
6. **Tedarikçi faturası:** `invoices?view=purchases` → ekle / PDF-görsel ekle (`attach_purchase_document`); asıl alış belgesi girişi `purchases` sayfasında.
7. **Muhasebe dışa aktarımı:** kapsamı seç → "Siparişleri al" (kanallardan çek) → CSV / Excel / "Muhasebe CSV" (datev).
8. **Banka mutabakatı (Shopify havale):** üst çubukta bir "banka içe aktarma" penceresi var (`bank-import.js`, uç `shopify-bank-import.php`): en fazla 5 MB CSV seç → tarama → "Kontrol et ve tamamla" → eşleşen ödemeler onaylanır. `erp-features`ta "Banka ekstresi ve mutabakat" ise *hazırlanıyor* görünüyor — çelişki.

## erp_action listesi

| Sayfa | erp_action / alan | Not |
|---|---|---|
| customers-master | `update_b2b_customer` | cari bilgi düzenle |
| customers-master | `add_b2b_customer_location` | teslimat lokasyonu ekle |
| customers-master | `add_b2b_customer_user` | portal kullanıcısı ekle |
| customers-master | `publish_b2b_customer_invoice` | faturayı yayınla (alan yok; fatura kartında) |
| customers-master | `record_b2b_customer_payment` | tahsilat kaydet |
| customers-master | `create_b2b_customer` | yeni cari |
| invoices (purchases) | `attach_purchase_document` | tedarikçi faturasına PDF/görsel |
| finance-documents | `add_outbound_document` | satış faturası / şirketler arası / sevk |
| pin-permissions | `master_reauthenticate`, `logout` | master PIN ile oturum |
| accounting | form alanı `export` = `csv` · `excel` · `datev` | `erp_action` değil; POST + aynı sayfa |
| team, erp-features, audit-logs | yok | salt okunur |

Not: fatura/toptan satış/DHL işlemleri `erp_action` yerine JSON uçlarına (`/api/invoices.php`, `/api/wholesale-sales.php`, …) `action` alanıyla gider; bkz. `05-on-yuz-mimarisi.md`.

## Sorunlar ve yeniden tasarım notları

1. **Toptan satış taslak/fatura listeleri açılmıyor** ("hazırlanıyor…"); `wholesale-sales.php?action=state` yanıtsız kalmış görünüyor. Yeniden tasarımda liste sunucuda çizilmeli veya net hata/yeniden dene durumu olmalı.
2. **Varsayılan depo yanlış:** `invoices` ve `finance-documents` `warehouse=1` (Istanbul) ile açılıyor, tüm veri depo 2'de. İlk bakışta "kayıt yok" izlenimi. `all` seçicisinin değerleri ters (0 = depo, 1 = tüm depolar) ve etiketleri karışık.
3. **Muhasebe özeti boş:** 41 kanalda 0 sipariş, net satış/KDV/kâr "—"; sipariş verisi yalnızca "Siparişleri al" ile çekiliyor ve fatura defterini kullanmıyor. Defterde 181.887,80 EUR kesin fatura varken muhasebe 0,00 gösteriyor. Fatura defteri ile sipariş özeti tek kaynakta birleşmeli.
4. **Sabit %19 KDV özeti**; ülkeye (DE/NL/TR), OSS, tersine vergi, brüt/net ayrımına göre değil. Defter satır bazında KDV tutuyor ama özet kullanmıyor.
5. **Belge türü karışıklığı:** iade faturaları (`RET-…`, negatif) defterde "DEPO SEVK BELGESI · SV" olarak sınıflanmış; `Hedef depo` etiketi taşıyor. Cari kartında ise "İade faturası" olarak görünüyor. Tür modeli (iade/kredi notu) ayrı olmalı.
6. **Numara şemaları:** `WAWI-LE-…`, `RE-LE-…`, `RET-<sipariş>-<n>` ve serbest girilen tedarikçi/çıkış numaraları; elle girilen belge numarası alanı (zorunlu) çakışma riski taşır. Tedarikçi faturaları listesinde test gibi görünen bir kayıt (0,00 EUR, anlamsız numara) var.
7. **Cari kartlar eksik:** 48 carinin çoğunda vergi/e-posta/telefon boş; cari kodları iade numarasından türetilmiş (`RET-INV-<n>`), fatura kartlarında "CARİ KAYDI EKSİK" rozeti. B2B müşteri ile pazaryeri iade müşterisi aynı tabloda karışmış görünüyor (tahmin: iade faturası kesilirken otomatik cari açılıyor).
8. **Denetim günlüğü gürültü:** rutin `dhl-labels` ve `orders-export` API çağrıları "işlem kaydı" olarak yazılıyor (son 7 günde 21.969 kayıt); 727 engellenen "Yetkisiz API erişimi" ve 5.199 hata var. Gerçek iş olayları (belge kaydı) bu gürültüde kayboluyor. Kullanıcı kimliği PIN'in son iki hanesi — iki kişi aynı iki haneyi taşıyabilir, kişi izlenebilirliği zayıf.
9. **Kimlik/yetki:** PIN yönetimi ayrı "master" oturumu gerektiriyor; yönetici oturumundan geçilemiyor (güvenlik açısından iyi, ama ayrı çıkış-giriş akışı zahmetli). Granül görev izni yok (erp-features'ta "hazırlanıyor"); roller depo kapsamı + "Ürün ve stok / Görüntüleme" kadar kaba. Rol etiketi ile kullanıcı adı karışıyor.
10. **Çelişen durum bilgisi:** `erp-features` "banka ekstresi ve mutabakat hazırlanıyor" diyor; üst çubukta çalışan banka CSV içe aktarma penceresi var. Muhasebe sayfası toplam stoğu 2.082.838 gösteriyor; genel bakıştaki 5 deponun toplamı (fiziki + drop) 2.096.138 — fark 13.300, Mega B'nin fiziki adedine eşit (tahmin: Elec_texx/Mega B kapsam dışı; muhasebede 11 şirket vs genel bakışta 12).
11. **Sayfa başına çok sayıda ön yüz isteği:** her sayfa yüklemesi menü sayaçları, iade sayıları, notlar, oturum durumu gibi ~10 API çağrısı yapıyor, bir kısmı iptal edilip tekrarlanıyor (bkz. 05). Finans ekranlarında yavaşlık yaratabilir.
12. **Dil karışık:** başlıklarda TR/DE/EN karışımı ("KDV / MwSt", "Muhasebe CSV", "SATış FATURASı" büyük-küçük harf hatası: "SATış FATURASı").
13. Yeniden tasarım fırsatları: fatura listesinde şirket/ülke/kanal filtresi ve durum sekmeleri; belgeden siparişe ve siparişten belgeye çift yönlü bağ; cari bakiye yaşlandırma; vergi özetinin belge satırlarından üretilmesi; yetki matrisi ekranı (rol × depo × modül).

## Görülemeyenler

- `customers-master` toptan satış **Taslaklar** ve **Satış faturaları** listeleri (yüklenmedi) ve sihirbazın ürün/doğrulama/kesinleştirme adımları.
- `invoices?task=prepare` sipariş listesi (sunucudan JS ile geliyor, "yükleniyor…" kaldı); pazaryeri fatura durum paneli.
- `pin-permissions` asıl içeriği (master PIN gerekir) — PIN/yetki matrisi, depo atama formları, `erp_action` değerleri bilinmiyor.
- `team` kartlarındaki tüm rol–kapsam eşleşmeleri tek tek yazılmadı (gizlilik); kişi başına izin ayrıntıları ve düzenleme akışı yok.
- `audit-logs` "Ayrıntıyı göster" içerikleri açılmadı (tıklanmadı); olay adı listesi yalnız görülen ilk sayfalardan; tam olay sözlüğü bilinmiyor.
- `accounting` dışa aktarım çıktıları (CSV/Excel/DATEV sütunları) — indirme yapılmadı; DATEV biçimi "Muhasebe CSV" olarak adlandırılmış, tam uyumu bilinmiyor.
- Fatura PDF/e-posta (SMTP ayarları, test e-postası) ekranları açılmadı; yalnız JS'te `mail_settings`, `save_mail`, `test_mail`, `send` eylemleri görüldü.
- `/api/company-applications.php` kapsam dışı bırakıldı.
- Ödeme durumunun tedarikçi faturası için "Ödendi" gibi diğer değerleri ve cari tahsilat geçmişi (gizlilik nedeniyle yazılmadı).
