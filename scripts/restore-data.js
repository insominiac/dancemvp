const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function restoreData() {
  try {
    console.log('📥 Starting data restoration...')
    
    const backupDir = path.join(__dirname, '../backups')
    const timestamp = '2025-09-20T20-05-57.467Z' // Using our fresh backup
    
    // Restore Users first (no dependencies)
    const usersPath = path.join(backupDir, `users-${timestamp}.json`)
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      console.log(`📋 Restoring ${users.length} users...`)
      
      for (const user of users) {
        await prisma.user.create({
          data: user
        })
      }
      console.log(`✅ Restored ${users.length} users`)
    }
    
    // Create default venue for classes that don't have one
    const defaultVenue = await prisma.venue.create({
      data: {
        name: 'Default Studio',
        addressLine1: '123 Dance Street',
        city: 'Dance City',
        state: 'CA',
        country: 'USA',
        postalCode: '90210'
      }
    })
    console.log('✅ Created default venue')
    
    // Restore Classes (remove venueId to avoid foreign key issues for now)
    const classesPath = path.join(backupDir, `classes-${timestamp}.json`)
    if (fs.existsSync(classesPath)) {
      const classes = JSON.parse(fs.readFileSync(classesPath, 'utf8'))
      console.log(`📋 Restoring ${classes.length} classes...`)
      
      for (const classData of classes) {
        // Remove venueId to avoid foreign key constraint issues
        const { venueId, ...classDataWithoutVenue } = classData
        await prisma.class.create({
          data: {
            ...classDataWithoutVenue,
            venueId: defaultVenue.id // Use default venue
          }
        })
      }
      console.log(`✅ Restored ${classes.length} classes`)
    }
    
    // Restore Bookings
    const bookingsPath = path.join(backupDir, `bookings-${timestamp}.json`)
    if (fs.existsSync(bookingsPath)) {
      const bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'))
      console.log(`📋 Restoring ${bookings.length} bookings...`)
      
      for (const booking of bookings) {
        await prisma.booking.create({
          data: booking
        })
      }
      console.log(`✅ Restored ${bookings.length} bookings`)
    }
    
    console.log(`\n🎉 Data restoration complete!`)
    
  } catch (error) {
    console.error('❌ Error restoring data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreData()