import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { z } from 'zod'

// Schema for creating a package booking
const packageBookingSchema = z.object({
  userId: z.string().uuid(),
  packageType: z.enum(['class_pack', 'unlimited_monthly', 'semester_pass']),
  classIds: z.array(z.string().uuid()).optional(),
  credits: z.number().int().positive(),
  validUntil: z.string().datetime(),
  totalPrice: z.number().positive()
})

// Schema for waitlist entry
const waitlistSchema = z.object({
  userId: z.string().uuid(),
  classId: z.string().uuid(),
  priority: z.number().int().default(0)
})

// Schema for recurring booking
const recurringBookingSchema = z.object({
  userId: z.string().uuid(),
  classId: z.string().uuid(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  occurrences: z.number().int().positive().max(52), // Max 1 year
  startDate: z.string().datetime()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    switch (type) {
      case 'package':
        return await createPackageBooking(data)
      case 'waitlist':
        return await addToWaitlist(data)
      case 'recurring':
        return await createRecurringBooking(data)
      default:
        return NextResponse.json(
          { error: 'Invalid booking type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Advanced booking error:', error)
    return NextResponse.json(
      { error: 'Failed to process booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function createPackageBooking(data: any) {
  const validatedData = packageBookingSchema.parse(data)
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: validatedData.userId }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // Create the class package
  const classPackage = await prisma.classPackage.create({
    data: {
      userId: validatedData.userId,
      packageType: validatedData.packageType,
      credits: validatedData.credits,
      creditsUsed: 0,
      validUntil: new Date(validatedData.validUntil),
      totalPrice: validatedData.totalPrice,
      isActive: true
    }
  })

  // Create initial booking record
  const booking = await prisma.booking.create({
    data: {
      userId: validatedData.userId,
      packageId: classPackage.id,
      status: 'CONFIRMED',
      totalAmount: validatedData.totalPrice,
      amountPaid: 0, // Will be updated after payment
      paymentStatus: 'pending',
      confirmationCode: `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  })

  return NextResponse.json({
    success: true,
    package: classPackage,
    booking: booking,
    message: 'Class package created successfully'
  })
}

async function addToWaitlist(data: any) {
  const validatedData = waitlistSchema.parse(data)
  
  // Check if user and class exist
  const [user, classExists] = await Promise.all([
    prisma.user.findUnique({ where: { id: validatedData.userId } }),
    prisma.class.findUnique({ where: { id: validatedData.classId } })
  ])

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!classExists) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  // Check if already on waitlist
  const existingWaitlist = await prisma.waitlist.findFirst({
    where: {
      userId: validatedData.userId,
      classId: validatedData.classId
    }
  })

  if (existingWaitlist) {
    return NextResponse.json(
      { error: 'Already on waitlist for this class' },
      { status: 409 }
    )
  }

  // Get current waitlist position
  const waitlistCount = await prisma.waitlist.count({
    where: { classId: validatedData.classId }
  })

  // Add to waitlist
  const waitlistEntry = await prisma.waitlist.create({
    data: {
      userId: validatedData.userId,
      classId: validatedData.classId,
      position: waitlistCount + 1,
      priority: validatedData.priority,
      status: 'ACTIVE'
    }
  })

  return NextResponse.json({
    success: true,
    waitlist: waitlistEntry,
    position: waitlistEntry.position,
    message: `Added to waitlist at position ${waitlistEntry.position}`
  })
}

async function createRecurringBooking(data: any) {
  const validatedData = recurringBookingSchema.parse(data)
  
  // Check if user and class exist
  const [user, classTemplate] = await Promise.all([
    prisma.user.findUnique({ where: { id: validatedData.userId } }),
    prisma.class.findUnique({ 
      where: { id: validatedData.classId },
      include: { venue: true }
    })
  ])

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!classTemplate) {
    return NextResponse.json({ error: 'Class template not found' }, { status: 404 })
  }

  // Create recurring booking record
  const recurringBooking = await prisma.recurringBooking.create({
    data: {
      userId: validatedData.userId,
      originalClassId: validatedData.classId,
      frequency: validatedData.frequency,
      occurrences: validatedData.occurrences,
      startDate: new Date(validatedData.startDate),
      isActive: true,
      nextBookingDate: new Date(validatedData.startDate)
    }
  })

  // Calculate dates for all occurrences
  const bookingDates = calculateRecurringDates(
    new Date(validatedData.startDate),
    validatedData.frequency,
    validatedData.occurrences
  )

  // Create individual class instances and bookings
  const bookings = []
  for (let i = 0; i < bookingDates.length; i++) {
    const bookingDate = bookingDates[i]
    
    // Create a new class instance for this date
    const classInstance = await prisma.class.create({
      data: {
        title: `${classTemplate.title} (Series ${i + 1})`,
        description: classTemplate.description,
        level: classTemplate.level,
        duration: classTemplate.duration,
        price: classTemplate.price,
        maxStudents: classTemplate.maxStudents,
        currentStudents: 0,
        startDate: bookingDate,
        endDate: new Date(bookingDate.getTime() + classTemplate.duration * 60000),
        schedule: classTemplate.schedule,
        venueId: classTemplate.venueId,
        isActive: true,
        isRecurring: true,
        recurringBookingId: recurringBooking.id
      }
    })

    // Copy class styles and instructors from template
    if (classTemplate.classInstructors) {
      const instructors = await prisma.classInstructor.findMany({
        where: { classId: classTemplate.id }
      })
      
      await Promise.all(instructors.map(instructor =>
        prisma.classInstructor.create({
          data: {
            classId: classInstance.id,
            instructorId: instructor.instructorId
          }
        })
      ))
    }

    // Create booking for this instance
    const booking = await prisma.booking.create({
      data: {
        userId: validatedData.userId,
        classId: classInstance.id,
        recurringBookingId: recurringBooking.id,
        status: 'CONFIRMED',
        totalAmount: Number(classTemplate.price),
        amountPaid: 0, // Will be updated after payment
        paymentStatus: 'pending',
        confirmationCode: `REC-${recurringBooking.id}-${i + 1}`
      }
    })

    bookings.push({
      classInstance,
      booking,
      date: bookingDate.toISOString()
    })
  }

  return NextResponse.json({
    success: true,
    recurringBooking,
    bookings,
    totalAmount: Number(classTemplate.price) * validatedData.occurrences,
    message: `Created recurring booking for ${validatedData.occurrences} classes`
  })
}

// Helper function to calculate recurring dates
function calculateRecurringDates(startDate: Date, frequency: string, occurrences: number): Date[] {
  const dates = []
  let currentDate = new Date(startDate)

  for (let i = 0; i < occurrences; i++) {
    dates.push(new Date(currentDate))
    
    switch (frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
    }
  }

  return dates
}

// GET endpoint for retrieving advanced booking information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const type = searchParams.get('type')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  try {
    switch (type) {
      case 'packages':
        return await getUserPackages(userId)
      case 'waitlist':
        return await getUserWaitlist(userId)
      case 'recurring':
        return await getUserRecurringBookings(userId)
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Get advanced booking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

async function getUserPackages(userId: string) {
  const packages = await prisma.classPackage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    packages
  })
}

async function getUserWaitlist(userId: string) {
  const waitlistEntries = await prisma.waitlist.findMany({
    where: { userId },
    include: {
      class: {
        select: {
          id: true,
          title: true,
          startDate: true,
          venue: {
            select: {
              name: true,
              city: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    waitlist: waitlistEntries
  })
}

async function getUserRecurringBookings(userId: string) {
  const recurringBookings = await prisma.recurringBooking.findMany({
    where: { userId },
    include: {
      bookings: {
        include: {
          class: {
            select: {
              id: true,
              title: true,
              startDate: true,
              venue: {
                select: {
                  name: true,
                  city: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    recurringBookings
  })
}
