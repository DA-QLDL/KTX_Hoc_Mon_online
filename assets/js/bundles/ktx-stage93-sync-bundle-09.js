/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/ktx-v2013-pagination.js >>> */
/* V2.0.13 - retain existing worker sorting/actions while adding real pagination size selection. */
(function(){
  if(typeof wl!=='function')return;
  const prev=wl;
  wl=function(){
    prev.apply(this,arguments);
    const container=document.getElementById('wl');if(!container)return;
    const footer=container.querySelector('.ktx250-worker-footer') || [...container.querySelectorAll(':scope > .row')].slice(-1)[0];
    if(!footer || container.querySelector('#ktx213WorkerSize'))return;
    const label=document.createElement('label');label.className='mut ktx213-worker-size';label.style.cssText='display:inline-flex;align-items:center;gap:6px;white-space:nowrap';
    label.textContent='Số dòng/trang ';
    const select=document.createElement('select');select.id='ktx213WorkerSize';select.style.cssText='min-width:74px;width:auto;height:34px;padding:3px 8px';
    [50,100,200,500].forEach(n=>{const o=document.createElement('option');o.value=String(n);o.textContent=String(n);o.selected=PS===n;select.appendChild(o)});
    select.onchange=()=>{PS=Number(select.value)||50;pg=1;wl()};label.appendChild(select);
    const pagination=footer.querySelector('span.row') || footer.lastElementChild;
    if(pagination && pagination!==footer)pagination.insertBefore(label,pagination.firstChild);
    else footer.appendChild(label);
    const wrap=container.querySelector('.wrap');if(wrap)wrap.classList.add('ktx213-full-table');
  };
})();

;
/* >>> Original: assets/js/core/ktx-v2020-clean-navigation.js >>> */
/* V2.0.20: compatibility guard for dynamically generated legacy back controls.
   This does NOT intercept browser/system back navigation or hide dialog close buttons. */
(function(){'use strict';
  function cleanup(root){
    if(!(root instanceof Element || root instanceof Document))return;
    const banner=document.getElementById('ktx143Recovery');
    if(banner)banner.remove();
    const nodes=(root instanceof Element && root.matches('button')?[root]:[])
      .concat(Array.from(root.querySelectorAll('button')));
    nodes.forEach(b=>{
      if(b.id==='menuNcc211Close'||b.id==='mealMonitor182Back'){
        // These buttons are essential for dismissing full-screen embedded views.
        if(b.textContent.trim()!=='Đóng')b.textContent='Đóng';
        return;
      }
      const label=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(/^([←↩⟵]\s*)?(quay lại|trở về)(\b|\s)/i.test(label)
         ||b.classList.contains('mback')
         ||b.classList.contains('system-backbar')
         ||b.id==='step138UtilBack'){
        b.hidden=true;
        b.style.setProperty('display','none','important');
      }
    });
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;cleanup(document)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  new MutationObserver(records=>{
    if(records.some(r=>r.addedNodes.length))schedule();
  }).observe(document.documentElement,{childList:true,subtree:true});
})();

;
/* >>> Original: assets/js/modules/meals/ktx-v2027-meal-aggregate.js >>> */
/* KTX Hóc Môn V2.0.27 — Cloud meal counts summary (read-only). */
(()=>{
 'use strict';
 const TABLE='ktx_meal_report_counts';
 const PERIODS={sang:'Sáng',trua:'Trưa',chieu:'Chiều'};
 const COLS=['td8','td111','td113','tdme'];
 const SESSIONS=['sang','trua','chieu'];
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fmt=v=>Number(v||0).toLocaleString('vi-VN');
 const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const parseDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s)))return null;const [y,m,d]=s.split('-').map(Number);const z=new Date(y,m-1,d);return z.getFullYear()===y&&z.getMonth()===m-1&&z.getDate()===d?z:null};
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const human=s=>String(s||'').split('-').reverse().join('/');
 function rangeFor(kind,date){const d=parseDate(date);if(!d)throw Error('Ngày không hợp lệ');if(kind==='day')return [iso(d),iso(d)];if(kind==='week'){const a=new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7));return [iso(a),iso(new Date(a.getFullYear(),a.getMonth(),a.getDate()+6))]}if(kind==='month')return [iso(new Date(d.getFullYear(),d.getMonth(),1)),iso(new Date(d.getFullYear(),d.getMonth()+1,0))];throw Error('Kỳ tổng hợp không hợp lệ')}
 function getClient(){try{const x=typeof syncClient==='function'?syncClient():null;return x||null}catch{return null}}
 // Supabase PostgREST caps responses at 1000 by default, use paged reads.
 async function loadRows(a,b){const client=getClient();if(!client)throw Error('Chưa kết nối Supabase. Hãy đăng nhập và thử lại.');const {data:{user},error:authErr}=await client.auth.getUser();if(authErr||!user)throw Error('Phiên Supabase hết hạn. Vui lòng đăng nhập lại.');const all=[];let offset=0;const size=500;
  for(let page=0;page<100;page++){
   const {data,error}=await client.from(TABLE).select('meal_date,meal_period,vendor,td8,td111,td113,tdme').gte('meal_date',a).lte('meal_date',b).order('meal_date',{ascending:true}).order('meal_period',{ascending:true}).order('vendor',{ascending:true}).range(offset,offset+size-1);
   if(error)throw Error('Không đọc được dữ liệu suất ăn: '+error.message);
   const part=Array.isArray(data)?data:[];all.push(...part);if(part.length<size)return all;offset+=part.length;
  }
  throw Error('Dữ liệu quá lớn để tải đầy đủ. Vui lòng thu hẹp khoảng thời gian.');
 }
 const int=v=>v===null||v===undefined||v===''?0:(Number.isFinite(+v)?Math.max(0,Math.round(+v)):0);
 function analyze(rows,session){const detail=[];const vendors=new Map();const grand={sang:0,trua:0,chieu:0,td8:0,td064:0,tdme:0,total:0};
  for(const r of rows){if(!r||!r.vendor||!SESSIONS.includes(r.meal_period))continue;if(session!=='all'&&r.meal_period!==session)continue;
   // A blank record does not represent a confirmed meal count.
   if(COLS.every(k=>r[k]===null||r[k]===undefined||r[k]===''))continue;
   const td8=int(r.td8),td064=int(r.td111)+int(r.td113),tdme=int(r.tdme),total=td8+td064+tdme;
   const name=String(r.vendor).trim();if(!name)continue;
   let v=vendors.get(name);if(!v){v={name,sang:0,trua:0,chieu:0,td8:0,td064:0,tdme:0,total:0,records:0};vendors.set(name,v)}
   v[r.meal_period]+=total;v.td8+=td8;v.td064+=td064;v.tdme+=tdme;v.total+=total;v.records++;
   grand[r.meal_period]+=total;grand.td8+=td8;grand.td064+=td064;grand.tdme+=tdme;grand.total+=total;
   detail.push({date:r.meal_date,session:PERIODS[r.meal_period],vendor:name,td8,td064,tdme,total});
  }
  const sorted=[...vendors.values()].sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,'vi'));
  return {vendors:sorted,detail,grand,recordCount:detail.length};
 }
 let modal=null;let latest=null;let busy=false;
 function ensureModal(){if(modal)return modal;modal=document.createElement('dialog');modal.id='ktxMealAggregateDialog';modal.className='ktx-meal-aggregate';modal.innerHTML=`<div class="kma-top"><div><h2>Tổng hợp suất ăn NCC</h2><p>Thống kê từ số suất đã lưu trên Supabase</p></div><button type="button" class="kma-x" id="kmaClose" aria-label="Đóng">×</button></div>
  <div class="kma-filters"><label>Kỳ thống kê<select id="kmaPeriod"><option value="day">Theo ngày</option><option value="week">Theo tuần</option><option value="month">Theo tháng</option></select></label><label>Ngày tham chiếu<input type="date" id="kmaDate"></label><label>Buổi ăn<select id="kmaSession"><option value="all">Tất cả buổi</option><option value="sang">Sáng</option><option value="trua">Trưa</option><option value="chieu">Chiều</option></select></label><button type="button" class="kma-load" id="kmaLoad">Tổng hợp</button></div>
  <div id="kmaRange" class="kma-range"></div><div id="kmaStatus" role="status" aria-live="polite" class="kma-status"></div><div id="kmaResults" class="kma-results"></div>
  <div class="kma-foot"><button type="button" id="kmaExport" disabled>Xuất Excel</button><button type="button" id="kmaDismiss">Đóng</button></div>`;document.body.append(modal);
  $('kmaClose').onclick=$('kmaDismiss').onclick=()=>modal.close();$('kmaLoad').onclick=refresh;$('kmaPeriod').onchange=refresh;$('kmaSession').onchange=refresh;$('kmaDate').onchange=refresh;$('kmaExport').onclick=exportExcel;
  return modal;
 }
 function show(){ensureModal();$('kmaDate').value=typeof RP!=='undefined'&&parseDate(RP.date)?RP.date:today();$('kmaSession').value='all';$('kmaPeriod').value='day';if(!modal.open)modal.showModal();refresh()}
 function render(data,a,b){const wrap=$('kmaResults');if(!data.recordCount){wrap.innerHTML='<div class="kma-empty">Chưa có số lượng suất ăn đã lưu trong khoảng thời gian này. Không tính thực đơn như số suất đã phục vụ.</div>';return}
  const {grand}=data;
  wrap.innerHTML=`<div class="kma-stats"><div><small>Tổng suất</small><strong>${fmt(grand.total)}</strong></div><div><small>Buổi sáng</small><strong>${fmt(grand.sang)}</strong></div><div><small>Buổi trưa</small><strong>${fmt(grand.trua)}</strong></div><div><small>Buổi chiều</small><strong>${fmt(grand.chieu)}</strong></div></div>
    <h3>Theo từng nhà cung cấp</h3><div class="kma-scroll"><table><thead><tr><th>NCC</th><th>Sáng</th><th>Trưa</th><th>Chiều</th><th>TĐ 8</th><th>TĐ 06.4</th><th>TĐ ME</th><th>Tổng</th></tr></thead><tbody>${data.vendors.map(v=>`<tr><td>${esc(v.name)}</td><td>${fmt(v.sang)}</td><td>${fmt(v.trua)}</td><td>${fmt(v.chieu)}</td><td>${fmt(v.td8)}</td><td>${fmt(v.td064)}</td><td>${fmt(v.tdme)}</td><td><strong>${fmt(v.total)}</strong></td></tr>`).join('')}<tr class="kma-total"><td>Tổng cộng</td><td>${fmt(grand.sang)}</td><td>${fmt(grand.trua)}</td><td>${fmt(grand.chieu)}</td><td>${fmt(grand.td8)}</td><td>${fmt(grand.td064)}</td><td>${fmt(grand.tdme)}</td><td>${fmt(grand.total)}</td></tr></tbody></table></div>
    <details class="kma-detail"><summary>Chi tiết theo ngày và buổi (${fmt(data.detail.length)} bản ghi)</summary><div class="kma-scroll"><table><thead><tr><th>Ngày</th><th>Buổi</th><th>Nhà cung cấp</th><th>TĐ 8</th><th>TĐ 06.4</th><th>TĐ ME</th><th>Tổng</th></tr></thead><tbody>${data.detail.map(r=>`<tr><td>${human(r.date)}</td><td>${esc(r.session)}</td><td>${esc(r.vendor)}</td><td>${fmt(r.td8)}</td><td>${fmt(r.td064)}</td><td>${fmt(r.tdme)}</td><td><strong>${fmt(r.total)}</strong></td></tr>`).join('')}</tbody></table></div></details>`;
 }
 async function refresh(){if(busy)return;const kind=$('kmaPeriod').value,session=$('kmaSession').value,date=$('kmaDate').value;let dates;try{dates=rangeFor(kind,date)}catch(e){$('kmaStatus').textContent=e.message;return}const [a,b]=dates;$('kmaRange').textContent=`Từ ${human(a)} đến ${human(b)} · ${session==='all'?'Tất cả buổi':PERIODS[session]}`;busy=true;latest=null;$('kmaStatus').classList.remove('kma-error');$('kmaLoad').disabled=true;$('kmaExport').disabled=true;$('kmaStatus').textContent='Đang đọc dữ liệu từ Supabase...';$('kmaResults').innerHTML='';
  try{const data=analyze(await loadRows(a,b),session);latest={data,a,b,kind,session};$('kmaStatus').textContent=`Đã đọc ${fmt(data.recordCount)} bản ghi số suất · ${fmt(data.vendors.length)} NCC. Dữ liệu tính theo toàn hệ thống (bảng Cloud chưa có cột KTX).`;
   render(data,a,b);$('kmaExport').disabled=!data.recordCount;
  }catch(e){$('kmaStatus').textContent=e.message||String(e);$('kmaStatus').classList.add('kma-error');$('kmaResults').innerHTML='<div class="kma-empty">Không thể tổng hợp. Kiểm tra kết nối và quyền đọc dữ liệu suất ăn.</div>'}
  finally{busy=false;$('kmaLoad').disabled=false;}
 }
 function exportExcel(){if(!latest||!latest.data.recordCount)return;const {data,a,b}=latest;const rows=[['Nhà cung cấp','Sáng','Trưa','Chiều','TĐ 8','TĐ 06.4','TĐ ME','Tổng'],...data.vendors.map(v=>[v.name,v.sang,v.trua,v.chieu,v.td8,v.td064,v.tdme,v.total]),['Tổng cộng',data.grand.sang,data.grand.trua,data.grand.chieu,data.grand.td8,data.grand.td064,data.grand.tdme,data.grand.total]];
  const detail=[['Ngày','Buổi','Nhà cung cấp','TĐ 8','TĐ 06.4','TĐ ME','Tổng'],...data.detail.map(r=>[r.date,r.session,r.vendor,r.td8,r.td064,r.tdme,r.total])];
  const file=`Tong_hop_suat_an_NCC_${a}_${b}.xlsx`;
  if(window.XLSX){const wb=XLSX.utils.book_new();const s1=XLSX.utils.aoa_to_sheet(rows),s2=XLSX.utils.aoa_to_sheet(detail);s1['!cols']=[{wch:28},...Array(7).fill({wch:13})];s2['!cols']=[{wch:15},{wch:12},{wch:28},...Array(4).fill({wch:14})];XLSX.utils.book_append_sheet(wb,s1,'Theo NCC');XLSX.utils.book_append_sheet(wb,s2,'Chi tiet ngay buoi');XLSX.writeFile(wb,file);return}
  // Do not mislabel CSV as Excel xlsx.
  const csv=[...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=file.replace(/\.xlsx$/,'.csv');link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
 function attach(){const pc=document.querySelector('#meal .ctl');if(pc&&!pc.querySelector('[data-kma-open]')){const b=document.createElement('button');b.type='button';b.className='btn kma-launch';b.textContent='📊 Tổng hợp suất ăn NCC';b.dataset.kmaOpen='';pc.appendChild(b)}
 const mobile=document.querySelector('#mobile180 .m195-config');if(mobile&&!mobile.querySelector('[data-kma-open]')){const b=document.createElement('button');b.type='button';b.className='mbtn kma-launch-mobile';b.textContent='▤ Tổng hợp suất ăn NCC';b.dataset.kmaOpen='';const heading=mobile.querySelector('h3');if(heading)heading.before(b);else mobile.appendChild(b)} }
 document.addEventListener('click',e=>{if(e.target.closest('[data-kma-open]')){e.preventDefault();show()}},true);
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;attach()})});
 const start=()=>{observer.observe(document.body,{childList:true,subtree:true});attach()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.KTX_MEAL_AGGREGATE_V2027={rangeFor,analyze,show};
})();

