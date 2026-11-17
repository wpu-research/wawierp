/* İş Akışı Kaydı — arka plan (MV3 service worker)
 *
 * Tek kapı: her olay `record()` üzerinden geçer. record() şu üç koşul yoksa olayı ATAR:
 *   1) çalışan onay vermiş, 2) kayıt duraklatılmamış, 3) site izin listesinde.
 * İzin listesi dışındaki siteler yalnız "diğer" olarak süre sayılır; adres tutulmaz.
 */
importScripts('common.js');

const DEFAULTS = {
  server: 'http://localhost:8787',
  key: '',               // kayıt anahtarı (paketle.py koyar); internetten gelen sahte veriyi engeller
  consent: null,          // { version, at }
  pid: null,              // takma kimlik (rastgele), ad/e-posta değil
  pausedUntil: 0,         // 0 = açık, -1 = süresiz duraklatıldı, >0 = zaman damgası
  allowlist: [],
  noticeVersion: null,
};
const IDLE_SEC = 60;            // 60 sn hareketsizlik = süre sayımı durur
const COPY_WINDOW_MS = 10 * 60 * 1000; // kopyala→yapıştır eşleşmesi en fazla 10 dk

async function st() {
  let v = await chrome.storage.local.get(Object.keys(DEFAULTS));
  if (!v.server) { await loadServer(); v = await chrome.storage.local.get(Object.keys(DEFAULTS)); } // adres her zaman paketten gelir
  return Object.assign({}, DEFAULTS, v);
}

function isPaused(s) { return s.pausedUntil === -1 || (s.pausedUntil > 0 && Date.now() < s.pausedUntil); }
function isRecording(s) { return !!(s.consent && s.pid && !isPaused(s)); }

// ---------- Simge (her zaman görünür durum) ----------
async function refreshBadge() {
  const s = await st();
  let text = '', color = '#888', title = 'İş Akışı Kaydı';
  if (!s.consent) { text = '?'; color = '#d97706'; title += ' — onay verilmedi, KAYIT YOK'; }
  else if (isPaused(s)) { text = 'II'; color = '#6b7280'; title += ' — DURAKLATILDI, kayıt yok'; }
  else { text = '●'; color = '#dc2626'; title += ' — KAYIT AÇIK (yalnız iş siteleri)'; }
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
  await chrome.action.setTitle({ title });
}

// ---------- Yapılandırma (izin listesi sunucudan) ----------
// Sunucu adresi: önce şirket ilkesi (chrome.storage.managed), yoksa paketteki ayar.json.
async function loadServer() {
  let server = null, key = null;
  try { const m = await chrome.storage.managed.get(['server', 'key']); if (m && m.server) { server = m.server; key = m.key || null; } } catch (e) {}
  if (!server) {
    try { const a = await (await fetch(chrome.runtime.getURL('ayar.json'))).json(); server = a.server; key = a.key || ''; } catch (e) {}
  }
  if (server) await chrome.storage.local.set({ server: String(server).replace(/\/+$/, ''), key: key || '' });
}

async function pullConfig() {
  await loadServer();
  const s = await st();
  try {
    const r = await fetch(s.server + '/api/config');
    if (!r.ok) return;
    const c = await r.json();
    await chrome.storage.local.set({ allowlist: c.allowlist || [], noticeVersion: c.noticeVersion });
  } catch (e) { /* sunucu kapalıysa eski liste geçerli */ }
}

// ---------- Kuyruk ----------
// Kuyruğa yazma ve kuyruktan silme sırayla yapılır (aynı anda gelen iki olay birbirini ezmesin)
let lock = Promise.resolve();
function serial(fn) { const p = lock.then(fn, fn); lock = p.catch(() => {}); return p; }

function enqueue(ev) {
  return serial(async () => {
    const { queue = [] } = await chrome.storage.local.get('queue');
    queue.push(ev);
    // Sunucuya uzun süre ulaşılamazsa sınırsız birikmesin
    while (queue.length > 5000) queue.shift();
    await chrome.storage.local.set({ queue });
    if (queue.length >= 50) setTimeout(flush, 0);
  });
}

