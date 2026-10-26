
(function(){
  if(typeof window==='undefined') return;
  const $=id=>document.getElementById(id);
  const esc=window.esc||function(s){return String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))};
  const body=document.body;
  const sortArrow=(dir,active)=>active?(dir==='asc'?'▲':'▼'):'↕';
  window.__resSort130=window.__resSort130||{key:'name',asc:true};
  window.__arcSort130=window.__arcSort130||{key:'date',dir:'desc'};

  function toggleQrBody(){
    if(!body) return;
    body.classList.toggle('qr130-active',window.page==='qr');
  }

  function decorateResidenceTable(){
    const root=$('tl'); if(!root) return;
    const state=window.__resSort130||{key:'name',asc:true};
    root.querySelectorAll('[data-rsort]').forEach(th=>{
      const key=th.dataset.rsort;
      const label=(th.dataset.baseLabel||(th.textContent||'').replace(/[↕▲▼]/g,'').trim());
      th.dataset.baseLabel=label;
      th.classList.add('ui130-sortable');
      th.classList.toggle('on',state.key===key);
      th.innerHTML='<span>'+esc(label)+'</span><span class="ui130-arr">'+sortArrow(state.asc?'asc':'desc',state.key===key)+'</span>';
    });
  }

  if(typeof window.residenceSort29==='function'){
    const oldResSort=window.residenceSort29;
    window.residenceSort29=function(key){
      const s=window.__resSort130||{key:'name',asc:true};
      window.__resSort130=(s.key===key?{key:key,asc:!s.asc}:{key:key,asc:true});
      return oldResSort.apply(this,arguments);
    };
  }
  if(typeof window.tl==='function'){
    const oldTl=window.tl;
    window.tl=function(){ const r=oldTl.apply(this,arguments); decorateResidenceTable(); toggleQrBody(); return r; };
  }

  function arcVal(item,key){
    if(!item) return '';
    const w=item.w||{};
    switch(key){
      case 'name': return w.name||'';
      case 'mnv': return w.mnv||'';
      case 'ktx': return (typeof K==='function'?K(w):w.ktx)||'';
      case 'day': return (typeof D==='function'?D(w):w.day)||'';
      case 'room': return (typeof R==='function'?R(w):w.room)||'';
      case 'cccd': return w.cccd||'';
      case 'reason': return item.reason||'';
      case 'date': return item.date||'';
      default: return item[key]||'';
    }
  }
  function cmp130(a,b){
    const sa=String(a??'').trim(), sb=String(b??'').trim();
    const na=Number(sa), nb=Number(sb);
    if(sa!=='' && sb!=='' && !Number.isNaN(na) && !Number.isNaN(nb)) return na-nb;
    return sa.localeCompare(sb,'vi',{numeric:true,sensitivity:'base'});
  }
  function arcHeader(key,label){
    const st=window.__arcSort130||{key:'date',dir:'desc'};
    return '<th class="ui130-sortable '+(st.key===key?'on':'')+'" data-asort="'+key+'">'+label+'<span class="ui130-arr">'+sortArrow(st.dir==='asc'?'asc':'desc',st.key===key)+'</span></th>';
  }
  if(typeof window.arcRender==='function'){
    window.arcRender=function(){
      if(!$('ar_t')) return;
      const filtered=(typeof arcFlt==='function'?arcFlt():[]).slice();
      const st=window.__arcSort130||{key:'date',dir:'desc'};
      const L=filtered.sort((a,b)=>{
        const c=cmp130(arcVal(a,st.key),arcVal(b,st.key)) || cmp130(arcVal(a,'name'),arcVal(b,'name'));
        return st.dir==='asc'?c:-c;
      });
      const cn=r=>Array.isArray(window.ARC)?ARC.filter(a=>a.reason==r).length:0;
      $('ar_k').innerHTML=`<div class="card"><div class="lbl">TỔNG ĐÃ CHUYỂN RA</div><div class="kpi">${(window.ARC||[]).length.toLocaleString('vi-VN')}</div></div><div class="card"><div class="lbl">ĐIỀU CHUYỂN</div><div class="kpi">${cn('Điều chuyển')}</div></div><div class="card"><div class="lbl">NGHỈ VIỆC</div><div class="kpi">${cn('Nghỉ việc')}</div></div><div class="card"><div class="lbl">CHUYỂN RA NGOÀI Ở</div><div class="kpi">${cn('Chuyển ra ngoài ở')}</div></div>`;
      $('ar_n').textContent=`${L.length.toLocaleString('vi-VN')} / ${(window.ARC||[]).length.toLocaleString('vi-VN')} người · đã chọn ${(window.AS?AS.size:0)}`;
      $('ar_n').classList.toggle('on',window.AS&&AS.size>0);
      const sh=L.slice(0,300);
      $('ar_t').innerHTML=(window.ARC||[]).length?`<div class="arc130-toolbar"><div class="mut">Bấm vào tiêu đề cột để sắp xếp nhanh.</div><div class="arc130-info">Sắp xếp: <b>${({name:'Họ và tên',mnv:'Mã NV',ktx:'KTX',day:'Dãy',room:'Phòng',cccd:'CCCD',reason:'Lý do',date:'Ngày'}[st.key]||st.key)}</b> · ${st.dir==='asc'?'Tăng dần':'Giảm dần'}</div></div><div class="wrap arc130-table"><table class="cmp3"><tr><th><input type="checkbox" id="ar_a2" aria-label="Chọn tất cả"></th><th>STT</th>${arcHeader('name','Họ và tên')}${arcHeader('mnv','Mã NV')}${arcHeader('ktx','KTX')}${arcHeader('day','Dãy')}${arcHeader('room','Phòng')}${arcHeader('cccd','CCCD')}${arcHeader('reason','Lý do')}${arcHeader('date','Ngày')}<th>Thao tác</th></tr>${sh.map((a,i)=>`<tr><td><input type="checkbox" class="ak" data-i="${esc(a.id)}" ${window.AS&&AS.has(a.id)?'checked':''}></td><td>${i+1}</td><td class="wr"><b>${esc(a.w.name)}</b></td><td>${esc(a.w.mnv||'—')}</td><td><span class="pl ${(typeof kc==='function'?kc(K(a.w)):'k1')}">${esc(K(a.w))}</span></td><td>${esc(D(a.w))}</td><td>${esc(R(a.w)||'—')}</td><td>${esc(a.w.cccd||'')}</td><td><span class="pl ${(window.RC&&RC[a.reason])||'dy2'}">${esc(a.reason)}</span></td><td>${typeof vn==='function'?vn(a.date):esc(a.date||'')}</td><td>${can('restore')?`<button class="btn s sm arc130-restore" data-ar="${esc(a.id)}">Sửa & khôi phục</button>`:''} ${can('purge')?`<button class="btn r sm arc130-purge" data-ap="${esc(a.id)}">Xóa hẳn</button>`:''}${!can('restore')&&!can('purge')?'<span class="mut">Chỉ xem</span>':''}</td></tr>`).join('')}</table></div>${L.length>300?`<div class="mut" style="margin-top:8px">Hiển thị 300 dòng đầu, hãy lọc để thu hẹp.</div>`:''}`:'<p class="mut" style="margin:14px 0 0">Chưa có ai trong danh sách này. Khi bạn xóa công nhân ở các mục khác, họ sẽ được chuyển vào đây thay vì bị xóa hẳn.</p>';
      const T2=$('ar_t');
      T2.querySelectorAll('.ak').forEach(c=>c.onchange=()=>{c.checked?AS.add(c.dataset.i):AS.delete(c.dataset.i);$('ar_n').textContent=`${L.length.toLocaleString('vi-VN')} / ${(window.ARC||[]).length.toLocaleString('vi-VN')} người · đã chọn ${AS.size}`;$('ar_n').classList.toggle('on',AS.size>0)});
      const ca=$('ar_a2'); if(ca){ca.checked=L.length>0&&L.every(a=>AS.has(a.id));ca.onchange=()=>{L.forEach(a=>ca.checked?AS.add(a.id):AS.delete(a.id));arcRender()}}
      T2.querySelectorAll('[data-asort]').forEach(h=>h.onclick=()=>{const k=h.dataset.asort;const s=window.__arcSort130||{key:'date',dir:'desc'};window.__arcSort130=s.key===k?{key:k,dir:s.dir==='asc'?'desc':'asc'}:{key:k,dir:k==='date'?'desc':'asc'};arcRender()});
      T2.querySelectorAll('[data-ar]').forEach(b=>b.onclick=()=>arcRestoreEdit29(b.dataset.ar));
      T2.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>arcPurge((window.ARC||[]).filter(a=>a.id==b.dataset.ap)));
    };
  }

  if(typeof window.arcRestoreEdit29==='function'){
    window.arcRestoreEdit29=async function(id){
      if(!can('restore')) return alert('Bạn không có quyền khôi phục.');
      const a=(window.ARC||[]).find(x=>String(x.id)===String(id)); if(!a) return;
      const w=a.w, old={ktx:K(w),day:D(w),room:String(R(w)||'')};
      const dlg=document.createElement('dialog'); dlg.className='ui130-restore-dialog';
      const dayOptions=Array.from({length:6},(_,i)=>`<option ${old.day===`Dãy ${i+1}`?'selected':''}>Dãy ${i+1}</option>`).join('');
      const roomOptions=Array.from({length:15},(_,i)=>`<option ${String(i+1)===String(old.room)?'selected':''}>${i+1}</option>`).join('');
      dlg.innerHTML=`<form method="dialog" class="ui130-restore-wrap"><div class="ui130-restore-top"><span class="ui130-restore-chip">Khôi phục hồ sơ công nhân</span><h3>Sắp xếp chỗ ở khi quay lại</h3><p>Vị trí cũ: <b>${esc(old.ktx)}</b> · <b>${esc(old.day)}</b> · <b>Phòng ${esc(old.room||'—')}</b></p></div><div class="ui130-restore-grid"><label>KTX mới<select id="arc130k"><option ${old.ktx==='KTX 1'?'selected':''}>KTX 1</option><option ${old.ktx==='KTX 2'?'selected':''}>KTX 2</option></select></label><label>Dãy mới<select id="arc130d">${dayOptions}</select></label><label>Phòng mới<select id="arc130r">${roomOptions}</select></label></div><label>Ghi chú bố trí (không bắt buộc)<input id="arc130n" placeholder="Ví dụ: đổi sang phòng trống để sắp xếp lại"></label><div class="ui130-restore-row"><button class="btn s" value="cancel">Hủy</button><button class="btn g" value="confirm">Xác nhận khôi phục</button></div></form>`;
      document.body.appendChild(dlg); dlg.showModal();
      dlg.addEventListener('close',async()=>{
        const ok=dlg.returnValue==='confirm',k=dlg.querySelector('#arc130k').value.trim(),d=dlg.querySelector('#arc130d').value.trim(),r=dlg.querySelector('#arc130r').value.trim(),note=dlg.querySelector('#arc130n').value.trim();
        dlg.remove(); if(!ok) return;
        if(!k||!d||!r){alert('Cần nhập đủ KTX, Dãy, Phòng mới.');return}
        if((window.W||[]).some(z=>String(z.id)===String(id))){alert('Công nhân đã có trong danh sách tổng, không thể khôi phục trùng.');return}
        const msg='Xác nhận khôi phục '+w.name+' vào '+k+' · '+d+' · Phòng '+r+'?\nVị trí cũ vẫn được ghi trong lịch sử.';
        if(!await ask(msg,{title:'Xác nhận vị trí mới',ok:'Khôi phục',cls:'g'})) return;
        w.ktx=k; w.day=d; w.room=r;
        const history={at:new Date().toISOString(),action:'RETURN_NEW_ROOM',old,newLocation:{ktx:k,day:d,room:r},note};
        w.residenceMoves=Array.isArray(w.residenceMoves)?w.residenceMoves:[]; w.residenceMoves.push(history);
        LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'RESTORE',d:'Công nhân quay lại: '+w.name+'; chỗ ở cũ '+old.ktx+'/'+old.day+'/'+old.room+' → '+k+'/'+d+'/'+r+(note?(' · '+note):''),day:ldy()});
        W.unshift(w); ARC=ARC.filter(x=>String(x.id)!==String(id)); AS.delete(id); sv(); all(); alert('Đã khôi phục với vị trí mới. Hãy kiểm tra trạng thái lưu Supabase trước khi tải lại trang.');
      });
    };
  }

  function compactQrCards(){
    const host=$('qr'); if(!host) return;
    const qb=$('qb'); if(!qb) return;
    host.querySelectorAll('.qr166-switch button').forEach(btn=>{
      const small=btn.querySelector('small'); const span=btn.querySelector('span:not(.qr166-ico)');
      if(span && !span.querySelector('strong')){
        const t=span.childNodes[0] ? span.childNodes[0].textContent.trim() : span.textContent.trim();
        span.innerHTML='<strong>'+esc(t)+'</strong>'+(small?small.outerHTML:'');
      }
    });
    host.querySelectorAll('.qr166-tools .btn').forEach(btn=>{
      const tx=btn.textContent.trim();
      btn.classList.remove('qr130-in','qr130-out');
      if(/đăng ký vào/i.test(tx)) btn.classList.add('qr130-in');
      if(/đăng ký ra/i.test(tx)) btn.classList.add('qr130-out');
    });
    qb.querySelectorAll('.g2 > .card').forEach(card=>{
      const title=(card.querySelector('h3')?.textContent||'').trim().toLowerCase();
      card.classList.add('qr130-card');
      const note=card.querySelector('p.mut'); if(note){ note.classList.add('qr130-hide'); note.remove(); }
      let badgeType='in';
      if(title.includes('ra khỏi')) badgeType='out';
      else if(title.includes('điểm danh')) badgeType='att';
      if(!card.querySelector('.qr130-badge')){
        const badge=document.createElement('div'); badge.className='qr130-badge '+badgeType;
        badge.textContent=badgeType==='in'?'Quét mã để gửi yêu cầu vào KTX':badgeType==='out'?'Quét mã để gửi yêu cầu ra KTX':'Quét mã để gửi điểm danh';
        card.insertBefore(badge,card.firstChild);
      }
      const row=card.querySelector('.row'); if(row){ row.classList.add('qr130-actions'); row.querySelectorAll('.btn').forEach(btn=>{
        const tx=btn.textContent.trim().toLowerCase();
        btn.classList.remove('qr130-primary','qr130-secondary','qr130-success','qr130-danger','qr130-warn');
        if(tx.includes('áp phích')) btn.classList.add(badgeType==='out'?'qr130-warn':badgeType==='att'?'qr130-success':'qr130-primary');
        else btn.classList.add('qr130-secondary');
      });}
      const label=card.querySelector('label.fl');
      if(label && !card.querySelector('.qr130-linkbox')){
        const input=label.querySelector('input');
        const wrap=document.createElement('div'); wrap.className='qr130-linkbox';
        if(input) wrap.appendChild(input); label.replaceWith(wrap);
      }
    });

    const attBtn=$('qr160load');
    if(attBtn && !attBtn.dataset.autoLoaded){ attBtn.dataset.autoLoaded='1'; setTimeout(()=>attBtn.click(),60); }
    if(attBtn) attBtn.remove();

    const pending=$('qr160pending');
    if(pending){
      pending.classList.add('qr130-inline-list');
      const holder=document.createElement('div');
      holder.className='qr130-inline-list';
      const visibleCard=[...qb.querySelectorAll('.g2 > .card')].find(x=>x.style.display!== 'none' && (x.querySelector('h3')?.textContent||'').toLowerCase().includes('điểm danh'));
      if(visibleCard && !visibleCard.querySelector('#qr160pending')){
        holder.innerHTML='<div class="qr130-review-title"><h4>Yêu cầu điểm danh</h4><span class="tag">Tự tải danh sách</span></div>';
        visibleCard.appendChild(holder); holder.appendChild(pending);
      }
    }

    if(window.QT==='regin' || window.QT==='regout'){
      const head=qb.querySelector('.card .row');
      if(head) head.classList.add('qr130-slim-head');
      qb.querySelectorAll('.card .mut').forEach((el,i)=>{ if(i<2) el.style.display='none'; });
      qb.querySelectorAll('[data-qi]').forEach(b=>{b.classList.add('qr130-success');});
      qb.querySelectorAll('[data-qo]').forEach(b=>{b.classList.add('qr130-danger');});
      qb.querySelectorAll('[data-qx]').forEach(b=>{b.classList.add('qr130-secondary');});
    }
  }

  if(typeof window.qrPage==='function'){
    const oldQrPage=window.qrPage;
    window.qrPage=function(){ const r=oldQrPage.apply(this,arguments); toggleQrBody(); compactQrCards(); return r; };
  }
  if(typeof window.qrMake==='function'){
    const oldQrMake=window.qrMake;
    window.qrMake=function(){ const r=oldQrMake.apply(this,arguments); compactQrCards(); return r; };
  }

  if(typeof window.all==='function'){
    const oldAll=window.all;
    window.all=function(){ const r=oldAll.apply(this,arguments); toggleQrBody(); decorateResidenceTable(); return r; };
  }
})();
