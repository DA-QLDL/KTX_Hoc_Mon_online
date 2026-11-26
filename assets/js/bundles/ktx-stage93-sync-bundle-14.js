/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/modules/attendance/script-76.js >>> */
(function(){
'use strict';
// Decorate the actual rendered approval rows, not positional QRREQ indexes.
const previousIn=window.qrRenderIn,previousOut=window.qrRenderOut;
const $=sel=>document.querySelector(sel);
const admin=()=>typeof ME!=='undefined' && ['admin','owner','quantri'].includes(String(ME.role||'').toLowerCase());
const authz=()=>typeof can==='function' && can('qrApprove');
let busy=new Set();
async function removeRequest(id,button){
 if(!admin()||!authz())return alert('Chỉ Quản trị có quyền xóa hồ sơ đăng ký chờ duyệt.');
 const request=(Array.isArray(QRREQ)?QRREQ:[]).find(r=>String(r.id)===String(id));
 if(!request||request.status!=='pending')return alert('Không tìm thấy hồ sơ chờ duyệt. Hãy tải lại danh sách.');
 if(busy.has(String(id)))return;
 const message='Xóa vĩnh viễn yêu cầu đăng ký '+(request.request_type==='out'?'ra':'vào')+' của '+String(request.name||'')+'?\nThao tác này KHÔNG xóa công nhân trong danh sách tổng và không thể hoàn tác.';
 const accepted=typeof ask==='function'?await ask(message,{title:'Xác nhận xóa yêu cầu QR',ok:'Xóa yêu cầu',cls:'r'}):confirm(message);
 if(!accepted)return;
 const sb=typeof qrSb==='function'?qrSb():null;
 if(!sb)return alert('Chưa kết nối Supabase. Không xóa dữ liệu trên máy.');
 busy.add(String(id));button.disabled=true;
 try{
  const {data,error}=await sb.from('residency_requests').delete().eq('id',id).eq('status','pending').select('id');
  if(error)throw error;
  if(!data||data.length!==1)throw Error('Không có hồ sơ nào được xóa trên Cloud (có thể thiếu quyền DELETE/RLS hoặc đã được người khác xử lý).');
  const ix=QRREQ.findIndex(r=>String(r.id)===String(id));if(ix>=0)QRREQ.splice(ix,1);
  if(typeof qrPage==='function')qrPage();
 }catch(e){alert('Xóa không thành công: '+(e.message||e));button.disabled=false}
 finally{busy.delete(String(id))}
}
function make(label,cls,fn){const b=document.createElement('button');b.type='button';b.className='btn sm '+cls;b.textContent=label;b.addEventListener('click',ev=>{ev.stopPropagation();fn(b)});return b}
function decorate(mode){
 const root=document.querySelector(mode==='in'?'#qr .qr-review-in':'#qr .qr-review-out');if(!root)return;
 root.querySelectorAll('table tr').forEach((tr,index)=>{
  if(!index || tr.dataset.qr50Decorated==='1')return;
  const idNode=tr.querySelector(mode==='in'?'[data-qi]':'[data-qo]')||tr.querySelector('[data-qx]');
  const id=idNode?.dataset.qi||idNode?.dataset.qo||idNode?.dataset.qx;
  if(!id)return;
  const cell=tr.lastElementChild;if(!cell)return;
  cell.classList.add('qr50-action-cell');
  const row=document.createElement('div');row.className='qr50-action-row';
  const edit=mode==='in'?window.qr74EditIn:window.qr74EditOut;
  if(typeof edit==='function')row.append(make('Sửa','s',()=>edit(id)));
  row.append(make(mode==='in'?'Duyệt':'Duyệt ra',mode==='in'?'g':'r',()=>{if(mode==='in')window.qrApproveIn?.(id);else window.qrApproveOut?.(id)}));
  row.append(make('Từ chối','s',()=>window.qrReject?.(id)));
  // Không hiển thị Xóa: dùng Từ chối để xử lý hồ sơ chờ duyệt.
  cell.replaceChildren(row);tr.dataset.qr50Decorated='1';
 });
}
window.qr50Decorate=decorate;
if(typeof previousIn==='function')window.qrRenderIn=function(){const v=previousIn.apply(this,arguments);decorate('in');return v};
if(typeof previousOut==='function')window.qrRenderOut=function(){const v=previousOut.apply(this,arguments);decorate('out');return v};
})();

