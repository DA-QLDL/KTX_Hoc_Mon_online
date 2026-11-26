(function(){
'use strict';
function init(){
 const first=document.getElementById('ktx153Select500');
 if(first&&!first.dataset.bound){first.dataset.bound='1';first.addEventListener('click',()=>{
   return; // v191: retired unsafe bulk selection action
 });}
 // The three counters duplicate the QR tab counters; hide only redundant chips.
 const qr=document.getElementById('qr');if(qr){qr.querySelectorAll('.qr-top-pills,.qr-summary-chips,.qr-header-status').forEach(x=>x.style.display='none');}
}

// UI50 #13: show a native tooltip only for visually clipped text in data cells.
// This works for rows rendered after filtering/pagination; never formats IDs or modifies text.
function installTruncatedTextTooltips(){
 if(document.documentElement.dataset.ktxTooltip113==='1')return;
 document.documentElement.dataset.ktxTooltip113='1';
 function inspect(ev){
  const origin=ev.target;
  if(!(origin instanceof Element))return;
  if(origin.closest('button,a,input,select,textarea,[contenteditable="true"]'))return;
  const el=origin.closest('td, .fi .fn span, .gs-name, .gs-meta, .unit-chip span');
  if(!el||!el.closest('table,.fi,.gs-result,.unit-chip'))return;
  if(el.hasAttribute('title')&&!el.dataset.ktxTooltip113)return;
  const style=getComputedStyle(el);
  const clippedX=el.scrollWidth>el.clientWidth+2;
  const clippedY=el.scrollHeight>el.clientHeight+2;
  const ellipsis=style.textOverflow==='ellipsis';
  if((clippedX||clippedY)&&((ellipsis||style.overflow==='hidden'||style.overflowX==='hidden'||style.whiteSpace==='nowrap'))){
    const value=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
    if(value){el.title=value;el.dataset.ktxTooltip113='1';}
  }else if(el.dataset.ktxTooltip113){el.removeAttribute('title');delete el.dataset.ktxTooltip113;}
 }
 document.addEventListener('pointerover',inspect,{passive:true});
 document.addEventListener('focusin',inspect);
}

function sortable(){
 // Only add sort controls to residence/archive tables. Sort visible rows, preserving data and checkbox state.
 for(const id of ['t6','arc']){
  const region=document.getElementById(id);if(!region)continue;
  region.querySelectorAll('table').forEach(table=>{
   const head=table.tHead?.rows[0];if(!head||head.dataset.sort153)return;
   head.dataset.sort153='1';
   [...head.cells].forEach((th,i)=>{
    if(th.querySelector('input,button')||!th.textContent.trim())return;
    th.style.cursor='pointer';th.title='Sắp xếp tăng/giảm';th.tabIndex=0;th.setAttribute('role','button');
    const indicator=document.createElement('span');indicator.textContent=' ↕';indicator.style.opacity='.52';th.appendChild(indicator);
    function doSort(){const tbody=table.tBodies[0];if(!tbody)return;const asc=th.dataset.dir!=='asc';head.querySelectorAll('[data-dir]').forEach(e=>delete e.dataset.dir);th.dataset.dir=asc?'asc':'desc';indicator.textContent=asc?' ▲':' ▼';const rows=[...tbody.rows].filter(r=>r.cells.length>i);rows.sort((a,b)=>{const va=a.cells[i].textContent.trim(),vb=b.cells[i].textContent.trim();return (asc?1:-1)*va.localeCompare(vb,'vi',{numeric:true,sensitivity:'base'});});rows.forEach(row=>tbody.appendChild(row));}
    th.addEventListener('click',doSort);th.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();doSort();}});
   });
  });
 }
}
document.addEventListener('DOMContentLoaded',()=>{init();sortable();installTruncatedTextTooltips();new MutationObserver(()=>{init();sortable()}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});});
})();