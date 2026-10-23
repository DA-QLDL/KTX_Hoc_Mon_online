
window.addEventListener('unhandledrejection',e=>{const m=String(e.reason&&e.reason.message||e.reason||'');if(/app_accounts|access_requests|Không tìm thấy tài khoản|RLS|phân quyền|permission/i.test(m)){console.error('KTX_ACCOUNT_ACTION',m);alert('Lỗi quản lý tài khoản: '+m)}});
