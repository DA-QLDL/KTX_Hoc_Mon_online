# v1.0.7 — Sửa cảnh báo xóa toàn bộ (kiểm tra hàng đợi)

- Không đồng nhất `pending` với xung đột: khi có hàng đợi nhưng không có xung đột, thử đồng bộ trước thao tác xóa.
- Nếu vẫn còn pending, lỗi Cloud, xung đột, mất mạng, hoặc đang đồng bộ: dừng xóa và hiện nguyên nhân.
- Giữ nguyên yêu cầu Admin, chữ xác nhận, kiểm đếm số bản ghi, kiểm tra IDs và đối chiếu Cloud sau xóa.
- Không tự động xóa dữ liệu hay bỏ qua RLS. Cần sao lưu và thử trên cơ sở dữ liệu thử nghiệm trước.
- Lưu ý: phiên bản hiện tại xóa theo đợt 100 bản ghi, không bảo đảm tính nguyên tử; không dùng trên dữ liệu thật nếu chưa kiểm thử/backup.
