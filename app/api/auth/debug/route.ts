import { NextRequest, NextResponse } from 'next/server'
import { generateDeviceFingerprint } from '@/app/lib/device-fingerprint'
import prisma from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get cookies
    const sessionId = request.cookies.get('session_id')?.value
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value

    // Get device info
    const deviceInfo = generateDeviceFingerprint(request)

    let sessionInfo = null
    let userInfo = null

    if (sessionId) {
      try {
        // Check if session exists in database
        sessionInfo = await prisma.session.findFirst({
          where: { id: sessionId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true
              }
            }
          }
        })
      } catch (error) {
        console.error('Database error in auth debug:', error)
      }
    }

    if (userId) {
      try {
        userInfo = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isVerified: true
          }
        })
      } catch (error) {
        console.error('Database error fetching user in auth debug:', error)
      }
    }

    const now = new Date()

    return NextResponse.json({
      debug: true,
      timestamp: now.toISOString(),
      cookies: {
        session_id: sessionId ? 'present' : 'missing',
        user_id: userId ? 'present' : 'missing',
        user_role: userRole ? userRole : 'missing'
      },
      cookieValues: {
        session_id: sessionId,
        user_id: userId,
        user_role: userRole
      },
      deviceInfo: {
        deviceId: deviceInfo.deviceId,
        deviceInfo: deviceInfo.deviceInfo,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent?.substring(0, 100) + '...'
      },
      session: sessionInfo ? {
        id: sessionInfo.id,
        userId: sessionInfo.userId,
        userRole: sessionInfo.userRole,
        isActive: sessionInfo.isActive,
        expiresAt: sessionInfo.expiresAt,
        deviceId: sessionInfo.deviceId,
        deviceMatches: sessionInfo.deviceId === deviceInfo.deviceId,
        isExpired: sessionInfo.expiresAt < now,
        associatedUser: sessionInfo.user
      } : null,
      user: userInfo,
      databaseConnected: true
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      debug: true,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      databaseConnected: false
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}