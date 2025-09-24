import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET() {
  try {
    // Fetch only active classes that haven't ended
    const classes = await prisma.class.findMany({
      where: {
        isActive: true, // Use isActive instead of status
        OR: [
          { endDate: null }, // Classes without end date are ongoing
          { endDate: { gte: new Date() } } // Classes that haven't ended
        ]
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            addressLine1: true, // Use addressLine1 instead of address
            addressLine2: true
          }
        },
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    fullName: true, // Use fullName instead of name
                    email: true
                  }
                }
              }
            }
          }
        },
        classStyles: {
          include: {
            style: true
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: ['CONFIRMED', 'COMPLETED']
                }
              }
            }
          }
        }
      },
      orderBy: [
        { startDate: 'asc' }, // Classes with start dates first
        { createdAt: 'asc' }  // Then by creation date
      ]
    })

    // Calculate current students for each class and map field names
    const classesWithStudentCount = classes.map(cls => ({
      ...cls,
      currentStudents: cls._count.bookings,
      maxStudents: cls.maxCapacity, // Map maxCapacity to maxStudents for frontend compatibility
      duration: cls.durationMins, // Map durationMins to duration for frontend compatibility
      schedule: cls.scheduleTime || cls.scheduleDays || 'TBD' // Map schedule fields
    }))

    return NextResponse.json({ 
      classes: classesWithStudentCount,
      total: classesWithStudentCount.length 
    })
  } catch (error) {
    console.error('Error fetching public classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}
