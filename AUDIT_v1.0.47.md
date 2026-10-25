# KIỂM TRA MÃ NGUỒN & ĐỀ XUẤT UI — v1.0.47

## Đã sửa trong bản này
- Đồng bộ con số các thẻ thống kê QR với số đếm được tải xong từ Supabase (trước đây chỉ badge được cập nhật).
- Không dựng lại toàn bộ QR khi bấm lại đúng tiện ích đang chọn, giảm nhấp nháy.
- Lịch sử QR: trả lỗi kết nối/quyền SELECT thay vì hiển thị nhầm “Chưa có dữ liệu”.
- Bổ sung chuẩn focus, vùng chạm, và menu 3x2 Mobile tại QR.

## Các rủi ro chưa xác nhận hoàn tất
- Chưa kiểm thử ghi/xóa trên Supabase Production; không khẳng định đã xử lý mọi lỗi đồng bộ.
- Nhiều lớp wrapper JavaScript (QR, nút, render) và CSS từ các phiên bản khác nhau vẫn còn; cần hợp nhất trong một đợt refactor có kiểm thử hồi quy.
- RLS Supabase và xóa tất cả cần kiểm tra bằng tài khoản thử với bộ dữ liệu thử.
- Điểm danh tự duyệt vẫn phụ thuộc việc trình duyệt/tài khoản có quyền mở phiên và tải yêu cầu; chưa có chức năng server-side tự duyệt độc lập.
- Lưu trữ Điều chuyển · Nghỉ việc: nếu cloud trống/lỗi thì chưa thể khẳng định các hồ sơ cũ có thể khôi phục.

## Chuẩn giao diện đề xuất
### PC (từ 1024 px)
- Sidebar cố định 220–248 px; thanh công cụ đúng từng trang, cho phép xuống hàng không che tiêu đề.
- Tiêu đề một dòng, không lặp lại mô tả; card tối đa 4 chỉ số trong một hàng.
- Thanh tìm kiếm/lọc riêng; bảng có header cố định; nút Sửa/Duyệt/Từ chối cùng hàng, đủ quyền mới hiển thị.
### Mobile (320–760 px)
- Bottom navigation 3 mục: Tổng quan, Công nhân, QR code.
- QR menu 3 cột × 2 hàng; chỉ hiện một module đang chọn; không đưa toàn bộ bảng PC lên trang chính.
- Nội dung ưu tiên: tiêu đề → thao tác chính → số liệu nếu cần → danh sách.
- Vùng chạm khuyến nghị ít nhất 44px; nhãn từ 12px, nội dung 14–16px; không dùng mô tả dài lặp lại.
- Dữ liệu bảng có thể cuộn ngang trong một vùng riêng; ưu tiên thẻ theo hồ sơ cho duyệt trên Mobile.

## Điều kiện nghiệm thu
- Kiểm thử Android Chrome, iPhone Safari và PC Chrome/Edge.
- Kiểm thử đăng ký vào/ra, QR điểm danh khớp/sai thông tin, duyệt/từ chối, phân quyền tài khoản con.
- Kiểm thử import, xóa chọn, xóa toàn bộ trên DB thử; sau đó tải lại xác minh không mất dữ liệu.
- Kiểm tra không lặp sự kiện click/touch và không có lỗi console.
