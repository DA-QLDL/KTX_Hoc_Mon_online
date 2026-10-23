-- STEP160 — chạy một lần trong Supabase SQL Editor, không xóa dữ liệu hiện có.
create table if not exists public.ktx_attendance_qr_requests (
 id uuid primary key default gen_random_uuid(),
 worker_code text not null check (char_length(worker_code) between 1 and 60),
 worker_name text not null check (char_length(worker_name) between 1 and 120),
 ktx text not null check (ktx in ('KTX 1','KTX 2')),
 direction text not null check (direction in ('in','out')),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid
);
alter table public.ktx_attendance_qr_requests enable row level security;
revoke all on public.ktx_attendance_qr_requests from anon, authenticated;
grant insert (worker_code,worker_name,ktx,direction) on public.ktx_attendance_qr_requests to anon;
grant select, update on public.ktx_attendance_qr_requests to authenticated;
drop policy if exists attendance_qr_public_submit on public.ktx_attendance_qr_requests;
create policy attendance_qr_public_submit on public.ktx_attendance_qr_requests for insert to anon with check (status='pending' and reviewed_at is null and reviewed_by is null);
-- Chỉ người có vai trò quản trị hoặc quản lý mới duyệt / xem hồ sơ qua Auth.
-- Nếu bảng app_accounts dùng tên cột khác, cần điều chỉnh các policy này trước khi dùng.
drop policy if exists attendance_qr_staff_read on public.ktx_attendance_qr_requests;
create policy attendance_qr_staff_read on public.ktx_attendance_qr_requests for select to authenticated using (
 exists (select 1 from public.app_accounts a where a.id = (select auth.uid()) and a.role in ('admin','manager') and a.enabled = true)
);
drop policy if exists attendance_qr_staff_review on public.ktx_attendance_qr_requests;
create policy attendance_qr_staff_review on public.ktx_attendance_qr_requests for update to authenticated using (
 status='pending' and exists (select 1 from public.app_accounts a where a.id = (select auth.uid()) and a.role in ('admin','manager') and a.enabled = true)
) with check (status in ('approved','rejected'));
create index if not exists idx_ktx_attendance_qr_pending on public.ktx_attendance_qr_requests (created_at desc) where status='pending';
-- Với QR công khai, vận hành thực tế nên bổ sung rate-limit / CAPTCHA qua endpoint máy chủ.
