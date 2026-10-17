KTX HM — STEP107: Đồng bộ ngoại tuyến + tự thử lại

- Khi mất Internet, thay đổi mới không bị mất: trạng thái pending được giữ trên máy.
- Khi Internet trở lại, ứng dụng tự thử gửi hàng đợi lên Supabase.
- Nếu gửi lỗi tạm thời, tự thử lại theo khoảng tăng dần, tối đa khoảng 60 giây/lần.
- Có khung trạng thái hàng đợi trong Hệ thống > Đồng bộ Supabase.
- Có nút Gửi hàng đợi ngay.
- Vẫn sử dụng cơ chế chống xung đột đa máy của STEP106.
- Không cần chạy SQL mới.
