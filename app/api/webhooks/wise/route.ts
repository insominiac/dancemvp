import { NextRequest, NextResponse } from 'next/server'
import { wiseService } from '@/app/lib/wise'
import { emailService } from '@/app/lib/email'
import { NotificationTriggers } from '@/app/lib/notification-triggers'
import prisma from '@/app/lib/db'

// Wise webhook event types
interface WiseWebhookEvent {
  id: string
  event_type: string
  resource: {
    id: string
    profile_id: string
    account_id?: string
    type: string
  }
  occurred_at: string
  data?: any
}

// Helper function to update booking status based on Wise transfer status
async function updateBookingStatus(transferId: string, wiseStatus: string) {
  try {
    // Find the transaction and booking
    const transaction = await prisma.transaction.findFirst({
      where: {
        provider: 'WISE',
        providerPaymentId: transferId,
      },
      include: {
        booking: {
          include: {
            user: true,
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
        }
      }
    })

    if (!transaction || !transaction.booking) {
      console.error(`Transaction or booking not found for transfer ID: ${transferId}`)
      return false
    }

    const booking = transaction.booking
    let transactionStatus: 'CREATED' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELLED' = 'CREATED'
    let bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED' = 'PENDING'
    let paymentStatus = 'pending'

    // Map Wise status to our statuses
    switch (wiseStatus) {
      case 'funds_converted':
      case 'outgoing_payment_sent':
        transactionStatus = 'SUCCEEDED'
        bookingStatus = 'CONFIRMED'
        paymentStatus = 'succeeded'
        break
      case 'bounced_back':
      case 'charged_back':
        transactionStatus = 'FAILED'
        bookingStatus = 'CANCELLED'
        paymentStatus = 'failed'
        break
      case 'cancelled':
        transactionStatus = 'CANCELLED'
        bookingStatus = 'CANCELLED'
        paymentStatus = 'canceled'
        break
      case 'incoming_payment_waiting':
      case 'processing':
      default:
        transactionStatus = 'CREATED'
        bookingStatus = 'PENDING'
        paymentStatus = 'processing'
        break
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: transactionStatus }
    })

    // Update booking status and payment information
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: bookingStatus,
        paymentStatus: paymentStatus,
        paymentMethod: 'wise',
        amountPaid: transactionStatus === 'SUCCEEDED' ? booking.totalAmount : 0,
      }
    })

    // Send notifications and emails for successful payments
    if (transactionStatus === 'SUCCEEDED') {
      // Send booking confirmation notification
      await NotificationTriggers.sendBookingConfirmation(booking.id)

      // Prepare email data
      const item = booking.class || booking.event
      if (item && booking.user) {
        const emailData = {
          user: {
            name: booking.user.fullName,
            email: booking.user.email
          },
          booking: {
            confirmationCode: booking.confirmationCode || 'N/A',
            totalAmount: Number(booking.totalAmount),
            amountPaid: Number(booking.amountPaid),
            paymentMethod: 'Wise Transfer',
            bookingDate: booking.createdAt.toISOString()
          },
          item: {
            title: item.title,
            type: booking.classId ? 'class' as const : 'event' as const,
            startDate: booking.class ? booking.class.startDate?.toISOString() || '' : booking.event!.startDate.toISOString(),
            endDate: booking.class ? booking.class.endDate?.toISOString() : booking.event!.endDate.toISOString(),
            startTime: booking.class ? booking.class.scheduleTime : booking.event!.startTime,
            venue: item.venue ? {
              name: item.venue.name,
              address: item.venue.addressLine1,
              city: item.venue.city,
              state: item.venue.state
            } : undefined,
            instructor: booking.class?.classInstructors?.[0]?.instructor?.user?.fullName,
            organizer: booking.event?.organizer?.fullName
          }
        }

        // Send booking confirmation email
        try {
          await emailService.sendBookingConfirmation(emailData)
          console.log(`✅ Booking confirmation email sent for booking: ${booking.id}`)
        } catch (error) {
          console.error(`❌ Failed to send booking confirmation email for booking: ${booking.id}`, error)
        }
      }
    }

    // Send failure notifications
    if (transactionStatus === 'FAILED') {
      // You can implement failure notification logic here
      console.log(`Payment failed for booking: ${booking.id}, transfer: ${transferId}`)
    }

    console.log(`Updated booking ${booking.id} status to ${bookingStatus} for transfer ${transferId}`)
    return true

  } catch (error) {
    console.error('Error updating booking status:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature-sha256') || ''

    // Verify webhook signature
    if (!wiseService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid Wise webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse the webhook event
    const event: WiseWebhookEvent = JSON.parse(body)
    
    console.log(`Received Wise webhook: ${event.event_type} for resource: ${event.resource.id}`)

    // Handle different event types
    switch (event.event_type) {
      case 'transfer.state-change':
        if (event.resource.type === 'transfer') {
          // Get the current status of the transfer
          const transferStatus = await wiseService.getPaymentStatus(event.resource.id)
          
          // Update booking status based on transfer status
          await updateBookingStatus(event.resource.id, transferStatus)
        }
        break

      case 'transfer.funds-converted':
        // Transfer funds have been converted
        await updateBookingStatus(event.resource.id, 'funds_converted')
        break

      case 'transfer.sent':
        // Transfer has been sent to recipient
        await updateBookingStatus(event.resource.id, 'outgoing_payment_sent')
        break

      case 'transfer.bounced-back':
        // Transfer bounced back
        await updateBookingStatus(event.resource.id, 'bounced_back')
        break

      case 'transfer.charged-back':
        // Transfer was charged back
        await updateBookingStatus(event.resource.id, 'charged_back')
        break

      case 'transfer.cancelled':
        // Transfer was cancelled
        await updateBookingStatus(event.resource.id, 'cancelled')
        break

      default:
        console.log(`Unhandled Wise webhook event type: ${event.event_type}`)
        break
    }

    // Always respond with 200 to acknowledge receipt
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing Wise webhook:', error)
    
    // Return 500 to indicate processing failure (Wise will retry)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify webhook endpoint is working
export async function GET() {
  return NextResponse.json({
    message: 'Wise webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}