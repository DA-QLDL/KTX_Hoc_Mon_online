
/* STEP107 — Đồng bộ ngoại tuyến + tự thử lại */
(()=>{
 if(!window.SUPA_SYNC||!window.syncPage||!window.syncPushAll)return;
 const Q_AT='ktx_sb_offline_queued_at',Q_RETRY='ktx_sb_offline_retry_count',Q_NEXT='ktx_sb_offline_next_retry';
 let retryTimer=0;
 const getNum=(k)=>{const n=Number(localStorage.getItem(k)||0);return Number.isFinite(n)?n:0};
 const setNum=(k,v)=>{try{if(v)localStorage.setItem(k,String(v));else localStorage.removeItem(k)}catch(e){}};
 function online(){return navigator.onLine!==false}
 function queuedAt(){return getNum(Q_AT)}
 function retryCount(){return getNum(Q_RETRY)}
 function markQueued(){
   SUPA_SYNC.pending=true;
   try{localStorage.setItem('ktx_sb_sync_pending','true')}catch(e){}
   if(!queuedAt())setNum(Q_AT,Date.now());
 }
 function clearQueueMeta(){setNum(Q_AT,0);setNum(Q_RETRY,0);setNum(Q_NEXT,0);clearTimeout(retryTimer);retryTimer=0}
 function scheduleRetry(){
   if(!online()||!SUPA_SYNC.enabled||!SUPA_SYNC.ready||!SUPA_SYNC.pending)return;
   // v1.0.91: Never replay a stale browser queue unattended.
   syncSetStatus('Thay đổi cục bộ chưa được Cloud xác nhận. Cần đối chiếu trước khi gửi lại.','warn');
   return;
   clearTimeout(retryTimer);
   const n=Math.min(retryCount()+1,8),delay=Math.min(60000,[0,5000,10000,20000,30000,45000,60000,60000,60000][n]||60000);
   setNum(Q_RETRY,n);setNum(Q_NEXT,Date.now()+delay);
   retryTimer=setTimeout(async()=>{
     if(!online()||!SUPA_SYNC.enabled||!SUPA_SYNC.ready)return;
     const r=await syncPushAll();
     if(r&&r.ok&&!r.conflicts&&!SUPA_SYNC.pending)clearQueueMeta();
     else if(SUPA_SYNC.pending&&!SUPA_SYNC.conflicts.length)scheduleRetry();
   },delay);
 }
 function fmtTime(t){return t?new Date(t).toLocaleString('vi-VN'):'—'}
 function renderOfflinePanel(){
   const root=document.getElementById('sync');if(!root)return;
   root.querySelectorAll('.sync-offline-card').forEach(x=>x.remove());
   const isOn=online(),pending=!!SUPA_SYNC.pending,qAt=queuedAt(),next=getNum(Q_NEXT),retry=retryCount();
   const card=document.createElement('div');card.className='card sync-offline-card';
   const state=!isOn?'bad':pending?'warn':'ok',label=!isOn?'Mất kết nối':pending?'Đang chờ gửi':'Đã đồng bộ';
   card.innerHTML=`<div class="sync-offline-head"><div><h3>Trạng thái thay đổi chưa lưu Cloud</h3><div class="mut" style="font-size:10px;margin-top:2px">Thay đổi chưa được Supabase xác nhận không phải dữ liệu đã lưu. Sau khi có mạng phải đối chiếu thủ công.  gửi lên Supabase và vẫn áp dụng cơ chế chống xung đột đa máy.</div></div><span class="sync-offline-badge ${state}">${label}</span></div><div class="sync-offline-grid"><div class="sync-offline-kpi"><span>Kết nối</span><b>${isOn?'Có Internet':'Ngoại tuyến'}</b></div><div class="sync-offline-kpi"><span>Thay đổi chờ gửi</span><b>${pending?'Có':'Không'}</b></div><div class="sync-offline-kpi"><span>Bắt đầu chờ</span><b>${pending&&qAt?fmtTime(qAt):'—'}</b></div><div class="sync-offline-kpi"><span>Tự thử lại</span><b>${pending&&next?fmtTime(next):(retry?retry+' lần':'—')}</b></div></div><div class="sync-actions" style="margin-top:9px"><button class="btn g sm" id="sy_retry_now" ${(!isOn||!SUPA_SYNC.enabled||!SUPA_SYNC.ready)?'disabled':''}>Gửi hàng đợi ngay</button></div><div class="sync-offline-note">Không tạo bản ghi thao tác riêng khi offline; ứng dụng giữ trạng thái dữ liệu hiện tại trên máy và đồng bộ phần thay đổi khi kết nối trở lại. Nếu Cloud cũng đã thay đổi cùng bản ghi, STEP106 sẽ yêu cầu chọn bản cần giữ thay vì tự ghi đè.</div>`;
   root.prepend(card);
   const b=card.querySelector('#sy_retry_now');if(b)b.onclick=async()=>{if(!online())return alert('Thiết bị đang mất mạng.');markQueued();const r=await syncPushAll();if(r&&r.ok&&!r.conflicts&&!SUPA_SYNC.pending){clearQueueMeta();syncSetStatus('Hàng đợi đã được gửi lên Supabase','ok')}else if(SUPA_SYNC.pending&&!SUPA_SYNC.conflicts.length)scheduleRetry();syncPage()};
 }
 const oldSchedule=syncSchedulePush;
 syncSchedulePush=function(){
   if(!SUPA_SYNC.enabled||!SUPA_SYNC.ready||SUPA_SYNC.applying)return;
   markQueued();
   if(!online()){
     clearTimeout(SUPA_SYNC.pushTimer);
     syncSetStatus('Mất mạng · thay đổi chưa lưu lên Supabase; không tự gửi lại khi có mạng','warn');
     if(page==='sync')syncPage();syncFooter();
     return;
   }
   oldSchedule();
 };
 const oldPush=syncPushAll;
 syncPushAll=async function(){
   if(!online()){
     markQueued();
     syncSetStatus('Mất mạng · dữ liệu đang nằm trong hàng đợi','warn');
     if(page==='sync')syncPage();syncFooter();
     return {ok:false,offline:true,queued:true};
   }
   const r=await oldPush();
   if(r&&r.ok&&!r.conflicts&&!SUPA_SYNC.pending)clearQueueMeta();
   else if((!r||!r.ok)&&SUPA_SYNC.pending&&!SUPA_SYNC.conflicts.length){syncSetStatus('Chưa xác nhận Cloud. Kiểm tra trạng thái đồng bộ trước khi thao tác tiếp.','warn')}
   return r;
 };
 const oldPage107=syncPage;syncPage=function(){oldPage107();renderOfflinePanel()};
 window.addEventListener('offline',()=>{if(SUPA_SYNC.enabled&&SUPA_SYNC.ready){markQueued();syncSetStatus('Mất mạng · mọi thay đổi mới sẽ chờ đồng bộ','warn');if(page==='sync')syncPage();syncFooter()}});
 window.addEventListener('online',()=>{if(!SUPA_SYNC.enabled||!SUPA_SYNC.ready)return;syncSetStatus(SUPA_SYNC.pending?'Đã có mạng · chưa phát lại dữ liệu cũ; cần đối chiếu':'Đã kết nối lại Internet',SUPA_SYNC.pending?'warn':'ok');if(page==='sync')syncPage();syncFooter();if(!SUPA_SYNC.pending&&typeof syncScheduleReload==='function')syncScheduleReload()});
 if(!online()&&SUPA_SYNC.pending)markQueued();
 window.KTX_OFFLINE_SYNC107={get online(){return online()},get pending(){return !!SUPA_SYNC.pending},get queuedAt(){return queuedAt()},retryNow:()=>syncPushAll()};
 setTimeout(()=>{if(page==='sync')syncPage();if(online()&&SUPA_SYNC.enabled&&SUPA_SYNC.ready&&SUPA_SYNC.pending)syncSetStatus('Có hàng đợi cũ trên máy; không tự đẩy Cloud','warn')},1200);
})();
