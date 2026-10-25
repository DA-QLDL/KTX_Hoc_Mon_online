# v1.0.24 — Danh sách người gửi điểm danh

- Danh sách yêu cầu QR hiện cả chờ duyệt, đã duyệt và từ chối, có tìm kiếm và lọc trạng thái.
- Giữ xác minh quyền truy cập và chức năng duyệt yêu cầu chờ.
- Giới hạn hiển thị 1.000 yêu cầu mới nhất; cần phân trang server nếu dữ liệu lớn.
- Không cần thay đổi cấu trúc Supabase; tài khoản quản lý phải có quyền SELECT theo chính sách RLS.
