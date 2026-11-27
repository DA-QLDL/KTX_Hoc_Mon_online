/* KTX V2.0.17 Cloud Vault: Supabase-backed folders, ACL and private PDF/image previews.
 * Never uses IndexedDB/localStorage for document bytes.
 * The logged-in session is supplied by the parent KTX app (same origin only).
 */
(()=>{'use strict';
const BUCKET='ktx-documents', TABLE='ktx_document_items', ACL='ktx_document_permissions';
const $=s=>document.querySelector(s);
let sb=null, session=null, permissions=null, folders=[], docs=[], current='', busy=false;
let renderLimit=120, loadGeneration=0, vaultLoading=false;
let folderIndex=new Map(), childFolderIndex=new Map(), docIndex=new Map();
function rebuildVaultIndex(){
 folderIndex=new Map(folders.map(f=>[f.id,f]));childFolderIndex=new Map();docIndex=new Map();
 for(const f of folders){const key=f.fid||'';if(!childFolderIndex.has(key))childFolderIndex.set(key,[]);childFolderIndex.get(key).push(f)}
 for(const d of docs){const key=d.fid||'';if(!docIndex.has(key))docIndex.set(key,[]);docIndex.get(key).push(d)}
}

const VIEW_KEY='ktx-vault-view-mode-v219';
// Stage 18: folder navigation participates in browser/Android Back history.
// This is presentation-only state; no file or permission data is changed.
const VAULT_NAV_KEY='__ktxVaultFolder18';
let vaultHistoryReady=false;
function initVaultHistory(){
 if(vaultHistoryReady)return;vaultHistoryReady=true;
 const state=history.state||{};
 if(state[VAULT_NAV_KEY]===true){current=String(state.folderId||'');return;}
 try{history.replaceState({...state,[VAULT_NAV_KEY]:true,folderId:''},'',location.href)}catch(_){}
}
function navigateFolder(id,replace=false){
 const next=String(id||'');
 if(next===current)return;
 initVaultHistory();
 current=next;
 renderLimit=120;
 try{
  const state={...(history.state||{}),[VAULT_NAV_KEY]:true,folderId:next};
  if(replace)history.replaceState(state,'',location.href);else history.pushState(state,'',location.href);
 }catch(_){}
 renderAll();
}
window.addEventListener('popstate',event=>{
 const state=event.state;
 if(!state||state[VAULT_NAV_KEY]!==true)return;
 const target=String(state.folderId||'');
 current=target&&!getFolder(target)?'':target;
 renderLimit=120;
 renderAll();
});

let viewMode='grid';try{const remembered=localStorage.getItem(VIEW_KEY);viewMode=remembered==='list'||remembered==='grid'?remembered:'list'}catch(_){viewMode='grid'}
const text=(el,val)=>{if(el)el.textContent=String(val??'');};
const warn=msg=>{text($('#vaultMessage'),msg);};
const uid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():('v217_'+Date.now().toString(36)+Math.random().toString(36).slice(2));
const api=async(request)=>{const {data,error}=await request;if(error)throw error;return data};
const sizeOf=n=>!n?'0 KB':n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(1)} MB`;
const dateOf=n=>n?new Date(Number(n)).toLocaleDateString('vi-VN'):'';
const safeName=n=>String(n||'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,120)||'file';
const $create=(tag,klass,content)=>{const el=document.createElement(tag);if(klass)el.className=klass;if(content!==undefined)el.textContent=String(content);return el};
const getFolder=id=>folderIndex.get(id);
const children=id=>childFolderIndex.get(id||'')||[];
const listed=id=>docIndex.get(id||'')||[];
const ancestors=id=>{const arr=[],seen=new Set();let node=getFolder(id);while(node&&!seen.has(node.id)){seen.add(node.id);arr.unshift(node);node=getFolder(node.fid)}return arr};
const descendants=id=>{const seen=new Set(),walk=[id];while(walk.length){const x=walk.pop();for(const node of children(x))if(!seen.has(node.id)){seen.add(node.id);walk.push(node.id)}}return seen};
const can=op=>!!permissions?.[op];
const assert=op=>{if(!can(op))throw Error('Tài khoản không có quyền '+({view:'xem danh sách',download:'xem nội dung/tải file',upload:'tải lên hoặc sửa tài liệu',delete:'xóa tài liệu'}[op]||op))};
function setActions(){const cr=can('upload'),rd=can('view');$('#newFolderBtn').disabled=!cr;$('#fileInput').disabled=!cr;$('#folderSave').disabled=!cr;$('#upBtn').disabled=!current;$('#legacyImport').classList.toggle('hidden',!can('upload'));const legacyBtn=$('#legacyImportVisible');if(legacyBtn)legacyBtn.hidden=!can('upload');$('#searchInput').disabled=!rd;$('#sortSelect').disabled=!rd;}
async function connect(){
 initVaultHistory();
 try{
   const parent=window.parent;
   if(parent===window||!parent.ktxVaultClientV217)throw Error('Vui lòng mở Kho tài liệu từ ứng dụng KTX Hóc Môn đã đăng nhập.');
   sb=parent.ktxVaultClientV217();
   if(!sb)throw Error('Chưa kết nối Supabase trong ứng dụng.');
   const r=await sb.auth.getSession(); if(r.error||!r.data?.session?.user)throw Error('Chưa có phiên đăng nhập Supabase hợp lệ.');
   session=r.data.session;
   permissions=await api(sb.rpc('ktx_vault_permission_snapshot'));
   if(!permissions?.view)throw Error('Tài khoản chưa có quyền Kho tài liệu. Vui lòng liên hệ Quản trị viên.');
   await refresh();
 }catch(e){warn('Không mở được Kho tài liệu Cloud: '+(e.message||e));const area=$('#content');if(area)area.replaceChildren($create('div','empty','Không tải được tài liệu. Kiểm tra kết nối hoặc quyền truy cập.')); disableAll();}
}
function disableAll(){for(const id of ['newFolderBtn','fileInput','folderSave','searchInput','sortSelect','refreshBtn']){$('#'+id).disabled=true}}
/* Stage 73: progressive cloud loading. Draw the first page immediately instead of
 * waiting for every Supabase page; subsequently merge pages without duplication. */
async function refresh(){
 if(!sb)return;
 const generation=++loadGeneration;
 vaultLoading=true;
 warn('Đang tải tài liệu từ Supabase…');
 const out=[];const PAGE=250;let complete=false;
 try{
  for(let start=0;start<10000;start+=PAGE){
   const result=await api(sb.from(TABLE).select('id,kind,name,fid,note,size,type,path,at').order('at',{ascending:false}).range(start,start+PAGE-1));
   if(generation!==loadGeneration)return;
   out.push(...(result||[]));
   folders=out.filter(x=>x.kind==='folders');docs=out.filter(x=>x.kind==='docs');
   rebuildVaultIndex();
   if(start===0){
    /* Keep the stored folder selected until the complete hierarchy arrives. */
    renderAll();
    await new Promise(resolve=>requestAnimationFrame(resolve));
   }
   if((result||[]).length<PAGE){complete=true;break}
   warn('Đã tải '+out.length+' mục, đang nhận thêm…');
  }
  if(generation!==loadGeneration)return;
  vaultLoading=false;
  if(current&&!getFolder(current)){
   current='';renderLimit=120;
   try{history.replaceState({...history.state,[VAULT_NAV_KEY]:true,folderId:''},'',location.href)}catch(_){}
  }
  warn((complete?'Đã đồng bộ ':'Đã tải ') + out.length+' mục từ Supabase · '+new Date().toLocaleTimeString('vi-VN'));
  renderAll();
 }catch(e){
  if(generation!==loadGeneration)return;
  vaultLoading=false;
  if(out.length){
   warn('Đã tải '+out.length+' mục, nhưng chưa nhận đủ dữ liệu: '+(e.message||e)+'. Bấm Làm mới để thử lại.');
   renderAll();
  }else throw e;
 }
}
// Desktop folder tree mirrors fid parent/child relationships, never a flat list.
const collapsedFolderIds=new Set();
function tree(){
 const wrap=$('#treeRoot');if(!wrap)return;
 wrap.replaceChildren();
 const totalDirect=id=>children(id).length+listed(id).length;
 // Keep selected folder visible when navigating from a breadcrumb or a document tile.
 for(const p of ancestors(current))collapsedFolderIds.delete(p.id);
 const root=$create('button','treeItem treeRootItem'+(!current?' active':''));
 root.type='button';root.append($create('span','treeFolderIcon','📁'),$create('span','name','Tất cả tài liệu'),$create('span','meta',totalDirect('')));
 root.title='Số mục trực tiếp: '+totalDirect('');
 root.onclick=()=>navigateFolder('');
 wrap.append(root);
 const seen=new Set();
 const draw=(parentId,holder)=>{
  const nodes=children(parentId).sort((a,b)=>a.name.localeCompare(b.name,'vi'));
  for(const f of nodes){
   if(seen.has(f.id))continue;seen.add(f.id);
   const row=$create('div','vault-tree-row');
   const sub=children(f.id),hasChildren=sub.length>0;
   const toggle=$create('button','vault-tree-toggle',hasChildren?(collapsedFolderIds.has(f.id)?'▸':'▾'):'');
   toggle.type='button';toggle.disabled=!hasChildren;
   toggle.setAttribute('aria-label',(collapsedFolderIds.has(f.id)?'Mở':'Thu gọn')+' thư mục '+f.name);
   toggle.setAttribute('aria-expanded',String(hasChildren&&!collapsedFolderIds.has(f.id)));
   const btn=$create('button','treeItem'+(current===f.id?' active':''));
   btn.type='button';btn.append($create('span','treeFolderIcon','📁'),$create('span','name',f.name),$create('span','meta',totalDirect(f.id)));
   btn.title=f.name+' · '+totalDirect(f.id)+' mục trực tiếp ('+sub.length+' thư mục, '+listed(f.id).length+' tệp)';
   btn.onclick=()=>navigateFolder(f.id);
   const branch=$create('div','vault-tree-children');
   if(hasChildren){
    toggle.onclick=()=>{
     if(collapsedFolderIds.has(f.id))collapsedFolderIds.delete(f.id);
     else{
      collapsedFolderIds.add(f.id);
      if(current===f.id||ancestors(current).some(a=>a.id===f.id))navigateFolder(f.id);
     }
     renderAll();
    };
   }
   row.append(toggle,btn);holder.append(row);
   if(hasChildren){draw(f.id,branch);if(!collapsedFolderIds.has(f.id))holder.append(branch)}
  }
 };
 draw('',wrap);
}
function breadcrumb(){const el=$('#breadcrumb');el.replaceChildren();const make=(label,id)=>{const b=$create('button','',label);b.type='button';b.onclick=()=>navigateFolder(id);el.append(b)};make('Tất cả tài liệu','');for(const f of ancestors(current)){el.append($create('span','','›'));make(f.name,f.id)}}
// All icon SVG markup is application-authored; never interpolate filenames in markup.
function fileIcon(name,kind){
 // Hand-drawn SVG icons for Office-like documents. No external assets or icon fonts.
 const ext=String(name||'').split('.').pop().toLowerCase();
 let type='file';
 if(kind==='folder')type='folder';
 else if(['xlsx','xls','csv'].includes(ext))type='excel';
 else if(['docx','doc','rtf'].includes(ext))type='word';
 else if(ext==='pdf')type='pdf';
 else if(['png','jpg','jpeg','webp','gif','bmp','svg','heic'].includes(ext))type='image';
 else if(['pptx','ppt'].includes(ext))type='slides';
 else if(['zip','rar','7z'].includes(ext))type='archive';
 else if(['txt','md','json','xml'].includes(ext))type='text';
 const icons={
 folder:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M5 16a6 6 0 0 1 6-6h15l6 7h21a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6V16" fill="#ec9b06"/><path d="M5 25a6 6 0 0 1 6-6h46a6 6 0 0 1 6 7l-5 24a7 7 0 0 1-7 6H11a6 6 0 0 1-6-6V25" fill="#ffca4f"/><path d="M10 25h43" stroke="#fff1bc" stroke-width="3" opacity=".8"/></svg>`,
 excel:`<svg viewBox="0 0 64 72" aria-hidden="true"><rect x="17" y="5" width="41" height="62" rx="5" fill="#e5f7ed" stroke="#18865b" stroke-width="2"/><path d="M17 12q0-7 7-7h27l7 8v10H17Z" fill="#23a26b"/><path d="M48 5v12h10" fill="#78d1a2"/><path d="M48 5v12h10" stroke="#18865b" stroke-width="1.5"/><path d="M29 30h23M29 40h23M29 50h23M36 23v34M44 23v34" stroke="#75b99a" stroke-width="1.6"/><rect x="3" y="20" width="31" height="37" rx="4" fill="#0c7448"/><path d="M3 24q0-4 4-4h23q4 0 4 4v29q0 4-4 4H7q-4 0-4-4Z" fill="#168c59"/><path d="m11 31 6 8-6 8m16-16-6 8 6 8" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>`,
 word:`<svg viewBox="0 0 64 72" aria-hidden="true"><rect x="17" y="5" width="41" height="62" rx="5" fill="#e9f2ff" stroke="#2578d6" stroke-width="2"/><path d="M17 12q0-7 7-7h27l7 8v10H17Z" fill="#3698fa"/><path d="M48 5v12h10" fill="#9ed0ff"/><path d="M48 5v12h10" stroke="#2578d6" stroke-width="1.5"/><path d="M29 29h23M29 37h23M29 45h23M29 53h18" stroke="#82b3ed" stroke-width="2.6" stroke-linecap="round"/><rect x="3" y="20" width="31" height="37" rx="4" fill="#0e54ad"/><path d="M3 24q0-4 4-4h23q4 0 4 4v29q0 4-4 4H7q-4 0-4-4Z" fill="#2875dc"/><text x="18.5" y="46" font-family="Arial,sans-serif" text-anchor="middle" font-size="25" font-weight="900" fill="white">W</text></svg>`,
 pdf:`<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M13 4h32l13 13v44a6 6 0 0 1-6 6H13a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z" fill="#fff0f1" stroke="#dd3446" stroke-width="2.2"/><path d="M45 4v13h13" fill="#ffc7cb" stroke="#dd3446" stroke-width="2"/><rect x="3" y="28" width="58" height="29" rx="5" fill="#e23742"/><text x="32" y="48.5" font-family="Arial,sans-serif" text-anchor="middle" font-size="21" font-weight="900" fill="white">PDF</text><path d="M14 61h35" stroke="#f2a3a8" stroke-width="2.4" stroke-linecap="round"/></svg>`,
 image:`<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M11 4h34l13 13v44a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z" fill="#e8f8fd" stroke="#0a9dc0" stroke-width="2"/><path d="M45 4v13h13" fill="#9bddee" stroke="#0a9dc0" stroke-width="2"/><rect x="11" y="27" width="47" height="31" rx="5" fill="#57b9d9"/><circle cx="45" cy="35" r="5" fill="#ffdd72"/><path d="m12 55 12-15 9 9 8-8 16 16H14" fill="#096c9d"/><path d="m31 50 10-9 16 16H36" fill="#0f88b2"/></svg>`,
 slides:`<svg viewBox="0 0 64 72" aria-hidden="true"><rect x="17" y="5" width="41" height="62" rx="5" fill="#fff2e8" stroke="#dc6e2d" stroke-width="2"/><path d="M17 12q0-7 7-7h27l7 8v10H17Z" fill="#f39c55"/><path d="M48 5v12h10" fill="#ffceaa"/><path d="M48 5v12h10" stroke="#dc6e2d" stroke-width="1.5"/><rect x="27" y="30" width="26" height="21" rx="3" fill="white" stroke="#f4ae75" stroke-width="2"/><path d="M40 32v17" stroke="#f4ae75" stroke-width="1.6"/><rect x="3" y="20" width="31" height="37" rx="4" fill="#d9601d"/><text x="18.5" y="46" font-family="Arial,sans-serif" text-anchor="middle" font-size="25" font-weight="900" fill="white">P</text></svg>`,
 archive:`<svg viewBox="0 0 64 72" aria-hidden="true"><rect x="8" y="4" width="48" height="62" rx="6" fill="#f1eaff" stroke="#7d57bd" stroke-width="2"/><path d="M34 7v43" stroke="#9567d6" stroke-width="6" stroke-dasharray="6 4"/><rect x="21" y="42" width="26" height="17" rx="4" fill="#8658c2"/><text x="34" y="54" text-anchor="middle" font-size="10" font-family="Arial,sans-serif" font-weight="800" fill="white">ZIP</text></svg>`,
 text:`<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M11 4h34l13 13v44a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/><path d="M45 4v13h13" fill="#d1d9e3" stroke="#64748b" stroke-width="2"/><path d="M16 30h31M16 38h31M16 46h31M16 54h22" stroke="#8896a9" stroke-width="3" stroke-linecap="round"/></svg>`,
 file:`<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M11 4h34l13 13v44a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z" fill="#f1f5f9" stroke="#75849a" stroke-width="2"/><path d="M45 4v13h13" fill="#d1dae6" stroke="#75849a" stroke-width="2"/><rect x="15" y="31" width="37" height="20" rx="4" fill="#7d8da6"/><text x="33.5" y="45" font-family="Arial,sans-serif" font-size="12" text-anchor="middle" font-weight="800" fill="white">FILE</text></svg>`
 };
 const holder=$create('span','file-icon');holder.dataset.fileType=type;holder.setAttribute('aria-hidden','true');holder.innerHTML=icons[type]||icons.file;return holder;
}
function renderAll(){if($('#treeRoot') && $('#treeRoot').getClientRects().length)tree();breadcrumb();text($('#countFolders'),folders.length);text($('#countFiles'),docs.length);text($('#currentLabel'),getFolder(current)?.name||'Tất cả tài liệu');
 const query=String($('#searchInput').value||'').trim().toLocaleLowerCase('vi');let items=[...children(current).map(x=>({...x,_kind:'folder'})),...listed(current).map(x=>({...x,_kind:'doc'}))];if(query)items=[...folders.map(x=>({...x,_kind:'folder'})),...docs.map(x=>({...x,_kind:'doc'}))].filter(x=>x.name.toLocaleLowerCase('vi').includes(query));
 const mode=$('#sortSelect').value;items.sort((a,b)=>mode==='name'?a.name.localeCompare(b.name,'vi'):mode==='old'?a.at-b.at:b.at-a.at);
 for(const [id,setting] of [['viewGrid','grid'],['viewList','list']]){const b=$('#'+id);if(b)b.setAttribute('aria-pressed',String(viewMode===setting))}
 const el=$('#content');el.replaceChildren();if(!items.length){if(vaultLoading)el.append($create('div','vault-loading-placeholder','Đang lấy thêm dữ liệu…'));else el.append($create('div','empty',query?'Không có kết quả tìm kiếm.':'Thư mục trống.'));setActions();return}
 const grid=$create('div','grid'+(viewMode==='list'?' list':''));
 for(const item of items.slice(0,renderLimit)){
  const tile=$create('article','item'+(item._kind==='folder'?' folder':''));
  const visual=$create('div','icon');visual.append(fileIcon(item.name,item._kind));tile.append(visual,$create('div','title',item.name));
  const detail=item._kind==='folder'?`${children(item.id).length+listed(item.id).length} mục`:`${sizeOf(item.size)} · ${dateOf(item.at)}`;
  tile.append($create('div','foot',detail));
  const menuAnchor=$create('div','menu-anchor'),toggle=$create('button','more-btn','⋮'),menu=$create('div','action-menu');
  toggle.type='button';toggle.setAttribute('aria-label','Thao tác với '+item.name);toggle.setAttribute('aria-haspopup','true');toggle.setAttribute('aria-expanded','false');menu.hidden=true;
  toggle.onclick=e=>{e.stopPropagation();const open=menu.hidden;document.querySelectorAll('.action-menu').forEach(m=>m.hidden=true);document.querySelectorAll('.more-btn').forEach(b=>b.setAttribute('aria-expanded','false'));menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open))};
  const action=(label,fn,isDanger=false)=>{const b=$create('button',isDanger?'danger':'',label);b.type='button';b.onclick=e=>{e.stopPropagation();menu.hidden=true;toggle.setAttribute('aria-expanded','false');Promise.resolve().then(fn).catch(err=>warn(err.message||err))};menu.append(b)};
  if(item._kind==='folder'){
    action('Mở thư mục',()=>navigateFolder(item.id));
    if(can('upload'))action('Đổi tên',()=>renameItem(item));
    if(can('delete'))action('Xóa',()=>deleteItem(item),true);
    tile.onclick=e=>{if(!e.target.closest('button,.action-menu'))navigateFolder(item.id)};
  }else{
    if(can('download')){action('Xem trước',()=>preview(item));action('Tải về',()=>download(item));action('Chia sẻ tệp (Zalo / Messenger)',()=>shareDocument127(item))}
    if(can('upload'))action('Đổi tên',()=>renameItem(item));
    if(can('delete'))action('Xóa',()=>deleteItem(item),true);
    if(can('download')){
      tile.classList.add('preview-clickable');
      tile.tabIndex=0;
      tile.setAttribute('role','button');
      tile.setAttribute('aria-label','Xem trước '+item.name);
      tile.onclick=e=>{if(!e.target.closest('.menu-anchor,button'))preview(item).catch(err=>warn(err.message||err))};
      tile.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();preview(item).catch(err=>warn(err.message||err))}};
    }
  }
  if(menu.childElementCount){menuAnchor.append(toggle,menu);tile.append(menuAnchor)}
  grid.append(tile);
 }
 el.append(grid);
 if(items.length>renderLimit){
  const more=$create('button','btn vault-load-more','Xem thêm ('+Math.min(120,items.length-renderLimit)+' / '+(items.length-renderLimit)+' mục còn lại)');
  more.type='button';more.onclick=()=>{renderLimit+=120;renderAll()};
  el.append(more);
 }
 setActions()
}
function openFolderModal(name=''){assert('upload');const opts=$('#parentSelect');opts.replaceChildren();const root=$create('option','','Tất cả tài liệu');root.value='';opts.append(root);
 const used=new Set();const visit=(id,depth)=>{for(const f of children(id).sort((a,b)=>a.name.localeCompare(b.name,'vi'))){if(used.has(f.id))continue;used.add(f.id);const o=$create('option','',('  '.repeat(depth))+'└ '+f.name);o.value=f.id;opts.append(o);visit(f.id,depth+1)}};visit('',0);opts.value=current||'';$('#folderName').value=name;$('#folderModal').classList.add('open');$('#folderName').focus()}
