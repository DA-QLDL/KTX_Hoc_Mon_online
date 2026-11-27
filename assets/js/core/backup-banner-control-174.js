/* KTX V2.0.20: Legacy local-backup recovery banner retired.
   Snapshot storage and manual KTX143_BACKUP API remain unchanged. */
(function(){ 'use strict';
  const remove=()=>document.getElementById('ktx143Recovery')?.remove();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});
  else remove();
})();
