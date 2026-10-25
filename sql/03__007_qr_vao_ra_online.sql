-- KTX Hóc Môn · Chỉ dành cho module QR đăng ký vào / đăng ký ra
-- Chạy trong Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.residency_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('in','out')),
  worker_code text,
  name text not null,
  cccd text,
  phone text,
  dob date,
  gender text,
  unit text,
  td text,
  leader text,
  address text,
  ktx text,
  day text,
  room text,
  reason text,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
alter table public.residency_requests add column if not exists reviewed_at timestamptz;
alter table public.residency_requests add column if not exists reviewed_by uuid;
create index if not exists residency_requests_status_created_idx on public.residency_requests(status,created_at desc);
alter table public.residency_requests enable row level security;
revoke all on table public.residency_requests from anon, authenticated;
grant insert (request_type,worker_code,name,cccd,phone,dob,gender,unit,td,leader,address,ktx,day,room,reason,note) on public.residency_requests to anon;
grant select on table public.residency_requests to authenticated;
grant update (status,reviewed_at,reviewed_by) on table public.residency_requests to authenticated;
drop policy if exists "worker_submit_residency_request" on public.residency_requests;
create policy "worker_submit_residency_request" on public.residency_requests for insert to anon with check (
  status='pending' and request_type in ('in','out') and length(trim(name)) between 2 and 120
  and (request_type<>'out' or (worker_code is not null and length(trim(worker_code))>0))
  and day is not null and length(trim(day))>0 and room is not null and length(trim(room))>0
);
drop policy if exists "manager_read_residency_requests" on public.residency_requests;
create policy "manager_read_residency_requests" on public.residency_requests for select to authenticated using (true);
drop policy if exists "manager_update_residency_requests" on public.residency_requests;
create policy "manager_update_residency_requests" on public.residency_requests for update to authenticated using (true) with check (status in ('pending','approved','rejected'));
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='residency_requests') then
    alter publication supabase_realtime add table public.residency_requests;
  end if;
end $$;
