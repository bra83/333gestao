
const CACHE_NAME = '3d-erp-v14.0-production';

// No GitHub Pages, o caminho pode não ser a raiz absoluta.
// Usamos caminhos relativos para garantir compatibilidade.
const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@600;800&family=VT323&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets');
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Cleaning old cache', key);
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignorar Google Scripts (sempre online)
  if (url.hostname.includes('script.google.com')) return;

  // Estratégia: Stale-While-Revalidate
  // Tenta servir do cache, mas atualiza em segundo plano
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Se a resposta for válida, atualiza o cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar offline
        console.log('[SW] Offline fetch failed');
      });

      return cachedResponse || fetchPromise;
    })
  );
});
