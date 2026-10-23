-- STEP214: Chỉ sửa quyền GỬI đăng ký qua biểu mẫu công khai.
-- Chạy trong Supabase của KTX Hóc Môn, sau khi xác minh đúng Project.
-- KHÔNG xóa bảng, không thay đổi hồ sơ hiện tại, không cấp SELECT/UPDATE/DELETE cho khách.
-- Lưu ý: hồ sơ công khai có thể bị spam; triển khai CAPTCHA / giới hạn tần suất khi vận hành.

begin;

-- Nếu bảng không tồn tại, dừng và kiểm tra script tạo bảng gốc.
do $$
begin
  if to_regclass('public.residency_requests') is null then
    raise exception 'Thiếu bảng public.residency_requests; cần triển khai schema gốc trước';
  end if;
end $$;

grant usage on schema public to anon;
-- Chỉ các cột thực sự do biểu mẫu đăng ký ghi, không cấp status, reviewed_by hay reviewed_at.
grant insert (
  request_type, worker_code, name, day, room, cccd, phone, dob, gender,
  unit, td, leader, leader_phone, address, ktx, check_in_date, reason
) on public.residency_requests to anon;

alter table public.residency_requests enable row level security;

drop policy if exists residency_requests_public_submit_step214 on public.residency_requests;
create policy residency_requests_public_submit_step214
on public.residency_requests
for insert to anon
with check (
  request_type in ('in', 'out')
  and status = 'pending'
  and reviewed_at is null
  and reviewed_by is null
);

commit;

-- Chỉ xem chính sách và quyền, không đọc dữ liệu cá nhân.
select policyname, cmd, roles from pg_policies
where schemaname='public' and tablename='residency_requests'
order by policyname;
