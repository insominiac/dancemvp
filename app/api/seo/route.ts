import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

// GET SEO data for a specific path
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }
    
    // Find SEO data for the specific path
    const seoData = await prisma.seoPage.findUnique({
      where: { 
        path,
        isActive: true
      },
      select: {
        title: true,
        description: true,
        keywords: true,
        author: true,
        robots: true,
        canonical: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        ogType: true,
        ogUrl: true,
        twitterCard: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        twitterCreator: true,
        structuredData: true,
        customMeta: true,
        priority: true,
        lastModified: true
      }
    })
    
    // If no specific SEO data found, return default structure
    if (!seoData) {
      return NextResponse.json({
        seoData: null,
        hasCustomSeo: false
      })
    }
    
    // Parse JSON fields
    let structuredDataParsed = null
    let customMetaParsed = null
    
    if (seoData.structuredData) {
      try {
        structuredDataParsed = JSON.parse(seoData.structuredData)
      } catch (error) {
        console.error('Error parsing structured data:', error)
      }
    }
    
    if (seoData.customMeta) {
      try {
        customMetaParsed = JSON.parse(seoData.customMeta)
      } catch (error) {
        console.error('Error parsing custom meta:', error)
      }
    }
    
    return NextResponse.json({
      seoData: {
        ...seoData,
        structuredData: structuredDataParsed,
        customMeta: customMetaParsed
      },
      hasCustomSeo: true
    })
    
  } catch (error) {
    console.error('Error fetching SEO data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO data' },
      { status: 500 }
    )
  }
}

// GET all active SEO paths (for sitemap generation)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'get_sitemap_data') {
      const seoPages = await prisma.seoPage.findMany({
        where: { isActive: true },
        select: {
          path: true,
          priority: true,
          lastModified: true,
          canonical: true
        },
        orderBy: { priority: 'desc' }
      })
      
      return NextResponse.json({
        seoPages,
        generatedAt: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error processing SEO request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}