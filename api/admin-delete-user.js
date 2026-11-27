// STEP223: authenticated privileged deletion. No service key may be exposed to browser.
module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const base=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
  if(!base||!key)return res.status(503).json({error:'Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trên Vercel.'});
  const bearer=(req.headers.authorization||'').match(/^Bearer\s+(.+)$/i)?.[1];
  const id=req.body?.user_id;
  if(!bearer||typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))return res.status(400).json({error:'Thiếu phiên đăng nhập hoặc user_id không hợp lệ.'});
  const adminHeaders={'apikey':key,'Authorization':'Bearer '+key};
  const getJson=async(url,headers)=>{const r=await fetch(url,{headers});return {ok:r.ok,status:r.status,data:await r.json().catch(()=>null)}};
  try{
    const me=await getJson(base+'/auth/v1/user',{'apikey':key,'Authorization':'Bearer '+bearer});
    if(!me.ok||!me.data?.id)return res.status(401).json({error:'Phiên đăng nhập không hợp lệ.'});
    if(me.data.id===id)return res.status(403).json({error:'Không thể xóa tài khoản đang đăng nhập.'});
    const acct=await getJson(base+'/rest/v1/app_accounts?user_id=eq.'+encodeURIComponent(me.data.id)+'&select=role,enabled',adminHeaders);
    if(!acct.ok||acct.data?.[0]?.role!=='admin'||acct.data?.[0]?.enabled!==true)return res.status(403).json({error:'Chỉ Quản trị đang hoạt động được xóa tài khoản.'});
    const target=await getJson(base+'/rest/v1/app_accounts?user_id=eq.'+encodeURIComponent(id)+'&select=user_id,role',adminHeaders);
    if(!target.ok||!target.data?.length)return res.status(404).json({error:'Không tìm thấy tài khoản cần xóa.'});
    if(target.data[0].role==='admin'){
      const admins=await getJson(base+'/rest/v1/app_accounts?role=eq.admin&enabled=eq.true&select=user_id',adminHeaders);
      if(!admins.ok||admins.data?.length<=1)return res.status(409).json({error:'Không thể xóa Quản trị cuối cùng.'});
    }
    // Deleting Supabase Auth user first prevents future login. app_accounts may cascade via FK.
    const removeAuth=await fetch(base+'/auth/v1/admin/users/'+encodeURIComponent(id),{method:'DELETE',headers:adminHeaders});
    if(!removeAuth.ok){const detail=await removeAuth.text();return res.status(removeAuth.status).json({error:'Không xóa được Supabase Auth: '+detail.slice(0,250)});}
    const removeAccount=await fetch(base+'/rest/v1/app_accounts?user_id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{...adminHeaders,'Prefer':'return=minimal'}});
    if(!removeAccount.ok)return res.status(500).json({error:'Đã xóa Auth nhưng còn bản ghi app_accounts. Cần kiểm tra lại trên máy chủ.'});
    return res.status(200).json({ok:true});
  }catch(err){return res.status(500).json({error:'Lỗi máy chủ: '+(err?.message||err)});}
};
