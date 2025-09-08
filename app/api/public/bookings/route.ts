import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      classId, 
      eventId, 
      name, 
      email, 
      phone, 
      emergencyContact,
      emergencyPhone,
      experience,
      notes 
    } = body

    // For demo purposes, we'll create a temporary user or find existing one
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create a temporary user for the booking
      user = await prisma.user.create({
        data: {
          email,
          name,
          phoneNumber: phone,
          // In production, you'd handle password properly
          password: 'temp_booking_user',
          role: 'Student'
        }
      })
    }

    // Determine booking type and get price
    let bookingType = 'Class'
    let amount = '0'
    
    if (classId) {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: { price: true, maxStudents: true },
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
      
      if (!classData) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        )
      }

      // Check if class is full
      if (classData._count.bookings >= classData.maxStudents) {
        return NextResponse.json(
          { error: 'Class is full' },
          { status: 400 }
        )
      }

      amount = classData.price.toString()
      bookingType = 'Class'
    } else if (eventId) {
      const eventData = await prisma.event.findUnique({
        where: { id: eventId },
        select: { price: true, maxAttendees: true },
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
      
      if (!eventData) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

      // Check if event is full
      if (eventData._count.bookings >= eventData.maxAttendees) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        )
      }

      amount = eventData.price.toString()
      bookingType = 'Event'
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        classId: classId || null,
        eventId: eventId || null,
        bookingType,
        status: 'PENDING', // Will be confirmed after payment
        amount: parseFloat(amount),
        notes: notes || `Emergency Contact: ${emergencyContact} (${emergencyPhone}). Experience: ${experience}`
      }
    })

    // In production, you would:
    // 1. Create a payment intent with Stripe
    // 2. Send confirmation email
    // 3. Create notification

    return NextResponse.json({ 
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully. Awaiting payment confirmation.'
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
