import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Default content for contact page
const DEFAULT_CONTACT_CONTENT = {
  // Hero Section
  heroTitle: "📞 Get in Touch",
  heroSubtitle: "Ready to start dancing? We're here to help you find the perfect class!",
  heroButtons: [
    { text: "📱 Call Now: (123) 456-7890", href: "tel:+1234567890", isPrimary: true },
    { text: "✉️ Email Us", href: "mailto:info@dancelink.com", isPrimary: false }
  ],

  // Quick Options Section
  quickOptionsTitle: "Quick Actions",
  quickOptions: [
    {
      icon: "🎁",
      title: "Book Free Trial",
      description: "Try any class for free and see if it's right for you",
      buttonText: "Book Now",
      buttonHref: "tel:+1234567890"
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Get instant answers to your questions",
      buttonText: "Chat Now",
      buttonHref: "#chat"
    },
    {
      icon: "📅",
      title: "Schedule Visit",
      description: "Visit our studio and meet our instructors",
      buttonText: "Schedule",
      buttonHref: "mailto:info@dancelink.com"
    }
  ],

  // Contact Form Section
  formTitle: "📝 Send Us a Message",
  formSubtitle: "Fill out the form below and we'll get back to you within 24 hours",
  formOptions: [
    { value: "trial", label: "🎁 Free Trial Class" },
    { value: "classes", label: "💃 Regular Classes" },
    { value: "events", label: "🎉 Events & Workshops" },
    { value: "private", label: "👨‍🏫 Private Lessons" },
    { value: "other", label: "❓ Other" }
  ],
  formFields: {
    nameLabel: "Name *",
    phoneLabel: "Phone",
    emailLabel: "Email *",
    interestLabel: "I'm interested in:",
    messageLabel: "Message",
    namePlaceholder: "Your name",
    phonePlaceholder: "(123) 456-7890",
    emailPlaceholder: "you@example.com",
    messagePlaceholder: "Tell us about your dance goals, experience level, or any questions you have..."
  },
  submitButtonText: "🚀 Send Message",
  responseTimeText: "We typically respond within 2-4 hours during business hours",

  // FAQ Section
  faqTitle: "❓ Frequently Asked Questions",
  faqSubtitle: "Quick answers to common questions",
  faqs: [
    {
      question: "Do I need experience to start?",
      answer: "Not at all! We have beginner-friendly classes for all dance styles. Our instructors are experienced in teaching complete beginners."
    },
    {
      question: "What should I wear?",
      answer: "Comfortable clothing that allows you to move freely. Most students wear athletic wear or casual clothes with supportive shoes."
    },
    {
      question: "Can I try before I commit?",
      answer: "Yes! We offer a free trial class for all new students. This lets you experience our teaching style and see if the class is right for you."
    },
    {
      question: "How do I book a class?",
      answer: "Call us at (123) 456-7890, send us an email, or fill out the contact form above. We'll help you find the perfect class!"
    }
  ]
}

const CONTENT_FILE_PATH = path.join(process.cwd(), 'data', 'contact-content.json')

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
    return DEFAULT_CONTACT_CONTENT
  }
}

// Save content to file
async function saveContent(content: any) {
  await ensureDataDirectory()
  await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(content, null, 2))
}

// GET - Fetch current contact page content
export async function GET() {
  try {
    const content = await getContent()
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching contact content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' }, 
      { status: 500 }
    )
  }
}

// PUT - Update contact page content
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
      ...DEFAULT_CONTACT_CONTENT,
      ...content,
      heroButtons: content.heroButtons || DEFAULT_CONTACT_CONTENT.heroButtons,
      quickOptions: content.quickOptions || DEFAULT_CONTACT_CONTENT.quickOptions,
      formOptions: content.formOptions || DEFAULT_CONTACT_CONTENT.formOptions,
      formFields: {
        ...DEFAULT_CONTACT_CONTENT.formFields,
        ...content.formFields
      },
      faqs: content.faqs || DEFAULT_CONTACT_CONTENT.faqs
    }

    await saveContent(mergedContent)

    return NextResponse.json({ 
      message: 'Content updated successfully',
      content: mergedContent
    })
  } catch (error) {
    console.error('Error updating contact content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

// POST - Reset to default content
export async function POST() {
  try {
    await saveContent(DEFAULT_CONTACT_CONTENT)
    return NextResponse.json({ 
      message: 'Content reset to defaults successfully',
      content: DEFAULT_CONTACT_CONTENT
    })
  } catch (error) {
    console.error('Error resetting contact content:', error)
    return NextResponse.json(
      { error: 'Failed to reset content' },
      { status: 500 }
    )
  }
}