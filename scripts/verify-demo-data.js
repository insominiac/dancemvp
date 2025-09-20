const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDemoData() {
  console.log('🔍 Verifying demo data...\n');

  try {
    // Check demo accounts
    const demoAccounts = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@dev.local', 'instructor@demo.com', 'user@demo.com']
        }
      },
      include: {
        instructor: true
      }
    });

    console.log('👥 Demo Accounts:');
    demoAccounts.forEach(user => {
      console.log(`  ✅ ${user.role}: ${user.email} (${user.fullName})`);
      if (user.instructor) {
        console.log(`     📋 Instructor specialty: ${user.instructor.specialty}`);
      }
    });

    // Check venue
    const venues = await prisma.venue.findMany();
    console.log(`\n🏢 Venues: ${venues.length}`);
    venues.forEach(venue => {
      console.log(`  ✅ ${venue.name} - ${venue.city}, ${venue.state}`);
    });

    // Check dance styles
    const styles = await prisma.danceStyle.findMany();
    console.log(`\n🎨 Dance Styles: ${styles.length}`);
    styles.forEach(style => {
      console.log(`  ✅ ${style.name} - ${style.description}`);
    });

    // Check classes
    const classes = await prisma.class.findMany({
      include: {
        venue: true,
        classInstructors: {
          include: {
            instructor: {
              include: {
                user: true
              }
            }
          }
        },
        classStyles: {
          include: {
            style: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    console.log(`\n📚 Classes: ${classes.length}`);
    classes.forEach(cls => {
      const instructor = cls.classInstructors[0]?.instructor.user.fullName || 'No instructor';
      const style = cls.classStyles[0]?.style.name || 'No style';
      const bookingsCount = cls._count.bookings;
      
      console.log(`  ✅ ${cls.title}`);
      console.log(`     👨‍🏫 Instructor: ${instructor}`);
      console.log(`     🎨 Style: ${style}`);
      console.log(`     📍 Venue: ${cls.venue?.name || 'No venue'}`);
      console.log(`     💰 Price: $${cls.price}`);
      console.log(`     🎫 Bookings: ${bookingsCount}`);
      console.log(`     📅 Schedule: ${cls.scheduleDays} at ${cls.scheduleTime}`);
      console.log('');
    });

    // Check bookings
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        class: true
      }
    });

    console.log(`📋 Bookings: ${bookings.length}`);
    bookings.forEach(booking => {
      const className = booking.class?.title || 'No class';
      console.log(`  ✅ ${booking.user.fullName} -> ${className}`);
      console.log(`     Status: ${booking.status}, Amount: $${booking.amountPaid}`);
    });

    console.log('\n🎉 Demo data verification complete!');

  } catch (error) {
    console.error('❌ Error verifying demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDemoData();