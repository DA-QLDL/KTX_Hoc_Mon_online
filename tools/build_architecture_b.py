#!/usr/bin/env python3
"""Repeatable, conservative production build of KTX Hóc Môn v1.0.0 (Architecture B).
Preserves classic script bytes/order and CSS cascade; no data migration.
"""
from pathlib import Path
from urllib.parse import urlsplit
import shutil, re, json, hashlib, subprocess, zipfile, datetime
from bs4 import BeautifulSoup

ROOT=Path('/mnt/data')
SOURCE=ROOT/'KTX_HOC_MON_v1.0.0_PRODUCTION'/'deploy'
OUT=ROOT/'KTX_HOC_MON_v1.0.0_ARCHITECTURE_B'
WEB=OUT/'deploy'
source_manifest=ROOT/'KTX_HOC_MON_v1.0.0_PRODUCTION'/'docs'/'module-manifest.json'
if OUT.exists():shutil.rmtree(OUT)
shutil.copytree(SOURCE,WEB)
(OUT/'docs').mkdir()
(OUT/'tools').mkdir()

index=WEB/'index.html'
html=index.read_text(encoding='utf-8')
old=html
# Correct invalid legacy root document closure: don't change order of scripts,
# but place the real closing body+html after all existing interactive HTML/scripts.
assert html.count('</body>')==1 and html.count('</html>')==1
html=html.replace('</body>','',1).replace('</html>','',1)
html=html.rstrip()+'\n</body>\n</html>\n'
# remove empty-line noise from past STEP patches, but preserve order and all text/scripts
html=re.sub(r'(?:^[ \t]*\n){3,}', '\n\n', html, flags=re.MULTILINE)
html=html.replace('content="KTX-STEP255-UNIFIED-STATUS-CHIPS"','content="KTX-HOC-MON-v1.0.0-B"')
html=html.replace('v=1.0.0','v=1.0.0-b')
# Ensure CSS in head and script order remain intact.
index.write_text(html,encoding='utf-8')

# Reduce SW cold-start traffic without dropping offline shell support.
# Precache only core app shell and logos; scripts lazy-cached as requested.
# Prevent old self-hosted sensitive/data-driven pages from being blindly cached.
sh=(WEB/'sw.js')
sw = '''/* KTX Hóc Môn v1.0.0-B. Cache public static assets only. */
const CACHE_NAME = 'ktx-hoc-mon-production-v1.0.0-b';
const CORE = ['./','./index.html','./assets/css/app.css','./manifest.webmanifest','./pwa-icon-192.png','./pwa-icon-512.png','./ktx-logo.png'];
const PUBLIC_ASSET = /\\.(?:js|css|png|jpg|jpeg|webp|svg|ico|webmanifest)$/i;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(CORE.map(url => cache.add(url)));
    if (results.some(result => result.status === 'rejected')) {
      console.warn('[KTX] Some public offline shell assets could not be cached');
    }
  })());
  self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  const old = await caches.keys();
  await Promise.all(old.filter(key => key.startsWith('ktx-hoc-mon-') && key !== CACHE_NAME).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin || url.pathname.startsWith('/api/') || request.headers.has('authorization')) return;
  if(request.mode === 'navigate') {
    event.respondWith(fetch(request, {cache:'no-store'}).catch(async () => (await caches.match(request)) || (await caches.match('./index.html')) || Response.error()));
    return;
  }
  if(!PUBLIC_ASSET.test(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Network first for executable assets to avoid stale STEP versions.
    try {
      const response = await fetch(request, {cache:'no-store'});
      if(response.ok && response.type === 'basic') cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch(e) {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
self.addEventListener('message', e => {
  if(e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
'''
sh.write_text(sw,encoding='utf-8')

