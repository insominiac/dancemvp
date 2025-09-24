import { NextRequest, NextResponse } from 'next/server';
// import { PushNotificationService } from '@/app/lib/push-notifications';
import { NotificationTriggers } from '@/app/lib/notification-triggers';

// POST /api/test/notifications - Create test notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type = 'test' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Handle different test notification types
    switch (type) {
      case 'new_user_registration':
        try {
          await NotificationTriggers.sendNewUserRegistrationNotifications(userId);
          return NextResponse.json({
            success: true,
            message: `New user registration notifications sent for user ${userId}`,
            note: 'Check console logs and email provider for delivery status'
          });
        } catch (error) {
          console.error('Error testing new user registration notifications:', error);
          return NextResponse.json({
            error: 'Failed to send new user registration notifications',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      
      default:
        // Other test notifications temporarily disabled until auth is fully implemented
        console.log(`Creating test notification: ${type} for user: ${userId}`);
        return NextResponse.json({
          success: true,
          message: `Test notification (${type}) would be created for user ${userId}`,
          note: 'Most notification types will be fully functional once authentication is implemented'
        });
    }

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json({
      error: 'Failed to create test notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/test/notifications - Get available test notification types
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      {
        type: 'booking_confirmation',
        name: 'Booking Confirmation',
        description: 'Test booking confirmation notification'
      },
      {
        type: 'class_reminder',
        name: 'Class Reminder',
        description: 'Test class starting soon notification'
      },
      {
        type: 'payment_success',
        name: 'Payment Success',
        description: 'Test payment confirmation notification'
      },
      {
        type: 'system_announcement',
        name: 'System Announcement',
        description: 'Test system announcement notification'
      },
      {
        type: 'waitlist_available',
        name: 'Waitlist Spot Available',
        description: 'Test waitlist spot available notification'
      },
      {
        type: 'new_user_registration',
        name: 'New User Registration',
        description: 'Test new user welcome email and admin notifications'
      },
      {
        type: 'test',
        name: 'Generic Test',
        description: 'Generic test notification'
      }
    ],
    note: 'Notification system will be fully functional once authentication is implemented'
  });
}
