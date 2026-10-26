# KTX v1.0.15 – QA release gate

**This is a candidate, not a production-verified release.**

1. Back up Supabase DB and export workers XLSX before changes.
2. Deploy to staging with separate Supabase project and disposable data.
3. Run SQL 14 (after SQL 01–11), test RPC under manager (must fail), admin (must succeed), missing count (must fail).
4. Import 10 rows, verify server count and actual rows, reload twice and log in on a second device.
5. Edit one row; verify Cloud acknowledgement then reload. Repeat with offline network; data should remain pending, not overwritten.
6. Delete selected 2 rows, check physical Cloud rows and reload.
7. Bulk delete 10 test rows and check atomic outcome and audit trail; verify no unexpected cascading deletes.
8. Navigate all menu options on PC, Android Chrome PWA, iOS Safari/PWA; check iPhone add-worker form with keyboard open.
9. Load >1,000 records and check no incomplete read or endless retry; run offline/slow 3G tests.
10. Inspect Supabase RLS via sql/12__RLS_AUDIT_ONLY.sql; do NOT deploy scope design SQL 13 without review.
11. Inspect browser Console + Network for 401/403/409/5xx, verify sw.js cache version and rollback.

Release only after every critical test passes.
