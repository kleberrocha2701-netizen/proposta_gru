const CACHE = 'cidadao-gru-v1';

// Na instalação, apenas limpamos caches antigos se necessário
self.addEventListener('install', () => {
  self.skipWaiting(); 
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// A mágica acontece aqui: Network-First
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Se a rede responder, clonamos a resposta e salvamos no cache
        const resClone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, resClone));
        return response;
      })
      .catch(() => {
        // Se a rede falhar (offline), tentamos o cache
        return caches.match(e.request).then(cached => {
          // Se não houver no cache, retorna a index como fallback
          return cached || caches.match('./index.html');
        });
      })
  );
});