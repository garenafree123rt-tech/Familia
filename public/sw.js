// Service worker de "Familia": permite instalar la app y abrirla aunque falle la red un momento.
const VER = 'familia-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/.netlify/')) return;
  const allowed = url.origin === location.origin || /(^|\.)unpkg\.com$|(^|\.)jsdelivr\.net$/.test(url.hostname);
  if (!allowed) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VER).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
      )
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow('./');
    })
  );
});

// Aviso push: llega aunque la app esté cerrada.
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) {}
  const missed = d.kind === 'missed';
  e.waitUntil(self.registration.showNotification(d.title || 'Familia', {
    body: d.body || '', tag: 'call', renotify: true, icon: 'icon-192.png', badge: 'icon-192.png',
    requireInteraction: !missed, vibrate: missed ? [200] : [400, 200, 400, 200, 400, 200, 400]
  }));
});
