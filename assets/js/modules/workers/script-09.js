
(function(){
  if(typeof window==='undefined') return;
  if(typeof W==='undefined') return;
  let __wSort=window.__workerSortState||{key:'name',dir:'asc'};
  const sortVal=(w,k)=>{
    switch(k){
      case 'name': return w.name||'';
      case 'mnv': return w.mnv||'';
      case 'td': return w.td||'';
      case 'unit': return w.unit||'';
      case 'ktx': return (K(w)||'').replace(/\D/g,'')||K(w)||'';
      case 'day': return (D(w)||'').replace(/\D/g,'')||D(w)||'';
      case 'room': return (R(w)||'').replace(/\D/g,'')||R(w)||'';
      case 'gt': return gtN(w.gt)||'';
      case 'sdt': return w.sdt||'';
      case 'cccd': return w.cccd||'';
      case 'dob': return w.dob||'';
      case 'tinh': return w.tinh||'';
      case 'leader': return w.leader||'';
      case 'lsdt': return w.lsdt||'';
      case 'status': return !R(w)?'0':miss(w)?'1':'2';
      default: return w[k]||'';
    }
  };
  const cmp=(a,b)=>{
    const sa=String(a??'').trim(), sb=String(b??'').trim();
    const na=Number(sa), nb=Number(sb);
    if(sa!=='' && sb!=='' && !Number.isNaN(na) && !Number.isNaN(nb)) return na-nb;
    return sa.localeCompare(sb,'vi',{numeric:true,sensitivity:'base'});
  };
  const arrow=k=>__wSort.key===k?(__wSort.dir==='asc'?'▲':'▼'):'↕';
  const thBtn=(k,label)=>`<button class="thbtn ${__wSort.key===k?'active':''}" data-sort="${k}" title="Sắp xếp theo ${label}">${label}<span class="arr">${arrow(k)}</span></button>`;
  const sortList=list=>list.slice().sort((a,b)=>{const v=cmp(sortVal(a,__wSort.key),sortVal(b,__wSort.key));return __wSort.dir==='asc'?v:-v});

  const oldWl = wl;
  wl=function(){
    if(SO&&!sel.size)SO=false;
    const L=sortList(flt()),pgs=Math.max(1,Math.ceil(L.length/PS));
    pg=Math.min(pg,pgs);
    const S=L.slice((pg-1)*PS,pg*PS);
    const header=`<tr>
      <th><input type="checkbox" id="wa" title="Chọn tất cả dòng đang hiển thị" aria-label="Chọn tất cả dòng đang hiển thị"></th>
      <th>STT</th>
      <th>${thBtn('name','Họ và tên')}</th>
      <th>${thBtn('mnv','Mã NV')}</th>
      <th>${thBtn('td','Tiểu đoàn')}</th>
      <th>${thBtn('unit','Đơn vị')}</th>
      <th>${thBtn('ktx','KTX')}</th>
      <th>${thBtn('day','Dãy')}</th>
      <th>${thBtn('room','Phòng')}</th>
      <th>${thBtn('gt','Giới tính')}</th>
      <th>${thBtn('sdt','SĐT')}</th>
      <th>${thBtn('cccd','CCCD')}</th>
      <th>${thBtn('dob','Ngày sinh')}</th>
      <th>${thBtn('tinh','Địa chỉ')}</th>
      <th>${thBtn('leader','Tiểu đội trưởng')}</th>
      <th>${thBtn('status','Trạng thái tạm trú, tạm vắng')}</th>
    </tr>`;
    $('wl').innerHTML=`<div class="wrap"><table class="cmp2">${header}${S.map((w,i)=>`<tr class="${isNu(w.gt)?'fm':''} wkrow" data-row="${w.id}" tabindex="0" title="Bấm vào dòng để xem chi tiết">
      <td><input type="checkbox" class="ck" data-i="${w.id}" ${sel.has(w.id)?'checked':''}></td>
      <td>${(pg-1)*PS+i+1}</td>
      <td class="wr nm"><b class="lk" data-v="${w.id}" tabindex="0" role="button" title="Xem chi tiết">${esc(w.name)}</b><br>${!R(w)?'<span class="tag a">Chưa phân bổ</span>':miss(w)?'<span class="tag r">Thiếu CCCD/SĐT</span>':'<span class="tag g">Đủ hồ sơ</span>'}</td>
      <td>${w.mnv?esc(w.mnv):'<span class="tag a">Chờ mã</span>'}</td>
      <td class="wr">${esc(w.td||'—')}</td>
      <td class="wr">${esc(w.unit||'—')}</td>
      <td><span class="pl ${kc(K(w))}">${esc(K(w))}</span></td>
      <td><span class="pl dy2">${esc(D(w))}</span></td>
      <td><span class="pl ro">${esc(R(w)||'—')}</span></td>
      <td>${gp(w.gt)}</td>
      <td>${esc(w.sdt)}</td>
      <td>${w.cccd?esc(w.cccd.slice(0,3)+'****'+w.cccd.slice(-3)):''}</td>
      <td>${vn(w.dob)||'—'}</td>
      <td class="wr ad">${esc(w.tinh||'—')}</td>
      <td class="wr">${esc(w.leader||'—')}</td>
      <td class="wr">${stTag(w)}</td>
    </tr>`).join('')}</table></div>
    <div class="row" style="margin-top:10px;justify-content:space-between"><span class="mut">Tổng: ${L.length.toLocaleString('vi-VN')} bản ghi</span><span class="row"><button class="btn s" id="pp" ${pg<2?'disabled':''}>Trước</button><span>${pg}/${pgs}</span><button class="btn s" id="pgn" ${pg>=pgs?'disabled':''}>Sau</button></span></div>`;

    $('pp').onclick=()=>{pg--;wl()};
    $('pgn').onclick=()=>{pg++;wl()};
    document.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{const k=b.dataset.sort;__wSort=(__wSort.key===k?{key:k,dir:__wSort.dir==='asc'?'desc':'asc'}:{key:k,dir:'asc'});window.__workerSortState=__wSort;pg=1;wl()});
    document.querySelectorAll('.ck').forEach(c=>c.onchange=()=>{c.checked?sel.add(c.dataset.i):sel.delete(c.dataset.i);selUi();if(SO&&!c.checked){wl();return}$('wa').checked=S.every(w=>sel.has(w.id))});
    $('wa').checked=S.length>0&&S.every(w=>sel.has(w.id));
    $('wa').onchange=e=>{S.forEach(w=>e.target.checked?sel.add(w.id):sel.delete(w.id));document.querySelectorAll('.ck').forEach(c=>c.checked=e.target.checked);selUi();if(SO&&!e.target.checked)wl()};
    $('so').checked=SO;selUi();
    const openRow=id=>view(W.find(w=>w.id==id));
    document.querySelectorAll('[data-row]').forEach(r=>{
      r.onclick=e=>{if(e.target.closest('input,button,a,label,select,textarea,[data-v],[data-e]'))return;const selTxt=window.getSelection?String(window.getSelection()):'';if(selTxt&&selTxt.trim())return;openRow(r.dataset.row)};
      r.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('input')){e.preventDefault();openRow(r.dataset.row)}};
    });
    document.querySelectorAll('[data-v]').forEach(b=>{b.onclick=()=>openRow(b.dataset.v);b.onkeydown=e=>{if(e.key==='Enter')b.click()}});
    document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>edit(W.find(w=>w.id==b.dataset.e)));
  };
})();
