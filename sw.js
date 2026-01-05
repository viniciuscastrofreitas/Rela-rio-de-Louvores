
const CACHE_NAME = 'icm-louvores-v5';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/types.ts',
  '/constants.ts',
  '/praiseList.ts',
  '/db.ts',
  '/App.tsx',
  '/components/ServiceForm.tsx',
  '/components/HistoryList.tsx',
  '/components/RankingList.tsx',
  '/components/BackupRestore.tsx',
  '/components/UnplayedList.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

// Bibliotecas exatas do importmap para evitar miss no cache
const ESM_DEPS = [
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/react@^19.2.3/',
  'https://esm.sh/react-dom@^19.2.3/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Pre-caching assets and dependencies...');
      return Promise.allSettled(
        [...PRECACHE_ASSETS, ...ESM_DEPS].map(url => 
          cache.add(url).catch(err => console.warn(`Falha ao cachear recurso crítico: ${url}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Estratégia Cache-First para Dependências Externas (CDNs)
  if (url.host === 'esm.sh' || url.host.includes('fonts.') || url.host.includes('cdn.tailwindcss.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          }
          return networkResponse;
        }).catch(() => new Response("Offline dependency missing", { status: 503 }));
      })
    );
    return;
  }

  // 2. Estratégia Network-First para arquivos locais e navegação
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (request.method === 'GET' && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Fallback para index.html em caso de navegação offline
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response("Recurso não disponível offline", { status: 503 });
        });
      })
  );
});
