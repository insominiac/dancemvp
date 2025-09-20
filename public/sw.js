// Service Worker for Dance Platform Push Notifications

const CACHE_NAME = 'dance-platform-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed and cached resources');
        return self.skipWaiting();
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Handle fetch requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Try to fetch from network
        return fetch(event.request).catch((error) => {
          console.log('Service Worker: Network fetch failed for', event.request.url, error);
          
          // If both cache and network fail, handle gracefully
          if (event.request.mode === 'navigate') {
            // Return offline page for navigation requests
            return caches.match('/offline.html').then((offlineResponse) => {
              return offlineResponse || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          }
          
          // For non-navigation requests, return a generic error response
          return new Response('Network Error', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker: Cache match failed', error);
        // Fallback: return a basic error response
        return new Response('Service Worker Error', {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);

  let notificationData = {
    title: 'Dance Platform',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      actionUrl: '/',
      actionData: null,
      notificationId: Date.now().toString()
    },
    tag: 'dance-platform',
    requireInteraction: false,
    actions: []
  };

  // Parse notification data if provided
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('Service Worker: Error parsing push data', error);
      notificationData.body = event.data.text();
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [200, 100, 200],
      actions: notificationData.actions || (notificationData.data?.actionUrl ? [
        {
          action: 'open',
          title: 'View',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ] : [])
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;
  let urlToOpen = notificationData.actionUrl || '/dashboard';

  // Handle different actions
  if (action === 'dismiss') {
    return; // Just close the notification
  }

  // Default action or 'open' action
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Try to focus an existing window with the URL
      for (let client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }).then((windowClient) => {
      // Send message to the client about the notification action
      if (windowClient && windowClient.postMessage) {
        windowClient.postMessage({
          type: 'NOTIFICATION_CLICKED',
          data: notificationData,
          action: action
        });
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
  
  // Optional: Send analytics or update read status
  const notificationData = event.notification.data || {};
  
  if (notificationData.notificationId) {
    // Could send a request to mark notification as read/dismissed
    // fetch('/api/notifications/mark-read', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ notificationId: notificationData.notificationId })
    // });
  }
});

// Handle background sync (for offline support)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event);

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync any pending notification actions
      syncNotifications()
    );
  }
});

// Background sync function
async function syncNotifications() {
  try {
    // Get any pending notification actions from IndexedDB or localStorage
    // and sync them with the server
    console.log('Service Worker: Syncing notifications');
    
    // This would typically involve:
    // 1. Getting pending actions from local storage
    // 2. Sending them to the server
    // 3. Clearing local storage on success
    
  } catch (error) {
    console.error('Service Worker: Error syncing notifications', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'notification-check') {
    event.waitUntil(
      // Check for new notifications periodically
      checkForNewNotifications()
    );
  }
});

async function checkForNewNotifications() {
  try {
    console.log('Service Worker: Checking for new notifications');
    
    // This could fetch new notifications from the server
    // and show them if the user has been inactive
    
  } catch (error) {
    console.error('Service Worker: Error checking notifications', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      if (data && Array.isArray(data.urls)) {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(data.urls);
          })
        );
      }
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          return caches.open(CACHE_NAME);
        })
      );
      break;

    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection', event.reason);
  
  // Log more details about the rejection
  if (event.promise) {
    console.error('Service Worker: Promise that was rejected:', event.promise);
  }
  
  // Prevent the default unhandled rejection behavior
  event.preventDefault();
});

console.log('Service Worker: Script loaded');
