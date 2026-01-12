
const CACHE_NAME = '3d-erp-v9.0-saneamento-total';
const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// Instalação
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

// Ativação e Limpeza
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Fetch com bypass para API do Google
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('script.google.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
