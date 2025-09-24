'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'

interface BookingDetails {
  id: string
  class?: {
    title: string
    startDate: string
  }
  event?: {
    title: string
    startDate: string
  }
  amount: number
}

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const isGuest = searchParams.get('guest') === 'true'
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/public/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBookingDetails(data.booking)
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  const item = bookingDetails?.class || bookingDetails?.event
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-8">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold mb-4 dance-font">
            {isGuest ? '🎉 Booking Submitted!' : '✅ Booking Confirmed!'}
          </h1>

          {bookingDetails && item && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 text-left">
              <h2 className="text-2xl font-semibold mb-4 text-center">{item.title}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Booking ID:</span>
                  <span className="font-mono text-sm">{bookingDetails.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Amount:</span>
                  <span className="font-semibold">${bookingDetails.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Date:</span>
                  <span>{new Date(item.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-lg opacity-90">
              {isGuest 
                ? "We've received your booking request! You'll receive an email confirmation shortly with payment instructions and next steps."
                : "Thank you! Your booking has been confirmed and you'll receive a confirmation email shortly."
              }
            </p>

            {isGuest && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">📧 Next Steps:</h3>
                <ul className="text-sm space-y-1 text-left">
                  <li>• Check your email for booking confirmation</li>
                  <li>• Complete payment via the link in your email</li>
                  <li>• Your spot will be reserved for 24 hours</li>
                  <li>• Contact us if you don't receive the email</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/classes"
                className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors"
              >
                Browse More Classes
              </Link>
              
              {bookingDetails?.class && (
                <Link
                  href="/events"
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors"
                >
                  View Events
                </Link>
              )}

              {bookingDetails?.event && (
                <Link
                  href="/classes"
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors"
                >
                  View Classes
                </Link>
              )}
            </div>

            {isGuest && (
              <div className="pt-6">
                <Link
                  href="/auth/register"
                  className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-colors"
                >
                  Create Account for Faster Booking
                </Link>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm opacity-75">
              Questions about your booking?<br/>
              Contact us at{' '}
              <a href="mailto:support@danceplatform.com" className="underline hover:opacity-80">
                support@danceplatform.com
              </a>{' '}
              or call{' '}
              <a href="tel:+15551234567" className="underline hover:opacity-80">
                (555) 123-4567
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
