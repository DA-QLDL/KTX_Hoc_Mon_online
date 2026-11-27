
(function(){
  if(typeof window==='undefined' || typeof arcRender!=='function') return;
  const __arcRenderStep13=arcRender;
  arcRender=function(){
    __arcRenderStep13();
    const root=document.getElementById('ar_t');
    if(!root) return;
    root.querySelectorAll('table tbody tr').forEach(r=>{
      r.onclick=null;
      r.ondblclick=null;
      r.onkeydown=null;
      r.removeAttribute('tabindex');
      r.removeAttribute('title');
      r.style.cursor='default';
    });
    const q=document.getElementById('vquick');
    if(q && typeof page!=='undefined' && page==='arc') q.classList.add('hide');
  };
  if(typeof page!=='undefined' && page==='arc') setTimeout(()=>arcRender(),0);
})();
