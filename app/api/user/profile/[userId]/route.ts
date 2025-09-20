import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        danceStyles: {
          include: {
            style: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const data = await req.json();

    // Separate dance styles from profile data
    const { danceStyles, ...profileData } = data;

    // Update or create user profile
    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData
      },
      update: profileData
    });

    // If dance styles are provided, update them
    if (danceStyles && Array.isArray(danceStyles)) {
      // Delete existing dance styles
      await prisma.userProfileDanceStyle.deleteMany({
        where: { profileId: userProfile.id }
      });

      // Add new dance styles
      if (danceStyles.length > 0) {
        await prisma.userProfileDanceStyle.createMany({
          data: danceStyles.map((style: { danceStyleId: string; level: string }) => ({
            profileId: userProfile.id,
            styleId: style.danceStyleId,
            level: style.level
          }))
        });
      }
    }

    // Fetch updated profile with dance styles
    const updatedProfile = await prisma.userProfile.findUnique({
      where: { id: userProfile.id },
      include: {
        danceStyles: {
          include: {
            style: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Delete user profile (cascade will handle related records)
    await prisma.userProfile.deleteMany({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      message: 'User profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user profile' },
      { status: 500 }
    );
  }
}
