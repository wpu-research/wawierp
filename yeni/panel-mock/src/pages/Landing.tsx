import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, BarChart3, Boxes, Check, FileText, Globe2, KeyRound, Layers, Moon, PackageCheck, ScanBarcode, ShieldCheck, ShoppingCart, Smartphone, Sun, Truck, Users, Warehouse } from 'lucide-react'
import { CHANNEL, NOW, ORDERS0, account, dayKey, fmtDT, fmtMoney, fmtNum, toShip } from '../data'
import { Logo } from '../ui'

const wrap = 'max-w-[1180px] mx-auto px-4 md:px-6'
const kicker = 'text-xs font-semibold tracking-[0.14em] uppercase'

// ---------- içerik (canlı sitedeki kapsamla aynı; “mevcut” ve “kurulum talebi” ayrımı korunur) ----------
const STOCK = [
  { key: 'fiziki', tab: 'Fiziki stok', kick: 'Deponuzdaki gerçek ürünler', title: 'Rafınızdaki ürünü, sayılmış adediyle yönetin.',
    text: 'Her deponun sayımı, fiyatı ve hareket geçmişi kendi içinde tutulur. Sayımı yapılmamış ürün sıfır stok sayılmaz; hangi depoda ne olduğunu görürsünüz.',
    points: ['Barkodla ürün bulma, sayım ve stok güncelleme', 'Kritik, biten ve henüz sayılmamış stoklar ayrı süzgeçte', 'Depo transferi, sevkiyat ve sayılarak mal kabul'],
    card: { label: 'Sayılmış depo stoğu', rows: [['Almanya · A-3-2', '119'], ['Hollanda · C-1-4', '46'], ['Istanbul', 'Sayım yok']] } },
  { key: 'sanal', tab: 'Sanal stok', kick: 'Planlanan satış kapasitesi', title: 'İlana açacağınız miktarı ayrıca tanımlayın.',
    text: 'Sanal miktar, rafta sayılmış ürün demek değildir. Ürün için belirlediğiniz satış kapasitesini fiziki ve tedarikçi miktarlarından ayrı izlersiniz.',
    points: ['Ürün bazında sanal stok değeri ve aç/kapa', 'Fiziki sayımı değiştirmeden kapasiteyi düzenleme', 'İlan kaynağı ve stok kuralı her zaman görünür'],
    card: { label: 'Fiziki stoktan ayrı kapasite', rows: [['İlana açık', '40'], ['Fiziki sayım', '119'], ['Kural', 'Kanala en çok 40']] } },
  { key: 'drop', tab: 'Dropshipping', kick: 'Tedarikçiden müşteriye', title: 'Tedarikçi kataloğunuz da operasyonunuza dahil.',
    text: 'Tedarikçi ürünlerini ortak kataloğunuzla eşleştirin. Drop stoğunu, tedarikçi fiyatını ve siparişin karşılanma kaynağını ayrı görün.',
    points: ['Tedarikçi, ürün kimliği ve katalog eşleştirmesi', 'Drop miktarı ile fiziki depo miktarı ayrı', 'Tedarikçi bazında sipariş, durum ve takip bilgisi'],
    card: { label: 'Tedarikçi ürünleri ve drop stoğu', rows: [['Tedarikçi stoğu', '1.240'], ['Drop satış fiyatı', '€34,90'], ['Son okuma', '12 dk önce']] } },
] as const

