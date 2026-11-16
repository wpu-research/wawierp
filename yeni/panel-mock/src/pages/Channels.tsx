import { useMemo, useState } from 'react'
import { RefreshCw, RotateCw } from 'lucide-react'
import { CHANNEL, JOB, LISTING_FLOW, PRODUCTS, account, ago, company, fmtDT, fmtMoney, fmtNum, revenueOrders, whName, type Health, type JobStatus, type ListingStatus } from '../data'
import { ROLES, useStore } from '../store'
import { Badge, Btn, Card, Drawer, Empty, PageHead, Tabs, td, th, type Tone, rowProps } from '../ui'
import { listingBadge } from './Catalog'

const HT: Record<Health, [Tone, string]> = { ok: ['ok', 'Güncel'], partial: ['warn', 'Kısmi'], failed: ['bad', 'Başarısız'], stale: ['bad', 'Bayat'] }
const FLOW_COLOR: Record<ListingStatus, string> = { havuzda: 'var(--mute)', hazirlaniyor: 'var(--warn)', onizleme: 'var(--brand)', gonderildi: 'var(--violet)', aktif: 'var(--ok)', sorunlu: 'var(--bad)', kaldirildi: 'var(--line)' }

export default function Channels() {
  const { accounts, orders, jobs, syncNow, role } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const stats = useMemo(() => {
    const m = new Map<string, { n: number; sum: number; l: Record<ListingStatus, number> }>()
    const blank = () => ({ n: 0, sum: 0, l: Object.fromEntries(LISTING_FLOW.map(f => [f.key, 0])) as Record<ListingStatus, number> })
    for (const a of accounts) m.set(a.id, blank())
    for (const o of revenueOrders(orders)) { const s = m.get(o.acc); if (s) { s.n++; s.sum += o.total } }
    for (const p of PRODUCTS) for (const l of p.listings) { const s = m.get(l.acc); if (s) s.l[l.status]++ }
    return m
  }, [accounts, orders])
  const flow = LISTING_FLOW.map(f => ({ ...f, n: [...stats.values()].reduce((a, s) => a + s.l[f.key], 0) }))
  const flowTotal = flow.reduce((a, f) => a + f.n, 0) || 1
  const open = openId ? account(openId) : null
  const openListings = open ? PRODUCTS.flatMap(p => p.listings.filter(l => l.acc === open.id).map(l => ({ p, l }))) : []

  return (
    <>
      <PageHead title="Kanallar" desc="Her pazaryeri ve mağaza aynı bağdaştırıcı arayüzünü kullanır: aynı ilan akışı, aynı sipariş çekme, aynı sağlık göstergesi. Yeni kanal yeni sayfa değil, yeni eklentidir."
        legacy={['send-ebay', 'ebay-pool', 'send-kaufland', 'metro', 'shopify-pool', 'send-shopify', 'ozon-pool', 'send-ozon', 'tr-market', 'tr-market-products', 'company-home (OTTO, Amazon sekmeleri)', 'channel-worklist', 'mixoutlet-payments']} />
      <Card title="İlan akışı · bütün kanallar" className="mb-4" right={<span className="text-xs text-mute num">{fmtNum(flowTotal)} ilan (örnek)</span>}>
        <div className="flex h-3 rounded overflow-hidden bg-bg">{flow.map(f => f.n > 0 && <span key={f.key} title={`${f.label}: ${f.n}`} style={{ width: `${(f.n / flowTotal) * 100}%`, background: FLOW_COLOR[f.key] }} />)}</div>
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
          {flow.map((f, i) => (
            <div key={f.key} className="rounded-lg bg-bg px-2.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-ink2"><span className="size-2 rounded-full shrink-0" style={{ background: FLOW_COLOR[f.key] }} /><span className="truncate">{i < 5 ? `${i + 1}. ` : ''}{f.label}</span></div>
              <div className="num text-lg font-semibold">{f.n}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card pad={false} title={`Hesaplar (${accounts.length})`}>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Kanal · hesap</th><th className={th}>Şirket · depo</th><th className={th + ' text-right'}>Sipariş 30 g</th><th className={th + ' text-right'}>Ciro 30 g</th><th className={th + ' text-right'}>Aktif ilan</th><th className={th + ' text-right'}>Sorunlu</th><th className={th}>Eşitleme</th></tr></thead>
            <tbody>{accounts.map(a => { const s = stats.get(a.id)!, [tone, label] = HT[a.health]; return (
              <tr key={a.id} className="hover:bg-bg cursor-pointer" {...rowProps(() => setOpenId(a.id))}>
                <td className={td}><span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: CHANNEL[a.type].color }} /><b className="font-medium">{CHANNEL[a.type].label}</b><span className="text-ink2">{a.name}</span></span></td>
                <td className={td}>{company(a.company).name}<span className="text-mute"> · {whName(a.wh)}</span></td>
                <td className={td + ' text-right num'}>{fmtNum(s.n)}</td>
                <td className={td + ' text-right num'}>{fmtMoney(s.sum, a.cur, 0)}</td>
                <td className={td + ' text-right num'}>{s.l.aktif}</td>
                <td className={`${td} text-right num ${s.l.sorunlu ? 'text-bad font-medium' : 'text-mute'}`}>{s.l.sorunlu}</td>
                <td className={td}><Badge tone={tone} title={a.note}>{label} · {ago(a.lastSync)}</Badge></td>
              </tr>
            ) })}</tbody>
          </table>
          {accounts.length === 0 && <Empty>Bu kapsamda kanal hesabı yok.</Empty>}
        </div>
      </Card>

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open && `${CHANNEL[open.type].label} · ${open.name}`} sub={open && `${company(open.company).name} · ${whName(open.wh)} · ${open.cur}`}
        footer={open && ROLES[role].ops && <Btn variant="primary" onClick={() => syncNow(open.id)}><RefreshCw size={14} />Şimdi eşitle</Btn>}>
        {open && <>
          {open.note && <div className={`rounded-lg px-3 py-2 text-sm ${open.health === 'partial' ? 'bg-warn-soft text-warn' : 'bg-bad-soft text-bad'}`}>{open.note}. Son başarılı okuma: {fmtDT(open.lastSync)}.</div>}
          <div>
            <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide">Arka plan işleri</h3>
            <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
              {jobs.filter(j => j.acc === open.id).map(j => <li key={j.id} className="px-3 py-2 flex items-center justify-between gap-2"><span>{j.kind}<span className="text-xs text-mute"> · {ago(j.last)}</span></span><JobBadge s={j.status} /></li>)}
            </ul>
          </div>
          <div>
            <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide">İlanlar ({openListings.length})</h3>
            {openListings.length === 0 ? <p className="m-0 text-mute">Örnek katalogda bu hesaba bağlı ilan yok.</p> : (
              <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
                {openListings.map(({ p, l }) => <li key={p.id} className="px-3 py-2 flex items-center justify-between gap-2"><div className="min-w-0"><div className="truncate">{p.name}</div><div className="text-xs text-mute num">{p.sku} · {fmtMoney(l.price, open.cur)}</div></div><span className="shrink-0">{listingBadge(l.status, l.reason)}</span></li>)}
              </ul>
            )}
          </div>
        </>}
      </Drawer>
    </>
  )
}

