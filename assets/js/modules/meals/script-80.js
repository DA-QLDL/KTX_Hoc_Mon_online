/* v1.0.161: meal quantity Cloud persistence across PC/mobile. Does not modify menus. */
(function(){
 'use strict';
 const TABLE='ktx_meal_report_counts', KEYS=['td8','td064','tdme'];
 let pending=new Map(), timer=null, fetchedFor='', request=0, refreshing=false;
 const state=()=>typeof RP!=='undefined'?RP:null;
 const client=()=>typeof syncClient==='function'?syncClient():null;
 const key=()=>{const s=state();return s?s.date+'|'+s.ses:''};
 function notify(msg,error){const id='ktx161MealStatus';let e=document.getElementById(id);if(!e){e=document.createElement('span');e.id=id;e.style.cssText='display:block;font-size:12px;margin:8px 0;color:#45658e';const cards=document.getElementById('mp_cards');if(cards)cards.parentNode.insertBefore(e,cards);else return;}e.style.color=error?'#b42336':'#45658e';e.textContent=msg;}
 function valid(v){if(v===''||v==null)return null;const n=Number(v);if(!Number.isSafeInteger(n)||n<0)throw Error('Số suất phải là số nguyên không âm');return n;}
 async function fetchCounts(force=false){const s=state(), sb=client();if(!s||!sb)return false;const current=key();if(!force&&fetchedFor===current)return true;const token=++request;
   const {data,error}=await sb.from(TABLE).select('vendor,td8,td111,td113,tdme').eq('meal_date',s.date).eq('meal_period',s.ses);
   if(error){notify('Chưa tải được số suất Cloud: '+error.message,true);return false}
   if(token!==request||current!==key())return false;
   s.f=s.A[current]=s.A[current]||{};
   for(const row of data||[]){const f=s.f[row.vendor]=s.f[row.vendor]||{};
     if(pending.has(current+'|'+row.vendor))continue;
     f.td8=row.td8??'';f.tdme=row.tdme??'';
     // Giữ nguyên tổng số liệu hai cột cũ khi mở trên PC/Mobile.
     f.td064=(row.td111==null&&row.td113==null)?'':Number(row.td111||0)+Number(row.td113||0);
     f.td111=row.td111??'';f.td113=row.td113??'';
   }
   fetchedFor=current;
   if(typeof mealCards==='function'&&document.getElementById('mp_cards'))mealCards();
   document.querySelectorAll('[data-meal-vendor][data-meal-key]').forEach(input=>{
     if(document.activeElement===input)return;
     const f=s.f[input.dataset.mealVendor]||{};
     if(KEYS.includes(input.dataset.mealKey))input.value=f[input.dataset.mealKey]??'';
   });
   document.querySelectorAll('[data-total-ncc]').forEach(el=>{if(typeof mealTot==='function')el.textContent=mealTot(el.dataset.totalNcc)??0});
   const preview=document.getElementById('m195Preview');if(preview&&typeof mealText==='function')preview.textContent=mealText();
   notify('Đã tải số suất từ Supabase.');return true;
 }
 async function flush(){clearTimeout(timer);timer=null;if(refreshing||!pending.size)return;const entries=[...pending.values()];pending.clear();const sb=client();if(!sb){entries.forEach(x=>pending.set(x.id,x));notify('Chưa kết nối Cloud: chưa lưu số suất.',true);return;}
  refreshing=true;try{
   const {data:{user},error:authErr}=await sb.auth.getUser();if(authErr||!user)throw Error('Phiên đăng nhập chưa hợp lệ');
   for(const entry of entries){const f=state()?.A?.[entry.day]?.[entry.vendor]||{};
    const row={meal_date:entry.day.split('|')[0],meal_period:entry.day.split('|')[1],vendor:entry.vendor,td8:valid(f.td8),td111:valid(typeof meal064Value==='function'?meal064Value(f):f.td064),td113:null,tdme:valid(f.tdme),updated_by:user.id,updated_at:new Date().toISOString()};
    const {error}=await sb.from(TABLE).upsert(row,{onConflict:'meal_date,meal_period,vendor'});
    if(error)throw Error(entry.vendor+': '+error.message);
   }
   notify('Đã lưu số suất lên Supabase.');
  }catch(err){entries.forEach(x=>pending.set(x.id,x));notify('Chưa lưu số suất: '+(err.message||err),true)}finally{refreshing=false;}
 }
 function schedule(vendor){const day=key();if(!day||!vendor)return;const id=day+'|'+vendor;pending.set(id,{id,day,vendor});clearTimeout(timer);timer=setTimeout(flush,750)}
 document.addEventListener('input',event=>{
  const e=event.target;if(!e||!e.dataset)return;
  if(e.matches('[data-meal-vendor][data-meal-key]')){if(KEYS.includes(e.dataset.mealKey))schedule(e.dataset.mealVendor);return;}
  if(e.matches('#mp_cards [data-f]')&&KEYS.includes(e.dataset.f)){const vendor=e.closest('[data-n]')?.dataset.n;if(vendor)schedule(vendor)}
 },true);
 const originalSwitch=typeof mealSwitch==='function'?mealSwitch:null;
 if(originalSwitch)window.mealSwitch=function(){fetchedFor='';const v=originalSwitch.apply(this,arguments);fetchCounts(true).catch(console.warn);return v};
 const originalMeal=typeof mealPage==='function'?mealPage:null;
 if(originalMeal)window.mealPage=function(){const v=originalMeal.apply(this,arguments);fetchCounts(true).catch(console.warn);return v};
 setInterval(()=>{const s=state();if(!s)return;const visible=document.getElementById('mp_cards')?.offsetParent!==null||document.querySelector('#m195Date');if(visible&&key()!==fetchedFor&&!refreshing)fetchCounts().catch(console.warn)},2200);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(pending.size)flush();fetchCounts(true).catch(console.warn)}});
 window.KTX161_MEAL_COUNTS={fetch:()=>fetchCounts(true),flush};
})();
