// Mock veri. Sipariş sayıları ve mağaza dağılımı raw/siparis-dagilimi-30gun.json'daki
// gerçek 30 günlük toplamlardan türetilir; sipariş satırları, müşteriler, ürünler ve
// stoklar UYDURMADIR. Şirket–hesap eşlemesinin bir kısmı varsayımdır.
import dist from './dist30.json'

export const NOW = Date.parse('2026-11-14T16:52:00+01:00')
const H = 3600_000

function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const R = mulberry(20261114)
const pick = <T>(a: readonly T[]): T => a[Math.floor(R() * a.length)]
const wpick = (w: readonly number[]) => {
  let x = R() * w.reduce((a, b) => a + b, 0)
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x < 0) return i }
  return w.length - 1
}
const int = (a: number, b: number) => a + Math.floor(R() * (b - a + 1))

// ---------- Yapı ----------
export type WhId = 'ist' | 'de' | 'nl' | 'mega' | 'tw'
export type Country = 'DE' | 'NL' | 'TR'
export type Cur = 'EUR' | 'TRY' | 'USD'

// Depo sayıları gerçek panelin genel bakış ekranından (raw/panel-harita.md).
export const WAREHOUSES: { id: WhId; name: string; code: string; country: Country; products: number; physical: number; drop: number }[] = [
  { id: 'ist', name: 'Istanbul', code: 'MAIN', country: 'TR', products: 8985, physical: 13797, drop: 0 },
  { id: 'de', name: 'Almanya', code: 'DE-WH', country: 'DE', products: 122934, physical: 254160, drop: 1801761 },
  { id: 'nl', name: 'Hollanda', code: 'NL-WH', country: 'NL', products: 7926, physical: 12684, drop: 0 },
  { id: 'mega', name: 'Mega B', code: 'DE-MEGA-B', country: 'DE', products: 6651, physical: 13300, drop: 0 },
  { id: 'tw', name: 'Technowelt Almanya', code: 'DE-TECHNOWELT', country: 'DE', products: 4579, physical: 436, drop: 0 },
]
export const whName = (id: WhId) => WAREHOUSES.find(w => w.id === id)!.name

export const COMPANIES: { id: string; name: string; country: Country; wh: WhId }[] = [
  { id: 'docser', name: 'DOCSER', country: 'TR', wh: 'ist' },
  { id: 'ithal', name: 'İthal Koku', country: 'TR', wh: 'ist' },
  { id: 'ivo', name: 'Ivobuyshop', country: 'DE', wh: 'de' },
  { id: 'kaufplus', name: 'Kaufplus', country: 'DE', wh: 'de' },
  { id: 'lady', name: 'Lady Empire GmbH', country: 'DE', wh: 'de' },
  { id: 'novada', name: 'Novada Shops', country: 'DE', wh: 'de' },
  { id: 'peras', name: 'Perasshop', country: 'DE', wh: 'de' },
  { id: 'stockist', name: 'Stockist24', country: 'DE', wh: 'de' },
  { id: 'woida', name: 'Woida', country: 'DE', wh: 'de' },
  { id: 'parfum', name: 'Parfumkoopjes BV', country: 'NL', wh: 'nl' },
  { id: 'elec', name: 'Elec_texx', country: 'DE', wh: 'mega' },
  { id: 'techno', name: 'Technowelt', country: 'DE', wh: 'tw' },
]
export const company = (id: string) => COMPANIES.find(c => c.id === id)!
export const VAT: Record<Country, number> = { DE: 0.19, NL: 0.21, TR: 0.2 }

export type ChannelType = 'shopify' | 'ebay' | 'kaufland' | 'otto' | 'metro' | 'amazon' | 'webshop' | 'trendyol' | 'n11' | 'ozon'
export const CHANNEL: Record<ChannelType, { label: string; color: string }> = {
  shopify: { label: 'Shopify', color: '#5e8e3e' }, ebay: { label: 'eBay', color: '#2a78d6' },
  kaufland: { label: 'Kaufland', color: '#d03b3b' }, otto: { label: 'OTTO', color: '#c2185b' },
  metro: { label: 'METRO', color: '#1d3f8f' }, amazon: { label: 'Amazon', color: '#e08a00' },
  webshop: { label: 'Webshop', color: '#6250d6' }, trendyol: { label: 'Trendyol', color: '#eb6834' },
  n11: { label: 'N11', color: '#7a3fb0' }, ozon: { label: 'Ozon', color: '#1baf7a' },
}

