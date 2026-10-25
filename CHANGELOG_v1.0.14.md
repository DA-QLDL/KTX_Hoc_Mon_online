# v1.0.14 — ổn định hàng đợi Cloud (Preview)

- Chặn vòng lặp tự thử ghi Supabase mỗi 1,2 giây khi lần ghi trước thất bại. Chỉ tự lên lịch lượt tiếp theo nếu có thay đổi mới trong lúc đang đẩy và lần đẩy trước không lỗi.
- Rút thông báo import bám màn hình sau 6 giây; cảnh báo dữ liệu chưa lưu vẫn nằm trong màn hình đồng bộ.
- Thông báo tải Cloud hết hạn và không báo thành công nếu trả về trạng thái pending/chưa hoàn tất.
- Không thay đổi RLS, dữ liệu hoặc cơ chế xóa. Xóa toàn bộ vẫn là thao tác nguy hiểm cần thử nghiệm riêng và backup.
- Chưa kiểm thử live trên Supabase/thiết bị thật; cần kiểm tra Console, Network và bảng ktx_* để xác định nguyên nhân máy chủ.
