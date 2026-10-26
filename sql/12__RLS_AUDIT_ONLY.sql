-- READ ONLY: run in Supabase SQL Editor; export results to CSV and review before changing policies.
-- This is NOT a dump of deployed RLS. It queries the current database.
select n.nspname as schema_name,c.relname as table_name,c.relrowsecurity as rls_enabled,c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','p') and (c.relname like 'ktx_%' or c.relname in ('app_accounts','residency_requests')) order by table_name;
select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
from pg_policies where schemaname='public' and (tablename like 'ktx_%' or tablename in ('app_accounts','residency_requests')) order by tablename,policyname;
select table_schema,table_name,grantee,privilege_type from information_schema.role_table_grants
where table_schema='public' and grantee in ('anon','authenticated') and (table_name like 'ktx_%' or table_name in ('app_accounts','residency_requests'))
order by table_name,grantee,privilege_type;
