/* v1.0.109: atomic worker Excel MERGE. Override legacy local-first import. */
(()=>{
  const action=document.getElementById('impPrevGo');
  const undo=document.getElementById('undoImport');
  if(undo){undo.onclick=()=>alert('Hoàn tác bằng bản sao trình duyệt đã bị vô hiệu hóa trong chế độ Cloud-Only. Hãy chỉnh sửa dữ liệu trên Supabase hoặc dùng quy trình khôi phục đã được nghiệm thu.');}
  if(!action)return;
  action.onclick=async()=>{
    const p=typeof IMP_PENDING!=='undefined'&&IMP_PENDING;
    if(!p)return;
    if(p.mode==='replace')return alert('Chế độ thay thế/xóa toàn bộ chưa có giao dịch Cloud an toàn. Hãy chọn Nhập bổ sung/cập nhật.');
    if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.ready||SUPA_SYNC.pending||SUPA_SYNC.pulling||SUPA_SYNC.pushing)return alert('Supabase chưa sẵn sàng hoặc còn thay đổi chưa được xác nhận. Hãy tải lại dữ liệu Cloud trước khi import.');
    const sb=syncClient();
    if(!sb)return alert('Không kết nối được Supabase.');
    const rejected=p.analysis.rows.filter(x=>x.v.errors.length);
    if(rejected.length){alert('Có '+rejected.length+' dòng lỗi. Vui lòng sửa file và import lại; không bỏ qua âm thầm các dòng này.');return;}
    const input=p.analysis.rows.map(x=>x.o);
    if(!input.length)return alert('Không có dữ liệu hợp lệ.');
    const seenId=new Set(),seenCode=new Set(),seenCCCD=new Set(),items=[];
    for(const o of input){
      const matching=W.find(w=>(o.cccd&&w.cccd===o.cccd)||(o.mnv&&w.mnv===o.mnv));
      const id=matching?String(matching.id):('w'+Date.now().toString(36)+Math.random().toString(36).slice(2,13));
      const cccd=String(o.cccd||'').trim(),mnv=String(o.mnv||'').trim();
      if(seenId.has(id)||(cccd&&seenCCCD.has(cccd))||(mnv&&seenCode.has(mnv)))return alert('File có hồ sơ trùng mã nhân viên hoặc CCCD. Hãy xử lý trùng trước khi lưu.');
      seenId.add(id);if(cccd)seenCCCD.add(cccd);if(mnv)seenCode.add(mnv);
      const next=matching?JSON.parse(JSON.stringify(matching)):{id};
      for(const [k,v] of Object.entries(o)){
        if(['id','tt','tv','_nd','_srcRow'].includes(k)||(k==='day'&&o._nd))continue;
        if(v!==''&&v!==undefined)next[k]=v;
      }
      next.id=id;
      if(typeof addHistory==='function')addHistory(next,'IMPORT',matching?'Cập nhật từ Import Excel':'Thêm mới từ Import Excel');
      items.push({record_id:id,payload:next,expected:matching?matching:null});
    }
    const BATCH_SIZE=500;
    const totalBatches=Math.ceil(items.length/BATCH_SIZE);
    if(!await ask('Import '+items.length.toLocaleString('vi-VN')+' công nhân từ một file bằng '+totalBatches.toLocaleString('vi-VN')+' lô Supabase. Mỗi lô được lưu nguyên tử; nếu có lỗi, các lô đã xác nhận trước đó vẫn tồn tại. Tiếp tục?',{title:'Xác nhận import lên Cloud',ok:'Lưu Supabase'}))return;
    action.disabled=true;const prev=action.textContent;
    let saved=0,inserted=0,updated=0;
    try{
      for(let i=0;i<items.length;i+=BATCH_SIZE){
        const batch=items.slice(i,i+BATCH_SIZE);
        const batchNo=Math.floor(i/BATCH_SIZE)+1;
        action.textContent='Đang lưu lô '+batchNo+'/'+totalBatches+' ('+saved+'/'+items.length+')...';
        // Each RPC commits atomically. Multiple RPCs are NOT a single transaction.
        const {data,error}=await sb.rpc('ktx_worker_import_atomic_v109',{
          p_items:batch,
          p_source:String(p.file&&p.file.name||'Excel')+' [lô '+batchNo+'/'+totalBatches+']'
        });
        if(error)throw error;
        saved+=batch.length;
        inserted+=Number(data?.inserted||0);
        updated+=Number(data?.updated||0);
      }
      IMP_PENDING=null;document.getElementById('impPreviewDlg')?.close();
      await syncPullAll();
      if(SUPA_SYNC.lastError)alert('Cloud đã xác nhận '+saved.toLocaleString('vi-VN')+' công nhân nhưng ứng dụng chưa tải lại được: '+SUPA_SYNC.lastError+'\nHãy mở lại và kiểm tra Supabase.');
      else alert('Supabase xác nhận hoàn tất '+saved.toLocaleString('vi-VN')+' công nhân ('+inserted.toLocaleString('vi-VN')+' thêm, '+updated.toLocaleString('vi-VN')+' cập nhật) trong '+totalBatches+' lô.');
    }catch(e){
      // Always reload confirmed commits; never let the UI imply a full rollback.
      try{await syncPullAll()}catch(_){}
      alert('Đã lưu thành công '+saved.toLocaleString('vi-VN')+'/'+items.length.toLocaleString('vi-VN')+' công nhân ('+Math.floor(saved/BATCH_SIZE)+' lô hoàn tất).\nLô tiếp theo bị lỗi hoặc chưa được xác nhận: '+(e?.message||e)+'\nNhững lô đã lưu KHÔNG được tự động hoàn tác. Kiểm tra Supabase trước khi nhập lại để tránh trùng.');
    }finally{action.disabled=false;action.textContent=prev;}

  };
})();
