# v1.0.76 — Chẩn đoán dữ liệu Cloud / RLS an toàn
- Phân biệt số công nhân (`ktx_workers`) với số trạng thái cư trú (`ktx_residence_status`) trong trang Đồng bộ Supabase.
- Cảnh báo khi công nhân trả 0 nhưng bảng trạng thái cư trú có dữ liệu.
- Kèm SQL chỉ đọc để đối chiếu số liệu, cấu trúc payload và chính sách RLS.
- Không sửa chính sách RLS, không sao chép dữ liệu giữa bảng, không xóa hoặc tự nhập dữ liệu.
- Chưa xác nhận số công nhân thực tế trong Production vì không truy cập trực tiếp Supabase của người dùng.
