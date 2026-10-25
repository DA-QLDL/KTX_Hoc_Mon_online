(function(){
  /* Keep native feature and permission routing. Only normalize names/icons. */
  function enhance(){
    const p=typeof page==='undefined'?'':page;
    if(p!=='utilhub'&&p!=='sysfunc')return;
    const el=document.getElementById(p);if(!el||el.classList.contains('hide'))return;
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
  document.addEventListener('DOMContentLoaded',enhance);
})();
