/* V2.0.19: one Supabase vault for PC and mobile, reusing current login. */
(function(){
  'use strict';
  window.ktxVaultClientV217=function(){
    return typeof window.syncClient==='function'?window.syncClient():null;
  };
  window.docsPage=function(){
    var host=document.getElementById('t7');if(!host)return;
    if(!host.querySelector('#ktx217VaultFrame')){
      host.innerHTML='<div class="ktx217-vault-frame"><iframe id="ktx217VaultFrame" title="Kho tài liệu Supabase" src="/pages/kho-tai-lieu.html?v=226" loading="eager" referrerpolicy="same-origin"></iframe></div>';
    }
  };
})();