const FEATURES: { icon: typeof Boxes; title: string; text: string; span?: string }[] = [
  { icon: Layers, title: 'Ortak ürün kataloğu', text: 'SKU, birden fazla EAN, varyant ve mükerrer kart birleştirme. Bir ürün, bütün depolarda ve kanallarda tek kart.', span: 'md:col-span-2' },
  { icon: Warehouse, title: 'Çoklu depo ve şirket', text: 'Depo, şirket, kanal ve hesap aynı hiyerarşide. Transfer, yoldaki sevkiyat ve mal kabul.' },
  { icon: ShoppingCart, title: 'Birleşik sipariş havuzu', text: 'Bütün mağazaların siparişleri tek listede; tarih, durum, depo, şirket ve tedarik kaynağına göre süzülür.' },
  { icon: Truck, title: 'Toplama, paketleme, kargo', text: 'Toplama listesi, etiket, toplu PDF ve takip numarası. Takip bilgisi kanala kendiliğinden gider.', span: 'md:col-span-2' },
  { icon: FileText, title: 'Fatura ve ön muhasebe', text: 'Doğru tüzel kişilik adına belge, ülkeye göre KDV, EUR ve USD ayrı takip, tahsilat ve kanal cirosu.' },
  { icon: Users, title: 'B2B müşteri portalı', text: 'Toptan müşteriniz kendi stoğunu, faturasını ve cari bakiyesini kendi girişinden görür.' },
  { icon: ShieldCheck, title: 'Ekip, yetki, denetim izi', text: 'Depo ve bölüm bazında erişim. Kim, neyi, ne zaman yaptı kaydı.' },
]

const STEPS = [
  ['Ürünü hazırla', 'Kart, EAN, görsel ve fiyat tek yerde tamamlanır.'],
  ['Kaynağı seç', 'Fiziki, sanal ya da drop: satışın nereden karşılanacağı bellidir.'],
  ['Kanala gönder', 'Önizle, onayla, gönder; yayın sonucunu aynı ekranda gör.'],
  ['Siparişi hazırla', 'Topla, paketle, etiketi ve faturayı oluştur.'],
  ['Müşteriye ulaş', 'Takip numarası kanala işlenir, stok defteri güncellenir.'],
]

const CH: { group: string; on: string[]; off: string[] }[] = [
  { group: 'Pazaryerleri', on: ['Amazon', 'eBay', 'Kaufland', 'METRO', 'OTTO', 'Trendyol', 'n11', 'Ozon', 'DealClub', 'idealo', 'Stockist24'],
    off: ['Etsy', 'Walmart', 'Allegro', 'bol', 'Cdiscount', 'Fnac Darty', 'Rakuten', 'AliExpress', 'Temu', 'TikTok Shop', 'SHEIN', 'Hepsiburada', 'ÇiçekSepeti', 'Pazarama', 'eMAG', 'Zalando', 'Back Market', 'ManoMano'] },
  { group: 'Web mağazaları', on: ['Shopify', 'JTL-Shop', 'Wawi Store API'], off: ['Magento', 'WooCommerce', 'Shopware', 'PrestaShop', 'BigCommerce', 'Wix', 'ikas', 'Ticimax', 'IdeaSoft', 'T-Soft'] },
  { group: 'Operasyon ve kargo', on: ['JTL-Wawi', 'Billbee', 'Asterbuy', 'XML / CSV', 'DHL', 'PostNL'], off: ['DPD', 'UPS', 'FedEx', 'GLS', 'Hermes'] },
]
const MARQUEE = ['Amazon', 'eBay', 'Shopify', 'Kaufland', 'METRO', 'OTTO', 'Trendyol', 'n11', 'Ozon', 'idealo', 'JTL-Shop', 'DHL', 'PostNL', 'Billbee', 'Asterbuy', 'Stockist24']
const LANGS = ['Türkçe', 'English', 'Deutsch', 'Français', 'Italiano', 'Español', 'Nederlands', 'Polski', 'Português', '简体中文']

