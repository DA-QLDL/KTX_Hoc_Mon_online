
(function(){
  if(typeof window==='undefined') return;
  // V2.0.42 FIX3: no residency table/date wrapper; original script-08 handles rows.
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
