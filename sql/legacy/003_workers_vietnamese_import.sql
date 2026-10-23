-- KTX Hóc Môn Online v28
-- Bổ sung trường để giữ nguyên dữ liệu CSV tiếng Việt, không mất thông tin.
alter table public.workers add column if not exists village text;
alter table public.workers add column if not exists ward text;
alter table public.workers add column if not exists province text;
alter table public.workers add column if not exists check_out_date date;
alter table public.workers add column if not exists stay_days integer;
alter table public.workers add column if not exists leader_phone text;
alter table public.workers add column if not exists residence_status text;

create index if not exists workers_leader_phone_idx on public.workers(leader_phone) where nullif(trim(leader_phone),'') is not null;
create index if not exists workers_check_out_idx on public.workers(check_out_date) where check_out_date is not null;

comment on column public.workers.village is 'Thôn/Xóm';
comment on column public.workers.ward is 'Xã/Phường';
comment on column public.workers.province is 'Tỉnh/TP';
comment on column public.workers.check_out_date is 'Ngày Ra KTX';
comment on column public.workers.stay_days is 'Số Ngày Lưu Trú';
comment on column public.workers.leader_phone is 'SĐT Tổ Trưởng';
comment on column public.workers.residence_status is 'Trạng thái tạm trú, Tạm vắng';
