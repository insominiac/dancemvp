#!/usr/bin/env node

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

console.log('🎓 Testing Instructor Dashboard...\n');

async function testInstructorDashboard() {
  try {
    // Step 1: Login as instructor
    console.log('1. Logging in as demo instructor...');
    const loginResponse = await fetch(`${SERVER_URL}/api/auth/instructor-demo-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const loginData = await loginResponse.json();
    console.log(`Login Status: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      console.log('❌ Demo instructor login failed:', loginData);
      return;
    }
    
    console.log('✅ Instructor login successful!');
    console.log('Instructor ID:', loginData.instructor.id);
    console.log('User ID:', loginData.user.id);
    console.log('\n');

    // Step 2: Test instructor profile endpoint
    console.log('2. Testing instructor profile endpoint...');
    const profileResponse = await fetch(`${SERVER_URL}/api/instructor/profile/${loginData.user.id}`, {
      credentials: 'include'
    });
    
    console.log(`Profile Status: ${profileResponse.status}`);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile endpoint working!');
      console.log('Profile:', JSON.stringify(profileData, null, 2));
    } else {
      const errorData = await profileResponse.json();
      console.log('❌ Profile endpoint failed:', errorData);
    }
    console.log('\n');

    // Step 3: Test dashboard data endpoint
    console.log('3. Testing dashboard data endpoint...');
    const dashboardResponse = await fetch(`${SERVER_URL}/api/instructor/dashboard/${loginData.instructor.id}`, {
      credentials: 'include'
    });
    
    console.log(`Dashboard Status: ${dashboardResponse.status}`);
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard endpoint working!');
      console.log('Stats:', dashboardData.data?.stats);
      console.log('Today\'s classes:', dashboardData.data?.todaysClasses?.length || 0);
    } else {
      const errorData = await dashboardResponse.json();
      console.log('❌ Dashboard endpoint failed:', errorData);
    }
    console.log('\n');

    // Step 4: Test resource stats endpoint
    console.log('4. Testing resource stats endpoint...');
    const resourceResponse = await fetch(`${SERVER_URL}/api/instructor/resources/stats?instructorId=${loginData.instructor.id}`, {
      credentials: 'include'
    });
    
    console.log(`Resource Stats Status: ${resourceResponse.status}`);
    if (resourceResponse.ok) {
      const resourceData = await resourceResponse.json();
      console.log('✅ Resource stats endpoint working!');
      console.log('Resources:', resourceData.overview);
    } else {
      const errorData = await resourceResponse.json();
      console.log('❌ Resource stats endpoint failed:', errorData);
    }
    console.log('\n');

    // Step 5: Test instructor dashboard page access
    console.log('5. Testing instructor dashboard page...');
    const pageResponse = await fetch(`${SERVER_URL}/instructor/dashboard`, {
      credentials: 'include',
      redirect: 'manual'
    });
    
    console.log(`Dashboard Page Status: ${pageResponse.status}`);
    if (pageResponse.status === 200) {
      console.log('✅ Instructor dashboard page accessible');
    } else if (pageResponse.status === 302) {
      console.log('🔄 Redirected (check authentication)');
    } else {
      console.log('❌ Dashboard page not accessible');
    }

    console.log('\n🎉 All tests completed! The instructor dashboard should now work.');
    console.log(`Try visiting: ${SERVER_URL}/instructor/dashboard`);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Make sure the development server is running on', SERVER_URL);
  }
}

// Run the test
if (require.main === module) {
  testInstructorDashboard();
}

module.exports = { testInstructorDashboard };