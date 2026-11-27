/* KTX V2.0.31 - single owner for mobile back navigation.
   Installs handlers after window load, once other layers finish overriding window.go.
   Back gesture is edge-only; native vertical/horizontal scrolling stays intact. */
(function(){
 'use strict';
 if(window.__KTX_NAV_2031)return;
 window.__KTX_NAV_2031=true;
 function start(){
   if(!window.__KTX_CLICK_COORD_2031&&!document.querySelector('script[data-ktx-tap-guard]')){
     const el=document.createElement('script');el.src='./assets/js/core/button-interaction-138.js?v=2031.1';el.dataset.ktxTapGuard='1';document.head.appendChild(el);
   }
 const KEY='__ktxNav2031';
 const mobile=()=>matchMedia('(max-width:760px)').matches&&!!document.getElementById('mobile180');
 let restoring=false, edge=null, backBusy=false, lastMobile='home';
 const state=()=>history.state?.[KEY]===true?history.state:null;
 const make=(kind,page,workerId)=>({[KEY]:true,kind,page:page||'home',workerId:workerId||null});
 const push=next=>{
   if(restoring)return;
   const old=state();
   if(old&&old.kind===next.kind&&old.page===next.page&&old.workerId===next.workerId)return;
   try{history.pushState({...history.state,...next},'',location.href)}catch(e){console.warn('KTX navigation history',e)}
 };
 const getMain=()=>document.body.dataset.page||'home';
 function init(){
   if(state())return;
   const first=mobile()?make('mobile','home'):make('main',getMain());
   try{history.replaceState({...history.state,...first},'',location.href)}catch(_){}
 }
 init();
 // Capture FINAL go function, not the earlier version that subsequent modules replace.
 if(typeof window.go==='function'){
   const original=window.go;
   window.go=function(){
     const before=getMain(),ret=original.apply(this,arguments),after=getMain();
     if(!restoring&&before!==after)push(make('main',after));
     return ret;
   };
 }
 // Child vault iframe only requests parent Back when already at folder root.
 window.addEventListener('message',e=>{
   if(e.origin!==location.origin||e.data?.type!=='ktx:vault-root-back'||!mobile())return;
   const frame=document.getElementById('ktx217VaultFrame');
   if(!frame||e.source!==frame.contentWindow)return;
   const st=state();
   if(backBusy||!st||st.kind!=='mobile'||st.page!=='vault208'||history.length<2)return;
   backBusy=true;window.dispatchEvent(new Event('ktx:gesture-consumed'));
   history.back();setTimeout(()=>{backBusy=false},900);
 });
 window.addEventListener('ktx:mobile-screen',e=>{
   if(!mobile()||restoring)return;
   const d=e.detail||{};
   lastMobile=d.screen||'home';
   push(make('mobile',lastMobile,d.workerId));
 });
 function visible(el){if(!el)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&!el.hidden}
 const modal=()=>[...document.querySelectorAll('dialog[open],.modal.open,[role="dialog"][aria-modal="true"]')].filter(visible).pop();
 function dismissModal(){
   const el=modal();if(!el)return false;
   if(el.tagName==='DIALOG'){try{el.close();return true}catch(_){}}
   const b=el.querySelector('[data-close],button[aria-label="Đóng"],button[id$="Close"],button[id$="Cancel"]');
   if(b){b.click();return true}
   // Do not silently hide an unknown modal: this could discard unsaved form inputs.
   return false;
 }
 window.addEventListener('popstate',e=>{
   if(backBusy)backBusy=false;
   const dest=e.state&&e.state[KEY]?e.state:null;
   if(!dest)return;
   restoring=true;
   try{
     if(dest.kind==='mobile'&&mobile()&&typeof window.KTX_MOBILE_RESTORE_SCREEN==='function'){
       window.KTX_MOBILE_RESTORE_SCREEN({screen:dest.page,workerId:dest.workerId});
       lastMobile=dest.page;
     }else if(typeof window.go==='function')window.go(dest.page||'home');
   }catch(err){console.error('KTX Back restore',err)}finally{restoring=false}
 });
 const interactive=el=>!!el?.closest('button,a,input,select,textarea,summary,[role="button"],[contenteditable],iframe,[data-no-swipe],.action-menu');
 const horizontalScrollable=el=>{
   for(let p=el;p&&p!==document.documentElement;p=p.parentElement){
     const s=getComputedStyle(p);
     if(/auto|scroll/.test(s.overflowX)&&p.scrollWidth>p.clientWidth+8)return true;
   }
   return false;
 };
 document.addEventListener('touchstart',e=>{
   edge=null;
   if(!mobile()||e.touches.length!==1||modal()||interactive(e.target)||horizontalScrollable(e.target))return;
   const t=e.touches[0];if(t.clientX>28)return;
   edge={x:t.clientX,y:t.clientY,at:performance.now()};
 },{passive:true});
 document.addEventListener('touchmove',e=>{
   if(!edge||e.touches.length!==1)return;
   const t=e.touches[0],dx=t.clientX-edge.x,dy=t.clientY-edge.y;
   if(dx< -10||(Math.abs(dy)>24&&Math.abs(dy)>Math.abs(dx)))edge=null;
 },{passive:true});
 document.addEventListener('touchcancel',()=>{edge=null},{passive:true});
 document.addEventListener('touchend',e=>{
   if(!edge||e.changedTouches.length!==1){edge=null;return}
   const t=e.changedTouches[0],dx=t.clientX-edge.x,dy=Math.abs(t.clientY-edge.y),dt=performance.now()-edge.at;
   edge=null;
   if(dx<95||dy>48||dx<dy*2||dt>1000||backBusy)return;
   if(dismissModal()){window.dispatchEvent(new Event('ktx:gesture-consumed'));return}
   const s=state();if(!s||history.length<2)return;
   if(s.kind==='mobile'&&s.page==='home')return;
   backBusy=true;
   window.dispatchEvent(new Event('ktx:gesture-consumed'));
   history.back();
   setTimeout(()=>{backBusy=false},900);
 },{passive:true});
}
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
