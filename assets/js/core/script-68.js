/* KTX mobile pilot: read/write via existing workers & permissions. No separate worker store. */
(function(){
'use strict';
const root=document.getElementById('mobile180');
if(!root)return;
const mobile=()=>matchMedia('(max-width:760px)').matches;
let mealRequestId=0;
let mobileFiltersOpen=false;
let screen=(location.hash==='#qr'?'qr':location.hash==='#work'?'list':'home'), query='',ktx='',day='',room='',status='',chosen=null,limit=35;let dayViewAll=false,fromDayView=false;let cloudBusy=false,cloudError='',lastCloudCheck=0,cloudReady=false;
const escapeHtml=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allWorkers=()=>typeof W!=='undefined'&&Array.isArray(W)?W:[];
const assigned=w=>{try{return typeof inScope==='function'?inScope(w):false}catch(_){return false}};
const hasGlobalRead=()=>{try{return typeof ME!=='undefined'&&ME.role==='admin'||(typeof ME!=='undefined'&&ME.acct&&ME.acct.view_all_days===true)}catch(_){return false}};
// Global view requires an explicit account permission. No privilege escalation through this toggle.
const readAllDays=()=>dayViewAll; // View-only scope; write permissions remain checked by assigned()/can().
const workers=()=>{try{return allWorkers().filter(w=>readAllDays()&&['dayman','list','detail'].includes(screen)?true:typeof can==='function'?can('view',w):true)}catch(e){return []}};
const byId=id=>workers().find(w=>String(w.id)===String(id));
const loc=w=>`${typeof K==='function'?K(w):w.ktx||''} · ${typeof D==='function'?D(w):w.day||''} · P.${typeof R==='function'?R(w):w.room||'—'}`;
const male=w=>String(w.gt||'').toLowerCase().includes('nam')?'Nam':String(w.gt||'').toLowerCase().includes('nữ')?'Nữ':(w.gt||'—');
const missing=w=>!(String(w.cccd||'').trim()&&String(w.sdt||'').trim());
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const page=x=>{const prior=screen;screen=x;if(x==='dayman')fromDayView=true;else if(!['list','detail'].includes(x))fromDayView=false;limit=35;render();window.scrollTo(0,0);if(x==='list'||x==='home')tryCloudRead();if(prior!==x)window.dispatchEvent(new CustomEvent('ktx:mobile-screen',{detail:{screen:x,workerId:chosen}}))};
window.KTX_MOBILE_RESTORE_SCREEN=function(state){if(!state||!state.screen)return;screen=state.screen;chosen=state.workerId||null;limit=35;render();window.scrollTo(0,0)};
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
function moreMobile(){return `<h2 class="mtitle">Thêm tiện ích</h2><p class="msub">Các chức năng khác của KTX</p><section class="mpanel"><div class="mactions"><button class="maction" data-mobile="qr">QR code</button><button class="maction" data-mobile="dayman">Quản lý dãy</button><button class="maction amber" data-mobile="menu238">Xem thực đơn</button><button class="maction" data-mobile="residence">Đăng ký tạm trú</button><button class="maction" data-mobile="archive">Điều chuyển · Nghỉ việc</button><button class="maction" data-mobile="reports">Báo cáo</button><button class="maction" data-mobile="assets"><i><svg class="mi"><use href="#i-bld"/></svg></i>Cơ sở vật chất</button><button class="maction" data-mobile="account">Tài khoản</button></div></section>`}
function shell(content){return `<header class="mbar"><div class="mbrand"><i><img src="./ktx-logo.png" alt="Logo KTX Hóc Môn"></i><span>KTX Hóc Môn</span></div><button class="mavatar" data-mobile="account" aria-label="Tài khoản"><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg></button></header><div class="mpage">${content}</div><div class="mbottom"><button data-mobile="home" class="${screen==='home'?'active':''}"><span><svg class="mi"><use href="#i-home"/></svg></span>Tổng quan</button><button data-mobile="list" class="${['list','detail'].includes(screen)?'active':''}"><span><svg class="mi"><use href="#i-users"/></svg></span>Công nhân</button><button data-mobile="qr" class="${screen==='qr'?'active':''}"><span><svg class="mi"><use href="#i-qr"/></svg></span>QR code</button></div>`}
let overviewKtx='all';
function summaryByKtx(){
 const allowed=workers();
 const isAdmin=typeof ME!=='undefined'&&ME.role==='admin';
 // Non-admin accounts only see KTX that already contain workers in their readable scope.
 const choices=(isAdmin?['KTX 1','KTX 2']:[...new Set(allowed.map(w=>K(w)).filter(Boolean))]).sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
 if(overviewKtx!=='all'&&!choices.includes(overviewKtx))overviewKtx='all';
 const scope=overviewKtx==='all'?allowed:allowed.filter(w=>K(w)===overviewKtx);
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
 const total=scope.length,activeRooms=rm.size;
 const pct=total?Math.round(registered/total*100):0;
 const stat=(label,n,cls,icon)=>`<div class="m131-stat ${cls}"><span class="m131-stat-icon">${icon}</span><b>${fmt(n)}</b><small>${label}</small></div>`;
 const tabs=[['all','Toàn KTX'],...choices.map(k=>[k,k])];
 const locationName=overviewKtx==='all'?'Toàn KTX':overviewKtx;
 const actions=`<section class="mpanel m131-actions"><h3>Truy cập nhanh</h3><div class="mactions"><button class="maction" data-mobile="list"><i><svg class="mi"><use href="#i-users"/></svg></i>Danh sách công nhân →</button><button class="maction green" data-mobile="add" ${typeof can==='function'&&can('add')?'':'style="display:none"'}><i><svg class="mi"><use href="#i-plus"/></svg></i>Thêm công nhân →</button><button class="maction" data-mobile="dayman"><i><svg class="mi"><use href="#i-bld"/></svg></i>Quản lý dãy →</button><button class="maction" data-mobile="assets"><i><svg class="mi"><use href="#i-bld"/></svg></i>Cơ sở vật chất →</button><button class="maction amber" data-mobile="menu238"><i><svg class="mi"><use href="#i-menu"/></svg></i>Xem thực đơn →</button><button class="maction" data-mobile="qr"><i><svg class="mi"><use href="#i-qr"/></svg></i>QR điểm danh →</button><button class="maction amber" data-mobile="meal" ${typeof can==='function'&&can('report')?'':'style="display:none"'}><i><svg class="mi"><use href="#i-chart"/></svg></i>BC suất ăn →</button></div></section>`;
 return `<div class="m37-sync" role="status">${!navigator.onLine?"○ Ngoại tuyến · Chỉ xem dữ liệu đã tải":cloudBusy?"◌ Đang tải Cloud":cloudError?"⚠ Lỗi kết nối Cloud":"● Trực tuyến · Kiểm tra trạng thái lưu tại hệ thống"}</div><div class="m131-heading"><div><h2 class="mtitle">Tổng quan</h2><p class="msub">Quân số &amp; tình trạng cư trú theo từng KTX</p></div><button class="m131-reload" type="button" data-mobile="refresh" aria-label="Tải dữ liệu Cloud">↻</button></div>
 <div class="m131-switch" role="group" aria-label="Chọn phạm vi KTX">${tabs.map(([k,name])=>`<button type="button" data-overview-ktx="${escapeHtml(k)}" aria-pressed="${overviewKtx===k}" class="${overviewKtx===k?'is-active':''}">${escapeHtml(name)}</button>`).join('')}</div>
 <div class="m131-hero"><div><span class="m131-kicker">QUÂN SỐ · ${escapeHtml(locationName)}</span><strong>${fmt(total)}</strong><small>Công nhân trong phạm vi hiển thị</small></div><div class="m131-hero-mark"><svg class="mi"><use href="#i-bld"/></svg></div></div>
 <div class="m131-grid">${stat('Nam',men,'male','♂')}${stat('Nữ',women,'female','♀')}${stat('Dãy có người',dys.size,'blue','▦')}${stat('Phòng có người',activeRooms,'green','⌂')}${stat('Phòng quá tải',over,'orange','!')}${stat('Thiếu CCCD/SĐT',missingId,'red','!')}</div>
 <section class="mpanel m131-residence"><div class="m131-section-title"><h3>Đăng ký tạm trú</h3><b>${pct}%</b></div><div class="m131-progress"><span style="width:${pct}%"></span></div><div class="m131-residence-foot"><span>Đã đăng ký: <b>${fmt(registered)}</b></span><span>Chưa đăng ký: <b>${fmt(total-registered)}</b></span></div></section>

 ${unknown?`<p class="m131-note">${fmt(unknown)} hồ sơ chưa xác định giới tính.</p>`:''}${!allowed.length?'<div class="mcloudwarn">Chưa có dữ liệu trong phạm vi được cấp. Hãy kiểm tra kết nối Cloud.</div>':''}
 ${actions}`;
}
function summary(){return summaryByKtx();const s=stats(),sub=typeof ME!=='undefined'&&!!ME.id&&ME.role!=='admin';if(sub){const all=typeof W!=='undefined'&&Array.isArray(W)?W:[];return `<h2 class="mtitle">Tổng quan</h2><div class="msub">Quân số KTX và phạm vi được phân quyền</div><div class="mstats step231-summary step233-four"><div class="mstat step231-main"><span><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg></span><b>${fmt(all.length)}</b><small>Tổng quân số toàn KTX</small></div><div class="mstat"><span><svg class="mi" aria-hidden="true"><use href="#i-log"/></svg></span><b>${fmt(s.A.length)}</b><small>Quân số được phân quyền</small></div><div class="mstat step231-male"><span><svg class="mi" aria-hidden="true"><use href="#i-male"/></svg></span><b>${fmt(s.men)}</b><small>Nam</small></div><div class="mstat step231-female"><span><svg class="mi" aria-hidden="true"><use href="#i-female"/></svg></span><b>${fmt(s.women)}</b><small>Nữ</small></div></div>${s.unknown?`<div class="step231-unknown">${fmt(s.unknown)} hồ sơ thuộc phạm vi chưa xác định giới tính.</div>`:''}<section class="mpanel"><h3>Thao tác thường dùng</h3><div class="mactions"><button class="maction" data-mobile="list"><i><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg></i>Danh sách công nhân →</button><button class="maction green" data-mobile="add" ${typeof can==='function'&&can('add')?'':'style="display:none"'}><i><svg class="mi" aria-hidden="true"><use href="#i-plus"/></svg></i>Thêm công nhân →</button><button class="maction amber" onclick="window.openKiemTraMenuNCC()"><i><svg class="mi" aria-hidden="true"><use href="#i-menu"/></svg></i>Xem thực đơn →</button><button class="maction amber" data-mobile="meal" ${typeof can==='function'&&can('report')?'':'style="display:none"'}><i><svg class="mi" aria-hidden="true"><use href="#i-chart"/></svg></i>BC suất ăn →</button><button class="maction" data-mobile="qr"><i><svg class="mi" aria-hidden="true"><use href="#i-qr"/></svg></i>QR code →</button><button class="maction" data-mobile="dayman"><i><svg class="mi" aria-hidden="true"><use href="#i-bld"/></svg></i>Quản lý dãy →</button></div></section>`;}return summaryAdmin();}
function summaryAdmin(){return summaryByKtx();const s=stats();return `<h2 class="mtitle">Tổng quan</h2><div class="msub">Quản lý công nhân KTX Hóc Môn</div><div class="mstats step231-summary"><div class="mstat step231-main"><span><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg></span><b>${fmt(s.A.length)}</b><small>Tổng quân số</small></div><div class="mstat"><span><svg class="mi" aria-hidden="true"><use href="#i-bld"/></svg></span><b>${fmt(s.ktxs)}</b><small>KTX có người</small></div><div class="mstat"><span><svg class="mi" aria-hidden="true"><use href="#i-bld"/></svg></span><b>${fmt(s.days)}</b><small>Dãy có người</small></div><div class="mstat green"><span><svg class="mi" aria-hidden="true"><use href="#i-out"/></svg></span><b>${fmt(s.occupiedRooms)}</b><small>Phòng có người</small></div><div class="mstat step231-male"><span><svg class="mi" aria-hidden="true"><use href="#i-male"/></svg></span><b>${fmt(s.men)}</b><small>Nam</small></div><div class="mstat step231-female"><span><svg class="mi" aria-hidden="true"><use href="#i-female"/></svg></span><b>${fmt(s.women)}</b><small>Nữ</small></div><div class="mstat red"><span><svg class="mi" aria-hidden="true"><use href="#i-alert"/></svg></span><b>${fmt(s.over)}</b><small>Phòng quá tải</small></div></div>${s.unknown?`<div class="step231-unknown">${fmt(s.unknown)} hồ sơ chưa xác định giới tính.</div>`:""}${!s.A.length?`<div class="mcloudwarn">Chưa có dữ liệu công nhân trên thiết bị. Mở Công nhân → Tải Cloud để kiểm tra kết nối.</div>`:''}<section class="mpanel"><h3>Thao tác thường dùng</h3><div class="mactions"><button class="maction" data-mobile="list"><i><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg></i>Danh sách công nhân →</button><button class="maction green" data-mobile="add" ${typeof can==='function'&&can('add')?'':'style="display:none"'}><i><svg class="mi" aria-hidden="true"><use href="#i-plus"/></svg></i>Thêm công nhân →</button><button class="maction amber" onclick="window.openKiemTraMenuNCC()"><i><svg class="mi" aria-hidden="true"><use href="#i-menu"/></svg></i>Xem thực đơn →</button><button class="maction amber" data-mobile="meal" ${typeof can==='function'&&can('report')?'':'style="display:none"'}><i><svg class="mi" aria-hidden="true"><use href="#i-chart"/></svg></i>BC suất ăn →</button><button class="maction" data-mobile="qr"><i><svg class="mi" aria-hidden="true"><use href="#i-qr"/></svg></i>QR code →</button><button class="maction" data-mobile="dayman"><i><svg class="mi" aria-hidden="true"><use href="#i-bld"/></svg></i>Quản lý dãy →</button></div></section><section class="mpanel"><h3>Thao tác gần đây</h3>${(typeof LOG!=='undefined'&&Array.isArray(LOG)?LOG:[]).slice(0,4).map(x=>`<div class="mrecent"><b>${escapeHtml(x.a||'Cập nhật')}</b><br>${escapeHtml(x.d||'')}<div class="mtiny">${escapeHtml(x.t||'')}</div></div>`).join('')||'<div class="mempty">Chưa có hoạt động</div>'}</section>`}
const opts=(values,val,title)=>`<option value="">${title}</option>`+[...new Set(values.map(String))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'vi',{numeric:true})).map(v=>`<option value="${escapeHtml(v)}" ${v===val?'selected':''}>${escapeHtml(v)}</option>`).join('');
function dayman(){
 const A=(readAllDays()?allWorkers():workers()), groups=new Map(), cap=typeof CAP==='number'&&CAP>0?CAP:20;
 const scope=typeof ME!=='undefined'?ME.acct:null, admin=typeof ME!=='undefined'&&ME.role==='admin';
 const ks=admin?['KTX 1','KTX 2']:(Array.isArray(scope?.ktx)?scope.ktx:[]);
 const ds=admin?Array.from({length:6},(_,i)=>'Dãy '+(i+1)):(Array.isArray(scope?.days)?scope.days:[]);
 const norm=x=>String(x||'').trim().toLowerCase().replace(/\s+/g,' ');
 const allowed=(k,d)=>admin||readAllDays()||(ks.some(v=>norm(v)===norm(k))&&ds.some(v=>norm(v)===norm(d)));
 const addDay=(k,d)=>{const key=norm(k)+'|'+norm(d);if(!groups.has(key))groups.set(key,{k,d,rooms:new Map(),count:0})};
 (readAllDays()?['KTX 1','KTX 2']:ks).forEach(k=>(readAllDays()?Array.from({length:6},(_,i)=>'Dãy '+(i+1)):ds).forEach(d=>addDay(k,d)));
 A.forEach(w=>{const k=K(w),d=D(w);if(!allowed(k,d))return;addDay(k,d);const g=groups.get(norm(k)+'|'+norm(d)),roomNum=String(R(w)||'').match(/\d+/)?.[0];g.count++;if(roomNum){const n=parseInt(roomNum,10);if(n>=1&&n<=15)g.rooms.set(n,(g.rooms.get(n)||0)+1)}});
 const entries=[...groups.values()].sort((a,b)=>(a.k+a.d).localeCompare(b.k+b.d,'vi',{numeric:true}));
 return `<button type="button" class="mback" data-mobile="home">← Quay lại Tổng quan</button><h2 class="mtitle">Quản lý dãy</h2><div class="msub">${admin?'Tổng quan tất cả KTX và dãy':readAllDays()?'Chế độ xem toàn bộ, chỉ được sửa trong dãy được giao':'Các dãy đã được phân quyền'} · ${entries.length} dãy</div>${!admin?`<div class="m32-tabs"><button type="button" data-day-mode="mine" class="${!readAllDays()?'active':''}">Dãy được giao</button><button type="button" data-day-mode="all" class="${readAllDays()?'active':''}" >Xem tất cả</button></div>`:''}<div class="step230-day-list">${entries.map(g=>{
 const rooms=[...g.rooms.entries()].sort((a,b)=>a[0]-b[0]).map(([n,used])=>({n,used}));const total=g.count;const pct=rooms.length?Math.min(100,Math.round(total/(rooms.length*cap)*100)):0;const full=rooms.filter(r=>r.used>=cap).length,empty=rooms.filter(r=>r.used===0).length,near=rooms.filter(r=>r.used>=cap*.9&&r.used<cap).length;
 return `<section class="step230-day-card"><div class="step230-day-top"><div><b>${escapeHtml(g.d)}</b><small>${escapeHtml(g.k)} · ${rooms.length} phòng</small><small class="m32-badge ${allowed(g.k,g.d)&&(!readAllDays()||admin||ks.some(k=>norm(k)===norm(g.k))&&ds.some(d=>norm(d)===norm(g.d)))?'edit':'read'}">${admin||ks.some(k=>norm(k)===norm(g.k))&&ds.some(d=>norm(d)===norm(g.d))?'Được quản lý':'Chỉ xem'}</small></div><strong>${total}/${rooms.length*cap} <small>${pct}%</small></strong></div><div class="step230-bar"><i style="width:${pct}%"></i></div><div class="step230-counts"><span class="free">Trống ${empty}</span><span class="near">Sắp đầy ${near}</span><span class="full">Đầy ${full}</span></div><div class="step230-rooms">${rooms.map(r=>{const pctR=Math.min(100,Math.round(r.used/cap*100));const cls=r.used>=cap?'full':r.used>=cap*.9?'near':r.used===0?'empty':'normal';return `<button class="step230-room ${cls}" type="button" data-day-ktx="${escapeHtml(g.k)}" data-day-name="${escapeHtml(g.d)}" data-day-room="${r.n}" aria-label="${escapeHtml(g.d)}, phòng ${r.n}, ${r.used} trên ${cap} người"><b>P.${r.n}</b><span>${r.used}/${cap}</span><small>${pctR}%</small></button>`}).join('')}</div><button class="step230-open-day" type="button" data-day-ktx="${escapeHtml(g.k)}" data-day-name="${escapeHtml(g.d)}">Xem công nhân dãy này →</button></section>`}).join('')||'<section class="mpanel"><div class="mempty">Tài khoản chưa được phân công KTX/Dãy.</div></section>'}</div>`;
}
function list(){const A=workers();const base=A.filter(w=>(!ktx||K(w)===ktx)&&(!day||D(w)===day)&&(!room||String(R(w))===room));const L=base.filter(w=>(!query||[w.name,w.mnv,w.cccd,w.sdt].some(x=>String(x||'').toLowerCase().includes(query.toLowerCase())))&&(!status||(status==='missing'?missing(w):!missing(w))));return `<h2 class="mtitle">Công nhân</h2><div class="msub">Danh sách, tìm kiếm và quản lý hồ sơ</div><div style="display:flex;gap:9px;margin-top:13px"><input id="mobileFind" class="msearch" placeholder="Tìm tên, MNV, CCCD..." value="${escapeHtml(query)}"></div><button type="button" class="m37-filter-toggle" id="m37FilterToggle" aria-expanded="${mobileFiltersOpen}">⚙ Bộ lọc ${ktx||day||room||status?"• Đang lọc":""}</button><div class="mfilters ${mobileFiltersOpen?"m37-open":""}"><select id="mfK">${opts(A.map(w=>K(w)),ktx,'Tất cả KTX')}</select><select id="mfD">${opts(A.filter(w=>!ktx||K(w)===ktx).map(w=>D(w)),day,'Tất cả Dãy')}</select><select id="mfR">${opts(base.map(w=>R(w)),room,'Tất cả Phòng')}</select><select id="mfS"><option value="">Tất cả trạng thái</option><option value="ok" ${status==='ok'?'selected':''}>Đủ CCCD & SĐT</option><option value="missing" ${status==='missing'?'selected':''}>Thiếu CCCD/SĐT</option></select></div><div class="msub" data-worker-count>Hiển thị ${Math.min(L.length,limit)} / ${fmt(L.length)} công nhân phù hợp <button type="button" class="mrefresh" data-mobile="refresh" ${cloudBusy?'disabled':''}>${cloudBusy?'Đang tải…':'↻ Tải Cloud'}</button></div>${cloudError?'<div class="mcloudwarn m37-dismissible" role="alert">'+escapeHtml(cloudError)+'<button type="button" data-mobile="dismiss-error" aria-label="Đóng thông báo">×</button></div>':''}<div class="mlist">${L.slice(0,limit).map(w=>`<div class="mworker"><div class="mface">${escapeHtml(String(w.name||'?').trim().charAt(0).toUpperCase())}</div><div class="mworkertext"><b>${escapeHtml(w.name||'Chưa có tên')}</b><small>MNV: ${escapeHtml(w.mnv||'Chưa có')}</small><small>${escapeHtml(loc(w))} · ${escapeHtml(male(w))}</small><small class="mstate ${missing(w)?'warn':''}">${missing(w)?'⚠ Thiếu CCCD/SĐT':'✓ Đủ CCCD/SĐT'}</small></div><button class="miconbtn" data-open-worker="${escapeHtml(w.id)}" aria-label="Xem hồ sơ"><svg class="mi" aria-hidden="true"><use href="#i-eye"/></svg></button><button class="miconbtn" data-edit-worker="${escapeHtml(w.id)}" aria-label="Sửa hồ sơ" ${assigned(w)&&typeof can==='function'&&can('edit',w)?'':'disabled title="Chỉ xem ngoài phạm vi"'}><svg class="mi" aria-hidden="true"><use href="#i-edit"/></svg></button></div>`).join('')||'<div class="mpanel mempty">Không tìm thấy công nhân phù hợp.</div>'}</div>${L.length>limit?'<button class="mbtn outline" data-mobile="more" style="width:100%;margin:14px 0">Xem thêm 35 công nhân</button>':''}`}
function detail(){const w=byId(chosen);if(!w)return'<button class="mback" data-mobile="list">← Danh sách</button><p>Không tìm thấy hồ sơ hoặc không có quyền truy cập.</p>';const field=(l,v)=>`<div><small>${l}</small><strong>${escapeHtml(v||'—')}</strong></div>`;return `<button class="mback" data-mobile="list">← Danh sách</button><h2 class="mtitle">Hồ sơ công nhân</h2><section class="mpanel"><div style="display:flex;align-items:center;gap:14px"><div class="mface" style="width:60px;height:60px;font-size:27px">${escapeHtml(String(w.name||'?')[0])}</div><div><h3 style="margin:0 0 5px">${escapeHtml(w.name)}</h3><div class="msub">MNV: ${escapeHtml(w.mnv||'Chưa có')}</div><div class="mtiny">${escapeHtml(loc(w))}</div></div></div><div style="margin-top:12px"><span class="mtag">${missing(w)?'⚠ Thiếu CCCD/SĐT':'✓ Đủ CCCD/SĐT'}</span></div></section><section class="mpanel"><h3>Thông tin cá nhân</h3><div class="mdata">${field('Ngày sinh',w.dob)}${field('Giới tính',male(w))}${field('CCCD',w.cccd)}${field('Số điện thoại',w.sdt)}${field('Địa chỉ',w.tinh)}</div></section><section class="mpanel"><h3>Thông tin KTX</h3><div class="mdata">${field('KTX',K(w))}${field('Dãy',D(w))}${field('Phòng',R(w))}${field('Đơn vị',w.unit)}${field('Tổ trưởng',w.leader)}${field('SĐT tổ trưởng',w.lsdt)}</div>${String(w.lsdt||'').replace(/\D/g,'').length>=9?`<a class="m197-call" href="tel:${String(w.lsdt).replace(/[^+0-9]/g,'')}" aria-label="Gọi tổ trưởng"><svg class="mi" aria-hidden="true"><use href="#i-phone"/></svg> Gọi tổ trưởng</a>`:''}</section><section class="mpanel"><h3>Thao tác chính</h3><div class="mactionrow"><button class="mbtn outline" data-edit-worker="${escapeHtml(w.id)}" ${assigned(w)&&can('edit',w)?'':'disabled'}><svg class="mi" aria-hidden="true"><use href="#i-edit"/></svg> Chỉnh sửa</button><button class="mbtn" data-move-worker="${escapeHtml(w.id)}" ${assigned(w)&&can('transfer',w)?'':'disabled'}>⇄ Chuyển phòng</button><button class="mbtn outline" data-full-worker="${escapeHtml(w.id)}" style="grid-column:1/-1">Xem hồ sơ chi tiết đầy đủ</button></div></section>`}
function account(){const name=typeof ME!=='undefined'?ME.name||'Người dùng':'Người dùng',role=typeof ROLES!=='undefined'&&typeof ME!=='undefined'?ROLES[ME.role]||ME.role:'—';const scopes=(typeof ME!=='undefined'&&ME.acct)?ME.acct:{};const area=[...(scopes.ktx||[]),...(scopes.days||[])].join(' · ')||'Theo quyền tài khoản';const online=typeof navigator!=='undefined'&&navigator.onLine;return `<h2 class="mtitle">Tài khoản</h2><section class="mpanel m196-user"><div class="m196-userhead"><span class="m196-avatar">${escapeHtml(name.charAt(0))}</span><div><h3>${escapeHtml(name)}</h3><p class="msub">${escapeHtml(role)}</p></div></div><div class="m196-meta"><div><small>Phạm vi được cấp</small><b>${escapeHtml(area)}</b></div><div><small>Kết nối</small><b>${online?'● Đang trực tuyến':'○ Mất kết nối'}</b></div></div><div class="m197-account-note">Dữ liệu trên điện thoại sử dụng cùng danh sách công nhân và quyền truy cập của PC. Nếu chưa thấy dữ liệu mới, chọn Tải lại Cloud.</div><button class="mbtn ktx-install-action" type="button" data-mobile="install" style="width:100%;margin-top:12px"><svg class="mi" aria-hidden="true"><use href="#i-dl"/></svg> Cài đặt ứng dụng (Android / iPhone)</button><p class="msub" style="margin:6px 0 0">iPhone: mở trang trong Safari → Chia sẻ → Thêm vào Màn hình chính. Android: chọn Cài đặt khi trình duyệt hỗ trợ.</p><button class="mbtn outline" data-mobile="refresh" style="width:100%;margin-top:12px">↻ Tải lại Cloud</button><button class="mbtn m196-logout" data-mobile="logout" style="width:100%;margin-top:10px">Đăng xuất</button></section><section class="mpanel"><h3>Truy cập nhanh</h3><div class="mactionrow"><button class="mbtn outline" data-mobile="list"><svg class="mi" aria-hidden="true"><use href="#i-users"/></svg> Công nhân</button><button class="mbtn outline" data-mobile="qr"><svg class="mi" aria-hidden="true"><use href="#i-qr"/></svg> QR code</button></div></section>`}
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
  const fields=[['td8','TĐ 8'],['td111','TĐ 11.1'],['td113','TĐ 11.3']].map(([key,label])=>`<label class="m195-qty">${label}<input type="number" min="0" inputmode="numeric" data-meal-vendor="${escapeHtml(n)}" data-meal-key="${key}" value="${escapeHtml(f[key]??'')}" placeholder="0"></label>`).join('');
  return `<div class="m195-vendor"><strong>${i+1}. ${escapeHtml(n)}</strong><div class="m195-qty-grid">${fields}</div><div class="m195-total">Tổng suất: <b data-total-ncc="${escapeHtml(n)}">${typeof mealTot==='function'?mealTot(n)??0:0}</b></div><div class="m195-menu"><small>Mặn</small><div>${escapeHtml(f.man||'Chưa có thực đơn')}</div><small>Chay</small><div>${escapeHtml(f.chay||'Chưa có thực đơn')}</div></div></div>`;
 }).join('');
 return `<button class="mback" data-mobile="home">← Tổng quan</button><h2 class="mtitle">Báo cáo suất ăn</h2><p class="msub">Chọn ngày và buổi ăn trực tiếp như trên PC; có thể xem thực đơn các ngày tiếp theo.</p><section class="mpanel m195-config"><div class="mfields"><label>Ngày<input id="m195Date" type="date" value="${escapeHtml(m.date)}"></label><label>Buổi<select id="m195Session">${[['sang','Sáng'],['trua','Trưa'],['chieu','Chiều']].map(([k,v])=>`<option value="${k}" ${k===m.ses?'selected':''}>${v}</option>`).join('')}</select></label><label>KTX<select id="m195Ktx">${['KTX1','KTX2','KTX3'].map(k=>`<option ${k===m.ktx?'selected':''}>${k}</option>`).join('')}</select></label><label>Đơn giá<input id="m195Price" value="${escapeHtml(m.price)}" inputmode="text"></label></div><div class="m198-actions"><button type="button" class="mbtn" data-mobile="meal-show">Xem thực đơn đã chọn / Nhập số lượng</button><button type="button" class="mbtn outline" data-mobile="meal-select-all"><svg class="mi" aria-hidden="true"><use href="#i-check"/></svg> Chọn tất cả NCC</button></div><h3 style="margin:16px 0 8px">Chọn nhà cung cấp</h3><div class="m195-select">${vendors.map(n=>`<label><input type="checkbox" data-meal-select="${escapeHtml(n)}" ${m.on.has(n)?'checked':''}><span>${escapeHtml(n)}</span></label>`).join('')}</div></section><section class="mpanel m195-results" id="m198MealResults"><p id="m213CloudStatus" class="msub" role="status" aria-live="polite">Chọn ngày và buổi bất kỳ để xem thực đơn, không cần chờ đến giờ tự hiển thị.</p><h3>Thực đơn & số lượng từng NCC</h3><p class="msub" style="margin-bottom:12px">Chọn một hoặc nhiều NCC phía trên; nhập trực tiếp TĐ 8, TĐ 11.1, TĐ 11.3 và đối chiếu món Mặn/Chay.</p>${rows||'<p>Vui lòng chọn ít nhất một nhà cung cấp.</p>'}</section><section class="mpanel m195-report"><h3>Nội dung báo cáo</h3><pre class="m195-preview" id="m195Preview">${escapeHtml(typeof mealText==='function'?mealText():'')}</pre><div class="mactionrow"><button class="mbtn" data-mobile="meal-copy">Sao chép báo cáo</button><button class="mbtn outline" data-mobile="meal-download">Xuất Word</button></div></section>`;
}

