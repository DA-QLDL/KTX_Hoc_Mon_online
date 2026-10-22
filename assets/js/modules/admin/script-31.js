
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
