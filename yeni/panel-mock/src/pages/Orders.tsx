import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Check, Eye, FileText, Lock, Search, Tag, Truck, X } from 'lucide-react'
import { CHANNEL, NOW, OSTATUS, SUPPLY, account, ago, canInvoice, canLabel, canShip, company, dropWaiting, fmtDT, fmtMoney, hasIssue, isOpen, mask, overdue, product, toShip, whName, type ChannelType, type OStatus, type Order } from '../data'
import { ROLES, useStore } from '../store'
import { Thumb, ThumbStack } from '../Thumb'
import { Badge, Btn, Card, Chan, Drawer, Empty, PageHead, Pager, Tabs, sel, td, th, type Tone, rowProps } from '../ui'

type View = 'all' | 'toship' | 'overdue' | 'drop' | 'issue' | 'shipped' | 'closed'
const VIEWS: { key: View; label: string; f: (o: Order) => boolean; tone?: Tone }[] = [
  { key: 'all', label: 'Tümü', f: () => true },
  { key: 'toship', label: 'Gönderilecek', f: toShip },
  { key: 'overdue', label: '2 günü aşan', f: overdue, tone: 'bad' },
  { key: 'drop', label: 'Drop bekleyen', f: dropWaiting },
  { key: 'issue', label: 'Sorunlu', f: hasIssue, tone: 'bad' },
  { key: 'shipped', label: 'Kargoda', f: o => o.status === 'kargoda' },
  { key: 'closed', label: 'İptal / iade', f: o => o.status === 'iptal' || o.status === 'iade' },
]
const STONE: Record<OStatus, Tone> = { yeni: 'info', hazirlaniyor: 'warn', kargoda: 'violet', tamamlandi: 'ok', iptal: 'neutral', iade: 'bad' }
const SIZE = 25

