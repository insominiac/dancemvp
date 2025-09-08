import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all classes
export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      include: {
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

// POST create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newClass = await prisma.class.create({
      data: {
        title: body.title,
        description: body.description,
        level: body.level,
        price: body.price,
        maxCapacity: body.maxCapacity,
        instructorId: body.instructorId
      },
      include: {
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })
    
    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
}
