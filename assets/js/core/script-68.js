/* KTX mobile pilot: read/write via existing workers & permissions. No separate worker store. */
(function(){
'use strict';
const root=document.getElementById('mobile180');
if(!root)return;
// Clear synthetic touch focus only on the control that was tapped; preserve keyboard focus.
root.addEventListener('pointerup',function(ev){if(ev.pointerType!=='touch')return;const b=ev.target.closest('button');if(b&&root.contains(b))requestAnimationFrame(()=>{try{b.blur()}catch(_){}})},true);
const mobile=()=>matchMedia('(max-width:760px)').matches;
let mealRequestId=0;
let mobileFiltersOpen=false;
let screen=(location.hash==='#qr'?'qr':location.hash==='#work'?'list':'home'), query='',ktx='',day='',room='',status='',chosen=null,limit=35;let dayViewAll=false,dayKtxFilter='',fromDayView=false;let cloudBusy=false,cloudError='',lastCloudCheck=0,cloudReady=false;
const escapeHtml=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allWorkers=()=>typeof W!=='undefined'&&Array.isArray(W)?W:[];
const assigned=w=>{try{return typeof inScope==='function'?inScope(w):false}catch(_){return false}};
const hasGlobalRead=()=>{try{return typeof ME!=='undefined'&&ME.role==='admin'||(typeof ME!=='undefined'&&ME.acct&&ME.acct.view_all_days===true)}catch(_){return false}};
// Global view requires an explicit account permission. No privilege escalation through this toggle.
const readAllDays=()=>dayViewAll; // View-only scope; write permissions remain checked by assigned()/can().
const workers=()=>{try{return ['list','detail'].includes(screen)?allWorkers():allWorkers().filter(w=>readAllDays()&&screen==='dayman'?true:typeof can==='function'?can('view',w):true)}catch(e){return []}};
const byId=id=>workers().find(w=>String(w.id)===String(id));
const loc=w=>`${typeof K==='function'?K(w):w.ktx||''} · ${typeof D==='function'?D(w):w.day||''} · P.${typeof R==='function'?R(w):w.room||'—'}`;
const male=w=>String(w.gt||'').toLowerCase().includes('nam')?'Nam':String(w.gt||'').toLowerCase().includes('nữ')?'Nữ':(w.gt||'—');
const missing=w=>!(String(w.cccd||'').trim()&&String(w.sdt||'').trim());
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const page=x=>{const prior=screen;screen=x;
 // V2.0.134: Remember the Mobile page and optional worker detail for this account.
 try{const u=window.SUPA_SYNC?.session?.user?.id;if(u&&window.SUPA_SYNC.ready&&!window.__KTX_NAV_BOOT_RESTORING){localStorage.setItem('ktx_nav_v2134:'+u+':mobile',JSON.stringify({screen:x,workerId:x==='detail'?chosen:null}))}}catch(_){}
 if(x==='dayman')fromDayView=true;else if(!['list','detail'].includes(x))fromDayView=false;limit=35;render();window.scrollTo(0,0);if(x==='list'||x==='home')tryCloudRead();if(x==='menu238')loadMenu125();if((x==='archive'||x==='home')&&!mArchiveCloudLoaded&&!mArchiveCloudBusy)refreshMobileArchiveCloud();if(prior!==x)window.dispatchEvent(new CustomEvent('ktx:mobile-screen',{detail:{screen:x,workerId:chosen}}))};
window.KTX_MOBILE_RESTORE_SCREEN=function(state){
 if(!state||!state.screen)return;
 const supported=new Set(['home','list','detail','meal','menu238','qr','dayman','moreview','assets','ledger','archive','vault208','account']);
 screen=supported.has(state.screen)?state.screen:'home';chosen=state.workerId||null;
 if(screen==='detail'&&!chosen)screen='list';
 limit=35;render();window.scrollTo(0,0);
 if(screen==='menu238')loadMenu125();
 if(screen==='archive')refreshMobileArchiveCloud();
};
// V2.0.123: The mobile shell is separate from desktop main; route its menu here.
window.KTX_MOBILE_OPEN_MENU=function(){if(!mobile())return false;page('menu238');return true};
// V2.0.127: intercept mobile menu entry before legacy delegated handlers.
// Do not intercept controls inside the menu itself.
root.addEventListener('click',function(event){
 if(!mobile()||document.body.classList.contains('auth-locked'))return;
 const button=event.target.closest('[data-mobile="menu238"]');
 if(!button||!root.contains(button))return;
 event.preventDefault();event.stopImmediatePropagation();
 try{page('menu238')}
 catch(err){console.error('[KTX127] Mobile menu navigation',err);
  // The independent meal viewer remains reachable if mobile initialization fails.
  location.href='/pages/kiem-tra-menu-ncc.html?mobile=1&v=2127';}
},true);

function stats(){
 const A=workers(),rs=new Map(),days=new Set(),ktxs=new Set();let men=0,women=0,unknown=0;
 A.forEach(w=>{const k=loc(w);rs.set(k,(rs.get(k)||0)+1);
   const ktx=typeof K==='function'?K(w):w.ktx||'',day=typeof D==='function'?D(w):w.day||'';
   if(ktx)ktxs.add(ktx);if(ktx&&day)days.add(ktx+'|'+day);
   const sex=String(w.gt||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
   if(sex==='nam'||sex==='m'||sex==='male')men++;else if(sex==='nu'||sex==='f'||sex==='female')women++;else unknown++;
 });
 // Never treat empty rooms as occupied; counts reflect actual accessible worker data.
 return{A,over:[...rs.values()].filter(v=>v>(typeof CAP==='number'?CAP:20)).length,occupiedRooms:rs.size,days:days.size,ktxs:ktxs.size,men,women,unknown};
}
function moreMobile(){return `<h2 class="mtitle">Tiện ích di động</h2><p class="msub">Mở nhanh các công cụ thường dùng trên điện thoại</p><section class="mpanel"><div class="mactions"><button class="maction green" data-mobile="ledger"><i><svg class="mi"><use href="#i-clipboard"/></svg></i>Sổ tăng/giảm</button><button class="maction" data-mobile="qr"><i><svg class="mi"><use href="#i-qr"/></svg></i>QR code</button><button class="maction" data-mobile="dayman"><i><svg class="mi"><use href="#i-building2"/></svg></i>Quản lý dãy</button><button class="maction amber" data-mobile="menu238"><i><svg class="mi"><use href="#i-menu"/></svg></i>Xem thực đơn</button><button class="maction" data-mobile="residence"><i><svg class="mi"><use href="#i-id"/></svg></i>Đăng ký tạm trú</button><button class="maction" data-mobile="archive"><i><svg class="mi"><use href="#i-refresh"/></svg></i>Điều chuyển · Nghỉ việc</button><button class="maction" data-mobile="reports"><i><svg class="mi"><use href="#i-chart"/></svg></i>Báo cáo</button><button class="maction" data-mobile="assets"><i><svg class="mi"><use href="#i-clipboard"/></svg></i>Cơ sở vật chất</button><button class="maction" data-mobile="account"><i><svg class="mi"><use href="#i-users"/></svg></i>Tài khoản</button><button class="maction green" data-mobile="vault208"><i><svg class="mi"><use href="#i-folder"/></svg></i>Kho tài liệu</button></div></section>`}
window.addEventListener('ktx-global-settings-changed',()=>{try{if(typeof render==='function'&&mobile())render()}catch(_){}});
function shell(content){return `<header class="mbar"><div class="mbrand"><i><img src="/assets/img/brand/ktx-logo.png" alt="Logo KTX Hóc Môn"></i><span>${escapeHtml(window.KTX_GLOBAL_CONFIG?.title||'KTX Hóc Môn')}</span></div><button class="mavatar" data-mobile="account" aria-label="Tài khoản"><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg></button></header><div class="mpage">${content}</div><div class="mbottom"><button data-mobile="home" class="${screen==='home'?'active':''}"><span><svg class="mi"><use href="#i-home"/></svg></span>Tổng quan</button><button data-mobile="list" class="${['list','detail'].includes(screen)?'active':''}"><span><svg class="mi"><use href="#i-users"/></svg></span>Công nhân</button><button data-mobile="vault208" class="${screen==='vault208'?'active':''}" aria-label="Kho tài liệu"><span><svg class="mi"><use href="#i-folder"/></svg></span>Kho tài liệu</button></div>`}
let overviewKtx='all';
let mArchiveQuery='', mArchiveReason='all', mArchiveLimit=40;
let mArchiveSelecting=false, mArchiveSelected=new Set(), mArchiveDeleteBusy=false, mArchiveDeleteStatus='';
let mArchiveCloudBusy=false, mArchiveCloudError='', mArchiveCloudLoaded=false;
async function refreshMobileArchiveCloud(){
 if(!mobile()||mArchiveCloudBusy||mArchiveDeleteBusy)return;
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC?.ready||!SUPA_SYNC?.session){
  mArchiveCloudError='Chưa kết nối Supabase hoặc phiên đăng nhập chưa sẵn sàng.';
  if(screen==='archive')render();return;
 }
 if(typeof syncFetchAll!=='function'||typeof syncApplyRows!=='function'||typeof SYNC_TABLES==='undefined'){
  mArchiveCloudError='Chưa tải được mô-đun đồng bộ hồ sơ lưu trữ.';
  if(screen==='archive')render();return;
 }
 mArchiveCloudBusy=true;mArchiveCloudError='';if(screen==='archive')render();
 try{
  // Read only the archive table; never push or touch workers on this route.
  const rows=await syncFetchAll(SYNC_TABLES.archive,'record_id,payload');
  const current=typeof ARC!=='undefined'&&Array.isArray(ARC)?ARC:[];
  if(!rows.length&&current.length)throw Error('Cloud trả về 0 hồ sơ trong khi máy đang có '+current.length+' hồ sơ. Đã giữ nguyên danh sách trên máy; hãy kiểm tra quyền đọc hoặc trạng thái đồng bộ.');
  if(SUPA_SYNC.pending)throw Error('Máy còn thay đổi chưa đồng bộ; chưa ghi đè hồ sơ lưu trữ. Hãy đồng bộ dữ liệu trước.');
  syncApplyRows('archive',rows);
  mArchiveCloudLoaded=true;
 }catch(e){mArchiveCloudError='Không tải được hồ sơ Điều chuyển · Nghỉ việc: '+(e?.message||String(e));}
 finally{mArchiveCloudBusy=false;if((screen==='archive'||screen==='home')&&mobile())render();}
}


// V2.0.152 — Mobile bulk purge, Cloud-acknowledged per record. Never remove unrelated records.
async function mobileArchiveDeleteSelected(){
 if(mArchiveDeleteBusy)return;
 if(typeof can!=='function'||!can('purge')||typeof syncCanDelete!=='function'||!syncCanDelete('archive')){alert('Tài khoản không có quyền Xóa hẳn hồ sơ lưu trữ.');return;}
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC?.ready||!SUPA_SYNC?.session||!SUPA_SYNC?.enabled){alert('Cần đăng nhập và kết nối Supabase trước khi xóa.');return;}
 if(SUPA_SYNC.pending||SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying||mArchiveCloudBusy){alert('Đang có thay đổi chưa đồng bộ hoặc Cloud đang bận. Hãy đồng bộ/tải lại trước khi xóa.');return;}
 const selected=(typeof ARC!=='undefined'&&Array.isArray(ARC)?ARC:[]).filter(a=>mArchiveSelected.has(String(a.id)));
 if(!selected.length){alert('Hãy chọn ít nhất một hồ sơ để xóa.');return;}
 if(selected.some(a=>!assigned(a.w||{}))){alert('Có hồ sơ ngoài phạm vi quản lý. Không thực hiện xóa.');return;}
 if(typeof syncClient!=='function'||typeof SYNC_TABLES==='undefined'||!SYNC_TABLES.archive){alert('Chưa sẵn sàng kết nối bảng lưu trữ Supabase.');return;}
 const confirmed=await (typeof ask==='function'?ask(`XÓA HẲN ${selected.length} hồ sơ Điều chuyển · Nghỉ việc?\n${selected.slice(0,5).map(a=>'• '+(a.w?.name||a.id)).join('\n')}${selected.length>5?'\n… và '+(selected.length-5)+' hồ sơ khác':''}\n\nKhông thể khôi phục sau khi xóa.`,{title:'Xác nhận xóa nhiều hồ sơ',ok:'Xóa hẳn'}):Promise.resolve(confirm(`Xóa hẳn ${selected.length} hồ sơ? Thao tác không thể hoàn tác.`)));
 if(!confirmed)return;
 const sb=syncClient();if(!sb){alert('Không kết nối được Supabase.');return;}
 mArchiveDeleteBusy=true;mArchiveDeleteStatus='Đang xóa 0 / '+selected.length+' hồ sơ…';render();
 const deleted=[],failed=[];
 // Prevent scheduled full-dataset pushes while individually deleting confirmed rows.
 SUPA_SYNC.applying=true;
 try{
  for(const a of selected){
   const id=String(a.id||'');
   if(!id){failed.push('Hồ sơ thiếu mã định danh');continue;}
   try{
    const {data,error}=await sb.from(SYNC_TABLES.archive).delete().eq('record_id',id).select('record_id');
    if(error)throw error;
    if(!Array.isArray(data)||!data.some(r=>String(r.record_id)===id))throw Error('Cloud không xác nhận xóa (kiểm tra RLS/quyền tài khoản)');
    deleted.push(id);
    const j=ARC.findIndex(x=>String(x.id)===id);if(j>=0)ARC.splice(j,1);
    mArchiveSelected.delete(id);
    if(SUPA_SYNC.hashes?.archive)delete SUPA_SYNC.hashes.archive[id];
    if(SUPA_SYNC.remoteIds?.archive)SUPA_SYNC.remoteIds.archive.delete(id);
    if(typeof AS!=='undefined')AS.delete(a.id);
   }catch(e){failed.push((a.w?.name||id)+': '+(e?.message||String(e)));}
   mArchiveDeleteStatus='Đã xác nhận xóa '+deleted.length+' / '+selected.length+' hồ sơ…';
  }
 }finally{SUPA_SYNC.applying=false;mArchiveDeleteBusy=false;}
 mArchiveDeleteStatus=failed.length?`Đã xóa ${deleted.length}/${selected.length} hồ sơ. ${failed.length} hồ sơ chưa xóa; giữ nguyên để thử lại.`:`Đã xóa thành công ${deleted.length} hồ sơ trên Supabase.`;
 if(!mArchiveSelected.size)mArchiveSelecting=false;
 render();
 if(failed.length)alert('Không xóa hết hồ sơ:\n'+failed.slice(0,8).join('\n'));
}

function summaryByKtx(){
 const allowed=workers();
 const globalWorkers=allWorkers();
 const isAdmin=typeof ME!=='undefined'&&ME.role==='admin';
 // Non-admin accounts only see KTX that already contain workers in their readable scope.
 const choices=[...new Set([...globalWorkers.map(w=>K(w)),...allowed.map(w=>K(w)),...Object.keys(window.KTX_GLOBAL_CONFIG?.counts||{}).filter(k=>/^KTX \d+$/.test(k)),'KTX 1','KTX 2'].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
 if(overviewKtx!=='all'&&!choices.includes(overviewKtx))overviewKtx='all';
 const scope=overviewKtx==='all'?globalWorkers:allowed.filter(w=>K(w)===overviewKtx);
 const rm=new Map(),dys=new Map();let men=0,women=0,unknown=0,registered=0,missingId=0;
 const roomCap=typeof CAP==='number'&&CAP>0?CAP:20;
 scope.forEach(w=>{
  const k=K(w)||'—',d=D(w)||'Chưa xếp dãy',r=String(R(w)||'').trim();
  if(!dys.has(k+'|'+d))dys.set(k+'|'+d,{ktx:k,day:d,total:0,rooms:new Set()});
  const g=dys.get(k+'|'+d);g.total++;if(r)g.rooms.add(r);
  if(r){const key=k+'|'+d+'|'+r;rm.set(key,(rm.get(key)||0)+1)}
  const sex=String(w.gt||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  if(['nam','male','m'].includes(sex))men++;else if(['nu','female','f'].includes(sex))women++;else unknown++;
  if(w.tt)registered++;
  if(missing(w))missingId++;
 });
 const over=[...rm.values()].filter(n=>n>roomCap).length;
 const actualTotal=scope.length;const total=actualTotal; // Headcount is the number of loaded worker records, never configured bed capacity.
 const activeRooms=rm.size;
 // Stage 93: show vacant BED capacity, not count of rooms with space.
 const pct=total?Math.round(registered/total*100):0;
 // V2.0.155: occupancy = current workers / DESIGN capacity (NOT archived people or current headcount).
 // Mirrors the design-capacity fallback in the desktop headcount report (script-08.js).
 const settings=window.KTX_GLOBAL_CONFIG||{};
 const designCapacity={'KTX 1':1160,'KTX 2':1380,'KTX 3':980};
 const validCapacity=v=>v!==null&&v!==undefined&&v!==''&&Number.isSafeInteger(Number(v))&&Number(v)>0?Number(v):null;
 const capacityFor=k=>{
  const explicit=k==='KTX 1'?settings.ktx1Total:k==='KTX 2'?settings.ktx2Total
    :(Array.isArray(settings.sites)?settings.sites.find(site=>'KTX '+site.number===k)?.count:null);
  return validCapacity(explicit)??designCapacity[k]??null;
 };
 // Capacity must be calculated from the actual KTX sites, not settings.total.
 // The settings.total field is a configurable headcount and must never be used as bed capacity.
 // Do not include an unconfigured KTX 3 merely because a fallback capacity is defined.
 const activeSites=new Set(['KTX 1','KTX 2']);
 globalWorkers.forEach(w=>{const k=K(w);if(/^KTX\s*\d+$/i.test(String(k||'')))activeSites.add(k)});
 (Array.isArray(settings.sites)?settings.sites:[]).forEach(site=>{
  const k='KTX '+String(site.number||'').trim();
  if(/^KTX\s*\d+$/i.test(k))activeSites.add(k);
 });
 const capacities=[...activeSites].map(capacityFor);
 const allCapacity=capacities.every(n=>n!==null)?capacities.reduce((sum,n)=>sum+n,0):null;
 const totalCapacity=overviewKtx==='all'?allCapacity:capacityFor(overviewKtx);
 const freeBedCount=totalCapacity===null?null:Math.max(0,totalCapacity-total);
 const currentPct=totalCapacity!==null?Math.round(total/totalCapacity*1000)/10:null;
 const pctText=currentPct===null?'—':`${new Intl.NumberFormat('vi-VN',{maximumFractionDigits:1}).format(currentPct)}%`;
 const ratioDesc=totalCapacity===null?'Chưa cấu hình tổng sức chứa':`${fmt(total)} / ${fmt(totalCapacity)} người`;
 const ratioAria=totalCapacity===null?'Chưa xác định sức chứa để tính tỷ lệ đang ở':`${total} công nhân đang ở trên tổng sức chứa ${totalCapacity} người, tương đương ${pctText}`;
 const stat=(label,n,cls,icon)=>`<div class="m131-stat ${cls}"><span class="m131-stat-icon">${icon}</span><b>${typeof n==='number'&&Number.isFinite(n)?fmt(n):'—'}</b><small>${label}</small></div>`;
 const tabs=[['all','Toàn KTX'],...choices.filter(k=>/^KTX\s*\d+$/i.test(String(k))).map(k=>[k,'KTX '+String(k).match(/\d+/)[0]])];
 const locationName=overviewKtx==='all'?'Toàn KTX':overviewKtx;
 const actions=`<section class="mpanel m131-actions"><h3>Truy cập nhanh</h3><div class="mactions"><button class="maction" data-mobile="list"><i><svg class="mi"><use href="#i-users"/></svg></i>Danh sách công nhân →</button><button class="maction green" data-mobile="add" ${typeof can==='function'&&can('add')?'':'style="display:none"'}><i><svg class="mi"><use href="#i-plus"/></svg></i>Thêm công nhân →</button><button class="maction" data-mobile="dayman"><i><svg class="mi"><use href="#i-building2"/></svg></i>Quản lý dãy →</button><button class="maction" data-mobile="assets"><i><svg class="mi"><use href="#i-clipboard"/></svg></i>Cơ sở vật chất →</button><button class="maction" data-mobile="archive"><i><svg class="mi"><use href="#i-refresh"/></svg></i>Điều chuyển · Nghỉ việc →</button><button class="maction amber" data-mobile="menu238"><i><svg class="mi"><use href="#i-menu"/></svg></i>Xem thực đơn →</button><button class="maction" data-mobile="ledger"><i><svg class="mi"><use href="#i-clipboard"/></svg></i>Sổ tăng/giảm →</button><button class="maction" data-mobile="qr"><i><svg class="mi"><use href="#i-qr"/></svg></i>QR đăng ký vào/ra →</button><button class="maction amber" data-mobile="meal" ${typeof can==='function'&&can('report')?'':'style="display:none"'}><i><svg class="mi"><use href="#i-chart"/></svg></i>BC suất ăn →</button></div></section>`;
 return `<div class="m37-sync" role="status">${!navigator.onLine?"○ Ngoại tuyến · Chỉ xem dữ liệu đã tải":cloudBusy?"◌ Đang tải Cloud":cloudError?"⚠ Lỗi kết nối Cloud":"● Trực tuyến · Kiểm tra trạng thái lưu tại hệ thống"}</div><div class="m131-heading"><div><h2 class="mtitle">Tổng quan</h2><p class="msub">Quân số &amp; tình trạng cư trú theo từng KTX</p></div><button class="m131-reload" type="button" data-mobile="refresh" aria-label="Tải dữ liệu Cloud">↻</button></div>
 <div class="m131-switch" role="group" aria-label="Chọn phạm vi KTX">${tabs.map(([k,name])=>`<button type="button" data-overview-ktx="${escapeHtml(k)}" aria-pressed="${overviewKtx===k}" class="${overviewKtx===k?'is-active':''}">${escapeHtml(name)}</button>`).join('')}</div>
 <div class="m131-hero"><div><span class="m131-kicker">QUÂN SỐ HIỆN CÓ</span><strong>${fmt(total)}</strong><small>${overviewKtx==='all'?'Quân số toàn hệ thống':'Quân số trong dãy được phân quyền'}</small></div><div class="m131-hero-mark"><svg class="mi"><use href="#i-bld"/></svg></div></div>
 <div class="m131-grid">${stat('Nam',men,'male','♂')}${stat('Nữ',women,'female','♀')}${`<div class="m131-stat blue m154-current-ratio" aria-label="${ratioAria}"><span class="m131-stat-icon">%</span><b>${pctText}</b><small>Tỷ lệ đang ở</small><span class="m154-ratio-detail">${ratioDesc}</span></div>`}${stat('Phòng có người',activeRooms,'green','⌂')}${stat('Phòng quá tải',over,'orange','!')}${stat('Giường còn trống',freeBedCount,'green','⌂')}</div>
 <section class="mpanel m131-residence"><div class="m131-section-title"><h3>Đăng ký tạm trú</h3><b>${pct}%</b></div><div class="m131-progress"><span style="width:${pct}%"></span></div><div class="m131-residence-foot"><span>Đã đăng ký: <b>${fmt(registered)}</b></span><span>Chưa đăng ký: <b>${fmt(Math.max(0,actualTotal-registered))}</b></span></div></section>

 ${unknown?`<p class="m131-note">${fmt(unknown)} hồ sơ chưa xác định giới tính.</p>`:''}${!allowed.length?'<div class="mcloudwarn">Chưa có dữ liệu trong phạm vi được cấp. Hãy kiểm tra kết nối Cloud.</div>':''}
 ${actions}`;
}
function summary(){return summaryByKtx();}
function summaryAdmin(){return summaryByKtx();}
const opts=(values,val,title)=>`<option value="">${title}</option>`+[...new Set(values.map(String))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'vi',{numeric:true})).map(v=>`<option value="${escapeHtml(v)}" ${v===val?'selected':''}>${escapeHtml(v)}</option>`).join('');
function dayman(){
 const A=(readAllDays()?allWorkers():workers()), groups=new Map(), cap=typeof CAP==='number'&&CAP>0?CAP:20;
 const scope=typeof ME!=='undefined'?ME.acct:null, admin=typeof ME!=='undefined'&&ME.role==='admin';
 const configuredKtx=[...new Set([...Object.keys(window.KTX_GLOBAL_CONFIG?.counts||{}).filter(k=>/^KTX \d+$/.test(k)),...allWorkers().map(w=>K(w))].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true})); const ks=admin?configuredKtx:(Array.isArray(scope?.ktx)?scope.ktx:[]);
 const ds=admin?Array.from({length:6},(_,i)=>'Dãy '+(i+1)):(Array.isArray(scope?.days)?scope.days:[]);
 const norm=x=>String(x||'').trim().toLowerCase().replace(/\s+/g,' ');
 const allowed=(k,d)=>admin||readAllDays()||(ks.some(v=>norm(v)===norm(k))&&ds.some(v=>norm(v)===norm(d)));
 const addDay=(k,d)=>{const key=norm(k)+'|'+norm(d);if(!groups.has(key))groups.set(key,{k,d,rooms:new Map(),count:0})};
 // Chỉ tạo thẻ dãy có công nhân thực tế; không tạo dãy rỗng từ cấu hình.

 A.forEach(w=>{const k=K(w),d=D(w);if(!allowed(k,d))return;addDay(k,d);const g=groups.get(norm(k)+'|'+norm(d)),roomNum=String(R(w)||'').match(/\d+/)?.[0];g.count++;if(roomNum){const n=parseInt(roomNum,10);if(n>=1&&n<=15)g.rooms.set(n,(g.rooms.get(n)||0)+1)}});
 const entriesAll=[...groups.values()].filter(g=>g.count>0);const entries=entriesAll.sort((a,b)=>(a.k+a.d).localeCompare(b.k+b.d,'vi',{numeric:true}));
 return `<h2 class="mtitle">Quản lý dãy</h2><div class="msub">${admin?'Tổng quan tất cả KTX và dãy':readAllDays()?'Chế độ xem toàn bộ, chỉ được sửa trong dãy được giao':'Các dãy đã được phân quyền'} · ${entries.length} dãy</div>${!admin?`<div class="m32-tabs"><button type="button" data-day-mode="mine" class="${!readAllDays()?'active':''}">Dãy được giao</button><button type="button" data-day-mode="all" class="${readAllDays()?'active':''}" >Xem tất cả</button></div>`:''}<div class="step230-day-list">${entries.map(g=>{
 const rooms=[...g.rooms.entries()].sort((a,b)=>a[0]-b[0]).map(([n,used])=>({n,used}));const total=g.count;const pct=rooms.length?Math.min(100,Math.round(total/(rooms.length*cap)*100)):0;const full=rooms.filter(r=>r.used>=cap).length,empty=rooms.filter(r=>r.used===0).length,near=rooms.filter(r=>r.used>=cap*.9&&r.used<cap).length;
 return `<section class="step230-day-card"><div class="step230-day-top"><div><b>${escapeHtml(g.d)}</b><small>${escapeHtml(g.k)} · ${rooms.length} phòng</small><small class="m32-badge ${allowed(g.k,g.d)&&(!readAllDays()||admin||ks.some(k=>norm(k)===norm(g.k))&&ds.some(d=>norm(d)===norm(g.d)))?'edit':'read'}">${admin||ks.some(k=>norm(k)===norm(g.k))&&ds.some(d=>norm(d)===norm(g.d))?'Được quản lý':'Chỉ xem'}</small></div><strong>${total}/${rooms.length*cap} <small>${pct}%</small></strong></div><div class="step230-bar"><i style="width:${pct}%"></i></div><div class="step230-counts"><span class="free">Trống ${empty}</span><span class="near">Sắp đầy ${near}</span><span class="full">Đầy ${full}</span></div><div class="step230-rooms">${rooms.map(r=>{const pctR=Math.min(100,Math.round(r.used/cap*100));const cls=r.used>=cap?'full':r.used>=cap*.9?'near':r.used===0?'empty':'normal';return `<button class="step230-room ${cls}" type="button" data-day-ktx="${escapeHtml(g.k)}" data-day-name="${escapeHtml(g.d)}" data-day-room="${r.n}" aria-label="${escapeHtml(g.d)}, phòng ${r.n}, ${r.used} trên ${cap} người"><b>P.${r.n}</b><span>${r.used}/${cap}</span><small>${pctR}%</small></button>`}).join('')}</div><button class="step230-open-day" type="button" data-day-ktx="${escapeHtml(g.k)}" data-day-name="${escapeHtml(g.d)}">Xem công nhân dãy này →</button></section>`}).join('')||'<section class="mpanel"><div class="mempty">Tài khoản chưa được phân công KTX/Dãy.</div></section>'}</div>`;
}
function list(){const A=workers();const base=A.filter(w=>(!ktx||K(w)===ktx)&&(!day||D(w)===day)&&(!room||String(R(w))===room));const L=base.filter(w=>(!query||[w.name,w.mnv,w.cccd,w.sdt].some(x=>String(x||'').toLowerCase().includes(query.toLowerCase())))&&(!status||(status==='missing'?missing(w):!missing(w))));return `<div class="m175-worker-heading"><div><h2 class="mtitle">Công nhân</h2><div class="msub">Danh sách, tìm kiếm và quản lý hồ sơ</div></div><button type="button" class="mbtn m175-export" data-mobile="worker-report"><svg class="mi" aria-hidden="true"><use href="#i-dl"/></svg> Sao chép báo cáo</button></div><div style="display:flex;gap:9px;margin-top:13px"><input id="mobileFind" class="msearch" placeholder="Tìm tên, MNV, CCCD..." value="${escapeHtml(query)}"></div><button type="button" class="m37-filter-toggle" id="m37FilterToggle" aria-expanded="${mobileFiltersOpen}">⚙ Bộ lọc ${ktx||day||room||status?"• Đang lọc":""}</button><div class="mfilters ${mobileFiltersOpen?"m37-open":""}"><select id="mfK">${opts(A.map(w=>K(w)),ktx,'Tất cả KTX')}</select><select id="mfD">${opts(A.filter(w=>!ktx||K(w)===ktx).map(w=>D(w)),day,'Tất cả Dãy')}</select><select id="mfR">${opts(base.map(w=>R(w)),room,'Tất cả Phòng')}</select><select id="mfS"><option value="">Tất cả trạng thái</option><option value="ok" ${status==='ok'?'selected':''}>Đủ CCCD & SĐT</option><option value="missing" ${status==='missing'?'selected':''}>Thiếu CCCD/SĐT</option></select></div><div class="msub" data-worker-count>Hiển thị ${Math.min(L.length,limit)} / ${fmt(L.length)} công nhân phù hợp <button type="button" class="mrefresh" data-mobile="refresh" ${cloudBusy?'disabled':''}>${cloudBusy?'Đang tải…':'↻ Tải Cloud'}</button></div>${cloudError?'<div class="mcloudwarn m37-dismissible" role="alert">'+escapeHtml(cloudError)+'<button type="button" data-mobile="dismiss-error" aria-label="Đóng thông báo">×</button></div>':''}<div class="mlist">${L.slice(0,limit).map(w=>`<div class="mworker"><div class="mface">${escapeHtml(String(w.name||'?').trim().charAt(0).toUpperCase())}</div><div class="mworkertext"><b>${escapeHtml(w.name||'Chưa có tên')}</b><small>MNV: ${escapeHtml(w.mnv||'Chưa có')}</small><small>${escapeHtml(loc(w))} · ${escapeHtml(male(w))}</small><small class="mstate ${missing(w)?'warn':''}">${missing(w)?'⚠ Thiếu CCCD/SĐT':'✓ Đủ CCCD/SĐT'}</small></div><button class="miconbtn" data-open-worker="${escapeHtml(w.id)}" aria-label="Xem hồ sơ"><svg class="mi" aria-hidden="true"><use href="#i-eye"/></svg></button><button class="miconbtn" data-edit-worker="${escapeHtml(w.id)}" aria-label="Sửa hồ sơ" ${assigned(w)&&typeof can==='function'&&can('edit',w)?'':'disabled title="Chỉ xem ngoài phạm vi"'}><svg class="mi" aria-hidden="true"><use href="#i-edit"/></svg></button><button class="miconbtn m146-delete" style="display:inline-flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;min-width:48px!important;width:auto!important;padding:4px 7px!important" type="button" data-delete-worker="${escapeHtml(w.id)}" aria-label="Xóa công nhân ${escapeHtml(w.name||'')}" title="Xóa hoặc chuyển sang Nghỉ việc" ${assigned(w)&&typeof can==='function'&&can('del',w)?'':'disabled style="display:none!important"'} ><svg class="mi" aria-hidden="true"><use href="#i-trash"/></svg><span style="font-size:11px">Xóa</span></button></div>`).join('')||'<div class="mpanel mempty">Không tìm thấy công nhân phù hợp.</div>'}</div>${L.length>limit?'<button class="mbtn outline" data-mobile="more" style="width:100%;margin:14px 0">Xem thêm 35 công nhân</button>':''}`}
function detail(){const w=byId(chosen);if(!w)return'<p>Không tìm thấy hồ sơ hoặc không có quyền truy cập.</p>';const field=(l,v)=>`<div><small>${l}</small><strong>${escapeHtml(v||'—')}</strong></div>`;return `<h2 class="mtitle">Hồ sơ công nhân</h2><section class="mpanel"><div style="display:flex;align-items:center;gap:14px"><div class="mface" style="width:60px;height:60px;font-size:27px">${escapeHtml(String(w.name||'?')[0])}</div><div><h3 style="margin:0 0 5px">${escapeHtml(w.name)}</h3><div class="msub">MNV: ${escapeHtml(w.mnv||'Chưa có')}</div><div class="mtiny">${escapeHtml(loc(w))}</div></div></div><div style="margin-top:12px"><span class="mtag">${missing(w)?'⚠ Thiếu CCCD/SĐT':'✓ Đủ CCCD/SĐT'}</span></div></section><section class="mpanel"><h3>Thông tin cá nhân</h3><div class="mdata">${field('Ngày sinh',w.dob)}${field('Giới tính',male(w))}${field('CCCD',w.cccd)}${field('Số điện thoại',w.sdt)}${field('Địa chỉ',w.tinh)}</div></section><section class="mpanel"><h3>Thông tin KTX</h3><div class="mdata">${field('KTX',K(w))}${field('Dãy',D(w))}${field('Phòng',R(w))}${field('Đơn vị',w.unit)}${field('Tổ trưởng',w.leader)}${field('SĐT tổ trưởng',w.lsdt)}</div>${String(w.lsdt||'').replace(/\D/g,'').length>=9?`<a class="m197-call" href="tel:${String(w.lsdt).replace(/[^+0-9]/g,'')}" aria-label="Gọi tổ trưởng"><svg class="mi" aria-hidden="true"><use href="#i-phone"/></svg> Gọi tổ trưởng</a>`:''}</section><section class="mpanel"><h3>Thao tác chính</h3><div class="mactionrow"><button class="mbtn outline" data-edit-worker="${escapeHtml(w.id)}" ${assigned(w)&&can('edit',w)?'':'disabled'}><svg class="mi" aria-hidden="true"><use href="#i-edit"/></svg> Chỉnh sửa</button><button class="mbtn" data-move-worker="${escapeHtml(w.id)}" ${assigned(w)&&can('transfer',w)?'':'disabled'}>⇄ Chuyển phòng</button><button class="mbtn outline" data-full-worker="${escapeHtml(w.id)}" style="grid-column:1/-1">Xem hồ sơ chi tiết đầy đủ</button></div></section>`}
function account(){const name=typeof ME!=='undefined'?ME.name||'Người dùng':'Người dùng',role=typeof ROLES!=='undefined'&&typeof ME!=='undefined'?ROLES[ME.role]||ME.role:'—';const scopes=(typeof ME!=='undefined'&&ME.acct)?ME.acct:{};const area=[...(scopes.ktx||[]),...(scopes.days||[])].join(' · ')||'Theo quyền tài khoản';const online=typeof navigator!=='undefined'&&navigator.onLine;return `<h2 class="mtitle">Tài khoản</h2><section class="mpanel m196-user"><div class="m196-userhead"><span class="m196-avatar">${escapeHtml(name.charAt(0))}</span><div><h3>${escapeHtml(name)}</h3><p class="msub">${escapeHtml(role)}</p></div></div><div class="m196-meta"><div><small>Phạm vi được cấp</small><b>${escapeHtml(area)}</b></div><div><small>Kết nối</small><b>${online?'● Đang trực tuyến':'○ Mất kết nối'}</b></div></div><button class="mbtn ktx-install-action" type="button" data-mobile="install" style="width:100%;margin-top:12px"><svg class="mi" aria-hidden="true"><use href="#i-dl"/></svg> Cài đặt ứng dụng (Android / iPhone)</button><p class="msub" style="margin:6px 0 0">iPhone: mở trang trong Safari → Chia sẻ → Thêm vào Màn hình chính. Android: chọn Cài đặt khi trình duyệt hỗ trợ.</p><button class="mbtn outline" data-mobile="refresh" style="width:100%;margin-top:12px">↻ Tải lại Cloud</button><button class="mbtn m196-logout" data-mobile="logout" style="width:100%;margin-top:10px">Đăng xuất</button></section>`}
function cloudHint(){if(cloudBusy)return 'Đang tải danh sách công nhân từ Supabase…';if(cloudError)return escapeHtml(cloudError);return ME.role==='admin'?'Dữ liệu công nhân đồng bộ với bản PC khi đã đăng nhập và cấp quyền.':''}
async function tryCloudRead(force=false){
 if(!mobile()||cloudBusy||(!force&&workers().length>0)||(!force&&Date.now()-lastCloudCheck<15000))return;
 if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.session||!SUPA_SYNC.ready)return;
 cloudBusy=true;cloudError='';lastCloudCheck=Date.now();if(window.ktxDownloadStatus)window.ktxDownloadStatus('loading','Đang tải dữ liệu từ Cloud…');render();
 try{
  if(typeof syncFetchAll!=='function'||typeof syncApplyRows!=='function'||typeof SYNC_TABLES==='undefined')throw Error('Thiếu mô-đun đọc dữ liệu Supabase.');
  const rows=await syncFetchAll(SYNC_TABLES.workers,'record_id,payload');
  if(!rows.length){cloudError='Supabase trả về 0 công nhân. Không thay đổi dữ liệu trên máy; kiểm tra quyền RLS hoặc kết nối.'}
  else {if(typeof W!=='undefined'&&W.length===0)syncApplyRows('workers',rows);else if(force&&typeof W!=='undefined'&&W.length>0){cloudError='Máy đang có dữ liệu. Để tránh ghi đè khi chưa đối chiếu, vui lòng đồng bộ qua Chức năng hệ thống trên PC.'}cloudReady=true}
 }catch(e){cloudError='Không tải được danh sách Cloud: '+(e.message||String(e))}
 finally{
  if(window.ktxDownloadStatus)window.ktxDownloadStatus(cloudError?'error':'success',cloudError||('Đã đọc dữ liệu Cloud. Danh sách hiện có '+(typeof W!=='undefined'?W.length.toLocaleString('vi-VN'):'0')+' hồ sơ.'));
  cloudBusy=false;render();
 }
}
function mealMobile(){
 const m=typeof RP!=='undefined'?RP:{date:'',ses:'trua',ktx:'KTX1',on:new Set(),f:{},A:{},price:''};
 const vendors=typeof NCCS!=='undefined'?NCCS:[];
 const rows=vendors.filter(n=>m.on.has(n)).map((n,i)=>{
  const f=m.f[n]||{};
  const fields=[['td8','TĐ 8'],['td064','TĐ 06.4'],['tdme','TĐ ME']].map(([key,label])=>`<label class="m195-qty">${label}<input type="number" min="0" inputmode="numeric" data-meal-vendor="${escapeHtml(n)}" data-meal-key="${key}" value="${escapeHtml(typeof mealDisplay==='function'?mealDisplay(f,key):(f[key]??''))}" placeholder="0"></label>`).join('');
  return `<div class="m195-vendor"><strong>${i+1}. ${escapeHtml(n)}</strong><div class="m195-qty-grid">${fields}</div><div class="m195-total">Tổng suất: <b data-total-ncc="${escapeHtml(n)}">${typeof mealTot==='function'?mealTot(n)??0:0}</b></div><div class="m195-menu"><small>Mặn</small><div>${escapeHtml(f.man||'Chưa có thực đơn')}</div><small>Chay</small><div>${escapeHtml(f.chay||'Chưa có thực đơn')}</div></div></div>`;
 }).join('');
 return `<h2 class="mtitle">Báo cáo suất ăn</h2><p class="msub">Chọn ngày và buổi ăn trực tiếp như trên PC; có thể xem thực đơn các ngày tiếp theo.</p><section class="mpanel m195-config"><div class="mfields"><label>Ngày<input id="m195Date" type="date" value="${escapeHtml(m.date)}"></label><label>Buổi<select id="m195Session">${[['sang','Sáng'],['trua','Trưa'],['chieu','Chiều']].map(([k,v])=>`<option value="${k}" ${k===m.ses?'selected':''}>${v}</option>`).join('')}</select></label><label>KTX<select id="m195Ktx">${['KTX1','KTX2','KTX3'].map(k=>`<option ${k===m.ktx?'selected':''}>${k}</option>`).join('')}</select></label><label>Đơn giá<input id="m195Price" value="${escapeHtml(m.price)}" inputmode="text"></label></div><div class="m198-actions"><button type="button" class="mbtn" data-mobile="meal-show">Xem thực đơn đã chọn / Nhập số lượng</button><button type="button" class="mbtn outline" data-mobile="meal-select-all"><svg class="mi" aria-hidden="true"><use href="#i-check"/></svg> Chọn tất cả NCC</button></div><h3 style="margin:16px 0 8px">Chọn nhà cung cấp</h3><div class="m195-select">${vendors.map(n=>`<label><input type="checkbox" data-meal-select="${escapeHtml(n)}" ${m.on.has(n)?'checked':''}><span>${escapeHtml(n)}</span></label>`).join('')}</div></section><section class="mpanel m195-results" id="m198MealResults"><p id="m213CloudStatus" class="msub" role="status" aria-live="polite">Chọn ngày và buổi bất kỳ để xem thực đơn, không cần chờ đến giờ tự hiển thị.</p><h3>Thực đơn & số lượng từng NCC</h3><p class="msub" style="margin-bottom:12px">Chọn một hoặc nhiều NCC phía trên; nhập trực tiếp TĐ 8, TĐ 06.4, TĐ ME và đối chiếu món Mặn/Chay.</p>${rows||'<p>Vui lòng chọn ít nhất một nhà cung cấp.</p>'}</section><section class="mpanel m195-report"><h3>Nội dung báo cáo</h3><pre class="m195-preview" id="m195Preview">${escapeHtml(typeof mealText==='function'?mealText():'')}</pre><div class="mactionrow"><button class="mbtn" data-mobile="meal-copy">Sao chép báo cáo</button><button class="mbtn outline" data-mobile="meal-download">Xuất Word</button></div></section>`;
}


function mobileArchive(){
 const A=typeof ARC!=='undefined'&&Array.isArray(ARC)?ARC:[];
 const counts=(r)=>A.filter(a=>a.reason===r).length;
 const txt=(a)=>[a.w?.name,a.w?.mnv,a.w?.cccd,a.reason,a.note,K(a.w||{}),D(a.w||{})].join(' ').toLocaleLowerCase('vi-VN');
 const q=mArchiveQuery.trim().toLocaleLowerCase('vi-VN');
 const filtered=A.filter(a=>(mArchiveReason==='all'||a.reason===mArchiveReason)&&(!q||txt(a).includes(q))).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const display=filtered.slice(0,mArchiveLimit);
 const canPurge=typeof can==='function'&&can('purge')&&typeof syncCanDelete==='function'&&syncCanDelete('archive');
 const selectable=display.filter(a=>assigned(a.w||{}));
 const selectedCount=mArchiveSelected.size;
 const left60=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(d||'')))return 'Chưa rõ ngày';const t=Date.parse(d+'T00:00:00');if(!Number.isFinite(t))return 'Chưa rõ ngày';const now=new Date();now.setHours(0,0,0,0);const left=60-Math.floor((now-t)/86400000);return left>0?left+' ngày':'Đã hết hạn';};
 const cards=display.map(a=>{
   const w=a.w||{};const canRestore=assigned(w)&&typeof can==='function'&&can('restore');
   return `<article class="m173-card ${mArchiveSelected.has(String(a.id))?'m152-selected':''}"><div class="m173-cardtop">${mArchiveSelecting&&canPurge&&assigned(w)?`<label class="m152-checkwrap"><input type="checkbox" data-m152-select="${escapeHtml(a.id)}" aria-label="Chọn hồ sơ ${escapeHtml(w.name||a.id)}" ${mArchiveSelected.has(String(a.id))?'checked':''}><span></span></label>`:''}<span class="m173-avatar">${escapeHtml((w.name||'?').trim().charAt(0).toUpperCase())}</span><div class="m173-person"><b>${escapeHtml(w.name||'Chưa có tên')}</b><small>MNV: ${escapeHtml(w.mnv||'—')} · ${escapeHtml(K(w)||'—')}</small><small>${escapeHtml(D(w)||'—')} · Phòng ${escapeHtml(R(w)||'—')}</small></div><span class="m173-tag">${escapeHtml(a.reason||'Khác')}</span></div><div class="m173-meta"><span>Ngày: <b>${escapeHtml(a.date||'—')}</b></span><span>Thời hạn còn: <b>${escapeHtml(left60(a.date))}</b></span>${a.note?`<span>Ghi chú: ${escapeHtml(a.note)}</span>`:''}</div><div class="m173-cardactions">${canRestore?`<button type="button" data-m173-restore="${escapeHtml(a.id)}">Sửa & khôi phục</button>`:'<span>Chế độ xem · Không thuộc quyền khôi phục</span>'}</div></article>`;
 }).join('');
 return `<h2 class="mtitle">Điều chuyển – Nghỉ việc</h2><p class="msub">Tra cứu người đã điều chuyển, nghỉ việc và quản lý hồ sơ theo phạm vi được cấp.</p><div class="m173-cloudbar" role="status" aria-live="polite"><span>${mArchiveCloudBusy?'Đang tải hồ sơ từ Supabase…':mArchiveCloudError?escapeHtml(mArchiveCloudError):mArchiveCloudLoaded?'Đã đối chiếu danh sách lưu trữ trên Cloud':'Danh sách đang lưu trên thiết bị · chọn Tải Cloud để kiểm tra'}</span><button type="button" class="mbtn outline" data-m173-refresh ${mArchiveCloudBusy?'disabled':''}>↻ Tải Cloud</button></div><div class="m173-stats"><div><strong>${fmt(A.length)}</strong><small>Tổng đã chuyển ra</small></div><div><strong>${fmt(counts('Điều chuyển'))}</strong><small>Điều chuyển</small></div><div><strong>${fmt(counts('Nghỉ việc'))}</strong><small>Nghỉ việc</small></div></div><section class="m173-tools"><input id="m173Search" class="msearch" placeholder="Tìm họ tên, MNV, CCCD..." value="${escapeHtml(mArchiveQuery)}" autocomplete="off"><div class="m173-tabs">${[['all','Tất cả'],['Điều chuyển','Điều chuyển'],['Nghỉ việc','Nghỉ việc'],['Chuyển ra ngoài ở','Ra ngoài ở']].map(([key,label])=>`<button type="button" data-m173-reason="${escapeHtml(key)}" class="${mArchiveReason===key?'active':''}">${label}</button>`).join('')}</div><small>Đang hiển thị ${fmt(display.length)} / ${fmt(filtered.length)} hồ sơ phù hợp</small></section>${canPurge?`<section class="m152-bulk" aria-label="Xóa nhiều hồ sơ"><div class="m152-bulkrow"><button type="button" class="mbtn outline" data-m152-toggle ${mArchiveDeleteBusy?'disabled':''}>${mArchiveSelecting?'✕ Hủy chọn':'☑ Chọn nhiều'}</button>${mArchiveSelecting?`<button type="button" class="mbtn outline" data-m152-all ${mArchiveDeleteBusy||!selectable.length?'disabled':''}>Chọn tất cả đang hiển thị</button><button type="button" class="mbtn outline" data-m152-clear ${mArchiveDeleteBusy||!selectedCount?'disabled':''}>Bỏ chọn</button>`:''}</div>${mArchiveSelecting?`<div class="m152-bulkrow"><strong>Đã chọn ${selectedCount} hồ sơ</strong><button type="button" class="mbtn m152-danger" data-m152-delete ${mArchiveDeleteBusy||!selectedCount?'disabled':''}>${mArchiveDeleteBusy?'Đang xóa…':'🗑 Xóa đã chọn ('+selectedCount+')'}</button></div>`:''}</section>`:''}${mArchiveDeleteStatus?`<div class="m152-result" role="status" aria-live="polite">${escapeHtml(mArchiveDeleteStatus)}</div>`:''}<div class="m173-list">${cards||'<div class="mpanel mempty">Không có hồ sơ phù hợp.</div>'}</div>${filtered.length>mArchiveLimit?'<button type="button" class="mbtn outline" data-m173-more style="width:100%">Xem thêm hồ sơ</button>':''}<button type="button" class="mbtn outline" data-mobile="list" style="width:100%;margin-top:10px">Danh sách công nhân đang ở →</button>`;
}

