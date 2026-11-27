/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/operational-fix-105.js >>> */
/* v1.0.5: Safe admin bulk deletion and visible Cloud write verification. */
(function(){
'use strict';
const el=id=>document.getElementById(id);
let ktx105NoticeTimer;
const status=(s,bad=false)=>{
 if(!bad){const n=el('ktx105SyncNotice');if(n)n.remove();return;}
 let n=el('ktx105SyncNotice');
 if(!n){n=document.createElement('div');n.id='ktx105SyncNotice';n.setAttribute('role','status');n.style.cssText='position:fixed;top:76px;left:50%;transform:translateX(-50%);max-width:min(520px,calc(100vw - 24px));z-index:999990;padding:11px 16px;border-radius:12px;font:600 13px/1.45 system-ui;background:#eaf5ff;color:#1455a2;box-shadow:0 4px 18px #0002';document.body.appendChild(n)}
 n.textContent=s;n.style.background=bad?'#fff0f0':'#eaf5ff';n.style.color=bad?'#a52232':'#1455a2';
 clearTimeout(ktx105NoticeTimer);ktx105NoticeTimer=setTimeout(()=>{if(n.isConnected)n.remove()},6500);
};
let running=false;
const guardedPush=async()=>{
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.enabled||!SUPA_SYNC.ready||!SUPA_SYNC.session){status('Dữ liệu hiện mới lưu trên thiết bị. Hãy kết nối Supabase để lưu bền vững.',true);return false}
 if(SUPA_SYNC.pulling||SUPA_SYNC.applying){status('Cloud đang tải dữ liệu. Vui lòng đồng bộ lại sau.',true);return false}
 try{
  if(SUPA_SYNC.pushing){status('Đang đồng bộ. Chưa xác nhận lưu Cloud.',true);return false}
  const r=await syncPushAll();
  if(!r||!r.ok||r.conflicts||SUPA_SYNC.pending){status('Chưa lưu xong trên Cloud: '+(SUPA_SYNC.lastError||'Có dữ liệu xung đột hoặc chờ đồng bộ.'),true);return false}
  status('Đã ghi dữ liệu lên Supabase.');return true;
 }catch(e){status('Không đồng bộ được: '+(e.message||e),true);return false}
};
window.ktx105VerifySave=guardedPush;
// STEP258 rollback: restored the original dsall -> askLeave -> delWorkers flow.
// Do not intercept #dsall in capture phase or invoke ktx_admin_delete_all_workers.
// Cloud-write verification and import notices below remain active.
// V35: no beforeunload prompt; preserve Cloud write verification and conflict state.
// Import confirmation: offer an explicit Cloud verification after importer completes.
let imported=false;
document.addEventListener('change',ev=>{if(ev.target&&ev.target.id==='fx'&&ev.target.files&&ev.target.files.length){imported=true;status('Đã đọc file Excel. Chỉ khi Supabase xác nhận lưu xong mới được xem là Import thành công.');setTimeout(()=>{const n=el('ktx105SyncNotice');if(n&&n.textContent.includes('Đã nhận file Import'))n.remove()},6000)}},true);
// v1.0.20: No Cloud verification button is injected into the global toolbar.
// Save-check internals are kept available without exposing this extra control.
})();

