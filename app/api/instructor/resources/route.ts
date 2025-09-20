import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/lib/session-middleware'
import db from '@/app/lib/db'

// GET /api/instructor/resources - Get all resources for an instructor
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
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const classId = searchParams.get('classId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      instructorId
    }

    if (category) where.category = category
    if (type) where.type = type
    if (classId) where.classId = classId

    const [resources, totalCount] = await Promise.all([
      db.instructorResource.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      db.instructorResource.count({ where })
    ])

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/instructor/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await validateSession(request, 'INSTRUCTOR')
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      instructorId,
      title,
      description,
      type,
      category,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      content,
      tags,
      isPublic,
      classId,
      sortOrder
    } = body

    // Validate required fields
    if (!instructorId || !title || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: instructorId, title, type, category' },
        { status: 400 }
      )
    }

    // Verify instructor exists and user has access
    const instructor = await db.instructor.findUnique({
      where: { id: instructorId },
      include: { user: true }
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    if (instructor.userId !== sessionResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const resource = await db.instructorResource.create({
      data: {
        instructorId,
        title,
        description,
        type,
        category,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        content,
        tags: tags || [],
        isPublic: isPublic || false,
        classId,
        sortOrder: sortOrder || 0
      },
      include: {
        class: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({ resource }, { status: 201 })

  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}