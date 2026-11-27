/* KTX V2.0.31 — coordinate-safe touch/click arbitration.
   Uses capture only for invalid synthetic clicks; never alters Supabase writes. */
(function(){
 'use strict';
 if(window.__KTX_CLICK_COORD_2031)return;
 window.__KTX_CLICK_COORD_2031=true;
 const control=el=>el?.closest?.('button,a[href],summary,[role="button"],input[type="button"],input[type="submit"],[data-mobile],[data-p]');
 const recent=new WeakMap();
 let pointer=null, consumedUntil=0;
 const now=()=>performance.now();
 const cancel=e=>{if(e.cancelable)e.preventDefault();e.stopImmediatePropagation()};
 window.addEventListener('ktx:gesture-consumed',()=>{consumedUntil=now()+650});
 document.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='touch'||!e.isPrimary)return;
   pointer={id:e.pointerId, target:control(e.target), start:e.target, x:e.clientX, y:e.clientY, at:now(), moved:false};
 },true);
 document.addEventListener('pointermove',e=>{
   if(!pointer||e.pointerId!==pointer.id)return;
   if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>17)pointer.moved=true;
 },true);
 document.addEventListener('pointercancel',e=>{if(pointer?.id===e.pointerId){consumedUntil=now()+400;pointer=null}},true);
 document.addEventListener('click',e=>{
   if(!e.isTrusted||e.detail===0)return; // keyboard/assistive click is untouched
   const t=now(),target=control(e.target);
   if(t<consumedUntil){cancel(e);return}
   if(pointer&&t-pointer.at<1300){
     if(pointer.moved || (pointer.target&&pointer.target!==target)){
       consumedUntil=t+250;cancel(e);pointer=null;return;
     }
     pointer=null;
   }
   if(!target)return;
   const last=recent.get(target)||-1e5;
   if(t-last<360){cancel(e);return}
   recent.set(target,t);
 },true);
 window.addEventListener('blur',()=>{pointer=null});
})();
