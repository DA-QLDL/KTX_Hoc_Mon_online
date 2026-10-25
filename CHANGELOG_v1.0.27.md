# v1.0.27 – Unified UI

Dựa trên mẫu QR điểm danh đã chốt. Áp dụng bộ thiết kế thống nhất trên toàn ứng dụng: sidebar, tiêu đề, card, bảng dữ liệu, biểu mẫu, nút và responsive.

- Bổ sung `assets/css/ktx-unified-theme-127.css` ở cuối chuỗi CSS để hạn chế tác động nghiệp vụ.
- Không thay đổi JS, API, SQL, quyền truy cập hoặc dữ liệu.
- Giữ nguyên giao diện PC/Mobile suất ăn theo bản v1.0.18 như đã thống nhất trong v1.0.22.
- Cập nhật tên cache PWA.

## Giới hạn
Đây là đợt chuẩn hóa style xuyên ứng dụng. Một số module có CSS đặc thù cần kiểm thử trực quan trên PC/Android/iOS để điều chỉnh thêm. Chưa kiểm thử E2E thực tế với Supabase và thiết bị thật.
