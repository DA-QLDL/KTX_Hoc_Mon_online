(function(){
'use strict';
const labels=['Chọn','STT','Họ và Tên','Mã NV','Tiểu Đoàn','Đơn vị','KTX','Dãy','Phòng','Giới tính','SĐT','CCCD','Ngày sinh','Địa chỉ','Tiểu đội trưởng','Trạng thái tạm trú'];
const optional=new Set([4,5,9,10,11,12,13,14]);
let hidden=new Set();
try {const saved=JSON.parse(localStorage.getItem('ktx_col_hidden_v103')||'[]');if(Array.isArray(saved))hidden=new Set(saved.filter(x=>optional.has(x)));} catch(e){console.warn('[KTX] Column preferences could not load',e)}
function apply(){
 document.querySelectorAll('#wl table.cmp2').forEach(table=>{
  for(const row of table.rows){for(let i=0;i<row.cells.length;i++){row.cells[i].style.display=hidden.has(i)?'none':''}}
 });
}
function init(){
 const wl=document.getElementById('wl'),work=document.getElementById('work');if(!wl||!work)return;
 const controls=document.createElement('div');controls.className='ktx-column-controls';
 const btn=document.createElement('button');btn.type='button';btn.className='btn s';btn.textContent='☷ Chọn cột hiển thị';btn.setAttribute('aria-expanded','false');
 const panel=document.createElement('div');panel.className='ktx-column-popover';panel.hidden=true;
 labels.forEach((name,i)=>{if(!optional.has(i))return;const lab=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.checked=!hidden.has(i);cb.addEventListener('change',()=>{
 if(cb.checked)hidden.delete(i);else hidden.add(i);
 try{localStorage.setItem('ktx_col_hidden_v103',JSON.stringify([...hidden]))}catch(e){console.warn('[KTX] Column preferences could not save',e)}
 apply();
 });lab.append(cb,document.createTextNode(name));panel.append(lab)});
 btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden))});
 document.addEventListener('click',e=>{if(!controls.contains(e.target)){panel.hidden=true;btn.setAttribute('aria-expanded','false')}});
 controls.append(btn,panel);wl.before(controls);const mo=new MutationObserver(apply);mo.observe(wl,{childList:true,subtree:true});apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
