import { useMemo, useState, type ReactNode } from 'react'
import { Check, CircleDot, Copy, RefreshCw, X } from 'lucide-react'
import { CHANNEL, JOB, NOW, VAT, ago, fmtDT, fmtMoney, fmtNum, type ChannelType, type Country, type Cur, type Health, type JobStatus } from '../data'
import { COMPANIES, WAREHOUSES } from '../data'
import { ROLES, useStore, type Role } from '../store'
import { Badge, Btn, Card, Drawer, PageHead, Stat, td, th, sel, type Tone } from '../ui'

const inp = 'h-8 rounded-md border border-line bg-card px-2 text-sm w-full min-w-0'
const DAY = 86_400_000
const Lbl = ({ t, children }: { t: string; children: ReactNode }) => <label className="block text-xs text-mute"><span className="block mb-1">{t}</span>{children}</label>
const Ex = () => <Badge tone="violet" title="Gerçek değil, gösterim amaçlı">örnek</Badge>
const Meter = ({ pct, tone = 'var(--brand)' }: { pct: number; tone?: string }) => (
  <div className="h-2.5 rounded bg-bg overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded" style={{ width: `${Math.min(100, pct)}%`, background: tone }} />
  </div>
)
const hash = (n: number) => { let x = (n + 1) * 2654435761 >>> 0; x ^= x >>> 13; x = Math.imul(x, 1274126177) >>> 0; return x }
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789'
const fakeKey = (n: number) => 'wk_live_' + Array.from({ length: 24 }, (_, i) => ALPHA[hash(n * 31 + i) % ALPHA.length]).join('')

// ================= 1. KURULUM SİHİRBAZI =================
const STEPS = ['Şirket', 'Depo', 'Kanallar', 'Ürünler', 'Ekip', 'Özet'] as const
const CARRIER: Record<Country, string> = { DE: 'DHL Paket', NL: 'PostNL', TR: 'Yurtiçi Kargo' }
const CURS: Record<Country, Cur> = { DE: 'EUR', NL: 'EUR', TR: 'TRY' }
const SOURCES = ['CSV dosyası', 'JTL-Wawi', 'Billbee', 'Shopify'] as const
const MAPPING: [string, string | null][] = [['Artikelnummer', 'SKU'], ['Titel', 'Ürün adı'], ['Preis_brutto', 'Satış fiyatı'], ['Bestand', 'Stok'], ['EAN', 'Barkod'], ['Lieferant_ref', null], ['Notiz_intern', null]]
interface Invite { email: string; role: Role }