;
/* >>> Original: assets/js/core/connection-status-v2072.js >>> */
/* V2.0.72: non-blocking one-time connection notice per state change.
   UI-only. No Supabase writes, no localStorage deletion or sync changes. */
(function(){
 'use strict';
 if(window.__KTX_CONNECTION_STATUS_2072__)return;
 window.__KTX_CONNECTION_STATUS_2072__=true;
 const ID='ktx-connection-status-v2072',OLD=['ktx-connection-status-v2047','ktx2047ConnectionBanner','ktx-connection-status-v2067'];
 const SHOW_MS=3500;
 let el=null,timer=null,last='';
 function cleanOld(){OLD.forEach(id=>{const node=document.getElementById(id);if(node)node.remove()})}
 function pending(){
   const s=typeof SUPA_SYNC!=='undefined'?SUPA_SYNC:null;
   if(s&&(s.pending||s.pushing))return true;
   try{return JSON.parse(localStorage.getItem('ktx_sb_sync_pending')||'false')===true}catch(_){return false}
 }
 function status(){
   const s=typeof SUPA_SYNC!=='undefined'?SUPA_SYNC:null,waiting=pending();
   if(!navigator.onLine)return {kind:'offline',text:waiting?'Ngoại tuyến · Có dữ liệu chờ đồng bộ.':'Ngoại tuyến · Dữ liệu có thể chưa cập nhật.'};
   if(waiting)return {kind:'pending',text:'Có dữ liệu chờ đồng bộ Supabase.'};
   if(s&&s.ready&&s.enabled&&s.lastError)return {kind:'error',text:'Đồng bộ báo lỗi. Kiểm tra Chức năng hệ thống.'};
   return null;
 }
 function close(){if(timer){clearTimeout(timer);timer=null}if(el){el.remove();el=null}}
 function loggedOut(){return !!(document.body?.classList.contains('auth-locked')||document.querySelector('#authHubGate:not(.hide)'))}
 function show(s){
   close();if(!document.body||loggedOut()||document.hidden)return;
   const warn=s.kind!=='pending';
   el=document.createElement('div');el.id=ID;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
   el.style.cssText='position:fixed;z-index:2147482000;left:10px;right:10px;bottom:calc(84px + env(safe-area-inset-bottom, 0px));max-width:340px;margin:0 auto;display:flex;align-items:center;gap:8px;padding:7px 8px 7px 10px;border-radius:9px;box-shadow:0 3px 10px #173e721b;font:600 11px/1.35 system-ui,-apple-system,sans-serif;background:'+(warn?'#fff4df':'#edf5ff')+';color:'+(warn?'#784108':'#193f75')+';border:1px solid '+(warn?'#edcb8a':'#b8d4f6')+';pointer-events:auto;';
   const label=document.createElement('span');label.textContent=s.text;label.style.cssText='flex:1;min-width:0;';
   const x=document.createElement('button');x.type='button';x.textContent='×';x.setAttribute('aria-label','Đóng thông báo');
   x.style.cssText='flex:0 0 24px;min-width:24px;min-height:24px;padding:0;background:transparent;border:0;color:inherit;font:700 18px/1 system-ui;cursor:pointer;';
   x.addEventListener('click',close);el.append(label,x);document.body.appendChild(el);
   timer=setTimeout(close,SHOW_MS);
 }
 function render(){
   cleanOld();
   const s=status(),key=s?s.kind+'|'+s.text:'';
   if(!s){last='';close();return}
   if(key===last){if(loggedOut())close();return}
   last=key;show(s);
 }
 function boot(){
   render();window.addEventListener('online',render);window.addEventListener('offline',render);
   window.addEventListener('pageshow',render);document.addEventListener('visibilitychange',render);
   /* A legacy timer on an older cached tab may recreate its banner; remove it without re-notifying. */
   setInterval(()=>{cleanOld();if(!document.hidden)render()},5000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.KTX_CONNECTION_STATUS_CHECK=render;
})();

;
/* >>> Original: assets/js/modules/admin/script-81-org-chart.js >>> */
(function(){
  'use strict';

  const META_KEY='ktx_org_chart_account_meta_v256';
  const DIALOG_ID='ktxOrg256Dialog';

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s??'').trim();
  const phoneNorm=s=>String(s??'').replace(/[^0-9+.\-\s]/g,'').replace(/\s{2,}/g,' ').trim();
  const $=id=>document.getElementById(id);

  function readMeta(){
    try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch(e){return {}}
  }
  function writeMeta(value){
    try{localStorage.setItem(META_KEY,JSON.stringify(value||{}))}catch(e){}
  }
  function mergeAuthcAccountMeta(){
    if(!window.AUTHC||!Array.isArray(window.AUTHC.accounts))return;
    const meta=readMeta();
    window.AUTHC.accounts=window.AUTHC.accounts.map(a=>{
      const x=meta[String(a.user_id)]||{};
      return {...a,position:a.position||a.job_title||x.position||'',phone:a.phone||x.phone||''};
    });
  }

  const oldAuthLoad=window.authLoadAdminData;
  if(typeof oldAuthLoad==='function'){
    window.authLoadAdminData=async function(){
      const out=await oldAuthLoad.apply(this,arguments);
      mergeAuthcAccountMeta();
      return out;
    };
  }

  // Persist contact details to Supabase, not just per-browser localStorage.
  // SQL 01 must add app_accounts.job_title and app_accounts.phone first.
  const oldSave=window.saveAccountRow;
  if(typeof oldSave==='function'){
    window.saveAccountRow=async function(id,row){
      const position=norm(row.querySelector('[data-position]')?.value||row.querySelector('#ac256Position')?.value);
      const phone=phoneNorm(row.querySelector('[data-phone]')?.value||row.querySelector('#ac256Phone')?.value);
      const ok=await oldSave.call(this,id,row);
      if(ok!==true)return ok; // Do not report success if the account update failed.

      const sb=typeof syncClient==='function'?syncClient():null;
      if(!sb)throw new Error('Chưa kết nối được Supabase để lưu Chức danh/SĐT.');
      // Dedicated RPC verifies the caller is an active Admin on the server.
      // Do NOT grant broad UPDATE access to app_accounts for this operation.
      const {data:response,error}=await sb.rpc('ktx_admin_update_contact_v321',{
        p_user_id:id,p_job_title:position,p_phone:phone
      });
      if(error)throw new Error('Không lưu được Chức danh/SĐT lên Supabase: '+error.message+' (Kiểm tra SQL 01_UPDATE_CONTACT_ADMIN_ONLY.sql)');
      const data=Array.isArray(response)?response[0]:response;
      if(!data || String(data.user_id)!==String(id))throw new Error('Supabase chưa xác nhận ghi Chức danh/SĐT. Kiểm tra hàm quản trị.');
      const meta=readMeta();
      meta[String(id)]={position:data.job_title||'',phone:data.phone||''};
      writeMeta(meta);
      if(window.AUTHC&&Array.isArray(window.AUTHC.accounts)){
        window.AUTHC.accounts=window.AUTHC.accounts.map(a=>String(a.user_id)===String(id)?
          {...a,position:data.job_title||'',job_title:data.job_title||'',phone:data.phone||''}:a);
      }
      if(typeof window.authLoadAdminData==='function')await window.authLoadAdminData();
      return true;
    };
  }

  function authAccounts(){
    mergeAuthcAccountMeta();
    return Array.isArray(window.AUTHC&&window.AUTHC.accounts)?window.AUTHC.accounts.slice():[];
  }
  function byId(id){return authAccounts().find(a=>String(a.user_id)===String(id));}

  function acctRoleOptions(value){
    const roles=(window.ROLES&&typeof window.ROLES==='object')?window.ROLES:{admin:'Quản trị',manager:'Quản lý',staff:'Nhập liệu',guard:'Bảo vệ',viewer:'Chỉ xem'};
    return Object.entries(roles).map(([k,v])=>`<option value="${esc(k)}" ${String(value)===String(k)?'selected':''}>${esc(v)}</option>`).join('');
  }

  function renderRolePerms(){
    const el=$('ac140Perms');
    if(!el||!window.ROLE_PERMS)return;
    const rr=$('ac140EditRole')?.value||'viewer';
    const pr=window.ROLE_PERMS[rr]||{};
    const labels={view:'Xem dữ liệu',add:'Thêm hồ sơ',editw:'Sửa hồ sơ',transfer:'Chuyển phòng',residence:'Tạm trú',attendance:'Vào/Ra',del:'Xóa',restore:'Khôi phục',qrApprove:'Duyệt QR',import:'Nhập Excel',report:'Xuất báo cáo',backup:'Sao lưu',acct:'Quản lý tài khoản'};
    el.innerHTML=Object.entries(labels).map(([k,n])=>`<label><input type="checkbox" ${pr[k]?'checked':''} disabled>${esc(n)}</label>`).join('');
  }

  // V2.0.20 fix: render actual checkbox groups, not <option> inside a div.
  // Keep original saved values and use fallback if a location API returns [].
  function scopeChoices(values,selected){
    const chosen=Array.isArray(selected)?selected.map(x=>String(x).trim()):[];
    const items=[...new Set([...(Array.isArray(values)?values:[]),...chosen].map(x=>String(x||'').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
    return items.map(value=>{
      const label=document.createElement('label');label.className='ac140-scope-choice';
      const input=document.createElement('input');input.type='checkbox';input.value=value;
      input.checked=chosen.includes(value);
      const text=document.createElement('span');text.textContent=value;
      label.append(input,text);return label;
    });
  }
  function selectedScope(id){
    const node=$(id);
    return node?Array.from(node.querySelectorAll('input[type="checkbox"]:checked')).map(input=>input.value):[];
  }

  // V2.0.20: Bulk select/deselect for KTX and Day without changing the
  // underlying saved scope representation or server-side permissions.
  function installScopeSelectAll(gridId, toggleId, textLabel){
    const grid=$(gridId);
    if(!grid)return;
    const options=Array.from(grid.querySelectorAll('input[type="checkbox"]'));
    const old=grid.parentElement?.querySelector('[data-scope-select-all="'+gridId+'"]');
    if(old)old.remove();
    if(!options.length)return;
    // A real button with checkbox-style indicator avoids global modal label/input
    // styling and native label double-toggle. The whole row is clickable.
    const toolbar=document.createElement('button');
    toolbar.type='button';
    toolbar.id=toggleId;
    toolbar.dataset.scopeSelectAll=gridId;
    toolbar.className='ac256-select-all-toolbar';
    const mark=document.createElement('span');
    mark.className='ac256-select-all-mark';
    mark.setAttribute('aria-hidden','true');
    const caption=document.createElement('span');
    caption.className='ac256-select-all-caption';
    caption.textContent=textLabel;
    const count=document.createElement('small');
    count.className='ac256-select-all-count';
    toolbar.append(mark,caption,count);
    grid.parentElement.insertBefore(toolbar,grid);
    const sync=()=>{
      const selected=options.filter(option=>option.checked).length;
      const all=selected===options.length;
      toolbar.setAttribute('aria-pressed',String(all));
      toolbar.dataset.partial=selected>0&&!all?'true':'false';
      mark.textContent=all?'✓':selected>0?'−':'';
      count.textContent=selected+'/'+options.length;
    };
    toolbar.addEventListener('click',event=>{
      event.preventDefault();
      const next=!options.every(option=>option.checked);
      options.forEach(option=>{
        if(!option.disabled && option.checked!==next){
          option.checked=next;
          option.dispatchEvent(new Event('change',{bubbles:true}));
        }
      });
      sync();
    });
    grid.addEventListener('change',event=>{
      if(event.target.matches('input[type="checkbox"]'))sync();
    });
    sync();
  }

  function scopeOptions(a){
    const api=window.KTX_LOCATION_DROPDOWN_V2076;
    const savedKtx=Array.isArray(a.ktx)?a.ktx:[];
    const savedDays=Array.isArray(a.days)?a.days:[];
    let kt=[...savedKtx,'KTX 1','KTX 2'];
    if(api&&typeof api.ktxList==='function'){
      try{
        const found=api.ktxList();
        if(Array.isArray(found)&&found.length)kt=found.concat(savedKtx);
      }catch(err){console.warn('KTX_EDITOR_LOCATION_LIST',err)}
    }
    let days=Array.from({length:6},(_,i)=>'Dãy '+(i+1));
    if(api&&typeof api.dayList==='function'){
      try{
        const found=kt.flatMap(site=>{
          const result=api.dayList(site);
          return Array.isArray(result)?result:[];
        });
        if(found.length)days=found;
      }catch(err){console.warn('KTX_EDITOR_DAY_LIST',err)}
    }
    return {ktx:[...new Set(kt)],days:[...new Set(days.concat(savedDays))]};
  }

  function ensureAccountEnhancements(){
    mergeAuthcAccountMeta();
    const acc=$('acc');
    if(!acc) return;

    // Stage 58: Keep the account header clean. The org-chart entry is available
    // from the left navigation and Overview, not in the account action toolbar.
    const top=acc.querySelector('.ac140-top');
    if(top){
      const oldOrg=top.querySelector('#ac256OrgChart');
      if(oldOrg)oldOrg.remove();
      const create=top.querySelector('#ac140Create');
      if(create){
        create.textContent='+ Tạo tài khoản nhân viên';
        create.style.marginLeft='auto';
        create.style.order='2';
        if(create!==top.lastElementChild)top.appendChild(create);
      }
    }

    acc.querySelectorAll('[data-ac140-edit]').forEach(button=>{
      const id=button.dataset.ac140Edit;
      const a=byId(id);
      if(!a)return;
      const row=button.closest('tr');
      const cell=row&&row.children&&row.children[0];
      if(cell && !cell.querySelector('.ac256-account-meta')){
        const wrap=document.createElement('div');
        wrap.className='ac256-account-meta';
        wrap.innerHTML=`<small><b>Chức danh:</b> ${esc(a.position||'—')}</small><small><b>SĐT:</b> ${esc(a.phone||'—')}</small>`;
        cell.appendChild(wrap);
      }else if(cell){
        const sm=cell.querySelector('.ac256-account-meta');
        if(sm)sm.innerHTML=`<small><b>Chức danh:</b> ${esc(a.position||'—')}</small><small><b>SĐT:</b> ${esc(a.phone||'—')}</small>`;
      }

      button.onclick=()=>openAccountEditor(id);
    });

    const modal=$('ac140Modal');
    const fields=modal&&modal.querySelector('.ac140-fields');
    if(fields && !$('ac256Position')){
      const pos=document.createElement('label');
      pos.innerHTML='Chức danh<input id="ac256Position" data-position placeholder="Ví dụ: Trưởng BQL KTX">';
      const phone=document.createElement('label');
      phone.innerHTML='SĐT<input id="ac256Phone" data-phone placeholder="Ví dụ: 0909.324.321">';
      const emailField=$('ac140Email')?.closest('label');
      if(emailField && emailField.nextSibling){
        fields.insertBefore(pos,emailField.nextSibling);
        fields.insertBefore(phone,pos.nextSibling);
      }else{
        fields.appendChild(pos);fields.appendChild(phone);
      }
    }
    const role=$('ac140EditRole');
    if(role)role.onchange=renderRolePerms;
    const save=$('ac140Save');
    if(save)save.onclick=saveEnhancedAccount;
    const closeBtn=$('ac140Close'),cancelBtn=$('ac140Cancel');
    if(closeBtn)closeBtn.onclick=()=>$('ac140Modal')?.close();
    if(cancelBtn)cancelBtn.onclick=()=>$('ac140Modal')?.close();
  }

  async function saveEnhancedAccount(){
    const modal=$('ac140Modal');
    const save=$('ac140Save');
    const selection=modal?.dataset?.selection;
    if(!selection || typeof window.saveAccountRow!=='function')return;
    const proxy=document.createElement('div');
    proxy.innerHTML='<select data-role></select><input data-enabled type="checkbox"><input data-ktx><input data-days><input data-position><input data-phone>';
    proxy.querySelector('[data-role]').innerHTML=acctRoleOptions($('ac140EditRole')?.value||'viewer');
    proxy.querySelector('[data-role]').value=$('ac140EditRole')?.value||'viewer';
    proxy.querySelector('[data-enabled]').checked=($('ac140Enabled')?.value||'true')==='true';
    proxy.querySelector('[data-ktx]').value=selectedScope('ac140Ktx').join(', ');
    proxy.querySelector('[data-days]').value=selectedScope('ac140Days').join(', ');
    proxy.querySelector('[data-position]').value=norm($('ac256Position')?.value);
    proxy.querySelector('[data-phone]').value=phoneNorm($('ac256Phone')?.value);
    try{
      save.disabled=true;
      const ok=await window.saveAccountRow(selection,proxy);
      if(ok!==true)throw Error('Supabase chưa xác nhận đã lưu dữ liệu.');
      modal.close();
      if(typeof window.accPage==='function')await window.accPage();
      alert('Đã lưu tài khoản thành công.');
    }catch(e){
      alert('Không lưu được tài khoản: '+(e.message||e));
    }finally{save.disabled=false}
  }

  function openAccountEditor(id){
    const a=byId(id);
    const modal=$('ac140Modal');
    if(!a||!modal)return;
    ensureAccountEnhancements();
    modal.dataset.selection=String(id);
    $('ac140Name').value=a.display_name||'';
    $('ac140Email').value=a.email||'';
    $('ac140EditRole').value=a.role||'viewer';
    $('ac140Enabled').value=String(a.enabled!==false);
    if($('ac256Position'))$('ac256Position').value=a.position||a.job_title||'';
    if($('ac256Phone'))$('ac256Phone').value=a.phone||'';
    const k=$('ac140Ktx');
    const d=$('ac140Days');
    const available=scopeOptions(a);
    if(k){
      k.classList.add('ac140-checkbox-grid');
      k.replaceChildren(...scopeChoices(available.ktx,a.ktx));
    }
    if(d){
      d.classList.add('ac140-checkbox-grid');
      d.replaceChildren(...scopeChoices(available.days,a.days));
    }
    installScopeSelectAll('ac140Ktx','ac256SelectAllKtx','Chọn tất cả KTX');
    installScopeSelectAll('ac140Days','ac256SelectAllDays','Chọn tất cả Dãy');
    renderRolePerms();
    if(!modal.open)modal.showModal();
  }

  function pickLeader(accounts){
    const score=a=>{
      const title=String(a.position||'').toLowerCase();
      let s=0;
      if(/trưởng\s*bql|trưởng\s*ban|trưởng|giám\s*đốc|chief|head/.test(title))s+=120;
      if(/phó/.test(title))s+=60;
      if(a.role==='admin')s+=80;
      if(a.role==='manager')s+=55;
      if(a.enabled!==false)s+=10;
      return s;
    };
    return accounts.slice().sort((a,b)=>score(b)-score(a)||String(a.display_name||'').localeCompare(String(b.display_name||''),'vi'))[0];
  }

  function collectOrgData(sourceAccounts){
    const active=(Array.isArray(sourceAccounts)?sourceAccounts:authAccounts()).filter(a=>a && a.enabled!==false && a.role!=='viewer' && a.role!=='vault_only').map(a=>({...a,position:a.position||a.job_title||'',phone:a.phone||''}));
    if(!active.length)return {leader:null,groups:[]};
    const leader=pickLeader(active)||active[0];
    const rest=active.filter(a=>String(a.user_id)!==String(leader.user_id));
    const map=new Map();
    rest.forEach(a=>{
      const key=(Array.isArray(a.ktx)&&a.ktx[0])||'Ban quản lý chung';
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(a);
    });
    if(!map.size)map.set((Array.isArray(leader.ktx)&&leader.ktx[0])||'Ban quản lý chung',[]);
    const groups=[...map.entries()].map(([name,members])=>({
      name,
      members:members.sort((x,y)=>{const rank=a=>/quản\s*lý\s*khu/i.test(a.position||'')?0:/giám\s*sát/i.test(a.position||'')?2:1;return rank(x)-rank(y)||String(x.display_name||'').localeCompare(String(y.display_name||''),'vi');})
    })).sort((a,b)=>String(a.name).localeCompare(String(b.name),'vi',{numeric:true}));
    return {leader,groups};
  }

  function roundRect(ctx,x,y,w,h,r,fill,stroke){
    const rr=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
  }
  function drawTextLines(ctx,text,x,y,maxWidth,lineHeight,color,font,maxLines,align='center'){
    ctx.fillStyle=color;
    ctx.font=font;
    ctx.textAlign=align;
    ctx.textBaseline='top';
    const words=String(text||'').split(/\s+/).filter(Boolean);
    if(!words.length)return y;
    const lines=[]; let line='';
    words.forEach(word=>{
      const test=line?line+' '+word:word;
      if(ctx.measureText(test).width<=maxWidth || !line){line=test;return;}
      lines.push(line); line=word;
    });
    if(line)lines.push(line);
    const cut=(maxLines&&lines.length>maxLines)?lines.slice(0,maxLines):lines;
    cut.forEach((ln,idx)=>ctx.fillText(ln,x,y+idx*lineHeight));
    return y+cut.length*lineHeight;
  }

  // Stage 60: Canvas organizational poster with vector icons and print-ready detail.
  function org60Person(ctx,cx,cy,size,color){
    ctx.save();ctx.translate(cx,cy);ctx.fillStyle=color;
    ctx.beginPath();ctx.arc(0,-size*.25,size*.19,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(-size*.35,size*.38);ctx.quadraticCurveTo(-size*.35,size*.08,-size*.13,size*.04);
    ctx.lineTo(-size*.07,size*.14);ctx.lineTo(0,size*.26);ctx.lineTo(size*.07,size*.14);ctx.lineTo(size*.13,size*.04);
    ctx.quadraticCurveTo(size*.35,size*.08,size*.35,size*.38);ctx.closePath();ctx.fill();ctx.restore();
  }
  function org60Phone(ctx,x,y,sz,color){
    ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=sz*.115;
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(-sz*.31,-sz*.31);ctx.bezierCurveTo(-sz*.5,-sz*.12,-sz*.12,sz*.39,sz*.23,sz*.37);
    ctx.quadraticCurveTo(sz*.43,sz*.28,sz*.33,sz*.14);ctx.lineTo(sz*.16,sz*.03);
    ctx.quadraticCurveTo(sz*.08,-sz*.03,sz*.01,sz*.06);ctx.quadraticCurveTo(-sz*.13,-sz*.05,-sz*.18,-sz*.17);
    ctx.quadraticCurveTo(-sz*.07,-sz*.24,-sz*.14,-sz*.31);ctx.lineTo(-sz*.24,-sz*.4);
    ctx.quadraticCurveTo(-sz*.28,-sz*.43,-sz*.31,-sz*.31);ctx.stroke();ctx.restore();
  }
  function org60Gradient(ctx,x,y,w,h,top,bottom){
    const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);return g;
  }
  function org60Shadow(ctx,blur=14,dy=5){ctx.shadowColor='rgba(25,57,105,.13)';ctx.shadowBlur=blur;ctx.shadowOffsetY=dy;}
  function org60Text(ctx,str,x,y,maxWidth,font,color,maxLines=1,lineH=23){
    const words=String(str||'—').trim().split(/\s+/).filter(Boolean);
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font;ctx.fillStyle=color;
    let lines=[],line='';
    for(const word of words){const trial=line?line+' '+word:word;
      if(ctx.measureText(trial).width>maxWidth&&line){lines.push(line);line=word;}else line=trial;}
    if(line)lines.push(line);
    if(lines.length>maxLines){lines=lines.slice(0,maxLines);const n=maxLines-1;
      while(ctx.measureText(lines[n]+'…').width>maxWidth&&lines[n].length>2)lines[n]=lines[n].slice(0,-1);
      lines[n]+='…';}
    const first=y-(lines.length-1)*lineH/2;
    lines.forEach((t,i)=>ctx.fillText(t,x,first+i*lineH));
  }
  function org60PersonBadge(ctx,cx,cy,r,dark=false){
    ctx.save();ctx.shadowColor='rgba(4,24,62,.15)';ctx.shadowBlur=5;ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.restore();
    org60Person(ctx,cx,cy,r*1.55,dark?'#173d74':'#13497f');
  }
  function org60Member(ctx,m,x,y,w,h){
    ctx.save();org60Shadow(ctx,13,4);roundRect(ctx,x,y,w,h,18,'#fff','#147a39');ctx.restore();
    const headH=90;
    ctx.save();ctx.beginPath();ctx.moveTo(x+18,y);ctx.lineTo(x+w-18,y);ctx.quadraticCurveTo(x+w,y,x+w,y+18);
    ctx.lineTo(x+w,y+headH);ctx.lineTo(x,y+headH);ctx.lineTo(x,y+18);ctx.quadraticCurveTo(x,y,x+18,y);ctx.closePath();ctx.clip();
    ctx.fillStyle=org60Gradient(ctx,x,y,w,headH,'#119b43','#066a33');ctx.fillRect(x,y,w,headH);ctx.restore();
    ctx.fillStyle='#dcf68a';ctx.beginPath();ctx.moveTo(x+2,y+headH-7);ctx.quadraticCurveTo(x+w*.48,y+headH+9,x+w-2,y+headH-7);
    ctx.lineTo(x+w-2,y+headH-1);ctx.quadraticCurveTo(x+w*.5,y+headH+18,x+2,y+headH-1);ctx.closePath();ctx.fill();
    org60PersonBadge(ctx,x+51,y+47,30);
    const name=m.display_name||m.email||'Chưa có tên';
    org60Text(ctx,name,x+(w+68)/2,y+46,w-108,'700 19px "Be Vietnam Pro",Arial,sans-serif','#fff',2,23);
    ctx.fillStyle=org60Gradient(ctx,x,y+headH+8,w,44,'#f4ffe8','#e3f3d1');ctx.fillRect(x+2,y+headH+8,w-4,42);
    org60Text(ctx,m.position||m.job_title||'Chưa cập nhật chức danh',x+w/2,y+headH+28,w-18,'700 15px "Be Vietnam Pro",Arial,sans-serif','#153a75',2,18);
    ctx.fillStyle='#fff';ctx.fillRect(x+2,y+headH+51,w-4,h-headH-54);
    ctx.fillStyle='#188c39';ctx.beginPath();ctx.arc(x+35,y+h-25,17,0,Math.PI*2);ctx.fill();
    org60Phone(ctx,x+35,y+h-25,22,'#fff');
    org60Text(ctx,m.phone||'Chưa cập nhật SĐT',x+(w+48)/2,y+h-25,w-64,'700 17px Arial,sans-serif','#123366',1,20);
  }
  function org60Leader(ctx,leader,x,y,w,h){
    ctx.save();org60Shadow(ctx,18,5);roundRect(ctx,x,y,w,h,24,'#fff','#1456a4');ctx.restore();
    ctx.save();ctx.beginPath();ctx.roundRect(x+4,y+4,w-8,h-8,21);ctx.clip();
    ctx.fillStyle=org60Gradient(ctx,x,y,w,h,'#178ded','#063577');ctx.fillRect(x+4,y+4,w-8,h-8);ctx.restore();
    ctx.strokeStyle='#d9ecff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+9,y+9,w-18,h-18,17);ctx.stroke();
    org60PersonBadge(ctx,x+89,y+h/2,55,true);
    ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+162,y+22);ctx.lineTo(x+162,y+h-22);ctx.stroke();
    const c=x+(w+162)/2, tw=w-200;
    org60Text(ctx,leader?.position||'TRƯỞNG BAN QUẢN LÝ KTX',c,y+38,tw,'700 21px "Be Vietnam Pro",Arial,sans-serif','#e2edff',2,22);
    org60Text(ctx,leader?.display_name||'CHƯA CÓ THÔNG TIN',c,y+83,tw,'800 33px "Be Vietnam Pro",Arial,sans-serif','#ffffff',2,34);
    ctx.fillStyle='#f7e77e';org60Text(ctx,leader?.phone||'Chưa cập nhật SĐT',c+16,y+h-29,tw-42,'800 23px Arial,sans-serif','#ffe76a',1,22);
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.arc(c-tw*.42,y+h-29,18,0,Math.PI*2);ctx.fill();
    org60Phone(ctx,c-tw*.42,y+h-29,24,'#fff');
  }
  function org60Wave(ctx,width,height){
    ctx.save();const y=height-72;ctx.fillStyle='#daefff';ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(width*.2,y-45,width*.53,y+90,width,y-12);ctx.lineTo(width,height);ctx.lineTo(0,height);ctx.fill();
    ctx.fillStyle=org60Gradient(ctx,0,y+20,width,80,'#25baff','#0076df');ctx.beginPath();ctx.moveTo(0,y+25);ctx.bezierCurveTo(width*.2,y+2,width*.53,y+108,width,y+25);ctx.lineTo(width,height);ctx.lineTo(0,height);ctx.fill();ctx.restore();
  }
  // Stage 62: Load the logo already used by the application, not a drawn approximation.
  let org62Logo=null;
  let org62LogoPromise=null;
  function org62LogoSource(){
    const current=document.querySelector('nav .brand img')||document.querySelector('.brand .logo img');
    const url=current?.currentSrc||current?.src||'/assets/img/brand/ktx-logo.png';
    try{
      const u=new URL(url,location.href);
      // Only same-origin or safe local data images may be drawn into an exportable canvas.
      if(u.origin!==location.origin && !url.startsWith('data:image/'))return '/assets/img/brand/ktx-logo.png';
    }catch(_){return '/assets/img/brand/ktx-logo.png'}
    return url;
  }
  async function org62LoadLogo(){
    const src=org62LogoSource();
    if(org62Logo && org62Logo.src===src && org62Logo.complete)return org62Logo;
    if(org62LogoPromise && org62LogoPromise.src===src)return org62LogoPromise.promise;
    const load=url=>new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('Không tải được logo'));
      img.src=url;
    });
    const promise=load(src).catch(()=>src==='/assets/img/brand/ktx-logo.png'?null:load('/assets/img/brand/ktx-logo.png').catch(()=>null));
    org62LogoPromise={src,promise};
    org62Logo=await promise;
    return org62Logo;
  }

  let orgChartCampus=null;
  async function orgChartLoadCampus(){
    if(orgChartCampus?.naturalWidth)return orgChartCampus;
    try{
      const im=new Image();
      im.src='/assets/img/brand/ktx-campus-hero.webp';
      await im.decode();orgChartCampus=im;
    }catch(_){orgChartCampus=null;}
    return orgChartCampus;
  }

  // Organization: structural branches follow job titles; KTX and day groups are an assignment detail.
  // No demo personnel or numbers: every card comes from live app_accounts.
  // The directory is refreshed from Supabase. Viewer-only users are NOT BQL staff.
  function orgIsViewerRole(role){
    const value=String(role||'').trim().normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase()
      .replace(/[\s-]+/g,'_');
    return ['viewer','vault_only','read_only','readonly','view_only','chi_xem'].includes(value);
  }
  function orgApprovedAccounts(accounts){
    return (Array.isArray(accounts)?accounts:[]).filter(a=>
      a && a.enabled!==false && !orgIsViewerRole(a.role));
  }
  function orgStructureData(accounts){
    const eligible=orgApprovedAccounts(accounts);
    const leader=eligible.find(a=>/trưởng\s*(bql|ban\s*quản\s*lý)/i.test(a.position||a.job_title||''))||pickLeader(eligible);
    const other=eligible.filter(a=>a!==leader);
    const technical=other.filter(a=>/kỹ\s*thuật/i.test(a.position||a.job_title||''));
    const medical=other.filter(a=>/y\s*tế/i.test(a.position||a.job_title||''));
    const specialist=other.filter(a=>!technical.includes(a)&&!medical.includes(a));
    const byKtx={one:[],two:[],general:[]};
    const names=a=>(Array.isArray(a.ktx)?a.ktx:[a.ktx]).map(v=>String(v||'').toLowerCase());
    specialist.forEach(a=>{
      // A user assigned every KTX and every Day is explicitly Quản lý chung.
      // Use the same normalized-scope predicate as the trích ngang table.
      if(isGeneralManagementScope(a)){
        byKtx.general.push(a);
        return;
      }
      const k=normalizedScopeCodes(a.ktx,'ktx');
      const is1=k.includes(1),is2=k.includes(2);
      if(is1&&!is2)byKtx.one.push(a);
      else if(is2&&!is1)byKtx.two.push(a);
      else byKtx.general.push(a);
    });
    return {leader,technical,medical,specialist,byKtx,total:eligible.length};
  }
  // One canonical chart renderer for preview, printed page and downloaded PNG.
  // Uses actual active account data and the existing application logo.
  // One chart renderer for preview, PNG export and printing. Staff data are live.
  // Style is matched to the approved blue/gold organizational-chart reference.
  // V4: One-screen horizontal layout; same canvas is exported at full resolution.
  // KTX 2 uses a two-column card grid so all 14 current personnel fit on one page.
  // KTX Org Chart V5: approved blue/gold visual design, data-driven.
  // One canvas is used for screen preview, downloaded PNG and printing.
  function renderOrgCanvas(canvas, sourceAccounts){
    const data=orgStructureData(sourceAccounts);
    const groups=[
      {title:'KTX 1',members:data.byKtx.one,color:'#145ca8',light:'#d9edff',cols:1},
      {title:'KTX 2',members:data.byKtx.two,color:'#0b925b',light:'#d9f8e6',cols:2},
      {title:'QUẢN LÝ CHUNG',members:data.byKtx.general,color:'#a46915',light:'#fff0c4',cols:1}
    ];
    const W=1800, S=2;
    const maxRows=Math.max(2,...groups.map(g=>Math.ceil(g.members.length/g.cols)),
      data.technical.length,data.medical.length);
    const cardH=100, cardGap=11, bodyTop=455, headingH=62;
    const bodyH=headingH+18+maxRows*(cardH+cardGap)+18;
    const footY=bodyTop+bodyH+24,H=footY+112;
    canvas.width=W*S;canvas.height=H*S;
    canvas.style.maxWidth='100%';
    const c=canvas.getContext('2d');c.setTransform(S,0,0,S,0,0);
    const font='"Be Vietnam Pro",Arial,sans-serif';
    const grad=(x,y,w,h,a,b,diagonal=false)=>{
      const g=c.createLinearGradient(x,y,diagonal?x+w:x,diagonal?y+h:y+h);
      g.addColorStop(0,a);g.addColorStop(1,b);return g;
    };
    const rounded=(x,y,w,h,r,fill,stroke='',sw=2)=>{
      c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
      if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke();}
    };
    const label=(s,x,y,size,color='#143a72',weight=800,width=1000,align='center')=>{
      c.save();c.font=`${weight} ${size}px ${font}`;c.textAlign=align;
      c.textBaseline='middle';c.fillStyle=color;c.fillText(String(s??''),x,y,width);c.restore();
    };
    const shadow=(fn)=>{c.save();c.shadowColor='rgba(8,47,98,.17)';c.shadowBlur=13;c.shadowOffsetY=4;fn();c.restore();};
    const icon=(x,y,size)=>org60Person(c,x,y,size,'#0b5b9f');
    const line=(pts)=>{c.beginPath();c.moveTo(...pts[0]);pts.slice(1).forEach(pt=>c.lineTo(...pt));c.lineWidth=5;c.lineCap='round';c.lineJoin='round';c.strokeStyle='#1465b8';c.stroke();};
    // Full poster background and compact gold-accented header.
    c.fillStyle=grad(0,0,W,H,'#eef8ff','#fff');c.fillRect(0,0,W,H);
    if(orgChartCampus?.naturalWidth){
      c.save();c.globalAlpha=.10;c.drawImage(orgChartCampus,0,155,400,220);
      c.translate(W,0);c.scale(-1,1);c.drawImage(orgChartCampus,0,155,400,220);c.restore();
    }
    rounded(0,0,W,150,0,grad(0,0,W,150,'#0879c8','#07316c',true));
    c.fillStyle='#f8d477';c.fillRect(0,148,W,5);
    // Display exactly the same KTX logo that is already loaded in this application.
    rounded(29,18,300,112,17,'rgba(255,255,255,.96)','#a2ccef',2);
    // V41: Keep the logo graphic and organization title in independent areas;
    // the previous centered 174px text area could overlap the 88px icon.
    if(org62Logo?.naturalWidth){
      const im=org62Logo, scale=Math.min(83/im.naturalWidth,83/im.naturalHeight);
      const dw=im.naturalWidth*scale,dh=im.naturalHeight*scale;
      c.drawImage(im,43+(83-dw)/2,32+(83-dh)/2,dw,dh);
    }
    c.strokeStyle='#b8d7f3';c.lineWidth=2;c.beginPath();c.moveTo(140,36);c.lineTo(140,112);c.stroke();
    label('KTX HÓC MÔN',231,63,23,'#083d80',900,178);
    label('QUẢN LÝ KÝ TÚC XÁ',231,94,14,'#406b9a',730,178);
    label('SƠ ĐỒ TỔ CHỨC',1125,52,49,'#fff',900,1130);
    label('BAN QUẢN LÝ KTX HÓC MÔN',1125,109,43,'#ffe19c',900,1130);
    // Compact leader, with the actual phone value from the account record.
    shadow(()=>rounded(568,170,664,134,23,grad(568,170,664,134,'#188fe0','#073f86',true),'#e6ba47',4));
    rounded(589,187,98,99,18,'rgba(255,255,255,.16)');icon(638,235,90);
    c.strokeStyle='#b8e6ff';c.lineWidth=2;c.beginPath();c.moveTo(708,190);c.lineTo(708,287);c.stroke();
    label('TRƯỞNG BQL KTX',976,198,23,'#e3f2ff',820,480);
    label(data.leader?.display_name||'Chưa cập nhật',976,242,36,'#fff',900,480);
    label('☎  '+(data.leader?.phone||'Chưa cập nhật SĐT'),976,282,21,'#ffe4a4',790,480);
    // Draw only departments with active staff. A viewer-only Technical user must
    // disappear from the chart entirely (not leave a KỸ THUẬT (0) header).
    const hasTechnical=data.technical.length>0;
    const hasMedical=data.medical.length>0;
    const technicalX=hasMedical?1210:1360;
    const medicalX=hasTechnical?1504:1360;
    const branchCenters=[611];
    if(hasTechnical)branchCenters.push(technicalX+141);
    if(hasMedical)branchCenters.push(medicalX+136);
    line([[900,304],[900,334]]);
    line([[Math.min(...branchCenters),334],[Math.max(...branchCenters),334]]);
    branchCenters.forEach(x=>line([[x,334],[x,355]]));
    const department=(x,w,text)=>{
      shadow(()=>rounded(x,355,w,73,16,grad(x,355,w,73,'#1687dc','#073c80',true),'#e5bf60',3));
      label(text,x+w/2,391,w>600?29:25,'#fff',870,w-22);
    };
    department(24,1174,`CHUYÊN VIÊN QLNO CBNV (${data.specialist.length} người)`);
    if(hasTechnical)department(technicalX,282,`KỸ THUẬT (${data.technical.length})`);
    if(hasMedical)department(medicalX,272,`Y TẾ (${data.medical.length})`);
    // V41: short downward connectors from department headers to their personnel.
    // Tips are just above the cards, preserving the chart's existing spacing.
    const downArrow=(center)=>{
      c.save();c.strokeStyle='#1769b7';c.fillStyle='#e93339';c.lineWidth=4;
      c.beginPath();c.moveTo(center,429);c.lineTo(center,bodyTop-13);c.stroke();
      c.beginPath();c.moveTo(center-10,bodyTop-13);c.lineTo(center+10,bodyTop-13);
      c.lineTo(center,bodyTop+1);c.closePath();c.fill();c.restore();
    };
    if(data.specialist.length)downArrow(611);
    if(hasTechnical)downArrow(technicalX+141);
    if(hasMedical)downArrow(medicalX+136);
    // Group widths: 285 | 545 | 306. KTX 2 gets 2 columns to avoid a tall fifth row.
    shadow(()=>rounded(24,bodyTop,1174,bodyH,18,'rgba(255,255,255,.92)','#b2d9f5',2));
    const positions=[{x:34,w:280},{x:326,w:545},{x:883,w:305}];
    groups.forEach((g,i)=>{
      const {x,w}=positions[i];
      rounded(x,bodyTop+10,w,bodyH-19,16,'#fff',g.color,2);
      rounded(x,bodyTop+10,w,headingH,15,g.light);
      label(`${g.title} (${g.members.length})`,x+w/2,bodyTop+42,24,g.color,880,w-16);
      const cg=8,pad=9,innerW=(w-pad*2-cg*(g.cols-1))/g.cols;
      g.members.forEach((person,j)=>{
        const row=Math.floor(j/g.cols),col=j%g.cols;
        const bx=x+pad+col*(innerW+cg),by=bodyTop+headingH+16+row*(cardH+cardGap);
        shadow(()=>rounded(bx,by,innerW,cardH,13,'#fff','#accfee',1.5));
        rounded(bx+8,by+10,43,43,10,'#e8f4ff');icon(bx+29,by+31,48);
        const textX=bx+innerW/2+22;
        label(person.display_name||'Chưa cập nhật',textX,by+24,g.cols===2?17:20,'#0d3973',840,innerW-60);
        const ds=(g.title==='QUẢN LÝ CHUNG'||isGeneralManagementScope(person))
          ?'Quản lý chung'
          :Array.isArray(person.days)&&person.days.length?person.days.join(', ')
          :(person.role==='admin'?'Quản trị':'CV QLNO CBNV');
        label(ds,textX,by+52,16,g.color,760,innerW-60);
        label('☎ '+(person.phone||'Chưa cập nhật SĐT'),bx+innerW/2,by+81,16,'#24466e',700,innerW-10);
      });
    });
    const auxiliary=(members,x,w)=>{
      if(!members.length)return;
      // V43: wrap Technical / Medical members in a dedicated framed body,
      // matching the grouped presentation used in the specialist section.
      shadow(()=>rounded(x,bodyTop,w,bodyH,18,'rgba(255,255,255,.92)','#b2d9f5',2));
      const insetX=x+8, cardW=w-16;
      members.forEach((person,j)=>{
        const y=bodyTop+11+j*(cardH+cardGap);
        shadow(()=>rounded(insetX,y,cardW,cardH,14,'#fff','#aacde8',2));
        rounded(insetX+10,y+11,44,44,11,'#e4f1ff');icon(insetX+32,y+33,52);
        label(person.display_name||'Chưa cập nhật',insetX+cardW/2+19,y+27,19,'#103e78',850,cardW-65);
        label('☎ '+(person.phone||'Chưa cập nhật SĐT'),insetX+cardW/2,y+74,17,'#355d86',730,cardW-12);
      });
    };
    if(hasTechnical)auxiliary(data.technical,technicalX,282);
    if(hasMedical)auxiliary(data.medical,medicalX,272);
    // The count is always computed from the current live account list.
    shadow(()=>rounded(365,footY,1070,66,30,grad(365,footY,1070,66,'#1487d6','#07417d',true),'#edc76b',3));
    label(`TỔNG CỘNG: ${data.total} NHÂN SỰ`,900,footY+34,32,'#fff',900,990);
    label('Không bao gồm nhân viên có vai trò “Chỉ xem” · Điện thoại theo tài khoản hiện có',900,footY+89,18,'#567da0',650,1450);
    c.fillStyle='#52bdf1';c.fillRect(0,H-9,W,6);
    c.fillStyle='#0b6eb8';c.fillRect(0,H-3,W,3);
    return {width:W,height:H};
  }


  function ensureDialog(){
    let dlg=$(DIALOG_ID);
    if(dlg){
      // Old releases can keep a mounted dialog with its obsolete work-allocation button.
      dlg.querySelectorAll('button').forEach(b=>{
        if(/sơ đồ bố trí công việc/i.test(b.textContent||'') || /org.*(work|assign|mode)/i.test(b.id||''))b.remove();
      });
      return dlg;
    }
    dlg=document.createElement('dialog');
    dlg.id=DIALOG_ID;
    dlg.className='org256-dialog';
    dlg.innerHTML=`<div class="org256-shell"><div class="org256-head"><div><h3>Sơ đồ tổ chức BQL KTX</h3><p>Xuất sơ đồ từ danh sách tài khoản để xem, in và tải file ảnh PNG.</p></div><div class="org256-actions"><button type="button" class="btn s" id="org256Refresh">Làm mới</button><button type="button" class="btn s" id="org256ExportList">Xuất DS trích ngang CBNV</button><button type="button" class="btn s" id="org256Download">Tải PNG</button><button type="button" class="btn s" id="org256Print">In sơ đồ</button><button type="button" class="btn" id="org256Close">Đóng</button></div></div><div class="org256-body"><div id="org256Status" role="status" aria-live="polite" style="padding:8px 12px;color:#244d7f;font-size:13px;font-weight:600"></div><div class="org256-preview"><div id="org266MobileCards" class="org266-mobile-cards" aria-label="Sơ đồ tổ chức trên Mobile" hidden></div><canvas id="org256Canvas"></canvas></div></div></div>`;
    document.body.appendChild(dlg);
    $('org256Close').onclick=()=>dlg.close();
    $('org256Refresh').onclick=()=>refreshOrgChart();
    $('org256ExportList').onclick=()=>openStaffProfileReport();
    $('org256Download').onclick=()=>downloadOrgChart();
    $('org256Print').onclick=()=>printOrgChart();
    return dlg;
  }


  // Stage 66: Phone-sized, genuinely responsive organizational layout.
  // Desktop and PNG export continue to use the original high-resolution canvas.
  function renderMobileOrgCards(accounts){
    const host=$('org266MobileCards');
    if(!host)return;
    const {leader,groups}=collectOrgData(accounts);
    const phoneMark='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.8l-1.8 1.8a16 16 0 0 0 6.8 6.8l1.8-1.8a2 2 0 0 1 1.8-.6l2.8.4a2 2 0 0 1 1.7 2z"/></svg>';
    const avatar='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/></svg>';
    const phone=a=>{
      const value=norm(a.phone||'');
      return `<span class="org266-phone">${phoneMark}<span>${esc(value||'Chưa cập nhật SĐT')}</span></span>`;
    };
    const memberCard=a=>`<article class="org266-member"><div class="org266-member-top"><span class="org266-avatar">${avatar}</span><div class="org266-member-name">${esc(a.display_name||a.email||'Chưa có tên')}</div></div><div class="org266-position">${esc(a.position||a.job_title||'Chưa cập nhật chức danh')}</div><div class="org266-member-foot">${phone(a)}</div></article>`;
    const groupsHTML=groups.map(group=>`<section class="org266-group"><h4>${esc(group.name)}</h4><div class="org266-member-grid">${group.members.length?group.members.map(memberCard).join(''):'<p class="org266-empty">Chưa có nhân sự trong nhóm</p>'}</div></section>`).join('');
    host.innerHTML=`<div class="org266-mobile-title"><span>SƠ ĐỒ BAN QUẢN LÝ</span><strong>KTX HÓC MÔN</strong></div>${leader?`<div class="org266-leader"><div class="org266-leader-head">${avatar}<span>${esc(leader.position||leader.job_title||'TRƯỞNG BAN QUẢN LÝ KTX')}</span></div><div class="org266-leader-name">${esc(leader.display_name||leader.email||'Chưa có tên')}</div>${phone(leader)}</div>`:''}<div class="org266-connector" aria-hidden="true"><span></span></div>${groupsHTML||'<p class="org266-empty">Chưa có nhân sự cấp dưới</p>'}`;
    host.hidden=false;
  }

  let org256Ready=false;
  let org256Loading=false;
  function org256SetStatus(message,isError){
    const el=$('org256Status');
    if(el){el.textContent=message||'';el.style.color=isError?'#ad3146':'#244d7f';}
  }
  function org256SetExportReady(ready){
    org256Ready=!!ready;
    ['org256Download','org256Print'].forEach(id=>{const button=$(id);if(button)button.disabled=!org256Ready;});
  }
  async function refreshOrgChart(){
    if(org256Loading)return false;
    const cv=$('org256Canvas');
    if(!cv)return false;
    org256Loading=true;
    org256SetExportReady(false);
    org256SetStatus('Đang tải danh sách nhân sự từ Quản lý tài khoản…');
    const refreshBtn=$('org256Refresh');if(refreshBtn)refreshBtn.disabled=true;
    // Avoid showing an old or placeholder chart if account retrieval fails.
    const mobileCards=$('org266MobileCards');if(mobileCards){mobileCards.hidden=true;mobileCards.replaceChildren();}
    const context=cv.getContext('2d');
    if(context)context.clearRect(0,0,cv.width,cv.height);
    cv.width=1;cv.height=1;
    try{
      // Shared with Stage 59's staff export; this awaits auth refresh and
      // falls back to the app_accounts table when the local list is empty.
      const accounts=await loadStaffAccountsForExport();
      const active=orgApprovedAccounts(accounts);
      if(!active.length)throw new Error('Không có tài khoản đang hoạt động để vẽ sơ đồ. Hãy kiểm tra Quản lý tài khoản.');
      await Promise.all([org62LoadLogo(),orgChartLoadCampus()]);
      if(document.fonts?.ready)await document.fonts.ready;
      renderOrgCanvas(cv,active);
      // Keep the same approved chart for desktop/mobile and PNG/print.
      const legacyCards=$('org266MobileCards');
      if(legacyCards){legacyCards.hidden=true;legacyCards.replaceChildren();}
      org256SetExportReady(true);
      org256SetStatus(`Sơ đồ tổ chức · ${active.length} nhân sự (không bao gồm Chỉ xem).`,false);
      return true;
    }catch(err){
      console.error('KTX_ORG261_CHART_LOAD',err);
      org256SetStatus('Không thể tạo sơ đồ: '+(err.message||err),true);
      return false;
    }finally{
      org256Loading=false;
      if(refreshBtn)refreshBtn.disabled=false;
    }
  }

  // Confirm authentication with Supabase (not cached account/UI state).
  // The directory RPC also verifies auth.uid() and enabled server-side.
  async function ensureDirectorySignedIn(){
    const sb=typeof syncClient==='function'?syncClient():null;
    if(!sb?.auth?.getUser){alert('Vui lòng đăng nhập để xem thông tin nhân sự.');return false;}
    try{
      const {data,error}=await sb.auth.getUser();
      if(error || !data?.user?.id){
        clearOrgWindows();
        alert('Phiên đăng nhập chưa hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        return false;
      }
      if(window.SUPA_SYNC?.session?.user?.id &&
         window.SUPA_SYNC.session.user.id!==data.user.id){
        clearOrgWindows();
        alert('Tài khoản vừa thay đổi. Vui lòng tải lại phiên ứng dụng để tiếp tục.');
        return false;
      }
      return true;
    }catch(e){
      alert('Không xác minh được phiên đăng nhập. Vui lòng thử lại.');
      return false;
    }
  }

  async function openOrgChart(){
    if(!(await ensureDirectorySignedIn()))return;
    const dlg=ensureDialog();
    dlg.querySelectorAll('button').forEach(b=>{
      if(/sơ đồ bố trí công việc/i.test(b.textContent||''))b.remove();
    });
    if(!dlg.open)dlg.showModal();
    await refreshOrgChart();
  }

  function downloadOrgChart(){
    if(!org256Ready){alert('Chưa tải được dữ liệu sơ đồ. Hãy bấm Làm mới.');return;}
    const cv=$('org256Canvas'); if(!cv)return;
    const a=document.createElement('a');
    const d=new Date();
    const pad=n=>String(n).padStart(2,'0');
    a.download=`So_do_to_chuc_BQL_KTX_Hoc_Mon_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}.png`;
    a.href=cv.toDataURL('image/png');
    a.click();
  }

  function printOrgChart(){
    if(!org256Ready){alert('Chưa tải được dữ liệu sơ đồ. Hãy bấm Làm mới.');return;}
    const cv=$('org256Canvas'); if(!cv)return;
    const src=cv.toDataURL('image/png');
    const w=window.open('','_blank','width=1200,height=900');
    if(!w){alert('Trình duyệt đang chặn cửa sổ in.');return}
    w.document.write(`<!DOCTYPE html><html><head><title>In sơ đồ tổ chức</title><style>html,body{margin:0;padding:0;background:#fff}img{display:block;max-width:100%;width:100%;height:auto}@page{size:auto;margin:10mm}</style></head><body><img src="${src}" alt="Sơ đồ tổ chức"></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(()=>{w.print()},350);
  }


  /* Stage 59: always resolve the live account list before opening the export.
     The account page may be visible from an earlier render while AUTHC.accounts is empty. */
  // A dedicated SECURITY DEFINER RPC exposes only public staff-directory fields.
  // Never grant broad SELECT on app_accounts: the account-management table is admin-only.
  // Always reload from server to prevent old-user snapshots after account switching.
  async function loadStaffAccountsForExport(){
    const sb=typeof syncClient==='function'?syncClient():null;
    if(!sb?.auth?.getUser){
      throw new Error('Vui lòng đăng nhập để tải danh sách nhân sự.');
    }
    const {data:identity,error:identityError}=await sb.auth.getUser();
    if(identityError || !identity?.user?.id){
      throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    }
    const result=await sb.rpc('ktx_staff_directory_v320');
    if(result.error){
      throw new Error('Không tải được danh sách công khai nội bộ. Cần triển khai SQL 01_STAFF_DIRECTORY.sql trên Supabase: '+result.error.message);
    }
    const rows=Array.isArray(result.data)?result.data:[];
    // This returned shape is deliberately narrow and independent from AUTHC.accounts.
    // No caching across sessions; unrelated account-management data remains admin-only.
    return rows.map(a=>({
      user_id:a.user_id,display_name:a.display_name||'',position:a.position||a.job_title||'',
      job_title:a.job_title||a.position||'',phone:a.phone||'',personal_email:a.personal_email||'',
      role:a.role||'',ktx:Array.isArray(a.ktx)?a.ktx:[],
      days:Array.isArray(a.days)?a.days:[],enabled:a.enabled!==false
    }));
  }

  // Normalize RPC scope values without widening a partially assigned scope.
  // Only the exact complete KTX 1+2 and Day 1..6 set is "Quản lý chung".
  function normalizedScopeCodes(input,kind){
    const entries=Array.isArray(input)?input:[];
    const values=[];
    for(const item of entries){
      if(item===null||item===undefined)continue;
      const text=String(item).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
      const parts=text.split(/[,;|]+/).map(x=>x.trim()).filter(Boolean);
      for(const part of parts){
        const pattern=kind==='ktx'?/^(?:ktx|ky\s*tuc\s*xa)?\s*0*([12])$/:/^(?:day|d)?\s*0*([1-6])$/;
        const match=part.match(pattern);
        if(match)values.push(Number(match[1]));
      }
    }
    return [...new Set(values)];
  }
  function isGeneralManagementScope(a){
    const k=normalizedScopeCodes(a?.ktx,'ktx');
    const d=normalizedScopeCodes(a?.days,'days');
    return k.length===2 && [1,2].every(x=>k.includes(x))
      && d.length===6 && [1,2,3,4,5,6].every(x=>d.includes(x));
  }
  function buildStaffRows(accounts){
    const roles=(window.ROLES&&typeof window.ROLES==='object')?window.ROLES:{
      admin:'Quản trị',manager:'Quản lý',staff:'Nhập liệu',guard:'Bảo vệ',viewer:'Chỉ xem'};
    // Exclude read-only accounts from the staff directory, matching the chart.
    // Filtering here applies consistently to screen, print, and Excel export.
    return accounts.filter(a=>a && a.enabled!==false && !orgIsViewerRole(a.role))
      .sort((a,b)=>String(a.display_name||'').localeCompare(String(b.display_name||''),'vi'))
      .map((a,i)=>({
        stt:i+1,
        name:a.display_name||'',
        position:a.position||a.job_title||'',
        phone:a.phone||'',
        email:a.personal_email||'',
        role:roles[a.role]||a.role||'',
        ktx:isGeneralManagementScope(a)?'Quản lý chung':Array.isArray(a.ktx)?a.ktx.join(', '):'',
        days:isGeneralManagementScope(a)?'Quản lý chung':Array.isArray(a.days)?a.days.join(', '):'',
        status:a.enabled===false?'Đã khóa':'Hoạt động'
      }));
  }

  // Stage 72 — Staff list appears inside an in-app dialog, not in a new tab.
  // Uses the same verified Supabase account loader as the organizational chart.
  let staffListBusy=false;
  let lastStaffRows=[];
  function ensureStaffDialog(){
    let dlg=$('org272StaffDialog');
    if(dlg)return dlg;
    dlg=document.createElement('dialog');
    dlg.id='org272StaffDialog';
    dlg.className='org272-staff-dialog';
    dlg.setAttribute('aria-label','Danh sách trích ngang CBNV BQL KTX Hóc Môn');
    dlg.innerHTML=`<div class="org272-shell"><div class="org272-head"><div class="org272-heading"><h3>Danh sách trích ngang CBNV</h3><p>BQL KTX Hóc Môn · Thông tin theo danh sách tài khoản</p></div><div class="org272-actions"><button type="button" id="org272Refresh" class="btn s">Làm mới</button><button type="button" id="org272Excel" class="btn s" disabled>Xuất Excel</button><button type="button" id="org272Print" class="btn s" disabled>In danh sách</button><button type="button" id="org272Close" class="btn">Đóng</button></div></div><div class="org272-body"><div id="org272Status" class="org272-status" role="status" aria-live="polite">Đang tải danh sách…</div><div class="org272-list-wrap"><table class="org272-table"><thead><tr><th>STT</th><th>Họ và tên</th><th>Chức danh</th><th>SĐT</th><th>Email</th><th>Vai trò</th><th>KTX</th><th>Dãy</th><th>Trạng thái</th></tr></thead><tbody id="org272Rows"></tbody></table></div></div></div>`;
    document.body.appendChild(dlg);
    $('org272Close').addEventListener('click',()=>dlg.close());
    $('org272Refresh').addEventListener('click',()=>loadStaffDialogData());
    $('org272Excel').addEventListener('click',()=>exportStaffExcel());
    $('org272Print').addEventListener('click',()=>printStaffDialog());
    return dlg;
  }
  function staffRowCells(row){
    const values=[row.stt,row.name,row.position||'—',row.phone||'—',row.email||'—',row.role||'—',row.ktx||'—',row.days||'—',row.status];
    return '<tr>'+values.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>';
  }
  async function loadStaffDialogData(){
    if(staffListBusy)return;
    const dlg=ensureStaffDialog();
    staffListBusy=true;
    $('org272Print').disabled=true;
    $('org272Excel').disabled=true;
    $('org272Refresh').disabled=true;
    $('org272Rows').replaceChildren();
    $('org272Status').textContent='Đang tải dữ liệu nhân sự từ Quản lý tài khoản…';
    lastStaffRows=[];
    try{
      const accounts=await loadStaffAccountsForExport();
      if(!dlg.isConnected)return;
      const rows=buildStaffRows(accounts);
      lastStaffRows=rows;
      $('org272Rows').innerHTML=rows.map(staffRowCells).join('');
      $('org272Status').textContent='Tổng số nhân sự: '+rows.length+' · Cập nhật '+new Date().toLocaleString('vi-VN');
      $('org272Print').disabled=!rows.length;
      $('org272Excel').disabled=!rows.length;
    }catch(err){
      console.error('KTX_ORG272_LIST_LOAD',err);
      $('org272Status').textContent='Không tải được danh sách: '+(err.message||String(err));
    }finally{staffListBusy=false;$('org272Refresh').disabled=false;}
  }
  async function openStaffProfileReport(){
    if(!(await ensureDirectorySignedIn()))return;
    const dlg=ensureStaffDialog();
    if(!dlg.open)dlg.showModal();
    await loadStaffDialogData();
  }
  // Export only rows fetched for this signed-in session from the staff-directory RPC.
  // Preserve leading zeroes in phone numbers; never reuse cached data across accounts.
  function exportStaffExcel(){
    if(!lastStaffRows.length){alert('Danh sách chưa có dữ liệu. Hãy bấm Làm mới trước khi xuất Excel.');return;}
    if(!window.XLSX?.utils?.aoa_to_sheet || !window.XLSX?.writeFile){
      alert('Thư viện xuất Excel chưa tải được. Vui lòng kiểm tra kết nối và thử lại.');
      return;
    }
    const headings=['STT','Họ và tên','Chức danh','SĐT','Email','Vai trò','KTX','Dãy','Trạng thái'];
    const data=lastStaffRows.map(row=>[
      row.stt, row.name||'', row.position||'', String(row.phone||''),
      row.email||'', row.role||'', row.ktx||'', row.days||'', row.status||''
    ]);
    const aoa=[['DANH SÁCH TRÍCH NGANG CBNV BQL KTX HÓC MÔN'],
      ['Tổng số nhân sự: '+data.length+' · Xuất lúc: '+new Date().toLocaleString('vi-VN')],
      [],headings,...data];
    try{
      const wb=window.XLSX.utils.book_new();
      const ws=window.XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols']=[{wch:7},{wch:27},{wch:24},{wch:17},{wch:33},{wch:15},{wch:18},{wch:23},{wch:16}];
      ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:8}},{s:{r:1,c:0},e:{r:1,c:8}}];
      ws['!autofilter']={ref:'A4:I'+String(aoa.length)};
      // Force the SĐT column to text for every row, retaining numbers such as 0123456789.
      data.forEach((row,i)=>{const addr='D'+(i+5);ws[addr]={t:'s',v:row[3],z:'@'};});
      window.XLSX.utils.book_append_sheet(wb,ws,'Danh sach CBNV');
      const now=new Date(),pad=n=>String(n).padStart(2,'0');
      const filename='Danh_sach_trich_ngang_CBNV_KTX_Hoc_Mon_'+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'.xlsx';
      window.XLSX.writeFile(wb,filename);
    }catch(e){
      console.error('KTX_STAFF_DIRECTORY_EXCEL',e);
      alert('Không thể xuất Excel: '+(e?.message||String(e)));
    }
  }

  function printStaffDialog(){
    if(!lastStaffRows.length)return;
    // Hidden iframe enables printing without leaving the app or opening a browser tab.
    const iframe=document.createElement('iframe');
    iframe.title='Bản in danh sách trích ngang CBNV';
    iframe.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;';
    document.body.appendChild(iframe);
    const now=new Date().toLocaleString('vi-VN');
    const body=lastStaffRows.map(staffRowCells).join('');
    const doc=iframe.contentDocument;
    doc.open();
    doc.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Danh sách trích ngang CBNV</title><style>
      body{font-family:Arial,sans-serif;color:#173b70;margin:12mm}h1{text-align:center;font-size:22px;margin:0 0 6px}p{text-align:center;font-size:12px;margin:0 0 14px}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #bdd0e5;padding:6px 5px;font-size:10px;overflow-wrap:anywhere}th{background:#ecf4ff}td:first-child{text-align:center}
      @page{size:A4 landscape;margin:9mm}
      </style></head><body><h1>DANH SÁCH TRÍCH NGANG CBNV BQL KTX HÓC MÔN</h1><p>${lastStaffRows.length} nhân sự · ${esc(now)}</p>
      <table><thead><tr><th>STT</th><th>Họ và tên</th><th>Chức danh</th><th>SĐT</th><th>Email</th><th>Vai trò</th><th>KTX</th><th>Dãy</th><th>Trạng thái</th></tr></thead><tbody>${body}</tbody></table></body></html>`);
    doc.close();
    const win=iframe.contentWindow;
    const cleanup=()=>setTimeout(()=>iframe.remove(),300);
    win.addEventListener('afterprint',cleanup,{once:true});
    setTimeout(()=>{try{win.focus();win.print()}catch(err){cleanup();alert('Không mở được hộp thoại in: '+(err.message||err))}},150);
  }

  function injectLaunchers(){
    // Tiện ích / Chức năng hệ thống không chứa lối mở nhân sự.
    // Các nút mở Sơ đồ tổ chức và Danh sách trích ngang chỉ nằm tại Tổng quan.
    // Dọn các nút cũ được tạo bởi các bản trước (không xóa nút ở Tổng quan).
    document.querySelectorAll('#utilhub .org320-directory-shortcut, #sysfunc .org256-sysbtn')
      .forEach(node=>node.remove());

    // Stage 64: Place two actions in the existing main toolbar immediately after
    // “Xuất báo cáo ngày”; do not create a separate banner inside Tổng quan.
    const obsolete=$('home')?.querySelector('.org256-home-card');
    if(obsolete)obsolete.remove();
    const chartBtn=$('org256TopOpen');
    const listBtn=$('org256TopList');
    if(chartBtn)chartBtn.onclick=()=>openOrgChart();
    if(listBtn)listBtn.onclick=()=>openStaffProfileReport();
  }

  const oldAccPage=window.accPage;
  if(typeof oldAccPage==='function'){
    window.accPage=async function(){
      const out=await oldAccPage.apply(this,arguments);
      ensureAccountEnhancements();
      return out;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    injectLaunchers();
    ensureAccountEnhancements();
    const home=$('home');
    if(home && !home.__org256Observer){
      const obs=new MutationObserver(()=>injectLaunchers());
      obs.observe(home,{childList:true,subtree:false});
      home.__org256Observer=obs;
    }
    const util=$('utilhub');
    if(util && !util.__org320Observer){
      const observer=new MutationObserver(()=>injectLaunchers());
      observer.observe(util,{childList:true,subtree:true});
      util.__org320Observer=observer;
    }
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-p="utilhub"],#utilityNavGroup>.gh')){
        setTimeout(injectLaunchers,100);
      }
    },true);
    const sys=$('sysfunc');
    if(sys && !sys.__org256Observer){
      const obs2=new MutationObserver(()=>injectLaunchers());
      obs2.observe(sys,{childList:true,subtree:true});
      sys.__org256Observer=obs2;
    }
    setTimeout(()=>{injectLaunchers();ensureAccountEnhancements();},350);
    setTimeout(()=>{injectLaunchers();ensureAccountEnhancements();},1200);
  });

  // Sync session transitions initiated outside the login modal (other tab/desktop resume).
  // Keep this independent from Supabase's auth callback; await network calls in a later task.
  let orgSessionId=window.SUPA_SYNC?.session?.user?.id||null;
  let orgSessionVersion=0;
  function clearOrgWindows(){
    for(const id of [DIALOG_ID,'org272StaffDialog']){
      const node=$(id);
      if(node?.open)try{node.close()}catch(_){}
    }
    lastStaffRows=[];
    org256Ready=false;
    org256Loading=false;
    staffListBusy=false;
  }
  function setupOrgSessionWatch(){
    const sb=typeof syncClient==='function'?syncClient():null;
    if(!sb?.auth?.onAuthStateChange||window.__ktxOrgSessionWatch320)return;
    window.__ktxOrgSessionWatch320=true;
    sb.auth.onAuthStateChange((event,session)=>{
      if(event!=='SIGNED_IN'&&event!=='SIGNED_OUT')return;
      const next=session?.user?.id||null;
      if(next===orgSessionId)return;
      orgSessionId=next;
      const version=++orgSessionVersion;
      // Do not issue Supabase calls within the onAuthStateChange callback.
      setTimeout(async()=>{
        if(version!==orgSessionVersion)return;
        clearOrgWindows();
        if(window.AUTHC){window.AUTHC.accounts=[];window.AUTHC.loaded=false;}
        // The native login form already updates ME and rerenders. Avoid racing it.
        if(window.__ktxLoginBusy)return;
        try{
          if(next){
            if(window.SUPA_SYNC)window.SUPA_SYNC.session=session;
            if(typeof syncLoadAccount==='function')await syncLoadAccount();
            if(version!==orgSessionVersion)return;
          }else{
            if(window.SUPA_SYNC){window.SUPA_SYNC.session=null;window.SUPA_SYNC.account=null;window.SUPA_SYNC.ready=false;}
            if(typeof ME!=='undefined'){
              ME.id=null;ME.name='';ME.role='viewer';ME.acct=null;
            }
          }
          if(typeof updateUserbar==='function')updateUserbar();
          if(typeof applyPerms==='function')applyPerms();
          if(next&&typeof all==='function')all();
        }catch(err){console.warn('KTX_ORG320_SESSION_RELOAD',err);}
      },60);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupOrgSessionWatch,{once:true});
  else setupOrgSessionWatch();

  window.KTXOrgChart={open:openOrgChart,refresh:refreshOrgChart,download:downloadOrgChart,print:printOrgChart,openStaffList:openStaffProfileReport};
})();

