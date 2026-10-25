# v1.0.23 – Phiên điểm danh theo KTX/Dãy/Phòng
- Giữ mở/đóng/xóa phiên của v1.0.21; chọn phiên bằng nút Xem trong danh sách.
- Danh sách trong phiên lấy phạm vi KTX, Dãy, Phòng **của phiên**, không lấy bộ lọc đang dùng để tạo phiên mới.
- Hai trạng thái trong danh sách công nhân: Đã điểm danh / Chưa điểm danh. Người dùng có quyền có thể tick và lưu trạng thái thủ công lên Supabase; phiên đóng chỉ xem.
- Người **Chưa đăng ký** hiển thị trong tab riêng khi đã có yêu cầu QR với mã NV không tồn tại trong danh sách tổng; không tự gán người vắng mặt vào nhóm chưa đăng ký.
- Xuất Excel riêng nhóm Chưa đăng ký (nếu có hồ sơ), đồng thời xuất bảng điểm danh.
- SQL 16: thêm bảng lưu tick và cập nhật RPC xóa phiên; không thay các bảng công nhân.
- Chưa kiểm thử trực tiếp Supabase Production, PWA iOS/Android. Cần thử trên phiên mẫu trước.
