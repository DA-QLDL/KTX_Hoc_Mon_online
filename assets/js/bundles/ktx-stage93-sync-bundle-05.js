/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/script-40.js >>> */

(()=>{function place(){const nav=document.querySelector('body>nav'),bar=document.getElementById('authUserbar');if(nav&&bar&&bar.parentElement!==nav)nav.appendChild(bar)}
 document.addEventListener('DOMContentLoaded',place);window.addEventListener('load',place);
 // Recheck only on user interaction or page navigation; do not alter authentication state.
 document.addEventListener('click',()=>queueMicrotask(place),true);
})();

;
/* >>> Original: assets/js/modules/attendance/script-41.js >>> */

(function(){
 function digits(v){return String(v||'').replace(/\D/g,'')}
 function norm(v){return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')}
 function matches(r){return W.filter(w=>{
   const c=digits(r.cccd),m=norm(r.worker_code),wc=digits(w.cccd),wm=norm(w.mnv);
   if(c&&wc&&c!==wc)return false;
   if(m&&wm&&m!==wm)return false;
   const identifier=(c&&wc&&c===wc)||(m&&wm&&m===wm);
   return identifier&&norm(r.name)===norm(w.name);
 })}
 const oldOut=qrRenderOut;
 qrRenderOut=function(L){oldOut(L); const root=document.getElementById('qb');if(!root)return;
  root.querySelectorAll('[data-qo]').forEach(b=>b.remove());
  root.querySelectorAll('.qr-review-out tr').forEach((tr,i)=>{if(!i)return;const r=L[i-1];if(!r)return;
   const td=tr.lastElementChild;if(!td)return;const count=matches(r).length;
   const info=tr.children[8];if(info)info.innerHTML=count===1?'<span class="tag g">Khớp hồ sơ đã xác minh</span>':'<span class="tag r">Chưa xác minh / không khớp — không xóa công nhân</span>';
   const approve=document.createElement('button');approve.className='btn r sm';approve.textContent='Duyệt ra';approve.onclick=()=>qrApproveOut(r.id);td.insertBefore(approve,td.firstChild);
   const edit=document.createElement('button');edit.className='btn s sm';edit.textContent='Sửa';edit.style.margin='0 5px';edit.onclick=()=>window.qr224EditOut(r.id);td.insertBefore(edit,approve.nextSibling);
  });
 };
 window.qr224EditOut=async function(id){if(!can('qrApprove'))return;const r=QRREQ.find(x=>String(x.id)===String(id));if(!r)return;
  const fields=[['name','Họ tên'],['worker_code','Mã nhân viên'],['cccd','CCCD'],['day','Dãy'],['room','Phòng'],['reason','Lý do']];const patch={};
  for(const [k,label] of fields){const v=prompt('Sửa '+label+':',r[k]||'');if(v===null)return;patch[k]=v.trim()}
  if(!patch.name)return alert('Họ tên không được để trống.');const sb=qrSb();if(!sb)return alert('Chưa kết nối Supabase.');
  if(!window.ktxQrScopeAllows?.(r)||!window.ktxQrScopeAllows?.({...r,...patch}))return alert('Không được sửa yêu cầu ra ngoài KTX/Dãy được quản lý.');
  const {error}=await sb.from('residency_requests').update(patch).eq('id',r.id).eq('status','pending');
  if(error)return alert('Không thể cập nhật yêu cầu: '+error.message+' (kiểm tra quyền UPDATE/RLS).');Object.assign(r,patch);qrPage();
 };
 qrApproveOut=async function(id){if(!can('qrApprove'))return alert('Không có quyền duyệt.');const r=QRREQ.find(x=>String(x.id)===String(id));if(!r)return;
  const found=matches(r),w=found.length===1?found[0]:null;
  let msg=w?('Hồ sơ khớp: '+w.name+' · '+K(w)+' · '+D(w)+' · P.'+R(w)+'\nDuyệt sẽ đưa công nhân này ra khỏi danh sách tổng.'):
  'CẢNH BÁO: Không xác minh được duy nhất một hồ sơ trùng CCCD/Mã NV và họ tên.\nVẫn duyệt ghi nhận đăng ký ra, KHÔNG XÓA bất kỳ công nhân nào trong danh sách tổng.';
  if(!await ask(msg,{title:'Xác nhận duyệt đăng ký ra',ok:w?'Duyệt ra & cập nhật danh sách':'Chỉ ghi nhận, không xóa'}))return;
  try{await qrSetStatus(id,'approved');if(w){delWorkers([w],{reason:r.reason||'Khác',date:ldy(),note:'Duyệt đăng ký ra QR; đối chiếu CCCD/MNV và tên',source:'qr'})}
    else {if(typeof audit81==='function')audit81('QR_OUT_UNMATCHED','Duyệt đăng ký ra không khớp hồ sơ: '+r.name,{workerName:r.name,requestId:r.id,persist:false});else add('QR','Đăng ký ra không khớp hồ sơ: '+r.name);sv();alert('Đã duyệt ghi nhận đăng ký ra. Không xóa công nhân do thông tin chưa khớp.')}
    qrPage();
  }catch(e){alert('Duyệt không thành công: '+(e.message||e))}
 };
})();

;
/* >>> Original: assets/js/modules/admin/script-42.js >>> */

/* STEP226 - public client config comes from server environment; no user keys or per-device configuration. */
window.__KTX_PUBLIC_CONFIG = window.__KTX_PUBLIC_CONFIG || window.KTX_QR_CONFIG || null;
window.ktxLoadPublicConfig = async function(force){
  const c=window.KTX_QR_CONFIG || window.__KTX_PUBLIC_CONFIG;
  const valid=c=>c && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(c.url||'')) && /^(sb_publishable_|eyJ)/.test(String(c.key||'')) && !/sb_secret_|service_role/i.test(String(c.key||''));
  if(!valid(c)) throw new Error('Chưa có cấu hình Supabase hợp lệ trong bản phát hành. Liên hệ Quản trị.');
  const next={url:String(c.url).replace(/\/$/,''),key:String(c.key)};
  const prior=window.__KTX_PUBLIC_CONFIG;
  window.__KTX_PUBLIC_CONFIG=next;
  if(typeof SUPA_SYNC!=='undefined' && (force||!prior||prior.url!==next.url||prior.key!==next.key)){
    SUPA_SYNC.client=null;SUPA_SYNC._url=null;SUPA_SYNC._key=null;
  }
  return next;
};
// Warm the connection on opening the application; login also awaits it on demand.
window.addEventListener('DOMContentLoaded',()=>{window.ktxLoadPublicConfig().catch(()=>{});});

