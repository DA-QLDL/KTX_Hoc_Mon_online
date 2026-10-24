# Khôi phục riêng chức năng Xóa tất cả về STEP258

- Nền: KTX Hóc Môn v1.0.15 Core Stability Candidate.
- Khôi phục đúng handler `dsall` từ STEP258: kiểm tra quyền -> chọn hình thức chuyển/xóa (`askLeave`) -> xử lý theo `delWorkers`.
- Loại bỏ sự kiện capture chặn `#dsall` và yêu cầu RPC `ktx_admin_delete_all_workers` trong `operational-fix-105.js`.
- Giữ nguyên các chức năng khác, bao gồm nút Kiểm tra lưu Cloud, logic import, giao diện và chọn tất cả.
- Chuyển SQL tạo RPC cũ sang `docs/ARCHIVED_14_ADMIN_DELETE_WORKERS_RPC_NOT_USED.sql.txt` để không triển khai nhầm.

**Quan trọng:** STEP258 là thao tác trên danh sách ứng dụng, sau đó phụ thuộc đồng bộ hiện có để phản ánh trên Supabase. Nó không bảo đảm xóa toàn bộ Cloud ngay tức thì. Không kiểm thử trên dữ liệu thật; hãy sao lưu và kiểm tra trên dữ liệu mẫu, refresh và thử từ thiết bị thứ hai trước khi phát hành.

Không tự động sửa hoặc xóa bất kỳ dữ liệu Supabase nào khi cài đặt gói ZIP này.
