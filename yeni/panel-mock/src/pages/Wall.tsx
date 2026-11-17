/* Duvar ekranı (TV modu): kararlar/0012. Ofis televizyonunda sayfalar sırayla döner; kenar çubuğu ve üst çubuk yoktur.
   Ciro tek kuralla (isRevenue: iptal ve iade hariç) hesaplanır; Genel bakış ve Kanal ve şirket kârı ile aynı kural.
   TRY/USD ayrı satırda kalır, euro toplamına ve euro sipariş sayısına eklenmez. Veriler örnektir. */
import { useEffect, useMemo, useState } from 'react'
import { Expand, Pause, Play, Settings, X } from 'lucide-react'
import { ACCOUNTS, CHANNEL, COMPANIES, MOVES0, NOW, ago, account, dayKey, fmtMoney, fmtNum, isRevenue, product, type ChannelType, type Cur, type Order } from '../data'
import { useStore } from '../store'
import { kindsOf } from './Quality'

const KEY = 'wawi-mock-wall'
const CATS = ['Toner', 'Parfüm', 'Saat', 'Elektronik', '3D baskı', 'Ofis'] // Product.cat değerleri
interface Cfg { companies: string[]; pages: { sales: boolean; targets: boolean; health: boolean }; secs: number; targets: Record<string, number>; ticker: string[] }
const DEF: Cfg = {
  companies: COMPANIES.map(c => c.id), pages: { sales: true, targets: true, health: true }, secs: 20,
  targets: { Toner: 100, Parfüm: 100, Saat: 50, Elektronik: 0, '3D baskı': 0, Ofis: 0 },
  ticker: ['Bugünkü hedeflere birlikte ulaşalım.', 'Eksik eşitleme görürseniz Kanallar ekranından kontrol edin.'],
}
const load = (): Cfg => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (v && typeof v === 'object') return { ...DEF, ...v, pages: { ...DEF.pages, ...v.pages }, targets: { ...DEF.targets, ...v.targets }, secs: Math.min(60, Math.max(5, Number(v.secs) || DEF.secs)) }
  } catch { /* bozuk kayıt */ }
  return DEF
}

const DAY = 86400_000
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
type Slide = { kind: 'sales' | 'targets' | 'health'; title: string; ids: string[] }

interface Day { eur: number; n: number; chan: Map<ChannelType, { v: number; n: number }>; other: Map<Cur, { v: number; n: number; chans: Set<string> }> }
const emptyDay = (): Day => ({ eur: 0, n: 0, chan: new Map(), other: new Map() })
function addOrder(d: Day, o: Order) {
  const t = account(o.acc).type
  if (o.cur === 'EUR') {
    d.eur += o.total; d.n++
    const c = d.chan.get(t) ?? { v: 0, n: 0 }; c.v += o.total; c.n++; d.chan.set(t, c)
  } else {
    const c = d.other.get(o.cur) ?? { v: 0, n: 0, chans: new Set<string>() }; c.v += o.total; c.n++; c.chans.add(CHANNEL[t].label); d.other.set(o.cur, c)
  }
}

