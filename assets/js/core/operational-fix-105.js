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
 // Pending is a queue state, not proof that a conflict exists. Flush it first.
 // Tạm ngưng lượt tải tự động đã lên lịch, không vô hiệu hóa phân quyền hoặc đồng bộ thật.
 if(SUPA_SYNC.reloadTimer){clearTimeout(SUPA_SYNC.reloadTimer);SUPA_SYNC.reloadTimer=null;}
 if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying){
  status('Đang chờ lượt đồng bộ Cloud hiện tại hoàn tất để kiểm tra quyền xóa...');
  b.disabled=true;
  try{
   const started=Date.now();
   while((SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying)&&Date.now()-started<15000){
    await new Promise(resolve=>setTimeout(resolve,300));
   }
   if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying){
    status('Cloud vẫn đang đồng bộ sau 15 giây. Không thực hiện xóa; kiểm tra mạng, đồng bộ và thử lại.',true);
    return;
   }
  }finally{b.disabled=false}
 }
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
 running=true;b.disabled=true;
 if(SUPA_SYNC.reloadTimer){clearTimeout(SUPA_SYNC.reloadTimer);SUPA_SYNC.reloadTimer=null;}
 try{
  const client=syncClient();const table=SYNC_TABLES.workers;
  if(!client||!table)throw Error('Không tìm thấy cấu hình Cloud');
  // Server-side count first; refuse partial deletion when it differs from the visible local snapshot.
  const q=await client.from(table).select('*',{count:'exact',head:true});if(q.error)throw q.error;
  if(q.count!==qty)throw Error('Cloud có '+q.count+' hồ sơ nhưng thiết bị đang có '+qty+'. Hãy đối chiếu trước khi xóa, không xóa lệch.');
  if(!window.navigator.onLine)throw Error('Không có Internet');
  // Delete by explicit verified identifiers, not by a broad unconditional filter.
  const ids=(SUPA_SYNC.remoteIds.workers?Array.from(SUPA_SYNC.remoteIds.workers):[]).map(String);
  if(ids.length!==qty)throw Error('Danh sách định danh Cloud chưa khớp. Đồng bộ và kiểm tra lại trước khi xóa.');
  status('Đang xóa dữ liệu từ Supabase và kiểm tra kết quả...');
  for(let i=0;i<ids.length;i+=100){const r=await client.from(table).delete().in('record_id',ids.slice(i,i+100)).select('record_id');if(r.error)throw r.error;if((r.data||[]).length!==ids.slice(i,i+100).length)throw Error('Cloud không xác nhận đủ số bản ghi đã xóa. Cần kiểm tra lại dữ liệu.');}
  const q2=await client.from(table).select('*',{count:'exact',head:true});if(q2.error)throw q2.error;
  if(q2.count!==0)throw Error('Cloud vẫn còn '+q2.count+' hồ sơ. Chưa xóa trên thiết bị để tránh sai lệch.');
  W.splice(0,W.length); if(typeof sel!=='undefined')sel.clear();
  SUPA_SYNC.hashes.workers={};SUPA_SYNC.remoteIds.workers=new Set();
  if(typeof sv==='function')sv();
  if(typeof all==='function')all();
  status('Đã kiểm tra: Cloud còn 0 hồ sơ công nhân.');
 }catch(e){status('CHƯA XÓA HOÀN TẤT: '+(e.message||e)+'. Kiểm tra Cloud trước khi thử lại.',true);alert('Thao tác chưa hoàn tất. '+(e.message||e)+'\nKhông tải lại hay import ngay; hãy kiểm tra Supabase.');}
 finally{running=false;b.disabled=false}
},true);
window.addEventListener('beforeunload',e=>{
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.enabled&&(SUPA_SYNC.pending||SUPA_SYNC.pushing||(SUPA_SYNC.conflicts||[]).length)){
  e.preventDefault();e.returnValue='Có dữ liệu chưa đồng bộ lên Supabase.';
 }
});
// Import confirmation: offer an explicit Cloud verification after importer completes.
let imported=false;
document.addEventListener('change',ev=>{if(ev.target&&ev.target.id==='fx'&&ev.target.files&&ev.target.files.length){imported=true;status('Đang xử lý import. Chưa đóng trang cho đến khi dữ liệu ghi lên Cloud.')}},true);
const verify=document.createElement('button');verify.type='button';verify.id='ktx105SaveNow';verify.textContent='Kiểm tra lưu Cloud';verify.className='btn ta-green';verify.style.cssText='padding:8px 12px;';verify.onclick=guardedPush;
function mount(){const bar=el('tools');if(bar&&!bar.contains(verify))bar.appendChild(verify);verify.hidden=!(typeof page!=='undefined'&&page==='work');}
new MutationObserver(()=>{const visible=typeof page!=='undefined'&&page==='work';verify.hidden=!visible;}).observe(document.body,{attributes:true,subtree:false,attributeFilter:['data-page']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
