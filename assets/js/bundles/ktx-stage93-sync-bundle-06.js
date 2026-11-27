/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/script-48.js >>> */

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
      // Preserve the user's expanded/collapsed navigation state.
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
      <button class="sysfunc-btn sf-green" type="button" data-util-go="ledger167"><span class="sficon"><svg class="util-modern-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4h16v16H4Z"/><path d="M8 8h8M8 12h3M8 16h3M14 15l2-2 2 2M16 13v5"/></svg></span><span><b>Sổ theo dõi công nhân tăng/giảm</b><small>Chốt quân số theo ngày, theo dõi biến động và xuất Excel.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="u169_cosovatchat"><span class="sficon"><svg class="util-modern-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-7h6v7M8 10h1M15 10h1"/></svg></span><span><b>Cơ sở vật chất KTX</b><small>Quản lý danh sách, cập nhật và xuất Excel theo mẫu.</small></span></button>
      <button class="sysfunc-btn sf-purple" type="button" data-util-go="t7"><span class="sficon"><svg class="i"><use href="#i-folder"/></svg></span><span><b>Kho tài liệu</b><small>Xem và thao tác theo phân quyền Kho tài liệu đã được cấp.</small></span></button>
      <button class="sysfunc-btn sf-purple" type="button" data-util-go="t2"><span class="sficon"><svg class="util-modern-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="12" height="12" rx="2"/><rect x="9" y="9" width="12" height="12" rx="2"/><path d="m12 16 2 2 4-4"/></svg></span><span><b>Lọc trùng</b><small>Quét trùng trong danh sách công nhân hiện tại và dữ liệu so sánh.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-util-go="t5"><span class="sficon"><svg class="util-modern-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h10l4 4v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v5h5M7 17l3-3 2 2 2-3 3 4M8 10h3"/></svg></span><span><b>Tiện ích PDF</b><small>Chuyển đổi, nén, gộp, sắp xếp, xoay và chỉnh sửa PDF.</small></span></button>


    </div></div><div class="sysfunc-footer">Các tiện ích vẫn giữ nguyên quyền sử dụng và chức năng cũ, chỉ thay đổi cách bố trí hiển thị.</div></div>`;
    // STEP238: limited utilities for subaccounts; admins retain the complete hub.
    const sub238=typeof ME!=='undefined'&&ME.id&&ME.role!=='admin';
    if(sub238){
      const allowed238=new Set(['meal','t2','t7','incident152','ledger167','u169_cosovatchat']);
      el.querySelectorAll('[data-util-go]').forEach(b=>{if(!allowed238.has(b.dataset.utilGo))b.remove()});
      el.querySelectorAll('.sysfunc-footer').forEach(n=>n.remove());
    }
    // V2.0.143: The meal report and menu viewer are already on the primary sidebar.
    // Keep utility shortcuts unique and order visible tiles in Vietnamese A-Z.
    const grid=el.querySelector('.sysfunc-grid');
    if(grid){
      // v2207: render the vendor entry as a native part of each Utilities
      // redraw, rather than relying on an observer to add it afterwards.
      // This also works for restricted staff utility lists.
      const vendorButton=document.createElement('button');
      vendorButton.type='button';
      vendorButton.id='ktxVendorDirections2202';
      vendorButton.className='sysfunc-btn sf-green';
      vendorButton.setAttribute('aria-label','Địa chỉ nhà cung cấp và dẫn đường');
      vendorButton.innerHTML='<span class="sficon" aria-hidden="true">⌖</span><span><b>Địa chỉ nhà cung cấp</b><small>Chọn nhà cung cấp và mở Google Maps dẫn đường</small></span>';
      vendorButton.addEventListener('click',()=>{
        if(typeof window.KTXVendorDirectionsOpen==='function')window.KTXVendorDirectionsOpen();
        else alert('Chức năng Địa chỉ nhà cung cấp chưa tải được. Vui lòng tải lại ứng dụng.');
      });
      grid.appendChild(vendorButton);
      const collator=new Intl.Collator('vi',{sensitivity:'base',numeric:true});
      [...grid.querySelectorAll(':scope > button')]
        .sort((a,b)=>collator.compare(
          (a.querySelector('b')?.textContent||'').trim(),
          (b.querySelector('b')?.textContent||'').trim()))
        .forEach(button=>grid.appendChild(button));
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
    // PC Kho tài liệu opens its actual Supabase-backed section.
    if(typeof ME!=='undefined'&&ME.id&&ME.role!=='admin'){
      const denied238=new Set(['sysfunc','sync','backup','health','dataaudit','safety','standards','adminboard','acc','access','activity','security','opsboard','incidents','maintenance','qa','release','reportauto','t5','u169_vs-vpp','u169_vipham-ncc','u169_pccc','u169_backup']);
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

  // Tạm trú: dùng duy nhất bộ dựng bảng và sắp xếp trong script-08.js.

  function markQrTabsSelected(){
    document.querySelectorAll('#qr [data-qt]').forEach(btn=>btn.classList.toggle('on', btn.textContent.trim().startsWith(({make:'Tạo mã QR',scan:'Xác nhận vào/ra',regin:'Duyệt đăng ký vào',regout:'Duyệt đăng ký ra'}[window.QT]||''))));
  }
  const _qrPage = window.qrPage;
  if(typeof _qrPage==='function'){
    window.qrPage = function(){ const r=_qrPage.apply(this,arguments); markQrTabsSelected(); return r; };
  }

  // One bootstrap only: load fires after DOMContentLoaded and used to duplicate work.
  function initUtilHubOnce(){ ensureUtilHub(); decorateStatusPills(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initUtilHubOnce,{once:true});
  else initUtilHubOnce();
})();

;
/* >>> Original: assets/js/core/script-49.js >>> */

(function(){
 const utilities=new Set(['meal','t2','t5','t7']);
 function refreshUtilBack(){
  // Remove legacy extra back bar if a previous navigation created one.
  document.getElementById('step138UtilBack')?.remove();
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

;
/* >>> Original: assets/js/modules/rooms/script-50.js >>> */

(function(){
  function updateRoomFilter139(){
    const root=document.getElementById('home');if(!root)return;
    const mode=typeof ROOM_FILTER!=='undefined'?ROOM_FILTER:'all';
    root.querySelectorAll('.room-filterbar [data-rf]').forEach(b=>{const active=b.dataset.rf===mode;b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});
    // Tính quân số một lượt thay vì quét toàn bộ công nhân cho mỗi phòng.
    // Dùng Map lồng nhau để không gặp xung đột khóa khi mã KTX/dãy/phòng chứa ký tự đặc biệt.
    const counts=new Map();
    const unmappedWorkers=new Map(); // Index worker records by the same KTX/Day/Room key as the plan.
    for(const w of W){
      const k=K(w),d=D(w),r=String(R(w));
      let byDay=counts.get(k);if(!byDay){byDay=new Map();counts.set(k,byDay)}
      let byRoom=byDay.get(d);if(!byRoom){byRoom=new Map();byDay.set(d,byRoom)}
      byRoom.set(r,(byRoom.get(r)||0)+1);
      let workersDay=unmappedWorkers.get(k);if(!workersDay){workersDay=new Map();unmappedWorkers.set(k,workersDay)}
      let workersRoom=workersDay.get(d);if(!workersRoom){workersRoom=new Map();workersDay.set(d,workersRoom)}
      let people=workersRoom.get(r);if(!people){people=[];workersRoom.set(r,people)}
      people.push(w);

    }
    // Những phòng có công nhân nhưng chưa có ô trong sơ đồ cần được báo cáo, tránh bỏ sót quân số.
    const unmatchedRooms=[];
    const seenRoomKeys=new Map();
    let visible=0;
    const stats={rooms:0,occupied:0,free:0,full:0,over:0,availableBeds:0,overCapacity:0};
    root.querySelectorAll('.room-cell[data-k][data-d][data-r]').forEach(c=>{
      const k=c.dataset.k,d=c.dataset.d,r=c.dataset.r;
      let knownD=seenRoomKeys.get(k);if(!knownD){knownD=new Map();seenRoomKeys.set(k,knownD)}
      let knownR=knownD.get(d);if(!knownR){knownR=new Set();knownD.set(d,knownR)}
      knownR.add(String(r));
      const count=counts.get(k)?.get(d)?.get(String(r))||0;
      const capacity=Number(CAP);
      const validCapacity=Number.isFinite(capacity)&&capacity>0;
      const spare=validCapacity?Math.max(0,capacity-count):0;
      // Trạng thái chỉ đọc: không chỉnh sửa nội dung phòng hoặc dữ liệu công nhân.
      c.classList.toggle('ktx-room-over-capacity',validCapacity&&count>capacity);
      c.classList.toggle('ktx-room-at-capacity',validCapacity&&count===capacity);
      c.dataset.occupancyStatus=!validCapacity?'unknown':count>capacity?'over':count===capacity?'full':'available';
      c.setAttribute('aria-label',`Phòng ${r}, dãy ${d}, KTX ${k}: ${count} người${validCapacity?`, sức chứa ${capacity}, còn ${spare} chỗ`:`, chưa có cấu hình sức chứa hợp lệ`}`);
      stats.rooms++; stats.occupied+=count; stats.availableBeds+=spare;
      if(validCapacity&&count===capacity) stats.full++;
      if(validCapacity&&count>capacity){stats.over++;stats.overCapacity+=count-capacity}
      if(validCapacity&&count<capacity) stats.free++;
      const show=mode==='all'||mode==='free5'&&spare>=5||mode==='low'&&spare>=1&&spare<=3||mode==='full'&&validCapacity&&count===capacity||mode==='over'&&validCapacity&&count>capacity;
      c.classList.toggle('ktx-room-filter-hidden',!show);
      if(show)visible++;
    });
    // Đối chiếu số phòng đang có người với ô phòng trong sơ đồ (chỉ đọc).
    for(const [k,days] of counts)for(const [d,rooms] of days)for(const [r,n] of rooms){
      if(!seenRoomKeys.get(k)?.get(d)?.has(r))unmatchedRooms.push({k,d,r,n});
    }
    // Hiển thị thống kê đọc từ các phòng đang có trên sơ đồ; không ghi dữ liệu Supabase.
    const filterBar=root.querySelector('.room-filterbar');
    if(filterBar){
      let summary=root.querySelector('.ktx-room-filter-summary');
      if(!summary){summary=document.createElement('div');summary.className='ktx-room-filter-summary';summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');filterBar.insertAdjacentElement('afterend',summary)}
      summary.textContent=`Hiển thị ${visible}/${stats.rooms} phòng · Đang ở ${stats.occupied} người · ${Number.isFinite(Number(CAP))&&Number(CAP)>0?'Còn '+stats.availableBeds+' chỗ (theo '+CAP+' chỗ/phòng)':'Sức chứa chưa được cấu hình hợp lệ'} · Đầy ${stats.full} phòng · Quá tải ${stats.over} phòng${stats.overCapacity?' ('+stats.overCapacity+' người vượt sức chứa)':''}${unmatchedRooms.length?' · '+unmatchedRooms.length+' phòng có công nhân chưa nằm trên sơ đồ':''}`;
    }
    // V2.0.160: Ngừng tạo nút Xuất thống kê phòng (CSV) theo yêu cầu.
    root.querySelector('#ktxRoomCsvExport')?.remove();
    // Cảnh báo phòng có người nhưng thiếu trên sơ đồ, tránh đánh giá sai tổng công suất.
    let missingPanel=root.querySelector('.ktx-room-unmapped-details');
    if(unmatchedRooms.length&&filterBar){
      if(!missingPanel){missingPanel=document.createElement('details');missingPanel.className='ktx-room-unmapped-details';
        missingPanel.style.cssText='margin:8px 0;padding:10px 12px;border:1px solid #f59e0b;border-radius:10px;background:rgba(255,251,235,.94);font-size:13px';
        const caption=document.createElement('summary');caption.textContent='Phòng có công nhân chưa hiển thị trên sơ đồ — Xem danh sách họ tên';caption.style.cssText='cursor:pointer;font-weight:650;color:#92400e';
        missingPanel.appendChild(caption);(root.querySelector('.ktx-room-filter-summary')||filterBar).insertAdjacentElement('afterend',missingPanel);
      }
      // Preserve expanded state while re-rendering. Build every name with textContent,
      // not innerHTML, so names/room strings cannot inject markup or actions.
      missingPanel.querySelector('.ktx-unmapped-list')?.remove();
      const list=document.createElement('div');list.className='ktx-unmapped-list';
      list.style.cssText='display:grid;gap:8px;margin-top:10px';
      for(const x of unmatchedRooms){
        const group=document.createElement('div');group.className='ktx-unmapped-group';
        group.style.cssText='padding:9px 10px;border:1px solid #fbd38d;border-radius:8px;background:#fff';
        const heading=document.createElement('div');heading.style.cssText='font-weight:650;color:#92400e;margin-bottom:6px';
        const roomText=String(x.r||'').trim();
        heading.textContent=`KTX ${x.k} · Dãy ${x.d} · ${roomText&&roomText!=='?'?'Phòng '+roomText:'Chưa xác định phòng'} · ${x.n} người`;
        group.appendChild(heading);
        const people=unmappedWorkers.get(x.k)?.get(x.d)?.get(x.r)||[];
        const allowed=people.filter(w=>typeof can!=='function'||can('view',w));
        if(!allowed.length){const note=document.createElement('div');note.textContent='Không có hồ sơ được phép xem trong nhóm này.';note.style.cssText='font-size:12px;color:#64748b';group.appendChild(note)}
        for(const person of allowed){
          const row=document.createElement('div');row.className='ktx-unmapped-person';
          row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:7px 0;border-top:1px solid #fef3c7';
          const info=document.createElement('div');info.style.cssText='min-width:0;flex:1 1 160px;overflow-wrap:anywhere';
          const name=document.createElement('strong');name.textContent=String(person.name||'Chưa có họ tên');name.style.cssText='display:block;color:#1e293b;font-size:13px';
          const meta=document.createElement('div');meta.style.cssText='color:#64748b;font-size:11px';
          meta.textContent=`Mã NV: ${String(person.mnv||'Chưa có')} · ${String(x.k)} · ${String(x.d)} · Phòng: ${roomText&&roomText!=='?'?roomText:'Chưa rõ'}`;
          info.append(name,meta);row.appendChild(info);
          const action=document.createElement('button');action.type='button';action.className='btn sm';
          action.textContent='Xem hồ sơ';action.style.cssText='font-size:11px;padding:6px 10px;white-space:nowrap';
          action.addEventListener('click',event=>{
            event.preventDefault();event.stopPropagation();
            if(typeof view==='function')view(person);
          });
          row.appendChild(action);group.appendChild(row);
        }
        if(allowed.length<people.length){const note=document.createElement('div');note.textContent=`${people.length-allowed.length} hồ sơ bị ẩn theo phân quyền`;note.style.cssText='font-size:11px;color:#64748b';group.appendChild(note)}
        list.appendChild(group);
      }
      missingPanel.appendChild(list);
    }else if(missingPanel)missingPanel.remove();
    root.querySelector('.ktx-room-conflict-details')?.remove();
    root.querySelectorAll('.room-day').forEach(d=>d.classList.toggle('ktx-room-filter-empty',!d.querySelector('.room-cell:not(.ktx-room-filter-hidden)')));
    root.querySelectorAll('details.kd').forEach(d=>d.classList.toggle('ktx-room-filter-empty',!d.querySelector('.room-day:not(.ktx-room-filter-empty)')));
    let msg=root.querySelector('.room-filter-empty-message');
    if(!visible&&root.querySelector('.room-filterbar')){
      if(!msg){msg=document.createElement('div');msg.className='room-filter-empty-message';root.querySelector('.roommap-card')?.appendChild(msg)}
      msg.textContent='Không có phòng phù hợp với bộ lọc đã chọn. Vui lòng chọn “Tất cả” hoặc bộ lọc khác.';
    }else if(msg)msg.remove();
  }
  // Giữ nguyên trình xử lý ban đầu, chỉ nâng cấp cách ẩn và trạng thái rỗng.
  window.applyRoomFilter73=updateRoomFilter139;
})();

;
/* >>> Original: assets/js/modules/admin/script-51.js >>> */

(function(){
 function enhanceGate(){
   const card=document.querySelector('#authHubGate .auth-card2');if(!card||card.dataset.step140)return;
   card.dataset.step140='1';
   const tabs=card.querySelector('.auth-tabs2');if(tabs){tabs.insertAdjacentHTML('beforebegin','<div class="auth-login-title140">Đăng nhập hệ thống</div><div class="auth-intro140">Vui lòng xác thực để truy cập các chức năng được phân quyền của KTX Hóc Môn.</div>');}
   const pass=document.getElementById('ahPass');if(pass){pass.closest('label').classList.add('auth-pass140');const btn=document.createElement('button');btn.type='button';btn.className='auth-eye140';btn.textContent='Hiện';btn.setAttribute('aria-label','Hiện hoặc ẩn mật khẩu');btn.onclick=()=>{pass.type=pass.type==='password'?'text':'password';btn.textContent=pass.type==='password'?'Hiện':'Ẩn'};pass.closest('label').append(btn)}
   const login=document.getElementById('ahLogin');if(login&&!document.getElementById('authForgot140')){let btn=document.createElement('button');btn.type='button';btn.id='authForgot140';btn.className='auth-forgot140';btn.textContent='Quên mật khẩu?';btn.onclick=async()=>{const email=(document.getElementById('ahEmail')?.value||'').trim();const msg=document.getElementById('ahMsg');if(!email){msg.textContent='Vui lòng nhập email trước khi yêu cầu đặt lại mật khẩu.';return}try{const sb=syncClient();if(!sb){msg.textContent='Chưa cấu hình Supabase';return}const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});msg.textContent=error?'Không thể gửi yêu cầu: '+error.message:'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư.'}catch(e){msg.textContent='Lỗi: '+e.message}};login.insertBefore(btn,document.getElementById('ahLoginBtn'))}
 }
 function esc140(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  // Scope labels are presentation only: never infer unrestricted authorization from empty arrays.
  // Supabase RLS determines effective access. KTX 1 + KTX 2 = complete current KTX set.
  const acScopeList=(v)=>Array.isArray(v)?[...new Set(v.map(s=>String(s||'').trim()).filter(Boolean))]:[];
  const acScopeKtxLabel=(a)=>{
    const list=acScopeList(a.ktx);
    if(!list.length)return 'Chưa phân công KTX';
    if(['KTX 1','KTX 2'].every(x=>list.includes(x)) && list.length===2 && acScopeList(a.days).length===6 && Array.from({length:6},(_,i)=>'Dãy '+(i+1)).every(x=>acScopeList(a.days).includes(x)))return 'Quản lý chung';
    if(['KTX 1','KTX 2'].every(x=>list.includes(x)) && list.length===2)return 'Tất cả KTX';
    return list.join(', ');
  };
  const acScopeDaysLabel=(a)=>{
    const list=acScopeList(a.days);
    if(['KTX 1','KTX 2'].every(x=>acScopeList(a.ktx).includes(x)) && acScopeList(a.ktx).length===2 && list.length===6 && Array.from({length:6},(_,i)=>'Dãy '+(i+1)).every(x=>list.includes(x)))return 'Quản lý chung';
    return list.length?list.join(', '):'Chưa phân công Dãy/Phòng';
  };
 let selection=null;
 window.accPage=async function(){
  const el=document.getElementById('acc');if(!el)return;if(!can('acct')){el.innerHTML='<div class="card">Chỉ Quản trị được quản lý tài khoản.</div>';return}
  await authLoadAdminData();const accounts=AUTHC.accounts||[], reqs=(AUTHC.requests||[]).filter(r=>r.status==='pending');
  const q=window.__ac140Q||'', role=window.__ac140Role||'', stat=window.__ac140State||'';
  const filtered=accounts.filter(a=>(!q||[a.display_name,a.email,a.role,(a.ktx||[]).join(' '),(a.days||[]).join(' ')].join(' ').toLowerCase().includes(q.toLowerCase()))&&(!role||a.role===role)&&(!stat||(stat==='active'&&a.enabled)||(stat==='locked'&&!a.enabled)));
  const byid=id=>accounts.find(a=>String(a.user_id)===String(id));
  el.innerHTML=`<div class="ac140-stats"><div class="ac140-stat"><small>Tổng tài khoản</small><strong>${accounts.length}</strong></div><div class="ac140-stat"><small>Đang hoạt động</small><strong>${accounts.filter(a=>a.enabled).length}</strong></div><div class="ac140-stat"><small>Đã khóa</small><strong>${accounts.filter(a=>!a.enabled).length}</strong></div><div class="ac140-stat"><small>Chờ duyệt</small><strong>${reqs.length}</strong></div></div>
  <div class="card"><div class="ac140-top"><div><h3 style="margin:0">Tài khoản người dùng</h3><p class="mut" style="font-size:11px;margin:3px 0 0">Quản lý vai trò, phạm vi phụ trách và trạng thái kích hoạt.</p></div><button class="btn" id="ac140Create">+ Tạo / yêu cầu tài khoản</button></div>
  <div class="ac140-search"><input id="ac140Q" placeholder="Tìm họ tên, email, KTX, Dãy..." value="${esc140(q)}"><select id="ac140Role"><option value="">Tất cả vai trò</option>${Object.entries(ROLES).map(([id,n])=>`<option value="${esc140(id)}" ${id===role?'selected':''}>${esc140(n)}</option>`).join('')}</select><select id="ac140State"><option value="">Tất cả trạng thái</option><option value="active" ${stat==='active'?'selected':''}>Đang hoạt động</option><option value="locked" ${stat==='locked'?'selected':''}>Đã khóa</option></select><button class="btn s" id="ac140Refresh">Làm mới</button></div>
  <div class="wrap"><table class="ac140-table"><thead><tr><th>NGƯỜI DÙNG</th><th>VAI TRÒ</th><th>PHẠM VI</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>${filtered.map(a=>`<tr><td><b>${esc140(a.display_name||a.email)}</b><small>${esc140(a.email)}</small></td><td><span class="ac140-pill">${esc140(ROLES[a.role]||a.role)}</span></td><td>${esc140(acScopeKtxLabel(a))}<small>${esc140(acScopeDaysLabel(a))}</small></td><td><span class="ac140-badge ${a.enabled?'':'off'}">${a.enabled?'Hoạt động':'Đã khóa'}</span></td><td><div class="ac223-actions"><button class="btn s sm" data-ac140-edit="${esc140(a.user_id)}">Chỉnh sửa</button><button type="button" class="btn s sm ac223-delete" data-ac223-delete="${esc140(a.user_id)}" ${String(a.user_id)===String(SUPA_SYNC.session?.user?.id)?'disabled title="Không thể xóa tài khoản đang đăng nhập"':''}>Xóa</button></div></td></tr>`).join('')||'<tr><td colspan="5">Không tìm thấy tài khoản phù hợp.</td></tr>'}</tbody></table></div></div>
  <div class="card"><h3>Yêu cầu cấp quyền chờ duyệt (${reqs.length})</h3>${reqs.map(r=>`<div class="ac140-request" data-req="${esc140(r.user_id)}"><div><b>${esc140(r.display_name||r.email)}</b><small style="display:block">${esc140(r.email)}</small></div><select data-req-role>${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${k==='viewer'?'selected':''}>${esc140(v)}</option>`).join('')}</select><small>${r.requested_at?new Date(r.requested_at).toLocaleString('vi-VN'):'—'}</small><div class="row"><button class="btn sm" data-ac140-approve>Duyệt</button><button class="btn s sm" data-ac140-reject>Từ chối</button></div></div>`).join('')||'<p class="mut">Không có yêu cầu chờ duyệt.</p>'}</div>
  <dialog class="ac140-modal" id="ac140Modal"><div class="ac140-modal-head"><h3 style="margin:0">Chỉnh sửa tài khoản</h3><button class="btn s sm" id="ac140Close">Đóng</button></div><div class="ac140-modal-body"><div class="ac140-fields"><label>Họ và tên<input id="ac140Name" disabled></label><label>Email<input id="ac140Email" disabled><small>Thông tin xác thực do Supabase Auth quản lý</small></label><label>Vai trò<select id="ac140EditRole">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}">${esc140(v)}</option>`).join('')}</select></label><label>Trạng thái<select id="ac140Enabled"><option value="true">Hoạt động</option><option value="false">Đã khóa</option></select></label><div class="ac140-scope-field"><div class="ac140-scope-label">Phạm vi KTX</div><div id="ac140Ktx" class="ac140-checkbox-grid" role="group" aria-label="Chọn KTX được phân quyền"></div><small>Đánh dấu các KTX được giao. Không chọn = không giới hạn phạm vi.</small></div><div class="ac140-scope-field"><div class="ac140-scope-label">Phạm vi Dãy</div><div id="ac140Days" class="ac140-checkbox-grid" role="group" aria-label="Chọn Dãy được phân quyền"></div><small>Đánh dấu nhiều Dãy trực tiếp, không cần giữ Ctrl.</small></div></div><h3 style="margin:17px 0 4px">Quyền theo vai trò</h3><p class="mut" style="font-size:11px;margin:0">Quyền được áp dụng theo vai trò đang chọn và kiểm tra trên máy chủ.</p><div class="ac140-perms" id="ac140Perms"></div></div><div class="ac140-modal-foot"><button class="btn s" id="ac140Cancel">Hủy</button><button class="btn" id="ac140Save">Lưu thay đổi</button></div></dialog>`;
  let timer;document.getElementById('ac140Q').oninput=e=>{const v=e.target.value;clearTimeout(timer);timer=setTimeout(()=>{window.__ac140Q=v;accPage()},280)};
  document.getElementById('ac140Role').onchange=e=>{window.__ac140Role=e.target.value;accPage()};document.getElementById('ac140State').onchange=e=>{window.__ac140State=e.target.value;accPage()};document.getElementById('ac140Refresh').onclick=()=>accPage();
  document.getElementById('ac140Create').onclick=()=>alert('Để bảo mật, tài khoản đăng nhập mới phải được tạo tại màn hình “Tạo yêu cầu tài khoản” của Supabase Auth. Sau đó Quản trị duyệt vai trò và phạm vi ngay tại trang này. Không tạo mật khẩu trực tiếp trên phiên quản trị.');
  const modal=document.getElementById('ac140Modal');const close=()=>modal.close();document.getElementById('ac140Close').onclick=close;document.getElementById('ac140Cancel').onclick=close;
  const renderPerms=()=>{const rr=document.getElementById('ac140EditRole').value,pr=ROLE_PERMS[rr]||{};const labels={view:'Xem dữ liệu',add:'Thêm hồ sơ',editw:'Sửa hồ sơ',transfer:'Chuyển phòng',residence:'Tạm trú',attendance:'Vào/Ra',del:'Xóa',restore:'Khôi phục',qrApprove:'Duyệt QR',import:'Nhập Excel',report:'Xuất báo cáo',backup:'Sao lưu',acct:'Quản lý tài khoản'};document.getElementById('ac140Perms').innerHTML=Object.entries(labels).map(([k,n])=>`<label><input type="checkbox" ${pr[k]?'checked':''} disabled>${esc140(n)}</label>`).join('')};
  document.getElementById('ac140EditRole').onchange=renderPerms;
  // V2.0.148: Never let a missing location helper silently block the Edit button.
  // Supabase account scopes remain the source of truth; no account data is modified here.
  const renderScopeCheckboxes=(container,values,selected)=>{
    const chosen=Array.isArray(selected)?selected.map(String):[];
    const unique=[...new Set([...(Array.isArray(values)?values:[]),...chosen].map(v=>String(v||'').trim()).filter(Boolean))];
    unique.sort((x,y)=>x.localeCompare(y,'vi',{numeric:true}));
    container.replaceChildren();
    for(const value of unique){
      const label=document.createElement('label');label.className='ac140-scope-choice';
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=value;
      checkbox.checked=chosen.includes(value);
      const caption=document.createElement('span');caption.textContent=value;
      label.append(checkbox,caption);container.appendChild(label);
    }
  };
  const readScopeCheckboxes=id=>Array.from(document.querySelectorAll('#'+id+' input[type="checkbox"]:checked')).map(x=>x.value);
  el.querySelectorAll('[data-ac140-edit]').forEach(b=>{
    b.type='button';
    b.onclick=()=>{
      try{
        const a=byid(b.dataset.ac140Edit);
        if(!a)throw Error('Không tìm thấy tài khoản. Vui lòng tải lại danh sách.');
        selection=a.user_id;
        document.getElementById('ac140Name').value=a.display_name||'';
        document.getElementById('ac140Email').value=a.email||'';
        document.getElementById('ac140EditRole').value=a.role||'viewer';
        document.getElementById('ac140Enabled').value=String(!!a.enabled);
        const api=window.KTX_LOCATION_DROPDOWN_V2076;
        const k=document.getElementById('ac140Ktx');
        const d=document.getElementById('ac140Days');
        const existingKtx=Array.isArray(a.ktx)?a.ktx:[];
        const existingDays=Array.isArray(a.days)?a.days:[];
        let siteOptions=['KTX 1','KTX 2','KTX 3'];
        let dayOptions=Array.from({length:6},(_,i)=>'Dãy '+(i+1));
        if(api&&typeof api.ktxList==='function'){
          try{siteOptions=api.ktxList()}catch(e){console.warn('Account KTX dropdown fallback',e)}
        }
        if(api&&typeof api.dayList==='function'){
          try{
            const ktxes=siteOptions.concat(existingKtx);
            dayOptions=[...new Set(ktxes.flatMap(site=>api.dayList(site)||[]).concat(existingDays))];
          }catch(e){console.warn('Account Dãy dropdown fallback',e)}
        }
        renderScopeCheckboxes(k,siteOptions,existingKtx);
        renderScopeCheckboxes(d,dayOptions,existingDays);
        renderPerms();
        if(!modal.open)modal.showModal();
      }catch(error){
        console.error('KTX_V2148_ACCOUNT_EDIT',error);
        alert('Không mở được Chỉnh sửa tài khoản: '+(error?.message||error));
      }
    };
  });
  document.getElementById('ac140Save').onclick=async()=>{const a=byid(selection);if(!a)return;const save=document.getElementById('ac140Save');save.disabled=true;const row=document.createElement('div');row.innerHTML='<select data-role></select><input data-enabled type="checkbox"><input data-ktx><input data-days>';row.querySelector('[data-role]').value=document.getElementById('ac140EditRole').value;row.querySelector('[data-role]').innerHTML=Object.entries(ROLES).map(([k,v])=>`<option value="${k}">${esc140(v)}</option>`).join('');row.querySelector('[data-role]').value=document.getElementById('ac140EditRole').value;row.querySelector('[data-enabled]').checked=document.getElementById('ac140Enabled').value==='true';row.querySelector('[data-ktx]').value=readScopeCheckboxes('ac140Ktx').join(', ');row.querySelector('[data-days]').value=readScopeCheckboxes('ac140Days').join(', ');try{const ok=await window.saveAccountRow(selection,row);if(ok!==true)throw Error('Supabase chưa xác nhận đã lưu phân quyền.');close();await accPage();alert('Đã lưu phân quyền thành công.')}catch(e){alert('Không lưu được phân quyền: '+(e.message||e))}finally{save.disabled=false}};
  // STEP223: account deletion must be performed by authenticated server-side API.
  el.querySelectorAll('[data-ac223-delete]').forEach(button=>button.onclick=async()=>{
    if(ME.role!=='admin'){alert('Chỉ Quản trị được xóa tài khoản.');return}
    const target=byid(button.dataset.ac223Delete);if(!target)return;
    const label=target.display_name||target.email||target.user_id;
    const answer=prompt('XÓA VĨNH VIỄN tài khoản "'+label+'"\nEmail: '+(target.email||'')+'\n\nGõ XOA để xác nhận. Hành động không thể hoàn tác.');
    if(answer!=='XOA')return;
    button.disabled=true;
    try{
      const sb=syncClient();if(!sb)throw Error('Chưa kết nối Supabase.');
      const {data,error}=await sb.auth.getSession();
      if(error||!data?.session?.access_token)throw Error('Phiên Quản trị đã hết hạn.');
      const response=await fetch('/api/admin-delete-user',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+data.session.access_token},body:JSON.stringify({user_id:target.user_id})});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(payload.error||'Máy chủ từ chối xóa tài khoản (HTTP '+response.status+').');
      alert('Đã xóa tài khoản đăng nhập: '+label);await authLoadAdminData();await accPage();
    }catch(e){alert('Chưa xóa tài khoản: '+(e.message||e)+'\nKiểm tra API và cấu hình Vercel.');}
    finally{button.disabled=false}
  });
  el.querySelectorAll('[data-ac140-approve]').forEach(b=>b.onclick=()=>window.reviewRequest(b.closest('[data-req]').dataset.req,true));el.querySelectorAll('[data-ac140-reject]').forEach(b=>b.onclick=()=>window.reviewRequest(b.closest('[data-req]').dataset.req,false));
 };
 const originalGate=window.authHubShow;if(typeof originalGate==='function')window.authHubShow=function(){const result=originalGate.apply(this,arguments);enhanceGate();return result};
 document.addEventListener('DOMContentLoaded',enhanceGate);setTimeout(enhanceGate,0);
})();

;
/* >>> Original: assets/js/modules/admin/script-52.js >>> */

(function(){
 function cleanup(){
  const locked=document.body.classList.contains('auth-locked');
  const gate=document.getElementById('authHubGate');
  [...document.body.childNodes].filter(n=>n.nodeType===3 && /^\s*(?:\\n)+\s*$/.test(n.textContent||'')).forEach(n=>n.remove());
  if(locked){
   if(gate){gate.classList.remove('hide');gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-label','Đăng nhập KTX Hóc Môn')}
   for(const id of ['alertFloat','alertQuickDrawer']){const el=document.getElementById(id);if(el)el.style.setProperty('display','none','important')}
   // Text-node cleanup already runs once at the beginning of cleanup().
  }else{
   for(const id of ['alertFloat','alertQuickDrawer']){const el=document.getElementById(id);if(el)el.style.removeProperty('display')}
  }
 }
 document.addEventListener('DOMContentLoaded',cleanup);
 window.addEventListener('load',cleanup);
 const obs=new MutationObserver(cleanup);obs.observe(document.body,{attributes:true,attributeFilter:['class']});
 setTimeout(cleanup,0);
})();

;
/* >>> Original: assets/js/modules/admin/script-53.js >>> */

(function(){
  const key='latest_good';
  let dbp;
  function db(){return dbp||(dbp=new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(new Error('IndexedDB không được hỗ trợ'));return}
    const r=indexedDB.open('KTX_Durable_Backup_143',1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('snapshots'))r.result.createObjectStore('snapshots')};
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Không mở được IndexedDB'));
  }))}
  async function writeSnapshot(snapshot){const database=await db();await new Promise((resolve,reject)=>{
    const tx=database.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snapshot,key);
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  })}
  async function readSnapshot(){const database=await db();return await new Promise((resolve,reject)=>{
    const tx=database.transaction('snapshots','readonly'),req=tx.objectStore('snapshots').get(key);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  })}
  let saving=false;
  async function save(){if(saving||!Array.isArray(W)||!W.length)return; saving=true;try{
    const v={at:Date.now(),W:JSON.parse(JSON.stringify(W)),ARC:JSON.parse(JSON.stringify(ARC)),LOG:JSON.parse(JSON.stringify(LOG)),ATT:JSON.parse(JSON.stringify(ATT)),REG:JSON.parse(JSON.stringify(REG)),ROOMMETA:JSON.parse(JSON.stringify(ROOMMETA))};
    await writeSnapshot(v);
  }finally{saving=false}}
  window.KTX143_BACKUP={save,read:readSnapshot};
  // V2.0.20: Never show an automatic local-backup recovery banner on any device.
  // IndexedDB snapshots and KTX143_BACKUP.read / save remain available.
  async function recoveryCheck(){
    try{if(typeof W!=='undefined' && Array.isArray(W) && W.length) await save()}catch(_){/* backup remains best effort */}
  }
  function logoutStyle(){const btn=document.getElementById('aubOut');if(!btn)return;
    btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/></svg><span>Đăng xuất</span>';
    btn.setAttribute('aria-label','Đăng xuất khỏi tài khoản hiện tại');
  }
  document.addEventListener('DOMContentLoaded',()=>{logoutStyle();setTimeout(recoveryCheck,1200)});
  window.addEventListener('load',()=>{logoutStyle();setTimeout(recoveryCheck,2600)});
})();

;
/* >>> Original: assets/js/modules/rooms/script-54.js >>> */
/* Day-owner labels are rendered by ktx-assignment-display-v2215 in deferred bundle 10.
   Old duplicate renderer removed: it used partial account cache and overwrote server results. */

;
/* >>> Original: assets/js/modules/admin/script-55.js >>> */

(function(){
 const old=window.accessControlPage;
 window.accessControlPage=async function(){
   if(typeof can==='function'&&!can('acct'))return old&&old();
   if(typeof authLoadAdminData==='function')await authLoadAdminData();
   const groups=[
     ['Hồ sơ và cư trú',[['view','Xem'],['add','Thêm'],['editw','Sửa'],['transfer','Chuyển phòng'],['residence','Tạm trú']]],
     ['Vận hành và QR',[['attendance','Vào / ra'],['qrApprove','Duyệt QR'],['report','Báo cáo'],['import','Import'],['bulk','Hàng loạt']]],
     ['Dữ liệu nhạy cảm',[['del','Xóa'],['restore','Khôi phục'],['purge','Xóa vĩnh viễn'],['backup','Sao lưu'],['acct','Tài khoản']]]
   ];
   const el=document.getElementById('access');if(!el)return;
   el.innerHTML='<div class="sysfunc-intro"><div><h3>Phân quyền theo nhóm chức năng</h3><p>Ma trận dưới đây phản ánh vai trò chuẩn. Quản lý phạm vi KTX/Dãy tại Quản lý tài khoản; quyền truy cập thực tế do Supabase RLS kiểm soát.</p></div></div><div class="step145-matrix">'+groups.map(([name,fields])=>'<div class="card"><h3>'+name+'</h3><div class="wrap"><table class="step145-perm-table"><thead><tr><th>Vai trò</th>'+fields.map(([k,label])=>'<th>'+label+'</th>').join('')+'</tr></thead><tbody>'+Object.entries(ROLES).map(([role,label])=>'<tr><td>'+label+'</td>'+fields.map(([key])=>'<td class="'+(ROLE_PERMS[role]&&ROLE_PERMS[role][key]?'yes':'no')+'">'+(ROLE_PERMS[role]&&ROLE_PERMS[role][key]?'✓':'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></div>').join('')+'</div><div class="card"><h3>Tài khoản & phạm vi phụ trách</h3><div class="scope-note">Cập nhật vai trò, phạm vi và kích hoạt tại Quản lý tài khoản. Không cấp quyền nhạy cảm chỉ qua giao diện.</div><button class="btn s" id="step145GoAccounts">Mở Quản lý tài khoản</button></div>';
   document.getElementById('step145GoAccounts').onclick=()=>go('acc');
 };
 const enhance=()=>{const el=document.getElementById('ahMsg');if(!el)return;const value=(el.textContent||'');if(/email rate limit exceeded/i.test(value))el.textContent='Supabase đã đạt giới hạn gửi email. Hãy chờ giới hạn được đặt lại hoặc cấu hình SMTP riêng trong Supabase → Authentication → SMTP Settings. Không gửi yêu cầu liên tục.'};
 new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true,characterData:true});
})();

;
/* >>> Original: assets/js/core/script-56.js >>> */

window.addEventListener('unhandledrejection',e=>{const m=String(e.reason&&e.reason.message||e.reason||'');if(/app_accounts|access_requests|Không tìm thấy tài khoản|RLS|phân quyền|permission/i.test(m)){console.error('KTX_ACCOUNT_ACTION',m);alert('Lỗi quản lý tài khoản: '+m)}});

;
/* >>> Original: assets/js/core/script-57.js >>> */

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

;
/* >>> Original: assets/js/modules/admin/script-58.js >>> */

(function(){
 const D='users.ktx-hoc-mon.app';
 const makeEmail=value=>{const u=String(value||'').trim().toLowerCase();return u.includes('@')?u:`${u}@${D}`;};
 function patchGate(){
  const gate=document.getElementById('authHubGate');if(!gate)return;
  gate.querySelector('.auth-tabs2')?.remove();gate.querySelector('#ahReq')?.remove();gate.querySelector('#authForgot140')?.remove();
  const field=gate.querySelector('label:has(#ahEmail)'); if(field){field.querySelector('span').textContent='Tên đăng nhập';const x=document.getElementById('ahEmail');x.type='text';x.autocomplete='off';x.placeholder='Ví dụ: nv001';}
  const btn=gate.querySelector('#ahLoginBtn');if(btn)btn.textContent='Đăng nhập';
  const intro=gate.querySelector('.auth-intro140');if(intro)intro.textContent='Đăng nhập bằng tài khoản do Quản trị KTX cấp. Không cần email cá nhân.';
  const foot=gate.querySelector('.auth-foot2');if(foot)foot.textContent='Tài khoản và quyền truy cập do Quản trị KTX quản lý.';
 }
 const originalShow=window.authHubShow;
 if(typeof originalShow==='function')window.authHubShow=function(){const r=originalShow.call(this,'login',arguments[1]||'');patchGate();const u=document.getElementById('ahEmail'),pw=document.getElementById('ahPass');if(u)u.value='';if(pw)pw.value='';return r};
 // V30 recovery: export the *entire currently loaded local business state* before
 // replacing it with verified Cloud data. This is user-initiated and never uploads.
 function ktxV30AskPendingRecovery(msg,reason,uid){
   return new Promise(resolve=>{
     msg.textContent='';
     const wrap=document.createElement('div');
     wrap.style.cssText='display:grid;gap:9px;line-height:1.5;color:#435a7b;font-size:11px';
     const heading=document.createElement('b');
     heading.style.color='#ad4d13';
     heading.textContent='Dữ liệu trên máy và Cloud đang khác nhau';
     const info=document.createElement('div');
     info.textContent='Ứng dụng không tự ghi đè dữ liệu đang chờ đồng bộ. Để dùng Cloud cho tài khoản hiện tại, hãy tải bản sao dữ liệu trên máy trước, sau đó xác nhận lựa chọn. '+reason;
     const status=document.createElement('div');
     status.style.cssText='font-size:10px;color:#8a5b20';
     status.textContent='Chưa xuất bản sao. Không nên xóa dữ liệu trình duyệt.';
     const buttons=document.createElement('div');
     buttons.style.cssText='display:flex;flex-wrap:wrap;gap:7px';
     const backup=document.createElement('button');backup.type='button';backup.textContent='1. Sao lưu dữ liệu trên máy';
     const cloud=document.createElement('button');cloud.type='button';cloud.textContent='2. Tiếp tục bằng Cloud';cloud.disabled=true;
     const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Giữ nguyên';
     for(const b of [backup,cloud,cancel])b.style.cssText='min-height:34px;padding:6px 10px;border-radius:8px;border:1px solid #bad0eb;background:#f3f8ff;color:#204b82;font-weight:700;cursor:pointer';
     cloud.style.background='#dceee8';cloud.style.color='#17694f';
     cloud.disabled=true;cloud.style.opacity='.5';
     wrap.append(heading,info,status,buttons);buttons.append(backup,cloud,cancel);msg.append(wrap);
     let exported=false,settled=false;
     const done=v=>{if(settled)return;settled=true;backup.onclick=null;cloud.onclick=null;cancel.onclick=null;resolve(v)};
     backup.onclick=()=>{
       try{
         const copy=v=>JSON.parse(JSON.stringify(v));
         const backupObject={format:'QLKTX_PENDING_LOCAL_BACKUP_V30',createdAt:new Date().toISOString(),accountAtExport:uid,warning:'Bản sao trước khi chọn nạp Cloud. Không chứa mật khẩu.',data:{workers:copy(W),archive:copy(ARC),logs:copy(LOG),attendance:copy(ATT),registrations:copy(REG),roomMeta:copy(ROOMMETA)}};
         const blob=new Blob([JSON.stringify(backupObject,null,2)],{type:'application/json;charset=utf-8'});
         if(!blob.size)throw new Error('Bản sao rỗng.');
         const url=URL.createObjectURL(blob),a=document.createElement('a');
         a.href=url;a.download='QLKTX_du_lieu_may_cho_dong_bo_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
         document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
         exported=true;cloud.disabled=false;cloud.style.opacity='1';
         status.textContent='Đã yêu cầu tải bản sao ('+(blob.size/1024).toFixed(0)+' KB). Hãy xác nhận tệp đã lưu trên máy trước khi tiếp tục.';
       }catch(e){status.textContent='Không tạo được bản sao: '+(e.message||e);}
     };
     cloud.onclick=()=>{
       if(!exported)return;
       if(String(SUPA_SYNC.session?.user?.id||'')!==uid){status.textContent='Phiên tài khoản đã thay đổi; không thể tiếp tục.';return}
       if(!window.confirm('Anh/chị đã kiểm tra tệp sao lưu JSON đã tải về chưa?\nTiếp tục sẽ sử dụng dữ liệu Cloud cho phiên này; các chỉnh sửa cục bộ khác Cloud sẽ KHÔNG được tự gửi lên Cloud. Chỉ tiếp tục khi đã lưu bản sao an toàn.'))return;
       done(true);
     };
     cancel.onclick=()=>done(false);
   });
 }
 // Replace login click handler with username-to-internal Auth identifier conversion.
 async function login(){
  patchGate();const msg=document.getElementById('ahMsg');const val=document.getElementById('ahEmail')?.value.trim()||'';
  const password=document.getElementById('ahPass')?.value||'';
  if(!val||!password){msg.textContent='Nhập tên đăng nhập và mật khẩu.';return}
  const email=makeEmail(val);msg.textContent='Đang kết nối máy chủ...';try{await window.ktxLoadPublicConfig()}catch(e){msg.textContent=e.message||'Không kết nối được máy chủ';return}const sb=syncClient();if(!sb){msg.textContent='Không thể khởi tạo kết nối Supabase. Liên hệ Quản trị.';return}
  msg.textContent='Đang đăng nhập...';
  try{
   const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
   SUPA_SYNC.session=data.session;await syncLoadAccount();SUPA_SYNC.ready=true;SUPA_SYNC.enabled=true;
   // V36: authentication and authorization are the ONLY sign-in gate.
   // The business data stays Cloud-only and is loaded asynchronously after
   // the authenticated shell opens. Never treat an empty local array as Cloud 0.
   const signedUid=String(data.session?.user?.id||'');
   // Drop any prior account's in-memory business records before exposing the shell.
   SUPA_SYNC.cloudHydratedUser='';
   SUPA_SYNC.pending=false;
   SUPA_SYNC.conflicts=[];
   clearTimeout(SUPA_SYNC.pushTimer);
   W=[];ARC=[];LOG=[];ATT=[];REG=[];ROOMMETA={};
   window.authHubHide();
   updateUserbar();
   applyPerms();
   // Navigation is now available. A guarded content panel indicates loading,
   // prevents editing unverified Cloud data, and never sends local records.
   function updateCloudPanel(text,failed){
     if(String(SUPA_SYNC.session?.user?.id||'')!==signedUid)return null;
     let panel=document.getElementById('ktxV36CloudLoadPanel');
     if(!panel){
       panel=document.createElement('div');
       panel.id='ktxV36CloudLoadPanel';
       panel.setAttribute('role','status');
       panel.setAttribute('aria-live','polite');
       panel.style.cssText='position:fixed;top:45px;right:20px;z-index:2000;max-width:min(430px,calc(100vw - 32px));border:1px solid #b8cdec;background:#fff;border-radius:12px;box-shadow:0 8px 24px #16375c26;padding:12px 14px;color:#25436b;font-size:12px;line-height:1.45';
       const title=document.createElement('strong');title.textContent='Dữ liệu Supabase';title.style.cssText='display:block;margin-bottom:5px';
       const info=document.createElement('div');info.className='ktxV36CloudLoadInfo';
       const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;margin-top:8px';
       const retry=document.createElement('button');retry.type='button';retry.textContent='Thử tải lại';retry.className='ktxV36CloudRetry';retry.style.cssText='padding:7px 10px;border:1px solid #a7c4e9;border-radius:8px;background:#eaf3ff;color:#205396;cursor:pointer;display:none';
       actions.appendChild(retry);panel.append(title,info,actions);document.body.appendChild(panel);
     }
     panel.querySelector('.ktxV36CloudLoadInfo').textContent=text;
     panel.querySelector('.ktxV36CloudRetry').style.display=failed?'inline-flex':'none';
     return panel;
   }
   // Keep the sidebar accessible, but avoid any editing of empty data while the
   // Cloud is being loaded. The screen blocker is within main, not the login form.
   let guard=document.getElementById('ktxV36MainReadGuard');
   if(!guard){
     guard=document.createElement('div');guard.id='ktxV36MainReadGuard';
     guard.style.cssText='position:fixed;top:26px;bottom:0;left:var(--navw,224px);right:0;z-index:119;background:rgba(241,247,255,.43);display:flex;align-items:center;justify-content:center;pointer-events:auto';
     guard.innerHTML='<div style="background:white;border:1px solid #c8d9ed;border-radius:12px;padding:15px 22px;box-shadow:0 8px 20px #17395823;font-size:13px;color:#34587f">Đang tải dữ liệu Cloud — chưa có số liệu để thao tác</div>';
     document.body.appendChild(guard);
   }
   function finishCloud(loaded){
     if(String(SUPA_SYNC.session?.user?.id||'')!==signedUid)return;
     if(loaded?.ok){
       document.getElementById('ktxV36MainReadGuard')?.remove();
       document.getElementById('ktxV36CloudLoadPanel')?.remove();
       all();
       if(typeof ktx135StartAutomaticSync==='function'){
         Promise.resolve().then(()=>ktx135StartAutomaticSync()).catch(e=>console.warn('[KTX] cloud subscription:',e));
       }
       if(typeof window.authLoadAdminData==='function'){
         Promise.resolve().then(()=>window.authLoadAdminData()).catch(e=>console.warn('[KTX] admin directory:',e));
       }
       if(typeof window.KTX_MOBILE_GO_HOME_AFTER_LOGIN==='function')window.KTX_MOBILE_GO_HOME_AFTER_LOGIN('fresh');
     }else{
       const reason=String(loaded?.reason||'Cloud chưa trả về dữ liệu. Kiểm tra mạng hoặc quyền đọc Supabase.');
       const panel=updateCloudPanel('Không tải được dữ liệu: '+reason+'. Anh/chị vẫn đã đăng nhập; có thể thử lại tại đây, không cần Refresh.',true);
       if(panel){panel.querySelector('.ktxV36CloudRetry').onclick=()=>loadCloudAfterLogin();}
       // Keep the read guard: never allow editing unverified Cloud data.
     }
   }
   let cloudRunning=false;
   async function loadCloudAfterLogin(){
     if(cloudRunning||String(SUPA_SYNC.session?.user?.id||'')!==signedUid)return;
     cloudRunning=true;
     updateCloudPanel('Đã đăng nhập. Đang tải dữ liệu mới nhất từ Supabase…',false);
     try{
       const result=typeof ktxV27BootstrapWorkers==='function'
         ?await ktxV27BootstrapWorkers()
         :{ok:false,reason:'Thiếu module tải dữ liệu Cloud. Kiểm tra bundle-02.'};
       finishCloud(result);
     }catch(e){finishCloud({ok:false,reason:e?.message||String(e)});}
     finally{cloudRunning=false;}
   }
   // Do not await Cloud reads in the click handler: the login screen is gone.
   Promise.resolve().then(loadCloudAfterLogin);
   msg.textContent='Đã đăng nhập. Đang tải dữ liệu Cloud trong ứng dụng.';
   if(data.user?.user_metadata?.change_password_required){
    // First-login change happens via the logged-in client's updateUser API.
    const newPass=prompt('Lần đăng nhập đầu: đặt mật khẩu mới (ít nhất 6 ký tự). Chọn Hủy để đổi sau.');
    if(newPass!==null){if(newPass.length<6){alert('Mật khẩu phải có ít nhất 6 ký tự');return}
      const upd=await sb.auth.updateUser({password:newPass,data:{change_password_required:false}});
      if(upd.error)alert('Chưa đổi được mật khẩu: '+upd.error.message);
      else alert('Đã đổi mật khẩu.');}
   }
  }catch(e){msg.textContent='Đăng nhập không thành công: '+(e.message||e);}
 }
 // V31: Bind the handler even when the login dialog already exists at startup.
 // The old observer watched only direct children of body, and could miss a
 // pre-existing/login dialog button. Re-apply after the gate is presented.
 function ktxV31BindLogin(){
   const btn=document.getElementById('ahLoginBtn');
   if(!btn)return;
   patchGate();
   btn.onclick=login;
   btn.dataset.ktxLoginFlow='v31';
 }
 const observer=new MutationObserver(records=>{
   if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1 && (n.id==='authHubGate'||n.id==='ahLoginBtn'||n.querySelector?.('#ahLoginBtn')))))ktxV31BindLogin();
 });
 observer.observe(document.body,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ktxV31BindLogin);
 else ktxV31BindLogin();
 function esc147(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 const originalAcc=window.accPage;
 window.accPage=async function(){
  const r=await originalAcc.apply(this,arguments);
  const target=document.getElementById('ac140Create');if(!target)return r;
  target.textContent='+ Tạo tài khoản nhân viên';
  target.onclick=()=>{
   const old=document.getElementById('ac147Dialog');if(old){if(!old.open)old.showModal();return;}
   const dialog=document.createElement('dialog');dialog.id='ac147Dialog';dialog.className='ac140-modal';
   dialog.innerHTML=`<div class="ac140-modal-head"><div><small class="ac147-eyebrow">QUẢN LÝ TÀI KHOẢN</small><h3>Tạo tài khoản nhân viên</h3><p class="ac147-muted">Nhập thông tin và phân công phạm vi tương tự như khi chỉnh sửa tài khoản.</p></div><button type="button" class="btn s" id="ac147Close">Đóng</button></div><div class="ac140-modal-body"><form id="ac147Form" class="ac147-form" autocomplete="off">
    <section class="ac147-panel"><div class="ac147-panel-title">Thông tin tài khoản</div><div class="ac147-fields">
      <label class="ac147-label">Họ và tên <span class="ac147-required">*</span><input name="display_name" required minlength="2" maxlength="100" placeholder="Họ và tên CBNV"></label>
      <label class="ac147-label">Tên đăng nhập <span class="ac147-required">*</span><input name="username" pattern="[a-z][a-z0-9_]{2,31}" required placeholder="Ví dụ: ktx_hoc_mon" maxlength="32" autocapitalize="none" spellcheck="false" autocomplete="off"><small id="ac222UsernameHint">3–32 ký tự: a–z, 0–9, _; bắt đầu bằng chữ.</small></label>
      <label class="ac147-label">Email cá nhân<input name="personal_email" type="email" maxlength="254" placeholder="vidu@gmail.com"><small>Chỉ dùng để liên hệ, không đổi tên đăng nhập hoặc email xác thực.</small></label>
      <label class="ac147-label">Chức danh<input name="job_title" maxlength="150" placeholder="Ví dụ: CV QLNO CBNV"></label>
      <label class="ac147-label">SĐT<input name="phone" type="tel" maxlength="30" placeholder="Ví dụ: 09xxxxxxxx"></label>
      <label class="ac147-label">Mật khẩu tạm thời <span class="ac147-required">*</span><input name="password" type="password" minlength="12" maxlength="128" required autocomplete="new-password"><small>Ít nhất 12 ký tự; nhân viên đổi mật khẩu sau khi đăng nhập.</small></label>
      <label class="ac147-label">Vai trò<select name="role"><option value="staff">Nhập liệu</option><option value="manager">Quản lý</option><option value="guard">Bảo vệ</option><option value="viewer">Chỉ xem</option><option value="vault_only">Nhân viên Kho tài liệu</option></select></label>
      <label class="ac147-label">Trạng thái<select name="enabled"><option value="true">Hoạt động</option><option value="false">Đã khóa</option></select></label>
    </div></section>
    <section class="ac147-panel" id="ac147ScopePanel"><div class="ac147-panel-title">Phạm vi phụ trách</div><p class="ac147-muted">Chọn các KTX và Dãy được giao. Với Nhân viên Kho tài liệu, không phân công KTX/Dãy.</p><div class="ac147-scope-columns">
      <div class="ac147-all"><div class="ac147-title">Phạm vi KTX</div><button type="button" class="ac147-select-all" data-ac147-all="ktx" aria-pressed="false"><span class="ac147-check-mark" aria-hidden="true"></span><span>Chọn tất cả KTX</span><small data-ac147-count="ktx"></small></button><div class="ac147-pick">${[...new Set(['KTX 1','KTX 2',...(window.KTX_GLOBAL_CONFIG?.sites||[]).map(s=>'KTX '+Number(s.number)).filter(k=>/^KTX [1-9]\d*$/.test(k)),...Object.keys(window.KTX_GLOBAL_CONFIG?.counts||{}).filter(k=>/^KTX [1-9]\d*$/.test(k))])].sort((a,b)=>Number(a.split(' ')[1])-Number(b.split(' ')[1])).map(x=>`<label><input type="checkbox" name="ktx" value="${x}"><span>${x}</span></label>`).join('')}</div></div>
      <div class="ac147-all"><div class="ac147-title">Phạm vi Dãy</div><button type="button" class="ac147-select-all" data-ac147-all="days" aria-pressed="false"><span class="ac147-check-mark" aria-hidden="true"></span><span>Chọn tất cả Dãy</span><small data-ac147-count="days"></small></button><div class="ac147-pick">${['Dãy 1','Dãy 2','Dãy 3','Dãy 4','Dãy 5','Dãy 6'].map(x=>`<label><input type="checkbox" name="days" value="${x}"><span>${x}</span></label>`).join('')}</div></div>
    </div></section>
    <section class="ac147-panel"><div class="ac147-panel-title">Quyền theo vai trò</div><p class="ac147-muted">Quyền hiển thị để tham khảo; quyền thực tế được kiểm tra trên máy chủ.</p><div class="ac147-role-perms" id="ac147RolePerms"></div></section>
    <div class="ac147-message" id="ac147Message" role="status">Admin cấp quyền trực tiếp. Tài khoản đăng nhập nội bộ dùng tên đăng nhập riêng; email cá nhân chỉ để liên hệ.</div>
    </form></div><div class="ac140-modal-foot"><button type="button" class="btn s" id="ac147Cancel">Hủy</button><button type="button" class="btn" id="ac147Save">Tạo tài khoản</button></div>`;
   // Keep new-account UI self-contained. Never alter the edit-account dialog.
   if(!document.getElementById('ac147-create-style')){
    const st=document.createElement('style');st.id='ac147-create-style';st.textContent=`
    /* Compact create-account form: full-width sections instead of cramped twin panels. */
    html body #ac147Dialog.ac140-modal[open]{box-sizing:border-box!important;display:flex!important;flex-direction:column!important;width:min(880px,calc(100vw - 32px))!important;max-width:min(880px,calc(100vw - 32px))!important;max-height:92dvh!important;padding:0!important;margin:auto!important;border:1px solid #d6e3f6!important;border-radius:18px!important;overflow:hidden!important;background:#fff!important;box-shadow:0 22px 70px #092b5840!important}
    #ac147Dialog .ac140-modal-head{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;gap:16px!important;flex:0 0 auto!important;padding:15px 22px 12px!important;background:#fff!important;border-bottom:1px solid #e5edf8!important}
    #ac147Dialog .ac140-modal-head h3{margin:2px 0 3px!important;font-size:18px!important;line-height:1.25!important;color:#13366e!important}
    #ac147Dialog .ac140-modal-head button{flex:0 0 auto!important;min-height:32px!important;padding:6px 12px!important}
    #ac147Dialog .ac147-eyebrow{color:#5477a9;font-size:10px;font-weight:800;letter-spacing:.6px}
    #ac147Dialog .ac147-muted{margin:3px 0 9px!important;color:#667f9f;font-size:11px!important;line-height:1.45!important}
    #ac147Dialog .ac140-modal-body{box-sizing:border-box!important;flex:1 1 auto!important;min-height:0!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;padding:14px 20px!important;background:#f9fbff!important}
    #ac147Dialog .ac147-form{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;width:100%!important}
    #ac147Dialog .ac147-panel{box-sizing:border-box!important;min-width:0!important;width:100%!important;border:1px solid #d7e4f6!important;border-radius:13px!important;background:#fff!important;padding:14px 17px!important;box-shadow:0 2px 8px #123b7908!important}
    #ac147Dialog .ac147-panel-title{font-size:13px!important;font-weight:800!important;color:#163f7c!important;margin:0 0 9px!important}
    #ac147Dialog .ac147-fields{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:18px!important;row-gap:10px!important}
    #ac147Dialog label.ac147-label{box-sizing:border-box!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;align-items:stretch!important;gap:5px!important;min-width:0!important;width:auto!important;margin:0!important;padding:0!important;color:#385b88!important;font-size:11px!important;font-weight:700!important}
    #ac147Dialog label.ac147-label > input,#ac147Dialog label.ac147-label > select{box-sizing:border-box!important;display:block!important;min-width:0!important;width:100%!important;height:37px!important;min-height:37px!important;max-height:37px!important;padding:7px 10px!important;margin:0!important;border:1px solid #cbdcf2!important;border-radius:9px!important;background:#fff!important;color:#183f76!important;font:600 12px/1.35 system-ui,sans-serif!important;box-shadow:none!important}
    #ac147Dialog label.ac147-label :is(input,select):focus{outline:2px solid #a5c9fb!important;outline-offset:1px!important;border-color:#4e8ce4!important}
    #ac147Dialog label.ac147-label > small{display:block!important;min-height:0!important;font-size:10px!important;font-weight:400!important;line-height:1.35!important;color:#7489a7!important}
    #ac147Dialog .ac147-required{color:#bd3545}
    #ac147Dialog .ac147-scope-columns{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important}
    #ac147Dialog .ac147-all{min-width:0!important}
    #ac147Dialog .ac147-all+.ac147-all{border-left:1px solid #e2eafa!important;padding-left:18px!important}
    #ac147Dialog .ac147-title{font-size:11px!important;font-weight:800!important;color:#315586!important;margin-bottom:7px!important}
    #ac147Dialog .ac147-pick{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
    #ac147Dialog .ac147-pick label{box-sizing:border-box!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:7px!important;padding:7px 9px!important;margin:0!important;min-width:0!important;min-height:33px!important;border:1px solid #d0e0f7!important;background:#fff!important;border-radius:8px!important;cursor:pointer!important;font-size:11px!important;color:#25476f!important;font-weight:700!important}
    #ac147Dialog .ac147-pick label:has(input:checked){background:#e6f0ff!important;border-color:#8eb4f4!important}
    #ac147Dialog .ac147-pick input[type=checkbox],#ac147Dialog .ac147-role-perms input[type=checkbox]{appearance:auto!important;display:inline-block!important;position:static!important;width:15px!important;height:15px!important;min-width:15px!important;min-height:15px!important;max-width:15px!important;max-height:15px!important;flex:0 0 15px!important;margin:0!important;accent-color:#2469d1!important;transform:none!important}
    #ac147Dialog button.ac147-select-all{box-sizing:border-box!important;width:100%!important;display:flex!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:8px!important;min-height:34px!important;height:34px!important;padding:6px 10px!important;margin:0 0 9px!important;border:1px solid #cbdcf4!important;border-radius:8px!important;color:#205494!important;background:#f1f6ff!important;cursor:pointer!important;font-size:11px!important;font-weight:700!important;box-shadow:none!important}
    #ac147Dialog .ac147-select-all .ac147-check-mark{box-sizing:border-box!important;width:15px!important;height:15px!important;flex:0 0 15px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #80a8dd!important;background:white!important;border-radius:3px!important;font-size:12px!important;line-height:1!important;transform:none!important}
    #ac147Dialog .ac147-select-all[aria-pressed=true] .ac147-check-mark{background:#2469d1!important;color:white!important}
    #ac147Dialog .ac147-select-all small{margin-left:auto!important;font-size:10px!important;font-weight:700!important;color:#56769c!important}
    #ac147Dialog .ac147-role-perms{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
    #ac147Dialog .ac147-role-perms label{box-sizing:border-box!important;display:flex!important;align-items:center!important;flex-direction:row!important;gap:7px!important;padding:7px 9px!important;margin:0!important;min-height:32px!important;border-radius:8px!important;border:1px solid #e2e9f7!important;background:#fff!important;color:#385777!important;font-size:11px!important}
    #ac147Dialog .ac147-message{font-size:10px!important;line-height:1.4!important;color:#55739d!important;padding:9px 11px!important;background:#f0f5fe!important;border-radius:9px!important}
    #ac147Dialog .ac147-scope-disabled{opacity:.55;pointer-events:none}
    #ac147Dialog .ac140-modal-foot{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:9px!important;flex:0 0 auto!important;padding:11px 20px!important;border-top:1px solid #e3ebf8!important;background:#fff!important}
    #ac147Dialog .ac140-modal-foot .btn{min-height:34px!important;padding:7px 13px!important;font-size:11px!important}
    @media(max-width:650px){html body #ac147Dialog.ac140-modal[open]{width:calc(100vw - 18px)!important;max-width:calc(100vw - 18px)!important}#ac147Dialog .ac147-fields{grid-template-columns:1fr!important}#ac147Dialog .ac147-scope-columns{grid-template-columns:1fr!important}#ac147Dialog .ac147-all+.ac147-all{border-left:0!important;padding-left:0!important;border-top:1px solid #e2eafa!important;padding-top:12px!important}#ac147Dialog .ac147-role-perms{grid-template-columns:repeat(2,minmax(0,1fr))!important}#ac147Dialog .ac140-modal-body{padding:10px!important}#ac147Dialog .ac147-panel{padding:12px!important}}
    `;document.head.appendChild(st);
   }
   const formRole=dialog.querySelector('select[name="role"]');
   const permissions=dialog.querySelector('#ac147RolePerms');
   const permLabels={view:'Xem dữ liệu',add:'Thêm hồ sơ',editw:'Sửa hồ sơ',transfer:'Chuyển phòng',residence:'Tạm trú',attendance:'Vào/Ra',del:'Xóa hồ sơ',restore:'Khôi phục',qrApprove:'Duyệt QR',import:'Nhập Excel',report:'Xuất báo cáo',backup:'Sao lưu',acct:'Quản lý tài khoản'};
   const renderRole=()=>{
     const role=formRole.value;
     const p=(window.ROLE_PERMS||{})[role]||{};
     permissions.innerHTML=Object.entries(permLabels).map(([id,label])=>`<label><input type="checkbox" disabled ${p[id]?'checked':''}><span>${label}</span></label>`).join('');
     const noScope=role==='vault_only';
     const panel=dialog.querySelector('#ac147ScopePanel');
     panel.classList.toggle('ac147-scope-disabled',noScope);
     panel.querySelectorAll('input[type="checkbox"]').forEach(c=>{c.disabled=noScope;if(noScope)c.checked=false;});
     panel.querySelectorAll('[data-ac147-all]').forEach(b=>{b.disabled=noScope;});
     dialog.querySelectorAll('[data-ac147-all]').forEach(b=>b.dispatchEvent(new Event('ac147-sync')));
   };
   for(const button of dialog.querySelectorAll('[data-ac147-all]')){
     const scope=button.dataset.ac147All;
     const options=[...dialog.querySelectorAll(`input[name="${scope}"]`)];
     const indicator=button.querySelector('.ac147-check-mark');
     const counter=button.querySelector('[data-ac147-count]');
     const refresh=()=>{
       const count=options.filter(c=>c.checked).length;
       const all=count===options.length&&count>0;
       button.setAttribute('aria-pressed',String(all));
       indicator.textContent=all?'✓':count>0?'−':'';
       if(counter)counter.textContent=`${count}/${options.length}`;
     };
     button.addEventListener('click',()=>{
       const checked=!options.every(c=>c.checked);
       options.forEach(c=>{if(!c.disabled)c.checked=checked;});refresh();
     });
     button.addEventListener('ac147-sync',refresh);
     options.forEach(c=>c.addEventListener('change',refresh));refresh();
   }
   formRole.addEventListener('change',renderRole);renderRole();
   // Keep the dialog outside #acc so background refresh cannot destroy an in-progress form.
   document.body.appendChild(dialog);dialog.showModal();
   // Preserve the unfinished account form if the user accidentally presses Escape.
   // This dialog is removed only after an explicit close/cancel or a successful save.
   let submitting=false;
   dialog.addEventListener('cancel',event=>{event.preventDefault();});
   dialog.addEventListener('close',()=>dialog.remove(),{once:true});
   // STEP222: Consistent client/server username rules. Only ASCII [a-z0-9_] reaches API.
   const usernameInput=dialog.querySelector('input[name="username"]');
   const usernameHint=dialog.querySelector('#ac222UsernameHint');
   function normalizeAccountName(v){
     return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d')
       .toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,32);
   }
   usernameInput.addEventListener('input',()=>{
     const value=normalizeAccountName(usernameInput.value);
     if(usernameHint)usernameHint.textContent=value ? 'Tên đăng nhập sẽ dùng: '+value : '3–32 ký tự: a–z, 0–9, _; bắt đầu bằng chữ.';
     usernameInput.setCustomValidity('');
   });
   usernameInput.addEventListener('blur',()=>{usernameInput.value=normalizeAccountName(usernameInput.value);});
   const close=()=>{if(!submitting)dialog.close();};
   dialog.querySelector('#ac147Close').onclick=close;dialog.querySelector('#ac147Cancel').onclick=close;
   dialog.querySelector('#ac147Save').onclick=async()=>{
    const form=dialog.querySelector('form');
    usernameInput.value=normalizeAccountName(usernameInput.value);
    if(!/^[a-z][a-z0-9_]{2,31}$/.test(usernameInput.value)){
      usernameInput.setCustomValidity('Tên đăng nhập phải có 3–32 ký tự, bắt đầu bằng chữ a–z; chỉ dùng a–z, 0–9 hoặc dấu _.');
      usernameInput.reportValidity();return;
    }
    usernameInput.setCustomValidity('');
    if(!form.reportValidity())return;
    const values=new FormData(form);const msg=dialog.querySelector('#ac147Message'),save=dialog.querySelector('#ac147Save');
    const ktx=values.getAll('ktx'),days=values.getAll('days');
    const jobTitle=String(values.get('job_title')||'').trim();
    const personalEmail=String(values.get('personal_email')||'').trim();
    const phone=String(values.get('phone')||'').trim();
    if(phone && !/^[0-9+().\s-]{6,30}$/.test(phone)){msg.textContent='Số điện thoại không hợp lệ.';return;}

    if(values.get('role')!=='vault_only'&&(!ktx.length||!days.length)){msg.textContent='Hãy chọn ít nhất một KTX và một Dãy.';return}
    if(values.get('role')==='vault_only'){ktx.length=0;days.length=0}
    if(!confirm('Xác nhận tạo tài khoản và cấp quyền đã chọn?'))return;
    if(submitting)return;
    submitting=true;save.disabled=true;msg.style.color='';msg.textContent='Đang tạo tài khoản trên máy chủ...';
    try{const sb=syncClient();const {data:{session},error}=await sb.auth.getSession();if(error||!session)throw Error('Phiên Admin đã hết hạn, vui lòng đăng nhập lại.');
     const response=await fetch('/api/admin-create-user',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({username:values.get('username'),display_name:values.get('display_name'),password:values.get('password'),role:values.get('role'),enabled:values.get('enabled')==='true',job_title:jobTitle,phone,personal_email:personalEmail,ktx,days})});
     const result=await response.json();if(!response.ok){const ex=new Error(result.error||'Không tạo được tài khoản');ex.status=response.status;throw ex;}
     form.reset();msg.textContent='Đã tạo tài khoản '+result.username+' thành công. Admin chuyển thông tin đăng nhập cho nhân viên qua kênh bảo mật.';
     await window.authLoadAdminData();
     setTimeout(()=>{dialog.close();window.accPage()},900);
    }catch(e){
      if(e.status===409 || /already been registered|đã tồn tại/i.test(String(e.message||''))){
        msg.textContent='Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác hoặc kiểm tra tài khoản hiện có tại danh sách bên dưới. Không thay đổi quyền tài khoản cũ.';
        msg.style.color='#b42318';usernameInput.focus();usernameInput.select();
      }else{msg.textContent='Không thể tạo tài khoản: '+(e.message||e)+'. Nếu đây là lỗi kết nối, kiểm tra API máy chủ.';}
    }
    finally{submitting=false;save.disabled=false}
   };
  };
  return r;
 };
})();

;
/* >>> Original: assets/js/modules/attendance/script-59.js >>> */

(function(){
 const state={date:new Date().toLocaleDateString('en-CA'),search:'',ktx:'',status:'all'};
 const safe=s=>typeof esc==='function'?esc(s==null?'':String(s)):String(s==null?'':s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 function records(){
  const start=new Date(state.date+'T00:00:00').getTime(),end=start+86400000;
  return (ATT||[]).filter(a=>{const at=Number(a.at)||0;return at>=start&&at<end&&['in','out'].includes(a.type)});
 }
 function currentFor(id,ev){return ev.filter(a=>String(a.workerId)===String(id)).sort((a,b)=>(b.at||0)-(a.at||0))[0]||null}
 function canSee(w){return typeof can==='function'&&can('view',w)}
 function data(){return W.filter(canSee).filter(w=>!state.ktx||K(w)===state.ktx).filter(w=>{const t=[w.name,w.mnv,w.cccd,w.sdt,K(w),D(w),R(w)].join(' ').toLocaleLowerCase('vi');return !state.search||t.includes(state.search.toLocaleLowerCase('vi'))})}
 function render(){
  const node=(typeof page!=='undefined'&&page==='qr'&&typeof QT!=='undefined'&&QT==='attendance')?document.getElementById('qb'):document.getElementById('attendance'); if(!node)return;
  const events=records(); const all=data(); const inCount=all.filter(w=>currentFor(w.id,events)?.type==='in').length;
  const outCount=all.filter(w=>currentFor(w.id,events)?.type==='out').length;
  const filtered=all.filter(w=>{const r=currentFor(w.id,events);return state.status==='all'||(state.status==='none'&&!r)||(r&&r.type===state.status)});
  const permitted=typeof can==='function'&&can('attendance');
  const availableKtx=[...new Set(W.filter(canSee).map(w=>K(w)).filter(Boolean))].sort();
  node.innerHTML=`<div class="card at159-scan"><div class="row" style="justify-content:space-between;gap:8px"><div><h3 style="margin:0">Quét mã QR điểm danh</h3><small class="at-help">Quét mã QR công nhân hoặc nhập mã nhân viên; chọn Vào hoặc Ra để xác nhận.</small></div><button type="button" class="btn s sm" id="at159camera">Mở camera quét QR</button></div><div class="row" style="margin-top:10px"><input id="at159code" placeholder="Mã NV hoặc KTXATT:mã-hồ-sơ" style="flex:1;min-width:220px"><button type="button" class="btn g sm" id="at159in">Điểm danh vào</button><button type="button" class="btn s sm" id="at159out">Điểm danh ra</button></div><div id="at159msg" role="status" class="at-help" style="margin-top:8px"></div><div id="at159camWrap" style="display:none;margin-top:10px"><video id="at159video" muted playsinline style="max-width:100%;width:420px;border-radius:10px;background:#10233d"></video><button class="btn s sm" id="at159stop" type="button">Dừng camera</button></div></div><div class="at-stats"><div class="at-stat"><small>QUÂN SỐ TRONG PHẠM VI</small><b>${all.length.toLocaleString('vi-VN')}</b></div><div class="at-stat"><small>ĐÃ GHI NHẬN VÀO</small><b style="color:#109764">${inCount.toLocaleString('vi-VN')}</b></div><div class="at-stat"><small>ĐÃ GHI NHẬN RA</small><b style="color:#cf7d14">${outCount.toLocaleString('vi-VN')}</b></div><div class="at-stat"><small>CHƯA GHI NHẬN</small><b>${(all.length-inCount-outCount).toLocaleString('vi-VN')}</b></div></div><div class="card"><div class="at-filters"><div><label>Ngày</label><input id="at151date" type="date" value="${safe(state.date)}"></div><div><label>Tìm kiếm công nhân</label><input id="at151search" placeholder="Họ tên, mã NV, CCCD, phòng..." value="${safe(state.search)}"></div><div><label>KTX</label><select id="at151ktx"><option value="">Tất cả KTX được cấp</option>${availableKtx.map(k=>`<option value="${safe(k)}" ${state.ktx===k?'selected':''}>${safe(k)}</option>`).join('')}</select></div><div><label>Trạng thái</label><select id="at151status"><option value="all">Tất cả</option><option value="in" ${state.status==='in'?'selected':''}>Đã vào</option><option value="out" ${state.status==='out'?'selected':''}>Đã ra</option><option value="none" ${state.status==='none'?'selected':''}>Chưa ghi nhận</option></select></div></div><div class="row" style="margin:10px 0;justify-content:space-between;align-items:center"><div class="at-help">Ghi nhận ngày ${safe(state.date)} · Chỉ hiển thị công nhân thuộc phạm vi được phân quyền. ${permitted?'Bấm Vào hoặc Ra để ghi nhận.':'Tài khoản của bạn chỉ được xem, không có quyền điểm danh.'}</div><button class="btn s sm" id="at151export">Xuất Excel</button></div><div class="wrap"><table class="cmp3 at-table"><tr><th>STT</th><th>Họ tên</th><th>Mã NV</th><th>KTX</th><th>Dãy / Phòng</th><th>Trạng thái ngày</th><th>Thời gian gần nhất</th><th>Điểm danh</th></tr>${filtered.slice(0,200).map((w,i)=>{const ev=currentFor(w.id,events);const ts=ev?new Date(ev.at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'—';return `<tr><td>${i+1}</td><td><b>${safe(w.name)}</b></td><td>${safe(w.mnv||'—')}</td><td>${safe(K(w))}</td><td>${safe(D(w))} / ${safe(R(w))}</td><td>${ev?ev.type==='in'?'<span class="tag g">Đã vào</span>':'<span class="tag a">Đã ra</span>':'<span class="mut">Chưa ghi nhận</span>'}</td><td>${ts}</td><td><div class="at-actions">${permitted?`<button class="btn g sm" data-att151="in" data-worker="${safe(w.id)}">Vào</button><button class="btn a sm" data-att151="out" data-worker="${safe(w.id)}">Ra</button>`:'—'}</div></td></tr>`}).join('')||'<tr><td colspan="8" class="mut">Không có công nhân phù hợp.</td></tr>'}</table></div><div class="at-help" style="margin-top:8px">${filtered.length>200?'Hiển thị 200 dòng đầu. Hãy tìm kiếm để thu hẹp. ':''}Lịch sử được ghi vào dữ liệu điểm danh hiện có và hàng đợi Supabase khi đồng bộ được bật.</div></div>`;
  for(const [id,key] of [['at151date','date'],['at151search','search'],['at151ktx','ktx'],['at151status','status']]){const e=document.getElementById(id);if(e)e.addEventListener(key==='search'?'change':'change',()=>{state[key]=e.value;render()})}
  node.querySelectorAll('[data-att151]').forEach(b=>b.addEventListener('click',()=>{
    const w=W.find(x=>String(x.id)===b.dataset.worker),type=b.dataset.att151;
    if(!w||!can('attendance',w)||!can('view',w))return alert('Không có quyền điểm danh công nhân này.');
    if(state.date!==new Date().toLocaleDateString('en-CA'))return alert('Chỉ được ghi điểm danh ngày hôm nay. Ngày cũ dùng để tra cứu.');
    const prev=currentFor(w.id,records());
    if(prev&&prev.type===type&&!confirm(`${w.name} đã được ghi “${type==='in'?'Vào':'Ra'}” gần nhất trong ngày. Ghi thêm một lượt?`))return;
    if(!confirm(`Xác nhận ${type==='in'?'VÀO':'RA'} cho ${w.name} — ${K(w)} / ${D(w)} / Phòng ${R(w)}?`))return;
    const rec={id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),workerId:w.id,name:w.name,mnv:w.mnv||'',type,at:Date.now(),day:ldy(),actor:ME.name||ME.id||'Người dùng',role:ME.role};
    ATT.unshift(rec); if(typeof audit81==='function')audit81(type==='in'?'ATT_IN':'ATT_OUT',`Điểm danh ${type==='in'?'vào':'ra'}: ${w.name}`,{workerId:w.id,workerName:w.name,persist:false});
    sv();render();
  }));
  node.querySelectorAll('[data-at159qr]').forEach(b=>b.addEventListener('click',()=>{const worker=W.find(w=>String(w.id)===b.dataset.at159qr);if(!worker||!can('view',worker))return;try{const canvas=document.createElement('canvas');qrDraw(canvas,'KTXATT:'+worker.id,420,4);qrSave(canvas,'QR_Diem_danh_'+String(worker.mnv||worker.id).replace(/[^a-zA-Z0-9_-]/g,'_')+'.png')}catch(err){alert('Không thể tạo mã QR: '+(err.message||err))}}));
  document.getElementById('at151export').onclick=async()=>{
    if(typeof XLSX==='undefined')return alert('Chưa tải thư viện Excel, vui lòng kết nối Internet và thử lại.');
    const rows=[['Ngày','Họ tên','Mã NV','KTX','Dãy','Phòng','Trạng thái','Thời gian gần nhất','Người ghi nhận']];
    filtered.forEach(w=>{const ev=currentFor(w.id,events);rows.push([state.date,w.name,w.mnv||'',K(w),D(w),R(w),ev?(ev.type==='in'?'Đã vào':'Đã ra'):'Chưa ghi nhận',ev?new Date(ev.at).toLocaleString('vi-VN'):'',ev?.actor||''])});
    const book=XLSX.utils.book_new(),sheet=XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols']=[{wch:14},{wch:29},{wch:15},{wch:13},{wch:12},{wch:12},{wch:18},{wch:23},{wch:24}];
    XLSX.utils.book_append_sheet(book,sheet,'Điểm danh');
    const bytes=XLSX.write(book,{bookType:'xlsx',type:'array'}),blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const name=`Diem_danh_KTX_${state.date}.xlsx`;
    try{if(window.showSaveFilePicker){const h=await window.showSaveFilePicker({suggestedName:name,types:[{description:'Excel Workbook',accept:{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}}]});const w=await h.createWritable();await w.write(blob);await w.close();return}}catch(e){if(e.name==='AbortError')return;console.warn('Chọn nơi lưu không khả dụng',e)}
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),6000);
  };
  const inp=document.getElementById('at159code'),msg=document.getElementById('at159msg');
  const resolveWorker=()=>{let v=(inp.value||'').trim();if(v.startsWith('KTXATT:'))v=v.slice(7);const match=all.filter(w=>String(w.id)===v||String(w.mnv||'').toLowerCase()===v.toLowerCase());if(match.length!==1){msg.textContent=match.length?'Trùng mã nhân viên; không thể xác định duy nhất.':'Không tìm thấy hồ sơ thuộc phạm vi được phân quyền.';return null}return match[0]};
  for(const kind of ['in','out'])document.getElementById('at159'+kind).onclick=()=>{const w=resolveWorker();if(!w)return;const target=node.querySelector(`[data-att151="${kind}"][data-worker="${CSS.escape(String(w.id))}"]`);if(target)target.click();else{state.status='all';state.search=w.name;render();const btn=document.querySelector(`[data-att151="${kind}"][data-worker="${CSS.escape(String(w.id))}"]`);if(btn)btn.click();else alert('Không tìm thấy công nhân trong trang điểm danh.')}};
  let qrStream=null,qrLoop=0;
  const stop=()=>{qrLoop++;if(qrStream){qrStream.getTracks().forEach(t=>t.stop());qrStream=null}const video=document.getElementById('at159video');if(video)video.srcObject=null;const wrap=document.getElementById('at159camWrap');if(wrap)wrap.style.display='none'};
  document.getElementById('at159stop').onclick=stop;
  document.getElementById('at159camera').onclick=async()=>{
    if(!navigator.mediaDevices?.getUserMedia||typeof BarcodeDetector==='undefined'){msg.textContent='Trình duyệt này chưa hỗ trợ quét QR bằng camera. Hãy nhập mã nhân viên hoặc dùng trình duyệt hỗ trợ BarcodeDetector.';return}
    try{stop();qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const video=document.getElementById('at159video');if(!video){stop();return}video.srcObject=qrStream;document.getElementById('at159camWrap').style.display='block';await video.play();const detector=new BarcodeDetector({formats:['qr_code']}),token=++qrLoop;
    const read=async()=>{if(token!==qrLoop||!video.isConnected)return;try{const codes=await detector.detect(video);if(codes.length){inp.value=codes[0].rawValue;msg.textContent='Đã nhận QR. Chọn Điểm danh vào hoặc Điểm danh ra để xác nhận.';stop();return}}catch(e){console.warn(e)}requestAnimationFrame(read)};read();
    }catch(e){stop();msg.textContent='Không mở được camera: '+(e.message||e)}};

 }
 window.ktxAttendancePage=render;
})();

;
/* >>> Original: assets/js/modules/reports/script-60.js >>> */
/* KTX Hóc Môn V2.0.30: Gỡ tiện ích Biên bản sự vụ khỏi giao diện.
 * Không đăng ký trang incident152, không bọc window.go, không thêm ô tiện ích.
 * Giữ tệp để index.html hiện tại có thể tiếp tục tham chiếu an toàn.
 */
(function(){
  'use strict';
  function cleanup(){
    document.querySelectorAll('[data-util-go="incident152"]').forEach(function(el){el.remove()});
    var panel=document.getElementById('incident152');
    if(panel)panel.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  else cleanup();
})();

;
/* >>> Original: assets/js/modules/attendance/script-61.js >>> */

(function(){
 if(window.KTX_ENABLE_ATTENDANCE_QR!==true) return;
 const previous=qrMake;
 qrMake=function(){
   previous();
   const root=document.getElementById('qb');if(!root)return;
   const url=new URL('/pages/attendance-form.html',location.href).href;
   const grid=root.querySelector('.g2');if(!grid)return;
   const box=document.createElement('div');box.className='card';
   box.innerHTML='<h3>Điểm danh công nhân</h3><p class="mut" style="font-size:12.5px">Công nhân quét mã QR dùng chung, nhập mã nhân viên, họ tên và chọn Vào/Ra. Ban quản lý đối chiếu, duyệt trước khi ghi vào dữ liệu điểm danh.</p><canvas id="qr160" style="width:100%;max-width:330px;display:block;margin:10px auto;border:2px solid #159963;border-radius:12px"></canvas><div class="row" style="justify-content:center"><button class="btn g" id="qr160p">Tải áp phích</button><button class="btn s" id="qr160q">Tải mã QR</button></div><label class="fl">Link điểm danh<input id="qr160link" readonly></label><div class="row" style="margin-top:10px"><button class="btn s" id="qr160load">Danh sách người điểm danh</button></div><div id="qr160pending"></div>';
   grid.appendChild(box);document.getElementById('qr160link').value=url;
   if(window.__qrAttReview){
     grid.style.display='none';
     const review=document.createElement('section');review.className='card';review.id='qr247review';
     review.innerHTML='<h3>Danh sách người gửi điểm danh</h3><p class="mut">Hiển thị yêu cầu đã gửi, chờ duyệt, đã duyệt và từ chối.</p>';
     root.appendChild(review);
     review.appendChild(document.getElementById('qr160pending'));
   }
   try{qrDraw(document.getElementById('qr160'),url,330,4)}catch(err){document.getElementById('qr160pending').textContent='Không tạo được QR: '+err.message}
   document.getElementById('qr160q').onclick=()=>qrSave(qrPoster('MÃ QR ĐIỂM DANH','Quét để gửi điểm danh '+(window.KTX_CONFIG_API?.name('app')||'KTX Hóc Môn'),url),'QR_Diem_danh_KTX.png');
   document.getElementById('qr160p').onclick=()=>qrSave(qrPoster('ĐIỂM DANH CÔNG NHÂN','Quét mã và điền thông tin Vào / Ra',url),'Ap_phich_QR_Diem_danh_KTX.png');
   document.getElementById('qr160load').onclick=load160;
 };
 async function load160(){
  const el=document.getElementById('qr160pending');if(!el)return;
  if(!can('attendance')){el.textContent='Bạn không có quyền duyệt điểm danh.';return}
  const sb=qrSb();if(!sb){el.textContent='Không kết nối được Supabase.';return}
  el.textContent='Đang tải danh sách điểm danh...';
  const {data,error}=await sb.from('ktx_attendance_qr_requests').select('*').order('created_at',{ascending:false}).limit(1000);
  if(error){el.textContent='Lỗi: '+error.message+' — hãy kiểm tra SQL STEP160 / RLS.';return}
  const visible=(data||[]).filter(r=>ME.role==='admin'||ME.role==='quantri'||ME.role==='owner'||W.some(w=>can('view',w)&&K(w)===r.ktx)||typeof canAccessKtx==='function'&&canAccessKtx(r.ktx));
  // Match only a unique worker code + name; never infer identity from name alone.
  const norm=v=>String(v??'').trim().normalize('NFC').toLocaleLowerCase('vi-VN');
  const roomNorm=v=>norm(v).replace(/^phòng\s*/,'').replace(/^p\.?\s*/,'').replace(/^0+(?=\d)/,'');
  const dayNorm=v=>norm(v).replace(/^dãy\s*/,'').replace(/^d\.?\s*/,'');
  const matches=r=>(Array.isArray(W)?W:[]).filter(w=>norm(w.mnv)&&norm(w.mnv)===norm(r.worker_code)&&norm(w.name)===norm(r.worker_name));
  const sameLocation=(w,r)=>norm(K(w))===norm(r.ktx)&&dayNorm(D(w))===dayNorm(r.day)&&roomNorm(R(w))===roomNorm(r.room);
  const locationText=w=>[K(w),D(w),'Phòng '+(R(w)||'—')].join(' · ');
  // Only an authenticated, authorized reviewer can auto-approve. Never grant public UPDATE.
  // Limit each load to avoid flooding network and blocking the UI.
  if(can('attendance')){
   const openSessions=new Set();
   const {data:opened,error:sessionError}=await sb.from('ktx_attendance_sessions').select('id').eq('status','open');
   if(!sessionError)(opened||[]).forEach(x=>openSessions.add(String(x.id)));
   const eligible=visible.filter(r=>(r.status||'pending')==='pending'&&r.session_id&&openSessions.has(String(r.session_id))&&matches(r).length===1&&sameLocation(matches(r)[0],r)).slice(0,30);
   if(eligible.length){
    const authResult=await sb.auth.getUser();const reviewer=authResult?.data?.user?.id;
    if(reviewer){
     for(const r of eligible){
      const {data:changed,error:approveError}=await sb.from('ktx_attendance_qr_requests').update({status:'approved',reviewed_at:new Date().toISOString(),reviewed_by:reviewer}).eq('id',r.id).eq('status','pending').select('id');
      if(approveError){console.warn('Auto-approve QR failed:',approveError.message);break}
      if(changed?.length){r.status='approved';const w=matches(r)[0];
       // Only reflect the Cloud-confirmed approval in the local attendance ledger.
       if(typeof ATT!=='undefined'&&!ATT.some(a=>String(a.qrRequestId)===String(r.id))){ATT.unshift({id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),workerId:w.id,name:w.name||'',mnv:w.mnv||'',type:r.direction,at:Date.now(),day:typeof ldy==='function'?ldy():'',actor:ME.name||ME.id||'Người dùng',role:ME.role,source:'qr-form',qrRequestId:r.id,unmatched:false,ktx:r.ktx||'',room:r.room||''});if(typeof sv==='function')sv()}
      }
     }
    }
   }
  }
  const allowed=['pending','approved','rejected'];
  const counts=Object.fromEntries(allowed.map(k=>[k,visible.filter(r=>(r.status||'pending')===k).length]));
  el.innerHTML='<div class="row" style="gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap"><label class="mut">Trạng thái <select id="qr160filter"><option value="all">Tất cả ('+visible.length+')</option><option value="pending">Chờ duyệt ('+counts.pending+')</option><option value="approved">Đã duyệt ('+counts.approved+')</option><option value="rejected">Từ chối ('+counts.rejected+')</option></select></label><label class="mut">Tìm kiếm <input id="qr160search" placeholder="Tên, mã NV, KTX, dãy, phòng"></label></div><div class="mut" id="qr160count"></div><div class="wrap qr247-review-wrap"><table class="cmp3 qr247-review-table"><thead><tr><th>STT</th><th>Họ tên</th><th>Mã NV</th><th>KTX / Dãy / Phòng</th><th>Vào/Ra</th><th>Thời gian gửi</th><th>Trạng thái</th><th>Đối chiếu danh sách tổng</th><th>Thao tác</th></tr></thead><tbody></tbody></table></div>';
  const tbody=el.querySelector('tbody');
  const render=()=>{
    const filter=el.querySelector('#qr160filter').value,query=el.querySelector('#qr160search').value.trim().toLocaleLowerCase('vi-VN');
    const rows=visible.filter(r=>(filter==='all'||(r.status||'pending')===filter)&&(!query||[r.worker_name,r.worker_code,r.ktx,r.day,r.room].join(' ').toLocaleLowerCase('vi-VN').includes(query)));
    tbody.replaceChildren();el.querySelector('#qr160count').textContent='Hiển thị '+rows.length+' / '+visible.length+' yêu cầu (tối đa 1.000 yêu cầu mới nhất).';
    rows.forEach((r,i)=>{const tr=document.createElement('tr');
      const status=r.status||'pending';const label={pending:'Chờ duyệt',approved:'Đã duyệt',rejected:'Từ chối'}[status]||status;
      [i+1,r.worker_name||'—',r.worker_code||'—',[r.ktx,r.day,r.room?'P.'+r.room:''].filter(Boolean).join(' · ')||'—',r.direction==='in'?'Vào':'Ra',r.created_at?new Date(r.created_at).toLocaleString('vi-VN'):'—',label].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});
      const compare=document.createElement('td');const candidates=matches(r);
      if(candidates.length===1){const w=candidates[0];compare.textContent=sameLocation(w,r)?'✓ Khớp hồ sơ và vị trí':'⚠ Khác vị trí · Đang ở '+locationText(w);if(!sameLocation(w,r))compare.style.color='#b45309';}
      else if(candidates.length===0){compare.textContent='Chưa tìm thấy mã NV + họ tên trong danh sách tổng';compare.style.color='#b91c1c'}
      else {compare.textContent='Trùng hồ sơ · Cần kiểm tra thủ công';compare.style.color='#b91c1c'}
      tr.appendChild(compare);
      const actions=document.createElement('td');actions.className='qr247-actions';
      if(status==='pending')for(const [action,label] of [['edit','Sửa'],['approved','Duyệt'],['rejected','Từ chối']]){const btn=document.createElement('button');btn.className='btn '+(action==='approved'?'g':'s')+' sm';btn.type='button';btn.textContent=label;btn.onclick=()=>review160(r,action);actions.appendChild(btn)}
      else actions.textContent='Đã xử lý';
      tr.appendChild(actions);tbody.appendChild(tr);
    });
    if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=9;td.textContent='Không có yêu cầu điểm danh phù hợp.';tr.appendChild(td);tbody.appendChild(tr)}
  };
  el.querySelector('#qr160filter').addEventListener('change',render);
  el.querySelector('#qr160search').addEventListener('input',render);render();
 }
 async function review160(r,status){
  const sb=qrSb();const matched=W.filter(w=>can('view',w)&&can('attendance',w)&&String(w.mnv||'').trim().toLowerCase()===String(r.worker_code||'').trim().toLowerCase()&&K(w)===r.ktx);
  if(status==='edit'){
   const worker_name=prompt('Sửa họ tên người điểm danh:',r.worker_name||'');if(worker_name===null)return;
   const worker_code=prompt('Sửa mã nhân viên (được để trống):',r.worker_code||'');if(worker_code===null)return;
   const ktx=prompt('Sửa KTX:',r.ktx||'');if(ktx===null)return;
   const day=prompt('Sửa dãy:',r.day||'');if(day===null)return;const room=prompt('Sửa phòng:',r.room||'');if(room===null)return;
   if(!worker_name.trim()||!ktx.trim())return alert('Họ tên và KTX không được để trống.');
   const {error}=await sb.from('ktx_attendance_qr_requests').update({worker_name:worker_name.trim(),worker_code:worker_code.trim(),ktx:ktx.trim(),day:day.trim(),room:room.trim()}).eq('id',r.id).eq('status','pending');
   if(error)return alert('Không sửa được yêu cầu trên máy chủ: '+error.message);await load160();return;
  }
  const verified=matched.length===1&&String(matched[0].name||'').trim().toLowerCase()===String(r.worker_name||'').trim().toLowerCase();
  if(status==='approved'&&!verified&&!confirm('Không khớp hồ sơ công nhân trong danh sách. Vẫn ghi nhận điểm danh độc lập? Không cập nhật/xóa hồ sơ công nhân.'))return;
  if(!confirm(status==='approved'?'Xác nhận ghi điểm danh '+(r.direction==='in'?'VÀO':'RA')+' cho '+r.worker_name+'?':'Từ chối yêu cầu '+r.worker_name+'?'))return;
  const {data:auth}=await sb.auth.getUser();const {data,error}=await sb.from('ktx_attendance_qr_requests').update({status,reviewed_at:new Date().toISOString(),reviewed_by:auth?.user?.id||null}).eq('id',r.id).eq('status','pending').select('id');
  if(error)return alert('Không cập nhật được: '+error.message);if(!data?.length)return alert('Yêu cầu đã được xử lý bởi người khác.');
  if(status==='approved'){const w=verified?matched[0]:null;const rec={id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),workerId:w?w.id:null,name:r.worker_name||'',mnv:r.worker_code||'',type:r.direction,at:Date.now(),day:ldy(),actor:ME.name||ME.id||'Người dùng',role:ME.role,source:'qr-form',qrRequestId:r.id,unmatched:!verified,ktx:r.ktx||'',day:r.day||'',room:r.room||''};ATT.unshift(rec);sv()}
  await load160();
 }
})();

;
/* >>> Original: assets/js/modules/attendance/script-62.js >>> */
/* QR simplified: no replacement navigation. Base qrPage provides 3 tabs, both QR panels. */

;
/* >>> Original: assets/js/modules/reports/script-63.js >>> */

(function(){
 function init(){
  let el=document.getElementById('ledger167');
  if(!el){el=document.createElement('section');el.id='ledger167';el.className='hide';el.innerHTML='<div class="ledger167-head"><strong>Sổ theo dõi quân số tăng/giảm</strong></div><iframe id="ledger167Frame" title="Sổ theo dõi công nhân tăng giảm" src="/pages/so-tang-giam.html"></iframe>';document.querySelector('main').appendChild(el);}
  if(typeof T!=='undefined'&&!T.ledger167) T.ledger167=['Sổ theo dõi công nhân tăng/giảm','Ghi nhận quân số theo ngày, xuất Excel'];
  if(typeof GN!=='undefined')GN.ledger167='Tiện ích';
 }
 // PC: điều chỉnh iframe theo chiều cao nội dung để cuộn ở duy nhất lớp trang chính.
 window.addEventListener('message',function(e){
   if(e.origin!==location.origin||e.data?.type!=='ktx-ledger-frame-height-v201')return;
   const iframe=document.getElementById('ledger167Frame');
   if(!iframe||e.source!==iframe.contentWindow)return;
   const h=Number(e.data.height);
   if(Number.isFinite(h)&&h>=200&&h<200000)iframe.style.height=Math.ceil(h+4)+'px';
 });
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.data?.type!=='ktx-ledger-get-snapshot'||![document.getElementById('ledger167Frame')?.contentWindow,document.getElementById('m142LedgerFrame')?.contentWindow].includes(e.source))return;
  const rows=Array.isArray(W)?W:[];
  const male=rows.filter(w=>isNam(w.gt)).length, female=rows.filter(w=>isNu(w.gt)).length;
  const vinAlpha=rows.filter(w=>/vin\s*alpha/i.test(String(w.unit||''))).length;
  const staff=(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.account?.display_name)||document.getElementById('aubName')?.textContent||'';
  const cloud=(typeof SUPA_SYNC!=='undefined')?SUPA_SYNC:null;
  const cloudReady=!!(cloud&&cloud.enabled&&cloud.ready&&cloud.session&&!cloud.pulling&&!cloud.applying&&!cloud.pending&&!cloud.pushing&&!(cloud.conflicts||[]).length);
  e.source.postMessage({type:'ktx-ledger-snapshot',data:{total:rows.length,configuredTotal:window.KTX_GLOBAL_CONFIG?.counts?.all??null,male,female,vinAlpha,updater:staff.trim(),cloudReady}},e.origin);
 });
 const prevGo=window.go;
 window.go=function(p){init();if(p==='ledger167'){
   prevGo.call(this,'utilhub');document.getElementById('utilhub')?.classList.add('hide');
   document.getElementById('ledger167')?.classList.remove('hide');
   if(typeof page!=='undefined')page='ledger167';
   document.getElementById('ttl').textContent='Sổ theo dõi công nhân tăng/giảm';
   document.getElementById('sub').textContent='Theo dõi quân số công nhân tại '+(window.KTX_GLOBAL_CONFIG?.title||'KTX Hóc Môn');
   window.scrollTo(0,0);return;
  }
  document.getElementById('ledger167')?.classList.add('hide');
  return prevGo.apply(this,arguments);
 };
})();

;
/* >>> Original: assets/js/modules/admin/script-64.js >>> */
(function(){
 const titles={cosovatchat:'Cơ sở vật chất KTX','vs-vpp':'Danh mục dụng vụ VS–VPP','vipham-ncc':'Sổ theo dõi vi phạm NCC',pccc:'Checklist bình PCCC',backup:'Kiểm tra & sao lưu tiện ích'};
 const originalGo=window.go;
 function ensure(slug){let section=document.getElementById('u169_'+slug);if(section)return section;section=document.createElement('section');section.id='u169_'+slug;section.className='hide u169-wrap';section.innerHTML='<iframe loading="lazy" title="'+titles[slug]+'" src="./'+(slug==='backup'?'kiem-tra-sao-luu':slug)+'.html"></iframe>';document.querySelector('main').append(section);return section}
 window.go=function(p){Object.keys(titles).forEach(slug=>document.getElementById('u169_'+slug)?.classList.add('hide'));if(p&&p.startsWith('u169_')&&titles[p.slice(5)]){const slug=p.slice(5);originalGo.call(this,'utilhub');document.getElementById('utilhub')?.classList.add('hide');ensure(slug).classList.remove('hide');if(typeof page!=='undefined')page=p;document.getElementById('ttl').textContent=titles[slug];document.getElementById('sub').textContent='Tiện ích quản lý theo biểu mẫu KTX';window.scrollTo(0,0);return}return originalGo.apply(this,arguments)};
})();
/* v1.0.82 – Cơ sở vật chất: liền mạch với trang chính, không khung cuộn riêng. */
(function(){
 window.addEventListener('message',function(event){
  if(event.origin !== window.location.origin || !event.data || event.data.type !== 'ktx-facility-document-height') return;
  const section=document.getElementById('u169_cosovatchat');
  const frame=section && section.querySelector('iframe');
  if(!frame || event.source!==frame.contentWindow || frame.dataset.facEditorDocked==='1') return;
  const h=Number(event.data.height);
  if(Number.isFinite(h) && h>=250 && h<=200000) frame.style.setProperty('height',Math.ceil(h+4)+'px','important');
 });
})();


/* v233: dock the actual facility iframe in the parent viewport while editing.
   This avoids centering a fixed dialog in an iframe thousands of pixels tall. */
(function(){
 const states=new WeakMap();
 let activeFrame=null;
 function facFrameForSource(source){
  return Array.from(document.querySelectorAll('iframe')).find(frame=>{
   try{return frame.contentWindow===source && /(?:^|\/)cosovatchat\.html(?:[?#]|$)/.test(frame.getAttribute('src')||'')}catch(_){return false}
  });
 }
 function close(frame){
  if(!frame||!states.has(frame))return;
  const old=states.get(frame);
  if(old.style===null)frame.removeAttribute('style');else frame.setAttribute('style',old.style);
  document.documentElement.style.overflow=old.htmlOverflow;
  document.body.style.overflow=old.bodyOverflow;
  states.delete(frame);
  delete frame.dataset.facEditorDocked;
  if(activeFrame===frame)activeFrame=null;
 }
 function open(frame){
  if(activeFrame&&activeFrame!==frame)close(activeFrame);
  if(states.has(frame))return;
  states.set(frame,{style:frame.getAttribute('style'),htmlOverflow:document.documentElement.style.overflow,bodyOverflow:document.body.style.overflow});
  activeFrame=frame;
  frame.dataset.facEditorDocked='1';
  frame.style.setProperty('position','fixed','important');
  frame.style.setProperty('inset','0','important');
  frame.style.setProperty('top','0','important');
  frame.style.setProperty('left','0','important');
  frame.style.setProperty('right','0','important');
  frame.style.setProperty('bottom','0','important');
  frame.style.setProperty('width','100vw','important');
  frame.style.setProperty('max-width','100vw','important');
  frame.style.setProperty('height','100dvh','important');
  frame.style.setProperty('min-height','100dvh','important');
  frame.style.setProperty('max-height','100dvh','important');
  frame.style.setProperty('z-index','2147483600','important');
  frame.style.setProperty('background','transparent','important');
  frame.style.setProperty('border','0','important');
  frame.style.setProperty('margin','0','important');
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
 }
 window.addEventListener('message',event=>{
  const type=event.data&&event.data.type;
  if(type!=='ktx-facility-editor-open'&&type!=='ktx-facility-editor-close')return;
  const frame=facFrameForSource(event.source);
  if(!frame)return; // exact iframe identity, not arbitrary message data
  if(type==='ktx-facility-editor-open')open(frame);else close(frame);
 });
 window.addEventListener('pagehide',()=>{if(activeFrame)close(activeFrame)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&activeFrame){
  try{activeFrame.contentWindow.postMessage({type:'ktx-facility-escape'},'*')}catch(_){}
 }},true);
})();

;
/* >>> Original: assets/js/modules/admin/script-65.js >>> */
(function(){function clearFields(){const u=document.getElementById('ahEmail'),p=document.getElementById('ahPass');if(u)u.value='';if(p)p.value='';}document.addEventListener('DOMContentLoaded',()=>{clearFields();window.addEventListener('pageshow',clearFields);});})();

;(function(){"use strict";if(document.getElementById("qlktx-account-scope-checkbox-update"))return;const s=document.createElement("style");s.id="qlktx-account-scope-checkbox-update";s.textContent='\n.ac140-modal .ac140-scope-field{min-width:0;display:flex;flex-direction:column;gap:7px}\n.ac140-modal .ac140-scope-label{font-size:12px;font-weight:700;color:#385b86}\n.ac140-modal .ac140-checkbox-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;background:#f7faff;border:1px solid #d9e5f5;border-radius:12px}\n.ac140-modal .ac140-scope-choice{display:flex!important;align-items:center!important;gap:8px!important;padding:9px 10px!important;margin:0!important;border:1px solid #d6e3f6!important;border-radius:9px!important;background:white!important;cursor:pointer!important;font-size:12px!important;font-weight:600!important;color:#25456f!important}\n.ac140-modal .ac140-scope-choice:has(input:checked){background:#e7f1ff!important;border-color:#79acf0!important;color:#135bad!important}\n.ac140-modal .ac140-scope-choice input[type=checkbox]{appearance:auto!important;display:block!important;width:17px!important;height:17px!important;flex:0 0 17px!important;accent-color:#176ad1!important;margin:0!important}\n.ac140-modal .ac140-scope-field small{color:#7084a2;font-size:10px}\n@media(max-width:520px){.ac140-modal .ac140-checkbox-grid{grid-template-columns:1fr}}\n';document.head.appendChild(s)})();


/* QLKTX V46: Admin-only Excel account export. Read from protected server API, never export passwords. */
(function(){
  'use strict';
  const previous=window.accPage;
  if(typeof previous!=='function')return;
  let exporting=false;
  const fmtDate=(v)=>{if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleString('vi-VN',{hour12:false})};
  const textCell=(v)=>{const s=String(v??'');return /^[\s\x00-\x1f]*[=+@-]/.test(s)?"'"+s:s};
  const asList=(v)=>Array.isArray(v)?v.map(String).join(', '):'';
  const makeWorkbook=(accounts)=>{
    if(!window.XLSX?.utils?.aoa_to_sheet||!window.XLSX?.write)throw Error('Thư viện Excel chưa tải. Vui lòng kiểm tra kết nối và thử lại.');
    const book=XLSX.utils.book_new();
    const head=['STT','Tên đăng nhập','Họ và tên','Email xác thực','Vai trò','Phạm vi KTX','Phạm vi Dãy','Trạng thái','Ngày tạo','Cập nhật gần nhất','Đăng nhập gần nhất','Mã tài khoản'];
    const matrix=[head,...accounts.map((a,i)=>{
      const email=String(a.email||'');const username=email.endsWith('@users.ktx-hoc-mon.app')?email.split('@')[0]:email;
      return [i+1,username,a.display_name||'',email,(window.ROLES&&ROLES[a.role])||a.role||'',asList(a.ktx),asList(a.days),a.enabled?'Hoạt động':'Đã khóa',fmtDate(a.created_at),fmtDate(a.updated_at),fmtDate(a.last_login_at),String(a.user_id||'')].map((v,k)=>k===0?v:textCell(v));
    })];
    const sheet=XLSX.utils.aoa_to_sheet(matrix);sheet['!cols']=[{wch:6},{wch:28},{wch:30},{wch:39},{wch:18},{wch:30},{wch:35},{wch:18},{wch:21},{wch:21},{wch:21},{wch:39}];
    sheet['!autofilter']={ref:`A1:L${Math.max(1,matrix.length)}`};
    XLSX.utils.book_append_sheet(book,sheet,'Danh sách tài khoản');
    const notes=XLSX.utils.aoa_to_sheet([
      ['Thông tin xuất','Giá trị'],['Nguồn dữ liệu','Supabase app_accounts, đọc mới qua API được bảo vệ'],
      ['Phạm vi','Toàn bộ tài khoản ứng dụng (không phụ thuộc bộ lọc màn hình)'],
      ['Mật khẩu','Không được lưu hoặc xuất trong báo cáo này'],
      ['Đặt lại mật khẩu','Thực hiện qua quy trình quản trị an toàn; không thể đọc mật khẩu gốc'],
      ['Quyền truy cập','Chỉ tài khoản Quản trị đang hoạt động'],['Thời gian xuất',fmtDate(new Date().toISOString())],
      ['Số tài khoản',accounts.length]
    ]);notes['!cols']=[{wch:26},{wch:75}];XLSX.utils.book_append_sheet(book,notes,'Hướng dẫn');
    const bytes=XLSX.write(book,{bookType:'xlsx',type:'array'});
    const blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url=URL.createObjectURL(blob);
    const file=`QLKTX_Danh_sach_tai_khoan_${new Date().toISOString().slice(0,10)}.xlsx`;
    const link=document.createElement('a');link.href=url;link.download=file;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);
  };
  const exportAccounts=async(button)=>{
    if(exporting)return;
    if(!window.ME||ME.role!=='admin'||typeof can==='function'&&!can('acct')){alert('Chỉ Quản trị được xuất danh sách tài khoản.');return}
    exporting=true;button.disabled=true;const oldLabel=button.textContent;button.textContent='Đang xuất...';
    try{
      const sb=typeof syncClient==='function'?syncClient():null;
      if(!sb)throw Error('Chưa kết nối Supabase.');
      const auth=await sb.auth.getSession();const token=auth.data?.session?.access_token;
      if(auth.error||!token)throw Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      const response=await fetch('/api/admin-export-accounts',{method:'GET',cache:'no-store',headers:{Authorization:'Bearer '+token,Accept:'application/json'}});
      const result=await response.json().catch(()=>null);
      if(!response.ok||!result?.ok)throw Error(result?.error||`Lỗi máy chủ (HTTP ${response.status}).`);
      if(!Array.isArray(result.accounts))throw Error('Phản hồi danh sách tài khoản không hợp lệ.');
      if(!result.accounts.length)throw Error('Cloud không trả về tài khoản. Không tạo file Excel rỗng.');
      makeWorkbook(result.accounts);
    }catch(error){console.error('[KTX V46 account export]',error);alert('Không xuất được Excel: '+(error?.message||String(error)))}
    finally{exporting=false;button.disabled=false;button.textContent=oldLabel}
  };
  // V47: Other bundles can replace or re-render accPage after bundle 06 loads.
  // Observe the actual account page so the button persists across all renderers.
  const mayExport=()=>Boolean(window.ME&&window.ME.role==='admin'&&(typeof can!=='function'||can('acct')));
  const mountExportButton=()=>{
    const root=document.getElementById('acc');if(!root)return;
    const existing=root.querySelector('#ac146ExportAccounts');
    if(!mayExport()) {if(existing)existing.remove();return;}
    if(existing)return;
    const heading=root.querySelector('.ac140-top')||root.querySelector('.ac140-search')||root.querySelector('.ac-toolbar');
    if(!heading)return;
    const button=document.createElement('button');button.type='button';button.id='ac146ExportAccounts';button.className='btn s';
    button.textContent='↓ Xuất Excel tài khoản';button.title='Xuất danh sách tài khoản từ Cloud, không gồm mật khẩu';
    button.style.cssText='min-height:36px;font-size:12px;white-space:nowrap;flex:0 0 auto';
    const create=heading.querySelector('#ac140Create');if(create)heading.insertBefore(button,create);else heading.appendChild(button);
    button.addEventListener('click',()=>exportAccounts(button));
  };
  const install=()=>{
    const root=document.getElementById('acc');if(!root)return;
    const observer=new MutationObserver(()=>mountExportButton());
    observer.observe(root,{childList:true,subtree:true});
    mountExportButton();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.accPage=async function(){
    const result=await previous.apply(this,arguments);
    mountExportButton();
    return result;
  };
})();
