(function(){
'use strict';
const KEY='ktx_backup_143_notice_suppressed';
function dismissed(){try{return localStorage.getItem(KEY)==='1'}catch(_){return false}}
function hide(el,persist){if(persist){try{localStorage.setItem(KEY,'1')}catch(_){}}if(el)el.remove()}
function patch(){
 const el=document.getElementById('ktx143Recovery');if(!el)return;
 if(dismissed()){el.remove();return}
 el.style.position='relative';el.style.paddingRight='48px';
 if(!el.querySelector('[data-ktx74-close]')){
  const b=document.createElement('button');b.type='button';b.setAttribute('data-ktx74-close','');b.setAttribute('aria-label','Đóng thông báo sao lưu');b.textContent='×';
  b.style.cssText='position:absolute;right:8px;top:8px;z-index:2;width:36px;height:36px;border:1px solid #d1d5db;border-radius:9px;background:#fff;color:#334155;font-size:24px;cursor:pointer';
  b.onclick=function(e){e.preventDefault();e.stopPropagation();hide(el,false)};el.appendChild(b)
 }
 if(!el.querySelector('[data-ktx74-suppress]') && !el.querySelector('#ktx143Suppress')){
  const b=document.createElement('button');b.type='button';b.className='btn s';b.setAttribute('data-ktx74-suppress','');b.textContent='Không nhắc lại trên thiết bị này';b.style.cssText='margin:8px 0 0 8px';
  b.onclick=function(e){e.preventDefault();e.stopPropagation();hide(el,true)};el.appendChild(b)
 }
}
let busy=false;
function queuePatch(){if(busy)return;busy=true;queueMicrotask(()=>{busy=false;patch()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queuePatch);else queuePatch();
new MutationObserver(queuePatch).observe(document.documentElement,{childList:true,subtree:true});
})();