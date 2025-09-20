import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        class: {
          include: {
            venue: {
              select: {
                name: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true
              }
            }
          }
        },
        event: {
          include: {
            venue: {
              select: {
                name: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true
              }
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Format the response data
    const response = {
      booking: {
        id: booking.id,
        status: booking.status,
        totalAmount: booking.amount.toString(),
        paymentStatus: booking.paymentStatus || 'pending',
        createdAt: booking.createdAt.toISOString(),
        user: {
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phoneNumber || 'N/A'
        },
        ...(booking.class && {
          class: {
            title: booking.class.title,
            description: booking.class.description,
            date: booking.class.startDate.toISOString(),
            time: booking.class.schedule || 'TBD',
            venue: booking.class.venue ? {
              name: booking.class.venue.name,
              address: [
                booking.class.venue.addressLine1,
                booking.class.venue.addressLine2,
                booking.class.venue.city,
                booking.class.venue.state
              ].filter(Boolean).join(', ')
            } : null
          }
        }),
        ...(booking.event && {
          event: {
            title: booking.event.title,
            description: booking.event.description,
            startDate: booking.event.startDate.toISOString(),
            endDate: booking.event.endDate.toISOString(),
            venue: booking.event.venue ? {
              name: booking.event.venue.name,
              address: [
                booking.event.venue.addressLine1,
                booking.event.venue.addressLine2,
                booking.event.venue.city,
                booking.event.venue.state
              ].filter(Boolean).join(', ')
            } : null
          }
        })
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}