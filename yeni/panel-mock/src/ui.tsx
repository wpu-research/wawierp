import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CHANNEL, account, fmtNum } from './data'

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'violet'
const TONE: Record<Tone, string> = {
  neutral: 'bg-bg text-ink2 border-line', ok: 'bg-ok-soft text-ok border-transparent', warn: 'bg-warn-soft text-warn border-transparent',
  bad: 'bg-bad-soft text-bad border-transparent', info: 'bg-brand-soft text-brand border-transparent', violet: 'bg-violet-soft text-violet border-transparent',
}
export function Badge({ tone = 'neutral', children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return <span title={title} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE[tone]}`}>{children}</span>
}

export function Btn({ variant = 'outline', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }) {
  const v = variant === 'primary' ? 'bg-brand text-white border-brand hover:opacity-90' : variant === 'ghost' ? 'border-transparent hover:bg-bg text-ink2' : 'bg-card border-line hover:bg-bg'
  return <button {...p} className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 h-8 text-sm font-medium whitespace-nowrap disabled:opacity-45 ${v} ${className}`} />
}

export function Card({ title, right, children, className = '', pad = true }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`bg-card border border-line rounded-xl ${className}`}>
      {title && <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-2"><h2 className="m-0 text-sm font-semibold">{title}</h2>{right}</header>}
      <div className={pad ? 'px-4 pb-4' + (title ? '' : ' pt-4') : ''}>{children}</div>
    </section>
  )
}

export function Stat({ label, value, hint, tone, href }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'bad' | 'warn' | 'ok'; href?: string }) {
  const color = tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-ink'
  const body = <>
    <div className="text-xs text-mute">{label}</div>
    <div className={`num text-2xl font-semibold leading-tight mt-0.5 ${color}`}>{value}</div>
    {hint && <div className="text-xs text-ink2 mt-0.5">{hint}</div>}
  </>
  const cls = 'block bg-card border border-line rounded-xl px-4 py-3 no-underline text-inherit'
  return href ? <a href={href} className={cls + ' hover:border-brand'}>{body}</a> : <div className={cls}>{body}</div>
}

export function PageHead({ title, desc, legacy, actions }: { title: string; desc?: string; legacy?: string[]; actions?: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-semibold tracking-tight">{title}</h1>
          {desc && <p className="m-0 mt-0.5 text-ink2 max-w-[75ch]">{desc}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {legacy && legacy.length > 0 && (
        <details className="mt-2 text-xs text-mute">
          <summary className="cursor-pointer select-none">Eski panelde {legacy.length} ayrı ekranın yerine geçer</summary>
          <div className="mt-1.5 flex flex-wrap gap-1">{legacy.map(l => <code key={l} className="rounded bg-card border border-line px-1.5 py-0.5">{l}</code>)}</div>
        </details>
      )}
    </div>
  )
}

export function Tabs<T extends string>({ items, value, onChange }: { items: { key: T; label: string; count?: number; tone?: Tone }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
      {items.map(i => (
        <button key={i.key} role="tab" aria-selected={value === i.key} onClick={() => onChange(i.key)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 h-8 text-sm whitespace-nowrap ${value === i.key ? 'bg-ink text-bg border-ink font-medium' : 'bg-card border-line text-ink2 hover:bg-bg'}`}>
          {i.label}
          {i.count !== undefined && <span className={`num rounded-full px-1.5 text-xs ${value === i.key ? 'bg-bg/20' : i.tone === 'bad' && i.count > 0 ? 'bg-bad-soft text-bad' : 'bg-bg text-mute'}`}>{fmtNum(i.count)}</span>}
        </button>
      ))}
    </div>
  )
}

export function Drawer({ open, title, sub, onClose, children, footer }: { open: boolean; title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-[560px] h-full bg-card border-l border-line flex flex-col shadow-2xl">
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-line">
          <div className="min-w-0"><div className="text-base font-semibold truncate">{title}</div>{sub && <div className="text-xs text-mute mt-0.5">{sub}</div>}</div>
          <button onClick={onClose} aria-label="Kapat" className="rounded-md p-1.5 hover:bg-bg border-0 bg-transparent text-ink2"><X size={18} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">{children}</div>
        {footer && <footer className="px-5 py-3 border-t border-line flex flex-wrap gap-2">{footer}</footer>}
      </aside>
    </div>
  )
}

export function Pager({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size))
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-line text-xs text-ink2">
      <span className="num">{total === 0 ? '0 kayıt' : `${fmtNum((page - 1) * size + 1)}–${fmtNum(Math.min(total, page * size))} / ${fmtNum(total)} kayıt`}</span>
      <span className="flex items-center gap-1">
        <Btn variant="ghost" className="!px-2" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Önceki sayfa"><ChevronLeft size={16} /></Btn>
        <span className="num">{page} / {pages}</span>
        <Btn variant="ghost" className="!px-2" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Sonraki sayfa"><ChevronRight size={16} /></Btn>
      </span>
    </div>
  )
}

export const th = 'px-3 py-2 text-left text-xs font-medium text-mute whitespace-nowrap border-b border-line'
export const td = 'px-3 py-2 align-middle border-b border-line'
export const sel = 'h-8 rounded-md border border-line bg-card px-2 text-sm max-w-full'

export function Chan({ acc, short }: { acc: string; short?: boolean }) {
  const a = account(acc), c = CHANNEL[a.type]
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <span className="inline-block size-2 rounded-full shrink-0" style={{ background: c.color }} />
      <span className="truncate">{c.label}{!short && <span className="text-mute"> · {a.name}</span>}</span>
    </span>
  )
}

export function Bars({ data, height = 120, fmt = fmtNum }: { data: { label: string; value: number; mark?: boolean }[]; height?: number; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map(d => (
          <div key={d.label} title={`${d.label}: ${fmt(d.value)}`} className="flex-1 min-w-0 rounded-t-sm hover:opacity-70"
            style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, background: d.mark ? 'var(--violet)' : 'var(--brand)' }} />
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-mute mt-1 num"><span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span></div>
    </div>
  )
}

export function HBars({ data, fmt = fmtNum }: { data: { label: ReactNode; value: number; color?: string }[]; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div className="space-y-1.5">
      {data.map((d, i) => (
        <div key={i} className="grid grid-cols-[minmax(90px,32%)_1fr_auto] items-center gap-2 text-sm">
          <span className="truncate text-ink2">{d.label}</span>
          <span className="h-3 rounded bg-bg overflow-hidden"><span className="block h-full rounded" style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? 'var(--brand)' }} /></span>
          <span className="num text-right min-w-[72px]">{fmt(d.value)}</span>
        </div>
      ))}
    </div>
  )
}

export const Empty = ({ children }: { children: ReactNode }) => <div className="px-4 py-10 text-center text-mute">{children}</div>
