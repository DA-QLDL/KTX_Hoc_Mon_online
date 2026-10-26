-- v1.0.108: transactionally move/purge worker(s), archive, audit.
-- RUN ON TEST SUPABASE FIRST. Does not delete historical records.
-- Preview RPC currently restricted to Admin; manager role is NOT granted yet.
CREATE OR REPLACE FUNCTION public.ktx_worker_exit_atomic_v108(
 p_workers jsonb, p_mode text, p_reason text, p_date text, p_note text DEFAULT ''
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
 v_uid uuid := auth.uid();
 v_total integer;
 v_item jsonb;
 v_id text;
 v_w jsonb;
 v_existing jsonb;
 v_actor text;
 v_archive jsonb;
 v_log_id text;
 v_log jsonb;
 v_at bigint := floor(extract(epoch from clock_timestamp())*1000)::bigint;
 v_now text := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','DD/MM/YYYY HH24:MI:SS');
BEGIN
 IF v_uid IS NULL OR NOT EXISTS (
  SELECT 1 FROM public.app_accounts a
  WHERE a.user_id=v_uid AND a.enabled=true AND a.role='admin'
 ) THEN RAISE EXCEPTION 'Admin permission required' USING ERRCODE='42501'; END IF;
 IF p_mode NOT IN ('archive','purge') THEN RAISE EXCEPTION 'Invalid operation'; END IF;
 IF p_date IS NULL OR p_date !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Invalid date'; END IF;
 IF jsonb_typeof(p_workers) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid workers payload'; END IF;
 v_total := jsonb_array_length(p_workers);
 IF v_total < 1 OR v_total > 500 THEN RAISE EXCEPTION 'Batch must contain 1 to 500 workers'; END IF;
 IF (SELECT count(DISTINCT item->>'record_id') FROM jsonb_array_elements(p_workers) item) <> v_total THEN
  RAISE EXCEPTION 'Duplicate worker IDs in request'; END IF;
 -- Serialize transactions that update this group of tables.
 PERFORM pg_advisory_xact_lock(hashtext('ktx_worker_exit_atomic_v108'));
 FOR v_item IN SELECT value FROM jsonb_array_elements(p_workers) LOOP
  v_id := v_item->>'record_id';
  v_w := v_item->'payload';
  IF v_id IS NULL OR length(v_id)=0 OR jsonb_typeof(v_w) <> 'object' OR v_w->>'id' IS DISTINCT FROM v_id THEN
   RAISE EXCEPTION 'Invalid worker record'; END IF;
  SELECT payload INTO v_existing FROM public.ktx_workers WHERE record_id=v_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Worker % missing; reload data',v_id; END IF;
  IF v_existing IS DISTINCT FROM v_w THEN RAISE EXCEPTION 'Worker % changed on Cloud; reload data',v_id; END IF;
  IF p_mode='archive' THEN
   v_archive:=jsonb_build_object('id',v_id,'w',v_existing,'reason',coalesce(p_reason,'Khác'),
     'date',p_date,'note',coalesce(p_note,''),'at',v_at);
   INSERT INTO public.ktx_archived_workers(record_id,payload,updated_at,updated_by)
     VALUES(v_id,v_archive,now(),v_uid);
  END IF;
  DELETE FROM public.ktx_workers WHERE record_id=v_id;
 END LOOP;
 v_log_id := 'worker_exit_' || replace(gen_random_uuid()::text,'-','');
 v_log:=jsonb_build_object('t',v_now,'a',CASE WHEN p_mode='purge' THEN 'PURGE' ELSE 'DELETE' END,
    'd',CASE WHEN p_mode='purge' THEN 'Xóa hẳn ' ELSE 'Điều chuyển/nghỉ việc ' END || v_total::text || ' công nhân (' || coalesce(p_reason,'Khác') || ')',
    'n',v_total,'day',p_date,'reason',coalesce(p_reason,'Khác'),'at',v_at,'_sid',v_log_id);
 INSERT INTO public.ktx_audit_logs(record_id,payload,event_at,created_by)
  VALUES(v_log_id,v_log,now(),v_uid);
 RETURN jsonb_build_object('processed',v_total,'mode',p_mode,'audit_id',v_log_id);
END; $$;
REVOKE ALL ON FUNCTION public.ktx_worker_exit_atomic_v108(jsonb,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ktx_worker_exit_atomic_v108(jsonb,text,text,text,text) TO authenticated;
