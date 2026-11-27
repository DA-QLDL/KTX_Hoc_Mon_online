/* V2.0.42 FIX3: sorting is handled by script-08.js. Retain independent room drawer. */
/* Step 56: Room drawer interaction */
(function(){
  const bindRoomDrawer=()=>{
    const d=document.getElementById('rdl');
    if(!d||d.dataset.step56Bound)return;
    d.dataset.step56Bound='1';
    const close=()=>{if(d.open) d.close();};
    const x=document.getElementById('rx'); if(x) x.onclick=close;
    d.addEventListener('click',e=>{
      if(e.target!==d) return;
      const r=d.getBoundingClientRect();
      const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
      if(!inside) close();
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindRoomDrawer); else bindRoomDrawer();
})();
