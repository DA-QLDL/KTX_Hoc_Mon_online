/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/global-settings-164.js >>> */
(()=>{'use strict';
const KEY='ktx_pc_dashboard_settings_v155';let busy=false,last=0,sub=null;
const base={title:'KTX Hóc Môn',ktx1:'KTX 1',ktx2:'KTX 2',total:null,ktx1Total:null,ktx2Total:null,extra:[],sites:[]};
function sb(){try{return typeof syncClient==='function'?syncClient():null}catch(_){return null}}
function workers(){try{return Array.isArray(W)?W:[]}catch(_){return []}}
function publish(row,revision){const all=workers(),n1=all.filter(w=>String(w.ktx||'').trim()==='KTX 1').length,n2=all.filter(w=>String(w.ktx||'').trim()==='KTX 2').length;
const k1=Number.isSafeInteger(row.ktx1Total)?row.ktx1Total:n1,k2=Number.isSafeInteger(row.ktx2Total)?row.ktx2Total:n2;
const sites=Array.isArray(row.sites)?row.sites:[];const counts={'KTX 1':k1,'KTX 2':k2};sites.forEach(site=>{const k='KTX '+site.number;const n=all.filter(w=>String(w.ktx||'').trim()===k).length;counts[k]=Number.isSafeInteger(site.count)?site.count:n});const count=Number.isSafeInteger(row.total)?row.total:Object.values(counts).reduce((a,b)=>a+b,0)+all.filter(w=>!Object.hasOwn(counts,String(w.ktx||'').trim())).length;
const actualByKtx={};all.forEach(w=>{const k=String(w.ktx||'').trim();if(k)actualByKtx[k]=(actualByKtx[k]||0)+1});const fresh={...base,...row,revision,counts:{...counts,all:count},actual:all.length,actualByKtx};
window.KTX_CONFIG_API=Object.freeze({name:k=>k==='KTX 1'?(fresh.ktx1||'KTX 1'):k==='KTX 2'?(fresh.ktx2||'KTX 2'):(fresh.sites||[]).find(x=>'KTX '+x.number===k)?.name||fresh.title||'KTX Hóc Môn',headcount:k=>k&&k!=='all'?(actualByKtx[k]||0):all.length,capacity:k=>fresh.counts[k]??null,rooms:k=>Math.ceil((fresh.counts[k]||0)/20),actual:k=>all.filter(w=>String(w.ktx||'').trim()===k).length});document.title=fresh.title||'KTX Hóc Môn';window.KTX_GLOBAL_CONFIG=fresh;window.KTX_EFFECTIVE_METRICS=Object.freeze({headcount:all.length,byKtx:{...actualByKtx},capacityByKtx:{...counts},roomEquivalent:Object.fromEntries(Object.entries(counts).map(([k,n])=>[k,Math.ceil(n/20)])),actualHeadcount:all.length,asOf:new Date().toISOString()});window.KTX_HEADCOUNT_SETTINGS={get:k=>k&&k!=='all'?(actualByKtx[k]||0):all.length,capacity:k=>fresh.counts[k]??fresh.counts.all,rooms:k=>Math.ceil((fresh.counts[k]??fresh.counts.all)/20),actual:all.length};
try{sessionStorage.setItem('ktx_app_public_config_v167',JSON.stringify({title:fresh.title,ktx1:fresh.ktx1,ktx2:fresh.ktx2,counts:fresh.counts,revision:fresh.revision}));}catch(_){}
for(const frame of document.querySelectorAll('iframe')){try{if(new URL(frame.src,location.href).origin===location.origin)frame.contentWindow?.postMessage({type:'ktx-settings-public-v167',config:fresh},location.origin)}catch(_){}}
window.dispatchEvent(new CustomEvent('ktx-global-settings-changed',{detail:fresh}));
return fresh;}
async function load(force=false){if(busy||(!force&&Date.now()-last<15000))return;busy=true;try{const client=sb();if(!client)return;const auth=await client.auth.getUser();if(auth.error||!auth.data?.user)return;
const r=await client.from('ktx_utility_snapshots').select('revision,rows').eq('module_key',KEY).maybeSingle();if(r.error)throw r.error;
publish(r.data?.rows?.[0]||{},r.data?.revision??null);last=Date.now();}catch(e){console.warn('Cannot refresh global settings:',e)}finally{busy=false}}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='ktx-request-settings-v167')return;const c=window.KTX_GLOBAL_CONFIG;if(c)try{e.source.postMessage({type:'ktx-settings-public-v167',config:c},location.origin)}catch(_){}});
window.KTXSettingsRefresh=load;window.KTXGetEffectiveHeadcount=(ktx)=>{const c=window.KTX_GLOBAL_CONFIG;return c?(ktx&&ktx!=='all'?(c.actualByKtx?.[ktx]||0):(c.actual??0)):null};
window.addEventListener('focus',()=>load(true));window.addEventListener('storage',e=>{if(e.key==='ktx-global-config-reload')load(true)});
window.addEventListener('ktx-cloud-ready',()=>load(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true)});
setTimeout(()=>load(true),1800);setInterval(()=>{if(!document.hidden)load(true)},60000);
})();

;
/* >>> Original: assets/js/core/settings-display-168.js >>> */
(()=>{'use strict';
function appName(){return String(window.KTX_GLOBAL_CONFIG?.title||'KTX Hóc Môn');}
function apply(){const name=appName();
 document.querySelectorAll('[data-settings-app-title]').forEach(el=>el.textContent=name);
 // Do not alter form values, Cloud keys or historic files.
 document.querySelectorAll('h1,h2,.auth-brand2 h2').forEach(el=>{
  if(el.children.length)return;
  if(!el.dataset.originalKtxHeader)el.dataset.originalKtxHeader=el.textContent;
  if(/KTX Hóc Môn|KÝ TÚC XÁ HÓC MÔN/i.test(el.dataset.originalKtxHeader))el.textContent=el.dataset.originalKtxHeader.replace(/KÝ TÚC XÁ HÓC MÔN|KTX Hóc Môn/gi,name)
 });
}
window.addEventListener('ktx-global-settings-changed',apply);
document.addEventListener('DOMContentLoaded',apply);
})();

;
/* >>> Original: assets/js/core/settings-live-166.js >>> */
(()=>{'use strict';
let token=0;function apply(){const cfg=window.KTX_GLOBAL_CONFIG;if(!cfg)return;document.querySelectorAll('[data-ktx-config-label]').forEach(el=>{const key=el.dataset.ktxConfigLabel;el.textContent=key==='title'?cfg.title:key==='KTX 1'?(cfg.ktx1||key):key==='KTX 2'?(cfg.ktx2||key):el.textContent});}
window.addEventListener('ktx-global-settings-changed',()=>{cancelAnimationFrame(token);token=requestAnimationFrame(apply)});document.addEventListener('DOMContentLoaded',apply);
})();
