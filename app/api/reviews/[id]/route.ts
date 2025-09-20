import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'

const reviewIdSchema = z.string().uuid('Invalid review ID format')

// Schema for updating a review
const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(1000).optional(),
  wouldRecommend: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

// Schema for review interactions (like/helpful)
const interactionSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['like', 'helpful', 'report']),
  action: z.enum(['add', 'remove'])
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = reviewIdSchema.parse(params.id)

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            createdAt: true
          }
        },
        interactions: {
          select: {
            id: true,
            userId: true,
            type: true,
            createdAt: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Calculate interaction stats
    const stats = {
      likes: review.interactions.filter(i => i.type === 'like').length,
      helpful: review.interactions.filter(i => i.type === 'helpful').length,
      reports: review.interactions.filter(i => i.type === 'report').length
    }

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        stats
      }
    })

  } catch (error) {
    console.error('Get review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = reviewIdSchema.parse(params.id)
    const body = await request.json()
    
    // Check if this is an interaction or review update
    if (body.type && body.action) {
      return await handleReviewInteraction(reviewId, body)
    }

    // Handle review update
    const validatedData = updateReviewSchema.parse(body)
    const { userId } = body // Should be provided for authorization

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required for review updates' },
        { status: 400 }
      )
    }

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns this review
    if (existingReview.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this review' },
        { status: 403 }
      )
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            createdAt: true
          }
        }
      }
    })

    // Update average rating if rating changed
    if (validatedData.rating) {
      await updateAverageRating(existingReview.targetType, existingReview.targetId)
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Review updated successfully'
    })

  } catch (error) {
    console.error('Update review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = reviewIdSchema.parse(params.id)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required for review deletion' },
        { status: 400 }
      )
    }

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns this review (or is admin)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to delete this review' },
        { status: 403 }
      )
    }

    // Delete the review (soft delete by updating status)
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'DELETED',
        deletedAt: new Date()
      }
    })

    // Update average rating
    await updateAverageRating(existingReview.targetType, existingReview.targetId)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Delete review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}

async function handleReviewInteraction(reviewId: string, data: any) {
  const validatedData = interactionSchema.parse(data)

  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  })

  if (!review) {
    return NextResponse.json(
      { error: 'Review not found' },
      { status: 404 }
    )
  }

  if (validatedData.action === 'add') {
    // Add interaction
    const existingInteraction = await prisma.reviewInteraction.findFirst({
      where: {
        reviewId,
        userId: validatedData.userId,
        type: validatedData.type
      }
    })

    if (existingInteraction) {
      return NextResponse.json(
        { error: 'Interaction already exists' },
        { status: 409 }
      )
    }

    await prisma.reviewInteraction.create({
      data: {
        reviewId,
        userId: validatedData.userId,
        type: validatedData.type
      }
    })

  } else if (validatedData.action === 'remove') {
    // Remove interaction
    await prisma.reviewInteraction.deleteMany({
      where: {
        reviewId,
        userId: validatedData.userId,
        type: validatedData.type
      }
    })
  }

  // Get updated interaction stats
  const interactions = await prisma.reviewInteraction.findMany({
    where: { reviewId }
  })

  const stats = {
    likes: interactions.filter(i => i.type === 'like').length,
    helpful: interactions.filter(i => i.type === 'helpful').length,
    reports: interactions.filter(i => i.type === 'report').length
  }

  return NextResponse.json({
    success: true,
    stats,
    message: `Review ${validatedData.action}ed to ${validatedData.type}`
  })
}

// Helper function to update average rating
async function updateAverageRating(targetType: string, targetId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      targetType,
      targetId,
      status: 'PUBLISHED'
    },
    _avg: { rating: true },
    _count: { rating: true }
  })

  const averageRating = stats._avg.rating || 0
  const reviewCount = stats._count.rating || 0

  // Update the target's rating
  switch (targetType) {
    case 'class':
      await prisma.class.update({
        where: { id: targetId },
        data: {
          averageRating,
          reviewCount
        }
      })
      break
    case 'instructor':
      await prisma.instructor.update({
        where: { id: targetId },
        data: {
          averageRating,
          reviewCount
        }
      })
      break
    case 'event':
      await prisma.event.update({
        where: { id: targetId },
        data: {
          averageRating,
          reviewCount
        }
      })
      break
  }
}
