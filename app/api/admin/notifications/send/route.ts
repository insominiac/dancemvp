import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { NotificationTriggers } from '@/app/lib/notification-triggers';

// POST /api/admin/notifications/send - Send notifications to multiple users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userIds,
      type,
      title,
      message,
      priority = 'NORMAL',
      actionUrl,
      scheduledFor
    } = body;

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        error: 'userIds array is required and cannot be empty'
      }, { status: 400 });
    }

    if (!type || !title || !message) {
      return NextResponse.json({
        error: 'type, title, and message are required'
      }, { status: 400 });
    }

    // Validate that users exist
    const validUsers = await db.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: { id: true }
    });

    if (validUsers.length === 0) {
      return NextResponse.json({
        error: 'No valid users found'
      }, { status: 400 });
    }

    const validUserIds = validUsers.map(u => u.id);
    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

    // Create notifications for all valid users
    const notifications = validUserIds.map(userId => ({
      userId,
      type,
      title,
      message,
      priority,
      actionUrl: actionUrl || null,
      scheduledFor: scheduledDate,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Batch insert notifications
    await db.notification.createMany({
      data: notifications
    });

    // If not scheduled for later, trigger immediate delivery
    if (!scheduledDate || scheduledDate <= new Date()) {
      try {
        // Use the notification triggers system for push notifications
        await NotificationTriggers.sendSystemAnnouncement(
          title,
          message,
          validUserIds,
          priority as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
        );
      } catch (pushError) {
        console.error('Error sending push notifications:', pushError);
        // Continue even if push notifications fail
      }
    }

    return NextResponse.json({
      message: `Notifications ${scheduledDate ? 'scheduled' : 'sent'} successfully`,
      recipientCount: validUserIds.length,
      scheduledFor: scheduledDate?.toISOString() || null
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}