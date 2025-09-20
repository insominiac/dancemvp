import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Content file path - in a real app, this would be stored in a database
const CONTENT_FILE = path.join(process.cwd(), 'data', 'homepage-content.json')

// Default homepage content
const DEFAULT_CONTENT = {
  heroTitle: "Master the Art of Dance",
  heroSubtitle: "Join our community of passionate dancers and experienced instructors",
  heroButtonText: "Start Your Journey",
  heroBackgroundImage: null,
  aboutTitle: "Why Choose Our Studio?",
  aboutDescription: "We offer a wide range of dance classes for all skill levels, with expert instructors and a supportive community.",
  testimonialsEnabled: true,
  newsletterEnabled: true
}

export async function GET() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CONTENT_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Try to read existing content
    try {
      const content = await fs.readFile(CONTENT_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(content))
    } catch {
      // If file doesn't exist, return default content
      return NextResponse.json(DEFAULT_CONTENT)
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ error: 'Failed to fetch homepage content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const content = await request.json()
    
    // Validate required fields
    if (!content.heroTitle || !content.heroSubtitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure data directory exists
    const dataDir = path.dirname(CONTENT_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Save content to file
    await fs.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2))

    return NextResponse.json({ 
      success: true, 
      message: 'Homepage content updated successfully',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving homepage content:', error)
    return NextResponse.json({ error: 'Failed to save homepage content' }, { status: 500 })
  }
}