const JT: Record<JobStatus, Tone> = { tamamlandi: 'ok', calisiyor: 'info', sirada: 'neutral', basarisiz: 'bad', kismi: 'warn' }
const JobBadge = ({ s }: { s: JobStatus }) => <Badge tone={JT[s]}>{JOB[s]}</Badge>

export function Sync() {
  const { jobs, accounts, retryJob, role } = useStore()
  const [view, setView] = useState<'sorun' | 'aktif' | 'all'>('sorun')
  const ids = new Set(accounts.map(a => a.id))
  const scoped = jobs.filter(j => j.acc === null || ids.has(j.acc))
  const F = { sorun: (s: JobStatus) => s === 'basarisiz' || s === 'kismi', aktif: (s: JobStatus) => s === 'calisiyor' || s === 'sirada', all: () => true }
  const rows = scoped.filter(j => F[view](j.status))
  return (
    <>
      <PageHead title="Eşitleme işleri" desc="Kanal eşitlemeleri kuyrukta çalışır. Her işin durumu, deneme sayısı ve bir sonraki çalışma zamanı burada görünür; takılan iş sessizce kaybolmaz."
        legacy={['(eski panelde karşılığı yok: durum yalnız “tamamlanamadı” uyarısıyla görünüyordu)']} />
      <Tabs value={view} onChange={setView} items={[
        { key: 'sorun', label: 'Sorunlu', count: scoped.filter(j => F.sorun(j.status)).length, tone: 'bad' },
        { key: 'aktif', label: 'Sırada / çalışıyor', count: scoped.filter(j => F.aktif(j.status)).length },
        { key: 'all', label: 'Tümü', count: scoped.length },
      ]} />
      <Card pad={false} className="mt-2">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>İş</th><th className={th}>Kanal · hesap</th><th className={th}>Durum</th><th className={th + ' text-right'}>Deneme</th><th className={th}>Son çalışma</th><th className={th}>Sonraki</th><th className={th}></th></tr></thead>
            <tbody>{rows.map(j => { const a = j.acc ? account(j.acc) : null; return (
              <tr key={j.id} className="hover:bg-bg">
                <td className={td}><div className="font-medium">{j.kind}</div>{j.msg && <div className="text-xs text-ink2 max-w-[360px]">{j.msg}</div>}</td>
                <td className={td + ' whitespace-nowrap'}>{a ? `${CHANNEL[a.type].label} · ${a.name}` : <span className="text-mute">Sistem</span>}</td>
                <td className={td}><JobBadge s={j.status} /></td>
                <td className={td + ' text-right num'}>{j.tries}</td>
                <td className={td + ' num whitespace-nowrap'}>{fmtDT(j.last)}</td>
                <td className={td + ' num whitespace-nowrap'}>{j.next ? fmtDT(j.next) : <span className="text-bad">Durdu</span>}</td>
                <td className={td + ' text-right'}>{(j.status === 'basarisiz' || j.status === 'kismi') && ROLES[role].ops && <Btn onClick={() => retryJob(j.id)}><RotateCw size={14} />Yeniden dene</Btn>}</td>
              </tr>
            ) })}</tbody>
          </table>
          {rows.length === 0 && <Empty>Bu görünümde iş yok.</Empty>}
        </div>
      </Card>
    </>
  )
}