function ledgerMobile(){return `<iframe id="m142LedgerFrame" class="m-embed-frame" title="Sổ tăng giảm công nhân" src="/pages/so-tang-giam.html?mobile=1&v=223" style="display:block;width:100%;height:620px;min-height:620px;border:0;background:transparent" loading="eager"></iframe>`}
// V2.0.125 - Native mobile meal viewer; no nested iframe or blocked touch targets.
const menu125={date:(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})(),meal:'trua',vendor:'all',kind:'all',vendors:[],rows:[],busy:false,loaded:false,status:'Chọn ngày, bữa ăn rồi nhấn Xem thực đơn.'};
function menuMobile(){
 const m=menu125;
 const choices='<option value="all">Tất cả NCC</option>'+m.vendors.map(n=>`<option value="${escapeHtml(n)}" ${m.vendor===n?'selected':''}>${escapeHtml(n)}</option>`).join('');
 const dishes=m.rows.filter(r=>(m.vendor==='all'||r.vendor===m.vendor)&&(m.kind==='all'||r.kind===m.kind));
 return `<h2 class="mtitle">Xem thực đơn</h2><p class="msub">Thực đơn Mặn / Chay đồng bộ từ Supabase · Không mở cửa sổ phụ.</p>
 <section class="mpanel" style="padding:12px;overflow:visible">
 <div class="mfields" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
 <label>Ngày ăn<input id="m125Date" type="date" value="${escapeHtml(m.date)}" style="width:100%;min-width:0;min-height:44px"></label>
 <label>Bữa ăn<select id="m125Meal" style="width:100%;min-width:0;min-height:44px"><option value="sang" ${m.meal==='sang'?'selected':''}>Sáng</option><option value="trua" ${m.meal==='trua'?'selected':''}>Trưa</option><option value="chieu" ${m.meal==='chieu'?'selected':''}>Tối</option></select></label>
 <label style="grid-column:1/-1">Nhà cung cấp<select id="m125Vendor" style="width:100%;min-width:0;min-height:44px">${choices}</select></label></div>
 <button id="m125Load" type="button" class="mbtn" style="width:100%;min-height:44px;margin-top:12px" ${m.busy?'disabled':''}>${m.busy?'Đang tải...':'↻ Xem thực đơn / Tải Cloud'}</button>
 <p class="msub" role="status" id="m125Status" style="margin-top:10px;white-space:normal">${escapeHtml(m.status)}${m.loaded?' · Đang xem: '+escapeHtml(m.vendor==='all'?'Tất cả NCC':m.vendor)+' · '+dishes.length+' món':''}</p></section>
 <section class="mpanel" style="padding:12px;margin-top:12px;min-width:0">
 <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px">
 <button type="button" data-m125-kind="all" class="mbtn ${m.kind==='all'?'':'outline'}" style="min-height:44px">📋 Tất cả</button>
 <button type="button" data-m125-kind="man" class="mbtn ${m.kind==='man'?'':'outline'}" style="min-height:44px">🥩 Mặn</button>
 <button type="button" data-m125-kind="chay" class="mbtn ${m.kind==='chay'?'':'outline'}" style="min-height:44px">🌿 Chay</button></div>
 <b style="display:block;margin-bottom:10px">${m.kind==='all'?'Mặn + Chay':m.kind==='man'?'Mặn':'Chay'} · ${m.meal.toUpperCase()} · ${escapeHtml(m.date)} · ${dishes.length} món</b>
 ${dishes.length?dishes.map((r,i)=>`<div style="padding:10px 4px;border-bottom:1px solid #dde7f5;overflow-wrap:anywhere"><div style="display:flex;gap:8px;align-items:flex-start"><span style="min-width:24px;color:#64748b">${i+1}.</span><div style="min-width:0;flex:1"><strong>${m.kind==='all'?(r.kind==='chay'?'🌿 Chay · ':'🥩 Mặn · '):''}${escapeHtml(r.name)}</strong><div style="font-size:12px;color:#56709b;margin-top:3px">${escapeHtml(r.vendor)}${r.standard?' · '+escapeHtml(r.standard):''}</div></div></div></div>`).join(''):'<p class="msub">'+(m.loaded?'Không có món ăn phù hợp ngày, bữa và nhà cung cấp đã chọn.':'Bấm “Xem thực đơn / Tải Cloud” để tải dữ liệu.')+'</p>'}</section>`;
}
async function loadMenu125(){
 const m=menu125;const requestId=++mealRequestId;const date=m.date,meal=m.meal;m.busy=true;m.status='Đang tải thực đơn Cloud...';renderMenuNow();
 try{
  const cat=window.KTX_VENDOR_CATALOG;
  if(!cat||!cat.load)throw Error('Chưa khởi tạo danh mục NCC. Hãy đăng nhập lại rồi thử.');
  await cat.load(true);
  if(requestId!==mealRequestId)return;
  if(!cat.isReady?.())throw Error('Chưa tải được danh mục NCC đang hoạt động từ Supabase.');
  m.vendors=cat.activeNames().filter(n=>cat.isActive(n)&&String(n).trim().toLowerCase()!=='stargate');
  if(m.vendor!=='all'&&!m.vendors.includes(m.vendor))m.vendor='all';
  const sb=window.KTX_MEAL_BRIDGE?.client;
  if(!sb)throw Error('Chưa kết nối Supabase. Kiểm tra mục Đồng bộ Supabase.');
  const {data,error}=await sb.from('ktx_meal_menus').select('vendor,menu_type,dishes').eq('meal_date',date).eq('meal_period',meal).limit(1000);
  if(requestId!==mealRequestId)return;
  if(error)throw Error(error.message);
  const valid=new Set(m.vendors.map(n=>n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()));
  m.rows=[];
  for(const row of data||[]){const vendor=String(row.vendor||'').trim();const canonical=m.vendors.find(n=>n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()===vendor.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim());if(!canonical||!valid.has(canonical.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()))continue;
   const kind=/chay/i.test(String(row.menu_type||''))?'chay':'man';for(const dish of (Array.isArray(row.dishes)?row.dishes:[])){const name=String(dish.name||'').trim();if(name)m.rows.push({vendor:canonical,kind,name,standard:String(dish.standard||'')})}}
  m.loaded=true;m.status='Đã tải '+m.rows.length+' món từ Supabase, chỉ hiển thị NCC còn hoạt động.';
 }catch(e){if(requestId===mealRequestId){m.loaded=false;m.rows=[];m.status='Không tải được thực đơn: '+(e?.message||String(e));}}
 finally{if(requestId===mealRequestId){m.busy=false;if(screen==='menu238'&&mobile())renderMenuNow();}}
}

