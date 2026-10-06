/**
 * Progressive Web App Service Worker for Nagah Training Center Portal
 * Full offline support, asset precaching, and network-first sync.
 */

const CACHE_NAME = 'nagah-pwa-v10';
const OFFLINE_FALLBACK_URL = '/index.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/logo.svg',
  '/favicon.ico'
];

// Install Event - Precache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== 'nagah-api-cache') {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for Navigation & HTML, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  if (!event.request.url || !event.request.url.startsWith('http')) return;

  const requestUrl = new URL(event.request.url);

  // Skip Vite HMR websocket and internal dev reload queries
  if (
    requestUrl.pathname.includes('/@vite/') ||
    requestUrl.pathname.includes('/@react-refresh')
  ) {
    return;
  }

  // 1. Navigation / Document requests -> Network First with Offline Fallback
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cachedDoc = await caches.match(event.request);
          if (cachedDoc) return cachedDoc;
          const fallback = await caches.match(OFFLINE_FALLBACK_URL);
          if (fallback) return fallback;
          return new Response(
            '<!DOCTYPE html><html dir="rtl"><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>مركز النجاح للتدريب</h2><p>أنت حالياً في وضع عدم الاتصال. يتم حفظ بياناتك وسيقوم النظام بالمزامنة التلقائية فور عودة الإنترنت.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (Icons, Images, Fonts, Scripts) -> Cache First / Stale While Revalidate
  if (
    requestUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp|woff2|woff|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. API Requests -> Network-First with resilient cache
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open('nagah-api-cache').then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached && event.request.method === 'GET') return cached;
          return new Response(
            JSON.stringify({ 
              success: false, 
              offline: true, 
              message: 'تم حفظ العملية محلياً وستتم المزامنة فور عودة الاتصال' 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
});

// Background Sync Handler for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-tasks' || event.tag === 'sync-nagah-data') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_TRIGGERED' });
        });
      })
    );
  }
});

// Push Notifications Handler
self.addEventListener('push', (event) => {
  let payload = { title: 'مركز النجاح للتدريب', body: 'تنبيه جديد من المنصة الذكية', icon: '/icon-192.png' };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: '/icon-192.png',
      dir: 'rtl',
      data: payload.url || '/'
    })
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
