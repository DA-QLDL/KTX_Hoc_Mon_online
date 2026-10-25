(function(){
  const originalQrPage = window.qrPage;
  const originalQrMake = window.qrMake;
  const originalApprovePage = window.qrApprovePage;
  if(typeof originalQrMake!=='function') return;

  const state = window.__qrHubState || (window.__qrHubState = {
    section: 'regin',
    reviewTab: 'regin',
    historySource: 'all',
    reportView: 'list',
    counts: { regin: 0, regout: 0, attPending: 0, attApproved: 0 }
  });

  const safe = v => typeof esc === 'function' ? esc(v==null?'':String(v)) : String(v==null?'':v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const host = () => document.getElementById('qr');
  const content = () => document.getElementById('qrHubContent');
  const pendingIn = () => Array.isArray(window.QRREQ) ? QRREQ.filter(x => x.request_type === 'in' && x.status === 'pending').length : 0;
  const pendingOut = () => Array.isArray(window.QRREQ) ? QRREQ.filter(x => x.request_type === 'out' && x.status === 'pending').length : 0;
  const totalWorkers = () => Array.isArray(window.W) ? W.filter(w => typeof can === 'function' ? can('view',w) : true).length : 0;
  const cards = () => {
    const list = [
      ['regin','Đăng ký vào','Tạo QR và tiếp nhận hồ sơ vào KTX'],
      ['regout','Đăng ký ra','Tạo QR và tiếp nhận hồ sơ ra KTX'],
      ['attendance','Điểm danh QR','Phiên điểm danh, mã QR và kiểm soát quân số']
    ];
    if (typeof can === 'function' && (can('qrApprove') || can('attendance'))) list.push(['review','Trung tâm duyệt','Duyệt, sửa và từ chối hồ sơ chờ xử lý']);
    if (typeof can === 'function' && (can('qrApprove') || can('attendance'))) list.push(['history','Lịch sử','Tra cứu hồ sơ đã duyệt hoặc đã từ chối']);
    return list;
  };

  function ensureSection(){
    const allowed = cards().map(x => x[0]);
    if(!allowed.includes(state.section)) state.section = allowed[0] || 'regin';
    if(state.reviewTab==='att') state.reviewTab='regin';
  }

  let countRequestId = 0;
  async function refreshCounts(){
    const requestId = ++countRequestId;
    try {
      if(typeof qrLoadRequests === 'function' && typeof can === 'function' && can('qrApprove')) await qrLoadRequests();
    } catch(e){ console.warn('qrLoadRequests', e); }
    state.counts.regin = pendingIn();
    state.counts.regout = pendingOut();
    if(typeof can === 'function' && can('attendance') && typeof qrSb === 'function'){
      try{
        const sb = qrSb();
        if(sb){
          const {data,error} = await sb.from('ktx_attendance_qr_requests').select('status').order('created_at',{ascending:false}).limit(1000);
          if(!error){
            const rows = data || [];
            state.counts.attPending = rows.filter(r => (r.status || 'pending') === 'pending').length;
            state.counts.attApproved = rows.filter(r => (r.status || '') === 'approved').length;
          }
        }
      }catch(e){ console.warn('attendance counts', e); }
    }
    if(requestId === countRequestId && host()) { updateCountBadges(); if(state.section==='review') updateReviewTabCounts(); }
  }

  function updateCountBadges(){
    const elIn = document.getElementById('qrhubCountIn');
    const elOut = document.getElementById('qrhubCountOut');
    const elAtt = document.getElementById('qrhubCountAtt');
    const elAttApproved = document.getElementById('qrhubCountAttApproved');
    if(elIn) elIn.textContent = state.counts.regin || 0;
    if(elOut) elOut.textContent = state.counts.regout || 0;
    if(elAtt) elAtt.textContent = state.counts.attPending || 0;
    if(elAttApproved) elAttApproved.textContent = state.counts.attApproved || 0;
    const values = [state.counts.regin, state.counts.regout];
    document.querySelectorAll('#qr .qrhub-stat b').forEach((e,i) => { if(i < values.length) e.textContent = String(values[i] || 0); });
  }

  function updateReviewTabCounts(){
    const c=content(); if(!c) return;
    const a=c.querySelector('[data-review-tab="regin"]');
    const b=c.querySelector('[data-review-tab="regout"]');
    if(a) a.textContent='Đăng ký vào ('+state.counts.regin+')';
    if(b) b.textContent='Đăng ký ra ('+state.counts.regout+')';
  }
  function buildPage(){
    ensureSection();
    const wrap = cards().map(([key,title,desc]) => `<button type="button" data-qrhub="${key}" class="${state.section===key?'active':''}"><b>${safe(title)}</b></button>`).join('');
    const h = host(); if(!h) return;
    h.innerHTML = `
      <div class="qrhub-wrap">
        <section class="qrhub-head">
          <div>
            <h3>QR code</h3>
            
          </div>
          <div class="qrhub-chips">
            <span class="qrhub-chip">Công nhân trong phạm vi: ${safe(totalWorkers())}</span>
            <span class="qrhub-chip">Đăng ký vào chờ duyệt: <b id="qrhubCountIn">0</b></span>
            <span class="qrhub-chip">Đăng ký ra chờ duyệt: <b id="qrhubCountOut">0</b></span>


          </div>
        </section>
        <section class="qrhub-menu">${wrap}</section>
        <section class="qrhub-stats">
          <div class="qrhub-stat"><small>ĐĂNG KÝ VÀO</small><b>${safe(state.counts.regin||0)}</b></div>
          <div class="qrhub-stat"><small>ĐĂNG KÝ RA</small><b>${safe(state.counts.regout||0)}</b></div>


        </section>
        <section id="qrHubContent" class="qrhub-content"></section>
      </div>`;
    h.querySelectorAll('[data-qrhub]').forEach(b => b.onclick = () => {
      if(state.section === b.dataset.qrhub) return;
      state.section = b.dataset.qrhub;
      buildPage();
      renderSection();
      refreshCounts();
    });
  }

  function cleanupDynamic(){
    const h = host(); if(!h) return;
    h.querySelectorAll('#qr168').forEach(n => n.remove());
  }

  function renderQrForms(kind){
    cleanupDynamic();
    const c = content(); if(!c) return;
    c.innerHTML = `
      <div class="qrhub-card"><h4>${kind==='regin'?'Đăng ký vào KTX':'Đăng ký ra khỏi KTX'}</h4></div>
      <div id="qb"></div>`;
    window.__qrAttReview = false;
    window.QT = 'make';
    originalQrMake();
    const grid = c.querySelector('#qb .g2');
    if(grid){
      const cards = Array.from(grid.children);
      cards.forEach((card, index) => { card.style.display = index === (kind==='regin'?0:1) ? '' : 'none'; });
      grid.classList.add('qr166-single');
    }
    const cfg = c.querySelector('#qrcfg')?.closest('.card');
    if(cfg) cfg.style.display = 'none';
  }

  function initQrAttendance(mode){
    cleanupDynamic();
    const c = content(); if(!c) return;
    c.innerHTML = `
      <div class="qrhub-card"><h4>${mode==='report'?'Báo cáo điểm danh QR':'Điểm danh QR theo phiên'}</h4></div>
      
      <div class="qr166-switch qrhub-hidden-switch"><button type="button" data-mode="att" class="active">Điểm danh</button></div>
      <div id="qb"></div>`;
    window.__qrAttReview = false;
    window.QT = 'make';
    originalQrMake();
    const grid = c.querySelector('#qb .g2');
    if(grid){
      const cards = Array.from(grid.children);
      cards.forEach((card, index) => { card.style.display = index === 2 ? '' : 'none'; });
      grid.classList.add('qr166-single');
    }
    const cfg = c.querySelector('#qrcfg')?.closest('.card');
    if(cfg) cfg.style.display = 'none';
    setTimeout(() => {
      if(typeof window.ktx168Init === 'function') window.ktx168Init();
      if(mode === 'report'){
        setTimeout(() => {
          const reportTab = document.querySelector('#qr168 [data-tab="list"]');
          if(reportTab) reportTab.click();
        }, 120);
      }
    }, 0);
  }

  function renderReviewCenter(){
    cleanupDynamic();
    const c = content(); if(!c) return;
    c.innerHTML = `
      <div class="qrhub-card"><h4>Trung tâm duyệt</h4></div>
      <div class="qrhub-subtabs">
        <button type="button" data-review-tab="regin" class="${state.reviewTab==='regin'?'active':''}">Đăng ký vào (${safe(state.counts.regin||0)})</button>
        <button type="button" data-review-tab="regout" class="${state.reviewTab==='regout'?'active':''}">Đăng ký ra (${safe(state.counts.regout||0)})</button>

      </div>
      <div id="qrHubReviewBody"></div>`;
    c.querySelectorAll('[data-review-tab]').forEach(b => b.onclick = () => { state.reviewTab = b.dataset.reviewTab; renderReviewCenter(); });
    if(state.reviewTab==='att') state.reviewTab='regin';
    const body = c.querySelector('#qrHubReviewBody');
    if(state.reviewTab === 'att'){
      body.innerHTML = '<div id="qb"></div>';
      window.__qrAttReview = true;
      window.QT = 'make';
      originalQrMake();
      setTimeout(() => {
        const loadBtn = document.getElementById('qr160load');
        if(loadBtn) loadBtn.click();
      }, 0);
    } else {
      body.innerHTML = '<div id="qb"></div>';
      window.__qrAttReview = false;
      window.QT = state.reviewTab === 'regin' ? 'regin' : 'regout';
      Promise.resolve(originalApprovePage(state.reviewTab === 'regin' ? 'in' : 'out')).catch(err => {
        body.innerHTML = '<div class="qrhub-note">Không thể tải danh sách duyệt: '+ safe(err?.message || err) +'</div>';
      });
    }
  }

  async function renderHistory(){
    cleanupDynamic();
    const c = content(); if(!c) return;
    c.innerHTML = `
      <div class="qrhub-card"><h4>Lịch sử xử lý QR</h4></div>
      <div class="qrhub-subtabs">
        <button type="button" data-history-source="all" class="${state.historySource==='all'?'active':''}">Tất cả</button>
        <button type="button" data-history-source="residency" class="${state.historySource==='residency'?'active':''}">Đăng ký vào / ra</button>
        <button type="button" data-history-source="attendance" class="${state.historySource==='attendance'?'active':''}">Điểm danh QR</button>
      </div>
      <div class="qrhub-loading">Đang tải lịch sử xử lý...</div>`;
    c.querySelectorAll('[data-history-source]').forEach(b => b.onclick = () => { state.historySource = b.dataset.historySource; renderHistory(); });
    const sb = typeof qrSb === 'function' ? qrSb() : null;
    if(!sb){ c.querySelector('.qrhub-loading').textContent = 'Chưa kết nối Supabase để tải lịch sử.'; return; }
    try{
      if(typeof qrEnsureLogin === 'function') await qrEnsureLogin();
    }catch(_){ }
    try {
      const residencyPromise = sb.from('residency_requests').select('*').order('created_at',{ascending:false}).limit(500);
      const attPromise = sb.from('ktx_attendance_qr_requests').select('*').order('created_at',{ascending:false}).limit(500);
      const [resA,resB] = await Promise.all([residencyPromise, attPromise]);
      const rows = [];
      if(!resA.error && state.historySource !== 'attendance'){
        (resA.data||[]).filter(r => ['approved','rejected'].includes(r.status)).forEach(r => rows.push({
          source: 'Đăng ký ' + (r.request_type === 'out' ? 'ra' : 'vào'),
          name: r.name || r.worker_name || '—',
          code: r.worker_code || r.cccd || '—',
          place: [r.ktx || '', r.day || '', r.room ? ('P.'+r.room) : ''].filter(Boolean).join(' · ') || '—',
          type: r.request_type === 'out' ? 'Ra KTX' : 'Vào KTX',
          created: r.created_at,
          reviewed: r.reviewed_at,
          status: r.status
        }));
      }
      if(!resB.error && state.historySource !== 'residency'){
        (resB.data||[]).filter(r => ['approved','rejected'].includes(r.status)).forEach(r => rows.push({
          source: 'Điểm danh QR',
          name: r.worker_name || r.name || '—',
          code: r.worker_code || '—',
          place: [r.ktx || '', r.day || '', r.room ? ('P.'+r.room) : ''].filter(Boolean).join(' · ') || '—',
          type: r.direction === 'out' ? 'Điểm danh ra' : 'Điểm danh vào',
          created: r.created_at,
          reviewed: r.reviewed_at,
          status: r.status
        }));
      }
      const failures = [];
      if(resA.error && state.historySource !== 'attendance') failures.push('Đăng ký vào/ra: '+resA.error.message);
      if(resB.error && state.historySource !== 'residency') failures.push('Điểm danh: '+resB.error.message);
      if(failures.length){ const e = c.querySelector('.qrhub-loading'); if(e) e.textContent = 'Không tải đủ lịch sử từ Cloud: '+failures.join(' · '); return; }
      rows.sort((a,b) => new Date(b.created || 0) - new Date(a.created || 0));
      const html = rows.length ? `
        <div class="qrhub-meta"><div class="qrhub-note">Hiển thị ${rows.length} hồ sơ đã xử lý gần nhất từ Supabase.</div></div>
        <div class="qrhub-history-wrap"><table class="qrhub-history-table"><thead><tr><th>Nguồn</th><th>Họ tên</th><th>Mã NV / CCCD</th><th>KTX / Dãy / Phòng</th><th>Loại</th><th>Thời gian gửi</th><th>Trạng thái</th><th>Thời gian xử lý</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${safe(r.source)}</td><td><b>${safe(r.name)}</b></td><td>${safe(r.code)}</td><td>${safe(r.place)}</td><td>${safe(r.type)}</td><td>${safe(r.created ? new Date(r.created).toLocaleString('vi-VN') : '—')}</td><td>${r.status==='approved' ? '<span class="tag g">Đã duyệt</span>' : '<span class="tag r">Từ chối</span>'}</td><td>${safe(r.reviewed ? new Date(r.reviewed).toLocaleString('vi-VN') : '—')}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="qrhub-note">Chưa có dữ liệu lịch sử phù hợp.</div>';
      c.querySelector('.qrhub-loading').outerHTML = html;
    } catch(e){
      c.querySelector('.qrhub-loading').textContent = 'Không thể tải lịch sử: ' + (e?.message || e);
    }
  }

  function renderSection(){
    switch(state.section){
      case 'regout': return renderQrForms('regout');
      case 'attendance': return initQrAttendance('attendance');
      case 'review': return renderReviewCenter();
      case 'history': return renderHistory();
      case 'reports': return initQrAttendance('report');
      case 'regin':
      default: return renderQrForms('regin');
    }
  }

  window.qrPage = function(){
    buildPage();
    renderSection();
    refreshCounts();
  };
})();
