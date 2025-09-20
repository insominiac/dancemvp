import { NextRequest } from 'next/server';
import db from './db';
import { generateDeviceFingerprint } from './device-fingerprint';
import { UserRole } from '@prisma/client';

export interface SessionValidationResult {
  isValid: boolean;
  sessionId?: string;
  userId?: string;
  userRole?: UserRole;
  user?: any;
  error?: string;
  conflictingRole?: UserRole;
}

/**
 * Validate session based on cookies and device fingerprint
 */
export async function validateSession(
  request: NextRequest,
  requiredRole?: UserRole
): Promise<SessionValidationResult> {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value;
    const userId = request.cookies.get('user_id')?.value;
    const userRole = request.cookies.get('user_role')?.value as UserRole;

    if (!sessionId || !userId || !userRole) {
      return {
        isValid: false,
        error: 'Missing session credentials'
      };
    }

    // Generate device fingerprint for validation
    const deviceInfo = generateDeviceFingerprint(request);

    // Find the session in database
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
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isVerified: true,
            profileImage: true
          }
        }
      }
    });

    if (!session) {
      // Check if there's a conflicting session with different role
      const conflictingSession = await db.session.findFirst({
        where: {
          deviceId: deviceInfo.deviceId,
          userRole: {
            not: userRole
          },
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return {
        isValid: false,
        error: conflictingSession 
          ? 'Session conflict: Another role is active on this device'
          : 'Invalid or expired session',
        conflictingRole: conflictingSession?.userRole
      };
    }

    // Check if the required role matches
    if (requiredRole && session.userRole !== requiredRole) {
      return {
        isValid: false,
        error: `Access denied: ${requiredRole} role required`,
        sessionId: session.id,
        userId: session.userId,
        userRole: session.userRole
      };
    }

    // Update last accessed time
    await db.session.update({
      where: { id: sessionId },
      data: { 
        lastAccessedAt: new Date(),
        ipAddress: deviceInfo.ipAddress
      }
    });

    return {
      isValid: true,
      sessionId: session.id,
      userId: session.userId,
      userRole: session.userRole,
      user: session.user
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return {
      isValid: false,
      error: 'Internal session validation error'
    };
  }
}

/**
 * Create a new session and invalidate conflicting ones
 */
export async function createSession(
  request: NextRequest,
  userId: string,
  userRole: UserRole
): Promise<{ sessionId: string; error?: string }> {
  try {
    const deviceInfo = generateDeviceFingerprint(request);
    
    // Session expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

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

    // Use upsert to handle the unique constraint properly
    // First, try to find an existing session with the same deviceId and userRole
    const existingSession = await db.session.findUnique({
      where: {
        deviceId_userRole: {
          deviceId: deviceInfo.deviceId,
          userRole: userRole
        }
      }
    });

    let newSession;
    if (existingSession) {
      // Update the existing session instead of creating a new one
      newSession = await db.session.update({
        where: {
          id: existingSession.id
        },
        data: {
          userId,
          deviceInfo: deviceInfo.deviceInfo,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          isActive: true,
          expiresAt,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        }
      });
    } else {
      // Create a new session
      newSession = await db.session.create({
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
    }
    
    const sessionId = newSession.id;

    return { sessionId };

  } catch (error) {
    console.error('Error creating session:', error);
    return { 
      sessionId: '',
      error: 'Failed to create session'
    };
  }
}

/**
 * Terminate a session
 */
export async function terminateSession(sessionId: string): Promise<boolean> {
  try {
    await db.session.update({
      where: { id: sessionId },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error terminating session:', error);
    return false;
  }
}

/**
 * Terminate all sessions for a user except the current one
 */
export async function terminateOtherSessions(
  userId: string,
  currentSessionId: string
): Promise<number> {
  try {
    const result = await db.session.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
    return result.count;
  } catch (error) {
    console.error('Error terminating other sessions:', error);
    return 0;
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  try {
    return await db.session.findMany({
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
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
}

/**
 * Check for role conflicts on a device
 */
export async function checkRoleConflict(
  request: NextRequest,
  targetRole: UserRole
): Promise<{ hasConflict: boolean; conflictingRole?: UserRole; conflictingSession?: string }> {
  try {
    const deviceInfo = generateDeviceFingerprint(request);
    
    const conflictingSession = await db.session.findFirst({
      where: {
        deviceId: deviceInfo.deviceId,
        userRole: {
          not: targetRole
        },
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return {
      hasConflict: !!conflictingSession,
      conflictingRole: conflictingSession?.userRole,
      conflictingSession: conflictingSession?.id
    };

  } catch (error) {
    console.error('Error checking role conflict:', error);
    return { hasConflict: false };
  }
}