export type Health = 'ok' | 'partial' | 'failed' | 'stale'
export interface Account {
  id: string; name: string; type: ChannelType; company: string; wh: WhId; cur: Cur
  health: Health; lastSync: number; note?: string
}
const META: Record<string, [ChannelType, string, WhId, string]> = {
  'Parfumverkoop.nl Shopify': ['shopify', 'parfum', 'nl', 'Parfumverkoop.nl'],
  'Mixoutlet.de Shopify': ['shopify', 'lady', 'de', 'Mixoutlet.de'],
  'N11 · DOCSER · Docks': ['n11', 'docser', 'ist', 'DOCSER · Docks'],
  'eBay · 3DPLady': ['ebay', 'lady', 'de', '3DPLady'],
  'Metro.de · Woida': ['metro', 'woida', 'de', 'Woida'],
  'eBay.de · Kaufplus': ['ebay', 'kaufplus', 'de', 'Kaufplus'],
  'Otto · Technowelt': ['otto', 'techno', 'tw', 'Technowelt'],
  'eBay.de · Woida': ['ebay', 'woida', 'de', 'Woida'],
  'Kaufland.de · Ivobuyshop': ['kaufland', 'ivo', 'de', 'Ivobuyshop'],
  'Kaufland.de · Technowelt': ['kaufland', 'techno', 'tw', 'Technowelt'],
  'Webshop · tonerexpress24.nl': ['webshop', 'novada', 'nl', 'tonerexpress24.nl'],
  'eBay.de · Technowelt': ['ebay', 'techno', 'tw', 'Technowelt'],
  'Shopify · Parfymonline.de': ['shopify', 'novada', 'de', 'Parfymonline.de'],
  'Shopify · LadyToner.de': ['shopify', 'lady', 'de', 'LadyToner.de'],
  'Metro.de · Lady Empire': ['metro', 'lady', 'de', 'Lady Empire'],
  'Trendyol · DOCSER': ['trendyol', 'docser', 'ist', 'DOCSER'],
  'Amazon · 3DPLady': ['amazon', 'lady', 'de', '3DPLady'],
  'Webshop · BueroArena.com': ['webshop', 'novada', 'de', 'BueroArena.com'],
  'Webshop · parfumverkoop.nl': ['webshop', 'parfum', 'nl', 'parfumverkoop.nl'],
  'Stockist24.com': ['webshop', 'stockist', 'de', 'Stockist24.com'],
  'eBay.de · Ivobuyshop': ['ebay', 'ivo', 'de', 'Ivobuyshop'],
  'Kaufland · Lady Empire': ['kaufland', 'lady', 'de', 'Lady Empire'],
  'eBay': ['ebay', 'peras', 'de', 'Perasshop'],
  'Ozon · İthal Koku': ['ozon', 'ithal', 'ist', 'İthal Koku'],
}
// Gerçek panelde gözlenen eşitleme sorunları (docs/03 §4.1, §5b).
const HEALTH: Record<string, [Health, number, string]> = {
  'Ozon · İthal Koku': ['stale', Date.parse('2026-10-18T09:10:00+02:00'), 'Son tam aktarım 18.10 ve kısmi kaldı'],
  'Otto · Technowelt': ['failed', NOW - 3.2 * H, 'Sipariş çekme başarısız; 8 ilan gönderimi beklemede'],
  'eBay.de · Woida': ['partial', NOW - 0.4 * H, 'Eşitlemenin bazı adımları tamamlanamadı'],
  'eBay · 3DPLady': ['partial', NOW - 0.6 * H, 'Eşitlemenin bazı adımları tamamlanamadı'],
  'Amazon · 3DPLady': ['partial', NOW - 1.1 * H, 'Ürünlerin çoğunda katalog eşleşme sorunu'],
  'N11 · DOCSER · Docks': ['partial', NOW - 0.3 * H, 'Ürünlerin çoğunda EAN eksik'],
}
const STORE = dist.byStore as Record<string, { n: number; eur: number }>
export const ACCOUNTS: Account[] = Object.keys(STORE).map((k, i) => {
  const [type, comp, wh, name] = META[k] ?? ['webshop', 'novada', 'de', k]
  const h = HEALTH[k]
  return {
    id: 'a' + (i + 1), name, type, company: comp, wh,
    cur: type === 'trendyol' || type === 'n11' ? 'TRY' : type === 'ozon' ? 'USD' : 'EUR',
    health: h ? h[0] : 'ok', lastSync: h ? h[1] : NOW - int(1, 9) * 60_000, note: h?.[2],
  }
})
const ACC_BY_KEY = Object.fromEntries(Object.keys(STORE).map((k, i) => [k, ACCOUNTS[i]]))
export const account = (id: string) => ACCOUNTS.find(a => a.id === id)!

