# STEP212 — Sửa giao diện QR, tìm kiếm và lược bỏ nút trùng

- Đã thêm lựa chọn **Quét QR** vào màn hình QR mobile, chỉ hiển thị khi vai trò có quyền điểm danh. Camera cần HTTPS, quyền Camera trên điện thoại và trình duyệt có hỗ trợ BarcodeDetector; nếu không hỗ trợ vẫn có nhập mã thủ công qua tiện ích.
- Tránh gọi `go("qr")` lặp lại khi dựng màn hình mobile.
- Tránh dựng lại HTML khi input đang có focus, bảo vệ bàn phím ảo; hỗ trợ vùng nhấn trên ô tìm kiếm.
- Bỏ nút Chuyển phòng trùng ở Tổng quan mobile, vẫn có trong hồ sơ công nhân.
- Bỏ nút cũ Theo dõi suất ăn / Xem thực đơn ở mobile và PC; **giữ Kiểm tra Menu NCC** và Báo cáo suất ăn.
- Không chỉnh Supabase, worker records, QR approval logic, Cloud, SQL.

Chỉ cập nhật `index.html` trên nhánh thử nghiệm. Chưa được kiểm thử trực tiếp trên thiết bị của anh hay Vercel.
