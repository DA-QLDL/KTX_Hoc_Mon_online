-- KTX v1.0.21: xoa phien diem danh (chi admin). Chay SAU sql/07__014_qr_attendance_sessions.sql.
-- KHONG xoa tat ca diem danh va khong thay doi cac bang tai khoan.
create or replace function public.ktx_admin_delete_attendance_session(p_session_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_status text; v_n integer := 0; v_uid uuid;
begin
 v_uid := auth.uid();
 if v_uid is null or not exists (
  select 1 from public.app_accounts a where a.user_id=v_uid
  and lower(a.role)='admin' and a.enabled is true
 ) then raise exception 'Chi Admin duoc xoa phien' using errcode='42501'; end if;
 if p_session_id is null then raise exception 'Thieu ID phien'; end if;
 select status into v_status from public.ktx_attendance_sessions
 where id=p_session_id for update;
 if not found then raise exception 'Phien khong ton tai'; end if;
 if v_status <> 'closed' then raise exception 'Phai dong phien truoc khi xoa'; end if;
 delete from public.ktx_attendance_qr_requests where session_id=p_session_id;
 get diagnostics v_n = row_count;
 delete from public.ktx_attendance_sessions where id=p_session_id;
 if not found then raise exception 'Khong xoa duoc phien'; end if;
 return jsonb_build_object('deleted',true,'requests_deleted',v_n);
end;
$$;
revoke all on function public.ktx_admin_delete_attendance_session(uuid) from public, anon;
grant execute on function public.ktx_admin_delete_attendance_session(uuid) to authenticated;
