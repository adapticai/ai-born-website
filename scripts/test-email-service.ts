#!/usr/bin/env tsx
/**
 * Email Service Test Script
 * Tests email service configuration and functionality
 *
 * Usage:
 *   npx tsx scripts/test-email-service.ts
 *
 * Or to send a test email:
 *   npx tsx scripts/test-email-service.ts send your@email.com
 */

import { testEmailService, sendExcerptEmail } from '../src/lib/email';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];

  console.log('='.repeat(60));
  console.log('Email Service Test');
  console.log('='.repeat(60));
  console.log();

  // Test configuration
  console.log('1. Testing Configuration...');
  const configTest = await testEmailService();

  if (configTest.configured) {
    console.log('✅ Email service is properly configured');
  } else {
    console.log('❌ Email service has configuration issues:');
    configTest.issues.forEach((issue) => {
      console.log(`   - ${issue}`);
    });

    if (command === 'send') {
      console.log('\n❌ Cannot send test email due to configuration issues.');
      process.exit(1);
    }
  }

  console.log();

  // Send test email if requested
  if (command === 'send' && email) {
    console.log(`2. Sending Test Email to ${email}...`);

    try {
      const result = await sendExcerptEmail(email);

      if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Check inbox at: ${email}`);
      } else {
        console.log('❌ Email send failed:');
        console.log(`   Error: ${result.error}`);
        console.log(`   Code: ${result.errorCode}`);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Unexpected error:');
      console.error(error);
      process.exit(1);
    }

    console.log();
  } else if (command === 'send' && !email) {
    console.log('❌ Missing email address');
    console.log('Usage: npx tsx scripts/test-email-service.ts send your@email.com');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
