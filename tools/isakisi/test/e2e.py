"""Uçtan uca deneme: eklenti Chromium'a paketlenmemiş (geliştirici modu) yüklenir,
iki ayrı profil (iki "çalışan") demo sitelerde aynı işi birkaç kez yapar, sonra rapor
ve gizlilik denetimleri yapılır.

Önce sunucu:  DEMO=1 DATA_DIR=/tmp/isakisi-test node server/server.mjs
Sonra:        python3 test/e2e.py /tmp/isakisi-test
"""
import json, os, sys, tempfile, time, urllib.request, glob
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = os.environ.get('EXT') or os.path.join(ROOT, 'extension')
DATA = sys.argv[1]
SERVER = 'http://localhost:8787'
SECRETS = ['Erika', 'Mustermann', 'Hauptstr', 'JJD000', 'gizli-deger', 'geheim1234', '10234', '10231', 'fatura-']
WAIT = 2.3
ok = True


def check(cond, msg):
    global ok
    print(('  OK  ' if cond else '  HATA ') + msg)
    ok = ok and cond


def paste(page, sel):
    page.evaluate("""(sel) => { const el = document.querySelector(sel); el.focus();
      el.dispatchEvent(new ClipboardEvent('paste', {bubbles: true, cancelable: true})); }""", sel)


def copy(page):
    page.evaluate("document.dispatchEvent(new ClipboardEvent('copy', {bubbles: true}))")


def run_worker(p, idx, rounds):
    prof = tempfile.mkdtemp(prefix=f'isakisi-prof{idx}-')
    ctx = p.chromium.launch_persistent_context(prof, channel='chromium', headless=True, accept_downloads=True,
        args=[f'--disable-extensions-except={EXT}', f'--load-extension={EXT}'])
    sw = ctx.service_workers[0] if ctx.service_workers else ctx.wait_for_event('serviceworker')
    ext_id = sw.url.split('/')[2]
    time.sleep(1)
    ui = lambda action, **kw: sw.evaluate('(m) => uiAction(m)', {'kind': 'ui', 'action': action, **kw})

    # Onay öncesi: hiçbir şey kaydedilmemeli
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto('http://localhost:8788/orders'); time.sleep(WAIT)
    page.click('text=Sipariş 10231'); time.sleep(1)
    q = sw.evaluate("chrome.storage.local.get('queue').then(r => (r.queue||[]).length)")
    check(q == 0, f'çalışan{idx}: onay yokken kuyruk boş ({q})')
    badge = sw.evaluate("chrome.action.getBadgeText({})")
    check(badge == '?', f'çalışan{idx}: onay yokken simge "?" ({badge!r})')

    # Onay sayfası
    ob = ctx.new_page(); ob.goto(f'chrome-extension://{ext_id}/onboarding.html')
    ob.check('#read'); ob.click('#ok'); ob.wait_for_selector('#done', state='visible'); ob.close()
    badge = sw.evaluate("chrome.action.getBadgeText({})")
    check(badge == '●', f'çalışan{idx}: onaydan sonra simge kırmızı nokta ({badge!r})')

    page.bring_to_front()
    for r in range(rounds):
        o = 10231 + (r % 6)
        page.goto('http://localhost:8788/orders'); time.sleep(WAIT)
        page.click(f'text=Sipariş {o}'); time.sleep(WAIT)
        copy(page)
        with page.expect_download() as dl:
            page.click('#etiket')
        dl.value.path()
        page.goto('http://localhost:8789/siparis/yeni'); time.sleep(WAIT)
        page.fill('#musteri_adi', 'Erika Mustermann')       # yazılan metin — kaydedilmemeli
        page.fill('#adres', 'Hauptstr. 5')
        paste(page, '#kargo_takip_no'); page.fill('#kargo_takip_no', f'JJD000{o}')
        page.fill('#pin', 'geheim1234')                     # şifre — kaydedilmemeli
        page.click('#kaydet'); time.sleep(WAIT)
        page.click('text=Evrak yükle'); time.sleep(1)
        f = os.path.join(prof, f'fatura-Mustermann-{o}.pdf'); open(f, 'w').write('x')
        page.set_input_files('#dosya', f); time.sleep(WAIT)

    # Liste dışı site: yalnız "diğer" olmalı
    page.goto('http://127.0.0.1:8787/aydinlatma'); time.sleep(WAIT)
    page.evaluate("document.body.click()")

    # Duraklat: bu sırada olay üretilmemeli
    ui('flush')
    before = sw.evaluate("chrome.storage.local.get('queue').then(r => (r.queue||[]).length)")
    ui('pause', minutes=15)
    check(sw.evaluate("chrome.action.getBadgeText({})") == 'II', f'çalışan{idx}: duraklatınca simge "II"')
    page.goto('http://localhost:8788/orders'); time.sleep(WAIT)
    page.click('text=Sipariş 10232'); time.sleep(WAIT); copy(page)
    after = sw.evaluate("chrome.storage.local.get('queue').then(r => (r.queue||[]).length)")
    check(after == before, f'çalışan{idx}: duraklatılmışken yeni olay yok ({before}→{after})')
    ui('resume')
    page.goto('http://localhost:8789/siparis/yeni'); time.sleep(1)
    ui('flush')
    q = sw.evaluate("chrome.storage.local.get('queue').then(r => (r.queue||[]).length)")
    check(q == 0, f'çalışan{idx}: kuyruk sunucuya gönderildi (kalan {q})')
    pid = sw.evaluate("chrome.storage.local.get('pid').then(r => r.pid)")
    # Popup sayfası açılıyor mu
    pp = ctx.new_page(); pp.goto(f'chrome-extension://{ext_id}/popup.html'); time.sleep(0.5)
    check('Kayıt açık' in pp.inner_text('body'), f'çalışan{idx}: açılır pencere "Kayıt açık" gösteriyor')
    pp.screenshot(path=os.path.join(DATA, f'popup{idx}.png')); pp.close()
    ctx.close()
    return pid


