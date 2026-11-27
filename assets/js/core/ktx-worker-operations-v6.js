/* KTX V8 (STAGING) – encrypted recovery markers and Cloud-audited archival purge.
 * No background replay. No mutation to W/ARC/LOG. Cloud remains authoritative.
 */
(function(){'use strict';
const DB='ktx_worker_operation_intents_v6',STORE='operations',KEYS='keys';
let opener=null;
const actor=()=>{try{return String(SUPA_SYNC?.session?.user?.id||'')}catch(_){return ''}};
function requireActor(){const a=actor();if(!a)throw Error('Cần đăng nhập Supabase để bảo vệ yêu cầu trên thiết bị.');return a}
function openDB(){
 if(!indexedDB||!crypto?.subtle||!crypto?.getRandomValues)throw Error('Trình duyệt không hỗ trợ bộ nhớ mã hóa IndexedDB.');
 if(!opener)opener=new Promise((ok,bad)=>{const q=indexedDB.open(DB,1);
  q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});if(!d.objectStoreNames.contains(KEYS))d.createObjectStore(KEYS)};
  q.onsuccess=()=>{const d=q.result;d.onversionchange=()=>{d.close();opener=null};ok(d)};
  q.onerror=()=>bad(q.error||Error('IndexedDB lỗi'));q.onblocked=()=>bad(Error('IndexedDB đang bị khóa bởi tab khác'));
 }).catch(e=>{opener=null;throw e});return opener;
}
async function tx(table,mode,run){const d=await openDB();return new Promise((resolve,reject)=>{const t=d.transaction(table,mode),s=t.objectStore(table);let val;
 t.oncomplete=()=>resolve(val);t.onabort=()=>reject(t.error||Error('Giao dịch IndexedDB bị hủy'));
 try{run(s,v=>val=v)}catch(e){try{t.abort()}catch(_){}reject(e)}
})}
async function key(){const found=await tx(KEYS,'readonly',(s,set)=>{const r=s.get('key');r.onsuccess=()=>set(r.result)});if(found)return found;
 const fresh=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 return tx(KEYS,'readwrite',(s,set)=>{const r=s.get('key');r.onsuccess=()=>{if(r.result)set(r.result);else{s.put(fresh,'key');set(fresh)}}})}
async function encrypt(data){const k=await key(),iv=crypto.getRandomValues(new Uint8Array(12));const body=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(data)));return {iv:[...iv],body:[...new Uint8Array(body)]}}
async function decrypt(row){const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(row.iv)},await key(),new Uint8Array(row.body));return JSON.parse(new TextDecoder().decode(raw))}
const getAll=()=>tx(STORE,'readonly',(s,set)=>{const r=s.getAll();r.onsuccess=()=>set(r.result||[]) });
async function rowFor(id){const row=await tx(STORE,'readonly',(s,set)=>{const r=s.get(id);r.onsuccess=()=>set(r.result)});if(!row||row.actor!==requireActor())throw Error('Yêu cầu không thuộc tài khoản đang đăng nhập.');return row}
async function patch(id,status,note=''){const row=await rowFor(id);row.status=status;row.updatedAt=Date.now();row.note=String(note).slice(0,600);
 await tx(STORE,'readwrite',s=>s.put(row));indicator();return row}
