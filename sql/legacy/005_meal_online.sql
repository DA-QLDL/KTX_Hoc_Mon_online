-- KTX Hóc Môn Online v30 · Báo cáo suất ăn Online
create table if not exists public.meal_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  session text not null check (session in ('sang','trua','chieu')),
  ktx text not null,
  price text,
  suppliers jsonb not null default '[]'::jsonb,
  report_text text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists meal_reports_date_idx on public.meal_reports(report_date desc, session, ktx);
alter table public.meal_reports enable row level security;
drop policy if exists meal_reports_read on public.meal_reports;
create policy meal_reports_read on public.meal_reports for select to authenticated using (public.worker_scope_ok(ktx,null));
drop policy if exists meal_reports_insert on public.meal_reports;
create policy meal_reports_insert on public.meal_reports for insert to authenticated with check (public.current_app_role() in ('admin','manager','staff') and public.worker_scope_ok(ktx,null));
drop policy if exists meal_reports_update on public.meal_reports;
create policy meal_reports_update on public.meal_reports for update to authenticated using (public.current_app_role() in ('admin','manager','staff') and public.worker_scope_ok(ktx,null)) with check (public.current_app_role() in ('admin','manager','staff') and public.worker_scope_ok(ktx,null));
drop policy if exists meal_reports_delete on public.meal_reports;
create policy meal_reports_delete on public.meal_reports for delete to authenticated using (public.current_app_role() in ('admin','manager'));
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='meal_reports') then alter publication supabase_realtime add table public.meal_reports; end if;
end $$;
