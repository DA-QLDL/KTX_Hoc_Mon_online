
(()=>{
 const n=v=>String(v??'').normalize('NFC').trim().toLocaleLowerCase('vi').replace(/\s+/g,' ');
 const a=v=>Array.isArray(v)?v:typeof v==='string'?v.split(',').map(x=>x.trim()).filter(Boolean):[];
 function getRecords(){
  const all=(window.AUTHC?.accounts||[]).slice();
  if(typeof ME!=='undefined'&&ME.acct&&ME.id&&!all.some(x=>x.user_id===ME.id))all.push({...ME.acct,user_id:ME.id,display_name:ME.name});
  return all;
 }
 function refresh(){
  document.querySelectorAll('#home .ktx-day-owner').forEach(el=>{
   const k=n(el.dataset.ownerKtx),d=n(el.dataset.ownerDay);
   const names=[...new Set(getRecords().filter(x=>x.enabled!==false&&x.role!=='admin'&&a(x.ktx).length&&a(x.days).length&&a(x.ktx).some(v=>n(v)===k)&&a(x.days).some(v=>n(v)===d)).map(x=>String(x.display_name||x.email||'').trim()).filter(Boolean))];
   const b=el.querySelector('.ktx-owner-name');if(b)b.textContent=names.join(', ')||'Chưa phân công';
   el.classList.toggle('unassigned',!names.length);
  });
 }
 window.ktxUpdateDayOwners=refresh;
 if(typeof window.home==='function'){const old=window.home;window.home=function(){const result=old.apply(this,arguments);refresh();return result}}
 if(typeof window.authLoadAdminData==='function'){const old=window.authLoadAdminData;window.authLoadAdminData=async function(){const result=await old.apply(this,arguments);refresh();return result}}
 document.addEventListener('DOMContentLoaded',refresh);
})();
