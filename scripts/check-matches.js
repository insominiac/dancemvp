const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking current match requests and matches state...\n');
    
    const matchRequests = await prisma.matchRequest.findMany({
      select: {
        id: true,
        status: true,
        message: true,
        sender: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        receiver: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📨 Match Requests (${matchRequests.length} total):`);
    matchRequests.forEach((req, idx) => {
      console.log(`${idx + 1}. ${req.sender.user.fullName} → ${req.receiver.user.fullName}`);
      console.log(`   Status: ${req.status} | ID: ${req.id}`);
      if (req.message) {
        console.log(`   Message: "${req.message}"`);
      }
      console.log('');
    });
    
    const matches = await prisma.match.findMany();
    console.log(`🤝 Active Matches (${matches.length} total):`);
    
    if (matches.length === 0) {
      console.log('   No matches found yet.\n');
    } else {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        
        // Get user names for the match
        const user1 = await prisma.user.findUnique({
          where: { id: match.user1Id },
          select: { fullName: true }
        });
        
        const user2 = await prisma.user.findUnique({
          where: { id: match.user2Id },
          select: { fullName: true }
        });
        
        console.log(`${i + 1}. ${user1?.fullName || 'Unknown'} ↔ ${user2?.fullName || 'Unknown'}`);
        console.log(`   Score: ${match.matchScore} | Active: ${match.isActive}`);
        console.log(`   Created: ${match.createdAt.toLocaleDateString()}`);
        console.log('');
      }
    }
    
    // Find pending requests we can test with
    const pendingRequests = matchRequests.filter(r => r.status === 'PENDING');
    console.log(`🧪 Test Candidates (${pendingRequests.length} pending requests):`);
    
    if (pendingRequests.length > 0) {
      const testRequest = pendingRequests[0];
      console.log(`   Test Request ID: ${testRequest.id}`);
      console.log(`   From: ${testRequest.sender.user.fullName} (${testRequest.sender.user.id})`);
      console.log(`   To: ${testRequest.receiver.user.fullName} (${testRequest.receiver.user.id})`);
      console.log('\n✅ Ready to test accept/reject functionality!');
    } else {
      console.log('   No pending requests available for testing.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
