import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/lib/auth'
import { AuditLogger } from '@/app/lib/audit-logger'
import prisma from '@/app/lib/db'

// GET all SEO pages with pagination
export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin access granted to: ${currentUser.email}`)
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit
    
    const where: any = {
      AND: [
        search ? {
          OR: [
            { path: { contains: search, mode: 'insensitive' as const } },
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        isActive !== null ? { isActive: isActive === 'true' } : {}
      ]
    }
    
    const [seoPages, total] = await Promise.all([
      prisma.seoPage.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { path: 'asc' }
        ]
      }),
      prisma.seoPage.count({ where })
    ])
    
    return NextResponse.json({
      seoPages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching SEO pages:', error)
    
    // Handle authentication/authorization errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Admin privileges required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch SEO pages' },
      { status: 500 }
    )
  }
}

// POST create new SEO page
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin creating SEO page: ${currentUser.email}`)
    
    const body = await request.json()
    const {
      path,
      title,
      description,
      keywords,
      author,
      robots,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      ogUrl,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      twitterCreator,
      structuredData,
      customMeta,
      isActive,
      priority
    } = body
    
    // Validate required fields
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }
    
    // Check if SEO page already exists for this path
    const existingSeoPage = await prisma.seoPage.findUnique({
      where: { path }
    })
    
    if (existingSeoPage) {
      return NextResponse.json(
        { error: 'SEO page already exists for this path' },
        { status: 400 }
      )
    }
    
    // Validate JSON fields if provided
    if (structuredData) {
      try {
        JSON.parse(structuredData)
      } catch {
        return NextResponse.json(
          { error: 'Structured data must be valid JSON' },
          { status: 400 }
        )
      }
    }
    
    if (customMeta) {
      try {
        JSON.parse(customMeta)
      } catch {
        return NextResponse.json(
          { error: 'Custom meta must be valid JSON' },
          { status: 400 }
        )
      }
    }
    
    // Create SEO page
    const seoPage = await prisma.seoPage.create({
      data: {
        path: path.trim(),
        title,
        description,
        keywords,
        author,
        robots,
        canonical,
        ogTitle,
        ogDescription,
        ogImage,
        ogType,
        ogUrl,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterCreator,
        structuredData,
        customMeta,
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 5
      }
    })
    
    // Log SEO page creation
    await AuditLogger.logCreate(
      currentUser.id,
      'seo_pages',
      seoPage.id,
      { path: seoPage.path, title: seoPage.title, isActive: seoPage.isActive }
    )
    
    return NextResponse.json({
      message: 'SEO page created successfully',
      seoPage
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error creating SEO page:', error)
    
    // Handle authentication/authorization errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Admin privileges required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }
    
    // Log error
    await AuditLogger.logSystemEvent('SEO_PAGE_CREATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Failed to create SEO page' },
      { status: 500 }
    )
  }
}