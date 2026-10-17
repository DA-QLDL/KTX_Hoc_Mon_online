KTX HÓC MÔN — STEP 106
Chống xung đột đồng bộ đa máy

- Phát hiện khi cùng một bản ghi bị chỉnh sửa trên hai máy trước lần đồng bộ kế tiếp.
- Không tự ghi đè bản ghi có xung đột.
- Các bản ghi không xung đột vẫn tiếp tục đồng bộ.
- Trong Hệ thống > Đồng bộ Supabase sẽ xuất hiện khung “Xung đột đồng bộ đa máy”.
- Có 2 lựa chọn cho từng xung đột: Giữ bản Cloud hoặc Giữ bản máy này.
- Có xử lý cả trường hợp một máy sửa trong khi máy khác xóa.
- Áp dụng cho: Công nhân, Điều chuyển/Nghỉ việc, Điểm danh, Đăng ký, Cấu hình phòng.
- Không cần chạy SQL mới; dùng các cột updated_at/updated_by đang có từ cấu trúc đồng bộ hiện tại.

Khuyến nghị test:
1) Mở app trên 2 máy, đăng nhập cùng dữ liệu Supabase.
2) Cùng sửa một công nhân thành hai giá trị khác nhau trước khi hai máy đồng bộ.
3) Bấm Đồng bộ ngay ở cả hai máy.
4) Máy phát hiện xung đột phải hiện khung xác nhận và không tự ghi đè.
5) Chọn Giữ bản Cloud hoặc Giữ bản máy này, sau đó kiểm tra lại máy còn lại.
