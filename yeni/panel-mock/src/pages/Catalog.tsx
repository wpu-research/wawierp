import { useEffect, useMemo, useState } from 'react'
import { ImageOff, Search, Sparkles } from 'lucide-react'
import { LISTING_FLOW, MOVE, PRODUCTS, WAREHOUSES, fmtDT, fmtMoney, fmtNum, product, stockState, whName, account, type ListingStatus, type Move, type MoveType, type Product, type WhId } from '../data'
import { useStore } from '../store'
import { Thumb } from '../Thumb'
import { SimilarList, similarTo } from '../similar'
import { RivalList, rivalsOf } from '../rivals'
import { askAssistant } from '../Chat'
import { Badge, Card, Chan, Drawer, Empty, PageHead, Pager, Stat, Tabs, sel, td, th, type Tone, rowProps } from '../ui'

const LTONE: Record<ListingStatus, Tone> = { havuzda: 'neutral', hazirlaniyor: 'warn', onizleme: 'info', gonderildi: 'violet', aktif: 'ok', sorunlu: 'bad', kaldirildi: 'neutral' }
export const listingBadge = (s: ListingStatus, reason?: string) => <Badge tone={LTONE[s]} title={reason}>{LISTING_FLOW.find(l => l.key === s)!.label}{reason ? ` · ${reason}` : ''}</Badge>

export function StockCell({ v }: { v: number | null }) {
  const s = stockState(v)
  if (s === 'sayim-yok') return <Badge tone="neutral" title="Sayılmamış; sıfır stok değildir">Hiç sayılmadı</Badge>
  const tone: Tone = s === 'negatif' ? 'bad' : s === 'tukendi' ? 'bad' : s === 'alarm' || s === 'kritik' ? 'warn' : 'ok'
  return <span className="inline-flex items-center gap-1.5"><span className="num font-medium">{fmtNum(v!)}</span>{s !== 'var' && <Badge tone={tone}>{s === 'negatif' ? 'Eksi stok' : s === 'tukendi' ? 'Tükendi' : s === 'alarm' ? 'Alarm' : 'Kritik'}</Badge>}</span>
}

