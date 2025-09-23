const CACHE_NAME = 'sresta-mart-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-Bs22AwL0.png',
  '/videos/eggs.mp4',
  '/videos/dryfruits.mp4',
  '/videos/dairy.mp4',
  '/videos/oils.mp4',
  '/videos/millets.mp4',
  '/videos/pickles.mp4',
  '/videos/meat.mp4',
  '/assets/index-wIPFBjVb.css',
  '/assets/index-Cd5ljdJ5.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});