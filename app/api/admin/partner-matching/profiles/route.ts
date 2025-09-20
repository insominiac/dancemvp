import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const location = searchParams.get('location') || '';
    const isActive = searchParams.get('isActive');
    
    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { bio: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (isActive !== null) {
      where.isActiveForMatching = isActive === 'true';
    }

    const [profiles, totalCount] = await Promise.all([
      prisma.userProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
              role: true,
              createdAt: true
            }
          },
          danceStyles: {
            include: {
              style: true
            }
          },
          _count: {
            select: {
              sentRequests: true,
              receivedRequests: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.userProfile.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        profiles,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profiles for admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}