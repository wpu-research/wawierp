// Analiz: olayları İŞ AKIŞI düzeyinde özetler. Çıktıda takma kimlik bile yoktur;
// yalnız "kaç kişide görüldü" sayısı vardır. minKisi'den az kişide görülen akış gösterilmez
// (küçük ekipte tek kişiyi ayırt etmeyi önlemek için).

const GAP_MS = 15 * 60 * 1000;     // 15 dk boşluk = yeni oturum
const WORKDAYS = 5;

function token(e) {
  switch (e.type) {
    case 'visit': return e.site === 'diğer' || e.ms < 2000 ? null : `${e.site} ${e.path}`;
    case 'click': return e.kind === 'button' && e.label ? `${e.site}: [${e.label}]` : null;
    case 'submit': return `${e.site} ${e.path} → form gönder`;
    case 'copy': return `${e.site} ${e.path} → kopyala`;
    case 'paste': return `${e.site} ${e.path} ← yapıştır${e.field ? ' (' + e.field + ')' : ''}`;
    case 'download': return `${e.site} → ${e.ext} indir`;
    case 'upload': return `${e.site} → ${(e.exts || []).join(',')} yükle`;
    default: return null;
  }
}

function sessions(events) {
  const byPid = {};
  for (const e of events) (byPid[e.pid] ||= []).push(e);
  const out = [];
  for (const [pid, evs] of Object.entries(byPid)) {
    evs.sort((a, b) => a.ts - b.ts);
    let cur = [];
    let last = 0;
    for (const e of evs) {
      if (cur.length && e.ts - last > GAP_MS) { out.push({ pid, steps: cur }); cur = []; }
      last = e.ts + (e.ms || 0);
      const t = token(e);
      if (!t) continue;
      if (cur.length && cur[cur.length - 1].t === t) { cur[cur.length - 1].end = e.ts + (e.ms || 0); continue; }
      cur.push({ t, ts: e.ts, end: e.ts + (e.ms || 0), site: e.site });
    }
    if (cur.length) out.push({ pid, steps: cur });
  }
  return out;
}

const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

function chains(sess, cfg) {
  const grams = new Map();
  for (const s of sess) {
    const st = s.steps;
    for (let n = 3; n <= 16; n++) {
      for (let i = 0; i + n <= st.length; i++) {
        const seq = st.slice(i, i + n).map((x) => x.t);
        if (new Set(seq).size < 2) continue;
        const k = seq.join('\u0001');
        let g = grams.get(k);
        if (!g) grams.set(k, (g = { seq, sites: [...new Set(st.slice(i, i + n).map((x) => x.site))], count: 0, pids: new Set(), spans: [], lastEnd: {} }));
        // aynı oturumda örtüşen tekrarları sayma
        const key = s.pid + '|' + s.steps[0].ts;
        if (g.lastEnd[key] !== undefined && i < g.lastEnd[key]) continue;
        g.lastEnd[key] = i + n;
        g.count++;
        g.pids.add(s.pid);
        g.spans.push(st[i + n - 1].end - st[i].ts);
      }
    }
  }
  let acc = [...grams.values()].filter((g) => g.count >= cfg.minTekrar && g.pids.size >= cfg.minKisi);
  // Aynı iş akışının parçalarını tek zincirde topla: en çok "kapsayan" (tekrar × uzunluk)
  // zincir seçilir; adımlarının yarısından fazlası seçilmiş bir zincirle ortaksa elenir.
  const score = (g) => g.count * g.seq.length;
  acc.sort((a, b) => score(b) - score(a) || b.count - a.count);
  const kept = [];
  for (const g of acc) {
    const set = new Set(g.seq);
    const dup = kept.some((h) => { const hs = new Set(h.seq); let c = 0; for (const t of set) if (hs.has(t)) c++; return c / set.size > 0.5; });
    if (!dup) kept.push(g);
  }
  return kept.map((g) => {
    const avgSec = Math.round(median(g.spans) / 1000);
    const sites = g.sites;
    return { adimlar: g.seq, tekrar: g.count, kisi: g.pids.size, ortSaniye: avgSec, toplamDakika: Math.round((g.count * avgSec) / 60), siteler: sites };
  }).sort((a, b) => b.toplamDakika - a.toplamDakika).slice(0, 20);
}