// Select changes must redraw immediately, bypassing the global typing-focus defer guard.
function renderMenuNow(){const active=document.activeElement;if(active&&root.contains(active)&&active.matches('input,select,textarea')){try{active.blur()}catch(_){}}if(screen==='menu238'&&mobile()){window.__ktx200DeferredRender=false;render();}}
function assetsMobile(){return `<h2 class="mtitle">Cơ sở vật chất KTX</h2><iframe id="m181AssetsFrame" class="m-embed-frame" title="Quản lý cơ sở vật chất KTX" src="/pages/cosovatchat.html?mobile=1&v=234" style="display:block;width:100%;height:620px;min-height:620px;border:0;border-radius:0;background:transparent" loading="eager"></iframe>`}
function bindWorkerButtons(){root.querySelectorAll('[data-open-worker]').forEach(b=>b.onclick=()=>{chosen=b.dataset.openWorker;page('detail')});root.querySelectorAll('[data-edit-worker]').forEach(b=>b.onclick=()=>{const w=byId(b.dataset.editWorker);if(w&&assigned(w)&&can('edit',w)&&typeof edit==='function')edit(w)});root.querySelectorAll('[data-move-worker]').forEach(b=>b.onclick=()=>{const w=byId(b.dataset.moveWorker);if(w&&assigned(w)&&can('transfer',w)&&typeof openTransfer==='function')openTransfer(w)});root.querySelectorAll('[data-full-worker]').forEach(b=>b.onclick=()=>{const w=byId(b.dataset.fullWorker);if(w&&typeof view==='function')view(w)});root.querySelectorAll('[data-delete-worker]').forEach(b=>b.onclick=async()=>{const w=byId(b.dataset.deleteWorker);if(!w)return alert('Không tìm thấy hồ sơ công nhân. Hãy tải lại danh sách.');if(typeof can!=='function'||!can('del',w))return alert('Hồ sơ ngoài dãy được phân quyền hoặc tài khoản không có quyền.');if(typeof askLeave!=='function'||typeof delWorkers!=='function')return alert('Chức năng xóa chưa sẵn sàng.');const inf=await askLeave([w]);if(inf)await delWorkers([w],inf)})}
function bind(){
 if(screen==='menu238'){
  const m=menu125;
  root.querySelector('#m125Date')?.addEventListener('change',e=>{m.date=e.target.value;m.loaded=false;m.rows=[];loadMenu125()});
  root.querySelector('#m125Meal')?.addEventListener('change',e=>{m.meal=e.target.value;m.loaded=false;m.rows=[];loadMenu125()});
  root.querySelector('#m125Vendor')?.addEventListener('change',e=>{m.vendor=e.target.value;m.kind='all';if(m.loaded){m.status='Đang xem thực đơn theo NCC đã chọn';renderMenuNow()}else{loadMenu125()}});
  root.querySelector('#m125Load')?.addEventListener('click',()=>loadMenu125());
  root.querySelectorAll('[data-m125-kind]').forEach(b=>b.addEventListener('click',()=>{m.kind=b.dataset.m125Kind;renderMenuNow()}));
 }

 root.querySelectorAll('[data-m228-qr]').forEach(b=>b.addEventListener('click',()=>{
  const action=b.dataset.m228Qr;
  if(typeof can!=='function'||!can('qrApprove'))return alert('Tài khoản không có quyền duyệt đăng ký QR.');
  if(action==='history'){m228ShowQrHistory();return;}
  if(action==='in'||action==='out'){
   QT=action==='in'?'regin':'regout';
   qrPage();
  }
 }));
 root.querySelector('[data-m152-toggle]')?.addEventListener('click',()=>{if(mArchiveDeleteBusy)return;mArchiveSelecting=!mArchiveSelecting;mArchiveSelected.clear();mArchiveDeleteStatus='';render()});
 root.querySelectorAll('[data-m152-select]').forEach(c=>c.addEventListener('change',()=>{if(c.checked)mArchiveSelected.add(String(c.dataset.m152Select));else mArchiveSelected.delete(String(c.dataset.m152Select));render()}));
 root.querySelector('[data-m152-all]')?.addEventListener('click',()=>{const A=typeof ARC!=='undefined'&&Array.isArray(ARC)?ARC:[];const q=mArchiveQuery.trim().toLocaleLowerCase('vi-VN');const txt=a=>[a.w?.name,a.w?.mnv,a.w?.cccd,a.reason,a.note,K(a.w||{}),D(a.w||{})].join(' ').toLocaleLowerCase('vi-VN');A.filter(a=>(mArchiveReason==='all'||a.reason===mArchiveReason)&&(!q||txt(a).includes(q))).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,mArchiveLimit).filter(a=>assigned(a.w||{})).forEach(a=>mArchiveSelected.add(String(a.id)));render()});
 root.querySelector('[data-m152-clear]')?.addEventListener('click',()=>{mArchiveSelected.clear();render()});
 root.querySelector('[data-m152-delete]')?.addEventListener('click',()=>mobileArchiveDeleteSelected());
 root.querySelector('[data-m173-refresh]')?.addEventListener('click',()=>refreshMobileArchiveCloud());
 root.querySelectorAll('[data-m173-reason]').forEach(b=>b.addEventListener('click',()=>{mArchiveReason=b.dataset.m173Reason;mArchiveLimit=40;render()}));
 const arSearch=root.querySelector('#m173Search');if(arSearch){arSearch.addEventListener('input',()=>{mArchiveQuery=arSearch.value;const caret=arSearch.selectionStart;render();const next=root.querySelector('#m173Search');if(next){next.focus();try{next.setSelectionRange(caret,caret)}catch(_){}}})}
 root.querySelector('[data-m173-more]')?.addEventListener('click',()=>{mArchiveLimit+=40;render()});
 root.querySelectorAll('[data-m173-restore]').forEach(b=>b.addEventListener('click',()=>{const a=(typeof ARC!=='undefined'?ARC:[]).find(a=>String(a.id)===String(b.dataset.m173Restore));if(!a||!assigned(a.w)||typeof can!=='function'||!can('restore'))return alert('Không có quyền khôi phục hồ sơ này.');if(typeof arcRestoreEdit29==='function')arcRestoreEdit29(a.id)}));
 root.querySelectorAll('[data-m71-nav]').forEach(b=>b.addEventListener('click',ev=>{
 ev.stopPropagation();const mode=b.dataset.m71Nav;
 mobileQrMode=mode==='outreview'?'review':mode;
 if(mode==='review'||mode==='outreview'){if(window.__qrHubState){window.__qrHubState.section='review';window.__qrHubState.reviewTab=mode==='outreview'?'regout':'regin';window.__qrHubState.filterStatus='pending';}}
 else if(['regin','regout','history'].includes(mode)&&window.__qrHubState)window.__qrHubState.section=mode;
 render();
 }));
 root.querySelectorAll('[data-mobile]').forEach(b=>b.addEventListener('click',(event)=>{event.stopPropagation();
  const k=b.dataset.mobile;
  if(k==='vault208'){page('vault208');return;}if(['home','list','account','qr','dayman','moreview','assets','ledger','archive'].includes(k)){if(k==='qr'){mobileQrMode='landing';if(window.__qrHubState)window.__qrHubState.section='registration'}page(k);}
  else if(k==='residence'){if(typeof go==='function')go('t6')}
  else if(k==='worker-report'){
   if(typeof can==='function'&&!can('report'))return alert('Tài khoản chưa có quyền xuất báo cáo.');
   // Dùng đúng mẫu Word trên PC, chỉ đổi đầu ra thành Clipboard để gửi Zalo.
   const report=typeof window.ktxDailyHeadcountReportText==='function'?window.ktxDailyHeadcountReportText():'';
   if(!report)return alert('Chưa tải được dữ liệu công nhân. Hãy chọn Tải Cloud trước khi sao chép báo cáo.');
   try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(report).then(()=>alert('Đã sao chép báo cáo. Mở Zalo và chọn Dán.')).catch(()=>prompt('Sao chép nội dung sau để dán vào Zalo:',report))}else{prompt('Sao chép nội dung sau để dán vào Zalo:',report)}}catch(e){prompt('Sao chép nội dung sau để dán vào Zalo:',report)}
  }
  else if(k==='reports'){if(typeof go==='function')go('reports')}
  else if(k==='menu238'){page('menu238')}
  else if(k==='add'){if(typeof can==='function'&&!can('add'))return alert('Tài khoản không có quyền thêm công nhân.');if(typeof edit==='function')edit();else alert('Chức năng chưa sẵn sàng')}
  else if(k==='install'){if(typeof pwaOpenInstall==='function')pwaOpenInstall();else {const dlg=document.getElementById('pwaInstallDlg');if(dlg&&typeof dlg.showModal==='function')dlg.showModal();else alert('Dùng mục Cài đặt ứng dụng trong menu trình duyệt để thêm KTX Hóc Môn vào màn hình chính.');}}
  else if(k==='dismiss-error'){cloudError='';root.querySelector('.m37-dismissible')?.remove()}
  else if(k==='refresh'){lastCloudCheck=0;tryCloudRead(true)}
  else if(k==='meal'){if(typeof RP!=='undefined'){RP.f=RP.A[mkey()]=RP.A[mkey()]||{};mealFill()}page('meal');refreshMeal213()}
  
  else if(k==='meal-show'){
    if(typeof RP!=='undefined'&&RP.on&&RP.on.size===0&&typeof NCCS!=='undefined'){NCCS.forEach(n=>RP.on.add(n));render()}
    refreshMeal213().catch(e=>{const st=root.querySelector('#m213CloudStatus');if(st)st.textContent='Không tải được: '+(e.message||e)});requestAnimationFrame(()=>root.querySelector('#m198MealResults')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  else if(k==='meal-select-all'){if(typeof RP!=='undefined'&&typeof NCCS!=='undefined'){NCCS.forEach(n=>RP.on.add(n));render();root.querySelector('#m198MealResults')?.scrollIntoView({behavior:'smooth',block:'start'})}}
  else if(k==='meal-copy'){const t=typeof mealText==='function'?mealText():'';navigator.clipboard?.writeText(t).then(()=>alert('Đã sao chép báo cáo')).catch(()=>prompt('Sao chép báo cáo:',t))}
  else if(k==='meal-download'){if(typeof saveDocx==='function'&&typeof mealText==='function')saveDocx(mealText().split('\n'),`bao-cao-suat-an-${RP.ses}-${RP.date}.docx`)}
  else if(k==='logout'&&typeof authHubLogout==='function')authHubLogout('local');
  else if(k==='more'){limit+=35;render()}
 }));
 root.querySelectorAll('[data-day-ktx-filter]').forEach(b=>b.addEventListener('click',()=>{dayKtxFilter=b.dataset.dayKtxFilter||'';render()}));
 root.querySelectorAll('[data-day-mode]').forEach(b=>b.addEventListener('click',()=>{const next=b.dataset.dayMode==='all';if(dayViewAll===next)return;dayViewAll=next;render()}));
 root.querySelectorAll('[data-overview-ktx]').forEach(b=>b.addEventListener('click',()=>{
  const next=b.dataset.overviewKtx;
  if(next===overviewKtx)return;
  overviewKtx=next;
  // Keep the tab buttons mounted: rebuilding them caused multiple taps/flicker on Android.
  root.querySelectorAll('[data-overview-ktx]').forEach(tab=>{
    const active=tab.dataset.overviewKtx===next;
    tab.classList.toggle('is-active',active);
    tab.setAttribute('aria-pressed',String(active));
  });
  updateHomeWithoutRemount();
}));
 root.querySelectorAll('[data-day-ktx]').forEach(b=>b.addEventListener('click',()=>{fromDayView=true;ktx=b.dataset.dayKtx;day=b.dataset.dayName;room=b.dataset.dayRoom||'';query='';status='';page('list')}));
 bindWorkerButtons();
 const ft=root.querySelector('#m37FilterToggle');if(ft)ft.onclick=()=>{mobileFiltersOpen=!mobileFiltersOpen;ft.setAttribute('aria-expanded',String(mobileFiltersOpen));root.querySelector('.mfilters')?.classList.toggle('m37-open',mobileFiltersOpen)};
 const f=root.querySelector('#mobileFind');
 if(f){
  f.setAttribute('type','search');f.setAttribute('inputmode','search');f.setAttribute('autocomplete','off');
  f.addEventListener('pointerdown',()=>{window.__ktx200InputActive=true},{passive:true});
  f.addEventListener('click',()=>{if(document.activeElement!==f)f.focus({preventScroll:true})});
  f.addEventListener('input',e=>{
   query=e.target.value;limit=35;
   // Refresh only list nodes, NEVER replace focused search input.
   const doc=new DOMParser().parseFromString(list(),'text/html');
   const fresh=doc.querySelector('.mlist'),existing=root.querySelector('.mlist');
   if(fresh&&existing){existing.innerHTML=fresh.innerHTML;bindWorkerButtons()}
   const count=doc.querySelector('[data-worker-count]'),label=root.querySelector('[data-worker-count]');
   if(count&&label)label.innerHTML=count.innerHTML;
  });
 }
 for(const [id,key] of [['mfK','ktx'],['mfD','day'],['mfR','room'],['mfS','status']]){
  const el=root.querySelector('#'+id);
  if(el)el.onchange=e=>{if(key==='ktx'){ktx=e.target.value;day='';room=''}if(key==='day'){day=e.target.value;room=''}if(key==='room')room=e.target.value;if(key==='status')status=e.target.value;limit=35;render()}
 }
 const date=root.querySelector('#m195Date'),ses=root.querySelector('#m195Session'),kt=root.querySelector('#m195Ktx'),price=root.querySelector('#m195Price');
 if(date)date.onchange=e=>{RP.date=e.target.value;mealSwitch();render();refreshMeal213()};
 if(ses)ses.onchange=e=>{RP.ses=e.target.value;RP.price=mealDefaultPrice(RP.ses);mealSwitch();render();refreshMeal213()};
 if(kt)kt.onchange=e=>{RP.ktx=e.target.value;render()};
 if(price)price.oninput=e=>{RP.price=e.target.value;updateMealReport()};
 root.querySelectorAll('[data-meal-select]').forEach(el=>el.onchange=e=>{el.checked?RP.on.add(el.dataset.mealSelect):RP.on.delete(el.dataset.mealSelect);render()});
 root.querySelectorAll('[data-meal-vendor]').forEach(el=>el.oninput=()=>{
  const n=el.dataset.mealVendor,key=el.dataset.mealKey;
  RP.f[n]=RP.f[n]||{};RP.f[n][key]=el.value;
  const total=root.querySelectorAll('[data-total-ncc]');total.forEach(b=>{if(b.dataset.totalNcc===n)b.textContent=mealTot(n)??0});
  updateMealReport();
 });
}
async function refreshMeal213(){
 if(typeof RP==='undefined'||typeof window.KTX213_PULL_MENUS!=='function'||screen!=='meal')return;
 const date=RP.date,period=RP.ses,requestId=++mealRequestId;
 const stat=root.querySelector('#m213CloudStatus');
 if(stat)stat.textContent='Đang tải thực đơn '+date+' · '+({sang:'Sáng',trua:'Trưa',chieu:'Chiều'}[period]||period)+'…';
 try{
  let out=await window.KTX213_PULL_MENUS(date,period);
  if(!out.ok&&String(out.error||'').includes('Chưa kết nối')){
   await new Promise(resolve=>setTimeout(resolve,1100));
   if(screen==='meal'&&RP.date===date&&RP.ses===period&&requestId===mealRequestId)out=await window.KTX213_PULL_MENUS(date,period);
  }
  if(screen!=='meal'||RP.date!==date||RP.ses!==period||requestId!==mealRequestId)return;
  if(out.ok){
   if(typeof mealFill==='function')mealFill();
   // Refresh only menu text, preserving focused quantity fields and edits.
   const cards=root.querySelectorAll('[data-meal-vendor]');
   const active=document.activeElement;
   if(cards.length&&active&&root.contains(active)&&active.matches('input,textarea,select')){
    const fresh=document.createElement('div');fresh.innerHTML=mealMobile();
    const next=fresh.querySelector('#m198MealResults');const old=root.querySelector('#m198MealResults');
    if(next&&old){
     const updated=next.querySelectorAll('.m195-menu');const existing=old.querySelectorAll('.m195-menu');
     existing.forEach((el,i)=>{if(updated[i])el.innerHTML=updated[i].innerHTML});
    }
    updateMealReport();
   }else render();
  }
  const el=root.querySelector('#m213CloudStatus');
  if(el)el.textContent=out.ok?(out.count?'Đã tải '+out.count+' bảng Mặn/Chay · '+date+' · '+period+'.':'Cloud chưa có thực đơn cho '+date+' · '+period+'. Hãy kiểm tra việc nhập và lưu Menu Cloud trên PC.'):'Không tải được thực đơn Cloud: '+out.error;
 }catch(e){
  if(screen==='meal'&&requestId===mealRequestId){const el=root.querySelector('#m213CloudStatus');if(el)el.textContent='Không tải được thực đơn: '+(e.message||e)}
 }
}
function updateMealReport(){const pre=root.querySelector('#m195Preview');if(pre&&typeof mealText==='function')pre.textContent=mealText()}

