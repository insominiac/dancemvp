import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;
    const { action, userId } = await req.json(); // action: 'accept' | 'reject' | 'cancel'

    // Get the match request
    const matchRequest = await prisma.matchRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          include: {
            user: true
          }
        },
        receiver: {
          include: {
            user: true
          }
        }
      }
    });

    if (!matchRequest) {
      return NextResponse.json(
        { success: false, message: 'Match request not found' },
        { status: 404 }
      );
    }

    // Verify user can perform this action
    if (action === 'cancel' && matchRequest.sender.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Only the requester can cancel a match request' },
        { status: 403 }
      );
    }

    if ((action === 'accept' || action === 'reject') && matchRequest.receiver.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Only the requestee can accept or reject a match request' },
        { status: 403 }
      );
    }

    // Update the match request based on action
    let updatedStatus: string;
    let responseMessage: string;

    switch (action) {
      case 'accept':
        updatedStatus = 'ACCEPTED';
        responseMessage = 'Match request accepted successfully';
        break;
      case 'reject':
        updatedStatus = 'REJECTED';
        responseMessage = 'Match request rejected successfully';
        break;
      case 'cancel':
        updatedStatus = 'REJECTED'; // We'll use REJECTED for cancelled requests
        responseMessage = 'Match request cancelled successfully';
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update the match request
    const updatedRequest = await prisma.matchRequest.update({
      where: { id: requestId },
      data: {
        status: updatedStatus,
        respondedAt: new Date()
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

    // If accepted, create a match
    if (action === 'accept') {
      const match = await prisma.match.create({
        data: {
          user1Id: matchRequest.sender.user.id,
          user2Id: matchRequest.receiver.user.id,
          matchScore: 0.8, // You can implement a real scoring algorithm later
          isActive: true
        }
      });

      return NextResponse.json({
        success: true,
        message: responseMessage,
        data: {
          matchRequest: updatedRequest,
          match
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating match request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update match request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;

    await prisma.matchRequest.delete({
      where: { id: requestId }
    });

    return NextResponse.json({
      success: true,
      message: 'Match request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting match request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete match request' },
      { status: 500 }
    );
  }
}
