import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/app/lib/auth'

const prisma = new PrismaClient()

// GET single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    await requireAdmin(request)
    
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        instructor: true,
        bookings: {
          include: {
            class: true,
            event: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userStyles: {
          include: { style: true }
        },
        testimonials: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const { passwordHash, ...sanitizedUser } = user
    
    return NextResponse.json(sanitizedUser)
  } catch (error: any) {
    console.error('Error fetching user:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Admin privileges required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    
    const body = await request.json()
    const { email, password, fullName, phone, role, bio, isVerified, 
            websiteUrl, instagramHandle, profileImage } = body
    
    // Build update data
    const updateData: any = {
      email,
      fullName,
      phone,
      role,
      bio,
      isVerified,
      websiteUrl,
      instagramHandle,
      profileImage
    }
    
    // Only update password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData
    })
    
    // Handle instructor profile
    if (role === 'INSTRUCTOR') {
      // Check if instructor profile exists
      const instructorProfile = await prisma.instructor.findUnique({
        where: { userId: params.id }
      })
      
      if (!instructorProfile) {
        // Create instructor profile
        await prisma.instructor.create({
          data: {
            userId: params.id,
            isActive: true
          }
        })
      }
    } else {
      // Remove instructor profile if role changed from INSTRUCTOR
      await prisma.instructor.deleteMany({
        where: { userId: params.id }
      })
    }
    
    const { passwordHash, ...sanitizedUser } = user
    
    return NextResponse.json({
      message: 'User updated successfully',
      user: sanitizedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    
    // Prevent admin from deleting themselves
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Delete user (cascades to related records)
    await prisma.user.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
