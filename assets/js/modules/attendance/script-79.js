/* v1.0.56: QR approve tables keep only Sửa / Duyệt / Từ chối.
   New rows after asynchronous refresh are sanitized as well. */
(function(){
 'use strict';
 function clean(){
   const qr=document.getElementById('qr');if(!qr)return;
   qr.querySelectorAll('.qr-review-in table tr,.qr-review-out table tr').forEach(tr=>{
     const cell=tr.lastElementChild;if(!cell||!cell.querySelector('button'))return;
     Array.from(cell.querySelectorAll('button')).forEach(btn=>{
       if(btn.textContent.trim()==='Xóa')btn.remove();
     });
     const row=cell.querySelector('.qr50-action-row');
     if(row){row.style.display='flex';row.style.flexWrap='nowrap';row.style.alignItems='center';row.style.gap='6px';}
   });
 }
 document.addEventListener('DOMContentLoaded',()=>{
   const qr=document.getElementById('qr');if(!qr)return;
   let queued=false;
   const watch=new MutationObserver(()=>{
     if(queued)return;queued=true;
     requestAnimationFrame(()=>{queued=false;clean()});
   });
   watch.observe(qr,{childList:true,subtree:true});
   clean();
 });
})();
