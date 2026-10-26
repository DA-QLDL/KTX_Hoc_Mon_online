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
