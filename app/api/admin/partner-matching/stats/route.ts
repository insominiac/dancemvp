import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    const [
      totalProfiles,
      activeProfiles,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      totalMatches,
      activeMatches,
      recentRequests,
      recentMatches,
      experienceLevelStats,
      locationStats,
      danceStyleStats,
      dailyActivity
    ] = await Promise.all([
      // Total profiles
      prisma.userProfile.count(),
      
      // Active profiles
      prisma.userProfile.count({
        where: { isActiveForMatching: true }
      }),
      
      // Total requests
      prisma.matchRequest.count(),
      
      // Pending requests
      prisma.matchRequest.count({
        where: { status: 'PENDING' }
      }),
      
      // Accepted requests
      prisma.matchRequest.count({
        where: { status: 'ACCEPTED' }
      }),
      
      // Rejected requests
      prisma.matchRequest.count({
        where: { status: 'REJECTED' }
      }),
      
      // Total matches
      prisma.match.count(),
      
      // Active matches
      prisma.match.count({
        where: { isActive: true }
      }),
      
      // Recent requests (within period)
      prisma.matchRequest.count({
        where: {
          createdAt: {
            gte: periodDate
          }
        }
      }),
      
      // Recent matches (within period)
      prisma.match.count({
        where: {
          createdAt: {
            gte: periodDate
          }
        }
      }),
      
      // Experience level distribution
      prisma.userProfile.groupBy({
        by: ['experienceLevel'],
        _count: {
          experienceLevel: true
        }
      }),
      
      // Location distribution (top 10)
      prisma.userProfile.groupBy({
        by: ['location'],
        _count: {
          location: true
        },
        where: {
          location: {
            not: null
          }
        },
        orderBy: {
          _count: {
            location: 'desc'
          }
        },
        take: 10
      }),
      
      // Dance style popularity
      prisma.userProfileDanceStyle.groupBy({
        by: ['styleId'],
        _count: {
          styleId: true
        },
        orderBy: {
          _count: {
            styleId: 'desc'
          }
        },
        take: 10
      }),
      
      // Daily activity for the last 30 days
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          'requests' as type
        FROM match_requests 
        WHERE created_at >= ${periodDate}
        GROUP BY DATE(created_at)
        
        UNION ALL
        
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          'matches' as type
        FROM matches 
        WHERE created_at >= ${periodDate}
        GROUP BY DATE(created_at)
        
        ORDER BY date DESC
        LIMIT 60
      `
    ]);

    // Get dance style names for the stats
    const danceStyleIds = danceStyleStats.map(stat => stat.styleId);
    const danceStyles = await prisma.danceStyle.findMany({
      where: {
        id: {
          in: danceStyleIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const danceStyleStatsWithNames = danceStyleStats.map(stat => ({
      ...stat,
      name: danceStyles.find(style => style.id === stat.styleId)?.name || 'Unknown'
    }));

    const stats = {
      overview: {
        totalProfiles,
        activeProfiles,
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        totalMatches,
        activeMatches,
        recentRequests,
        recentMatches
      },
      distributions: {
        experienceLevel: experienceLevelStats,
        locations: locationStats,
        danceStyles: danceStyleStatsWithNames
      },
      activity: dailyActivity,
      matchSuccessRate: totalRequests > 0 ? (acceptedRequests / totalRequests * 100) : 0,
      profileUtilization: totalProfiles > 0 ? (activeProfiles / totalProfiles * 100) : 0
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching partner matching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}