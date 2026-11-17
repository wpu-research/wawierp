import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, BadgePercent, BellRing, Boxes, Building2, CalendarClock, ClipboardCheck, Code2, CreditCard, FileSpreadsheet, FileText, Landmark, Languages, ChevronRight, LayoutDashboard, LifeBuoy, Lightbulb, ListChecks, Menu, MessagesSquare, Moon, Package, PackagePlus, RefreshCw, Rocket, RotateCcw, ScanSearch, ScrollText, Search, Send, ShieldCheck, ShoppingCart, Smartphone, Store, Sun, Tag, TrendingUp, Truck, Tv, Undo2, UserRound, Users, Workflow, X } from 'lucide-react'
import { COMPANIES, WAREHOUSES, account, toShip, type WhId } from './data'
import { ROLES, StoreProvider, useStore, type Role } from './store'
import { PageIcon, sel, useDialog } from './ui'
import { Logo } from './logo'
import Agent from './Agent'
import Notifications from './Notifications'
import Sidebar, { type NavGroup } from './Sidebar'
import { ChatProvider, Feedback, Messages, useChat } from './Chat'
import Overview from './pages/Overview'
import Orders from './pages/Orders'
import Catalog, { Stock } from './pages/Catalog'
import Channels, { Sync } from './pages/Channels'
import Finance, { Returns } from './pages/Finance'
import { AuditLog, Team } from './pages/Admin'
import { B2BPage, Labels, Support, Transfers } from './pages/Extra'
import { Alerts, Rules } from './pages/Automation'
import { Counting, Picking, Shifts } from './pages/Warehouse'
import { ListingWizard, PriceRules, Replenish } from './pages/Selling'
import { ContentStudio, QualityQueue } from './pages/Quality'
import { Accounting, BankMatch, Profit } from './pages/Money'
import { Billing, Developers, Onboarding, Status } from './pages/Platform'
import { Reservations } from './pages/Reservations'
import { CustomerPortal, ReturnForm } from './pages/Portal'
import { MobileDepot } from './pages/Mobile'
import Wall from './pages/Wall'

const HOME = location.protocol === 'file:' ? 'index.html' : '/'

