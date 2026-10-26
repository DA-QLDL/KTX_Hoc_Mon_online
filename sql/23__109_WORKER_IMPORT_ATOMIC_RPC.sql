-- Preview: atomic worker MERGE import; 1-2000 records in one transaction.
-- Run only in test Supabase; review app_accounts access and RLS before production.
CREATE OR REPLACE FUNCTION public.ktx_worker_import_atomic_v109(p_items jsonb, p_source text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE
  v_uid uuid := auth.uid(); v_total integer; v_item jsonb; v_id text;
  v_old jsonb; v_expected jsonb; v_new jsonb;
  v_inserted integer := 0; v_updated integer := 0;
  v_cccd text; v_mnv text; v_log_id text; v_time bigint;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM public.app_accounts a
       WHERE a.user_id=v_uid AND a.enabled=true AND a.role='admin') THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE='42501';
  END IF;
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid item list'; END IF;
  v_total := jsonb_array_length(p_items);
  IF v_total < 1 OR v_total > 2000 THEN RAISE EXCEPTION 'Import must contain 1..2000 workers per transaction'; END IF;
  IF (SELECT count(DISTINCT z->>'record_id') FROM jsonb_array_elements(p_items) z) <> v_total THEN
    RAISE EXCEPTION 'Duplicate record IDs'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('ktx_worker_import_atomic_v109'));
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_id := v_item->>'record_id'; v_new := v_item->'payload'; v_expected := v_item->'expected';
    IF coalesce(length(v_id),0)=0 OR jsonb_typeof(v_new) <> 'object'
       OR v_new->>'id' IS DISTINCT FROM v_id OR nullif(btrim(v_new->>'name'),'') IS NULL THEN
       RAISE EXCEPTION 'Invalid worker payload'; END IF;
    v_cccd := nullif(btrim(v_new->>'cccd'),''); v_mnv := nullif(btrim(v_new->>'mnv'),'');
    IF v_cccd IS NOT NULL AND EXISTS(SELECT 1 FROM public.ktx_workers w
        WHERE w.record_id <> v_id AND w.payload->>'cccd' = v_cccd) THEN
       RAISE EXCEPTION 'CCCD already exists: %',v_cccd;
    END IF;
    IF v_mnv IS NOT NULL AND EXISTS(SELECT 1 FROM public.ktx_workers w
        WHERE w.record_id <> v_id AND w.payload->>'mnv' = v_mnv) THEN
       RAISE EXCEPTION 'Employee ID already exists: %',v_mnv;
    END IF;
    SELECT payload INTO v_old FROM public.ktx_workers WHERE record_id=v_id FOR UPDATE;
    IF FOUND THEN
       IF jsonb_typeof(v_expected) <> 'object' OR v_old IS DISTINCT FROM v_expected THEN
         RAISE EXCEPTION 'Worker % has changed on Cloud. Reload before importing',v_id;
       END IF;
       UPDATE public.ktx_workers SET payload=v_new,updated_at=now(),updated_by=v_uid WHERE record_id=v_id;
       v_updated := v_updated+1;
    ELSE
       IF v_expected IS NOT NULL THEN RAISE EXCEPTION 'Worker % missing from Cloud. Reload',v_id; END IF;
       INSERT INTO public.ktx_workers(record_id,payload,updated_at,updated_by) VALUES (v_id,v_new,now(),v_uid);
       v_inserted := v_inserted+1;
    END IF;
  END LOOP;
  v_time := floor(extract(epoch from clock_timestamp())*1000)::bigint;
  v_log_id := 'import109_' || replace(gen_random_uuid()::text,'-','');
  INSERT INTO public.ktx_audit_logs(record_id,payload,event_at,created_by)
    VALUES(v_log_id,jsonb_build_object('a','IMPORT','at',v_time,
      'day',to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD'),
      't',to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','DD/MM/YYYY HH24:MI:SS'),
      'd',format('Atomic Excel import: %s created, %s updated. Source: %s',v_inserted,v_updated,left(coalesce(p_source,''),120)),
      'n',v_total,'_sid',v_log_id),now(),v_uid);
  RETURN jsonb_build_object('processed',v_total,'inserted',v_inserted,'updated',v_updated);
END; $$;
REVOKE ALL ON FUNCTION public.ktx_worker_import_atomic_v109(jsonb,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ktx_worker_import_atomic_v109(jsonb,text) TO authenticated;
