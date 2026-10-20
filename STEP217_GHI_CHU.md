# STEP217 – Khắc phục treo Import Excel do đầy localStorage

- Bỏ bản sao 2.448 công nhân qua localStorage ngay trước khi import (QuotaExceededError gây dừng).
- Dùng cơ chế safetySnapshot trong IndexedDB (đã có từ STEP104) để lưu điểm khôi phục, và không ghi audit riêng cho từng công nhân trong chế độ thay thế; vẫn giữ nhật ký import theo lô.
- Chỉ sửa index.html. Không thay đổi database, SQL hay file dữ liệu.
- CHƯA kiểm thử thao tác ghi Supabase thực tế; chỉ thử trên nhánh thử nghiệm.
- LƯU Ý: Nút Hoàn tác import cũ có thể sử dụng localStorage và không áp dụng được cho lần import mới; phục hồi qua công cụ điểm khôi phục/sao lưu trước khi import.
