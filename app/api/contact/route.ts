import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import db from '@/app/lib/db'
import { sendContactNotification } from '@/app/lib/email'

// Validation schema
const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the input
    const validatedData = ContactFormSchema.parse(body)
    const { name, email, subject, message } = validatedData

    // Save to database
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        isRead: false
      }
    })

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'admin@danceplatform.com'
    
    try {
      await sendContactNotification({
        adminEmail,
        customerName: name,
        customerEmail: email,
        subject,
        message
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Continue even if email fails - the message is still saved
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      id: contactMessage.id
    })

  } catch (error) {
    console.error('Contact form submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}