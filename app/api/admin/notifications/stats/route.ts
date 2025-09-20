import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/admin/notifications/stats - Get notification statistics
export async function GET(request: NextRequest) {
  try {
    // Get basic counts
    const [totalSent, totalRead, totalUnread] = await Promise.all([
      db.notification.count(),
      db.notification.count({ where: { isRead: true } }),
      db.notification.count({ where: { isRead: false } })
    ]);

    // Calculate read rate
    const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;

    // Get recent activity count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentActivity = await db.notification.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    // Get active users (users who have received notifications in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db.notification.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: { userId: true },
      distinct: ['userId']
    });

    const activeUsers = activeUsersResult.length;

    return NextResponse.json({
      totalSent,
      totalRead,
      totalUnread,
      readRate,
      recentActivity,
      activeUsers
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}