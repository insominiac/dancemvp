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
    
    const classId = searchParams.get('classId')
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

    // Set date range
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

    // Build where clause
    const whereClause: any = {
      instructorId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd
      }
    }

    if (classId) {
      whereClause.classId = classId
    }

    // Get student engagement data
    const engagementData = await prisma.studentEngagement.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate engagement statistics
    const stats = calculateEngagementStats(engagementData)

    // Get engagement trend over time
    const trendData = await getEngagementTrend(instructorId, periodStart, periodEnd, classId)

    // Get top performing and struggling students
    const studentPerformance = await getStudentPerformanceInsights(instructorId, periodStart, periodEnd, classId)

    // Get class-wise engagement if no specific class is selected
    const classEngagement = classId ? null : await getClasswiseEngagement(instructorId, periodStart, periodEnd)

    return NextResponse.json({
      success: true,
      data: {
        stats,
        trend: trendData,
        students: engagementData,
        insights: {
          topPerformers: studentPerformance.topPerformers,
          strugglingStudents: studentPerformance.strugglingStudents,
          improvementTrends: studentPerformance.improvements
        },
        classEngagement,
        period: {
          type: period,
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Engagement API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch engagement data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function calculateEngagementStats(engagementData: any[]) {
  if (engagementData.length === 0) {
    return {
      totalStudents: 0,
      averageParticipation: 0,
      averageAttention: 0,
      averageImprovement: 0,
      engagementDistribution: { high: 0, neutral: 0, low: 0 },
      totalQuestionsAsked: 0,
      totalHelpRequests: 0
    }
  }

  const totalStudents = engagementData.length
  const totalParticipation = engagementData.reduce((sum, item) => sum + item.participationScore, 0)
  const totalAttention = engagementData.reduce((sum, item) => sum + item.attentionScore, 0)
  const totalImprovement = engagementData.reduce((sum, item) => sum + item.improvementProgress, 0)
  const totalQuestions = engagementData.reduce((sum, item) => sum + item.questionsAsked, 0)
  const totalHelpRequests = engagementData.reduce((sum, item) => sum + item.helpRequested, 0)

  const engagementCounts = engagementData.reduce((counts, item) => {
    counts[item.engagementLevel.toLowerCase()]++
    return counts
  }, { high: 0, neutral: 0, low: 0 })

  return {
    totalStudents,
    averageParticipation: totalParticipation / totalStudents,
    averageAttention: totalAttention / totalStudents,
    averageImprovement: totalImprovement / totalStudents,
    engagementDistribution: {
      high: (engagementCounts.high / totalStudents) * 100,
      neutral: (engagementCounts.neutral / totalStudents) * 100,
      low: (engagementCounts.low / totalStudents) * 100
    },
    totalQuestionsAsked: totalQuestions,
    totalHelpRequests
  }
}

async function getEngagementTrend(instructorId: string, startDate: Date, endDate: Date, classId?: string) {
  const whereClause: any = { instructorId }
  if (classId) whereClause.classId = classId

  // Get weekly engagement averages over the period
  const rawData = await prisma.studentEngagement.groupBy({
    by: ['createdAt'],
    where: {
      ...whereClause,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _avg: {
      participationScore: true,
      attentionScore: true,
      improvementProgress: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  // Group by week and calculate averages
  const weeklyData = new Map()
  
  rawData.forEach(item => {
    const week = getWeekKey(item.createdAt)
    if (!weeklyData.has(week)) {
      weeklyData.set(week, {
        week,
        participation: [],
        attention: [],
        improvement: []
      })
    }
    
    const weekData = weeklyData.get(week)
    if (item._avg.participationScore) weekData.participation.push(item._avg.participationScore)
    if (item._avg.attentionScore) weekData.attention.push(item._avg.attentionScore)
    if (item._avg.improvementProgress) weekData.improvement.push(item._avg.improvementProgress)
  })

  return Array.from(weeklyData.values()).map(week => ({
    week: week.week,
    averageParticipation: week.participation.length > 0 
      ? week.participation.reduce((a, b) => a + b, 0) / week.participation.length : 0,
    averageAttention: week.attention.length > 0
      ? week.attention.reduce((a, b) => a + b, 0) / week.attention.length : 0,
    averageImprovement: week.improvement.length > 0
      ? week.improvement.reduce((a, b) => a + b, 0) / week.improvement.length : 0
  }))
}

async function getStudentPerformanceInsights(instructorId: string, startDate: Date, endDate: Date, classId?: string) {
  const whereClause: any = {
    instructorId,
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }
  if (classId) whereClause.classId = classId

  // Get student performance grouped by student
  const studentData = await prisma.studentEngagement.groupBy({
    by: ['userId'],
    where: whereClause,
    _avg: {
      participationScore: true,
      attentionScore: true,
      improvementProgress: true
    },
    _sum: {
      questionsAsked: true,
      helpRequested: true
    },
    _count: {
      id: true
    }
  })

  // Get user details for top and struggling students
  const userIds = studentData.map(item => item.userId)
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds }
    },
    select: {
      id: true,
      fullName: true,
      email: true
    }
  })

  const userMap = new Map(users.map(user => [user.id, user]))

  const studentsWithDetails = studentData.map(student => ({
    ...student,
    user: userMap.get(student.userId),
    overallScore: (
      (student._avg.participationScore || 0) + 
      (student._avg.attentionScore || 0) + 
      (student._avg.improvementProgress || 0)
    ) / 3
  }))

  // Sort by overall performance
  studentsWithDetails.sort((a, b) => b.overallScore - a.overallScore)

  return {
    topPerformers: studentsWithDetails.slice(0, 5),
    strugglingStudents: studentsWithDetails.slice(-5).reverse(),
    improvements: studentsWithDetails
      .filter(s => (s._avg.improvementProgress || 0) > 75)
      .slice(0, 5)
  }
}

async function getClasswiseEngagement(instructorId: string, startDate: Date, endDate: Date) {
  const classEngagement = await prisma.studentEngagement.groupBy({
    by: ['classId'],
    where: {
      instructorId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _avg: {
      participationScore: true,
      attentionScore: true,
      improvementProgress: true
    },
    _count: {
      id: true
    }
  })

  // Get class details
  const classIds = classEngagement.map(item => item.classId)
  const classes = await prisma.class.findMany({
    where: {
      id: { in: classIds }
    },
    select: {
      id: true,
      title: true
    }
  })

  const classMap = new Map(classes.map(cls => [cls.id, cls]))

  return classEngagement.map(item => ({
    class: classMap.get(item.classId),
    averageParticipation: item._avg.participationScore || 0,
    averageAttention: item._avg.attentionScore || 0,
    averageImprovement: item._avg.improvementProgress || 0,
    studentCount: item._count.id
  }))
}

function getWeekKey(date: Date): string {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  return startOfWeek.toISOString().split('T')[0]
}