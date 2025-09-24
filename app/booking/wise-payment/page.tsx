'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface WisePaymentData {
  transferId: string
  bookingId: string
  amount: string
  currency: string
}

export default function WisePaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<WisePaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const transferId = searchParams.get('transferId')
    const bookingId = searchParams.get('bookingId')
    const amount = searchParams.get('amount')
    const currency = searchParams.get('currency')

    if (transferId && bookingId && amount && currency) {
      setPaymentData({ transferId, bookingId, amount, currency })
    }
    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Missing</h1>
          <p className="text-gray-600 mb-6">We couldn't find the payment details for this booking.</p>
          <Link href="/classes" className="text-purple-600 hover:text-purple-700">
            ← Back to classes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/classes" className="text-purple-600 hover:text-purple-700 inline-flex items-center">
            ← Back to classes
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Created Successfully!</h1>
            <p className="text-green-100">Complete your payment with Wise to confirm your spot</p>
          </div>

          <div className="p-8">
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Booking ID:</span>
                  <p className="font-mono font-semibold">{paymentData.bookingId.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Transfer ID:</span>
                  <p className="font-mono font-semibold">{paymentData.transferId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <p className="font-semibold text-lg">{paymentData.amount} {paymentData.currency}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-semibold text-yellow-600">Pending Payment</p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Complete Your Wise Payment
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    A Wise transfer has been created for your booking. You'll need to fund this transfer to complete your payment.
                  </p>
                  <div className="bg-white rounded p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-2">You will receive payment instructions via:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Email with detailed payment instructions</li>
                      <li>• Wise app/website notifications</li>
                      <li>• SMS updates on transfer status</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Payment Timeline
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-yellow-600 font-semibold mb-2">Next 24 hours</div>
                    <p className="text-sm text-gray-700">Complete your Wise transfer to secure your booking</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-green-600 font-semibold mb-2">1-2 business days</div>
                    <p className="text-sm text-gray-700">Your transfer will be processed and completed</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-purple-600 font-semibold mb-2">Upon completion</div>
                    <p className="text-sm text-gray-700">You'll receive booking confirmation</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  What Happens Next?
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Automatic Updates</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Real-time payment status updates</li>
                        <li>• Email confirmations at each step</li>
                        <li>• Class details and venue information</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Contact us if you need help</li>
                        <li>• Track your payment in Wise app</li>
                        <li>• Free cancellation up to 24 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits of Wise */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Wise?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-600">💰</span>
                    <div>
                      <p className="font-medium">Lower Fees</p>
                      <p className="text-gray-600">Up to 8x cheaper than traditional banks</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-600">🌍</span>
                    <div>
                      <p className="font-medium">Real Exchange Rate</p>
                      <p className="text-gray-600">Always get the mid-market rate</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal-600">🔒</span>
                    <div>
                      <p className="font-medium">Bank-level Security</p>
                      <p className="text-gray-600">Regulated and fully secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <button
                onClick={() => window.open('https://wise.com', '_blank')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Open Wise Website
              </button>
              <Link 
                href="/classes"
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
              >
                Browse More Classes
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              <p>Questions about your booking? Contact us at <span className="font-medium">support@danceplatform.com</span></p>
              <p className="mt-1">Or reference booking ID: <span className="font-mono font-medium">{paymentData.bookingId.slice(-8).toUpperCase()}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}