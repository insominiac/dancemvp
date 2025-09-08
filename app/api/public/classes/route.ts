import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET() {
  try {
    // Fetch only active classes that haven't ended
    const classes = await prisma.class.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // Only show classes that haven't ended
        }
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true
          }
        },
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    name: true,
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
      orderBy: {
        startDate: 'asc'
      }
    })

    // Calculate current students for each class
    const classesWithStudentCount = classes.map(cls => ({
      ...cls,
      currentStudents: cls._count.bookings
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
