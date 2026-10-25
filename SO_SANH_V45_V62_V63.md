# So sánh nguồn và hướng hợp nhất

## Nguồn
- `files.zip` bao gồm `KTX_HOC_MON_v1.0.45_FIX_UI_STANDARD.zip` và `KTX_mobile_de_xuat_va_chuan_UI.xlsx` (3 sheet: Đề xuất mobile, Phát hiện mobile, Chuẩn giao diện).
- Bản hiện hành để đối chiếu: `KTX_HOC_MON_v1.0.62_REMOVE_DUPLICATE_UTILITIES.zip`.

## Kết quả đối chiếu tệp
- v1.0.45: 197 tệp; v1.0.62: 176 tệp.
- 25 đường dẫn có nội dung thay đổi; v1.0.62 có thêm các lớp QR, thiết kế Indigo, card tiện ích, modal, và bản sửa hệ thống.
- Phần lớn tệp chỉ có trong v1.0.45 là CHANGELOG cũ. v1.0.45 có một lớp chuẩn giao diện `ktx-ui-standard.css` không còn trong v1.0.62.
- Gói Excel còn ghi các đề xuất chưa triển khai và đề xuất Mobile 5 nút; đây không phải các chức năng đã có thật và không tự động áp dụng vì trái yêu cầu Mobile 3 nút đã chốt.

## Chọn lọc
- **Giữ v1.0.62 làm nền**, tránh đem logic Cloud/xóa cũ của v1.0.45 chèn đè các thay đổi mới.
- **Mang sang v1.0.63:** một lớp token và các quy tắc giao diện hữu ích từ v1.0.45, phối Indigo; cỡ chữ biểu mẫu trên mobile 16px, vùng chạm 44px, font chung, focus rõ, toast không đè điều hướng, hỗ trợ giảm chuyển động.
- **Không đưa lại:** bảng màu xanh cũ v1.0.45, thanh dưới 5 nút, Điểm danh QR đã tạm ẩn, các changelog lịch sử.
- **Sửa thêm:** bỏ script-77.js đang bị đưa vào index.html hai lần, tránh việc khởi tạo lại lớp sửa hồ sơ QR.

## Giới hạn nghiệm thu
- Đây là hợp nhất chọn lọc có kiểm tra tĩnh. Chưa xác minh Cloud/RLS, nhập/xóa hàng loạt, quyền tài khoản con, và các luồng duyệt trên production. Nên kiểm tra trên Vercel Preview với Supabase thử nghiệm trước khi đưa production.
