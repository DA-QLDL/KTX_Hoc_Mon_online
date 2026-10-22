
(function(){
 const old=window.accessControlPage;
 window.accessControlPage=async function(){
   if(typeof can==='function'&&!can('acct'))return old&&old();
   if(typeof authLoadAdminData==='function')await authLoadAdminData();
   const groups=[
     ['Hồ sơ và cư trú',[['view','Xem'],['add','Thêm'],['editw','Sửa'],['transfer','Chuyển phòng'],['residence','Tạm trú']]],
     ['Vận hành và QR',[['attendance','Vào / ra'],['qrApprove','Duyệt QR'],['report','Báo cáo'],['import','Import'],['bulk','Hàng loạt']]],
     ['Dữ liệu nhạy cảm',[['del','Xóa'],['restore','Khôi phục'],['purge','Xóa vĩnh viễn'],['backup','Sao lưu'],['acct','Tài khoản']]]
   ];
   const el=document.getElementById('access');if(!el)return;
   el.innerHTML='<div class="sysfunc-intro"><div><h3>Phân quyền theo nhóm chức năng</h3><p>Ma trận dưới đây phản ánh vai trò chuẩn. Quản lý phạm vi KTX/Dãy tại Quản lý tài khoản; quyền truy cập thực tế do Supabase RLS kiểm soát.</p></div></div><div class="step145-matrix">'+groups.map(([name,fields])=>'<div class="card"><h3>'+name+'</h3><div class="wrap"><table class="step145-perm-table"><thead><tr><th>Vai trò</th>'+fields.map(([k,label])=>'<th>'+label+'</th>').join('')+'</tr></thead><tbody>'+Object.entries(ROLES).map(([role,label])=>'<tr><td>'+label+'</td>'+fields.map(([key])=>'<td class="'+(ROLE_PERMS[role]&&ROLE_PERMS[role][key]?'yes':'no')+'">'+(ROLE_PERMS[role]&&ROLE_PERMS[role][key]?'✓':'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></div>').join('')+'</div><div class="card"><h3>Tài khoản & phạm vi phụ trách</h3><div class="scope-note">Cập nhật vai trò, phạm vi và kích hoạt tại Quản lý tài khoản. Không cấp quyền nhạy cảm chỉ qua giao diện.</div><button class="btn s" id="step145GoAccounts">Mở Quản lý tài khoản</button></div>';
   document.getElementById('step145GoAccounts').onclick=()=>go('acc');
 };
 const enhance=()=>{const el=document.getElementById('ahMsg');if(!el)return;const value=(el.textContent||'');if(/email rate limit exceeded/i.test(value))el.textContent='Supabase đã đạt giới hạn gửi email. Hãy chờ giới hạn được đặt lại hoặc cấu hình SMTP riêng trong Supabase → Authentication → SMTP Settings. Không gửi yêu cầu liên tục.'};
 new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
