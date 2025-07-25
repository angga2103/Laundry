const CACHE_NAME = 'Laundry';
const urlsToCache = [
  '.',
  '/Laundry/',
  '/Laundry/index.html',
  '/Laundry/manifest.json',
  '/Laundry/sw.js',
  '/Laundry/icon-192x192.png',
  '/Laundry/icon-512x512.png',
  'https://cdn.tailwindcss.com', // Tailwind Play CDN adalah pengecualian dan bisa dicache seperti ini
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/jsrsasign/lib/jsrsasign.min.js'
];

// Langkah 1: Install - Menyimpan aset ke dalam cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache berhasil dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// Langkah 2: Fetch - Menyajikan aset dari cache jika tersedia (mode offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, langsung berikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, coba ambil dari internet seperti biasa
        return fetch(event.request);
      }
    )
  );
});

// Langkah 3: Activate - Membersihkan cache lama jika ada versi baru
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
