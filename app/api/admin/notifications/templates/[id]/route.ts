import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/admin/notifications/templates/[id] - Get specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await db.notificationTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);

  } catch (error) {
    console.error('Error fetching notification template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

// PUT /api/admin/notifications/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, title, message, type, priority, isActive } = body;

    // Check if template exists
    const existingTemplate = await db.notificationTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // If name is being changed, check for conflicts
    if (name && name !== existingTemplate.name) {
      const nameConflict = await db.notificationTemplate.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: params.id }
        }
      });

      if (nameConflict) {
        return NextResponse.json({
          error: 'A template with this name already exists'
        }, { status: 400 });
      }
    }

    const updatedTemplate = await db.notificationTemplate.update({
      where: { id: params.id },
      data: {
        name: name || existingTemplate.name,
        title: title || existingTemplate.title,
        message: message || existingTemplate.message,
        type: type || existingTemplate.type,
        priority: priority || existingTemplate.priority,
        isActive: isActive !== undefined ? isActive : existingTemplate.isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedTemplate);

  } catch (error) {
    console.error('Error updating notification template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

// DELETE /api/admin/notifications/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if template exists
    const existingTemplate = await db.notificationTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await db.notificationTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Template deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}