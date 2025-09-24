import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'dance-platform',
      paymentProviders: {
        stripe: {
          configured: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
          testMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false
        },
        wise: {
          configured: !!(process.env.WISE_API_KEY && process.env.WISE_PROFILE_ID),
          sandboxMode: process.env.WISE_BASE_URL?.includes('sandbox') || false
        }
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}