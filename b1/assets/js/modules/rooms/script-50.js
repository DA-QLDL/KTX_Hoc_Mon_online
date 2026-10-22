
(function(){
  function updateRoomFilter139(){
    const root=document.getElementById('home');if(!root)return;
    const mode=typeof ROOM_FILTER!=='undefined'?ROOM_FILTER:'all';
    root.querySelectorAll('.room-filterbar [data-rf]').forEach(b=>{const active=b.dataset.rf===mode;b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});
    let visible=0;
    root.querySelectorAll('.room-cell[data-k][data-d][data-r]').forEach(c=>{
      const k=c.dataset.k,d=c.dataset.d,r=c.dataset.r;
      const count=W.reduce((n,w)=>n+(K(w)===k&&D(w)===d&&String(R(w))===String(r)?1:0),0);
      const spare=Math.max(0,CAP-count);
      const show=mode==='all'||mode==='free5'&&spare>=5||mode==='low'&&spare>=1&&spare<=3||mode==='full'&&count===CAP||mode==='over'&&count>CAP;
      c.classList.toggle('ktx-room-filter-hidden',!show);
      if(show)visible++;
    });
    root.querySelectorAll('.room-day').forEach(d=>d.classList.toggle('ktx-room-filter-empty',!d.querySelector('.room-cell:not(.ktx-room-filter-hidden)')));
    root.querySelectorAll('details.kd').forEach(d=>d.classList.toggle('ktx-room-filter-empty',!d.querySelector('.room-day:not(.ktx-room-filter-empty)')));
    let msg=root.querySelector('.room-filter-empty-message');
    if(!visible&&root.querySelector('.room-filterbar')){
      if(!msg){msg=document.createElement('div');msg.className='room-filter-empty-message';root.querySelector('.roommap-card')?.appendChild(msg)}
      msg.textContent='Không có phòng phù hợp với bộ lọc đã chọn. Vui lòng chọn “Tất cả” hoặc bộ lọc khác.';
    }else if(msg)msg.remove();
  }
  // Giữ nguyên trình xử lý ban đầu, chỉ nâng cấp cách ẩn và trạng thái rỗng.
  window.applyRoomFilter73=updateRoomFilter139;
})();
