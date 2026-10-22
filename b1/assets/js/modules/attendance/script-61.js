
(function(){
 const previous=qrMake;
 qrMake=function(){
   previous();
   const root=document.getElementById('qb');if(!root)return;
   const url=new URL('attendance-form.html',location.href).href;
   const grid=root.querySelector('.g2');if(!grid)return;
   const box=document.createElement('div');box.className='card';
   box.innerHTML='<h3>Điểm danh công nhân</h3><p class="mut" style="font-size:12.5px">Công nhân quét mã QR dùng chung, nhập mã nhân viên, họ tên và chọn Vào/Ra. Ban quản lý đối chiếu, duyệt trước khi ghi vào dữ liệu điểm danh.</p><canvas id="qr160" style="width:100%;max-width:330px;display:block;margin:10px auto;border:2px solid #159963;border-radius:12px"></canvas><div class="row" style="justify-content:center"><button class="btn g" id="qr160p">Tải áp phích</button><button class="btn s" id="qr160q">Tải mã QR</button></div><label class="fl">Link điểm danh<input id="qr160link" readonly></label><div class="row" style="margin-top:10px"><button class="btn s" id="qr160load">Xem yêu cầu điểm danh</button></div><div id="qr160pending"></div>';
   grid.appendChild(box);document.getElementById('qr160link').value=url;
   if(window.__qrAttReview){
     grid.style.display='none';
     const review=document.createElement('section');review.className='card';review.id='qr247review';
     review.innerHTML='<h3>Yêu cầu điểm danh chờ duyệt</h3><p class="mut">Danh sách yêu cầu cần kiểm tra và ghi nhận.</p>';
     root.appendChild(review);
     review.appendChild(document.getElementById('qr160pending'));
   }
   try{qrDraw(document.getElementById('qr160'),url,330,4)}catch(err){document.getElementById('qr160pending').textContent='Không tạo được QR: '+err.message}
   document.getElementById('qr160q').onclick=()=>qrSave(qrPoster('MÃ QR ĐIỂM DANH','Quét để gửi điểm danh KTX Hóc Môn',url),'QR_Diem_danh_KTX.png');
   document.getElementById('qr160p').onclick=()=>qrSave(qrPoster('ĐIỂM DANH CÔNG NHÂN','Quét mã và điền thông tin Vào / Ra',url),'Ap_phich_QR_Diem_danh_KTX.png');
   document.getElementById('qr160load').onclick=load160;
 };
 async function load160(){
  const el=document.getElementById('qr160pending');if(!el)return;
  if(!can('attendance')){el.textContent='Bạn không có quyền duyệt điểm danh.';return}
  const sb=qrSb();if(!sb){el.textContent='Không kết nối được Supabase.';return}
  el.textContent='Đang tải yêu cầu...';
  const {data,error}=await sb.from('ktx_attendance_qr_requests').select('*').eq('status','pending').order('created_at',{ascending:false}).limit(100);
  if(error){el.textContent='Lỗi: '+error.message+' — hãy kiểm tra SQL STEP160 / RLS.';return}
  const visible=(data||[]).filter(r=>ME.role==='admin'||ME.role==='quantri'||ME.role==='owner'||W.some(w=>can('view',w)&&K(w)===r.ktx)||typeof canAccessKtx==='function'&&canAccessKtx(r.ktx));
  el.innerHTML=visible.length?'<div class="wrap qr247-review-wrap"><table class="cmp3 qr247-review-table"><thead><tr><th>Họ tên</th><th>Mã NV</th><th>KTX / Dãy / Phòng</th><th>Vào/Ra</th><th>Thời gian</th><th>Thao tác</th></tr></thead><tbody></tbody></table></div>':'<p class="mut">Không có yêu cầu chờ duyệt trong phạm vi.</p>';
  const tbody=el.querySelector('tbody');
  visible.forEach(r=>{const tr=document.createElement('tr');
    [r.worker_name||'—',r.worker_code||'—',[r.ktx,r.day,r.room?'P.'+r.room:''].filter(Boolean).join(' · ')||'—',r.direction==='in'?'Vào':'Ra',r.created_at?new Date(r.created_at).toLocaleString('vi-VN'):'—'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});
    const actions=document.createElement('td');actions.className='qr247-actions';
    for(const [action,label] of [['edit','Sửa'],['approved','Duyệt'],['rejected','Từ chối']]){const btn=document.createElement('button');btn.className='btn '+(action==='approved'?'g':'s')+' sm';btn.type='button';btn.textContent=label;btn.onclick=()=>review160(r,action);actions.appendChild(btn)}tr.appendChild(actions);tbody.appendChild(tr)});
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