async function capture(type,list,details={}){
 const uid=requireActor();if(!['exit','restore','purge_archive'].includes(type))throw Error('Loại thao tác không hỗ trợ.');
 const ids=[...new Set((list||[]).map(w=>String(w?.record_id||w?.id||'')).filter(Boolean))];
 if(!ids.length||ids.length>500)throw Error('Danh sách công nhân không hợp lệ.');
 const data={type,ids,mode:String(details.mode||''),reason:String(details.reason||''),date:String(details.date||''),count:ids.length};
 const id=crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16))).map(n=>n.toString(16).padStart(2,'0')).join('');
 const safe=await encrypt(data);
 await tx(STORE,'readwrite',s=>s.put({id,actor:uid,status:'queued',createdAt:Date.now(),updatedAt:Date.now(),note:'',...safe}));
 indicator();return id;
}
async function stage(id){return patch(id,'sent','Đã gọi Supabase; kết quả cần được xác minh nếu bị gián đoạn.')}
async function confirmed(id){return patch(id,'confirmed','Đã xác nhận Cloud. Có thể xóa dấu vết yêu cầu này trên thiết bị.')}
async function review(id,error){return patch(id,'review','Kết quả chưa chắc chắn: '+String(error?.message||error||'Không có xác nhận Cloud'))}
async function drop(id){const row=await rowFor(id);if(row.status!=='confirmed'&&row.status!=='review')throw Error('Không xóa yêu cầu đang chờ hoặc đang gửi.');
 await tx(STORE,'readwrite',s=>s.delete(id));indicator()}