async function createFolder(){assert('upload');const name=$('#folderName').value.trim(),parentId=$('#parentSelect').value||'';if(!name)throw Error('Hãy nhập tên thư mục');if(folders.some(f=>(f.fid||'')===parentId&&f.name.toLowerCase()===name.toLowerCase()))throw Error('Tên thư mục đã tồn tại tại vị trí này');
 await api(sb.from(TABLE).insert({id:uid(),kind:'folders',name,fid:parentId,note:'',size:0,type:'',path:'',at:Date.now()}));$('#folderModal').classList.remove('open');await refresh()}
async function renameItem(item){assert('upload');const newName=prompt('Tên mới',item.name);if(!newName||!newName.trim()||newName===item.name)return;
 await api(sb.from(TABLE).update({name:newName.trim()}).eq('id',item.id));await refresh()}
async function deleteItem(item){assert('delete');if(item._kind==='folder'&&(children(item.id).length||listed(item.id).length))throw Error('Thư mục còn nội dung. Hãy xử lý các thư mục con và tài liệu trước khi xóa.');
 if(!confirm(`Xóa ${item._kind==='folder'?'thư mục':'tài liệu'} "${item.name}"?`))return;
 // Delete metadata first; a failed Storage removal leaves an inaccessible private orphan, not public exposure.
 await api(sb.from(TABLE).delete().eq('id',item.id));
 if(item._kind==='doc'&&item.path){const {error}=await sb.storage.from(BUCKET).remove([item.path]);if(error)warn('Đã xóa hồ sơ; file riêng tư chưa dọn được từ Storage: '+error.message)}
 await refresh()}