# Add a stable build/audit manifest listing the actual eight logical module groups.
man=json.loads(source_manifest.read_text())
modules=sorted({item['module'] for item in man['scripts'] if item['module']!='core'})
assert modules==['admin','attendance','meals','overview','reports','residency','rooms','workers'],modules
files=[]
for p in sorted(WEB.rglob('*')):
    if p.is_file():
        rel=p.relative_to(WEB).as_posix()
        files.append({'path':rel,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(OUT/'docs'/'FILE_HASHES.json').write_text(json.dumps({'release':'1.0.0-B','files':files},ensure_ascii=False,indent=2)+'\n')
(OUT/'docs'/'MODULE_MAP.json').write_text(json.dumps({'release':'1.0.0-B','modules':modules,'execution_order':[item['file'] for item in man['scripts']]},ensure_ascii=False,indent=2)+'\n')

# Strict non-mutating tests: JS preserved hash-wise, all local references resolve, no missing scripts.
original_script=SOURCE/'assets/js'
new_script=WEB/'assets/js'
orig_js={x.relative_to(original_script).as_posix(): hashlib.sha256(x.read_bytes()).hexdigest() for x in original_script.rglob('*.js')}
new_js={x.relative_to(new_script).as_posix(): hashlib.sha256(x.read_bytes()).hexdigest() for x in new_script.rglob('*.js')}
assert orig_js==new_js,'Business JS changed: prohibited'
cssname='assets/css/app.css'
assert (SOURCE/cssname).read_bytes()==(WEB/cssname).read_bytes(),'CSS cascade changed unexpectedly'
regex=re.compile(r'(?:src|href)=[\'\"]([^\'\"]+)[\'\"]')
missing=[]
for f in WEB.rglob('*.html'):
    for path in regex.findall(f.read_text(encoding='utf-8')):
        if path.startswith(('http:','https:','data:','mailto:','tel:','#','javascript:','//')) or '${' in path:continue
        local=(f.parent/urlsplit(path).path).resolve()
        if not local.exists():missing.append([f.relative_to(WEB).as_posix(),path])
# Existing optional refs may have been already absent from previous release; record, do not silently imply correctness.
(OUT/'docs'/'LOCAL_LINKS.json').write_text(json.dumps({'missing':missing},ensure_ascii=False,indent=2)+'\n')
assert not missing,missing
scripts=re.findall(r'<script\b[^>]*src=[\'\"]([^\'\"]+)[\'\"]',html)
local_scripts=[urlsplit(x).path.removeprefix('./') for x in scripts if not x.startswith(('http:','https:','//'))]
module_scripts=[x for x in local_scripts if x.startswith('assets/js/')]
assert module_scripts==[x['file'] for x in man['scripts']],'Script order changed'
for path in sorted(WEB.rglob('*.js')):
    if path.name in ('qr-config.js',): pass
    v=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
    assert v.returncode==0,(path.as_posix(),v.stderr[:400])

(OUT/'docs'/'QA_SUMMARY.json').write_text(json.dumps({'date':'2026-10-22','release':'v1.0.0-B','business_js_files_preserved':len(orig_js),'business_js_equal':True,'css_cascade_equal':True,'modules':modules,'local_links_missing':0,'document_closing_tags_corrected':True,'js_syntax_checked':len(list(WEB.rglob('*.js'))),'browser_and_supabase_qa':'requires live staging'},ensure_ascii=False,indent=2)+'\n')
(OUT/'README_DEPLOY.md').write_text('''# KTX Hóc Môn v1.0.0 — Architecture B / production candidate

## Triển khai
Sao lưu hiện trạng Vercel và Supabase trước khi cập nhật. Sao chép **toàn bộ nội dung `deploy/`** vào thư mục gốc của repository `KTX_Hoc_Mon_online`, không sao chép `docs/` hay `tools/` lên website. Kiểm tra Preview trước khi phát hành Production.

## Kiến trúc
- 8 nhóm nghiệp vụ trong `deploy/assets/js/modules/`: admin, attendance, meals, overview, reports, residency, rooms, workers.
- `deploy/assets/js/core/`: mã dùng chung. 62 script nghiệp vụ giữ nguyên byte và thứ tự chạy.
- `deploy/assets/css/app.css`: CSS giữ nguyên thứ tự cascade, phong cách nút STEP100 từ STEP258.
- `deploy/api/`: API hiện có. Chưa thay đổi quyền Supabase/RLS.
- `deploy/sw.js`: cache mạng ưu tiên phiên bản mới, tách bảo vệ request API, giảm precache khởi động.
- Mã nguồn hợp lệ hóa đóng `</body></html>`; không thay đổi vị trí hoặc thứ tự các phần tử thực tế.

## Phạm vi thực hiện
Tối ưu kiến trúc phân phối, bộ nhớ đệm, tính tái lập và tài liệu phụ thuộc. **Không** tự nhận đã tái cấu trúc lại toàn bộ thuật toán, thay thế hệ phân quyền hay hoàn toàn loại bỏ các đoạn trùng CSS/JS khi chưa có kiểm thử tác vụ tương ứng. Biên bản sự vụ giữ ẩn trên Mobile.

## Nghiệm thu trước khi xuất bản
1. Kiểm tra đăng nhập Admin/nhân viên, RLS trực tiếp (không chỉ UI).
2. Kiểm tra hai KTX hiển thị song song, Quản lý công nhân, chuyển phòng, tìm kiếm, sửa dữ liệu có quyền.
3. Kiểm tra QR, điểm danh, suất ăn, xuất Excel, lịch sử và sao lưu/khôi phục.
4. Kiểm tra Mobile, hover nút STEP100, PWA sau khi tải lại.
5. Kiểm tra trên Vercel Preview, chụp lại cấu hình hiện tại để rollback.

## Tái tạo và audit
Chạy `python3 tools/build_architecture_b.py` nếu sử dụng cấu trúc nguồn theo hướng dẫn trong mã. `docs/FILE_HASHES.json` cho phép xác thực từng tệp; `docs/QA_SUMMARY.json` ghi giới hạn kiểm thử.
''',encoding='utf-8')
# Bundle build script with runnable parameterless invocation using immutable v1.0.0 files as input only when both coexist.
shutil.copy2(Path(__file__),OUT/'tools'/'build_architecture_b.py')
# README clarifies this build file is a provenance recipe, relies on the snapshot under /mnt/data.
zip_path=ROOT/'KTX_HOC_MON_v1.0.0_ARCHITECTURE_B.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for f in OUT.rglob('*'):
        if f.is_file():z.write(f,f.relative_to(ROOT))
with zipfile.ZipFile(zip_path) as z:assert z.testzip() is None
print('OUTPUT',zip_path,'zip_bytes',zip_path.stat().st_size,'scripts',len(orig_js),'files',len(files),'html_bytes',len(html),'missing',missing)
