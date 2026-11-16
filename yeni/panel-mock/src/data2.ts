// Kargo, depo transferi, destek ve cari ekranlarının mock verisi. Tamamı uydurmadır.
import { NOW, ORDERS0, PRODUCTS, type Cur, type WhId } from './data'

const H = 3600_000, D = 24 * H

// ---------- Kargo ----------
export const carrierOf = (wh: WhId) => (wh === 'nl' ? 'PostNL' : wh === 'ist' ? 'Aras' : 'DHL')
export const CARRIERS: { name: string; scope: string; state: 'bagli' | 'varsayim' | 'talep'; note: string }[] = [
  { name: 'DHL', scope: 'Almanya · Mega B · Technowelt Almanya', state: 'bagli', note: 'Gidiş ve iade etiketi, takip no kanala otomatik gider' },
  { name: 'PostNL', scope: 'Hollanda', state: 'bagli', note: 'Gidiş etiketi ve takip' },
  { name: 'Aras', scope: 'İstanbul', state: 'varsayim', note: 'Türkiye taşıyıcısı bilinmiyor; mock varsayımı' },
  { name: 'GLS', scope: '—', state: 'talep', note: 'OTTO siparişlerinde bugün Billbee üzerinden kullanılıyor' },
  { name: 'DPD', scope: '—', state: 'talep', note: 'Kurulum talebi' },
  { name: 'UPS', scope: '—', state: 'talep', note: 'Kurulum talebi' },
  { name: 'Hermes', scope: '—', state: 'talep', note: 'Kurulum talebi' },
]
export interface ManualLabel { id: string; t: number; name: string; city: string; carrier: string; kg: number; wh: WhId }
export const MANUAL0: ManualLabel[] = [
  { id: 'ml1', t: NOW - 3 * H, name: 'Numune gönderimi · tedarikçi', city: 'Düsseldorf', carrier: 'DHL', kg: 1.2, wh: 'de' },
  { id: 'ml2', t: NOW - 26 * H, name: 'Garanti değişimi', city: 'Utrecht', carrier: 'PostNL', kg: 0.4, wh: 'nl' },
]

// ---------- Depo transferi ----------
export type TStatus = 'taslak' | 'hazir' | 'cikti' | 'yolda' | 'ulasti' | 'kabul' | 'iptal'
export const TFLOW: { key: TStatus; label: string; next?: string }[] = [
  { key: 'taslak', label: 'Taslak', next: 'Sevke hazırla' },
  { key: 'hazir', label: 'Sevke hazır', next: 'Depodan çıkar' },
  { key: 'cikti', label: 'Depodan çıktı', next: 'Yola çıktı' },
  { key: 'yolda', label: 'Yolda', next: 'Hedefe ulaştı' },
  { key: 'ulasti', label: 'Hedefe ulaştı', next: 'Mal kabulü tamamla' },
  { key: 'kabul', label: 'Mal kabul tamam' },
]
export interface Transfer {
  id: string; no: string; from: WhId; to: WhId; mode: 'Kara' | 'Hava' | 'Deniz'; carrier: string; tracking?: string
  created: number; eta: number; status: TStatus; doc?: string; note?: string; lines: { pid: string; qty: number; received?: number }[]
}
const lines = (wh: WhId, from: number, n: number, qty: number[]) => PRODUCTS.filter(p => p.stock[wh]).slice(from, from + n).map((p, i) => ({ pid: p.id, qty: qty[i % qty.length] }))
export const TRANSFERS0: Transfer[] = [
  { id: 't1', no: 'TRF-0142', from: 'ist', to: 'de', mode: 'Kara', carrier: 'Nakliye firması A', tracking: 'TIR-34-88217', created: NOW - 6 * D, eta: NOW + 1 * D, status: 'yolda', doc: 'IC-2026-0031', lines: lines('ist', 0, 4, [240, 120, 300, 80]) },
  { id: 't2', no: 'TRF-0143', from: 'ist', to: 'nl', mode: 'Hava', carrier: 'Hava kargo B', tracking: 'AWB 235-4471 9902', created: NOW - 2 * D, eta: NOW + 2 * D, status: 'cikti', doc: 'IC-2026-0032', lines: lines('ist', 1, 2, [60, 90]) },
  { id: 't3', no: 'TRF-0144', from: 'de', to: 'mega', mode: 'Kara', carrier: 'Kendi araç', created: NOW - 1 * D, eta: NOW + 0.5 * D, status: 'hazir', lines: lines('de', 3, 3, [40, 25, 60]) },
  { id: 't4', no: 'TRF-0145', from: 'de', to: 'tw', mode: 'Kara', carrier: 'DHL Freight', created: NOW - 5 * H, eta: NOW + 3 * D, status: 'taslak', note: 'OTTO kampanyası öncesi takviye', lines: lines('de', 8, 2, [30, 30]) },
  { id: 't5', no: 'TRF-0141', from: 'de', to: 'nl', mode: 'Kara', carrier: 'DHL Freight', tracking: 'JD0146000033219', created: NOW - 9 * D, eta: NOW - 1 * D, status: 'ulasti', doc: 'IC-2026-0030', lines: lines('de', 0, 3, [100, 50, 75]) },
  { id: 't6', no: 'TRF-0139', from: 'ist', to: 'de', mode: 'Deniz', carrier: 'Konteyner hattı C', tracking: 'MSKU 7741203', created: NOW - 34 * D, eta: NOW - 8 * D, status: 'kabul', doc: 'IC-2026-0027', lines: lines('ist', 0, 3, [600, 400, 350]).map((l, i) => ({ ...l, received: l.qty - (i === 1 ? 6 : 0) })) },
  { id: 't7', no: 'TRF-0140', from: 'nl', to: 'de', mode: 'Kara', carrier: 'PostNL Pakket', created: NOW - 12 * D, eta: NOW - 9 * D, status: 'iptal', note: 'Stok Hollanda’da satıldı', lines: lines('nl', 0, 1, [20]) },
]

