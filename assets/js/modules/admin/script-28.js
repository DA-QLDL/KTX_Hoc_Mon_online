/* v1.0.107 — Cloud-only: local IndexedDB snapshots removed.
   This page is informational; do not claim offline restore is available. */
const SAFETY_DB='ktx_safety_db_v1',SAFETY_STORE='snapshots',SAFETY_MAX=0;
async function safetyList(){return []}
async function safetySnapshot(){return null}
async function safetyGet(){return null}
async function safetyRestore(){alert('Khôi phục cục bộ đã ngừng hỗ trợ. Hãy sử dụng bản sao Supabase sau khi xác minh quyền và giao dịch khôi phục.')}
async function safetyDelete(){alert('Ứng dụng không còn quản lý điểm khôi phục cục bộ mới.')}
async function safetyConfirmPurge(count,label){
  return !!(await ask(`${label||'Xóa hẳn'} ${Number(count||0).toLocaleString('vi-VN')} công nhân?\n\nKhông tạo bản sao IndexedDB trên thiết bị. Hãy xác minh bản sao Cloud trước khi xóa.`,{title:'Xác nhận xóa dữ liệu',ok:'Tiếp tục xóa'}));
}
async function safetyPage(){
 const el=$('safety');if(!el)return;
 el.innerHTML='<div class="card"><h3>Sao lưu tập trung Supabase</h3><p class="mut">Chế độ Cloud-Only không tạo hay khôi phục bản sao công nhân trên thiết bị. Dùng mục Sao lưu Supabase để tải bản sao mới nhất. Các bản IndexedDB cũ trên thiết bị không được ứng dụng tự xóa.</p></div>';
}
/* Legacy local snapshot wrappers intentionally not installed.
   Existing business action authorization and confirmation remain with owning modules. */
