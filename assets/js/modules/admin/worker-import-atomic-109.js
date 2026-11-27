/* KTX v2262 — Import Excel: có đối chiếu danh tính, cập nhật có kiểm soát.
 * Chế độ REPLACE tiếp tục dùng ktx137ReplaceWorkers (không sửa).
 * Chế độ UPDATE/ADD dùng một yêu cầu UPSERT Cloud (thao tác nguyên tử phía PostgREST).
 * Không bao giờ ghi đè theo họ tên đơn thuần; trường định danh rỗng không tính trùng.
 */
(()=>{'use strict';
  const btn=document.getElementById('impPrevGo');
  if(!btn)return;
  const norm=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi');
  const digits=v=>String(v??'').replace(/\D/g,'');
  const value=(obj,key)=>{
    const raw=obj?.[key];
    if(key==='cccd')return digits(raw).length===12?digits(raw):'';
    if(key==='sdt')return digits(raw).length>=9?digits(raw):'';
    if(key==='dob'){
      const s=String(raw??'').trim(),m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/),iso=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
      if(iso)return `${iso[1]}-${iso[2].padStart(2,'0')}-${iso[3].padStart(2,'0')}`;
      return norm(s);
    }
    return norm(raw);
  };
  const KEYS=['name','sdt','cccd','dob','mnv'];
  const identityFields=(o,w)=>KEYS.filter(k=>value(o,k)&&value(w,k)&&value(o,k)===value(w,k));
  const newId=()=> 'w'+(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):Date.now().toString(36)+Math.random().toString(36).slice(2));
  const copy=o=>JSON.parse(JSON.stringify(o||{}));
  const clean=o=>{
    const next={};
    Object.entries(o||{}).forEach(([k,v])=>{
      if(['id','tt','tv','_nd','_srcRow','history','created_at','updated_at'].includes(k)||(k==='day'&&o._nd))return;
      if(v===undefined||v===null||typeof v==='string'&&!v.trim())return;
      next[k]=v;
    });
    return next;
  };
  const err=reason=>({status:'error',reason});
  function planImport(rows,existing){
    const indexes={cccd:new Map(),mnv:new Map(),combo:new Map()};
    const addTo=(map,key,item)=>{if(!key)return;const a=map.get(key)||[];a.push(item);map.set(key,a)};
    const combo=o=>{const n=value(o,'name'),d=value(o,'dob'),p=value(o,'sdt');return n&&d&&p?n+'|'+d+'|'+p:''};
    for(const item of existing){
      const w=item.payload||item;
      const key=item.record_id||w.id;
      if(!key)continue;
      const record={id:String(key),payload:w};
      addTo(indexes.cccd,value(w,'cccd'),record);
      addTo(indexes.mnv,value(w,'mnv'),record);
      addTo(indexes.combo,combo(w),record);
    }
    const seenFile=new Set(), items=[], result=[];
    const stats={add:0,update:0,duplicate:0,error:0,valid:0,skip:0,conflict:0,warn:0};
    for(const o of rows){
      const v={errors:[],warnings:[]};
      if(!value(o,'name'))v.errors.push('Thiếu họ tên');
      const c=value(o,'cccd'),m=value(o,'mnv'),k=combo(o);
      if(!c&&!m&&!k){
        // Vẫn cho thêm mới nếu có họ tên và không có tên tương tự trong Cloud.
        // Không thể kết luận cùng người chỉ từ họ tên.
        const names=existing.filter(z=>value(z.payload||z,'name')===value(o,'name'));
        if(names.length)v.errors.push('Chỉ trùng họ tên; thiếu CCCD/mã NV/tổ hợp họ tên–ngày sinh–SĐT để xác minh');
      }
      const cand=new Map();
      for(const [index,key] of [[indexes.cccd,c],[indexes.mnv,m],[indexes.combo,k]]){
        for(const item of key?(index.get(key)||[]):[])cand.set(item.id,item);
      }
      let status='new',match=null,reason='';
      if(v.errors.length){status='error';reason=v.errors.join('; ')}
      else if(cand.size>1){status='error';reason='Định danh khớp nhiều hồ sơ khác nhau; cần kiểm tra thủ công'}
      else if(cand.size===1){
        match=[...cand.values()][0];
        const same=identityFields(o,match.payload);
        if(seenFile.has(match.id)){
          status='error';reason='Nhiều dòng Excel cùng trỏ tới một hồ sơ; chỉ xét dòng đầu tiên';
        }else if(same.length>=4){
          status='duplicate';reason=`Đã trùng ${same.length}/5 thông tin định danh: ${same.join(', ')}`;
        }else{
          const incoming=clean(o),old=match.payload;
          const changed=Object.entries(incoming).some(([key,v])=>norm(v)!==norm(old[key]));
          if(!changed){status='duplicate';reason='Thông tin có trong Excel không thay đổi';}
          else status='update';
        }
        seenFile.add(match.id);
      }else{
        const seenKeys=[c?'cccd:'+c:'',m?'mnv:'+m:'',k?'combo:'+k:''].filter(Boolean);
        if(seenKeys.some(x=>seenFile.has(x))){status='error';reason='Thông tin định danh bị lặp trong file Excel';}
        else{for(const x of seenKeys)seenFile.add(x);status='new'}
      }
      if(status==='new'){
        const id=newId(),payload={...clean(o),id};
        if(!value(payload,'name'))payload.name='Chưa cập nhật họ tên';
        if(typeof addHistory==='function')addHistory(payload,'IMPORT','Thêm mới từ Excel');
        items.push({record_id:id,payload});stats.add++;
      }else if(status==='update'){
        const payload={...copy(match.payload),...clean(o),id:match.id};
        if(typeof addHistory==='function')addHistory(payload,'IMPORT','Cập nhật thông tin từ Excel');
        items.push({record_id:match.id,payload});stats.update++;
      }else if(status==='duplicate'){stats.duplicate++;stats.skip++;}
      else{stats.error++;stats.conflict++;v.errors.push(reason);}
      result.push({o,v,match:match?.payload||null,status,reason});
    }
    stats.valid=stats.add+stats.update;
    stats.rows=result;
    stats.items=items;
    return stats;
  }
  window.KTXImportMatch2262={planImport,identityFields};
  // W là danh sách hiện tại của ứng dụng; khi lưu sẽ đối chiếu lại trực tiếp với Cloud.
  if(typeof analyzeImport73==='function'){
    analyzeImport73=function(out){
      const local=Array.isArray(W)?W:[];
      const plan=planImport(out,local);
      const {items,...stats}=plan;
      return stats;
    };
  }
  btn.onclick=async()=>{
    const p=typeof IMP_PENDING!=='undefined'&&IMP_PENDING;
    if(!p)return;
    if(p.mode==='replace'){
      if(typeof window.ktx137ReplaceWorkers==='function')return window.ktx137ReplaceWorkers(p,btn);
      return alert('Chức năng thay thế toàn bộ chưa sẵn sàng.');
    }
    if(typeof SUPA_SYNC==='undefined'||!SUPA_SYNC.ready||!SUPA_SYNC.session)return alert('Chưa đăng nhập hoặc chưa kết nối Supabase.');
    if(SUPA_SYNC.pushing||SUPA_SYNC.pulling||SUPA_SYNC.applying)return alert('Cloud đang đồng bộ. Vui lòng thử lại sau.');
    const sb=typeof syncClient==='function'?syncClient():null;
    if(!sb||typeof syncFetchAll!=='function')return alert('Không thể đọc dữ liệu Cloud để đối chiếu.');
    const source=Array.isArray(p.out)?p.out:(p.analysis?.rows||[]).map(x=>x.o);
    if(!source.length)return alert('Không có hồ sơ trong file Excel.');
    const text=btn.textContent,sub=document.getElementById('impPrevSub'),subOld=sub?.textContent||'';
    btn.disabled=true;
    try{
      btn.textContent='Đang đối chiếu Cloud...';
      const existing=await syncFetchAll('ktx_workers','record_id,payload');
      if(!Array.isArray(existing))throw Error('Cloud không trả về danh sách đầy đủ.');
      const plan=planImport(source,existing);
      // Không đoán lại danh tính khi dữ liệu Cloud thay đổi sau bước xem trước.
      const before=p.analysis||{};
      if(before.add!==plan.add||before.update!==plan.update||Number(before.duplicate||0)!==plan.duplicate||Number(before.error||0)!==plan.error){
        if(typeof syncPullAll==='function')await syncPullAll();
        alert('Danh sách Cloud đã thay đổi hoặc dữ liệu trên máy chưa đồng bộ. Vui lòng chọn lại file Excel để xem trước số liệu mới. Chưa có hồ sơ nào được ghi.');
        return;
      }
      if(!plan.items.length){
        alert(`Không có hồ sơ cần ghi. Bỏ qua ${plan.skip.toLocaleString('vi-VN')} hồ sơ trùng; ${plan.conflict} hồ sơ cần kiểm tra.`);
        return;
      }
      btn.textContent=`Đang lưu ${plan.items.length.toLocaleString('vi-VN')} hồ sơ...`;
      if(sub)sub.textContent='Đang cập nhật và thêm mới trên Cloud...';
      // PostgREST thực hiện toàn bộ upsert trong một truy vấn, giữ nguyên record_id cũ.
      const payload=plan.items.map(x=>({...x,updated_at:new Date().toISOString()}));
      const {error}=await sb.from('ktx_workers').upsert(payload,{onConflict:'record_id'});
      if(error)throw Error(error.message||String(error));
      if(typeof IMP_PENDING!=='undefined')IMP_PENDING=null;
      document.getElementById('impPreviewDlg')?.close();
      if(typeof syncPullAll==='function'){
        try{await syncPullAll()}catch(e){alert('Cloud đã nhận cập nhật nhưng tải mới danh sách chưa thành công. Hãy tải lại ứng dụng trước khi thao tác tiếp.');return}
      }
      alert(`Import thành công: ${plan.update} cập nhật, ${plan.add} thêm mới, ${plan.skip} bỏ qua trùng, ${plan.conflict} cần kiểm tra.`);
    }catch(e){
      alert('Không thực hiện được Import Cloud: '+String(e?.message||e)+'\nVui lòng kiểm tra danh sách Cloud trước khi thử lại.');
    }finally{btn.disabled=false;btn.textContent=text;if(sub)sub.textContent=subOld;}
  };
})();
