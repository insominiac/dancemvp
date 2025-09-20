import { NextRequest, NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, messageIds } = body

    if (!action || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and messageIds are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'markRead':
        result = await db.contactMessage.updateMany({
          where: { id: { in: messageIds } },
          data: { isRead: true }
        })
        break

      case 'markUnread':
        result = await db.contactMessage.updateMany({
          where: { id: { in: messageIds } },
          data: { isRead: false }
        })
        break

      case 'delete':
        result = await db.contactMessage.deleteMany({
          where: { id: { in: messageIds } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: markRead, markUnread, or delete' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affected: result.count
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}