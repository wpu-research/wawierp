/* Ekip mesajlaşması ve geliştirme panosu.
   Ortak kanallar + birebir konuşmalar; ortak kanallardaki konuşmalar sistemi geliştirmek için okunur.
   Birebir mesajlar hiçbir zaman taranmaz. Durum bu tarayıcıda saklanır (mock). */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Bug, Check, ChevronUp, Hash, Lightbulb, Lock, MessageSquarePlus, Send, Sparkles, ThumbsUp, Users } from 'lucide-react'
import { NOW, ago } from './data'
import { ROLES, useStore } from './store'
import { Badge, Btn, Card, PageHead } from './ui'

export interface Msg { id: string; ch: string; from: string; text: string; t: number; flag?: 'oneri' | 'sorun'; likes?: string[]; link?: { label: string; href: string } }
export type IdeaStatus = 'yeni' | 'inceleniyor' | 'planlandi' | 'yapildi'
export interface Idea { id: string; title: string; kind: 'oneri' | 'sorun'; from: string; ch: string; votes: string[]; status: IdeaStatus; t: number; src?: string }
interface Saved { msgs: Msg[]; ideas: Idea[]; read: Record<string, number> }

const BOT = 'Asistan'
export const PEOPLE = ['Sistem Yöneticisi', 'Depo Çalışanı 1', 'Depo Çalışanı 2', 'Muhasebe', 'Pazaryeri Sorumlusu', 'Destek Sorumlusu']
const ONLINE = new Set(['Sistem Yöneticisi', 'Depo Çalışanı 1', 'Pazaryeri Sorumlusu', 'Muhasebe'])
export const CHANNELS: { id: string; name: string; desc: string }[] = [
  { id: 'genel', name: 'genel', desc: 'Herkesin gördüğü ortak alan' },
  { id: 'depo', name: 'depo-istanbul', desc: 'Toplama, paketleme, sayım' },
  { id: 'kanallar', name: 'pazaryeri', desc: 'İlanlar, eşitleme, kanal sorunları' },
  { id: 'muhasebe', name: 'muhasebe', desc: 'Fatura, tahsilat, mutabakat' },
  { id: 'fikir', name: 'fikir-ve-sorun', desc: 'Panel için öneriler ve takılan yerler' },
]
const M = 60_000, H = 60 * M
const SEED: Msg[] = [
  { id: 's1', ch: 'genel', from: 'Sistem Yöneticisi', t: NOW - 26 * H, text: 'Yeni panelin taslağı açıldı. Takıldığınız her şeyi #fikir-ve-sorun kanalına yazın; oradan geliştirme panosuna düşüyor.' },
  { id: 's2', ch: 'genel', from: 'Pazaryeri Sorumlusu', t: NOW - 5 * H, text: 'Bugün Kaufland kampanyası başladı, sipariş sayısı öğleden sonra artabilir.' },
  { id: 's3', ch: 'genel', from: 'Depo Çalışanı 1', t: NOW - 95 * M, text: 'Kargo aracı 17:30’da gelecek. Etiketi çıkmayan siparişler yarına kalır.' },
  { id: 's4', ch: 'depo', from: 'Depo Çalışanı 1', t: NOW - 7 * H, text: 'Etiket yazdırırken adresi eksik siparişler tek tek hata veriyor. Hepsini bir listede görsek düzeltmesi kolay olur.', flag: 'sorun', likes: ['Depo Çalışanı 2', 'Destek Sorumlusu'], link: { label: 'Kargo etiketleri', href: '#/labels' } },
  { id: 's5', ch: 'depo', from: 'Depo Çalışanı 2', t: NOW - 6 * H, text: 'Aynı ürün iki rafta duruyor, toplama listesi beni depoda iki kez dolaştırıyor.' },
  { id: 's6', ch: 'depo', from: 'Depo Çalışanı 2', t: NOW - 3 * H, text: 'Barkodu olmayan ürünleri el terminaliyle okutamıyoruz, elle yazmak çok vakit alıyor.', likes: ['Depo Çalışanı 1'] },
  { id: 's7', ch: 'depo', from: 'Depo Çalışanı 1', t: NOW - 40 * M, text: 'Bugün yine 5 etiket hata verdi. Adres düzeltilince etiket kendiliğinden yeniden denense iyi olur.', link: { label: 'Kargo etiketleri', href: '#/labels' } },
  { id: 's8', ch: 'kanallar', from: 'Pazaryeri Sorumlusu', t: NOW - 9 * H, text: 'OTTO eşitlemesi sabahtan beri sipariş çekmiyor. Başarısız olunca bana bildirim gelse erken fark ederdim.', flag: 'sorun', likes: ['Sistem Yöneticisi'], link: { label: 'Eşitleme işleri', href: '#/sync' } },
  { id: 's9', ch: 'kanallar', from: 'Pazaryeri Sorumlusu', t: NOW - 4 * H, text: 'Barkodu eksik ürünler yüzünden N11 ilanları reddediliyor. Eksik barkodları toplu girebileceğimiz bir ekran lazım.', link: { label: 'Veri kalitesi', href: '#/quality' } },
  { id: 's10', ch: 'kanallar', from: 'Destek Sorumlusu', t: NOW - 2 * H, text: 'Müşteriler iade için hâlâ e-posta atıyor. İade formunun bağlantısını sipariş e-postasına koyabilir miyiz?', flag: 'oneri' },
  { id: 's11', ch: 'muhasebe', from: 'Muhasebe', t: NOW - 8 * H, text: 'Havale ile ödenen siparişleri tek tek eşleştiriyorum. Tutar ve sipariş numarası tutuyorsa kendiliğinden eşleşmeli.', flag: 'oneri', likes: ['Sistem Yöneticisi'], link: { label: 'Banka mutabakatı', href: '#/bank' } },
  { id: 's12', ch: 'muhasebe', from: 'Muhasebe', t: NOW - 70 * M, text: 'İade faturaları ay sonunda ayrı listelenirse KDV beyanı çok hızlanır.' },
  { id: 's13', ch: 'fikir', from: 'Destek Sorumlusu', t: NOW - 20 * H, text: 'Sipariş ekranı çok kayıt olunca yavaş açılıyor. Son 7 günü varsayılan yapsak?', flag: 'oneri', likes: ['Depo Çalışanı 1', 'Muhasebe', 'Pazaryeri Sorumlusu'] },
  { id: 's14', ch: 'fikir', from: 'Depo Çalışanı 2', t: NOW - 50 * M, text: 'Stok sayımında eksi çıkan ürünler için kırmızı bir uyarı görmek istiyorum, gözden kaçıyor.' },
  { id: 's15', ch: 'dm:Depo Çalışanı 1|Sistem Yöneticisi', from: 'Depo Çalışanı 1', t: NOW - 30 * M, text: 'Yarın sayım için iki kişi daha gerekebilir, vardiyaya bakabilir misiniz?' },
  { id: 's16', ch: 'dm:Muhasebe|Sistem Yöneticisi', from: 'Muhasebe', t: NOW - 4 * H, text: 'Kasım faturalarını cuma günü kapatıyorum.' },
]
const IDEAS0: Idea[] = [
  { id: 'i1', title: 'Sipariş ekranında son 7 gün varsayılan olsun', kind: 'oneri', from: 'Destek Sorumlusu', ch: 'fikir', votes: ['Depo Çalışanı 1', 'Muhasebe', 'Pazaryeri Sorumlusu'], status: 'planlandi', t: NOW - 20 * H, src: 's13' },
  { id: 'i2', title: 'Adresi eksik siparişler tek listede düzeltilsin', kind: 'sorun', from: 'Depo Çalışanı 1', ch: 'depo', votes: ['Depo Çalışanı 2', 'Destek Sorumlusu'], status: 'inceleniyor', t: NOW - 7 * H, src: 's4' },
  { id: 'i3', title: 'Eşitleme başarısız olunca sorumlusuna bildirim gitsin', kind: 'sorun', from: 'Pazaryeri Sorumlusu', ch: 'kanallar', votes: ['Sistem Yöneticisi'], status: 'yapildi', t: NOW - 9 * H, src: 's8' },
  { id: 'i4', title: 'Havale tutarı ve sipariş numarası tutuyorsa kendiliğinden eşleşsin', kind: 'oneri', from: 'Muhasebe', ch: 'muhasebe', votes: ['Sistem Yöneticisi'], status: 'yeni', t: NOW - 8 * H, src: 's11' },
  { id: 'i5', title: 'İade formu bağlantısı sipariş e-postasına eklensin', kind: 'oneri', from: 'Destek Sorumlusu', ch: 'kanallar', votes: [], status: 'yeni', t: NOW - 2 * H, src: 's10' },
]
/* Konuşmalarda geçen konular: aynı sorunu kaç kişi, kaç kez yazmış. */
const TOPICS: { key: string; label: string; words: string[]; fix: string; href: string; screen: string }[] = [
  { key: 'etiket', label: 'Kargo etiketi hataları', words: ['etiket'], fix: 'Adres düzeltilince etiketi yeniden deneyen kural', href: '#/rules', screen: 'Kurallar' },
  { key: 'barkod', label: 'Eksik barkod', words: ['barkod', 'ean'], fix: 'Veri kalitesi kuyruğunda barkodu toplu tamamlama', href: '#/quality', screen: 'Veri kalitesi' },
  { key: 'esitleme', label: 'Eşitleme ve kanal bağlantısı', words: ['eşitleme', 'çekmiyor', 'reddediliyor'], fix: 'Başarısız eşitlemede sorumluya bildirim', href: '#/alerts', screen: 'Uyarılar ve özet' },
  { key: 'iade', label: 'İade süreci', words: ['iade'], fix: 'Müşteri iade formunu e-postalara ekleme', href: '#/return-form', screen: 'Müşteri iade formu' },
  { key: 'stok', label: 'Stok ve sayım', words: ['stok', 'sayım', 'raf'], fix: 'Eksi stokta sayım görevi açan kural', href: '#/counting', screen: 'Sayım planı' },
  { key: 'odeme', label: 'Ödeme eşleştirme', words: ['havale', 'eşleş', 'fatura'], fix: 'Tutar ve sipariş numarasıyla kendiliğinden eşleştirme', href: '#/bank', screen: 'Banka mutabakatı' },
  { key: 'hiz', label: 'Yavaş açılan ekranlar', words: ['yavaş', 'donuyor', 'geç açılıyor'], fix: 'Varsayılan tarih aralığını daraltma', href: '#/orders', screen: 'Siparişler' },
]
const STATUS: Record<IdeaStatus, { label: string; tone: 'neutral' | 'info' | 'violet' | 'ok' }> = {
  yeni: { label: 'Yeni', tone: 'neutral' }, inceleniyor: { label: 'İnceleniyor', tone: 'info' }, planlandi: { label: 'Planlandı', tone: 'violet' }, yapildi: { label: 'Yapıldı', tone: 'ok' },
}
const ORDER: IdeaStatus[] = ['yeni', 'inceleniyor', 'planlandi', 'yapildi']

