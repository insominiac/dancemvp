import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

// Demo data function
function getDemoData() {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return {
    user: {
      id: 'temp-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'STUDENT',
      memberSince: lastMonth.toISOString()
    },
    stats: {
      totalBookings: 8,
      classesAttended: 5,
      totalSpent: 320.00,
      upcomingThisWeek: 2
    },
    upcomingBookings: [
      {
        id: 'demo-booking-1',
        confirmationCode: 'DEMO12345',
        bookingDate: lastMonth.toISOString(),
        status: 'CONFIRMED',
        paymentStatus: 'paid',
        totalAmount: 45.00,
        amountPaid: 45.00,
        type: 'class',
        item: {
          id: 'demo-class-1',
          title: 'Beginner Salsa',
          description: 'Learn the basics of salsa dancing in this fun and energetic class.',
          level: 'Beginner',
          duration: 60,
          startDate: nextWeek.toISOString(),
          endDate: nextWeek.toISOString(),
          scheduleTime: '19:00',
          venue: {
            name: 'Dance Studio Downtown',
            address: '123 Main St',
            city: 'Downtown'
          },
          instructors: [{
            id: 'demo-instructor-1',
            name: 'Maria Rodriguez',
            isPrimary: true
          }]
        }
      },
      {
        id: 'demo-booking-2',
        confirmationCode: 'DEMO67890',
        bookingDate: lastMonth.toISOString(),
        status: 'CONFIRMED',
        paymentStatus: 'paid',
        totalAmount: 55.00,
        amountPaid: 55.00,
        type: 'event',
        item: {
          id: 'demo-event-1',
          title: 'Weekend Dance Workshop',
          description: 'A comprehensive workshop covering multiple dance styles.',
          eventType: 'WORKSHOP',
          startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          startTime: '10:00',
          endTime: '16:00',
          venue: {
            name: 'Community Center',
            address: '456 Oak Ave',
            city: 'Midtown'
          }
        }
      }
    ],
    recentActivity: [
      {
        id: 'demo-activity-1',
        type: 'class',
        action: 'booking_created',
        title: 'Intermediate Hip Hop',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        paymentStatus: 'paid',
        amount: 50.00
      },
      {
        id: 'demo-activity-2',
        type: 'class',
        action: 'booking_created',
        title: 'Ballet Fundamentals',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        paymentStatus: 'paid',
        amount: 40.00
      }
    ],
    recommendedClasses: [
      {
        id: 'demo-rec-1',
        title: 'Advanced Tango',
        description: 'Perfect your tango technique with our expert instructor.',
        level: 'Advanced',
        price: 60.00,
        duration: 90,
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        scheduleTime: '20:00',
        venue: {
          name: 'Elite Dance Academy',
          address: '789 Dance Blvd',
          city: 'Uptown'
        },
        instructor: 'Carlos Mendez',
        spotsLeft: 8,
        totalSpots: 12
      },
      {
        id: 'demo-rec-2',
        title: 'Contemporary Flow',
        description: 'Express yourself through fluid contemporary movements.',
        level: 'Intermediate',
        price: 45.00,
        duration: 75,
        startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        scheduleTime: '18:30',
        venue: {
          name: 'Movement Studio',
          address: '321 Art St',
          city: 'Arts District'
        },
        instructor: 'Elena Thompson',
        spotsLeft: 5,
        totalSpots: 15
      },
      {
        id: 'demo-rec-3',
        title: 'Bachata Basics',
        description: 'Learn the sensual rhythms of bachata in a welcoming environment.',
        level: 'Beginner',
        price: 35.00,
        duration: 60,
        startDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        scheduleTime: '19:30',
        venue: {
          name: 'Latin Dance Center',
          address: '555 Rhythm Ave',
          city: 'Cultural Quarter'
        },
        instructor: 'Sofia Herrera',
        spotsLeft: 12,
        totalSpots: 20
      }
    ]
  }
}

