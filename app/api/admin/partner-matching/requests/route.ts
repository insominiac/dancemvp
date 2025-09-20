import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          sender: {
            user: {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }
          }
        },
        {
          receiver: {
            user: {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }
          }
        },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [requests, totalCount] = await Promise.all([
      prisma.matchRequest.findMany({
        where,
        include: {
          sender: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  profileImage: true,
                  role: true
                }
              }
            }
          },
          receiver: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  profileImage: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.matchRequest.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching match requests for admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch match requests' },
      { status: 500 }
    );
  }
}