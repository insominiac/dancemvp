const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fetchAllData() {
  try {
    console.log('\n🔍 FETCHING ALL DATA FROM RAILWAY POSTGRESQL DATABASE\n')
    console.log('=' .repeat(100))
    
    // Fetch all users with full details
    console.log('\n📋 USER TABLE - Complete Data:\n')
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Full Name: ${user.fullName}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Created: ${user.createdAt}`)
      console.log(`  Updated: ${user.updatedAt}`)
      console.log(`  Password Hash: ${user.password.substring(0, 20)}...`)
      console.log('-'.repeat(50))
    })
    
    // Fetch all classes with instructor details
    console.log('\n📚 CLASS TABLE - Complete Data:\n')
    const classes = await prisma.class.findMany({
      include: { 
        instructor: true,
        bookings: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    classes.forEach((cls, index) => {
      console.log(`Class ${index + 1}:`)
      console.log(`  ID: ${cls.id}`)
      console.log(`  Title: ${cls.title}`)
      console.log(`  Description: ${cls.description}`)
      console.log(`  Level: ${cls.level}`)
      console.log(`  Price: $${cls.price}`)
      console.log(`  Max Capacity: ${cls.maxCapacity}`)
      console.log(`  Instructor: ${cls.instructor.fullName} (${cls.instructor.email})`)
      console.log(`  Total Bookings: ${cls.bookings.length}`)
      console.log(`  Created: ${cls.createdAt}`)
      console.log('-'.repeat(50))
    })
    
    // Fetch all bookings with user and class details
    console.log('\n🎫 BOOKING TABLE - Complete Data:\n')
    const bookings = await prisma.booking.findMany({
      include: { 
        user: true,
        class: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`)
      console.log(`  ID: ${booking.id}`)
      console.log(`  Student: ${booking.user.fullName} (${booking.user.email})`)
      console.log(`  Class: ${booking.class.title}`)
      console.log(`  Status: ${booking.status}`)
      console.log(`  Amount: $${booking.amount}`)
      console.log(`  Created: ${booking.createdAt}`)
      console.log('-'.repeat(50))
    })
    
    // Database Statistics
    console.log('\n📊 DATABASE STATISTICS:\n')
    console.log('=' .repeat(100))
    
    // Get table counts
    const userCount = await prisma.user.count()
    const classCount = await prisma.class.count()
    const bookingCount = await prisma.booking.count()
    
    // Get counts by role
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const instructorCount = await prisma.user.count({ where: { role: 'INSTRUCTOR' } })
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
    
    // Get booking statistics
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } })
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } })
    const cancelledBookings = await prisma.booking.count({ where: { status: 'CANCELLED' } })
    
    // Calculate revenue
    const confirmedRevenue = await prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true }
    })
    
    console.log('Table Counts:')
    console.log(`  • Total Users: ${userCount}`)
    console.log(`  • Total Classes: ${classCount}`)
    console.log(`  • Total Bookings: ${bookingCount}`)
    console.log('')
    console.log('User Breakdown:')
    console.log(`  • Admins: ${adminCount}`)
    console.log(`  • Instructors: ${instructorCount}`)
    console.log(`  • Students: ${studentCount}`)
    console.log('')
    console.log('Booking Status:')
    console.log(`  • Confirmed: ${confirmedBookings}`)
    console.log(`  • Pending: ${pendingBookings}`)
    console.log(`  • Cancelled: ${cancelledBookings}`)
    console.log('')
    console.log('Financial:')
    console.log(`  • Total Confirmed Revenue: $${confirmedRevenue._sum.amount || 0}`)
    
    console.log('\n' + '=' .repeat(100))
    console.log('✅ Data fetch complete from Railway PostgreSQL database')
    console.log('=' .repeat(100))
    
  } catch (error) {
    console.error('❌ Error fetching data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fetchAllData()
