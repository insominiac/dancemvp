import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/lib/session-middleware'
import db from '@/app/lib/db'

// GET /api/instructor/resources/[id] - Get a specific resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await validateSession(request, 'INSTRUCTOR')
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      )
    }

    const resource = await db.instructorResource.findUnique({
      where: { id: params.id },
      include: {
        class: {
          select: {
            id: true,
            title: true
          }
        },
        instructor: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this resource
    if (resource.instructor.userId !== sessionResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Increment view count
    await db.instructorResource.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ resource })

  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/instructor/resources/[id] - Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if resource exists and user has access
    const existingResource = await db.instructorResource.findUnique({
      where: { id: params.id },
      include: {
        instructor: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    if (existingResource.instructor.userId !== sessionResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const updatedResource = await db.instructorResource.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        category,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        content,
        tags: tags || existingResource.tags,
        isPublic: isPublic ?? existingResource.isPublic,
        classId,
        sortOrder: sortOrder ?? existingResource.sortOrder
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

    return NextResponse.json({ resource: updatedResource })

  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/instructor/resources/[id] - Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await validateSession(request, 'INSTRUCTOR')
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      )
    }

    // Check if resource exists and user has access
    const resource = await db.instructorResource.findUnique({
      where: { id: params.id },
      include: {
        instructor: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    if (resource.instructor.userId !== sessionResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    await db.instructorResource.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}