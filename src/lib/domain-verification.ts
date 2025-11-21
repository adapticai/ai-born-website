/**
 * Domain Verification Service
 *
 * Handles DNS TXT record verification for organization domains
 */

import { randomBytes } from 'crypto';
import dns from 'dns/promises';

export interface DomainVerificationRecord {
  domain: string;
  token: string;
  recordType: 'TXT';
  recordName: string;
  recordValue: string;
}

/**
 * Generate a verification token for domain ownership
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get DNS verification record details for a domain
 */
export function getVerificationRecord(
  domain: string,
  token: string
): DomainVerificationRecord {
  // Clean the domain (remove protocol, www, trailing slash)
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();

  return {
    domain: cleanDomain,
    token,
    recordType: 'TXT',
    recordName: `_aiborn-verify.${cleanDomain}`,
    recordValue: `aiborn-verification=${token}`,
  };
}

/**
 * Verify domain ownership by checking DNS TXT records
 */
export async function verifyDomain(
  domain: string,
  expectedToken: string
): Promise<{
  verified: boolean;
  records: string[];
  error?: string;
}> {
  try {
    const verificationRecord = getVerificationRecord(domain, expectedToken);

    // Query TXT records for the verification subdomain
    const records = await dns.resolveTxt(verificationRecord.recordName);

    // Flatten the TXT record arrays
    const flatRecords = records.map((record) =>
      Array.isArray(record) ? record.join('') : record
    );

    // Check if any record matches our verification value
    const verified = flatRecords.some(
      (record) => record === verificationRecord.recordValue
    );

    return {
      verified,
      records: flatRecords,
    };
  } catch (error) {
    // DNS lookup errors
    if (error instanceof Error) {
      // Common DNS error codes
      if ('code' in error) {
        const errorCode = (error as { code: string }).code;

        switch (errorCode) {
          case 'ENOTFOUND':
            return {
              verified: false,
              records: [],
              error: 'DNS record not found. Please ensure the TXT record has been added.',
            };

          case 'ENODATA':
            return {
              verified: false,
              records: [],
              error: 'No TXT records found for this domain.',
            };

          case 'ETIMEOUT':
            return {
              verified: false,
              records: [],
              error: 'DNS query timeout. Please try again.',
            };

          default:
            return {
              verified: false,
              records: [],
              error: `DNS error: ${errorCode}`,
            };
        }
      }

      return {
        verified: false,
        records: [],
        error: error.message,
      };
    }

    return {
      verified: false,
      records: [],
      error: 'Unknown error during domain verification',
    };
  }
}

/**
 * Extract domain from email address
 */
export function extractDomainFromEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@([^\s@]+)$/;
  const match = email.match(emailRegex);

  if (match && match[1]) {
    return match[1].toLowerCase();
  }

  return null;
}

/**
 * Check if an email belongs to a verified domain
 */
export function isEmailFromDomain(email: string, domain: string): boolean {
  const emailDomain = extractDomainFromEmail(email);
  return emailDomain === domain.toLowerCase();
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

  // Clean the domain first
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();

  return domainRegex.test(cleanDomain);
}

/**
 * Get verification instructions for different DNS providers
 */
export function getVerificationInstructions(provider?: string): {
  provider: string;
  steps: string[];
} {
  const baseSteps = [
    'Log in to your DNS provider dashboard',
    'Navigate to DNS settings or DNS records',
    'Add a new TXT record with the values provided above',
    'Save the record and wait for DNS propagation (can take up to 48 hours)',
    'Click "Verify Domain" to check if the record has propagated',
  ];

  switch (provider?.toLowerCase()) {
    case 'cloudflare':
      return {
        provider: 'Cloudflare',
        steps: [
          'Log in to Cloudflare dashboard',
          'Select your domain',
          'Click "DNS" in the top menu',
          'Click "Add record"',
          'Select "TXT" as the record type',
          'Enter the name and value provided above',
          'Leave TTL as "Auto"',
          'Click "Save"',
          'Wait a few minutes, then verify',
        ],
      };

    case 'godaddy':
      return {
        provider: 'GoDaddy',
        steps: [
          'Log in to GoDaddy account',
          'Go to "My Products"',
          'Find your domain and click "DNS"',
          'Scroll to "Records" section',
          'Click "Add"',
          'Select "TXT" as the record type',
          'Enter the name and value provided above',
          'Set TTL to "1 Hour"',
          'Click "Save"',
          'Wait for propagation, then verify',
        ],
      };

    case 'namecheap':
      return {
        provider: 'Namecheap',
        steps: [
          'Log in to Namecheap account',
          'Go to Domain List',
          'Click "Manage" next to your domain',
          'Click "Advanced DNS"',
          'Click "Add New Record"',
          'Select "TXT Record"',
          'Enter the host and value provided above',
          'Click the checkmark to save',
          'Wait for propagation, then verify',
        ],
      };

    default:
      return {
        provider: 'Generic DNS Provider',
        steps: baseSteps,
      };
  }
}

/**
 * Check DNS propagation status
 * Queries multiple public DNS servers to check propagation
 */
export async function checkDNSPropagation(
  domain: string,
  token: string
): Promise<{
  propagated: boolean;
  servers: {
    server: string;
    found: boolean;
    records: string[];
  }[];
}> {
  const verificationRecord = getVerificationRecord(domain, token);

  // Public DNS servers to check
  const dnsServers = [
    { name: 'Google', server: '8.8.8.8' },
    { name: 'Cloudflare', server: '1.1.1.1' },
    { name: 'OpenDNS', server: '208.67.222.222' },
  ];

  const results = await Promise.all(
    dnsServers.map(async ({ name, server }) => {
      try {
        const resolver = new dns.Resolver();
        resolver.setServers([server]);

        const records = await resolver.resolveTxt(verificationRecord.recordName);
        const flatRecords = records.map((record) =>
          Array.isArray(record) ? record.join('') : record
        );

        const found = flatRecords.some(
          (record) => record === verificationRecord.recordValue
        );

        return {
          server: name,
          found,
          records: flatRecords,
        };
      } catch {
        return {
          server: name,
          found: false,
          records: [],
        };
      }
    })
  );

  const propagated = results.every((result) => result.found);

  return {
    propagated,
    servers: results,
  };
}

/**
 * Format verification record for display
 */
export function formatVerificationRecord(
  record: DomainVerificationRecord
): string {
  return `
Domain: ${record.domain}
Record Type: ${record.recordType}
Host/Name: ${record.recordName}
Value: ${record.recordValue}
  `.trim();
}
