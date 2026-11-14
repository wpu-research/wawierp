import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { ACCOUNTS, AUDIT0, JOBS0, NOW, ORDERS0, PRODUCTS, account, trackingFor, type Account, type Audit, type Job, type Order, type Product, type RetStage, type WhId } from './data'
import { B2B0, MANUAL0, TFLOW, TICKETS0, TRANSFERS0, type B2B, type ManualLabel, type Ticket, type Transfer } from './data2'

export type Role = 'admin' | 'depo' | 'muhasebe'
// Öneri niteliğinde rol tanımları; gerçek rol × modül matrisi sahibinin onayını bekliyor (docs/11 §3, soru 1).
export const ROLES: Record<Role, { label: string; user: string; nav: string[] | 'all'; pii: 'tam' | 'adres'; ops: boolean; finance: boolean }> = {
  admin: { label: 'Sistem yöneticisi', user: 'Sistem Yöneticisi', nav: 'all', pii: 'tam', ops: true, finance: true },
  depo: { label: 'Depo çalışanı', user: 'Depo Çalışanı 1', nav: ['overview', 'orders', 'labels', 'picking', 'returns', 'catalog', 'stock', 'transfers', 'counting', 'quality', 'alerts', 'shifts', 'status'], pii: 'adres', ops: true, finance: false },
  muhasebe: { label: 'Muhasebe', user: 'Muhasebe', nav: ['overview', 'orders', 'returns', 'support', 'finance', 'b2b', 'bank', 'accounting', 'profit', 'prices', 'alerts', 'billing', 'audit'], pii: 'tam', ops: false, finance: true },
}

