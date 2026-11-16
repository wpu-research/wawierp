import { useMemo, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { CHANNEL, COMM, NOW, PRODUCTS, VAT, WAREHOUSES, account, company, fmtMoney, fmtNum, isRevenue, whName, type Account, type ChannelType, type Product, type WhId } from '../data'
import { ROLES, useStore } from '../store'
import { Thumb } from '../Thumb'
import { Badge, Btn, Card, Chan, Empty, HBars, PageHead, Stat, Tabs, sel, td, th } from '../ui'

const DAY = 86400000
const phys = (p: Product) => (Object.values(p.stock) as { fiziki: number | null }[]).reduce((s, r) => s + (r.fiziki ?? 0), 0)
const pct = (n: number) => (n * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' %'
const NoMoney = () => <Card><Empty>Bu rol için para tutarları gizli. Kâr ve maliyet bilgisi yalnız finans yetkisi olan rollerde görünür.</Empty></Card>
const NoOps = () => <div className="mb-3 rounded-md bg-warn-soft text-warn px-3 py-2 text-sm">Bu rolün işlem yetkisi yok: ekranı inceleyebilirsin ama gönderemez ya da taslak oluşturamazsın.</div>
const Example = ({ t = 'örnek' }: { t?: string }) => <Badge tone="violet" title="Gösterim amaçlı sabit değer">{t}</Badge>

// Örnek tahmini maliyet: fiyatın %50–%66'sı, ürün sırasına göre sabit
const estCost = (p: Product) => p.price * (0.5 + (PRODUCTS.indexOf(p) % 5) * 0.04)
const recent = <T extends { t: number }>(os: T[]) => os.filter(o => o.t >= NOW - 30 * DAY)

// ---------- 1. Toplu listeleme ----------
const NEEDS_EAN: ChannelType[] = ['kaufland', 'otto', 'amazon', 'metro']
function missing(p: Product, a: Account): string[] {
  const m: string[] = []
  if (NEEDS_EAN.includes(a.type) && !p.ean) m.push('EAN')
  if (!p.image) m.push('Görsel')
  if (a.type === 'ebay' && p.listings.some(l => l.reason === 'Kategori eşleşmedi')) m.push('Kategori')
  if (!(p.price > 0)) m.push('Fiyat')
  return m
}
const alreadyOn = (p: Product, a: Account) => p.listings.some(l => l.acc === a.id && ['aktif', 'gonderildi', 'onizleme'].includes(l.status))
const STEPS = ['Ürün seç', 'Kanal seç', 'Eksikleri tamamla', 'Önizle ve gönder']

function Stepper({ step, go }: { step: number; go: (i: number) => void }) {
  return (
    <ol className="m-0 mb-3 p-0 list-none flex flex-wrap gap-2">
      {STEPS.map((s, i) => (
        <li key={s}>
          <button onClick={() => i <= step && go(i)} aria-current={i === step ? 'step' : undefined} disabled={i > step}
            className={`inline-flex items-center gap-2 rounded-md border px-2.5 h-8 text-sm ${i === step ? 'bg-ink text-bg border-ink font-medium' : 'bg-card border-line text-ink2'}`}>
            <span className={`num grid place-items-center size-5 rounded-full text-xs ${i < step ? 'bg-ok text-white' : 'bg-bg text-mute'}`}>{i < step ? <Check size={12} /> : i + 1}</span>{s}
          </button>
        </li>
      ))}
    </ol>
  )
}

export function ListingWizard() {
  const { products, accounts, role, notify } = useStore()
  const ops = ROLES[role].ops
  const [step, setStep] = useState(0)
  const [pids, setPids] = useState<Set<string>>(new Set())
  const [aids, setAids] = useState<Set<string>>(new Set())
  const [onlyNew, setOnlyNew] = useState(true)
  const [done, setDone] = useState<null | { q: number; skipped: { p: string; a: string; why: string }[] }>(null)
  const toggle = (s: Set<string>, id: string, set: (x: Set<string>) => void) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); set(n) }
  const unlisted = (p: Product) => !p.listings.some(l => ['aktif', 'gonderildi', 'onizleme', 'hazirlaniyor'].includes(l.status))
  const rows = products.filter(p => !onlyNew || unlisted(p))
  const selP = products.filter(p => pids.has(p.id)), selA = accounts.filter(a => aids.has(a.id))
  const cells = selP.flatMap(p => selA.map(a => ({ p, a, m: missing(p, a), dup: alreadyOn(p, a) })))
  const ready = cells.filter(c => !c.m.length && !c.dup), skipped = cells.filter(c => c.m.length || c.dup)
  const types = [...new Set(accounts.map(a => a.type))]
  const next = (n: number) => { setDone(null); setStep(n) }

  return (
    <>
      <PageHead title="Toplu listeleme" desc="Seçtiğiniz ürünleri birkaç kanala tek akışta hazırla. Eksik bilgisi olan ilanlar gönderilmez, nedeni gösterilir." legacy={['pool', 'listing-wizard']} />
      {!ops && <NoOps />}
      <Stepper step={step} go={next} />
      {step === 0 && (
        <Card pad={false} title="1 · Ürün seç" right={<label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} />Henüz listelenmemiş</label>}>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}><input type="checkbox" aria-label="Tümünü seç" checked={rows.length > 0 && rows.every(p => pids.has(p.id))} onChange={e => setPids(e.target.checked ? new Set(rows.map(p => p.id)) : new Set())} /></th><th className={th}>Ürün</th><th className={th}>Marka</th><th className={th}>EAN</th><th className={th}>Görsel</th><th className={th + ' text-right'}>Fiyat</th><th className={th + ' text-right'}>İlan</th></tr></thead>
            <tbody>{rows.map(p => (
              <tr key={p.id} className="hover:bg-bg">
                <td className={td}><input type="checkbox" aria-label={p.name + ' seç'} checked={pids.has(p.id)} onChange={() => toggle(pids, p.id, setPids)} /></td>
                <td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} /><div>{p.name}<div className="text-xs text-mute">{p.sku}</div></div></div></td><td className={td}>{p.brand}</td>
                <td className={td}>{p.ean ? <span className="num">{p.ean}</span> : <Badge tone="bad">Yok</Badge>}</td>
                <td className={td}>{p.image ? <Badge tone="ok">Var</Badge> : <Badge tone="bad">Yok</Badge>}</td>
                <td className={td + ' num text-right'}>{fmtMoney(p.price)}</td><td className={td + ' num text-right'}>{p.listings.length}</td>
              </tr>))}</tbody>
          </table>{rows.length === 0 && <Empty>Listelenecek ürün yok.</Empty>}</div>
          <div className="p-3 flex items-center justify-between border-t border-line"><span className="text-sm text-ink2 num">{pids.size} ürün seçili</span><Btn variant="primary" disabled={!pids.size} onClick={() => next(1)}>Devam</Btn></div>
        </Card>
      )}
      {step === 1 && (
        <Card title="2 · Kanal seç" right={<span className="text-xs text-mute num">{aids.size} hesap seçili</span>}>
          <div className="space-y-3">{types.map(t => (
            <div key={t}><div className="text-xs font-medium text-mute mb-1">{CHANNEL[t].label}</div>
              <div className="flex flex-wrap gap-2">{accounts.filter(a => a.type === t).map(a => (
                <label key={a.id} className={`inline-flex items-center gap-2 rounded-full border px-3 h-8 text-sm cursor-pointer ${aids.has(a.id) ? 'bg-brand-soft text-brand border-brand' : 'bg-card border-line'}`}>
                  <input type="checkbox" className="sr-only" checked={aids.has(a.id)} onChange={() => toggle(aids, a.id, setAids)} /><Chan acc={a.id} short={false} />
                </label>))}</div></div>))}</div>
          <div className="mt-4 flex gap-2 justify-between"><Btn onClick={() => next(0)}>Geri</Btn><Btn variant="primary" disabled={!aids.size} onClick={() => next(2)}>Devam</Btn></div>
        </Card>
      )}
      {step === 2 && (
        <Card pad={false} title="3 · Eksikleri tamamla" right={<span className="flex gap-1.5"><Badge tone="ok">{ready.length} hazır</Badge><Badge tone={skipped.length ? 'bad' : 'neutral'}>{skipped.length} eksik</Badge></span>}>
          <p className="m-0 px-4 pb-2 text-xs text-mute">Kurallar <Example t="örnek kural" /> : Kaufland, OTTO, Amazon ve METRO için EAN; her kanal için görsel; eBay için kategori eşleşmesi; fiyat 0'dan büyük olmalı.</p>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Ürün</th>{selA.map(a => <th key={a.id} className={th}><Chan acc={a.id} /></th>)}</tr></thead>
            <tbody>{selP.map(p => (
              <tr key={p.id}><td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={28} />{p.name}</div></td>{selA.map(a => { const m = missing(p, a)
                return <td key={a.id} className={td}>{alreadyOn(p, a) ? <Badge>Zaten var</Badge> : m.length ? <Badge tone="bad" title="Tamamlanmadan gönderilmez">Eksik: {m.join(', ')}</Badge> : <Badge tone="ok">Hazır</Badge>}</td> })}</tr>))}</tbody>
          </table></div>
          <div className="p-3 flex gap-2 justify-between border-t border-line"><Btn onClick={() => next(1)}>Geri</Btn><Btn variant="primary" onClick={() => next(3)}>Önizle</Btn></div>
        </Card>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Gönderilecek ilan" value={ready.length} tone="ok" /><Stat label="Atlanacak" value={skipped.length} tone={skipped.length ? 'warn' : undefined} hint="eksik ya da zaten açık" />
            <Stat label="Ürün" value={selP.length} /><Stat label="Hesap" value={selA.length} />
          </div>
          <Card title="Stok kaynağı"><Badge tone="info">Otomatik: fiziki, yoksa drop</Badge><p className="m-0 mt-2 text-sm text-ink2">Her ilan için önce depodaki fiziki stok kullanılır; fiziki stok yoksa tedarikçi (drop) stoğuna düşülür.</p></Card>
          {done && (
            <Card title="Sonuç (simülasyon)"><p className="m-0 text-sm"><b className="num">{done.q}</b> ilan kuyruğa alındı, <b className="num">{done.skipped.length}</b> ilan atlandı. Taslak ekran: hiçbir ilan gerçekte yayınlanmadı.</p>
              <ul className="m-0 mt-2 pl-5 text-sm text-ink2 max-h-48 overflow-y-auto">{done.skipped.map((s, i) => <li key={i}>{s.p} → {s.a}: {s.why}</li>)}</ul></Card>)}
          <div className="flex gap-2 justify-between"><Btn onClick={() => next(2)}>Geri</Btn>
            <Btn variant="primary" disabled={!ops || !ready.length || !!done} title={ops ? undefined : 'Bu rolün yetkisi yok'} onClick={() => {
              setDone({ q: ready.length, skipped: skipped.map(c => ({ p: c.p.name, a: CHANNEL[c.a.type].label + ' · ' + c.a.name, why: c.dup ? 'zaten açık' : 'eksik: ' + c.m.join(', ') })) })
              notify(`${ready.length} ilan kuyruğa alındı (örnek, gerçek yayın yok)`)
            }}>Gönder</Btn></div>
        </div>
      )}
    </>
  )
}

