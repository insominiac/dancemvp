const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showTables() {
  console.log('=' .repeat(80))
  console.log('DATABASE CONNECTION INFO')
  console.log('=' .repeat(80))
  console.log('Connected to: Railway PostgreSQL')
  console.log('Database: railway')
  console.log('Host: interchange.proxy.rlwy.net:18791')
  console.log('')
  
  try {
    // Show Users table
    console.log('=' .repeat(80))
    console.log('📋 USERS TABLE')
    console.log('=' .repeat(80))
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    console.table(users.map(u => ({
      id: u.id.substring(0, 8) + '...',
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      createdAt: u.createdAt.toISOString().split('T')[0]
    })))
    console.log(`Total users: ${users.length}`)
    console.log('')
    
    // Show Classes table
    console.log('=' .repeat(80))
    console.log('📚 CLASSES TABLE')
    console.log('=' .repeat(80))
    const classes = await prisma.class.findMany({
      include: { instructor: true },
      orderBy: { createdAt: 'desc' }
    })
    console.table(classes.map(c => ({
      id: c.id.substring(0, 8) + '...',
      title: c.title,
      level: c.level,
      price: `$${c.price}`,
      capacity: c.maxCapacity,
      instructor: c.instructor.fullName,
      createdAt: c.createdAt.toISOString().split('T')[0]
    })))
    console.log(`Total classes: ${classes.length}`)
    console.log('')
    
    // Show Bookings table
    console.log('=' .repeat(80))
    console.log('🎫 BOOKINGS TABLE')
    console.log('=' .repeat(80))
    const bookings = await prisma.booking.findMany({
      include: { 
        user: true,
        class: true 
      },
      orderBy: { createdAt: 'desc' }
    })
    console.table(bookings.map(b => ({
      id: b.id.substring(0, 8) + '...',
      student: b.user.fullName,
      class: b.class.title,
      status: b.status,
      amount: `$${b.amount}`,
      createdAt: b.createdAt.toISOString().split('T')[0]
    })))
    console.log(`Total bookings: ${bookings.length}`)
    console.log('')
    
    // Summary statistics
    console.log('=' .repeat(80))
    console.log('📊 DATABASE SUMMARY')
    console.log('=' .repeat(80))
    const adminCount = users.filter(u => u.role === 'ADMIN').length
    const instructorCount = users.filter(u => u.role === 'INSTRUCTOR').length
    const studentCount = users.filter(u => u.role === 'STUDENT').length
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length
    const totalRevenue = bookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.amount, 0)
    
    console.log(`👤 Users by Role:`)
    console.log(`   - Admins: ${adminCount}`)
    console.log(`   - Instructors: ${instructorCount}`)
    console.log(`   - Students: ${studentCount}`)
    console.log(``)
    console.log(`📚 Classes: ${classes.length}`)
    console.log(`🎫 Bookings: ${bookings.length} (${confirmedBookings} confirmed)`)
    console.log(`💰 Total Revenue: $${totalRevenue}`)
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showTables()
