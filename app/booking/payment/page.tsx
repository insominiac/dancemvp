'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PaymentProviderSelector from '@/app/components/payments/PaymentProviderSelector'

interface BookingData {
  classId?: string
  eventId?: string
  className: string
  price: string
  bookingType: 'class' | 'event'
  userDetails: {
    name: string
    email: string
    phone: string
    emergencyContact: string
    emergencyPhone: string
    experience: string
    notes: string
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<'STRIPE' | 'WISE'>('STRIPE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wiseRecipientData, setWiseRecipientData] = useState({
    name: '',
    email: '',
    currency: 'USD'
  })

  useEffect(() => {
    // Get booking data from URL parameters or sessionStorage
    const bookingDataParam = searchParams.get('data')
    if (bookingDataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(bookingDataParam))
        setBookingData(decodedData)
      } catch (error) {
        console.error('Error parsing booking data:', error)
        router.push('/classes')
      }
    } else {
      // Try to get from sessionStorage as fallback
      const storedData = sessionStorage.getItem('pendingBooking')
      if (storedData) {
        setBookingData(JSON.parse(storedData))
        sessionStorage.removeItem('pendingBooking') // Clean up
      } else {
        // No booking data found, redirect back
        router.push('/classes')
      }
    }
  }, [searchParams, router])

  const handleWiseRecipientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setWiseRecipientData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const processPayment = async () => {
    if (!bookingData) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Validate Wise recipient data if Wise is selected
      if (paymentProvider === 'WISE') {
        if (!wiseRecipientData.name.trim() || !wiseRecipientData.email.trim()) {
          setError('Please provide recipient details for Wise payment')
          setIsProcessing(false)
          return
        }
      }

      // First create/find user
      const userResponse = await fetch('/api/public/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingData.userDetails.name,
          email: bookingData.userDetails.email,
          phone: bookingData.userDetails.phone
        })
      })
      
      const userData = await userResponse.json()
      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to create user')
      }

      // Create payment session
      const paymentData = {
        paymentProvider,
        bookingType: bookingData.bookingType,
        itemId: bookingData.classId || bookingData.eventId,
        userId: userData.userId,
        successUrl: `${window.location.origin}/booking/confirmation/{CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/booking/payment?${searchParams.toString()}`,
        ...(paymentProvider === 'WISE' && {
          wiseRecipientDetails: {
            name: wiseRecipientData.name,
            email: wiseRecipientData.email,
            currency: wiseRecipientData.currency,
            type: 'EMAIL'
          }
        })
      }

      const paymentResponse = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      const paymentResult = await paymentResponse.json()
      
      if (!paymentResponse.ok) {
        throw new Error(paymentResult.error || 'Failed to create payment session')
      }

      // Handle payment provider specific flows
      if (paymentProvider === 'STRIPE') {
        if (paymentResult.sessionUrl) {
          window.location.href = paymentResult.sessionUrl
        } else {
          throw new Error('No payment URL received from Stripe')
        }
      } else if (paymentProvider === 'WISE') {
        const params = new URLSearchParams({
          transferId: paymentResult.transferId,
          bookingId: paymentResult.booking.id,
          amount: paymentResult.booking.finalAmount,
          currency: 'USD'
        })
        router.push(`/booking/wise-payment?${params.toString()}`)
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      setError(error instanceof Error ? error.message : 'Payment processing failed')
      setIsProcessing(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
              <p className="text-gray-600 text-sm sm:text-base">Choose your payment method and complete your purchase</p>
            </div>
            <Link 
              href="/classes" 
              className="text-purple-600 hover:text-purple-700 inline-flex items-center text-sm sm:text-base font-medium transition-colors duration-200 hover:bg-purple-50 px-3 py-2 rounded-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to classes
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Progress Indicator */}
          <div className="xl:col-span-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <span className="ml-3 text-sm sm:text-base font-medium text-gray-900">Booking Details</span>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="ml-3 text-sm sm:text-base font-medium text-gray-900">Payment</span>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="ml-3 text-sm sm:text-base font-medium text-gray-600">Confirmation</span>
                </div>
              </div>
            </div>
          </div>
          {/* Booking Summary */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 h-fit sticky top-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Booking Summary
              </h2>
            
              {/* Class/Event Details */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {bookingData.bookingType === 'class' ? '🎭' : '🎪'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">{bookingData.className}</h3>
                    <p className="text-gray-600 text-sm lg:text-base">{bookingData.bookingType === 'class' ? 'Dance Class' : 'Dance Event'}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 lg:p-6 border border-purple-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Price</span>
                    <span className="text-2xl lg:text-3xl font-bold text-purple-600">${bookingData.price}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-sm">Name:</span>
                    <span className="text-gray-900 font-semibold text-sm sm:text-right">{bookingData.userDetails.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-sm">Email:</span>
                    <span className="text-gray-900 font-semibold text-sm sm:text-right break-all">{bookingData.userDetails.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-sm">Phone:</span>
                    <span className="text-gray-900 font-semibold text-sm sm:text-right">{bookingData.userDetails.phone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-sm">Experience:</span>
                    <span className="text-gray-900 font-semibold text-sm sm:text-right capitalize">{bookingData.userDetails.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h2>
            
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Payment Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

            {/* Payment Provider Selection */}
            <div className="mb-6">
              <PaymentProviderSelector
                selectedProvider={paymentProvider}
                onProviderChange={setPaymentProvider}
              />
            </div>

              {/* Wise Recipient Details */}
              {paymentProvider === 'WISE' && (
                <div className="mb-6 p-4 lg:p-6 border border-gray-300 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h4 className="text-sm lg:text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Recipient Details for Wise Transfer
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={wiseRecipientData.name}
                        onChange={handleWiseRecipientChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Who should receive the payment?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={wiseRecipientData.email}
                        onChange={handleWiseRecipientChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        name="currency"
                        value={wiseRecipientData.currency}
                        onChange={handleWiseRecipientChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Total and Continue Button */}
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 lg:p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg lg:text-xl font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl lg:text-3xl font-bold text-purple-600">${bookingData.price}</span>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full py-4 lg:py-5 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span className="text-base lg:text-lg">Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      {paymentProvider === 'STRIPE' ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Pay Securely with Card - ${bookingData.price}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                          </svg>
                          <span>Pay with Wise Transfer - ${bookingData.price}</span>
                        </>
                      )}
                    </div>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                    <span>{paymentProvider === 'STRIPE' ? 'Powered by Stripe' : 'Powered by Wise'}</span>
                    <span>•</span>
                    <span>256-bit SSL Security</span>
                    <span>•</span>
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}