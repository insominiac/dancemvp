import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/lib/auth'
import { AuditLogger } from '@/app/lib/audit-logger'
import prisma from '@/app/lib/db'

// GET specific SEO page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin access granted to: ${currentUser.email}`)
    
    const { id } = params
    
    const seoPage = await prisma.seoPage.findUnique({
      where: { id }
    })
    
    if (!seoPage) {
      return NextResponse.json(
        { error: 'SEO page not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ seoPage })
    
  } catch (error: any) {
    console.error('Error fetching SEO page:', error)
    
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
      { error: 'Failed to fetch SEO page' },
      { status: 500 }
    )
  }
}

// PUT update SEO page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin updating SEO page: ${currentUser.email}`)
    
    const { id } = params
    const body = await request.json()
    
    // Get existing SEO page for audit logging
    const existingSeoPage = await prisma.seoPage.findUnique({
      where: { id }
    })
    
    if (!existingSeoPage) {
      return NextResponse.json(
        { error: 'SEO page not found' },
        { status: 404 }
      )
    }
    
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
    
    // If path is being changed, check if new path already exists
    if (path && path !== existingSeoPage.path) {
      const existingPath = await prisma.seoPage.findUnique({
        where: { path }
      })
      
      if (existingPath) {
        return NextResponse.json(
          { error: 'SEO page already exists for this path' },
          { status: 400 }
        )
      }
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
    
    // Update SEO page
    const updatedSeoPage = await prisma.seoPage.update({
      where: { id },
      data: {
        ...(path !== undefined && { path: path.trim() }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(keywords !== undefined && { keywords }),
        ...(author !== undefined && { author }),
        ...(robots !== undefined && { robots }),
        ...(canonical !== undefined && { canonical }),
        ...(ogTitle !== undefined && { ogTitle }),
        ...(ogDescription !== undefined && { ogDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(ogType !== undefined && { ogType }),
        ...(ogUrl !== undefined && { ogUrl }),
        ...(twitterCard !== undefined && { twitterCard }),
        ...(twitterTitle !== undefined && { twitterTitle }),
        ...(twitterDescription !== undefined && { twitterDescription }),
        ...(twitterImage !== undefined && { twitterImage }),
        ...(twitterCreator !== undefined && { twitterCreator }),
        ...(structuredData !== undefined && { structuredData }),
        ...(customMeta !== undefined && { customMeta }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
        lastModified: new Date()
      }
    })
    
    // Log SEO page update
    await AuditLogger.logUpdate(
      currentUser.id,
      'seo_pages',
      id,
      {
        path: existingSeoPage.path,
        title: existingSeoPage.title,
        isActive: existingSeoPage.isActive
      },
      {
        path: updatedSeoPage.path,
        title: updatedSeoPage.title,
        isActive: updatedSeoPage.isActive
      }
    )
    
    return NextResponse.json({
      message: 'SEO page updated successfully',
      seoPage: updatedSeoPage
    })
    
  } catch (error: any) {
    console.error('Error updating SEO page:', error)
    
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
    await AuditLogger.logSystemEvent('SEO_PAGE_UPDATE_ERROR', {
      seoPageId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Failed to update SEO page' },
      { status: 500 }
    )
  }
}

// DELETE SEO page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const currentUser = await requireAdmin(request)
    console.log(`✅ Admin deleting SEO page: ${currentUser.email}`)
    
    const { id } = params
    
    // Get SEO page for audit logging
    const seoPage = await prisma.seoPage.findUnique({
      where: { id }
    })
    
    if (!seoPage) {
      return NextResponse.json(
        { error: 'SEO page not found' },
        { status: 404 }
      )
    }
    
    // Delete SEO page
    await prisma.seoPage.delete({
      where: { id }
    })
    
    // Log SEO page deletion
    await AuditLogger.logDelete(
      currentUser.id,
      'seo_pages',
      id,
      {
        path: seoPage.path,
        title: seoPage.title,
        isActive: seoPage.isActive
      }
    )
    
    return NextResponse.json({
      message: 'SEO page deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Error deleting SEO page:', error)
    
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
    await AuditLogger.logSystemEvent('SEO_PAGE_DELETION_ERROR', {
      seoPageId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Failed to delete SEO page' },
      { status: 500 }
    )
  }
}