let vaultAnchor208=null;
const vaultSection208=document.getElementById('t7');
function restoreVault208(){if(vaultAnchor208&&vaultSection208){vaultAnchor208.replaceWith(vaultSection208);vaultSection208.classList.add('hide');vaultAnchor208=null}}
function vaultMobile208(){return `<h2 class="mtitle">Kho tài liệu</h2><section id="m208VaultHost" class="m208-vault-host"></section>`}
const qrSection=document.getElementById('qr');
let qrAnchor=null;
function restoreQr(){if(qrAnchor&&qrSection){qrAnchor.replaceWith(qrSection);qrSection.classList.add('hide');qrSection.classList.remove('m196-mounted');qrAnchor=null}}
let dedupAnchor238=null;
const dedupSection238=document.getElementById('t2');
function restoreDedup238(){if(dedupAnchor238&&dedupSection238){dedupAnchor238.replaceWith(dedupSection238);dedupSection238.classList.add('hide');dedupAnchor238=null}}
function utils238(){return `<h2 class="mtitle">Tiện ích</h2><div class="step238-utilgrid"><button type="button" data-mobile="duplicate"><i><svg class="mi" aria-hidden="true"><use href="#i-layers"/></svg></i>Lọc trùng</button></div>`}
function duplicate238(){return `<h2 class="mtitle">Lọc trùng</h2><section class="mpanel step238-dedup" id="step238DuplicateHost"></section>`}
function incident238(){return `<h2 class="mtitle">Biên bản sự vụ</h2><iframe class="step238-frame" loading="lazy" title="Biên bản sự vụ" src="/pages/bien-ban-su-vu.html"></iframe>`}
let mobileQrMode='landing';
const mobileQrSafe=v=>escapeHtml(String(v==null?'':v));
function mobileQrCounts(){const q=window.__qrHubState?.counts||{};return {in:Number(q.regin)||0,out:Number(q.regout)||0};}
function mobileQrPreview(){
 const allowed=typeof can==='function'&&(can('qrApprove')||can('attendance'));
 if(!allowed)return '';
 const rows=(typeof QRREQ!=='undefined'&&Array.isArray(QRREQ)?QRREQ:[]).filter(r=>r.status==='pending').slice(0,2);
 return `<section class="m71-preview"><div class="m71-previewhead"><h3>Hồ sơ chờ duyệt</h3><button type="button" data-m71-nav="review">Xem tất cả ›</button></div>${rows.length?rows.map(r=>`<article class="m71-request"><div class="m71-person"><span class="m71-avatar">${mobileQrSafe((r.name||'?').slice(0,1).toUpperCase())}</span><div><strong>${mobileQrSafe(r.name||'Chưa có họ tên')}</strong><p>${mobileQrSafe([r.ktx,r.day,r.room?'Phòng '+r.room:''].filter(Boolean).join(' · '))}</p><small>${r.request_type==='out'?'Đăng ký ra':'Đăng ký vào'} · ${mobileQrSafe(r.created_at?new Date(r.created_at).toLocaleString('vi-VN'):'')}</small></div><span class="m71-pending">Chờ duyệt</span></div><div class="m71-request-actions"><button data-m71-nav="${r.request_type==='out'?'outreview':'review'}">Xem và xử lý hồ sơ →</button></div></article>`).join(''):'<div class="m71-empty">Chưa có hồ sơ chờ duyệt đã tải trên thiết bị.</div>'}</section>`;
}
function qr205RecentActivity(){
 const rows=(typeof QRREQ!=='undefined'&&Array.isArray(QRREQ)?QRREQ:[]).slice()
  .sort((a,b)=>Date.parse(b.created_at||0)-Date.parse(a.created_at||0)).slice(0,3);
 return `<section class="qr205-recent"><div class="qr205-recent-head"><h3>Lịch sử hồ sơ QR gần đây</h3><button type="button" data-m71-nav="history">Xem tất cả →</button></div>${rows.length?rows.map(r=>{
  const type=r.request_type==='out'?'Đăng ký ra':'Đăng ký vào';
  const label=r.status==='approved'?'Đã duyệt':r.status==='rejected'?'Từ chối':'Chờ duyệt';
  const kind=r.status==='approved'?'done':r.status==='rejected'?'denied':'waiting';
  const date=r.created_at&&Number.isFinite(Date.parse(r.created_at))?new Date(r.created_at).toLocaleString('vi-VN'):'—';
  return `<article class="qr205-recent-row"><span class="qr205-recent-symbol" aria-hidden="true">${r.request_type==='out'?'↩':'↪'}</span><div class="qr205-recent-main"><strong>${type}</strong><small>${mobileQrSafe(r.name||'Chưa có họ tên')} · ${mobileQrSafe(r.ktx||'Chưa rõ KTX')}</small></div><div class="qr205-recent-right"><time>${mobileQrSafe(date)}</time><span class="qr205-recent-badge ${kind}">${label}</span></div></article>`;
 }).join(''):'<p class="qr205-recent-empty">Chưa có hồ sơ QR trong dữ liệu đã tải.</p>'}</section>`;
}
function ktx78CardifyQr(){
 if(screen!=='qr'||mobileQrMode==='landing')return;
 const host=root.querySelector('#m196QrHost');if(!host)return;
 host.querySelectorAll('table').forEach(table=>{
  if(table.classList.contains('ktx78-cardified')||table.closest('.qr-review-cards')||table.closest('.ktx78-mobile-cards'))return;
  const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
  const trs=[...table.querySelectorAll('tbody tr')];if(!trs.length)return;
  const cards=document.createElement('div');cards.className='ktx78-mobile-cards';
  for(const tr of trs){const cells=[...tr.querySelectorAll(':scope > td')];if(!cells.length)continue;
   const info=cells.map((td,i)=>({name:heads[i]||('Thông tin '+(i+1)),text:(td.innerText||td.textContent||'').trim(),cell:td}));
   const name=info.find(v=>/họ tên|công nhân/i.test(v.name))||info[0];
   const stat=info.find(v=>/trạng thái/i.test(v.name));
   const card=document.createElement('article');card.className='ktx78-mobile-card';
   const head=document.createElement('div');head.className='ktx78-mobile-card-title';
   const title=document.createElement('div');title.className='ktx78-mobile-card-name';title.textContent=name.text.split('\n')[0]||'Hồ sơ';head.append(title);
   if(stat){const badge=document.createElement('span');badge.className='ktx78-mobile-card-status';badge.textContent=stat.text||'—';if(/duyệt|approved/i.test(stat.text)&&!/chờ/i.test(stat.text))badge.classList.add('is-approved');if(/từ chối|rejected/i.test(stat.text))badge.classList.add('is-rejected');head.append(badge)}
   card.append(head);const details=document.createElement('div');details.className='ktx78-mobile-card-details';
   for(const item of info){if(item===name||item===stat||/thao tác/i.test(item.name))continue;const field=document.createElement('div');field.className='ktx78-mobile-card-field';const label=document.createElement('small');label.textContent=item.name;const value=document.createElement('strong');value.textContent=item.text||'—';field.append(label,value);details.append(field)}card.append(details);
   // Historical records are read-only; never synthesize new approval actions.
   cards.append(card);
  }
  if(cards.children.length){table.classList.add('ktx78-cardified');table.parentElement.insertBefore(cards,table.nextSibling)}
 });
}
let ktx78QrObserver=null;
function ktx78WatchQr(){if(ktx78QrObserver)ktx78QrObserver.disconnect();const host=root.querySelector('#m196QrHost');if(!host)return;let scheduled=false;
 ktx78QrObserver=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;ktx78CardifyQr()})});
 ktx78QrObserver.observe(host,{subtree:true,childList:true});ktx78CardifyQr();
}
function qrMobile(){
 // v228: Two registration QR codes and exactly three review actions on mobile.
 return `<section class="m71-detail m227-qr-screen m228-qr-screen">
   <h2 class="mtitle">QR đăng ký vào/ra</h2>
   <div class="m228-qr-actions" role="group" aria-label="Duyệt đăng ký và lịch sử">
     <button type="button" data-m228-qr="in">Duyệt vào</button>
     <button type="button" data-m228-qr="out">Duyệt ra</button>
     <button type="button" data-m228-qr="history">Lịch sử duyệt</button>
   </div>
   <div id="m196QrHost" aria-live="polite"></div>
 </section>`;
}
async function m228ShowQrHistory(){
 if(typeof can!=='function'||!can('qrApprove'))return alert('Tài khoản không có quyền xem hồ sơ duyệt QR.');
 const box=root.querySelector('#m196QrHost #qb');if(!box)return;
 box.innerHTML='<div class="mpanel">Đang tải lịch sử duyệt...</div>';
 try{
  const sb=typeof qrSb==='function'?qrSb():null;
  if(!sb)throw new Error('Chưa kết nối Supabase.');
  const {data:{session}}=await sb.auth.getSession();
  if(!session)throw new Error('Cần đăng nhập Supabase để xem lịch sử.');
  const {data,error}=await sb.from('residency_requests').select('request_type,name,worker_code,ktx,day,room,status,created_at,reviewed_at').in('status',['approved','rejected']).order('created_at',{ascending:false}).limit(200);
  if(error)throw error;
  // The server's RLS and qrApprove permission remain authoritative.
  const rows=(data||[]).map(r=>`<article class="m228-history-item"><div><strong>${escapeHtml(r.name||'—')}</strong><span>${r.request_type==='out'?'Đăng ký ra':'Đăng ký vào'} · ${escapeHtml(r.ktx||'—')} · ${escapeHtml(r.day||'—')} · P.${escapeHtml(r.room||'—')}</span><small>${escapeHtml(r.created_at?new Date(r.created_at).toLocaleString('vi-VN'):'—')}</small></div><b class="${r.status==='approved'?'done':'rejected'}">${r.status==='approved'?'Đã duyệt':'Từ chối'}</b></article>`).join('');
  if(!box.isConnected)return;
  box.innerHTML=`<section class="mpanel m228-history"><h3>Lịch sử duyệt đăng ký vào/ra</h3>${rows||'<p class="mut">Chưa có hồ sơ đã xử lý.</p>'}</section>`;
 }catch(e){if(box.isConnected){box.innerHTML='<div class="mpanel" role="alert">Không tải được lịch sử duyệt: '+escapeHtml(e.message||e)+'</div>';}}
}

