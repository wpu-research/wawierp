import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight, ListChecks, Minus, Package, Plus, ScanBarcode, Truck, Wifi, WifiOff } from 'lucide-react'
import { CHANNEL, WAREHOUSES, account, canLabel, canShip, fmtNum, product, toShip, type Order, type WhId } from '../data'
import { ROLES, useStore } from '../store'
import { Thumb } from '../Thumb'
import { Badge } from '../ui'

const binCmp = (a: string, b: string) => a.localeCompare(b, 'tr', { numeric: true })
type Tab = 'pick' | 'pack' | 'count' | 'recv'
type Act = (label: string, run: () => void, msg?: string) => void
interface Line { pid: string; bin: string; qty: number; orders: number }
type Res = Record<string, { k: 'ok' | 'short' | 'skip'; n: number }>

/* ------------------------------------------------------------ küçük parçalar */
function Big({ v = 'outline', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { v?: 'primary' | 'outline' | 'ok' }) {
  const c = v === 'primary' ? 'bg-brand text-white border-brand' : v === 'ok' ? 'bg-ok text-white border-ok' : 'bg-card text-ink border-line'
  return <button {...p} className={`w-full min-h-14 rounded-xl border px-4 text-base font-semibold inline-flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-45 ${c} ${className}`} />
}
const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`bg-card border border-line rounded-2xl p-4 ${className}`}>{children}</div>
const Bar = ({ done, total }: { done: number; total: number }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-3 rounded-full bg-line overflow-hidden"><div className="h-full bg-brand" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
    <span className="num text-sm font-semibold">{done} / {total} satır</span>
  </div>
)
const Note = ({ children }: { children: ReactNode }) => <p className="m-0 text-sm text-ink2 leading-snug">{children}</p>
const Empty = ({ children }: { children: ReactNode }) => <Panel className="text-center text-ink2 py-10">{children}</Panel>
const NumField = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => {
  const n = value === '' ? 0 : Number(value) || 0
  return (
    <div className="flex items-center gap-2">
      <button aria-label="Azalt" onClick={() => onChange(String(Math.max(0, n - 1)))} className="size-14 shrink-0 rounded-xl border border-line bg-card text-ink inline-flex items-center justify-center"><Minus size={24} /></button>
      <input aria-label={label} type="number" inputMode="numeric" min={0} value={value} placeholder="0" onChange={e => onChange(e.target.value.replace(/[^\d]/g, ''))}
        className="num h-14 min-w-0 flex-1 rounded-xl border border-line bg-bg text-center text-3xl font-bold text-ink" />
      <button aria-label="Artır" onClick={() => onChange(String(n + 1))} className="size-14 shrink-0 rounded-xl border border-line bg-card text-ink inline-flex items-center justify-center"><Plus size={24} /></button>
    </div>
  )
}
const Head = ({ title, right }: { title: string; right?: ReactNode }) => <div className="flex items-center justify-between gap-2"><h1 className="m-0 text-2xl font-bold tracking-tight">{title}</h1>{right}</div>

