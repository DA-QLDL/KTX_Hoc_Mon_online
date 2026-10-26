-- v1.0.101: Giao dịch nguyên tử nhiều module tiện ích trên bảng đã có.
-- Chỉ triển khai sau khi xác minh RLS, quyền của user, và backup.
-- SECURITY INVOKER: bắt buộc caller phải có quyền bảng theo RLS.
create or replace function public.ktx_commit_utility_batch(p_changes jsonb)
returns jsonb
language plpgsql security invoker set search_path=public
as $$
declare
 v jsonb; v_key text; v_expected bigint; v_actual bigint;
 v_rows jsonb; v_count int:=0; v_seen text[]:=array[]::text[];
begin
 if auth.uid() is null then raise exception 'Yêu cầu đăng nhập'; end if;
 if jsonb_typeof(p_changes)<>'array' or jsonb_array_length(p_changes)<1 or jsonb_array_length(p_changes)>50 then
   raise exception 'Yêu cầu từ 1 đến 50 module'; end if;
 -- Khoá bảng để tránh tranh chấp khi có các ứng dụng cũ ghi không sử dụng RPC.
 lock table public.ktx_utility_snapshots in share row exclusive mode;
 for v in select value from jsonb_array_elements(p_changes) loop
   v_key:=v->>'module_key';
   if v_key is null or length(v_key)>160 or v_key=any(v_seen) then raise exception 'Tên module không hợp lệ hoặc trùng'; end if;
   v_seen:=array_append(v_seen,v_key);
   v_rows:=v->'rows';
   if jsonb_typeof(v_rows)<>'array' then raise exception 'rows phải là mảng'; end if;
   if v->>'expected_revision' is null then
      select revision into v_actual from public.ktx_utility_snapshots where module_key=v_key;
      if found then raise exception 'Xung đột dữ liệu ở module %',v_key; end if;
      insert into public.ktx_utility_snapshots(module_key,revision,rows,updated_by)
      values(v_key,1,v_rows,auth.uid());
   else
      v_expected:=(v->>'expected_revision')::bigint;
      update public.ktx_utility_snapshots set rows=v_rows,revision=revision+1,
          updated_by=auth.uid(),updated_at=now()
      where module_key=v_key and revision=v_expected;
      if not found then raise exception 'Xung đột phiên bản ở module %',v_key; end if;
   end if;
   v_count:=v_count+1;
 end loop;
 return jsonb_build_object('success',true,'updated_modules',v_count);
end;
$$;
revoke all on function public.ktx_commit_utility_batch(jsonb) from public;
grant execute on function public.ktx_commit_utility_batch(jsonb) to authenticated;
