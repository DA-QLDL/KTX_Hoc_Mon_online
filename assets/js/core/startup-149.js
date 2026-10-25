(()=>{
'use strict';
function notice(message){
 if(document.getElementById('ktx149-rescue'))return;
 const div=document.createElement('aside');div.id='ktx149-rescue';div.setAttribute('role','alert');
 div.style.cssText='position:fixed!important;z-index:2147483647!important;top:calc(16px + env(safe-area-inset-top));left:12px;right:12px;max-width:440px;margin:auto;padding:16px;background:#fff;color:#17375f;border:2px solid #d8e4f4;border-radius:16px;box-shadow:0 12px 40px #172f4966;font:14px/1.5 sans-serif;visibility:visible!important;';
 const title=document.createElement('b');title.textContent='KTX Hóc Môn chưa tải được giao diện';
 const p=document.createElement('p');p.style.margin='8px 0';p.textContent=message;
 const b=document.createElement('button');b.textContent='Thử tải lại';b.type='button';b.style.cssText='padding:11px 14px;border:0;border-radius:9px;background:#246bdf;color:white;font-weight:bold;';b.onclick=()=>location.reload();
 div.append(title,p,b);document.body.appendChild(div);
}
const check=()=>{
 const gate=document.getElementById('authHubGate');
 const mobile=document.getElementById('mobile180');
 const unlocked=!document.body.classList.contains('auth-locked');
 const pageVisible=!!document.querySelector('main:not(.hide)')&&getComputedStyle(document.querySelector('main')||document.body).display!=='none';
 if(gate){
   // An auth gate always takes precedence over recovery diagnostics.
   if(document.body.classList.contains('auth-locked')){
     gate.classList.remove('hide');gate.style.setProperty('visibility','visible','important');
   }
   return;
 }
 if(!pageVisible && !mobile?.textContent?.trim())notice('Ứng dụng không khởi tạo được màn hình đăng nhập hoặc trang chủ. Dữ liệu chưa bị xóa. Hãy kiểm tra kết nối và thử tải lại.');
};
window.addEventListener('load',()=>setTimeout(check,3500),{once:true});
window.addEventListener('error',e=>{if(e.target instanceof HTMLScriptElement && e.target.src?.includes('/assets/js/'))window.__ktx149LoadError=true},true);
})();