// ---------- Destek ----------
export type TkStatus = 'open' | 'waiting' | 'closed'
export const TK: Record<TkStatus, string> = { open: 'Yanıtımız bekleniyor', waiting: 'Müşteri bekleniyor', closed: 'Kapalı' }
export interface Msg { from: 'musteri' | 'biz'; text: string; t: number; user?: string }
export interface Ticket { id: string; acc: string; orderId: string; subject: string; status: TkStatus; unread: boolean; t: number; msgs: Msg[] }
const TPL: [string, string, string | null, TkStatus][] = [
  ['Kargom nerede?', 'Siparişim üç gündür hazırlanıyor görünüyor. Ne zaman kargoya verilecek?', null, 'open'],
  ['Yanlış ürün geldi', 'Paketten sipariş ettiğimden farklı bir ürün çıktı. Nasıl değiştirebilirim?', null, 'open'],
  ['Fatura talebi', 'Şirket adına fatura rica ediyorum. Vergi numaramı nereye iletebilirim?', 'Vergi numaranızı bu mesaja yanıt olarak yazarsanız faturayı güncelleyip göndeririz.', 'waiting'],
  ['Wo ist mein Paket?', 'Die Sendungsverfolgung zeigt seit vier Tagen keine Bewegung. Können Sie bitte nachsehen?', null, 'open'],
  ['İade etmek istiyorum', 'Ürünü iade etmek istiyorum, kutusu açılmadı.', 'İade etiketinizi e-posta adresinize gönderdik. Paketi 14 gün içinde teslim edebilirsiniz.', 'waiting'],
  ['Ürün hasarlı ulaştı', 'Kutu ezilmiş geldi, ürünün kapağı kırık. Fotoğraf ekleyebilirim.', null, 'open'],
  ['Adres değişikliği', 'Teslimat adresimde ev numarası eksik yazılmış, düzeltebilir misiniz?', 'Adresiniz güncellendi, etiket yeni adresle oluşturuldu.', 'closed'],
  ['Retour aanvragen', 'Ik wil het product retourneren, het past niet bij mijn printer.', null, 'open'],
  ['Stok sorusu', 'Bu üründen 20 adet almak istiyorum, stokta var mı?', 'Evet, 20 adet stokta. Toplu alım için mağaza üzerinden sipariş verebilirsiniz.', 'closed'],
]
export const TICKETS0: Ticket[] = Array.from({ length: 18 }, (_, i) => {
  const o = ORDERS0[3 + i * 41], [subject, text, reply, status] = TPL[i % TPL.length]
  const t = NOW - (0.4 + i * 2.7) * H
  const msgs: Msg[] = [{ from: 'musteri', text, t: t - (reply ? 5 * H : 0) }]
  if (reply) msgs.push({ from: 'biz', text: reply, t, user: 'Wawi Operasyon' })
  return { id: 'tk' + (i + 1), acc: o.acc, orderId: o.id, subject, status, unread: status === 'open' && i % 3 === 0, t, msgs }
})

