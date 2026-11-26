/* KTX v2219: modal top-layer scanner above worker form dialog. */
(()=>{
'use strict';
if(window.__ktxQrStandalone2217)return;window.__ktxQrStandalone2217=true;
const STYLE=`
#ktxQrStandalone2217{position:fixed!important;inset:0!important;margin:0!important;padding:0!important;border:0!important;max-width:none!important;max-height:none!important;width:100vw!important;height:100dvh!important;z-index:2147483000!important;background:#091524!important;color:#fff!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;font-family:'Be Vietnam Pro',system-ui,sans-serif!important}
#ktxQrStandalone2217:not([open]){display:none!important}
#ktxQrStandalone2217::backdrop{background:rgba(0,0,0,.8)!important}
#ktxQrStandalone2217 .qrs-top{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:12px;padding:max(env(safe-area-inset-top,0px),12px) 18px 12px;background:rgba(8,20,37,.9);z-index:3}
#ktxQrStandalone2217 .qrs-top b{font-size:17px;line-height:1.3;color:#fff}
#ktxQrStandalone2217 .qrs-top small{display:block;font-size:12px;color:#b8c9db;margin-top:3px}
#ktxQrStandalone2217 button{border:1px solid rgba(238,247,255,.35)!important;background:rgba(18,36,57,.82)!important;color:white!important;border-radius:12px!important;min-height:44px!important;padding:9px 15px!important;cursor:pointer!important;font-weight:750!important;font-size:14px!important}
#ktxQrStandalone2217 .qrs-close{font-size:27px!important;line-height:1!important;width:46px;min-width:46px;padding:0!important}
#ktxQrStandalone2217 .qrs-view{flex:1 1 auto;position:relative;min-height:0;overflow:hidden;background:#0d1c31;touch-action:manipulation}
#ktxQrStandalone2217 video{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-height:0!important;object-fit:cover!important;background:#0d1c31!important;border:0!important;border-radius:0!important;transform:none!important;opacity:1!important}
#ktxQrStandalone2217 .qrs-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.25),transparent 24%,transparent 75%,rgba(0,0,0,.3))}
#ktxQrStandalone2217 .qrs-guide{position:absolute;inset:13% 10%;pointer-events:none}
#ktxQrStandalone2217 .qrs-guide i{position:absolute;width:46px;height:46px;border:0 solid #eaf4ff}
#ktxQrStandalone2217 .qrs-guide i:nth-child(1){top:0;left:0;border-top-width:5px;border-left-width:5px;border-radius:17px 0 0 0}
#ktxQrStandalone2217 .qrs-guide i:nth-child(2){top:0;right:0;border-top-width:5px;border-right-width:5px;border-radius:0 17px 0 0}
#ktxQrStandalone2217 .qrs-guide i:nth-child(3){bottom:0;left:0;border-bottom-width:5px;border-left-width:5px;border-radius:0 0 0 17px}
#ktxQrStandalone2217 .qrs-guide i:nth-child(4){bottom:0;right:0;border-bottom-width:5px;border-right-width:5px;border-radius:0 0 17px 0}
#ktxQrStandalone2217 .qrs-aim{position:absolute;left:50%;top:50%;width:54px;height:54px;border:2px solid #c9e8ff;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:.5}
#ktxQrStandalone2217 .qrs-status{flex:0 0 auto;min-height:26px;background:#091524;text-align:center;padding:7px 12px 0;font-size:12px;color:#d7e6f8}
#ktxQrStandalone2217 .qrs-foot{flex:0 0 auto;display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 12px max(env(safe-area-inset-bottom,0px),20px);background:#091524}
#ktxQrStandalone2217 .qrs-focus{background:#2369d8!important;border-color:#407cdf!important}
#ktxQrStandalone2217 .qrs-flash{position:absolute;border:3px solid #ffe082;border-radius:50%;width:76px;height:76px;transform:translate(-50%,-50%);pointer-events:none;opacity:0;transition:opacity .2s}
#ktxQrStandalone2217 .qrs-flash.show{opacity:1}
@media(min-width:800px){#ktxQrStandalone2217 .qrs-view{max-width:1100px;width:100%;margin:auto;border-radius:18px}#ktxQrStandalone2217 .qrs-guide{inset:17% 22%}}
`;
const style=document.createElement('style');style.id='ktxQrStandaloneStyle2217';style.textContent=STYLE;document.head.appendChild(style);
let box=null,video=null,stream=null,track=null,active=false,token=0,scanBusy=false,decoder=null,previousFocus=null,previousOverflow='',previousBodyOverflow='';
const $=(sel,root=document)=>root.querySelector(sel);
function ui(){
 if(box)return;
 box=document.createElement('dialog');box.id='ktxQrStandalone2217';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Camera quét QR độc lập');
 box.innerHTML=`<div class="qrs-top"><div><b>Quét mã QR</b><small>Đưa mã QR vào vùng quét rộng</small></div><button type="button" class="qrs-close" aria-label="Đóng camera">×</button></div><div class="qrs-view"><video autoplay playsinline muted></video><div class="qrs-shade"></div><div class="qrs-guide"><i></i><i></i><i></i><i></i></div><div class="qrs-aim"></div><span class="qrs-flash"></span></div><div role="status" aria-live="polite" class="qrs-status">Đang chuẩn bị camera…</div><div class="qrs-foot"><button type="button" class="qrs-focus">◎ Lấy nét</button><button type="button" class="qrs-stop">Đóng quét</button></div>`;
 document.body.appendChild(box);video=$('video',box);
 box.addEventListener('cancel',e=>{e.preventDefault();close()});$('.qrs-close',box).onclick=close;$('.qrs-stop',box).onclick=close;$('.qrs-focus',box).onclick=()=>focusAt(.5,.5);
 $('.qrs-view',box).addEventListener('click',e=>{if(e.target.closest('button'))return;const r=e.currentTarget.getBoundingClientRect();focusAt((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,e.clientX-r.left,e.clientY-r.top)});
}
function status(s){if(box)$('.qrs-status',box).textContent=s}
function close(){token++;active=false;scanBusy=false;try{video?.pause()}catch(_){}if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;track=null;if(video)video.srcObject=null;if(box?.open)box.close();document.documentElement.style.overflow=previousOverflow;document.body.style.overflow=previousBodyOverflow;try{previousFocus?.focus({preventScroll:true})}catch(_){} }
async function focusAt(x,y,px,py){
 if(!active||!track){status('Camera chưa sẵn sàng.');return}
 x=Math.max(0,Math.min(1,x));y=Math.max(0,Math.min(1,y));
 const cap=typeof track.getCapabilities==='function'?track.getCapabilities():{};
 const focusModes=cap.focusMode||[];
 const adv={};
 if(focusModes.includes('single-shot'))adv.focusMode='single-shot';else if(focusModes.includes('continuous'))adv.focusMode='continuous';
 if(cap.pointsOfInterest)adv.pointsOfInterest=[{x,y}];
 if(!Object.keys(adv).length){status('Camera đang tự lấy nét; thiết bị không hỗ trợ lấy nét thủ công.');return}
 try{await track.applyConstraints({advanced:[adv]});status('Đã yêu cầu lấy nét tại vị trí chọn.');const f=$('.qrs-flash',box),r=$('.qrs-view',box).getBoundingClientRect();f.style.left=(px??(r.width*x))+'px';f.style.top=(py??(r.height*y))+'px';f.classList.add('show');setTimeout(()=>f.classList.remove('show'),550)}
 catch(_){status('Camera đang dùng chế độ lấy nét tự động.')}
}
function cleanDate(v){const s=String(v||'');if(!/^\d{8}$/.test(s))return'';return`${s.slice(0,2)}/${s.slice(2,4)}/${s.slice(4)}`}
function setField(root,id,value){const el=root.querySelector('#'+id)||document.getElementById(id);if(!el||!value)return;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
function consume(mode,raw,context){
 if(mode==='attendance'){
  const input=document.getElementById('at159code');if(!input)return false;
  input.value=raw;input.dispatchEvent(new Event('input',{bubbles:true}));const m=document.getElementById('at159msg');if(m)m.textContent='Đã nhận mã QR. Chọn Điểm danh vào hoặc Điểm danh ra để xác nhận.';return true;
 }
 const p=String(raw).trim().split('|').map(x=>x.trim());
 if(p.length<6||!/^\d{12}$/.test(p[0])){status('Mã QR không đúng định dạng CCCD. Vui lòng quét lại.');return false}
 const gender=/^(nam|male)$/i.test(p[4])?'Nam':/^(nữ|nu|female)$/i.test(p[4])?'Nữ':'';
 if(mode==='worker'){
  const form=context.closest('.v2098-scanner');if(!form?.isConnected)return false;
  setField(document,'f_cccd',p[0]);setField(document,'f_name',p[2]);setField(document,'f_dob',cleanDate(p[3]));setField(document,'f_gt',gender);setField(document,'f_tinh',p[5]);
  const msg=$('.v2098-status',form);if(msg)msg.textContent='Đã điền thông tin CCCD. Kiểm tra lại trước khi Lưu.';return true;
 }
 if(mode==='cccd'){
  const root=context.closest('.cccdscan');const form=root?.closest('form');if(!root||!form)return false;
  const target=form.querySelector('input[name="worker_name"]')||document.getElementById('name');if(target){target.value=p[2];target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}))}
  if(form.id!=='attForm'){setField(document,'cccd',p[0]);setField(document,'dob',cleanDate(p[3]));setField(document,'gender',gender);setField(document,'address',p[5])}
  const msg=$('#cccdResult',root);if(msg)msg.textContent='Đã nhận thông tin. Vui lòng kiểm tra trước khi lưu.';return true;
 }
 return false;
}
async function detectorReady(){
 if('BarcodeDetector' in window){try{if((await BarcodeDetector.getSupportedFormats()).includes('qr_code'))return new BarcodeDetector({formats:['qr_code']})}catch(_){}}
 if(window.jsQR)return'jsqr';
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được thư viện đọc mã QR.'));document.head.appendChild(s)});
 return'jsqr';
}
async function decode(d,canvas){
 if(d!=='jsqr'){const found=await d.detect(video);return found?.[0]?.rawValue||''}
 if(video.readyState<2)return'';
 const scale=Math.min(1,960/Math.max(1,video.videoWidth));canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(video,0,0,canvas.width,canvas.height);const img=ctx.getImageData(0,0,canvas.width,canvas.height);
 return window.jsQR(img.data,img.width,img.height)?.data||'';
}
async function start(mode,context){
 close();ui();previousFocus=context;previousOverflow=document.documentElement.style.overflow;previousBodyOverflow=document.body.style.overflow;
 try{box.showModal()}catch(e){status('Không thể mở màn hình quét: '+(e.message||e));return}document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
 $('.qrs-top b',box).textContent=mode==='attendance'?'Quét QR điểm danh':'Quét QR CCCD';
 status('Đang mở camera sau…');const myToken=++token;active=true;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera yêu cầu kết nối HTTPS và trình duyệt hỗ trợ.');
  const d=await detectorReady();if(myToken!==token)return;const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
  if(myToken!==token){s.getTracks().forEach(t=>t.stop());return}
  decoder=d;stream=s;track=s.getVideoTracks()[0];video.srcObject=s;await video.play();
  if(myToken!==token)return;
  const cap=track.getCapabilities?.()||{};
  if(cap.focusMode?.includes('continuous'))try{await track.applyConstraints({advanced:[{focusMode:'continuous'}]})}catch(_){}
  status('Hướng camera vào QR. Chạm màn hình hoặc nhấn Lấy nét nếu mã bị mờ.');
  const canvas=document.createElement('canvas');let last=0;
  async function frame(time){
   if(myToken!==token||!active||!box?.isConnected)return;
   if(time-last>=95&&!scanBusy&&video.readyState>=2){last=time;scanBusy=true;try{const code=await decode(decoder,canvas);if(myToken!==token)return;if(code&&consume(mode,code,context)){close();return}}catch(e){console.warn('[QR2217]',e)}finally{scanBusy=false}}
   requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 }catch(e){if(myToken!==token)return;status('Không mở được máy quét: '+(e.message||e));if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;track=null;active=false}
}
function findButton(target){return target.closest?.('#at159camera,.v2098-cam,#cccdCamera')||null}
document.addEventListener('click',e=>{
 const btn=findButton(e.target);if(!btn)return;
 let mode=null;
 if(btn.id==='at159camera')mode='attendance';else if(btn.classList.contains('v2098-cam'))mode='worker';else if(btn.id==='cccdCamera')mode='cccd';
 if(!mode)return;
 e.preventDefault();e.stopImmediatePropagation();start(mode,btn);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&box?.open){e.preventDefault();e.stopImmediatePropagation();close()}},true);
window.addEventListener('pagehide',close);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)close()});
})();
