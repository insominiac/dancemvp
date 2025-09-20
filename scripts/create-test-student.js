const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestStudent() {
  try {
    console.log('🧪 Creating test student account...')
    
    const testEmail = 'student@test.com'
    const testPassword = 'student123'
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (existingUser) {
      console.log(`👤 User ${testEmail} already exists`)
      
      // Update to make sure they're verified
      const updatedUser = await prisma.user.update({
        where: { email: testEmail },
        data: { isVerified: true }
      })
      
      console.log(`✅ Updated user verification status to: ${updatedUser.isVerified}`)
      console.log(`📧 Email: ${testEmail}`)
      console.log(`🔑 Password: ${testPassword}`)
      return
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    // Create new test student
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        fullName: 'Test Student',
        phone: '+1234567890',
        role: 'USER', // Default role for students
        isVerified: true, // Make sure they can login
        bio: 'Test student account for development'
      }
    })
    
    console.log('✅ Test student created successfully!')
    console.log('📝 Login credentials:')
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🔑 Password: ${testPassword}`)
    console.log(`👤 Name: ${newUser.fullName}`)
    console.log(`🎭 Role: ${newUser.role}`)
    console.log(`✅ Verified: ${newUser.isVerified}`)
    console.log(`🆔 ID: ${newUser.id}`)
    
  } catch (error) {
    console.error('❌ Error creating test student:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestStudent()