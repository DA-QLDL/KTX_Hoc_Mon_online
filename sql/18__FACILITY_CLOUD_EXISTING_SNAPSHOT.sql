-- 18. Cơ sở vật chất dùng bảng ktx_utility_snapshots của STEP175.
-- Chạy SQL 08__015_utility_snapshots.sql trước nếu bảng chưa tồn tại.
-- Tập lệnh này KHÔNG xóa hoặc thay thế dữ liệu.
select module_key, revision, jsonb_array_length(rows) as so_phong, updated_at
from public.ktx_utility_snapshots
where module_key = 'ktx_step169_cosovatchat';
-- RLS hiện tại chỉ Admin được SELECT/INSERT/UPDATE.
-- Không dùng service_role key trên trình duyệt.
