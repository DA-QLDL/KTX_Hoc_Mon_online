# Bản vá Mobile – Báo cáo suất ăn (v1.0.16)

- Mobile chọn ngày/buổi để xem trước thực đơn đã lưu Cloud mà không phải chờ mốc giờ tự động.
- Nút Hôm nay, Ngày mai, Buổi tiếp theo; buổi tiếp theo sau Chiều chuyển sang Sáng hôm sau.
- Tải Cloud có trạng thái rõ ràng; chỉ cập nhật kết quả của ngày/buổi còn đang chọn, tránh phản hồi cũ ghi đè.
- Giữ focus ô nhập số lượng trong lúc dữ liệu tải xong.
- Không thay đổi cơ sở dữ liệu, SQL, bảng công nhân hoặc cơ chế xóa STEP258.

**Giới hạn:** thực đơn chỉ xuất hiện trên Mobile nếu đã được lưu lên Supabase hoặc tồn tại trong dữ liệu menu cục bộ của chính thiết bị. Nếu PC chỉ import mà chưa lưu Cloud, Mobile không thể đọc được.

Triển khai: thay toàn bộ mã nguồn web trên GitHub bằng nội dung thư mục này, commit lên nhánh kiểm thử, xem Vercel Preview; không cần chạy SQL Supabase. Trên PWA Mobile đóng/mở lại hoặc cài mới khi cần làm mới cache.
