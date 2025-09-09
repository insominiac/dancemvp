import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe, validateStripeConfig } from '@/app/lib/stripe'
import prisma from '@/app/lib/db'
import { z } from 'zod'

// Validation schema for payment intent creation
const createPaymentIntentSchema = z.object({
  bookingType: z.enum(['class', 'event']),
  itemId: z.string().min(1, 'Item ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  // Optional fields for pricing customization
  customAmount: z.number().optional(),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  // Customer information
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    const configValidation = validateStripeConfig()
    if (!configValidation.isValid) {
      return NextResponse.json(
        { error: 'Stripe configuration invalid', details: configValidation.errors },
        { status: 500 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createPaymentIntentSchema.parse(body)
    
    const { bookingType, itemId, userId, customAmount, discountAmount, taxAmount, customerEmail, customerName } = validatedData

    // Get item details and price
    let item: any
    let basePrice: number
    let itemName: string

    if (bookingType === 'class') {
      item = await prisma.class.findUnique({
        where: { id: itemId },
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
      })
      
      if (!item || !item.isActive) {
        return NextResponse.json(
          { error: 'Class not found or inactive' },
          { status: 404 }
        )
      }
      
      basePrice = Number(item.price)
      itemName = item.title
    } else {
      item = await prisma.event.findUnique({
        where: { id: itemId },
        include: {
          venue: true,
          organizer: true
        }
      })
      
      if (!item || item.status !== 'PUBLISHED') {
        return NextResponse.json(
          { error: 'Event not found or not published' },
          { status: 404 }
        )
      }
      
      basePrice = Number(item.price)
      itemName = item.title
    }

    // Calculate final amounts
    const finalBasePrice = customAmount || basePrice
    const finalDiscountAmount = discountAmount || 0
    const finalTaxAmount = taxAmount || 0
    const totalAmount = finalBasePrice - finalDiscountAmount + finalTaxAmount

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create booking record first
    const booking = await prisma.booking.create({
      data: {
        userId,
        classId: bookingType === 'class' ? itemId : null,
        eventId: bookingType === 'event' ? itemId : null,
        status: 'PENDING',
        totalAmount: finalBasePrice,
        amountPaid: 0,
        discountAmount: finalDiscountAmount,
        taxAmount: finalTaxAmount,
        paymentStatus: 'pending',
        confirmationCode: `${bookingType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    })

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(totalAmount),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        bookingId: booking.id,
        userId: user.id,
        itemId,
        bookingType,
        itemName,
        userEmail: user.email,
        userName: user.fullName
      },
      description: `${bookingType === 'class' ? 'Class' : 'Event'} Booking: ${itemName}`,
      receipt_email: customerEmail || user.email,
      setup_future_usage: 'off_session', // For future payments
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id,
        type: 'PAYMENT',
        status: 'CREATED',
        amount: totalAmount,
        currency: 'USD',
        payload: JSON.stringify(paymentIntent)
      }
    })

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        currency: 'usd'
      },
      booking: {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        totalAmount: finalBasePrice,
        discountAmount: finalDiscountAmount,
        taxAmount: finalTaxAmount,
        finalAmount: totalAmount
      }
    })

  } catch (error) {
    console.error('Create payment intent error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
