import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Upload } from 'lucide-react'
import { CHANNEL, COMPANIES, NOW, VAT, WAREHOUSES, account, company, fmtMoney, fmtNum, type ChannelType, type Cur, type Order } from '../data'
import { ROLES, useStore } from '../store'
import { Badge, Btn, Card, Drawer, Empty, HBars, PageHead, Stat, sel, td, th } from '../ui'

const D = 864e5
const pct = (v: number) => (v * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + '%'
const dShort = (t: number) => new Date(t).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })

function Gate({ children }: { children: ReactNode }) {
  const { role } = useStore()
  if (!ROLES[role].finance) return <Card><Empty>Bu rol finans verisini göremez.</Empty></Card>
  return <>{children}</>
}

/* ───────────── 1. Banka mutabakatı ───────────── */
interface Line { id: string; t: number; amount: number; cur: Cur; ref: string; kind: string; split?: Order[] }
interface Cand { o: Order; score: number; why: string[] }
type Decision = 'matched' | 'ignored'

function buildLines(pending: Order[]): Line[] {
  const out: Line[] = []
  let p = 0
  const next = () => pending[p++]
  const push = (o: Order | undefined, kind: string, f: (o: Order) => Omit<Line, 'id' | 'kind' | 't'> & { dt?: number }) => {
    if (!o) return
    const { dt = 1, ...rest } = f(o)
    out.push({ id: 'BL-' + String(out.length + 1).padStart(2, '0'), kind, t: Math.min(NOW, o.t + dt * D), ...rest })
  }
  for (let i = 0; i < 5; i++) push(next(), 'tam+ref', o => ({ amount: o.total, cur: o.cur, ref: `Havale · referans: ${o.no}`, dt: 1 + (i % 3) }))
  for (let i = 0; i < 3; i++) push(next(), 'tam', o => ({ amount: o.total, cur: o.cur, ref: 'Havale · referans: (boş)', dt: 2 + i }))
  for (let i = 0; i < 2; i++) push(next(), 'fark', o => ({ amount: Math.round((o.total - (i ? 0.03 : 0.02)) * 100) / 100, cur: o.cur, ref: i ? 'Havale · referans: (boş)' : `Havale · referans: ${o.no.slice(-5)}`, dt: 3 }))
  const a = next(), b = pending.find((o, i) => i >= p - 1 + 0 && o !== a && o.cur === a?.cur)
  if (a && b) { p = pending.indexOf(b) + 1; out.push({ id: 'BL-' + String(out.length + 1).padStart(2, '0'), kind: 'iki', t: Math.min(NOW, Math.max(a.t, b.t) + D), amount: Math.round((a.total + b.total) * 100) / 100, cur: a.cur, ref: 'Havale · referans: toplu ödeme', split: [a, b] }) }
  out.push({ id: 'BL-' + String(out.length + 1).padStart(2, '0'), kind: 'yok', t: NOW - 2 * D, amount: 1234.56, cur: 'EUR', ref: 'Havale · referans: Rechnung 4711' })
  out.push({ id: 'BL-' + String(out.length + 1).padStart(2, '0'), kind: 'yok', t: NOW - 5 * D, amount: 87.4, cur: 'EUR', ref: 'Havale · referans: (boş)' })
  return out
}

function candidates(l: Line, pending: Order[]): Cand[] {
  if (l.split) return l.split.map(o => ({ o, score: 75, why: ['Toplam tutarın bir parçası', 'İki siparişin toplamı satır tutarına eşit'] }))
  return pending.filter(o => o.cur === l.cur).map(o => {
    const diff = Math.abs(l.amount - o.total), why: string[] = []
    let score = 0
    if (diff < 0.005) { score += 50; why.push('Tutar birebir aynı') } else if (diff <= 0.1) { score += 35; why.push(`Tutar ${fmtMoney(diff, l.cur)} farklı`) }
    if (score && l.ref.includes(o.no)) { score += 40; why.push('Referansta sipariş no var') } else if (score && l.ref.includes(o.no.slice(-5))) { score += 20; why.push('Referans sipariş no ile kısmen uyuşuyor') }
    const days = Math.abs(l.t - o.t) / D
    if (score && days <= 7) { score += 10; why.push(`Sipariş tarihine ${Math.round(days)} gün yakın`) }
    return { o, score, why }
  }).filter(c => c.score >= 35).sort((x, y) => y.score - x.score).slice(0, 3)
}

