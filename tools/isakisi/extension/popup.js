function ui(action, extra) {
  return new Promise(function (res) { chrome.runtime.sendMessage(Object.assign({ kind: 'ui', action: action }, extra || {}), res); });
}
function btn(label, cls, fn) {
  const b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls;
  b.onclick = async function () { await fn(); render(); }; document.getElementById('btns').appendChild(b);
}
async function render() {
  const s = await ui('status');
  const st = document.getElementById('st'), t = document.getElementById('stText'), info = document.getElementById('info');
  document.getElementById('btns').innerHTML = '';
  if (!s.consent) {
    st.className = 'st no'; t.textContent = 'Kayıt yok — onay verilmedi';
    info.textContent = 'Onay vermeden hiçbir şey kaydedilmez.';
    btn('Bilgilendirmeyi oku ve karar ver', 'main', function () { chrome.tabs.create({ url: 'onboarding.html' }); });
  } else if (s.paused) {
    st.className = 'st pau'; t.textContent = 'Duraklatıldı — kayıt yok';
    info.textContent = s.pausedUntil > 0 ? ('Otomatik devam: ' + new Date(s.pausedUntil).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })) : 'Siz devam ettirene kadar kayıt yok.';
    btn('Kaydı sürdür', 'main', function () { return ui('resume'); });
  } else {
    st.className = 'st rec'; t.textContent = 'Kayıt açık';
    info.textContent = 'Yalnız iş sitelerinde (' + (s.allowlist || []).length + ' site) hangi sayfa ve düğme kullanıldığı kaydedilir. Yazdıklarınız ve şifreler kaydedilmez.';
    btn('15 dakika duraklat', 'main', function () { return ui('pause', { minutes: 15 }); });
    btn('Duraklat (ben açana kadar)', '', function () { return ui('pause', { minutes: 0 }); });
  }
  if (s.consent) btn('Onayımı geri çek ve verilerimi sil', 'warn', async function () {
    if (confirm('Onayınız geri çekilecek ve sunucudaki tüm kayıtlarınız silinecek. Emin misiniz?')) await ui('withdraw');
  });
  const mine = document.getElementById('mine');
  mine.style.display = s.pid ? '' : 'none';
  // Kimlik URL'nin # kısmında: sunucuya ve kayıtlara gitmez
  mine.href = s.server + '/me.html#' + (s.pid || '');
  const last = s.lastSent ? ('Son gönderim: ' + new Date(s.lastSent.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' (' + s.lastSent.n + ' olay)') : 'Henüz gönderim yok';
  document.getElementById('q').textContent = s.consent ? (last + (s.queued ? ' · ' + s.queued + ' olay bekliyor' : '')) : '';
}
render();
