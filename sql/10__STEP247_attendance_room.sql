-- Chạy một lần trên Supabase SQL Editor, sau khi sao lưu bảng.
-- Thêm dãy và phòng vào yêu cầu điểm danh; không xóa dữ liệu cũ.
ALTER TABLE public.ktx_attendance_qr_requests ADD COLUMN IF NOT EXISTS day text;
ALTER TABLE public.ktx_attendance_qr_requests ADD COLUMN IF NOT EXISTS room text;
