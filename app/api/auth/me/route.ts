import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/lib/session-middleware'

export async function GET(request: NextRequest) {
  try {
    // Validate session using the new session middleware
    const sessionValidation = await validateSession(request)
    
    if (!sessionValidation.isValid) {
      return NextResponse.json(
        { 
          error: sessionValidation.error || 'Not authenticated',
          success: false,
          conflictingRole: sessionValidation.conflictingRole 
        },
        { status: 401 }
      )
    }

    const { user, sessionId, userRole } = sessionValidation

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        fullName: user?.fullName,
        role: user?.role,
        isVerified: user?.isVerified,
        profileImage: user?.profileImage
      },
      sessionId,
      activeRole: userRole
    })

  } catch (error) {
    console.error('Get current user error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
