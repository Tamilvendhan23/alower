const CACHE_NAME = 'mtc-pass-v1';

const FILES = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',

  // CSS
  './assets/css/style.css',

  // JavaScript
  './assets/js/app.js',

  // Fonts
  './assets/fonts/PixelCaps.ttf',

  // Images
  './assets/images/logo.png',
  './assets/images/call.png',
  './assets/images/bus.png',

  './assets/images/pass.jpeg',

  './assets/images/profile.jpg',

  './assets/images/qr_code.png',
  './assets/images/qr_code2.png',

  './assets/images/activated_pass.png',

  // Footer
  './assets/images/footer/footer_normal.png',

  // Pages
  './assets/images/pages/home_page.png',
  './assets/images/pages/live_page.png',
  './assets/images/pages/ticket_page.png',
  './assets/images/pages/profile_page.png',

  // Splash video
  './assets/videos/intro.mp4'
];


// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});


// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});


// FETCH
self.addEventListener('fetch', event => {

  // Cache only GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(

    caches.match(event.request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(networkResponse => {

          // Ignore invalid responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          // Save a copy in cache
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;

        })
        .catch(() => {

          // Return index page if navigation fails
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }

        });

    })

  );

});