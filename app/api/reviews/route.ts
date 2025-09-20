import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'

// Schema for creating a review
const createReviewSchema = z.object({
  userId: z.string().uuid(),
  targetType: z.enum(['class', 'instructor', 'event']),
  targetId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(1000),
  isAnonymous: z.boolean().default(false),
  wouldRecommend: z.boolean().default(true),
  tags: z.array(z.string()).default([])
})

// Schema for updating a review
const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(1000).optional(),
  wouldRecommend: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if target exists based on type
    let target = null
    switch (validatedData.targetType) {
      case 'class':
        target = await prisma.class.findUnique({
          where: { id: validatedData.targetId }
        })
        break
      case 'instructor':
        target = await prisma.instructor.findUnique({
          where: { id: validatedData.targetId }
        })
        break
      case 'event':
        target = await prisma.event.findUnique({
          where: { id: validatedData.targetId }
        })
        break
    }

    if (!target) {
      return NextResponse.json(
        { error: `${validatedData.targetType} not found` },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this item
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: validatedData.userId,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 409 }
      )
    }

    // For class/event reviews, check if user has actually attended
    if (validatedData.targetType === 'class' || validatedData.targetType === 'event') {
      const hasBooking = await prisma.booking.findFirst({
        where: {
          userId: validatedData.userId,
          [validatedData.targetType === 'class' ? 'classId' : 'eventId']: validatedData.targetId,
          status: 'CONFIRMED'
        }
      })

      if (!hasBooking) {
        return NextResponse.json(
          { error: 'You can only review classes or events you have attended' },
          { status: 403 }
        )
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: validatedData.userId,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        isAnonymous: validatedData.isAnonymous,
        wouldRecommend: validatedData.wouldRecommend,
        tags: validatedData.tags,
        isVerified: true, // Since we verified they attended
        status: 'PUBLISHED'
      }
    })

    // Update target's average rating
    await updateAverageRating(validatedData.targetType, validatedData.targetId)

    // Get the created review with user info
    const reviewWithUser = await prisma.review.findUnique({
      where: { id: review.id },
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

    return NextResponse.json({
      success: true,
      review: reviewWithUser,
      message: 'Review created successfully'
    })

  } catch (error) {
    console.error('Create review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetType = searchParams.get('targetType')
  const targetId = searchParams.get('targetId')
  const userId = searchParams.get('userId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  try {
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      status: 'PUBLISHED'
    }

    if (targetType && targetId) {
      whereClause.targetType = targetType
      whereClause.targetId = targetId
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.review.count({ where: whereClause })
    ])

    // Calculate summary stats if targetType and targetId provided
    let summary = null
    if (targetType && targetId) {
      const stats = await prisma.review.aggregate({
        where: {
          targetType,
          targetId,
          status: 'PUBLISHED'
        },
        _avg: { rating: true },
        _count: { rating: true }
      })

      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: {
          targetType,
          targetId,
          status: 'PUBLISHED'
        },
        _count: { rating: true }
      })

      const recommendationCount = await prisma.review.count({
        where: {
          targetType,
          targetId,
          status: 'PUBLISHED',
          wouldRecommend: true
        }
      })

      summary = {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0,
        recommendationPercentage: stats._count.rating > 0 ? 
          Math.round((recommendationCount / stats._count.rating) * 100) : 0,
        ratingDistribution: ratingDistribution.reduce((acc: any, curr) => {
          acc[curr.rating] = curr._count.rating
          return acc
        }, {})
      }
    }

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary
    })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
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
