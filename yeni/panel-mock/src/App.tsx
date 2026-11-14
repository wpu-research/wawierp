import { useEffect, useMemo, useState } from 'react'
import { Boxes, Building2, FileText, LayoutDashboard, LifeBuoy, Menu, Moon, Package, RefreshCw, RotateCcw, ScrollText, ShoppingCart, Store, Sun, Tag, Truck, Users, X, type LucideIcon } from 'lucide-react'
import { COMPANIES, WAREHOUSES, toShip, type WhId } from './data'
import { ROLES, StoreProvider, useStore, type Role } from './store'
import { sel } from './ui'
import { Logo } from './logo'
import Overview from './pages/Overview'
import Orders from './pages/Orders'
import Catalog, { Stock } from './pages/Catalog'
import Channels, { Sync } from './pages/Channels'
import Finance, { Returns } from './pages/Finance'
import { AuditLog, Team } from './pages/Admin'
import { B2BPage, Labels, Support, Transfers } from './pages/Extra'

const HOME = location.protocol === 'file:' ? 'index.html' : '/'

interface NavItem { key: string; label: string; icon: LucideIcon; draft?: boolean }
const NAV: { group: string; items: NavItem[] }[] = [
  { group: '', items: [{ key: 'overview', label: 'Genel bakış', icon: LayoutDashboard }] },
  { group: 'Operasyon', items: [
    { key: 'orders', label: 'Siparişler', icon: ShoppingCart }, { key: 'labels', label: 'Kargo etiketleri', icon: Tag },
    { key: 'returns', label: 'İadeler', icon: RotateCcw }, { key: 'support', label: 'Destek', icon: LifeBuoy },
  ] },
  { group: 'Ürün ve stok', items: [
    { key: 'catalog', label: 'Katalog', icon: Package }, { key: 'stock', label: 'Stok defteri', icon: Boxes }, { key: 'transfers', label: 'Depo transferi', icon: Truck },
  ] },
  { group: 'Satış kanalları', items: [{ key: 'channels', label: 'Kanallar', icon: Store }, { key: 'sync', label: 'Eşitleme işleri', icon: RefreshCw }] },
  { group: 'Finans', items: [{ key: 'finance', label: 'Faturalar ve KDV', icon: FileText }, { key: 'b2b', label: 'Cari ve B2B portal', icon: Building2 }] },
  { group: 'Yönetim', items: [{ key: 'team', label: 'Ekip ve yetki', icon: Users }, { key: 'audit', label: 'Denetim kaydı', icon: ScrollText }] },
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
    page === 'labels' ? <Labels /> : page === 'transfers' ? <Transfers /> : page === 'support' ? <Support /> : page === 'b2b' ? <B2BPage /> : <NoAccess />

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
    <div className="min-h-screen md:pl-60">
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
        <label className="flex items-center gap-1.5 text-xs text-mute">Rol
          <select className={sel} value={st.role} onChange={e => st.setRole(e.target.value as Role)}>
            {(Object.keys(ROLES) as Role[]).map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}
          </select>
        </label>
        <button onClick={() => setDark(d => !d)} aria-label="Açık / koyu tema" className="border border-line rounded-md bg-card size-8 grid place-items-center text-ink2">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
      </header>

      <main className="px-3 md:px-5 py-4 max-w-[1500px]">{view}</main>
      {st.toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-ink text-bg px-4 py-2 text-sm shadow-lg">{st.toast}</div>}
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