const KEY = 'wawi-mock-chat'
const load = (): Saved => {
  try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && Array.isArray(v.msgs) && Array.isArray(v.ideas)) return { msgs: v.msgs, ideas: v.ideas, read: v.read ?? {} } } catch { /* bozuk kayıt: baştan başla */ }
  return { msgs: SEED, ideas: IDEAS0, read: {} }
}
export const dmId = (a: string, b: string) => 'dm:' + [a, b].sort().join('|')
const lower = (s: string) => s.toLocaleLowerCase('tr-TR')
export const askAssistant = (text: string) => dispatchEvent(new CustomEvent('wawi-ask', { detail: text }))

interface ChatApi {
  me: string; msgs: Msg[]; ideas: Idea[]
  mine: (ch: string) => boolean; unread: (ch: string) => number; totalUnread: number
  send: (ch: string, text: string) => void; like: (id: string) => void; flag: (id: string, kind: 'oneri' | 'sorun') => void; markRead: (ch: string) => void
  addIdea: (title: string, kind: 'oneri' | 'sorun', ch: string, src?: string) => void; vote: (id: string) => void; setStatus: (id: string, s: IdeaStatus) => void
}
const Ctx = createContext<ChatApi | null>(null)
export const useChat = () => { const c = useContext(Ctx); if (!c) throw new Error('ChatProvider eksik'); return c }

