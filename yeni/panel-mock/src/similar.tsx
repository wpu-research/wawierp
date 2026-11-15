/* Benzer ürün bulma: bir ürüne, stoktaki diğer markalardan en yakın ürünleri çıkarır.
   Benzerlik ürün özelliklerinden hesaplanır (tür ve etiketler: koku ailesi, malzeme, bağlantı tipi gibi).
   Özelliği girilmemiş üründe yalnız kategori ve fiyata bakılır; sonuç kaba olur ve bu açıkça söylenir.
   Gerçek sistemde özellikler ürün kartından gelir; eksik olanları asistan ürün metninden önerir, kullanıcı onaylar. */
import type { Product } from './data'
import { fmtMoney, fmtNum } from './data'
import { Thumb } from './Thumb'

const T = (tur: string, ...ozellik: string[]) => ({ tur, ozellik })
export const TRAITS: Record<string, { tur: string; ozellik: string[] }> = {
  'Eau de Parfum Noir 100 ml': T('Parfüm', 'odunsu', 'amber', 'baharatlı', 'akşam'),
  'Eau de Toilette Citrus 50 ml': T('Parfüm', 'narenciye', 'ferah', 'gündüz'),
  'Body Mist Vanilla 200 ml': T('Vücut spreyi', 'vanilya', 'tatlı', 'gündüz'),
  'Parfüm Seti Classic 3×30 ml': T('Parfüm seti', 'hediye', 'odunsu', 'narenciye'),
  'Oud Intense 75 ml': T('Parfüm', 'odunsu', 'ud', 'baharatlı', 'akşam'),
  'Amber Wood 100 ml': T('Parfüm', 'odunsu', 'amber', 'akşam'),
  'Kolonya Limon 400 ml': T('Kolonya', 'narenciye', 'ferah'),
  'Deo Sprey Sport 150 ml': T('Deodorant', 'ferah', 'gündüz', 'spor'),
  'Toner Kartuş Siyah TN-2420 uyumlu': T('Toner kartuşu', 'siyah', 'lazer yazıcı'),
  'Toner Kartuş 4 Renk Set CF410X uyumlu': T('Toner kartuşu', 'renkli', 'lazer yazıcı', 'set'),
  'Drum Ünitesi DR-2400 uyumlu': T('Drum ünitesi', 'lazer yazıcı'),
  'Mürekkep Kartuşu 305XL siyah': T('Mürekkep kartuşu', 'siyah', 'mürekkepli yazıcı'),
  'Mürekkep Kartuşu 305XL renkli': T('Mürekkep kartuşu', 'renkli', 'mürekkepli yazıcı'),
  'Etiket Rulosu 62 mm DK-22205 uyumlu': T('Etiket rulosu', 'termal'),
  'Kol Saati Chrono 42 mm çelik': T('Kol saati', 'çelik', 'analog', 'spor'),
  'Kol Saati Slim 38 mm deri': T('Kol saati', 'deri', 'analog', 'ince'),
  'Akıllı Saat Fit S2': T('Akıllı saat', 'dijital', 'spor'),
  'Saat Kordonu 20 mm silikon': T('Saat kordonu', 'silikon', 'spor'),
  'Bluetooth Kulaklık Air 3': T('Kulaklık', 'kablosuz', 'bluetooth'),
  'USB-C Şarj Aleti 65 W GaN': T('Şarj aleti', 'usb-c', 'hızlı şarj'),
  'Powerbank 20.000 mAh': T('Powerbank', 'usb-c', 'hızlı şarj', 'taşınabilir'),
  'HDMI Kablo 2.1 · 2 m': T('Kablo', 'hdmi'),
  'Kablosuz Mouse Silent': T('Mouse', 'kablosuz', 'bilgisayar çevre birimi'),
  'Mekanik Klavye TKL DE düzen': T('Klavye', 'kablolu', 'bilgisayar çevre birimi'),
  'Webcam 1080p': T('Webcam', 'usb', 'bilgisayar çevre birimi'),
  'LED Şerit 5 m RGB': T('Aydınlatma', 'led', 'rgb'),
  'PLA Filament 1,75 mm 1 kg siyah': T('Filament', 'pla', '1,75 mm'),
  'PLA Filament 1,75 mm 1 kg beyaz': T('Filament', 'pla', '1,75 mm'),
  'PETG Filament 1,75 mm 1 kg şeffaf': T('Filament', 'petg', '1,75 mm'),
  'Masa Lambası LED katlanır': T('Aydınlatma', 'led'),
}

