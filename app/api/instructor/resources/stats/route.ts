import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/lib/session-middleware'
import db from '@/app/lib/db'

// GET /api/instructor/resources/stats - Get resource statistics for an instructor
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await validateSession(request, 'INSTRUCTOR')
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      )
    }

    // Verify instructor access
    const instructor = await db.instructor.findUnique({
      where: { id: instructorId },
      select: { userId: true }
    })

    if (!instructor || instructor.userId !== sessionResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get overall stats
    const totalResources = await db.instructorResource.count({
      where: { instructorId }
    })

    const totalViews = await db.instructorResource.aggregate({
      where: { instructorId },
      _sum: { views: true }
    })

    const totalDownloads = await db.instructorResource.aggregate({
      where: { instructorId },
      _sum: { downloads: true }
    })

    // Get stats by category
    const categoryStats = await db.instructorResource.groupBy({
      by: ['category'],
      where: { instructorId },
      _count: true,
      _sum: {
        views: true,
        downloads: true
      }
    })

    // Get stats by type
    const typeStats = await db.instructorResource.groupBy({
      by: ['type'],
      where: { instructorId },
      _count: true,
      _sum: {
        views: true,
        downloads: true
      }
    })

    // Get recent resources
    const recentResources = await db.instructorResource.findMany({
      where: { instructorId },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        views: true,
        downloads: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get most viewed resources
    const popularResources = await db.instructorResource.findMany({
      where: { 
        instructorId,
        views: { gt: 0 }
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        views: true,
        downloads: true,
        createdAt: true
      },
      orderBy: { views: 'desc' },
      take: 5
    })

    return NextResponse.json({
      overview: {
        totalResources,
        totalViews: totalViews._sum.views || 0,
        totalDownloads: totalDownloads._sum.downloads || 0,
        publicResources: await db.instructorResource.count({
          where: { instructorId, isPublic: true }
        })
      },
      categoryBreakdown: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count,
        views: stat._sum.views || 0,
        downloads: stat._sum.downloads || 0
      })),
      typeBreakdown: typeStats.map(stat => ({
        type: stat.type,
        count: stat._count,
        views: stat._sum.views || 0,
        downloads: stat._sum.downloads || 0
      })),
      recentResources,
      popularResources
    })

  } catch (error) {
    console.error('Error fetching resource stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}