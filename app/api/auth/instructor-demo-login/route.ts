import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/app/lib/session-middleware'
import { AuditLogger } from '@/app/lib/audit-logger'
import prisma from '@/app/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🎓 Demo instructor login requested')

    const demoAccount = { 
      email: 'instructor@demo.com', 
      password: 'instructor123', 
      fullName: 'Demo Instructor' 
    }

    // Check if demo user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: demoAccount.email },
      include: {
        instructor: true
      }
    })

    if (!user) {
      console.log('Creating demo instructor user...')
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(demoAccount.password, 10)
      
      user = await prisma.user.create({
        data: {
          email: demoAccount.email,
          passwordHash: hashedPassword,
          fullName: demoAccount.fullName,
          role: 'INSTRUCTOR' as UserRole,
          isVerified: true,
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
    } else if (!user.instructor) {
      // User exists but no instructor record - create it
      console.log('Creating instructor record for existing user...')
      await prisma.instructor.create({
        data: {
          userId: user.id,
          specialty: 'Contemporary & Ballet',
          experienceYears: 5,
          rating: 4.8,
          isActive: true
        }
      })
      
      // Refetch user with instructor
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { instructor: true }
      })
    }

    if (!user || !user.instructor) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create or find instructor record'
      }, { status: 500 })
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
      message: 'Demo instructor login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage
      },
      instructor: {
        id: user.instructor.id,
        specialty: user.instructor.specialty,
        experienceYears: user.instructor.experienceYears,
        rating: user.instructor.rating ? Number(user.instructor.rating) : null,
        isActive: user.instructor.isActive
      },
      sessionId: sessionResult.sessionId,
      instructions: 'You are now logged in as an instructor. Try accessing /instructor/dashboard'
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
    console.error('Demo instructor login error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo instructor login endpoint',
    usage: 'POST to login as demo instructor',
    credentials: 'instructor@demo.com / instructor123'
  })
}