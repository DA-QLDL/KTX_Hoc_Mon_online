-- STEP175: Cloud snapshot thử nghiệm cho 5 tiện ích. KHÔNG xóa bảng/dữ liệu có sẵn.
create table if not exists public.ktx_utility_snapshots (
  module_key text primary key,
  rows jsonb not null default '[]'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint utility_name_valid check (module_key in (
    'ktx_ledger167_v1','ktx_step169_cosovatchat','ktx_step169_vs-vpp',
    'ktx_step169_vipham-ncc','ktx_step169_pccc')),
  constraint utility_rows_are_array check (jsonb_typeof(rows)='array')
);
alter table public.ktx_utility_snapshots enable row level security;
-- Chỉ Admin được đọc và ghi bản Cloud toàn bộ KTX ở giai đoạn thử nghiệm.
drop policy if exists utility_admin_select on public.ktx_utility_snapshots;
create policy utility_admin_select on public.ktx_utility_snapshots for select to authenticated
 using (exists (select 1 from public.app_accounts a where a.user_id = (select auth.uid()) and a.enabled = true and a.role='admin'));
drop policy if exists utility_admin_insert on public.ktx_utility_snapshots;
create policy utility_admin_insert on public.ktx_utility_snapshots for insert to authenticated
 with check (exists (select 1 from public.app_accounts a where a.user_id = (select auth.uid()) and a.enabled = true and a.role='admin'));
drop policy if exists utility_admin_update on public.ktx_utility_snapshots;
create policy utility_admin_update on public.ktx_utility_snapshots for update to authenticated
 using (exists (select 1 from public.app_accounts a where a.user_id = (select auth.uid()) and a.enabled = true and a.role='admin'))
 with check (exists (select 1 from public.app_accounts a where a.user_id = (select auth.uid()) and a.enabled = true and a.role='admin'));
revoke all on public.ktx_utility_snapshots from anon;
grant select,insert,update on public.ktx_utility_snapshots to authenticated;
-- Kết quả kiểm tra:
select module_key,revision,jsonb_array_length(rows) as row_count,updated_at from public.ktx_utility_snapshots order by module_key;