// ---------- Ürünler ----------
export type ListingStatus = 'havuzda' | 'hazirlaniyor' | 'onizleme' | 'gonderildi' | 'aktif' | 'sorunlu' | 'kaldirildi'
export const LISTING_FLOW: { key: ListingStatus; label: string }[] = [
  { key: 'havuzda', label: 'Havuzda' }, { key: 'hazirlaniyor', label: 'Eksik veri tamamlanıyor' },
  { key: 'onizleme', label: 'Önizleme' }, { key: 'gonderildi', label: 'Gönderildi · onay bekliyor' },
  { key: 'aktif', label: 'Aktif' }, { key: 'sorunlu', label: 'Sorunlu' }, { key: 'kaldirildi', label: 'Kaldırıldı' },
]
export interface StockRow { fiziki: number | null; sanal: number; drop: number; tedarikci: number; min: number; bin: string }
export interface Product {
  id: string; sku: string; ean: string | null; name: string; brand: string; cat: string; source: string
  image: boolean; price: number; stock: Partial<Record<WhId, StockRow>>
  listings: { acc: string; status: ListingStatus; price: number; reason?: string }[]
}
const SEED: [string, string, string, WhId[]][] = [
  ['Eau de Parfum Noir 100 ml', 'Maison Lune', 'Parfüm', ['de', 'nl']],
  ['Eau de Toilette Citrus 50 ml', 'Maison Lune', 'Parfüm', ['de', 'nl']],
  ['Body Mist Vanilla 200 ml', 'Bellaria', 'Parfüm', ['nl']],
  ['Parfüm Seti Classic 3×30 ml', 'Bellaria', 'Parfüm', ['de', 'ist']],
  ['Oud Intense 75 ml', 'Sahra', 'Parfüm', ['ist']],
  ['Amber Wood 100 ml', 'Sahra', 'Parfüm', ['ist', 'de']],
  ['Kolonya Limon 400 ml', 'Ege Esans', 'Parfüm', ['ist']],
  ['Deo Sprey Sport 150 ml', 'Nordwind', 'Parfüm', ['de']],
  ['Toner Kartuş Siyah TN-2420 uyumlu', 'PrintMax', 'Toner', ['de', 'nl']],
  ['Toner Kartuş 4 Renk Set CF410X uyumlu', 'PrintMax', 'Toner', ['de', 'nl']],
  ['Drum Ünitesi DR-2400 uyumlu', 'PrintMax', 'Toner', ['de']],
  ['Mürekkep Kartuşu 305XL siyah', 'InkLine', 'Toner', ['de']],
  ['Mürekkep Kartuşu 305XL renkli', 'InkLine', 'Toner', ['de']],
  ['Etiket Rulosu 62 mm DK-22205 uyumlu', 'InkLine', 'Toner', ['de', 'nl']],
  ['Kol Saati Chrono 42 mm çelik', 'Tempora', 'Saat', ['de']],
  ['Kol Saati Slim 38 mm deri', 'Tempora', 'Saat', ['de']],
  ['Akıllı Saat Fit S2', 'Volto', 'Saat', ['de']],
  ['Saat Kordonu 20 mm silikon', 'Tempora', 'Saat', ['de']],
  ['Bluetooth Kulaklık Air 3', 'Volto', 'Elektronik', ['tw', 'mega']],
  ['USB-C Şarj Aleti 65 W GaN', 'Volto', 'Elektronik', ['tw', 'mega']],
  ['Powerbank 20.000 mAh', 'Volto', 'Elektronik', ['tw']],
  ['HDMI Kablo 2.1 · 2 m', 'Kabelwerk', 'Elektronik', ['tw', 'mega']],
  ['Kablosuz Mouse Silent', 'Kabelwerk', 'Elektronik', ['mega']],
  ['Mekanik Klavye TKL DE düzen', 'Kabelwerk', 'Elektronik', ['mega', 'tw']],
  ['Webcam 1080p', 'Volto', 'Elektronik', ['tw']],
  ['LED Şerit 5 m RGB', 'Lumio', 'Elektronik', ['mega']],
  ['PLA Filament 1,75 mm 1 kg siyah', '3DForm', '3D baskı', ['de']],
  ['PLA Filament 1,75 mm 1 kg beyaz', '3DForm', '3D baskı', ['de']],
  ['PETG Filament 1,75 mm 1 kg şeffaf', '3DForm', '3D baskı', ['de']],
  ['Nozzle Seti 0,4 mm · 10 adet', '3DForm', '3D baskı', ['de']],
  ['Yapı Plakası PEI 235×235', '3DForm', '3D baskı', ['de']],
  ['Reçine Standart 1 L gri', '3DForm', '3D baskı', ['de']],
  ['Zımba Teli 24/6 · 5000 adet', 'Büroline', 'Ofis', ['de']],
  ['A4 Fotokopi Kâğıdı 80 g · 5×500', 'Büroline', 'Ofis', ['de', 'nl']],
  ['Klasör Geniş A4 · 10 adet', 'Büroline', 'Ofis', ['de']],
  ['Masa Lambası LED katlanır', 'Lumio', 'Ofis', ['mega', 'de']],
]
const SOURCES = ['Elle giriş', 'JTL', 'Shopify', 'Tedarikçi API', 'Wawi mağazası']
const REASONS = ['EAN eksik', 'Görsel eksik', 'Kategori eşleşmedi', 'Platform reddetti', 'Fiyat alt sınırın altında']
const DROP_CATS = ['Saat', 'Ofis', 'Toner']

