import db from './db';

/**
 * Clean up expired and old sessions
 * This function should be called periodically (e.g., via cron job)
 */
export async function cleanupSessions() {
  try {
    const now = new Date();
    
    console.log('Starting session cleanup...');

    // 1. Deactivate expired sessions
    const expiredResult = await db.session.updateMany({
      where: {
        expiresAt: {
          lte: now
        },
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: now
      }
    });

    console.log(`Deactivated ${expiredResult.count} expired sessions`);

    // 2. Delete very old inactive sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleteResult = await db.session.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo
        },
        isActive: false
      }
    });

    console.log(`Deleted ${deleteResult.count} old inactive sessions`);

    // 3. Optional: Clean up sessions for deleted users
    const orphanedResult = await db.session.deleteMany({
      where: {
        user: null
      }
    });

    console.log(`Deleted ${orphanedResult.count} orphaned sessions`);

    const totalCleaned = expiredResult.count + deleteResult.count + orphanedResult.count;
    console.log(`Session cleanup completed. Total sessions processed: ${totalCleaned}`);

    return {
      expired: expiredResult.count,
      deleted: deleteResult.count,
      orphaned: orphanedResult.count,
      total: totalCleaned
    };

  } catch (error) {
    console.error('Error during session cleanup:', error);
    throw error;
  }
}

/**
 * Get session statistics for monitoring
 */
export async function getSessionStats() {
  try {
    const [
      totalSessions,
      activeSessions,
      expiredSessions,
      sessionsLastHour,
      sessionsByRole
    ] = await Promise.all([
      db.session.count(),
      db.session.count({ where: { isActive: true, expiresAt: { gt: new Date() } } }),
      db.session.count({ where: { isActive: false } }),
      db.session.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      }),
      db.session.groupBy({
        by: ['userRole'],
        where: {
          isActive: true,
          expiresAt: { gt: new Date() }
        },
        _count: true
      })
    ]);

    return {
      total: totalSessions,
      active: activeSessions,
      expired: expiredSessions,
      recentlyCreated: sessionsLastHour,
      byRole: sessionsByRole.map(item => ({
        role: item.userRole,
        count: item._count
      }))
    };

  } catch (error) {
    console.error('Error fetching session stats:', error);
    throw error;
  }
}

/**
 * Force expire all sessions for a specific user
 */
export async function expireUserSessions(userId: string) {
  try {
    const result = await db.session.updateMany({
      where: {
        userId,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    console.log(`Expired ${result.count} sessions for user ${userId}`);
    return result.count;

  } catch (error) {
    console.error('Error expiring user sessions:', error);
    throw error;
  }
}

/**
 * Get active sessions for a user with detailed information
 */
export async function getUserSessionDetails(userId: string) {
  try {
    return await db.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        userRole: true,
        deviceId: true,
        deviceInfo: true,
        ipAddress: true,
        lastAccessedAt: true,
        createdAt: true,
        expiresAt: true,
        userAgent: true
      },
      orderBy: {
        lastAccessedAt: 'desc'
      }
    });

  } catch (error) {
    console.error('Error fetching user session details:', error);
    throw error;
  }
}