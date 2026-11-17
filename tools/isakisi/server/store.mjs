// Saklama katmanı: ek paket yok, düz dosya.
//   data/raw/YYYY-MM-DD.jsonl   ham olaylar (takma kimlikle) — saklama süresi dolunca silinir
//   data/consents.json          onay kayıtları (takma kimlik, sürüm, zaman)
//   data/aggregate.json         silinen günlerin KİŞİSİZ toplu sayıları
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const IA = require('../extension/common.js');

export function makeStore(dir, cfg) {
  const rawDir = path.join(dir, 'raw');
  fs.mkdirSync(rawDir, { recursive: true });
  const consentsFile = path.join(dir, 'consents.json');
  const aggFile = path.join(dir, 'aggregate.json');
  const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
  const writeJson = (f, v) => { fs.writeFileSync(f + '.tmp', JSON.stringify(v, null, 1)); fs.renameSync(f + '.tmp', f); };
  const day = (ts) => new Date(ts).toISOString().slice(0, 10);

  function consents() { return readJson(consentsFile, {}); }
  function hasConsent(pid) { const c = consents()[pid]; return !!(c && !c.withdrawnAt); }
  function addConsent(pid, version, at) {
    const c = consents();
    c[pid] = { version: String(version).slice(0, 20), at: String(at).slice(0, 30) };
    writeJson(consentsFile, c);
  }

  function rawFiles() { return fs.readdirSync(rawDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)).sort(); }
  function readDay(f) {
    return fs.readFileSync(path.join(rawDir, f), 'utf8').split('\n').filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  }
  function allEvents() { return rawFiles().flatMap(readDay); }

  function append(pid, events) {
    const byDay = {};
    for (const e of events) (byDay[day(e.ts)] ||= []).push(JSON.stringify({ pid, ...e }));
    for (const [d, lines] of Object.entries(byDay)) fs.appendFileSync(path.join(rawDir, d + '.jsonl'), lines.join('\n') + '\n');
  }

  function eventsOf(pid) { return allEvents().filter((e) => e.pid === pid); }

  // Çalışanın silme hakkı / onayı geri çekme: tüm ham kayıtları silinir.
  function erase(pid) {
    let n = 0;
    for (const f of rawFiles()) {
      const evs = readDay(f), keep = evs.filter((e) => e.pid !== pid);
      n += evs.length - keep.length;
      if (keep.length !== evs.length) fs.writeFileSync(path.join(rawDir, f), keep.map((e) => JSON.stringify(e)).join('\n') + (keep.length ? '\n' : ''));
    }
    const c = consents();
    if (c[pid]) { c[pid] = { withdrawnAt: new Date().toISOString() }; writeJson(consentsFile, c); }
    return n;
  }

  // Saklama süresi dolan günleri kişisiz toplu sayılara çevirip siler.
  function retention(now = Date.now()) {
    const cutoff = day(now - cfg.retentionDays * 86400000);
    const agg = readJson(aggFile, { days: {} });
    let removed = 0;
    for (const f of rawFiles()) {
      const d = f.slice(0, 10);
      if (d >= cutoff) continue;
      const evs = readDay(f);
      const siteMin = {}, types = {}, paste = {};
      for (const e of evs) {
        types[e.type] = (types[e.type] || 0) + 1;
        if (e.type === 'visit') siteMin[e.site || 'diğer'] = (siteMin[e.site || 'diğer'] || 0) + e.ms / 60000;
        if (e.type === 'paste') { const k = (e.srcSite || e.srcHost) + ' → ' + e.site; paste[k] = (paste[k] || 0) + 1; }
      }
      for (const k in siteMin) siteMin[k] = Math.round(siteMin[k]);
      agg.days[d] = { siteMin, types, paste, kisi: new Set(evs.map((e) => e.pid)).size };
      fs.unlinkSync(path.join(rawDir, f));
      removed++;
    }
    writeJson(aggFile, agg);
    return removed;
  }

  return { hasConsent, addConsent, append, allEvents, eventsOf, erase, retention, aggregate: () => readJson(aggFile, { days: {} }), consents };
}

// Sunucu tarafı ikinci süzgeç: eklentiye güvenmeden yalnız izinli alanlar geçer.
const MAX_MS = 4 * 3600 * 1000;
const s = (v, n = 60) => (typeof v === 'string' ? v.slice(0, n) : '');
export function sanitize(ev, allowlist) {
  if (!ev || typeof ev !== 'object') return null;
  const ts = Number(ev.ts);
  if (!Number.isFinite(ts) || ts < Date.now() - 40 * 86400000 || ts > Date.now() + 3600000) return null;
  const site = IA.matchHost(ev.host, allowlist);
  if (ev.type === 'visit') {
    const ms = Math.max(0, Math.min(MAX_MS, Number(ev.ms) || 0));
    if (!site) return { type: 'visit', ts, host: 'diğer', site: 'diğer', ms };
    return { type: 'visit', ts, host: s(ev.host), site: site.label, path: IA.normPath(ev.path), ms };
  }
  if (!site) return null;
  const base = { type: ev.type, ts, host: s(ev.host), site: site.label, path: IA.normPath(ev.path) };
  switch (ev.type) {
    case 'switch': return { ...base, from: s(ev.from, 40), to: s(ev.to, 40) };
    case 'click': return { ...base, kind: ev.kind === 'link' ? 'link' : 'button', label: ev.kind === 'link' ? s(ev.label, 120) : IA.cleanLabel(ev.label) };
    case 'submit': return { ...base, fields: (Array.isArray(ev.fields) ? ev.fields : []).slice(0, 30).map((f) => IA.cleanLabel(f)) };
    case 'copy': return base;
    case 'paste': {
      const src = IA.matchHost(ev.srcHost, allowlist);
      return { ...base, field: ev.field ? IA.cleanLabel(ev.field) : null,
        srcSite: src ? src.label : (ev.srcHost === 'dış uygulama' ? 'dış uygulama' : 'diğer'),
        srcPath: src ? IA.normPath(ev.srcPath) : '', gapMs: Number.isFinite(+ev.gapMs) ? Math.min(+ev.gapMs, 600000) : null };
    }
    case 'download': return { ...base, ext: IA.ext('x.' + s(ev.ext, 6)) };
    case 'upload': return { ...base, count: Math.min(+ev.count || 0, 100), exts: (ev.exts || []).slice(0, 20).map((x) => IA.ext('x.' + s(x, 6))) };
    default: return null;
  }
}
