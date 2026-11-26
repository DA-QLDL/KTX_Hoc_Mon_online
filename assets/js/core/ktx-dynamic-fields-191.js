/* V2.0.78: preserve existing suggestions, but only scan new inputs.
   Avoid O(all workers x all page mutations), which caused lag on mobile. */
(()=>{'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
let valueCache=null,cacheAt=0;
function values(){
 if(valueCache&&Date.now()-cacheAt<10000)return valueCache;
 const cfg=window.KTX_GLOBAL_CONFIG||{};
 const ks=new Set(['KTX 1','KTX 2']),td=new Set();
 (cfg.sites||[]).forEach(s=>{if(Number(s.number)>0)ks.add('KTX '+Number(s.number))});
 try{(typeof W!=='undefined'&&Array.isArray(W)?W:[]).forEach(w=>{
  if(/^KTX\s+\d+$/i.test(w.ktx||''))ks.add(String(w.ktx).trim());
  if(w.td)td.add(String(w.td).trim());
 })}catch(_){ }
 valueCache={
  ktx:[...ks].sort((a,b)=>parseInt(a.replace(/\D/g,''))-parseInt(b.replace(/\D/g,''))),
  day:Array.from({length:6},(_,i)=>'Dãy '+(i+1)),
  room:Array.from({length:15},(_,i)=>String(i+1)),
  td:[...td].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true})).slice(0,200)
 };cacheAt=Date.now();return valueCache;
}
function typeFor(input){
 const label=input.closest('label');
 const text=norm((label?.textContent||'').replace(input.value||'',''));
 const id=norm(input.id||input.name||'');
 if(/^(trroom|trnote)$/.test(id))return '';
 if(/\bktx\b|ky tuc xa/.test(text)||/^(ktx|fktx|ektx)$/.test(id))return 'ktx';
 if(/\bday\b/.test(text)||/\bday\b/.test(id))return 'day';
 if(/\bphong\b/.test(text)||/^(room|froom|eroom)$/.test(id))return 'room';
 if(/tieu doan/.test(text)||/^(td|ftd|etd)$/.test(id))return 'td';
 return '';
}
const inputSelector='input:not([type]),input[type="text"],input[type="search"]';
function enhanceOne(input,options){
 if(!input.isConnected||input.closest('#ktx155Dlg')||input.closest('#transferDlg')||input.disabled||input.readOnly)return;
 const type=typeFor(input);if(!type)return;
 const key='ktx191-'+type;
 let dl=document.getElementById(key);
 if(!dl){dl=document.createElement('datalist');dl.id=key;document.body.appendChild(dl)}
 const html=options[type].map(x=>'<option value="'+String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'"></option>').join('');
 if(dl.__ktx191HTML!==html){dl.innerHTML=html;dl.__ktx191HTML=html}
 if(input.getAttribute('list')!==key)input.setAttribute('list',key);
}
function initialize(){
 let pending=new Set(),whole=false,scheduled=false;
 function flush(){scheduled=false;const opts=values();
  if(whole){document.querySelectorAll(inputSelector).forEach(input=>enhanceOne(input,opts))}
  else pending.forEach(input=>enhanceOne(input,opts));
  pending.clear();whole=false;
 }
 function schedule(){if(scheduled)return;scheduled=true;setTimeout(flush,100)}
 function addNodes(node){if(node.nodeType!==1)return;
  if(node.matches?.(inputSelector))pending.add(node);
  node.querySelectorAll?.(inputSelector).forEach(input=>pending.add(input));
 }
 whole=true;schedule();
 new MutationObserver(records=>{
  let hasNewInputs=false;
  for(const record of records)for(const node of record.addedNodes){
   if(node.nodeType!==1)continue;
   if(node.matches?.(inputSelector)||node.querySelector?.(inputSelector)){
    addNodes(node);hasNewInputs=true;
   }
  }
  if(hasNewInputs)schedule();
 }).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('ktx-global-settings-changed',()=>{valueCache=null;whole=true;schedule()});
 window.addEventListener('ktx:workers-updated',()=>{valueCache=null;whole=true;schedule()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
