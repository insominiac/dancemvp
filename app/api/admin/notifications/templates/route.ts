import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/admin/notifications/templates - Get all notification templates
export async function GET(request: NextRequest) {
  try {
    const templates = await db.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/admin/notifications/templates - Create new notification template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, message, type, priority = 'NORMAL', isActive = true } = body;

    // Validation
    if (!name || !title || !message || !type) {
      return NextResponse.json({
        error: 'name, title, message, and type are required'
      }, { status: 400 });
    }

    // Check if template name already exists
    const existingTemplate = await db.notificationTemplate.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingTemplate) {
      return NextResponse.json({
        error: 'A template with this name already exists'
      }, { status: 400 });
    }

    const template = await db.notificationTemplate.create({
      data: {
        name,
        title,
        message,
        type,
        priority,
        isActive
      }
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}