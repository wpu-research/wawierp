import { useEffect, useRef, useState, type ReactNode } from 'react'
import type Anthropic from '@anthropic-ai/sdk'
import { ArrowUp, Check, ExternalLink, Lock, ShieldCheck, Sparkles, X } from 'lucide-react'
import { CHANNEL, NOW, RET, account, dayKey, dropWaiting, fmtMoney, fmtNum, hasIssue, overdue, toShip, type ChannelType, type Order } from './data'
import { ROLES, useStore } from './store'
import { Badge, Btn } from './ui'

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
type ActKind = 'labels' | 'ship' | 'retry' | 'reply' | 'rule'
interface Act { kind: ActKind; title: string; lines: string[]; ids: string[]; payload?: string; state: 'bekliyor' | 'uygulandi' | 'vazgecildi' }
interface Msg { id: number; from: 'user' | 'agent'; body: ReactNode; sources?: Src[]; act?: Act }
type Mode = 'yanit' | 'onay'
type ApiMsg = Anthropic.Beta.BetaMessageParam
type Block = Anthropic.Beta.BetaContentBlock
type ToolOut = { data: unknown; error?: boolean; act?: Act; src?: Src[] }
const SCREEN: Record<string, string> = { overview: 'Genel bakış', orders: 'Siparişler', labels: 'Kargo etiketleri', returns: 'İadeler', support: 'Destek', catalog: 'Katalog', stock: 'Stok defteri', transfers: 'Depo transferi', channels: 'Kanallar', sync: 'Eşitleme işleri', finance: 'Faturalar ve KDV', b2b: 'Cari ve B2B portal', team: 'Ekip ve yetki', audit: 'Denetim kaydı', picking: 'Toplama listesi', quality: 'Veri kalitesi', content: 'Ürün metni ve çeviri', counting: 'Sayım planı', replenish: 'Tedarik önerileri', listing: 'Toplu listeleme', prices: 'Fiyat ve kârlılık', rules: 'Otomasyon kuralları', alerts: 'Uyarılar ve özet', shifts: 'Vardiya önerisi', bank: 'Banka mutabakatı', accounting: 'Muhasebe aktarımı', profit: 'Kârlılık', onboarding: 'Kurulum sihirbazı', developers: 'API ve bildirim uçları', billing: 'Kullanım ve abonelik', status: 'Durum sayfası' }
// Mutlak adres: sayfa adresinde kullanıcı bilgisi olsa bile istek kurulabilsin; tarayıcı panel şifresini kendisi ekler.
const API = location.origin + '/api/assistant'
const CAP = 25 // tek seferde en fazla bu kadar kayda işlem önerilir

const SUGGEST = ['Dün hangi kanaldan kaç sipariş geldi?', 'Geciken siparişler hangileri?', 'Ödenmiş siparişlerin etiketlerini hazırla', 'Kanallarda sorun var mı?', 'Veri kalitesi ne durumda?', 'Bekleyen müşteri sorusuna yanıt taslağı yaz', 'Ödeme gelince etiketi otomatik oluştur']

const norm = (s: string) => s.toLocaleLowerCase('tr-TR')
const plural = (n: number, w: string) => `${fmtNum(n)} ${w}`