function updateHomeWithoutRemount(){
 if(screen!=='home'||!root.querySelector('.m131-switch'))return false;
 const staging=document.createElement('div');staging.innerHTML=summaryByKtx();
 const oldTabs=root.querySelectorAll('[data-overview-ktx]');
 const newTabs=staging.querySelectorAll('[data-overview-ktx]');
 if(oldTabs.length!==newTabs.length||[...oldTabs].some((b,i)=>b.dataset.overviewKtx!==newTabs[i].dataset.overviewKtx))return false;
 oldTabs.forEach(b=>{const on=b.dataset.overviewKtx===overviewKtx;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on))});
 for(const selector of ['.m131-hero','.m131-grid','.m131-residence','.m131-note','.mcloudwarn']){
  const oldNode=root.querySelector(selector),newNode=staging.querySelector(selector);
  if(oldNode&&newNode){if(oldNode.outerHTML!==newNode.outerHTML)oldNode.replaceWith(newNode)}
  else if(oldNode&&!newNode)oldNode.remove();
  else if(newNode&&!oldNode){const anchor=root.querySelector('.m131-actions');if(anchor)anchor.before(newNode)}
 }
 return true;
}
function render(){
 // Do not mount the mobile app behind the login gate.
 // On successful authentication the existing login callback invokes all()/render().
 if(document.body.classList.contains('auth-locked')){
   if(root.childElementCount)root.replaceChildren();
   return;
 }
 if(!mobile()){restoreQr();restoreVault208();return}
 // Giữ iframe Cơ sở vật chất khi dữ liệu nền được làm mới: không cuộn về đầu,
 // không mất danh sách và không làm đóng hộp thoại người dùng đang chỉnh sửa.
 if(screen==='vault208' && root.querySelector('#m208VaultHost #t7'))return;
 if(screen==='assets' && root.querySelector('#m181AssetsFrame'))return;
 if(screen==='ledger' && root.querySelector('#m142LedgerFrame'))return;
 if(updateHomeWithoutRemount())return;
if(screen==='incident'||screen==='utils238'||screen==='duplicate')screen='home';if(root.contains(document.activeElement)&&document.activeElement?.matches('input:not([type=checkbox]):not([type=radio]),textarea,select')){window.__ktx200DeferredRender=true;return}restoreQr();restoreDedup238();restoreVault208();root.innerHTML=shell(screen==='home'?summary():screen==='list'?list():screen==='detail'?detail():screen==='meal'?mealMobile():screen==='menu238'?menuMobile():screen==='qr'?qrMobile():screen==='dayman'?dayman():screen==='moreview'?moreMobile():screen==='assets'?assetsMobile():screen==='ledger'?ledgerMobile():screen==='archive'?mobileArchive():screen==='vault208'?vaultMobile208():screen==='utils238'?utils238():screen==='duplicate'?duplicate238():account());if(screen==='duplicate'&&dedupSection238){const host=root.querySelector('#step238DuplicateHost');if(host){dedupAnchor238=document.createComment('STEP238 dedup original location');dedupSection238.parentNode.insertBefore(dedupAnchor238,dedupSection238);host.appendChild(dedupSection238);dedupSection238.classList.remove('hide')}}
if(screen==='vault208'&&vaultSection208){
 const host=root.querySelector('#m208VaultHost');if(host){vaultAnchor208=document.createComment('vault mobile original position');vaultSection208.parentNode.insertBefore(vaultAnchor208,vaultSection208);host.appendChild(vaultSection208);vaultSection208.classList.remove('hide');try{docsPage()}catch(e){host.insertAdjacentHTML('afterbegin','<p class="mut">Không tải được Kho tài liệu. Kiểm tra kết nối Supabase và quyền Quản trị.</p>')}}}
if(screen==='qr'&&qrSection){try{QT='make';if(typeof window.qrPage==='function')window.qrPage()}catch(e){console.warn('QR render:',e)}const h=root.querySelector('#m196QrHost');if(h){qrAnchor=document.createComment('qr mobile mount point');qrSection.parentNode.insertBefore(qrAnchor,qrSection);h.appendChild(qrSection);qrSection.classList.remove('hide');qrSection.classList.add('m196-mounted');ktx78WatchQr()}}bind()}

