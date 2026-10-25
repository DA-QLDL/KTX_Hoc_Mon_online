-- STEP v1.0.23. Chạy trên môi trường thử nghiệm trước. Không xóa dữ liệu hiện có.
create table if not exists public.ktx_attendance_session_marks (
 session_id uuid not null references public.ktx_attendance_sessions(id) on delete cascade,
 worker_code text not null,
 state text not null check (state in ('present','absent')),
 updated_at timestamptz not null default now(),
 primary key(session_id,worker_code)
);
alter table public.ktx_attendance_session_marks enable row level security;
revoke all on public.ktx_attendance_session_marks from anon, authenticated;
grant select,insert,update on public.ktx_attendance_session_marks to authenticated;
drop policy if exists ktx23_marks_read on public.ktx_attendance_session_marks;
create policy ktx23_marks_read on public.ktx_attendance_session_marks for select to authenticated using (
 exists(select 1 from public.app_accounts a where a.user_id=auth.uid() and lower(a.role) in ('admin','manager') and a.enabled is true)
);
drop policy if exists ktx23_marks_insert on public.ktx_attendance_session_marks;
create policy ktx23_marks_insert on public.ktx_attendance_session_marks for insert to authenticated with check (
 exists(select 1 from public.app_accounts a where a.user_id=auth.uid() and lower(a.role) in ('admin','manager') and a.enabled is true)
 and exists(select 1 from public.ktx_attendance_sessions s where s.id=session_id and s.status='open')
);
drop policy if exists ktx23_marks_update on public.ktx_attendance_session_marks;
create policy ktx23_marks_update on public.ktx_attendance_session_marks for update to authenticated using (
 exists(select 1 from public.app_accounts a where a.user_id=auth.uid() and lower(a.role) in ('admin','manager') and a.enabled is true)
 and exists(select 1 from public.ktx_attendance_sessions s where s.id=session_id and s.status='open')
) with check (
 exists(select 1 from public.app_accounts a where a.user_id=auth.uid() and lower(a.role) in ('admin','manager') and a.enabled is true)
 and exists(select 1 from public.ktx_attendance_sessions s where s.id=session_id and s.status='open')
);
-- Quan trọng: thay RPC xóa phiên để xóa cả dấu tick trong cùng một giao dịch.
create or replace function public.ktx_admin_delete_attendance_session(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_status text; v_n integer := 0; v_marks integer := 0;
begin
 if auth.uid() is null or not exists (select 1 from public.app_accounts a where a.user_id=auth.uid() and lower(a.role)='admin' and a.enabled is true) then
  raise exception 'Chi Admin duoc xoa phien' using errcode='42501';
 end if;
 select status into v_status from public.ktx_attendance_sessions where id=p_session_id for update;
 if not found then raise exception 'Khong tim thay phien'; end if;
 if v_status<>'closed' then raise exception 'Can dong phien truoc khi xoa'; end if;
 delete from public.ktx_attendance_session_marks where session_id=p_session_id;
 get diagnostics v_marks=row_count;
 delete from public.ktx_attendance_qr_requests where session_id=p_session_id;
 get diagnostics v_n=row_count;
 delete from public.ktx_attendance_sessions where id=p_session_id;
 return jsonb_build_object('deleted',true,'requests_deleted',v_n,'marks_deleted',v_marks);
end $$;
revoke all on function public.ktx_admin_delete_attendance_session(uuid) from public,anon;
grant execute on function public.ktx_admin_delete_attendance_session(uuid) to authenticated;