export function analyze(events, cfg) {
  events = events.filter((e) => e && e.ts);
  const days = new Set(events.map((e) => new Date(e.ts).toISOString().slice(0, 10)));
  const nDays = Math.max(1, days.size);
  const perWeek = (x) => Math.round((x / nDays) * WORKDAYS);
  const kisiSay = new Set(events.map((e) => e.pid)).size;

  // 1) En çok vakit alan siteler
  const siteMs = {};
  for (const e of events) if (e.type === 'visit') siteMs[e.site] = (siteMs[e.site] || 0) + e.ms;
  const totalMs = Object.values(siteMs).reduce((a, b) => a + b, 0) || 1;
  const pageMs = {};
  for (const e of events) if (e.type === 'visit' && e.site !== 'diğer') { const k = e.site + ' ' + e.path; pageMs[k] = (pageMs[k] || 0) + e.ms; }
  const siteler = Object.entries(siteMs).map(([site, ms]) => ({ site, dakika: Math.round(ms / 60000 * 10) / 10, yuzde: Math.round((ms / totalMs) * 100) }))
    .sort((a, b) => b.dakika - a.dakika);
  const sayfalar = Object.entries(pageMs).map(([k, ms]) => ({ sayfa: k, dakika: Math.round(ms / 60000 * 10) / 10 }))
    .sort((a, b) => b.dakika - a.dakika).slice(0, 15);

  // 2) Siteler arası kopyala-yapıştır akışları
  const flows = new Map();
  for (const e of events) {
    if (e.type !== 'paste') continue;
    const k = [e.srcSite, e.srcPath, e.site, e.path].join('|');
    let f = flows.get(k);
    if (!f) flows.set(k, (f = { kaynak: `${e.srcSite}${e.srcPath ? ' ' + e.srcPath : ''}`, hedef: `${e.site} ${e.path}`, kaynakSite: e.srcSite, hedefSite: e.site, alanlar: {}, count: 0, pids: new Set(), gaps: [] }));
    f.count++; f.pids.add(e.pid);
    if (e.field) f.alanlar[e.field] = (f.alanlar[e.field] || 0) + 1;
    if (e.gapMs) f.gaps.push(e.gapMs);
  }
  const kopyala = [...flows.values()].filter((f) => f.pids.size >= cfg.minKisi).map((f) => ({
    kaynak: f.kaynak, hedef: f.hedef, kaynakSite: f.kaynakSite, hedefSite: f.hedefSite,
    alanlar: Object.entries(f.alanlar).sort((a, b) => b[1] - a[1]).map(([a]) => a),
    tekrar: f.count, kisi: f.pids.size, ortSaniye: Math.round(median(f.gaps) / 1000) || null,
  })).sort((a, b) => b.tekrar - a.tekrar);

  // 3) Tekrar eden adım zincirleri
  const sess = sessions(events);
  const zincirler = chains(sess, cfg);

  // 4) İndir → yükle (dosya taşıma)
  const dosya = new Map();
  const byPid = {};
  for (const e of events) (byPid[e.pid] ||= []).push(e);
  for (const [pid, evs] of Object.entries(byPid)) {
    evs.sort((a, b) => a.ts - b.ts);
    for (let i = 0; i < evs.length; i++) {
      if (evs[i].type !== 'download') continue;
      const up = evs.slice(i + 1).find((x) => x.type === 'upload' && x.ts - evs[i].ts < GAP_MS && x.site !== evs[i].site);
      if (!up) continue;
      const k = `${evs[i].site}|${up.site}|${evs[i].ext}`;
      let d = dosya.get(k);
      if (!d) dosya.set(k, (d = { kaynak: evs[i].site, hedef: up.site, tur: evs[i].ext, count: 0, pids: new Set(), gaps: [] }));
      d.count++; d.pids.add(pid); d.gaps.push(up.ts - evs[i].ts);
    }
  }

  // 5) Otomasyon adayları (Olay → Kural → Onay şablonuyla)
  const adaylar = [];
  for (const f of kopyala) {
    if (f.kaynakSite === f.hedefSite) continue;
    const sn = Math.min(f.ortSaniye || 20, 120) + 5;
    adaylar.push({
      tur: 'Veri aktarımı (kopyala-yapıştır)',
      baslik: `${f.kaynakSite} → ${f.hedefSite}${f.alanlar.length ? ': ' + f.alanlar.slice(0, 3).join(', ') : ''}`,
      kanit: `${f.tekrar} kez, ${f.kisi} kişide; kopyala→yapıştır arası ortalama ${f.ortSaniye ?? '?'} sn`,
      haftalikDakika: perWeek((f.tekrar * sn) / 60),
      oneri: { olay: `${f.kaynakSite}'ta kayıt oluştu/değişti (${f.kaynak})`, kural: `Alan(lar)ı API/entegrasyonla ${f.hedefSite}'a otomatik yaz${f.alanlar.length ? ' (' + f.alanlar.slice(0, 3).join(', ') + ')' : ''}`, onay: 'İlk 2 hafta insan onayı, sonra otomatik' },
    });
  }
  for (const z of zincirler) {
    if (z.siteler.length < 2 && !z.adimlar.some((a) => /form gönder|yapıştır/.test(a))) continue;
    adaylar.push({
      tur: z.siteler.length >= 2 ? 'Çok siteli tekrar eden işlem' : 'Tek sitede tekrar eden form işi',
      baslik: z.siteler.join(' → '),
      kanit: `${z.adimlar.length} adımlık zincir ${z.tekrar} kez, ${z.kisi} kişide; her biri ~${z.ortSaniye} sn`,
      haftalikDakika: perWeek((z.tekrar * z.ortSaniye * 0.7) / 60),
      adimlar: z.adimlar,
      oneri: { olay: `Zincirin başlangıcı: ${z.adimlar[0]}`, kural: 'Adımları tek bir WawiERP kuralı / toplu işlemle yap', onay: 'Toplu işlem önizlemesi + tek tık onay' },
    });
  }
  for (const d of dosya.values()) {
    if (d.pids.size < cfg.minKisi || d.count < cfg.minTekrar) continue;
    adaylar.push({
      tur: 'Dosya taşıma (indir → yükle)',
      baslik: `${d.kaynak} → ${d.hedef} (${d.tur})`,
      kanit: `${d.count} kez, ${d.pids.size} kişide; indir→yükle arası ~${Math.round(median(d.gaps) / 1000)} sn`,
      haftalikDakika: perWeek((d.count * (Math.min(median(d.gaps) / 1000, 300) + 10)) / 60),
      oneri: { olay: `${d.kaynak}'ta yeni ${d.tur} dosyası`, kural: `Dosyayı ${d.hedef}'a otomatik aktar`, onay: 'Gerekmez (yalnız hata bildirimi)' },
    });
  }
  adaylar.sort((a, b) => b.haftalikDakika - a.haftalikDakika);

  return {
    olusturuldu: new Date().toISOString(),
    gozlem: { gun: nDays, kisi: kisiSay, olay: events.length, minKisi: cfg.minKisi },
    siteler, sayfalar, kopyala, zincirler, adaylar,
    toplamHaftalikDakika: adaylar.reduce((a, b) => a + b.haftalikDakika, 0),
  };
}