function applyEmbeddedFrameHeight(frameId,nextHeight,minHeight){
 const frame=document.getElementById(frameId);
 if(!frame)return;
 const h=Math.max(Number(nextHeight)||0,minHeight||0);
 if(!h)return;
 frame.style.height=h+'px';
 frame.style.minHeight=h+'px';
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin)return;
 const data=event.data||{};
 if(data.type==='ktx-ledger-frame-height-v201'){applyEmbeddedFrameHeight('m142LedgerFrame',(Number(data.height)||0)+16,620);}
 if(data.type==='ktx-facility-document-height'){applyEmbeddedFrameHeight('m181AssetsFrame',(Number(data.height)||0)+16,620);}
});
document.addEventListener('focusin',e=>{if(root.contains(e.target)&&e.target.matches('input,textarea,select'))window.__ktx200InputActive=true},true);document.addEventListener('focusout',e=>{if(root.contains(e.target)&&e.target.matches('input,textarea,select')){window.__ktx200InputActive=false;if(window.__ktx200DeferredRender){window.__ktx200DeferredRender=false;setTimeout(()=>{if(!root.contains(document.activeElement)||!document.activeElement?.matches('input,textarea,select'))render()},120)}}},true);
function refresh(){if(mobile())requestMobileRedraw();else if(root.childElementCount)root.replaceChildren()}
const originalAll=typeof all==='function'?all:null;
let pendingMobileRedraw=false;
function requestMobileRedraw(){
 if(pendingMobileRedraw||!mobile()||document.hidden||document.body.classList.contains('auth-locked'))return;
 pendingMobileRedraw=true;
 setTimeout(()=>{pendingMobileRedraw=false;if(mobile()&&!document.hidden&&!document.body.classList.contains('auth-locked'))render()},120);
}
if(originalAll){try{all=function(){const v=originalAll.apply(this,arguments);requestMobileRedraw();return v}}catch(e){}}

