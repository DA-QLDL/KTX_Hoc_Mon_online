
/* STEP235: Notifications always honor the signed-in user's scoped workers.
   For non-admin users, unattributed/ambiguous alerts are intentionally excluded. */
(function(){
  if(typeof issueList!=='function')return;
  const original235=issueList;
  function alertInScope235(x){
    if(typeof ME==='undefined'||!ME||!ME.id)return false;
    if(ME.role==='admin')return true;
    if(!x||!x.w)return false; // never leak unscoped audit/global alerts
    try{return typeof can==='function' && can('view',x.w)===true;}catch(e){return false;}
  }
  issueList=function(){
    const list=original235();
    return Array.isArray(list)?list.filter(alertInScope235):[];
  };
  /* Recalculate unread counts after roles / worker scope change. */
  window.addEventListener('focus',()=>{try{if(typeof updateAlertBadges==='function')updateAlertBadges()}catch(e){}});
})();