export const PRODUCTS: Product[] = SEED.map(([name, brand, cat, whs], i) => {
  const price = Math.round((cat === 'Saat' ? int(39, 189) : cat === 'Elektronik' ? int(9, 79) : int(6, 59)) * 100 + 99) / 100
  const stock: Product['stock'] = {}
  whs.forEach((w, wi) => {
    const r = R()
    const fiziki = r < 0.1 ? null : r < 0.17 ? -int(1, 9) : r < 0.3 ? int(0, 5) : int(8, 240)
    const isDrop = w === 'de' && DROP_CATS.includes(cat)
    stock[w] = {
      fiziki, sanal: w === 'nl' || R() < 0.2 ? int(5, 40) : 0, drop: isDrop ? int(20, 900) : 0,
      tedarikci: isDrop ? int(50, 2000) : 0, min: 5, bin: `${String.fromCharCode(65 + ((i + wi) % 6))}-${int(1, 14)}-${int(1, 5)}`,
    }
  })
  const listings: Product['listings'] = []
  ACCOUNTS.filter(a => whs.includes(a.wh)).forEach(a => {
    if (R() < 0.55) return
    const status = (['havuzda', 'hazirlaniyor', 'onizleme', 'gonderildi', 'aktif', 'sorunlu', 'kaldirildi'] as const)[wpick([7, 7, 4, 6, 58, 14, 4])]
    const rate = a.cur === 'TRY' ? 48 : a.cur === 'USD' ? 1.08 : 1
    listings.push({ acc: a.id, status, price: Math.round(price * rate * (0.95 + R() * 0.2) * 100) / 100, reason: status === 'sorunlu' ? pick(REASONS) : undefined })
  })
  return {
    id: 'p' + (i + 1), sku: `WW-${cat.slice(0, 2).toUpperCase()}-${1000 + i * 7}`,
    ean: R() < 0.14 ? null : '40' + String(10000000000 + Math.floor(R() * 89999999999)),
    name, brand, cat, source: pick(SOURCES), image: R() > 0.16, price, stock, listings,
  }
})
export const product = (id: string) => PRODUCTS.find(p => p.id === id)!
export const stockState = (v: number | null) =>
  v === null ? 'sayim-yok' : v < 0 ? 'negatif' : v === 0 ? 'tukendi' : v <= 2 ? 'alarm' : v <= 5 ? 'kritik' : 'var'

