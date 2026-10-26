
/* Lọc trùng chỉ dùng các nút Sửa / Xóa trực tiếp, không mở hồ sơ hay sửa khi bấm vào cả dòng */
(function(){
  if(typeof window==='undefined')return;
  const cleanDupRows=()=>{
    document.querySelectorAll('#r2 table tr').forEach((r,i)=>{
      if(i===0)return;
      r.onclick=null;r.ondblclick=null;r.onkeydown=null;
      r.removeAttribute('tabindex');r.removeAttribute('title');
      r.style.cursor='default';
    });
  };
  const b=document.getElementById('go');
  if(b && !b.dataset.step18){
    b.dataset.step18='1';
    const old=b.onclick;
    b.onclick=function(){const out=old&&old.apply(this,arguments);setTimeout(cleanDupRows,20);return out};
  }
  if(typeof page!=='undefined'&&page==='t2')setTimeout(cleanDupRows,50);
})();
