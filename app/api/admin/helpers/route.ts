import { NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

// GET helper data for forms (instructors, venues, dance styles)
export async function GET() {
  try {
    const [instructors, venues, danceStyles, users] = await Promise.all([
      // Get all active instructors
      prisma.instructor.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          user: {
            fullName: 'asc'
          }
        }
      }),
      
      // Get all venues
      prisma.venue.findMany({
        orderBy: { name: 'asc' }
      }),
      
      // Get all active dance styles
      prisma.danceStyle.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      
      // Get all users for selection
      prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        },
        orderBy: { fullName: 'asc' }
      })
    ])
    
    return NextResponse.json({
      instructors: instructors.map(i => ({
        id: i.id,
        name: i.user.fullName,
        email: i.user.email,
        specialty: i.specialty,
        rating: i.rating
      })),
      venues: venues.map(v => ({
        id: v.id,
        name: v.name,
        city: v.city,
        state: v.state,
        address: `${v.addressLine1}, ${v.city}, ${v.state}`
      })),
      danceStyles: danceStyles.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category
      })),
      users: users.map(u => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: u.role
      }))
    })
  } catch (error) {
    console.error('Error fetching helper data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch helper data' },
      { status: 500 }
    )
  }
}
