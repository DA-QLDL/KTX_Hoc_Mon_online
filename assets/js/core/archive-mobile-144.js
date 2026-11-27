(function(){
  // Preserve the archive. Never infer that a stale selection counter represents archive records.
  const previous=window.arcRender;
  if(typeof previous!=='function')return;
  let auditNonce=0;
  function archiveRows(){try{return Array.isArray(ARC)?ARC:[]}catch(e){return []}}
  window.arcRender=function(){
    const a=archiveRows();
    if(typeof AS!=='undefined'&&AS&&typeof AS.delete==='function'){
      const ids=new Set(a.map(x=>String(x.id)));
      for(const id of [...AS])if(!ids.has(String(id)))AS.delete(id);
    }
    let result;
    try{result=previous.apply(this,arguments)}catch(e){console.error('Archive table render failed',e);}
    const root=document.getElementById('ar_t');if(!root)return result;
    if(a.length===0){
      root.innerHTML='<div class="arc44-panel"><strong>Chưa tải được hồ sơ lưu trữ trên thiết bị.</strong><div>Danh sách hiện có 0 hồ sơ. Nếu đã điều chuyển công nhân, cần đối chiếu Supabase và bản sao lưu trước khi kết luận dữ liệu bị mất.</div><button class="btn s sm" id="arc44check" type="button">Kiểm tra Supabase (chỉ đọc)</button><div id="arc44result" role="status"></div></div>';
      const number=document.getElementById('ar_n');if(number){number.textContent='0 / 0 người · đã chọn 0';number.classList.remove('on')}
      const btn=document.getElementById('arc44check');btn.onclick=async()=>{
        const out=document.getElementById('arc44result'),myNonce=++auditNonce;btn.disabled=true;out.textContent='Đang đối chiếu hồ sơ...';
        try{
          const sb=typeof syncClient==='function'?syncClient():null;
          if(!sb)throw Error('Chưa kết nối Supabase.');
          const {count,error}=await sb.from('ktx_archived_workers').select('record_id',{count:'exact',head:true});
          if(error)throw error;
          if(myNonce!==auditNonce)return;
          out.innerHTML='<b>Supabase trả về '+Number(count||0).toLocaleString('vi-VN')+' hồ sơ theo quyền tài khoản.</b><div>'+(count?'Dữ liệu còn trên Cloud. Đề nghị đối chiếu RLS và trạng thái đồng bộ trước khi tải lại.':'Chưa xác định được hồ sơ đã chuyển. Kiểm tra quyền RLS, nhật ký đồng bộ và bản sao lưu, không tự tạo hồ sơ.')+'</div>';
        }catch(e){out.textContent='Không đọc được Cloud: '+(e.message||String(e))}
        finally{btn.disabled=false}
      };
    }
    return result;
  };
})();
