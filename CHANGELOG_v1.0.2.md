# KTX Hóc Môn v1.0.2 — Rà soát, sửa lỗi, thống nhất giao diện

## Cách triển khai
Thư mục này là toàn bộ dự án (gốc Vercel): `index.html`, `api/` (tạo/xóa tài khoản), `sql/`. Đẩy toàn bộ lên repo, giữ biến môi trường Vercel `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Người dùng sẽ tự nhận bản mới nhờ cache `ktx-hoc-mon-production-v1.0.2`.

## Lỗi đã sửa
1. Ngày sinh nhập từ Excel bị lệch -1 ngày (UTC+7); tên file xuất và mốc cắt sao lưu dùng ngày UTC. Thêm `ktxLocalISO()` / `ktxTodayISO()` (script-07).
2. "Phòng quá tải" tính cả nhóm công nhân chưa phân phòng như một phòng "P.?" (báo thừa phòng, mất giường trống). `rooms(L)` nay bỏ nhóm này; màn hình thẻ phòng theo dãy vẫn hiện bằng `rooms(L,true)`.
3. Thanh nút: `.hide` bị CSS ghi đè và script-70 đọc `window.page` (rỗng) → nút hiện sai ở mọi trang. Đã sửa cả hai.
4. Bỏ hack `zoom:.80` + `125vh` làm menu trái bị cắt trên Chrome mới.
5. Khôi phục kiểu bảng công nhân (tiêu đề không còn xuống dòng từng chữ, cuộn ngang).
6. Gom 5 lớp CSS nút (~10 màu) thành 4 vai trò trong `production-action-palette.css`: Chính (xanh đặc), Phụ (viền xanh), Cảnh báo (vàng), Xóa (đỏ; đỏ đặc trong hộp thoại xác nhận).
7. Mobile: thay emoji bằng icon SVG cùng bộ với PC.
8. `esc()` thiếu dấu nháy đơn; `script-70` thiếu trong cache service worker; `index.html` có `</body></html>` giữa file.
9. Xóa file thừa: `api/client-config.js` (không nơi nào gọi), `pwa-icon.svg`, `vincons-logo-template.png`.

## SQL (thư mục `sql/`, xem `sql/README_THU_TU_CHAY.md`)
- Sắp lại theo thứ tự chạy; bản cũ/thừa chuyển vào `legacy/`, dữ liệu một lần vào `data/`.
- File mới `11__hardening_v1_0_2.sql`: (1) thêm cột `leader_phone`, `check_in_date` cho `residency_requests` (form QR gửi 2 cột này mà không SQL nào tạo); (2) gộp 2 policy INSERT của anon bị cộng dồn OR làm mất ràng buộc; (3) đọc/duyệt hồ sơ đăng ký chỉ cho tài khoản app đang bật (trước đây mọi tài khoản đăng nhập đều đọc được CCCD); (4) khôi phục kiểm tra phiên điểm danh bị STEP249 làm mất và sửa so sánh KTX luôn đúng `s.ktx=ktx`.
- Chưa chạy thử trên Postgres thật (môi trường không có) — chạy trên bản sao/branch trước.

## Chưa đổi (cần quyết định nghiệp vụ)
- `K()/D()` gán mặc định "KTX 1 / Dãy 1" cho hồ sơ thiếu KTX/Dãy → số liệu KTX 1 bị phồng. Nên đổi thành "Chưa phân".
- 73 `catch` rỗng, 233 chỗ `innerHTML`: nên rà theo từng module.
- Chưa có RLS trong `sql/` (chỉ có 2 file điểm danh): cần xuất chính sách từ Supabase để kiểm tra.
- `theo-doi-suat-an.html`, `kiem-tra-sao-luu.html` không có liên kết từ menu (mở bằng URL).

## Đề xuất
Bớt: gom 19 trang "Chức năng hệ thống" còn 3–4 trang cho Admin; ẩn nút xóa hàng loạt sau menu "Thêm" và bắt gõ chữ xác nhận.
Thêm: tiêu đề bảng cố định, chọn cột hiển thị, xem trước khi import Excel, trạng thái trống có hướng dẫn, môi trường Preview, kiểm thử tự động cho công thức sức chứa.
