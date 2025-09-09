import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { stripe } from '@/app/lib/stripe'
import prisma from '@/app/lib/db'

interface BookingConfirmationPageProps {
  params: {
    sessionId: string
  }
}

async function getBookingDetails(sessionId: string) {
  try {
    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    })

    if (!session) {
      return null
    }

    // Get booking from database
    const booking = await prisma.booking.findFirst({
      where: {
        stripeSessionId: sessionId
      },
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
        },
        transactions: {
          where: {
            provider: 'STRIPE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    return {
      session,
      booking
    }
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return null
  }
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const { sessionId } = params
  
  const data = await getBookingDetails(sessionId)
  
  if (!data || !data.booking) {
    notFound()
  }

  const { session, booking } = data
  const transaction = booking.transactions[0]
  const item = booking.class || booking.event
  const isClass = Boolean(booking.class)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your payment. Your booking has been confirmed.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Booking Summary */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {item?.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {isClass ? 'Dance Class' : 'Dance Event'}
                </p>
                
                {item?.venue && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {item.venue.name}, {item.venue.city}, {item.venue.state}
                    </span>
                  </div>
                )}

                {isClass && booking.class?.classInstructors?.[0]?.instructor?.user && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Instructor: {booking.class.classInstructors[0].instructor.user.fullName}</span>
                  </div>
                )}

                {!isClass && booking.event && (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(booking.event.startDate).toLocaleDateString()} at {booking.event.startTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {item?.imageUrl && (
                <div className="ml-6">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmation Code:</span>
                    <span className="font-semibold">{booking.confirmationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="capitalize">{booking.paymentMethod || 'Card'}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${Number(booking.totalAmount).toFixed(2)}</span>
                  </div>
                  {Number(booking.discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${Number(booking.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(booking.taxAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>${Number(booking.taxAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span>Total Paid:</span>
                    <span>${Number(booking.amountPaid).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span>{booking.user.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{booking.user.email}</span>
              </div>
              {booking.user.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{booking.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="px-6 py-6 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">What&apos;s Next?</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>You&apos;ll receive a confirmation email with all the details</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{isClass ? 'Show up 10 minutes early for your first class' : 'Arrive 15 minutes before the event starts'}</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Bring comfortable clothes and water</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <a
              href="/"
              className="flex-1 bg-purple-600 text-white text-center px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
