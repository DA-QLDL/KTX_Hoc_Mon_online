-- QLKTX Stage 82 - One-step install / repair for personal contact email.
-- Run ONCE using Supabase SQL Editor with database role postgres.
-- Does not change Supabase Auth email, passwords, app permissions, or RLS policies.
-- Only authenticated admins enabled in public.app_accounts may call the functions.

BEGIN;

ALTER TABLE public.app_accounts
    ADD COLUMN IF NOT EXISTS personal_email text;

COMMENT ON COLUMN public.app_accounts.personal_email
    IS 'Email liên hệ cá nhân, riêng với email đăng nhập Supabase Auth';

CREATE OR REPLACE FUNCTION public.ktx_get_personal_emails_v278()
RETURNS TABLE (user_id uuid, personal_email text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $fn$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.app_accounts a
     WHERE a.user_id=auth.uid() AND a.role='admin' AND a.enabled IS TRUE
  ) THEN
    RAISE EXCEPTION 'Không có quyền Quản trị để xem Email cá nhân.' USING ERRCODE='42501';
  END IF;

  RETURN QUERY
    SELECT a.user_id, a.personal_email FROM public.app_accounts a;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.ktx_set_personal_email_v278(
    p_user_id uuid, p_personal_email text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  new_email text := nullif(lower(btrim(coalesce(p_personal_email,''))), '');
  verified text;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.app_accounts a
     WHERE a.user_id=auth.uid() AND a.role='admin' AND a.enabled IS TRUE
  ) THEN
    RAISE EXCEPTION 'Không có quyền Quản trị để cập nhật Email cá nhân.' USING ERRCODE='42501';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Thiếu mã tài khoản cần cập nhật.' USING ERRCODE='22023';
  END IF;

  IF new_email IS NOT NULL AND (
    length(new_email)>254 OR
    new_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ) THEN
    RAISE EXCEPTION 'Email cá nhân không hợp lệ.' USING ERRCODE='22023';
  END IF;

  UPDATE public.app_accounts AS a SET personal_email=new_email
   WHERE a.user_id=p_user_id
   RETURNING a.personal_email INTO verified;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy tài khoản.' USING ERRCODE='P0002';
  END IF;

  RETURN coalesce(verified,'');
END;
$fn$;

-- SECURITY DEFINER is ineffective for protected table access if the function
-- owner itself lacks the needed privileges. Owner must be privileged.
ALTER FUNCTION public.ktx_get_personal_emails_v278() OWNER TO postgres;
ALTER FUNCTION public.ktx_set_personal_email_v278(uuid,text) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.ktx_get_personal_emails_v278() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ktx_set_personal_email_v278(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ktx_get_personal_emails_v278() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ktx_set_personal_email_v278(uuid,text) TO authenticated;

COMMIT;

-- Verification. Owner=postgres, security_definer=true, postgres can update table.
SELECT p.proname, pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
WHERE n.nspname='public'
AND p.proname IN ('ktx_get_personal_emails_v278','ktx_set_personal_email_v278');

SELECT has_table_privilege('postgres','public.app_accounts','UPDATE') AS postgres_can_update_accounts;
