
/* STEP234 — public publishable configuration only. No service-role or secret key. */
(function(){
  const builtIn={url:'',key:''}; // No previous project fallback; fail closed on unset config
  const valid=c=>c && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(c.url||'')) && /^(sb_publishable_|eyJ)/.test(String(c.key||'')) && !/sb_secret_|service_role/i.test(String(c.key||''));
  if(!valid(window.KTX_QR_CONFIG) || /REPLACE_WITH_/i.test(String(window.KTX_QR_CONFIG?.url||'')+String(window.KTX_QR_CONFIG?.key||''))) {
    window.KTX_QR_CONFIG=builtIn;
    console.warn('[KTX] Chua cau hinh Supabase moi - khong ket noi project cu.');
  }
  window.__KTX_PUBLIC_CONFIG={url:window.KTX_QR_CONFIG.url,key:window.KTX_QR_CONFIG.key};
})();

/* Ngày theo giờ địa phương (UTC+7). Không dùng toISOString() cho ngày vì sẽ lệch 1 ngày. */
window.ktxLocalISO=function(d){d=d instanceof Date?d:new Date(d);if(isNaN(d))return null;var x=new Date(d.getTime()+432e5);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
window.ktxTodayISO=function(){var n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')};
