(function(){
  if(typeof window.arcRender!=='function')return;
  const previous=window.arcRender;
  window.arcRender=function(){const result=previous.apply(this,arguments);const box=document.getElementById('ar_t');if(!box)return result;
    const archive=typeof ARC!=='undefined'&&Array.isArray(ARC)?ARC:[];
    if(archive.length)return result;
    const panel=document.createElement('div');panel.className='archive36-diagnostic';
    panel.innerHTML='<b>Chưa có hồ sơ lưu trữ đang hiển thị.</b><div>Đây là số liệu hiện có trên máy, không có nghĩa hồ sơ đã bị xóa khỏi Supabase. Kiểm tra Cloud trước khi import, khôi phục hoặc xóa dữ liệu.</div><button type="button" class="btn s sm" id="archive36Check">Kiểm tra Cloud (chỉ đọc)</button><div id="archive36Result" role="status"></div>';
    box.appendChild(panel);
    const btn=panel.querySelector('#archive36Check');btn.onclick=async()=>{const target=panel.querySelector('#archive36Result');btn.disabled=true;target.textContent='Đang đọc số lượng hồ sơ...';try{
      const client=typeof syncClient==='function'?syncClient():null;
      if(!client)throw new Error('Chưa có kết nối Supabase.');
      const {count,error}=await client.from('ktx_archived_workers').select('record_id',{count:'exact',head:true});
      if(error)throw error;
      target.textContent='Supabase trả về '+Number(count||0).toLocaleString('vi-VN')+' hồ sơ theo quyền đọc của tài khoản. '+(count?'Hồ sơ đang có trên Cloud; hãy kiểm tra quyền RLS hoặc trạng thái đồng bộ.':'Nếu từng có hồ sơ, hãy kiểm tra quyền RLS và bản sao lưu trước khi kết luận dữ liệu đã mất.');
    }catch(e){target.textContent='Không đọc được Cloud: '+(e&&e.message||e)}finally{btn.disabled=false}};
    return result;
  };
})();
