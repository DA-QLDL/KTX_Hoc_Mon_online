
(function(){
  if(typeof window==='undefined') return;
  // Sau khi bảng Tạm trú/Tạm vắng render: bỏ click/double click mở hồ sơ và sửa đúng ngày hiển thị.
  if(typeof tl==='function'){
    const __tlStep16=tl;
    tl=function(){
      __tlStep16();
      try{
        const rows=[...document.querySelectorAll('#tl table tr')].slice(1);
        const L=typeof tfl==='function'?tfl():[];
        const sh=L.slice(0,200);
        rows.forEach((r,i)=>{
          const w=sh[i];
          r.onclick=null;r.ondblclick=null;r.onkeydown=null;r.removeAttribute('tabindex');r.removeAttribute('title');
          if(!w)return;
          const cells=r.querySelectorAll('td');
          if(!cells.length)return;
          // Ngày đăng ký phải là ngày thực tế đã lưu, không dùng ngày hiện tại cho mọi dòng.
          const raw=(typeof TS!=='undefined'&&TS.tab==='tv')?(w.tv&&(w.tv.reg||w.tv.from)||''):(w.tt||'');
          const c=cells[cells.length-1];
          if(c){
            const d=String(raw||'').slice(0,10);
            c.innerHTML=d?`<span class="pl ro">${vn(d)}</span>`:'—';
            if(typeof TS!=='undefined'&&TS.tab==='tv'&&w.tv){
              c.title='Tạm vắng từ '+vn(w.tv.from)+(w.tv.to?' đến '+vn(w.tv.to):'')+(w.tv.why?': '+w.tv.why:'');
            }else c.removeAttribute('title');
          }
        });
      }catch(e){}
    };
  }
  // Điều chuyển/Nghỉ việc chỉ dùng các nút Khôi phục/Xóa hẳn; không tạo tương tác theo cả dòng.
  if(typeof arcRender==='function'){
    const __arcStep16=arcRender;
    arcRender=function(){
      __arcStep16();
      try{
        document.querySelectorAll('#ar_t table tr').forEach((r,i)=>{
          if(i===0)return;
          r.onclick=null;r.ondblclick=null;r.onkeydown=null;r.removeAttribute('tabindex');r.removeAttribute('title');
        });
      }catch(e){}
    };
  }
})();
