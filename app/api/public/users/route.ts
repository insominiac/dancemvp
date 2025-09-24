import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Hash the password for guest users
      const hashedPassword = await bcrypt.hash('guest_booking_user', 10)
      
      // Create a new guest user
      user = await prisma.user.create({
        data: {
          email,
          fullName: name,
          phone: phone || null,
          passwordHash: hashedPassword,
          role: 'USER'
        }
      })
    } else {
      // Update existing user with latest info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: name,
          phone: phone || user.phone,
        }
      })
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'User created or updated successfully'
    })

  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { error: 'Failed to create or update user' },
      { status: 500 }
    )
  }
}