/* ------------------------------------------------------------------- Topla */
function Pick({ lines, res, setRes, order, setOrder, act, goPack }: {
  lines: Line[]; res: Res; setRes: (f: (r: Res) => Res) => void; order: string[]; setOrder: (f: (o: string[]) => string[]) => void; act: Act; goPack: () => void
}) {
  const { record } = useStore()
  const [flash, setFlash] = useState(false)
  const [shortOpen, setShortOpen] = useState(false)
  const [found, setFound] = useState('')
  const [last, setLast] = useState<string | null>(null)
  // Yanlış dokunuş: son işaretlenen satır geri alınır ve yeniden sıranın başına gelir.
  const undo = () => { if (!last) return; const pid = last; setRes(r => { const n = { ...r }; delete n[pid]; return n }); setOrder(o => [pid, ...o.filter(x => x !== pid)]); setLast(null); setShortOpen(false) }
  const undoBtn = last && <Big onClick={undo}>Son satırı geri al</Big>
  const open = order.find(pid => !res[pid])
  const line = open ? lines.find(l => l.pid === open) : undefined
  const done = lines.filter(l => res[l.pid]).length
  const mark = (l: Line, k: 'ok' | 'short', n: number) => {
    act(`Toplama ${l.bin}`, () => { if (k === 'short') record('Depo', `Eksik toplama bildirildi: ${n} / ${l.qty} adet bulundu`, `${product(l.pid).sku} · raf ${l.bin}`) })
    setRes(r => ({ ...r, [l.pid]: { k, n } })); setLast(l.pid); setShortOpen(false); setFound('')
    if (k === 'ok') { setFlash(true); window.setTimeout(() => setFlash(false), 700) }
  }
  if (!lines.length) return <Empty>Bu depoda toplanacak fiziki sipariş yok.</Empty>
  if (!line) {
    const shorts = lines.filter(l => res[l.pid]?.k === 'short')
    const ok = lines.filter(l => res[l.pid]?.k === 'ok').length
    return (
      <div className="space-y-3">
        <Panel className="text-center"><div className="text-ok text-xl font-bold">Toplama bitti</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-ok-soft text-ok p-3"><div className="num text-3xl font-bold">{ok}</div><div className="text-sm">Toplanan satır</div></div>
            <div className="rounded-xl bg-warn-soft text-warn p-3"><div className="num text-3xl font-bold">{shorts.length}</div><div className="text-sm">Eksik bildirilen</div></div>
          </div></Panel>
        {shorts.map(l => <Panel key={l.pid} className="text-sm"><b>{product(l.pid).name}</b><div className="text-ink2 num">Raf {l.bin} · istenen {l.qty}, bulunan {res[l.pid].n}</div></Panel>)}
        {undoBtn}
        <Big v="primary" onClick={goPack}>Paketlemeye geç <ChevronRight size={20} /></Big>
      </div>
    )
  }
  const p = product(line.pid)
  return (
    <div className="space-y-3">
      <Bar done={done} total={lines.length} />
      <div className={`rounded-2xl border p-5 text-center transition-colors ${flash ? 'bg-ok-soft border-ok' : 'bg-card border-line'}`}>
        {flash ? <div className="py-20 text-ok text-2xl font-bold inline-flex items-center gap-2"><Check size={32} /> Okundu</div> : <>
          <div className="text-sm text-mute">Rafa git</div>
          <div className="num text-6xl font-extrabold text-brand leading-tight">{line.bin}</div>
          <div className="mt-3 flex justify-center"><Thumb p={p} size={96} /></div>
          <div className="mt-3 text-xl font-semibold leading-snug">{p.name}</div>
          <div className="num text-sm text-mute mt-1">{p.sku}</div>
          <div className="mt-4 text-sm text-mute">Al</div>
          <div className="num text-7xl font-extrabold leading-none">{line.qty}<span className="text-xl font-medium text-ink2"> adet</span></div>
          <div className="mt-2 text-sm text-ink2">{line.orders} siparişe gidiyor</div>
        </>}
      </div>
      {shortOpen ? (
        <Panel className="space-y-3"><div className="font-semibold">Kaç adet buldunuz? <span className="text-mute font-normal">(istenen {line.qty})</span></div>
          <NumField label="Bulunan adet" value={found} onChange={setFound} />
          <div className="grid grid-cols-2 gap-2"><Big onClick={() => setShortOpen(false)}>Vazgeç</Big>
            <Big v="primary" onClick={() => mark(line, 'short', Math.min(Number(found) || 0, Math.max(0, line.qty - 1)))}>Eksik kaydet</Big></div></Panel>
      ) : <>
        <Big v="primary" disabled={flash} onClick={() => mark(line, 'ok', line.qty)}><ScanBarcode size={22} /> Barkodu okut</Big>
        <Big onClick={() => mark(line, 'ok', line.qty)}>Elle onayla</Big>
        <div className="grid grid-cols-2 gap-2">
          <Big onClick={() => setShortOpen(true)}>Eksik bildir</Big>
          <Big disabled={order.filter(x => !res[x]).length < 2} onClick={() => setOrder(o => [...o.filter(x => x !== line.pid), line.pid])}>Atla</Big>
        </div>
        {undoBtn}
      </>}
    </div>
  )
}

