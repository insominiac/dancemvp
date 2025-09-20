import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'

// Schema for creating a photo gallery entry
const createPhotoSchema = z.object({
  userId: z.string().uuid(),
  targetType: z.enum(['class', 'event', 'instructor', 'venue']),
  targetId: z.string().uuid(),
  photoUrl: z.string().url(),
  caption: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true)
})

// Schema for bulk photo upload
const bulkPhotoSchema = z.object({
  userId: z.string().uuid(),
  targetType: z.enum(['class', 'event', 'instructor', 'venue']),
  targetId: z.string().uuid(),
  photos: z.array(z.object({
    photoUrl: z.string().url(),
    caption: z.string().max(500).optional(),
    tags: z.array(z.string()).default([])
  })).min(1).max(20)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bulk = false, ...data } = body

    if (bulk) {
      return await handleBulkUpload(data)
    }

    const validatedData = createPhotoSchema.parse(data)

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

    // Check if target exists
    let target = null
    let canUpload = false

    switch (validatedData.targetType) {
      case 'class':
        target = await prisma.class.findUnique({
          where: { id: validatedData.targetId },
          include: {
            classInstructors: {
              include: {
                instructor: true
              }
            },
            bookings: {
              where: {
                userId: validatedData.userId,
                status: 'CONFIRMED'
              }
            }
          }
        })
        
        // Can upload if: instructor of class, attended class, or admin
        canUpload = user.role === 'ADMIN' || 
                   target?.classInstructors?.some(ci => ci.instructor.userId === validatedData.userId) ||
                   target?.bookings?.length > 0
        break

      case 'event':
        target = await prisma.event.findUnique({
          where: { id: validatedData.targetId },
          include: {
            organizer: true,
            bookings: {
              where: {
                userId: validatedData.userId,
                status: 'CONFIRMED'
              }
            }
          }
        })
        
        // Can upload if: organizer, attended event, or admin
        canUpload = user.role === 'ADMIN' || 
                   target?.organizer?.userId === validatedData.userId ||
                   target?.bookings?.length > 0
        break

      case 'instructor':
        target = await prisma.instructor.findUnique({
          where: { id: validatedData.targetId }
        })
        
        // Can upload if: the instructor themselves or admin
        canUpload = user.role === 'ADMIN' || target?.userId === validatedData.userId
        break

      case 'venue':
        target = await prisma.venue.findUnique({
          where: { id: validatedData.targetId }
        })
        
        // Can upload if: admin or venue manager (to be implemented)
        canUpload = user.role === 'ADMIN'
        break
    }

    if (!target) {
      return NextResponse.json(
        { error: `${validatedData.targetType} not found` },
        { status: 404 }
      )
    }

    if (!canUpload) {
      return NextResponse.json(
        { error: 'Not authorized to upload photos to this item' },
        { status: 403 }
      )
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        userId: validatedData.userId,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        photoUrl: validatedData.photoUrl,
        caption: validatedData.caption,
        tags: validatedData.tags,
        isPublic: validatedData.isPublic,
        status: 'APPROVED' // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      photo,
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to upload photo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleBulkUpload(data: any) {
  const validatedData = bulkPhotoSchema.parse(data)

  // Check user and target (similar to single upload)
  const user = await prisma.user.findUnique({
    where: { id: validatedData.userId }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // Create multiple photos
  const photoPromises = validatedData.photos.map(photoData =>
    prisma.photo.create({
      data: {
        userId: validatedData.userId,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        photoUrl: photoData.photoUrl,
        caption: photoData.caption,
        tags: photoData.tags,
        isPublic: true,
        status: 'APPROVED'
      }
    })
  )

  const photos = await Promise.all(photoPromises)

  return NextResponse.json({
    success: true,
    photos,
    count: photos.length,
    message: `${photos.length} photos uploaded successfully`
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetType = searchParams.get('targetType')
  const targetId = searchParams.get('targetId')
  const userId = searchParams.get('userId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  try {
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      status: 'APPROVED',
      isPublic: true
    }

    if (targetType && targetId) {
      whereClause.targetType = targetType
      whereClause.targetId = targetId
    }

    if (userId) {
      whereClause.userId = userId
      // If filtering by user, show their private photos too
      delete whereClause.isPublic
    }

    // Get photos with pagination
    const [photos, totalCount] = await Promise.all([
      prisma.photo.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
          likes: {
            select: {
              userId: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.photo.count({ where: whereClause })
    ])

    // Add like counts
    const photosWithStats = photos.map(photo => ({
      ...photo,
      likeCount: photo.likes.length,
      isLikedByUser: userId ? photo.likes.some(like => like.userId === userId) : false
    }))

    return NextResponse.json({
      success: true,
      photos: photosWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

// Photo interaction endpoint (likes, shares)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { photoId, userId, action, type } = body

    if (!photoId || !userId || !action || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if photo exists
    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    if (type === 'like') {
      if (action === 'add') {
        // Add like
        await prisma.photoLike.upsert({
          where: {
            photoId_userId: {
              photoId,
              userId
            }
          },
          update: {},
          create: {
            photoId,
            userId
          }
        })
      } else if (action === 'remove') {
        // Remove like
        await prisma.photoLike.deleteMany({
          where: {
            photoId,
            userId
          }
        })
      }

      // Get updated like count
      const likeCount = await prisma.photoLike.count({
        where: { photoId }
      })

      return NextResponse.json({
        success: true,
        likeCount,
        message: `Photo ${action === 'add' ? 'liked' : 'unliked'}`
      })
    }

    if (type === 'share') {
      // Log share activity
      await prisma.photoShare.create({
        data: {
          photoId,
          userId,
          platform: body.platform || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Photo share recorded'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Photo interaction error:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    )
  }
}
