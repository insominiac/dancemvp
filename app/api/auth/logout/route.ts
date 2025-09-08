import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Clear the session cookie
    await clearSession()
    
    return NextResponse.json({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
