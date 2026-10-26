-- v1.0.32 / OPTIONAL — review account schema first.
-- No changes to Supabase RLS or existing grants.
-- Run this SELECT to see whether view_all_days is present.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='app_accounts'
ORDER BY ordinal_position;

-- AFTER REVIEW ONLY, if app_accounts stores account settings as columns,
-- and your RLS grants administrators permission to edit this flag:
-- ALTER TABLE public.app_accounts
--   ADD COLUMN IF NOT EXISTS view_all_days boolean NOT NULL DEFAULT false;
-- Update a specific approved account by its real account key; do not blanket grant access.
-- NOTE: existing JS account mapping must fetch this field in ME.acct.
-- NOTE: a read policy allowing global read is also required; do not broaden
-- write policies. Any global read must be authorized and tested separately.
