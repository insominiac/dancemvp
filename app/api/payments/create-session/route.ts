import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe, validateStripeConfig } from '@/app/lib/stripe'
import { wiseService, validateWiseConfig, createWiseBookingPayment } from '@/app/lib/wise'
import prisma from '@/app/lib/db'
import { z } from 'zod'

const createPaymentSessionSchema = z.object({
  paymentProvider: z.enum(['STRIPE', 'WISE']).default('STRIPE'),
  bookingType: z.enum(['class', 'event']),
  itemId: z.string().min(1, 'Item ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  // Optional pricing customization
  customAmount: z.number().optional(),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  // Success/cancel URLs (required for Stripe)
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  // Wise-specific fields
  wiseRecipientDetails: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    accountId: z.string().optional(),
    currency: z.string().optional(),
    type: z.string().optional(),
    details: z.record(z.any()).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = createPaymentSessionSchema.parse(body)
    
    const { 
      paymentProvider,
      bookingType, 
      itemId, 
      userId, 
      customAmount, 
      discountAmount, 
      taxAmount, 
      successUrl, 
      cancelUrl,
      wiseRecipientDetails,
    } = validatedData

    // Validate payment provider configuration
    if (paymentProvider === 'STRIPE') {
      const stripeConfig = validateStripeConfig()
      if (!stripeConfig.isValid) {
        return NextResponse.json(
          { error: 'Stripe configuration invalid', details: stripeConfig.errors },
          { status: 500 }
        )
      }
      
      if (!successUrl || !cancelUrl) {
        return NextResponse.json(
          { error: 'Success URL and Cancel URL are required for Stripe payments' },
          { status: 400 }
        )
      }
    } else if (paymentProvider === 'WISE') {
      const wiseConfig = validateWiseConfig()
      if (!wiseConfig.isValid) {
        return NextResponse.json(
          { error: 'Wise configuration invalid', details: wiseConfig.errors },
          { status: 500 }
        )
      }
      
      if (!wiseRecipientDetails) {
        return NextResponse.json(
          { error: 'Wise recipient details are required for Wise payments' },
          { status: 400 }
        )
      }
    }

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

    // Process payment based on provider
    if (paymentProvider === 'STRIPE') {
      // Create Stripe checkout session
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

      const session = await stripe!.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl!,
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
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
      })

      // Update booking with session ID
      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripeSessionId: session.id }
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          provider: 'STRIPE',
          providerPaymentId: session.payment_intent as string,
          type: 'PAYMENT',
          status: 'CREATED',
          amount: totalAmount,
          currency: 'USD',
          stripeSessionId: session.id,
          payload: JSON.stringify(session)
        }
      })

      return NextResponse.json({
        success: true,
        paymentProvider: 'STRIPE',
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

    } else if (paymentProvider === 'WISE') {
      // Create Wise payment
      const wisePaymentResult = await createWiseBookingPayment({
        amount: totalAmount,
        currency: 'USD',
        bookingId: booking.id,
        userId: user.id,
        classId: bookingType === 'class' ? itemId : undefined,
        eventId: bookingType === 'event' ? itemId : undefined,
        bookingType,
        recipientDetails: wiseRecipientDetails!
      })

      if (!wisePaymentResult.success) {
        // Clean up the booking if payment creation failed
        await prisma.booking.delete({
          where: { id: booking.id }
        })

        return NextResponse.json(
          { error: 'Failed to create Wise payment', details: wisePaymentResult.error },
          { status: 500 }
        )
      }

      // Create transaction record
      await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          provider: 'WISE',
          providerPaymentId: wisePaymentResult.transferId,
          type: 'PAYMENT',
          status: 'CREATED',
          amount: totalAmount,
          currency: 'USD',
          payload: JSON.stringify(wisePaymentResult)
        }
      })

      return NextResponse.json({
        success: true,
        paymentProvider: 'WISE',
        transferId: wisePaymentResult.transferId,
        quoteId: wisePaymentResult.quoteId,
        status: wisePaymentResult.status,
        estimatedDelivery: wisePaymentResult.estimatedDelivery,
        fees: wisePaymentResult.fees,
        rate: wisePaymentResult.rate,
        booking: {
          id: booking.id,
          confirmationCode: booking.confirmationCode,
          totalAmount: finalBasePrice,
          discountAmount: finalDiscountAmount,
          taxAmount: finalTaxAmount,
          finalAmount: totalAmount
        }
      })
    }

    return NextResponse.json(
      { error: 'Unsupported payment provider' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Create payment session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}