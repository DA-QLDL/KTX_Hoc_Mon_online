
/* STEP 14 — Menu thao tác nhanh chỉ hiển thị ở Quản lý công nhân */
(function(){
  if(typeof window==='undefined' || typeof view!=='function') return;
  const __viewStep14=view;
  view=function(w){
    const r=__viewStep14(w);
    const q=document.getElementById('vquick');
    if(q){
      if(typeof page!=='undefined' && page==='work') q.classList.remove('hide');
      else q.classList.add('hide');
    }
    return r;
  };
  // Nếu đang mở Tạm trú · Tạm vắng thì bảo đảm menu nhanh luôn ẩn.
  if(typeof page!=='undefined' && page==='t6'){
    const q=document.getElementById('vquick');
    if(q) q.classList.add('hide');
  }
})();
