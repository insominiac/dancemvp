const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDanceStyles() {
  try {
    console.log('🌱 Seeding dance styles...')
    
    const danceStyles = [
      {
        name: 'Salsa',
        category: 'Latin',
        isActive: true
      },
      {
        name: 'Bachata',
        category: 'Latin',
        isActive: true
      },
      {
        name: 'Kizomba',
        category: 'African',
        isActive: true
      },
      {
        name: 'Zouk',
        category: 'Brazilian',
        isActive: true
      },
      {
        name: 'Merengue',
        category: 'Latin',
        isActive: true
      },
      {
        name: 'Tango',
        category: 'Latin',
        isActive: true
      },
      {
        name: 'Cha Cha',
        category: 'Latin',
        isActive: true
      },
      {
        name: 'Rumba',
        category: 'Latin',
        isActive: true
      }
    ]

    console.log('Creating dance styles...')
    
    for (const style of danceStyles) {
      const existingStyle = await prisma.danceStyle.findUnique({
        where: { name: style.name }
      })
      
      if (!existingStyle) {
        const createdStyle = await prisma.danceStyle.create({
          data: style
        })
        console.log(`✅ Created: ${createdStyle.name} (${createdStyle.category})`)
      } else {
        console.log(`⚠️  Already exists: ${style.name}`)
      }
    }
    
    // Get final count
    const totalStyles = await prisma.danceStyle.count()
    console.log(`\n🎉 Seeding complete! Total dance styles: ${totalStyles}`)
    
  } catch (error) {
    console.error('❌ Error seeding dance styles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDanceStyles()