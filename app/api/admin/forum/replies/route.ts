import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/app/lib/auth'
import prisma from '@/app/lib/db'

// GET all forum replies for admin management
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
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const isSolution = searchParams.get('isSolution')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (postId) {
      where.postId = postId
    }
    
    if (isSolution === 'true') {
      where.isSolution = true
    } else if (isSolution === 'false') {
      where.isSolution = false
    }
    
    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const [replies, total] = await Promise.all([
      prisma.forumReply.findMany({
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
          post: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          parent: {
            select: {
              id: true,
              content: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.forumReply.count({ where }),
    ])

    return NextResponse.json({
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching forum replies for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forum replies' },
      { status: 500 }
    )
  }
}

// PATCH bulk update forum replies (mark as solution, delete multiple)
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
    const { action, replyIds } = body

    if (!action || !Array.isArray(replyIds) || replyIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let result
    switch (action) {
      case 'markSolution':
        // First, unmark all existing solutions for the posts of these replies
        const repliesWithPosts = await prisma.forumReply.findMany({
          where: { id: { in: replyIds } },
          select: { postId: true },
        })
        
        const postIds = [...new Set(repliesWithPosts.map(r => r.postId))]
        
        // Unmark existing solutions
        await prisma.forumReply.updateMany({
          where: { 
            postId: { in: postIds },
            isSolution: true
          },
          data: { isSolution: false },
        })
        
        // Mark new solutions
        result = await prisma.forumReply.updateMany({
          where: { id: { in: replyIds } },
          data: { isSolution: true },
        })
        break
        
      case 'unmarkSolution':
        result = await prisma.forumReply.updateMany({
          where: { id: { in: replyIds } },
          data: { isSolution: false },
        })
        break
        
      case 'delete':
        // Delete child replies first (cascade effect)
        const repliesToDelete = await prisma.forumReply.findMany({
          where: { 
            OR: [
              { id: { in: replyIds } },
              { parentId: { in: replyIds } }
            ]
          },
          select: { id: true, postId: true }
        })
        
        // Count replies to update post counts
        const postUpdates = new Map()
        repliesToDelete.forEach(reply => {
          const count = postUpdates.get(reply.postId) || 0
          postUpdates.set(reply.postId, count + 1)
        })
        
        result = await prisma.forumReply.deleteMany({
          where: { 
            OR: [
              { id: { in: replyIds } },
              { parentId: { in: replyIds } }
            ]
          },
        })
        
        // Update post reply counts
        for (const [postId, count] of postUpdates) {
          await prisma.forumPost.update({
            where: { id: postId },
            data: { repliesCount: { decrement: count } },
          })
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Successfully performed ${action} on ${result.count} replies`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error performing bulk action on forum replies:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}