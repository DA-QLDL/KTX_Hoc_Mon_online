/* KTX device outbox V2: shared infrastructure, not proof of a Cloud commit.
 * Keep the existing DB/store to preserve QR jobs from V1.
 * Only explicit registered idempotent handlers may replay operations.
 */
(function(){
 'use strict';
 const DB='ktx_device_outbox_v1',STORE='jobs',VERSION=1;
 const ALLOWED_META=new Set(['requestId','recordId','action','kind','scope','date','period','vendor','td8','td111','td113','tdme','baseSignature','batch']);
 const MAX_ITEMS=250,MAX_ATTEMPTS=6,ACTIVE_STALE_MS=90000;
 let opened=null,running=false,sequence=0;
 const handlers=new Map();
 function open(){
  if(!('indexedDB' in window))return Promise.reject(Error('Thiết bị không hỗ trợ IndexedDB.'));
  if(!opened)opened=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB,VERSION);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'key'});};
   req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>{db.close();opened=null};resolve(db)};
   req.onerror=()=>reject(req.error||Error('Không thể mở bộ nhớ thiết bị.'));
   req.onblocked=()=>reject(Error('Bộ nhớ thiết bị đang bị khóa bởi tab khác.'));
  }).catch(e=>{opened=null;throw e});
  return opened;
 }
 async function storeTransaction(mode,callback){
  const db=await open();return new Promise((resolve,reject)=>{
   let result,finished=false;
   const tx=db.transaction(STORE,mode),os=tx.objectStore(STORE);
   try{callback(os,v=>{result=v})}catch(e){tx.abort();reject(e);return}
   tx.oncomplete=()=>{finished=true;resolve(result)};
   tx.onerror=()=>{if(!finished)reject(tx.error||Error('Lỗi giao dịch bộ nhớ.'))};
   tx.onabort=()=>{if(!finished)reject(tx.error||Error('Giao dịch bộ nhớ bị hủy.'))};
  });
 }
 function list(kind){return storeTransaction('readonly',(os,set)=>{os.getAll().onsuccess=e=>set((e.target.result||[]).filter(j=>!kind||j.kind===kind))})}
 function validateJob(j){
  if(!j||typeof j!=='object'||typeof j.key!=='string'||!j.key||typeof j.kind!=='string'||!j.kind||typeof j.actor!=='string'||!j.actor)throw Error('Thiếu định danh tác vụ hoặc tài khoản.');
  if(j.payload!=null){
   if(typeof j.payload!=='object'||Array.isArray(j.payload)||Object.keys(j.payload).some(k=>!ALLOWED_META.has(k)))throw Error('Hàng đợi không cho lưu dữ liệu cá nhân hoặc bản ghi đầy đủ.');
   if(JSON.stringify(j.payload).length>1024)throw Error('Thông tin tác vụ quá dài.');
   if(j.kind==='meal-count'){const p=j.payload; if(!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date||''))||!['sang','trua','chieu'].includes(p.period)||typeof p.vendor!=='string'||!p.vendor||p.vendor.length>120)throw Error('Thiếu định danh số suất ăn.');for(const n of ['td8','td111','td113','tdme'])if(p[n]!==null&&(!Number.isSafeInteger(p[n])||p[n]<0))throw Error('Số suất không hợp lệ.');if(typeof p.baseSignature!=='string'||p.baseSignature.length>160)throw Error('Thiếu dấu kiểm tra xung đột.');}
  }
  if(JSON.stringify(j).length>4096)throw Error('Tác vụ vượt dung lượng cho phép.');
 }
 function put(j){validateJob(j);return storeTransaction('readwrite',(os)=>{os.put({...j,updatedAt:Date.now()})})}
 function remove(key){if(!key)return Promise.reject(Error('Thiếu mã tác vụ'));return storeTransaction('readwrite',os=>{os.delete(key)})}
 async function enqueue(kind,action,recordId,actor,payload={}){
  if(!handlers.has(kind))throw Error('Nghiệp vụ chưa có bộ đồng bộ an toàn: '+kind);
  if(!actor||!recordId||!action)throw Error('Thiếu định danh yêu cầu, tài khoản hoặc hành động.');
  const key=[kind,actor,action,String(recordId)].join('|');
  const job={key,kind,action,recordId:String(recordId),actor:String(actor),payload,status:'pending',createdAt:Date.now(),attempts:0,nextAt:0,error:''};
  validateJob(job);
  return storeTransaction('readwrite',(os,set)=>{
   const read=os.get(key);
   read.onsuccess=()=>{
    if(read.result){set(read.result);return}
    const count=os.count();count.onsuccess=()=>{
     if(count.result>=MAX_ITEMS){set(null);return}
     os.put(job);set(job);
    };
   };
  }).then(r=>{if(!r)throw Error('Hàng đợi đã đầy. Cần xử lý tác vụ cũ.');return r});
 }
 function register(kind,handler){
  if(!kind||typeof handler!=='function')throw Error('Bộ xử lý không hợp lệ.');
  handlers.set(kind,handler);
 }
 function actor(){try{return String(window.KTX_DEVICE_QUEUE_ACTOR?.()||'')}catch(_){return ''}}
 function approved(){
  return !!(navigator.onLine&&actor()&&typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC?.session?.user?.id===actor()&&SUPA_SYNC?.ready&&SUPA_SYNC?.enabled);
 }
 async function doPump(account){
  if(running||!approved()||account!==actor())return;
  running=true;
  try{
   const jobs=(await list()).filter(j=>j.actor===account&&handlers.has(j.kind)).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
   for(const j of jobs){
    if(!approved()||actor()!==account)break;
    if(j.status==='sending'){
     // A crash during a Cloud call has unknown outcome, NEVER blindly replay.
     if(Date.now()-(j.updatedAt||j.createdAt||0)>ACTIVE_STALE_MS)await put({...j,status:'review',error:'Thao tác đã bị gián đoạn, cần đối soát Cloud trước khi gửi lại.'});
     continue;
    }
    if(j.status!=='pending'||Number(j.nextAt||0)>Date.now())continue;
    const sending={...j,status:'sending',updatedAt:Date.now()};await put(sending);
    try{
     const result=await handlers.get(j.kind)(Object.freeze({...sending}));
     if(!approved()||actor()!==account)break;
     if(result?.cloudVerified===true){await remove(j.key);continue}
     if(result?.safeToRetry===true && (j.attempts||0)<MAX_ATTEMPTS){
      const tries=(j.attempts||0)+1;
      await put({...sending,status:'pending',attempts:tries,nextAt:Date.now()+Math.min(300000,5000*Math.pow(2,tries)),error:'Cloud chưa xác nhận, sẽ thử lại theo bộ xử lý an toàn.'});
     }else await put({...sending,status:'review',error:'Cloud chưa xác nhận; cần kiểm tra để tránh ghi trùng.'});
    }catch(e){
     // Unknown outcome: a network failure might follow a successful write.
     await put({...sending,status:'review',attempts:(j.attempts||0)+1,error:String(e?.message||e).slice(0,240)});
    }
   }
  }finally{running=false;display().catch(()=>{});}
 }
 async function pump(account){
  const a=String(account||actor());if(!a||!approved()||a!==actor())return;
  if(navigator.locks?.request){
   return navigator.locks.request('ktx-device-outbox-v2-'+a,{ifAvailable:true},lock=>lock?doPump(a):undefined);
  }
  // Without a cross-tab lock we DO NOT send via this generic dispatcher.
  // QR has its own transaction-safe processor and is not registered here.
 }
 async function counts(account){
  const rows=(await list()).filter(j=>!!account&&j.actor===account);
  return {pending:rows.filter(j=>j.status==='pending'||j.status==='sending').length,
    review:rows.filter(j=>j.status==='review'||j.status==='failed').length,total:rows.length};
 }
 async function recover(account){
  const rows=await list();let n=0;
  for(const j of rows){if(j.actor!==account||j.status!=='sending')continue;
   if(Date.now()-(j.updatedAt||j.createdAt||0)<=ACTIVE_STALE_MS)continue;
   await put({...j,status:'review',error:'Lượt gửi trước bị gián đoạn; cần đối soát trước khi gửi lại.'});n++;
  }
  return n;
 }
 function safeText(el,s){el.textContent=String(s||'')}
 async function display(){
  const target=document.querySelector('#sync');if(!target||target.classList.contains('hide'))return;
  let pane=target.querySelector('#ktxDeviceOutboxPanel');
  if(!pane){pane=document.createElement('div');pane.id='ktxDeviceOutboxPanel';pane.className='card';target.insertBefore(pane,target.firstChild)}
  const a=actor();
  if(!a){safeText(pane,'Hàng đợi thiết bị: đăng nhập Supabase để xem tác vụ của tài khoản hiện tại.');return}
  let rows;try{await recover(a);rows=(await list()).filter(j=>j.actor===a)}
  catch(e){safeText(pane,'Không đọc được bộ nhớ thiết bị: '+String(e?.message||e));return}
  const pend=rows.filter(j=>['pending','sending'].includes(j.status)).length;
  const review=rows.filter(j=>['review','failed'].includes(j.status)).length;
  pane.replaceChildren();
  const h=document.createElement('h3');safeText(h,'Bộ nhớ đệm trên thiết bị – theo tài khoản');pane.append(h);
  const p=document.createElement('p');p.className='mut';safeText(p,`Đang chờ / đang gửi: ${pend} · Cần đối soát: ${review}. Yêu cầu lưu trên máy KHÔNG phải bằng chứng đã ghi Supabase.`);pane.append(p);
  const info=document.createElement('p');info.className='mut';safeText(info,'Đã hỗ trợ hàng đợi QR vào/ra và số suất ăn theo NCC. Thực đơn Excel và các nghiệp vụ nhân sự vẫn xác nhận Cloud trực tiếp. Hàng chờ không đồng nghĩa lưu Cloud thành công.');pane.append(info);
  if(rows.length){
   const table=document.createElement('table');table.className='sync-table';
   const head=document.createElement('tr');for(const t of ['Loại','Mã yêu cầu','Trạng thái','Lỗi / hướng xử lý']){const th=document.createElement('th');safeText(th,t);head.append(th)}table.append(head);
   for(const j of rows.slice(0,20)){
    const tr=document.createElement('tr');
    for(const value of [j.kind==='qr'?'Duyệt QR '+(j.type==='in'?'vào':'ra'):j.kind==='meal-count'?'Số suất ăn':j.kind,String(j.id||j.recordId||''),j.status,j.error||'—']){const td=document.createElement('td');safeText(td,value);tr.append(td)}
    table.append(tr);
   }
   const wrap=document.createElement('div');wrap.className='wrap';wrap.append(table);pane.append(wrap);
  }
  const btn=document.createElement('button');btn.type='button';btn.className='btn s sm';safeText(btn,'Kiểm tra và đồng bộ hàng đợi');
  btn.onclick=async()=>{btn.disabled=true;try{await recover(a);await pump(a);if(typeof window.qrQueuePump==='function')await window.qrQueuePump(true);else if(typeof qrQueuePump==='function')await qrQueuePump(true)}finally{btn.disabled=false;display().catch(()=>{})}};
  pane.append(btn);
 }
 window.KTX_DEVICE_QUEUE=Object.freeze({open,list,put,remove,enqueue,register,pump,counts,recover,display});
 function tick(){if(document.querySelector('#sync:not(.hide)'))display().catch(()=>{});if(approved())pump(actor()).catch(()=>{})}
 setInterval(tick,12000);
 window.addEventListener('online',tick);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
})();
