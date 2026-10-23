/* KTX v1.0.6: visible Supabase download state. */
(function(){
'use strict';
let timer;
window.ktxDownloadStatus=function(type,message){
 let n=document.getElementById('ktx106DownloadStatus');
 if(!n){n=document.createElement('div');n.id='ktx106DownloadStatus';n.setAttribute('role','status');n.setAttribute('aria-live','polite');n.style.cssText='position:fixed;right:16px;bottom:76px;z-index:2147482500;max-width:min(420px,calc(100vw - 32px));padding:12px 16px;border-radius:12px;font:600 13px/1.45 system-ui;box-shadow:0 8px 26px #15233b24;overflow-wrap:anywhere';document.body.appendChild(n)}
 const c={loading:['⏳','#eff6ff','#174b89'],success:['✓','#eaf9ef','#11643a'],error:['⚠','#fff0f1','#9e2437']}[type]||['⏳','#eff6ff','#174b89'];
 n.textContent=c[0]+' '+message;n.style.background=c[1];n.style.color=c[2];n.style.display='block';
 clearTimeout(timer);if(type==='success')timer=setTimeout(()=>n.style.display='none',6500);
};
const pull=window.syncPullAll;
if(typeof pull==='function')window.syncPullAll=async function(){
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.pulling)return pull.apply(this,arguments);
 window.ktxDownloadStatus('loading','Đang tải dữ liệu mới nhất từ Supabase…');
 try{const r=await pull.apply(this,arguments);
 if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.lastError)window.ktxDownloadStatus('error','Tải thất bại: '+SUPA_SYNC.lastError);
 else if(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.lastSync)window.ktxDownloadStatus('success','Đã tải dữ liệu Cloud và cập nhật trong ứng dụng.');
 else window.ktxDownloadStatus('error','Chưa thể xác nhận tải hoàn tất.');
 return r;
 }catch(e){window.ktxDownloadStatus('error','Tải thất bại: '+(e.message||e));throw e}
};
})();
