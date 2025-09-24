import webpush from 'web-push';
import prisma from './db';
import { NotificationType, DeliveryMethod } from '@prisma/client';

// Configure web-push with VAPID keys
// In production, these should be environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@danceplatform.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  image?: string;
  actionUrl?: string;
  actionData?: any;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  /**
   * Send push notification to a specific user
   */
  static async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
    options: {
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      ttl?: number; // Time to live in seconds
    } = {}
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    try {
      // Get active push subscriptions for the user
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          isActive: true
        }
      });

      if (subscriptions.length === 0) {
        return { success: 0, failed: 0, errors: ['No active push subscriptions found'] };
      }

      const results = await Promise.allSettled(
        subscriptions.map(subscription => 
          this.sendPushNotification(subscription, payload, options)
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failedCount = results.filter(r => r.status === 'rejected').length;
      const errors = results
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason);

      // Deactivate failed subscriptions (likely expired or invalid)
      if (errors.length > 0) {
        await this.deactivateInvalidSubscriptions(subscriptions, errors);
      }

      return {
        success: successCount,
        failed: failedCount,
        errors
      };

    } catch (error) {
      console.error('Error sending push notifications:', error);
      return { success: 0, failed: 1, errors: [error] };
    }
  }

  /**
   * Send push notification to multiple users
   */
  static async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
    options: {
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      ttl?: number;
    } = {}
  ): Promise<{ 
    totalUsers: number; 
    successfulUsers: number; 
    totalNotifications: number; 
    successfulNotifications: number;
    errors: any[] 
  }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, payload, options))
    );

    const successfulResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);

    const totalNotifications = successfulResults.reduce((sum, r) => sum + r.success + r.failed, 0);
    const successfulNotifications = successfulResults.reduce((sum, r) => sum + r.success, 0);
    const allErrors = successfulResults.flatMap(r => r.errors);

    return {
      totalUsers: userIds.length,
      successfulUsers: successfulResults.length,
      totalNotifications,
      successfulNotifications,
      errors: allErrors
    };
  }

  /**
   * Send notification based on user preferences and delivery method
   */
  static async sendNotificationWithPreferences(
    userId: string,
    type: NotificationType,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      // Check user's notification preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: {
          userId_type: {
            userId,
            type
          }
        }
      });

      // If user has disabled push notifications for this type, don't send
      if (preferences && !preferences.pushEnabled) {
        return false;
      }

      // Check quiet hours
      if (preferences && this.isInQuietHours(preferences.quietHoursStart, preferences.quietHoursEnd)) {
        // Schedule notification for later or skip based on urgency
        return false;
      }

      // Send the push notification
      const result = await this.sendToUser(userId, payload);
      return result.success > 0;

    } catch (error) {
      console.error('Error sending notification with preferences:', error);
      return false;
    }
  }

  /**
   * Create and send a complete notification (database + push)
   */
  static async createAndSendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: {
      actionUrl?: string;
      actionData?: any;
      relatedEntityId?: string;
      relatedEntityType?: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      scheduledFor?: Date;
      pushPayload?: Partial<PushNotificationPayload>;
    } = {}
  ): Promise<{ notification: any; pushResult?: any }> {
    // Create database notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority: options.priority || 'NORMAL',
        actionUrl: options.actionUrl,
        actionData: options.actionData ? JSON.stringify(options.actionData) : null,
        deliveryMethod: DeliveryMethod.PUSH,
        scheduledFor: options.scheduledFor,
        relatedEntityId: options.relatedEntityId,
        relatedEntityType: options.relatedEntityType
      }
    });

    // Send push notification if not scheduled for later
    let pushResult;
    if (!options.scheduledFor || options.scheduledFor <= new Date()) {
      const pushPayload: PushNotificationPayload = {
        title,
        message,
        actionUrl: options.actionUrl,
        actionData: options.actionData,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        requireInteraction: options.priority === 'URGENT',
        ...options.pushPayload
      };

      pushResult = await this.sendNotificationWithPreferences(userId, type, pushPayload);
      
      // Update delivery status
      if (pushResult) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            isDelivered: true,
            deliveredAt: new Date()
          }
        });
      }
    }

    return { notification, pushResult };
  }

  /**
   * Send individual push notification to a subscription
   */
  private static async sendPushNotification(
    subscription: any,
    payload: PushNotificationPayload,
    options: {
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      ttl?: number;
    }
  ): Promise<void> {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    const webPushPayload = JSON.stringify({
      title: payload.title,
      body: payload.message,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      image: payload.image,
      data: {
        actionUrl: payload.actionUrl,
        actionData: payload.actionData,
        notificationId: Date.now().toString()
      },
      tag: payload.tag || 'dance-platform',
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      actions: payload.actionUrl ? [
        {
          action: 'open',
          title: 'View',
          icon: '/icons/view.png'
        }
      ] : []
    });

    const webPushOptions = {
      urgency: options.urgency || 'normal',
      TTL: options.ttl || 60 * 60 * 24, // 24 hours default
      vapidDetails: {
        subject: VAPID_EMAIL,
        publicKey: VAPID_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY
      }
    };

    return webpush.sendNotification(pushSubscription, webPushPayload, webPushOptions);
  }

  /**
   * Deactivate invalid push subscriptions
   */
  private static async deactivateInvalidSubscriptions(
    subscriptions: any[],
    errors: any[]
  ): Promise<void> {
    // Identify subscriptions that returned 410 (Gone) or similar errors
    const invalidSubscriptionIds = subscriptions
      .filter((_, index) => {
        const error = errors[index];
        return error && (error.statusCode === 410 || error.statusCode === 404);
      })
      .map(sub => sub.id);

    if (invalidSubscriptionIds.length > 0) {
      await prisma.pushSubscription.updateMany({
        where: {
          id: { in: invalidSubscriptionIds }
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * Check if current time is within user's quiet hours
   */
  private static isInQuietHours(quietHoursStart?: string | null, quietHoursEnd?: string | null): boolean {
    if (!quietHoursStart || !quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    const [startHour, startMin] = quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      // Same day quiet hours (e.g., 22:00 to 23:59)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Generate VAPID keys for push notifications
   * This should be run once during setup
   */
  static generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}
