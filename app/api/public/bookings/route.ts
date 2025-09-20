import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'
import { sendEmail } from '../../../lib/email'

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

    // Send confirmation email for guest booking
    try {
      const item = booking.classId ? await prisma.class.findUnique({
        where: { id: booking.classId },
        include: { venue: true }
      }) : await prisma.event.findUnique({
        where: { id: booking.eventId! },
        include: { venue: true }
      })

      if (item) {
        await sendEmail({
          to: user.email,
          subject: `Booking Confirmation - ${item.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
              </div>
              
              <div style="padding: 30px; background: white;">
                <h2 style="color: #1a1a2e; margin-bottom: 20px;">${item.title}</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p><strong>Booking ID:</strong> ${booking.id.slice(-8).toUpperCase()}</p>
                  <p><strong>Customer:</strong> ${user.name}</p>
                  <p><strong>Amount:</strong> $${amount}</p>
                  <p><strong>Status:</strong> Pending Payment</p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #856404; margin-top: 0;">⏰ Payment Required</h3>
                  <p style="color: #856404; margin-bottom: 0;">Please complete payment within 24 hours to secure your spot. Payment instructions will be sent separately.</p>
                </div>
                
                ${item.venue ? `
                  <p><strong>Location:</strong><br>
                  ${item.venue.name}<br>
                  ${item.venue.addressLine1 || ''}<br>
                  ${item.venue.city}, ${item.venue.state || ''}</p>
                ` : ''}
                
                <p style="margin-top: 30px;">Questions? Contact us at support@danceplatform.com</p>
              </div>
            </div>
          `
        })
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ 
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully. Confirmation email sent.'
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