export function BankMatch() {
  const { orders, notify } = useStore()
  const pending = useMemo(() => orders.filter(o => o.pay === 'bekliyor').sort((x, y) => x.t - y.t), [orders])
  const lines = useMemo(() => buildLines(pending), [pending])
  const cands = useMemo(() => Object.fromEntries(lines.map(l => [l.id, candidates(l, pending)])), [lines, pending])
  const [dec, setDec] = useState<Record<string, Decision>>({})
  const [sid, setSid] = useState<string>('')
  const status = (l: Line): 'ok' | 'sug' | 'none' | 'ign' => {
    if (dec[l.id] === 'ignored') return 'ign'
    if (dec[l.id] === 'matched') return 'ok'
    const top = cands[l.id][0]?.score ?? 0
    return top >= 90 ? 'ok' : top > 0 ? 'sug' : 'none'
  }
  const conf = (l: Line) => cands[l.id][0]?.score ?? 0
  const sel0 = lines.find(l => l.id === sid) ?? lines[0]
  const n = (s: string) => lines.filter(l => status(l) === s).length
  const eur = lines.filter(l => l.cur === 'EUR' && status(l) !== 'ign').reduce((a, l) => a + l.amount, 0)
  const act = (l: Line, d: Decision, msg: string) => { setDec(s => ({ ...s, [l.id]: d })); notify(msg) }
  const badge = (l: Line) => { const s = status(l); return s === 'ok' ? <Badge tone="ok">Eşleşti</Badge> : s === 'sug' ? <Badge tone="warn">Öneri var</Badge> : s === 'ign' ? <Badge>Yoksayıldı</Badge> : <Badge tone="bad">Eşleşmedi</Badge> }

  return (
    <Gate>
      <PageHead title="Banka mutabakatı" desc="Bankaya gelen havaleler ödeme bekleyen siparişlerle eşleştirilir. Satırlar bu ekranda örnek olarak üretilir; tutar ve sipariş no gerçek siparişlerden gelir."
        actions={<Btn aria-label="Banka ekstresi yükle, örnek düğme" onClick={() => notify('Örnek düğme: gerçek sistemde burada banka ekstresi (CSV) okunur.')}><Upload size={14} /> Ekstre yükle (CSV)</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Otomatik eşleşen" value={n('ok')} hint="Tutar ve referans uyuyor" tone="ok" />
        <Stat label="Onay bekleyen öneri" value={n('sug')} hint="Kontrol edip onaylayın" tone="warn" />
        <Stat label="Eşleşmeyen" value={n('none')} hint="Elle bakılacak" tone={n('none') ? 'bad' : undefined} />
        <Stat label="Toplam tutar (EUR)" value={fmtMoney(eur, 'EUR', 0)} hint={`${lines.length} satır · yoksayılanlar hariç`} />
      </div>
      {lines.length === 0 ? <Card><Empty>Ödeme bekleyen sipariş yok, eşleştirilecek satır üretilemedi.</Empty></Card> : (
        <div className="grid xl:grid-cols-[1.4fr_1fr] gap-3 items-start">
          <Card pad={false}><div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Tarih</th><th className={th}>Referans</th><th className={th + ' text-right'}>Tutar</th><th className={th}>Durum</th><th className={th + ' text-right'}>Güven</th></tr></thead>
            <tbody>{lines.map(l => (
              <tr key={l.id} onClick={() => setSid(l.id)} className={`cursor-pointer hover:bg-bg ${sel0?.id === l.id ? 'bg-bg' : ''}`}>
                <td className={td + ' num whitespace-nowrap'}><button className="border-0 bg-transparent p-0 text-inherit cursor-pointer" onClick={() => setSid(l.id)} aria-label={`${l.id} satırını seç`}>{dShort(l.t)}</button></td>
                <td className={td}>{l.ref}</td><td className={td + ' num text-right whitespace-nowrap'}>{fmtMoney(l.amount, l.cur)}</td>
                <td className={td}>{badge(l)}</td><td className={td + ' num text-right'}>{conf(l) ? `%${Math.min(99, conf(l))}` : '—'}</td>
              </tr>))}</tbody></table></div></Card>
          {sel0 && <Card title={`Seçili satır · ${sel0.id}`} right={badge(sel0)}>
            <div className="text-sm space-y-0.5 mb-3"><div className="num">{fmtMoney(sel0.amount, sel0.cur)} · {dShort(sel0.t)}</div><div className="text-ink2">{sel0.ref}</div></div>
            {cands[sel0.id].length === 0 ? <p className="text-sm text-mute m-0">Aday sipariş bulunamadı. Tutar ve referans hiçbir bekleyen siparişle uyuşmuyor.</p> : (
              <ul className="m-0 p-0 list-none space-y-2">{cands[sel0.id].map(c => (
                <li key={c.o.id} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm">
                  <div className="flex justify-between gap-2"><b className="num font-medium">{c.o.no}</b><span className="num">{fmtMoney(c.o.total, c.o.cur)}</span></div>
                  <div className="text-xs text-mute">{CHANNEL[account(c.o.acc).type].label} · sipariş {dShort(c.o.t)}</div>
                  <ul className="m-0 mt-1 pl-4 text-xs text-ink2">{c.why.map(w => <li key={w}>{w}</li>)}</ul>
                </li>))}</ul>)}
            <div className="flex flex-wrap gap-2 mt-3">
              <Btn variant="primary" disabled={!cands[sel0.id].length || status(sel0) === 'ign'} onClick={() => act(sel0, 'matched', `${sel0.id} eşleştirildi (örnek).`)}>Eşleştir</Btn>
              {sel0.split && <Btn onClick={() => act(sel0, 'matched', `${sel0.id} iki siparişe bölündü (örnek).`)}>Böl</Btn>}
              <Btn variant="ghost" onClick={() => act(sel0, 'ignored', `${sel0.id} yoksayıldı.`)}>Yoksay</Btn>
            </div>
            <p className="text-xs text-mute mt-3 mb-0">Burada yalnızca ekranda işaretlenir. Gerçek sistemde Eşleştir, siparişin ödemesini “ödendi” yapar ve denetim kaydına yazar. Ödeme otomatik hiçbir yere gönderilmez.</p>
          </Card>}
        </div>)}
    </Gate>
  )
}

/* ───────────── 2. Muhasebe aktarımı ve e-fatura ───────────── */
type Period = '30' | 'ay' | 'gecen'
const monthStart = (back: number) => { const d = new Date(NOW); return new Date(d.getFullYear(), d.getMonth() - back, 1).getTime() }
const inPeriod = (t: number, p: Period) => p === '30' ? t >= NOW - 30 * D && t <= NOW : p === 'ay' ? t >= monthStart(0) && t <= NOW : t >= monthStart(1) && t < monthStart(0)
const EXPORTS = [
  { key: 'datev', title: 'Muhasebe dosyası (DATEV biçimi)', state: 'Hazırlanmadı · hesap planı eşlemesi sahibinin onayını bekliyor' },
  { key: 'csv', title: 'CSV', state: 'Hazırlanmadı · sütun düzeni serbest, istenirse değiştirilir' },
  { key: 'xr', title: 'Yapılandırılmış e-fatura (XRechnung / ZUGFeRD)', state: 'Hazırlanmadı · yalnız Almanya şirketleri için gerekir' },
]

export function Accounting() {
  const { orders, b2b, notify } = useStore()
  const [per, setPer] = useState<Period>('30')
  const [prep, setPrep] = useState<string>('')
  const [draft, setDraft] = useState<string>('')
  const inv = useMemo(() => orders.filter(o => o.invoice === 'kesin' && o.status !== 'iade' && o.status !== 'iptal' && inPeriod(o.t, per)), [orders, per])
  const rows = useMemo(() => COMPANIES.flatMap(c => (['EUR', 'TRY', 'USD'] as Cur[]).map(cur => {
    const l = inv.filter(o => o.company === c.id && o.cur === cur), gross = l.reduce((a, o) => a + o.total, 0), rate = VAT[c.country]
    return { c, cur, n: l.length, gross, net: gross / (1 + rate), rate }
  })).filter(r => r.n > 0), [inv])
  const lines = useMemo(() => [...inv].sort((a, b) => a.t - b.t).slice(0, 8).map(o => {
    const ct = company(o.company).country
    return { o, hesap: ct === 'DE' ? '8400' : ct === 'NL' ? '8000' : '600', karsi: ct === 'TR' ? '120' : '1400', kod: ct === 'TR' ? 'KDV %20' : `BU ${Math.round(VAT[ct] * 100)}` }
  }), [inv])
  const overdue = useMemo(() => b2b.flatMap(c => {
    let paid = c.payments.reduce((a, p) => a + p.amount, 0)
    return c.invoices.filter(i => i.status === 'kesin').sort((a, b) => a.t - b.t).flatMap(i => {
      const pay = Math.min(paid, i.total); paid -= pay
      const left = i.total - pay, due = i.t + 14 * D, days = Math.floor((NOW - due) / D)
      return left > 0.005 && days > 0 ? [{ c, i, left, days, lvl: days < 15 ? '1.' : days < 30 ? '2.' : 'Son' }] : []
    })
  }).sort((a, b) => b.days - a.days), [b2b])
  const dr = overdue.find(x => x.i.no === draft)
  const ptxt = (x: NonNullable<typeof dr>) => `Konu: Ödeme hatırlatması (${x.lvl} hatırlatma) · ${x.i.no}\n\nSayın yetkili,\n${x.i.no} numaralı faturanın ${fmtMoney(x.left, x.c.cur)} tutarındaki kalan bölümünün vadesi ${x.days} gün önce geçmiştir. Ödemeyi henüz yapmadıysanız en kısa sürede yapmanızı rica ederiz. Ödeme yaptıysanız bu mesajı dikkate almayın.\n\nTeşekkürler.\n\n— Almanca —\nBetreff: Zahlungserinnerung (${x.lvl} Mahnstufe) · ${x.i.no}\n\nSehr geehrte Damen und Herren,\nder offene Betrag von ${fmtMoney(x.left, x.c.cur)} zur Rechnung ${x.i.no} war vor ${x.days} Tagen fällig. Falls Sie bereits gezahlt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos. Andernfalls bitten wir um baldige Überweisung.\n\nVielen Dank und freundliche Grüße`

  return (
    <Gate>
      <PageHead title="Muhasebe aktarımı ve e-fatura" desc="Kesilen satış faturaları şirket ve para birimi bazında özetlenir. KDV oranı şirketin ülkesinden gelir. Dosya hazırlama bir önizlemedir, hiçbir şey gönderilmez." />
      <Card title="Dönem özeti" right={<select className={sel} value={per} onChange={e => { setPer(e.target.value as Period); setPrep('') }} aria-label="Dönem seç"><option value="30">Son 30 gün</option><option value="ay">Bu ay</option><option value="gecen">Geçen ay</option></select>} pad={false}>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
          <thead><tr><th className={th}>Şirket</th><th className={th}>Para birimi</th><th className={th + ' text-right'}>Fatura</th><th className={th + ' text-right'}>Net</th><th className={th + ' text-right'}>KDV</th><th className={th + ' text-right'}>Brüt</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.c.id + r.cur} className="hover:bg-bg">
            <td className={td + ' whitespace-nowrap'}>{r.c.name} <span className="text-mute">· {r.c.country}</span></td><td className={td}>{r.cur}</td><td className={td + ' num text-right'}>{fmtNum(r.n)}</td>
            <td className={td + ' num text-right'}>{fmtMoney(r.net, r.cur)}</td><td className={td + ' num text-right'}>{fmtMoney(r.gross - r.net, r.cur)} <span className="text-mute">({pct(r.rate)})</span></td><td className={td + ' num text-right font-medium'}>{fmtMoney(r.gross, r.cur)}</td></tr>)}
            {rows.length === 0 && <tr><td colSpan={6}><Empty>Bu dönemde kesilmiş fatura yok.</Empty></td></tr>}</tbody></table></div>
        <p className="text-xs text-mute px-4 py-2 m-0">Farklı para birimleri toplanmaz. İade ve iptal edilen siparişler hariçtir.</p>
      </Card>
      <div className="grid md:grid-cols-3 gap-3 mt-4">{EXPORTS.map(e => (
        <Card key={e.key} title={e.title}><p className="text-sm text-ink2 mt-0 mb-3">{prep === e.key ? `Önizleme hazır · ${lines.length} örnek satır` : e.state}</p>
          <Btn variant={prep === e.key ? 'outline' : 'primary'} onClick={() => { setPrep(e.key); notify('Önizleme hazırlandı. Hiçbir şey gönderilmedi.') }}>Hazırla</Btn></Card>))}</div>
      {prep && <Card className="mt-3" pad={false} title={<span className="flex items-center gap-2">Önizleme: ilk {lines.length} kayıt <Badge tone="violet">örnek hesap no</Badge></span>}>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
          <thead><tr><th className={th}>Hesap</th><th className={th}>Karşı hesap</th><th className={th + ' text-right'}>Tutar</th><th className={th}>Vergi kodu</th><th className={th}>Belge no</th></tr></thead>
          <tbody>{lines.map(l => <tr key={l.o.id}><td className={td + ' num'}>{l.hesap} <Badge>örnek</Badge></td><td className={td + ' num'}>{l.karsi} <Badge>örnek</Badge></td><td className={td + ' num text-right'}>{fmtMoney(l.o.total, l.o.cur)}</td><td className={td}>{l.kod}</td><td className={td + ' num'}>{l.o.no}</td></tr>)}
            {lines.length === 0 && <tr><td colSpan={5}><Empty>Bu dönemde aktarılacak kayıt yok.</Empty></td></tr>}</tbody></table></div>
        <p className="text-xs text-mute px-4 py-2 m-0">Hesap numaraları ve vergi kodları örnektir; gerçek hesap planı muhasebeden alınır. Bu ekran dosyayı hiçbir yere göndermez.</p></Card>}
      <Card className="mt-4" pad={false} title={<span className="flex items-center gap-2">Ödeme hatırlatma <Badge tone="warn">{overdue.length} gecikmiş</Badge></span>}>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
          <thead><tr><th className={th}>Müşteri kodu</th><th className={th}>Fatura</th><th className={th}>Vade</th><th className={th + ' text-right'}>Kalan</th><th className={th + ' text-right'}>Gecikme</th><th className={th}>Seviye</th><th className={th}></th></tr></thead>
          <tbody>{overdue.map(x => <tr key={x.i.no} className="hover:bg-bg"><td className={td + ' num'}>{x.c.code}</td><td className={td + ' num'}>{x.i.no}</td><td className={td + ' num'}>{dShort(x.i.t + 14 * D)}</td>
            <td className={td + ' num text-right'}>{fmtMoney(x.left, x.c.cur)}</td><td className={td + ' num text-right'}>{x.days} gün</td><td className={td}><Badge tone={x.lvl === 'Son' ? 'bad' : 'warn'}>{x.lvl} hatırlatma</Badge></td>
            <td className={td}><Btn className="!h-7 !text-xs" onClick={() => setDraft(x.i.no)}>Hatırlatma taslağı</Btn></td></tr>)}
            {overdue.length === 0 && <tr><td colSpan={7}><Empty>Gecikmiş B2B faturası yok.</Empty></td></tr>}</tbody></table></div>
        <p className="text-xs text-mute px-4 py-2 m-0">Verilerde vade tarihi yok; vade = fatura tarihi + 14 gün alındı. Ödemeler en eski faturadan başlayarak düşülür. Seviye: 1–14 gün 1., 15–29 gün 2., 30+ gün son.</p></Card>
      <Drawer open={!!dr} title="Hatırlatma taslağı" sub={dr ? `${dr.c.code} · ${dr.i.no}` : ''} onClose={() => setDraft('')}
        footer={<><Btn variant="primary" onClick={() => { notify('Örnek: hatırlatma gönderilmedi, yalnız bildirim.'); setDraft('') }}>Gönder (örnek)</Btn><Btn variant="ghost" onClick={() => setDraft('')}>Kapat</Btn></>}>
        {dr && <><pre className="whitespace-pre-wrap text-sm font-sans m-0">{ptxt(dr)}</pre><p className="text-xs text-mute m-0">Gönderme bir bildirimden ibarettir; gerçek e-posta gitmez.</p></>}
      </Drawer>
    </Gate>
  )
}

