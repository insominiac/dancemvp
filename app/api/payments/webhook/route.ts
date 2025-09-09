import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/app/lib/stripe'
import prisma from '@/app/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Construct event from webhook payload
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing successful payment:', paymentIntent.id)

    // Find transaction by payment intent ID
    const transaction = await prisma.transaction.findFirst({
      where: {
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id
      },
      include: {
        booking: true,
        user: true
      }
    })

    if (!transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id)
      return
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCEEDED',
        paymentMethodType: paymentIntent.charges.data[0]?.payment_method_details?.type || null,
        last4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4 || null,
        brand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand || null,
        payload: JSON.stringify(paymentIntent)
      }
    })

    // Update booking status and payment info
    if (transaction.booking) {
      await prisma.booking.update({
        where: { id: transaction.booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'succeeded',
          amountPaid: transaction.amount,
          paymentMethod: paymentIntent.charges.data[0]?.payment_method_details?.type || 'card'
        }
      })

      console.log('Booking confirmed:', transaction.booking.id)
    }

    // TODO: Send confirmation email to user
    // TODO: Update class/event attendance counts if needed

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing failed payment:', paymentIntent.id)

    // Find transaction by payment intent ID
    const transaction = await prisma.transaction.findFirst({
      where: {
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id
      },
      include: {
        booking: true
      }
    })

    if (!transaction) {
      console.error('Transaction not found for failed payment intent:', paymentIntent.id)
      return
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        payload: JSON.stringify(paymentIntent)
      }
    })

    // Update booking status
    if (transaction.booking) {
      await prisma.booking.update({
        where: { id: transaction.booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'failed'
        }
      })

      console.log('Booking cancelled due to failed payment:', transaction.booking.id)
    }

    // TODO: Send payment failure notification to user

  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing canceled payment:', paymentIntent.id)

    // Find transaction by payment intent ID
    const transaction = await prisma.transaction.findFirst({
      where: {
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id
      },
      include: {
        booking: true
      }
    })

    if (!transaction) {
      console.error('Transaction not found for canceled payment intent:', paymentIntent.id)
      return
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'CANCELLED',
        payload: JSON.stringify(paymentIntent)
      }
    })

    // Update booking status
    if (transaction.booking) {
      await prisma.booking.update({
        where: { id: transaction.booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'canceled'
        }
      })

      console.log('Booking cancelled:', transaction.booking.id)
    }

  } catch (error) {
    console.error('Error handling payment intent canceled:', error)
  }
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    console.log('Processing charge dispute:', dispute.id)

    // Find transaction by charge ID
    const transaction = await prisma.transaction.findFirst({
      where: {
        provider: 'STRIPE',
        payload: {
          contains: dispute.charge
        }
      },
      include: {
        booking: true,
        user: true
      }
    })

    if (!transaction) {
      console.error('Transaction not found for dispute:', dispute.id)
      return
    }

    // Create audit log entry for dispute
    await prisma.auditLog.create({
      data: {
        userId: transaction.userId,
        action: 'DISPUTE_CREATED',
        tableName: 'transactions',
        recordId: transaction.id,
        newValues: JSON.stringify({
          disputeId: dispute.id,
          amount: dispute.amount,
          reason: dispute.reason,
          status: dispute.status
        }),
        createdAt: new Date()
      }
    })

    // TODO: Send dispute notification to admin
    // TODO: Update booking status if needed

    console.log('Dispute recorded for transaction:', transaction.id)

  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}