// ---------- 2. Fiyat kuralları ve kârlılık ----------
type Rule = { id: string; label: string; desc: string; apply: (p: Product, comp: number) => number }
const compPrice = (p: Product) => p.price * (1 + ((PRODUCTS.indexOf(p) % 9) - 4) / 100)
const RULES: Rule[] = [
  { id: 'marj', label: 'Hedef marj %20', desc: 'Maliyet, KDV, %12 komisyon ve kargo sonrası %20 kalacak fiyat', apply: p => (estCost(p) + 4.9) / (1 - 0.2 - 0.12 - 0.19 / 1.19) },
  { id: 'alt', label: 'Alt sınır: maliyet + %8', desc: 'Fiyat bu sınırın altındaysa yukarı çeker', apply: p => Math.max(p.price, estCost(p) * 1.08) },
  { id: 'rakip', label: 'Rakip fiyatının altına inme', desc: 'Rakip daha pahalıysa rakipten %1 ucuza ayarlar, alt sınırın altına inmez', apply: (p, c) => Math.max(c * 0.99, estCost(p) * 1.08) },
  { id: 'yuvarla', label: '.99 ile bitir', desc: 'Fiyatı en yakın x,99 değerine yuvarlar', apply: p => Math.floor(p.price) + 0.99 },
]

