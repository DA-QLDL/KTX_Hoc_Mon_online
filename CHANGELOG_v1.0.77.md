# v1.0.77 — Khôi phục công nhân PC lên Supabase

- Admin chủ động sao lưu JSON và nhập số lượng xác nhận.
- Chỉ khôi phục ktx_workers, ghi theo đợt 100, không đè nội dung khác trên Cloud.
- Hỗ trợ chạy lại sau khi thất bại nếu phần đã ghi trùng khớp PC.
- Xác minh mọi hồ sơ trên Cloud sau khi ghi.
- Không tự mở khóa đồng bộ toàn ứng dụng hoặc thay đổi dữ liệu bảng khác.