const lower = (s: string) => s.toLocaleLowerCase('tr-TR')
/** Tüm depolardaki sayılmış fiziki stok toplamı (eksi ve sayılmamış kayıtlar sıfır sayılır). */
export const inStock = (p: Product) => Object.values(p.stock).reduce((s, r) => s + Math.max(0, r?.fiziki ?? 0), 0)

export interface Similar { p: Product; stok: number; ortak: string[]; kaba: boolean; puan: number }

export function similarTo(p: Product, all: Product[], opt: { otherBrands?: boolean; limit?: number } = {}): Similar[] {
  const a = TRAITS[p.name]
  const out: Similar[] = []
  for (const o of all) {
    if (o.id === p.id || o.cat !== p.cat) continue
    if (opt.otherBrands !== false && o.brand === p.brand) continue
    const stok = inStock(o)
    if (stok <= 0) continue
    const b = TRAITS[o.name]
    const ayniTur = !!a && !!b && a.tur === b.tur
    const ortak = a && b ? a.ozellik.filter(x => b.ozellik.includes(x)) : []
    const yakin = Math.abs(o.price - p.price) <= Math.max(p.price, o.price) * 0.25
    const puan = (ayniTur ? 4 : 0) + ortak.length * 2 + (1 - Math.abs(o.price - p.price) / Math.max(p.price, o.price))
    const kaba = !ayniTur && !ortak.length
    out.push({ p: o, stok, kaba, puan, ortak: [...(ayniTur ? [`aynı tür: ${lower(b.tur)}`] : []), ...ortak, ...(yakin ? ['yakın fiyat'] : [])] })
  }
  // Özellikten eşleşen varsa yalnız onlar; hiç yoksa kategori ve fiyata göre kaba liste.
  const iyi = out.filter(x => !x.kaba)
  return (iyi.length ? iyi : out).sort((x, y) => y.puan - x.puan).slice(0, opt.limit ?? 5)
}

const SKIP = new Set(['adet', 'uyumlu', 'için', 'olan', 'ürün', 'ürüne', 'ürünü', 'ürünün', 'benzer', 'benzeri', 'göster', 'stokta', 'diğer', 'marka', 'markaların', 'ürünlerini'])
const words = (s: string) => lower(s).split(/[^\p{L}\p{N}-]+/u).filter(w => w.length >= 3 && !/^\d+$/.test(w) && !SKIP.has(w))

/** Yazılan metinden ürünü bulur: önce SKU, sonra ad ve markadaki kelimelerin eşleşmesi. */
export function findProduct(text: string, all: Product[]): Product | undefined {
  const t = lower(text)
  const bySku = all.find(p => t.includes(lower(p.sku)))
  if (bySku) return bySku
  const tw = new Set(words(text))
  let best: Product | undefined, top = 0
  for (const p of all) {
    const nameHits = words(p.name).filter(w => tw.has(w)).length
    const score = nameHits * 2 + words(p.brand).filter(w => tw.has(w)).length
    if (nameHits > 0 && score > top) { top = score; best = p }
  }
  return best
}

/** Benzer ürün satırları: fotoğraf, ad, marka, stok, fiyat ve neden benzediği. */
export function SimilarList({ items, onPick }: { items: Similar[]; onPick?: (id: string) => void }) {
  return (
    <ul className="m-0 p-0 list-none border border-line rounded-lg divide-y divide-line bg-card">
      {items.map(s => {
        const inner = <>
          <Thumb p={s.p} size={40} />
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink truncate">{s.p.name}</span>
            <span className="block text-xs text-ink2"><span className="font-medium">{s.p.brand}</span> · stokta <span className="num">{fmtNum(s.stok)}</span> · <span className="num">{fmtMoney(s.p.price, 'EUR')}</span></span>
            <span className="block text-xs text-mute truncate">{s.kaba ? 'yalnız kategori ve fiyat' : s.ortak.join(' · ')}</span>
          </span>
        </>
        return (
          <li key={s.p.id}>
            {onPick
              ? <button onClick={() => onPick(s.p.id)} className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-bg">{inner}</button>
              : <a href={`#/catalog?p=${s.p.id}`} className="px-3 py-2 flex items-center gap-2.5 no-underline hover:bg-bg">{inner}</a>}
          </li>
        )
      })}
    </ul>
  )
}
