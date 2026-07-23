const CACHE_NAME = 'gala-skn183-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Simpan fail asas (app shell) ke dalam cache semasa service worker dipasang
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Buang cache versi lama apabila service worker baru diaktifkan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategi: cache-first untuk fail app shell sendiri,
// tapi biarkan YouTube / Google Apps Script / gambar luar terus guna network
// (supaya muzik, RSVP, dan gallery sentiasa dapat data terkini)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isExternal =
    url.includes('youtube.com') ||
    url.includes('ytimg.com') ||
    url.includes('script.google.com') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('picsum.photos') ||
    url.includes('waze.com') ||
    url.includes('google.com/maps');

  if (isExternal) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
