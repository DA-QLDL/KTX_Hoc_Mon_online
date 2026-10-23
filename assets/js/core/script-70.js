(function(){
  function applyTopActionVisibility(){
    var tools=document.getElementById('tools');
    var ids=['xt','fxb','undoImport','xw','aw','xr','bs','bn','mnb2','wd','ds2','dsall','gk','imode'];
    var homeOnly=['xt','xr','gk'];
    var workOnly=['imode','xt','fxb','undoImport','xw','aw','xr','bn','mnb2','wd','ds2','dsall'];
    if(!window.$){
      window.$=function(id){return document.getElementById(id)};
    }
    var cur=(typeof page!=='undefined'?page:window.page);
    var more=document.getElementById('ktxMoreActions');if(more)more.classList.toggle('hide',cur!=='work');
    if(cur==='home'){
      ids.forEach(function(id){var e=$(id); if(e) e.classList.toggle('hide', homeOnly.indexOf(id)===-1);});
      if(tools) tools.classList.remove('hide');
      if($('gk')) $('gk').classList.add('home-ktx-select');
    }else if(cur==='work'){
      ids.forEach(function(id){var e=$(id); if(e) e.classList.toggle('hide', workOnly.indexOf(id)===-1);});
      if(tools) tools.classList.remove('hide');
      if($('gk')) $('gk').classList.remove('home-ktx-select');
    }else{
      ids.forEach(function(id){var e=$(id); if(e) e.classList.add('hide');});
      if(tools) tools.classList.add('hide');
      if($('gk')) $('gk').classList.remove('home-ktx-select');
    }
  }
  window.syncTopActions=applyTopActionVisibility;
  document.addEventListener('DOMContentLoaded',applyTopActionVisibility);
  window.addEventListener('load',applyTopActionVisibility);
})();
