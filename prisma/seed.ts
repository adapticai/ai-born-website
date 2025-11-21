import { PrismaClient } from '@prisma/client';
import {
  CodeType,
  CodeStatus,
  EntitlementType,
  EntitlementStatus,
  OrgType,
  EmailCaptureSource,
  RetailerGeo,
  MediaRequestType,
  MediaRequestStatus,
  BulkOrderStatus
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // ORGANIZATIONS
  // ============================================================================

  console.log('📦 Creating organizations...');

  const organizations = await Promise.all([
    prisma.org.upsert({
      where: { id: 'org-adaptic' },
      update: {},
      create: {
        id: 'org-adaptic',
        name: 'Adaptic.ai',
        type: OrgType.PARTNER,
        contactEmail: 'hello@adaptic.ai',
        contactName: 'Mehran Granfar',
        domain: 'adaptic.ai',
        notes: 'Author company - strategic partner',
      },
    }),
    prisma.org.upsert({
      where: { id: 'org-techcrunch' },
      update: {},
      create: {
        id: 'org-techcrunch',
        name: 'TechCrunch',
        type: OrgType.MEDIA,
        contactEmail: 'tips@techcrunch.com',
        domain: 'techcrunch.com',
        notes: 'Leading technology media outlet',
      },
    }),
    prisma.org.upsert({
      where: { id: 'org-mit' },
      update: {},
      create: {
        id: 'org-mit',
        name: 'MIT Sloan School of Management',
        type: OrgType.ACADEMIC,
        contactEmail: 'info@sloan.mit.edu',
        domain: 'mit.edu',
        notes: 'Academic institution for bulk orders',
      },
    }),
    prisma.org.upsert({
      where: { id: 'org-acme' },
      update: {},
      create: {
        id: 'org-acme',
        name: 'Acme Corporation',
        type: OrgType.CORPORATE,
        contactEmail: 'procurement@acme.com',
        contactName: 'Jane Smith',
        domain: 'acme.com',
        notes: 'Fortune 500 client - executive training',
      },
    }),
  ]);

  console.log(`✅ Created ${organizations.length} organizations`);

  // ============================================================================
  // VIP CODES
  // ============================================================================

  console.log('🎟️  Creating VIP codes...');

  const codes = await Promise.all([
    // VIP Preview codes
    prisma.code.upsert({
      where: { code: 'VIP-PREVIEW-2025' },
      update: {},
      create: {
        code: 'VIP-PREVIEW-2025',
        type: CodeType.VIP_PREVIEW,
        status: CodeStatus.ACTIVE,
        description: 'Early access to full excerpt + priority updates',
        maxRedemptions: null, // Unlimited
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        createdBy: 'system',
      },
    }),
    prisma.code.upsert({
      where: { code: 'VIP-BONUS-ENHANCED' },
      update: {},
      create: {
        code: 'VIP-BONUS-ENHANCED',
        type: CodeType.VIP_BONUS,
        status: CodeStatus.ACTIVE,
        description: 'Enhanced bonus pack with additional templates',
        maxRedemptions: 100,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-06-30'),
        createdBy: 'system',
      },
    }),
    prisma.code.upsert({
      where: { code: 'LAUNCH-EVENT-2025' },
      update: {},
      create: {
        code: 'LAUNCH-EVENT-2025',
        type: CodeType.VIP_LAUNCH,
        status: CodeStatus.ACTIVE,
        description: 'Virtual launch event access',
        maxRedemptions: 500,
        validFrom: new Date('2025-03-01'),
        validUntil: new Date('2025-03-31'),
        createdBy: 'system',
      },
    }),
    // Partner codes
    prisma.code.upsert({
      where: { code: 'ADAPTIC-TEAM-2025' },
      update: {},
      create: {
        code: 'ADAPTIC-TEAM-2025',
        type: CodeType.PARTNER,
        status: CodeStatus.ACTIVE,
        description: 'Adaptic team member code',
        maxRedemptions: 50,
        orgId: 'org-adaptic',
        validFrom: new Date('2025-01-01'),
        createdBy: 'admin',
      },
    }),
    // Media codes
    prisma.code.upsert({
      where: { code: 'MEDIA-PRESS-KIT' },
      update: {},
      create: {
        code: 'MEDIA-PRESS-KIT',
        type: CodeType.MEDIA,
        status: CodeStatus.ACTIVE,
        description: 'Media/press access to advance materials',
        maxRedemptions: null,
        validFrom: new Date('2025-01-01'),
        createdBy: 'system',
      },
    }),
    // Influencer codes
    prisma.code.upsert({
      where: { code: 'CREATOR-COLLAB-01' },
      update: {},
      create: {
        code: 'CREATOR-COLLAB-01',
        type: CodeType.INFLUENCER,
        status: CodeStatus.ACTIVE,
        description: 'Creator collaboration program',
        maxRedemptions: 25,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        createdBy: 'marketing',
      },
    }),
  ]);

  console.log(`✅ Created ${codes.length} VIP codes`);

  // ============================================================================
  // RETAILERS
  // ============================================================================

  console.log('🏪 Creating retailer selections...');

  const retailers = await Promise.all([
    // US Retailers
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'amazon', geo: RetailerGeo.US } },
      update: {},
      create: {
        retailerName: 'Amazon',
        retailerSlug: 'amazon',
        geo: RetailerGeo.US,
        displayName: 'Amazon',
        hardcoverUrl: 'https://amazon.com/AI-Born-Machine-Core-Human-Cortex/dp/XXXXXXXXXX',
        ebookUrl: 'https://amazon.com/AI-Born-Machine-Core-Human-Cortex-ebook/dp/XXXXXXXXXX',
        audiobookUrl: 'https://audible.com/pd/AI-Born-Audiobook/XXXXXXXXXX',
        logoUrl: '/logos/retailers/amazon.svg',
        priority: 100,
        isActive: true,
        nytEligible: true,
      },
    }),
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'bn', geo: RetailerGeo.US } },
      update: {},
      create: {
        retailerName: 'Barnes & Noble',
        retailerSlug: 'bn',
        geo: RetailerGeo.US,
        displayName: 'Barnes & Noble',
        hardcoverUrl: 'https://barnesandnoble.com/w/ai-born-mehran-granfar/XXXXXXXXXX',
        ebookUrl: 'https://barnesandnoble.com/w/ai-born-mehran-granfar/XXXXXXXXXX',
        logoUrl: '/logos/retailers/barnes-noble.svg',
        priority: 90,
        isActive: true,
        nytEligible: true,
      },
    }),
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'bookshop', geo: RetailerGeo.US } },
      update: {},
      create: {
        retailerName: 'Bookshop.org',
        retailerSlug: 'bookshop',
        geo: RetailerGeo.US,
        displayName: 'Bookshop.org',
        hardcoverUrl: 'https://bookshop.org/books/ai-born-the-machine-core-the-human-cortex/XXXXXXXXXX',
        logoUrl: '/logos/retailers/bookshop.svg',
        priority: 85,
        isActive: true,
        nytEligible: true,
      },
    }),
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'apple', geo: RetailerGeo.US } },
      update: {},
      create: {
        retailerName: 'Apple Books',
        retailerSlug: 'apple',
        geo: RetailerGeo.US,
        displayName: 'Apple Books',
        ebookUrl: 'https://books.apple.com/us/book/ai-born/idXXXXXXXXXX',
        audiobookUrl: 'https://books.apple.com/us/audiobook/ai-born/idXXXXXXXXXX',
        logoUrl: '/logos/retailers/apple-books.svg',
        priority: 80,
        isActive: true,
        nytEligible: true,
      },
    }),
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'google', geo: RetailerGeo.US } },
      update: {},
      create: {
        retailerName: 'Google Play',
        retailerSlug: 'google',
        geo: RetailerGeo.US,
        displayName: 'Google Play',
        ebookUrl: 'https://play.google.com/store/books/details/AI_Born?id=XXXXXXXXXX',
        audiobookUrl: 'https://play.google.com/store/audiobooks/details/AI_Born?id=XXXXXXXXXX',
        logoUrl: '/logos/retailers/google-play.svg',
        priority: 75,
        isActive: true,
        nytEligible: false,
      },
    }),
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'kobo', geo: RetailerGeo.US } },
      update: {},
      create: {
        retailerName: 'Kobo',
        retailerSlug: 'kobo',
        geo: RetailerGeo.US,
        displayName: 'Kobo',
        ebookUrl: 'https://kobo.com/us/en/ebook/ai-born-XXXXXXXXXX',
        audiobookUrl: 'https://kobo.com/us/en/audiobook/ai-born-XXXXXXXXXX',
        logoUrl: '/logos/retailers/kobo.svg',
        priority: 70,
        isActive: true,
        nytEligible: false,
      },
    }),

    // UK Retailers
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'amazon', geo: RetailerGeo.UK } },
      update: {},
      create: {
        retailerName: 'Amazon UK',
        retailerSlug: 'amazon',
        geo: RetailerGeo.UK,
        displayName: 'Amazon',
        hardcoverUrl: 'https://amazon.co.uk/AI-Born-Machine-Core-Human-Cortex/dp/XXXXXXXXXX',
        ebookUrl: 'https://amazon.co.uk/AI-Born-Machine-Core-Human-Cortex-ebook/dp/XXXXXXXXXX',
        audiobookUrl: 'https://audible.co.uk/pd/AI-Born-Audiobook/XXXXXXXXXX',
        logoUrl: '/logos/retailers/amazon.svg',
        priority: 100,
        isActive: true,
        nytEligible: false,
      },
    }),
    prisma.retailerSelection.upsert({
      where: { retailerSlug_geo: { retailerSlug: 'waterstones', geo: RetailerGeo.UK } },
      update: {},
      create: {
        retailerName: 'Waterstones',
        retailerSlug: 'waterstones',
        geo: RetailerGeo.UK,
        displayName: 'Waterstones',
        hardcoverUrl: 'https://waterstones.com/book/ai-born/mehran-granfar/XXXXXXXXXX',
        logoUrl: '/logos/retailers/waterstones.svg',
        priority: 90,
        isActive: true,
        nytEligible: false,
      },
    }),
  ]);

  console.log(`✅ Created ${retailers.length} retailer selections`);

  // ============================================================================
  // TEST USERS
  // ============================================================================

  console.log('👤 Creating test users...');

  const testUser1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'vip@example.com' },
    update: {},
    create: {
      email: 'vip@example.com',
      name: 'VIP User',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created 2 test users');

  // ============================================================================
  // ENTITLEMENTS
  // ============================================================================

  console.log('🎁 Creating test entitlements...');

  await prisma.entitlement.upsert({
    where: { id: 'entitlement-1' },
    update: {},
    create: {
      id: 'entitlement-1',
      userId: testUser2.id,
      codeId: codes[0].id, // VIP-PREVIEW-2025
      type: EntitlementType.EARLY_EXCERPT,
      status: EntitlementStatus.ACTIVE,
      metadata: {
        downloadUrl: 'https://example.com/excerpt.pdf',
        chapters: [1, 2, 3],
      },
    },
  });

  await prisma.entitlement.upsert({
    where: { id: 'entitlement-2' },
    update: {},
    create: {
      id: 'entitlement-2',
      userId: testUser2.id,
      codeId: codes[2].id, // LAUNCH-EVENT-2025
      type: EntitlementType.LAUNCH_EVENT,
      status: EntitlementStatus.PENDING,
      expiresAt: new Date('2025-03-31'),
      metadata: {
        eventUrl: 'https://example.com/launch-event',
        eventDate: '2025-03-15T18:00:00Z',
      },
    },
  });

  console.log('✅ Created test entitlements');

  // ============================================================================
  // EMAIL CAPTURES
  // ============================================================================

  console.log('📧 Creating test email captures...');

  const emailCaptures = await Promise.all([
    prisma.emailCapture.upsert({
      where: { email_source: { email: 'newsletter@example.com', source: EmailCaptureSource.HERO_EXCERPT } },
      update: {},
      create: {
        email: 'newsletter@example.com',
        name: 'Newsletter Subscriber',
        source: EmailCaptureSource.HERO_EXCERPT,
        marketingConsent: true,
        doubleOptIn: true,
        verifiedAt: new Date(),
        geo: 'US',
        utmSource: 'organic',
        utmMedium: 'direct',
      },
    }),
    prisma.emailCapture.upsert({
      where: { email_source: { email: 'social@example.com', source: EmailCaptureSource.SOCIAL } },
      update: {},
      create: {
        email: 'social@example.com',
        source: EmailCaptureSource.SOCIAL,
        marketingConsent: true,
        geo: 'UK',
        utmSource: 'twitter',
        utmMedium: 'social',
        utmCampaign: 'launch-week',
      },
    }),
  ]);

  console.log(`✅ Created ${emailCaptures.length} email captures`);

  // ============================================================================
  // MEDIA REQUESTS
  // ============================================================================

  console.log('🎤 Creating test media requests...');

  await prisma.mediaRequest.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@techcrunch.com',
      organization: 'TechCrunch',
      title: 'Senior Editor',
      type: MediaRequestType.INTERVIEW,
      status: MediaRequestStatus.NEW,
      message: 'Interested in interviewing Mehran about the AI-native enterprise framework.',
      deadline: new Date('2025-02-15'),
    },
  });

  await prisma.mediaRequest.create({
    data: {
      name: 'Michael Chen',
      email: 'michael@podcast.fm',
      organization: 'AI Futures Podcast',
      type: MediaRequestType.PODCAST,
      status: MediaRequestStatus.IN_REVIEW,
      message: 'Would love to have Mehran on our podcast to discuss the book.',
    },
  });

  console.log('✅ Created test media requests');

  // ============================================================================
  // BULK ORDERS
  // ============================================================================

  console.log('📦 Creating test bulk orders...');

  await prisma.bulkOrder.create({
    data: {
      contactName: 'Jane Smith',
      contactEmail: 'jane@acme.com',
      contactPhone: '+1-555-0123',
      orgId: 'org-acme',
      orgName: 'Acme Corporation',
      quantity: 500,
      format: 'hardcover',
      requestedPrice: 20.00,
      status: BulkOrderStatus.INQUIRY,
      distributionNotes: 'Distribute across 5 regional offices',
      preferredRetailers: 'Barnes & Noble, Bookshop.org',
    },
  });

  await prisma.bulkOrder.create({
    data: {
      contactName: 'Prof. David Lee',
      contactEmail: 'dlee@mit.edu',
      orgId: 'org-mit',
      orgName: 'MIT Sloan',
      quantity: 150,
      format: 'mixed',
      status: BulkOrderStatus.QUOTE_SENT,
      quotedPrice: 22.50,
      distributionNotes: 'MBA program + executive education',
    },
  });

  console.log('✅ Created test bulk orders');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Summary:');
  console.log(`  - Organizations: ${organizations.length}`);
  console.log(`  - VIP Codes: ${codes.length}`);
  console.log(`  - Retailers: ${retailers.length}`);
  console.log(`  - Test Users: 2`);
  console.log(`  - Email Captures: ${emailCaptures.length}`);
  console.log(`  - Media Requests: 2`);
  console.log(`  - Bulk Orders: 2`);
  console.log('');
  console.log('🔑 Test VIP Codes:');
  console.log('  - VIP-PREVIEW-2025 (unlimited redemptions)');
  console.log('  - VIP-BONUS-ENHANCED (100 redemptions)');
  console.log('  - LAUNCH-EVENT-2025 (500 redemptions)');
  console.log('  - ADAPTIC-TEAM-2025 (50 redemptions)');
  console.log('  - MEDIA-PRESS-KIT (unlimited)');
  console.log('  - CREATOR-COLLAB-01 (25 redemptions)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
