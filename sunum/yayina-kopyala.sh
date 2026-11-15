#!/usr/bin/env bash
# Yenilikler sunumunu, Railway'in yayınladığı klasöre (yeni/panel-mock/sunum) kopyalar.
# Railway yalnız yeni/panel-mock klasörünü gördüğü için sunumun bir kopyası orada durur.
# Sunumu ya da videoyu değiştirdikten sonra çalıştırın, sonra commitleyip gönderin.
set -euo pipefail
cd "$(dirname "$0")"
HEDEF=../yeni/panel-mock/sunum
rm -rf "$HEDEF"; mkdir -p "$HEDEF/img"
cp wawierp-yenilikler.html "$HEDEF/index.html"
cp wawierp-tanitim.mp4 wawierp-tanitim-kapak.jpg "$HEDEF/"
grep -o 'img/[a-z0-9]*\.jpg' wawierp-yenilikler.html | sort -u | while read -r f; do cp "$f" "$HEDEF/$f"; done
echo "kopyalandı: $(find "$HEDEF" -type f | wc -l) dosya, $(du -sh "$HEDEF" | cut -f1)"
