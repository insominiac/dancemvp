import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Default content for instructors page
const DEFAULT_INSTRUCTORS_CONTENT = {
  // Hero Section
  heroBadgeText: "Meet Our Expert Team",
  heroTitle: "Our Instructors",
  heroSubtitle: "Meet the talented professionals behind our classes. Experienced, passionate, and dedicated to helping you achieve your dance goals.",
  heroFeatures: [
    { icon: "🎭", text: "Expert instructors" },
    { icon: "🏆", text: "Years of experience" },
    { icon: "✨", text: "Personalized guidance" }
  ],

  // Stats Section
  statsSection: {
    title: "Our Teaching Excellence",
    subtitle: "Meet our diverse team of professional dance instructors, each bringing unique expertise and passion to every class",
    labels: {
      instructorsLabel: "Expert Instructors",
      classesLabel: "Active Classes", 
      experienceLabel: "Years Experience"
    }
  },

  // No Instructors State
  noInstructorsSection: {
    icon: "👨‍🏫",
    title: "No Instructors Available",
    subtitle: "We're currently updating our instructor profiles. Please check back soon!",
    buttonText: "View Classes",
    buttonHref: "/classes"
  },

  // Error State
  errorSection: {
    icon: "⚠️",
    subtitle: "Please try refreshing the page or contact support if the issue persists.",
    buttonText: "Try Again"
  },

  // CTA Section
  ctaSection: {
    badgeText: "Start Your Journey",
    title: "Ready to Learn?",
    subtitle: "Join our expert instructors and discover the joy of dance. From beginner-friendly classes to advanced techniques, we have the perfect class for you.",
    buttons: [
      { text: "🎆 Browse All Classes", href: "/classes", isPrimary: true },
      { text: "📞 Schedule a Trial Class", href: "/contact", isPrimary: false }
    ],
    features: [
      {
        icon: "🎨",
        title: "Personalized Instruction",
        description: "Get individual attention and customized feedback from our expert instructors"
      },
      {
        icon: "🎭", 
        title: "Multiple Dance Styles",
        description: "Learn from specialists in ballet, hip-hop, contemporary, salsa, and more"
      },
      {
        icon: "🎆",
        title: "All Skill Levels", 
        description: "Whether you're a complete beginner or advanced dancer, find your perfect class"
      }
    ]
  }
}

const CONTENT_FILE_PATH = path.join(process.cwd(), 'data', 'instructors-content.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(CONTENT_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Get content from file or return defaults
async function getContent() {
  try {
    await ensureDataDirectory()
    const content = await fs.readFile(CONTENT_FILE_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    // If file doesn't exist or can't be read, return defaults
    return DEFAULT_INSTRUCTORS_CONTENT
  }
}

// Save content to file
async function saveContent(content: any) {
  await ensureDataDirectory()
  await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(content, null, 2))
}

// GET - Fetch current instructors page content
export async function GET() {
  try {
    const content = await getContent()
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching instructors content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' }, 
      { status: 500 }
    )
  }
}

// PUT - Update instructors page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Merge with defaults to ensure all fields exist
    const mergedContent = {
      ...DEFAULT_INSTRUCTORS_CONTENT,
      ...content,
      heroFeatures: content.heroFeatures || DEFAULT_INSTRUCTORS_CONTENT.heroFeatures,
      statsSection: {
        ...DEFAULT_INSTRUCTORS_CONTENT.statsSection,
        ...content.statsSection
      },
      noInstructorsSection: {
        ...DEFAULT_INSTRUCTORS_CONTENT.noInstructorsSection,
        ...content.noInstructorsSection
      },
      errorSection: {
        ...DEFAULT_INSTRUCTORS_CONTENT.errorSection,
        ...content.errorSection
      },
      ctaSection: {
        ...DEFAULT_INSTRUCTORS_CONTENT.ctaSection,
        ...content.ctaSection,
        buttons: content.ctaSection?.buttons || DEFAULT_INSTRUCTORS_CONTENT.ctaSection.buttons,
        features: content.ctaSection?.features || DEFAULT_INSTRUCTORS_CONTENT.ctaSection.features
      }
    }

    await saveContent(mergedContent)

    return NextResponse.json({ 
      message: 'Content updated successfully',
      content: mergedContent
    })
  } catch (error) {
    console.error('Error updating instructors content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

// POST - Reset to default content
export async function POST() {
  try {
    await saveContent(DEFAULT_INSTRUCTORS_CONTENT)
    return NextResponse.json({ 
      message: 'Content reset to defaults successfully',
      content: DEFAULT_INSTRUCTORS_CONTENT
    })
  } catch (error) {
    console.error('Error resetting instructors content:', error)
    return NextResponse.json(
      { error: 'Failed to reset content' },
      { status: 500 }
    )
  }
}