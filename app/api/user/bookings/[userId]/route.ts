import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

// Demo bookings data
function getDemoBookingsData() {
  const now = new Date()
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const demoBooking1 = {
    id: 'demo-booking-1',
    confirmationCode: 'DEMO12345',
    bookingDate: pastDate.toISOString(),
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 45.00,
    amountPaid: 45.00,
    type: 'class' as const,
    item: {
      id: 'demo-class-1',
      title: 'Beginner Salsa',
      description: 'Learn the basics of salsa dancing in this fun and energetic class.',
      level: 'Beginner',
      startDate: futureDate.toISOString(),
      endDate: futureDate.toISOString(),
      scheduleTime: '19:00',
      venue: {
        name: 'Dance Studio Downtown',
        address: '123 Main St',
        city: 'Downtown'
      },
      instructors: [{
        name: 'Maria Rodriguez',
        email: 'maria@dancestudio.com'
      }]
    },
    transaction: {
      id: 'demo-txn-1',
      amount: 45.00,
      paymentDate: pastDate.toISOString(),
      paymentMethod: 'card',
      transactionId: 'pi_demo12345'
    }
  }
  
  const demoBooking2 = {
    id: 'demo-booking-2',
    confirmationCode: 'DEMO67890',
    bookingDate: pastDate.toISOString(),
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 55.00,
    amountPaid: 55.00,
    type: 'event' as const,
    item: {
      id: 'demo-event-1',
      title: 'Weekend Dance Workshop',
      description: 'A comprehensive workshop covering multiple dance styles.',
      level: 'All Levels',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      scheduleTime: '10:00',
      venue: {
        name: 'Community Center',
        address: '456 Oak Ave',
        city: 'Midtown'
      }
    },
    transaction: {
      id: 'demo-txn-2',
      amount: 55.00,
      paymentDate: pastDate.toISOString(),
      paymentMethod: 'card',
      transactionId: 'pi_demo67890'
    }
  }
  
  const pastBooking = {
    id: 'demo-booking-past',
    confirmationCode: 'DEMO-PAST',
    bookingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    paymentStatus: 'paid',
    totalAmount: 40.00,
    amountPaid: 40.00,
    type: 'class' as const,
    item: {
      id: 'demo-class-past',
      title: 'Hip Hop Fundamentals',
      description: 'Master the basics of hip hop dance.',
      level: 'Beginner',
      startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      scheduleTime: '18:00',
      venue: {
        name: 'Urban Dance Studio',
        address: '789 Beat St',
        city: 'Music District'
      },
      instructors: [{
        name: 'DJ Mike',
        email: 'mike@urbandance.com'
      }]
    },
    transaction: {
      id: 'demo-txn-past',
      amount: 40.00,
      paymentDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'card',
      transactionId: 'pi_demo_past'
    }
  }
  
  return {
    upcoming: [demoBooking1, demoBooking2],
    past: [pastBooking],
    cancelled: []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Handle demo mode for temp-user-id
    if (userId === 'temp-user-id') {
      return NextResponse.json({
        success: true,
        data: getDemoBookingsData()
      })
    }

    // Get current date for categorizing bookings
    const now = new Date()

    // Fetch all user bookings with related data
const allBookings = await prisma.booking.findMany({
      where: {
        userId: userId
      },
      include: {
        class: {
          include: {
            venue: true,
            instructors: {
              include: {
                instructor: true
              }
            }
          }
        },
        event: {
          include: {
            venue: true
          }
        },
        transaction: true
      },
      orderBy: [
        { bookingDate: 'desc' }
      ]
    })

    // Transform and categorize bookings
    const transformBooking = (booking: any) => {
      const item = booking.class || booking.event
      const type = booking.class ? 'class' : 'event'
      
      // Transform instructors for classes
      const instructors = booking.class?.instructors?.map((ci: any) => ({
        name: ci.instructor.name,
        email: ci.instructor.email
      })) || []

      return {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        bookingDate: booking.bookingDate.toISOString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: parseFloat(booking.totalAmount.toString()),
        amountPaid: parseFloat(booking.amountPaid.toString()),
        type,
        item: {
          id: item.id,
          title: item.title,
          description: item.description || '',
          level: item.level || 'All Levels',
          startDate: item.startDate.toISOString(),
          endDate: item.endDate?.toISOString() || item.startDate.toISOString(),
          scheduleTime: item.scheduleTime,
          venue: item.venue ? {
            name: item.venue.name,
            address: item.venue.address,
            city: item.venue.city
          } : null,
          instructors: instructors
        },
        transaction: booking.transaction ? {
          id: booking.transaction.id,
          amount: parseFloat(booking.transaction.amount.toString()),
          paymentDate: booking.transaction.paymentDate.toISOString(),
          paymentMethod: booking.transaction.paymentMethod,
          transactionId: booking.transaction.transactionId
        } : null
      }
    }

    // Transform all bookings
    const transformedBookings = allBookings.map(transformBooking)

    // Categorize bookings
    const upcoming = transformedBookings.filter(booking => {
      const startDate = new Date(booking.item.startDate)
      return startDate > now && booking.status === 'confirmed'
    })

    const past = transformedBookings.filter(booking => {
      const startDate = new Date(booking.item.startDate)
      return startDate <= now && (booking.status === 'confirmed' || booking.status === 'completed')
    })

    const cancelled = transformedBookings.filter(booking => 
      booking.status === 'cancelled'
    )

    // Sort each category appropriately
    upcoming.sort((a, b) => new Date(a.item.startDate).getTime() - new Date(b.item.startDate).getTime())
    past.sort((a, b) => new Date(b.item.startDate).getTime() - new Date(a.item.startDate).getTime())
    cancelled.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())

    const data = {
      upcoming,
      past,
      cancelled
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Bookings API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
