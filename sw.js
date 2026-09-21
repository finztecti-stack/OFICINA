/* Service worker mínimo del lanzador.
 *
 * Su único trabajo es cumplir el requisito de instalación y guardar la
 * portada para que abra aun sin señal. El ERP en sí NO se cachea: sus
 * datos viven en Google y tienen que llegar frescos siempre.
 */
var CACHE = 'oficina-lanzador-v2';
var ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  /* Solo se responde desde caché lo propio del lanzador. Todo lo que
     vaya a Google (el ERP) pasa de largo, siempre en vivo. */
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request).then(function (r) {
        return r || caches.match('./index.html');
      });
    })
  );
});
