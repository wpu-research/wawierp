import { useMemo, useState, type ReactNode } from 'react'
import { Check, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { NOW, PRODUCTS, RET, VAT, company, fmtDT, fmtMoney, fmtNum, product, type Order, type Product } from '../data'
import { b2bTotals, type B2B } from '../data2'
import { useStore } from '../store'
import { Badge, Btn, Card, Empty, PageHead, Stat, Tabs, sel, td, th } from '../ui'
import { Thumb } from '../Thumb'

const inp = 'h-8 rounded-md border border-line bg-card px-2 text-sm max-w-full'
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const tierOf = (code: string) => [8, 12, 15][hash(code) % 3]
const stockWord = (p: Product) => {
  const t = Object.values(p.stock).reduce((a, r) => a + Math.max(0, r?.fiziki ?? 0) + (r?.sanal ?? 0) + (r?.drop ?? 0), 0)
  return t <= 0 ? { w: 'Yok', tone: 'bad' as const } : t <= 20 ? { w: 'Az', tone: 'warn' as const } : { w: 'Var', tone: 'ok' as const }
}
const linesOf = (no: string): { pid: string; qty: number }[] => {
  const h = hash(no), n = 3 + (h % 3)
  return Array.from({ length: n }, (_, i) => ({ pid: PRODUCTS[(h + i * 5) % PRODUCTS.length].id, qty: 2 + ((h >> i) % 9) }))
}
const Banner = ({ children, extra }: { children: ReactNode; extra?: ReactNode }) => (
  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-violet-soft px-4 py-2.5 text-sm text-violet">
    <span className="font-medium">{children}</span>{extra}
  </div>
)

type Cart = Record<string, number>
type Tab = 'price' | 'reorder' | 'cart' | 'docs'

export function CustomerPortal() {
  const { b2b, notify } = useStore()
  const [cid, setCid] = useState('')
  const [tab, setTab] = useState<Tab>('price')
  const [cart, setCart] = useState<Cart>({})
  const [note, setNote] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const c: B2B | undefined = b2b.find(x => x.id === cid) ?? b2b[0]
  const add = (pid: string, q: number) => { setSent(null); setCart(k => ({ ...k, [pid]: (k[pid] ?? 0) + q })) }
  const count = Object.values(cart).reduce((a, q) => a + q, 0)
  if (!c) return <div><PageHead title="Toptan müşteri portalı (müşteri görünümü)" /><Empty>Bu kapsamda toptan müşteri yok.</Empty></div>
  const tier = tierOf(c.code)
  return (
    <div>
      <PageHead title="Toptan müşteri portalı (müşteri görünümü)" desc="Toptan müşterinin giriş yapınca gördüğü ekran: özel fiyat, yeniden sipariş, sepet ve belgeler." />
      <Banner extra={
        <label className="flex items-center gap-2 text-ink">Müşteri:
          <select className={sel} aria-label="Önizlenecek müşteri" value={c.id} onChange={e => { setCid(e.target.value); setCart({}); setSent(null) }}>
            {b2b.map(x => <option key={x.id} value={x.id}>{x.code} · {x.name}</option>)}
          </select>
        </label>}>Önizleme: müşterinin gördüğü ekran</Banner>
      <div className="mb-3"><Tabs<Tab> value={tab} onChange={setTab} items={[
        { key: 'price', label: 'Fiyat listem' }, { key: 'reorder', label: 'Yeniden sipariş' },
        { key: 'cart', label: 'Sepet', count }, { key: 'docs', label: 'Belgelerim' }]} /></div>
      {tab === 'price' && <PriceList c={c} tier={tier} onAdd={(p, q) => { add(p, q); notify('Sepete eklendi') }} />}
      {tab === 'reorder' && <Reorder c={c} onAdd={ls => { ls.forEach(l => add(l.pid, l.qty)); notify('Sepete eklendi') }} />}
      {tab === 'cart' && <CartView c={c} tier={tier} cart={cart} setCart={setCart} note={note} setNote={setNote} sent={sent}
        onSend={() => { setSent('TLP-' + String(hash(c.code + count) % 90000 + 10000)); setCart({}); setNote(''); notify('Sipariş talebi taslak olarak oluşturuldu') }} />}
      {tab === 'docs' && <Docs c={c} />}
    </div>
  )
}

function PriceList({ c, tier, onAdd }: { c: B2B; tier: number; onAdd: (pid: string, q: number) => void }) {
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [qty, setQty] = useState<Record<string, number>>({})
  const cats = [...new Set(PRODUCTS.map(p => p.cat))]
  const rows = PRODUCTS.filter(p => (!cat || p.cat === cat) && (p.name + p.sku).toLowerCase().includes(q.toLowerCase()))
  return (
    <Card pad={false} title={<span className="flex items-center gap-2">Fiyat listem · {c.code} <Badge tone="violet" title="Örnek iskonto kademesi">%{tier} iskonto · örnek</Badge></span>}
      right={<span className="flex flex-wrap gap-2">
        <input className={inp} placeholder="Ürün ara" aria-label="Ürün ara" value={q} onChange={e => setQ(e.target.value)} />
        <select className={sel} aria-label="Kategori" value={cat} onChange={e => setCat(e.target.value)}><option value="">Tüm kategoriler</option>{cats.map(x => <option key={x}>{x}</option>)}</select></span>}>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr><th className={th}>Ürün</th><th className={th + ' text-right'}>Liste fiyatı</th><th className={th + ' text-right'}>Size özel fiyat</th><th className={th}>İndirim</th><th className={th}>Stok</th><th className={th}>Adet</th><th className={th} /></tr></thead>
        <tbody>{rows.map(p => {
          const s = stockWord(p), n = qty[p.id] ?? 1
          return (
            <tr key={p.id}>
              <td className={td}><div className="flex items-center gap-3"><Thumb p={p} size={48} /><div><div className="font-medium">{p.name}</div><div className="text-xs text-mute">{p.brand} · {p.sku}</div></div></div></td>
              <td className={td + ' num text-right text-mute line-through'}>{fmtMoney(p.price)}</td>
              <td className={td + ' num text-right font-semibold'}>{fmtMoney(p.price * (1 - tier / 100))}</td>
              <td className={td}><Badge tone="info">%{tier}</Badge></td>
              <td className={td}><Badge tone={s.tone}>{s.w}</Badge></td>
              <td className={td}><Stepper value={n} label={p.name} onChange={v => setQty(k => ({ ...k, [p.id]: v }))} /></td>
              <td className={td}><Btn variant="primary" disabled={s.w === 'Yok'} onClick={() => onAdd(p.id, n)}><ShoppingCart size={14} />Sepete ekle</Btn></td>
            </tr>)
        })}</tbody></table>
        {rows.length === 0 && <Empty>Aramaya uyan ürün yok.</Empty>}
      </div>
      <p className="m-0 px-4 py-2 text-xs text-mute">Stok yalnızca Var / Az / Yok olarak gösterilir; kesin adetler müşteriyle paylaşılmaz. Fiyatlar KDV hariçtir ve avro cinsindendir. İskonto kademeleri örnektir.</p>
    </Card>
  )
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Btn variant="outline" className="!px-1.5" aria-label={`${label}: azalt`} onClick={() => onChange(Math.max(1, value - 1))}><Minus size={14} /></Btn>
      <span className="num w-8 text-center" aria-live="polite">{value}</span>
      <Btn variant="outline" className="!px-1.5" aria-label={`${label}: artır`} onClick={() => onChange(value + 1)}><Plus size={14} /></Btn>
    </span>
  )
}

