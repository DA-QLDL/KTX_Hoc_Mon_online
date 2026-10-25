/* Independent tap/click events; repeated presses on the same control are coalesced. */
(function(){
 const last=new WeakMap();
 document.addEventListener('click',function(e){
  const button=e.target.closest?.('button,[role="button"]');
  if(!button)return;
  const prior=last.get(button)||0,now=performance.now();
  if(now-prior<220){e.preventDefault();e.stopImmediatePropagation();return;}
  last.set(button,now);
 },true);
 // Remove lingering keyboard focus after pointer interaction while preserving keyboard navigation.
 document.addEventListener('pointerup',function(e){
  const button=e.target.closest?.('button');
  if(button&&e.pointerType!=='keyboard')requestAnimationFrame(()=>{if(document.activeElement===button)button.blur()});
 },true);
})();
