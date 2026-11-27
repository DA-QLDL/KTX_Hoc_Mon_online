/* v1.0.129: robust wheel routing; native scroll takes precedence in real scrolling widgets. */
(function(){'use strict';
 function room(e,dy){if(!e||!(e instanceof Element))return false;const h=e.scrollHeight-e.clientHeight;return h>2&&(dy>0?e.scrollTop<h-1:e.scrollTop>1);}
 function movable(e,dy){const b=e.scrollTop; e.scrollTop=Math.max(0,Math.min(e.scrollHeight-e.clientHeight,b+dy));return Math.abs(e.scrollTop-b)>.2;}
 document.addEventListener('wheel',e=>{
  if(e.defaultPrevented||e.ctrlKey||e.metaKey||!e.deltaY||innerWidth<=860||document.body.classList.contains('auth-locked'))return;
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(t.closest('dialog[open],[role="dialog"],#authHubGate,#alertQuickDrawer'))return;
  const sidebar=t.closest('body>nav,#step146NavScroll');
  if(sidebar){for(let n=t;n&&n!==document.body;n=n.parentElement){if(room(n,dy)){if(movable(n,dy))e.preventDefault();return}if(n===sidebar)break}return;}
  // Native wheel is not cancelled unless movement succeeds.
  for(let n=t;n&&n!==document.documentElement;n=n.parentElement){
    const cs=getComputedStyle(n);if(/auto|scroll|overlay/.test(cs.overflowY)&&room(n,dy)){
      if(movable(n,dy))e.preventDefault();return;
    }
  }
  const unique=[document.scrollingElement,document.documentElement,document.body,document.querySelector('body>main'),document.querySelector('#app')].filter((x,i,a)=>x&&a.indexOf(x)===i);
  for(const n of unique){if(room(n,dy)&&movable(n,dy)){e.preventDefault();return;}}
 },{capture:true,passive:false});
})();