function Reorder({ c, onAdd }: { c: B2B; onAdd: (ls: { pid: string; qty: number }[]) => void }) {
  const invs = c.invoices.filter(i => i.status === 'kesin')
  if (!invs.length) return <Card><Empty>Henüz kesinleşmiş fatura yok.</Empty></Card>
  return (
    <div className="space-y-3">
      {invs.map(i => {
        const ls = linesOf(i.no)
        return (
          <Card key={i.no} title={<span className="flex items-center gap-2">{i.no} <span className="font-normal text-mute">{fmtDT(i.t)}</span> <Badge tone="violet" title="Fatura satırları örnek olarak üretildi">satırlar örnek</Badge></span>}
            right={<Btn variant="primary" onClick={() => onAdd(ls)}><ShoppingCart size={14} />Aynısını sepete ekle</Btn>}>
            <ul className="m-0 list-none space-y-1 p-0 text-sm">{ls.map(l => <li key={l.pid} className="flex justify-between gap-3"><span className="truncate">{product(l.pid).name}</span><span className="num text-ink2">× {l.qty}</span></li>)}</ul>
            <div className="mt-2 text-xs text-mute">Fatura toplamı: <span className="num">{fmtMoney(i.total, c.cur)}</span></div>
          </Card>)
      })}
    </div>
  )
}

