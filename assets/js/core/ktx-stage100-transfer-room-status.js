/* Stage 100 · Visual occupancy classification for transfer cards only.
   Reads rendered occupancy, never writes worker records or transfer forms. */
(()=>{
  'use strict';
  function annotate(grid){
    const roomCards=grid.querySelectorAll(':scope > .transfer-room-card');
    for(const card of roomCards){
      const countText=card.querySelector(':scope > span')?.textContent||'';
      const parsed=countText.match(/(\d+)\s*\/\s*(\d+)/);
      if(!parsed) continue;
      const count=Number(parsed[1]),cap=Number(parsed[2]);
      if(!Number.isFinite(count)||!Number.isFinite(cap)||cap<=0) continue;
      const status=(card.disabled||card.classList.contains('tr218-disabled'))?'locked':count>cap?'over':count===cap?'full':cap-count<=3?'near':'available';
      if(card.dataset.heatStatus!==status)card.dataset.heatStatus=status;
    }
  }
  function attach(){
    const grid=document.getElementById('trRoomGrid');
    if(!grid||grid.dataset.stage100StatusAttached==='1')return;
    grid.dataset.stage100StatusAttached='1';
    annotate(grid);
    const obs=new MutationObserver(records=>{
      // Runs only after room buttons have been rebuilt, not for unrelated page updates.
      if(records.some(r=>r.type==='childList'&&r.target===grid))annotate(grid);
    });
    obs.observe(grid,{childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});
  else attach();
})();
