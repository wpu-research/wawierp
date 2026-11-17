function ui(action) { return new Promise(function (r) { chrome.runtime.sendMessage({ kind: 'ui', action: action }, r); }); }
const read = document.getElementById('read'), ok = document.getElementById('ok'), done = document.getElementById('done');
read.onchange = function () { ok.disabled = !read.checked; };
ok.onclick = async function () {
  await ui('consent');
  done.style.display = 'block';
  done.textContent = 'Onay kaydedildi. Kayıt açık; simgedeki kırmızı nokta bunu gösterir. Bu sekmeyi kapatabilirsiniz.';
};
document.getElementById('no').onclick = function () {
  done.style.display = 'block'; done.style.color = '#444';
  done.textContent = 'Onay verilmedi. Hiçbir şey kaydedilmiyor. Fikrinizi değiştirirseniz eklenti simgesinden bu sayfaya dönebilirsiniz.';
};
ui('status').then(function (s) {
  document.getElementById('full').href = s.server + '/aydinlatma';
  if (s.consent) { read.checked = true; ok.disabled = true; done.style.display = 'block'; done.textContent = 'Onayınız zaten kayıtlı (' + new Date(s.consent.at).toLocaleString('tr-TR') + ').'; }
});
