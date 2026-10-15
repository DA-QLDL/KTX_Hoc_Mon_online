-- KTX Hóc Môn Online v29
-- Chạy sau 001_online_core.sql và 003_workers_vietnamese_import.sql.
-- Không xóa dữ liệu hiện có.

create extension if not exists pgcrypto;

-- ===== TẠM VẮNG =====
create table if not exists public.worker_absences (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null,
  worker_name text,
  worker_mnv text,
  ktx text,
  day text,
  room text,
  from_date date not null,
  to_date date,
  reason text,
  status text not null default 'active' check (status in ('active','returned')),
  created_at timestamptz not null default now(),
  returned_at timestamptz
);
create index if not exists worker_absences_worker_idx on public.worker_absences(worker_id,created_at desc);
create index if not exists worker_absences_status_idx on public.worker_absences(status,from_date desc);

alter table public.worker_absences enable row level security;
drop policy if exists worker_absences_read on public.worker_absences;
create policy worker_absences_read on public.worker_absences for select to authenticated
using (public.worker_scope_ok(ktx,day));
drop policy if exists worker_absences_insert on public.worker_absences;
create policy worker_absences_insert on public.worker_absences for insert to authenticated
with check (public.worker_write_ok(ktx,day));
drop policy if exists worker_absences_update on public.worker_absences;
create policy worker_absences_update on public.worker_absences for update to authenticated
using (public.worker_write_ok(ktx,day)) with check (public.worker_write_ok(ktx,day));

grant select,insert,update on public.worker_absences to authenticated;

-- ===== ĐIỀU CHUYỂN / NGHỈ VIỆC =====
create table if not exists public.worker_archive (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid,
  worker_name text not null,
  worker_mnv text,
  ktx text,
  day text,
  room text,
  reason text not null,
  move_date date not null default current_date,
  note text,
  worker_data jsonb not null,
  created_at timestamptz not null default now(),
  restored_at timestamptz,
  restored_by uuid
);
create index if not exists worker_archive_date_idx on public.worker_archive(move_date desc);
create index if not exists worker_archive_reason_idx on public.worker_archive(reason,move_date desc);

alter table public.worker_archive enable row level security;
drop policy if exists worker_archive_read on public.worker_archive;
create policy worker_archive_read on public.worker_archive for select to authenticated
using (public.current_app_role() in ('admin','manager') and public.worker_scope_ok(ktx,day));
grant select on public.worker_archive to authenticated;

-- Chuyển công nhân khỏi danh sách chính nhưng giữ toàn bộ hồ sơ dạng JSON.
create or replace function public.archive_worker(
  p_worker_id uuid,
  p_reason text,
  p_move_date date default current_date,
  p_note text default null
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare w public.workers; a public.app_accounts; aid uuid;
begin
  select * into a from public.app_accounts where user_id=auth.uid() and enabled=true limit 1;
  if a.user_id is null or a.role not in ('admin','manager') then raise exception 'Không có quyền chuyển công nhân'; end if;
  select * into w from public.workers where id=p_worker_id;
  if w.id is null then raise exception 'Không tìm thấy công nhân'; end if;
  if not public.worker_scope_ok(w.ktx,w.day) then raise exception 'Ngoài phạm vi phụ trách'; end if;
  insert into public.worker_archive(worker_id,worker_name,worker_mnv,ktx,day,room,reason,move_date,note,worker_data)
  values(w.id,w.name,w.mnv,w.ktx,w.day,w.room,coalesce(nullif(trim(p_reason),''),'Khác'),coalesce(p_move_date,current_date),p_note,to_jsonb(w)) returning id into aid;
  delete from public.workers where id=w.id;
  insert into public.audit_logs(actor_id,actor_email,actor_role,action,entity_type,entity_id,summary,old_data)
  values(auth.uid(),coalesce(a.email,auth.jwt()->>'email'),a.role,'ARCHIVE','worker',w.id::text,'Chuyển khỏi KTX: '||w.name||' · '||coalesce(p_reason,''),to_jsonb(w));
  return aid;
end $$;

create or replace function public.restore_worker(p_archive_id uuid) returns uuid
language plpgsql security definer set search_path=public
as $$
declare ar public.worker_archive; a public.app_accounts; w public.workers;
begin
  select * into a from public.app_accounts where user_id=auth.uid() and enabled=true limit 1;
  if a.user_id is null or a.role not in ('admin','manager') then raise exception 'Không có quyền khôi phục công nhân'; end if;
  select * into ar from public.worker_archive where id=p_archive_id and restored_at is null;
  if ar.id is null then raise exception 'Không tìm thấy hồ sơ lưu trữ'; end if;
  if not public.worker_scope_ok(ar.ktx,ar.day) then raise exception 'Ngoài phạm vi phụ trách'; end if;
  w := jsonb_populate_record(null::public.workers, ar.worker_data);
  insert into public.workers select w.*;
  update public.worker_archive set restored_at=now(),restored_by=auth.uid() where id=ar.id;
  insert into public.audit_logs(actor_id,actor_email,actor_role,action,entity_type,entity_id,summary,new_data)
  values(auth.uid(),coalesce(a.email,auth.jwt()->>'email'),a.role,'RESTORE','worker',w.id::text,'Khôi phục công nhân: '||w.name,to_jsonb(w));
  return w.id;
end $$;

grant execute on function public.archive_worker(uuid,text,date,text) to authenticated;
grant execute on function public.restore_worker(uuid) to authenticated;

-- Realtime cho tạm vắng và lưu trữ.
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='worker_absences') then alter publication supabase_realtime add table public.worker_absences; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='worker_archive') then alter publication supabase_realtime add table public.worker_archive; end if;
end $$;
