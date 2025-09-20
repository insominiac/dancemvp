import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// POST /api/admin/notifications/bulk - Bulk actions on notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationIds } = body;

    if (!action || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({
        error: 'action and notificationIds array are required'
      }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'markRead':
        result = await db.notification.updateMany({
          where: {
            id: { in: notificationIds }
          },
          data: {
            isRead: true,
            updatedAt: new Date()
          }
        });
        break;

      case 'markUnread':
        result = await db.notification.updateMany({
          where: {
            id: { in: notificationIds }
          },
          data: {
            isRead: false,
            updatedAt: new Date()
          }
        });
        break;

      case 'delete':
        result = await db.notification.deleteMany({
          where: {
            id: { in: notificationIds }
          }
        });
        break;

      default:
        return NextResponse.json({
          error: 'Invalid action. Supported actions: markRead, markUnread, delete'
        }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully ${action === 'markRead' ? 'marked as read' : action === 'markUnread' ? 'marked as unread' : 'deleted'} ${result.count} notifications`,
      affectedCount: result.count
    });

  } catch (error) {
    console.error('Error performing bulk notification action:', error);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}