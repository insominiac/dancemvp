const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedPerformanceData() {
  try {
    console.log('🌱 Seeding performance tracking data...')

    // Get existing users and instructors
    const users = await prisma.user.findMany({ take: 5 })
    const instructors = await prisma.instructor.findMany({ take: 2 })
    const classes = await prisma.class.findMany({ take: 3 })
    const bookings = await prisma.booking.findMany({ take: 10 })

    if (users.length === 0 || instructors.length === 0 || classes.length === 0) {
      console.log('⚠️ No existing data found. Please ensure you have users, instructors, classes, and bookings in your database first.')
      return
    }

    console.log(`Found ${users.length} users, ${instructors.length} instructors, ${classes.length} classes, ${bookings.length} bookings`)

    // Create sample attendance data
    for (const booking of bookings.slice(0, 8)) {
      try {
        await prisma.classAttendance.create({
          data: {
            bookingId: booking.id,
            classId: booking.classId || classes[0].id,
            userId: booking.userId,
            instructorId: instructors[0].id,
            status: Math.random() > 0.2 ? 'PRESENT' : Math.random() > 0.5 ? 'LATE' : 'ABSENT',
            checkedInAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            duration: Math.floor(Math.random() * 30) + 45 // 45-75 minutes
          }
        })
      } catch (error) {
        // Skip if already exists
        console.log(`Attendance for booking ${booking.id} already exists, skipping...`)
      }
    }

    // Create sample feedback data
    for (const booking of bookings.slice(0, 6)) {
      try {
        await prisma.studentFeedback.create({
          data: {
            bookingId: booking.id,
            classId: booking.classId || classes[0].id,
            userId: booking.userId,
            instructorId: instructors[0].id,
            overallRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            teachingRating: Math.floor(Math.random() * 2) + 4,
            contentRating: Math.floor(Math.random() * 2) + 4,
            engagementRating: Math.floor(Math.random() * 2) + 4,
            difficultyRating: Math.floor(Math.random() * 5) + 1, // 1-5
            paceRating: Math.floor(Math.random() * 5) + 1,
            comment: Math.random() > 0.5 ? 'Great class! Really enjoyed the session.' : null,
            wouldRecommend: Math.random() > 0.1, // 90% would recommend
            isPublic: Math.random() > 0.3 // 70% public
          }
        })
      } catch (error) {
        console.log(`Feedback for booking ${booking.id} already exists, skipping...`)
      }
    }

    // Create sample engagement data
    for (const booking of bookings.slice(0, 7)) {
      try {
        await prisma.studentEngagement.create({
          data: {
            userId: booking.userId,
            instructorId: instructors[0].id,
            classId: booking.classId || classes[0].id,
            bookingId: booking.id,
            engagementLevel: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.3 ? 'NEUTRAL' : 'LOW',
            participationScore: Math.floor(Math.random() * 40) + 60, // 60-100
            attentionScore: Math.floor(Math.random() * 40) + 60,
            improvementProgress: Math.floor(Math.random() * 50) + 40, // 40-90
            questionsAsked: Math.floor(Math.random() * 5),
            helpRequested: Math.floor(Math.random() * 3),
            practiceTime: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
            strugglingAreas: Math.random() > 0.5 ? JSON.stringify(['rhythm', 'footwork']) : null,
            strengths: JSON.stringify(['coordination', 'timing']),
            notes: Math.random() > 0.5 ? 'Shows great potential and enthusiasm' : null
          }
        })
      } catch (error) {
        console.log(`Engagement for booking ${booking.id} already exists, skipping...`)
      }
    }

    // Create sample instructor performance record
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    try {
      await prisma.instructorPerformance.create({
        data: {
          instructorId: instructors[0].id,
          period: 'monthly',
          periodStart: monthStart,
          periodEnd: monthEnd,
          totalClasses: classes.length,
          totalStudents: Math.floor(Math.random() * 20) + 15,
          totalHours: Math.floor(Math.random() * 40) + 30,
          averageRating: 4.2 + Math.random() * 0.6, // 4.2-4.8
          attendanceRate: 85 + Math.random() * 10, // 85-95%
          completionRate: 90 + Math.random() * 8, // 90-98%
          retentionRate: 75 + Math.random() * 15, // 75-90%
          newStudents: Math.floor(Math.random() * 10) + 5,
          returningStudents: Math.floor(Math.random() * 15) + 10,
          totalRevenue: Math.floor(Math.random() * 2000) + 1500,
          averageClassSize: Math.floor(Math.random() * 8) + 12, // 12-20
          noShows: Math.floor(Math.random() * 3) + 1,
          cancellations: Math.floor(Math.random() * 2),
          feedbackCount: 6,
          recommendationRate: 88 + Math.random() * 10 // 88-98%
        }
      })
      console.log('✅ Created instructor performance record')
    } catch (error) {
      console.log('Performance record already exists, skipping...')
    }

    // Create sample class analytics
    for (let i = 0; i < 3; i++) {
      const classData = classes[i % classes.length]
      const analysisDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      
      try {
        await prisma.classAnalytics.create({
          data: {
            classId: classData.id,
            instructorId: instructors[0].id,
            date: analysisDate,
            totalBookings: Math.floor(Math.random() * 5) + 8,
            actualAttendees: Math.floor(Math.random() * 3) + 6,
            noShows: Math.floor(Math.random() * 2),
            lateArrivals: Math.floor(Math.random() * 3),
            earlyDepartures: Math.floor(Math.random() * 2),
            averageDuration: Math.floor(Math.random() * 15) + 50, // 50-65 minutes
            energyLevel: Math.floor(Math.random() * 3) + 7, // 7-10
            difficultyLevel: Math.floor(Math.random() * 3) + 6, // 6-9
            paceRating: 3 + Math.random() * 1.5, // 3-4.5
            studentSatisfaction: 4 + Math.random() * 0.8, // 4-4.8
            revenue: Math.floor(Math.random() * 300) + 200,
            notes: Math.random() > 0.5 ? 'Great energy in class today!' : null
          }
        })
      } catch (error) {
        console.log(`Analytics for class ${classData.id} on ${analysisDate.toDateString()} already exists, skipping...`)
      }
    }

    console.log('🎉 Performance tracking data seeded successfully!')
    console.log('\nSummary:')
    console.log('- Created attendance records for recent bookings')
    console.log('- Added student feedback and ratings') 
    console.log('- Generated student engagement metrics')
    console.log('- Created instructor performance summary')
    console.log('- Added class analytics data')

  } catch (error) {
    console.error('❌ Error seeding performance data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPerformanceData()