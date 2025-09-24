import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, ApiResponse } from '@/app/lib/admin-api-wrapper'
import prisma from '@/app/lib/db'

// GET all classes with filters
export const GET = withAdminAuth(async (request, { user }) => {
  console.log(`✅ Admin ${user.email} fetching classes`)
  
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const level = searchParams.get('level') || ''
  const isActive = searchParams.get('isActive')
  
  const skip = (page - 1) * limit
  
  const where: any = {
    AND: [
      search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {},
      level ? { level } : {},
      isActive !== null ? { isActive: isActive === 'true' } : {}
    ]
  }
  
  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
        _count: {
          select: { bookings: true }
        }
      }
    }),
    prisma.class.count({ where })
  ])
  
  return ApiResponse.success({
    classes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
})

// POST create new class
export const POST = withAdminAuth(async (request, { user }) => {
  try {
    console.log(`✅ Admin ${user.email} creating new class`)
    const body = await request.json()
    const { 
      title, description, level, durationMins, maxCapacity, 
      price, scheduleDays, scheduleTime, startDate, endDate,
      requirements, imageUrl, isActive, instructorIds, styleIds 
    } = body
    
    // Create class
    const newClass = await prisma.class.create({
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
        isActive: isActive !== false
      }
    })
    
    // Assign instructors if provided
    if (instructorIds && instructorIds.length > 0) {
      await prisma.classInstructor.createMany({
        data: instructorIds.map((instructorId: string, index: number) => ({
          classId: newClass.id,
          instructorId,
          isPrimary: index === 0
        }))
      })
    }
    
    // Assign styles if provided
    if (styleIds && styleIds.length > 0) {
      await prisma.classStyle.createMany({
        data: styleIds.map((styleId: string) => ({
          classId: newClass.id,
          styleId
        }))
      })
    }
    
    // Fetch complete class data
    const completeClass = await prisma.class.findUnique({
      where: { id: newClass.id },
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
    
    return ApiResponse.created({
      message: 'Class created successfully',
      class: completeClass
    })
    
  } catch (error) {
    console.error('Error creating class:', error)
    throw new Error('Failed to create class')
  }
})
