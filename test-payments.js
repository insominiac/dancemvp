#!/usr/bin/env node

/**
 * Payment Gateway Testing Script
 * Tests both Stripe and Wise payment integrations
 */

const crypto = require('crypto');

// Test configurations
const TEST_CONFIG = {
  stripe: {
    publishableKey: 'pk_test_51234567890abcdef', // Stripe test key format
    secretKey: 'sk_test_51234567890abcdef', // Stripe test secret format
    webhookSecret: 'whsec_test1234567890abcdef'
  },
  wise: {
    apiKey: 'test-api-key-12345',
    accountId: 'test-account-12345',
    profileId: 'test-profile-12345',
    baseUrl: 'https://api.sandbox.transferwise.tech',
    webhookSecret: 'wise-webhook-secret-12345'
  },
  server: {
    baseUrl: 'http://localhost:3000'
  }
};

// Test data (matching setup-test-data.js)
const TEST_DATA = {
  booking: {
    bookingType: 'class',
    itemId: 'test-class-123',
    userId: 'test-user-456',
    customAmount: 50.00
  },
  wiseRecipient: {
    name: 'Test Dance Instructor',
    email: 'instructor@example.com',
    currency: 'USD',
    type: 'EMAIL'
  }
};

class PaymentTester {
  constructor() {
    this.results = {
      stripe: { tests: [], success: 0, failed: 0 },
      wise: { tests: [], success: 0, failed: 0 }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      reset: '\x1b[0m'     // Reset
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async testStripePaymentCreation() {
    this.log('Testing Stripe Payment Creation...', 'info');
    
    try {
      const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentProvider: 'STRIPE',
          ...TEST_DATA.booking,
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.log('✅ Stripe payment creation successful', 'success');
        this.results.stripe.success++;
        this.results.stripe.tests.push({
          test: 'Payment Creation',
          status: 'PASSED',
          data: data
        });
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.log(`❌ Stripe payment creation failed: ${error.message}`, 'error');
      this.results.stripe.failed++;
      this.results.stripe.tests.push({
        test: 'Payment Creation',
        status: 'FAILED',
        error: error.message
      });
      return null;
    }
  }

  async testWisePaymentCreation() {
    this.log('Testing Wise Payment Creation...', 'info');
    
    try {
      const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentProvider: 'WISE',
          ...TEST_DATA.booking,
          wiseRecipientDetails: TEST_DATA.wiseRecipient
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.log('✅ Wise payment creation successful', 'success');
        this.results.wise.success++;
        this.results.wise.tests.push({
          test: 'Payment Creation',
          status: 'PASSED',
          data: data
        });
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.log(`❌ Wise payment creation failed: ${error.message}`, 'error');
      this.results.wise.failed++;
      this.results.wise.tests.push({
        test: 'Payment Creation',
        status: 'FAILED',
        error: error.message
      });
      return null;
    }
  }

  async testStripeWebhook() {
    this.log('Testing Stripe Webhook...', 'info');
    
    try {
      // Create a mock Stripe webhook payload
      const payload = JSON.stringify({
        id: 'evt_test_webhook',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_12345',
            payment_status: 'paid',
            metadata: {
              bookingId: 'test-booking-123'
            }
          }
        }
      });

      // Generate signature (simplified for testing)
      const signature = `t=${Math.floor(Date.now() / 1000)},v1=${crypto
        .createHmac('sha256', TEST_CONFIG.stripe.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex')}`;

      const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': signature
        },
        body: payload
      });

      if (response.ok) {
        this.log('✅ Stripe webhook test successful', 'success');
        this.results.stripe.success++;
        this.results.stripe.tests.push({
          test: 'Webhook Handler',
          status: 'PASSED'
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.log(`❌ Stripe webhook test failed: ${error.message}`, 'error');
      this.results.stripe.failed++;
      this.results.stripe.tests.push({
        test: 'Webhook Handler',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testWiseWebhook() {
    this.log('Testing Wise Webhook...', 'info');
    
    try {
      // Create a mock Wise webhook payload
      const payload = JSON.stringify({
        subscriptionId: 'test-subscription-123',
        eventType: 'transfers#state-change',
        resource: {
          id: 'test-transfer-123',
          profile_id: TEST_CONFIG.wise.profileId,
          account_id: TEST_CONFIG.wise.accountId,
          status: 'outgoing_payment_sent'
        }
      });

      // Generate signature
      const signature = crypto
        .createHmac('sha256', TEST_CONFIG.wise.webhookSecret)
        .update(payload, 'utf8')
        .digest('base64');

      const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/webhooks/wise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature
        },
        body: payload
      });

      if (response.ok) {
        this.log('✅ Wise webhook test successful', 'success');
        this.results.wise.success++;
        this.results.wise.tests.push({
          test: 'Webhook Handler',
          status: 'PASSED'
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.log(`❌ Wise webhook test failed: ${error.message}`, 'error');
      this.results.wise.failed++;
      this.results.wise.tests.push({
        test: 'Webhook Handler',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testServerHealth() {
    this.log('Testing server health...', 'info');
    
    try {
      const response = await fetch(`${TEST_CONFIG.server.baseUrl}/api/health`);
      if (response.ok) {
        this.log('✅ Server is running', 'success');
        return true;
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      this.log(`❌ Server health check failed: ${error.message}`, 'error');
      this.log('💡 Make sure your development server is running: npm run dev', 'warn');
      return false;
    }
  }

  async validateEnvironment() {
    this.log('Validating environment configuration...', 'info');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      // Stripe vars will be checked when testing Stripe
      // Wise vars will be checked when testing Wise
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'error');
      return false;
    }

    this.log('✅ Basic environment validation passed', 'success');
    return true;
  }

  generateTestReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('PAYMENT GATEWAY TEST REPORT', 'info');
    this.log('='.repeat(60), 'info');

    // Stripe Results
    this.log(`\n🔵 STRIPE RESULTS:`, 'info');
    this.log(`   ✅ Passed: ${this.results.stripe.success}`, 'success');
    this.log(`   ❌ Failed: ${this.results.stripe.failed}`, 'error');
    
    this.results.stripe.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      this.log(`   ${status} ${test.test}`, test.status === 'PASSED' ? 'success' : 'error');
      if (test.error) {
        this.log(`      Error: ${test.error}`, 'error');
      }
    });

    // Wise Results
    this.log(`\n🟡 WISE RESULTS:`, 'info');
    this.log(`   ✅ Passed: ${this.results.wise.success}`, 'success');
    this.log(`   ❌ Failed: ${this.results.wise.failed}`, 'error');
    
    this.results.wise.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      this.log(`   ${status} ${test.test}`, test.status === 'PASSED' ? 'success' : 'error');
      if (test.error) {
        this.log(`      Error: ${test.error}`, 'error');
      }
    });

    // Overall Summary
    const totalTests = this.results.stripe.tests.length + this.results.wise.tests.length;
    const totalPassed = this.results.stripe.success + this.results.wise.success;
    const totalFailed = this.results.stripe.failed + this.results.wise.failed;

    this.log(`\n📊 OVERALL SUMMARY:`, 'info');
    this.log(`   Total Tests: ${totalTests}`, 'info');
    this.log(`   Passed: ${totalPassed}`, 'success');
    this.log(`   Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'success');
    this.log(`   Success Rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`, 'info');

    this.log('\n' + '='.repeat(60), 'info');
  }

  async runAllTests() {
    this.log('🚀 Starting Payment Gateway Tests...', 'info');
    
    // Check server health first
    const serverHealthy = await this.testServerHealth();
    if (!serverHealthy) {
      this.log('⚠️  Server is not accessible. Some tests will be skipped.', 'warn');
    }

    // Validate environment
    await this.validateEnvironment();

    if (serverHealthy) {
      // Test payment creation
      await this.testStripePaymentCreation();
      await this.testWisePaymentCreation();

      // Test webhooks
      await this.testStripeWebhook();
      await this.testWiseWebhook();
    }

    // Generate report
    this.generateTestReport();
  }
}

// CLI execution
if (require.main === module) {
  const tester = new PaymentTester();
  
  // Handle CLI arguments
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Payment Gateway Tester

Usage: node test-payments.js [options]

Options:
  --help, -h     Show this help message
  --stripe-only  Test only Stripe integration
  --wise-only    Test only Wise integration
  --server-url   Set custom server URL (default: http://localhost:3000)

Examples:
  node test-payments.js                    # Test both gateways
  node test-payments.js --stripe-only      # Test Stripe only
  node test-payments.js --wise-only        # Test Wise only
  node test-payments.js --server-url http://localhost:3001
    `);
    process.exit(0);
  }

  // Override server URL if provided
  if (args.includes('--server-url')) {
    const urlIndex = args.indexOf('--server-url');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
      TEST_CONFIG.server.baseUrl = args[urlIndex + 1];
    }
  }

  // Run tests
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = PaymentTester;