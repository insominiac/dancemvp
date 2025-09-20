import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/app/lib/auth'
import prisma from '@/app/lib/db'

// POST create a reply to a forum post
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    // DEVELOPMENT MODE: Use existing user if no token
    let userId: string
    if (!token && process.env.NODE_ENV === 'development') {
      console.log('🔓 Development mode: Using existing user for forum reply')
      // Use the first user from the database for development
      const devUser = await prisma.user.findFirst()
      if (!devUser) {
        return NextResponse.json(
          { error: 'No users found in development mode' },
          { status: 500 }
        )
      }
      userId = devUser.id
    } else {
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
      userId = payload.userId
    }

    const body = await request.json()
    const { content, parentId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if post exists and is not locked
    const post = await prisma.forumPost.findUnique({
      where: { id: params.postId },
      select: { isLocked: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: 'This post is locked and cannot accept new replies' },
        { status: 403 }
      )
    }

    // Create the reply
    const reply = await prisma.forumReply.create({
      data: {
        content,
        postId: params.postId,
        userId: userId,
        ...(parentId && { parentId }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    })

    // Update post replies count
    await prisma.forumPost.update({
      where: { id: params.postId },
      data: { repliesCount: { increment: 1 } },
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}