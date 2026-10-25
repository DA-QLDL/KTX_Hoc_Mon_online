# v1.0.25 – Đối chiếu QR điểm danh

- Đối chiếu duy nhất mã NV + họ tên với danh sách công nhân tổng.
- Tự động duyệt các yêu cầu đang chờ có KTX, Dãy, Phòng trùng khớp, thông qua phiên quản lý đã xác thực và có quyền duyệt. Mỗi lần tải tối đa 30 yêu cầu.
- Ghi chú vị trí thực tế KTX – Dãy – Phòng khi người điểm danh khai vị trí khác; không tự sửa dữ liệu công nhân.
- Người không tìm thấy và hồ sơ trùng cần xử lý thủ công.
- Không thay đổi RLS hoặc cấp quyền UPDATE cho khách công khai.

Kiểm thử trên Preview với 3 trường hợp: khớp hoàn toàn / khác phòng / không có trong danh sách tổng; kiểm tra refresh và đồng bộ Cloud.
