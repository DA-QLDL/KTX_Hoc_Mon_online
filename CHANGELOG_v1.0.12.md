# KTX v1.0.12 — Khắc phục đồng bộ dữ liệu (Preview)

- Chặn tải đè khi còn thay đổi chờ đẩy lên Cloud.
- Giữ cờ pending xuyên suốt thao tác push; xử lý thay đổi mới phát sinh trong khi push.
- Xóa toàn bộ lấy danh sách `record_id` mới nhất từ Supabase, không dựa vào cache ID cũ.
- Ngăn lượt push/pull tự động xen giữa khi đang xóa được kiểm soát.
- Không sửa RLS hoặc tự ghi dữ liệu vào Supabase.

**Giới hạn:** Chưa kiểm thử với Supabase Production. Phải sao lưu và kiểm thử staging; không sử dụng xóa toàn bộ dữ liệu thật trước khi xác nhận RLS DELETE và quy trình khôi phục.
**Lưu ý:** Nếu dữ liệu trên máy và Cloud đã lệch từ trước, ứng dụng có thể từ chối xóa. Không tự động ép khớp để tránh mất dữ liệu.
