/* ========================================
   ALAALA — Service Worker
   Cache-first for static, network-first for pages
   ======================================== */

const CACHE_NAME = 'alaala-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/auth.html',
    '/dashboard.html',
    '/create-memorial.html',
    '/memorial.html',
    '/explore.html',
    '/booking.html',
    '/styles.css',
    '/pages.css',
    '/memorial.css',
    '/explore.css',
    '/booking.css',
    '/admin.css',
    '/error.css',
    '/animations.css',
    '/script.js',
    '/auth.js',
    '/dashboard.js',
    '/create-memorial.js',
    '/memorial.js',
    '/explore.js',
    '/booking.js',
    '/admin.js',
    '/animations.js',
    '/manifest.json'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — Network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests — let browser handle CORS natively
    if (url.origin !== location.origin) return;

    // HTML pages — network first, fallback to cache
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
        );
        return;
    }

    // Static assets — cache first, fallback to network
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                return response;
            });
        })
    );
});
