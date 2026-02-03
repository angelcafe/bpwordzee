const VERSION = '20260203-1915';
const CACHE_NAME = `bpwordzee-${VERSION}`;
const CACHE_NAME_EXTERNAL = `bpwordzee-external-${VERSION}`;
const PRECACHE_URLS = [
    './',
    './index.html',
    './front/index.css',
    './front/index.js',
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
                cache.addAll(EXTERNAL_URLS).catch(() => {})
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

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Para peticiones a la API, NUNCA cachear - siempre ir a la red
    if (url.pathname.includes('/api/') || url.hostname.includes('api.')) {
        event.respondWith(
            fetch(request)
                .then(response => response)
                .catch(() => {
                    // Devolver respuesta 200 con error en JSON para no contaminar la consola
                    return new Response(
                        JSON.stringify({
                            success: false,
                            mensaje: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
                        }),
                        {
                            status: 200,
                            statusText: 'OK',
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }
    
    // Para recursos externos (CDN de Bootstrap)
    if (url.origin !== location.origin) {
        event.respondWith(
            // Cache First: usa caché si existe, evita cargar desde red cada vez
            caches.match(request).then((cached) => {
                if (cached) {
                    return cached;
                }
                // Si no está en caché, descarga y cachea
                return fetch(request).then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME_EXTERNAL).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }
    
    // Para recursos locales del proyecto: Cache First (archivos estáticos del proyecto)
    event.respondWith(
        caches.match(request).then((cached) => {
            return cached || fetch(request);
        })
    );
});

// Permitir que el cliente solicite activar inmediatamente la nueva versión
self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});