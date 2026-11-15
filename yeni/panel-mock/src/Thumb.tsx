/* Ürün görseli: gerçek fotoğraf (128 piksel, WebP, geç yüklenir). Fotoğrafı olmayan ürün türü için
   kategoriye göre çizilmiş hafif bir SVG'ye düşer.
   Görseli olmayan ürün kesik çizgili kutuyla görünür; veri kalitesi sorunu ilk bakışta fark edilir. */
import type { ReactNode } from 'react'
import { ImageOff } from 'lucide-react'
import type { Product } from './data'
import { PHOTO } from './photos'

const TINT: Record<string, [string, string]> = {
  'Parfüm': ['#f3e8ff', '#7c3aed'], 'Toner': ['#e0f2fe', '#0369a1'], 'Elektronik': ['#e3e7fb', '#3048c8'],
  'Ofis': ['#fef3c7', '#b45309'], 'Saat': ['#dcfce7', '#15803d'], '3D baskı': ['#ffe4e6', '#be123c'],
}
const ART: Record<string, ReactNode> = {
  'Parfüm': <><rect x="16" y="6" width="8" height="5" rx="1.5" /><rect x="18" y="11" width="4" height="4" opacity=".55" /><rect x="10" y="15" width="20" height="20" rx="4" /><rect x="14" y="21" width="12" height="8" rx="1.5" fill="#fff" opacity=".55" /></>,
  'Toner': <><rect x="5" y="14" width="30" height="14" rx="3" /><rect x="8" y="10" width="12" height="5" rx="1.5" opacity=".6" /><circle cx="29" cy="21" r="3.2" fill="#fff" opacity=".6" /><rect x="9" y="19" width="12" height="2.2" rx="1" fill="#fff" opacity=".55" /><rect x="9" y="23" width="8" height="2.2" rx="1" fill="#fff" opacity=".4" /></>,
  'Elektronik': <><rect x="12" y="8" width="16" height="15" rx="3.5" /><rect x="15.5" y="3.5" width="2.6" height="6" rx="1" opacity=".6" /><rect x="21.9" y="3.5" width="2.6" height="6" rx="1" opacity=".6" /><path d="M20 23v5c0 4-6 3-6 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M21 12l-3.5 5h3l-1.5 4 4-5.5h-3z" fill="#fff" opacity=".8" /></>,
  'Ofis': <><rect x="9" y="6" width="19" height="26" rx="2.5" opacity=".45" /><rect x="12" y="9" width="19" height="26" rx="2.5" /><rect x="16" y="15" width="11" height="2.2" rx="1" fill="#fff" opacity=".7" /><rect x="16" y="20" width="11" height="2.2" rx="1" fill="#fff" opacity=".55" /><rect x="16" y="25" width="7" height="2.2" rx="1" fill="#fff" opacity=".45" /></>,
  'Saat': <><rect x="15" y="3" width="10" height="9" rx="2" opacity=".55" /><rect x="15" y="28" width="10" height="9" rx="2" opacity=".55" /><rect x="10" y="10" width="20" height="20" rx="6" /><path d="M20 15v5.5l3.5 2.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".85" /></>,
  '3D baskı': <><circle cx="20" cy="20" r="14" /><circle cx="20" cy="20" r="9" fill="none" stroke="#fff" strokeWidth="2" opacity=".5" /><circle cx="20" cy="20" r="4" fill="#fff" opacity=".85" /><path d="M32 26c3 1 4 4 2 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></>,
}

export function Thumb({ p, size = 36, className = '' }: { p: Pick<Product, 'name' | 'cat' | 'image'>; size?: number; className?: string }) {
  const r = Math.max(6, Math.round(size * 0.22))
  if (!p.image) return (
    <span title="Görsel eksik" className={`shrink-0 grid place-items-center border border-dashed border-bad/60 bg-bad-soft text-bad ${className}`} style={{ width: size, height: size, borderRadius: r }}>
      <ImageOff size={Math.round(size * 0.42)} aria-label="Görsel eksik" />
    </span>
  )
  const photo = PHOTO[p.name]
  if (photo) return (
    <span className={`thumb shrink-0 block overflow-hidden bg-bg ring-1 ring-line ${className}`} style={{ width: size, height: size, borderRadius: r }}>
      <img src={photo} alt={p.name} width={size} height={size} loading="lazy" decoding="async" />
    </span>
  )
  const [bg, fg] = TINT[p.cat] ?? ['#e3e7fb', '#3048c8']
  return (
    <span className={`thumb shrink-0 grid place-items-center overflow-hidden ${className}`} style={{ width: size, height: size, borderRadius: r, background: bg, color: fg }}>
      <svg viewBox="0 0 40 40" width={size * 0.78} height={size * 0.78} fill="currentColor" role="img" aria-label={`${p.cat} ürün görseli`}>{ART[p.cat] ?? ART['Ofis']}</svg>
    </span>
  )
}

/* Bir siparişin kalemleri: ilk görsel + kaç kalem daha olduğu. */
export function ThumbStack({ items, size = 32 }: { items: Pick<Product, 'name' | 'cat' | 'image'>[]; size?: number }) {
  if (!items.length) return null
  return (
    <span className="relative shrink-0 inline-block" style={{ width: size, height: size }} title={items.map(i => i.name).join(' · ')}>
      <Thumb p={items[0]} size={size} />
      {items.length > 1 && <span className="num absolute -bottom-1 -right-1.5 rounded-full bg-ink text-bg text-[10px] font-semibold px-1 leading-4 ring-2 ring-card">+{items.length - 1}</span>}
    </span>
  )
}
