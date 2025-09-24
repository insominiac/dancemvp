import { PushNotificationService } from './push-notifications';
import { NotificationType, NotificationPriority } from '@prisma/client';
import prisma from './db';
import { emailService, NewUserWelcomeData, NewUserAdminNotificationData } from './email';

export class NotificationTriggers {
  /**
   * Send booking confirmation notification
   */
  static async sendBookingConfirmation(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          class: {
            include: {
              venue: true
            }
          },
          event: {
            include: {
              venue: true
            }
          }
        }
      });

      if (!booking) return;

      const isClass = booking.classId !== null;
      const entity = booking.class || booking.event;
      
      if (!entity) return;

      const title = 'Booking Confirmed! 🎉';
      const message = `Your booking for "${entity.title}" has been confirmed. ${entity.venue ? `Location: ${entity.venue.name}` : ''}`;

      await PushNotificationService.createAndSendNotification(
        booking.userId,
        NotificationType.BOOKING_CONFIRMATION,
        title,
        message,
        {
          actionUrl: `/dashboard/bookings/${bookingId}`,
          relatedEntityId: bookingId,
          relatedEntityType: 'booking',
          priority: 'HIGH',
          pushPayload: {
            requireInteraction: true,
            icon: '/icons/confirmation.png'
          }
        }
      );

    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  }

  /**
   * Send class reminder notification (1 hour before)
   */
  static async sendClassReminder(classId: string, userIds: string[]): Promise<void> {
    try {
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          venue: true,
          classInstructors: {
            include: {
              instructor: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      if (!classInfo || userIds.length === 0) return;

      const instructor = classInfo.classInstructors[0]?.instructor?.user?.fullName || 'Instructor';
      const title = 'Class Starting Soon! ⏰';
      const message = `"${classInfo.title}" with ${instructor} starts in 1 hour. ${classInfo.venue ? `At ${classInfo.venue.name}` : ''}`;

      await PushNotificationService.sendToUsers(
        userIds,
        {
          title,
          message: message,
          actionUrl: `/classes/${classId}`,
          actionData: { classId, reminderType: 'class' },
          icon: '/icons/class-reminder.png',
          tag: `class-reminder-${classId}`,
          requireInteraction: true
        },
        { urgency: 'high' }
      );

      // Also create database notifications
      const notifications = userIds.map(userId => ({
        userId,
        type: NotificationType.CLASS_REMINDER,
        title,
        message: message,
        priority: NotificationPriority.HIGH,
        actionUrl: `/classes/${classId}`,
        relatedEntityId: classId,
        relatedEntityType: 'class',
        deliveryMethod: 'PUSH' as const,
        isDelivered: true,
        deliveredAt: new Date()
      }));

      await prisma.notification.createMany({
        data: notifications
      });

    } catch (error) {
      console.error('Error sending class reminder:', error);
    }
  }

  /**
   * Send event reminder notification (1 day and 1 hour before)
   */
  static async sendEventReminder(eventId: string, userIds: string[], reminderType: '24h' | '1h'): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          venue: true,
          organizer: true
        }
      });

      if (!event || userIds.length === 0) return;

      const timeText = reminderType === '24h' ? 'tomorrow' : 'in 1 hour';
      const title = `Event ${reminderType === '24h' ? 'Tomorrow' : 'Starting Soon'}! 🎭`;
      const message = `"${event.title}" is ${timeText}. ${event.venue ? `At ${event.venue.name}` : ''}`;

      await PushNotificationService.sendToUsers(
        userIds,
        {
          title,
          message: message,
          actionUrl: `/events/${eventId}`,
          actionData: { eventId, reminderType },
          icon: '/icons/event-reminder.png',
          tag: `event-reminder-${reminderType}-${eventId}`,
          requireInteraction: reminderType === '1h'
        },
        { 
          urgency: reminderType === '1h' ? 'high' : 'normal',
          ttl: reminderType === '24h' ? 60 * 60 * 24 : 60 * 60 * 2 // 24h or 2h TTL
        }
      );

      // Create database notifications
      const notifications = userIds.map(userId => ({
        userId,
        type: NotificationType.EVENT_REMINDER,
        title,
        message: message,
        priority: reminderType === '1h' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
        actionUrl: `/events/${eventId}`,
        relatedEntityId: eventId,
        relatedEntityType: 'event',
        deliveryMethod: 'PUSH' as const,
        isDelivered: true,
        deliveredAt: new Date()
      }));

      await prisma.notification.createMany({
        data: notifications
      });

    } catch (error) {
      console.error('Error sending event reminder:', error);
    }
  }

  /**
   * Send payment confirmation notification
   */
  static async sendPaymentConfirmation(bookingId: string, transactionId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          class: true,
          event: true,
          transactions: {
            where: { id: transactionId }
          }
        }
      });

      if (!booking || booking.transactions.length === 0) return;

      const transaction = booking.transactions[0];
      const entity = booking.class || booking.event;
      
      if (!entity) return;

      const title = 'Payment Confirmed! 💳';
      const message = `Your payment of $${transaction.amount} for "${entity.title}" has been processed successfully.`;

      await PushNotificationService.createAndSendNotification(
        booking.userId,
        NotificationType.PAYMENT_CONFIRMATION,
        title,
        message,
        {
          actionUrl: `/dashboard/transactions/${transactionId}`,
          relatedEntityId: transactionId,
          relatedEntityType: 'transaction',
          priority: 'NORMAL',
          pushPayload: {
            icon: '/icons/payment-success.png'
          }
        }
      );

    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailed(bookingId: string, reason?: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          class: true,
          event: true
        }
      });

      if (!booking) return;

      const entity = booking.class || booking.event;
      if (!entity) return;

      const title = 'Payment Failed ❌';
      const message = `Your payment for "${entity.title}" could not be processed. ${reason ? `Reason: ${reason}` : 'Please try again or contact support.'}`;

      await PushNotificationService.createAndSendNotification(
        booking.userId,
        NotificationType.PAYMENT_FAILED,
        title,
        message,
        {
          actionUrl: `/dashboard/bookings/${bookingId}/payment`,
          relatedEntityId: bookingId,
          relatedEntityType: 'booking',
          priority: 'HIGH',
          pushPayload: {
            requireInteraction: true,
            icon: '/icons/payment-failed.png'
          }
        }
      );

    } catch (error) {
      console.error('Error sending payment failed notification:', error);
    }
  }

  /**
   * Send class cancelled notification
   */
  static async sendClassCancelled(classId: string, reason?: string): Promise<void> {
    try {
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            include: { user: true }
          },
          venue: true
        }
      });

      if (!classInfo || classInfo.bookings.length === 0) return;

      const userIds = classInfo.bookings.map(b => b.userId);
      const title = 'Class Cancelled 🚫';
      const message = `"${classInfo.title}" has been cancelled. ${reason ? `Reason: ${reason}` : 'You will be refunded automatically.'}`;

      await PushNotificationService.sendToUsers(
        userIds,
        {
          title,
          message: message,
          actionUrl: `/classes/${classId}`,
          actionData: { classId, type: 'cancellation' },
          icon: '/icons/class-cancelled.png',
          requireInteraction: true,
          tag: `class-cancelled-${classId}`
        },
        { urgency: 'high' }
      );

      // Create database notifications
      const notifications = userIds.map(userId => ({
        userId,
        type: NotificationType.CLASS_CANCELLED,
        title,
        message: message,
        priority: NotificationPriority.URGENT,
        actionUrl: `/classes/${classId}`,
        relatedEntityId: classId,
        relatedEntityType: 'class',
        deliveryMethod: 'PUSH' as const,
        isDelivered: true,
        deliveredAt: new Date()
      }));

      await prisma.notification.createMany({
        data: notifications
      });

    } catch (error) {
      console.error('Error sending class cancelled notification:', error);
    }
  }

  /**
   * Send waitlist spot available notification
   */
  static async sendWaitlistSpotAvailable(classId: string, userId: string): Promise<void> {
    try {
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          venue: true
        }
      });

      if (!classInfo) return;

      const title = 'Spot Available! 🎯';
      const message = `A spot just opened up in "${classInfo.title}". Book now before it\'s gone!`;

      await PushNotificationService.createAndSendNotification(
        userId,
        NotificationType.WAITLIST_SPOT_AVAILABLE,
        title,
        message,
        {
          actionUrl: `/classes/${classId}/book`,
          relatedEntityId: classId,
          relatedEntityType: 'class',
          priority: 'URGENT',
          pushPayload: {
            requireInteraction: true,
            icon: '/icons/spot-available.png',
            tag: `waitlist-${classId}-${userId}`
          }
        }
      );

    } catch (error) {
      console.error('Error sending waitlist notification:', error);
    }
  }

  /**
   * Send instructor message notification
   */
  static async sendInstructorMessage(
    fromUserId: string,
    toUserIds: string[],
    subject: string,
    message: string,
    classId?: string
  ): Promise<void> {
    try {
      const fromUser = await prisma.user.findUnique({
        where: { id: fromUserId }
      });

      if (!fromUser || toUserIds.length === 0) return;

      const title = `Message from ${fromUser.fullName} 💬`;
      const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message;

      await PushNotificationService.sendToUsers(
        toUserIds,
        {
          title,
          message: `${subject}: ${truncatedMessage}`,
          actionUrl: `/dashboard/messages`,
          actionData: { fromUserId, classId },
          icon: '/icons/message.png'
        }
      );

      // Create database notifications
      const notifications = toUserIds.map(userId => ({
        userId,
        type: NotificationType.INSTRUCTOR_MESSAGE,
        title,
        message: `${subject}: ${truncatedMessage}`,
        priority: NotificationPriority.NORMAL,
        actionUrl: `/dashboard/messages`,
        relatedEntityId: fromUserId,
        relatedEntityType: 'user',
        deliveryMethod: 'PUSH' as const,
        isDelivered: true,
        deliveredAt: new Date()
      }));

      await prisma.notification.createMany({
        data: notifications
      });

    } catch (error) {
      console.error('Error sending instructor message notification:', error);
    }
  }

  /**
   * Send system announcement
   */
  static async sendSystemAnnouncement(
    title: string,
    message: string,
    targetUserIds?: string[],
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
  ): Promise<void> {
    try {
      let userIds: string[];

      if (targetUserIds && targetUserIds.length > 0) {
        userIds = targetUserIds;
      } else {
        // Send to all active users
        const users = await prisma.user.findMany({
          where: { 
            // Add any criteria for active users
          },
          select: { id: true }
        });
        userIds = users.map(u => u.id);
      }

      if (userIds.length === 0) return;

      const urgency = priority === 'URGENT' || priority === 'HIGH' ? 'high' : 'normal';

      await PushNotificationService.sendToUsers(
        userIds,
        {
          title: `📢 ${title}`,
          message: message,
          actionUrl: '/announcements',
          icon: '/icons/announcement.png',
          requireInteraction: priority === 'URGENT',
          tag: 'system-announcement'
        },
        { urgency }
      );

      // Create database notifications
      const notifications = userIds.map(userId => ({
        userId,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: `📢 ${title}`,
        message: message,
        priority: priority as NotificationPriority,
        actionUrl: '/announcements',
        deliveryMethod: 'PUSH' as const,
        isDelivered: true,
        deliveredAt: new Date()
      }));

      // Insert in batches to avoid overwhelming the database
      const batchSize = 1000;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        await prisma.notification.createMany({
          data: batch
        });
      }

    } catch (error) {
      console.error('Error sending system announcement:', error);
    }
  }

  /**
   * Send notifications for new user registration
   */
  static async sendNewUserRegistrationNotifications(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true
        }
      });

      if (!user) {
        console.error('User not found for new registration notification:', userId);
        return;
      }

      // Get total user count for admin notification
      const totalUsers = await prisma.user.count();

      // Prepare data for welcome email
      const welcomeData: NewUserWelcomeData = {
        user: {
          name: user.fullName,
          email: user.email,
          id: user.id
        }
      };

      // Send welcome email to new user
      const welcomeEmailSent = await emailService.sendWelcomeEmail(welcomeData);
      if (welcomeEmailSent) {
        console.log(`✅ Welcome email sent to: ${user.email}`);
      } else {
        console.error(`❌ Failed to send welcome email to: ${user.email}`);
      }

      // Get admin emails for notifications
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, fullName: true }
      });

      // Prepare data for admin notification
      const adminNotificationData: NewUserAdminNotificationData = {
        user: {
          name: user.fullName,
          email: user.email,
          id: user.id,
          registrationDate: user.createdAt.toISOString()
        },
        totalUsers
      };

      // Send admin notifications
      for (const admin of adminUsers) {
        try {
          const adminEmailSent = await emailService.sendNewUserAdminNotification(
            adminNotificationData,
            admin.email
          );
          if (adminEmailSent) {
            console.log(`✅ Admin notification sent to: ${admin.email}`);
          } else {
            console.error(`❌ Failed to send admin notification to: ${admin.email}`);
          }
        } catch (error) {
          console.error(`Error sending admin notification to ${admin.email}:`, error);
        }
      }

      // Create in-app notification for admins
      if (adminUsers.length > 0) {
        // Get admin user IDs from the admin users we already fetched
        const adminUserDetails = await prisma.user.findMany({
          where: {
            email: { in: adminUsers.map(admin => admin.email) }
          },
          select: { id: true }
        });

        const adminIds = adminUserDetails.map(admin => admin.id);

        if (adminIds.length > 0) {
          const title = 'New User Registration 👤';
          const message = `${user.fullName} (${user.email}) has joined DanceLink. Total users: ${totalUsers}`;

          // Create database notifications for admins
          const notifications = adminIds.map(adminId => ({
            userId: adminId,
            type: 'SYSTEM_ANNOUNCEMENT' as any, // Using SYSTEM_ANNOUNCEMENT as fallback since NEW_USER doesn't exist
            title,
            message,
            priority: 'NORMAL' as any,
            actionUrl: '/admin/users',
            relatedEntityId: userId,
            relatedEntityType: 'user',
            deliveryMethod: 'IN_APP' as const,
            isDelivered: true,
            deliveredAt: new Date()
          }));

          await prisma.notification.createMany({
            data: notifications
          });

          console.log(`✅ In-app notifications created for ${adminIds.length} admins`);
        }
      }

    } catch (error) {
      console.error('Error sending new user registration notifications:', error);
    }
  }

  /**
   * Process scheduled notifications
   * This should be called by a cron job or scheduled task
   */
  static async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      
      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          scheduledFor: {
            lte: now
          },
          isDelivered: false
        },
        include: {
          user: true
        }
      });

      for (const notification of scheduledNotifications) {
        try {
          const payload = {
            title: notification.title,
            message: notification.message,
            actionUrl: notification.actionUrl || undefined,
            actionData: notification.actionData ? JSON.parse(notification.actionData) : undefined,
            requireInteraction: notification.priority === NotificationPriority.URGENT
          };

          const result = await PushNotificationService.sendToUser(
            notification.userId,
            payload
          );

          // Mark as delivered if successful
          if (result.success > 0) {
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                isDelivered: true,
                deliveredAt: new Date()
              }
            });
          }

        } catch (error) {
          console.error(`Error processing scheduled notification ${notification.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }
}
