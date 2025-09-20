import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/app/lib/auth'
import prisma from '@/app/lib/db'

// GET single forum post with replies
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: params.postId },
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
          where: { parentId: null },
          orderBy: [
            { isSolution: 'desc' },
            { createdAt: 'asc' },
          ],
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id: params.postId },
      data: { viewsCount: { increment: 1 } },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching forum post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forum post' },
      { status: 500 }
    )
  }
}

// DELETE forum post
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
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

    // Check if user owns the post or is admin
    const post = await prisma.forumPost.findUnique({
      where: { id: params.postId },
      select: { userId: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (post.userId !== payload.userId && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.forumPost.delete({
      where: { id: params.postId },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting forum post:', error)
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    )
  }
}

// PATCH update forum post
export async function PATCH(
  request: Request,
  { params }: { params: { postId: string } }
) {
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

    const body = await request.json()
    const { isLocked, isPinned } = body

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can modify post settings' },
        { status: 403 }
      )
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id: params.postId },
      data: {
        ...(isLocked !== undefined && { isLocked }),
        ...(isPinned !== undefined && { isPinned }),
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating forum post:', error)
    return NextResponse.json(
      { error: 'Failed to update forum post' },
      { status: 500 }
    )
  }
}