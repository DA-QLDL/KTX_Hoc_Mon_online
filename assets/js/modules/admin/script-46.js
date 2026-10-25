
(function(){
  const SYSTEM_PAGES=new Set(['adminboard','acc','access','activity','security','sync','backup','dataaudit','standards','safety','health','incidents','alerts','opsboard','log','reportauto','maintenance','qa','release']);
  function currentPage(){return (typeof page!=='undefined'&&page)||document.body.dataset.page||''}
  function addBack(){
    const p=currentPage(); if(!SYSTEM_PAGES.has(p)) return;
    const sec=document.getElementById(p); if(!sec) return;
    if(sec.querySelector(':scope > .system-backbar')) return;
    const b=document.createElement('button');b.type='button';b.className='system-backbar';
    b.innerHTML='<span class="back-arrow">←</span><span>Quay lại Chức năng hệ thống</span>';
    b.addEventListener('click',function(){if(typeof go==='function')go('sysfunc')});
    sec.insertBefore(b,sec.firstChild);
  }
  const obs=new MutationObserver(function(){queueMicrotask(addBack)});
  function start(){
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-page']});
    addBack();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  document.addEventListener('click',function(){setTimeout(addBack,0)},true);
})();
