-- KTX Hóc Môn — BƯỚC 3: Backup online + quản lý phiên bản + khôi phục
-- Chạy file này SAU 009_supabase_main_sync.sql trong Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.ktx_backup_versions (
  id uuid primary key default gen_random_uuid(),
  backup_date date not null default current_date,
  backup_type text not null default 'manual' check (backup_type in ('manual','auto','pre_restore')),
  label text not null default '',
  snapshot jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  created_email text not null default '',
  restored_at timestamptz,
  restored_by uuid
);

create index if not exists ktx_backup_versions_created_idx
  on public.ktx_backup_versions(created_at desc);
create index if not exists ktx_backup_versions_date_idx
  on public.ktx_backup_versions(backup_date desc, backup_type);

alter table public.ktx_backup_versions enable row level security;
grant select,insert,update,delete on public.ktx_backup_versions to authenticated;

-- Chỉ Quản trị được xem/tạo/xóa/khôi phục backup online.
drop policy if exists ktx_backup_versions_admin_select on public.ktx_backup_versions;
create policy ktx_backup_versions_admin_select
  on public.ktx_backup_versions for select to authenticated
  using (public.ktx_app_has_role(array['admin']));

drop policy if exists ktx_backup_versions_admin_insert on public.ktx_backup_versions;
create policy ktx_backup_versions_admin_insert
  on public.ktx_backup_versions for insert to authenticated
  with check (public.ktx_app_has_role(array['admin']));

drop policy if exists ktx_backup_versions_admin_update on public.ktx_backup_versions;
create policy ktx_backup_versions_admin_update
  on public.ktx_backup_versions for update to authenticated
  using (public.ktx_app_has_role(array['admin']))
  with check (public.ktx_app_has_role(array['admin']));

drop policy if exists ktx_backup_versions_admin_delete on public.ktx_backup_versions;
create policy ktx_backup_versions_admin_delete
  on public.ktx_backup_versions for delete to authenticated
  using (public.ktx_app_has_role(array['admin']));

-- Kiểm tra sau khi chạy:
-- select count(*) from public.ktx_backup_versions;
