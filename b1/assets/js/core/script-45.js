
/* STEP248 – classify action buttons by meaning, including dynamically rendered dialogs. */
(function(){
 const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();
 function tone(el){
   if(el.dataset.actionTone) return el.dataset.actionTone;
   const label=norm((el.innerText||el.textContent||'').replace(/[\s\u00a0]+/g,' '));
   const cls=' '+String(el.className||'')+' ';
   if(/(^|\s)(danger|sf-danger|r)(\s|$)/.test(cls)||/\b(xoa|xoa han|huy bo|tu choi|khoi phuc mac dinh|dat lai|delete|remove)\b/.test(label))return 'danger';
   if(/\b(hoan tac|canh bao|khoa)\b/.test(label))return 'warning';
   if(/(^|\s)(primary|sf-green|g)(\s|$)/.test(cls)||/^(xac nhan|luu|duyet|tao |them |dang nhap|gui |hoan thanh|cap nhat|ap dung|chuyen phong)/.test(label))return 'success';
   if(/\b(xuat|tai |import|chon file|chon nhieu|scan|quet|trich xuat|xem va xuat)\b/.test(label))return 'primary';
   if(/\b(chinh sua|sua |nhap |chon|tiep theo|phuong an)\b/.test(label))return 'accent';
   if(/\b(quay lai|dong|huy$|tro ve|back)\b/.test(label))return 'secondary';
   return 'neutral';
 }
 function eligible(el){
   if(!(el instanceof HTMLElement)) return false;
   if(el.closest('nav,aside,.sidebar,.tabs,.tabbar,.bottom-nav,.mobile-nav,.m-nav,.system-hub-nav,.sysfunc-grid,.sysfunc-btn')) return false;
   if(el.matches('[data-ui-no-tone],.sysfunc-btn,.tab,.alert-float,[role=tab]')) return false;
   if(el.classList.contains('ib') && !el.getAttribute('aria-label') && !el.getAttribute('title'))return false;
   return true;
 }
 function apply(el){
   if(!eligible(el))return;
   // Keep styled dashboard tiles and external component buttons intact.
   if(el.classList.contains('ktx-action'))return;
   const t=tone(el);el.classList.add('ktx-action');el.dataset.actionTone=t;
   if((el.textContent||'').length>45)el.classList.add('ktx-long');
 }
 function scan(root){if(root.matches&&root.matches('button,.btn,a.btn,label.upload'))apply(root);if(root.querySelectorAll)root.querySelectorAll('button,.btn,a.btn,label.upload').forEach(apply)}
 function start(){scan(document.body);const observer=new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')for(const n of m.addedNodes)if(n.nodeType===1)scan(n);}});observer.observe(document.body,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
