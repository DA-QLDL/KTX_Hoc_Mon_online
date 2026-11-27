(function(){
'use strict';
function init(){
 const wrapper=document.getElementById('ktxMoreActions'),toggle=document.getElementById('ktxMoreToggle'),panel=document.getElementById('ktxMorePanel');
 if(!wrapper||!toggle||!panel)return;
 const close=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false')};
 toggle.addEventListener('click',e=>{e.stopPropagation();panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden))});
 document.addEventListener('click',e=>{if(!wrapper.contains(e.target))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.querySelectorAll('nav [data-p]').forEach(n=>n.addEventListener('click',close));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
