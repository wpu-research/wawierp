# İş Akışı Kaydı — Çalışan Aydınlatma Metni (TASLAK)

> Bu metin bir taslaktır. Yürürlüğe girmeden önce şirketin hukuk danışmanı / KVKK
> sorumlusu tarafından gözden geçirilmelidir. `[köşeli parantez]` içindeki yerler doldurulmalıdır.
> Sürüm: 2026-11-17

## 1. Veri sorumlusu
[Şirket unvanı], [adres]. İrtibat: [ad soyad, e-posta]. (Almanya'daki çalışanlar için
GDPR m.13 kapsamında da aynı kişi irtibat noktasıdır; varsa veri koruma görevlisi: [ad, e-posta].)

## 2. Amaç
Ofiste tarayıcıda elle, tekrar tekrar yapılan işleri (ör. pazaryeri panelinden bilgiyi
kopyalayıp ERP'ye yapıştırmak) bulmak ve bu işleri **otomatikleştirmek**.

Bu veriler şu amaçlarla **kullanılmaz**: performans değerlendirmesi, kişi bazlı verim puanı,
disiplin süreci, mesai denetimi, kişilerin birbiriyle karşılaştırılması. Raporlar yalnız iş
akışı düzeyindedir ve en az [2] kişide görülmeyen akışlar raporda gösterilmez.

## 3. Hangi veriler işlenir
Yalnız şirket cihazında, iş tarayıcı profilinde ve şirketin belirlediği **iş siteleri
listesinde** (pazaryeri satıcı panelleri, kargo, muhasebe, WawiERP):

- Ziyaret edilen sitenin adı ve sayfa türü (ör. `/orders/:id`; sipariş/ürün numaraları silinir) ve sayfada geçen süre
- Tıklanan düğmenin yazısı (ör. "Kaydet"); bağlantılarda yalnız gidilen sayfa türü
- Form gönderildiğinde yalnız alanların **adları** (ör. "kargo_takip_no")
- Kopyala/yapıştır yapıldığında yalnız **hangi siteden hangi siteye** ve hangi alana yapıştırıldığı
- Dosya indirme/yükleme olduğunda yalnız dosya **türü** (ör. pdf, csv)
- Rastgele üretilmiş bir takma kimlik (adınız, e-postanız veya kullanıcı adınız değil) ve onay tarihiniz

Listede olmayan siteler (kişisel siteler dahil) yalnız "diğer" başlığı altında toplam süre
olarak sayılır; adresleri kaydedilmez. Gizli pencerelerde eklenti çalışmaz.

## 4. Hangi veriler ASLA işlenmez
Şifreler ve şifre alanları · yazılan metin ve tuş vuruşları · form alanlarının değerleri ·
kopyalanan içerik · sayfa içerikleri ve müşteri bilgileri · ekran görüntüsü · kamera/mikrofon ·
kişisel tarayıcı profilleri ve kişisel cihazlar.

## 5. Hukuki sebep
[Hukuk danışmanı belirleyecek.] Not: İş ilişkisinde çalışan ile işveren arasındaki güç
dengesizliği nedeniyle açık rızanın "özgür" sayılması tartışmalıdır. Önerilen yaklaşım:
temel hukuki sebep olarak KVKK m.5/2(f) — veri sorumlusunun meşru menfaati (iş süreçlerinin
iyileştirilmesi), GDPR için m.6(1)(f); buna ek olarak katılımın **gönüllü** olması, yazılı
bilgilendirme ve eklenti içinde ayrıca onay. Katılmamak veya onayı geri çekmek hiçbir
olumsuz sonuç doğurmaz. Almanya'daki işyerlerinde işçi temsilciliği (Betriebsrat) varsa
kurulumdan önce onun onayı alınmalıdır (BetrVG §87(1) Nr. 6).

## 6. Saklama süresi
- Ham kayıtlar **[30] gün** sonra otomatik silinir.
- Silinmeden önce kişisiz toplu sayılara çevrilir (ör. "o gün DHL'de toplam 120 dk"); bu
  sayılarda takma kimlik dahil hiçbir kişi bilgisi yoktur.
- Onay geri çekildiğinde veya silme istendiğinde ham kayıtlar hemen silinir.

## 7. Kimler erişir, nereye aktarılır
Ham kayıtlar, şirket adına çalışan bir bulut sunucusunda tutulur: Railway Corp. (ABD merkezli
barındırma hizmeti), sunucu bölgesi **Avrupa / Amsterdam** [kurulumda doğrulanacak]. Bağlantı
şifrelidir (HTTPS); rapor parolalıdır. Ham kayıtlara yalnız [proje sorumlusu] erişir;
yöneticiler yalnız iş akışı raporunu görür. Veriler başka üçüncü kişilere aktarılmaz.

[Hukuk danışmanı tamamlayacak:]
- Türkiye'deki çalışanlar için bu bir **yurt dışına aktarım**dır (KVKK m.9): standart sözleşme
  imzalanıp 5 iş günü içinde Kurul'a bildirilmesi gerekir.
- AB'deki çalışanlar için: Railway ile veri işleme sözleşmesi (DPA) ve ABD'li sağlayıcı için
  aktarım dayanağı (AB-ABD Veri Gizliliği Çerçevesi ya da standart sözleşme maddeleri) kontrol edilmeli.

## 8. Haklarınız (KVKK m.11, GDPR m.15–21)
- Eklenti simgesindeki **kırmızı nokta** kaydın açık olduğunu gösterir; dilediğiniz an
  **duraklatabilirsiniz** (15 dakika ya da siz açana kadar).
- "Kaydedilen verilerimi gör" sayfasından hakkınızdaki **tüm** ham kayıtları görebilirsiniz.
- Kayıtlarınızı oradan **silebilir**, onayınızı eklentiden **geri çekebilirsiniz**.
- Ayrıca [irtibat kişisi]'ne yazılı başvurabilir, Kişisel Verileri Koruma Kurulu'na
  (Almanya'da ilgili eyalet veri koruma otoritesine) şikâyette bulunabilirsiniz.

## 9. Süre
Kayıt dönemi [başlangıç] – [bitiş] (önerilen: en fazla 4 hafta). Dönem bitince eklenti
kaldırılır ve sonuçlar çalışanlarla paylaşılır.

---
**Onay beyanı (kâğıt / e-imza):**
Yukarıdaki bilgilendirmeyi okudum ve anladım. Şirket cihazımdaki iş tarayıcı profilimde
İş Akışı Kaydı eklentisinin [başlangıç]–[bitiş] arasında çalışmasını kabul ediyorum.
Katılmamamın veya onayımı geri çekmemin bana hiçbir olumsuz sonucu olmayacağı bana bildirildi.

Ad soyad: ______________  Tarih: ________  İmza: ________
