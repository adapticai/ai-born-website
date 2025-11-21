/**
 * Domain Verification API Routes
 * POST /api/orgs/[orgId]/verify-domain - Initiate or verify domain ownership
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateVerificationToken,
  getVerificationRecord,
  verifyDomain,
  isValidDomain,
} from '@/lib/domain-verification';
import type {
  VerifyDomainRequest,
  VerifyDomainResponse,
} from '@/types/organization';

/**
 * POST /api/orgs/[orgId]/verify-domain
 * Initiate domain verification or check verification status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId } = await params;

    // Verify user has admin/owner role
    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get organization
    const org = await prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = (await request.json()) as VerifyDomainRequest;
    const domain = body.domain?.toLowerCase().trim();

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      );
    }

    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Get or generate verification token
    let verificationToken = org.domainVerificationToken;

    if (!verificationToken || org.domain !== domain) {
      verificationToken = generateVerificationToken();

      // Update organization with new domain and token
      await prisma.org.update({
        where: { id: orgId },
        data: {
          domain,
          domainVerificationToken: verificationToken,
          domainVerified: false,
          domainVerifiedAt: null,
        },
      });
    }

    // Get verification record details
    const verificationRecord = getVerificationRecord(domain, verificationToken);

    // Check if domain is already verified
    if (org.domainVerified && org.domain === domain) {
      const response: VerifyDomainResponse = {
        success: true,
        verificationStatus: {
          domain,
          verified: true,
          verifiedAt: org.domainVerifiedAt ?? undefined,
          verificationToken,
          dnsRecordType: 'TXT',
          dnsRecordName: verificationRecord.recordName,
          dnsRecordValue: verificationRecord.recordValue,
        },
      };

      return NextResponse.json(response);
    }

    // Attempt to verify domain via DNS
    const verificationResult = await verifyDomain(domain, verificationToken);

    if (verificationResult.verified) {
      // Update organization as verified
      const updatedOrg = await prisma.org.update({
        where: { id: orgId },
        data: {
          domainVerified: true,
          domainVerifiedAt: new Date(),
        },
      });

      const response: VerifyDomainResponse = {
        success: true,
        verificationStatus: {
          domain,
          verified: true,
          verifiedAt: updatedOrg.domainVerifiedAt ?? undefined,
          verificationToken,
          dnsRecordType: 'TXT',
          dnsRecordName: verificationRecord.recordName,
          dnsRecordValue: verificationRecord.recordValue,
        },
      };

      return NextResponse.json(response);
    }

    // Domain not yet verified - return verification instructions
    const response: VerifyDomainResponse = {
      success: true,
      verificationStatus: {
        domain,
        verified: false,
        verificationToken,
        dnsRecordType: 'TXT',
        dnsRecordName: verificationRecord.recordName,
        dnsRecordValue: verificationRecord.recordValue,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error verifying domain:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}