;
/* >>> Original: assets/js/modules/attendance/script-77.js >>> */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
const labelMap={name:'Họ và tên',worker_code:'Mã nhân viên',cccd:'Số CCCD',phone:'Số điện thoại',ktx:'KTX',day:'Dãy',room:'Phòng',check_in_date:'Ngày đăng ký vào',leader_phone:'SĐT tổ trưởng',reason:'Lý do',address:'Địa chỉ thường trú'};
const fieldsIn=['name','worker_code','cccd','phone','ktx','day','room','check_in_date','leader_phone'];
const fieldsOut=['name','worker_code','cccd','phone','ktx','day','room','reason'];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\"':'&quot;'}[c]));
function showModal(id){
 if(typeof can!=='function'||!can('qrApprove'))return alert('Bạn không có quyền sửa hồ sơ QR.');
 const request=(Array.isArray(QRREQ)?QRREQ:[]).find(r=>String(r.id)===String(id));
 if(!request||request.status!=='pending')return alert('Không tìm thấy hồ sơ đang chờ duyệt.');
 const keys=request.request_type==='out'?fieldsOut:fieldsIn;
 document.getElementById('qr52edit')?.remove();
 const dlg=document.createElement('dialog');dlg.id='qr52edit';dlg.className='qr52-dialog';
 const controls=keys.map(key=>{
  const fieldType=(key==='check_in_date'&&/^\d{4}-\d\d-\d\d$/.test(request[key]||''))?'date':'text';
  const val=escapeHtml(request[key]??'');
  return `<label class="qr52-field"><span>${escapeHtml(labelMap[key]||key)}</span><input name="${key}" type="${fieldType}" value="${val}" ${key==='name'?'required':''} autocomplete="off"></label>`;
 }).join('');
 dlg.innerHTML=`<form class="qr52-form" novalidate><div class="qr52-top"><div><h3>Sửa đăng ký ${request.request_type==='out'?'ra':'vào'}</h3><p>Chỉnh thông tin hồ sơ trước khi duyệt</p></div><button type="button" class="qr52-x" aria-label="Đóng">×</button></div><div class="qr52-grid">${controls}</div><div class="qr52-error" role="alert" hidden></div><div class="qr52-foot"><button type="button" class="btn s qr52-cancel">Hủy</button><button class="btn g qr52-save" type="submit">Lưu thay đổi</button></div></form>`;
 document.body.appendChild(dlg);
 const close=()=>dlg.close();
 dlg.querySelector('.qr52-x').onclick=close;dlg.querySelector('.qr52-cancel').onclick=close;
 dlg.addEventListener('close',()=>dlg.remove(),{once:true});
 dlg.addEventListener('click',event=>{if(event.target===dlg)close()});
 dlg.querySelector('form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,patch={};
  for(const key of keys)patch[key]=String(new FormData(form).get(key)||'').trim();
  const error=dlg.querySelector('.qr52-error');
  const fail=message=>{error.hidden=false;error.textContent=message};
  if(!patch.name)return fail('Vui lòng nhập họ và tên.');
  if(!patch.ktx||!patch.day||!patch.room)return fail('Vui lòng nhập đầy đủ KTX, Dãy, Phòng.');
  if(!window.ktxQrScopeAllows?.(request)||!window.ktxQrScopeAllows?.({...request,...patch}))return fail('Không được sửa yêu cầu ra ngoài KTX/Dãy được quản lý.');
  const sb=typeof qrSb==='function'?qrSb():null;
  if(!sb)return fail('Chưa có kết nối Supabase. Thay đổi chưa được lưu.');
  const save=dlg.querySelector('.qr52-save');save.disabled=true;save.textContent='Đang lưu…';error.hidden=true;
  try{
   const {data,error:cloudError}=await sb.from('residency_requests').update(patch).eq('id',request.id).eq('status','pending').select('id');
   if(cloudError)throw cloudError;
   if(!data||data.length!==1)throw Error('Không xác nhận được bản ghi đã cập nhật. Kiểm tra quyền UPDATE/RLS hoặc trạng thái hồ sơ.');
   Object.assign(request,patch);close();
   if(typeof qrPage==='function')qrPage();
  }catch(ex){
   const code=String(ex?.code||'');
   const raw=String(ex?.message||ex||'');
   if(code==='42501'||/permission denied|row.level.security|violates row.level security/i.test(raw)){
    fail('Không đủ quyền cập nhật hồ sơ trên Supabase. Thay đổi chưa được lưu. Quản trị viên cần kiểm tra quyền UPDATE và chính sách RLS của bảng residency_requests (tệp SQL đi kèm bản V2.0.7). Không sử dụng khóa service_role trên trình duyệt.');
   }else{
    fail('Không thể lưu thay đổi: '+raw);
   }
  }
  finally{if(save.isConnected){save.disabled=false;save.textContent='Lưu thay đổi'}}
 });
 dlg.showModal();
}
window.qr74EditIn=showModal;
window.qr74EditOut=showModal;
window.qr224EditOut=showModal;
})();