/* QLKTX checkbox v3: narrowly scoped visual protection for edit-account modal. */
;(function(){
  if(document.getElementById('qlktx-acc-checkbox-v3-css'))return;
  const style=document.createElement('style');style.id='qlktx-acc-checkbox-v3-css';
  style.textContent=`
  #ac140Modal .ac140-checkbox-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:8px!important;border:1px solid #dce7f7!important;border-radius:10px!important;background:#f8fbff!important;min-height:42px!important}
  #ac140Modal .ac140-checkbox-grid .ac140-scope-choice{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:7px!important;min-width:0!important;width:auto!important;min-height:32px!important;padding:6px 8px!important;margin:0!important;background:white!important;border:1px solid #dae6f6!important;border-radius:8px!important;color:#31547d!important;font-size:12px!important;line-height:1.3!important;cursor:pointer!important}
  #ac140Modal .ac140-checkbox-grid .ac140-scope-choice:has(input:checked){background:#e4efff!important;border-color:#88b1f4!important}
  #ac140Modal .ac140-checkbox-grid .ac140-scope-choice input[type=checkbox],
  #ac140Modal .ac277-perms label input[type=checkbox],
  #ac140Modal #ac140Perms input[type=checkbox]{appearance:auto!important;display:inline-block!important;position:static!important;width:15px!important;min-width:15px!important;max-width:15px!important;height:15px!important;min-height:15px!important;max-height:15px!important;flex:0 0 15px!important;transform:none!important;margin:0!important;padding:0!important;accent-color:#1e67c5!important;vertical-align:middle!important}
  #ac140Modal .ac277-perms label,#ac140Modal #ac140Perms label{display:flex!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:7px!important;min-width:0!important;min-height:32px!important;height:auto!important;padding:7px 8px!important;margin:0!important;line-height:1.3!important;font-size:11px!important;white-space:normal!important}
  #ac140Modal .ac277-perms,#ac140Modal #ac140Perms{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
  #ac140Modal .ac140-scope-field{min-width:0!important}
  @media(max-width:560px){#ac140Modal .ac277-perms,#ac140Modal #ac140Perms{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
  `;
  document.head.appendChild(style);
})();
