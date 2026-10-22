
(function(){
window.KTX_MEAL_BRIDGE={get client(){return typeof SUPA_SYNC!=='undefined'?SUPA_SYNC.client:null},get session(){return typeof SUPA_SYNC!=='undefined'?SUPA_SYNC.session:null},get ready(){return typeof SUPA_SYNC!=='undefined'&&SUPA_SYNC.ready},get role(){return typeof ME!=='undefined'?ME.role:null},get vendors(){return typeof NCCS!=='undefined'?NCCS:[]},get parseWeek(){return typeof menuParse==='function'?menuParse:null}};
const ov=document.getElementById('mealMonitor182'),frame=document.getElementById('mealMonitor182Frame');
window.openMealMonitor=function(options){if(!ov)return;ov.classList.add('open');if(!frame.getAttribute('src'))frame.src=frame.dataset.url;if(options&&options.edit){const invoke=()=>{try{frame.contentWindow.openMealMenuEditor&&frame.contentWindow.openMealMenuEditor()}catch(e){console.warn('Menu editor:',e)}};if(frame.contentDocument&&frame.contentDocument.readyState==='complete')setTimeout(invoke,400);else frame.addEventListener('load',()=>setTimeout(invoke,700),{once:true})}};
function close(){ov.classList.remove('open')}
document.getElementById('mealMonitor182Back').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('open'))close()});
})();