;
/* >>> Original: assets/js/core/archive-v129-rollback-153.js >>> */
/* v1.0.53: RESTORE EXACT ARCHIVE VIEW AND ACTIONS FROM v1.0.29. Other modules stay on v1.0.52. */
function arcFlt(){const q=sa($('ar_q').value),r=$('ar_r').value,a=$('ar_a').value,b=$('ar_b').value;return ARC.filter(x=>(!r||x.reason==r)&&(!a||x.date>=a)&&(!b||x.date<=b)&&(!q||sa([x.w.name,x.w.mnv,x.w.cccd,x.w.sdt,x.note,x.reason].join(' ')).includes(q)))}
function arcPage(){if(!ARCB){ARCB=true;$('arc').innerHTML=`<div class="g4" id="ar_k"></div><div class="card"><div class="row"><input id="ar_q" placeholder="Tìm tên, mã NV, CCCD, ghi chú..." style="flex:1;min-width:220px"><button type="button" class="btn s sm" id="arcClearQuery112" title="Xóa tìm kiếm" aria-label="Xóa nội dung tìm kiếm">×</button><select id="ar_r" aria-label="Lọc theo lý do"><option value="">Tất cả lý do</option>${LEAVE.map(r=>`<option>${r}</option>`).join('')}</select><label class="mut">Từ <input type="date" id="ar_a"></label><label class="mut">Đến <input type="date" id="ar_b"></label></div>
 <div class="row" style="margin-top:10px"><button class="btn g" id="ar_re">${ico('check')}Khôi phục đã chọn</button><button class="btn r" id="ar_pd">${ico('trash')}Xóa hẳn đã chọn</button><button class="btn s" id="ar_x">${ico('dl')}Xuất Excel</button><b class="cnt" id="ar_n" style="margin-left:auto"></b></div><div id="ar_t"></div></div>`;
 ['ar_q','ar_r','ar_a','ar_b'].forEach(i=>$(i).oninput=arcRender);
 $('arcClearQuery112').onclick=()=>{$('ar_q').value='';arcRender();$('ar_q').focus()};
 $('ar_re').onclick=()=>{const L=ARC.filter(a=>AS.has(a.id));if(!L.length){alert('Hãy tick chọn công nhân cần khôi phục.');return}arcRestore(L)};
 $('ar_pd').onclick=()=>{const L=ARC.filter(a=>AS.has(a.id));if(!L.length){alert('Hãy tick chọn công nhân cần xóa hẳn.');return}arcPurge(L)};
 $('ar_x').onclick=()=>xlsArc(AS.size?ARC.filter(a=>AS.has(a.id)):arcFlt())}
 arcRender()}
