(function(){
  /* Keep native feature and permission routing. Only normalize names/icons. */
  // v1.0.62: these shortcuts already exist in the primary sidebar.
  // Remove duplicates by visible caption, regardless of the layer that added them.
  const redundantUtilityNames = new Set([
    'danh sách công nhân', 'quản lý dãy', 'đăng ký tạm trú',
    'điều chuyển - nghỉ việc', 'điều chuyển · nghỉ việc', 'qr code'
  ]);
  function cleanUtilityDuplicates(){
    const hub=document.getElementById('utilhub');
    if(!hub) return;
    hub.querySelectorAll('.sysfunc-grid > button, .sysfunc-grid > a').forEach(btn=>{
      const heading=btn.querySelector('b') || btn.querySelector('strong');
      const name=(heading?heading.textContent:btn.textContent||'').trim().replace(/\s+/g,' ').toLowerCase();
      if(redundantUtilityNames.has(name)) btn.remove();
    });
  }
  function enhance(){
    const p=typeof page==='undefined'?'':page;
    if(p!=='utilhub'&&p!=='sysfunc')return;
    const el=document.getElementById(p);if(!el||el.classList.contains('hide'))return;
    cleanUtilityDuplicates();
    el.querySelectorAll('.sysfunc-btn').forEach((btn,i)=>{
      const title=btn.querySelector('b');if(!title)return;
      title.textContent=title.textContent.replace('Danh mục dụng vụ VS','Danh mục dụng cụ VS');
      const icon=btn.querySelector('.sficon');
      if(icon&&icon.textContent.trim()==='🍱'){icon.textContent='🍽';}
      const classes=['sf-warn','sf-danger','sf-purple','sf-green'];
      if(!btn.classList.contains('sf-warn')&&!btn.classList.contains('sf-danger')&&!btn.classList.contains('sf-purple')&&!btn.classList.contains('sf-green'))btn.classList.add(classes[i%classes.length]);
    });
  }
  const oldAll=window.all;if(typeof oldAll==='function')window.all=function(){const r=oldAll.apply(this,arguments);enhance();return r};
  const oldGo=window.go;if(typeof oldGo==='function')window.go=function(){const r=oldGo.apply(this,arguments);enhance();return r};
  // Handle deferred feature injection or re-render without touching other pages.
  document.addEventListener('DOMContentLoaded',()=>{
    enhance();
    const hub=document.getElementById('utilhub');
    if(hub){
      let cleaning=false;
      new MutationObserver(()=>{
        if(cleaning)return;
        cleaning=true;
        try{cleanUtilityDuplicates();}finally{cleaning=false;}
      }).observe(hub,{childList:true,subtree:true});
    }
  });
})();
