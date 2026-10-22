
(()=>{function place(){const nav=document.querySelector('body>nav'),bar=document.getElementById('authUserbar');if(nav&&bar&&bar.parentElement!==nav)nav.appendChild(bar)}
 document.addEventListener('DOMContentLoaded',place);window.addEventListener('load',place);
 // Recheck only on user interaction or page navigation; do not alter authentication state.
 document.addEventListener('click',()=>queueMicrotask(place),true);
})();
