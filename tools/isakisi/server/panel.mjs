// Detaylı yönetici paneli çözümlemeleri. Çıktıda takma kimlik (pid) ASLA yoktur:
// kişiler yerine "oturum" numarası kullanılır. Kişi bazlı puan/döküm üretilmez.
import { analyze } from './analyze.mjs';

const GAP_MS = 15 * 60 * 1000;
const TZ = process.env.PANEL_TZ || 'Europe/Berlin';
const WD = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' });
const WDI = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
function parts(ts) {
  const o = {};
  for (const p of fmt.formatToParts(ts)) o[p.type] = p.value;
  return { gun: `${o.year}-${o.month}-${o.day}`, saat: +o.hour, hg: WDI[o.weekday] ?? 0 };
}
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const r1 = (x) => Math.round(x * 10) / 10;
const top = (o, n = 20) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

// Oturumlar: kişi başına 15 dk boşlukla bölünür; başlangıç zamanına göre genel numaralanır.
function buildSessions(events) {
  const byPid = new Map();
  for (const e of events) { if (!byPid.has(e.pid)) byPid.set(e.pid, []); byPid.get(e.pid).push(e); }
  const list = [];
  for (const evs of byPid.values()) {
    evs.sort((a, b) => a.ts - b.ts);
    let cur = null, last = 0;
    for (const e of evs) {
      if (!cur || e.ts - last > GAP_MS) { cur = { start: e.ts, end: e.ts, evs: [] }; list.push(cur); }
      cur.evs.push(e);
      last = Math.max(last, e.ts + (e.ms || 0));
      cur.end = Math.max(cur.end, last);
    }
  }
  list.sort((a, b) => a.start - b.start);
  list.forEach((s, i) => { s.no = i + 1; for (const e of s.evs) e._o = s.no; });
  return list;
}

function rawRecord(e) {
  const r = { ts: e.ts, zaman: new Date(e.ts).toISOString(), gun: parts(e.ts).gun, oturum: e._o, tur: e.type, site: e.site || '', host: e.host || '', path: e.path || '' };
  if (e.type === 'visit') r.ms = e.ms || 0;
  if (e.type === 'switch') { r.from = e.from || ''; r.to = e.to || ''; }
  if (e.type === 'click') { r.kind = e.kind || ''; r.label = e.label || ''; }
  if (e.type === 'submit') r.fields = Array.isArray(e.fields) ? e.fields : [];
  if (e.type === 'paste') { r.field = e.field || ''; r.srcSite = e.srcSite || ''; r.srcPath = e.srcPath || ''; r.gapMs = e.gapMs ?? null; }
  if (e.type === 'download') r.ext = e.ext || '';
  if (e.type === 'upload') { r.count = e.count || 0; r.exts = Array.isArray(e.exts) ? e.exts : []; }
  return r;
}