/* ----------------------------------------------------------------- Paketle */
function Pack({ batch, act, res, online }: { batch: Order[]; act: Act; res: Res; online: boolean }) {
  const { role, createLabels, ship, notify } = useStore()
  const ops = ROLES[role].ops
  const [i, setI] = useState(0)
  const [ticks, setTicks] = useState<Record<string, boolean>>({})
  const [lblQ, setLblQ] = useState<Set<string>>(new Set())
  const [shipQ, setShipQ] = useState<Set<string>>(new Set())
  const isShipped = (o: Order) => o.status === 'kargoda' || shipQ.has(o.id)
  const isLabeled = (o: Order) => o.label === 'hazir' || lblQ.has(o.id)
  const left = batch.filter(o => !isShipped(o)).length
  if (!batch.length) return <Empty>Paketlenecek sipariş yok. Önce Topla sekmesini kullanın.</Empty>
  const o = batch[Math.min(i, batch.length - 1)]
  const allTicked = o.items.every((_, k) => ticks[`${o.id}:${k}`])
  // Eksik toplanan ürünü olan sipariş paketlenmez: eksik tamamlanmadan etiket ve kargo verilmez.
  const shortItems = o.items.filter(it => res[it.pid] && res[it.pid].k !== 'ok')
  const add = (s: Set<string>) => new Set(s).add(o.id)
  return (
    <div className="space-y-3">
      <Head title="Paketle" right={<Badge tone={left ? 'warn' : 'ok'}>{left ? `${left} sipariş kaldı` : 'Hepsi bitti'}</Badge>} />
      {!ops && <div className="rounded-xl bg-warn-soft text-warn p-3 text-sm">Bu rolde ({ROLES[role].label}) etiket ve kargo işlemi kapalı. Yalnız bakabilirsiniz.</div>}
      <Panel>
        <div className="flex items-center justify-between gap-2">
          <div><div className="num text-2xl font-bold">{o.no}</div><div className="text-sm text-ink2">{CHANNEL[account(o.acc).type].label}</div></div>
          {isShipped(o) ? <Badge tone="ok">Kargoda</Badge> : isLabeled(o) ? <Badge tone="info">Etiket hazır</Badge> : <Badge>Bekliyor</Badge>}
        </div>
        <div className="mt-3 space-y-2">
          {o.items.map((it, k) => {
            const key = `${o.id}:${k}`, on = !!ticks[key]
            return (
              <button key={key} onClick={() => setTicks(t => ({ ...t, [key]: !t[key] }))} aria-pressed={on}
                className={`w-full min-h-14 rounded-xl border px-3 py-2 text-left flex items-center gap-3 ${on ? 'bg-ok-soft border-ok' : 'bg-bg border-line'}`}>
                <span className={`size-8 shrink-0 rounded-lg border-2 inline-flex items-center justify-center ${on ? 'bg-ok border-ok text-white' : 'border-mute'}`}>{on && <Check size={20} />}</span>
                <Thumb p={product(it.pid)} size={40} /><span className="min-w-0 flex-1"><span className="block font-medium leading-snug">{product(it.pid).name}</span><span className="num text-xs text-mute">{product(it.pid).sku}</span></span>
                <span className="num text-2xl font-bold">{it.qty}×</span>
              </button>
            )
          })}
        </div>
      </Panel>
      <Big v="primary" disabled={!ops || !online || !allTicked || isLabeled(o) || shortItems.length > 0} onClick={() => { if (!canLabel(o)) return notify('Bu siparişe etiket verilemez (sorunlu ya da ödeme bekliyor)'); act('Etiket ' + o.no, () => createLabels([o.id])); setLblQ(add) }}>Etiketi yazdır</Big>
      <Big v="ok" disabled={!ops || !online || !isLabeled(o) || isShipped(o) || shortItems.length > 0} onClick={() => { if (!window.confirm(`${o.no} kargoya verilsin mi? Takip numarası kanala gönderilir.`)) return; if (!canShip(o)) return notify('Bu sipariş kargoya verilemez'); act('Kargo ' + o.no, () => ship([o.id])); setShipQ(add); setI(x => Math.min(x + 1, batch.length - 1)) }}><Truck size={20} /> Kargoya ver</Big>
      {!online && <Note>Çevrimdışıyken etiket ve kargo verilemez; bağlantı gelince devam edin.</Note>}
      {shortItems.length > 0 && <div className="rounded-xl bg-warn-soft text-warn p-3 text-sm"><b>Eksik toplandı:</b> {shortItems.map(it => product(it.pid).name).join(', ')}. Eksik tamamlanmadan bu siparişe etiket verilmez; vardiya sorumlusuna bildirin.</div>}
      {ops && !allTicked && !isLabeled(o) && shortItems.length === 0 && <Note>Etiket için önce tüm ürünleri işaretleyin.</Note>}
      <div className="flex items-center justify-between gap-2">
        <Big className="!w-auto flex-1" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Önceki"><ChevronLeft size={22} /></Big>
        <span className="num text-sm font-semibold px-2">{Math.min(i, batch.length - 1) + 1} / {batch.length}</span>
        <Big className="!w-auto flex-1" disabled={i >= batch.length - 1} onClick={() => setI(i + 1)} aria-label="Sonraki"><ChevronRight size={22} /></Big>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- Say */
function Count({ wh, act }: { wh: WhId; act: Act }) {
  const { notify } = useStore()
  const { products, countStock } = useStore()
  const shelves = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const p of products) { const s = p.stock[wh]; if (s && s.bin !== '—') m.set(s.bin, [...(m.get(s.bin) ?? []), p.id]) }
    return [...m.entries()].sort((a, b) => binCmp(a[0], b[0]))
  }, [products, wh])
  const [bin, setBin] = useState<string | null>(null)
  const [cnt, setCnt] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Set<string>>(new Set())
  if (bin === null) return (
    <div className="space-y-3">
      <Head title="Say" /><Note>Bir raf seç. Sayarken sistemdeki adet gizli kalır.</Note>
      {!shelves.length && <Empty>Bu depoda fiziki stoklu raf yok.</Empty>}
      <div className="grid grid-cols-2 gap-2">
        {shelves.map(([b, ids]) => (
          <button key={b} onClick={() => setBin(b)} className="min-h-20 rounded-2xl border border-line bg-card p-3 text-left">
            <div className="num text-xl font-bold text-brand">{b}</div>
            <div className="text-sm text-ink2">{ids.length} ürün</div>
            {saved.has(b) && <Badge tone="ok">Sayıldı</Badge>}
          </button>
        ))}
      </div>
    </div>
  )
  const ids = shelves.find(s => s[0] === bin)?.[1] ?? []
  const ready = ids.every(id => cnt[id] !== undefined && cnt[id] !== '')
  return (
    <div className="space-y-3">
      <Big onClick={() => setBin(null)} className="!min-h-12 !w-auto"><ChevronLeft size={20} /> Raflar</Big>
      <Head title={`Raf ${bin}`} />
      {ids.map(id => {
        const p = product(id), v = cnt[id] ?? ''
        return (
          <Panel key={id} className="space-y-3">
            <div><div className="font-semibold leading-snug">{p.name}</div><div className="num text-xs text-mute">{p.sku}</div></div>
            <NumField label={`${p.name} sayılan adet`} value={v} onChange={x => setCnt(c => ({ ...c, [id]: x }))} />
          </Panel>
        )
      })}
      <Big v="primary" disabled={!ready} onClick={() => { const shelf = bin, entries = ids.map(id => [id, Number(cnt[id])] as const); act('Sayım ' + shelf, () => { let d = 0; for (const [id, q] of entries) d += countStock(id, wh, q, 'Mobil sayım') ?? 0; notify(`Raf ${shelf} sayımı stok defterine yazıldı (toplam fark ${d > 0 ? '+' : ''}${d})`) }); setSaved(s => new Set(s).add(bin)); setCnt(c => { const n = { ...c }; ids.forEach(id => delete n[id]); return n }); setBin(null) }}>Kaydet</Big>
      <Note>Kaydedince sayım stok defterine "Sayım" hareketi olarak yazılır. Hiç sayılmamış ürünler ilk sayımla açılır.</Note>
    </div>
  )
}

