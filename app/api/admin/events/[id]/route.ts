import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        venue: true,
        organizer: true,
        eventStyles: {
          include: { style: true }
        },
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      title, description, eventType, startDate, endDate,
      startTime, endTime, venueId, price, maxAttendees,
      imageUrl, organizerUserId, status, isFeatured, styleIds 
    } = body

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        venueId,
        price: parseFloat(price),
        maxAttendees: parseInt(maxAttendees),
        imageUrl,
        organizerUserId,
        status: status || 'DRAFT',
        isFeatured: isFeatured || false
      }
    })

    // Update styles if provided
    if (styleIds !== undefined) {
      // Remove existing styles
      await prisma.eventStyle.deleteMany({
        where: { eventId: params.id }
      })

      // Add new styles
      if (styleIds && styleIds.length > 0) {
        await prisma.eventStyle.createMany({
          data: styleIds.map((styleId: string) => ({
            eventId: params.id,
            styleId
          }))
        })
      }
    }

    // Fetch complete updated event data
    const completeEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        venue: true,
        organizer: true,
        eventStyles: {
          include: { style: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Event updated successfully',
      event: completeEvent
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { 
            bookings: {
              where: {
                status: {
                  in: ['CONFIRMED', 'COMPLETED']
                }
              }
            }
          }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if there are confirmed bookings
    if (existingEvent._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with confirmed bookings' },
        { status: 400 }
      )
    }

    // Delete the event (cascade will handle related records)
    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
