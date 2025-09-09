'use client'

import { useState } from 'react'
import { formatAmountFromStripe } from '@/app/lib/stripe'

interface CheckoutButtonProps {
  bookingType: 'class' | 'event'
  itemId: string
  userId: string
  amount: number
  itemName: string
  disabled?: boolean
  className?: string
  discountAmount?: number
  taxAmount?: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function CheckoutButton({
  bookingType,
  itemId,
  userId,
  amount,
  itemName,
  disabled = false,
  className = '',
  discountAmount = 0,
  taxAmount = 0,
  onSuccess,
  onError
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const finalAmount = amount - discountAmount + taxAmount
  const displayAmount = formatAmountFromStripe(finalAmount * 100) // Convert to cents for display

  const handleCheckout = async () => {
    if (loading || disabled) return

    setLoading(true)

    try {
      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingType,
          itemId,
          userId,
          customAmount: amount,
          discountAmount,
          taxAmount,
          successUrl: `${window.location.origin}/booking/confirmation/{CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionUrl } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl

    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
      onError?.(errorMessage)
      setLoading(false)
    }
  }

  const defaultClassName = `
    inline-flex items-center justify-center px-6 py-3 border border-transparent 
    text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
    transition-colors duration-200
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `.trim()

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className || defaultClassName}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Processing...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Book Now - ${displayAmount.toFixed(2)}
        </div>
      )}
    </button>
  )
}

// Quick booking component for simpler use cases
interface QuickBookingProps {
  bookingType: 'class' | 'event'
  itemId: string
  itemName: string
  price: number
  userId?: string
  onAuthRequired?: () => void
  className?: string
}

export function QuickBooking({
  bookingType,
  itemId,
  itemName,
  price,
  userId,
  onAuthRequired,
  className
}: QuickBookingProps) {
  if (!userId) {
    return (
      <button
        onClick={onAuthRequired}
        className={className || `
          inline-flex items-center justify-center px-6 py-3 border border-purple-600 
          text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
          transition-colors duration-200
        `.trim()}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Sign In to Book
      </button>
    )
  }

  return (
    <CheckoutButton
      bookingType={bookingType}
      itemId={itemId}
      userId={userId}
      amount={price}
      itemName={itemName}
      className={className}
      onError={(error) => {
        console.error('Booking error:', error)
        // You could show a toast notification here
      }}
    />
  )
}
