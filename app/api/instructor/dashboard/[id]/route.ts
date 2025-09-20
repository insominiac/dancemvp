import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { instructorIdSchema } from '@/app/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = instructorIdSchema.parse(params.id)

    // Get instructor basic info and verify they exist
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            createdAt: true
          }
        }
      }
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    // Get current date ranges
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get instructor statistics
    const [
      totalActiveClasses,
      totalStudentsEnrolled,
      upcomingThisWeek,
      monthlyEarnings,
      averageRating,
      todaysClasses,
      upcomingClasses,
      recentBookings,
      monthlyStats
    ] = await Promise.all([
      // Total active classes
      prisma.class.count({
        where: {
          classInstructors: {
            some: { instructorId }
          },
          isActive: true
        }
      }),

      // Total students enrolled across all classes
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          class: {
            classInstructors: {
              some: { instructorId }
            }
          }
        }
      }),

      // Upcoming classes this week
      prisma.class.count({
        where: {
          classInstructors: {
            some: { instructorId }
          },
          isActive: true,
          startDate: {
            gte: startOfWeek,
            lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Monthly earnings (sum of all confirmed bookings this month)
      prisma.booking.aggregate({
        where: {
          status: 'CONFIRMED',
          paymentStatus: 'succeeded',
          class: {
            classInstructors: {
              some: { instructorId }
            }
          },
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amountPaid: true
        }
      }),

      // Average rating (from reviews - to be implemented)
      // For now, return null and calculate later
      Promise.resolve(null),

      // Today's classes with enrollment info
      prisma.class.findMany({
        where: {
          classInstructors: {
            some: { instructorId }
          },
          isActive: true,
          startDate: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          venue: {
            select: {
              name: true,
              addressLine1: true,
              city: true
            }
          },
          bookings: {
            where: {
              status: 'CONFIRMED'
            },
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          },
          classStyles: {
            include: {
              style: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      }),

      // Upcoming classes (next 7 days)
      prisma.class.findMany({
        where: {
          classInstructors: {
            some: { instructorId }
          },
          isActive: true,
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          venue: {
            select: {
              name: true,
              city: true
            }
          },
          bookings: {
            where: {
              status: 'CONFIRMED'
            },
            select: { id: true }
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        take: 10
      }),

      // Recent bookings/activity
      prisma.booking.findMany({
        where: {
          class: {
            classInstructors: {
              some: { instructorId }
            }
          }
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          },
          class: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // Monthly performance stats
      Promise.all([
        // Classes taught this month
        prisma.class.count({
          where: {
            classInstructors: {
              some: { instructorId }
            },
            endDate: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }),
        // New students this month
        prisma.booking.count({
          where: {
            status: 'CONFIRMED',
            class: {
              classInstructors: {
                some: { instructorId }
              }
            },
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }),
        // Attendance rate calculation (to be enhanced)
        Promise.resolve(0.94) // Mock for now
      ])
    ])

    // Transform today's classes data
    const transformedTodaysClasses = todaysClasses.map(cls => ({
      id: cls.id,
      title: cls.title,
      time: cls.scheduleTime || 'TBD',
      duration: cls.durationMins || 60,
      enrolled: cls.bookings.length,
      capacity: cls.maxCapacity || 20,
      venue: cls.venue?.name || 'TBD',
      location: cls.venue ? `${cls.venue.name}, ${cls.venue.city}` : 'TBD',
      students: cls.bookings.map(booking => ({
        name: booking.user.fullName,
        email: booking.user.email
      })),
      styles: cls.classStyles?.map(cs => cs.style.name) || []
    }))

    // Transform upcoming classes
    const transformedUpcomingClasses = upcomingClasses.map(cls => ({
      id: cls.id,
      title: cls.title,
      startDate: cls.startDate?.toISOString() || new Date().toISOString(),
      time: cls.scheduleTime || 'TBD',
      duration: cls.durationMins || 60,
      enrolled: cls.bookings.length,
      capacity: cls.maxCapacity || 20,
      venue: cls.venue?.name || 'TBD',
      location: cls.venue ? `${cls.venue.name}, ${cls.venue.city}` : 'TBD'
    }))

    // Transform recent activity
    const recentActivity = recentBookings.map(booking => {
      const timeAgo = getTimeAgo(booking.createdAt)
      let message = ''
      
      switch (booking.status) {
        case 'CONFIRMED':
          message = `${booking.user.fullName} enrolled in ${booking.class?.title}`
          break
        case 'CANCELLED':
          message = `${booking.user.fullName} cancelled ${booking.class?.title}`
          break
        default:
          message = `${booking.user.fullName} booked ${booking.class?.title}`
      }

      return {
        id: booking.id,
        message,
        time: timeAgo,
        type: booking.status.toLowerCase(),
        userId: booking.userId,
        classTitle: booking.class?.title
      }
    })

    // Calculate average rating (mock for now - to be implemented with reviews)
    const avgRating = 4.8 // Will be calculated from reviews table

    const stats = {
      totalClasses: totalActiveClasses,
      studentsEnrolled: totalStudentsEnrolled,
      upcomingThisWeek,
      monthlyEarnings: Number(monthlyEarnings._sum.amountPaid || 0),
      averageRating: avgRating
    }

    const performanceMetrics = {
      classesTaught: monthlyStats[0],
      newStudents: monthlyStats[1],
      attendanceRate: monthlyStats[2]
    }

    const dashboardData = {
      instructor: {
        id: instructor.id,
        name: instructor.user.fullName,
        email: instructor.user.email,
        phone: instructor.user.phone,
        bio: instructor.user.bio,
        experience: instructor.experienceYears,
        specialties: instructor.specialty ? [instructor.specialty] : [],
        joinedDate: instructor.user.createdAt.toISOString()
      },
      stats,
      todaysClasses: transformedTodaysClasses,
      upcomingClasses: transformedUpcomingClasses,
      recentActivity,
      performanceMetrics
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Instructor dashboard API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid instructor ID format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch instructor dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }
}
