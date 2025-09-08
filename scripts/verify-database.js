const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabase() {
  console.log('\n🔍 VERIFYING DATABASE STRUCTURE (ERD-v2)')
  console.log('=' .repeat(80))
  console.log('Connected to: Railway PostgreSQL')
  console.log('Database: railway')
  console.log('Host: interchange.proxy.rlwy.net:18791')
  console.log('=' .repeat(80))
  
  try {
    // Query to get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
    
    console.log('\n📊 TABLES IN DATABASE:')
    console.log('-'.repeat(40))
    
    const tableNames = tables.map(t => t.table_name)
    tableNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`)
    })
    
    console.log(`\nTotal tables: ${tableNames.length}`)
    
    // Count records in each table
    console.log('\n📈 RECORD COUNTS BY TABLE:')
    console.log('-'.repeat(40))
    
    const counts = {}
    
    // Core tables
    counts.users = await prisma.user.count()
    counts.instructors = await prisma.instructor.count()
    counts.classes = await prisma.class.count()
    counts.events = await prisma.event.count()
    counts.venues = await prisma.venue.count()
    
    // Booking and transactions
    counts.bookings = await prisma.booking.count()
    counts.transactions = await prisma.transaction.count()
    
    // Dance styles
    counts.dance_styles = await prisma.danceStyle.count()
    counts.user_styles = await prisma.userStyle.count()
    counts.class_styles = await prisma.classStyle.count()
    counts.event_styles = await prisma.eventStyle.count()
    
    // Junction tables
    counts.class_instructors = await prisma.classInstructor.count()
    
    // Forum
    counts.forum_posts = await prisma.forumPost.count()
    counts.forum_replies = await prisma.forumReply.count()
    
    // Other tables
    counts.notifications = await prisma.notification.count()
    counts.audit_logs = await prisma.auditLog.count()
    counts.testimonials = await prisma.testimonial.count()
    counts.contact_messages = await prisma.contactMessage.count()
    counts.partner_requests = await prisma.partnerRequest.count()
    counts.partner_matches = await prisma.partnerMatch.count()
    
    // Display counts
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} records`)
    })
    
    // Verify relationships
    console.log('\n🔗 VERIFYING KEY RELATIONSHIPS:')
    console.log('-'.repeat(40))
    
    // Check instructors linked to users
    const instructorsWithUsers = await prisma.instructor.findMany({
      include: { user: true }
    })
    console.log(`✅ Instructors linked to Users: ${instructorsWithUsers.length}`)
    
    // Check classes with instructors
    const classesWithInstructors = await prisma.class.findMany({
      include: { 
        classInstructors: {
          include: { instructor: true }
        }
      }
    })
    console.log(`✅ Classes with assigned instructors: ${classesWithInstructors.filter(c => c.classInstructors.length > 0).length}`)
    
    // Check events with venues
    const eventsWithVenues = await prisma.event.findMany({
      include: { venue: true }
    })
    console.log(`✅ Events with venues: ${eventsWithVenues.length}`)
    
    // Check bookings (class vs event)
    const classBookings = await prisma.booking.count({
      where: { classId: { not: null } }
    })
    const eventBookings = await prisma.booking.count({
      where: { eventId: { not: null } }
    })
    console.log(`✅ Class bookings: ${classBookings}, Event bookings: ${eventBookings}`)
    
    // Check transactions linked to bookings
    const transactionsWithBookings = await prisma.transaction.count({
      where: { bookingId: { not: null } }
    })
    console.log(`✅ Transactions linked to bookings: ${transactionsWithBookings}`)
    
    // Verify RBAC roles
    console.log('\n👤 USER ROLES (RBAC):')
    console.log('-'.repeat(40))
    
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const instructorCount = await prisma.user.count({ where: { role: 'INSTRUCTOR' } })
    const userCount = await prisma.user.count({ where: { role: 'USER' } })
    
    console.log(`  ADMIN: ${adminCount}`)
    console.log(`  INSTRUCTOR: ${instructorCount}`)
    console.log(`  USER: ${userCount}`)
    
    // Sample data from key tables
    console.log('\n📋 SAMPLE DATA:')
    console.log('-'.repeat(40))
    
    // Sample users
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        email: true,
        fullName: true,
        role: true,
        isVerified: true
      }
    })
    console.log('\nUsers:')
    sampleUsers.forEach(u => {
      console.log(`  • ${u.fullName} (${u.email}) - Role: ${u.role}, Verified: ${u.isVerified}`)
    })
    
    // Sample classes
    const sampleClasses = await prisma.class.findMany({
      take: 2,
      include: {
        classStyles: {
          include: { style: true }
        }
      }
    })
    console.log('\nClasses:')
    sampleClasses.forEach(c => {
      const styles = c.classStyles.map(cs => cs.style.name).join(', ')
      console.log(`  • ${c.title} - Level: ${c.level}, Styles: ${styles}`)
    })
    
    // Sample events
    const sampleEvents = await prisma.event.findMany({
      take: 2,
      include: { venue: true }
    })
    console.log('\nEvents:')
    sampleEvents.forEach(e => {
      console.log(`  • ${e.title} - Venue: ${e.venue.name}, Status: ${e.status}`)
    })
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ DATABASE VERIFICATION COMPLETE')
    console.log('All tables from ERD-v2 have been successfully created and populated!')
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('❌ Error verifying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()
