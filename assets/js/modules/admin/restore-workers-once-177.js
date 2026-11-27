/* v1.0.77 — Admin-only, explicit, one-time PC -> Supabase worker recovery.
   Leaves the ordinary conflict guard in place. Never touches other tables. */
(function(){
'use strict';
if(window.__KTX_WORKER_RESTORE_177__)return;window.__KTX_WORKER_RESTORE_177__=true;
let busy=false;
function currentWorkers(){return typeof W!=='undefined'&&Array.isArray(W)?W:[]}
function showStatus(msg,error){const el=document.getElementById('wr177_status');if(el){el.textContent=msg;el.style.color=error?'#a51f35':'#155b40'}}
function backupFile(workers){
 const blob=new Blob([JSON.stringify({kind:'ktx-workers-local-recovery',version:'1.0.77',exportedAt:new Date().toISOString(),count:workers.length,workers},null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='KTX_SAO_LUU_CONG_NHAN_PC_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function recover(){
 if(busy)return;
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.session||!SUPA_SYNC.ready||!SUPA_SYNC.account||SUPA_SYNC.account.role!=='admin')return alert('Chỉ Admin đã xác minh Supabase mới được khôi phục.');
 if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying)return alert('Hệ thống đang đồng bộ; hãy thực hiện sau khi thao tác hiện tại kết thúc.');
 const workers=currentWorkers();if(workers.length<1)return alert('Máy PC này không có công nhân để khôi phục.');
 const rows=syncRows('workers');const ids=new Set(rows.map(r=>r.record_id));
 if(ids.size!==rows.length)return alert('Trùng khóa công nhân trong dữ liệu PC; đã dừng để kiểm tra, không ghi Cloud.');
 const byId=new Map(rows.map(r=>[r.record_id,r]));
 if(!window.confirm(`Máy hiện có ${rows.length.toLocaleString('vi-VN')} hồ sơ. BƯỚC 1: Tải file sao lưu JSON trước khi khôi phục?`))return;
 backupFile(workers);
 if(!window.confirm(`Hãy xác nhận file JSON đã được tải và giữ an toàn. Tiếp tục kiểm tra Cloud? KHÔNG đóng tab hoặc sửa danh sách trong khi khôi phục.`))return;
 const word=window.prompt(`Nhập chính xác số hồ sơ ${rows.length} để xác nhận KHÔI PHỤC từ PC lên Supabase:`);
 if(word!==String(rows.length))return alert('Số xác nhận không khớp; không ghi Cloud.');
 const previousEnabled=SUPA_SYNC.enabled;busy=true;SUPA_SYNC.enabled=false;clearTimeout(SUPA_SYNC.pushTimer);clearTimeout(SUPA_SYNC.reloadTimer);
 const button=document.getElementById('wr177_btn');if(button)button.disabled=true;
 try{
  const sb=syncClient();if(!sb)throw new Error('Không có kết nối Supabase.');
  const {data:account,error:ae}=await sb.from('app_accounts').select('role,enabled').eq('user_id',SUPA_SYNC.session.user.id).maybeSingle();
  if(ae||!account||account.role!=='admin'||!account.enabled)throw new Error('Không xác minh được Admin trên Supabase.');
  showStatus('Đang kiểm tra đầy đủ khóa công nhân trên Cloud...');
  const remote=await syncFetchAll('ktx_workers','record_id,payload');
  const remoteIds=new Set(remote.map(r=>String(r.record_id)));
  if(remote.length!==remoteIds.size)throw new Error('Cloud trả về khóa lặp, dừng để kiểm tra.');
  if(remote.length){
   // Resume is allowed only if all remote records are byte-equivalent to the PC copy.
   const mismatches=remote.filter(r=>!byId.has(String(r.record_id))||syncHash(byId.get(String(r.record_id)).payload)!==syncHash(r.payload));
   if(mismatches.length)throw new Error(`Cloud đã có ${remote.length} hồ sơ, trong đó ${mismatches.length} hồ sơ không khớp PC. Không ghi đè; cần đối chiếu thủ công.`);
   if(!window.confirm(`Cloud có ${remote.length} hồ sơ giống hệt dữ liệu PC (có thể là phần đã phục hồi trước). Chỉ bổ sung hồ sơ còn thiếu?`))return;
  }
  const missing=rows.filter(r=>!remoteIds.has(String(r.record_id)));
  showStatus(`Cloud có ${remote.length}; cần bổ sung ${missing.length} hồ sơ...`);
  for(let i=0;i<missing.length;i+=100){
   if(currentWorkers().length!==rows.length)throw new Error('Số hồ sơ trên máy thay đổi trong quá trình khôi phục; dừng an toàn.');
   const chunk=missing.slice(i,i+100);
   const {error}=await sb.from('ktx_workers').insert(chunk);
   if(error)throw new Error('Lỗi lưu đợt '+(Math.floor(i/100)+1)+': '+error.message);
   showStatus(`Đã gửi ${Math.min(i+100,missing.length)}/${missing.length} hồ sơ bổ sung. Đang tiếp tục...`);
  }
  const check=await syncFetchAll('ktx_workers','record_id,payload');
  if(check.length!==rows.length)throw new Error(`Đã gửi nhưng số dòng Cloud là ${check.length}, dự kiến ${rows.length}. Chưa bật đồng bộ tự động.`);
  for(const r of check){const local=byId.get(String(r.record_id));if(!local||syncHash(local.payload)!==syncHash(r.payload))throw new Error('Nội dung dữ liệu Cloud không trùng bản PC. Chưa bật đồng bộ tự động.');}
  SUPA_SYNC.hashes.workers=Object.fromEntries(rows.map(r=>[String(r.record_id),syncHash(r.payload)]));
  SUPA_SYNC.remoteIds.workers=new Set(rows.map(r=>String(r.record_id)));
  SUPA_SYNC.counts.workers=check.length;
  // Do not auto-enable full multidataset sync: archived/logs/residence tables may differ.
  SUPA_SYNC.enabled=false;
  localStorage.setItem('ktx_sb_sync_enabled','false');
  showStatus(`ĐÃ XÁC MINH: ${check.length} công nhân trên Supabase khớp PC. Đồng bộ nền vẫn tắt để bảo vệ các bảng khác. Hãy mở Mobile và đăng nhập rồi kiểm tra danh sách.`);
  alert(`Đã xác minh ${check.length} công nhân trên Cloud. Hãy kiểm tra Mobile. Chưa tự bật đồng bộ hai chiều của các bảng khác.`);
 }catch(e){showStatus('DỪNG AN TOÀN: '+(e.message||e),true);alert('Khôi phục chưa hoàn tất: '+(e.message||e)+'\nCó thể chạy lại để bổ sung phần thiếu; không nhập Excel trùng.');}
 finally{busy=false;SUPA_SYNC.enabled=false;localStorage.setItem('ktx_sb_sync_enabled','false');if(button)button.disabled=false;try{syncPage()}catch(e){} }
}
function inject(){const host=document.getElementById('sync');if(!host||document.getElementById('wr177_btn'))return;
 const first=host.querySelector('.sync-grid');if(!first)return;
 const box=document.createElement('div');box.className='card';box.style.cssText='margin-bottom:14px;border:1px solid #b7c8fa;background:#f7faff';
 box.innerHTML='<h3>Khôi phục công nhân PC lên Supabase (Admin)</h3><p style="font-size:13px;line-height:1.6">Dành cho trường hợp <b>Cloud trống nhưng PC còn dữ liệu chính xác</b>. Bắt buộc tải bản sao JSON; chỉ bổ sung bản ghi còn thiếu, không ghi đè Cloud khác dữ liệu PC. <b>Không tự bật đồng bộ toàn ứng dụng.</b></p><button class="btn g" id="wr177_btn" type="button">Sao lưu & khôi phục công nhân từ PC</button><p id="wr177_status" style="font-size:13px;margin:8px 0 0"></p>';
 host.insertBefore(box,first);document.getElementById('wr177_btn').onclick=recover;
}
if(typeof syncPage==='function'){
 const old=syncPage;syncPage=function(){const result=old.apply(this,arguments);inject();return result;};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
