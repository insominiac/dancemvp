import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateToken, createSession } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Special development admin login
    if (process.env.NODE_ENV === 'development' && email === 'admin@dev.local' && password === 'admin123') {
      console.log('🔓 Development admin login')
      
      // Check if dev admin exists, create if not
      let user = await prisma.user.findUnique({
        where: { email: 'admin@dev.local' }
      })

      if (!user) {
        console.log('Creating development admin user...')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        
        user = await prisma.user.create({
          data: {
            email: 'admin@dev.local',
            passwordHash: hashedPassword,
            fullName: 'Development Admin',
            role: 'ADMIN',
            isVerified: true
          }
        })
      }

      // Create session
      const token = await createSession({
        id: user.id,
        email: user.email,
        role: user.role
      })

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        token
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    const token = await createSession({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
