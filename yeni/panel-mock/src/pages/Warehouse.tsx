import { useMemo, useState } from 'react'
import { ScanBarcode, WifiOff } from 'lucide-react'
import dist from '../dist30.json'
import { WAREHOUSES, fmtNum, product, toShip, whName, type WhId } from '../data'
import { ROLES, useStore } from '../store'
import { Thumb } from '../Thumb'
import { Badge, Bars, Btn, Card, Empty, PageHead, Stat, td, th, sel, type Tone } from '../ui'

const binCmp = (a: string, b: string) => a.localeCompare(b, 'tr', { numeric: true })

/* ------------------------------------------------------------------ Toplama */
interface Line { pid: string; bin: string; qty: number; orders: number }

function PhonePreview({ lines, ticked, onScan }: { lines: Line[]; ticked: Set<string>; onScan: () => void }) {
  const cur = lines.find(l => !ticked.has(l.pid))
  const p = cur ? product(cur.pid) : null
  const pos = cur ? lines.indexOf(cur) + 1 : lines.length
  return (
    <Card title="Mobil depo uygulaması (önizleme)" right={<Badge tone="violet">planlanan uygulama</Badge>}>
      <p className="m-0 mb-3 text-xs text-mute">Bu bir önizlemedir: mobil uygulama henüz yapılmadı. Toplayıcı telefonda aynı listeyi raf sırasıyla görecek.</p>
      <div className="mx-auto w-[260px] max-w-full rounded-[28px] border-4 border-ink bg-bg p-3 shadow-lg">
        <div className="mx-auto mb-2 h-1 w-14 rounded-full bg-line" />
        <div className="flex items-center justify-between text-[11px] text-mute num"><span>Toplama</span><span>{Math.min(pos, lines.length)} / {lines.length}</span></div>
        {cur && p ? (
          <div className="mt-2 rounded-xl bg-card border border-line p-3 text-center">
            <div className="text-[11px] text-mute">Rafa git</div>
            <div className="num text-3xl font-bold text-brand leading-tight">{cur.bin}</div>
            <div className="mt-2 flex justify-center"><Thumb p={p} size={64} /></div>
            <div className="mt-2 text-sm font-medium leading-snug">{p.name}</div>
            <div className="text-[11px] text-mute num">{p.sku}</div>
            <div className="mt-2 text-[11px] text-mute">Al</div>
            <div className="num text-4xl font-bold leading-tight">{cur.qty} <span className="text-base font-medium text-ink2">adet</span></div>
          </div>
        ) : (
          <div className="mt-2 rounded-xl bg-ok-soft text-ok p-6 text-center text-sm font-medium">{lines.length ? 'Hepsi toplandı' : 'Liste boş'}</div>
        )}
        <button onClick={onScan} disabled={!cur} className="mt-3 w-full h-10 rounded-lg bg-brand text-white text-sm font-medium inline-flex items-center justify-center gap-2 border-0 disabled:opacity-45">
          <ScanBarcode size={16} aria-hidden /> Barkodu okut
        </button>
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-warn-soft text-warn px-2 py-1.5 text-[11px] leading-snug">
          <WifiOff size={13} className="shrink-0" aria-hidden /><span>offline: 3 işlem bekliyor, bağlantı gelince gönderilecek <b>(örnek)</b></span>
        </div>
      </div>
    </Card>
  )
}

