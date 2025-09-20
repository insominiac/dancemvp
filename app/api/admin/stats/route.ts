import { NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

export async function GET() {
  try {
    // Get all counts
    const [
      totalUsers,
      totalClasses,
      totalEvents,
      totalBookings,
      totalVenues,
      totalInstructors,
      confirmedBookings,
      totalTransactions,
      totalForumPosts,
      totalTestimonials,
      totalDanceStyles,
      unreadNotifications,
      activePartnerRequests,
      unreadMessages
    ] = await Promise.all([
      prisma.user.count(),
      prisma.class.count(),
      prisma.event.count(),
      prisma.booking.count(),
      prisma.venue.count(),
      prisma.instructor.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.transaction.count(),
      prisma.forumPost.count(),
      prisma.testimonial.count(),
      prisma.danceStyle.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.matchRequest.count({ where: { status: 'PENDING' } }),
      prisma.contactMessage.count({ where: { isRead: false } })
    ])

    // Calculate revenue from confirmed bookings
    const revenue = await prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amountPaid: true }
    })

    // Get user breakdown by role
    const [adminCount, instructorCount, studentCount] = await Promise.all([
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.user.count({ where: { role: 'USER' } })
    ])

    // Get recent activity
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        class: true,
        event: true
      }
    })

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    const recentPosts = await prisma.forumPost.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalClasses,
        totalEvents,
        totalBookings,
        totalVenues,
        totalInstructors,
        confirmedBookings,
        totalTransactions,
        totalForumPosts,
        totalTestimonials,
        totalDanceStyles,
        totalRevenue: revenue._sum.amountPaid || 0,
        unreadNotifications,
        activePartnerRequests,
        unreadMessages,
        userBreakdown: {
          admins: adminCount,
          instructors: instructorCount,
          students: studentCount
        }
      },
      recentActivity: {
        bookings: recentBookings,
        users: recentUsers,
        posts: recentPosts
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
