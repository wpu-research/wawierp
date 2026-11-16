import { useMemo, useState } from 'react'
import { ArrowRight, Plus, Undo2 } from 'lucide-react'
import { NOW, RETURN_RULE, ago, dayKey, fmtDT, fmtNum, hasIssue, overdue, toShip } from '../data'
import { ROLES, useStore } from '../store'
import { Badge, Btn, Card, Drawer, PageHead, Stat, sel, td, th, type Tone } from '../ui'

type Level = 'oner' | 'sor' | 'oto'
const LEVEL: Record<Level, { label: string; tone: Tone; hint: string }> = {
  oner: { label: 'Yalnız öner', tone: 'neutral', hint: 'Sistem öneri üretir, hiçbir şeyi kendisi yapmaz.' },
  sor: { label: 'Önce sor', tone: 'info', hint: 'İşlemi hazırlar, siz onaylayınca uygular.' },
  oto: { label: 'Kendiliğinden', tone: 'warn', hint: 'Sınır içinde onaysız uygular, sonradan günlükte gösterir.' },
}
interface Rule { id: string; area: string; name: string; event: string; cond: string; action: string; level: Level; limit: number; unit: string; on: boolean; last: string; money?: boolean; undo?: boolean; custom?: boolean }
const R = (id: string, area: string, name: string, event: string, cond: string, action: string, level: Level, limit: number, unit: string, last: string, o: Partial<Rule> = {}): Rule =>
  ({ id, area, name, event, cond, action, level, limit, unit, on: true, last, ...o })
