// Humanity, Live: shows alerts before big events.
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let a = {}; try { const sub = await self.registration.pushManager.getSubscription(); a = await (await fetch('/api/alert?ep=' + encodeURIComponent(sub ? sub.endpoint : ''), { cache: 'no-store' })).json(); } catch (x) {}
    const title = a.follow ? a.title : a.title ? `${a.title} ${a.when || 'soon'}` : 'Something big is about to happen';
    await self.registration.showNotification('Humanity, Live', { body: title + ' — tap to watch.', icon: '/icon.png', badge: '/icon.png', tag: 'hl-alert', data: { url: '/' } });
  })());
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.matchAll({ type: 'window' }).then(l => { for (const c of l) if ('focus' in c) return c.focus(); return clients.openWindow('/'); })); });
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
