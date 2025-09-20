import { NextResponse } from 'next/server'
import db from '../../../lib/db'

// Enable ISR with 10 minute revalidation
export const revalidate = 600 // 10 minutes

export async function GET() {
  try {
    // Get featured content from database
    const [featuredClasses, featuredEvents, featuredInstructors, popularStyles] = await Promise.all([
      // Get featured or most popular classes
      db.class.findMany({
        where: {
          status: 'PUBLISHED',
          endDate: {
            gte: new Date() // Only future/ongoing classes
          }
        },
        include: {
          venue: {
            select: {
              name: true,
              city: true
            }
          },
          classInstructors: {
            include: {
              instructor: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      profileImage: true
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
                  name: true,
                  category: true
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
        },
        orderBy: [
          // Prioritize classes with more bookings (popular)
          { bookings: { _count: 'desc' } },
          { createdAt: 'desc' }
        ],
        take: 3
      }),

      // Get featured events
      db.event.findMany({
        where: {
          status: 'PUBLISHED',
          isFeatured: true,
          endDate: {
            gte: new Date()
          }
        },
        include: {
          venue: {
            select: {
              name: true,
              city: true
            }
          },
          eventStyles: {
            include: {
              style: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        take: 2
      }),

      // Get featured instructors (most active)
      db.instructor.findMany({
        where: {
          isActive: true
        },
        include: {
          _count: {
            select: {
              classInstructors: true
            }
          }
        },
        orderBy: {
          classInstructors: {
            _count: 'desc'
          }
        },
        take: 3
      }),

      // Get popular dance styles (by class count)
      db.danceStyle.findMany({
        where: {
          isActive: true,
          classStyles: {
            some: {
              class: {
                status: 'PUBLISHED'
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              classStyles: {
                where: {
                  class: {
                    status: 'PUBLISHED'
                  }
                }
              },
              eventStyles: {
                where: {
                  event: {
                    status: 'PUBLISHED'
                  }
                }
              }
            }
          }
        },
        orderBy: {
          classStyles: {
            _count: 'desc'
          }
        },
        take: 6
      })
    ])

    return NextResponse.json({
      featuredClasses: featuredClasses.map(cls => ({
        ...cls,
        currentStudents: cls._count.bookings,
        spotsLeft: cls.maxCapacity - cls._count.bookings
      })),
      featuredEvents,
      featuredInstructors,
      popularStyles,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching featured content:', error)
    
    // Return fallback content
    return NextResponse.json({
      featuredClasses: [],
      featuredEvents: [],
      featuredInstructors: [],
      popularStyles: [
        { id: '1', name: 'Salsa', category: 'Latin', _count: { classStyles: 5, eventStyles: 3 } },
        { id: '2', name: 'Bachata', category: 'Latin', _count: { classStyles: 4, eventStyles: 2 } },
        { id: '3', name: 'Kizomba', category: 'African', _count: { classStyles: 3, eventStyles: 1 } }
      ],
      lastUpdated: new Date().toISOString(),
      fallback: true
    })
  }
}