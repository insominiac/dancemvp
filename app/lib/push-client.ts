// Client-side push notification utilities

export class PushNotificationClient {
  private static vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  /**
   * Check if push notifications are supported
   */
  static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  /**
   * Register service worker
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Service Worker not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker ready');
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribe(userId: string): Promise<{ success: boolean; subscription?: PushSubscription }> {
    try {
      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error(`Notification permission not granted: ${permission}`);
      }

      // Register service worker
      const registration = await this.registerServiceWorker();

      // Create push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save subscription: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Subscription saved to server:', result);

      return { success: true, subscription };
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return { success: false };
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        return false;
      }

      // Unsubscribe from browser
      const unsubscribed = await subscription.unsubscribe();
      console.log('Unsubscribed from browser:', unsubscribed);

      // Remove subscription from server
      if (unsubscribed) {
        const response = await fetch(`/api/notifications/push/subscribe?userId=${userId}&endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log('Subscription removed from server');
        } else {
          console.error('Failed to remove subscription from server');
        }
      }

      return unsubscribed;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  static async getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        return null;
      }

      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  /**
   * Check if user is currently subscribed
   */
  static async isSubscribed(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    return subscription !== null;
  }

  /**
   * Show local notification (for testing)
   */
  static async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
  }

  /**
   * Listen for service worker messages
   */
  static setupMessageListener(): void {
    if (!this.isSupported()) {
      return;
    }

    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);

      const { type, data, action } = event.data;

      switch (type) {
        case 'NOTIFICATION_CLICKED':
          console.log('Notification clicked:', data, action);
          // Handle notification click events
          this.handleNotificationClick(data, action);
          break;
        default:
          console.log('Unknown message type from service worker:', type);
      }
    });
  }

  /**
   * Handle notification click events
   */
  private static handleNotificationClick(data: any, action: string): void {
    // Emit custom event that components can listen to
    window.dispatchEvent(new CustomEvent('notificationClick', {
      detail: { data, action }
    }));
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private static urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Test push notification functionality
   */
  static async testNotification(): Promise<void> {
    try {
      await this.showLocalNotification('Test Notification', {
        body: 'This is a test notification from Dance Platform',
        tag: 'test',
        requireInteraction: true,
        actions: [
          {
            action: 'test-action',
            title: 'Test Action'
          }
        ]
      });
    } catch (error) {
      console.error('Error showing test notification:', error);
      throw error;
    }
  }

  /**
   * Initialize push notifications for a user
   */
  static async initialize(userId: string): Promise<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
  }> {
    const supported = this.isSupported();
    
    if (!supported) {
      return { supported, permission: 'default', subscribed: false };
    }

    // Setup message listener
    this.setupMessageListener();

    const permission = Notification.permission;
    const subscribed = await this.isSubscribed();

    console.log('Push notifications initialized:', {
      supported,
      permission,
      subscribed
    });

    return { supported, permission, subscribed };
  }

  /**
   * Get notification permission status with detailed info
   */
  static getPermissionStatus(): {
    supported: boolean;
    permission: NotificationPermission;
    canRequest: boolean;
    reasons: string[];
  } {
    const supported = this.isSupported();
    const permission = supported ? Notification.permission : 'default';
    const canRequest = supported && permission === 'default';
    const reasons: string[] = [];

    if (!supported) {
      if (typeof window === 'undefined') {
        reasons.push('Running in server environment');
      } else if (!('serviceWorker' in navigator)) {
        reasons.push('Service Worker not supported');
      } else if (!('PushManager' in window)) {
        reasons.push('Push Manager not supported');
      } else if (!('Notification' in window)) {
        reasons.push('Notification API not supported');
      }
    }

    if (permission === 'denied') {
      reasons.push('Notification permission denied');
    }

    return { supported, permission, canRequest, reasons };
  }
}