export function ChatProvider({ children }: { children: ReactNode }) {
  const st = useStore()
  const me = ROLES[st.role].user
  const [s, setS] = useState<Saved>(load)
  const seq = useRef(1)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* saklanamazsa oturum boyunca çalışır */ } }, [s])
  const stamp = () => NOW + seq.current++ * 1000 + (Date.now() % 1000)
  const mine = useCallback((ch: string) => !ch.startsWith('dm:') || ch.slice(3).split('|').includes(me), [me])
  const unreadOf = useCallback((ch: string) => { const at = s.read[me + '|' + ch] ?? NOW - 3 * H; return s.msgs.filter(m => m.ch === ch && m.from !== me && m.t > at).length }, [s, me])
  const totalUnread = useMemo(() => [...new Set(s.msgs.map(m => m.ch))].filter(mine).reduce((n, ch) => n + unreadOf(ch), 0), [s.msgs, mine, unreadOf])

  const api: ChatApi = {
    me, msgs: s.msgs, ideas: s.ideas, mine, unread: unreadOf, totalUnread,
    markRead: ch => setS(v => { const k = me + '|' + ch, last = Math.max(NOW, ...v.msgs.filter(m => m.ch === ch).map(m => m.t)); return v.read[k] === last ? v : { ...v, read: { ...v.read, [k]: last } } }),
    send: (ch, text) => {
      const m: Msg = { id: 'm' + Date.now(), ch, from: me, text, t: stamp() }
      setS(v => ({ ...v, msgs: [...v.msgs, m], read: { ...v.read, [me + '|' + ch]: m.t } }))
      const t = lower(text)
      if (t.includes('@asistan')) {
        const q = text.replace(/@asistan/gi, '').trim()
        window.setTimeout(() => { setS(v => ({ ...v, msgs: [...v.msgs, { id: 'b' + Date.now(), ch, from: BOT, text: q ? 'Sorunuzu asistan penceresinde yanıtlıyorum; sonucu buraya siz paylaşabilirsiniz.' : 'Bana bir soru ya da iş yazın, örneğin: @asistan bugün kaç etiket hata verdi?', t: stamp() }] })); if (q) askAssistant(q) }, 500)
      } else if (ch.startsWith('dm:')) {
        const other = ch.slice(3).split('|').find(p => p !== me)
        if (other) window.setTimeout(() => setS(v => ({ ...v, msgs: [...v.msgs, { id: 'r' + Date.now(), ch, from: other, text: reply(t), t: stamp() }] })), 1400)
      }
    },
    like: id => setS(v => ({ ...v, msgs: v.msgs.map(m => (m.id !== id ? m : { ...m, likes: (m.likes ?? []).includes(me) ? (m.likes ?? []).filter(x => x !== me) : [...(m.likes ?? []), me] })) })),
    flag: (id, kind) => setS(v => {
      const m = v.msgs.find(x => x.id === id); if (!m || v.ideas.some(i => i.src === id)) return v
      const title = m.text.length > 90 ? m.text.slice(0, 88).trimEnd() + '…' : m.text
      return { ...v, msgs: v.msgs.map(x => (x.id === id ? { ...x, flag: kind } : x)), ideas: [{ id: 'i' + Date.now(), title, kind, from: m.from, ch: m.ch, votes: [me], status: 'yeni', t: stamp(), src: id }, ...v.ideas] }
    }),
    addIdea: (title, kind, ch, src) => setS(v => ({ ...v, ideas: [{ id: 'i' + Date.now(), title, kind, from: me, ch, votes: [me], status: 'yeni', t: stamp(), src }, ...v.ideas] })),
    vote: id => setS(v => ({ ...v, ideas: v.ideas.map(i => (i.id !== id ? i : { ...i, votes: i.votes.includes(me) ? i.votes.filter(x => x !== me) : [...i.votes, me] })) })),
    // Durum değişince kanala haber düşer: öneriyi yazan, sonucunu konuştuğu yerde görür.
    setStatus: (id, status) => setS(v => {
      const i = v.ideas.find(x => x.id === id); if (!i || i.status === status) return v
      const note: Msg = { id: 'n' + Date.now(), ch: 'fikir', from: BOT, t: stamp(), text: `“${i.title}” ${status === 'yapildi' ? 'yapıldı olarak işaretlendi' : `durumu “${STATUS[status].label}” oldu`}. Öneren: ${i.from}.`, link: { label: 'Geliştirme panosu', href: '#/feedback' } }
      return { ...v, ideas: v.ideas.map(x => (x.id === id ? { ...x, status } : x)), msgs: [...v.msgs, note] }
    }),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
const reply = (t: string) => t.includes('?') ? 'Bakıp birazdan dönüyorum.' : t.includes('teşekkür') ? 'Rica ederim.' : 'Tamam, gördüm.'

const HUES = ['#3048c8', '#0c7a0c', '#9a6500', '#6250d6', '#c93434', '#0e7490']
export function Avatar({ name, size = 32, dot }: { name: string; size?: number; dot?: boolean }) {
  const bot = name === BOT
  const ini = name.split(' ').filter(w => /^\p{L}/u.test(w)).slice(0, 2).map(w => w[0]).join('').toLocaleUpperCase('tr-TR')
  const bg = bot ? 'var(--brand)' : HUES[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % HUES.length]
  return (
    <span className="relative shrink-0 inline-grid place-items-center rounded-full text-white font-semibold" style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }} aria-hidden>
      {bot ? <Sparkles size={size * 0.5} /> : ini}
      {dot && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-ok ring-2 ring-card" />}
    </span>
  )
}
const when = (t: number) => (t >= NOW ? 'şimdi' : ago(t))

