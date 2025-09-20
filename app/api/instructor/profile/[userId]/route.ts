import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'

const userIdSchema = z.string().min(1, 'User ID is required').regex(/^c[a-z0-9]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid user ID format')

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = userIdSchema.parse(params.userId)

    // Find instructor by user ID
    const instructor = await prisma.instructor.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            bio: true,
            createdAt: true,
            role: true
          }
        }
      }
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      )
    }

    // Get additional instructor stats
    const [totalClasses, totalStudents, avgRating] = await Promise.all([
      prisma.class.count({
        where: {
          classInstructors: {
            some: { instructorId: instructor.id }
          },
          isActive: true
        }
      }),
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          class: {
            classInstructors: {
              some: { instructorId: instructor.id }
            }
          }
        }
      }),
      // Mock rating for now - will be calculated from reviews
      Promise.resolve(4.8)
    ])

    const instructorProfile = {
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        bio: instructor.user.bio,
        experience: instructor.experienceYears,
        specialties: instructor.specialty ? [instructor.specialty] : [],
        rating: instructor.rating ? Number(instructor.rating) : null,
        isActive: instructor.isActive,
        createdAt: instructor.createdAt.toISOString()
      },
      user: {
        id: instructor.user.id,
        fullName: instructor.user.fullName,
        email: instructor.user.email,
        phone: instructor.user.phone,
        role: instructor.user.role,
        joinedDate: instructor.user.createdAt.toISOString()
      },
      stats: {
        totalClasses,
        totalStudents,
        averageRating: avgRating
      }
    }

    return NextResponse.json({
      success: true,
      instructor: instructorProfile.instructor,
      user: instructorProfile.user,
      stats: instructorProfile.stats
    })

  } catch (error) {
    console.error('Instructor profile API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid user ID format', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch instructor profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
