
const CACHE_NAME = 'savepoint-quest-v18.0';
const OFFLINE_URL = './index.html';

const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://raw.githubusercontent.com/bra83/333gestao/main/logomarca.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignora chamadas de API (Google Scripts) - sempre rede
  if (url.hostname.includes('script.google.com') || url.search.includes('type=')) {
    return event.respondWith(fetch(event.request));
  }

  // Estratégia Stale-while-revalidate para recursos do app
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar a rede e não tiver cache, tenta retornar o index.html (SPA fallback)
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
      return cachedResponse || fetchPromise;
    })
  );
});
