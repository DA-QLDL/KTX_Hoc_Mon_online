/* KTX V13 staging – module-aware local-pending presentation.
 * Local staged data is NEVER Cloud-confirmed data. Do not remove live worker,
 * archive, meal or menu rows from official views on the strength of a draft.
 * QR pending request filtering remains the responsibility of QR V12.
 */
(function () {
  'use strict';
  if (window.KTX_DEVICE_QUEUE_STATUS_V13) return;
  // Hide the global device-queue banner on Meal Report only; retain IndexedDB synchronization.
  const sections = []; // Disable the optional visual queue panels, preserve queue API and processing.
  const labels = { qr: 'Duyệt QR vào/ra', meal: 'Số suất ăn', menu: 'Thực đơn Excel', worker: 'Thêm/Sửa công nhân', operation: 'Điều chuyển/Nghỉ việc/Xóa' };
  const active = new Set(['pending','sending','review','failed','staged']);
  let pendingRefresh = null;
  function account() { return String(typeof SUPA_SYNC!=='undefined' ? (SUPA_SYNC?.session?.user?.id || '') : ''); }
  function node(tag, text, cls) { const e=document.createElement(tag); if(cls)e.className=cls; if(text!==undefined)e.textContent=String(text); return e; }
  async function snapshot() {
    const a=account();
    if (!a) return {actor:'', groups:{}, error:''};
    const groups={qr:[], meal:[], menu:[], worker:[], operation:[]};
    const errors=[];
    const q=window.KTX_DEVICE_QUEUE;
    if(q?.list){
      try {
        (await q.list()).filter(j=>j.actor===a && active.has(j.status)).forEach(j=>{
          if(j.kind==='qr')groups.qr.push({id:j.id||j.recordId,status:j.status,desc:j.type==='in'?'Đăng ký vào':'Đăng ký ra'});
          else if(j.kind==='meal-count')groups.meal.push({id:j.recordId||j.key,status:j.status,desc:j.payload?.date+' · '+j.payload?.period+' · '+j.payload?.vendor});
        });
      } catch(e){errors.push('Hàng đợi: '+String(e?.message||e));}
    }
    try {
      const m=window.KTX_MENU_DRAFTS_V4;
      if(m?.status){const s=await m.status();(s.rows||[]).forEach(x=>groups.menu.push({id:x.id,status:x.status||'pending',desc:(x.count||0)+' bảng thực đơn'}));}
    } catch(e){errors.push('Thực đơn: '+String(e?.message||e));}
    try {
      const w=window.KTX_WORKER_DRAFTS;
      if(w?.own){(await w.own()).forEach(x=>groups.worker.push({id:x.id,status:'staged',desc:x.mode==='add'?'Bản nháp thêm công nhân':'Bản nháp sửa công nhân'}));}
    } catch(e){errors.push('Công nhân: '+String(e?.message||e));}
    try {
      const o=window.KTX_WORKER_OPERATIONS_V6;
      if(o?.own){(await o.own()).filter(x=>x.status!=='confirmed').forEach(x=>groups.operation.push({id:x.id,status:x.status||'review',desc:x.mode||x.type||'Yêu cầu cần đối soát'}));}
    } catch(e){errors.push('Điều chuyển/Xóa: '+String(e?.message||e));}
    if(account()!==a)return {actor:'',groups:{},error:''};
    return {actor:a,groups,error:errors.join(' · ')};
  }
  function totals(groups,which){return which.reduce((sum,k)=>sum+(groups[k]?.length||0),0);}
  function description(section){
    return section==='meal'?'Số suất/Thực đơn đã ghi trên thiết bị đang chờ Cloud; biểu đồ và dữ liệu Cloud không bị xóa.'
      : section==='work'?'Bản nháp công nhân chưa phải hồ sơ Cloud; danh sách và quân số chính thức không thay đổi.'
      : section==='arc'?'Yêu cầu ảnh hưởng quân số cần đối soát Cloud; không phát lại lệnh xóa/điều chuyển.'
      : 'Tất cả yêu cầu cục bộ của tài khoản hiện tại; lưu trên thiết bị không đồng nghĩa đã hoàn tất Cloud.';
  }
  function relevant(section){return section==='meal'?['meal','menu']:section==='work'?['worker']:section==='arc'?['operation']:['qr','meal','menu','worker','operation'];}
  function showDialog(title,items){
    let dlg=document.getElementById('ktxQueueV13Dialog');
    if(!dlg){dlg=node('dialog',undefined,'ktx-v13-dialog');dlg.id='ktxQueueV13Dialog';document.body.append(dlg);}
    dlg.replaceChildren(node('h3',title));
    dlg.append(node('p','Đây là các yêu cầu/bản nháp lưu trên THIẾT BỊ, chưa phải dữ liệu đã xác nhận trên Supabase.','ktx-v13-muted'));
    const list=node('div',undefined,'ktx-v13-list');
    for(const {key,item} of items.slice(0,80)){
      const line=node('div',undefined,'ktx-v13-item');
      line.append(node('strong',labels[key]||key),node('span',item.desc||String(item.id||'')),node('small',({'pending':'Chờ đồng bộ','sending':'Đang gửi','review':'Cần đối soát','failed':'Tạm dừng do lỗi','staged':'Bản nháp – cần kiểm tra','queued':'Đã lưu trên thiết bị','sent':'Đã gửi – cần xác minh'})[item.status]||item.status));
      list.append(line);
    }
    if(items.length>80)list.append(node('p','Còn '+(items.length-80)+' yêu cầu khác.'));
    dlg.append(list);
    const actions=node('div',undefined,'ktx-v13-actions');
    if(items.some(x=>x.key==='worker')&&window.KTX_WORKER_DRAFTS?.show){const b=node('button','Mở bản nháp công nhân','btn s sm');b.onclick=()=>{dlg.close();window.KTX_WORKER_DRAFTS.show().catch(e=>alert(String(e.message||e)))};actions.append(b)}
    if(items.some(x=>x.key==='operation')&&window.KTX_WORKER_OPERATIONS_V6?.show){const b=node('button','Mở đối soát điều chuyển/xóa','btn s sm');b.onclick=()=>{dlg.close();window.KTX_WORKER_OPERATIONS_V6.show().catch(e=>alert(String(e.message||e)))};actions.append(b)}
    if(items.some(x=>x.key==='menu')){const b=node('button','Kiểm tra bản nháp thực đơn','btn s sm');b.onclick=()=>{dlg.close();if(document.getElementById('mp_drafts_v4'))document.getElementById('mp_drafts_v4').click();else alert('Mở mục Báo cáo suất ăn để kiểm tra thực đơn.');};actions.append(b)}
    const close=node('button','Đóng','btn s sm');close.onclick=()=>dlg.close();actions.append(close);dlg.append(actions);
    if(!dlg.open)dlg.showModal();
  }
  function render(section,s){
    const host=document.getElementById(section);if(!host||host.classList.contains('hide'))return;
    const ids=relevant(section),total=totals(s.groups,ids);
    let panel=host.querySelector(':scope > .ktx-v13-panel');
    if(!s.actor||(!total&&!s.error)){panel?.remove();return;}
    if(!panel){panel=node('aside',undefined,'ktx-v13-panel');panel.setAttribute('aria-label','Tác vụ lưu trên thiết bị');host.insertBefore(panel,host.firstChild)}
    panel.replaceChildren();
    const text=node('div',undefined,'ktx-v13-text');text.append(node('strong',total+' yêu cầu/bản nháp trên thiết bị'));
    text.append(node('small',description(section)));if(s.error)text.append(node('small','Không đọc được một phần bộ nhớ: '+s.error,'ktx-v13-error'));
    panel.append(text);
    if(total){const b=node('button','Xem hàng đợi','btn s sm');b.type='button';b.onclick=()=>{
      const items=ids.flatMap(key=>(s.groups[key]||[]).map(item=>({key,item})));
      showDialog('Yêu cầu đang lưu trên thiết bị',items);
    };panel.append(b)}
  }
  async function refresh(){
    if(pendingRefresh)return pendingRefresh;
    pendingRefresh=(async()=>{const s=await snapshot();sections.forEach(k=>render(k,s));return s})().finally(()=>{pendingRefresh=null});
    return pendingRefresh;
  }
  window.KTX_DEVICE_QUEUE_STATUS_V13=Object.freeze({snapshot,refresh});
  setInterval(()=>{if(!document.hidden)refresh().catch(console.warn)},9000);
  window.addEventListener('online',()=>refresh().catch(console.warn));
  window.addEventListener('pageshow',()=>refresh().catch(console.warn));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh().catch(console.warn)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-go],a,button'))setTimeout(()=>refresh().catch(console.warn),350)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>refresh().catch(console.warn),{once:true});
  else refresh().catch(console.warn);
})();