function Calc({ products, accounts }: { products: Product[]; accounts: Account[] }) {
  const [pid, setPid] = useState(products[0]?.id ?? '')
  const [aid, setAid] = useState(accounts[0]?.id ?? '')
  const p = products.find(x => x.id === pid) ?? products[0], a = accounts.find(x => x.id === aid) ?? accounts[0]
  const [ov, setOv] = useState<Record<string, number>>({})
  if (!p || !a) return <Empty>Ürün ya da hesap yok.</Empty>
  const key = p.id + a.id
  const vat = VAT[company(a.company).country]
  const v = (n: string, d: number) => ov[key + n] ?? d
  const cost = v('c', +estCost(p).toFixed(2)), price = v('p', p.price), ship = v('s', 4.9), vr = v('v', vat * 100) / 100, cm = v('m', COMM[a.type] * 100) / 100
  const vatAmt = price - price / (1 + vr), comm = price * cm, profit = price - vatAmt - comm - ship - cost
  const fld = (n: string, label: string, val: number, extra?: ReactNode) => (
    <label className="block text-xs text-mute">{label} {extra}<input type="number" step="0.1" value={val} onChange={e => setOv({ ...ov, [key + n]: +e.target.value })} className="mt-0.5 w-full h-8 rounded-md border border-line bg-card px-2 text-sm text-ink num" /></label>)
  const f = (n: number) => fmtMoney(n, a.cur)
  return (
    <Card title="Net kâr hesaplayıcı" right={<Example t="örnek oran" />}>
      <div className="grid sm:grid-cols-2 gap-2 mb-3">
        <select aria-label="Ürün" className={sel} value={p.id} onChange={e => setPid(e.target.value)}>{products.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select aria-label="Hesap" className={sel} value={a.id} onChange={e => setAid(e.target.value)}>{accounts.map(x => <option key={x.id} value={x.id}>{CHANNEL[x.type].label} · {x.name}</option>)}</select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {fld('c', `Alış maliyeti (${a.cur})`, cost, <Example />)}{fld('p', `Satış fiyatı (${a.cur})`, price)}{fld('s', 'Kargo', ship, <Example />)}
        {fld('v', 'KDV %', +(vr * 100).toFixed(1))}{fld('m', 'Komisyon %', +(cm * 100).toFixed(1), <Example t="örnek oran" />)}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3"><Stat label="Net kâr" value={f(profit)} tone={profit < 0 ? 'bad' : 'ok'} /><Stat label="Marj" value={pct(price ? profit / price : 0)} tone={profit / price < 0.08 ? 'warn' : 'ok'} /></div>
      <div className="mt-3"><HBars fmt={f} data={[{ label: 'Maliyet', value: cost, color: 'var(--ink2)' }, { label: 'Komisyon', value: comm, color: 'var(--warn)' }, { label: 'Kargo', value: ship, color: 'var(--violet)' }, { label: 'KDV', value: vatAmt, color: 'var(--mute)' }, { label: 'Kâr', value: Math.max(0, profit), color: 'var(--ok)' }]} /></div>
    </Card>
  )
}

export function PriceRules() {
  const { role, products, accounts, orders } = useStore()
  const [on, setOn] = useState<Record<string, boolean>>({ marj: true, alt: true, rakip: false, yuvarla: false })
  const chan = useMemo(() => {
    const m = new Map<ChannelType, { n: number; rev: number; comm: number; cost: number; vat: number }>()
    for (const o of recent(orders).filter(isRevenue)) {
      const a = account(o.acc), r = m.get(a.type) ?? { n: 0, rev: 0, comm: 0, cost: 0, vat: 0 }
      r.n++
      if (o.cur === 'EUR') {
        r.rev += o.total; r.comm += o.total * COMM[a.type]; r.vat += o.total - o.total / (1 + VAT[company(o.company).country]) // KDV, tutarın içinden ayrılır
        r.cost += o.items.reduce((s, i) => { const p = PRODUCTS.find(x => x.id === i.pid); return s + (p ? estCost(p) * i.qty : 0) }, 0) + 4.9
      }
      m.set(a.type, r)
    }
    return [...m.entries()].sort((x, y) => y[1].rev - x[1].rev)
  }, [orders])
  if (!ROLES[role].finance) return <><PageHead title="Fiyat kuralları ve kârlılık" desc="Maliyet, komisyon ve marj hesapları." /><NoMoney /></>
  const preview = (r: Rule) => {
    const ch = products.map(p => ({ d: (Math.round(r.apply(p, compPrice(p)) * 100) / 100 - p.price) / p.price })).filter(x => Math.abs(x.d) > 0.0005)
    return { n: ch.length, min: Math.min(0, ...ch.map(c => c.d)), max: Math.max(0, ...ch.map(c => c.d)) }
  }
  return (
    <>
      <PageHead title="Fiyat kuralları ve kârlılık" desc="Net kârı hesaplayın, fiyat kurallarının etkisini önizleyin, kanalların tahmini kârlılığına bak." legacy={['pricing', 'profitability']} />
      <div className="grid xl:grid-cols-2 gap-3">
        <Calc products={products} accounts={accounts} />
        <Card title="Fiyat kuralları" right={<Badge tone="info">Yalnız öner · fiyat değişmez</Badge>}>
          <p className="m-0 mb-2 text-xs text-mute">Maliyet ve rakip fiyatı <Example /> değerlerdir (ürün sırasına göre sabit); etkilenen ürün sayısı ve değişim yüzdesi bunlara göre hesaplanır.</p>
          <ul className="m-0 p-0 list-none divide-y divide-line">{RULES.map(r => { const pv = preview(r); return (
            <li key={r.id} className="py-2 flex items-start gap-3">
              <input type="checkbox" className="mt-1" aria-label={r.label + ' aç/kapat'} checked={!!on[r.id]} onChange={e => setOn({ ...on, [r.id]: e.target.checked })} />
              <div className="min-w-0 flex-1"><div className="text-sm font-medium">{r.label}</div><div className="text-xs text-ink2">{r.desc}</div></div>
              <div className={`text-right text-xs shrink-0 ${on[r.id] ? '' : 'opacity-50'}`}><div className="num font-medium text-sm">{pv.n} ürün</div><div className="num text-mute">{pct(pv.min)} … +{pct(pv.max)}</div></div>
            </li>) })}</ul>
        </Card>
      </div>
      <Card pad={false} className="mt-3" title="Kanal bazında kârlılık (30 gün)" right={<Badge tone="warn">Tahmin</Badge>}>
        <p className="m-0 px-4 pb-2 text-xs text-mute">Yalnız EUR siparişler hesaba katıldı (sipariş adedi tüm para birimleri). Komisyon <Example t="örnek oran" />, maliyet ve kargo <Example /> varsayımdır; KDV ve iadeler gerçek hesapla farklı olabilir.</p>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
          <thead><tr><th className={th}>Kanal</th><th className={th + ' text-right'}>Sipariş</th><th className={th + ' text-right'}>Ciro (EUR)</th><th className={th + ' text-right'}>Tahmini komisyon</th><th className={th + ' text-right'}>Tahmini marj</th></tr></thead>
          <tbody>{chan.map(([t, r]) => { const mg = r.rev ? (r.rev - r.vat - r.comm - r.cost) / r.rev : null; return (
            <tr key={t} className="hover:bg-bg"><td className={td}><span className="inline-block size-2 rounded-full mr-1.5" style={{ background: CHANNEL[t].color }} />{CHANNEL[t].label}</td>
              <td className={td + ' num text-right'}>{fmtNum(r.n)}</td><td className={td + ' num text-right'}>{r.rev ? fmtMoney(r.rev, 'EUR', 0) : '–'}</td>
              <td className={td + ' num text-right'}>{r.rev ? fmtMoney(r.comm, 'EUR', 0) : '–'}</td>
              <td className={td + ' num text-right'}>{mg === null ? <span className="text-mute">EUR sipariş yok</span> : <Badge tone={mg < 0.05 ? 'bad' : mg < 0.12 ? 'warn' : 'ok'}>{pct(mg)}</Badge>}</td></tr>) })}</tbody>
        </table>{chan.length === 0 && <Empty>Son 30 günde sipariş yok.</Empty>}</div>
      </Card>
    </>
  )
}

// ---------- 3. Tedarik ve stok önerileri ----------
type RTab = 'order' | 'transfer' | 'buffer' | 'slow'
export function Replenish() {
  const { products, allOrders, role, notify } = useStore()
  const ops = ROLES[role].ops
  const [tab, setTab] = useState<RTab>('order')
  const [cover, setCover] = useState(30)
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [buf, setBuf] = useState(2)
  const sold = useMemo(() => {
    const m = new Map<string, number>()
    // Stok depoda ortaktır: satış hızı da şirket süzgeciyle daraltılmadan, yalnız bizim depodan çıkan (fiziki) siparişlerle hesaplanır.
    for (const o of recent(allOrders).filter(o => isRevenue(o) && o.supply === 'fiziki')) for (const i of o.items) m.set(i.pid, (m.get(i.pid) ?? 0) + i.qty)
    return m
  }, [allOrders])
  const lines = useMemo(() => products.map(p => {
    const s = sold.get(p.id) ?? 0, rate = s / 30, st = phys(p), days = rate > 0 ? st / rate : Infinity
    return { p, s, rate, st, days, qty: Math.max(0, Math.ceil(rate * cover - st)) }
  }).sort((a, b) => a.days - b.days), [products, sold, cover])
  const moves = products.flatMap(p => {
    const rows = (Object.entries(p.stock) as [WhId, NonNullable<Product['stock'][WhId]>][]).map(([w, r]) => ({ w, f: r.fiziki ?? 0, min: r.min, known: r.fiziki !== null }))
    return rows.filter(r => r.known && r.f <= r.min).flatMap(low => rows.filter(d => d.w !== low.w && d.known && d.f - d.min * 2 > 0).slice(0, 1).map(from => ({ p, low, from, qty: Math.min(low.min * 2 - low.f, from.f - from.min * 2) }))).filter(x => x.qty > 0)
  })
  const slow = lines.filter(l => l.st > 0 && l.s <= 1).sort((a, b) => b.st * b.p.price - a.st * a.p.price)
  const byBrand = Object.entries(draft).reduce<Record<string, { p: Product; q: number }[]>>((m, [id, q]) => { const p = products.find(x => x.id === id); if (p) (m[p.brand] ??= []).push({ p, q }); return m }, {})
  const guard = !ops && <NoOps />

  return (
    <>
      <PageHead title="Tedarik ve stok önerileri" desc="Satış hızına göre ne kadar sipariş edilmeli, hangi depodan hangisine aktarılmalı, hangi stok bekliyor." legacy={['replenishment', 'safety-stock', 'dead-stock']} />
      {guard}
      <Tabs value={tab} onChange={setTab} items={[{ key: 'order', label: 'Yeniden sipariş', count: lines.filter(l => l.qty > 0).length }, { key: 'transfer', label: 'Depolar arası aktarım', count: moves.length }, { key: 'buffer', label: 'Güvenlik payı' }, { key: 'slow', label: 'Yavaş ve ölü stok', count: slow.length }]} />
      <div className="mt-2 space-y-3">
        {tab === 'order' && <>
          <Card pad={false} title="Yeniden sipariş önerisi" right={<label className="text-sm flex items-center gap-1.5">Hedef stok süresi<select className={sel} value={cover} onChange={e => setCover(+e.target.value)}>{[14, 30, 45].map(d => <option key={d} value={d}>{d} gün</option>)}</select></label>}>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Ürün</th><th className={th + ' text-right'}>30 gün satış</th><th className={th + ' text-right'}>Günlük hız</th><th className={th + ' text-right'}>Fiziki stok</th><th className={th + ' text-right'}>Yeterlilik</th><th className={th + ' text-right'}>Önerilen</th><th className={th}></th></tr></thead>
              <tbody>{lines.map(l => (
                <tr key={l.p.id} className="hover:bg-bg"><td className={td}><div className="flex items-center gap-2.5"><Thumb p={l.p} size={32} /><div>{l.p.name}<div className="text-xs text-mute">{l.p.brand}</div></div></div></td>
                  <td className={td + ' num text-right'}>{l.s}</td><td className={td + ' num text-right'}>{l.rate.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</td><td className={td + ' num text-right'}>{fmtNum(l.st)}</td>
                  <td className={td + ' text-right'}>{l.days === Infinity ? <span className="text-mute">satış yok</span> : <Badge tone={l.days < 7 ? 'bad' : l.days < 14 ? 'warn' : 'ok'}>{Math.round(l.days)} gün</Badge>}</td>
                  <td className={td + ' num text-right font-medium'}>{l.qty}</td>
                  <td className={td}><Btn disabled={!ops || !l.qty || l.p.id in draft} aria-label={l.p.name + ' taslağa ekle'} onClick={() => setDraft({ ...draft, [l.p.id]: l.qty })}>Sipariş taslağına ekle</Btn></td></tr>))}</tbody>
            </table></div>
          </Card>
          <Card title="Sipariş taslağı" right={<Btn variant="primary" disabled={!ops || !Object.keys(draft).length} onClick={() => { notify(`${Object.keys(byBrand).length} tedarikçi taslağı hazırlandı`); setDraft({}) }}>Taslağı hazırla</Btn>}>
            {Object.keys(byBrand).length === 0 ? <p className="m-0 text-sm text-mute">Taslak boş.</p> : Object.entries(byBrand).map(([b, ls]) => (
              <div key={b} className="mb-2"><div className="text-sm font-medium">{b} <span className="text-xs text-mute font-normal">(tedarikçi yerine marka)</span></div>
                <ul className="m-0 pl-5 text-sm text-ink2">{ls.map(x => <li key={x.p.id}>{x.p.name}: <span className="num">{x.q}</span> adet</li>)}</ul></div>))}
            <p className="m-0 mt-2 text-xs text-mute">Taslak hazırlanır ama tedarikçiye gönderilmesi onay gerektirir.</p>
          </Card>
        </>}
        {tab === 'transfer' && (
          <Card pad={false} title="Depolar arası aktarım önerisi" right={<a href="#/transfers" className="text-sm text-brand">Transferlere git</a>}>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Ürün</th><th className={th}>Eksik depo</th><th className={th}>Fazla depo</th><th className={th + ' text-right'}>Önerilen adet</th><th className={th}></th></tr></thead>
              <tbody>{moves.map((m, i) => (
                <tr key={i} className="hover:bg-bg"><td className={td}><div className="flex items-center gap-2.5"><Thumb p={m.p} size={28} />{m.p.name}</div></td>
                  <td className={td}>{whName(m.low.w)} <Badge tone={m.low.f <= 0 ? 'bad' : 'warn'}>{m.low.f} / min {m.low.min}</Badge></td>
                  <td className={td}>{whName(m.from.w)} <span className="num text-mute">({m.from.f})</span></td><td className={td + ' num text-right font-medium'}>{m.qty}</td>
                  <td className={td}><Btn disabled={!ops} onClick={() => notify(`Transfer taslağı: ${whName(m.from.w)} → ${whName(m.low.w)}, ${m.qty} adet`)}>Transfer taslağı oluştur</Btn></td></tr>))}</tbody>
            </table>{moves.length === 0 && <Empty>Aktarım gerektiren ürün yok.</Empty>}</div>
            <p className="m-0 p-3 text-xs text-mute">Fazla = depodaki stok minimumun 2 katını aşan kısım. Depo sayısı: {WAREHOUSES.length}.</p>
          </Card>
        )}
        {tab === 'buffer' && (
          <Card pad={false} title="Güvenlik payı" right={<label className="text-sm flex items-center gap-2">Pay: <span className="num font-medium w-6">{buf}</span><input type="range" min={0} max={10} value={buf} onChange={e => setBuf(+e.target.value)} aria-label="Güvenlik payı adedi" /></label>}>
            <p className="m-0 px-4 pb-2 text-xs text-mute">Kanallara gerçek stoktan {buf} adet eksik gösterilir; fazla satış riski azalır. Yalnız önizleme, kanallara bir şey gönderilmez.</p>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Ürün</th><th className={th + ' text-right'}>Gerçek stok</th><th className={th + ' text-right'}>Kanallara gösterilen</th><th className={th + ' text-right'}>Fark</th></tr></thead>
              <tbody>{lines.map(l => { const sh = Math.max(0, l.st - buf); return (
                <tr key={l.p.id} className="hover:bg-bg"><td className={td}><div className="flex items-center gap-2.5"><Thumb p={l.p} size={28} />{l.p.name}</div></td><td className={td + ' num text-right'}>{fmtNum(l.st)}</td>
                  <td className={td + ' num text-right font-medium'}>{fmtNum(sh)}{sh === 0 && l.st > 0 && <> <Badge tone="warn">kanalda tükendi</Badge></>}</td><td className={td + ' num text-right text-mute'}>−{l.st - sh}</td></tr>) })}</tbody>
            </table></div>
          </Card>
        )}
        {tab === 'slow' && (
          <Card pad={false} title="Yavaş ve ölü stok" right={<span className="text-sm text-ink2">Bağlı değer: <b className="num">{fmtMoney(slow.reduce((s, l) => s + l.st * l.p.price, 0), 'EUR', 0)}</b> <Example t="satış fiyatıyla" /></span>}>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Ürün</th><th className={th + ' text-right'}>Stok</th><th className={th + ' text-right'}>30 gün satış</th><th className={th + ' text-right'}>Bağlı değer</th><th className={th}>Öneri</th></tr></thead>
              <tbody>{slow.map(l => (
                <tr key={l.p.id} className="hover:bg-bg"><td className={td}><div className="flex items-center gap-2.5"><Thumb p={l.p} size={28} />{l.p.name}</div></td><td className={td + ' num text-right'}>{fmtNum(l.st)}</td>
                  <td className={td + ' text-right'}>{l.s === 0 ? <Badge tone="bad">Ölü</Badge> : <Badge tone="warn">{l.s} adet</Badge>}</td>
                  <td className={td + ' num text-right'}>{fmtMoney(l.st * l.p.price, 'EUR', 0)}</td>
                  <td className={td}><div className="flex flex-wrap gap-1"><Badge>İndirim</Badge>{l.p.listings.length < 3 && <Badge>Başka kanala aç</Badge>}{l.s === 0 && <Badge>İade et</Badge>}</div></td></tr>))}</tbody>
            </table>{slow.length === 0 && <Empty>Yavaş hareket eden stok yok.</Empty>}</div>
          </Card>
        )}
      </div>
    </>
  )
}
