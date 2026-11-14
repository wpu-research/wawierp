import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUp, Check, ExternalLink, Lock, ShieldCheck, Sparkles, X } from 'lucide-react'
import { CHANNEL, NOW, RET, account, dayKey, fmtMoney, fmtNum, hasIssue, overdue, toShip, type ChannelType, type Order } from './data'
import { ROLES, useStore } from './store'
import { Badge, Btn } from './ui'

/* Asistan paneli (mock). Gerçek bir yapay zekâ bağlı DEĞİL: yazılanı anahtar kelimelerle eşleştirir,
   yanıtı mock veriden hesaplar. Amaç, hedef davranışı göstermek:
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
    setMsgs(ms => ms.map(x => (x.id === id ? { ...x, act: { ...a, state: ok ? 'uygulandi' : 'vazgecildi' } } : x)))
  }

  const scope = [st.companyId ? 'seçili şirket' : 'tüm şirketler', st.whId ? 'seçili depo' : 'tüm depolar'].join(' · ')

  return (
    <aside aria-label="Asistan" hidden={!open} className="fixed inset-y-0 right-0 z-40 w-[400px] max-w-full bg-card border-l border-line flex flex-col shadow-xl xl:shadow-none">
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-line">
        <span className="size-7 grid place-items-center rounded-lg bg-brand-soft text-brand"><Sparkles size={16} /></span>
        <div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-tight">Asistan</div><div className="text-[11px] text-mute truncate">{R.label} yetkisiyle · {scope}</div></div>
        <Badge tone="warn" title="Gerçek yapay zekâ bağlı değil; hazır senaryolar mock veriden hesaplanır">MOCK</Badge>
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
        {busy && <div className="text-sm text-mute" role="status">Veriye bakıyorum…</div>}
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