async function own(){const a=actor();if(!a)return [];return (await getAll()).filter(x=>x.actor===a).sort((x,y)=>y.createdAt-x.createdAt)}
async function cloudCheck(row){const saved=await decrypt(row);if(!navigator.onLine||typeof syncClient!=='function')throw Error('Cần kết nối Supabase để kiểm tra.');
 const sb=syncClient();if(!sb)throw Error('Chưa có Supabase client.');
 const live=new Set(),archives=new Set();for(let i=0;i<saved.ids.length;i+=100){const ids=saved.ids.slice(i,i+100);
  const [w,a]=await Promise.all([sb.from('ktx_workers').select('record_id').in('record_id',ids),sb.from('ktx_archived_workers').select('record_id').in('record_id',ids)]);
  if(w.error)throw Error('Không kiểm tra được danh sách công nhân: '+w.error.message);
  if(a.error)throw Error('Không kiểm tra được kho lưu trữ: '+a.error.message);
  (w.data||[]).forEach(x=>live.add(String(x.record_id)));(a.data||[]).forEach(x=>archives.add(String(x.record_id)));
 }
 let message='';
 if(saved.type==='purge_archive'){
  const present=saved.ids.filter(id=>archives.has(id));
  message=`Cloud hiện có ${present.length}/${saved.ids.length} hồ sơ trong kho lưu trữ. `+
    (present.length?'Còn hồ sơ: chưa thể kết luận đã xóa. ':'Không còn trong kho: cần kiểm tra thêm nhật ký và quyền xóa. ')+
    'KHÔNG tự gửi lại lệnh Xóa hẳn.';
  // Audit evidence is linked to this exact device intent. It is not proof that
  // the user deleted a record if the audit was never recorded.
  const auditId='archive_purge_'+row.id;
  const audit=await sb.from('ktx_audit_logs').select('record_id,payload,created_by').eq('record_id',auditId).limit(1);
  if(audit.error)message+=' Không thể kiểm tra nhật ký Cloud: '+audit.error.message+'.';
  else if(Array.isArray(audit.data)&&audit.data.length){
   const proof=audit.data[0];
   if(String(proof.payload?.operationId||'')===row.id && String(proof.payload?.workerId||'')===saved.ids[0]){
    message+=' Đã tìm thấy nhật ký Xóa hẳn có mã yêu cầu khớp trên Supabase.';
   }else message+=' Có nhật ký cùng mã nhưng nội dung không khớp; cần kiểm tra thủ công.';
  }else message+=' Chưa tìm thấy nhật ký Cloud liên kết với yêu cầu thiết bị này.';
 }else if(saved.type==='exit'){
  const remaining=saved.ids.filter(id=>live.has(id));
  const absent=saved.ids.filter(id=>!live.has(id));
  const moved=saved.ids.filter(id=>archives.has(id));
  message=`Cloud hiện còn ${remaining.length}/${saved.ids.length} công nhân; đã vắng khỏi danh sách ${absent.length}; có trong lưu trữ ${moved.length}.`;
  if(saved.mode==='archive'&&moved.length!==saved.ids.length)message+=' Chưa xác minh đủ hồ sơ trong kho Điều chuyển/Nghỉ việc.';
  else if(saved.mode==='purge')message+=' Xóa hẳn cần kiểm tra nhật ký Cloud và quyền thực hiện; không tự gửi lại.';
 }else{
  const returned=saved.ids.filter(id=>live.has(id));
  message=`Cloud hiện có ${returned.length}/${saved.ids.length} công nhân trong danh sách chính. Kiểm tra thêm hồ sơ lưu trữ và lịch sử trước khi thao tác lại.`;
 }
 return message+' Đây chỉ là ảnh chụp trạng thái hiện tại, KHÔNG chứng minh giao dịch ban đầu do tab này hoàn tất.';
}
async function show(){requireActor();const rows=await own();let dlg=document.getElementById('ktxV6OperationDialog');if(!dlg){dlg=document.createElement('dialog');dlg.id='ktxV6OperationDialog';dlg.style.cssText='width:min(720px,95vw);border:1px solid #d6e3f2;border-radius:14px;padding:17px;max-height:80vh;overflow:auto';document.body.append(dlg)}
 dlg.replaceChildren();const h=document.createElement('h3');h.textContent='Yêu cầu Điều chuyển / Nghỉ việc / Khôi phục / Xóa hẳn lưu trữ trên thiết bị';dlg.append(h);
 const intro=document.createElement('p');intro.textContent='Chỉ theo dõi và đối soát, KHÔNG tự phát lại thao tác. Chưa có xác nhận Cloud không đồng nghĩa thao tác chưa xảy ra.';dlg.append(intro);
 for(const row of rows){const div=document.createElement('div');div.style.cssText='border-top:1px solid #e3e9f1;padding:11px 2px;display:grid;gap:7px';const p=document.createElement('div');p.textContent=`${new Date(row.createdAt).toLocaleString('vi-VN')} · ${row.status==='confirmed'?'Cloud đã xác nhận':row.status==='review'?'CẦN ĐỐI SOÁT':row.status==='sent'?'Đã gửi, chưa rõ kết quả':'Đã ghi trên thiết bị'}`;div.append(p);
 if(row.note){const n=document.createElement('div');n.style.fontSize='12px';n.textContent=row.note;div.append(n)}
 const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
 const check=document.createElement('button');check.className='btn s sm';check.textContent='Kiểm tra trạng thái Cloud';check.onclick=async()=>{check.disabled=true;try{const m=await cloudCheck(row);alert(m)}catch(e){alert('Đối soát chưa hoàn tất: '+String(e?.message||e))}finally{check.disabled=false}};actions.append(check);
 if(['confirmed','review'].includes(row.status)){const rem=document.createElement('button');rem.className='btn s sm';rem.textContent='Xóa dấu vết trên thiết bị';rem.onclick=async()=>{if(!confirm('Chỉ xóa dấu vết thiết bị, KHÔNG thay đổi Cloud. Với yêu cầu chưa rõ kết quả, phải kiểm tra Cloud trước. Tiếp tục?'))return;try{await drop(row.id);show()}catch(e){alert(String(e?.message||e))}};actions.append(rem)}div.append(actions);dlg.append(div)}
 if(!rows.length){const e=document.createElement('p');e.textContent='Không có yêu cầu nào trên thiết bị của tài khoản này.';dlg.append(e)}
 const close=document.createElement('button');close.className='btn s';close.textContent='Đóng';close.onclick=()=>dlg.close();dlg.append(close);if(!dlg.open)dlg.showModal();
}
async function indicator(){const btn=document.getElementById('ktxWorkerOpsV6');if(!btn)return;try{const r=await own(),count=r.filter(x=>x.status!=='confirmed').length;btn.textContent=`Yêu cầu Cloud (${count} cần kiểm tra)`;btn.hidden=(count===0);btn.style.display=count>0?'':'none'}catch(_){btn.hidden=true;btn.style.display='none'}}
function init(){let btn=document.getElementById('ktxWorkerOpsV6');if(!btn){const add=document.getElementById('aw');if(!add)return;btn=document.createElement('button');btn.id='ktxWorkerOpsV6';btn.className='btn ta-slate';btn.type='button';add.insertAdjacentElement('afterend',btn)}btn.hidden=true;btn.style.display='none';btn.onclick=()=>show().catch(e=>alert(String(e?.message||e)));indicator()}

