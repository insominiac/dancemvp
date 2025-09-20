import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// POST /api/auth/sessions/cleanup - Clean up expired sessions
export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    
    // Deactivate expired sessions
    const expiredSessionsResult = await db.session.updateMany({
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

    // Optional: Delete very old sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deletedSessionsResult = await db.session.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo
        },
        isActive: false
      }
    });

    return NextResponse.json({
      message: 'Session cleanup completed successfully',
      expiredSessions: expiredSessionsResult.count,
      deletedSessions: deletedSessionsResult.count
    });

  } catch (error) {
    console.error('Error during session cleanup:', error);
    return NextResponse.json({ error: 'Failed to clean up sessions' }, { status: 500 });
  }
}