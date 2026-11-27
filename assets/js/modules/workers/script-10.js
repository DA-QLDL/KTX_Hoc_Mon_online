
(function(){
  if(typeof window==='undefined' || typeof wl!=='function' || typeof view!=='function') return;

  // Sau mỗi lần render bảng, bổ sung double click để sửa nhanh.
  const __wlStep5=wl;
  wl=function(){
    __wlStep5();
    document.querySelectorAll('#work [data-row]').forEach(r=>{
      r.title='Bấm 1 lần để xem chi tiết · Bấm đúp để sửa nhanh';
      r.ondblclick=e=>{
        if(e.target.closest('input,button,a,label,select,textarea')) return;
        const w=W.find(x=>x.id==r.dataset.row);
        if(!w) return;
        if(can('editw',w)) edit(w); else view(w);
      };
    });
  };

  // Bổ sung menu thao tác nhanh khi mở thông tin từ một dòng.
  const __viewStep5=view;
  view=function(w){
    __viewStep5(w);
    if(!w) return;
    let q=document.getElementById('vquick');
    if(!q){
      q=document.createElement('div');
      q.id='vquick';
      const body=document.getElementById('vb');
      if(body&&body.parentNode) body.parentNode.insertBefore(q,body);
    }
    q.classList.remove('hide');
    const selected=sel.has(w.id);
    q.innerHTML=`
      <button class="btn s" id="vq_edit"><svg class="i"><use href="#i-edit"/></svg>Sửa nhanh</button>
      <button class="btn s" id="vq_sel"><svg class="i"><use href="#i-check"/></svg>${selected?'Bỏ chọn dòng':'Chọn dòng'}</button>
      <button class="btn s" id="vq_copy"><svg class="i"><use href="#i-copy"/></svg>Sao chép thông tin</button>
      <button class="btn r" id="vq_out"><svg class="i"><use href="#i-out"/></svg>Chuyển ra khỏi danh sách</button>
      <span class="qhint">Mẹo: bấm đúp trực tiếp vào dòng để sửa nhanh</span>`;

    const e=document.getElementById('vq_edit');
    if(e){e.classList.toggle('hide',!can('editw',w));e.onclick=()=>{document.getElementById('vdl').close();edit(w)}}
    const ss=document.getElementById('vq_sel');
    if(ss)ss.onclick=()=>{sel.has(w.id)?sel.delete(w.id):sel.add(w.id);selUi();ss.innerHTML=`<svg class="i"><use href="#i-check"/></svg>${sel.has(w.id)?'Bỏ chọn dòng':'Chọn dòng'}`};
    const cp=document.getElementById('vq_copy');
    if(cp)cp.onclick=async()=>{
      const text=[w.name,w.mnv?`Mã NV: ${w.mnv}`:'',w.cccd?`CCCD: ${w.cccd}`:'',w.sdt?`SĐT: ${w.sdt}`:'',`${K(w)} · ${D(w)} · Phòng ${R(w)||'—'}`].filter(Boolean).join('\n');
      try{await navigator.clipboard.writeText(text);alert('Đã sao chép thông tin công nhân.')}catch(x){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Đã sao chép thông tin công nhân.')}
    };
    const out=document.getElementById('vq_out');
    if(out){out.classList.toggle('hide',!can('del'));out.onclick=async()=>{const inf=await askLeave([w]);if(!inf)return;document.getElementById('vdl').close();delWorkers([w],inf)}}
  };
})();
