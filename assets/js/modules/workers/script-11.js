
(function(){
 if(typeof window==='undefined')return;
 const safeView=w=>{if(w&&typeof view==='function'){view(w);setTimeout(()=>{const q=document.getElementById('vquick');if(q&&typeof page!=='undefined'&&page!=='work')q.classList.add('hide')},0)}};
 const safeEdit=w=>{if(!w)return;if(typeof can==='function'&&can('editw',w)&&typeof edit==='function')edit(w);else safeView(w)};
 function bindRows(scope,items,getW,opts={}){
   const root=document.querySelector(scope);if(!root)return;
   const rows=[...root.querySelectorAll('table tr')].slice(1);
   rows.forEach((r,i)=>{
     const item=items[i];if(!item)return;const w=getW(item,i);if(!w)return;
     r.tabIndex=0;r.title='Bấm 1 lần để xem chi tiết · Bấm đúp để sửa nhanh';
     r.onclick=e=>{if(e.target.closest('input,button,a,label,select,textarea'))return;const txt=window.getSelection?String(window.getSelection()):'';if(txt&&txt.trim())return;safeView(w);if(opts.afterView)opts.afterView(item,w)};
     r.ondblclick=e=>{if(e.target.closest('input,button,a,label,select,textarea'))return;safeEdit(w)};
     r.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('input,button')){e.preventDefault();safeView(w);if(opts.afterView)opts.afterView(item,w)}};
   });
 }
 // Tạm trú/tạm vắng
 if(typeof tl==='function'){
   const _tl=tl;tl=function(){_tl();try{const L=tfl(),sh=L.slice(0,200);bindRows('#tl',sh,x=>x)}catch(e){}};
 }
 // Điều chuyển / nghỉ việc + menu thao tác nhanh phù hợp ngữ cảnh lưu trữ
 if(typeof arcRender==='function'){
   const _ar=arcRender;arcRender=function(){_ar();try{const L=arcFlt(),sh=L.slice(0,300);bindRows('#ar_t',sh,a=>a.w);}catch(e){}};
 }
 function enhanceToolTable(kind){
   try{
     if(kind==='dup'&&window.OUT&&OUT.rows&&OUT.Z){const items=OUT.rows.slice(0,400);bindRows('#r2',items,r=>{const o=OUT.Z[r.i];return o&&o.wi!==undefined?W[o.wi]:null});}
     if(kind==='split'&&window.AD){bindRows('#r3',AD.slice(0,200),r=>r.o&&r.o.wi!==undefined?W[r.o.wi]:null);}
     if(kind==='merge'&&window.MG){bindRows('#r4',MG.slice(0,200),r=>r.o&&r.o.wi!==undefined?W[r.o.wi]:null);}
   }catch(e){}
 }
 ['go','go3','go4'].forEach((id,idx)=>{const b=document.getElementById(id);if(!b||b.dataset.ux9)return;b.dataset.ux9='1';const old=b.onclick;b.onclick=function(){const r=old&&old.apply(this,arguments);setTimeout(()=>enhanceToolTable(idx===0?'dup':idx===1?'split':'merge'),0);return r};});
 // render immediately when current pages already open
 setTimeout(()=>{try{if(typeof page!=='undefined'&&page==='t6'&&typeof tl==='function')tl();if(typeof page!=='undefined'&&page==='arc'&&typeof arcRender==='function')arcRender()}catch(e){}},0);
})();