function assetsMobile(){return `<button class="mback" data-mobile="home">← Tổng quan</button><h2 class="mtitle">Cơ sở vật chất KTX</h2><iframe id="m181AssetsFrame" title="Quản lý cơ sở vật chất KTX" src="./cosovatchat.html?mobile=1" style="display:block;width:100%;height:calc(100dvh - 218px);min-height:460px;border:0;border-radius:0;background:transparent" loading="eager"></iframe>`}
function bindWorkerButtons(){root.querySelectorAll('[data-open-worker]').forEach(b=>b.onclick=()=>{chosen=b.dataset.openWorker;page('detail')});root.querySelectorAll('[data-edit-worker]').forEach(b=>b.onclick=()=>{const w=byId(b.dataset.editWorker);if(w&&assigned(w)&&can('edit',w)&&typeof edit==='function')edit(w)});root.querySelectorAll('[data-move-worker]').forEach(b=>b.onclick=()=>{const w=byId(b.dataset.moveWorker);if(w&&assigned(w)&&can('transfer',w)&&typeof openTransfer==='function')openTransfer(w)});root.querySelectorAll('[data-full-worker]').forEach(b=>b.onclick=()=>{const w=byId(b.dataset.fullWorker);if(w&&typeof view==='function')view(w)})}
function bind(){
 root.querySelectorAll('[data-m71-nav]').forEach(b=>b.addEventListener('click',ev=>{
 ev.stopPropagation();const mode=b.dataset.m71Nav;
 mobileQrMode=mode==='outreview'?'review':mode;
 if(mode==='review'||mode==='outreview'){if(window.__qrHubState){window.__qrHubState.section='review';window.__qrHubState.reviewTab=mode==='outreview'?'regout':'regin';window.__qrHubState.filterStatus='pending';}}
 else if(['regin','regout','history'].includes(mode)&&window.__qrHubState)window.__qrHubState.section=mode;
 render();
 }));
 root.querySelectorAll('[data-mobile]').forEach(b=>b.addEventListener('click',(event)=>{event.stopPropagation();
  const k=b.dataset.mobile;
  if(['home','list','account','qr','dayman','moreview','assets'].includes(k)){if(k==='qr')mobileQrMode='landing';page(k);}
  else if(k==='residence'){if(typeof go==='function')go('t6')}
  else if(k==='archive'){if(typeof go==='function')go('arc')}
  else if(k==='reports'){if(typeof go==='function')go('reports')}
  else if(k==='menu238'){if(typeof window.openKiemTraMenuNCC==='function')window.openKiemTraMenuNCC()}
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

const qrSection=document.getElementById('qr');
let qrAnchor=null;
function restoreQr(){if(qrAnchor&&qrSection){qrAnchor.replaceWith(qrSection);qrSection.classList.add('hide');qrSection.classList.remove('m196-mounted');qrAnchor=null}}
let dedupAnchor238=null;
const dedupSection238=document.getElementById('t2');
function restoreDedup238(){if(dedupAnchor238&&dedupSection238){dedupAnchor238.replaceWith(dedupSection238);dedupSection238.classList.add('hide');dedupAnchor238=null}}
function utils238(){return `<button class="mback" data-mobile="home">← Tổng quan</button><h2 class="mtitle">Tiện ích</h2><div class="step238-utilgrid"><button type="button" data-mobile="menu238"><i><svg class="mi" aria-hidden="true"><use href="#i-menu"/></svg></i>Xem thực đơn</button><button type="button" data-mobile="meal"><i><svg class="mi" aria-hidden="true"><use href="#i-chart"/></svg></i>BC suất ăn</button><button type="button" data-mobile="duplicate"><i><svg class="mi" aria-hidden="true"><use href="#i-layers"/></svg></i>Lọc trùng</button></div>`}
function duplicate238(){return `<button class="mback" data-mobile="utils238">← Tiện ích</button><h2 class="mtitle">Lọc trùng</h2><section class="mpanel step238-dedup" id="step238DuplicateHost"></section>`}
function incident238(){return `<button class="mback" data-mobile="home">← Tổng quan</button><h2 class="mtitle">Biên bản sự vụ</h2><iframe class="step238-frame" loading="lazy" title="Biên bản sự vụ" src="./bien-ban-su-vu.html"></iframe>`}
let mobileQrMode='landing';
const mobileQrSafe=v=>escapeHtml(String(v==null?'':v));
function mobileQrCounts(){const q=window.__qrHubState?.counts||{};return {in:Number(q.regin)||0,out:Number(q.regout)||0};}
function mobileQrPreview(){
 const allowed=typeof can==='function'&&(can('qrApprove')||can('attendance'));
 if(!allowed)return '';
 const rows=(typeof QRREQ!=='undefined'&&Array.isArray(QRREQ)?QRREQ:[]).filter(r=>r.status==='pending').slice(0,2);
 return `<section class="m71-preview"><div class="m71-previewhead"><h3>Hồ sơ chờ duyệt</h3><button type="button" data-m71-nav="review">Xem tất cả ›</button></div>${rows.length?rows.map(r=>`<article class="m71-request"><div class="m71-person"><span class="m71-avatar">${mobileQrSafe((r.name||'?').slice(0,1).toUpperCase())}</span><div><strong>${mobileQrSafe(r.name||'Chưa có họ tên')}</strong><p>${mobileQrSafe([r.ktx,r.day,r.room?'Phòng '+r.room:''].filter(Boolean).join(' · '))}</p><small>${r.request_type==='out'?'Đăng ký ra':'Đăng ký vào'} · ${mobileQrSafe(r.created_at?new Date(r.created_at).toLocaleString('vi-VN'):'')}</small></div><span class="m71-pending">Chờ duyệt</span></div><div class="m71-request-actions"><button data-m71-nav="${r.request_type==='out'?'outreview':'review'}">Sửa</button><button data-m71-nav="${r.request_type==='out'?'outreview':'review'}">Duyệt</button><button data-m71-nav="${r.request_type==='out'?'outreview':'review'}">Từ chối</button></div></article>`).join(''):'<div class="m71-empty">Chưa có hồ sơ chờ duyệt đã tải trên thiết bị.</div>'}</section>`;
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
 const n=mobileQrCounts();const allowed=typeof can==='function'&&(can('qrApprove')||can('attendance'));
 if(mobileQrMode==='landing')return `<section class="m71-landing"><div class="m71-heading"><span class="m71-qrmark">▦</span><div><h2>QR code</h2><p>Quản lý đăng ký KTX</p></div></div><div class="m71-stats"><button type="button" data-m71-nav="review"><span>Chờ duyệt vào</span><strong>${n.in}</strong></button><button type="button" data-m71-nav="outreview"><span>Chờ duyệt ra</span><strong>${n.out}</strong></button></div><div class="m71-actions"><button type="button" data-m71-nav="regin"><span class="m71-icon">↪</span><b>Đăng ký vào</b><small>Tạo mã QR vào KTX</small></button><button type="button" data-m71-nav="regout"><span class="m71-icon">↩</span><b>Đăng ký ra</b><small>Tạo mã QR ra KTX</small></button>${allowed?'<button type="button" data-m71-nav="review"><span class="m71-icon">✓</span><b>Duyệt hồ sơ</b><small>Xử lý đăng ký</small></button><button type="button" data-m71-nav="history"><span class="m71-icon">◷</span><b>Lịch sử</b><small>Tra cứu vào / ra</small></button>':''}</div>${mobileQrPreview()}</section>`;
 return `<section class="m71-detail"><button type="button" class="m71-back" data-m71-nav="landing">← QR code</button><h2>${mobileQrMode==='review'?'Duyệt hồ sơ':mobileQrMode==='history'?'Lịch sử':mobileQrMode==='regout'?'Đăng ký ra':mobileQrMode==='regin'?'Đăng ký vào':'Duyệt hồ sơ'}</h2><div id="m196QrHost"></div></section>`;
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
function render(){if(!mobile()){restoreQr();return}
 // Giữ iframe Cơ sở vật chất khi dữ liệu nền được làm mới: không cuộn về đầu,
 // không mất danh sách và không làm đóng hộp thoại người dùng đang chỉnh sửa.
 if(screen==='assets' && root.querySelector('#m181AssetsFrame'))return;
 if(updateHomeWithoutRemount())return;
if(screen==='incident'||screen==='utils238'||screen==='duplicate')screen='home';if(root.contains(document.activeElement)&&document.activeElement?.matches('input:not([type=checkbox]):not([type=radio]),textarea,select')){window.__ktx200DeferredRender=true;return}restoreQr();restoreDedup238();root.innerHTML=shell(screen==='home'?summary():screen==='list'?list():screen==='detail'?detail():screen==='meal'?mealMobile():screen==='qr'?qrMobile():screen==='dayman'?dayman():screen==='moreview'?moreMobile():screen==='assets'?assetsMobile():screen==='utils238'?utils238():screen==='duplicate'?duplicate238():account());if(screen==='duplicate'&&dedupSection238){const host=root.querySelector('#step238DuplicateHost');if(host){dedupAnchor238=document.createComment('STEP238 dedup original location');dedupSection238.parentNode.insertBefore(dedupAnchor238,dedupSection238);host.appendChild(dedupSection238);dedupSection238.classList.remove('hide')}}
if(screen==='qr'&&mobileQrMode!=='landing'&&qrSection){try{if(typeof window.qrPage==='function')window.qrPage()}catch(e){console.warn('QR render:',e)}const h=root.querySelector('#m196QrHost');if(h){qrAnchor=document.createComment('qr mobile mount point');qrSection.parentNode.insertBefore(qrAnchor,qrSection);h.appendChild(qrSection);qrSection.classList.remove('hide');qrSection.classList.add('m196-mounted');ktx78WatchQr()}}bind()}
document.addEventListener('focusin',e=>{if(root.contains(e.target)&&e.target.matches('input,textarea,select'))window.__ktx200InputActive=true},true);document.addEventListener('focusout',e=>{if(root.contains(e.target)&&e.target.matches('input,textarea,select')){window.__ktx200InputActive=false;if(window.__ktx200DeferredRender){window.__ktx200DeferredRender=false;setTimeout(()=>{if(!root.contains(document.activeElement)||!document.activeElement?.matches('input,textarea,select'))render()},120)}}},true);
function refresh(){if(mobile())render();else root.innerHTML=''}
const originalAll=typeof all==='function'?all:null;
if(originalAll){try{all=function(){const v=originalAll.apply(this,arguments);if(mobile())setTimeout(render,0);return v}}catch(e){}}
window.addEventListener('resize',refresh);window.addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
setTimeout(refresh,400);setTimeout(refresh,1500);let tries=0;const timer=setInterval(()=>{if(!mobile()){if(++tries>50)clearInterval(timer);return}if(workers().length){clearInterval(timer);render();return}tryCloudRead();if(++tries>80)clearInterval(timer)},1700);
})();
