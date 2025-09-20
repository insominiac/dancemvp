const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoAccounts() {
  console.log('🎭 Creating demo accounts...');

  try {
    // Demo accounts configuration
    const demoAccounts = [
      {
        email: 'admin@dev.local',
        password: 'admin123',
        fullName: 'Development Admin',
        role: 'ADMIN',
        isVerified: true
      },
      {
        email: 'instructor@demo.com',
        password: 'instructor123',
        fullName: 'Demo Instructor',
        role: 'INSTRUCTOR',
        isVerified: true,
        instructor: {
          specialty: 'Contemporary & Ballet',
          experienceYears: 5,
          rating: 4.8,
          isActive: true
        }
      },
      {
        email: 'user@demo.com',
        password: 'user123',
        fullName: 'Demo User',
        role: 'USER',
        isVerified: true
      }
    ];

    for (const accountData of demoAccounts) {
      const { email, password, instructor, ...userData } = accountData;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log(`✅ ${email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user data
      const createData = {
        ...userData,
        email,
        passwordHash
      };

      // Add instructor relation if needed
      if (instructor) {
        createData.instructor = {
          create: instructor
        };
      }

      // Create user
      const user = await prisma.user.create({
        data: createData,
        include: {
          instructor: true
        }
      });

      console.log(`✅ Created ${user.role.toLowerCase()}: ${user.email}`);
    }

    console.log('\n🎉 Demo accounts setup complete!');
    console.log('\n📋 Available demo accounts:');
    console.log('👑 Admin: admin@dev.local / admin123');
    console.log('🎓 Instructor: instructor@demo.com / instructor123');
    console.log('💃 Student: user@demo.com / user123');

  } catch (error) {
    console.error('❌ Error creating demo accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDemoAccounts();