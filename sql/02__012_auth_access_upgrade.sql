-- KTX Hóc Môn · STEP133 · Nâng cấp đăng nhập / phân quyền / phiên bảo mật
-- Chạy TOÀN BỘ file này 1 lần trong Supabase Dashboard > SQL Editor.

-- 1) Cho phép đầy đủ 5 vai trò, bổ sung Bảo vệ.
alter table public.app_accounts drop constraint if exists app_accounts_role_check;
alter table public.app_accounts
  add constraint app_accounts_role_check
  check (role in ('admin','manager','staff','guard','viewer'));

-- 2) Metadata phiên để màn hình bảo mật có thể theo dõi lần đăng nhập gần nhất.
alter table public.app_accounts add column if not exists last_login_at timestamptz;
alter table public.app_accounts add column if not exists last_logout_at timestamptz;
alter table public.app_accounts add column if not exists last_seen_at timestamptz;

-- 3) RPC an toàn: user chỉ được cập nhật metadata phiên của CHÍNH mình.
create or replace function public.touch_app_session(p_event text default 'seen')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if lower(coalesce(p_event,'seen')) = 'login' then
    update public.app_accounts
       set last_login_at = now(), last_seen_at = now(), updated_at = now()
     where user_id = auth.uid();
  elsif lower(coalesce(p_event,'seen')) = 'logout' then
    update public.app_accounts
       set last_logout_at = now(), last_seen_at = now(), updated_at = now()
     where user_id = auth.uid();
  else
    update public.app_accounts
       set last_seen_at = now(), updated_at = now()
     where user_id = auth.uid();
  end if;
end;
$$;

revoke all on function public.touch_app_session(text) from public;
grant execute on function public.touch_app_session(text) to authenticated;

-- 4) Chỉ mục hỗ trợ lọc trạng thái/vai trò nhanh hơn.
create index if not exists app_accounts_role_enabled_idx on public.app_accounts(role, enabled);
create index if not exists app_accounts_last_login_idx on public.app_accounts(last_login_at desc);

-- Kiểm tra sau khi chạy:
select email, display_name, role, enabled, ktx, days, last_login_at, last_logout_at
from public.app_accounts
order by created_at;
