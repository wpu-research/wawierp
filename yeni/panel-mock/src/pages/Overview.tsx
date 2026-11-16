import { useMemo } from 'react'
import { AlertTriangle, ArrowRight, ListChecks, MessagesSquare, Sparkles, Tag } from 'lucide-react'
import { CHANNEL, NOW, WAREHOUSES, account, dayKey, dropWaiting, fmtMoney, fmtNum, hasIssue, isRevenue, overdue, stockState, toShip, ago, type ChannelType } from '../data'
import { ROLES, useStore } from '../store'
import { askAssistant, useChat } from '../Chat'
import { Badge, Bars, Card, HBars, PageHead, Stat } from '../ui'

export default function Overview() {
  const { orders, products, accounts, jobs, whId, role } = useStore()
  const chat = useChat()
  const hour = new Date(NOW).getHours()
  const m = useMemo(() => {
    const today = dayKey(NOW)
    const days = new Map<string, number>()
    for (let i = 30; i >= 0; i--) days.set(dayKey(NOW - i * 86400_000), 0)
    const chan = new Map<ChannelType, number>()
    let todayN = 0, todayEur = 0, eur30 = 0, other = 0
    for (const o of orders) {
      const k = dayKey(o.t)
      if (days.has(k)) days.set(k, days.get(k)! + 1)
      const rev = isRevenue(o) && o.t >= NOW - 30 * 86400_000 // ciro: iptal/iade hariç, son 30 gün
      if (rev) { if (o.cur === 'EUR') { eur30 += o.total; const t = account(o.acc).type; chan.set(t, (chan.get(t) ?? 0) + o.total) } else other++ }
      if (k === today) { todayN++; if (isRevenue(o) && o.cur === 'EUR') todayEur += o.total }
    }
    return {
      todayN, todayEur, eur30, other,
      days: [...days].map(([d, v]) => ({ label: d.slice(8) + '.' + d.slice(5, 7), value: v, mark: d === today })),
      chan: [...chan].sort((a, b) => b[1] - a[1]).map(([t, v]) => ({ label: CHANNEL[t].label, value: v, color: CHANNEL[t].color })),
      toShip: orders.filter(toShip).length, overdue: orders.filter(overdue).length,
      drop: orders.filter(dropWaiting).length, issue: orders.filter(hasIssue).length,
    }
  }, [orders])
  const neg = products.filter(p => Object.entries(p.stock).some(([w, s]) => (!whId || w === whId) && stockState(s!.fiziki) === 'negatif')).length
  const badAcc = accounts.filter(a => a.health !== 'ok')
  const badJobs = jobs.filter(j => j.status === 'basarisiz' && j.acc === null)

  return (
    <>
      <PageHead title="Genel bakış" desc="Bütün sayılar aşağıdaki listelerle aynı kaynaktan hesaplanır; bir kutuya tıklayınca açılan liste aynı sayıyı gösterir."
        legacy={['overview', 'order-summary', 'overview-orders']} />
      <div className="hero-band relative overflow-hidden rounded-2xl bg-navy text-white px-5 py-4 mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="relative min-w-0 flex-1 basis-72">
          <div className="flex items-center gap-2 text-xs text-white/60"><span className="relative flex size-2"><span className="pulse absolute inset-0 rounded-full bg-[#4fbf4f]" /><span className="relative size-2 rounded-full bg-[#4fbf4f]" /></span>Canlı · {new Date(NOW).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div className="font-display text-[22px] font-semibold leading-tight mt-1">{hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'}, {ROLES[role].user}</div>
          <p className="m-0 mt-1 text-[14px] text-white/75">Bugün <b className="text-white num">{fmtNum(m.todayN)}</b> sipariş geldi; <b className="text-white num">{fmtNum(m.toShip)}</b> sipariş gönderilmeyi bekliyor{m.overdue ? <>, <b className="text-gold num">{fmtNum(m.overdue)}</b> tanesi 2 günü aştı</> : ''}.</p>
        </div>
        <div className="relative flex flex-wrap gap-2">
          {ROLES[role].ops && <a href="#/picking" className="hero-btn"><ListChecks size={15} />Toplamaya başla</a>}
          {ROLES[role].ops && <a href="#/labels" className="hero-btn"><Tag size={15} />Etiketler</a>}
          <a href="#/messages" className="hero-btn"><MessagesSquare size={15} />Mesajlar{chat.totalUnread > 0 && <span className="num rounded-full bg-gold text-navy text-[11px] font-bold px-1.5">{chat.totalUnread}</span>}</a>
          <button onClick={() => askAssistant('Bugünün durumunu özetle ve önce neyi yapmam gerektiğini söyle.')} className="hero-btn hero-btn-gold"><Sparkles size={15} />Asistana sor</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Stat label="Bugün gelen sipariş" value={fmtNum(m.todayN)} hint={fmtMoney(m.todayEur, 'EUR', 0)} href="#/orders?view=all" />
        <Stat label="Gönderilecek" value={fmtNum(m.toShip)} hint="Ödemesi tamam, açık" href="#/orders?view=toship" />
        <Stat label="2 günü aşan fiziki" value={fmtNum(m.overdue)} tone={m.overdue ? 'bad' : 'ok'} hint="Sevk süresi geçti" href="#/orders?view=overdue" />
        <Stat label="Drop bekleyen" value={fmtNum(m.drop)} hint="Tedarikçide" href="#/orders?view=drop" />
        <Stat label="Sorunlu sipariş" value={fmtNum(m.issue)} tone={m.issue ? 'warn' : 'ok'} hint="Adres, stok, etiket" href="#/orders?view=issue" />
        <Stat label="Negatif stoklu ürün" value={fmtNum(neg)} tone={neg ? 'bad' : 'ok'} hint="Sayım gerekiyor" href="#/catalog?view=negatif" />
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-4">
        <Card className="lg:col-span-2" title="Günlük sipariş · son 30 gün (ciro iptal ve iade hariç)" right={<span className="text-xs text-mute num">{fmtNum(orders.length)} sipariş · {fmtMoney(m.eur30, 'EUR', 0)}{m.other ? ` · ${m.other} sipariş TRY/USD ayrı` : ''}</span>}>
          <Bars data={m.days} height={150} />
        </Card>
        <Card title="Kanala göre ciro · 30 gün (EUR)">
          {m.chan.length ? <HBars data={m.chan} fmt={v => fmtMoney(v, 'EUR', 0)} /> : <p className="text-mute m-0">Bu kapsamda EUR sipariş yok.</p>}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2" title="Dikkat gerektiren bağlantılar" right={<a href="#/sync" className="text-xs text-brand no-underline inline-flex items-center gap-1">Eşitleme işleri <ArrowRight size={12} /></a>}>
          {badAcc.length + badJobs.length === 0 ? <p className="m-0 text-ok">Bu kapsamdaki bütün kanallar güncel.</p> : (
            <ul className="m-0 p-0 list-none divide-y divide-line">
              {badAcc.map(a => (
                <li key={a.id} className="py-2 flex items-start gap-2.5">
                  <AlertTriangle size={16} className={a.health === 'partial' ? 'text-warn mt-0.5 shrink-0' : 'text-bad mt-0.5 shrink-0'} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{CHANNEL[a.type].label} · {a.name}</div>
                    <div className="text-ink2 text-[13px]">{a.note}</div>
                  </div>
                  <Badge tone={a.health === 'partial' ? 'warn' : 'bad'}>{a.health === 'partial' ? 'Kısmi' : a.health === 'stale' ? 'Bayat' : 'Başarısız'} · {ago(a.lastSync)}</Badge>
                </li>
              ))}
              {badJobs.map(j => (
                <li key={j.id} className="py-2 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-bad mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1"><div className="font-medium">{j.kind}</div><div className="text-ink2 text-[13px]">{j.msg}</div></div>
                  <Badge tone="bad">Başarısız · {ago(j.last)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Depolar" right={<span className="text-xs text-mute">gerçek panel ölçeği</span>}>
          <ul className="m-0 p-0 list-none space-y-2">
            {WAREHOUSES.filter(w => !whId || w.id === whId).map(w => (
              <li key={w.id} className="rounded-lg bg-bg px-3 py-2">
                <div className="flex justify-between gap-2"><b className="font-medium">{w.name}</b><span className="text-xs text-mute">{w.code}</span></div>
                <div className="text-xs text-ink2 num">{fmtNum(w.products)} ürün · {fmtNum(w.physical)} fiziki{w.drop ? ` · ${fmtNum(w.drop)} drop` : ''}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
