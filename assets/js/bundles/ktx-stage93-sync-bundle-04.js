/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/modules/meals/script-39.js >>> */

(function(){
window.KTX_MEAL_BRIDGE={get client(){return typeof SUPA_SYNC!=='undefined'?SUPA_SYNC.client:null},get session(){return typeof SUPA_SYNC!=='undefined'?SUPA_SYNC.session:null},get ready(){return typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.ready},get role(){return typeof ME!=='undefined'?ME.role:null},get vendors(){return typeof NCCS!=='undefined'?NCCS:[]},get parseWeek(){return typeof menuParse==='function'?menuParse:null}};
const ov=document.getElementById('mealMonitor182'),frame=document.getElementById('mealMonitor182Frame');
window.openMealMonitor=function(options){if(!ov)return;ov.classList.add('open');if(!frame.getAttribute('src'))frame.src=frame.dataset.url;if(options&&options.edit){const invoke=()=>{try{frame.contentWindow.openMealMenuEditor&&frame.contentWindow.openMealMenuEditor()}catch(e){console.warn('Menu editor:',e)}};if(frame.contentDocument&&frame.contentDocument.readyState==='complete')setTimeout(invoke,400);else frame.addEventListener('load',()=>setTimeout(invoke,700),{once:true})}};
function close(){ov.classList.remove('open')}
document.getElementById('mealMonitor182Back').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('open'))close()});
})();

