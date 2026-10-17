STEP123 - Sửa lỗi trang Chức năng hệ thống trống.
Nguyên nhân: hàm render hub bị khai báo trong scope nội bộ nên router không gọi được.
Đã đưa renderer ra window.systemFunctionsPage và giữ sidebar chỉ còn một nút Chức năng hệ thống.
Service Worker cache được tăng phiên bản để nhận giao diện mới.