with sync_playwright() as p:
    pids = [run_worker(p, 1, 4), run_worker(p, 2, 3)]
    b = p.chromium.launch(headless=True)
    rp = b.new_page(viewport={'width': 1100, 'height': 900})
    rp.goto(SERVER + '/rapor'); rp.wait_for_selector('.kpi'); time.sleep(0.5)
    rp.screenshot(path=os.path.join(DATA, 'rapor.png'), full_page=True)
    mp = b.new_page(viewport={'width': 1000, 'height': 800})
    mp.goto(SERVER + '/me.html#' + pids[0]); time.sleep(1)
    mp.screenshot(path=os.path.join(DATA, 'verilerim.png'))
    b.close()

# ---- Sunucu tarafı denetimler ----
raw = ''.join(open(f).read() for f in glob.glob(os.path.join(DATA, 'raw', '*.jsonl')))
evs = [json.loads(l) for l in raw.splitlines() if l.strip()]
types = {}
for e in evs: types[e['type']] = types.get(e['type'], 0) + 1
print('  olay türleri:', types)
for t in ['visit', 'click', 'submit', 'copy', 'paste', 'download', 'upload']:
    check(types.get(t, 0) > 0, f'"{t}" olayı kaydedildi')
for s in SECRETS:
    check(s not in raw, f'ham kayıtta "{s}" YOK')
check('pin' not in json.dumps([e.get('fields') for e in evs if e['type'] == 'submit']), 'şifre alanı adı formda yok')
check(all(e.get('path') is None and e['site'] == 'diğer' for e in evs if e['host'] == 'diğer'), 'liste dışı site: adres yok, yalnız "diğer"')
check(not any('127.0.0.1' in json.dumps(e) for e in evs), 'liste dışı alan adı hiçbir kayıtta yok')
check(any(e['type'] == 'click' and e.get('label') == 'Kaydet' for e in evs), 'aynı anda gelen düğme tıklaması + form gönderimi ikisi de kaydedildi')
check(not any('_id' in (e.get('path') or '') for e in evs), 'sayfa kalıbı bozulmadan saklandı (:id)')
pasted = [e for e in evs if e['type'] == 'paste']
check(any(e.get('srcSite') == 'Demo Pazaryeri' and e['site'] == 'Demo ERP' for e in pasted), 'yapıştırma kaynağı (pazaryeri→ERP) eşlendi')

rep = json.load(urllib.request.urlopen(SERVER + '/api/report'))
print('  rapor: siteler', [(s['site'], s['dakika']) for s in rep['siteler']])
print('  rapor: adaylar', [(a['tur'], a['baslik'], a['haftalikDakika']) for a in rep['adaylar']])
check(len(rep['adaylar']) > 0, 'raporda otomasyon adayı var')
check(len(rep['zincirler']) > 0, 'raporda tekrar eden zincir var')
check('pid' not in json.dumps(rep) and not any(pid in json.dumps(rep) for pid in pids), 'raporda takma kimlik yok')

# Kendi verisini görme + silme
req = urllib.request.Request(SERVER + '/api/me', headers={'X-Pid': pids[1]})
mine = json.load(urllib.request.urlopen(req))
check(len(mine['olaylar']) > 0 and all('pid' not in e for e in mine['olaylar']), f'çalışan2 kendi {len(mine["olaylar"])} kaydını görüyor')
req = urllib.request.Request(SERVER + '/api/me', headers={'X-Pid': pids[1]}, method='DELETE')
d = json.load(urllib.request.urlopen(req))
raw2 = ''.join(open(f).read() for f in glob.glob(os.path.join(DATA, 'raw', '*.jsonl')))
check(d['silinen'] > 0 and pids[1] not in raw2 and pids[0] in raw2, f'çalışan2 silme: {d["silinen"]} kayıt silindi, çalışan1 duruyor')
try:
    urllib.request.urlopen(urllib.request.Request(SERVER + '/api/events', data=json.dumps({'pid': pids[1], 'events': []}).encode(), headers={'Content-Type': 'application/json', 'X-Kayit-Anahtari': os.environ.get('ENROLL_KEY', '')}))
    check(False, 'silinen çalışandan veri reddedilmeli')
except urllib.error.HTTPError as e:
    check(e.code == 403, 'silmeden sonra sunucu yeni veriyi reddediyor (403)')

print('\nSONUÇ:', 'BAŞARILI' if ok else 'HATA VAR')
sys.exit(0 if ok else 1)
