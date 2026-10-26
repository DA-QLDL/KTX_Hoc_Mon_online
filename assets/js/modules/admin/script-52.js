
(function(){
 function cleanup(){
  const locked=document.body.classList.contains('auth-locked');
  const gate=document.getElementById('authHubGate');
  [...document.body.childNodes].filter(n=>n.nodeType===3 && /^\s*(?:\\n)+\s*$/.test(n.textContent||'')).forEach(n=>n.remove());
  if(locked){
   if(gate){gate.classList.remove('hide');gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-label','Đăng nhập KTX Hóc Môn')}
   for(const id of ['alertFloat','alertQuickDrawer']){const el=document.getElementById(id);if(el)el.style.setProperty('display','none','important')}
   // Xóa các text node bị chèn nhầm literal \n\n bên ngoài khung đăng nhập.
   [...document.body.childNodes].filter(n=>n.nodeType===3 && /^\s*(?:\\n)+\s*$/.test(n.textContent||'')).forEach(n=>n.remove());
  }else{
   for(const id of ['alertFloat','alertQuickDrawer']){const el=document.getElementById(id);if(el)el.style.removeProperty('display')}
  }
 }
 document.addEventListener('DOMContentLoaded',cleanup);
 window.addEventListener('load',cleanup);
 const obs=new MutationObserver(cleanup);obs.observe(document.body,{attributes:true,attributeFilter:['class']});
 setTimeout(cleanup,0);
})();
