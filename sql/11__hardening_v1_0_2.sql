-- KTX Hóc Môn v1.0.2 — Siết bảo mật & vá schema (chạy SAU các file 01..10, chạy lại nhiều lần vẫn an toàn)
-- Thay thế hoàn toàn legacy/STEP214 và legacy/STEP249. Không xóa bảng, không xóa dữ liệu.
-- Sửa các điểm sau:
--  1. residency_requests: form QR gửi leader_phone, check_in_date nhưng bảng chưa có cột -> thêm cột.
--  2. residency_requests: 2 policy INSERT của anon (007 chặt + STEP214 lỏng) cộng dồn kiểu OR -> bỏ ràng buộc. Gộp còn 1 policy chặt.
--  3. residency_requests: mọi tài khoản đăng nhập (kể cả chưa được cấp quyền/đã khóa) đọc và duyệt được hồ sơ có CCCD -> chỉ tài khoản app_accounts đang bật theo vai trò.
--  4. ktx_attendance_qr_requests: STEP249 làm mất kiểm tra phiên điểm danh của 014; 014 còn so sánh s.ktx=ktx (luôn đúng) -> kiểm tra lại đúng KTX.
begin;

do $$
begin
  if to_regclass('public.residency_requests') is null then raise exception 'Thiếu public.residency_requests (chạy 03 trước)'; end if;
  if to_regclass('public.ktx_attendance_qr_requests') is null then raise exception 'Thiếu public.ktx_attendance_qr_requests (chạy 06 trước)'; end if;
  if to_regclass('public.ktx_attendance_sessions') is null then raise exception 'Thiếu public.ktx_attendance_sessions (chạy 07 trước)'; end if;
  if to_regprocedure('public.ktx_app_has_role(text[])') is null then raise exception 'Thiếu hàm ktx_app_has_role (chạy 04 trước)'; end if;
end $$;

-- ===== 1. Cột còn thiếu =====
alter table public.residency_requests add column if not exists leader_phone text;
alter table public.residency_requests add column if not exists check_in_date date;
alter table public.ktx_attendance_qr_requests add column if not exists day text;
alter table public.ktx_attendance_qr_requests add column if not exists room text;

-- ===== 2. Đăng ký vào/ra công khai (anon chỉ được INSERT) =====
grant usage on schema public to anon;
revoke all on table public.residency_requests from anon;
grant insert (request_type, worker_code, name, cccd, phone, dob, gender, unit, td, leader, leader_phone,
              address, ktx, day, room, check_in_date, reason, note)
  on public.residency_requests to anon;

drop policy if exists "worker_submit_residency_request" on public.residency_requests;
drop policy if exists residency_requests_public_submit_step214 on public.residency_requests;
drop policy if exists residency_public_submit on public.residency_requests;
create policy residency_public_submit on public.residency_requests
  for insert to anon
  with check (
    status = 'pending' and reviewed_at is null and reviewed_by is null
    and request_type in ('in','out')
    and length(trim(name)) between 2 and 120
    and (request_type <> 'out' or (worker_code is not null and length(trim(worker_code)) > 0))
    and day is not null and length(trim(day)) > 0
    and room is not null and length(trim(room)) > 0
    and coalesce(length(worker_code),0) <= 60
    and coalesce(length(cccd),0) <= 20
    and coalesce(length(phone),0) <= 20
    and coalesce(length(leader_phone),0) <= 20
    and coalesce(length(address),0) <= 300
    and coalesce(length(reason),0) <= 500
    and coalesce(length(note),0) <= 500
  );

-- ===== 3. Quản lý đọc / duyệt: chỉ tài khoản đang bật trong app_accounts =====
grant select on table public.residency_requests to authenticated;
grant update (status, reviewed_at, reviewed_by) on table public.residency_requests to authenticated;

drop policy if exists "manager_read_residency_requests" on public.residency_requests;
create policy "manager_read_residency_requests" on public.residency_requests
  for select to authenticated
  using (public.ktx_app_has_role(array['admin','manager','staff','guard','viewer']));

drop policy if exists "manager_update_residency_requests" on public.residency_requests;
create policy "manager_update_residency_requests" on public.residency_requests
  for update to authenticated
  using (public.ktx_app_has_role(array['admin','manager','staff']))
  with check (
    status in ('pending','approved','rejected')
    and (reviewed_by is null or reviewed_by = auth.uid())
    and public.ktx_app_has_role(array['admin','manager','staff'])
  );

-- ===== 4. Điểm danh QR công khai: kiểm tra phiên đang mở, đúng ngày, đúng KTX =====
grant usage on schema public to anon;
revoke all on table public.ktx_attendance_qr_requests from anon;
grant insert (worker_code, worker_name, ktx, direction, day, room, session_id)
  on public.ktx_attendance_qr_requests to anon;

drop policy if exists attendance_qr_public_submit on public.ktx_attendance_qr_requests;
create policy attendance_qr_public_submit on public.ktx_attendance_qr_requests
  for insert to anon
  with check (
    status = 'pending' and reviewed_at is null and reviewed_by is null
    and coalesce(length(day),0) <= 60 and coalesce(length(room),0) <= 60
    and (
      session_id is null
      or exists (
        select 1 from public.ktx_attendance_sessions s
        where s.id = session_id
          and s.status = 'open'
          and s.session_day = (now() at time zone 'Asia/Ho_Chi_Minh')::date
          and (s.ktx is null or s.ktx = ktx_attendance_qr_requests.ktx)
      )
    )
  );

commit;

-- Kiểm tra sau khi chạy (chỉ xem chính sách, không đọc dữ liệu cá nhân):
select tablename, policyname, cmd, roles from pg_policies
where schemaname='public' and tablename in ('residency_requests','ktx_attendance_qr_requests')
order by tablename, policyname;
