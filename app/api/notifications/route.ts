import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { NotificationType, NotificationPriority, DeliveryMethod } from '@prisma/client';

// GET /api/notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build where clause
    const where: any = { userId };
    
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }
    
    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      where.type = type as NotificationType;
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true
          }
        }
      }
    });

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      priority = NotificationPriority.NORMAL,
      actionUrl,
      actionData,
      deliveryMethod = DeliveryMethod.IN_APP,
      scheduledFor,
      relatedEntityId,
      relatedEntityType
    } = body;

    // Validation
    if (!userId || !type || !title || !message) {
      return NextResponse.json({
        error: 'userId, type, title, and message are required'
      }, { status: 400 });
    }

    // Validate enum values
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    if (!Object.values(NotificationPriority).includes(priority)) {
      return NextResponse.json({ error: 'Invalid notification priority' }, { status: 400 });
    }

    if (!Object.values(DeliveryMethod).includes(deliveryMethod)) {
      return NextResponse.json({ error: 'Invalid delivery method' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check user's notification preferences
    const preferences = await db.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId,
          type: type as NotificationType
        }
      }
    });

    // If user has disabled this type of notification, don't create it
    if (preferences && !preferences.inAppEnabled && deliveryMethod === DeliveryMethod.IN_APP) {
      return NextResponse.json({
        message: 'Notification type disabled by user preferences'
      }, { status: 200 });
    }

    const notification = await db.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        title,
        message,
        priority: priority as NotificationPriority,
        actionUrl,
        actionData: actionData ? JSON.stringify(actionData) : null,
        deliveryMethod: deliveryMethod as DeliveryMethod,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        relatedEntityId,
        relatedEntityType
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // TODO: Trigger actual notification delivery based on deliveryMethod
    // This could include push notifications, emails, etc.

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PATCH /api/notifications - Bulk mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds, markAsRead = true } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const where: any = { userId };
    
    if (notificationIds && notificationIds.length > 0) {
      where.id = { in: notificationIds };
    }

    const result = await db.notification.updateMany({
      where,
      data: {
        isRead: markAsRead,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: `${result.count} notifications updated`,
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
