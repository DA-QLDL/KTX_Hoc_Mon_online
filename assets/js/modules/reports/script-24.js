
/* STEP96 — Trung tâm báo cáo */
let RC96={type:'summary',preset:'month',ktx:'',from:'',to:''};
const RC96_TYPES={
 summary:['Tổng hợp vận hành','Quân số, công suất, giường trống, hồ sơ và tạm vắng'],
 movement:['Tăng · giảm nhân sự','Công nhân vào KTX và chuyển ra trong khoảng ngày'],
 rooms:['Công suất phòng','Sĩ số, giường trống, đầy và quá tải từng phòng'],
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
   headers=['Chỉ tiêu','Giá trị'];rows=[['Tổng công nhân',L.length],['Nam',L.filter(w=>isNam(w.gt)).length],['Nữ',L.filter(w=>isNu(w.gt)).length],['Phòng có dữ liệu',rs.length],['Giường trống',free],['Phòng quá tải',over],['Đã khai báo tạm trú',tt],['Đang tạm vắng',away],['Hồ sơ chưa đầy đủ',missing],['Tăng trong kỳ',inc],['Giảm trong kỳ',dec]];
 }else if(t==='movement'){
   headers=['Loại','Ngày','Họ và tên','Mã NV','KTX','Dãy','Phòng','Lý do/Ghi chú'];
   const inc=L.filter(w=>rc96InRange(w.date,from,to)).map(w=>['Tăng',String(w.date||'').slice(0,10),w.name,w.mnv,K(w),D(w),R(w),'Vào KTX']);
   const dec=A.filter(a=>rc96InRange(a.date,from,to)).map(a=>['Giảm',String(a.date||'').slice(0,10),a.w&&a.w.name,a.w&&a.w.mnv,K(a.w),D(a.w),R(a.w),a.reason||a.note||'Chuyển ra']);rows=[...inc,...dec].sort((a,b)=>String(a[1]).localeCompare(String(b[1]))||String(a[2]).localeCompare(String(b[2]),'vi'));
 }else if(t==='rooms'){
   headers=['KTX','Dãy','Phòng','Sĩ số','Định mức','Giường trống','Công năng','Trạng thái'];rows=rs.sort((a,b)=>num(a.ktx,b.ktx)||num(a.day,b.day)||num(a.room,b.room)).map(r=>[r.ktx,r.day,r.room,r.n,CAP,Math.max(0,CAP-r.n),roomTypeText(roomMode(r.ktx,r.day,r.room,r.l)),r.n>CAP?'Quá tải':r.n===CAP?'Đầy':'Còn trống']);
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
 $('reports').innerHTML=`<div class="rc96-kpis"><div class="rc96-kpi"><span>Công nhân</span><b>${L.length.toLocaleString('vi-VN')}</b></div><div class="rc96-kpi good"><span>Giường trống</span><b>${free.toLocaleString('vi-VN')}</b></div><div class="rc96-kpi ${over?'bad':''}"><span>Phòng quá tải</span><b>${over}</b></div><div class="rc96-kpi ${missing?'warn':''}"><span>Hồ sơ thiếu</span><b>${missing.toLocaleString('vi-VN')}</b></div><div class="rc96-kpi"><span>Tăng trong kỳ</span><b>+${inc}</b></div><div class="rc96-kpi"><span>Giảm trong kỳ</span><b>${dec}</b></div></div>
 <div class="card"><div class="rc96-head"><div><h3>Trung tâm báo cáo</h3><div class="mut">Báo cáo ngày, tuần, tháng và các báo cáo vận hành KTX trong một nơi.</div></div><div class="rc96-presets"><button class="rc96-chip ${RC96.preset==='today'?'on':''}" data-rp96="today">Hôm nay</button><button class="rc96-chip ${RC96.preset==='week'?'on':''}" data-rp96="week">Tuần này</button><button class="rc96-chip ${RC96.preset==='month'?'on':''}" data-rp96="month">Tháng này</button></div></div>
 <div class="rc96-controls"><label>Từ ngày<input id="rc96From" type="date" value="${RC96.from}"></label><label>Đến ngày<input id="rc96To" type="date" value="${RC96.to}"></label><label>Phạm vi<select id="rc96Ktx"><option value="">Tất cả KTX</option>${ks.map(k=>`<option value="${esc(k)}" ${RC96.ktx===k?'selected':''}>${esc(k)}</option>`).join('')}</select></label><label>Loại báo cáo<select id="rc96Type">${Object.entries(RC96_TYPES).map(([id,v])=>`<option value="${id}" ${RC96.type===id?'selected':''}>${esc(v[0])}</option>`).join('')}</select></label><label>Ảnh chụp hiện tại<input value="${L.length.toLocaleString('vi-VN')} công nhân" readonly></label></div>
 <div class="rc96-types">${Object.entries(RC96_TYPES).map(([id,v])=>`<button class="rc96-type ${RC96.type===id?'on':''}" data-rt96="${id}"><b>${esc(v[0])}</b><span>${esc(v[1])}</span></button>`).join('')}</div>
 <div class="rc96-actions"><button class="btn" id="rc96Excel">Xuất Excel</button><button class="btn g" id="rc96Word">Xuất Word</button><button class="btn ta-violet" id="rc96Pdf">Xuất PDF</button><button class="btn ta-amber" id="rc96Daily">Xuất báo cáo quân số ngày</button><span class="mut" style="font-size:9px">PDF mở hộp thoại in của trình duyệt → chọn “Save as PDF”.</span></div>
 <div id="rc96Preview" class="rc96-preview"></div><div class="rc96-note">Các báo cáo công suất phòng, tạm trú/tạm vắng và hồ sơ là ảnh chụp dữ liệu hiện tại. Báo cáo tăng · giảm sử dụng khoảng ngày đã chọn. Định mức phòng cố định ${CAP} người/phòng.</div></div>`;
 document.querySelectorAll('[data-rp96]').forEach(b=>b.onclick=()=>rc96SetPreset(b.dataset.rp96));document.querySelectorAll('[data-rt96]').forEach(b=>b.onclick=()=>{RC96.type=b.dataset.rt96;managementReportsPage()});
 $('rc96From').onchange=e=>{RC96.from=e.target.value;RC96.preset='custom';rc96Preview()};$('rc96To').onchange=e=>{RC96.to=e.target.value;RC96.preset='custom';rc96Preview()};$('rc96Ktx').onchange=e=>{RC96.ktx=e.target.value;managementReportsPage()};$('rc96Type').onchange=e=>{RC96.type=e.target.value;managementReportsPage()};
 $('rc96Excel').onclick=()=>{const d=rc96Data();save([d.headers,...d.rows],`${rc96FileSlug(d.title)}_${RC96.from}_${RC96.to}.xlsx`,d.title.slice(0,31))};$('rc96Word').onclick=()=>{const d=rc96Data();saveDocx(d.lines,`${rc96FileSlug(d.title)}_${RC96.from}_${RC96.to}.docx`)};$('rc96Pdf').onclick=rc96PrintPdf;$('rc96Daily').onclick=()=>exportDailyReportDirect();rc96Preview();
}
