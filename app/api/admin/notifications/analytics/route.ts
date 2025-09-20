import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/admin/notifications/analytics - Get detailed analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get overview data
    const [totalSent, totalRead, totalUnread] = await Promise.all([
      db.notification.count({
        where: { createdAt: { gte: startDate } }
      }),
      db.notification.count({
        where: { 
          createdAt: { gte: startDate },
          isRead: true 
        }
      }),
      db.notification.count({
        where: { 
          createdAt: { gte: startDate },
          isRead: false 
        }
      })
    ]);

    const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;

    // Get active users in time range
    const activeUsersResult = await db.notification.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { userId: true },
      distinct: ['userId']
    });

    const activeUsers = activeUsersResult.length;

    // Calculate average response time (mock data for now)
    const avgResponseTime = 15; // minutes

    // Get performance by type
    const typeStats = await db.notification.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    const byType = await Promise.all(
      typeStats.map(async (stat) => {
        const readCount = await db.notification.count({
          where: {
            type: stat.type,
            isRead: true,
            createdAt: { gte: startDate }
          }
        });
        
        return {
          type: stat.type,
          count: stat._count.id,
          readRate: stat._count.id > 0 ? (readCount / stat._count.id) * 100 : 0
        };
      })
    );

    // Get performance by priority
    const priorityStats = await db.notification.groupBy({
      by: ['priority'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    const byPriority = await Promise.all(
      priorityStats.map(async (stat) => {
        const readCount = await db.notification.count({
          where: {
            priority: stat.priority,
            isRead: true,
            createdAt: { gte: startDate }
          }
        });
        
        return {
          priority: stat.priority,
          count: stat._count.id,
          readRate: stat._count.id > 0 ? (readCount / stat._count.id) * 100 : 0
        };
      })
    );

    // Mock device data (would need to be tracked separately in real implementation)
    const devices = [
      { device: 'mobile', count: Math.floor(activeUsers * 0.6), percentage: 60 },
      { device: 'desktop', count: Math.floor(activeUsers * 0.3), percentage: 30 },
      { device: 'tablet', count: Math.floor(activeUsers * 0.1), percentage: 10 }
    ];

    // Get top performing notifications (mock data)
    const topNotifications = await db.notification.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        type: true,
        title: true,
        isRead: true
      },
      take: 100
    });

    // Group by title and calculate performance
    const notificationPerformance = new Map();
    topNotifications.forEach(notification => {
      const key = notification.title;
      if (!notificationPerformance.has(key)) {
        notificationPerformance.set(key, {
          type: notification.type,
          title: notification.title,
          sent: 0,
          read: 0
        });
      }
      const perf = notificationPerformance.get(key);
      perf.sent += 1;
      if (notification.isRead) perf.read += 1;
    });

    const topPerformers = Array.from(notificationPerformance.values())
      .map(perf => ({
        type: perf.type,
        title: perf.title,
        readRate: perf.sent > 0 ? (perf.read / perf.sent) * 100 : 0,
        clickRate: Math.random() * 20, // Mock click rate
        sentCount: perf.sent
      }))
      .sort((a, b) => b.readRate - a.readRate)
      .slice(0, 10);

    // Get recent activity
    const recentNotifications = await db.notification.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        createdAt: true,
        isRead: true
      }
    });

    // Group by title for recent activity summary
    const recentActivityMap = new Map();
    recentNotifications.forEach(notification => {
      const key = notification.title;
      if (!recentActivityMap.has(key)) {
        recentActivityMap.set(key, {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          createdAt: notification.createdAt,
          recipientCount: 0,
          readCount: 0
        });
      }
      const activity = recentActivityMap.get(key);
      activity.recipientCount += 1;
      if (notification.isRead) activity.readCount += 1;
    });

    const recentActivity = Array.from(recentActivityMap.values());

    // Mock trends data (would need proper time-series implementation)
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        sent: Math.floor(Math.random() * 100) + 20,
        read: Math.floor(Math.random() * 80) + 10,
        clicked: Math.floor(Math.random() * 40) + 5
      });
    }

    return NextResponse.json({
      overview: {
        totalSent,
        totalRead,
        totalUnread,
        readRate,
        avgResponseTime,
        activeUsers
      },
      trends,
      byType,
      byPriority,
      devices,
      topPerformers,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching notification analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}