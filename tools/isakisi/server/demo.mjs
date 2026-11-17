// Yalnız deneme için iki sahte site: :8788 "Demo Pazaryeri", :8789 "Demo ERP".
// Gerçek pazaryeri/ERP'ye dokunmadan eklentinin olay üretmesini sınamaya yarar.
import http from 'node:http';

const page = (title, body) => `<!doctype html><html lang="tr"><meta charset="utf-8"><title>${title}</title>
<style>body{font:15px system-ui;max-width:760px;margin:24px auto;padding:0 16px}input{padding:6px;margin:4px 0;display:block;width:320px}
button{padding:8px 14px;margin:6px 6px 6px 0}table{border-collapse:collapse}td{border:1px solid #ddd;padding:6px 10px}</style>
<body><h1>${title}</h1>${body}</body></html>`;
const orders = [10231, 10232, 10233, 10234, 10235, 10236];

function market(req, res) {
  const u = new URL(req.url, 'http://x');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (u.pathname === '/label.csv') {
    res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="etiket-10234-Muster.csv"');
    return res.end('siparis;kargo\n10234;JJD000123\n');
  }
  const m = /^\/orders\/(\d+)$/.exec(u.pathname);
  if (m) return res.end(page('Demo Pazaryeri — Sipariş ' + m[1], `
    <p>Müşteri: <span id="ad">Erika Mustermann</span> · Adres: <span id="adr">Hauptstr. 5, 10115 Berlin</span></p>
    <p>Kargo takip no: <span id="takip">JJD000${m[1]}</span></p>
    <button id="kopyala-ad">Adı kopyala</button>
    <a id="etiket" href="/label.csv" download>Kargo etiketini indir</a> · <a href="/orders">Siparişlere dön</a>`));
  return res.end(page('Demo Pazaryeri — Siparişler', `<table>${orders.map((o) => `<tr><td><a href="/orders/${o}">Sipariş ${o}</a></td><td>Yeni</td></tr>`).join('')}</table>`));
}

function erp(req, res) {
  const u = new URL(req.url, 'http://x');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.method === 'POST') { res.writeHead(303, { Location: '/siparis/' + (5000 + Math.floor(Math.random() * 999)) }); return res.end(); }
  if (/^\/siparis\/\d+$/.test(u.pathname)) return res.end(page('Demo ERP — Kaydedildi', '<p>Sipariş kaydedildi.</p><a href="/siparis/yeni">Yeni sipariş</a> · <a href="/evrak">Evrak yükle</a>'));
  if (u.pathname === '/evrak') return res.end(page('Demo ERP — Evrak', '<input type="file" id="dosya"> <a href="/siparis/yeni">Geri</a>'));
  return res.end(page('Demo ERP — Yeni sipariş', `<form method="post" action="/siparis/kaydet">
    <label>Müşteri adı<input name="musteri_adi" id="musteri_adi"></label>
    <label>Adres<input name="adres" id="adres"></label>
    <label>Kargo takip no<input name="kargo_takip_no" id="kargo_takip_no"></label>
    <label>Şifre (deneme: asla kaydedilmemeli)<input type="password" name="pin" id="pin"></label>
    <input type="hidden" name="csrf" value="gizli-deger">
    <button type="submit" id="kaydet">Kaydet</button></form>`));
}

export function startDemo() {
  http.createServer(market).listen(8788, '127.0.0.1');
  http.createServer(erp).listen(8789, '127.0.0.1');
  console.log('Demo siteler: http://localhost:8788/orders  ve  http://localhost:8789/siparis/yeni');
}
