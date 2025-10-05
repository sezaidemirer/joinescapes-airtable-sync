// Service Worker for Push Notifications
const CACHE_NAME = 'joinescapes-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Push event - Push notification geldiğinde
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  let notificationData = {
    title: 'JoinEscapes',
    body: 'Yeni bir bildiriminiz var!',
    icon: '/images/join_icon.jpg',
    badge: '/images/join_icon.jpg',
    tag: 'default',
    requireInteraction: false,
    silent: false
  }

  // Eğer push data varsa, onu kullan
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data
      }
    } catch (error) {
      console.error('Push data parse error:', error)
    }
  }

  // Notification göster
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  // Ana sayfayı aç
  event.waitUntil(
    self.clients.openWindow('/')
  )
})

// Background sync (gelecekte kullanılabilir)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event)
})

// Message event (client'tan gelen mesajlar)
self.addEventListener('message', (event) => {
  console.log('Message from client:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
}) 