const Cta = ({ href, children, kind = 'solid' }: { href: string; children: ReactNode; kind?: 'solid' | 'ghost' | 'gold' }) => (
  <a href={href} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-[15px] font-semibold no-underline transition-transform hover:-translate-y-0.5 ${
    kind === 'gold' ? 'bg-gold text-navy' : kind === 'solid' ? 'bg-brand text-white' : 'border border-white/25 text-white hover:bg-white/10'}`}>{children}</a>
)

export default function Landing({ dark, setDark }: { dark: boolean; setDark: (f: (d: boolean) => boolean) => void }) {
  const [tab, setTab] = useState(0)
  const [flt, setFlt] = useState<'all' | 'on' | 'off'>('all')
  const [sent, setSent] = useState(false)
  const s = STOCK[tab]
  const onN = CH.reduce((a, g) => a + g.on.length, 0)

  return (
    <div className="landing">
      {/* ---------- üst çubuk ---------- */}
      <header className="sticky top-0 z-40 bg-navy/90 backdrop-blur border-b border-white/10 text-white">
        <div className={`${wrap} h-16 flex items-center gap-6`}>
          <a href="#/" className="text-white no-underline shrink-0" aria-label="WawiERP ana sayfa"><Logo height={30} onDark /></a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/75 flex-1" aria-label="Sayfa bölümleri">
            {[['Stok modeli', 'stok'], ['Özellikler', 'ozellikler'], ['Depodan müşteriye', 'akis'], ['Satış kanalları', 'kanallar']].map(([l, id]) =>
              <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} className="bg-transparent border-0 p-0 text-inherit hover:text-white">{l}</button>)}
          </nav>
          <span className="flex-1 md:hidden" />
          <button onClick={() => setDark(d => !d)} aria-label="Açık / koyu tema" className="size-9 grid place-items-center rounded-full border border-white/20 bg-transparent text-white/80 hover:text-white">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          <a href="#/overview" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-white no-underline rounded-full border border-white/25 px-4 h-9 hover:bg-white/10">Firma girişi <ArrowRight size={14} /></a>
          <button onClick={() => document.getElementById('basvuru')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center text-sm font-semibold rounded-full bg-gold text-navy border-0 px-4 h-9 whitespace-nowrap">Başvuru yap</button>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="hero relative overflow-hidden bg-navy text-white">
        <div className="hero-grid absolute inset-0" aria-hidden="true" />
        <div className="hero-glow absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px]" aria-hidden="true" />
        <div className={`${wrap} relative pt-16 md:pt-24 pb-10 text-center`}>
          <p className={`${kicker} text-gold inline-flex items-center gap-2`}><span className="h-px w-6 bg-gold" />Depo ve pazaryeri yönetimi<span className="h-px w-6 bg-gold" /></p>
          <h1 className="font-display m-0 mt-5 text-[44px] leading-[1.02] sm:text-6xl md:text-7xl font-semibold tracking-[-0.015em] text-balance">Tek panelden<br /><span className="hero-mark">dünyaya satış.</span></h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-lg text-white/70 text-pretty">Ürünlerinizi, stoklarınızı ve siparişlerinizi WawiERP’de bir araya getirin. Almanya ve Türkiye pazaryerlerine, mağazalarınıza ve depolarınıza aynı çalışma alanından yön verin.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Cta href="#/overview" kind="gold">Paneli incele <ArrowRight size={16} /></Cta>
            <button onClick={() => document.getElementById('kanallar')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center rounded-full px-5 h-11 text-[15px] font-semibold border border-white/25 bg-transparent text-white hover:bg-white/10">Kanalları keşfet</button>
          </div>
          <ul className="m-0 mt-7 p-0 list-none flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            {['Çok depo, çok şirket', 'Fiziki · sanal · drop stok', `${onN} bağlı kanal`, '10 dil'].map(t => <li key={t} className="inline-flex items-center gap-1.5"><Check size={14} className="text-gold" />{t}</li>)}
          </ul>
        </div>
        <div className={`${wrap} relative pb-0`}><Preview /></div>
      </section>

      {/* ---------- kanal şeridi ---------- */}
      <div className="border-b border-line bg-card overflow-hidden" aria-label="Bağlı kanallar">
        <div className="marquee flex gap-3 py-4 w-max">
          {[...MARQUEE, ...MARQUEE].map((c, i) => <span key={i} aria-hidden={i >= MARQUEE.length} className="rounded-full border border-line bg-bg px-4 py-1.5 text-sm font-medium text-ink2 whitespace-nowrap">{c}</span>)}
        </div>
      </div>

      {/* ---------- üç stok modeli ---------- */}
      <section id="stok" className={`${wrap} py-20 md:py-28 scroll-mt-16`}>
        <div className="max-w-[640px]">
          <p className={`${kicker} text-brand`}>Üç stok modeli</p>
          <h2 className="font-display m-0 mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-balance">Stok tek bir sayı değildir.</h2>
          <p className="mt-4 text-lg text-ink2 text-pretty">Rafta sayılan, ilana açılan ve tedarikçiden gelen miktar üç ayrı şeydir. WawiERP üçünü ayrı tutar, hepsini aynı siparişe bağlar.</p>
        </div>
        <div role="tablist" aria-label="Stok modeli" className="mt-8 inline-flex rounded-full border border-line bg-card p-1">
          {STOCK.map((x, i) => <button key={x.key} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={`rounded-full border-0 px-4 sm:px-5 h-10 text-sm font-semibold transition-colors ${tab === i ? 'bg-navy text-white' : 'bg-transparent text-ink2 hover:text-ink'}`}>{x.tab}</button>)}
        </div>
        <div className="mt-8 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-center">
          <div>
            <p className={`${kicker} text-mute`}>{String(tab + 1).padStart(2, '0')} · {s.kick}</p>
            <h3 className="font-display m-0 mt-2 text-2xl md:text-[28px] leading-tight font-semibold tracking-[-0.01em]">{s.title}</h3>
            <p className="mt-3 text-ink2 text-[16px]">{s.text}</p>
            <ul className="m-0 mt-5 p-0 list-none space-y-2.5">
              {s.points.map(p => <li key={p} className="flex gap-2.5 text-[15px]"><span className="mt-0.5 size-5 rounded-full bg-brand-soft text-brand grid place-items-center shrink-0"><Check size={12} /></span>{p}</li>)}
            </ul>
          </div>
          {/* akış şeması: kaynak → WawiERP → kanallar */}
          <div className="rounded-3xl border border-line bg-card p-5 md:p-7">
            <div className="grid md:grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-3 md:gap-0">
              <div className="rounded-2xl bg-navy text-white p-4">
                <div className="text-[11px] uppercase tracking-wider text-gold font-semibold">Stok kaynağı</div>
                <div className="font-display text-xl font-semibold mt-0.5">{s.tab}</div>
                <div className="text-xs text-white/60">{s.card.label}</div>
                <dl className="m-0 mt-3 space-y-1.5 text-sm">
                  {s.card.rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-t border-white/10 pt-1.5"><dt className="text-white/65">{k}</dt><dd className="m-0 font-semibold num">{v}</dd></div>)}
                </dl>
              </div>
              <span className="flow-line md:w-10 lg:w-14" aria-hidden="true" />
              <div className="mx-auto size-[92px] rounded-[26px] bg-brand grid place-items-center shadow-[0_18px_40px_-14px_var(--brand)]"><Logo height={50} markOnly /></div>
              <span className="flow-line md:w-10 lg:w-14" aria-hidden="true" />
              <ul className="m-0 p-0 list-none space-y-2">
                {(['amazon', 'ebay', 'kaufland', 'shopify'] as const).map((c, i) => (
                  <li key={c} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-bg px-3 py-2">
                    <span className="inline-flex items-center gap-2 font-medium"><span className="size-2.5 rounded-full" style={{ background: CHANNEL[c].color }} />{CHANNEL[c].label}</span>
                    <span className="num text-sm text-ink2">{[119, 119, 40, 86][(i + tab) % 4]} adet</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="m-0 mt-4 text-xs text-mute">Örnek veriler. Kanala giden adet, seçilen kaynağa ve kanal kuralına göre hesaplanır.</p>
          </div>
        </div>
      </section>

      {/* ---------- özellikler ---------- */}
      <section id="ozellikler" className="bg-card border-y border-line scroll-mt-16">
        <div className={`${wrap} py-20 md:py-28`}>
          <div className="max-w-[640px]">
            <p className={`${kicker} text-brand`}>Wawi ile neler yapabilirsiniz?</p>
            <h2 className="font-display m-0 mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-balance">Stoktan teslimata, tek çalışma alanı.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <article key={f.title} className={`group rounded-3xl border border-line bg-bg p-6 transition-colors hover:border-brand ${f.span ?? ''}`}>
                <span className="size-11 rounded-2xl bg-brand-soft text-brand grid place-items-center transition-colors group-hover:bg-brand group-hover:text-white"><f.icon size={20} /></span>
                <h3 className="font-display m-0 mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="m-0 mt-1.5 text-ink2 text-[15px] text-pretty">{f.text}</p>
              </article>
            ))}
            <article className="rounded-3xl bg-navy text-white p-6 md:col-span-3 grid md:grid-cols-[auto_1fr_auto] items-center gap-5">
              <span className="size-11 rounded-2xl bg-white/10 text-gold grid place-items-center"><Smartphone size={20} /></span>
              <div><h3 className="font-display m-0 text-xl font-semibold">Mobil ve API</h3><p className="m-0 mt-1 text-white/70 text-[15px]">Panel telefonda tarayıcıdan çalışır; barkod akışları dahil. iOS ve Android uygulaması henüz yayında değil, API altyapısı hazır.</p></div>
              <span className="inline-flex gap-2 text-xs"><span className="rounded-full bg-white/10 px-3 py-1.5 inline-flex items-center gap-1.5"><ScanBarcode size={13} />Barkod</span><span className="rounded-full bg-white/10 px-3 py-1.5 inline-flex items-center gap-1.5"><KeyRound size={13} />API</span></span>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- depodan müşteriye ---------- */}
      <section id="akis" className={`${wrap} py-20 md:py-28 scroll-mt-16`}>
        <div className="max-w-[640px]">
          <p className={`${kicker} text-brand`}>Depodan müşteriye</p>
          <h2 className="font-display m-0 mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.02em]">Beş adım, tek akış.</h2>
        </div>
        <ol className="m-0 mt-10 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-0">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative lg:pr-6">
              <div className="flex items-center gap-3">
                <span className="font-display size-11 rounded-full bg-navy text-gold grid place-items-center text-lg font-semibold shrink-0">{i + 1}</span>
                {i < STEPS.length - 1 && <span className="hidden lg:block flow-line flex-1" aria-hidden="true" />}
              </div>
              <h3 className="font-display m-0 mt-4 text-lg font-semibold">{t}</h3>
              <p className="m-0 mt-1 text-ink2 text-[15px] text-pretty">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- kanallar ---------- */}
      <section id="kanallar" className="bg-card border-y border-line scroll-mt-16">
        <div className={`${wrap} py-20 md:py-28`}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[640px]">
              <p className={`${kicker} text-brand`}>Satış kanalları</p>
              <h2 className="font-display m-0 mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-balance">Nerede satış yapmak istiyorsunuz?</h2>
              <p className="mt-4 text-lg text-ink2 text-pretty">Bugün çalışan bağlantıyı ve sizin için kurulabilecek olanı açıkça ayırıyoruz.</p>
            </div>
            <div role="tablist" aria-label="Kanal süzgeci" className="inline-flex rounded-full border border-line bg-bg p-1">
              {([['all', 'Tümü'], ['on', `Wawi’de mevcut · ${onN}`], ['off', 'Kurulum talebi']] as const).map(([k, l]) =>
                <button key={k} role="tab" aria-selected={flt === k} onClick={() => setFlt(k)} className={`rounded-full border-0 px-4 h-9 text-sm font-semibold ${flt === k ? 'bg-navy text-white' : 'bg-transparent text-ink2'}`}>{l}</button>)}
            </div>
          </div>
          <div className="mt-10 space-y-8">
            {CH.map(g => (
              <div key={g.group} className="grid md:grid-cols-[180px_1fr] gap-3 md:gap-6">
                <h3 className="font-display m-0 text-lg font-semibold md:pt-1.5">{g.group}</h3>
                <ul className="m-0 p-0 list-none flex flex-wrap gap-2">
                  {flt !== 'off' && g.on.map(c => <li key={c} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft text-brand px-3.5 py-1.5 text-sm font-semibold"><span className="size-1.5 rounded-full bg-brand" />{c}</li>)}
                  {flt !== 'on' && g.off.map(c => <li key={c} className="rounded-full border border-dashed border-line text-ink2 px-3.5 py-1.5 text-sm">{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="m-0 mt-8 text-sm text-mute">Dolu rozet: bugün çalışan bağlantı. Kesik çizgili rozet: başvuruda işaretlerseniz kurulumu planlanır. Kullanılabilir işlemler platform bağlantısına göre değişir.</p>
        </div>
      </section>

      {/* ---------- başvuru ---------- */}
      <section id="basvuru" className="bg-navy text-white scroll-mt-16 relative overflow-hidden">
        <div className="hero-glow absolute -bottom-60 -right-40 w-[700px] h-[500px]" aria-hidden="true" />
        <div className={`${wrap} relative py-20 md:py-24 grid lg:grid-cols-2 gap-10 items-start`}>
          <div>
            <p className={`${kicker} text-gold`}>Başvuru</p>
            <h2 className="font-display m-0 mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-balance">Önce işinizi dinleyelim, sonra kuralım.</h2>
            <p className="mt-4 text-lg text-white/70 text-pretty">Kayıt kendiliğinden açılmaz. Başvurunuzu inceler, depo ve kanal yapınıza göre kurulum görüşmesi yaparız.</p>
            <ol className="m-0 mt-7 p-0 list-none space-y-3 text-white/80">
              {['Başvuru: şirket, ülke, ilk depo ve kanallar', 'İnceleme ve kurulum görüşmesi', 'Depo, şirket ve kanal hesaplarının açılması'].map((t, i) => <li key={t} className="flex gap-3"><span className="font-display size-7 rounded-full border border-gold/50 text-gold grid place-items-center text-sm shrink-0">{i + 1}</span>{t}</li>)}
            </ol>
          </div>
          <form className="rounded-3xl bg-white/[0.06] border border-white/15 p-6 md:p-7 space-y-4" onSubmit={e => { e.preventDefault(); setSent(true) }}>
            {sent ? (
              <div className="py-10 text-center" role="status">
                <span className="size-14 rounded-full bg-gold text-navy grid place-items-center mx-auto"><PackageCheck size={26} /></span>
                <h3 className="font-display m-0 mt-4 text-2xl font-semibold">Bu bir tasarım önerisi</h3>
                <p className="mt-2 text-white/70">Form hiçbir yere gönderilmedi ve hiçbir bilgi kaydedilmedi.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-3 bg-transparent border-0 text-gold underline">Forma dön</button>
              </div>
            ) : <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Şirket adı" name="company" required /><Field label="Yetkili kişi" name="person" required />
                <Field label="E-posta" name="email" type="email" required />
                <label className="block text-sm text-white/70">Ülke
                  <select name="country" className="mt-1 w-full h-11 rounded-xl border border-white/20 bg-navy px-3 text-white"><option>Almanya</option><option>Türkiye</option><option>Hollanda</option><option>Diğer</option></select>
                </label>
              </div>
              <Field label="İlk depo (şehir)" name="warehouse" />
              <fieldset className="border-0 p-0 m-0"><legend className="text-sm text-white/70 p-0">Kanallar</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Amazon', 'eBay', 'Kaufland', 'OTTO', 'METRO', 'Shopify', 'Trendyol', 'n11'].map(c => <label key={c} className="chip cursor-pointer"><input type="checkbox" name="channels" value={c} className="sr-only peer" /><span className="inline-block rounded-full border border-white/25 px-3.5 py-1.5 text-sm peer-checked:bg-gold peer-checked:text-navy peer-checked:border-gold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold">{c}</span></label>)}
                </div>
              </fieldset>
              <button type="submit" className="w-full h-12 rounded-full border-0 bg-gold text-navy font-semibold text-[15px] inline-flex items-center justify-center gap-2">Başvuruyu gönder <ArrowRight size={16} /></button>
              <p className="m-0 text-xs text-white/50">Bilgilerinizi yalnız başvuruyu değerlendirmek ve kurulum için sizinle iletişim kurmak amacıyla kullanırız.</p>
            </>}
          </form>
        </div>
      </section>

      {/* ---------- alt bilgi ---------- */}
      <footer className="bg-bg">
        <div className={`${wrap} py-12 grid md:grid-cols-[1.2fr_1fr_1fr] gap-8`}>
          <div><Logo height={32} /><p className="mt-3 text-ink2 max-w-[36ch]">Depolar, ürünler ve satış kanalları için tek çalışma alanı.</p>
            <a href="#/overview" className="inline-flex items-center gap-1.5 mt-2 text-brand font-semibold no-underline">Firma girişi <ArrowRight size={14} /></a></div>
          <div><h3 className={`${kicker} text-mute m-0`}>Diller</h3><ul className="m-0 mt-3 p-0 list-none grid grid-cols-2 gap-y-1.5 text-sm text-ink2">{LANGS.map(l => <li key={l} className="inline-flex items-center gap-1.5"><Globe2 size={12} className="text-mute" />{l}</li>)}</ul></div>
          <div><h3 className={`${kicker} text-mute m-0`}>Yasal</h3><ul className="m-0 mt-3 p-0 list-none space-y-1.5 text-sm text-ink2">{['Impressum', 'Datenschutz / Gizlilik', 'KVKK aydınlatma metni', 'Fiyatlandırma'].map(l => <li key={l} className="flex items-center gap-2">{l}<span className="rounded-full bg-warn-soft text-warn text-[10px] font-semibold px-2 py-0.5">eklenecek</span></li>)}</ul></div>
        </div>
        <div className="border-t border-line"><div className={`${wrap} py-4 flex flex-wrap justify-between gap-2 text-xs text-mute`}><span>© 2026 WawiERP</span><span>Tasarım önerisi · mock. Yalnız Türkçe çizildi; diğer diller gerçek sitede.</span></div></div>
      </footer>
    </div>
  )
}

const Field = ({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) => (
  <label className="block text-sm text-white/70">{label}
    <input name={name} type={type} required={required} className="mt-1 w-full h-11 rounded-xl border border-white/20 bg-white/5 px-3 text-white placeholder:text-white/30" />
  </label>
)

/* Hero'daki ürün önizlemesi: mock panelin gerçek verisinden çizilir. */
function Preview() {
  const m = useMemo(() => {
    const today = dayKey(NOW), days = new Map<string, number>()
    for (let i = 29; i >= 0; i--) days.set(dayKey(NOW - i * 86400_000), 0)
    let n = 0, eur = 0
    for (const o of ORDERS0) { const k = dayKey(o.t); if (days.has(k)) days.set(k, days.get(k)! + 1); if (k === today) { n++; if (o.cur === 'EUR') eur += o.total } }
    return { n, eur, bars: [...days.values()], ship: ORDERS0.filter(toShip).length, rows: ORDERS0.slice(0, 5) }
  }, [])
  const max = Math.max(...m.bars)
  return (
    <div className="preview relative mx-auto max-w-[1000px]">
      <div className="float-a hidden md:flex absolute -left-10 -top-7 z-10 items-center gap-2.5 rounded-2xl bg-white text-navy px-3.5 py-2.5 shadow-2xl text-sm">
        <span className="size-8 rounded-full bg-[#e3e7fb] text-[#3048c8] grid place-items-center"><ShoppingCart size={15} /></span>
        <span><b className="block font-semibold leading-tight">Yeni sipariş</b><span className="text-[#454e80] text-xs">eBay · €64,90</span></span>
      </div>
      <div className="float-b hidden md:flex absolute -right-6 top-44 z-10 items-center gap-2.5 rounded-2xl bg-white text-navy px-3.5 py-2.5 shadow-2xl text-sm">
        <span className="size-8 rounded-full bg-[#fff4d8] text-[#9a6500] grid place-items-center"><Boxes size={15} /></span>
        <span><b className="block font-semibold leading-tight">Stok defteri −1</b><span className="text-[#454e80] text-xs">Almanya · raf A-3-2</span></span>
      </div>
      <div className="rounded-t-2xl border border-b-0 border-white/15 bg-card text-ink shadow-[0_-30px_120px_-30px_rgba(48,72,200,0.7)] overflow-hidden text-left">
        <div className="flex items-center gap-1.5 px-4 h-9 border-b border-line bg-bg">
          <span className="size-2.5 rounded-full bg-[#ee6a5f]" /><span className="size-2.5 rounded-full bg-[#f5bd4f]" /><span className="size-2.5 rounded-full bg-[#61c454]" />
          <span className="ml-3 text-xs text-mute">WawiERP · Genel bakış</span>
        </div>
        <div className="grid md:grid-cols-[150px_1fr]">
          <aside className="hidden md:block border-r border-line p-3 space-y-1 text-[13px] text-ink2">
            {[['Genel bakış', BarChart3, true], ['Siparişler', ShoppingCart, false], ['Katalog', Layers, false], ['Stok defteri', Boxes, false], ['Kanallar', Globe2, false], ['Faturalar', FileText, false]].map(([l, I, on]) => { const Ic = I as typeof Boxes; return (
              <div key={l as string} className={`flex items-center gap-2 rounded-md px-2 h-7 ${on ? 'bg-brand-soft text-brand font-medium' : ''}`}><Ic size={14} />{l as string}</div>) })}
          </aside>
          <div className="p-4 space-y-3 min-w-0">
            <div className="grid grid-cols-3 gap-3">
              {[['Bugün gelen sipariş', fmtNum(m.n), fmtMoney(m.eur, 'EUR', 0)], ['Gönderilecek', fmtNum(m.ship), 'Ödemesi tamam'], ['Bağlı hesap', '24', 'Pazaryeri ve mağaza']].map(([l, v, h]) => (
                <div key={l} className="rounded-xl border border-line px-3 py-2.5 min-w-0"><div className="text-[11px] text-mute truncate">{l}</div><div className="num font-display text-2xl font-semibold leading-tight">{v}</div><div className="text-[11px] text-ink2 truncate">{h}</div></div>))}
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="text-xs font-semibold mb-2">Günlük sipariş · son 30 gün</div>
              <div className="flex items-end gap-[3px] h-20">{m.bars.map((b, i) => <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(4, (b / max) * 100)}%`, background: i === m.bars.length - 1 ? 'var(--gold-deep)' : 'var(--brand)' }} />)}</div>
            </div>
            <ul className="m-0 p-0 list-none rounded-xl border border-line divide-y divide-line text-[13px]">
              {m.rows.map(o => { const a = account(o.acc); return (
                <li key={o.id} className="px-3 py-1.5 flex items-center gap-3">
                  <span className="num font-medium w-[86px] shrink-0">{o.no}</span>
                  <span className="inline-flex items-center gap-1.5 min-w-0 flex-1"><span className="size-2 rounded-full shrink-0" style={{ background: CHANNEL[a.type].color }} /><span className="truncate">{CHANNEL[a.type].label} · <span className="text-mute">{a.name}</span></span></span>
                  <span className="hidden sm:inline text-mute num">{fmtDT(o.t)}</span>
                  <span className="num w-[72px] text-right">{fmtMoney(o.total, o.cur)}</span>
                </li>) })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
