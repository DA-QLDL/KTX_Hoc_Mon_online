/* v2221: Independent CCCD QR scanner for registration IN and OUT.
   No form auto-submission. QR is decoded locally. */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const F=$('#form');if(!F || !$('#send'))return;
const style=document.createElement('style');style.textContent=`
.ktx2221-source{grid-column:1/-1;}
.ktx2221-message{font-size:12px;color:#345b84;line-height:1.5;min-height:0}.ktx2221-message.error{color:#ba2843}
#ktx2221Scanner{border:0;padding:0;margin:auto;max-width:none;max-height:none;width:100vw;height:100dvh;background:#061326;color:white;overflow:hidden}
#ktx2221Scanner::backdrop{background:#061326}
#ktx2221Scanner .scan-shell{position:relative;width:100%;height:100%;display:flex;flex-direction:column;isolation:isolate}
#ktx2221Scanner video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#07192e}
#ktx2221Scanner .scan-shade{position:absolute;inset:0;background:linear-gradient(180deg,#081323aa 0%,transparent 22%,transparent 72%,#081323d9 100%);pointer-events:none}
#ktx2221Scanner .scan-head{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 14px) 18px 10px}
#ktx2221Scanner .scan-head b{font-size:17px;color:white}
#ktx2221Scanner .scan-guide{position:absolute;inset:0;pointer-events:none;z-index:1}
#ktx2221Scanner .scan-guide span{position:absolute;width:50px;height:50px;border:0 solid white}
#ktx2221Scanner .scan-guide span:nth-child(1){top:27%;left:9%;border-top-width:6px;border-left-width:6px;border-radius:17px 0 0 0}
#ktx2221Scanner .scan-guide span:nth-child(2){top:27%;right:9%;border-top-width:6px;border-right-width:6px;border-radius:0 17px 0 0}
#ktx2221Scanner .scan-guide span:nth-child(3){bottom:27%;left:9%;border-bottom-width:6px;border-left-width:6px;border-radius:0 0 0 17px}
#ktx2221Scanner .scan-guide span:nth-child(4){bottom:27%;right:9%;border-bottom-width:6px;border-right-width:6px;border-radius:0 0 17px 0}
#ktx2221Scanner .scan-footer{position:relative;z-index:2;margin-top:auto;padding:14px 18px calc(env(safe-area-inset-bottom,0px) + 22px);text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}
#ktx2221Scanner .scan-status{color:#fff;font-size:13px;min-height:18px;text-shadow:0 1px 3px #111}
#ktx2221Scanner .scan-focus-ring{position:absolute;left:50%;top:50%;width:74px;height:74px;z-index:3;border:3px solid #9ce7ff;border-radius:50%;box-shadow:0 0 0 1px rgba(7,24,55,.38),0 0 19px rgba(79,196,255,.42);transform:translate(-50%,-50%) scale(1.18);opacity:0;pointer-events:none;transition:opacity .14s ease,transform .32s ease}
#ktx2221Scanner .scan-focus-ring.is-visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
#ktx2221Scanner .scan-focus-ring:after{content:'';position:absolute;left:50%;top:50%;width:7px;height:7px;background:#9ce7ff;border-radius:50%;transform:translate(-50%,-50%)}
@media(max-width:640px){#ktx2221Scanner .scan-guide span:nth-child(-n+2){top:30%}#ktx2221Scanner .scan-guide span:nth-child(n+3){bottom:30%}}
`;document.head.appendChild(style);
const box=document.createElement('section');box.className='ktx2221-source';box.innerHTML=`<div class="ktxqr-caption">Quét CCCD</div><div class="ktx2221-actions ktxqr-actions"><button id="ktx2221Open" class="ktxqr-icon ktxqr-scan" type="button" aria-label="Quét QR CCCD" title="Quét QR CCCD"></button><button id="ktx2221Pick" class="ktxqr-icon ktxqr-photo" type="button" aria-label="Chọn ảnh QR" title="Chọn ảnh QR"></button><input id="ktx2221File" class="ktxqr-file" type="file" accept="image/*" hidden></div><div class="ktx2221-message" role="status" aria-live="polite"></div>`;
F.prepend(box);
const message=$('.ktx2221-message',box);
const note=(t,bad=false)=>{message.textContent=t;message.classList.toggle('error',bad)};
const modal=document.createElement('dialog');modal.id='ktx2221Scanner';modal.setAttribute('aria-label','Quét CCCD toàn màn hình');modal.innerHTML=`<div class="scan-shell"><video playsinline muted></video><div class="scan-shade"></div><div class="scan-focus-ring" aria-hidden="true"></div><header class="scan-head"><b>Quét QR CCCD</b></header><div class="scan-guide" aria-hidden="true"><span></span><span></span><span></span><span></span></div><footer class="scan-footer"><div class="scan-status">Chạm để lấy nét · Vuốt xuống để thoát</div></footer></div>`;
document.body.appendChild(modal);
const video=$('video',modal),status=$('.scan-status',modal),focusRing=$('.scan-focus-ring',modal);
let stream=null,active=false,epoch=0,backend=null,detector=null,scanning=false;
const setField=(id,val)=>{const el=document.getElementById(id);if(!el||!val)return;el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
function parseQR(raw){
 const p=String(raw||'').trim().split('|').map(s=>s.trim());
 if(p.length<6 || !/^\d{12}$/.test(p[0]))throw new Error('Đây không phải mã QR CCCD hợp lệ.');
 let dob='';if(/^\d{8}$/.test(p[3])){const day=p[3].slice(0,2),mon=p[3].slice(2,4),year=p[3].slice(4),date=new Date(`${year}-${mon}-${day}T00:00:00`);if(date.getFullYear()==+year && date.getMonth()==+mon-1 && date.getDate()==+day)dob=`${day}/${mon}/${year}`;}
 return {cccd:p[0],name:p[2],dob,gender:/^(nam|male)$/i.test(p[4])?'Nam':/^(nữ|nu|female)$/i.test(p[4])?'Nữ':'',address:p[5]};
}
function accept(code){let data;try{data=parseQR(code)}catch(e){note(e.message,true);status.textContent=e.message;return false;}
 setField('name',data.name);setField('cccd',data.cccd);setField('dob',data.dob);setField('gender',data.gender);setField('address',data.address);
 note('Đã đọc CCCD. Vui lòng kiểm tra thông tin, hoàn thiện biểu mẫu rồi mới gửi đăng ký.');close();return true;
}
async function getBackend(){
 if('BarcodeDetector' in window){try{const f=await BarcodeDetector.getSupportedFormats();if(f.includes('qr_code'))return 'native'}catch(_){}}
 if(window.jsQR)return 'jsqr';
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được thư viện quét QR.'));document.head.appendChild(s)});
 return 'jsqr';
}
async function readCanvas(canvas){
 if(backend==='native'){detector ||= new BarcodeDetector({formats:['qr_code']});const codes=await detector.detect(canvas);return codes[0]?.rawValue||'';}
 const ctx=canvas.getContext('2d',{willReadFrequently:true});const data=ctx.getImageData(0,0,canvas.width,canvas.height);return window.jsQR(data.data,data.width,data.height)?.data||'';
}
function close(){clearTimeout(focusRingTimer);focusRing.classList.remove('is-visible');active=false;epoch++;if(stream){stream.getTracks().forEach(track=>track.stop());stream=null}video.srcObject=null;if(modal.open)modal.close();}
async function focus(){const track=stream?.getVideoTracks()[0];if(!track){status.textContent='Camera chưa sẵn sàng';return}try{const caps=track.getCapabilities?.()||{};
 if(caps.focusMode?.includes('continuous'))await track.applyConstraints({advanced:[{focusMode:'continuous'}]});
 else if(caps.focusMode?.includes('single-shot'))await track.applyConstraints({advanced:[{focusMode:'single-shot'}]});
 else{status.textContent='Camera này đang sử dụng lấy nét tự động';return}
 status.textContent='Đã yêu cầu camera lấy nét';}catch(_){status.textContent='Thiết bị không hỗ trợ điều chỉnh lấy nét thủ công';}}
// Immediate visual focus marker at tap location, regardless of hardware focus support.
let focusRingTimer=0;
function showFocusRing(x,y){
 const rect=modal.getBoundingClientRect();
 const px=Math.max(37,Math.min(rect.width-37,x-rect.left));
 const py=Math.max(37,Math.min(rect.height-37,y-rect.top));
 focusRing.style.left=px+'px';focusRing.style.top=py+'px';
 focusRing.classList.remove('is-visible');
 void focusRing.offsetWidth;
 focusRing.classList.add('is-visible');
 clearTimeout(focusRingTimer);
 focusRingTimer=setTimeout(()=>focusRing.classList.remove('is-visible'),850);
}
// Use pointer events to cover mobile touch and desktop mouse.
// The swipe-down gesture is separately handled by touchend below.
let pointerOrigin=null;
modal.addEventListener('pointerdown',e=>{pointerOrigin={id:e.pointerId,x:e.clientX,y:e.clientY}},{passive:true});
modal.addEventListener('pointerup',e=>{
 if(!active || (e.pointerType==='mouse'&&e.button!==0))return;
 const origin=pointerOrigin;pointerOrigin=null;
 // Avoid a false focus ring during swipe-to-close.
 if(origin && origin.id===e.pointerId && Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>24)return;
 showFocusRing(e.clientX,e.clientY);
 focus();
});
modal.addEventListener('pointercancel',()=>{pointerOrigin=null});
// One-finger downward swipe exits; horizontal moves and taps do not close.
let swipeStart=null;
modal.addEventListener('touchstart',e=>{
 if(e.touches.length!==1){swipeStart=null;return}
 swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()};
},{passive:true});
modal.addEventListener('touchend',e=>{
 if(!swipeStart||!e.changedTouches.length)return;
 const dx=e.changedTouches[0].clientX-swipeStart.x;
 const dy=e.changedTouches[0].clientY-swipeStart.y;
 const elapsed=Date.now()-swipeStart.t;
 swipeStart=null;
 if(dy>=90&&dy>Math.abs(dx)*1.4&&elapsed<1500)close();
},{passive:true});
modal.addEventListener('touchcancel',()=>{swipeStart=null},{passive:true});
// Keep Escape / native Back as a fallback when gestures are unavailable.
modal.addEventListener('cancel',e=>{e.preventDefault();close()});
modal.addEventListener('close',()=>{if(active)close()});
window.addEventListener('pagehide',close);
async function open(){if(active)return;
 try{
  backend=await getBackend();
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Trình duyệt cần HTTPS và quyền truy cập camera.');
  modal.showModal();status.textContent='Đang mở camera…';
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
  video.srcObject=stream;await video.play();active=true;
  status.textContent='Chạm để lấy nét · Vuốt xuống để thoát';
  focus();const token=++epoch,canvas=document.createElement('canvas');
  async function loop(){if(!active||token!==epoch)return;
   if(scanning){requestAnimationFrame(loop);return}
   scanning=true;
   try{if(video.readyState>=2){const factor=Math.min(1,1280/video.videoWidth);canvas.width=Math.max(1,Math.round(video.videoWidth*factor));canvas.height=Math.max(1,Math.round(video.videoHeight*factor));canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);const text=await readCanvas(canvas);if(text&&accept(text))return;}}
   catch(_){/* malformed frame or decoder failure: try next */}
   finally{scanning=false}
   if(active&&token===epoch)requestAnimationFrame(loop);
  }requestAnimationFrame(loop);
 }catch(e){close();note('Không mở được camera: '+(e.message||e),true)}
}
$('#ktx2221Open',box).onclick=open;
$('#ktx2221Pick',box).onclick=()=>$('#ktx2221File',box).click();
$('#ktx2221File',box).onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{backend=await getBackend();const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const code=await readCanvas(canvas);if(!code)throw new Error('Không tìm thấy mã QR trong ảnh.');accept(code)}catch(err){note(err.message||String(err),true)}finally{e.target.value=''}};
})();
