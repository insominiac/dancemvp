import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { requireAdmin } from '@/app/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin(req)

    const { id } = params

    const danceStyle = await prisma.danceStyle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            classStyles: true,
            eventStyles: true,
            userStyles: true
          }
        }
      }
    })

    if (!danceStyle) {
      return NextResponse.json(
        { success: false, message: 'Dance style not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parseJsonField = (field: string | null) => {
      if (!field) return null
      try {
        return JSON.parse(field)
      } catch {
        return field
      }
    }

    const parsedDanceStyle = {
      ...danceStyle,
      characteristics: parseJsonField(danceStyle.characteristics),
      benefits: parseJsonField(danceStyle.benefits),
      schedule: parseJsonField(danceStyle.schedule)
    }

    return NextResponse.json({
      success: true,
      data: parsedDanceStyle
    })
  } catch (error) {
    console.error('Error fetching dance style:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dance style' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin(req)

    const { id } = params
    const body = await req.json()
    
    const {
      name,
      category,
      icon,
      subtitle,
      description,
      difficulty,
      origin,
      musicStyle,
      characteristics,
      benefits,
      schedule,
      price,
      instructors,
      image,
      videoUrl,
      isActive,
      isFeatured,
      sortOrder
    } = body

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    // Parse JSON fields if they're arrays or objects
    const parseJsonField = (field: any) => {
      if (field === null || field === undefined) return null
      if (typeof field === 'string') {
        try {
          return JSON.stringify(JSON.parse(field))
        } catch {
          return field
        }
      }
      return JSON.stringify(field)
    }

    const danceStyle = await prisma.danceStyle.update({
      where: { id },
      data: {
        name,
        category,
        icon,
        subtitle,
        description,
        difficulty,
        origin,
        musicStyle,
        characteristics: parseJsonField(characteristics),
        benefits: parseJsonField(benefits),
        schedule: parseJsonField(schedule),
        price,
        instructors,
        image,
        videoUrl,
        isActive,
        isFeatured,
        sortOrder
      },
      include: {
        _count: {
          select: {
            classStyles: true,
            eventStyles: true,
            userStyles: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: danceStyle,
      message: 'Dance style updated successfully'
    })
  } catch (error) {
    console.error('Error updating dance style:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update dance style' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin(req)

    const { id } = params

    // Check if dance style has associated classes or events
    const styleWithCounts = await prisma.danceStyle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            classStyles: true,
            eventStyles: true,
            userStyles: true
          }
        }
      }
    })

    if (!styleWithCounts) {
      return NextResponse.json(
        { success: false, message: 'Dance style not found' },
        { status: 404 }
      )
    }

    const totalAssociations = 
      styleWithCounts._count.classStyles + 
      styleWithCounts._count.eventStyles + 
      styleWithCounts._count.userStyles

    if (totalAssociations > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete dance style. It is associated with ${styleWithCounts._count.classStyles} classes, ${styleWithCounts._count.eventStyles} events, and ${styleWithCounts._count.userStyles} user profiles.`
        },
        { status: 400 }
      )
    }

    await prisma.danceStyle.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Dance style deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dance style:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete dance style' },
      { status: 500 }
    )
  }
}