function CartView({ c, tier, cart, setCart, note, setNote, sent, onSend }: { c: B2B; tier: number; cart: Cart; setCart: (f: (k: Cart) => Cart) => void; note: string; setNote: (s: string) => void; sent: string | null; onSend: () => void }) {
  const ids = Object.keys(cart).filter(k => cart[k] > 0)
  const sub = ids.reduce((a, id) => a + product(id).price * (1 - tier / 100) * cart[id], 0)
  const rate = VAT[company(c.company).country], vat = sub * rate
  return (
    <div className="space-y-3">
      {sent && <Card className="!border-ok"><div className="flex items-start gap-2"><Check className="text-ok shrink-0" size={18} />
        <div><div className="font-semibold">Talep {sent} taslak olarak oluşturuldu</div>
          <p className="m-0 text-sm text-ink2">Satıcı onaylayınca faturaya döner. Bu bir önizlemedir; hiçbir şey gerçekten gönderilmedi.</p></div></div></Card>}
      <Card pad={false} title="Sepetim">
        {ids.length === 0 ? <Empty>Sepet boş. Fiyat listesinden ürün ekleyin.</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr><th className={th}>Ürün</th><th className={th + ' text-right'}>Birim</th><th className={th}>Adet</th><th className={th + ' text-right'}>Tutar</th><th className={th} /></tr></thead>
            <tbody>{ids.map(id => { const p = product(id), u = p.price * (1 - tier / 100); return (
              <tr key={id}><td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} />{p.name}</div></td><td className={td + ' num text-right'}>{fmtMoney(u)}</td>
                <td className={td}><Stepper value={cart[id]} label={p.name} onChange={v => setCart(k => ({ ...k, [id]: v }))} /></td>
                <td className={td + ' num text-right'}>{fmtMoney(u * cart[id])}</td>
                <td className={td}><Btn variant="ghost" aria-label={`${p.name} sepetten çıkar`} onClick={() => setCart(k => { const n = { ...k }; delete n[id]; return n })}><Trash2 size={14} /></Btn></td></tr>) })}</tbody></table></div>)}
      </Card>
      {ids.length > 0 && (
        <Card title="Özet">
          <dl className="m-0 grid max-w-sm grid-cols-2 gap-y-1 text-sm">
            <dt className="text-ink2">Ara toplam</dt><dd className="num m-0 text-right">{fmtMoney(sub)}</dd>
            <dt className="text-ink2">KDV (%{Math.round(rate * 100)} · {company(c.company).country})</dt><dd className="num m-0 text-right">{fmtMoney(vat)}</dd>
            <dt className="font-semibold">Toplam</dt><dd className="num m-0 text-right font-semibold">{fmtMoney(sub + vat)}</dd></dl>
          <label className="mt-3 block text-sm text-ink2">Sipariş notu
            <textarea className="mt-1 block w-full rounded-md border border-line bg-card p-2 text-sm text-ink" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Teslimat isteği vb." /></label>
          <div className="mt-3"><Btn variant="primary" onClick={onSend}>Sipariş talebi gönder</Btn></div>
        </Card>)}
    </div>
  )
}

function Docs({ c }: { c: B2B }) {
  const t = b2bTotals(c)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Kesilen faturalar" value={fmtMoney(t.billed, c.cur, 0)} /><Stat label="Yaptığınız ödemeler" value={fmtMoney(t.paid, c.cur, 0)} tone="ok" />
        <Stat label="Açık bakiye" value={fmtMoney(t.balance, c.cur, 0)} tone={t.balance > 0 ? 'warn' : 'ok'} /></div>
      <Card pad={false} title="Faturalarım"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className={th}>Fatura</th><th className={th}>Tarih</th><th className={th + ' text-right'}>Tutar</th><th className={th}>Durum</th></tr></thead>
        <tbody>{c.invoices.map(i => <tr key={i.no}><td className={td}>{i.no}</td><td className={td + ' num'}>{fmtDT(i.t)}</td><td className={td + ' num text-right'}>{fmtMoney(i.total, c.cur)}</td>
          <td className={td}><Badge tone={i.status === 'kesin' ? 'ok' : 'warn'}>{i.status === 'kesin' ? 'Kesin' : 'Taslak'}</Badge></td></tr>)}</tbody></table></div></Card>
      <Card pad={false} title="Ödemelerim">{c.payments.length === 0 ? <Empty>Kayıtlı ödeme yok.</Empty> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className={th}>Tarih</th><th className={th}>Referans</th><th className={th + ' text-right'}>Tutar</th></tr></thead>
        <tbody>{c.payments.map(p => <tr key={p.ref}><td className={td + ' num'}>{fmtDT(p.t)}</td><td className={td}>{p.ref}</td><td className={td + ' num text-right'}>{fmtMoney(p.amount, c.cur)}</td></tr>)}</tbody></table></div>}</Card>
      <p className="m-0 text-xs text-mute">Bu bölüm yalnızca okunur.</p>
    </div>
  )
}