;
/* >>> Original: assets/js/modules/meals/vendor-catalog-v2091.js >>> */
/* V2.0.91 — dynamic meal supplier registry (shared across report, menu import and menu view). */
(function(){'use strict';
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let loading=null,lastLoad=0,ready=false;const inactive=new Set();
 // V2.0.124: confirmed retired supplier must never be revived by stale Cloud rows,
 // bundled lists, local copies or historical meal data. Keep historical menus intact.
 const retired=new Set(['stargate']);
 const allowed=name=>!retired.has(norm(name))&&!inactive.has(norm(name));

 // Once Supabase responds, it is the sole authority for active vendors.
 // Before a successful response keep the bundled list for offline viewing.
 const cloudActive=new Set();
 function register(name){const v=String(name||'').trim().replace(/\s+/g,' ');if(!v||v.length>120||typeof NCCS==='undefined'||!allowed(v)||(ready&&!cloudActive.has(norm(v))))return null;
   const old=NCCS.find(x=>norm(x)===norm(v));if(old)return old;NCCS.push(v);if(typeof RP!=='undefined')RP.on.add(v);return v;}
 function refresh(){if(typeof NCCS==='undefined')return;for(let i=NCCS.length-1;i>=0;i--)if(!allowed(NCCS[i])){RP?.on?.delete(NCCS[i]);NCCS.splice(i,1)}const root=document.getElementById('meal');
   if(root?.dataset.init==='1'){
     const list=root.querySelector('.meal-supplier-list');if(list){const prior=new Set([...list.querySelectorAll('[data-c]:checked')].map(x=>x.dataset.c));
       list.innerHTML=NCCS.map(n=>`<label class="meal-supplier"><input type="checkbox" data-c="${esc(n)}" ${typeof RP==='undefined'||RP.on.has(n)||prior.has(n)?'checked':''}><span class="meal-check">✓</span><span>${esc(n)}</span></label>`).join('');
       list.querySelectorAll('[data-c]').forEach(c=>c.onchange=()=>{if(typeof RP!=='undefined'&&RP.on){c.checked?RP.on.add(c.dataset.c):RP.on.delete(c.dataset.c)}if(typeof mealCards==='function')mealCards()});}
     const removeSelect=document.getElementById('mp_vendor_delete_select');if(removeSelect){const v=removeSelect.value;removeSelect.innerHTML='<option value="">Chọn NCC cần xóa</option>'+NCCS.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');removeSelect.value=NCCS.includes(v)?v:'';}
     const select=document.getElementById('mp_ni');if(select){const v=select.value;select.innerHTML='<option value="">Tự nhận diện nhà cung cấp</option>'+NCCS.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');select.value=NCCS.includes(v)?v:'';}
     if(typeof mealFill==='function')mealFill();if(typeof mealCards==='function')mealCards();
     const admin=typeof ME!=='undefined'&&ME.role==='admin',btn=document.getElementById('mp_vendor_manage'),panel=document.getElementById('mp_vendor_editor'),save=document.getElementById('mp_vendor_add'),del=document.getElementById('mp_vendor_delete');
     // Only administrators see vendor administration actions. Supabase RLS is the final write gate.
     for(const control of [btn,save,del])if(control){control.hidden=!admin;control.style.display=admin?'inline-flex':'none';}
     if(panel){if(!admin)panel.hidden=true;panel.style.display=admin&&!panel.hidden?'flex':'none';}
     const nameField=document.getElementById('mp_vendor_name'),removeField=document.getElementById('mp_vendor_delete_select'),status=document.getElementById('mp_vendor_status');
     const openEditor=(target)=>{if(!admin||!panel)return false;const wasHidden=panel.hidden;panel.hidden=false;panel.style.display='flex';(target==='delete'?removeField:nameField)?.focus();return wasHidden;};
     if(btn)btn.onclick=()=>{if(!admin)return;panel.hidden=!panel.hidden;panel.style.display=panel.hidden?'none':'flex';};
     if(save)save.onclick=async()=>{if(!admin)return;if(openEditor('add'))return;const name=nameField?.value.trim().replace(/\s+/g,' ');if(!name){status.textContent='Nhập tên nhà cung cấp rồi nhấn Thêm NCC.';nameField?.focus();return;}
       save.disabled=true;try{await add(name);nameField.value='';status.textContent='Đã thêm nhà cung cấp vào hệ thống.';}catch(e){status.textContent='Không lưu được: '+e.message}finally{save.disabled=false;}};
     if(del)del.onclick=async()=>{if(!admin)return;if(openEditor('delete'))return;const name=removeField?.value;if(!name){status.textContent='Chọn nhà cung cấp cần xóa.';removeField?.focus();return;}
       if(!confirm(`Ngừng sử dụng NCC ${name}? Thực đơn lịch sử vẫn được lưu trên Supabase.`))return;
       del.disabled=true;try{await deactivate(name);status.textContent='Đã ngừng sử dụng NCC. Thực đơn lịch sử được giữ nguyên.';}catch(e){status.textContent='Không xóa được: '+e.message}finally{del.disabled=false;}};
   }
   const frame=document.getElementById('mealMonitor182Frame');try{frame?.contentWindow?.postMessage('ktx-vendors-updated','*')}catch(_){}
 }
 async function load(force=false){if(loading)return loading;if(!force&&Date.now()-lastLoad<30000&&ready)return NCCS;
   const b=window.KTX_MEAL_BRIDGE,client=b&&b.client;if(!client){if(force)ready=false;return NCCS;}
   loading=(async()=>{const {data,error}=await client.from('ktx_meal_vendors').select('name,is_active').order('name',{ascending:true});
     if(error){ready=false;console.warn('V2.0.91: cần chạy SQL danh mục NCC:',error.message);return NCCS;}
     const activeRows=(data||[]).filter(item=>item&&item.is_active!==false&&String(item.name||'').trim()&&!retired.has(norm(item.name)));
     const nextActive=new Set(activeRows.map(item=>norm(item.name)));
     cloudActive.clear();for(const name of nextActive)cloudActive.add(name);
     inactive.clear();for(const item of data||[])if(item&&item.is_active===false)inactive.add(norm(item.name));
     // Remove bundled defaults absent from Cloud as well as explicitly inactive NCC.
     // Only hide vendor choices; historical meal records on Supabase are untouched.
     for(let i=NCCS.length-1;i>=0;i--)if(!nextActive.has(norm(NCCS[i]))){
       if(typeof RP!=='undefined')RP.on?.delete(NCCS[i]);NCCS.splice(i,1);
     }
     ready=true;
     for(const item of activeRows)register(item.name);
     lastLoad=Date.now();refresh();return NCCS;
   })().finally(()=>{loading=null});return loading;}
 async function add(name){const b=window.KTX_MEAL_BRIDGE;if(!b?.client||!b.session?.user)throw Error('Cần đăng nhập Supabase.');if(String(b.role).toLowerCase()!=='admin')throw Error('Chỉ quản trị viên được thêm NCC.');
   name=String(name||'').trim().replace(/\s+/g,' ');if(!name||name.length>120)throw Error('Tên NCC không hợp lệ.');if(retired.has(norm(name)))throw Error('NCC này đã được ngừng sử dụng.');
   const {error}=await b.client.from('ktx_meal_vendors').upsert({name,is_active:true,updated_at:new Date().toISOString()},{onConflict:'name'});
   if(error)throw Error(error.message);cloudActive.add(norm(name));inactive.delete(norm(name));register(name);refresh();return name;}
 async function deactivate(name){const b=window.KTX_MEAL_BRIDGE;if(!b?.client||!b.session?.user)throw Error('Cần đăng nhập Supabase.');if(String(b.role).toLowerCase()!=='admin')throw Error('Chỉ quản trị viên được xóa NCC.');const found=NCCS.find(x=>norm(x)===norm(name));if(!found)throw Error('Không tìm thấy NCC.');const {data,error}=await b.client.from('ktx_meal_vendors').update({is_active:false,updated_at:new Date().toISOString()}).eq('name',found).select('name');if(error)throw Error(error.message);if(!data?.length)throw Error('Không có quyền cập nhật NCC.');inactive.add(norm(found));cloudActive.delete(norm(found));NCCS.splice(NCCS.indexOf(found),1);RP?.on?.delete(found);if(typeof RP!=='undefined'&&RP.f)delete RP.f[found];refresh();return true;}
 window.KTX_VENDOR_CATALOG={register,refresh,load,add,deactivate,isReady:()=>ready,isActive:name=>allowed(name)&&(!ready||cloudActive.has(norm(name))),activeNames:()=>typeof NCCS==='undefined'?[]:NCCS.filter(n=>allowed(n)&&(!ready||cloudActive.has(norm(n))))};
 document.addEventListener('click',e=>{if(e.target.closest('#mealMonitor182, #mp_vendor_manage'))load().catch(console.warn)},true);
})();
