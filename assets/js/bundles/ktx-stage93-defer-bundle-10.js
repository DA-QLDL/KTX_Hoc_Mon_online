/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/scroll-layout-v2122.js >>> */
/* KTX Hoc Mon V2.0.122 - Avoid nested page/iframe vertical scrollbars.
   Only adjust a same-origin embedded document in a normal page route.
   Do not interfere with dialogs, drawers, worker tables or touch scrolling. */
(function(){'use strict';
  function bindAutoHeight(id){
    var frame=document.getElementById(id);
    if(!frame || frame.dataset.ktxAutoHeight==='1') return;
    frame.dataset.ktxAutoHeight='1';
    var observer=null, mutation=null, win=null, raf=0;
    function measure(){
      raf=0;
      if(!frame.isConnected) return;
      try {
        var doc=frame.contentDocument;
        if(!doc || !doc.body) return;
        /* Body bounding box is independent of the iframe viewport height;
           documentElement.scrollHeight can equal iframe height and prevent shrinking. */
        var body=doc.body, style=win.getComputedStyle(body);
        var top=parseFloat(style.marginTop)||0, bottom=parseFloat(style.marginBottom)||0;
        var height=Math.max(280, Math.ceil(body.getBoundingClientRect().height+top+bottom+4));
        if(Math.abs((parseFloat(frame.style.height)||0)-height)>2)
          frame.style.height=height+'px';
      }catch(_){ /* Cross-origin frames are not controlled here. */ }
    }
    function queue(){if(!raf)raf=window.requestAnimationFrame(measure)}
    function setup(){
      if(observer){observer.disconnect();observer=null}
      if(mutation){mutation.disconnect();mutation=null}
      try{
        var doc=frame.contentDocument;
        if(!doc||!doc.body)return;
        win=frame.contentWindow;
        frame.style.overflow='hidden';
        /* Window document has no independent vertical scroller; only parent scrolls. */
        doc.documentElement.style.overflowY='hidden';
        doc.body.style.overflowY='visible';
        observer=new ResizeObserver(queue);
        observer.observe(doc.body);
        var main=doc.querySelector('main');if(main)observer.observe(main);
        mutation=new MutationObserver(queue);
        mutation.observe(doc.body,{childList:true,subtree:true,attributes:true,characterData:true});
        queue();
        if(doc.fonts&&doc.fonts.ready)doc.fonts.ready.then(queue).catch(function(){});
        if(win)win.addEventListener('resize',queue);
      }catch(_){ /* Retain native iframe scroll as a safe fallback. */ }
    }
    frame.addEventListener('load',setup);
    window.addEventListener('resize',queue,{passive:true});
    if(frame.contentDocument && frame.contentDocument.readyState==='complete')setup();
  }
  function init(){bindAutoHeight('menuNcc211Frame')} // PC only. Mobile menu uses independently scrollable m238MenuFrame.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

;
/* >>> Original: assets/js/core/utility-label-editor-v2197.js >>> */
/* v2197 - Robust button mounting for Editable display names for Utility hub. Route keys and permissions never change. */
(()=>{
  'use strict';
  const KEY='ktx_ui_utility_labels_v2196';
  const SELECTOR='#utilhub button[data-util-go]';
  const MAX=54;
  let labels={}, cloudOk=false, busy=false, lastFetch=0, prevSignature='';
  const base=new Map();
  const admin=()=> typeof ME!=='undefined'&&ME&&String(ME.role||'').toLowerCase()==='admin';
  const client=()=>{try{return typeof syncClient==='function'?syncClient():null}catch{return null}};
  const id=node=>node?.getAttribute('data-util-go')||'';
  function safeLabels(x){
    if(!x || typeof x!=='object'||Array.isArray(x))return {};
    const out={};
    for(const [k,v] of Object.entries(x)) if(/^[\w-]{1,60}$/.test(k)&&typeof v==='string'&&v.trim()&&v.trim().length<=MAX&&!/[<>\x00-\x1f]/.test(v))out[k]=v.trim();
    return out;
  }
  try{labels=safeLabels(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
  function cache(){try{localStorage.setItem(KEY,JSON.stringify(labels))}catch{}}
  function allCards(){return [...document.querySelectorAll(SELECTOR)];}
  function apply(){
    const hub=document.getElementById('utilhub');if(!hub)return;
    for(const card of allCards()){
      const k=id(card), el=card.querySelector('b');if(!el)continue;
      if(!base.has(k))base.set(k,el.textContent.trim());
      const next=labels[k]||base.get(k);
      if(el.textContent!==next)el.textContent=next;
    }
    if(admin())addEditButton();
    else document.getElementById('ktxRenameOpen2196')?.remove();
  }
  function addEditButton(){
    const area=document.querySelector('#utilhub .sysfunc-intro');if(!area)return;
    if(area.querySelector('#ktxRenameOpen2196'))return;
    document.querySelectorAll('#ktxRenameOpen2196').forEach(el=>el.remove());
    const btn=document.createElement('button');btn.type='button';btn.id='ktxRenameOpen2196';btn.textContent='✎ Đổi tên tiện ích';btn.addEventListener('click',openDialog);
    area.appendChild(btn);
  }
  function dialog(){
    let d=document.getElementById('ktxRenameDialog2196');if(d)return d;
    d=document.createElement('dialog');d.id='ktxRenameDialog2196';d.setAttribute('aria-labelledby','ktxRenameTitle2196');
    d.innerHTML='<div class="ktx-rename-head"><h2 id="ktxRenameTitle2196">Đổi tên nút Tiện ích</h2><button type="button" data-close aria-label="Đóng">✕</button></div><p class="ktx-rename-desc">Chỉ thay tên hiển thị. Mã chức năng, phân quyền và dữ liệu không thay đổi.</p><form id="ktxRenameForm2196"><div class="ktx-rename-fields"></div><p class="ktx-rename-status" role="status" aria-live="polite"></p><div class="ktx-rename-actions"><button type="button" data-default>Khôi phục mặc định</button><button type="button" data-cancel>Hủy</button><button type="submit" class="ktx-rename-save">Lưu tên</button></div></form>';
    document.body.append(d);
    d.querySelector('[data-close]').onclick=()=>d.close();
    d.querySelector('[data-cancel]').onclick=()=>d.close();
    d.querySelector('[data-default]').onclick=()=>{
      if(!admin())return;
      d.querySelectorAll('[data-rename-key]').forEach(inp=>inp.value=base.get(inp.dataset.renameKey)||'');
      status('Đã đặt về tên mặc định trong biểu mẫu. Nhấn Lưu để áp dụng.');
    };
    d.querySelector('form').addEventListener('submit',save);
    return d;
  }
  function status(msg,err=false){const el=document.querySelector('#ktxRenameDialog2196 .ktx-rename-status');if(el){el.textContent=msg;el.classList.toggle('error',err)}}
  function openDialog(){
    if(!admin())return;
    const d=dialog(),fields=d.querySelector('.ktx-rename-fields');fields.replaceChildren();
    for(const card of allCards()){
      const k=id(card);if(!base.has(k))base.set(k,card.querySelector('b')?.textContent?.trim()||k);
      const label=document.createElement('label');const title=document.createElement('span');title.textContent=base.get(k);
      const input=document.createElement('input');input.type='text';input.maxLength=MAX;input.dataset.renameKey=k;input.value=labels[k]||base.get(k);input.required=true;input.autocomplete='off';
      label.append(title,input);fields.append(label);
    }
    status(cloudOk?'Lưu để đồng bộ tên trên các thiết bị.':'Cần tạo bảng Supabase theo file SQL để đồng bộ giữa các thiết bị.');
    if(!d.open)d.showModal();
  }
  async function save(e){
    e.preventDefault();if(!admin())return status('Chỉ tài khoản Quản trị được phép đổi tên.',true);
    const d=dialog(),next={};
    for(const input of d.querySelectorAll('[data-rename-key]')){
      const v=input.value.trim().replace(/\s+/g,' '),k=input.dataset.renameKey;
      if(!v||v.length>MAX||/[<>\x00-\x1f]/.test(v))return status('Tên không hợp lệ hoặc vượt 54 ký tự.',true);
      if(v!==base.get(k))next[k]=v;
    }
    const btn=d.querySelector('.ktx-rename-save');btn.disabled=true;status('Đang lưu lên Supabase…');
    try{
      const sb=client();if(!sb)throw Error('Chưa có kết nối Supabase.');
      const r=await sb.from('ktx_ui_labels').upsert({id:1,labels:next,updated_at:new Date().toISOString()},{onConflict:'id'});
      if(r.error)throw r.error;
      labels=next;cloudOk=true;cache();apply();d.close();
    }catch(err){status('Chưa lưu: '+(err.message||err)+' . Cần chạy SQL thiết lập và đăng nhập bằng tài khoản Quản trị.',true)}
    finally{btn.disabled=false}
  }
  async function fetchCloud(force=false){
    if(busy||!client()||(!force&&Date.now()-lastFetch<30000))return;
    busy=true;lastFetch=Date.now();
    try{const r=await client().from('ktx_ui_labels').select('labels').eq('id',1).maybeSingle();
      if(r.error)throw r.error;
      labels=safeLabels(r.data?.labels||{});cloudOk=true;cache();apply();
    }catch{cloudOk=false;}finally{busy=false}
  }
  window.KTXOpenUtilityRename=function(){if(!admin())return;apply();openDialog();};
  function init(){
    const obs=new MutationObserver(()=>{
      const cards=allCards();const sig=cards.map(c=>id(c)+':'+(c.querySelector('b')?.textContent||'')).join('|');
      if(sig===prevSignature && (!admin() || document.getElementById('ktxRenameOpen2196')))return;
      prevSignature=sig;apply();
    });
    const hub=document.getElementById('utilhub')||document.querySelector('main');if(hub)obs.observe(hub,{subtree:true,childList:true,characterData:true});
    apply();fetchCloud();
    document.addEventListener('click',ev=>{if(ev.target.closest('[data-p="utilhub"],#utilityNavGroup>.gh')){setTimeout(()=>{apply();fetchCloud(true)},80)}},true);
    window.addEventListener('focus',()=>fetchCloud());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)fetchCloud()});
    setInterval(()=>fetchCloud(),60000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

;
/* >>> Original: assets/js/core/ktx-config-hub-v2199.js >>> */
/* v2199 - Relocate consolidated configuration to System Functions; v2198 - Single access point for Branding, System Settings and Utility Labels.
   Preserves existing editors, Cloud writes and permissions. */
(()=>{
 'use strict';
 const ID='ktxConfigHub2198';
 const admin=()=>{try{return typeof ME!=='undefined'&&ME&&String(ME.role).toLowerCase()==='admin'}catch{return false}};
 const hub=()=>document.getElementById('sysfunc');
 const escaped=(s)=>String(s||'');
 let current='brand', isOpen=false, queued=false;
 const sections={
  brand:{title:'Cấu hình thương hiệu',hint:'Tên ứng dụng, logo, ảnh nền và hình ảnh thương hiệu.',cta:'Mở cấu hình thương hiệu'},
  settings:{title:'Cài đặt hệ thống',hint:'Tên KTX, sức chứa và các thông số quản lý.',cta:'Mở cài đặt hệ thống'},
  labels:{title:'Đổi tên tiện ích',hint:'Đổi tên hiển thị các nút; không thay đổi chức năng.',cta:'Mở danh sách đổi tên'}
 };
 function mount(){
  const root=hub();if(!root)return;
  const grid=root.querySelector('.sysfunc-group .sysfunc-grid');
  if(!grid)return;
  let entry=root.querySelector('#ktxConfigOpen2198');
  if(!entry){
   entry=document.createElement('button');entry.id='ktxConfigOpen2198';entry.type='button';entry.className='sysfunc-btn sf-purple';
   entry.innerHTML='<span class="sficon" aria-hidden="true">⚙</span><span><b>Cấu hình hệ thống</b><small>Thương hiệu · Cài đặt · Đổi tên tiện ích</small></span>';
   entry.addEventListener('click',()=>show(true));grid.prepend(entry);
  }
  // The backup utility gets its own system shortcut; do not change its route.
  let backup=root.querySelector('#ktxSystemUtilityBackup2199');
  if(!backup){
    backup=document.createElement('button');backup.id='ktxSystemUtilityBackup2199';backup.type='button';backup.className='sysfunc-btn sf-green';
    backup.innerHTML='<span class="sficon" aria-hidden="true">▤</span><span><b>Kiểm tra & sao lưu tiện ích</b><small>Kiểm tra và sao lưu dữ liệu tiện ích.</small></span>';
    backup.addEventListener('click',()=>{if(typeof window.go==='function')window.go('u169_backup')});
    grid.append(backup);
  }
  let panel=root.querySelector('#'+ID);
  if(!panel){
   panel=document.createElement('section');panel.id=ID;panel.className='ktx-config2198';panel.hidden=!isOpen;
   panel.innerHTML=`<div class="ktx-config2198-heading"><div><span class="ktx-config2198-eyebrow">QUẢN LÝ CẤU HÌNH</span><h2>Cấu hình hệ thống</h2><p>Một nơi quản lý thương hiệu, thông số KTX và tên các tiện ích.</p></div><button type="button" data-ktx-config-back>← Quay lại Chức năng hệ thống</button></div>
   <div class="ktx-config2198-tabs" role="tablist" aria-label="Nhóm cấu hình">
     <button type="button" role="tab" data-config-tab="brand">Thương hiệu</button>
     <button type="button" role="tab" data-config-tab="settings">Cài đặt hệ thống</button>
     <button type="button" role="tab" data-config-tab="labels">Đổi tên tiện ích</button>
   </div>
   <div class="ktx-config2198-body" role="tabpanel"><h3 data-config-title></h3><p data-config-desc></p><p class="ktx-config2198-role" data-config-role></p><button type="button" class="ktx-config2198-action" data-config-launch></button><p class="ktx-config2198-message" role="status" aria-live="polite" data-config-message></p></div>`;
   root.append(panel);
   panel.querySelector('[data-ktx-config-back]').addEventListener('click',()=>show(false));
   panel.querySelectorAll('[data-config-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.configTab)));
   panel.querySelector('[data-config-launch]').addEventListener('click',launch);
  }
  // Hide legacy access buttons only in this consolidated view (do not delete their handlers).
  document.querySelector('#utilhub #ktxRenameOpen2196')?.classList.add('ktx-config2198-legacy');
  // Brand and settings are in the System Functions hub, not necessarily this hub.
  document.querySelectorAll('#sysfunc #ktxBrandAdminButton, #sysfunc #ktx159SettingsMenu').forEach(btn=>btn.classList.add('ktx-config2198-legacy'));
  if(isOpen){setPanel(root,true);selectTab(current)}
 }
 function setPanel(root,on){
  const panel=root.querySelector('#'+ID);if(panel)panel.hidden=!on;
  for(const child of [...root.children]){
   if(child===panel)continue;
   child.classList.toggle('ktx-config2198-hide-when-open',on);
  }
 }
 function show(open){
  isOpen=open;const root=hub();if(!root)return;
  mount();setPanel(root,open);if(open)selectTab(current);
 }
 function selectTab(tab){
  if(!(tab in sections))return;
  current=tab;
  const panel=hub()?.querySelector('#'+ID);if(!panel)return;
  const item=sections[tab],isAdmin=admin();
  if(panel.querySelector('[data-config-title]').textContent!==item.title)panel.querySelector('[data-config-title]').textContent=item.title;
  if(panel.querySelector('[data-config-desc]').textContent!==item.hint)panel.querySelector('[data-config-desc]').textContent=item.hint;
  panel.querySelectorAll('[data-config-tab]').forEach(b=>{const on=b.dataset.configTab===tab;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
  const roleLabel=tab==='brand'?'Chức năng thương hiệu dùng quyền truy cập hiện hành.':'Chỉ tài khoản Quản trị được thay đổi cấu hình này.';if(panel.querySelector('[data-config-role]').textContent!==roleLabel)panel.querySelector('[data-config-role]').textContent=roleLabel;
  const btn=panel.querySelector('[data-config-launch]');if(btn.textContent!==item.cta)btn.textContent=item.cta;btn.disabled=(tab!=='brand'&&!isAdmin);
  if(panel.querySelector('[data-config-message]').textContent)panel.querySelector('[data-config-message]').textContent='';
 }
 function message(txt){const node=hub()?.querySelector('[data-config-message]');if(node)node.textContent=txt}
 function launch(){
  if(current!=='brand'&&!admin()){message('Cần đăng nhập tài khoản Quản trị.');return}
  if(current==='brand'){
   if(window.KTXBrand&&typeof window.KTXBrand.open==='function'){window.KTXBrand.open();return}
   const b=document.getElementById('ktxBrandAdminButton');if(b){b.click();return}
   message('Không tìm thấy trình chỉnh thương hiệu trong phiên này.');return;
  }
  if(current==='settings'){
   if(typeof window.KTXOpenSystemSettings==='function'){window.KTXOpenSystemSettings();return}
   const btn=document.getElementById('ktx159SettingsMenu');
   if(btn){btn.click();return}
   message('Bộ cài đặt hệ thống chưa khởi tạo. Hãy thử mở lại trang Chức năng hệ thống.');return;
  }
  if(current==='labels'){
   if(typeof window.KTXOpenUtilityRename==='function'){window.KTXOpenUtilityRename();return}
   let btn=document.getElementById('ktxRenameOpen2196');
   if(btn){btn.click();return}
   message('Bộ đổi tên tiện ích chưa sẵn sàng. Kiểm tra file JS v2197 đã nạp.');
  }
 }
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount()})}
 function init(){
  mount();
  const root=hub()||document.querySelector('main');
  // Stage 98: avoid observing all table/UI mutations; nav click already schedules mount.
  document.addEventListener('click',e=>{if(e.target.closest('[data-p="sysfunc"],#sysfunc'))setTimeout(mount,50)},true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

;
/* >>> Original: assets/js/core/ktx-vendor-directions-v2204.js >>> */
/* v2204 | Danh bạ địa chỉ nhà cung cấp + dẫn đường | chỉ thêm chức năng, không chỉnh các mục khác */
(()=>{
'use strict';
const TABLE='ktx_vendor_directions';
const MAX_NAME=120,MAX_ADDRESS=450;
let items=[],loading=false,loaded=false,dialog=null,vendorNames=[];
const $=(sel,root=document)=>root.querySelector(sel);
const admin=()=>{try{return typeof ME!=='undefined'&&ME&&String(ME.role||'').toLowerCase()==='admin'}catch{return false}};
const client=()=>{try{return typeof syncClient==='function'?syncClient():null}catch{return null}};
const trim=s=>String(s??'').trim();
const normalize=s=>trim(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').replace(/\s+/g,' ').toLowerCase();
const catalog=()=>window.KTX_VENDOR_CATALOG;
function namesFromMeal(){
  try{return (catalog()?.activeNames?.()||[]).map(trim).filter(Boolean)}catch{return []}
}
async function refreshCatalog(){
  try{if(catalog()?.load)await catalog().load(true)}catch(e){console.warn('Không tải được danh mục NCC suất ăn:',e)}
  vendorNames=[...new Map(namesFromMeal().map(n=>[normalize(n),n])).values()].sort((a,b)=>a.localeCompare(b,'vi'));
}
function rowFor(name){return items.find(v=>normalize(v.vendor_name)===normalize(name))}

const validMapsLink=s=>{
  if(!s)return true;
  try{const url=new URL(s);return url.protocol==='https:'&&(
    url.hostname==='maps.google.com'||url.hostname==='www.google.com'||url.hostname==='google.com'||url.hostname==='maps.app.goo.gl'||url.hostname==='goo.gl'||url.hostname.endsWith('.google.com')
  )&&(url.hostname!=='goo.gl'||url.pathname.startsWith('/maps'))}catch{return false}
};
/* Prefer the exact Google Maps place saved by Admin. An address string can
 * geocode to a different location, especially in rural/renamed streets. */
function mapsDirections(address){
  return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(address)+'&travelmode=driving';
}
function directionsFromSavedMap(mapsUrl,address){
  const raw=trim(mapsUrl);
  if(!raw)return mapsDirections(address);
  if(!validMapsLink(raw))return mapsDirections(address);
  try{
    const u=new URL(raw);
    const path=decodeURIComponent(u.pathname);
    const q=u.searchParams;
    // Preserve exact Google Maps direction links when already supplied.
    if(/\/maps\/dir\//.test(path)||/\/dir\//.test(path))return u.href;
    // Google Maps uses !3dLAT!4dLNG for a place's actual pinned position.
    const embedded=u.href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if(embedded)return mapsDirections(embedded[1]+','+embedded[2]);
    // Coordinates supplied explicitly as a query or place target are reliable.
    const target=q.get('query')||q.get('q')||q.get('destination')||q.get('daddr')||'';
    if(target)return mapsDirections(target);
    const coord=path.match(/\/place\/([^/]+)\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if(coord)return mapsDirections(coord[2]+','+coord[3]);
    // Short Maps links cannot be expanded reliably in a browser without
    // an external redirect/resolver. Open the exact saved pin instead of
    // generating an incorrect route from the plain-text address.
    return u.href;
  }catch(_){return raw}
}
function make(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function tile(){
 const hub=document.getElementById('utilhub');const grid=hub?.querySelector('.sysfunc-grid');if(!grid||$('#ktxVendorDirections2202',grid))return;
 const b=make('button','sysfunc-btn sf-green');b.id='ktxVendorDirections2202';b.type='button';b.setAttribute('aria-label','Địa chỉ nhà cung cấp và dẫn đường');
 const ic=make('span','sficon');ic.textContent='⌖';ic.setAttribute('aria-hidden','true');
 const t=make('span');t.append(make('b','', 'Địa chỉ nhà cung cấp'),make('small','', 'Chọn nhà cung cấp và mở Google Maps dẫn đường'));
 b.append(ic,t);b.addEventListener('click',open);grid.append(b);
}
function makeDialog(){
 if(dialog)return dialog;
 dialog=make('dialog','ktx-vendor-dialog');dialog.id='ktxVendorDialog2202';
 dialog.innerHTML=`<div class="ktx-vendor-head"><div><h2>Địa chỉ nhà cung cấp</h2><p>Chọn nhà cung cấp để mở chỉ đường Google Maps</p></div><button type="button" data-close aria-label="Đóng">✕</button></div>
 <div class="ktx-vendor-content"><div class="ktx-vendor-select-row"><label>Nhà cung cấp<select id="ktxVendorSelect2202"><option value="">— Chọn nhà cung cấp —</option></select></label><button type="button" class="ktx-vendor-route" id="ktxVendorRoute2202" disabled>Dẫn đường</button></div><div id="ktxVendorDetail2202" class="ktx-vendor-detail"></div>
 <div class="ktx-vendor-admin" id="ktxVendorAdmin2202" hidden><h3>Quản lý địa chỉ (Admin)</h3><form id="ktxVendorForm2202"><input type="hidden" name="record_id"><label>Nhà cung cấp trong Báo cáo suất ăn <select name="vendor_name" required><option value="">— Chọn nhà cung cấp —</option></select></label><label>Địa chỉ điểm đến <textarea name="address" maxlength="450" required rows="2" placeholder="Số nhà, đường, phường, tỉnh/thành... hoặc tọa độ GPS"></textarea></label><label>Link Google Maps (không bắt buộc) <input name="maps_url" type="url" placeholder="https://maps.google.com/..."></label><div class="ktx-vendor-actions"><button type="button" data-new>Thêm mới</button><button type="submit" class="ktx-vendor-save">Lưu NCC</button><button type="button" class="ktx-vendor-delete" data-delete disabled>Xóa</button></div></form><div id="ktxVendorManage2202"></div></div><p id="ktxVendorMessage2202" class="ktx-vendor-message" role="status" aria-live="polite"></p></div>`;
 document.body.append(dialog);
 $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
 $('#ktxVendorSelect2202',dialog).addEventListener('change',updateSelection);
 $('#ktxVendorRoute2202',dialog).addEventListener('click',route);
 $('[data-new]',dialog).addEventListener('click',()=>fillForm(null));
 $('[data-delete]',dialog).addEventListener('click',removeVendor);
 $('#ktxVendorForm2202',dialog).addEventListener('submit',saveVendor);
 dialog.addEventListener('close',()=>msg(''));
 return dialog;
}
function msg(s,isError=false){const el=$('#ktxVendorMessage2202');if(el){el.textContent=s;el.classList.toggle('error',isError)}}
function render(){
 const d=makeDialog(),select=$('#ktxVendorSelect2202',d),was=select.value;select.replaceChildren(new Option('— Chọn nhà cung cấp —',''));
 vendorNames.forEach(name=>select.add(new Option(name,name)));
 if(vendorNames.includes(was))select.value=was;
 const fselect=$('#ktxVendorForm2202',d).elements.vendor_name;
 const oldName=fselect.value;fselect.replaceChildren(new Option('— Chọn nhà cung cấp —',''));
 vendorNames.forEach(name=>fselect.add(new Option(name,name)));
 if(vendorNames.includes(oldName))fselect.value=oldName;

 const area=$('#ktxVendorManage2202',d);area.replaceChildren();
 if(admin())for(const x of items.filter(x=>vendorNames.some(n=>normalize(n)===normalize(x.vendor_name)))){const b=make('button','ktx-vendor-manage-item',x.vendor_name+' · '+x.address);b.type='button';b.addEventListener('click',()=>fillForm(x));area.append(b)}
 $('#ktxVendorAdmin2202',d).hidden=!admin();updateSelection();
}
function updateSelection(){
 const d=makeDialog(),id=$('#ktxVendorSelect2202',d).value,x=rowFor(id),info=$('#ktxVendorDetail2202',d);info.replaceChildren();
 $('#ktxVendorRoute2202',d).disabled=!x?.address&&!x?.maps_url;
 if(!id){info.textContent=vendorNames.length?'Chưa chọn nhà cung cấp.':'Chưa có danh mục nhà cung cấp. Vui lòng kiểm tra Báo cáo suất ăn.';return}
 if(!x){info.textContent='Nhà cung cấp này chưa được Admin lưu địa chỉ điểm đến.';return}
 info.append(make('strong','',x.vendor_name),make('p','',x.address));
 if(x.maps_url){const a=make('a','','Xem địa điểm trên Google Maps');a.href=x.maps_url;a.target='_blank';a.rel='noopener noreferrer';info.append(a)}
}
function route(){
 const x=rowFor($('#ktxVendorSelect2202').value);
 if(!x?.address&&!x?.maps_url)return msg('Hãy chọn nhà cung cấp có địa chỉ.',true);
 const destination=directionsFromSavedMap(x.maps_url,x.address);
 // Use the original Maps URL when a shortened link has no extractable pin.
 // The destination stays exact; press Directions inside Google Maps if needed.
 window.open(destination,'_blank','noopener,noreferrer');
}
function fillForm(x){if(!admin())return;const form=$('#ktxVendorForm2202');form.elements.record_id.value=x?.id||'';form.elements.vendor_name.value=vendorNames.find(n=>normalize(n)===normalize(x?.vendor_name))||'';form.elements.address.value=x?.address||'';form.elements.maps_url.value=x?.maps_url||'';form.querySelector('[data-delete]').disabled=!x;form.elements.vendor_name.focus()}
async function load(){const sb=client();if(!sb){msg('Chưa kết nối Supabase. Vui lòng kiểm tra kết nối.',true);return}if(loading)return;loading=true;msg('Đang tải danh sách nhà cung cấp…');
 try{const {data,error}=await sb.from(TABLE).select('id,vendor_name,address,maps_url').order('vendor_name',{ascending:true});if(error)throw error;items=(data||[]).map(x=>({...x,id:String(x.id)}));loaded=true;render();msg(items.length?'':'Chưa có nhà cung cấp. Admin cần thêm địa chỉ.')}
 catch(e){msg('Không đọc được danh sách: '+(e.message||e)+'. Kiểm tra đã chạy SQL thiết lập.',true)}finally{loading=false}}
async function saveVendor(ev){ev.preventDefault();if(!admin())return msg('Chỉ Admin được cập nhật.',true);const sb=client();if(!sb)return msg('Chưa kết nối Supabase.',true);
 const f=ev.currentTarget,name=trim(f.elements.vendor_name.value),address=trim(f.elements.address.value),maps_url=trim(f.elements.maps_url.value),id=trim(f.elements.record_id.value);
 if(!vendorNames.some(n=>normalize(n)===normalize(name)))return msg('Hãy chọn nhà cung cấp trong Báo cáo suất ăn.',true);
 if(!name||name.length>MAX_NAME||!address||address.length>MAX_ADDRESS)return msg('Tên hoặc địa chỉ không hợp lệ.',true);
 if(!validMapsLink(maps_url))return msg('Chỉ cho phép liên kết Google Maps HTTPS hợp lệ.',true);
 const btn=f.querySelector('[type=submit]');btn.disabled=true;msg('Đang lưu địa chỉ…');
 try{const row={vendor_name:name,address,maps_url:maps_url||null};let res;const prior=rowFor(name);if(id)res=await sb.from(TABLE).update(row).eq('id',id).select('id').single();else if(prior)res=await sb.from(TABLE).update(row).eq('id',prior.id).select('id').single();else res=await sb.from(TABLE).insert(row).select('id').single();if(res.error)throw res.error;await load();if(res.data?.id)$('#ktxVendorSelect2202').value=name;updateSelection();fillForm(null);msg('Đã lưu địa chỉ nhà cung cấp.')}
 catch(e){msg('Không lưu được: '+(e.message||e),true)}finally{btn.disabled=false}}
async function removeVendor(){if(!admin())return;const id=$('#ktxVendorForm2202').elements.record_id.value,x=items.find(v=>v.id===id);if(!x)return;
 if(!confirm('Xóa địa chỉ nhà cung cấp "'+x.vendor_name+'"?'))return;const sb=client();if(!sb)return msg('Chưa kết nối Supabase.',true);
 const r=await sb.from(TABLE).delete().eq('id',id);if(r.error)return msg('Không xóa được: '+r.error.message,true);fillForm(null);await load();msg('Đã xóa địa chỉ.');}
async function open(){
 const d=makeDialog();if(!d.open)d.showModal();
 msg('Đang lấy nhà cung cấp từ Báo cáo suất ăn…');
 await refreshCatalog();render();await load();
}
function mobileEntry(){
 const root=document.getElementById('mobile180');if(!root)return;
 const actions=root.querySelector('.m131-actions .mactions');
 if(!actions)return;
 // Thay đúng nút đầu tiên trong Truy cập nhanh, không thay đổi thanh Công nhân bên dưới.
 const workerLink=actions.querySelector('button[data-mobile="list"]');
 const vendorLinks=[...actions.querySelectorAll('button[data-ktx-vendor-mobile]')];
 if(!workerLink){
   // Đã thay rồi: chỉ dọn các nút NCC trùng nếu có.
   vendorLinks.slice(1).forEach(button=>button.remove());
   return;
 }
 const b=vendorLinks.shift()||make('button','maction green');
 b.className='maction green';b.type='button';b.dataset.ktxVendorMobile='1';
 // Dùng icon vị trí có sẵn trong sprite chung, giống các nút Truy cập nhanh.
 b.replaceChildren();
 const wrap=make('i');wrap.setAttribute('aria-hidden','true');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','mi');
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-pin');
 svg.append(use);wrap.append(svg);
 b.append(wrap,document.createTextNode('Địa chỉ nhà cung cấp →'));
 b.setAttribute('aria-label','Địa chỉ nhà cung cấp và dẫn đường');
 // Nút có sẵn được chuyển vị trí giữ nguyên listener; nút tạo mới chỉ gắn một lần.
 if(!b.dataset.ktxVendorReady){b.addEventListener('click',open);b.dataset.ktxVendorReady='1'}
 workerLink.replaceWith(b);
 vendorLinks.forEach(button=>button.remove());
}

function init(){
 const hub=document.getElementById('utilhub');if(hub){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;tile()})}).observe(hub,{childList:true,subtree:true});tile()}
 document.addEventListener('click',e=>{if(e.target.closest('[data-p="utilhub"],#utilityNavGroup>.gh'))setTimeout(tile,100)},true);
 const mobile=document.getElementById('mobile180');
 if(mobile){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mobileEntry()})}).observe(mobile,{childList:true,subtree:true});mobileEntry()}

}
// Nút tiện ích PC được dựng từ script-48.js và gọi API công khai này.
// Mobile vẫn sử dụng listener riêng, không thay đổi hành vi.
window.KTXVendorDirectionsOpen=open;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

;
/* >>> Original: assets/js/core/ktx-gender-unified-v2211.js >>> */
/* v2211 — normalize gender glyphs in dynamically rendered PC/mobile UI.
   No modification of data, form values or business logic. */
(function(){
  'use strict';
  if(window.__ktx2211GenderUnified)return;
  window.__ktx2211GenderUnified=true;
  const glyph={ '♂':'male','♀':'female','⚥':'mix' };
  const icons={male:'♂',female:'♀',mix:'⚥'};
  const skip='script,style,noscript,input,textarea,select,option,svg,canvas,code,pre,[contenteditable],.ktx2211-symbol,.ktx2190-gender-symbol,.heat2189-gender-icon,.mobile2191-icon,.mobile2191-symbol';
  const allowed=(e)=>e&&e.nodeType===1&&!e.closest(skip);
  function makeIcon(g){const el=document.createElement('span');el.className='ktx2211-symbol ktx2190-gender-symbol';el.dataset.ktxGender=g;el.textContent=icons[g];el.setAttribute('aria-hidden','true');return el;}
  function textNode(n){
    if(n.nodeType!==3||!n.nodeValue||!/[♂♀⚥]/.test(n.nodeValue)||!allowed(n.parentElement))return;
    const fr=document.createDocumentFragment();
    const chunks=n.nodeValue.split(/([♂♀⚥])/);
    for(const c of chunks){if(glyph[c])fr.append(makeIcon(glyph[c]));else if(c)fr.append(document.createTextNode(c));}
    n.replaceWith(fr);
  }
  function ensureIcon(el,type){
    if(!type||!icons[type]||!el)return;
    if(/[♂♀⚥]/.test(el.textContent)||el.querySelector('.ktx2211-symbol,.ktx2190-gender-symbol,.mobile2191-icon,.heat2189-gender-icon'))return;
    const icon=makeIcon(type);
    if(el.classList.contains('step230-room')){
      const head=el.querySelector('.mobile2191-head')||el.querySelector('b')?.parentElement||el;
      head.append(icon);
    }else el.prepend(icon);
  }
  function scan(root){
    if(!root)return;
    if(root.nodeType===3){textNode(root);return;}
    if(root.nodeType!==1||root.matches(skip)||root.closest(skip))return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(textNode);
    const scope=root.querySelectorAll.bind(root);
    const controls=root.matches('button[data-hv],button.step230-room')?[root,...scope('button[data-hv],button.step230-room')]:scope('button[data-hv],button.step230-room');
    for(const el of controls){
      const type=el.matches('button[data-hv]')?el.dataset.hv:el.dataset.roomGender;
      if(['male','female','mix'].includes(type))ensureIcon(el,type);
    }
  }
  const q=new Set();let frame=false;
  function schedule(root){q.add(root);if(frame)return;frame=true;requestAnimationFrame(()=>{frame=false;const arr=[...q];q.clear();for(const item of arr){if(item.isConnected)scan(item);}});}
  function watch(doc){
    if(!doc.body||doc.__ktx2211Watch)return;
    doc.__ktx2211Watch=true;
    scan(doc.body);
    const obs=new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==='characterData')schedule(m.target);
        else for(const n of m.addedNodes){if(n.nodeType===1||n.nodeType===3)schedule(n);}
      }
    });
    obs.observe(doc.body,{childList:true,subtree:true,characterData:true});
  }
  function init(){watch(document);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

;
/* >>> Original: assets/js/core/ktx-transfer-room-gender-v2214.js >>> */
/* v2214 - Add room-type symbols from existing roomMode/candidate data;
   preserve room selection, eligibility and transfer handlers. */
(function () {
  'use strict';
  function annotate() {
    const dlg = document.getElementById('transferDlg');
    if (!dlg) return;
    const grid = dlg.querySelector('#trRoomGrid');
    const k = dlg.querySelector('#trKtx')?.value;
    const d = dlg.querySelector('#trDay')?.value;
    if (!grid || !k || !d || typeof transferRoomCandidates !== 'function') return;
    let candidates;
    try { candidates = transferRoomCandidates(k,d,typeof TRANSFER_W==='undefined'?null:TRANSFER_W); }
    catch (_) { return; }
    const modes = new Map(candidates.map(room=>[String(room.r), room.mode]));
    for (const card of grid.querySelectorAll('button.transfer-room-card[data-tr-room]')) {
      const mode=modes.get(String(card.dataset.trRoom));
      if (!mode) continue;
      const glyph=mode==='female'?'♀':mode==='mix'?'⚥':'♂';
      const label=mode==='female'?'Phòng Nữ':mode==='mix'?'Phòng Hỗn hợp':'Phòng Nam';
      let title=card.querySelector(':scope > .tr2214-title');
      if (!title) {
        const strong=card.querySelector(':scope > strong');
        if (!strong) continue;
        title=document.createElement('div');
        title.className='tr2214-title';
        strong.replaceWith(title);
        title.append(strong);
      }
      let icon=title.querySelector('.tr2214-gender');
      if (!icon) {
        icon=document.createElement('span');
        icon.className='tr2214-gender';
        icon.setAttribute('aria-hidden','true');
        title.append(icon);
      }
      icon.className='tr2214-gender '+(mode==='female'?'female':mode==='mix'?'mix':'male');
      icon.textContent=glyph;
      card.setAttribute('aria-label', `${card.dataset.trRoom ? 'Phòng '+card.dataset.trRoom : 'Phòng'} · ${label}`);
    }
  }
  function install() {
    if (typeof window.renderTransferRooms === 'function' && !window.renderTransferRooms.__tr2214) {
      const original=window.renderTransferRooms;
      function patched() {const result=original.apply(this,arguments);annotate();return result;}
      patched.__tr2214=true;
      window.renderTransferRooms=patched;
    }
    annotate();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  /* Transfer dialog is rebuilt dynamically; watcher only touches target grid. */
  const initWatcher=()=>{
    const dlg=document.getElementById('transferDlg');
    const grid=dlg?.querySelector('#trRoomGrid');
    if (!grid) return;
    const obs=new MutationObserver(()=>{
      if (!grid.querySelector('button.transfer-room-card:not(:has(.tr2214-title))')) return;
      annotate();
    });
    obs.observe(grid,{childList:true});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initWatcher,{once:true});
  else initWatcher();
})();

;
/* >>> Original: assets/js/core/ktx-assignment-display-v2215.js (verified-assignment fix) >>> */
/* Display day responsibility from the authenticated server directory, not one cached account. */
(function(){
'use strict';
const norm=v=>String(v??'').normalize('NFC').trim().toLocaleLowerCase('vi').replace(/\s+/g,' ');
const list=v=>Array.isArray(v)?v:typeof v==='string'?v.split(/[,;]/).map(s=>s.trim()).filter(Boolean):[];
const num=v=>{const m=norm(v).match(/(?:^|\D)([1-6])(?:$|\D)/);return m?Number(m[1]):NaN};
const siteNum=v=>{const m=norm(v).match(/(?:ktx|ký túc xá|ky tuc xa)?\s*([12])(?:$|\D)/);return m?Number(m[1]):NaN};
const dayNum=v=>num(v);
let directory=null,loading=false,loadedUserId='',lastFetch=0,scheduled=false;
function scope(a){return {sites:new Set(list(a.ktx).map(siteNum).filter(Number.isFinite)),days:new Set(list(a.days).map(dayNum).filter(Number.isFinite))}}
function isDirect(a){
 if(!a||a.enabled===false||['viewer','vault_only','admin'].includes(norm(a.role)))return false;
 const {sites,days}=scope(a);
 if(!sites.size||!days.size)return false;
 // Accounts assigned to every KTX and Day are management-wide, not direct day owners.
 if(sites.has(1)&&sites.has(2)&&[1,2,3,4,5,6].every(n=>days.has(n)))return false;
 return true;
}
function namesFor(k,d){
 if(!Array.isArray(directory))return null; // loading / unavailable: not the same as unassigned.
 const sk=siteNum(k),sd=dayNum(d);
 if(!Number.isFinite(sk)||!Number.isFinite(sd))return null;
 return [...new Set(directory.filter(a=>isDirect(a)&&(()=>{const x=scope(a);return x.sites.has(sk)&&x.days.has(sd)})())
   .map(a=>String(a.display_name||a.name||'').trim()).filter(Boolean))];
}
function render(){
 document.querySelectorAll('#home .ktx-day-owner[data-owner-ktx][data-owner-day]').forEach(el=>{
   const result=namesFor(el.dataset.ownerKtx,el.dataset.ownerDay),target=el.querySelector('.ktx-owner-name');
   if(!target||result===null)return;
   const text=result.join(', ')||'Chưa phân công';
   if(target.textContent!==text)target.textContent=text;
   el.classList.toggle('unassigned',!result.length);
 });
 document.querySelectorAll('#mobile180 .step230-day-card').forEach(card=>{
   const button=card.querySelector('[data-day-ktx][data-day-name]');if(!button)return;
   const result=namesFor(button.dataset.dayKtx,button.dataset.dayName);if(result===null)return;
   let label=card.querySelector('.ktx2215-day-owner');
   if(!label){
     const head=card.querySelector('.step230-day-top');if(!head)return;
     label=document.createElement('div');label.className='ktx2215-day-owner';
     label.style.cssText='font-size:11px;line-height:1.4;color:#45617f;margin:3px 0 7px';
     head.insertAdjacentElement('afterend',label);
   }
   const text='Phụ trách: '+(result.join(', ')||'Chưa phân công');
   if(label.textContent!==text)label.textContent=text;
 });
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render()})}
async function load(force=false){
 if(loading||(!force&&Date.now()-lastFetch<8000))return;
 const sb=typeof syncClient==='function'?syncClient():null;
 if(!sb?.auth?.getUser||!sb?.rpc)return;
 loading=true;lastFetch=Date.now();
 try{
   const {data:auth,error:authError}=await sb.auth.getUser();
   const uid=String(auth?.user?.id||'');
   if(authError||!uid){directory=null;loadedUserId='';return}
   if(uid!==loadedUserId){directory=null;loadedUserId=uid}
   const {data,error}=await sb.rpc('ktx_staff_directory_v320');
   if(error||!Array.isArray(data)){console.warn('[KTX Day Owners] Chưa tải được danh bạ nội bộ:',error?.message||'Không có dữ liệu');return}
   // Never show "Chưa phân công" from a partial result or when the account lookup has not succeeded.
   directory=data.map(a=>({display_name:a.display_name||a.name||'',role:a.role||'',enabled:a.enabled!==false,ktx:a.ktx,days:a.days}));
   schedule();
 }catch(e){console.warn('[KTX Day Owners] Lỗi tải phân công:',e)}finally{loading=false}
}
function init(){
 const observer=new MutationObserver(schedule);
 for(const el of [document.getElementById('home'),document.getElementById('mobile180')])if(el)observer.observe(el,{childList:true,subtree:true});
 // Do not self-observe text changes: the observer tracks only DOM node additions/removals.
 load(true);
 window.addEventListener('ktx:mobile-screen',()=>{schedule();load()});
 window.addEventListener('focus',()=>load());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
 document.addEventListener('click',e=>{if(e.target.closest('nav button,[data-mobile]')){schedule();load()}},true);
 window.addEventListener('ktx-global-settings-changed',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
