import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ImagePlus, Keyboard, RefreshCw, SkipForward, Sparkles } from 'lucide-react'
import { NOW, fmtNum, revenueOrders, type Product } from '../data'
import { ROLES, useStore } from '../store'
import { Thumb } from '../Thumb'
import { Badge, Btn, Card, Empty, PageHead, Stat, Tabs, sel, td, th, type Tone } from '../ui'

const inputCls = 'h-8 rounded-md border border-line bg-card px-2 text-sm w-full'
const singleKeysOn = () => { try { return localStorage.getItem('wawi-single-keys') !== 'off' } catch { return true } }
const DAY30 = 30 * 86400000
const eanCheck = (d12: string) => String((10 - ([...d12].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0) % 10)) % 10)
// Barkod 13 haneli olmalı ve son hane kontrol hanesiyle tutmalı.
const eanOk = (s: string) => { const t = s.trim(); return /^\d{13}$/.test(t) && eanCheck(t.slice(0, 12)) === t[12] }
const norm = (s: string) => s.toLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const jaccard = (a: string, b: string) => {
  const x = new Set(norm(a).split(' ')), y = new Set(norm(b).split(' '))
  const inter = [...x].filter(t => y.has(t)).length
  return inter / (x.size + y.size - inter)
}
const CAT_SUG: Record<string, string> = { Parfüm: 'Parfüm', Toner: 'Toner', Saat: 'Saat', Elektronik: 'Elektronik', '3D baskı': '3D baskı', Ofis: 'Ofis' }

type Kind = 'ean' | 'gorsel' | 'sorunlu'
const KIND: Record<Kind, { label: string; tone: Tone }> = { ean: { label: 'Barkod yok', tone: 'bad' }, gorsel: { label: 'Görsel yok', tone: 'warn' }, sorunlu: { label: 'Sorunlu ilan', tone: 'bad' } }
export const kindsOf = (p: Product): Kind[] => [...(!p.ean ? ['ean' as const] : []), ...(!p.image ? ['gorsel' as const] : []), ...(p.listings.some(l => l.status === 'sorunlu') ? ['sorunlu' as const] : [])]

function useSales() {
  const { allOrders } = useStore()
  return useMemo(() => {
    const m = new Map<string, number>()
    revenueOrders(allOrders).forEach(o => o.items.forEach(i => m.set(i.pid, (m.get(i.pid) ?? 0) + i.qty)))
    return m
  }, [allOrders])
}

function dupGroups(products: Product[]) {
  const par = products.map((_, i) => i)
  const find = (i: number): number => (par[i] === i ? i : (par[i] = find(par[i])))
  const why = new Map<number, string>()
  for (let i = 0; i < products.length; i++) for (let j = i + 1; j < products.length; j++) {
    const a = products[i], b = products[j]
    const sameEan = !!a.ean && a.ean === b.ean
    const sim = a.brand === b.brand ? jaccard(a.name, b.name) : 0
    if (sameEan || sim >= 0.6) { par[find(j)] = find(i); why.set(find(i), sameEan ? 'Aynı barkod' : 'Aynı marka, çok benzer ad') }
  }
  const g = new Map<number, Product[]>()
  products.forEach((p, i) => g.set(find(i), [...(g.get(find(i)) ?? []), p]))
  return [...g.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => ({ key: v.map(p => p.id).join('+'), items: v, why: why.get(k) ?? 'Benzer ad' }))
}

