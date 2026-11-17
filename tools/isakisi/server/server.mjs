// İş Akışı toplama sunucusu — ek paket yok (Node 18+).
//   node server.mjs            → http://127.0.0.1:8787
//   DEMO=1 node server.mjs     → ayrıca deneme siteleri :8788 (pazaryeri) ve :8789 (ERP)
// Ortam değişkenleri: PORT, HOST (varsayılan 127.0.0.1), DATA_DIR, REPORT_USER/REPORT_PASS (rapor için parola), MIN_KISI
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeStore, sanitize } from './store.mjs';
import { analyze } from './analyze.mjs';
import { panelData } from './panel.mjs';
import crypto from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'config.json'), 'utf8'));
const DEMO = process.env.DEMO === '1';
if (!DEMO) cfg.allowlist = cfg.allowlist.filter((x) => !x.demo);
if (process.env.MIN_KISI) cfg.minKisi = +process.env.MIN_KISI;
const PORT = +(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
// REPORT_PUBLIC=1: rapor parolasız açılır (geçici; rapor kişisiz ama şirketin iş akışlarını herkese gösterir)
const REPORT_PUBLIC = process.env.REPORT_PUBLIC === '1';
if (!['127.0.0.1', 'localhost', '::1'].includes(HOST) && !((REPORT_PUBLIC || (process.env.REPORT_USER && process.env.REPORT_PASS)) && process.env.ENROLL_KEY)) {
  console.error('Ağa açık çalıştırmak için rapor parolası ve kayıt anahtarı şart:\n  HOST=0.0.0.0 REPORT_USER=yonetici REPORT_PASS=<güçlü-parola> ENROLL_KEY=<uzun-rastgele> node server/server.mjs');
  process.exit(1);
}
const store = makeStore(process.env.DATA_DIR || path.join(here, 'data'), cfg);
const PID_RE = /^[0-9a-f-]{36}$/;
// Kayıt anahtarı: ayarlıysa onay ve olay gönderimi yalnız bu anahtarı taşıyan eklentiden kabul edilir
const ENROLL_KEY = process.env.ENROLL_KEY || '';
const keyOk = (req) => !ENROLL_KEY || req.headers['x-kayit-anahtari'] === ENROLL_KEY;

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req, limit = 2_000_000) {
  return new Promise((ok, bad) => {
    let n = 0; const chunks = [];
    req.on('data', (c) => { n += c.length; if (n > limit) { bad(new Error('çok büyük')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { bad(e); } });
  });
}
function reportAuth(req) {
  const u = process.env.REPORT_USER, p = process.env.REPORT_PASS;
  if (REPORT_PUBLIC || !u || !p) return true;
  const h = req.headers.authorization || '';
  return h === 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
}
// Detaylı panel: PANEL_USER/PANEL_PASS ayarlı değilse kapalı (404). Rapor ayarlarından bağımsız.
// PANEL_PUBLIC=1: panel parolasız açılır (kullanıcı kararı; ham kayıtlar internete açık olur)
function panelState(req) {
  if (process.env.PANEL_PUBLIC === '1') return 'ok';
  const u = process.env.PANEL_USER, p = process.env.PANEL_PASS;
  if (!u || !p) return 'kapali';
  const h = req.headers.authorization || '';
  const a = crypto.createHash('sha256').update(h).digest();
  const b = crypto.createHash('sha256').update('Basic ' + Buffer.from(u + ':' + p).toString('base64')).digest();
  return crypto.timingSafeEqual(a, b) ? 'ok' : 'parola';
}
function staticFile(res, name, type) {
  try { send(res, 200, fs.readFileSync(path.join(here, 'public', name)), type); } catch { send(res, 404, 'yok', 'text/plain'); }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (req.method === 'GET' && p === '/api/config') {
      return send(res, 200, { allowlist: cfg.allowlist.map(({ pattern, label, kind }) => ({ pattern, label, kind })), noticeVersion: cfg.noticeVersion, retentionDays: cfg.retentionDays });
    }
    if (req.method === 'POST' && (p === '/api/consent' || p === '/api/events') && !keyOk(req)) return send(res, 401, { hata: 'kayıt anahtarı' });
    if (req.method === 'POST' && p === '/api/consent') {
      const b = await readBody(req);
      if (!PID_RE.test(b.pid || '')) return send(res, 400, { hata: 'kimlik' });
      store.addConsent(b.pid, b.version || cfg.noticeVersion, b.at || new Date().toISOString());
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && p === '/api/events') {
      const b = await readBody(req);
      if (!PID_RE.test(b.pid || '')) return send(res, 400, { hata: 'kimlik' });
      if (!store.hasConsent(b.pid)) return send(res, 403, { hata: 'onay yok' });   // onaysız veri kabul edilmez
      const evs = (Array.isArray(b.events) ? b.events : []).slice(0, 1000).map((e) => sanitize(e, cfg.allowlist)).filter(Boolean);
      store.append(b.pid, evs);
      return send(res, 200, { ok: true, kabul: evs.length });
    }
    // Çalışanın kendi verisi: kimlik başlıkta gelir (URL'de değil)
    if (p === '/api/me') {
      const pid = String(req.headers['x-pid'] || '');
      if (!PID_RE.test(pid)) return send(res, 400, { hata: 'kimlik' });
      if (req.method === 'GET') {
        const evs = store.eventsOf(pid).map(({ pid: _, ...e }) => e);
        return send(res, 200, { onay: store.consents()[pid] || null, olaylar: evs, saklamaGun: cfg.retentionDays });
      }
      if (req.method === 'DELETE') return send(res, 200, { silinen: store.erase(pid) });
    }
    if (req.method === 'GET' && (p === '/panel' || p === '/api/panel')) {
      const st = panelState(req);
      if (st === 'kapali') return send(res, 404, 'Panel kapalı (PANEL_USER/PANEL_PASS ayarlanmadı)', 'text/plain; charset=utf-8');
      if (st !== 'ok') { res.setHeader('WWW-Authenticate', 'Basic realm="panel"'); return send(res, 401, p === '/panel' ? 'parola gerekli' : { hata: 'parola' }, p === '/panel' ? 'text/plain; charset=utf-8' : undefined); }
      if (p === '/panel') return staticFile(res, 'panel.html', 'text/html; charset=utf-8');
      return send(res, 200, panelData(store.allEvents(), cfg, store.aggregate(), Object.fromEntries(url.searchParams)));
    }
    if (req.method === 'GET' && p === '/api/report') {
      if (!reportAuth(req)) { res.setHeader('WWW-Authenticate', 'Basic realm="rapor"'); return send(res, 401, { hata: 'parola' }); }
      return send(res, 200, { ...analyze(store.allEvents(), cfg), arsiv: store.aggregate() });
    }
    if (req.method === 'GET' && (p === '/' || p === '/report' || p === '/rapor')) {
      if (!reportAuth(req)) { res.setHeader('WWW-Authenticate', 'Basic realm="rapor"'); return send(res, 401, 'parola gerekli', 'text/plain'); }
      return staticFile(res, 'report.html', 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && p === '/kur') {
      const html = fs.readFileSync(path.join(here, 'public', 'kur.html'), 'utf8').replace('{{STORE_URL}}', JSON.stringify(process.env.STORE_URL || '').slice(1, -1));
      return send(res, 200, html, 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && p === '/me.html') return staticFile(res, 'me.html', 'text/html; charset=utf-8');
    if (req.method === 'GET' && p === '/aydinlatma') {
      const md = fs.readFileSync(path.join(here, '..', 'AYDINLATMA.md'), 'utf8').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      return send(res, 200, `<!doctype html><meta charset="utf-8"><title>Aydınlatma Metni</title><body style="max-width:760px;margin:30px auto;padding:0 16px;font:16px/1.6 system-ui"><pre style="white-space:pre-wrap;font:inherit">${md}</pre>`, 'text/html; charset=utf-8');
    }
    send(res, 404, { hata: 'yok' });
  } catch (e) {
    send(res, 400, { hata: String(e.message || e) });
  }
});

server.listen(PORT, HOST, () => console.log(`İş Akışı sunucusu: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/rapor  (saklama ${cfg.retentionDays} gün, minKisi ${cfg.minKisi}${DEMO ? ', DEMO açık' : ''})`));

// Saklama süresi: açılışta ve 6 saatte bir
const runRetention = () => { const n = store.retention(); if (n) console.log(`saklama: ${n} günlük ham kayıt toplu sayıya çevrilip silindi`); };
runRetention();
setInterval(runRetention, 6 * 3600 * 1000).unref();

if (DEMO) (await import('./demo.mjs')).startDemo();
