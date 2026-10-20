# STEP213 — Xem thực đơn mobile + Menu Cloud

- Đổi mục Kiểm tra Menu NCC (mới) thành **Xem thực đơn** trên PC và Mobile.
- Giữ tên **Báo cáo suất ăn** cho nút Mobile.
- Trang Xem thực đơn mới có nút tải Cloud, nút lưu Cloud chỉ dành cho Admin/Manager; lưu có xác nhận và không tự ghi dữ liệu công nhân.
- Báo cáo suất ăn Mobile đọc bảng ktx_meal_menus theo ngày/bữa/NCC để hiển thị món Mặn/Chay, không tự ý ghi đè số lượng TĐ 8/11.1/11.3.
- **Số lượng suất ăn đang lưu trong trạng thái RP cục bộ**, chưa có bảng Cloud riêng; bản này chỉ đồng bộ **thực đơn**. Cần thiết kế bảng báo cáo riêng để đồng bộ số lượng hai chiều, không ghi vào bảng thực đơn.
- Yêu cầu bảng `ktx_meal_menus` và RLS đã cấu hình. Không có SQL mới.
- Nếu không thấy Cloud: kiểm tra Supabase và quyền RLS; không xóa dữ liệu cũ.