export function QualityQueue() {
  const { products, role, notify } = useStore()
  const sales = useSales()
  const canEdit = ROLES[role].ops
  const [tab, setTab] = useState<'next' | 'list' | 'dup'>('next')
  const [fixed, setFixed] = useState<Set<string>>(new Set())
  const [skipped, setSkipped] = useState<string[]>([])
  const [filter, setFilter] = useState<Kind | 'all'>('all')
  const [dupDone, setDupDone] = useState<Record<string, 'merged' | 'diff'>>({})
  const [form, setForm] = useState({ ean: '', cat: '', img: false })

  const queue = useMemo(() => products.filter(p => kindsOf(p).length && !fixed.has(p.id))
    .sort((a, b) => (skipped.indexOf(a.id) + 1 && 1) - (skipped.indexOf(b.id) + 1 && 1) || (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) || kindsOf(b).length - kindsOf(a).length), [products, fixed, skipped, sales])
  const cur = queue[0]
  useEffect(() => { setForm({ ean: '', cat: cur?.cat ?? '', img: false }) }, [cur?.id])
  const cnt = (k: Kind) => products.filter(p => kindsOf(p).includes(k)).length
  const groups = useMemo(() => dupGroups(products), [products])
  const total = products.filter(p => kindsOf(p).length).length

  const canSave = !!cur && canEdit && (!cur.ean ? eanOk(form.ean) : true) && (!cur.image ? form.img : true)
  const save = () => { if (!cur || !canSave) return; setFixed(s => new Set(s).add(cur.id)); notify(`${cur.name} düzeltildi (örnek veri; kayıt yalnız bu tarayıcıda tutulur)`) }
  const skip = () => { if (cur) setSkipped(s => [...s.filter(x => x !== cur.id), cur.id]) }
  const h = useRef({ save, skip, tab }); h.current = { save, skip, tab }
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (h.current.tab !== 'next' || e.ctrlKey || e.metaKey) return
      if ((e.target as HTMLElement).closest('aside,[role=dialog]')) return // asistan, çekmece ve pencerelerdeki Enter bu kaydı tetiklemesin
      const typing = (e.target as HTMLElement).closest('input,textarea,select')
      if (e.key === 'Enter' && (typing || e.target === document.body)) { e.preventDefault(); h.current.save() }
      else if (!typing && e.key.toLowerCase() === 's' && singleKeysOn()) h.current.skip()
    }
    window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f)
  }, [])

  const n30 = cur ? sales.get(cur.id) ?? 0 : 0
  const why = (k: Kind, p: Product) => k === 'ean' ? 'Kaufland ve OTTO barkodsuz ürünü kabul etmez; eBay de eşleştiremez.' : k === 'gorsel' ? 'Görselsiz ilan yayına alınmaz veya çok az görüntülenir.' : `İlan sorunlu: ${p.listings.filter(l => l.status === 'sorunlu').map(l => l.reason).join(', ')}.`
  const sugEan = cur ? '869' + String(1000000 + Number(cur.id.slice(1)) * 7919).padStart(9, '0') : ''
  const sugFull = sugEan + (cur ? eanCheck(sugEan) : '')

  return (
    <>
      <PageHead title="Veri kalitesi" desc="Eksik barkod, görsel ve sorunlu ilanları sırayla düzeltin. Son 30 günde satış alan ürünler en üstte gelir." legacy={['missing-product-eans', 'missing-product-images', 'problem-products']} />
      {!canEdit && <div className="mb-3 rounded-lg border border-line bg-warn-soft text-warn px-3 py-2 text-sm">Bu rolde yalnızca görüntüleme var; düzeltme yapılamaz.</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Stat label="Eksik barkod" value={fmtNum(cnt('ean'))} tone="bad" /><Stat label="Eksik görsel" value={fmtNum(cnt('gorsel'))} tone="warn" />
        <Stat label="Sorunlu ilan olan ürün" value={fmtNum(cnt('sorunlu'))} tone="bad" /><Stat label="Olası mükerrer grup" value={fmtNum(groups.length)} hint={`${fmtNum(groups.reduce((a, g) => a + g.items.length, 0))} ürün`} />
      </div>
      <Card className="mb-3">
        <div className="flex justify-between text-sm mb-1.5"><span>Bugün düzeltilen</span><span className="num">{fmtNum(fixed.size)} / {fmtNum(total)}</span></div>
        <div className="h-2.5 rounded bg-bg overflow-hidden" role="progressbar" aria-valuenow={fixed.size} aria-valuemax={total}><div className="h-full bg-ok rounded" style={{ width: `${total ? (fixed.size / total) * 100 : 0}%` }} /></div>
      </Card>
      <Tabs value={tab} onChange={setTab} items={[{ key: 'next', label: 'Sıradaki', count: queue.length }, { key: 'list', label: 'Liste', count: queue.length }, { key: 'dup', label: 'Aynı ürün olabilecekler', count: groups.filter(g => !dupDone[g.key]).length }]} />
      <div className="mt-2">
        {tab === 'next' && (cur ? (
          <Card title={<span className="flex items-center gap-2.5"><Thumb p={cur} size={36} />{cur.name}</span>} right={<span className="flex gap-1">{kindsOf(cur).map(k => <Badge key={k} tone={KIND[k].tone}>{KIND[k].label}</Badge>)}</span>}>
            <div className="text-xs text-mute mb-3">{cur.brand} · {cur.cat} · {cur.sku}</div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="font-medium">Neden önemli?</div>
                <ul className="m-0 pl-4 space-y-1 text-ink2">{kindsOf(cur).map(k => <li key={k}>{why(k, cur)}</li>)}
                  <li>{n30 ? <>Son 30 günde <b className="num text-ink">{fmtNum(n30)}</b> adet sattı.</> : 'Son 30 günde sipariş almadı.'}</li></ul>
                <div className="rounded-lg border border-dashed border-line bg-bg p-3">
                  <div className="font-medium mb-1 flex items-center gap-2">Öneri <Badge tone="violet">örnek</Badge></div>
                  <div className="text-ink2">{!cur.ean && <>Barkod: <code className="num">{sugFull}</code> <Btn variant="ghost" className="!h-6 !px-2" disabled={!canEdit} onClick={() => setForm(f => ({ ...f, ean: sugFull }))}>Alana yaz</Btn><br /></>}
                    Kategori: {CAT_SUG[cur.cat] ?? cur.cat}</div>
                  <div className="text-xs text-mute mt-1">öneri — onaylamadan kaydedilmez</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {!cur.ean && <label className="block text-sm">Barkod (EAN-13)
                  <input className={inputCls + ' num mt-1'} value={form.ean} disabled={!canEdit} inputMode="numeric" maxLength={13} placeholder="13 haneli sayı" onChange={e => setForm(f => ({ ...f, ean: e.target.value.replace(/\D/g, '') }))} />
                  <span className={`text-xs ${form.ean && !eanOk(form.ean) ? 'text-bad' : 'text-mute'}`}>{eanOk(form.ean) ? 'Biçim uygun' : `${form.ean.length}/13 hane`}</span></label>}
                {!cur.image && <div className="text-sm">Görsel<div className="mt-1"><Btn disabled={!canEdit} onClick={() => setForm(f => ({ ...f, img: true }))}><ImagePlus size={15} />{form.img ? 'Görsel eklendi (örnek)' : 'Görsel yükle'}</Btn></div></div>}
                <label className="block text-sm">Kategori
                  <select className={sel + ' w-full mt-1'} disabled={!canEdit} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>{Object.keys(CAT_SUG).map(c => <option key={c}>{c}</option>)}</select></label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Btn variant="primary" disabled={!canSave} onClick={save}><Check size={15} />Kaydet ve sıradaki</Btn>
                  <Btn disabled={!canEdit || queue.length < 2} onClick={skip}><SkipForward size={15} />Atla</Btn>
                </div>
                <div className="text-xs text-mute flex items-center gap-1.5"><Keyboard size={14} /><kbd>Enter</kbd> = kaydet · <kbd>S</kbd> = atla</div>
              </div>
            </div>
          </Card>
        ) : <Card><Empty>Sıra boş, tüm ürünler düzeltildi.</Empty></Card>)}
        {tab === 'list' && (
          <Card pad={false}>
            <div className="p-3 border-b border-line"><select className={sel} aria-label="Sorun türüne göre filtrele" value={filter} onChange={e => setFilter(e.target.value as Kind | 'all')}>
              <option value="all">Tüm sorunlar</option>{(Object.keys(KIND) as Kind[]).map(k => <option key={k} value={k}>{KIND[k].label}</option>)}</select></div>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir"><table className="w-full border-collapse text-sm"><thead><tr><th className={th}>Ürün</th><th className={th}>Sorun</th><th className={th + ' text-right'}>30 gün satış</th></tr></thead><tbody>
              {queue.filter(p => filter === 'all' || kindsOf(p).includes(filter)).map(p => (
                <tr key={p.id}><td className={td}><div className="flex items-center gap-2.5"><Thumb p={p} size={32} /><div>{p.name}<div className="text-xs text-mute">{p.brand} · {p.sku}</div></div></div></td>
                  <td className={td}><span className="flex flex-wrap gap-1">{kindsOf(p).map(k => <Badge key={k} tone={KIND[k].tone}>{KIND[k].label}</Badge>)}</span></td>
                  <td className={td + ' num text-right'}>{fmtNum(sales.get(p.id) ?? 0)}</td></tr>))}
            </tbody></table></div>
          </Card>
        )}
        {tab === 'dup' && (
          <div className="space-y-3">
            <div className="text-xs text-mute">Benzerlik kuralı: aynı barkod ya da aynı marka + ad benzerliği en az %60 (örnek yöntem; gerçek sistemde daha ayrıntılı olur).</div>
            {groups.length === 0 && <Card><Empty>Mükerrer adayı bulunamadı.</Empty></Card>}
            {groups.map(g => {
              const st = dupDone[g.key]
              return (
                <Card key={g.key} title={g.why} right={st ? <Badge tone={st === 'merged' ? 'ok' : 'neutral'}>{st === 'merged' ? 'Birleştirme talebi' : 'Farklı ürün'}</Badge> : <Badge tone="warn">Karar bekliyor</Badge>}>
                  <ul className="m-0 pl-4 text-sm space-y-0.5">{g.items.map(p => <li key={p.id}>{p.name} <span className="text-mute">· {p.sku}{p.ean ? ` · ${p.ean}` : ''}</span></li>)}</ul>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Btn disabled={!canEdit || !!st} onClick={() => { if (window.confirm('Birleştirme gerçek sistemde geri alınamaz ve yönetici onayı ister. Bu taslakta yalnızca talep olarak işaretlenir. Devam edilsin mi?')) { setDupDone(d => ({ ...d, [g.key]: 'merged' })); notify('Birleştirme talebi yöneticiye iletildi (mock)') } }}>Birleştir</Btn>
                    <Btn variant="ghost" disabled={!canEdit || !!st} onClick={() => { setDupDone(d => ({ ...d, [g.key]: 'diff' })); notify('Farklı ürün olarak işaretlendi') }}>Farklı ürün</Btn>
                  </div>
                </Card>)
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ---------- İçerik stüdyosu ----------
const CH: Record<string, { label: string; max: number }> = {
  kaufland: { label: 'Kaufland', max: 80 }, otto: { label: 'OTTO', max: 60 }, ebay: { label: 'eBay', max: 80 },
  amazon: { label: 'Amazon', max: 150 }, shopify: { label: 'Shopify', max: 70 }, trendyol: { label: 'Trendyol', max: 100 },
}
const BANNED = ['ucuz', 'indirim', 'kampanya', 'en iyi', 'bedava', 'fırsat', 'süper', 'sale']
const VARIANTS: ((p: Product) => string)[] = [p => `${p.brand} ${p.name}`, p => `${p.brand} ${p.name} – ${p.cat}`, p => `${p.brand} | ${p.name} | ${p.cat} ürünü`]
const bullets = (p: Product, v: number) => [`Marka: ${p.brand}`, `Ürün: ${p.name}`, v === 0 ? `Kategori: ${p.cat}` : `${p.cat} kategorisinde günlük kullanıma uygun`, ...(v === 2 ? [`Barkod: ${p.ean ?? 'tanımlanacak'}`] : []), 'Teslimat ve iade koşulları kanal kurallarına göre geçerlidir.']
const LANGS = ['TR', 'DE', 'EN', 'NL', 'FR'] as const
const TR_SAMPLES: Record<string, Record<string, string>> = {
  'Bluetooth Kulaklık Air 3': { DE: 'Bluetooth-Kopfhörer Air 3', EN: 'Bluetooth Earbuds Air 3', NL: 'Bluetooth-oordopjes Air 3', FR: 'Écouteurs Bluetooth Air 3' },
  'USB-C Şarj Aleti 65 W GaN': { DE: 'USB-C-Ladegerät 65 W GaN', EN: 'USB-C Charger 65 W GaN', NL: 'USB-C-lader 65 W GaN', FR: 'Chargeur USB-C 65 W GaN' },
  'Kol Saati Chrono 42 mm çelik': { DE: 'Armbanduhr Chrono 42 mm Edelstahl', EN: 'Chrono Wrist Watch 42 mm Steel', NL: 'Chrono-horloge 42 mm staal', FR: 'Montre Chrono 42 mm acier' },
  'Kablosuz Mouse Silent': { DE: 'Kabellose Maus Silent', EN: 'Wireless Mouse Silent', NL: 'Draadloze muis Silent', FR: 'Souris sans fil Silent' },
}

export function ContentStudio() {
  const { products, role, notify } = useStore()
  const canEdit = ROLES[role].ops
  const [pid, setPid] = useState(products[0]?.id ?? '')
  const [ch, setCh] = useState('kaufland')
  const [lang, setLang] = useState<(typeof LANGS)[number]>('TR')
  const [v, setV] = useState(0)
  const [acc, setAcc] = useState<{ pid: string; ch: string; title: string; v: number; lang: string }[]>([])
  // Sunucuda yapay zekâ anahtarı varsa metni model yazar (/api/content); yoksa şablonlar kullanılır.
  const [ai, setAi] = useState<{ title: string; bullets: string[] } | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [live, setLive] = useState(false)
  useEffect(() => { if (location.protocol === 'file:') return; fetch(location.origin + '/api/assistant').then(r => (r.ok ? r.json() : null)).then(j => setLive(!!j?.live)).catch(() => {}) }, [])
  useEffect(() => setAi(null), [pid, ch, lang])
  const p = products.find(x => x.id === pid) ?? products[0]
  if (!p) return <Empty>Ürün yok.</Empty>
  const title = ai?.title ?? VARIANTS[v](p), rule = CH[ch]
  const LANGNAME: Record<string, string> = { TR: 'Türkçe', DE: 'Almanca', EN: 'İngilizce', NL: 'Felemenkçe', FR: 'Fransızca' }
  const gen = async () => {
    setAiBusy(true)
    try {
      const r = await fetch(location.origin + '/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: { name: p.name, brand: p.brand, cat: p.cat, sku: p.sku }, channel: CH[ch].label, max: rule.max, lang: LANGNAME[lang] ?? lang }) })
      const j = (await r.json().catch(() => ({}))) as { title?: string; bullets?: string[]; message?: string }
      if (!r.ok || !j.title) throw new Error(j.message || 'Metin üretilemedi')
      setAi({ title: j.title, bullets: j.bullets ?? [] })
    } catch (e) { notify(e instanceof Error ? e.message : 'Metin üretilemedi') } finally { setAiBusy(false) }
  }
  const tr = TR_SAMPLES[p.name]?.[lang]
  const rules = (t: string) => [
    { ok: t.length <= rule.max, text: `En çok ${rule.max} karakter (${t.length})` },
    { ok: !BANNED.some(b => norm(t).includes(norm(b))), text: 'Reklam sözcüğü yok (ucuz, indirim, kampanya…)' },
    { ok: t.startsWith(p.brand), text: 'Marka başta' },
    { ok: !/[!?]/.test(t) && t !== t.toUpperCase(), text: 'Ünlem ve tamamı büyük harf yok' },
  ]
  const sc = (t: string) => rules(t).map(r => <li key={r.text} className={`flex items-center gap-1.5 ${r.ok ? 'text-ok' : 'text-bad'}`}>{r.ok ? <Check size={14} /> : <span aria-hidden>✕</span>}<span className="sr-only">{r.ok ? 'Uygun: ' : 'İhlal: '}</span>{r.text}</li>)
  const accept = () => { setAcc(a => [{ pid: p.id, ch, title, v, lang }, ...a].slice(0, 8)); notify(`Taslak kabul edildi: ${CH[ch].label}`) }

  return (
    <>
      <PageHead title="Ürün metni ve çeviri" desc="Kanal kurallarına uygun başlık ve madde işaretli açıklama taslağı üretin." />
      {live ? <div className="mb-3 rounded-lg border border-line bg-ok-soft text-ok px-3 py-2 text-sm">Yapay zekâ bağlı: “Yapay zekâyla üret” seçili ürün, kanal ve dil için başlık ve maddeleri yazar. Kabul etmeden hiçbir yere kaydedilmez.</div>
        : <div className="mb-3 rounded-lg border border-line bg-warn-soft text-warn px-3 py-2 text-sm">Yapay zekâ bağlı değil; metinler sabit şablonlardan gelir. Sunucuya anahtar tanımlanınca “Yapay zekâyla üret” düğmesi görünür.</div>}
      <Card className="mb-3"><div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Ürün<select className={sel + ' w-full mt-1'} value={p.id} onChange={e => { setPid(e.target.value); setV(0) }}>{products.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label className="text-sm">Kanal<select className={sel + ' w-full mt-1'} value={ch} onChange={e => setCh(e.target.value)}>{Object.entries(CH).map(([k, c]) => <option key={k} value={k}>{c.label} · en çok {c.max} karakter</option>)}</select></label>
      </div></Card>
      <div className="grid lg:grid-cols-2 gap-3">
        <Card title="Mevcut başlık" right={<Badge>{p.name.length} karakter</Badge>}>
          <p className="m-0 text-sm">{p.name}</p><ul className="list-none p-0 mt-2 space-y-1 text-xs">{sc(p.name)}</ul>
        </Card>
        <Card title="Taslak" right={<span className="flex gap-1">{ai ? <Badge tone="ok">yapay zekâ taslağı</Badge> : <Badge tone="violet">örnek şablon {v + 1}/{VARIANTS.length}</Badge>}<Badge tone={title.length <= rule.max ? 'ok' : 'bad'}>{title.length}/{rule.max}</Badge></span>}>
          <p className="m-0 text-sm font-medium">{title}</p>
          <ul className="m-0 mt-2 pl-4 text-sm text-ink2 space-y-0.5">{(ai?.bullets ?? bullets(p, v)).map(b => <li key={b}>{b}</li>)}</ul>
          <ul className="list-none p-0 mt-2 space-y-1 text-xs">{sc(title)}</ul>
          <div className="flex flex-wrap gap-2 mt-3">
            <Btn variant="primary" disabled={!canEdit} onClick={accept}><Check size={15} />Taslağı kabul et</Btn>
            {live && <Btn onClick={gen} disabled={aiBusy || !canEdit}><Sparkles size={15} />{aiBusy ? 'Yazıyor…' : ai ? 'Yeniden yazdır' : 'Yapay zekâyla üret'}</Btn>}
            <Btn onClick={() => { setAi(null); setV(x => (x + 1) % VARIANTS.length) }}><RefreshCw size={15} />{live ? 'Şablona dön' : 'Yeniden üret'}</Btn>
          </div>
          {!canEdit && <div className="text-xs text-mute mt-1">Bu rolde yalnızca görüntüleme var.</div>}
        </Card>
      </div>
      <Card title="Çeviri" right={<Badge tone="violet">örnek</Badge>} className="mt-3">
        <div className="flex gap-1 mb-2" role="group" aria-label="Dil">{LANGS.map(l => <Btn key={l} variant={l === lang ? 'primary' : 'outline'} onClick={() => setLang(l)} aria-pressed={l === lang}>{l}</Btn>)}</div>
        {lang === 'TR' || ai ? <p className="m-0 text-sm">{title}</p> : tr ? <p className="m-0 text-sm"><b>{p.brand} {tr}</b></p>
          : <p className="m-0 text-sm text-mute">gerçek sistemde yapay zekâ çevirir; bu taslakta örnek gösterilir. (Sabit çeviri yalnızca {Object.keys(TR_SAMPLES).length} ürün için var.)</p>}
      </Card>
      <Card title="Son kabul edilen taslaklar" className="mt-3" pad={false}>
        {acc.length === 0 ? <Empty>Henüz taslak kabul edilmedi.</Empty> : <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tablo; yatay kaydırılabilir"><table className="w-full border-collapse text-sm"><thead><tr><th className={th}>#</th><th className={th}>Kanal</th><th className={th}>Başlık</th><th className={th}>Şablon</th><th className={th + ' text-right'}>Karakter</th></tr></thead><tbody>
          {acc.map((a, i) => <tr key={i}><td className={td + ' num'}>{acc.length - i}</td><td className={td}>{CH[a.ch].label}</td><td className={td}>{a.title}</td><td className={td + ' num'}>{a.v + 1}</td><td className={td + ' num text-right'}>{a.title.length}</td></tr>)}
        </tbody></table></div>}
      </Card>
    </>
  )
}
