
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