let flushing = false;
async function flush() {
  if (flushing) return;
  flushing = true;
  try {
    const s = await st();
    const { queue = [] } = await chrome.storage.local.get('queue');
    if (!queue.length || !s.pid) return;
    const batch = queue.slice(0, 500);
    const r = await fetch(s.server + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kayit-Anahtari': s.key },
      body: JSON.stringify({ pid: s.pid, events: batch }),
    });
    if (r.ok) {
      await serial(async () => {
        const { queue: q2 = [] } = await chrome.storage.local.get('queue');
        await chrome.storage.local.set({ queue: q2.slice(batch.length) });
      });
      await chrome.storage.local.set({ lastSent: { at: Date.now(), n: batch.length } });
    } else if (r.status === 403) {
      // Sunucuda onay yok (ör. çalışan "verilerimi sil" dedi): kayıt durur, kuyruk silinir
      await chrome.storage.local.set({ consent: null, pid: null, queue: [] });
      await refreshBadge();
    }
  } catch (e) { /* sonra tekrar dener */ }
  finally { flushing = false; }
}

// Tüm olaylar buradan geçer.
async function record(ev) {
  const s = await st();
  if (!isRecording(s)) return;
  ev.ts = ev.ts || Date.now();
  if (ev.type === 'visit') {
    const site = IA.matchHost(ev.host, s.allowlist);
    if (!site) { await enqueue({ type: 'visit', ts: ev.ts, host: 'diğer', ms: ev.ms }); return; }
    ev.site = site.label;
  } else {
    const site = IA.matchHost(ev.host, s.allowlist);
    if (!site) return;                    // liste dışı sitede hiçbir eylem kaydedilmez
    ev.site = site.label;
    if (ev.srcHost) {                     // yapıştırmanın kaynağı da listede olmalı
      const src = IA.matchHost(ev.srcHost, s.allowlist);
      if (src) ev.srcSite = src.label; else { ev.srcHost = 'diğer'; ev.srcPath = ''; ev.srcSite = 'diğer'; }
    }
  }
  await enqueue(ev);
}

// ---------- Sayfada geçen süre ----------
// Aktif sekme + pencere odakta + kullanıcı hareketli iken süre sayılır.
let vlock = Promise.resolve();
function vserial(fn) { const p = vlock.then(fn, fn); vlock = p.catch(() => {}); return p; }
const endVisit = () => vserial(_endVisit);
const startVisit = (tab) => vserial(() => _startVisit(tab));

async function _endVisit() {
  const { cur } = await chrome.storage.session.get('cur');
  if (!cur) return;
  await chrome.storage.session.remove('cur');
  const ms = Date.now() - cur.start;
  if (ms < 1000) return;
  await record({ type: 'visit', ts: cur.start, host: cur.host, path: cur.path, ms });
}

// Aynı sayfada uzun kalınırsa süre dakikada bir parça parça gönderilir (yoksa ayrılana kadar hiç veri gitmez)
const checkpoint = () => vserial(async () => {
  const { cur } = await chrome.storage.session.get('cur');
  if (!cur) return;
  const now = Date.now();
  if (now - cur.start < 50000) return;
  await record({ type: 'visit', ts: cur.start, host: cur.host, path: cur.path, ms: now - cur.start });
  await chrome.storage.session.set({ cur: Object.assign({}, cur, { start: now }) });
});

async function _startVisit(tab) {
  await _endVisit();
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) return;
  const u = new URL(tab.url);
  const { lastHost } = await chrome.storage.session.get('lastHost');
  if (lastHost && lastHost !== u.host) {
    const s = await st();
    const a = IA.matchHost(lastHost, s.allowlist), b = IA.matchHost(u.host, s.allowlist);
    if (a || b) await record({ type: 'switch', host: b ? u.host : lastHost,
      from: a ? a.label : 'diğer', to: b ? b.label : 'diğer' });
  }
  await chrome.storage.session.set({ lastHost: u.host,
    cur: { tabId: tab.id, host: u.host, path: IA.normPath(u.pathname), start: Date.now() } });
}

async function activeTab() {
  const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return t;
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => startVisit(await chrome.tabs.get(tabId)));
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!info.url || !tab.active) return;   // tam sayfa ya da tek-sayfa uygulama gezinmesi
  const { cur } = await chrome.storage.session.get('cur');
  if (cur && cur.tabId === tabId && cur.path === IA.normPath(new URL(info.url).pathname) &&
      cur.host === new URL(info.url).host) return;
  startVisit(tab);
});
chrome.windows.onFocusChanged.addListener(async (wid) => {
  if (wid === chrome.windows.WINDOW_ID_NONE) endVisit(); else startVisit(await activeTab());
});
chrome.idle.setDetectionInterval(IDLE_SEC);
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'active') startVisit(await activeTab()); else endVisit();
});