let purgeArchiveBusy=false;
async function purgeArchiveCore(rows,onProgress){
 if(purgeArchiveBusy)throw Error('Một đợt Xóa hẳn đang xử lý trên tab này.');
 if(typeof can!=='function'||!can('purge')||typeof syncCanDelete!=='function'||!syncCanDelete('archive'))throw Error('Tài khoản không được phép xóa hẳn kho lưu trữ.');
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC?.ready||!SUPA_SYNC?.session||!SUPA_SYNC?.enabled)throw Error('Cần đăng nhập Supabase trước khi xóa.');
 if(SUPA_SYNC.pending||SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying)throw Error('Có tác vụ Cloud đang đồng bộ; hãy hoàn tất trước khi xóa.');
 if(typeof syncClient!=='function'||typeof SYNC_TABLES==='undefined'||!SYNC_TABLES.archive)throw Error('Chưa có kết nối kho lưu trữ Cloud.');
 const sb=syncClient();if(!sb)throw Error('Chưa sẵn sàng kết nối Supabase.');
 const unique=[...new Map((rows||[]).filter(a=>a&&a.id).map(a=>[String(a.id),a])).values()];
 if(!unique.length)throw Error('Chưa chọn hồ sơ hợp lệ.');
 if(unique.length>500)throw Error('Chỉ xóa tối đa 500 hồ sơ trong một đợt.');
 if(unique.some(a=>typeof assigned==='function'&&!assigned(a.w||{})))throw Error('Có hồ sơ ngoài phạm vi quản lý.');
 purgeArchiveBusy=true;
 const deleted=[],needsReview=[];let processed=0;const oldApplying=SUPA_SYNC.applying;
 SUPA_SYNC.applying=true;
 try{
  for(const a of unique){
   const id=String(a.id);let marker=null;
   try{
    // An IndexedDB failure must stop this particular destructive operation.
    marker=await capture('purge_archive',[{id}],{mode:'purge_archive'});
    // Verify exactly the requested archive ID, before sending a destructive request.
    const before=await sb.from(SYNC_TABLES.archive).select('record_id,payload').eq('record_id',id).limit(1);
    if(before.error)throw Error('Không kiểm tra được hồ sơ trước khi xóa: '+before.error.message);
    if(!Array.isArray(before.data)||!before.data.some(r=>String(r.record_id)===id))throw Error('Hồ sơ đã vắng trên Cloud; phải đối soát, không tự xóa lại.');
    const original=before.data.find(r=>String(r.record_id)===id);
    const archived=original?.payload||{};
    const worker=archived.w||archived.worker||archived;
    // Use the pre-delete Cloud location; never guess a KTX from the current screen.
    const beforeKtx=String(worker.ktx||'').trim();
    const beforeDay=String(worker.day||'').trim();
    const beforeRoom=String(worker.room||'').trim();
    await stage(marker);
    const response=await sb.from(SYNC_TABLES.archive).delete().eq('record_id',id).select('record_id');
    if(response.error)throw Error('Supabase chưa xác nhận xóa: '+response.error.message);
    if(!Array.isArray(response.data)||!response.data.some(r=>String(r.record_id)===id))throw Error('Cloud không trả về đúng mã hồ sơ đã xóa; kết quả chưa rõ.');
    const verify=await sb.from(SYNC_TABLES.archive).select('record_id').eq('record_id',id).limit(1);
    if(verify.error)throw Error('Không xác minh được sau khi xóa: '+verify.error.message);
    if(Array.isArray(verify.data)&&verify.data.length)throw Error('Hồ sơ còn xuất hiện trên Cloud sau khi xóa.');
    // The archive DELETE is already confirmed. A subsequent audit failure
    // must NEVER be presented as an unsuccessful deletion or retried.
    deleted.push(id);
    let auditProblem='';
    const performedAt=new Date();
    const identity=String(SUPA_SYNC?.account?.display_name||SUPA_SYNC?.session?.user?.email||'').trim();
    const payload={a:'PURGE_ARCHIVE_DETAIL',t:performedAt.toLocaleString('vi-VN'),
     at:performedAt.getTime(),day:performedAt.toLocaleDateString('en-CA'),
     d:'Xóa hẳn hồ sơ lưu trữ đã xác nhận trên Cloud',
     operationId:marker,workerId:id,archiveRecordId:id,
     ktx:beforeKtx,workerKtx:beforeKtx,workerDay:beforeDay,room:beforeRoom,
     actor:identity,source:'archive_cloud_verified_v8'};
    try{
     const logId='archive_purge_'+marker;
     const audit=await sb.from('ktx_audit_logs').insert({
      record_id:logId,payload,event_at:performedAt.toISOString(),created_by:requireActor()
     }).select('record_id');
     if(audit.error)throw audit.error;
     if(!Array.isArray(audit.data)||!audit.data.some(r=>String(r.record_id)===logId)){
      throw Error('Cloud không trả về xác nhận nhật ký tương ứng.');
     }
     await confirmed(marker);
    }catch(error){
     auditProblem='Hồ sơ ĐÃ XÓA trên Cloud, nhưng nhật ký chưa xác nhận: '+String(error?.message||error);
     try{await review(marker,Error(auditProblem))}catch(noteErr){console.warn('Không lưu được cảnh báo nhật ký:',noteErr)}
     needsReview.push({id,name:String(a.w?.name||id),message:auditProblem,auditOnly:true});
    }
    // Update the currently displayed data only AFTER a verified Cloud delete.
    if(typeof ARC!=='undefined'&&Array.isArray(ARC)){
     const i=ARC.findIndex(x=>String(x.id)===id);if(i>=0)ARC.splice(i,1);
    }
    if(typeof AS!=='undefined')AS.delete(a.id);
    if(typeof mArchiveSelected!=='undefined')mArchiveSelected.delete(id);
    if(SUPA_SYNC.hashes?.archive)delete SUPA_SYNC.hashes.archive[id];
    if(SUPA_SYNC.remoteIds?.archive)SUPA_SYNC.remoteIds.archive.delete(id);
   }catch(e){
    if(marker){try{await review(marker,e)}catch(markErr){console.warn('Không đánh dấu được yêu cầu cần đối soát:',markErr)}}
    needsReview.push({id,name:String(a.w?.name||id),message:String(e?.message||e)});
   }
   processed++;try{onProgress?.({done:processed,total:unique.length,deleted:deleted.length,review:needsReview.length})}catch(_){/* UI callbacks never change the Cloud outcome */}
  }
 }finally{SUPA_SYNC.applying=oldApplying;purgeArchiveBusy=false;indicator()}
 return {deleted,needsReview};
}
async function purgeArchive(rows,onProgress){
 const run=()=>purgeArchiveCore(rows,onProgress);
 if(navigator.locks?.request){
  const id=requireActor();
  return navigator.locks.request('ktx-archive-purge-v7-'+id,{mode:'exclusive',ifAvailable:true},lock=>{
   if(!lock)throw Error('Một tab khác đang xóa hồ sơ lưu trữ; vui lòng kiểm tra Cloud.');
   return run();
  });
 }
 // Fallback still relies on exact-ID Cloud confirmation, but cannot prevent simultaneous tabs.
 return run();
}

window.KTX_WORKER_OPERATIONS_V6=Object.freeze({capture,stage,confirmed,review,own,show,indicator,purgeArchive});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('pageshow',indicator);
})();