/* ───────────── 3. Kârlılık ───────────── */
const COMM: Record<ChannelType, number> = { shopify: 0.029, ebay: 0.115, kaufland: 0.105, otto: 0.12, metro: 0.09, amazon: 0.15, webshop: 0.019, trendyol: 0.13, n11: 0.1, ozon: 0.11 }
const SHIP: Record<string, number> = { DE: 4.9, NL: 5.5, TR: 7.5 }
type SK = 'label' | 'n' | 'rev' | 'avg' | 'comm' | 'ship' | 'net' | 'margin'
interface PRow { key: string; label: string; n: number; rev: number; avg: number; comm: number; ship: number; net: number; margin: number }

function aggregate(list: Order[], keyOf: (o: Order) => [string, string]): PRow[] {
  const m = new Map<string, PRow>()
  list.forEach(o => {
    const [key, label] = keyOf(o), r = m.get(key) ?? { key, label, n: 0, rev: 0, avg: 0, comm: 0, ship: 0, net: 0, margin: 0 }
    r.n++; r.rev += o.total; r.comm += o.total * COMM[account(o.acc).type]
    r.ship += SHIP[WAREHOUSES.find(w => w.id === o.wh)?.country ?? 'DE']
    m.set(key, r)
  })
  return [...m.values()].map(r => ({ ...r, avg: r.rev / r.n, net: r.rev - r.comm - r.ship, margin: (r.rev - r.comm - r.ship) / r.rev }))
}

