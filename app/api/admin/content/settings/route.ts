import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Content file path - in a real app, this would be stored in a database
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'site-settings.json')

// Default site settings
const DEFAULT_SETTINGS = {
  siteName: "Dance Studio",
  siteDescription: "Premier dance studio offering classes for all levels",
  contactEmail: "info@dancestudio.com",
  phoneNumber: "+1 (555) 123-4567",
  address: "123 Dance Street, City, State 12345",
  socialMedia: {
    facebook: "https://facebook.com/dancestudio",
    instagram: "https://instagram.com/dancestudio",
    twitter: "https://twitter.com/dancestudio"
  }
}

export async function GET() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(SETTINGS_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Try to read existing settings
    try {
      const settings = await fs.readFile(SETTINGS_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(settings))
    } catch {
      // If file doesn't exist, return default settings
      return NextResponse.json(DEFAULT_SETTINGS)
    }
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // Validate required fields
    if (!settings.siteName || !settings.contactEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.contactEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Ensure data directory exists
    const dataDir = path.dirname(SETTINGS_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Save settings to file
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))

    return NextResponse.json({ 
      success: true, 
      message: 'Site settings updated successfully',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving site settings:', error)
    return NextResponse.json({ error: 'Failed to save site settings' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Reset to default settings
    const dataDir = path.dirname(SETTINGS_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2))

    return NextResponse.json({ 
      success: true, 
      message: 'Site settings reset to defaults',
      settings: DEFAULT_SETTINGS
    })
  } catch (error) {
    console.error('Error resetting site settings:', error)
    return NextResponse.json({ error: 'Failed to reset site settings' }, { status: 500 })
  }
}