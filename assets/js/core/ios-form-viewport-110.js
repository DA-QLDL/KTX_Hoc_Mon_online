/* v1.0.10 — adjust worker form for iOS visual viewport / keyboard */
(function(){'use strict';
function update(){
 const vv=window.visualViewport;
 if(!vv)return;
 const h=Math.max(250,Math.round(vv.height-20));
 document.documentElement.style.setProperty('--ktx-ios-visual-height',h+'px');
 const dlg=document.getElementById('dlg');
 if(dlg&&dlg.open&&window.matchMedia('(max-width:760px)').matches){
   const active=document.activeElement;
   if(active&&dlg.contains(active)&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)){
     const body=dlg.querySelector('.ebody');
     if(body){const r=active.getBoundingClientRect();const br=body.getBoundingClientRect();if(r.bottom>br.bottom-10||r.top<br.top+8)active.scrollIntoView({block:'nearest',behavior:'instant'});}
   }
 }
}
if(window.visualViewport){window.visualViewport.addEventListener('resize',update,{passive:true});window.visualViewport.addEventListener('scroll',update,{passive:true});}
document.addEventListener('focusin',function(e){if(e.target.closest&&e.target.closest('#dlg'))requestAnimationFrame(update)});
window.addEventListener('resize',update,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update);else update();
})();