export default function Wall() {
  const { allOrders, jobs, products, moves } = useStore()
  const [cfg, setCfg] = useState<Cfg>(load)
  const put = (f: (c: Cfg) => Cfg) => setCfg(c => { const v = f(c); try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* yalnız bu oturum */ } return v })
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [idx, setIdx] = useState(0)
  const [el, setEl] = useState(0)
  const [full, setFull] = useState(!!document.fullscreenElement)
  const comps = COMPANIES.filter(c => cfg.companies.includes(c.id))

  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = []
    const ids = comps.map(c => c.id)
    if (cfg.pages.sales) chunk(ids, 3).forEach((g, i, a) => out.push({ kind: 'sales', title: 'Satışlar' + (a.length > 1 ? ` ${i + 1}/${a.length}` : ''), ids: g }))
    if (cfg.pages.targets) out.push({ kind: 'targets', title: 'Günlük hedefler', ids })
    if (cfg.pages.health) chunk(ids, 6).forEach((g, i, a) => out.push({ kind: 'health', title: 'Mağaza ürün durumu' + (a.length > 1 ? ` ${i + 1}/${a.length}` : ''), ids: g }))
    return out
  }, [cfg.companies, cfg.pages]) // eslint-disable-line react-hooks/exhaustive-deps
  const n = slides.length
  const cur = n ? slides[idx % n] : null
  const go = (d: number) => { setIdx(i => (n ? (i + d + n) % n : 0)); setEl(0) }

  // Sayfa sayacı: duraklatılınca ilerlemez.
  useEffect(() => {
    if (paused || n < 2) return
    const t = setInterval(() => setEl(e => e + 0.25), 250)
    return () => clearInterval(t)
  }, [paused, n])
  useEffect(() => { if (el >= cfg.secs) go(1) }, [el]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener('fullscreenchange', f); return () => document.removeEventListener('fullscreenchange', f) }, [])
  const exit = () => { if (document.fullscreenElement) void document.exitFullscreen(); location.hash = '#/overview' }
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select')) return
      if (e.key === 'Escape') { if (open) setOpen(false); else if (!document.fullscreenElement) exit() }
      else if (e.key === ' ') { e.preventDefault(); setPaused(p => !p) }
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', f); return () => removeEventListener('keydown', f)
  })
  const toggleFull = () => { try { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen() } catch { /* tarayıcı izin vermedi */ } }

  // ---- Hesaplar ----
  const today = dayKey(NOW), yday = dayKey(NOW - DAY)
  const sales = useMemo(() => {
    const m = new Map<string, { t: Day; y: Day; units: number }>()
    for (const c of COMPANIES) m.set(c.id, { t: emptyDay(), y: emptyDay(), units: 0 })
    for (const o of allOrders) {
      if (!isRevenue(o)) continue
      const k = dayKey(o.t), r = m.get(o.company)
      if (!r) continue
      if (k === today) { addOrder(r.t, o); r.units += o.items.reduce((s, i) => s + i.qty, 0) } else if (k === yday) addOrder(r.y, o)
    }
    return m
  }, [allOrders, today, yday])
  const catSold = useMemo(() => {
    const sel = new Set(cfg.companies), m = new Map<string, number>()
    for (const o of allOrders) if (isRevenue(o) && sel.has(o.company) && dayKey(o.t) === today) for (const i of o.items) { const c = product(i.pid)?.cat ?? 'Diğer'; m.set(c, (m.get(c) ?? 0) + i.qty) }
    return m
  }, [allOrders, cfg.companies, today])
  const quality = useMemo(() => {
    const recent = new Set(moves.length ? moves.filter(x => x.type === 'mal-kabul' && x.t >= NOW - 7 * DAY).map(x => x.pid + '|' + x.wh) : [...MOVES0].filter(x => x.type === 'mal-kabul' && x.t >= NOW - 7 * DAY).map(x => x.pid + '|' + x.wh))
    return new Map(COMPANIES.map(c => {
      const accIds = new Set(ACCOUNTS.filter(a => a.company === c.id).map(a => a.id))
      const mine = products.filter(p => (p.stock[c.wh]?.fiziki ?? 0) > 0)
      let noList = 0, fresh = 0, info = 0, photo = 0, good = 0
      for (const p of mine) {
        const k = kindsOf(p)
        const a = !p.listings.some(l => accIds.has(l.acc) && (l.status === 'aktif' || l.status === 'gonderildi')), b = k.includes('ean'), d = k.includes('gorsel')
        if (a) noList++; if (b) info++; if (d) photo++; if (!a && !b && !d) good++
        if (recent.has(p.id + '|' + c.wh)) fresh++
      }
      return [c.id, { total: mine.length, noList, fresh, info, photo, score: mine.length ? Math.round((good / mine.length) * 100) : null }] as const
    }))
  }, [products, moves])

  const ticker = cfg.ticker.map(s => s.trim()).filter(Boolean)
  const cls = 'fixed inset-0 z-[100] flex flex-col bg-[#0a0d1c] text-white overflow-hidden'

  return (
    <div className={cls} style={{ fontSize: 'clamp(13px, 1.05vw, 26px)' }}>
      <header className="shrink-0 flex items-center gap-4 px-[2em] pt-[1em] pb-[.6em]">
        <h1 className="m-0 text-[2em] font-semibold tracking-tight">{cur ? cur.title : 'Duvar ekranı'}</h1>
        <span className="text-white/60 text-[1em]">{new Date(NOW).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} · örnek veri</span>
        <span className="flex-1" />
        <nav className="flex items-center gap-[.5em]" aria-label="Sayfa göstergesi">
          {slides.map((s, i) => <button key={i} onClick={() => { setIdx(i); setEl(0) }} aria-label={`${s.title}, ${i + 1}/${n}`} aria-current={i === idx % n ? 'true' : undefined}
            className={`h-[.7em] rounded-full border-0 p-0 transition-all ${i === idx % n ? 'w-[2.4em] bg-[#ffd168]' : 'w-[.7em] bg-white/30'}`} />)}
        </nav>
        <button onClick={() => setPaused(p => !p)} className="wbtn" aria-label={paused ? 'Dönmeyi sürdür' : 'Dönmeyi duraklat'} title="Boşluk tuşu">{paused ? <Play size={20} /> : <Pause size={20} />}<span>{paused ? 'Sürdür' : 'Duraklat'}</span></button>
        <button onClick={() => setOpen(true)} className="wbtn" aria-label="Ekran ayarları"><Settings size={20} /><span>Ayarlar</span></button>
        <button onClick={toggleFull} className="wbtn" aria-label={full ? 'Tam ekrandan çık' : 'Tam ekran'}><Expand size={20} /><span>{full ? 'Küçült' : 'Tam ekran'}</span></button>
        <button onClick={exit} className="wbtn" aria-label="Duvar ekranından çık" title="Esc"><X size={20} /><span>Çık</span></button>
      </header>
      <div className="h-[.3em] mx-[2em] rounded-full bg-white/10 overflow-hidden shrink-0" role="progressbar" aria-label="Sayfa süresi" aria-valuemin={0} aria-valuemax={cfg.secs} aria-valuenow={Math.round(el)}>
        <div className="h-full bg-[#ffd168]/80 transition-[width] duration-300 ease-linear" style={{ width: n < 2 || paused ? '100%' : `${Math.min(100, (el / cfg.secs) * 100)}%`, opacity: paused ? .35 : 1 }} />
      </div>

      <main className="flex-1 min-h-0 overflow-hidden px-[2em] py-[1em]">
        {!cur && <p className="text-[1.6em] text-white/70">Gösterilecek sayfa yok. Ayarlardan şirket ve sayfa seçin.</p>}
        {cur?.kind === 'sales' && (
          <div className="grid h-full gap-[1em]" style={{ gridTemplateColumns: `repeat(${cur.ids.length}, minmax(0, 1fr))` }}>
            {cur.ids.map(id => <SalesCard key={id} id={id} r={sales.get(id)!} jobs={jobs} />)}
          </div>
        )}
        {cur?.kind === 'targets' && <Targets cats={CATS.filter(c => (cfg.targets[c] ?? 0) > 0)} targets={cfg.targets} sold={catSold} />}
        {cur?.kind === 'health' && (
          <div className="h-full flex flex-col gap-[.6em]">
            <div className="grid flex-1 min-h-0 gap-[1em] grid-cols-3 auto-rows-fr">{cur.ids.map(id => <QualityCard key={id} id={id} q={quality.get(id)!} />)}</div>
            <p className="m-0 text-white/60 text-[.9em]"><b className="text-[#ffd168]">Geçici formül:</b> puan = ürünlerin, "ilanı yok", "bilgisi eksik" ve "fotoğrafı sorunlu" sorunlarının hiçbirine sahip olmayan payı (üç ölçü eşit ağırlıklı). Ürün sayısı: mağazanın deposunda stokta olanlar. "Yeni gelen" puana girmez; son 7 günde mal kabul gören ürünlerdir.</p>
          </div>
        )}
      </main>

      <Ticker msgs={ticker} />
      {open && <Panel cfg={cfg} put={put} onClose={() => setOpen(false)} />}
      <style>{`
        .wbtn{display:inline-flex;align-items:center;gap:.4em;height:2.4em;padding:0 .9em;border-radius:.6em;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:#fff;font-size:.9em;cursor:pointer}
        .wbtn:hover{background:rgba(255,255,255,.16)}
        .wbtn:focus-visible,nav button:focus-visible{outline:3px solid #ffd168;outline-offset:2px}
        @keyframes wall-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .wall-run{display:inline-flex;white-space:nowrap;animation:wall-scroll var(--d,40s) linear infinite}
        @media (prefers-reduced-motion:reduce){.wall-run{animation:none}}
      `}</style>
    </div>
  )
}

