# Mail Mobil (Expo, iOS + Android)

Şirket postasını `../mail-api` üzerinden okuyup yazan Expo (TypeScript, expo-router) uygulaması.

## Kurulum
```bash
npm install
npx expo start
```
Telefonda **Expo Go** ile QR kodu okutun.

## Telefondan API'ye bağlanma
1. Bilgisayarda API'yi `--host 0.0.0.0` ile başlatın (bkz. `../mail-api/README.md`).
2. Bilgisayarın LAN IP'sini bulun (`ip addr` / `ipconfig`).
3. Uygulamada **Ayarlar**: API adresi `http://<LAN-IP>:8000`, token = API'deki `API_TOKEN`.
   Değerler `expo-secure-store`'da saklanır, koda veya dosyaya yazılmaz.
4. Telefon ve bilgisayar aynı Wi-Fi'de olmalı. Android'de düz `http` Expo Go'da çalışır;
   üretim derlemesinde HTTPS (ters vekil) kullanın.

## Özellikler
Gelen kutusu (aşağı çekerek yenileme, sonsuz kaydırma), klasör seçimi, mail detayı
(html varsa WebView, yoksa metin; JavaScript kapalı), Yaz/Yanıtla, bildirime dokununca ilgili maile gitme.

## Push bildirimleri
- **Fiziksel cihaz gerekir**; simülatör/emülatörde token alınamaz.
- Ayarlar'da "Kaydet ve dene" izin ister, Expo push token alır ve `/push/register`'a gönderir.
- Expo Go'da Android push SDK 53+ ile kısıtlıdır; tam deneyim için development build
  (`npx expo run:android` / EAS) gerekir. EAS kullanılırsa `app.json` içine `extra.eas.projectId` eklenir.

## Doğrulama
```bash
npx tsc --noEmit
```

## Bilinen eksikler
Ek indirme/görüntüleme yok (yalnız ek adları listelenir), arama yok, çevrimdışı önbellek yok,
uygulama simgesi/splash varsayılan. `bundleIdentifier`/`package` değerleri örnektir, yayın öncesi değiştirin.
