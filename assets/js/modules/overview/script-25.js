
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
