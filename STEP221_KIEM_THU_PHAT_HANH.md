# STEP221 – Ứng viên phát hành để nghiệm thu (KHÔNG PHẢI bản đã chứng nhận Production)

Nguồn: STEP220. Không thay đổi dữ liệu Supabase, không đổi schema, không yêu cầu SQL.

## Thay đổi đã xác minh bằng mã
- Chặn chọn đích ngoài P.1–P.15 và nhận diện chính xác phòng hiện tại sau chuẩn hóa.
- Xóa lựa chọn phòng cũ khi đổi KTX hoặc Dãy, tránh xác nhận vào phòng không tương ứng.
- Khóa nút xác nhận nếu phòng đích đã đầy/khóa tại thời điểm render. Khi click, vẫn kiểm tra lại.
- Bổ sung 3 tài nguyên local còn thiếu trong STEP220: qr-config.js (mẫu rỗng, không chứa khóa), qr-sessions.js (stub), manifest.webmanifest.

## Kiểm tra tĩnh
- JavaScript nội tuyến: 55 đoạn; lỗi cú pháp: 0.
- Tham chiếu tài nguyên cục bộ còn thiếu: 0.
- Không có kiểm thử tương tác thiết bị, Supabase hoặc browser E2E.

## PHẢI kiểm thử trước Production
1. Đăng nhập Admin/Quản lý/Nhân viên; kiểm tra phân quyền, đăng xuất, phiên lưu.
2. Danh sách 2.4k công nhân: tìm kiếm, lọc, thêm/sửa/xóa, export/import, sao lưu/khôi phục.
3. Chuyển phòng cả PC/Mobile, phòng đầy/khóa, chuyển KTX/Dãy, sau refresh Cloud không mất lịch sử.
4. QR: gửi đăng ký, duyệt, từ chối, ra/vào, quyền RLS. File qr-sessions.js là stub vì STEP220 không kèm triển khai extension.
5. Suất ăn: Mặn/Chay, chọn ngày/NCC, định lượng chuẩn 7 NCC, tải menu Supabase trên 2 thiết bị.
6. Mobile: bàn phím, scroll, điều chuyển, nhập liệu, thu phóng, không tràn màn hình.
7. PWA: cài đặt/icon/cache, thử online/offline.
8. Xác minh GitHub branch, Vercel deployment, browser cache và Supabase Production config trước rollout.

## Cảnh báo phát hành
Không thể kết luận toàn hệ thống 'hết lỗi' chỉ từ kiểm tra cú pháp. KHÔNG triển khai trực tiếp Production trước khi nghiệm thu checklist.