function arcRetentionDays(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return '<span class="mut">Chưa rõ ngày</span>';
 const t=Date.parse(date+'T00:00:00');if(!Number.isFinite(t))return '<span class="mut">Chưa rõ ngày</span>';
 const now=new Date();now.setHours(0,0,0,0);
 const days=Math.floor((now.getTime()-t)/86400000),left=60-days;
 return left>0?`<strong style="color:${left<=7?'#b45309':'#166534'}">${left} ngày</strong>`:'<strong style="color:#b91c1c">Đã hết hạn</strong>';
}
function arcRender(){if(!$('ar_t'))return;const L=arcFlt(),cn=r=>ARC.filter(a=>a.reason==r).length;
 $('ar_k').innerHTML=`<div class="card"><div class="lbl">TỔNG ĐÃ CHUYỂN RA</div><div class="kpi">${ARC.length.toLocaleString('vi-VN')}</div></div><div class="card"><div class="lbl">ĐIỀU CHUYỂN</div><div class="kpi">${cn('Điều chuyển')}</div></div><div class="card"><div class="lbl">NGHỈ VIỆC</div><div class="kpi">${cn('Nghỉ việc')}</div></div><div class="card"><div class="lbl">CHUYỂN RA NGOÀI Ở</div><div class="kpi">${cn('Chuyển ra ngoài ở')}</div></div>`;
 $('ar_n').textContent=`${L.length.toLocaleString('vi-VN')} / ${ARC.length.toLocaleString('vi-VN')} người · đã chọn ${AS.size}`;$('ar_n').classList.toggle('on',AS.size>0);
 const sh=L.slice(0,300);
 $('ar_t').innerHTML=ARC.length?`<div class="wrap"><table class="cmp3"><tr><th><input type="checkbox" id="ar_a2" aria-label="Chọn tất cả"></th><th>STT</th><th>Họ và tên</th><th>Mã NV</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>CCCD</th><th>Lý do</th><th>Ngày</th><th>Còn lưu</th><th>Thao tác</th></tr>${sh.map((a,i)=>`<tr><td><input type="checkbox" class="ak" data-i="${esc(a.id)}" ${AS.has(a.id)?'checked':''}></td><td>${i+1}</td><td class="wr"><b>${esc(a.w.name)}</b></td><td>${esc(a.w.mnv||'—')}</td><td><span class="pl ${kc(K(a.w))}">${esc(K(a.w))}</span></td><td>${esc(D(a.w))}</td><td>${esc(R(a.w)||'—')}</td><td>${esc(a.w.cccd||'')}</td><td><span class="pl ${RC[a.reason]||'dy2'}">${esc(a.reason)}</span></td><td>${vn(a.date)}</td><td>${arcRetentionDays(a.date)}</td><td class="arc-actions-cell"><div class="arc-actions-compact">${can('restore')?`<button type="button" class="btn s sm" data-ar="${esc(a.id)}" title="Sửa vị trí và khôi phục hồ sơ" aria-label="Sửa và khôi phục ${esc(a.w.name)}">Khôi phục</button>`:''}${can('purge')?`<button type="button" class="btn r sm" data-ap="${esc(a.id)}" title="Xóa vĩnh viễn hồ sơ" aria-label="Xóa vĩnh viễn ${esc(a.w.name)}">Xóa</button>`:''}${!can('restore')&&!can('purge')?'<span class="mut">Chỉ xem</span>':''}</div></td></tr>`).join('')}</table></div>${L.length>300?`<div class="mut" style="margin-top:8px">Hiển thị 300 dòng đầu, hãy lọc để thu hẹp.</div>`:''}`:'<p class="mut" style="margin:14px 0 0">Chưa có ai trong danh sách này. Khi bạn xóa công nhân ở các mục khác, họ sẽ được chuyển vào đây thay vì bị xóa hẳn.</p>';
 const T2=$('ar_t');T2.querySelectorAll('.ak').forEach(c=>c.onchange=()=>{c.checked?AS.add(c.dataset.i):AS.delete(c.dataset.i);$('ar_n').textContent=`${L.length.toLocaleString('vi-VN')} / ${ARC.length.toLocaleString('vi-VN')} người · đã chọn ${AS.size}`;$('ar_n').classList.toggle('on',AS.size>0)});
 const ca=$('ar_a2');if(ca){ca.checked=L.length>0&&L.every(a=>AS.has(a.id));ca.onchange=()=>{L.forEach(a=>ca.checked?AS.add(a.id):AS.delete(a.id));arcRender()}}
 T2.querySelectorAll('[data-ar]').forEach(b=>b.onclick=()=>arcRestoreEdit29(b.dataset.ar));T2.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>arcPurge(ARC.filter(a=>a.id==b.dataset.ap)))}