// ---------- İndirme (yalnız uzantı + site) ----------
chrome.downloads.onCreated.addListener((d) => {
  try {
    const from = new URL(d.referrer || d.finalUrl || d.url);
    record({ type: 'download', host: from.host, path: IA.normPath(from.pathname), ext: IA.ext(d.filename || d.finalUrl || d.url) });
  } catch (e) { /* yok say */ }
});

// ---------- Sayfa betiğinden gelen mesajlar ----------
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    if (msg.kind === 'state') {
      const s = await st();
      const ok = isRecording(s) && !!IA.matchHost(msg.host, s.allowlist);
      reply({ record: ok });
      return;
    }
    if (msg.kind === 'event') {
      const ev = msg.ev;
      if (ev.type === 'copy') {
        // İçerik değil, yalnız "nereden kopyalandı" bilgisi saklanır
        await chrome.storage.session.set({ lastCopy: { host: ev.host, path: ev.path, ts: Date.now() } });
        await record(ev);
      } else if (ev.type === 'paste') {
        const { lastCopy } = await chrome.storage.session.get('lastCopy');
        if (lastCopy && Date.now() - lastCopy.ts < COPY_WINDOW_MS) {
          ev.srcHost = lastCopy.host; ev.srcPath = lastCopy.path; ev.gapMs = Date.now() - lastCopy.ts;
        } else { ev.srcHost = 'dış uygulama'; ev.srcPath = ''; }
        await record(ev);
      } else {
        await record(ev);
      }
      reply({ ok: true });
      return;
    }
    if (msg.kind === 'ui') { reply(await uiAction(msg)); }
  })();
  return true;
});

// ---------- Açılır pencere / onay sayfası işlemleri ----------
async function uiAction(msg) {
  const s = await st();
  if (msg.action === 'status') {
    const { queue = [] } = await chrome.storage.local.get('queue');
    return { consent: s.consent, paused: isPaused(s), pausedUntil: s.pausedUntil, pid: s.pid, server: s.server,
      queued: queue.length, allowlist: s.allowlist, lastSent: (await chrome.storage.local.get('lastSent')).lastSent || null };
  }
  if (msg.action === 'consent') {
    const pid = s.pid || crypto.randomUUID();
    const consent = { version: s.noticeVersion || '1', at: new Date().toISOString() };
    await chrome.storage.local.set({ pid, consent, pausedUntil: 0 });
    try { await fetch(s.server + '/api/consent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Kayit-Anahtari': s.key },
      body: JSON.stringify({ pid, version: consent.version, at: consent.at }) }); } catch (e) {}
    await refreshBadge();
    return { ok: true };
  }
  if (msg.action === 'withdraw') {
    // Onay geri çekilir: kuyruk silinir, sunucudaki tüm olaylar silinir, takma kimlik unutulur.
    try { await fetch(s.server + '/api/me', { method: 'DELETE', headers: { 'X-Pid': s.pid || '' } }); } catch (e) {}
    await chrome.storage.local.set({ consent: null, pid: null, queue: [], pausedUntil: 0 });
    await chrome.storage.session.clear();
    await refreshBadge();
    return { ok: true };
  }
  if (msg.action === 'pause') {
    await endVisit();
    await chrome.storage.local.set({ pausedUntil: msg.minutes ? Date.now() + msg.minutes * 60000 : -1 });
    if (msg.minutes) chrome.alarms.create('resume', { when: Date.now() + msg.minutes * 60000 });
    await refreshBadge();
    return { ok: true };
  }
  if (msg.action === 'resume') {
    await chrome.storage.local.set({ pausedUntil: 0 });
    await refreshBadge();
    startVisit(await activeTab());
    return { ok: true };
  }
  if (msg.action === 'flush') { await endVisit(); await flush(); startVisit(await activeTab()); return { ok: true }; }
  return { ok: false };
}

// ---------- Zamanlayıcılar ----------
chrome.alarms.create('flush', { periodInMinutes: 1 });
chrome.alarms.create('config', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name === 'flush') { await checkpoint(); flush(); }
  if (a.name === 'config') pullConfig();
  if (a.name === 'resume') { await chrome.storage.local.set({ pausedUntil: 0 }); refreshBadge(); }
});

chrome.runtime.onInstalled.addListener(async (d) => {
  await pullConfig();
  await refreshBadge();
  if (d.reason === 'install') chrome.tabs.create({ url: 'onboarding.html' });
});
chrome.runtime.onStartup.addListener(async () => { await pullConfig(); refreshBadge(); });
pullConfig().then(refreshBadge);
