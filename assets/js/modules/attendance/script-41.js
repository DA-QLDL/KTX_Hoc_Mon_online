
(function(){
 function digits(v){return String(v||'').replace(/\D/g,'')}
 function norm(v){return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')}
 function matches(r){return W.filter(w=>{
   const c=digits(r.cccd),m=norm(r.worker_code),wc=digits(w.cccd),wm=norm(w.mnv);
   if(c&&wc&&c!==wc)return false;
   if(m&&wm&&m!==wm)return false;
   const identifier=(c&&wc&&c===wc)||(m&&wm&&m===wm);
   return identifier&&norm(r.name)===norm(w.name);
 })}
 const oldOut=qrRenderOut;
 qrRenderOut=function(L){oldOut(L); const root=document.getElementById('qb');if(!root)return;
  root.querySelectorAll('[data-qo]').forEach(b=>b.remove());
  root.querySelectorAll('.qr-review-out tr').forEach((tr,i)=>{if(!i)return;const r=L[i-1];if(!r)return;
   const td=tr.lastElementChild;if(!td)return;const count=matches(r).length;
   const info=tr.children[8];if(info)info.innerHTML=count===1?'<span class="tag g">Khớp hồ sơ đã xác minh</span>':'<span class="tag r">Chưa xác minh / không khớp — không xóa công nhân</span>';
   const approve=document.createElement('button');approve.className='btn r sm';approve.textContent='Duyệt ra';approve.onclick=()=>qrApproveOut(r.id);td.insertBefore(approve,td.firstChild);
   const edit=document.createElement('button');edit.className='btn s sm';edit.textContent='Sửa';edit.style.margin='0 5px';edit.onclick=()=>window.qr224EditOut(r.id);td.insertBefore(edit,approve.nextSibling);
  });
 };
 window.qr224EditOut=async function(id){if(!can('qrApprove'))return;const r=QRREQ.find(x=>String(x.id)===String(id));if(!r)return;
  const fields=[['name','Họ tên'],['worker_code','Mã nhân viên'],['cccd','CCCD'],['day','Dãy'],['room','Phòng'],['reason','Lý do']];const patch={};
  for(const [k,label] of fields){const v=prompt('Sửa '+label+':',r[k]||'');if(v===null)return;patch[k]=v.trim()}
  if(!patch.name)return alert('Họ tên không được để trống.');const sb=qrSb();if(!sb)return alert('Chưa kết nối Supabase.');
  const {error}=await sb.from('residency_requests').update(patch).eq('id',r.id).eq('status','pending');
  if(error)return alert('Không thể cập nhật yêu cầu: '+error.message+' (kiểm tra quyền UPDATE/RLS).');Object.assign(r,patch);qrPage();
 };
 qrApproveOut=async function(id){if(!can('qrApprove'))return alert('Không có quyền duyệt.');const r=QRREQ.find(x=>String(x.id)===String(id));if(!r)return;
  const found=matches(r),w=found.length===1?found[0]:null;
  let msg=w?('Hồ sơ khớp: '+w.name+' · '+K(w)+' · '+D(w)+' · P.'+R(w)+'\nDuyệt sẽ đưa công nhân này ra khỏi danh sách tổng.'):
  'CẢNH BÁO: Không xác minh được duy nhất một hồ sơ trùng CCCD/Mã NV và họ tên.\nVẫn duyệt ghi nhận đăng ký ra, KHÔNG XÓA bất kỳ công nhân nào trong danh sách tổng.';
  if(!await ask(msg,{title:'Xác nhận duyệt đăng ký ra',ok:w?'Duyệt ra & cập nhật danh sách':'Chỉ ghi nhận, không xóa'}))return;
  try{await qrSetStatus(id,'approved');if(w){delWorkers([w],{reason:r.reason||'Khác',date:ldy(),note:'Duyệt đăng ký ra QR; đối chiếu CCCD/MNV và tên',source:'qr'})}
    else {if(typeof audit81==='function')audit81('QR_OUT_UNMATCHED','Duyệt đăng ký ra không khớp hồ sơ: '+r.name,{workerName:r.name,requestId:r.id,persist:false});else add('QR','Đăng ký ra không khớp hồ sơ: '+r.name);sv();alert('Đã duyệt ghi nhận đăng ký ra. Không xóa công nhân do thông tin chưa khớp.')}
    qrPage();
  }catch(e){alert('Duyệt không thành công: '+(e.message||e))}
 };
})();
