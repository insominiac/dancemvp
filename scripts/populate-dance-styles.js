const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateDanceStyles() {
  try {
    console.log('🎨 Populating dance styles with rich content...')
    
    const styleData = [
      {
        name: 'Salsa',
        icon: '🔥',
        subtitle: 'Feel the Cuban rhythm and energy',
        description: 'Experience the vibrant energy of Cuba! Salsa is a lively, passionate dance that combines African rhythms with Latin American flair. Born in the streets of Havana and perfected in New York, Salsa is more than a dance - it\'s a celebration of life, culture, and connection.',
        difficulty: 'Beginner-Friendly',
        origin: 'Cuba',
        musicStyle: 'Latin',
        characteristics: JSON.stringify(['Fast-paced', 'Partner dance', 'Energetic', 'Social', 'Improvisational']),
        benefits: JSON.stringify(['Improve coordination', 'Build confidence', 'Meet people', 'Great cardio', 'Stress relief']),
        price: '$35/class',
        instructors: 'Carlos & Maria',
        category: 'Latin',
        isFeatured: true,
        sortOrder: 1
      },
      {
        name: 'Bachata',
        icon: '💕',
        subtitle: 'Experience sensual connection',
        description: 'Discover the romance of the Dominican Republic! Bachata is an intimate, sensual dance characterized by close connection and emotional expression. With its smooth hip movements and passionate embrace, Bachata tells stories of love, heartbreak, and human connection.',
        difficulty: 'Easy to Learn',
        origin: 'Dominican Republic',
        musicStyle: 'Romantic',
        characteristics: JSON.stringify(['Sensual', 'Close connection', 'Romantic', 'Smooth', 'Emotional']),
        benefits: JSON.stringify(['Deepen connections', 'Express emotions', 'Improve body awareness', 'Build trust', 'Enhance musicality']),
        price: '$40/class',
        instructors: 'Antonio & Isabella',
        category: 'Latin',
        isFeatured: true,
        sortOrder: 2
      },
      {
        name: 'Kizomba',
        icon: '🌙',
        subtitle: 'Embrace the African soul',
        description: 'Feel the soul of Angola! Kizomba is a smooth, flowing dance known for its close embrace and deep connection between partners. This African dance emphasizes the conversation between bodies, creating an almost meditative experience through movement.',
        difficulty: 'Intermediate',
        origin: 'Angola',
        musicStyle: 'African',
        characteristics: JSON.stringify(['Smooth', 'Close embrace', 'Flowing', 'Soulful', 'Grounded']),
        benefits: JSON.stringify(['Develop smooth movement', 'Build intimate connection', 'Explore African culture', 'Improve balance', 'Find inner peace']),
        price: '$45/class',
        instructors: 'João & Amara',
        category: 'African',
        isFeatured: true,
        sortOrder: 3
      },
      {
        name: 'Zouk',
        icon: '🌊',
        subtitle: 'Flow with Brazilian waves',
        description: 'Experience the flowing movements of Brazil! Brazilian Zouk is characterized by wave-like body movements and creative patterns. This dance emphasizes fluidity, connection, and the beauty of continuous motion.',
        difficulty: 'Advanced',
        origin: 'Brazil',
        musicStyle: 'Brazilian',
        characteristics: JSON.stringify(['Flowing', 'Creative', 'Wave-like', 'Artistic', 'Contemporary']),
        benefits: JSON.stringify(['Improve flexibility', 'Develop flow', 'Creative expression', 'Core strength', 'Mind-body connection']),
        price: '$50/class',
        instructors: 'Rafael & Luna',
        category: 'Brazilian',
        sortOrder: 4
      },
      {
        name: 'Merengue',
        icon: '🎉',
        subtitle: 'Simple steps, maximum fun',
        description: 'Dance to the beat of the Dominican Republic! Merengue is the easiest Latin dance to learn with its simple marching steps and infectious energy. Perfect for beginners and guaranteed to get you moving!',
        difficulty: 'Very Easy',
        origin: 'Dominican Republic',
        musicStyle: 'Caribbean',
        characteristics: JSON.stringify(['Simple', 'Fun', 'Marching steps', 'Beginner-friendly', 'Upbeat']),
        benefits: JSON.stringify(['Easy to learn', 'Great for all ages', 'Social and fun', 'Low-impact exercise', 'Instant confidence']),
        price: '$25/class',
        instructors: 'Miguel & Sofia',
        category: 'Latin',
        sortOrder: 5
      },
      {
        name: 'Tango',
        icon: '🌹',
        subtitle: 'Passion and elegance combined',
        description: 'Experience the passion of Buenos Aires! Argentine Tango is an improvisational dance of connection and expression. This dramatic dance tells stories through movement, emphasizing the intimate connection between partners.',
        difficulty: 'Advanced',
        origin: 'Argentina',
        musicStyle: 'Traditional',
        characteristics: JSON.stringify(['Passionate', 'Elegant', 'Improvisational', 'Dramatic', 'Intimate']),
        benefits: JSON.stringify(['Improve posture', 'Develop elegance', 'Deep connection', 'Mental focus', 'Cultural enrichment']),
        price: '$55/class',
        instructors: 'Diego & Valentina',
        category: 'Latin',
        sortOrder: 6
      }
    ]

    console.log('Updating dance styles with rich content...')
    
    for (const data of styleData) {
      try {
        const updated = await prisma.danceStyle.upsert({
          where: { name: data.name },
          update: data,
          create: data
        })
        console.log(`✅ Updated: ${updated.name}`)
      } catch (error) {
        console.log(`⚠️  Could not update ${data.name}:`, error.message)
      }
    }
    
    const totalStyles = await prisma.danceStyle.count()
    console.log(`\n🎉 Population complete! Total dance styles: ${totalStyles}`)
    console.log('\n🔥 Featured styles are now ready for the public site!')
    console.log('📝 Admins can now edit all content through the admin panel.')
    
  } catch (error) {
    console.error('❌ Error populating dance styles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateDanceStyles()