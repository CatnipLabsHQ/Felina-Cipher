/**
 * Felianisch V8 Service Worker
 * Cache-first für die App-Shell — die Seite läuft danach komplett offline.
 */

const CACHE_NAME = 'felianisch-v9.3';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './felian-alphabet.js',
    './crypto.js',
    './keymanager.js',
    './i18n.js',
    './ui.js',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(names =>
            Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Nur Same-Origin, kein Hash-Handling nötig
    if (!e.request.url.startsWith(self.location.origin)) return;
    e.respondWith(
        caches.match(e.request).then(cached =>
            cached || fetch(e.request).then(resp => {
                // Erfolgreiche Responses nachträglich in den Cache
                const copy = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
                return resp;
            })
        )
    );
});