/* -------------------------------------------------------------------- Kabul */
function Recv({ wh, act }: { wh: WhId; act: Act }) {
  const { products } = useStore()
  const exp = useMemo(() => products.filter(p => p.stock[wh]).slice(0, 5).map((p, i) => ({ pid: p.id, exp: 6 + ((i * 7) % 15) })), [products, wh])
  const [st, setSt] = useState<Record<string, { scan: boolean; got: string; dmg: boolean }>>({})
  const [fin, setFin] = useState(false)
  const g = (pid: string) => st[pid] ?? { scan: false, got: '', dmg: false }
  const set = (pid: string, patch: Partial<{ scan: boolean; got: string; dmg: boolean }>) => setSt(s => ({ ...s, [pid]: { ...g(pid), ...patch } }))
  if (!exp.length) return <Empty>Bu depo için örnek teslimat oluşturulamadı.</Empty>
  const complete = exp.every(e => g(e.pid).scan && g(e.pid).got !== '')
  if (fin) return (
    <div className="space-y-3"><Head title="Kabul özeti" right={<Badge tone="violet">örnek</Badge>} />
      {exp.map(e => { const s = g(e.pid), d = (Number(s.got) || 0) - e.exp; return (
        <Panel key={e.pid} className="text-sm"><b>{product(e.pid).name}</b>
          <div className="num text-ink2">Beklenen {e.exp} · gelen {s.got} {d !== 0 && <span className="text-warn">({d > 0 ? '+' : ''}{d})</span>} {s.dmg && <span className="text-bad">· hasarlı</span>}</div></Panel>) })}
      <Big onClick={() => { setFin(false); setSt({}) }}>Yeni kabul</Big></div>
  )
  return (
    <div className="space-y-3">
      <Head title="Kabul" right={<Badge tone="violet">örnek</Badge>} /><Note>Örnek bir teslimat. Her satırı okutun, gelen adedi girin.</Note>
      {exp.map(e => { const p = product(e.pid), s = g(e.pid); return (
        <Panel key={e.pid} className="space-y-3">
          <div className="flex justify-between gap-3"><div><div className="font-semibold leading-snug">{p.name}</div><div className="num text-xs text-mute">{p.sku}</div></div><div className="num text-xl font-bold shrink-0">{e.exp}×</div></div>
          <Big v={s.scan ? 'ok' : 'primary'} onClick={() => set(e.pid, { scan: true, got: s.got === '' ? String(e.exp) : s.got })}>{s.scan ? <><Check size={20} /> Okundu</> : <><ScanBarcode size={20} /> Barkodu okut</>}</Big>
          {s.scan && <NumField label={`${p.name} gelen adet`} value={s.got} onChange={x => set(e.pid, { got: x })} />}
          <label className="flex items-center gap-3 min-h-12 text-base"><input type="checkbox" checked={s.dmg} onChange={x => set(e.pid, { dmg: x.target.checked })} className="size-6" /> Hasarlı ürün var</label>
        </Panel>) })}
      <Big v="primary" disabled={!complete} onClick={() => { act('Mal kabulü', () => { /* mal kabul hareketi yazılır */ }, 'Mal kabulü tamamlandı'); setFin(true) }}>Mal kabulü tamamla</Big>
    </div>
  )
}

