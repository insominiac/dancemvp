import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/admin/notifications - Get all notifications for admin view
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');

    // Build where clause
    const where: any = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (isRead !== null && isRead !== 'all') {
      where.isRead = isRead === 'true';
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
            email: true,
            profileImage: true
          }
        }
      }
    });

    return NextResponse.json({
      notifications,
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/admin/notifications - Create notification (for admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      priority = 'NORMAL',
      actionUrl,
      scheduledFor
    } = body;

    // Validation
    if (!userId || !type || !title || !message) {
      return NextResponse.json({
        error: 'userId, type, title, and message are required'
      }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        actionUrl,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
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

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Error creating admin notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}