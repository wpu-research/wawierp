"""WawiERP mock paneli için Türkçe seslendirmeli tanıtım videosu üretir.
1) Her sahnenin metnini yerel piper modeliyle seslendirir, sürelerini ölçer.
2) Paneli yerel sunucuda açıp Playwright ile gezer, ekranı kaydeder; her sahne kendi sesinin süresi kadar ekranda kalır.
3) Sesleri sahne başlangıçlarına yerleştirip videoyla birleştirir.
4) Videoyu, kapak görselini ve her sahneden bir ekran görüntüsünü (img/) sunum klasörüne yazar.
Ara dosyalar VIDEO_OUT ile verilen klasöre (yoksa sunum/video) yazılır."""
import json, os, shutil, subprocess, sys, time, wave
from pathlib import Path
from playwright.sync_api import sync_playwright

SP = Path(__file__).parent
OUT = Path(os.environ.get('VIDEO_OUT') or SP / 'video'); OUT.mkdir(parents=True, exist_ok=True)
APP = Path('/home/wpu/Desktop/Urunler/WaviERP/yeni/panel-mock')
VOICE = Path.home() / '.local/share/piper/voices/tr_TR-dfki-medium.onnx'
PORT, PW = 3919, 'video-deneme-sifresi'
BASE = f'http://127.0.0.1:{PORT}'
W, H = 1280, 720

def go(hash_):
    return lambda p: p.evaluate(f"location.hash = '{hash_}'")

def scroll(p, dy=380, steps=4, pause=0.9):
    for _ in range(steps):
        p.mouse.wheel(0, dy / steps * 1.0); time.sleep(pause / steps)

def s_landing(p):
    p.goto(BASE + '/', wait_until='networkidle'); time.sleep(2.2); scroll(p, 700, 10, 3.0)
def s_overview(p):
    p.goto(BASE + '/panel', wait_until='networkidle')
def s_menu(p):
    p.click('button[aria-label="Menüyü daralt"]'); time.sleep(2.6); p.click('button[aria-label="Menüyü genişlet"]'); time.sleep(1.6)
    box = p.locator('input[aria-label="Menüde ara"]'); box.click(); p.keyboard.type('stok', delay=200); time.sleep(2.4); box.fill('')
    p.locator('main').click(position={'x': 600, 'y': 20})
def s_returns(p):
    go('#/returns')(p); time.sleep(5.0)
    for _ in range(2): p.locator('button:has-text("İlerlet")').first.click(); time.sleep(2.2)
def s_bell(p):
    p.click('button[aria-label^="Bildirimler"]'); time.sleep(4.5)
    p.click('[role="dialog"][aria-label="Bildirimler"] [role="tab"]:has-text("Sorunlar")'); time.sleep(3.5)
    p.click('[role="dialog"][aria-label="Bildirimler"] [role="tab"]:has-text("Yapılacaklar")'); time.sleep(3.0)
    p.click('[role="dialog"][aria-label="Bildirimler"] button[aria-label="Kapat"]')
def s_messages(p):
    go('#/messages')(p); time.sleep(3.0); p.click('aside[aria-label="Konuşmalar"] button:has-text("depo-istanbul")'); time.sleep(3.5)
    p.click('aside[aria-label="Konuşmalar"] button:has-text("Depo Çalışanı 1")'); time.sleep(1.2)
    p.locator('textarea[aria-label="Mesaj"]').click(); p.keyboard.type('Yarın sayım için iki kişi ekledim.', delay=55); p.keyboard.press('Enter')
def s_feedback(p):
    go('#/feedback')(p); time.sleep(4.5); scroll(p, 360, 6, 3.0)
def s_orders(p):
    go('#/orders')(p); time.sleep(2.5); go('#/orders?view=overdue')(p); time.sleep(2.5); go('#/orders?view=issue')(p)
def s_picking(p):
    go('#/picking')(p); time.sleep(3.0); scroll(p, 300, 4, 1.5)
def s_channels(p):
    go('#/channels')(p); time.sleep(4.0); go('#/sync')(p)
def s_quality(p):
    go('#/quality')(p)
def s_listing(p):
    go('#/listing')(p)
def s_prices(p):
    go('#/prices')(p); time.sleep(3.0); scroll(p, 420, 5, 2.0)
def s_rules(p):
    go('#/rules')(p); time.sleep(4.0); scroll(p, 520, 8, 4.0)
def s_alerts(p):
    go('#/alerts')(p); time.sleep(3.0); scroll(p, 320, 4, 1.5)
def s_shifts(p):
    go('#/shifts')(p); time.sleep(3.0); scroll(p, 300, 4, 1.5)
def s_finance(p):
    go('#/bank')(p); time.sleep(4.0); go('#/profit')(p)
def s_platform(p):
    go('#/onboarding')(p); time.sleep(4.5); go('#/status')(p)
