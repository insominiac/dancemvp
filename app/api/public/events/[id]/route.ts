import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventData = await prisma.event.findUnique({
      where: {
        id: params.id,
        status: 'PUBLISHED' // Only show published events
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            addressLine1: true, // Use addressLine1 instead of address
            addressLine2: true
          }
        },
        eventStyles: {
          include: {
            style: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        },
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

    if (!eventData) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Add current attendees count
    const eventWithAttendeeCount = {
      ...eventData,
      currentAttendees: eventData._count.bookings
    }

    return NextResponse.json({ 
      event: eventWithAttendeeCount 
    })
  } catch (error) {
    console.error('Error fetching event details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event details' },
      { status: 500 }
    )
  }
}
