#!/usr/bin/env tsx

/**
 * CLI Script: Generate VIP Codes
 *
 * Usage:
 *   npx tsx scripts/generate-vip-codes.ts --count=1000 --type=VIP_PREVIEW
 *   npx tsx scripts/generate-vip-codes.ts --count=500 --type=PARTNER --description="Launch partners" --max-redemptions=1
 *   npx tsx scripts/generate-vip-codes.ts --count=100 --type=MEDIA --valid-until="2025-12-31" --output=codes.csv
 *
 * Options:
 *   --count              Number of codes to generate (required, 1-10000)
 *   --type               Code type (required: VIP_PREVIEW, VIP_BONUS, VIP_LAUNCH, PARTNER, MEDIA, INFLUENCER)
 *   --description        Optional description
 *   --max-redemptions    Maximum redemptions per code (default: 1)
 *   --valid-until        Expiration date (ISO format: YYYY-MM-DD)
 *   --org-id             Organization ID
 *   --created-by         Admin identifier (default: "cli-script")
 *   --output             Output file path (default: stdout)
 *   --format             Output format (json|csv, default: csv)
 *   --help               Show help message
 */

import { CodeType } from '@prisma/client';
import {
  generateAndSaveCodes,
  exportCodesToCsv,
  getCodeStatistics,
  type CodeGenerationOptions,
} from '../src/lib/code-generator';
import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message: string) {
  log(`ERROR: ${message}`, colors.red);
}

function success(message: string) {
  log(`✓ ${message}`, colors.green);
}

function info(message: string) {
  log(`ℹ ${message}`, colors.cyan);
}

