
(function(){
 function pinLogout(){
   const nav=document.querySelector('body>nav');if(!nav)return;
   const brand=nav.querySelector(':scope>.brand');
   let scroller=document.getElementById('step146NavScroll');
   if(!scroller){
     scroller=document.createElement('div');scroller.id='step146NavScroll';
     if(brand)brand.insertAdjacentElement('afterend',scroller);else nav.prepend(scroller);
   }
   // The login gate already hides the sidebar; keep all existing Auth handlers intact.
   Array.from(nav.children).forEach(c=>{
      if(c===brand||c===scroller||c.id==='ft'||c.id==='authUserbar')return;
      scroller.appendChild(c);
   });
   const bar=document.getElementById('authUserbar');
   if(bar && bar.parentElement!==nav)nav.appendChild(bar);
   if(bar){
     if(bar.previousElementSibling?.id==='step146NavScroll'){};
     bar.setAttribute('aria-label','Tài khoản và đăng xuất');
   }
 }
 document.addEventListener('DOMContentLoaded',pinLogout);
 window.addEventListener('load',pinLogout);
 const mo=new MutationObserver(()=>{if(document.getElementById('authUserbar')){pinLogout();mo.disconnect()}});
 document.addEventListener('DOMContentLoaded',()=>{if(!document.getElementById('authUserbar'))mo.observe(document.querySelector('body>nav')||document.body,{childList:true,subtree:false})});
})();
