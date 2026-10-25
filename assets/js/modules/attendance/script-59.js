
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
  node.innerHTML=`<div class="card at159-scan"><div class="row" style="justify-content:space-between;gap:8px"><div><h3 style="margin:0">Quét mã QR điểm danh</h3><small class="at-help">Quét mã QR công nhân hoặc nhập mã nhân viên; chọn Vào hoặc Ra để xác nhận.</small></div><button type="button" class="btn s sm" id="at159camera">Mở camera quét QR</button></div><div class="row" style="margin-top:10px"><input id="at159code" placeholder="Mã NV hoặc KTXATT:mã-hồ-sơ" style="flex:1;min-width:220px"><button type="button" class="btn g sm" id="at159in">Điểm danh vào</button><button type="button" class="btn s sm" id="at159out">Điểm danh ra</button></div><div id="at159msg" role="status" class="at-help" style="margin-top:8px"></div><div id="at159camWrap" style="display:none;margin-top:10px"><video id="at159video" muted playsinline style="max-width:100%;width:420px;border-radius:10px;background:#10233d"></video><button class="btn s sm" id="at159stop" type="button">Dừng camera</button></div></div><div class="at-stats"><div class="at-stat"><small>QUÂN SỐ TRONG PHẠM VI</small><b>${all.length.toLocaleString('vi-VN')}</b></div><div class="at-stat"><small>ĐÃ GHI NHẬN VÀO</small><b style="color:#109764">${inCount}</b></div><div class="at-stat"><small>ĐÃ GHI NHẬN RA</small><b style="color:#cf7d14">${outCount}</b></div><div class="at-stat"><small>CHƯA GHI NHẬN</small><b>${all.length-inCount-outCount}</b></div></div><div class="card"><div class="at-filters"><div><label>Ngày</label><input id="at151date" type="date" value="${safe(state.date)}"></div><div><label>Tìm kiếm công nhân</label><input id="at151search" placeholder="Họ tên, mã NV, CCCD, phòng..." value="${safe(state.search)}"></div><div><label>KTX</label><select id="at151ktx"><option value="">Tất cả KTX được cấp</option>${availableKtx.map(k=>`<option value="${safe(k)}" ${state.ktx===k?'selected':''}>${safe(k)}</option>`).join('')}</select></div><div><label>Trạng thái</label><select id="at151status"><option value="all">Tất cả</option><option value="in" ${state.status==='in'?'selected':''}>Đã vào</option><option value="out" ${state.status==='out'?'selected':''}>Đã ra</option><option value="none" ${state.status==='none'?'selected':''}>Chưa ghi nhận</option></select></div></div><div class="row" style="margin:10px 0;justify-content:space-between;align-items:center"><div class="at-help">Ghi nhận ngày ${safe(state.date)} · Chỉ hiển thị công nhân thuộc phạm vi được phân quyền. ${permitted?'Bấm Vào hoặc Ra để ghi nhận.':'Tài khoản của bạn chỉ được xem, không có quyền điểm danh.'}</div><button class="btn s sm" id="at151export">Xuất Excel</button></div><div class="wrap"><table class="cmp3 at-table"><tr><th>STT</th><th>Họ tên</th><th>Mã NV</th><th>KTX</th><th>Dãy / Phòng</th><th>Trạng thái ngày</th><th>Thời gian gần nhất</th><th>Điểm danh</th></tr>${filtered.slice(0,200).map((w,i)=>{const ev=currentFor(w.id,events);const ts=ev?new Date(ev.at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'—';return `<tr><td>${i+1}</td><td><b>${safe(w.name)}</b></td><td>${safe(w.mnv||'—')}</td><td>${safe(K(w))}</td><td>${safe(D(w))} / ${safe(R(w))}</td><td>${ev?ev.type==='in'?'<span class="tag g">Đã vào</span>':'<span class="tag a">Đã ra</span>':'<span class="mut">Chưa ghi nhận</span>'}</td><td>${ts}</td><td><div class="at-actions">${permitted?`<button class="btn g sm" data-att151="in" data-worker="${safe(w.id)}">Vào</button><button class="btn a sm" data-att151="out" data-worker="${safe(w.id)}">Ra</button>`:'—'}</div></td></tr>`}).join('')||'<tr><td colspan="8" class="mut">Không có công nhân phù hợp.</td></tr>'}</table></div><div class="at-help" style="margin-top:8px">${filtered.length>200?'Hiển thị 200 dòng đầu. Hãy tìm kiếm để thu hẹp. ':''}Lịch sử được ghi vào dữ liệu điểm danh hiện có và hàng đợi Supabase khi đồng bộ được bật.</div></div>`;
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