function Money({ d, big }: { d: Day; big?: boolean }) {
  return <><div className={`num font-semibold leading-none ${big ? 'text-[2.6em]' : 'text-[1.5em]'}`}>{fmtMoney(d.eur, 'EUR', 0)}</div><div className="text-white/70 text-[1em] mt-[.2em]"><b className="num text-white">{fmtNum(d.n)}</b> sipariş</div></>
}

function SalesCard({ id, r, jobs }: { id: string; r: { t: Day; y: Day; units: number }; jobs: ReturnType<typeof useStore>['jobs'] }) {
  const c = COMPANIES.find(x => x.id === id)!
  const accs = ACCOUNTS.filter(a => a.company === id)
  const problems = accs.map(a => {
    const bad = jobs.filter(j => j.acc === a.id && (j.status === 'basarisiz' || j.status === 'kismi'))
    if (a.health === 'ok' && !bad.length) return null
    return { a, kinds: [...new Set(bad.map(j => j.kind))] }
  }).filter((x): x is NonNullable<typeof x> => !!x)
  const types = [...new Set([...r.t.chan.keys(), ...r.y.chan.keys()])].sort((a, b) => (r.t.chan.get(b)?.v ?? 0) - (r.t.chan.get(a)?.v ?? 0))
  const cur = [...new Set([...r.t.other.keys(), ...r.y.other.keys()])]
  return (
    <section className="rounded-[1em] bg-white/[.06] border border-white/10 p-[1.2em] flex flex-col min-h-0 min-w-0" aria-label={c.name}>
      <h2 className="m-0 text-[1.7em] font-semibold truncate">{c.name}</h2>
      <div className="grid grid-cols-2 gap-[1em] mt-[.7em]">
        <div><div className="text-[#ffd168] text-[.95em] font-semibold mb-[.3em]">Bugün</div><Money d={r.t} big /></div>
        <div><div className="text-white/60 text-[.95em] font-semibold mb-[.3em]">Dün</div><Money d={r.y} big /></div>
      </div>
      <div className="mt-[.9em] flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-x-[.8em] text-white/50 text-[.8em] border-b border-white/10 pb-[.3em]"><span>Kanal (EUR)</span><span className="text-right">Bugün</span><span className="text-right">Dün</span></div>
        {types.length === 0 && <p className="m-0 mt-[.5em] text-white/50">EUR satış yok.</p>}
        {types.map(t => { const a = r.t.chan.get(t), b = r.y.chan.get(t); return (
          <div key={t} className="grid grid-cols-[1.1fr_1fr_1fr] gap-x-[.8em] py-[.35em] border-b border-white/5 items-baseline">
            <span className="flex items-center gap-[.4em] min-w-0"><i className="size-[.7em] rounded-full shrink-0" style={{ background: CHANNEL[t].color }} /><span className="truncate">{CHANNEL[t].label}</span></span>
            <span className="text-right num">{a ? <>{fmtMoney(a.v, 'EUR', 0)} <small className="text-white/55">· {a.n}</small></> : <span className="text-white/30">—</span>}</span>
            <span className="text-right num text-white/70">{b ? <>{fmtMoney(b.v, 'EUR', 0)} <small className="text-white/45">· {b.n}</small></> : <span className="text-white/30">—</span>}</span>
          </div>) })}
        {cur.map(k => { const a = r.t.other.get(k), b = r.y.other.get(k); return (
          <div key={k} className="mt-[.5em] rounded-[.5em] bg-[#ffd168]/10 px-[.6em] py-[.35em] text-[.9em]">
            <b className="text-[#ffd168]">{k} ayrı satır</b> (euro toplamına eklenmez): bugün <span className="num">{fmtMoney(a?.v ?? 0, k, 0)}</span> · {a?.n ?? 0} sipariş, dün <span className="num">{fmtMoney(b?.v ?? 0, k, 0)}</span> · {b?.n ?? 0} sipariş
          </div>) })}
      </div>
      <div className="mt-[.6em] text-white/75 text-[1em]">Bugün satılan ürün: <b className="num text-white text-[1.3em]">{fmtNum(r.units)}</b> adet</div>
      {problems.length > 0 && (
        <ul className="m-0 mt-[.6em] p-0 list-none space-y-[.3em]" aria-label="Eksik veri uyarıları">
          {problems.map(({ a, kinds }) => (
            <li key={a.id} className="rounded-[.5em] bg-[#ee7878]/15 text-[#ffb0b0] px-[.6em] py-[.3em] text-[.85em]">
              <b>{CHANNEL[a.type].label} · {a.name}</b> verisi eksik olabilir; son eşitleme {ago(a.lastSync)}{kinds.length ? ` (${kinds.join(', ')})` : ''}
            </li>))}
        </ul>
      )}
      <p className="m-0 mt-[.5em] text-white/40 text-[.72em]">Tutar ve sipariş sayısı iptal ve iade hariç.</p>
    </section>
  )
}

