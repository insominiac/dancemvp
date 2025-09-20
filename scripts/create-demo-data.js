const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoData() {
  console.log('🎭 Creating demo data...');

  try {
    // Get demo users
    const demoInstructor = await prisma.user.findUnique({
      where: { email: 'instructor@demo.com' },
      include: { instructor: true }
    });

    const demoUser = await prisma.user.findUnique({
      where: { email: 'user@demo.com' }
    });

    if (!demoInstructor || !demoUser) {
      console.log('❌ Demo accounts not found. Please run create-demo-accounts.js first.');
      return;
    }

    // Create or get a venue
    let demoVenue = await prisma.venue.findFirst({
      where: { name: 'Demo Dance Studio' }
    });

    if (!demoVenue) {
      demoVenue = await prisma.venue.create({
        data: {
          name: 'Demo Dance Studio',
          addressLine1: '123 Dance Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
          phone: '+1-555-DANCE',
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
      console.log('✅ Created demo venue');
    }

    // Create or get dance styles
    const danceStyles = [
      { name: 'Ballet', description: 'Classical ballet technique' },
      { name: 'Contemporary', description: 'Modern contemporary dance' },
      { name: 'Jazz', description: 'Energetic jazz dance' },
      { name: 'Hip Hop', description: 'Street style hip hop' }
    ];

    const createdStyles = [];
    for (const style of danceStyles) {
      let existingStyle = await prisma.danceStyle.findFirst({
        where: { name: style.name }
      });

      if (!existingStyle) {
        existingStyle = await prisma.danceStyle.create({
          data: {
            name: style.name,
            description: style.description,
            isActive: true,
            isFeatured: true,
            sortOrder: createdStyles.length
          }
        });
        console.log(`✅ Created dance style: ${style.name}`);
      }
      createdStyles.push(existingStyle);
    }

    // Create sample classes for the demo instructor
    const sampleClasses = [
      {
        title: 'Beginner Ballet',
        description: 'Perfect for those new to ballet. Learn basic positions, movements, and grace.',
        level: 'Beginner',
        durationMins: 60,
        maxCapacity: 15,
        price: 25.00,
        scheduleDays: 'Monday,Wednesday,Friday',
        scheduleTime: '18:00',
        requirements: 'Comfortable workout clothes, ballet shoes recommended',
        isActive: true,
        status: 'PUBLISHED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      },
      {
        title: 'Contemporary Flow',
        description: 'Explore contemporary dance through fluid movements and emotional expression.',
        level: 'Intermediate',
        durationMins: 75,
        maxCapacity: 12,
        price: 30.00,
        scheduleDays: 'Tuesday,Thursday',
        scheduleTime: '19:00',
        requirements: 'Prior dance experience recommended',
        isActive: true,
        status: 'PUBLISHED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Weekend Jazz Intensive',
        description: 'High-energy jazz class focusing on technique and performance.',
        level: 'Intermediate',
        durationMins: 90,
        maxCapacity: 20,
        price: 35.00,
        scheduleDays: 'Saturday',
        scheduleTime: '10:00',
        requirements: 'Previous jazz experience required',
        isActive: true,
        status: 'PUBLISHED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    ];

    for (let i = 0; i < sampleClasses.length; i++) {
      const classData = sampleClasses[i];
      
      // Check if class already exists
      const existingClass = await prisma.class.findFirst({
        where: { 
          title: classData.title,
          classInstructors: {
            some: {
              instructorId: demoInstructor.instructor.id
            }
          }
        }
      });

      if (existingClass) {
        console.log(`✅ Class "${classData.title}" already exists, skipping...`);
        continue;
      }

      // Create the class
      const newClass = await prisma.class.create({
        data: {
          ...classData,
          venueId: demoVenue.id,
          classInstructors: {
            create: {
              instructorId: demoInstructor.instructor.id,
              isPrimary: true
            }
          },
          classStyles: {
            create: {
              styleId: createdStyles[i % createdStyles.length].id
            }
          }
        }
      });

      console.log(`✅ Created class: ${newClass.title}`);

      // Create a sample booking for the demo user
      if (i === 0) { // Only book the first class
        const existingBooking = await prisma.booking.findFirst({
          where: {
            userId: demoUser.id,
            classId: newClass.id
          }
        });

        if (!existingBooking) {
          await prisma.booking.create({
            data: {
              userId: demoUser.id,
              classId: newClass.id,
              status: 'CONFIRMED',
              amountPaid: newClass.price,
              totalAmount: newClass.price,
              paymentStatus: 'completed',
              confirmationCode: 'DEMO001'
            }
          });
          console.log(`✅ Created demo booking for user`);
        }
      }
    }

    console.log('\n🎉 Demo data setup complete!');
    console.log('\n📋 Created sample data:');
    console.log('🏢 Demo venue with address');
    console.log('🎨 4 dance styles (Ballet, Contemporary, Jazz, Hip Hop)');
    console.log('📚 3 sample classes for demo instructor');
    console.log('🎫 1 sample booking for demo user');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDemoData();