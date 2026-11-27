/* KTX Menu Excel resilient draft v4. Draft is device-only, not proof of Cloud success.
 * Safe retry is intentionally INSERT-ONLY for missing menu rows; existing rows never overwritten.
 */
(function(){
 'use strict';
 const DB='ktx_menu_import_drafts_v4',ST='drafts';
 const currentActor=()=>{try{return String(window.KTX_DEVICE_QUEUE_ACTOR?.()||'')}catch(_){return ''}};
 const cloud=()=>typeof syncClient==='function'?syncClient():null;
 let dbPromise=null;
 function open(){
  if(!window.indexedDB)throw Error('Trình duyệt không hỗ trợ IndexedDB');
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB,1);
   req.onupgradeneeded=()=>req.result.createObjectStore(ST,{keyPath:'id'});
   req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();dbPromise=null};resolve(req.result)};
   req.onerror=()=>reject(req.error||Error('Không mở được bộ nhớ'));
   req.onblocked=()=>reject(Error('Bộ nhớ đang mở tại tab khác'));
  }).catch(e=>{dbPromise=null;throw e});
  return dbPromise;
 }
 async function transaction(mode,work){
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(ST,mode),store=tx.objectStore(ST);let result;
   try{work(store,v=>{result=v})}catch(e){try{tx.abort()}catch(_){}reject(e);return}
   tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }
 const all=()=>transaction('readonly',(os,set)=>{os.getAll().onsuccess=e=>set(e.target.result||[])});
 const put=v=>transaction('readwrite',os=>os.put(v));
 const del=id=>transaction('readwrite',os=>os.delete(id));
 const filter=async()=>{const a=currentActor();return a?(await all()).filter(x=>x.actor===a):[]};
 function validate(r){
  if(!/^\d{4}-\d\d-\d\d$/.test(r?.date||'')||!['sang','trua','chieu'].includes(r.period)||!['man','chay'].includes(r.kind)||typeof r.vendor!=='string'||!r.vendor||r.vendor.length>120||!Array.isArray(r.dishes)||!r.dishes.length||r.dishes.length>100||r.dishes.some(d=>typeof d!=='string'||!d.trim()||d.length>400))throw Error('Bảng thực đơn không hợp lệ.');
 }
 async function stage(rows){
  if(!Array.isArray(rows)||!rows.length||rows.length>300)throw Error('Mỗi lần chỉ lưu tối đa 300 bảng thực đơn.');
  rows.forEach(validate);
  const actor=currentActor();if(!actor)throw Error('Cần đăng nhập để lưu bản nháp.');
  const snapshot=rows.map(r=>({date:r.date,period:r.period,vendor:r.vendor,kind:r.kind,dishes:r.dishes.slice()}));
  if(JSON.stringify(snapshot).length>1500000)throw Error('Dữ liệu Excel vượt giới hạn 1,5 MB cho mỗi lần nhập.');
  const id='menu-'+((window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));
  const item={id,actor,rows:snapshot,createdAt:Date.now(),status:'pending',message:'Bản nháp trên thiết bị; chưa xác nhận Cloud.'};
  await put(item);return id;
 }
 function sameDishes(remote,source){
  if(!Array.isArray(remote)||remote.length!==source.length)return false;
  return source.every((s,i)=>String(remote[i]?.name||'').trim()===String(s).trim() &&
   // A pre-existing curated standard is acceptable for imported menu rows.
   !!String(remote[i]?.standard||''));
 }
 async function retry(id){
  const actor=currentActor(),draft=(await all()).find(x=>x.id===id&&x.actor===actor);
  if(!actor||!draft)throw Error('Không tìm thấy bản nháp của tài khoản hiện tại.');
  const client=cloud();if(!client)throw Error('Chưa kết nối Supabase.');
  const auth=await client.auth.getUser();if(auth.error||auth.data?.user?.id!==actor)throw Error('Phiên Cloud chưa hợp lệ.');
  if(typeof ME==='undefined'||!['admin','manager'].includes(ME.role))throw Error('Không đủ quyền nhập thực đơn.');
  const remain=[],issues=[];let verified=0,added=0;
  for(const row of draft.rows){
   try{
    validate(row);
    const q=()=>client.from('ktx_meal_menus').select('dishes').eq('meal_date',row.date).eq('meal_period',row.period).eq('vendor',row.vendor).eq('menu_type',row.kind).maybeSingle();
    let result=await q();if(result.error)throw result.error;
    if(result.data){
     if(!sameDishes(result.data.dishes,row.dishes))throw Error('Thực đơn trên Cloud khác bản nháp; cần đối soát, không ghi đè.');
     verified++;continue;
    }
    const dishes=row.dishes.map(name=>({name:String(name),standard:typeof mealStandard186==='function'?mealStandard186(name):'Chưa có định lượng trong file Excel'}));
    // INSERT deliberately avoids overwriting another machine's existing menu.
    result=await client.from('ktx_meal_menus').insert({meal_date:row.date,meal_period:row.period,vendor:row.vendor,menu_type:row.kind,dishes,updated_at:new Date().toISOString(),updated_by:actor});
    if(result.error)throw result.error;
    result=await q();if(result.error||!sameDishes(result.data?.dishes,row.dishes))throw Error('Cloud chưa xác nhận bản thực đơn vừa thêm.');
    verified++;added++;
   }catch(e){remain.push(row);issues.push(`${row.vendor} ${row.date} ${row.period} ${row.kind}: ${String(e?.message||e)}`)}
  }
  if(!remain.length)await del(id);
  else await put({...draft,rows:remain,status:'review',message:`Cần đối soát ${remain.length} bảng. ${issues.slice(0,3).join('; ')}`});
  return {verified,added,review:remain.length,issues};
 }
 async function status(){const rows=await filter();return {count:rows.length,rows:rows.map(x=>({id:x.id,count:x.rows.length,status:x.status,message:x.message,createdAt:x.createdAt}))}}
 window.KTX_MENU_DRAFTS_V4=Object.freeze({stage,retry,status,remove:async id=>{const a=currentActor(),v=(await all()).find(x=>x.id===id);if(!a||v?.actor!==a)throw Error('Không có quyền xóa bản nháp');await del(id)}});
})();
