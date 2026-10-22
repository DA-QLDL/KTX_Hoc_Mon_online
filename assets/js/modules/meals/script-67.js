(function(){
 const sa=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim();
 window.KTX213_PULL_MENUS=async function(date,period){
  const bridge=window.KTX_MEAL_BRIDGE,client=bridge&&bridge.client;
  if(!client)return {ok:false,error:'Chưa kết nối Supabase hoặc chưa đăng nhập.'};
  const rs=await client.from('ktx_meal_menus').select('meal_date,meal_period,vendor,menu_type,dishes').eq('meal_date',date).eq('meal_period',period).limit(1000);
  if(rs.error)return {ok:false,error:rs.error.message};
  const records=rs.data||[];if(typeof MENU==='undefined'||typeof RP==='undefined')return {ok:false,error:'Chưa khởi tạo báo cáo suất ăn.'};
  let changed=0;
  for(const r of records){const n=(typeof NCCS!=='undefined'?NCCS:[]).find(x=>sa(x)===sa(r.vendor));if(!n)continue;
   const k=String(r.menu_type).toLowerCase().includes('chay')?'chay':'man';
   const m=((MENU[n]=MENU[n]||{})[k]=MENU[n][k]||{});
   const d=m[date]||{sang:[],trua:[],chieu:[],q:{sang:[],trua:[],chieu:[]}};
   const dishes=Array.isArray(r.dishes)?r.dishes:[];
   d[period]=dishes.map(x=>String(x.name||x.ten||'').trim()).filter(Boolean);
   d.q=d.q||{};d.q[period]=dishes.map(x=>String(x.standard||x.dl||'').trim());m[date]=d;changed++;
  }
  if(changed){try{localStorage.setItem('ktx_menu',JSON.stringify(MENU))}catch(e){}
   if(typeof mealFill==='function')mealFill();if(typeof mealCards==='function'&&document.getElementById('mp_cards'))mealCards();}
  return {ok:true,count:changed};
 };
})();