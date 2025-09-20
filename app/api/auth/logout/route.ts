import { NextRequest, NextResponse } from 'next/server'
import { terminateSession } from '@/app/lib/session-middleware'
import { AuditLogger } from '@/app/lib/audit-logger'

export async function POST(request: NextRequest) {
  try {
    // Get session ID and user ID from cookies
    const sessionId = request.cookies.get('session_id')?.value
    const userId = request.cookies.get('user_id')?.value
    
    // Terminate the session if it exists
    if (sessionId) {
      await terminateSession(sessionId)
    }
    
    // Log logout event
    if (userId) {
      await AuditLogger.logLogout(userId, sessionId)
    }
    
    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })
    
    // Clear all session cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      expires: new Date(0)
    }
    
    response.cookies.set('session_id', '', cookieOptions)
    response.cookies.set('user_id', '', cookieOptions)
    response.cookies.set('user_role', '', cookieOptions)
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    // Log system error
    await AuditLogger.logSystemEvent('LOGOUT_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
