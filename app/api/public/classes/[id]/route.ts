import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classData = await prisma.class.findUnique({
      where: {
        id: params.id,
        status: 'ACTIVE' // Only show active classes
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            amenities: true
          }
        },
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    id: true,
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
            style: {
              select: {
                id: true,
                name: true,
                category: true,
                difficulty: true
              }
            }
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
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Add current students count
    const classWithStudentCount = {
      ...classData,
      currentStudents: classData._count.bookings
    }

    return NextResponse.json({ 
      class: classWithStudentCount 
    })
  } catch (error) {
    console.error('Error fetching class details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class details' },
      { status: 500 }
    )
  }
}
