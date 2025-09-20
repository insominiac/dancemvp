import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(req.url);
    
    // Query parameters for filtering
    const experienceLevel = searchParams.get('experienceLevel');
    const ageRangeMin = searchParams.get('ageRangeMin');
    const ageRangeMax = searchParams.get('ageRangeMax');
    const location = searchParams.get('location');
    const danceStyleId = searchParams.get('danceStyleId');
    const lookingFor = searchParams.get('lookingFor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get current user's profile to understand their preferences
    const currentUserProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        danceStyles: {
          include: {
            style: true
          }
        }
      }
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    // Get users who already have match requests or matches with current user  
    const existingConnections = await prisma.matchRequest.findMany({
      where: {
        OR: [
          { senderId: currentUserProfile.id },
          { receiverId: currentUserProfile.id }
        ]
      },
      select: {
        senderId: true,
        receiverId: true
      }
    });

    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      select: {
        user1Id: true,
        user2Id: true
      }
    });

    // Create list of user IDs to exclude
    const excludeUserIds = new Set([userId]); // Exclude self
    existingConnections.forEach(conn => {
      // Get the user IDs from the profile IDs in match requests
      // We'll handle this during the query instead
    });
    existingMatches.forEach(match => {
      excludeUserIds.add(match.user1Id);
      excludeUserIds.add(match.user2Id);
    });

    // Build filter conditions
    let whereConditions: any = {
      userId: {
        notIn: Array.from(excludeUserIds)
      },
      isActiveForMatching: true
    };

    // Add filters based on query parameters
    if (experienceLevel) {
      whereConditions.experienceLevel = experienceLevel;
    }

    if (ageRangeMin && ageRangeMax) {
      const minAge = parseInt(ageRangeMin);
      const maxAge = parseInt(ageRangeMax);
      const minBirthYear = new Date().getFullYear() - maxAge;
      const maxBirthYear = new Date().getFullYear() - minAge;
      
      whereConditions.user = {
        dateOfBirth: {
          gte: new Date(minBirthYear, 0, 1),
          lte: new Date(maxBirthYear, 11, 31)
        }
      };
    }

    if (location) {
      whereConditions.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (lookingFor) {
      whereConditions.lookingFor = lookingFor;
    }

    // Find potential matches
    let potentialMatches = await prisma.userProfile.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        },
        danceStyles: {
          include: {
            style: true
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by dance style if specified
    if (danceStyleId) {
      potentialMatches = potentialMatches.filter(profile =>
        profile.danceStyles.some(ds => ds.styleId === danceStyleId)
      );
    }

    // Calculate compatibility scores (simplified algorithm)
    const matchesWithScores = potentialMatches.map(profile => {
      let compatibilityScore = 0;
      let reasons = [];

      // Check dance style compatibility
      const commonDanceStyles = profile.danceStyles.filter(profileStyle =>
        currentUserProfile.danceStyles.some(currentUserStyle =>
          currentUserStyle.styleId === profileStyle.styleId
        )
      );

      if (commonDanceStyles.length > 0) {
        compatibilityScore += 0.4;
        reasons.push(`${commonDanceStyles.length} shared dance style${commonDanceStyles.length > 1 ? 's' : ''}`);
      }

      // Experience level compatibility
      if (profile.experienceLevel === currentUserProfile.experienceLevel) {
        compatibilityScore += 0.3;
        reasons.push('Same experience level');
      }

      // Location proximity (simplified)
      if (profile.location && currentUserProfile.location &&
          profile.location.toLowerCase().includes(currentUserProfile.location.toLowerCase())) {
        compatibilityScore += 0.2;
        reasons.push('Similar location');
      }

      // Looking for compatibility (array comparison)
      if (profile.lookingFor && currentUserProfile.lookingFor) {
        const hasCommonGoals = profile.lookingFor.some(goal => 
          currentUserProfile.lookingFor.includes(goal)
        );
        if (hasCommonGoals) {
          compatibilityScore += 0.1;
          reasons.push('Similar partnership goals');
        }
      }

      // No age calculation since we don't have dateOfBirth in the schema
      let age = null;

      return {
        ...profile,
        user: {
          ...profile.user,
          age
        },
        compatibilityScore: Math.min(compatibilityScore, 1.0), // Cap at 1.0
        compatibilityReasons: reasons,
        commonDanceStyles: commonDanceStyles.map(ds => ds.style)
      };
    });

    // Sort by compatibility score
    matchesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return NextResponse.json({
      success: true,
      data: {
        matches: matchesWithScores,
        total: matchesWithScores.length,
        currentUserProfile: {
          id: currentUserProfile.id,
          experienceLevel: currentUserProfile.experienceLevel,
          location: currentUserProfile.location,
          lookingFor: currentUserProfile.lookingFor,
          danceStyles: currentUserProfile.danceStyles
        }
      }
    });
  } catch (error) {
    console.error('Error finding potential matches:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to find potential matches' },
      { status: 500 }
    );
  }
}