const LBL = { yok: 'yok', hazir: 'hazır', hata: 'hatalı' } as const
const INV = { yok: 'yok', taslak: 'taslak', kesin: 'kesin' } as const
export default function Orders({ query }: { query: URLSearchParams }) {
  const { orders, role, notify, createLabels, ship, issueInvoices, views, saveView, removeView } = useStore()
  const [naming, setNaming] = useState<string | null>(null)
  const R = ROLES[role]
  const [view, setView] = useState<View>('toship')
  const [q, setQ] = useState('')
  const [chan, setChan] = useState<ChannelType | ''>('')
  const [page, setPage] = useState(1)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => { const v = query.get('view') as View | null; if (v && VIEWS.some(x => x.key === v)) setView(v) }, [query])
  useEffect(() => { setPage(1); setPicked(new Set()) }, [view, q, chan, orders.length])

  const counts = useMemo(() => Object.fromEntries(VIEWS.map(v => [v.key, orders.filter(v.f).length])) as Record<View, number>, [orders])
  const rows = useMemo(() => {
    const f = VIEWS.find(v => v.key === view)!.f, s = q.trim().toLowerCase()
    return orders.filter(o => f(o) && (!chan || account(o.acc).type === chan) && (!s || o.no.toLowerCase().includes(s) || o.items.some(i => product(i.pid).name.toLowerCase().includes(s) || product(i.pid).sku.toLowerCase().includes(s))))
  }, [orders, view, q, chan])
  const pageRows = rows.slice((page - 1) * SIZE, page * SIZE)
  const sel_ = [...picked]
  const invoicable = (ids: string[]) => orders.filter(o => ids.includes(o.id) && canInvoice(o)).map(o => o.id)
  const selOrders = orders.filter(o => picked.has(o.id))
  const open = openId ? orders.find(o => o.id === openId) ?? null : null
  const toggle = (id: string) => setPicked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allOn = pageRows.length > 0 && pageRows.every(o => picked.has(o.id))

  return (
    <>
      <PageHead title="Siparişler" desc="Bütün kanalların siparişleri tek listede. Kanal, şirket ve depo birer süzgeçtir; kanal başına ayrı sayfa yoktur."
        legacy={['orders-pool', 'orders-ebay', 'orders-kaufland', 'warehouse-orders', 'company-home&view=orders', 'metro&view=orders', 'tr-market&tab=orders', 'otto_tab=orders', 'amazon_tab=orders', '/allordersfilter', 'problem-orders', 'asterbuy-orders']} />
      <Tabs items={VIEWS.map(v => ({ key: v.key, label: v.label, count: counts[v.key], tone: v.tone }))} value={view} onChange={setView} />
      {/* Kayıtlı görünümler: o anki sekme, kanal ve arama birlikte saklanır (bu tarayıcıda). */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-mute inline-flex items-center gap-1"><Bookmark size={13} />Görünümlerim</span>
        {views.map(v => (
          <span key={v.id} className="inline-flex items-center rounded-full border border-line bg-card">
            <button onClick={() => { if (VIEWS.some(x => x.key === v.view)) setView(v.view as View); setChan(v.chan as ChannelType | ''); setQ(v.q) }} className="border-0 bg-transparent pl-2.5 pr-1 h-6 text-ink hover:text-brand">{v.name}</button>
            <button onClick={() => removeView(v.id)} aria-label={`${v.name} görünümünü sil`} className="border-0 bg-transparent pr-1.5 h-6 text-mute hover:text-bad"><X size={12} /></button>
          </span>))}
        {naming === null ? <button onClick={() => setNaming('')} className="rounded-full border border-dashed border-line bg-transparent px-2.5 h-6 text-ink2 hover:border-brand">+ Bu görünümü kaydet</button> : (
          <form className="inline-flex items-center gap-1" onSubmit={e => { e.preventDefault(); const n = naming.trim(); if (n) saveView({ name: n.slice(0, 30), view, chan, q }); setNaming(null) }}>
            <input autoFocus value={naming} onChange={e => setNaming(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setNaming(null) }} placeholder="Görünüm adı" aria-label="Görünüm adı" className="h-6 w-36 rounded-md border border-line bg-card px-2 text-xs" />
            <button type="submit" className="rounded-md border border-brand bg-brand text-white px-2 h-6">Kaydet</button>
          </form>)}
        {views.length === 0 && naming === null && <span className="text-mute">Sık kullandığınız süzgeci adıyla saklayın.</span>}
      </div>
      <Card pad={false} className="mt-2">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-line">
          <label className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={15} className="absolute left-2.5 top-2 text-mute" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Sipariş no, ürün adı ya da SKU" aria-label="Siparişlerde ara" className="w-full h-8 rounded-md border border-line bg-card pl-8 pr-2 text-sm" />
          </label>
          <select className={sel} value={chan} onChange={e => setChan(e.target.value as ChannelType | '')} aria-label="Kanal türü">
            <option value="">Tüm kanallar</option>
            {(Object.keys(CHANNEL) as ChannelType[]).map(c => <option key={c} value={c}>{CHANNEL[c].label}</option>)}
          </select>
          {picked.size > 0 && R.ops && (
            <span className="flex flex-wrap items-center gap-2 ml-auto">
              <span className="text-xs text-ink2 num">{picked.size} seçili</span>
              <Btn onClick={() => { const ids = selOrders.filter(canLabel).map(o => o.id); if (ids.length > 1 && !window.confirm(`Seçili ${picked.size} siparişten ${ids.length} tanesi için kargo etiketi oluşturulacak (ödemesi gelmeyen, sorunlu ya da tedarikçiden gidecek siparişler atlanır). Devam edilsin mi?`)) return; createLabels(ids); setPicked(new Set()) }} disabled={!selOrders.some(canLabel)}><Tag size={14} />Etiket oluştur</Btn>
              <Btn variant="primary" onClick={() => { const ids = selOrders.filter(canShip).map(o => o.id); if (ids.length > 1 && !window.confirm(`Seçili ${picked.size} siparişten ${ids.length} tanesi kargoya verilecek ve takip numaraları kanallara gönderilecek. Devam edilsin mi?`)) return; ship(ids); setPicked(new Set()) }} disabled={!selOrders.some(canShip)}><Truck size={14} />Kargoya ver</Btn>
            </span>
          )}
          {picked.size > 0 && R.finance && <Btn className="ml-auto" onClick={() => { const ids = invoicable(sel_); if (!ids.length) return notify('Seçilenlerin hiçbiri kesinleştirilemez (zaten kesin, iptal ya da ödemesi bekleniyor)'); if (!window.confirm(`Seçili ${picked.size} siparişten ${ids.length} tanesinin faturası kesinleşecek; ${picked.size - ids.length ? `${picked.size - ids.length} tanesi atlanacak (zaten kesin, iptal ya da ödemesi bekleniyor). ` : ''}Kesin fatura geri alınamaz; iptali iade faturasıyla olur. Devam edilsin mi?`)) return; issueInvoices(ids); setPicked(new Set()) }}><FileText size={14} />Fatura kes ({picked.size})</Btn>}
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr>
              <th className={th + ' w-8'}><input type="checkbox" aria-label="Sayfadakileri seç" checked={allOn} onChange={() => setPicked(s => { const n = new Set(s); pageRows.forEach(o => (allOn ? n.delete(o.id) : n.add(o.id))); return n })} /></th>
              <th className={th}>Sipariş</th><th className={th}>Kanal · mağaza</th><th className={th}>Şirket · depo</th><th className={th}>Müşteri</th>
              <th className={th + ' text-right'}>Tutar</th><th className={th}>Tedarik</th><th className={th}>Durum</th><th className={th}>Belgeler</th>
            </tr></thead>
            <tbody>
              {pageRows.map(o => (
                <tr key={o.id} className="hover:bg-bg cursor-pointer" {...rowProps(() => setOpenId(o.id))}>
                  <td className={td} onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`${o.no} seç`} checked={picked.has(o.id)} onChange={() => toggle(o.id)} /></td>
                  <td className={td + ' whitespace-nowrap'}><div className="flex items-center gap-2.5"><ThumbStack items={o.items.map(i => product(i.pid))} /><div><div className="font-medium num">{o.no}</div><div className="text-xs text-mute num">{fmtDT(o.t)}</div></div></div></td>
                  <td className={td + ' whitespace-nowrap'}><Chan acc={o.acc} /></td>
                  <td className={td + ' whitespace-nowrap'}><div>{company(o.company).name}</div><div className="text-xs text-mute">{whName(o.wh)}</div></td>
                  <td className={td + ' whitespace-nowrap'}><div>{mask(o.cust.name)}</div><div className="text-xs text-mute">{o.cust.city}, {o.cust.country}</div></td>
                  <td className={td + ' text-right num'}>{fmtMoney(o.total, o.cur)}</td>
                  <td className={td}>{o.supply === 'fiziki' ? <span className="text-ink2">Fiziki</span> : <Badge tone="violet">{SUPPLY[o.supply]}</Badge>}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={STONE[o.status]}>{OSTATUS[o.status]}</Badge>
                      {o.pay === 'bekliyor' && <Badge tone="warn">Ödeme bekliyor</Badge>}
                      {overdue(o) && <Badge tone="bad">{ago(o.t).replace(' önce', '')}</Badge>}
                      {hasIssue(o) && <Badge tone="bad" title={o.issue ?? 'Etiket oluşturulamadı'}>Sorun</Badge>}
                    </div>
                  </td>
                  <td className={td}>
                    <span className="inline-flex gap-1.5 text-mute">
                      <span title={`Etiket: ${LBL[o.label]}`}><Tag size={15} className={o.label === 'hazir' ? 'text-ok' : o.label === 'hata' ? 'text-bad' : ''} aria-hidden /><span className="sr-only">Etiket {LBL[o.label]}</span></span>
                      <span title={`Fatura: ${INV[o.invoice]}`}><FileText size={15} className={o.invoice === 'kesin' ? 'text-ok' : o.invoice === 'taslak' ? 'text-warn' : ''} aria-hidden /><span className="sr-only">Fatura {INV[o.invoice]}</span></span>
                      <span title={o.tracking ? `${o.tracking.carrier} ${o.tracking.no}` : 'Takip yok'}><Truck size={15} className={o.tracking ? 'text-ok' : ''} aria-hidden /><span className="sr-only">{o.tracking ? `Takip ${o.tracking.carrier}` : 'Takip yok'}</span></span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty>Bu görünümde sipariş yok. Süzgeçleri temizleyin ya da başka bir görünüm seçin.</Empty>}
        </div>
        <Pager page={page} size={SIZE} total={rows.length} onPage={setPage} />
      </Card>
      <OrderDrawer o={open} onClose={() => setOpenId(null)} />
    </>
  )
}

const STEPS = ['Alındı', 'Ödendi', 'Etiket hazır', 'Kargoda', 'Teslim edildi']
function stepOf(o: Order) {
  if (o.status === 'tamamlandi' || o.status === 'iade') return 4
  if (o.status === 'kargoda') return 3
  if (o.label === 'hazir') return 2
  return o.pay === 'odendi' ? 1 : 0
}

function OrderDrawer({ o, onClose }: { o: Order | null; onClose: () => void }) {
  const { role, revealed, reveal, createLabels, ship, issueInvoices, resolveIssue } = useStore()
  if (!o) return null
  const R = ROLES[role], shown = revealed.has(role + '|' + o.id), step = stepOf(o), a = account(o.acc)
  const cancelled = o.status === 'iptal'
  return (
    <Drawer open title={<span className="num">{o.no}</span>} sub={<>{CHANNEL[a.type].label} · {a.name} · {fmtDT(o.t)} ({ago(o.t, NOW)})</>} onClose={onClose}
      footer={<>
        {R.ops && canLabel(o) && <Btn onClick={() => createLabels([o.id])}><Tag size={14} />Etiket oluştur</Btn>}
        {R.ops && canShip(o) && <Btn variant="primary" onClick={() => ship([o.id])}><Truck size={14} />Kargoya ver</Btn>}
        {R.finance && canInvoice(o) && <Btn onClick={() => { if (window.confirm(`${o.no} faturası kesinleşecek. Kesin fatura geri alınamaz; iptali iade faturasıyla olur. Devam edilsin mi?`)) issueInvoices([o.id]) }}><FileText size={14} />Fatura kes</Btn>}
        {!R.ops && !R.finance && <span className="text-xs text-mute">Bu rol siparişi yalnız görüntüler.</span>}
      </>}>
      {hasIssue(o) && <div className="rounded-lg bg-bad-soft text-bad px-3 py-2 text-sm"><b>Sorun:</b> {o.issue ?? 'Etiket oluşturulamadı'}. {o.issue ? 'Sorun giderilmeden etiket oluşturulmaz ve sipariş kargoya verilmez.' : 'Etiket yeniden oluşturulunca kapanır.'}{R.ops && o.issue && <Btn className="ml-2" onClick={() => resolveIssue(o.id)}>Sorunu giderdim</Btn>}</div>}
      {cancelled ? <Badge tone="neutral">Sipariş iptal edildi</Badge> : (
        <div><ol className="m-0 p-0 list-none flex">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1 text-center">
              <div className="flex items-center">
                <span className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : i <= step ? 'bg-ok' : 'bg-line'}`} />
                <span className={`size-5 rounded-full grid place-items-center text-[11px] ${i <= step ? 'bg-ok text-white' : 'bg-bg border border-line text-mute'}`}>{i <= step ? <Check size={12} /> : i + 1}</span>
                <span className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? 'opacity-0' : i < step ? 'bg-ok' : 'bg-line'}`} />
              </div>
              <div className={`text-[11px] mt-1 ${i <= step ? 'text-ink' : 'text-mute'}`}>{s}</div>
            </li>
          ))}
        </ol></div>
      )}

      <div>
        <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide">Kalemler</h3>
        <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
          {o.items.map((it, i) => { const p = product(it.pid); return (
            <li key={i} className="px-3 py-2 flex items-center justify-between gap-3">
              <Thumb p={p} size={40} />
              <div className="min-w-0 flex-1"><div className="truncate">{p.name}</div><div className="text-xs text-mute num">{p.sku} · raf {p.stock[o.wh]?.bin ?? '—'}</div></div>
              <div className="text-right num whitespace-nowrap">{it.qty} × {fmtMoney(it.price, o.cur)}</div>
            </li>
          ) })}
          <li className="px-3 py-2 flex justify-between font-medium"><span>Toplam (KDV dahil)</span><span className="num">{fmtMoney(o.total, o.cur)}</span></li>
        </ul>
      </div>

      <div>
        <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide flex items-center gap-1.5"><Lock size={12} />Müşteri · kişisel veri</h3>
        <div className="border border-line rounded-lg px-3 py-2.5 space-y-1">
          {shown ? <>
            <div className="font-medium">{o.cust.name}</div>
            <div className="text-ink2">{o.cust.street}, {o.cust.zip} {o.cust.city}, {o.cust.country}</div>
            {R.pii === 'tam' ? <div className="text-ink2 num">{o.cust.email} · {o.cust.phone}</div> : <div className="text-xs text-mute">E-posta ve telefon bu role gönderilmez.</div>}
            <div className="text-xs text-mute pt-1">Görüntüleme denetim kaydına yazıldı.</div>
          </> : <>
            <div className="font-medium">{mask(o.cust.name)}</div>
            <div className="text-ink2">•••, {o.cust.zip} {o.cust.city}, {o.cust.country}</div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-mute">Ayrıntı sunucudan yalnız istenince ve yetkiyle gelir.</span>
              <Btn onClick={() => reveal(o)}><Eye size={14} />{R.pii === 'tam' ? 'Göster' : 'Adresi göster'}</Btn>
            </div>
          </>}
        </div>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {([
          ['Şirket', company(o.company).name], ['Depo', whName(o.wh)], ['Tedarik', SUPPLY[o.supply]],
          ['Ödeme', o.pay === 'odendi' ? 'Ödendi' : o.pay === 'bekliyor' ? 'Bekliyor' : 'İade edildi'],
          ['Fatura', o.invoice === 'kesin' ? 'Kesinleştirildi' : o.invoice === 'taslak' ? 'Taslak' : 'Yok'],
          ['Takip', o.tracking ? `${o.tracking.carrier} ${o.tracking.no}` : '—'],
        ] as const).map(([k, v]) => <div key={k}><dt className="text-xs text-mute">{k}</dt><dd className="m-0 num break-all">{v}</dd></div>)}
      </dl>
    </Drawer>
  )
}