def s_search(p):
    go('#/overview')(p); time.sleep(1.2); p.keyboard.press('Control+k'); time.sleep(1.2)
    p.keyboard.type('iade', delay=220); time.sleep(2.2); p.keyboard.press('Enter')
def s_agent_q(p):
    go('#/orders')(p); time.sleep(1.0); p.click('button[aria-label="Asistanı aç"]'); time.sleep(2.0)
    p.click('aside[aria-label="Asistan"] button:has-text("Dün hangi kanaldan")')
def s_agent_act(p):
    ta = p.locator('aside[aria-label="Asistan"] textarea'); ta.click()
    p.keyboard.type('Ödenmiş siparişlerin etiketlerini hazırla', delay=45); time.sleep(0.5); p.keyboard.press('Enter'); time.sleep(4.5)
    p.locator('aside[aria-label="Asistan"] button:has-text("Onayla")').last.click(); time.sleep(3.0)
    p.click('aside[aria-label="Asistan"] a[href="#/audit"]')
def s_close(p):
    p.click('aside[aria-label="Asistan"] button[aria-label="Asistanı kapat"]'); go('#/overview')(p)

SCENES = [
    ('acilis', s_landing, "Vavi e-re-pe'nin yeni tasarımına hoş geldiniz. Bu videoda yeni panelde neler değiştiğini birlikte gezeceğiz. Gördükleriniz bir tasarım taslağıdır; veriler örnektir."),
    ('genel', s_overview, "Giriş yaptıktan sonra genel bakış açılır. Üstteki şerit günün durumunu tek cümleyle söyler. Bugünün siparişleri, gönderilmeyi bekleyenler ve dikkat isteyen işler tek ekranda."),
    ('menu', s_menu, "Sol menü yenilendi. Gruplar açılıp kapanır, sık kullandığınız ekranları yıldızla üste sabitlersiniz. Menüyü daraltıp yalnız simgeleri bırakabilir, içinde arama yapabilirsiniz."),
    ('siparis', s_orders, "Siparişlerin tamamı tek listede ve her siparişin yanında ürün fotoğrafı var. Gönderilecekler, iki günü aşanlar ve sorunlular hazır görünüm olarak durur."),
    ('iade', s_returns, "Her ekranın başında, o işin dört adımda nasıl aktığını gösteren bir şerit bulunur. İadelerde bir kaydı ilerlettiğinizde kart, yeni sütununda belirir."),
    ('toplama', s_picking, "Toplama listesi, aynı ürünü tek seferde toplatır ve satırları raf sırasına dizer. Yanında, planlanan mobil depo uygulamasının önizlemesi var."),
    ('kanal', s_channels, "Kanallar ekranı her satış hesabının sağlığını gösterir. Eşitlemesi takılan hesap burada hemen görünür; haftalarca fark edilmeden kalmaz."),
    ('kalite', s_quality, "Veri kalitesi ekranı, eksik barkod ve görselleri sıraya koyar. Önce satışı olan ürünler gelir. Düzeltir, sıradakine geçersiniz."),
    ('listeleme', s_listing, "Toplu listeleme ile bir ürünü tek akışta birden çok kanala gönderirsiniz. Eksik bilgiler, kanalın kurallarına göre gösterilir."),
    ('fiyat', s_prices, "Fiyat ve kârlılık ekranı; komisyon, kargo ve vergi düşüldükten sonra elinizde ne kaldığını hesaplar."),
    ('kural', s_rules, "Otomasyon kuralları yeni sistemin kalbidir. Her kural bir olay, bir koşul ve bir işlemden oluşur. Önce yalnız öneri üretir. Güven oluşunca kendiliğinden çalışır."),
    ('uyari', s_alerts, "Uyarılar ekranı günlük özeti ve olağan dışı durumları gösterir. Bir kanalda sipariş aniden kesilirse size haber verir."),
    ('bildirim', s_bell, "Zil, panelin kendiliğinden söylediklerini toplar: yapılacaklar, sorunlar ve olanlar. Bir bildirimi erteleyebilir, üstünüze alabilir ya da asistana hazırlatabilirsiniz. Sorun düzelince bildirim kendiliğinden kapanır."),
    ('vardiya', s_shifts, "Vardiya önerisi, gerçek sipariş saatlerinden hesaplanır. En yoğun saatler, öğlen on bir ile on üç arasıdır."),
    ('finans', s_finance, "Finans tarafında banka havaleleri siparişlerle eşleştirilir. Muhasebe dosyası ve kanal bazında kârlılık hazırdır."),
    ('platform', s_platform, "Sistem artık birden çok müşteriye hizmet verecek. Yeni bir müşteri, kurulum sihirbazıyla şirketini, deposunu ve kanallarını kendisi tanımlar."),
    ('mesaj', s_messages, "Ekip artık panelin içinde yazışır. Ortak kanallar ve birebir konuşmalar aynı yerdedir. Bir mesajı tek tıkla öneri ya da sorun olarak işaretlersiniz."),
    ('pano', s_feedback, "Geliştirme panosu, ortak kanallarda yazılanları konu konu sayar. Tekrar eden sorunlar için çözüm önerir, istekler oylanır ve sonuç kanala geri yazılır. Birebir mesajlar taranmaz."),
    ('arama', s_search, "Kontrol ve K tuşlarıyla, her yerden arama açılır. Ekran adı, sipariş numarası ya da ürün yazmanız yeterlidir."),
    ('asistan1', s_agent_q, "Sağ alttaki düğme, asistanı bir sohbet penceresi olarak açar. Bir soru sorduğunuzda yanıtı panel verisinden hesaplar ve dayandığı ekranları, yanıtın altında düğme olarak gösterir."),
    ('asistan2', s_agent_act, "Bir iş istediğinizde önce taslak hazırlar. Siz onaylamadan hiçbir şeyi değiştirmez. Onayladığınız işlem, denetim kaydına yazılır."),
    ('kapanis', s_close, "Hepsi tek panelde. Daha hızlı, daha tutarlı ve otomasyona hazır. İzlediğiniz için teşekkürler."),
]

