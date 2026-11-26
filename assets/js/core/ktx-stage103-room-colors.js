/* Stage 107: occupancy palette sync, no business-data mutation. */
(function(){
 'use strict';
 const SELECTOR='#home .room-cell, #mobile180 .step230-room, #transferDlg .transfer-room-card';
 const BANDS=['low','medium','high','full','critical'];
 const tier=n=>n<=6?'low':n<=14?'medium':n<=19?'high':n===20?'full':'critical';
 function readCount(el){
   const direct=el.getAttribute('data-ktx-room-used');
   if(direct!==null && /^\d+$/.test(direct.trim())) return +direct;
   const status=el.querySelector('.room-occ b,.ktx104-roomvalue')?.textContent||'';
   const text=[status,el.getAttribute('title')||'',el.querySelector('span:not(.room-no)')?.textContent||'',el.textContent||''].join(' | ');
   const match=text.match(/(?:^|[^\d])(\d+)\s*\/\s*\d+/);
   return match?+match[1]:null;
 }
 function setColor(el){
   const n=readCount(el);
   if(n===null||!Number.isFinite(n))return;
   const band=tier(n);
   if(el.dataset.ktxRoomBand!==band)el.dataset.ktxRoomBand=band;
   if(el.dataset.ktxRoomUsed!==String(n))el.dataset.ktxRoomUsed=String(n);
 }
 let queued=false;
 function refresh(){queued=false;document.querySelectorAll(SELECTOR).forEach(setColor);}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(refresh);}
 function boot(){
   schedule();
   const target=document.documentElement;
   if(!target||target.__ktx107Palette)return;
   target.__ktx107Palette=true;
   new MutationObserver(mutations=>{
     if(mutations.some(m=>m.type==='childList' && (m.addedNodes.length||m.removedNodes.length)))schedule();
   }).observe(target,{childList:true,subtree:true});
   document.addEventListener('change',schedule,true);
   document.addEventListener('click',schedule,true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
