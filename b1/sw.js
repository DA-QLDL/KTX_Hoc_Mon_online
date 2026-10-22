/* KTX Hóc Môn v1.0.0-B. Cache public static assets only. */
const CACHE_NAME = 'ktx-hoc-mon-production-v1.0.0-b1';
const CORE = ['./','./index.html','./assets/css/app.css','./assets/css/worker-table.css','./manifest.webmanifest','./pwa-icon-192.png','./pwa-icon-512.png','./ktx-logo.png'];
const PUBLIC_ASSET = /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|webmanifest)$/i;
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
