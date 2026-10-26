-- v1.0.112: redefines the v108/v111 atomic functions to maintain employee roster metadata
-- in ktx_residence_status during the same PostgreSQL transaction.
-- Run AFTER SQL files 22__108 and 24__111, first in a disposable test Supabase project.
-- No change to legal registration fields; no deletion of historical records.
-- RLS remains enabled and both RPCs remain SECURITY INVOKER, Admin-only.
-- DO NOT apply without confirming that the application uses the documented payload schema.

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
  -- Keep residence registration fields intact; mark only worker roster linkage.
  -- Update ONLY existing residence status rows. Do not create a registration by implication.
  UPDATE public.ktx_residence_status
  SET payload = jsonb_set(jsonb_set(payload, '{_worker_roster_state}',
         to_jsonb('inactive'::text), true), '{_worker_roster_changed_at}',
         to_jsonb(v_now), true), updated_at=now(), updated_by=v_uid
  WHERE worker_id=v_id;
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


-- v1.0.111: one Cloud transaction for workers + archive + audit + residence history.
-- Run on TEST Supabase first. Admin-only for now; RLS remains enforced (SECURITY INVOKER).
CREATE OR REPLACE FUNCTION public.ktx_worker_restore_atomic_v111(p_items jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE
 v_uid uuid := auth.uid(); v_total integer; it jsonb; wid text;
 stored_archive jsonb; target_worker jsonb; existing_worker jsonb;
 v_log_id text; v_event_id text; v_when timestamptz:=now();
BEGIN
 IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.app_accounts a WHERE a.user_id=v_uid AND a.enabled=true AND a.role='admin')
 THEN RAISE EXCEPTION 'Admin permission required' USING ERRCODE='42501'; END IF;
 IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Expected an array'; END IF;
 v_total:=jsonb_array_length(p_items);
 IF v_total<1 OR v_total>500 THEN RAISE EXCEPTION 'Restore batch must have 1..500 workers'; END IF;
 IF (SELECT count(DISTINCT x->>'record_id') FROM jsonb_array_elements(p_items) x) <> v_total THEN RAISE EXCEPTION 'Duplicate IDs'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('ktx_worker_exit_atomic_v108'));
 FOR it IN SELECT value FROM jsonb_array_elements(p_items) LOOP
  wid:=it->>'record_id';target_worker:=it->'worker_payload';
  IF wid IS NULL OR wid='' OR jsonb_typeof(target_worker) IS DISTINCT FROM 'object' OR target_worker->>'id' IS DISTINCT FROM wid
  THEN RAISE EXCEPTION 'Invalid worker payload'; END IF;
  SELECT payload INTO stored_archive FROM public.ktx_archived_workers WHERE record_id=wid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Archive worker % not found',wid; END IF;
  IF stored_archive IS DISTINCT FROM it->'archive_payload' THEN RAISE EXCEPTION 'Archive % changed on Cloud',wid; END IF;
  SELECT payload INTO existing_worker FROM public.ktx_workers WHERE record_id=wid FOR UPDATE;
  IF FOUND THEN RAISE EXCEPTION 'Worker % already active',wid; END IF;
  INSERT INTO public.ktx_workers(record_id,payload,updated_at,updated_by) VALUES(wid,target_worker,v_when,v_uid);
  -- The roster state is separate from legal residence registration status.
  -- Preserve all registration fields, even when a worker returns to another room.
  UPDATE public.ktx_residence_status
  SET payload = jsonb_set(jsonb_set(payload, '{_worker_roster_state}',
         to_jsonb('active'::text), true), '{_worker_roster_changed_at}',
         to_jsonb(to_char(v_when AT TIME ZONE 'Asia/Ho_Chi_Minh','DD/MM/YYYY HH24:MI:SS')), true),
      updated_at=v_when, updated_by=v_uid
  WHERE worker_id=wid;
  DELETE FROM public.ktx_archived_workers WHERE record_id=wid;
  v_event_id:='restore_history_'||replace(gen_random_uuid()::text,'-','');
  INSERT INTO public.ktx_residence_history(record_id,worker_id,payload,event_at,updated_by)
  VALUES(v_event_id,wid,jsonb_build_object('action','RESTORE','worker_id',wid,'previous_location',jsonb_build_object('ktx',stored_archive->'w'->'ktx','day',stored_archive->'w'->'day','room',stored_archive->'w'->'room'), 'new_location',jsonb_build_object('ktx',target_worker->'ktx','day',target_worker->'day','room',target_worker->'room'),'at',v_when),v_when,v_uid);
 END LOOP;
 v_log_id:='worker_restore_'||replace(gen_random_uuid()::text,'-','');
 INSERT INTO public.ktx_audit_logs(record_id,payload,event_at,created_by)
 VALUES(v_log_id,jsonb_build_object('_sid',v_log_id,'a','RESTORE','d','Khôi phục '||v_total::text||' công nhân','n',v_total,'day',to_char(v_when AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD'),'t',to_char(v_when AT TIME ZONE 'Asia/Ho_Chi_Minh','DD/MM/YYYY HH24:MI:SS')),v_when,v_uid);
 RETURN jsonb_build_object('processed',v_total,'audit_id',v_log_id);
END; $$;
REVOKE ALL ON FUNCTION public.ktx_worker_restore_atomic_v111(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ktx_worker_restore_atomic_v111(jsonb) TO authenticated;