interface Ctx {
  role: Role; setRole: (r: Role) => void
  companyId: string; setCompanyId: (s: string) => void
  whId: WhId | ''; setWhId: (s: WhId | '') => void
  orders: Order[]; allOrders: Order[]; accounts: Account[]; products: Product[]
  jobs: Job[]; audit: Audit[]; revealed: Set<string>; toast: string | null
  createLabels: (ids: string[]) => void; ship: (ids: string[]) => void; issueInvoices: (ids: string[]) => void
  transfers: Transfer[]; tickets: Ticket[]; b2b: B2B[]; manual: ManualLabel[]
  advanceTransfer: (id: string) => void; replyTicket: (id: string, text: string) => void; closeTicket: (id: string) => void; readTicket: (id: string) => void
  addPayment: (id: string, amount: number, ref: string) => void; finalizeB2B: (id: string, no: string) => void; addManual: (m: Omit<ManualLabel, 'id' | 't'>) => void; notify: (m: string) => void
  reveal: (o: Order) => void; advanceReturn: (id: string) => void; syncNow: (accId: string) => void; retryJob: (id: string) => void
}
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)
const NEXT: Record<RetStage, RetStage> = { bekleniyor: 'geldi', geldi: 'odeme', odeme: 'cozuldu', cozuldu: 'cozuldu' }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin')
  const [companyId, setCompanyId] = useState('')
  const [whId, setWhId] = useState<WhId | ''>('')
  const [allOrders, setOrders] = useState(ORDERS0)
  const [jobs, setJobs] = useState(JOBS0)
  const [audit, setAudit] = useState(AUDIT0)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [allTransfers, setTransfers] = useState(TRANSFERS0)
  const [allTickets, setTickets] = useState(TICKETS0)
  const [allB2b, setB2b] = useState(B2B0)
  const [allManual, setManual] = useState(MANUAL0)
  const [toast, setToast] = useState<string | null>(null)

  const say = useCallback((m: string) => { setToast(m); window.setTimeout(() => setToast(t => (t === m ? null : t)), 3200) }, [])
  const log = useCallback((cat: string, event: string, obj: string, result: Audit['result'] = 'başarılı') =>
    setAudit(a => [{ id: 'e' + (a.length + 1) + Date.now(), t: NOW, result, cat, event, user: ROLES[role].user, obj }, ...a]), [role])
  const patch = useCallback((ids: string[], f: (o: Order) => Order) => { const s = new Set(ids); setOrders(os => os.map(o => (s.has(o.id) ? f(o) : o))) }, [])

  const inScope = useCallback((c: string, w: WhId) => (!companyId || c === companyId) && (!whId || w === whId), [companyId, whId])
  const orders = useMemo(() => allOrders.filter(o => inScope(o.company, o.wh)), [allOrders, inScope])
  const accounts = useMemo(() => ACCOUNTS.filter(a => inScope(a.company, a.wh)), [inScope])
  const products = useMemo(() => PRODUCTS.filter(p => !whId || p.stock[whId]), [whId])

  const transfers = useMemo(() => allTransfers.filter(t => !whId || t.from === whId || t.to === whId), [allTransfers, whId])
  const tickets = useMemo(() => { const ids = new Set(accounts.map(a => a.id)); return allTickets.filter(t => ids.has(t.acc)) }, [allTickets, accounts])
  const b2b = useMemo(() => allB2b.filter(c => !companyId || c.company === companyId), [allB2b, companyId])
  const manual = useMemo(() => allManual.filter(m => !whId || m.wh === whId), [allManual, whId])

  const value: Ctx = {
    transfers, tickets, b2b, manual, notify: say,
    advanceTransfer: id => {
      const t = allTransfers.find(x => x.id === id)!, i = TFLOW.findIndex(f => f.key === t.status), next = TFLOW[i + 1]
      if (!next) return
      setTransfers(ts => ts.map(x => (x.id !== id ? x : { ...x, status: next.key, lines: next.key === 'kabul' ? x.lines.map(l => ({ ...l, received: l.received ?? l.qty })) : x.lines })))
      if (next.key === 'cikti') log('Stok', 'Transfer çıkışı stok defterine yazıldı', t.no)
      else if (next.key === 'kabul') log('Stok', 'Mal kabul stok defterine yazıldı', t.no)
      else log('Transfer', `Durum: ${next.label}`, t.no)
      say(`${t.no}: ${next.label}`)
    },
    replyTicket: (id, text) => {
      setTickets(ts => ts.map(x => (x.id !== id ? x : { ...x, status: 'waiting', unread: false, t: NOW, msgs: [...x.msgs, { from: 'biz', text, t: NOW, user: ROLES[role].user }] })))
      say('Yanıt kanala gönderildi')
    },
    closeTicket: id => { setTickets(ts => ts.map(x => (x.id !== id ? x : { ...x, status: 'closed', unread: false }))); say('Konuşma kapatıldı') },
    readTicket: id => setTickets(ts => (ts.some(x => x.id === id && x.unread) ? ts.map(x => (x.id !== id ? x : { ...x, unread: false })) : ts)),
    addPayment: (id, amount, ref) => {
      const c = allB2b.find(x => x.id === id)!
      setB2b(cs => cs.map(x => (x.id !== id ? x : { ...x, payments: [{ t: NOW, amount, ref }, ...x.payments] })))
      log('Finans', `Tahsilat kaydedildi (${amount.toLocaleString('tr-TR')} ${c.cur})`, 'cari ' + c.code)
      say('Tahsilat kaydedildi')
    },
    finalizeB2B: (id, no) => {
      const c = allB2b.find(x => x.id === id)!
      const n = `RE-B2B-${c.invoices.find(i => i.status === 'kesin')?.no.slice(7, 9) ?? c.code.slice(-2)}${String(c.invoices.filter(i => i.status === 'kesin').length + 1).padStart(3, '0')}`
      setB2b(cs => cs.map(x => (x.id !== id ? x : { ...x, invoices: x.invoices.map(i => (i.no === no ? { ...i, no: n, status: 'kesin' as const, t: NOW } : i)) })))
      log('Finans', 'Toptan satış taslağı faturaya çevrildi', `${c.code} · ${n}`)
      say(`${n} kesinleştirildi`)
    },
    addManual: m => {
      setManual(ms => [{ ...m, id: 'ml' + Date.now(), t: NOW }, ...ms])
      log('Kargo', `Siparişsiz etiket oluşturuldu (${m.carrier}, ${m.kg} kg)`, m.name)
      say('Siparişsiz etiket hazır')
    },
    role, setRole, companyId, setCompanyId, whId, setWhId, orders, allOrders, accounts, products, jobs, audit, revealed, toast,
    createLabels: ids => {
      patch(ids, o => (o.status === 'yeni' || o.status === 'hazirlaniyor' ? { ...o, label: 'hazir', status: 'hazirlaniyor', issue: undefined } : o))
      log('Kargo', `Kargo etiketi oluşturuldu (${ids.length} sipariş)`, ids.length === 1 ? 'sipariş ' + allOrders.find(o => o.id === ids[0])!.no : 'toplu işlem')
      say(`${ids.length} sipariş için etiket hazır`)
    },
    ship: ids => {
      patch(ids, o => (o.label === 'hazir' && o.status === 'hazirlaniyor' ? { ...o, status: 'kargoda', invoice: 'kesin', tracking: trackingFor(o.wh) } : o))
      log('Kargo', `Kargoya verildi, takip no kanala gönderildi (${ids.length})`, ids.length === 1 ? 'sipariş ' + allOrders.find(o => o.id === ids[0])!.no : 'toplu işlem')
      say(`${ids.length} sipariş kargoya verildi`)
    },
    issueInvoices: ids => {
      patch(ids, o => (o.invoice !== 'kesin' ? { ...o, invoice: 'kesin' } : o))
      log('Finans', `Fatura kesinleştirildi (${ids.length})`, ids.length === 1 ? 'sipariş ' + allOrders.find(o => o.id === ids[0])!.no : 'toplu işlem')
      say(`${ids.length} fatura kesinleştirildi`)
    },
    reveal: o => {
      setRevealed(s => new Set(s).add(o.id))
      log('Kişisel veri', ROLES[role].pii === 'tam' ? 'Müşteri ad, adres ve iletişim bilgisi görüntülendi' : 'Müşteri teslimat adresi görüntülendi', 'sipariş ' + o.no)
    },
    advanceReturn: id => {
      const o = allOrders.find(x => x.id === id)!
      patch([id], x => ({ ...x, ret: NEXT[x.ret ?? 'bekleniyor'] }))
      log('İade', `İade aşaması ilerletildi → ${NEXT[o.ret ?? 'bekleniyor']}`, 'sipariş ' + o.no)
    },
    syncNow: accId => {
      const a = account(accId)
      setJobs(j => [{ id: 'j' + (j.length + 1) + Date.now(), acc: accId, kind: 'Elle eşitleme · sipariş + stok', status: 'sirada', tries: 0, last: NOW, next: NOW }, ...j])
      log('Kanal', 'Elle eşitleme kuyruğa alındı', a.name)
      say('Eşitleme kuyruğa alındı')
    },
    retryJob: id => {
      setJobs(j => j.map(x => (x.id === id ? { ...x, status: 'sirada', tries: 0, next: NOW, msg: 'Yeniden deneme kuyruğa alındı' } : x)))
      say('İş yeniden kuyruğa alındı')
    },
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
