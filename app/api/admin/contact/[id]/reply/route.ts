import { NextRequest, NextResponse } from 'next/server'
import db from '@/app/lib/db'
import { sendEmail } from '@/app/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reply } = body

    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      )
    }

    // Get the original message
    const originalMessage = await db.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!originalMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Update the message with admin reply
    const updatedMessage = await db.contactMessage.update({
      where: { id: params.id },
      data: {
        adminReply: reply,
        repliedAt: new Date(),
        isRead: true // Mark as read when replying
      }
    })

    // Send email notification to the customer
    try {
      await sendEmail({
        to: originalMessage.email,
        subject: `Re: ${originalMessage.subject}`,
        text: `Hello ${originalMessage.name},

Thank you for contacting us. Here's our response to your inquiry:

Original message:
"${originalMessage.message}"

Our response:
${reply}

If you have any further questions, please don't hesitate to contact us.

Best regards,
Dance Platform Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Dance Platform - Response to Your Inquiry</h2>
            
            <p>Hello ${originalMessage.name},</p>
            
            <p>Thank you for contacting us. Here's our response to your inquiry:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">Your original message:</h4>
              <p style="margin: 0; font-style: italic;">"${originalMessage.message}"</p>
            </div>
            
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h4 style="margin: 0 0 10px 0; color: #065f46;">Our response:</h4>
              <p style="margin: 0; white-space: pre-line;">${reply}</p>
            </div>
            
            <p>If you have any further questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            <strong>Dance Platform Team</strong></p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Error sending reply email:', emailError)
      // Continue with success response even if email fails
    }

    return NextResponse.json({ 
      message: 'Reply sent successfully',
      data: updatedMessage 
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}