// ---------- Siparişler ----------
export type Supply = 'fiziki' | 'asterbuy' | 'bueroarena' | 'b2buhren' | 'watchimport'
export const SUPPLY: Record<Supply, string> = { fiziki: 'Fiziki', asterbuy: 'Drop · Asterbuy', bueroarena: 'Drop · BueroArena', b2buhren: 'Drop · B2B Uhren', watchimport: 'Drop · Watch Import' }
export type OStatus = 'yeni' | 'hazirlaniyor' | 'kargoda' | 'tamamlandi' | 'iptal' | 'iade'
export const OSTATUS: Record<OStatus, string> = { yeni: 'Yeni', hazirlaniyor: 'Hazırlanıyor', kargoda: 'Kargoda', tamamlandi: 'Tamamlandı', iptal: 'İptal', iade: 'İade' }
export type RetStage = 'bekleniyor' | 'geldi' | 'odeme' | 'cozuldu'
export const RET: { key: RetStage; label: string; hint: string }[] = [
  { key: 'bekleniyor', label: 'Ürün bekleniyor', hint: 'İade etiketi oluştu' },
  { key: 'geldi', label: 'Ürün geldi · kontrol', hint: 'Depoda kontrol edilecek' },
  { key: 'odeme', label: 'Para iadesi bekliyor', hint: 'İade faturası + ödeme' },
  { key: 'cozuldu', label: 'Çözüldü', hint: 'Stok ve para hareketi yazıldı' },
]
export interface Order {
  id: string; no: string; t: number; acc: string; company: string; wh: WhId; cur: Cur; total: number
  supply: Supply; status: OStatus; pay: 'odendi' | 'bekliyor' | 'iade'
  label: 'yok' | 'hazir' | 'hata'; invoice: 'yok' | 'taslak' | 'kesin'; issue?: string
  items: { pid: string; qty: number; price: number }[]
  cust: { name: string; street: string; zip: string; city: string; country: string; email: string; phone: string }
  tracking?: { carrier: string; no: string }; ret?: RetStage
}
const FIRST = ['Anna', 'Lukas', 'Mehmet', 'Sophie', 'Jan', 'Elif', 'Thomas', 'Fatma', 'Daan', 'Laura', 'Emre', 'Julia', 'Pieter', 'Zeynep', 'Max', 'Lena']
const LAST = ['Müller', 'Schmidt', 'Yılmaz', 'de Vries', 'Kaya', 'Weber', 'Jansen', 'Demir', 'Fischer', 'Bakker', 'Şahin', 'Wagner']
const CITY: Record<Country, [string, string][]> = {
  DE: [['10115', 'Berlin'], ['20095', 'Hamburg'], ['50667', 'Köln'], ['80331', 'München'], ['60311', 'Frankfurt']],
  NL: [['1012', 'Amsterdam'], ['3011', 'Rotterdam'], ['3511', 'Utrecht']],
  TR: [['34000', 'İstanbul'], ['06000', 'Ankara'], ['35000', 'İzmir']],
}
const ISSUES = ['Adres eksik (ev no)', 'Stok yetersiz', 'Ödeme doğrulanamadı', 'Ürün eşleşmedi']
const PREFIX: Record<ChannelType, string> = { shopify: 'SH', ebay: 'EB', kaufland: 'KL', otto: 'OT', metro: 'MT', amazon: 'AZ', webshop: 'WS', trendyol: 'TY', n11: 'N1', ozon: 'OZ' }
export const trackingFor = (wh: WhId) => ({ carrier: wh === 'nl' ? 'PostNL' : wh === 'ist' ? 'Aras' : 'DHL', no: '00' + String(340434000000 + Math.floor(Math.random() * 99999999)) })

