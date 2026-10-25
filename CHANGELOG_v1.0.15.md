# v1.0.15 Core Stability Candidate
- Fail explicitly on truncated fetch instead of silently returning incomplete dataset.
- Stage all core table reads before applying to local app.
- Disable implicit global worker deletions during normal sync pushes.
- Use transactional Admin-only RPC for bulk deletion (requires staging-tested SQL 14 migration).
- Add Supabase, GitHub, Vercel deployment instructions and a release QA gate.
- DOES NOT claim full UX/RLS/security/Android/iOS testing. Further cross-device integration testing is required.
