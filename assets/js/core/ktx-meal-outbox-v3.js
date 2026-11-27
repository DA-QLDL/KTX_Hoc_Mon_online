/* Meal counts device outbox v3. Stores numeric counts only, never worker/PII data.
 * Cloud remains authoritative. Conditional writes protect against intervening updates.
 */
(function(){
 'use strict';
 const KIND='meal-count',TABLE='ktx_meal_report_counts';
 const Q=()=>window.KTX_DEVICE_QUEUE;
 const actor=()=>{try{return String(window.KTX_DEVICE_QUEUE_ACTOR?.()||'')}catch(_){return ''}};
 const sb=()=>typeof syncClient==='function'?syncClient():null;
 const normalize=v=>v===''||v===null||v===undefined?null:Number(v);
 const signature=r=>JSON.stringify([r?.td8??null,r?.td111??null,r?.td113??null,r?.tdme??null].map(normalize));
 const id=p=>[p.date,p.period,p.vendor].join('|');
 let cloudBases=new Map(),loadedPeriods=new Set(),pumpTimer=null,stageChain=Promise.resolve();
 function valid(p){
  if(!/^\d{4}-\d\d-\d\d$/.test(String(p.date||''))||!['sang','trua','chieu'].includes(p.period)||!p.vendor||String(p.vendor).length>120)throw Error('Thiếu ngày, buổi hoặc NCC.');
  for(const k of ['td8','td111','td113','tdme']){const n=p[k];if(n!==null&&(!Number.isSafeInteger(n)||n<0))throw Error('Số suất phải là số nguyên không âm.');}
 }
 function same(r,p){return signature(r)===signature(p)}
 function keepBase(date,period,rows){
  loadedPeriods.add(date+'|'+period);
  const prefix=date+'|'+period+'|';
  for(const k of cloudBases.keys())if(k.startsWith(prefix))cloudBases.delete(k);
  for(const r of rows||[])if(r.vendor)cloudBases.set(prefix+r.vendor,signature(r));
 }
 async function drafts(date,period){
  const a=actor();if(!a||!Q())return new Map();
  const all=(await Q().list(KIND)).filter(j=>j.actor===a&&j.payload?.date===date&&j.payload?.period===period);
  const map=new Map();for(const j of all.sort((x,y)=>(x.updatedAt||x.createdAt||0)-(y.updatedAt||y.createdAt||0))){
   if(['pending','sending','review','failed'].includes(j.status))map.set(j.payload.vendor,j);
  }
  return map;
 }
 async function stageInner(p){
  valid(p);const a=actor(),q=Q();
  if(!a||!q)throw Error('Cần đăng nhập trước khi lưu số suất trên thiết bị.');
  const record=id(p),existing=(await q.list(KIND)).filter(j=>j.actor===a&&j.payload?.date===p.date&&j.payload?.period===p.period&&j.payload?.vendor===p.vendor).sort((x,y)=>(y.updatedAt||0)-(x.updatedAt||0))[0];
  const baseSignature=existing?.payload?.baseSignature??cloudBases.get(record)??(loadedPeriods.has(p.date+'|'+p.period)?'__ABSENT__':'__UNKNOWN__');
  const payload={...p,baseSignature};
  // Coalesce pending draft edits. Never rewrite an in-flight or uncertain Cloud job.
  if(existing?.status==='pending'){
   await q.put({...existing,payload,updatedAt:Date.now(),nextAt:0});
  }else if(existing){
   const revision=(typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);
   await q.enqueue(KIND,'upsert',record+'|revision:'+revision,a,payload);
  }else await q.enqueue(KIND,'upsert',record,a,payload);
  schedulePump();return true;
 }
 function stage(p){const snapshot={...p};const next=stageChain.catch(()=>{}).then(()=>stageInner(snapshot));stageChain=next;return next;}
 function schedulePump(){clearTimeout(pumpTimer);pumpTimer=setTimeout(()=>{const a=actor();if(a&&Q())Q().pump(a).catch(console.warn)},1300)}
 async function process(job){
  const client=sb(),a=actor(),p=job.payload;
  if(!client||!a||job.actor!==a)throw Error('Không có phiên Cloud hợp lệ.');
  valid(p);
  const auth=await client.auth.getUser();if(auth.error||auth.data?.user?.id!==a)throw Error('Phiên đăng nhập đã thay đổi.');
  const query=()=>client.from(TABLE).select('td8,td111,td113,tdme,updated_at,updated_by').eq('meal_date',p.date).eq('meal_period',p.period).eq('vendor',p.vendor).maybeSingle();
  let result=await query();if(result.error)throw result.error;
  if(result.data&&same(result.data,p)){cloudBases.set(id(p),signature(result.data));return {cloudVerified:true};}
  const remoteSig=result.data?signature(result.data):'__ABSENT__';
  if(remoteSig!==p.baseSignature){return {cloudVerified:false,safeToRetry:false};}
  const row={meal_date:p.date,meal_period:p.period,vendor:p.vendor,td8:p.td8,td111:p.td111,td113:p.td113,tdme:p.tdme,updated_by:a,updated_at:new Date().toISOString()};
  // Never use unconditional UPSERT after preflight. Another PC/mobile can change
  // the row between the SELECT above and our write. Match the previous values
  // in the UPDATE predicate so PostgreSQL checks them atomically at write time.
  if(result.data){
   const old=result.data;
   let mutation=client.from(TABLE).update({td8:row.td8,td111:row.td111,td113:row.td113,tdme:row.tdme,updated_by:a,updated_at:row.updated_at})
    .eq('meal_date',p.date).eq('meal_period',p.period).eq('vendor',p.vendor);
   for(const column of ['td8','td111','td113','tdme','updated_at','updated_by']){
    const prior=old[column];
    mutation=prior===null||prior===undefined?mutation.is(column,null):mutation.eq(column,prior);
   }
   const written=await mutation.select('td8,td111,td113,tdme');
   if(written.error)throw written.error;
   // 0 updated rows: a concurrent change, RLS restriction or deleted record.
   // Do not auto-retry; the user must reconcile the Cloud version.
   if(!Array.isArray(written.data)||written.data.length!==1||!same(written.data[0],p))
    return {cloudVerified:false,safeToRetry:false};
  }else{
   // Insert only when absent. A simultaneous insert must fail on the unique
   // (meal_date,meal_period,vendor) constraint rather than overwrite it.
   const written=await client.from(TABLE).insert(row).select('td8,td111,td113,tdme');
   if(written.error){
    if(String(written.error.code||'')==='23505')return {cloudVerified:false,safeToRetry:false};
    throw written.error;
   }
   if(!Array.isArray(written.data)||written.data.length!==1||!same(written.data[0],p))
    return {cloudVerified:false,safeToRetry:false};
  }
  const verified=await query();if(verified.error)throw verified.error;
  if(!verified.data||!same(verified.data,p))return {cloudVerified:false,safeToRetry:false};
  cloudBases.set(id(p),signature(verified.data));
  window.KTX161_MEAL_COUNTS?.fetchDay?.().catch(()=>{});
  return {cloudVerified:true};
 }
 if(Q())Q().register(KIND,process);
 window.KTX_MEAL_OFFLINE=Object.freeze({stage,drafts,keepBase,signature,schedulePump});
})();
