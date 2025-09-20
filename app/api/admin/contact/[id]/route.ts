import { NextRequest, NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const message = await db.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error fetching contact message:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact message' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isRead } = body

    const message = await db.contactMessage.update({
      where: { id: params.id },
      data: {
        isRead: isRead !== undefined ? isRead : undefined
      }
    })

    return NextResponse.json({ 
      message: 'Message updated successfully',
      data: message 
    })
  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json(
      { error: 'Failed to update contact message' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.contactMessage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Message deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact message' },
      { status: 500 }
    )
  }
}