export function Picking() {
  const { orders, whId, role, createLabels } = useStore()
  const ready = useMemo(() => orders.filter(o => toShip(o) && o.supply === 'fiziki' && !o.issue && o.label !== 'hazir').sort((a, b) => a.t - b.t), [orders])
  const counts = useMemo(() => {
    const m = new Map<WhId, number>()
    for (const o of ready) m.set(o.wh, (m.get(o.wh) ?? 0) + 1)
    return m
  }, [ready])
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const [whSel, setWhSel] = useState<WhId | ''>('')
  const wh = (whSel || whId || best || 'de') as WhId
  const [size, setSize] = useState(25)
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const [done, setDone] = useState(false)

  const batch = useMemo(() => ready.filter(o => o.wh === wh).slice(0, size), [ready, wh, size])
  const lines = useMemo<Line[]>(() => {
    const m = new Map<string, Line>()
    for (const o of batch) for (const it of o.items) {
      const l = m.get(it.pid) ?? { pid: it.pid, bin: product(it.pid).stock[wh]?.bin ?? '—', qty: 0, orders: 0 }
      l.qty += it.qty; l.orders += 1; m.set(it.pid, l)
    }
    return [...m.values()].sort((a, b) => binCmp(a.bin, b.bin) || a.pid.localeCompare(b.pid))
  }, [batch, wh])
  const units = lines.reduce((a, l) => a + l.qty, 0)
  const shelves = new Set(lines.map(l => l.bin)).size
  const nDone = lines.filter(l => ticked.has(l.pid)).length
  const pct = lines.length ? Math.round((nDone / lines.length) * 100) : 0
  const reset = () => { setTicked(new Set()); setDone(false) }
  const toggle = (pid: string) => setTicked(s => { const n = new Set(s); if (n.has(pid)) n.delete(pid); else n.add(pid); return n })
  const scan = () => { const c = lines.find(l => !ticked.has(l.pid)); if (c) toggle(c.pid) }
  const canFinish = lines.length > 0 && nDone === lines.length && ROLES[role].ops && !done

  return (
    <>
      <PageHead title="Toplama listesi" desc="Aynı ürün tek seferde toplanır: seçilen siparişlerdeki aynı ürünler birleşir, satırlar raf sırasına dizilir, toplayıcı depoda en kısa yolu yürür." />
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
        <label className="flex items-center gap-2">Depo
          <select className={sel} value={wh} onChange={e => { setWhSel(e.target.value as WhId); reset() }}>
            {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name} ({counts.get(w.id) ?? 0} hazır sipariş)</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">Parti büyüklüğü
          <select className={sel} value={size} onChange={e => { setSize(+e.target.value); reset() }}>
            {[10, 25, 50].map(n => <option key={n} value={n}>{n} sipariş</option>)}
          </select>
        </label>
        <span className="text-xs text-mute">En eski siparişten başlanır. Hazır: {fmtNum(counts.get(wh) ?? 0)} sipariş (fiziki stok, ödenmiş, açık).</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Sipariş" value={batch.length} hint={whName(wh)} />
        <Stat label="Toplama satırı" value={lines.length} hint="aynı ürünler birleşti" />
        <Stat label="Toplam adet" value={units} />
        <Stat label="Farklı raf" value={shelves} hint="yürüyüş durağı" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <Card pad={false} title="Toplama listesi" right={<span className="num text-xs text-ink2">%{pct} · {nDone}/{lines.length}</span>}>
          <div className="px-4 pb-3"><div className="h-2 rounded bg-bg overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Toplama ilerlemesi"><div className="h-full bg-ok" style={{ width: `${pct}%` }} /></div></div>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Toplandı</th><th className={th}>Sıra</th><th className={th}>Raf</th><th className={th}>Ürün</th><th className={th}>SKU</th><th className={th + ' text-right'}>Adet</th><th className={th + ' text-right'}>Sipariş</th></tr></thead>
              <tbody>{lines.map((l, i) => { const p = product(l.pid), on = ticked.has(l.pid); return (
                <tr key={l.pid} className={on ? 'bg-ok-soft/40 text-mute' : 'hover:bg-bg'}>
                  <td className={td}><input type="checkbox" checked={on} onChange={() => toggle(l.pid)} aria-label={`${p.name} toplandı`} /></td>
                  <td className={td + ' num'}>{i + 1}</td>
                  <td className={td + ' num font-medium'}>{l.bin}</td>
                  <td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} className={on ? 'opacity-50' : ''} /><span className={on ? 'line-through text-mute' : ''}>{p.name}</span></div></td>
                  <td className={td + ' num text-mute'}>{p.sku}</td>
                  <td className={td + ' num text-right font-medium'}>{l.qty}</td>
                  <td className={td + ' num text-right'}>{l.orders}</td>
                </tr>) })}</tbody>
            </table>
            {lines.length === 0 && <Empty>Bu depoda toplanacak hazır sipariş yok.</Empty>}
          </div>
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-line">
            <Btn variant="primary" disabled={!canFinish} onClick={() => { createLabels(batch.map(o => o.id)); setDone(true) }}>Toplamayı bitir, etiketleri oluştur</Btn>
            <span className="text-xs text-mute">{done ? 'Etiketler oluşturuldu.' : !ROLES[role].ops ? 'Bu rol etiket oluşturamaz.' : nDone < lines.length ? 'Bütün satırlar işaretlenince açılır.' : ''}</span>
          </div>
        </Card>
        <PhonePreview lines={lines} ticked={ticked} onScan={scan} />
      </div>
    </>
  )
}

