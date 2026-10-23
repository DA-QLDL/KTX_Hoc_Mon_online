-- KTX Hóc Môn · STEP 2 · Đồng bộ dữ liệu thật lên Supabase
-- Chạy file này trong Supabase Dashboard > SQL Editor.
-- Yêu cầu: bảng public.app_accounts đã tồn tại từ module Supabase Auth.

-- Bổ sung vai trò Bảo vệ nếu schema cũ chưa có.
alter table if exists public.app_accounts drop constraint if exists app_accounts_role_check;
alter table if exists public.app_accounts
  add constraint app_accounts_role_check
  check (role in ('admin','manager','staff','guard','viewer'));

create or replace function public.ktx_app_has_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_accounts
    where user_id = auth.uid()
      and enabled = true
      and role = any(roles)
  );
$$;
revoke all on function public.ktx_app_has_role(text[]) from public;
grant execute on function public.ktx_app_has_role(text[]) to authenticated;

create table if not exists public.ktx_workers (
  record_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_archived_workers (
  record_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_audit_logs (
  record_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  event_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);
create table if not exists public.ktx_attendance (
  record_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_registrations (
  record_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_room_meta (
  room_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_residence_status (
  worker_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_residence_history (
  record_id text primary key,
  worker_id text not null,
  payload jsonb not null default '{}'::jsonb,
  event_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create table if not exists public.ktx_alert_reads (
  user_id uuid not null default auth.uid(),
  alert_sig text not null,
  read_at timestamptz not null default now(),
  primary key(user_id, alert_sig)
);
create table if not exists public.ktx_sync_state (
  state_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);

create index if not exists ktx_audit_logs_event_at_idx on public.ktx_audit_logs(event_at desc);
create index if not exists ktx_residence_history_worker_idx on public.ktx_residence_history(worker_id, event_at desc);
create index if not exists ktx_residence_status_updated_idx on public.ktx_residence_status(updated_at desc);

alter table public.ktx_workers enable row level security;
alter table public.ktx_archived_workers enable row level security;
alter table public.ktx_audit_logs enable row level security;
alter table public.ktx_attendance enable row level security;
alter table public.ktx_registrations enable row level security;
alter table public.ktx_room_meta enable row level security;
alter table public.ktx_residence_status enable row level security;
alter table public.ktx_residence_history enable row level security;
alter table public.ktx_alert_reads enable row level security;
alter table public.ktx_sync_state enable row level security;

-- Quyền bảng: RLS phía dưới quyết định cuối cùng.
grant select,insert,update,delete on public.ktx_workers to authenticated;
grant select,insert,update,delete on public.ktx_archived_workers to authenticated;
grant select,insert,update,delete on public.ktx_audit_logs to authenticated;
grant select,insert,update,delete on public.ktx_attendance to authenticated;
grant select,insert,update,delete on public.ktx_registrations to authenticated;
grant select,insert,update,delete on public.ktx_room_meta to authenticated;
grant select,insert,update,delete on public.ktx_residence_status to authenticated;
grant select,insert,update,delete on public.ktx_residence_history to authenticated;
grant select,insert,update,delete on public.ktx_alert_reads to authenticated;
grant select,insert,update,delete on public.ktx_sync_state to authenticated;

-- Đọc dữ liệu chính: mọi tài khoản đã được bật.
do $$
declare t text;
begin
  foreach t in array array['ktx_workers','ktx_archived_workers','ktx_audit_logs','ktx_attendance','ktx_registrations','ktx_room_meta','ktx_residence_status','ktx_residence_history','ktx_sync_state'] loop
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.ktx_app_has_role(array[''admin'',''manager'',''staff'',''guard'',''viewer'']))', t||'_read', t);
  end loop;
end $$;

-- Công nhân: Admin/Quản lý/Nhập liệu được ghi; chỉ Admin/Quản lý được xóa.
drop policy if exists ktx_workers_write on public.ktx_workers;
create policy ktx_workers_write on public.ktx_workers for insert to authenticated with check (public.ktx_app_has_role(array['admin','manager','staff']));
drop policy if exists ktx_workers_update on public.ktx_workers;
create policy ktx_workers_update on public.ktx_workers for update to authenticated using (public.ktx_app_has_role(array['admin','manager','staff'])) with check (public.ktx_app_has_role(array['admin','manager','staff']));
drop policy if exists ktx_workers_delete on public.ktx_workers;
create policy ktx_workers_delete on public.ktx_workers for delete to authenticated using (public.ktx_app_has_role(array['admin','manager']));

-- Danh sách điều chuyển/nghỉ việc: Admin/Quản lý.
drop policy if exists ktx_arc_write on public.ktx_archived_workers;
create policy ktx_arc_write on public.ktx_archived_workers for all to authenticated using (public.ktx_app_has_role(array['admin','manager'])) with check (public.ktx_app_has_role(array['admin','manager']));

-- Nhật ký: mọi tài khoản đã bật có thể ghi log của thao tác phát sinh; chỉ Admin mới xóa.
drop policy if exists ktx_logs_insert on public.ktx_audit_logs;
create policy ktx_logs_insert on public.ktx_audit_logs for insert to authenticated with check (public.ktx_app_has_role(array['admin','manager','staff','guard','viewer']));
drop policy if exists ktx_logs_update on public.ktx_audit_logs;
create policy ktx_logs_update on public.ktx_audit_logs for update to authenticated using (public.ktx_app_has_role(array['admin'])) with check (public.ktx_app_has_role(array['admin']));
drop policy if exists ktx_logs_delete on public.ktx_audit_logs;
create policy ktx_logs_delete on public.ktx_audit_logs for delete to authenticated using (public.ktx_app_has_role(array['admin']));

-- Điểm danh: Admin/Quản lý/Bảo vệ.
drop policy if exists ktx_att_write on public.ktx_attendance;
create policy ktx_att_write on public.ktx_attendance for all to authenticated using (public.ktx_app_has_role(array['admin','manager','guard'])) with check (public.ktx_app_has_role(array['admin','manager','guard']));

-- Đăng ký chờ duyệt: Admin/Quản lý.
drop policy if exists ktx_reg_write on public.ktx_registrations;
create policy ktx_reg_write on public.ktx_registrations for all to authenticated using (public.ktx_app_has_role(array['admin','manager'])) with check (public.ktx_app_has_role(array['admin','manager']));

-- Cấu hình phòng: Admin/Quản lý.
drop policy if exists ktx_room_meta_write on public.ktx_room_meta;
create policy ktx_room_meta_write on public.ktx_room_meta for all to authenticated using (public.ktx_app_has_role(array['admin','manager'])) with check (public.ktx_app_has_role(array['admin','manager']));

-- Tạm trú/tạm vắng + lịch sử cư trú: Admin/Quản lý/Nhập liệu.
drop policy if exists ktx_res_status_write on public.ktx_residence_status;
create policy ktx_res_status_write on public.ktx_residence_status for all to authenticated using (public.ktx_app_has_role(array['admin','manager','staff'])) with check (public.ktx_app_has_role(array['admin','manager','staff']));
drop policy if exists ktx_res_hist_write on public.ktx_residence_history;
create policy ktx_res_hist_write on public.ktx_residence_history for all to authenticated using (public.ktx_app_has_role(array['admin','manager','staff'])) with check (public.ktx_app_has_role(array['admin','manager','staff']));

-- Trạng thái đã đọc cảnh báo: chỉ chính user đó.
drop policy if exists ktx_alert_reads_self_select on public.ktx_alert_reads;
create policy ktx_alert_reads_self_select on public.ktx_alert_reads for select to authenticated using (user_id=auth.uid());
drop policy if exists ktx_alert_reads_self_insert on public.ktx_alert_reads;
create policy ktx_alert_reads_self_insert on public.ktx_alert_reads for insert to authenticated with check (user_id=auth.uid());
drop policy if exists ktx_alert_reads_self_update on public.ktx_alert_reads;
create policy ktx_alert_reads_self_update on public.ktx_alert_reads for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists ktx_alert_reads_self_delete on public.ktx_alert_reads;
create policy ktx_alert_reads_self_delete on public.ktx_alert_reads for delete to authenticated using (user_id=auth.uid());

-- ktx_sync_state: mọi user được đọc; chỉ Admin ghi. Bước 2 dùng để đồng bộ cấu hình backup hiện tại.
drop policy if exists ktx_sync_state_write on public.ktx_sync_state;
create policy ktx_sync_state_write on public.ktx_sync_state for all to authenticated using (public.ktx_app_has_role(array['admin'])) with check (public.ktx_app_has_role(array['admin']));

-- Bật realtime cho các bảng nghiệp vụ chính (bỏ qua nếu đã có).
do $$
declare t text;
begin
  foreach t in array array['ktx_workers','ktx_archived_workers','ktx_audit_logs','ktx_attendance','ktx_registrations','ktx_room_meta','ktx_residence_status','ktx_residence_history','ktx_alert_reads'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename=t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Kiểm tra nhanh sau khi chạy:
-- select role,count(*) from public.app_accounts group by role order by role;
-- select count(*) from public.ktx_workers;
