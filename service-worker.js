const CACHE_NAME = 'chennai-one-v3';

const FILES = [

  './',
  './index.html',
  './manifest.json',

  './assets/css/style.css',
  './assets/js/app.js',

  './assets/fonts/PixelCaps.ttf',

  './assets/images/logo.png',
  './assets/images/call.png',
  './assets/images/bus.png',

  './assets/images/pass.jpeg',
  './assets/images/pass.png',

  './assets/images/profile.jpg',

  './assets/images/qr_code.png',
  './assets/images/qr_code2.png',

  './assets/images/activated_pass.png',

  './assets/images/home.png',
  './assets/images/pass_bar.png',
  './assets/images/flag.png',
  './assets/images/ticket.png',
  './assets/images/user.png',

  './assets/images/pages/home_page.png',
  './assets/images/pages/live_page.png',
  './assets/images/pages/ticket_page.png',
  './assets/images/pages/profile_page.png',

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

  event.respondWith(

    caches.match(event.request)

      .then(response => {

        return response || fetch(event.request);

      })

      .catch(() => {

        return caches.match('./index.html');

      })

  );

});