/* -------------------------------------------------------------------- Sayım */
type Reason = 'negatif' | 'hic' | 'kritik' | 'hareket'
const REASON: Record<Reason, [Tone, string, number]> = { negatif: ['bad', 'Eksi stok', 0], hic: ['warn', 'Hiç sayılmamış', 1], kritik: ['warn', 'Kritik', 2], hareket: ['info', 'Çok hareket eden', 3] }

export function Counting() {
  const { products, whId, notify, role, moves, countStock } = useStore()
  const [vals, setVals] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Record<string, number>>({})
  const rows = useMemo(() => {
    const mv = new Map<string, number>()
    for (const m of moves) mv.set(m.pid + m.wh, (mv.get(m.pid + m.wh) ?? 0) + 1)
    const out: { key: string; pid: string; wh: WhId; bin: string; sys: number | null; reason: Reason; moves: number }[] = []
    for (const p of products) for (const [w, s] of Object.entries(p.stock) as [WhId, NonNullable<typeof p.stock[WhId]>][]) {
      if (whId && w !== whId) continue
      const moves = mv.get(p.id + w) ?? 0
      const reason: Reason | null = s.fiziki === null ? 'hic' : s.fiziki < 0 ? 'negatif' : s.fiziki < s.min ? 'kritik' : moves >= 5 ? 'hareket' : null
      if (reason) out.push({ key: p.id + w, pid: p.id, wh: w, bin: s.bin, sys: s.fiziki, reason, moves })
    }
    return out.sort((a, b) => REASON[a.reason][2] - REASON[b.reason][2] || b.moves - a.moves || binCmp(a.bin, b.bin))
  // Satırlar oturum boyunca (ve depo değişene dek) sabit kalır: kaydedilen satır 'fark' sonucuyla görünür kalsın, kaybolmasın.
  }, [whId]) // eslint-disable-line react-hooks/exhaustive-deps
  const n = (r: Reason) => rows.filter(x => x.reason === r).length
  const shown = rows.slice(0, 40)
  const canWrite = ROLES[role].ops
  const save = (r: (typeof rows)[number]) => {
    const v = vals[r.key]
    if (v === undefined || v === '' || !Number.isFinite(+v)) return
    if (!Number.isInteger(+v) || +v < 0) return notify('Sayılan adet 0 ya da daha büyük bir tam sayı olmalı')
    const diff = countStock(r.pid, r.wh, +v)
    if (diff === null) return
    setDone(d => ({ ...d, [r.key]: diff }))
    notify(`${product(r.pid).sku}: ${r.sys === null ? 'ilk sayım yazıldı' : `fark ${diff > 0 ? '+' : ''}${diff}`}. Stok defterine Sayım hareketi eklendi.`)
  }
  return (
    <>
      <PageHead title="Sayım planı" desc="Sıradaki sayım listesi, öncelik sırasıyla: önce negatif stok, sonra hiç sayılmamış, kritik ve çok hareket eden ürünler." />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <Stat label="Sayılacak satır" value={rows.length} />
        <Stat label="Eksi stok" value={n('negatif')} tone={n('negatif') ? 'bad' : undefined} />
        <Stat label="Hiç sayılmamış" value={n('hic')} tone={n('hic') ? 'warn' : undefined} />
        <Stat label="Kritik (min altı)" value={n('kritik')} tone={n('kritik') ? 'warn' : undefined} />
        <Stat label="Sayım yapıldı" value={Object.keys(done).length} tone="ok" hint="bu oturumda" />
      </div>
      <p className="text-xs text-mute mt-0 mb-3"><b>Sayılmamış ile sıfır stok ayrıdır:</b> sayılmamış ürünün gerçek miktarı bilinmez, sıfır stokta miktar bilinir ve 0'dır. Çok hareket eden: son hareket kaydında 5 ve üzeri işlem.</p>
      <Card pad={false} title={`Öncelikli liste (ilk ${shown.length} / ${fmtNum(rows.length)})`}>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Neden</th><th className={th}>Ürün</th><th className={th}>Depo · Raf</th><th className={th + ' text-right'}>Sistem</th><th className={th}>Sayılan</th><th className={th}>Sonuç</th></tr></thead>
            <tbody>{shown.map(r => { const p = product(r.pid), [tone, label] = REASON[r.reason], d = done[r.key]; return (
              <tr key={r.key} className={d !== undefined ? 'bg-ok-soft/40' : 'hover:bg-bg'}>
                <td className={td}><Badge tone={tone}>{label}</Badge></td>
                <td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} /><div>{p.name}<div className="text-xs text-mute num">{p.sku}</div></div></div></td>
                <td className={td}>{whName(r.wh)} <span className="num text-ink2">· {r.bin}</span></td>
                <td className={td + ' num text-right'}>{r.sys === null ? <span className="text-mute">sayılmadı</span> : d === undefined ? <span className="text-mute" title="Kör sayım: önce sayın, sonra sistemle karşılaştırılır">gizli</span> : r.sys}</td>
                <td className={td}><input type="number" inputMode="numeric" min={0} className={sel + ' w-20 num'} aria-label={`${p.name} sayılan adet`} disabled={d !== undefined || !canWrite}
                  value={vals[r.key] ?? ''} onChange={e => setVals(v => ({ ...v, [r.key]: e.target.value }))} /></td>
                <td className={td}>{d !== undefined
                  ? <Badge tone={d === 0 ? 'ok' : 'warn'}>{d === 0 ? 'Fark yok' : `Fark ${d > 0 ? '+' : ''}${d}`} · kaydedildi</Badge>
                  : <Btn disabled={!canWrite || !vals[r.key]} onClick={() => save(r)}>Farkı kaydet</Btn>}</td>
              </tr>) })}</tbody>
          </table>
          {rows.length === 0 && <Empty>Bu kapsamda sayılacak satır yok.</Empty>}
        </div>
        <div className="px-4 py-2 text-xs text-mute border-t border-line">Sayım stok defterine "Sayım" hareketi olarak yazılır. Sistem adedi, tarafsız sayım için sayım kaydedilene kadar gizlidir.{!canWrite && ' Bu rol sayım kaydedemez.'}</div>
      </Card>
    </>
  )
}

