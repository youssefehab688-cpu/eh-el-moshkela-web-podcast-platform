self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // يتيح للمتصفح التأكد من وجود معالج fetch لمتطلبات الـ PWA
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
