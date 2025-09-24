#!/usr/bin/env node

/**
 * Test Data Setup Script
 * Creates test users, classes, and venues for payment testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TEST_DATA = {
  venue: {
    id: 'test-venue-123',
    name: 'Test Dance Studio',
    address: '123 Dance Street, Test City, TC 12345',
    description: 'A beautiful test dance studio for testing payments',
    facilities: ['Mirrors', 'Sound System', 'Parking'],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    active: true
  },
  user: {
    id: 'test-user-456',
    email: 'test-user@example.com',
    fullName: 'Test User',
    emailVerified: new Date(),
    role: 'USER'
  },
  instructor: {
    id: 'test-instructor-789',
    email: 'instructor@example.com',
    fullName: 'Test Instructor',
    emailVerified: new Date(),
    role: 'INSTRUCTOR'
  },
  class: {
    id: 'test-class-123',
    title: 'Beginner Salsa',
    description: 'Learn the basics of salsa dancing in this fun and engaging class',
    level: 'BEGINNER',
    durationMins: 60,
    maxCapacity: 20,
    price: 25.00,
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '19:00',
    requirements: 'Comfortable clothing and shoes',
    imageUrl: 'https://example.com/salsa-class.jpg',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    venueId: 'test-venue-123',
    status: 'ACTIVE'
  }
};

class TestDataSetup {
  constructor() {
    this.log('🚀 Starting test data setup...', 'info');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      reset: '\x1b[0m'     // Reset
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async cleanupExistingTestData() {
    this.log('🧹 Cleaning up existing test data...', 'warn');
    
    try {
      // Delete in reverse order of dependencies
      await prisma.classInstructor.deleteMany({
        where: { classId: TEST_DATA.class.id }
      });
      
      await prisma.booking.deleteMany({
        where: { 
          OR: [
            { userId: TEST_DATA.user.id },
            { classId: TEST_DATA.class.id }
          ]
        }
      });
      
      await prisma.transaction.deleteMany({
        where: { userId: TEST_DATA.user.id }
      });
      
      await prisma.class.deleteMany({
        where: { id: TEST_DATA.class.id }
      });
      
      await prisma.instructor.deleteMany({
        where: { userId: { in: [TEST_DATA.instructor.id] } }
      });
      
      await prisma.user.deleteMany({
        where: { 
          id: { in: [TEST_DATA.user.id, TEST_DATA.instructor.id] }
        }
      });
      
      await prisma.venue.deleteMany({
        where: { id: TEST_DATA.venue.id }
      });

      this.log('✅ Existing test data cleaned up', 'success');
    } catch (error) {
      this.log(`⚠️  Cleanup error (expected if no existing data): ${error.message}`, 'warn');
    }
  }

  async createTestVenue() {
    this.log('🏢 Creating test venue...', 'info');
    
    try {
      const venue = await prisma.venue.create({
        data: TEST_DATA.venue
      });
      
      this.log(`✅ Created venue: ${venue.name}`, 'success');
      return venue;
    } catch (error) {
      this.log(`❌ Failed to create venue: ${error.message}`, 'error');
      throw error;
    }
  }

  async createTestUsers() {
    this.log('👥 Creating test users...', 'info');
    
    try {
      // Create regular user
      const user = await prisma.user.create({
        data: TEST_DATA.user
      });
      this.log(`✅ Created user: ${user.fullName} (${user.email})`, 'success');
      
      // Create instructor user
      const instructorUser = await prisma.user.create({
        data: TEST_DATA.instructor
      });
      this.log(`✅ Created instructor user: ${instructorUser.fullName} (${instructorUser.email})`, 'success');
      
      // Create instructor profile
      const instructor = await prisma.instructor.create({
        data: {
          userId: instructorUser.id,
          bio: 'Experienced salsa instructor with 10+ years of teaching',
          specialties: ['Salsa', 'Bachata', 'Merengue'],
          certifications: ['Certified Dance Instructor'],
          hourlyRate: 50.00,
          isActive: true
        }
      });
      this.log(`✅ Created instructor profile for: ${instructorUser.fullName}`, 'success');
      
      return { user, instructorUser, instructor };
    } catch (error) {
      this.log(`❌ Failed to create users: ${error.message}`, 'error');
      throw error;
    }
  }

  async createTestClass(venueId, instructorId) {
    this.log('💃 Creating test class...', 'info');
    
    try {
      const classData = await prisma.class.create({
        data: {
          ...TEST_DATA.class,
          venueId
        }
      });
      
      // Link instructor to class
      await prisma.classInstructor.create({
        data: {
          classId: classData.id,
          instructorId,
          role: 'PRIMARY'
        }
      });
      
      this.log(`✅ Created class: ${classData.title}`, 'success');
      return classData;
    } catch (error) {
      this.log(`❌ Failed to create class: ${error.message}`, 'error');
      throw error;
    }
  }

  async validateTestData() {
    this.log('🔍 Validating created test data...', 'info');
    
    try {
      const venue = await prisma.venue.findUnique({ where: { id: TEST_DATA.venue.id } });
      const user = await prisma.user.findUnique({ where: { id: TEST_DATA.user.id } });
      const instructorUser = await prisma.user.findUnique({ where: { id: TEST_DATA.instructor.id } });
      const testClass = await prisma.class.findUnique({ 
        where: { id: TEST_DATA.class.id },
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
          }
        }
      });
      
      if (venue && user && instructorUser && testClass) {
        this.log('✅ All test data validated successfully', 'success');
        this.log('📋 Test Data Summary:', 'info');
        this.log(`   Venue: ${venue.name}`, 'info');
        this.log(`   User: ${user.fullName} (${user.email})`, 'info');
        this.log(`   Instructor: ${instructorUser.fullName} (${instructorUser.email})`, 'info');
        this.log(`   Class: ${testClass.title} - $${testClass.price}`, 'info');
        return true;
      } else {
        throw new Error('Some test data was not created properly');
      }
    } catch (error) {
      this.log(`❌ Test data validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async setupTestData() {
    try {
      await this.cleanupExistingTestData();
      
      const venue = await this.createTestVenue();
      const { user, instructorUser, instructor } = await this.createTestUsers();
      const testClass = await this.createTestClass(venue.id, instructor.id);
      
      const isValid = await this.validateTestData();
      
      if (isValid) {
        this.log('🎉 Test data setup completed successfully!', 'success');
        this.log('💡 You can now run payment tests with:', 'info');
        this.log('   node test-payments.js', 'info');
      } else {
        throw new Error('Test data setup validation failed');
      }
      
    } catch (error) {
      this.log(`💥 Test data setup failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new TestDataSetup();
  
  // Handle CLI arguments
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Test Data Setup

Usage: node setup-test-data.js [options]

Options:
  --help, -h     Show this help message
  --cleanup-only Clean up existing test data and exit

Examples:
  node setup-test-data.js              # Set up fresh test data
  node setup-test-data.js --cleanup-only  # Clean up existing test data only
    `);
    process.exit(0);
  }

  if (args.includes('--cleanup-only')) {
    const setup = new TestDataSetup();
    setup.cleanupExistingTestData().then(() => {
      console.log('Cleanup completed');
      process.exit(0);
    }).catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
  } else {
    setup.setupTestData();
  }
}

module.exports = { TestDataSetup, TEST_DATA };
