/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/modules/admin/ktx-account-document-permissions-v271.js >>> */
/* Stage 71 — Move Cloud Vault permissions to Account Management.
 * Uses existing Supabase table / RPC / RLS, no privilege changes.
 */
(()=>{'use strict';
const ID='ktx271VaultPermissions',TABLE='ktx_document_permissions';
const $=id=>document.getElementById(id);
let busy=false,version=0,rows=[],accounts=[],ready=false;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uuid=s=>/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(String(s||''));
function status(message,type='info'){
  const el=$('ktx271Status');if(el){el.textContent=message||'';el.dataset.type=type}
}
function sb(){return typeof window.syncClient==='function'?window.syncClient():null}
function permitted(){try{return typeof can==='function'&&can('acct')}catch(_){return false}}
function allAccounts(){
 const x=window.AUTHC?.accounts;
 return Array.isArray(x)?x.filter(a=>a&&a.user_id):[];
}
function updateFields(){
 const id=$('ktx271User')?.value||'';
 const a=accounts.find(a=>String(a.user_id)===String(id));
 const p=rows.find(p=>String(p.user_id)===String(id))||{};
 for(const [field,key] of [['View','can_view'],['Download','can_download'],['Upload','can_upload'],['Delete','can_delete']]){
  const el=$('ktx271'+field);if(el)el.checked=!!p[key];
 }
 const save=$('ktx271Save');if(save)save.disabled=busy||!a||!ready;
 if(a)status('Quyền Kho tài liệu của '+(a.display_name||a.email||'tài khoản đã chọn')+'.');
 else status('Chọn tài khoản để xem và chỉnh quyền Kho tài liệu.');
}
function mount(){
 if(!permitted())return;
 const holder=$('acc');if(!holder)return;
 let box=$(ID);
 if(!box){
  box=document.createElement('section');box.id=ID;box.className='card ktx271-card';
  box.innerHTML=`<div class="ktx271-head"><div><h3>Quản lý quyền Kho tài liệu</h3><p>Phân quyền xem, tải lên và xóa tài liệu theo từng tài khoản.</p></div><button type="button" class="btn s" id="ktx271Refresh">Làm mới</button></div>
   <div class="ktx271-select"><label for="ktx271User">Tài khoản</label><select id="ktx271User"><option value="">Chọn tài khoản...</option></select></div>
   <div class="ktx271-checks">
    <label><input type="checkbox" id="ktx271View"> Xem danh sách</label>
    <label><input type="checkbox" id="ktx271Download"> Xem / tải</label>
    <label><input type="checkbox" id="ktx271Upload"> Tạo / sửa</label>
    <label><input type="checkbox" id="ktx271Delete"> Xóa</label>
   </div><div class="ktx271-foot"><div id="ktx271Status" role="status" aria-live="polite"></div><button type="button" class="btn" id="ktx271Save" disabled>Lưu phân quyền</button></div>`;
  holder.appendChild(box);
  $('ktx271User').addEventListener('change',updateFields);
  $('ktx271Refresh').addEventListener('click',()=>load());
  $('ktx271Delete').addEventListener('change',()=>{if($('ktx271Delete').checked)$('ktx271Download').checked=true});
  $('ktx271Download').addEventListener('change',()=>{if(!$('ktx271Download').checked)$('ktx271Delete').checked=false});
  $('ktx271Save').addEventListener('click',save);
 }
 return box;
}
async function load(){
 if(!permitted())return;
 const box=mount();if(!box)return;
 const n=++version;
 ready=false;status('Đang tải tài khoản và phân quyền Kho tài liệu...');
 const select=$('ktx271User'),previous=select.value;
 $('ktx271Save').disabled=true;
 try{
  const client=sb();if(!client)throw Error('Chưa kết nối Supabase.');
  // The permission snapshot is authoritative; require vault admin as well as account-admin.
  const check=await client.rpc('ktx_vault_permission_snapshot');
  if(check.error)throw check.error;
  if(!check.data?.admin)throw Error('Tài khoản hiện tại không có quyền quản trị Kho tài liệu.');
  if(typeof window.authLoadAdminData==='function')await window.authLoadAdminData();
  let list=allAccounts();
  if(!list.length){
    const direct=await client.from('app_accounts').select('user_id,display_name,email,role,enabled');
    if(direct.error)throw direct.error;
    list=direct.data||[];
  }
  const result=await client.from(TABLE).select('user_id,can_view,can_download,can_upload,can_delete');
  if(result.error)throw result.error;
  if(n!==version||!$(ID))return;
  accounts=list.slice().sort((a,b)=>String(a.display_name||a.email||'').localeCompare(String(b.display_name||b.email||''),'vi'));
  rows=result.data||[];select.replaceChildren(new Option('Chọn tài khoản...',''));
  for(const a of accounts){const text=(a.display_name||a.email||String(a.user_id))+(a.enabled===false?' (đã khóa)':'');select.add(new Option(text,String(a.user_id)))}
  select.value=accounts.some(a=>String(a.user_id)===previous)?previous:'';
  ready=true;updateFields();
 }catch(error){if(n!==version)return;ready=false;status('Không tải được phân quyền: '+(error.message||error),'error')}
}
async function save(){
 if(busy||!ready||!permitted())return;
 const select=$('ktx271User'),id=select?.value;
 if(!uuid(id)||!accounts.some(a=>String(a.user_id)===id)){status('Vui lòng chọn tài khoản hợp lệ.','error');return}
 busy=true;$('ktx271Save').disabled=true;status('Đang lưu quyền lên Supabase...');
 try{
  const client=sb();if(!client)throw Error('Không thể kết nối Supabase.');
  const check=await client.rpc('ktx_vault_permission_snapshot');
  if(check.error||!check.data?.admin)throw Error('Quyền quản trị Kho tài liệu đã thay đổi.');
  const record={user_id:id,can_view:$('ktx271View').checked,can_download:$('ktx271Download').checked,can_upload:$('ktx271Upload').checked,can_delete:$('ktx271Delete').checked,updated_at:new Date().toISOString()};
  const update=await client.from(TABLE).upsert(record,{onConflict:'user_id'});if(update.error)throw update.error;
  const verified=await client.from(TABLE).select('user_id,can_view,can_download,can_upload,can_delete').eq('user_id',id).maybeSingle();
  if(verified.error||!verified.data)throw Error('Chưa xác minh được dữ liệu vừa lưu.');
  for(const key of ['can_view','can_download','can_upload','can_delete'])if(Boolean(verified.data[key])!==Boolean(record[key]))throw Error('Dữ liệu quyền trên Supabase chưa khớp.');
  const at=rows.findIndex(r=>r.user_id===id);if(at>=0)rows[at]=verified.data;else rows.push(verified.data);
  status('Đã lưu và xác minh phân quyền Kho tài liệu.','success');
 }catch(error){status('Không lưu được phân quyền: '+(error.message||error),'error')}
 finally{busy=false;$('ktx271Save').disabled=!ready||!id}
}
// account page is re-rendered by the existing app; integrate after its renderer.
function wrapAccountPage(){
 const original=window.accPage;
 if(typeof original!=='function'||original.__ktx271Wrapped)return;
 const wrapped=async function(...args){const result=await original.apply(this,args);if(permitted()){mount();void load()}return result};
 wrapped.__ktx271Wrapped=true;window.accPage=wrapped;
}
wrapAccountPage();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrapAccountPage);
window.KTXDocumentPermissionsV271={open:()=>{if(typeof window.go==='function')window.go('acc')}};
})();