const RULES0: Rule[] = [
  R('r1', 'Sipariş ve kargo', 'Depo / kaynak seçimi', 'Ödeme alındı', 'Fiziki stok yetmiyor', 'Siparişi drop tedarikçisine yönlendir', 'sor', 25, 'sipariş', 'son 7 gün: 142 öneri, 139 onay, 3 ret', { undo: true, money: true }),
  R('r2', 'Sipariş ve kargo', 'Kargo seçimi ve etiket', 'Sipariş hazırlanıyor', 'Ülke ve ağırlık belli', 'En uygun kargoyu seç, etiketi oluştur (kargo ücreti doğar)', 'sor', 100, 'etiket', 'son 7 gün: 388 öneri, 384 onay, 4 geri alma', { undo: true, money: true }),
  R('r3', 'Sipariş ve kargo', 'Sevkte takip bildirimi', 'Kargoya verildi', 'Takip no oluştu', 'Takip no kanala gönder; faturayı kesinleştirmeyi öner (kesinleştirme ayrı yetki)', 'sor', 50, 'sipariş', 'son 7 gün: 351 öneri, 349 onay, 2 ret', { money: true }),
  R('r4', 'Sipariş ve kargo', 'Drop siparişini tedarikçiye ilet', 'Drop siparişi ödendi', 'Tedarikçi stoğu var', 'Siparişi tedarikçiye gönder', 'sor', 20, 'sipariş', 'son 7 gün: 96 öneri, 96 onay', { undo: true, money: true }),
  R('r5', 'Sipariş ve kargo', 'Gecikme yakalama', 'Her saat başı', 'Ödendi, 48 saattir kargoda değil', 'Uyarı oluştur, depoya görev aç', 'oto', 10, 'uyarı', 'son 7 gün: 31 uyarı, 29 çözüldü'),
  R('r6', 'Stok', 'Kanallar arası stok eşitleme', 'Stok değişti', 'Fark %5\'ten büyük', 'Tüm kanallara yeni stoğu yaz', 'oto', 500, 'ürün', 'son 7 gün: 2.140 güncelleme, 12 geri alma', { undo: true }),
  R('r7', 'Stok', 'Güvenlik payı', 'Stok değişti', 'Stok 3 adedin altında', 'Kanallara stoğu 2 eksik göster', 'oner', 200, 'ürün', 'son 7 gün: 64 öneri, 50 onay, 14 ret', { undo: true }),
  R('r8', 'İlan ve fiyat', 'Stok bitince durdur, gelince aç', 'Stok sıfır / yeniden geldi', 'İlan aktif / durdurulmuş', 'İlanı durdur / yeniden aç', 'sor', 40, 'ilan', 'son 7 gün: 57 öneri, 55 onay, 2 ret', { undo: true }),
  R('r9', 'İlan ve fiyat', 'Maliyet değişince fiyat güncelle', 'Tedarikçi maliyeti değişti', 'Marj %12\'nin altına düşüyor', 'Fiyatı güncelle (alt sınır: maliyet + %12)', 'sor', 15, 'ürün', 'son 7 gün: 38 öneri, 31 onay, 7 ret', { money: true, undo: true }),
  R('r10', 'İlan ve fiyat', 'Reddedilen ilanı düzelt, yeniden dene', 'İlan reddedildi', 'Neden: eksik alan / EAN', 'Alanı tamamla, ilanı yeniden gönder', 'oner', 30, 'ilan', 'son 7 gün: 22 öneri, 15 onay, 7 ret'),
  R('r11', 'İade ve destek', 'Kurala uyan iadeyi onayla', 'İade talebi geldi', `${RETURN_RULE.days} gün içinde, tutar ${RETURN_RULE.eur} € altı`, 'İadeyi kabul et, kanala bildir', 'sor', 10, 'iade', 'son 7 gün: 44 öneri, 41 onay, 3 ret', { money: true }),
  R('r12', 'İade ve destek', '"Siparişim nerede" yanıtı', 'Müşteri mesajı geldi', 'Konu: kargo durumu', 'Takip bilgisiyle yanıt taslağı gönder', 'oto', 60, 'mesaj', 'son 7 gün: 173 yanıt, 5 geri alma'),
  R('r13', 'Finans', 'Havale eşleştirme', 'Banka hareketi geldi', 'Tutar ve referans eşleşiyor', 'Ödemeyi siparişe işle', 'sor', 30, 'hareket', 'son 7 gün: 47 öneri, 46 onay, 1 ret', { money: true, undo: true }),
  R('r14', 'Sistem sağlığı', 'Başarısız eşitlemeyi yeniden dene', 'Eşitleme başarısız', 'Deneme sayısı 5\'ten az', '1, 5, 15, 60 dk aralıkla yeniden dene', 'oto', 5, 'deneme', 'son 7 gün: 63 deneme, 51 başarılı'),
]
const AREAS = ['Sipariş ve kargo', 'Stok', 'İlan ve fiyat', 'İade ve destek', 'Finans', 'Sistem sağlığı']
const EVENTS = ['Ödeme alındı', 'Sipariş kargoya verildi', 'Stok değişti', 'İade talebi geldi', 'Eşitleme başarısız', 'İlan reddedildi']
const CONDS = ['Tutar 100 € altı', 'Stok 5 adedin altında', 'Kanal Kaufland', 'Sipariş 24 saati geçti', 'Her zaman']
const ACTS = ['Uyarı oluştur', 'Görev aç', 'Kanala bildirim gönder', 'İlanı durdur', 'Etiket oluştur']
const RESULTS = ['Uygulandı', 'Onaylandı', 'Uygulandı', 'Reddedildi', 'Onay bekliyor']

