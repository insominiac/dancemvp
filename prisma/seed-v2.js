const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed for ERD-v2...')
  
  // ============ CREATE USERS ============
  console.log('\n📋 Creating users with RBAC...')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dance.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      phone: '+1-555-0100',
      role: 'ADMIN',
      bio: 'Platform administrator with full system access',
      isVerified: true,
      websiteUrl: 'https://dance-platform.com',
      instagramHandle: '@danceplatform'
    }
  })
  
  const instructorPassword = await bcrypt.hash('instructor123', 10)
  const instructorUser1 = await prisma.user.create({
    data: {
      email: 'sarah@dance.com',
      passwordHash: instructorPassword,
      fullName: 'Sarah Johnson',
      phone: '+1-555-0101',
      role: 'INSTRUCTOR',
      bio: 'Professional dance instructor specializing in Hip Hop and Contemporary styles',
      isVerified: true,
      websiteUrl: 'https://sarahdances.com',
      instagramHandle: '@sarahdances'
    }
  })
  
  const instructorUser2 = await prisma.user.create({
    data: {
      email: 'maria@dance.com',
      passwordHash: instructorPassword,
      fullName: 'Maria Rodriguez',
      phone: '+1-555-0102',
      role: 'INSTRUCTOR',
      bio: 'Ballet and Latin dance expert with 15 years of experience',
      isVerified: true,
      instagramHandle: '@mariamoves'
    }
  })
  
  const studentPassword = await bcrypt.hash('student123', 10)
  const student1 = await prisma.user.create({
    data: {
      email: 'john@email.com',
      passwordHash: studentPassword,
      fullName: 'John Smith',
      phone: '+1-555-0201',
      role: 'USER',
      bio: 'Enthusiastic dance student, loves hip hop',
      isVerified: true
    }
  })
  
  const student2 = await prisma.user.create({
    data: {
      email: 'emma@email.com',
      passwordHash: studentPassword,
      fullName: 'Emma Wilson',
      phone: '+1-555-0202',
      role: 'USER',
      bio: 'Beginner dancer interested in all styles',
      isVerified: false
    }
  })
  
  const student3 = await prisma.user.create({
    data: {
      email: 'alex@email.com',
      passwordHash: studentPassword,
      fullName: 'Alex Chen',
      role: 'USER',
      bio: 'Intermediate dancer focusing on contemporary',
      isVerified: true
    }
  })
  
  console.log('✅ Created 6 users (1 admin, 2 instructors, 3 students)')
  
  // ============ CREATE INSTRUCTOR PROFILES ============
  console.log('\n👩‍🏫 Creating instructor profiles...')
  
  const instructor1 = await prisma.instructor.create({
    data: {
      userId: instructorUser1.id,
      specialty: 'Hip Hop, Contemporary',
      experienceYears: 8,
      rating: 4.8,
      isActive: true
    }
  })
  
  const instructor2 = await prisma.instructor.create({
    data: {
      userId: instructorUser2.id,
      specialty: 'Ballet, Salsa, Bachata',
      experienceYears: 15,
      rating: 4.9,
      isActive: true
    }
  })
  
  console.log('✅ Created 2 instructor profiles')
  
  // ============ CREATE VENUES ============
  console.log('\n🏢 Creating venues...')
  
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Downtown Dance Studio',
      addressLine1: '123 Main Street',
      addressLine2: 'Suite 200',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      latitude: 40.7128,
      longitude: -74.0060,
      phone: '+1-555-0300',
      websiteUrl: 'https://downtowndance.com'
    }
  })
  
  const venue2 = await prisma.venue.create({
    data: {
      name: 'Riverside Community Center',
      addressLine1: '456 River Road',
      city: 'Brooklyn',
      state: 'NY',
      country: 'USA',
      postalCode: '11201',
      latitude: 40.6782,
      longitude: -73.9442,
      phone: '+1-555-0301'
    }
  })
  
  const venue3 = await prisma.venue.create({
    data: {
      name: 'The Movement Space',
      addressLine1: '789 Park Avenue',
      city: 'Manhattan',
      state: 'NY',
      country: 'USA',
      postalCode: '10021',
      latitude: 40.7614,
      longitude: -73.9776
    }
  })
  
  console.log('✅ Created 3 venues')
  
  // ============ CREATE DANCE STYLES ============
  console.log('\n💃 Creating dance styles...')
  
  const hipHop = await prisma.danceStyle.create({
    data: { name: 'Hip Hop', category: 'Street', isActive: true }
  })
  
  const ballet = await prisma.danceStyle.create({
    data: { name: 'Ballet', category: 'Classical', isActive: true }
  })
  
  const contemporary = await prisma.danceStyle.create({
    data: { name: 'Contemporary', category: 'Modern', isActive: true }
  })
  
  const salsa = await prisma.danceStyle.create({
    data: { name: 'Salsa', category: 'Latin', isActive: true }
  })
  
  const jazz = await prisma.danceStyle.create({
    data: { name: 'Jazz', category: 'Modern', isActive: true }
  })
  
  const bachata = await prisma.danceStyle.create({
    data: { name: 'Bachata', category: 'Latin', isActive: true }
  })
  
  console.log('✅ Created 6 dance styles')
  
  // ============ CREATE CLASSES ============
  console.log('\n📚 Creating classes...')
  
  const class1 = await prisma.class.create({
    data: {
      title: 'Hip Hop Fundamentals',
      description: 'Learn the basics of hip hop dance including popping, locking, and breaking. Perfect for beginners!',
      level: 'Beginner',
      durationMins: 60,
      maxCapacity: 30,
      price: 25.00,
      scheduleDays: 'Monday, Wednesday, Friday',
      scheduleTime: '6:00 PM',
      requirements: 'Comfortable clothing, sneakers, water bottle',
      imageUrl: '/images/hiphop-class.jpg',
      isActive: true
    }
  })
  
  const class2 = await prisma.class.create({
    data: {
      title: 'Ballet Excellence',
      description: 'Advanced ballet techniques focusing on precision, grace, and performance quality.',
      level: 'Advanced',
      durationMins: 90,
      maxCapacity: 20,
      price: 35.00,
      scheduleDays: 'Tuesday, Thursday',
      scheduleTime: '7:00 PM',
      requirements: 'Ballet shoes, leotard, tights',
      imageUrl: '/images/ballet-class.jpg',
      isActive: true
    }
  })
  
  const class3 = await prisma.class.create({
    data: {
      title: 'Contemporary Flow',
      description: 'Express yourself through fluid movement and emotional storytelling.',
      level: 'Intermediate',
      durationMins: 75,
      maxCapacity: 25,
      price: 30.00,
      scheduleDays: 'Monday, Thursday',
      scheduleTime: '5:30 PM',
      requirements: 'Barefoot or foot undies, comfortable attire',
      isActive: true
    }
  })
  
  const class4 = await prisma.class.create({
    data: {
      title: 'Salsa Social',
      description: 'Fun social dance class for all levels. Learn to salsa with partners!',
      level: 'All Levels',
      durationMins: 60,
      maxCapacity: 40,
      price: 20.00,
      scheduleDays: 'Friday, Saturday',
      scheduleTime: '8:00 PM',
      requirements: 'Dance shoes or heels, partner optional',
      isActive: true
    }
  })
  
  console.log('✅ Created 4 classes')
  
  // ============ ASSIGN INSTRUCTORS TO CLASSES ============
  console.log('\n🔗 Assigning instructors to classes...')
  
  await prisma.classInstructor.createMany({
    data: [
      { classId: class1.id, instructorId: instructor1.id, isPrimary: true },
      { classId: class2.id, instructorId: instructor2.id, isPrimary: true },
      { classId: class3.id, instructorId: instructor1.id, isPrimary: true },
      { classId: class4.id, instructorId: instructor2.id, isPrimary: true }
    ]
  })
  
  console.log('✅ Assigned instructors to classes')
  
  // ============ ASSIGN STYLES TO CLASSES ============
  console.log('\n🎨 Assigning styles to classes...')
  
  await prisma.classStyle.createMany({
    data: [
      { classId: class1.id, styleId: hipHop.id },
      { classId: class2.id, styleId: ballet.id },
      { classId: class3.id, styleId: contemporary.id },
      { classId: class3.id, styleId: jazz.id },
      { classId: class4.id, styleId: salsa.id }
    ]
  })
  
  console.log('✅ Assigned dance styles to classes')
  
  // ============ CREATE EVENTS ============
  console.log('\n🎉 Creating events...')
  
  const event1 = await prisma.event.create({
    data: {
      title: 'Summer Dance Showcase 2024',
      description: 'Annual showcase featuring performances from all our classes. Join us for an evening of amazing dance!',
      eventType: 'Showcase',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-15'),
      startTime: '7:00 PM',
      endTime: '10:00 PM',
      venueId: venue1.id,
      price: 15.00,
      maxAttendees: 200,
      currentAttendees: 45,
      imageUrl: '/images/showcase.jpg',
      organizerUserId: admin.id,
      status: 'PUBLISHED',
      isFeatured: true
    }
  })
  
  const event2 = await prisma.event.create({
    data: {
      title: 'Hip Hop Battle Championship',
      description: 'Compete in our annual hip hop battle with cash prizes!',
      eventType: 'Competition',
      startDate: new Date('2024-08-20'),
      endDate: new Date('2024-08-20'),
      startTime: '2:00 PM',
      endTime: '8:00 PM',
      venueId: venue2.id,
      price: 25.00,
      maxAttendees: 150,
      currentAttendees: 12,
      status: 'PUBLISHED',
      isFeatured: false
    }
  })
  
  const event3 = await prisma.event.create({
    data: {
      title: 'Salsa Night Party',
      description: 'Social dancing night with live music and special performances',
      eventType: 'Social',
      startDate: new Date('2024-06-30'),
      endDate: new Date('2024-06-30'),
      startTime: '9:00 PM',
      endTime: '2:00 AM',
      venueId: venue3.id,
      price: 10.00,
      maxAttendees: 100,
      currentAttendees: 67,
      organizerUserId: instructorUser2.id,
      status: 'PUBLISHED',
      isFeatured: true
    }
  })
  
  console.log('✅ Created 3 events')
  
  // ============ ASSIGN STYLES TO EVENTS ============
  console.log('\n🎭 Assigning styles to events...')
  
  await prisma.eventStyle.createMany({
    data: [
      { eventId: event1.id, styleId: hipHop.id },
      { eventId: event1.id, styleId: ballet.id },
      { eventId: event1.id, styleId: contemporary.id },
      { eventId: event1.id, styleId: salsa.id },
      { eventId: event2.id, styleId: hipHop.id },
      { eventId: event3.id, styleId: salsa.id },
      { eventId: event3.id, styleId: bachata.id }
    ]
  })
  
  console.log('✅ Assigned dance styles to events')
  
  // ============ CREATE USER STYLES ============
  console.log('\n🕺 Assigning styles to users...')
  
  await prisma.userStyle.createMany({
    data: [
      { userId: student1.id, styleId: hipHop.id, proficiency: 'INTERMEDIATE' },
      { userId: student1.id, styleId: contemporary.id, proficiency: 'BEGINNER' },
      { userId: student2.id, styleId: ballet.id, proficiency: 'BEGINNER' },
      { userId: student2.id, styleId: salsa.id, proficiency: 'BEGINNER' },
      { userId: student3.id, styleId: contemporary.id, proficiency: 'INTERMEDIATE' },
      { userId: student3.id, styleId: jazz.id, proficiency: 'ADVANCED' },
      { userId: instructorUser1.id, styleId: hipHop.id, proficiency: 'ADVANCED' },
      { userId: instructorUser1.id, styleId: contemporary.id, proficiency: 'ADVANCED' },
      { userId: instructorUser2.id, styleId: ballet.id, proficiency: 'ADVANCED' },
      { userId: instructorUser2.id, styleId: salsa.id, proficiency: 'ADVANCED' }
    ]
  })
  
  console.log('✅ Assigned dance styles to users')
  
  // ============ CREATE BOOKINGS ============
  console.log('\n🎫 Creating bookings...')
  
  const booking1 = await prisma.booking.create({
    data: {
      userId: student1.id,
      classId: class1.id,
      status: 'CONFIRMED',
      amountPaid: 25.00,
      paymentMethod: 'stripe',
      notes: 'Regular student, paid for full month'
    }
  })
  
  const booking2 = await prisma.booking.create({
    data: {
      userId: student2.id,
      classId: class1.id,
      status: 'CONFIRMED',
      amountPaid: 25.00,
      paymentMethod: 'stripe'
    }
  })
  
  const booking3 = await prisma.booking.create({
    data: {
      userId: student3.id,
      classId: class3.id,
      status: 'PENDING',
      amountPaid: 30.00,
      paymentMethod: 'paypal'
    }
  })
  
  const booking4 = await prisma.booking.create({
    data: {
      userId: student1.id,
      eventId: event1.id,
      status: 'CONFIRMED',
      amountPaid: 15.00,
      paymentMethod: 'stripe',
      notes: 'Early bird ticket'
    }
  })
  
  const booking5 = await prisma.booking.create({
    data: {
      userId: student2.id,
      eventId: event3.id,
      status: 'CONFIRMED',
      amountPaid: 10.00,
      paymentMethod: 'cash'
    }
  })
  
  console.log('✅ Created 5 bookings (3 for classes, 2 for events)')
  
  // ============ CREATE TRANSACTIONS ============
  console.log('\n💰 Creating transactions...')
  
  await prisma.transaction.createMany({
    data: [
      {
        bookingId: booking1.id,
        userId: student1.id,
        provider: 'STRIPE',
        providerPaymentId: 'pi_1234567890',
        type: 'PAYMENT',
        status: 'SUCCEEDED',
        amount: 25.00,
        currency: 'USD'
      },
      {
        bookingId: booking2.id,
        userId: student2.id,
        provider: 'STRIPE',
        providerPaymentId: 'pi_1234567891',
        type: 'PAYMENT',
        status: 'SUCCEEDED',
        amount: 25.00,
        currency: 'USD'
      },
      {
        bookingId: booking4.id,
        userId: student1.id,
        provider: 'STRIPE',
        providerPaymentId: 'pi_1234567892',
        type: 'PAYMENT',
        status: 'SUCCEEDED',
        amount: 15.00,
        currency: 'USD'
      }
    ]
  })
  
  console.log('✅ Created 3 payment transactions')
  
  // ============ CREATE FORUM POSTS ============
  console.log('\n💬 Creating forum posts...')
  
  const post1 = await prisma.forumPost.create({
    data: {
      userId: student1.id,
      category: 'General',
      title: 'Tips for beginners in Hip Hop?',
      content: 'Hey everyone! I just started taking hip hop classes and would love some tips on how to improve faster.',
      viewsCount: 45,
      likesCount: 8,
      repliesCount: 3
    }
  })
  
  const post2 = await prisma.forumPost.create({
    data: {
      userId: instructorUser1.id,
      category: 'Announcements',
      title: 'New Contemporary Workshop Next Month!',
      content: 'Excited to announce a special contemporary workshop focusing on emotional expression through movement.',
      viewsCount: 120,
      likesCount: 25,
      repliesCount: 7,
      isPinned: true
    }
  })
  
  console.log('✅ Created 2 forum posts')
  
  // ============ CREATE FORUM REPLIES ============
  console.log('\n💭 Creating forum replies...')
  
  await prisma.forumReply.createMany({
    data: [
      {
        postId: post1.id,
        userId: instructorUser1.id,
        content: 'Great question! Focus on isolations and practice your groove daily.',
        likesCount: 5
      },
      {
        postId: post1.id,
        userId: student2.id,
        content: 'I found that watching dance videos really helps!',
        likesCount: 2
      },
      {
        postId: post2.id,
        userId: student3.id,
        content: 'This sounds amazing! How do I sign up?',
        likesCount: 1
      }
    ]
  })
  
  console.log('✅ Created 3 forum replies')
  
  // ============ CREATE TESTIMONIALS ============
  console.log('\n⭐ Creating testimonials...')
  
  await prisma.testimonial.createMany({
    data: [
      {
        userId: student1.id,
        rating: 5,
        message: 'Amazing dance studio! The instructors are so patient and encouraging.',
        isFeatured: true
      },
      {
        userId: student2.id,
        rating: 4,
        message: 'Great variety of classes and wonderful community. Highly recommend!',
        isFeatured: true
      },
      {
        userId: student3.id,
        rating: 5,
        message: 'The contemporary classes have transformed my dancing. Sarah is an incredible teacher!',
        isFeatured: false
      }
    ]
  })
  
  console.log('✅ Created 3 testimonials')
  
  // ============ CREATE NOTIFICATIONS ============
  console.log('\n🔔 Creating notifications...')
  
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: 'booking_confirmation',
        title: 'Booking Confirmed',
        message: 'Your booking for Hip Hop Fundamentals has been confirmed!',
        priority: 'high',
        actionUrl: '/bookings/1'
      },
      {
        userId: student2.id,
        type: 'event_reminder',
        title: 'Event Tomorrow',
        message: 'Don\'t forget about Salsa Night Party tomorrow at 9 PM!',
        priority: 'normal',
        actionUrl: '/events/3'
      },
      {
        userId: student3.id,
        type: 'payment_pending',
        title: 'Payment Pending',
        message: 'Your payment for Contemporary Flow is pending. Please complete payment.',
        priority: 'high',
        actionUrl: '/bookings/3',
        isRead: false
      }
    ]
  })
  
  console.log('✅ Created 3 notifications')
  
  // ============ CREATE PARTNER REQUESTS ============
  console.log('\n🤝 Creating partner requests...')
  
  await prisma.partnerRequest.createMany({
    data: [
      {
        requesterId: student1.id,
        skillLevel: 'Intermediate',
        locationCity: 'New York',
        availabilityText: 'Available weekends and weekday evenings',
        message: 'Looking for a practice partner for hip hop and contemporary',
        status: 'active'
      },
      {
        requesterId: student2.id,
        skillLevel: 'Beginner',
        locationCity: 'Brooklyn',
        availabilityText: 'Free on Tuesday and Thursday evenings',
        message: 'Need a patient partner to practice salsa basics',
        status: 'active'
      }
    ]
  })
  
  console.log('✅ Created 2 partner requests')
  
  // ============ CREATE CONTACT MESSAGES ============
  console.log('\n📧 Creating contact messages...')
  
  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1-555-9999',
        subject: 'Class Schedule Question',
        message: 'I would like to know if you offer morning classes for working professionals.',
        isRead: false
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        subject: 'Private Lessons',
        message: 'Do you offer private dance lessons? I\'m interested in learning salsa for my wedding.',
        isRead: true,
        adminResponse: 'Yes, we offer private lessons! Please call us at 555-0300 to schedule.'
      }
    ]
  })
  
  console.log('✅ Created 2 contact messages')
  
  // ============ SUMMARY ============
  console.log('\n' + '='.repeat(80))
  console.log('🎉 DATABASE SEEDING COMPLETE!')
  console.log('='.repeat(80))
  console.log('\n📊 Summary:')
  console.log('  • 6 Users (1 admin, 2 instructors, 3 students)')
  console.log('  • 2 Instructor profiles')
  console.log('  • 3 Venues')
  console.log('  • 6 Dance styles')
  console.log('  • 4 Classes')
  console.log('  • 3 Events')
  console.log('  • 5 Bookings')
  console.log('  • 3 Transactions')
  console.log('  • 2 Forum posts with 3 replies')
  console.log('  • 3 Testimonials')
  console.log('  • 3 Notifications')
  console.log('  • 2 Partner requests')
  console.log('  • 2 Contact messages')
  
  console.log('\n📝 Login Credentials:')
  console.log('  Admin: admin@dance.com / admin123')
  console.log('  Instructor: sarah@dance.com / instructor123')
  console.log('  Instructor: maria@dance.com / instructor123')
  console.log('  Student: john@email.com / student123')
  console.log('  Student: emma@email.com / student123')
  console.log('  Student: alex@email.com / student123')
  console.log('\n' + '='.repeat(80))
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
