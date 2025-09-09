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
        isActive: true // Use isActive instead of status
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
                    id: true,
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
