import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET() {
  try {
    // Fetch only published events that haven't ended
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        endDate: {
          gte: new Date() // Only show future/ongoing events
        }
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true
          }
        },
        eventStyles: {
          include: {
            style: true
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
      },
      orderBy: [
        { isFeatured: 'desc' }, // Featured events first
        { startDate: 'asc' }
      ]
    })

    // Calculate current attendees for each event
    const eventsWithAttendeeCount = events.map(event => ({
      ...event,
      currentAttendees: event._count.bookings
    }))

    return NextResponse.json({ 
      events: eventsWithAttendeeCount,
      total: eventsWithAttendeeCount.length 
    })
  } catch (error) {
    console.error('Error fetching public events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
