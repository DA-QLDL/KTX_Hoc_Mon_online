
(function(){
  const key='latest_good';
  let dbp;
  function db(){return dbp||(dbp=new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(new Error('IndexedDB không được hỗ trợ'));return}
    const r=indexedDB.open('KTX_Durable_Backup_143',1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('snapshots'))r.result.createObjectStore('snapshots')};
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Không mở được IndexedDB'));
  }))}
  async function writeSnapshot(snapshot){const database=await db();await new Promise((resolve,reject)=>{
    const tx=database.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snapshot,key);
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  })}
  async function readSnapshot(){const database=await db();return await new Promise((resolve,reject)=>{
    const tx=database.transaction('snapshots','readonly'),req=tx.objectStore('snapshots').get(key);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  })}
  let saving=false;
  async function save(){if(saving||!Array.isArray(W)||!W.length)return; saving=true;try{
    const v={at:Date.now(),W:JSON.parse(JSON.stringify(W)),ARC:JSON.parse(JSON.stringify(ARC)),LOG:JSON.parse(JSON.stringify(LOG)),ATT:JSON.parse(JSON.stringify(ATT)),REG:JSON.parse(JSON.stringify(REG)),ROOMMETA:JSON.parse(JSON.stringify(ROOMMETA))};
    await writeSnapshot(v);
  }finally{saving=false}}
  window.KTX143_BACKUP={save,read:readSnapshot};
  async function recoveryCheck(){
    if(typeof W==='undefined'||W.length){if(W.length)await save();return}
    let prev;
    try{prev=await readSnapshot()}catch(e){return}
    if(!prev||!Array.isArray(prev.W)||!prev.W.length)return;
    const host=document.querySelector('main')||document.body;
    if(document.getElementById('ktx143Recovery'))return;
    const el=document.createElement('div');el.id='ktx143Recovery';el.className='show';
    el.innerHTML='<b>Phát hiện dữ liệu công nhân đã lưu dự phòng ('+prev.W.length.toLocaleString('vi-VN')+' hồ sơ).</b><div>Danh sách đang hiển thị trống. Có thể khôi phục dữ liệu từ bản sao trên thiết bị này; thao tác không xóa bản dự phòng.</div><button type="button" class="btn s" id="ktx143Restore">Khôi phục dữ liệu</button>';
    host.prepend(el);
    el.querySelector('#ktx143Restore').onclick=()=>{
      if(W.length){alert('Dữ liệu hiện tại đã được nạp. Hãy kiểm tra lại trước khi khôi phục.');return}
      if(!confirm('Khôi phục '+prev.W.length+' hồ sơ công nhân từ bản lưu trên thiết bị này?'))return;
      W=prev.W;ARC=prev.ARC||[];LOG=prev.LOG||[];ATT=prev.ATT||[];REG=prev.REG||[];ROOMMETA=prev.ROOMMETA||{};
      sv();all();el.remove();alert('Đã khôi phục dữ liệu trên thiết bị này.');
    };
  }
  function logoutStyle(){const btn=document.getElementById('aubOut');if(!btn)return;
    btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/></svg><span>Đăng xuất</span>';
    btn.setAttribute('aria-label','Đăng xuất khỏi tài khoản hiện tại');
  }
  document.addEventListener('DOMContentLoaded',()=>{logoutStyle();setTimeout(recoveryCheck,1200)});
  window.addEventListener('load',()=>{logoutStyle();setTimeout(recoveryCheck,2600)});
})();
