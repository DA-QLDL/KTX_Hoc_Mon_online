
// QLKTX V46: privileged, read-only account export; never return password or password hashes.
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return res.status(405).json({error:'Chỉ hỗ trợ GET'});
  const base=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const service=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
  if(!base||!service)return res.status(503).json({error:'Vercel thiếu cấu hình kết nối Supabase.'});
  const bearer=/^Bearer\s+(.+)$/i.exec(String(req.headers.authorization||''))?.[1];
  if(!bearer)return res.status(401).json({error:'Phiên đăng nhập không hợp lệ.'});
  const serviceHeaders={apikey:service,Authorization:'Bearer '+service};
  const read=async(url,headers)=>{
    const response=await fetch(url,{headers,cache:'no-store'});
    const payload=await response.json().catch(()=>null);
    if(!response.ok)throw Object.assign(new Error('Supabase trả lỗi HTTP '+response.status),{code:response.status});
    return payload;
  };
  try{
    const me=await read(base+'/auth/v1/user',{apikey:service,Authorization:'Bearer '+bearer});
    if(!me?.id)return res.status(401).json({error:'Phiên Supabase không hợp lệ.'});
    const who=await read(base+'/rest/v1/app_accounts?user_id=eq.'+encodeURIComponent(me.id)+'&select=role,enabled',serviceHeaders);
    if(!Array.isArray(who)||who.length!==1||who[0].role!=='admin'||who[0].enabled!==true)return res.status(403).json({error:'Chỉ tài khoản Quản trị đang hoạt động được xuất danh sách.'});
    const fields='user_id,email,display_name,role,ktx,days,enabled,created_at,updated_at,last_login_at';
    const fallback='user_id,email,display_name,role,ktx,days,enabled,created_at,updated_at';
    const getPage=async(offset,columns)=>read(base+'/rest/v1/app_accounts?select='+encodeURIComponent(columns)+'&order=created_at.asc.nullslast,user_id.asc&offset='+offset+'&limit=500',serviceHeaders);
    let columns=fields;
    try{await getPage(0,columns)}catch(error){if(error.code!==400)throw error;columns=fallback;await getPage(0,columns)}
    const accounts=[];
    for(let offset=0;offset<100000;offset+=500){
      const page=await getPage(offset,columns);
      if(!Array.isArray(page))throw new Error('Phản hồi tài khoản không hợp lệ.');
      for(const a of page)accounts.push({user_id:a.user_id||'',email:a.email||'',display_name:a.display_name||'',role:a.role||'',ktx:Array.isArray(a.ktx)?a.ktx:[],days:Array.isArray(a.days)?a.days:[],enabled:a.enabled===true,created_at:a.created_at||'',updated_at:a.updated_at||'',last_login_at:a.last_login_at||''});
      if(page.length<500)break;
      if(offset>=99500)throw new Error('Danh sách vượt giới hạn an toàn, cần xuất theo lô.');
    }
    return res.status(200).json({ok:true,accounts});
  }catch(error){console.error('[V46 account export]',error?.message);return res.status(502).json({error:'Không đọc được danh sách tài khoản từ Supabase. Vui lòng thử lại.'})}
};
