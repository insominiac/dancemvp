import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { generateDeviceFingerprint } from '@/app/lib/device-fingerprint';
import { UserRole } from '@prisma/client';

// GET /api/auth/sessions - Get active sessions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get all active sessions for the user
    const sessions = await db.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        lastAccessedAt: 'desc'
      },
      select: {
        id: true,
        userRole: true,
        deviceId: true,
        deviceInfo: true,
        ipAddress: true,
        lastAccessedAt: true,
        createdAt: true,
        expiresAt: true
      }
    });

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST /api/auth/sessions - Create or validate a session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userRole, action = 'create' } = body;

    if (!userId || !userRole) {
      return NextResponse.json({ 
        error: 'userId and userRole are required' 
      }, { status: 400 });
    }

    // Validate user role
    if (!Object.values(UserRole).includes(userRole)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    // Generate device fingerprint
    const deviceInfo = generateDeviceFingerprint(request);
    
    // Session expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (action === 'create') {
      // Check for existing session with this role on this device
      const existingSession = await db.session.findFirst({
        where: {
          deviceId: deviceInfo.deviceId,
          userRole,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      // If there's an existing session with the same role on this device, update it
      if (existingSession) {
        const updatedSession = await db.session.update({
          where: { id: existingSession.id },
          data: {
            userId,
            lastAccessedAt: new Date(),
            expiresAt,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent
          }
        });

        return NextResponse.json({ 
          sessionId: updatedSession.id,
          message: 'Session updated successfully' 
        });
      }

      // Deactivate any other active sessions for different roles on this device
      await db.session.updateMany({
        where: {
          deviceId: deviceInfo.deviceId,
          userRole: {
            not: userRole
          },
          isActive: true
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Create new session
      const newSession = await db.session.create({
        data: {
          userId,
          userRole,
          deviceId: deviceInfo.deviceId,
          deviceInfo: deviceInfo.deviceInfo,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          expiresAt
        }
      });

      return NextResponse.json({ 
        sessionId: newSession.id,
        message: 'Session created successfully' 
      }, { status: 201 });

    } else if (action === 'validate') {
      const { sessionId } = body;
      
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required for validation' }, { status: 400 });
      }

      // Find and validate session
      const session = await db.session.findFirst({
        where: {
          id: sessionId,
          userId,
          userRole,
          deviceId: deviceInfo.deviceId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!session) {
        return NextResponse.json({ 
          valid: false, 
          message: 'Invalid or expired session' 
        }, { status: 401 });
      }

      // Update last accessed time
      await db.session.update({
        where: { id: sessionId },
        data: { 
          lastAccessedAt: new Date(),
          ipAddress: deviceInfo.ipAddress
        }
      });

      return NextResponse.json({ 
        valid: true,
        sessionId: session.id,
        message: 'Session is valid' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing session:', error);
    return NextResponse.json({ error: 'Failed to manage session' }, { status: 500 });
  }
}

// DELETE /api/auth/sessions - Terminate sessions
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const action = searchParams.get('action') || 'single';

    if (action === 'single' && !sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if ((action === 'user' || action === 'device') && !userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let updateResult;

    switch (action) {
      case 'single':
        // Terminate specific session
        updateResult = await db.session.update({
          where: { id: sessionId },
          data: { 
            isActive: false,
            updatedAt: new Date()
          }
        });
        break;

      case 'user':
        // Terminate all sessions for a user
        updateResult = await db.session.updateMany({
          where: { 
            userId,
            isActive: true
          },
          data: { 
            isActive: false,
            updatedAt: new Date()
          }
        });
        break;

      case 'device':
        // Terminate all sessions on a specific device for a user
        if (!deviceId) {
          return NextResponse.json({ error: 'deviceId is required for device action' }, { status: 400 });
        }
        
        updateResult = await db.session.updateMany({
          where: { 
            userId,
            deviceId,
            isActive: true
          },
          data: { 
            isActive: false,
            updatedAt: new Date()
          }
        });
        break;

      case 'others':
        // Terminate all other sessions except the current one
        if (!sessionId) {
          return NextResponse.json({ error: 'sessionId is required for others action' }, { status: 400 });
        }
        
        updateResult = await db.session.updateMany({
          where: { 
            userId,
            id: { not: sessionId },
            isActive: true
          },
          data: { 
            isActive: false,
            updatedAt: new Date()
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const terminatedCount = 'count' in updateResult ? updateResult.count : 1;

    return NextResponse.json({ 
      message: `${terminatedCount} session(s) terminated successfully`,
      terminatedCount
    });

  } catch (error) {
    console.error('Error terminating sessions:', error);
    return NextResponse.json({ error: 'Failed to terminate sessions' }, { status: 500 });
  }
}