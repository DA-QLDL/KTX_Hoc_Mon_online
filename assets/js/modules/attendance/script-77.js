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
  const sb=typeof qrSb==='function'?qrSb():null;
  if(!sb)return fail('Chưa có kết nối Supabase. Thay đổi chưa được lưu.');
  const save=dlg.querySelector('.qr52-save');save.disabled=true;save.textContent='Đang lưu…';error.hidden=true;
  try{
   const {data,error:cloudError}=await sb.from('residency_requests').update(patch).eq('id',request.id).eq('status','pending').select('id');
   if(cloudError)throw cloudError;
   if(!data||data.length!==1)throw Error('Không xác nhận được bản ghi đã cập nhật. Kiểm tra quyền UPDATE/RLS hoặc trạng thái hồ sơ.');
   Object.assign(request,patch);close();
   if(typeof qrPage==='function')qrPage();
  }catch(ex){fail('Không thể lưu thay đổi: '+String(ex.message||ex));}
  finally{if(save.isConnected){save.disabled=false;save.textContent='Lưu thay đổi'}}
 });
 dlg.showModal();
}
window.qr74EditIn=showModal;
window.qr74EditOut=showModal;
window.qr224EditOut=showModal;
})();
