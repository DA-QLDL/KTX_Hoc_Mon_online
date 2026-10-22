
(function(){
  var selected='in';
  var original=qrPage;
  if(typeof original!=='function')return;
  qrPage=function(){
    var r=original.apply(this,arguments);
    var host=document.getElementById('qr');if(!host)return r;
    var legacy=host.querySelector(':scope > .row');if(legacy)legacy.classList.add('qr166-old-tabs');
    var head=document.createElement('div');head.className='qr166-head';
    head.innerHTML='<div><h3>QR code</h3><div class="mut">Đăng ký vào / ra và điểm danh công nhân · Chờ người có quyền duyệt</div></div>';
    host.insertBefore(head,legacy||host.firstChild);
    var switcher=document.createElement('div');switcher.className='qr166-switch';
    var items=[['in','↪','Đăng ký vào','Gửi hồ sơ để duyệt vào KTX'],['out','↩','Đăng ký ra','Gửi hồ sơ để duyệt ra KTX'],['att','✓','Điểm danh','Chờ quản lý duyệt Vào / Ra'],];
    items.forEach(function(it){var b=document.createElement('button');b.type='button';b.dataset.mode=it[0];b.className=selected===it[0]?'active':'';
      var icon=document.createElement('span');icon.className='qr166-ico';icon.textContent=it[1];b.appendChild(icon);
      var txt=document.createElement('span');txt.textContent=it[2];var sm=document.createElement('small');sm.textContent=it[3];txt.appendChild(sm);b.appendChild(txt);
      b.onclick=function(){window.__qrAttReview=false;selected=it[0];QT=selected==='scan'?'scan':'make';qrPage();if(window.matchMedia('(max-width:860px)').matches){requestAnimationFrame(function(){var target=document.querySelector('#qr #qb');if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}})}};switcher.appendChild(b)});
    host.insertBefore(switcher,legacy||host.firstChild);
    var toolbar=document.createElement('div');toolbar.className='qr166-tools';
    function tool(label,fn){var b=document.createElement('button');b.className='btn s sm';b.type='button';b.textContent=label;b.onclick=fn;toolbar.appendChild(b)}
    if(can('qrApprove')){tool('Duyệt đăng ký vào',function(){QT='regin';qrPage()});tool('Duyệt đăng ký ra',function(){QT='regout';qrPage()})}
    if(can('attendance'))tool('Xem yêu cầu điểm danh chờ duyệt',function(){window.__qrAttReview=true;QT='make';selected='att';qrPage();var b=document.getElementById('qr160load');if(b)b.click()});
    host.insertBefore(toolbar,document.getElementById('qb'));
    if(QT==='make'){
      var grid=host.querySelector('#qb > .g2');
      if(grid){grid.classList.add('qr166-single');var cards=Array.from(grid.children);cards.forEach(function(card,i){card.style.display=i===({in:0,out:1,att:2}[selected])?'':'none'})}
    }
    return r;
  };
})();
