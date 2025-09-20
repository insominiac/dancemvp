import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin, hasPermission } from '@/app/lib/auth'
import { AuditLogger } from '@/app/lib/audit-logger'
import prisma from '@/app/lib/db'

// GET all users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin access granted to: ${currentUser.email}`)
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    
    const skip = (page - 1) * limit
    
    const where: any = {
      AND: [
        search ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { fullName: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        role ? { role } : {}
      ]
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: true,
          _count: {
            select: {
              bookings: true,
              forumPosts: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])
    
    // Remove password hashes from response
    const sanitizedUsers = users.map(({ passwordHash, ...user }) => user)
    
    return NextResponse.json({
      users: sanitizedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    
    // Handle authentication/authorization errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Admin privileges required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin creating user: ${currentUser.email}`)
    const body = await request.json()
    const { email, password, fullName, phone, role, bio, isVerified } = body
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: role || 'USER',
        bio,
        isVerified: isVerified || false
      }
    })
    
    // If role is INSTRUCTOR, create instructor profile
    if (role === 'INSTRUCTOR') {
      await prisma.instructor.create({
        data: {
          userId: user.id,
          isActive: true
        }
      })
    }
    
    const { passwordHash: _, ...sanitizedUser } = user
    
    // Log user creation
    await AuditLogger.logCreate(
      currentUser.id,
      'users',
      user.id,
      { email: user.email, fullName: user.fullName, role: user.role }
    )
    
    return NextResponse.json({
      message: 'User created successfully',
      user: sanitizedUser
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle authentication/authorization errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Admin privileges required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }
    
    // Log error
    await AuditLogger.logSystemEvent('USER_CREATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
