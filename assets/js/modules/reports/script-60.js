
(function(){
 function init(){
  if(!document.getElementById('incident152')){
   const el=document.createElement('section');el.id='incident152';el.className='hide';el.innerHTML=`<div class="incident152-actions"><button class="btn s" type="button" id="incident152Back">← Quay lại Tiện ích</button><b>Biên bản sự vụ</b></div><div class="incident152-shell"><iframe title="Ứng dụng Biên bản sự vụ" id="incident152Frame" loading="lazy" src="./bien-ban-su-vu.html"></iframe><p class="incident152-note">Biên bản sự vụ được tách riêng dữ liệu trong trình duyệt; chưa tự đồng bộ lên Supabase. Kiểm tra số liệu và mẫu Word trước khi ký.</p></div>`;
   document.querySelector('main').appendChild(el);
   document.getElementById('incident152Back').onclick=()=>window.go('utilhub');
  }
  if(typeof T!=='undefined'&&!T.incident152)T.incident152=['Biên bản sự vụ','Lập biên bản, lựa chọn phương án xử lý, tính tiền và xuất Word'];
  if(typeof GN!=='undefined')GN.incident152='Tiện ích';
  const hub=document.getElementById('utilhub');
  if(hub&&!hub.querySelector('[data-util-go="incident152"]')){
   const grid=hub.querySelector('.sysfunc-grid');if(grid){
    const btn=document.createElement('button');btn.type='button';btn.className='sysfunc-btn sf-purple';btn.dataset.utilGo='incident152';btn.innerHTML='<span class="sficon"><svg class="i"><use href="#i-log"></use></svg></span><span><b>Biên bản sự vụ</b><small>Lập biên bản, xử lý vi phạm và tải Word.</small></span>';btn.onclick=()=>window.go('incident152');grid.appendChild(btn);
   }
  }
 }
 const baseGo=window.go;
 window.go=function(page){
  init();
  if(page==='incident152'){
    document.body.dataset.page=page;
    if(typeof T!=='undefined')Object.keys(T).forEach(k=>{let e=document.getElementById(k);if(e)e.classList.toggle('hide',k!==page)});
    const element=document.getElementById('incident152');element.classList.remove('hide');
    const t=document.getElementById('ttl'), sub=document.getElementById('sub'), eb=document.getElementById('eb');
    if(t)t.textContent='Biên bản sự vụ';if(sub)sub.textContent='Công cụ lập biên bản KTX';if(eb)eb.textContent='TIỆN ÍCH';
    const tools=document.getElementById('tools');if(tools)tools.classList.add('hide');
    document.querySelectorAll('nav button[data-p]').forEach(b=>b.classList.remove('on'));
    window.scrollTo(0,0);return;
  }
  document.getElementById('incident152')?.classList.add('hide');
  const result=baseGo.apply(this,arguments);
  init();return result;
 };
 window.addEventListener('DOMContentLoaded',init);
})();
