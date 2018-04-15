// Cache Name - news-cache Version 1
var cacheName = 'news-cache-v1';

// Dynamic Cache Name

var dynamicCacheName = 'dyn-news-cache-v1';

// Files to cache

var filesToCache = [
  '/',
  'src/js/app.js',
  '/index.html',
  'src/js/idb.js',
  'src/css/main.css',
  'src/images/BG_01.png',
  'src/images/dribbble_icon.png',
];

// Listening For An Install Event

self.addEventListener('install', function(e) {
  console.log('[Service Worker] Installing...');
  e.waitUntil(
    // Open The Cache API for caching
    caches
      .open(cacheName)
      .then(function(cache) {
        // Send the files you want to cache.
        cache.addAll(filesToCache);
      })
      .then(self.skipWaiting())
  );
});

// Listening For An Activation Event

self.addEventListener('activate', function(e) {
  console.log('[Service Worker] Activating...');

  e.waitUntil(
    caches.keys().then(function(keyLists) {
      return Promise.all(
        keyLists.map(function(key) {
          if (key !== cacheName && key !== dynamicCacheName) {
            // Remove old caches in the cache api
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Listening For A Fetch Event

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetching....');

  e.respondWith(
    // Get data from cache if available
    caches.match(e.request).then(function(res) {
      if (res) return res;
      return fetch(e.request).then(function(fetchResponse) {
        // Store the fetch data into the cache api
        return caches.open(dynamicCacheName).then(function(cache) {
          // Save a clone of the request and return the original response
          cache.put(e.request.url, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
