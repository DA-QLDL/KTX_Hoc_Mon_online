
/* STEP239 – Footer button, one-click transfer launch */
(function(){
 const formerView=view;
 view=function(w){
   formerView(w);
   const b=document.getElementById('vTransfer239');
   if(!b)return;
   const permitted=!!(w&&can('transfer',w));
   b.hidden=!permitted;
   if(!permitted){b.onclick=null;return}
   b.disabled=false;
   b.onclick=()=>{
     if(b.disabled)return;
     b.disabled=true;
     const d=document.getElementById('vdl');if(d&&d.open)d.close();
     Promise.resolve(openTransfer(w)).catch(e=>{console.error('Transfer open failed',e);alert('Không mở được chuyển phòng: '+(e.message||e))}).finally(()=>{b.disabled=false});
   };
 };
 const go=document.getElementById('transferGo');
 if(go){const previous=go.onclick;let busy=false;go.onclick=async function(...args){
   if(busy)return;
   busy=true;go.disabled=true;
   try{if(typeof previous==='function')return await previous.apply(this,args)}finally{busy=false;if(document.getElementById('transferDlg')?.open){if(typeof transferInfo==='function')transferInfo();else go.disabled=false}}
 };}
})();
