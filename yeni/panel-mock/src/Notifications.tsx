import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowRight, Bell, BellOff, CheckCheck, CircleCheck, Clock, ListTodo, MoreHorizontal, Settings2, Sparkles, UserCheck, X } from 'lucide-react'
import { NOW, account, ago, dayKey, fmtNum, hasIssue, isOpen, overdue, toShip, type Order } from './data'
import { ROLES, useStore } from './store'

/* Bildirim merkezi. Panel kendiliğinden üç şey söyler:
   - "oldu"    : bilgi; bir şey yapmak gerekmez
   - "olmadi"  : bir şey bozuldu ya da takıldı
   - "yap"     : kullanıcıyı bekleyen bir iş
   Bildirimler her çizimde panel verisinden hesaplanır; sorun düzelince bildirim kendiliğinden kapanır
   ve "çözülenler" altında görünür. Okundu, erteleme ve sahiplenme bilgisi bu tarayıcıda saklanır.
   Metinlerde müşteri adı ya da iletişim bilgisi geçmez; yalnız sayılar ve hesap adları. */

type Kind = 'oldu' | 'olmadi' | 'yap'
interface Note { id: string; kind: Kind; title: string; detail?: string; t: number; n: number; week?: boolean; href: string; cta: string; ask?: string }
type Tab = 'hepsi' | 'yap' | 'olmadi' | 'oldu'
interface Saved { read: string[]; snooze: Record<string, number>; owned: Record<string, string>; quiet: boolean; digest: boolean }
const KEY = 'wawi-mock-notif'
const EMPTY: Saved = { read: [], snooze: {}, owned: {}, quiet: false, digest: true }
const load = (): Saved => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return EMPTY } }
const H = 3600_000
const STYLE: Record<Kind, { icon: typeof Bell; cls: string; label: string }> = {
  yap: { icon: ListTodo, cls: 'bg-brand-soft text-brand', label: 'Yapılacak' },
  olmadi: { icon: AlertTriangle, cls: 'bg-bad-soft text-bad', label: 'Sorun' },
  oldu: { icon: CircleCheck, cls: 'bg-ok-soft text-ok', label: 'Bilgi' },
}

