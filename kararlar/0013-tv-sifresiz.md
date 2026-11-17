# 0013 — Duvar ekranı /tv şifresiz, ayrı wall paketi

Tarih: 2026-11-17 · Durum: **Uygulandı** · Kaynak: commit 3c674d6

## Bağlam
Duvar ekranı (karar 0012) depodaki televizyona yansıtılıyor. TV'de oturum açmak pratik değil; ama panelin kendi verisi şifre arkasında kalmalı.

## Karar
Duvar ekranı `/tv` adresinde şifresiz açılır. Panelden ayrı bir `wall` paketi olarak yayınlanır; panel kodu ve oturumu bu pakete taşınmaz.

## Neden
- TV kendi başına, şifresiz açılabilmeli.
- Ayrı paket, panelin şifreli verisinin duvar ekranından sızmasını önler: ekran yalnız kendi gösterdiği özet veriyi sunar.

## Reddedilenler
- TV'de panel oturumu açık bırakmak: oturum düşer, yetki geniş kalır.
- Panele şifresiz bir rota eklemek: panel ile duvar verisi aynı pakette karışır.
