import { NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

export async function GET() {
  try {
    const danceStyles = await prisma.danceStyle.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        icon: true,
        subtitle: true,
        description: true,
        difficulty: true,
        origin: true,
        musicStyle: true,
        characteristics: true,
        benefits: true,
        schedule: true,
        price: true,
        instructors: true,
        image: true,
        videoUrl: true,
        isFeatured: true,
        sortOrder: true,
        _count: {
          select: {
            classStyles: true,
            eventStyles: true,
            userStyles: true
          }
        }
      },
      orderBy: [
        {
          sortOrder: 'asc'
        },
        {
          isFeatured: 'desc'
        },
        {
          classStyles: {
            _count: 'desc'
          }
        },
        {
          name: 'asc'
        }
      ]
    })

    // Transform the data to include parsed JSON fields
    const enhancedDanceStyles = danceStyles.map(style => {
      // Parse JSON fields
      const parseJsonField = (field: string | null) => {
        if (!field) return []
        try {
          return JSON.parse(field)
        } catch {
          return [field]
        }
      }
      
      return {
        id: style.id,
        name: style.name,
        category: style.category || 'Latin',
        classCount: style._count.classStyles,
        eventCount: style._count.eventStyles,
        studentCount: style._count.userStyles,
        totalCount: style._count.classStyles + style._count.eventStyles,
        icon: style.icon || '💃',
        subtitle: style.subtitle || 'Discover this amazing dance style',
        description: style.description || `Learn the beautiful art of ${style.name} with our experienced instructors.`,
        difficulty: style.difficulty || 'All Levels',
        origin: style.origin || 'Traditional',
        musicStyle: style.musicStyle || 'Various',
        characteristics: parseJsonField(style.characteristics),
        benefits: parseJsonField(style.benefits),
        schedule: parseJsonField(style.schedule),
        price: style.price || 'Contact for pricing',
        instructors: style.instructors || 'Professional instructors',
        image: style.image,
        videoUrl: style.videoUrl,
        isFeatured: style.isFeatured,
        sortOrder: style.sortOrder
      }
    })

    // Group styles by category for better organization
    const stylesByCategory = enhancedDanceStyles.reduce((acc, style) => {
      const category = style.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(style)
      return acc
    }, {} as Record<string, typeof enhancedDanceStyles>)

    return NextResponse.json({
      success: true,
      data: {
        styles: enhancedDanceStyles,
        stylesByCategory,
        totalStyles: enhancedDanceStyles.length,
        totalClasses: enhancedDanceStyles.reduce((sum, style) => sum + style.classCount, 0),
        totalEvents: enhancedDanceStyles.reduce((sum, style) => sum + style.eventCount, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching dance styles:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dance styles'
    }, { status: 500 })
  }
}

