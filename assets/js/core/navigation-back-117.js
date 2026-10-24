/* KTX STEP v1.0.17 - App navigation for Android/iOS PWA.
   State only in browser history; never touches Supabase/local business data. */
(function(){
 'use strict';
 if(window.__KTX_BACK_117)return;
 window.__KTX_BACK_117=true;
 const KEY='__ktxNav117';
 let restoring=false, lastKind='main', lastPage='home';
 const mobile=()=>window.matchMedia('(max-width:760px)').matches && !!document.getElementById('mobile180');
 const mainPage=()=>String(document.body.dataset.page||window.page||'home');
 const build=(kind,page,workerId)=>({[KEY]:true,kind,page:page||'home',workerId:workerId||null});
 const current=()=>history.state&&history.state[KEY]?history.state:null;
 function push(st){
   if(restoring||!st)return;
   const prev=current();
   if(prev&&prev.kind===st.kind&&prev.page===st.page&&prev.workerId===st.workerId)return;
   try{history.pushState(st,'',location.href)}catch(e){console.warn('KTX Back: history unavailable',e)}
 }
 // Wrap the final (already-composed) go() so every internal page is a genuine history entry.
 const oldGo=window.go;
 if(typeof oldGo==='function')window.go=function(target){
   const before=mainPage(),result=oldGo.apply(this,arguments),after=mainPage();
   if(!restoring&&!mobile()&&after!==before){lastKind='main';lastPage=after;push(build('main',after))}
   return result;
 };
 window.addEventListener('ktx:mobile-screen',function(e){
   if(restoring||!mobile())return;
   const d=e.detail||{};lastKind='mobile';lastPage=d.screen||'home';
   push({...build('mobile',lastPage,d.workerId)});
 });
 window.addEventListener('popstate',function(e){
   const dest=e.state&&e.state[KEY]?e.state:null;
   // A browser gesture should dismiss open dialogs first, without silently closing a form's saved data.
   const modal=[...document.querySelectorAll('dialog[open]')].pop();
   if(modal){
     try{modal.close()}catch(_){}
     const preserve=current()||build(lastKind,lastPage);
     try{history.pushState(preserve,'',location.href)}catch(_){}
     return;
   }
   const overlays=[...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(el=>{
     if(el.id==='gate')return false;
     const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&!el.classList.contains('hide');
   });
   if(overlays.length){
     const overlay=overlays[overlays.length-1];const close=overlay.querySelector('[id$="Back"],[id$="Close"],button[aria-label="Đóng"]');
     if(close)close.click();else overlay.style.display='none';
     try{history.pushState(build(lastKind,lastPage),'',location.href)}catch(_){}
     return;
   }
   if(!dest)return; // normal browser navigation outside application
   restoring=true;
   try{
     if(dest.kind==='mobile'&&mobile()&&typeof window.KTX_MOBILE_RESTORE_SCREEN==='function'){
       window.KTX_MOBILE_RESTORE_SCREEN({screen:dest.page,workerId:dest.workerId});
     }else if(typeof window.go==='function')window.go(dest.page||'home');
     lastKind=dest.kind;lastPage=dest.page;
   }catch(err){console.error('KTX back navigation:',err)}finally{restoring=false}
 });
 // iOS standalone PWAs may not dispatch popstate for a native edge swipe.
 // Support an inward swipe from the left edge on non-editable content.
 let swipe=null;
 document.addEventListener('touchstart',function(e){
   if(!mobile()||e.touches.length!==1)return;
   const el=e.target;
   if(el&&el.closest('input,textarea,select,[contenteditable="true"],.wkd,.mlist,.m195-select'))return;
   const p=e.touches[0];swipe=p.clientX<=26?{x:p.clientX,y:p.clientY,t:Date.now()}:null;
 },{passive:true});
 document.addEventListener('touchend',function(e){
   if(!swipe||!mobile()||!e.changedTouches.length){swipe=null;return}
   const p=e.changedTouches[0],dx=p.clientX-swipe.x,dy=Math.abs(p.clientY-swipe.y);
   const valid=dx>85&&dy<65&&dx>dy*1.7&&Date.now()-swipe.t<1000;swipe=null;
   if(!valid)return;
   const st=current();
   if(st&&st.kind==='mobile'&&st.page!=='home'&&history.length>1)history.back();
 },{passive:true});
 // Initial entry represents current view, so Back from subsequent screens can return here.
 function init(){
   if(current())return;
   const st=mobile()?build('mobile','home'):build('main',mainPage());
   lastKind=st.kind;lastPage=st.page;
   try{history.replaceState(Object.assign({},history.state||{},st),'',location.href)}catch(_){}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
