
/* STEP234 — public publishable configuration only. No service-role or secret key. */
(function(){
  const builtIn={url:'https://ojyamqpkmhmhqjfcudhy.supabase.co',key:'sb_publishable_TfczErIbZKv_nMdRu_wUWg_n-h6uDSq'};
  const valid=c=>c && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(c.url||'')) && /^(sb_publishable_|eyJ)/.test(String(c.key||'')) && !/sb_secret_|service_role/i.test(String(c.key||''));
  if(!valid(window.KTX_QR_CONFIG)) window.KTX_QR_CONFIG=builtIn;
  window.__KTX_PUBLIC_CONFIG={url:window.KTX_QR_CONFIG.url,key:window.KTX_QR_CONFIG.key};
})();

/* Ngày theo giờ địa phương (UTC+7). Không dùng toISOString() cho ngày vì sẽ lệch 1 ngày. */
window.ktxLocalISO=function(d){d=d instanceof Date?d:new Date(d);if(isNaN(d))return null;var x=new Date(d.getTime()+432e5);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
window.ktxTodayISO=function(){var n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')};
