import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'sent' or 'received'

    // First get user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    let whereClause = {};
    
    if (type === 'sent') {
      whereClause = { senderId: userProfile.id };
    } else if (type === 'received') {
      whereClause = { receiverId: userProfile.id };
    } else {
      // Get both sent and received
      whereClause = {
        OR: [
          { senderId: userProfile.id },
          { receiverId: userProfile.id }
        ]
      };
    }

    const matchRequests = await prisma.matchRequest.findMany({
      where: whereClause,
      include: {
        sender: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            },
            danceStyles: {
              include: {
                style: true
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
                profileImage: true
              }
            },
            danceStyles: {
              include: {
                style: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: matchRequests
    });
  } catch (error) {
    console.error('Error fetching match requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch match requests' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { requesteeId, message } = await req.json();

    // Get user profiles for both sender and receiver
    const senderProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    const receiverProfile = await prisma.userProfile.findUnique({
      where: { userId: requesteeId }
    });

    if (!senderProfile || !receiverProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if a request already exists between these users
    const existingRequest = await prisma.matchRequest.findFirst({
      where: {
        OR: [
          { senderId: senderProfile.id, receiverId: receiverProfile.id },
          { senderId: receiverProfile.id, receiverId: senderProfile.id }
        ],
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: 'A match request already exists between these users' },
        { status: 400 }
      );
    }

    // Create new match request
    const matchRequest = await prisma.matchRequest.create({
      data: {
        senderId: senderProfile.id,
        receiverId: receiverProfile.id,
        message,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      include: {
        sender: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            },
            danceStyles: {
              include: {
                style: true
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
                profileImage: true
              }
            },
            danceStyles: {
              include: {
                style: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: matchRequest
    });
  } catch (error) {
    console.error('Error creating match request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create match request' },
      { status: 500 }
    );
  }
}
