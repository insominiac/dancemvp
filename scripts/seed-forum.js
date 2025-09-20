const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedForum() {
  try {
    console.log('🌱 Seeding forum data...')

    // Check if we have any users
    let testUser = await prisma.user.findFirst()
    
    if (!testUser) {
      // Create a test user if none exists
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewWueTzwAhf6nB26', // password: test123
          fullName: 'Test User',
          role: 'USER',
          isVerified: true,
        },
      })
      console.log('✅ Created test user')
    }

    // Create sample forum posts
    const samplePosts = [
      {
        title: 'Welcome to the Dance Community Forum!',
        content: 'This is the first post in our community forum. Feel free to introduce yourself, ask questions about dance techniques, or share your experiences. Let\'s build a supportive community together!',
        category: 'general',
        isPinned: true,
      },
      {
        title: 'Tips for Beginner Salsa Dancers',
        content: 'Here are some essential tips for those just starting their salsa journey:\n\n1. Focus on basic steps first\n2. Listen to the music and find the rhythm\n3. Practice with a partner when possible\n4. Don\'t be afraid to make mistakes\n5. Have fun and enjoy the process!\n\nWhat other tips would you add for beginners?',
        category: 'beginners',
      },
      {
        title: 'Upcoming Social Dance Event - Saturday Night',
        content: 'Join us this Saturday night for our weekly social dance! We\'ll have:\n\n- Live DJ playing salsa, bachata, and merengue\n- Beginner lesson at 7 PM\n- Open dancing until midnight\n- Complimentary refreshments\n\nLocation: Downtown Dance Studio\nTime: 7 PM - 12 AM\nCover: $15\n\nWho\'s planning to attend?',
        category: 'events',
      },
      {
        title: 'Best Music for Practice Sessions',
        content: 'I\'m looking for recommendations for good practice music. What are your favorite songs for:\n\n- Salsa practice\n- Bachata practice\n- Timing exercises\n- Footwork drills\n\nPlease share your playlists!',
        category: 'music',
      },
      {
        title: 'Partner Needed for Competition',
        content: 'Hi everyone! I\'m an intermediate level dancer looking for a partner for the upcoming regional competition in March. I have experience in:\n\n- Salsa (3 years)\n- Bachata (2 years)\n- Basic mambo\n\nLooking for someone with similar experience level who can commit to practice 2-3 times per week. Please message me if interested!',
        category: 'partners',
      },
    ]

    for (const postData of samplePosts) {
      const existingPost = await prisma.forumPost.findFirst({
        where: { title: postData.title },
      })

      if (!existingPost) {
        await prisma.forumPost.create({
          data: {
            ...postData,
            userId: testUser.id,
            viewsCount: Math.floor(Math.random() * 100) + 5,
          },
        })
        console.log(`✅ Created post: ${postData.title}`)
      }
    }

    // Add some sample replies
    const posts = await prisma.forumPost.findMany()
    if (posts.length > 0) {
      const welcomePost = posts.find(p => p.title.includes('Welcome'))
      if (welcomePost) {
        const existingReply = await prisma.forumReply.findFirst({
          where: { postId: welcomePost.id },
        })

        if (!existingReply) {
          await prisma.forumReply.create({
            data: {
              content: 'Thank you for creating this forum! I\'m excited to be part of this dance community. Looking forward to learning from everyone here.',
              postId: welcomePost.id,
              userId: testUser.id,
            },
          })

          // Update reply count
          await prisma.forumPost.update({
            where: { id: welcomePost.id },
            data: { repliesCount: 1 },
          })
          console.log('✅ Added sample reply')
        }
      }
    }

    console.log('🎉 Forum seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding forum data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedForum()