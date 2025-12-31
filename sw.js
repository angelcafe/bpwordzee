const VERSION = '20251224-1603';
const CACHE_NAME = `bpwordzee-${VERSION}`;
const PRECACHE_URLS = [
    './',
    './index.html',
    './front/index.css',
    './front/index.js',
    './front/cargando.gif',
    './front/icons/favicon.ico',
    './front/icons/wordzee-32_32.png',
    './front/icons/wordzee-64_64.jpg',
    './front/icons/wordzee-256_256.webp',
    './front/icons/wordzee-512_512.png',
    './front/icons/telegram.png',
    './front/icons/Facebook_f_logo_2019.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Limpiar caches antiguos en activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// Permitir que el cliente solicite activar inmediatamente la nueva versión
self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});