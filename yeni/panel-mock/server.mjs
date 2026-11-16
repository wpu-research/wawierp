// Ana sayfa (/) ve sunum (/sunum/) herkese açık; panel (/panel) şifreli. PANEL_PASSWORD yoksa panel gösterilmez.
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { createHash, timingSafeEqual } from 'node:crypto'
import { brotliCompressSync, gzipSync, constants as zc } from 'node:zlib'
import { assistantStatus, handleAssistant, handleContent } from './assistant.mjs'

const home = readFileSync(new URL('./dist/index.html', import.meta.url))
const panel = readFileSync(new URL('./dist/panel.html', import.meta.url))
// İki sayfa açılışta bir kez sıkıştırılır (≈%66-70 küçülür); istek başına sıkıştırma maliyeti yoktur.
const packed = b => ({ raw: b, br: brotliCompressSync(b, { params: { [zc.BROTLI_PARAM_QUALITY]: 9 } }), gz: gzipSync(b, { level: 9 }) })
const homeZ = packed(home), panelZ = packed(panel)
const sendPage = (req, res, head, z) => {
  // q=0 olan kodlama istenmemiş sayılır.
  const ok = new Set(String(req.headers['accept-encoding'] || '').split(',').map(x => x.trim().toLowerCase()).filter(x => !/;\s*q=0(\.0*)?$/.test(x)).map(x => x.split(';')[0]))
  const br = ok.has('br'), gz = ok.has('gzip')
  const body = br ? z.br : gz ? z.gz : z.raw
  res.writeHead(200, { ...head, Vary: 'Accept-Encoding', 'Content-Length': body.length, ...(br ? { 'Content-Encoding': 'br' } : gz ? { 'Content-Encoding': 'gzip' } : {}) })
  res.end(req.method === 'HEAD' ? undefined : body)
}
// Sunum dosyaları açılışta listelenir; istek yalnız bu listedeki adlarla eşleşir (klasör dışına çıkılamaz).
const TYPES = { html: 'text/html; charset=utf-8', jpg: 'image/jpeg', mp4: 'video/mp4' }
const deckDir = fileURLToPath(new URL('./sunum/', import.meta.url))
const deck = new Map()
if (existsSync(deckDir)) for (const f of readdirSync(deckDir, { recursive: true })) {
  const rel = String(f).replaceAll('\\', '/'), full = join(deckDir, rel), type = TYPES[rel.split('.').pop()]
  if (type && statSync(full).isFile()) deck.set('/sunum/' + rel, { full, type, size: statSync(full).size })
}
// Dosya okunurken hata olursa (silinmiş, okunamıyor) bağlantı kapanır; yakalanmayan hata süreci düşürürdü.
// İstemci kopunca (video sarılırken sık olur) dosya tanıtıcısı da kapatılır; pipe tek başına kaynağı kapatmaz.
const stream = (res, f, range) => {
  const rs = createReadStream(f.full, range).on('error', e => { console.error('sunum dosyası:', e.code || e.message); res.destroy() })
  res.on('close', () => rs.destroy())
  return rs.pipe(res)
}
function sendDeck(req, res, base, f) {
  const head = { ...base, 'Content-Type': f.type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=300' }
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
  if (!m || (!m[1] && !m[2])) {
    res.writeHead(200, { ...head, 'Content-Length': f.size })
    return req.method === 'HEAD' ? res.end() : stream(res, f)
  }
  // Video ileri geri sarılabilsin diye parça isteği desteklenir.
  const start = m[1] ? +m[1] : Math.max(0, f.size - +m[2]), end = m[1] && m[2] ? Math.min(+m[2], f.size - 1) : f.size - 1
  if (start > end || start >= f.size) return res.writeHead(416, { ...head, 'Content-Range': `bytes */${f.size}` }).end()
  res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${f.size}`, 'Content-Length': end - start + 1 })
  return req.method === 'HEAD' ? res.end() : stream(res, f, { start, end })
}

const user = process.env.PANEL_USER || 'wawi'
const pass = process.env.PANEL_PASSWORD || ''
// Karşılaştırma iki tarafın özeti üzerinden yapılır: süre, şifrenin uzunluğunu da ele vermez.
const digest = b => createHash('sha256').update(b).digest()
const expected = digest(`${user}:${pass}`)
const ok = h => {
  const m = /^basic +(\S+)$/i.exec(h || '')
  return !!pass && !!m && timingSafeEqual(digest(Buffer.from(m[1], 'base64')), expected)
}

// Tarayıcı güvenlik başlıkları. Sayfalar tek dosyaya gömülü betik ve stil kullandığı için 'unsafe-inline' gerekir;
// yine de dışarıya veri gönderme (connect/img/form) ve başka sitede çerçeveye alınma kapalıdır.
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy': [
    "default-src 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:", "img-src 'self' data: blob:", "media-src 'self'", "connect-src 'self'",
    "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'",
  ].join('; '),
}

// Yanlış şifre sınırı: aynı adresten 10 dakikada 20 yanlış denemeden sonra o adres, süre dolana kadar 429 alır
// (doğru şifreyle bile; yoksa deneme sürerdi). Sayaç bellekte durur, yeniden başlatmada sıfırlanır.
const FAIL_MAX = 20, FAIL_WINDOW = 10 * 60_000
const fails = new Map()
// Ziyaretçi adresi: Railway bunu X-Real-IP başlığıyla verir (belgesinde yazan tek başlık). Yoksa x-forwarded-for listesinin
// son öğesi (ilk öğeyi istemci kendisi yazabilir), o da yoksa bağlantının adresi. Adres yanlış belirlenirse herkes tek adres
// sayılır ve bir kişinin yanlış denemeleri paneli herkese kapatır; bu yüzden sıra önemlidir.
const clientIp = req => String(req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',').pop() || req.socket.remoteAddress || '').trim()
const recent = ip => (fails.get(ip) || []).filter(t => Date.now() - t < FAIL_WINDOW)
const lockedFor = ip => { const f = recent(ip); return f.length >= FAIL_MAX ? Math.ceil((f[0] + FAIL_WINDOW - Date.now()) / 1000) : 0 }
// Kayıt büyürse önce süresi dolanlar, yetmezse en eski kayıtlar silinir. Toptan silmek, çok adresli birinin kilitleri kaldırmasına yarardı.
const prune = () => {
  for (const ip of fails.keys()) if (!recent(ip).length) fails.delete(ip)
  for (const ip of fails.keys()) { if (fails.size <= 4000) break; if (!lockedFor(ip)) fails.delete(ip) }
}
const noteFail = ip => { if (fails.size > 5000) prune(); fails.set(ip, [...recent(ip), Date.now()]) }
// Yalnız şifre gönderilmiş ama yanlış olan istek sayılır; şifresiz ilk istek (tarayıcının giriş penceresi) sayılmaz.
const gate = (req, ip) => {
  const wait = lockedFor(ip)
  if (wait) return wait
  if (ok(req.headers.authorization)) return 0
  if (req.headers.authorization) noteFail(ip)
  return -1
}
const json = (res, base, code, body, extra = {}) => res.writeHead(code, { ...base, ...extra, 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body))
const MSG_LOCK = 'Çok fazla yanlış deneme; biraz sonra yeniden deneyin.'
// API uçları her zaman JSON döner (istemci mesajı okuyabilsin); panel sayfası düz metin.
const tooMany = (res, base, wait, api = false) => api
  ? json(res, base, 429, { message: MSG_LOCK, retryAfter: wait }, { 'Retry-After': wait })
  : res.writeHead(429, { ...base, 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': wait }).end(MSG_LOCK)
// Başka bir sitedeki sayfa, tarayıcıda açık panel oturumunu kullanıp asistan çağrısı (ve maliyeti) yaptıramasın:
// gövde yalnız JSON içerik türüyle kabul edilir ve Origin varsa Host ile aynı olmalıdır.
const sameOrigin = req => { const o = req.headers.origin; if (!o) return true; try { return new URL(o).host === req.headers.host } catch { return false } }
const isJson = req => /^application\/json\b/i.test(req.headers['content-type'] || '')

const server = createServer((req, res) => handle(req, res).catch(e => {
  console.error('istek hatası:', e)
  if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Sunucu hatası')
  else res.destroy()
}))
async function handle(req, res) {
  const base = { ...SECURITY, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }
  // new URL() bozuk adreste hata fırlatır ve süreci düşürür; sorgu kısmını elle ayırıyoruz.
  const path = (req.url || '/').split(/[?#]/)[0]
  if (path === '/healthz') return res.writeHead(200, base).end('ok')
  const page = { 'Content-Type': 'text/html; charset=utf-8' }
  if (path === '/') return sendPage(req, res, { ...base, ...page }, homeZ)
  // Asistan ucu panelle aynı şifrenin arkasındadır; anahtar yalnız sunucuda durur.
  if (path === '/api/assistant' || path === '/api/content') {
    if (!pass) return json(res, base, 503, { live: false, message: 'PANEL_PASSWORD ayarlanmamış' })
    const g = gate(req, clientIp(req))
    if (g > 0) return tooMany(res, base, g, true)
    if (g) return json(res, base, 401, { message: 'Giriş gerekli' })
    if (req.method === 'GET') return json(res, base, 200, assistantStatus())
    if (req.method !== 'POST') return json(res, base, 405, { message: 'Yöntem desteklenmiyor' })
    if (!sameOrigin(req) || !isJson(req)) return json(res, base, 403, { message: 'İstek reddedildi' })
    try {
      const ip = clientIp(req)
      const [code, body] = await (path === '/api/content' ? handleContent : handleAssistant)(req, ip)
      return json(res, base, code, body)
    } catch (e) { console.error('assistant route:', e); return json(res, base, 500, { message: 'Asistan beklenmeyen bir hata verdi.' }) }
  }
  const slide = path === '/sunum' ? null : deck.get(path === '/sunum/' ? '/sunum/index.html' : path)
  if (path === '/sunum' && deck.size) return res.writeHead(302, { ...base, Location: '/sunum/' }).end()
  if (slide) return sendDeck(req, res, base, slide)
  if (path !== '/panel' && path !== '/panel/') return res.writeHead(302, { ...base, Location: '/' }).end()
  if (!pass) return res.writeHead(503, base).end('PANEL_PASSWORD ayarlanmamış')
  const g = gate(req, clientIp(req))
  if (g > 0) return tooMany(res, base, g)
  if (g) return res.writeHead(401, { ...base, 'Content-Type': 'text/plain; charset=utf-8', 'WWW-Authenticate': 'Basic realm="WawiERP mock"' }).end('Giriş gerekli')
  sendPage(req, res, { ...base, ...page }, panelZ)
}
// Yönlendirici (proxy) bağlantıyı bizden uzun açık tutarsa ara sıra 502 görülür; Node'un 5 sn varsayılanı bunun için kısa.
server.keepAliveTimeout = 65_000
server.headersTimeout = 66_000
// Port kullanımdaysa (EADDRINUSE) sağlıksız ama canlı bir süreç kalmasın: çık, Railway yeniden başlatsın.
server.on('error', e => { console.error('sunucu hatası:', e); process.exit(1) })
server.listen(process.env.PORT || 3000, '0.0.0.0')
// Her yayında Railway SIGTERM gönderir: yeni bağlantı almayı bırak, süren istekleri (asistan, video) bitirsin, takılırsa 10 sn sonra çık.
let closing = false
const shutdown = sig => {
  if (closing) return
  closing = true; console.log(sig + ' alındı, kapanıyor')
  server.close(() => process.exit(0)); server.closeIdleConnections?.()
  setTimeout(() => process.exit(0), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'))
// Beklenmeyen bir hata tek bir isteği değil süreci düşürmesin; hata günlüğe yazılır.
process.on('uncaughtException', e => console.error('yakalanmayan hata:', e))
process.on('unhandledRejection', e => console.error('yakalanmayan söz:', e))
