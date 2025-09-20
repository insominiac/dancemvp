const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Creating test users for development...');

    // Hash password for all test accounts
    const hashedPassword = await bcrypt.hash('password123', 12);

    const testUsers = [
      {
        fullName: 'Student Test',
        email: 'student@test.com',
        phone: '+1-555-0001',
        role: 'USER',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Instructor Test',
        email: 'instructor@test.com',
        phone: '+1-555-0002',
        role: 'INSTRUCTOR',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Admin Test',
        email: 'admin@test.com',
        phone: '+1-555-0003',
        role: 'ADMIN',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Sarah Johnson',
        email: 'sarah.student@test.com',
        phone: '+1-555-0011',
        role: 'USER',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Mike Davis',
        email: 'mike.instructor@test.com',
        phone: '+1-555-0012',
        role: 'INSTRUCTOR',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Emily Wilson',
        email: 'emily.student@test.com',
        phone: '+1-555-0013',
        role: 'USER',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Carlos Rodriguez',
        email: 'carlos.instructor@test.com',
        phone: '+1-555-0014',
        role: 'INSTRUCTOR',
        profileImage: '/api/placeholder/150/150'
      },
      {
        fullName: 'Jessica Martinez',
        email: 'jessica.student@test.com',
        phone: '+1-555-0015',
        role: 'USER',
        profileImage: '/api/placeholder/150/150'
      }
    ];

    console.log('🔐 Creating users with hashed passwords...');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create user
        const user = await prisma.user.create({
          data: {
            ...userData,
            passwordHash: hashedPassword
          }
        });

        console.log(`✅ Created ${userData.role}: ${userData.email}`);

        // Create instructor profile if user is instructor
        if (userData.role === 'INSTRUCTOR') {
          await prisma.instructor.create({
            data: {
              userId: user.id,
              specialty: 'Latin and Ballroom Dance',
              experienceYears: Math.floor(Math.random() * 15) + 5,
              rating: (Math.random() * 2 + 3).toFixed(2), // Rating between 3.00-5.00
              isActive: true
            }
          });
          console.log(`   📃 Created instructor profile for ${userData.fullName}`);
        }

      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────┬────────────────────────┬─────────────┐');
    console.log('│ Role                │ Email                  │ Password    │');
    console.log('├─────────────────────┼────────────────────────┼─────────────┤');
    console.log('│ Student             │ student@test.com       │ password123 │');
    console.log('│ Instructor          │ instructor@test.com    │ password123 │');
    console.log('│ Admin               │ admin@test.com         │ password123 │');
    console.log('│ Student (Sarah)     │ sarah.student@test.com │ password123 │');
    console.log('│ Instructor (Mike)   │ mike.instructor@test.com│ password123 │');
    console.log('│ Student (Emily)     │ emily.student@test.com │ password123 │');
    console.log('│ Instructor (Carlos) │ carlos.instructor@test.com│ password123 │');
    console.log('│ Student (Jessica)   │ jessica.student@test.com│ password123 │');
    console.log('└─────────────────────┴────────────────────────┴─────────────┘');

    console.log('\n🔗 Test URLs:');
    console.log('• Student Dashboard: http://localhost:3000/dashboard');
    console.log('• Instructor Dashboard: http://localhost:3000/instructor/dashboard');
    console.log('• Admin Panel: http://localhost:3000/admin');
    console.log('• Login Page: http://localhost:3000/login');

    console.log('\n🎯 Partner Matching Test:');
    console.log('1. Login as student@test.com or instructor@test.com');
    console.log('2. Go to /dashboard/partner-matching');
    console.log('3. Create partner profile and test matching');
    console.log('4. Login as admin@test.com to monitor in admin panel');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });