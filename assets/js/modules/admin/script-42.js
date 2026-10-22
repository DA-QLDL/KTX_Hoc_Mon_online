
/* STEP226 - public client config comes from server environment; no user keys or per-device configuration. */
window.__KTX_PUBLIC_CONFIG = null;
window.ktxLoadPublicConfig = async function(force){
  const c=window.KTX_QR_CONFIG || window.__KTX_PUBLIC_CONFIG;
  const valid=c=>c && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(c.url||'')) && /^(sb_publishable_|eyJ)/.test(String(c.key||'')) && !/sb_secret_|service_role/i.test(String(c.key||''));
  if(!valid(c)) throw new Error('Chưa có cấu hình Supabase hợp lệ trong bản phát hành. Liên hệ Quản trị.');
  const next={url:String(c.url).replace(/\/$/,''),key:String(c.key)};
  const prior=window.__KTX_PUBLIC_CONFIG;
  window.__KTX_PUBLIC_CONFIG=next;
  if(typeof SUPA_SYNC!=='undefined' && (force||!prior||prior.url!==next.url||prior.key!==next.key)){
    SUPA_SYNC.client=null;SUPA_SYNC._url=null;SUPA_SYNC._key=null;
  }
  return next;
};
// Warm the connection on opening the application; login also awaits it on demand.
window.addEventListener('DOMContentLoaded',()=>{window.ktxLoadPublicConfig().catch(()=>{});});
