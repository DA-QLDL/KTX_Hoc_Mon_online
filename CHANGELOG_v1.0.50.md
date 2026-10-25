# v1.0.50 — QR pending actions
- Đăng ký vào/ra: các nút Sửa, Duyệt, Từ chối, Xóa trên cùng một hàng ngang.
- Chỉ Quản trị có quyền xóa hồ sơ chờ duyệt. Xác nhận riêng; xóa trực tiếp trên Supabase và chỉ cập nhật danh sách sau khi Cloud xác nhận.
- Không xóa hồ sơ công nhân gốc; báo lỗi khi DELETE bị RLS từ chối.
- Không sửa SQL, không chạy trên Production tự động.
