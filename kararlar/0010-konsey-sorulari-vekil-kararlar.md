# 0010 — İkinci konseyin sorduğu dokuz soru: vekil kararlar

Tarih: 2026-11-16 · Durum: **Vekil karar** (sahibi "önceki kararlarıma göre kendin ver" dedi; sahibi istediği zaman değiştirir)

## Bağlam
`docs/konsey/2026-11-16-ikinci-konsey.md` bölüm 7, sahibinin kararını bekleyen dokuz konu sıraladı. Sahibi, daha önceki kararlarına (0006 onay-ilk asistan, 0007 yalnız öner başlar, 0008 dış satış ertelendi, 0009 taslak şartnamedir) bakarak karar verilmesini istedi. Aşağıdakiler bu çizgide, en güvenli ve geri alınabilir seçimlerdir. Hiçbiri ekran silmez; hiçbiri geri dönülmez.

## Kararlar

| # | Konu | Karar | Dayanak |
|---|---|---|---|
| 1 | Menü | Ekran silinmez. İşe göre yeniden gruplandı: Günlük iş · Ürün ve stok · Satış kanalları · Para · Otomasyon · Müşteri görünümü (önizleme) · Yönetim · Platform (dış müşteri için, ertelendi). "Yeni" noktaları kaldırıldı (taslakta her şey yeni). İki "Kârlılık" ayrıldı: "Fiyat kuralları" ve "Kanal ve şirket kârı". Geliştirme panosu Yönetim'e alındı. | 0008 (dış satış ertelendi), sade menü |
| 2 | Asistan modeli ve sınırlar | Varsayılan model Sonnet; zor işler için Opus ortam değişkeniyle seçilir. Sınırlar aynı (dakikada 20, günde 100). Kullanım ve maliyet kaydı gerçek sistemde zorunlu, taslakta yok. | Maliyet disiplini; 0006 |
| 3 | Roller | Muhasebe için "müşteri iletişimi" tam değil yalnız görüntüleme. Depo çalışanı destek ve eşitleme ekranını görmez (değişmedi). Rol × modül matrisi hâlâ öneri; gerçek sistemde sunucuda uygulanır. | En az yetki ilkesi |
| 4 | Dışarıya satış | Ertelendi; Platform ekranları menüde "dış müşteri için, ertelendi" diye ayrıldı, silinmedi. Tanıtım sayfası ve "Firma girişi" olduğu gibi kalır; Impressum/Datenschutz/KVKK sayfaları dış açılıştan önce yazılacak. | 0008 |
| 5 | İade stok kuralı | Ürün geldi ve kontrol edildi (geldi → para iadesi bekliyor) anında, fiziki siparişin kalemleri depoya geri yazılır ve deftere "Düzeltme" hareketi eklenir; geri alınabilir. Tedarikçiden gönderilen siparişte stok yazılmaz. İade süresi siparişten sayılır; teslim tarihi gerçek sistemde tutulacak, o zaman teslimden sayılır. | 0009 (kural 1 ve 3) |
| 6 | "Yalnız öner ile başlar" | Yeni kurallar her zaman "Yalnız öner" başlar (taslakta zaten böyle). Mevcut dört kendiliğinden kural (gecikme uyarısı, stok eşitleme, "siparişim nerede" yanıtı, başarısız eşitlemeyi yeniden deneme) para veya fiyat etkilemediği ve geri alınabildiği için kalır; para/fiyat/etiket/tedarikçi kuralları kendiliğinden olamaz. | 0006, 0007 |
| 7 | Müşteri mesajı maskeleme | Asistana giden müşteri mesajında e-posta, telefon, IBAN ve uzun numaralar yapay zekâya gitmeden `[e-posta]`, `[numara]`, `[IBAN]` olarak maskelenir. Ad ve adres zaten gitmiyordu. | 0006 (müşteri bilgisi verilmez) |
| 8 | Panel şifresi | **Vekil karar verilemez.** Şifrenin sohbette açığa çıktığı belgelerde yazıyor; yenilenip yenilenmediğini yalnız sahibi bilir ve Railway'de kendisi değiştirir. Taslak için tek yapılacak: yenilediğinde `docs/guvenlik`'e tarihli bir satır eklemek. | Güvenlik raporu |
| 9 | Mimari | Değişmedi: eski kaynak kod ve veritabanı yapısı gelmeden kapsam ve takvim sözü verilmez; stok defteri/ayırma ve veri göçü için ayrı karar yazılacak. | 0002, 0007, 0009 |

## Neden
- Her karar, daha önce sahibin verdiği yönü (önce onay, para/fiyatı otomatikleştirme, dış satışı erteleme, taslak = şartname) uzatır.
- Menü gruplaması ve "yeni" noktalarının kaldırılması yalnız görünümdür; hiçbir veri ya da iş kuralı değişmez.

## Reddedilenler
- Ekran silmek: sahibin "özellik kaldırma" kararı yok.
- Asistanda Opus'u varsayılan tutmak: maliyet.
- Şifre için vekil karar: sır sahibine aittir.

## Açık kalanlar
- Gerçek sistemde İade süresinin teslimden sayılması için teslim tarihi alanı.
- "Eksi stok" (sayım hatası: fiziki < 0) ile "fazla satış riski" (satılabilir < 0) iki ayrı kavram; ekranlarda bu adlarla ayrılacak. "Kritik" için tek tanım (satılabilir ≤ asgari) henüz tüm ekranlara işlenmedi.
