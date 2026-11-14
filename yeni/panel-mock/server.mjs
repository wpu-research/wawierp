// Ana sayfa (/) herkese açık; panel (/panel) şifreli. PANEL_PASSWORD yoksa panel hiç gösterilmez.
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { timingSafeEqual } from 'node:crypto'

const home = readFileSync(new URL('./dist/index.html', import.meta.url))
const panel = readFileSync(new URL('./dist/panel.html', import.meta.url))
const user = process.env.PANEL_USER || 'wawi'
const pass = process.env.PANEL_PASSWORD || ''
const expected = Buffer.from(`${user}:${pass}`)
const ok = h => {
  if (!pass || !h?.startsWith('Basic ')) return false
  const got = Buffer.from(h.slice(6), 'base64')
  return got.length === expected.length && timingSafeEqual(got, expected)
}

createServer((req, res) => {
  const base = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  if (req.url === '/healthz') return res.writeHead(200, base).end('ok')
  // new URL() bozuk adreste hata fırlatır ve süreci düşürür; sorgu kısmını elle ayırıyoruz.
  const path = (req.url || '/').split(/[?#]/)[0]
  const page = { 'Content-Type': 'text/html; charset=utf-8' }
  if (path === '/') return res.writeHead(200, { ...base, ...page }).end(home)
  if (path !== '/panel' && path !== '/panel/') return res.writeHead(302, { ...base, Location: '/' }).end()
  if (!pass) return res.writeHead(503, base).end('PANEL_PASSWORD ayarlanmamış')
  if (!ok(req.headers.authorization)) return res.writeHead(401, { ...base, 'WWW-Authenticate': 'Basic realm="WawiERP mock"' }).end('Giriş gerekli')
  res.writeHead(200, { ...base, ...page }).end(panel)
}).listen(process.env.PORT || 3000, '0.0.0.0')
