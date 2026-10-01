// ============================================================
// ESTUDIO ARKIPELAGO — Background Service Worker for Web Push
// ============================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Event: Received when app/browser is closed or in background
self.addEventListener('push', (event) => {
  let data = {
    title: 'ESTUDIO ARKIPELAGO',
    body: 'New studio activity recorded.',
    url: '/dashboard',
    tag: 'arkipelago-notification',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/icon.png',
    image: data.image || undefined,
    vibrate: [100, 50, 100],
    tag: data.tag || 'arkipelago-notification',
    renotify: true,
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: 'Open View' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click: Focus existing tab or open new window to exact target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
