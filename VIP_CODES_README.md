# VIP Code System — Complete Implementation

Production-ready VIP code generation and management system for AI-Born book launch.

## 📁 File Structure

```
ai-born-website/
├── prisma/
│   └── schema.prisma                          # Database schema (Code & Entitlement models)
├── scripts/
│   └── generate-vip-codes.ts                  # CLI tool for batch code generation
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── codes/
│   │   │       └── page.tsx                   # Admin dashboard UI
│   │   └── api/
│   │       ├── admin/
│   │       │   └── codes/
│   │       │       ├── generate/
│   │       │       │   └── route.ts           # Admin API: Generate codes
│   │       │       └── list/
│   │       │           └── route.ts           # Admin API: List codes
│   │       └── codes/
│   │           └── validate/
│   │               └── route.ts               # Public API: Validate codes
│   ├── components/
│   │   └── VipCodeInput.tsx                   # Client-side code input component
│   └── lib/
│       ├── code-generator.ts                  # Core code generation logic
│       ├── admin-auth.ts                      # Admin authentication & audit logging
│       └── prisma.ts                          # Prisma client singleton
├── docs/
│   ├── VIP_CODE_SYSTEM.md                     # Complete documentation
│   └── VIP_CODE_QUICKSTART.md                 # 5-minute quick start guide
├── .env.example                                # Environment variables template
└── VIP_CODES_README.md                         # This file
```

## 🚀 Quick Start

### 1. Generate Admin Token
```bash
openssl rand -base64 32
```

### 2. Configure Environment
Add to `.env.local`:
```bash
ADMIN_API_TOKEN=your-generated-token
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiborn_dev
```

### 3. Apply Database Schema
```bash
npx prisma migrate dev --name add_vip_codes
npx prisma generate
```

### 4. Generate Codes (CLI)
```bash
# Generate 100 VIP preview codes
npx tsx scripts/generate-vip-codes.ts --count=100 --type=VIP_PREVIEW

# Generate and export to CSV
npx tsx scripts/generate-vip-codes.ts --count=500 --type=PARTNER --output=codes.csv
```

### 5. Access Admin Dashboard
```bash
npm run dev
# Navigate to: http://localhost:3000/admin/codes
```

## 📋 Features

### ✅ Code Generation
- **CLI Tool** — Batch generate codes via command line
- **Admin API** — RESTful API for programmatic generation
- **Admin Dashboard** — Web-based UI for code management
- **Unique codes** — Collision detection ensures uniqueness
- **Readable format** — Excludes confusing characters (0/O, 1/I/l)
- **Batch support** — Generate up to 10,000 codes at once
- **CSV export** — Download codes for distribution

### ✅ Code Management
- **Filtering** — By type, status, organization
- **Search** — Find specific codes
- **Pagination** — Handle large code sets
- **Statistics** — Real-time redemption metrics
- **Audit logging** — Track all admin actions

### ✅ Code Validation
- **Public API** — Validate codes without redemption
- **Rate limiting** — Prevent abuse (10 requests/minute)
- **User-friendly errors** — Clear validation messages
- **UI component** — Ready-to-use React component

### ✅ Security
- **Token authentication** — Secure admin access
- **Rate limiting** — Prevent brute force attacks
- **Audit logging** — Complete action history
- **IP tracking** — Monitor access patterns

## 🎯 Code Types

| Type | Description | Use Case |
|------|-------------|----------|
| `VIP_PREVIEW` | Early excerpt access | Pre-launch VIPs |
| `VIP_BONUS` | Enhanced bonus pack | Premium pre-orders |
| `VIP_LAUNCH` | Launch event access | Launch week attendees |
| `PARTNER` | Partner organization | Strategic partners |
| `MEDIA` | Media/press access | Journalists, reviewers |
| `INFLUENCER` | Creator access | YouTube, podcasts, etc. |

## 🔧 Usage Examples

### CLI — Generate Codes

```bash
# Basic generation
npx tsx scripts/generate-vip-codes.ts --count=1000 --type=VIP_PREVIEW

# With description
npx tsx scripts/generate-vip-codes.ts \
  --count=500 \
  --type=PARTNER \
  --description="Launch week partners"

# With expiration
npx tsx scripts/generate-vip-codes.ts \
  --count=100 \
  --type=MEDIA \
  --valid-until="2025-12-31"

# Multi-use codes
npx tsx scripts/generate-vip-codes.ts \
  --count=50 \
  --type=INFLUENCER \
  --max-redemptions=10

# Export to CSV
npx tsx scripts/generate-vip-codes.ts \
  --count=1000 \
  --type=VIP_PREVIEW \
  --output=preview-codes.csv
```

### API — Generate Codes

```bash
curl -X POST https://ai-born.org/api/admin/codes/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100,
    "type": "VIP_PREVIEW",
    "description": "Launch week VIPs",
    "maxRedemptions": 1,
    "validUntil": "2025-12-31T23:59:59Z",
    "format": "json"
  }'
```

### API — List Codes

```bash
curl -X GET "https://ai-born.org/api/admin/codes/list?page=1&limit=50&type=VIP_PREVIEW&includeStats=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### API — Validate Code (Public)

```bash
curl -X POST https://ai-born.org/api/codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}'
```

### React — Code Input Component

```tsx
import { VipCodeInput } from '@/components/VipCodeInput';

