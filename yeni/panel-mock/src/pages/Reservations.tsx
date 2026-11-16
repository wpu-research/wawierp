import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { PRODUCTS, WAREHOUSES, ago, fmtNum, reservedMap, whName, type Order, type Product, type WhId } from '../data'
import { Thumb } from '../Thumb'
import { ROLES, useStore } from '../store'
import { Badge, Btn, Card, Chan, Drawer, Empty, PageHead, Stat, Tabs, sel, td, th, rowProps } from '../ui'

interface Row { key: string; p: Product; wh: WhId; bin: string; fiziki: number | null; ayrilan: number; sat: number | null; min: number; tedarikci: number; orders: { o: Order; qty: number }[] }
type SortKey = 'name' | 'sku' | 'wh' | 'bin' | 'fiziki' | 'ayrilan' | 'sat' | 'show' | 'n'
type View = 'all' | 'neg' | 'low' | 'nocount'

function buildRows(products: Product[], orders: Order[]): Row[] {
  const res = reservedMap(orders)
  return products.flatMap(p => (Object.entries(p.stock) as [WhId, NonNullable<Product['stock'][WhId]>][]).map(([wh, s]) => {
    const list = res.get(p.id + '|' + wh) ?? [], ay = list.reduce((a, x) => a + x.qty, 0)
    return { key: p.id + '|' + wh, p, wh, bin: s.bin, fiziki: s.fiziki, ayrilan: ay, sat: s.fiziki === null ? null : s.fiziki - ay, min: s.min, tedarikci: s.tedarikci, orders: list }
  }))
}
const show = (r: Row, guard: number) => (r.sat === null ? null : Math.max(0, r.sat - guard))

function Sat({ v }: { v: number | null }) {
  if (v === null) return <Badge title="Sayılmamış; sıfır stok değildir">Sayım yok</Badge>
  return v < 0 ? <Badge tone="bad">{fmtNum(v)} · eksi</Badge> : <span className={`num font-medium ${v === 0 ? 'text-warn' : ''}`}>{fmtNum(v)}</span>
}
const Chip = ({ children }: { children: ReactNode }) => <span className="rounded-full border border-line bg-bg px-3 py-1 text-sm font-medium">{children}</span>

function Flow() {
  const steps = ['Sipariş gelir', 'Stok ayrılır', 'Diğer kanallarda düşer', 'Sevkte defterden çıkar']
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => <span key={s} className="inline-flex items-center gap-2"><Chip>{i + 1}. {s}</Chip>{i < 3 && <ArrowRight size={16} className="text-mute" aria-hidden />}</span>)}
      </div>
      <p className="m-0 mt-2 text-sm text-ink2">Bir ürün tek kanalda satılınca, aynı birim hemen diğer kanallar için de ayrılmış sayılır. Aynı birim iki kez satılamaz.</p>
    </Card>
  )
}

function Toggle({ on, set, label, hint, disabled }: { on: boolean; set: (v: boolean) => void; label: string; hint: string; disabled: boolean }) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <input type="checkbox" role="switch" className="mt-1 size-4 accent-[var(--brand)]" checked={on} disabled={disabled} onChange={e => set(e.target.checked)} />
      <span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-ink2">{hint}</span></span>
    </label>
  )
}

function Rules({ ops }: { ops: boolean }) {
  const [a, setA] = useState(true), [b, setB] = useState(true), [c, setC] = useState(true)
  return (
    <Card title="Kurallar" right={<Badge tone="violet">örnek ayar</Badge>}>
      <div className="space-y-3">
        <Toggle on={a} set={setA} disabled={!ops} label="Sipariş gelince stoğu ayır" hint="Sipariş açılır açılmaz birim satılabilir stoktan düşer." />
        {!a && <div role="alert" className="rounded-md bg-warn-soft text-warn px-3 py-2 text-sm">Uyarı: Bu kapalıyken aynı ürün birden fazla kanalda satılabilir; fazla satış olabilir.</div>}
        <Toggle on={b} set={setB} disabled={!ops} label="Satılabilir sıfırsa ilanı durdur" hint="Satılabilir miktar bitince kanallardaki ilan otomatik durur." />
        <Toggle on={c} set={setC} disabled={!ops} label="Fiziki bitince drop'a geç" hint="Depo stoğu yetmezse sipariş tedarikçiye yönlendirilir." />
      </div>
      {!ops && <p className="m-0 mt-3 text-xs text-mute">Bu rol kuralları değiştiremez. Bir depo ya da yönetici hesabıyla girin.</p>}
    </Card>
  )
}

