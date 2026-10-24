/* v1.0.5: Safe admin bulk deletion and visible Cloud write verification. */
(function(){
'use strict';
const el=id=>document.getElementById(id);
const status=(s,bad=false)=>{
 let n=el('ktx105SyncNotice');
 if(!n){n=document.createElement('div');n.id='ktx105SyncNotice';n.setAttribute('role','status');n.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);max-width:90vw;z-index:999990;padding:11px 16px;border-radius:12px;font:600 13px system-ui;background:#eaf5ff;color:#1455a2;box-shadow:0 4px 18px #0002';document.body.appendChild(n)}
 n.textContent=s;n.style.background=bad?'#fff0f0':'#eaf5ff';n.style.color=bad?'#a52232':'#1455a2';
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
// Intercept only the bulk-delete button; normal row delete flows remain unchanged.
document.addEventListener('click',async ev=>{
 const b=ev.target.closest&&ev.target.closest('#dsall');if(!b)return;
 ev.preventDefault();ev.stopImmediatePropagation();
 if(running)return;
 if(typeof ME==='undefined'||ME.role!=='admin'){alert('Chỉ Admin mới được xóa toàn bộ.');return}
 if(typeof W==='undefined'||!W.length){alert('Danh sách công nhân trống.');return}
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.enabled||!SUPA_SYNC.ready||!SUPA_SYNC.session){alert('Chưa kết nối Supabase. Không thể xác nhận xóa toàn bộ dữ liệu dùng chung.');return}
 // Suspend scheduled background fetches/pushes for a single controlled operation.
 // Never clear active network flags: in-flight requests must actually settle.
 const cancelScheduled=()=>{
  for(const key of ['reloadTimer','pushTimer']){
   if(SUPA_SYNC[key]){clearTimeout(SUPA_SYNC[key]);SUPA_SYNC[key]=null;}
  }
 };
 cancelScheduled();
 if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying){
  status('Có phiên Cloud đang chạy. Đang đợi hoàn tất trước khi kiểm tra lệnh xóa…');
  b.disabled=true;
  try{
   const start=Date.now();
   while(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying){
    if(Date.now()-start>45000){
     status('Phiên Cloud vẫn đang chạy sau 45 giây. Không xóa khi yêu cầu mạng chưa kết thúc. Hãy kiểm tra kết nối Supabase và tải lại ứng dụng trước khi thử lại.',true);
     return;
    }
    await new Promise(resolve=>setTimeout(resolve,350));
   }
  }finally{b.disabled=false}
 }
 cancelScheduled();
 if(SUPA_SYNC.lastError){
  status('Cloud báo lỗi: '+SUPA_SYNC.lastError+'. Kiểm tra Đồng bộ Supabase trước khi xóa.',true);return;
 }
 if((SUPA_SYNC.conflicts||[]).length){
  status('Có '+SUPA_SYNC.conflicts.length+' xung đột. Mở Chức năng hệ thống → Đồng bộ Supabase để xử lý trước khi xóa.',true);return;
 }
 if(SUPA_SYNC.pending){
  status('Đang kiểm tra và đồng bộ những thay đổi còn chờ trước khi xóa...');
  b.disabled=true;
  try{
   const result=await syncPushAll();
   if(!result||!result.ok||result.conflicts||SUPA_SYNC.pending||(SUPA_SYNC.conflicts||[]).length){
    status('Chưa thể xóa: '+(SUPA_SYNC.lastError||'Cloud còn hàng đợi hoặc xung đột. Mở Chức năng hệ thống → Đồng bộ Supabase để kiểm tra.'),true);return;
   }
  }catch(e){status('Đồng bộ thất bại: '+(e.message||String(e)),true);return}
  finally{b.disabled=false}
 }
 if(!navigator.onLine){status('Không có Internet, chưa thể xóa dữ liệu Cloud.',true);return;}
 const qty=W.length;
 if(prompt('XÓA TOÀN BỘ '+qty+' HỒ SƠ CÔNG NHÂN TRÊN CLOUD. Hãy sao lưu trước. Gõ chính xác XÓA TẤT CẢ:')!=='XÓA TẤT CẢ')return;
 if(!confirm('Xác nhận lần cuối: Xóa '+qty+' hồ sơ trên Supabase? Không thể hoàn tác bằng nút Hoàn tác import.'))return;
 running=true;b.disabled=true;SUPA_SYNC.deletingWorkers=true;
 if(SUPA_SYNC.pushTimer){clearTimeout(SUPA_SYNC.pushTimer);SUPA_SYNC.pushTimer=null;}
 if(SUPA_SYNC.reloadTimer){clearTimeout(SUPA_SYNC.reloadTimer);SUPA_SYNC.reloadTimer=null;}
 try{
  const client=syncClient();const table=SYNC_TABLES.workers;
  if(!client||!table)throw Error('Không tìm thấy cấu hình Cloud');
  // Server-side count first; refuse partial deletion when it differs from the visible local snapshot.
  const q=await client.from(table).select('*',{count:'exact',head:true});if(q.error)throw q.error;
  if(q.count!==qty)throw Error('Cloud có '+q.count+' hồ sơ nhưng thiết bị đang có '+qty+'. Hãy đối chiếu trước khi xóa, không xóa lệch.');
  if(!window.navigator.onLine)throw Error('Không có Internet');
  // Single transactional RPC on server. No batch loop from browser.
  status('Đang gửi lệnh xóa an toàn đến Supabase…');
  const {data:deleted,error:rpcError}=await client.rpc('ktx_admin_delete_all_workers',{p_expected_count:qty,p_phrase:'XÓA TẤT CẢ'});
  if(rpcError)throw new Error('RPC xóa chưa sẵn sàng hoặc bị từ chối: '+rpcError.message+' (chưa thay đổi dữ liệu trên máy)');
  if(Number(deleted)!==qty)throw new Error('Server xác nhận '+deleted+'/'+qty+' bản ghi; cần kiểm tra lại trước khi tiếp tục');
  const q2=await client.from(table).select('*',{count:'exact',head:true});if(q2.error)throw q2.error;
  if(q2.count!==0)throw Error('Cloud vẫn còn '+q2.count+' hồ sơ. Chưa xóa trên thiết bị để tránh sai lệch.');
  W.splice(0,W.length); if(typeof sel!=='undefined')sel.clear();
  SUPA_SYNC.hashes.workers={};SUPA_SYNC.remoteIds.workers=new Set();
  if(typeof sv==='function')sv();
  if(typeof all==='function')all();
  status('Đã kiểm tra: Cloud còn 0 hồ sơ công nhân.');
 }catch(e){status('CHƯA XÓA HOÀN TẤT: '+(e.message||e)+'. Kiểm tra Cloud trước khi thử lại.',true);alert('Thao tác chưa hoàn tất. '+(e.message||e)+'\nKhông tải lại hay import ngay; hãy kiểm tra Supabase.');}
 finally{SUPA_SYNC.deletingWorkers=false;running=false;b.disabled=false}
},true);
window.addEventListener('beforeunload',e=>{
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.enabled&&(SUPA_SYNC.pending||SUPA_SYNC.pushing||(SUPA_SYNC.conflicts||[]).length)){
  e.preventDefault();e.returnValue='Có dữ liệu chưa đồng bộ lên Supabase.';
 }
});
// Import confirmation: offer an explicit Cloud verification after importer completes.
let imported=false;
document.addEventListener('change',ev=>{if(ev.target&&ev.target.id==='fx'&&ev.target.files&&ev.target.files.length){imported=true;status('Đã nhận file Import. Hãy kiểm tra kết quả và chọn Kiểm tra lưu Cloud.');setTimeout(()=>{const n=el('ktx105SyncNotice');if(n&&n.textContent.includes('Đã nhận file Import'))n.remove()},6000)}},true);
const verify=document.createElement('button');verify.type='button';verify.id='ktx105SaveNow';verify.textContent='Kiểm tra lưu Cloud';verify.className='btn ta-green';verify.style.cssText='padding:8px 12px;';verify.onclick=guardedPush;
function mount(){const bar=el('tools');if(bar&&!bar.contains(verify))bar.appendChild(verify);verify.hidden=!(typeof page!=='undefined'&&page==='work');}
new MutationObserver(()=>{const visible=typeof page!=='undefined'&&page==='work';verify.hidden=!visible;}).observe(document.body,{attributes:true,subtree:false,attributeFilter:['data-page']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