;
/* >>> Original: assets/js/modules/admin/ktx-account-personal-email-v282.js >>> */
/* QLKTX Stage 82 — Separate immutable login username from personal contact email.
 * Existing Supabase Auth email is never changed. Admin profile field only.
 */
(function(){
  'use strict';
  const FIELD='personal_email', DOM='ac275PersonalEmail';
  const MAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const get=id=>document.getElementById(id);
  let schemaState='unknown';
  let schemaError='';

  function accounts(){return Array.isArray(window.AUTHC?.accounts)?window.AUTHC.accounts:[];}
  function userById(id){return accounts().find(a=>String(a.user_id)===String(id));}
  function username(internalEmail){
    const email=String(internalEmail||'');
    const suffix='@users.ktx-hoc-mon.app';
    return email.toLowerCase().endsWith(suffix)?email.slice(0,-suffix.length):email;
  }
  function fieldStatus(){
    const f=get(DOM), hint=get('ac275Hint'); if(!f||!hint)return;
    if(schemaState==='missing'){
      hint.textContent='Cần chạy SQL Stage 75 trên Supabase để lưu email cá nhân đồng bộ.';
      hint.className='ac275-hint ac275-warn';
    } else if(schemaState==='error'){
      hint.textContent='Chưa tải được Email cá nhân: '+schemaError;
      hint.className='ac275-hint ac275-warn';
    } else {
      hint.textContent='Chỉ dùng để liên hệ, không thay đổi tên đăng nhập hoặc tài khoản xác thực.';
      hint.className='ac275-hint';
    }
  }

  function patchEditor(){
    const login=get('ac140Email');
    const modal=get('ac140Modal');
    if(!login||!modal)return;
    const loginLabel=login.closest('label');
    if(!loginLabel)return;

    // Keep original id for compatibility with the account editor.
    if(!loginLabel.dataset.ac275Login){
      loginLabel.dataset.ac275Login='1';
      const title=loginLabel.firstChild;
      if(title&&title.nodeType===Node.TEXT_NODE)title.textContent='Tên đăng nhập';
      else loginLabel.insertBefore(document.createTextNode('Tên đăng nhập'),loginLabel.firstChild);
      login.readOnly=true;
      login.setAttribute('autocomplete','username');
      login.setAttribute('aria-label','Tên đăng nhập nội bộ, không thể chỉnh sửa');
      let note=loginLabel.querySelector('small');
      if(note)note.textContent='Định danh đăng nhập nội bộ · không chỉnh sửa';
    }
    const fields=modal.querySelector('.ac140-fields');
    if(fields&&!get(DOM)){
      const label=document.createElement('label');
      label.className='ac275-personal-label';
      label.append(document.createTextNode('Email cá nhân'));
      const input=document.createElement('input');
      input.type='email';input.id=DOM;input.name='personal_email';
      input.autocomplete='email';input.maxLength=254;
      input.placeholder='vidu@gmail.com';
      input.setAttribute('aria-label','Email liên hệ cá nhân');
      label.appendChild(input);
      const help=document.createElement('small');help.id='ac275Hint';
      label.appendChild(help);
      const next=loginLabel.nextSibling;
      fields.insertBefore(label,next);
    }
    fieldStatus();
  }

  // Stage 78: Profile contact email is managed only through dedicated admin
  // RPC functions. Never grant unrestricted client UPDATE on app_accounts.
  function sbClient(){
    return typeof window.syncClient==='function'?window.syncClient():
           (typeof syncClient==='function'?syncClient():null);
  }
  function rpcMessage(error){
    const message=String(error?.message||error||'');
    if(/permission denied for table app_accounts|permission denied for relation app_accounts/i.test(message))
      return 'Máy chủ đang từ chối truy cập app_accounts. Quản trị Supabase cần chạy SQL cài đặt đầy đủ Stage 82 (SECURITY DEFINER) bằng vai trò postgres, sau đó thử lại.';
    if(/permission denied for function|PGRST202|Could not find the function|schema cache|404|42883/i.test(message))
      return 'Chưa cài hoặc chưa cấp quyền hàm Email cá nhân. Hãy chạy SQL Stage 82 trên Supabase với vai trò postgres.';
    if(/42501|not authorized|khong du quyen|quyền/i.test(message))
      return 'Tài khoản đang đăng nhập chưa được phép cập nhật Email cá nhân; cần kiểm tra quyền Quản trị.';
    if(/Could not find the function|schema cache|404|PGRST202|42883/i.test(message))
      return 'Chưa cài đặt hàm lưu Email cá nhân. Quản trị hệ thống cần chạy SQL Stage 78 trên Supabase.';
    return message;
  }
  async function getPersonalEmails(){
    const sb=sbClient();
    if(!sb)throw new Error('Chưa kết nối Supabase.');
    const res=await sb.rpc('ktx_get_personal_emails_v278');
    if(res.error)throw new Error(rpcMessage(res.error));
    schemaState='ready';schemaError='';
    const values=new Map((res.data||[]).map(r=>[String(r.user_id),r.personal_email||'']));
    accounts().forEach(a=>{
      if(values.has(String(a.user_id)))a.personal_email=values.get(String(a.user_id));
    });
    fieldStatus();
    return values;
  }

  // Use admin-only RPC to load contact emails. The regular account loader
  // remains the source of truth for role, scope and enabled status.
  const prevLoad=window.authLoadAdminData;
  if(typeof prevLoad==='function'){
    window.authLoadAdminData=async function(...args){
      const result=await prevLoad.apply(this,args);
      if(typeof window.can==='function' && !window.can('acct'))return result;
      try{await getPersonalEmails();}
      catch(err){
        schemaState='error';schemaError=String(err?.message||err);
        fieldStatus();
      }
      return result;
    };
  }

  // Validate and check permission BEFORE saving existing role/scope.
  // Save role/scope through the existing verified workflow; save contact
  // email separately and verify the RPC result before reporting success.
  const prevSave=window.saveAccountRow;
  if(typeof prevSave==='function'){
    window.saveAccountRow=async function(id,row){
      const modal=get('ac140Modal');
      const input=get(DOM);
      if(!input || !modal?.open || String(modal.dataset.selection)!==String(id)){
        return prevSave.call(this,id,row);
      }
      const candidate=String(input.value||'').trim().toLowerCase();
      if(candidate && (candidate.length>254 || !MAIL.test(candidate))){
        input.setCustomValidity('Nhập đúng định dạng email cá nhân.');
        input.reportValidity();
        input.setCustomValidity('');
        throw new Error('Email cá nhân không hợp lệ.');
      }
      // Preflight fails before any account-role edits if RPC is not installed.
      const savedMap=await getPersonalEmails();
      const before=String(savedMap.get(String(id))||'').trim().toLowerCase();
      const changed=candidate!==before;
      const result=await prevSave.call(this,id,row);
      if(result!==true)return result;

      if(changed){
        const sb=sbClient();
        if(!sb)throw Error('Phân quyền đã lưu nhưng không kết nối được Supabase để lưu email cá nhân.');
        const updated=await sb.rpc('ktx_set_personal_email_v278',{
          p_user_id:id,p_personal_email:candidate||null
        });
        if(updated.error || String(updated.data||'').trim().toLowerCase()!==candidate){
          throw new Error('Phân quyền đã lưu nhưng Email cá nhân CHƯA lưu được: '
            +rpcMessage(updated.error||'Supabase chưa xác nhận giá trị email.')
            +' Hãy kiểm tra SQL Stage 78 rồi lưu lại.');
        }
        const a=userById(id);
        if(a)a.personal_email=candidate;
      }
      return true;
    };
  }

  function afterEditorOpen(button){
    const id=button.dataset.ac140Edit;
    const a=userById(id);
    patchEditor();
    const login=get('ac140Email'), mail=get(DOM);
    if(login)login.value=username(a?.email||'');
    if(mail){mail.value=a?.personal_email||'';mail.setCustomValidity('');}
    fieldStatus();
  }

  const oldPage=window.accPage;
  if(typeof oldPage==='function'){
    window.accPage=async function(...args){
      const result=await oldPage.apply(this,args);
      patchEditor();
      const root=get('acc');
      if(root)root.querySelectorAll('[data-ac140-edit]').forEach(b=>{
        // Script-81 assigns onclick during the existing render. This listener
        // runs immediately after it and fills the new field for the selected user.
        b.addEventListener('click',()=>afterEditorOpen(b));
      });
      return result;
    };
  }
  window.KTXPersonalEmailV275={patchEditor};
})();