/* ---------- Mesajlar ekranı ---------- */
export function Messages({ query }: { query: URLSearchParams }) {
  const c = useChat()
  const [ch, setCh] = useState(() => query.get('ch') || 'genel')
  const [list, setList] = useState(true) // telefonda: önce liste, sonra konuşma
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const rows = c.msgs.filter(m => m.ch === ch)
  const dm = ch.startsWith('dm:'), other = dm ? ch.slice(3).split('|').find(p => p !== c.me) ?? '' : ''
  const meta = CHANNELS.find(x => x.id === ch)
  useEffect(() => { if (!c.mine(ch)) setCh('genel') }, [ch, c.me]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { c.markRead(ch); end.current?.scrollIntoView({ block: 'end' }) }, [ch, rows.length]) // eslint-disable-line react-hooks/exhaustive-deps
  const open = (id: string) => { setCh(id); setList(false) }
  const post = () => { const t = text.trim(); if (!t) return; c.send(ch, t); setText('') }
  const item = (id: string, body: ReactNode, on: boolean) => { const n = c.unread(id); return (
    <button key={id} onClick={() => open(id)} aria-current={on ? 'true' : undefined} className={`w-full flex items-center gap-2 rounded-lg px-2 h-9 border-0 text-left text-sm ${on ? 'bg-brand-soft text-brand font-medium' : 'bg-transparent text-ink2 hover:bg-bg'}`}>
      {body}{n > 0 && <span className="num ml-auto rounded-full bg-brand text-white text-[11px] font-semibold min-w-5 h-5 px-1.5 grid place-items-center">{n}</span>}
    </button>) }

  return (
    <div className="grid md:grid-cols-[250px_1fr] gap-3 h-[calc(100dvh-6.5rem)] min-h-[420px]">
      <aside className={`${list ? 'flex' : 'hidden'} md:flex flex-col bg-card border border-line rounded-2xl overflow-hidden`} aria-label="Konuşmalar">
        <div className="px-3 h-12 flex items-center border-b border-line"><b className="text-[15px] font-semibold font-display">Mesajlar</b></div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="px-2 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-mute">Ortak kanallar</div>
          {CHANNELS.map(x => item(x.id, <><Hash size={15} className="shrink-0 opacity-70" /><span className="truncate">{x.name}</span></>, ch === x.id))}
          <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-mute">Birebir</div>
          {PEOPLE.filter(p => p !== c.me).map(p => { const id = dmId(c.me, p); return item(id, <><Avatar name={p} size={22} dot={ONLINE.has(p)} /><span className="truncate">{p}</span></>, ch === id) })}
        </div>
        <div className="px-3 py-2 border-t border-line text-[11px] text-mute leading-snug flex gap-1.5"><Lock size={12} className="shrink-0 mt-0.5" />Birebir mesajlar yalnız iki kişi arasındadır; geliştirme için taranmaz.</div>
      </aside>

      <section className={`${list ? 'hidden' : 'flex'} md:flex flex-col bg-card border border-line rounded-2xl overflow-hidden min-w-0`} aria-label="Konuşma">
        <header className="px-3 h-12 flex items-center gap-2 border-b border-line shrink-0">
          <button onClick={() => setList(true)} aria-label="Konuşma listesi" className="md:hidden border-0 bg-transparent p-1 text-ink2"><ArrowLeft size={18} /></button>
          {dm ? <Avatar name={other} size={26} dot={ONLINE.has(other)} /> : <span className="size-7 grid place-items-center rounded-lg bg-brand-soft text-brand"><Hash size={15} /></span>}
          <div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-tight truncate">{dm ? other : meta?.name}</div><div className="text-[11px] text-mute truncate">{dm ? (ONLINE.has(other) ? 'Çevrimiçi' : 'Çevrimdışı') + ' · birebir' : meta?.desc}</div></div>
          {!dm && <span className="hidden sm:inline-flex items-center gap-1 text-xs text-mute"><Users size={13} />{PEOPLE.length}</span>}
          {ch === 'fikir' && <a href="#/feedback" className="text-xs text-brand no-underline inline-flex items-center gap-1 shrink-0">Geliştirme panosu <ArrowRight size={12} /></a>}
        </header>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {rows.length === 0 && <p className="text-mute text-center mt-10">Henüz mesaj yok. İlk mesajı siz yazın.</p>}
          {rows.map((m, i) => { const first = i === 0 || rows[i - 1].from !== m.from || m.t - rows[i - 1].t > 20 * M, own = m.from === c.me, liked = (m.likes ?? []).includes(c.me); return (
            <div key={m.id} className={`msg-in group relative flex gap-2.5 rounded-lg px-2 hover:bg-bg ${first ? 'pt-2' : ''} pb-0.5`}>
              <div className="w-8 shrink-0">{first && <Avatar name={m.from} />}</div>
              <div className="min-w-0 flex-1">
                {first && <div className="flex items-baseline gap-2"><b className="text-sm font-semibold">{own ? 'Siz' : m.from}</b><span className="text-[11px] text-mute">{when(m.t)}</span></div>}
                <div className="text-[14px] text-ink whitespace-pre-wrap break-words">{m.text}</div>
                {(m.link || m.flag || (m.likes ?? []).length > 0) && (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {m.flag && <Badge tone={m.flag === 'sorun' ? 'bad' : 'violet'}>{m.flag === 'sorun' ? <Bug size={11} /> : <Lightbulb size={11} />}{m.flag === 'sorun' ? 'Sorun' : 'Öneri'} · panoda</Badge>}
                    {m.link && <a href={m.link.href} className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2 py-0.5 text-xs text-brand no-underline hover:border-brand">{m.link.label}<ArrowRight size={11} /></a>}
                    {(m.likes ?? []).length > 0 && <button onClick={() => c.like(m.id)} title={(m.likes ?? []).join(', ')} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${liked ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-card text-ink2'}`}><ThumbsUp size={11} /><span className="num">{(m.likes ?? []).length}</span></button>}
                  </div>
                )}
              </div>
              {m.from !== BOT && (
                <div className="absolute -top-3 right-2 flex opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100 items-center rounded-lg border border-line bg-card shadow-sm overflow-hidden">
                  <button onClick={() => c.like(m.id)} title="Katılıyorum" aria-label="Katılıyorum" className="border-0 bg-transparent size-7 grid place-items-center text-ink2 hover:bg-bg"><ThumbsUp size={13} /></button>
                  {!dm && !m.flag && <button onClick={() => c.flag(m.id, 'oneri')} title="Öneri olarak panoya ekle" aria-label="Öneri olarak panoya ekle" className="border-0 bg-transparent size-7 grid place-items-center text-ink2 hover:bg-bg"><Lightbulb size={13} /></button>}
                  {!dm && !m.flag && <button onClick={() => c.flag(m.id, 'sorun')} title="Sorun olarak panoya ekle" aria-label="Sorun olarak panoya ekle" className="border-0 bg-transparent size-7 grid place-items-center text-ink2 hover:bg-bg"><Bug size={13} /></button>}
                  {!dm && <button onClick={() => askAssistant(`Ekipten şu mesaj geldi: "${m.text}" Bununla ilgili panelde ne yapabiliriz?`)} title="Asistana sor" aria-label="Asistana sor" className="border-0 bg-transparent size-7 grid place-items-center text-brand hover:bg-bg"><Sparkles size={13} /></button>}
                </div>
              )}
            </div>) })}
          <div ref={end} />
        </div>
        <form onSubmit={e => { e.preventDefault(); post() }} className="p-2.5 sm:pr-24 border-t border-line shrink-0">
          <div className="flex items-end gap-2 rounded-xl border border-line bg-bg px-2.5 py-1.5 focus-within:border-brand">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={1} aria-label="Mesaj" placeholder={dm ? `${other} kişisine yazın` : `#${meta?.name} kanalına yazın · @asistan ile asistana sorun`}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post() } }} className="flex-1 resize-none bg-transparent border-0 outline-none text-[14px] py-1 max-h-28" />
            <button type="submit" disabled={!text.trim()} aria-label="Gönder" className="size-8 grid place-items-center rounded-lg border-0 bg-brand text-white disabled:opacity-40"><Send size={15} /></button>
          </div>
        </form>
      </section>
    </div>
  )
}

