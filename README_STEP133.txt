KTX HÓC MÔN · STEP133 · QUẢN TRỊ & TRUY CẬP HOÀN CHỈNH

1. Upload toàn bộ các file trong thư mục này lên GitHub trong CÙNG MỘT commit.
2. Trong Supabase > SQL Editor, chạy toàn bộ file: 012_auth_access_upgrade.sql
3. Đăng xuất / đăng nhập lại ứng dụng một lần.

Đã triển khai:
- Đăng nhập tập trung bằng Supabase Auth cho toàn ứng dụng.
- QR dùng chung phiên đăng nhập, bỏ đăng nhập QR riêng.
- Đăng xuất phiên hiện tại / các phiên khác / mọi thiết bị.
- Tạo tài khoản mới từ màn hình đăng nhập và gửi yêu cầu chờ duyệt.
- Quản lý tài khoản: tìm kiếm, lọc vai trò, trạng thái, phạm vi KTX/Dãy, khóa/mở.
- Bảo vệ Quản trị cuối cùng khỏi bị khóa/hạ quyền.
- 5 vai trò: Quản trị, Quản lý, Nhập liệu, Bảo vệ, Chỉ xem.
- Phạm vi KTX/Dãy được kiểm tra khi xem/sửa hồ sơ chính.
- Nhật ký sự kiện đăng nhập/đăng xuất/thay đổi quyền.
- Trang Phiên đăng nhập & bảo mật được nâng cấp.

Lưu ý:
- Không dùng service_role ở trình duyệt.
- App client không thể liệt kê chi tiết tất cả session của mọi user; chỉ có thể thu hồi session của chính tài khoản đang đăng nhập bằng Supabase Auth scope.

STEP134 UI UPDATE (18/10/2026)
- Tách màn hình đăng nhập khỏi toàn bộ giao diện KTX: khi chưa xác thực chỉ hiển thị form đăng nhập.
- Ẩn sidebar, dashboard, chức năng hệ thống và user bar cho tới khi đăng nhập thành công.
- Đồng bộ nút theo phong cách nền trắng, viền rõ, bóng nhẹ; giảm mảng màu rời rạc.
- Chức năng hệ thống giữ 4 cụm nối tiếp trên cùng hàng khi đủ chiều ngang; chỉ xuống hàng khi thiếu chỗ.
- Các khối và nút hệ thống dùng viền nhận diện thay cho nền màu.
