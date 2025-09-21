import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Schema for generating login tokens
const generateTokenSchema = z.object({
  name: z.string().optional(),
  purpose: z.string().optional(),
  maxUses: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  allowedRoles: z.array(z.enum(['USER', 'INSTRUCTOR', 'ADMIN'])).optional(),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = generateTokenSchema.parse(body)
    
    // Get current user (admin only can generate tokens)
    const session = request.cookies.get('session')?.value
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify admin session (simplified - you might want more robust auth)
    const currentSession = await prisma.session.findFirst({
      where: {
        id: session,
        isActive: true,
        userRole: 'ADMIN',
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    if (!currentSession) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Generate unique token
    const token = nanoid(32) // 32 character random string

    // Create login token
    const loginToken = await prisma.loginToken.create({
      data: {
        token,
        name: data.name,
        purpose: data.purpose || 'general',
        createdByUserId: currentSession.userId,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        allowedRoles: data.allowedRoles || ['USER', 'INSTRUCTOR', 'ADMIN'],
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })

    // Generate the unique login URL
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login/${token}`

    return NextResponse.json({
      success: true,
      data: {
        id: loginToken.id,
        token: loginToken.token,
        loginUrl,
        name: loginToken.name,
        purpose: loginToken.purpose,
        maxUses: loginToken.maxUses,
        expiresAt: loginToken.expiresAt,
        allowedRoles: loginToken.allowedRoles,
        metadata: loginToken.metadata ? JSON.parse(loginToken.metadata) : null,
        createdAt: loginToken.createdAt
      }
    })

  } catch (error) {
    console.error('Generate login token error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate login token' },
      { status: 500 }
    )
  }
}