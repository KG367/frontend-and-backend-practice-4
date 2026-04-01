const CACHE_NAME = 'notes-cache-v3'; 
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icons/add_notes_16dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.png',
    '/icons/add_notes_32dp_E3E3E3_FILL0_wght400_GRAD0_opsz40.png',
    '/icons/add_notes_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
    '/icons/add_notes_64dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
    '/icons/add_notes_128dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
    '/icons/add_notes_256dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
    '/icons/add_notes_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});