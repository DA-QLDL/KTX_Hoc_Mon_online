-- STEP168: Phiên điểm danh QR, không xóa dữ liệu hiện có.
create table if not exists public.ktx_attendance_sessions (
 id uuid primary key default gen_random_uuid(),
 session_day date not null,
 ktx text check (ktx is null or ktx in ('KTX 1','KTX 2')),
 day_name text, room text,
 status text not null default 'open' check (status in ('open','closed')),
 created_at timestamptz not null default now(),
 closed_at timestamptz, created_by uuid
);
alter table public.ktx_attendance_sessions enable row level security;
revoke all on public.ktx_attendance_sessions from anon,authenticated;
grant select (id,session_day,ktx,status) on public.ktx_attendance_sessions to anon;
grant select,insert,update on public.ktx_attendance_sessions to authenticated;
drop policy if exists ktx168_anon_session_read on public.ktx_attendance_sessions;
create policy ktx168_anon_session_read on public.ktx_attendance_sessions for select to anon using (status='open' and session_day=(now() at time zone 'Asia/Ho_Chi_Minh')::date);
drop policy if exists ktx168_staff_select on public.ktx_attendance_sessions;
create policy ktx168_staff_select on public.ktx_attendance_sessions for select to authenticated using (exists (select 1 from public.app_accounts a where a.user_id=auth.uid() and a.role in ('admin','manager') and a.enabled=true));
drop policy if exists ktx168_staff_create on public.ktx_attendance_sessions;
create policy ktx168_staff_create on public.ktx_attendance_sessions for insert to authenticated with check (created_by=auth.uid() and exists (select 1 from public.app_accounts a where a.user_id=auth.uid() and a.role in ('admin','manager') and a.enabled=true));
drop policy if exists ktx168_staff_close on public.ktx_attendance_sessions;
create policy ktx168_staff_close on public.ktx_attendance_sessions for update to authenticated using (status='open' and exists(select 1 from public.app_accounts a where a.user_id=auth.uid() and a.role in ('admin','manager') and a.enabled=true)) with check (status='closed' and closed_at is not null);
alter table public.ktx_attendance_qr_requests add column if not exists session_id uuid references public.ktx_attendance_sessions(id);
create index if not exists idx_ktx168_requests_session on public.ktx_attendance_qr_requests(session_id,status);
-- Cho phép gửi chỉ khi phiên hiện tại mở, ngày hợp lệ và KTX khớp.
drop policy if exists attendance_qr_public_submit on public.ktx_attendance_qr_requests;
create policy attendance_qr_public_submit on public.ktx_attendance_qr_requests for insert to anon with check (
 status='pending' and reviewed_at is null and reviewed_by is null and
 (session_id is null or exists(select 1 from public.ktx_attendance_sessions s where s.id=session_id and s.status='open' and s.session_day=(now() at time zone 'Asia/Ho_Chi_Minh')::date and (s.ktx is null or s.ktx=ktx)))
);
-- Cấp quyền cột mới cho biểu mẫu công khai và dashboard quản lý.
grant insert(worker_code,worker_name,ktx,direction,session_id) on public.ktx_attendance_qr_requests to anon;
grant select(session_id) on public.ktx_attendance_qr_requests to authenticated;
