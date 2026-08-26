// 每次發布新版本時，務必修改這個版本字串，
// 才能讓使用者手機上的舊快取被清掉、抓到新版內容。
const CACHE_VERSION = 'v1.16.0';
const CACHE_NAME = `kt-om-forms-${CACHE_VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/bulk-select.js',
  './js/photo.js',
  './js/signature.js',
  './js/pdf-export.js',
  './js/csv-export.js',
  './js/share.js',
  './js/drive-upload.js',
  './js/form-kit.js',
  './forms/solar-module-check.html',
  './js/forms/solar-module-check.js',
  './js/forms/solar-module-check-template.js',
  './pdf-templates/solar-module-check-p1.png',
  './pdf-templates/solar-module-check-p2-photos.png',
  './pdf-templates/solar-module-check-p3-thermal.png',
  './pdf-templates/solar-module-check-p4-grounding.png',
  './forms/dcbox-check.html',
  './js/forms/dcbox-check.js',
  './js/forms/dcbox-check-template.js',
  './pdf-templates/dcbox-check-p1.png',
  './pdf-templates/dcbox-check-p2-thermal.png',
  './pdf-templates/dcbox-check-p3-insulation.png',
  './pdf-templates/dcbox-check-p4-grounding.png',
  './forms/acbox-check.html',
  './js/forms/acbox-check.js',
  './js/forms/acbox-check-template.js',
  './pdf-templates/acbox-check-p1.png',
  './pdf-templates/acbox-check-p2-thermal.png',
  './pdf-templates/acbox-check-p3-insulation.png',
  './pdf-templates/acbox-check-p4-grounding.png',
  './forms/inverter-check.html',
  './js/forms/inverter-check.js',
  './js/forms/inverter-check-template.js',
  './pdf-templates/inverter-check-p1.png',
  './pdf-templates/inverter-check-p2-photos.png',
  './pdf-templates/inverter-check-p3-grounding.png',
  './forms/report2-check.html',
  './js/forms/report2-check.js',
  './js/forms/report2-check-template.js',
  './pdf-templates/report2-p1.png',
  './forms/report3-check.html',
  './js/forms/report3-check.js',
  './js/forms/report3-check-template.js',
  './pdf-templates/report3-p1.png',
  './forms/report4-check.html',
  './js/forms/report4-check.js',
  './js/forms/report4-check-template.js',
  './pdf-templates/report4-p1.png',
  './forms/report5-check.html',
  './js/forms/report5-check.js',
  './js/forms/report5-check-template.js',
  './pdf-templates/report5-p1.png',
  './forms/report6-check.html',
  './js/forms/report6-check.js',
  './js/forms/report6-check-template.js',
  './pdf-templates/report6-p1.png',
  './forms/report7-check.html',
  './js/forms/report7-check.js',
  './js/forms/report7-check-template.js',
  './pdf-templates/report7-p1.png',
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
