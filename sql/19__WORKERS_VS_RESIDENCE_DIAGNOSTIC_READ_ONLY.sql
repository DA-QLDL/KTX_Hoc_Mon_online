-- CHỈ ĐỌC. Chạy trong Supabase SQL Editor với tư cách quản trị DB.
-- Lưu ý: SQL Editor postgres có thể nhìn thấy bản ghi mà ứng dụng authenticated bị RLS ẩn.
select 'ktx_workers' as table_name, count(*) as rows from public.ktx_workers
union all select 'ktx_residence_status', count(*) from public.ktx_residence_status
union all select 'workers_legacy', count(*) from public.workers
union all select 'ktx_archived_workers', count(*) from public.ktx_archived_workers;

-- Kiểm tra định dạng thực tế của công nhân, không truy xuất PII:
select count(*) as total_rows,
       count(*) filter (where payload is null) as null_payload,
       count(*) filter (where jsonb_typeof(payload) <> 'object') as non_object_payload
from public.ktx_workers;

-- Chính sách thực tế, không ghi/chỉnh sửa quyền:
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname='public' and tablename in ('ktx_workers','ktx_residence_status','app_accounts')
order by tablename,policyname;

select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('ktx_workers','ktx_residence_status','app_accounts');

select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name in ('ktx_workers','ktx_residence_status')
  and grantee='authenticated'
order by table_name, privilege_type;
