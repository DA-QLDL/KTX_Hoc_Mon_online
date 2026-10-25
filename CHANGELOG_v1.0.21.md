# v1.0.21 – Quản lý phiên điểm danh vào KTX

- Giữ Mở phiên. Hiển thị Đóng phiên cho phiên đang mở; Xóa phiên chỉ cho Admin và phiên đã đóng.
- Xóa phiên qua RPC Supabase có xác thực Admin, xác nhận hai bước, xóa yêu cầu quét QR của chính phiên trong một giao dịch.
- Đóng phiên kiểm tra Supabase trả về bản ghi đã cập nhật.
- Cập nhật tên cache PWA.

## Triển khai
1. Supabase SQL Editor: chạy `sql/15__DELETE_ATTENDANCE_SESSION_ADMIN.sql` sau khi đã có bảng phiên.
2. Đưa mã nguồn ZIP lên GitHub / Vercel Preview.
3. Kiểm tra: Mở → Đóng → Xóa phiên mẫu bằng Admin; đăng nhập Manager không được xóa.

**Chưa thử với Supabase thực tế.** Xóa phiên là không hoàn tác. Không xóa bản ghi điểm danh `ktx_attendance` hoặc ATT local có liên quan nếu đã lưu riêng; cần kiểm tra các báo cáo có phụ thuộc mã phiên trước khi xóa.
