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
    const home=new Set(['xt','xr','gk']);
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
    const sb=typeof qrSb==='function' ? qrSb() : null;
    if(!sb) return {ok:false,message:'Chưa kết nối Supabase.'};
    const {error}=await sb.from('residency_requests').update(patch).eq('id',id).eq('status','pending');
    return error ? {ok:false,message:error.message||String(error)} : {ok:true};
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
