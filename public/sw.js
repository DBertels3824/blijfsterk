// Blijf Sterk service worker.
// Twee taken: (1) de site installeerbaar maken als app op de telefoon,
// (2) pushmeldingen tonen die de server stuurt (zie app/api/cron/inactief).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Blijf Sterk', body: event.data ? event.data.text() : '' };
  }

  const titel = data.title || 'Blijf Sterk';
  const opties = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/dashboard' },
  };

  event.waitUntil(self.registration.showNotification(titel, opties));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((vensters) => {
      for (const venster of vensters) {
        if (venster.url.includes(url) && 'focus' in venster) {
          return venster.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