interface DashboardParams {
  userId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: DashboardParams }
) {
  try {
    const { userId } = params

    // Handle demo mode for temp-user-id
    if (userId === 'temp-user-id') {
      return NextResponse.json({
        success: true,
        data: getDemoData()
      })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current date for filtering
    const now = new Date()

    // Fetch upcoming bookings (confirmed bookings for future classes/events)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'CONFIRMED',
        paymentStatus: 'succeeded',
        OR: [
          {
            class: {
              startDate: {
                gte: now
              }
            }
          },
          {
            event: {
              startDate: {
                gte: now
              }
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

    // Fetch recent bookings (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentBookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        class: true,
        event: true,
        transactions: {
          where: {
            provider: 'STRIPE'
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get user statistics
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED'
              }
            },
            transactions: {
              where: {
                provider: 'STRIPE',
                status: 'SUCCEEDED'
              }
            }
          }
        },
        bookings: {
          where: {
            status: 'CONFIRMED',
            paymentStatus: 'succeeded'
          },
          select: {
            amountPaid: true,
            class: {
              select: {
                startDate: true,
                endDate: true
              }
            },
            event: {
              select: {
                startDate: true
              }
            }
          }
        }
      }
    })

    // Calculate total spent
    const totalSpent = userStats?.bookings.reduce((sum, booking) => {
      return sum + Number(booking.amountPaid)
    }, 0) || 0

    // Calculate classes attended (past confirmed bookings)
    const classesAttended = userStats?.bookings.filter(booking => {
      if (booking.class) {
        return booking.class.endDate ? new Date(booking.class.endDate) < now : false
      }
      if (booking.event) {
        return new Date(booking.event.startDate) < now
      }
      return false
    }).length || 0

    // Get upcoming count (next 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const upcomingCount = await prisma.booking.count({
      where: {
        userId,
        status: 'CONFIRMED',
        paymentStatus: 'succeeded',
        OR: [
          {
            class: {
              startDate: {
                gte: now,
                lte: nextWeek
              }
            }
          },
          {
            event: {
              startDate: {
                gte: now,
                lte: nextWeek
              }
            }
          }
        ]
      }
    })

    // Get recommended classes (classes not yet booked by user, active classes)
    const recommendedClasses = await prisma.class.findMany({
      where: {
        isActive: true,
        startDate: {
          gte: now
        },
        NOT: {
          bookings: {
            some: {
              userId,
              status: {
                in: ['CONFIRMED', 'PENDING']
              }
            }
          }
        }
      },
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
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    })

    const dashboardData = {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        memberSince: user.createdAt
      },
      stats: {
        totalBookings: userStats?._count.bookings || 0,
        classesAttended,
        totalSpent: Number(totalSpent.toFixed(2)),
        upcomingThisWeek: upcomingCount
      },
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        bookingDate: booking.bookingDate,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: Number(booking.totalAmount),
        amountPaid: Number(booking.amountPaid),
        type: booking.class ? 'class' : 'event',
        item: booking.class ? {
          id: booking.class.id,
          title: booking.class.title,
          description: booking.class.description,
          level: booking.class.level,
          duration: booking.class.durationMins,
          startDate: booking.class.startDate,
          endDate: booking.class.endDate,
          scheduleTime: booking.class.scheduleTime,
          venue: booking.class.venue,
          instructors: booking.class.classInstructors.map(ci => ({
            id: ci.instructor.id,
            name: ci.instructor.user.fullName,
            isPrimary: ci.isPrimary
          }))
        } : {
          id: booking.event!.id,
          title: booking.event!.title,
          description: booking.event!.description,
          eventType: booking.event!.eventType,
          startDate: booking.event!.startDate,
          endDate: booking.event!.endDate,
          startTime: booking.event!.startTime,
          endTime: booking.event!.endTime,
          venue: booking.event!.venue,
          organizer: booking.event!.organizer
        }
      })),
      recentActivity: recentBookings.map(booking => ({
        id: booking.id,
        type: booking.class ? 'class' : 'event',
        action: 'booking_created',
        title: booking.class?.title || booking.event?.title,
        date: booking.createdAt,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        amount: Number(booking.amountPaid)
      })),
      recommendedClasses: recommendedClasses.map(cls => ({
        id: cls.id,
        title: cls.title,
        description: cls.description,
        level: cls.level,
        price: Number(cls.price),
        duration: cls.durationMins,
        startDate: cls.startDate,
        scheduleTime: cls.scheduleTime,
        venue: cls.venue,
        instructor: cls.classInstructors[0]?.instructor.user.fullName || 'TBA',
        spotsLeft: cls.maxCapacity - (cls._count.bookings || 0),
        totalSpots: cls.maxCapacity
      }))
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
