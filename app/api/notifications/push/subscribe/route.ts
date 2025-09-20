import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// POST /api/notifications/push/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription } = body;

    if (!userId || !subscription) {
      return NextResponse.json({
        error: 'userId and subscription are required'
      }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({
        error: 'Invalid subscription format'
      }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user agent from headers
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Check if this subscription already exists
    const existingSubscription = await db.pushSubscription.findFirst({
      where: {
        userId,
        endpoint: endpoint
      }
    });

    let pushSubscription;

    if (existingSubscription) {
      // Update existing subscription
      pushSubscription = await db.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          isActive: true,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new subscription
      pushSubscription = await db.pushSubscription.create({
        data: {
          userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          isActive: true
        }
      });
    }

    return NextResponse.json({
      message: 'Push subscription saved successfully',
      subscription: pushSubscription
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

// GET /api/notifications/push/subscribe - Get user's push subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const subscriptions = await db.pushSubscription.findMany({
      where: { 
        userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      subscriptions,
      count: subscriptions.length
    });

  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// DELETE /api/notifications/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const endpoint = searchParams.get('endpoint');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let deletedCount = 0;

    if (endpoint) {
      // Delete specific subscription by endpoint
      const result = await db.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint
        }
      });
      deletedCount = result.count;
    } else {
      // Delete all subscriptions for user (complete unsubscribe)
      const result = await db.pushSubscription.deleteMany({
        where: { userId }
      });
      deletedCount = result.count;
    }

    return NextResponse.json({
      message: `${deletedCount} subscriptions removed`,
      deletedCount
    });

  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