export default function Notifications({ open, setOpen, onAsk }: { open: boolean; setOpen: (f: (o: boolean) => boolean) => void; onAsk: (text: string) => void }) {
  const st = useStore()
  const R = ROLES[st.role]
  const [tab, setTab] = useState<Tab>('hepsi')
  const [saved, setSaved] = useState<Saved>(load)
  const [menu, setMenu] = useState<string | null>(null)
  const [conf, setConf] = useState(false)
  const [resolved, setResolved] = useState<{ id: string; title: string }[]>([])
  const box = useRef<HTMLDivElement>(null)
  const put = (f: (s: Saved) => Saved) => setSaved(s => { const n = f(s); try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* özel pencere */ } return n })

  // ---- bildirimler: o anki kapsamdaki (şirket, depo, rol) veriden hesaplanır ----
  const notes = useMemo<Note[]>(() => {
    const out: Note[] = []
    const add = (n: Note | false | 0) => { if (n) out.push(n) }
    const o = st.orders, ids = new Set(st.accounts.map(a => a.id))
    const oldest = (l: Order[]) => l.reduce((a, x) => Math.min(a, x.t), NOW)

    if (R.ops) {
      const late = o.filter(overdue)
      add(late.length > 0 && { id: 'gecikme', kind: 'yap', n: late.length, t: NOW - 20 * 60_000, title: `${fmtNum(late.length)} sipariş 2 günü aştı`, detail: `En eskisi ${(h => h >= 48 ? `${Math.round(h / 24)} gündür` : `${Math.round(h)} saattir`)((NOW - oldest(late)) / H)} bekliyor. Pazaryeri sevk süresi dolabilir.`, href: '#/orders?view=overdue', cta: 'Siparişleri aç', ask: 'Geciken siparişler hangileri?' })
      const lab = o.filter(x => toShip(x) && x.supply === 'fiziki' && x.label === 'yok' && !x.issue)
      add(lab.length > 0 && { id: 'etiket-bekleyen', kind: 'yap', n: lab.length, t: NOW - 35 * 60_000, title: `${fmtNum(lab.length)} sipariş etiket bekliyor`, detail: 'Ödemesi tamam, stoğu var, adresi eksiksiz.', href: '#/labels', cta: 'Etiketlere git', ask: 'Ödenmiş siparişlerin etiketlerini hazırla' })
      const came = o.filter(x => x.ret === 'geldi')
      add(came.length > 0 && { id: 'iade-kontrol', kind: 'yap', n: came.length, t: NOW - 3 * H, title: `${fmtNum(came.length)} iade ürünü geldi, kontrol bekliyor`, detail: 'Kontrol edilince stoğa döner ve ödeme adımı açılır.', href: '#/returns', cta: 'İadeleri aç' })
      const unc = st.products.reduce((s, p) => s + Object.values(p.stock).filter(r => r && r.fiziki === null).length, 0)
      add(unc > 0 && { id: 'sayim-yok', kind: 'yap', n: unc, week: true, t: NOW - 30 * H, title: `${fmtNum(unc)} depo kaydı hiç sayılmadı`, detail: 'Sayılmamış ürün sıfır stok sayılmaz; kanallara açılamaz.', href: '#/counting', cta: 'Sayım planı' })

      const failed = st.jobs.filter(j => j.status === 'basarisiz' && (j.acc === null || ids.has(j.acc)))
      if (failed.length) {
        const first = failed[0].acc ? account(failed[0].acc).name : 'Sistem'
        add({ id: 'esitleme', kind: 'olmadi', n: failed.length, t: Math.max(...failed.map(j => j.last)), title: failed.length === 1 ? `${first}: eşitleme başarısız` : `${first} ve ${fmtNum(failed.length - 1)} iş daha eşitlenemedi`, detail: failed[0].msg ?? failed[0].kind, href: '#/sync', cta: 'Eşitleme işleri', ask: 'Kanallarda sorun var mı?' })
      }
      const res = new Map<string, number>()
      for (const x of o) if (isOpen(x) && x.supply === 'fiziki') for (const i of x.items) res.set(i.pid + '|' + x.wh, (res.get(i.pid + '|' + x.wh) ?? 0) + i.qty)
      let neg = 0
      for (const p of st.products) for (const [wh, r] of Object.entries(p.stock)) if (r && r.fiziki !== null && r.fiziki - (res.get(p.id + '|' + wh) ?? 0) < 0) neg++
      add(neg > 0 && { id: 'eksi-stok', kind: 'olmadi', n: neg, t: NOW - 2 * H, title: `${fmtNum(neg)} üründe satılabilir stok eksiye düştü`, detail: 'Açık siparişler eldeki sayılmış stoktan fazla; fazla satış riski.', href: '#/reservations', cta: 'Stok ayırma', ask: 'Stokta risk var mı?' })
      const lerr = o.filter(x => x.label === 'hata' && isOpen(x))
      add(lerr.length > 0 && { id: 'etiket-hata', kind: 'olmadi', n: lerr.length, t: NOW - 50 * 60_000, title: `${fmtNum(lerr.length)} siparişin etiketi oluşturulamadı`, detail: 'Çoğunlukla adres eksikliği; düzeltip yeniden deneyin.', href: '#/labels', cta: 'Etiketlere git' })
    }
    const stale = st.accounts.filter(a => a.health !== 'ok')
    add(stale.length > 0 && { id: 'kanal', kind: 'olmadi', n: stale.length, week: true, t: Math.max(...stale.map(a => a.lastSync)), title: stale.length === 1 ? `${stale[0].name}: bağlantı sorunu` : `${stale[0].name} ve ${fmtNum(stale.length - 1)} hesapta daha bağlantı sorunu`, detail: stale[0].note ?? 'Son eşitleme tamamlanmadı.', href: '#/channels', cta: 'Kanalları aç' })
    const iss = o.filter(hasIssue)
    add(iss.length > 0 && { id: 'sorunlu', kind: 'olmadi', n: iss.length, t: NOW - 90 * 60_000, title: `${fmtNum(iss.length)} siparişte sorun var`, detail: 'Adres, stok ya da ödeme sorunu; her biri ayrı ele alınmalı.', href: '#/orders?view=issue', cta: 'Sorunluları aç' })
    const wait = st.tickets.filter(t => t.status === 'open' && NOW - t.t > 24 * H)
    add(wait.length > 0 && { id: 'destek', kind: 'yap', n: wait.length, t: NOW - 4 * H, title: `${fmtNum(wait.length)} müşteri sorusu 24 saattir yanıtsız`, detail: 'Pazaryerleri yanıt süresini puanlar.', href: '#/support', cta: 'Desteği aç', ask: 'Bekleyen müşteri sorusuna yanıt taslağı yaz' })

    if (R.finance) {
      const pend = o.filter(x => x.pay === 'bekliyor' && isOpen(x))
      add(pend.length > 0 && { id: 'havale', kind: 'yap', n: pend.length, t: NOW - 5 * H, title: `${fmtNum(pend.length)} siparişin ödemesi eşleşme bekliyor`, detail: 'Gelen havaleleri siparişlerle eşleştirin.', href: '#/bank', cta: 'Banka mutabakatı' })
    }

    // bilgi: olanlar
    const perDay = new Map<string, number>()
    for (const x of o) perDay.set(dayKey(x.t), (perDay.get(dayKey(x.t)) ?? 0) + 1)
    const yk = dayKey(NOW - 24 * H), yn = perDay.get(yk) ?? 0, max = Math.max(0, ...perDay.values())
    add(yn > 0 && { id: 'dun', kind: 'oldu', n: yn, t: NOW - 16 * H, title: `Dün ${fmtNum(yn)} sipariş geldi`, detail: yn === max ? 'Son 30 günün en yüksek günü.' : `Son 30 günün en yükseği ${fmtNum(max)}.`, href: '#/overview', cta: 'Genel bakış' })
    const days = [...perDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(e => e[1])
    const w1 = days.slice(1, 8).reduce((s, v) => s + v, 0), w0 = days.slice(8, 15).reduce((s, v) => s + v, 0)
    add(w1 > 0 && w0 > 0 && { id: 'hafta', kind: 'oldu', n: w1, week: true, t: NOW - 26 * H, title: `Son 7 günde ${fmtNum(w1)} sipariş`, detail: `Önceki 7 güne göre ${w1 >= w0 ? '+' : '−'}%${Math.abs(Math.round((w1 - w0) / w0 * 100))}.`, href: '#/shifts', cta: 'Saatlik dağılım' })
    const shippedToday = o.filter(x => x.status === 'kargoda' && x.tracking).length
    add(R.ops && shippedToday > 0 && { id: 'kargoda', kind: 'oldu', n: shippedToday, t: NOW - 70 * 60_000, title: `${fmtNum(shippedToday)} sipariş kargoda`, detail: 'Takip numaraları kanallara gönderildi.', href: '#/orders?view=shipped', cta: 'Kargodakiler' })
    const byBot = st.audit.filter(a => a.user.includes('asistan aracılığıyla'))
    add(byBot.length > 0 && { id: 'asistan', kind: 'oldu', n: byBot.length, t: NOW - 60_000, title: `Asistan ${fmtNum(byBot.length)} işlem yaptı`, detail: byBot[0].event, href: '#/audit', cta: 'Denetim kaydı' })
    const undone = st.audit.filter(a => a.cat === 'Geri alma')
    add(undone.length > 0 && { id: 'geri-alma', kind: 'oldu', n: undone.length, t: NOW - 30_000, title: `${fmtNum(undone.length)} işlem geri alındı`, detail: undone[0].event, href: '#/audit', cta: 'Denetim kaydı' })
    return out.sort((a, b) => b.t - a.t)
  }, [st.orders, st.accounts, st.jobs, st.tickets, st.products, st.audit, R])

  // sorun düzelince: listeden düşen "yap" ve "olmadı" bildirimleri çözülenlere geçer
  const prev = useRef<Map<string, Note>>(new Map())
  const scope = useRef('')
  useEffect(() => {
    const now = new Map(notes.map(n => [n.id, n]))
    // Şirket, depo ya da rol değişince listeden düşenler çözülmüş değildir; yalnız görünmüyordur.
    const key = `${st.companyId}|${st.whId}|${st.role}`
    if (scope.current !== key) { scope.current = key; prev.current = now; return }
    const gone = [...prev.current.values()].filter(n => n.kind !== 'oldu' && !now.has(n.id))
    if (gone.length) setResolved(r => [...gone.map(n => ({ id: n.id + Date.now(), title: n.title })), ...r].slice(0, 5))
    prev.current = now
  }, [notes]) // eslint-disable-line react-hooks/exhaustive-deps

  const sig = (n: Note) => n.id + '|' + n.n // sayı değişirse bildirim yeniden okunmamış olur
  const live = notes.filter(n => !(saved.snooze[n.id] > Date.now()))
  const unread = live.filter(n => !saved.read.includes(sig(n)))
  const shown = live.filter(n => tab === 'hepsi' || n.kind === tab)
  const count = (k: Tab) => live.filter(n => k === 'hepsi' || n.kind === k).length
  const read = (n: Note) => put(s => (s.read.includes(sig(n)) ? s : { ...s, read: [...s.read.filter(x => !x.startsWith(n.id + '|')), sig(n)] }))

  useEffect(() => {
    if (!open) return
    const out = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(() => false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(() => false) }
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc) }
  }, [open, setOpen])

  const row = (n: Note) => {
    const S = STYLE[n.kind], isNew = !saved.read.includes(sig(n)), owner = saved.owned[n.id]
    return (
      <li key={n.id} className={`relative px-3 py-2.5 flex gap-2.5 ${isNew ? 'bg-brand-soft/35' : ''}`} onMouseEnter={() => isNew && read(n)}>
        <span className={`size-8 rounded-full grid place-items-center shrink-0 ${S.cls}`}><S.icon size={15} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2"><p className={`m-0 flex-1 text-[13.5px] leading-snug ${isNew ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>{isNew && <span className="mt-1.5 size-2 rounded-full bg-brand shrink-0" aria-label="Okunmadı" />}</div>
          {n.detail && <p className="m-0 mt-0.5 text-xs text-ink2 text-pretty">{n.detail}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <a href={n.href} onClick={() => { read(n); setOpen(() => false) }} className="inline-flex items-center gap-1 rounded-md border border-line bg-card px-2 h-6 text-ink no-underline hover:border-brand">{n.cta}<ArrowRight size={11} /></a>
            {n.ask && <button onClick={() => { read(n); setOpen(() => false); onAsk(n.ask!) }} className="inline-flex items-center gap-1 rounded-md border border-line bg-card px-2 h-6 text-brand hover:border-brand"><Sparkles size={11} />Asistana hazırlat</button>}
            {owner && <span className="inline-flex items-center gap-1 text-ok"><UserCheck size={12} />{owner} ilgileniyor</span>}
            <span className="ml-auto text-mute whitespace-nowrap">{ago(n.t)}</span>
            {n.kind !== 'oldu' && <button onClick={() => setMenu(m => (m === n.id ? null : n.id))} aria-label="Diğer seçenekler" aria-expanded={menu === n.id} className="border-0 bg-transparent p-0.5 text-mute hover:text-ink rounded"><MoreHorizontal size={15} /></button>}
          </div>
          {menu === n.id && (
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
              <button onClick={() => { put(s => ({ ...s, owned: owner ? Object.fromEntries(Object.entries(s.owned).filter(([k]) => k !== n.id)) : { ...s.owned, [n.id]: R.user } })); setMenu(null) }} className="inline-flex items-center gap-1 rounded-md border border-line bg-bg px-2 h-6"><UserCheck size={12} />{owner ? 'Bırak' : 'Ben alıyorum'}</button>
              <button onClick={() => { put(s => ({ ...s, snooze: { ...s.snooze, [n.id]: Date.now() + H } })); setMenu(null); st.notify('1 saat sonra yeniden hatırlatılacak') }} className="inline-flex items-center gap-1 rounded-md border border-line bg-bg px-2 h-6"><Clock size={12} />1 saat ertele</button>
              <button onClick={() => { put(s => ({ ...s, snooze: { ...s.snooze, [n.id]: Date.now() + 18 * H } })); setMenu(null); st.notify('Yarın sabah yeniden hatırlatılacak') }} className="inline-flex items-center gap-1 rounded-md border border-line bg-bg px-2 h-6"><Clock size={12} />Yarın sabah</button>
            </div>)}
        </div>
      </li>
    )
  }
  const today = shown.filter(n => !n.week), week = shown.filter(n => n.week)
  const snoozed = notes.length - live.length

  return (
    <div className="relative" ref={box}>
      <button onClick={() => setOpen(o => !o)} aria-label={`Bildirimler${unread.length ? `, ${unread.length} okunmamış` : ''}`} aria-expanded={open} className={`relative border rounded-md size-8 grid place-items-center ${open ? 'bg-brand-soft border-brand text-brand' : 'bg-card border-line text-ink2'}`}>
        {saved.quiet ? <BellOff size={16} /> : <Bell size={16} />}
        {unread.length > 0 && !saved.quiet && <span className="num absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-bad text-white text-[11px] font-semibold grid place-items-center">{unread.length}</span>}
      </button>
      {open && (
        <div role="dialog" aria-label="Bildirimler" style={{ top: box.current ? box.current.getBoundingClientRect().bottom + 8 : 56 }} className="fixed z-50 inset-x-2 sm:left-auto sm:right-3 sm:w-[420px] rounded-2xl border border-line bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 h-11 border-b border-line">
            <b className="text-sm font-semibold flex-1">Bildirimler</b>
            <button onClick={() => put(s => ({ ...s, read: live.map(sig) }))} disabled={!unread.length} className="inline-flex items-center gap-1 border-0 bg-transparent text-xs text-brand disabled:text-mute"><CheckCheck size={13} />Tümünü okundu say</button>
            <button onClick={() => setConf(c => !c)} aria-label="Bildirim ayarları" aria-expanded={conf} className="border-0 bg-transparent p-1 text-ink2 rounded hover:bg-bg"><Settings2 size={15} /></button>
            <button onClick={() => setOpen(() => false)} aria-label="Kapat" className="border-0 bg-transparent p-1 text-ink2 rounded hover:bg-bg"><X size={16} /></button>
          </div>
          {conf && (
            <div className="px-3 py-2.5 border-b border-line bg-bg text-xs space-y-1.5">
              {([['quiet', 'Sessiz mod', 'Okunmamış sayısı gizlenir; liste yine dolar.'], ['digest', 'Sabah özeti', 'Her sabah 08:00’de tek bir özet (gerçek sistemde e-posta).']] as const).map(([k, l, d]) => (
                <label key={k} className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={saved[k]} onChange={e => put(s => ({ ...s, [k]: e.target.checked }))} className="mt-0.5" /><span><b className="font-medium text-ink">{l}</b><span className="block text-mute">{d}</span></span></label>))}
              <p className="m-0 text-mute">Yalnız {R.label} rolünü ilgilendiren bildirimler gösterilir. Bildirimlerde müşteri adı ve adresi geçmez.</p>
            </div>)}
          <div className="flex gap-1 px-2 py-2 border-b border-line overflow-x-auto" role="tablist" aria-label="Bildirim türü">
            {([['hepsi', 'Hepsi'], ['yap', 'Yapılacaklar'], ['olmadi', 'Sorunlar'], ['oldu', 'Olanlar']] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`shrink-0 rounded-full border px-2.5 h-7 text-xs font-medium ${tab === k ? 'bg-ink text-bg border-ink' : 'bg-card border-line text-ink2 hover:bg-bg'}`}>{l} <span className="num opacity-70">{count(k)}</span></button>))}
          </div>
          <div className="max-h-[62vh] overflow-y-auto">
            {shown.length === 0 && <p className="m-0 px-4 py-8 text-center text-sm text-mute">Bu başlıkta bildirim yok.</p>}
            {today.length > 0 && <><h3 className="m-0 px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-mute">Bugün</h3><ul className="m-0 p-0 list-none divide-y divide-line">{today.map(row)}</ul></>}
            {week.length > 0 && <><h3 className="m-0 px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-mute">Bu hafta</h3><ul className="m-0 p-0 list-none divide-y divide-line">{week.map(row)}</ul></>}
            {resolved.length > 0 && tab !== 'oldu' && <><h3 className="m-0 px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-mute">Çözülenler</h3>
              <ul className="m-0 p-0 list-none">{resolved.map(r => <li key={r.id} className="px-3 py-1.5 flex items-center gap-2 text-xs text-mute"><CircleCheck size={14} className="text-ok shrink-0" /><span className="line-through">{r.title}</span></li>)}</ul></>}
          </div>
          <div className="px-3 py-2 border-t border-line text-[11px] text-mute flex justify-between gap-2">
            <span>Bildirimler panel verisinden hesaplanır; sorun düzelince kendiliğinden kapanır.</span>
            {snoozed > 0 && <button onClick={() => put(s => ({ ...s, snooze: {} }))} className="border-0 bg-transparent p-0 text-brand whitespace-nowrap">{snoozed} ertelenen</button>}
          </div>
        </div>)}
    </div>
  )
}
