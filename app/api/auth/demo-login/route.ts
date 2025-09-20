import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/app/lib/session-middleware'
import { generateDeviceFingerprint } from '@/app/lib/device-fingerprint'
import { AuditLogger } from '@/app/lib/audit-logger'
import prisma from '@/app/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role = 'ADMIN' } = body

    console.log(`🔓 Demo login requested for role: ${role}`)

    // Demo accounts
    const demoAccounts = {
      'ADMIN': { email: 'admin@dev.local', password: 'admin123', fullName: 'Development Admin' },
      'INSTRUCTOR': { email: 'instructor@demo.com', password: 'instructor123', fullName: 'Demo Instructor' },
      'USER': { email: 'user@demo.com', password: 'user123', fullName: 'Demo User' }
    }

    const demoAccount = demoAccounts[role as keyof typeof demoAccounts]
    
    if (!demoAccount) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role. Use ADMIN, INSTRUCTOR, or USER.'
      }, { status: 400 })
    }

    // Check if demo user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: demoAccount.email }
    })

    if (!user) {
      console.log(`Creating development ${role.toLowerCase()} user...`)
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(demoAccount.password, 10)
      
      const userData: any = {
        email: demoAccount.email,
        passwordHash: hashedPassword,
        fullName: demoAccount.fullName,
        role: role as UserRole,
        isVerified: true
      }

      // If it's an instructor, create the instructor record too
      if (role === 'INSTRUCTOR') {
        user = await prisma.user.create({
          data: {
            ...userData,
            instructor: {
              create: {
                specialty: 'Contemporary & Ballet',
                experienceYears: 5,
                rating: 4.8,
                isActive: true
              }
            }
          },
          include: {
            instructor: true
          }
        })
      } else {
        user = await prisma.user.create({
          data: userData
        })
      }
    }

    // Create session
    const sessionResult = await createSession(request, user.id, user.role as UserRole)
    
    if (sessionResult.error) {
      return NextResponse.json({
        success: false,
        error: sessionResult.error
      }, { status: 500 })
    }

    // Set session cookies
    const response = NextResponse.json({
      success: true,
      message: 'Demo login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage
      },
      sessionId: sessionResult.sessionId,
      instructions: 'You are now logged in. Try accessing /api/auth/me or /admin'
    })

    // Set HTTP-only cookies for session management
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    }

    response.cookies.set('session_id', sessionResult.sessionId, cookieOptions)
    response.cookies.set('user_id', user.id, cookieOptions)
    response.cookies.set('user_role', user.role, cookieOptions)

    // Log successful demo login
    try {
      await AuditLogger.logLogin(user.id)
    } catch (auditError) {
      console.warn('Failed to log audit entry:', auditError)
    }

    return response

  } catch (error) {
    console.error('Demo login error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo login endpoint',
    usage: 'POST with {"role": "ADMIN"|"INSTRUCTOR"|"USER"}',
    available_roles: ['ADMIN', 'INSTRUCTOR', 'USER'],
    default_role: 'ADMIN'
  })
}