const CACHE_NAME = '3d-erp-v5'; // Atualizado para v5 para forçar atualização
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', event => {
  // Força o novo Service Worker a assumir imediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Limpa caches antigos (v1, v2, v3, etc)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Reivindica o controle das páginas imediatamente
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna cache se existir, senão busca na rede
        return response || fetch(event.request).catch(() => {
            // Fallback opcional se offline e sem cache
            return null;
        });
      })
  );
});
