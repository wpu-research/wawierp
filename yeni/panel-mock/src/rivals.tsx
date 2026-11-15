/* Rakip teklifleri: aynı ürünü (aynı EAN) aynı platformda satan diğer satıcılar ve bizim sıramız.
   Taslakta teklifler örnek veridir; ürün ve platforma göre hep aynı sonucu verecek biçimde üretilir.
   Gerçek sistemde pazaryerinin kendi arayüzünden EAN ile çekilir; EAN'ı olmayan ürün eşleştirilemez.
   Sıralama müşterinin ödediği toplam tutara (fiyat + kargo) göredir. */
import { CHANNEL, account, fmtMoney, type ChannelType, type Cur, type Product } from './data'
import { Badge } from './ui'

const SELLERS: Record<'eu' | 'tr', string[]> = {
  eu: ['Duftwelt24', 'PreisKönig', 'NordShop', 'Elbe Trade', 'Markt Direkt', 'Alpen Handel', 'HansaStore', 'Rhein Versand', 'MegaDeal24', 'Kontor Nord'],
  tr: ['Mavi Sepet', 'Hızlı Al', 'Çarşı Online', 'Boğaz Ticaret', 'Kapıda Market', 'Anadolu Stok', 'Yıldız Pazarlama', 'Ege Dükkân'],
}
// Bu taslakta yalnız pazaryerlerinde rakip aranır; kendi mağazamızda (Shopify, web mağazası) aynı ilanda başka satıcı olmaz.
const MARKET: ChannelType[] = ['ebay', 'kaufland', 'otto', 'metro', 'amazon', 'trendyol', 'n11', 'ozon']

function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

export interface Offer { satici: string; biz: boolean; fiyat: number; kargo: number; toplam: number; teslim: number; puan: number | null }
export interface Market { type: ChannelType; label: string; cur: Cur; teklifler: Offer[]; sira: number; enUcuz: number; fark: number }
export interface Rivals { ean: string | null; pazarlar: Market[]; ilanYok: boolean }

export function rivalsOf(p: Product): Rivals {
  const live = p.listings.filter(l => l.status === 'aktif' && MARKET.includes(account(l.acc).type))
  if (!p.ean) return { ean: null, pazarlar: [], ilanYok: !live.length }
  const byType = new Map<ChannelType, typeof live>()
  for (const l of live) { const t = account(l.acc).type; byType.set(t, [...(byType.get(t) ?? []), l]) }
  const pazarlar: Market[] = []
  for (const [type, ls] of byType) {
    const cur = account(ls[0].acc).cur, r = rng(p.id + type), base = Math.min(...ls.map(l => l.price))
    const round = (v: number) => Math.round(v * 100) / 100
    const ship = (free: boolean) => (free ? 0 : round(base * 0.04 + (cur === 'TRY' ? 40 : cur === 'USD' ? 4 : 3.9)))
    const names = [...SELLERS[cur === 'TRY' ? 'tr' : 'eu']].sort(() => r() - 0.5)
    const teklifler: Offer[] = ls.map(l => ({ satici: account(l.acc).name, biz: true, fiyat: l.price, kargo: ship(true), toplam: l.price, teslim: 2, puan: null }))
    const n = 2 + Math.floor(r() * 4)
    for (let i = 0; i < n; i++) {
      const fiyat = round(base * (0.86 + r() * 0.3)), kargo = ship(r() < 0.45)
      teklifler.push({ satici: names[i], biz: false, fiyat, kargo, toplam: round(fiyat + kargo), teslim: 1 + Math.floor(r() * 5), puan: Math.round((4 + r()) * 10) / 10 })
    }
    teklifler.sort((a, b) => a.toplam - b.toplam)
    const sira = teklifler.findIndex(o => o.biz) + 1, enUcuz = teklifler[0].toplam, bizim = teklifler[sira - 1].toplam
    pazarlar.push({ type, label: CHANNEL[type].label, cur, teklifler, sira, enUcuz, fark: round(bizim - enUcuz) })
  }
  return { ean: p.ean, pazarlar: pazarlar.sort((a, b) => b.fark / b.enUcuz - a.fark / a.enUcuz), ilanYok: !live.length }
}

/** Platform başına rakip teklifleri; bizim satırlar vurgulu. */
export function RivalList({ r, max = 4 }: { r: Rivals; max?: number }) {
  if (!r.ean) return <p className="m-0 text-mute">Bu ürünün barkodu (EAN) eksik; rakip teklifleri barkodla eşleştiği için bulunamaz.</p>
  if (!r.pazarlar.length) return <p className="m-0 text-mute">Bu ürünün pazaryerinde aktif ilanı yok; karşılaştırılacak teklif de yok.</p>
  return (
    <div className="space-y-2">
      {r.pazarlar.map(m => {
        // En ucuz teklifler gösterilir; bizim satır sıraya girmese de listeye eklenir.
        const top = m.teklifler.slice(0, max), rows = top.some(o => o.biz) ? top : [...top.slice(0, max - 1), m.teklifler[m.sira - 1]]
        return (
          <div key={m.type} className="border border-line rounded-lg bg-card overflow-hidden">
            <div className="px-3 py-1.5 flex items-center justify-between gap-2 bg-bg border-b border-line">
              <span className="inline-flex items-center gap-1.5 font-medium text-sm"><span className="inline-block size-2 rounded-full" style={{ background: CHANNEL[m.type].color }} />{m.label}<span className="text-mute font-normal">· {m.teklifler.length} satıcı</span></span>
              {m.sira === 1 ? <Badge tone="ok">En ucuz sizsiniz</Badge> : <Badge tone={m.fark / m.enUcuz > 0.08 ? 'bad' : 'warn'} title="Müşterinin ödediği toplam tutara (fiyat + kargo) göre">{m.sira}. sıra · {fmtMoney(m.fark, m.cur)} pahalı</Badge>}
            </div>
            <ul className="m-0 p-0 list-none divide-y divide-line text-sm">
              {rows.map(o => (
                <li key={o.satici + o.toplam} className={`px-3 py-1.5 flex items-center justify-between gap-2 ${o.biz ? 'bg-brand-soft/50' : ''}`}>
                  <span className="min-w-0">
                    <span className={`block truncate ${o.biz ? 'font-semibold text-ink' : 'text-ink'}`}>{o.biz ? `Biz · ${o.satici}` : o.satici}</span>
                    <span className="block text-xs text-mute">{o.teslim} günde teslim{o.puan !== null && <> · puan <span className="num">{o.puan.toLocaleString('tr-TR')}</span></>}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block num font-medium">{fmtMoney(o.toplam, m.cur)}</span>
                    <span className="block text-xs text-mute num">{o.kargo ? `${fmtMoney(o.fiyat, m.cur)} + ${fmtMoney(o.kargo, m.cur)} kargo` : 'kargo dahil'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
