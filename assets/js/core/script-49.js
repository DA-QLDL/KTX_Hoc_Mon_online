
(function(){
 const utilities=new Set(['meal','t2','t5','t7']);
 function refreshUtilBack(){
  const old=document.getElementById('step138UtilBack');if(old)old.remove();
  if(!utilities.has(window.page||page))return;
  const section=document.getElementById(page);if(!section||section.classList.contains('hide'))return;
  const b=document.createElement('button');b.id='step138UtilBack';b.type='button';b.textContent='← Quay lại Tiện ích';
  b.onclick=function(){window.go('utilhub')};
  section.insertBefore(b,section.firstChild);
 }
 function refreshResidence(){
  const side=document.querySelector('nav button[data-p="t6"]');if(side)side.innerHTML=side.innerHTML.replace(/Tạm trú tạm vắng|Tạm trú · Tạm vắng/g,'Đăng ký tạm trú');
  if(typeof T!=='undefined')T.t6=['Đăng ký tạm trú','Theo dõi tình trạng và ngày đăng ký tạm trú của công nhân'];
  if(typeof TS!=='undefined'&&TS.tab!=='tt'){TS.tab='tt';TS.f='';TS.sel.clear()}
  if(page==='t6'){
   const title=document.getElementById('ttl'),desc=document.getElementById('sub');
   if(title)title.textContent='Đăng ký tạm trú';if(desc)desc.textContent='Theo dõi tình trạng và ngày đăng ký tạm trú của công nhân';
  }
 }
 const previousGo=window.go;
 window.go=function(p){
  if(p==='t6'&&typeof TS!=='undefined'){TS.tab='tt';TS.f='';}
  const result=previousGo.apply(this,arguments);
  refreshResidence();refreshUtilBack();return result;
 };
 if(typeof window.tttv==='function'){
  const prevResidence=window.tttv;
  window.tttv=function(){if(typeof TS!=='undefined')TS.tab='tt';const result=prevResidence.apply(this,arguments);refreshResidence();return result};
 }
 document.addEventListener('DOMContentLoaded',()=>{refreshResidence();refreshUtilBack()});
 window.addEventListener('load',()=>{refreshResidence();refreshUtilBack()});
})();