function buildOrders(): Order[] {
  const pool: string[] = []
  for (const [k, v] of Object.entries(STORE)) for (let i = 0; i < v.n; i++) pool.push(k)
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]] }
  const byHour = dist.byHour as number[]
  const days = Object.entries(dist.byDay as Record<string, { n: number }>).sort((a, b) => a[0].localeCompare(b[0]))
  const out: Order[] = []
  let idx = 0
  for (const [day, { n }] of days) for (let i = 0; i < n; i++) {
    const key = pool[idx % pool.length]; idx++
    const a = ACC_BY_KEY[key]
    let t = Date.parse(`${day}T${String(wpick(byHour)).padStart(2, '0')}:${String(int(0, 59)).padStart(2, '0')}:00+01:00`)
    if (t > NOW - 5 * 60_000) t = NOW - (0.1 + R() * 9) * H
    const age = (NOW - t) / H
    const avg = STORE[key].eur ? STORE[key].eur / STORE[key].n : a.cur === 'TRY' ? 900 : 42
    const total = Math.round(avg * (0.4 + R() * 1.3) * 100) / 100
    const supply: Supply = a.wh === 'de' && R() < 0.35 ? (['asterbuy', 'bueroarena', 'b2buhren', 'watchimport'] as const)[wpick([60, 25, 10, 5])] : 'fiziki'
    const st: OStatus =
      age < 8 ? (['yeni', 'hazirlaniyor'] as const)[wpick([70, 30])]
        : age < 30 ? (['yeni', 'hazirlaniyor', 'kargoda'] as const)[wpick([20, 45, 35])]
          : age < 72 ? (['hazirlaniyor', 'kargoda', 'tamamlandi', 'iptal'] as const)[wpick([6, 34, 58, 2])]
            : (['hazirlaniyor', 'kargoda', 'tamamlandi', 'iptal', 'iade'] as const)[wpick([1.2, 2, 92.6, 1.6, 2.6])]
    const open = st === 'yeni' || st === 'hazirlaniyor'
    const shipped = st === 'kargoda' || st === 'tamamlandi' || st === 'iade'
    const country = company(a.company).country
    const [zip, city] = pick(CITY[country])
    const fn = pick(FIRST), ln = pick(LAST)
    const cands = PRODUCTS.filter(p => p.stock[a.wh])
    const p1 = pick(cands), two = R() < 0.25
    const items = two
      ? [{ pid: p1.id, qty: 1, price: Math.round(total * 0.6 * 100) / 100 }, { pid: pick(cands).id, qty: 1, price: Math.round(total * 0.4 * 100) / 100 }]
      : [{ pid: p1.id, qty: R() < 0.2 ? 2 : 1, price: total }]
    if (!two && items[0].qty === 2) items[0].price = Math.round(total / 2 * 100) / 100
    const seq = out.length + 1
    out.push({
      id: 'o' + seq, no: `${PREFIX[a.type]}-${String(260000 + seq * 3)}`, t, acc: a.id, company: a.company, wh: a.wh, cur: a.cur, total,
      supply, status: st,
      pay: st === 'iptal' || st === 'iade' ? 'iade' : st === 'yeni' && R() < 0.08 ? 'bekliyor' : 'odendi',
      label: shipped ? 'hazir' : st === 'hazirlaniyor' ? (['hazir', 'hata', 'yok'] as const)[wpick([55, 6, 39])] : 'yok',
      invoice: shipped ? 'kesin' : st === 'hazirlaniyor' && R() < 0.5 ? 'taslak' : 'yok',
      issue: open && R() < 0.06 ? pick(ISSUES) : undefined,
      items,
      cust: {
        name: `${fn} ${ln}`, street: `Örnek Sok. ${int(1, 120)}`, zip, city, country,
        email: `${fn[0].toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}@example.com`, phone: `+${country === 'DE' ? 49 : country === 'NL' ? 31 : 90} 555 ${int(100, 999)} ${int(10, 99)} ${int(10, 99)}`,
      },
      tracking: shipped ? { carrier: a.wh === 'nl' ? 'PostNL' : a.wh === 'ist' ? 'Aras' : 'DHL', no: '00' + String(340434000000 + Math.floor(R() * 99999999)) } : undefined,
      ret: st === 'iade' ? (['bekleniyor', 'geldi', 'odeme', 'cozuldu'] as const)[wpick([45, 20, 15, 20])] : undefined,
    })
  }
  return out.sort((a, b) => b.t - a.t)
}
export const ORDERS0 = buildOrders()

export const isOpen = (o: Order) => o.status === 'yeni' || o.status === 'hazirlaniyor'
export const toShip = (o: Order) => isOpen(o) && o.pay === 'odendi'
export const overdue = (o: Order) => toShip(o) && o.supply === 'fiziki' && NOW - o.t > 48 * H
export const dropWaiting = (o: Order) => isOpen(o) && o.supply !== 'fiziki'
export const hasIssue = (o: Order) => isOpen(o) && (!!o.issue || o.label === 'hata')

