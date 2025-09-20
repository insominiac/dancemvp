import { NextResponse } from 'next/server'
import prisma from '@/app/lib/db'

export async function GET() {
  try {
    // Get table counts for all entities
    const tables = [
      { name: 'Users', count: await prisma.user.count(), icon: '👤' },
      { name: 'Instructors', count: await prisma.instructor.count(), icon: '👩‍🏫' },
      { name: 'Classes', count: await prisma.class.count(), icon: '📚' },
      { name: 'Events', count: await prisma.event.count(), icon: '🎉' },
      { name: 'Venues', count: await prisma.venue.count(), icon: '🏢' },
      { name: 'Bookings', count: await prisma.booking.count(), icon: '🎫' },
      { name: 'Transactions', count: await prisma.transaction.count(), icon: '💰' },
      { name: 'Dance Styles', count: await prisma.danceStyle.count(), icon: '💃' },
      { name: 'User Styles', count: await prisma.userStyle.count(), icon: '🕺' },
      { name: 'Class Styles', count: await prisma.classStyle.count(), icon: '🎨' },
      { name: 'Event Styles', count: await prisma.eventStyle.count(), icon: '🎭' },
      { name: 'Class Instructors', count: await prisma.classInstructor.count(), icon: '🔗' },
      { name: 'Forum Posts', count: await prisma.forumPost.count(), icon: '💬' },
      { name: 'Forum Replies', count: await prisma.forumReply.count(), icon: '💭' },
      { name: 'Notifications', count: await prisma.notification.count(), icon: '🔔' },
      { name: 'Testimonials', count: await prisma.testimonial.count(), icon: '⭐' },
      { name: 'Contact Messages', count: await prisma.contactMessage.count(), icon: '📧' },
      { name: 'Partner Requests', count: await prisma.partnerRequest.count(), icon: '🤝' },
      { name: 'Partner Matches', count: await prisma.partnerMatch.count(), icon: '💑' },
      { name: 'Audit Logs', count: await prisma.auditLog.count(), icon: '📋' }
    ]

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Error fetching tables info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables info' },
      { status: 500 }
    )
  }
}
