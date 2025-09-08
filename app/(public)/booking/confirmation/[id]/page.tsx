'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  useEffect(() => {
    // In production, you would fetch the booking details here
    console.log('Booking ID:', params.id)
  }, [params.id])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Confirmation Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Booking Confirmed!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your booking. We've sent a confirmation email with all the details.
        </p>

        {/* Booking Reference */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-500 mb-2">Booking Reference</p>
          <p className="text-2xl font-mono font-bold text-gray-900">
            {params.id.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* What's Next */}
        <div className="text-left bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              Check your email for confirmation and class details
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              Add the class schedule to your calendar
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              Arrive 10 minutes early for your first class
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              Bring comfortable clothing and water
            </li>
          </ul>
        </div>

        {/* Important Information */}
        <div className="text-left border border-yellow-200 bg-yellow-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Important Information</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• You can cancel up to 24 hours before the class for a full refund</li>
            <li>• Please bring a valid ID on your first visit</li>
            <li>• Parking is available at the venue</li>
            <li>• Contact us if you have any special requirements</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            View My Bookings
          </Link>
          <Link
            href="/classes"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Browse More Classes
          </Link>
        </div>

        {/* Contact Support */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? <Link href="/contact" className="text-purple-600 hover:text-purple-700">Contact Support</Link>
        </p>
      </div>
    </div>
  )
}
