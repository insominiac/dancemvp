const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n📊 Found ${users.length} users:`)
    console.log('=' .repeat(80))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.fullName}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log('')
    })

    // Check for students specifically
    const students = users.filter(user => user.role === 'USER' || user.role === 'STUDENT')
    console.log(`📚 Students found: ${students.length}`)
    
    if (students.length === 0) {
      console.log('⚠️  No student users found in database!')
    } else {
      const unverifiedStudents = students.filter(student => !student.isVerified)
      if (unverifiedStudents.length > 0) {
        console.log(`🔒 Unverified students: ${unverifiedStudents.length}`)
        unverifiedStudents.forEach(student => {
          console.log(`   - ${student.email} (${student.fullName})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()