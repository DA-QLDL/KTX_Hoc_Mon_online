/* QLKTX Stage 93 - nonminified ordered classic script bundle; generated from original sources. */

;
/* >>> Original: assets/js/core/ktx-pdf-suite-v229.js >>> */
/* QLKTX PDF Toolkit v229 — file processing stays in the browser. */
(() => {
'use strict';
const root=document.getElementById('t5');
if(!root || root.dataset.pdfSuite229)return;
root.dataset.pdfSuite229='1';
const $=id=>root.querySelector('#'+id);
const labels={image:'PDF → ảnh',compress:'Nén PDF',photos:'Ảnh → PDF',merge:'Gộp PDF'};
let state={photos:[],merge:[]};
const fmt=(n)=>n<1024*1024?(n/1024).toFixed(0)+' KB':(n/1024/1024).toFixed(2)+' MB';
const safeName=(s)=>String(s||'tai_lieu').replace(/\.[^.]+$/,'').replace(/[\\/:*?"<>|]/g,'_').slice(0,90);
function status(kind,msg,isError=false){const el=$('p229-'+kind+'-status');if(!el)return;el.textContent=msg;el.classList.toggle('is-error',isError);el.setAttribute('role',isError?'alert':'status')}
function busy(kind,value){const b=$('p229-'+kind+'-run');if(b){b.disabled=!!value;b.dataset.busy=String(!!value)}}
function download(bytes,name){const blob=bytes instanceof Blob?bytes:new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.hidden=true;document.body.appendChild(a);try{a.click()}finally{a.remove()}setTimeout(()=>URL.revokeObjectURL(url),120000)}
// Reset the current PDF tool only AFTER the browser download has been requested.
// Never reload the application: mobile download streams need the page to stay alive.
function resetAfterDownload(mode){
 setTimeout(()=>{
  const detail={mode,applied:false,busy:false,automatic:true};
  root.dispatchEvent(new CustomEvent('ktx-pdf-reset-current',{detail}));
  if(detail.applied){
   const s=$('p229-'+mode+'-status');
   if(s){s.textContent='Sẵn sàng cho phiên tiếp theo. Hãy chọn file mới.';s.classList.remove('is-error');}
  }
 },450);
}
async function lib(){if(window.PDFLib?.PDFDocument)return window.PDFLib;let last;
 for(const url of ['https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js','https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js']){
  try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.async=true;s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('Không tải được thư viện PDF'))};document.head.appendChild(s)});if(window.PDFLib?.PDFDocument)return window.PDFLib}catch(e){last=e}
 }
 throw new Error('Không tải được thư viện xử lý PDF. Hãy kiểm tra kết nối Internet rồi thử lại.');
}
function pdfjs(){if(!window.pdfjsLib)throw new Error('Thiếu PDF.js. Hãy kiểm tra kết nối Internet.');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return pdfjsLib}
function fileList(kind){const rootList=$('p229-'+kind+'-files');rootList.replaceChildren();const a=state[kind];a.forEach((f,i)=>{const item=document.createElement('div');item.className='p229-file-item';const name=document.createElement('span');name.textContent=(i+1)+'. '+f.name+' · '+fmt(f.size);const controls=document.createElement('span');controls.className='p229-file-controls';for(const [delta,symbol] of [[-1,'↑'],[1,'↓']]){const b=document.createElement('button');b.type='button';b.className='p229-arrow';b.textContent=symbol;b.title=delta<0?'Đưa lên trên':'Đưa xuống dưới';b.setAttribute('aria-label',b.title+' '+f.name);b.disabled=(i+delta<0||i+delta>=a.length);b.onclick=()=>{[a[i],a[i+delta]]=[a[i+delta],a[i]];fileList(kind)};controls.append(b)}const remove=document.createElement('button');remove.type='button';remove.className='p229-arrow p229-remove';remove.textContent='×';remove.title='Bỏ file';remove.setAttribute('aria-label','Bỏ '+f.name);remove.onclick=()=>{a.splice(i,1);fileList(kind)};controls.append(remove);item.append(name,controls);rootList.append(item)});
 status(kind,a.length?`${a.length} file · tổng ${fmt(a.reduce((s,f)=>s+f.size,0))}`:'Chưa có file được chọn.');
}
function initList(kind,accept){const input=$('p229-'+kind+'-input');input.addEventListener('change',()=>{const all=[...input.files].filter(f=>accept(f));state[kind].push(...all);input.value='';fileList(kind)});fileList(kind)}
function switchMode(mode){root.querySelectorAll('[data-p229-tab]').forEach(b=>{const active=b.dataset.p229Tab===mode;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});root.querySelectorAll('[data-p229-panel]').forEach(p=>p.hidden=p.dataset.p229Panel!==mode)}
root.querySelectorAll('[data-p229-tab]').forEach((b,i,buttons)=>{b.addEventListener('click',()=>switchMode(b.dataset.p229Tab));b.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=buttons[(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length];switchMode(next.dataset.p229Tab);next.focus()}})});
switchMode('image');
// Stage 49: one reset action for the active tool. Other tools retain their inputs.
root.addEventListener('ktx-pdf-reset-current',ev=>{
 const mode=ev.detail?.mode;
 if(mode==='compress'){
  if($('p229-compress-run').dataset.busy==='true'){ev.detail.busy=true;return;}
  $('p229-compress-input').value='';
  $('p229-compress-dpi').value='120';$('p229-compress-quality').value='0.7';
  status('compress','Đã xóa thao tác nén PDF. Chọn file mới để bắt đầu.');
  ev.detail.applied=true;
 }else if(mode==='photos'||mode==='merge'){
  if($('p229-'+mode+'-run').dataset.busy==='true'){ev.detail.busy=true;return;}
  state[mode]=[];
  $('p229-'+mode+'-input').value='';
  if(mode==='photos'){$('p229-photos-size').value='A4';$('p229-photos-margin').value='18';$('p229-photos-order').value='manual';}
  fileList(mode);
  status(mode,'Đã xóa danh sách file. Chọn file mới để bắt đầu.');
  ev.detail.applied=true;
 }
});
// Stage 50: independent reset button at the top of EACH tool, shared by PC and Mobile.
root.addEventListener('click',event=>{
 const button=event.target.closest('[data-p250-reset]');
 if(!button||!root.contains(button))return;
 const mode=button.dataset.p250Reset;
 // Avoid affecting other tools when this control is pressed.
 if(!['image','compress','photos','merge','sort','rotate','edit'].includes(mode))return;
 const running=mode==='image'?!!$('gp')?.disabled:
  ['photos','merge','compress'].includes(mode)?$('p229-'+mode+'-run')?.dataset.busy==='true':false;
 if(running){window.alert('Công cụ đang xử lý. Vui lòng xóa sau khi hoàn tất.');return;}
 if(!window.confirm('Xóa toàn bộ file/trang đã chọn và kết quả tạm của công cụ này để bắt đầu lại?\n\nFile gốc trên thiết bị vẫn được giữ nguyên.'))return;
 const detail={mode,applied:false,busy:false};
 root.dispatchEvent(new CustomEvent('ktx-pdf-reset-current',{detail}));
 if(detail.busy)window.alert('Công cụ đang xử lý. Vui lòng xóa sau khi hoàn tất.');
 else if(!detail.applied)window.alert('Chưa thể làm mới công cụ này. Vui lòng thử lại.');
});

