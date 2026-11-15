import { useEffect, useRef, useState, type ReactNode } from 'react'
import type Anthropic from '@anthropic-ai/sdk'
import { ArrowUp, Check, ExternalLink, Lock, Maximize2, Minimize2, ShieldCheck, Sparkles, X } from 'lucide-react'
import { CHANNEL, NOW, RET, account, dayKey, dropWaiting, fmtMoney, fmtNum, hasIssue, isOpen, overdue, toShip, whName, type ChannelType, type Order, type WhId } from './data'
import { ROLES, useStore } from './store'
import { Badge, Btn } from './ui'
import { SimilarList, findProduct, inStock, similarTo } from './similar'
import { RivalList, rivalsOf } from './rivals'

/* Asistan paneli. Sunucuda API anahtarı tanımlıysa (server.mjs + assistant.mjs) gerçek yapay zekâya bağlanır:
   model araç çağırır, araçlar burada mock verinin üzerinde çalışır, sonuç modele geri gider.
   Anahtar yoksa ya da sunucu yoksa (npm run dev, dosyadan açma) hazır senaryolara düşer: yazılanı anahtar
   kelimelerle eşleştirir, yanıtı mock veriden hesaplar. İki yolda da kurallar aynı:
   - her rakam veriden gelir ve dayandığı ekran bağlantısıyla birlikte sunulur
   - veri değiştiren her işlem önce taslak olarak gösterilir, kullanıcı onaylar
   - asistan, kendisine yazan kullanıcının rolünden fazlasını yapamaz
   - para, fiyat ve toplu silme işlemleri bu basamakta kapalıdır
   - müşteri adı ve iletişim bilgisi asistana gösterilmez */

type Src = { label: string; href: string }
type ActKind = 'labels' | 'ship' | 'retry' | 'reply' | 'rule' | 'plan'
type Step = { kind: 'labels' | 'ship' | 'retry'; ids: string[]; label: string }
interface Act { kind: ActKind; title: string; lines: string[]; ids: string[]; payload?: string; steps?: Step[]; auto?: boolean; state: 'bekliyor' | 'uygulandi' | 'vazgecildi' }
interface Msg { id: number; from: 'user' | 'agent'; body: ReactNode; extra?: ReactNode; sources?: Src[]; act?: Act }
type Mode = 'yanit' | 'onay' | 'oto'
type ApiMsg = Anthropic.Beta.BetaMessageParam
type Block = Anthropic.Beta.BetaContentBlock
type ToolOut = { data: unknown; error?: boolean; act?: Act; src?: Src[]; view?: ReactNode }
const SCREEN: Record<string, string> = { overview: 'Genel bakış', orders: 'Siparişler', labels: 'Kargo etiketleri', returns: 'İadeler', support: 'Destek', catalog: 'Katalog', stock: 'Stok defteri', transfers: 'Depo transferi', channels: 'Kanallar', sync: 'Eşitleme işleri', finance: 'Faturalar ve KDV', b2b: 'Cari ve B2B portal', team: 'Ekip ve yetki', audit: 'Denetim kaydı', reservations: 'Stok ayırma', portal: 'Toptan müşteri portalı', 'return-form': 'Müşteri iade formu', picking: 'Toplama listesi', quality: 'Veri kalitesi', content: 'Ürün metni ve çeviri', counting: 'Sayım planı', replenish: 'Tedarik önerileri', listing: 'Toplu listeleme', prices: 'Fiyat ve kârlılık', rules: 'Otomasyon kuralları', alerts: 'Uyarılar ve özet', shifts: 'Vardiya önerisi', bank: 'Banka mutabakatı', accounting: 'Muhasebe aktarımı', profit: 'Kârlılık', onboarding: 'Kurulum sihirbazı', developers: 'API ve bildirim uçları', billing: 'Kullanım ve abonelik', status: 'Durum sayfası' }
// Mutlak adres: sayfa adresinde kullanıcı bilgisi olsa bile istek kurulabilsin; tarayıcı panel şifresini kendisi ekler.
const API = location.origin + '/api/assistant'
const NOTE_KIND: Record<ActKind, string> = { labels: 'Kargo etiketi oluşturma', ship: 'Kargoya verme', retry: 'Eşitlemeyi yeniden deneme', reply: 'Destek yanıtı', rule: 'Otomasyon kuralı', plan: 'Gün kapatma planı' }
const CAP = 25 // tek seferde en fazla bu kadar kayda işlem önerilir

const SUGGEST = ['Günü kapat: etiket, sevk ve eşitlemeleri hazırla', 'Stokta risk var mı?', 'Hangi ürünler bitmek üzere?', 'Amber Wood ürününü rakipler aynı platformlarda kaça satıyor?', 'Amber Wood ürününe benzer, diğer markalardan ne var?', 'Dün hangi kanaldan kaç sipariş geldi?', 'Geciken siparişler hangileri?', 'Ödenmiş siparişlerin etiketlerini hazırla', 'Kanallarda sorun var mı?', 'Veri kalitesi ne durumda?', 'Bekleyen müşteri sorusuna yanıt taslağı yaz', 'Ödeme gelince etiketi otomatik oluştur']

const norm = (s: string) => s.toLocaleLowerCase('tr-TR')
const plural = (n: number, w: string) => `${fmtNum(n)} ${w}`