// ---------- Stok defteri ----------
export type MoveType = 'satis' | 'sayim' | 'mal-kabul' | 'transfer' | 'duzeltme'
export const MOVE: Record<MoveType, string> = { satis: 'Satış', sayim: 'Sayım', 'mal-kabul': 'Mal kabul', transfer: 'Depo transferi', duzeltme: 'Düzeltme' }
export interface Move { id: string; t: number; pid: string; wh: WhId; type: MoveType; before: number; after: number; user: string; ref: string }
export const STAFF: { id: string; ini: string; name: string; role: string; scope: string }[] = [
  { id: 'u1', ini: 'SY', name: 'Sistem Yöneticisi', role: 'Sistem yöneticisi', scope: 'Tüm depolar' },
  { id: 'u2', ini: 'DS', name: 'Depo Sorumlusu (DE)', role: 'Depo sorumlusu', scope: 'Almanya, Mega B' },
  { id: 'u3', ini: 'DÇ', name: 'Depo Çalışanı 1', role: 'Depo çalışanı', scope: 'Almanya' },
  { id: 'u4', ini: 'DÇ', name: 'Depo Çalışanı 2', role: 'Depo çalışanı', scope: 'Hollanda' },
  { id: 'u5', ini: 'DÇ', name: 'Depo Çalışanı 3', role: 'Depo çalışanı', scope: 'Istanbul' },
  { id: 'u6', ini: 'WO', name: 'Wawi Operasyon', role: 'Wawi operasyon', scope: 'Tüm depolar' },
  { id: 'u7', ini: 'ÜG', name: 'Ürün Giriş Operatörü', role: 'Ürün giriş operatörü', scope: 'Almanya' },
  { id: 'u8', ini: 'KS', name: 'Kategori Sorumlusu', role: 'Kategori sorumlusu', scope: 'Tüm depolar' },
  { id: 'u9', ini: 'MH', name: 'Muhasebe', role: 'Muhasebe (öneri)', scope: 'Tüm şirketler' },
]
export const MOVES0: Move[] = (() => {
  const out: Move[] = []
  for (const p of PRODUCTS) for (const [wh, s] of Object.entries(p.stock) as [WhId, StockRow][]) {
    if (s.fiziki === null) continue
    let after = s.fiziki, t = NOW - R() * 6 * H
    for (let k = int(2, 5); k > 0; k--) {
      const type = (['satis', 'satis', 'satis', 'sayim', 'mal-kabul', 'transfer', 'duzeltme'] as const)[int(0, 6)]
      const delta = type === 'satis' ? -int(1, 3) : type === 'mal-kabul' ? int(10, 60) : type === 'transfer' ? -int(5, 20) : int(-4, 4) || 1
      out.push({
        id: 'm' + (out.length + 1), t, pid: p.id, wh, type, before: after - delta, after,
        user: type === 'satis' ? 'Sistem' : pick(STAFF.slice(1, 6)).name,
        ref: type === 'satis' ? pick(ORDERS0).no : type === 'mal-kabul' ? `ALIŞ-${int(1000, 1999)}` : type === 'transfer' ? `TRF-${int(100, 199)}` : type === 'sayim' ? 'Barkodla sayım' : 'Elle düzeltme',
      })
      after -= delta; t -= R() * 30 * H
    }
  }
  return out.sort((a, b) => b.t - a.t)
})()

// ---------- Eşitleme işleri ----------
export type JobStatus = 'tamamlandi' | 'calisiyor' | 'sirada' | 'basarisiz' | 'kismi'
export const JOB: Record<JobStatus, string> = { tamamlandi: 'Tamamlandı', calisiyor: 'Çalışıyor', sirada: 'Sırada', basarisiz: 'Başarısız', kismi: 'Kısmi' }
export interface Job { id: string; acc: string | null; kind: string; status: JobStatus; tries: number; last: number; next: number | null; msg?: string }
export const JOBS0: Job[] = (() => {
  const out: Job[] = []
  const add = (j: Omit<Job, 'id'>) => out.push({ id: 'j' + (out.length + 1), ...j })
  for (const a of ACCOUNTS) {
    const bad = a.health !== 'ok'
    add({ acc: a.id, kind: 'Sipariş çekme', status: a.health === 'ok' ? 'tamamlandi' : a.health === 'partial' ? 'kismi' : 'basarisiz', tries: bad ? 3 : 1, last: a.lastSync, next: a.health === 'stale' ? null : NOW + int(1, 5) * 60_000, msg: a.note })
    add({ acc: a.id, kind: 'Stok ve fiyat gönderimi', status: a.health === 'stale' || a.health === 'failed' ? 'sirada' : R() < 0.12 ? 'calisiyor' : 'tamamlandi', tries: 1, last: NOW - int(4, 50) * 60_000, next: NOW + int(5, 25) * 60_000 })
  }
  add({ acc: null, kind: 'Tedarikçi stok okuma · Asterbuy', status: 'basarisiz', tries: 5, last: Date.parse('2026-10-11T06:00:00+02:00'), next: null, msg: 'Son başarılı okuma 11.10; yeniden deneme sınırı doldu' })
  add({ acc: null, kind: 'Takip no aktarımı · Asterbuy', status: 'tamamlandi', tries: 1, last: NOW - 2.1 * H, next: NOW + 1.9 * H })
  return out
})()