;
/* >>> Original: assets/js/core/download-status-106.js >>> */
/* KTX v1.0.6: visible Supabase download state. */
(function(){
'use strict';
let timer;
window.ktxDownloadStatus=function(type,message){
 if(type==='loading'||type==='success'){const old=document.getElementById('ktx106DownloadStatus');if(old)old.style.display='none';return;}
 let n=document.getElementById('ktx106DownloadStatus');
 if(!n){n=document.createElement('div');n.id='ktx106DownloadStatus';n.setAttribute('role','status');n.setAttribute('aria-live','polite');n.style.cssText='position:fixed;right:16px;bottom:76px;z-index:2147482500;max-width:min(420px,calc(100vw - 32px));padding:12px 16px;border-radius:12px;font:600 13px/1.45 system-ui;box-shadow:0 8px 26px #15233b24;overflow-wrap:anywhere';document.body.appendChild(n)}
 const c={loading:['⏳','#eff6ff','#174b89'],success:['✓','#eaf9ef','#11643a'],error:['⚠','#fff0f1','#9e2437']}[type]||['⏳','#eff6ff','#174b89'];
 n.textContent=c[0]+' '+message;n.style.background=c[1];n.style.color=c[2];n.style.display='block';
 clearTimeout(timer);if(type==='success'||type==='error')timer=setTimeout(()=>n.style.display='none',type==='success'?6500:12000);
};
const pull=window.syncPullAll;
if(typeof pull==='function')window.syncPullAll=async function(){
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.pulling){window.ktxDownloadStatus('loading','Đang chờ lượt tải Cloud hiện tại hoàn tất…');return pull.apply(this,arguments);}
 window.ktxDownloadStatus('loading','Đang tải dữ liệu mới nhất từ Supabase…');
 try{const r=await pull.apply(this,arguments);
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.lastError)window.ktxDownloadStatus('error','Tải thất bại: '+SUPA_SYNC.lastError);
 else if(r&&r.pending)window.ktxDownloadStatus('error','Dữ liệu chưa lưu hết; đã dừng tải để tránh ghi đè. Kiểm tra Đồng bộ Supabase.');
 else if(r&&r.ok===false)window.ktxDownloadStatus('error','Chưa hoàn tất tải Cloud. Vui lòng kiểm tra trạng thái đồng bộ.');
 else if(typeof SUPA_SYNC!=='undefined'&&!SUPA_SYNC.pulling&&SUPA_SYNC.lastSync)window.ktxDownloadStatus('success','Đã nhận phản hồi Cloud.');
 else window.ktxDownloadStatus('error','Chưa thể xác nhận tải hoàn tất.');
 return r;
 }catch(e){window.ktxDownloadStatus('error','Tải thất bại: '+(e.message||e));throw e}
};
})();