// Photo sorting only changes the displayed export order; original files are not modified.
const photoOrder=$('p229-photos-order');
function sortPhotos(){
 const mode=photoOrder.value;
 if(mode==='manual')return;
 const az=new Intl.Collator('vi',{sensitivity:'base',numeric:false});
 const numeric=new Intl.Collator('vi',{sensitivity:'base',numeric:true});
 const comparator=mode==='az'||mode==='za'?az:numeric;
 const reverse=mode==='za'||mode==='numdesc';
 state.photos.sort((a,b)=>(reverse?-1:1)*comparator.compare(a.name,b.name));
 fileList('photos');
}
photoOrder.addEventListener('change',sortPhotos);
initList('photos',f=>f.type.startsWith('image/')||/\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name));
$('p229-photos-input').addEventListener('change',()=>queueMicrotask(sortPhotos));
initList('merge',f=>f.type==='application/pdf'||/\.pdf$/i.test(f.name));
function canvasJpeg(cv,quality){return new Promise((resolve,reject)=>cv.toBlob(b=>b?resolve(b):reject(Error('Không thể tạo ảnh JPEG')),'image/jpeg',quality))}
async function imageBytes(file,quality=0.77){
 // Automatically downsample very large camera photos before JPEG embedding.
 // ~180 DPI on A4 gives readable text while reducing common phone photo sizes.
 const bmp=await createImageBitmap(file);
 try{
  if(bmp.width*bmp.height>50000000)throw new Error('Ảnh quá lớn (trên 50 megapixel): '+file.name);
  const maxEdge=2200;
  const ratio=Math.min(1,maxEdge/Math.max(bmp.width,bmp.height));
  const width=Math.max(1,Math.round(bmp.width*ratio));
  const height=Math.max(1,Math.round(bmp.height*ratio));
  const cv=document.createElement('canvas');cv.width=width;cv.height=height;
  try{
   const ctx=cv.getContext('2d',{alpha:false});
   if(!ctx)throw Error('Không tạo được canvas để tối ưu ảnh.');
   ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(bmp,0,0,width,height);
   const blob=await canvasJpeg(cv,quality);
   return {bytes:await blob.arrayBuffer(),width,height};
  }finally{cv.width=cv.height=0;}
 }finally{bmp.close?.()}
}
$('p229-photos-run').onclick=async()=>{const items=state.photos;if(!items.length)return status('photos','Hãy chọn ít nhất một ảnh.',true);busy('photos',true);try{const {PDFDocument}=await lib();const pdf=await PDFDocument.create();const pageType=$('p229-photos-size').value,margin=Number($('p229-photos-margin').value);for(let i=0;i<items.length;i++){const file=items[i];status('photos',`Đang chuyển ảnh ${i+1}/${items.length}: ${file.name}`);const {bytes,width,height}=await imageBytes(file);const embedded=await pdf.embedJpg(bytes);let pw,ph;if(pageType==='A4'){[pw,ph]=width>height?[841.89,595.28]:[595.28,841.89]}else{const factor=Math.min(1,14400/Math.max(width,height));pw=width*factor*.75;ph=height*factor*.75}const pad=pageType==='A4'?margin:0;pw=Math.max(pw,60);ph=Math.max(ph,60);const pg=pdf.addPage([pw,ph]),scale=Math.min((pw-2*pad)/width,(ph-2*pad)/height),w=width*scale,h=height*scale;pg.drawImage(embedded,{x:(pw-w)/2,y:(ph-h)/2,width:w,height:h})}
 const output=await pdf.save({useObjectStreams:true});download(output,'anh_gop_'+items.length+'_trang.pdf');resetAfterDownload('photos');status('photos',`Hoàn tất: ${items.length} trang · file PDF ${fmt(output.byteLength)}.`)}catch(e){status('photos','Lỗi: '+(e.message||e),true)}finally{busy('photos',false)}};
