
(function(){
  if(typeof window==='undefined'||typeof tl!=='function'||typeof tfl!=='function')return;
  if(!TS.sort)TS.sort={key:'name',dir:'asc'};
  const vdate=w=>TS.tab==='tv'?(w.tv&&(w.tv.reg||w.tv.from)||''):(w.tt||'');
  const sv=(w,k)=>{const a=addrXT(w);switch(k){
    case 'mnv':return w.mnv||'';case 'name':return w.name||'';case 'gt':return gtN(w.gt)||'';
    case 'dob':return w.dob||'';case 'sdt':return w.sdt||'';case 'xa':return a[0]||'';
    case 'tinh':return a[1]||'';case 'cccd':return w.cccd||'';case 'date':return vdate(w)||'';default:return '';
  }};
  const cmp=(a,b)=>{a=String(a??'').trim();b=String(b??'').trim();const na=Number(a),nb=Number(b);if(a&&b&&!Number.isNaN(na)&&!Number.isNaN(nb))return na-nb;return a.localeCompare(b,'vi',{numeric:true,sensitivity:'base'})};
  const srt=L=>L.slice().sort((a,b)=>{const n=cmp(sv(a,TS.sort.key),sv(b,TS.sort.key));return TS.sort.dir==='asc'?n:-n});
  const ar=k=>TS.sort.key===k?(TS.sort.dir==='asc'?'▲':'▼'):'↕';
  const hb=(k,l)=>`<button class="t6-sort ${TS.sort.key===k?'on':''}" data-t6-sort="${k}" title="Sắp xếp theo ${l}">${l}<span class="sa">${ar(k)}</span></button>`;
  tl=function(){
    const raw=tfl(),L=srt(raw),sh=L.slice(0,200),tab=TS.tab;
    $('tl').innerHTML=`<div class="wrap"><table class="cmp"><tr>
      <th><input type="checkbox" id="ta" aria-label="Chọn tất cả"></th><th>STT</th>
      <th>${hb('mnv','MNV')}</th><th>${hb('name','Họ và tên')}</th><th>${hb('gt','Giới tính')}</th>
      <th>${hb('dob','Năm sinh')}</th><th>${hb('sdt','Số điện thoại')}</th><th>${hb('xa','Xã')}</th>
      <th>${hb('tinh','Tỉnh/TP')}</th><th>${hb('cccd','Số CCCD')}</th><th>${hb('date','Ngày đăng ký')}</th>
    </tr>${sh.map((w,i)=>{const [xa,tinh]=addrXT(w),rawD=vdate(w),d=String(rawD||'').slice(0,10),tip=tab==='tv'&&w.tv?` title="${esc('Tạm vắng từ '+vn(w.tv.from)+(w.tv.to?' đến '+vn(w.tv.to):'')+(w.tv.why?': '+w.tv.why:''))}"`:'';return `<tr class="${isNu(w.gt)?'fm':''}"><td><input type="checkbox" class="tk" data-i="${w.id}" ${TS.sel.has(w.id)?'checked':''}></td><td>${i+1}</td><td>${esc(w.mnv)}</td><td><b>${esc(w.name)}</b></td><td>${gp(w.gt)}</td><td>${vn(w.dob)}</td><td>${esc(w.sdt)}</td><td>${esc(xa)}</td><td>${esc(tinh)}</td><td>${esc(w.cccd)}</td><td${tip}>${d?`<span class="pl ro">${vn(d)}</span>`:'—'}</td></tr>`}).join('')||'<tr><td colspan="11" class="mut">Không có dữ liệu. Hãy import danh sách công nhân trước.</td></tr>'}</table></div><div class="mut" style="margin-top:8px">${L.length.toLocaleString('vi-VN')} kết quả${L.length>200?' (hiển thị 200 dòng đầu, hãy lọc để thu hẹp)':''}</div>`;
    const un=()=>{$('tn').textContent=TS.sel.size?'Đã chọn '+TS.sel.size+' người':''};un();
    document.querySelectorAll('#tl [data-t6-sort]').forEach(b=>b.onclick=()=>{const k=b.dataset.t6Sort;TS.sort=TS.sort.key===k?{key:k,dir:TS.sort.dir==='asc'?'desc':'asc'}:{key:k,dir:'asc'};tl()});
    document.querySelectorAll('.tk').forEach(c=>c.onchange=()=>{c.checked?TS.sel.add(c.dataset.i):TS.sel.delete(c.dataset.i);un()});
    $('ta').checked=L.length>0&&L.every(w=>TS.sel.has(w.id));
    $('ta').onchange=e=>{L.forEach(w=>e.target.checked?TS.sel.add(w.id):TS.sel.delete(w.id));document.querySelectorAll('.tk').forEach(c=>c.checked=e.target.checked);un()};
  };
})();

/* Step 56: Room drawer interaction */
(function(){
  const bindRoomDrawer=()=>{
    const d=document.getElementById('rdl');
    if(!d||d.dataset.step56Bound)return;
    d.dataset.step56Bound='1';
    const close=()=>{if(d.open) d.close();};
    const x=document.getElementById('rx'); if(x) x.onclick=close;
    d.addEventListener('click',e=>{
      if(e.target!==d) return;
      const r=d.getBoundingClientRect();
      const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
      if(!inside) close();
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindRoomDrawer); else bindRoomDrawer();
})();
