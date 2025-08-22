const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const STATIC_ASSETS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![STATIC_CACHE].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin
  if (url.origin !== self.location.origin) return;

  // Do not cache POSTs (e.g., /api/solve)
  if (request.method !== 'GET') return;

  // Cache-first for static assets
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname === '/' ||
    url.pathname.startsWith('/icons') ||
    url.pathname.startsWith('/static') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        const respClone = resp.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, respClone));
        return resp;
      }))
    );
    return;
  }

  // Stale-while-revalidate for weather API
  if (url.pathname.startsWith('/api/weather')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request).then((resp) => {
          cache.put(request, resp.clone());
          return resp;
        }).catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // For navigation requests, serve cached shell if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }
});
