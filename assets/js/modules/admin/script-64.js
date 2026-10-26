(function(){
 const titles={cosovatchat:'Cơ sở vật chất KTX','vs-vpp':'Danh mục dụng vụ VS–VPP','vipham-ncc':'Sổ theo dõi vi phạm NCC',pccc:'Checklist bình PCCC',backup:'Kiểm tra & sao lưu tiện ích'};
 const originalGo=window.go;
 function ensure(slug){let section=document.getElementById('u169_'+slug);if(section)return section;section=document.createElement('section');section.id='u169_'+slug;section.className='hide u169-wrap';section.innerHTML='<div class="u169-head"><button class="btn s" type="button">← Quay lại Tiện ích</button></div><iframe loading="lazy" title="'+titles[slug]+'" src="./'+(slug==='backup'?'kiem-tra-sao-luu':slug)+'.html"></iframe>';document.querySelector('main').append(section);section.querySelector('button').onclick=()=>window.go('utilhub');return section}
 window.go=function(p){Object.keys(titles).forEach(slug=>document.getElementById('u169_'+slug)?.classList.add('hide'));if(p&&p.startsWith('u169_')&&titles[p.slice(5)]){const slug=p.slice(5);originalGo.call(this,'utilhub');document.getElementById('utilhub')?.classList.add('hide');ensure(slug).classList.remove('hide');if(typeof page!=='undefined')page=p;document.getElementById('ttl').textContent=titles[slug];document.getElementById('sub').textContent='Tiện ích quản lý theo biểu mẫu KTX';window.scrollTo(0,0);return}return originalGo.apply(this,arguments)};
})();
/* v1.0.82 – Cơ sở vật chất: liền mạch với trang chính, không khung cuộn riêng. */
(function(){
 window.addEventListener('message',function(event){
  if(event.origin !== window.location.origin || !event.data || event.data.type !== 'ktx-facility-document-height') return;
  const section=document.getElementById('u169_cosovatchat');
  const frame=section && section.querySelector('iframe');
  if(!frame || event.source!==frame.contentWindow) return;
  const h=Number(event.data.height);
  if(Number.isFinite(h) && h>=250 && h<=200000) frame.style.setProperty('height',Math.ceil(h+4)+'px','important');
 });
})();
