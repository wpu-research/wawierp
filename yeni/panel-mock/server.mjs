// Ana sayfa (/) herkese açık; panel (/panel) ve sunum (/sunum/) şifreli. PANEL_PASSWORD yoksa ikisi de gösterilmez.
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { timingSafeEqual } from 'node:crypto'
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
function sendDeck(req, res, base, f) {
  const head = { ...base, 'Content-Type': f.type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=300' }
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
  if (!m || (!m[1] && !m[2])) {
    res.writeHead(200, { ...head, 'Content-Length': f.size })
    return req.method === 'HEAD' ? res.end() : createReadStream(f.full).pipe(res)
  }
  // Video ileri geri sarılabilsin diye parça isteği desteklenir.
  const start = m[1] ? +m[1] : Math.max(0, f.size - +m[2]), end = m[1] && m[2] ? Math.min(+m[2], f.size - 1) : f.size - 1
  if (start > end || start >= f.size) return res.writeHead(416, { ...head, 'Content-Range': `bytes */${f.size}` }).end()
  res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${f.size}`, 'Content-Length': end - start + 1 })
  return req.method === 'HEAD' ? res.end() : createReadStream(f.full, { start, end }).pipe(res)
}

const user = process.env.PANEL_USER || 'wawi'
const pass = process.env.PANEL_PASSWORD || ''
const expected = Buffer.from(`${user}:${pass}`)
const ok = h => {
  if (!pass || !h?.startsWith('Basic ')) return false
  const got = Buffer.from(h.slice(6), 'base64')
  return got.length === expected.length && timingSafeEqual(got, expected)
}

const json = (res, base, code, body) => res.writeHead(code, { ...base, 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body))

createServer(async (req, res) => {
  const base = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  if (req.url === '/healthz') return res.writeHead(200, base).end('ok')
  // new URL() bozuk adreste hata fırlatır ve süreci düşürür; sorgu kısmını elle ayırıyoruz.
  const path = (req.url || '/').split(/[?#]/)[0]
  const page = { 'Content-Type': 'text/html; charset=utf-8' }
  if (path === '/') return res.writeHead(200, { ...base, ...page }).end(home)
  // Asistan ucu panelle aynı şifrenin arkasındadır; anahtar yalnız sunucuda durur.
  if (path === '/api/assistant' || path === '/api/content') {
    if (!pass) return json(res, base, 503, { live: false, message: 'PANEL_PASSWORD ayarlanmamış' })
    if (!ok(req.headers.authorization)) return json(res, base, 401, { message: 'Giriş gerekli' })
    if (req.method === 'GET') return json(res, base, 200, assistantStatus())
    if (req.method !== 'POST') return json(res, base, 405, { message: 'Yöntem desteklenmiyor' })
    try {
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
      const [code, body] = await (path === '/api/content' ? handleContent : handleAssistant)(req, ip)
      return json(res, base, code, body)
    } catch (e) { console.error('assistant route:', e); return json(res, base, 500, { message: 'Asistan beklenmeyen bir hata verdi.' }) }
  }
  const slide = path === '/sunum' ? null : deck.get(path === '/sunum/' ? '/sunum/index.html' : path)
  if (path === '/sunum' && deck.size) return res.writeHead(302, { ...base, Location: '/sunum/' }).end()
  if (!slide && path !== '/panel' && path !== '/panel/') return res.writeHead(302, { ...base, Location: '/' }).end()
  if (!pass) return res.writeHead(503, base).end('PANEL_PASSWORD ayarlanmamış')
  if (!ok(req.headers.authorization)) return res.writeHead(401, { ...base, 'Content-Type': 'text/plain; charset=utf-8', 'WWW-Authenticate': 'Basic realm="WawiERP mock"' }).end('Giriş gerekli')
  if (slide) return sendDeck(req, res, base, slide)
  res.writeHead(200, { ...base, ...page }).end(panel)
}).listen(process.env.PORT || 3000, '0.0.0.0')
