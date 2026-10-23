-- STEP249: Sửa lỗi permission denied khi biểu mẫu Điểm danh gửi day / room.
-- Chạy bằng tài khoản quản trị database trong Supabase SQL Editor.
-- Không xóa bảng, không xóa hồ sơ, không cho anon đọc/sửa/xóa yêu cầu.
BEGIN;
ALTER TABLE public.ktx_attendance_qr_requests ADD COLUMN IF NOT EXISTS day text;
ALTER TABLE public.ktx_attendance_qr_requests ADD COLUMN IF NOT EXISTS room text;
ALTER TABLE public.ktx_attendance_qr_requests ADD COLUMN IF NOT EXISTS session_id uuid;
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT (worker_code,worker_name,ktx,direction,day,room,session_id)
  ON public.ktx_attendance_qr_requests TO anon;
ALTER TABLE public.ktx_attendance_qr_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS attendance_qr_public_submit ON public.ktx_attendance_qr_requests;
CREATE POLICY attendance_qr_public_submit ON public.ktx_attendance_qr_requests
  FOR INSERT TO anon
  WITH CHECK (status='pending' AND reviewed_at IS NULL AND reviewed_by IS NULL);
COMMIT;
-- Kiểm tra lại sau khi chạy:
SELECT table_name,grantee,privilege_type FROM information_schema.role_table_grants
 WHERE table_schema='public' AND table_name='ktx_attendance_qr_requests' AND grantee='anon';
