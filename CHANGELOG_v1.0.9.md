# KTX Hóc Môn v1.0.9 – Chờ đồng bộ trước khi xóa tất cả

- Trước khi xóa hàng loạt, dừng lịch tải tự động đang chờ và chờ tối đa 15 giây để các thao tác đồng bộ hiện tại kết thúc.
- Chỉ tiếp tục khi Supabase đã sẵn sàng, không có lỗi chưa xử lý, không có xung đột, và hàng đợi đã đẩy xong.
- Giữ xác nhận nhập `XÓA TẤT CẢ`, so khớp tổng Cloud và số ID, xác thực từng đợt xóa.
- Không ép xóa khi Cloud lỗi hoặc không thể xác minh.

**Giới hạn:** Chưa kiểm thử với Supabase Production. Xóa nhiều đợt vẫn không nguyên tử; cần backup trước khi nghiệm thu.
