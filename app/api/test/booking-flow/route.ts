import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { emailService } from '@/app/lib/email'
import type { BookingConfirmationData } from '@/app/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing booking flow...')
    
    // Get a test user (admin user for testing)
    const testUser = await prisma.user.findFirst({
      where: {
        email: { contains: 'admin' }
      }
    })

    if (!testUser) {
      return NextResponse.json({
        error: 'No test user found. Please create an admin user first.'
      }, { status: 404 })
    }

    // Get a test class
    const testClass = await prisma.class.findFirst({
      where: {
        isActive: true
      },
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

    if (!testClass) {
      return NextResponse.json({
        error: 'No active classes found for testing'
      }, { status: 404 })
    }

    // Create a test booking
    const testBooking = await prisma.booking.create({
      data: {
        userId: testUser.id,
        classId: testClass.id,
        status: 'CONFIRMED',
        totalAmount: Number(testClass.price),
        amountPaid: Number(testClass.price),
        discountAmount: 0,
        taxAmount: 0,
        paymentStatus: 'succeeded',
        paymentMethod: 'test_card',
        confirmationCode: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    })

    console.log('✅ Test booking created:', testBooking.id)

    // Test dashboard API
    const dashboardResponse = await fetch(`${request.url.replace('/api/test/booking-flow', '')}/api/user/dashboard/${testUser.id}`, {
      method: 'GET',
    })

    let dashboardData = null
    if (dashboardResponse.ok) {
      dashboardData = await dashboardResponse.json()
      console.log('✅ Dashboard API working')
    } else {
      console.error('❌ Dashboard API failed:', dashboardResponse.status)
    }

    // Test email notification
    const emailData: BookingConfirmationData = {
      user: {
        name: testUser.fullName,
        email: testUser.email
      },
      booking: {
        confirmationCode: testBooking.confirmationCode,
        totalAmount: Number(testBooking.totalAmount),
        amountPaid: Number(testBooking.amountPaid),
        paymentMethod: testBooking.paymentMethod || 'test_card',
        bookingDate: testBooking.createdAt.toISOString()
      },
      item: {
        title: testClass.title,
        type: 'class',
        startDate: testClass.startDate.toISOString(),
        endDate: testClass.endDate?.toISOString(),
        startTime: testClass.schedule,
        venue: testClass.venue ? {
          name: testClass.venue.name,
          address: testClass.venue.address || '',
          city: testClass.venue.city,
          state: testClass.venue.state || ''
        } : undefined,
        instructor: testClass.classInstructors?.[0]?.instructor?.user ? 
          testClass.classInstructors[0].instructor.user.fullName : undefined
      }
    }

    const emailSent = await emailService.sendBookingConfirmation(emailData)
    console.log(emailSent ? '✅ Email notification working' : '❌ Email notification failed')

    // Clean up test booking
    await prisma.booking.delete({
      where: { id: testBooking.id }
    })
    console.log('🧹 Test booking cleaned up')

    return NextResponse.json({
      success: true,
      message: 'Booking flow test completed successfully',
      results: {
        user: {
          id: testUser.id,
          name: testUser.fullName,
          email: testUser.email
        },
        class: {
          id: testClass.id,
          title: testClass.title,
          price: testClass.price
        },
        booking: {
          id: testBooking.id,
          confirmationCode: testBooking.confirmationCode,
          status: testBooking.status,
          paymentStatus: testBooking.paymentStatus
        },
        tests: {
          bookingCreated: true,
          dashboardApi: dashboardResponse.ok,
          emailNotification: emailSent,
          cleanup: true
        },
        dashboardData: dashboardData?.success ? 'Working' : 'Failed'
      }
    })

  } catch (error) {
    console.error('🚨 Booking flow test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Booking flow test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Booking flow test endpoint',
    usage: 'POST to this endpoint to run a complete booking flow test',
    features: [
      'Creates test booking',
      'Tests dashboard API',
      'Tests email notifications',
      'Cleans up test data'
    ]
  })
}
