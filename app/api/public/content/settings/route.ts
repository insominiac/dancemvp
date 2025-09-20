import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Content file path
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
    // Return default settings if there's any error
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

// Add caching headers for better performance
export const revalidate = 300 // Revalidate every 5 minutes