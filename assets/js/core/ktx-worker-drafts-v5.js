/* KTX worker drafts V5 (STAGING): encrypted recovery only, NEVER automatic Cloud replay.
 * A local draft is not a Cloud worker and must never affect W, LOG or headcount.
 */
(function(){
'use strict';
const DB='ktx_worker_drafts_v5',VERSION=1,STORE='drafts',KEYS='keys',LABEL='master';
let dbOpening=null,workerPanel=null;
function account(){try{return String(SUPA_SYNC?.session?.user?.id||'')}catch(_){return ''}}
function safeAccount(){const a=account();if(!a)throw Error('Cần đăng nhập Supabase trước khi lưu hoặc khôi phục bản nháp.');return a}
function dbOpen(){
 if(!window.indexedDB||!window.crypto?.subtle||!window.crypto?.getRandomValues)return Promise.reject(Error('Thiết bị không hỗ trợ bộ nhớ đệm mã hóa.'));
 if(!dbOpening)dbOpening=new Promise((resolve,reject)=>{
  const q=indexedDB.open(DB,VERSION);
  q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});if(!db.objectStoreNames.contains(KEYS))db.createObjectStore(KEYS)};
  q.onsuccess=()=>{const d=q.result;d.onversionchange=()=>{d.close();dbOpening=null};resolve(d)};
  q.onerror=()=>reject(q.error||Error('Không mở được IndexedDB.'));
  q.onblocked=()=>reject(Error('Bộ nhớ đang được sử dụng bởi tab khác.'));
 }).catch(e=>{dbOpening=null;throw e});return dbOpening;
}
async function transact(store,mode,act){const d=await dbOpen();return new Promise((resolve,reject)=>{const t=d.transaction(store,mode),s=t.objectStore(store);let r;t.oncomplete=()=>resolve(r);t.onabort=()=>reject(t.error||Error('Giao dịch bị hủy.'));t.onerror=()=>reject(t.error||Error('IndexedDB thất bại.'));try{act(s,v=>{r=v})}catch(e){t.abort();reject(e)}})}
async function masterKey(){
 const exists=await transact(KEYS,'readonly',(s,set)=>{const r=s.get(LABEL);r.onsuccess=()=>set(r.result)});
 if(exists)return exists;
 const fresh=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 // Persist non-extractable CryptoKey; encrypted content remains subject to same-origin access.
 return transact(KEYS,'readwrite',(s,set)=>{const r=s.get(LABEL);r.onsuccess=()=>{if(r.result)set(r.result);else{s.put(fresh,LABEL);set(fresh)}}});
}
async function seal(value){const k=await masterKey(),iv=crypto.getRandomValues(new Uint8Array(12));const plain=new TextEncoder().encode(JSON.stringify(value));const enc=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,plain);return {iv:Array.from(iv),body:Array.from(new Uint8Array(enc))}}
async function unseal(row){const key=await masterKey(),data=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(row.iv)},key,new Uint8Array(row.body));return JSON.parse(new TextDecoder().decode(data))}
const fields=['name','mnv','gt','dob','sdt','cccd','thon','xa','tinh','ktx','day','room','unit','td','date','out','leader','lsdt'];
function projection(w){const o={};fields.forEach(k=>o[k]=String(w?.[k]??''));return o}
function same(a,b){return fields.every(k=>String(a?.[k]??'')===String(b?.[k]??''))}
async function capture(mode,original,next){
 const actor=safeAccount();if(!['add','edit'].includes(mode))throw Error('Loại bản nháp không hợp lệ.');
 const id=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Array.from(crypto.getRandomValues(new Uint8Array(12))).join('')}`;
 const payload={mode,workerId:String(next.id||original?.id||''),before:original?projection(original):null,after:projection(next)};
 if(!payload.workerId)throw Error('Thiếu mã hồ sơ công nhân.');
 const encrypted=await seal(payload);
 await transact(STORE,'readwrite',s=>s.put({id,actor,mode,createdAt:Date.now(),...encrypted}));
 updateIndicator();return id;
}
async function discard(id){const actor=safeAccount();const rows=await all();const row=rows.find(x=>x.id===id&&x.actor===actor);if(!row)return;await transact(STORE,'readwrite',s=>s.delete(id));updateIndicator()}
async function all(){return transact(STORE,'readonly',(s,set)=>{const q=s.getAll();q.onsuccess=()=>set(q.result||[])})}
async function own(){const a=account();return a?(await all()).filter(x=>x.actor===a).sort((x,y)=>y.createdAt-x.createdAt):[]}
function readClient(){if(!navigator.onLine||typeof syncClient!=='function')throw Error('Cần có mạng và kết nối Supabase để đối soát bản nháp.');const s=syncClient();if(!s)throw Error('Chưa có kết nối Cloud.');return s}
async function cloudWorker(id){const sb=readClient();const {data,error}=await sb.from('ktx_workers').select('record_id,payload').eq('record_id',id).maybeSingle();if(error)throw error;return data?.payload||null}
async function restore(id){
 const a=safeAccount(),row=(await all()).find(x=>x.id===id&&x.actor===a);if(!row)throw Error('Không tìm thấy bản nháp của tài khoản hiện tại.');
 const item=await unseal(row);if(account()!==a)throw Error('Phiên đăng nhập đã thay đổi.');
 const live=await cloudWorker(item.workerId);
 if(item.mode==='add'){
  if(live)throw Error('Mã hồ sơ này đã tồn tại trên Cloud. Hãy đối soát, không thêm lại.');
  const sb=readClient();for(const field of ['mnv','cccd']){const value=String(item.after[field]||'').trim();if(!value)continue;const {data,error}=await sb.from('ktx_workers').select('record_id').filter('payload->>'+field,'eq',value).limit(1);if(error)throw error;if(data?.length)throw Error(field.toUpperCase()+' đã có trên Cloud, không thể tự khôi phục bản nháp.');}
  if(typeof can!=='function'||!can('add'))throw Error('Tài khoản không có quyền thêm công nhân.');
  if(typeof edit!=='function')throw Error('Biểu mẫu công nhân chưa sẵn sàng.');
  edit(null);
 }else{
  if(!live)throw Error('Hồ sơ không còn trên Cloud (có thể đã nghỉ việc hoặc bị xóa). Cần đối soát thủ công.');
  if(same(live,item.after))throw Error('Cloud đã có nội dung bản nháp. Hãy xác minh và xóa bản nháp để tránh cập nhật lặp.');
  if(!same(live,item.before))throw Error('Hồ sơ trên Cloud đã thay đổi sau khi tạo bản nháp. Không được tự ghi đè; cần đối soát.');
  const local=(typeof W!=='undefined'&&Array.isArray(W))?W.find(w=>String(w.id)===item.workerId):null;
  if(!local||!same(local,item.before))throw Error('Danh sách trên máy chưa trùng với Cloud. Tải lại dữ liệu trước khi khôi phục.');
  if(typeof can!=='function'||!can('editw',local))throw Error('Tài khoản không có quyền chỉnh sửa hồ sơ này.');
  if(typeof edit!=='function')throw Error('Biểu mẫu công nhân chưa sẵn sàng.');
  edit(local);
 }
 for(const f of fields){const el=document.getElementById('f_'+f);if(el){el.value=item.after[f]||'';el.dispatchEvent(new Event('input',{bubbles:true}))}}
 const d=document.getElementById('dlg');if(!d?.open)throw Error('Không mở được biểu mẫu.');
 document.getElementById('dsub').textContent='Bản nháp thiết bị – HÃY KIỂM TRA và bấm Lưu để xác nhận Cloud. Chưa cập nhật quân số.';
 alert('Đã đưa bản nháp vào biểu mẫu để anh kiểm tra. Chưa lưu lên Cloud. Hãy bấm Lưu sau khi đối chiếu thông tin.');
}
async function updateIndicator(){const b=document.getElementById('ktxWorkerDraftButton');if(!b)return;try{const rows=await own(),count=rows.length;b.textContent=`Bản nháp công nhân (${count})`;b.hidden=(count===0);b.style.display=count>0?'':'none'}catch(_){b.hidden=true;b.style.display='none'}}
async function show(){
 const a=account();if(!a){alert('Cần đăng nhập Supabase để xem bản nháp.');return}
 const rows=await own();let dlg=document.getElementById('ktxWorkerDraftDialog');if(!dlg){dlg=document.createElement('dialog');dlg.id='ktxWorkerDraftDialog';dlg.style.cssText='width:min(680px,94vw);border:1px solid #d9e5f5;border-radius:12px;padding:18px;max-height:80vh;overflow:auto';document.body.append(dlg)}
 dlg.replaceChildren();const h=document.createElement('h3');h.textContent='Bản nháp Thêm/Sửa công nhân trên thiết bị';dlg.append(h);
 const note=document.createElement('p');note.className='mut';note.textContent='Bản nháp chưa phải hồ sơ đã lưu Cloud. Chỉ khôi phục vào biểu mẫu sau khi kiểm tra Cloud; không tự phát lại. Thông tin được mã hóa trong IndexedDB, không thay thế quy trình bảo mật thiết bị.';dlg.append(note);
 for(const row of rows){const line=document.createElement('div');line.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #e3ebf5;padding:10px 0';const label=document.createElement('span');label.style.flex='1';label.textContent=(row.mode==='add'?'Thêm mới':'Sửa hồ sơ')+' · '+new Date(row.createdAt).toLocaleString('vi-VN');line.append(label);
 const open=document.createElement('button');open.className='btn s sm';open.textContent='Kiểm tra và mở biểu mẫu';open.onclick=async()=>{open.disabled=true;try{await restore(row.id);dlg.close()}catch(e){alert('Chưa thể khôi phục: '+String(e?.message||e))}finally{open.disabled=false}};line.append(open);
 const del=document.createElement('button');del.className='btn s sm';del.textContent='Xóa bản nháp';del.onclick=async()=>{if(!confirm('Xóa bản nháp trên thiết bị? Hành động này không thay đổi Cloud.'))return;await discard(row.id);show()};line.append(del);dlg.append(line)}
 if(!rows.length){const empty=document.createElement('p');empty.textContent='Không có bản nháp nào đang chờ.';dlg.append(empty)}
 const close=document.createElement('button');close.className='btn s';close.textContent='Đóng';close.onclick=()=>dlg.close();dlg.append(close);if(!dlg.open)dlg.showModal();
}
function init(){let b=document.getElementById('ktxWorkerDraftButton');if(!b){const add=document.getElementById('aw');if(!add)return;b=document.createElement('button');b.type='button';b.id='ktxWorkerDraftButton';b.className='btn ta-slate';add.insertAdjacentElement('afterend',b)}b.hidden=true;b.style.display='none';b.onclick=()=>show().catch(e=>alert(String(e?.message||e)));updateIndicator()}
window.KTX_WORKER_DRAFTS=Object.freeze({capture,discard,own,restore,show,updateIndicator});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('pageshow',()=>updateIndicator());
})();
