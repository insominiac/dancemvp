import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');
    
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const danceStyles = await prisma.danceStyle.findMany({
      where,
      include: {
        _count: {
          select: {
            classStyles: true,
            eventStyles: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: danceStyles
    });
  } catch (error) {
    console.error('Error fetching dance styles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dance styles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      icon,
      subtitle,
      description,
      difficulty,
      origin,
      musicStyle,
      characteristics,
      benefits,
      schedule,
      price,
      instructors,
      image,
      videoUrl,
      isActive = true,
      isFeatured = false,
      sortOrder
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Parse JSON fields if they're strings
    const parseJsonField = (field: any) => {
      if (typeof field === 'string') {
        try {
          return JSON.stringify(JSON.parse(field));
        } catch {
          return field;
        }
      }
      return field ? JSON.stringify(field) : null;
    };

    const danceStyle = await prisma.danceStyle.create({
      data: {
        name,
        category,
        icon,
        subtitle,
        description,
        difficulty,
        origin,
        musicStyle,
        characteristics: parseJsonField(characteristics),
        benefits: parseJsonField(benefits),
        schedule: parseJsonField(schedule),
        price,
        instructors,
        image,
        videoUrl,
        isActive,
        isFeatured,
        sortOrder
      }
    });

    return NextResponse.json({
      success: true,
      data: danceStyle,
      message: 'Dance style created successfully'
    });
  } catch (error) {
    console.error('Error creating dance style:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create dance style' },
      { status: 500 }
    );
  }
}
