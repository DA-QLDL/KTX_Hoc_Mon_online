/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/modules/admin/script-17.js >>> */

/* STEP73 — Bộ quản trị: cảnh báo, validation, import preview/undo, phòng nâng cao, điều chuyển, timeline, báo cáo, PWA */
// V2.0.156: Normalize displayed Vietnamese DOB (dd/mm/yyyy) to ISO before validating or saving.
// Never compare dd/mm/yyyy directly against the ISO current date: lexicographic ordering is invalid.
function ktxNormalizeDob156(value){
 const raw=String(value??'').trim();
 if(!raw)return '';
 if(window.KTXV2098&&typeof window.KTXV2098.parseDob==='function')return window.KTXV2098.parseDob(raw);
 const match=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)||raw.match(/^(\d{2})[\/.\-](\d{2})[\/.\-](\d{4})$/);
 if(!match)return '';
 const iso=/^\d{4}-/.test(raw)?raw:`${match[3]}-${match[2]}-${match[1]}`;
 const [y,m,d]=iso.split('-').map(Number),date=new Date(y,m-1,d);
 return y>=1900&&m>=1&&m<=12&&d>=1&&d<=31&&date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d&&date<=new Date()?iso:'';
}
const ROOM_FILTER_KEY='ktx_room_filter_v1';
let ROOM_FILTER='all', IMP_PENDING=null, TRANSFER_W=null;
const actorName=()=>((typeof ME!='undefined'&&(ME.name||ME.id))||localStorage.getItem('ktx_actor')||'Người dùng');
function auditPush(action,detail,meta={}){LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:action,d:detail,day:ldy(),at:Date.now(),actor:actorName(),role:(typeof ME!='undefined'&&ME.role)||'local',...meta});sv()}
function workerSnapshot(w){if(!w)return null;const o={};['id','name','mnv','gt','dob','sdt','cccd','unit','td','ktx','day','room','bed','date','out','tt','tv','leader','lsdt'].forEach(k=>o[k]=w[k]);return JSON.parse(JSON.stringify(o))}
function addHistory(w,type,detail,meta={}){if(!w)return;w.history=Array.isArray(w.history)?w.history:[];w.history.unshift({at:Date.now(),day:ldy(),type,detail,actor:actorName(),...meta});if(w.history.length>300)w.history=w.history.slice(0,300)}
function roomKey2(k,d,r){return rk(k,d,r)}
function roomLocked(k,d,r){const m=ROOMMETA[roomKey2(k,d,r)]||{};return !!m.locked}
function activeRoomCount(k,d,r,excludeId){return W.filter(w=>w.id!==excludeId&&K(w)==k&&D(w)==d&&String(R(w)||'')==String(r)).length}
function validPhone(v){return !v||/^0\d{9}$/.test(String(v))}
function validCCCD(v){return !v||/^\d{12}$/.test(String(v))}
function validateWorkerData(o,existing){const errors=[],warnings=[],digits=x=>String(x||'').replace(/\D/g,'');
 if(!String(o.name||'').trim())errors.push('Họ và tên không được để trống.');
 if(!validCCCD(digits(o.cccd)))errors.push('CCCD phải gồm đúng 12 chữ số.');
 if(!validPhone(digits(o.sdt)))warnings.push('SĐT chưa đúng định dạng chuẩn (không chặn lưu/import).');
 if(o.dob){const date=ktxNormalizeDob156(o.dob);if(!date)errors.push('Ngày sinh không hợp lệ. Vui lòng nhập dd/mm/yyyy.');else if(date>ldy())errors.push('Ngày sinh không được lớn hơn ngày hiện tại.');}
 const dupC=o.cccd&&W.find(w=>w.id!==(existing&&existing.id)&&digits(w.cccd)===digits(o.cccd));if(dupC)errors.push(`CCCD đã tồn tại ở công nhân: ${dupC.name}.`);
 const dupM=o.mnv&&W.find(w=>w.id!==(existing&&existing.id)&&String(w.mnv||'').trim()===String(o.mnv).trim());if(dupM)warnings.push(`Mã NV đang trùng với: ${dupM.name}.`);
 const km=String(o.ktx||'').match(/(\d+)/),dm=String(o.day||'').match(/(\d+)/),rm=String(o.room||'').match(/(\d+)/);if(km&&(+km[1]<1))warnings.push('Mã KTX phải bắt đầu từ KTX 1.');if(dm&&(+dm[1]<1||+dm[1]>6))warnings.push('Dãy nằm ngoài phạm vi Dãy 1–6.');if(rm&&(+rm[1]<1||+rm[1]>15))warnings.push('Phòng nằm ngoài phạm vi Phòng 1–15.');
 if(o.ktx&&o.day&&o.room){if(roomLocked(o.ktx,o.day,o.room)&&(!existing||roomKey2(o.ktx,o.day,o.room)!==roomKey2(existing.ktx,existing.day,existing.room)))errors.push('Phòng đích đang bị khóa, không thể bố trí thêm người.');const n=activeRoomCount(o.ktx,o.day,o.room,existing&&existing.id);if(n>=CAP)warnings.push(`Phòng ${o.room} hiện có ${n}/${CAP} người. Lưu sẽ làm phòng vượt định mức ${CAP} người.`);const md=roomMode(o.ktx,o.day,o.room,W.filter(w=>w.id!==(existing&&existing.id)&&K(w)==o.ktx&&D(w)==o.day&&String(R(w))==String(o.room)));if((md==='male'&&isNu(o.gt))||(md==='female'&&isNam(o.gt)))warnings.push(`Giới tính công nhân không phù hợp với công năng ${roomTypeText(md)}.`)}
 return {errors,warnings}}
async function confirmValidation(v){if(v.errors.length){alert('Không thể lưu:\n• '+v.errors.join('\n• '));return false}if(v.warnings.length)return await ask('Hệ thống phát hiện cảnh báo:\n\n• '+v.warnings.join('\n• ')+'\n\nBạn vẫn muốn tiếp tục?',{title:'Cảnh báo dữ liệu',ok:'Vẫn tiếp tục',cls:''});return true}


/* v1.0.122 — Save worker editing/moves on Cloud first; no optimistic success. */
async function ktxSaveWorkerAtomic122(w,patch,action,detail,meta={}){
 const sb=await window.ktxEnsureCloudWriteReady();
 if(SUPA_SYNC.pending||SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying)throw new Error('Đang có dữ liệu chờ đồng bộ hoặc tác vụ Cloud chưa hoàn tất; vui lòng kiểm tra trạng thái đồng bộ trước khi ghi.');
 const id=String(w.id||'');if(!id)throw new Error('Công nhân thiếu mã định danh.');
 // Read authoritative payload before committing: stale local metadata is not a valid CAS snapshot.
 const {data:live,error:liveError}=await sb.from('ktx_workers').select('record_id,payload').eq('record_id',id).maybeSingle();
 if(liveError)throw new Error('Không đọc được hồ sơ Cloud: '+liveError.message);
 if(!live?.payload)throw new Error('Không tìm thấy hồ sơ trên Cloud. Hãy đồng bộ lại.');
 const original=structuredClone(live.payload);
 // Reject a genuine concurrent edit to the fields that this operation changes.
 for(const key of Object.keys(patch)){
  if(String(w[key]??'')!==String(original[key]??''))throw new Error('Trường '+key+' đã thay đổi trên thiết bị khác. Hãy tải lại Cloud trước khi thực hiện.');
 }
 const after=structuredClone(original);Object.assign(after,patch);
 const originalLocation=roomKey2(original.ktx,original.day,original.room);
 const targetLocation=roomKey2(after.ktx,after.day,after.room);
 if(originalLocation!==targetLocation&&after.ktx&&after.day&&after.room){
  const {data:roomState,error:lockError}=await sb.from('ktx_room_meta').select('payload').eq('room_key',targetLocation).maybeSingle();
  if(lockError)throw new Error('Không kiểm tra được khóa phòng trên Supabase: '+lockError.message);
  if(roomState?.payload?.locked)throw new Error('Phòng đích đã khóa trên Supabase; không được chuyển công nhân vào phòng này.');
 }

 const moved=['ktx','day','room'].some(k=>String(original[k]||'')!==String(after[k]||''));
 const oldLoc=`${K(original)} · ${D(original)} · P.${R(original)||'—'}`;
 const newLoc=`${K(after)} · ${D(after)} · P.${R(after)||'—'}`;
 if(moved){
  const tp=K(original)!==K(after)?'TRANSFER_KTX':'MOVE';
  addHistory(after,tp,`${tp==='TRANSFER_KTX'?'Chuyển KTX':'Chuyển phòng'}: ${oldLoc} → ${newLoc}${meta.note?' · '+meta.note:''}`,{from:{ktx:K(original),day:D(original),room:R(original)||''},to:{ktx:K(after),day:D(after),room:R(after)||''},note:meta.note||''});
 }
 if(action==='UPDATE')addHistory(after,'UPDATE',detail);
 const {data,error}=await sb.rpc('ktx_update_worker_atomic_v122',{
   p_worker_id:id,p_expected:original,p_new:after,p_action:action,p_detail:detail
 });
 if(error)throw new Error(error.message||'RPC cập nhật công nhân thất bại');
 if(!data||data.ok!==true)throw new Error('Supabase không xác nhận thao tác cập nhật.');
 const {data:readback,error:readErr}=await sb.from('ktx_workers').select('record_id,payload').eq('record_id',id).maybeSingle();
 if(readErr)throw new Error('Cloud đã nhận yêu cầu nhưng chưa đọc lại được dữ liệu: '+readErr.message);
 if(!readback||!readback.payload)throw new Error('Không xác minh được hồ sơ vừa cập nhật trên Supabase.');
 const confirmed=readback.payload;
 for(const key of Object.keys(patch))if(String(confirmed[key]??'')!==String(after[key]??''))throw new Error(`Cloud chưa xác nhận trường ${key}; hãy tải lại dữ liệu.`);
 Object.keys(w).forEach(k=>delete w[k]);Object.assign(w,confirmed);
 if(SUPA_SYNC.hashes&&SUPA_SYNC.hashes.workers)SUPA_SYNC.hashes.workers[id]=syncHash(confirmed);
 if(SUPA_SYNC.remoteIds&&SUPA_SYNC.remoteIds.workers)SUPA_SYNC.remoteIds.workers.add(id);
 return confirmed;
}
// Thay handler Lưu công nhân bằng phiên bản có validation + lịch sử + audit before/after.
// V169 — The address form intentionally removed Thôn/Xóm and Xã/Phường.
// Never dereference hidden/nonexistent fields, and only commit fields edited in the form.
// Previous versions silently threw here before reaching the Supabase save call.
if($('ds'))$('ds').onclick=async()=>{
 const btn=$('ds');
 if(btn.dataset.ktx169Saving==='1')return;
 btn.dataset.ktx169Saving='1';
 const oldDisabled=btn.disabled,oldText=btn.innerHTML;
 btn.disabled=true;btn.textContent='Đang lưu…';btn.setAttribute('aria-busy','true');
 try{
  const o={},visibleKeys=new Set();
  F.forEach(([f])=>{
   const input=$('f_'+f);
   if(input){o[f]=String(input.value??'').trim();visibleKeys.add(f)}
   else{o[f]=EW?String(EW[f]??''):''} // keep historical address parts in Cloud
  });
  if(o.dob){
   const parsed=ktxNormalizeDob156(o.dob);
   if(!parsed){alert('Ngày sinh không hợp lệ. Vui lòng kiểm tra ngày/tháng/năm.');$('f_dob')?.focus();return}
   o.dob=parsed;
  }
  o.sdt=String(o.sdt||'').replace(/\D/g,'');
  o.cccd=String(o.cccd||'').replace(/\D/g,'');
  // Do not autoSplit a province/city input into legacy fields in an existing record.
  // This must never unexpectedly modify Thôn/Xóm or Xã/Phường.
  normW(o);
  const validation=validateWorkerData(o,EW);
  if(!await confirmValidation(validation))return;
  if(!o.name){alert('Hãy nhập họ và tên công nhân.');return}
  if(EW){
   const changed=F.map(([f])=>f).filter(f=>visibleKeys.has(f)&&String(EW[f]??'')!==String(o[f]??''));
   if(!changed.length){alert('Không có thông tin nào thay đổi.');return}
   const patch={};changed.forEach(f=>patch[f]=o[f]);
   await ktxSaveWorkerAtomic122(EW,patch,'UPDATE',`Cập nhật ${changed.length} trường thông tin`);
   $('dlg').close();all();alert(`Đã lưu thành công hồ sơ công nhân: ${o.name}.`);
  }else{
   // Retain the existing add-worker workflow. The absent address fields are now safe.
   o.id='w'+Date.now()+Math.random().toString(36).slice(2,6);
   addHistory(o,'CHECKIN',`Vào ${K(o)} · ${D(o)} · P.${R(o)||'—'}`);
   W.unshift(o);auditPush('CREATE','Thêm công nhân: '+o.name,{workerId:o.id,after:workerSnapshot(o)});
   sv();$('dlg').close();all();alert(`Đã thêm công nhân "${o.name}".`);
  }
 }catch(error){
  console.error('[QLKTX V169] Lưu hồ sơ thất bại:',error);
  alert('Không lưu được hồ sơ: '+(error?.message||String(error)));
 }finally{
  btn.disabled=oldDisabled;btn.innerHTML=oldText;
  btn.removeAttribute('aria-busy');delete btn.dataset.ktx169Saving;
 }
};

function issueList(){const out=[],today=ldy(),push=(type,sev,title,detail,w)=>out.push({type,sev,title,detail,w});const rs=rooms(W);rs.filter(r=>r.n>CAP).forEach(r=>push('over','danger',`${r.ktx} · ${r.day} · P.${r.room}`,`Phòng quá tải ${r.n}/${CAP} người.`));
 W.forEach(w=>{if(!String(w.cccd||'').trim())push('cccd','warn',w.name,'Thiếu CCCD.',w);if(!String(w.sdt||'').trim())push('phone','warn',w.name,'Thiếu số điện thoại.',w);if(!String(w.dob||'').trim())push('dob','warn',w.name,'Thiếu ngày sinh.',w);if(!R(w))push('room','danger',w.name,'Chưa được phân phòng.',w);if(w.tv&&w.tv.to&&String(w.tv.to).slice(0,10)<today)push('tvexp','warn',w.name,`Tạm vắng đã hết hạn ${vn(w.tv.to)} nhưng hồ sơ chưa được kết thúc.`,w)});
 const dc={},dm={};W.forEach(w=>{const c=String(w.cccd||'').replace(/\D/g,''),m=String(w.mnv||'').trim();if(c)(dc[c]=dc[c]||[]).push(w);if(m)(dm[m]=dm[m]||[]).push(w)});Object.values(dc).filter(a=>a.length>1).forEach(a=>push('dup','danger',a.map(x=>x.name).join(' / '),`Trùng CCCD: ${a[0].cccd}.`,a[0]));Object.values(dm).filter(a=>a.length>1).forEach(a=>push('dup','warn',a.map(x=>x.name).join(' / '),`Trùng Mã NV: ${a[0].mnv}.`,a[0]));
 rs.forEach(r=>{const meta=rmeta(r.ktx,r.day,r.room),md=meta.mode&&meta.mode!=='auto'?meta.mode:null;if(!md)return;const bad=r.l.filter(w=>(md==='male'&&isNu(w.gt))||(md==='female'&&isNam(w.gt)));bad.forEach(w=>push('sex','danger',w.name,`${r.ktx} · ${r.day} · P.${r.room}: giới tính không phù hợp công năng ${roomTypeText(md)}.`,w))});return out}
const ALERT_READ_KEY='ktx_alert_read_v1';
function alertSig(x){return [x.type,x.title,x.detail,x.w&&x.w.id||''].join('|')}
function alertReadSet(){try{return new Set(JSON.parse(localStorage.getItem(ALERT_READ_KEY)||'[]'))}catch(e){return new Set()}}
function unreadIssues(){const rd=alertReadSet();return issueList().filter(x=>!rd.has(alertSig(x)))}
function markAllAlertsRead(){const sigs=issueList().map(alertSig);localStorage.setItem(ALERT_READ_KEY,JSON.stringify(sigs));updateAlertBadges();if(page==='alerts')alertCenterPage();if($('alertQuickDrawer')&&$('alertQuickDrawer').classList.contains('open'))renderAlertQuickDrawer()}
function renderAlertQuickDrawer(){const box=$('alertQuickDrawer'),list=$('aqdList'),cnt=$('aqdCount'),sub=$('aqdSub'),read=$('aqdReadAll');if(!box||!list)return;const L=issueList(),rd=alertReadSet(),U=L.filter(x=>!rd.has(alertSig(x)));if(cnt)cnt.textContent=`${L.length.toLocaleString('vi-VN')} vấn đề · ${U.length.toLocaleString('vi-VN')} chưa đọc`;if(sub)sub.textContent=U.length?'Bấm vào hồ sơ để sửa nhanh thông tin':'Tất cả thông báo hiện tại đã được đọc';if(read){read.disabled=!U.length;read.textContent=U.length?`✓ Đã đọc tất cả (${U.length})`:'✓ Đã đọc tất cả'}list.innerHTML=L.length?L.map(x=>{const canEdit=!!x.w,seen=rd.has(alertSig(x));return `<div class="aqd-item ${x.sev||''} ${canEdit?'clickable':''}" ${canEdit?`data-aq-worker="${esc(x.w.id)}"`:''} title="${canEdit?'Bấm để sửa nhanh hồ sơ':''}"><i class="aqd-dot"></i><div class="aqd-copy"><div class="aqd-title">${esc(x.title)}${seen?' <span class="mut" style="font-weight:600">· đã đọc</span>':''}</div><div class="aqd-detail">${esc(x.detail)}</div></div>${canEdit?`<button class="aqd-edit" data-aq-edit="${esc(x.w.id)}">Sửa ngay</button>`:'<span></span>'}</div>`}).join(''):'<div class="aqd-empty">✓ Không có vấn đề cần xử lý.</div>';list.querySelectorAll('[data-aq-worker]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-aq-edit]'))return;const w=W.find(a=>a.id===el.dataset.aqWorker);if(!w)return;closeAlertQuickDrawer();edit(w)});list.querySelectorAll('[data-aq-edit]').forEach(b=>b.onclick=e=>{e.stopPropagation();const w=W.find(a=>a.id===b.dataset.aqEdit);if(!w)return;closeAlertQuickDrawer();edit(w)})}
function openAlertQuickDrawer(){const box=$('alertQuickDrawer');if(!box)return;renderAlertQuickDrawer();box.classList.add('open');box.setAttribute('aria-hidden','false')}
function closeAlertQuickDrawer(){const box=$('alertQuickDrawer');if(!box)return;box.classList.remove('open');box.setAttribute('aria-hidden','true')}
function toggleAlertQuickDrawer(){const box=$('alertQuickDrawer');if(!box)return;box.classList.contains('open')?closeAlertQuickDrawer():openAlertQuickDrawer()}
function updateAlertBadges(){const n=unreadIssues().length,nav=$('alertNavCount');if(nav){nav.textContent=n;nav.style.display=n?'inline-grid':'none'}const b=$('alertFloat');if(b){const show=['home','work','meal','t6','qr','arc','reports'].includes(page);b.classList.toggle('hide',!show);b.onclick=e=>{e.stopPropagation();toggleAlertQuickDrawer()};const bd=b.querySelector('.badge');if(bd){bd.textContent=n>99?'99+':n;bd.style.display=n?'grid':'none'}if(!show)closeAlertQuickDrawer()}if($('alertQuickDrawer')&&$('alertQuickDrawer').classList.contains('open'))renderAlertQuickDrawer()}
function alertCenterPage(){const L=issueList(),U=unreadIssues(),sevs=s=>L.filter(x=>x.sev===s).length;$('alerts').innerHTML=`<div class="alert-grid"><div class="alert-card danger"><span class="mut">CẦN XỬ LÝ NGAY</span><b>${sevs('danger')}</b></div><div class="alert-card warn"><span class="mut">CẢNH BÁO</span><b>${sevs('warn')}</b></div><div class="alert-card"><span class="mut">CHƯA ĐỌC</span><b>${U.length}</b></div><div class="alert-card ${L.length?'warn':'ok'}"><span class="mut">TỔNG VẤN ĐỀ</span><b>${L.length}</b></div></div><div class="card"><div class="row" style="margin-bottom:10px"><b>Danh sách cần xử lý</b><span class="mut" style="margin-left:auto">Tự động quét dữ liệu hiện tại</span><button class="btn s sm alert-read-all" id="alertReadAll">✓ Đã đọc tất cả</button></div><div class="alert-list">${L.length?L.map((x,i)=>`<div class="alert-row ${x.sev}"><i class="alert-dot"></i><div class="who">${esc(x.title)}</div><div class="why">${esc(x.detail)}</div>${x.w?`<button class="btn s sm" data-alw="${esc(x.w.id)}">Xem hồ sơ</button>`:'<span></span>'}</div>`).join(''):'<div class="mut" style="padding:16px">Không phát hiện vấn đề cần xử lý.</div>'}</div></div>`;const ra=$('alertReadAll');if(ra){ra.disabled=!U.length;ra.onclick=markAllAlertsRead}document.querySelectorAll('#alerts [data-alw]').forEach(b=>b.onclick=()=>{const w=W.find(x=>x.id===b.dataset.alw);if(w)view(w)})}

if($('aqdX'))$('aqdX').onclick=closeAlertQuickDrawer;if($('aqdReadAll'))$('aqdReadAll').onclick=markAllAlertsRead;if($('aqdCenter'))$('aqdCenter').onclick=()=>{closeAlertQuickDrawer();go('alerts')};if(!window.__aqdOutsideBound){window.__aqdOutsideBound=true;document.addEventListener('click',e=>{const box=$('alertQuickDrawer'),bell=$('alertFloat');if(!box||!box.classList.contains('open'))return;if(box.contains(e.target)||(bell&&bell.contains(e.target)))return;closeAlertQuickDrawer()})}

// Bổ sung "Việc cần xử lý hôm nay" và bộ lọc phòng vào Tổng quan.
const _home73=home;home=function(){_home73();if(!$('home')||!W.length)return;const issues=issueList(),unread=unreadIssues(),rs=rooms(vis()),over=rs.filter(r=>r.n>CAP).length,missing=W.filter(w=>!w.cccd||!w.sdt).length,exp=W.filter(w=>w.tv&&w.tv.to&&String(w.tv.to).slice(0,10)<ldy()).length;const box=document.createElement('div');box.className='today-box';box.innerHTML=`<b>Việc cần xử lý hôm nay</b><span class="today-chip ${missing?'hot':''}">${missing} hồ sơ thiếu CCCD/SĐT</span><span class="today-chip ${over?'hot':''}">${over} phòng quá tải</span><span class="today-chip ${exp?'hot':''}">${exp} tạm vắng hết hạn</span><button class="btn s sm go-alert">Xem cảnh báo${unread.length?` (${unread.length} mới)`:''}</button>`;const first=$('home').firstElementChild;if(first)first.before(box);box.querySelector('.go-alert').onclick=()=>go('alerts');updateAlertBadges();
 const head=$('home').querySelector('.roommap-head');if(head&&!head.querySelector('.room-filterbar')){const bar=document.createElement('div');bar.className='room-filterbar';bar.innerHTML=[['all','Tất cả'],['free5','Còn ≥5 chỗ'],['low','Còn 1–3 chỗ'],['full','Đã đầy'],['over','Quá tải']].map(([v,l])=>`<button data-rf="${v}" class="${ROOM_FILTER===v?'on':''}">${l}</button>`).join('');head.querySelector('div')?.appendChild(bar);bar.querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>{ROOM_FILTER=b.dataset.rf;applyRoomFilter73()})}applyRoomFilter73();
 document.querySelectorAll('#home .room-cell').forEach(c=>{const locked=roomLocked(c.dataset.k,c.dataset.d,c.dataset.r);c.classList.toggle('locked',locked);if(locked)c.title+=' · PHÒNG ĐANG KHÓA'})}
function applyRoomFilter73(){document.querySelectorAll('#home .room-filterbar [data-rf]').forEach(b=>b.classList.toggle('on',b.dataset.rf===ROOM_FILTER));document.querySelectorAll('#home .room-cell').forEach(c=>{const l=W.filter(w=>K(w)==c.dataset.k&&D(w)==c.dataset.d&&String(R(w))===String(c.dataset.r)),n=l.length,free=Math.max(0,CAP-n);let show=ROOM_FILTER==='all'||(ROOM_FILTER==='free5'&&free>=5)||(ROOM_FILTER==='low'&&free>=1&&free<=3)||(ROOM_FILTER==='full'&&n===CAP)||(ROOM_FILTER==='over'&&n>CAP);c.style.display=show?'':'none'})}

// Nâng cấp ngăn kéo phòng: khóa/mở phòng, CAP vẫn cố định 20.
const _openRoomDrawer73=openRoomDrawer;openRoomDrawer=function(k,d,r,list){_openRoomDrawer73(k,d,r,list);const sec=$('rtype')&&$('rtype').closest('.roomd-sec');if(sec&&!sec.querySelector('.room-lock-row')){const row=document.createElement('div');row.className='room-lock-row';row.innerHTML=`<div><b>Khóa phòng</b><small>Sức chứa vẫn cố định ${CAP} người/phòng. Khi khóa sẽ không cho bố trí/chuyển thêm người.</small></div><button class="btn s sm" id="roomLockBtn"></button>`;sec.appendChild(row);const refresh=()=>{const locked=roomLocked(k,d,r),b=$('roomLockBtn');b.textContent=locked?'Mở khóa phòng':'Khóa phòng';b.className='btn '+(locked?'g':'r')+' sm'};refresh();$('roomLockBtn').onclick=async()=>{const b=$('roomLockBtn'),key=roomKey2(k,d,r);b.disabled=true;try{const sb=await window.ktxEnsureCloudWriteReady();const {data:live,error:readError}=await sb.from('ktx_room_meta').select('payload').eq('room_key',key).maybeSingle();if(readError)throw readError;const current=live?.payload||{};const locked=!Boolean(current.locked);const next={...current,locked};const {error:writeError}=await sb.from('ktx_room_meta').upsert({room_key:key,payload:next,updated_at:new Date().toISOString()},{onConflict:'room_key'});if(writeError)throw writeError;const {data:verified,error:verifyError}=await sb.from('ktx_room_meta').select('payload').eq('room_key',key).single();if(verifyError||Boolean(verified?.payload?.locked)!==locked)throw new Error('Cloud chưa xác nhận khóa phòng');ROOMMETA[key]=verified.payload;if(window.SUPA_SYNC?.hashes?.rooms)SUPA_SYNC.hashes.rooms[key]=syncHash(verified.payload);if(window.SUPA_SYNC?.remoteIds?.rooms)SUPA_SYNC.remoteIds.rooms.add(key);refresh();home();alert((locked?'Đã khóa':'Đã mở khóa')+' '+k+' · '+d+' · Phòng '+r+' trên Supabase.')}catch(e){alert('Chưa lưu được khóa phòng: '+(e.message||e))}finally{b.disabled=false}}}}

function timelineItems(w){const h=Array.isArray(w.history)?w.history.slice():[];if(!h.length&&w.date)h.push({day:w.date,type:'CHECKIN',detail:`Vào ${K(w)} · ${D(w)} · P.${R(w)||'—'}`,actor:''});if(w.tt)h.push({day:w.tt,type:'RESIDENCE',detail:'Đã khai báo tạm trú',actor:''});if(w.tv)h.push({day:w.tv.from,type:'AWAY',detail:`Tạm vắng${w.tv.to?' đến '+vn(w.tv.to):''}${w.tv.why?' · '+w.tv.why:''}`,actor:''});return h.sort((a,b)=>(b.at||new Date(b.day||0))-(a.at||new Date(a.day||0)))}
const _view73=view;view=function(w){_view73(w);if(!$('vb'))return;const h=timelineItems(w);const wrap=document.createElement('div');wrap.className='vcd';wrap.innerHTML=`<div class="vs">${ico('log')}Lịch sử cư trú</div><div class="timeline">${h.length?h.slice(0,20).map(x=>`<div class="tl-item"><b>${esc(x.detail||x.type)}</b><span>${esc(vn(x.day)||new Date(x.at||Date.now()).toLocaleString('vi-VN'))}${x.actor?' · '+esc(x.actor):''}</span></div>`).join(''):'<div class="mut">Chưa có lịch sử.</div>'}</div>`;$('vb').appendChild(wrap);const b=$('vTransfer');if(b)b.onclick=()=>{$('vdl').close();openTransfer(w)}}
// STEP218: dùng cùng danh sách công nhân đang hoạt động sau khi tải Supabase.
// Chuẩn hóa mã phòng, không tạo số lượng giả hoặc bỏ người dựa trên cờ không có trong schema.
function tr218Norm(v){return sa(String(v||''));}
function tr218Room(v){const t=tr218Norm(v).replace(/^(phong|p)\s*/, '').replace(/\s+/g,'');return /^0*\d+$/.test(t)?String(parseInt(t,10)):t;}
function tr218People(k,d,r,excludeId){return W.filter(x=>x&&x.id!==excludeId&&tr218Norm(K(x))===tr218Norm(k)&&tr218Norm(D(x))===tr218Norm(d)&&tr218Room(R(x))===tr218Room(r));}
function transferRoomCandidates(k,d,w){const out=[];for(let i=1;i<=15;i++){const r=String(i),people=tr218People(k,d,r,w&&w.id),n=people.length,free=Math.max(0,CAP-n),locked=roomLocked(k,d,r),mode=roomMode(k,d,r,people),mismatch=!!(w&&((mode==='male'&&isNu(w.gt))||(mode==='female'&&isNam(w.gt))));out.push({r,n,free,locked,mode,mismatch})}return out}
function renderTransferRooms(){if(!TRANSFER_W)return;const k=$('trKtx').value,d=$('trDay').value,grid=$('trRoomGrid'),sum=$('trRoomSummary'),cur=$('trRoom').value,list=transferRoomCandidates(k,d,TRANSFER_W),visible=list.filter(x=>x.n>0),canUse=x=>!x.locked;if(sum)sum.textContent=`${visible.filter(canUse).length} phòng có thể chọn / ${list.length} phòng (quá 20 người chỉ cảnh báo)`;const cap=$('trCapText');if(cap)cap.textContent=`Định mức ${CAP||20} người/phòng`;const roomSelect=$('trRoomSelect');if(roomSelect){roomSelect.innerHTML='<option value="">— Chọn Phòng —</option>'+visible.filter(x=>!x.locked).map(x=>'<option value="'+x.r+'" '+(x.r===cur?'selected':'')+'>Phòng '+x.r+' · '+x.n+'/'+CAP+' người</option>').join('');roomSelect.value=visible.some(x=>x.r===cur&&!x.locked)?cur:'';roomSelect.onchange=()=>{$('trRoom').value=roomSelect.value;renderTransferRooms()};}if(!visible.some(x=>x.r===cur&&canUse(x)))$('trRoom').value='';grid.innerHTML=(visible.length?visible:[]).map(x=>{const unavailable=!canUse(x),status=x.n>CAP?'Quá tải':x.n===CAP?'Đủ định mức':x.free<=3?'Sắp đầy':'Còn trống',band=x.n>CAP?'over':x.n===CAP?'full':x.free<=3?'near':'available';return `<button type="button" class="transfer-room-card ${$('trRoom').value===x.r?'on':''} ${unavailable?'tr218-disabled':''} ${x.n===0?'tr218-empty':x.free<=3?'tr218-low':''} ${x.mismatch?'compat-warn':''}" data-ktx-room-used="${x.n}" data-ktx-room-band="${x.n<=6?'low':x.n<=14?'medium':x.n<=19?'high':x.n===20?'full':'critical'}" data-tr-room="${x.r}" ${unavailable?'disabled':''} data-occupancy="${band}" title="P.${x.r} · ${x.n}/${CAP} người · còn ${x.free} chỗ${x.locked?' · Đang khóa':''}${x.mismatch?' · Cảnh báo giới tính phòng':''}"><div class="tr2214-title"><strong>P.${x.r}</strong><em class="tr175-status tr175-${band}">${esc(status)}</em></div><span class="tr175-count">${x.n}/${CAP} người · Trống ${x.free}</span></button>`}).join('')||(visible.length?'':'<div class="transfer-empty-hint">Dãy này chưa có phòng nào đang có người. Không có phòng đích phù hợp để chuyển.</div>');grid.querySelectorAll('[data-tr-room]').forEach(b=>b.onclick=()=>{$('trRoom').value=b.dataset.trRoom;renderTransferRooms()});transferInfo()}
async function openTransfer(w){if(!can('transfer',w))return alert('Bạn không có quyền chuyển phòng công nhân này.');/* STEP239: Không chặn mở hộp chuyển phòng bằng lượt tải toàn bộ Supabase; sử dụng W đang tải trong phiên. */TRANSFER_W=w;const old=`${K(w)} · ${D(w)} · P.${R(w)||'—'}`;$('transferSub').textContent=`${w.name}${w.mnv?' · MNV '+w.mnv:''}`;$('transferCurrent').innerHTML=`<div class="tr227-location"><b>Phòng hiện tại</b><span>${esc(old)}</span></div><span class="tr227-gender">${esc(w.gt||'Chưa xác định giới tính')}</span>`;(function(){const c=window.KTX_GLOBAL_CONFIG||{};const available=new Set(['KTX 1','KTX 2']);(c.sites||[]).forEach(site=>{if(Number(site.number)>=1)available.add('KTX '+Number(site.number))});(typeof W!=='undefined'?W:[]).forEach(person=>{const val=String(K(person)||'').trim();if(/^KTX\s+\d+$/i.test(val))available.add(val)});available.add(K(w));const el=$('trKtx');el.innerHTML=[...available].sort((a,b)=>Number(a.match(/\d+/)?.[0]||0)-Number(b.match(/\d+/)?.[0]||0)).map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('')})();$('trKtx').value=K(w);$('trDay').value='Dãy 1';$('trRoom').value='';$('trNote').value='';renderTransferRooms();const dlg=$('transferDlg');if(!dlg.open)dlg.showModal()}
function transferInfo(){if(!TRANSFER_W)return;const k=$('trKtx').value,d=$('trDay').value,r=$('trRoom').value,info=$('trInfo');if(!r){info.className='transfer-target-info';info.innerHTML='Chọn phòng để xem quân số và cảnh báo định mức.';$('transferGo').disabled=true;return}const people=tr218People(k,d,r,TRANSFER_W.id),n=people.length,free=Math.max(0,CAP-n),mode=roomMode(k,d,r,people),mismatch=(mode==='male'&&isNu(TRANSFER_W.gt))||(mode==='female'&&isNam(TRANSFER_W.gt));const unavailable=roomLocked(k,d,r); $('transferGo').disabled=unavailable;info.className='transfer-target-info '+(unavailable||n>=CAP||mismatch?'warn':'ok');info.innerHTML=`Phòng đích <b>${esc(k)} · ${esc(d)} · P.${esc(r)}</b> hiện có <b>${n}/${CAP}</b> người · còn <b>${free}</b> chỗ · ${esc(roomTypeText(mode))}.${n>=CAP?' <b>⚠ Đạt/vượt định mức 20 người; vẫn được điều chuyển.</b>':''}${mismatch?' <b>⚠ Công năng phòng chưa phù hợp giới tính công nhân.</b>':''}`}
['trKtx','trDay'].forEach(id=>{const e=$(id);if(e)e.onchange=()=>{$('trRoom').value='';renderTransferRooms()}});$('transferX').onclick=$('transferCancel').onclick=()=>$('transferDlg').close();$('transferGo').onclick=async()=>{const w=TRANSFER_W;if(!w)return;const k=$('trKtx').value,d=$('trDay').value,r=$('trRoom').value,note=$('trNote').value.trim();if(!r)return alert('Hãy chọn phòng đích.');if(!['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'].includes(tr218Room(r))){renderTransferRooms();return alert('Phòng đích không hợp lệ.');}if(tr218Norm(K(w))===tr218Norm(k)&&tr218Norm(D(w))===tr218Norm(d)&&tr218Room(R(w))===tr218Room(r))return alert('Công nhân đang ở đúng phòng này.');if(roomLocked(k,d,r)){renderTransferRooms();return alert('Phòng đích vừa được khóa. Hãy chọn phòng khác.')}const n=tr218People(k,d,r,w.id).length;if(n>=CAP&&!await ask(`Phòng ${r} hiện có ${n}/${CAP} người. Điều chuyển sẽ vượt định mức 20 người/phòng. Anh/chị vẫn muốn tiếp tục?`,{title:'Cảnh báo phòng vượt định mức',ok:'Vẫn điều chuyển'}))return;const people=tr218People(k,d,r,w.id),mode=roomMode(k,d,r,people),mismatch=(mode==='male'&&isNu(w.gt))||(mode==='female'&&isNam(w.gt));if(mismatch&&!await ask(`Phòng ${r} đang được phân loại ${roomTypeText(mode)}, trong khi công nhân là ${w.gt||'chưa xác định giới tính'}. Bạn vẫn muốn chuyển?`,{title:'Cảnh báo công năng phòng',ok:'Vẫn chuyển'}))return;const oldK=K(w),oldD=D(w),oldR=R(w)||'',old=`${oldK} · ${oldD} · P.${oldR}`;const newLoc=`${k} · ${d} · P.${r}`;const tp=oldK!==k?'TRANSFER_KTX':'MOVE';const btn=$('transferGo');if(btn)btn.disabled=true;try{await ktxSaveWorkerAtomic122(w,{ktx:k,day:d,room:r},tp,`${tp==='TRANSFER_KTX'?'Chuyển KTX':'Chuyển phòng'}: ${old} → ${newLoc}${note?' · '+note:''}`,{note});$('transferDlg').close();all();alert(`Đã lưu trên Supabase và xác minh ${w.name} đến ${newLoc}.`)}catch(e){alert('CHUYỂN PHÒNG CHƯA THÀNH CÔNG: '+(e.message||e)+'\nDữ liệu trên bảng chưa được thay đổi.')}finally{if(btn)btn.disabled=false}};

// Ghi nhận lịch sử tạm trú/tạm vắng từ các nút hiện có.
const _tttv73=tttv;tttv=function(){_tttv73();[['tA','RESIDENCE','Đánh dấu đã khai báo tạm trú'],['tB','RESIDENCE','Bỏ trạng thái đã khai báo tạm trú'],['tC','AWAY','Ghi nhận tạm vắng'],['tD','RETURN','Đã quay lại KTX']].forEach(([id,tp,msg])=>{const b=$(id);if(!b||b.dataset.h73)return;b.dataset.h73='1';const old=b.onclick;b.onclick=async e=>{const ids=new Set(TS.sel||[]),before=W.filter(w=>ids.has(w.id)).map(w=>({id:w.id,s:workerSnapshot(w)}));const r=old&&await old.call(b,e);before.forEach(x=>{const w=W.find(z=>z.id===x.id);if(w){addHistory(w,tp,msg);auditPush(tp,`${msg}: ${w.name}`,{workerId:w.id,before:x.s,after:workerSnapshot(w)})}});sv();updateAlertBadges();return r}})};

// Import an toàn: parse -> preview -> confirm + undo.
async function parseWorkerImport73(f){ASN=0;const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true}),out=[];wb.SheetNames.forEach(sn=>{if(/so do|csvc|dieu khien/.test(sa(sn)))return;const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:''});let h=-1,m={};for(let i=0;i<Math.min(8,rows.length);i++){const t={};rows[i].forEach((c,j)=>{const k=sa(c);MAP.forEach(([x,re])=>{if(!(x in t)&&k&&re.test(k))t[x]=j})});if('name' in t&&Object.keys(t).length>=3){h=i;m=t;break}}if(h<0)return;rows.slice(h+1).forEach((r,i)=>{const o={id:'w'+Date.now()+'_'+out.length,_srcRow:h+i+2};MAP.forEach(([x])=>{let v=x in m?r[m[x]]:'';o[x]=(x=='date'||x=='dob'||x=='out')?iso(v):String(v==null?'':v).trim()});if(!o.name)return;o.mnv=o.mnv.replace(/\.0$/,'');if(/^cho ma$/.test(sa(o.mnv)))o.mnv='';const g=sa(o.gt);o.gt=/^nu/.test(g)?'Nữ':/^nam/.test(g)?'Nam':o.gt;o.room=o.room.replace(/\.0$/,'');o.sdt=o.sdt.replace(/\D/g,'');o.cccd=o.cccd.replace(/\D/g,'');if(!('day' in m)||!o.day){o.day=sn;o._nd=1}if(o.day&&/^\d+$/.test(o.day))o.day='Dãy '+o.day;if(o.ktx&&/^\d+$/.test(o.ktx))o.ktx='KTX '+o.ktx;autoSplit(o);normW(o);out.push(o)})});return out}
function analyzeImport73(out){const rows=[];let valid=0,dup=0,bad=0,warn=0;const seenC={},seenM={};out.forEach(o=>{const match=(o.cccd&&W.find(w=>w.cccd===o.cccd))||(o.mnv&&W.find(w=>w.mnv===o.mnv)),v=validateWorkerData(o,match);if(match)dup++;if(v.errors.length)bad++;else valid++;if(v.warnings.length)warn++;if(o.cccd){if(seenC[o.cccd])v.errors.push('CCCD trùng ngay trong file');seenC[o.cccd]=1}if(o.mnv){if(seenM[o.mnv])v.warnings.push('Mã NV trùng ngay trong file');seenM[o.mnv]=1}rows.push({o,v,match})});return {rows,valid,dup,bad,warn}}
function showImportPreview73(f,out){const a=analyzeImport73(out);IMP_PENDING={file:f,out,analysis:a,mode:$('imode').value};$('impPrevSub').textContent=`${f.name} · ${out.length} dòng nhận diện được · chế độ ${IMP_PENDING.mode==='replace'?'thay thế':'cập nhật & thêm mới'}`;$('impPrevBody').innerHTML=`<div class="imp-preview-grid"><div class="imp-kpi"><span>Tổng dòng</span><b>${out.length}</b></div><div class="imp-kpi"><span>Hợp lệ cơ bản</span><b>${a.valid}</b></div><div class="imp-kpi"><span>Khớp người cũ</span><b>${a.dup}</b></div><div class="imp-kpi"><span>Có lỗi</span><b>${a.bad}</b></div></div><div class="imp-errors"><table><tr><th>Dòng</th><th>Họ tên</th><th>CCCD</th><th>Mã NV</th><th>Đánh giá</th></tr>${a.rows.slice(0,120).map(x=>`<tr><td>${x.o._srcRow||''}</td><td class="wr">${esc(x.o.name)}</td><td>${esc(x.o.cccd||'—')}</td><td>${esc(x.o.mnv||'—')}</td><td>${x.v.errors.length?`<span class="data-error">${esc(x.v.errors.join('; '))}</span>`:x.v.warnings.length?`<span class="data-warn">${esc(x.v.warnings.join('; '))}</span>`:x.match?'<span class="tag a">Sẽ cập nhật</span>':'<span class="tag g">Thêm mới</span>'}</td></tr>`).join('')}</table></div>${a.rows.length>120?'<div class="mut" style="margin-top:6px">Chỉ hiển thị 120 dòng đầu.</div>':''}`;$('impPreviewDlg').showModal()}
$('impPrevX').onclick=$('impPrevCancel').onclick=()=>{$('impPreviewDlg').close();IMP_PENDING=null};
$('impPrevGo').onclick=async()=>{const p=IMP_PENDING;if(!p)return;const badRows=p.analysis.rows.filter(x=>x.v.errors.length);if(badRows.length&&!await ask(`Có ${badRows.length} dòng có lỗi dữ liệu. Các dòng lỗi sẽ bị bỏ qua. Bạn muốn tiếp tục?`,{title:'Import có lỗi',ok:'Tiếp tục'}))return;const out=p.analysis.rows.filter(x=>!x.v.errors.length).map(x=>x.o);if(!out.length)return alert('Không có dòng hợp lệ để import.');localStorage.setItem('ktx_import_undo',JSON.stringify({at:Date.now(),file:p.file.name,W:JSON.parse(JSON.stringify(W))}));const mode=p.mode;if(!W.length||mode==='replace'){out.forEach(o=>{delete o._nd;delete o._srcRow;addHistory(o,'IMPORT','Được thêm từ Import Excel')});W=out;auditPush('IMPORT',`Import thay thế ${out.length} công nhân từ ${p.file.name}`)}else{const ix={c:{},m:{}};W.forEach(w=>{if(w.cccd)ix.c[w.cccd]=w;if(w.mnv)ix.m[w.mnv]=w});let up=0,nw=0;out.forEach(o=>{const w=(o.cccd&&ix.c[o.cccd])||(o.mnv&&ix.m[o.mnv]);if(w){const before=workerSnapshot(w);Object.keys(o).forEach(k=>{if(['id','tt','tv','_nd','_srcRow'].includes(k)||(k==='day'&&o._nd))return;if(o[k]!==''&&o[k]!==undefined)w[k]=o[k]});addHistory(w,'IMPORT','Cập nhật từ Import Excel');up++}else{delete o._nd;delete o._srcRow;addHistory(o,'IMPORT','Thêm mới từ Import Excel');W.push(o);nw++}});auditPush('IMPORT',`Import từ ${p.file.name}: ${up} cập nhật, ${nw} thêm mới`)}sel.clear();sv();$('impPreviewDlg').close();IMP_PENDING=null;all();alert('Import hoàn tất. Có thể dùng nút “Hoàn tác import” nếu cần.')};
if($('fx'))$('fx').onchange=async e=>{if(!can('import')){alert('Bạn không có quyền Import Excel.');e.target.value='';return}const f=e.target.files[0];e.target.value='';if(!f)return;try{const out=await parseWorkerImport73(f);if(!out.length)return alert('Không nhận ra dữ liệu công nhân trong file.');showImportPreview73(f,out)}catch(err){alert('Không đọc được file: '+(err.message||err))}};
if($('undoImport'))$('undoImport').onclick=async()=>{const raw=localStorage.getItem('ktx_import_undo');if(!raw)return alert('Chưa có lần import gần nhất để hoàn tác.');let o;try{o=JSON.parse(raw)}catch(e){return alert('Bản hoàn tác không hợp lệ.')}if(!Array.isArray(o.W))return alert('Bản hoàn tác không hợp lệ.');if(!await ask(`Khôi phục danh sách về trước lần import ${o.file||''}?`,{title:'Hoàn tác Import Excel',ok:'Hoàn tác'}))return;W=o.W;localStorage.removeItem('ktx_import_undo');auditPush('UNDO_IMPORT',`Hoàn tác lần import ${o.file||''}`);sv();all();alert('Đã hoàn tác lần import gần nhất.')};

// Nhật ký hệ thống nâng cao.
logp=function(){const actors=[...new Set(LOG.map(ktxAuditActorDisplay).filter(Boolean))].sort(),acts=[...new Set(LOG.map(l=>l.a).filter(Boolean))].sort();$('log').innerHTML=`<div class="card"><div class="log-toolbar"><input id="lgq" placeholder="Tìm hành động, tên công nhân, chi tiết..." style="flex:1;min-width:220px"><select id="lga"><option value="">Tất cả hành động</option>${acts.map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="lgu"><option value="">Tất cả người dùng</option>${actors.map(x=>`<option>${esc(x)}</option>`).join('')}</select><input id="lgd" type="date"></div><div id="lgbody"></div></div>`;const render=()=>{const q=sa($('lgq').value),a=$('lga').value,u=$('lgu').value,d=$('lgd').value;const L=LOG.filter(l=>(!a||l.a===a)&&(!u||ktxAuditActorDisplay(l)===u)&&(!d||String(l.day||'')===d)&&(!q||sa([l.a,l.d,ktxAuditActorDisplay(l),JSON.stringify(l.fields||[])].join(' ')).includes(q))).slice(0,500);$('lgbody').innerHTML=`<div class="mut" style="margin-bottom:8px">${L.length} bản ghi hiển thị / ${LOG.length} tổng bản ghi</div><div class="wrap"><table><tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Chi tiết</th></tr>${L.map(l=>`<tr><td>${esc(l.t||'')}</td><td class="log-actor">${esc(ktxAuditActorDisplay(l))}<div class="mut" style="font-size:9px">${esc(l.role||'')}</div></td><td><span class="tag">${esc(l.a||'')}</span></td><td><div class="log-detail">${esc(l.d||'')}</div>${l.fields&&l.fields.length?`<span class="diff-pill">${l.fields.length} trường thay đổi</span>`:''}</td></tr>`).join('')}</table></div>`};['lgq','lga','lgu','lgd'].forEach(id=>$(id).oninput=render);render()};

function managementReportsPage(){const rs=rooms(W),over=rs.filter(r=>r.n>CAP).length,free=rs.reduce((s,r)=>s+Math.max(0,CAP-r.n),0),tt=W.filter(w=>w.tt).length,away=W.filter(w=>isAwayOn(w)).length;$('reports').innerHTML=`<div class="report-grid"><div class="report-kpi"><span>Tổng công nhân</span><b>${W.length.toLocaleString('vi-VN')}</b></div><div class="report-kpi"><span>Chỗ còn trống</span><b>${free.toLocaleString('vi-VN')}</b></div><div class="report-kpi"><span>Phòng quá tải</span><b>${over}</b></div><div class="report-kpi"><span>Đang tạm vắng</span><b>${away}</b></div></div><div class="card report-section"><div class="report-toolbar"><label>Từ ngày<input id="mgrFrom" type="date" value="${ldy().slice(0,8)}01"></label><label>Đến ngày<input id="mgrTo" type="date" value="${ldy()}"></label><select id="mgrType"><option value="summary">Tổng hợp vận hành</option><option value="residence">Tạm trú · Tạm vắng</option><option value="rooms">Công suất phòng</option></select><button class="btn g" id="mgrExport">Xuất báo cáo Excel</button></div><div class="mut" style="margin-top:10px">Tạm trú: ${tt}/${W.length} · Chưa khai báo: ${W.length-tt} · Định mức phòng cố định: ${CAP} người/phòng.</div></div><div class="card report-section"><h3>Thống kê theo KTX</h3><div class="wrap"><table><tr><th>KTX</th><th>Công nhân</th><th>Phòng có dữ liệu</th><th>Chỗ còn trống</th><th>Quá tải</th><th>Chưa tạm trú</th></tr>${[...new Set(W.map(K))].sort(num).map(k=>{const l=W.filter(w=>K(w)===k),r=rooms(l);return `<tr><td><b>${esc(k)}</b></td><td>${l.length}</td><td>${r.length}</td><td>${r.reduce((s,x)=>s+Math.max(0,CAP-x.n),0)}</td><td>${r.filter(x=>x.n>CAP).length}</td><td>${l.filter(w=>!w.tt).length}</td></tr>`}).join('')}</table></div></div>`;$('mgrExport').onclick=()=>{const type=$('mgrType').value;if(type==='rooms'){const r=rooms(W);return save([['KTX','Dãy','Phòng','Sĩ số','Định mức','Chỗ còn trống','Trạng thái'],...r.map(x=>[x.ktx,x.day,x.room,x.n,CAP,Math.max(0,CAP-x.n),x.n>CAP?'Quá tải':x.n===CAP?'Đầy':'Còn trống'])],`Bao_cao_cong_suat_phong_${ldy()}.xlsx`,'Công suất phòng')}if(type==='residence')return save([['Họ và tên','Mã NV','KTX','Dãy','Phòng','Tạm trú','Tạm vắng từ','Tạm vắng đến','Lý do'],...W.map(w=>[w.name,w.mnv,K(w),D(w),R(w),w.tt?vn(w.tt):'Chưa khai báo',w.tv?vn(w.tv.from):'',w.tv?vn(w.tv.to):'',w.tv?w.tv.why||'':''])],`Bao_cao_tam_tru_tam_vang_${ldy()}.xlsx`,'Tạm trú tạm vắng');return save([['Chỉ tiêu','Giá trị'],['Tổng công nhân',W.length],['Tổng phòng có dữ liệu',rs.length],['Chỗ còn trống',free],['Phòng quá tải',over],['Đã khai báo tạm trú',tt],['Chưa khai báo tạm trú',W.length-tt],['Đang tạm vắng',away]],`Bao_cao_quan_tri_${ldy()}.xlsx`,'Tổng hợp')}}

// STEP99 — PWA / cài ứng dụng.
let PWA_PROMPT=null;
const pwaStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function pwaIsIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function pwaUpdateUI(){const b=$('pwaInstallNav'),st=$('pwaState'),tx=$('pwaInstallText');if(!b)return;const installed=pwaStandalone();b.classList.toggle('installed',installed);if(st)st.style.display=installed?'inline-flex':'none';if(tx)tx.textContent=installed?'Ứng dụng đã cài':'Cài ứng dụng'}
function pwaOpenInstall(){const d=$('pwaInstallDlg'),msg=$('pwaInstallMsg'),goBtn=$('pwaInstallGo');if(!d)return;if(pwaStandalone()){msg.innerHTML='<span class=\"pwa-installed-note\">✓ Ứng dụng KTX Hóc Môn đã được cài và đang chạy ở chế độ ứng dụng.</span>';goBtn.style.display='none'}else if(pwaIsIOS()){msg.innerHTML='<div class=\"pwa-ios-note\">Trên iPhone/iPad: mở bằng Safari → bấm <b>Chia sẻ</b> → chọn <b>Thêm vào Màn hình chính</b>.</div>';goBtn.style.display='none'}else{goBtn.style.display='inline-flex';msg.innerHTML=PWA_PROMPT?'Ứng dụng đã sẵn sàng để cài trên thiết bị này.':'Nếu nút cài chưa xuất hiện, hãy dùng biểu tượng <b>Cài đặt ứng dụng</b> trên thanh địa chỉ của Chrome/Cốc Cốc/Edge.'}try{d.showModal()}catch(e){d.setAttribute('open','')}}
async function pwaInstall(){if(pwaStandalone())return pwaOpenInstall();if(!PWA_PROMPT)return pwaOpenInstall();PWA_PROMPT.prompt();try{await PWA_PROMPT.userChoice}catch(e){}PWA_PROMPT=null;pwaUpdateUI();if($('pwaInstallDlg')&&$('pwaInstallDlg').open)$('pwaInstallDlg').close()}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();PWA_PROMPT=e;pwaUpdateUI()});
window.addEventListener('appinstalled',()=>{PWA_PROMPT=null;pwaUpdateUI();if($('pwaInstallDlg')&&$('pwaInstallDlg').open)$('pwaInstallDlg').close()});
if($('pwaInstallNav'))$('pwaInstallNav').onclick=pwaOpenInstall;if($('pwaInstallGo'))$('pwaInstallGo').onclick=pwaInstall;if($('pwaInstallClose'))$('pwaInstallClose').onclick=()=>$('pwaInstallDlg').close();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('/pwa/sw.js?v=stage93-modular',{scope:'/'});reg.update().catch(()=>{})}catch(e){console.warn('PWA service worker:',e)}pwaUpdateUI();const lp=new URLSearchParams(location.search).get('page');if(['home','work','meal','t6','qr','arc','reports'].includes(lp)){setTimeout(()=>{try{go(lp)}catch(e){}},350)}});
else window.addEventListener('load',pwaUpdateUI);
setTimeout(()=>{updateAlertBadges();if(page==='home')home();pwaUpdateUI()},80);

;
/* >>> Original: assets/js/modules/workers/script-18.js >>> */

/* STEP81 */
const FIELD_LABEL81={name:'Họ và tên',mnv:'Mã NV',gt:'Giới tính',dob:'Ngày sinh',sdt:'SĐT',cccd:'CCCD',unit:'Đơn vị',td:'Tiểu đoàn',ktx:'KTX',day:'Dãy',room:'Phòng',bed:'Chỗ',date:'Ngày vào KTX',out:'Ngày ra KTX',tt:'Tạm trú',tv:'Tạm vắng',leader:'Tổ trưởng',lsdt:'SĐT tổ trưởng',tinh:'Địa chỉ'};
const clone81=o=>o==null?o:JSON.parse(JSON.stringify(o));
function diff81(before,after){before=before||{};after=after||{};const keys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>!['history','o'].includes(k));return keys.filter(k=>JSON.stringify(before[k]??'')!==JSON.stringify(after[k]??'')).map(k=>({field:k,label:FIELD_LABEL81[k]||k,from:before[k]??'',to:after[k]??''}))}
function fmt81(v){if(v==null||v==='')return '—';if(typeof v==='object'){if(v.from||v.to)return `${v.from?vn(v.from):'—'} → ${v.to?vn(v.to):'—'}${v.why?' · '+v.why:''}`;try{return JSON.stringify(v)}catch(e){return String(v)}}return String(v)}
function audit81(action,detail,meta={}){const changes=meta.changes||((meta.before||meta.after)?diff81(meta.before,meta.after):[]);const rec={t:new Date().toLocaleString('vi-VN'),a:action,d:detail,day:ldy(),at:Date.now(),actor:actorName(),role:(typeof ME!='undefined'&&ME.role)||'local',workerId:meta.workerId||'',workerName:meta.workerName||'',changes,fields:changes.map(x=>x.field),note:meta.note||''};LOG.unshift(rec);if(LOG.length>5000)LOG=LOG.slice(0,5000);if(meta.persist!==false)sv();return rec}
// Make all existing enhanced calls store structured before/after diffs.
auditPush=function(action,detail,meta={}){return audit81(action,detail,meta)};

// 1) System audit — delete/archive/restore/purge with actor + worker history.
if(typeof delWorkers==='function'&&!window.__step81DelWrapped){window.__step81DelWrapped=true;const oldDel81=delWorkers;delWorkers=function(list,inf){const L=(list||[]).slice(),snaps=L.map(w=>({id:w.id,name:w.name,before:workerSnapshot(w),ref:w}));const mode=(inf&&inf.mode)||'archive',reason=(inf&&inf.reason)||'Khác';if(mode!=='purge')L.forEach(w=>addHistory(w,'CHECKOUT',`Ra khỏi KTX · ${reason}`,{reason,from:{ktx:K(w),day:D(w),room:R(w)||''}}));oldDel81(list,inf);snaps.forEach(x=>{const removed=!W.some(w=>w.id===x.id);if(removed)audit81(mode==='purge'?'DELETE_PERMANENT':'CHECKOUT',mode==='purge'?`Xóa hẳn công nhân: ${x.name}`:`Chuyển công nhân ra khỏi danh sách: ${x.name} · ${reason}`,{workerId:x.id,workerName:x.name,before:x.before,after:null,persist:false})});sv();updateAlertBadges()}}
if(typeof arcRestore==='function'&&!window.__step81RestoreWrapped){window.__step81RestoreWrapped=true;const oldRestore81=arcRestore;arcRestore=async function(L){const snaps=(L||[]).map(a=>({id:a.id,name:a.w&&a.w.name,before:clone81(a.w)}));await oldRestore81(L);snaps.forEach(x=>{const w=W.find(z=>z.id===x.id);if(w){addHistory(w,'RESTORE',`Khôi phục về danh sách công nhân · ${K(w)} · ${D(w)} · P.${R(w)||'—'}`,{to:{ktx:K(w),day:D(w),room:R(w)||''}});audit81('RESTORE',`Khôi phục công nhân: ${w.name}`,{workerId:w.id,workerName:w.name,before:null,after:workerSnapshot(w),persist:false})}});sv();updateAlertBadges()}}
if(typeof arcPurge==='function'&&!window.__step81ArcPurgeWrapped){window.__step81ArcPurgeWrapped=true;const oldPurge81=arcPurge;arcPurge=async function(L){const snaps=(L||[]).map(a=>({id:a.id,name:a.w&&a.w.name,before:clone81(a.w)}));await oldPurge81(L);snaps.forEach(x=>{if(!ARC.some(a=>a.id===x.id))audit81('PURGE_ARCHIVE',`Xóa hẳn hồ sơ lưu: ${x.name}`,{workerId:x.id,workerName:x.name,before:x.before,after:null,persist:false})});sv()}}

// Tạm trú / tạm vắng: every action is audited and written to worker residence timeline.
if(typeof tttv==='function'&&!window.__step81TttvWrapped){window.__step81TttvWrapped=true;const oldTttv81=tttv;tttv=function(){oldTttv81();const selected=()=>W.filter(w=>TS.sel.has(w.id)),finish=()=>{TS.sel.clear();sv();updateAlertBadges();tttv()};const need=()=>{if(!TS.sel.size){alert('Hãy tick chọn ít nhất một công nhân.');return false}return true};if(TS.tab==='tt'){
 const a=$('tA');if(a)a.onclick=()=>{if(!need())return;selected().forEach(w=>{const before=workerSnapshot(w);w.tt=tdy();addHistory(w,'RESIDENCE','Đã khai báo tạm trú');audit81('TEMP_RESIDENCE_ON',`Đánh dấu đã khai báo tạm trú: ${w.name}`,{workerId:w.id,workerName:w.name,before,after:workerSnapshot(w),persist:false})});alert(`Đã đánh dấu ${TS.sel.size} công nhân đã khai báo tạm trú.`);finish()};
 const b=$('tB');if(b)b.onclick=()=>{if(!need())return;selected().forEach(w=>{const before=workerSnapshot(w);w.tt='';addHistory(w,'RESIDENCE_CLEAR','Bỏ đánh dấu khai báo tạm trú');audit81('TEMP_RESIDENCE_OFF',`Bỏ đánh dấu tạm trú: ${w.name}`,{workerId:w.id,workerName:w.name,before,after:workerSnapshot(w),persist:false})});alert(`Đã bỏ đánh dấu tạm trú cho ${TS.sel.size} công nhân.`);finish()};
 }else{
 const c=$('tC');if(c)c.onclick=()=>{if(!need())return;const from=$('v1').value,to=$('v2').value,why=$('v3').value.trim();if(!from)return alert('Hãy chọn ngày bắt đầu tạm vắng.');if(to&&to<from)return alert('Ngày kết thúc phải sau ngày bắt đầu.');selected().forEach(w=>{const before=workerSnapshot(w);w.tv={from,to,why};addHistory(w,'AWAY',`Tạm vắng từ ${vn(from)}${to?' đến '+vn(to):''}${why?' · '+why:''}`);audit81('AWAY_START',`Ghi nhận tạm vắng: ${w.name}`,{workerId:w.id,workerName:w.name,before,after:workerSnapshot(w),persist:false})});alert(`Đã ghi nhận tạm vắng cho ${TS.sel.size} công nhân.`);finish()};
 const d=$('tD');if(d)d.onclick=()=>{if(!need())return;selected().forEach(w=>{const before=workerSnapshot(w),old=clone81(w.tv);w.tv=null;addHistory(w,'RETURN',`Đã quay lại KTX${old&&old.from?' · sau tạm vắng từ '+vn(old.from):''}`);audit81('AWAY_END',`Công nhân quay lại KTX: ${w.name}`,{workerId:w.id,workerName:w.name,before,after:workerSnapshot(w),persist:false})});alert(`Đã cập nhật ${TS.sel.size} công nhân quay lại KTX.`);finish()};
 }};}
if(typeof importTTTV==='function'&&!window.__step81ImportTtWrapped){window.__step81ImportTtWrapped=true;const oldImpTT81=importTTTV;importTTTV=async function(files,kind){const before=new Map(W.map(w=>[w.id,workerSnapshot(w)]));await oldImpTT81(files,kind);W.forEach(w=>{const b=before.get(w.id);if(!b)return;const ch=diff81(b,workerSnapshot(w)).filter(x=>x.field==='tt'||x.field==='tv');if(ch.length){addHistory(w,kind==='tt'?'RESIDENCE_IMPORT':'AWAY_IMPORT',kind==='tt'?'Cập nhật tạm trú từ file đăng ký':'Cập nhật tạm vắng từ file đăng ký');audit81(kind==='tt'?'TEMP_RESIDENCE_IMPORT':'AWAY_IMPORT',`Cập nhật từ file đăng ký: ${w.name}`,{workerId:w.id,workerName:w.name,changes:ch,persist:false})}});sv();updateAlertBadges()}}

// QR approval: validate, history and audit on check-in.
// Production QR safeguard: do NOT override qrApproveIn from index.html.
// Canonical implementation commits and confirms ktx_workers on Supabase BEFORE marking request approved.
// The legacy STEP81 wrapper approved requests before persisting workers and has been removed.

// 2) Alert center — group profile issues, dedupe and filter by category.
let ALERT_FILTER81='all',ALERT_QUERY81='';
const ALERT_CATS81={all:'Tất cả',profile:'Hồ sơ',room:'Phòng',duplicate:'Trùng dữ liệu',absence:'Tạm vắng'};
issueList=function(){const out=[],today=ldy(),seen=new Set(),push=(category,type,sev,title,detail,w)=>{const key=[category,type,w&&w.id||'',title,detail].join('|');if(seen.has(key))return;seen.add(key);out.push({category,type,sev,title,detail,w})};const rs=rooms(W);
 rs.filter(r=>r.n>CAP).forEach(r=>push('room','over','danger',`${r.ktx} · ${r.day} · P.${r.room}`,`Phòng quá tải ${r.n}/${CAP} người.`));
 W.forEach(w=>{const miss=[];if(!String(w.cccd||'').trim())miss.push('CCCD');if(!String(w.sdt||'').trim())miss.push('SĐT');if(!String(w.dob||'').trim())miss.push('ngày sinh');if(miss.length)push('profile','profile','warn',w.name,`Thiếu ${miss.join(', ')}.`,w);if(!R(w))push('room','room','danger',w.name,'Chưa được phân phòng.',w);if(w.tv&&w.tv.to&&String(w.tv.to).slice(0,10)<today)push('absence','tvexp','warn',w.name,`Tạm vắng đã hết hạn ${vn(w.tv.to)} nhưng chưa cập nhật quay lại.`,w)});
 const dc={},dm={};W.forEach(w=>{const c=String(w.cccd||'').replace(/\D/g,''),m=String(w.mnv||'').trim();if(c)(dc[c]=dc[c]||[]).push(w);if(m)(dm[m]=dm[m]||[]).push(w)});Object.values(dc).filter(a=>a.length>1).forEach(a=>push('duplicate','dupcccd','danger',a.map(x=>x.name).join(' / '),`Trùng CCCD: ${a[0].cccd}.`,a[0]));Object.values(dm).filter(a=>a.length>1).forEach(a=>push('duplicate','dupmnv','warn',a.map(x=>x.name).join(' / '),`Trùng Mã NV: ${a[0].mnv}.`,a[0]));
 rs.forEach(r=>{const meta=rmeta(r.ktx,r.day,r.room),md=meta.mode&&meta.mode!=='auto'?meta.mode:null;if(!md)return;r.l.filter(w=>(md==='male'&&isNu(w.gt))||(md==='female'&&isNam(w.gt))).forEach(w=>push('room','sex','danger',w.name,`${r.ktx} · ${r.day} · P.${r.room}: giới tính không phù hợp ${roomTypeText(md)}.`,w))});return out};
function filteredIssues81(){const q=sa(ALERT_QUERY81);return issueList().filter(x=>(ALERT_FILTER81==='all'||x.category===ALERT_FILTER81)&&(!q||sa([x.title,x.detail,x.category].join(' ')).includes(q)))}
function alertFilterHtml81(L){const counts={all:L.length};Object.keys(ALERT_CATS81).filter(k=>k!=='all').forEach(k=>counts[k]=L.filter(x=>x.category===k).length);return Object.entries(ALERT_CATS81).map(([k,l])=>`<button data-af81="${k}" class="${ALERT_FILTER81===k?'on':''}">${l}<span class="cnt">${counts[k]||0}</span></button>`).join('')}
renderAlertQuickDrawer=function(){const list=$('aqdList'),cnt=$('aqdCount'),sub=$('aqdSub'),read=$('aqdReadAll'),box=$('alertQuickDrawer');if(!box||!list)return;const A=issueList(),rd=alertReadSet(),U=A.filter(x=>!rd.has(alertSig(x))),L=filteredIssues81();if(cnt)cnt.textContent=`${A.length.toLocaleString('vi-VN')} vấn đề · ${U.length.toLocaleString('vi-VN')} chưa đọc`;if(sub)sub.textContent=U.length?'Chọn nhóm hoặc bấm hồ sơ để sửa nhanh':'Tất cả thông báo hiện tại đã được đọc';if(read){read.disabled=!U.length;read.textContent=U.length?`✓ Đã đọc tất cả (${U.length})`:'✓ Đã đọc tất cả'}let bar=box.querySelector('.alert-filterbar');if(!bar){bar=document.createElement('div');bar.className='alert-filterbar';box.insertBefore(bar,list)}bar.innerHTML=alertFilterHtml81(A);bar.querySelectorAll('[data-af81]').forEach(b=>b.onclick=e=>{e.stopPropagation();ALERT_FILTER81=b.dataset.af81;renderAlertQuickDrawer()});list.innerHTML=L.length?L.map(x=>{const canEdit=!!x.w,seenRead=rd.has(alertSig(x));return `<div class="aqd-item ${x.sev||''} ${canEdit?'clickable':''} ${seenRead?'seen':''}" ${canEdit?`data-aq-worker="${esc(x.w.id)}"`:''}><i class="aqd-dot"></i><div class="aqd-copy"><div class="aqd-title">${esc(x.title)}<span class="aqd-cat">${esc(ALERT_CATS81[x.category]||x.category)}</span>${seenRead?' <span class="mut" style="font-weight:600">· đã đọc</span>':''}</div><div class="aqd-detail">${esc(x.detail)}</div></div>${canEdit?`<button class="aqd-edit" data-aq-edit="${esc(x.w.id)}">Sửa ngay</button>`:'<span></span>'}</div>`}).join(''):'<div class="aqd-empty">Không có cảnh báo trong nhóm này.</div>';list.querySelectorAll('[data-aq-worker]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-aq-edit]'))return;const w=W.find(a=>a.id===el.dataset.aqWorker);if(w){closeAlertQuickDrawer();edit(w)}});list.querySelectorAll('[data-aq-edit]').forEach(b=>b.onclick=e=>{e.stopPropagation();const w=W.find(a=>a.id===b.dataset.aqEdit);if(w){closeAlertQuickDrawer();edit(w)}})};
alertCenterPage=function(){const A=issueList(),rd=alertReadSet(),U=A.filter(x=>!rd.has(alertSig(x))),L=filteredIssues81(),sevs=s=>A.filter(x=>x.sev===s).length;$('alerts').innerHTML=`<div class="alert-grid"><div class="alert-card danger"><span class="mut">CẦN XỬ LÝ NGAY</span><b>${sevs('danger')}</b></div><div class="alert-card warn"><span class="mut">CẢNH BÁO</span><b>${sevs('warn')}</b></div><div class="alert-card"><span class="mut">CHƯA ĐỌC</span><b>${U.length}</b></div><div class="alert-card ${A.length?'warn':'ok'}"><span class="mut">TỔNG VẤN ĐỀ</span><b>${A.length}</b></div></div><div class="card"><div class="row" style="margin-bottom:8px"><b>Danh sách cần xử lý</b><span class="mut" style="margin-left:auto">Đã gom nhóm, loại cảnh báo trùng lặp</span><button class="btn s sm alert-read-all" id="alertReadAll">✓ Đã đọc tất cả</button></div><div class="alert-filterbar" id="alertFilters81">${alertFilterHtml81(A)}</div><div class="alert-search"><input id="alertQ81" placeholder="Tìm tên, nội dung cảnh báo..." value="${esc(ALERT_QUERY81)}"></div><div class="alert-list">${L.length?L.map(x=>`<div class="alert-row ${x.sev}"><i class="alert-dot"></i><div class="who">${esc(x.title)}<div><span class="aqd-cat">${esc(ALERT_CATS81[x.category]||x.category)}</span></div></div><div class="why">${esc(x.detail)}</div>${x.w?`<button class="btn s sm" data-alw="${esc(x.w.id)}">Sửa hồ sơ</button>`:'<span></span>'}</div>`).join(''):'<div class="mut" style="padding:16px">Không có cảnh báo phù hợp bộ lọc.</div>'}</div></div>`;const ra=$('alertReadAll');if(ra){ra.disabled=!U.length;ra.onclick=markAllAlertsRead}$('alertFilters81').querySelectorAll('[data-af81]').forEach(b=>b.onclick=()=>{ALERT_FILTER81=b.dataset.af81;alertCenterPage()});$('alertQ81').oninput=e=>{ALERT_QUERY81=e.target.value;alertCenterPage()};document.querySelectorAll('#alerts [data-alw]').forEach(b=>b.onclick=()=>{const w=W.find(x=>x.id===b.dataset.alw);if(w)edit(w)})};

// 3) Stronger save validation + live validation panel.
validateWorkerData=function(o,existing){const errors=[],warnings=[],digits=x=>String(x||'').replace(/\D/g,'');const c=digits(o.cccd),p=digits(o.sdt),k=String(o.ktx||'').trim(),d=String(o.day||'').trim(),r=String(o.room||'').trim();if(!String(o.name||'').trim())errors.push('Họ và tên không được để trống.');if(c&&c.length!==12)errors.push('CCCD phải gồm đúng 12 chữ số.');if(!c)warnings.push('Chưa nhập CCCD.');if(p&&!/^0\d{9}$/.test(p))warnings.push('SĐT chưa đúng định dạng chuẩn (không chặn lưu/import).');if(!p)warnings.push('Chưa nhập SĐT.');if(!o.dob)warnings.push('Chưa nhập ngày sinh.');else {const birth=ktxNormalizeDob156(o.dob);if(!birth)errors.push('Ngày sinh không hợp lệ. Vui lòng nhập dd/mm/yyyy.');else if(birth>ldy())errors.push('Ngày sinh không được lớn hơn ngày hiện tại.');}const dupC=c&&W.find(w=>w.id!==(existing&&existing.id)&&digits(w.cccd)===c);if(dupC)errors.push(`CCCD đã tồn tại ở ${dupC.name}.`);const mv=String(o.mnv||'').trim(),dupM=mv&&W.find(w=>w.id!==(existing&&existing.id)&&String(w.mnv||'').trim()===mv);if(dupM)warnings.push(`Mã NV trùng với ${dupM.name}.`);if(k&&!/^KTX\s*[1-9]\d*$/i.test(k))errors.push('KTX phải có dạng KTX 1, KTX 2, KTX 3…');if(d&&!/^Dãy\s*[1-6]$/i.test(d))errors.push('Dãy chỉ nhận Dãy 1 đến Dãy 6.');if(r&&(!/^\d+$/.test(r)||+r<1||+r>15))errors.push('Phòng chỉ nhận số 1 đến 15.');if(!r)warnings.push('Công nhân chưa được phân phòng.');if(k&&d&&r&&!errors.some(x=>/KTX|Dãy|Phòng chỉ/.test(x))){if(roomLocked(k,d,r)&&(!existing||roomKey2(k,d,r)!==roomKey2(existing.ktx,existing.day,existing.room)))errors.push('Phòng đích đang bị khóa.');const n=activeRoomCount(k,d,r,existing&&existing.id);if(n>=CAP)warnings.push(`Phòng ${r} hiện ${n}/${CAP} người; lưu sẽ vượt định mức cố định ${CAP} người/phòng.`);const peers=W.filter(w=>w.id!==(existing&&existing.id)&&K(w)==k&&D(w)==d&&String(R(w))===String(r)),md=roomMode(k,d,r,peers);if((md==='male'&&isNu(o.gt))||(md==='female'&&isNam(o.gt)))warnings.push(`Giới tính không phù hợp công năng ${roomTypeText(md)}.`)}return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]}};
function formObject81(){const o={};F.forEach(([f])=>{const e=$('f_'+f);if(e)o[f]=e.value.trim()});o.sdt=String(o.sdt||'').replace(/\D/g,'');o.cccd=String(o.cccd||'').replace(/\D/g,'');normW(o);return o}
function renderValidation81(){const box=$('validation81');if(!box)return;const v=validateWorkerData(formObject81(),EW);box.className='validation-box '+(v.errors.length?'bad':v.warnings.length?'warn':'ok');box.innerHTML=`<div class="validation-title">${v.errors.length?'Dữ liệu chưa hợp lệ':v.warnings.length?'Có cảnh báo cần kiểm tra':'Dữ liệu hợp lệ'}</div>${v.errors.length||v.warnings.length?`<ul class="validation-list">${v.errors.map(x=>`<li class="err">${esc(x)}</li>`).join('')}${v.warnings.map(x=>`<li class="wn">${esc(x)}</li>`).join('')}</ul>`:'<div class="mut" style="font-size:10px;margin-top:4px">Có thể lưu hồ sơ.</div>'}`}
if(typeof edit==='function'&&!window.__step81EditWrapped){window.__step81EditWrapped=true;const oldEdit81=edit;edit=function(w){oldEdit81(w);let box=$('validation81');if(!box){box=document.createElement('div');box.id='validation81';box.className='validation-box';$('df').appendChild(box)}document.querySelectorAll('#df input,#df select').forEach(e=>{e.addEventListener('input',renderValidation81);e.addEventListener('change',renderValidation81)});renderValidation81()}}

// 4) Safer Excel import: explicit New / Update / Error / Duplicate classification and batch audit.
analyzeImport73=function(out){const rows=[],seenC={},seenM={};let add=0,update=0,error=0,duplicate=0,warn=0;out.forEach(o=>{const c=String(o.cccd||'').replace(/\D/g,''),m=String(o.mnv||'').trim(),match=(c&&W.find(w=>String(w.cccd||'').replace(/\D/g,'')===c))||(m&&W.find(w=>String(w.mnv||'').trim()===m)),v=validateWorkerData(o,match);let inDup=false;if(c){if(seenC[c]){v.errors.push('CCCD trùng ngay trong file.');inDup=true}else seenC[c]=1}if(m){if(seenM[m]){v.warnings.push('Mã NV trùng ngay trong file.');inDup=true}else seenM[m]=1}v.errors=[...new Set(v.errors)];v.warnings=[...new Set(v.warnings)];let status=v.errors.length?'error':inDup?'duplicate':match?'update':'new';if(status==='error')error++;else if(status==='duplicate')duplicate++;else if(status==='update')update++;else add++;if(v.warnings.length)warn++;rows.push({o,v,match,status})});return {rows,add,update,error,duplicate,warn,valid:add+update+duplicate,bad:error,dup:update+duplicate}}
showImportPreview73=function(f,out){
  const a=analyzeImport73(out);
  const mode=$('imode').value;
  IMP_PENDING={file:f,out,analysis:a,mode};
  const number=n=>Number(n||0).toLocaleString('vi-VN');
  const replace=mode==='replace';
  const sub=$('impPrevSub');
  sub.textContent=f.name;
  sub.title=f.name;
  const modeLabel=replace?'Thay thế toàn bộ':'Cập nhật & Thêm mới';
  // Đếm hồ sơ thiếu trường từ TOÀN BỘ Excel, không chỉ 5 dòng xem trước.
  // Chỉ coi rỗng / ký hiệu chỗ trống là thiếu; giữ nguyên giá trị nguồn.
  const missing=v=>{const s=String(v??'').trim();return !s||['—','–','-','n/a','null','undefined'].includes(s.toLowerCase());};
  const missDob=out.reduce((n,o)=>n+(missing(o.dob)?1:0),0);
  const missPhone=out.reduce((n,o)=>n+(missing(o.sdt)?1:0),0);
  const missCCCD=out.reduce((n,o)=>n+(missing(o.cccd)?1:0),0);
  // Chế độ Cập nhật & Thêm mới hiện dùng RPC chỉ INSERT, không cập nhật hồ sơ cũ.
  // Không được gán nhầm các hồ sơ có định danh trùng thành "đã cập nhật".
  const labels=replace
    ? [['Tổng dòng',out.length,'total'],['Hiện có',W.length,'update'],['Nhập thay thế',out.length,'new'],['Thiếu ngày sinh',missDob,'dob'],['Thiếu SĐT',missPhone,'phone'],['Thiếu CCCD',missCCCD,'cccd']]
    : [['Tổng dòng',out.length,'total'],['Cập nhật',a.update,'update'],['Thêm mới',a.add,'new'],['Thiếu ngày sinh',missDob,'dob'],['Thiếu SĐT',missPhone,'phone'],['Thiếu CCCD',missCCCD,'cccd']];
  $('impPrevBody').innerHTML=`<div class="imp-preview-mode" aria-label="Chế độ import">${replace?'↻':'⟳'} ${modeLabel}</div>
  <div class="imp-preview-grid">${labels.map(([label,value,tone])=>`<div class="imp-kpi imp-kpi-${tone}"><span>${label}</span><b>${number(value)}</b></div>`).join('')}</div>
  <div class="imp-errors"><table><thead><tr><th>Dòng</th><th>Họ tên</th><th>CCCD</th><th>Mã NV</th><th>Phân loại</th></tr></thead><tbody>
  ${a.rows.slice(0,5).map(x=>`<tr title="${esc([...x.v.errors,...x.v.warnings].join('; '))}"><td>${x.o._srcRow||''}</td><td class="wr">${esc(x.o.name)}</td><td>${esc(x.o.cccd||'—')}</td><td>${esc(x.o.mnv||'—')}</td><td><span class="imp-status ${x.status==='new'?'new':x.status==='update'?'update':x.status==='error'?'error':'dup'}">${x.status==='new'?'Thêm mới':x.status==='update'?'Cập nhật':x.status==='error'?'Cần kiểm tra':'Bỏ qua trùng'}</span></td></tr>`).join('')}</tbody></table></div>
  <div class="imp-preview-note">Hiển thị ${number(Math.min(a.rows.length,5))} / ${number(a.rows.length)} dòng · ${replace?'Thay thế toàn bộ':`Bỏ qua trùng: ${number(a.skip||0)} · Cần kiểm tra: ${number(a.conflict||0)}`}.</div>`;
  $('impPreviewDlg').showModal();
};
$('impPrevGo').onclick=async()=>{const p=IMP_PENDING;if(!p)return;const rows=p.analysis.rows;if(!rows.length)return alert('Không có dữ liệu để import.');if(p.mode==='replace'&&W.length&&!await ask(`Chế độ THAY THẾ sẽ thay toàn bộ ${W.length.toLocaleString('vi-VN')} công nhân hiện có bằng ${rows.length.toLocaleString('vi-VN')} dòng trong file. Tiếp tục?`,{title:'Xác nhận thay thế toàn bộ',ok:'Thay thế'}))return;if(p.analysis.error&&!await ask(`File có ${p.analysis.error} dòng đang được báo lỗi/cảnh báo. Hệ thống vẫn sẽ import toàn bộ ${rows.length} dòng theo yêu cầu. Bạn muốn tiếp tục?`,{title:'Import có cảnh báo',ok:'Vẫn import'}))return;/* STEP217: không dùng localStorage chứa toàn bộ dữ liệu công nhân: có thể vượt hạn mức và dừng import.
   Điểm khôi phục trước import do safetySnapshot (IndexedDB) ở wrapper STEP104 đảm trách. */
try { sessionStorage.setItem('ktx_import_undo_meta', JSON.stringify({at:Date.now(),file:p.file.name,workers:W.length,storage:'indexeddb-safety'})); } catch(_quota) {}
let nNew=0,nUp=0;if(!W.length||p.mode==='replace'){const oldCount=W.length;W=rows.map(x=>{const o=x.o;delete o._nd;delete o._srcRow;addHistory(o,'IMPORT','Thêm từ Import Excel');nNew++;return o});audit81('IMPORT_REPLACE',`Import thay thế danh sách: ${oldCount} → ${W.length} công nhân · file ${p.file.name}`,{persist:false})}else{const ix={c:{},m:{}};W.forEach(w=>{const c=String(w.cccd||'').replace(/\D/g,''),m=String(w.mnv||'').trim();if(c)ix.c[c]=w;if(m)ix.m[m]=w});rows.forEach(x=>{const o=x.o,c=String(o.cccd||'').replace(/\D/g,''),m=String(o.mnv||'').trim(),w=(c&&ix.c[c])||(m&&ix.m[m]);if(w){const before=workerSnapshot(w);Object.keys(o).forEach(k=>{if(['id','tt','tv','_nd','_srcRow'].includes(k)||(k==='day'&&o._nd))return;if(o[k]!==''&&o[k]!==undefined)w[k]=o[k]});const after=workerSnapshot(w),ch=diff81(before,after);if(ch.length){addHistory(w,'IMPORT',`Cập nhật ${ch.length} trường từ Import Excel`);audit81('IMPORT_UPDATE',`Import cập nhật: ${w.name}`,{workerId:w.id,workerName:w.name,changes:ch,persist:false});nUp++}}else{delete o._nd;delete o._srcRow;addHistory(o,'IMPORT','Thêm mới từ Import Excel');W.push(o);audit81('IMPORT_CREATE',`Import thêm công nhân: ${o.name}`,{workerId:o.id,workerName:o.name,before:null,after:workerSnapshot(o),persist:false});nNew++}})}audit81('IMPORT_BATCH',`Import ${p.file.name}: ${nUp} cập nhật · ${nNew} thêm mới · ${p.analysis.error} dòng có cảnh báo nhưng vẫn nhập`,{persist:false});sel.clear();sv();$('impPreviewDlg').close();IMP_PENDING=null;all();updateAlertBadges();alert(`Import hoàn tất: ${nNew} thêm mới, ${nUp} cập nhật${p.analysis.error?`, ${p.analysis.error} dòng có cảnh báo đã được nhập`:''}.`)};

// 5) Residence timeline — clearer event labels and more complete display.
const HISTORY_LABEL81={CHECKIN:'Vào KTX',MOVE:'Chuyển phòng',UPDATE:'Cập nhật hồ sơ',IMPORT:'Import dữ liệu',RESIDENCE:'Khai báo tạm trú',RESIDENCE_CLEAR:'Bỏ khai báo tạm trú',RESIDENCE_IMPORT:'Cập nhật tạm trú',AWAY:'Bắt đầu tạm vắng',AWAY_IMPORT:'Cập nhật tạm vắng',RETURN:'Quay lại KTX',CHECKOUT:'Ra khỏi KTX',RESTORE:'Khôi phục hồ sơ'};
timelineItems=function(w){const h=Array.isArray(w.history)?w.history.slice():[];if(!h.some(x=>x.type==='CHECKIN')&&w.date)h.push({day:w.date,type:'CHECKIN',detail:`Vào ${K(w)} · ${D(w)} · P.${R(w)||'—'}`,actor:''});return h.sort((a,b)=>(b.at||new Date(b.day||0))-(a.at||new Date(a.day||0)))};
if(typeof view==='function'&&!window.__step81ViewWrapped){
  window.__step81ViewWrapped=true;
  const oldView81=view;
  view=function(w){
    oldView81(w);
    const cards=$('vb')&&$('vb').querySelectorAll('.vcd');
    if(!cards)return;
    const last=[...cards].find(c=>c.querySelector('.vs')&&c.querySelector('.vs').textContent.includes('Lịch sử cư trú'));
    if(last){
      const h=timelineItems(w),tl=last.querySelector('.timeline');
      if(tl){
        tl.innerHTML=h.length
          ? h.slice(0,40).map(x=>`<div class="tl-item"><b><span class="history-type">${esc(HISTORY_LABEL81[x.type]||x.type||'Sự kiện')}</span>${esc(x.detail||'')}</b><span>${esc(x.day?vn(x.day):new Date(x.at||Date.now()).toLocaleString('vi-VN'))}${x.actor?' · '+esc(x.actor):''}</span></div>`).join('')
          : '<div class="mut">Chưa có lịch sử.</div>';
      }
    }
  };
}

// Upgraded system log UI with before → after field changes.
logp=function(){const actors=[...new Set(LOG.map(ktxAuditActorDisplay).filter(Boolean))].sort(),acts=[...new Set(LOG.map(l=>l.a).filter(Boolean))].sort();$('log').innerHTML=`<div class="card"><div class="log-toolbar"><input id="lgq" placeholder="Tìm hành động, công nhân, chi tiết..." style="flex:1;min-width:220px"><select id="lga"><option value="">Tất cả hành động</option>${acts.map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="lgu"><option value="">Tất cả người dùng</option>${actors.map(x=>`<option>${esc(x)}</option>`).join('')}</select><input id="lgd" type="date"></div><div id="lgbody"></div></div>`;const render=()=>{const q=sa($('lgq').value),a=$('lga').value,u=$('lgu').value,d=$('lgd').value;const L=LOG.filter(l=>(!a||l.a===a)&&(!u||ktxAuditActorDisplay(l)===u)&&(!d||String(l.day||'')===d)&&(!q||sa([l.a,l.d,ktxAuditActorDisplay(l),l.workerName,JSON.stringify(l.changes||l.fields||[])].join(' ')).includes(q))).slice(0,800);$('lgbody').innerHTML=`<div class="mut" style="margin-bottom:8px">${L.length} bản ghi hiển thị / ${LOG.length} tổng bản ghi</div><div class="wrap"><table><tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Đối tượng & thay đổi</th></tr>${L.map((l,i)=>{const ch=l.changes||[];return `<tr><td>${esc(l.t||'')}</td><td class="log-actor">${esc(ktxAuditActorDisplay(l))}<div class="mut" style="font-size:9px">${esc(l.role||'')}</div></td><td><span class="tag">${esc(l.a||'')}</span></td><td><div class="log-detail">${esc(l.d||'')}</div>${l.workerName?`<div class="log-subject">${esc(l.workerName)}</div>`:''}${ch.length?`<button class="log-detail-toggle" data-log-toggle="${i}">Xem ${ch.length} thay đổi trước → sau</button><div class="log-changes-wrap" data-log-changes="${i}">${ch.map(c=>`<div class="log-change"><b>${esc(c.label||FIELD_LABEL81[c.field]||c.field)}</b><span><span class="from">${esc(fmt81(c.from))}</span> → <span class="to">${esc(fmt81(c.to))}</span></span></div>`).join('')}</div>`:l.fields&&l.fields.length?`<span class="diff-pill">${l.fields.length} trường thay đổi</span>`:''}</td></tr>`}).join('')}</table></div>`;$('lgbody').querySelectorAll('[data-log-toggle]').forEach(b=>b.onclick=()=>{const x=$('lgbody').querySelector(`[data-log-changes="${b.dataset.logToggle}"]`);if(x){x.classList.toggle('open');b.textContent=x.classList.contains('open')?'Ẩn thay đổi':b.textContent}})};['lgq','lga','lgu','lgd'].forEach(id=>$(id).oninput=render);render()};

setTimeout(()=>{updateAlertBadges();if(page==='alerts')alertCenterPage();if(page==='log')logp()},100);

;
/* >>> Original: assets/js/modules/admin/ios-auth-storage-v2046.js >>> */
/* V2.0.46 — Safari-safe Supabase Auth storage.
 * Do not delete, rewrite, or migrate operational worker/cache data.
 * Prefer IndexedDB for auth token; sessionStorage/memory are scoped fallbacks.
 */
(function(){
 'use strict';
 if(window.KTX_AUTH_STORAGE)return;
 const DB='ktx_auth_v2046', STORE='sessions';
 const known=new Map(), absent=new Set();
 let openPromise=null, mode='indexeddb';
 const quota=e=>/quota|exceeded|storage|security|invalidstate/i.test(String(e&&e.message||e||''));
 function setMode(v){
   const rank={indexeddb:0,local:1,session:2,memory:3};
   if(rank[v]>rank[mode])mode=v;
   window.KTX_AUTH_STORAGE_MODE=mode;
 }
 function dbOpen(){
   if(!('indexedDB' in window))return Promise.reject(Error('IndexedDB unavailable'));
   if(openPromise)return openPromise;
   openPromise=new Promise((resolve,reject)=>{
     let request,settled=false;
     try{request=indexedDB.open(DB,1)}catch(e){reject(e);return}
     const guard=setTimeout(()=>{if(!settled){settled=true;reject(Error('IndexedDB timed out'))}},2500);
     function done(err,db){if(settled){if(db)try{db.close()}catch(_){}return}settled=true;clearTimeout(guard);err?reject(err):resolve(db)}
     request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};
     request.onsuccess=()=>done(null,request.result);
     request.onerror=()=>done(request.error||Error('IndexedDB blocked'));
     request.onblocked=()=>done(Error('IndexedDB blocked'));
   }).catch(e=>{openPromise=null;throw e});
   return openPromise;
 }
 async function transaction(method,key,value){
   const db=await dbOpen();
   return new Promise((resolve,reject)=>{
     try{
       const tx=db.transaction(STORE,method==='get'?'readonly':'readwrite'),store=tx.objectStore(STORE);
       const request=method==='get'?store.get(key):method==='set'?store.put(value,key):store.delete(key);
       request.onsuccess=()=>{if(method==='get')resolve(request.result??null)};
       request.onerror=()=>reject(request.error||Error('IndexedDB request failed'));
       tx.oncomplete=()=>{if(method!=='get')resolve(null)};
       tx.onerror=()=>reject(tx.error||Error('IndexedDB transaction failed'));
       tx.onabort=()=>reject(tx.error||Error('IndexedDB transaction aborted'));
     }catch(e){reject(e)}
   });
 }
 function localRead(key){try{return localStorage.getItem(key)}catch(_){return null}}
 function localRemove(key){try{localStorage.removeItem(key)}catch(_){}}
 function sessionRead(key){try{return sessionStorage.getItem(key)}catch(_){return null}}
 function sessionWrite(key,value){try{sessionStorage.setItem(key,value);return true}catch(_){return false}}
 function sessionRemove(key){try{sessionStorage.removeItem(key)}catch(_){}}
 const adapter={
   async getItem(key){
     key=String(key);
     if(absent.has(key))return null;
     if(known.has(key))return known.get(key);
     let v=localRead(key);
     // localStorage mirrors the latest token and wins over a possibly stale IndexedDB copy.
     // IndexedDB remains the durable fallback if localStorage is unavailable or empty.
     if(v===null){try{v=await transaction('get',key)}catch(_){setMode('local')}}
     if(v===null)v=sessionRead(key);
     if(v!==null)known.set(key,v);
     return v;
   },
   async setItem(key,value){
     key=String(key);value=String(value);
     known.set(key,value);absent.delete(key);
     // Keep browser-persistent fallback synchronized even when IndexedDB succeeds.
     // The value is the Supabase SDK session (refresh/access tokens), never a password.
     let localSaved=false, idbSaved=false;
     try{localStorage.setItem(key,value);localSaved=true}catch(_){setMode('session')}
     try{await transaction('set',key,value);idbSaved=true}catch(_){if(!localSaved)setMode('session');else setMode('local')}
     if(idbSaved||localSaved){sessionRemove(key);return}
     if(sessionWrite(key,value))return
     setMode('memory');
     // Do not throw: the current authenticated tab can still function.
     // Users are warned that memory-only sessions do not survive reload.
   },
   async removeItem(key){
     key=String(key);known.delete(key);absent.add(key);
     try{await transaction('remove',key)}catch(_){setMode('local')}
     sessionRemove(key);localRemove(key);
   }
 };
 window.KTX_AUTH_STORAGE=adapter;
 window.KTX_AUTH_STORAGE_MODE=mode;
 window.KTX_AUTH_STORAGE_STATUS=()=>({mode:window.KTX_AUTH_STORAGE_MODE,persistent:['indexeddb','local'].includes(window.KTX_AUTH_STORAGE_MODE)});
})();

;
/* >>> Original: assets/js/modules/admin/script-19.js >>> */

/* STEP86 — BƯỚC 2: đồng bộ dữ liệu thật lên Supabase */
const SUPA_SYNC={client:null,session:null,account:null,ready:false,enabled:false,applying:false,pushing:false,pulling:false,pushTimer:0,reloadTimer:0,channel:null,lastError:'',lastSync:0,remoteIds:{},hashes:{},counts:{},pending:false};
const SYNC_TABLES={workers:'ktx_workers',archive:'ktx_archived_workers',logs:'ktx_audit_logs',attendance:'ktx_attendance',registrations:'ktx_registrations',rooms:'ktx_room_meta',resStatus:'ktx_residence_status',resHistory:'ktx_residence_history'};
const syncLs=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const syncCfg=()=>{const q=window.KTX_QR_CONFIG||window.__KTX_PUBLIC_CONFIG||{};return{url:q.url||syncLs('ktx_sb_sync_url',''),key:q.key||syncLs('ktx_sb_sync_key',''),email:syncLs('ktx_sb_sync_email','')}};
function syncSaveCfg(){const g=i=>($(i)&&$(i).value||'').trim();for(const [key,value] of [['ktx_sb_sync_url',g('sy_url')],['ktx_sb_sync_key',g('sy_key')],['ktx_sb_sync_email',g('sy_email')]]){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){console.warn('[KTX] Không lưu được cấu hình tùy chọn trên thiết bị',e)}}}
function syncValidCfg(c=syncCfg()){return /^https:\/\//.test(c.url||'')&&!!c.key&&!/PASTE_|YOUR_/i.test(c.key)}
function syncClient(){const c=syncCfg();if(!syncValidCfg(c)||!window.supabase)return null;if(SUPA_SYNC.client&&SUPA_SYNC._url===c.url&&SUPA_SYNC._key===c.key)return SUPA_SYNC.client;SUPA_SYNC.client=window.supabase.createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.KTX_AUTH_STORAGE||undefined}});SUPA_SYNC._url=c.url;SUPA_SYNC._key=c.key;return SUPA_SYNC.client}
// v1.0.127 — Rehydrate Supabase Auth from the authoritative SDK session.
// The page can render Cloud records while ready=false after auth/bootstrap races.
let ktxCloudRecovery=null;
async function ktxEnsureCloudWriteReady(){
 if(ktxCloudRecovery)return ktxCloudRecovery;
 ktxCloudRecovery=(async()=>{
  if(typeof window.ktxLoadPublicConfig==='function')await window.ktxLoadPublicConfig();
  const sb=syncClient();
  if(!sb)throw new Error('Không khởi tạo được Supabase: kiểm tra cấu hình hoặc thư viện kết nối.');
  const {data,error}=await sb.auth.getSession();
  if(error)throw new Error('Không đọc được phiên Supabase: '+error.message);
  if(!data?.session?.user)throw new Error('Phiên đăng nhập Supabase đã hết hạn; vui lòng đăng nhập lại.');
  SUPA_SYNC.session=data.session;
  if(!SUPA_SYNC.account||String(SUPA_SYNC.account.user_id)!==String(data.session.user.id)||!SUPA_SYNC.ready){
   await syncLoadAccount();
  }
  if(!SUPA_SYNC.account||!SUPA_SYNC.account.enabled)throw new Error('Tài khoản Supabase chưa được cấp quyền.');
  SUPA_SYNC.ready=true;
  SUPA_SYNC.enabled=true;
  syncSetStatus('Đã xác minh phiên Supabase để lưu dữ liệu','ok');
  syncFooter();
  return sb;
 })().finally(()=>{ktxCloudRecovery=null});
 return ktxCloudRecovery;
}
window.ktxEnsureCloudWriteReady=ktxEnsureCloudWriteReady;
function syncActor(){return SUPA_SYNC.session&&SUPA_SYNC.session.user&&SUPA_SYNC.session.user.id||null}
function syncStamp(){return new Date().toISOString()}
function syncSafeISO(v,fallback){
 const d=v instanceof Date?v:new Date(v==null||v===''?(fallback==null?Date.now():fallback):v);
 return Number.isFinite(d.getTime())?d.toISOString():new Date(fallback==null?Date.now():fallback).toISOString();
}
function syncHash(v){const s=JSON.stringify(v==null?null:v);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function syncRecordId(prefix,o,i=0){if(o&&o.id)return String(o.id);if(o&&o._sid)return String(o._sid);/* Legacy logs lack IDs: never use array position (moves after LOG.unshift). */if(prefix==='l')return 'l_'+syncHash(o);const base=[prefix,o&&o.at,o&&o.day,o&&o.a,o&&o.d,o&&o.name,o&&o.mnv,i].join('|');return prefix+'_'+syncHash(base)}
function syncClone(o){return o==null?o:JSON.parse(JSON.stringify(o))}
/* V37: bounded parallel pagination, Cloud remains authoritative.
   Stable ordering avoids overlap between concurrent page requests.
   All records are collected before this function returns; no cached/local substitutes. */
async function syncFetchAll(table,cols='record_id,payload'){
 const sb=syncClient();if(!sb)throw new Error('Chưa cấu hình Supabase.');
 const pageSize=1000, batchSize=3, maxFrom=1000000;
 const key=table===SYNC_TABLES.rooms?'room_key':table===SYNC_TABLES.resStatus?'worker_id':'record_id';
 async function readPage(n){
   const from=n*pageSize;
   if(from>maxFrom)throw new Error('Số trang quá lớn, đã dừng an toàn thay vì trả về dữ liệu thiếu');
   let request=sb.from(table).select(cols);
   // V170: subaccounts download ONLY their own audit rows. The database must
   // also enforce the same restriction with RLS; this client filter is defense in depth.
   if(table===SYNC_TABLES.logs && String(SUPA_SYNC.account?.role||ME.role||'')!=='admin'){
     const currentUid=String(SUPA_SYNC.session?.user?.id||'');
     if(!currentUid)throw new Error('Không thể xác minh tài khoản khi đọc nhật ký.');
     request=request.eq('created_by',currentUid);
   }
   const {data,error}=await request.order(key,{ascending:true}).range(from,from+pageSize-1);
   if(error)throw new Error('Không đọc được '+table+' (trang '+(n+1)+'): '+(error.message||error));
   return data||[];
 }
 const first=await readPage(0), out=first.slice();
 if(first.length<pageSize)return out;
 let page=1;
 while(page*pageSize<=maxFrom){
   const ids=Array.from({length:batchSize},(_,i)=>page+i);
   const groups=await Promise.all(ids.map(readPage));
   let done=false;
   for(const group of groups){
     if(done)break;
     out.push(...group);
     if(group.length<pageSize)done=true;
   }
   if(done)return out;
   page+=batchSize;
 }
 throw new Error('Đã đạt giới hạn đọc Cloud, không trả về dữ liệu thiếu');
}
async function syncCount(table){const sb=syncClient();const {count,error}=await sb.from(table).select('*',{count:'exact',head:true});if(error)throw error;return count||0}
async function syncLoadAccount(){const sb=syncClient();if(!sb||!SUPA_SYNC.session?.user?.id)return null;const u=SUPA_SYNC.session.user;const {data,error}=await sb.from('app_accounts').select('user_id,email,display_name,role,ktx,days,enabled').eq('user_id',u.id).maybeSingle();if(error)throw error;if(!data||!data.enabled)throw new Error('Tài khoản Supabase chưa được cấp quyền sử dụng ứng dụng.');SUPA_SYNC.account=data;ME.id=data.user_id;ME.name=data.display_name||u.email||ME.name;ME.role=ROLES[data.role]?data.role:'viewer';ME.acct={ktx:data.ktx||[],days:data.days||[]};applyPerms();try{if(typeof window.updateAuthUserbar==='function')window.updateAuthUserbar()}catch(_e){}return data}
function syncCanWrite(kind){const r=(SUPA_SYNC.account&&SUPA_SYNC.account.role)||ME.role||'viewer';if(kind==='workers'||kind==='logs'||kind==='resStatus'||kind==='resHistory')return ['admin','manager','staff'].includes(r)||kind==='logs';if(kind==='archive'||kind==='registrations'||kind==='rooms')return ['admin','manager'].includes(r);if(kind==='attendance')return ['admin','manager','guard'].includes(r);if(kind==='state')return r==='admin';return false}
function syncCanDelete(kind){const r=(SUPA_SYNC.account&&SUPA_SYNC.account.role)||ME.role||'viewer';if(kind==='workers'||kind==='archive'||kind==='registrations'||kind==='rooms')return ['admin','manager'].includes(r);if(kind==='attendance')return r==='admin';if(kind==='resStatus'||kind==='resHistory')return ['admin','manager'].includes(r);return false}
function ktxArchiveIsWithin60Days(a){
 const raw=String(a&&a.date||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return true;
 const day=new Date(raw+'T12:00:00Z');if(!Number.isFinite(day.getTime()))return true;
 const today=new Date(),utc=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
 return Math.floor((utc-Date.UTC(day.getUTCFullYear(),day.getUTCMonth(),day.getUTCDate()))/86400000)<=60;
}
function syncRows(kind){const now=syncStamp(),by=syncActor();if(kind==='workers')return W.map((o,i)=>({record_id:syncRecordId('w',o,i),payload:syncClone(o),updated_at:now,updated_by:by}));if(kind==='archive')return ARC.filter(ktxArchiveIsWithin60Days).map((o,i)=>({record_id:syncRecordId('a',o,i),payload:syncClone(o),updated_at:now,updated_by:by}));if(kind==='logs'){const remoteByHash=SUPA_SYNC.logRemoteByHash||{};const used=new Set();return LOG.slice(0,5000).map((o,i)=>{const h=syncHash(o);const known=remoteByHash[h];let id=(known&&known.find(x=>!used.has(x)))||syncRecordId('l',o,i);used.add(id);return {record_id:id,payload:syncClone(o),event_at:syncSafeISO(o.at,Date.now()),created_by:by}})};if(kind==='attendance')return ATT.slice(0,5000).map((o,i)=>({record_id:syncRecordId('t',o,i),payload:syncClone(o),updated_at:now,updated_by:by}));if(kind==='registrations')return REG.map((o,i)=>({record_id:syncRecordId('r',o,i),payload:syncClone(o),updated_at:now,updated_by:by}));if(kind==='rooms')return Object.entries(ROOMMETA||{}).map(([k,v])=>({room_key:k,payload:syncClone(v),updated_at:now,updated_by:by}));if(kind==='resStatus')return W.map(w=>({worker_id:String(w.id),payload:{tt:w.tt||'',tv:syncClone(w.tv||null),ktx:K(w),day:D(w),room:R(w)||''},updated_at:now,updated_by:by}));if(kind==='resHistory'){const z=[];W.forEach(w=>(Array.isArray(w.history)?w.history:[]).forEach((h,i)=>z.push({record_id:`${w.id}_${h.at||h.day||i}_${syncHash(h)}`,worker_id:String(w.id),payload:syncClone(h),event_at:syncSafeISO(h.at||((h.day||ldy())+'T00:00:00+07:00'),Date.now()),updated_by:by})));return z}return[]}
async function syncUpsert(kind){if(!syncCanWrite(kind))return;const sb=syncClient(),table=SYNC_TABLES[kind],rows=syncRows(kind);if(!table)return;const idCol=kind==='rooms'?'room_key':kind==='resStatus'?'worker_id':'record_id';// V2.0.162: preflight before any Cloud writes (never check after upsert).
 const existing=SUPA_SYNC.remoteIds[kind]||new Set();
 if(kind==='workers'&&!rows.length&&existing.size)throw new Error('Bảo vệ dữ liệu: máy đang trống công nhân, Cloud từng có '+existing.size+' hồ sơ. Không gửi dữ liệu; kiểm tra đồng bộ.');
 if(kind==='archive'&&!rows.length&&existing.size)throw new Error('Bảo vệ dữ liệu: máy đang trống hồ sơ lưu trữ, Cloud từng có '+existing.size+' hồ sơ. Không gửi dữ liệu; kiểm tra đồng bộ.');
 if(kind==='resStatus'){
  const invalid=rows.filter(r=>!r.worker_id||['undefined','null','NaN'].includes(r.worker_id));
  if(invalid.length)throw new Error('Bảo vệ dữ liệu: '+invalid.length+' hồ sơ công nhân chưa có ID hợp lệ, đã chặn gửi trạng thái cư trú.');
 }
 const prev=SUPA_SYNC.hashes[kind]||{};const next={};const changed=[];for(const r of rows){const id=String(r[idCol]),h=syncHash(r.payload);next[id]=h;if(prev[id]!==h)changed.push(r)}for(let i=0;i<changed.length;i+=400){const {error}=await sb.from(table).upsert(changed.slice(i,i+400),{onConflict:idCol});if(error){const denied=error.code==='42501'||/row.level.security|permission.denied|violates row.level/i.test(String(error.message||''));throw new Error((denied?'Supabase RLS từ chối ghi bảng ':'Không ghi được bảng ')+table+': '+(error.message||String(error))+(denied?' — Cần kiểm tra chính sách RLS và vai trò tài khoản; không tự động nới quyền.':''))}}const remote=SUPA_SYNC.remoteIds[kind]||new Set();if(kind!=='workers'&&kind!=='logs'&&syncCanDelete(kind)&&remote.size){const current=new Set(Object.keys(next)),gone=[...remote].filter(id=>!current.has(id));for(let i=0;i<gone.length;i+=200){const {error}=await sb.from(table).delete().in(idCol,gone.slice(i,i+200));if(error)throw error}}if(kind==='logs'){const lookup={};rows.forEach(r=>{const h=syncHash(r.payload);(lookup[h]=lookup[h]||[]).push(String(r.record_id))});SUPA_SYNC.logRemoteByHash=lookup}SUPA_SYNC.hashes[kind]=next;SUPA_SYNC.remoteIds[kind]=new Set(Object.keys(next))}
async function syncPushAlertReads(){if(!SUPA_SYNC.ready||!SUPA_SYNC.session?.user?.id)return;const sb=syncClient(),uid=SUPA_SYNC.session.user.id;let sigs=[];try{sigs=JSON.parse(localStorage.getItem(ALERT_READ_KEY)||'[]')}catch(e){}const rows=sigs.map(s=>({user_id:uid,alert_sig:String(s),read_at:syncStamp()}));if(rows.length){for(let i=0;i<rows.length;i+=300){const {error}=await sb.from('ktx_alert_reads').upsert(rows.slice(i,i+300),{onConflict:'user_id,alert_sig'});if(error)throw error}}}
async function syncPushState(){if(!syncCanWrite('state'))return;const sb=syncClient(),rows=[{state_key:'backup_config',payload:syncClone(bkCfg()),updated_at:syncStamp(),updated_by:syncActor()},{state_key:'browser_auto_backups',payload:syncClone(bkAutos()),updated_at:syncStamp(),updated_by:syncActor()},{state_key:'workspace_ready',payload:{ready:true,updatedAt:syncStamp()},updated_at:syncStamp(),updated_by:syncActor()}];const {error}=await sb.from('ktx_sync_state').upsert(rows,{onConflict:'state_key'});if(error)throw error}
async function syncPushAll(){
 if(SUPA_SYNC.cloudHydratedUser!==String(SUPA_SYNC.session?.user?.id||''))return {ok:false,skipped:true,message:'Chưa nạp Cloud; không gửi dữ liệu cũ.'};
 if(SUPA_SYNC.deletingWorkers)return {ok:false,skipped:true,message:'Đang xóa toàn bộ có kiểm soát.'};
 if(!SUPA_SYNC.ready||!SUPA_SYNC.enabled||!SUPA_SYNC.session?.user?.id)return {ok:false,skipped:true,message:'Phiên Supabase chưa hợp lệ hoặc đồng bộ chưa sẵn sàng.'};
 if(SUPA_SYNC.applying)return {ok:false,skipped:true,message:'Hệ thống đang tải dữ liệu từ Supabase. Vui lòng chờ.'};
 if(SUPA_SYNC.pushing)return {ok:false,skipped:true,message:'Đang có một phiên đồng bộ khác chạy.'};
 SUPA_SYNC.pushing=true;const revisionAtStart=SUPA_SYNC.changeRevision||0;SUPA_SYNC.lastError='';
 try{
  for(const k of ['workers','archive','logs','attendance','registrations','rooms','resStatus','resHistory'])await syncUpsert(k);
  await syncPushAlertReads();
  await syncPushState();
  SUPA_SYNC.lastSync=Date.now();
  SUPA_SYNC.pending=(SUPA_SYNC.changeRevision||0)!==revisionAtStart;
  /* V34: pending is session-only */
  syncSetStatus('Đã đồng bộ dữ liệu lên Supabase','ok');
  return {ok:true,at:SUPA_SYNC.lastSync};
 }catch(e){
  SUPA_SYNC.lastError=e.message||String(e);SUPA_SYNC.pending=true;
  /* V34: no local pending record */
  syncSetStatus('Lỗi đồng bộ: '+SUPA_SYNC.lastError,'bad');
  return {ok:false,error:SUPA_SYNC.lastError};
 }finally{SUPA_SYNC.pushing=false;if(SUPA_SYNC.pending&&SUPA_SYNC.ready&&SUPA_SYNC.enabled&&!SUPA_SYNC.lastError&&(SUPA_SYNC.changeRevision||0)!==revisionAtStart){clearTimeout(SUPA_SYNC.pushTimer);SUPA_SYNC.pushTimer=setTimeout(syncPushAll,2500)}if(page==='sync')syncPage();syncFooter()}
}
function syncSchedulePush(){if(!SUPA_SYNC.enabled||!SUPA_SYNC.ready||SUPA_SYNC.applying||SUPA_SYNC.cloudHydratedUser!==String(SUPA_SYNC.session?.user?.id||''))return;SUPA_SYNC.pending=true;SUPA_SYNC.changeRevision=(SUPA_SYNC.changeRevision||0)+1;/* V34: pending only in runtime */clearTimeout(SUPA_SYNC.pushTimer);SUPA_SYNC.pushTimer=setTimeout(syncPushAll,900)}
window.KTX_SUPA_SYNC={get ready(){return SUPA_SYNC.ready},get applying(){return SUPA_SYNC.applying},schedulePush:syncSchedulePush,push:syncPushAll};
/* V144: identity display is read-only. Missing actor in historical payload is NOT guessed. */
const KTX_AUDIT_ACCOUNT_NAMES=new Map();
function ktxAuditActorDisplay(log){
 const explicit=String(log&&log.actor||'').trim();
 if(explicit&&explicit!=='—')return explicit;
 const uid=String(log&&log._ktxAuditCreatedBy||'').trim();
 if(!uid)return 'Chưa ghi nhận';
 const name=KTX_AUDIT_ACCOUNT_NAMES.get(uid);
 return name||('Tài khoản '+uid.slice(0,8)+'…');
}
async function ktxAuditLoadAccountNames(){
 try{
  const sb=syncClient();if(!sb||!SUPA_SYNC.session?.user?.id)return;
  const {data,error}=await sb.from('app_accounts').select('user_id,display_name,email').limit(2000);
  if(error)return; // RLS may restrict the list; do not make normal Cloud loading fail.
  for(const a of data||[]){
   if(a&&a.user_id)KTX_AUDIT_ACCOUNT_NAMES.set(String(a.user_id),String(a.display_name||a.email||'').trim());
  }
 }catch(_e){} // Optional display-only lookup.
}
function syncApplyRows(kind,rows){const payloads=(rows||[]).map(r=>syncClone(r.payload));SUPA_SYNC.remoteIds[kind]=new Set((rows||[]).map(r=>String(r[kind==='rooms'?'room_key':kind==='resStatus'?'worker_id':'record_id'])));SUPA_SYNC.hashes[kind]=Object.fromEntries((rows||[]).map(r=>[String(r[kind==='rooms'?'room_key':kind==='resStatus'?'worker_id':'record_id']),syncHash(r.payload)]));if(kind==='workers')W=payloads;if(kind==='archive')ARC=payloads.filter(ktxArchiveIsWithin60Days);if(kind==='logs'){const lookup={};(rows||[]).forEach((r,i)=>{
  const h=syncHash(r.payload);(lookup[h]=lookup[h]||[]).push(String(r.record_id));
  // Only provenance from the actual Cloud row. Never credit the current user for old logs.
  if(payloads[i] && typeof payloads[i]==='object' && r.created_by){
    Object.defineProperty(payloads[i],'_ktxAuditCreatedBy',{value:String(r.created_by),enumerable:false,configurable:true});
  }
});SUPA_SYNC.logRemoteByHash=lookup;LOG=payloads.sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,5000)};if(kind==='attendance')ATT=payloads.sort((a,b)=>(b.at||0)-(a.at||0));if(kind==='registrations')REG=payloads;if(kind==='rooms')ROOMMETA=Object.fromEntries((rows||[]).map(r=>[r.room_key,syncClone(r.payload)]))}
async function syncPullAlertReads(){if(!SUPA_SYNC.session?.user?.id)return;const sb=syncClient(),uid=SUPA_SYNC.session.user.id,{data,error}=await sb.from('ktx_alert_reads').select('alert_sig').eq('user_id',uid).range(0,4999);if(error)throw error;const cloud=(data||[]).map(x=>x.alert_sig);let local=[];try{local=JSON.parse(localStorage.getItem(ALERT_READ_KEY)||'[]')}catch(e){}localStorage.setItem(ALERT_READ_KEY,JSON.stringify([...new Set([...local,...cloud])]))}
async function syncPullState(){const sb=syncClient(),{data,error}=await sb.from('ktx_sync_state').select('state_key,payload').in('state_key',['backup_config','browser_auto_backups']);if(error)throw error;if(!Array.isArray(data))return;data.forEach(r=>{if(r.state_key==='backup_config'&&r.payload)localStorage.setItem(BK_CFG_KEY,JSON.stringify(r.payload));if(r.state_key==='browser_auto_backups'&&Array.isArray(r.payload)&&!bkAutos().length)localStorage.setItem(BK_AUTO_KEY,JSON.stringify(r.payload))})}

function syncOpenSafetyDB(){return new Promise((resolve,reject)=>{try{const req=indexedDB.open('KTX_Local_Safety',1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Không mở được IndexedDB'))}catch(e){reject(e)}})}
async function syncHasSafetySnapshot(){try{const db=await syncOpenSafetyDB();return await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly'),r=tx.objectStore('snapshots').getKey('before_supabase_sync');r.onsuccess=()=>resolve(r.result!==undefined);r.onerror=()=>reject(r.error)})}catch(e){return false}}
async function syncSaveSafetySnapshot(){return false} // v1.0.107: never persist Cloud business data in IndexedDB
async function syncReadSafetySnapshot(){try{const db=await syncOpenSafetyDB();return await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly'),r=tx.objectStore('snapshots').get('before_supabase_sync');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}catch(e){return null}}

/* V2.0.221: IndexedDB read-only warm display, scoped to verified Cloud account.
   The cached rows are NEVER authoritative and never enable writes until Cloud succeeds. */
const KTX221_CACHE_DB='QLKTX_PC_ReadOnly_Display_v1';
const KTX221_CACHE_SECTIONS=['workers','archive','logs','attendance','registrations','rooms'];
let ktx221CacheVisible=false;
function ktx221Scope(){
 const a=SUPA_SYNC.account||{};
 const uid=String(SUPA_SYNC.session?.user?.id||'');
 if(!uid||!SUPA_SYNC.ready||!a.enabled||String(a.user_id)!==uid)return '';
 const sorted=x=>(Array.isArray(x)?x:(x==null||x===''?[]:[x])).map(v=>String(v)).sort();
 return JSON.stringify([uid,String(a.role||''),sorted(a.ktx),sorted(a.days)]);
}
function ktx221OpenDB(){return new Promise((resolve,reject)=>{
 if(!window.indexedDB||!window.crypto?.subtle){reject(new Error('Thiết bị không hỗ trợ bộ nhớ đệm mã hóa'));return}
 const r=indexedDB.open(KTX221_CACHE_DB,1);
 r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots');if(!db.objectStoreNames.contains('keys'))db.createObjectStore('keys')};
 r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB không mở được'));
})}
function ktx221Read(db,store,key){return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Không đọc được bộ nhớ đệm'))})}
function ktx221Write(db,store,key,val){return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(val,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Không ghi được bộ nhớ đệm'));tx.onabort=()=>reject(tx.error||new Error('Bộ nhớ đệm bị hủy giao dịch'))})}
async function ktx221Key(db){
 let key=await ktx221Read(db,'keys','device');
 if(key)return key;
 key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 await ktx221Write(db,'keys','device',key);return key;
}
async function ktx221Decrypt(db,rec){
 const key=await ktx221Key(db),bin=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(rec.iv)},key,rec.data);
 return JSON.parse(new TextDecoder().decode(bin));
}
async function ktx221Encrypt(db,obj){
 const key=await ktx221Key(db),iv=crypto.getRandomValues(new Uint8Array(12));
 const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(obj)));
 return {iv:Array.from(iv),data};
}
function ktx221Banner(state,at){
 // The snapshot remains visible as read-only data; omit the persistent yellow toast.
 // Keep the internal flag for offline/cloud-retry safeguards.
 document.getElementById('ktx221CacheBanner')?.remove();
 ktx221CacheVisible=!!state;
}
async function ktx221ClearCurrentScope(){
 const scope=ktx221Scope();if(!scope)return;
 let db;
 try{db=await ktx221OpenDB();await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').delete(scope);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
 catch(e){console.warn('[QLKTX] Không xóa được cache khi đăng xuất:',e)}finally{db?.close()}
}
async function ktx221LoadPreview(){
 const scope=ktx221Scope();if(!scope)return false;
 let db;
 try{
  db=await ktx221OpenDB();const rec=await ktx221Read(db,'snapshots',scope);
  if(!rec?.data)return false;
  const parsed=await ktx221Decrypt(db,rec);
  if(!parsed||parsed.v!==1||parsed.scope!==scope||!parsed.staged?.workers?.length)return false;
  if(ktx221Scope()!==scope||SUPA_SYNC.cloudHydratedUser===String(SUPA_SYNC.session?.user?.id||''))return false;
  // Render only verified previous Cloud results: DO NOT mark as current Cloud hydration.
  // Keep cloudHydratedUser blank so syncPushAll/syncSchedulePush strictly reject writes.
  for(const kind of KTX221_CACHE_SECTIONS){
   if(!Array.isArray(parsed.staged[kind]))return false;
  }
  SUPA_SYNC.applying=true;
  try{
   for(const kind of KTX221_CACHE_SECTIONS)syncApplyRows(kind,parsed.staged[kind]);
   window.__ktx65DataRevision=(window.__ktx65DataRevision||0)+1;
   window.__ktx221CacheSavedAt=parsed.at;
   all();ktx221Banner('loading',parsed.at);
  }finally{SUPA_SYNC.applying=false}
  return true;
 }catch(e){console.warn('[QLKTX] Không thể hiển thị bản sao thiết bị:',e);return false}
 finally{db?.close()}
}
async function ktx221SaveVerified(staged,uid){
 const scope=ktx221Scope();if(!scope||String(SUPA_SYNC.session?.user?.id||'')!==uid||SUPA_SYNC.cloudHydratedUser!==uid)return;
 let db;
 try{
  db=await ktx221OpenDB();
  const safe={v:1,scope,at:Date.now(),staged:Object.fromEntries(KTX221_CACHE_SECTIONS.map(k=>[k,staged[k]]))};
  const enc=await ktx221Encrypt(db,safe);
  if(ktx221Scope()!==scope||SUPA_SYNC.cloudHydratedUser!==uid)return;
  await ktx221Write(db,'snapshots',scope,enc);
 }catch(e){console.warn('[QLKTX] Không lưu được bản sao hiển thị:',e)}finally{db?.close()}
}
/* STEP20: A zero-row worker read may be a truly empty scope OR RLS filtering.
   Never interpret it as permission to erase cached workers or push local state. */
function ktx222EmptyWorkersNotice(show){
 let node=document.getElementById('ktx222EmptyWorkersNotice');
 if(!show){if(node)node.remove();return;}
 if(!node){
  node=document.createElement('div');node.id='ktx222EmptyWorkersNotice';node.setAttribute('role','status');
  node.style.cssText='position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:10035;max-width:min(680px,calc(100vw - 30px));padding:10px 14px;border:1px solid #e5bb65;border-radius:10px;background:#fff9e9;color:#704b11;font-size:12px;font-weight:650;line-height:1.45;text-align:center;box-shadow:0 4px 15px #22304726;pointer-events:none';
  document.body.appendChild(node);
 }
 node.textContent='Cloud trả về 0 công nhân trong phạm vi tài khoản. Chưa thể xác định do dữ liệu trống hay quyền RLS; chỉ xem, không ghi đè Cloud. Hãy kiểm tra tại Đồng bộ Supabase.';
}
async function syncPullAll(render=true){
 if(SUPA_SYNC.deletingWorkers||!SUPA_SYNC.ready)return {ok:false,reason:'Phiên Cloud chưa sẵn sàng'};
 if(SUPA_SYNC.pulling)return {ok:false,busy:true,reason:'Cloud đang được tải'};
 const uid=String(SUPA_SYNC.session?.user?.id||'');
 if(!uid)return {ok:false,reason:'Chưa có tài khoản được xác thực'};
 // Cloud is authoritative. Read-only fetching never compares or replaces remote data with old local state.
 SUPA_SYNC.pulling=true;SUPA_SYNC.applying=true;
 try{
  const kinds=['workers','archive','logs','attendance','registrations','rooms'];
  const staged={};
  await Promise.all(kinds.map(async k=>{
   const cols=k==='rooms'?'room_key,payload':k==='logs'?'record_id,payload,created_by':'record_id,payload';
   staged[k]=await syncFetchAll(SYNC_TABLES[k],cols);
  }));
  if(String(SUPA_SYNC.session?.user?.id||'')!==uid)throw new Error('Phiên đăng nhập đã đổi; bỏ kết quả tải cũ.');
  if(!staged.workers.length){
   // A 0-row RLS result is indistinguishable from an empty table in the browser.
   // This is an inconclusive, READ-ONLY result, NOT a hydrated Cloud snapshot.
   // In particular, do not call syncApplyRows('workers', []), do not overwrite
   // previous IndexedDB snapshots, and do not set cloudHydratedUser.
   SUPA_SYNC.cloudHydratedUser='';
   SUPA_SYNC.lastError='';
   SUPA_SYNC.lastSync=Date.now();
   syncSetStatus('Cloud trả 0 công nhân: chưa rõ bảng trống hay quyền RLS. Giữ dữ liệu cache (nếu có), chặn ghi lên Cloud.','warn');
   ktx222EmptyWorkersNotice(true);
   if(ktx221CacheVisible)ktx221Banner('offline',window.__ktx221CacheSavedAt||undefined);
   if(render&&!ktx221CacheVisible&&typeof all==='function')all();
   syncFooter();
   return {ok:true,empty:true,readOnly:true,count:0};
  }
  ktx222EmptyWorkersNotice(false);
  const initial=SUPA_SYNC.cloudHydratedUser!==uid;
  const changed=initial||kinds.some(kind=>{
    const idCol=kind==='rooms'?'room_key':'record_id';
    const known=SUPA_SYNC.hashes[kind]||{};
    const rows=staged[kind]||[];
    if(Object.keys(known).length!==rows.length)return true;
    return rows.some(r=>String(known[String(r[idCol])]||'')!==syncHash(r.payload));
  });
  if(changed){
    for(const kind of kinds)syncApplyRows(kind,staged[kind]);
    window.__ktx65DataRevision=(window.__ktx65DataRevision||0)+1;
  }
  if(changed){
    // Cache audit account names for the log page without changing any payload or audit history.
    void ktxAuditLoadAccountNames().then(()=>{
      try{if(page==='log'&&typeof logp==='function')logp()}catch(_e){}
    });
  }
  SUPA_SYNC.cloudHydratedUser=uid;
  ktx221Banner(null);
  // Run in background: a slow IndexedDB write must not delay the freshly loaded screen.
  void ktx221SaveVerified(staged,uid);
  SUPA_SYNC.pending=false;
  SUPA_SYNC.lastError='';
  SUPA_SYNC.lastSync=Date.now();
  syncSetStatus('Dữ liệu đang hiển thị trực tiếp từ Supabase','ok');
  if(render&&changed)all();
  // Supplemental metadata must not invalidate already verified operational records.
  await Promise.allSettled([syncPullAlertReads(),syncPullState()]);
  syncFooter();
  return {ok:true,count:staged.workers.length};
 }catch(e){
  SUPA_SYNC.lastError=e?.message||String(e);
  if(ktx221CacheVisible)ktx221Banner('offline',window.__ktx221CacheSavedAt||undefined);
  syncSetStatus('Không tải được Cloud: '+SUPA_SYNC.lastError,'bad');
  return {ok:false,reason:SUPA_SYNC.lastError};
 }finally{
  SUPA_SYNC.applying=false;SUPA_SYNC.pulling=false;
  if(page==='sync')syncPage();syncFooter();
 }
}
function syncSetStatus(msg,kind='warn'){SUPA_SYNC.statusMsg=msg;SUPA_SYNC.statusKind=kind}
function syncFooter(){const f=$('ft'),dot=$('syncNavDot');if(!f)return;if(SUPA_SYNC.ready&&SUPA_SYNC.enabled){f.textContent='Supabase · đồng bộ nhiều máy';if(dot)dot.style.display='inline-grid'}else{f.textContent='Dữ liệu lưu trên trình duyệt này';if(dot)dot.style.display='none'}}
function syncScheduleReload(){if(SUPA_SYNC.deletingWorkers||!SUPA_SYNC.enabled||SUPA_SYNC.pushing||SUPA_SYNC.pending)return;clearTimeout(SUPA_SYNC.reloadTimer);SUPA_SYNC.reloadTimer=setTimeout(()=>{if(SUPA_SYNC.applying||SUPA_SYNC.pulling){syncScheduleReload();return;}syncPullAll(true)},900)}
async function syncSubscribe(){const sb=syncClient();if(!sb||!SUPA_SYNC.session?.user?.id)return;if(SUPA_SYNC.channel){try{await sb.removeChannel(SUPA_SYNC.channel)}catch(e){}}SUPA_SYNC.channel=sb.channel('ktx-main-sync-v1');['ktx_workers','ktx_archived_workers','ktx_audit_logs','ktx_attendance','ktx_registrations','ktx_room_meta','ktx_residence_status','ktx_residence_history'].forEach(t=>SUPA_SYNC.channel.on('postgres_changes',{event:'*',schema:'public',table:t},syncScheduleReload));SUPA_SYNC.channel.on('postgres_changes',{event:'*',schema:'public',table:'ktx_alert_reads',filter:`user_id=eq.${SUPA_SYNC.session.user.id}`},syncScheduleReload).subscribe(status=>{SUPA_SYNC.realtimeConnected=(status==='SUBSCRIBED');SUPA_SYNC.realtimeStatus=status;})}
// V2.0.163: read-only Cloud/device reconciliation. No data payloads are exported or persisted.
const KTX163_AUDIT_KINDS=['workers','archive','logs','attendance','registrations','rooms'];
const KTX163_AUDIT_LABELS={workers:'Công nhân',archive:'Điều chuyển / nghỉ việc',logs:'Nhật ký',attendance:'Điểm danh',registrations:'Đăng ký',rooms:'Cấu hình phòng'};
function ktx163AuditMultiplicity(rows){const m=new Map();for(const r of rows){const h=syncHash(r.payload);m.set(h,(m.get(h)||0)+1)}return m}
async function ktx163AuditReadOnly(){
 if(!SUPA_SYNC.ready||!SUPA_SYNC.session?.user?.id){alert('Cần đăng nhập Supabase để đối chiếu dữ liệu.');return}
 if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying){alert('Đang có hoạt động đồng bộ. Hãy hoàn tất trước khi đối chiếu.');return}
 if(SUPA_SYNC.ktx163Auditing)return;
 SUPA_SYNC.ktx163Auditing=true;SUPA_SYNC.ktx163Audit=null;
 syncSetStatus('Đang đối chiếu dữ liệu chỉ đọc. Không gửi, tải đè hoặc xóa hồ sơ.','warn');syncPage();
 try{
  const result=[];
  for(const kind of KTX163_AUDIT_KINDS){
   const idCol=kind==='rooms'?'room_key':'record_id';
   const remote=await syncFetchAll(SYNC_TABLES[kind],idCol+',payload');
   const local=syncRows(kind);
   const item={kind,local:local.length,cloud:remote.length,localOnly:0,cloudOnly:0,different:0,matching:0,warning:''};
   if(kind==='logs'){
    // Log record IDs can be remapped by the server; compare payload multisets.
    const a=ktx163AuditMultiplicity(local),b=ktx163AuditMultiplicity(remote);
    for(const [h,n] of a){const k=b.get(h)||0;item.matching+=Math.min(n,k);item.localOnly+=Math.max(n-k,0)}
    for(const [h,n] of b)item.cloudOnly+=Math.max(n-(a.get(h)||0),0);
   }else{
    const a=new Map(local.map(r=>[String(r[idCol]),syncHash(r.payload)]));
    const b=new Map(remote.map(r=>[String(r[idCol]),syncHash(r.payload)]));
    for(const [id,hash] of a){if(!b.has(id))item.localOnly++;else if(b.get(id)!==hash)item.different++;else item.matching++}
    for(const id of b.keys())if(!a.has(id))item.cloudOnly++;
   }
   if(!remote.length&&local.length)item.warning='Cloud trả về 0 bản ghi; có thể do RLS hoặc bảng thực sự trống.';
   result.push(item);
  }
  SUPA_SYNC.ktx163Audit={at:new Date().toISOString(),result};
  syncSetStatus(result.every(x=>!x.localOnly&&!x.cloudOnly&&!x.different)?'Đối chiếu: không phát hiện chênh lệch trong các bảng đã đọc.':'Đối chiếu phát hiện khác biệt. KHÔNG tự ghi đè; xem bảng kết quả trước khi đồng bộ.','warn');
 }catch(e){SUPA_SYNC.ktx163Audit={error:e.message||String(e)};syncSetStatus('Đối chiếu không hoàn tất: '+(e.message||e),'bad')}
 finally{SUPA_SYNC.ktx163Auditing=false;syncPage()}
}
function ktx163AuditMarkup(){
 const a=SUPA_SYNC.ktx163Audit;
 if(!a)return '<div class="sync-note" style="margin-top:10px">Chưa đối chiếu. Thao tác này chỉ đọc số liệu và mã kiểm tra nội dung, không sửa dữ liệu.</div>';
 if(a.error)return '<div class="sync-note" style="margin-top:10px;color:#9a3412">Không đối chiếu được: '+esc(a.error)+'</div>';
 const rows=a.result.map(x=>'<tr><td>'+esc(KTX163_AUDIT_LABELS[x.kind])+'</td><td>'+x.local+'</td><td>'+x.cloud+'</td><td>'+x.localOnly+'</td><td>'+x.cloudOnly+'</td><td>'+x.different+'</td></tr>').join('');
 const warns=a.result.filter(x=>x.warning).map(x=>'<div style="color:#9a3412">'+esc(KTX163_AUDIT_LABELS[x.kind])+': '+esc(x.warning)+'</div>').join('');
 return '<div style="margin-top:12px"><b>Đối chiếu chỉ đọc · '+esc(new Date(a.at).toLocaleString('vi-VN'))+'</b><div class="wrap" style="margin-top:8px"><table class="sync-table"><thead><tr><th>Hạng mục</th><th>Thiết bị</th><th>Cloud</th><th>Chỉ máy</th><th>Chỉ Cloud</th><th>Khác nội dung</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+warns+'<p class="mut" style="margin-top:8px">Chênh lệch chỉ là kết quả so sánh bản ghi đọc được với quyền tài khoản hiện tại; không kết luận dữ liệu bị mất. Nhật ký được so khớp theo nội dung vì ID có thể thay đổi. Không thực hiện ghi, xóa, tải đè.</p></div>';
}
async function syncCloudCounts(){const out={};for(const [k,t] of Object.entries(SYNC_TABLES)){try{out[k]=await syncCount(t)}catch(e){out[k]='—'}}SUPA_SYNC.counts=out;return out}
async function syncManualNow(){
 const btn=$('sy_enable');
 if(!SUPA_SYNC.session?.user?.id)return alert('Phiên Supabase đã hết hoặc chưa đăng nhập. Hãy đăng nhập lại.');
 if(!SUPA_SYNC.ready)return alert('Kết nối Supabase chưa sẵn sàng. Hãy tải lại trang hoặc đăng nhập lại.');
 if(!SUPA_SYNC.enabled)return syncEnable();
 const old=btn?btn.innerHTML:'';
 if(btn){btn.disabled=true;btn.innerHTML='⟳ Đang đồng bộ...'}
 syncSetStatus('Đang gửi dữ liệu lên Supabase...','warn');
 if(page==='sync')syncPage();
 try{
  const result=await syncPushAll();
  if(result&&result.ok){
   await syncCloudCounts();
   syncSetStatus('Đồng bộ hoàn tất lúc '+new Date(SUPA_SYNC.lastSync).toLocaleTimeString('vi-VN'),'ok');
   try{add('SYNC','Đồng bộ thủ công với Supabase hoàn tất')}catch(e){}
   if(page==='sync')syncPage();
   alert('Đồng bộ hoàn tất. Dữ liệu trên máy đã được kiểm tra và gửi lên Supabase.');
  }else{
   const msg=result&&result.message||result&&result.error||SUPA_SYNC.lastError||'Không thực hiện được đồng bộ.';
   if(page==='sync')syncPage();
   alert('Chưa đồng bộ được: '+msg);
  }
 }catch(e){
  SUPA_SYNC.lastError=e.message||String(e);syncSetStatus('Lỗi đồng bộ: '+SUPA_SYNC.lastError,'bad');
  if(page==='sync')syncPage();
  alert('Lỗi đồng bộ: '+SUPA_SYNC.lastError);
 }finally{
  const b=$('sy_enable');if(b){b.disabled=false;if(old)b.innerHTML=old}
 }
}

async function syncEnable(){if(!SUPA_SYNC.session)return alert('Hãy đăng nhập Supabase trước.');try{await syncLoadAccount();const counts=await syncCloudCounts(),cloud=Number(counts.workers)||0;if(cloud===0&&W.length){alert('Cloud-Only: dữ liệu trình duyệt cũ không được tự đưa lên Supabase. Vui lòng xóa bộ nhớ dữ liệu thử sau khi sao lưu nếu cần, rồi tải lại từ Cloud.');return}else if(cloud>0){if(W.length&&!await ask(`Supabase đang có ${cloud.toLocaleString('vi-VN')} công nhân. Khi bật đồng bộ, dữ liệu Supabase sẽ là nguồn chính và thay dữ liệu cache trên máy này. Một bản sao local sẽ được giữ để dự phòng.`,{title:'Bật đồng bộ Supabase',ok:'Bật đồng bộ'}))return;SUPA_SYNC.enabled=true;SUPA_SYNC.ready=true;try{localStorage.setItem('ktx_sb_sync_enabled','true')}catch(e){}await syncPullAll(true)}else{SUPA_SYNC.enabled=true;SUPA_SYNC.ready=true;try{localStorage.setItem('ktx_sb_sync_enabled','true')}catch(e){}await syncPushState()}await syncSubscribe();syncFooter();syncPage()}catch(e){SUPA_SYNC.lastError=e.message||String(e);alert('Không bật được đồng bộ: '+SUPA_SYNC.lastError);syncPage()}}
// v1.0.135: On refresh, a persisted pending flag is not proof of unsaved edits.
// Only clear it after strict, read-only comparison of the local snapshot and Cloud.
// Never upload stale browser state or silently erase a genuine conflict.
async function ktx135VerifyPendingOnStartup(){
 if(!syncLs('ktx_sb_sync_pending',false))return true;
 if(SUPA_SYNC.pending||SUPA_SYNC.pushing||SUPA_SYNC.applying)return false;
 const kinds=['workers','archive','logs','attendance','registrations','rooms'];
 try{
  for(const kind of kinds){
   const table=SYNC_TABLES[kind], idCol=kind==='rooms'?'room_key':'record_id';
   const remote=await syncFetchAll(table,idCol+',payload');
   const local=syncRows(kind);
   // Logs may have remapped IDs; compare exact payload multisets instead.
   const hashes=rows=>rows.map(r=>syncHash(r.payload)).sort();
   const a=hashes(local),b=hashes(remote);
   if(a.length!==b.length||a.some((v,i)=>v!==b[i])){
    SUPA_SYNC.lastError='Dữ liệu chờ đồng bộ trên thiết bị khác Cloud ('+kind+'). Đã giữ nguyên để đối chiếu, không tự ghi đè.';
    syncSetStatus('Tạm dừng đồng bộ: cần đối chiếu '+kind,'warn');
    return false;
   }
  }
  localStorage.setItem('ktx_sb_sync_pending','false');
  SUPA_SYNC.lastError='';
  syncSetStatus('Đã kiểm tra dữ liệu; tự kết nối lại Supabase','ok');
  return true;
 }catch(e){
  SUPA_SYNC.lastError='Chưa đối chiếu được dữ liệu trước khi tự đồng bộ: '+(e.message||e);
  syncSetStatus(SUPA_SYNC.lastError,'warn');
  return false;
 }
}
// v1.0.189: one startup pull; stale local pending must never hide a readable Cloud list.
let __ktxStartupSyncPromise=null;
/* V26: independent, read-only worker hydration on account switch.
   A concurrent full pull must not hide the worker list indefinitely. */
let __ktxV26WorkerLoad=null;
async function ktxV26HydrateWorkers(){
 const uid=String(SUPA_SYNC.session?.user?.id||'');
 if(!uid || !SUPA_SYNC.ready || !SUPA_SYNC.enabled)return {ok:false,reason:'session-not-ready'};
 if(Array.isArray(W)&&W.length)return {ok:true,cached:true,count:W.length};
 if(__ktxV26WorkerLoad?.uid===uid)return __ktxV26WorkerLoad.promise;
 const valid=()=>String(SUPA_SYNC.session?.user?.id||'')===uid && SUPA_SYNC.ready && SUPA_SYNC.enabled;
 const promise=(async()=>{
  for(let attempt=1;attempt<=3;attempt++){
   if(!valid())return {ok:false,reason:'session-changed'};
   try{
    const rows=await syncFetchAll(SYNC_TABLES.workers,'record_id,payload');
    if(!valid())return {ok:false,reason:'session-changed'};
    if(!rows.length){
     syncSetStatus('Cloud trả 0 công nhân, chưa xác định dữ liệu trống hay do RLS. Không ghi dữ liệu từ máy lên Cloud.','warn');
     ktx222EmptyWorkersNotice(true);
     return {ok:true,empty:true,readOnly:true,count:0};
    }
    // Do not overwrite another load or local changes awaiting upload.
    if(W.length)return {ok:true,cached:true,count:W.length};
    syncApplyRows('workers',rows);
    if(valid()){
      all();
      syncSetStatus('Đã tự tải '+rows.length+' công nhân từ Supabase (chỉ đọc)','ok');
      syncFooter();
      if(page==='sync')syncPage();
    }
    return {ok:true,count:rows.length};
   }catch(e){
    if(!valid())return {ok:false,reason:'session-changed'};
    SUPA_SYNC.lastError=String(e?.message||e);
    syncSetStatus('Tải công nhân lần '+attempt+'/3: '+SUPA_SYNC.lastError,'warn');
    if(attempt<3)await new Promise(r=>setTimeout(r,attempt*1200));
   }
  }
  syncSetStatus('Không tự tải được công nhân: '+SUPA_SYNC.lastError+'; không ghi dữ liệu lên Cloud.','bad');
  if(page==='sync')syncPage();
  return {ok:false,reason:SUPA_SYNC.lastError};
 })();
 __ktxV26WorkerLoad={uid,promise};
 try{return await promise}finally{if(__ktxV26WorkerLoad?.promise===promise)__ktxV26WorkerLoad=null}
}
/* V27: verified, session-scoped worker hydration for account switching.
   Prevents exposing a blank/old worker list until the Cloud read succeeds.
   No Cloud writes, no localStorage snapshots and no page refresh. */
let __ktxV27BootLoad=null;
async function ktxV27BootstrapWorkers(){
 const uid=String(SUPA_SYNC.session?.user?.id||'');
 if(!uid||!SUPA_SYNC.ready||!SUPA_SYNC.enabled)return {ok:false,reason:'Tài khoản Cloud chưa được xác thực'};
 if(__ktxV27BootLoad?.uid===uid)return __ktxV27BootLoad.promise;
 const promise=(async()=>{
  SUPA_SYNC.cloudHydratedUser='';
  // Pending records from another browser/user are never read as a source of truth.
  SUPA_SYNC.pending=false;
  SUPA_SYNC.conflicts=[];
  clearTimeout(SUPA_SYNC.pushTimer);
  W=[];ARC=[];LOG=[];ATT=[];REG=[];ROOMMETA={};
  await ktx221LoadPreview();
  for(let attempt=1;attempt<=4;attempt++){
   if(String(SUPA_SYNC.session?.user?.id||'')!==uid)return {ok:false,reason:'Đã chuyển sang tài khoản khác'};
   try{
    if(SUPA_SYNC.pulling){await new Promise(r=>setTimeout(r,750));continue;}
    const response=await syncPullAll(true);
    if(response?.ok)return response;
    if(response?.busy){await new Promise(r=>setTimeout(r,700));continue;}
    if(attempt===4)return {ok:false,reason:response?.reason||'Supabase không phản hồi'};
   }catch(e){if(attempt===4)return {ok:false,reason:e.message||String(e)};}
   await new Promise(r=>setTimeout(r,attempt*700));
  }
  return {ok:false,reason:'Không thể tải đủ dữ liệu từ Cloud.'};
 })();
 __ktxV27BootLoad={uid,promise};
 try{return await promise}finally{if(__ktxV27BootLoad?.promise===promise)__ktxV27BootLoad=null}
}
async function ktx189ReadOnlyWorkersIfEmpty(){
 return ktxV26HydrateWorkers();
}
async function ktx135StartAutomaticSync(){
 if(__ktxStartupSyncPromise)return __ktxStartupSyncPromise;
 __ktxStartupSyncPromise=(async()=>{
  const uid=String(SUPA_SYNC.session?.user?.id||'');
  if(!uid)return {ok:false,reason:'Chưa có phiên Cloud'};
  if(SUPA_SYNC.cloudHydratedUser!==uid){
   const r=await ktxV27BootstrapWorkers();
   if(!r.ok)return r;
  }
  await syncSubscribe();
  return {ok:true};
 })();
 try{return await __ktxStartupSyncPromise}finally{__ktxStartupSyncPromise=null}
}
async function syncLogin(){syncSaveCfg();const sb=syncClient();if(!sb)return alert('Hãy nhập Project URL và Publishable key hợp lệ.');const email=$('sy_email').value.trim(),password=$('sy_pass').value;if(!email||!password)return alert('Hãy nhập email và mật khẩu Supabase Auth.');const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)return alert('Đăng nhập không thành công: '+error.message);SUPA_SYNC.session=data.session;try{await syncLoadAccount();syncSetStatus('Đã đăng nhập Supabase','ok');SUPA_SYNC.ready=true;SUPA_SYNC.enabled=true;/* Reload once after a verified explicit login; old workers, roles and navigation must not survive across users. */window.location.reload();return;if(SUPA_SYNC.session){SUPA_SYNC.enabled=true;try{localStorage.setItem('ktx_sb_sync_enabled','true')}catch(e){}await ktx135StartAutomaticSync()}syncFooter();syncPage()}catch(e){SUPA_SYNC.ready=false;SUPA_SYNC.lastError=e.message||String(e);syncSetStatus(SUPA_SYNC.lastError,'bad');syncPage()}}
async function syncLogout(){await ktx221ClearCurrentScope();const sb=syncClient();if(sb)await sb.auth.signOut();if(SUPA_SYNC.channel)try{await sb.removeChannel(SUPA_SYNC.channel)}catch(e){}SUPA_SYNC.session=null;SUPA_SYNC.account=null;SUPA_SYNC.ready=false;SUPA_SYNC.enabled=false;try{localStorage.setItem('ktx_sb_sync_enabled','false')}catch(e){}syncSetStatus('Đã đăng xuất Supabase','warn');syncFooter();syncPage();/* Reset prior user's in-memory data and navigation. */window.location.reload()}
async function syncInit(){
 if(window.__ktxAuthBooting||window.__ktxLoginBusy){setTimeout(syncInit,1200);return}
 const sb=syncClient();
 if(!sb){syncSetStatus('Chưa cấu hình Publishable key Supabase','warn');syncFooter();return}
 try{
  const {data,error}=await sb.auth.getSession();
  if(error)throw error;
  const session=data&&data.session||null;
  if(!session){
   SUPA_SYNC.session=null;SUPA_SYNC.account=null;SUPA_SYNC.ready=false;
   syncSetStatus('Chưa đăng nhập Supabase','warn');syncFooter();return;
  }
  SUPA_SYNC.session=session;
  if(!session?.user?.id){SUPA_SYNC.session=null;SUPA_SYNC.account=null;SUPA_SYNC.ready=false;syncSetStatus('Phiên Supabase chưa hợp lệ; vui lòng đăng nhập lại','warn');syncFooter();return;}
  if(!SUPA_SYNC.account||String(SUPA_SYNC.account.user_id)!==String(session.user.id))await syncLoadAccount();
  SUPA_SYNC.ready=!!(SUPA_SYNC.account&&SUPA_SYNC.account.enabled);
  SUPA_SYNC.enabled=SUPA_SYNC.ready;
  try{localStorage.setItem('ktx_sb_sync_enabled',String(SUPA_SYNC.enabled))}catch(e){}
  syncSetStatus('Đã khôi phục phiên Supabase','ok');syncFooter();
  // Startup synchronization is independent of whether the auth status is displayed.
  if(SUPA_SYNC.enabled&&typeof ktx135StartAutomaticSync==='function'){
   ktx135StartAutomaticSync().catch(e=>{SUPA_SYNC.lastError=e.message||String(e);console.warn('[KTX] Background sync after auth restore:',e)});
  }
 }catch(e){
  SUPA_SYNC.lastError=e.message||String(e);
  // A network/read error must not automatically sign out the app or erase saved tokens.
  syncSetStatus('Không thể xác minh phiên Supabase: '+SUPA_SYNC.lastError,'warn');syncFooter();
 }finally{if(page==='sync')syncPage()}
}
function syncPage(){const el=$('sync');if(!el)return;const c=syncCfg(),a=SUPA_SYNC.account,s=SUPA_SYNC.session,k=s?(SUPA_SYNC.ready?'ok':'warn'):'warn',msg=s?(SUPA_SYNC.ready?'Đã đăng nhập Supabase':'Đã có phiên Supabase · đang xác minh quyền'):'Chưa đăng nhập Supabase',co=SUPA_SYNC.counts||{};el.innerHTML=`<div class="sync-grid"><div><div class="card"><h3>Kết nối Supabase</h3><div class="sync-status ${k}"><i class="sync-dot"></i><div><b>${esc(msg)}</b><small>${s?`Phiên: ${esc(s?.user?.email||'')} · ${a?ROLES[a.role]||a.role:'đang đọc quyền'}`:'Dùng Supabase Auth + RLS. Không dùng service_role trên trình duyệt.'}</small></div></div><div class="sync-form" style="margin-top:12px"><label class="fl wide">Project URL<input id="sy_url" value="${esc(c.url||'')}" placeholder="https://xxxxx.supabase.co"></label><label class="fl wide">Publishable key<input id="sy_key" type="password" value="${esc(c.key||'')}" placeholder="sb_publishable_... hoặc anon key"></label><label class="fl">Email Supabase Auth<input id="sy_email" type="email" value="${esc(c.email||'')}"></label><label class="fl">Mật khẩu<input id="sy_pass" type="password" placeholder="Không lưu mật khẩu"></label></div><div class="sync-actions">${s?`<button class="btn g" id="sy_enable">${SUPA_SYNC.enabled?'Đồng bộ ngay':'Bật đồng bộ dữ liệu'}</button><button class="btn s" id="sy_pull">Tải mới từ Supabase</button><button class="btn s" id="sy_count">Kiểm tra dữ liệu cloud</button><button class="btn s" id="sy_audit" ${SUPA_SYNC.ktx163Auditing?'disabled':''}>${SUPA_SYNC.ktx163Auditing?'Đang đối chiếu...':'Đối chiếu Cloud / thiết bị'}</button><button class="btn r" id="sy_logout">Đăng xuất</button>`:`<button class="btn g" id="sy_login">Đăng nhập & kết nối</button>`}</div><div class="sync-last">${SUPA_SYNC.lastSync?`Lần đồng bộ gần nhất: <b>${new Date(SUPA_SYNC.lastSync).toLocaleString('vi-VN')}</b>`:'Chưa có lần đồng bộ trong phiên này.'}</div></div><div class="card"><h3>Nguyên tắc đồng bộ</h3><div class="sync-help"><b>Supabase là nguồn dữ liệu chính sau khi bật đồng bộ.</b><br>• Công nhân, điều chuyển/nghỉ việc, nhật ký, điểm danh, đăng ký, tạm trú/tạm vắng, lịch sử cư trú và cấu hình phòng được đưa lên database.<br>• Trạng thái “đã đọc” cảnh báo được lưu theo từng tài khoản.<br>• Cấu hình và các bản backup trình duyệt hiện tại được đồng bộ nền vào <span class="sync-code">ktx_sync_state</span>; giao diện backup online/versioning sẽ làm ở Bước 3.<br>• Dữ liệu nghiệp vụ cần được đọc trực tiếp từ Supabase; không dùng bản sao trình duyệt làm nguồn dữ liệu chính.</div></div></div><div><div class="card"><h3>Dữ liệu trên Supabase</h3><div class="sync-kpis"><div class="sync-kpi"><span>Công nhân</span><b>${co.workers??'—'}</b></div><div class="sync-kpi"><span>Lưu hồ sơ</span><b>${co.archive??'—'}</b></div><div class="sync-kpi"><span>Nhật ký</span><b>${co.logs??'—'}</b></div><div class="sync-kpi"><span>Điểm danh</span><b>${co.attendance??'—'}</b></div><div class="sync-kpi"><span>Cấu hình phòng</span><b>${co.rooms??'—'}</b></div><div class="sync-kpi"><span>Lịch sử cư trú</span><b>${co.resHistory??'—'}</b></div></div><div class="sync-note">Bấm “Kiểm tra dữ liệu cloud” để cập nhật các con số. <b>Lưu ý:</b> Công nhân lấy từ <code>ktx_workers</code>; Trạng thái cư trú từ <code>ktx_residence_status</code>. Hai bảng độc lập.</div>${co.resStatus!==undefined?`<div class="sync-note" style="margin-top:8px;padding:10px;border:1px solid #d4dcff;border-radius:8px"><b>Đối chiếu dữ liệu:</b> Công nhân đọc được: <b>${esc(String(co.workers??"—"))}</b> · Trạng thái cư trú: <b>${esc(String(co.resStatus??"—"))}</b>${co.workers===0&&Number(co.resStatus)>0?`<br><strong style="color:#9a5a00">Bảng trạng thái cư trú còn dữ liệu nhưng bảng công nhân trả về 0. Không được coi dữ liệu cư trú là danh sách công nhân; kiểm tra số dòng ktx_workers và RLS trước khi nhập hoặc đồng bộ.</strong>`:""}</div>`:""}</div><div class="card"><h3>Đối chiếu Cloud / thiết bị</h3>${ktx163AuditMarkup()}</div><div class="card"><h3>Trạng thái hiện tại</h3><div class="wrap"><table class="sync-table"><tr><th>Hạng mục</th><th>Trạng thái</th></tr><tr><td>Supabase Auth</td><td>${s?'<span class="sync-pill ok">Đã đăng nhập</span>':'<span class="sync-pill off">Chưa đăng nhập</span>'}</td></tr><tr><td>Tài khoản ứng dụng</td><td>${a?`<span class="sync-pill ok">${esc(ROLES[a.role]||a.role)}</span>`:'<span class="sync-pill off">Chưa xác minh</span>'}</td></tr><tr><td>Đồng bộ tự động</td><td>${SUPA_SYNC.enabled?'<span class="sync-pill ok">Đang bật</span>':'<span class="sync-pill off">Đang tắt</span>'}</td></tr><tr><td>Thay đổi chờ gửi</td><td>${SUPA_SYNC.pending?'<span class="sync-pill">Có</span>':'Không'}</td></tr></table></div>${SUPA_SYNC.lastError?`<div class="bkstatus wn" style="margin-top:10px"><b>Lỗi gần nhất</b><div class="mut">${esc(SUPA_SYNC.lastError)}</div></div>`:''}</div><div class="card"><h3>Thiết lập database</h3><p class="mut" style="margin-top:0">Trước khi bật lần đầu, hãy chạy file SQL <b>009_supabase_main_sync.sql</b> trong Supabase SQL Editor.</p><div class="sync-help">Sau khi SQL chạy thành công, tài khoản đăng nhập phải có <b>enabled = true</b> trong <span class="sync-code">app_accounts</span>. RLS sẽ chặn các thao tác không đúng vai trò.</div></div></div></div>`;if($('sy_login'))$('sy_login').onclick=syncLogin;if($('sy_enable'))$('sy_enable').onclick=SUPA_SYNC.enabled?syncManualNow:syncEnable;if($('sy_pull'))$('sy_pull').onclick=()=>syncPullAll(true);if($('sy_count'))$('sy_count').onclick=async()=>{try{await syncCloudCounts();syncPage()}catch(e){alert('Không đọc được dữ liệu cloud: '+(e.message||e))}};if($('sy_audit'))$('sy_audit').onclick=ktx163AuditReadOnly;if($('sy_logout'))$('sy_logout').onclick=syncLogout}
// Đồng bộ trạng thái đã đọc cảnh báo.
if(typeof markAllAlertsRead==='function'&&!window.__step86AlertRead){window.__step86AlertRead=true;const old86=markAllAlertsRead;markAllAlertsRead=function(){old86();if(SUPA_SYNC.ready&&SUPA_SYNC.enabled)syncPushAlertReads().catch(()=>{})}}
// Đồng bộ cấu hình backup hiện tại khi backup thay đổi; Bước 3 mới bổ sung quản lý version/restore online.
if(typeof bkSaveAutos==='function'&&!window.__step86BkSave){window.__step86BkSave=true;const oldBk86=bkSaveAutos;bkSaveAutos=function(a){oldBk86(a);if(SUPA_SYNC.ready&&SUPA_SYNC.enabled)syncSchedulePush()}}
setTimeout(syncInit,2100);

/* v2.0.32 Step 2 (low-risk): avoid repeated full-table pulls while Realtime is healthy.
   Realtime changes still call syncScheduleReload immediately; fallback remains when disconnected.
   No worker/profile payloads are persisted in browser cache by this check. */
(function(){
 if(window.__KTX_SYNC_FRESHNESS_85__)return;
 window.__KTX_SYNC_FRESHNESS_85__=true;
 const CONNECTED_FALLBACK_MS=20*60*1000; // v2.0.88: Realtime is primary; safety fallback at 20 minutes
 const DISCONNECTED_FALLBACK_MS=3*60*1000; // v2.0.88: faster recovery when Realtime is offline
 let lastScheduledAt=0;
 function checkFresh(){
   if(typeof document!=='undefined' && document.hidden)return;
   if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.ready||!SUPA_SYNC.session||!SUPA_SYNC.enabled)return;
   if(SUPA_SYNC.deletingWorkers||SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying||SUPA_SYNC.pending)return;
   if((SUPA_SYNC.conflicts||[]).length)return;
   if(typeof syncLs==='function'&&syncLs('ktx_sb_sync_pending',false))return;
   const interval=SUPA_SYNC.realtimeConnected===true?CONNECTED_FALLBACK_MS:DISCONNECTED_FALLBACK_MS;
   const mostRecent=Math.max(lastScheduledAt,Number(SUPA_SYNC.lastSync)||0);
   if(Date.now()-mostRecent<interval)return;
   lastScheduledAt=Date.now();
   if(typeof syncScheduleReload==='function')syncScheduleReload();
 }
 document.addEventListener('visibilitychange',checkFresh);
 window.addEventListener('focus',checkFresh);
 window.addEventListener('online',checkFresh);
 setInterval(checkFresh,30000);
})();

;
/* >>> Original: assets/js/modules/admin/script-20.js >>> */

/* STEP91 — BƯỚC 3: Backup online + khôi phục phiên bản */
const CLOUD_BK_TABLE='ktx_backup_versions';
const CLOUD_BK_LAST_AUTO='ktx_cloud_backup_last_auto';
function cloudBkAdmin(){return !!(SUPA_SYNC&&SUPA_SYNC.ready&&SUPA_SYNC.enabled&&SUPA_SYNC.session&&((SUPA_SYNC.account&&SUPA_SYNC.account.role)||ME.role)==='admin')}
function cloudBkSafeSettings(){const src=bkSettings(),out={};const deny=/^ktx_sb_sync_(url|key|email|enabled|pending)$/i;Object.entries(src||{}).forEach(([k,v])=>{if(deny.test(k)||k===ALERT_READ_KEY||k==='ktx_room_meta'||k==='ktx_before_supabase_sync_marker')return;out[k]=v});return out}
function cloudBkSnapshot(){return{format:'KTX_HOC_MON_CLOUD_BACKUP_V1',createdAt:new Date().toISOString(),createdLocal:new Date().toLocaleString('vi-VN'),appStep:91,data:{workers:syncClone(W),archive:syncClone(ARC),logs:syncClone(LOG.slice(0,5000)),attendance:syncClone(ATT.slice(0,5000)),registrations:syncClone(REG),roomMeta:syncClone(ROOMMETA||{}),backupConfig:syncClone(bkCfg()),settings:cloudBkSafeSettings()}}}
function cloudBkSummaryObj(s){const d=s&&s.data||{},n=x=>Array.isArray(x)?x.length:0;return{workers:n(d.workers),archive:n(d.archive),logs:n(d.logs),attendance:n(d.attendance),registrations:n(d.registrations),rooms:d.roomMeta&&typeof d.roomMeta==='object'?Object.keys(d.roomMeta).length:0}}
function cloudBkFmtSummary(s){const x=s||{};return`Công nhân ${Number(x.workers||0).toLocaleString('vi-VN')} · Lưu hồ sơ ${Number(x.archive||0).toLocaleString('vi-VN')} · Nhật ký ${Number(x.logs||0).toLocaleString('vi-VN')} · Điểm danh ${Number(x.attendance||0).toLocaleString('vi-VN')} · Phòng ${Number(x.rooms||0).toLocaleString('vi-VN')}`}
function cloudBkTypeLabel(t){return t==='auto'?'Tự động':t==='pre_restore'?'Trước khôi phục':'Thủ công'}
async function cloudBkList(limit=60){if(!cloudBkAdmin())return[];const sb=syncClient();const {data,error}=await sb.from(CLOUD_BK_TABLE).select('id,backup_date,backup_type,label,summary,created_at,created_by,created_email,restored_at,restored_by').order('created_at',{ascending:false}).limit(limit);if(error)throw error;return data||[]}
async function cloudBkPruneAuto(){if(!cloudBkAdmin())return;const keep=Math.max(1,+bkCfg().keep||7),cut=new Date();cut.setDate(cut.getDate()-keep);const cutoff=window.ktxLocalISO(cut),sb=syncClient();const {error}=await sb.from(CLOUD_BK_TABLE).delete().eq('backup_type','auto').lt('backup_date',cutoff);if(error)throw error}
async function cloudBkCreate(type='manual',label='',silent=false){if(!cloudBkAdmin())throw new Error('Chỉ tài khoản Quản trị đã bật đồng bộ Supabase mới tạo được backup online.');const sb=syncClient(),snapshot=cloudBkSnapshot(),summary=cloudBkSummaryObj(snapshot),email=(SUPA_SYNC.session&&SUPA_SYNC.session.user&&SUPA_SYNC.session.user.email)||'',row={backup_date:ldy(),backup_type:type,label:label||'',snapshot,summary,created_by:syncActor(),created_email:email};const {data,error}=await sb.from(CLOUD_BK_TABLE).insert(row).select('id,created_at').single();if(error)throw error;if(type==='auto')await cloudBkPruneAuto();auditPush('BACKUP',`${type==='auto'?'Sao lưu online tự động':type==='pre_restore'?'Tạo điểm khôi phục an toàn':'Sao lưu online thủ công'}${label?' · '+label:''}`);if(!silent)alert('Đã tạo bản sao online trên Supabase.');return data}
async function cloudBkAutoRun(force=false){if(!cloudBkAdmin())return false;const c=bkCfg();if(!c.auto&&!force)return false;const today=ldy(),sb=syncClient();if(!force){const {data,error}=await sb.from(CLOUD_BK_TABLE).select('id').eq('backup_type','auto').eq('backup_date',today).limit(1);if(error)throw error;if(data&&data.length)return false}await cloudBkCreate('auto',`Tự động ${today}`,true);try{localStorage.setItem(CLOUD_BK_LAST_AUTO,today)}catch(e){}return true}
async function cloudBkFetch(id){const sb=syncClient(),{data,error}=await sb.from(CLOUD_BK_TABLE).select('*').eq('id',id).single();if(error)throw error;return data}
function cloudBkApplySnapshot(s){if(!s||s.format!=='KTX_HOC_MON_CLOUD_BACKUP_V1'||!s.data)throw new Error('Phiên bản backup online không hợp lệ.');const d=s.data;if(Array.isArray(d.workers))W=syncClone(d.workers);if(Array.isArray(d.archive))ARC=syncClone(d.archive);if(Array.isArray(d.logs))LOG=syncClone(d.logs);if(Array.isArray(d.attendance))ATT=syncClone(d.attendance);if(Array.isArray(d.registrations))REG=syncClone(d.registrations);if(d.roomMeta&&typeof d.roomMeta==='object')ROOMMETA=syncClone(d.roomMeta);if(d.backupConfig&&typeof d.backupConfig==='object')try{localStorage.setItem(BK_CFG_KEY,JSON.stringify(d.backupConfig))}catch(e){}if(d.settings&&typeof d.settings==='object')Object.entries(d.settings).forEach(([k,v])=>{try{localStorage.setItem(k,v)}catch(e){}});try{localStorage.setItem('ktx_w',JSON.stringify(W));localStorage.setItem('ktx_l',JSON.stringify(LOG));localStorage.setItem('ktx_arc',JSON.stringify(ARC));localStorage.setItem('ktx_att',JSON.stringify(ATT));localStorage.setItem('ktx_reg',JSON.stringify(REG));localStorage.setItem('ktx_room_meta',JSON.stringify(ROOMMETA))}catch(e){console.warn('LocalStorage đầy sau khôi phục; dữ liệu vẫn giữ trong phiên hiện tại.',e)}}
async function cloudBkClearBusinessTables(){const sb=syncClient();const defs=[['ktx_workers','record_id'],['ktx_archived_workers','record_id'],['ktx_audit_logs','record_id'],['ktx_attendance','record_id'],['ktx_registrations','record_id'],['ktx_room_meta','room_key'],['ktx_residence_status','worker_id'],['ktx_residence_history','record_id']];for(const [t,c] of defs){const {error}=await sb.from(t).delete().neq(c,'__KTX_NEVER_MATCH__');if(error)throw error}}
async function cloudBkRestore(id){alert('Tạm khóa khôi phục toàn hệ thống: tính nguyên tử cho các bảng công nhân, cư trú, nhật ký chưa được bảo đảm. Có thể tải bản sao JSON để đối chiếu. Không có dữ liệu Cloud nào bị thay đổi.');return;if(!cloudBkAdmin())return alert('Chỉ Quản trị được khôi phục phiên bản online.');let row;try{row=await cloudBkFetch(id)}catch(e){return alert('Không đọc được bản backup: '+(e.message||e))}const sm=row.summary||cloudBkSummaryObj(row.snapshot);const when=new Date(row.created_at).toLocaleString('vi-VN');if(!await ask(`Khôi phục phiên bản ngày ${when}?\n\n${cloudBkFmtSummary(sm)}\n\nDữ liệu hiện tại sẽ được thay thế bởi phiên bản này.`,{title:'Bước 1/2 · Xác nhận khôi phục',ok:'Tiếp tục'}))return;if(!await ask('XÁC NHẬN LẦN CUỐI: Hệ thống sẽ tạo một bản dự phòng “Trước khôi phục”, sau đó thay thế dữ liệu hiện tại trên Supabase và các máy đồng bộ. Bạn có chắc chắn?',{title:'Bước 2/2 · Khôi phục phiên bản',ok:'Khôi phục'}))return;const box=$('cloudBkList');try{if(box)box.innerHTML='<div class="cloud-bk-empty">Đang tạo bản an toàn và khôi phục dữ liệu...</div>';await cloudBkCreate('pre_restore','Tự động tạo trước khi khôi phục',true);SUPA_SYNC.applying=true;cloudBkApplySnapshot(row.snapshot);SUPA_SYNC.applying=false;await cloudBkClearBusinessTables();SUPA_SYNC.hashes={};SUPA_SYNC.remoteIds={};const rs=await syncPushAll();if(!rs||!rs.ok)throw new Error(rs&&rs.error||rs&&rs.message||'Không gửi được dữ liệu đã khôi phục lên Supabase.');const sb=syncClient();await sb.from(CLOUD_BK_TABLE).update({restored_at:syncStamp(),restored_by:syncActor()}).eq('id',id);auditPush('RESTORE',`Khôi phục phiên bản online ${when}`);await syncPushAll();alert('Khôi phục phiên bản hoàn tất. Dữ liệu Supabase đã được thay thế và sẽ đồng bộ sang các máy khác.');all()}catch(e){SUPA_SYNC.applying=false;alert('Khôi phục không hoàn tất: '+(e.message||e));if(page==='backup')backupPage()}}
async function cloudBkDelete(id){if(!cloudBkAdmin())return;if(!await ask('Xóa hẳn phiên bản backup online này? Thao tác không thể hoàn tác.',{title:'Xóa phiên bản backup',ok:'Xóa'}))return;const sb=syncClient(),{error}=await sb.from(CLOUD_BK_TABLE).delete().eq('id',id);if(error)return alert('Không xóa được: '+error.message);auditPush('BACKUP','Xóa một phiên bản backup online');backupPage()}
async function cloudBkDownload(id){try{const r=await cloudBkFetch(id);bkDownload(r.snapshot,`KTX_Hoc_Mon_OnlineBackup_${String(r.backup_date||ldy())}_${String(r.id).slice(0,8)}.json`)}catch(e){alert('Không tải được bản backup: '+(e.message||e))}}
async function cloudBkRenderList(){const box=$('cloudBkList');if(!box)return;if(!cloudBkAdmin()){box.innerHTML='<div class="cloud-bk-empty">Cần đăng nhập Quản trị và bật Đồng bộ Supabase để sử dụng backup online.</div>';return}box.innerHTML='<div class="cloud-bk-empty">Đang tải danh sách phiên bản...</div>';try{const L=await cloudBkList();if(!L.length){box.innerHTML='<div class="cloud-bk-empty">Chưa có phiên bản backup online. Hãy bấm “Tạo bản online ngay”.</div>';return}box.innerHTML=L.map(r=>`<div class="cloud-bk-item"><div class="cloud-bk-top"><div class="cloud-bk-main"><b><span class="cloud-bk-type ${esc(r.backup_type)}">${cloudBkTypeLabel(r.backup_type)}</span>${esc(r.label||'Bản sao dữ liệu')}</b><small>${esc(new Date(r.created_at).toLocaleString('vi-VN'))} · ${esc(r.created_email||'Không rõ người tạo')}${r.restored_at?`<br>Đã khôi phục: ${esc(new Date(r.restored_at).toLocaleString('vi-VN'))}`:''}</small><div class="cloud-bk-kpis"><span><b>${Number((r.summary||{}).workers||0).toLocaleString('vi-VN')}</b>Công nhân</span><span><b>${Number((r.summary||{}).logs||0).toLocaleString('vi-VN')}</b>Nhật ký</span><span><b>${Number((r.summary||{}).rooms||0).toLocaleString('vi-VN')}</b>Phòng cấu hình</span></div></div><div class="cloud-bk-actions"><button class="btn s sm" data-cbdl="${r.id}">Tải JSON</button><button class="btn g sm" data-cbr="${r.id}">Khôi phục</button><button class="btn r sm" data-cbx="${r.id}">Xóa</button></div></div></div>`).join('');box.querySelectorAll('[data-cbdl]').forEach(b=>b.onclick=()=>cloudBkDownload(b.dataset.cbdl));box.querySelectorAll('[data-cbr]').forEach(b=>b.onclick=()=>cloudBkRestore(b.dataset.cbr));box.querySelectorAll('[data-cbx]').forEach(b=>b.onclick=()=>cloudBkDelete(b.dataset.cbx))}catch(e){box.innerHTML=`<div class="cloud-bk-empty"><b>Chưa dùng được backup online.</b><br>${esc(e.message||e)}<br><br>Hãy chạy file SQL <b>010_supabase_backup_versions.sql</b> trong Supabase SQL Editor.</div>`}}

// Giao diện Backup Bước 3: giữ backup local/file, bổ sung version online.
backupPage=function(){const el=$('backup');if(!el)return;if(!can('backup')){el.innerHTML='<div class="card"><h3>Không có quyền truy cập</h3><p class="mut">Chỉ Quản trị được phép sao lưu và khôi phục dữ liệu.</p></div>';return}const c=bkCfg(),a=bkAutos(),online=cloudBkAdmin();const ck=(k,l)=>`<label><input type="checkbox" data-bks="${k}" ${c.scope&&c.scope[k]!==false?'checked':''}> ${l}</label>`;el.innerHTML=`<div class="bkgrid"><div><div class="card"><h3>Sao lưu & khôi phục</h3><div class="bkstatus ${c.auto?'ok':'wn'}"><b>${c.auto?'Đang bật sao lưu tự động hàng ngày':'Sao lưu tự động đang tắt'}</b><div class="mut" style="margin-top:3px">Khi Supabase đang kết nối, hệ thống sẽ tạo thêm một phiên bản online mỗi ngày. Bản thủ công online được giữ cho đến khi Quản trị xóa.</div></div><div class="cloud-bk-status ${online?'ok':'warn'}"><i></i><div><b>${online?'Backup online đã sẵn sàng':'Backup online chưa sẵn sàng'}</b><small>${online?'Supabase đang đồng bộ · chỉ Quản trị được tạo/khôi phục phiên bản':'Hãy đăng nhập Quản trị và bật Đồng bộ Supabase. Sau đó chạy SQL 010 nếu chưa chạy.'}</small></div></div><div class="row" style="margin-top:12px"><label class="tgl"><input type="checkbox" id="bk_auto" ${c.auto?'checked':''}> Sao lưu tự động hàng ngày</label><label class="fl" style="margin:0">Giữ bản tự động<select id="bk_keep"><option value="7" ${c.keep==7?'selected':''}>7 ngày</option><option value="14" ${c.keep==14?'selected':''}>14 ngày</option><option value="30" ${c.keep==30?'selected':''}>30 ngày</option></select></label></div><h3 style="margin-top:16px">Tùy chọn file backup cục bộ</h3><div class="bkopt">${ck('workers','Danh sách công nhân')}${ck('archive','Điều chuyển · Nghỉ việc')}${ck('logs','Nhật ký hệ thống')}${ck('attendance','Điểm danh')}${ck('registrations','Đăng ký chờ duyệt')}${ck('settings','Cài đặt & cấu hình')}</div><div class="row" style="margin-top:14px"><button class="btn g" id="bk_cloud">☁ Tạo bản online ngay</button><button class="btn" id="bk_now">${ico2('dl')}Tải backup JSON</button><button class="btn s" id="bk_snap">Tạo bản trên máy</button></div><div class="cloud-bk-note"><b>Khôi phục online có xác nhận 2 bước.</b> Trước khi khôi phục, hệ thống tự tạo thêm một phiên bản “Trước khôi phục” để có đường quay lại nếu cần.</div></div><div class="card"><h3>Khôi phục từ file JSON</h3><p class="mut" style="margin-top:0">Dùng khi cần phục hồi từ file đã tải về. Hệ thống vẫn yêu cầu xác nhận trước khi thay thế dữ liệu.</p><label class="btn s" style="cursor:pointer;margin:0">${ico2('ul')}Chọn file sao lưu<input id="bk_file" type="file" accept=".json,application/json" hidden></label><div id="bk_restore_info" style="margin-top:10px"></div></div></div><div><div class="card"><div class="row"><h3 style="margin:0">Phiên bản online</h3><button class="btn s sm" id="bk_refresh_cloud" style="margin-left:auto">Làm mới</button></div><div id="cloudBkList" class="cloud-bk-list"></div></div><div class="card"><h3>Bản sao trên máy (${a.length})</h3><div class="bklist">${a.length?a.map((x,i)=>`<div class="bkitem"><div><b>${esc(x.day.split('-').reverse().join('/'))}</b><small>${esc(new Date(x.at).toLocaleString('vi-VN'))}<br>${esc(bkSummary(x.backup))}</small></div><div class="row"><button class="btn s sm" data-bkd="${i}">Tải</button><button class="btn r sm" data-bkx="${i}">Xóa</button></div></div>`).join(''):'<p class="mut" style="margin:0">Chưa có bản sao trên máy.</p>'}</div></div></div></div>`;
 const saveCfg=()=>{const scope={};el.querySelectorAll('[data-bks]').forEach(x=>scope[x.dataset.bks]=x.checked);const n={auto:$('bk_auto').checked,keep:+$('bk_keep').value,scope};localStorage.setItem(BK_CFG_KEY,JSON.stringify(n));if(SUPA_SYNC.ready&&SUPA_SYNC.enabled)syncSchedulePush();return n};
 $('bk_auto').onchange=async()=>{const n=saveCfg();if(n.auto){bkAutoRun(false);try{await cloudBkAutoRun(false)}catch(e){console.warn(e)}}backupPage()};$('bk_keep').onchange=async()=>{saveCfg();let z=bkAutos().slice(0,+$('bk_keep').value);bkSaveAutos(z);try{await cloudBkPruneAuto()}catch(e){}backupPage()};el.querySelectorAll('[data-bks]').forEach(x=>x.onchange=saveCfg);
 $('bk_cloud').onclick=async()=>{if(!cloudBkAdmin())return alert('Backup online chưa sẵn sàng. Hãy đăng nhập Quản trị, bật Đồng bộ Supabase và chạy SQL 010.');const b=$('bk_cloud'),old=b.textContent;b.disabled=true;b.textContent='Đang tạo backup...';try{await cloudBkCreate('manual','Backup thủ công');await cloudBkRenderList()}catch(e){alert('Không tạo được backup online: '+(e.message||e))}finally{b.disabled=false;b.textContent=old}};
 $('bk_refresh_cloud').onclick=cloudBkRenderList;$('bk_now').onclick=()=>{const n=saveCfg(),o=bkMake(n.scope);bkDownload(o,`KTX_Hoc_Mon_Backup_${bkDay()}.json`);auditPush('BACKUP','Tải backup JSON thủ công')};$('bk_snap').onclick=()=>{alert('Bản sao lưu trên trình duyệt đã ngừng hỗ trợ. Hãy dùng Tạo bản online ngay để lưu trên Supabase, hoặc Tải backup JSON để xuất bản sao thủ công.');};el.querySelectorAll('[data-bkd]').forEach(b=>b.onclick=()=>{const x=bkAutos()[+b.dataset.bkd];if(x)bkDownload(x.backup,`KTX_Hoc_Mon_AutoBackup_${x.day}.json`)});el.querySelectorAll('[data-bkx]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.bkx;if(!await ask('Xóa bản sao trên máy này?',{title:'Xóa bản sao',ok:'Xóa'}))return;const z=bkAutos();z.splice(i,1);bkSaveAutos(z);backupPage()});
 $('bk_file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;let o;try{o=JSON.parse(await f.text())}catch(x){return alert('File sao lưu không hợp lệ.')}if(!o||!['KTX_HOC_MON_BACKUP_V1','KTX_HOC_MON_CLOUD_BACKUP_V1'].includes(o.format)||!o.data)return alert('Không đúng định dạng sao lưu KTX Hóc Môn.');$('bk_restore_info').innerHTML=`<div class="bkstatus wn"><b>${esc(f.name)}</b><div style="margin-top:4px">${esc(o.format==='KTX_HOC_MON_BACKUP_V1'?bkSummary(o):cloudBkFmtSummary(cloudBkSummaryObj(o)))}</div><div class="mut" style="margin-top:3px">Tạo lúc: ${esc(o.createdLocal||o.createdAt||'')}</div><button class="btn r sm" id="bk_restore" style="margin-top:10px">Khôi phục dữ liệu này</button></div>`;$('bk_restore').onclick=async()=>{alert('Tạm khóa khôi phục từ file để ngăn ghi đè hoặc xóa dữ liệu Supabase bằng bản sao cũ. Chỉ hỗ trợ tải và kiểm tra bản sao cho tới khi có giao dịch khôi phục nguyên tử.');return;if(!await ask('Khôi phục từ file sẽ thay thế dữ liệu hiện tại. Tiếp tục?',{title:'Bước 1/2 · Xác nhận',ok:'Tiếp tục'}))return;if(!await ask('Xác nhận lần cuối việc khôi phục từ file?',{title:'Bước 2/2 · Khôi phục',ok:'Khôi phục'}))return;try{if(cloudBkAdmin())await cloudBkCreate('pre_restore','Trước khôi phục từ file',true);if(o.format==='KTX_HOC_MON_CLOUD_BACKUP_V1')cloudBkApplySnapshot(o);else{const d=o.data;if(Array.isArray(d.workers))W=d.workers;if(Array.isArray(d.archive))ARC=d.archive;if(Array.isArray(d.logs))LOG=d.logs;if(Array.isArray(d.attendance))ATT=d.attendance;if(Array.isArray(d.registrations))REG=d.registrations;if(d.settings&&typeof d.settings==='object')Object.entries(d.settings).forEach(([k,v])=>{try{localStorage.setItem(k,v)}catch(e){}})}sv();auditPush('RESTORE','Khôi phục dữ liệu từ file backup');if(cloudBkAdmin()){await cloudBkClearBusinessTables();SUPA_SYNC.hashes={};SUPA_SYNC.remoteIds={};await syncPushAll()}alert('Đã khôi phục dữ liệu. Trang sẽ tải lại.');location.reload()}catch(e){alert('Khôi phục không hoàn tất: '+(e.message||e))}}};cloudBkRenderList()};

// Tạo backup online tự động tối đa 1 lần/ngày khi Quản trị mở ứng dụng và Supabase đã sẵn sàng.
setTimeout(async()=>{try{if(cloudBkAdmin())await cloudBkAutoRun(false)}catch(e){console.warn('Auto cloud backup:',e)}},2800);

;
/* >>> Original: assets/js/modules/residency/script-21.js >>> */

/* STEP92 — Bước 4: lịch sử cư trú đầy đủ + xuất lịch sử */
const HISTORY_LABEL92={...HISTORY_LABEL81,TRANSFER_KTX:'Chuyển KTX',RESIDENCE_CLEAR:'Bỏ khai báo tạm trú',RESIDENCE_IMPORT:'Cập nhật tạm trú',AWAY_IMPORT:'Cập nhật tạm vắng',RESTORE:'Khôi phục',CHECKOUT:'Ra khỏi KTX'};
function historyClass92(tp){return tp==='TRANSFER_KTX'||tp==='MOVE'?'transfer':tp==='AWAY'||tp==='AWAY_IMPORT'||tp==='RETURN'?'away':String(tp||'').startsWith('RESIDENCE')?'res':tp==='CHECKOUT'?'out':tp==='RESTORE'?'restore':''}
function historySig92(h){return [h&&h.type||'',h&&h.at||'',h&&h.day||'',h&&h.detail||''].join('|')}
function residenceHistory92(w){
 const h=Array.isArray(w&&w.history)?w.history.map(x=>({...x})):[];
 if(w&&w.date&&!h.some(x=>x.type==='CHECKIN'))h.push({day:w.date,type:'CHECKIN',detail:`Vào ${K(w)} · ${D(w)} · P.${R(w)||'—'}`,actor:''});
 if(w&&w.tt&&!h.some(x=>String(x.type||'').startsWith('RESIDENCE')))h.push({day:w.tt,type:'RESIDENCE',detail:'Đã khai báo tạm trú',actor:''});
 if(w&&w.tv&&w.tv.from&&!h.some(x=>x.type==='AWAY'||x.type==='AWAY_IMPORT'))h.push({day:w.tv.from,type:'AWAY',detail:`Tạm vắng từ ${vn(w.tv.from)}${w.tv.to?' đến '+vn(w.tv.to):''}${w.tv.why?' · '+w.tv.why:''}`,actor:''});
 const seen=new Set();return h.filter(x=>{const s=historySig92(x);if(seen.has(s))return false;seen.add(s);return true}).sort((a,b)=>{const ta=Number(a.at)||Date.parse(a.day||'')||0,tb=Number(b.at)||Date.parse(b.day||'')||0;return tb-ta});
}
timelineItems=function(w){return residenceHistory92(w)};
function historyDateTime92(h){if(h&&h.at){const d=new Date(h.at);if(!isNaN(d))return d.toLocaleString('vi-VN')}return h&&h.day?vn(h.day):'—'}
function exportResidenceHistory92(w){
 const H=residenceHistory92(w);if(!H.length)return alert('Công nhân này chưa có lịch sử cư trú để xuất.');
 const aoa=[['LỊCH SỬ CƯ TRÚ CÔNG NHÂN'],['Họ và tên',w.name||''],['Mã NV',w.mnv||''],['CCCD',w.cccd||''],['KTX hiện tại',K(w)],['Dãy hiện tại',D(w)],['Phòng hiện tại',R(w)||''],[],['STT','Thời gian','Sự kiện','Chi tiết','Người thực hiện','Từ','Đến']];
 H.slice().reverse().forEach((h,i)=>{const fr=h.from?`${h.from.ktx||''} ${h.from.day||''} P.${h.from.room||'—'}`.trim():'',to=h.to?`${h.to.ktx||''} ${h.to.day||''} P.${h.to.room||'—'}`.trim():'';aoa.push([i+1,historyDateTime92(h),HISTORY_LABEL92[h.type]||h.type||'Sự kiện',h.detail||'',h.actor||'',fr,to])});
 const safe=String(w.name||'Cong_nhan').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_');return save(aoa,`Lich_su_cu_tru_${safe}_${ldy()}.xlsx`,'Lịch sử cư trú');
}
function residenceSummary92(H){const c=t=>H.filter(x=>t.includes(x.type)).length;return {all:H.length,move:c(['MOVE','TRANSFER_KTX']),away:c(['AWAY','AWAY_IMPORT']),res:c(['RESIDENCE','RESIDENCE_CLEAR','RESIDENCE_IMPORT']),out:c(['CHECKOUT','RESTORE'])}}
if(typeof view==='function'&&!window.__step92ViewWrapped){window.__step92ViewWrapped=true;const oldView92=view;view=function(w){oldView92(w);const cards=$('vb')&&[...$('vb').querySelectorAll('.vcd')],card=cards&&cards.find(c=>c.querySelector('.vs')&&c.querySelector('.vs').textContent.includes('Lịch sử cư trú'));if(!card)return;const H=residenceHistory92(w),S=residenceSummary92(H),tl=card.querySelector('.timeline');if(tl){tl.classList.add('res92-timeline');tl.innerHTML=H.length?H.map(x=>`<div class="tl-item"><b><span class="history-type ${historyClass92(x.type)}">${esc(HISTORY_LABEL92[x.type]||x.type||'Sự kiện')}</span>${esc(x.detail||'')}</b><span>${esc(historyDateTime92(x))}${x.actor?' · '+esc(x.actor):''}</span></div>`).join(''):'<div class="mut">Chưa có lịch sử cư trú.</div>'}let sm=card.querySelector('.res92-summary');if(!sm){sm=document.createElement('div');sm.className='res92-summary';const vs=card.querySelector('.vs');vs.insertAdjacentElement('afterend',sm)}sm.innerHTML=`<span>Tổng <b>${S.all}</b></span><span>Chuyển phòng/KTX <b>${S.move}</b></span><span>Tạm trú <b>${S.res}</b></span><span>Tạm vắng <b>${S.away}</b></span><span>Ra/Khôi phục <b>${S.out}</b></span>`;let ac=card.querySelector('.res92-actions');if(!ac){ac=document.createElement('div');ac.className='res92-actions';card.appendChild(ac)}ac.innerHTML=`<button class="btn sm" id="vHistExport92">Xuất lịch sử</button>`;const tr=$('vTransfer92');if(tr)tr.onclick=()=>{$('vdl').close();openTransfer(w)};const ex=$('vHistExport92');if(ex)ex.onclick=()=>exportResidenceHistory92(w)}}
// Đồng bộ riêng lịch sử cư trú của cả công nhân đang ở và hồ sơ đã chuyển ra.
if(typeof syncRows==='function'&&!window.__step92SyncRowsWrapped){window.__step92SyncRowsWrapped=true;const oldSyncRows92=syncRows;syncRows=function(kind){if(kind!=='resHistory')return oldSyncRows92(kind);const by=syncActor(),z=[],workers=new Map();W.forEach(w=>workers.set(String(w.id),w));ARC.forEach(a=>{if(a&&a.w&&a.w.id&&!workers.has(String(a.w.id)))workers.set(String(a.w.id),a.w)});workers.forEach(w=>residenceHistory92(w).forEach((h,i)=>z.push({record_id:`${w.id}_${h.at||h.day||i}_${syncHash(h)}`,worker_id:String(w.id),payload:syncClone(h),event_at:syncSafeISO(h.at||((h.day||ldy())+'T00:00:00+07:00'),Date.now()),updated_by:by})));return z}}
async function pullResidence92(){if(!SUPA_SYNC.ready||!SUPA_SYNC.session)return;try{const [statusRows,histRows]=await Promise.all([syncFetchAll(SYNC_TABLES.resStatus,'worker_id,payload'),syncFetchAll(SYNC_TABLES.resHistory,'record_id,worker_id,payload,event_at')]);const prevStatus=SUPA_SYNC.hashes.resStatus||{},prevHist=SUPA_SYNC.hashes.resHistory||{};const residenceChanged=Object.keys(prevStatus).length!==statusRows.length||Object.keys(prevHist).length!==histRows.length||statusRows.some(r=>prevStatus[String(r.worker_id)]!==syncHash(r.payload))||histRows.some(r=>prevHist[String(r.record_id)]!==syncHash(r.payload));SUPA_SYNC.remoteIds.resStatus=new Set(statusRows.map(r=>String(r.worker_id)));SUPA_SYNC.hashes.resStatus=Object.fromEntries(statusRows.map(r=>[String(r.worker_id),syncHash(r.payload)]));SUPA_SYNC.remoteIds.resHistory=new Set(histRows.map(r=>String(r.record_id)));SUPA_SYNC.hashes.resHistory=Object.fromEntries(histRows.map(r=>[String(r.record_id),syncHash(r.payload)]));const map=new Map();W.forEach(w=>map.set(String(w.id),w));ARC.forEach(a=>{if(a&&a.w&&a.w.id)map.set(String(a.w.id),a.w)});statusRows.forEach(r=>{const w=map.get(String(r.worker_id)),p=r.payload||{};if(w){if('tt'in p)w.tt=p.tt||'';if('tv'in p)w.tv=syncClone(p.tv||null)}});const g={};histRows.forEach(r=>(g[String(r.worker_id)]=g[String(r.worker_id)]||[]).push(syncClone(r.payload)));Object.entries(g).forEach(([id,H])=>{const w=map.get(id);if(!w)return;const merged=[...(Array.isArray(w.history)?w.history:[]),...H],seen=new Set();w.history=merged.filter(x=>{const s=historySig92(x);if(seen.has(s))return false;seen.add(s);return true}).sort((a,b)=>(Number(b.at)||Date.parse(b.day||'')||0)-(Number(a.at)||Date.parse(a.day||'')||0)).slice(0,300)});return residenceChanged}catch(e){console.warn('Không tải được lịch sử cư trú riêng:',e);return false}}
if(typeof syncPullAll==='function'&&!window.__step92PullWrapped){window.__step92PullWrapped=true;const oldPull92=syncPullAll;syncPullAll=async function(render=true){const before=window.__ktx65DataRevision||0;const result=await oldPull92(false);if(!result?.ok)return result;const residencyChanged=await pullResidence92();if(residencyChanged)window.__ktx65DataRevision=(window.__ktx65DataRevision||0)+1;if(render&&((window.__ktx65DataRevision||0)!==before))all();return result}}

;
/* >>> Original: assets/js/modules/overview/script-22.js >>> */

/* STEP94 — Dashboard “Việc cần xử lý” nâng cao */
const TODAY_RESOLVED94='ktx_today_resolved_v1';
function resolvedToday94(){try{return new Set(JSON.parse(localStorage.getItem(TODAY_RESOLVED94)||'[]'))}catch(e){return new Set()}}
function saveResolvedToday94(set){try{localStorage.setItem(TODAY_RESOLVED94,JSON.stringify([...set].slice(-12000)))}catch(e){}}
function issueLoc94(x){
  if(x&&x.w)return {ktx:K(x.w)||'',day:D(x.w)||'',room:String(R(x.w)||'')};
  const t=String(x&&x.title||''),m=t.match(/^(KTX\s*\d+)\s*·\s*(Dãy\s*\d+)\s*·\s*P\.\s*([^·\s]+)/i);
  return m?{ktx:m[1].replace(/KTX\s*/i,'KTX '),day:m[2].replace(/Dãy\s*/i,'Dãy '),room:m[3]}:{ktx:'',day:'',room:''};
}
function quickIssue94(x){
  if(!x)return;
  if(x.w){ if(x.category==='absence'){go('t6');return} edit(x.w); return; }
  const loc=issueLoc94(x);
  if(loc.ktx&&loc.day&&loc.room){const l=W.filter(w=>K(w)===loc.ktx&&D(w)===loc.day&&String(R(w)||'')===String(loc.room));openRoomDrawer(loc.ktx,loc.day,loc.room,l);return}
  if(x.category==='duplicate'){go('t2');return}
  go('alerts');
}
function renderTodayAdvanced94(){
  const box=document.querySelector('#home .today-box');if(!box)return;
  box.classList.add('today-advanced');
  const A=issueList(),rd=alertReadSet(),resolved=resolvedToday94(),live=new Set(A.map(alertSig));
  [...resolved].forEach(s=>{if(!live.has(s))resolved.delete(s)});saveResolvedToday94(resolved);
  const pending=A.filter(x=>!resolved.has(alertSig(x))),done=A.length-pending.length;
  const ktxs=[...new Set(A.map(x=>issueLoc94(x).ktx).filter(Boolean))].sort(num);
  const days=[...new Set(A.map(x=>issueLoc94(x).day).filter(Boolean))].sort(num);
  const rooms=[...new Set(A.map(x=>issueLoc94(x).room).filter(Boolean))].sort(num);
  const prev={k:box.dataset.tk94||'',d:box.dataset.td94||'',r:box.dataset.tr94||''};
  const filtered=pending.filter(x=>{const l=issueLoc94(x);return (!prev.k||l.ktx===prev.k)&&(!prev.d||l.day===prev.d)&&(!prev.r||String(l.room)===String(prev.r))});
  const sevRank={danger:0,warn:1,info:2};
  filtered.sort((a,b)=>{const au=rd.has(alertSig(a))?1:0,bu=rd.has(alertSig(b))?1:0;return au-bu+(sevRank[a.sev]??3)-(sevRank[b.sev]??3)||String(a.title).localeCompare(String(b.title),'vi')});
  const danger=pending.filter(x=>x.sev==='danger').length,warn=pending.filter(x=>x.sev==='warn').length,newN=pending.filter(x=>!rd.has(alertSig(x))).length;
  box.innerHTML=`<div class="today-adv-head"><strong>Việc cần xử lý hôm nay</strong><span class="today-kpi danger">${danger} ưu tiên cao</span><span class="today-kpi warn">${warn} cảnh báo</span><span class="today-kpi new">${newN} mới</span><span class="today-kpi done">${done} đã xử lý</span></div>
  <div class="today-adv-filters"><select id="todayK94"><option value="">Tất cả KTX</option>${ktxs.map(v=>`<option ${prev.k===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select id="todayD94"><option value="">Tất cả dãy</option>${days.map(v=>`<option ${prev.d===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select id="todayR94"><option value="">Tất cả phòng</option>${rooms.map(v=>`<option value="${esc(v)}" ${prev.r===v?'selected':''}>Phòng ${esc(v)}</option>`).join('')}</select><span class="mut" style="font-size:9.5px">Ưu tiên thông báo mới và mức độ nghiêm trọng.</span><button class="btn s sm today-open-center" id="todayCenter94">Mở Trung tâm cảnh báo</button></div>
  <div class="today-issue-list">${filtered.length?filtered.slice(0,30).map(x=>{const s=alertSig(x),l=issueLoc94(x),unread=!rd.has(s),meta=[ALERT_CATS81&&ALERT_CATS81[x.category]||x.category,l.ktx,l.day,l.room&&('P.'+l.room)].filter(Boolean).join(' · ');return `<div class="today-issue-row ${x.sev||''} ${unread?'unread':''}" data-today-sig="${esc(s)}"><i class="dot"></i><div class="today-issue-who"><div class="today-issue-title">${esc(x.title)}${unread?' <span style="color:#2f76e8">· Mới</span>':''}</div><div class="today-issue-meta">${esc(meta)}</div></div><div class="today-issue-detail">${esc(x.detail)}</div><div class="today-issue-actions"><button class="today-quick" data-today-quick="${esc(s)}">Xử lý nhanh</button><button class="today-resolve" data-today-resolve="${esc(s)}">Đã xử lý</button></div></div>`}).join(''):'<div class="today-empty">Không còn vấn đề cần xử lý theo bộ lọc hiện tại.</div>'}</div>`;
  const rerender=()=>{box.dataset.tk94=$('todayK94').value;box.dataset.td94=$('todayD94').value;box.dataset.tr94=$('todayR94').value;renderTodayAdvanced94()};
  ['todayK94','todayD94','todayR94'].forEach(id=>{const e=$(id);if(e)e.onchange=rerender});
  $('todayCenter94').onclick=()=>go('alerts');
  box.querySelectorAll('[data-today-resolve]').forEach(b=>b.onclick=e=>{e.stopPropagation();const set=resolvedToday94();set.add(b.dataset.todayResolve);saveResolvedToday94(set);renderTodayAdvanced94()});
  box.querySelectorAll('[data-today-quick]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=issueList().find(v=>alertSig(v)===b.dataset.todayQuick);quickIssue94(x)});
}
if(typeof home==='function'&&!window.__step94HomeWrapped){window.__step94HomeWrapped=true;const _home94=home;home=function(){_home94();renderTodayAdvanced94()}}
setTimeout(()=>{if(page==='home')renderTodayAdvanced94()},120);

;
/* >>> Original: assets/js/modules/overview/script-23.js >>> */

/* STEP95 — Tìm kiếm toàn hệ thống */
(function(){
 const box=document.getElementById('globalSearch'),q=document.getElementById('gsq'),panel=document.getElementById('gsp');
 if(!box||!q||!panel)return;
 const norm=v=>sa(String(v==null?'':v));
 const match=(hay,needle)=>norm(hay).includes(needle);
 function activeWorkerResults(needle){
   const scored=[];
   W.forEach(w=>{
     const vals=[w.name,w.mnv,w.cccd,w.sdt,w.unit,w.td,w.leader,K(w),D(w),R(w),w.tinh,w.addr,w.diachi];
     if(!vals.some(v=>match(v,needle)))return;
     let score=10;
     if(norm(w.mnv)===needle||norm(w.cccd)===needle||norm(w.sdt)===needle)score=0;
     else if(norm(w.name).startsWith(needle))score=1;
     else if(norm(w.name).includes(needle))score=2;
     else if(norm(w.unit).includes(needle))score=4;
     scored.push({w,score});
   });
   return scored.sort((a,b)=>a.score-b.score||String(a.w.name||'').localeCompare(String(b.w.name||''),'vi')).slice(0,14);
 }
 function archiveResults(needle){
   const out=[];
   ARC.forEach(a=>{const w=a&&a.w||{};const vals=[w.name,w.mnv,w.cccd,w.sdt,w.unit,K(w),D(w),R(w)];if(vals.some(v=>match(v,needle)))out.push({a,w})});
   return out.slice(0,5);
 }
 function roomResults(needle){
   const map=new Map();
   W.forEach(w=>{const k=K(w),d=D(w),r=R(w);if(!k||!d||!r)return;const key=[k,d,r].join('|');if(!map.has(key))map.set(key,{k,d,r,list:[]});map.get(key).list.push(w)});
   const out=[];
   map.forEach(x=>{const label=`${x.k} ${x.d} phòng ${x.r} p.${x.r}`;if(match(label,needle)||norm(x.r)===needle){out.push(x)}});
   return out.sort((a,b)=>num(a.k,b.k)||num(a.d,b.d)||num(a.r,b.r)).slice(0,8);
 }
 function pageResults(needle){
   const deny=new Set(['t3','t4']);
   return Object.entries(T).filter(([id,v])=>!deny.has(id)&&match(v[0]+' '+v[1]+' '+(GN[id]||''),needle)).filter(([id])=>!(id==='acc'&&!can('acct'))&&!(id==='backup'&&!can('backup'))).slice(0,6);
 }
 function openPanel(){panel.classList.add('open');panel.setAttribute('aria-hidden','false')}
 function closePanel(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true')}
 function render(){
   const needle=norm(q.value.trim());
   if(needle.length<2){panel.innerHTML='<div class="gs-empty">Nhập ít nhất 2 ký tự để tìm công nhân, phòng hoặc chức năng.</div><div class="gs-hint">Mẹo: nhấn Ctrl + K để tìm nhanh ở bất kỳ trang nào.</div>';openPanel();return}
   const A=activeWorkerResults(needle),AR=archiveResults(needle),RR=roomResults(needle),PR=pageResults(needle);
   let h='';
   if(A.length){h+='<div class="gs-section">Công nhân đang lưu trú</div>'+A.map(({w})=>`<button class="gs-result" data-gsw="${esc(w.id)}"><span class="gs-ico">${esc((w.name||'?').trim().charAt(0).toUpperCase())}</span><span class="gs-main"><span class="gs-name">${esc(w.name||'')}</span><span class="gs-meta">${esc(w.mnv||'Chưa mã')} · ${esc(K(w))} · ${esc(D(w))} · P.${esc(R(w)||'—')} · ${esc(w.unit||'Chưa đơn vị')}</span></span><span class="gs-tag">Hồ sơ</span></button>`).join('')}
   if(RR.length){h+='<div class="gs-section">Phòng</div>'+RR.map((x,i)=>`<button class="gs-result" data-gsr="${i}"><span class="gs-ico room">P</span><span class="gs-main"><span class="gs-name">${esc(x.k)} · ${esc(x.d)} · Phòng ${esc(x.r)}</span><span class="gs-meta">${x.list.length}/${CAP} người · còn ${Math.max(0,CAP-x.list.length)} chỗ</span></span><span class="gs-tag">Phòng</span></button>`).join('')}
   if(AR.length){h+='<div class="gs-section">Điều chuyển · Nghỉ việc</div>'+AR.map(({a,w})=>`<button class="gs-result" data-gsa="${esc(a.id)}"><span class="gs-ico">${esc((w.name||'?').trim().charAt(0).toUpperCase())}</span><span class="gs-main"><span class="gs-name">${esc(w.name||'')}</span><span class="gs-meta">${esc(w.mnv||'Chưa mã')} · ${esc(a.reason||a.why||'Đã chuyển khỏi danh sách')}</span></span><span class="gs-tag archive">Lưu hồ sơ</span></button>`).join('')}
   if(PR.length){h+='<div class="gs-section">Chức năng</div>'+PR.map(([id,v])=>`<button class="gs-result" data-gspage="${esc(id)}"><span class="gs-ico page">⌘</span><span class="gs-main"><span class="gs-name">${esc(v[0])}</span><span class="gs-meta">${esc(v[1]||'')}</span></span><span class="gs-tag">${esc(GN[id]||'')}</span></button>`).join('')}
   if(!h)h='<div class="gs-empty">Không tìm thấy kết quả phù hợp.</div>';
   h+='<div class="gs-hint">Enter: mở kết quả đầu tiên · Esc: đóng tìm kiếm</div>';panel.innerHTML=h;openPanel();
   panel.querySelectorAll('[data-gsw]').forEach(b=>b.onclick=()=>{const w=W.find(x=>x.id===b.dataset.gsw);if(!w)return;closePanel();q.value='';view(w)});
   panel.querySelectorAll('[data-gsr]').forEach(b=>b.onclick=()=>{const x=RR[+b.dataset.gsr];if(!x)return;closePanel();q.value='';go('home');setTimeout(()=>openRoomDrawer(x.k,x.d,x.r,W.filter(w=>K(w)===x.k&&D(w)===x.d&&R(w)===x.r)),40)});
   panel.querySelectorAll('[data-gsa]').forEach(b=>b.onclick=()=>{closePanel();q.value='';go('arc');setTimeout(()=>{const row=document.querySelector(`#arc [data-arid="${CSS.escape(b.dataset.gsa)}"]`);if(row)row.scrollIntoView({behavior:'smooth',block:'center'})},80)});
   panel.querySelectorAll('[data-gspage]').forEach(b=>b.onclick=()=>{closePanel();q.value='';go(b.dataset.gspage)});
 }
 q.addEventListener('input',render);q.addEventListener('focus',render);
 q.addEventListener('keydown',e=>{if(e.key==='Escape'){closePanel();q.blur();return}if(e.key==='Enter'){const first=panel.querySelector('.gs-result');if(first){e.preventDefault();first.click()}}});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();q.focus();q.select();render()}});
 document.addEventListener('click',e=>{if(!box.contains(e.target))closePanel()});
})();

;
/* >>> Original: assets/js/modules/reports/script-24.js >>> */

/* STEP96 — Trung tâm báo cáo */
let RC96={type:'summary',preset:'month',ktx:'',from:'',to:''};
const RC96_TYPES={
 summary:['Tổng hợp vận hành','Quân số, công suất, chỗ trống, hồ sơ và tạm vắng'],
 movement:['Tăng · giảm nhân sự','Công nhân vào KTX và chuyển ra trong khoảng ngày'],
 rooms:['Công suất phòng','Sĩ số, chỗ trống, đầy và quá tải từng phòng'],
 residence:['Tạm trú · Tạm vắng','Trạng thái tạm trú và tạm vắng của công nhân'],
 incomplete:['Hồ sơ chưa đầy đủ','Thiếu CCCD, SĐT, ngày sinh hoặc chưa phân phòng'],
 overload:['Phòng quá tải','Danh sách phòng có trên 20 người'],
 units:['Đơn vị · Tiểu đoàn','Thống kê quân số theo đơn vị và tiểu đoàn']
};
function rc96Today(){return ldy()}
function rc96Range(p){const now=new Date(),d=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');if(p==='today')return [d(now),d(now)];if(p==='week'){const x=new Date(now),day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);const y=new Date(x);y.setDate(y.getDate()+6);return[d(x),d(y)]}return [d(new Date(now.getFullYear(),now.getMonth(),1)),d(now)]}
function rc96InRange(v,a,b){v=String(v||'').slice(0,10);return !!v&&(!a||v>=a)&&(!b||v<=b)}
function rc96Base(){return RC96.ktx?W.filter(w=>K(w)===RC96.ktx):W.slice()}
function rc96Arc(){return RC96.ktx?ARC.filter(a=>K(a.w)===RC96.ktx):ARC.slice()}
function rc96Data(){
 const L=rc96Base(),A=rc96Arc(),rs=rooms(L),from=RC96.from,to=RC96.to,t=RC96.type,nf=n=>Number(n||0).toLocaleString('vi-VN');
 let title=RC96_TYPES[t][0],headers=[],rows=[],lines=[];
 if(t==='summary'){
   const free=rs.reduce((s,r)=>s+Math.max(0,CAP-r.n),0),over=rs.filter(r=>r.n>CAP).length,tt=L.filter(w=>w.tt).length,away=L.filter(w=>isAwayOn(w)).length,missing=L.filter(w=>!w.cccd||!w.sdt||!w.dob||!R(w)).length,inc=L.filter(w=>rc96InRange(w.date,from,to)).length,dec=A.filter(a=>rc96InRange(a.date,from,to)).length;
   headers=['Chỉ tiêu','Giá trị'];rows=[['Tổng công nhân',L.length],['Nam',L.filter(w=>isNam(w.gt)).length],['Nữ',L.filter(w=>isNu(w.gt)).length],['Phòng có dữ liệu',rs.length],['Chỗ trống',free],['Phòng quá tải',over],['Đã khai báo tạm trú',tt],['Đang tạm vắng',away],['Hồ sơ chưa đầy đủ',missing],['Tăng trong kỳ',inc],['Giảm trong kỳ',dec]];
 }else if(t==='movement'){
   headers=['Loại','Ngày','Họ và tên','Mã NV','KTX','Dãy','Phòng','Lý do/Ghi chú'];
   const inc=L.filter(w=>rc96InRange(w.date,from,to)).map(w=>['Tăng',String(w.date||'').slice(0,10),w.name,w.mnv,K(w),D(w),R(w),'Vào KTX']);
   const dec=A.filter(a=>rc96InRange(a.date,from,to)).map(a=>['Giảm',String(a.date||'').slice(0,10),a.w&&a.w.name,a.w&&a.w.mnv,K(a.w),D(a.w),R(a.w),a.reason||a.note||'Chuyển ra']);rows=[...inc,...dec].sort((a,b)=>String(a[1]).localeCompare(String(b[1]))||String(a[2]).localeCompare(String(b[2]),'vi'));
 }else if(t==='rooms'){
   headers=['KTX','Dãy','Phòng','Sĩ số','Định mức','Chỗ trống','Công năng','Trạng thái'];rows=rs.sort((a,b)=>num(a.ktx,b.ktx)||num(a.day,b.day)||num(a.room,b.room)).map(r=>[r.ktx,r.day,r.room,r.n,CAP,Math.max(0,CAP-r.n),roomTypeText(roomMode(r.ktx,r.day,r.room,r.l)),r.n>CAP?'Quá tải':r.n===CAP?'Đầy':'Còn trống']);
 }else if(t==='residence'){
   headers=['Họ và tên','Mã NV','KTX','Dãy','Phòng','Tạm trú','Tạm vắng từ','Tạm vắng đến','Lý do'];rows=L.map(w=>[w.name,w.mnv,K(w),D(w),R(w),w.tt?vn(w.tt):'Chưa khai báo',w.tv?vn(w.tv.from):'',w.tv?vn(w.tv.to):'',w.tv?w.tv.why||'':'']);
 }else if(t==='incomplete'){
   headers=['Họ và tên','Mã NV','KTX','Dãy','Phòng','CCCD','SĐT','Ngày sinh','Thiếu thông tin'];rows=L.map(w=>{const m=[];if(!String(w.cccd||'').trim())m.push('CCCD');if(!String(w.sdt||'').trim())m.push('SĐT');if(!String(w.dob||'').trim())m.push('Ngày sinh');if(!String(R(w)||'').trim())m.push('Phòng');return [w.name,w.mnv,K(w),D(w),R(w),w.cccd,w.sdt,vn(w.dob),m.join(', ')]}).filter(r=>r[8]);
 }else if(t==='overload'){
   headers=['KTX','Dãy','Phòng','Sĩ số','Định mức','Vượt','Công năng'];rows=rs.filter(r=>r.n>CAP).sort((a,b)=>b.n-a.n).map(r=>[r.ktx,r.day,r.room,r.n,CAP,r.n-CAP,roomTypeText(roomMode(r.ktx,r.day,r.room,r.l))]);
 }else if(t==='units'){
   headers=['Đơn vị','Tiểu đoàn','Số công nhân','Nam','Nữ'];const m=new Map();L.forEach(w=>{const u=(w.unit||'Chưa rõ').trim()||'Chưa rõ',td=(w.td||'Chưa rõ').trim()||'Chưa rõ',k=u+'|'+td;if(!m.has(k))m.set(k,{u,td,n:0,m:0,f:0});const x=m.get(k);x.n++;isNu(w.gt)?x.f++:x.m++});rows=[...m.values()].sort((a,b)=>b.n-a.n||a.u.localeCompare(b.u,'vi')).map(x=>[x.u,x.td,x.n,x.m,x.f]);
 }
 lines=[title,`Kỳ báo cáo: ${vn(from)} - ${vn(to)}`,RC96.ktx?`Phạm vi: ${RC96.ktx}`:'Phạm vi: Tất cả KTX','',...rows.map(r=>r.map((v,i)=>`${headers[i]}: ${v==null?'':v}`).join(' | '))];
 return {title,headers,rows,lines,count:rows.length};
}
function rc96FileSlug(s){return sa(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'bao-cao'}
function rc96SetPreset(p){RC96.preset=p;const [a,b]=rc96Range(p);RC96.from=a;RC96.to=b;managementReportsPage()}
function rc96Preview(){const d=rc96Data(),pv=$('rc96Preview');if(!pv)return;pv.innerHTML=`<div class="rc96-preview-head"><b>${esc(d.title)}</b><span>${d.count.toLocaleString('vi-VN')} dòng · ${vn(RC96.from)} → ${vn(RC96.to)}</span></div><div class="wrap"><table><thead><tr>${d.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${d.rows.slice(0,300).map(r=>`<tr>${r.map(v=>`<td>${esc(v==null?'':String(v))}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${d.headers.length}" class="mut">Không có dữ liệu phù hợp.</td></tr>`}</tbody></table></div>${d.rows.length>300?`<div class="mut" style="padding:7px 10px">Hiển thị 300/${d.rows.length.toLocaleString('vi-VN')} dòng. File xuất chứa đầy đủ dữ liệu.</div>`:''}`}
function rc96PrintPdf(){const d=rc96Data(),w=window.open('','_blank');if(!w)return alert('Trình duyệt đang chặn cửa sổ in. Hãy cho phép pop-up rồi thử lại.');const css=`body{font-family:Arial,sans-serif;color:#172b4d;padding:24px}h1{font-size:20px;margin:0 0 5px}p{font-size:11px;color:#65758b}table{border-collapse:collapse;width:100%;font-size:10px;margin-top:14px}th,td{border:1px solid #cfd8e5;padding:5px;text-align:left}th{background:#eef4fb}@page{size:A4 landscape;margin:12mm}`;w.document.write(`<html><head><title>${esc(d.title)}</title><style>${css}</style>
<style id="step120css">
.sys-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.sys-kpi{background:#fff;border:1px solid #e4eaf2;border-radius:14px;padding:12px}.sys-kpi span{display:block;font-size:9px;color:#6b7b90;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.sys-kpi b{display:block;font-size:22px;color:#18324f;margin:4px 0}.sys-kpi small{font-size:9px;color:#718096}.sys-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:12px}.sys-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}.sys-head h3{margin:0}.sys-actions{display:flex;gap:7px;flex-wrap:wrap}.sys-list{display:grid;gap:7px}.sys-row{display:grid;grid-template-columns:110px 110px minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 10px;border:1px solid #e8edf4;border-radius:11px;background:#fff;font-size:10px}.sys-row time{font-size:9px;color:#6e7d91}.sev{display:inline-flex;padding:3px 7px;border-radius:999px;font-size:8px;font-weight:800}.sev.high{background:#fee8ea;color:#b42333}.sev.warn{background:#fff2d7;color:#a56000}.sev.info{background:#e9f2ff;color:#2368b2}.sev.ok{background:#e6f6ed;color:#19724a}.sys-note{font-size:9px;line-height:1.55;color:#65758b;background:#f7f9fc;border:1px solid #e4eaf2;border-radius:10px;padding:10px}.check-row{display:grid;grid-template-columns:28px minmax(0,1fr) 110px;gap:8px;align-items:start;padding:9px 0;border-bottom:1px solid #edf1f6;font-size:10px}.check-row:last-child{border-bottom:0}.check-row input{width:16px;height:16px}.release-hero{background:linear-gradient(135deg,#edf6ff,#f6fbff);border:1px solid #d7e7f8;border-radius:18px;padding:18px}.release-hero h2{margin:0 0 5px;color:#17395e}.release-badge{display:inline-flex;padding:4px 9px;border-radius:999px;background:#dff3e9;color:#19724a;font-size:9px;font-weight:800}.mini-bars{display:grid;gap:7px}.mini-bar{display:grid;grid-template-columns:130px 1fr 48px;gap:8px;align-items:center;font-size:9px}.mini-bar i{height:7px;background:#e9eef5;border-radius:99px;overflow:hidden;position:relative}.mini-bar i:after{content:'';position:absolute;inset:0;width:var(--w);background:#7ca8d5;border-radius:99px}.ops-tasks{display:grid;gap:7px}.ops-task{display:flex;gap:8px;align-items:flex-start;padding:9px;border:1px solid #e7ecf2;border-radius:10px}.ops-task b{display:block;font-size:10px}.ops-task small{display:block;color:#718096;font-size:9px;margin-top:2px}.pill-sm{display:inline-flex;padding:3px 7px;border-radius:999px;font-size:8px;font-weight:800;background:#eef3f8;color:#48627d}.pill-sm.hot{background:#fee8ea;color:#b42333}.pill-sm.warn{background:#fff2d7;color:#9b6100}.std-preview td,.std-preview th{font-size:9px}.maint-box{padding:10px;border:1px solid #e5ebf2;border-radius:11px;background:#fff;margin-bottom:8px}.maint-box b{font-size:11px}.maint-box small{display:block;font-size:9px;color:#718096;margin-top:3px}@media(max-width:1000px){.sys-kpis{grid-template-columns:repeat(2,1fr)}.sys-grid{grid-template-columns:1fr}}
</style>

<style id="auth-center-style">
.auth-gate2{position:fixed;inset:0;z-index:99999;background:linear-gradient(145deg,#edf4ff,#f8fbff);display:flex;align-items:center;justify-content:center;padding:24px}.auth-gate2.hide{display:none}.auth-card2{width:min(460px,94vw);background:#fff;border:1px solid #cfe0f6;border-radius:18px;box-shadow:0 24px 70px rgba(32,74,125,.18);padding:24px}.auth-brand2{display:flex;gap:12px;align-items:center;margin-bottom:16px}.auth-logo2{width:46px;height:46px;border-radius:13px;background:#2878ee;color:#fff;display:grid;place-items:center;font-size:22px}.auth-card2 h2{margin:0;color:#132a4b}.auth-card2 .mut{font-size:12px}.auth-tabs2{display:flex;gap:6px;margin:14px 0}.auth-tabs2 button{flex:1;border:1px solid #d8e4f2;background:#f7faff;color:#45617f;border-radius:9px;padding:9px;font-weight:800;cursor:pointer}.auth-tabs2 button.on{background:#edf5ff;border-color:#8db9f4;color:#1767ca}.auth-field2{display:grid;gap:5px;margin:10px 0}.auth-field2 span{font-size:11px;font-weight:800;color:#4d6480}.auth-field2 input{height:40px;border:1px solid #cfdced;border-radius:9px;padding:0 11px;font:inherit}.auth-mainbtn2{width:100%;height:42px;border:0;border-radius:9px;background:#2176df;color:#fff;font-weight:850;cursor:pointer;margin-top:8px}.auth-msg2{min-height:18px;margin-top:8px;font-size:11px;color:#b13b4b}.auth-foot2{margin-top:12px;padding-top:10px;border-top:1px solid #e7edf5;font-size:10px;color:#72849b}.auth-userbar{display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid #dbe6f3;border-radius:9px;background:#fff;margin-top:8px}.auth-userbar b{font-size:10px}.auth-userbar small{display:block;color:#71839b;font-size:8.5px}.auth-userbar button{margin-left:auto;border:1px solid #d6e0ed;background:#fff;border-radius:7px;padding:5px 8px;color:#526b88;font-weight:750;cursor:pointer}.ac-toolbar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:10px}.ac-toolbar input,.ac-toolbar select{height:34px;border:1px solid #d5e1ef;border-radius:8px;background:#fff;padding:0 9px;font-size:10px}.ac-toolbar input{min-width:220px;flex:1}.ac-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}.ac-kpi{border:1px solid #dbe6f3;border-radius:11px;background:#fff;padding:10px}.ac-kpi span{display:block;font-size:8.5px;color:#71839b;font-weight:800;text-transform:uppercase}.ac-kpi b{font-size:18px;color:#15345e}.ac-account{display:grid;grid-template-columns:minmax(160px,1.4fr) 120px minmax(160px,1fr) 90px 100px;gap:7px;align-items:center;border:1px solid #dce6f2;border-radius:10px;padding:8px 9px;background:#fff;margin:6px 0}.ac-account.off{opacity:.66;background:#f8fafc}.ac-account input,.ac-account select{height:31px;border:1px solid #d5e0ec;border-radius:7px;padding:0 7px;font-size:9.5px;width:100%}.ac-id{font-size:8px;color:#7a8ba1;overflow:hidden;text-overflow:ellipsis}.ac-actions{display:flex;gap:4px;justify-content:flex-end}.ac-actions button{border:1px solid #d3deeb;background:#fff;border-radius:7px;padding:6px 8px;font-size:9px;font-weight:800;cursor:pointer}.ac-actions .save{color:#1469c7;border-color:#a8c9ef}.ac-request{display:grid;grid-template-columns:1.4fr 110px 1fr 110px;gap:7px;align-items:center;border-bottom:1px solid #e4ebf4;padding:8px 0}.sec-event{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #e7edf5;font-size:9.5px}.scope-note{font-size:9px;color:#6d819b;margin-top:4px}@media(max-width:900px){.ac-grid{grid-template-columns:repeat(2,1fr)}.ac-account{grid-template-columns:1fr 1fr}.ac-actions{justify-content:flex-start}}@media(max-width:560px){.ac-grid{grid-template-columns:1fr}.ac-account,.ac-request{grid-template-columns:1fr}}
</style>

<style id="step218-transfer-mobile">
/* STEP218: các quy tắc này được đặt cuối HEAD để ưu tiên hơn CSS cũ */
#transferDlg .transfer-room-card.tr218-disabled{opacity:.48!important;cursor:not-allowed!important;background:#f4f5f8!important;border-color:#dce2e9!important}
#transferDlg .transfer-room-card.tr218-empty{background:#eaf9f1!important;border-color:#a1dfb9!important}
#transferDlg .transfer-room-card.tr218-low{background:#fff6dd!important;border-color:#f3cd78!important}
#transferDlg .transfer-room-card.on{background:#e8f0ff!important;border:2px solid #286ef0!important;box-shadow:0 0 0 2px #286ef029!important}
#transferDlg .transfer-room-card span{overflow-wrap:normal!important;word-break:normal!important;line-height:1.25!important}
#transferDlg .transfer-room-card em{max-width:100%;white-space:normal!important;line-height:1.15!important}
#transferDlg .transfer-cap{white-space:normal!important;overflow-wrap:normal!important}
@media(max-width:700px){
 #transferDlg.transfer-pro-dialog{width:min(96vw,560px)!important;max-width:min(96vw,560px)!important;height:auto!important;max-height:94dvh!important;inset:0!important;margin:auto!important;border-radius:18px!important;overflow:hidden!important}
 #transferDlg .transfer-pro{padding:13px!important;gap:7px!important;max-height:94dvh!important;overflow-y:auto!important;display:flex!important;flex-direction:column!important}
 #transferDlg .ph h3{font-size:18px!important;line-height:1.3!important}
 #transferDlg .transfer-room-head{align-items:center!important;gap:5px!important;flex-wrap:wrap!important}
 #transferDlg .transfer-room-head>div{flex-wrap:wrap!important;gap:4px 9px!important}
 #transferDlg .transfer-room-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;overflow-y:auto!important;max-height:43dvh!important;flex:none!important;padding:2px!important}
 #transferDlg .transfer-room-card{padding:8px 6px!important;min-height:82px!important;max-height:none!important;border-radius:11px!important;box-sizing:border-box!important}
 #transferDlg .transfer-room-card strong{font-size:14px!important}
 #transferDlg .transfer-room-card span{font-size:11px!important}
 #transferDlg .transfer-room-card em{font-size:10px!important;padding:2px 5px!important}
 #transferDlg .transfer-selectors{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 #transferDlg .transfer-target-info{font-size:12px!important;padding:8px!important}
 #transferDlg .pf{position:sticky!important;bottom:0!important;background:#fff!important;padding:9px 0 4px!important;z-index:2!important;display:flex!important;gap:7px!important}
 #transferDlg .pf button{flex:1!important;min-width:0!important;font-size:12px!important;padding:10px 6px!important}
}
@media(max-width:350px){#transferDlg .transfer-room-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
</style>
<style>
/* STEP225: bố cục chuyển phòng gọn, tránh nút thao tác bị che */
#transferDlg.transfer-pro-dialog{width:min(720px,96vw)!important;max-height:min(94dvh,94vh)!important;overflow:hidden!important;padding:0!important}
#transferDlg .pd.transfer-pro{display:flex!important;flex-direction:column!important;max-height:min(94dvh,94vh)!important;overflow:hidden!important;padding:12px 16px 0!important;gap:7px!important}
#transferDlg .ph{flex-shrink:0!important;margin-bottom:3px!important}
#transferDlg .transfer-selectors{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
#transferDlg .transfer-selectors label{display:flex!important;flex-direction:row!important;align-items:center!important;gap:8px!important;min-width:0!important;font-size:12px!important;font-weight:700!important}
#transferDlg .transfer-selectors select{flex:1!important;min-width:0!important;height:34px!important;min-height:34px!important;padding:4px 8px!important;font-size:12px!important}
#transferDlg .transfer-room-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;overflow-y:auto!important;max-height:min(29dvh,228px)!important;min-height:0!important;padding:4px!important;align-content:start!important}
#transferDlg .transfer-room-card{min-height:63px!important;padding:5px 7px!important;border-radius:9px!important;gap:0!important;line-height:1.3!important}
#transferDlg .transfer-room-card strong{font-size:12px!important}
#transferDlg .transfer-room-card span,#transferDlg .transfer-room-card em{font-size:10px!important;line-height:1.3!important}
#transferDlg .transfer-current{padding:7px 9px!important;flex-shrink:0!important}
#transferDlg .transfer-room-head{gap:7px!important;flex-shrink:0!important}
#transferDlg .transfer-target-info{min-height:25px!important;padding:6px 8px!important;font-size:11px!important}
#transferDlg .transfer-note-label{flex-shrink:0!important;font-size:11px!important}
#transferDlg .transfer-note-label input{height:34px!important;min-height:34px!important}
#transferDlg .pf{position:sticky!important;bottom:0!important;z-index:10!important;background:var(--pn,#fff)!important;display:flex!important;justify-content:flex-end!important;gap:8px!important;margin:0 -16px!important;padding:10px 16px max(11px,env(safe-area-inset-bottom))!important;border-top:1px solid var(--ln,#dfe7f1)!important;flex-shrink:0!important}
#transferDlg .pf button{height:36px!important;min-height:36px!important;font-size:12px!important}
#transferDlg .transfer-empty-hint{grid-column:1/-1;font-size:12px;padding:12px;color:#845900;background:#fff8df;border-radius:8px}
.s225-config{margin:8px 0 0;padding:6px 0;border-top:1px solid #dbe4f1}
.s225-config-toggle{width:100%;background:transparent;border:0;color:#2864bc;padding:9px 6px;text-align:left;font:600 13px inherit;cursor:pointer}
.s225-config-toggle span{float:right}.s225-config-body[hidden]{display:none!important}
.s225-config-body{padding:8px;border-radius:10px;background:#f5f8fe;display:grid;gap:8px}
.s225-config-body label{font-size:12px;color:#415675;display:grid;gap:4px;font-weight:600}
.s225-config-body input{box-sizing:border-box;width:100%;padding:9px;border:1px solid #c6d8eb;border-radius:8px;font-size:13px}
.s225-config-save{background:#2469dc;border:0;border-radius:8px;color:#fff;padding:10px;font-weight:700}
#s225ConfigStatus{margin:0;font-size:11px;color:#465b7a}
@media(max-width:600px){
#transferDlg.transfer-pro-dialog{width:96vw!important;max-height:94dvh!important}
#transferDlg .pd.transfer-pro{max-height:94dvh!important;padding:10px 10px 0!important;gap:5px!important}
#transferDlg .ph h3{font-size:15px!important}
#transferDlg .transfer-room-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;max-height:min(30dvh,190px)!important;gap:5px!important}
#transferDlg .transfer-room-card{min-height:58px!important;padding:5px!important}
#transferDlg .transfer-selectors label{font-size:11px!important;gap:5px!important}
#transferDlg .transfer-selectors select{height:33px!important;min-height:33px!important;font-size:11px!important}
#transferDlg .pf{margin:0 -10px!important;padding:9px 10px max(12px,env(safe-area-inset-bottom))!important}
#transferDlg .pf button{flex:1!important;font-size:12px!important}
#transferDlg .transfer-room-head b{font-size:12px!important}
#transferDlg .transfer-cap{font-size:10px!important}
}
</style>
</head><body><h1>${esc(d.title)}</h1><p>Kỳ báo cáo: ${esc(vn(RC96.from))} - ${esc(vn(RC96.to))} · ${esc(RC96.ktx||'Tất cả KTX')}</p><table><tr>${d.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>${d.rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v==null?'':String(v))}</td>`).join('')}</tr>`).join('')}</table><!-- KTX-STABLE-101 · Production baseline -->
<!-- STEP105_PERFORMANCE_OPTIMIZATION -->



</body>
<style id="step131SystemGroupPackingStyle">
/* STEP131 — các cụm hệ thống bám sát từ trái sang phải, chỉ xuống hàng khi hết chiều ngang */
#sysfunc .sysfunc-wrap{
  display:flex!important;
  flex-flow:row wrap!important;
  width:100%!important;
  max-width:none!important;
  box-sizing:border-box!important;
  justify-content:flex-start!important;
  align-items:flex-start!important;
  align-content:flex-start!important;
  gap:10px!important;
}
#sysfunc .sysfunc-intro,
#sysfunc .sysfunc-footer{
  flex:0 0 100%!important;
  width:100%!important;
  max-width:none!important;
  box-sizing:border-box!important;
}
#sysfunc .sysfunc-group{
  flex:0 0 calc((100% - 30px)/4)!important;
  width:calc((100% - 30px)/4)!important;
  min-width:245px!important;
  max-width:none!important;
  box-sizing:border-box!important;
  margin:0!important;
}
#sysfunc .sysfunc-grid{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:7px!important;
}
#sysfunc .sysfunc-btn{width:100%!important;min-width:0!important}
@media(max-width:1180px){
  #sysfunc .sysfunc-group{
    flex-basis:calc((100% - 20px)/3)!important;
    width:calc((100% - 20px)/3)!important;
  }
}
@media(max-width:860px){
  #sysfunc .sysfunc-group{
    flex-basis:calc((100% - 10px)/2)!important;
    width:calc((100% - 10px)/2)!important;
    min-width:230px!important;
  }
}
@media(max-width:560px){
  #sysfunc .sysfunc-group{flex-basis:100%!important;width:100%!important;min-width:0!important}
  #sysfunc .sysfunc-grid{grid-template-columns:1fr!important}
}
</style>




<style id="step141-four-columns">
/* STEP141: 4 nhom nam ngang tren desktop, doc lap moi quy tac flex/grid cu. */
@media (min-width:1000px){
#sysfunc .sysfunc-wrap,
#sysfunc #sysfuncForcedContent{
 display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
 grid-auto-flow:row!important;gap:10px!important;align-items:stretch!important;
 width:100%!important;max-width:100%!important;
}
#sysfunc .sysfunc-wrap>.sysfunc-intro,
#sysfunc #sysfuncForcedContent>.sysfunc-intro,
#sysfunc .sysfunc-wrap>.sysfunc-footer,
#sysfunc #sysfuncForcedContent>.sysfunc-footer{grid-column:1/-1!important;width:100%!important}
#sysfunc .sysfunc-wrap>.sysfunc-group,
#sysfunc #sysfuncForcedContent>.sysfunc-group{
 grid-column:auto!important;grid-row:auto!important;display:block!important;
 flex:initial!important;flex-basis:auto!important;min-width:0!important;
 width:100%!important;max-width:100%!important;margin:0!important;
 padding:10px!important;align-self:stretch!important;
}
#sysfunc .sysfunc-group .sysfunc-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
#sysfunc .sysfunc-group .sysfunc-grid>.sysfunc-btn{width:100%!important;min-width:0!important;max-width:100%!important;min-height:42px!important;padding:7px!important;gap:6px!important}
#sysfunc .sysfunc-btn .sficon{width:23px!important;height:23px!important;flex:0 0 23px!important}
#sysfunc .sysfunc-btn b{font-size:9.4px!important;white-space:normal!important;overflow-wrap:anywhere!important}
}
@media (min-width:620px) and (max-width:999px){
#sysfunc .sysfunc-wrap,#sysfunc #sysfuncForcedContent{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
#sysfunc .sysfunc-wrap>.sysfunc-intro,#sysfunc .sysfunc-wrap>.sysfunc-footer,
#sysfunc #sysfuncForcedContent>.sysfunc-intro,#sysfunc #sysfuncForcedContent>.sysfunc-footer{grid-column:1/-1!important}
#sysfunc .sysfunc-group{width:100%!important;max-width:100%!important;min-width:0!important;flex-basis:auto!important}
}
</style>

<style id="step200-mobile-gesture-transfer">
@media(max-width:760px){
 html,body{overscroll-behavior-y:auto!important;touch-action:pan-y pan-x!important}
 body:not(.auth-locked):not(:has(dialog[open])){overflow-y:auto!important;height:auto!important;max-height:none!important}
 #mobile180{height:auto!important;max-height:none!important;overflow:visible!important;touch-action:pan-y!important}
 #mobile180 .mpage{height:auto!important;min-height:calc(100dvh - 175px);max-height:none!important;overflow:visible!important;touch-action:pan-y!important}
 #mobile180 .m196-qrbox{overflow:visible!important;max-height:none!important;touch-action:pan-y!important}
 #mobile180 #m196QrHost,#mobile180 #m196QrHost #qr,#mobile180 #m196QrHost #qb,#mobile180 #m196QrHost .card{max-height:none!important;overflow-y:visible!important;touch-action:pan-y!important}
 #mobile180 #m196QrHost input,#mobile180 #m196QrHost textarea,#mobile180 #m196QrHost select,#mobile180 input,#mobile180 textarea{touch-action:auto!important;pointer-events:auto!important;user-select:text!important;-webkit-user-select:text!important;font-size:16px!important}
 #mobile180 .mbottom{touch-action:pan-y!important}
 #transferDlg.transfer-pro-dialog{position:fixed!important;inset:env(safe-area-inset-top) 0 0!important;margin:auto 0 0!important;width:100vw!important;max-width:100vw!important;height:calc(100dvh - env(safe-area-inset-top))!important;max-height:calc(100dvh - env(safe-area-inset-top))!important;border-radius:20px 20px 0 0!important;overflow:hidden!important;box-shadow:0 -18px 65px rgba(13,46,97,.25)!important;border:0!important}
 #transferDlg .transfer-pro{height:100%!important;max-height:100%!important;overflow-y:auto!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding:17px 14px calc(90px + env(safe-area-inset-bottom))!important;gap:14px!important;display:block!important}
 #transferDlg .ph{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 0 12px!important;margin:0 0 14px!important;border-bottom:1px solid #e3eaf5!important}
 #transferDlg .ph h3{font-size:20px!important;line-height:1.2!important}
 #transferDlg #transferX{width:40px!important;height:40px!important;border-radius:12px!important}
 #transferDlg .transfer-current{border-radius:15px!important;padding:13px!important;background:linear-gradient(120deg,#edf5ff,#fff)!important;box-shadow:0 6px 15px rgba(24,71,131,.07)!important;margin-bottom:14px!important}
 #transferDlg .transfer-selectors{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-bottom:17px!important}
 #transferDlg .transfer-selectors select{height:45px!important;font-size:16px!important}
 #transferDlg .transfer-room-head{margin:12px 0!important}
 #transferDlg .transfer-room-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;overflow:visible!important;max-height:none!important;margin-bottom:15px!important}
 #transferDlg .transfer-room-card{min-height:89px!important;border:1px solid #d8e5f5!important;border-radius:14px!important;background:#fbfdff!important;padding:10px 8px!important;box-shadow:0 4px 12px rgba(22,65,114,.07)!important;touch-action:manipulation!important}
 #transferDlg .transfer-room-card.selected,#transferDlg .transfer-room-card.active{background:#e7f1ff!important;border:2px solid #1869ed!important;box-shadow:0 5px 15px rgba(24,105,237,.22)!important}
 #transferDlg .transfer-room-card strong{font-size:15px!important}
 #transferDlg .transfer-room-card span,#transferDlg .transfer-room-card em{font-size:10px!important}
 #transferDlg .transfer-target-info{background:#eef6ff!important;border-radius:14px!important;padding:13px!important;margin:14px 0!important}
 #transferDlg .transfer-note-label input{height:46px!important;font-size:16px!important}
 #transferDlg .pf{position:fixed!important;bottom:0!important;left:0!important;right:0!important;margin:0!important;padding:11px 14px calc(12px + env(safe-area-inset-bottom))!important;background:#fff!important;box-shadow:0 -5px 25px rgba(21,52,93,.14)!important;display:grid!important;grid-template-columns:1fr 1.65fr!important;z-index:999999!important}
 #transferDlg .pf .btn{min-height:48px!important;font-size:13px!important;border-radius:12px!important}
 #transferDlg .pf #transferGo{background:#1769ec!important;color:#fff!important}
}
@media(max-width:365px){#transferDlg .transfer-room-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
</style>

<style id="step212-mobile-qr-search">
@media(max-width:760px){
 #mobile180 #mobileFind{display:block!important;position:relative!important;z-index:20!important;pointer-events:auto!important;touch-action:auto!important;user-select:text!important;-webkit-user-select:text!important;font-size:16px!important;min-height:48px!important}
 #mobile180 .qr166-switch button{min-height:65px!important;touch-action:manipulation!important}
 #mobile180 #m196QrHost #at159camera,#mobile180 #m196QrHost #at159in,#mobile180 #m196QrHost #at159out{min-height:46px!important}
 #mobile180 #m196QrHost video{max-width:100%!important;height:auto!important}
}
</style>

<style id="step227-transfer-final">
/* Final transfer-only overrides: improve compact desktop and mobile presentation. */
#transferDlg.transfer-pro-dialog{width:min(760px,calc(100vw - 28px))!important;max-width:calc(100vw - 28px)!important;max-height:calc(100dvh - 44px)!important;overflow:hidden!important;box-sizing:border-box!important}
#transferDlg .transfer-pro{display:flex!important;flex-direction:column!important;gap:9px!important;max-height:calc(100dvh - 44px)!important;padding:13px 17px 12px!important;overflow-y:auto!important;box-sizing:border-box!important}
#transferDlg .ph{padding-bottom:8px!important}
#transferDlg .transfer-current{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:9px 12px!important;margin:0!important;min-width:0!important}
#transferDlg .tr227-location{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important;flex-wrap:wrap!important}
#transferDlg .tr227-location b{white-space:nowrap!important;font-size:11px!important;color:#16417b!important}
#transferDlg .tr227-location span{font-size:11px!important;color:#435f82!important;line-height:1.35!important}
#transferDlg .tr227-gender{margin-left:auto!important;white-space:nowrap!important;font-size:10px!important}
#transferDlg .transfer-selectors{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
#transferDlg .transfer-selectors label{display:flex!important;flex-direction:row!important;align-items:center!important;gap:9px!important;min-width:0!important;margin:0!important;font-weight:700!important;font-size:12px!important}
#transferDlg .transfer-selectors label select{flex:1!important;min-width:0!important;width:0!important;height:35px!important;min-height:35px!important;padding:5px 9px!important;font-size:12px!important}
#transferDlg .transfer-room-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;max-height:min(30dvh,205px)!important;overflow-y:auto!important;align-content:start!important;padding:2px!important}
#transferDlg .transfer-room-card{min-height:62px!important;padding:6px 8px!important;gap:0!important;border-radius:9px!important}
#transferDlg .transfer-room-card strong{font-size:12px!important}
#transferDlg .transfer-room-card span{font-size:10px!important;line-height:1.3!important;margin-top:1px!important}
#transferDlg .transfer-room-card em{font-size:9px!important;margin-top:3px!important;padding:2px 5px!important}
#transferDlg .transfer-target-info{min-height:27px!important;padding:6px 9px!important}
#transferDlg .transfer-note-label{gap:3px!important}
#transferDlg .transfer-note-label input{min-height:34px!important;height:34px!important}
#transferDlg .pf{position:sticky!important;bottom:0!important;z-index:4!important;background:#fff!important;margin-top:3px!important;padding:9px 0 5px!important;box-shadow:0 -4px 9px #fff!important;flex-shrink:0!important}
#transferDlg .pf .btn{min-height:37px!important;height:37px!important}
@media(max-width:700px){
 #transferDlg.transfer-pro-dialog{width:100vw!important;max-width:100vw!important;max-height:100dvh!important}
 #transferDlg .transfer-pro{height:100%!important;max-height:100%!important;gap:9px!important;padding:13px 13px calc(10px + env(safe-area-inset-bottom))!important;overflow-y:auto!important}
 #transferDlg .tr227-location{gap:4px 8px!important}
 #transferDlg .tr227-location span{font-size:10px!important}
 #transferDlg .transfer-selectors{gap:8px!important}
 #transferDlg .transfer-selectors label{gap:5px!important;font-size:11px!important}
 #transferDlg .transfer-selectors label select{height:34px!important;min-height:34px!important;font-size:11px!important;padding:4px 5px!important}
 #transferDlg .transfer-room-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;max-height:min(31dvh,205px)!important;gap:6px!important}
 #transferDlg .transfer-room-card{min-height:59px!important;padding:5px 7px!important}
 #transferDlg .pf{padding:9px 0 calc(9px + env(safe-area-inset-bottom))!important;margin-top:auto!important}
 #transferDlg .pf .btn{height:43px!important;min-height:43px!important}
}
@media(max-width:350px){#transferDlg .transfer-selectors{grid-template-columns:1fr!important}#transferDlg .transfer-room-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
</style>
<style id="ktx-step250-approved-worker-ui">
/* STEP250 - Approved enterprise UI for Worker Management; desktop only.
   Leave operational IDs/event listeners, mobile layouts, access control unchanged. */
@media (min-width:861px){
  body:has(#work:not(.hide)){background:#f2f7ff!important;color:#142d5b}
  body:has(#work:not(.hide)) main{background:linear-gradient(150deg,#f3f8ff 0%,#edf5ff 70%,#f8fbff 100%);min-width:0}
  body:has(#work:not(.hide)) nav{background:linear-gradient(180deg,#fff 0%,#f9fbff 100%)!important;border-right:1px solid #e2eafa!important;box-shadow:2px 0 18px #193f8c0a!important}
  body:has(#work:not(.hide)) nav button[data-p=work].active{background:#e8f2ff!important;color:#0861d8!important;border-color:#9cc9ff!important}
  body:has(#work:not(.hide)) nav button[data-p=work] .pill{background:#2381ff!important;color:white!important}
  #work:not(.hide)~*{--ktx250-pro:1}
  body:has(#work:not(.hide)) .top{gap:14px!important;padding:6px 0 18px!important;border-bottom:0!important;align-items:flex-start!important}
  body:has(#work:not(.hide)) .top>div:first-child{padding-top:5px;min-width:255px}
  body:has(#work:not(.hide)) #ttl{color:#102b5f!important;font-weight:800!important;letter-spacing:-.5px;font-size:clamp(23px,2vw,30px)!important;line-height:1.2}
  body:has(#work:not(.hide)) #sub{color:#7890b6!important;font-size:12px!important;margin-top:4px}
  body:has(#work:not(.hide)) #eb{color:#5a89dd!important;font-weight:800!important;letter-spacing:.08em;font-size:10px!important}
  body:has(#work:not(.hide)) #tools.top-actions{display:flex!important;gap:8px!important;row-gap:9px!important;justify-content:flex-end!important;align-items:center!important;max-width:calc(100% - 275px);padding:0!important}
  body:has(#work:not(.hide)) #tools .btn{min-height:39px!important;height:auto!important;max-width:none!important;padding:10px 13px!important;font:700 11px/1.25 'Be Vietnam Pro',system-ui,sans-serif!important;letter-spacing:0!important;border-radius:10px!important;white-space:nowrap!important;box-shadow:0 3px 10px #244b9f15,0 1px 1px #142f5c0b!important;transform:none!important;filter:none!important;text-shadow:none!important}
  body:has(#work:not(.hide)) #tools .btn .i{width:15px!important;height:15px!important;filter:none!important;stroke-width:2!important}
  body:has(#work:not(.hide)) #tools :is(#xt,#xw,#xr){background:#f7fbff!important;border:1px solid #bcd9ff!important;color:#075fdf!important}
  body:has(#work:not(.hide)) #tools :is(#fxb){background:#edfff8!important;border:1px solid #a9eacb!important;color:#068653!important}
  body:has(#work:not(.hide)) #tools #undoImport{background:#fffaf0!important;color:#b96000!important;border:1px solid #ffdf9d!important}
  body:has(#work:not(.hide)) #tools #aw{background:linear-gradient(135deg,#398fff,#1265e9)!important;color:#fff!important;border:1px solid #3c89f9!important;box-shadow:0 5px 15px #2469e83d!important}
  body:has(#work:not(.hide)) #tools :is(#bn,#wd){background:#f8f3ff!important;color:#7134db!important;border:1px solid #daccff!important}
  body:has(#work:not(.hide)) #tools #mnb2{background:#f5faff!important;color:#194f9c!important;border:1px solid #c1d7fa!important}
  body:has(#work:not(.hide)) #tools :is(#ds2,#dsall){background:#fff5f7!important;border:1px solid #ffc7d2!important;color:#d7294e!important}
  body:has(#work:not(.hide)) #tools .btn:hover:not(:disabled){filter:brightness(.99)!important;transform:translateY(-2px)!important;box-shadow:0 7px 17px #2555b527!important}
  body:has(#work:not(.hide)) #tools .btn:active:not(:disabled){transform:translateY(1px)!important;box-shadow:0 2px 5px #2555b51c!important}
  body:has(#work:not(.hide)) #tools .pill{box-shadow:none!important;border:0!important;background:#f48a10!important;color:#fff!important;padding:2px 6px!important}
  #work:not(.hide) .worker-panel{background:#fff!important;border:1px solid #e3ecfc!important;border-radius:18px!important;box-shadow:0 9px 27px #31609b0a!important;padding:16px!important;margin:0 0 17px!important}
  #work:not(.hide) .worker-filters{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;margin:0!important}
  #work:not(.hide) .worker-filters select{height:44px!important;min-width:0!important;border:1px solid #d7e6fa!important;border-radius:11px!important;color:#204473!important;background-color:#fff!important;font-size:12px!important;font-weight:600!important;box-shadow:0 1px 2px #1955a207!important;padding-left:13px!important}
  #work:not(.hide) .worker-search-row{display:grid!important;grid-template-columns:minmax(0,1fr) 43px!important;gap:8px!important;margin-top:11px!important}
  #work:not(.hide) .worker-search{border:1px solid #d7e6fa!important;border-radius:11px!important;background:#fff!important;box-shadow:none!important;min-width:0!important}
  #work:not(.hide) .worker-search input{height:43px!important;font-size:12px!important;color:#23466e!important}
  #work:not(.hide) #wrf{background:#f7fbff!important;color:#1468e8!important;border:1px solid #d6e6fc!important;border-radius:11px!important;box-shadow:none!important;height:43px!important}
  #work:not(.hide) #wl{background:#fff!important;border:1px solid #e0ebfb!important;border-radius:18px!important;box-shadow:0 9px 30px #31609b0b!important;padding:9px 9px 6px!important;overflow:hidden!important}
  #work:not(.hide) #wl .ktx250-worker-table-scroll{width:100%!important;overflow-x:auto!important;overflow-y:auto!important;max-height:calc(100dvh - 320px)!important;min-height:180px;scrollbar-color:#bdcef0 #f3f8ff;scrollbar-width:thin;border-radius:11px!important}
  #work:not(.hide) #wl .cmp2{width:100%!important;border-collapse:separate!important;border-spacing:0!important;background:#fff!important;font-size:11px!important;table-layout:auto!important}
  #work:not(.hide) #wl .cmp2 th{position:sticky!important;top:0!important;z-index:2!important;min-height:49px!important;background:linear-gradient(180deg,#f6faff,#eaf3ff)!important;border-top:0!important;border-bottom:1px solid #d6e6fc!important;border-right:1px solid #e8f0fc!important;color:#17417b!important;font-size:10px!important;font-weight:800!important;line-height:1.3!important;padding:12px 8px!important;white-space:normal!important;text-align:center!important;letter-spacing:0!important;box-shadow:none!important}
  #work:not(.hide) #wl .cmp2 :is(th,td):nth-child(3),#work:not(.hide) #wl .cmp2 :is(th,td):nth-child(14),#work:not(.hide) #wl .cmp2 :is(th,td):nth-child(15){text-align:left!important}
  #work:not(.hide) #wl .cmp2 td{height:54px!important;padding:9px 8px!important;vertical-align:middle!important;border-bottom:1px solid #e8eff9!important;background:#fff!important;color:#24416e!important;white-space:nowrap!important;font-size:11px!important;line-height:1.35!important;text-shadow:none!important;box-shadow:none!important}
  #work:not(.hide) #wl .cmp2 tr:nth-child(odd) td{background:#fbfdff!important}
  #work:not(.hide) #wl .cmp2 tr:hover td{background:#eef6ff!important}
  #work:not(.hide) #wl .cmp2 td.nm{min-width:136px!important;white-space:normal!important}
  #work:not(.hide) #wl .cmp2 td.nm .lk{color:#123264!important;font-size:11px!important;font-weight:800!important}
  #work:not(.hide) #wl .cmp2 td.wr{white-space:normal!important}
  #work:not(.hide) #wl .cmp2 td.ad{min-width:104px!important;max-width:170px!important}
  #work:not(.hide) #wl .cmp2 :is(.tag,.pl){box-shadow:none!important;text-shadow:none!important;transform:none!important;font-size:10px!important;font-weight:700!important;line-height:1.5!important;border-radius:8px!important;padding:3px 7px!important;white-space:nowrap!important}
  #work:not(.hide) #wl .cmp2 .tag.r{background:#ffe5eb!important;color:#d82c52!important;border:0!important}
  #work:not(.hide) #wl .cmp2 .tag.a{background:#fff1d6!important;color:#b76a00!important;border:0!important}
  #work:not(.hide) #wl .cmp2 .tag.g{background:#ddf8ed!important;color:#08895c!important;border:0!important}
  #work:not(.hide) #wl .cmp2 input[type=checkbox]{accent-color:#257afa!important;width:15px!important;height:15px!important}
  #work:not(.hide) #wl .ktx250-worker-footer{min-height:46px!important;padding:7px 7px 2px!important;border-top:1px solid #edf2fa!important;align-items:center!important}
  #work:not(.hide) #wl .ktx250-worker-footer .btn{background:#f8fbff!important;border:1px solid #d4e4fa!important;color:#165ec6!important;box-shadow:none!important;border-radius:9px!important}
  #work:not(.hide) #wl .ktx250-worker-footer select{border-radius:9px!important;border-color:#d4e4fa!important;background:#fff!important}
}
@media(max-width:860px){
  /* Keep normal mobile worker list behavior; do not shrink desktop table into vertical labels. */
  #work #wl .ktx250-worker-table-scroll{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch}
}

</style>
</html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},250)}
managementReportsPage=function(){
 if(!RC96.from||!RC96.to){const r=rc96Range(RC96.preset||'month');RC96.from=r[0];RC96.to=r[1]}
 const L=rc96Base(),rs=rooms(L),free=rs.reduce((s,r)=>s+Math.max(0,CAP-r.n),0),over=rs.filter(r=>r.n>CAP).length,missing=L.filter(w=>!w.cccd||!w.sdt||!w.dob||!R(w)).length,away=L.filter(w=>isAwayOn(w)).length,inc=L.filter(w=>rc96InRange(w.date,RC96.from,RC96.to)).length,dec=rc96Arc().filter(a=>rc96InRange(a.date,RC96.from,RC96.to)).length,ks=[...new Set(W.map(K).filter(Boolean))].sort(num);
 $('reports').innerHTML=`<div class="rc96-kpis"><div class="rc96-kpi"><span>Công nhân</span><b>${L.length.toLocaleString('vi-VN')}</b></div><div class="rc96-kpi good"><span>Chỗ trống</span><b>${free.toLocaleString('vi-VN')}</b></div><div class="rc96-kpi ${over?'bad':''}"><span>Phòng quá tải</span><b>${over}</b></div><div class="rc96-kpi ${missing?'warn':''}"><span>Hồ sơ thiếu</span><b>${missing.toLocaleString('vi-VN')}</b></div><div class="rc96-kpi"><span>Tăng trong kỳ</span><b>+${inc}</b></div><div class="rc96-kpi"><span>Giảm trong kỳ</span><b>${dec}</b></div></div>
 <div class="card"><div class="rc96-head"><div><h3>Trung tâm báo cáo</h3><div class="mut">Báo cáo ngày, tuần, tháng và các báo cáo vận hành KTX trong một nơi.</div></div><div class="rc96-presets"><button class="rc96-chip ${RC96.preset==='today'?'on':''}" data-rp96="today">Hôm nay</button><button class="rc96-chip ${RC96.preset==='week'?'on':''}" data-rp96="week">Tuần này</button><button class="rc96-chip ${RC96.preset==='month'?'on':''}" data-rp96="month">Tháng này</button></div></div>
 <div class="rc96-controls"><label>Từ ngày<input id="rc96From" type="date" value="${RC96.from}"></label><label>Đến ngày<input id="rc96To" type="date" value="${RC96.to}"></label><label>Phạm vi<select id="rc96Ktx"><option value="">Tất cả KTX</option>${ks.map(k=>`<option value="${esc(k)}" ${RC96.ktx===k?'selected':''}>${esc(k)}</option>`).join('')}</select></label><label>Loại báo cáo<select id="rc96Type">${Object.entries(RC96_TYPES).map(([id,v])=>`<option value="${id}" ${RC96.type===id?'selected':''}>${esc(v[0])}</option>`).join('')}</select></label><label>Ảnh chụp hiện tại<input value="${L.length.toLocaleString('vi-VN')} công nhân" readonly></label></div>
 <div class="rc96-types">${Object.entries(RC96_TYPES).map(([id,v])=>`<button class="rc96-type ${RC96.type===id?'on':''}" data-rt96="${id}"><b>${esc(v[0])}</b><span>${esc(v[1])}</span></button>`).join('')}</div>
 <div class="rc96-actions"><button class="btn" id="rc96Excel">Xuất Excel</button><button class="btn g" id="rc96Word">Xuất Word</button><button class="btn ta-violet" id="rc96Pdf">Xuất PDF</button><button class="btn ta-amber" id="rc96Daily">Xuất báo cáo quân số ngày</button><span class="mut" style="font-size:9px">PDF mở hộp thoại in của trình duyệt → chọn “Save as PDF”.</span></div>
 <div id="rc96Preview" class="rc96-preview"></div><div class="rc96-note">Các báo cáo công suất phòng, tạm trú/tạm vắng và hồ sơ là ảnh chụp dữ liệu hiện tại. Báo cáo tăng · giảm sử dụng khoảng ngày đã chọn. Định mức phòng cố định ${CAP} người/phòng.</div></div>`;
 document.querySelectorAll('[data-rp96]').forEach(b=>b.onclick=()=>rc96SetPreset(b.dataset.rp96));document.querySelectorAll('[data-rt96]').forEach(b=>b.onclick=()=>{RC96.type=b.dataset.rt96;managementReportsPage()});
 $('rc96From').onchange=e=>{RC96.from=e.target.value;RC96.preset='custom';rc96Preview()};$('rc96To').onchange=e=>{RC96.to=e.target.value;RC96.preset='custom';rc96Preview()};$('rc96Ktx').onchange=e=>{RC96.ktx=e.target.value;managementReportsPage()};$('rc96Type').onchange=e=>{RC96.type=e.target.value;managementReportsPage()};
 $('rc96Excel').onclick=()=>{const d=rc96Data();save([d.headers,...d.rows],`${rc96FileSlug(d.title)}_${RC96.from}_${RC96.to}.xlsx`,d.title.slice(0,31))};$('rc96Word').onclick=()=>{const d=rc96Data();saveDocx(d.lines,`${rc96FileSlug(d.title)}_${RC96.from}_${RC96.to}.docx`)};$('rc96Pdf').onclick=rc96PrintPdf;$('rc96Daily').onclick=()=>exportDailyReportDirect();rc96Preview();
}

;
/* >>> Original: assets/js/modules/overview/script-25.js >>> */

/* STEP97 */
(function(){
  const gs=document.getElementById('globalSearch'); if(gs) gs.remove();
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation()}},true);

  function sortIssues97(list){
    const rd=alertReadSet(),sev={danger:0,warn:1,info:2};
    return list.slice().sort((a,b)=>{
      const au=rd.has(alertSig(a))?1:0,bu=rd.has(alertSig(b))?1:0;
      if(au!==bu)return au-bu; // thông báo mới/chưa đọc lên đầu
      const as=sev[a.sev]??3,bs=sev[b.sev]??3;if(as!==bs)return as-bs;
      return String(a.title||'').localeCompare(String(b.title||''),'vi');
    });
  }
  const oldFiltered97=filteredIssues81;
  filteredIssues81=function(){return sortIssues97(oldFiltered97())};

  if(typeof home==='function'){
    const _home97=home;
    home=function(){_home97();document.querySelectorAll('#home .today-box').forEach(x=>x.remove())};
  }

  function alertCenter97(){
    const A=sortIssues97(issueList()),rd=alertReadSet(),U=A.filter(x=>!rd.has(alertSig(x))),L=filteredIssues81(),sevs=s=>A.filter(x=>x.sev===s).length;
    const resolved=typeof resolvedToday94==='function'?resolvedToday94():new Set();
    const live=new Set(A.map(alertSig)); if(resolved&&resolved.forEach) resolved.forEach(s=>{if(!live.has(s))resolved.delete(s)}); if(typeof saveResolvedToday94==='function')saveResolvedToday94(resolved);
    const pending=A.filter(x=>!resolved.has(alertSig(x))),done=A.length-pending.length;
    const danger=pending.filter(x=>x.sev==='danger').length,warn=pending.filter(x=>x.sev==='warn').length,newN=pending.filter(x=>!rd.has(alertSig(x))).length;
    const ktxs=[...new Set(A.map(x=>issueLoc94(x).ktx).filter(Boolean))].sort(num),days=[...new Set(A.map(x=>issueLoc94(x).day).filter(Boolean))].sort(num),roomVals=[...new Set(A.map(x=>issueLoc94(x).room).filter(Boolean))].sort(num);
    const f=window.__today97Filter||{k:'',d:'',r:''};
    const PL=pending.filter(x=>{const l=issueLoc94(x);return(!f.k||l.ktx===f.k)&&(!f.d||l.day===f.d)&&(!f.r||String(l.room)===String(f.r))});
    const todayRows=PL.slice(0,40).map(x=>{const s=alertSig(x),loc=issueLoc94(x),unread=!rd.has(s),meta=[ALERT_CATS81[x.category]||x.category,loc.ktx,loc.day,loc.room&&('P.'+loc.room)].filter(Boolean).join(' · ');return `<div class="today97-row ${x.sev||''} ${unread?'unread':''}"><i class="dot"></i><div><div class="today97-title">${esc(x.title)}${unread?' <span style="color:#2f76e8">· Mới</span>':''}</div><div class="today97-meta">${esc(meta)}</div></div><div class="today97-detail">${esc(x.detail)}</div><div class="today97-actions"><button class="today-quick" data-a97q="${esc(s)}">Xử lý nhanh</button><button class="today-resolve" data-a97r="${esc(s)}">Đã xử lý</button></div></div>`}).join('')||'<div class="today-empty">Không còn việc cần xử lý theo bộ lọc hiện tại.</div>';

    $('alerts').innerHTML=`<div class="alert-grid"><div class="alert-card danger"><span class="mut">CẦN XỬ LÝ NGAY</span><b>${sevs('danger')}</b></div><div class="alert-card warn"><span class="mut">CẢNH BÁO</span><b>${sevs('warn')}</b></div><div class="alert-card"><span class="mut">CHƯA ĐỌC</span><b>${U.length}</b></div><div class="alert-card ${A.length?'warn':'ok'}"><span class="mut">TỔNG VẤN ĐỀ</span><b>${A.length}</b></div></div>
    <div class="today97"><div class="today97-head"><strong>Việc cần xử lý hôm nay</strong><span class="today-kpi danger">${danger} ưu tiên cao</span><span class="today-kpi warn">${warn} cảnh báo</span><span class="today-kpi new">${newN} mới</span><span class="today-kpi done">${done} đã xử lý</span></div><div class="today97-filters"><select id="a97k"><option value="">Tất cả KTX</option>${ktxs.map(v=>`<option ${f.k===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select id="a97d"><option value="">Tất cả dãy</option>${days.map(v=>`<option ${f.d===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select id="a97r"><option value="">Tất cả phòng</option>${roomVals.map(v=>`<option value="${esc(v)}" ${String(f.r)===String(v)?'selected':''}>Phòng ${esc(v)}</option>`).join('')}</select><span class="mut" style="font-size:9.5px">Thông báo mới được ưu tiên hiển thị trước.</span></div><div class="today97-list">${todayRows}</div></div>
    <div class="card"><div class="row" style="margin-bottom:8px"><b>Danh sách cảnh báo</b><span class="mut" style="margin-left:auto">Thông báo mới hiển thị trên cùng</span><button class="btn s sm alert-read-all" id="alertReadAll">✓ Đã đọc tất cả</button></div><div class="alert-filterbar" id="alertFilters81">${alertFilterHtml81(A)}</div><div class="alert-search"><input id="alertQ81" placeholder="Tìm tên, nội dung cảnh báo..." value="${esc(ALERT_QUERY81)}"></div><div class="alert-list">${L.length?L.map(x=>{const unread=!rd.has(alertSig(x));return `<div class="alert-row ${x.sev} ${unread?'unread':''}"><i class="alert-dot"></i><div class="who">${esc(x.title)}${unread?' <span style="color:#2f76e8">· Mới</span>':''}<div><span class="aqd-cat">${esc(ALERT_CATS81[x.category]||x.category)}</span></div></div><div class="why">${esc(x.detail)}</div>${x.w?`<button class="btn s sm" data-alw="${esc(x.w.id)}">Sửa hồ sơ</button>`:'<span></span>'}</div>`}).join(''):'<div class="mut" style="padding:16px">Không có cảnh báo phù hợp bộ lọc.</div>'}</div></div>`;

    const ra=$('alertReadAll');if(ra){ra.disabled=!U.length;ra.onclick=markAllAlertsRead}
    $('alertFilters81').querySelectorAll('[data-af81]').forEach(b=>b.onclick=()=>{ALERT_FILTER81=b.dataset.af81;alertCenter97()});
    $('alertQ81').oninput=e=>{ALERT_QUERY81=e.target.value;alertCenter97()};
    ['a97k','a97d','a97r'].forEach(id=>$(id).onchange=()=>{window.__today97Filter={k:$('a97k').value,d:$('a97d').value,r:$('a97r').value};alertCenter97()});
    document.querySelectorAll('#alerts [data-alw]').forEach(b=>b.onclick=()=>{const w=W.find(x=>x.id===b.dataset.alw);if(w)edit(w)});
    document.querySelectorAll('#alerts [data-a97r]').forEach(b=>b.onclick=e=>{e.stopPropagation();const set=resolvedToday94();set.add(b.dataset.a97r);saveResolvedToday94(set);alertCenter97()});
    document.querySelectorAll('#alerts [data-a97q]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=issueList().find(v=>alertSig(v)===b.dataset.a97q);quickIssue94(x)});
  }
  alertCenterPage=alertCenter97;
  if(page==='home')home(); else if(page==='alerts')alertCenterPage();
})();

;
/* >>> Original: assets/js/modules/admin/script-26.js >>> */

/* STEP102 — Sức khỏe hệ thống */
const HEALTH_VERSION='KTX-v1.0.0';
function healthFmtBytes(n){n=Number(n)||0;if(n<1024)return n+' B';if(n<1048576)return (n/1024).toLocaleString('vi-VN',{maximumFractionDigits:1})+' KB';if(n<1073741824)return (n/1048576).toLocaleString('vi-VN',{maximumFractionDigits:1})+' MB';return (n/1073741824).toLocaleString('vi-VN',{maximumFractionDigits:2})+' GB'}
function healthLocalStorageBytes(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'',v=localStorage.getItem(k)||'';n+=(k.length+v.length)*2}}catch(e){}return n}
function healthDate(v){if(!v)return 'Chưa có';const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString('vi-VN'):'Không hợp lệ'}
async function healthCollect(refreshCloud=false){const x={};x.version=(document.querySelector('meta[name="app-version"]')||{}).content||HEALTH_VERSION;x.online=navigator.onLine!==false;x.localWorkers=W.length;x.localArchive=ARC.length;x.localLogs=LOG.length;x.localAtt=ATT.length;x.auth=!!(SUPA_SYNC&&SUPA_SYNC.session);x.syncReady=!!(SUPA_SYNC&&SUPA_SYNC.ready);x.syncEnabled=!!(SUPA_SYNC&&SUPA_SYNC.enabled);x.pending=!!(SUPA_SYNC&&SUPA_SYNC.pending);x.lastSync=SUPA_SYNC&&SUPA_SYNC.lastSync||0;x.lastError=SUPA_SYNC&&SUPA_SYNC.lastError||'';x.role=(SUPA_SYNC&&SUPA_SYNC.account&&SUPA_SYNC.account.role)||ME.role||'viewer';if(refreshCloud&&x.auth&&syncClient())try{await syncCloudCounts()}catch(e){x.cloudError=e.message||String(e)}x.cloud=Object.assign({},SUPA_SYNC&&SUPA_SYNC.counts||{});x.cloudWorkers=x.cloud.workers;x.localBytes=healthLocalStorageBytes();try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();x.storageUsage=e.usage||0;x.storageQuota=e.quota||0}}catch(e){}x.storagePct=x.storageQuota?Math.min(100,x.storageUsage/x.storageQuota*100):0;x.pwaStandalone=!!(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||!!navigator.standalone;x.swSupported='serviceWorker' in navigator;x.swActive=false;if(x.swSupported)try{const r=await navigator.serviceWorker.getRegistration();x.swActive=!!(r&&r.active)}catch(e){}x.localBackups=bkAutos().length;x.onlineBackups='—';x.latestBackup='Chưa kiểm tra';if(x.auth&&syncClient())try{const sb=syncClient();const {count,error}=await sb.from(CLOUD_BK_TABLE).select('*',{count:'exact',head:true});if(error)throw error;x.onlineBackups=count||0;const {data,error:er}=await sb.from(CLOUD_BK_TABLE).select('created_at').order('created_at',{ascending:false}).limit(1);if(er)throw er;x.latestBackup=data&&data[0]?healthDate(data[0].created_at):'Chưa có'}catch(e){x.backupError=e.message||String(e)}const delta=(typeof x.cloudWorkers==='number')?Math.abs(x.localWorkers-x.cloudWorkers):null;x.workerDelta=delta;let bad=0,warn=0;if(!x.online)bad++;if(x.lastError)bad++;if(x.syncEnabled&&!x.syncReady)bad++;if(x.syncEnabled&&typeof delta==='number'&&delta>0)warn++;if(!x.syncEnabled)warn++;if(!x.swActive)warn++;if(x.storagePct>=90)bad++;else if(x.storagePct>=75)warn++;if(x.onlineBackups===0)warn++;x.healthKind=bad?'bad':warn?'warn':'ok';x.healthText=bad?'Cần kiểm tra':warn?'Có mục cần chú ý':'Hệ thống ổn định';x.bad=bad;x.warn=warn;return x}
function healthStatusRow(kind,name,value){return `<div class="health-row ${kind}"><i></i><b>${esc(name)}</b><span>${value}</span></div>`}
async function systemHealthPage(refreshCloud=false){const el=$('health');if(!el)return;el.innerHTML='<div class="card"><div class="mut" style="padding:14px">Đang kiểm tra sức khỏe hệ thống...</div></div>';let h;try{h=await healthCollect(refreshCloud)}catch(e){el.innerHTML=`<div class="card"><h3>Không thể kiểm tra</h3><div class="health-error">${esc(e.message||e)}</div></div>`;return}const cloudW=typeof h.cloudWorkers==='number'?h.cloudWorkers.toLocaleString('vi-VN'):'—',delta=h.workerDelta==null?'Chưa kiểm tra':h.workerDelta===0?'Khớp':`Lệch ${h.workerDelta.toLocaleString('vi-VN')}`,storageLabel=h.storageQuota?`${healthFmtBytes(h.storageUsage)} / ${healthFmtBytes(h.storageQuota)}`:`localStorage ${healthFmtBytes(h.localBytes)}`,syncKind=!h.syncEnabled?'warn':h.syncReady&&!h.lastError?'ok':'bad',cloudKind=typeof h.cloudWorkers==='number'?(h.workerDelta===0?'ok':'warn'):(h.auth?'warn':'bad');el.innerHTML=`<div class="health-top"><div class="health-kpi ${h.healthKind}"><span>Tình trạng chung</span><b>${esc(h.healthText)}</b><small>${h.bad} lỗi · ${h.warn} mục cần chú ý</small></div><div class="health-kpi ${syncKind}"><span>Supabase</span><b>${h.syncEnabled?'Đồng bộ '+(h.syncReady?'ON':'LỖI'):'Chưa bật'}</b><small>${h.lastSync?'Gần nhất '+healthDate(h.lastSync):'Chưa đồng bộ trong phiên'}</small></div><div class="health-kpi ${cloudKind}"><span>Công nhân Local / Cloud</span><b>${h.localWorkers.toLocaleString('vi-VN')} / ${cloudW}</b><small>${delta}</small></div><div class="health-kpi ${h.onlineBackups===0?'warn':'ok'}"><span>Backup online</span><b>${h.onlineBackups}</b><small>${esc(h.latestBackup)}</small></div></div><div class="health-grid"><div class="card health-card"><div class="health-head"><h3>Kiểm tra các thành phần</h3><div class="health-actions"><button class="btn" id="healthRefresh">Kiểm tra lại</button><button class="btn g" id="healthSync">Đồng bộ ngay</button></div></div><div class="health-status">${healthStatusRow(h.online?'ok':'bad','Kết nối Internet',h.online?'Đang online':'Mất kết nối mạng')}${healthStatusRow(h.auth?'ok':'bad','Supabase Auth',h.auth?`Đã đăng nhập · ${esc(ROLES[h.role]||h.role)}`:'Chưa đăng nhập')}${healthStatusRow(syncKind,'Đồng bộ tự động',h.syncEnabled?(h.syncReady?'Đang hoạt động':'Đang bật nhưng chưa sẵn sàng'):'Đang tắt')}${healthStatusRow(cloudKind,'Đối chiếu công nhân',`Local ${h.localWorkers.toLocaleString('vi-VN')} · Cloud ${cloudW} · ${esc(delta)}`)}${healthStatusRow(h.pending?'warn':'ok','Thay đổi chờ gửi',h.pending?'Có dữ liệu đang chờ đồng bộ':'Không có dữ liệu chờ gửi')}${healthStatusRow(h.swActive?'ok':'warn','Service Worker / PWA',h.swSupported?(h.swActive?(h.pwaStandalone?'Đang hoạt động · chế độ ứng dụng':'Đang hoạt động'):'Trình duyệt hỗ trợ nhưng Service Worker chưa active'):'Trình duyệt không hỗ trợ Service Worker')}${healthStatusRow(h.storagePct>=90?'bad':h.storagePct>=75?'warn':'ok','Dung lượng trình duyệt',`${storageLabel}${h.storageQuota?` · ${h.storagePct.toLocaleString('vi-VN',{maximumFractionDigits:1})}%`:''}`)}${healthStatusRow(h.onlineBackups==='—'?'warn':h.onlineBackups>0?'ok':'warn','Backup',`Online: ${h.onlineBackups} · Trên máy: ${h.localBackups}`)}</div></div><div><div class="health-summary"><div class="health-score ${h.healthKind}"><i></i><div><b>${esc(h.healthText)}</b><small>Tự kiểm tra tại ${new Date().toLocaleString('vi-VN')}</small></div></div><div class="health-mini"><div><span>Phiên bản</span><b>${esc(h.version)}</b></div><div><span>Vai trò</span><b>${esc(ROLES[h.role]||h.role)}</b></div><div><span>LocalStorage</span><b>${healthFmtBytes(h.localBytes)}</b></div><div><span>Nhật ký</span><b>${h.localLogs.toLocaleString('vi-VN')}</b></div></div>${h.storageQuota?`<div class="health-note">Dung lượng trình duyệt</div><div class="health-storage"><i style="width:${Math.max(1,h.storagePct)}%"></i></div>`:''}${h.lastError?`<div class="health-error"><b>Lỗi đồng bộ gần nhất</b><br>${esc(h.lastError)}</div>`:''}${h.cloudError?`<div class="health-error"><b>Lỗi kiểm tra cloud</b><br>${esc(h.cloudError)}</div>`:''}${h.backupError?`<div class="health-error"><b>Lỗi đọc backup</b><br>${esc(h.backupError)}</div>`:''}<div class="health-note">Trang này chỉ kiểm tra trạng thái, không tự thay đổi dữ liệu. Nếu Local/Cloud bị lệch, hãy mở Đồng bộ Supabase để kiểm tra trước khi tải hoặc đẩy dữ liệu.</div></div><div class="card" style="margin-top:12px"><h3>Đi đến chức năng</h3><div class="health-actions"><button class="btn s" id="healthGoSync">Đồng bộ Supabase</button><button class="btn s" id="healthGoBackup">Sao lưu dữ liệu</button><button class="btn s" id="healthGoLog">Nhật ký hệ thống</button></div></div></div></div>`;$('healthRefresh').onclick=()=>systemHealthPage(true);$('healthGoSync').onclick=()=>go('sync');$('healthGoBackup').onclick=()=>go('backup');$('healthGoLog').onclick=()=>go('log');$('healthSync').onclick=async()=>{if(!SUPA_SYNC.ready||!SUPA_SYNC.enabled){alert('Đồng bộ Supabase chưa sẵn sàng. Hãy mở mục Đồng bộ Supabase để đăng nhập và bật đồng bộ.');return}const b=$('healthSync');b.disabled=true;b.textContent='Đang đồng bộ...';try{await syncManualNow();await systemHealthPage(true)}catch(e){alert('Đồng bộ không hoàn tất: '+(e.message||e));await systemHealthPage(false)}}}

;
/* >>> Original: assets/js/modules/admin/script-27.js >>> */
/* V2.0.33 — nâng cấp bộ kiểm tra dữ liệu hiện có; không bổ sung trang/bảng trùng. */

/* STEP103 — Kiểm tra toàn bộ dữ liệu */
const AUDIT_CATS={profile:'Hồ sơ',duplicate:'Trùng dữ liệu',room:'Phòng',residence:'Cư trú',sync:'Đồng bộ'};
let DATA_AUDIT_STATE={q:'',sev:'all',cat:'all',ktx:''};
function auditDigits(v){return String(v||'').replace(/\D/g,'')}
function auditMaskedId(v){const s=auditDigits(v);return s?'••••'+s.slice(-4):'—'}
function auditRoomKey(k,d,r){return [String(k||''),String(d||''),String(r||'')].join('|')}
function dataAuditScan(){
 const out=[],today=ldy(),add=(cat,sev,title,detail,opt={})=>out.push({cat,sev,title,detail,...opt});
 const cccd=new Map(),mnv=new Map();
 W.forEach(w=>{
   const c=auditDigits(w.cccd),m=String(w.mnv||'').trim(),p=auditDigits(w.sdt),k=K(w),d=D(w),r=String(R(w)||'').trim();
   if(c){if(!cccd.has(c))cccd.set(c,[]);cccd.get(c).push(w)}
   if(m){if(!mnv.has(m))mnv.set(m,[]);mnv.get(m).push(w)}
   if(!String(w.name||'').trim())add('profile','danger','Thiếu họ và tên','Hồ sơ không có họ tên.',{w});
   if(!c)add('profile','warn',w.name||'Hồ sơ chưa đặt tên','Chưa có CCCD.',{w});
   else if(c.length!==12)add('profile','danger',w.name||'Hồ sơ','CCCD không đủ 12 chữ số.',{w});
   if(!p)add('profile','warn',w.name||'Hồ sơ','Chưa có SĐT.',{w});
   else if(!/^0\d{9}$/.test(p))add('profile','warn',w.name||'Hồ sơ',`SĐT chưa đúng định dạng 10 số bắt đầu bằng 0.`,{w});
   if(!w.dob)add('profile','warn',w.name||'Hồ sơ','Chưa có ngày sinh.',{w});
   else if(String(w.dob).slice(0,10)>today)add('profile','danger',w.name||'Hồ sơ','Ngày sinh lớn hơn ngày hiện tại.',{w});
   if(w.date&&String(w.date).slice(0,10)>today)add('profile','warn',w.name||'Hồ sơ','Ngày vào KTX lớn hơn ngày hiện tại.',{w});
   if(!k||!/^KTX\s*[1-9]\d*$/i.test(k))add('profile','danger',w.name||'Hồ sơ',`KTX không hợp lệ: ${k||'trống'}.`,{w});
   const maxDay=/^KTX\s*1$/i.test(k)?5:/^KTX\s*2$/i.test(k)?6:6;
   if(!d||!new RegExp('^Dãy\\s*[1-'+maxDay+']$','i').test(d))add('profile','danger',w.name||'Hồ sơ',`Dãy không hợp lệ với ${k}: ${d||'trống'}.`,{w});
   if(!r)add('room','warn',w.name||'Hồ sơ','Chưa phân phòng.',{w});
   else if(!/^\d+$/.test(r)||+r<1||+r>15)add('room','danger',w.name||'Hồ sơ',`Phòng không hợp lệ: ${r}.`,{w});
   if(w.tv&&w.tv.to&&String(w.tv.to).slice(0,10)<today)add('residence','warn',w.name||'Hồ sơ',`Tạm vắng đã hết hạn từ ${vn(String(w.tv.to).slice(0,10))} nhưng trạng thái vẫn còn.`,{w});
 });
 cccd.forEach((L,c)=>{if(L.length>1)add('duplicate','danger',`CCCD trùng: ••••${c.slice(-4)}`,`${L.length} hồ sơ: ${L.slice(0,4).map(x=>x.name||'Không tên').join(', ')}${L.length>4?'…':''}`,{workers:L})});
 mnv.forEach((L,m)=>{if(L.length>1)add('duplicate','warn',`Mã NV trùng: ${m}`,`${L.length} hồ sơ: ${L.slice(0,4).map(x=>x.name||'Không tên').join(', ')}${L.length>4?'…':''}`,{workers:L})});
 // V2.0.33: Compare unassigned records with the room map without assuming beds are assigned.
 const assigned=rooms(W).reduce((n,room)=>n+room.n,0);
 const unassigned=W.length-assigned;
 if(unassigned>0)add('room','warn','Quân số chưa phân phòng',`${unassigned.toLocaleString('vi-VN')} hồ sơ chưa có đủ KTX, Dãy và Phòng. Tổng hồ sơ ${W.length.toLocaleString('vi-VN')} · đã phân phòng ${assigned.toLocaleString('vi-VN')}.`,{workers:W.filter(w=>!R(w)||K(w)==='Chưa phân'||D(w)==='Chưa phân'),unassigned:true});
 rooms(W).forEach(r=>{
   if(r.n>CAP)add('room','danger',`${r.ktx} · ${r.day} · P.${r.room}`,`Phòng quá tải ${r.n}/${CAP} người.`,{room:r});
   if(roomLocked(r.ktx,r.day,r.room)&&r.n)add('room','warn',`${r.ktx} · ${r.day} · P.${r.room}`,`Phòng đang khóa nhưng vẫn có ${r.n} người.`,{room:r});
   const md=roomMode(r.ktx,r.day,r.room,r.l),bad=r.l.filter(w=>(md==='male'&&isNu(w.gt))||(md==='female'&&isNam(w.gt)));
   if(bad.length)add('room','warn',`${r.ktx} · ${r.day} · P.${r.room}`,`${bad.length} người không phù hợp công năng ${roomTypeText(md)}: ${bad.slice(0,3).map(w=>w.name).join(', ')}${bad.length>3?'…':''}`,{room:r,workers:bad});
 });
 const cw=SUPA_SYNC&&SUPA_SYNC.counts&&SUPA_SYNC.counts.workers;
 if(typeof cw==='number'&&cw!==W.length)add('sync','warn','Local / Cloud chưa khớp',`Local ${W.length.toLocaleString('vi-VN')} · Cloud ${cw.toLocaleString('vi-VN')} · lệch ${Math.abs(W.length-cw).toLocaleString('vi-VN')} hồ sơ.`,{});
 if(SUPA_SYNC&&SUPA_SYNC.lastError)add('sync','danger','Lỗi đồng bộ gần nhất',String(SUPA_SYNC.lastError),{});
 return out;
}
function auditActionLabel(x){if(x.w)return 'Sửa hồ sơ';if(x.room)return 'Mở phòng';if(x.cat==='duplicate')return 'So sánh hồ sơ';if(x.cat==='sync')return 'Đồng bộ';return 'Xem'}
function auditDoAction(x){if(!x)return;if(x.w)return edit(x.w);if(x.room){go('home');setTimeout(()=>openRoomDrawer(x.room.ktx,x.room.day,x.room.room,x.room.l||[]),60);return}if(x.cat==='duplicate'){
  // Navigate to the actual worker list instead of removed legacy route t2.
  const first=(x.workers||[])[0];
  go('work');
  if(first){const query=x.title.startsWith('CCCD')?auditDigits(first.cccd):String(first.mnv||'').trim();
   const field=document.getElementById('q');if(field){field.value=query;field.dispatchEvent(new Event('input',{bubbles:true}))}}
  return;
 }if(x.cat==='sync')return go('sync')}
function auditFiltered(L){const s=DATA_AUDIT_STATE,q=sa(s.q);return L.filter(x=>(s.sev==='all'||x.sev===s.sev)&&(s.cat==='all'||x.cat===s.cat)&&(!s.ktx||(x.w&&K(x.w)===s.ktx)||(x.room&&x.room.ktx===s.ktx)||(x.workers||[]).some(w=>K(w)===s.ktx))&&(!q||sa([x.title,x.detail,AUDIT_CATS[x.cat]||x.cat].join(' ')).includes(q)))}
async function auditExport(L){const rows=[['Mức độ','Nhóm','Tiêu đề','Chi tiết','Họ tên','Mã NV','CCCD','KTX','Dãy','Phòng'],...L.map(x=>{const w=x.w||(x.workers&&x.workers[0])||{};return [x.sev==='danger'?'Lỗi':x.sev==='warn'?'Cảnh báo':'Thông tin',AUDIT_CATS[x.cat]||x.cat,x.title,x.detail,w.name||'',w.mnv||'',w.cccd||'',x.room?x.room.ktx:K(w),x.room?x.room.day:D(w),x.room?x.room.room:R(w)]})];await save(rows,`Kiem_tra_du_lieu_${ldy()}.xlsx`,'Kiểm tra dữ liệu')}
function auditDuplicatePanel(x,i){
 if(x.cat!=='duplicate'||!Array.isArray(x.workers))return '';
 const lines=x.workers.map((w,j)=>`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid #e3ebf5;border-radius:7px;background:white"><div style="flex:1 1 220px;min-width:0"><b>${esc(w.name||'Chưa có họ tên')}</b><div class="mut" style="font-size:12px">Mã NV: ${esc(w.mnv||'—')} · CCCD: ${esc(auditMaskedId(w.cccd))}</div><div class="mut" style="font-size:12px">${esc(K(w)||'Chưa có KTX')} · ${esc(D(w)||'Chưa có Dãy')} · Phòng ${esc(R(w)||'—')} · Sinh: ${esc(w.dob||'—')}</div></div><button type="button" class="btn s" data-audit-member="${i}:${j}">${typeof can==='function'&&can('editw',w)?'Kiểm tra hồ sơ':'Tìm trong danh sách'}</button></div>`).join('');
 return `<div class="audit-duplicate-members" data-audit-group="${i}" hidden style="margin:0 0 10px 25px;padding:10px;border:1px solid #d9e3f2;border-radius:10px;background:#f8fbff"><div class="mut" style="margin-bottom:8px">Đối chiếu ${x.workers.length} hồ sơ (chỉ xem, không tự gộp/xóa). CCCD được che bớt để hạn chế lộ thông tin.</div><div style="display:grid;gap:7px">${lines}</div></div>`;
}
function dataAuditPage(){const el=$('dataaudit');if(!el)return;const A=dataAuditScan(),L=auditFiltered(A),bad=A.filter(x=>x.sev==='danger').length,warn=A.filter(x=>x.sev==='warn').length,affected=new Set(A.flatMap(x=>x.w?[x.w.id]:(x.workers||[]).map(w=>w.id)).filter(Boolean)).size,roomIssues=A.filter(x=>x.cat==='room').length,dup=A.filter(x=>x.cat==='duplicate').length,ks=[...new Set(W.map(K).filter(Boolean))].sort(num);el.innerHTML=`<div id="auditRoot"><div class="audit-top"><div class="audit-kpi ${A.length?'warn':'ok'}"><span>Tổng vấn đề</span><b>${A.length.toLocaleString('vi-VN')}</b><small>${A.length?'Cần rà soát':'Dữ liệu sạch'}</small></div><div class="audit-kpi ${bad?'bad':'ok'}"><span>Lỗi nghiêm trọng</span><b>${bad}</b><small>Cần ưu tiên xử lý</small></div><div class="audit-kpi ${warn?'warn':'ok'}"><span>Cảnh báo</span><b>${warn}</b><small>Có thể xử lý dần</small></div><div class="audit-kpi"><span>Hồ sơ ảnh hưởng</span><b>${affected}</b><small>Trên ${W.length.toLocaleString('vi-VN')} công nhân</small></div><div class="audit-kpi ${dup?'warn':'ok'}"><span>Trùng dữ liệu</span><b>${dup}</b><small>${roomIssues} vấn đề phòng</small></div></div><div class="card"><div class="audit-toolbar"><input id="auditQ" placeholder="Tìm tên, lỗi, CCCD, phòng..." value="${esc(DATA_AUDIT_STATE.q)}"><select id="auditSev"><option value="all">Tất cả mức độ</option><option value="danger" ${DATA_AUDIT_STATE.sev==='danger'?'selected':''}>Lỗi nghiêm trọng</option><option value="warn" ${DATA_AUDIT_STATE.sev==='warn'?'selected':''}>Cảnh báo</option><option value="info" ${DATA_AUDIT_STATE.sev==='info'?'selected':''}>Thông tin</option></select><select id="auditCat"><option value="all">Tất cả nhóm</option>${Object.entries(AUDIT_CATS).map(([k,v])=>`<option value="${k}" ${DATA_AUDIT_STATE.cat===k?'selected':''}>${v}</option>`).join('')}</select><select id="auditK"><option value="">Tất cả KTX</option>${ks.map(k=>`<option ${DATA_AUDIT_STATE.ktx===k?'selected':''}>${esc(k)}</option>`).join('')}</select><div class="audit-actions"><button class="btn" id="auditRefresh">Quét lại</button><button class="btn g" id="auditExport">Xuất Excel</button></div></div><div class="audit-note">Hệ thống chỉ <b>quét dữ liệu đã đồng bộ và cảnh báo</b>, không tự sửa hay xóa dữ liệu. Định mức phòng vẫn cố định <b>${CAP} người/phòng</b>.</div><div class="audit-summary"><span>Đang hiển thị ${L.length}/${A.length}</span><span>Hồ sơ ${A.filter(x=>x.cat==='profile').length}</span><span>Phòng ${roomIssues}</span><span>Trùng ${dup}</span><span>Cư trú ${A.filter(x=>x.cat==='residence').length}</span><span>Đồng bộ ${A.filter(x=>x.cat==='sync').length}</span></div><div class="audit-list">${L.length?L.map((x,i)=>`<div class="audit-row ${x.sev}"><i class="audit-dot"></i><div><div class="audit-title">${esc(x.title)}</div><span class="audit-badge">${esc(AUDIT_CATS[x.cat]||x.cat)}</span></div><div class="audit-detail">${esc(x.detail)}</div><div class="audit-meta">${x.w?`${esc(K(x.w)||'')} ${esc(D(x.w)||'')} P.${esc(R(x.w)||'—')}`:x.room?`${esc(x.room.ktx)} ${esc(x.room.day)} P.${esc(x.room.room)}`:''}</div><button class="btn s" data-audit-act="${i}" aria-expanded="false">${auditActionLabel(x)}</button></div>${auditDuplicatePanel(x,i)}`).join(''):'<div class="audit-empty"><div class="audit-pass">✓ Không có cảnh báo trong phạm vi bộ lọc.</div><div style="margin-top:4px">Dữ liệu hiện tại không phát hiện lỗi trong phạm vi đang quét.</div></div>'}</div></div></div>`;
 const rerender=()=>{DATA_AUDIT_STATE={q:$('auditQ').value,sev:$('auditSev').value,cat:$('auditCat').value,ktx:$('auditK').value};dataAuditPage()};$('auditQ').oninput=()=>{const input=$('auditQ'),pos=input.selectionStart;rerender();const next=$('auditQ');if(next){next.focus({preventScroll:true});try{next.setSelectionRange(pos,pos)}catch(_){}}};$('auditSev').onchange=rerender;$('auditCat').onchange=rerender;$('auditK').onchange=rerender;$('auditRefresh').onclick=()=>{DATA_AUDIT_STATE={q:'',sev:'all',cat:'all',ktx:''};dataAuditPage()};$('auditExport').onclick=()=>auditExport(A);document.querySelectorAll('#dataaudit [data-audit-act]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.auditAct),x=L[i];if(x&&x.cat==='duplicate'){const panel=el.querySelector('[data-audit-group="'+i+'"]');if(panel){panel.hidden=!panel.hidden;b.setAttribute('aria-expanded',String(!panel.hidden));b.textContent=panel.hidden?'So sánh hồ sơ':'Thu gọn';}return;}auditDoAction(x)});
 el.querySelectorAll('[data-audit-member]').forEach(b=>b.onclick=()=>{const indexes=b.dataset.auditMember.split(':').map(Number),group=L[indexes[0]],w=group&&group.cat==='duplicate'&&group.workers&&group.workers[indexes[1]];if(!w||!W.some(a=>a===w||a.id&&a.id===w.id))return alert('Hồ sơ đã thay đổi, vui lòng quét lại.');if(typeof can==='function'&&can('editw',w))return edit(w);go('work');const field=document.getElementById('q');if(field){field.value=String(w.mnv||w.name||'').trim();field.dispatchEvent(new Event('input',{bubbles:true}));}});
}

;
/* >>> Original: assets/js/modules/admin/script-28.js >>> */
/* v1.0.107 — Cloud-only: local IndexedDB snapshots removed.
   This page is informational; do not claim offline restore is available. */
const SAFETY_DB='ktx_safety_db_v1',SAFETY_STORE='snapshots',SAFETY_MAX=0;
async function safetyList(){return []}
async function safetySnapshot(){return null}
async function safetyGet(){return null}
async function safetyRestore(){alert('Khôi phục cục bộ đã ngừng hỗ trợ. Hãy sử dụng bản sao Supabase sau khi xác minh quyền và giao dịch khôi phục.')}
async function safetyDelete(){alert('Ứng dụng không còn quản lý điểm khôi phục cục bộ mới.')}
async function safetyConfirmPurge(count,label){
  return !!(await ask(`${label||'Xóa hẳn'} ${Number(count||0).toLocaleString('vi-VN')} công nhân?\n\nKhông tạo bản sao IndexedDB trên thiết bị. Hãy xác minh bản sao Cloud trước khi xóa.`,{title:'Xác nhận xóa dữ liệu',ok:'Tiếp tục xóa'}));
}
async function safetyPage(){
 const el=$('safety');if(!el)return;
 el.innerHTML='<div class="card"><h3>Sao lưu tập trung Supabase</h3><p class="mut">Chế độ Cloud-Only không tạo hay khôi phục bản sao công nhân trên thiết bị. Dùng mục Sao lưu Supabase để tải bản sao mới nhất. Các bản IndexedDB cũ trên thiết bị không được ứng dụng tự xóa.</p></div>';
}
/* Legacy local snapshot wrappers intentionally not installed.
   Existing business action authorization and confirmation remain with owning modules. */

;
/* >>> Original: assets/js/modules/admin/script-29.js >>> */

/* STEP106 — Phát hiện và xử lý xung đột khi nhiều máy cùng sửa */
(function(){
 if(window.__STEP106_SYNC_CONFLICT__)return;window.__STEP106_SYNC_CONFLICT__=true;
 SUPA_SYNC.conflicts=SUPA_SYNC.conflicts||[];SUPA_SYNC.remoteDirty=false;
 const conflictKinds=['workers','archive','attendance','registrations','rooms'];
 const kindLabel={workers:'Công nhân',archive:'Điều chuyển · Nghỉ việc',attendance:'Điểm danh',registrations:'Đăng ký',rooms:'Cấu hình phòng'};
 const idCol=k=>k==='rooms'?'room_key':'record_id';
 function label(c){const p=c.localPayload||c.remotePayload||{};return c.kind==='rooms'?`Phòng ${c.id}`:(p.name||p.hoten||p.workerName||p.mnv||p.worker_code||c.id)}
 function diff(c){if(c.type==='local_deleted')return 'Máy này đã xóa nhưng máy khác vừa sửa bản ghi.';if(c.type==='remote_deleted')return 'Máy khác đã xóa trong khi máy này còn thay đổi chưa gửi.';const a=c.localPayload||{},b=c.remotePayload||{},out=[];for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])]){if(k==='history')continue;let x,y;try{x=JSON.stringify(a[k]??'');y=JSON.stringify(b[k]??'')}catch(e){continue}if(x!==y)out.push(k);if(out.length===6)break}return out.length?'Khác nhau tại: '+out.join(', ')+(out.length===6?'…':''):'Nội dung hai phía khác nhau.'}
 async function fetchIds(kind,ids){ids=[...new Set(ids.map(String).filter(Boolean))];if(!ids.length)return[];const sb=syncClient(),out=[],col=idCol(kind);for(let i=0;i<ids.length;i+=100){const {data,error}=await sb.from(SYNC_TABLES[kind]).select(`${col},payload,updated_at,updated_by`).in(col,ids.slice(i,i+100));if(error)throw error;out.push(...(data||[]))}return out}
 function putConflict(c){const key=c.kind+'|'+c.id,i=SUPA_SYNC.conflicts.findIndex(x=>x.kind+'|'+x.id===key);if(i>=0)SUPA_SYNC.conflicts[i]=c;else SUPA_SYNC.conflicts.push(c)}
 function delConflict(kind,id){SUPA_SYNC.conflicts=SUPA_SYNC.conflicts.filter(x=>!(x.kind===kind&&String(x.id)===String(id)))}
 function persistLocal(){/* Cloud-only staging: entities stay in RAM; never materialize a parallel browser database. */}
 function applyLocal(kind,id,payload,remove){SUPA_SYNC.applying=true;try{let i=-1;if(kind==='workers'){i=W.findIndex((x,j)=>String(syncRecordId('w',x,j))===String(id)||String(x.id||'')===String(id));if(remove){if(i>=0)W.splice(i,1)}else if(i>=0)W[i]=syncClone(payload);else W.unshift(syncClone(payload))}else if(kind==='archive'){i=ARC.findIndex((x,j)=>String(syncRecordId('a',x,j))===String(id)||String(x.id||'')===String(id));if(remove){if(i>=0)ARC.splice(i,1)}else if(i>=0)ARC[i]=syncClone(payload);else ARC.unshift(syncClone(payload))}else if(kind==='attendance'){i=ATT.findIndex((x,j)=>String(syncRecordId('t',x,j))===String(id)||String(x.id||'')===String(id));if(remove){if(i>=0)ATT.splice(i,1)}else if(i>=0)ATT[i]=syncClone(payload);else ATT.unshift(syncClone(payload))}else if(kind==='registrations'){i=REG.findIndex((x,j)=>String(syncRecordId('r',x,j))===String(id)||String(x.id||'')===String(id));if(remove){if(i>=0)REG.splice(i,1)}else if(i>=0)REG[i]=syncClone(payload);else REG.unshift(syncClone(payload))}else if(kind==='rooms'){if(remove)delete ROOMMETA[id];else ROOMMETA[id]=syncClone(payload)}persistLocal()}finally{SUPA_SYNC.applying=false}}
 async function resolve(kind,id,choice){const c=SUPA_SYNC.conflicts.find(x=>x.kind===kind&&String(x.id)===String(id));if(!c)return;const sb=syncClient(),table=SYNC_TABLES[kind],col=idCol(kind);try{if(choice==='cloud'){if(c.type==='remote_deleted')applyLocal(kind,id,null,true);else applyLocal(kind,id,c.remotePayload,false);SUPA_SYNC.hashes[kind]=SUPA_SYNC.hashes[kind]||{};SUPA_SYNC.remoteIds[kind]=SUPA_SYNC.remoteIds[kind]||new Set();if(c.type==='remote_deleted'){delete SUPA_SYNC.hashes[kind][id];SUPA_SYNC.remoteIds[kind].delete(id)}else{SUPA_SYNC.hashes[kind][id]=syncHash(c.remotePayload);SUPA_SYNC.remoteIds[kind].add(id)}}else{if(c.type==='local_deleted'){if(!syncCanDelete(kind))throw new Error('Bạn không có quyền xóa bản ghi này.');const {error}=await sb.from(table).delete().eq(col,id);if(error)throw error;delete (SUPA_SYNC.hashes[kind]||{})[id];SUPA_SYNC.remoteIds[kind]&&SUPA_SYNC.remoteIds[kind].delete(id)}else{if(!syncCanWrite(kind))throw new Error('Bạn không có quyền cập nhật bản ghi này.');const row=syncRows(kind).find(r=>String(r[col])===String(id));if(!row)throw new Error('Không tìm thấy bản dữ liệu trên máy.');const {error}=await sb.from(table).upsert(row,{onConflict:col});if(error)throw error;SUPA_SYNC.hashes[kind]=SUPA_SYNC.hashes[kind]||{};SUPA_SYNC.hashes[kind][id]=syncHash(row.payload);SUPA_SYNC.remoteIds[kind]=SUPA_SYNC.remoteIds[kind]||new Set();SUPA_SYNC.remoteIds[kind].add(id)}}delConflict(kind,id);SUPA_SYNC.pending=SUPA_SYNC.conflicts.length>0;try{localStorage.setItem('ktx_sb_sync_pending',SUPA_SYNC.pending?'true':'false')}catch(e){}try{auditPush('SYNC_CONFLICT',(choice==='cloud'?'Giữ bản Cloud: ':'Giữ bản máy này: ')+label(c))}catch(e){}if(typeof resetWorkSearchCache==='function')resetWorkSearchCache();all();syncPage()}catch(e){alert('Không xử lý được xung đột: '+(e.message||e))}}
 window.syncResolveConflict106=resolve;

 syncUpsert=async function(kind){if(!syncCanWrite(kind))return {changed:0,conflicts:0};const sb=syncClient(),table=SYNC_TABLES[kind],rows=syncRows(kind);if(!table)return {changed:0,conflicts:0};const col=kind==='rooms'?'room_key':kind==='resStatus'?'worker_id':'record_id',prev=SUPA_SYNC.hashes[kind]||{},next={},changed=[];for(const r of rows){const id=String(r[col]),h=syncHash(r.payload);next[id]=h;if(prev[id]!==h)changed.push(r)}const remoteSet=SUPA_SYNC.remoteIds[kind]||new Set(),current=new Set(Object.keys(next)),gone=[...remoteSet].filter(x=>!current.has(x));
  if(!conflictKinds.includes(kind)){for(let i=0;i<changed.length;i+=400){const {error}=await sb.from(table).upsert(changed.slice(i,i+400),{onConflict:col});if(error)throw error}if(syncCanDelete(kind)){for(let i=0;i<gone.length;i+=200){const {error}=await sb.from(table).delete().in(col,gone.slice(i,i+200));if(error)throw error}}SUPA_SYNC.hashes[kind]=next;SUPA_SYNC.remoteIds[kind]=new Set(Object.keys(next));return {changed:changed.length,conflicts:0}}
  // Hotfix: never treat an entire pre-existing local cache as unsynced new records.
  // No trusted base snapshot + sizable cache means we cannot safely determine ownership.
  if(kind==='workers' && rows.length>=25 && Object.keys(prev).length<Math.min(25,Math.floor(rows.length/2))){
    SUPA_SYNC.pending=true;
    throw new Error('BẢO VỆ DỮ LIỆU: Chưa có mốc đồng bộ công nhân đáng tin cậy. Đã khóa ghi lên Cloud để tránh ghi đè dữ liệu PC/Mobile. Sao lưu riêng hai thiết bị trước khi khôi phục đồng bộ.');
  }
  const probe=[...new Set([...changed.map(r=>String(r[col])),...gone])],remote=await fetchIds(kind,probe),rm=new Map(remote.map(r=>[String(r[col]),r])),safe=[];let conflicts=0;
  for(const r of changed){const id=String(r[col]),lh=syncHash(r.payload),base=prev[id],rr=rm.get(id);if(base!==undefined){if(!rr){putConflict({kind,id,type:'remote_deleted',localPayload:syncClone(r.payload),remotePayload:null,detectedAt:Date.now()});conflicts++;continue}if(syncHash(rr.payload)!==base){putConflict({kind,id,type:'update',localPayload:syncClone(r.payload),remotePayload:syncClone(rr.payload),remoteUpdatedAt:rr.updated_at,remoteUpdatedBy:rr.updated_by,detectedAt:Date.now()});conflicts++;continue}}else if(rr&&syncHash(rr.payload)!==lh){putConflict({kind,id,type:'update',localPayload:syncClone(r.payload),remotePayload:syncClone(rr.payload),remoteUpdatedAt:rr.updated_at,remoteUpdatedBy:rr.updated_by,detectedAt:Date.now()});conflicts++;continue}safe.push(r)}
  for(let i=0;i<safe.length;i+=300){const {error}=await sb.from(table).upsert(safe.slice(i,i+300),{onConflict:col});if(error)throw error}
  const safeGone=[];if(syncCanDelete(kind))for(const id of gone){const rr=rm.get(String(id));if(!rr)continue;const base=prev[id];if(base!==undefined&&syncHash(rr.payload)!==base){putConflict({kind,id:String(id),type:'local_deleted',localPayload:null,remotePayload:syncClone(rr.payload),remoteUpdatedAt:rr.updated_at,remoteUpdatedBy:rr.updated_by,detectedAt:Date.now()});conflicts++}else safeGone.push(String(id))}
  for(let i=0;i<safeGone.length;i+=150){const {error}=await sb.from(table).delete().in(col,safeGone.slice(i,i+150));if(error)throw error}
  const merged={...prev};safe.forEach(r=>merged[String(r[col])]=syncHash(r.payload));safeGone.forEach(id=>delete merged[id]);SUPA_SYNC.hashes[kind]=merged;const ids=new Set(remoteSet);safe.forEach(r=>ids.add(String(r[col])));safeGone.forEach(id=>ids.delete(id));SUPA_SYNC.remoteIds[kind]=ids;return {changed:safe.length,conflicts}
 };

 syncPushAll=async function(){
  if(SUPA_SYNC.cloudHydratedUser!==String(SUPA_SYNC.session?.user?.id||''))return {ok:false,skipped:true,message:'Chưa tải dữ liệu Cloud; không ghi dữ liệu trên máy lên Cloud.'};
  // v1.0.85: Không dừng toàn bộ hàng đợi vì số lượng xung đột.
  // syncUpsert() vẫn tách riêng bản ghi xung đột, chỉ gửi các bản ghi an toàn.
  if(SUPA_SYNC.deletingWorkers)return {ok:false,skipped:true,message:'Đang xử lý công nhân.'};if(!SUPA_SYNC.ready||!SUPA_SYNC.enabled)return {ok:false,skipped:true,message:'Đồng bộ chưa sẵn sàng.'};if(SUPA_SYNC.applying)return {ok:false,skipped:true,message:'Đang tải dữ liệu từ Supabase.'};if(SUPA_SYNC.pushing)return {ok:false,skipped:true,message:'Đang có phiên đồng bộ khác.'};SUPA_SYNC.pushing=true;SUPA_SYNC.lastError='';try{for(const k of ['workers','archive','logs','attendance','registrations','rooms','resStatus','resHistory'])await syncUpsert(k);await syncPushAlertReads();await syncPushState();SUPA_SYNC.lastSync=Date.now();SUPA_SYNC.pending=SUPA_SYNC.conflicts.length>0;try{localStorage.setItem('ktx_sb_sync_pending',SUPA_SYNC.pending?'true':'false')}catch(e){}if(SUPA_SYNC.conflicts.length){syncSetStatus(`Phát hiện ${SUPA_SYNC.conflicts.length} xung đột dữ liệu · cần xác nhận`,'warn');return {ok:true,conflicts:SUPA_SYNC.conflicts.length,at:SUPA_SYNC.lastSync}}syncSetStatus('Đã đồng bộ dữ liệu lên Supabase','ok');return {ok:true,conflicts:0,at:SUPA_SYNC.lastSync}}catch(e){SUPA_SYNC.lastError=e.message||String(e);SUPA_SYNC.pending=true;/* V34: no local pending record */syncSetStatus('Lỗi đồng bộ: '+SUPA_SYNC.lastError,'bad');return {ok:false,error:SUPA_SYNC.lastError}}finally{SUPA_SYNC.pushing=false;if(page==='sync')syncPage();syncFooter()}};

 // V12: Keep the safe, atomic, read-only-first syncPullAll and pending-aware
 // syncScheduleReload declared above. The legacy overrides previously tried to
 // PUSH local data during a Cloud pull and replaced the six-table parallel read.
 // Those overrides are intentionally removed to prevent stale/local data writes.
 window.KTX_SUPA_SYNC={get ready(){return SUPA_SYNC.ready},get applying(){return SUPA_SYNC.applying},schedulePush:syncSchedulePush,push:syncPushAll};

 function renderPanel(){const root=$('sync');if(!root)return;root.querySelectorAll('.sync-conflict-card').forEach(x=>x.remove());const L=SUPA_SYNC.conflicts||[],card=document.createElement('div');card.className='card sync-conflict-card';card.innerHTML=`<div class="sync-conflict-head"><div><h3>Xung đột đồng bộ đa máy</h3><small>${L.length?'Ứng dụng đã chặn ghi đè các bản ghi bị sửa đồng thời. Chọn phiên bản cần giữ lại.':'Cơ chế chống ghi đè đang hoạt động.'}</small></div><div class="sync-conflict-count">${L.length}</div></div>${L.length?`<div class="sync-conflict-list">${L.map(c=>`<div class="sync-conflict-row"><div><b>${esc(label(c))}</b><small>${esc(kindLabel[c.kind]||c.kind)} · ${c.remoteUpdatedAt?new Date(c.remoteUpdatedAt).toLocaleString('vi-VN'):'máy khác đã thay đổi'}</small></div><div class="sync-conflict-diff">${esc(diff(c))}</div><div class="sync-conflict-actions"><button class="btn s" data-cloud="${esc(c.kind)}|${esc(c.id)}">Giữ bản Cloud</button><button class="btn g" data-local="${esc(c.kind)}|${esc(c.id)}">Giữ bản máy này</button></div></div>`).join('')}</div><div class="sync-conflict-note">Các bản ghi không xung đột vẫn đồng bộ bình thường. Chỉ bản ghi bị xung đột mới chờ xác nhận.</div>`:'<div class="sync-conflict-empty">Nếu hai máy cùng sửa một công nhân hoặc một phòng, hệ thống sẽ giữ cả hai phiên bản và không tự ghi đè.</div>'}`;root.prepend(card);card.querySelectorAll('[data-cloud]').forEach(b=>b.onclick=()=>{const [k,...z]=b.dataset.cloud.split('|');resolve(k,z.join('|'),'cloud')});card.querySelectorAll('[data-local]').forEach(b=>b.onclick=()=>{const [k,...z]=b.dataset.local.split('|');resolve(k,z.join('|'),'local')})}
 const oldPage=syncPage;syncPage=function(){oldPage();renderPanel()};
 const oldManual=syncManualNow;syncManualNow=async function(){const before=SUPA_SYNC.conflicts.length;await oldManual();const after=SUPA_SYNC.conflicts.length;if(after>before)alert(`Phát hiện ${after} xung đột đồng bộ. Hãy xử lý trong khung “Xung đột đồng bộ đa máy”.`)};
})();

;
/* >>> Original: assets/js/modules/admin/script-30.js >>> */

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

;
/* >>> Original: assets/js/modules/admin/script-31.js >>> */

/* STEP108 — Daily automatic data audit + alert integration */
(function(){
 const CFG='ktx_auto_audit_cfg_v1', RES='ktx_auto_audit_result_v1';
 function cfg(){try{return Object.assign({on:true,lastDay:'',lastAt:0},JSON.parse(localStorage.getItem(CFG)||'{}'))}catch(e){return {on:true,lastDay:'',lastAt:0}}}
 function saveCfg(c){try{localStorage.setItem(CFG,JSON.stringify(c))}catch(e){}}
 function saveResult(A){const c=cfg(),bad=A.filter(x=>x.sev==='danger').length,warn=A.filter(x=>x.sev==='warn').length,res={at:Date.now(),day:ldy(),total:A.length,bad,warn};try{localStorage.setItem(RES,JSON.stringify(res))}catch(e){}c.lastDay=ldy();c.lastAt=res.at;saveCfg(c);return res}
 function result(){try{return JSON.parse(localStorage.getItem(RES)||'null')}catch(e){return null}}
 function run(force=false){const c=cfg();if(!force&&(!c.on||c.lastDay===ldy()))return result();const A=typeof dataAuditScan==='function'?dataAuditScan():[];const r=saveResult(A);try{if(typeof updateAlertBadges==='function')updateAlertBadges()}catch(e){}return r}
 window.KTX_AUTO_AUDIT108={cfg,result,run,set(v){const c=cfg();c.on=!!v;saveCfg(c);if(c.on)run(true);return c}};
 const baseIssueList=issueList;
 issueList=function(){
   const base=baseIssueList(),seen=new Set(base.map(x=>[x.type,x.title,x.detail,x.w&&x.w.id||''].join('|'))),extra=[];
   if(cfg().on&&typeof dataAuditScan==='function')dataAuditScan().forEach(a=>{
     if(!['danger','warn'].includes(a.sev)||a.cat==='duplicate')return;
     const w=a.w||(a.workers&&a.workers[0])||null;
     if(a.sev==='warn'&&a.cat==='profile'&&/Chưa có SĐT|Chưa có CCCD|Chưa có ngày sinh/.test(a.detail))return;
     const type='audit-'+a.cat,key=[type,a.title,a.detail,w&&w.id||''].join('|');if(seen.has(key))return;
     seen.add(key);extra.push({category:'audit',type,sev:a.sev,title:a.title,detail:a.detail,w,room:a.room});
   });
   return [...extra,...base];
 };
 const baseAuditPage=dataAuditPage;
 dataAuditPage=function(){
   baseAuditPage();const root=$('auditRoot');if(!root)return;const c=cfg(),r=result(),bar=document.createElement('div');bar.className='audit-auto';
   const cls=r?(r.bad?'bad':r.warn?'warn':''):'warn',text=r?`${r.total.toLocaleString('vi-VN')} vấn đề · ${r.bad} nghiêm trọng · ${r.warn} cảnh báo`:'Chưa có kết quả quét tự động';
   bar.innerHTML=`<label><input type="checkbox" id="auditAutoOn" ${c.on?'checked':''}> Tự quét dữ liệu mỗi ngày</label><span class="audit-auto-state ${cls}">${esc(text)}</span><span>${r&&r.at?'Lần gần nhất: '+new Date(r.at).toLocaleString('vi-VN'):'Hệ thống sẽ quét khi mở ứng dụng.'}</span><span class="spacer"></span><button class="btn s sm" id="auditAutoRun">Quét tự động ngay</button>`;
   const card=root.querySelector('.card');if(card)card.insertBefore(bar,card.firstChild);else root.prepend(bar);
   $('auditAutoOn').onchange=e=>{KTX_AUTO_AUDIT108.set(e.target.checked);dataAuditPage()};$('auditAutoRun').onclick=()=>{run(true);dataAuditPage()};
 };
 setTimeout(()=>{try{run(false);if(page==='alerts')alertCenterPage()}catch(e){console.warn('STEP108 auto audit',e)}},1800);
})();

;
/* >>> Original: assets/js/modules/workers/script-32.js >>> */

/* STEP109 — Nhật ký thay đổi chi tiết theo từng công nhân */
(()=>{
 const LABELS109=window.FIELD_LABEL81||{name:'Họ và tên',mnv:'Mã NV',gt:'Giới tính',dob:'Ngày sinh',sdt:'Số điện thoại',cccd:'CCCD',thon:'Thôn/Xóm',xa:'Xã/Phường',tinh:'Tỉnh/TP',ktx:'KTX',day:'Dãy',room:'Phòng',bed:'Chỗ',unit:'Đơn vị',td:'Tiểu đoàn',date:'Ngày vào KTX',out:'Ngày ra KTX',leader:'Tổ trưởng',lsdt:'SĐT tổ trưởng',tt:'Tạm trú',tv:'Tạm vắng'};
 const safeText109=v=>{if(v===null||v===undefined||v==='')return '—';if(typeof v==='object'){try{return JSON.stringify(v)}catch(e){return String(v)}}return String(v)};
 function actionClass109(a){a=String(a||'').toUpperCase();if(/DELETE|PURGE|CHECKOUT/.test(a))return'delete';if(/MOVE|TRANSFER/.test(a))return'move';if(/RESIDENCE|AWAY|RESTORE|CHECKIN/.test(a))return'res';return''}
 function workerAudit109(w){if(!w)return[];const id=String(w.id||''),nm=sa(w.name||'');return LOG.filter(l=>{
   if(id&&String(l.workerId||'')===id)return true;
   if(l.workerName&&sa(l.workerName)===nm)return true;
   if(!l.workerId&&!l.workerName&&nm&&sa(l.d||'').includes(nm))return true;
   return false;
 }).map((l,i)=>({...l,__i:i})).sort((a,b)=>(Number(b.at)||Date.parse(b.day||'')||0)-(Number(a.at)||Date.parse(a.day||'')||0));}
 function eventTime109(l){if(l.at){const d=new Date(l.at);if(!isNaN(d))return d.toLocaleString('vi-VN')}return l.t||l.day||'—'}
 function diffHtml109(changes){if(!Array.isArray(changes)||!changes.length)return'';return `<div class="worker-audit-diff">${changes.map(c=>`<div class="worker-audit-diff-row"><strong>${esc(c.label||LABELS109[c.field]||c.field||'Trường')}</strong><div class="worker-audit-values"><span class="worker-audit-old">${esc(safeText109(c.from))}</span><span class="worker-audit-arrow">→</span><span class="worker-audit-new">${esc(safeText109(c.to))}</span></div></div>`).join('')}</div>`}
 function exportWorkerAudit109(w){const L=workerAudit109(w),rows=[['STT','Thời gian','Người thực hiện','Vai trò','Hành động','Chi tiết','Trường thay đổi','Giá trị cũ','Giá trị mới']];let stt=0;L.forEach(l=>{const C=Array.isArray(l.changes)&&l.changes.length?l.changes:[null];C.forEach((c,j)=>rows.push([++stt,eventTime109(l),l.actor||'',l.role||'',l.a||'',j?'':l.d||'',c?(c.label||LABELS109[c.field]||c.field||''):'',c?safeText109(c.from):'',c?safeText109(c.to):'']))});save(rows,`Nhat_ky_thay_doi_${String(w.name||'cong_nhan').replace(/[\\/:*?"<>|]+/g,'_')}_${ldy()}.xlsx`,'Nhật ký thay đổi')}
 function cardHtml109(w){const L=workerAudit109(w),actors=[...new Set(L.map(x=>x.actor).filter(Boolean))],changes=L.reduce((n,x)=>n+(Array.isArray(x.changes)?x.changes.length:0),0),last=L[0];return `<div class="vcd worker-audit-card" data-worker-audit="${esc(w.id)}"><div class="vs">${typeof ico==='function'?ico('log'):''}Nhật ký thay đổi</div><div class="worker-audit-head"><div class="mut" style="font-size:9.5px">Theo dõi ai đã sửa, thời điểm sửa và giá trị trước/sau của hồ sơ này.</div><span class="spacer"></span><button class="btn s sm" data-wa-export="${esc(w.id)}">Xuất Excel</button><button class="btn sm" data-wa-system="${esc(w.id)}">Mở Nhật ký hệ thống</button></div><div class="worker-audit-summary"><span>Sự kiện <b>${L.length}</b></span><span>Trường thay đổi <b>${changes}</b></span><span>Người thao tác <b>${actors.length}</b></span><span>Lần gần nhất <b>${last?esc(eventTime109(last)):'—'}</b></span></div><div class="worker-audit-list">${L.length?L.slice(0,50).map(l=>`<div class="worker-audit-item"><div class="worker-audit-top"><div class="worker-audit-time">${esc(eventTime109(l))}</div><div class="worker-audit-main"><b>${esc(l.d||l.a||'Thay đổi hồ sơ')}</b><div class="worker-audit-meta">${esc(l.actor||'Không xác định')}${l.role?' · '+esc(l.role):''}</div></div><span class="worker-audit-action ${actionClass109(l.a)}">${esc(l.a||'LOG')}</span></div>${diffHtml109(l.changes)}</div>`).join(''):`<div class="worker-audit-empty">Chưa có nhật ký thay đổi riêng cho công nhân này.</div>`}${L.length>50?`<div class="mut" style="font-size:9px;text-align:center">Hiển thị 50/${L.length} sự kiện gần nhất. Dùng Nhật ký hệ thống để xem đầy đủ.</div>`:''}</div></div>`}
 const oldView109=view;
 view=function(w){oldView109(w);const vb=$('vb');if(!vb||!w)return;const old=vb.querySelector('.worker-audit-card');if(old)old.remove();vb.insertAdjacentHTML('beforeend',cardHtml109(w));const ex=vb.querySelector('[data-wa-export]');if(ex)ex.onclick=()=>exportWorkerAudit109(w);const sys=vb.querySelector('[data-wa-system]');if(sys)sys.onclick=()=>{try{$('vdl').close()}catch(e){}go('log');setTimeout(()=>{const q=$('lgq');if(q){q.value=w.name||'';q.dispatchEvent(new Event('input',{bubbles:true}))}},80)}};
 // V148: compact, opt-in detail panel; no data mutation and no impact on worker audit cards.
 if(!document.getElementById('ktx148-log-compact-css')){
   const style=document.createElement('style');style.id='ktx148-log-compact-css';
   style.textContent=`
   #lgbody .ktx148-audit-detail {margin-top:5px;border:1px solid #e0e9f5;border-radius:8px;background:#f8fbff;max-width:100%;}
   #lgbody .ktx148-audit-detail summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:7px;padding:6px 9px;font-size:11px;font-weight:650;color:#24517f;line-height:1.4;user-select:none;}
   #lgbody .ktx148-audit-detail summary::-webkit-details-marker{display:none;}
   #lgbody .ktx148-audit-detail summary:before{content:'▸';font-size:11px;color:#477ec5;}
   #lgbody .ktx148-audit-detail[open] summary:before{content:'▾';}
   #lgbody .ktx148-count{padding:1px 6px;border-radius:999px;background:#e8f1fc;font-weight:600;font-size:10px;color:#356da9;white-space:nowrap;}
   #lgbody .ktx148-hint{font-weight:400;color:#6682a2;font-size:10px;margin-left:auto;white-space:nowrap;}
   #lgbody .ktx148-audit-detail[open] .ktx148-hint{display:none;}
   #lgbody .ktx148-audit-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding:7px;border-top:1px solid #e2ebf7;}
   #lgbody .ktx148-audit-item{display:flex;flex-direction:column;gap:2px;padding:5px 7px;border:1px solid #e4ebf5;border-radius:6px;background:#fff;min-width:0;}
   #lgbody .ktx148-audit-label{font-size:10px;color:#647b98;line-height:1.3;}
   #lgbody .ktx148-audit-value{font-size:11px;color:#183e68;overflow-wrap:anywhere;line-height:1.35;}
   #lgbody .ktx148-audit-value b{font-weight:650;color:#126542;}
   #lgbody .ktx148-audit-value s{color:#a16b70;font-weight:400;}
   #lgbody .ktx148-arrow{margin:0 4px;color:#7488a0;}
   @media(max-width:1050px){#lgbody .ktx148-audit-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
   @media(max-width:640px){#lgbody .ktx148-audit-grid{grid-template-columns:minmax(0,1fr);}}
   `;
   document.head.appendChild(style);
 }
 // V147: KTX provenance in audit logs. Historical DELETE with no workerId/KTX stays unassigned.
 // EXIT_KTX_DETAIL is supplementary evidence only, never a second headcount decrease.
 const oldLog109=logp;
 logp=function(){
   // KTX is audit provenance. Use only original location evidence; never
   // classify a bare PURGE by author, row order, or current totals.
   const auditKtx=(l)=>{
     const p=l&&typeof l.payload==='object'?l.payload:{};
     const changes=Array.isArray(l.changes)?l.changes:[];
     const entry=changes.find(x=>String(x.field||'').toLowerCase()==='ktx');
     const before=l.before&&typeof l.before==='object'?l.before:{};
     const explicit=String(l.ktx||l.k||l.workerKtx||l.previousKtx||p.ktx||p.k||before.ktx||entry?.from||entry?.to||'').trim();
     const normalized=explicit.match(/(?:^|\b)KTX\s*0*([12])(?:$|\b)/i);
     if(normalized)return 'KTX '+normalized[1];
     const id=String(l.workerId||l.worker_id||'');
     if(id){
       const trace=(LOG||[]).find(x=>x.a==='EXIT_KTX_DETAIL'&&String(x.workerId||'')===id&&x.ktx);
       if(trace)return String(trace.ktx);
       const found=(ARC||[]).find(a=>String((a.w&&a.w.id)||a.workerId||a.id||'')===id);
       if(found){const person=found.w||found;const m=String(person.ktx||'').match(/KTX\s*0*([12])/i);if(m)return 'KTX '+m[1]}
     }
     // Only an EXPLICIT location in the text is admissible for older logs.
     const location=String(l.d||l.detail||'').match(/\bKTX\s*0*([12])\b/i);
     return location?'KTX '+location[1]:'';
   };
   // V2614: A generic RPC DELETE/PURGE may omit worker ID and KTX. Match it
   // ONLY to one independently verified, same-actor, same-mode provenance row
   // within 7 seconds. Ambiguity is deliberately left unresolved.
   const logTimestamp=(l)=>{
     const at=l?.at||l?.event_at;
     if(typeof at==='number'&&Number.isFinite(at))return at;
     if(typeof at==='string'){const parsed=Date.parse(at);if(Number.isFinite(parsed))return parsed}
     const t=String(l?.t||'').trim();
     const parse=(y,mo,d,h,mi,se)=>new Date(+y,+mo-1,+d,+(h||0),+(mi||0),+(se||0)).getTime();
     let m=t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
     if(m)return parse(m[3],m[2],m[1],m[4],m[5],m[6]);
     m=t.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
     if(m)return parse(m[6],m[5],m[4],m[1],m[2],m[3]);
     return NaN;
   };
   const isGenericExit=(l)=>{
     const a=String(l?.a||'').toUpperCase(),detail=String(l?.d||'');
     return (a==='DELETE'&&/điều chuyển\/nghỉ việc 1 công nhân/i.test(detail))||
       (a==='PURGE'&&/xóa hẳn 1 công nhân/i.test(detail)&&!/hồ sơ|danh sách điều chuyển/i.test(detail));
   };
   const locationMatches=new Map(),traceMatches=new Map();
   const generic=(LOG||[]).filter(l=>isGenericExit(l)&&!auditKtx(l));
   const traces=(LOG||[]).filter(l=>l.a==='EXIT_KTX_DETAIL'&&auditKtx(l)&&l.workerId);
   const actorKey=l=>String(l?.actor||'').trim().toLocaleLowerCase('vi-VN');
   const eligible=(l,trace)=>{
     const a=String(l.a||'').toUpperCase();
     if((a==='PURGE'?'purge':'archive')!==String(trace.exitMode||''))return false;
     const la=actorKey(l),ta=actorKey(trace);
     if(!la||!ta||la!==ta)return false;
     const diff=Math.abs(logTimestamp(l)-logTimestamp(trace));
     return Number.isFinite(diff)&&diff<=7000;
   };
   generic.forEach(l=>{const options=traces.filter(t=>eligible(l,t));if(options.length===1)locationMatches.set(l,options[0])});
   for(const [l,t] of locationMatches)traceMatches.set(t,(traceMatches.get(t)||0)+1);
   for(const [l,t] of locationMatches)if(traceMatches.get(t)!==1)locationMatches.delete(l);
   const displayAuditKtx=l=>auditKtx(l)||(locationMatches.get(l)?auditKtx(locationMatches.get(l)):'');
   const auditAction=(l)=>l.a==='EXIT_KTX_DETAIL'?'KTX trước khi rời':String(l.a||'');
   // V170: no name-based matching. Only Cloud-created user UUID is trusted.
   const admin=String(SUPA_SYNC.account?.role||ME.role||'')==='admin';
   const currentUid=String(SUPA_SYNC.session?.user?.id||'');
   const visibleLogs=admin?LOG:(!currentUid?[]:LOG.filter(l=>String(l._ktxAuditCreatedBy||'')===currentUid));
   const actors=[...new Set(visibleLogs.map(ktxAuditActorDisplay).filter(Boolean))].sort();
   const acts=[...new Set(visibleLogs.map(auditAction).filter(Boolean))].sort();
   $('log').innerHTML=`<div class="card"><div class="log-toolbar"><input id="lgq" placeholder="Tìm hành động, công nhân, KTX, chi tiết..." style="flex:1;min-width:220px"><select id="lga"><option value="">Tất cả hành động</option>${acts.map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="lgu"><option value="">Tất cả người dùng</option>${actors.map(x=>`<option>${esc(x)}</option>`).join('')}</select><input id="lgd" type="date"></div><div id="lgbody"></div></div>`;
   const render=()=>{
     const q=sa($('lgq').value),a=$('lga').value,u=$('lgu').value,d=$('lgd').value;
     const list=visibleLogs.filter(l=>(!a||auditAction(l)===a)&&(!u||ktxAuditActorDisplay(l)===u)&&(!d||String(l.day||'')===d)&&(!q||sa([l.a,l.d,auditAction(l),ktxAuditActorDisplay(l),l.workerName,displayAuditKtx(l),l.workerDay,l.room,JSON.stringify(l.fields||[]),JSON.stringify(l.changes||[])].join(' ')).includes(q)));
     const shown=list.slice(0,500);
     const unassigned=shown.filter(l=>isGenericExit(l)&&!displayAuditKtx(l)).length;
     const details=shown.filter(l=>l.a==='EXIT_KTX_DETAIL').length;
     $('lgbody').innerHTML=`<div class="mut" style="margin-bottom:8px">${shown.length} bản ghi hiển thị / ${visibleLogs.length} tổng bản ghi${details?' · '+details+' bản ghi KTX đối soát':''}${unassigned?' · '+unassigned+' lần xóa chưa lưu KTX':''}</div><div class="wrap"><table><tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>KTX liên quan</th><th>Chi tiết</th></tr>${shown.map(l=>{
       const w=l.workerId?W.find(x=>String(x.id)===String(l.workerId)):null;
       const ch=Array.isArray(l.changes)?l.changes:[];
       const afterField=field=>{const hit=ch.find(c=>String(c.field||'').toLowerCase()===field);return hit?String(hit.to??hit.after??'').trim():''};
       const k=displayAuditKtx(l),paired=locationMatches.get(l),isExit=l.a==='EXIT_KTX_DETAIL',isDelete=['DELETE','PURGE'].includes(l.a);
       // V157: render an audit summary for additions, but preserve the full LOG
       // record (including changes, workerId, and KTX) for headcount reports.
       const description=String(l.d||'').trim();
       const isWorkerAdd=(l.a==='QR_CHECKIN'||l.a==='IMPORT_CREATE'||l.a==='WORKER_CREATE'||l.a==='QR_APPROVE_IN'||
         (l.a==='CREATE'&&(/(?:thêm\s+(?:mới\s+)?công\s+nhân|duyệt đăng ký vào KTX qua QR)/i.test(description)||
            (afterField('name')&&afterField('ktx')))));
       const addedKtx=String(k||afterField('ktx')||l.after?.ktx||l.payload?.after?.ktx||w?.ktx||'').trim();
       const addedName=String(l.workerName||afterField('name')||l.after?.name||l.payload?.after?.name||w?.name||
         description.replace(/^.*?(?:Thêm công nhân|Duyệt đăng ký vào KTX qua QR)\s*:\s*/i,'')).trim();
       const displayKtx=addedKtx||'Chưa xác định KTX';
       const kCell=isWorkerAdd?esc(displayKtx):(k?`<b>${esc(k)}</b>${l.workerDay?' · '+esc(l.workerDay):''}${l.room?' · P.'+esc(l.room):''}`:(isDelete?'Chưa ghi nhận':'—'));
       const addDescription=isWorkerAdd?`${l.a==='QR_CHECKIN'||/duyệt đăng ký vào KTX qua QR/i.test(description)?'Duyệt đăng ký vào':'Thêm 1 công nhân'}${addedName?' · '+addedName:''} · ${displayKtx}`:'';
       return `<tr><td>${esc(l.t||eventTime109(l))}</td><td class="log-actor">${esc(ktxAuditActorDisplay(l))}<div class="mut" style="font-size:9px">${esc(l.role||'')}</div></td><td><span class="tag">${esc(auditAction(l))}</span></td><td style="white-space:nowrap">${kCell}</td><td><div class="log-detail">${isWorkerAdd?esc(addDescription):`${w?`<button class="log-worker-link" data-log-worker="${esc(w.id)}">${esc(l.workerName||w.name)}</button> · `:''}${esc(description)}`}</div>${isExit?'<span class="mut" style="font-size:10px">Bản ghi bổ sung vị trí, không tính thêm 1 lượt giảm.</span>':''}${paired?'<span class="mut" style="font-size:10px">KTX đối soát từ bản ghi vị trí cùng thao tác; không thay đổi nhật ký gốc.</span>':''}${!isWorkerAdd&&ch.length?`<details class="ktx148-audit-detail"><summary>Thay đổi hồ sơ <span class="ktx148-count">${ch.length} trường</span><span class="ktx148-hint">Bấm để xem</span></summary><div class="ktx148-audit-grid">${ch.map(c=>`<div class="ktx148-audit-item"><span class="ktx148-audit-label">${esc(c.label||LABELS109[c.field]||c.field||'Trường')}</span><span class="ktx148-audit-value">${fmt81(c.from)!=='—'?`<s>${esc(fmt81(c.from))}</s><span class="ktx148-arrow">→</span>`:''}<b>${esc(fmt81(c.to))}</b></span></div>`).join('')}</div></details>`:''}</td></tr>`
     }).join('')}</table></div>`;
     document.querySelectorAll('#lgbody [data-log-worker]').forEach(b=>b.onclick=()=>{const w=W.find(x=>String(x.id)===String(b.dataset.logWorker));if(w)view(w)});
   };
   ['lgq','lga','lgu','lgd'].forEach(id=>$(id).oninput=render);
   render();
 };
 window.KTX_WORKER_AUDIT109={list:workerAudit109,export:exportWorkerAudit109};
})();