function Targets({ cats, targets, sold }: { cats: string[]; targets: Record<string, number>; sold: Map<string, number> }) {
  if (!cats.length) return <p className="text-[1.6em] text-white/70">Hedef girilmemiş. Ayarlardan bir kategoriye günlük adet hedefi yazın.</p>
  return (
    <div className="h-full flex flex-col gap-[.8em]">
      <div className="grid flex-1 min-h-0 gap-[1em]" style={{ gridTemplateColumns: `repeat(${Math.min(cats.length, 3)}, minmax(0, 1fr))` }}>
        {cats.map(c => {
          const t = targets[c], s = sold.get(c) ?? 0, left = Math.max(0, t - s), done = s >= t
          return (
            <section key={c} aria-label={c} className={`rounded-[1em] border p-[1.4em] flex flex-col justify-between ${done ? 'bg-[#4fbf4f]/15 border-[#4fbf4f]/50' : 'bg-white/[.06] border-white/10'}`}>
              <div className="flex items-baseline justify-between"><h2 className="m-0 text-[2em] font-semibold">{c}</h2><span className="text-white/60 text-[1.1em]">Hedef <b className="num text-white">{fmtNum(t)}</b> adet</span></div>
              <div className="text-center">
                {done ? <div className="text-[#6fdc6f] text-[3.6em] font-bold leading-none">Hedef tamam</div>
                  : <><div className="num text-[7em] font-bold leading-none text-[#ffd168]">{fmtNum(left)}</div><div className="text-[1.4em] text-white/80 mt-[.2em]">adet kaldı</div></>}
              </div>
              <div>
                <div className="h-[1.2em] rounded-full bg-white/15 overflow-hidden" role="progressbar" aria-label={`${c} hedef ilerlemesi`} aria-valuemin={0} aria-valuemax={t} aria-valuenow={Math.min(s, t)}>
                  <div className={`h-full rounded-full ${done ? 'bg-[#4fbf4f]' : 'bg-[#ffd168]'}`} style={{ width: `${Math.min(100, (s / t) * 100)}%` }} />
                </div>
                <div className="mt-[.4em] flex justify-between text-[1.15em]"><span>Satılan <b className="num">{fmtNum(s)}</b></span><span className="text-white/70">{done && s > t ? `+${fmtNum(s - t)} fazla` : `%${Math.round((s / t) * 100)}`}</span></div>
              </div>
            </section>)
        })}
      </div>
      <p className="m-0 text-white/50 text-[.85em]">Seçili şirketlerin bugünkü satışları. İptal ve iade edilen satışlar sayıya girmez (ciro kuralıyla aynı).</p>
    </div>
  )
}

