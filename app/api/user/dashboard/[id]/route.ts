import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'

// Validation schema for user ID parameter
const userIdSchema = z.string().cuid('Invalid user ID format')

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user ID parameter
    const userId = userIdSchema.parse(params.id)

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        phone: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user statistics
    const [
      totalBookings,
      confirmedBookings,
      upcomingBookingsCount,
      totalSpent,
      classesAttended
    ] = await Promise.all([
      // Total bookings count
      prisma.booking.count({
        where: { userId }
      }),

      // Confirmed bookings count
      prisma.booking.count({
        where: { 
          userId,
          status: 'CONFIRMED'
        }
      }),

      // Upcoming bookings this week
      prisma.booking.count({
        where: {
          userId,
          status: 'CONFIRMED',
          OR: [
            {
              class: {
                startDate: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                }
              }
            },
            {
              event: {
                startDate: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                }
              }
            }
          ]
        }
      }),

      // Total amount spent
      prisma.booking.aggregate({
        where: {
          userId,
          paymentStatus: 'succeeded'
        },
        _sum: {
          amountPaid: true
        }
      }),

      // Classes attended (past confirmed bookings)
      prisma.booking.count({
        where: {
          userId,
          status: 'CONFIRMED',
          class: {
            endDate: {
              lt: new Date()
            }
          }
        }
      })
    ])

    const stats = {
      totalBookings,
      classesAttended,
      totalSpent: Number(totalSpent._sum.amountPaid || 0),
      upcomingThisWeek: upcomingBookingsCount
    }

    // Get upcoming bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'CONFIRMED',
        OR: [
          {
            class: {
              startDate: { gte: new Date() }
            }
          },
          {
            event: {
              startDate: { gte: new Date() }
            }
          }
        ]
      },
      include: {
        class: {
          include: {
            venue: true,
            classInstructors: {
              include: {
                instructor: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        event: {
          include: {
            venue: true,
            organizer: true
          }
        }
      },
      orderBy: [
        { class: { startDate: 'asc' } },
        { event: { startDate: 'asc' } }
      ],
      take: 10
    })

    // Transform upcoming bookings data
    const transformedUpcomingBookings = upcomingBookings.map(booking => {
      const item = booking.class || booking.event
      const isClass = Boolean(booking.class)
      
      return {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        bookingDate: booking.createdAt.toISOString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: Number(booking.totalAmount),
        amountPaid: Number(booking.amountPaid),
        type: isClass ? 'class' as const : 'event' as const,
        item: {
          id: item?.id,
          title: item?.title,
          description: item?.description,
          startDate: item?.startDate?.toISOString(),
          endDate: item?.endDate?.toISOString(),
          startTime: isClass ? booking.class?.schedule : booking.event?.startTime,
          venue: item?.venue ? {
            name: item.venue.name,
            address: item.venue.address,
            city: item.venue.city,
            state: item.venue.state
          } : null,
          instructor: isClass && booking.class?.classInstructors?.[0]?.instructor?.user ? 
            booking.class.classInstructors[0].instructor.user.fullName : null,
          organizer: !isClass && booking.event?.organizer ? 
            booking.event.organizer.fullName : null
        }
      }
    })

    // Get recent activity (last 10 bookings)
    const recentBookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        class: {
          select: {
            title: true,
            startDate: true
          }
        },
        event: {
          select: {
            title: true,
            startDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const recentActivity = recentBookings.map(booking => {
      const item = booking.class || booking.event
      const isClass = Boolean(booking.class)
      
      return {
        id: booking.id,
        type: isClass ? 'class' as const : 'event' as const,
        action: 'booked',
        title: item?.title || 'Unknown',
        date: booking.createdAt.toISOString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        amount: Number(booking.totalAmount)
      }
    })

    // Get recommended classes based on user's booking history
    const userBookedClassStyles = await prisma.booking.findMany({
      where: {
        userId,
        class: { isNot: null }
      },
      include: {
        class: {
          include: {
            classStyles: {
              include: {
                style: true
              }
            }
          }
        }
      }
    })

    // Extract dance styles user has booked before
    const bookedStyleIds = new Set()
    userBookedClassStyles.forEach(booking => {
      booking.class?.classStyles?.forEach(cs => {
        bookedStyleIds.add(cs.styleId)
      })
    })

    // Find recommended classes based on similar styles and user level
    const recommendedClasses = await prisma.class.findMany({
      where: {
        isActive: true,
        startDate: { gte: new Date() },
        AND: [
          // Don't recommend classes user has already booked
          {
            NOT: {
              id: { in: upcomingBookings.filter(b => b.classId).map(b => b.classId!) }
            }
          },
          // Recommend classes with similar styles if user has booking history
          bookedStyleIds.size > 0 ? {
            classStyles: {
              some: {
                styleId: { in: Array.from(bookedStyleIds) }
              }
            }
          } : {}
        ]
      },
      include: {
        venue: {
          select: {
            name: true,
            city: true,
            state: true
          }
        },
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 6
    })

    const transformedRecommendedClasses = recommendedClasses.map(cls => ({
      id: cls.id,
      title: cls.title,
      description: cls.description,
      level: cls.level,
      price: Number(cls.price),
      duration: cls.duration,
      startDate: cls.startDate.toISOString(),
      scheduleTime: cls.schedule,
      venue: cls.venue ? {
        name: cls.venue.name,
        city: cls.venue.city,
        state: cls.venue.state
      } : null,
      instructor: cls.classInstructors?.[0]?.instructor?.user?.fullName || null,
      spotsLeft: cls.maxStudents - cls.currentStudents,
      totalSpots: cls.maxStudents
    }))

    // Return dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        memberSince: user.createdAt.toISOString()
      },
      stats,
      upcomingBookings: transformedUpcomingBookings,
      recentActivity,
      recommendedClasses: transformedRecommendedClasses
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid user ID format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
