import { useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Thumb } from '../Thumb'
import { COMPANIES, NOW, RET, VAT, ago, company, fmtDT, fmtMoney, fmtNum, product, whName, type Order } from '../data'
import { ROLES, useStore } from '../store'
import { Badge, Btn, Card, Chan, Empty, PageHead, Pager, Tabs, td, th } from '../ui'

export function Returns() {
  const { orders, advanceReturn, role } = useStore()
  const rets = orders.filter(o => o.ret)
  const can = ROLES[role].ops || ROLES[role].finance
  return (
    <>
      <PageHead title="İadeler" desc="İade, teslim ve para olmak üzere iki eksende ilerler. Her adım stok defterine ve faturaya bağlıdır; kayıt ilk aşamada unutulmaz."
        legacy={['returns (9 görünüm)', 'invoices&view=returns', 'otto_tab=returns', 'sipariş satırı “İade faturası”']} />
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        {RET.map(st => { const list = rets.filter(o => o.ret === st.key); return (
          <section key={st.key} className="bg-card border border-line rounded-2xl flex flex-col min-h-[200px]">
            <header className="px-3 pt-3 pb-2 border-b border-line">
              <div className="flex items-center justify-between"><h2 className="m-0 text-sm font-semibold">{st.label}</h2><Badge tone={st.key === 'cozuldu' ? 'ok' : 'neutral'}>{list.length}</Badge></div>
              <div className="text-xs text-mute">{st.hint}</div>
            </header>
            <ul className="m-0 p-2 list-none space-y-2">
              {list.slice(0, 5).map(o => (
                <li key={o.id} className="card-in lift rounded-xl border border-line bg-bg px-2.5 py-2">
                  <div className="flex gap-2.5">
                    <Thumb p={product(o.items[0].pid)} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2"><b className="font-medium num">{o.no}</b><span className="num">{fmtMoney(o.total, o.cur)}</span></div>
                      <div className="text-xs text-ink2 truncate">{product(o.items[0].pid).name}</div>
                      <div className="text-xs text-mute flex justify-between gap-2 mt-0.5"><Chan acc={o.acc} short /><span>{ago(o.t)}</span></div>
                    </div>
                  </div>
                  {st.key !== 'cozuldu' && can && (st.key === 'odeme' ? ROLES[role].finance : st.key === 'geldi' ? ROLES[role].ops : true) && <Btn className="mt-2 w-full !h-7 !text-xs" onClick={() => advanceReturn(o.id)}>İlerlet <ArrowRight size={12} /></Btn>}
                </li>
              ))}
              {list.length > 5 && <li className="text-xs text-mute text-center py-1">+{list.length - 5} kayıt daha</li>}
              {list.length === 0 && <li className="text-xs text-mute text-center py-6">Kayıt yok</li>}
            </ul>
          </section>
        ) })}
      </div>
    </>
  )
}

