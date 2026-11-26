/* V2.0.19: one Supabase vault for PC and mobile, reusing current login. */
(function(){
  'use strict';
  window.ktxVaultClientV217=function(){
    return typeof window.syncClient==='function'?window.syncClient():null;
  };
  window.docsPage=function(){
    var host=document.getElementById('t7');if(!host)return;
    if(!host.querySelector('#ktx217VaultFrame')){
      host.innerHTML='<div class="ktx217-vault-frame"><iframe id="ktx217VaultFrame" title="Kho tài liệu Supabase" src="/pages/kho-tai-lieu.html?v=229" loading="eager" referrerpolicy="same-origin" allow="web-share"></iframe></div>';
    }
  };

  // V2.0.129: run Web Share from top-level browsing context after an actual tap.
  // The private document is sent as a File object from the same-origin Vault iframe.
  window.addEventListener('message',function(event){
    if(event.origin!==location.origin || !event.data || event.data.type!=='ktx:vault-share-file-v2129')return;
    var frame=document.getElementById('ktx217VaultFrame');
    if(!frame || event.source!==frame.contentWindow)return;
    var file=event.data.file;
    if(!(file instanceof File))return;
    var old=document.getElementById('ktx-vault-share-host-2129');if(old)old.remove();
    var backdrop=document.createElement('div');backdrop.id='ktx-vault-share-host-2129';
    backdrop.setAttribute('role','dialog');backdrop.setAttribute('aria-modal','true');
    backdrop.style.cssText='position:fixed;inset:0;z-index:2147483640;background:rgba(12,27,50,.67);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
    var card=document.createElement('div');card.style.cssText='box-sizing:border-box;width:min(430px,100%);border-radius:16px;background:white;color:#17345d;padding:20px;font:14px system-ui,-apple-system,Arial,sans-serif;box-shadow:0 12px 45px #10284955';
    var heading=document.createElement('h3');heading.textContent='Chia sẻ tệp đính kèm';heading.style.cssText='font-size:18px;margin:0 0 12px';
    var detail=document.createElement('p');detail.style.cssText='overflow-wrap:anywhere;margin:0 0 12px';detail.textContent=file.name+' · '+Math.ceil(file.size/1024)+' KB';
    var status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='font-size:13px;line-height:1.55;color:#49647f';
    var actions=document.createElement('div');actions.style.cssText='display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:16px';
    var close=document.createElement('button');close.type='button';close.textContent='Đóng';
    var send=document.createElement('button');send.type='button';send.textContent='Chia sẻ tệp';
    var save=document.createElement('button');save.type='button';save.textContent='Tải tệp';
    [close,send,save].forEach(function(el){el.style.cssText='min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid #cbd9ea;background:white;color:#17467d;font-size:14px;font-weight:700;cursor:pointer'});
    send.style.background='#1165e9';send.style.color='white';send.style.borderColor='#1165e9';
    save.onclick=function(){
      var url=URL.createObjectURL(file);var a=document.createElement('a');
      a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},30000);
      status.textContent='Tệp đã được yêu cầu tải về. Mở Zalo/Messenger, chọn đính kèm tài liệu và chọn tệp vừa tải trong thư mục Tải xuống.';
    };
    function dismiss(){backdrop.remove()}
    close.addEventListener('click',dismiss);
    var supported=typeof navigator.share==='function' && (typeof navigator.canShare!=='function'||navigator.canShare({files:[file]}));
    if(supported){
      status.textContent='Nhấn Chia sẻ tệp, sau đó chọn Zalo hoặc Messenger trong bảng chia sẻ của điện thoại.';
      send.onclick=function(){
        // Required: call navigator.share synchronously in the user click event, no await first.
        var pending;
        try{pending=navigator.share({files:[file],title:file.name})}
        catch(err){status.textContent='Không thể mở bảng chia sẻ tệp: '+(err.message||err);return}
        Promise.resolve(pending).then(dismiss).catch(function(err){
          if(err && err.name==='AbortError')return;
          status.textContent='Trình duyệt/hệ điều hành từ chối chia sẻ tệp trực tiếp: '+(err?.message||err)+'. Hãy thử mở ứng dụng bằng Chrome/Safari thay vì trình duyệt trong ứng dụng khác.';
        });
      };
    }else{
      send.disabled=true;send.style.opacity='.5';
      status.textContent='Thiết bị không hỗ trợ chia sẻ trực tiếp. Bấm Tải tệp, sau đó mở Zalo/Messenger → Đính kèm → Tệp/Tài liệu → chọn tệp trong Tải xuống → Gửi.';
    }
    actions.append(close,save,send);card.append(heading,detail,status,actions);backdrop.append(card);document.body.append(backdrop);
  });
})();
