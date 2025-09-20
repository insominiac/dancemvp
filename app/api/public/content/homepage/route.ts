import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Content file path
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
    // Return default content if there's any error
    return NextResponse.json(DEFAULT_CONTENT)
  }
}

// Add caching headers for better performance
export const revalidate = 300 // Revalidate every 5 minutes