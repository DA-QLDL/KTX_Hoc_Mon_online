# v1.0.13 – Bulk Delete Preflight

- Điều chỉnh luồng kiểm tra trước khi xóa hết: dừng timer đồng bộ chờ chạy và đợi yêu cầu mạng thực sự hoàn tất (tối đa 45 giây).
- Không tự ý hạ cờ đang đồng bộ, không tắt RLS, không ghi đè Cloud.
- Bổ sung tiến độ xóa Cloud theo đợt, đối chiếu số dòng phản hồi và kiểm tra lại số lượng còn lại.
- Nếu API treo hoặc lỗi RLS, tiếp tục chặn xóa và báo lỗi; chưa thể chứng nhận xóa thành công trên Supabase Production.
- Bảo toàn xác nhận 2 bước trước khi thực hiện.