/* V2.0.78: enforce exactly one Mobile view, even against legacy inline !important. */
function syncSingleMobileSurface(){
 const gate=document.getElementById('authHubGate');
 const loginOpen=document.body.classList.contains('auth-locked')||!!(gate&&!gate.classList.contains('hide'));
 if(loginOpen){
  if(root.style.getPropertyValue('display')!=='none'||root.style.getPropertyPriority('display')!=='important')root.style.setProperty('display','none','important');
  if(root.style.getPropertyValue('visibility')!=='hidden'||root.style.getPropertyPriority('visibility')!=='important')root.style.setProperty('visibility','hidden','important');
  if(root.childElementCount)root.replaceChildren();
 }else{
  if(root.style.getPropertyValue('display')==='none')root.style.removeProperty('display');
  if(root.style.getPropertyValue('visibility')==='hidden')root.style.removeProperty('visibility');
  if(mobile()&&!root.childElementCount)requestMobileRedraw();
 }
 if(gate&&!gate.__ktx2078Observed){
  gate.__ktx2078Observed=true;
  new MutationObserver(syncSingleMobileSurface).observe(gate,{attributes:true,attributeFilter:['class']});
 }
}
new MutationObserver(syncSingleMobileSurface).observe(document.body,{attributes:true,attributeFilter:['class'],childList:true});
new MutationObserver(syncSingleMobileSurface).observe(root,{attributes:true,attributeFilter:['style']});
syncSingleMobileSurface();
window.addEventListener('resize',refresh);window.addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
setTimeout(refresh,400);setTimeout(refresh,1500);let tries=0;const timer=setInterval(()=>{if(!mobile()){if(++tries>50)clearInterval(timer);return}if(workers().length){clearInterval(timer);render();if(screen==='home'&&!mArchiveCloudLoaded&&!mArchiveCloudBusy)refreshMobileArchiveCloud();return}tryCloudRead();if(++tries>80)clearInterval(timer)},1700);
})();

;(()=>{let queued=false;window.addEventListener("ktx-global-settings-changed",()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;try{if(typeof render==="function")render()}catch(e){console.warn("Mobile settings redraw",e)}},100)})})();