function filterRecords(recs, q) {
  const tur = q.tur || '', site = q.site || '', gun = q.gun || '', s = (q.q || '').toLowerCase();
  return recs.filter((r) => {
    if (tur && r.tur !== tur) return false;
    if (site && r.site !== site) return false;
    if (gun && r.gun !== gun) return false;
    if (s) {
      const hay = [r.path, r.label, r.field, (r.fields || []).join(' '), r.srcPath].join('\n').toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });
}

export function panelData(events, cfg, archive, query = {}) {
  events = events.filter((e) => e && e.ts && e.pid).map((e) => ({ ...e }));
  const sess = buildSessions(events);
  const recsAll = events.slice().sort((a, b) => b.ts - a.ts || 0).map(rawRecord);
  const fl = filterRecords(recsAll, query);
  const boyut = Math.max(1, Math.min(5000, parseInt(query.boyut, 10) || 200));
  const sayfaSay = Math.max(1, Math.ceil(fl.length / boyut));
  const sayfa = Math.max(1, Math.min(sayfaSay, parseInt(query.sayfa, 10) || 1));
  const kayitlar = { toplam: fl.length, sayfa, sayfaSay, boyut, satirlar: fl.slice((sayfa - 1) * boyut, sayfa * boyut) };
  const secenek = {
    turler: [...new Set(recsAll.map((r) => r.tur))].sort(),
    siteler: [...new Set(recsAll.map((r) => r.site).filter(Boolean))].sort(),
    gunler: [...new Set(recsAll.map((r) => r.gun))].sort().reverse(),
  };
  if (query.sadece === 'kayit') return { kayitlar, secenek };

  const base = analyze(events.map((e) => ({ ...e })), { ...cfg, minKisi: 1 });

  // Özet
  const visitMs = events.reduce((a, e) => a + (e.type === 'visit' ? e.ms || 0 : 0), 0);
  const gunler = new Set(recsAll.map((r) => r.gun));
  const sureler = sess.map((s) => s.end - s.start);
  const ozet = {
    gun: gunler.size, olay: events.length, oturum: sess.length,
    toplamAktifDakika: r1(visitMs / 60000),
    ortOturumDakika: sess.length ? r1(sureler.reduce((a, b) => a + b, 0) / sess.length / 60000) : 0,
    ortOturumOlay: sess.length ? r1(events.length / sess.length) : 0,
    turSayilari: {},
    ilk: events.length ? Math.min(...events.map((e) => e.ts)) : null,
    son: events.length ? Math.max(...events.map((e) => e.ts)) : null,
  };
  for (const e of events) inc(ozet.turSayilari, e.type);

  // Isı haritası (hafta günü × saat, dakika) — ziyaret süresi saat sınırlarında bölünür
  const isi = Array.from({ length: 7 }, () => Array(24).fill(0));
  // Günlük eğilim
  const gunluk = {};
  const gd = (g) => (gunluk[g] ||= { gun: g, siteDk: {}, olay: {}, toplamDk: 0 });
  for (const e of events) {
    const p = parts(e.ts);
    const d = gd(p.gun);
    inc(d.olay, e.type);
    if (e.type !== 'visit') continue;
    d.toplamDk += (e.ms || 0) / 60000;
    inc(d.siteDk, e.site || 'diğer', (e.ms || 0) / 60000);
    let t = e.ts; const end = e.ts + (e.ms || 0);
    while (t < end) {
      const q = parts(t);
      const next = Math.min(end, (Math.floor(t / 3600000) + 1) * 3600000);
      isi[q.hg][q.saat] += (next - t) / 60000;
      t = next;
    }
  }
  const gunlukList = Object.values(gunluk).sort((a, b) => a.gun.localeCompare(b.gun)).map((d) => ({ ...d, toplamDk: r1(d.toplamDk), siteDk: Object.fromEntries(Object.entries(d.siteDk).map(([k, v]) => [k, r1(v)])) }));
  const arsiv = Object.entries((archive && archive.days) || {}).sort().map(([gun, v]) => ({ gun, siteDk: v.siteMin || {}, olay: v.types || {}, yapistir: v.paste || {}, toplamDk: Math.round(Object.values(v.siteMin || {}).reduce((a, b) => a + b, 0)) }));

  // Site geçiş matrisi
  const gec = {};
  for (const e of events) if (e.type === 'switch') inc(gec, (e.from || '?') + '\u0001' + (e.to || '?'));
  const gecis = Object.entries(gec).map(([k, n]) => { const [from, to] = k.split('\u0001'); return { from, to, sayi: n }; }).sort((a, b) => b.sayi - a.sayi);

  // Tıklamalar
  const dugme = {}, link = {};
  for (const e of events) {
    if (e.type !== 'click' || !e.label) continue;
    if (e.kind === 'link') inc(link, e.site + '\u0001' + e.label); else inc(dugme, e.site + '\u0001' + e.label);
  }
  const ayir = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, sayi]) => { const [site, etiket] = k.split('\u0001'); return { site, etiket, sayi }; });

  // Formlar
  const formlar = {};
  for (const e of events) {
    if (e.type !== 'submit') continue;
    const k = e.site + '\u0001' + e.path;
    const f = (formlar[k] ||= { site: e.site, path: e.path, gonderim: 0, alanlar: {} });
    f.gonderim++;
    for (const a of e.fields || []) inc(f.alanlar, a);
  }
  const formList = Object.values(formlar).sort((a, b) => b.gonderim - a.gonderim).map((f) => ({ site: f.site, path: f.path, gonderim: f.gonderim, alanlar: top(f.alanlar, 30).map(([ad, sayi]) => ({ ad, sayi })) }));

  // Dosyalar
  const ind = {}, yuk = {};
  for (const e of events) {
    if (e.type === 'download') inc(ind, e.site + '\u0001' + (e.ext || '?'));
    if (e.type === 'upload') for (const x of (e.exts && e.exts.length ? e.exts : ['?'])) inc(yuk, e.site + '\u0001' + x);
  }
  const dosyaList = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, sayi]) => { const [site, tur] = k.split('\u0001'); return { site, tur, sayi }; });

  // Yapıştırma kaynakları
  const yk = {}, dis = {};
  for (const e of events) {
    if (e.type !== 'paste') continue;
    const k = [e.srcSite || '?', e.site, e.path, e.field || ''].join('\u0001');
    inc(yk, k);
    if (e.srcSite === 'dış uygulama') inc(dis, [e.site, e.path, e.field || ''].join('\u0001'));
  }
  const yapistir = Object.entries(yk).sort((a, b) => b[1] - a[1]).map(([k, sayi]) => { const [kaynak, site, path, alan] = k.split('\u0001'); return { kaynak, site, path, alan, sayi }; });
  const disUyg = Object.entries(dis).sort((a, b) => b[1] - a[1]).map(([k, sayi]) => { const [site, path, alan] = k.split('\u0001'); return { site, path, alan, sayi }; });

  // Site bazında döküm
  const sb = {};
  for (const e of events) {
    const s = e.site || 'diğer';
    const o = (sb[s] ||= { site: s, dakika: 0, sayfalar: {}, eylemler: {} });
    if (e.type === 'visit') { o.dakika += (e.ms || 0) / 60000; if (e.path) inc(o.sayfalar, e.path, (e.ms || 0) / 60000); }
    inc(o.eylemler, e.type);
  }
  const siteDetay = Object.values(sb).sort((a, b) => b.dakika - a.dakika).map((o) => ({
    site: o.site, dakika: r1(o.dakika),
    sayfalar: top(o.sayfalar, 15).map(([path, dk]) => ({ path, dakika: r1(dk) })),
    eylemler: o.eylemler,
  }));

  return {
    olusturuldu: new Date().toISOString(), saatDilimi: TZ, haftaGunleri: WD,
    ozet, analiz: base,
    isiHaritasi: isi.map((s) => s.map(r1)),
    gunluk: gunlukList, arsiv,
    gecis: gecis,
    dugmeler: ayir(dugme, 40), linkler: ayir(link, 40),
    formlar: formList,
    indirme: dosyaList(ind), yukleme: dosyaList(yuk),
    yapistirKaynak: yapistir, disUygulama: disUyg,
    siteDetay, kayitlar, secenek,
  };
}
