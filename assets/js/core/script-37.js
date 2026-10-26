
(function(){'use strict';
 function fit(){
  document.querySelectorAll('.u169-wrap iframe').forEach(function(frame){
   if(frame.closest('.hide'))return;
   var top=frame.getBoundingClientRect().top;
   var usable=Math.max(360, Math.floor(window.innerHeight-top-12));
   frame.style.setProperty('height',usable+'px','important');
   frame.style.setProperty('min-height',Math.min(360,usable)+'px','important');
  });
 }
 window.addEventListener('resize',function(){requestAnimationFrame(fit)},{passive:true});
 window.addEventListener('orientationchange',function(){setTimeout(fit,180)},{passive:true});
 document.addEventListener('click',function(e){if(e.target.closest('[data-p],.u169-head button,.utilhub-card,.utilhub-btn'))setTimeout(fit,65)},{passive:true});
 var oldGo=window.go;
 function attach(){
  if(typeof window.go==='function'&&window.go!==oldGo){oldGo=window.go;}
  if(typeof window.go==='function'&&!window.go.__fit178){var original=window.go;window.go=function(){var result=original.apply(this,arguments);requestAnimationFrame(fit);setTimeout(fit,80);return result};window.go.__fit178=true}
 }
 document.addEventListener('DOMContentLoaded',function(){attach();setTimeout(fit,150)});
 window.addEventListener('load',function(){attach();setTimeout(fit,200)});
})();