export default function Agent({ open, onClose, ask }: { open: boolean; onClose: () => void; ask?: { text: string; n: number } | null }) {
  const st = useStore()
  const R = ROLES[st.role]
  const [mode, setMode] = useState<Mode>('onay')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const seq = useRef(1)
  const end = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, busy])
  useEffect(() => { if (open) input.current?.focus() }, [open])
  const greeted = useRef(false)
  useEffect(() => {
    if (!open || greeted.current) return
    greeted.current = true
    const ids = new Set(st.accounts.map(a => a.id))
    const failed = st.jobs.filter(j => j.status === 'basarisiz' && (j.acc === null || ids.has(j.acc))).length
    const late = st.orders.filter(overdue).length, risk = stockRisks().eksi.length, waiting = st.tickets.filter(t => t.status === 'open').length
    const items = [failed && `${fmtNum(failed)} eşitleme işi başarısız`, late && `${fmtNum(late)} sipariş 2 günü aştı`, risk && `${fmtNum(risk)} üründe satılabilir stok eksiye düştü`, waiting && `${fmtNum(waiting)} müşteri sorusu yanıt bekliyor`].filter(Boolean) as string[]
    if (!items.length) return
    setMsgs(a => (a.length ? a : [{ id: seq.current++, from: 'agent', body: <><p className="m-0 font-medium">Siz sormadan fark ettiklerim:</p><ul className="m-0 mt-1.5 pl-4">{items.map(i => <li key={i}>{i}</li>)}</ul><p className="m-0 mt-2 text-ink2">İsterseniz “Günü kapat” diyerek bunlar için bir plan hazırlatabilirsiniz.</p></>,
      sources: [{ label: 'Eşitleme işleri', href: '#/sync' }, { label: '2 günü aşanlar', href: '#/orders?view=overdue' }, { label: 'Stok ayırma', href: '#/reservations' }, { label: 'Destek', href: '#/support' }] }]))
  // yalnız ilk açılışta çalışır
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const push = (m: Omit<Msg, 'id'>) => setMsgs(a => [...a, { ...m, id: seq.current++ }])

  // ---- ortak hesaplar (hazır senaryolar ve yapay zekâ araçları aynı sayıları kullanır) ----
  const stockRisks = () => {
    const res = new Map<string, number>()
    for (const o of st.orders) if (isOpen(o) && o.supply === 'fiziki') for (const i of o.items) res.set(i.pid + '|' + o.wh, (res.get(i.pid + '|' + o.wh) ?? 0) + i.qty)
    const rows: { ad: string; sku: string; depo: string; fiziki: number; ayrilan: number; satilabilir: number; min: number }[] = []
    let sayimYok = 0
    for (const p of st.products) for (const [wh, r] of Object.entries(p.stock)) {
      if (!r) continue
      if (r.fiziki === null) { sayimYok++; continue }
      const a = res.get(p.id + '|' + wh) ?? 0
      rows.push({ ad: p.name, sku: p.sku, depo: whName(wh as WhId), fiziki: r.fiziki, ayrilan: a, satilabilir: r.fiziki - a, min: r.min })
    }
    const eksi = rows.filter(r => r.satilabilir < 0).sort((a, b) => a.satilabilir - b.satilabilir)
    const az = rows.filter(r => r.satilabilir >= 0 && r.satilabilir <= r.min).sort((a, b) => a.satilabilir - b.satilabilir)
    return { eksi, az, sayimYok, ayrilanToplam: rows.reduce((s, r) => s + r.ayrilan, 0) }
  }
  const replenish = () => {
    const sold = new Map<string, number>()
    for (const o of st.orders) if (o.status !== 'iptal') for (const i of o.items) sold.set(i.pid, (sold.get(i.pid) ?? 0) + i.qty)
    return st.products.filter(p => sold.has(p.id)).map(p => {
      const stok = Object.values(p.stock).reduce((s, r) => s + (r?.fiziki ?? 0), 0), gunluk = sold.get(p.id)! / 30
      return { ad: p.name, sku: p.sku, son_30_gun_satis: sold.get(p.id)!, fiziki_stok: stok, kac_gun_yeter: Math.max(0, Math.round(stok / gunluk)), onerilen_siparis_30_gun: Math.max(0, Math.ceil(gunluk * 30 - stok)) }
    }).sort((a, b) => a.kac_gun_yeter - b.kac_gun_yeter)
  }
  const labelable = (o: Order) => toShip(o) && o.supply === 'fiziki' && o.label === 'yok' && !o.issue
  const shippable = (o: Order) => o.label === 'hazir' && o.status === 'hazirlaniyor'

  // İşlemi uygular; denetim kaydına "asistan aracılığıyla" notu düşer.
  const exec = (kind: Step['kind'] | 'reply', ids: string[], payload?: string) => {
    if (kind === 'labels') st.createLabels(ids, 'asistan')
    else if (kind === 'ship') st.ship(ids, 'asistan')
    else if (kind === 'retry') ids.forEach(id => st.retryJob(id, 'asistan'))
    else st.replyTicket(ids[0], payload!, 'asistan')
  }
  // "Kendiliğinden" düzeyinde yalnız en düşük riskli iş (başarısız eşitlemeyi yeniden deneme) onaysız uygulanır.
  const auto = (a: Act): Act => {
    // Konuşmada müşteri metni okunduysa (get_open_tickets) enjeksiyon riski nedeniyle her yazma işlemi onay ister.
    if (mode !== 'oto' || a.kind !== 'retry' || !R.ops || readCustomer.current) return a
    exec('retry', a.ids)
    return { ...a, state: 'uygulandi', auto: true }
  }

  // ---- gerçek yapay zekâ bağlantısı ----
  const [live, setLive] = useState<'bilinmiyor' | 'canli' | 'mock'>('bilinmiyor')
  const api = useRef<ApiMsg[]>([])   // modele giden konuşma (araç çağrıları ve sonuçlarıyla)
  const notes = useRef<string[]>([]) // onay / vazgeçme bilgisi her istekte ayrı `context.panel` alanıyla iletilir (son 5)
  const readCustomer = useRef(false) // bu konuşmada müşteri metni okuyan araç çalıştı mı (metin geçmişte kaldığı için sonraki turlarda da geçerli)
  useEffect(() => {
    if (location.protocol === 'file:') { setLive('mock'); return }
    let off = false
    fetch(API).then(r => (r.ok ? r.json() : null)).then(j => { if (!off) setLive(j?.live ? 'canli' : 'mock') }).catch(() => { if (!off) setLive('mock') })
    return () => { off = true }
  }, [])
  const scopeText = [st.companyId ? 'seçili şirket' : 'tüm şirketler', st.whId ? 'seçili depo' : 'tüm depolar'].join(', ')

  // Modelin çağırdığı araçlar. Hepsi o anki kapsamdaki veriyi okur; müşteri bilgisi döndürmez.
  // Veri değiştiren tek araç propose_action'dır ve yalnız onay kartı oluşturur.
  function runTool(name: string, input: Record<string, unknown>): ToolOut {
    const int = (v: unknown, d: number, max: number) => Math.max(1, Math.min(max, typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : d))
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
    const hours = (t: number) => Math.round((NOW - t) / 3600_000)
    const row = (o: Order) => ({ id: o.id, no: o.no, kanal: CHANNEL[account(o.acc).type].label, hesap: account(o.acc).name, durum: o.status, odeme: o.pay, etiket: o.label, tedarik: o.supply, bekleme_saat: hours(o.t), sorun: o.issue ?? null, ...(R.finance ? { tutar: o.total, para_birimi: o.cur } : {}) })
    const today = dayKey(NOW), yest = dayKey(NOW - 86400_000)
    const eur = (l: Order[]) => Math.round(l.filter(o => o.cur === 'EUR').reduce((s, o) => s + o.total, 0))
    const ids = new Set(st.accounts.map(a => a.id))
    const badJobs = st.jobs.filter(j => (j.status === 'basarisiz' || j.status === 'kismi') && (j.acc === null || ids.has(j.acc)))

    switch (name) {
      case 'get_overview': {
        const dT = st.orders.filter(o => dayKey(o.t) === today), dY = st.orders.filter(o => dayKey(o.t) === yest)
        return { src: [{ label: 'Genel bakış', href: '#/overview' }, { label: 'Siparişler', href: '#/orders' }], data: {
          dun: { siparis: dY.length, kanal_dagilimi: byChannel(dY), ...(R.finance ? { ciro_eur: eur(dY) } : {}) },
          bugun: { siparis: dT.length, ...(R.finance ? { ciro_eur: eur(dT) } : {}) },
          gonderilecek: st.orders.filter(toShip).length, iki_gunu_asan: st.orders.filter(overdue).length, sorunlu: st.orders.filter(hasIssue).length,
          acik_iade: st.orders.filter(o => o.ret && o.ret !== 'cozuldu').length, yanit_bekleyen_destek: st.tickets.filter(t => t.status === 'open').length,
          sorunlu_kanal_hesabi: st.accounts.filter(a => a.health !== 'ok').length, basarisiz_esitleme_isi: badJobs.length,
          not: R.finance ? undefined : 'Tutarlar bu role kapalı.',
        } }
      }
      case 'list_orders': {
        const view = String(input.view)
        const f: Record<string, (o: Order) => boolean> = { toship: toShip, overdue, issue: hasIssue, drop: dropWaiting, label_missing: labelable, label_ready: shippable, today: o => dayKey(o.t) === today, yesterday: o => dayKey(o.t) === yest }
        if (!f[view]) return { error: true, data: { hata: 'Bilinmeyen görünüm' } }
        const l = st.orders.filter(f[view])
        const hrefView = view === 'toship' || view === 'overdue' || view === 'issue' || view === 'drop' ? `#/orders?view=${view}` : view.startsWith('label') ? '#/labels' : '#/orders'
        return { src: [{ label: view.startsWith('label') ? 'Kargo etiketleri' : 'Siparişler', href: hrefView }], data: { toplam: l.length, kanal_dagilimi: byChannel(l), satirlar: l.slice(0, int(input.limit, 25, 50)).map(row) } }
      }
      case 'get_channel_health':
        return { src: [{ label: 'Kanallar', href: '#/channels' }, { label: 'Eşitleme işleri', href: '#/sync' }], data: {
          hesap_sayisi: st.accounts.length,
          sorunlu_hesaplar: st.accounts.filter(a => a.health !== 'ok').map(a => ({ hesap: a.name, kanal: CHANNEL[a.type].label, durum: a.health, not: a.note ?? null, son_esitleme_saat_once: hours(a.lastSync) })),
          sorunlu_isler: badJobs.map(j => ({ id: j.id, hesap: j.acc ? account(j.acc).name : 'Sistem', tur: j.kind, durum: j.status, deneme: j.tries, mesaj: j.msg ?? null })),
        } }
      case 'get_data_quality': {
        const selling = new Map<string, number>()
        for (const o of st.orders) for (const i of o.items) selling.set(i.pid, (selling.get(i.pid) ?? 0) + i.qty)
        const bad = st.products.filter(p => !p.image || !p.ean)
        return { src: [{ label: 'Görseli eksik ürünler', href: '#/catalog?view=gorsel' }, { label: 'Barkodu eksik ürünler', href: '#/catalog?view=ean' }], data: {
          urun_sayisi: st.products.length, gorseli_eksik: st.products.filter(p => !p.image).length, barkodu_eksik: st.products.filter(p => !p.ean).length,
          eksigi_olup_son_30_gunde_satilan: bad.filter(p => selling.has(p.id)).length,
          ornekler: bad.sort((a, b) => (selling.get(b.id) ?? 0) - (selling.get(a.id) ?? 0)).slice(0, 8).map(p => ({ sku: p.sku, ad: p.name, eksik: [!p.image && 'görsel', !p.ean && 'barkod'].filter(Boolean), son_30_gun_satis_adedi: selling.get(p.id) ?? 0 })),
        } }
      }
      case 'get_returns': {
        const rets = st.orders.filter(o => o.ret)
        return { src: [{ label: 'İadeler', href: '#/returns' }], data: { toplam: rets.length, asamalar: RET.map(r => ({ asama: r.label, adet: rets.filter(o => o.ret === r.key).length })) } }
      }
      case 'get_open_tickets': {
        const open = st.tickets.filter(t => t.status === 'open').sort((a, b) => a.t - b.t)
        return { src: [{ label: 'Destek', href: '#/support' }], data: { toplam: open.length, konusmalar: open.slice(0, int(input.limit, 5, 10)).map(t => ({ id: t.id, konu: t.subject, hesap: account(t.acc).name, bekleme_saat: hours(t.t), siparis_no: st.allOrders.find(o => o.id === t.orderId)?.no ?? null, son_musteri_mesaji: [...t.msgs].reverse().find(m => m.from === 'musteri')?.text ?? null })) } }
      }
      case 'get_stock_risks': {
        const r = stockRisks()
        return { src: [{ label: 'Stok ayırma', href: '#/reservations' }, { label: 'Sayım planı', href: '#/counting' }], data: { aciklama: 'satilabilir = sayılmış fiziki stok − açık siparişler için ayrılan', eksiye_dusen: r.eksi.length, tukenmek_uzere: r.az.length, hic_sayilmamis_depo_kaydi: r.sayimYok, ayrilan_toplam_adet: r.ayrilanToplam, eksiye_dusenler: r.eksi.slice(0, 8), tukenmek_uzere_olanlar: r.az.slice(0, 8) } }
      }
      case 'get_replenishment':
        return { src: [{ label: 'Tedarik önerileri', href: '#/replenish' }], data: { not: 'Satış hızı son 30 günün siparişlerinden; stok tüm depoların sayılmış fiziki toplamı.', urunler: replenish().slice(0, int(input.limit, 8, 20)) } }
      case 'get_channel_performance': {
        if (!R.finance) return { error: true, data: { hata: `Kullanıcının rolü (${R.label}) tutarları göremez.` } }
        const m = new Map<ChannelType, { siparis: number; ciro_eur: number }>()
        for (const o of st.orders) { if (o.status === 'iptal') continue; const t = account(o.acc).type, x = m.get(t) ?? { siparis: 0, ciro_eur: 0 }; x.siparis++; if (o.cur === 'EUR') x.ciro_eur += o.total; m.set(t, x) }
        const bekleyen = st.orders.filter(o => o.pay === 'bekliyor')
        return { src: [{ label: 'Kârlılık', href: '#/profit' }, { label: 'Banka mutabakatı', href: '#/bank' }], data: {
          donem: 'son 30 gün; yalnız EUR siparişler ciroya dahil', kanallar: [...m.entries()].map(([t, x]) => ({ kanal: CHANNEL[t].label, siparis: x.siparis, ciro_eur: Math.round(x.ciro_eur), ortalama_sepet_eur: x.siparis ? Math.round(x.ciro_eur / x.siparis) : 0 })).sort((a, b) => b.ciro_eur - a.ciro_eur),
          odeme_bekleyen_siparis: bekleyen.length, odeme_bekleyen_tutar_eur: Math.round(bekleyen.filter(o => o.cur === 'EUR').reduce((s, o) => s + o.total, 0)),
        } }
      }
      case 'get_competitor_offers': {
        const p = findProduct(String(input.query ?? ''), st.products)
        if (!p) return { error: true, data: { hata: 'Bu ad ya da SKU ile ürün bulunamadı. Kullanıcıdan ürün adını ya da SKU\'yu isteyin.' } }
        const r = rivalsOf(p)
        const src = [{ label: p.name, href: `#/catalog?p=${p.id}` }, { label: 'Fiyat ve kârlılık', href: '#/prices' }]
        if (!r.ean) return { src, data: { urun: p.name, sonuc: 'Ürünün barkodu (EAN) eksik; rakip teklifleri barkodla eşleştiği için bulunamaz. Önce EAN girilmeli.' } }
        if (!r.pazarlar.length) return { src, data: { urun: p.name, sonuc: 'Ürünün pazaryerinde aktif ilanı yok; karşılaştırılacak teklif yok.' } }
        return {
          src, view: <RivalList key={'r' + p.id} r={r} />,
          data: {
            urun: { ad: p.name, marka: p.brand, sku: p.sku }, not: 'Sıralama müşterinin ödediği toplam tutara (fiyat + kargo) göre. Teklifler taslakta örnek veridir.', panelde_gosterildi: true,
            platformlar: r.pazarlar.map(m => ({ platform: m.label, para_birimi: m.cur, satici_sayisi: m.teklifler.length, bizim_sira: m.sira, en_ucuz_toplam: m.enUcuz, en_ucuzdan_fark: m.fark,
              teklifler: m.teklifler.slice(0, 6).map(o => ({ satici: o.biz ? `biz (${o.satici})` : o.satici, fiyat: o.fiyat, kargo: o.kargo, toplam: o.toplam, teslim_gun: o.teslim, puan: o.puan })) })),
          },
        }
      }
      case 'find_similar_products': {
        const p = findProduct(String(input.query ?? ''), st.products)
        if (!p) return { error: true, data: { hata: 'Bu ad ya da SKU ile ürün bulunamadı. Kullanıcıdan ürün adını ya da SKU\'yu isteyin.' } }
        const other = input.other_brands_only !== false
        const list = similarTo(p, st.products, { otherBrands: other, limit: int(input.limit, 5, 10) })
        return {
          src: [{ label: p.name, href: `#/catalog?p=${p.id}` }],
          view: list.length ? <SimilarList key={p.id} items={list} /> : undefined,
          data: {
            urun: { ad: p.name, marka: p.brand, sku: p.sku, kategori: p.cat, fiyat_eur: p.price, stok: inStock(p) },
            kapsam: other ? 'yalnız diğer markalar, yalnız stokta olanlar' : 'tüm markalar, yalnız stokta olanlar',
            not: list.some(x => x.kaba) ? 'Bu ürünün özellikleri girilmemiş; eşleşme yalnız kategori ve fiyata göre, kaba.' : 'Benzerlik ürün türü ve özelliklerinden (koku ailesi, malzeme, bağlantı tipi gibi) hesaplandı.',
            panelde_gosterildi: list.length > 0,
            benzerler: list.map(x => ({ ad: x.p.name, marka: x.p.brand, sku: x.p.sku, stok: x.stok, fiyat_eur: x.p.price, ortak_ozellikler: x.ortak })),
          },
        }
      }
      case 'open_screen': {
        const page = String(input.page)
        if (!SCREEN[page]) return { error: true, data: { hata: 'Bilinmeyen ekran' } }
        if (R.nav !== 'all' && !R.nav.includes(page)) return { error: true, data: { hata: `Kullanıcının rolü (${R.label}) bu ekranı göremez.` } }
        location.hash = `#/${page}`
        return { src: [{ label: SCREEN[page], href: `#/${page}` }], data: { acildi: SCREEN[page] } }
      }
      case 'propose_action': {
        const kind = String(input.kind), summary = String(input.summary ?? '').slice(0, 140)
        if (mode === 'yanit') return { error: true, data: { hata: 'Kullanıcı "Yalnız yanıtla" düzeyini seçti; taslak hazırlanamaz. Kullanıcıya düzeyi "Hazırla, onayla" yapabileceğini söyle.' } }
        const needOps = kind !== 'reply_ticket'
        if (needOps && !R.ops) return { error: true, data: { hata: `Kullanıcının rolü (${R.label}) bu işlemi yapamaz; asistan da onun adına yapamaz.` } }
        const made = (a: Omit<Act, 'state'>, extra: object = {}): ToolOut => { const act = auto({ ...a, state: 'bekliyor' }); return { act, data: { durum: act.auto ? 'Kullanıcı “Kendiliğinden” düzeyini seçtiği için bu düşük riskli işlem onay beklemeden uygulandı ve denetim kaydına yazıldı.' : 'Taslak hazır, kullanıcının onayını bekliyor. İşlem henüz yapılmadı.', kabul_edilen: a.ids.length || undefined, ...extra } } }
        if (kind === 'create_labels' || kind === 'ship_orders') {
          const want = list(input.order_ids), okFn = kind === 'create_labels' ? labelable : shippable
          const good = st.orders.filter(o => want.includes(o.id) && okFn(o))
          if (!good.length) return { error: true, data: { hata: 'Verilen kimliklerden hiçbiri bu işleme uygun değil. Kimlikleri list_orders ile al (create_labels için view=label_missing, ship_orders için view=label_ready).' } }
          const take = good.slice(0, CAP)
          return made({ kind: kind === 'create_labels' ? 'labels' : 'ship', title: summary || (kind === 'create_labels' ? `${take.length} sipariş için kargo etiketi oluştur` : `${take.length} siparişi kargoya ver`), ids: take.map(o => o.id), lines: [`${take.length} sipariş`, ...byChannel(take), ...(good.length > CAP ? [`Üst sınır ${CAP}: ${good.length - CAP} sipariş bu tura alınmadı`] : [])] }, { reddedilen: want.length - good.length, ust_sinir_nedeniyle_alinmayan: Math.max(0, good.length - CAP) })
        }
        if (kind === 'retry_sync_jobs') {
          const want = list(input.job_ids), good = st.jobs.filter(j => want.includes(j.id) && j.status === 'basarisiz').slice(0, CAP)
          if (!good.length) return { error: true, data: { hata: 'Verilen kimliklerde yeniden denenebilecek başarısız iş yok. Kimlikleri get_channel_health ile al.' } }
          return made({ kind: 'retry', title: summary || `${good.length} başarısız işi yeniden dene`, ids: good.map(j => j.id), lines: good.slice(0, 6).map(j => `${j.acc ? account(j.acc).name : 'Sistem'} · ${j.kind}`) }, { reddedilen: want.length - good.length })
        }
        if (kind === 'reply_ticket') {
          const t = st.tickets.find(x => x.id === input.ticket_id && x.status === 'open'), text = String(input.reply_text ?? '').trim().slice(0, 1500)
          if (!t || !text) return { error: true, data: { hata: 'Açık bir konuşma kimliği ve yanıt metni gerekli. Kimliği get_open_tickets ile al.' } }
          return made({ kind: 'reply', title: summary || `“${t.subject}” konuşmasına yanıt gönder`, ids: [t.id], payload: text, lines: [`“${text}”`, `${account(t.acc).name} · gönderilmeden önce Destek ekranında düzenlenebilir`] })
        }
        if (kind === 'create_rule') {
          const r = (input.rule ?? {}) as Record<string, unknown>
          if (!r.event || !r.action) return { error: true, data: { hata: 'Kural için olay ve işlem gerekli.' } }
          return made({ kind: 'rule', title: summary || 'Kural taslağı', ids: [], lines: [`Olay: ${String(r.event).slice(0, 120)}`, `Koşul: ${String(r.condition ?? 'yok').slice(0, 160)}`, `İşlem: ${String(r.action).slice(0, 160)}`, 'Mod: yalnız öner (7 gün), sonra onayınızla “önce sor”', `Üst sınır: tek seferde ${CAP} kayıt`] })
        }
        return { error: true, data: { hata: 'Bilinmeyen işlem türü' } }
      }
      default: return { error: true, data: { hata: 'Bilinmeyen araç' } }
    }
  }

  async function runLive(t: string) {
    const mark = api.current.length
    const panel = notes.current.splice(0).slice(-5) // notlar yalnız bu soruyla bir kez gider; eski onay yeni sanılmasın
    api.current.push({ role: 'user', content: t })
    const sources = new Map<string, Src>()
    const views: ReactNode[] = []
    try {
      for (let turn = 0; turn < 8; turn++) {
        const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: api.current, context: { role: R.label, ops: R.ops, finance: R.finance, scope: scopeText, mode, panel } }) })
        const res = (await r.json().catch(() => ({}))) as { content?: Block[]; stop_reason?: string | null; message?: string }
        if (!r.ok || !res.content) throw new Error(res.message || `Sunucu yanıt vermedi (${r.status})`)
        api.current.push({ role: 'assistant', content: res.content } as ApiMsg)
        const said = res.content.flatMap(b => (b.type === 'text' ? [b.text] : [])).join('\n').trim()
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = []
        const acts: Act[] = []
        // Müşteri metni okuyan araç aynı yanıttaki yazma taslaklarından sonra gelse bile onay zorunlu olsun.
        if (res.content.some(b => b.type === 'tool_use' && b.name === 'get_open_tickets')) readCustomer.current = true
        for (const b of res.content) {
          if (b.type !== 'tool_use') continue
          const out = runTool(b.name, (b.input ?? {}) as Record<string, unknown>)
          if (out.act) acts.push(out.act)
          if (out.view) views.push(out.view)
          for (const s of out.src ?? []) sources.set(s.href, s)
          results.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(out.data), ...(out.error ? { is_error: true } : {}) })
        }
        const done = res.stop_reason !== 'tool_use' || !results.length
        const text = said || (acts.length ? 'Taslağı hazırladım; onayınızı bekliyor.' : '')
        if (res.stop_reason === 'refusal') push({ from: 'agent', body: <p className="m-0">Bu isteği yanıtlayamıyorum.</p> })
        else if (acts.length) acts.forEach((act, i) => push({ from: 'agent', body: <div className="whitespace-pre-wrap">{i === 0 ? text : 'Bir taslak daha:'}</div>, act, sources: done && i === acts.length - 1 && sources.size ? [...sources.values()] : undefined }))
        else if (done && text) push({ from: 'agent', body: <div className="whitespace-pre-wrap">{text}</div>, extra: views.length ? <div className="space-y-2">{views}</div> : undefined, sources: sources.size ? [...sources.values()].slice(0, 4) : undefined })
        if (done) return
        api.current.push({ role: 'user', content: results })
      }
      push({ from: 'agent', body: <p className="m-0">Bu iş beklediğimden uzun sürdü; isteği daha küçük parçalara bölebilir misiniz?</p> })
    } catch (e) {
      api.current.length = mark // yarım kalan turu geri al ki sonraki istek geçerli kalsın
      notes.current.unshift(...panel) // gönderilemeyen notlar sonraki soruya kalsın
      push({ from: 'agent', body: <p className="m-0 text-bad">{e instanceof Error ? e.message : 'Asistana ulaşılamadı.'}</p> })
    } finally { setBusy(false) }
  }

  // ---- yanıt üretimi: yalnız o anki kapsamdaki (şirket, depo, rol) veriyi okur ----
  function answer(qRaw: string): Omit<Msg, 'id' | 'from'> {
    const q = norm(qRaw)
    const has = (...k: string[]) => k.some(x => q.includes(x))
    const draft = (a: Omit<Act, 'state'>): Act | undefined => (mode === 'yanit' ? undefined : auto({ ...a, state: 'bekliyor' }))
    const noDraft = mode === 'yanit' ? <p className="m-0 mt-2 text-mute">İşlem önerisi kapalı: “Yalnız yanıtla” modundasınız.</p> : null

    if (has('rakip', 'buy box', 'kaça satıyor', 'kaça satılıyor')) {
      const p = findProduct(qRaw, st.products)
      if (!p) return { body: <p className="m-0">Hangi ürünün rakip fiyatlarına bakayım? Ürün adını ya da SKU'yu yazın; örneğin “Amber Wood ürününü rakipler kaça satıyor?”.</p>, sources: [{ label: 'Katalog', href: '#/catalog' }] }
      const r = rivalsOf(p), src = [{ label: p.name, href: `#/catalog?p=${p.id}` }, { label: 'Fiyat ve kârlılık', href: '#/prices' }]
      if (!r.ean || !r.pazarlar.length) return { body: <RivalList r={r} />, sources: src }
      const ilk = r.pazarlar.filter(m => m.sira === 1).length, pahali = r.pazarlar.filter(m => m.sira > 1)
      return {
        body: <><p className="m-0"><b>{p.name}</b> {plural(r.pazarlar.length, 'platformda')} satışta. {ilk ? `${fmtNum(ilk)} platformda en ucuz sizsiniz.` : 'Hiçbir platformda en ucuz değilsiniz.'}{pahali.length ? ` En büyük fark ${pahali[0].label}'da: en ucuz teklifin ${fmtMoney(pahali[0].fark, pahali[0].cur)} üstündesiniz.` : ''}</p>
          <p className="m-0 mt-1.5 text-mute">Müşterinin ödediği toplam tutara (fiyat + kargo) göre sıraladım. Fiyatı ben değiştiremem; “Fiyat ve kârlılık” ekranından ayarlanır.</p></>,
        extra: <RivalList r={r} />, sources: src,
      }
    }

    if (has('benzer', 'muadil', 'alternatif')) {
      const p = findProduct(qRaw, st.products)
      if (!p) return { body: <p className="m-0">Hangi ürünün benzerlerini arayayım? Ürün adını ya da SKU'yu yazın; örneğin “Amber Wood ürününe benzerleri göster”.</p>, sources: [{ label: 'Katalog', href: '#/catalog' }] }
      const list = similarTo(p, st.products, { otherBrands: !has('aynı marka', 'tüm marka'), limit: 5 })
      if (!list.length) return { body: <p className="m-0"><b>{p.name}</b> ({p.brand}) için stokta, başka markadan benzer ürün bulamadım.</p>, sources: [{ label: p.name, href: `#/catalog?p=${p.id}` }] }
      return {
        body: <><p className="m-0"><b>{p.name}</b> ({p.brand}) ürününe en yakın, stokta olan {plural(list.length, 'ürün')} buldum; hepsi başka markadan.</p>
          <p className="m-0 mt-1.5 text-mute">{list[0].kaba ? 'Bu ürünün özellikleri girilmemiş; yalnız kategori ve fiyata baktım.' : 'Ürün türüne, ortak özelliklere ve fiyata baktım.'}</p></>,
        extra: <SimilarList items={list} />,
        sources: [{ label: p.name, href: `#/catalog?p=${p.id}` }],
      }
    }

    // korumalı işlemler: para, fiyat, toplu silme
    if (has('iade et', 'para iade', 'geri öde', 'fiyat', 'kaldır', 'iptal et') || /(^|\s)sil/.test(q)) return {
      body: <><p className="m-0"><Lock size={13} className="inline -mt-0.5 mr-1" />Bu işlemi yapamam. Ödeme iadesi, fiyat değişikliği, iptal ve toplu kaldırma bu basamakta asistana kapalı.</p>
        <p className="m-0 mt-2 text-ink2">İlgili ekranı açabilirim; işlemi siz yaparsınız ve denetim kaydına sizin adınıza yazılır.</p></>,
      sources: [{ label: 'İadeler', href: '#/returns' }, { label: 'Katalog', href: '#/catalog' }],
    }

    if (has('günü kapat', 'gün sonu', 'hepsini hazırla')) {
      if (!R.ops) return { body: <p className="m-0">Rolünüz ({R.label}) bu işlemleri yapamıyor; ben de sizin adınıza yapamam.</p> }
      const jobIds = new Set(st.accounts.map(a => a.id))
      const steps: Step[] = [
        { kind: 'labels' as const, ids: st.orders.filter(labelable).slice(0, CAP).map(o => o.id), label: 'kargo etiketi oluştur' },
        { kind: 'ship' as const, ids: st.orders.filter(shippable).slice(0, CAP).map(o => o.id), label: 'etiketi hazır siparişi kargoya ver' },
        { kind: 'retry' as const, ids: st.jobs.filter(j => j.status === 'basarisiz' && (j.acc === null || jobIds.has(j.acc))).slice(0, CAP).map(j => j.id), label: 'başarısız eşitlemeyi yeniden dene' },
      ].filter(s => s.ids.length)
      if (!steps.length) return { body: <p className="m-0">Bugün için bekleyen etiket, sevk ya da başarısız eşitleme yok.</p>, sources: [{ label: 'Genel bakış', href: '#/overview' }] }
      return {
        body: <><p className="m-0">Günü kapatmak için {steps.length} adımlı bir plan hazırladım. Onaylarsanız adımlar sırayla uygulanır; her biri denetim kaydına ayrı yazılır.</p>{noDraft}</>,
        sources: [{ label: 'Kargo etiketleri', href: '#/labels' }, { label: 'Eşitleme işleri', href: '#/sync' }],
        act: mode === 'yanit' ? undefined : { kind: 'plan', title: `${steps.length} adımlı plan`, ids: [], steps, state: 'bekliyor', lines: steps.map((s, i) => `Adım ${i + 1}: ${s.ids.length} ${s.label}`).concat(`Her adımda üst sınır ${CAP} kayıt`) },
      }
    }

    if (has('risk', 'eksi stok', 'tüken', 'fazla satış', 'stokta')) {
      const r = stockRisks()
      return {
        body: <><p className="m-0">{r.eksi.length ? `${fmtNum(r.eksi.length)} üründe satılabilir stok eksiye düşmüş: açık siparişler eldeki sayılmış stoktan fazla.` : 'Satılabilir stoğu eksiye düşen ürün yok.'} {fmtNum(r.az.length)} ürün tükenmek üzere, {fmtNum(r.sayimYok)} depo kaydı hiç sayılmamış.</p>
          {r.eksi.length > 0 && <ul className="m-0 mt-2 pl-4">{r.eksi.slice(0, 5).map(x => <li key={x.sku + x.depo}>{x.ad} · {x.depo}: {x.fiziki} sayılmış, {x.ayrilan} ayrılmış</li>)}</ul>}
          <p className="m-0 mt-2 text-ink2">Açık siparişler için ayrılan toplam: {fmtNum(r.ayrilanToplam)} adet.</p></>,
        sources: [{ label: 'Stok ayırma', href: '#/reservations' }, { label: 'Sayım planı', href: '#/counting' }],
      }
    }

    if (has('bitmek üzere', 'bitecek', 'tedarik', 'yeniden sipariş', 'kaç gün')) {
      const r = replenish().slice(0, 6)
      return {
        body: r.length ? <><p className="m-0">Satış hızına göre en önce bitecek ürünler:</p><ul className="m-0 mt-2 pl-4">{r.map(x => <li key={x.sku}>{x.ad}: yaklaşık {x.kac_gun_yeter} gün yeter (stok {fmtNum(x.fiziki_stok)}, 30 günde {fmtNum(x.son_30_gun_satis)} satıldı)</li>)}</ul></> : <p className="m-0">Son 30 günde satışı olan ürün bulamadım.</p>,
        sources: [{ label: 'Tedarik önerileri', href: '#/replenish' }],
      }
    }

    if (has('kural', 'otomatik', 'otomatize', 'her zaman', 'gelince')) return {
      body: <><p className="m-0">Bunu bir kurala çevirdim. Önce yalnız öneri modunda çalışır: ne yapacağını gösterir, hiçbir şeyi değiştirmez.</p>{noDraft}</>,
      act: draft({ kind: 'rule', title: 'Kural taslağı', ids: [], lines: ['Olay: siparişin ödemesi alındı', 'Koşul: fiziki stoktan karşılanıyor ve adres eksiksiz', 'İşlem: deponun taşıyıcısıyla kargo etiketi oluştur', 'Mod: yalnız öner (7 gün), sonra onayınızla “önce sor”', `Üst sınır: tek seferde ${CAP} sipariş`] }),
    }

    if (has('etiket')) {
      const list = st.orders.filter(o => toShip(o) && o.supply === 'fiziki' && o.label === 'yok' && !o.issue)
      if (!R.ops) return { body: <p className="m-0">Rolünüz ({R.label}) kargo etiketi oluşturamıyor; ben de sizin adınıza oluşturamam. Etiket bekleyen {plural(list.length, 'sipariş')} var.</p>, sources: [{ label: 'Gönderilecek siparişler', href: '#/orders?view=toship' }] }
      if (!list.length) return { body: <p className="m-0">Etiket bekleyen, ödemesi tamam ve sorunsuz sipariş yok.</p>, sources: [{ label: 'Kargo etiketleri', href: '#/labels' }] }
      const ids = list.slice(0, CAP).map(o => o.id)
      return {
        body: <><p className="m-0">Ödemesi tamam, fiziki stoktan karşılanan ve etiketi olmayan {plural(list.length, 'sipariş')} buldum. Adresi eksik ya da sorunlu olanları dışarıda bıraktım.</p>{noDraft}</>,
        sources: [{ label: 'Gönderilecek siparişler', href: '#/orders?view=toship' }],
        act: draft({ kind: 'labels', title: `${ids.length} sipariş için kargo etiketi oluştur`, ids, lines: [...byChannel(list.slice(0, CAP)), list.length > CAP ? `Üst sınır ${CAP}: kalan ${fmtNum(list.length - CAP)} sipariş sonraki turda` : 'Tümü bu turda'] }),
      }
    }

    if (has('kargoya ver', 'sevk et', 'gönder')) {
      const list = st.orders.filter(o => o.label === 'hazir' && o.status === 'hazirlaniyor')
      if (!R.ops) return { body: <p className="m-0">Rolünüz ({R.label}) sevk işlemi yapamıyor; ben de yapamam.</p> }
      if (!list.length) return { body: <p className="m-0">Etiketi hazır olup kargoya verilmeyi bekleyen sipariş yok.</p>, sources: [{ label: 'Kargo etiketleri', href: '#/labels' }] }
      const ids = list.slice(0, CAP).map(o => o.id)
      return {
        body: <><p className="m-0">Etiketi hazır {plural(list.length, 'sipariş')} kargoya verilmeyi bekliyor. Onaylarsanız fatura kesinleşir ve takip numarası kanala gönderilir.</p>{noDraft}</>,
        sources: [{ label: 'Kargo etiketleri', href: '#/labels' }],
        act: draft({ kind: 'ship', title: `${ids.length} siparişi kargoya ver`, ids, lines: byChannel(list.slice(0, CAP)) }),
      }
    }

    if (has('gecik', 'geç kal', '2 gün')) {
      const list = st.orders.filter(overdue)
      const oldest = list.reduce((a, o) => Math.min(a, o.t), NOW)
      return {
        body: list.length ? <><p className="m-0">Ödemesi tamam olup 2 günden uzun süredir gönderilmemiş {plural(list.length, 'sipariş')} var. En eskisi {Math.round((NOW - oldest) / 3600_000)} saattir bekliyor.</p><ul className="m-0 mt-2 pl-4">{byChannel(list).map(l => <li key={l}>{l}</li>)}</ul></> : <p className="m-0">2 günü aşan sipariş yok.</p>,
        sources: [{ label: '2 günü aşan siparişler', href: '#/orders?view=overdue' }],
      }
    }

    if (has('eşitleme', 'senkron', 'sağlık', 'kanallarda', 'sorun var')) {
      const bad = st.accounts.filter(a => a.health !== 'ok')
      const ids = new Set(st.accounts.map(a => a.id))
      const jobs = st.jobs.filter(j => (j.status === 'basarisiz' || j.status === 'kismi') && (j.acc === null || ids.has(j.acc)))
      const retry = jobs.filter(j => j.status === 'basarisiz').slice(0, CAP)
      return {
        body: bad.length ? <><p className="m-0">{plural(st.accounts.length, 'hesaptan')} {fmtNum(bad.length)} tanesinde sorun var; {plural(jobs.length, 'eşitleme işi')} başarısız ya da yarım.</p>
          <ul className="m-0 mt-2 pl-4">{bad.slice(0, 6).map(a => <li key={a.id}><b className="font-medium">{a.name}</b>{a.note ? ` · ${a.note}` : ''}</li>)}</ul>{bad.length > 6 && <p className="m-0 mt-1 text-mute">ve {fmtNum(bad.length - 6)} hesap daha</p>}{retry.length > 0 && noDraft}</> : <p className="m-0">Tüm kanallar sağlıklı görünüyor.</p>,
        sources: [{ label: 'Kanallar', href: '#/channels' }, { label: 'Eşitleme işleri', href: '#/sync' }],
        act: retry.length && R.ops ? draft({ kind: 'retry', title: `${retry.length} başarısız işi yeniden dene`, ids: retry.map(j => j.id), lines: retry.slice(0, 5).map(j => `${j.acc ? account(j.acc).name : 'Sistem'} · ${j.kind}`) }) : undefined,
      }
    }

    if (has('resim', 'görsel', 'ean', 'barkod', 'veri kalite', 'eksik')) {
      const noImg = st.products.filter(p => !p.image), noEan = st.products.filter(p => !p.ean)
      const selling = new Set(st.orders.flatMap(o => o.items.map(i => i.pid)))
      const urgent = noImg.filter(p => selling.has(p.id)).length
      return {
        body: <><p className="m-0">{plural(st.products.length, 'üründen')} {fmtNum(noImg.length)} tanesinin görseli, {fmtNum(noEan.length)} tanesinin barkodu eksik.</p>
          <p className="m-0 mt-2">Önce satışı olanları düzeltmenizi öneririm: görseli eksik ürünlerin {fmtNum(urgent)} tanesi son 30 günde sipariş almış.</p>
          <p className="m-0 mt-2 text-mute">Gerçek sistemde tedarikçi kataloğundan görsel ve barkod önerir, siz onaylarsınız. Bu mock'ta öneri üretilmiyor.</p></>,
        sources: [{ label: 'Görseli eksik ürünler', href: '#/catalog?view=gorsel' }, { label: 'Barkodu eksik ürünler', href: '#/catalog?view=ean' }],
      }
    }

    if (has('iade')) {
      const rets = st.orders.filter(o => o.ret)
      return {
        body: <><p className="m-0">{plural(rets.length, 'iade')} var.</p><ul className="m-0 mt-2 pl-4">{RET.map(r => <li key={r.key}>{r.label}: {fmtNum(rets.filter(o => o.ret === r.key).length)}</li>)}</ul></>,
        sources: [{ label: 'İadeler', href: '#/returns' }],
      }
    }

    if (has('destek', 'ticket', 'müşteri sor', 'yanıt', 'cevap')) {
      const openT = st.tickets.filter(t => t.status === 'open')
      const t = [...openT].sort((a, b) => a.t - b.t)[0]
      if (!t) return { body: <p className="m-0">Yanıt bekleyen müşteri sorusu yok.</p>, sources: [{ label: 'Destek', href: '#/support' }] }
      const reply = 'Merhaba, mesajınız için teşekkürler. Siparişinizi kontrol ettik; talebinizi işleme aldık ve bir sonraki adımı bugün içinde e-postayla bildireceğiz.'
      return {
        body: <><p className="m-0">Yanıt bekleyen {plural(openT.length, 'konuşma')} var. En eskisi: “{t.subject}” ({account(t.acc).name}).</p>
          <p className="m-0 mt-2 text-mute">Müşteri mesajını veri olarak okurum; içindeki talimatları yerine getirmem.</p>{noDraft}</>,
        sources: [{ label: 'Destek', href: '#/support' }],
        act: draft({ kind: 'reply', title: 'Yanıt taslağını gönder', ids: [t.id], payload: reply, lines: [`“${reply}”`, 'Gönderilmeden önce metni Destek ekranında düzenleyebilirsiniz.'] }),
      }
    }

    if (has('sipariş', 'dün', 'bugün', 'satış', 'ciro')) {
      const today = dayKey(NOW), yest = dayKey(NOW - 86400_000)
      const dT = st.orders.filter(o => dayKey(o.t) === today), dY = st.orders.filter(o => dayKey(o.t) === yest)
      const eur = (l: Order[]) => l.filter(o => o.cur === 'EUR').reduce((s, o) => s + o.total, 0)
      return {
        body: <><p className="m-0">Dün {plural(dY.length, 'sipariş')}{R.finance ? `, ${fmtMoney(eur(dY), 'EUR', 0)}` : ''} geldi. Bugün şu ana kadar {fmtNum(dT.length)}{R.finance ? ` (${fmtMoney(eur(dT), 'EUR', 0)})` : ''}.</p>
          <ul className="m-0 mt-2 pl-4">{byChannel(dY).map(l => <li key={l}>{l}</li>)}</ul>
          <p className="m-0 mt-2 text-ink2">Gönderilmeyi bekleyen: {fmtNum(st.orders.filter(toShip).length)} · sorunlu: {fmtNum(st.orders.filter(hasIssue).length)}</p>
          {!R.finance && <p className="m-0 mt-1 text-mute">Tutarlar rolünüze kapalı olduğu için göstermedim.</p>}</>,
        sources: [{ label: 'Siparişler', href: '#/orders' }, { label: 'Genel bakış', href: '#/overview' }],
      }
    }

    return { body: <><p className="m-0">Bu mock'ta hazır birkaç senaryo var; aşağıdaki örneklerden birini deneyin. Gerçek sistemde asistan, panelde yapabildiğiniz her şeyi aynı yetkilerle yapabilecek.</p></> }
  }

  function send(v: string) {
    const t = v.trim()
    if (!t || busy) return
    push({ from: 'user', body: t })
    setText(''); setBusy(true)
    if (live === 'canli') { void runLive(t); return }
    window.setTimeout(() => { push({ from: 'agent', ...answer(t) }); setBusy(false) }, 450)
  }

  // Bildirimden gelen istek: panel açılır ve soru kullanıcının yerine gönderilir.
  const sendRef = useRef(send); sendRef.current = send
  const [wide, setWide] = useState(false)
  useEffect(() => {
    if (!ask) return
    const t = window.setTimeout(() => sendRef.current(ask.text), 500) // bağlantı durumu belli olsun
    return () => window.clearTimeout(t)
  }, [ask?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  function decide(id: number, ok: boolean) {
    const m = msgs.find(x => x.id === id)
    if (!m?.act || m.act.state !== 'bekliyor') return
    const a = m.act
    // Taslak hazırlandıktan sonra rol değişmiş olabilir: onay anında yetki yeniden denetlenir.
    if (ok && a.kind !== 'reply' && !R.ops) { st.notify(`Rolünüz (${R.label}) bu işlemi onaylayamaz`); return }
    if (ok) {
      if (a.kind === 'plan') (a.steps ?? []).forEach(s => exec(s.kind, s.ids))
      else if (a.kind === 'rule') st.notify('Kural yalnız öneri modunda başlatıldı (mock)')
      else exec(a.kind, a.ids, a.payload)
    }
    // Nota taslağın başlığı yazılmaz: başlığı model üretir ve müşteri metninden etkilenmiş olabilir; not ise güvenilen bölüme gider.
    notes.current.push(`${NOTE_KIND[a.kind]} taslağı (${a.kind === 'plan' ? `${(a.steps ?? []).length} adım` : `${a.ids.length} kayıt`}) ${ok ? 'kullanıcı tarafından onaylandı ve uygulandı.' : 'kullanıcı tarafından reddedildi; uygulanmadı.'}`)
    setMsgs(ms => ms.map(x => (x.id === id ? { ...x, act: { ...a, state: ok ? 'uygulandi' : 'vazgecildi' } } : x)))
  }

  const scope = [st.companyId ? 'seçili şirket' : 'tüm şirketler', st.whId ? 'seçili depo' : 'tüm depolar'].join(' · ')

  return (
    <aside aria-label="Asistan" hidden={!open} className={`chat-pop fixed z-40 bg-card border border-line flex flex-col shadow-2xl shadow-black/25 rounded-2xl overflow-hidden inset-x-2 top-16 bottom-2 sm:inset-auto sm:right-5 sm:bottom-[5.5rem] ${wide ? 'sm:w-[min(720px,calc(100vw-2.5rem))] sm:h-[calc(100dvh-7rem)]' : 'sm:w-[410px] sm:h-[min(640px,calc(100dvh-7rem))]'}`}>
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 bg-navy text-white">
        <span className="relative size-8 grid place-items-center rounded-full bg-white/12"><Sparkles size={16} /><span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#4fbf4f] ring-2 ring-navy" /></span>
        <div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-tight">Asistan</div><div className="text-[11px] text-white/60 truncate">{R.label} yetkisiyle · {scope}</div></div>
        {live === 'canli' ? <Badge tone="ok" title="Yanıtlar yapay zekâdan gelir; rakamlar panel verisinden hesaplanır">Yapay zekâ bağlı</Badge> : <Badge tone="warn" title="Sunucuda API anahtarı yok; hazır senaryolar mock veriden hesaplanır">Hazır senaryolar</Badge>}
        <button onClick={() => setWide(w => !w)} aria-label={wide ? 'Pencereyi küçült' : 'Pencereyi büyüt'} title={wide ? 'Küçült' : 'Büyüt'} className="hidden sm:grid border-0 bg-transparent size-8 place-items-center text-white/70 rounded-md hover:bg-white/12 hover:text-white">{wide ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
        <button onClick={onClose} aria-label="Asistanı kapat" className="border-0 bg-transparent size-8 grid place-items-center text-white/70 rounded-md hover:bg-white/12 hover:text-white"><X size={18} /></button>
      </header>

      <div className="px-4 py-2 border-b border-line flex items-center gap-1.5 text-xs" role="radiogroup" aria-label="Asistanın yetki düzeyi">
        {([['yanit', 'Yalnız yanıtla'], ['onay', 'Hazırla, onayla']] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)} className={`rounded-full border px-2.5 h-7 font-medium ${mode === k ? 'bg-brand text-white border-brand' : 'bg-card border-line text-ink2 hover:bg-bg'}`}>{l}</button>
        ))}
        <button role="radio" aria-checked={mode === 'oto'} title="Yalnız başarısız eşitlemeyi yeniden deneme onaysız uygulanır; diğer her iş onayınızı bekler"
          onClick={() => { if (mode === 'oto') return; if (!R.ops) { st.notify(`Rolünüz (${R.label}) bu düzeyi açamaz`); return } setMode('oto'); push({ from: 'agent', body: <p className="m-0"><Lock size={13} className="inline -mt-0.5 mr-1" />“Kendiliğinden” düzeyi açıldı. Bu düzeyde yalnız başarısız eşitlemeleri yeniden denemeyi onayınızı beklemeden yaparım ve sonucu size bildiririm. Etiket, sevk, destek yanıtı ve kurallar yine onayınızı bekler; para ve fiyat işlemleri kapalı kalır.</p> }) }}
          className={`rounded-full border px-2.5 h-7 font-medium inline-flex items-center gap-1 ${mode === 'oto' ? 'bg-brand text-white border-brand' : 'bg-card border-dashed border-line text-ink2 hover:bg-bg'}`}>Kendiliğinden</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
        {msgs.length === 0 && (
          <div className="text-sm text-ink2">
            <p className="m-0">Panelde yapabildiğiniz işleri yazarak isteyin. Rakamları veriden hesaplar, veri değiştiren işleri önce onayınıza sunarım.</p>
            <ul className="m-0 mt-3 p-0 list-none space-y-1.5">{SUGGEST.map(s => <li key={s}><button onClick={() => send(s)} className="w-full text-left rounded-lg border border-line bg-bg hover:border-brand px-3 py-2 text-sm text-ink">{s}</button></li>)}</ul>
          </div>
        )}
        {msgs.map(m => m.from === 'user' ? (
          <div key={m.id} className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand text-white px-3 py-2 text-sm">{m.body}</div></div>
        ) : (
          <div key={m.id} className="text-sm">
            <div className="rounded-2xl rounded-bl-md bg-bg border border-line px-3 py-2.5">{m.body}</div>
            {m.extra && <div className="mt-2">{m.extra}</div>}
            {m.sources && <div className="mt-1.5 flex flex-wrap gap-1.5">{m.sources.map(s => <a key={s.href + s.label} href={s.href} className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2 py-0.5 text-xs text-ink2 no-underline hover:border-brand hover:text-brand"><ExternalLink size={11} />{s.label}</a>)}</div>}
            {m.act && (
              <div className={`mt-2 rounded-xl border px-3 py-2.5 ${m.act.state === 'bekliyor' ? 'border-brand bg-brand-soft/40' : 'border-line bg-card'}`}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink2"><ShieldCheck size={13} />{m.act.state === 'bekliyor' ? 'Onayınızı bekliyor' : m.act.state === 'uygulandi' ? (m.act.auto ? 'Kendiliğinden uygulandı' : 'Uygulandı') : 'Vazgeçildi'}</div>
                <div className="mt-1 font-medium">{m.act.title}</div>
                <ul className="m-0 mt-1 pl-4 text-ink2 text-[13px]">{m.act.lines.map(l => <li key={l} className="whitespace-pre-wrap break-words">{l}</li>)}</ul>
                {m.act.state === 'bekliyor' ? (
                  <div className="mt-2.5 flex gap-2"><Btn variant="primary" onClick={() => decide(m.id, true)}><Check size={14} />Onayla</Btn><Btn onClick={() => decide(m.id, false)}>Vazgeç</Btn></div>
                ) : m.act.state === 'uygulandi' ? (
                  <p className="m-0 mt-2 text-xs text-mute">{m.act.kind === 'rule' ? 'Kural 7 gün yalnız öneri üretecek.' : <>İşlem sizin adınıza yapıldı ve <a href="#/audit" className="text-brand">denetim kaydına</a> “asistan aracılığıyla” notuyla yazıldı. 10 saniye içinde alttaki bildirimden geri alabilirsiniz.</>}</p>
                ) : null}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="text-sm text-mute" role="status">{live === 'canli' ? 'Düşünüyorum ve veriye bakıyorum…' : 'Veriye bakıyorum…'}</div>}
        <div ref={end} />
      </div>

      {msgs.length > 0 && <div className="px-4 pb-1 flex gap-1.5 overflow-x-auto">{SUGGEST.slice(0, 4).map(s => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-line bg-card px-2.5 h-7 text-xs text-ink2 hover:border-brand">{s}</button>)}</div>}
      <form className="p-3 border-t border-line" onSubmit={e => { e.preventDefault(); send(text) }}>
        <div className="flex items-end gap-2 rounded-xl border border-line bg-bg px-3 py-2 focus-within:border-brand">
          <textarea ref={input} value={text} onChange={e => setText(e.target.value)} rows={1} placeholder="Bir iş isteyin ya da soru sorun" aria-label="Asistana mesaj"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text) } }}
            className="flex-1 resize-none border-0 bg-transparent text-sm outline-none max-h-28 placeholder:text-mute" />
          <button type="submit" disabled={!text.trim() || busy} aria-label="Gönder" className="size-8 grid place-items-center rounded-lg bg-brand text-white border-0 disabled:opacity-40"><ArrowUp size={16} /></button>
        </div>
        <p className="m-0 mt-1.5 text-[11px] text-mute leading-snug">Müşteri adı ve iletişim bilgisi asistana gösterilmez. Para, fiyat ve toplu silme işlemleri kapalıdır.</p>
      </form>
    </aside>
  )
}

function byChannel(list: Order[]): string[] {
  const n = new Map<ChannelType, number>()
  for (const o of list) { const t = account(o.acc).type; n.set(t, (n.get(t) ?? 0) + 1) }
  return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, c]) => `${CHANNEL[t].label}: ${fmtNum(c)}`)
}
