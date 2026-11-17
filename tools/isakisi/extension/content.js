/* İş Akışı Kaydı — sayfa betiği
 *
 * Önce arka plana "bu sitede kayıt var mı?" diye sorar. Yanıt hayırsa HİÇBİR dinleyici
 * kurulmaz (izin listesi dışı sitelerde, onay yokken ya da duraklatılmışken).
 *
 * ASLA okunmayan şeyler: alan değerleri, yazılan tuşlar, şifre alanları, panodaki içerik,
 * sayfa metni, ekran görüntüsü. Yalnız "hangi düğme / hangi alan adı / hangi site" bilgisi.
 */
(function () {
  if (window.top !== window) return;
  const host = location.host;
  let on = false;

  function send(ev) {
    if (!on) return;
    ev.host = host;
    ev.path = IA.normPath(location.pathname);
    try { chrome.runtime.sendMessage({ kind: 'event', ev: ev }); } catch (e) { on = false; }
  }

  function isSecret(el) {
    if (!el) return false;
    const t = (el.getAttribute && (el.getAttribute('type') || '')).toLowerCase();
    const ac = (el.getAttribute && (el.getAttribute('autocomplete') || '')).toLowerCase();
    return t === 'password' || /password|cc-|one-time-code/.test(ac);
  }

  // Alanın "adı" (name/id) — değeri değil. Şifre alanı hiç yazılmaz.
  function fieldName(el) {
    if (!el || isSecret(el)) return null;
    const n = el.getAttribute('name') || el.getAttribute('id') || el.getAttribute('aria-label') || '';
    return IA.cleanLabel(n) || '(adsız)';
  }

  function onClick(e) {
    const el = e.target && e.target.closest &&
      e.target.closest('button, a[href], [role="button"], input[type="submit"], input[type="button"]');
    if (!el || isSecret(el)) return;
    if (el.tagName === 'A') {
      // Bağlantı metni müşteri adı içerebilir → metin değil, gidilen yolun kalıbı tutulur
      let to = '';
      try { const u = new URL(el.href, location.href); to = (u.host === host ? '' : u.host) + IA.normPath(u.pathname); } catch (x) {}
      send({ type: 'click', kind: 'link', label: to });
    } else {
      const raw = el.tagName === 'INPUT' ? el.getAttribute('value') : (el.getAttribute('aria-label') || el.innerText);
      send({ type: 'click', kind: 'button', label: IA.cleanLabel(raw) });
    }
  }

  function onSubmit(e) {
    const f = e.target;
    if (!f || !f.elements) return;
    const names = [];
    for (const el of Array.from(f.elements)) {
      const t = (el.getAttribute('type') || '').toLowerCase();
      if (t === 'hidden' || t === 'submit' || t === 'button') continue;
      const n = fieldName(el);
      if (n && names.length < 30) names.push(n);
    }
    send({ type: 'submit', fields: names });
  }

  function onCopy() { send({ type: 'copy' }); }              // içerik okunmaz
  function onPaste(e) {
    const el = e.target;
    if (isSecret(el)) return;
    send({ type: 'paste', field: fieldName(el && el.closest ? el.closest('input,textarea,[contenteditable]') || el : el) });
  }
  function onFile(e) {
    const el = e.target;
    if (!el || el.tagName !== 'INPUT' || (el.type || '').toLowerCase() !== 'file' || !el.files) return;
    const exts = Array.from(el.files).slice(0, 20).map(function (f) { return IA.ext(f.name); });
    if (exts.length) send({ type: 'upload', count: exts.length, exts: exts });
  }

  function attach() {
    if (on) return;
    on = true;
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('copy', onCopy, true);
    document.addEventListener('cut', onCopy, true);
    document.addEventListener('paste', onPaste, true);
    document.addEventListener('change', onFile, true);
  }
  function detach() {
    on = false;
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('submit', onSubmit, true);
    document.removeEventListener('copy', onCopy, true);
    document.removeEventListener('cut', onCopy, true);
    document.removeEventListener('paste', onPaste, true);
    document.removeEventListener('change', onFile, true);
  }

  function check() {
    try {
      chrome.runtime.sendMessage({ kind: 'state', host: host }, function (r) {
        if (chrome.runtime.lastError) return;
        if (r && r.record) attach(); else detach();
      });
    } catch (e) { detach(); }
  }
  check();
  // Duraklat / devam / onay değişince hemen uyum sağla
  chrome.storage.onChanged.addListener(function (ch) {
    if (ch.pausedUntil || ch.consent || ch.allowlist) check();
  });
  // Süreli duraklatma bitince de yakala
  setInterval(check, 60000);
})();
