// 每次發布新版本時，務必修改這個版本字串，
// 才能讓使用者手機上的舊快取被清掉、抓到新版內容。
const CACHE_VERSION = 'v1.26.0';
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
  './forms/monitor-box-check.html',
  './js/forms/monitor-box-check.js',
  './js/forms/monitor-box-check-template.js',
  './pdf-templates/monitor-box-check-p1.png',
  './pdf-templates/monitor-box-check-p2-photos.png',
  './forms/conduit-check.html',
  './js/forms/conduit-check.js',
  './js/forms/conduit-check-template.js',
  './pdf-templates/conduit-check-p1.png',
  './forms/cleaning-check.html',
  './js/forms/cleaning-check.js',
  './js/forms/cleaning-check-template.js',
  './pdf-templates/cleaning-check-p1.png',
  './forms/hv-equipment-check.html',
  './js/forms/hv-equipment-check.js',
  './js/forms/hv-equipment-check-template.js',
  './pdf-templates/hv-equipment-check-p1.png',
  './pdf-templates/hv-equipment-check-p2-photos.png',
  './forms/meter-box-check.html',
  './js/forms/meter-box-check.js',
  './js/forms/meter-box-check-template.js',
  './pdf-templates/meter-box-check-p1.png',
  './forms/environment-check.html',
  './js/forms/environment-check.js',
  './js/forms/environment-check-template.js',
  './pdf-templates/environment-check-p1.png',
  './forms/structure-check.html',
  './js/forms/structure-check.js',
  './js/forms/structure-check-template.js',
  './pdf-templates/structure-check-p1.png',
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
    caches.open(CACHE_NAME).then((cache) =>
      // 逐一用 {cache:'reload'} 強制略過瀏覽器/CDN的HTTP快取直接跟伺服器要最新bytes，
      // 不能用cache.addAll(CORE_ASSETS)——那個底層還是普通fetch，遇到GitHub Pages/CDN
      // 對某些檔案的HTTP快取還沒過期時，可能會把「同一個部署版本」裡幾個檔案的新舊
      // 混在一起存進同一份新版cache（例如HTML已更新、JS卻還是舊的），程式邏輯就會對不起來。
      Promise.all(CORE_ASSETS.map((url) => fetch(url, { cache: 'reload' }).then((res) => cache.put(url, res))))
    ).then(() => self.skipWaiting())
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

  // 改成「網路優先，失敗才用快取」：這個App還在密集修改測試階段，使用者需要
  // 每次都拿到最新版本；只有離線抓不到網路時才退回本機快取，維持基本可離線使用。
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
