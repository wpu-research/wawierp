import { useEffect, useState } from 'react'
import { ArrowRight, Check, Download, Plus, RotateCw, Send, Truck } from 'lucide-react'
import { CHANNEL, COMPANIES, NOW, OSTATUS, WAREHOUSES, account, ago, canLabel, canShip, company, fmtDT, fmtMoney, fmtNum, mask, product, whName, type Cur, type WhId } from '../data'
import { CARRIERS, TFLOW, TK, b2bTotals, carrierOf, type TStatus, type TkStatus } from '../data2'
import { ROLES, useStore } from '../store'
import { Thumb } from '../Thumb'
import { Badge, Btn, Card, Chan, Drawer, Empty, PageHead, Stat, Tabs, sel, td, th, type Tone, rowProps } from '../ui'

const inp = 'h-8 rounded-md border border-line bg-card px-2 text-sm w-full'
const h3 = 'm-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide'

// ============ Kargo etiketleri ============
export function Labels() {
  const { orders, manual, createLabels, ship, addManual, notify, role, whId } = useStore()
  const can = ROLES[role].ops
  const [tab, setTab] = useState<'hata' | 'hazir' | 'manual' | 'carriers'>('hata')
  const failed = orders.filter(o => o.label === 'hata' && (o.status === 'yeni' || o.status === 'hazirlaniyor') && o.supply === 'fiziki')
  const ready = orders.filter(canShip)
  const [f, setF] = useState({ name: '', city: '', kg: '1', wh: (whId || 'de') as WhId })

  return (
    <>
      <PageHead title="Kargo etiketleri" desc="Etiket çoğunlukla sipariş listesinden oluşturulur. Burası oluşturulamayanların kuyruğu, kargoya verilmeyi bekleyenler, siparişsiz etiket ve taşıyıcı hesapları içindir."
        legacy={['shipping', 'shipping&manual=1', 'dhl-recreate', 'dhl-recreate-batch']} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Oluşturulamayan etiket" value={fmtNum(failed.length)} tone={failed.length ? 'bad' : 'ok'} hint="Otomatik tekrar 3 kez denendi" />
        <Stat label="Kargoya verilmeyi bekleyen" value={fmtNum(ready.length)} hint="Etiketi hazır, paket depoda" />
        <Stat label="Siparişsiz etiket" value={fmtNum(manual.length)} hint="Numune, değişim, evrak" />
        <Stat label="Bağlı taşıyıcı" value={CARRIERS.filter(c => c.state === 'bagli').length} hint={`${CARRIERS.filter(c => c.state === 'talep').length} kurulum talebi`} />
      </div>
      <Tabs value={tab} onChange={setTab} items={[
        { key: 'hata', label: 'Hata kuyruğu', count: failed.length, tone: 'bad' }, { key: 'hazir', label: 'Kargoya verilecek', count: ready.length },
        { key: 'manual', label: 'Siparişsiz etiket', count: manual.length }, { key: 'carriers', label: 'Taşıyıcılar', count: CARRIERS.length },
      ]} />

      {(tab === 'hata' || tab === 'hazir') && (() => { const rows = tab === 'hata' ? failed : ready; return (
        <Card pad={false} className="mt-2">
          <div className="p-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-mute">{tab === 'hata' ? 'Neden adres ya da taşıyıcı hatasıdır; düzeltilip yeniden denenir.' : 'Taşıyıcı teslim aldığında takip no kanala gönderilir.'}</span>
            {can && rows.length > 0 && (tab === 'hata'
              ? <Btn onClick={() => { const ids = rows.filter(canLabel).map(o => o.id); if (!ids.length) return notify('Yeniden denenebilecek sipariş yok (sorunu giderilmemiş siparişlere etiket verilmez)'); if (window.confirm(`${ids.length} sipariş için etiket yeniden denenecek${ids.length < rows.length ? ` (${rows.length - ids.length} sipariş sorunlu olduğu için atlanır)` : ''}. Devam edilsin mi?`)) createLabels(ids) }}><RotateCw size={14} />Tümünü yeniden dene ({rows.length})</Btn>
              : <span className="flex gap-2"><Btn onClick={() => notify(`${rows.length} etiket tek PDF olarak hazırlandı (örnek)`)}><Download size={14} />Toplu PDF</Btn><Btn variant="primary" onClick={() => { if (window.confirm(`Bu listedeki ${rows.length} siparişin tamamı kargoya verilecek ve takip numaraları kanallara gönderilecek. Devam edilsin mi?`)) ship(rows.map(o => o.id)) }}><Truck size={14} />Tümünü kargoya ver ({rows.length})</Btn></span>)}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Sipariş</th><th className={th}>Kanal · mağaza</th><th className={th}>Depo</th><th className={th}>Taşıyıcı</th><th className={th}>Alıcı</th><th className={th}>{tab === 'hata' ? 'Hata nedeni' : 'Bekleme'}</th><th className={th}></th></tr></thead>
              <tbody>{rows.slice(0, 40).map(o => (
                <tr key={o.id} className="hover:bg-bg">
                  <td className={td + ' whitespace-nowrap'}><div className="font-medium num">{o.no}</div><div className="text-xs text-mute num">{fmtDT(o.t)}</div></td>
                  <td className={td + ' whitespace-nowrap'}><Chan acc={o.acc} /></td>
                  <td className={td + ' whitespace-nowrap'}>{whName(o.wh)}</td>
                  <td className={td}>{carrierOf(o.wh)}</td>
                  <td className={td + ' whitespace-nowrap'}>{mask(o.cust.name)} <span className="text-mute">· {o.cust.zip} {o.cust.city}</span></td>
                  <td className={td}>{tab === 'hata' ? <Badge tone="bad">{o.issue ?? 'Taşıyıcı zaman aşımı'}</Badge> : <span className="text-ink2">{ago(o.t).replace(' önce', '')}</span>}</td>
                  <td className={td + ' text-right'}>{can && (tab === 'hata' ? <Btn onClick={() => createLabels([o.id])}><RotateCw size={14} />Yeniden oluştur</Btn> : <Btn onClick={() => ship([o.id])}><Truck size={14} />Kargoya ver</Btn>)}</td>
                </tr>
              ))}</tbody>
            </table>
            {rows.length === 0 && <Empty>{tab === 'hata' ? 'Oluşturulamayan etiket yok.' : 'Kargoya verilmeyi bekleyen paket yok.'}</Empty>}
            {rows.length > 40 && <p className="m-0 px-3 py-2 text-xs text-mute">İlk 40 kayıt gösteriliyor ({fmtNum(rows.length)} toplam).</p>}
          </div>
        </Card>
      ) })()}

      {tab === 'manual' && (
        <div className="grid lg:grid-cols-3 gap-3 mt-2">
          <Card title="Yeni siparişsiz etiket">
            <form className="space-y-2" onSubmit={e => { e.preventDefault(); if (!f.name.trim() || !f.city.trim()) return; addManual({ name: f.name.trim(), city: f.city.trim(), kg: Number(f.kg) || 1, wh: f.wh, carrier: carrierOf(f.wh) }); setF({ ...f, name: '', city: '' }) }}>
              <label className="block text-xs text-mute">Açıklama / alıcı<input className={inp + ' mt-0.5'} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="ör. Numune gönderimi" required disabled={!can} /></label>
              <label className="block text-xs text-mute">Şehir<input className={inp + ' mt-0.5'} value={f.city} onChange={e => setF({ ...f, city: e.target.value })} required disabled={!can} /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs text-mute">Çıkış deposu<select className={sel + ' w-full mt-0.5'} value={f.wh} onChange={e => setF({ ...f, wh: e.target.value as WhId })} disabled={!can}>{WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
                <label className="block text-xs text-mute">Ağırlık (kg)<input className={inp + ' mt-0.5'} type="number" min="0.1" step="0.1" value={f.kg} onChange={e => setF({ ...f, kg: e.target.value })} disabled={!can} /></label>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1"><span className="text-xs text-mute">Taşıyıcı: {carrierOf(f.wh)}</span><Btn variant="primary" type="submit" disabled={!can}><Plus size={14} />Etiket oluştur</Btn></div>
            </form>
          </Card>
          <Card pad={false} title="Oluşturulanlar" className="lg:col-span-2">
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full border-collapse text-sm">
                <thead><tr><th className={th}>Zaman</th><th className={th}>Açıklama</th><th className={th}>Şehir</th><th className={th}>Depo</th><th className={th}>Taşıyıcı</th><th className={th + ' text-right'}>Ağırlık</th></tr></thead>
                <tbody>{manual.map(m => <tr key={m.id}><td className={td + ' num whitespace-nowrap'}>{fmtDT(m.t)}</td><td className={td}>{m.name}</td><td className={td}>{m.city}</td><td className={td}>{whName(m.wh)}</td><td className={td}>{m.carrier}</td><td className={td + ' text-right num'}>{m.kg.toLocaleString('tr-TR')} kg</td></tr>)}</tbody>
              </table>
              {manual.length === 0 && <Empty>Henüz kayıt yok.</Empty>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'carriers' && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-2">
          {CARRIERS.map(c => (
            <section key={c.name} className="bg-card border border-line rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-2"><b className="font-semibold">{c.name}</b><Badge tone={c.state === 'bagli' ? 'ok' : c.state === 'varsayim' ? 'warn' : 'neutral'}>{c.state === 'bagli' ? 'Bağlı' : c.state === 'varsayim' ? 'Varsayım' : 'Kurulum talebi'}</Badge></div>
              <div className="text-xs text-mute mt-0.5">{c.scope}</div>
              <p className="m-0 mt-1.5 text-[13px] text-ink2">{c.note}</p>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

// ============ Depo transferi ============
const TT: Record<TStatus, Tone> = { taslak: 'neutral', hazir: 'info', cikti: 'violet', yolda: 'violet', ulasti: 'warn', kabul: 'ok', iptal: 'neutral' }
const tLabel = (s: TStatus) => (s === 'iptal' ? 'İptal edildi' : TFLOW.find(f => f.key === s)!.label)

export function Transfers() {
  const { transfers, advanceTransfer, role } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = transfers.find(t => t.id === openId) ?? null
  const qty = (st: TStatus[]) => transfers.filter(t => st.includes(t.status)).reduce((a, t) => a + t.lines.reduce((b, l) => b + l.qty, 0), 0)
  const step = open ? TFLOW.findIndex(f => f.key === open.status) : -1
  const next = open && step >= 0 ? TFLOW[step].next : undefined
  return (
    <>
      <PageHead title="Depo transferi" desc="Depolar arası sevkiyat. Çıkış ve mal kabul stok defterine iki ayrı hareket olarak yazılır; aradaki adet “yoldaki stok” olarak görünür."
        legacy={['shipments', 'stock-transfer', 'pull_branch_stock']} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Yoldaki stok" value={fmtNum(qty(['cikti', 'yolda']))} hint="Çıktı, henüz kabul edilmedi" />
        <Stat label="Mal kabul bekleyen" value={fmtNum(transfers.filter(t => t.status === 'ulasti').length)} tone={transfers.some(t => t.status === 'ulasti') ? 'warn' : undefined} hint="Hedef depoda sayılacak" />
        <Stat label="Sevke hazır" value={fmtNum(transfers.filter(t => t.status === 'hazir').length)} hint="Stok henüz düşmedi" />
        <Stat label="Taslak" value={fmtNum(transfers.filter(t => t.status === 'taslak').length)} />
      </div>
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Transfer</th><th className={th}>Güzergâh</th><th className={th}>Taşıma</th><th className={th + ' text-right'}>Kalem</th><th className={th + ' text-right'}>Adet</th><th className={th}>Tahmini varış</th><th className={th}>Durum</th></tr></thead>
            <tbody>{transfers.map(t => { const late = t.eta < NOW && !['kabul', 'iptal', 'ulasti'].includes(t.status); return (
              <tr key={t.id} className="hover:bg-bg cursor-pointer" {...rowProps(() => setOpenId(t.id))}>
                <td className={td + ' whitespace-nowrap'}><div className="font-medium num">{t.no}</div><div className="text-xs text-mute num">{fmtDT(t.created)}</div></td>
                <td className={td + ' whitespace-nowrap'}>{whName(t.from)} <ArrowRight size={13} className="inline text-mute" /> {whName(t.to)}</td>
                <td className={td + ' whitespace-nowrap'}>{t.mode}<span className="text-mute"> · {t.carrier}</span></td>
                <td className={td + ' text-right num'}>{t.lines.length}</td>
                <td className={td + ' text-right num'}>{fmtNum(t.lines.reduce((a, l) => a + l.qty, 0))}</td>
                <td className={`${td} num whitespace-nowrap ${late ? 'text-bad' : ''}`}>{fmtDT(t.eta)}{late && ' · gecikti'}</td>
                <td className={td}><Badge tone={TT[t.status]}>{tLabel(t.status)}</Badge></td>
              </tr>
            ) })}</tbody>
          </table>
          {transfers.length === 0 && <Empty>Bu depo için transfer yok.</Empty>}
        </div>
      </Card>

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open && <span className="num">{open.no}</span>} sub={open && `${whName(open.from)} → ${whName(open.to)} · ${open.mode} · ${open.carrier}`}
        footer={open && next && ROLES[role].ops && <Btn variant="primary" onClick={() => advanceTransfer(open.id)}>{next}<ArrowRight size={14} /></Btn>}>
        {open && <>
          {open.status === 'iptal' ? <Badge>İptal edildi{open.note ? ` · ${open.note}` : ''}</Badge> : (
            <div><ol className="m-0 p-0 list-none flex">
              {TFLOW.map((s, i) => (
                <li key={s.key} className="flex-1 text-center">
                  <div className="flex items-center">
                    <span className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : i <= step ? 'bg-ok' : 'bg-line'}`} />
                    <span className={`size-5 rounded-full grid place-items-center text-[11px] ${i <= step ? 'bg-ok text-white' : 'bg-bg border border-line text-mute'}`}>{i <= step ? <Check size={12} /> : i + 1}</span>
                    <span className={`h-0.5 flex-1 ${i === TFLOW.length - 1 ? 'opacity-0' : i < step ? 'bg-ok' : 'bg-line'}`} />
                  </div>
                  <div className={`text-[11px] mt-1 leading-tight ${i <= step ? 'text-ink' : 'text-mute'}`}>{s.label}</div>
                </li>
              ))}
            </ol></div>
          )}
          <div>
            <h3 className={h3}>Kalemler</h3>
            <div className="overflow-x-auto border border-line rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead><tr><th className={th}>Ürün</th><th className={th + ' text-right'}>Planlanan</th><th className={th + ' text-right'}>Kabul edilen</th><th className={th + ' text-right'}>Fark</th></tr></thead>
                <tbody>{open.lines.map(l => { const p = product(l.pid), d = l.received === undefined ? null : l.received - l.qty; return (
                  <tr key={l.pid}><td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} /><div className="min-w-0"><div className="truncate max-w-[210px]">{p.name}</div><div className="text-xs text-mute num">{p.sku}</div></div></div></td>
                    <td className={td + ' text-right num'}>{fmtNum(l.qty)}</td><td className={td + ' text-right num'}>{l.received === undefined ? '—' : fmtNum(l.received)}</td>
                    <td className={`${td} text-right num ${d ? 'text-bad font-medium' : 'text-mute'}`}>{d === null ? '—' : d}</td></tr>
                ) })}</tbody>
              </table>
            </div>
            <p className="m-0 mt-1.5 text-xs text-mute">Stok “Depodan çıkar” adımında kaynak depodan düşer, “Mal kabulü tamamla” adımında hedef depoya girer. Fark varsa ayrı düzeltme hareketi olarak kalır.</p>
          </div>
          <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {([['Oluşturma', fmtDT(open.created)], ['Tahmini varış', fmtDT(open.eta)], ['Takip no', open.tracking ?? '—'], ['Şirketler arası belge', open.doc ?? '—'], ['Not', open.note ?? '—']] as const)
              .map(([k, v]) => <div key={k}><dt className="text-xs text-mute">{k}</dt><dd className="m-0 num break-all">{v}</dd></div>)}
          </dl>
        </>}
      </Drawer>
    </>
  )
}

// ============ Destek ============
const KT: Record<TkStatus, Tone> = { open: 'bad', waiting: 'warn', closed: 'neutral' }
export function Support() {
  const { tickets, allOrders, replyTicket, closeTicket, readTicket, role } = useStore()
  const [view, setView] = useState<TkStatus | 'all'>('open')
  const [selId, setSelId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const rows = tickets.filter(t => view === 'all' || t.status === view).sort((a, b) => b.t - a.t)
  const cur = tickets.find(t => t.id === selId) ?? rows[0] ?? null
  useEffect(() => { if (cur) readTicket(cur.id); setText('') }, [cur?.id])
  const o = cur ? allOrders.find(x => x.id === cur.orderId) : undefined
  const can = role !== 'depo'
  return (
    <>
      <PageHead title="Destek" desc="Bütün pazaryeri ve mağaza mesajları tek gelen kutusunda. Her satırda durum rozeti vardır; konuşma siparişe bağlıdır."
        legacy={['tickets', 'tr-market&tab=questions', 'metro&view=messages']} />
      <Tabs value={view} onChange={v => { setView(v); setSelId(null) }} items={[
        { key: 'open', label: TK.open, count: tickets.filter(t => t.status === 'open').length, tone: 'bad' },
        { key: 'waiting', label: TK.waiting, count: tickets.filter(t => t.status === 'waiting').length },
        { key: 'closed', label: TK.closed, count: tickets.filter(t => t.status === 'closed').length },
        { key: 'all', label: 'Tümü', count: tickets.length },
      ]} />
      <div className="grid lg:grid-cols-[minmax(280px,380px)_1fr] gap-3 mt-2 items-start">
        <Card pad={false}>
          <ul className="m-0 p-0 list-none divide-y divide-line max-h-[640px] overflow-y-auto">
            {rows.map(t => (
              <li key={t.id}>
                <button onClick={() => setSelId(t.id)} className={`w-full text-left border-0 px-3 py-2.5 block ${cur?.id === t.id ? 'bg-brand-soft' : 'bg-transparent hover:bg-bg'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate ${t.unread ? 'font-semibold' : 'font-medium'}`}>{t.unread && <span className="inline-block size-2 rounded-full bg-brand mr-1.5 align-middle" aria-label="Okunmamış" />}{t.subject}</span>
                    <span className="text-xs text-mute whitespace-nowrap">{ago(t.t)}</span>
                  </div>
                  <div className="text-xs text-ink2 truncate mt-0.5">{t.msgs[t.msgs.length - 1].text}</div>
                  <div className="flex items-center justify-between gap-2 mt-1 text-xs"><Chan acc={t.acc} /><Badge tone={KT[t.status]}>{TK[t.status]}</Badge></div>
                </button>
              </li>
            ))}
          </ul>
          {rows.length === 0 && <Empty>Bu görünümde konuşma yok.</Empty>}
        </Card>

        {cur ? (
          <Card pad={false}>
            <header className="px-4 py-3 border-b border-line flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="m-0 text-base font-semibold">{cur.subject}</h2>
                <div className="text-xs text-mute mt-0.5">{CHANNEL[account(cur.acc).type].label} · {account(cur.acc).name}{o && <> · sipariş <a href="#/orders?view=all" className="text-brand num">{o.no}</a> · {mask(o.cust.name)}</>}</div>
              </div>
              <div className="flex items-center gap-2"><Badge tone={KT[cur.status]}>{TK[cur.status]}</Badge>{can && cur.status !== 'closed' && <Btn onClick={() => closeTicket(cur.id)}><Check size={14} />Kapat</Btn>}</div>
            </header>
            <div className="px-4 py-4 space-y-3">
              {cur.msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'biz' ? 'justify-end' : ''}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 ${m.from === 'biz' ? 'bg-brand-soft' : 'bg-bg border border-line'}`}>
                    <div className="text-[11px] text-mute mb-0.5">{m.from === 'biz' ? m.user : 'Müşteri'} · {fmtDT(m.t)}</div>
                    <div>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
            {o && <div className="mx-4 mb-3 rounded-lg bg-bg px-3 py-2 text-xs text-ink2 flex flex-wrap gap-x-4 gap-y-1"><span>Sipariş durumu: <b className="font-medium text-ink">{OSTATUS[o.status]}</b></span><span>Etiket: {o.label === 'hazir' ? 'hazır' : o.label === 'hata' ? 'oluşturulamadı' : 'yok'}</span><span>Takip: {o.tracking ? `${o.tracking.carrier} ${o.tracking.no}` : 'yok'}</span><span>Tutar: {fmtMoney(o.total, o.cur)}</span></div>}
            {cur.status !== 'closed' && (
              <form className="px-4 py-3 border-t border-line flex gap-2 items-end" onSubmit={e => { e.preventDefault(); if (text.trim()) { replyTicket(cur.id, text.trim()); setText('') } }}>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={2} disabled={!can} aria-label="Yanıt" placeholder={can ? 'Yanıtınız kanal üzerinden müşteriye gider' : 'Bu rol yanıt yazamaz'} className="flex-1 rounded-md border border-line bg-card px-2 py-1.5 text-sm resize-y" />
                <Btn variant="primary" type="submit" disabled={!can || !text.trim()}><Send size={14} />Gönder</Btn>
              </form>
            )}
          </Card>
        ) : <Card><Empty>Konuşma seçin.</Empty></Card>}
      </div>
    </>
  )
}

// ============ Cari ve B2B ============
export function B2BPage() {
  const { b2b, addPayment, finalizeB2B, role } = useStore()
  const can = ROLES[role].finance
  const [tab, setTab] = useState<'cari' | 'taslak'>('cari')
  const [openId, setOpenId] = useState<string | null>(null)
  const [amt, setAmt] = useState(''); const [ref, setRef] = useState('')
  const open = b2b.find(c => c.id === openId) ?? null
  const byCur = new Map<Cur, number>()
  for (const c of b2b) byCur.set(c.cur, (byCur.get(c.cur) ?? 0) + b2bTotals(c).balance)
  const drafts = b2b.flatMap(c => c.invoices.filter(i => i.status === 'taslak').map(i => ({ c, i })))
  const compName = (id: string) => COMPANIES.find(x => x.id === id)?.name ?? id

  return (
    <>
      <PageHead title="Cari ve B2B portal" desc="Toptan müşteriler, faturaları, tahsilatları ve portal kullanıcıları. Bakiye para birimi başına ayrı tutulur; para birimleri toplanmaz."
        legacy={['customers-master', 'customers-master (toptan satış)', 'bank-import']} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[...byCur].map(([cur, v]) => <Stat key={cur} label={`Açık bakiye · ${cur}`} value={fmtMoney(v, cur, 0)} tone={v > 0 ? 'warn' : 'ok'} hint="Fatura − tahsilat" />)}
        <Stat label="Toptan satış taslağı" value={drafts.length} hint="Faturaya çevrilmeyi bekliyor" />
      </div>
      <Tabs value={tab} onChange={setTab} items={[{ key: 'cari', label: 'Cariler', count: b2b.length }, { key: 'taslak', label: 'Toptan satış taslakları', count: drafts.length }]} />
      {tab === 'cari' ? (
        <Card pad={false} className="mt-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Cari</th><th className={th}>Satıcı şirket</th><th className={th + ' text-right'}>Lokasyon</th><th className={th + ' text-right'}>Portal kullanıcısı</th><th className={th + ' text-right'}>Faturalanan</th><th className={th + ' text-right'}>Tahsil edilen</th><th className={th + ' text-right'}>Bakiye</th></tr></thead>
              <tbody>{b2b.map(c => { const t = b2bTotals(c); return (
                <tr key={c.id} className="hover:bg-bg cursor-pointer" {...rowProps(() => { setOpenId(c.id); setAmt(''); setRef('') })}>
                  <td className={td}><div className="font-medium">{c.name}</div><div className="text-xs text-mute num">{c.code} · {c.country}</div></td>
                  <td className={td + ' whitespace-nowrap'}>{compName(c.company)}</td>
                  <td className={td + ' text-right num'}>{c.locations.length}</td><td className={td + ' text-right num'}>{c.users.length}</td>
                  <td className={td + ' text-right num'}>{fmtMoney(t.billed, c.cur)}</td><td className={td + ' text-right num'}>{fmtMoney(t.paid, c.cur)}</td>
                  <td className={`${td} text-right num font-medium ${t.balance > 0 ? 'text-warn' : 'text-ok'}`}>{fmtMoney(t.balance, c.cur)}</td>
                </tr>
              ) })}</tbody>
            </table>
            {b2b.length === 0 && <Empty>Bu şirkete bağlı cari yok.</Empty>}
          </div>
          <p className="m-0 px-3 py-2 text-xs text-mute border-t border-line">8 örnek cari (gerçek panelde 48). Adlar uydurmadır.</p>
        </Card>
      ) : (
        <Card pad={false} className="mt-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Taslak</th><th className={th}>Cari</th><th className={th}>Satıcı şirket</th><th className={th}>Oluşturma</th><th className={th + ' text-right'}>Tutar</th><th className={th}></th></tr></thead>
              <tbody>{drafts.map(({ c, i }) => (
                <tr key={c.id + i.no} className="hover:bg-bg">
                  <td className={td + ' num font-medium'}>{i.no}</td><td className={td}>{c.name}</td><td className={td}>{compName(c.company)}</td>
                  <td className={td + ' num whitespace-nowrap'}>{fmtDT(i.t)}</td><td className={td + ' text-right num'}>{fmtMoney(i.total, c.cur)}</td>
                  <td className={td + ' text-right'}>{can && <Btn onClick={() => { if (window.confirm(`${i.no} taslağı kesin faturaya çevrilecek. Kesin fatura geri alınamaz; iptali iade faturasıyla olur. Devam edilsin mi?`)) finalizeB2B(c.id, i.no) }}><Check size={14} />Faturaya çevir</Btn>}</td>
                </tr>
              ))}</tbody>
            </table>
            {drafts.length === 0 && <Empty>Bekleyen taslak yok.</Empty>}
          </div>
        </Card>
      )}

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.name} sub={open && `${open.code} · ${open.legal} · satıcı: ${compName(open.company)}`}>
        {open && (() => { const t = b2bTotals(open); return <>
          <div className="grid grid-cols-3 gap-2">
            {([['Faturalanan', t.billed, ''], ['Tahsil edilen', t.paid, ''], ['Bakiye', t.balance, t.balance > 0 ? 'text-warn' : 'text-ok']] as const).map(([k, v, cls]) => (
              <div key={k} className="rounded-lg bg-bg px-3 py-2"><div className="text-xs text-mute">{k}</div><div className={`num font-semibold ${cls}`}>{fmtMoney(v, open.cur)}</div></div>
            ))}
          </div>
          <div>
            <h3 className={h3}>Belgeler</h3>
            <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
              {open.invoices.map(i => <li key={i.no} className="px-3 py-2 flex items-center justify-between gap-2"><span><span className="num font-medium">{i.no}</span><span className="text-xs text-mute num"> · {fmtDT(i.t)}</span></span><span className="flex items-center gap-2"><span className="num">{fmtMoney(i.total, open.cur)}</span><Badge tone={i.status === 'kesin' ? 'ok' : 'warn'}>{i.status === 'kesin' ? 'Kesin' : 'Taslak'}</Badge></span></li>)}
            </ul>
          </div>
          <div>
            <h3 className={h3}>Tahsilatlar</h3>
            {open.payments.length === 0 ? <p className="m-0 text-mute">Henüz tahsilat yok.</p> : (
              <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
                {open.payments.map((p, i) => <li key={i} className="px-3 py-2 flex items-center justify-between gap-2"><span>{p.ref}<span className="text-xs text-mute num"> · {fmtDT(p.t)}</span></span><span className="num text-ok">+{fmtMoney(p.amount, open.cur)}</span></li>)}
              </ul>
            )}
            {can && (
              <form className="mt-2 flex flex-wrap gap-2 items-end" onSubmit={e => { e.preventDefault(); const v = Number(amt.replace(',', '.')); if (v > 0) { addPayment(open.id, v, ref.trim() || 'Elle tahsilat'); setAmt(''); setRef('') } }}>
                <label className="text-xs text-mute flex-1 min-w-[110px]">Tutar ({open.cur})<input className={inp + ' mt-0.5'} inputMode="decimal" value={amt} onChange={e => setAmt(e.target.value)} required /></label>
                <label className="text-xs text-mute flex-[2] min-w-[140px]">Referans<input className={inp + ' mt-0.5'} value={ref} onChange={e => setRef(e.target.value)} placeholder="ör. SEPA 14.11" /></label>
                <Btn variant="primary" type="submit"><Plus size={14} />Tahsilat ekle</Btn>
              </form>
            )}
          </div>
          <div>
            <h3 className={h3}>Lokasyonlar</h3>
            <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
              {open.locations.map(l => <li key={l.code} className="px-3 py-2 flex justify-between gap-2"><span>{l.name}<span className="text-mute"> · {l.city}</span></span><span className="text-xs text-mute">stok deposu: {whName(l.wh)}</span></li>)}
            </ul>
          </div>
          <div>
            <h3 className={h3}>Portal kullanıcıları</h3>
            <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
              {open.users.map(u => <li key={u.email} className="px-3 py-2 flex items-center justify-between gap-2"><span className="min-w-0"><span>{u.name}</span><span className="block text-xs text-mute truncate">{u.email}</span></span><Badge tone={u.canAdjust ? 'info' : 'neutral'}>{u.canAdjust ? 'Stok düzeltebilir' : 'Yalnız görüntüler'}</Badge></li>)}
            </ul>
            <p className="m-0 mt-1.5 text-xs text-mute">Portal kullanıcısı yalnız kendi lokasyon stoğunu, faturalarını ve bakiyesini görür.</p>
          </div>
        </> })()}
      </Drawer>
    </>
  )
}
