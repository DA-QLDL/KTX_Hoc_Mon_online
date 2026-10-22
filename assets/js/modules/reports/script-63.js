
(function(){
 function init(){
  let el=document.getElementById('ledger167');
  if(!el){el=document.createElement('section');el.id='ledger167';el.className='hide';el.innerHTML='<div class="ledger167-head"><button type="button" class="btn s" id="ledger167Back">← Quay lại Tiện ích</button><strong>Sổ theo dõi quân số tăng/giảm</strong></div><iframe id="ledger167Frame" title="Sổ theo dõi công nhân tăng giảm" src="./so-tang-giam.html"></iframe>';document.querySelector('main').appendChild(el);el.querySelector('#ledger167Back').onclick=()=>window.go('utilhub')}
  if(typeof T!=='undefined'&&!T.ledger167) T.ledger167=['Sổ theo dõi công nhân tăng/giảm','Ghi nhận quân số theo ngày, xuất Excel'];
  if(typeof GN!=='undefined')GN.ledger167='Tiện ích';
 }
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.data?.type!=='ktx-ledger-get-snapshot'||e.source!==document.getElementById('ledger167Frame')?.contentWindow)return;
  const rows=Array.isArray(W)?W:[];
  const male=rows.filter(w=>isNam(w.gt)).length, female=rows.filter(w=>isNu(w.gt)).length;
  const vinAlpha=rows.filter(w=>/vin\s*alpha/i.test(String(w.unit||''))).length;
  const staff=(typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.account?.display_name)||document.getElementById('aubName')?.textContent||'';
  e.source.postMessage({type:'ktx-ledger-snapshot',data:{total:rows.length,male,female,vinAlpha,updater:staff.trim()}},e.origin);
 });
 const prevGo=window.go;
 window.go=function(p){init();if(p==='ledger167'){
   prevGo.call(this,'utilhub');document.getElementById('utilhub')?.classList.add('hide');
   document.getElementById('ledger167')?.classList.remove('hide');
   if(typeof page!=='undefined')page='ledger167';
   document.getElementById('ttl').textContent='Sổ theo dõi công nhân tăng/giảm';
   document.getElementById('sub').textContent='Theo dõi quân số công nhân cơ hữu tại KTX Hóc Môn';
   window.scrollTo(0,0);return;
  }
  document.getElementById('ledger167')?.classList.add('hide');
  return prevGo.apply(this,arguments);
 };
})();