async function upload(files){assert('upload');const arr=[...files];if(!arr.length)return;let successful=0;for(const f of arr){if(f.size>20*1048576){warn(`Bỏ qua ${f.name}: vượt 20 MB`);continue}const id=uid(),path=`uploads/${id}/${safeName(f.name)}`;
  const {error}=await sb.storage.from(BUCKET).upload(path,f,{upsert:false,contentType:f.type||'application/octet-stream'});if(error){warn('Tải lên thất bại: '+error.message);continue}
  const item={id,kind:'docs',name:f.name,fid:current||'',note:'',size:f.size,type:f.type||'application/octet-stream',path,at:Date.now()};const {error:metaErr}=await sb.from(TABLE).insert(item);if(metaErr){await sb.storage.from(BUCKET).remove([path]);warn('Không ghi được hồ sơ: '+metaErr.message);continue}successful++}
 await refresh();warn(`Đã tải ${successful}/${arr.length} tài liệu lên Supabase.`)}
async function signed(item,ttl=120){assert('download');if(!item.path)throw Error('Tài liệu chưa có đường dẫn Storage');const result=await api(sb.storage.from(BUCKET).createSignedUrl(item.path,ttl));return result.signedUrl}
// V2.0.129: obtain real private file in Vault, deliver the File to the top-level host.
// Browser Web Share cannot reliably run from nested iframes. No URL/link fallback.
async function shareDocument127(item){
 assert('download');
 const title=String(item.name||'Tài liệu KTX Hóc Môn');
 warn('Đang chuẩn bị tệp để chia sẻ trực tiếp…');
 const url=await signed(item,120);
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)throw Error('Không thể đọc tệp gốc từ Storage ('+response.status+')');
 const blob=await response.blob();
 const file=new File([blob],title,{type:item.type||blob.type||'application/octet-stream'});
 if(window.parent===window){
  throw Error('Vui lòng mở Kho tài liệu bên trong ứng dụng KTX Hóc Môn để chia sẻ tệp trực tiếp.');
 }
 window.parent.postMessage({type:'ktx:vault-share-file-v2129',file},location.origin);
 warn('Tệp đã sẵn sàng. Nhấn “Chia sẻ tệp” trên cửa sổ ứng dụng để chọn Zalo/Messenger.');
}
async function download(item){const url=await signed(item);const res=await fetch(url);if(!res.ok)throw Error('Không tải được nội dung');const blob=await res.blob(),link=URL.createObjectURL(blob),a=$create('a');a.href=link;a.download=item.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(link),5000)}
function previewModal(){
 let el=$('#previewModal');if(el)return el;
 el=$create('div','modal');el.id='previewModal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Xem trước tài liệu');
 el.innerHTML='<div class="card panel office-preview-panel"><div class="office-preview-head"><h3 id="previewTitle"></h3><div class="office-preview-head-actions"><div class="office-zoom-control" id="previewZoomControl" role="group" aria-label="Thu phóng tài liệu"><button class="office-zoom-btn" type="button" id="previewZoomOut" aria-label="Thu nhỏ tài liệu" title="Thu nhỏ">−</button><output id="previewZoomValue" aria-live="polite">100%</output><button class="office-zoom-btn" type="button" id="previewZoomIn" aria-label="Phóng to tài liệu" title="Phóng to">+</button><button class="office-zoom-reset" type="button" id="previewZoomReset" title="Đặt lại 100%">100%</button></div><button class="btn" id="previewClose" type="button">Đóng</button></div></div><div id="previewBody" class="office-preview-body"></div><div class="actionsBar office-preview-footer"><button class="btn" id="previewShare" type="button">Chia sẻ</button><button class="btn primary" id="previewDownload" type="button">Tải về</button></div></div>';
 document.body.append(el);
 const close=()=>{el.classList.remove('open');$('#previewBody').replaceChildren();};
 el.addEventListener('click',e=>{if(e.target===el)close()});
 $('#previewClose').onclick=close;
 let level=100;
 let kind='other';
 let pdfUrl='';
 const body=$('#previewBody');
 function updateZoom(){
  const val=$('#previewZoomValue');if(val)val.textContent=level+'%';
  const minus=$('#previewZoomOut'),plus=$('#previewZoomIn');
  if(minus)minus.disabled=level<=50;
  if(plus)plus.disabled=level>=200;
  const target=body.querySelector('.office-preview-table,.office-word-page,.office-preview-image');
  if(target){
    target.style.zoom=level+'%';
    if(target.matches('.office-preview-image')){
      target.style.maxWidth='none';target.style.maxHeight='none';target.style.width='auto';target.style.height='auto';
    }
  }
  if(kind==='pdf'&&pdfUrl){
    const frame=body.querySelector('iframe.office-preview-pdf');
    if(frame){
      const source=pdfUrl.split('#')[0]+'#zoom='+level;
      if(frame.getAttribute('src')!==source)frame.setAttribute('src',source);
    }
  }
 }
 function setZoom(n){level=Math.min(200,Math.max(50,n));updateZoom()}
 $('#previewZoomOut').onclick=()=>setZoom(level-25);
 $('#previewZoomIn').onclick=()=>setZoom(level+25);
 $('#previewZoomReset').onclick=()=>setZoom(100);
 el.ktxPreviewZoom={reset:(type,url)=>{level=100;kind=type;pdfUrl=url||'';updateZoom()},refresh:updateZoom};
 el.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 return el;
}
async function loadOfficeLibrary(name){
 if(name==='XLSX'&&window.XLSX)return;
 if(name==='mammoth'&&window.mammoth)return;
 if(name==='DOMPurify'&&window.DOMPurify)return;
 const scripts={
  XLSX:'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  mammoth:'https://cdn.jsdelivr.net/npm/mammoth@1.10.0/mammoth.browser.min.js',
  DOMPurify:'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js'
 };
 if(!window.ktxOfficeScripts)window.ktxOfficeScripts={};
 if(!window.ktxOfficeScripts[name]){
  window.ktxOfficeScripts[name]=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=scripts[name];script.async=true;
   script.onload=()=>window[name]?resolve():reject(Error('Thư viện '+name+' không khả dụng'));
   script.onerror=()=>reject(Error('Không tải được thư viện '+name+' (cần kết nối Internet)'));
   document.head.append(script);
  }).catch(err=>{delete window.ktxOfficeScripts[name];throw err});
 }
 return window.ktxOfficeScripts[name];
}
function msgBox(body,message){const p=$create('p','office-preview-message',message);body.replaceChildren(p);return p;}
async function renderExcelPreview(blob,body){
 await loadOfficeLibrary('XLSX');
 const book=XLSX.read(await blob.arrayBuffer(),{type:'array',cellDates:true});
 if(!book.SheetNames.length){msgBox(body,'Tệp Excel không có Sheet.');return}
 const toolbar=$create('div','office-sheet-toolbar');
 const label=$create('label','', 'Sheet: '),select=$create('select','office-sheet-select');
 for(const name of book.SheetNames){const opt=$create('option','',name);opt.value=name;select.append(opt)}
 label.append(select);toolbar.append(label);
 const hint=$create('span','office-preview-hint','Hiển thị tối đa 300 dòng × 40 cột mỗi Sheet.');toolbar.append(hint);
 const viewport=$create('div','office-table-scroller');
 const draw=()=>{
  viewport.replaceChildren();
  const sheet=book.Sheets[select.value];
  if(!sheet)return;
  const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false,defval:'',blankrows:false});
  if(!rows.length){viewport.append($create('div','empty','Sheet trống.'));return}
  const table=$create('table','office-preview-table');
  const head=$create('thead'),headRow=$create('tr');
  headRow.append($create('th','','#'));
  const cols=Math.min(Math.max(...rows.slice(0,300).map(r=>r.length),0),40);
  for(let c=0;c<cols;c++)headRow.append($create('th','',''));
  // Headers are generated independently of untrusted spreadsheet content.
  for(let c=0;c<cols;c++)headRow.children[c+1].textContent=((n)=>{let a='';do{a=String.fromCharCode(65+n%26)+a;n=Math.floor(n/26)-1}while(n>=0);return a})(c);
  head.append(headRow);table.append(head);
  const tb=$create('tbody');
  rows.slice(0,300).forEach((row,i)=>{const tr=$create('tr');tr.append($create('th','',i+1));for(let c=0;c<cols;c++){const cell=$create('td','',String(row[c]??''));tr.append(cell)}tb.append(tr)});
  table.append(tb);viewport.append(table);
 };
 select.onchange=()=>{draw();document.getElementById('previewModal')?.ktxPreviewZoom?.refresh()};body.replaceChildren(toolbar,viewport);draw();
}
async function renderWordPreview(blob,body){
 await loadOfficeLibrary('mammoth');
 const arrayBuffer=await blob.arrayBuffer();
 const result=await mammoth.convertToHtml({arrayBuffer:arrayBuffer.slice(0)});
 const region=$create('div','office-word-page');
 try{
  await loadOfficeLibrary('DOMPurify');
  region.innerHTML=DOMPurify.sanitize(result.value,{USE_PROFILES:{html:true},FORBID_TAGS:['style','script','iframe','form','object','embed','svg','math'],FORBID_ATTR:['style','onerror','onload']});
 }catch(_){
  const fallback=await mammoth.extractRawText({arrayBuffer:arrayBuffer.slice(0)});
  region.textContent=fallback.value||'Tệp Word không có nội dung văn bản.';
  region.style.whiteSpace='pre-wrap';
 }
 body.replaceChildren(region);
}
async function preview(item){
 assert('download');
 const el=previewModal(),body=$('#previewBody');
 el.ktxPreviewZoom.reset('other','');
 text($('#previewTitle'),item.name);
 msgBox(body,'Đang mở tài liệu…');
 $('#previewDownload').onclick=()=>download(item).catch(e=>warn(e.message||e));
 const shareBtn=$('#previewShare');if(shareBtn)shareBtn.onclick=()=>shareDocument127(item).catch(e=>warn(e.message||e));
 el.classList.add('open');
 const ext=String(item.name||'').toLowerCase().split('.').pop(),type=(item.type||'').toLowerCase();
 try{
  const url=await signed(item);let viewer;
  if(type.startsWith('image/')||['png','jpg','jpeg','gif','webp'].includes(ext)){
    viewer=$create('img','office-preview-image');viewer.src=url;viewer.alt=item.name;body.replaceChildren(viewer);el.ktxPreviewZoom.reset('image','');
  }else if(type==='application/pdf'||ext==='pdf'){
    viewer=$create('iframe','office-preview-pdf');viewer.title=item.name;body.replaceChildren(viewer);el.ktxPreviewZoom.reset('pdf',url);
  }else if(['xlsx','xls','csv'].includes(ext)){
    const response=await fetch(url);if(!response.ok)throw Error('Không tải được nội dung Excel');
    await renderExcelPreview(await response.blob(),body);el.ktxPreviewZoom.reset('excel','');
  }else if(ext==='docx'){
    const response=await fetch(url);if(!response.ok)throw Error('Không tải được nội dung Word');
    await renderWordPreview(await response.blob(),body);el.ktxPreviewZoom.reset('word','');
  }else{
    msgBox(body,'Chưa hỗ trợ xem trước định dạng này. Có thể tải tệp gốc về.');
  }
 }catch(e){
  msgBox(body,'Không mở được bản xem trước: '+(e.message||e)+'. Có thể tải file gốc nếu có quyền.');
 }
}
async function migrateLegacy(){
 assert('upload');
 const raw=localStorage.getItem('ktx_vault_folders_v2016');
 let oldFolders=[];try{oldFolders=JSON.parse(raw||'[]')}catch(_){}
 if(!Array.isArray(oldFolders))oldFolders=[];
 // Avoid silently importing anything or deleting a user's local files.
 const oldDb=await new Promise((resolve,reject)=>{const r=indexedDB.open('ktx_vault_v2016',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onupgradeneeded=()=>{r.transaction.abort()}});
 if(!oldDb.objectStoreNames.contains('meta')||!oldDb.objectStoreNames.contains('files')){oldDb.close();throw Error('Không tìm thấy Kho tài liệu cục bộ V2.0.16 trên thiết bị này')}
 const oldMeta=await new Promise((resolve,reject)=>{const tx=oldDb.transaction('meta','readonly'),r=tx.objectStore('meta').getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)});
 if(!oldMeta.length&&!oldFolders.length){oldDb.close();throw Error('Không có dữ liệu cũ để chuyển')}
 if(!confirm(`Chuyển ${oldFolders.length} thư mục và ${oldMeta.length} tài liệu cũ lên Supabase?\nCác file lưu trên thiết bị sẽ được giữ nguyên, không xóa tự động.`)){oldDb.close();return}
 warn('Đang chuyển dữ liệu cũ lên Cloud...');
 const folderMap=new Map(),seen=new Set();let foldersCopied=0,filesCopied=0,errors=[];
 async function pushFolder(f){if(folderMap.has(f.id))return folderMap.get(f.id);if(seen.has(f.id))throw Error('Cấu trúc thư mục cũ có vòng lặp');seen.add(f.id);
  const par=oldFolders.find(x=>x.id===f.parentId);let pid='';if(par)pid=await pushFolder(par);
  let dest=folders.find(x=>x.name===f.name&&(x.fid||'')===pid);
  if(!dest){dest={id:uid(),kind:'folders',name:f.name||'Thư mục',fid:pid,note:'',size:0,type:'',path:'',at:Date.now()};await api(sb.from(TABLE).insert(dest));folders.push(dest);foldersCopied++}
  folderMap.set(f.id,dest.id);seen.delete(f.id);return dest.id}
 for(const f of oldFolders){try{await pushFolder(f)}catch(e){errors.push(f.name+': '+e.message)}}
 for(const old of oldMeta){try{
  if(docs.some(d=>String(d.note||'').includes('[LocalV2016:'+old.id+']')))continue;
  const blob=await new Promise((resolve,reject)=>{const tx=oldDb.transaction('files','readonly'),r=tx.objectStore('files').get(old.id);r.onsuccess=()=>resolve(r.result?.blob||null);r.onerror=()=>reject(r.error)});
  if(!blob)throw Error('Thiếu nội dung file');if(blob.size>20*1048576)throw Error('Vượt 20 MB');
  const id=uid(),path=`uploads/${id}/${safeName(old.name)}`;
  await api(sb.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:old.type||blob.type||'application/octet-stream'}));
  const rec={id,kind:'docs',name:old.name||'Tài liệu',fid:folderMap.get(old.folderId)||'',note:`[LocalV2016:${old.id}]`,size:blob.size,type:old.type||blob.type||'application/octet-stream',path,at:Date.now()};
  try{await api(sb.from(TABLE).insert(rec))}catch(e){await sb.storage.from(BUCKET).remove([path]);throw e}docs.push(rec);filesCopied++;
 }catch(e){errors.push(old.name+': '+e.message)}}
 oldDb.close();await refresh();warn(`Đã chuyển ${foldersCopied} thư mục, ${filesCopied} tài liệu. ${errors.length?'Còn '+errors.length+' lỗi: '+errors.slice(0,3).join('; '):'Dữ liệu cũ vẫn được giữ trên thiết bị.'}`)
}
function bind(){
 $('#newFolderBtn').onclick=()=>{try{openFolderModal()}catch(e){warn(e.message)}};
 $('#folderCancel').onclick=()=>$('#folderModal').classList.remove('open');$('#folderModal').onclick=e=>{if(e.target.id==='folderModal')$('#folderModal').classList.remove('open')};
 $('#folderSave').onclick=async()=>{const b=$('#folderSave');if(b.disabled)return;b.disabled=true;try{await createFolder()}catch(e){warn(e.message)}finally{b.disabled=false}};
 $('#refreshBtn').onclick=()=>refresh().catch(e=>warn(e.message));$('#legacyImport').onclick=()=>migrateLegacy().catch(e=>warn(e.message));$('#upBtn').onclick=()=>navigateFolder(getFolder(current)?.fid||'');
 $('#fileInput').onchange=e=>{upload(e.target.files).catch(err=>warn(err.message));e.target.value=''};
 $('#searchInput').oninput=()=>{renderLimit=120;renderAll()};$('#sortSelect').onchange=()=>{renderLimit=120;renderAll()};
 for(const [id,val] of [['viewGrid','grid'],['viewList','list']]){$('#'+id).onclick=()=>{viewMode=val;try{localStorage.setItem(VIEW_KEY,val)}catch(_){}renderAll()}}
 document.addEventListener('click',e=>{if(!e.target.closest('.menu-anchor')){document.querySelectorAll('.action-menu').forEach(m=>m.hidden=true);document.querySelectorAll('.more-btn').forEach(b=>b.setAttribute('aria-expanded','false'))}});

 document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{try{openFolderModal(b.dataset.quick)}catch(e){warn(e.message)}});
 // Mobile vault gesture is scoped to its own content, not the whole document.
 // Preserve desktop behavior and prevent swipe-end synthetic clicks from opening folders.
 let vaultTouch=null,swipeConsumedUntil=0;
 const vaultZone=$('#content');
 const vaultMobile=()=>matchMedia('(max-width:800px)').matches;
 vaultZone.addEventListener('touchstart',e=>{
   vaultTouch=null;
   if(!vaultMobile()||e.touches.length!==1)return;
   const t=e.touches[0];
   if(t.clientX>32||e.target.closest('button,a,input,select,textarea,[contenteditable],.action-menu,.modal,[data-no-swipe]'))return;
   vaultTouch={x:t.clientX,y:t.clientY,at:Date.now()};
 },{passive:true});
 vaultZone.addEventListener('touchmove',e=>{
   if(!vaultTouch||e.touches.length!==1)return;
   const t=e.touches[0],dx=t.clientX-vaultTouch.x,dy=t.clientY-vaultTouch.y;
   if(Math.abs(dy)>35&&Math.abs(dy)>Math.abs(dx))vaultTouch=null;
 },{passive:true});
 vaultZone.addEventListener('touchcancel',()=>{vaultTouch=null},{passive:true});
 vaultZone.addEventListener('touchend',e=>{
   if(!vaultTouch||e.changedTouches.length!==1){vaultTouch=null;return}
   const t=e.changedTouches[0],dx=t.clientX-vaultTouch.x,dy=Math.abs(t.clientY-vaultTouch.y),elapsed=Date.now()-vaultTouch.at;
   vaultTouch=null;
   if(dx<95||dy>50||dx<dy*2||elapsed>1000)return;
   swipeConsumedUntil=performance.now()+650;
   window.dispatchEvent(new Event('ktx:gesture-consumed'));
   if(current){
     const st=history.state;
     if(st?.[VAULT_NAV_KEY]===true&&history.length>1){
       history.back(); // Android Back and custom edge swipe now share the same folder history.
     }else{
       navigateFolder(getFolder(current)?.fid||'',true);
     }
   }else if(window.parent!==window){
     // Ask same-origin parent to go back one mobile screen; never change files.
     window.parent.postMessage({type:'ktx:vault-root-back'},location.origin);
   }
 },{passive:true});
 // Block click synthesized by a completed swipe, but never a normal tap.
 vaultZone.addEventListener('click',e=>{
   if(e.isTrusted&&performance.now()<swipeConsumedUntil){e.preventDefault();e.stopImmediatePropagation()}
 },true);
 const zone=$('#content');zone.addEventListener('dragover',e=>{e.preventDefault()});zone.addEventListener('drop',e=>{e.preventDefault();upload(e.dataTransfer.files).catch(err=>warn(err.message))});
}
window.addEventListener('DOMContentLoaded',()=>{
 bind();
 warn('Đang kết nối Kho tài liệu…');
 const content=$('#content');
 if(content)content.innerHTML='<div class="vault-loading-placeholder" role="status"><span class="vault-spinner" aria-hidden="true"></span><span>Đang lấy danh sách tài liệu…</span></div>';
 connect();
});
})();