function QualityCard({ id, q }: { id: string; q: { total: number; noList: number; fresh: number; info: number; photo: number; score: number | null } }) {
  const c = COMPANIES.find(x => x.id === id)!
  const tone = q.score === null ? 'text-white/50' : q.score >= 80 ? 'text-[#6fdc6f]' : q.score >= 50 ? 'text-[#ffd168]' : 'text-[#ff9a9a]'
  const Row = ({ l, v, note }: { l: string; v: number; note?: string }) => <div className="flex items-baseline justify-between gap-[.6em] border-b border-white/5 py-[.25em]"><span className="text-white/80">{l}{note && <small className="text-white/40"> · {note}</small>}</span><b className="num text-[1.3em]">{fmtNum(v)}</b></div>
  return (
    <section className="rounded-[1em] bg-white/[.06] border border-white/10 p-[1em] flex flex-col min-h-0 min-w-0" aria-label={c.name}>
      <div className="flex items-baseline justify-between gap-2"><h2 className="m-0 text-[1.4em] font-semibold truncate">{c.name}</h2><span className="text-white/50 text-[.85em] shrink-0">{fmtNum(q.total)} ürün</span></div>
      <div className={`num font-bold leading-none my-[.25em] text-[3.6em] ${tone}`}>{q.score === null ? '—' : `%${q.score}`}</div>
      <Row l="Stokta, hiçbir kanalda ilanı yok" v={q.noList} />
      <Row l="Son 7 günde stoğa yeni gelen" v={q.fresh} note="geçici kural" />
      <Row l="Bilgisi eksik (barkod)" v={q.info} />
      <Row l="Fotoğrafı sorunlu" v={q.photo} />
    </section>
  )
}

