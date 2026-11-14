import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, BadgePercent, BellRing, Boxes, Building2, CalendarClock, ClipboardCheck, Code2, CreditCard, FileSpreadsheet, FileText, Landmark, Languages, LayoutDashboard, LifeBuoy, ListChecks, Menu, Moon, Package, PackagePlus, RefreshCw, Rocket, RotateCcw, ScanSearch, ScrollText, Search, Send, ShoppingCart, Store, Sun, Tag, TrendingUp, Truck, Users, Workflow, X, type LucideIcon } from 'lucide-react'
import { COMPANIES, WAREHOUSES, account, toShip, type WhId } from './data'
import { ROLES, StoreProvider, useStore, type Role } from './store'
import { sel } from './ui'
import { Logo } from './logo'
import Agent from './Agent'
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

const HOME = location.protocol === 'file:' ? 'index.html' : '/'

interface NavItem { key: string; label: string; icon: LucideIcon; draft?: boolean; fresh?: boolean }
const NAV: { group: string; items: NavItem[] }[] = [
  { group: '', items: [{ key: 'overview', label: 'Genel bakış', icon: LayoutDashboard }] },
  { group: 'Operasyon', items: [
    { key: 'orders', label: 'Siparişler', icon: ShoppingCart }, { key: 'picking', label: 'Toplama listesi', icon: ListChecks, fresh: true }, { key: 'labels', label: 'Kargo etiketleri', icon: Tag },
    { key: 'returns', label: 'İadeler', icon: RotateCcw }, { key: 'support', label: 'Destek', icon: LifeBuoy },
  ] },
  { group: 'Ürün ve stok', items: [
    { key: 'catalog', label: 'Katalog', icon: Package }, { key: 'quality', label: 'Veri kalitesi', icon: ScanSearch, fresh: true }, { key: 'content', label: 'Ürün metni ve çeviri', icon: Languages, fresh: true },
    { key: 'stock', label: 'Stok defteri', icon: Boxes }, { key: 'counting', label: 'Sayım planı', icon: ClipboardCheck, fresh: true }, { key: 'replenish', label: 'Tedarik önerileri', icon: PackagePlus, fresh: true },
    { key: 'transfers', label: 'Depo transferi', icon: Truck },
  ] },
  { group: 'Satış kanalları', items: [
    { key: 'channels', label: 'Kanallar', icon: Store }, { key: 'listing', label: 'Toplu listeleme', icon: Send, fresh: true }, { key: 'prices', label: 'Fiyat ve kârlılık', icon: BadgePercent, fresh: true }, { key: 'sync', label: 'Eşitleme işleri', icon: RefreshCw },
  ] },
  { group: 'Otomasyon', items: [
    { key: 'rules', label: 'Kurallar', icon: Workflow, fresh: true }, { key: 'alerts', label: 'Uyarılar ve özet', icon: BellRing, fresh: true }, { key: 'shifts', label: 'Vardiya önerisi', icon: CalendarClock, fresh: true },
  ] },
  { group: 'Finans', items: [
    { key: 'finance', label: 'Faturalar ve KDV', icon: FileText }, { key: 'bank', label: 'Banka mutabakatı', icon: Landmark, fresh: true }, { key: 'accounting', label: 'Muhasebe aktarımı', icon: FileSpreadsheet, fresh: true },
    { key: 'profit', label: 'Kârlılık', icon: TrendingUp, fresh: true }, { key: 'b2b', label: 'Cari ve B2B portal', icon: Building2 },
  ] },
  { group: 'Platform', items: [
    { key: 'onboarding', label: 'Kurulum sihirbazı', icon: Rocket, fresh: true }, { key: 'developers', label: 'API ve bildirim uçları', icon: Code2, fresh: true },
    { key: 'billing', label: 'Kullanım ve abonelik', icon: CreditCard, fresh: true }, { key: 'status', label: 'Durum sayfası', icon: Activity, fresh: true },
  ] },
  { group: 'Yönetim', items: [{ key: 'team', label: 'Ekip ve yetki', icon: Users }, { key: 'audit', label: 'Denetim kaydı', icon: ScrollText }] },
]
const VIEWS: { label: string; href: string; page: string }[] = [
  { label: 'Gönderilecek siparişler', href: '#/orders?view=toship', page: 'orders' }, { label: '2 günü aşan siparişler', href: '#/orders?view=overdue', page: 'orders' },
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
  const [menu, setMenu] = useState(false)
  const [agent, setAgent] = useState(false)
  const [find, setFind] = useState(false)
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setFind(v => !v) } }
    addEventListener('keydown', f); return () => removeEventListener('keydown', f)
  }, [])
  useEffect(() => setMenu(false), [page])

  const R = ROLES[st.role]
  const allowed = (k: string) => R.nav === 'all' || R.nav.includes(k)
  // Menü rozetleri listelerle aynı veriden ve aynı süzgeç işlevinden hesaplanır.
  const badges = useMemo<Record<string, { n: number; bad?: boolean }>>(() => {
    const ids = new Set(st.accounts.map(a => a.id))
    return {
      orders: { n: st.orders.filter(toShip).length },
      returns: { n: st.orders.filter(o => o.ret && o.ret !== 'cozuldu').length },
      channels: { n: st.accounts.filter(a => a.health !== 'ok').length, bad: true },
      sync: { n: st.jobs.filter(j => (j.status === 'basarisiz' || j.status === 'kismi') && (j.acc === null || ids.has(j.acc))).length, bad: true },
      labels: { n: st.orders.filter(o => o.label === 'hata' && (o.status === 'yeni' || o.status === 'hazirlaniyor')).length, bad: true },
      support: { n: st.tickets.filter(t => t.status === 'open').length },
      transfers: { n: st.transfers.filter(t => t.status === 'ulasti').length },
    }
  }, [st.orders, st.accounts, st.jobs, st.tickets, st.transfers])

  const view = !allowed(page) ? <NoAccess /> :
    page === 'overview' ? <Overview /> : page === 'orders' ? <Orders query={query} /> : page === 'catalog' ? <Catalog query={query} /> :
    page === 'stock' ? <Stock /> : page === 'channels' ? <Channels /> : page === 'sync' ? <Sync /> : page === 'returns' ? <Returns /> :
    page === 'finance' ? <Finance /> : page === 'team' ? <Team /> : page === 'audit' ? <AuditLog /> :
    page === 'labels' ? <Labels /> : page === 'transfers' ? <Transfers /> : page === 'support' ? <Support /> : page === 'b2b' ? <B2BPage /> :
    page === 'rules' ? <Rules /> : page === 'alerts' ? <Alerts /> : page === 'shifts' ? <Shifts /> : page === 'picking' ? <Picking /> : page === 'counting' ? <Counting /> :
    page === 'listing' ? <ListingWizard /> : page === 'prices' ? <PriceRules /> : page === 'replenish' ? <Replenish /> : page === 'quality' ? <QualityQueue /> : page === 'content' ? <ContentStudio /> :
    page === 'bank' ? <BankMatch /> : page === 'accounting' ? <Accounting /> : page === 'profit' ? <Profit /> :
    page === 'onboarding' ? <Onboarding /> : page === 'developers' ? <Developers /> : page === 'billing' ? <Billing /> : page === 'status' ? <Status /> : <NoAccess />

  const sidebar = (
    <nav className="flex flex-col h-full" aria-label="Ana menü">
      <div className="px-4 h-14 flex items-center justify-between border-b border-line shrink-0">
        <a href={HOME} className="flex items-center gap-2 no-underline text-ink" title="Ana sayfa">
          <Logo height={26} />
          <span className="rounded bg-warn-soft text-warn text-[10px] font-semibold px-1.5 py-0.5">MOCK</span>
        </a>
        <button className="md:hidden border-0 bg-transparent p-1.5 text-ink2" aria-label="Menüyü kapat" onClick={() => setMenu(false)}><X size={18} /></button>
      </div>
      <div className="px-3 py-2.5 border-b border-line text-xs">
        <div className="text-mute">Kiracı</div>
        <div className="font-medium text-sm">İlk kiracı · 12 şirket, 5 depo</div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {NAV.map(g => { const items = g.items.filter(i => allowed(i.key)); if (!items.length) return null; return (
          <div key={g.group} className="mb-2">
            {g.group && <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-mute">{g.group}</div>}
            {items.map(i => { const b = badges[i.key], on = page === i.key; return (
              <a key={i.key} href={`#/${i.key}`} aria-current={on ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-md px-2 h-8 no-underline text-sm ${on ? 'bg-brand-soft text-brand font-medium' : 'text-ink2 hover:bg-bg'}`}>
                <i.icon size={16} className="shrink-0" /><span className="flex-1 truncate">{i.label}</span>
                {i.draft && <span className="text-[10px] text-mute">taslak</span>}
                {i.fresh && !b?.n && <span className="rounded-full bg-violet-soft text-violet text-[10px] font-semibold px-1.5">yeni</span>}
                {b && b.n > 0 && <span className={`num rounded-full px-1.5 text-[11px] font-medium ${b.bad ? 'bg-bad-soft text-bad' : 'bg-bg text-ink2 border border-line'}`}>{b.n}</span>}
              </a>
            ) })}
          </div>
        ) })}
      </div>
      <div className="px-3 py-2.5 border-t border-line text-[11px] text-mute leading-snug">Mock veri. Sipariş sayıları gerçek 30 günlük dağılımdan; satırlar, müşteriler ve ürünler uydurma.</div>
    </nav>
  )

  return (
    <div className={`min-h-screen md:pl-60 ${agent ? 'xl:pr-[400px]' : ''}`}>
      <aside className="hidden md:block fixed inset-y-0 left-0 w-60 bg-card border-r border-line">{sidebar}</aside>
      {menu && <div className="md:hidden fixed inset-0 z-50 flex"><div className="w-64 max-w-[85vw] bg-card border-r border-line">{sidebar}</div><div className="flex-1 bg-black/40" onClick={() => setMenu(false)} /></div>}

      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-line px-3 md:px-5 min-h-14 py-2 flex flex-wrap items-center gap-2">
        <button className="md:hidden border border-line rounded-md bg-card p-1.5 text-ink2" aria-label="Menüyü aç" onClick={() => setMenu(true)}><Menu size={18} /></button>
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
        <label className="flex items-center gap-1.5 text-xs text-mute">Rol
          <select className={sel} value={st.role} onChange={e => st.setRole(e.target.value as Role)}>
            {(Object.keys(ROLES) as Role[]).map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}
          </select>
        </label>
        <button onClick={() => setDark(d => !d)} aria-label="Açık / koyu tema" className="border border-line rounded-md bg-card size-8 grid place-items-center text-ink2">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
      </header>

      <main className="px-3 md:px-5 py-4 max-w-[1500px]">{view}</main>
      <Agent open={agent} onClose={() => setAgent(false)} />
      {!agent && (
        <button onClick={() => setAgent(true)} aria-label="Asistanı aç" title="Asistan" className="fixed bottom-5 right-5 z-40 size-14 grid place-items-center rounded-2xl border-0 bg-[#3048C8] shadow-lg shadow-black/25 hover:scale-105 transition-transform">
          <Logo height={38} markOnly />
        </button>
      )}
      {find && <Palette onClose={() => setFind(false)} allowed={allowed} />}
      {st.toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-ink text-bg px-4 py-2 text-sm shadow-lg">{st.toast}</div>}
    </div>
  )
}

/* Her yerden arama (Ctrl+K): ekranlar, hazır görünümler, sipariş numarası ve ürün. */
function Palette({ onClose, allowed }: { onClose: () => void; allowed: (k: string) => boolean }) {
  const st = useStore()
  const [q, setQ] = useState('')
  const [at, setAt] = useState(0)
  const box = useRef<HTMLInputElement>(null)
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
      <div role="dialog" aria-label="Arama" className="w-full max-w-xl rounded-2xl bg-card border border-line shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
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
        <div className="px-4 py-2 border-t border-line text-[11px] text-mute">↑ ↓ ile gez · Enter ile aç · Ctrl K ile aç/kapat</div>
      </div>
    </div>
  )
}

const NoAccess = () => (
  <div className="max-w-md mx-auto mt-16 text-center">
    <h1 className="text-lg font-semibold m-0">Bu rol bu ekranı göremez</h1>
    <p className="text-ink2">Menüde gizlenir, sunucu da isteği reddeder ve denetim kaydına yazar.</p>
    <a href="#/overview" className="text-brand">Genel bakışa dön</a>
  </div>
)

function Root() {
  const { page, query } = useRoute()
  const [dark, setDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  return <Shell page={page} query={query} dark={dark} setDark={setDark} />
}

export default function App() { return <StoreProvider><Root /></StoreProvider> }