/* ------------------------------------------------------------------- Çalışma */
function Work({ wh, tab, setTab, act, online }: { wh: WhId; tab: Tab; setTab: (t: Tab) => void; act: Act; online: boolean }) {
  const { allOrders } = useStore()
  const batch = useMemo(() => allOrders.filter(o => o.wh === wh && toShip(o) && o.supply === 'fiziki' && !o.issue).sort((a, b) => a.t - b.t).slice(0, 12), []) // eslint-disable-line react-hooks/exhaustive-deps
  const lines = useMemo<Line[]>(() => {
    const m = new Map<string, Line>()
    for (const o of batch) for (const it of o.items) {
      const l = m.get(it.pid) ?? { pid: it.pid, bin: product(it.pid).stock[wh]?.bin ?? '—', qty: 0, orders: 0 }
      l.qty += it.qty; l.orders += 1; m.set(it.pid, l)
    }
    return [...m.values()].sort((a, b) => binCmp(a.bin, b.bin))
  }, [batch, wh])
  const [res, setRes] = useState<Res>({})
  const [order, setOrder] = useState(() => lines.map(l => l.pid))
  const live = batch.map(b => allOrders.find(o => o.id === b.id) ?? b)
  return (
    <>
      {tab === 'pick' && <><Pick lines={lines} res={res} setRes={setRes} order={order} setOrder={setOrder} act={act} goPack={() => setTab('pack')} />
        <p className="mt-6 mb-0 text-xs text-mute text-center leading-snug">Web prototipi. Mağazalarda yayımlanmış bir uygulama değildir; kamera ile barkod okuma gerçek uygulamada gelecek.</p></>}
      {tab === 'pack' && <Pack batch={live} act={act} res={res} online={online} />}
      {tab === 'count' && <Count wh={wh} act={act} />}
      {tab === 'recv' && <Recv wh={wh} act={act} />}
    </>
  )
}

