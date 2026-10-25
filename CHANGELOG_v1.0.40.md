# v1.0.40 — Dãy Xem tất cả & Touch Feedback

- Mở nút Xem tất cả trên Quản lý dãy Mobile mà không yêu cầu flag view_all_days trên tài khoản cũ. Phạm vi sửa/xóa/thêm **không thay đổi** (vẫn kiểm tra assigned/can/inScope).
- Trong chế độ chỉ xem, hiển thị toàn bộ dãy dựa trên dữ liệu W đã tải. Không vượt quyền RLS Supabase; nếu tài khoản không tải được hồ sơ ngoài phạm vi, cần điều chỉnh chính sách SELECT an toàn ở server.
- Giảm các hiệu ứng hover/active/animation gây nháy nhiều nút trên PC và Mobile.
- Kế thừa đầy đủ tính năng v1.0.39.