// ---------- Denetim ----------
export interface Audit { id: string; t: number; result: 'başarılı' | 'reddedildi' | 'hata'; cat: string; event: string; user: string; obj: string; routine?: number }
export const AUDIT0: Audit[] = [
  { id: 'e1', t: NOW - 0.2 * H, result: 'başarılı', cat: 'Kimlik', event: 'Oturum açıldı (e-posta + iki adım)', user: 'Sistem Yöneticisi', obj: 'oturum' },
  { id: 'e2', t: NOW - 0.7 * H, result: 'başarılı', cat: 'Finans', event: 'Fatura kesinleştirildi', user: 'Muhasebe', obj: 'fatura RE-2026-01716' },
  { id: 'e3', t: NOW - 1.3 * H, result: 'başarılı', cat: 'Stok', event: 'Sayım ile stok ayarlandı (−3)', user: 'Depo Çalışanı 1', obj: 'ürün WW-TO-1056 · Almanya' },
  { id: 'e4', t: NOW - 2.0 * H, result: 'reddedildi', cat: 'Yetki', event: 'Yetkisiz uç erişimi engellendi', user: 'Ürün Giriş Operatörü', obj: 'finans/faturalar' },
  { id: 'e5', t: NOW - 2.4 * H, result: 'başarılı', cat: 'Kişisel veri', event: 'Müşteri iletişim bilgisi görüntülendi', user: 'Depo Sorumlusu (DE)', obj: 'sipariş EB-261204' },
  { id: 'e6', t: NOW - 3.2 * H, result: 'hata', cat: 'Kanal', event: 'Sipariş çekme başarısız (3. deneme)', user: 'Sistem', obj: 'OTTO · Technowelt' },
  { id: 'e7', t: NOW - 5.5 * H, result: 'başarılı', cat: 'Katalog', event: 'Mükerrer kart birleştirildi (3 → 1)', user: 'Kategori Sorumlusu', obj: 'ürün WW-PA-1021' },
  { id: 'e8', t: NOW - 6 * H, result: 'başarılı', cat: 'Kargo', event: 'Kargo etiketi çağrıları (gruplanmış)', user: 'Sistem', obj: 'DHL', routine: 742 },
  { id: 'e9', t: NOW - 6 * H, result: 'hata', cat: 'Kargo', event: 'Kargo etiketi hataları (gruplanmış)', user: 'Sistem', obj: 'DHL', routine: 31 },
  { id: 'e10', t: NOW - 9 * H, result: 'başarılı', cat: 'Yönetim', event: 'Rol değiştirildi: Depo çalışanı → Depo sorumlusu', user: 'Sistem Yöneticisi', obj: 'çalışan u2' },
]

// ---------- Biçimleme ----------
const dtf = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const dayf = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' })
export const fmtDT = (t: number) => dtf.format(t)
export const dayKey = (t: number) => dayf.format(t)
export const fmtNum = (n: number) => n.toLocaleString('tr-TR')
export const fmtMoney = (v: number, cur: Cur = 'EUR', frac = 2) => v.toLocaleString('tr-TR', { style: 'currency', currency: cur, minimumFractionDigits: frac, maximumFractionDigits: frac })
export const ago = (t: number, now = NOW) => {
  const m = Math.max(0, Math.round((now - t) / 60_000))
  return m < 60 ? `${m} dk önce` : m < 48 * 60 ? `${Math.round(m / 60)} sa önce` : `${Math.round(m / 1440)} gün önce`
}
export const mask = (s: string) => s.split(' ').map(w => w[0] + '•••').join(' ')