type View = 'all' | 'ean' | 'gorsel' | 'kritik' | 'negatif' | 'sayim'
export default function Catalog({ query }: { query: URLSearchParams }) {
  const { products, whId, moves } = useStore()
  const [view, setView] = useState<View>('all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  useEffect(() => { const v = query.get('view') as View | null; if (v && ['all', 'ean', 'gorsel', 'kritik', 'negatif', 'sayim'].includes(v)) setView(v); const p = query.get('p'); if (p) setOpenId(p) }, [query])

  const rowsOf = (p: Product) => (Object.entries(p.stock) as [WhId, NonNullable<Product['stock'][WhId]>][]).filter(([w]) => !whId || w === whId)
  const has = (p: Product, ...st: string[]) => rowsOf(p).some(([, s]) => st.includes(stockState(s.fiziki)))
  const F: Record<View, (p: Product) => boolean> = {
    all: () => true, ean: p => !p.ean, gorsel: p => !p.image, kritik: p => has(p, 'kritik', 'alarm', 'tukendi'), negatif: p => has(p, 'negatif'), sayim: p => has(p, 'sayim-yok'),
  }
  const counts = useMemo(() => Object.fromEntries((Object.keys(F) as View[]).map(k => [k, products.filter(F[k]).length])) as Record<View, number>, [products, whId])
  const s = q.trim().toLowerCase()
  const rows = products.filter(p => F[view](p) && (!s || [p.name, p.sku, p.ean ?? '', p.brand].some(x => x.toLowerCase().includes(s))))
  const open = openId ? product(openId) : null
  // Adresteki ürün kimliği kapatınca silinir; yoksa aynı bağlantıya yeniden basmak pencereyi açmaz.
  const closeDrawer = () => { setOpenId(null); if (location.hash.includes('?p=')) history.replaceState(null, '', '#/catalog') }
  const rivals = useMemo(() => (open ? rivalsOf(open) : null), [open])
  const similar = useMemo(() => (open ? similarTo(open, products, { limit: 4 }) : []), [open, products])

  return (
    <>
      <PageHead title="Katalog" desc="Ortak ürün kartı tek yerde; fiyat ve stok depo bazında, ilanlar kanal bazında kartın altında görünür."
        legacy={['products', 'pool', 'warehouse', 'product-detail', 'warehouse-product', 'missing-product-eans', 'missing-product-images', 'problem-products', 'critical-physical-stock']} />
      <Tabs value={view} onChange={setView} items={[
        { key: 'all', label: 'Tümü', count: counts.all }, { key: 'ean', label: 'EAN eksik', count: counts.ean, tone: 'bad' },
        { key: 'gorsel', label: 'Görsel eksik', count: counts.gorsel, tone: 'bad' }, { key: 'kritik', label: 'Kritik stok', count: counts.kritik, tone: 'bad' },
        { key: 'negatif', label: 'Eksi stok', count: counts.negatif, tone: 'bad' }, { key: 'sayim', label: 'Hiç sayılmadı', count: counts.sayim },
      ]} />
      <Card pad={false} className="mt-2">
        <div className="p-3 border-b border-line flex flex-wrap items-center gap-2">
          <label className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={15} className="absolute left-2.5 top-2 text-mute" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ürün adı, SKU, EAN ya da marka" aria-label="Katalogda ara" className="w-full h-8 rounded-md border border-line bg-card pl-8 pr-2 text-sm" />
          </label>
          <span className="text-xs text-mute ml-auto">{PRODUCTS.length} örnek kart · gerçek katalog ≈232.500</span>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Ürün</th><th className={th}>SKU · EAN</th><th className={th}>Kaynak</th><th className={th}>Fiziki stok (depo)</th><th className={th + ' text-right'}>Drop</th><th className={th + ' text-right'}>Sanal</th><th className={th + ' text-right'}>Fiyat</th><th className={th}>İlan</th></tr></thead>
            <tbody>
              {rows.map(p => {
                const sr = rowsOf(p), act = p.listings.filter(l => l.status === 'aktif').length, bad = p.listings.filter(l => l.status === 'sorunlu').length
                return (
                  <tr key={p.id} className="hover:bg-bg cursor-pointer" {...rowProps(() => setOpenId(p.id))}>
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <Thumb p={p} size={40} />
                        <div className="min-w-0"><div className="font-medium truncate max-w-[280px]">{p.name}</div><div className="text-xs text-mute">{p.brand} · {p.cat}</div></div>
                      </div>
                    </td>
                    <td className={td}><div className="num">{p.sku}</div><div className="text-xs num">{p.ean ? <span className="text-mute">{p.ean}</span> : <span className="text-bad">EAN eksik</span>}</div></td>
                    <td className={td + ' text-ink2 whitespace-nowrap'}>{p.source}</td>
                    <td className={td}><div className="space-y-0.5">{sr.map(([w, st]) => <div key={w} className="flex items-center gap-2 whitespace-nowrap"><span className="text-xs text-mute w-20 truncate">{whName(w)}</span><StockCell v={st.fiziki} /></div>)}</div></td>
                    <td className={td + ' text-right num'}>{fmtNum(sr.reduce((a, [, x]) => a + x.drop, 0)) }</td>
                    <td className={td + ' text-right num'}>{fmtNum(sr.reduce((a, [, x]) => a + x.sanal, 0))}</td>
                    <td className={td + ' text-right num whitespace-nowrap'}>{fmtMoney(p.price)}</td>
                    <td className={td}><span className="flex gap-1"><Badge tone={act ? 'ok' : 'neutral'}>{act} aktif</Badge>{bad > 0 && <Badge tone="bad">{bad} sorunlu</Badge>}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <Empty>Bu görünümde ürün yok.</Empty>}
        </div>
      </Card>

      <Drawer open={!!open} onClose={closeDrawer} title={open?.name} sub={open && <span className="num">{open.sku} · {open.ean ?? 'EAN eksik'} · {open.brand}</span>}>
        {open && <>
          <div>
            <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide">Stok hesapları</h3>
            <div className="overflow-x-auto border border-line rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead><tr><th className={th}>Depo</th><th className={th}>Fiziki</th><th className={th + ' text-right'}>Sanal</th><th className={th + ' text-right'}>Drop</th><th className={th + ' text-right'}>Tedarikçi</th><th className={th}>Raf</th></tr></thead>
                <tbody>{(Object.entries(open.stock) as [WhId, NonNullable<Product['stock'][WhId]>][]).map(([w, st]) => (
                  <tr key={w}><td className={td}>{whName(w)}</td><td className={td}><StockCell v={st.fiziki} /></td><td className={td + ' text-right num'}>{st.sanal}</td><td className={td + ' text-right num'}>{fmtNum(st.drop)}</td><td className={td + ' text-right num'}>{fmtNum(st.tedarikci)}</td><td className={td + ' num'}>{st.bin}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <p className="m-0 mt-1.5 text-xs text-mute">Dört hesap ayrı tutulur; her sayı stok defterindeki hareketlerin toplamıdır.</p>
          </div>
          <div>
            <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide">İlanlar ({open.listings.length})</h3>
            {open.listings.length === 0 ? <p className="m-0 text-mute">Hiçbir kanalda ilan yok.</p> : (
              <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
                {open.listings.map(l => <li key={l.acc} className="px-3 py-2 flex items-center justify-between gap-2"><Chan acc={l.acc} /><span className="flex items-center gap-2 shrink-0"><span className="num text-ink2">{fmtMoney(l.price, account(l.acc).cur)}</span>{listingBadge(l.status, l.reason)}</span></li>)}
              </ul>
            )}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h3 className="m-0 text-xs font-semibold text-mute uppercase tracking-wide">Rakipler · aynı ürün, aynı platform</h3>
              <button onClick={() => askAssistant(`${open.name} ürününü rakipler aynı platformlarda kaça satıyor?`)} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Sparkles size={12} />Asistana sor</button>
            </div>
            {rivals && <RivalList r={rivals} />}
            <p className="m-0 mt-1.5 text-xs text-mute">Aynı barkodu satan diğer satıcılar; sıra müşterinin ödediği toplam tutara göre. Taslakta örnek veri; gerçek sistemde pazaryerinden çekilir.</p>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h3 className="m-0 text-xs font-semibold text-mute uppercase tracking-wide">Benzer ürünler · diğer markalar</h3>
              <button onClick={() => askAssistant(`${open.name} ürününe benzer, stokta olan diğer markaların ürünlerini göster`)} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Sparkles size={12} />Asistana sor</button>
            </div>
            {similar.length === 0 ? <p className="m-0 text-mute">Stokta, başka markadan benzer ürün yok.</p> : <SimilarList items={similar} onPick={setOpenId} />}
            <p className="m-0 mt-1.5 text-xs text-mute">Yalnız stokta olanlar. Benzerlik ürün türü, ortak özellikler ve fiyattan hesaplanır; özelliği girilmemiş üründe yalnız kategori ve fiyata bakılır.</p>
          </div>
          <div>
            <h3 className="m-0 mb-1.5 text-xs font-semibold text-mute uppercase tracking-wide">Son stok hareketleri</h3>
            <MoveList moves={moves.filter(m => m.pid === open.id).slice(0, 8)} />
          </div>
        </>}
      </Drawer>
    </>
  )
}

function MoveList({ moves }: { moves: Move[] }) {
  if (!moves.length) return <p className="m-0 text-mute">Bu ürün için henüz stok hareketi yok.</p>
  return (
    <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line">
      {moves.map(m => (
        <li key={m.id} className="px-3 py-2 flex items-center justify-between gap-3">
          <div className="min-w-0"><div>{MOVE[m.type]} <span className="text-mute">· {whName(m.wh)}</span></div><div className="text-xs text-mute num truncate">{fmtDT(m.t)} · {m.user} · {m.ref}</div></div>
          <div className="num text-right whitespace-nowrap"><span className="text-mute">{m.before} → </span><b>{m.after}</b> <span className={m.after - m.before < 0 ? 'text-bad' : 'text-ok'}>({m.after - m.before > 0 ? '+' : ''}{m.after - m.before})</span></div>
        </li>
      ))}
    </ul>
  )
}

const SIZE = 20
export function Stock() {
  const { whId, products, moves } = useStore()
  const [type, setType] = useState<MoveType | ''>('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => moves.filter(m => (!whId || m.wh === whId) && (!type || m.type === type)), [moves, whId, type])
  useEffect(() => setPage(1), [whId, type])
  const tot = useMemo(() => {
    let fiziki = 0, sanal = 0, drop = 0, ted = 0, unk = 0
    for (const p of products) for (const [w, s] of Object.entries(p.stock)) if (!whId || w === whId) { if (s!.fiziki === null) unk++; else fiziki += s!.fiziki; sanal += s!.sanal; drop += s!.drop; ted += s!.tedarikci }
    return { fiziki, sanal, drop, ted, unk }
  }, [products, whId])
  return (
    <>
      <PageHead title="Stok defteri" desc="Her stok değişikliği değişmez bir satırdır. Fiziki, sanal, drop ve tedarikçi stoğu ayrı hesaplardır; ekrandaki bütün stok sayıları bu defterden türetilir."
        legacy={['stock-movements', 'physical-stock-check', 'stock-transfer (geçmiş)', 'warehouse-product (işlem geçmişi)']} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Fiziki (sayılmış)" value={fmtNum(tot.fiziki)} hint={`${tot.unk} kayıtta sayım yok`} />
        <Stat label="İlana açılacak miktar" value={fmtNum(tot.sanal)} hint="Fiziki sayımı değiştirmez" />
        <Stat label="Drop" value={fmtNum(tot.drop)} hint="Tedarikçiden karşılanır" />
        <Stat label="Tedarikçi API stoğu" value={fmtNum(tot.ted)} hint="Son okuma kanal işlerinde" />
      </div>
      <Card pad={false}>
        <div className="p-3 border-b border-line flex flex-wrap items-center gap-2">
          <select className={sel} value={type} onChange={e => setType(e.target.value as MoveType | '')} aria-label="Hareket türü">
            <option value="">Tüm hareket türleri</option>
            {(Object.keys(MOVE) as MoveType[]).map(k => <option key={k} value={k}>{MOVE[k]}</option>)}
          </select>
          <span className="text-xs text-mute ml-auto">{WAREHOUSES.length} depo · hesap: fiziki</span>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Zaman</th><th className={th}>Ürün</th><th className={th}>Depo</th><th className={th}>Hareket</th><th className={th + ' text-right'}>Önce</th><th className={th + ' text-right'}>Değişim</th><th className={th + ' text-right'}>Sonra</th><th className={th}>Yapan</th><th className={th}>Referans</th></tr></thead>
            <tbody>{rows.slice((page - 1) * SIZE, page * SIZE).map(m => { const p = product(m.pid), d = m.after - m.before; return (
              <tr key={m.id} className="hover:bg-bg">
                <td className={td + ' num whitespace-nowrap'}>{fmtDT(m.t)}</td>
                <td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} /><div className="min-w-0"><div className="truncate max-w-[240px]">{p.name}</div><div className="text-xs text-mute num">{p.sku}</div></div></div></td>
                <td className={td + ' whitespace-nowrap'}>{whName(m.wh)}</td>
                <td className={td}><Badge tone={m.type === 'satis' ? 'info' : m.type === 'duzeltme' ? 'warn' : 'neutral'}>{MOVE[m.type]}</Badge></td>
                <td className={td + ' text-right num text-mute'}>{m.before}</td>
                <td className={`${td} text-right num font-medium ${d < 0 ? 'text-bad' : 'text-ok'}`}>{d > 0 ? '+' : ''}{d}</td>
                <td className={`${td} text-right num font-medium ${m.after < 0 ? 'text-bad' : ''}`}>{m.after}</td>
                <td className={td + ' whitespace-nowrap text-ink2'}>{m.user}</td>
                <td className={td + ' num whitespace-nowrap text-ink2'}>{m.ref}</td>
              </tr>
            ) })}</tbody>
          </table>
          {rows.length === 0 && <Empty>Bu ürün için henüz stok hareketi yok.</Empty>}
        </div>
        <Pager page={page} size={SIZE} total={rows.length} onPage={setPage} />
      </Card>
    </>
  )
}