// ---------- Cari ve B2B ----------
export interface B2B {
  id: string; code: string; name: string; legal: string; company: string; country: string; cur: Cur
  locations: { code: string; name: string; wh: WhId; city: string }[]
  users: { name: string; email: string; canAdjust: boolean }[]
  invoices: { no: string; t: number; total: number; status: 'kesin' | 'taslak' }[]
  payments: { t: number; amount: number; ref: string }[]
}
const inv = (prefix: string, rows: [number, number, ('kesin' | 'taslak')?][]) => rows.map(([days, total, st], i) => ({ no: st === 'taslak' ? `Taslak-${prefix}${i + 1}` : `RE-B2B-${prefix}${String(i + 1).padStart(3, '0')}`, t: NOW - days * D, total, status: st ?? ('kesin' as const) }))
const pay = (rows: [number, number, string][]) => rows.map(([days, amount, ref]) => ({ t: NOW - days * D, amount, ref }))
export const B2B0: B2B[] = [
  { id: 'c1', code: 'C-1001', name: 'Duftwelt Handel', legal: 'Duftwelt Handels GmbH (örnek)', company: 'lady', country: 'DE', cur: 'EUR',
    locations: [{ code: 'L1', name: 'Merkez mağaza', wh: 'de', city: 'Köln' }, { code: 'L2', name: 'Şube', wh: 'de', city: 'Bonn' }],
    users: [{ name: 'Satın alma', email: 'einkauf@duftwelt.example', canAdjust: true }, { name: 'Muhasebe', email: 'buchhaltung@duftwelt.example', canAdjust: false }],
    invoices: inv('11', [[41, 8420], [22, 6150], [6, 3980], [1, 2240, 'taslak']]), payments: pay([[35, 8420, 'SEPA 2026-10-10'], [12, 4000, 'SEPA 2026-11-02']]) },
  { id: 'c2', code: 'C-1002', name: 'Tonerpunt', legal: 'Tonerpunt B.V. (örnek)', company: 'parfum', country: 'NL', cur: 'EUR',
    locations: [{ code: 'L1', name: 'Depo', wh: 'nl', city: 'Rotterdam' }],
    users: [{ name: 'Inkoop', email: 'inkoop@tonerpunt.example', canAdjust: false }],
    invoices: inv('12', [[30, 2890], [9, 3410]]), payments: pay([[20, 2890, 'iDEAL 2026-10-25']]) },
  { id: 'c3', code: 'C-1003', name: 'Büro Nord', legal: 'Büro Nord Bürobedarf GmbH (örnek)', company: 'novada', country: 'DE', cur: 'EUR',
    locations: [{ code: 'L1', name: 'Ofis', wh: 'de', city: 'Hamburg' }], users: [{ name: 'Einkauf', email: 'einkauf@bueronord.example', canAdjust: false }],
    invoices: inv('13', [[18, 1260], [3, 940], [0, 1530, 'taslak']]), payments: pay([[10, 1260, 'SEPA 2026-11-04'], [1, 940, 'SEPA 2026-11-13']]) },
  { id: 'c4', code: 'C-1004', name: 'Saat Dünyası', legal: 'Saat Dünyası Tic. Ltd. Şti. (örnek)', company: 'docser', country: 'TR', cur: 'TRY',
    locations: [{ code: 'L1', name: 'Mağaza', wh: 'ist', city: 'İstanbul' }], users: [{ name: 'Satın alma', email: 'satinalma@saatdunyasi.example', canAdjust: false }],
    invoices: inv('14', [[25, 186000], [8, 94500]]), payments: pay([[15, 100000, 'Havale 30.10']]) },
  { id: 'c5', code: 'C-1005', name: 'Aroma İthalat', legal: 'Aroma İthalat A.Ş. (örnek)', company: 'ithal', country: 'TR', cur: 'USD',
    locations: [{ code: 'L1', name: 'Antrepo', wh: 'ist', city: 'İstanbul' }], users: [{ name: 'Operasyon', email: 'ops@aromaithalat.example', canAdjust: true }],
    invoices: inv('15', [[40, 12400], [14, 7800], [2, 5200, 'taslak']]), payments: pay([[28, 12400, 'SWIFT 17.10']]) },
  { id: 'c6', code: 'C-1006', name: 'Technikhaus', legal: 'Technikhaus e.K. (örnek)', company: 'techno', country: 'DE', cur: 'EUR',
    locations: [{ code: 'L1', name: 'Mağaza', wh: 'tw', city: 'Frankfurt' }], users: [{ name: 'Inhaber', email: 'info@technikhaus.example', canAdjust: false }],
    invoices: inv('16', [[12, 4670], [4, 2130], [0, 880, 'taslak']]), payments: pay([]) },
  { id: 'c7', code: 'C-1007', name: '3D Werkstatt', legal: '3D Werkstatt UG (örnek)', company: 'lady', country: 'DE', cur: 'EUR',
    locations: [{ code: 'L1', name: 'Atölye', wh: 'de', city: 'Berlin' }], users: [{ name: 'Werkstatt', email: 'hallo@3dwerkstatt.example', canAdjust: false }],
    invoices: inv('17', [[27, 1980], [5, 2310], [1, 640, 'taslak']]), payments: pay([[19, 1980, 'PayPal 26.10'], [2, 2310, 'SEPA 12.11']]) },
  { id: 'c8', code: 'C-1008', name: 'Elektro Mega', legal: 'Elektro Mega GmbH (örnek)', company: 'elec', country: 'DE', cur: 'EUR',
    locations: [{ code: 'L1', name: 'Depo', wh: 'mega', city: 'München' }], users: [{ name: 'Lager', email: 'lager@elektromega.example', canAdjust: true }],
    invoices: inv('18', [[16, 5540]]), payments: pay([[6, 2000, 'SEPA 08.11']]) },
]
export const b2bTotals = (c: B2B) => {
  const billed = c.invoices.filter(i => i.status === 'kesin').reduce((a, i) => a + i.total, 0)
  const paid = c.payments.reduce((a, p) => a + p.amount, 0)
  return { billed, paid, balance: billed - paid }
}
