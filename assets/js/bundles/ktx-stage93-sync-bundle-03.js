/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/modules/admin/script-33.js >>> */

const UA_SENSITIVE=new Set(['PURGE','DELETE','IMPORT','BACKUP','RESTORE','SYNC','QR_APPROVE','ACCOUNT','ACCOUNT_DELETE','ROOM_TRANSFER','BULK']);
function uaAt(x){if(Number.isFinite(+x.at)&&+x.at>0)return +x.at;const t=String(x.t||'').trim();if(!t)return 0;const m=t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);if(m)return new Date(+m[3],+m[2]-1,+m[1],+m[4],+m[5],+(m[6]||0)).getTime();const d=Date.parse(t);return Number.isFinite(d)?d:0}
function uaActor(x){return String(x.actor||x.byName||x.userName||x.user||'Không rõ người thực hiện').trim()||'Không rõ người thực hiện'}
function uaRole(x){return ROLES[x.role]||x.role||''}
function uaCategory(a){a=String(a||'').toUpperCase();if(a==='LOGIN'||a==='LOGOUT')return 'Đăng nhập';if(/PURGE|DELETE|RESTORE/.test(a))return 'Xóa / khôi phục';if(/IMPORT/.test(a))return 'Import';if(/BACKUP/.test(a))return 'Backup';if(/SYNC/.test(a))return 'Đồng bộ';if(/ATT_|ATTEND|CHECK/.test(a))return 'Điểm danh';if(/QR/.test(a))return 'QR';if(/TRANSFER|ROOM/.test(a))return 'Phòng';if(/CREATE|UPDATE|EDIT/.test(a))return 'Hồ sơ';if(/ACCOUNT|ROLE|PERM/.test(a))return 'Tài khoản';return 'Khác'}
function uaSensitive(x){const a=String(x.a||'').toUpperCase();return UA_SENSITIVE.has(a)||/PURGE|DELETE|IMPORT|BACKUP|RESTORE|ACCOUNT|SYNC|TRANSFER/.test(a)}
function uaRows(){const logs=LOG.map((x,i)=>({...x,_src:'log',_i:i}));const att=ATT.map((x,i)=>({at:x.at,t:x.at?new Date(x.at).toLocaleString('vi-VN'):'',a:x.type==='in'?'ATT_IN':'ATT_OUT',d:`Xác nhận ${x.type==='in'?'vào':'ra'}: ${x.name||''}${x.mnv?' ('+x.mnv+')':''}`,actor:x.actor||'',role:x.role||'',workerId:x.workerId||'',_src:'att',_i:i}));return [...logs,...att].sort((a,b)=>uaAt(b)-uaAt(a))}
function activityLoginOnce(){try{if(!ME||!ME.id||SD.gate)return;const k='ktx_activity_login_'+ME.id;if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'LOGIN',d:'Đăng nhập hệ thống',day:ldy(),actor:ME.name||ME.id,role:ME.role,at:Date.now()});sv()}catch(e){}}
function uaFmtTime(ms){return ms?new Date(ms).toLocaleString('vi-VN'):'Không rõ'}
function uaExport(rows){const aoa=[['STT','Thời gian','Người thực hiện','Vai trò','Hành động','Nhóm','Chi tiết','Nhạy cảm']];rows.forEach((x,i)=>aoa.push([i+1,uaFmtTime(uaAt(x)),uaActor(x),uaRole(x),x.a||'',uaCategory(x.a),x.d||'',uaSensitive(x)?'Có':'Không']));save(aoa,`Hoat_dong_nguoi_dung_${ldy().split('-').reverse().join('-')}.xlsx`,'Hoạt động người dùng')}
function userActivityPage(){const el=$('activity');if(!el)return;if(!can('acct')){el.innerHTML='<div class="card"><p class="mut">Chỉ Quản trị mới xem được Trung tâm hoạt động người dùng.</p></div>';return}const prev={q:$('ua_q')?.value||'',actor:$('ua_actor')?.value||'',cat:$('ua_cat')?.value||'',range:$('ua_range')?.value||'7'};const allRows=uaRows();const actors=[...new Set(allRows.map(uaActor))].sort((a,b)=>a.localeCompare(b,'vi'));const now=Date.now(),days=+prev.range||0,cut=days?now-days*864e5:0;const filtered=allRows.filter(x=>{const q=sa(prev.q),at=uaAt(x);if(cut&&at&&at<cut)return false;if(prev.actor&&uaActor(x)!==prev.actor)return false;if(prev.cat&&uaCategory(x.a)!==prev.cat)return false;if(q&&!sa([uaActor(x),uaRole(x),x.a,uaCategory(x.a),x.d].join(' ')).includes(q))return false;return true});const unique=new Set(filtered.map(uaActor)).size,sensitive=filtered.filter(uaSensitive).length,today=filtered.filter(x=>{const a=uaAt(x),d=a?new Date(a):null,n=new Date();return d&&d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate()}).length;const userStats={};filtered.forEach(x=>{const n=uaActor(x);userStats[n]=(userStats[n]||0)+1});const topUsers=Object.entries(userStats).sort((a,b)=>b[1]-a[1]).slice(0,8);const cats={};filtered.forEach(x=>{const c=uaCategory(x.a);cats[c]=(cats[c]||0)+1});const catOpts=['Đăng nhập','Hồ sơ','Phòng','Điểm danh','QR','Import','Backup','Đồng bộ','Xóa / khôi phục','Tài khoản','Khác'];el.innerHTML=`<div class="ua-top"><div class="ua-kpi"><span>Hoạt động hiển thị</span><b>${filtered.length.toLocaleString('vi-VN')}</b><small>${days?days+' ngày gần nhất':'Toàn bộ nhật ký'}</small></div><div class="ua-kpi"><span>Người thực hiện</span><b>${unique.toLocaleString('vi-VN')}</b><small>Tài khoản có hoạt động</small></div><div class="ua-kpi"><span>Hôm nay</span><b>${today.toLocaleString('vi-VN')}</b><small>Thao tác trong ngày</small></div><div class="ua-kpi"><span>Thao tác nhạy cảm</span><b>${sensitive.toLocaleString('vi-VN')}</b><small>Xóa · Import · Backup · Đồng bộ...</small></div></div><div class="ua-grid"><div class="card"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px"><div><h3 style="margin:0">Dòng thời gian hoạt động</h3><div class="mut" style="font-size:9px">Gộp Nhật ký hệ thống và Điểm danh; mới nhất hiển thị trước.</div></div><div class="ua-actions"><button class="btn s" id="ua_refresh">Làm mới</button><button class="btn g" id="ua_export">Xuất Excel</button></div></div><div class="ua-toolbar"><input id="ua_q" value="${esc(prev.q)}" placeholder="Tìm hành động, chi tiết, người dùng..."><select id="ua_actor"><option value="">Tất cả người dùng</option>${actors.map(a=>`<option ${a===prev.actor?'selected':''}>${esc(a)}</option>`).join('')}</select><select id="ua_cat"><option value="">Tất cả nhóm</option>${catOpts.map(c=>`<option ${c===prev.cat?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="ua_range"><option value="1" ${prev.range==='1'?'selected':''}>24 giờ</option><option value="7" ${prev.range==='7'?'selected':''}>7 ngày</option><option value="30" ${prev.range==='30'?'selected':''}>30 ngày</option><option value="0" ${prev.range==='0'?'selected':''}>Toàn bộ</option></select><span class="ua-pill">${filtered.length.toLocaleString('vi-VN')} dòng</span></div><div class="ua-list">${filtered.slice(0,1000).map(x=>`<div class="ua-row ${uaSensitive(x)?'sensitive':''} ${String(x.a).toUpperCase()==='LOGIN'?'auth':''}"><i class="ua-dot"></i><div class="ua-time">${esc(uaFmtTime(uaAt(x)))}</div><div class="ua-user"><b>${esc(uaActor(x))}</b><small>${esc(uaRole(x)||'Không rõ vai trò')}</small></div><div class="ua-action">${esc(x.a||'—')}<div style="margin-top:2px"><span class="ua-pill ${uaSensitive(x)?'red':''}">${esc(uaCategory(x.a))}</span></div></div><div class="ua-detail">${esc(x.d||'Không có mô tả')}</div></div>`).join('')||'<div class="ua-empty">Không có hoạt động phù hợp bộ lọc.</div>'}</div>${filtered.length>1000?`<div class="ua-note" style="margin-top:8px">Đang hiển thị 1.000 hoạt động mới nhất trong kết quả lọc để giữ hiệu năng. File Excel vẫn xuất toàn bộ ${filtered.length.toLocaleString('vi-VN')} dòng.</div>`:''}</div><div class="ua-side"><div class="card"><h3>Hoạt động theo người dùng</h3><div class="ua-users">${topUsers.map(([n,c])=>`<div class="ua-userstat"><div><b>${esc(n)}</b><small>${esc(uaRole(filtered.find(x=>uaActor(x)===n)||{}))}</small></div><strong>${c.toLocaleString('vi-VN')}</strong></div>`).join('')||'<div class="mut">Chưa có dữ liệu.</div>'}</div></div><div class="card"><h3>Phân loại hoạt động</h3><div class="ua-breakdown">${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><span>${esc(k)}</span><b>${v.toLocaleString('vi-VN')}</b></div>`).join('')||'<div class="mut">Chưa có dữ liệu.</div>'}</div></div><div class="card"><h3>Phiên hiện tại</h3><div class="ua-note"><b>${esc(ME.name||'Người dùng')}</b><br>Vai trò: ${esc(ROLES[ME.role]||ME.role)}<br>${ME.id?'Đã xác thực tài khoản':'Chế độ cục bộ'}<br><br>Hoạt động mới được gắn tên người thực hiện và vai trò. Các nhật ký cũ chưa có trường actor sẽ hiển thị “Không rõ người thực hiện”.</div></div></div></div>`;let tm=0;const rer=()=>userActivityPage();$('ua_q').oninput=()=>{clearTimeout(tm);tm=setTimeout(rer,180)};['ua_actor','ua_cat','ua_range'].forEach(id=>$(id).onchange=rer);$('ua_refresh').onclick=rer;$('ua_export').onclick=()=>uaExport(filtered)}


/* V2.0.36 — Review-only restore review: no silent data writes. */
(function(){
  if(window.__KTX_V2036_ACTIVITY__)return;
  window.__KTX_V2036_ACTIVITY__=true;
  const original=userActivityPage;
  userActivityPage=function(){
    original.apply(this,arguments);
    try{
      if(!can('acct'))return;
      const el=document.getElementById('activity');
      if(!el||el.querySelector('#v2036Review'))return;
      const rows=Array.isArray(LOG)?LOG:[];
      const changed=rows.filter(x=>/UPDATE|EDIT|MOVE|TRANSFER|IMPORT|DELETE|PURGE|RESTORE|CHECKOUT/i.test(String(x.a||'')));
      const restorable=changed.filter(x=>/DELETE|CHECKOUT/i.test(String(x.a||''))).length;
      const restores=changed.filter(x=>/RESTORE/i.test(String(x.a||''))).length;
      const diff=changed.filter(x=>Array.isArray(x.changes)&&x.changes.length).length;
      const box=document.createElement('div');box.id='v2036Review';box.className='card';
      box.style.cssText='margin:0 0 12px;padding:12px;border:1px solid #dbe6f7;border-radius:12px';
      box.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'
       +'<div><b>Kiểm tra nhật ký & khôi phục an toàn</b><div class="mut" style="font-size:11px">Tổng hợp các sự kiện đã lưu trên thiết bị; không tự khôi phục hoặc thay đổi Supabase.</div></div>'
       +'<div style="display:flex;gap:7px;flex-wrap:wrap"><button type="button" class="btn s sm" id="v2036GoLog">Nhật ký hệ thống</button><button type="button" class="btn s sm" id="v2036GoArchive">Hồ sơ lưu trữ</button><button type="button" class="btn s sm" id="v2036GoBackup">Sao lưu / khôi phục</button></div></div>'
       +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px">'
       +'<span class="ua-pill">Thao tác thay đổi: <b>'+changed.length+'</b></span>'
       +'<span class="ua-pill">Có chi tiết trước/sau: <b>'+diff+'</b></span>'
       +'<span class="ua-pill">Sự kiện xóa/ra KTX: <b>'+restorable+'</b></span>'
       +'<span class="ua-pill">Khôi phục đã ghi nhận: <b>'+restores+'</b></span></div>'
       +'<p class="mut" style="font-size:10px;margin:8px 0 0">Để khôi phục, kiểm tra bản ghi lưu trữ và bản sao lưu trước, đối chiếu dữ liệu trên Supabase. Nhật ký không phải bản sao lưu đầy đủ.</p>';
      el.insertBefore(box,el.firstChild);
      box.querySelector('#v2036GoLog').onclick=()=>go('log');
      box.querySelector('#v2036GoArchive').onclick=()=>go('arc');
      box.querySelector('#v2036GoBackup').onclick=()=>go('backup');
    }catch(e){console.warn('V2036_ACTIVITY_REVIEW',e.message)}
  };
})();

;
/* >>> Original: assets/js/modules/admin/script-34.js >>> */

async function adminDashboardPage(){
 const el=$('adminboard');if(!el)return;
 if(!can('acct')){el.innerHTML='<div class="card"><p class="mut">Chỉ Quản trị mới xem được Dashboard quản trị.</p></div>';return}
 el.innerHTML='<div class="card"><div class="mut" style="padding:14px">Đang tổng hợp trạng thái hệ thống...</div></div>';
 let h=null;try{h=await healthCollect(false)}catch(e){h={online:navigator.onLine,auth:false,syncEnabled:false,syncReady:false,localWorkers:W.length,cloudWorkers:null,workerDelta:null,onlineBackups:0,localBackups:0,lastSync:null,lastError:String(e.message||e),healthKind:'bad',healthText:'Cần kiểm tra',bad:1,warn:0}}
 let audit=[];try{audit=typeof dataAuditScan==='function'?dataAuditScan():[]}catch(e){audit=[]}
 let alerts=[];try{alerts=typeof issueList==='function'?issueList():[]}catch(e){alerts=[]}
 let acts=[];try{acts=typeof uaRows==='function'?uaRows():[]}catch(e){acts=[]}
 const badAudit=audit.filter(x=>x.sev==='danger').length,warnAudit=audit.filter(x=>x.sev==='warn').length;
 const sensitive=acts.filter(x=>typeof uaSensitive==='function'&&uaSensitive(x)).length;
 const cloudKnown=typeof h.cloudWorkers==='number',delta=cloudKnown?Math.abs(Number(h.workerDelta||0)):null;
 const kKind=h.bad?'bad':(h.warn||badAudit||warnAudit)?'warn':'ok';
 const alertTop=alerts.slice(0,8),actTop=acts.slice(0,8);
 const status=(kind,title,detail)=>`<div class="adm-status ${kind}"><i></i><b>${esc(title)}</b><span>${esc(detail)}</span></div>`;
 el.innerHTML=`<div class="adm-top">
 <div class="adm-kpi ${kKind}"><span>Tình trạng chung</span><b>${esc(h.healthText||'Đang theo dõi')}</b><small>${Number(h.bad||0)} lỗi · ${Number(h.warn||0)} cần chú ý</small></div>
 <div class="adm-kpi ${h.syncReady&&!h.lastError?'ok':'warn'}"><span>Đồng bộ Supabase</span><b>${h.syncReady?'Sẵn sàng':'Cần kiểm tra'}</b><small>${h.lastSync?'Lần gần nhất '+healthDate(h.lastSync):'Chưa có mốc đồng bộ'}</small></div>
 <div class="adm-kpi ${cloudKnown?(delta===0?'ok':'warn'):'warn'}"><span>Local / Cloud</span><b>${Number(h.localWorkers||W.length).toLocaleString('vi-VN')} / ${cloudKnown?Number(h.cloudWorkers).toLocaleString('vi-VN'):'—'}</b><small>${cloudKnown?(delta===0?'Dữ liệu khớp':'Chênh '+delta.toLocaleString('vi-VN')+' hồ sơ'):'Chưa đối chiếu Cloud'}</small></div>
 <div class="adm-kpi ${badAudit?'bad':warnAudit?'warn':'ok'}"><span>Chất lượng dữ liệu</span><b>${audit.length.toLocaleString('vi-VN')}</b><small>${badAudit} nghiêm trọng · ${warnAudit} cảnh báo</small></div>
 <div class="adm-kpi ${Number(h.onlineBackups||0)>0?'ok':'warn'}"><span>Backup online</span><b>${Number(h.onlineBackups||0).toLocaleString('vi-VN')}</b><small>${Number(h.localBackups||0)} bản trên máy</small></div>
 </div>
 <div class="adm-grid"><div>
 <div class="card adm-card"><div class="adm-head"><h3>Trạng thái vận hành</h3><span class="spacer"></span><button class="btn s sm" id="admRefresh">Làm mới</button></div><div class="adm-status-list">
 ${status(h.online?'ok':'bad','Kết nối Internet',h.online?'Đang online':'Mất kết nối mạng')}
 ${status(h.auth?'ok':'bad','Supabase Auth',h.auth?'Đã đăng nhập':'Chưa đăng nhập Supabase')}
 ${status(h.syncReady&&!h.lastError?'ok':h.syncEnabled?'warn':'bad','Đồng bộ dữ liệu',h.syncEnabled?(h.syncReady?'Đang hoạt động':'Đã bật nhưng chưa sẵn sàng'):'Đang tắt')}
 ${status(cloudKnown?(delta===0?'ok':'warn'):'warn','Đối chiếu Local / Cloud',cloudKnown?(delta===0?'Số công nhân đang khớp':`Chênh ${delta.toLocaleString('vi-VN')} hồ sơ`):'Chưa lấy được số liệu Cloud')}
 ${status(badAudit?'bad':warnAudit?'warn':'ok','Kiểm tra dữ liệu',audit.length?`${audit.length.toLocaleString('vi-VN')} vấn đề · ${badAudit} nghiêm trọng · ${warnAudit} cảnh báo`:'Không phát hiện vấn đề')}
 ${status(Number(h.onlineBackups||0)>0?'ok':'warn','Backup dữ liệu',`Online ${Number(h.onlineBackups||0)} · Trên máy ${Number(h.localBackups||0)}`)}
 </div></div>
 <div class="card adm-card"><div class="adm-head"><h3>Cảnh báo cần chú ý</h3></div><div class="adm-alerts">${alertTop.length?alertTop.map(x=>`<div class="adm-alert ${x.sev==='danger'?'danger':x.sev==='warn'?'warn':''}"><b>${esc(x.title||'Cảnh báo')}</b><small>${esc(x.detail||'')}</small></div>`).join(''):'<div class="adm-note">Hiện không có cảnh báo cần xử lý.</div>'}</div>${alerts.length>8?`<div class="adm-note" style="margin-top:7px">Đang hiển thị 8/${alerts.length} cảnh báo mới nhất.</div>`:''}</div>
 <div class="card adm-card"><div class="adm-head"><h3>Hoạt động người dùng gần nhất</h3><span class="spacer"></span><button class="btn s sm" data-adm-go="activity">Xem toàn bộ</button></div><div class="adm-activity">${actTop.length?actTop.map(x=>`<div class="adm-act"><time>${esc(typeof uaFmtTime==='function'?uaFmtTime(uaAt(x)):(x.t||'—'))}</time><strong>${esc(typeof uaActor==='function'?uaActor(x):(x.actor||'Không rõ'))}</strong><span class="tag">${esc(x.a||'LOG')}</span><span>${esc(x.d||'')}</span></div>`).join(''):'<div class="adm-note">Chưa có hoạt động người dùng.</div>'}</div></div>
 </div><div>
 <div class="card adm-card"><h3>Thống kê nhanh</h3><div class="adm-mini"><span>Công nhân hiện tại</span><b>${W.length.toLocaleString('vi-VN')}</b></div><div class="adm-mini"><span>Điều chuyển · Nghỉ việc</span><b>${ARC.length.toLocaleString('vi-VN')}</b></div><div class="adm-mini"><span>Nhật ký hệ thống</span><b>${LOG.length.toLocaleString('vi-VN')}</b></div><div class="adm-mini"><span>Điểm danh</span><b>${ATT.length.toLocaleString('vi-VN')}</b></div><div class="adm-mini"><span>Đăng ký chờ xử lý</span><b>${REG.length.toLocaleString('vi-VN')}</b></div><div class="adm-mini"><span>Thao tác nhạy cảm</span><b>${sensitive.toLocaleString('vi-VN')}</b></div></div>
 <div class="card adm-card"><h3>Đi đến chức năng quản trị</h3><div class="adm-actions"><button class="btn s" data-adm-go="health">Sức khỏe hệ thống</button><button class="btn s" data-adm-go="sync">Đồng bộ Supabase</button><button class="btn s" data-adm-go="backup">Sao lưu dữ liệu</button><button class="btn s" data-adm-go="dataaudit">Kiểm tra dữ liệu</button><button class="btn s" data-adm-go="activity">Hoạt động người dùng</button><button class="btn s" data-adm-go="safety">An toàn dữ liệu</button></div></div>
 <div class="adm-note"><b>Dashboard quản trị chỉ tổng hợp và điều hướng.</b> Trang này không tự sửa, xóa, khôi phục hoặc đồng bộ dữ liệu nếu Quản trị chưa bấm thực hiện tại chức năng tương ứng.</div>
 </div></div>`;
 $('admRefresh').onclick=()=>adminDashboardPage();el.querySelectorAll('[data-adm-go]').forEach(b=>b.onclick=()=>go(b.dataset.admGo));
}

/* STEP113–120 · Hoàn thiện vận hành & phát hành v1.0 */
const KTX_V1='KTX-v1.0.0',INC_KEY='ktx_incidents_v1',QA_KEY='ktx_prod_qa_v1',RPT_KEY='ktx_period_reports_v1',SEC_KEY='ktx_security_sessions_v1';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(e){return d}},jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
function fmtDT(x){try{return new Date(x).toLocaleString('vi-VN')}catch(e){return '—'}}
function incidentAdd(source,msg,sev='high',detail=''){
 const L=jget(INC_KEY,[]),now=Date.now(),text=String(msg||'Lỗi không xác định').slice(0,800);
 // V2.0.161: one open incident per identical source/message per day, not one every 30s.
 // Keep evidence of recurrence with lastSeen/repeatCount; never silently mark it fixed.
 const duplicate=L.find(x=>!x.resolved&&x.source===source&&x.msg===text&&now-Number(x.lastSeen||x.at||0)<86400000);
 if(duplicate){duplicate.lastSeen=now;duplicate.repeatCount=Number(duplicate.repeatCount||1)+1;
  if(duplicate.repeatCount===2||duplicate.repeatCount%20===0){jset(INC_KEY,L);updateIncidentBadge()}
  return;
 }
 const nuisance=/^ResizeObserver loop (?:completed with undelivered notifications|limit exceeded)/i.test(text);
 L.unshift({id:'inc_'+now.toString(36)+Math.random().toString(36).slice(2,5),at:now,lastSeen:now,repeatCount:1,source,msg:text,detail:String(detail||'').slice(0,1200),sev:nuisance?'warn':sev,resolved:false,actor:ME&&((ME.name||ME.id))||'Hệ thống'});
 jset(INC_KEY,L.slice(0,500));updateIncidentBadge();
}
function updateIncidentBadge(){const e=$('incNavCount');if(!e)return;const n=jget(INC_KEY,[]).filter(x=>!x.resolved).length;e.style.display=n?'inline-flex':'none';e.textContent=n>99?'99+':n}
if(!window.__ktxErrBound){window.__ktxErrBound=1;window.addEventListener('error',e=>incidentAdd('Ứng dụng',e.message||'JavaScript error','high',`${e.filename||''}:${e.lineno||''}`));window.addEventListener('unhandledrejection',e=>incidentAdd('Promise',e.reason&&e.reason.message||String(e.reason||'Unhandled rejection'),'high'))}
function incidentCenterPage(){const el=$('incidents');if(!el)return;const L=jget(INC_KEY,[]);const open=L.filter(x=>!x.resolved),hi=open.filter(x=>x.sev==='high').length,warn=open.filter(x=>x.sev==='warn').length;el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Chưa xử lý</span><b>${open.length}</b><small>Sự cố đang mở</small></div><div class="sys-kpi"><span>Nghiêm trọng</span><b>${hi}</b><small>Cần ưu tiên kiểm tra</small></div><div class="sys-kpi"><span>Cảnh báo</span><b>${warn}</b><small>Cần rà soát</small></div><div class="sys-kpi"><span>Tổng lịch sử</span><b>${L.length}</b><small>Tối đa 500 bản ghi</small></div></div><div class="card"><div class="sys-head"><div><h3>Lịch sử sự cố</h3><div class="mut">Lỗi ứng dụng được ghi tự động; lỗi nghiệp vụ có thể bổ sung từ Nhật ký hệ thống.</div></div><span class="spacer"></span><select id="incFilter"><option value="open">Chưa xử lý</option><option value="all">Tất cả</option><option value="high">Nghiêm trọng</option><option value="resolved">Đã xử lý</option></select><button class="btn s sm" id="incExport">Xuất Excel</button></div><div id="incList"></div></div>`;const render=()=>{const f=$('incFilter').value;let rows=L.filter(x=>f==='all'||(f==='open'&&!x.resolved)||(f==='resolved'&&x.resolved)||(f==='high'&&!x.resolved&&x.sev==='high'));$('incList').innerHTML=`<div class="sys-list">${rows.map(x=>`<div class="sys-row"><time>${esc(fmtDT(x.at))}</time><span class="sev ${x.resolved?'ok':x.sev}">${x.resolved?'Đã xử lý':x.sev==='high'?'Nghiêm trọng':x.sev==='warn'?'Cảnh báo':'Thông tin'}</span><div><b>${esc(x.source||'Hệ thống')}</b><div>${esc(x.msg)}</div>${x.repeatCount>1?`<small class="mut">Lặp ${x.repeatCount} lần · Lần gần nhất ${esc(fmtDT(x.lastSeen||x.at))}</small>`:''}${x.detail?`<small class="mut">${esc(x.detail)}</small>`:''}</div><button class="btn s sm" data-inc="${x.id}">${x.resolved?'Mở lại':'Đã xử lý'}</button></div>`).join('')||'<div class="sys-note">Không có sự cố phù hợp bộ lọc.</div>'}</div>`;$('incList').querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{const x=L.find(z=>z.id===b.dataset.inc);if(x){x.resolved=!x.resolved;jset(INC_KEY,L);incidentCenterPage()}})};$('incFilter').onchange=render;$('incExport').onclick=()=>{const aoa=[['STT','Thời gian','Mức độ','Nguồn','Nội dung','Chi tiết','Trạng thái','Người ghi']];L.forEach((x,i)=>aoa.push([i+1,fmtDT(x.at),x.sev,x.source,x.msg,x.detail,x.resolved?'Đã xử lý':'Chưa xử lý',x.actor]));save(aoa,`Su_co_he_thong_${ldy()}.xlsx`,'Sự cố')};render();updateIncidentBadge()}
function securityCollect(){const acc=Object.entries(SD.ACC||{});const acts=(LOG||[]).slice().sort((a,b)=>(b.t||b.at||0)-(a.t||a.at||0));const by={};acts.forEach(x=>{const u=(x.actor||x.user||'').trim();if(u&&!by[u])by[u]=x.t||x.at||Date.now()});return {acc,acts,by,online:navigator.onLine!==false,auth:!!(SUPA_SYNC&&SUPA_SYNC.session),email:SUPA_SYNC&&SUPA_SYNC.session&&SUPA_SYNC.session.user&&SUPA_SYNC.session.user.email||'',last:SUPA_SYNC&&SUPA_SYNC.lastSync||0}}
function securityPage(){const el=$('security');if(!el)return;const d=securityCollect(),stale=d.acc.filter(([id,a])=>{const t=d.by[a.name]||d.by[id]||0;return t&&Date.now()-t>90*864e5}).length;el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Tài khoản cấu hình</span><b>${d.acc.length}</b><small>Trong ứng dụng</small></div><div class="sys-kpi"><span>Supabase Auth</span><b>${d.auth?'ON':'OFF'}</b><small>${esc(d.email||'Chưa đăng nhập')}</small></div><div class="sys-kpi"><span>Lâu không hoạt động</span><b>${stale}</b><small>Trên 90 ngày nếu có lịch sử</small></div><div class="sys-kpi"><span>Internet</span><b>${d.online?'Online':'Offline'}</b><small>Phiên trình duyệt hiện tại</small></div></div><div class="sys-grid"><div class="card"><div class="sys-head"><h3>Tài khoản & hoạt động gần nhất</h3></div><div class="wrap"><table class="cmp3"><tr><th>Tài khoản</th><th>Vai trò</th><th>Phạm vi</th><th>Hoạt động gần nhất</th><th>Trạng thái</th></tr>${d.acc.map(([id,a])=>{const t=d.by[a.name]||d.by[id]||0,old=t&&Date.now()-t>90*864e5;return `<tr><td><b>${esc(a.name||id)}</b><div class="mut">${esc(id)}</div></td><td>${esc(ROLES[a.role]||a.role)}</td><td>${esc(typeof accessScopeText==='function'?accessScopeText(a):'—')}</td><td>${t?esc(fmtDT(t)):'Chưa có dữ liệu'}</td><td><span class="sev ${old?'warn':'ok'}">${old?'Cần rà soát':'Bình thường'}</span></td></tr>`}).join('')}</table></div></div><div><div class="card"><h3>Phiên hiện tại</h3><div class="sys-note"><b>Người dùng:</b> ${esc(ME.name||ME.id||'—')}<br><b>Vai trò:</b> ${esc(ROLES[ME.role]||ME.role)}<br><b>Supabase:</b> ${d.auth?'Đã đăng nhập':'Chưa đăng nhập'}<br><b>Đồng bộ gần nhất:</b> ${d.last?esc(fmtDT(d.last)):'Chưa có'}<br><br><b>Giới hạn kỹ thuật:</b> ứng dụng web phía client không thể liệt kê hoặc thu hồi toàn bộ phiên đăng nhập trên các thiết bị khác nếu không có dịch vụ Admin phía máy chủ. Trang này chỉ giám sát phiên hiện tại và lịch sử hoạt động đã có.</div><div class="sys-actions" style="margin-top:10px"><button class="btn s" id="secActivity">Hoạt động người dùng</button><button class="btn r" id="secLogout">Đăng xuất Supabase phiên này</button></div></div></div></div>`;$('secActivity').onclick=()=>go('activity');$('secLogout').onclick=async()=>{if(!SUPA_SYNC||!SUPA_SYNC.session)return alert('Phiên này chưa đăng nhập Supabase.');if(!confirm('Đăng xuất Supabase trên trình duyệt hiện tại?'))return;try{await syncLogout();securityPage()}catch(e){incidentAdd('Bảo mật',e.message||e,'warn');alert(e.message||e)}}}
function opsBoardPage(){const el=$('opsboard');if(!el)return;const today=ldy(),ins=(ATT||[]).filter(x=>x.day===today&&x.type==='in').length,outs=(ATT||[]).filter(x=>x.day===today&&x.type==='out').length,over=rooms(W).filter(r=>r.n>CAP),full=rooms(W).filter(r=>r.n>=CAP),audit=typeof auditCollect==='function'?auditCollect():[],critical=audit.filter(x=>x.sev==='high'||x.sev==='danger'),pending=(REG||[]).filter(x=>!x.status||x.status==='pending').length;const tasks=[];if(over.length)tasks.push(['Phòng quá tải',`${over.length} phòng vượt ${CAP} người`,'high','home']);if(critical.length)tasks.push(['Dữ liệu cần xử lý',`${critical.length} vấn đề nghiêm trọng`,'high','dataaudit']);if(pending)tasks.push(['Đăng ký chờ xử lý',`${pending} hồ sơ đang chờ`,'warn','qr']);if(SUPA_SYNC&&SUPA_SYNC.lastError)tasks.push(['Đồng bộ có lỗi',String(SUPA_SYNC.lastError).slice(0,120),'high','sync']);if(!tasks.length)tasks.push(['Vận hành ổn định','Chưa phát hiện đầu việc ưu tiên từ dữ liệu hiện tại','ok','home']);el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Quân số hiện tại</span><b>${W.length.toLocaleString('vi-VN')}</b><small>Công nhân đang ở KTX</small></div><div class="sys-kpi"><span>Vào / Ra hôm nay</span><b>${ins} / ${outs}</b><small>${esc(vn(today))}</small></div><div class="sys-kpi"><span>Phòng đầy / quá tải</span><b>${full.length} / ${over.length}</b><small>Định mức ${CAP} người/phòng</small></div><div class="sys-kpi"><span>Cần xử lý</span><b>${tasks.filter(x=>x[2]!=='ok').length}</b><small>Đầu việc ưu tiên</small></div></div><div class="sys-grid"><div class="card"><div class="sys-head"><h3>Việc cần xử lý trong ngày</h3><span class="spacer"></span><button class="btn s sm" id="opsRefresh">Làm mới</button></div><div class="ops-tasks">${tasks.map((x,i)=>`<div class="ops-task"><span class="pill-sm ${x[2]==='high'?'hot':x[2]==='warn'?'warn':''}">${x[2]==='high'?'Ưu tiên':x[2]==='warn'?'Cảnh báo':'Ổn'}</span><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div><span class="spacer"></span><button class="btn s sm" data-ops="${x[3]}">Mở</button></div>`).join('')}</div></div><div><div class="card"><h3>Trạng thái nhanh</h3><div class="mini-bars"><div class="mini-bar"><span>Lấp đầy</span><i style="--w:${Math.min(100,(W.length/Math.max(1,rooms(W).length*CAP))*100)}%"></i><b>${Math.round((W.length/Math.max(1,rooms(W).length*CAP))*100)}%</b></div><div class="mini-bar"><span>Phòng không quá tải</span><i style="--w:${Math.max(0,100-(over.length/Math.max(1,rooms(W).length))*100)}%"></i><b>${Math.round(Math.max(0,100-(over.length/Math.max(1,rooms(W).length))*100))}%</b></div></div><div class="sys-actions" style="margin-top:12px"><button class="btn s" data-ops="alerts">Trung tâm cảnh báo</button><button class="btn s" data-ops="reports">Trung tâm báo cáo</button></div></div></div></div>`;$('opsRefresh').onclick=opsBoardPage;el.querySelectorAll('[data-ops]').forEach(b=>b.onclick=()=>go(b.dataset.ops))}
function reportSnapshot(kind){const now=new Date(),audit=typeof auditCollect==='function'?auditCollect():[];return {id:'rpt_'+Date.now().toString(36),at:Date.now(),kind,day:ldy(),workers:W.length,archive:ARC.length,rooms:rooms(W).length,over:rooms(W).filter(r=>r.n>CAP).length,issues:audit.length,attendanceIn:(ATT||[]).filter(x=>x.day===ldy()&&x.type==='in').length,attendanceOut:(ATT||[]).filter(x=>x.day===ldy()&&x.type==='out').length,actor:ME.name||ME.id||'Hệ thống'}}
function reportAutoMaybe(force=false){let L=jget(RPT_KEY,[]),today=ldy(),d=new Date(),week=`${d.getFullYear()}-W${Math.ceil((((d-new Date(d.getFullYear(),0,1))/864e5)+new Date(d.getFullYear(),0,1).getDay()+1)/7)}`,month=today.slice(0,7);[['daily',today],['weekly',week],['monthly',month]].forEach(([kind,key])=>{if(force||!L.some(x=>x.kind===kind&&x.key===key)){let r=reportSnapshot(kind);r.key=key;L.unshift(r)}});L=L.slice(0,180);jset(RPT_KEY,L);return L}
function reportAutoPage(){const el=$('reportauto');if(!el)return;const L=reportAutoMaybe(false);el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Bản chốt ngày</span><b>${L.filter(x=>x.kind==='daily').length}</b><small>Lưu khi ứng dụng hoạt động</small></div><div class="sys-kpi"><span>Bản chốt tuần</span><b>${L.filter(x=>x.kind==='weekly').length}</b><small>Theo tuần</small></div><div class="sys-kpi"><span>Bản chốt tháng</span><b>${L.filter(x=>x.kind==='monthly').length}</b><small>Theo tháng</small></div><div class="sys-kpi"><span>Gần nhất</span><b style="font-size:13px">${L[0]?esc(fmtDT(L[0].at)):'—'}</b><small>Tối đa 180 bản</small></div></div><div class="card"><div class="sys-head"><div><h3>Lịch sử chốt số liệu</h3><div class="mut">Tự động tạo khi ứng dụng được mở. Không thể chạy khi trình duyệt/app đã đóng nếu chưa có backend scheduler.</div></div><span class="spacer"></span><button class="btn g sm" id="rptNow">Chốt ngay</button><button class="btn s sm" id="rptExport">Xuất Excel</button></div><div class="wrap"><table class="cmp3"><tr><th>Thời gian</th><th>Chu kỳ</th><th>Công nhân</th><th>Phòng</th><th>Quá tải</th><th>Vào/Ra</th><th>Vấn đề dữ liệu</th></tr>${L.slice(0,80).map(x=>`<tr><td>${esc(fmtDT(x.at))}</td><td>${x.kind==='daily'?'Ngày':x.kind==='weekly'?'Tuần':'Tháng'}</td><td>${x.workers}</td><td>${x.rooms}</td><td>${x.over}</td><td>${x.attendanceIn}/${x.attendanceOut}</td><td>${x.issues}</td></tr>`).join('')}</table></div></div>`;$('rptNow').onclick=()=>{reportAutoMaybe(true);reportAutoPage()};$('rptExport').onclick=()=>{const a=[['STT','Thời gian','Chu kỳ','Khóa kỳ','Công nhân','Lưu trữ','Phòng','Quá tải','Vào','Ra','Vấn đề']];L.forEach((x,i)=>a.push([i+1,fmtDT(x.at),x.kind,x.key,x.workers,x.archive,x.rooms,x.over,x.attendanceIn,x.attendanceOut,x.issues]));save(a,`Bao_cao_dinh_ky_${ldy()}.xlsx`,'Báo cáo định kỳ')}}
// V2.0.41: inspect raw stored fields, not display helpers K/D/R (which now normalize on read).
// Preview only recognized transformations. Unrecognized values remain unchanged.
function stdScan(){
 const out=[];
 W.forEach(w=>{
  const fields=[['sdt','SĐT',v=>v.replace(/\D/g,'')],['cccd','CCCD',v=>v.replace(/\D/g,'')],
   ['mnv','Mã NV',v=>v.trim().replace(/\.0$/,'')],
   ['ktx','KTX',normKtx],['day','Dãy',normDay],['room','Phòng',normRoom]];
  for(const [key,label,fn] of fields){const raw=String(w[key]??'');if(!raw.trim())continue;
   const fixed=fn(raw.trim());if(fixed!==raw)out.push({w,key,f:label,old:raw,new:fixed});
  }
 });
 return out;
}
function standardsPage(){
 const el=$('standards');if(!el)return;
 const allChanges=stdScan();
 const L=allChanges.filter(x=>typeof can==='function'&&can('editw',x.w));
 const affected=new Set(L.map(x=>x.w.id)).size;
 const unrecognized=[];
 for(const w of W){
  for(const [key,label,fn] of [['ktx','KTX',normKtx],['day','Dãy',normDay],['room','Phòng',normRoom]]){
   const raw=String(w[key]??'').trim();if(!raw)continue;
   const v=fn(raw);
   const valid=key==='ktx'?/^KTX [1-3]$/.test(v):key==='day'?/^Dãy [1-6]$/.test(v):/^[1-9]\d{0,2}[A-Z]?$/.test(v);
   if(!valid)unrecognized.push({w,f:label,old:raw});
  }
 }
 const fmt=x=>esc(String(x==null?'':x));
 el.innerHTML=`<div class="sys-kpis">
  <div class="sys-kpi"><span>Trường có thể chuẩn hóa</span><b>${L.length}</b><small>Theo quyền sửa hồ sơ</small></div>
  <div class="sys-kpi"><span>Hồ sơ ảnh hưởng</span><b>${affected}</b><small>Không tự sửa dữ liệu</small></div>
  <div class="sys-kpi"><span>KTX / Dãy / Phòng</span><b>${L.filter(x=>['KTX','Dãy','Phòng'].includes(x.f)).length}</b><small>Quy về một mã</small></div>
  <div class="sys-kpi"><span>Không nhận diện</span><b>${unrecognized.length}</b><small>Giữ nguyên, kiểm tra thủ công</small></div>
 </div>
 <div class="card"><div class="sys-head"><div><h3>Xem trước chuẩn hóa KTX – Dãy – Phòng</h3>
 <div class="mut">Ví dụ: ktx1 / một → KTX 1; day1 / Đây 1 → Dãy 1; phongf01 / 01 → mã phòng 1 (hiển thị “Phòng 1”). Dữ liệu chưa rõ không tự sửa.</div></div><span class="spacer"></span>
 <button class="btn g sm" id="stdApply" ${!L.length?'disabled':''}>Xác nhận áp dụng (${affected} hồ sơ)</button></div>
 <div class="wrap"><table class="cmp3 std-preview"><tr><th>Họ tên</th><th>Trường</th><th>Đang lưu</th><th>Chuẩn hóa thành</th></tr>
 ${L.slice(0,200).map(x=>`<tr><td>${fmt(x.w.name)}</td><td>${fmt(x.f)}</td><td>${fmt(x.old)}</td><td>${fmt(x.key==='room'?'Phòng '+x.new:x.new)}</td></tr>`).join('')||'<tr><td colspan="4">Không còn giá trị đủ điều kiện chuẩn hóa trong phạm vi được sửa.</td></tr>'}</table></div>
 ${L.length>200?`<div class="sys-note">Đang hiển thị 200/${L.length} thay đổi.</div>`:''}</div>
 ${unrecognized.length?`<div class="card"><h3>Cần kiểm tra thủ công (${unrecognized.length})</h3><div class="mut">Không tự đoán hoặc sửa những mã không nhận diện được.</div><div class="wrap"><table class="cmp3"><tr><th>Họ tên</th><th>Trường</th><th>Giá trị chưa rõ</th></tr>${unrecognized.slice(0,100).map(x=>`<tr><td>${fmt(x.w.name)}</td><td>${fmt(x.f)}</td><td>${fmt(x.old)}</td></tr>`).join('')}</table></div></div>`:''}`;
 $('stdApply').onclick=async()=>{
  if(!L.length)return;
  if(typeof can!=='function'||!can('edit'))return alert('Tài khoản không có quyền chuẩn hóa hồ sơ.');
  if(!window.KTX_SUPA_SYNC?.ready||typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.enabled||!navigator.onLine){
   alert('Cần đăng nhập và kết nối Supabase trước khi chuẩn hóa. Chưa có dữ liệu nào được thay đổi.');return;
  }
  if(!await ask(`Áp dụng ${L.length} thay đổi trên ${affected} hồ sơ?\nCác giá trị không nhận diện được sẽ giữ nguyên.`,{title:'Xác nhận chuẩn hóa',ok:'Áp dụng'}))return;
  // Snapshot RAM for restoring if cloud acknowledgement fails. Do not silently commit offline.
  const snapshot={W:JSON.parse(JSON.stringify(W)),LOG:JSON.parse(JSON.stringify(LOG))};
  try{
   if(typeof safePointCreate==='function')await safePointCreate('Trước chuẩn hóa KTX/Dãy/Phòng');
   let updates=0;
   for(const x of L){if(!can('editw',x.w))continue;
    if(String(x.w[x.key]??'')!==x.old)continue;
    x.w[x.key]=x.new;updates++;
   }
   if(!updates)return standardsPage();
   sv();add('NORMALIZE',`Chuẩn hóa ${updates} trường cho ${affected} công nhân`);
   if(typeof workerCloudConfirm==='function')await workerCloudConfirm(snapshot);
   else throw new Error('Không tìm thấy cơ chế xác nhận lưu Supabase.');
   if(typeof all==='function')all();standardsPage();
   alert(`Supabase đã xác nhận chuẩn hóa ${updates} trường dữ liệu.`);
  }catch(e){
   if(typeof workerRestoreAfterCloudError==='function')workerRestoreAfterCloudError(snapshot);
   else {W=snapshot.W;LOG=snapshot.LOG;}
   standardsPage();alert('Chưa lưu được thay đổi lên Supabase: '+String(e?.message||e));
  }
 };
}
function maintenancePage(){const el=$('maintenance');if(!el)return;const inc=jget(INC_KEY,[]),rpt=jget(RPT_KEY,[]),autos=bkAutos();el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Nhật ký hệ thống</span><b>${LOG.length}</b><small>Bản ghi hiện có</small></div><div class="sys-kpi"><span>Sự cố</span><b>${inc.length}</b><small>${inc.filter(x=>x.resolved).length} đã xử lý</small></div><div class="sys-kpi"><span>Báo cáo chốt</span><b>${rpt.length}</b><small>Ngày/tuần/tháng</small></div><div class="sys-kpi"><span>Backup trên máy</span><b>${autos.length}</b><small>Theo cấu hình hiện tại</small></div></div><div class="sys-grid"><div class="card"><h3>Dọn dữ liệu cũ</h3><div class="maint-box"><b>Nhật ký hệ thống quá 365 ngày</b><small>Chỉ dọn lịch sử cũ, không ảnh hưởng hồ sơ công nhân.</small><button class="btn s sm" data-clean="logs">Dọn nhật ký cũ</button></div><div class="maint-box"><b>Sự cố đã xử lý quá 90 ngày</b><small>Giữ lại các sự cố chưa xử lý.</small><button class="btn s sm" data-clean="inc">Dọn sự cố cũ</button></div><div class="maint-box"><b>Bản chốt báo cáo quá 24 tháng</b><small>Giữ dữ liệu gần đây để ứng dụng nhẹ hơn.</small><button class="btn s sm" data-clean="rpt">Dọn báo cáo cũ</button></div></div><div><div class="card"><h3>Lưu trữ hồ sơ</h3><div class="sys-note">Danh sách <b>Điều chuyển · Nghỉ việc</b> đang đóng vai trò kho lưu hồ sơ đã rời danh sách chính. Bản này không tự xóa hồ sơ lưu trữ để tránh mất lịch sử cư trú.</div><div class="sys-actions" style="margin-top:10px"><button class="btn s" id="maintArc">Mở Điều chuyển · Nghỉ việc</button><button class="btn s" id="maintBackup">Mở Sao lưu dữ liệu</button></div></div></div></div>`;el.querySelectorAll('[data-clean]').forEach(b=>b.onclick=async()=>{if(!await ask('Thao tác sẽ dọn dữ liệu cũ theo chính sách hiển thị. Tiếp tục?',{title:'Bảo trì dữ liệu',ok:'Dọn dữ liệu'}))return;const now=Date.now();if(b.dataset.clean==='logs'){LOG=LOG.filter(x=>now-(x.t||x.at||now)<=365*864e5);sv()}if(b.dataset.clean==='inc'){jset(INC_KEY,inc.filter(x=>!x.resolved||now-(x.at||now)<=90*864e5))}if(b.dataset.clean==='rpt'){jset(RPT_KEY,rpt.filter(x=>now-(x.at||now)<=730*864e5))}add('MAINTENANCE',`Dọn dữ liệu cũ: ${b.dataset.clean}`);maintenancePage()});$('maintArc').onclick=()=>go('arc');$('maintBackup').onclick=()=>go('backup')}
const QA_ITEMS=['Đăng nhập đúng vai trò','Phân quyền Admin/Quản lý/Nhập liệu/Bảo vệ/Chỉ xem','Quản lý công nhân: thêm/sửa/xóa theo quyền','Import Excel và cảnh báo dữ liệu','Chuyển phòng và lịch sử cư trú','Tạm trú/Tạm vắng','QR đăng ký vào/ra và duyệt','Điểm danh vào/ra','Đồng bộ Supabase trên 2 thiết bị','Xử lý xung đột đa máy','Mất mạng và hàng đợi đồng bộ','Backup online và khôi phục','Trung tâm cảnh báo','Trung tâm báo cáo và xuất file','PWA cài đặt/mở standalone','Kiểm tra dữ liệu và chuẩn hóa','An toàn dữ liệu/điểm khôi phục','Trung tâm sự cố không còn lỗi nghiêm trọng chưa xử lý'];
function qaPage(){const el=$('qa');if(!el)return;const state=jget(QA_KEY,{}),done=QA_ITEMS.filter((_,i)=>state[i]).length,openInc=jget(INC_KEY,[]).filter(x=>!x.resolved&&x.sev==='high').length;el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Checklist đạt</span><b>${done}/${QA_ITEMS.length}</b><small>Nghiệm thu thủ công</small></div><div class="sys-kpi"><span>Tỷ lệ</span><b>${Math.round(done/QA_ITEMS.length*100)}%</b><small>Production readiness</small></div><div class="sys-kpi"><span>Sự cố nghiêm trọng mở</span><b>${openInc}</b><small>Nên bằng 0 trước phát hành</small></div><div class="sys-kpi"><span>Phiên bản</span><b style="font-size:14px">${KTX_V1}</b><small>Candidate release</small></div></div><div class="card"><div class="sys-head"><div><h3>Checklist nghiệm thu Production</h3><div class="mut">Các mục có thao tác thực tế phải được người vận hành kiểm tra trên môi trường Production.</div></div><span class="spacer"></span><button class="btn s sm" id="qaExport">Xuất checklist</button></div>${QA_ITEMS.map((x,i)=>`<label class="check-row"><input type="checkbox" data-qa="${i}" ${state[i]?'checked':''}><div><b>${i+1}. ${esc(x)}</b></div><span class="sev ${state[i]?'ok':'warn'}">${state[i]?'Đạt':'Chưa xác nhận'}</span></label>`).join('')}</div>`;el.querySelectorAll('[data-qa]').forEach(c=>c.onchange=()=>{state[c.dataset.qa]=c.checked;jset(QA_KEY,state);qaPage()});$('qaExport').onclick=()=>{const a=[['STT','Hạng mục','Trạng thái']];QA_ITEMS.forEach((x,i)=>a.push([i+1,x,state[i]?'Đạt':'Chưa xác nhận']));save(a,`Checklist_nghiem_thu_${ldy()}.xlsx`,'Nghiệm thu')}}
function releasePage(){const el=$('release');if(!el)return;const state=jget(QA_KEY,{}),done=QA_ITEMS.filter((_,i)=>state[i]).length,openInc=jget(INC_KEY,[]).filter(x=>!x.resolved&&x.sev==='high').length,ready=done===QA_ITEMS.length&&openInc===0;el.innerHTML=`<div class="release-hero"><span class="release-badge">${ready?'SẴN SÀNG PHÁT HÀNH':'RELEASE CANDIDATE'}</span><h2>Ứng dụng quản lý KTX Hóc Môn · v1.0.0</h2><div class="mut">Bản hợp nhất sau các bước ổn định Production, giám sát hệ thống, an toàn dữ liệu, đa máy, offline, kiểm thử và quản trị.</div></div><div class="sys-kpis" style="margin-top:12px"><div class="sys-kpi"><span>Nghiệm thu</span><b>${done}/${QA_ITEMS.length}</b><small>${ready?'Đã hoàn tất checklist':'Còn mục chưa xác nhận'}</small></div><div class="sys-kpi"><span>Sự cố nghiêm trọng</span><b>${openInc}</b><small>Chưa xử lý</small></div><div class="sys-kpi"><span>Công nhân</span><b>${W.length}</b><small>Dữ liệu hiện tại</small></div><div class="sys-kpi"><span>Backup local</span><b>${bkAutos().length}</b><small>Nên có ít nhất 1 bản</small></div></div><div class="sys-grid"><div class="card"><h3>Điều kiện phát hành chính thức</h3><div class="sys-note">1. Hoàn tất toàn bộ checklist Nghiệm thu Production.<br>2. Trung tâm sự cố không còn lỗi nghiêm trọng chưa xử lý.<br>3. Tạo backup online/local ngay trước khi deploy.<br>4. Deploy nguyên bộ file PWA trong cùng một commit, không xóa index.html ở commit trung gian.<br>5. Gắn tag/release GitHub <b>v1.0.0</b> sau khi Vercel Production báo Ready.</div><div class="sys-actions" style="margin-top:10px"><button class="btn s" data-rel="qa">Nghiệm thu Production</button><button class="btn s" data-rel="backup">Sao lưu</button><button class="btn s" data-rel="incidents">Sự cố</button></div></div><div><div class="card"><h3>Trạng thái phát hành</h3><div class="sev ${ready?'ok':'warn'}" style="font-size:10px">${ready?'Đủ điều kiện v1.0.0':'Chưa đủ điều kiện chốt v1.0.0'}</div><div class="sys-note" style="margin-top:10px">Bản này không tự tạo Git tag hoặc deploy Vercel. Sau khi nghiệm thu, dùng gói phát hành đi kèm để cập nhật GitHub/Vercel theo quy trình Stable Production.</div><button class="btn g" id="relNotes" style="margin-top:10px">Tải ghi chú phát hành</button></div></div></div>`;el.querySelectorAll('[data-rel]').forEach(b=>b.onclick=()=>go(b.dataset.rel));$('relNotes').onclick=()=>{const txt=`KTX Hóc Môn ${KTX_V1}\nNgày: ${new Date().toLocaleString('vi-VN')}\nNghiệm thu: ${done}/${QA_ITEMS.length}\nSự cố nghiêm trọng chưa xử lý: ${openInc}\nTrạng thái: ${ready?'SẴN SÀNG PHÁT HÀNH':'CHƯA HOÀN TẤT NGHIỆM THU'}\n`;const blob=new Blob([txt],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RELEASE_NOTES_v1.0.0.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}}
// ghi lỗi đồng bộ hiện có vào trung tâm sự cố mà không gây trùng liên tục
// V2.0.161: Only capture a new sync-error state. A persistent conflict remains
// visible in sync status but is not a new incident every thirty seconds.
let __ktx161LastSyncIncident='';
setInterval(()=>{try{
 const message=SUPA_SYNC&&String(SUPA_SYNC.lastError||'')||'';
 if(!message){__ktx161LastSyncIncident='';return}
 if(message!==__ktx161LastSyncIncident){__ktx161LastSyncIncident=message;incidentAdd('Đồng bộ Supabase',message,'high')}
}catch(e){}},30000);
setTimeout(()=>{try{reportAutoMaybe(false);updateIncidentBadge()}catch(e){}},1500);



/* V2.0.36 — compact safety hub for existing audit/backup features. */
(function(){
  if(window.__KTX_V2036_ADMINBOARD__)return;
  window.__KTX_V2036_ADMINBOARD__=true;
  const previous=adminDashboardPage;
  adminDashboardPage=async function(){
    await previous.apply(this,arguments);
    try{
      if(!can('acct'))return;
      const root=document.getElementById('adminboard');
      if(!root||root.querySelector('#v2036Hub'))return;
      const logs=Array.isArray(LOG)?LOG:[];
      const today=typeof ldy==='function'?ldy():'';
      const changedToday=logs.filter(x=>x.day===today&&/UPDATE|EDIT|MOVE|TRANSFER|IMPORT|DELETE|RESTORE|CHECKOUT/i.test(String(x.a||''))).length;
      const hub=document.createElement('section');hub.id='v2036Hub';hub.className='card';
      hub.style.cssText='padding:12px;margin-bottom:12px;border:1px solid #dbe6f7;border-radius:12px';
      hub.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">'
        +'<div><b>Nhật ký & an toàn dữ liệu</b><div class="mut" style="font-size:11px">Hôm nay có '+changedToday+' sự kiện thay đổi được ghi nhận trong nhật ký thiết bị.</div></div>'
        +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
        +'<button type="button" class="btn s sm" id="v2036Activity">Xem hoạt động</button>'
        +'<button type="button" class="btn s sm" id="v2036DataAudit">Kiểm tra dữ liệu</button>'
        +'<button type="button" class="btn s sm" id="v2036Backup">Sao lưu</button></div></div>'
        +'<div class="mut" style="font-size:10px;margin-top:8px">Số liệu nhật ký có thể chưa bao gồm thao tác trên thiết bị khác nếu đồng bộ nhật ký chưa hoàn tất. Luôn kiểm tra bản sao lưu trước khi khôi phục.</div>';
      root.insertBefore(hub,root.firstChild);
      hub.querySelector('#v2036Activity').onclick=()=>go('activity');
      hub.querySelector('#v2036DataAudit').onclick=()=>go('dataaudit');
      hub.querySelector('#v2036Backup').onclick=()=>go('backup');
    }catch(e){console.warn('V2036_ADMIN_HUB',e.message)}
  };
})();


/* V2.0.37: Bảng chẩn đoán chỉ đọc, không gọi Supabase, không ghi dữ liệu. */
(function(){
  'use strict';
  if(window.__KTX_V2037_DIAG__) return;
  window.__KTX_V2037_DIAG__ = true;
  const previous=adminDashboardPage;
  const fmtTime=v=>{const n=typeof v==='number'?v:Date.parse(v||'');return Number.isFinite(n)&&n>0?new Date(n).toLocaleString('vi-VN'):'Chưa có';};
  const safeCounts=()=>{
    let workers=0,archived=0,log=0;
    try{workers=Array.isArray(W)?W.length:0}catch(_){}
    try{archived=Array.isArray(ARC)?ARC.length:0}catch(_){}
    try{log=Array.isArray(LOG)?LOG.length:0}catch(_){}
    return {workers,archived,log};
  };
  function collect(){
    let ss=null;try{if(typeof SUPA_SYNC!=='undefined')ss=SUPA_SYNC}catch(_){}
    const counts=safeCounts();
    const conn=!!navigator.onLine;
    const configured=!!(ss&&ss.enabled);
    const ready=!!(ss&&ss.ready&&ss.session);
    const busy=!!(ss&&(ss.pulling||ss.pushing||ss.applying));
    const pending=!!(ss&&ss.pending);
    const conflicts=Array.isArray(ss&&ss.conflicts)?ss.conflicts.length:0;
    const error=!!(ss&&ss.lastError);
    const serviceWorker=('serviceWorker' in navigator)?(navigator.serviceWorker.controller?'Đang điều khiển trang':'Chưa điều khiển trang'):'Không hỗ trợ';
    return {time:new Date().toLocaleString('vi-VN'),online:conn,configured,ready,busy,pending,conflicts,error,lastSync:fmtTime(ss&&ss.lastSync),serviceWorker,counts};
  }
  const cell=(label,value,tone='')=>`<div style="padding:10px 12px;border:1px solid #dbe6f7;border-radius:10px;min-width:0"><div class="mut" style="font-size:11px">${label}</div><b style="font-size:13px;color:${tone||'#12345a'}">${value}</b></div>`;
  function paint(root){
    const body=root.querySelector('#v2037Diagnostics');if(!body)return;
    const d=collect();
    const flag=(yes,a='Có',b='Không')=>yes?a:b;
    body.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px">'
      +cell('Kết nối mạng của thiết bị',flag(d.online,'Có mạng','Ngoại tuyến'),d.online?'#15803d':'#b45309')
      +cell('Phiên Supabase',d.ready?'Sẵn sàng':(d.configured?'Chưa sẵn sàng':'Chưa bật'),'')
      +cell('Tiến trình đồng bộ',d.busy?'Đang thực hiện':(d.pending?'Chờ gửi':'Không bận'),d.pending?'#b45309':'')
      +cell('Xung đột / lỗi',`${d.conflicts} xung đột · ${d.error?'Có lỗi':'Không báo lỗi'}`,(d.conflicts||d.error)?'#dc2626':'')
      +cell('Lần đồng bộ gần nhất',esc(d.lastSync))
      +cell('PWA / Service Worker',esc(d.serviceWorker))
      +cell('Công nhân đang nạp',d.counts.workers.toLocaleString('vi-VN'))
      +cell('Lưu trữ / nhật ký',`${d.counts.archived.toLocaleString('vi-VN')} / ${d.counts.log.toLocaleString('vi-VN')}`)
      +'</div><div class="mut" style="font-size:10px;margin-top:8px">Kiểm tra tại thiết bị này, không truy vấn bổ sung Supabase. “Có mạng” không xác nhận Supabase hoạt động. Số công nhân là dữ liệu hiện tải, không phải số bản ghi Cloud.</div>';
    const date=root.querySelector('#v2037Updated');if(date)date.textContent='Cập nhật: '+d.time;
  }
  adminDashboardPage=async function(){
    await previous.apply(this,arguments);
    try{
      if(!can('acct'))return;
      const root=document.getElementById('adminboard');
      if(!root||root.querySelector('#v2037DiagnosticCard'))return;
      const card=document.createElement('section');card.className='card';card.id='v2037DiagnosticCard';
      card.style.cssText='margin-bottom:12px;padding:12px;border:1px solid #dbe6f7;border-radius:12px';
      card.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">'
      +'<div><b>Kiểm tra sức khỏe hệ thống</b><div class="mut" id="v2037Updated" style="font-size:10px"></div></div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn s sm" id="v2037Refresh">Kiểm tra lại</button><button type="button" class="btn s sm" id="v2037Export">Tải kết quả kiểm tra</button></div></div>'
      +'<div id="v2037Diagnostics"></div>';
      const anchor=root.querySelector('#v2036Hub');
      if(anchor)anchor.insertAdjacentElement('afterend',card);else root.insertBefore(card,root.firstChild);
      card.querySelector('#v2037Refresh').addEventListener('click',()=>paint(card));
      card.querySelector('#v2037Export').addEventListener('click',()=>{
        const data={app:'KTX Hoc Mon',diagnosticsVersion:'2.0.37',...collect()};
        const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
        const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='KTX_chan_doan_he_thong.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
      paint(card);
    }catch(e){console.warn('V2037_DIAGNOSTICS_UNAVAILABLE',e&&e.message)}
  };
})();

/* KTX Hóc Môn V2.0.38 — read-only operational reconciliation.
 * Extension of the existing Operations Center; no Supabase requests/writes.
 */
(function(){
  if(window.__KTX_V2038_OPS_RECON__) return;
  window.__KTX_V2038_OPS_RECON__=true;
  if(typeof opsBoardPage!=='function') return;
  const originalOpsBoardPage=opsBoardPage;
  const normalized=x=>String(x==null?'':x).trim().replace(/\s+/g,' ').toUpperCase();
  const ktxId=x=>{const t=normalized(x);const m=t.match(/^(?:KTX\s*)?([12])$/);return m?m[1]:''};
  const dayId=x=>{const m=normalized(x).match(/^(?:DÃY|DAY)?\s*([1-6])$/);return m?Number(m[1]):0};
  const roomId=x=>{const t=normalized(x).replace(/^(?:PHÒNG|PHONG|P\.)\s*/,'');return /^(?:0*[1-9][0-9]*)$/.test(t)?String(Number(t)):''};
  function collect(){
    const rows=Array.isArray(W)?W.filter(x=>x&&typeof x==='object'):[];
    const stats={'1':{workers:0,unplaced:0,rooms:new Map()},'2':{workers:0,unplaced:0,rooms:new Map()}};
    let invalid=0;
    rows.forEach(w=>{
      const k=ktxId(w.ktx),d=dayId(w.day),r=roomId(w.room);
      if(!k){invalid++;return}
      const s=stats[k];s.workers++;
      if(!d||d>(k==='1'?5:6)||!r){s.unplaced++;return}
      const id=d+'|'+r;s.rooms.set(id,(s.rooms.get(id)||0)+1);
    });
    const limit=typeof CAP==='number'&&CAP>0?CAP:20;
    const out=Object.entries(stats).map(([id,s])=>{
      const over=[...s.rooms.values()].filter(n=>n>limit).length;
      return {id,workers:s.workers,rooms:s.rooms.size,unplaced:s.unplaced,over};
    });
    return {at:new Date().toLocaleString('vi-VN'),total:rows.length,invalid,limit,ktx:out,unplaced:out.reduce((a,s)=>a+s.unplaced,0)+invalid,over:out.reduce((a,s)=>a+s.over,0)};
  }
  function render(root){
    const target=root.querySelector('#v2038OpsPanel');if(!target)return;
    const s=collect();
    const number=n=>Number(n).toLocaleString('vi-VN');
    target.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:9px">'
      +'<div><strong>Đối chiếu quân số & vị trí phòng</strong><div class="mut" style="font-size:11px">Kiểm tra trên '+number(s.total)+' hồ sơ đang tải · '+s.at+'</div></div>'
      +'<button type="button" class="btn s sm" data-ops38="refresh">Kiểm tra lại</button></div>'
      +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">'
      +s.ktx.map(x=>'<div style="border:1px solid #d9e5f5;padding:11px;border-radius:10px"><b>KTX '+x.id+'</b><div style="font-size:20px;font-weight:700">'+number(x.workers)+'</div><div class="mut" style="font-size:11px">'+number(x.rooms)+' phòng có người · '+number(x.over)+' phòng quá tải</div><div style="font-size:11px;color:'+(x.unplaced?'#b45309':'#15803d')+'">'+number(x.unplaced)+' hồ sơ thiếu vị trí</div></div>').join('')
      +'<div style="border:1px solid #d9e5f5;padding:11px;border-radius:10px"><b>Chưa xác định KTX</b><div style="font-size:20px;font-weight:700">'+number(s.invalid)+'</div><div class="mut" style="font-size:11px">Cần kiểm tra hồ sơ</div></div></div>'
      +'<div class="mut" style="font-size:11px;margin-top:8px">Lưu ý: số phòng chỉ tính những phòng có ít nhất một công nhân và đủ mã KTX/Dãy/Phòng; không thay thế danh mục phòng hoặc sức chứa đã khai báo. Phòng vượt '+number(s.limit)+' người chỉ cảnh báo, không bị khóa.</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
      +'<button type="button" class="btn s sm" data-ops38="audit">Kiểm tra hồ sơ</button>'
      +'<button type="button" class="btn s sm" data-ops38="rooms">Xem sơ đồ phòng</button>'
      +'<button type="button" class="btn s sm" data-ops38="export">Xuất thống kê CSV</button></div>';
    target.querySelector('[data-ops38="refresh"]').onclick=()=>render(root);
    target.querySelector('[data-ops38="audit"]').onclick=()=>go('dataaudit');
    target.querySelector('[data-ops38="rooms"]').onclick=()=>go('home');
    target.querySelector('[data-ops38="export"]').onclick=()=>{
      const data=collect();
      const lines=[['KTX','Quân số','Phòng có người','Phòng quá tải','Hồ sơ thiếu vị trí'],...data.ktx.map(x=>['KTX '+x.id,x.workers,x.rooms,x.over,x.unplaced]),['Chưa rõ KTX',data.invalid,'','',''],['Tổng hồ sơ',data.total,'',data.over,data.unplaced]];
      const csv='\uFEFF'+lines.map(a=>a.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=url;link.download='KTX_doi_chieu_quan_so_'+new Date().toISOString().slice(0,10)+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
  }
  opsBoardPage=function(){
    const result=originalOpsBoardPage.apply(this,arguments);
    try{
      const root=document.getElementById('opsboard');
      if(!root)return result;
      let panel=root.querySelector('#v2038OpsPanel');
      if(!panel){panel=document.createElement('section');panel.id='v2038OpsPanel';panel.className='card';panel.style.cssText='padding:12px;margin:0 0 12px;border:1px solid #dbe6f7;border-radius:12px';const first=root.querySelector('.sys-grid');if(first)root.insertBefore(panel,first);else root.appendChild(panel)}
      render(root);
    }catch(e){console.warn('V2038_OPS_RECON',e&&e.message)}
    return result;
  };
})();


/* KTX Hóc Môn V2.0.40 — tra cứu cảnh báo vị trí phòng, không ghi dữ liệu.
 * Chỉ sử dụng danh sách W đã nạp. Không tự sửa, xóa hoặc đổi phòng.
 */
(function(){
  'use strict';
  if(window.__KTX_V2040_WORKER_ALERTS__)return;
  window.__KTX_V2040_WORKER_ALERTS__=true;
  if(typeof opsBoardPage!=='function')return;
  const previous=opsBoardPage;
  const state={q:'',ktx:'all',kind:'all',page:1};
  const clean=x=>String(x==null?'':x).trim().replace(/\s+/g,' ');
  const normalized=x=>clean(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
  const ktx=x=>{const m=normalized(x).match(/^(?:ktx\s*)?([12])$/);return m?m[1]:''};
  const day=x=>{const m=normalized(x).match(/^(?:day\s*)?0*([1-6])$/);return m?Number(m[1]):0};
  const room=x=>{const t=normalized(x).replace(/^(?:phong|p\.)\s*/,'');return /^0*[1-9]\d*$/.test(t)?String(Number(t)):''};
  const safe=x=>typeof esc==='function'?esc(String(x==null?'':x)):String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function scan(){
    return (Array.isArray(W)?W:[]).flatMap((w,index)=>{
      if(!w||typeof w!=='object')return [];
      const k=ktx(w.ktx),d=day(w.day),r=room(w.room),kinds=[];
      if(!k)kinds.push('ktx');
      if(!d||(k==='1'&&d>5))kinds.push('day');
      if(!r)kinds.push('room');
      if(!kinds.length)return [];
      return [{w,index,id:w.id,k,kinds,reason:kinds.map(t=>t==='ktx'?'KTX chưa hợp lệ':t==='day'?'Dãy chưa hợp lệ':'Phòng chưa xác định').join(' · ')}];
    });
  }
  function mount(root){
    let panel=root.querySelector('#v2040WorkerAlerts');
    if(panel)return panel;
    panel=document.createElement('section');
    panel.id='v2040WorkerAlerts';panel.className='card';
    panel.style.cssText='padding:12px;margin:0 0 12px;border:1px solid #dbe6f7;border-radius:12px';
    panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">'
      +'<div><b>Công nhân cần kiểm tra vị trí phòng</b><div class="mut" style="font-size:11px">Đối chiếu dữ liệu công nhân đang nạp. Không tự sửa hồ sơ hoặc thay đổi phòng.</div></div>'
      +'<button type="button" class="btn s sm" data-v2040-refresh>Làm mới</button></div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">'
      +'<input type="search" aria-label="Tìm công nhân cần kiểm tra" data-v2040-search placeholder="Tìm tên, Mã NV, vị trí..." style="flex:1 1 210px;min-width:0">'
      +'<select aria-label="Lọc theo KTX" data-v2040-ktx><option value="all">Tất cả KTX</option><option value="1">KTX 1</option><option value="2">KTX 2</option><option value="other">Chưa rõ KTX</option></select>'
      +'<select aria-label="Lọc theo loại lỗi" data-v2040-kind><option value="all">Tất cả loại lỗi</option><option value="ktx">Lỗi KTX</option><option value="day">Lỗi Dãy</option><option value="room">Lỗi Phòng</option></select>'
      +'<button type="button" class="btn s sm" data-v2040-reset>Xóa lọc</button></div>'
      +'<div data-v2040-count aria-live="polite" class="mut" style="font-size:11px;margin-bottom:7px"></div>'
      +'<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr>'
      +'<th style="text-align:left;padding:8px">Công nhân</th><th style="text-align:left;padding:8px">Vị trí ghi nhận</th>'
      +'<th style="text-align:left;padding:8px">Cần kiểm tra</th><th style="text-align:left;padding:8px">Thao tác</th>'
      +'</tr></thead><tbody data-v2040-rows></tbody></table></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap">'
      +'<span data-v2040-page class="mut" style="font-size:11px"></span>'
      +'<div style="display:flex;gap:6px"><button type="button" class="btn s sm" data-v2040-prev>Trước</button>'
      +'<button type="button" class="btn s sm" data-v2040-next>Sau</button></div></div>';
    const after=root.querySelector('#v2038OpsPanel');
    if(after)after.insertAdjacentElement('afterend',panel);else root.prepend(panel);
    panel.querySelector('[data-v2040-search]').value=state.q;
    panel.querySelector('[data-v2040-ktx]').value=state.ktx;
    panel.querySelector('[data-v2040-kind]').value=state.kind;
    panel.querySelector('[data-v2040-search]').addEventListener('input',e=>{state.q=e.target.value;state.page=1;render(panel)});
    panel.querySelector('[data-v2040-ktx]').addEventListener('change',e=>{state.ktx=e.target.value;state.page=1;render(panel)});
    panel.querySelector('[data-v2040-kind]').addEventListener('change',e=>{state.kind=e.target.value;state.page=1;render(panel)});
    panel.querySelector('[data-v2040-reset]').addEventListener('click',()=>{
      state.q='';state.ktx='all';state.kind='all';state.page=1;
      panel.querySelector('[data-v2040-search]').value='';
      panel.querySelector('[data-v2040-ktx]').value='all';
      panel.querySelector('[data-v2040-kind]').value='all';render(panel);
    });
    panel.querySelector('[data-v2040-refresh]').addEventListener('click',()=>render(panel));
    panel.querySelector('[data-v2040-prev]').addEventListener('click',()=>{state.page--;render(panel)});
    panel.querySelector('[data-v2040-next]').addEventListener('click',()=>{state.page++;render(panel)});
    panel.addEventListener('click',e=>{
      const btn=e.target.closest('[data-v2040-action]');
      if(!btn||!panel.contains(btn))return;
      const i=Number(btn.dataset.v2040Row),x=panel.__v2040Rows&&panel.__v2040Rows[i];
      if(!x)return;
      // Xác minh hồ sơ còn đúng trong W sau khi đồng bộ/điều chuyển.
      const live=Array.isArray(W)?W[x.index]:null;
      if(!live||(x.id!=null?String(live.id)!==String(x.id):live!==x.w)){
        render(panel);
        if(typeof alert==='function')alert('Danh sách công nhân vừa thay đổi. Vui lòng mở lại hồ sơ từ danh sách mới.');
        return;
      }
      if(btn.dataset.v2040Action==='view'&&typeof view==='function')view(live);
      if(btn.dataset.v2040Action==='edit'&&typeof edit==='function'&&typeof can==='function'&&can('editw',live))edit(live);
    });
    return panel;
  }
  function render(panel){
    const issues=scan(),term=normalized(state.q);
    const matches=issues.filter(x=>(state.ktx==='all'||(x.k||'other')===state.ktx)
      &&(state.kind==='all'||x.kinds.includes(state.kind))
      &&(!term||normalized([x.w.name,x.w.mnv,x.w.ktx,x.w.day,x.w.room,x.reason].join(' ')).includes(term)));
    const size=30,pages=Math.max(1,Math.ceil(matches.length/size));
    state.page=Math.max(1,Math.min(state.page,pages));
    const rows=matches.slice((state.page-1)*size,state.page*size);
    panel.__v2040Rows=rows;
    panel.querySelector('[data-v2040-count]').textContent=issues.length.toLocaleString('vi-VN')+' hồ sơ cần kiểm tra · '+matches.length.toLocaleString('vi-VN')+' phù hợp bộ lọc · '+issues.filter(x=>x.kinds.includes('room')).length+' thiếu Phòng';
    panel.querySelector('[data-v2040-rows]').innerHTML=rows.map((x,i)=>{
      const w=x.w,mayEdit=typeof can==='function'&&can('editw',w);
      return '<tr><td style="padding:8px;white-space:normal"><b>'+safe(w.name||'Chưa có họ tên')+'</b><div class="mut" style="font-size:11px">'+safe(w.mnv||'Chưa có Mã NV')+'</div></td>'
        +'<td style="padding:8px;white-space:normal">'+safe([w.ktx||'—',w.day||'—','P.'+(w.room||'—')].join(' · '))+'</td>'
        +'<td style="padding:8px;color:#a16207">'+safe(x.reason)+'</td>'
        +'<td style="padding:8px;white-space:nowrap"><button type="button" class="btn s sm" data-v2040-action="view" data-v2040-row="'+i+'">Xem hồ sơ</button> '
        +(mayEdit?'<button type="button" class="btn s sm" data-v2040-action="edit" data-v2040-row="'+i+'">Chỉnh sửa</button>':'')+'</td></tr>';
    }).join('')||'<tr><td colspan="4" class="mut" style="padding:12px">Không có hồ sơ phù hợp.</td></tr>';
    panel.querySelector('[data-v2040-page]').textContent='Hiển thị '+rows.length+' / '+matches.length+' hồ sơ · Trang '+state.page+'/'+pages;
    panel.querySelector('[data-v2040-prev]').disabled=state.page<=1;
    panel.querySelector('[data-v2040-next]').disabled=state.page>=pages;
  }
  opsBoardPage=function(){
    const result=previous.apply(this,arguments);
    try{const root=document.getElementById('opsboard');if(root)render(mount(root))}
    catch(e){console.warn('V2040_WORKER_ALERTS',e&&e.message)}
    return result;
  };
})();

;
/* >>> Original: assets/js/modules/admin/script-35.js >>> */

(function(){
  const HUB_HTML = `
  <div class="sysfunc-wrap" id="sysfuncForcedContent">
    <div class="sysfunc-intro"><div class="sf-ico"><svg class="i"><use href="#i-cog"></use></svg></div><div><h3>Chức năng hệ thống</h3><p>Tất cả công cụ quản trị, đồng bộ, giám sát và bảo trì được gom tại đây. Bấm vào từng chức năng để mở trang tương ứng.</p></div></div>
    <div class="sysfunc-group"><h3>Quản trị & truy cập</h3><div class="sysfunc-grid">
      <button id="ktxBrandAdminButton" class="sysfunc-btn sf-purple" type="button" onclick="window.KTXBrand && window.KTXBrand.open()"><span class="sficon"><svg class="i"><use href="#i-cog"></use></svg></span><span><b>Cấu hình thương hiệu</b><small>Đổi tên, logo và các ảnh nền.</small></span></button>
      <button class="sysfunc-btn sf-purple" type="button" data-force-go="adminboard"><span class="sficon"><svg class="i"><use href="#i-home"></use></svg></span><span><b>Dashboard quản trị</b><small>Tổng hợp tình trạng hệ thống và các chỉ số quản trị.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="acc"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>Quản lý tài khoản</b><small>Tài khoản, vai trò và phạm vi phụ trách.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="access"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>Phân quyền & truy cập</b><small>Kiểm tra ma trận quyền và cấu hình truy cập.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="log"><span class="sficon"><svg class="i"><use href="#i-users"></use></svg></span><span><b>Nhật ký hệ thống</b><small>Lịch sử thao tác và thay đổi dữ liệu.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="security"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>Phiên đăng nhập & bảo mật</b><small>Theo dõi phiên hiện tại và dấu hiệu cần rà soát.</small></span></button>
    </div></div>
    <div class="sysfunc-group"><h3>Dữ liệu & đồng bộ</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn sf-green" type="button" data-force-go="sync"><span class="sficon"><svg class="i"><use href="#i-ul"></use></svg></span><span><b>Đồng bộ Supabase</b><small>Đồng bộ dữ liệu giữa nhiều máy và xử lý hàng đợi.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-force-go="backup"><span class="sficon"><svg class="i"><use href="#i-dl"></use></svg></span><span><b>Sao lưu dữ liệu</b><small>Backup thủ công, tự động và khôi phục dữ liệu.</small></span></button>
      <button class="sysfunc-btn sf-green" type="button" data-force-go="dataaudit"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Kiểm tra toàn bộ dữ liệu</b><small>Quét chất lượng, trùng lặp, phòng và cư trú.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="standards"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Chuẩn hóa dữ liệu</b><small>Chuẩn hóa CCCD, SĐT, MNV, KTX, Dãy và Phòng.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="safety"><span class="sficon"><svg class="i"><use href="#i-key"></use></svg></span><span><b>An toàn dữ liệu</b><small>Điểm khôi phục và bảo vệ trước thao tác lớn.</small></span></button>
    </div></div>
    <div class="sysfunc-group"><h3>Giám sát & vận hành</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn sf-green" type="button" data-force-go="health"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Sức khỏe hệ thống</b><small>Kiểm tra Internet, Supabase, backup, PWA và dung lượng.</small></span></button>
      <button class="sysfunc-btn sf-danger" type="button" data-force-go="incidents"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Trung tâm sự cố</b><small>Lỗi ứng dụng, đồng bộ, import và lịch sử xử lý.</small></span></button>
      <button class="sysfunc-btn sf-warn" type="button" data-force-go="alerts"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Trung tâm cảnh báo</b><small>Các vấn đề dữ liệu và công việc cần xử lý.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="opsboard"><span class="sficon"><svg class="i"><use href="#i-home"></use></svg></span><span><b>Dashboard vận hành</b><small>Tình hình KTX trong ngày và đầu việc cần xử lý.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="log"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Nhật ký hệ thống</b><small>Lịch sử thao tác và thay đổi dữ liệu.</small></span></button>
    </div></div>
    <div class="sysfunc-group"><h3>Báo cáo & vòng đời hệ thống</h3><div class="sysfunc-grid">
      <button class="sysfunc-btn" type="button" data-force-go="reportauto"><span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Báo cáo định kỳ</b><small>Lưu chốt số liệu ngày, tuần và tháng.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="maintenance"><span class="sficon"><svg class="i"><use href="#i-tool"></use></svg></span><span><b>Bảo trì & lưu trữ</b><small>Dọn dữ liệu cũ và giữ ứng dụng hoạt động nhẹ.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="qa"><span class="sficon"><svg class="i"><use href="#i-check"></use></svg></span><span><b>Nghiệm thu Production</b><small>Checklist kiểm thử trước khi phát hành.</small></span></button>
      <button class="sysfunc-btn" type="button" data-force-go="release"><span class="sficon"><svg class="i"><use href="#i-bld"></use></svg></span><span><b>Phát hành v1.0</b><small>Thông tin phiên bản và trạng thái phát hành.</small></span></button>
      <button class="sysfunc-btn sf-purple" type="button" data-force-install="1"><span class="sficon"><svg class="i"><use href="#i-dl"></use></svg></span><span><b>Cài ứng dụng</b><small>Cài KTX Hóc Môn như ứng dụng trên máy tính/điện thoại.</small></span></button>
    </div></div>
    <div class="sysfunc-footer">Các chức năng được gom tại một trang. Quyền truy cập vẫn được kiểm tra khi mở từng chức năng.</div>
  </div>`;

  // V2.0.141: một chức năng chỉ có một vị trí; A-Z theo tiếng Việt.
  function tidyHub(el){
    const onSidebar=new Set(Array.from(document.querySelectorAll('nav .gi button[data-p]')).map(b=>b.dataset.p));
    const seen=new Set();
    for(const group of el.querySelectorAll('.sysfunc-group')){
      const grid=group.querySelector('.sysfunc-grid');if(!grid)continue;
      const buttons=Array.from(grid.querySelectorAll(':scope > button'));
      for(const button of buttons){
        const key=button.dataset.forceGo||button.dataset.sysGo||(button.id==='ktxBrandAdminButton'?'branding':button.dataset.forceInstall?'install':button.textContent.trim());
        if(seen.has(key)||onSidebar.has(key)){button.remove();continue}
        seen.add(key);
      }
      const sortVI=(a,b)=>(a.querySelector('b')?.textContent||a.textContent).trim().localeCompare((b.querySelector('b')?.textContent||b.textContent).trim(),'vi',{sensitivity:'base',numeric:true});
      Array.from(grid.querySelectorAll(':scope > button')).sort(sortVI).forEach(button=>grid.appendChild(button));
      if(!grid.children.length)group.remove();
    }
    // V2.0.142: sort the visible groups as well as the cards; script-35 is the final renderer.
    const wrapper=el.querySelector('.sysfunc-wrap');
    if(wrapper){const groups=Array.from(wrapper.querySelectorAll(':scope > .sysfunc-group'));
      groups.sort((a,b)=>(a.querySelector('h3')?.textContent||'').localeCompare(b.querySelector('h3')?.textContent||'','vi',{sensitivity:'base',numeric:true}));
      const footer=wrapper.querySelector(':scope > .sysfunc-footer');
      groups.forEach(g=>wrapper.insertBefore(g,footer));
    }
  }
  function wireHub(el){
    tidyHub(el);
    el.querySelectorAll('[data-force-go]').forEach(btn=>{btn.onclick=function(){ if(typeof go==='function') go(this.dataset.forceGo); }});
    const install=el.querySelector('[data-force-install]');
    if(install) install.onclick=function(){ if(typeof pwaOpenInstall==='function') pwaOpenInstall(); else { const d=document.getElementById('pwaInstallDlg'); if(d&&d.showModal)d.showModal(); }};
  }
  window.forceSystemHub=function(){
    const el=document.getElementById('sysfunc'); if(!el) return;
    if(!el.querySelector('#sysfuncForcedContent')) el.innerHTML=HUB_HTML;
    wireHub(el);
    const active=(typeof page!=='undefined' && page==='sysfunc');
    el.classList.toggle('hide',!active);
    el.style.removeProperty('display');
    el.style.removeProperty('visibility');
    el.style.removeProperty('opacity');
  };
  document.addEventListener('click',function(e){
    const b=e.target.closest && e.target.closest('button[data-p="sysfunc"]');
    if(b) setTimeout(window.forceSystemHub,0);
  },true);
  document.addEventListener('DOMContentLoaded',function(){
    const el=document.getElementById('sysfunc');
    if(el) el.classList.add('hide');
    if(typeof page!=='undefined' && page==='sysfunc') setTimeout(window.forceSystemHub,0);
  });
  window.addEventListener('load',function(){
    const el=document.getElementById('sysfunc');
    if(typeof page!=='undefined' && page==='sysfunc') setTimeout(window.forceSystemHub,50);
    else if(el) el.classList.add('hide');
  });
  // Luôn đồng bộ trạng thái hiển thị với trang hiện tại.
  const syncHubVisibility=()=>{
    const active=(typeof page!=='undefined' && page==='sysfunc');
    document.body.dataset.page=active?'sysfunc':(typeof page!=='undefined'?page:'');
    const el=document.getElementById('sysfunc');
    if(el) el.classList.toggle('hide',!active);
  };
  document.addEventListener('click',()=>setTimeout(syncHubVisibility,0),true);
  window.addEventListener('popstate',syncHubVisibility);
  setTimeout(syncHubVisibility,0);
})();

;
/* >>> Original: assets/js/modules/admin/script-36.js >>> */

(()=>{
const AUTHC={accounts:[],requests:[],loaded:false,eventsKey:'ktx_auth_events_v2'};
window.AUTHC=AUTHC;
const authEvents=()=>{try{return JSON.parse(localStorage.getItem(AUTHC.eventsKey)||'[]')}catch(e){return[]}};
const ae=(type,detail,extra={})=>{try{const a=authEvents();a.unshift({at:Date.now(),type,detail:String(detail||''),email:extra.email||((SUPA_SYNC&&SUPA_SYNC.session&&SUPA_SYNC.session.user&&SUPA_SYNC.session.user.email)||''),role:(typeof ME!=='undefined'&&ME.role)||'',...extra});localStorage.setItem(AUTHC.eventsKey,JSON.stringify(a.slice(0,300)))}catch(e){}try{if(typeof add==='function'&&['LOGIN','LOGOUT','ACCOUNT_ROLE','ACCOUNT_STATUS','ACCOUNT_SCOPE','ACCESS_APPROVE','ACCESS_REJECT'].includes(type))add('AUTH',`${type}: ${detail}`)}catch(e){}};
function gateEl(){let g=document.getElementById('authHubGate');if(g)return g;g=document.createElement('div');g.id='authHubGate';g.className='auth-gate2 hide';g.innerHTML=`<div class="auth-card2"><div class="auth-brand2"><div class="auth-logo2"><img src="/assets/img/brand/ktx-logo.png" alt="Logo KTX Hóc Môn" width="46" height="46" style="display:block;width:100%;height:100%;object-fit:contain;border-radius:12px"></div><div><h2>KTX Hóc Môn</h2><div class="mut">Đăng nhập tập trung · Supabase Auth</div></div></div><div class="auth-tabs2"><button id="ahTabLogin" class="on">Đăng nhập</button><button id="ahTabReq">Tạo yêu cầu tài khoản</button></div><div id="ahLogin"><label class="auth-field2"><span>Email</span><input id="ahEmail" type="email" autocomplete="off" autocapitalize="none" spellcheck="false"></label><label class="auth-field2"><span>Mật khẩu</span><input id="ahPass" type="password" autocomplete="off"></label><button class="auth-mainbtn2" id="ahLoginBtn">Đăng nhập</button></div><div id="ahReq" class="hide"><label class="auth-field2"><span>Họ tên</span><input id="ahName"></label><label class="auth-field2"><span>Email</span><input id="ahReqEmail" type="email"></label><label class="auth-field2"><span>Mật khẩu</span><input id="ahReqPass" type="password" minlength="6"></label><button class="auth-mainbtn2" id="ahReqBtn">Tạo tài khoản & gửi yêu cầu</button></div><div id="ahMsg" class="auth-msg2"></div><div class="auth-foot2">QR, Đồng bộ Supabase và các chức năng quản trị dùng chung một phiên đăng nhập. Ứng dụng không lưu service_role.</div></div>`;document.body.appendChild(g);const sw=(mode)=>{const login=mode!=='request';document.getElementById('ahLogin').classList.toggle('hide',!login);document.getElementById('ahReq').classList.toggle('hide',login);document.getElementById('ahTabLogin').classList.toggle('on',login);document.getElementById('ahTabReq').classList.toggle('on',!login);document.getElementById('ahMsg').textContent=''};document.getElementById('ahTabLogin').onclick=()=>sw('login');document.getElementById('ahTabReq').onclick=()=>sw('request');document.getElementById('ahLoginBtn').onclick=authLogin;document.getElementById('ahReqBtn').onclick=authRegister;return g}
window.authHubShow=(mode='login',msg='')=>{const g=gateEl();g.classList.remove('hide');const b=document.getElementById(mode==='request'?'ahTabReq':'ahTabLogin');if(b)b.click();if(msg)document.getElementById('ahMsg').textContent=msg};
window.authHubHide=()=>gateEl().classList.add('hide');
async function authTouch(event){try{const sb=syncClient();if(sb&&SUPA_SYNC.session)await sb.rpc('touch_app_session',{p_event:event})}catch(e){}}
// V2.0.134: Restore the last page only AFTER the Supabase account has been verified.
// Same account, same device; never persist unsaved form data, and never bypass go() permissions.
window.KTX_MOBILE_GO_HOME_AFTER_LOGIN=function(mode="restore"){
 // Nav storage is only a convenience. Supabase account validation and page permissions remain authoritative.
 try{
  const u=window.SUPA_SYNC?.session?.user?.id;
  if(!u||!window.SUPA_SYNC.ready)return;
  const mobile=window.matchMedia('(max-width:760px)').matches;
  const prefix='ktx_nav_v2134:'+u+':';
  // Read the saved destination BEFORE enabling page writes; initial navigation must not replace it.
  let savedDesktop='home',savedMobile={screen:'home'};
  try{savedDesktop=localStorage.getItem(prefix+'desktop')||'home';}catch(_){}
  try{const v=JSON.parse(localStorage.getItem(prefix+'mobile')||'null');if(v&&typeof v.screen==='string')savedMobile=v;}catch(_){}
  if(mode==='fresh'){
   savedDesktop='home';savedMobile={screen:'home'};
   try{localStorage.setItem(prefix+'desktop','home');localStorage.setItem(prefix+'mobile',JSON.stringify(savedMobile))}catch(_){}
  }
  // Only the active surface should be restored; do not force desktop route during Mobile resume.
  window.__KTX_NAV_BOOT_RESTORING=false;
  if(mobile){
   const wanted=savedMobile;
   const restore=()=>{if(!window.matchMedia('(max-width:760px)').matches)return;
    if(typeof window.KTX_MOBILE_RESTORE_SCREEN==='function')window.KTX_MOBILE_RESTORE_SCREEN(wanted);
   };
   // Render when the Mobile shell is visible; retry once if its bundle registered late.
   requestAnimationFrame(()=>setTimeout(restore,80));
  }else if(typeof go==='function'&&typeof T==='object'&&T&&Object.prototype.hasOwnProperty.call(T,savedDesktop)){
   go(savedDesktop); // Preserve original permission checks from go().
  }else if(typeof go==='function')go('home');
 }catch(e){window.__KTX_NAV_BOOT_RESTORING=false;console.warn('[KTX140] Page restoration',e)}
};

async function authLogin(){if(window.__ktxLoginBusy)return;window.__ktxLoginBusy=true;const sb=syncClient(),msg=document.getElementById('ahMsg');if(!sb){window.__ktxLoginBusy=false;msg.textContent='Chưa cấu hình Supabase. Hãy kiểm tra cấu hình kết nối.';return}const email=document.getElementById('ahEmail').value.trim(),password=document.getElementById('ahPass').value;if(!email||!password){window.__ktxLoginBusy=false;msg.textContent='Hãy nhập email và mật khẩu.';return}msg.textContent='Đang đăng nhập...';const {data,error}=await sb.auth.signInWithPassword({email,password});if(error){window.__ktxLoginBusy=false;ae('LOGIN_FAILED',error.message,{email});msg.textContent='Đăng nhập không thành công: '+error.message;return}SUPA_SYNC.session=data.session;try{await syncLoadAccount();SUPA_SYNC.ready=true;SUPA_SYNC.enabled=true;updateUserbar();applyPerms();authHubHide();try{all()}catch(_e){}/* Tải mới sau khi quyền đã xác minh, tự làm mới mà không cần người dùng nhấn Reload. */ae('LOGIN','Đăng nhập thành công',{email});window.location.reload();return}catch(e){ae('LOGIN_BLOCKED',e.message,{email});msg.textContent=e.message||String(e);/* Giữ phiên Supabase Auth để người dùng có thể thử tải lại, không tự đăng xuất. */}finally{window.__ktxLoginBusy=false}}
async function authRegister(){const sb=syncClient(),msg=document.getElementById('ahMsg');if(!sb){msg.textContent='Chưa cấu hình Supabase.';return}const name=document.getElementById('ahName').value.trim(),email=document.getElementById('ahReqEmail').value.trim(),password=document.getElementById('ahReqPass').value;if(!name||!email||password.length<6){msg.textContent='Nhập họ tên, email và mật khẩu từ 6 ký tự.';return}msg.textContent='Đang tạo tài khoản...';const {data,error}=await sb.auth.signUp({email,password,options:{data:{name}}});if(error){msg.textContent='Không tạo được tài khoản: '+error.message;return}ae('REGISTER_REQUEST','Tạo yêu cầu truy cập',{email});msg.textContent=data.session?'Đã tạo tài khoản. Yêu cầu truy cập đang chờ Quản trị duyệt.':'Đã tạo tài khoản. Hãy xác nhận email nếu Supabase yêu cầu, sau đó đăng nhập để chờ duyệt.'}
window.authHubLogout=async(scope='local')=>{const sb=syncClient();if(!sb)return;const email=SUPA_SYNC.session&&SUPA_SYNC.session.user&&SUPA_SYNC.session.user.email||'';try{await authTouch('logout');ae('LOGOUT',scope==='others'?'Thu hồi các phiên khác':scope==='global'?'Đăng xuất mọi thiết bị':'Đăng xuất phiên hiện tại',{email});await sb.auth.signOut({scope});if(scope!=='others'){
 try{const u=SUPA_SYNC.session?.user?.id;if(u){localStorage.removeItem('ktx_nav_v2134:'+u+':desktop');localStorage.removeItem('ktx_nav_v2134:'+u+':mobile')}}catch(_){}
 SUPA_SYNC.session=null;SUPA_SYNC.account=null;SUPA_SYNC.ready=false;ME.id=null;ME.name='';ME.role='viewer';ME.acct=null;applyPerms();updateUserbar();/* Ensure no old user's data remains in memory after changing accounts. */window.location.reload();return;}}catch(e){alert('Không đăng xuất được: '+(e.message||e))}};
async function authLoadAdminData(){
 if(!SUPA_SYNC.session||ME.role!=='admin')return;
 const sb=syncClient();if(!sb)return;
 try{
  // V112: account fields shown in the directory must be included in the SELECT.
  // Preserve compatibility if the optional contact columns have not been installed.
  const base='user_id,email,display_name,role,ktx,days,enabled,created_at,updated_at';
  const optional='last_login_at,last_logout_at,last_seen_at';
  let q=await sb.from('app_accounts').select(base+','+optional+',job_title,phone').order('display_name',{ascending:true,nullsFirst:false});
  if(q.error&&/last_login|last_logout|last_seen/i.test(q.error.message||'')){
   q=await sb.from('app_accounts').select(base+',job_title,phone').order('display_name',{ascending:true,nullsFirst:false});
  }
  if(q.error&&/job_title|phone|column|schema cache/i.test(q.error.message||'')){
   console.warn('QLKTX_V112_ACCOUNT_FIELDS: app_accounts.job_title or phone is unavailable:',q.error.message);
   q=await sb.from('app_accounts').select(base).order('display_name',{ascending:true,nullsFirst:false});
  }
  if(q.error)throw q.error;
  AUTHC.accounts=(q.data||[]).map(a=>({...a,position:a.job_title||a.position||'',phone:a.phone||''}));
  const r=await sb.from('access_requests').select('*').order('requested_at',{ascending:false});
  if(!r.error)AUTHC.requests=r.data||[];
  AUTHC.loaded=true;
 }catch(e){console.warn('authLoadAdminData',e)}
}
window.authLoadAdminData=authLoadAdminData;
window.saveAccountRow=saveAccountRow;window.reviewRequest=reviewRequest;
const acctRoleOptions=v=>Object.entries(ROLES).map(([k,l])=>`<option value="${k}" ${v===k?'selected':''}>${l}</option>`).join('');
const csvArr=v=>String(v||'').split(',').map(x=>x.trim()).filter(Boolean);
const scopeText=a=>{
 const k=Array.isArray(a.ktx)?[...new Set(a.ktx.map(x=>String(x||'').trim()).filter(Boolean))]:[];
 const d=Array.isArray(a.days)?[...new Set(a.days.map(x=>String(x||'').trim()).filter(Boolean))]:[];
 const general=k.length===2&&['KTX 1','KTX 2'].every(x=>k.includes(x))&&d.length===6&&Array.from({length:6},(_,i)=>'Dãy '+(i+1)).every(x=>d.includes(x));
 if(general)return 'Quản lý chung · Quản lý chung';
 const kt=k.length===2&&['KTX 1','KTX 2'].every(x=>k.includes(x))?'Tất cả KTX':(k.join(', ')||'Chưa phân công KTX');
 return kt+' · '+(d.join(', ')||'Chưa phân công Dãy/Phòng');
};
async function saveAccountRow(id,row){const sb=syncClient(),old=AUTHC.accounts.find(a=>a.user_id===id);if(!old)throw Error('Không tìm thấy tài khoản cần cập nhật.');const role=row.querySelector('[data-role]').value,enabled=row.querySelector('[data-enabled]').checked,ktx=csvArr(row.querySelector('[data-ktx]').value),days=csvArr(row.querySelector('[data-days]').value),admins=AUTHC.accounts.filter(a=>a.enabled&&a.role==='admin');if(old.enabled&&old.role==='admin'&&admins.length<=1&&(!enabled||role!=='admin'))throw Error('Không thể khóa hoặc hạ quyền Quản trị cuối cùng. Hãy cấp một Quản trị khác trước.');const changes=[];if(old.role!==role)changes.push(['ACCOUNT_ROLE',`Vai trò ${ROLES[old.role]||old.role} → ${ROLES[role]||role}`]);if(old.enabled!==enabled)changes.push(['ACCOUNT_STATUS',enabled?'Mở khóa tài khoản':'Khóa tài khoản']);if(JSON.stringify(old.ktx||[])!==JSON.stringify(ktx)||JSON.stringify(old.days||[])!==JSON.stringify(days))changes.push(['ACCOUNT_SCOPE',`Phạm vi → ${ktx.join(',')||'Chưa phân công KTX'} / ${days.join(',')||'Chưa phân công Dãy/Phòng'}`]);if(!sb)throw Error('Không có kết nối Supabase.');
 const {data:updated,error}=await sb.from('app_accounts').update({role,enabled,ktx,days,updated_at:new Date().toISOString()}).eq('user_id',id).select('user_id,role,enabled,ktx,days').maybeSingle();
 if(error)throw Error('Không lưu được phân quyền: '+error.message);
 if(!updated||String(updated.user_id)!==String(id)||updated.role!==role||updated.enabled!==enabled||JSON.stringify(updated.ktx||[])!==JSON.stringify(ktx)||JSON.stringify(updated.days||[])!==JSON.stringify(days))throw Error('Không lưu được phân quyền: Supabase chưa xác nhận dữ liệu mới. Kiểm tra quyền ghi và thử lại.');
 changes.forEach(([t,d])=>ae(t,`${old.email}: ${d}`));await authLoadAdminData();return true}
async function reviewRequest(id,approve){
 const sb=syncClient(),req=AUTHC.requests.find(x=>String(x.user_id)===String(id));
 if(!req||!sb)throw new Error('Không tìm thấy yêu cầu hoặc kết nối Supabase.');
 const role=approve?(document.querySelector(`[data-req="${id}"] [data-req-role]`)?.value||'viewer'):'viewer';
 const accountUpdate={role,enabled:!!approve,updated_at:new Date().toISOString()};
 const {data:updated,error}=await sb.from('app_accounts').update(accountUpdate).eq('user_id',id).select('user_id');
 if(error)throw new Error('Cập nhật tài khoản thất bại: '+error.message);
 if(!updated||updated.length!==1)throw new Error('Không tìm thấy tài khoản trong app_accounts. Kiểm tra trigger tạo hồ sơ khi đăng ký và RLS. Yêu cầu chưa được duyệt.');
 const {error:revError}=await sb.from('access_requests').update({status:approve?'approved':'rejected',reviewed_at:new Date().toISOString(),reviewed_by:SUPA_SYNC.session.user.id}).eq('user_id',id);
 if(revError)throw new Error('Đã sửa trạng thái tài khoản nhưng chưa cập nhật được yêu cầu: '+revError.message+'. Vui lòng liên hệ quản trị.');
 ae(approve?'ACCESS_APPROVE':'ACCESS_REJECT',req.email+' → '+(ROLES[role]||role));
 await authLoadAdminData();await accPage();
}

window.accPage=async function(){const el=document.getElementById('acc');if(!el)return;if(!can('acct')){el.innerHTML='<div class="card">Chỉ Quản trị được quản lý tài khoản.</div>';return}await authLoadAdminData();const q=window.__acQ||'',rf=window.__acRole||'',sf=window.__acStatus||'',rows=AUTHC.accounts.filter(a=>(!q||sa([a.display_name,a.email,a.role,(a.ktx||[]).join(' '),(a.days||[]).join(' ')].join(' ')).includes(sa(q)))&&(!rf||a.role===rf)&&(!sf||(sf==='on'?a.enabled:!a.enabled))),admins=AUTHC.accounts.filter(a=>a.enabled&&a.role==='admin').length,pending=AUTHC.requests.filter(r=>r.status==='pending').length;el.innerHTML=`<div class="ac-grid"><div class="ac-kpi"><span>Tổng tài khoản</span><b>${AUTHC.accounts.length}</b></div><div class="ac-kpi"><span>Đang hoạt động</span><b>${AUTHC.accounts.filter(a=>a.enabled).length}</b></div><div class="ac-kpi"><span>Quản trị</span><b>${admins}</b></div><div class="ac-kpi"><span>Chờ duyệt</span><b>${pending}</b></div></div><div class="card"><div class="ac-toolbar"><input id="acQ" placeholder="Tìm họ tên, email, KTX, Dãy..." value="${esc(q)}"><select id="acRole"><option value="">Tất cả vai trò</option>${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${rf===k?'selected':''}>${v}</option>`).join('')}</select><select id="acStatus"><option value="">Tất cả trạng thái</option><option value="on" ${sf==='on'?'selected':''}>Đang hoạt động</option><option value="off" ${sf==='off'?'selected':''}>Đã khóa</option></select><button class="btn s" id="acRefresh">Tải lại</button></div><div class="scope-note">Tài khoản Auth mới được tạo tại màn hình Đăng nhập → “Tạo yêu cầu tài khoản”. Quản trị duyệt tại đây.</div>${rows.map(a=>`<div class="ac-account ${a.enabled?'':'off'}" data-acct="${a.user_id}"><div><b>${esc(a.display_name||a.email)}</b><div class="ac-id">${esc(a.email)} · ${esc(a.user_id)}</div></div><select data-role>${acctRoleOptions(a.role)}</select><div><input data-ktx value="${esc((a.ktx||[]).join(', '))}" placeholder="KTX 1, KTX 2"><input data-days style="margin-top:4px" value="${esc((a.days||[]).join(', '))}" placeholder="Dãy 1, Dãy 2"><div class="scope-note">${esc(scopeText(a))}</div></div><label style="display:flex;align-items:center;gap:5px;font-size:9px"><input data-enabled type="checkbox" ${a.enabled?'checked':''}> Hoạt động</label><div class="ac-actions"><button class="save" data-save-acct>Lưu</button></div></div>`).join('')||'<div class="mut">Không có tài khoản phù hợp.</div>'}</div><div class="card"><h3>Yêu cầu truy cập chờ duyệt (${pending})</h3>${AUTHC.requests.filter(r=>r.status==='pending').map(r=>`<div class="ac-request" data-req="${r.user_id}"><div><b>${esc(r.display_name||r.email)}</b><div class="mut">${esc(r.email)}</div></div><select data-req-role>${acctRoleOptions('viewer')}</select><div class="mut">${r.requested_at?new Date(r.requested_at).toLocaleString('vi-VN'):'—'}</div><div class="ac-actions"><button class="save" data-approve>Duyệt</button><button data-reject>Từ chối</button></div></div>`).join('')||'<p class="mut">Không có yêu cầu đang chờ.</p>'}</div>`;let t;document.getElementById('acQ').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{window.__acQ=e.target.value;accPage()},180)};document.getElementById('acRole').onchange=e=>{window.__acRole=e.target.value;accPage()};document.getElementById('acStatus').onchange=e=>{window.__acStatus=e.target.value;accPage()};document.getElementById('acRefresh').onclick=async()=>{await authLoadAdminData();accPage()};el.querySelectorAll('[data-save-acct]').forEach(b=>b.onclick=()=>saveAccountRow(b.closest('[data-acct]').dataset.acct,b.closest('[data-acct]')));el.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>window.reviewRequest(b.closest('[data-req]').dataset.req,true));el.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>window.reviewRequest(b.closest('[data-req]').dataset.req,false))};
window.accessControlPage=async function(){const el=document.getElementById('access');if(!el)return;if(!can('acct')){el.innerHTML='<div class="card">Chỉ Quản trị được xem phân quyền.</div>';return}await authLoadAdminData();const order=['view','add','editw','transfer','residence','attendance','del','restore','purge','qrApprove','import','bulk','report','backup','acct'],labels={view:'Xem',add:'Thêm',editw:'Sửa',transfer:'Chuyển phòng',residence:'Cư trú',attendance:'Vào/Ra',del:'Xóa',restore:'Khôi phục',purge:'Xóa hẳn',qrApprove:'Duyệt QR',import:'Import',bulk:'Hàng loạt',report:'Báo cáo',backup:'Backup',acct:'Tài khoản'};el.innerHTML=`<div class="card"><h3>Ma trận phân quyền chuẩn</h3><div class="wrap"><table class="cmp3"><tr><th>Vai trò</th>${order.map(k=>`<th>${labels[k]}</th>`).join('')}</tr>${Object.entries(ROLES).map(([r,n])=>`<tr><td><b>${n}</b></td>${order.map(k=>`<td>${ROLE_PERMS[r][k]?'✓':'—'}</td>`).join('')}</tr>`).join('')}</table></div><div class="scope-note">Quản lý, Nhập liệu, Bảo vệ và Chỉ xem bị giới hạn theo KTX/Dãy khi có phạm vi được giao. Quyền nhạy cảm được kiểm tra độc lập.</div></div><div class="card"><h3>Tài khoản & phạm vi thực tế</h3>${AUTHC.accounts.map(a=>`<div class="ac-account ${a.enabled?'':'off'}"><div><b>${esc(a.display_name||a.email)}</b><div class="ac-id">${esc(a.email)}</div></div><div><b>${esc(ROLES[a.role]||a.role)}</b></div><div>${esc(scopeText(a))}</div><div>${a.enabled?'Đang hoạt động':'Đã khóa'}</div><div class="ac-actions"><button onclick="go('acc')">Quản lý</button></div></div>`).join('')}</div>`};
window.securityPage=async function(){const el=document.getElementById('security');if(!el)return;await authLoadAdminData();const sess=SUPA_SYNC.session,user=sess&&sess.user,events=authEvents(),last=events.slice(0,60),stale=AUTHC.accounts.filter(a=>{const t=a.last_login_at?new Date(a.last_login_at).getTime():0;return t&&Date.now()-t>90*864e5}).length;el.innerHTML=`<div class="sys-kpis"><div class="sys-kpi"><span>Supabase Auth</span><b>${sess?'ON':'OFF'}</b><small>${esc(user&&user.email||'Chưa đăng nhập')}</small></div><div class="sys-kpi"><span>Tài khoản</span><b>${AUTHC.accounts.length}</b><small>${AUTHC.accounts.filter(a=>a.enabled).length} hoạt động</small></div><div class="sys-kpi"><span>Lâu không đăng nhập</span><b>${stale}</b><small>Trên 90 ngày nếu có dữ liệu</small></div><div class="sys-kpi"><span>Đăng nhập lỗi gần đây</span><b>${events.filter(x=>x.type==='LOGIN_FAILED'&&Date.now()-x.at<7*864e5).length}</b><small>7 ngày gần nhất trên máy này</small></div></div><div class="sys-grid"><div class="card"><h3>Phiên đăng nhập hiện tại</h3><div class="sys-note"><b>Người dùng:</b> ${esc(ME.name||'—')}<br><b>Email:</b> ${esc(user&&user.email||'—')}<br><b>Vai trò:</b> ${esc(ROLES[ME.role]||ME.role)}<br><b>Phạm vi:</b> ${esc(scopeText(ME.acct||{}))}<br><b>Đăng nhập gần nhất:</b> ${user&&user.last_sign_in_at?new Date(user.last_sign_in_at).toLocaleString('vi-VN'):'—'}</div><div class="sys-actions" style="margin-top:10px"><button class="btn s" id="secOthers">Đăng xuất các phiên khác</button><button class="btn r" id="secGlobal">Đăng xuất mọi thiết bị</button></div></div><div class="card"><h3>Sự kiện xác thực gần đây</h3>${last.map(x=>`<div class="sec-event"><span><b>${esc(x.type)}</b> · ${esc(x.email||'')}</span><span>${new Date(x.at).toLocaleString('vi-VN')}</span></div>`).join('')||'<p class="mut">Chưa có sự kiện.</p>'}</div></div><div class="card"><h3>Nguyên tắc bảo mật</h3><div class="sys-note">• QR dùng chung phiên đăng nhập ứng dụng.<br>• Quản trị cuối cùng không thể bị khóa hoặc hạ quyền.<br>• Thay đổi vai trò, trạng thái và phạm vi được ghi nhật ký.<br>• Không lưu service_role trong trình duyệt.<br>• Có thể thu hồi các phiên khác hoặc đăng xuất mọi thiết bị của chính tài khoản hiện tại.</div></div>`;document.getElementById('secOthers').onclick=async()=>{if(confirm('Thu hồi các phiên đăng nhập khác của chính tài khoản này?'))await authHubLogout('others')};document.getElementById('secGlobal').onclick=async()=>{if(confirm('Đăng xuất tài khoản này trên mọi thiết bị?'))await authHubLogout('global')}};
function installUserbar(){const ft=document.getElementById('ft');if(!ft||document.getElementById('authUserbar'))return;const x=document.createElement('div');x.id='authUserbar';x.className='auth-userbar';x.innerHTML=`<div><b id="aubName"></b><small id="aubRole"></small></div><button id="aubOut">Đăng xuất</button>`;(ft.parentElement||document.body).appendChild(x);document.getElementById('aubOut').onclick=()=>authHubLogout('local');updateUserbar()}
function updateUserbar(){
 const n=document.getElementById('aubName'),r=document.getElementById('aubRole');
 const sessionUser=SUPA_SYNC?.session?.user;
 const account=SUPA_SYNC?.account;
 const verified=!!(sessionUser?.id&&account?.user_id===sessionUser.id&&account.enabled);
 if(!sessionUser){if(n)n.textContent='Chưa đăng nhập';if(r)r.textContent='Đăng nhập để tiếp tục';return}
 if(!verified){if(n)n.textContent='Đang xác minh tài khoản';if(r)r.textContent='Đang tải quyền';return}
 if(n)n.textContent=account.display_name||account.email||sessionUser.email||'Người dùng';
 if(r)r.textContent=ROLES[account.role]||account.role||'—';
}
window.updateAuthUserbar=updateUserbar;
// V2.0.133 — Restore a valid Supabase session before running optional data refreshes.
// Never sign out on reload, a transient network error, or an account-data timeout.
let ktxBootBusy=false;
function ktxSessionRecoveryNotice(message){
 const g=gateEl();g.classList.remove('hide');
 const card=g.querySelector('.auth-card2');if(!card)return;
 g.querySelector('#ahLogin')?.classList.add('hide');
 g.querySelector('.auth-tabs2')?.classList.add('hide');
 let area=card.querySelector('#ktxRetrySession');
 if(!area){area=document.createElement('div');area.id='ktxRetrySession';area.style.cssText='padding:12px;background:#f3f7ff;border:1px solid #bfd2f1;border-radius:10px';card.append(area)}
 area.replaceChildren();
 const title=document.createElement('b');title.textContent='Đang khôi phục phiên đăng nhập';area.append(title);
 const para=document.createElement('p');para.textContent=message||'Chưa thể kết nối máy chủ. Phiên đăng nhập đã lưu được giữ nguyên.';area.append(para);
 const retry=document.createElement('button');retry.type='button';retry.textContent='Thử kết nối lại';retry.onclick=()=>init();area.append(retry);
}
async function init(){
 if(ktxBootBusy)return;
 ktxBootBusy=true;window.__ktxAuthBooting=true;
 try{
  gateEl();installUserbar();
  if(typeof window.ktxLoadPublicConfig==='function')await window.ktxLoadPublicConfig();
  const sb=typeof syncClient==='function'?syncClient():null;
  if(!sb){ktxSessionRecoveryNotice('Không thể khởi tạo Supabase. Kiểm tra kết nối mạng và thử lại.');return}
  let session=null,sessionError=null;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const result=await sb.auth.getSession();
    if(result.error)throw result.error;
    session=result.data?.session||null;sessionError=null;break;
   }catch(err){sessionError=err;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)))}
  }
  if(sessionError){ktxSessionRecoveryNotice('Chưa thể đọc phiên Supabase: '+(sessionError.message||sessionError));return}
  if(!session){
    SUPA_SYNC.session=null;authHubShow('login');return;
  }
  SUPA_SYNC.session=session;
  // Verify role/scope before exposing application. A temporary error is NOT a logout.
  try{
   let accountErr=null;
   for(let attempt=0;attempt<3;attempt++){
    try{await syncLoadAccount();accountErr=null;break}
    catch(err){accountErr=err;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,550*(attempt+1)))}
   }
   if(accountErr)throw accountErr;
  }catch(err){
   console.warn('[KTX V2.0.133] Saved session, account fetch pending',err);
   ktxSessionRecoveryNotice('Phiên Supabase vẫn được giữ; chưa xác minh được quyền truy cập: '+(err.message||err));return;
  }
  SUPA_SYNC.ready=true;SUPA_SYNC.enabled=true;
  authHubHide();
  const retry=gateEl().querySelector('#ktxRetrySession');if(retry)retry.remove();
  gateEl().querySelector('#ahLogin')?.classList.remove('hide');
  gateEl().querySelector('.auth-tabs2')?.classList.remove('hide');
  updateUserbar();applyPerms();
  // UI is unlocked first; optional sync/audit refreshes must never hold the login screen.
  try{all()}catch(err){console.warn('[KTX] Dashboard refresh',err)}
  if(typeof window.KTX_MOBILE_GO_HOME_AFTER_LOGIN==='function')window.KTX_MOBILE_GO_HOME_AFTER_LOGIN('restore');
  Promise.resolve().then(async()=>{
   try{if(typeof ktx135StartAutomaticSync==='function')await ktx135StartAutomaticSync()}catch(err){console.warn('[KTX] Background sync',err)}
   try{await authTouch('seen')}catch(_){}
   try{await authLoadAdminData()}catch(err){console.warn('[KTX] Admin data',err)}
  });
  if(!window.__ktxAuthStateListener133){
   window.__ktxAuthStateListener133=true;
   sb.auth.onAuthStateChange((event,nextSession)=>{
    if(event==='SIGNED_OUT'){
     setTimeout(()=>{
      if(window.__ktxLoginBusy)return;
      SUPA_SYNC.session=null;SUPA_SYNC.account=null;SUPA_SYNC.ready=false;
      ME.id=null;ME.name='';ME.role='viewer';ME.acct=null;
      updateUserbar();authHubShow('login');
     },0);return;
    }
    if(!nextSession)return;
    const previousId=SUPA_SYNC.session?.user?.id||null;
    SUPA_SYNC.session=nextSession;
    if(window.__ktxLoginBusy||window.__ktxAuthBooting)return;
    // Auth can change without a full document navigation (e.g. switching accounts).
    // Always verify account ownership on the server before displaying privileges.
    if(window.__ktxAuthSwitchTimer)clearTimeout(window.__ktxAuthSwitchTimer);
    window.__ktxAuthSwitchTimer=setTimeout(async()=>{
      if(window.__ktxLoginBusy||window.__ktxAuthBooting)return;
      const uid=SUPA_SYNC.session?.user?.id;
      if(!uid)return;
      try{
        const account=await syncLoadAccount();
        if(SUPA_SYNC.session?.user?.id!==uid)return;
        if(!account||account.user_id!==uid)return;
        SUPA_SYNC.ready=true;SUPA_SYNC.enabled=true;
        updateUserbar();applyPerms();authHubHide();
        if(previousId&&previousId!==uid){window.location.reload();return}
        try{all()}catch(_e){}
      }catch(error){
        SUPA_SYNC.ready=false;SUPA_SYNC.account=null;
        ME.id=null;ME.name='';ME.role='viewer';ME.acct=null;
        updateUserbar();applyPerms();
        authHubShow('login','Chưa thể xác minh tài khoản: '+(error?.message||String(error)));
      }
    },100);
   });
  }
 }catch(err){
  console.error('[KTX V2.0.133] Auth startup',err);
  ktxSessionRecoveryNotice('Không thể xác minh phiên lúc này: '+(err.message||err));
 }finally{ktxBootBusy=false;window.__ktxAuthBooting=false}
}
setTimeout(init,700);
})();

;
/* >>> Original: assets/js/core/script-37.js >>> */

(function(){'use strict';
 function fit(){
  document.querySelectorAll('.u169-wrap iframe').forEach(function(frame){
   if(frame.closest('.hide'))return;
   var top=frame.getBoundingClientRect().top;
   var usable=Math.max(360, Math.floor(window.innerHeight-top-12));
   frame.style.setProperty('height',usable+'px','important');
   frame.style.setProperty('min-height',Math.min(360,usable)+'px','important');
  });
 }
 window.addEventListener('resize',function(){requestAnimationFrame(fit)},{passive:true});
 window.addEventListener('orientationchange',function(){setTimeout(fit,180)},{passive:true});
 document.addEventListener('click',function(e){if(e.target.closest('[data-p],.u169-head button,.utilhub-card,.utilhub-btn'))setTimeout(fit,65)},{passive:true});
 var oldGo=window.go;
 function attach(){
  if(typeof window.go==='function'&&window.go!==oldGo){oldGo=window.go;}
  if(typeof window.go==='function'&&!window.go.__fit178){var original=window.go;window.go=function(){var result=original.apply(this,arguments);requestAnimationFrame(fit);setTimeout(fit,80);return result};window.go.__fit178=true}
 }
 document.addEventListener('DOMContentLoaded',function(){attach();setTimeout(fit,150)});
 window.addEventListener('load',function(){attach();setTimeout(fit,200)});
})();

;
/* >>> Original: assets/js/modules/meals/script-38.js >>> */
/* V2.0.120: Embed the menu viewer in the normal application route.
   The sidebar and application top header remain visible; no dialog or close button. */
(function(){'use strict';
  function loadFrame(){
    var frame=document.getElementById('menuNcc211Frame');
    if(frame && !frame.getAttribute('src')) frame.setAttribute('src',frame.dataset.url||'/pages/kiem-tra-menu-ncc.html');
  }
  window.openKiemTraMenuNCC=function(){
    if(window.matchMedia && window.matchMedia('(max-width:760px)').matches && typeof window.KTX_MOBILE_OPEN_MENU==='function'){
      window.KTX_MOBILE_OPEN_MENU();return;
    }
    if(typeof window.go==='function'){
      window.go('menuview');
      loadFrame();
    }else{
      var link=document.querySelector('nav button[data-p="menuview"]');
      if(link){link.click();loadFrame();}
    }
  };
  var link=document.querySelector('nav button[data-p="menuview"]');
  if(link)link.addEventListener('click',loadFrame);
  if(document.body && document.body.dataset.page==='menuview')loadFrame();
})();
