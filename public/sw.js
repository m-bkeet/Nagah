/**
 * Service Worker for Success Training Center Portal
 * Network-First for HTML/Navigation to guarantee latest updates on mobile PWAs.
 */

const CACHE_NAME = 'nagah-cache-v7-live';

// Install Event - Skip waiting immediately to activate fresh code
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event - Clean all old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for Navigation / HTML & APIs
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // If request is navigation or HTML document -> ALWAYS Network-First
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || requestUrl.pathname.endsWith('.html') || requestUrl.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // If request is an API call, use Network-First strategy
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open('nagah-api-cache').then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'أنت في وضع عدم الاتصال حالياً. يرجى الاتصال بالإنترنت للتحديث.',
                isOffline: true 
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static Assets (JS, CSS, SVGs, Images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
