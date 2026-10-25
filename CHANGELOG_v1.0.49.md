# KTX Hóc Môn v1.0.49 — Mobile Startup Fix

- Sửa literal `\n` xuất hiện trên màn hình do HTML chứa text node lỗi.
- Bảo vệ luồng khởi tạo đăng nhập Supabase khỏi lỗi getSession hoặc thiếu SDK.
- Thêm thông báo và nút tải lại nếu màn hình không khởi tạo được; không xóa bộ nhớ hoặc dữ liệu người dùng.
- Cập nhật cache PWA để giảm nguy cơ máy tiếp tục dùng giao diện cũ.
- Không thay đổi dữ liệu vận hành, phân quyền hoặc SQL.
- Chưa nghiệm thu với tài khoản thật trên Android/iPhone.
