const CACHE_NAME='ktx-2.0.166-stage93-modular-css-v83';
// Minimal shell: previous long list was filtered to these same five assets at install time.
const SHELL=["/","/index.html","/pwa/manifest.webmanifest","/assets/img/brand/pwa-icon-192.png","/assets/img/brand/pwa-icon-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL.filter(x=>['./','./index.html','/pwa/manifest.webmanifest','/assets/img/brand/pwa-icon-192.png','/assets/img/brand/pwa-icon-512.png'].includes(x)))).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('ktx-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==self.location.origin)return;if(u.pathname.startsWith('/api/')||req.headers.has('authorization'))return;
if(req.mode==='navigate'||/\.(js|html|css|json|webmanifest)$/i.test(u.pathname)){e.respondWith(fetch(req,{cache:'no-store'}).then(async res=>{if(res.ok){(await caches.open(CACHE_NAME)).put(req,res.clone()).catch(()=>{})}return res}).catch(async()=>await caches.match(req)||Response.error()));return}
e.respondWith((async()=>{const c=await caches.match(req);if(c)return c;try{const r=await fetch(req);if(r.ok)(await caches.open(CACHE_NAME)).put(req,r.clone()).catch(()=>{});return r}catch(_){return Response.error()}})())});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
