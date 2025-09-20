import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/app/lib/auth'

const prisma = new PrismaClient()

// PUT update instructor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin updating instructor: ${currentUser.email}`)
    
    const { id } = params
    const body = await request.json()
    const { bio, experience, specialties, certifications, hourlyRate, isAvailable, profileImageUrl } = body
    
    // Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!existingInstructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }
    
    // Update user fields if provided
    const userUpdateData: any = {}
    if (bio !== undefined) userUpdateData.bio = bio
    if (profileImageUrl !== undefined) userUpdateData.profileImage = profileImageUrl
    
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: existingInstructor.userId },
        data: userUpdateData
      })
    }
    
    // Update instructor fields
    const instructorUpdateData: any = {}
    if (specialties !== undefined) {
      instructorUpdateData.specialty = Array.isArray(specialties) ? specialties.join(', ') : ''
    }
    if (experience !== undefined) {
      instructorUpdateData.experienceYears = parseInt(experience) || 0
    }
    if (isAvailable !== undefined) {
      instructorUpdateData.isActive = isAvailable
    }
    
    const instructor = await prisma.instructor.update({
      where: { id },
      data: instructorUpdateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            bio: true,
            profileImage: true
          }
        }
      }
    })
    
    return NextResponse.json({
      message: 'Instructor updated successfully',
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        user: instructor.user,
        bio: instructor.user?.bio || '',
        experience: instructor.experienceYears || 0,
        specialties: instructor.specialty ? instructor.specialty.split(',').map(s => s.trim()) : [],
        certifications: [],
        hourlyRate: hourlyRate || '50',
        isAvailable: instructor.isActive,
        rating: instructor.rating ? parseFloat(instructor.rating.toString()) : 0,
        totalStudents: 0,
        profileImageUrl: instructor.user?.profileImage
      }
    })
    
  } catch (error: any) {
    console.error('Error updating instructor:', error)
    
    // Handle authentication/authorization errors
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
      { error: 'Failed to update instructor' },
      { status: 500 }
    )
  }
}

// DELETE instructor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin deleting instructor: ${currentUser.email}`)
    
    const { id } = params
    
    // Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id },
      include: {
        classInstructors: true
      }
    })
    
    if (!existingInstructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }
    
    // Check if instructor has active classes
    if (existingInstructor.classInstructors.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete instructor with active classes. Remove class assignments first.' },
        { status: 400 }
      )
    }
    
    // Delete instructor profile (this will cascade and clean up related records)
    await prisma.instructor.delete({
      where: { id }
    })
    
    return NextResponse.json({
      message: 'Instructor deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Error deleting instructor:', error)
    
    // Handle authentication/authorization errors
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
      { error: 'Failed to delete instructor' },
      { status: 500 }
    )
  }
}