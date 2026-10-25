# v1.0.32 — Quản lý dãy Mobile

- Bổ sung lựa chọn Dãy được giao / Xem tất cả.
- Chế độ Xem tất cả chỉ bật khi `app_accounts.view_all_days === true`; Admin mặc định được xem.
- Đánh nhãn Chỉ xem cho dãy ngoài phạm vi.
- Khóa sửa/chuyển phòng đối với hồ sơ ngoài dãy được cấp.
- Không thay đổi quyền Supabase. Chính sách RLS đọc và ghi phải được đối chiếu riêng trước Production.
