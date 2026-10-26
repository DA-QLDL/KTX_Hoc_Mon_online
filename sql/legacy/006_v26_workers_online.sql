-- v26 + Workers Online
-- Chạy 1 lần trong Supabase SQL Editor trước khi dùng file HTML mới.
-- Không xóa bảng/cột/dữ liệu hiện có.

alter table public.workers
  add column if not exists legacy_data jsonb not null default '{}'::jsonb;

-- Bảo đảm updated_at có thể được client cập nhật (nếu cột đã tồn tại thì không đổi gì).
alter table public.workers
  add column if not exists updated_at timestamptz not null default now();

-- Realtime: chỉ thêm bảng nếu chưa nằm trong publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'workers'
  ) then
    alter publication supabase_realtime add table public.workers;
  end if;
end $$;
