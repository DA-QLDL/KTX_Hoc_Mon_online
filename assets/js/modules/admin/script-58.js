
(function(){
 const D='users.ktx-hoc-mon.app';
 const makeEmail=value=>{const u=String(value||'').trim().toLowerCase();return u.includes('@')?u:`${u}@${D}`;};
 function patchGate(){
  const gate=document.getElementById('authHubGate');if(!gate)return;
  gate.querySelector('.auth-tabs2')?.remove();gate.querySelector('#ahReq')?.remove();gate.querySelector('#authForgot140')?.remove();
  const field=gate.querySelector('label:has(#ahEmail)'); if(field){field.querySelector('span').textContent='Tên đăng nhập';const x=document.getElementById('ahEmail');x.type='text';x.autocomplete='off';x.placeholder='Ví dụ: nv001';}
  const btn=gate.querySelector('#ahLoginBtn');if(btn)btn.textContent='Đăng nhập';
  const intro=gate.querySelector('.auth-intro140');if(intro)intro.textContent='Đăng nhập bằng tài khoản do Quản trị KTX cấp. Không cần email cá nhân.';
  const foot=gate.querySelector('.auth-foot2');if(foot)foot.textContent='Tài khoản và quyền truy cập do Quản trị KTX quản lý.';
 }
 const originalShow=window.authHubShow;
 if(typeof originalShow==='function')window.authHubShow=function(){const r=originalShow.call(this,'login',arguments[1]||'');patchGate();const u=document.getElementById('ahEmail'),pw=document.getElementById('ahPass');if(u)u.value='';if(pw)pw.value='';return r};
 // Replace login click handler with username-to-internal Auth identifier conversion.
 async function login(){
  patchGate();const msg=document.getElementById('ahMsg');const val=document.getElementById('ahEmail')?.value.trim()||'';
  const password=document.getElementById('ahPass')?.value||'';
  if(!val||!password){msg.textContent='Nhập tên đăng nhập và mật khẩu.';return}
  const email=makeEmail(val);msg.textContent='Đang kết nối máy chủ...';try{await window.ktxLoadPublicConfig()}catch(e){msg.textContent=e.message||'Không kết nối được máy chủ';return}const sb=syncClient();if(!sb){msg.textContent='Không thể khởi tạo kết nối Supabase. Liên hệ Quản trị.';return}
  msg.textContent='Đang đăng nhập...';
  try{
   const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
   SUPA_SYNC.session=data.session;await syncLoadAccount();SUPA_SYNC.ready=true;
   if(typeof authTouch==='function')await authTouch('login');
   if(typeof ae==='function')ae('LOGIN','Đăng nhập thành công',{email});
   window.authHubHide();await window.authLoadAdminData();updateUserbar();applyPerms();all();
   if(data.user?.user_metadata?.change_password_required){
    // First-login change happens via the logged-in client's updateUser API.
    const newPass=prompt('Lần đăng nhập đầu: đặt mật khẩu mới (ít nhất 6 ký tự). Chọn Hủy để đổi sau.');
    if(newPass!==null){if(newPass.length<6){alert('Mật khẩu phải có ít nhất 6 ký tự');return}
      const upd=await sb.auth.updateUser({password:newPass,data:{change_password_required:false}});
      if(upd.error)alert('Chưa đổi được mật khẩu: '+upd.error.message);
      else alert('Đã đổi mật khẩu.');}
   }
  }catch(e){msg.textContent='Đăng nhập không thành công: '+(e.message||e);}
 }
 const observer=new MutationObserver(()=>{const btn=document.getElementById('ahLoginBtn');if(!btn)return;patchGate();btn.onclick=login;});
 // Gate is created lazily; observe future insertions without mutating unrelated elements.
 observer.observe(document.body,{childList:true,subtree:false});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchGate);else patchGate();
 function esc147(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 const originalAcc=window.accPage;
 window.accPage=async function(){
  const r=await originalAcc.apply(this,arguments);
  const target=document.getElementById('ac140Create');if(!target)return r;
  target.textContent='+ Tạo tài khoản nhân viên';
  target.onclick=()=>{
   const old=document.getElementById('ac147Dialog');if(old)old.remove();
   const dialog=document.createElement('dialog');dialog.id='ac147Dialog';dialog.className='ac140-modal';
   dialog.innerHTML=`<div class="ac140-modal-head"><h3>Admin tạo tài khoản nhân viên</h3><button type="button" class="btn s" id="ac147Close">Đóng</button></div><div class="ac140-modal-body"><form id="ac147Form" autocomplete="off">
    <label class="ac147-label">Họ và tên<input name="display_name" required minlength="2" maxlength="100"></label>
    <label class="ac147-label">Tên đăng nhập<input name="username" pattern="[a-z][a-z0-9_]{2,31}" required placeholder="Ví dụ: ktx_hoc_mon" maxlength="32" autocapitalize="none" spellcheck="false" autocomplete="off"></label>
    <label class="ac147-label">Mật khẩu tạm thời<input name="password" type="password" minlength="6" required autocomplete="new-password"></label>
    <label class="ac147-label">Vai trò<select name="role"><option value="staff">Nhập liệu</option><option value="manager">Quản lý</option><option value="guard">Bảo vệ</option><option value="viewer">Chỉ xem</option></select></label>
    <div class="ac147-all"><span class="ac147-label">KTX được phân công</span><div class="ac147-pick">${['KTX 1','KTX 2'].map(x=>`<label><input type="checkbox" name="ktx" value="${x}">${x}</label>`).join('')}</div></div>
    <div class="ac147-all"><span class="ac147-label">Dãy được phân công</span><div class="ac147-pick">${['Dãy 1','Dãy 2','Dãy 3','Dãy 4','Dãy 5','Dãy 6'].map(x=>`<label><input type="checkbox" name="days" value="${x}">${x}</label>`).join('')}</div></div>
    <div class="ac147-all" id="ac147Message" role="status">Không cần email cá nhân. Admin tạo tài khoản nội bộ và cấp quyền trực tiếp. Nhân viên cần đổi mật khẩu sau lần đăng nhập đầu.</div></form></div><div class="ac140-modal-foot"><button type="button" class="btn s" id="ac147Cancel">Hủy</button><button type="button" class="btn" id="ac147Save">Tạo tài khoản</button></div>`;
   document.getElementById('acc').appendChild(dialog);dialog.showModal();
   // STEP222: Consistent client/server username rules. Only ASCII [a-z0-9_] reaches API.
   const usernameInput=dialog.querySelector('input[name="username"]');
   const usernameHint=dialog.querySelector('#ac222UsernameHint');
   function normalizeAccountName(v){
     return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d')
       .toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,32);
   }
   usernameInput.addEventListener('input',()=>{
     const value=normalizeAccountName(usernameInput.value);
     usernameHint.textContent=value ? 'Tên đăng nhập sẽ dùng: '+value : '3–32 ký tự: a–z, 0–9, _; bắt đầu bằng chữ.';
     usernameInput.setCustomValidity('');
   });
   usernameInput.addEventListener('blur',()=>{usernameInput.value=normalizeAccountName(usernameInput.value);});
   const close=()=>dialog.close();dialog.querySelector('#ac147Close').onclick=close;dialog.querySelector('#ac147Cancel').onclick=close;
   dialog.querySelector('#ac147Save').onclick=async()=>{
    const form=dialog.querySelector('form');
    usernameInput.value=normalizeAccountName(usernameInput.value);
    if(!/^[a-z][a-z0-9_]{2,31}$/.test(usernameInput.value)){
      usernameInput.setCustomValidity('Tên đăng nhập phải có 3–32 ký tự, bắt đầu bằng chữ a–z; chỉ dùng a–z, 0–9 hoặc dấu _.');
      usernameInput.reportValidity();return;
    }
    usernameInput.setCustomValidity('');
    if(!form.reportValidity())return;
    const values=new FormData(form);const msg=dialog.querySelector('#ac147Message'),save=dialog.querySelector('#ac147Save');
    const ktx=values.getAll('ktx'),days=values.getAll('days');
    if(!ktx.length||!days.length){msg.textContent='Hãy chọn ít nhất một KTX và một Dãy.';return}
    if(!confirm('Xác nhận tạo tài khoản và cấp quyền đã chọn?'))return;
    save.disabled=true;msg.textContent='Đang tạo tài khoản trên máy chủ...';
    try{const sb=syncClient();const {data:{session},error}=await sb.auth.getSession();if(error||!session)throw Error('Phiên Admin đã hết hạn, vui lòng đăng nhập lại.');
     const response=await fetch('/api/admin-create-user',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({username:values.get('username'),display_name:values.get('display_name'),password:values.get('password'),role:values.get('role'),ktx,days})});
     const result=await response.json();if(!response.ok)throw Error(result.error||'Không tạo được tài khoản');
     form.reset();msg.textContent='Đã tạo tài khoản '+result.username+' thành công. Admin chuyển thông tin đăng nhập cho nhân viên qua kênh bảo mật.';
     await window.authLoadAdminData();
     setTimeout(()=>{dialog.close();window.accPage()},900);
    }catch(e){msg.textContent='Lỗi: '+(e.message||e)+' — Kiểm tra Vercel API và biến môi trường.'}
    finally{save.disabled=false}
   };
  };
  return r;
 };
})();
