#!/usr/bin/env bash
# Yenilikler sunumunu, Railway'in yayınladığı klasöre (yeni/panel-mock/sunum) kopyalar.
# Railway yalnız yeni/panel-mock klasörünü gördüğü için sunumun bir kopyası orada durur.
# Sunumu ya da videoyu değiştirdikten sonra çalıştırın, sonra commitleyip gönderin.
# Önce geçici klasöre kopyalanır, her dosya doğrulanır, sonra yerine konur: bir adım başarısız olursa yayın klasörü bozulmaz.
set -euo pipefail
cd "$(dirname "$0")"
HEDEF=../yeni/panel-mock/sunum
GECICI=$(mktemp -d "../yeni/panel-mock/.sunum-yeni.XXXXXX")
trap 'rm -rf "$GECICI"' EXIT
mkdir -p "$GECICI/img"
cp wawierp-yenilikler.html "$GECICI/index.html"
cp wawierp-tanitim.mp4 wawierp-tanitim-kapak.jpg "$GECICI/"
# Sunucu yalnız .html, .jpg ve .mp4 sunar; sunumda başka türde ya da tırnaklı bir görsel adı varsa dur.
BAD=$(grep -oE 'img/[A-Za-z0-9._-]+' wawierp-yenilikler.html | grep -vE '\.jpg$' || true)
if [ -n "$BAD" ]; then
  echo "HATA: sunumda .jpg dışında görsel var (sunucu yalnız html, jpg ve mp4 sunar):" >&2
  grep -oE 'img/[A-Za-z0-9._-]+' wawierp-yenilikler.html | grep -vE '\.jpg$' | sort -u >&2
  exit 1
fi
{ grep -oE 'img/[A-Za-z0-9._-]+\.jpg' wawierp-yenilikler.html || true; } | sort -u | while read -r f; do
  [ -f "$f" ] || { echo "HATA: görsel bulunamadı: $f" >&2; exit 1; }
  cp "$f" "$GECICI/$f"
done
[ -s "$GECICI/index.html" ] && [ -s "$GECICI/wawierp-tanitim.mp4" ] || { echo "HATA: kopya eksik" >&2; exit 1; }
chmod 755 "$GECICI"; rm -rf "$HEDEF"; mv "$GECICI" "$HEDEF"; trap - EXIT
echo "kopyalandı: $(find "$HEDEF" -type f | wc -l) dosya, $(du -sh "$HEDEF" | cut -f1)"
