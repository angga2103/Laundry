// Nama cache yang unik. Ubah nama ini setiap kali Anda memperbarui file service worker.
const CACHE_NAME = 'laundry-app-v2.4-cache';

// Daftar file inti aplikasi yang perlu disimpan dalam cache.
const URLS_TO_CACHE = [
  '/', // Mewakili file HTML utama (index.html)
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/jsrsasign/lib/jsrsasign.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code&display=swap',
  // Font dari fonts.gstatic.com akan di-cache secara dinamis saat pertama kali diakses.
];

// 1. Event 'install': Dipicu saat service worker pertama kali diinstal.
self.addEventListener('install', event => {
  // Tunggu hingga proses caching selesai sebelum melanjutkan.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache berhasil dibuka');
        // Menambahkan semua URL yang ditentukan ke dalam cache.
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Gagal melakukan caching saat instalasi:', err);
      })
  );
});

// 2. Event 'activate': Dipicu setelah instalasi dan saat service worker aktif.
// Berguna untuk membersihkan cache lama.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Jika ada cache dengan nama yang berbeda dari CACHE_NAME saat ini, hapus.
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Memastikan service worker baru mengambil alih kontrol halaman dengan segera.
  return self.clients.claim();
});

// 3. Event 'fetch': Dipicu setiap kali aplikasi membuat permintaan jaringan (misalnya, mengambil gambar, CSS, dll.).
self.addEventListener('fetch', event => {
  // Hanya proses permintaan GET, abaikan yang lain (POST, dll.)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Strategi: Cache-First, lalu Network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Jika permintaan ditemukan di cache, langsung kembalikan dari cache.
        if (cachedResponse) {
          // console.log('Mengambil dari cache:', event.request.url);
          return cachedResponse;
        }

        // Jika tidak ada di cache, lanjutkan ke jaringan.
        return fetch(event.request).then(
          networkResponse => {
            // Setelah berhasil mengambil dari jaringan, simpan salinannya ke cache untuk penggunaan berikutnya.
            // Ini penting untuk caching dinamis (misalnya, font yang diminta oleh Google Fonts CSS).
            
            // Pastikan respons valid sebelum di-cache.
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }

            // Salin respons karena stream hanya bisa dibaca sekali.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // console.log('Menyimpan ke cache:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Gagal mengambil dari jaringan:', error);
          // Di sini Anda bisa menyediakan halaman offline fallback jika diperlukan.
          // return caches.match('/offline.html');
        });
      })
  );
});
