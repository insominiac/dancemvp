import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find the login token
    const loginToken = await prisma.loginToken.findUnique({
      where: { token },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    if (!loginToken) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid token' 
        },
        { status: 404 }
      )
    }

    // Check if token is active
    if (!loginToken.isActive) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Token is inactive' 
        },
        { status: 403 }
      )
    }

    // Check if token has expired
    if (loginToken.expiresAt && loginToken.expiresAt < new Date()) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Token has expired' 
        },
        { status: 403 }
      )
    }

    // Check if token has reached max uses
    if (loginToken.maxUses && loginToken.usedCount >= loginToken.maxUses) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Token usage limit reached' 
        },
        { status: 403 }
      )
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      data: {
        id: loginToken.id,
        name: loginToken.name,
        purpose: loginToken.purpose,
        allowedRoles: loginToken.allowedRoles,
        usedCount: loginToken.usedCount,
        maxUses: loginToken.maxUses,
        expiresAt: loginToken.expiresAt,
        metadata: loginToken.metadata ? JSON.parse(loginToken.metadata) : null,
        createdBy: loginToken.createdByUser?.fullName || 'System'
      }
    })

  } catch (error) {
    console.error('Validate login token error:', error)
    
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to validate token' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const { email, success, failureReason } = await request.json()
    
    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || null
    
    // Find the token
    const loginToken = await prisma.loginToken.findUnique({
      where: { token }
    })

    if (!loginToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Create login attempt record
    const loginAttempt = await prisma.loginAttempt.create({
      data: {
        tokenId: loginToken.id,
        email,
        success,
        failureReason,
        ipAddress,
        userAgent
      }
    })

    // If successful login, update token usage
    if (success) {
      await prisma.loginToken.update({
        where: { id: loginToken.id },
        data: {
          usedCount: { increment: 1 },
          lastUsedAt: new Date(),
          lastUsedIp: ipAddress,
          lastUserAgent: userAgent
        }
      })
    }

    return NextResponse.json({
      success: true,
      attemptId: loginAttempt.id
    })

  } catch (error) {
    console.error('Track login attempt error:', error)
    
    return NextResponse.json(
      { error: 'Failed to track login attempt' },
      { status: 500 }
    )
  }
}