;
/* >>> Original: assets/js/core/ios-cloud-error-v201.js >>> */
/* V2.0.1 iOS: explain local WebKit storage quota without obscuring real Cloud errors. */
(function(){'use strict';
  const quota=/quota.*exceed|exceed.*quota|QuotaExceededError|storage quota/i;
  function readable(msg){
    const s=String(msg||'');
    if(!quota.test(s))return s;
    return 'Bộ nhớ trang web trên iPhone đã đạt giới hạn. Chưa thể xác nhận lần tải này; hãy mở KTX Hóc Môn bằng Safari (không qua trình duyệt trong ứng dụng khác) và thử Tải Cloud lại. Không xóa dữ liệu ứng dụng khi chưa xác nhận đã lưu trên Cloud.';
  }
  function install(){
    const previous=window.ktxDownloadStatus;
    if(typeof previous!=='function'||previous.__ktxIosQuota)return;
    const wrap=function(type,message){return previous.call(this,type,type==='error'?readable(message):message)};
    wrap.__ktxIosQuota=true;window.ktxDownloadStatus=wrap;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

;
/* >>> Original: assets/js/core/script-74.js >>> */
(function(){
  if(typeof window==='undefined') return;
  const $=id=>document.getElementById(id);
  const esc=window.esc||function(s){return String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))};

  function injectCss(){
    if(document.getElementById('ktx74-inline-style')) return;
    const st=document.createElement('style');
    st.id='ktx74-inline-style';
    st.textContent=`
      body[data-page="qr"] #tools.top-actions{display:none!important}
      .qr74-actions{display:flex;align-items:center;justify-content:flex-start;gap:6px;flex-wrap:nowrap;white-space:nowrap}
      .qr74-actions .btn{margin:0!important;min-width:auto!important}
      .qr74-actions-cell{min-width:185px}
      .qr74-head-actions{display:none!important}
      .qr74-head-compact{padding-bottom:2px!important}
      .qr74-head-compact .mut{margin-top:4px!important}
      .qr74-head-compact .row:last-child{display:none!important}
      @media (max-width:860px){
        .qr74-actions{gap:4px}
        .qr74-actions .btn{padding:7px 10px!important;font-size:11px!important}
        .qr74-actions-cell{min-width:170px}
      }
    `;
    document.head.appendChild(st);
  }

  function setTopActionVisibility74(){
    const tools=$('tools');
    if(!tools) return;
    injectCss();
    const cur=String(window.page||document.body.dataset.page||'home');
    const commonIds=['xt','fxb','undoImport','xw','aw','xr','bn','mnb2','wd','ds2','dsall','gk','imode'];
    const home=new Set(['gk','xt','fxb','xr']);
    const work=new Set(['imode','xt','fxb','undoImport','xw','aw','xr','bn','mnb2','wd','ds2','dsall']);
    const showMap=cur==='home'?home:(cur==='work'?work:null);
    commonIds.forEach(id=>{const el=$(id); if(!el) return; el.classList.toggle('hide', !showMap || !showMap.has(id));});
    const more=$('ktxMoreActions');
    if(more) more.classList.toggle('hide',cur!=='work');
    tools.classList.toggle('hide',!showMap);
    tools.classList.remove('ktx74-inline-row');
    const gk=$('gk');
    if(gk) gk.classList.toggle('home-ktx-select',cur==='home');
  }

  async function updatePendingRequest(id,patch){
    const current=(window.QRREQ||[]).find(r=>String(r.id)===String(id));
    if(!current||!window.ktxQrScopeAllows?.(current)||!window.ktxQrScopeAllows?.({...current,...patch}))return {ok:false,message:'Yêu cầu hoặc vị trí mới nằm ngoài KTX/Dãy được quản lý.'};
    const sb=typeof qrSb==='function' ? qrSb() : null;
    if(!sb) return {ok:false,message:'Chưa kết nối Supabase.'};
    const {error}=await sb.from('residency_requests').update(patch).eq('id',id).eq('status','pending');
    return error ? {ok:false,message:(String(error.code||'')==='42501'||/permission denied|row.level.security/i.test(String(error.message||'')))?'Không đủ quyền UPDATE/RLS trên Supabase đối với residency_requests. Cần rà soát SQL V2.0.7; hồ sơ chưa được sửa.':(error.message||String(error))} : {ok:true};
  }

  window.qr74EditIn=async function(id){
    if(typeof can==='function' && !can('qrApprove')) return alert('Bạn không có quyền sửa hồ sơ QR.');
    const r=(window.QRREQ||[]).find(x=>String(x.id)===String(id));
    if(!r) return;
    const fields=[
      ['name','Họ tên'],['worker_code','Mã nhân viên'],['cccd','CCCD'],['phone','SĐT'],
      ['ktx','KTX'],['day','Dãy'],['room','Phòng'],['check_in_date','Ngày vào'],['leader_phone','SĐT tổ trưởng']
    ];
    const patch={};
    for(const [key,label] of fields){
      const val=prompt('Sửa '+label+':',r[key]||'');
      if(val===null) return;
      patch[key]=String(val).trim();
    }
    if(!patch.name) return alert('Họ tên không được để trống.');
    const rs=await updatePendingRequest(r.id,patch);
    if(!rs.ok) return alert('Không thể cập nhật yêu cầu: '+rs.message);
    Object.assign(r,patch);
    if(typeof qrPage==='function') qrPage();
  };

  window.qr74EditOut=async function(id){
    if(typeof window.qr224EditOut==='function') return window.qr224EditOut(id);
    if(typeof can==='function' && !can('qrApprove')) return alert('Bạn không có quyền sửa hồ sơ QR.');
    const r=(window.QRREQ||[]).find(x=>String(x.id)===String(id));
    if(!r) return;
    const fields=[['name','Họ tên'],['worker_code','Mã nhân viên'],['cccd','CCCD'],['day','Dãy'],['room','Phòng'],['reason','Lý do']];
    const patch={};
    for(const [key,label] of fields){
      const val=prompt('Sửa '+label+':',r[key]||'');
      if(val===null) return;
      patch[key]=String(val).trim();
    }
    if(!patch.name) return alert('Họ tên không được để trống.');
    const rs=await updatePendingRequest(r.id,patch);
    if(!rs.ok) return alert('Không thể cập nhật yêu cầu: '+rs.message);
    Object.assign(r,patch);
    if(typeof qrPage==='function') qrPage();
  };

  function buildActionButton(label, cls, handler){
    const b=document.createElement('button');
    b.type='button';
    b.className='btn '+cls+' sm';
    b.textContent=label;
    b.onclick=handler;
    return b;
  }

  function replaceReviewActions(mode){
    const root=$('qb'); if(!root) return;
    root.querySelectorAll('#qrrf,#qrlo').forEach(btn=>btn.remove());
    root.querySelectorAll('.card .row').forEach(row=>{
      if(row.querySelector('#qrrf')||row.querySelector('#qrlo')) row.classList.add('qr74-head-actions');
    });
    const firstHead=root.querySelector('.card > .row');
    if(firstHead) firstHead.classList.add('qr74-head-compact');

    const table=root.querySelector(mode==='in'?'.qr-review-in table':'.qr-review-out table');
    if(!table) return;
    const rows=Array.from(table.querySelectorAll('tr')).slice(1);
    const items=(window.QRREQ||[]).filter(r=>r.request_type===(mode==='in'?'in':'out') && r.status==='pending');

    rows.forEach((tr,idx)=>{
      const r=items[idx]; if(!r) return;
      const td=tr.lastElementChild; if(!td) return;
      td.classList.add('qr74-actions-cell');
      td.innerHTML='';
      const wrap=document.createElement('div');
      wrap.className='qr74-actions';
      if(mode==='in'){
        wrap.appendChild(buildActionButton('Sửa','s',()=>window.qr74EditIn(r.id)));
        wrap.appendChild(buildActionButton('Duyệt','g',()=>window.qrApproveIn && window.qrApproveIn(r.id)));
        wrap.appendChild(buildActionButton('Từ chối','s',()=>window.qrReject && window.qrReject(r.id)));
      }else{
        wrap.appendChild(buildActionButton('Duyệt ra','r',()=>window.qrApproveOut && window.qrApproveOut(r.id)));
        wrap.appendChild(buildActionButton('Sửa','s',()=>window.qr74EditOut(r.id)));
        wrap.appendChild(buildActionButton('Từ chối','s',()=>window.qrReject && window.qrReject(r.id)));
      }
      td.appendChild(wrap);
    });
  }

  function repairQrUi74(){
    if(String(window.page||document.body.dataset.page||'')!=='qr') return;
    if(window.QT==='regin') replaceReviewActions('in');
    if(window.QT==='regout') replaceReviewActions('out');
  }

  const oldQrPage=window.qrPage;
  if(typeof oldQrPage==='function' && !oldQrPage.__ktx74){
    window.qrPage=function(){
      const res=oldQrPage.apply(this,arguments);
      Promise.resolve(res).finally(()=>setTimeout(repairQrUi74,0));
      return res;
    };
    window.qrPage.__ktx74=true;
  }

  const oldGo=window.go;
  if(typeof oldGo==='function' && !oldGo.__ktx74){
    window.go=function(){
      const res=oldGo.apply(this,arguments);
      setTopActionVisibility74();
      setTimeout(()=>{setTopActionVisibility74();repairQrUi74();},0);
      return res;
    };
    window.go.__ktx74=true;
  }

  const oldAll=window.all;
  if(typeof oldAll==='function' && !oldAll.__ktx74){
    window.all=function(){
      const res=oldAll.apply(this,arguments);
      setTopActionVisibility74();
      setTimeout(()=>{setTopActionVisibility74();repairQrUi74();},0);
      return res;
    };
    window.all.__ktx74=true;
  }

  window.syncTopActions=setTopActionVisibility74;
  document.addEventListener('DOMContentLoaded',()=>{setTopActionVisibility74();setTimeout(repairQrUi74,0)});
  window.addEventListener('load',()=>{setTopActionVisibility74();setTimeout(repairQrUi74,0)});
})();