function warn(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
  count?: number;
  type?: CodeType;
  description?: string;
  maxRedemptions?: number;
  validUntil?: string;
  orgId?: string;
  createdBy?: string;
  output?: string;
  format?: 'json' | 'csv';
  help?: boolean;
} {
  const args: Record<string, string> = {};

  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      args[key] = value || 'true';
    }
  });

  return {
    count: args.count ? parseInt(args.count, 10) : undefined,
    type: args.type as CodeType | undefined,
    description: args.description,
    maxRedemptions: args['max-redemptions']
      ? parseInt(args['max-redemptions'], 10)
      : undefined,
    validUntil: args['valid-until'],
    orgId: args['org-id'],
    createdBy: args['created-by'],
    output: args.output,
    format: (args.format as 'json' | 'csv') || 'csv',
    help: args.help === 'true',
  };
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bright}VIP Code Generator${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npx tsx scripts/generate-vip-codes.ts --count=1000 --type=VIP_PREVIEW
  npx tsx scripts/generate-vip-codes.ts --count=500 --type=PARTNER --description="Launch partners"
  npx tsx scripts/generate-vip-codes.ts --count=100 --type=MEDIA --valid-until="2025-12-31" --output=codes.csv

${colors.cyan}Options:${colors.reset}
  ${colors.bright}--count${colors.reset}              Number of codes to generate (required, 1-10000)
  ${colors.bright}--type${colors.reset}               Code type (required):
                         VIP_PREVIEW, VIP_BONUS, VIP_LAUNCH, PARTNER, MEDIA, INFLUENCER
  ${colors.bright}--description${colors.reset}        Optional description
  ${colors.bright}--max-redemptions${colors.reset}    Maximum redemptions per code (default: 1)
  ${colors.bright}--valid-until${colors.reset}        Expiration date (ISO format: YYYY-MM-DD)
  ${colors.bright}--org-id${colors.reset}             Organization ID
  ${colors.bright}--created-by${colors.reset}         Admin identifier (default: "cli-script")
  ${colors.bright}--output${colors.reset}             Output file path (default: stdout)
  ${colors.bright}--format${colors.reset}             Output format (json|csv, default: csv)
  ${colors.bright}--help${colors.reset}               Show this help message

${colors.cyan}Examples:${colors.reset}
  ${colors.gray}# Generate 1000 VIP preview codes${colors.reset}
  npx tsx scripts/generate-vip-codes.ts --count=1000 --type=VIP_PREVIEW

  ${colors.gray}# Generate partner codes with expiration${colors.reset}
  npx tsx scripts/generate-vip-codes.ts --count=500 --type=PARTNER --valid-until="2025-12-31"

  ${colors.gray}# Generate and export to CSV file${colors.reset}
  npx tsx scripts/generate-vip-codes.ts --count=100 --type=MEDIA --output=media-codes.csv

  ${colors.gray}# Generate with description and multi-use${colors.reset}
  npx tsx scripts/generate-vip-codes.ts --count=50 --type=INFLUENCER --description="YouTube creators" --max-redemptions=10
`);
}

/**
 * Validate arguments
 */
function validateArgs(args: ReturnType<typeof parseArgs>): {
  valid: boolean;
  error?: string;
} {
  if (!args.count) {
    return { valid: false, error: 'Missing required argument: --count' };
  }

  if (args.count < 1 || args.count > 10000) {
    return { valid: false, error: 'Count must be between 1 and 10,000' };
  }

  if (!args.type) {
    return { valid: false, error: 'Missing required argument: --type' };
  }

  const validTypes: CodeType[] = [
    'VIP_PREVIEW',
    'VIP_BONUS',
    'VIP_LAUNCH',
    'PARTNER',
    'MEDIA',
    'INFLUENCER',
  ];

  if (!validTypes.includes(args.type)) {
    return {
      valid: false,
      error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
    };
  }

  if (args.validUntil && isNaN(Date.parse(args.validUntil))) {
    return { valid: false, error: 'Invalid date format for --valid-until' };
  }

  if (args.format && !['json', 'csv'].includes(args.format)) {
    return { valid: false, error: 'Format must be "json" or "csv"' };
  }

  return { valid: true };
}

/**
 * Main execution
 */
async function main() {
  log(
    `\n${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}`
  );
  log(`${colors.bright}${colors.cyan}  VIP Code Generator${colors.reset}`);
  log(
    `${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`
  );

  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Validate arguments
  const validation = validateArgs(args);
  if (!validation.valid) {
    error(validation.error!);
    log('\nRun with --help for usage information\n');
    process.exit(1);
  }

  // Prepare options
  const options: CodeGenerationOptions = {
    count: args.count!,
    type: args.type!,
    description: args.description,
    maxRedemptions: args.maxRedemptions || 1,
    validUntil: args.validUntil ? new Date(args.validUntil) : undefined,
    createdBy: args.createdBy || 'cli-script',
    orgId: args.orgId,
  };

  // Show configuration
  info('Configuration:');
  console.log(`  Count:            ${colors.bright}${options.count}${colors.reset}`);
  console.log(`  Type:             ${colors.bright}${options.type}${colors.reset}`);
  if (options.description) {
    console.log(`  Description:      ${options.description}`);
  }
  console.log(`  Max Redemptions:  ${options.maxRedemptions}`);
  if (options.validUntil) {
    console.log(`  Valid Until:      ${options.validUntil.toISOString()}`);
  }
  if (options.orgId) {
    console.log(`  Organization ID:  ${options.orgId}`);
  }
  console.log(`  Created By:       ${options.createdBy}`);
  console.log(`  Output Format:    ${args.format}\n`);

  // Generate codes
  try {
    info('Generating codes...');
    const startTime = Date.now();

    const codes = await generateAndSaveCodes(options);

    const duration = Date.now() - startTime;
    success(`Generated ${codes.length} codes in ${duration}ms`);

    // Output codes
    if (args.output) {
      // Write to file
      const outputPath = path.resolve(args.output);
      let content: string;

      if (args.format === 'csv') {
        content = exportCodesToCsv(codes);
      } else {
        content = JSON.stringify(codes, null, 2);
      }

      fs.writeFileSync(outputPath, content, 'utf-8');
      success(`Saved codes to: ${outputPath}`);
    } else {
      // Output to stdout
      log('\n' + colors.gray + '─'.repeat(40) + colors.reset);
      if (args.format === 'csv') {
        console.log(exportCodesToCsv(codes));
      } else {
        console.log(JSON.stringify(codes, null, 2));
      }
      log(colors.gray + '─'.repeat(40) + colors.reset + '\n');
    }

    // Show statistics
    info('Fetching statistics...');
    const stats = await getCodeStatistics(args.type);

    log(`\n${colors.cyan}Statistics for ${args.type}:${colors.reset}`);
    console.log(`  Total Codes:      ${stats.totalCodes.toLocaleString()}`);
    console.log(`  Active:           ${stats.activeCount.toLocaleString()}`);
    console.log(`  Redeemed:         ${stats.redeemedCount.toLocaleString()}`);
    console.log(`  Expired:          ${stats.expiredCount.toLocaleString()}`);
    console.log(`  Total Redemptions: ${stats.totalRedemptions.toLocaleString()}`);
    console.log(`  Redemption Rate:  ${stats.redemptionRate.toFixed(2)}%`);

    log(
      `\n${colors.bright}${colors.green}✓ Code generation complete!${colors.reset}\n`
    );
    process.exit(0);
  } catch (err) {
    error('Code generation failed');
    console.error(err);
    process.exit(1);
  }
}

// Run main function
main().catch((err) => {
  error('Unexpected error');
  console.error(err);
  process.exit(1);
});