async function arcRestoreEdit29(id){
 if(!can('restore'))return alert('Bạn không có quyền khôi phục.');
 const a=ARC.find(x=>String(x.id)===String(id));if(!a)return;
 const w=a.w,old={ktx:K(w),day:D(w),room:String(R(w)||'')};
 const dlg=document.createElement('dialog');dlg.className='ktx94-restore-dialog';dlg.style.cssText='max-width:470px;width:calc(100% - 28px);border-radius:18px';
 dlg.innerHTML='<form method="dialog" style="padding:18px;display:grid;gap:12px"><h3 style="margin:0">Sắp xếp chỗ ở khi quay lại</h3><p class="mut" style="margin:0">Vị trí cũ: '+esc(old.ktx)+' · '+esc(old.day)+' · Phòng '+esc(old.room||'—')+'</p><label><span>KTX mới</span><input id="arc29k" required value="'+esc(old.ktx)+'"></label><label><span>Dãy mới</span><input id="arc29d" required value="'+esc(old.day)+'"></label><label><span>Phòng mới</span><input id="arc29r" required value="'+esc(old.room)+'"></label><div class="row" style="justify-content:flex-end"><button class="btn s" value="cancel">Hủy</button><button class="btn g" value="confirm">Xác nhận khôi phục</button></div></form>';
 document.body.appendChild(dlg);
 // Location dropdown API is optional and sometimes loads later than the archive view.
 // Fallback to editable text inputs instead of preventing the restore dialog from opening.
 try{const api=window.KTX_LOCATION_DROPDOWN_V2076;
  if(api&&typeof api.ktxList==='function'&&typeof api.dayList==='function'&&typeof api.roomList==='function'&&typeof api.options==='function'&&typeof api.wire==='function'){
   [['arc29k','ktx',api.ktxList(old.ktx),old.ktx],['arc29d','day',api.dayList(old.ktx,old.day),old.day],['arc29r','room',api.roomList(old.ktx,old.day,old.room),old.room]].forEach(([id,tp,ls,v])=>{const field=dlg.querySelector('#'+id);if(field&&field.tagName==='INPUT'){const sel=document.createElement('select');sel.id=id;sel.required=true;sel.innerHTML=api.options(tp,ls,v);field.replaceWith(sel)}});
   api.wire('arc29k','arc29d','arc29r');
  }
 }catch(e){console.warn('[KTX] Restore location dropdown unavailable; using text entry.',e)}
 try{dlg.showModal()}catch(e){console.error('[KTX] Không mở được hộp thoại khôi phục:',e);dlg.remove();alert('Không mở được hộp thoại khôi phục: '+(e.message||e));return;}
 dlg.addEventListener('close',async()=>{const ok=dlg.returnValue==='confirm',k=dlg.querySelector('#arc29k')?.value.trim()||'',d=dlg.querySelector('#arc29d')?.value.trim()||'',r=dlg.querySelector('#arc29r')?.value.trim()||'';dlg.remove();if(!ok)return;if(!k||!d||!r){alert('Cần nhập đủ KTX, Dãy, Phòng mới.');return}if(W.some(z=>String(z.id)===String(id))){alert('Công nhân đã có trong danh sách tổng, không thể khôi phục trùng.');return}
 const msg='Xác nhận khôi phục '+w.name+' vào '+k+' · '+d+' · Phòng '+r+'?\nVị trí cũ vẫn được ghi trong lịch sử.';
 if(!await ask(msg,{title:'Xác nhận vị trí mới',ok:'Khôi phục',cls:'g'}))return;
 w.ktx=k;w.day=d;w.room=r;
 const history={at:new Date().toISOString(),action:'RETURN_NEW_ROOM',old,newLocation:{ktx:k,day:d,room:r}};
 w.residenceMoves=Array.isArray(w.residenceMoves)?w.residenceMoves:[];w.residenceMoves.push(history);
 LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'RESTORE',d:'Công nhân quay lại: '+w.name+'; chỗ ở cũ '+old.ktx+'/'+old.day+'/'+old.room+' → '+k+'/'+d+'/'+r,day:ldy()});
 W.unshift(w);ARC=ARC.filter(x=>String(x.id)!==String(id));AS.delete(id);sv();all();alert('Đã khôi phục với vị trí mới. Hãy kiểm tra trạng thái lưu Supabase trước khi tải lại trang.');
 });
}
async function arcRestore(L){if(!can('restore')){alert('Bạn không có quyền khôi phục.');return}if(!await ask(`Khôi phục ${L.length.toLocaleString('vi-VN')} công nhân về danh sách chính?\n${L.slice(0,5).map(a=>'• '+a.w.name).join('\n')}${L.length>5?`\n… và ${L.length-5} người khác`:''}`,{title:'Xác nhận khôi phục',ok:'Khôi phục',cls:'g'}))return;
 const by={};L.forEach(a=>{if(!W.some(w=>w.id==a.id))W.unshift(a.w);const k=K(a.w)+'|'+a.date;(by[k]=by[k]||{k:K(a.w),day:a.date,n:0}).n++});
 Object.values(by).forEach(g=>LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'RESTORE',d:`Khôi phục ${g.n} công nhân về danh sách chính (${g.k})`,k:g.k,n:g.n,day:g.day}));
 const ids=new Set(L.map(a=>a.id));ARC=ARC.filter(a=>!ids.has(a.id));ids.forEach(i=>AS.delete(i));sv();all();alert(`Đã khôi phục ${L.length.toLocaleString('vi-VN')} công nhân về danh sách chính.`)}
