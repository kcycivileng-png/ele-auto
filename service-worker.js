// 每次發布新版本時，務必修改這個版本字串，
// 才能讓使用者手機上的舊快取被清掉、抓到新版內容。
const CACHE_VERSION = 'v1.6.0';
const CACHE_NAME = `kt-om-forms-${CACHE_VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/photo.js',
  './js/signature.js',
  './js/pdf-export.js',
  './js/csv-export.js',
  './js/share.js',
  './js/form-kit.js',
  './forms/solar-module-check.html',
  './js/forms/solar-module-check.js',
  './js/forms/solar-module-check-template.js',
  './pdf-templates/solar-module-check-p1.png',
  './pdf-templates/solar-module-check-p2-photos.png',
  './pdf-templates/solar-module-check-p3-thermal.png',
  './pdf-templates/solar-module-check-p4-grounding.png',
  './vendor/jspdf.umd.min.js',
  './vendor/html2canvas.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
