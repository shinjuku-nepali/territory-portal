const CACHE_NAME = 'territory-portal-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './image_ff7a81.png',
  'https://accounts.google.com/gsi/client'
];

// Install Event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
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

// Fetch Event: Network-first policy with offline fallback
self.addEventListener('fetch', (event) => {
  // Bypass caching for Google Auth and direct Apps Script endpoints
  if (event.request.url.includes('script.google.com') || event.request.url.includes('oauth2')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});