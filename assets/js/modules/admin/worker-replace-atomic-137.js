/* v1.0.137 -- Atomic, admin-only replacement. Never modify W before commit. */
(()=>{'use strict';
  const $=id=>document.getElementById(id);
  const norm=v=>String(v??'').trim();
  const cloned=v=>JSON.parse(JSON.stringify(v));
  const fail=(message)=>{throw new Error(message)};
  window.KTX_REPLACE_BUILD='1.0.147-v143-duplicates';
  window.ktx137ReplaceWorkers=async(p,button)=>{
    if(!p||!p.analysis?.rows?.length)return alert('File Import không có dữ liệu.');
    if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.ready||!SUPA_SYNC.session){
      return alert('Chưa xác thực Supabase. Hãy đăng nhập và thử lại.');
    }
    if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying){
      return alert('Supabase đang đồng bộ. Thử lại sau khi dữ liệu tải xong.');
    }
    // v1.0.140: Import validation is advisory (missing/short CCCD, DOB, room
    // configuration). Identity collisions remain hard failures below.
    const invalid=p.analysis.rows.filter(r=>r.v.errors.length);
    const input=p.analysis.rows.map(r=>r.o);
    const sb=syncClient();
    if(!sb)return alert('Không thể khởi tạo kết nối Supabase.');
    button.disabled=true;
    const label=button.textContent;
    try{
      button.textContent='Đang đọc dữ liệu Cloud...';
      const existing=await syncFetchAll('ktx_workers','record_id,payload');
      // v143: duplicate employee numbers / CCCD are allowed as separate workers.
      // Never decide identity by an ambiguous value. Preserve unique Cloud ID only
      // if a single unambiguous candidate exists and has not been assigned already.
      const byCode=new Map(),byCCCD=new Map();
      const pushIndex=(index,key,row)=>{if(!key)return;const arr=index.get(key)||[];arr.push(row);index.set(key,arr);};
      for(const item of existing){
        if(!item.record_id||!item.payload)fail('Cloud có hồ sơ thiếu định danh nội bộ, không thể thay thế.');
        pushIndex(byCCCD,norm(item.payload.cccd),item);
        pushIndex(byCode,norm(item.payload.mnv),item);
      }
      const seenCode=new Set(),seenCCCD=new Set(),seenIds=new Set(),prepared=[];
      let duplicateCode=0,duplicateCCCD=0,ambiguous=0;
      for(const raw of input){
        const name=norm(raw.name),code=norm(raw.mnv),cccd=norm(raw.cccd);
        if(!name)fail('Có dòng không có họ tên, chưa thể tạo hồ sơ độc lập.');
        if(code){if(seenCode.has(code))duplicateCode++;seenCode.add(code);}
        if(cccd){if(seenCCCD.has(cccd))duplicateCCCD++;seenCCCD.add(cccd);}
        const candidates=[...(code?(byCode.get(code)||[]):[]),...(cccd?(byCCCD.get(cccd)||[]):[])];
        const distinct=[...new Map(candidates.map(x=>[x.record_id,x])).values()];
        // Exact matching requires exactly one Cloud row; if identities conflict,
        // allocate a new record rather than silently rewriting another worker.
        const old=distinct.length===1&&!seenIds.has(distinct[0].record_id)?distinct[0]:null;
        if(distinct.length>1||distinct.length===1&&!old)ambiguous++;
        const id=old?.record_id||('w'+crypto.randomUUID().replace(/-/g,''));
        seenIds.add(id);
        const next=old?cloned(old.payload):{id};
        for(const [key,value] of Object.entries(raw)){
          if(['id','tt','tv','_nd','_srcRow'].includes(key)||(key==='day'&&raw._nd))continue;
          if(value!==''&&value!==undefined)next[key]=value;
        }
        next.id=id;
        prepared.push({record_id:id,payload:next});
      }
      const removed=Math.max(0,existing.length-prepared.filter(x=>existing.some(z=>z.record_id===x.record_id)).length);
      // Show actual Cloud and file counts immediately before the destructive RPC.
      const accepted=typeof ask==='function'
        ?await ask('Hồ sơ hiện có: '+existing.length.toLocaleString('vi-VN')+'\nHồ sơ nhập thay thế: '+prepared.length.toLocaleString('vi-VN')+'\nHồ sơ sẽ loại khỏi danh sách: '+removed.toLocaleString('vi-VN')+'\nDữ liệu Cloud sẽ được thay thế; hệ thống vẫn tạo bản sao lưu.',{title:'Xác nhận thay thế toàn bộ',ok:'Thay thế',cls:'r'})
        :false;
      if(!accepted)return;
      button.textContent='Đang thay thế nguyên tử...';
      const {data,error}=await sb.rpc('ktx_worker_replace_atomic_v143',{
        p_expected:existing.map(x=>({record_id:x.record_id,payload:x.payload})),
        p_items:prepared,
        p_source:String(p.file?.name||'Excel').slice(0,180)
      });
      if(error)fail('Supabase từ chối giao dịch v143: '+error.message+' ('+(error.code||'')+'). Kiểm tra sql/34__149_FIX_REPLACE_DELETE_WHERE.sql và quyền Admin.');
      if(!data||Number(data.inserted)!==prepared.length||Number(data.deleted)!==existing.length||!data.backup_id){
        fail('Phản hồi RPC không hợp lệ. Hãy kiểm tra Cloud và bản sao dự phòng trước khi Import lại.');
      }
      // Cloud is the only source of truth. On success refresh UI from Cloud.
      if(typeof IMP_PENDING!=='undefined')IMP_PENDING=null;
      $('impPreviewDlg')?.close();
      try{await syncPullAll();}catch(e){alert('Đã thay thế trên Cloud, nhưng tải lại danh sách thất bại: '+e.message+'\nMã bản sao: '+data.backup_id);return;}
      alert('Thay thế Cloud thành công: '+prepared.length.toLocaleString('vi-VN')+' hồ sơ. Đã lưu bản sao có mã '+data.backup_id+'.');
    }catch(e){alert('KHÔNG THỂ THAY THẾ CLOUD: '+(e.message||e)+'\nDanh sách trên máy chưa được cập nhật nếu giao dịch Cloud thất bại.');}
    finally{button.disabled=false;button.textContent=label;}
  };
})();
