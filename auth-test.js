#!/usr/bin/env node

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

console.log('🔍 Testing Authentication System...\n');

async function testAuth() {
  try {
    // Step 1: Check debug endpoint
    console.log('1. Checking current authentication status...');
    const debugResponse = await fetch(`${SERVER_URL}/api/auth/debug`, {
      credentials: 'include'
    });
    const debugData = await debugResponse.json();
    console.log('Debug info:', JSON.stringify(debugData, null, 2));
    console.log('\n');

    // Step 2: Try accessing /api/auth/me
    console.log('2. Testing /api/auth/me endpoint...');
    const meResponse = await fetch(`${SERVER_URL}/api/auth/me`, {
      credentials: 'include'
    });
    console.log(`Status: ${meResponse.status} ${meResponse.statusText}`);
    
    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Authentication working! User info:', meData.user);
      return;
    } else {
      const errorData = await meResponse.json();
      console.log('❌ Authentication failed:', errorData);
    }
    console.log('\n');

    // Step 3: Try demo login
    console.log('3. Attempting demo admin login...');
    const loginResponse = await fetch(`${SERVER_URL}/api/auth/demo-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ role: 'ADMIN' })
    });

    const loginData = await loginResponse.json();
    console.log(`Login Status: ${loginResponse.status}`);
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginResponse.ok) {
      console.log('❌ Demo login failed');
      return;
    }
    console.log('\n');

    // Step 4: Test /api/auth/me again after login
    console.log('4. Testing /api/auth/me after login...');
    const meResponse2 = await fetch(`${SERVER_URL}/api/auth/me`, {
      credentials: 'include'
    });
    console.log(`Status: ${meResponse2.status} ${meResponse2.statusText}`);
    
    if (meResponse2.ok) {
      const meData2 = await meResponse2.json();
      console.log('✅ Authentication now working! User info:', meData2.user);
    } else {
      const errorData2 = await meResponse2.json();
      console.log('❌ Still failing:', errorData2);
    }

    // Step 5: Test admin panel access
    console.log('\n5. Testing admin panel access...');
    const adminResponse = await fetch(`${SERVER_URL}/admin`, {
      credentials: 'include',
      redirect: 'manual'
    });
    console.log(`Admin panel status: ${adminResponse.status}`);
    
    if (adminResponse.status === 200) {
      console.log('✅ Admin panel accessible');
    } else if (adminResponse.status === 302) {
      console.log('🔄 Redirected (likely to login page)');
    } else {
      console.log('❌ Admin panel not accessible');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Make sure the development server is running on', SERVER_URL);
  }
}

// Helper function for manual testing
async function quickLogin(role = 'ADMIN') {
  try {
    console.log(`🚀 Quick ${role} login...`);
    const response = await fetch(`${SERVER_URL}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user);
      console.log('Now try: curl -b cookies.txt http://localhost:3000/api/auth/me');
    } else {
      console.log('❌ Login failed:', data);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'login') {
    quickLogin(args[1] || 'ADMIN');
  } else {
    testAuth();
  }
}

module.exports = { testAuth, quickLogin };