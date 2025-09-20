import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/lib/auth'
import prisma from '@/app/lib/db'

// GET all instructors with pagination
export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin access granted to: ${currentUser.email}`)
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    const where: any = {
      AND: [
        search ? {
          OR: [
            { user: { fullName: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { specialty: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {}
      ]
    }
    
    const [instructors, total] = await Promise.all([
      prisma.instructor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          },
          classInstructors: {
            include: {
              class: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: {
              classInstructors: true
            }
          }
        }
      }),
      prisma.instructor.count({ where })
    ])
    
    // Transform the data to match frontend expectations
    const transformedInstructors = instructors.map(instructor => ({
      id: instructor.id,
      userId: instructor.userId,
      user: instructor.user,
      bio: instructor.user?.bio || '',
      experience: instructor.experienceYears || 0,
      specialties: instructor.specialty ? instructor.specialty.split(',').map(s => s.trim()) : [],
      certifications: [], // This field doesn't exist in current schema
      hourlyRate: '50', // Default value, not in current schema
      isAvailable: instructor.isActive,
      rating: instructor.rating ? parseFloat(instructor.rating.toString()) : 0,
      totalStudents: 0, // Would need to calculate from bookings
      profileImageUrl: instructor.user?.profileImage,
      classes: instructor.classInstructors.map(ci => ci.class),
      _count: instructor._count
    }))
    
    return NextResponse.json({
      instructors: transformedInstructors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching instructors:', error)
    
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
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    )
  }
}

// POST create new instructor
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin creating instructor: ${currentUser.email}`)
    
    const body = await request.json()
    const { userId, bio, experience, specialties, certifications, hourlyRate, isAvailable, profileImageUrl } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if instructor profile already exists for this user
    const existingInstructor = await prisma.instructor.findUnique({
      where: { userId }
    })
    
    if (existingInstructor) {
      return NextResponse.json(
        { error: 'Instructor profile already exists for this user' },
        { status: 400 }
      )
    }
    
    // Update user bio if provided
    if (bio) {
      await prisma.user.update({
        where: { id: userId },
        data: { bio }
      })
    }
    
    // Update user profile image if provided
    if (profileImageUrl) {
      await prisma.user.update({
        where: { id: userId },
        data: { profileImage: profileImageUrl }
      })
    }
    
    // Create instructor profile
    const instructor = await prisma.instructor.create({
      data: {
        userId,
        specialty: Array.isArray(specialties) ? specialties.join(', ') : '',
        experienceYears: parseInt(experience) || 0,
        isActive: isAvailable !== undefined ? isAvailable : true
      },
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
      message: 'Instructor created successfully',
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
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error creating instructor:', error)
    
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
      { error: 'Failed to create instructor' },
      { status: 500 }
    )
  }
}