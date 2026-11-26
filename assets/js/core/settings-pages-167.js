(()=>{'use strict';
const KEY='ktx_app_public_config_v167';let last=null;
function render(c){if(!c||typeof c!=='object')return;last=c;
 const title=String(c.title||'KTX Hóc Môn').trim();const k1=String(c.ktx1||'KTX 1').trim(),k2=String(c.ktx2||'KTX 2').trim();
 const standard=document.documentElement.dataset.settingsOriginalTitle||(document.documentElement.dataset.settingsOriginalTitle=document.title);
 document.title=standard.replace(/KTX Hóc Môn/gi,title);
 document.querySelectorAll('img[alt*="KTX Hóc Môn"]').forEach(el=>el.alt='Logo '+title);
 // Only replace static visual labels. Form options retain canonical values for Cloud lookups.
 document.querySelectorAll('.brand span,.logo span,.ktx-brand span,.brand-name,[data-settings-brand]').forEach(el=>{if(!el.dataset.originalBrand)el.dataset.originalBrand=el.textContent;el.textContent=el.dataset.originalBrand.replace(/KÝ TÚC XÁ HÓC MÔN|KTX HÓC MÔN|KTX Hóc Môn/gi,title)});
 // Keep inputs, stored identifiers, selectors and controls unchanged; only replace heading text nodes.
 document.querySelectorAll('h1,h2,.page-title,.app-title,.report-title').forEach(el=>{
   if(el.closest('button,select,[contenteditable]')||el.querySelector('input,select,button'))return;
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
   while(n=walker.nextNode()){
     if(!n.__ktxOriginal)n.__ktxOriginal=n.nodeValue;
     n.nodeValue=n.__ktxOriginal.replace(/KÝ TÚC XÁ HÓC MÔN|KTX HÓC MÔN/gi,title);
   }
 });
 // Keep original static text so repeated Settings changes never accumulate.
 document.querySelectorAll('header .muted,header .subtitle,.ktx-heading-row .muted,.pwa-install-head h3').forEach(el=>{
  if(el.closest('input,select,textarea,[contenteditable]')||el.children.length)return;
  if(!el.dataset.settingsOriginalText)el.dataset.settingsOriginalText=el.textContent;
  el.textContent=el.dataset.settingsOriginalText.replace(/KÝ TÚC XÁ HÓC MÔN|KTX HÓC MÔN|KTX Hóc Môn/gi,title);
 });
 document.querySelectorAll('.fac-tab[data-ktx="1"],.fac-tab[data-ktx="2"]').forEach(el=>{el.textContent=el.dataset.ktx==='1'?k1:k2});
 document.querySelectorAll('[data-settings-ktx-name]').forEach(el=>{el.textContent=el.dataset.settingsKtxName==='1'?k1:k2});
}
try{const fromCache=sessionStorage.getItem(KEY);if(fromCache)render(JSON.parse(fromCache))}catch(_){}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='ktx-settings-public-v167')return;render(e.data.config)});
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{render(JSON.parse(e.newValue))}catch(_){}}});
window.addEventListener('DOMContentLoaded',()=>{if(last)render(last);try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:'ktx-request-settings-v167'},location.origin)}catch(_){}});
})();
