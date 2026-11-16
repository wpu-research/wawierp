/* Sol menü: koyu, daraltılabilir; gruplar açılıp kapanır, sık kullanılanlar sabitlenir, menü içinde aranır. */
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronsLeft, ChevronsRight, Search, Star, X, type LucideIcon } from 'lucide-react'
import { Logo } from './logo'
import { ROLES, useStore } from './store'
import { Avatar } from './Chat'

export interface NavItem { key: string; label: string; icon: LucideIcon; fresh?: boolean }
export interface NavGroup { group: string; items: NavItem[] }
type Badges = Record<string, { n: number; bad?: boolean } | undefined>
interface Saved { pins: string[]; closed: string[] }
const KEY = 'wawi-mock-menu'
const load = (): Saved => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && Array.isArray(v.pins) && Array.isArray(v.closed)) return v } catch { /* bozuk kayıt */ } return { pins: ['orders', 'labels'], closed: ['Platform', 'Yönetim'] } }

export default function Sidebar({ nav, page, badges, allowed, home, mini, setMini, onClose }: {
  nav: NavGroup[]; page: string; badges: Badges; allowed: (k: string) => boolean; home: string; mini: boolean; setMini: (f: (m: boolean) => boolean) => void; onClose?: () => void
}) {
  const st = useStore()
  const [s, setS] = useState<Saved>(load)
  const [q, setQ] = useState('')
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* saklanamazsa oturum boyunca */ } }, [s])
  const n = q.trim().toLocaleLowerCase('tr-TR')
  const all = useMemo(() => nav.flatMap(g => g.items).filter(i => allowed(i.key)), [nav, allowed])
  const pins = s.pins.map(k => all.find(i => i.key === k)).filter((i): i is NavItem => !!i)
  const pin = (k: string) => setS(v => ({ ...v, pins: v.pins.includes(k) ? v.pins.filter(x => x !== k) : [...v.pins, k] }))
  const toggle = (g: string) => setS(v => ({ ...v, closed: v.closed.includes(g) ? v.closed.filter(x => x !== g) : [...v.closed, g] }))
  const slim = mini && !onClose // telefonda açılan menü her zaman geniştir

  const link = (i: NavItem, pinned = false) => { const b = badges[i.key], on = page === i.key, star = s.pins.includes(i.key); return (
    <div key={(pinned ? 'p-' : '') + i.key} className="group/nav relative">
      <a href={`#/${i.key}`} aria-current={on ? 'page' : undefined} title={slim ? i.label : undefined}
        className={`nav-link relative flex items-center gap-2.5 rounded-lg h-9 no-underline text-[13.5px] ${slim ? 'justify-center px-0' : 'pl-2.5 pr-2'} ${on ? 'bg-white/12 text-white font-medium' : 'text-white/65 hover:text-white hover:bg-white/7'}`}>
        {on && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gold" />}
        <i.icon size={17} className="shrink-0" />
        {!slim && <span className="flex-1 truncate">{i.label}</span>}
        {!slim && i.fresh && !b?.n && <span className="size-1.5 rounded-full bg-gold/80 group-hover/nav:opacity-0" title="Yeni ekran" />}
        {b && b.n > 0 && (slim
          ? <span className={`absolute top-1 right-2 size-2 rounded-full ${b.bad ? 'bg-[#ff7a7a]' : 'bg-gold'}`} />
          : <span className={`num rounded-full px-1.5 text-[11px] font-semibold group-hover/nav:opacity-0 ${b.bad ? 'bg-[#ff7a7a]/20 text-[#ffb0b0]' : 'bg-white/12 text-white/85'}`}>{b.n}</span>)}
      </a>
      {!slim && <button onClick={() => pin(i.key)} aria-label={star ? `${i.label}: sabitlemeyi kaldır` : `${i.label}: sık kullanılanlara sabitle`} title={star ? 'Sabitlemeyi kaldır' : 'Sık kullanılanlara sabitle'}
        className={`absolute right-1.5 top-1.5 size-6 grid place-items-center rounded-md border-0 bg-navy opacity-0 group-hover/nav:opacity-100 focus-visible:opacity-100 ${star ? 'text-gold' : 'text-white/60 hover:text-white'}`}><Star size={13} fill={star ? 'currentColor' : 'none'} /></button>}
    </div>) }
  const head = (t: string) => !slim && <div className="px-2.5 pt-3 pb-1 text-[10.5px] font-semibold uppercase tracking-[.08em] text-white/60">{t}</div>

  return (
    <nav className="flex flex-col h-full bg-navy text-white" aria-label="Ana menü">
      <div className={`h-14 flex items-center shrink-0 ${slim ? 'justify-center' : 'justify-between px-4'}`}>
        <a href={home} className="flex items-center gap-2 no-underline" title="Ana sayfa">
          {slim ? <span className="size-9 grid place-items-center rounded-xl bg-[#3048C8]"><Logo height={26} markOnly /></span> : <><Logo height={26} onDark /><span className="rounded bg-gold/20 text-gold text-[10px] font-semibold px-1.5 py-0.5">MOCK</span></>}
        </a>
        {onClose && <button className="border-0 bg-transparent p-1.5 text-white/70" aria-label="Menüyü kapat" onClick={onClose}><X size={18} /></button>}
      </div>
      {!slim && (
        <div className="px-3 pb-2">
          <label className="flex items-center gap-2 rounded-lg bg-white/7 px-2.5 h-9 text-white/60 focus-within:bg-white/12 focus-within:text-white">
            <Search size={14} className="shrink-0" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Menüde ara" aria-label="Menüde ara" className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[13px] text-white placeholder:text-white/45" />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Aramayı temizle" className="border-0 bg-transparent p-0 text-white/60 grid place-items-center"><X size={13} /></button>}
          </label>
        </div>
      )}
      <div className={`side-scroll flex-1 overflow-y-auto pb-3 ${slim ? 'px-2.5' : 'px-2'}`}>
        {n ? (
          <>{head('Sonuçlar')}{all.filter(i => i.label.toLocaleLowerCase('tr-TR').includes(n)).map(i => link(i))}{!all.some(i => i.label.toLocaleLowerCase('tr-TR').includes(n)) && <p className="px-2.5 text-[13px] text-white/50">Eşleşen ekran yok.</p>}</>
        ) : (
          <>
            {pins.length > 0 && <>{head('Sık kullanılanlar')}{pins.map(i => link(i, true))}{slim && <div className="my-2 border-t border-white/10" />}</>}
            {nav.map(g => { const items = g.items.filter(i => allowed(i.key)); if (!items.length) return null
              if (!g.group) return <div key="top" className={pins.length && !slim ? 'mt-2' : ''}>{items.map(i => link(i))}</div>
              const has = items.some(i => i.key === page), shut = !slim && s.closed.includes(g.group) && !has
              const alert = items.reduce((t, i) => t + (badges[i.key]?.bad ? badges[i.key]!.n : 0), 0)
              return (
                <div key={g.group}>
                  {slim ? <div className="my-2 border-t border-white/10" /> : (
                    <button onClick={() => toggle(g.group)} aria-expanded={!shut} className="w-full flex items-center gap-1.5 px-2.5 pt-3 pb-1 border-0 bg-transparent text-[10.5px] font-semibold uppercase tracking-[.08em] text-white/38 hover:text-white/70">
                      <span className="flex-1 text-left">{g.group}</span>
                      {shut && alert > 0 && <span className="num rounded-full bg-[#ff7a7a]/20 text-[#ffb0b0] px-1.5 text-[10px] normal-case tracking-normal">{alert}</span>}
                      <ChevronDown size={13} className={`transition-transform ${shut ? '-rotate-90' : ''}`} />
                    </button>)}
                  {!shut && items.map(i => link(i))}
                </div>) })}
          </>
        )}
      </div>
      <div className={`shrink-0 border-t border-white/10 flex items-center gap-2.5 ${slim ? 'flex-col py-2.5' : 'px-3 py-2.5'}`}>
        <Avatar name={ROLES[st.role].user} size={30} dot />
        {!slim && <div className="min-w-0 flex-1"><div className="text-[13px] font-medium truncate">{ROLES[st.role].user}</div><div className="text-[11px] text-white/50 truncate">İlk kiracı · 12 şirket, 5 depo</div></div>}
        {!onClose && <button onClick={() => setMini(m => !m)} aria-label={mini ? 'Menüyü genişlet' : 'Menüyü daralt'} title={mini ? 'Menüyü genişlet' : 'Menüyü daralt'} className="size-7 grid place-items-center rounded-md border-0 bg-white/7 text-white/70 hover:bg-white/14 hover:text-white">{mini ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}</button>}
      </div>
    </nav>
  )
}
