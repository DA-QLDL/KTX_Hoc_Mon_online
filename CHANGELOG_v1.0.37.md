# v1.0.37 — Mobile quality & stability

- Mobile bottom navigation: 5 tabs (Tổng quan, Công nhân, Điểm danh, Suất ăn, Thêm).
- Keep all existing quick actions incl. Xem thực đơn and Thêm công nhân.
- Compact worker filters using a collapsible filter panel, keeping search visible.
- Mobile KPI 2-column grid, larger secondary text and touch targets.
- Online/offline status explicitly distinct from successful Cloud save.
- Dismissible cloud read error in workers screen.
- PWA shortcuts and consistent theme color; bump service-worker cache.
- Preserve source permissions/data/sync behavior, no untested automatic bulk delete, no background write queue.

## Requires separate verified backend implementation
- RLS and Cloud concurrency conflict tests with production schema.
- Production-safe deletion and data recovery integration testing.
- Push notifications: server-side authentication/subscriptions.
- Background offline write queue: conflicts and idempotency required.
- Continuous scan/CCCD OCR on device, night mode.
