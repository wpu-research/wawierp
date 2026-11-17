"""Eklentiyi ofis sunucusunun adresiyle paketler.

Kullanım:  python3 scripts/paketle.py <sunucu-adresi> [kayıt-anahtarı]
  ör.      python3 scripts/paketle.py https://isakisi.up.railway.app 3f9c...  (anahtar = sunucudaki ENROLL_KEY)
Çıktı:     dist/isakisi-eklenti-<sürüm>/      (geliştirici modunda "Paketlenmemiş öğe yükle" için)
           dist/isakisi-eklenti-<sürüm>.zip   (Chrome Web Store / Edge Add-ons'a yüklemek için)

Paket yalnız bu adrese veri gönderebilir (manifest host_permissions sadece bu adres).
"""
import json, os, shutil, sys, zipfile
from urllib.parse import urlparse

if len(sys.argv) not in (2, 3):
    sys.exit(__doc__)
url = sys.argv[1].rstrip('/')
u = urlparse(url)
if u.scheme not in ('http', 'https') or not u.hostname or u.path not in ('',):
    sys.exit('Adres şöyle olmalı: http://192.168.1.50:8787  ya da  https://isakisi.sirket.de')
if u.scheme == 'http' and u.hostname not in ('localhost', '127.0.0.1') and not u.hostname.startswith(('10.', '192.168.', '172.')):
    print('UYARI: internete açık bir adreste https kullanın.')

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(root, 'extension')
man = json.load(open(os.path.join(src, 'manifest.json'), encoding='utf-8'))
name = f"isakisi-eklenti-{man['version']}"
out = os.path.join(root, 'dist', name)
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(src, out)

man['host_permissions'] = [f'{u.scheme}://{u.netloc}/*']
json.dump(man, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
key = sys.argv[2] if len(sys.argv) == 3 else ''
if not key and u.hostname not in ('localhost', '127.0.0.1'):
    print('UYARI: kayıt anahtarı verilmedi; sunucuda ENROLL_KEY ayarlıysa eklenti veri gönderemez.')
json.dump({'server': url, 'key': key}, open(os.path.join(out, 'ayar.json'), 'w'))

z = out + '.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for d, _, files in os.walk(out):
        for f in files:
            p = os.path.join(d, f)
            zf.write(p, os.path.relpath(p, out))
print(f'Hazır:\n  klasör: {out}\n  zip:    {z}\n  sunucu: {url}')
