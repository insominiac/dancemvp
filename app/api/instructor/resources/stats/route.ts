import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/lib/session-middleware'
import db from '@/app/lib/db'

// GET /api/instructor/resources/stats - Get resource statistics for an instructor
export async function GET(request: NextRequest) {
  try {
    // For now, return mock data since InstructorResource table doesn't exist yet
    // TODO: Implement proper resource management when the feature is added
    
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      )
    }

    // Verify instructor exists
    const instructor = await db.instructor.findUnique({
      where: { id: instructorId },
      select: { id: true, userId: true, user: { select: { fullName: true } } }
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    // Return mock resource stats
    const mockStats = {
      overview: {
        totalResources: 0,
        totalViews: 0,
        totalDownloads: 0,
        publicResources: 0
      },
      categoryBreakdown: [],
      typeBreakdown: [],
      recentResources: [],
      popularResources: []
    }

    return NextResponse.json(mockStats)

  } catch (error) {
    console.error('Error fetching resource stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
