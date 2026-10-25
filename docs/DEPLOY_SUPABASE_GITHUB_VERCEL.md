# Deployment runbook – v1.0.15 (staging first)

## Supabase
1. Create a separate staging Supabase project (recommended), back up Production via Database Backups/dashboard or pg_dump. Export workers.
2. In SQL Editor, first run `sql/12__RLS_AUDIT_ONLY.sql` and save output.
3. On STAGING after verifying existing base schema, review and run `sql/14__ADMIN_DELETE_WORKERS_RPC_REVIEW.sql`. This creates a function but does **not** immediately delete rows.
4. Test with authorized Admin and manager accounts; manager must be rejected. Verify `app_accounts` enabled+role and `ktx_workers` RLS DELETE.
5. Do not run SQL 13 scope design directly. Existing user scope must be modeled and signed identity tested first.
6. Front-end requires Supabase Project URL + anon/publishable key only. **Never** place service_role/secret keys in source or browser.

## GitHub
1. Create a backup tag/branch for the currently deployed version.
2. Extract ZIP and copy updated app into existing deploy root (observe current Vercel Root Directory). Commit new assets and docs.
3. Commit and push to a new `staging/v1.0.15` branch. Do not include credentials or raw worker exports.
4. Review diff and run syntax tests before merging into production branch.

## Vercel
1. Import/connect the staging branch from GitHub; set project Root Directory to match folder with `index.html` and `vercel.json` if required.
2. Configure preview env values if project uses any; do NOT expose privileged secrets as `NEXT_PUBLIC_*` or in client JS.
3. Verify Preview deployment, clear old PWA/service worker cache, confirm new scripts served.
4. Complete QA release gate before promoting. If failed, rollback to tagged deployment and restore DB only if really needed.

## Important
Bulk delete uses RPC and will not work until function SQL 14 has been reviewed and deployed. It will show a clear error instead of silently deleting client-side. SQL atomicity prevents partial statement deletion, but concurrent sync clients still must be quiesced and app logic tested.
