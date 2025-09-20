const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting partner matching data seeding...');

    // Check if we have some users first
    const existingUsers = await prisma.user.findMany({
      take: 5,
      include: {
        partnerProfile: true
      }
    });

    if (existingUsers.length < 2) {
      console.log('Creating sample users for partner matching...');
      
      // Create sample users
      const users = await Promise.all([
        prisma.user.create({
          data: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            phone: '+1-555-0101',
            dateOfBirth: new Date('1990-05-15'),
            role: 'STUDENT',
            profilePicture: '/api/placeholder/150/150'
          }
        }),
        prisma.user.create({
          data: {
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob.smith@example.com',
            phone: '+1-555-0102',
            dateOfBirth: new Date('1988-03-22'),
            role: 'STUDENT',
            profilePicture: '/api/placeholder/150/150'
          }
        }),
        prisma.user.create({
          data: {
            firstName: 'Carol',
            lastName: 'Davis',
            email: 'carol.davis@example.com',
            phone: '+1-555-0103',
            dateOfBirth: new Date('1992-11-08'),
            role: 'STUDENT',
            profilePicture: '/api/placeholder/150/150'
          }
        }),
        prisma.user.create({
          data: {
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david.wilson@example.com',
            phone: '+1-555-0104',
            dateOfBirth: new Date('1985-07-12'),
            role: 'STUDENT',
            profilePicture: '/api/placeholder/150/150'
          }
        }),
        prisma.user.create({
          data: {
            firstName: 'Emma',
            lastName: 'Brown',
            email: 'emma.brown@example.com',
            phone: '+1-555-0105',
            dateOfBirth: new Date('1994-09-30'),
            role: 'STUDENT',
            profilePicture: '/api/placeholder/150/150'
          }
        })
      ]);

      console.log(`Created ${users.length} sample users`);
    }

    // Get all users for profile creation
    const allUsers = await prisma.user.findMany({
      take: 10,
      include: {
        partnerProfile: true
      }
    });

    // Get available dance styles
    const danceStyles = await prisma.danceStyle.findMany({
      where: { isActive: true },
      take: 6
    });

    if (danceStyles.length === 0) {
      console.log('Creating sample dance styles...');
      const createdStyles = await Promise.all([
        prisma.danceStyle.create({
          data: {
            name: 'Salsa',
            category: 'Latin',
            isActive: true
          }
        }),
        prisma.danceStyle.create({
          data: {
            name: 'Bachata',
            category: 'Latin',
            isActive: true
          }
        }),
        prisma.danceStyle.create({
          data: {
            name: 'Tango',
            category: 'Ballroom',
            isActive: true
          }
        }),
        prisma.danceStyle.create({
          data: {
            name: 'Swing',
            category: 'Swing',
            isActive: true
          }
        }),
        prisma.danceStyle.create({
          data: {
            name: 'Hip Hop',
            category: 'Street',
            isActive: true
          }
        }),
        prisma.danceStyle.create({
          data: {
            name: 'Contemporary',
            category: 'Contemporary',
            isActive: true
          }
        })
      ]);
      
      danceStyles.push(...createdStyles);
      console.log(`Created ${createdStyles.length} dance styles`);
    }

    console.log(`Found ${danceStyles.length} dance styles and ${allUsers.length} users`);

    // Create profiles for users who don't have them
    const usersWithoutProfiles = allUsers.filter(user => !user.partnerProfile);
    
    const profiles = [
      {
        bio: "I'm passionate about Latin dancing and looking for a dedicated partner to practice and compete with. I love the energy and connection that comes with partner dancing!",
        location: "New York, NY",
        experienceLevel: 'INTERMEDIATE',
        lookingFor: ['PRACTICE_PARTNER'],
        ageRange: "25-40",
        isActiveForMatching: true,
        danceStyles: [
          { danceStyleName: 'Salsa', level: 'INTERMEDIATE' },
          { danceStyleName: 'Bachata', level: 'INTERMEDIATE' }
        ]
      },
      {
        bio: "Ballroom dancer with 3 years of experience. I'm looking for someone to join me in competitions and performances. Let's create some magic on the dance floor!",
        location: "Los Angeles, CA",
        experienceLevel: 'ADVANCED',
        lookingFor: ['COMPETITION_PARTNER'],
        ageRange: "20-35",
        isActiveForMatching: true,
        danceStyles: [
          { danceStyleName: 'Tango', level: 'ADVANCED' },
          { danceStyleName: 'Swing', level: 'INTERMEDIATE' }
        ]
      },
      {
        bio: "New to partner dancing but very enthusiastic! I'm looking for someone patient who can help me learn and grow. Social dancing is my main interest right now.",
        location: "Chicago, IL",
        experienceLevel: 'BEGINNER',
        lookingFor: ['LEARNING_BUDDY'],
        ageRange: "22-45",
        isActiveForMatching: true,
        danceStyles: [
          { danceStyleName: 'Salsa', level: 'BEGINNER' },
          { danceStyleName: 'Swing', level: 'BEGINNER' }
        ]
      },
      {
        bio: "Street dance enthusiast with a focus on Hip Hop and contemporary styles. Looking for a creative partner to explore fusion and performance opportunities.",
        location: "Miami, FL",
        experienceLevel: 'ADVANCED',
        lookingFor: ['COMPETITION_PARTNER'],
        ageRange: "18-30",
        isActiveForMatching: true,
        danceStyles: [
          { danceStyleName: 'Hip Hop', level: 'ADVANCED' },
          { danceStyleName: 'Contemporary', level: 'INTERMEDIATE' }
        ]
      },
      {
        bio: "I enjoy social dancing and meeting new people through dance. Looking for friendly partners to attend social events and workshops with. Fun is the priority!",
        location: "San Francisco, CA",
        experienceLevel: 'INTERMEDIATE',
        lookingFor: ['SOCIAL_PARTNER'],
        ageRange: "28-50",
        isActiveForMatching: true,
        danceStyles: [
          { danceStyleName: 'Salsa', level: 'INTERMEDIATE' },
          { danceStyleName: 'Bachata', level: 'BEGINNER' },
          { danceStyleName: 'Swing', level: 'INTERMEDIATE' }
        ]
      }
    ];

    for (let i = 0; i < Math.min(usersWithoutProfiles.length, profiles.length); i++) {
      const user = usersWithoutProfiles[i];
      const profileData = profiles[i];

      // Create the user profile
      const profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          bio: profileData.bio,
          location: profileData.location,
          experienceLevel: profileData.experienceLevel,
          lookingFor: profileData.lookingFor,
          ageRange: profileData.ageRange,
          isActiveForMatching: profileData.isActiveForMatching
        }
      });

      // Add dance styles to the profile
      for (const styleData of profileData.danceStyles) {
        const danceStyle = danceStyles.find(ds => ds.name === styleData.danceStyleName);
        if (danceStyle) {
          await prisma.userProfileDanceStyle.create({
            data: {
              profileId: profile.id,
              styleId: danceStyle.id,
              level: styleData.level
            }
          });
        }
      }

      console.log(`Created profile for ${user.firstName} ${user.lastName}`);
    }

    // Create some sample match requests
    console.log('Creating sample match requests...');
    
    const profileUsers = await prisma.user.findMany({
      include: {
        partnerProfile: {
          include: {
            danceStyles: true
          }
        }
      },
      where: {
        partnerProfile: {
          isNot: null
        }
      }
    });

    if (profileUsers.length >= 2) {
      // Create a few match requests between users
      const matchRequests = [
        {
          senderId: profileUsers[0].partnerProfile.id,
          receiverId: profileUsers[1].partnerProfile.id,
          message: "Hi! I noticed we both love Salsa. Would you like to practice together?",
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          senderId: profileUsers[1].partnerProfile.id,
          receiverId: profileUsers[2].partnerProfile.id,
          message: "I'm looking for someone to help me improve my dancing. Would you be interested?",
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ];

      if (profileUsers.length >= 4) {
        matchRequests.push({
          senderId: profileUsers[2].partnerProfile.id,
          receiverId: profileUsers[3].partnerProfile.id,
          message: "Would you like to be dance partners for the upcoming competition?",
          status: 'ACCEPTED',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          respondedAt: new Date()
        });
      }

      for (const requestData of matchRequests) {
        // Check if request already exists
        const existingRequest = await prisma.matchRequest.findFirst({
          where: {
            OR: [
              { 
                senderId: requestData.senderId,
                receiverId: requestData.receiverId
              },
              { 
                senderId: requestData.receiverId,
                receiverId: requestData.senderId
              }
            ]
          }
        });

        if (!existingRequest) {
          const matchRequest = await prisma.matchRequest.create({
            data: requestData
          });

          // If accepted, create a match
          if (requestData.status === 'ACCEPTED') {
            const senderUser = profileUsers.find(u => u.partnerProfile && u.partnerProfile.id === requestData.senderId);
            const receiverUser = profileUsers.find(u => u.partnerProfile && u.partnerProfile.id === requestData.receiverId);
            
            if (senderUser && receiverUser) {
              await prisma.match.create({
                data: {
                  user1Id: senderUser.id,
                  user2Id: receiverUser.id,
                  matchScore: 0.85,
                  isActive: true
                }
              });
            }
          }

          const senderUser = profileUsers.find(u => u.partnerProfile && u.partnerProfile.id === requestData.senderId);
          const receiverUser = profileUsers.find(u => u.partnerProfile && u.partnerProfile.id === requestData.receiverId);
          console.log(`Created match request from ${senderUser?.firstName} to ${receiverUser?.firstName}`);
        }
      }
    }

    console.log('✅ Partner matching data seeding completed successfully!');
    
    // Print summary
    const totalProfiles = await prisma.userProfile.count();
    const totalRequests = await prisma.matchRequest.count();
    const totalMatches = await prisma.match.count();
    
    console.log('\n📊 Summary:');
    console.log(`   User Profiles: ${totalProfiles}`);
    console.log(`   Match Requests: ${totalRequests}`);
    console.log(`   Active Matches: ${totalMatches}`);
    console.log(`   Dance Styles: ${danceStyles.length}`);

  } catch (error) {
    console.error('❌ Error seeding partner matching data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
