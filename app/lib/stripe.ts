import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null> | null = null
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not found')
    return Promise.resolve(null)
  }
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  mode: 'payment' as const,
}

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'

// Payment intent metadata interface
export interface PaymentMetadata {
  bookingId?: string
  userId?: string
  classId?: string
  eventId?: string
  bookingType: 'class' | 'event'
  amount: string
  currency: string
}

// Helper function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number, currency: string = 'usd'): number => {
  return Math.round(amount * 100)
}

// Helper function to format amount for display (convert cents to dollars)
export const formatAmountFromStripe = (amount: number, currency: string = 'usd'): number => {
  return amount / 100
}

// Validate Stripe configuration
export const validateStripeConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY is not set')
  }
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
