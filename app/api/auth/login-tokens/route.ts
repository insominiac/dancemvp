import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get current user (admin only)
    const session = request.cookies.get('session')?.value
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify admin session
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

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const purpose = url.searchParams.get('purpose') || ''
    const isActive = url.searchParams.get('active')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
        { token: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (purpose) {
      where.purpose = purpose
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get tokens with stats
    const [tokens, total] = await Promise.all([
      prisma.loginToken.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          loginAttempts: {
            select: {
              id: true,
              success: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              loginAttempts: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.loginToken.count({ where })
    ])

    // Transform data with stats
    const tokensWithStats = tokens.map(token => {
      const successfulAttempts = token.loginAttempts.filter(attempt => attempt.success).length
      const recentAttempts = token.loginAttempts.filter(
        attempt => new Date(attempt.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length

      return {
        id: token.id,
        token: token.token,
        name: token.name,
        purpose: token.purpose,
        isActive: token.isActive,
        usedCount: token.usedCount,
        maxUses: token.maxUses,
        expiresAt: token.expiresAt,
        allowedRoles: token.allowedRoles,
        metadata: token.metadata ? JSON.parse(token.metadata) : null,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        lastUsedAt: token.lastUsedAt,
        lastUsedIp: token.lastUsedIp,
        createdBy: token.createdByUser?.fullName || 'System',
        stats: {
          totalAttempts: token._count.loginAttempts,
          successfulAttempts,
          successRate: token._count.loginAttempts > 0 
            ? Math.round((successfulAttempts / token._count.loginAttempts) * 100) 
            : 0,
          recentAttempts24h: recentAttempts
        },
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login/${token.token}`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        tokens: tokensWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('List login tokens error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch login tokens' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user (admin only)
    const session = request.cookies.get('session')?.value
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify admin session
    const currentSession = await prisma.session.findFirst({
      where: {
        id: session,
        isActive: true,
        userRole: 'ADMIN',
        expiresAt: { gt: new Date() }
      }
    })

    if (!currentSession) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { tokenId } = await request.json()
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      )
    }

    // Delete the token (this will cascade delete login attempts)
    await prisma.loginToken.delete({
      where: { id: tokenId }
    })

    return NextResponse.json({
      success: true,
      message: 'Login token deleted successfully'
    })

  } catch (error) {
    console.error('Delete login token error:', error)
    
    return NextResponse.json(
      { error: 'Failed to delete login token' },
      { status: 500 }
    )
  }
}