
(function(){
  function lock(){document.body.classList.add('auth-locked')}
  function unlock(){document.body.classList.remove('auth-locked')}
  lock();
  function hook(){
    if(typeof window.authHubShow==='function' && !window.authHubShow.__step134){
      const oldShow=window.authHubShow;
      const f=function(){lock();return oldShow.apply(this,arguments)};f.__step134=true;window.authHubShow=f;
    }
    if(typeof window.authHubHide==='function' && !window.authHubHide.__step134){
      const oldHide=window.authHubHide;
      const f=function(){const r=oldHide.apply(this,arguments);unlock();return r};f.__step134=true;window.authHubHide=f;
    }
  }
  hook();
  // STEP133 khởi tạo auth sau ~700ms; hook lại ngắn hạn để bảo đảm không bị code cũ ghi đè.
  let n=0;const tm=setInterval(function(){hook();if(++n>16)clearInterval(tm)},100);
  window.addEventListener('pageshow',function(){
    try{if(!(window.SUPA_SYNC&&SUPA_SYNC.session))lock()}catch(e){lock()}
  });
})();
