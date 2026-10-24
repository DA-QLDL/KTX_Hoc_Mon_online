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
// STEP258 rollback: restored the original dsall -> askLeave -> delWorkers flow.
// Do not intercept #dsall in capture phase or invoke ktx_admin_delete_all_workers.
// Cloud-write verification and import notices below remain active.
window.addEventListener('beforeunload',e=>{
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.enabled&&(SUPA_SYNC.pending||SUPA_SYNC.pushing||(SUPA_SYNC.conflicts||[]).length)){
  e.preventDefault();e.returnValue='Có dữ liệu chưa đồng bộ lên Supabase.';
 }
});
// Import confirmation: offer an explicit Cloud verification after importer completes.
let imported=false;
document.addEventListener('change',ev=>{if(ev.target&&ev.target.id==='fx'&&ev.target.files&&ev.target.files.length){imported=true;status('Đã nhận file Import. Vui lòng theo dõi kết quả đồng bộ trên trang Đồng bộ Supabase.');setTimeout(()=>{const n=el('ktx105SyncNotice');if(n&&n.textContent.includes('Đã nhận file Import'))n.remove()},6000)}},true);
// v1.0.20: No Cloud verification button is injected into the global toolbar.
// Save-check internals are kept available without exposing this extra control.
})();
