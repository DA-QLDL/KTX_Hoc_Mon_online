# Thứ tự chạy SQL trên Supabase (SQL Editor)

Chạy lần lượt theo số thứ tự. Mỗi file đều dùng `if not exists` / `drop policy if exists` nên chạy lại không phá dữ liệu.
**Sao lưu dữ liệu trước khi chạy trên project đang dùng thật.**

| # | File | Việc |
|---|------|------|
| 01 | supabase_ktx_accounts_setup | Bảng `app_accounts`, `access_requests`, hàm `is_app_admin()` — PHẢI chạy đầu tiên |
| 02 | 012_auth_access_upgrade | Phiên đăng nhập `touch_app_session` |
| 03 | 007_qr_vao_ra_online | Bảng `residency_requests` (QR đăng ký vào/ra) |
| 04 | 009_supabase_main_sync | Các bảng `ktx_*` đồng bộ chính + hàm `ktx_app_has_role()` |
| 05 | 010_supabase_backup_versions | Lưu phiên bản sao lưu |
| 06 | 013_qr_attendance_requests_FIXED | Yêu cầu điểm danh QR (bản FIXED thay bản 013 cũ) |
| 07 | 014_qr_attendance_sessions | Phiên điểm danh |
| 08 | 015_utility_snapshots | Ảnh chụp tiện ích |
| 09 | 016_meal_menu_monitor | Thực đơn / giám sát suất ăn |
| 10 | STEP247_attendance_room | Cột dãy/phòng cho điểm danh |
| **11** | **hardening_v1_0_2** | **Vá schema và bảo mật (thay STEP214 + STEP249)** |

- `legacy/`: file cũ. Bảng `workers`, `worker_archive`, `worker_absences`, `meal_reports`, `audit_logs` (001–006) **không còn được code gọi** — chỉ chạy nếu cần dữ liệu cũ. `013` (bản chưa FIXED), `STEP214`, `STEP249` đã được file 11 thay thế; **không chạy lại** vì STEP249 làm mất kiểm tra phiên của 014.
- `data/`: dữ liệu một lần (định lượng thực đơn 7 NCC, tuần 19–25/10/2026). `01_XEM_TRUOC` chỉ xem, `02_SAO_LUU_VA_BO_SUNG` tạo bảng sao lưu rồi cập nhật. Chạy 01 trước, 02 sau, chỉ khi cần.

## Còn tồn tại (chưa vá bằng SQL)
1. Quyền đọc `ktx_*` theo vai trò, **không theo KTX/Dãy**: tài khoản giới hạn KTX 1 vẫn đọc được dữ liệu KTX 2 nếu gọi API trực tiếp. Phân quyền KTX/Dãy hiện chỉ chặn ở giao diện.
2. Form công khai không có CAPTCHA / giới hạn tần suất: có thể bị gửi rác. Nên bật Cloudflare Turnstile hoặc giới hạn qua Edge Function.
