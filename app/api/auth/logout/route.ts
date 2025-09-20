import { NextRequest, NextResponse } from 'next/server'
import { terminateSession } from '@/app/lib/session-middleware'

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value
    
    // Terminate the session if it exists
    if (sessionId) {
      await terminateSession(sessionId)
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
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
