import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth, ApiResponse } from '@/app/lib/admin-api-wrapper'

const prisma = new PrismaClient()

// GET single class by ID
export const GET = withAdminAuth(async (request, { params, user }) => {
  console.log(`✅ Admin ${user.email} fetching class ${params.id}`)
  
  const classData = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        classInstructors: {
          include: {
            instructor: {
              include: { user: true }
            }
          }
        },
        classStyles: {
          include: { style: true }
        },
        bookings: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { bookings: true }
        }
      }
    })
    
  if (!classData) {
    return ApiResponse.notFound('Class not found')
  }
  
  return ApiResponse.success(classData)
})

// PUT update class
export const PUT = withAdminAuth(async (request, { params, user }) => {
  console.log(`✅ Admin ${user.email} updating class ${params.id}`)
  
  try {
    const body = await request.json()
    const { 
      title, description, level, durationMins, maxCapacity, 
      price, scheduleDays, scheduleTime, startDate, endDate,
      requirements, imageUrl, isActive, instructorIds, styleIds 
    } = body
    
    // Update class
    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: {
        title,
        description,
        level,
        durationMins: parseInt(durationMins),
        maxCapacity: parseInt(maxCapacity),
        price: parseFloat(price),
        scheduleDays,
        scheduleTime,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        requirements,
        imageUrl,
        isActive
      }
    })
    
    // Update instructors if provided
    if (instructorIds !== undefined) {
      // Remove existing instructors
      await prisma.classInstructor.deleteMany({
        where: { classId: params.id }
      })
      
      // Add new instructors
      if (instructorIds.length > 0) {
        await prisma.classInstructor.createMany({
          data: instructorIds.map((instructorId: string, index: number) => ({
            classId: params.id,
            instructorId,
            isPrimary: index === 0
          }))
        })
      }
    }
    
    // Update styles if provided
    if (styleIds !== undefined) {
      // Remove existing styles
      await prisma.classStyle.deleteMany({
        where: { classId: params.id }
      })
      
      // Add new styles
      if (styleIds.length > 0) {
        await prisma.classStyle.createMany({
          data: styleIds.map((styleId: string) => ({
            classId: params.id,
            styleId
          }))
        })
      }
    }
    
    // Fetch complete updated class data
    const completeClass = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        classInstructors: {
          include: {
            instructor: {
              include: { user: true }
            }
          }
        },
        classStyles: {
          include: { style: true }
        }
      }
    })
    
    return ApiResponse.success({
      message: 'Class updated successfully',
      class: completeClass
    })
  } catch (error) {
    console.error('Error updating class:', error)
    throw new Error('Failed to update class')
  }
})

// DELETE class
export const DELETE = withAdminAuth(async (request, { params, user }) => {
  console.log(`✅ Admin ${user.email} deleting class ${params.id}`)
  
  try {
    // Check if class has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        classId: params.id,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    })
    
    if (activeBookings > 0) {
      return ApiResponse.error('Cannot delete class with active bookings', 400)
    }
    
    // Delete class (cascades to class_instructors and class_styles)
    await prisma.class.delete({
      where: { id: params.id }
    })
    
    return ApiResponse.success({
      message: 'Class deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting class:', error)
    throw new Error('Failed to delete class')
  }
})
