const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showDemoInstructorSummary() {
  console.log('🎭 Demo Instructor Account Summary\n');

  try {
    // Get demo instructor with details
    const demoInstructor = await prisma.user.findUnique({
      where: { email: 'instructor@demo.com' },
      include: {
        instructor: {
          include: {
            classInstructors: {
              include: {
                class: {
                  include: {
                    venue: true,
                    classStyles: {
                      include: {
                        style: true
                      }
                    },
                    bookings: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!demoInstructor) {
      console.log('❌ Demo instructor not found');
      return;
    }

    // Account Details
    console.log('👤 Account Information:');
    console.log(`   Email: ${demoInstructor.email}`);
    console.log(`   Password: instructor123`);
    console.log(`   Full Name: ${demoInstructor.fullName}`);
    console.log(`   Role: ${demoInstructor.role}`);
    console.log(`   Specialty: ${demoInstructor.instructor.specialty}`);
    console.log(`   Experience: ${demoInstructor.instructor.experienceYears} years`);
    console.log(`   Rating: ${demoInstructor.instructor.rating}/5.0`);

    // Classes
    const classes = demoInstructor.instructor.classInstructors.map(ci => ci.class);
    console.log(`\n📚 Classes (${classes.length}):`);
    
    classes.forEach((cls, index) => {
      const style = cls.classStyles[0]?.style.name || 'No style';
      const venue = cls.venue?.name || 'No venue';
      const bookings = cls.bookings.length;
      const students = cls.bookings.map(b => b.user.fullName).join(', ') || 'No students yet';
      
      console.log(`\n   ${index + 1}. ${cls.title}`);
      console.log(`      🎨 Style: ${style}`);
      console.log(`      📍 Venue: ${venue}`);
      console.log(`      💰 Price: $${cls.price}`);
      console.log(`      ⏱️  Duration: ${cls.durationMins} minutes`);
      console.log(`      👥 Capacity: ${cls.maxCapacity} students`);
      console.log(`      📅 Schedule: ${cls.scheduleDays} at ${cls.scheduleTime}`);
      console.log(`      🎫 Bookings: ${bookings}`);
      console.log(`      👨‍🎓 Students: ${students}`);
      console.log(`      📋 Description: ${cls.description}`);
      if (cls.requirements) {
        console.log(`      ⚠️  Requirements: ${cls.requirements}`);
      }
    });

    // Statistics
    const totalBookings = classes.reduce((sum, cls) => sum + cls.bookings.length, 0);
    const totalRevenue = classes.reduce((sum, cls) => {
      const classRevenue = cls.bookings.reduce((rev, booking) => rev + Number(booking.amountPaid), 0);
      return sum + classRevenue;
    }, 0);

    console.log(`\n📊 Statistics:`);
    console.log(`   Total Classes: ${classes.length}`);
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);

    console.log('\n🚀 Ready for Demo!');
    console.log('\n📝 Login Instructions:');
    console.log('   1. Go to the login page');
    console.log('   2. Email: instructor@demo.com');
    console.log('   3. Password: instructor123');
    console.log('   4. Select "Instructor" role');
    console.log('\n✨ You should now see your instructor dashboard with classes and students!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showDemoInstructorSummary();