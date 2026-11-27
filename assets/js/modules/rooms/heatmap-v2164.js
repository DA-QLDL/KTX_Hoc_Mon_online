/* V2178: Reliable Heatmap filters. Preserve v2177 analytics location and room styling. */
(function(){'use strict';
  const byId=id=>document.getElementById(id);
  const clean=v=>String(v??'');
  function setText(el,value){el.textContent=clean(value);return el}
  const statusFor=b=>{const [n,c]=[Number(b.dataset.current||0),Number(b.dataset.capacity||20)];return n>c?'over':n===c?'full':n>=c*.9?'near':n===0?'empty':'available'};
  let pop=null,active=null,workerIndex=new Map(),state={ktx:'all',day:'all',gender:'all',status:'all',search:'',layout:'grid'};
  function hide(){if(pop)pop.hidden=true;active=null}
  function safeWorkers(){try{return typeof vis==='function'?vis():Array.isArray(W)?W:[]}catch(_){return []}}
  function key(k,d,r){return JSON.stringify([clean(k),clean(d),clean(r)])}
  function mount(){
    const map=document.querySelector('#home .roommap-card');if(!map)return;
    hide(); if(pop){pop.remove();pop=null}
    workerIndex=new Map();for(const w of safeWorkers()){
      const k=key(K(w),D(w),R(w));if(!workerIndex.has(k))workerIndex.set(k,[]);workerIndex.get(k).push(w);
    }
    map.classList.add('heat164','heat165');
    const home=byId('home'); if(home&&map.parentElement!==home) home.insertBefore(map,home.firstChild);
    home?.classList.add('heat165-home');
    const old=map.querySelector('.roommap-head');if(old)old.hidden=true;
    const counts={free:0,full:0,over:0,near:0};
    const cards=[...map.querySelectorAll('button.room-cell')];
    for(const b of cards){
      const list=workerIndex.get(key(b.dataset.k,b.dataset.d,b.dataset.r))||[];
      const count=list.length,capacity=Number(typeof CAP!=='undefined'?CAP:20)||20;
      const sex=b.classList.contains('mix')||!!b.querySelector('.sex.mix')?'mix':b.classList.contains('f')||!!b.querySelector('.sex.f')?'female':'male';
      Object.assign(b.dataset,{current:String(count),capacity:String(capacity),gender:sex});b.setAttribute('aria-label',`Phòng ${b.dataset.r}, ${b.dataset.d}, ${sex==='female'?'Phòng Nữ':sex==='mix'?'Phòng Hỗn hợp':'Phòng Nam'}, ${count}/${capacity} người`);
      const t=statusFor(b);b.dataset.heatStatus=t;
      if(t==='full')counts.full++;if(t==='over')counts.over++;if(t!=='full'&&t!=='over')counts.free++;if(t==='near')counts.near++;
      b.removeAttribute('title');
    }
    const allDays=[...new Set(cards.map(b=>b.dataset.d))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
    const allKtx=[...new Set(cards.map(b=>b.dataset.k))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
    let dashboard=map.querySelector('.heat164-dashboard');if(dashboard)dashboard.remove();
    dashboard=document.createElement('section');dashboard.className='heat164-dashboard';
    dashboard.innerHTML=`<div class="heat164-heading"><div><div class="heat164-breadcrumb">KÝ TÚC XÁ &nbsp; › &nbsp; Sơ đồ phòng trực quan</div><h2>Sơ Đồ Phòng Trực Quan (Heatmap)</h2><p>Thống kê công suất theo dãy · Tra cứu phòng · Xem nhanh công nhân đang ở</p></div></div>
      <div class="heat164-kpis">
        <div class="heat164-kpi heat2259-workers"><span class="heat-kpi-icon"><svg class="heat2259-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2"/><path d="M16 5.5a3 3 0 0 1 0 5.7M17 14a5 5 0 0 1 4 5v1"/></svg></span><div><small>Tổng công nhân</small><strong data-stat="workers"></strong></div></div>
        <div class="heat164-kpi heat2259-rate"><span class="heat-kpi-icon"><svg class="heat2259-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9h-9Z"/><path d="M12 3v9h9A9 9 0 0 0 12 3Z"/></svg></span><div><small>Tỷ lệ sử dụng</small><strong data-stat="rate"></strong></div></div>
        <div class="heat164-kpi heat2259-rooms"><span class="heat-kpi-icon"><svg class="heat2259-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h3M8 11h3M8 15h3M15 7h1M15 11h1M15 15h1"/></svg></span><div><small>Số phòng trên sơ đồ</small><strong data-stat="rooms"></strong></div></div>
        <div class="heat164-kpi heat2259-free"><span class="heat-kpi-icon"><svg class="heat2259-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="m8.5 14.5 2 2 4.5-5"/></svg></span><div><small>Phòng còn chỗ</small><strong data-stat="free"></strong></div></div>
        <div class="heat164-kpi heat2259-ktx1"><span class="heat-kpi-icon"><svg class="heat2259-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v15"/><path d="M16 11h3a2 2 0 0 1 2 2v8M2 21h20M7 8h2M12 8h1M7 12h2M12 12h1M7 16h2M12 16h1"/></svg></span><div><small>KTX 1 còn</small><strong data-stat="freeKtx1"></strong></div></div>
        <div class="heat164-kpi heat2259-ktx2"><span class="heat-kpi-icon"><svg class="heat2259-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13M2 21h20M9 21v-6h6v6M8 10h1M15 10h1"/><path d="M12 6v5"/></svg></span><div><small>KTX 2 còn</small><strong data-stat="freeKtx2"></strong></div></div>
      </div>
      <div class="heat164-toolbar">
        <label>KTX<select data-hf="ktx"></select></label>
        <label>Dãy<select data-hf="day"></select></label>
        <fieldset><legend>Giới tính phòng</legend><div class="heat164-pills" data-hf-pills="gender"><button type="button" data-hv="all">◉ Tất cả</button><button type="button" data-hv="male"><span class="heat2189-gender-icon" aria-hidden="true">♂</span>Phòng Nam</button><button type="button" data-hv="female"><span class="heat2189-gender-icon" aria-hidden="true">♀</span>Phòng Nữ</button><button type="button" data-hv="mix"><span class="heat2189-gender-icon" aria-hidden="true">⚥</span>Hỗn hợp</button></div></fieldset>
        <label>Trạng thái<select data-hf="status"><option value="all">Tất cả trạng thái</option><option value="available">Còn chỗ</option><option value="near">Gần đầy 90–99%</option><option value="full">Đầy 100%</option><option value="over">Quá tải</option><option value="empty">Chưa có người</option></select></label>
        <label class="heat164-search">Tìm phòng<input data-hf="search" type="search" autocomplete="off" placeholder="P.9, KTX 1, Dãy 3..."></label>
        <div class="heat164-layout" role="group" aria-label="Kiểu hiển thị"><button type="button" data-view="grid" title="Dạng thẻ">▦</button><button type="button" data-view="list" title="Dạng danh sách">☷</button></div>
      </div>
      <div class="heat164-hint">Di chuyển chuột vào phòng để xem nhanh danh sách công nhân; nhấp vào phòng để xem chi tiết.</div>
      <div class="heat164-found" role="status" aria-live="polite"></div>`;
    map.querySelector('.heat2172-empty')?.remove();map.insertBefore(dashboard,map.firstChild);const noResult=document.createElement('div');noResult.className='heat2172-empty';noResult.textContent='Không tìm thấy phòng phù hợp. Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.';dashboard.after(noResult);
    /* Hide redundant KTX grouping strip only when the diagram has one KTX. */
    map.classList.toggle('heat167-single-ktx',allKtx.length===1);
    const oldLegend=map.querySelector('.heat165-legend');if(oldLegend)oldLegend.remove();
    const legend=document.createElement('div');legend.className='heat165-legend';legend.innerHTML='<strong>ⓘ &nbsp; Chú giải</strong><div class="heat168-keygroup heat168-genderkey"><small>Loại phòng (biểu tượng)</small><div><span>♂ Phòng Nam</span><span>♀ Phòng Nữ</span><span>⚥ Phòng Hỗn hợp</span></div></div><div class="heat168-keygroup heat168-statuskey"><small>Trạng thái phòng (màu sắc)</small><div><span><i class="heat165-dot free"></i> Còn trống<br>0 – 10%</span><span><i class="heat165-dot used"></i> Đang sử dụng<br>11 – 89%</span><span><i class="heat165-dot near"></i> Gần đầy<br>90 – 99%</span><span><i class="heat165-dot full"></i> Đầy 100%<br>= 100%</span><span><i class="heat165-dot over"></i> Quá tải<br>&gt; 100%</span></div></div>';map.appendChild(legend);
    const num=n=>Number(n||0).toLocaleString('vi-VN');
    const assigned=cards.reduce((s,b)=>s+Number(b.dataset.current),0);
    const capacity=cards.reduce((s,b)=>s+Number(b.dataset.capacity),0);
    /* v2195: Available beds = configured DESIGN capacity - actual residents.
       KTX_HEADCOUNT_SETTINGS is occupancy (actual workers), NOT bed capacity.
       A headcount used as capacity was the reason both cards showed 0. */
    const config=window.KTX_GLOBAL_CONFIG||{};
    const designCapacity={'KTX 1':1160,'KTX 2':1380,'KTX 3':980};
    const remainingByKtx=new Map();
    const workersByKtx=new Map();
    for(const w of safeWorkers()){
      const k=clean(K(w)).trim().replace(/\s+/g,' ').toLocaleUpperCase('vi-VN');
      workersByKtx.set(k,(workersByKtx.get(k)||0)+1);
    }
    const validCapacity=value=>{
      if(value===null||value===undefined||value==='')return null;
      const n=Number(value);
      return Number.isSafeInteger(n)&&n>0?n:null;
    };
    const capacityFor=k=>{
      const explicit=k==='KTX 1'?config.ktx1Total:k==='KTX 2'?config.ktx2Total:
        (Array.isArray(config.sites)?config.sites.find(s=>('KTX '+s.number)===k)?.count:null);
      return validCapacity(explicit)??designCapacity[k]??null;
    };
    for(const k of ['KTX 1','KTX 2']){
      const max=capacityFor(k);
      remainingByKtx.set(k,max===null?null:Math.max(0,max-(workersByKtx.get(k)||0)));
    }
    const remainingText=k=>remainingByKtx.get(k)===null?'—':num(remainingByKtx.get(k))+' chỗ';
    const totals={workers:num(assigned),rate:capacity?(assigned/capacity*100).toLocaleString('vi-VN',{maximumFractionDigits:1})+'%':'—',rooms:num(cards.length),free:num(counts.free),freeKtx1:remainingText('KTX 1'),freeKtx2:remainingText('KTX 2')};
    for(const [k,v] of Object.entries(totals))setText(dashboard.querySelector('[data-stat="'+k+'"]'),v);
    /* Prevent previous versions' KPI sizing rules from splitting the count. */
    for(const tile of dashboard.querySelectorAll('.heat164-kpi')){
      tile.style.setProperty('grid-template-columns','40px minmax(0,1fr)','important');
      tile.style.setProperty('height','60px','important');
      tile.style.setProperty('min-height','60px','important');
      tile.style.setProperty('max-height','60px','important');
      tile.style.setProperty('background','#fff','important');
      const content=tile.querySelector(':scope > div');
      if(content)content.style.setProperty('min-width','0','important');
      const value=tile.querySelector('strong[data-stat]');
      if(value){
        value.style.setProperty('font-size','18px','important');
        value.style.setProperty('line-height','1.2','important');
        value.style.setProperty('white-space','nowrap','important');
        value.style.setProperty('word-break','normal','important');
        value.style.setProperty('overflow-wrap','normal','important');
        value.style.setProperty('display','block','important');
      }
    }
    function options(select,entries,allLabel){select.replaceChildren(new Option(allLabel,'all'),...entries.map(x=>new Option(x,x)))}
    options(dashboard.querySelector('[data-hf="ktx"]'),allKtx,'Tất cả KTX');
    options(dashboard.querySelector('[data-hf="day"]'),allDays,'Tất cả dãy');
    if(!allKtx.includes(state.ktx))state.ktx='all';if(!allDays.includes(state.day))state.day='all';
    for(const type of ['ktx','day','status'])dashboard.querySelector('[data-hf="'+type+'"]').value=state[type];
    dashboard.querySelector('[data-hf="search"]').value=state.search;
    function update(){
      /* v2200: Only show the vacancy KPI for the KTX being viewed.
         This uses the actual KTX selection, not the room search/status filters. */
      const chosenKtx=state.ktx!=='all'?state.ktx:(allKtx.length===1?allKtx[0]:'all');
      const kpiGrid=dashboard.querySelector('.heat164-kpis');
      if(kpiGrid){
        const single=chosenKtx==='KTX 1'||chosenKtx==='KTX 2';
        kpiGrid.classList.toggle('heat2200-single-ktx',single);
        for(const [name,site] of [['freeKtx1','KTX 1'],['freeKtx2','KTX 2']]){
          const value=dashboard.querySelector('[data-stat="'+name+'"]');
          const tile=value?.closest('.heat164-kpi');
          if(!tile)continue;
          const visible=chosenKtx==='all'||chosenKtx===site;
          tile.hidden=!visible;
          tile.setAttribute('aria-hidden',String(!visible));
          if(visible)tile.style.removeProperty('display');
          else tile.style.setProperty('display','none','important');
        }
      }
      const search=state.search.trim().toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g,'');let shown=0;
      for(const b of cards){
        const matchStatus=state.status==='all'||state.status==='available'&&Number(b.dataset.current)<Number(b.dataset.capacity)||state.status===b.dataset.heatStatus;
        const searchText=[b.dataset.k,b.dataset.d,'P.'+b.dataset.r,'Phòng '+b.dataset.r,b.dataset.r].join(' ').toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const ok=(state.ktx==='all'||state.ktx===b.dataset.k)&&(state.day==='all'||state.day===b.dataset.d)&&(state.gender==='all'||state.gender===b.dataset.gender)&&matchStatus&&(!search||searchText.includes(search));
        b.classList.toggle('heat164-hidden',!ok);
        b.hidden=!ok;
        /* Explicit important inline display wins over legacy display:flex!important. */
        if(ok)b.style.removeProperty('display');
        else b.style.setProperty('display','none','important');
        b.setAttribute('aria-hidden',String(!ok));
        if(ok)shown++;
      }
      map.querySelectorAll('.room-day').forEach(d=>{
        const hidden=!d.querySelector('.room-cell:not(.heat164-hidden)');
        d.classList.toggle('heat164-hidden',hidden);d.hidden=hidden;
        if(hidden)d.style.setProperty('display','none','important');else d.style.removeProperty('display');
      });
      map.querySelectorAll('details.kd').forEach(d=>{
        const hidden=!d.querySelector('.room-day:not(.heat164-hidden)');
        d.classList.toggle('heat164-hidden',hidden);d.hidden=hidden;
        if(hidden)d.style.setProperty('display','none','important');else d.style.removeProperty('display');
      });
      map.classList.toggle('heat164-listview',state.layout==='list');map.dataset.activeGender=state.gender;
      map.classList.toggle('heat170-one-ktx',new Set(cards.filter(b=>!b.classList.contains('heat164-hidden')).map(b=>b.dataset.k)).size===1);
      dashboard.querySelectorAll('[data-hf-pills="gender"] button').forEach(b=>{const on=b.dataset.hv===state.gender;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
      dashboard.querySelectorAll('[data-view]').forEach(b=>{const on=b.dataset.view===state.layout;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
      dashboard.querySelector('.heat164-found').textContent='Hiển thị '+shown+'/'+cards.length+' phòng phù hợp với bộ lọc';map.classList.toggle('heat2172-no-results',shown===0);
      hide();
    }
    function syncKtxDayOptions(){
      const daySelect=dashboard.querySelector('[data-hf="day"]');
      const valid=[...new Set(cards.filter(b=>state.ktx==='all'||b.dataset.k===state.ktx).map(b=>b.dataset.d))]
        .sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
      if(state.day!=='all'&&!valid.includes(state.day))state.day='all';
      options(daySelect,valid,'Tất cả dãy');daySelect.value=state.day;
    }
    dashboard.addEventListener('input',e=>{const b=e.target.closest('[data-hf]');if(b){state[b.dataset.hf]=b.value;if(b.dataset.hf==='ktx')syncKtxDayOptions();update()}});
    dashboard.addEventListener('change',e=>{const b=e.target.closest('[data-hf]');if(b){state[b.dataset.hf]=b.value;if(b.dataset.hf==='ktx')syncKtxDayOptions();update()}});
    dashboard.addEventListener('click',e=>{const b=e.target.closest('button[data-hv],button[data-view]');if(!b)return;if('hv' in b.dataset)state.gender=b.dataset.hv;if('view' in b.dataset)state.layout=b.dataset.view;update()});
    if(!pop){pop=document.createElement('div');pop.className='heat164-preview';pop.hidden=true;pop.setAttribute('role','tooltip');document.body.appendChild(pop)}
    function show(button){if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
      const list=workerIndex.get(key(button.dataset.k,button.dataset.d,button.dataset.r))||[];
      if(typeof can==='function'&&!can('view')){hide();return}
      pop.replaceChildren();
      const top=document.createElement('div');top.className='heat164-preview-top';const title=document.createElement('strong');setText(title,'Phòng '+button.dataset.r+' · '+button.dataset.d);const type=document.createElement('span');setText(type,button.dataset.gender==='female'?'♀ Phòng Nữ':button.dataset.gender==='mix'?'⚥ Hỗn hợp':'♂ Phòng Nam');top.append(title,type);pop.append(top);
      const summary=document.createElement('div');summary.className='heat164-preview-summary';setText(summary,button.dataset.k+' · '+list.length+'/'+button.dataset.capacity+' người ('+Math.round(list.length/Number(button.dataset.capacity)*100)+'%) · Còn '+Math.max(0,Number(button.dataset.capacity)-list.length)+' chỗ');pop.append(summary);
      const rows=document.createElement('div');rows.className='heat164-preview-rows';
      for(const w of list.slice(0,5)){if(typeof can==='function'&&!can('view',w))continue;
        const row=document.createElement('div');row.className='heat164-preview-row';const name=document.createElement('b');setText(name,w.name||'Chưa có họ tên');const gender=document.createElement('span');setText(gender,clean(w.gt)||'—');const id=document.createElement('small');setText(id,w.mnv?'#'+w.mnv:'Chưa có mã');row.append(name,gender,id);rows.append(row);
      }
      if(!rows.children.length){const x=document.createElement('p');setText(x,'Không có hồ sơ được phép xem.');rows.append(x)}
      pop.append(rows);const footer=document.createElement('div');footer.className='heat164-preview-footer';setText(footer,list.length>5?'Xem thêm '+(list.length-5)+' công nhân · Nhấp để mở chi tiết':'Nhấp vào phòng để mở chi tiết');pop.append(footer);
      pop.hidden=false;position(button);
    }
    function position(button){if(!pop||pop.hidden)return;const r=button.getBoundingClientRect(),width=pop.offsetWidth||300,height=pop.offsetHeight||250;let left=r.right+10;if(left+width>innerWidth-12)left=r.left-width-10;left=Math.max(8,left);let top=r.top-12;if(top+height>innerHeight-8)top=innerHeight-height-8;top=Math.max(8,top);pop.style.left=left+'px';pop.style.top=top+'px'}
    map.addEventListener('pointerover',e=>{const b=e.target.closest('.room-cell');if(!b||b===active||b.classList.contains('heat164-hidden'))return;active=b;show(b)});
    map.addEventListener('pointerout',e=>{const b=e.target.closest('.room-cell');if(b&&b===active&&!b.contains(e.relatedTarget))hide()});
    map.addEventListener('click',hide,true);
    syncKtxDayOptions();
    update();
    /* v2174: Restore the original live gender/room-purpose and contractor
       analytics from home(). Do not clone or recalculate their data. The core
       home() renderer updates the original panels on each data refresh. */
    const analytics=home?.querySelector('.home-analytics');
    if(analytics){
      analytics.classList.remove('v2063-home-hidden');
      analytics.removeAttribute('hidden');
      analytics.style.removeProperty('display');
      analytics.classList.add('heat2174-restored-analytics');
      /* v2177: Move the existing analytics above the filter toolbar, after the six KPIs. */
      const filterToolbar=dashboard.querySelector('.heat164-toolbar');
      if(filterToolbar)dashboard.insertBefore(analytics,filterToolbar);
      for(const panel of analytics.querySelectorAll('.card')){
        panel.classList.remove('v2063-home-hidden');
        panel.removeAttribute('hidden');
      }
    }
  }
  window.ktxHeatmap164=mount;
  window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
})();