const NAV: NavGroup[] = [
  { group: '', items: [{ key: 'overview', label: 'Genel bakış', icon: LayoutDashboard }, { key: 'messages', label: 'Mesajlar', icon: MessagesSquare }] },
  { group: 'Günlük iş', items: [
    { key: 'wall', label: 'Duvar ekranı', icon: Tv }, { key: 'orders', label: 'Siparişler', icon: ShoppingCart }, { key: 'picking', label: 'Toplama listesi', icon: ListChecks }, { key: 'mobile', label: 'Mobil depo', icon: Smartphone }, { key: 'labels', label: 'Kargo etiketleri', icon: Tag },
    { key: 'returns', label: 'İadeler', icon: RotateCcw }, { key: 'support', label: 'Destek', icon: LifeBuoy },
  ] },
  { group: 'Ürün ve stok', items: [
    { key: 'catalog', label: 'Katalog', icon: Package }, { key: 'quality', label: 'Veri kalitesi', icon: ScanSearch }, { key: 'content', label: 'Ürün metni ve çeviri', icon: Languages },
    { key: 'stock', label: 'Stok defteri', icon: Boxes }, { key: 'reservations', label: 'Stok ayırma', icon: ShieldCheck }, { key: 'counting', label: 'Sayım planı', icon: ClipboardCheck }, { key: 'replenish', label: 'Tedarik önerileri', icon: PackagePlus },
    { key: 'transfers', label: 'Depo transferi', icon: Truck },
  ] },
  { group: 'Satış kanalları', items: [
    { key: 'channels', label: 'Kanallar', icon: Store }, { key: 'listing', label: 'Toplu listeleme', icon: Send }, { key: 'prices', label: 'Fiyat kuralları', icon: BadgePercent }, { key: 'sync', label: 'Eşitleme işleri', icon: RefreshCw },
  ] },
  { group: 'Para', items: [
    { key: 'finance', label: 'Faturalar ve KDV', icon: FileText }, { key: 'bank', label: 'Banka mutabakatı', icon: Landmark }, { key: 'accounting', label: 'Muhasebe aktarımı', icon: FileSpreadsheet },
    { key: 'profit', label: 'Kanal ve şirket kârı', icon: TrendingUp }, { key: 'b2b', label: 'Cari ve B2B portal', icon: Building2 },
  ] },
  { group: 'Otomasyon', items: [
    { key: 'rules', label: 'Kurallar', icon: Workflow }, { key: 'alerts', label: 'Uyarılar ve özet', icon: BellRing }, { key: 'shifts', label: 'Vardiya önerisi', icon: CalendarClock },
  ] },
  { group: 'Müşteri görünümü (önizleme)', items: [
    { key: 'return-form', label: 'Müşteri iade formu', icon: Undo2 }, { key: 'portal', label: 'Müşteri portalı', icon: UserRound },
  ] },
  { group: 'Yönetim', items: [
    { key: 'team', label: 'Ekip ve yetki', icon: Users }, { key: 'audit', label: 'Denetim kaydı', icon: ScrollText }, { key: 'feedback', label: 'Geliştirme panosu', icon: Lightbulb },
  ] },
  { group: 'Platform (dış müşteri için, ertelendi)', items: [
    { key: 'onboarding', label: 'Kurulum sihirbazı', icon: Rocket }, { key: 'developers', label: 'API ve bildirim uçları', icon: Code2 },
    { key: 'billing', label: 'Kullanım ve abonelik', icon: CreditCard }, { key: 'status', label: 'Durum sayfası', icon: Activity },
  ] },
]
const VIEWS: { label: string; href: string; page: string }[] = [
  { label: 'Kargoya verilecek siparişler', href: '#/orders?view=toship', page: 'orders' }, { label: '2 günü aşan siparişler', href: '#/orders?view=overdue', page: 'orders' },
  { label: 'Sorunlu siparişler', href: '#/orders?view=issue', page: 'orders' }, { label: 'Barkodu eksik ürünler', href: '#/catalog?view=ean', page: 'catalog' },
  { label: 'Görseli eksik ürünler', href: '#/catalog?view=gorsel', page: 'catalog' }, { label: 'Eksi stoklu ürünler', href: '#/catalog?view=negatif', page: 'catalog' },
]

