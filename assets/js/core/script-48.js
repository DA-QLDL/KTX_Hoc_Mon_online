
(function(){
  function decorateStatusPills(){
    document.querySelectorAll('#work .tag, #work .pl, #home .tag, #t6 .tag, #t6 .pl').forEach(el=>{
      const t=(el.textContent||'').trim().toLowerCase();
      el.classList.remove('status-pill-yes','status-pill-no');
      if(/đã đăng ký tạm trú|đã tạm trú|đã đăng ký tạm vắng|đã khai báo/.test(t)) el.classList.add('status-pill-yes');
      else if(/chưa đăng ký|chưa khai báo|chưa tạm trú/.test(t)) el.classList.add('status-pill-no');
    });
  }

  function ensureUtilHub(){
    if(!document.getElementById('utilhub')){
      const host=document.getElementById('sysfunc');
      if(host) host.insertAdjacentHTML('afterend','<section id="utilhub" class="hide"></section>');
    }
    if(typeof T!=='undefined' && !T.utilhub) T.utilhub=['Tiện ích','Tập trung các công cụ tiện ích trong một trang'];
    if(typeof GN!=='undefined') GN.utilhub='Tiện ích';
    const grp=[...document.querySelectorAll('.grp')].find(g=>/Tiện ích/.test(g.textContent||''));
    if(grp){
      grp.id='utilityNavGroup';
      grp.classList.remove('open');
      const h=grp.querySelector('.gh');
      if(h && !h.dataset.utilhubBound){
        h.dataset.utilhubBound='1';
        h.onclick=(e)=>{e.preventDefault();e.stopPropagation();go('utilhub')};
      }
    }
  }

  function utilHubPage(){
    const el=document.getElementById('utilhub'); if(!el) return;
    el.innerHTML=`<div class="utilhub-wrap"><div class="sysfunc-intro"><div class="sf-ico"><svg class="i"><use href="#i-tool"></use></svg></div><div><h3>Tiện ích</h3><p>Các công cụ hỗ trợ được gom gọn vào một nơi để sidebar ngắn hơn và thao tác thuận tiện hơn.</p></div></div>
    <div class="sysfunc-group"><h3>Công cụ tiện ích</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn sf-green" type="button" onclick="window.openKiemTraMenuNCC()"><span class="sficon">🍱</span><span><b>Xem thực đơn</b><small>Tiện ích độc lập: nhập Excel, xem thực đơn Mặn/Chay và định lượng chuẩn.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="meal"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>BC suất ăn</b><small>Lập báo cáo sáng, trưa, chiều; nhập thực đơn và xuất báo cáo.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="ledger167"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Sổ theo dõi công nhân tăng/giảm</b><small>Chốt quân số theo ngày, theo dõi biến động và xuất Excel.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="u169_cosovatchat"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Cơ sở vật chất KTX</b><small>Quản lý danh sách, cập nhật và xuất Excel theo mẫu.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="u169_vs-vpp"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Danh mục dụng vụ VS–VPP</b><small>Quản lý danh sách, cập nhật và xuất Excel theo mẫu.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="u169_vipham-ncc"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Sổ theo dõi vi phạm NCC</b><small>Quản lý danh sách, cập nhật và xuất Excel theo mẫu.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="u169_pccc"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Checklist bình PCCC</b><small>Quản lý danh sách, cập nhật và xuất Excel theo mẫu.</small></span></button>
      <button class="sysfunc-btn sf-purple" type="button" data-util-go="t2"><span class="sficon"><svg class="i"><use href="#i-copy"></use></svg></span><span><b>Lọc trùng</b><small>Quét trùng trong danh sách công nhân hiện tại và dữ liệu so sánh.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="t5"><span class="sficon"><svg class="i"><use href="#i-pic"></use></svg></span><span><b>PDF → ảnh</b><small>Chuyển file PDF thành ảnh PNG/JPG để dùng nhanh.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="u169_backup"><span class="sficon"><svg class="i"><use href="#i-folder"></use></svg></span><span><b>Kiểm tra &amp; sao lưu tiện ích</b><small>Xem và sao lưu 5 tiện ích trước khi cập nhật.</small></span></button><button class="sysfunc-btn sf-warn" type="button" data-util-go="t7"><span class="sficon"><svg class="i"><use href="#i-folder"></use></svg></span><span><b>Lưu trữ tài liệu</b><small>Quản lý hợp đồng, công văn, biên bản và các tài liệu khác.</small></span></button>
    </div></div><div class="sysfunc-footer">Các tiện ích vẫn giữ nguyên quyền sử dụng và chức năng cũ, chỉ thay đổi cách bố trí hiển thị.</div></div>`;
    // STEP238: limited utilities for subaccounts; admins retain the complete hub.
    const sub238=typeof ME!=='undefined'&&ME.id&&ME.role!=='admin';
    if(sub238){
      const allowed238=new Set(['meal','t2','incident152']);
      el.querySelectorAll('[data-util-go]').forEach(b=>{if(!allowed238.has(b.dataset.utilGo))b.remove()});
      el.querySelectorAll('.sysfunc-footer').forEach(n=>n.remove());
    }
    el.querySelectorAll('[data-util-go]').forEach(b=>b.onclick=()=>go(b.dataset.utilGo));
  }

  const _all = window.all;
  window.all = function(){
    if(page==='utilhub'){
      pill();
      utilHubPage();
      if(typeof applyPerms==='function') applyPerms();
      if(typeof syncTopActions==='function') syncTopActions();
      if(typeof updateAlertBadges==='function') updateAlertBadges();
      decorateStatusPills();
      return;
    }
    const r = _all.apply(this, arguments);
    decorateStatusPills();
    return r;
  };

  const _go = window.go;
  window.go = function(p){
    ensureUtilHub();
    if(typeof ME!=='undefined'&&ME.id&&ME.role!=='admin'){
      const denied238=new Set(['sysfunc','sync','backup','health','dataaudit','safety','standards','adminboard','acc','access','activity','security','opsboard','incidents','maintenance','qa','release','reportauto','log','t5','t7','ledger167','u169_cosovatchat','u169_vs-vpp','u169_vipham-ncc','u169_pccc','u169_backup']);
      if(denied238.has(p)){alert('Tài khoản không có quyền mở chức năng này.');p='utilhub'}
    }
    if(p==='utilhub'){
      document.body.dataset.page='utilhub';
      page='utilhub';
      document.querySelectorAll('nav button[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
      if(typeof T!=='undefined') Object.keys(T).forEach(k=>{ const node=document.getElementById(k); if(node) node.classList.toggle('hide',k!==p); });
      const utilEl=document.getElementById('utilhub'); if(utilEl) utilEl.classList.remove('hide');
      const tools=document.getElementById('tools'); if(tools) tools.classList.add('hide');
      const ttl=document.getElementById('ttl'), sub=document.getElementById('sub'), eb=document.getElementById('eb');
      if(ttl) ttl.textContent='Tiện ích';
      if(sub) sub.textContent='Các công cụ hỗ trợ được gom tại một trang giống Chức năng hệ thống';
      if(eb) eb.textContent='Tiện ích';
      window.scrollTo(0,0);
      window.all();
      return;
    }
    const r = _go.apply(this, arguments);
    ensureUtilHub();
    return r;
  };

  // Ghi đè bảng Tạm trú/Tạm vắng: cột Ngày đăng ký thể hiện ngày hoặc pill Chưa đăng ký.
  window.tl = function(){
    const L=tfl(),sh=L.slice(0,200),tab=TS.tab;
    $('tl').innerHTML=`<div class="wrap"><table class="cmp"><colgroup><col style="width:3%"><col style="width:4%"><col style="width:7%"><col style="width:15%"><col style="width:6%"><col style="width:9%"><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:9%"></colgroup><tr><th><input type="checkbox" id="ta" aria-label="Chọn tất cả"></th><th>STT</th><th>MNV</th><th>Họ và tên</th><th>Giới tính</th><th>Năm sinh</th><th>Số điện thoại</th><th>Xã</th><th>Tỉnh/TP</th><th>Số CCCD</th><th>Ngày đăng ký</th></tr>${sh.map((w,i)=>{const [xa,tinh]=addrXT(w);const raw=String(tab==='tv'?(w.tv&&(w.tv.reg||w.tv.from)||''):(w.tt||'')).slice(0,10);const hasDate=!!raw;const shown=hasDate?`<span class="pl tt-yes">${vn(raw)}</span>`:`<span class="pl tt-no">Chưa đăng ký</span>`;const tip=tab==='tv'&&w.tv?` title="${esc('Tạm vắng từ '+vn(w.tv.from)+(w.tv.to?' đến '+vn(w.tv.to):'')+(w.tv.why?': '+w.tv.why:''))}"`:'';return `<tr class="${isNu(w.gt)?'fm':''}"><td><input type="checkbox" class="tk" data-i="${w.id}" ${TS.sel.has(w.id)?'checked':''}></td><td>${i+1}</td><td>${esc(w.mnv)}</td><td><b>${esc(w.name)}</b></td><td>${gp(w.gt)}</td><td>${vn(w.dob)}</td><td>${esc(w.sdt)}</td><td>${esc(xa)}</td><td>${esc(tinh)}</td><td>${esc(w.cccd)}</td><td${tip}>${shown}</td></tr>`}).join('')||'<tr><td colspan="11" class="mut">Không có dữ liệu. Hãy import danh sách công nhân trước.</td></tr>'}</table></div><div class="mut" style="margin-top:8px">${L.length.toLocaleString('vi-VN')} kết quả${L.length>200?' (hiển thị 200 dòng đầu, hãy lọc để thu hẹp)':''}</div>`;
    const un=()=>{$('tn').textContent=TS.sel.size?'Đã chọn '+TS.sel.size+' người':''};un();
    document.querySelectorAll('.tk').forEach(c=>c.onchange=()=>{c.checked?TS.sel.add(c.dataset.i):TS.sel.delete(c.dataset.i);un()});
    $('ta').onchange=e=>{L.forEach(w=>e.target.checked?TS.sel.add(w.id):TS.sel.delete(w.id));document.querySelectorAll('.tk').forEach(c=>c.checked=e.target.checked);un()};
    decorateStatusPills();
  };

  function markQrTabsSelected(){
    document.querySelectorAll('#qr [data-qt]').forEach(btn=>btn.classList.toggle('on', btn.textContent.trim().startsWith(({make:'Tạo mã QR',scan:'Xác nhận vào/ra',regin:'Duyệt đăng ký vào',regout:'Duyệt đăng ký ra'}[window.QT]||''))));
  }
  const _qrPage = window.qrPage;
  if(typeof _qrPage==='function'){
    window.qrPage = function(){ const r=_qrPage.apply(this,arguments); markQrTabsSelected(); return r; };
  }

  window.addEventListener('load',()=>{ ensureUtilHub(); decorateStatusPills(); });
  document.addEventListener('DOMContentLoaded',()=>{ ensureUtilHub(); decorateStatusPills(); });
})();
