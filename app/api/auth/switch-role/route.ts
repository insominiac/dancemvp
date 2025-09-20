import { NextRequest, NextResponse } from 'next/server';
import { validateSession, createSession, terminateSession } from '@/app/lib/session-middleware';
import { UserRole } from '@prisma/client';
import db from '@/app/lib/db';

// POST /api/auth/switch-role - Switch user role session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetRole } = body;

    if (!targetRole || !Object.values(UserRole).includes(targetRole)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid target role'
      }, { status: 400 });
    }

    // Validate current session
    const sessionValidation = await validateSession(request);
    
    if (!sessionValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: sessionValidation.error || 'Invalid session'
      }, { status: 401 });
    }

    const { userId, sessionId } = sessionValidation;

    // Get user to check permissions
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true, fullName: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Validate role switching permissions
    if (targetRole === UserRole.ADMIN && user.role !== UserRole.ADMIN) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions for admin role'
      }, { status: 403 });
    }

    if (targetRole === UserRole.INSTRUCTOR && user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions for instructor role'
      }, { status: 403 });
    }

    // If switching to the same role, just return success
    if (sessionValidation.userRole === targetRole) {
      return NextResponse.json({
        success: true,
        sessionId: sessionValidation.sessionId,
        message: 'Already in the requested role'
      });
    }

    // Terminate current session
    if (sessionId) {
      await terminateSession(sessionId);
    }

    // Create new session with target role
    const newSessionResult = await createSession(request, userId!, targetRole);
    
    if (newSessionResult.error) {
      return NextResponse.json({
        success: false,
        error: newSessionResult.error
      }, { status: 500 });
    }

    // Set new session cookies
    const response = NextResponse.json({
      success: true,
      sessionId: newSessionResult.sessionId,
      message: `Successfully switched to ${targetRole} role`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

    // Update session cookies
    response.cookies.set('session_id', newSessionResult.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });
    
    response.cookies.set('user_role', targetRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Role switch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to switch role'
    }, { status: 500 });
  }
}