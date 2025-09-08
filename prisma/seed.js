const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dance.com',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN'
    }
  })
  console.log('✅ Created admin user:', admin.email)
  
  // Create instructors
  const instructorPassword = await bcrypt.hash('instructor123', 10)
  const instructor1 = await prisma.user.create({
    data: {
      email: 'sarah@dance.com',
      password: instructorPassword,
      fullName: 'Sarah Johnson',
      role: 'INSTRUCTOR'
    }
  })
  
  const instructor2 = await prisma.user.create({
    data: {
      email: 'maria@dance.com',
      password: instructorPassword,
      fullName: 'Maria Rodriguez',
      role: 'INSTRUCTOR'
    }
  })
  console.log('✅ Created instructors')
  
  // Create students
  const studentPassword = await bcrypt.hash('student123', 10)
  const student1 = await prisma.user.create({
    data: {
      email: 'john@email.com',
      password: studentPassword,
      fullName: 'John Smith',
      role: 'STUDENT'
    }
  })
  
  const student2 = await prisma.user.create({
    data: {
      email: 'emma@email.com',
      password: studentPassword,
      fullName: 'Emma Wilson',
      role: 'STUDENT'
    }
  })
  console.log('✅ Created students')
  
  // Create classes
  const class1 = await prisma.class.create({
    data: {
      title: 'Hip Hop Basics',
      description: 'Learn the fundamentals of hip hop dance in this beginner-friendly class',
      level: 'Beginner',
      price: 25,
      maxCapacity: 30,
      instructorId: instructor1.id
    }
  })
  
  const class2 = await prisma.class.create({
    data: {
      title: 'Ballet Advanced',
      description: 'Advanced ballet techniques for experienced dancers',
      level: 'Advanced',
      price: 35,
      maxCapacity: 20,
      instructorId: instructor2.id
    }
  })
  
  const class3 = await prisma.class.create({
    data: {
      title: 'Contemporary Flow',
      description: 'Express yourself through fluid contemporary movement',
      level: 'Intermediate',
      price: 30,
      maxCapacity: 25,
      instructorId: instructor1.id
    }
  })
  
  const class4 = await prisma.class.create({
    data: {
      title: 'Salsa Night',
      description: 'Social salsa dancing for all levels',
      level: 'All Levels',
      price: 20,
      maxCapacity: 40,
      instructorId: instructor2.id
    }
  })
  console.log('✅ Created 4 classes')
  
  // Create some bookings
  await prisma.booking.create({
    data: {
      userId: student1.id,
      classId: class1.id,
      status: 'CONFIRMED',
      amount: 25
    }
  })
  
  await prisma.booking.create({
    data: {
      userId: student2.id,
      classId: class1.id,
      status: 'CONFIRMED',
      amount: 25
    }
  })
  
  await prisma.booking.create({
    data: {
      userId: student1.id,
      classId: class2.id,
      status: 'PENDING',
      amount: 35
    }
  })
  console.log('✅ Created sample bookings')
  
  console.log('🎉 Database seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@dance.com / admin123')
  console.log('Instructor: sarah@dance.com / instructor123')
  console.log('Student: john@email.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
