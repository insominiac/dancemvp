import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe, validateStripeConfig } from '@/app/lib/stripe'
import prisma from '@/app/lib/db'
import { z } from 'zod'

const createCheckoutSessionSchema = z.object({
  bookingType: z.enum(['class', 'event']),
  itemId: z.string().min(1, 'Item ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  // Optional pricing customization
  customAmount: z.number().optional(),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  // Success/cancel URLs
  successUrl: z.string().url('Valid success URL required'),
  cancelUrl: z.string().url('Valid cancel URL required'),
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
    const validatedData = createCheckoutSessionSchema.parse(body)
    
    const { 
      bookingType, 
      itemId, 
      userId, 
      customAmount, 
      discountAmount, 
      taxAmount, 
      successUrl, 
      cancelUrl 
    } = validatedData

    // Get item details and price
    let item: any
    let basePrice: number
    let itemName: string
    let itemImage: string | null = null

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
      itemImage = item.imageUrl
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
      itemImage = item.imageUrl
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

    // Create line items for checkout session
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: itemName,
            description: `${bookingType === 'class' ? 'Dance Class' : 'Dance Event'} - ${item.description?.substring(0, 100)}`,
            images: itemImage ? [itemImage] : undefined,
            metadata: {
              bookingType,
              itemId,
              venue: item.venue?.name || 'TBD'
            }
          },
          unit_amount: formatAmountForStripe(finalBasePrice),
        },
        quantity: 1,
      }
    ]

    // Add discount line item if applicable
    if (finalDiscountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Discount',
            description: 'Applied discount'
          },
          unit_amount: -formatAmountForStripe(finalDiscountAmount),
        },
        quantity: 1,
      })
    }

    // Add tax line item if applicable
    if (finalTaxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            description: 'Applied tax'
          },
          unit_amount: formatAmountForStripe(finalTaxAmount),
        },
        quantity: 1,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: user.email,
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        userId: user.id,
        itemId,
        bookingType,
        itemName,
        userEmail: user.email,
        userName: user.fullName
      },
      payment_intent_data: {
        description: `${bookingType === 'class' ? 'Class' : 'Event'} Booking: ${itemName}`,
        metadata: {
          bookingId: booking.id,
          userId: user.id,
          itemId,
          bookingType,
          itemName
        },
        receipt_email: user.email
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    })

    // Update booking with session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripeSessionId: session.id
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        provider: 'STRIPE',
        stripeSessionId: session.id,
        type: 'PAYMENT',
        status: 'CREATED',
        amount: totalAmount,
        currency: 'USD',
        payload: JSON.stringify(session)
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
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
    console.error('Create checkout session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
