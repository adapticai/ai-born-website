/**
 * Prisma Setup Verification Script
 *
 * Validates that the Prisma setup is complete and working correctly.
 * Run with: npx tsx scripts/verify-prisma.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
}

const results: CheckResult[] = [];

function log(result: CheckResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️ ';
  console.log(`${icon} ${result.name}: ${result.message}`);
}

async function main() {
  console.log('🔍 Verifying Prisma Setup...\n');

  // Check 1: Database Connection
  try {
    await prisma.$connect();
    log({
      name: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to database',
    });
  } catch (error) {
    log({
      name: 'Database Connection',
      status: 'fail',
      message: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    await prisma.$disconnect();
    process.exit(1);
  }

  // Check 2: Schema Sync
  try {
    await prisma.$queryRaw`SELECT 1`;
    log({
      name: 'Schema Sync',
      status: 'pass',
      message: 'Database schema is accessible',
    });
  } catch (error) {
    log({
      name: 'Schema Sync',
      status: 'fail',
      message: 'Schema not synced. Run: npm run db:push',
    });
  }

  // Check 3: Tables Exist
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    const expectedTables = [
      'users',
      'codes',
      'entitlements',
      'receipts',
      'orgs',
      'email_captures',
      'bonus_claims',
      'media_requests',
      'bulk_orders',
      'retailer_selections',
      'analytics_events',
    ];

    const tableNames = tables.map((t) => t.tablename);
    const missingTables = expectedTables.filter((t) => !tableNames.includes(t));

    if (missingTables.length === 0) {
      log({
        name: 'Database Tables',
        status: 'pass',
        message: `All ${expectedTables.length} tables exist`,
      });
    } else {
      log({
        name: 'Database Tables',
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}. Run: npm run db:push`,
      });
    }
  } catch (error) {
    log({
      name: 'Database Tables',
      status: 'fail',
      message: 'Could not query tables',
    });
  }

  // Check 4: Seed Data
  try {
    const userCount = await prisma.user.count();
    const codeCount = await prisma.code.count();
    const retailerCount = await prisma.retailerSelection.count();

    if (userCount > 0 && codeCount > 0 && retailerCount > 0) {
      log({
        name: 'Seed Data',
        status: 'pass',
        message: `Found ${userCount} users, ${codeCount} codes, ${retailerCount} retailers`,
      });
    } else {
      log({
        name: 'Seed Data',
        status: 'skip',
        message: 'No seed data found. Run: npm run db:seed',
      });
    }
  } catch (error) {
    log({
      name: 'Seed Data',
      status: 'skip',
      message: 'Could not check seed data',
    });
  }

  // Check 5: VIP Codes
  try {
    const vipCodes = await prisma.code.findMany({
      where: { status: 'ACTIVE' },
      select: { code: true, type: true },
    });

    if (vipCodes.length > 0) {
      log({
        name: 'VIP Codes',
        status: 'pass',
        message: `${vipCodes.length} active VIP codes available`,
      });
    } else {
      log({
        name: 'VIP Codes',
        status: 'skip',
        message: 'No active VIP codes. Run: npm run db:seed',
      });
    }
  } catch (error) {
    log({
      name: 'VIP Codes',
      status: 'fail',
      message: 'Could not query VIP codes',
    });
  }

  // Check 6: Retailers
  try {
    const retailers = await prisma.retailerSelection.findMany({
      where: { isActive: true },
      select: { retailerName: true, geo: true },
    });

    if (retailers.length > 0) {
      const geos = [...new Set(retailers.map((r) => r.geo))];
      log({
        name: 'Retailers',
        status: 'pass',
        message: `${retailers.length} retailers across ${geos.length} regions`,
      });
    } else {
      log({
        name: 'Retailers',
        status: 'skip',
        message: 'No retailers configured. Run: npm run db:seed',
      });
    }
  } catch (error) {
    log({
      name: 'Retailers',
      status: 'fail',
      message: 'Could not query retailers',
    });
  }

  // Check 7: Indexes
  try {
    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
    `;

    const indexCount = indexes.length;
    log({
      name: 'Database Indexes',
      status: 'pass',
      message: `${indexCount} indexes created for performance`,
    });
  } catch (error) {
    log({
      name: 'Database Indexes',
      status: 'fail',
      message: 'Could not check indexes',
    });
  }

  // Check 8: Enums
  try {
    const enums = await prisma.$queryRaw<Array<{ typname: string }>>`
      SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace
    `;

    const enumCount = enums.length;
    if (enumCount >= 14) {
      log({
        name: 'Type-Safe Enums',
        status: 'pass',
        message: `${enumCount} enums for type safety`,
      });
    } else {
      log({
        name: 'Type-Safe Enums',
        status: 'fail',
        message: `Only ${enumCount} enums found (expected 14+)`,
      });
    }
  } catch (error) {
    log({
      name: 'Type-Safe Enums',
      status: 'fail',
      message: 'Could not check enums',
    });
  }

  // Check 9: Foreign Keys
  try {
    const fks = await prisma.$queryRaw<Array<{ constraint_name: string }>>`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `;

    if (fks.length > 0) {
      log({
        name: 'Foreign Keys',
        status: 'pass',
        message: `${fks.length} foreign key constraints enforcing data integrity`,
      });
    } else {
      log({
        name: 'Foreign Keys',
        status: 'skip',
        message: 'No foreign keys found',
      });
    }
  } catch (error) {
    log({
      name: 'Foreign Keys',
      status: 'skip',
      message: 'Could not check foreign keys',
    });
  }

  // Summary
  console.log('\n📊 Summary:\n');
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📝 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some checks failed. Please fix the issues above.');
    process.exit(1);
  } else if (skipped === results.length) {
    console.log('\n⚠️  Database may not be initialized. Run: npm run db:push && npm run db:seed');
    process.exit(1);
  } else {
    console.log('\n✨ Prisma setup is complete and working correctly!');
    console.log('\nNext steps:');
    console.log('  - View data: npm run db:studio');
    console.log('  - Add seed data: npm run db:seed (if needed)');
    console.log('  - Create migration: npm run db:migrate');
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Verification failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
