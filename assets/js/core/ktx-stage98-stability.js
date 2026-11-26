/* Stage 98: isolated stability/accessibility patch for Stage 93 MODULAR.
   No Supabase writes, no changes to existing record/permission model. */
(function(){
 'use strict';
 window.KTX_STAGE98_STABILITY=true;
 const $=id=>document.getElementById(id);
 // Cloud-first automatic refresh after a restored session, reconnect, or a long idle.
 // Existing ktx135StartAutomaticSync handles pending-write reconciliation; NEVER bypass it.
 let lastAttempt=0,busy=false;
 async function refreshIfDue(reason){
  const ss=window.SUPA_SYNC;
  if(!ss?.session||!ss.ready||!ss.enabled||navigator.onLine===false||busy)return;
  const empty=typeof W!=='undefined'&&Array.isArray(W)&&W.length===0;
  const elapsed=Date.now()-(ss.lastSync||0);
  if(!empty&&reason==='resume'&&elapsed<10*60*1000)return;
  if(Date.now()-lastAttempt<75*1000)return;
  if(typeof ktx135StartAutomaticSync!=='function')return;
  lastAttempt=Date.now();busy=true;
  try{await ktx135StartAutomaticSync();}
  catch(e){console.warn('[KTX98] Tự đồng bộ khi kết nối lại:',e)}
  finally{busy=false}
 }
 function resume(){if(!document.hidden)refreshIfDue('resume')}
 window.addEventListener('online',()=>refreshIfDue('online'));
 document.addEventListener('visibilitychange',resume,{passive:true});
 window.addEventListener('focus',resume,{passive:true});
 // Login/sync boot can complete asynchronously. Check once, never poll continuously.
 window.addEventListener('load',()=>setTimeout(()=>refreshIfDue('startup'),2200),{once:true});

 // Configuration lives under System Functions. Rebuild ONLY on navigation, not on every DOM mutation.
 const configActions={
  brand:()=>{if(window.KTXBrand?.open)window.KTXBrand.open();else $('ktxBrandAdminButton')?.click()},
  settings:()=>{if(window.KTXOpenSystemSettings)window.KTXOpenSystemSettings();else $('ktx159SettingsMenu')?.click()},
  labels:()=>{if(window.KTXOpenUtilityRename)window.KTXOpenUtilityRename();else $('ktxRenameOpen2196')?.click()}
 };
 function isAdmin(){try{return typeof ME!=='undefined'&&ME?.role==='admin'}catch(e){return false}}
 function mountConfig(){
  const hub=$('sysfunc');if(!hub)return;
  const grid=hub.querySelector('.sysfunc-group .sysfunc-grid');if(!grid)return;
  if(!$('ktx98ConfigOpen')){
   const b=document.createElement('button');b.type='button';b.id='ktx98ConfigOpen';b.className='sysfunc-btn sf-purple';
   b.innerHTML='<span class="sficon">⚙</span><span><b>Cấu hình hệ thống</b><small>Thương hiệu · Cài đặt · Đổi tên tiện ích</small></span>';
   b.addEventListener('click',()=>showConfig(true));grid.prepend(b);
  }
  if(!$('ktx98ConfigPanel')){
   const panel=document.createElement('section');panel.id='ktx98ConfigPanel';panel.hidden=true;
   panel.innerHTML='<div class="ktx98-config-head"><h2>Cấu hình hệ thống</h2><button type="button" id="ktx98ConfigBack">← Quay lại</button></div><div class="ktx98-config-grid"><button type="button" data-ktx98-config="brand"><b>Cấu hình thương hiệu</b><small>Logo, tên ứng dụng và hình ảnh</small></button><button type="button" data-ktx98-config="settings"><b>Cài đặt hệ thống</b><small>Sức chứa và cấu hình KTX</small></button><button type="button" data-ktx98-config="labels"><b>Đổi tên tiện ích</b><small>Thay đổi nhãn hiển thị</small></button></div><p id="ktx98ConfigHint" role="status"></p>';
   hub.append(panel);
   panel.querySelector('#ktx98ConfigBack').addEventListener('click',()=>showConfig(false));
   panel.querySelectorAll('[data-ktx98-config]').forEach(btn=>btn.addEventListener('click',()=>{
    const kind=btn.dataset.ktx98Config;
    if(kind!=='brand'&&!isAdmin()){$('ktx98ConfigHint').textContent='Chỉ tài khoản Quản trị được thay đổi mục này.';return;}
    $('ktx98ConfigHint').textContent='';configActions[kind]();
   }));
  }
 }
 function showConfig(open){mountConfig();const hub=$('sysfunc'),panel=$('ktx98ConfigPanel');if(!hub||!panel)return;
  panel.hidden=!open;[...hub.children].forEach(child=>{if(child!==panel)child.classList.toggle('ktx98-config-inactive',open)});
  if(open){panel.scrollIntoView({block:'start',behavior:'auto'});$('ktx98ConfigHint').textContent='';}
 }
 // Capture nav click then mount after the legacy sysfuncPage replaces its innerHTML.
 document.addEventListener('click',e=>{
  if(e.target.closest('nav [data-p="sysfunc"], [data-sys-go="sysfunc"], #ktx98ConfigOpen'))setTimeout(mountConfig,70);
 },true);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mountConfig,150),{once:true});else setTimeout(mountConfig,150);

 // PDF Mobile V4: disable legacy modal. Route all old event callers to the mobile page.
 // The original #t5 DOM is moved by sync-bundle-08, preserving all tool event handlers.
 window.addEventListener('ktx98-open-pdf',function(){
  if(typeof window.KTX_MOBILE_OPEN_PDF==='function')window.KTX_MOBILE_OPEN_PDF();
 });
})();
