
const CACHE_NAME = '3d-erp-v32-formdata';
const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// Instalação: Cacheia apenas os assets estáticos core
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

// Ativação: Limpa caches antigos imediatamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Fetch: Rede primeiro, falha para cache. Ignora chamadas à API do Google Script.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Se for chamada para o Google Script, não usa cache de jeito nenhum
  if (url.hostname.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
