/* V2.0.98 – Shared worker editor: cascading catalogs, Vietnamese manual DOB, local QR of CCCD. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const tidy=v=>String(v??'').trim();
const digits=v=>tidy(v).replace(/\D/g,'');
const html=v=>tidy(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parseDob(v){let s=tidy(v);if(!s)return'';
 if(/^\d{4}-\d{2}-\d{2}$/.test(s)){const [y,m,d]=s.split('-').map(Number);return valid(y,m,d)?s:''}
 let d,m,y;const parts=s.split(/[\/.\-]/).filter(Boolean);
 if(parts.length===3){[d,m,y]=parts.map(Number);if(parts[2].length===2)y+=(y<=29?2000:1900);else if(parts[2].length!==4)return''}
 else{const n=digits(s);if(![6,8].includes(n.length))return'';d=+n.slice(0,2);m=+n.slice(2,4);y=+n.slice(4);if(n.length===6)y+=(y<=29?2000:1900);}
 return valid(y,m,d)?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:'';
}
function valid(y,m,d){if(!Number.isInteger(y)||y<1900||y>new Date().getFullYear()||m<1||m>12||d<1||d>31)return false;const dt=new Date(y,m-1,d);return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d&&dt<=new Date()}
const displayDob=v=>{const iso=parseDob(v);return iso?iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4):tidy(v)};
function workers(){try{return Array.isArray(W)?W:[]}catch(_){return[]}}
function uniq(a){return [...new Set(a.map(tidy).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true,sensitivity:'base'}))}
function selected(id){return $(id)?.value||''}
function createSelect(id,items){const el=$(id);if(!el)return;const current=el.value;const sel=document.createElement('select');sel.id=id;sel.name=el.name||id;sel.className=el.className;sel.setAttribute('aria-label',el.closest('label')?.firstChild?.textContent?.trim()||id);
 const fixed=id==='f_td'||id==='f_unit';const all=fixed?uniq(items):uniq([...items,current]);
 // Historical values are preserved when editing but cannot be newly selected for another record.
 const legacy=fixed&&current&&!all.includes(current);
 sel.innerHTML='<option value="">— Chọn —</option>'+all.map(v=>`<option value="${html(v)}">${html(v)}</option>`).join('')+(legacy?`<option value="${html(current)}" data-legacy="true">${html(current)} (giá trị hồ sơ cũ)</option>`:'');
 el.replaceWith(sel);sel.value=(all.includes(current)||legacy)?current:'';
}
function fill(id,values){const el=$(id);if(!el||el.tagName!=='SELECT')return;const v=el.value;el.innerHTML='<option value="">— Chọn —</option>'+uniq([...values,v]).map(t=>`<option value="${html(t)}">${html(t)}</option>`).join('');el.value=v}
function attachWorkerForm(root){if(!root||!$('f_name'))return;
 const w=workers();const ktx=uniq([...w.map(x=>x.ktx),...'123'.split('').map(x=>'KTX '+x)]);
 createSelect('f_ktx',ktx);createSelect('f_day',w.map(x=>x.day));createSelect('f_room',w.map(x=>x.room));
 createSelect('f_td',['06.4','08','ME','Vinalpha','Trắc đạc','Ép cọc','DVVS','Khác']);createSelect('f_unit',['ME','XD','Vinalpha','Trắc đạc','DVVS','Ép cọc','Khác']);
 const updateDays=()=>{const k=selected('f_ktx');fill('f_day',w.filter(x=>!k||tidy(x.ktx)===k).map(x=>x.day))};
 const updateRooms=()=>{
  const k=selected('f_ktx'),d=selected('f_day');
  const found=w.filter(x=>(!k||tidy(x.ktx)===k)&&(!d||tidy(x.day)===d)).map(x=>tidy(x.room));
  // Restore missing numbers (e.g. room 12) only within this selected row's
  // observed numeric room range; never invent an entire new row of rooms.
  const nums=found.filter(x=>/^\d+$/.test(x)).map(Number).filter(x=>x>=1&&x<=100);
  const max=nums.length?Math.max(...nums):0;
  const existing=tidy($('f_room')?.value);
  const holes=d&&max?Array.from({length:max},(_,i)=>String(i+1)):[];
  fill('f_room',[...found,...holes,existing]);
};
 // During editing, changing one of KTX / Dãy / Phòng must not clear the other two.
 // Keep previous location fields as selectable values even if not in the refreshed catalog.
 // A new worker still receives cascading resets so the new allocation is explicit.
 const editing=$('dt')?.textContent?.trim()==='Sửa công nhân';
 updateDays();updateRooms();
 $('f_ktx').addEventListener('change',()=>{
  if(!editing){if($('f_day'))$('f_day').value='';if($('f_room'))$('f_room').value='';}
  updateDays();updateRooms();
 });
 $('f_day').addEventListener('change',()=>{
  if(!editing&&$('f_room'))$('f_room').value='';
  updateRooms();
 });
 // Empty catalogs get safe existing values only; no fabricated KTX rooms or units.

 const dob=$('f_dob');if(dob){dob.type='text';dob.inputMode='numeric';dob.maxLength=10;dob.autocomplete='bday';dob.placeholder='DD/MM/YYYY (ví dụ 24/06/1986)';dob.value=displayDob(dob.value);
  const dobHelp=document.createElement('small');dobHelp.className='v2098-dob-help';dobHelp.id='v2098-dob-help';dobHelp.setAttribute('role','status');dobHelp.setAttribute('aria-live','polite');dob.insertAdjacentElement('afterend',dobHelp);
  const checkDob=()=>{const raw=tidy(dob.value);const okay=!raw||!!parseDob(raw);dob.setCustomValidity(okay?'':'Ngày sinh không hợp lệ. Vui lòng nhập đúng dd/mm/yyyy.');dob.setAttribute('aria-invalid',String(!okay));dobHelp.textContent=okay?'':'Ngày sinh không hợp lệ (dd/mm/yyyy).';return okay};
  dob.addEventListener('input',()=>{const n=digits(dob.value);if(n.length===8){const x=parseDob(n);if(x)dob.value=displayDob(x)}checkDob()});
  dob.addEventListener('blur',()=>{const x=parseDob(dob.value);if(x)dob.value=displayDob(x);checkDob()});
 }
 addScanner(root);
}
function addScanner(root){if(root.querySelector('.v2098-scanner'))return;const el=document.createElement('section');el.className='v2098-scanner';el.innerHTML='<div class="v2098-scanner-row"><b>Quét CCCD</b><div class="ktxqr-actions"><button type="button" class="v2098-cam ktxqr-icon ktxqr-scan" aria-label="Quét QR CCCD" title="Quét QR CCCD"></button><button type="button" class="v2098-file-btn ktxqr-icon ktxqr-photo" aria-label="Chọn ảnh QR" title="Chọn ảnh QR"></button><input class="ktxqr-file" type="file" accept="image/*" hidden></div></div><video playsinline muted hidden></video><div class="v2098-status" role="status" aria-live="polite"></div>';root.prepend(el);
 const msg=el.querySelector('.v2098-status'),video=el.querySelector('video');let stream=null,active=false,backend='';
 const status=(v,error=false)=>{msg.textContent=v;msg.style.color=error?'#c03049':'#526b8b'};
 const stop=()=>{active=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}video.srcObject=null;video.hidden=true};
 const dlg=$('dlg');dlg?.addEventListener('close',stop,{once:true});
 async function decoder(){if('BarcodeDetector' in window){try{if((await BarcodeDetector.getSupportedFormats()).includes('qr_code'))return'native'}catch(_){}}
 if(!window.jsQR)await new Promise((ok,fail)=>{const t=document.createElement('script');t.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';t.onload=ok;t.onerror=()=>fail(new Error('Không tải được thư viện QR'));document.head.appendChild(t)});return'jsqr'}
 async function decode(canvas){if(backend==='native'){const codes=await new BarcodeDetector({formats:['qr_code']}).detect(canvas);return codes[0]?.rawValue||''}
 const c=canvas.getContext('2d',{willReadFrequently:true}),p=c.getImageData(0,0,canvas.width,canvas.height);return window.jsQR(p.data,p.width,p.height)?.data||''}
 function accept(raw){const p=tidy(raw).split('|').map(tidy);if(p.length<6||!/^[0-9]{12}$/.test(p[0]))throw new Error('Mã QR không đúng định dạng CCCD được hỗ trợ');
 const birth=p[3],date=/^\d{8}$/.test(birth)?parseDob(`${birth.slice(0,2)}/${birth.slice(2,4)}/${birth.slice(4)}`):'';
 for(const [id,v] of [['f_cccd',p[0]],['f_name',p[2]],['f_dob',displayDob(date)],['f_gt',/^(nam|male)$/i.test(p[4])?'Nam':/^(nữ|nu|female)$/i.test(p[4])?'Nữ':''],['f_tinh',p[5]]]){const field=$(id);if(field&&v){field.value=v;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))}}
 status('Đã điền thông tin CCCD. Kiểm tra lại trước khi Lưu.');stop();return true}
 el.querySelector('.v2098-cam').onclick=async()=>{if(active){stop();status('Đã dừng quét.');return}try{backend=await decoder();if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera chỉ hoạt động trên HTTPS hoặc localhost');stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});video.srcObject=stream;video.hidden=false;await video.play();active=true;status('Đưa mã QR vào khung hình.');const canvas=document.createElement('canvas');const tick=async()=>{if(!active)return;try{if(video.readyState>=2){const r=Math.min(1,900/video.videoWidth);canvas.width=Math.max(1,Math.round(video.videoWidth*r));canvas.height=Math.max(1,Math.round(video.videoHeight*r));canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);const code=await decode(canvas);if(code){accept(code);return}}}catch(e){status(e.message,true)}if(active)requestAnimationFrame(tick)};requestAnimationFrame(tick)}catch(e){stop();status('Không mở được camera: '+e.message,true)}};
 el.querySelector('.v2098-file-btn').onclick=()=>el.querySelector('.ktxqr-file').click();
 el.querySelector('input[type="file"]').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{backend=await decoder();const image=await createImageBitmap(file),canvas=document.createElement('canvas'),ratio=Math.min(1,1600/Math.max(image.width,image.height));canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);image.close?.();const code=await decode(canvas);if(!code)throw new Error('Không tìm thấy QR trong ảnh');accept(code)}catch(err){status(err.message,true)}finally{e.target.value=''}};
}
const css=document.createElement('style');css.textContent='.v2098-dob-help{display:block;margin-top:4px;font-size:11px;color:#bb334a;line-height:1.35}.v2098-dob-help:empty{display:none}';document.head.appendChild(css);
window.KTXV2098={parseDob,displayDob,attachWorkerForm};
})();
