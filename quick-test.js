#!/usr/bin/env node

/**
 * Quick Payment Gateway Test
 * Tests the basic configuration and functionality
 */

console.log('🚀 Quick Payment Gateway Test\n');

// Test 1: Health Check
async function testHealthCheck() {
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Health check passed');
      console.log('   📊 Status:', data.status);
      console.log('   🔵 Stripe:', data.paymentProviders.stripe.configured ? 'Configured' : 'Not configured');
      console.log('   🟡 Wise:', data.paymentProviders.wise.configured ? 'Configured' : 'Not configured');
      return true;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Test Webhook Endpoints Accessibility
async function testWebhookEndpoints() {
  console.log('\n2. Testing Webhook Endpoints...');
  
  const endpoints = [
    { name: 'Stripe Webhook', url: '/api/payments/webhook' },
    { name: 'Wise Webhook', url: '/api/webhooks/wise' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.url}`, {
        method: 'GET',
      });
      
      if (response.status === 200 || response.status === 404 || response.status === 405) {
        console.log(`   ✅ ${endpoint.name}: Endpoint accessible`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 3: Test Environment Variables
function testEnvironmentVariables() {
  console.log('\n3. Testing Environment Variables...');
  
  const requiredVars = {
    'Stripe': [
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ],
    'Wise': [
      'WISE_API_KEY',
      'WISE_ACCOUNT_ID',
      'WISE_PROFILE_ID',
      'WISE_BASE_URL',
      'WISE_WEBHOOK_SECRET'
    ]
  };
  
  let allConfigured = true;
  
  for (const [service, vars] of Object.entries(requiredVars)) {
    console.log(`   ${service}:`);
    for (const varName of vars) {
      if (process.env[varName]) {
        console.log(`     ✅ ${varName}: Set`);
      } else {
        console.log(`     ❌ ${varName}: Missing`);
        allConfigured = false;
      }
    }
  }
  
  return allConfigured;
}

// Test 4: Test Payment Endpoint (basic validation)
async function testPaymentEndpoint() {
  console.log('\n4. Testing Payment Creation Endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/payments/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // This should fail validation, but endpoint should be accessible
        invalid: 'data'
      })
    });
    
    if (response.status === 400) {
      console.log('   ✅ Payment endpoint accessible and validating requests');
      return true;
    } else if (response.status === 500) {
      console.log('   ⚠️  Payment endpoint accessible but has server errors');
      return false;
    } else {
      console.log(`   ❓ Unexpected response: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Payment endpoint test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runQuickTests() {
  console.log('Running quick payment gateway tests...\n');
  
  const results = {
    health: await testHealthCheck(),
    webhooks: await testWebhookEndpoints(),
    environment: testEnvironmentVariables(),
    payment: await testPaymentEndpoint()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 QUICK TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All basic tests passed!');
    console.log('💡 Next steps:');
    console.log('   1. Run: node setup-test-data.js (when database is accessible)');
    console.log('   2. Run: node test-payments.js (for full integration tests)');
  } else {
    console.log('\n🚨 Some tests failed. Please check the configuration above.');
  }
  
  console.log('='.repeat(50));
}

// Execute tests
if (require.main === module) {
  runQuickTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}