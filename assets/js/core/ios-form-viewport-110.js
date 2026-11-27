/* v2235 — Mobile worker editor: use visual viewport above the soft keyboard. */
(function(){'use strict';
 const dlg=document.getElementById('dlg');
 const root=document.documentElement;
 function update(){
  if(!window.visualViewport)return;
  const v=window.visualViewport;
  const visibleHeight=Math.max(160,Math.round(v.height));
  const top=Math.max(6,Math.round(v.offsetTop+8));
  root.style.setProperty('--ktx-ios-visual-height',Math.max(140,visibleHeight-16)+'px');
  root.style.setProperty('--ktx-ios-visual-top',top+'px');
  if(!dlg||!dlg.open||!window.matchMedia('(max-width:760px)').matches)return;
  const active=document.activeElement;
  if(!active||!dlg.contains(active)||!/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))return;
  const body=dlg.querySelector('.dlg-worker-scroll') || dlg.querySelector('.ebody');
  if(!body)return;
  requestAnimationFrame(()=>{
   const r=active.getBoundingClientRect(),br=body.getBoundingClientRect();
   const padding=12;
   if(r.bottom>br.bottom-padding)body.scrollTop+=r.bottom-(br.bottom-padding);
   else if(r.top<br.top+padding)body.scrollTop-=br.top+padding-r.top;
  });
 }
 function onFocus(e){if(!e.target.closest?.('#dlg'))return;requestAnimationFrame(update);}
 if(window.visualViewport){visualViewport.addEventListener('resize',update,{passive:true});visualViewport.addEventListener('scroll',update,{passive:true});}
 document.addEventListener('focusin',onFocus);
 window.addEventListener('resize',update,{passive:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
})();