function useRoute() {
  const read = () => { const [p, q = ''] = (location.hash.replace(/^#\/?/, '') || 'overview').split('?'); return { page: p, query: new URLSearchParams(q) } }
  const [r, setR] = useState(read)
  useEffect(() => { const f = () => { setR(read()); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return r
}

function Shell({ page, query, dark, setDark }: { page: string; query: URLSearchParams; dark: boolean; setDark: (f: (d: boolean) => boolean) => void }) {
  const st = useStore()
  const chat = useChat()
  const [menu, setMenu] = useState(false)
  const [mini, setMiniRaw] = useState(() => { try { return localStorage.getItem('wawi-mock-mini') === '1' } catch { return false } })
  const setMini = (f: (m: boolean) => boolean) => setMiniRaw(m => { const v = f(m); try { localStorage.setItem('wawi-mock-mini', v ? '1' : '0') } catch { /* yalnız bu oturum */ } return v })
  const [agent, setAgent] = useState(false)
  const [find, setFind] = useState(false)
  const [keys, setKeys] = useState(false)
  // Tek harfli kısayollar (WCAG 2.1.4) kapatılabilir: ekran okuyucu ya da ses komutu kullananlar yanlışlıkla tetiklemesin.
  const [single, setSingle] = useState(() => { try { return localStorage.getItem('wawi-single-keys') !== 'off' } catch { return true } })
  const singleRef = useRef(single); singleRef.current = single
  const putSingle = (v: boolean) => { setSingle(v); try { localStorage.setItem('wawi-single-keys', v ? 'on' : 'off') } catch { /* özel pencere */ } }
  const menuRef = useRef<HTMLDivElement>(null)
  useDialog(menu, () => setMenu(false), menuRef)
  const [bell, setBell] = useState(false)
  const [ask, setAsk] = useState<{ text: string; n: number } | null>(null)
  const undoRef = useRef(st.undoLast); undoRef.current = st.undoLast
  // Klavye kısayolları: Ctrl K arama, Ctrl Z geri al, ? yardım, a asistan, g + harf ekrana git.
  useEffect(() => {
    let g = 0
    const f = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase()
      if (mod && k === 'k') { e.preventDefault(); setFind(v => !v); return }
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return
      if (mod && k === 'z') { e.preventDefault(); undoRef.current(); return }
      if (mod || e.altKey) return
      if (e.key === '?') { setKeys(v => !v); return }
      if (k === 'escape') { setKeys(false); return }
      if (!singleRef.current || document.querySelector('[aria-modal="true"]')) return // pencere açıkken harf kısayolları çalışmaz
      if (Date.now() - g < 1500 && GOTO[k]) { location.hash = '#/' + GOTO[k][0]; g = 0; return }
      if (k === 'g') { g = Date.now(); return }
      if (k === 'a') setAgent(v => !v)
      if (k === 'b') setBell(v => !v)
    }
    addEventListener('keydown', f); return () => removeEventListener('keydown', f)
  }, [])
  useEffect(() => setMenu(false), [page])
  // Mesajlardan ve panodan gelen "asistana sor" istekleri
  useEffect(() => {
    const f = (e: Event) => { setAgent(true); setAsk({ text: String((e as CustomEvent).detail), n: Date.now() }) }
    addEventListener('wawi-ask', f); return () => removeEventListener('wawi-ask', f)
  }, [])

  const R = ROLES[st.role]
  const allowed = (k: string) => k === 'messages' || k === 'feedback' || R.nav === 'all' || R.nav.includes(k)
  // Menü rozetleri listelerle aynı veriden ve aynı süzgeç işlevinden hesaplanır.
  const badges = useMemo<Record<string, { n: number; bad?: boolean }>>(() => {
    const ids = new Set(st.accounts.map(a => a.id))
    return {
      messages: { n: chat.totalUnread },
      orders: { n: st.orders.filter(toShip).length },
      returns: { n: st.orders.filter(o => o.ret && o.ret !== 'cozuldu').length },
      channels: { n: st.accounts.filter(a => a.health !== 'ok').length, bad: true },
      sync: { n: st.jobs.filter(j => (j.status === 'basarisiz' || j.status === 'kismi') && (j.acc === null || ids.has(j.acc))).length, bad: true },
      labels: { n: st.orders.filter(o => o.label === 'hata' && (o.status === 'yeni' || o.status === 'hazirlaniyor')).length, bad: true },
      support: { n: st.tickets.filter(t => t.status === 'open').length },
      transfers: { n: st.transfers.filter(t => t.status === 'ulasti').length },
    }
  }, [st.orders, st.accounts, st.jobs, st.tickets, st.transfers, chat.totalUnread])

  const view = !allowed(page) ? <NoAccess /> :
    page === 'overview' ? <Overview /> : page === 'wall' ? <NoAccess /> : page === 'messages' ? <Messages query={query} /> : page === 'feedback' ? <Feedback /> : page === 'orders' ? <Orders query={query} /> : page === 'catalog' ? <Catalog query={query} /> :
    page === 'stock' ? <Stock /> : page === 'channels' ? <Channels /> : page === 'sync' ? <Sync /> : page === 'returns' ? <Returns /> :
    page === 'finance' ? <Finance /> : page === 'team' ? <Team /> : page === 'audit' ? <AuditLog /> :
    page === 'labels' ? <Labels /> : page === 'transfers' ? <Transfers /> : page === 'support' ? <Support /> : page === 'b2b' ? <B2BPage /> :
    page === 'rules' ? <Rules /> : page === 'alerts' ? <Alerts /> : page === 'shifts' ? <Shifts /> : page === 'picking' ? <Picking /> : page === 'counting' ? <Counting /> :
    page === 'listing' ? <ListingWizard /> : page === 'prices' ? <PriceRules /> : page === 'replenish' ? <Replenish /> : page === 'quality' ? <QualityQueue /> : page === 'content' ? <ContentStudio /> :
    page === 'bank' ? <BankMatch /> : page === 'accounting' ? <Accounting /> : page === 'profit' ? <Profit /> :
    page === 'onboarding' ? <Onboarding /> : page === 'developers' ? <Developers /> : page === 'billing' ? <Billing /> : page === 'status' ? <Status /> :
    page === 'reservations' ? <Reservations /> : page === 'portal' ? <CustomerPortal /> : page === 'return-form' ? <ReturnForm /> : <NoAccess />

  if (page === 'mobile' && allowed('mobile')) return <MobileDepot />
  if (page === 'wall' && allowed('wall')) return <Wall />

  const here = NAV.flatMap(g => g.items.map(i => ({ ...i, group: g.group }))).find(i => i.key === page)
  const side = (onClose?: () => void) => <Sidebar nav={NAV} page={page} badges={badges} allowed={allowed} home={HOME} mini={mini} setMini={setMini} onClose={onClose} />

  return (
    <div className={`min-h-screen transition-[padding] duration-200 ${mini ? 'md:pl-[68px]' : 'md:pl-64'}`}>
      <aside className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-[width] duration-200 ${mini ? 'w-[68px]' : 'w-64'}`}>{side()}</aside>
      {menu && <div ref={menuRef} role="dialog" aria-modal="true" aria-label="Menü" className="md:hidden fixed inset-0 z-50 flex"><div className="slide-in w-72 max-w-[85vw]">{side(() => setMenu(false))}</div><div className="flex-1 bg-black/45" onClick={() => setMenu(false)} /></div>}

      <header className="sticky top-0 z-20 bg-card/85 backdrop-blur-md border-b border-line px-3 md:px-5 min-h-14 py-2 flex flex-wrap items-center gap-2">
        <button className="md:hidden border border-line rounded-md bg-card p-1.5 text-ink2" aria-label="Menüyü aç" aria-expanded={menu} onClick={() => setMenu(true)}><Menu size={18} /></button>
        {here && <div className="hidden lg:flex items-center gap-1 text-[13px] mr-2 min-w-0">{here.group && <><span className="text-mute">{here.group}</span><ChevronRight size={13} className="text-mute" /></>}<b className="font-semibold truncate">{here.label}</b></div>}
        <label className="flex items-center gap-1.5 text-xs text-mute">Şirket
          <select className={sel} value={st.companyId} onChange={e => st.setCompanyId(e.target.value)}>
            <option value="">Tüm şirketler</option>{COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-mute">Depo
          <select className={sel} value={st.whId} onChange={e => st.setWhId(e.target.value as WhId | '')}>
            <option value="">Tüm depolar</option>{WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        <span className="flex-1" />
        <button onClick={() => setFind(true)} className="inline-flex items-center gap-2 rounded-md border border-line bg-bg h-8 pl-2.5 pr-2 text-sm text-mute hover:border-brand"><Search size={14} /><span className="hidden sm:inline">Ara</span><kbd className="hidden sm:inline rounded border border-line bg-card px-1 text-[10px] font-sans">Ctrl K</kbd></button>
        <Notifications open={bell} setOpen={setBell} onAsk={text => { setAgent(true); setAsk({ text, n: Date.now() }) }} />
        <label className="flex items-center gap-1.5 text-xs text-mute">Rol
          <select className={sel} value={st.role} onChange={e => st.setRole(e.target.value as Role)}>
            {(Object.keys(ROLES) as Role[]).map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}
          </select>
        </label>
        <button onClick={() => setDark(d => !d)} aria-label="Açık / koyu tema" className="border border-line rounded-md bg-card size-8 grid place-items-center text-ink2">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
      </header>

      <main key={page} className="page-in px-3 md:px-5 py-4 max-w-[1500px]"><PageIcon.Provider value={here?.icon ?? null}>{view}</PageIcon.Provider></main>
      <Agent open={agent} onClose={() => setAgent(false)} ask={ask} />
      <button onClick={() => setAgent(v => !v)} aria-label={agent ? 'Asistanı kapat' : 'Asistanı aç'} aria-expanded={agent} title="Asistan (A)" className={`launcher fixed bottom-5 right-5 z-40 size-14 grid place-items-center rounded-full border-0 bg-[#3048C8] text-white shadow-lg shadow-[#3048C8]/40 hover:scale-105 transition-transform ${agent ? 'max-sm:hidden' : ''}`}>
        {agent ? <X size={24} /> : <Logo height={38} markOnly />}
      </button>
      {find && <Palette onClose={() => setFind(false)} allowed={allowed} />}
      <div role="status" aria-live="polite">{(st.toast || st.undo) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-ink text-bg px-4 py-2 text-sm shadow-lg max-w-[92vw]">
          <span className="truncate">{st.toast ?? `Son işlem: ${st.undo!.label}`}</span>
          {st.toast && <button onClick={st.dismissToast} aria-label="Bildirimi kapat" className="shrink-0 grid place-items-center size-7 pointer-coarse:size-11 rounded-md border-0 bg-transparent text-bg hover:bg-bg/15"><X size={14} /></button>}
          {st.undo && <button onClick={st.undoLast} className="shrink-0 inline-flex items-center gap-1 rounded-md border border-bg/40 bg-transparent text-bg px-2 h-7 pointer-coarse:h-11 text-xs font-semibold hover:bg-bg/15"><Undo2 size={13} />Geri al</button>}
        </div>
      )}</div>
      {keys && <Shortcuts onClose={() => setKeys(false)} single={single} onSingle={putSingle} />}
    </div>
  )
}

/* Her yerden arama (Ctrl+K): ekranlar, hazır görünümler, sipariş numarası ve ürün. */
function Palette({ onClose, allowed }: { onClose: () => void; allowed: (k: string) => boolean }) {
  const st = useStore()
  const [q, setQ] = useState('')
  const [at, setAt] = useState(0)
  const box = useRef<HTMLInputElement>(null), dlg = useRef<HTMLDivElement>(null)
  useDialog(true, onClose, dlg)
  useEffect(() => { box.current?.focus() }, [])
  const rows = useMemo(() => {
    const n = q.trim().toLocaleLowerCase('tr-TR'), hit = (s: string) => s.toLocaleLowerCase('tr-TR').includes(n)
    const out: { kind: string; label: string; sub?: string; href: string }[] = []
    for (const g of NAV) for (const i of g.items) if (allowed(i.key) && (!n || hit(i.label) || hit(g.group))) out.push({ kind: 'Ekran', label: i.label, sub: g.group || undefined, href: `#/${i.key}` })
    for (const v of VIEWS) if (allowed(v.page) && (!n || hit(v.label))) out.push({ kind: 'Görünüm', label: v.label, href: v.href })
    if (n.length >= 2) {
      if (allowed('orders')) for (const o of st.orders.filter(o => hit(o.no)).slice(0, 5)) out.push({ kind: 'Sipariş', label: o.no, sub: account(o.acc).name, href: '#/orders' })
      if (allowed('catalog')) for (const p of st.products.filter(p => hit(p.name) || hit(p.sku) || (p.ean ?? '').includes(n)).slice(0, 5)) out.push({ kind: 'Ürün', label: p.name, sub: p.sku, href: '#/catalog' })
    }
    return out.slice(0, n ? 14 : 10)
  }, [q, st.orders, st.products, allowed])
  useEffect(() => setAt(0), [q])
  const go = (href: string) => { location.hash = href; onClose() }
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center pt-[12vh] px-3" onClick={onClose}>
      <div ref={dlg} role="dialog" aria-modal="true" aria-label="Arama" className="w-full max-w-xl rounded-2xl bg-card border border-line shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 border-b border-line">
          <Search size={16} className="text-mute shrink-0" />
          <input ref={box} value={q} onChange={e => setQ(e.target.value)} placeholder="Ekran, sipariş numarası ya da ürün ara" aria-label="Ara" className="flex-1 h-12 bg-transparent border-0 outline-none text-[15px]"
            onKeyDown={e => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowDown') { e.preventDefault(); setAt(a => Math.min(rows.length - 1, a + 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setAt(a => Math.max(0, a - 1)) } else if (e.key === 'Enter' && rows[at]) go(rows[at].href) }} />
          <kbd className="rounded border border-line px-1.5 text-[10px] text-mute font-sans">Esc</kbd>
        </div>
        <ul className="m-0 p-1.5 list-none max-h-[52vh] overflow-y-auto">
          {rows.length === 0 && <li className="px-3 py-6 text-center text-mute">Sonuç yok</li>}
          {rows.map((r, i) => (
            <li key={r.kind + r.label + i}><button onMouseEnter={() => setAt(i)} onClick={() => go(r.href)} className={`w-full text-left flex items-center gap-3 rounded-lg px-3 h-10 border-0 ${i === at ? 'bg-brand-soft' : 'bg-transparent'}`}>
              <span className="w-16 shrink-0 text-[11px] text-mute">{r.kind}</span><span className="flex-1 truncate text-sm text-ink">{r.label}</span>{r.sub && <span className="text-xs text-mute truncate max-w-[40%]">{r.sub}</span>}
            </button></li>))}
        </ul>
        <div className="px-4 py-2 border-t border-line text-[11px] text-mute">↑ ↓ ile gez · Enter ile aç · Ctrl K ile aç/kapat · tüm kısayollar için ?</div>
      </div>
    </div>
  )
}

const GOTO: Record<string, [string, string]> = { h: ['overview', 'Genel bakış'], o: ['orders', 'Siparişler'], t: ['picking', 'Toplama listesi'], i: ['returns', 'İadeler'], m: ['messages', 'Mesajlar'], k: ['catalog', 'Katalog'], s: ['stock', 'Stok defteri'], r: ['reservations', 'Stok ayırma'], e: ['sync', 'Eşitleme işleri'], u: ['alerts', 'Uyarılar'], f: ['finance', 'Faturalar'] }
function Shortcuts({ onClose, single, onSingle }: { onClose: () => void; single: boolean; onSingle: (v: boolean) => void }) {
  const dlg = useRef<HTMLDivElement>(null)
  useDialog(true, onClose, dlg)
  const K = ({ children }: { children: string }) => <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 text-[11px] font-sans">{children}</kbd>
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 grid place-items-center px-3" onClick={onClose}>
      <div ref={dlg} role="dialog" aria-modal="true" aria-label="Klavye kısayolları" className="w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="m-0 text-base font-semibold">Klavye kısayolları</h2><button onClick={onClose} aria-label="Kapat" className="border-0 bg-transparent p-1 text-ink2"><X size={18} /></button></div>
        <dl className="m-0 mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm items-center">
          <dt><K>Ctrl</K> <K>K</K></dt><dd className="m-0">Her yerden arama</dd>
          <dt><K>Ctrl</K> <K>Z</K></dt><dd className="m-0">Son işlemi geri al (10 saniye içinde)</dd>
          <dt><K>A</K></dt><dd className="m-0">Asistanı aç ya da kapat</dd>
          <dt><K>B</K></dt><dd className="m-0">Bildirimleri aç ya da kapat</dd>
          <dt><K>?</K></dt><dd className="m-0">Bu listeyi göster</dd>
          {Object.entries(GOTO).map(([k, [, l]]) => <div key={k} className="contents"><dt><K>G</K> <K>{k.toUpperCase()}</K></dt><dd className="m-0">{l}</dd></div>)}
        </dl>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={single} onChange={e => onSingle(e.target.checked)} /> Tek harfli kısayolları kullan (A, B, G + harf)</label>
        <p className="m-0 mt-1 text-xs text-mute">Ctrl K, Ctrl Z ve ? her zaman çalışır. Bir yazı alanındayken harf kısayolları çalışmaz.</p>
      </div>
    </div>
  )
}

const NoAccess = () => (
  <div className="max-w-md mx-auto mt-16 text-center">
    <h1 className="text-lg font-semibold m-0">Bu rol bu ekranı göremez</h1>
    <p className="text-ink2">Bu ekran rolünüze kapalıdır. Erişim gerekiyorsa yöneticinizden yetki isteyin.</p>
    <a href="#/overview" className="text-brand">Genel bakışa dön</a>
  </div>
)

function Root() {
  const { page, query } = useRoute()
  const [dark, setDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  return <Shell page={page} query={query} dark={dark} setDark={setDark} />
}

export default function App() { return <StoreProvider><ChatProvider><Root /></ChatProvider></StoreProvider> }