export default function Agent({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  const push = (m: Omit<Msg, 'id'>) => setMsgs(a => [...a, { ...m, id: seq.current++ }])

  // ---- gerçek yapay zekâ bağlantısı ----
  const [live, setLive] = useState<'bilinmiyor' | 'canli' | 'mock'>('bilinmiyor')
  const api = useRef<ApiMsg[]>([])   // modele giden konuşma (araç çağrıları ve sonuçlarıyla)
  const notes = useRef<string[]>([]) // onay / vazgeçme bilgisi bir sonraki mesajla modele iletilir
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
    const labelable = (o: Order) => toShip(o) && o.supply === 'fiziki' && o.label === 'yok' && !o.issue
    const shippable = (o: Order) => o.label === 'hazir' && o.status === 'hazirlaniyor'
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
        const made = (a: Omit<Act, 'state'>, extra: object = {}): ToolOut => ({ act: { ...a, state: 'bekliyor' }, data: { durum: 'Taslak hazır, kullanıcının onayını bekliyor. İşlem henüz yapılmadı.', kabul_edilen: a.ids.length || undefined, ...extra } })
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
    const note = notes.current.length ? `[Panel notu: ${notes.current.join(' ')}]\n` : ''
    notes.current = []
    api.current.push({ role: 'user', content: note + t })
    const sources = new Map<string, Src>()
    try {
      for (let turn = 0; turn < 8; turn++) {
        const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: api.current, context: { role: R.label, ops: R.ops, finance: R.finance, scope: scopeText, mode } }) })
        const res = (await r.json().catch(() => ({}))) as { content?: Block[]; stop_reason?: string | null; message?: string }
        if (!r.ok || !res.content) throw new Error(res.message || `Sunucu yanıt vermedi (${r.status})`)
        api.current.push({ role: 'assistant', content: res.content } as ApiMsg)
        const said = res.content.flatMap(b => (b.type === 'text' ? [b.text] : [])).join('\n').trim()
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = []
        const acts: Act[] = []
        for (const b of res.content) {
          if (b.type !== 'tool_use') continue
          const out = runTool(b.name, (b.input ?? {}) as Record<string, unknown>)
          if (out.act) acts.push(out.act)
          for (const s of out.src ?? []) sources.set(s.href, s)
          results.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(out.data), ...(out.error ? { is_error: true } : {}) })
        }
        const done = res.stop_reason !== 'tool_use' || !results.length
        const text = said || (acts.length ? 'Taslağı hazırladım; onayınızı bekliyor.' : '')
        if (res.stop_reason === 'refusal') push({ from: 'agent', body: <p className="m-0">Bu isteği yanıtlayamıyorum.</p> })
        else if (acts.length) acts.forEach((act, i) => push({ from: 'agent', body: <div className="whitespace-pre-wrap">{i === 0 ? text : 'Bir taslak daha:'}</div>, act, sources: done && i === acts.length - 1 && sources.size ? [...sources.values()] : undefined }))
        else if (done && text) push({ from: 'agent', body: <div className="whitespace-pre-wrap">{text}</div>, sources: sources.size ? [...sources.values()].slice(0, 4) : undefined })
        if (done) return
        api.current.push({ role: 'user', content: results })
      }
      push({ from: 'agent', body: <p className="m-0">Bu iş beklediğimden uzun sürdü; isteği daha küçük parçalara bölebilir misiniz?</p> })
    } catch (e) {
      api.current.length = mark // yarım kalan turu geri al ki sonraki istek geçerli kalsın
      push({ from: 'agent', body: <p className="m-0 text-bad">{e instanceof Error ? e.message : 'Asistana ulaşılamadı.'}</p> })
    } finally { setBusy(false) }
  }

  // ---- yanıt üretimi: yalnız o anki kapsamdaki (şirket, depo, rol) veriyi okur ----
  function answer(qRaw: string): Omit<Msg, 'id' | 'from'> {
    const q = norm(qRaw)
    const has = (...k: string[]) => k.some(x => q.includes(x))
    const draft = (a: Omit<Act, 'state'>): Act | undefined => (mode === 'onay' ? { ...a, state: 'bekliyor' } : undefined)
    const noDraft = mode === 'yanit' ? <p className="m-0 mt-2 text-mute">İşlem önerisi kapalı: “Yalnız yanıtla” modundasınız.</p> : null

    // korumalı işlemler: para, fiyat, toplu silme
    if (has('iade et', 'para iade', 'geri öde', 'fiyat', 'kaldır', 'iptal et') || /(^|\s)sil/.test(q)) return {
      body: <><p className="m-0"><Lock size={13} className="inline -mt-0.5 mr-1" />Bu işlemi yapamam. Ödeme iadesi, fiyat değişikliği, iptal ve toplu kaldırma bu basamakta asistana kapalı.</p>
        <p className="m-0 mt-2 text-ink2">İlgili ekranı açabilirim; işlemi siz yaparsınız ve denetim kaydına sizin adınıza yazılır.</p></>,
      sources: [{ label: 'İadeler', href: '#/returns' }, { label: 'Katalog', href: '#/catalog' }],
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

  function decide(id: number, ok: boolean) {
    const m = msgs.find(x => x.id === id)
    if (!m?.act || m.act.state !== 'bekliyor') return
    const a = m.act
    // Taslak hazırlandıktan sonra rol değişmiş olabilir: onay anında yetki yeniden denetlenir.
    if (ok && a.kind !== 'reply' && !R.ops) { st.notify(`Rolünüz (${R.label}) bu işlemi onaylayamaz`); return }
    if (ok) {
      if (a.kind === 'labels') st.createLabels(a.ids)
      else if (a.kind === 'ship') st.ship(a.ids)
      else if (a.kind === 'retry') a.ids.forEach(st.retryJob)
      else if (a.kind === 'reply') st.replyTicket(a.ids[0], a.payload!)
      else st.notify('Kural yalnız öneri modunda başlatıldı (mock)')
    }
    notes.current.push(`“${a.title}” taslağı ${ok ? 'kullanıcı tarafından onaylandı ve uygulandı.' : 'kullanıcı tarafından reddedildi; uygulanmadı.'}`)
    setMsgs(ms => ms.map(x => (x.id === id ? { ...x, act: { ...a, state: ok ? 'uygulandi' : 'vazgecildi' } } : x)))
  }

  const scope = [st.companyId ? 'seçili şirket' : 'tüm şirketler', st.whId ? 'seçili depo' : 'tüm depolar'].join(' · ')

  return (
    <aside aria-label="Asistan" hidden={!open} className="fixed inset-y-0 right-0 z-40 w-[400px] max-w-full bg-card border-l border-line flex flex-col shadow-xl xl:shadow-none">
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-line">
        <span className="size-7 grid place-items-center rounded-lg bg-brand-soft text-brand"><Sparkles size={16} /></span>
        <div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-tight">Asistan</div><div className="text-[11px] text-mute truncate">{R.label} yetkisiyle · {scope}</div></div>
        {live === 'canli' ? <Badge tone="ok" title="Yanıtlar yapay zekâdan gelir; rakamlar panel verisinden hesaplanır">Yapay zekâ bağlı</Badge> : <Badge tone="warn" title="Sunucuda API anahtarı yok; hazır senaryolar mock veriden hesaplanır">Hazır senaryolar</Badge>}
        <button onClick={onClose} aria-label="Asistanı kapat" className="border-0 bg-transparent p-1.5 text-ink2 rounded-md hover:bg-bg"><X size={18} /></button>
      </header>

      <div className="px-4 py-2 border-b border-line flex items-center gap-1.5 text-xs" role="radiogroup" aria-label="Asistanın yetki düzeyi">
        {([['yanit', 'Yalnız yanıtla'], ['onay', 'Hazırla, onayla']] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)} className={`rounded-full border px-2.5 h-7 font-medium ${mode === k ? 'bg-brand text-white border-brand' : 'bg-card border-line text-ink2 hover:bg-bg'}`}>{l}</button>
        ))}
        <button role="radio" aria-checked={false} disabled title="Pilotta hata oranı ölçüldükten sonra açılır" className="rounded-full border border-dashed border-line px-2.5 h-7 text-mute bg-transparent inline-flex items-center gap-1"><Lock size={11} />Kendiliğinden</button>
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
            {m.sources && <div className="mt-1.5 flex flex-wrap gap-1.5">{m.sources.map(s => <a key={s.href + s.label} href={s.href} className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2 py-0.5 text-xs text-ink2 no-underline hover:border-brand hover:text-brand"><ExternalLink size={11} />{s.label}</a>)}</div>}
            {m.act && (
              <div className={`mt-2 rounded-xl border px-3 py-2.5 ${m.act.state === 'bekliyor' ? 'border-brand bg-brand-soft/40' : 'border-line bg-card'}`}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink2"><ShieldCheck size={13} />{m.act.state === 'bekliyor' ? 'Onayınızı bekliyor' : m.act.state === 'uygulandi' ? 'Uygulandı' : 'Vazgeçildi'}</div>
                <div className="mt-1 font-medium">{m.act.title}</div>
                <ul className="m-0 mt-1 pl-4 text-ink2 text-[13px]">{m.act.lines.map(l => <li key={l}>{l}</li>)}</ul>
                {m.act.state === 'bekliyor' ? (
                  <div className="mt-2.5 flex gap-2"><Btn variant="primary" onClick={() => decide(m.id, true)}><Check size={14} />Onayla</Btn><Btn onClick={() => decide(m.id, false)}>Vazgeç</Btn></div>
                ) : m.act.state === 'uygulandi' ? (
                  <p className="m-0 mt-2 text-xs text-mute">{m.act.kind === 'rule' ? 'Kural 7 gün yalnız öneri üretecek.' : <>İşlem sizin adınıza yapıldı ve <a href="#/audit" className="text-brand">denetim kaydına</a> yazıldı.</>}</p>
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