const Switch = ({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors disabled:opacity-45 ${on ? 'bg-brand border-brand' : 'bg-bg border-line'}`}>
    <span className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
  </button>
)

function Strip() {
  const steps: [string, string][] = [['Olay', 'Sistemde bir şey olur: ödeme, stok değişimi, iade…'], ['Kural', 'Koşul tutarsa hazır bir işlem seçilir.'], ['Onay düzeyi', 'Öner, sor ya da sınır içinde kendisi yapsın.']]
  return (
    <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch">
      {steps.flatMap(([t, d], i) => [
        <div key={t} className="rounded-xl border border-line bg-card px-3 py-2"><div className="text-sm font-semibold"><span className="num text-brand">{i + 1}.</span> {t}</div><div className="text-xs text-ink2">{d}</div></div>,
        ...(i < 2 ? [<ArrowRight key={'a' + i} size={16} className="hidden md:block self-center text-mute" aria-hidden />] : []),
      ])}
    </div>
  )
}

function History({ rule }: { rule: Rule }) {
  const { orders, notify } = useStore()
  const [undone, setUndone] = useState<Set<number>>(new Set())
  const nos = orders.slice(0, 40).map(o => o.no)
  const rows = Array.from({ length: 7 }, (_, i) => {
    const seed = rule.id.charCodeAt(1) + i * 3
    return { t: NOW - (i * 5.3 + 0.6 + (seed % 4)) * 3600_000, trig: nos[(seed * 7) % Math.max(1, nos.length)] ?? '—', res: RESULTS[(seed + i) % RESULTS.length] }
  })
  return (
    <div className="overflow-x-auto border border-line rounded-lg">
      <table className="w-full text-sm"><thead><tr><th className={th}>Zaman</th><th className={th}>Tetikleyen</th><th className={th}>Ne yaptı / önerdi</th><th className={th}>Sonuç</th><th className={th}><span className="sr-only">İşlem</span></th></tr></thead>
        <tbody>{rows.map((r, i) => {
          const done = r.res === 'Uygulandı' || r.res === 'Onaylandı', u = undone.has(i)
          return (
            <tr key={i}><td className={td + ' num whitespace-nowrap'}>{fmtDT(r.t)}</td><td className={td + ' num'}>{rule.event.split(' ')[0]} · {r.trig}</td><td className={td}>{rule.action}</td>
              <td className={td}><Badge tone={u ? 'neutral' : r.res === 'Reddedildi' ? 'bad' : r.res === 'Onay bekliyor' ? 'warn' : 'ok'}>{u ? 'Geri alındı' : r.res}</Badge></td>
              <td className={td}>{rule.undo && done && !u && <Btn variant="ghost" aria-label={`${r.trig} işlemini geri al`} onClick={() => { setUndone(new Set(undone).add(i)); notify('İşlem geri alındı') }}><Undo2 size={14} />Geri al</Btn>}</td></tr>
          )
        })}</tbody></table>
    </div>
  )
}

function Builder({ onAdd, onClose }: { onAdd: (r: Rule) => void; onClose: () => void }) {
  const [f, setF] = useState({ event: EVENTS[0], cond: CONDS[0], action: ACTS[0], level: 'oner' as Level, limit: 20 })
  const pick = (k: 'event' | 'cond' | 'action', label: string, list: string[]) => (
    <label className="block text-sm"><span className="text-xs text-mute">{label}</span>
      <select className={sel + ' w-full mt-0.5'} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })}>{list.map(x => <option key={x}>{x}</option>)}</select></label>
  )
  return (
    <Card title="Yeni kural" right={<Btn variant="ghost" onClick={onClose}>Vazgeç</Btn>} className="mb-4">
      <div className="grid gap-3 sm:grid-cols-3">{pick('event', 'Olay', EVENTS)}{pick('cond', 'Koşul', CONDS)}{pick('action', 'İşlem', ACTS)}</div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="text-sm"><div className="text-xs text-mute">Onay düzeyi</div><Badge tone="neutral">Yalnız öner</Badge></div>
        <label className="text-sm"><span className="block text-xs text-mute">Tek seferde en fazla</span><input type="number" min={1} max={500} value={f.limit} onChange={e => setF({ ...f, limit: Math.max(1, Number(e.target.value) || 1) })} className={sel + ' w-24 num'} /></label>
        <Btn variant="primary" onClick={() => onAdd(R('rn' + f.limit + f.event.length + f.action.length, 'Sistem sağlığı', `${f.event} → ${f.action}`, f.event, f.cond, f.action, 'oner', f.limit, 'kayıt', 'henüz çalışmadı', { custom: true, money: /etiket|ilan/i.test(f.action) }))}>Kuralı ekle</Btn>
      </div>
      <p className="m-0 mt-2 text-xs text-mute">Yeni kurallar her zaman "Yalnız öner" ile başlar; güvenle çalıştığını gördükten sonra düzeyi yükseltebilirsiniz.</p>
    </Card>
  )
}

export function Rules() {
  const { role, notify, record } = useStore()
  const ro = !ROLES[role].ops
  const [rules, setRules] = useState(RULES0)
  const [openId, setOpenId] = useState<string | null>(null)
  const [pending, setPending] = useState<{ id: string; level: Level } | null>(null)
  const [build, setBuild] = useState(false)
  const upd = (id: string, p: Partial<Rule>) => setRules(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)))
  const open = rules.find(r => r.id === openId)
  const change = (r: Rule, level: Level) => {
    if (level === r.level) return
    if (level === 'oto' && r.money) { notify('Para hareketi veya fiyat değiştiren kural kendiliğinden çalışamaz; en çok "Önce sor" seçilebilir.'); return }
    if (level === 'oto') { setPending({ id: r.id, level }); return }
    upd(r.id, { level }); record('Kural', `Onay düzeyi değişti: ${LEVEL[r.level].label} → ${LEVEL[level].label}`, r.name); notify(`"${r.name}": ${LEVEL[level].label}`)
  }
  const pr = pending && rules.find(r => r.id === pending.id)
  const LevelSel = ({ r }: { r: Rule }) => (
    <select className={sel} aria-label={`${r.name} onay düzeyi`} disabled={ro} value={r.level} onChange={e => change(r, e.target.value as Level)}>
      {(Object.keys(LEVEL) as Level[]).map(l => <option key={l} value={l}>{LEVEL[l].label}</option>)}</select>
  )
  return (
    <>
      <PageHead title="Otomasyon kuralları" desc="Sistem neyi, ne zaman, ne kadar özgürlükle yapacak. Her kuralın bir onay düzeyi ve bir üst sınırı var; hepsi günlükte görünür."
        actions={<Btn variant="primary" disabled={ro} onClick={() => setBuild(true)}><Plus size={14} />Yeni kural</Btn>} />
      <Strip />
      {ro && <div className="mb-3 rounded-lg border border-line bg-warn-soft text-warn px-3 py-2 text-sm">Bu rolle kurallar yalnız görüntülenir; değiştirmek için operasyon yetkisi gerekir.</div>}
      {build && <Builder onClose={() => setBuild(false)} onAdd={r => { if (rules.some(x => x.event === r.event && x.cond === r.cond && x.action === r.action)) return notify('Aynı olay, koşul ve işlemle bir kural zaten var'); setRules(rs => [{ ...r, id: r.id + '-' + Date.now() }, ...rs]); setBuild(false); record('Kural', 'Yeni kural eklendi (Yalnız öner)', r.name); notify('Kural eklendi (Yalnız öner)') }} />}
      {pr && pending && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-warn-soft text-warn px-3 py-2 text-sm" role="alert">
          <span className="flex-1 min-w-[220px]">"{pr.name}" kuralı artık onay sormadan, sınır içinde (en çok {pr.limit} {pr.unit}) çalışacak. Emin misiniz?</span>
          <Btn variant="primary" onClick={() => { upd(pr.id, { level: pending.level }); record('Kural', 'Kural kendiliğinden çalışacak şekilde açıldı', pr.name); setPending(null); notify(`"${pr.name}": Kendiliğinden`) }}>Evet, aç</Btn>
          <Btn onClick={() => setPending(null)}>Vazgeç</Btn>
        </div>
      )}
      <div className="space-y-4">
        {AREAS.map(area => {
          const list = rules.filter(r => r.area === area)
          return list.length === 0 ? null : (
            <Card key={area} title={area} pad={false} right={<span className="num text-xs text-mute mr-1">{list.filter(r => r.on).length} / {list.length} açık</span>}>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>
                <th className={th}>Açık</th><th className={th}>Kural</th><th className={th}>Olay → koşul → işlem</th><th className={th}>Onay düzeyi</th><th className={th}>Üst sınır</th><th className={th}>Son çalışma</th></tr></thead>
                <tbody>{list.map(r => (
                  <tr key={r.id} className={r.on ? '' : 'opacity-60'}>
                    <td className={td}><Switch on={r.on} disabled={ro} label={`${r.name} kuralını ${r.on ? 'kapat' : 'aç'}`} onChange={v => { upd(r.id, { on: v }); record('Kural', `Kural ${v ? 'açıldı' : 'kapatıldı'}`, r.name); notify(`"${r.name}" ${v ? 'açıldı' : 'kapatıldı'}`) }} /></td>
                    <td className={td + ' min-w-[170px]'}><button className="text-left font-medium text-brand hover:underline bg-transparent border-0 p-0 cursor-pointer" onClick={() => setOpenId(r.id)}>{r.name}</button>
                      <div className="flex gap-1 mt-0.5">{r.money && <Badge tone="violet" title="Para veya fiyat etkiler">para / fiyat</Badge>}{r.custom && <Badge tone="info">yeni</Badge>}</div></td>
                    <td className={td + ' min-w-[260px] text-ink2'}><b className="font-medium text-ink">{r.event}</b> · {r.cond} → {r.action}</td>
                    <td className={td}><LevelSel r={r} /></td>
                    <td className={td + ' num whitespace-nowrap'}>en çok {r.limit} {r.unit}</td>
                    <td className={td + ' text-xs text-ink2 min-w-[180px]'}>{r.last}</td></tr>))}</tbody></table></div>
            </Card>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-mute">Çalışma sayıları örnektir; bu ekran örnek veriyle çalışır.</p>
      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.name} sub={open?.area}
        footer={open && <><Btn disabled={ro} onClick={() => { upd(open.id, { on: !open.on }); notify(`"${open.name}" ${open.on ? 'kapatıldı' : 'açıldı'}`) }}>{open.on ? 'Kuralı kapat' : 'Kuralı aç'}</Btn><Btn variant="ghost" onClick={() => setOpenId(null)}>Kapat</Btn></>}>
        {open && <>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-mute">Olay</dt><dd className="m-0">{open.event}</dd><dt className="text-mute">Koşul</dt><dd className="m-0">{open.cond}</dd>
            <dt className="text-mute">İşlem</dt><dd className="m-0">{open.action}</dd><dt className="text-mute">Üst sınır</dt><dd className="m-0 num">tek seferde en fazla {open.limit} {open.unit}</dd>
            <dt className="text-mute">Onay düzeyi</dt><dd className="m-0 flex flex-wrap items-center gap-2"><LevelSel r={open} /><Badge tone={LEVEL[open.level].tone}>{LEVEL[open.level].label}</Badge></dd>
            <dt className="text-mute">Anlamı</dt><dd className="m-0 text-ink2">{LEVEL[open.level].hint}</dd>
            <dt className="text-mute">Son 7 gün</dt><dd className="m-0">{open.last}</dd>
          </dl>
          <div><h3 className="m-0 mb-2 text-sm font-semibold">Çalışma geçmişi <Badge>örnek</Badge></h3>{open.custom ? <p className="text-sm text-mute m-0">Bu kural henüz çalışmadı.</p> : <History rule={open} />}</div>
        </>}
      </Drawer>
    </>
  )
}

interface Anom { id: string; sev: 'bad' | 'warn' | 'info'; t: number; text: string; next: string; href: string; demo?: boolean }
const SEV: Record<Anom['sev'], [Tone, string]> = { bad: ['bad', 'Acil'], warn: ['warn', 'Dikkat'], info: ['info', 'Bilgi'] }

export function Alerts() {
  const { orders, accounts, jobs, notify, role } = useStore()
  const ro = !ROLES[role].ops
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState<Set<string>>(new Set())
  const [set, setSet] = useState({ mail: true, panel: true, hour: '08:00' })
  const s = useMemo(() => {
    const today = dayKey(NOW), yest = dayKey(NOW - 24 * 3600_000)
    return {
      today: orders.filter(o => dayKey(o.t) === today).length, yest: orders.filter(o => dayKey(o.t) === yest).length,
      ship: orders.filter(toShip).length, late: orders.filter(overdue).length, issue: orders.filter(hasIssue).length,
      ret: orders.filter(o => o.ret && o.ret !== 'cozuldu').length, failed: jobs.filter(j => j.status === 'basarisiz').length,
      bad: accounts.filter(a => a.health !== 'ok'),
    }
  }, [orders, jobs, accounts])
  const items: Anom[] = [
    ...s.bad.map<Anom>(a => ({ id: 'acc-' + a.id, sev: a.health === 'partial' ? 'warn' : 'bad', t: a.lastSync, text: `${a.name}: ${a.note ?? 'eşitleme sorunu'}`, next: 'Kanal sağlığına bakın, gerekirse elle eşitleyin.', href: '#/channels' })),
    ...(s.failed ? [{ id: 'jobs', sev: 'bad', t: NOW - 3600_000, text: `${fmtNum(s.failed)} eşitleme işi başarısız bitti`, next: 'Eşitleme kuyruğunda yeniden deneyin.', href: '#/sync' } as Anom] : []),
    ...(s.late ? [{ id: 'late', sev: 'warn', t: NOW - 1800_000, text: `${fmtNum(s.late)} sipariş 48 saati geçti, hâlâ kargoda değil`, next: 'Geciken siparişleri açıp etiket oluşturun.', href: '#/orders?view=overdue' } as Anom] : []),
    ...(s.ret ? [{ id: 'ret', sev: 'info', t: NOW - 7200_000, text: `${fmtNum(s.ret)} açık iade işlem bekliyor`, next: 'İade aşamalarını ilerletin.', href: '#/returns' } as Anom] : []),
    { id: 'd1', sev: 'warn', t: NOW - 3 * 3600_000, text: 'Kaufland\'da 3 saattir sipariş yok (normalde saatte 2)', next: 'Kanal bağlantısını ve ilan durumunu kontrol edin.', href: '#/channels', demo: true },
    { id: 'd2', sev: 'warn', t: NOW - 5 * 3600_000, text: 'İade oranı parfüm kategorisinde %4\'ten %11\'e çıktı', next: 'Son iade nedenlerine bakın.', href: '#/returns', demo: true },
    { id: 'd3', sev: 'bad', t: NOW - 2 * 3600_000, text: 'Eksi stoklu 4 ürün', next: 'Sayım yapıp stoğu düzeltin.', href: '#/catalog?view=negatif', demo: true },
    { id: 'd4', sev: 'info', t: NOW - 9 * 3600_000, text: 'Stok hareketleri bu hafta ortalamanın %30 üstünde', next: 'Stok defterini inceleyin.', href: '#/stock', demo: true },
  ]
  const shown = items.filter(i => !muted.has(i.id)).sort((a, b) => ['bad', 'warn', 'info'].indexOf(a.sev) - ['bad', 'warn', 'info'].indexOf(b.sev))
  const add = (st: Set<string>, id: string) => new Set(st).add(id)
  const rows: [string, string][] = [['E-posta ile gönder', 'mail'], ['Panel bildirimi göster', 'panel']]
  return (
    <>
      <PageHead title="Uyarılar ve günlük özet" desc="Gün başında bakılacak tek yer: bugünün durumu, olağan dışı şeyler ve bildirimlerin nereye gideceği." />
      <Card title="Günlük özet" right={<span className="text-xs text-mute num">{fmtDT(NOW)}</span>} className="mb-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Bugün gelen sipariş" value={fmtNum(s.today)} hint={`dün ${fmtNum(s.yest)}`} />
          <Stat label="Kargoya verilecek" value={fmtNum(s.ship)} href="#/orders" />
          <Stat label="Geciken" value={fmtNum(s.late)} tone={s.late ? 'bad' : 'ok'} href="#/orders?view=overdue" />
          <Stat label="Sorunlu sipariş" value={fmtNum(s.issue)} tone={s.issue ? 'warn' : 'ok'} href="#/orders" />
          <Stat label="Açık iade" value={fmtNum(s.ret)} href="#/returns" />
          <Stat label="Başarısız eşitleme" value={fmtNum(s.failed)} tone={s.failed ? 'bad' : 'ok'} href="#/sync" />
          <Stat label="Sorunlu hesap" value={`${fmtNum(s.bad.length)} / ${fmtNum(accounts.length)}`} tone={s.bad.length ? 'warn' : 'ok'} href="#/channels" />
        </div>
      </Card>
      <Card title="Olağan dışı durumlar" right={muted.size > 0 ? <Btn variant="ghost" onClick={() => setMuted(new Set())}>{muted.size} susturulanı geri getir</Btn> : undefined} className="mb-4" pad={false}>
        <ul className="m-0 list-none p-0">{shown.map(i => (
          <li key={i.id} className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line px-4 py-3 ${seen.has(i.id) ? 'opacity-60' : ''}`}>
            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-1.5"><Badge tone={SEV[i.sev][0]}>{SEV[i.sev][1]}</Badge>{i.demo && <Badge>örnek</Badge>}<span className="text-xs text-mute num">{ago(i.t)}</span></div>
              <div className="mt-1 font-medium">{i.text}</div>
              <div className="text-xs text-ink2 mt-0.5">Öneri: {i.next} <a href={i.href} className="text-brand whitespace-nowrap">Aç <ArrowRight size={12} className="inline" aria-hidden /></a></div>
            </div>
            <div className="flex gap-2"><Btn disabled={seen.has(i.id)} onClick={() => setSeen(add(seen, i.id))}>{seen.has(i.id) ? 'Görüldü' : 'Gördüm'}</Btn>
              <Btn variant="ghost" onClick={() => { setMuted(add(muted, i.id)); notify('Bu oturum için susturuldu') }}>Sustur (bu oturum)</Btn></div>
          </li>))}
          {shown.length === 0 && <li className="border-t border-line px-4 py-8 text-center text-mute">Şu an açık uyarı yok.</li>}
        </ul>
      </Card>
      <Card title="Bildirim ayarları">
        {ro && <p className="m-0 mb-2 text-xs text-warn">Bu rolle ayarlar yalnız görüntülenir.</p>}
        <div className="space-y-2.5 text-sm">
          {rows.map(([l, k]) => (
            <div key={k} className="flex items-center justify-between gap-3"><span>{l}</span>
              <Switch on={set[k as 'mail' | 'panel']} disabled={ro} label={l} onChange={v => { setSet({ ...set, [k]: v }); notify(`${l}: ${v ? 'açık' : 'kapalı'}`) }} /></div>))}
          <div className="flex items-center justify-between gap-3"><label htmlFor="sabah">Sabah özeti saati</label>
            <select id="sabah" className={sel + ' num'} disabled={ro} value={set.hour} onChange={e => { setSet({ ...set, hour: e.target.value }); notify(`Sabah özeti ${e.target.value}`) }}>
              {['07:00', '08:00', '09:00', '10:00'].map(h => <option key={h}>{h}</option>)}</select></div>
        </div>
      </Card>
      <p className="mt-3 text-xs text-mute">"örnek" etiketli uyarılar gösterim amaçlıdır; diğerleri paneldeki verilerden hesaplanır.</p>
    </>
  )
}
