# KTX Hóc Môn — Production v1.0.0

Nguồn giao diện: STEP258 (màu nút theo STEP100). Logic dữ liệu, tên hàm, thứ tự chạy script giữ nguyên; không làm sạch theo suy đoán.

## 8 module nghiệp vụ
1. `overview`: Tổng quan, tìm kiếm tổng thể và thống kê.
2. `workers`: Hồ sơ và danh sách công nhân.
3. `rooms`: KTX, dãy, phòng và phân bổ.
4. `attendance`: Điểm danh, QR và phê duyệt.
5. `residency`: Tạm trú, lịch sử cư trú.
6. `meals`: Thực đơn, nhà cung cấp và báo cáo suất ăn.
7. `reports`: Báo cáo, nhật ký, điều chuyển và xuất dữ liệu.
8. `admin`: Tài khoản, phân quyền, đồng bộ và sao lưu.

`assets/js/core/` gồm phần hạ tầng dùng chung (không được coi là module nghiệp vụ thứ 9).
Một số đoạn legacy đa chức năng được giữ nguyên khối trong `core` để không làm hỏng phạm vi biến và thứ tự khởi tạo. Việc đặt tệp vào thư mục module là bước tổ chức **không phải cam kết mã đã độc lập hoàn toàn**.

## Quy tắc an toàn
- Giữ nguyên mã nguồn xử lý dữ liệu, QR, tài khoản, phân quyền và Supabase từ STEP258.
- Các file `*.js` trong `assets/js/modules` là những khối script nguyên trạng trích từ STEP258. Trình duyệt vẫn chạy theo thứ tự cũ; không đổi module ES (`type=module`).
- Các style hợp nhất vào `assets/css/app.css` theo thứ tự CSS gốc. CSS chồng lớp hiện tại **chưa được loại bỏ triệt để**, vì chưa thể chứng minh tất cả quy tắc không còn hiệu lực.
- `bien-ban-su-vu.html` vẫn là file dự phòng và không được bật menu Biên bản sự vụ trên Mobile. Không xóa source.
- KTX1 / KTX2 tiếp tục được hiển thị song song theo lựa chọn cuối cùng.
- STEP cũ, ghi chú và mẫu biên bản không đưa lên thư mục Deploy chính thức.
- Bổ sung các file runtime còn thiếu từ kho repository đã được cung cấp. Tệp STEP258 được ưu tiên và không bị ghi đè.

## Triển khai
1. **Sao lưu** mã repository hiện tại, dữ liệu Supabase và cấu hình Vercel.
2. Dùng nội dung thư mục `deploy/` trong gói phát hành; giữ nguyên cấu hình bí mật đã có trên Vercel; không thay bằng khóa mới.
3. Nên triển khai nhánh staging/Preview trước khi đưa lên Production.
4. Kiểm thử bằng cả tài khoản Admin và nhân viên (đúng phạm vi KTX/Dãy), bao gồm mobile.
5. Kiểm tra PWA cập nhật: reload, xóa cache nếu máy còn tệp cũ.
6. Khi xảy ra lỗi, rollback Vercel deployment trước; không phục hồi dữ liệu nếu không có căn cứ.

## Nghiệm thu bắt buộc
- Đăng nhập/đăng xuất, 2 KTX song song, thêm sửa công nhân (trên dữ liệu thử).
- Quyền nhân viên: xem tổng hợp/ghi sửa đúng KTX+Dãy (xác nhận RLS phía Supabase).
- QR vào/ra, quét và duyệt điểm danh, xuất Excel; kiểm tra cấu trúc bảng `ktx_attendance_qr_requests`.
- Chuyển phòng, điều chuyển/nghỉ việc, lịch sử.
- Suất ăn: thực đơn NCC, nhập số lượng, Mặn/Chay, xuất báo cáo.
- Cập nhật dữ liệu nhiều thiết bị, sao lưu/khôi phục trên dữ liệu thử.
- Hover tất cả nút, màu STEP100, checkbox nhỏ gọn, keyboard mobile hoạt động.

## Trạng thái
Đã kiểm tra cú pháp 62 script, bảo toàn toàn bộ code JS và CSS trong nguồn gốc, xác nhận tệp có thật.
**Chưa nghiệm thu nghiệp vụ thực tế với Supabase, tài khoản thật và PWA trên thiết bị thật.**
