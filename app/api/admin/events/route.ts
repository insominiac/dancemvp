import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all events with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const venueId = searchParams.get('venueId') || ''
    
    const skip = (page - 1) * limit
    
    const where: any = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        status ? { status } : {},
        venueId ? { venueId } : {}
      ]
    }
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
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
      }),
      prisma.event.count({ where })
    ])
    
    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, description, eventType, startDate, endDate,
      startTime, endTime, venueId, price, maxAttendees,
      imageUrl, organizerUserId, status, isFeatured, styleIds 
    } = body
    
    // Create event
    const newEvent = await prisma.event.create({
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
        currentAttendees: 0,
        imageUrl,
        organizerUserId,
        status: status || 'DRAFT',
        isFeatured: isFeatured || false
      }
    })
    
    // Assign styles if provided
    if (styleIds && styleIds.length > 0) {
      await prisma.eventStyle.createMany({
        data: styleIds.map((styleId: string) => ({
          eventId: newEvent.id,
          styleId
        }))
      })
    }
    
    // Fetch complete event data
    const completeEvent = await prisma.event.findUnique({
      where: { id: newEvent.id },
      include: {
        venue: true,
        organizer: true,
        eventStyles: {
          include: { style: true }
        }
      }
    })
    
    return NextResponse.json({
      message: 'Event created successfully',
      event: completeEvent
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