async function arcPurge(L){if(!can('purge')){alert('Chỉ tài khoản được cấp quyền Xóa hẳn mới thực hiện được.');return}if(!await ask(`Xóa hẳn ${L.length.toLocaleString('vi-VN')} công nhân khỏi danh sách theo dõi?\n${L.slice(0,5).map(a=>'• '+a.w.name).join('\n')}${L.length>5?`\n… và ${L.length-5} người khác`:''}\n\nSau khi xóa hẳn sẽ không thể khôi phục.`,{title:'Xác nhận xóa hẳn',ok:'Xóa hẳn'}))return;
 const ids=new Set(L.map(a=>a.id));ARC=ARC.filter(a=>!ids.has(a.id));ids.forEach(i=>AS.delete(i));LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'PURGE',d:`Xóa hẳn ${L.length} công nhân khỏi danh sách điều chuyển/nghỉ việc`,day:ldy()});sv();all();alert(`Đã xóa hẳn ${L.length.toLocaleString('vi-VN')} công nhân khỏi danh sách theo dõi.`)}
async function xlsArc(L){try{if(!L.length){alert('Không có dữ liệu để xuất.');return}const dl=await(window.claude&&claude.use?claude.use('downloads'):null);if(!dl){alert('Môi trường này chưa cho phép tải file.');return}if(!window.ExcelJS){alert('Không tải được thư viện tạo Excel (cần kết nối mạng).');return}
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Điều chuyển - Nghỉ việc');ws.addRow(['STT','Họ và Tên','Mã NV','Tiểu Đoàn','Đơn vị','KTX','Dãy','Phòng','Giới tính','SĐT','CCCD','Ngày sinh','Tỉnh/TP','Lý do','Ngày','Ghi chú']);
 L.forEach((a,i)=>{const w=a.w;ws.addRow([i+1,w.name,w.mnv||'Chờ mã',w.td||'',w.unit||'',K(w),D(w),R(w)||'',gtN(w.gt),w.sdt||'',w.cccd||'',vn(w.dob),w.tinh||'',a.reason,vn(a.date),a.note||''])});
 [5,22.8,9,12,14.9,6,6,7,8,12,14,12,40,18,12,30].forEach((x,i)=>ws.getColumn(i+1).width=x);ws.eachRow((r,ri)=>r.eachCell(c=>{c.font={name:'Arial',size:12,bold:ri==1};if(ri==1)c.alignment={horizontal:'center',vertical:'middle'}}));
 await dl.save({filename:`Dieu_chuyen_Nghi_viec_${ldy().split('-').reverse().join('-')}.xlsx`,data:await wb.xlsx.writeBuffer()})}catch(e){if(!e||e.code!='declined')alert('Không lưu được: '+(e&&e.message||e))}}
