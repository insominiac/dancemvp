import { NextResponse } from 'next/server'
import db from '../../../lib/db'

// Enable ISR with 5 minute revalidation
export const revalidate = 300 // 5 minutes

export async function GET() {
  try {
    // Get counts from database
    const [
      totalStudents,
      totalInstructors,
      totalClasses,
      totalEvents,
      totalVenues,
      activeStyles
    ] = await Promise.all([
      // Count unique users who have bookings
      db.user.count({
        where: {
          bookings: {
            some: {
              status: {
                in: ['CONFIRMED', 'COMPLETED']
              }
            }
          }
        }
      }),
      // Count active instructors
      db.instructor.count({
        where: {
          isActive: true
        }
      }),
      // Count published classes
      db.class.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      // Count published events
      db.event.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      // Count venues
      db.venue.count(),
      // Count active dance styles
      db.danceStyle.count({
        where: {
          isActive: true
        }
      })
    ])

    const stats = {
      students: totalStudents,
      instructors: totalInstructors,
      classes: totalClasses,
      events: totalEvents,
      venues: totalVenues,
      danceStyles: activeStyles,
      // Calculate some additional metrics
      totalBookings: await db.booking.count({
        where: {
          status: {
            in: ['CONFIRMED', 'COMPLETED']
          }
        }
      })
    }

    return NextResponse.json({ 
      stats,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return fallback static stats if database fails
    return NextResponse.json({ 
      stats: {
        students: 500,
        instructors: 15,
        classes: 25,
        events: 10,
        venues: 5,
        danceStyles: 20,
        totalBookings: 1200
      },
      lastUpdated: new Date().toISOString(),
      fallback: true
    })
  }
}