import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/app/lib/auth'
import prisma from '@/app/lib/db'

// GET all forum posts for admin management
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') // 'pinned', 'locked', 'normal'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (status) {
      switch (status) {
        case 'pinned':
          where.isPinned = true
          break
        case 'locked':
          where.isLocked = true
          break
        case 'normal':
          where.isPinned = false
          where.isLocked = false
          break
      }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
              role: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.forumPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching forum posts for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
      { status: 500 }
    )
  }
}

// PATCH bulk update forum posts (pin, lock, delete multiple)
export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, postIds, data } = body

    if (!action || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let result
    switch (action) {
      case 'pin':
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: { isPinned: true },
        })
        break
        
      case 'unpin':
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: { isPinned: false },
        })
        break
        
      case 'lock':
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: { isLocked: true },
        })
        break
        
      case 'unlock':
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: { isLocked: false },
        })
        break
        
      case 'delete':
        // Delete replies first, then posts
        await prisma.forumReply.deleteMany({
          where: { postId: { in: postIds } },
        })
        result = await prisma.forumPost.deleteMany({
          where: { id: { in: postIds } },
        })
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Successfully ${action}ed ${result.count} posts`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error performing bulk action on forum posts:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}