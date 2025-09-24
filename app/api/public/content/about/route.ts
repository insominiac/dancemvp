import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Content file path
const ABOUT_CONTENT_FILE = path.join(process.cwd(), 'data', 'about-content.json')

// Default about page content
const DEFAULT_ABOUT_CONTENT = {
  // Hero Section
  heroTitle: "About DanceLink",
  heroSubtitle: "Connecting dancers through the universal language of movement. Discover our passion for dance and commitment to excellence.",
  heroBadgeText: "Our Story & Mission",
  heroFeatures: [
    { icon: "🌟", text: "Award-winning platform" },
    { icon: "💃", text: "Expert instructors" },
    { icon: "❤️", text: "Passionate community" }
  ],

  // Stats Section
  statsTitle: "Our Impact in Numbers",
  statsDescription: "See how we're making a difference in the dance community with our platform and dedicated instructors",
  stats: [
    { 
      number: "500+", 
      label: "Happy Students", 
      description: "And growing daily",
      color: "purple"
    },
    { 
      number: "15+", 
      label: "Dance Styles", 
      description: "From ballet to hip-hop",
      color: "pink"
    },
    { 
      number: "20+", 
      label: "Expert Instructors", 
      description: "Professional & certified",
      color: "purple"
    },
    { 
      number: "5", 
      label: "Studio Locations", 
      description: "Across the city",
      color: "pink"
    }
  ],

  // Story Section
  storyTitle: "Our Story",
  storyDescription1: "DanceLink was founded with a simple belief: everyone deserves to experience the joy and connection that comes from dance. We started as a small community of passionate dancers and have grown into a thriving platform that connects thousands of students with world-class instructors.",
  storyDescription2: "Our mission is to make dance accessible, welcoming, and transformative for people of all backgrounds and skill levels. Whether you're taking your first steps or perfecting advanced techniques, we're here to support your dance journey.",
  
  // Why Choose Us Features
  whyChooseUsTitle: "Why Choose DanceLink?",
  features: [
    {
      icon: "🏅️",
      title: "Award-winning instructors",
      description: "Learn from certified professionals with years of experience",
      bgColor: "purple"
    },
    {
      icon: "🏢",
      title: "State-of-the-art studios", 
      description: "Modern facilities equipped with the latest technology",
      bgColor: "pink"
    },
    {
      icon: "👥",
      title: "Welcoming community",
      description: "Join a supportive network of fellow dance enthusiasts",
      bgColor: "purple"
    },
    {
      icon: "📈",
      title: "Proven results",
      description: "Track your progress and celebrate your achievements",
      bgColor: "pink"
    }
  ],

  // Newsletter Section
  newsletterTitle: "Stay in the Loop!",
  newsletterDescription: "Get exclusive access to new classes, special events, and dance tips delivered to your inbox weekly.",
  newsletterBenefits: [
    { icon: "🎁", text: "Weekly Tips" },
    { icon: "🎉", text: "Exclusive Events" },
    { icon: "💰", text: "Special Discounts" }
  ],

  // Final CTA Section
  ctaTitle: "Ready to Begin Your Dance Journey?",
  ctaDescription: "Join hundreds of dancers who have transformed their lives through movement at DanceLink. Start your adventure today!",
  ctaBadgeText: "Start Your Journey",
  ctaButtons: {
    primary: { text: "🎁 Start Free Trial", href: "/contact" },
    secondary: { text: "👀 Browse All Classes", href: "/classes" }
  },
  ctaFeatures: [
    {
      icon: "✅",
      title: "No Experience Needed",
      description: "Perfect for beginners and seasoned dancers alike"
    },
    {
      icon: "📅",
      title: "Flexible Scheduling",
      description: "Choose classes that fit your busy lifestyle"
    },
    {
      icon: "💰",
      title: "Money-back Guarantee",
      description: "100% satisfaction or your money back"
    }
  ]
}

export async function GET() {
  try {
    // Try to read existing content
    try {
      const content = await fs.readFile(ABOUT_CONTENT_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(content))
    } catch {
      // If file doesn't exist, return default content
      return NextResponse.json(DEFAULT_ABOUT_CONTENT)
    }
  } catch (error) {
    console.error('Error fetching about content:', error)
    // Return default content if there's any error
    return NextResponse.json(DEFAULT_ABOUT_CONTENT)
  }
}

// Add caching headers for better performance
export const revalidate = 300 // Revalidate every 5 minutes