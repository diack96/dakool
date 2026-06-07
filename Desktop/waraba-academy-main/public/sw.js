// Service Worker pour Waraba Academy PWA
const CACHE_NAME = 'waraba-academy-v1.3.0';
const STATIC_CACHE = 'waraba-static-v1.3.0';
const DYNAMIC_CACHE = 'waraba-dynamic-v1.3.0';

// Pages publiques pouvant être mises en cache hors-ligne
const STATIC_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/waraba-academy.svg',
  '/waraba-academy-gradient.svg',
  '/favicon.ico',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/apple-touch-icon.png',
];

// Routes à ne JAMAIS intercepter — le navigateur les gère directement
// /auth    : callback OAuth renvoie un 307 → Safari iOS refuse une redirection servie par SW
// /admin   : protégé par middleware serveur, jamais mis en cache
// /dashboard : pages authentifiées, jamais mises en cache (sécurité + fraîcheur)
// NOTE: pas de slash final — /admin matche /admin ET /admin/courses etc.
const BYPASS_PREFIXES = ['/auth', '/admin', '/dashboard'];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        await Promise.allSettled(
          STATIC_URLS.map((url) =>
            cache.add(url).catch(() => {})
          )
        );
        // Prendre le contrôle immédiatement sans attendre que tous les onglets se ferment
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer tous les anciens caches (versions précédentes)
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les schemes non-HTTP (chrome-extension, data, blob, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes cross-origin (analytics, GTM, CDN tiers...)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Laisser le navigateur gérer directement les routes sensibles (auth, admin, dashboard)
  // Safari iOS bloque toute réponse de redirection servie par un SW
  if (BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return;
  }

  // Navigation HTML → réseau en priorité, fallback cache hors-ligne uniquement
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // Assets statiques (CSS, JS) → cache-first
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // Images → cache-first
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // API → réseau uniquement (données dynamiques, ne jamais mettre en cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Requêtes restantes → stratégie par défaut
  event.respondWith(handleDefaultRequest(request));
});

// Gestion des pages HTML
// Network-first : toujours essayer le réseau pour avoir la version fraîche.
// On ne met en cache QUE les réponses directes (non redirigées) pour éviter
// de stocker la page de login sous une URL protégée.
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request, { redirect: 'follow' });

    // Ne pas mettre en cache :
    //   - les réponses issues d'une redirection (ex: /courses → /auth/login)
    //   - les réponses non-OK (erreurs serveur)
    if (networkResponse.ok && !networkResponse.redirected) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // Pas de réseau → chercher dans le cache (mode hors-ligne)
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  const offlinePage = await caches.match('/offline');
  if (offlinePage) return offlinePage;

  // Fallback final : ne jamais retourner undefined (causerait ERR_FAILED)
  return new Response('Page non disponible hors ligne', {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// Assets statiques CSS/JS → cache-first avec revalidation en arrière-plan
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, response));
      }
    }).catch(() => {});
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch {
    return new Response('Asset non disponible', { status: 404 });
  }
}

// Images → cache-first
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch {
    return new Response('Image non disponible', { status: 404 });
  }
}

// API → network-only (données dynamiques, jamais mises en cache)
// En cas d'erreur réseau, on renvoie le cache comme dernier recours uniquement
async function handleAPIRequest(request) {
  try {
    return await fetch(request);
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'API non disponible hors ligne' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Requêtes restantes → network-first avec fallback cache
async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response('Ressource non disponible', { status: 404 });
  }
}

// Messages depuis le client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CACHE_INFO':
      getCacheInfo().then((info) => event.ports[0].postMessage(info));
      break;

    case 'CLEAR_CACHE':
      clearCache().then(() => event.ports[0].postMessage({ success: true }));
      break;

    case 'UPDATE_CACHE':
      updateCache(payload).then(() => event.ports[0].postMessage({ success: true }));
      break;
  }
});

async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const cacheInfo = {};
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheInfo[cacheName] = keys.length;
  }
  return cacheInfo;
}

async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
}

async function updateCache(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response);
    } catch {}
  }
}

// Notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification de Waraba Academy',
    icon: '/waraba-academy-gradient.svg',
    badge: '/waraba-academy.svg',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: 'explore', title: 'Voir', icon: '/waraba-academy.svg' },
      { action: 'close', title: 'Fermer', icon: '/waraba-academy.svg' },
    ],
  };
  event.waitUntil(self.registration.showNotification('Waraba Academy', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve());
  }
});