function Simulator({ rows, guard, ops }: { rows: Row[]; guard: number; ops: boolean }) {
  const [key, setKey] = useState(''), [qty, setQty] = useState(1), [ran, setRan] = useState<string | null>(null)
  const r = rows.find(x => x.key === key)
  const steps = (() => {
    if (!r || ran !== key + '|' + qty) return null
    if (r.sat === null) return ['Bu depoda sayım yok; stok bilinmiyor. Sistem siparişi bekletir ve sayım ister.']
    const left = r.sat - qty, sh = Math.max(0, left - guard)
    const out = [`Ayır: satılabilir ${fmtNum(r.sat)} birimden ${fmtNum(qty)} ayrılır.`]
    if (left >= 0) out.push(`Satılabilir ${fmtNum(left)} olur. Kanallara gösterilen ${fmtNum(sh)} olur (güvenlik payı ${fmtNum(guard)}).`)
    else out.push(`Yetersiz: ${fmtNum(-left)} birim eksik kalır.`, r.tedarikci > 0
      ? `Drop: eksik birimler tedarikçiye yönlendirilir (tedarikçi stoğu ${fmtNum(r.tedarikci)}).`
      : 'Tedarikçi stoğu yok: sipariş bekletilir ve depoya uyarı gider. Eksiye düşülmez.')
    out.push('Sevk edilince fiziki stok defterden düşer.')
    return out
  })()
  return (
    <Card title="Yeni sipariş gelirse" right={<Badge tone="violet">örnek</Badge>}>
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs text-mute min-w-0 flex-1 basis-56">Ürün ve depo
          <select className={sel} value={key} onChange={e => { setKey(e.target.value); setRan(null) }}>
            <option value="">Seçin…</option>
            {rows.map(x => <option key={x.key} value={x.key}>{x.p.name} · {whName(x.wh)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-mute">Adet
          <input type="number" min={1} max={99} className={sel + ' w-20 num'} value={qty} onChange={e => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} />
        </label>
        <Btn variant="primary" disabled={!ops || !r} onClick={() => setRan(key + '|' + qty)}>Dene</Btn>
      </div>
      <p className="m-0 mt-2 text-xs text-mute">{ops ? 'Bu deneme hiçbir veriyi değiştirmez.' : 'Bu rol deneme yapamaz. Deneme hiçbir veriyi değiştirmez.'}</p>
      {steps && <ol className="m-0 mt-3 pl-5 space-y-1 text-sm">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
    </Card>
  )
}

function Detail({ r, guard }: { r: Row; guard: number }) {
  const sh = show(r, guard)
  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div><div className="text-xs text-mute">Fiziki</div><div className="num font-medium">{r.fiziki === null ? 'Sayım yok' : fmtNum(r.fiziki)}</div></div>
        <div><div className="text-xs text-mute">Ayrılan</div><div className="num font-medium">{fmtNum(r.ayrilan)}</div></div>
        <div><div className="text-xs text-mute">Kanallara gösterilen</div><div className="num font-medium">{sh === null ? '—' : fmtNum(sh)}</div></div>
      </div>
      <div>
        <h3 className="m-0 mb-2 text-sm font-semibold">Bu ürünü ayıran açık siparişler</h3>
        {r.orders.length === 0 ? <Empty>Açık sipariş yok.</Empty> : (
          <div className="overflow-x-auto border border-line rounded-md"><table className="w-full text-sm">
            <thead><tr><th className={th}>Sipariş</th><th className={th}>Kanal</th><th className={th + ' text-right'}>Adet</th><th className={th}>Bekleme</th></tr></thead>
            <tbody>{r.orders.map(({ o, qty }) => <tr key={o.id}><td className={td + ' num'}>{o.no}</td><td className={td}><Chan acc={o.acc} short /></td><td className={td + ' num text-right'}>{fmtNum(qty)}</td><td className={td + ' text-ink2'}>{ago(o.t)}</td></tr>)}</tbody>
          </table></div>
        )}
      </div>
      <div className="rounded-md border border-line bg-bg px-3 py-2 text-sm">
        <div className="font-medium mb-1">Ne olurdu?</div>
        Eski panelde aynı birim birkaç kanalda aynı anda satılabilirdi ve biri iptal edilirdi. Burada ilk gelen sipariş birimi ayırır; diğer kanallar için miktar hemen düşer.
      </div>
    </>
  )
}

export function Reservations() {
  const { allOrders: orders, products, whId, role } = useStore() // ayrılan: bütün şirketlerin açık siparişleri (stok depoda ortaktır)
  const ops = ROLES[role].ops
  const [guard, setGuard] = useState(1), [wh, setWh] = useState<WhId | ''>(whId)
  const [view, setView] = useState<View>('all'), [sort, setSort] = useState<{ k: SortKey; d: 1 | -1 }>({ k: 'sat', d: 1 })
  const [openKey, setOpenKey] = useState<string | null>(null)

  const all = useMemo(() => buildRows(products.length ? products : PRODUCTS, orders).filter(r => !wh || r.wh === wh), [products, orders, wh])
  const F: Record<View, (r: Row) => boolean> = { all: () => true, neg: r => r.sat !== null && r.sat < 0, low: r => r.sat !== null && r.sat >= 0 && r.sat <= r.min, nocount: r => r.sat === null }
  const val = (r: Row, k: SortKey): number | string | null => ({ name: r.p.name, sku: r.p.sku, wh: whName(r.wh), bin: r.bin, fiziki: r.fiziki, ayrilan: r.ayrilan, sat: r.sat, show: show(r, guard), n: r.orders.length })[k]
  const rows = useMemo(() => all.filter(F[view]).sort((a, b) => {
    const x = val(a, sort.k), y = val(b, sort.k)
    if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1 // bilinmeyenler sona
    return (typeof x === 'string' ? x.localeCompare(String(y), 'tr') : (x as number) - (y as number)) * sort.d
  }), [all, view, sort, guard])
  const open = all.find(r => r.key === openKey)
  const known = all.filter(r => r.sat !== null)
  const reservedRows = all.filter(r => r.ayrilan > 0)
  const cnt = (v: View) => all.filter(F[v]).length
  const head = (k: SortKey, label: string, right?: boolean) => (
    <th className={th + (right ? ' text-right' : '')} aria-sort={sort.k === k ? (sort.d === 1 ? 'ascending' : 'descending') : 'none'}>
      <button className="border-0 bg-transparent p-0 font-medium text-mute cursor-pointer" onClick={() => setSort(s => ({ k, d: s.k === k && s.d === 1 ? -1 : 1 }))}>
        {label}{sort.k === k ? (sort.d === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )

  return (
    <>
      <PageHead title="Stok ayırma ve fazla satış koruması" desc="Sipariş gelince birim hemen ayrılır; böylece aynı ürün iki kanalda birden satılmaz." />
      <div className="space-y-4">
        <Flow />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Ayrılmış stoklu ürün" value={fmtNum(reservedRows.length)} hint="ürün × depo" />
          <Stat label="Toplam ayrılan adet" value={fmtNum(reservedRows.reduce((a, r) => a + r.ayrilan, 0))} />
          <Stat label="Satılabilir eksi" value={fmtNum(known.filter(r => r.sat! < 0).length)} tone="bad" hint="fazla satılmış" />
          <Stat label="Satılabilir sıfır" value={fmtNum(known.filter(r => r.sat === 0).length)} tone="warn" hint={`${fmtNum(all.length - known.length)} satırda sayım yok`} />
        </div>
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <label className="grid gap-1 text-xs text-mute">Güvenlik payı: <span className="num text-ink font-medium">{guard} adet</span>
              <input type="range" min={0} max={5} step={1} value={guard} onChange={e => setGuard(Number(e.target.value))} className="accent-[var(--brand)] w-48 max-w-full" />
            </label>
            <label className="grid gap-1 text-xs text-mute">Depo
              <select className={sel} value={wh} onChange={e => setWh(e.target.value as WhId | '')}>
                <option value="">Tüm depolar</option>
                {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
            <p className="m-0 text-xs text-ink2 max-w-[48ch]">Kanallara gösterilen = satılabilir − güvenlik payı (en az 0). Pay arttıkça kanallara daha az stok gösterilir.</p>
          </div>
        </Card>
        <Card pad={false}>
          <div className="px-4 pt-3"><Tabs value={view} onChange={setView} items={[
            { key: 'all', label: 'Tümü', count: cnt('all') }, { key: 'neg', label: 'Eksiye düşen', count: cnt('neg'), tone: 'bad' },
            { key: 'low', label: 'Tükenmek üzere', count: cnt('low') }, { key: 'nocount', label: 'Sayım yok', count: cnt('nocount') }]} /></div>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr>{head('name', 'Ürün')}{head('sku', 'SKU')}{head('wh', 'Depo')}{head('bin', 'Raf')}{head('fiziki', 'Fiziki', true)}{head('ayrilan', 'Ayrılan', true)}{head('sat', 'Satılabilir', true)}{head('show', 'Kanallara gösterilen', true)}{head('n', 'Bekleyen sipariş', true)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.key} className="cursor-pointer hover:bg-bg focus:bg-bg" {...rowProps(() => setOpenKey(r.key))}>
                  <td className={td + ' font-medium min-w-[200px]'}><div className="flex items-center gap-2.5"><Thumb p={r.p} size={32} />{r.p.name}</div></td><td className={td + ' num text-ink2'}>{r.p.sku}</td><td className={td}>{whName(r.wh)}</td><td className={td + ' num text-ink2'}>{r.bin}</td>
                  <td className={td + ' num text-right'}>{r.fiziki === null ? <Badge>Sayım yok</Badge> : fmtNum(r.fiziki)}</td>
                  <td className={td + ' num text-right'}>{fmtNum(r.ayrilan)}</td><td className={td + ' text-right'}><Sat v={r.sat} /></td>
                  <td className={td + ' num text-right'}>{show(r, guard) === null ? '—' : fmtNum(show(r, guard)!)}</td><td className={td + ' num text-right'}>{fmtNum(r.orders.length)}</td>
                </tr>
              ))}
            </tbody>
          </table>{rows.length === 0 && <Empty>Bu filtreye uyan satır yok.</Empty>}</div>
        </Card>
        <div className="grid lg:grid-cols-2 gap-4 items-start"><Simulator rows={all} guard={guard} ops={ops} /><Rules ops={ops} /></div>
      </div>
      <Drawer open={!!open} title={open?.p.name} sub={open && `${open.p.sku} · ${whName(open.wh)} · raf ${open.bin}`} onClose={() => setOpenKey(null)}>
        {open && <Detail r={open} guard={guard} />}
      </Drawer>
    </>
  )
}
