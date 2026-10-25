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
  if(!index)return;
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
  if(admin())row.append(make('Xóa','r',btn=>removeRequest(id,btn)));
  cell.replaceChildren(row);
 });
}
if(typeof previousIn==='function')window.qrRenderIn=function(){const v=previousIn.apply(this,arguments);decorate('in');return v};
if(typeof previousOut==='function')window.qrRenderOut=function(){const v=previousOut.apply(this,arguments);decorate('out');return v};
})();
