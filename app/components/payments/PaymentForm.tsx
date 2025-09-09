'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { formatAmountFromStripe } from '@/app/lib/stripe'

interface PaymentFormProps {
  clientSecret: string
  amount: number
  currency: string
  bookingId: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  disabled?: boolean
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

export default function PaymentForm({
  clientSecret,
  amount,
  currency,
  bookingId,
  onSuccess,
  onError,
  disabled = false
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded yet.')
      return
    }

    if (processing || disabled) {
      return
    }

    const card = elements.getElement(CardElement)
    if (!card) {
      setCardError('Card element not found')
      return
    }

    setProcessing(true)
    setCardError(null)

    try {
      // Confirm payment with card
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
        }
      })

      if (error) {
        console.error('Payment error:', error)
        setCardError(error.message || 'An error occurred processing your payment.')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id)
        onSuccess(paymentIntent)
      } else {
        console.warn('Payment status:', paymentIntent?.status)
        setCardError('Payment was not completed. Please try again.')
        onError('Payment was not completed')
      }
    } catch (err) {
      console.error('Payment processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setCardError(errorMessage)
      onError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setCardComplete(event.complete)
  }

  const displayAmount = formatAmountFromStripe(amount, currency)

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-xl font-bold text-gray-900">
            ${displayAmount.toFixed(2)} {currency.toUpperCase()}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Booking ID: {bookingId}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement
              id="card-element"
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <div className="mt-2 text-sm text-red-600" role="alert">
              {cardError}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!stripe || processing || !cardComplete || disabled}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
              !stripe || processing || !cardComplete || disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay $${displayAmount.toFixed(2)}`
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center mt-3">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Payments are secure and encrypted</span>
          </div>
          <div className="mt-1">
            Powered by Stripe
          </div>
        </div>
      </form>
    </div>
  )
}
