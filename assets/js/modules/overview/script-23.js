
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
   if(RR.length){h+='<div class="gs-section">Phòng</div>'+RR.map((x,i)=>`<button class="gs-result" data-gsr="${i}"><span class="gs-ico room">P</span><span class="gs-main"><span class="gs-name">${esc(x.k)} · ${esc(x.d)} · Phòng ${esc(x.r)}</span><span class="gs-meta">${x.list.length}/${CAP} người · còn ${Math.max(0,CAP-x.list.length)} giường</span></span><span class="gs-tag">Phòng</span></button>`).join('')}
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
