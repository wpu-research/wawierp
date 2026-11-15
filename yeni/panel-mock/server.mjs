// Ana sayfa (/) ve sunum (/sunum/) herkese açık; panel (/panel) şifreli. PANEL_PASSWORD yoksa panel gösterilmez.
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { createHash, timingSafeEqual } from 'node:crypto'
import { assistantStatus, handleAssistant, handleContent } from './assistant.mjs'

const home = readFileSync(new URL('./dist/index.html', import.meta.url))
const panel = readFileSync(new URL('./dist/panel.html', import.meta.url))
// Sunum dosyaları açılışta listelenir; istek yalnız bu listedeki adlarla eşleşir (klasör dışına çıkılamaz).
const TYPES = { html: 'text/html; charset=utf-8', jpg: 'image/jpeg', mp4: 'video/mp4' }
const deckDir = fileURLToPath(new URL('./sunum/', import.meta.url))
const deck = new Map()
if (existsSync(deckDir)) for (const f of readdirSync(deckDir, { recursive: true })) {
  const rel = String(f).replaceAll('\\', '/'), full = join(deckDir, rel), type = TYPES[rel.split('.').pop()]
  if (type && statSync(full).isFile()) deck.set('/sunum/' + rel, { full, type, size: statSync(full).size })
}
// Dosya okunurken hata olursa (silinmiş, okunamıyor) bağlantı kapanır; yakalanmayan hata süreci düşürürdü.
const stream = (res, f, range) => createReadStream(f.full, range).on('error', e => { console.error('sunum dosyası:', e.code || e.message); res.destroy() }).pipe(res)
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
    "default-src 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:", "img-src 'self' data: blob:", "media-src 'self'", "connect-src 'self'",
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
const tooMany = (res, base, wait) => res.writeHead(429, { ...base, 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': wait }).end('Çok fazla yanlış deneme; biraz sonra yeniden deneyin.')

const json = (res, base, code, body) => res.writeHead(code, { ...base, 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body))

createServer(async (req, res) => {
  const base = { ...SECURITY, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }
  if (req.url === '/healthz') return res.writeHead(200, base).end('ok')
  // new URL() bozuk adreste hata fırlatır ve süreci düşürür; sorgu kısmını elle ayırıyoruz.
  const path = (req.url || '/').split(/[?#]/)[0]
  const page = { 'Content-Type': 'text/html; charset=utf-8' }
  if (path === '/') return res.writeHead(200, { ...base, ...page }).end(home)
  // Asistan ucu panelle aynı şifrenin arkasındadır; anahtar yalnız sunucuda durur.
  if (path === '/api/assistant' || path === '/api/content') {
    if (!pass) return json(res, base, 503, { live: false, message: 'PANEL_PASSWORD ayarlanmamış' })
    const g = gate(req, clientIp(req))
    if (g > 0) return tooMany(res, base, g)
    if (g) return json(res, base, 401, { message: 'Giriş gerekli' })
    if (req.method === 'GET') return json(res, base, 200, assistantStatus())
    if (req.method !== 'POST') return json(res, base, 405, { message: 'Yöntem desteklenmiyor' })
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
  res.writeHead(200, { ...base, ...page }).end(panel)
}).listen(process.env.PORT || 3000, '0.0.0.0')
