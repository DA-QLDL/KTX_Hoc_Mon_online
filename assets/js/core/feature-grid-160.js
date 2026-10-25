(function(){
  const I={people:'i-users',building:'i-bld',food:'i-tool',report:'i-log',qr:'i-qr',register:'i-id',transfer:'i-out',shield:'i-check',clean:'i-tool',fire:'i-log',file:'i-log',database:'i-folder',wrench:'i-tool',chart:'i-chart',duplicate:'i-copy'};
  function shortcut(title, ico, kind, dest, variant){
    const b=document.createElement('button');b.type='button';b.className='sysfunc-btn '+(variant||'');
    b.innerHTML='<span class="sficon"><svg class="i"><use href="#'+(I[ico]||I.file)+'"></use></svg></span><span><b></b></span>';
    b.querySelector('b').textContent=title;
    if(kind==='go') b.onclick=()=>window.go(dest);
    if(kind==='menu') b.onclick=()=>{ if(typeof window.openKiemTraMenuNCC==='function')window.openKiemTraMenuNCC();else window.go('utilhub') };
    return b;
  }
  function decorateUtil(){
    const el=document.getElementById('utilhub');if(!el || el.classList.contains('hide'))return;
    const grid=el.querySelector('.sysfunc-grid');if(!grid)return;
    const isSub=typeof ME!=='undefined'&&ME&&ME.id&&ME.role!=='admin';
    if(!isSub){
      const add=[['Danh sách công nhân','people','go','work',''],['Quản lý dãy','building','go','home','sf-purple'],['Đăng ký tạm trú','register','go','t6','sf-danger'],['Điều chuyển · Nghỉ việc','transfer','go','arc',''],['QR code','qr','go','qr',''],['Báo cáo sự vụ','file','go','u169_bien-ban-su-vu','sf-warn']];
      // Add safe navigation only to actual existing page routes; remove unsupported report shortcut.
      add.filter(x=>x[3]!=='u169_bien-ban-su-vu').reverse().forEach(x=>grid.prepend(shortcut(...x)));
    }
    el.querySelectorAll('.sysfunc-btn').forEach(b=>{ const label=b.querySelector('b')?.textContent||'';
      if(/Sổ theo dõi công nhân tăng\/giảm/.test(label))b.querySelector('b').textContent='Sổ tăng giảm';
      if(/Danh mục dụng vụ VS/.test(label))b.querySelector('b').textContent='Vệ sinh · VPP';
      if(/Sổ theo dõi vi phạm/.test(label))b.querySelector('b').textContent='Vi phạm NCC';
      if(/Checklist bình PCCC/.test(label))b.querySelector('b').textContent='PCCC';
      if(/Cơ sở vật chất KTX/.test(label))b.querySelector('b').textContent='Cơ sở vật chất';
      if(/Kiểm tra & sao lưu tiện ích/.test(label))b.querySelector('b').textContent='Kiểm tra sao lưu';
    });
  }
  function decorateSys(){
    const el=document.getElementById('sysfunc');if(!el||el.classList.contains('hide'))return;
    if(el.dataset.ktx60==='yes')return;
    el.dataset.ktx60='yes';
    // Existing system cards and handlers are retained; the visual presentation alone changes.
    el.querySelectorAll('.sysfunc-btn').forEach(b=>b.querySelector('small')?.setAttribute('aria-hidden','true'));
  }
  function update(){if(typeof page==='undefined')return;if(page==='utilhub')decorateUtil();else if(page==='sysfunc')decorateSys()}
  const origAll=window.all;if(typeof origAll==='function')window.all=function(){const r=origAll.apply(this,arguments);update();return r};
  const origGo=window.go;if(typeof origGo==='function')window.go=function(){const r=origGo.apply(this,arguments);update();return r};
  document.addEventListener('DOMContentLoaded',update);
})();
