'use client'

import { useEffect } from 'react'
import { PushNotificationClient } from '@/app/lib/push-client'

interface ServiceWorkerProviderProps {
  children: React.ReactNode
}

export default function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  useEffect(() => {
    // Register service worker on client side only
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          console.log('Registering service worker...')
          
          // Register the service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          console.log('Service Worker registered successfully:', registration)
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              console.log('New service worker found, updating...')
              newWorker.addEventListener('statechange', () => {
                console.log('Service worker state changed to:', newWorker.state)
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available, page refresh recommended')
                  // Could show a toast notification here in the future
                }
              })
            }
          })
          
          // Handle service worker errors
          registration.addEventListener('error', (event) => {
            console.error('Service Worker error:', event)
          })
          
        } catch (error) {
          console.error('Service Worker registration failed:', error)
          // Don't throw the error to prevent breaking the app
        }
      }
      
      // Register immediately
      registerServiceWorker()
      
      // Also setup push notification message listener
      PushNotificationClient.setupMessageListener()
      
    } else {
      console.log('Service Workers not supported')
    }
  }, [])

  // Handle service worker messages
  useEffect(() => {
    const handleNotificationClick = (event: any) => {
      const { data, action } = event.detail
      console.log('Notification clicked in app:', data, action)
      
      // Handle different notification types
      if (data.actionUrl) {
        window.location.href = data.actionUrl
      }
    }

    // Listen for custom notification click events from service worker
    window.addEventListener('notificationClick', handleNotificationClick)
    
    return () => {
      window.removeEventListener('notificationClick', handleNotificationClick)
    }
  }, [])

  return <>{children}</>
}