;
/* >>> Original: assets/js/modules/admin/ktx-account-modal-redesign-v282.js >>> */
/* QLKTX Stage 77 — Refined account edit dialog layout
   UI only: reorganizes the existing editor into cleaner sections.
*/
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const FIELD_IDS=['ac140Name','ac140Email','ac275PersonalEmail','ac256Position','ac256Phone','ac140EditRole','ac140Enabled','ac140Ktx','ac140Days'];

  function closestLabel(id){
    const el=$(id);
    return el?(el.closest('.ac140-scope-field')||el.closest('label')):null;
  }
  function create(tag,cls,html){
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(html!=null)el.innerHTML=html;
    return el;
  }
  function ensureHead(dialog){
    const head=dialog.querySelector('.ac140-modal-head');
    if(!head)return;
    let shell=head.querySelector('.ac277-headcopy');
    const title=head.querySelector('h3');
    if(title && title.textContent!=='Chỉnh sửa tài khoản nhân viên')title.textContent='Chỉnh sửa tài khoản nhân viên';
    if(!shell){
      shell=create('div','ac277-headcopy');
      const kicker=create('div','ac277-kicker','Quản lý tài khoản');
      const subtitle=create('p','ac277-subtitle','Cập nhật thông tin hiển thị, email liên hệ và phạm vi phụ trách mà không thay đổi nghiệp vụ đăng nhập.');
      if(title){
        title.parentNode.insertBefore(shell,title);
        shell.appendChild(kicker);
        shell.appendChild(title);
        shell.appendChild(subtitle);
      }else{
        shell.appendChild(kicker);
        shell.appendChild(create('h3','', 'Chỉnh sửa tài khoản nhân viên'));
        shell.appendChild(subtitle);
        head.insertBefore(shell,head.firstChild);
      }
    }
  }

  function decorateLabel(label, extraClass){
    if(!label)return null;
    label.classList.add('ac277-field-accent');
    if(extraClass)label.classList.add(extraClass);
    return label;
  }

  function buildLayout(dialog){
    const body=dialog.querySelector('.ac140-modal-body');
    const fields=dialog.querySelector('.ac140-fields');
    const perms=dialog.querySelector('#ac140Perms');
    if(!body || !fields || !perms)return false;

    const nameLabel=decorateLabel(closestLabel('ac140Name'));
    const loginLabel=decorateLabel(closestLabel('ac140Email'));
    const personalMailLabel=decorateLabel(closestLabel('ac275PersonalEmail'));
    const positionLabel=decorateLabel(closestLabel('ac256Position'));
    const phoneLabel=decorateLabel(closestLabel('ac256Phone'));
    const roleLabel=decorateLabel(closestLabel('ac140EditRole'));
    const enabledLabel=decorateLabel(closestLabel('ac140Enabled'));
    const ktxLabel=decorateLabel(closestLabel('ac140Ktx'),'ac277-span-2');
    const dayLabel=decorateLabel(closestLabel('ac140Days'),'ac277-span-2');
    if(!nameLabel || !loginLabel || !roleLabel || !enabledLabel || !ktxLabel || !dayLabel)return false;

    body.querySelectorAll('h3').forEach(node=>{
      if(/Quyền theo vai trò/i.test(node.textContent||''))node.remove();
    });
    body.querySelectorAll('p.mut').forEach(node=>{
      if(/Quyền được áp dụng theo vai trò/i.test(node.textContent||''))node.remove();
    });

    const wrap=create('div','ac277-layout');

    const s1=create('section','ac277-section');
    s1.innerHTML='<div class="ac277-section-head"><div><h4>Thông tin tài khoản</h4><p>Tên đăng nhập được giữ cố định. Có thể cập nhật email liên hệ, chức danh và số điện thoại để phục vụ hiển thị nội bộ.</p></div></div>';
    const s1Body=create('div','ac277-section-body');
    const g1=create('div','ac277-grid');
    [nameLabel,loginLabel,personalMailLabel,positionLabel,phoneLabel,enabledLabel,roleLabel].filter(Boolean).forEach(el=>g1.appendChild(el));
    s1Body.appendChild(g1); s1.appendChild(s1Body);

    const s2=create('section','ac277-section');
    s2.innerHTML='<div class="ac277-section-head"><div><h4>Phạm vi phụ trách</h4><p>Chọn KTX và dãy mà tài khoản được phép truy cập. Có thể chọn nhiều mục khi cần.</p></div></div>';
    const s2Body=create('div','ac277-section-body');
    const g2=create('div','ac277-grid ac277-grid-compact');
    [ktxLabel,dayLabel].forEach(el=>g2.appendChild(el));
    s2Body.appendChild(g2); s2.appendChild(s2Body);

    const s3=create('section','ac277-section');
    s3.innerHTML='<div class="ac277-section-head"><div><h4>Quyền theo vai trò</h4><p>Các quyền bên dưới chỉ hiển thị để tham chiếu nhanh, được áp dụng theo vai trò đã chọn.</p></div></div>';
    const s3Body=create('div','ac277-section-body');
    perms.classList.add('ac277-perms');
    s3Body.appendChild(perms); s3.appendChild(s3Body);

    wrap.appendChild(s1);
    wrap.appendChild(s2);
    wrap.appendChild(s3);

    fields.innerHTML='';
    fields.classList.add('ac277-ready');
    fields.appendChild(wrap);
    return true;
  }

  function enhance(){
    const dialog=$('ac140Modal');
    if(!dialog)return;
    ensureHead(dialog);
    if(dialog.dataset.ac277Built==='1')return;
    if(buildLayout(dialog))dialog.dataset.ac277Built='1';
  }

  function observe(){
    const acc=$('acc');
    if(!acc)return;
    let scheduled=false;
    const run=()=>{
      scheduled=false;
      try{enhance()}catch(err){console.warn('KTX_STAGE77_MODAL',err);}
    };
    const queue=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(run);};
    new MutationObserver(queue).observe(acc,{childList:true,subtree:true});
    document.addEventListener('click',function(ev){
      const btn=ev.target && ev.target.closest ? ev.target.closest('[data-ac140-edit]') : null;
      if(btn)setTimeout(run,60);
    },true);
    if(document.readyState!=='loading')setTimeout(run,30);
    else document.addEventListener('DOMContentLoaded',()=>setTimeout(run,30),{once:true});
  }

  observe();
  window.KTXAccountModalRedesignV277={enhance};
})();

