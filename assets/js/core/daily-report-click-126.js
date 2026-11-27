/* v2208: Do not intercept the main daily report click. Core script-08.js already
   decides between direct Word export (Overview) and report editing (Workers).
   Previous capture listener forced the edit dialog on all pages. */
(function(){'use strict';
 function ensure(){const b=document.getElementById('xr');if(!b||b.dataset.ktx2208Bound)return;
 b.dataset.ktx2208Bound='1';
 if(typeof b.onclick==='function')return;
 b.addEventListener('click',()=>{if(typeof window.exportDailyReportDirect==='function')window.exportDailyReportDirect();else if(typeof window.openRp==='function')window.openRp()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
})();