/* -------------------------------------------------------------------- Kabuk */
const TABS: { k: Tab; label: string; Icon: typeof Package }[] = [
  { k: 'pick', label: 'Topla', Icon: ScanBarcode }, { k: 'pack', label: 'Paketle', Icon: Package }, { k: 'count', label: 'Say', Icon: ListChecks }, { k: 'recv', label: 'Kabul', Icon: Truck },
]

export function MobileDepot() {
  const { orders, whId, notify, toast } = useStore()
  const best = useMemo(() => {
    const m = new Map<WhId, number>()
    for (const o of orders) if (toShip(o) && o.supply === 'fiziki') m.set(o.wh, (m.get(o.wh) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  }, [orders])
  const [whSel, setWhSel] = useState<WhId | ''>('')
  const wh = (whSel || whId || best || 'de') as WhId
  const [tab, setTab] = useState<Tab>('pick')
  const [online, setOnline] = useState(true)
  const [queue, setQueue] = useState<{ label: string; run: () => void }[]>([])
  const act: Act = (label, run, msg) => {
    if (online) { run(); if (msg) notify(msg) } else { setQueue(q => [...q, { label, run }]); notify('Çevrimdışı: işlem sıraya alındı') }
  }
  const toggle = () => {
    if (!online && queue.length) { queue.forEach(q => q.run()); notify(`${queue.length} işlem gönderildi`); setQueue([]) }
    setOnline(!online)
  }
  return (
    <div className="min-h-dvh bg-bg text-ink flex justify-center sm:py-4">
      <div className="relative w-full max-w-[430px] min-h-dvh sm:min-h-[calc(100dvh-2rem)] flex flex-col bg-bg sm:rounded-[36px] sm:border-4 sm:border-line sm:shadow-xl overflow-hidden">
        <header className="sticky top-0 z-10 bg-card border-b border-line px-3 py-2 space-y-2">
          <div className="flex items-center gap-2">
            <select aria-label="Depo" value={wh} onChange={e => setWhSel(e.target.value as WhId)} className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 text-base font-semibold text-ink">
              {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button onClick={toggle} className={`h-12 shrink-0 rounded-full px-4 text-sm font-semibold inline-flex items-center gap-1.5 border-0 ${online ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}>
              {online ? <Wifi size={18} /> : <WifiOff size={18} />}{online ? 'Çevrimiçi' : 'Çevrimdışı'}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <a href="#/overview" className="text-brand font-medium no-underline min-h-8 inline-flex items-center">Panele dön</a>
            {queue.length > 0 && <span className="num rounded-full bg-warn-soft text-warn px-3 py-1 font-semibold">{queue.length} işlem bekliyor</span>}
          </div>
        </header>
        <main className="flex-1 px-3 py-4">
          <Work key={wh} wh={wh} tab={tab} setTab={setTab} act={act} online={online} />
        </main>
        {toast && <div role="status" className="absolute inset-x-3 bottom-24 z-20 rounded-xl bg-ink text-bg px-4 py-3 text-sm font-medium text-center shadow-lg">{toast}</div>}
        <nav className="sticky bottom-0 z-10 grid grid-cols-4 bg-card border-t border-line pb-[env(safe-area-inset-bottom)]">
          {TABS.map(({ k, label, Icon }) => (
            <button key={k} onClick={() => setTab(k)} aria-current={tab === k} className={`min-h-16 flex flex-col items-center justify-center gap-1 border-0 bg-transparent text-xs font-semibold ${tab === k ? 'text-brand' : 'text-mute'}`}>
              <Icon size={24} />{label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