export function Onboarding() {
  const { notify } = useStore()
  const [step, setStep] = useState(0)
  const [co, setCo] = useState({ name: '', country: 'DE' as Country, cur: 'EUR' as Cur })
  const [wh, setWh] = useState({ name: '', city: '', carrier: CARRIER.DE })
  const [conn, setConn] = useState<Set<ChannelType>>(new Set())
  const [src, setSrc] = useState<(typeof SOURCES)[number] | null>(null)
  const [invites, setInvites] = useState<Invite[]>([{ email: '', role: 'depo' }])
  const [done, setDone] = useState(false)

  const warn = src === 'CSV dosyası' ? MAPPING.filter(m => !m[1]).length : src ? 3 : 0
  const items = [
    { ok: !!co.name.trim(), label: 'Şirket bilgisi', miss: 'Yasal şirket adı girilmedi' },
    { ok: !!wh.name.trim() && !!wh.city.trim(), label: 'İlk depo', miss: 'Depo adı veya şehir eksik' },
    { ok: conn.size > 0, label: `Kanallar (${conn.size})`, miss: 'Hiç kanal bağlanmadı' },
    { ok: !!src, label: 'Ürün kaynağı', miss: 'Ürünlerin nereden geleceği seçilmedi' },
    { ok: invites.some(i => i.email.trim()), label: 'Ekip daveti', miss: 'Kimse davet edilmedi (yalnız siz olacaksınız)' },
  ]
  const pct = Math.round((items.filter(i => i.ok).length / items.length) * 100)
  const pickCountry = (c: Country) => { setCo({ ...co, country: c, cur: CURS[c] }); setWh(w => ({ ...w, carrier: CARRIER[c] })) }
  const toggleConn = (t: ChannelType) => setConn(s => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n })

  return (
    <>
      <PageHead title="Kurulum sihirbazı" desc="Yeni bir müşteri kuruluşunun (kiracı) ilk girişte göreceği kendi kendine kurulum. Hiçbir alan zorunlu değil; eksikler son adımda listelenir." />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px] items-start">
        <div className="space-y-4 min-w-0">
          <ol className="flex gap-1 overflow-x-auto pb-1 m-0 p-0 list-none" aria-label="Adımlar">
            {STEPS.map((s, i) => (
              <li key={s}><button onClick={() => setStep(i)} aria-current={step === i ? 'step' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 h-8 text-sm whitespace-nowrap ${step === i ? 'bg-ink text-bg border-ink font-medium' : 'bg-card border-line text-ink2 hover:bg-bg'}`}>
                <span className="num text-xs">{i + 1}</span>{s}{i < 5 && items[i]?.ok && <Check size={13} aria-label="tamam" />}
              </button></li>
            ))}
          </ol>
          <Card title={`${step + 1}. ${STEPS[step]}`}>
            {step === 0 && <div className="grid gap-3 sm:grid-cols-3">
              <Lbl t="Yasal şirket adı"><input className={inp} value={co.name} onChange={e => setCo({ ...co, name: e.target.value })} placeholder="Örnek Ticaret GmbH" /></Lbl>
              <Lbl t="Ülke"><select className={sel + ' w-full'} value={co.country} onChange={e => pickCountry(e.target.value as Country)}><option value="DE">Almanya</option><option value="NL">Hollanda</option><option value="TR">Türkiye</option></select></Lbl>
              <Lbl t="Para birimi"><select className={sel + ' w-full'} value={co.cur} onChange={e => setCo({ ...co, cur: e.target.value as Cur })}><option>EUR</option><option>TRY</option><option>USD</option></select></Lbl>
              <p className="sm:col-span-3 m-0 text-sm text-ink2">Bu ülke için KDV oranı: <b className="num">%{Math.round(VAT[co.country] * 100)}</b>. Faturalar ve fiyatlar bu orana göre hesaplanır.</p>
            </div>}
            {step === 1 && <div className="grid gap-3 sm:grid-cols-3">
              <Lbl t="Depo adı"><input className={inp} value={wh.name} onChange={e => setWh({ ...wh, name: e.target.value })} placeholder="Ana depo" /></Lbl>
              <Lbl t="Şehir"><input className={inp} value={wh.city} onChange={e => setWh({ ...wh, city: e.target.value })} placeholder="Şehir" /></Lbl>
              <Lbl t="Varsayılan kargo firması"><input className={inp} value={wh.carrier} onChange={e => setWh({ ...wh, carrier: e.target.value })} /></Lbl>
              <p className="sm:col-span-3 m-0 text-sm text-ink2">Kargo firması seçtiğiniz ülkeye göre önerildi ({CARRIER[co.country]}); değiştirebilirsiniz. Depo ülkesi: {co.country}.</p>
            </div>}
            {step === 2 && <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(CHANNEL) as ChannelType[]).map(t => (
                  <div key={t} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
                    <span className="inline-flex items-center gap-2 min-w-0"><span className="size-2.5 rounded-full shrink-0" style={{ background: CHANNEL[t].color }} />{CHANNEL[t].label}</span>
                    <Btn variant={conn.has(t) ? 'ghost' : 'outline'} onClick={() => toggleConn(t)} aria-pressed={conn.has(t)}>{conn.has(t) ? <><Check size={14} />Bağlandı (örnek)</> : 'Bağlan'}</Btn>
                  </div>
                ))}
              </div>
              <p className="m-0 text-sm text-ink2">Gerçek akışta "Bağlan" sizi pazaryerinin kendi yetkilendirme sayfasına götürür; siz orada izin verirsiniz, biz şifrenizi hiç görmeyiz. Dönen anahtarlar her kiracı için ayrı ayrı şifrelenerek saklanır.</p>
            </div>}
            {step === 3 && <div className="space-y-3">
              <div className="flex flex-wrap gap-2">{SOURCES.map(s => <Btn key={s} variant={src === s ? 'primary' : 'outline'} onClick={() => setSrc(s)} aria-pressed={src === s}>{s}</Btn>)}</div>
              {src === 'CSV dosyası' && <div className="overflow-x-auto rounded-lg border border-line"><table className="w-full border-collapse text-sm">
                <thead><tr><th className={th}>CSV sütunu</th><th className={th}>Panel alanı</th><th className={th}>Durum</th></tr></thead>
                <tbody>{MAPPING.map(([c, f]) => <tr key={c}><td className={td}><code>{c}</code></td><td className={td}>{f ?? <span className="text-mute">—</span>}</td><td className={td}>{f ? <Badge tone="ok">Eşleşti</Badge> : <Badge tone="warn">Eşleşmedi</Badge>}</td></tr>)}</tbody>
              </table></div>}
              {src && <div className="rounded-lg bg-bg px-3 py-2 text-sm"><b>Önizleme:</b> <span className="num">240</span> ürün içe aktarılacak, <span className="num">{warn}</span> uyarı var. <Ex /></div>}
              {!src && <p className="m-0 text-sm text-ink2">Ürünlerinizin nereden geleceğini seçin. İçe aktarma sırasında hiçbir şey silinmez; önce önizleme gösterilir.</p>}
            </div>}
            {step === 4 && <div className="space-y-2">
              {invites.map((v, i) => (
                <div key={i} className="grid gap-2 grid-cols-[1fr_auto_auto] items-end">
                  <Lbl t="E-posta"><input className={inp} value={v.email} placeholder="ad@sirketiniz.example" onChange={e => setInvites(a => a.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} /></Lbl>
                  <Lbl t="Rol"><select className={sel} value={v.role} onChange={e => setInvites(a => a.map((x, j) => j === i ? { ...x, role: e.target.value as Role } : x))}>{(Object.keys(ROLES) as Role[]).map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}</select></Lbl>
                  <Btn variant="ghost" aria-label="Satırı sil" onClick={() => setInvites(a => a.length > 1 ? a.filter((_, j) => j !== i) : a)}><X size={16} /></Btn>
                </div>
              ))}
              <Btn onClick={() => setInvites(a => [...a, { email: '', role: 'depo' }])}>Kişi ekle</Btn>
            </div>}
            {step === 5 && <div className="space-y-3">
              <ul className="m-0 p-0 list-none space-y-1.5">{items.map(i => (
                <li key={i.label} className="flex items-start gap-2 text-sm">
                  {i.ok ? <Check size={16} className="text-ok mt-0.5 shrink-0" /> : <CircleDot size={16} className="text-warn mt-0.5 shrink-0" />}
                  <span><b className="font-medium">{i.label}</b>{!i.ok && <span className="text-ink2"> — {i.miss}</span>}</span>
                </li>))}</ul>
              {done ? <Badge tone="ok">Kurulum tamamlandı (örnek)</Badge>
                : <Btn variant="primary" onClick={() => { setDone(true); notify(pct === 100 ? 'Kurulum tamamlandı' : `Kurulum tamamlandı, ${items.length - items.filter(i => i.ok).length} eksik sonra tamamlanabilir`) }}>Kurulumu tamamla</Btn>}
            </div>}
            <div className="flex justify-between mt-4">
              <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Geri</Btn>
              <Btn disabled={step === 5} onClick={() => setStep(step + 1)}>İleri</Btn>
            </div>
          </Card>
        </div>
        <Card title="İlerleme">
          <div className="num text-3xl font-semibold">%{pct}</div>
          <div className="mt-2"><Meter pct={pct} tone="var(--ok)" /></div>
          <p className="m-0 mt-2 text-xs text-ink2">{items.filter(i => i.ok).length} / {items.length} bölüm dolu</p>
        </Card>
      </div>
    </>
  )
}

// ================= 2. API VE BİLDİRİM UÇLARI =================
type Scope = 'salt okuma' | 'sipariş' | 'stok'
interface Key { id: number; name: string; prefix: string; scope: Scope; last: number | null; revoked: boolean }
const EVENTS = ['order.created', 'order.shipped', 'stock.changed', 'sync.failed']
const HOOKS: { id: string; url: string; events: string[]; on: boolean; last: number; ok: number }[] = [
  { id: 'h1', url: 'https://ornek.example/webhook', events: ['order.created', 'order.shipped'], on: true, last: NOW - 4 * 60_000, ok: 99.2 },
  { id: 'h2', url: 'https://ornek.example/stok-bildirim', events: ['stock.changed'], on: true, last: NOW - 37 * 60_000, ok: 96.4 },
  { id: 'h3', url: 'https://ornek.example/hata-kanali', events: ['sync.failed'], on: false, last: NOW - 3 * DAY, ok: 71.0 },
]
const CODES = [200, 200, 200, 200, 204, 500, 200, 408]
const ENDPOINTS: [string, string, string, Scope][] = [
  ['GET', '/v1/orders', 'Sipariş listesi, süzgeçli', 'sipariş'], ['GET', '/v1/orders/{id}', 'Tek sipariş ayrıntısı', 'sipariş'],
  ['POST', '/v1/orders/{id}/ship', 'Siparişi kargoya verildi işaretle', 'sipariş'], ['GET', '/v1/products', 'Ürün listesi', 'salt okuma'],
  ['GET', '/v1/products/{id}', 'Tek ürün ve ilanları', 'salt okuma'], ['PATCH', '/v1/stock', 'Toplu stok güncelle', 'stok'],
  ['GET', '/v1/stock', 'Depo bazında stok', 'salt okuma'], ['GET', '/v1/channels', 'Bağlı kanal hesapları ve sağlık', 'salt okuma'],
  ['POST', '/v1/webhooks', 'Yeni bildirim ucu kaydet', 'sipariş'], ['GET', '/v1/jobs/{id}', 'Arka plan işi durumu', 'salt okuma'],
]
const MTONE: Record<string, Tone> = { GET: 'info', POST: 'ok', PATCH: 'warn' }

export function Developers() {
  const { notify } = useStore()
  const [keys, setKeys] = useState<Key[]>([
    { id: 0, name: 'Muhasebe aktarımı', prefix: 'wk_live_x7k2', scope: 'salt okuma', last: NOW - 2 * 3600_000, revoked: false },
    { id: 1, name: 'Depo etiket aracı', prefix: 'wk_live_p4m9', scope: 'sipariş', last: NOW - 26 * 3600_000, revoked: false },
    { id: 2, name: 'Stok eşitleyici', prefix: 'wk_live_c8t5', scope: 'stok', last: null, revoked: false },
  ])
  const [shown, setShown] = useState<string | null>(null)
  const [name, setName] = useState(''), [scope, setScope] = useState<Scope>('salt okuma')
  const [hook, setHook] = useState<string | null>(null)
  const open = HOOKS.find(h => h.id === hook)
  const create = () => {
    const id = keys.length, full = fakeKey(id + 7)
    setKeys([...keys, { id, name: name.trim() || `Anahtar ${id + 1}`, prefix: full.slice(0, 12), scope, last: null, revoked: false }])
    setShown(full); setName('')
  }
  const deliveries = open ? Array.from({ length: 8 }, (_, i) => ({ t: open.last - i * 17 * 60_000, ev: open.events[i % open.events.length], code: CODES[(hash(i + open.id.length * 9) + i) % CODES.length], ms: 80 + hash(i * 5 + open.url.length) % 600 })) : []

  return (
    <>
      <PageHead title="API ve bildirim uçları" desc="Planlanan herkese açık API'nin taslağı: anahtarlar, bildirim uçları ve uç nokta listesi. Bu bir canlı API değildir; ekrandaki her şey örnektir." />
      <div className="space-y-4">
        <Card title="API anahtarları" right={<Ex />}>
          {shown && <div className="mb-3 rounded-lg border border-warn bg-warn-soft px-3 py-2 text-sm">
            <div className="flex items-start justify-between gap-2"><b>Anahtarı şimdi kopyalayın, bir daha gösterilmez.</b>
              <button aria-label="Kutuyu kapat" onClick={() => setShown(null)} className="border-0 bg-transparent text-ink2"><X size={16} /></button></div>
            <div className="flex flex-wrap items-center gap-2 mt-1"><code className="break-all">{shown}</code>
              <Btn variant="ghost" aria-label="Anahtarı kopyala" onClick={() => notify('Kopyalandı (örnek)')}><Copy size={14} /></Btn></div>
            <p className="m-0 mt-1 text-xs text-ink2">Gerçek sistemde tam anahtar yalnız bir kez gösterilir ve veritabanında sadece özeti (hash) saklanır. Bu anahtar sahtedir.</p>
          </div>}
          <div className="flex flex-wrap items-end gap-2 mb-3">
            <Lbl t="Anahtar adı"><input className={inp + ' w-48'} value={name} onChange={e => setName(e.target.value)} placeholder="Örn. Raporlama" /></Lbl>
            <Lbl t="Yetki"><select className={sel} value={scope} onChange={e => setScope(e.target.value as Scope)}><option>salt okuma</option><option>sipariş</option><option>stok</option></select></Lbl>
            <Btn variant="primary" onClick={create}>Yeni anahtar</Btn>
          </div>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Ad</th><th className={th}>Önek</th><th className={th}>Yetki</th><th className={th}>Son kullanım</th><th className={th} /></tr></thead>
            <tbody>{keys.map(k => <tr key={k.id} className={k.revoked ? 'opacity-50' : ''}>
              <td className={td}>{k.name}</td><td className={td}><code>{k.prefix}…••••</code></td><td className={td}><Badge>{k.scope}</Badge></td>
              <td className={td + ' text-ink2'}>{k.last ? ago(k.last) : 'hiç kullanılmadı'}</td>
              <td className={td + ' text-right'}>{k.revoked ? <Badge tone="bad">İptal edildi</Badge> : <Btn variant="ghost" onClick={() => setKeys(keys.map(x => x.id === k.id ? { ...x, revoked: true } : x))}>İptal et</Btn>}</td>
            </tr>)}</tbody>
          </table></div>
        </Card>
        <Card title="Bildirim uçları (webhook)" pad={false} right={<Ex />}>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Adres</th><th className={th}>Olaylar</th><th className={th}>Durum</th><th className={th}>Son teslim</th><th className={th + ' text-right'}>Başarı</th></tr></thead>
            <tbody>{HOOKS.map(h => <tr key={h.id} className="hover:bg-bg cursor-pointer" onClick={() => setHook(h.id)}>
              <td className={td}><code>{h.url}</code></td>
              <td className={td}><span className="flex flex-wrap gap-1">{h.events.map(e => <Badge key={e}>{e}</Badge>)}</span></td>
              <td className={td}>{h.on ? <Badge tone="ok">Açık</Badge> : <Badge tone="neutral">Kapalı</Badge>}</td>
              <td className={td + ' text-ink2'}>{ago(h.last)}</td>
              <td className={`${td} text-right num ${h.ok < 90 ? 'text-bad' : ''}`}>%{h.ok.toFixed(1).replace('.', ',')}</td>
            </tr>)}</tbody>
          </table></div>
          <p className="m-0 px-4 py-2 text-xs text-mute">Satıra tıklayınca son teslimatlar açılır. Desteklenen olaylar: {EVENTS.join(', ')}.</p>
        </Card>
        <Card title="Uç nokta başvurusu" right={<Badge tone="warn">planlanan, canlı değil</Badge>}>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Yöntem</th><th className={th}>Yol</th><th className={th}>Açıklama</th><th className={th}>Gereken yetki</th></tr></thead>
            <tbody>{ENDPOINTS.map(([m, p, d, s]) => <tr key={m + p}><td className={td}><Badge tone={MTONE[m]}>{m}</Badge></td><td className={td}><code>{p}</code></td><td className={td}>{d}</td><td className={td}><Badge>{s}</Badge></td></tr>)}</tbody>
          </table></div>
          <p className="m-0 mt-2 text-xs text-ink2">Hız sınırı her kiracı için ayrı uygulanır (örnek: dakikada 600 istek); aşılırsa <code>429</code> döner ve diğer kiracılar etkilenmez.</p>
        </Card>
      </div>
      <Drawer open={!!open} onClose={() => setHook(null)} title="Son teslimatlar" sub={open?.url}>
        <table className="w-full border-collapse text-sm">
          <thead><tr><th className={th}>Zaman</th><th className={th}>Olay</th><th className={th}>HTTP</th><th className={th}>Süre</th><th className={th} /></tr></thead>
          <tbody>{deliveries.map((d, i) => <tr key={i}>
            <td className={td + ' num'}>{fmtDT(d.t)}</td><td className={td}><code>{d.ev}</code></td>
            <td className={td}><Badge tone={d.code < 300 ? 'ok' : 'bad'}>{d.code}</Badge></td><td className={td + ' num'}>{d.ms} ms</td>
            <td className={td}><Btn variant="ghost" aria-label="Yeniden dene" onClick={() => notify('Yeniden deneme sıraya alındı (örnek)')}><RefreshCw size={14} /></Btn></td>
          </tr>)}</tbody>
        </table>
        <p className="m-0 text-xs text-mute">Teslimat kayıtları örnektir.</p>
      </Drawer>
    </>
  )
}

// ================= 3. KULLANIM VE ABONELİK =================
const PLANS = [{ n: 'Başlangıç', lim: 500, eur: 49 }, { n: 'Büyüme', lim: 3000, eur: 149 }, { n: 'Ölçek', lim: 15000, eur: 399 }]
const INVOICES: [string, number, string][] = [['2026-10', 1, 'Ödendi'], ['2026-09', 1, 'Ödendi'], ['2026-08', 0, 'Ödendi'], ['2026-07', 0, 'Ödendi']]

export function Billing() {
  const { orders, accounts, products } = useStore()
  const [plan, setPlan] = useState(0)
  const u = useMemo(() => {
    const d = new Date(NOW), dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), day = d.getDate()
    const n30 = orders.filter(o => o.t >= NOW - 30 * DAY).length
    const month = orders.filter(o => { const t = new Date(o.t); return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() }).length
    return { n30, month, day, dim, proj: Math.round((month / day) * dim) }
  }, [orders])
  const cur = PLANS[plan], pct = (u.n30 / cur.lim) * 100
  const tone = pct > 100 ? 'var(--bad)' : pct > 80 ? 'var(--warn)' : 'var(--ok)'
  return (
    <>
      <PageHead title="Kullanım ve abonelik" desc="Bu ay ne kadar kullandığınız ve hangi pakete denk geldiğiniz. Fiyatlar ve paketler henüz kararlaştırılmadı; hepsi yer tutucudur." />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <Stat label="Sipariş (30 gün)" value={fmtNum(u.n30)} /><Stat label="Bağlı hesap" value={accounts.length} /><Stat label="Ürün" value={fmtNum(products.length)} />
        <Stat label="Depo" value={WAREHOUSES.length} /><Stat label="Şirket" value={COMPANIES.length} /><Stat label="Kullanıcı" value={Object.keys(ROLES).length} hint="rol sayısı" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        {PLANS.map((p, i) => (
          <Card key={p.n} title={<span className="inline-flex items-center gap-2">{p.n} <Badge tone="violet">örnek fiyat</Badge></span>} className={i === plan ? 'border-brand' : ''}>
            <div className="num text-2xl font-semibold">{fmtMoney(p.eur, 'EUR', 0)}<span className="text-sm text-mute font-normal"> / ay</span></div>
            <p className="m-0 mt-1 text-sm text-ink2">Ayda <b className="num">{fmtNum(p.lim)}</b> siparişe kadar</p>
            <Btn className="mt-3" variant={i === plan ? 'primary' : 'outline'} onClick={() => setPlan(i)} aria-pressed={i === plan}>{i === plan ? 'Mevcut paket' : 'Bunu seç'}</Btn>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <Card title="Sipariş kullanımı">
          <Meter pct={pct} tone={tone} />
          <p className="m-0 mt-2 text-sm"><b className="num">{fmtNum(u.n30)}</b> / <span className="num">{fmtNum(cur.lim)}</span> sipariş (<span className="num">%{Math.round(pct)}</span>), son 30 gün.</p>
          <p className="m-0 mt-1 text-sm text-ink2">Ay sonu tahmini: <b className="num">{fmtNum(u.proj)}</b> sipariş ({u.day}. günde {fmtNum(u.month)} sipariş, günlük ortalama <span className="num">{(u.month / u.day).toFixed(1).replace('.', ',')}</span>).
            {u.proj > cur.lim ? <> Bu paketi aşar.</> : <> Bu paketin içinde kalır.</>}</p>
          <p className="m-0 mt-1 text-sm text-ink2">Asistan: bu ay 0 işlem (bağlı değil)</p>
        </Card>
        <Card title="Fatura geçmişi" right={<Ex />} pad={false}>
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Dönem</th><th className={th + ' text-right'}>Tutar</th><th className={th}>Durum</th></tr></thead>
            <tbody>{INVOICES.map(([d, p, s]) => <tr key={d}><td className={td + ' num'}>{d}</td><td className={td + ' num text-right'}>{fmtMoney(PLANS[p].eur, 'EUR', 2)}</td><td className={td}><Badge tone="ok">{s}</Badge></td></tr>)}</tbody>
          </table>
          <p className="m-0 px-4 py-2 text-xs text-mute">Faturalama sağlayıcısı seçilmedi; bu satırlar gösterim içindir.</p>
        </Card>
      </div>
    </>
  )
}

// ================= 4. DURUM SAYFASI =================
const COMPONENTS = ['API', 'Kuyruk', 'Veritabanı', 'Dosya deposu']
const JT: Record<JobStatus, Tone> = { sirada: 'info', calisiyor: 'violet', tamamlandi: 'ok', basarisiz: 'bad', kismi: 'warn' }
const HRANK: Record<Health, number> = { failed: 0, stale: 1, partial: 2, ok: 3 }
const HT: Record<Health, [Tone, string]> = { ok: ['ok', 'Güncel'], partial: ['warn', 'Kısmi'], failed: ['bad', 'Başarısız'], stale: ['bad', 'Bayat'] }

export function Status() {
  const { jobs, accounts } = useStore()
  const q = useMemo(() => {
    const by = (Object.keys(JOB) as JobStatus[]).map(s => ({ s, n: jobs.filter(j => j.status === s).length }))
    const waiting = jobs.filter(j => j.status === 'sirada')
    return { by, oldest: waiting.length ? Math.min(...waiting.map(j => j.last)) : null }
  }, [jobs])
  const chans = [...accounts].sort((a, b) => HRANK[a.health] - HRANK[b.health] || a.lastSync - b.lastSync)
  const inc = jobs.filter(j => (j.status === 'basarisiz' || j.status === 'kismi') && j.last >= NOW - DAY).sort((a, b) => b.last - a.last)
  const bad = chans.filter(a => a.health !== 'ok').length
  return (
    <>
      <PageHead title="Durum sayfası" desc="Arka planda neler dönüyor: sistem parçaları, iş kuyruğu, kanal eşitlemeleri ve son 24 saatin olayları."
        actions={<span className="inline-flex items-center gap-1.5 text-xs text-mute"><RefreshCw size={13} />30 sn'de bir yenilenir <Ex /></span>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Sistem parçaları" right={<Ex />}>
          <ul className="m-0 p-0 list-none divide-y divide-line">{COMPONENTS.map(c => <li key={c} className="flex items-center justify-between py-2 text-sm">{c}<Badge tone="ok">çalışıyor</Badge></li>)}</ul>
        </Card>
        <Card title="İş kuyruğu" right={<span className="text-xs text-mute num">{jobs.length} iş</span>}>
          <div className="grid grid-cols-5 gap-2">{q.by.map(b => <div key={b.s} className="rounded-lg bg-bg px-2 py-2 text-center"><div className="num text-lg font-semibold">{b.n}</div><Badge tone={JT[b.s]}>{JOB[b.s]}</Badge></div>)}</div>
          <p className="m-0 mt-2 text-sm text-ink2">En eski bekleyen iş: <b>{q.oldest ? ago(q.oldest) : 'bekleyen yok'}</b></p>
        </Card>
        <Card title="Kanal eşitlemeleri" pad={false} className="lg:col-span-2" right={<a href="#/sync" className="text-sm text-brand mr-1">Eşitleme ekranı</a>}>
          <p className="m-0 px-4 pb-2 text-xs text-mute">{bad} hesapta sorun var; en kötüsü üstte.</p>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Kanal · hesap</th><th className={th}>Durum</th><th className={th}>Son başarılı eşitleme</th><th className={th}>Tarih</th></tr></thead>
            <tbody>{chans.map(a => <tr key={a.id}>
              <td className={td}><span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: CHANNEL[a.type].color }} />{CHANNEL[a.type].label}<span className="text-mute">{a.name}</span></span></td>
              <td className={td}><Badge tone={HT[a.health][0]}>{HT[a.health][1]}</Badge></td><td className={td}>{ago(a.lastSync)}</td><td className={td + ' num text-ink2'}>{fmtDT(a.lastSync)}</td>
            </tr>)}</tbody>
          </table></div>
        </Card>
        <Card title="Son 24 saat · olaylar" className="lg:col-span-2" right={<span className="text-xs text-mute num">{inc.length} olay</span>}>
          {inc.length === 0 ? <p className="m-0 text-sm text-ink2">Son 24 saatte başarısız ya da kısmi iş yok.</p> :
            <ol className="m-0 p-0 list-none border-l border-line ml-1.5 space-y-3">{inc.map(j => (
              <li key={j.id} className="relative pl-4 text-sm">
                <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full" style={{ background: j.status === 'basarisiz' ? 'var(--bad)' : 'var(--warn)' }} />
                <div className="flex flex-wrap items-center gap-2"><span className="num text-ink2">{fmtDT(j.last)}</span><Badge tone={JT[j.status]}>{JOB[j.status]}</Badge><b className="font-medium">{j.kind}</b></div>
                {j.msg && <div className="text-ink2">{j.msg}</div>}
              </li>))}</ol>}
        </Card>
      </div>
    </>
  )
}