/* ---------- Geliştirme panosu: konuşmalardan sistemi geliştirme ---------- */
export function Feedback() {
  const c = useChat()
  const st = useStore()
  const admin = st.role === 'admin'
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<'oneri' | 'sorun'>('oneri')
  // Yalnız ortak kanallar taranır; birebir mesajlar ve asistanın notları sayılmaz.
  const shared = useMemo(() => c.msgs.filter(m => !m.ch.startsWith('dm:') && m.from !== BOT), [c.msgs])
  const topics = useMemo(() => TOPICS.map(tp => {
    const hit = shared.filter(m => tp.words.some(w => lower(m.text).includes(w)))
    return { ...tp, n: hit.length, who: new Set(hit.map(m => m.from)).size, last: Math.max(0, ...hit.map(m => m.t)), quotes: [...hit].sort((a, b) => b.t - a.t).slice(0, 2) }
  }).filter(t => t.n > 0).sort((a, b) => b.who - a.who || b.n - a.n), [shared])
  const ideas = useMemo(() => [...c.ideas].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || b.votes.length - a.votes.length), [c.ideas])
  const done = c.ideas.filter(i => i.status === 'yapildi').length
  const digest = () => askAssistant('Ekip kanallarında bu hafta şunlar yazıldı:\n' + shared.slice(-14).map(m => `- ${m.from}: ${m.text}`).join('\n') + '\nBunlardan tekrar eden sorunları çıkar, her biri için panelde hangi kural ya da ekranla çözülebileceğini kısaca öner.')

  return (
    <>
      <PageHead title="Geliştirme panosu" desc="Ekip ortak kanallarda ne yazdıysa burada toplanır: tekrar eden sorunlar sayılır, öneriler oylanır, karar verilince sonucu kanala geri yazılır."
        actions={<><Btn onClick={digest}><Sparkles size={14} />Asistandan haftalık özet iste</Btn><a href="#/messages?ch=fikir" className="inline-flex items-center gap-1.5 rounded-md border border-line bg-card px-3 h-8 text-sm font-medium no-underline text-ink hover:bg-bg"><Hash size={14} />fikir-ve-sorun</a></>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[['Taranan mesaj', shared.length, 'yalnız ortak kanallar'], ['Tekrar eden konu', topics.length, 'en az bir kez geçti'], ['Açık istek', c.ideas.length - done, 'oylanıyor ya da sırada'], ['Yapılan', done, 'kanala bildirildi']].map(([l, v, h]) => (
          <div key={l as string} className="lift bg-card border border-line rounded-xl px-4 py-3"><div className="text-xs text-mute">{l}</div><div className="num font-display text-2xl font-semibold leading-tight mt-0.5">{v}</div><div className="text-xs text-ink2 mt-0.5">{h}</div></div>))}
      </div>

      <div className="grid xl:grid-cols-2 gap-3 items-start">
        <Card title="Ekip en çok bunları konuşuyor" right={<span className="text-xs text-mute inline-flex items-center gap-1"><Lock size={11} />birebir mesajlar taranmaz</span>}>
          <ul className="m-0 p-0 list-none divide-y divide-line">
            {topics.map(t => { const open = c.ideas.some(i => i.title === t.fix); return (
              <li key={t.key} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <b className="font-semibold">{t.label}</b>
                  <Badge tone={t.who >= 2 ? 'warn' : 'neutral'}>{t.who} kişi · {t.n} mesaj</Badge>
                  <span className="text-[11px] text-mute ml-auto">son: {when(t.last)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-bg overflow-hidden"><div className="grow-bar h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (t.n / Math.max(...topics.map(x => x.n))) * 100)}%` }} /></div>
                {t.quotes.map(q => <blockquote key={q.id} className="m-0 mt-1.5 border-l-2 border-line pl-2.5 text-[13px] text-ink2">“{q.text}” <span className="text-mute">— {q.from}</span></blockquote>)}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-mute">Öneri:</span><span className="text-[13px]">{t.fix}</span>
                  <span className="flex-1" />
                  <a href={t.href} className="inline-flex items-center gap-1 rounded-md border border-line bg-card px-2 h-7 text-xs text-ink no-underline hover:border-brand">{t.screen}<ArrowRight size={11} /></a>
                  <Btn className="h-7 px-2 text-xs" disabled={open} onClick={() => c.addIdea(t.fix, 'oneri', 'fikir')}>{open ? <><Check size={12} />Panoda</> : <><MessageSquarePlus size={12} />İstek aç</>}</Btn>
                </div>
              </li>) })}
          </ul>
        </Card>

        <Card title="Geliştirme istekleri" right={<span className="text-xs text-mute">önce açık olanlar, sonra oy sayısı</span>}>
          <form onSubmit={e => { e.preventDefault(); const t = title.trim(); if (!t) return; c.addIdea(t, kind, 'fikir'); setTitle('') }} className="flex flex-wrap gap-2 mb-3">
            <select value={kind} onChange={e => setKind(e.target.value as 'oneri' | 'sorun')} aria-label="Tür" className="rounded-md border border-line bg-card h-8 px-2 text-sm"><option value="oneri">Öneri</option><option value="sorun">Sorun</option></select>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tek cümleyle yazın: ne olsun, ne takılıyor?" aria-label="Yeni istek" className="flex-1 min-w-40 rounded-md border border-line bg-card h-8 px-2.5 text-sm" />
            <Btn variant="primary" type="submit" disabled={!title.trim()}>Ekle</Btn>
          </form>
          <ul className="m-0 p-0 list-none space-y-2">
            {ideas.map(i => { const voted = i.votes.includes(c.me); return (
              <li key={i.id} className={`flex gap-3 rounded-xl border border-line px-3 py-2.5 ${i.status === 'yapildi' ? 'bg-bg opacity-80' : 'bg-card'}`}>
                <button onClick={() => c.vote(i.id)} aria-pressed={voted} aria-label="Oy ver" title={i.votes.join(', ') || 'Henüz oy yok'} className={`shrink-0 w-11 rounded-lg border grid place-items-center py-1 ${voted ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-card text-ink2 hover:border-brand'}`}>
                  <ChevronUp size={15} /><span className="num text-sm font-semibold leading-none pb-0.5">{i.votes.length}</span>
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium ${i.status === 'yapildi' ? 'line-through decoration-mute' : ''}`}>{i.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-mute">
                    <Badge tone={i.kind === 'sorun' ? 'bad' : 'violet'}>{i.kind === 'sorun' ? 'Sorun' : 'Öneri'}</Badge>
                    <span>{i.from}</span><span>·</span><a href={`#/messages?ch=${i.ch}`} className="text-mute no-underline hover:text-brand">#{CHANNELS.find(x => x.id === i.ch)?.name ?? 'fikir-ve-sorun'}</a><span>·</span><span>{when(i.t)}</span>
                  </div>
                </div>
                {admin ? (
                  <select value={i.status} onChange={e => c.setStatus(i.id, e.target.value as IdeaStatus)} aria-label="Durum" className="shrink-0 self-start rounded-md border border-line bg-card h-7 px-1.5 text-xs">{ORDER.map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}</select>
                ) : <span className="shrink-0 self-start"><Badge tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Badge></span>}
              </li>) })}
          </ul>
          {!admin && <p className="m-0 mt-3 text-xs text-mute">Durumu yalnız sistem yöneticisi değiştirir; herkes öneri ekleyip oy verebilir.</p>}
        </Card>
      </div>
      <p className="mt-4 text-xs text-mute max-w-[90ch]">Gerçek sistemde asistan ortak kanalları haftada bir okur, tekrar eden sorunları buraya çıkarır ve çözüm olarak kural ya da ekran önerir. Hiçbir değişiklik onaysız uygulanmaz; birebir mesajlar ve müşteri bilgisi bu taramaya girmez.</p>
    </>
  )
}
