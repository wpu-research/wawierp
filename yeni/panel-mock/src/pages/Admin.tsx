import { useState } from 'react'
import { Check, Eye, Minus } from 'lucide-react'
import { STAFF, fmtDT, fmtNum } from '../data'
import { useStore } from '../store'
import { Badge, Card, Empty, PageHead, td, th } from '../ui'

const MODS = ['Siparişler', 'Kargo', 'Katalog', 'Stok', 'Kanallar', 'Finans', 'Yönetim', 'Müşteri adresi', 'Müşteri iletişimi']
// t = tam, g = görüntüle, - = yok. Öneri; sahibi onaylamadı.
const MATRIX: [string, string][] = [
  ['Sistem yöneticisi', 'ttttttttt'], ['Depo sorumlusu', 'ttttg--tg'], ['Depo çalışanı', 'gtgt---t-'],
  ['Wawi operasyon', 'tgttt--t-'], ['Ürün giriş operatörü', '--tg-----'], ['Kategori sorumlusu', '--tg-----'], ['Muhasebe (öneri)', 'g----t-tt'],
]

export function Team() {
  return (
    <>
      <PageHead title="Ekip ve yetki" desc="Her çalışanın kendi hesabı vardır; yetki rol, depo kapsamı ve modülden oluşur. Müşteri verisi ayrı bir izindir."
        legacy={['team', 'pin-permissions']} />
      <div className="grid xl:grid-cols-5 gap-3">
        <Card pad={false} title={`Çalışanlar (${STAFF.length} · mock)`} className="xl:col-span-2">
          <ul className="m-0 p-0 list-none divide-y divide-line border-t border-line">
            {STAFF.map(s => (
              <li key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="size-8 rounded-full bg-brand-soft text-brand grid place-items-center text-xs font-semibold shrink-0">{s.ini}</span>
                <div className="min-w-0 flex-1"><div className="font-medium truncate">{s.name}</div><div className="text-xs text-mute truncate">{s.role} · {s.scope}</div></div>
                <Badge tone="ok">İki adım açık</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card pad={false} title="Rol × modül matrisi" className="xl:col-span-3" right={<Badge tone="warn">Öneri · onay bekliyor</Badge>}>
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full border-collapse text-sm">
              <thead><tr><th className={th}>Rol</th>{MODS.map(m => <th key={m} className={th + ' text-center !whitespace-normal min-w-[64px]'}>{m}</th>)}</tr></thead>
              <tbody>{MATRIX.map(([r, v]) => (
                <tr key={r}><td className={td + ' font-medium whitespace-nowrap'}>{r}</td>
                  {[...v].map((c, i) => <td key={i} className={td + ' text-center'}>
                    {c === 't' ? <Check size={15} className="inline text-ok" aria-label="Tam yetki" /> : c === 'g' ? <Eye size={15} className="inline text-brand" aria-label="Görüntüleme" /> : <Minus size={15} className="inline text-line" aria-label="Yetki yok" />}
                  </td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="m-0 px-4 py-2.5 text-xs text-mute flex flex-wrap gap-x-4 gap-y-1"><span><Check size={12} className="inline text-ok" /> tam</span><span><Eye size={12} className="inline text-brand" /> görüntüle</span><span><Minus size={12} className="inline" /> yok</span><span>Üst çubuktaki “Rol” seçimiyle üç rolün menüsü denenebilir.</span></p>
        </Card>
      </div>
    </>
  )
}

export function AuditLog() {
  const { audit } = useStore()
  const [noise, setNoise] = useState(false)
  const rows = audit.filter(a => noise || !a.routine)
  const hidden = audit.filter(a => a.routine).reduce((s, a) => s + (a.routine ?? 0), 0)
  return (
    <>
      <PageHead title="Denetim kaydı" desc="Kim, neyi, ne zaman yaptı. Kullanıcı adıyla yazılır; rutin sistem çağrıları gruplanır ki gerçek olaylar gürültüde kaybolmasın."
        legacy={['audit-logs']} />
      <Card pad={false}>
        <div className="p-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={noise} onChange={e => setNoise(e.target.checked)} />Rutin sistem çağrılarını göster</label>
          {!noise && <span className="text-xs text-mute num">{fmtNum(hidden)} rutin çağrı gruplanıp gizlendi</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className={th}>Zaman</th><th className={th}>Sonuç</th><th className={th}>Kategori</th><th className={th}>Olay</th><th className={th}>Kullanıcı</th><th className={th}>Nesne</th></tr></thead>
            <tbody>{rows.map(a => (
              <tr key={a.id} className="hover:bg-bg">
                <td className={td + ' num whitespace-nowrap'}>{fmtDT(a.t)}</td>
                <td className={td}><Badge tone={a.result === 'başarılı' ? 'ok' : a.result === 'hata' ? 'bad' : 'warn'}>{a.result}</Badge></td>
                <td className={td}>{a.cat === 'Kişisel veri' ? <Badge tone="violet">{a.cat}</Badge> : a.cat}</td>
                <td className={td}>{a.event}{a.routine && <span className="text-mute num"> ×{fmtNum(a.routine)}</span>}</td>
                <td className={td + ' whitespace-nowrap'}>{a.user}</td>
                <td className={td + ' text-ink2 num'}>{a.obj}</td>
              </tr>
            ))}</tbody>
          </table>
          {rows.length === 0 && <Empty>Kayıt yok.</Empty>}
        </div>
      </Card>
    </>
  )
}
