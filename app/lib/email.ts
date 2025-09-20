import nodemailer from 'nodemailer'

// Email configuration types
interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'resend' | 'console'
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  sendgrid?: {
    apiKey: string
  }
  resend?: {
    apiKey: string
  }
}

// Email template types
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface BookingConfirmationData {
  user: {
    name: string
    email: string
  }
  booking: {
    confirmationCode: string
    totalAmount: number
    amountPaid: number
    paymentMethod: string
    bookingDate: string
  }
  item: {
    title: string
    type: 'class' | 'event'
    startDate: string
    endDate?: string
    startTime?: string
    venue?: {
      name: string
      address: string
      city: string
      state?: string
    }
    instructor?: string
    organizer?: string
  }
}

class EmailService {
  private config: EmailConfig
  private transporter: any

  constructor() {
    this.config = this.getEmailConfig()
    this.initializeTransporter()
  }

  private getEmailConfig(): EmailConfig {
    const provider = (process.env.EMAIL_PROVIDER || 'console') as EmailConfig['provider']

    const config: EmailConfig = { provider }

    switch (provider) {
      case 'smtp':
        config.smtp = {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        }
        break
      
      case 'sendgrid':
        config.sendgrid = {
          apiKey: process.env.SENDGRID_API_KEY || ''
        }
        break
      
      case 'resend':
        config.resend = {
          apiKey: process.env.RESEND_API_KEY || ''
        }
        break
      
      case 'console':
      default:
        // Console logging for development
        break
    }

    return config
  }

