-- KTX Hóc Môn · Supabase Auth + phân quyền tài khoản
-- Chạy toàn bộ trong Supabase Dashboard > SQL Editor.
-- Sau khi chạy, làm bước BOOTSTRAP ADMIN ở cuối file.

create table if not exists public.app_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'viewer'
    check (role in ('admin','manager','staff','viewer')),
  ktx text[] not null default '{}',
  days text[] not null default '{}',
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

-- Hàm kiểm tra admin, SECURITY DEFINER để tránh vòng lặp RLS.
create or replace function public.is_app_admin()
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
      and role = 'admin'
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

-- Tự tạo hồ sơ quyền + yêu cầu chờ duyệt khi có Auth user mới.
create or replace function public.handle_new_app_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_accounts(user_id,email,display_name,role,enabled)
  values(
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)),
    'viewer',
    false
  )
  on conflict (user_id) do update
    set email = excluded.email,
        display_name = coalesce(nullif(excluded.display_name,''), public.app_accounts.display_name),
        updated_at = now();

  insert into public.access_requests(user_id,email,display_name,status,requested_at)
  values(
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)),
    'pending',
    now()
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ktx on auth.users;
create trigger on_auth_user_created_ktx
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_app_user();

-- Backfill những tài khoản Auth đã tạo trước khi cài module này.
insert into public.app_accounts(user_id,email,display_name,role,enabled)
select
  id,
  coalesce(email,''),
  coalesce(raw_user_meta_data->>'name', split_part(coalesce(email,''),'@',1)),
  'viewer',
  false
from auth.users
on conflict (user_id) do update
set email=excluded.email,
    display_name=coalesce(nullif(excluded.display_name,''),public.app_accounts.display_name),
    updated_at=now();

insert into public.access_requests(user_id,email,display_name,status,requested_at)
select
  a.user_id,a.email,a.display_name,'pending',now()
from public.app_accounts a
where a.enabled=false
on conflict (user_id) do nothing;

alter table public.app_accounts enable row level security;
alter table public.access_requests enable row level security;

revoke all on table public.app_accounts from anon, authenticated;
revoke all on table public.access_requests from anon, authenticated;

grant select on table public.app_accounts to authenticated;
grant update (display_name,role,ktx,days,enabled,updated_at) on table public.app_accounts to authenticated;
grant select, insert, update on table public.access_requests to authenticated;

-- app_accounts: mỗi user đọc được quyền của mình; admin đọc và quản lý tất cả.
drop policy if exists "account_read_self" on public.app_accounts;
create policy "account_read_self"
on public.app_accounts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admin_read_accounts" on public.app_accounts;
create policy "admin_read_accounts"
on public.app_accounts
for select
to authenticated
using (public.is_app_admin());

drop policy if exists "admin_update_accounts" on public.app_accounts;
create policy "admin_update_accounts"
on public.app_accounts
for update
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

-- access_requests: user được đọc/gửi yêu cầu của chính mình; admin xử lý tất cả.
drop policy if exists "request_read_self" on public.access_requests;
create policy "request_read_self"
on public.access_requests
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "request_insert_self" on public.access_requests;
create policy "request_insert_self"
on public.access_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
);

drop policy if exists "request_update_self_pending" on public.access_requests;
create policy "request_update_self_pending"
on public.access_requests
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and status = 'pending'
);

drop policy if exists "admin_read_requests" on public.access_requests;
create policy "admin_read_requests"
on public.access_requests
for select
to authenticated
using (public.is_app_admin());

drop policy if exists "admin_update_requests" on public.access_requests;
create policy "admin_update_requests"
on public.access_requests
for update
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

-- Index hỗ trợ danh sách tài khoản.
create index if not exists app_accounts_email_idx on public.app_accounts(lower(email));
create index if not exists access_requests_status_idx on public.access_requests(status, requested_at);

-- ===============================================================
-- BOOTSTRAP ADMIN ĐẦU TIÊN
-- 1) Authentication > Users phải có tài khoản quản trị trước.
-- 2) Thay email bên dưới bằng email Supabase Auth của bạn và chạy 2 câu UPDATE.
-- ===============================================================
-- update public.app_accounts
-- set role='admin', enabled=true, updated_at=now()
-- where lower(email)=lower('YOUR_ADMIN_EMAIL');
--
-- update public.access_requests
-- set status='approved', reviewed_at=now(), reviewed_by=user_id
-- where lower(email)=lower('YOUR_ADMIN_EMAIL');
--
-- Kiểm tra:
-- select user_id,email,display_name,role,ktx,days,enabled from public.app_accounts order by created_at;
