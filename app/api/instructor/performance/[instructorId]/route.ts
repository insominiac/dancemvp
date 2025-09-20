import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { instructorIdSchema } from '@/app/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { instructorId: string } }
) {
  try {
    const instructorId = instructorIdSchema.parse(params.instructorId)
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || 'monthly'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Verify instructor exists
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId }
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    // Set date range based on period
    const now = new Date()
    let periodStart: Date
    let periodEnd: Date

    if (startDate && endDate) {
      periodStart = new Date(startDate)
      periodEnd = new Date(endDate)
    } else {
      switch (period) {
        case 'weekly':
          periodStart = new Date(now.setDate(now.getDate() - 7))
          periodEnd = new Date()
          break
        case 'yearly':
          periodStart = new Date(now.getFullYear(), 0, 1)
          periodEnd = new Date(now.getFullYear(), 11, 31)
          break
        case 'daily':
          periodStart = new Date(now.setHours(0, 0, 0, 0))
          periodEnd = new Date(now.setHours(23, 59, 59, 999))
          break
        default: // monthly
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    }

    // Get or create performance record for this period
    let performanceRecord = await prisma.instructorPerformance.findUnique({
      where: {
        instructorId_period_periodStart: {
          instructorId,
          period,
          periodStart
        }
      }
    })

    // If no record exists, calculate and create it
    if (!performanceRecord) {
      const metrics = await calculatePerformanceMetrics(instructorId, periodStart, periodEnd)
      
      performanceRecord = await prisma.instructorPerformance.create({
        data: {
          instructorId,
          period,
          periodStart,
          periodEnd,
          ...metrics
        }
      })
    }

    // Get recent performance trend (last 6 periods)
    const trendData = await prisma.instructorPerformance.findMany({
      where: {
        instructorId,
        period,
        periodStart: {
          lte: periodStart
        }
      },
      orderBy: {
        periodStart: 'desc'
      },
      take: 6
    })

    // Get detailed class analytics for the period
    const classAnalytics = await prisma.classAnalytics.findMany({
      where: {
        instructorId,
        date: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      include: {
        class: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Get student feedback summary
    const feedbackSummary = await prisma.studentFeedback.aggregate({
      where: {
        instructorId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      _avg: {
        overallRating: true,
        teachingRating: true,
        contentRating: true,
        engagementRating: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        currentPeriod: performanceRecord,
        trend: trendData.reverse(), // Oldest to newest
        classAnalytics,
        feedbackSummary: {
          averageRating: feedbackSummary._avg.overallRating,
          teachingRating: feedbackSummary._avg.teachingRating,
          contentRating: feedbackSummary._avg.contentRating,
          engagementRating: feedbackSummary._avg.engagementRating,
          totalFeedback: feedbackSummary._count.id
        },
        period: {
          type: period,
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch performance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function calculatePerformanceMetrics(
  instructorId: string,
  periodStart: Date,
  periodEnd: Date
) {
  // Get all classes taught in this period
  const classes = await prisma.class.findMany({
    where: {
      classInstructors: {
        some: { instructorId }
      },
      startDate: {
        gte: periodStart,
        lte: periodEnd
      }
    },
    include: {
      bookings: {
        where: {
          status: 'CONFIRMED'
        },
        include: {
          attendance: true,
          feedback: true
        }
      }
    }
  })

  const totalClasses = classes.length
  let totalStudents = 0
  let totalHours = 0
  let attendedClasses = 0
  let totalAttendees = 0
  let totalFeedback = 0
  let totalRating = 0
  let newStudents = 0
  let returningStudents = 0
  let noShows = 0
  let totalRevenue = 0

  const studentHistory = new Set()

  for (const classData of classes) {
    totalHours += classData.durationMins / 60
    
    for (const booking of classData.bookings) {
      totalStudents++
      totalRevenue += Number(booking.amountPaid)
      
      // Check if student has attended before
      if (studentHistory.has(booking.userId)) {
        returningStudents++
      } else {
        newStudents++
        studentHistory.add(booking.userId)
      }

      // Count attendance
      if (booking.attendance) {
        if (booking.attendance.status === 'PRESENT') {
          attendedClasses++
          totalAttendees++
        } else if (booking.attendance.status === 'ABSENT') {
          noShows++
        }
      }

      // Count feedback
      if (booking.feedback) {
        totalFeedback++
        totalRating += booking.feedback.overallRating
      }
    }
  }

  const attendanceRate = totalStudents > 0 ? (totalAttendees / totalStudents) * 100 : 0
  const averageRating = totalFeedback > 0 ? totalRating / totalFeedback : null
  const averageClassSize = totalClasses > 0 ? totalStudents / totalClasses : 0
  const completionRate = totalStudents > 0 ? ((totalStudents - noShows) / totalStudents) * 100 : 0

  return {
    totalClasses,
    totalStudents,
    totalHours,
    averageRating,
    attendanceRate,
    completionRate,
    retentionRate: totalStudents > 0 ? (returningStudents / totalStudents) * 100 : 0,
    newStudents,
    returningStudents,
    totalRevenue,
    averageClassSize,
    noShows,
    cancellations: 0, // TODO: Calculate from booking cancellations
    feedbackCount: totalFeedback,
    recommendationRate: 0 // TODO: Calculate from feedback recommendations
  }
}