const SIZE = 20
export default function Finance() {
  const { orders } = useStore()
  const [tab, setTab] = useState<'inv' | 'vat'>('inv')
  const [page, setPage] = useState(1)
  const inv = useMemo(() => {
    const out: { no: string; o: Order; kind: 'Satış' | 'İade'; status: string }[] = []
    const list = orders.filter(o => o.invoice !== 'yok').sort((a, b) => a.t - b.t)
    list.forEach(o => {
      out.push({ no: o.invoice === 'kesin' ? o.invNo ?? 'Numara bekliyor' : 'Taslak', o, kind: 'Satış', status: o.invoice })
      // İade faturası, iptal ettiği satış faturasının numarasına bağlıdır.
      // Satış faturası yoksa iade faturası da yoktur. İade para iadesi beklerken taslak, çözülünce kesindir (kesinleştirmeyi finans yapar).
      if (o.status === 'iade' && o.invNo && (o.ret === 'odeme' || o.ret === 'cozuldu')) out.push({ no: o.ret === 'cozuldu' ? o.invNo.replace('RE-', 'RET-') : 'Taslak', o, kind: 'İade', status: o.ret === 'cozuldu' ? 'kesin' : 'taslak' })
    })
    return out.reverse()
  }, [orders])
  useEffect(() => setPage(1), [orders.length, tab])
  // Şirket × para birimi: farklı para birimleri asla toplanmaz.
  const vat = useMemo(() => COMPANIES.flatMap(c => {
    const rate = VAT[c.country]
    const list = orders.filter(o => o.company === c.id && o.invoice === 'kesin' && o.status !== 'iade' && o.status !== 'iptal' && o.t >= NOW - 30 * 86400_000)
    return (['EUR', 'TRY', 'USD'] as const).map(cur => {
      const l = list.filter(o => o.cur === cur), gross = l.reduce((a, o) => a + o.total, 0)
      return { c, rate, n: l.length, gross, net: gross / (1 + rate), cur }
    })
  }).filter(r => r.n > 0), [orders])

  return (
    <>
      <PageHead title="Faturalar ve KDV" desc="Fatura, siparişi kesen şirketin adıyla kesilir. KDV oranı şirketin ülkesinden gelir; tek bir sabit oran yoktur."
        legacy={['invoices', 'invoices?task=prepare', 'accounting', 'finance-documents']} />
      <Tabs value={tab} onChange={setTab} items={[{ key: 'inv', label: 'Belgeler', count: inv.length }, { key: 'vat', label: 'KDV özeti · 30 gün', count: vat.length }]} />
      {tab === 'inv' ? (
        <Card pad={false} className="mt-2">
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Belge no</th><th className={th}>Tür</th><th className={th}>Düzenleyen şirket</th><th className={th}>Sipariş</th><th className={th}>Tarih</th><th className={th + ' text-right'}>Net</th><th className={th + ' text-right'}>KDV</th><th className={th + ' text-right'}>Brüt</th><th className={th}>Durum</th></tr></thead>
              <tbody>{inv.slice((page - 1) * SIZE, page * SIZE).map((r, i) => { const c = company(r.o.company), rate = VAT[c.country], sign = r.kind === 'İade' ? -1 : 1, g = r.o.total * sign, net = g / (1 + rate); return (
                <tr key={r.no + r.o.id + i} className="hover:bg-bg">
                  <td className={td + ' num font-medium whitespace-nowrap'}>{r.no}</td>
                  <td className={td}>{r.kind === 'İade' ? <Badge tone="bad">İade faturası</Badge> : 'Satış faturası'}</td>
                  <td className={td + ' whitespace-nowrap'}>{c.name} <span className="text-mute">· {c.country}</span></td>
                  <td className={td + ' num'}>{r.o.no}</td>
                  <td className={td + ' num whitespace-nowrap'}>{fmtDT(r.o.t)}</td>
                  <td className={td + ' text-right num'}>{fmtMoney(net, r.o.cur)}</td>
                  <td className={td + ' text-right num text-ink2 whitespace-nowrap'}>{fmtMoney(g - net, r.o.cur)} <span className="text-mute">%{Math.round(rate * 100)}</span></td>
                  <td className={td + ' text-right num font-medium'}>{fmtMoney(g, r.o.cur)}</td>
                  <td className={td}><Badge tone={r.status === 'kesin' ? 'ok' : 'warn'}>{r.status === 'kesin' ? 'Kesinleştirildi' : 'Taslak'}</Badge></td>
                </tr>
              ) })}</tbody>
            </table>
            {inv.length === 0 && <Empty>Bu kapsamda belge yok.</Empty>}
          </div>
          <Pager page={page} size={SIZE} total={inv.length} onPage={setPage} />
        </Card>
      ) : (
        <Card pad={false} className="mt-2">
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Şirket</th><th className={th}>Ülke</th><th className={th}>Depo</th><th className={th + ' text-right'}>KDV oranı</th><th className={th + ' text-right'}>Fatura</th><th className={th + ' text-right'}>Net</th><th className={th + ' text-right'}>KDV</th><th className={th + ' text-right'}>Brüt</th></tr></thead>
              <tbody>{vat.map(r => (
                <tr key={r.c.id + r.cur} className="hover:bg-bg">
                  <td className={td + ' font-medium'}>{r.c.name} <span className="text-mute">· {r.cur}</span></td><td className={td}>{r.c.country}</td><td className={td}>{whName(r.c.wh)}</td>
                  <td className={td + ' text-right num'}>%{Math.round(r.rate * 100)}</td><td className={td + ' text-right num'}>{fmtNum(r.n)}</td>
                  <td className={td + ' text-right num'}>{fmtMoney(r.net, r.cur)}</td><td className={td + ' text-right num'}>{fmtMoney(r.gross - r.net, r.cur)}</td><td className={td + ' text-right num font-medium'}>{fmtMoney(r.gross, r.cur)}</td>
                </tr>
              ))}</tbody>
            </table>
            {vat.length === 0 && <Empty>Bu kapsamda kesinleşmiş fatura yok.</Empty>}
          </div>
          <p className="m-0 px-3 py-2 text-xs text-mute border-t border-line">Örnek oranlar: DE %19, NL %21, TR %20 (standart oran). İndirimli oranlar, OSS ve ters yük gerçek vergi motorunda ele alınacak; her şirketin rejimi sahibine sorulacak açık sorudur. Para birimleri toplanmaz.</p>
        </Card>
      )}
    </>
  )
}
