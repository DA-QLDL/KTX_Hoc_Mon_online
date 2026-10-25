# KTX Hóc Môn v1.0.43 — QR HUB MENU

## Nội dung cập nhật
- Tổ chức lại toàn bộ tiện ích **QR code** theo dạng **trung tâm quản lý thống nhất**.
- Bổ sung 6 nhóm chức năng chính trong QR code:
  1. Đăng ký vào
  2. Đăng ký ra
  3. Điểm danh QR
  4. Trung tâm duyệt
  5. Lịch sử
  6. Báo cáo
- Hiển thị thẻ thống kê nhanh số lượng hồ sơ chờ duyệt.
- Trung tâm duyệt gom đăng ký vào, đăng ký ra và điểm danh QR vào cùng một nơi.
- Lịch sử cho phép xem các hồ sơ đã duyệt / từ chối từ Supabase.
- Báo cáo mở trực tiếp giao diện bảng điểm danh QR để xuất Excel và đối chiếu.

## Ghi chú kỹ thuật
- Kế thừa nền từ v1.0.42_UI_ROOMTYPE_WORKERBAR.
- Không thay đổi cấu trúc dữ liệu hiện có.
- Các màn hình cũ vẫn giữ logic gốc, phần mới chủ yếu sắp xếp lại luồng truy cập và trình bày.
