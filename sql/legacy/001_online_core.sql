-- KTX Hóc Môn Online v27
-- Chạy trong Supabase SQL Editor sau file supabase_ktx_accounts_setup.sql hiện có.

create extension if not exists pgcrypto;

-- ===== WORKERS =====
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mnv text,
  cccd text,
  phone text,
  gender text,
  dob date,
  unit text,
  battalion text,
  leader text,
  ktx text,
  day text,
  room text,
  bed text,
  address text,
  temporary_residence boolean not null default false,
  check_in_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workers_mnv_idx on public.workers(mnv) where nullif(trim(mnv),'') is not null;
create index if not exists workers_ktx_day_room_idx on public.workers(ktx,day,room);
create index if not exists workers_name_idx on public.workers(lower(name));
create index if not exists workers_cccd_idx on public.workers(cccd);

-- ===== AUDIT =====
create table if not exists public.audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  old_data jsonb,
  new_data jsonb
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);

-- ===== HELPERS (security definer để tránh RLS recursion) =====
create or replace function public.current_app_account()
returns public.app_accounts
language sql stable security definer set search_path=public
as $$ select a from public.app_accounts a where a.user_id=auth.uid() limit 1 $$;

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path=public
as $$ select role from public.app_accounts where user_id=auth.uid() and enabled=true limit 1 $$;

create or replace function public.worker_scope_ok(p_ktx text,p_day text)
returns boolean language plpgsql stable security definer set search_path=public
as $$
declare a public.app_accounts;
begin
 select * into a from public.app_accounts where user_id=auth.uid() and enabled=true limit 1;
 if a.user_id is null then return false; end if;
 if a.role='admin' then return true; end if;
 if coalesce(array_length(a.ktx,1),0)>0 and not (p_ktx=any(a.ktx)) then return false; end if;
 if coalesce(array_length(a.days,1),0)>0 and not (p_day=any(a.days)) then return false; end if;
 return true;
end $$;

create or replace function public.worker_write_ok(p_ktx text,p_day text)
returns boolean language sql stable security definer set search_path=public
as $$ select public.current_app_role() in ('admin','manager','staff') and public.worker_scope_ok(p_ktx,p_day) $$;

-- ===== RLS =====
alter table public.workers enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists workers_read on public.workers;
create policy workers_read on public.workers for select to authenticated using (public.worker_scope_ok(ktx,day));
drop policy if exists workers_insert on public.workers;
create policy workers_insert on public.workers for insert to authenticated with check (public.worker_write_ok(ktx,day));
drop policy if exists workers_update on public.workers;
create policy workers_update on public.workers for update to authenticated using (public.worker_write_ok(ktx,day)) with check (public.worker_write_ok(ktx,day));
drop policy if exists workers_delete on public.workers;
create policy workers_delete on public.workers for delete to authenticated using (public.current_app_role()='admin' and public.worker_scope_ok(ktx,day));

drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select to authenticated using (public.current_app_role() in ('admin','manager'));

-- ===== AUDIT TRIGGER =====
create or replace function public.audit_worker_change()
returns trigger language plpgsql security definer set search_path=public
as $$
declare a public.app_accounts; v_action text; v_row jsonb; v_name text; v_id text;
begin
 select * into a from public.app_accounts where user_id=auth.uid() limit 1;
 v_action := tg_op;
 if tg_op='DELETE' then v_row=to_jsonb(old); v_name=old.name; v_id=old.id::text;
 else v_row=to_jsonb(new); v_name=new.name; v_id=new.id::text; end if;
 insert into public.audit_logs(actor_id,actor_email,actor_role,action,entity_type,entity_id,summary,old_data,new_data)
 values(auth.uid(),coalesce(a.email,auth.jwt()->>'email'),a.role,v_action,'worker',v_id,
   case tg_op when 'INSERT' then 'Thêm công nhân: '||coalesce(v_name,'') when 'UPDATE' then 'Cập nhật công nhân: '||coalesce(v_name,'') else 'Xóa công nhân: '||coalesce(v_name,'') end,
   case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
   case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
 if tg_op='DELETE' then return old; else return new; end if;
end $$;

drop trigger if exists workers_audit_trg on public.workers;
create trigger workers_audit_trg after insert or update or delete on public.workers for each row execute function public.audit_worker_change();

-- realtime workers + audit (nếu chưa có trong publication)
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='workers') then alter publication supabase_realtime add table public.workers; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='audit_logs') then alter publication supabase_realtime add table public.audit_logs; end if;
end $$;