export default function Page() {
  const handleValidCode = (code: string, details: any) => {
    console.log('Valid code:', code, details);
    // Grant entitlement, redirect, etc.
  };

  return <VipCodeInput onValidCode={handleValidCode} />;
}
```

## 📊 Database Schema

### Code Model
```prisma
model Code {
  id              String       @id @default(cuid())
  code            String       @unique        // e.g., "ABC123"
  type            CodeType                    // VIP_PREVIEW, PARTNER, etc.
  status          CodeStatus   @default(ACTIVE)

  description     String?                     // Optional description
  maxRedemptions  Int?                        // null = unlimited
  redemptionCount Int          @default(0)

  validFrom       DateTime     @default(now())
  validUntil      DateTime?

  createdBy       String?                     // Admin identifier
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  entitlements    Entitlement[]
  orgId           String?
  org             Org?         @relation(fields: [orgId], references: [id])
}
```

### Entitlement Model
```prisma
model Entitlement {
  id          String             @id @default(cuid())
  userId      String
  codeId      String?
  type        EntitlementType
  status      EntitlementStatus  @default(PENDING)

  fulfilledAt DateTime?
  expiresAt   DateTime?
  metadata    Json?

  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  user        User               @relation(fields: [userId], references: [id])
  code        Code?              @relation(fields: [codeId], references: [id])
}
```

## 🔒 Security Best Practices

1. **Never commit `.env`** — Keep `ADMIN_API_TOKEN` secret
2. **Use HTTPS** — Always in production
3. **Rotate tokens** — Change admin token quarterly
4. **Monitor logs** — Review audit logs regularly
5. **Rate limiting** — Enforced on all endpoints
6. **Single-use codes** — Default `maxRedemptions: 1`
7. **Set expiration** — Use `validUntil` for time-limited codes
8. **IP allowlisting** — (Optional) Restrict admin access by IP

## 📈 Statistics & Monitoring

### Available Metrics
- Total codes generated
- Active vs. redeemed count
- Redemption rate (%)
- Expired/revoked codes
- Per-type breakdowns

### Access Statistics

**CLI:**
```bash
npx tsx scripts/generate-vip-codes.ts --count=1 --type=VIP_PREVIEW
# Stats displayed automatically
```

**API:**
```bash
curl -X GET "https://ai-born.org/api/admin/codes/list?includeStats=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Dashboard:**
Navigate to admin dashboard to view real-time statistics.

## 🐛 Troubleshooting

### "Unauthorized: Invalid admin credentials"
- Verify `ADMIN_API_TOKEN` in `.env.local`
- Check Authorization header: `Bearer YOUR_TOKEN`

### "Failed to generate unique code after 10 attempts"
- Database may be saturated (rare, theoretical max: 887M codes)
- Clear expired/revoked codes

### "Rate limit exceeded"
- Wait 1 minute before retrying
- Consider batching requests

### "Database schema not in sync"
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## 📚 Documentation

- **Quick Start** — `/docs/VIP_CODE_QUICKSTART.md`
- **Full Documentation** — `/docs/VIP_CODE_SYSTEM.md`
- **API Reference** — See full docs
- **Database Schema** — `/prisma/schema.prisma`

## 🚢 Production Deployment

### Pre-Deployment Checklist
- [ ] Generate secure `ADMIN_API_TOKEN` for production
- [ ] Add token to hosting environment variables
- [ ] Set `DATABASE_URL` to production database
- [ ] Run migrations on production DB
- [ ] Test API endpoints with production URL
- [ ] Verify HTTPS is enforced
- [ ] Configure audit log destination
- [ ] Test rate limiting
- [ ] Document admin credentials securely

### Environment Variables (Production)
```bash
ADMIN_API_TOKEN=<generated-with-openssl-rand>
DATABASE_URL=<production-postgres-url>
ADMIN_EMAILS=admin@micpress.com
```

### Post-Deployment Verification
1. Generate test code via CLI
2. Validate code via public API
3. Access admin dashboard
4. Verify rate limiting works
5. Check audit logs are captured

## 🔄 Integration Examples

### Grant Entitlement After Code Redemption

```typescript
import { prisma } from '@/lib/prisma';
import { validateCode, redeemCode } from '@/lib/code-generator';

async function redeemVipCode(userId: string, codeString: string) {
  // Validate code
  const result = await validateCode(codeString);

  if (!result.valid || !result.code) {
    throw new Error(result.error);
  }

  // Redeem code
  await redeemCode(result.code.id);

  // Grant entitlement
  const entitlement = await prisma.entitlement.create({
    data: {
      userId,
      codeId: result.code.id,
      type: mapCodeTypeToEntitlement(result.code.type),
      status: 'ACTIVE',
    },
  });

  return entitlement;
}
```

### Email Distribution Integration

```typescript
import { generateAndSaveCodes } from '@/lib/code-generator';
import { sendEmail } from '@/lib/email';

async function distributePartnerCodes(partners: Partner[]) {
  // Generate codes
  const codes = await generateAndSaveCodes({
    count: partners.length,
    type: 'PARTNER',
    description: 'Partner distribution batch',
    maxRedemptions: 1,
  });

  // Send emails
  for (let i = 0; i < partners.length; i++) {
    await sendEmail({
      to: partners[i].email,
      subject: 'Your VIP Code for AI-Born',
      body: `Your exclusive code: ${codes[i].code}`,
    });
  }
}
```

## 📞 Support

For technical issues or questions:
1. Check troubleshooting section above
2. Review full documentation
3. Check audit logs for errors
4. Contact technical lead

## 📄 License

Proprietary — Mic Press, LLC

---

**Generated:** 2025-01-15
**Version:** 1.0
**Author:** Claude Code Implementation Agent
