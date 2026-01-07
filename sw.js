const VERSION = '20251224-1603';
const CACHE_NAME = `bpwordzee-${VERSION}`;
const CACHE_NAME_EXTERNAL = `bpwordzee-external-${VERSION}`;
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

// URLs externas que queremos cachear (Bootstrap)
const EXTERNAL_URLS = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
            // Intentar cachear recursos externos, pero no fallar si no hay conexión
            caches.open(CACHE_NAME_EXTERNAL).then((cache) => 
                cache.addAll(EXTERNAL_URLS).catch(() => {
                    console.log('No se pudieron precachear recursos externos');
                })
            )
        ])
    );
    self.skipWaiting();
});

// Limpiar caches antiguos en activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter(key => key !== CACHE_NAME && key !== CACHE_NAME_EXTERNAL)
                .map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// Estrategia de fetch: Cache First para recursos locales, Network First para externos
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Para recursos externos (CDN)
    if (url.origin !== location.origin) {
        event.respondWith(
            // Network First: intenta red primero, luego caché
            fetch(request)
                .then((response) => {
                    // Si la respuesta es válida, actualizar la caché
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME_EXTERNAL).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar caché
                    return caches.match(request).then((cached) => {
                        if (cached) {
                            return cached;
                        }
                        // Si tampoco hay caché, retornar error
                        return new Response('Recurso no disponible sin conexión', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                })
        );
    } else {
        // Para recursos locales: Cache First
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request);
            })
        );
    }
});

// Permitir que el cliente solicite activar inmediatamente la nueva versión
self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});