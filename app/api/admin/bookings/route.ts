import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all bookings with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const userId = searchParams.get('userId') || ''
    const classId = searchParams.get('classId') || ''
    const eventId = searchParams.get('eventId') || ''
    
    const skip = (page - 1) * limit
    
    const where: any = {
      ...(status && { status }),
      ...(userId && { userId: parseInt(userId) }),
      ...(classId && { classId: parseInt(classId) }),
      ...(eventId && { eventId: parseInt(eventId) })
    }
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          class: {
            include: {
              classInstructors: {
                include: {
                  instructor: {
                    include: { user: true }
                  }
                }
              }
            }
          },
          event: {
            include: { venue: true }
          },
          transactions: true
        }
      }),
      prisma.booking.count({ where })
    ])
    
    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, classId, eventId, status, 
      amountPaid, paymentMethod, notes 
    } = body
    
    // Validate that either classId or eventId is provided
    if (!classId && !eventId) {
      return NextResponse.json(
        { error: 'Either classId or eventId must be provided' },
        { status: 400 }
      )
    }
    
    if (classId && eventId) {
      return NextResponse.json(
        { error: 'Only one of classId or eventId should be provided' },
        { status: 400 }
      )
    }
    
    // Check for duplicate booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        ...(classId ? { classId } : { eventId })
      }
    })
    
    if (existingBooking) {
      return NextResponse.json(
        { error: 'User already has a booking for this class/event' },
        { status: 400 }
      )
    }
    
    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        classId,
        eventId,
        status: status || 'PENDING',
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        notes
      },
      include: {
        user: true,
        class: true,
        event: true
      }
    })
    
    // Update event attendee count if it's an event booking
    if (eventId && status === 'CONFIRMED') {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          currentAttendees: { increment: 1 }
        }
      })
    }
    
    return NextResponse.json({
      message: 'Booking created successfully',
      booking: newBooking
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