/* ----------------------------------------------------------------- Vardiya */
const BANDS: [string, number, number][] = [['00–07', 0, 7], ['07–12', 7, 12], ['12–18', 12, 18], ['18–24', 18, 24]]
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const hh = (h: number) => String(h % 24).padStart(2, '0') + ':00'

export function Shifts() {
  const [rate, setRate] = useState(12)
  const byHour = dist.byHour as number[]
  const grid = dist.weekdayHour_MonFirst as number[][]
  const nDays = Object.keys(dist.byDay).length
  const total = byHour.reduce((a, b) => a + b, 0)
  const top3 = new Set([...byHour.keys()].sort((a, b) => byHour[b] - byHour[a]).slice(0, 3))
  const gmax = Math.max(1, ...grid.flat())
  const bands = BANDS.map(([label, a, b]) => {
    const sum = byHour.slice(a, b).reduce((x, y) => x + y, 0)
    const avg = sum / nDays / (b - a), peak = Math.max(...byHour.slice(a, b)) / nDays
    return { label, sum, share: sum / total, avg, peak, need: Math.max(1, Math.ceil(avg / rate)), needPeak: Math.max(1, Math.ceil(peak / rate)) }
  })
  let q = 0, qv = Infinity
  for (let s = 0; s < 24; s++) { const v = byHour[s] + byHour[(s + 1) % 24] + byHour[(s + 2) % 24]; if (v < qv) { qv = v; q = s } }

  return (
    <>
      <PageHead title="Vardiya önerisi" desc="Gerçek sipariş saatlerine bakarak hangi saatte kaç kişi gerektiğini gösterir. Bütün sayılar siparişlerin gerçek saat dağılımından hesaplanır." />
      <p className="text-xs text-mute mt-0 mb-3">Veri aralığı: <span className="num">{dist.window}</span> ({nDays} gün, {fmtNum(total)} sipariş). Haftanın günü ortalamaları her gün için yalnızca 4–5 haftaya dayanır, küçük farklar tesadüf olabilir.</p>
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <Card title="Saate göre sipariş (30 gün toplamı)" right={<Badge tone="violet">en yoğun 3 saat</Badge>}>
          <Bars height={140} data={byHour.map((v, h) => ({ label: hh(h), value: v, mark: top3.has(h) }))} />
          <p className="m-0 mt-2 text-xs text-ink2">En yoğun: {[...top3].sort((a, b) => byHour[b] - byHour[a]).map(h => `${hh(h)} (${byHour[h]})`).join(', ')}</p>
        </Card>
        <Card title="Zaman dilimi payı">
          <div className="space-y-2">{bands.map(b => (
            <div key={b.label} className="grid grid-cols-[56px_1fr_auto] items-center gap-2 text-sm">
              <span className="num text-ink2">{b.label}</span>
              <span className="h-3 rounded bg-bg overflow-hidden"><span className="block h-full bg-brand" style={{ width: `${b.share * 100}%` }} /></span>
              <span className="num text-right min-w-[88px]">%{(b.share * 100).toFixed(1)} · {fmtNum(b.sum)}</span>
            </div>))}</div>
        </Card>
      </div>
      <Card title="Isı haritası: gün × saat" className="mb-4" right={<span className="text-xs text-mute">koyu = çok sipariş</span>}>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[32px_repeat(24,1fr)] gap-[2px] text-[10px] text-mute num mb-0.5"><span />{byHour.map((_, h) => <span key={h} className="text-center">{h % 3 === 0 ? h : ''}</span>)}</div>
            {grid.map((row, d) => (
              <div key={d} className="grid grid-cols-[32px_repeat(24,1fr)] gap-[2px] mb-[2px]">
                <span className="text-[11px] text-ink2 self-center">{DAYS[d]}</span>
                {row.map((v, h) => <div key={h} title={`${DAYS[d]} ${hh(h)}: ${v} sipariş`} className="h-5 rounded-[3px] bg-bg"
                  style={{ background: `color-mix(in srgb, var(--brand) ${Math.round((v / gmax) * 100)}%, var(--bg))` }} />)}
              </div>))}
          </div>
        </div>
      </Card>
      <Card pad={false} title="Kaç toplayıcı gerekir?" right={<Badge tone="warn" title="Kaydırıcıyla değişir">örnek varsayım</Badge>}>
        <div className="px-4 pb-3 flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor="rate">Bir kişi saatte kaç sipariş hazırlar</label>
          <input id="rate" type="range" min={4} max={30} value={rate} onChange={e => setRate(+e.target.value)} aria-label="Bir kişi saatte kaç sipariş hazırlar" />
          <b className="num">{rate}</b>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Dilim</th><th className={th + ' text-right'}>Saatlik ort. sipariş</th><th className={th + ' text-right'}>En yoğun saat ort.</th><th className={th + ' text-right'}>Önerilen kişi</th><th className={th + ' text-right'}>Tepe saatte</th></tr></thead>
            <tbody>{bands.map(b => (
              <tr key={b.label}><td className={td + ' num font-medium'}>{b.label}</td><td className={td + ' num text-right'}>{b.avg.toFixed(1)}</td><td className={td + ' num text-right'}>{b.peak.toFixed(1)}</td>
                <td className={td + ' num text-right font-semibold'}>{b.need}</td><td className={td + ' num text-right text-ink2'}>{b.needPeak}</td></tr>))}</tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-line text-sm">
          <Badge tone="ok">Bakım penceresi önerisi</Badge>{' '}
          En sakin 3 saat: <b className="num">{hh(q)}–{hh(q + 3)}</b> (30 günde {qv} sipariş, günde ort. {(qv / nDays).toFixed(1)}). Sistem bakımı ve toplu eşitleme bu aralığa konabilir.
        </div>
      </Card>
    </>
  )
}
