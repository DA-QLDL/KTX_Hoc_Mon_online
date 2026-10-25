# v1.0.28 – Màn hình xác nhận gửi thành công

- Đăng ký vào/ra: sau khi Supabase INSERT thành công, ẩn biểu mẫu và hiển thị màn hình hoàn tất riêng.
- Điểm danh QR: chuyển sang màn hình hoàn tất riêng sau INSERT thành công.
- Nếu INSERT lỗi: không đổi màn hình, giữ dữ liệu và thông báo lỗi để thử lại.
- Cho phép gửi hồ sơ mới bằng cách tải lại biểu mẫu.
- Không thay đổi SQL, phân quyền hay cấu trúc dữ liệu.
