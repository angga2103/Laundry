// Nama cache untuk membedakan dari cache lain.
const CACHE_NAME = 'laundry-app-v1';

// Daftar semua file "cangkang" aplikasi yang perlu disimpan.
// Pastikan path ini sesuai dengan struktur folder Anda.
const assetsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png',
  // Jika Anda sudah menyimpan file CSS dan JS secara lokal:
  // 'assets/css/tailwind.css',
  // 'assets/css/all.min.css',
  // 'assets/js/jsrsasign.min.js',
  // 'assets/webfonts/fa-solid-900.woff2', // Contoh font awesome
];

// Event 'install': Dijalankan saat service worker pertama kali di-install.
self.addEventListener('install', (event) => {
  // Tunggu sampai proses caching selesai.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell...');
        return cache.addAll(assetsToCache);
      })
  );
});

// Event 'fetch': Dijalankan setiap kali aplikasi meminta sebuah file.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika file ada di cache, kembalikan dari cache.
        // Jika tidak, coba ambil dari jaringan (internet).
        return response || fetch(event.request);
      })
  );
});