;
/* >>> Original: assets/js/modules/admin/ktx-account-fields-v291.js >>> */
/* Stage 91: SINGLE owner of account editor visual fields and scope dropdowns.
   The existing account authorisation/save flow remains the source of truth.
   Replaces Stage 84/87/89 UI adapters; does not update Supabase itself. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const suffix='@users.ktx-hoc-mon.app';
 let currentId='';
 let tick=0;
 function account(id){return Array.isArray(window.AUTHC?.accounts)?window.AUTHC.accounts.find(a=>String(a.user_id)===String(id)):null}
 function labelOf(id){return $(id)?.closest('label')||null}
 function replaceLabel(label,text){
   if(!label)return;
   const node=Array.from(label.childNodes).find(n=>n.nodeType===3&&n.textContent.trim());
   if(node)node.textContent=text;
   else label.insertBefore(document.createTextNode(text),label.firstChild);
 }
 function ensureEmail(){
   const modal=$('ac140Modal'),login=$('ac140Email');if(!modal||!login)return;
   const loginLabel=labelOf('ac140Email');
   replaceLabel(loginLabel,'Tên đăng nhập');
   login.readOnly=true;
   login.setAttribute('autocomplete','username');
   const hint=loginLabel?.querySelector('small');
   if(hint)hint.textContent='Định danh đăng nhập nội bộ · không chỉnh sửa';
   let email=$('ac275PersonalEmail');
   if(!email){
      const lbl=document.createElement('label');
      lbl.className='ac275-personal-label';
      lbl.append(document.createTextNode('Email cá nhân'));
      email=document.createElement('input');email.type='email';email.id='ac275PersonalEmail';
      email.name='personal_email';email.autocomplete='email';email.placeholder='vidu@gmail.com';email.maxLength=254;
      lbl.append(email);
      const note=document.createElement('small');note.id='ac275Hint';
      note.textContent='Email liên hệ; không thay đổi tên đăng nhập';lbl.append(note);
   }
   const outer=modal.querySelector('.ac277-section .ac277-grid')||modal.querySelector('.ac140-fields');
   const row=email?.closest('label');
   if(outer&&row&&row.parentElement!==outer){
      const position=labelOf('ac256Position');
      if(position&&position.parentElement===outer)outer.insertBefore(row,position);
      else if(loginLabel?.parentElement===outer)loginLabel.insertAdjacentElement('afterend',row);
      else outer.appendChild(row);
   }
   row?.classList.remove('hide');
   if(row){row.style.removeProperty('display');row.hidden=false}
 }
 function syncScope(original){
   if(!original || original.tagName!=='SELECT')return;
   const id=original.id;
   const native=original.closest('label')?.querySelector('select[data-ktx291-for="'+id+'"]');
   if(!native)return;
   const originalOptions=[...original.options];
   const chosen=originalOptions.filter(o=>o.selected).map(o=>o.value);
   const fingerprint=originalOptions.map(o=>o.value+'|'+o.textContent).join('\u0001');
   if(native.dataset.items!==fingerprint){
      native.replaceChildren();
      const all=new Option('Tất cả / Không giới hạn','');native.add(all);
      originalOptions.forEach(o=>native.add(new Option(o.textContent,o.value)));
      native.dataset.items=fingerprint;
   }
   // Previous multi-scope assignments remain intact until explicitly changed.
   if(chosen.length>1){
      if(![...native.options].some(o=>o.value==='__preserve'))native.add(new Option('Nhiều phạm vi đang cấp · giữ nguyên','__preserve'),1);
      native.value='__preserve';
   }else{
      const keep=[...native.options].find(o=>o.value==='__preserve');if(keep)keep.remove();
      native.value=chosen[0]||'';
   }
 }
 function ensureScope(id){
   const original=$(id);if(!original)return;
   // V2.0.20: Checkbox groups are the real editable scope UI.
   // Legacy select conversion must not hide, replace, or clear them.
   if(original.matches('.ac140-checkbox-grid') || original.querySelector('input[type=checkbox]')){
      original.classList.remove('ktx291-scope-source');
      original.removeAttribute('aria-hidden');
      original.removeAttribute('tabindex');
      const box=original.closest('.ac140-scope-field');
      box?.querySelectorAll('select[data-ktx291-for]').forEach(n=>n.remove());
      return;
   }
   const label=original.closest('label');if(!label)return;
   original.classList.add('ktx291-scope-source');
   original.setAttribute('aria-hidden','true');original.tabIndex=-1;
   // The native HTML <select> is a normal dropdown without checkboxes.
   let native=label.querySelector('select[data-ktx291-for="'+id+'"]');
   if(!native){
      native=document.createElement('select');
      native.dataset.ktx291For=id;
      native.className='ktx291-scope-choice';
      native.setAttribute('aria-label',id==='ac140Ktx'?'Phạm vi KTX':'Phạm vi Dãy');
      original.insertAdjacentElement('afterend',native);
      native.addEventListener('change',()=>{
        if(native.value==='__preserve')return;
        const chosen=native.value;
        for(const opt of original.options)opt.selected=Boolean(chosen)&&opt.value===chosen;
        original.dispatchEvent(new Event('change',{bubbles:true}));
        syncScope(original);
      });
   }
   label.querySelectorAll('.ac284-scope-button,.ac284-scope-panel,.ac287-simple-dropdown,.ac287-scope-trigger,.ac287-scope-panel').forEach(n=>{if(n!==native)n.remove()});
   label.classList.remove('ac277-span-2');
   syncScope(original);
 }
 function fill(id){
   const a=account(id);if(!a)return;
   const login=$('ac140Email'),email=$('ac275PersonalEmail');
   if(login){const full=String(a.email||'');login.value=full.toLowerCase().endsWith(suffix)?full.slice(0,-suffix.length):full;}
   if(email){email.value=String(a.personal_email||'');email.setCustomValidity('');}
 }
 function refresh(id){
   const modal=$('ac140Modal');if(!modal)return;
   ensureEmail();ensureScope('ac140Ktx');ensureScope('ac140Days');
   if(id)fill(id);
 }
 function start(){
   const acc=$('acc');if(!acc)return;
   document.addEventListener('click',function(e){
     const b=e.target?.closest?.('[data-ac140-edit]');if(!b)return;
     currentId=b.dataset.ac140Edit||'';
     queueMicrotask(()=>refresh(currentId));
     requestAnimationFrame(()=>refresh(currentId));
     setTimeout(()=>refresh(currentId),120);
   },true);
   // Account page is replaced after each reload; no duplicate editor trees.
   const obs=new MutationObserver(()=>{
     if(tick)return;tick=1;
     requestAnimationFrame(()=>{tick=0;refresh('')});
   });
   obs.observe(acc,{childList:true});
   refresh('');
   // Watch the editor's recreated form, not only the outer #acc replacement.
   const onModal=()=>{
     const modal=$('ac140Modal');
     if(!modal || modal.__ktx92Watch)return;
     modal.__ktx92Watch=true;
     let queued=false;
     new MutationObserver(()=>{
       if(queued)return;
       queued=true;
       requestAnimationFrame(()=>{queued=false;refresh('')});
     }).observe(modal,{childList:true,subtree:true});
   };
   const onAcc=new MutationObserver(()=>onModal());
   onAcc.observe(acc,{childList:true});
   onModal();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.KTXAccountFieldsV291={refresh};
})();

;
/* >>> Original: assets/js/modules/admin/ktx-system-config-page-v291.js >>> */
/* Stage 91: System Configuration is a separate page launched from the System
   Functions hub. Uses existing configuration editor actions and permission gates. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 function isAdmin(){return typeof window.can==='function'&&window.can('acct')}
 const entries=[
  {text:'Cấu hình thương hiệu',icon:'🎨',action(){window.KTXBrand?.open?.()},public:true},
  {text:'Cài đặt hệ thống',icon:'⚙️',action(){
    if(typeof window.KTXOpenSystemSettings==='function')window.KTXOpenSystemSettings();
    else $('ktx159SettingsMenu')?.click();
  }},
  {text:'Đổi tên tiện ích',icon:'✏️',action(){
    if(typeof window.KTXOpenUtilityRename==='function')window.KTXOpenUtilityRename();
    else $('ktxRenameOpen2196')?.click();
  }}
 ];
 function page(){
   let el=$('sysconfig');if(el)return el;
   const main=document.querySelector('main');if(!main)return null;
   el=document.createElement('section');el.id='sysconfig';el.className='hide ktx287-config-page';
   const grid=document.createElement('div');grid.className='ktx287-config-grid';el.append(grid);
   entries.forEach(x=>{
      const card=document.createElement('article');card.className='ktx287-config-card';
      const ico=document.createElement('div');ico.className='ktx287-config-icon';ico.textContent=x.icon;
      const title=document.createElement('h3');title.textContent=x.text;
      const button=document.createElement('button');button.className='btn s';button.type='button';button.textContent='Mở cấu hình';
      button.onclick=()=>{if(!x.public&&!isAdmin())return alert('Chỉ Quản trị được chỉnh sửa cài đặt này.');x.action()};
      card.append(ico,title,button);grid.append(card);
   });
   main.append(el);return el;
 }
 function open(){
   const section=page();if(!section)return;
   // Navigate through the authorised System Functions route first, then open
   // a dedicated full-page section. Does not depend on missing T/GN keys.
   if(typeof window.go==='function')window.go('sysfunc');
   $('sysfunc')?.classList.add('hide');
   section.classList.remove('hide');
   document.body.dataset.page='sysconfig';
   if($('ttl'))$('ttl').textContent='Cấu hình hệ thống';
   if($('sub'))$('sub').textContent='';
   if($('eb'))$('eb').textContent='HỆ THỐNG';
   try{window.scrollTo(0,0)}catch(_){ }
 }
 function install(){
   $('ktxConfigPageNav287')?.remove();
   const hub=$('sysfunc');if(!hub)return;
   // Remove any legacy duplicates before inserting a single launcher.
   hub.querySelector('#ktxConfigOpen289')?.remove();
   hub.querySelector('#ktxConfigOpen2198')?.remove();
   const target=hub.querySelector('.sysfunc-group .sysfunc-grid');if(!target)return;
   // Bỏ nút trung gian Cấu hình hệ thống; ba chức năng được mở trực tiếp ở Chức năng hệ thống.
   hub.querySelector('#ktxConfigOpen291')?.remove();
   $('sysconfig')?.classList.add('hide');
   // A dedicated injected page is not necessarily in legacy go()'s page list.
   // Hide it whenever navigation opens a different page.
   if(!document.documentElement.dataset.ktx92ConfigNav){
     document.documentElement.dataset.ktx92ConfigNav='1';
     document.addEventListener('click',function(ev){
       const nav=ev.target?.closest?.('nav [data-p], .system-hub-nav[data-p]');
       if(nav && nav.dataset.p!=='sysconfig')$('sysconfig')?.classList.add('hide');
     },true);
   }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
 window.KTXSystemConfigV291={open,install};
})();


/* QLKTX UI FIX: Populate role-based permission checkboxes in redesigned edit-account modal.
   Read-only display; actual authorization remains on Supabase and application RBAC. */
