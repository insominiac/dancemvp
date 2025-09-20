import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { NotificationType, NotificationFrequency } from '@prisma/client';

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all existing preferences
    const existingPreferences = await db.notificationPreference.findMany({
      where: { userId }
    });

    // Create a map for easy lookup
    const preferencesMap = new Map();
    existingPreferences.forEach(pref => {
      preferencesMap.set(pref.type, pref);
    });

    // Generate complete preferences list with defaults for missing types
    const allTypes = Object.values(NotificationType);
    const preferences = allTypes.map(type => {
      const existing = preferencesMap.get(type);
      return existing || {
        id: null, // This will be null for default preferences
        userId,
        type,
        inAppEnabled: true,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        frequency: NotificationFrequency.IMMEDIATE,
        quietHoursStart: null,
        quietHoursEnd: null,
        createdAt: null,
        updatedAt: null
      };
    });

    return NextResponse.json({
      preferences,
      totalTypes: allTypes.length,
      configuredTypes: existingPreferences.length
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// POST /api/notifications/preferences - Create or update notification preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      inAppEnabled = true,
      pushEnabled = true,
      emailEnabled = true,
      smsEnabled = false,
      frequency = NotificationFrequency.IMMEDIATE,
      quietHoursStart,
      quietHoursEnd
    } = body;

    if (!userId || !type) {
      return NextResponse.json({
        error: 'userId and type are required'
      }, { status: 400 });
    }

    // Validate notification type
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Validate frequency
    if (!Object.values(NotificationFrequency).includes(frequency)) {
      return NextResponse.json({ error: 'Invalid notification frequency' }, { status: 400 });
    }

    // Validate quiet hours format if provided
    if (quietHoursStart && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(quietHoursStart)) {
      return NextResponse.json({ error: 'Invalid quiet hours start format. Use HH:MM' }, { status: 400 });
    }

    if (quietHoursEnd && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(quietHoursEnd)) {
      return NextResponse.json({ error: 'Invalid quiet hours end format. Use HH:MM' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert the preference
    const preference = await db.notificationPreference.upsert({
      where: {
        userId_type: {
          userId,
          type: type as NotificationType
        }
      },
      update: {
        inAppEnabled,
        pushEnabled,
        emailEnabled,
        smsEnabled,
        frequency: frequency as NotificationFrequency,
        quietHoursStart,
        quietHoursEnd,
        updatedAt: new Date()
      },
      create: {
        userId,
        type: type as NotificationType,
        inAppEnabled,
        pushEnabled,
        emailEnabled,
        smsEnabled,
        frequency: frequency as NotificationFrequency,
        quietHoursStart,
        quietHoursEnd
      }
    });

    return NextResponse.json(preference, { status: 201 });

  } catch (error) {
    console.error('Error creating/updating notification preference:', error);
    return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Bulk update preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !Array.isArray(preferences)) {
      return NextResponse.json({
        error: 'userId and preferences array are required'
      }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate all preferences before updating
    for (const pref of preferences) {
      if (!Object.values(NotificationType).includes(pref.type)) {
        return NextResponse.json({ 
          error: `Invalid notification type: ${pref.type}` 
        }, { status: 400 });
      }

      if (pref.frequency && !Object.values(NotificationFrequency).includes(pref.frequency)) {
        return NextResponse.json({ 
          error: `Invalid notification frequency: ${pref.frequency}` 
        }, { status: 400 });
      }
    }

    // Update preferences in a transaction
    const results = await db.$transaction(
      preferences.map(pref => 
        db.notificationPreference.upsert({
          where: {
            userId_type: {
              userId,
              type: pref.type as NotificationType
            }
          },
          update: {
            inAppEnabled: pref.inAppEnabled ?? true,
            pushEnabled: pref.pushEnabled ?? true,
            emailEnabled: pref.emailEnabled ?? true,
            smsEnabled: pref.smsEnabled ?? false,
            frequency: (pref.frequency as NotificationFrequency) ?? NotificationFrequency.IMMEDIATE,
            quietHoursStart: pref.quietHoursStart || null,
            quietHoursEnd: pref.quietHoursEnd || null,
            updatedAt: new Date()
          },
          create: {
            userId,
            type: pref.type as NotificationType,
            inAppEnabled: pref.inAppEnabled ?? true,
            pushEnabled: pref.pushEnabled ?? true,
            emailEnabled: pref.emailEnabled ?? true,
            smsEnabled: pref.smsEnabled ?? false,
            frequency: (pref.frequency as NotificationFrequency) ?? NotificationFrequency.IMMEDIATE,
            quietHoursStart: pref.quietHoursStart || null,
            quietHoursEnd: pref.quietHoursEnd || null
          }
        })
      )
    );

    return NextResponse.json({
      message: `${results.length} preferences updated`,
      preferences: results
    });

  } catch (error) {
    console.error('Error bulk updating notification preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

// DELETE /api/notifications/preferences - Reset preferences to defaults
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let deletedCount = 0;

    if (type) {
      // Delete specific preference type
      if (!Object.values(NotificationType).includes(type as NotificationType)) {
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
      }

      const result = await db.notificationPreference.deleteMany({
        where: {
          userId,
          type: type as NotificationType
        }
      });
      deletedCount = result.count;
    } else {
      // Delete all preferences for user
      const result = await db.notificationPreference.deleteMany({
        where: { userId }
      });
      deletedCount = result.count;
    }

    return NextResponse.json({
      message: `${deletedCount} preferences reset to defaults`,
      deletedCount
    });

  } catch (error) {
    console.error('Error deleting notification preferences:', error);
    return NextResponse.json({ error: 'Failed to reset preferences' }, { status: 500 });
  }
}
