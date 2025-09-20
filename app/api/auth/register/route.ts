import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { 
  hashPassword, 
  isValidEmail, 
  isValidPassword, 
  createSession 
} from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone } = body

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        passwordHash,
        role: 'USER',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    })

    // Create session
    const token = await createSession(user)

    return NextResponse.json(
      {
        message: 'Registration successful',
        user,
        token
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // More detailed error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for Prisma-specific errors
      if (error.message.includes('Unknown field')) {
        return NextResponse.json(
          { error: 'Database schema error: ' + error.message },
          { status: 500 }
        )
      }
      
      if (error.message.includes('Connection')) {
        return NextResponse.json(
          { error: 'Database connection error' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    )
  }
}