  private async initializeTransporter() {
    switch (this.config.provider) {
      case 'smtp':
        if (this.config.smtp) {
          this.transporter = nodemailer.createTransport(this.config.smtp)
        }
        break
      
      case 'console':
      default:
        // Create console transporter for development
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        })
        break
    }
  }

  async sendEmail(to: string, template: EmailTemplate, from?: string): Promise<boolean> {
    try {
      const fromAddress = from || process.env.EMAIL_FROM || 'DanceLink <noreply@dancelink.com>'

      switch (this.config.provider) {
        case 'console':
          console.log('📧 Email would be sent:')
          console.log(`From: ${fromAddress}`)
          console.log(`To: ${to}`)
          console.log(`Subject: ${template.subject}`)
          console.log('HTML Content:', template.html)
          console.log('Text Content:', template.text || 'No text version')
          console.log('---')
          return true

        case 'smtp':
          if (!this.transporter) {
            throw new Error('SMTP transporter not initialized')
          }

          const result = await this.transporter.sendMail({
            from: fromAddress,
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
          })

          console.log('Email sent via SMTP:', result.messageId)
          return true

        case 'sendgrid':
          // TODO: Implement SendGrid integration
          console.log('SendGrid email sending not yet implemented')
          return false

        case 'resend':
          // TODO: Implement Resend integration
          console.log('Resend email sending not yet implemented')
          return false

        default:
          console.error('Unknown email provider:', this.config.provider)
          return false
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  // Email templates
  generateBookingConfirmationEmail(data: BookingConfirmationData): EmailTemplate {
    const { user, booking, item } = data

    const subject = `Booking Confirmed: ${item.title} - ${booking.confirmationCode}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f72585); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight { color: #f72585; font-weight: bold; }
          .button { background: #f72585; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your ${item.type} booking is confirmed</p>
          </div>
          
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Great news! Your booking for <strong>${item.title}</strong> has been confirmed and your payment has been processed successfully.</p>
            
            <div class="booking-details">
              <h3>📅 ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Details</h3>
              <p><strong>Title:</strong> ${item.title}</p>
              <p><strong>Date:</strong> ${new Date(item.startDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${item.startTime ? `<p><strong>Time:</strong> ${item.startTime}</p>` : ''}
              ${item.venue ? `
                <p><strong>Location:</strong> ${item.venue.name}<br>
                ${item.venue.address}<br>
                ${item.venue.city}${item.venue.state ? `, ${item.venue.state}` : ''}</p>
              ` : ''}
              ${item.instructor ? `<p><strong>Instructor:</strong> ${item.instructor}</p>` : ''}
              ${item.organizer ? `<p><strong>Organizer:</strong> ${item.organizer}</p>` : ''}
            </div>

            <div class="booking-details">
              <h3>💳 Payment Details</h3>
              <p><strong>Confirmation Code:</strong> <span class="highlight">${booking.confirmationCode}</span></p>
              <p><strong>Total Amount:</strong> $${booking.totalAmount.toFixed(2)}</p>
              <p><strong>Amount Paid:</strong> $${booking.amountPaid.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
              <p><strong>Payment Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            </div>

            <h3>✨ What's Next?</h3>
            <ul>
              <li>Save this confirmation email for your records</li>
              <li>Arrive ${item.type === 'class' ? '10' : '15'} minutes early</li>
              <li>Bring comfortable clothes and water</li>
              <li>Check your dashboard for any updates</li>
            </ul>

            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard" class="button">
                View My Dashboard
              </a>
            </p>
          </div>

          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:support@dancelink.com">support@dancelink.com</a></p>
            <p>&copy; 2024 DanceLink. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Booking Confirmation - ${item.title}

      Hello ${user.name}!

      Your booking for "${item.title}" has been confirmed!

      ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Details:
      - Title: ${item.title}
      - Date: ${new Date(item.startDate).toLocaleDateString()}
      ${item.startTime ? `- Time: ${item.startTime}` : ''}
      ${item.venue ? `- Location: ${item.venue.name}, ${item.venue.address}, ${item.venue.city}` : ''}
      ${item.instructor ? `- Instructor: ${item.instructor}` : ''}

      Payment Details:
      - Confirmation Code: ${booking.confirmationCode}
      - Amount Paid: $${booking.amountPaid.toFixed(2)}
      - Payment Method: ${booking.paymentMethod}

      What's Next:
      - Arrive ${item.type === 'class' ? '10' : '15'} minutes early
      - Bring comfortable clothes and water
      - Check your dashboard for updates

      Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard

      Questions? Contact us at support@dancelink.com

      © 2024 DanceLink. All rights reserved.
    `

    return { subject, html, text }
  }

  generatePaymentReceiptEmail(data: BookingConfirmationData): EmailTemplate {
    const { user, booking, item } = data

    const subject = `Payment Receipt - ${booking.confirmationCode}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a2e; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .receipt-table th, .receipt-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .receipt-table th { background: #f8f9fa; }
          .total-row { font-weight: bold; background: #f0f9ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Payment Receipt</h1>
            <p>Receipt #${booking.confirmationCode}</p>
          </div>
          
          <div class="content">
            <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
            
            <table class="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${item.title} (${item.type})</td>
                  <td>$${booking.totalAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total Paid</td>
                  <td>$${booking.amountPaid.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${booking.confirmationCode}</p>
          </div>

          <div class="footer">
            <p>Keep this receipt for your records</p>
            <p>&copy; 2024 DanceLink. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Payment Receipt
      
      Receipt #${booking.confirmationCode}
      Date: ${new Date(booking.bookingDate).toLocaleDateString()}
      Customer: ${user.name} (${user.email})
      
      Description: ${item.title} (${item.type})
      Amount: $${booking.totalAmount.toFixed(2)}
      Total Paid: $${booking.amountPaid.toFixed(2)}
      
      Payment Method: ${booking.paymentMethod}
      Transaction ID: ${booking.confirmationCode}
      
      Keep this receipt for your records.
      
      © 2024 DanceLink. All rights reserved.
    `

    return { subject, html, text }
  }

  // Main booking confirmation method
  async sendBookingConfirmation(data: BookingConfirmationData): Promise<boolean> {
    const template = this.generateBookingConfirmationEmail(data)
    return await this.sendEmail(data.user.email, template)
  }

  // Payment receipt method
  async sendPaymentReceipt(data: BookingConfirmationData): Promise<boolean> {
    const template = this.generatePaymentReceiptEmail(data)
    return await this.sendEmail(data.user.email, template)
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default EmailService

// Convenience function exports
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}): Promise<boolean> {
  const template: EmailTemplate = {
    subject: options.subject,
    html: options.html,
    text: options.text
  }
  return await emailService.sendEmail(options.to, template, options.from)
}

// Contact form notification
export async function sendContactNotification(options: {
  adminEmail: string
  customerName: string
  customerEmail: string
  subject: string
  message: string
}): Promise<boolean> {
  const template: EmailTemplate = {
    subject: `New Contact Form Submission: ${options.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Contact Form Submission</h2>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${options.customerName}</p>
          <p><strong>Email:</strong> ${options.customerEmail}</p>
          <p><strong>Subject:</strong> ${options.subject}</p>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
          <h3 style="margin: 0 0 10px 0;">Message</h3>
          <p style="white-space: pre-line;">${options.message}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Respond to this inquiry by visiting the admin panel or replying directly to ${options.customerEmail}.
        </p>
      </div>
    `,
    text: `
      New Contact Form Submission
      
      From: ${options.customerName} (${options.customerEmail})
      Subject: ${options.subject}
      
      Message:
      ${options.message}
      
      Respond by visiting the admin panel or replying directly to ${options.customerEmail}.
    `
  }
  
  return await emailService.sendEmail(options.adminEmail, template)
}