function Ticker({ msgs }: { msgs: string[] }) {
  const [i, setI] = useState(0)
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => { if (!still || msgs.length < 2) return; const t = setInterval(() => setI(x => x + 1), 8000); return () => clearInterval(t) }, [still, msgs.length])
  const text = msgs.join('     •     ')
  return (
    <footer className="shrink-0 h-[3em] bg-[#171b38] border-t border-white/10 flex items-center overflow-hidden text-[1.3em]" aria-label="Duyurular" role="marquee">
      {msgs.length === 0 ? <span className="px-[1.5em] text-white/40">Kayan yazı boş. Ayarlardan mesaj ekleyebilirsiniz.</span>
        : still ? <span className="px-[1.5em] truncate">{msgs[i % msgs.length]}</span>
        : <div className="wall-run" style={{ ['--d' as string]: `${Math.max(20, text.length * 0.25)}s` }}>{[0, 1].map(k => <span key={k} className="px-[3em]" aria-hidden={k ? true : undefined}>{text}</span>)}</div>}
    </footer>
  )
}

function Panel({ cfg, put, onClose }: { cfg: Cfg; put: (f: (c: Cfg) => Cfg) => void; onClose: () => void }) {
  const [tk, setTk] = useState(cfg.ticker.join('\n'))
  const tog = (id: string) => put(c => ({ ...c, companies: c.companies.includes(id) ? c.companies.filter(x => x !== id) : [...c.companies, id] }))
  const inp = 'h-9 rounded-md border border-white/25 bg-white/10 px-2 text-white'
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 flex justify-end" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label="Duvar ekranı ayarları" onClick={e => e.stopPropagation()} className="w-[min(30em,100vw)] h-full overflow-y-auto bg-[#12162e] border-l border-white/15 p-[1.2em] text-[1em] space-y-[1.1em]">
        <div className="flex items-center justify-between"><h2 className="m-0 text-[1.3em]">Ekran ayarları</h2><button onClick={onClose} className="wbtn" aria-label="Ayarları kapat"><X size={18} /></button></div>
        <fieldset className="border-0 p-0 m-0"><legend className="font-semibold mb-1">Gösterilecek şirketler</legend>
          <div className="flex gap-2 mb-1"><button className="wbtn" onClick={() => put(c => ({ ...c, companies: COMPANIES.map(x => x.id) }))}>Hepsi</button><button className="wbtn" onClick={() => put(c => ({ ...c, companies: [] }))}>Hiçbiri</button></div>
          <div className="grid grid-cols-2 gap-x-3">{COMPANIES.map(c => <label key={c.id} className="flex items-center gap-2 py-1"><input type="checkbox" checked={cfg.companies.includes(c.id)} onChange={() => tog(c.id)} />{c.name}</label>)}</div>
        </fieldset>
        <fieldset className="border-0 p-0 m-0"><legend className="font-semibold mb-1">Sayfalar</legend>
          {([['sales', 'Satışlar'], ['targets', 'Günlük hedefler'], ['health', 'Mağaza ürün durumu']] as const).map(([k, l]) =>
            <label key={k} className="flex items-center gap-2 py-1"><input type="checkbox" checked={cfg.pages[k]} onChange={e => put(c => ({ ...c, pages: { ...c.pages, [k]: e.target.checked } }))} />{l}</label>)}
        </fieldset>
        <label className="block"><span className="font-semibold">Her sayfa kaç saniye kalsın (5 – 60)</span>
          <input type="number" min={5} max={60} className={`${inp} w-24 block mt-1`} value={cfg.secs} onChange={e => put(c => ({ ...c, secs: Math.min(60, Math.max(5, Number(e.target.value) || 20)) }))} /></label>
        <fieldset className="border-0 p-0 m-0"><legend className="font-semibold mb-1">Günlük adet hedefi (0 = gösterme)</legend>
          <div className="grid grid-cols-2 gap-2">{CATS.map(k => <label key={k} className="flex items-center justify-between gap-2">{k}<input type="number" min={0} className={`${inp} w-24`} value={cfg.targets[k] ?? 0} onChange={e => put(c => ({ ...c, targets: { ...c.targets, [k]: Math.max(0, Math.floor(Number(e.target.value) || 0)) } }))} /></label>)}</div>
        </fieldset>
        <label className="block"><span className="font-semibold">Kayan yazı (her satır bir mesaj)</span>
          <textarea rows={5} className={`${inp} w-full h-auto py-2 block mt-1`} value={tk} onChange={e => { setTk(e.target.value); const v = e.target.value.split('\n'); put(c => ({ ...c, ticker: v })) }} /></label>
        <p className="m-0 text-white/50 text-[.85em]">Ayarlar yalnız bu tarayıcıda saklanır. Bu ekran eski panelin "tv" sayfasının yerine geçer.</p>
      </aside>
    </div>
  )
}