;
/* >>> Original: assets/js/modules/admin/script-43.js >>> */

/* STEP235: Notifications always honor the signed-in user's scoped workers.
   For non-admin users, unattributed/ambiguous alerts are intentionally excluded. */
(function(){
  if(typeof issueList!=='function')return;
  const original235=issueList;
  function alertInScope235(x){
    if(typeof ME==='undefined'||!ME||!ME.id)return false;
    if(ME.role==='admin')return true;
    if(!x||!x.w)return false; // never leak unscoped audit/global alerts
    try{return typeof can==='function' && can('view',x.w)===true;}catch(e){return false;}
  }
  issueList=function(){
    const list=original235();
    return Array.isArray(list)?list.filter(alertInScope235):[];
  };
  /* Recalculate unread counts after roles / worker scope change. */
  window.addEventListener('focus',()=>{try{if(typeof updateAlertBadges==='function')updateAlertBadges()}catch(e){}});
})();

;
/* >>> Original: assets/js/modules/workers/script-44.js >>> */

/* STEP239 – Footer button, one-click transfer launch */
(function(){
 const formerView=view;
 view=function(w){
   formerView(w);
   const b=document.getElementById('vTransfer239');
   if(!b)return;
   const permitted=!!(w&&can('transfer',w));
   b.hidden=!permitted;
   if(!permitted){b.onclick=null;return}
   b.disabled=false;
   b.onclick=()=>{
     if(b.disabled)return;
     b.disabled=true;
     const d=document.getElementById('vdl');if(d&&d.open)d.close();
     Promise.resolve(openTransfer(w)).catch(e=>{console.error('Transfer open failed',e);alert('Không mở được chuyển phòng: '+(e.message||e))}).finally(()=>{b.disabled=false});
   };
 };
 const go=document.getElementById('transferGo');
 if(go){const previous=go.onclick;let busy=false;go.onclick=async function(...args){
   if(busy)return;
   busy=true;go.disabled=true;
   try{if(typeof previous==='function')return await previous.apply(this,args)}finally{busy=false;if(document.getElementById('transferDlg')?.open){if(typeof transferInfo==='function')transferInfo();else go.disabled=false}}
 };}
})();

