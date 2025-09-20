import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { emailService } from '@/app/lib/email'
import { z } from 'zod'

const bookingIdSchema = z.string().uuid('Invalid booking ID format')

// Schema for cancellation
const cancellationSchema = z.object({
  reason: z.string().optional(),
  requestRefund: z.boolean().default(false)
})

// Schema for rescheduling
const rescheduleSchema = z.object({
  newClassId: z.string().uuid(),
  reason: z.string().optional()
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = bookingIdSchema.parse(params.bookingId)
    const body = await request.json()
    const { reason, requestRefund } = cancellationSchema.parse(body)

    // Get booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        class: {
          include: {
            venue: true,
            classInstructors: {
              include: {
                instructor: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        event: {
          include: {
            venue: true,
            organizer: true
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

    // Check if booking can be cancelled (e.g., not too close to class time)
    const item = booking.class || booking.event
    if (item) {
      const hoursUntilClass = (item.startDate.getTime() - Date.now()) / (1000 * 60 * 60)
      const cancellationPolicy = getCancellationPolicy(hoursUntilClass)
      
      if (!cancellationPolicy.canCancel) {
        return NextResponse.json(
          { 
            error: 'Cannot cancel booking',
            message: cancellationPolicy.message,
            policy: cancellationPolicy
          },
          { status: 400 }
        )
      }
    }

    // Calculate refund amount
    const refundAmount = calculateRefund(booking, item?.startDate)

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        paymentStatus: requestRefund && refundAmount > 0 ? 'refund_pending' : booking.paymentStatus,
        cancellationReason: reason,
        cancelledAt: new Date()
      }
    })

    // Update class/event capacity
    if (booking.classId) {
      await prisma.class.update({
        where: { id: booking.classId },
        data: {
          currentStudents: {
            decrement: 1
          }
        }
      })
    } else if (booking.eventId) {
      await prisma.event.update({
        where: { id: booking.eventId },
        data: {
          currentAttendees: {
            decrement: 1
          }
        }
      })
    }

    // Process waitlist if applicable
    if (booking.classId || booking.eventId) {
      await processWaitlist(booking.classId || booking.eventId!, booking.classId ? 'class' : 'event')
    }

    // Create refund record if applicable
    let refundRecord = null
    if (requestRefund && refundAmount > 0) {
      refundRecord = await prisma.refund.create({
        data: {
          bookingId: booking.id,
          userId: booking.userId,
          amount: refundAmount,
          reason: reason || 'Booking cancellation',
          status: 'PENDING',
          requestedAt: new Date()
        }
      })
    }

    // Send cancellation email
    try {
      await sendCancellationEmail(booking, refundAmount, refundRecord)
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount,
      refund: refundRecord,
      canRefund: refundAmount > 0,
      waitlistProcessed: booking.classId || booking.eventId ? true : false
    })

  } catch (error) {
    console.error('Booking cancellation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to cancel booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = bookingIdSchema.parse(params.bookingId)
    const body = await request.json()
    const { newClassId, reason } = rescheduleSchema.parse(body)

    // Get original booking
    const originalBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        class: {
          include: {
            venue: true
          }
        }
      }
    })

    if (!originalBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Get new class details
    const newClass = await prisma.class.findUnique({
      where: { id: newClassId },
      include: {
        venue: true
      }
    })

    if (!newClass) {
      return NextResponse.json(
        { error: 'New class not found' },
        { status: 404 }
      )
    }

    // Check if new class has availability
    if (newClass.currentStudents >= newClass.maxStudents) {
      return NextResponse.json(
        { error: 'New class is full' },
        { status: 409 }
      )
    }

    // Check rescheduling policy
    const originalItem = originalBooking.class
    if (originalItem) {
      const hoursUntilClass = (originalItem.startDate.getTime() - Date.now()) / (1000 * 60 * 60)
      const reschedulePolicy = getReschedulePolicy(hoursUntilClass)
      
      if (!reschedulePolicy.canReschedule) {
        return NextResponse.json(
          { 
            error: 'Cannot reschedule booking',
            message: reschedulePolicy.message,
            policy: reschedulePolicy
          },
          { status: 400 }
        )
      }
    }

    // Calculate any price difference
    const priceDifference = Number(newClass.price) - Number(originalBooking.totalAmount)

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        classId: newClassId,
        totalAmount: Number(newClass.price),
        rescheduleReason: reason,
        rescheduledAt: new Date(),
        rescheduledFromClassId: originalBooking.classId
      }
    })

    // Update class capacities
    if (originalBooking.classId) {
      await Promise.all([
        // Decrement old class
        prisma.class.update({
          where: { id: originalBooking.classId },
          data: {
            currentStudents: { decrement: 1 }
          }
        }),
        // Increment new class
        prisma.class.update({
          where: { id: newClassId },
          data: {
            currentStudents: { increment: 1 }
          }
        })
      ])
    }

    // Process waitlist for the original class
    if (originalBooking.classId) {
      await processWaitlist(originalBooking.classId, 'class')
    }

    // Handle price difference
    let paymentRequired = null
    if (priceDifference > 0) {
      // Create payment record for additional amount
      paymentRequired = {
        amount: priceDifference,
        description: 'Additional payment for rescheduled class'
      }
    } else if (priceDifference < 0) {
      // Create refund record for price difference
      await prisma.refund.create({
        data: {
          bookingId: updatedBooking.id,
          userId: originalBooking.userId,
          amount: Math.abs(priceDifference),
          reason: 'Refund for rescheduled class price difference',
          status: 'PENDING',
          requestedAt: new Date()
        }
      })
    }

    // Send rescheduling email
    try {
      await sendRescheduleEmail(originalBooking, newClass, priceDifference)
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking: updatedBooking,
      priceDifference,
      paymentRequired,
      newClass: {
        id: newClass.id,
        title: newClass.title,
        startDate: newClass.startDate.toISOString(),
        venue: newClass.venue ? {
          name: newClass.venue.name,
          address: newClass.venue.address,
          city: newClass.venue.city
        } : null
      }
    })

  } catch (error) {
    console.error('Booking reschedule error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to reschedule booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions

function getCancellationPolicy(hoursUntilClass: number) {
  if (hoursUntilClass >= 24) {
    return {
      canCancel: true,
      refundPercentage: 100,
      message: 'Full refund available'
    }
  } else if (hoursUntilClass >= 12) {
    return {
      canCancel: true,
      refundPercentage: 75,
      message: '75% refund available'
    }
  } else if (hoursUntilClass >= 2) {
    return {
      canCancel: true,
      refundPercentage: 50,
      message: '50% refund available'
    }
  } else {
    return {
      canCancel: false,
      refundPercentage: 0,
      message: 'Cannot cancel within 2 hours of class'
    }
  }
}

function getReschedulePolicy(hoursUntilClass: number) {
  if (hoursUntilClass >= 12) {
    return {
      canReschedule: true,
      fee: 0,
      message: 'Free rescheduling available'
    }
  } else if (hoursUntilClass >= 4) {
    return {
      canReschedule: true,
      fee: 5,
      message: '$5 rescheduling fee applies'
    }
  } else {
    return {
      canReschedule: false,
      fee: 0,
      message: 'Cannot reschedule within 4 hours of class'
    }
  }
}

function calculateRefund(booking: any, classStartDate?: Date): number {
  if (!classStartDate) return 0
  
  const hoursUntilClass = (classStartDate.getTime() - Date.now()) / (1000 * 60 * 60)
  const policy = getCancellationPolicy(hoursUntilClass)
  
  return (Number(booking.amountPaid) * policy.refundPercentage) / 100
}

async function processWaitlist(itemId: string, type: 'class' | 'event') {
  // Get next person on waitlist
  const nextInLine = await prisma.waitlist.findFirst({
    where: {
      [type === 'class' ? 'classId' : 'eventId']: itemId,
      status: 'ACTIVE'
    },
    include: {
      user: true
    },
    orderBy: [
      { priority: 'desc' },
      { position: 'asc' }
    ]
  })

  if (nextInLine) {
    // Create booking for waitlisted user
    const item = type === 'class' ? 
      await prisma.class.findUnique({ where: { id: itemId } }) :
      await prisma.event.findUnique({ where: { id: itemId } })

    if (item) {
      await prisma.booking.create({
        data: {
          userId: nextInLine.userId,
          [type === 'class' ? 'classId' : 'eventId']: itemId,
          status: 'PENDING',
          totalAmount: Number(item.price),
          amountPaid: 0,
          paymentStatus: 'pending',
          confirmationCode: `WL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdFrom: 'WAITLIST'
        }
      })

      // Update waitlist status
      await prisma.waitlist.update({
        where: { id: nextInLine.id },
        data: { status: 'CONVERTED' }
      })

      // Send notification email about spot availability
      // TODO: Implement waitlist notification email
      console.log(`Notified ${nextInLine.user.email} about available spot`)
    }
  }
}

async function sendCancellationEmail(booking: any, refundAmount: number, refundRecord: any) {
  // TODO: Implement cancellation email template
  console.log('Sending cancellation email', { 
    booking: booking.id, 
    refundAmount, 
    hasRefund: !!refundRecord 
  })
}

async function sendRescheduleEmail(originalBooking: any, newClass: any, priceDifference: number) {
  // TODO: Implement reschedule email template
  console.log('Sending reschedule email', { 
    booking: originalBooking.id, 
    newClass: newClass.id, 
    priceDifference 
  })
}
