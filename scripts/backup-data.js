const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupData() {
  try {
    console.log('📦 Starting database backup...')
    
    const backupDir = path.join(__dirname, '../backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    
    // Backup Users
    const users = await prisma.user.findMany()
    fs.writeFileSync(
      path.join(backupDir, `users-${timestamp}.json`),
      JSON.stringify(users, null, 2)
    )
    console.log(`✅ Backed up ${users.length} users`)
    
    // Backup Classes
    const classes = await prisma.class.findMany()
    fs.writeFileSync(
      path.join(backupDir, `classes-${timestamp}.json`),
      JSON.stringify(classes, null, 2)
    )
    console.log(`✅ Backed up ${classes.length} classes`)
    
    // Backup Bookings
    const bookings = await prisma.booking.findMany()
    fs.writeFileSync(
      path.join(backupDir, `bookings-${timestamp}.json`),
      JSON.stringify(bookings, null, 2)
    )
    console.log(`✅ Backed up ${bookings.length} bookings`)
    
    console.log(`\n💾 Backup complete! Files saved in: ${backupDir}`)
    console.log(`Timestamp: ${timestamp}`)
    
  } catch (error) {
    console.error('❌ Error backing up data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backupData()