;
/* >>> Original: assets/js/core/script-45.js >>> */

/* STEP248 – classify action buttons by meaning, including dynamically rendered dialogs. */
(function(){
 const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();
 function tone(el){
   if(el.dataset.actionTone) return el.dataset.actionTone;
   const label=norm((el.innerText||el.textContent||'').replace(/[\s\u00a0]+/g,' '));
   const cls=' '+String(el.className||'')+' ';
   if(/(^|\s)(danger|sf-danger|r)(\s|$)/.test(cls)||/\b(xoa|xoa han|huy bo|tu choi|khoi phuc mac dinh|dat lai|delete|remove)\b/.test(label))return 'danger';
   if(/\b(hoan tac|canh bao|khoa)\b/.test(label))return 'warning';
   if(/(^|\s)(primary|sf-green|g)(\s|$)/.test(cls)||/^(xac nhan|luu|duyet|tao |them |dang nhap|gui |hoan thanh|cap nhat|ap dung|chuyen phong)/.test(label))return 'success';
   if(/\b(xuat|tai |import|chon file|chon nhieu|scan|quet|trich xuat|xem va xuat)\b/.test(label))return 'primary';
   if(/\b(chinh sua|sua |nhap |chon|tiep theo|phuong an)\b/.test(label))return 'accent';
   if(/\b(quay lai|dong|huy$|tro ve|back)\b/.test(label))return 'secondary';
   return 'neutral';
 }
 function eligible(el){
   if(!(el instanceof HTMLElement)) return false;
   if(el.closest('nav,aside,.sidebar,.tabs,.tabbar,.bottom-nav,.mobile-nav,.m-nav,.system-hub-nav,.sysfunc-grid,.sysfunc-btn')) return false;
   if(el.matches('[data-ui-no-tone],.sysfunc-btn,.tab,.alert-float,[role=tab]')) return false;
   if(el.classList.contains('ib') && !el.getAttribute('aria-label') && !el.getAttribute('title'))return false;
   return true;
 }
 function apply(el){
   if(!eligible(el))return;
   // Keep styled dashboard tiles and external component buttons intact.
   if(el.classList.contains('ktx-action'))return;
   const t=tone(el);el.classList.add('ktx-action');el.dataset.actionTone=t;
   if((el.textContent||'').length>45)el.classList.add('ktx-long');
 }
 function scan(root){if(root.matches&&root.matches('button,.btn,a.btn,label.upload'))apply(root);if(root.querySelectorAll)root.querySelectorAll('button,.btn,a.btn,label.upload').forEach(apply)}
 function start(){scan(document.body);const observer=new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')for(const n of m.addedNodes)if(n.nodeType===1)scan(n);}});observer.observe(document.body,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

;
/* >>> Original: assets/js/modules/admin/script-46.js >>> */
/* KTX V2.0.20: redundant system-page Back button intentionally removed.
   Sidebar / system-hub navigation remains authoritative. */
