// Ortak yardımcılar — hem arka plan hem sayfa betiği kullanır.
// Gizlilik kuralı: buradaki işlevler veriyi KÜÇÜLTÜR; hiçbir zaman içerik eklemez.

/* exported IA */
var IA = (function () {
  // Sayfa yolunu "kalıba" çevirir: sorgu ve # atılır, kimlik benzeri parçalar :id olur.
  // /orders/123456/edit?x=1  ->  /orders/:id/edit
  function normPath(pathname) {
    if (!pathname) return '/';
    const segs = String(pathname).split('/').filter(Boolean).slice(0, 6).map(function (s) {
      let d;
      try { d = decodeURIComponent(s); } catch (e) { d = s; }
      d = d.toLowerCase();
      if (d === ':id' || d === ':x') return d;             // zaten kalıba çevrilmiş
      if (/@/.test(d)) return ':x';                      // e-posta benzeri
      if (/\d{3,}/.test(d)) return ':id';                  // sipariş no, ürün no
      if (/^[0-9a-f-]{8,}$/.test(d)) return ':id';         // uuid / hex
      if (d.length > 32) return ':x';                      // uzun, anlamsız parça
      return d.replace(/[^a-z0-9._-]/g, '_');
    });
    return '/' + segs.join('/');
  }

  // Düğme metnini kısaltır, rakamları ve e-postaları siler.
  function cleanLabel(t) {
    if (!t) return '';
    return String(t)
      .replace(/\S+@\S+/g, '')
      .replace(/\d+/g, '#')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40);
  }

  // Alan adı izin listesinde mi? Liste öğeleri: { pattern: "*.ebay.de", label: "eBay" }
  function matchHost(host, allowlist) {
    host = String(host || '').toLowerCase();
    for (const item of allowlist || []) {
      const p = String(item.pattern).toLowerCase();
      if (p.startsWith('*.')) {
        const base = p.slice(2);
        if (host === base || host.endsWith('.' + base)) return item;
      } else if (host === p) {
        return item;
      }
    }
    return null;
  }

  // Dosya adından yalnız uzantı (ad kişisel bilgi içerebilir).
  function ext(name) {
    const m = /\.([a-z0-9]{1,6})$/i.exec(String(name || ''));
    return m ? m[1].toLowerCase() : '?';
  }

  return { normPath: normPath, cleanLabel: cleanLabel, matchHost: matchHost, ext: ext };
})();

if (typeof module !== 'undefined') module.exports = IA;
