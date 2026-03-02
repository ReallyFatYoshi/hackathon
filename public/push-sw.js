/// <reference lib="webworker" />

/**
 * Custom service worker for push notifications.
 * This file is placed in public/ and registered alongside the PWA worker.
 */

self.addEventListener('push', (event) => {
  if (!(event instanceof PushEvent)) return

  let data = { title: 'MyChef', body: 'You have a new notification', url: '/' }

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() }
    }
  } catch {
    // If JSON parsing fails, try text
    if (event.data) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url)
    })
  )
})

self.addEventListener('notificationclose', (_event) => {
  // Analytics or cleanup if needed
})