$('p229-merge-run').onclick=async()=>{const items=state.merge;if(items.length<2)return status('merge','Hãy chọn ít nhất 2 file PDF.',true);busy('merge',true);try{const {PDFDocument}=await lib();const out=await PDFDocument.create();for(let i=0;i<items.length;i++){const f=items[i];status('merge',`Đang gộp file ${i+1}/${items.length}: ${f.name}`);let src;try{src=await PDFDocument.load(await f.arrayBuffer())}catch(e){throw Error('Không đọc được '+f.name+'. File có thể bị khóa, mã hóa hoặc hỏng. '+(e.message||''))}const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p))}const result=await out.save({useObjectStreams:true});download(result,'gop_'+items.length+'_file.pdf');resetAfterDownload('merge');status('merge',`Hoàn tất: ${out.getPageCount()} trang · ${fmt(result.byteLength)}.`)}catch(e){status('merge','Lỗi: '+(e.message||e),true)}finally{busy('merge',false)}};
$('p229-compress-run').onclick=async()=>{const file=$('p229-compress-input').files[0];if(!file)return status('compress','Hãy chọn file PDF cần nén.',true);busy('compress',true);let src;try{const {PDFDocument}=await lib();src=await pdfjs().getDocument({data:await file.arrayBuffer()}).promise;const out=await PDFDocument.create();const scale=Number($('p229-compress-dpi').value)/72,quality=Number($('p229-compress-quality').value);for(let n=1;n<=src.numPages;n++){status('compress',`Đang xử lý trang ${n}/${src.numPages}…`);const p=await src.getPage(n),view=p.getViewport({scale}),native=p.getViewport({scale:1});const pixelCount=view.width*view.height;if(pixelCount>25000000)throw Error('Trang '+n+' quá lớn với độ phân giải đã chọn. Hãy giảm DPI.');const cv=document.createElement('canvas');cv.width=Math.ceil(view.width);cv.height=Math.ceil(view.height);const ctx=cv.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);await p.render({canvasContext:ctx,viewport:view}).promise;const jpg=await canvasJpeg(cv,quality);cv.width=cv.height=0;const image=await out.embedJpg(await jpg.arrayBuffer());const page=out.addPage([native.width,native.height]);page.drawImage(image,{x:0,y:0,width:native.width,height:native.height});p.cleanup()}
 const bytes=await out.save({useObjectStreams:true});const reduction=Math.round((1-bytes.length/file.size)*100);download(bytes,safeName(file.name)+'_nen.pdf');resetAfterDownload('compress');status('compress',`Đã tạo ${src.numPages} trang: ${fmt(file.size)} → ${fmt(bytes.length)} (${reduction>=0?'giảm '+reduction+'%':'tăng '+(-reduction)+'%'}). Kết quả là PDF dạng ảnh, không còn chọn/tìm kiếm chữ.`)}catch(e){status('compress','Lỗi: '+(e.message||e),true)}finally{try{await src?.destroy()}catch(_){ }busy('compress',false)}};
})();