(function(){
  'use strict';
  const labels=[
    ['view','Xem dữ liệu'],['add','Thêm hồ sơ'],['editw','Sửa hồ sơ'],
    ['transfer','Chuyển phòng'],['residence','Đăng ký tạm trú'],
    ['attendance','Vào / Ra'],['del','Xóa hồ sơ'],['restore','Khôi phục'],
    ['qrApprove','Duyệt QR'],['import','Nhập Excel'],['report','Xuất báo cáo'],
    ['backup','Sao lưu'],['acct','Quản lý tài khoản']
  ];
  function render(){
    const modal=document.getElementById('ac140Modal');
    const target=modal?.querySelector('#ac140Perms');
    const role=modal?.querySelector('#ac140EditRole');
    if(!modal||!target||!role)return;
    // Do not replace a properly populated list from the base app.
    if(target.querySelectorAll('input[type="checkbox"]').length>=labels.length && target.dataset.qlktxCheckboxRole===role.value)return;
    const map=(typeof ROLE_PERMS!=='undefined' && ROLE_PERMS)? ROLE_PERMS : {};
    const perm=map[role.value];
    target.replaceChildren();
    if(role.value==='vault_only'){
      const msg=document.createElement('p');
      msg.textContent='Vai trò Kho tài liệu: quyền xem, tải, thêm và xóa được kiểm tra theo phân quyền thực tế trên Supabase; không cấp quyền tại màn hình này.';
      msg.style.cssText='grid-column:1/-1;margin:0 0 8px;color:#466183;font-size:12px';
      target.appendChild(msg);
      const vault=[['Xem tài liệu'],['Tải tài liệu'],['Thêm tài liệu'],['Xóa tài liệu']];
      vault.forEach(([name])=>{const label=document.createElement('label');const box=document.createElement('input');box.type='checkbox';box.disabled=true;box.setAttribute('aria-label',name+' - quyền do Supabase quyết định');const caption=document.createElement('span');caption.textContent=name+' (theo Supabase)';label.append(box,caption);target.appendChild(label);});
    }else{
      labels.forEach(([key,title])=>{
        const label=document.createElement('label');
        const box=document.createElement('input');box.type='checkbox';box.disabled=true;
        box.checked=!!(perm && perm[key]);
        box.setAttribute('aria-label',title+' - chỉ hiển thị');
        const caption=document.createElement('span');caption.textContent=title;
        label.append(box,caption);target.appendChild(label);
      });
    }
    target.dataset.qlktxCheckboxRole=role.value;
    target.style.display='grid';
    target.style.gridTemplateColumns='repeat(auto-fit,minmax(165px,1fr))';
    target.style.gap='8px';
    target.style.minHeight='auto';
  }
  function schedule(){setTimeout(render,0);setTimeout(render,100);}
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-ac140-edit]'))schedule();},true);
  document.addEventListener('change',e=>{if(e.target?.id==='ac140EditRole')schedule();},true);
  const obs=new MutationObserver(()=>{
    const modal=document.getElementById('ac140Modal');
    if(modal?.open && !modal.querySelector('#ac140Perms input[type="checkbox"]'))schedule();
  });
  function start(){obs.observe(document.body,{childList:true,subtree:true});schedule();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


/* QLKTX MENU FINAL 2026-11-17: one visible shortcut per setting, no org/directory in System/Utilities. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/\s+/g,' ').trim();
 const nameOf=el=>norm(el?.querySelector('b')?.textContent||el?.querySelector('strong')?.textContent||el?.textContent||'');
 let running=false,queued=false;
 const canAdmin=()=>{try{return typeof window.can==='function'&&!!window.can('acct')}catch(_){return false}};
 function action(kind){
   if(kind!=='brand'&&!canAdmin())return alert('Chỉ tài khoản Quản trị được chỉnh sửa cấu hình này.');
   if(kind==='brand'){
     if(typeof window.KTXBrand?.open==='function')return window.KTXBrand.open();
   }else if(kind==='settings'){
     if(typeof window.KTXOpenSystemSettings==='function')return window.KTXOpenSystemSettings();
     const b=$('ktx159SettingsMenu');if(b)return b.click();
   }else if(kind==='rename'){
     if(typeof window.KTXOpenUtilityRename==='function')return window.KTXOpenUtilityRename();
     const b=$('ktxRenameOpen2196');if(b)return b.click();
   }
   alert('Chức năng chưa sẵn sàng, vui lòng mở lại trang.');
 }
 const specs=[
   {key:'brand',title:'Cấu hình thương hiệu',summary:'Tên ứng dụng, logo và ảnh nền.',icon:'#i-cog',id:'ktxBrandAdminButton'},
   {key:'settings',title:'Cài đặt hệ thống',summary:'Thông số và sức chứa KTX.',icon:'#i-cog',id:'ktx113Settings'},
   {key:'rename',title:'Đổi tên tiện ích',summary:'Điều chỉnh tên các tiện ích.',icon:'#i-edit',id:'ktx113Rename'}
 ];
 function candidate(el){
   if(el.closest('.ktx-config2198'))return null;
   const id=el.id||'',nm=nameOf(el);
   if(['ktxConfigOpen2198','ktxConfigOpen289','ktxConfigOpen291','org256-sysbtn'].includes(id)||el.classList.contains('org256-sysbtn'))return 'remove';
   if(id==='ktx159SettingsMenu')return 'legacy';
   if(nm==='cau hinh he thong'||nm==='so do to chuc'||nm==='ds trich ngang cbnv'||nm==='danh sach trich ngang cbnv')return 'remove';
   if(id==='ktxBrandAdminButton'||nm==='cau hinh thuong hieu')return 'brand';
   if(id==='ktx113Settings'||nm==='cai dat he thong')return 'settings';
   if(id==='ktx113Rename'||nm==='doi ten tien ich')return 'rename';
   return null;
 }
 function newButton(spec){
   const b=document.createElement('button');b.type='button';b.id=spec.id;
   b.className='sysfunc-btn sf-purple ktx-menu-final-ctrl';
   b.innerHTML='<span class="sficon"><svg class="i"><use href="'+spec.icon+'"></use></svg></span><span><b>'+spec.title+'</b><small>'+spec.summary+'</small></span>';
   return b;
 }
 function scrubCards(root,isUtil){
   if(!root)return;
   const buttons=Array.from(root.querySelectorAll('.sysfunc-grid > button,.sysfunc-grid > a,.sysfunc-grid > [role="button"]'));
   for(const b of buttons){
     const kind=candidate(b);
     if(kind==='remove'||(isUtil&&['brand','settings','rename'].includes(kind))){b.remove();}
   }
 }
 function normalize(){
   if(running)return;running=true;
   try{
     const hub=$('sysfunc'),util=$('utilhub');
     scrubCards(util,true);
     // Keep legacy rename action callable by JS but do not show it under Tiện ích.
     const oldRename=util?.querySelector('#ktxRenameOpen2196');
     if(oldRename){oldRename.hidden=true;oldRename.style.setProperty('display','none','important')}
     if(!hub)return;
     const main=hub.querySelector('.sysfunc-group .sysfunc-grid');if(!main)return;
     const found=new Map();
     // One visible destination for each function. Remove all duplicate/orphan entries.
     hub.querySelectorAll('.sysfunc-grid > button,.sysfunc-grid > a,.sysfunc-grid > [role="button"]').forEach(b=>{
       const kind=candidate(b);
       if(kind==='remove'){b.remove();return}
       if(kind==='legacy'){b.style.setProperty('display','none','important');return}
       if(!kind)return;
       if(found.has(kind)){
         // Native page links keep their original, working onClick handlers.
         const current=found.get(kind);
         const preferNative=kind==='settings' && b.hasAttribute('data-sys-go') && !current.hasAttribute('data-sys-go');
         if(preferNative){current.remove();found.set(kind,b)}else b.remove();
         return;
       }
       found.set(kind,b);
     });
     specs.forEach(spec=>{
       let b=found.get(spec.key);
       if(!b){b=newButton(spec);main.appendChild(b)}
       else{if(b.id!==spec.id){b.removeAttribute('id');}if(b.parentElement!==main)main.appendChild(b)}
       b.classList.remove('ktx-config2198-legacy','ktx287-legacy-hidden');
       b.classList.add('ktx-menu-final-ctrl');
       b.removeAttribute('hidden');
       b.style.setProperty('display','flex','important');
       b.style.setProperty('visibility','visible','important');
       const label=b.querySelector('b');if(label&&label.textContent!==spec.title)label.textContent=spec.title;
       if(b.id!==spec.id && !$(spec.id))b.id=spec.id;
       // Preserve native handlers on existing functional cards; handle only synthetic cards.
       if(b.classList.contains('ktx-menu-final-ctrl') && b.dataset.ktxMenuFinal!==spec.key){
          b.dataset.ktxMenuFinal=spec.key;
          b.addEventListener('click',event=>{
            event.preventDefault();event.stopImmediatePropagation();action(spec.key)
          },true);
       }
     });
     // Remove legacy configuration launcher even if created outside the system grid.
     hub.querySelectorAll('#ktxConfigOpen2198,#ktxConfigOpen289,#ktxConfigOpen291,.org256-sysbtn').forEach(b=>b.remove());
     // Do not expose a second configuration panel as another visible menu tile.
     $('ktxConfigHub2198')?.setAttribute('hidden','');
   }finally{running=false}
 }
 function schedule(){if(queued||running)return;queued=true;requestAnimationFrame(()=>{queued=false;normalize()})}
 function start(){
   normalize();
   const hub=$('sysfunc'),util=$('utilhub');
   [hub,util].filter(Boolean).forEach(root=>new MutationObserver(schedule).observe(root,{childList:true,subtree:true}));
   document.addEventListener('click',ev=>{if(ev.target.closest('[data-p="sysfunc"],[data-p="utilhub"]'))schedule()},true);
   document.addEventListener('ktx:page-changed',schedule);
   // Pages are rebuilt by window.systemFunctionsPage on navigation; normalize right after each rebuild.
   const render=window.systemFunctionsPage;
   if(typeof render==='function'&&!render.__ktxMenuFinal){
     const wrapper=function(){const result=render.apply(this,arguments);schedule();return result};
     wrapper.__ktxMenuFinal=true;window.systemFunctionsPage=wrapper;
   }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
