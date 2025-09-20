import { NextResponse } from 'next/server'
import db from '../../../lib/db'

// Enable ISR with 30 minute revalidation
export const revalidate = 1800 // 30 minutes

export async function GET() {
  try {
    const instructors = await db.instructor.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            bio: true,
            profileImage: true,
            instagramHandle: true,
            websiteUrl: true
          }
        },
        classInstructors: {
          include: {
            class: {
              select: {
                id: true,
                title: true,
                level: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            classInstructors: {
              where: {
                class: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      },
      orderBy: [
        { classInstructors: { _count: 'desc' } }, // Most active instructors first
        { user: { fullName: 'asc' } }
      ]
    })

    const instructorsWithDetails = instructors.map(instructor => ({
      id: instructor.id,
      userId: instructor.userId,
      name: instructor.user.fullName,
      bio: instructor.user.bio,
      specialty: instructor.specialty,
      experienceYears: instructor.experienceYears,
      rating: instructor.rating,
      imageUrl: instructor.user.profileImage,
      email: instructor.user.email,
      phone: instructor.user.phone,
      instagramHandle: instructor.user.instagramHandle,
      websiteUrl: instructor.user.websiteUrl,
      isActive: instructor.isActive,
      createdAt: instructor.createdAt,
      activeClasses: instructor.classInstructors
        .filter(ci => ci.class.status === 'PUBLISHED')
        .map(ci => ({
          id: ci.class.id,
          title: ci.class.title,
          level: ci.class.level,
          isPrimary: ci.isPrimary
        })),
      classCount: instructor._count.classInstructors,
      // Extract specialties as array if stored as JSON or comma-separated
      specialtiesArray: instructor.specialty 
        ? (typeof instructor.specialty === 'string' 
            ? instructor.specialty.split(',').map(s => s.trim())
            : [instructor.specialty])
        : []
    }))

    return NextResponse.json({
      instructors: instructorsWithDetails,
      total: instructorsWithDetails.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching instructors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    )
  }
}