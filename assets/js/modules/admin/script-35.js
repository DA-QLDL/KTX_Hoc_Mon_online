
(function(){
  const HUB_HTML = `
  <div class="sysfunc-wrap" id="sysfuncForcedContent">
    <div class="sysfunc-intro"><div class="sf-ico"><svg class="i"><use href="#i-cog"></use></svg></div><div><h3>Chức năng hệ thống</h3><p>Tất cả công cụ quản trị, đồng bộ, giám sát và bảo trì được gom tại đây. Bấm vào từng chức năng để mở trang tương ứng.</p></div></div>
    <div class="sysfunc-group"><h3>Quản trị & truy cập</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn sf-purple" type="button" data-force-go="adminboard"><span class="sficon"><svg class="i"><use href="#i-home"></use></svg></span><span><b>Dashboard quản trị</b><small>Tổng hợp tình trạng hệ thống và các chỉ số quản trị.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="acc"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>Quản lý tài khoản</b><small>Tài khoản, vai trò và phạm vi phụ trách.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="access"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>Phân quyền & truy cập</b><small>Kiểm tra ma trận quyền và cấu hình truy cập.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="activity"><span class="sficon"><svg class="i"><use href="#i-users"></use></svg></span><span><b>Hoạt động người dùng</b><small>Theo dõi thao tác quan trọng theo từng tài khoản.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="security"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>Phiên đăng nhập & bảo mật</b><small>Theo dõi phiên hiện tại và dấu hiệu cần rà soát.</small></span></button>
    </div></div>
    <div class="sysfunc-group"><h3>Dữ liệu & đồng bộ</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn sf-green" type="button" data-force-go="sync"><span class="sficon"><svg class="i"><use href="#i-ul"></use></svg></span><span><b>Đồng bộ Supabase</b><small>Đồng bộ dữ liệu giữa nhiều máy và xử lý hàng đợi.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-force-go="backup"><span class="sficon"><svg class="i"><use href="#i-dl"></use></svg></span><span><b>Sao lưu dữ liệu</b><small>Backup thủ công, tự động và khôi phục dữ liệu.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-force-go="dataaudit"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Kiểm tra toàn bộ dữ liệu</b><small>Quét chất lượng, trùng lặp, phòng và cư trú.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="standards"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Chuẩn hóa dữ liệu</b><small>Chuẩn hóa CCCD, SĐT, MNV, KTX, Dãy và Phòng.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="safety"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>An toàn dữ liệu</b><small>Điểm khôi phục và bảo vệ trước thao tác lớn.</small></span></button>
    </div></div>
    <div class="sysfunc-group"><h3>Giám sát & vận hành</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn sf-green" type="button" data-force-go="health"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Sức khỏe hệ thống</b><small>Kiểm tra Internet, Supabase, backup, PWA và dung lượng.</small></span></button>
      <button class="sysfunc-btn sf-danger" type="button" data-force-go="incidents"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Trung tâm sự cố</b><small>Lỗi ứng dụng, đồng bộ, import và lịch sử xử lý.</small></span></button>
      <button class="sysfunc-btn sf-warn" type="button" data-force-go="alerts"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Trung tâm cảnh báo</b><small>Các vấn đề dữ liệu và công việc cần xử lý.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="opsboard"><span class="sficon"><svg class="i"><use href="#i-home"></use></svg></span><span><b>Dashboard vận hành</b><small>Tình hình KTX trong ngày và đầu việc cần xử lý.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="log"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Nhật ký hệ thống</b><small>Lịch sử thao tác và thay đổi dữ liệu.</small></span></button>
    </div></div>
    <div class="sysfunc-group"><h3>Báo cáo & vòng đời hệ thống</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn" type="button" data-force-go="reportauto"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Báo cáo định kỳ</b><small>Lưu chốt số liệu ngày, tuần và tháng.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="maintenance"><span class="sficon"><svg class="i"><use href="#i-tool"></use></svg></span><span><b>Bảo trì & lưu trữ</b><small>Dọn dữ liệu cũ và giữ ứng dụng hoạt động nhẹ.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="qa"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Nghiệm thu Production</b><small>Checklist kiểm thử trước khi phát hành.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="release"><span class="sficon"><svg class="i"><use href="#i-bld"></use></svg></span><span><b>Phát hành v1.0</b><small>Thông tin phiên bản và trạng thái phát hành.</small></span></button>
      <button class="sysfunc-btn sf-purple" type="button" data-force-install="1"><span class="sficon"><svg class="i"><use href="#i-dl"></use></svg></span><span><b>Cài ứng dụng</b><small>Cài KTX Hóc Môn như ứng dụng trên máy tính/điện thoại.</small></span></button>
    </div></div>
    <div class="sysfunc-footer">Các chức năng được gom tại một trang. Quyền truy cập vẫn được kiểm tra khi mở từng chức năng.</div>
  </div>`;

  function wireHub(el){
    el.querySelectorAll('[data-force-go]').forEach(btn=>{btn.onclick=function(){ if(typeof go==='function') go(this.dataset.forceGo); }});
    const install=el.querySelector('[data-force-install]');
    if(install) install.onclick=function(){ if(typeof pwaOpenInstall==='function') pwaOpenInstall(); else { const d=document.getElementById('pwaInstallDlg'); if(d&&d.showModal)d.showModal(); }};
  }
  window.forceSystemHub=function(){
    const el=document.getElementById('sysfunc'); if(!el) return;
    if(!el.querySelector('#sysfuncForcedContent')) el.innerHTML=HUB_HTML;
    wireHub(el);
    const active=(typeof page!=='undefined' && page==='sysfunc');
    el.classList.toggle('hide',!active);
    el.style.removeProperty('display');
    el.style.removeProperty('visibility');
    el.style.removeProperty('opacity');
  };
  document.addEventListener('click',function(e){
    const b=e.target.closest && e.target.closest('button[data-p="sysfunc"]');
    if(b) setTimeout(window.forceSystemHub,0);
  },true);
  document.addEventListener('DOMContentLoaded',function(){
    const el=document.getElementById('sysfunc');
    if(el) el.classList.add('hide');
    if(typeof page!=='undefined' && page==='sysfunc') setTimeout(window.forceSystemHub,0);
  });
  window.addEventListener('load',function(){
    const el=document.getElementById('sysfunc');
    if(typeof page!=='undefined' && page==='sysfunc') setTimeout(window.forceSystemHub,50);
    else if(el) el.classList.add('hide');
  });
  // Luôn đồng bộ trạng thái hiển thị với trang hiện tại.
  const syncHubVisibility=()=>{
    const active=(typeof page!=='undefined' && page==='sysfunc');
    document.body.dataset.page=active?'sysfunc':(typeof page!=='undefined'?page:'');
    const el=document.getElementById('sysfunc');
    if(el) el.classList.toggle('hide',!active);
  };
  document.addEventListener('click',()=>setTimeout(syncHubVisibility,0),true);
  window.addEventListener('popstate',syncHubVisibility);
  setTimeout(syncHubVisibility,0);
})();
