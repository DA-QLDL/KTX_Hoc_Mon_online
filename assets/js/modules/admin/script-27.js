
/* STEP103 — Kiểm tra toàn bộ dữ liệu */
const AUDIT_CATS={profile:'Hồ sơ',duplicate:'Trùng dữ liệu',room:'Phòng',residence:'Cư trú',sync:'Đồng bộ'};
let DATA_AUDIT_STATE={q:'',sev:'all',cat:'all',ktx:''};
function auditDigits(v){return String(v||'').replace(/\D/g,'')}
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
   else if(!/^0\d{9}$/.test(p))add('profile','warn',w.name||'Hồ sơ',`SĐT ${p} chưa đúng định dạng 10 số bắt đầu bằng 0.`,{w});
   if(!w.dob)add('profile','warn',w.name||'Hồ sơ','Chưa có ngày sinh.',{w});
   else if(String(w.dob).slice(0,10)>today)add('profile','danger',w.name||'Hồ sơ','Ngày sinh lớn hơn ngày hiện tại.',{w});
   if(w.date&&String(w.date).slice(0,10)>today)add('profile','warn',w.name||'Hồ sơ','Ngày vào KTX lớn hơn ngày hiện tại.',{w});
   if(!k||!/^KTX\s*[12]$/i.test(k))add('profile','danger',w.name||'Hồ sơ',`KTX không hợp lệ: ${k||'trống'}.`,{w});
   if(!d||!/^Dãy\s*[1-6]$/i.test(d))add('profile','danger',w.name||'Hồ sơ',`Dãy không hợp lệ: ${d||'trống'}.`,{w});
   if(!r)add('room','warn',w.name||'Hồ sơ','Chưa phân phòng.',{w});
   else if(!/^\d+$/.test(r)||+r<1||+r>15)add('room','danger',w.name||'Hồ sơ',`Phòng không hợp lệ: ${r}.`,{w});
   if(w.tv&&w.tv.to&&String(w.tv.to).slice(0,10)<today)add('residence','warn',w.name||'Hồ sơ',`Tạm vắng đã hết hạn từ ${vn(String(w.tv.to).slice(0,10))} nhưng trạng thái vẫn còn.`,{w});
 });
 cccd.forEach((L,c)=>{if(L.length>1)add('duplicate','danger',`CCCD trùng: ${c}`,`${L.length} hồ sơ: ${L.slice(0,4).map(x=>x.name||'Không tên').join(', ')}${L.length>4?'…':''}`,{workers:L})});
 mnv.forEach((L,m)=>{if(L.length>1)add('duplicate','warn',`Mã NV trùng: ${m}`,`${L.length} hồ sơ: ${L.slice(0,4).map(x=>x.name||'Không tên').join(', ')}${L.length>4?'…':''}`,{workers:L})});
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
function auditActionLabel(x){if(x.w)return 'Sửa hồ sơ';if(x.room)return 'Mở phòng';if(x.cat==='duplicate')return 'Lọc trùng';if(x.cat==='sync')return 'Đồng bộ';return 'Xem'}
function auditDoAction(x){if(!x)return;if(x.w)return edit(x.w);if(x.room){go('home');setTimeout(()=>openRoomDrawer(x.room.ktx,x.room.day,x.room.room,x.room.l||[]),60);return}if(x.cat==='duplicate')return go('t2');if(x.cat==='sync')return go('sync')}
function auditFiltered(L){const s=DATA_AUDIT_STATE,q=sa(s.q);return L.filter(x=>(s.sev==='all'||x.sev===s.sev)&&(s.cat==='all'||x.cat===s.cat)&&(!s.ktx||K(x.w||{})===s.ktx||(x.room&&x.room.ktx===s.ktx))&&(!q||sa([x.title,x.detail,AUDIT_CATS[x.cat]||x.cat].join(' ')).includes(q)))}
async function auditExport(L){const rows=[['Mức độ','Nhóm','Tiêu đề','Chi tiết','Họ tên','Mã NV','CCCD','KTX','Dãy','Phòng'],...L.map(x=>{const w=x.w||(x.workers&&x.workers[0])||{};return [x.sev==='danger'?'Lỗi':x.sev==='warn'?'Cảnh báo':'Thông tin',AUDIT_CATS[x.cat]||x.cat,x.title,x.detail,w.name||'',w.mnv||'',w.cccd||'',x.room?x.room.ktx:K(w),x.room?x.room.day:D(w),x.room?x.room.room:R(w)]})];await save(rows,`Kiem_tra_du_lieu_${ldy()}.xlsx`,'Kiểm tra dữ liệu')}
function dataAuditPage(){const el=$('dataaudit');if(!el)return;const A=dataAuditScan(),L=auditFiltered(A),bad=A.filter(x=>x.sev==='danger').length,warn=A.filter(x=>x.sev==='warn').length,affected=new Set(A.flatMap(x=>x.w?[x.w.id]:(x.workers||[]).map(w=>w.id)).filter(Boolean)).size,roomIssues=A.filter(x=>x.cat==='room').length,dup=A.filter(x=>x.cat==='duplicate').length,ks=[...new Set(W.map(K).filter(Boolean))].sort(num);el.innerHTML=`<div id="auditRoot"><div class="audit-top"><div class="audit-kpi ${A.length?'warn':'ok'}"><span>Tổng vấn đề</span><b>${A.length.toLocaleString('vi-VN')}</b><small>${A.length?'Cần rà soát':'Dữ liệu sạch'}</small></div><div class="audit-kpi ${bad?'bad':'ok'}"><span>Lỗi nghiêm trọng</span><b>${bad}</b><small>Cần ưu tiên xử lý</small></div><div class="audit-kpi ${warn?'warn':'ok'}"><span>Cảnh báo</span><b>${warn}</b><small>Có thể xử lý dần</small></div><div class="audit-kpi"><span>Hồ sơ ảnh hưởng</span><b>${affected}</b><small>Trên ${W.length.toLocaleString('vi-VN')} công nhân</small></div><div class="audit-kpi ${dup?'warn':'ok'}"><span>Trùng dữ liệu</span><b>${dup}</b><small>${roomIssues} vấn đề phòng</small></div></div><div class="card"><div class="audit-toolbar"><input id="auditQ" placeholder="Tìm tên, lỗi, CCCD, phòng..." value="${esc(DATA_AUDIT_STATE.q)}"><select id="auditSev"><option value="all">Tất cả mức độ</option><option value="danger" ${DATA_AUDIT_STATE.sev==='danger'?'selected':''}>Lỗi nghiêm trọng</option><option value="warn" ${DATA_AUDIT_STATE.sev==='warn'?'selected':''}>Cảnh báo</option><option value="info" ${DATA_AUDIT_STATE.sev==='info'?'selected':''}>Thông tin</option></select><select id="auditCat"><option value="all">Tất cả nhóm</option>${Object.entries(AUDIT_CATS).map(([k,v])=>`<option value="${k}" ${DATA_AUDIT_STATE.cat===k?'selected':''}>${v}</option>`).join('')}</select><select id="auditK"><option value="">Tất cả KTX</option>${ks.map(k=>`<option ${DATA_AUDIT_STATE.ktx===k?'selected':''}>${esc(k)}</option>`).join('')}</select><div class="audit-actions"><button class="btn" id="auditRefresh">Quét lại</button><button class="btn g" id="auditExport">Xuất Excel</button></div></div><div class="audit-note">Hệ thống chỉ <b>quét và cảnh báo</b>, không tự sửa hay xóa dữ liệu. Định mức phòng vẫn cố định <b>${CAP} người/phòng</b>.</div><div class="audit-summary"><span>Đang hiển thị ${L.length}/${A.length}</span><span>Hồ sơ ${A.filter(x=>x.cat==='profile').length}</span><span>Phòng ${roomIssues}</span><span>Trùng ${dup}</span><span>Cư trú ${A.filter(x=>x.cat==='residence').length}</span><span>Đồng bộ ${A.filter(x=>x.cat==='sync').length}</span></div><div class="audit-list">${L.length?L.map((x,i)=>`<div class="audit-row ${x.sev}"><i class="audit-dot"></i><div><div class="audit-title">${esc(x.title)}</div><span class="audit-badge">${esc(AUDIT_CATS[x.cat]||x.cat)}</span></div><div class="audit-detail">${esc(x.detail)}</div><div class="audit-meta">${x.w?`${esc(K(x.w)||'')} ${esc(D(x.w)||'')} P.${esc(R(x.w)||'—')}`:x.room?`${esc(x.room.ktx)} ${esc(x.room.day)} P.${esc(x.room.room)}`:''}</div><button class="btn s" data-audit-act="${i}">${auditActionLabel(x)}</button></div>`).join(''):'<div class="audit-empty"><div class="audit-pass">✓ Không có vấn đề phù hợp bộ lọc.</div><div style="margin-top:4px">Dữ liệu hiện tại không phát hiện lỗi trong phạm vi đang quét.</div></div>'}</div></div></div>`;
 const rerender=()=>{DATA_AUDIT_STATE={q:$('auditQ').value,sev:$('auditSev').value,cat:$('auditCat').value,ktx:$('auditK').value};dataAuditPage()};$('auditQ').oninput=rerender;$('auditSev').onchange=rerender;$('auditCat').onchange=rerender;$('auditK').onchange=rerender;$('auditRefresh').onclick=()=>{DATA_AUDIT_STATE={q:'',sev:'all',cat:'all',ktx:''};dataAuditPage()};$('auditExport').onclick=()=>auditExport(A);document.querySelectorAll('#dataaudit [data-audit-act]').forEach(b=>b.onclick=()=>auditDoAction(L[+b.dataset.auditAct]));
}