export function Profit() {
  const { orders } = useStore()
  const [by, setBy] = useState<'ch' | 'co'>('ch')
  const [sk, setSk] = useState<SK>('net')
  const [asc, setAsc] = useState(false)
  const list = useMemo(() => orders.filter(o => o.cur === 'EUR' && o.t >= NOW - 30 * D && o.status !== 'iptal' && o.status !== 'iade'), [orders])
  const chRows = useMemo(() => aggregate(list, o => { const t = account(o.acc).type; return [t, CHANNEL[t].label] }), [list])
  const coRows = useMemo(() => aggregate(list, o => [o.company, company(o.company).name]), [list])
  const rows = [...(by === 'ch' ? chRows : coRows)].sort((a, b) => (sk === 'label' ? a.label.localeCompare(b.label, 'tr') : a[sk] - b[sk]) * (asc ? 1 : -1))
  const click = (k: SK) => { if (k === sk) setAsc(!asc); else { setSk(k); setAsc(k === 'label') } }
  const H = ({ k, children, right }: { k: SK; children: ReactNode; right?: boolean }) => (
    <th className={th + (right ? ' text-right' : '')} aria-sort={sk === k ? (asc ? 'ascending' : 'descending') : 'none'}>
      <button onClick={() => click(k)} className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-inherit font-medium cursor-pointer" aria-label={`${children} sütununa göre sırala`}>{children}{sk === k && (asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button>
    </th>)
  const top = (f: (r: PRow) => number, low = false) => [...chRows].sort((a, b) => (low ? f(a) - f(b) : f(b) - f(a)))[0]
  const best = top(r => r.rev), worst = top(r => r.margin, true), basket = top(r => r.avg)
  const tot = chRows.reduce((a, r) => ({ rev: a.rev + r.rev, net: a.net + r.net }), { rev: 0, net: 0 })

  return (
    <Gate>
      <PageHead title="Kârlılık" desc="Son 30 gün, EUR siparişler (iptal ve iade hariç). Ürün alış maliyeti örnek veride yok; bu yüzden gösterilen rakam ürün maliyetinden önceki katkıdır." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Sipariş" value={fmtNum(list.length)} hint="EUR · 30 gün" />
        <Stat label="Ciro" value={fmtMoney(tot.rev, 'EUR', 0)} />
        <Stat label="Tahmini katkı" value={fmtMoney(tot.net, 'EUR', 0)} hint="Ürün maliyetinden önce" tone="ok" />
        <Stat label="Katkı oranı" value={tot.rev ? pct(tot.net / tot.rev) : '—'} hint="Örnek oranlarla" />
      </div>
      {list.length === 0 ? <Card><Empty>Son 30 günde EUR sipariş yok.</Empty></Card> : <>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-3">
          <Card title="Kanal bazında tahmini katkı" right={<Badge tone="violet">örnek oran</Badge>}>
            <HBars data={[...chRows].sort((a, b) => b.net - a.net).map(r => ({ label: r.label, value: Math.max(0, r.net), color: CHANNEL[r.key as ChannelType].color }))} fmt={v => fmtMoney(v, 'EUR', 0)} />
          </Card>
          <Card title="Ne görüyoruz">
            <ul className="m-0 pl-4 text-sm space-y-1.5">
              <li>En yüksek ciro: <b>{best.label}</b>, {fmtMoney(best.rev, 'EUR', 0)} ({best.n} sipariş).</li>
              <li>En düşük katkı oranı: <b>{worst.label}</b>, {pct(worst.margin)} (komisyon {pct(COMM[worst.key as ChannelType])} örnek oran).</li>
              <li>En yüksek ortalama sepet: <b>{basket.label}</b>, {fmtMoney(basket.avg, 'EUR')}.</li>
            </ul>
            <p className="text-xs text-mute mb-0 mt-3">Alış maliyeti, iade ve reklam gideri dahil değildir.</p>
          </Card>
        </div>
        <Card className="mt-4" pad={false} title={by === 'ch' ? 'Kanal tablosu' : 'Şirket tablosu'} right={<select className={sel} value={by} onChange={e => setBy(e.target.value as 'ch' | 'co')} aria-label="Gruplama"><option value="ch">Kanala göre</option><option value="co">Şirkete göre</option></select>}>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><H k="label">{by === 'ch' ? 'Kanal' : 'Şirket'}</H><H k="n" right>Sipariş</H><H k="rev" right>Ciro</H><H k="avg" right>Ort. sepet</H><H k="comm" right>Komisyon (örnek)</H><H k="ship" right>Kargo (örnek)</H><H k="net" right>Katkı</H><H k="margin" right>Oran</H></tr></thead>
            <tbody>{rows.map(r => <tr key={r.key} className="hover:bg-bg"><td className={td}>{r.label}</td><td className={td + ' num text-right'}>{fmtNum(r.n)}</td><td className={td + ' num text-right'}>{fmtMoney(r.rev, 'EUR', 0)}</td><td className={td + ' num text-right'}>{fmtMoney(r.avg, 'EUR')}</td>
              <td className={td + ' num text-right'}>{fmtMoney(r.comm, 'EUR', 0)}</td><td className={td + ' num text-right'}>{fmtMoney(r.ship, 'EUR', 0)}</td><td className={td + ' num text-right font-medium'}>{fmtMoney(r.net, 'EUR', 0)}</td><td className={td + ' num text-right'}>{pct(r.margin)}</td></tr>)}</tbody></table></div>
          <p className="text-xs text-mute px-4 py-2 m-0">Örnek varsayım: komisyon kanal başına sabit yüzde ({Object.entries(COMM).map(([k, v]) => `${CHANNEL[k as ChannelType].label} ${pct(v)}`).join(', ')}); kargo sipariş başına depo ülkesine göre sabit (DE 4,90 · NL 5,50 · TR 7,50 EUR). Gerçek oranlar sözleşmelerden alınmalıdır.</p>
        </Card></>}
    </Gate>
  )
}
