# Kiểm thử và triển khai v1.0.32
1. Sao lưu mã nguồn và dữ liệu; dùng nhánh Preview trên GitHub/Vercel.
2. Tài khoản Admin sẽ nhìn toàn bộ. Tài khoản con chỉ thấy nút Xem tất cả có thể nhấn khi `ME.acct.view_all_days` là true.
3. Chạy truy vấn chỉ đọc `sql/17__DAY_VIEW_PERMISSION_REVIEW.sql`. Kiểm tra mapping tài khoản và RLS trước khi bật quyền cho một tài khoản con. Không tự động chạy ALTER/grant có ảnh hưởng Production.
4. Kiểm thử tài khoản thuộc KTX 1 / Dãy 2: nhìn toàn bộ nhưng không sửa/chuyển phòng KTX 2 / Dãy 4; vẫn sửa dãy được cấp theo vai trò.
5. Test trực tiếp Supabase REST API: SELECT dãy ngoài phạm vi được phép khi bật quyền, UPDATE/DELETE/INSERT vào dãy ngoài phạm vi phải bị từ chối. Nếu không, chưa được phát hành Production.
6. Số liệu ngoài phạm vi chỉ hiển thị khi Supabase đã trả dữ liệu; nút không thể vượt RLS để tải dữ liệu chưa được phép đọc.
