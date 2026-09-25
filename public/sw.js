self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // تمرير الطلبات بسلاسة دون تعارض مع اتصالات Supabase و Vercel
  event.respondWith(fetch(event.request));
});