const REASONS = ['Ürün hasarlı', 'Yanlış ürün', 'Beğenmedim', 'Geç geldi', 'Diğer']
const STEPS = ['Siparişi bul', 'Ürünleri seç', 'Neden', 'Özet']
const EUR_RATE = { EUR: 1, TRY: 48, USD: 1.08 }

export function ReturnForm() {
  const { allOrders, notify } = useStore()
  const eligible = useMemo(() => allOrders.filter(o => o.status === 'kargoda' || o.status === 'tamamlandi').slice(0, 25), [allOrders])
  const [step, setStep] = useState(0)
  const [no, setNo] = useState(''), [zip, setZip] = useState(''), [err, setErr] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [pick, setPick] = useState<Record<string, number>>({})
  const [reason, setReason] = useState(''), [note, setNote] = useState('')
  const [done, setDone] = useState<string | null>(null)

  const find = () => {
    const o = allOrders.find(x => x.no.toLowerCase() === no.trim().toLowerCase())
    if (!o) return setErr('Bu numarayla bir sipariş bulamadık.')
    if (!zip.trim() || zip.trim() !== o.cust.zip) return setErr('Posta kodu siparişle eşleşmiyor.')
    if (o.status !== 'kargoda' && o.status !== 'tamamlandi') return setErr('Bu sipariş henüz iade için uygun değil.')
    setErr(''); setOrder(o); setPick({}); setStep(1)
  }
  const chosen = order ? order.items.filter(i => (pick[i.pid] ?? 0) > 0) : []
  const amount = order ? chosen.reduce((a, i) => a + (i.price * pick[i.pid]) / EUR_RATE[order.cur], 0) : 0
  const days = order ? Math.floor((NOW - order.t) / 86_400_000) : 0
  const auto = days <= 14 && amount < 50
  const next = (to: number) => setStep(to)

  return (
    <div>
      <PageHead title="Müşteri iade formu (müşteri görünümü)" desc="Müşterinin bağlantıdan açıp kendi başına doldurduğu iade formu." />
      <Banner>Önizleme: müşterinin gördüğü sayfa</Banner>
      <div className="mx-auto max-w-xl space-y-4">
        <ol className="m-0 flex list-none items-center gap-1 p-0 text-xs" aria-label="Adımlar">
          {STEPS.map((s, i) => <li key={s} aria-current={i === step ? 'step' : undefined} className={`flex flex-1 items-center gap-1.5 rounded-md border px-2 py-1 ${i === step ? 'border-brand bg-brand-soft text-brand font-medium' : i < step ? 'border-line text-ok' : 'border-line text-mute'}`}>
            <span className="num">{i < step ? <Check size={12} /> : i + 1}</span><span className="truncate">{s}</span></li>)}
        </ol>
        <Card>
          {done ? (
            <div className="text-center"><Check className="mx-auto text-ok" size={28} />
              <h2 className="m-0 mt-1 text-base font-semibold">İade talebiniz alındı</h2>
              <p className="m-0 mt-1 text-sm">İade numaranız <b className="num">{done}</b> <Badge tone="violet">örnek</Badge></p>
              <p className="m-0 mt-2 text-xs text-mute">Bu bir tasarım önizlemesidir; hiçbir şey gönderilmedi.</p></div>
          ) : step === 0 ? (
            <div className="space-y-3">
              <label className="block text-sm">Sipariş numarası<input className={inp + ' mt-1 block w-full'} value={no} onChange={e => setNo(e.target.value)} placeholder="ör. WS-1234" /></label>
              <label className="block text-sm">Teslimat posta kodu<input className={inp + ' mt-1 block w-full'} value={zip} onChange={e => setZip(e.target.value)} /></label>
              <label className="block text-sm text-ink2">Örnek sipariş seç <Badge tone="violet">önizleme için</Badge>
                <select className={sel + ' mt-1 block w-full'} value="" onChange={e => { const o = allOrders.find(x => x.id === e.target.value); if (o) { setNo(o.no); setZip(o.cust.zip); setErr('') } }}>
                  <option value="">Seçin…</option>{eligible.map(o => <option key={o.id} value={o.id}>{o.no} · {fmtDT(o.t)}</option>)}</select></label>
              {err && <p role="alert" className="m-0 text-sm text-bad">{err}</p>}
              <Btn variant="primary" onClick={find} disabled={!no.trim()}>Siparişi bul</Btn>
            </div>
          ) : !order ? null : step === 1 ? (
            <div className="space-y-3">
              <div className="text-sm text-ink2">Sipariş <b className="num text-ink">{order.no}</b> · <span className="num">{fmtDT(order.t)}</span></div>
              {order.items.map(i => { const on = (pick[i.pid] ?? 0) > 0; return (
                <div key={i.pid} className="flex items-center justify-between gap-2 text-sm">
                  <label className="flex min-w-0 items-center gap-2"><input type="checkbox" checked={on} onChange={e => setPick(k => ({ ...k, [i.pid]: e.target.checked ? 1 : 0 }))} /><span className="truncate">{product(i.pid).name}</span></label>
                  <select className={sel} aria-label={`${product(i.pid).name} adedi`} disabled={!on} value={pick[i.pid] ?? 1} onChange={e => setPick(k => ({ ...k, [i.pid]: +e.target.value }))}>
                    {Array.from({ length: i.qty }, (_, n) => <option key={n} value={n + 1}>{n + 1} / {i.qty}</option>)}</select></div>) })}
              <Nav back={() => next(0)} fwd={() => next(2)} ok={chosen.length > 0} />
            </div>
          ) : step === 2 ? (
            <div className="space-y-3">
              <label className="block text-sm">Neden iade ediyorsunuz?<select className={sel + ' mt-1 block w-full'} value={reason} onChange={e => setReason(e.target.value)}><option value="">Seçin…</option>{REASONS.map(r => <option key={r}>{r}</option>)}</select></label>
              <label className="block text-sm">Not (isteğe bağlı)<textarea className="mt-1 block w-full rounded-md border border-line bg-card p-2 text-sm" rows={2} value={note} onChange={e => setNote(e.target.value)} /></label>
              <div className="rounded-md bg-bg p-2.5 text-sm">
                <div className="flex items-center gap-2"><Badge tone={auto ? 'ok' : 'warn'}>{auto ? 'Kendiliğinden onaylanır' : 'İncelemeye alınır'}</Badge><span className="text-ink2 num">{days} gün · {fmtMoney(amount)}</span></div>
                <p className="m-0 mt-1 text-xs text-mute">Kural: 14 gün içinde ve tutar 50 € altında ise kendiliğinden onayla, değilse incelemeye al.</p></div>
              <Nav back={() => next(1)} fwd={() => next(3)} ok={!!reason} />
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div><b>{order.no}</b> · {chosen.map(i => `${product(i.pid).name} × ${pick[i.pid]}`).join(', ')}</div>
              <div className="text-ink2">Neden: {reason}{note && ` · ${note}`}</div>
              <ol className="m-0 list-none space-y-1.5 p-0">{RET.map((r, i) => <li key={r.key} className="flex gap-2"><span className="num flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs text-brand">{i + 1}</span><span><b>{r.label}</b> <span className="text-mute">· {r.hint}</span></span></li>)}</ol>
              <p className="m-0 text-xs text-mute">Sonra: iade etiketi e-postayla gelir, ürün depoya ulaşınca kontrol edilir, ardından ödemeniz iade edilir. Bu bir tasarım önizlemesidir; hiçbir şey gönderilmez.</p>
              <div className="flex gap-2"><Btn onClick={() => next(2)}>Geri</Btn>
                <Btn variant="primary" onClick={() => { setDone('IAD-' + String(hash(order.no) % 90000 + 10000)); notify('İade talebi alındı (önizleme)') }}>İade talebini gönder</Btn></div>
            </div>)}
        </Card>
        <Card title="Panelde nasıl görünür" right={<a href="#/returns" className="text-sm text-brand">İadeler sayfasına git</a>}>
          <p className="m-0 text-sm text-ink2">Gönderilen talep personelin <b>İadeler</b> sayfasında aşama aşama izlenir ({RET.map(r => r.label).join(' → ')}). Kuralı geçen talepler kendiliğinden onaylanır, diğerleri sırada beklemeye alınır.</p>
          <p className="m-0 mt-1 text-xs text-mute">Açık iade: <span className="num">{fmtNum(allOrders.filter(o => o.ret && o.ret !== 'cozuldu').length)}</span></p>
        </Card>
      </div>
    </div>
  )
}

function Nav({ back, fwd, ok }: { back: () => void; fwd: () => void; ok: boolean }) {
  return <div className="flex gap-2"><Btn onClick={back}>Geri</Btn><Btn variant="primary" disabled={!ok} onClick={fwd}>Devam</Btn></div>
}
