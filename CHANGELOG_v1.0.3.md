# v1.0.3 — Bản củng cố an toàn có giới hạn

## Đã sửa trong mã nguồn
- Bỏ gán mặc định dữ liệu trống vào KTX 1 / Dãy 1 khi hiển thị hoặc tổng hợp. Nhãn hiển thị **Chưa phân**, không tự cập nhật hồ sơ gốc. Phòng thiếu KTX/Dãy không tính vào sức chứa khu đã phân.
- Xóa tất cả phải nhập chính xác `XÓA TẤT CẢ` rồi vẫn qua bước xác nhận/nghỉ việc cũ; nút chuyển vào menu **Thêm**.
- Tiêu đề bảng công nhân cố định khi cuộn trong khung; ngăn tiêu đề xuống từng ký tự.
- Bổ sung liên kết Theo dõi suất ăn ở Tiện ích; Kiểm tra & sao lưu đã có liên kết trong Tiện ích.
- Giữ nguyên xem trước import Excel hiện có (script-17 và script-18).
- `sql/12__RLS_AUDIT_ONLY.sql` chỉ đọc hệ thống RLS thật trên Supabase; chưa áp chính sách mới.
- `docs/SECURITY_AUDIT_COUNTS.json` là kiểm kê tĩnh catch rỗng/innerHTML theo module, **không phải** bằng chứng đã kiểm tra an toàn từng vị trí.

## Chưa triển khai tự động, yêu cầu kiểm chứng trên môi trường staging
- RLS phân tách KTX/Dãy cho mọi bảng đồng bộ, quyền truy cập của người chưa phân và toàn bộ thao tác cập nhật/xóa liên bảng. Policy đọc rộng vẫn là rủi ro cần xử lý trước khi dùng cho dữ liệu nhạy cảm qua API.
- Thu gọn 19 chức năng hệ thống vào 3–4 nhóm là thay đổi điều hướng/phân quyền lớn; chưa bỏ các chức năng gốc.
- Chọn 8 cột thông tin phụ để ẩn/hiện trên bảng công nhân; cột chính vẫn giữ nguyên. Thiết lập lưu theo trình duyệt, không thay đổi xuất Excel.
- Hardening toàn bộ sink innerHTML/catch còn lại chưa hoàn tất.
- CAPTCHA: cần cấu hình Cloudflare Turnstile và endpoint xác minh phía server kèm khóa bí mật, không thể chống spam chỉ bằng JS phía client.

## Kiểm thử cần làm
1. Hồ sơ không có KTX/Dãy: kiểm chứng thống kê, lọc, xuất Excel và phân quyền.
2. Đăng nhập tài khoản KTX1/KTX2: xác minh thao tác HTTP trực tiếp trong staging.
3. Xóa tất cả: nhập sai phải hủy, nhập đúng mới đến xác nhận hiện có.
4. Import Excel: xem trước và hủy không ghi dữ liệu.
5. Kiểm tra Mobile/PC và dịch vụ PWA khi cập nhật.