;
/* >>> Original: assets/js/core/ktx-pdf-editor-v245.js >>> */
/* QLKTX PDF editor v245: reorder, rotate, insert blank pages and images locally. */
(() => {
  'use strict';
  const root = document.getElementById('t5');
  if (!root || root.dataset.pdfEditor245) return;
  root.dataset.pdfEditor245 = '1';
  const $ = id => root.querySelector('#' + id);
  const tabs = ['sort', 'rotate', 'edit'];
  let sourceBytes = null, sourceName = '', sourcePdf = null, renderPdf = null;
  let pages = [], selected = -1, loading = false, saving = false, thumbUrls = [];
  const formatSize = n => n > 1048576 ? (n / 1048576).toFixed(2) + ' MB' : Math.round(n / 1024) + ' KB';
  const baseName = s => (s || 'tai_lieu').replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
  const status = (text, error = false) => { const e = $('p245-status'); e.textContent = text; e.classList.toggle('is-error', !!error); };
  const btn = (action, label, disabled, title) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'p245-toolbtn';
    b.textContent = label; b.dataset.action = action; b.disabled = !!disabled; b.title = title || label; return b;
  };
  function cleanPreviews() { thumbUrls.forEach(u => URL.revokeObjectURL(u)); thumbUrls = []; }
  function busy(value) {
    loading = value;
    root.querySelectorAll('.p245-actions button, .p245-page-controls button, #p245-save').forEach(b => b.disabled = value || saving || b.dataset.blocked === 'true');
  }
  async function getLib() {
    if (window.PDFLib?.PDFDocument) return PDFLib;
    for (const url of ['https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js', 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js']) {
      try {
        await new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = url; s.onload = resolve; s.onerror = reject; document.head.append(s); });
        if (window.PDFLib?.PDFDocument) return PDFLib;
      } catch (_) {}
    }
    throw new Error('Không tải được thư viện pdf-lib. Hãy kiểm tra Internet.');
  }
  function getPdfJs() {
    if (!window.pdfjsLib) throw new Error('Không tải được PDF.js để xem trước trang.');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return pdfjsLib;
  }
  function buttonActionsEnabled() {
    const exists = pages.length > 0 && selected >= 0;
    ['p245-insert-images','p245-remove','p245-rotate-all-left','p245-rotate-all-right'].forEach(id => { const el = $(id); if (el) el.disabled = !exists || loading || saving; });
    const save = $('p245-save'); if (save) save.disabled = !pages.length || loading || saving;
    const count = $('p245-counter'); if (count) count.textContent = pages.length ? `${pages.length} trang · Đang chọn: ${selected + 1}` : 'Chưa có trang';
  }
  function pageTitle(p, i) { return p.kind === 'source' ? `Trang gốc ${p.index + 1}` : p.kind === 'blank' ? 'Trang trống' : p.name; }
  function renderList() {
    const wrap = $('p245-pages'); wrap.replaceChildren();
    pages.forEach((p, i) => {
      const item = document.createElement('article');
      item.className = 'p245-page' + (i === selected ? ' is-selected' : ''); item.dataset.index = i;
      const choose = document.createElement('button'); choose.type = 'button'; choose.className = 'p245-preview';
      choose.setAttribute('aria-label', 'Chọn trang ' + (i + 1)); choose.setAttribute('aria-pressed', String(i === selected));
      if (p.thumb) {
        const img = document.createElement('img'); img.src = p.thumb; img.alt = '';
        img.style.transform = `rotate(${p.delta || 0}deg)`; choose.append(img);
      } else {
        const blank = document.createElement('span'); blank.className = 'p245-blank'; blank.textContent = 'Trang trắng'; choose.append(blank);
      }
      choose.onclick = () => { selected = i; renderList(); };
      const title = document.createElement('div'); title.className = 'p245-page-name'; title.textContent = (i + 1) + '. ' + pageTitle(p, i);
      const angle = document.createElement('span'); angle.className = 'p245-page-angle';
      angle.textContent = (p.delta ? 'Xoay thêm ' + p.delta + '°' : 'Góc ban đầu');
      const controls = document.createElement('div'); controls.className = 'p245-page-controls';
      const up = btn('up','←',i === 0 || loading || saving,'Chuyển trang lên trước');
      const down = btn('down','→',i === pages.length - 1 || loading || saving,'Chuyển trang xuống sau');
      const left = btn('left','↶',loading || saving,'Xoay trái 90°');
      const right = btn('right','↷',loading || saving,'Xoay phải 90°');
      [up, down, left, right].forEach(b => { b.onclick = () => { selected = i; execute(b.dataset.action); }; controls.append(b); });
      item.append(choose,title,angle,controls); wrap.append(item);
    });
    buttonActionsEnabled();
  }
  function execute(action) {
    if (loading || saving || selected < 0 || !pages[selected]) return;
    if (action === 'up' || action === 'down') {
      const next = selected + (action === 'up' ? -1 : 1);
      if (next < 0 || next >= pages.length) return;
      [pages[selected], pages[next]] = [pages[next], pages[selected]]; selected = next;
    } else if (action === 'left' || action === 'right') {
      const p = pages[selected]; p.delta = ((p.delta || 0) + (action === 'left' ? 270 : 90)) % 360;
    } else if (action === 'remove') {
      pages.splice(selected, 1); selected = Math.min(selected, pages.length - 1);
    } else if (action === 'all-left' || action === 'all-right') {
      const delta = action === 'all-left' ? 270 : 90;
      pages.forEach(p => { p.delta = ((p.delta || 0) + delta) % 360; });
    }
    renderList();
  }
  async function createThumbnail(page) {
    const view = page.getViewport({scale:1});
    const scale = Math.min(150 / view.width, 200 / view.height, 1.25);
    const viewport = page.getViewport({scale});
    const c = document.createElement('canvas'); c.width = Math.ceil(viewport.width); c.height = Math.ceil(viewport.height);
    await page.render({canvasContext:c.getContext('2d',{alpha:false}),viewport}).promise;
    const url = await new Promise((resolve, reject) => c.toBlob(b => b ? resolve(URL.createObjectURL(b)) : reject(new Error('Lỗi tạo ảnh xem trước')), 'image/png'));
    thumbUrls.push(url); c.width = c.height = 0; return url;
  }
  async function openPdf(file) {
    if (!file) return;
    busy(true); status('Đang đọc PDF và tạo ảnh xem trước…');
    let newRender = null;
    try {
      const {PDFDocument} = await getLib(); const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      newRender = await getPdfJs().getDocument({data:new Uint8Array(bytes.slice(0))}).promise;
      if (pdf.getPageCount() !== newRender.numPages) throw new Error('Số trang PDF không nhất quán.');
      if (pdf.getPageCount() > 500) throw new Error('File có trên 500 trang. Vui lòng dùng PDF nhỏ hơn để chỉnh sửa trên thiết bị.');
      const list = [];
      const oldUrls = thumbUrls; thumbUrls = [];
      try {
        for (let i = 0; i < pdf.getPageCount(); i++) {
          status(`Đang tạo xem trước trang ${i + 1}/${pdf.getPageCount()}…`);
          const pp = pdf.getPage(i), view = await newRender.getPage(i + 1);
          list.push({kind:'source',index:i,delta:0,thumb:await createThumbnail(view),width:pp.getWidth(),height:pp.getHeight()});
          view.cleanup();
        }
      } catch (e) { thumbUrls.forEach(u=>URL.revokeObjectURL(u)); thumbUrls=oldUrls; throw e; }
      oldUrls.forEach(u=>URL.revokeObjectURL(u));
      try { await renderPdf?.destroy(); } catch (_) {}
      renderPdf = newRender; newRender = null;
      sourceBytes = bytes; sourcePdf = pdf; sourceName = file.name; pages = list; selected = pages.length ? 0 : -1;
      renderList(); status(`Đã nạp ${pages.length} trang · ${formatSize(file.size)}. Có thể sắp xếp, xoay từng trang rồi xuất PDF.`);
    } catch (e) { status('Không thể mở PDF: ' + (e.message || e) + '. File có thể bị khóa hoặc mã hóa.', true); }
    finally { try {await newRender?.destroy();}catch(_){} busy(false); buttonActionsEnabled(); }
  }
  async function imageToPage(file) {
    const bmp = await createImageBitmap(file);
    try {
      if (bmp.width * bmp.height > 40000000) throw new Error('Ảnh quá lớn: ' + file.name);
      const canvas = document.createElement('canvas'); canvas.width = bmp.width; canvas.height = bmp.height;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(bmp,0,0);
      const jpeg = await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Lỗi đọc ảnh')),'image/jpeg',0.9));
      canvas.width=canvas.height=0;
      const thumb = URL.createObjectURL(jpeg); thumbUrls.push(thumb);
      const factor = Math.min(1,1100 / Math.max(bmp.width,bmp.height));
      return {kind:'image',name:file.name,jpg:await jpeg.arrayBuffer(),thumb,width:bmp.width*factor*.75,height:bmp.height*factor*.75,delta:0};
    } finally {bmp.close?.()}
  }
  async function insertImages(files) {
    if (!sourcePdf || selected < 0 || !files.length) return;
    busy(true);
    try {
      const newPages = [];
      for (let i=0;i<files.length;i++) {status(`Đang xử lý ảnh ${i+1}/${files.length}…`); newPages.push(await imageToPage(files[i]));}
      pages.splice(selected+1,0,...newPages); selected++;
      renderList(); status(`Đã chèn ${newPages.length} ảnh thành trang PDF. Bấm “Xuất PDF” để tải kết quả.`);
    } catch(e) {status('Lỗi chèn ảnh: '+(e.message||e),true)}
    finally {busy(false); buttonActionsEnabled();}
  }
  async function save() {
    if (!sourcePdf || !pages.length || saving || loading) return;
    saving = true; busy(true); status('Đang tạo file PDF mới…');
    try {
      const L = await getLib(), out = await L.PDFDocument.create();
      for (let i=0;i<pages.length;i++) {
        const spec=pages[i]; status(`Đang xuất trang ${i+1}/${pages.length}…`);
        let p;
        if (spec.kind === 'source') {
          const copied = await out.copyPages(sourcePdf,[spec.index]); p=out.addPage(copied[0]);
        } else if (spec.kind === 'blank') {
          p=out.addPage([spec.width,spec.height]);
        } else {
          const img = await out.embedJpg(spec.jpg);
          const w = Math.max(72,spec.width), h = Math.max(72,spec.height);
          p=out.addPage([w,h]); p.drawImage(img,{x:0,y:0,width:w,height:h});
        }
        if (spec.delta) { const original = p.getRotation().angle; p.setRotation(L.degrees((original + spec.delta)%360)); }
      }
      const data = await out.save({useObjectStreams:true});
      const blob = new Blob([data],{type:'application/pdf'}), url = URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=baseName(sourceName)+'_da_chinh_sua.pdf'; a.hidden=true;
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      status(`Đã xuất ${pages.length} trang · ${formatSize(data.byteLength)}. File gốc không bị thay đổi.`);
      // Let the browser begin saving before releasing the temporary editor session.
      setTimeout(() => {
        const detail={mode:'edit',applied:false,busy:false,automatic:true};
        root.dispatchEvent(new CustomEvent('ktx-pdf-reset-current',{detail}));
        if(detail.applied)status('Sẵn sàng cho phiên tiếp theo. Hãy chọn PDF mới.');
      },450);
    } catch(e) {status('Không thể xuất PDF: '+(e.message||e),true)}
    finally {saving=false; busy(false); buttonActionsEnabled();}
  }
  $('p245-input').addEventListener('change', e=>{const f=e.target.files?.[0]; if(f)openPdf(f);});
  $('p245-images').addEventListener('change',e=>{const arr=[...e.target.files].filter(f=>f.type.startsWith('image/'));e.target.value='';insertImages(arr)});
  $('p245-save').addEventListener('click', save);
  $('p245-remove').onclick=()=>execute('remove');
  $('p245-insert-images').onclick=()=>{if(sourcePdf)$('p245-images').click()};
  $('p245-rotate-all-left').onclick=()=>execute('all-left');
  $('p245-rotate-all-right').onclick=()=>execute('all-right');
  // Stage 49: discard temporary editing state without altering the source PDF on disk.
  root.addEventListener('ktx-pdf-reset-current', ev => {
    if (!tabs.includes(ev.detail?.mode)) return;
    if (loading || saving) { ev.detail.busy = true; return; }
    cleanPreviews();
    if (renderPdf) { const old = renderPdf; renderPdf = null; old.destroy().catch(() => {}); }
    sourceBytes = null; sourcePdf = null; sourceName = '';
    pages = []; selected = -1;
    ['p245-input','p245-images'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    renderList(); status('Đã xóa thao tác tạm. Chọn PDF để bắt đầu lại.');
    ev.detail.applied = true;
  });
  // PDF suite v229 controls tabs. Toggle the shared page workspace on the same tab event.
  function modeChanged() {
    const active = root.querySelector('[data-p229-tab][aria-selected="true"]')?.dataset.p229Tab;
    const shown = tabs.includes(active);
    $('p245-workspace').hidden = !shown;
    root.querySelectorAll('[data-p245-mode]').forEach(e=>{e.hidden=e.dataset.p245Mode!==active});
  }
  root.querySelectorAll('[data-p229-tab]').forEach(b=>b.addEventListener('click',modeChanged));
  root.querySelectorAll('[data-p229-tab]').forEach(b=>b.addEventListener('keydown',()=>setTimeout(modeChanged,0)));
  modeChanged(); renderList();
})();