def tts():
    durs = []
    for i, (key, _, text) in enumerate(SCENES):
        wav = OUT / f'{i:02d}-{key}.wav'
        subprocess.run(['piper', '-m', str(VOICE), '-f', str(wav), '--length-scale', '1.02', '--sentence-silence', '0.38'], input=text.encode(), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        with wave.open(str(wav)) as w: durs.append(w.getnframes() / w.getframerate())
    return durs

def record(durs):
    env = {**os.environ, 'PORT': str(PORT), 'PANEL_PASSWORD': PW}
    for k in ('ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL'): env.pop(k, None)
    srv = subprocess.Popen(['node', 'server.mjs'], cwd=APP, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    starts = []
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch()
            ctx = b.new_context(viewport={'width': W, 'height': H}, record_video_dir=str(OUT / 'raw'), record_video_size={'width': W, 'height': H}, http_credentials={'username': 'wawi', 'password': PW}, locale='tr-TR', color_scheme='light', device_scale_factor=1)
            page = ctx.new_page(); t0 = time.time()
            page.goto(BASE + '/', wait_until='networkidle')
            for (key, fn, _), d in zip(SCENES, durs):
                ts = time.time(); starts.append(ts - t0 + 0.45)
                fn(page)
                left = d + 1.0 - (time.time() - ts)
                if left > 0: time.sleep(left)
            time.sleep(1.2)
            video = page.video.path(); ctx.close(); b.close()
    finally:
        srv.terminate()
    return Path(video), starts

def mux(video, starts, durs):
    inputs, filt = [], []
    for i, (key, _, _) in enumerate(SCENES):
        inputs += ['-i', str(OUT / f'{i:02d}-{key}.wav')]
        ms = int(starts[i] * 1000)
        filt.append(f'[{i + 1}:a]aresample=44100,adelay={ms}|{ms}[a{i}]')
    filt.append(''.join(f'[a{i}]' for i in range(len(SCENES))) + f'amix=inputs={len(SCENES)}:normalize=0:dropout_transition=0,volume=1.6[aout]')
    out = OUT / 'wawierp-tanitim.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video), *inputs, '-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[aout]',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-r', '25', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', '-shortest', str(out)], check=True)
    return out

if __name__ == '__main__':
    durs = tts(); print('ses süreleri', [round(d, 1) for d in durs], 'toplam', round(sum(durs), 1))
    video, starts = record(durs); print('kayıt', video.name, 'sahne başlangıçları', [round(s, 1) for s in starts])
    out = mux(video, starts, durs)
    (OUT / 'scenes.json').write_text(json.dumps([{'key': k, 'start': round(s, 2), 'dur': round(d, 2), 'text': t} for (k, _, t), s, d in zip(SCENES, starts, durs)], ensure_ascii=False, indent=1))
    print('çıktı', out, round(out.stat().st_size / 1e6, 1), 'MB')
    # Sunum klasörüne: video, kapak ve her sahneden bir kare (sahnenin son üçte birinden)
    shutil.copy(out, SP / 'wawierp-tanitim.mp4'); (SP / 'img').mkdir(exist_ok=True)
    grab = lambda t, dst, w: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{t:.2f}', '-i', str(out), '-frames:v', '1', '-vf', f'scale={w}:-2', '-q:v', '5', str(dst)], check=True)
    AT = {'menu': 0.13, 'bildirim': 0.4}  # bu sahnelerde anlatılan şey sahnenin başında ekrandadır
    for (k, _, _), st, d in zip(SCENES, starts, durs): grab(st + d * AT.get(k, 0.78), SP / 'img' / f'{k}.jpg', 1100)
    grab(starts[1] + durs[1] * 0.8, SP / 'wawierp-tanitim-kapak.jpg', 1280)
    print('kareler', len(SCENES), 'toplam süre', round(starts[-1] + durs[-1], 1), 'sn')
