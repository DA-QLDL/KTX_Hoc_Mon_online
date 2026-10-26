-- v1.0.105 - Atomic menu import, authenticated and scoped by app_accounts.
-- Requires sql/09__016_meal_menu_monitor.sql and corresponding Supabase Auth sessions.
-- No DDL/data deletion. Run manually on a test Supabase project first.
create or replace function public.ktx_commit_meal_menu_batch(p_rows jsonb)
returns integer
language plpgsql security invoker set search_path = public, pg_temp
as $$
declare
  r jsonb; n integer := 0; u uuid := auth.uid(); role_name text;
begin
  if u is null then raise exception 'Authentication required'; end if;
  select a.role into role_name from public.app_accounts a
   where a.user_id = u and a.enabled = true limit 1;
  if role_name is distinct from 'admin' and role_name is distinct from 'manager' then
    raise exception 'Permission denied for meal import';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) not between 1 and 500 then
    raise exception 'Expected array with 1..500 rows';
  end if;
  for r in select value from jsonb_array_elements(p_rows) loop
    if jsonb_typeof(r) <> 'object' or r->>'meal_period' not in ('sang','trua','chieu')
       or r->>'menu_type' not in ('man','chay') or length(trim(coalesce(r->>'vendor',''))) not between 1 and 160
       or jsonb_typeof(r->'dishes') is distinct from 'array' then
      raise exception 'Invalid meal menu row';
    end if;
    insert into public.ktx_meal_menus(meal_date,meal_period,vendor,menu_type,dishes,updated_at,updated_by)
    values ((r->>'meal_date')::date, r->>'meal_period',trim(r->>'vendor'),r->>'menu_type',r->'dishes',now(),u)
    on conflict(meal_date,meal_period,vendor,menu_type)
    do update set dishes=excluded.dishes, updated_at=now(), updated_by=u;
    n:=n+1;
  end loop;
  return n;
end; $$;
revoke all on function public.ktx_commit_meal_menu_batch(jsonb) from public, anon;
grant execute on function public.ktx_commit_meal_menu_batch(jsonb) to authenticated;
