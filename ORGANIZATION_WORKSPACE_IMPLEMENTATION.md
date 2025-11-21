# Organization Workspace Implementation

## Overview

This document describes the complete implementation of organization workspace features for the AI-Born landing page, including organization management, member administration, VIP code tracking, and LLM-generated custom plans.

## Implementation Date

October 18, 2025

## Features Implemented

### 1. Database Schema (Prisma)

#### Extended Models

**Org Model Extensions** (`/prisma/schema.prisma`)
- Added domain verification fields:
  - `domainVerificationToken` (String, unique)
  - `domainVerified` (Boolean, default: false)
  - `domainVerifiedAt` (DateTime, nullable)
- Added organization settings:
  - `allowAutoJoin` (Boolean, default: false)
  - `settings` (Json, flexible settings storage)
- Added relations:
  - `members` (OrgMember[])
  - `plans` (OrgPlan[])

**User Model Extensions**
- Added `orgMemberships` relation to OrgMember[]

#### New Models

**OrgMember** - Organization membership and roles
- Fields:
  - `id`, `orgId`, `userId`
  - `role`: OWNER, ADMIN, MEMBER, VIEWER
  - `status`: ACTIVE, INVITED, SUSPENDED, REMOVED
  - `invitedBy`, `invitedAt`, `joinedAt`
  - `metadata` (Json, custom member data)
- Relations: Org, User, OrgPlanShare[]

**OrgPlan** - LLM-generated organizational plans
- Fields:
  - `id`, `orgId`, `createdBy`
  - `title`, `description`
  - `status`: DRAFT, GENERATING, READY, PUBLISHED, ARCHIVED
  - `privacy`: PUBLIC, PRIVATE, SHARED
  - `content` (String, markdown format)
  - `contentJson` (Json, structured data)
  - `prompt`, `model`, `generationTime`, `tokenCount`
  - `pdfUrl`, `pdfGeneratedAt`
  - `viewCount`, `downloadCount`
- Relations: Org, OrgPlanShare[]

**OrgPlanShare** - Plan sharing with specific members
- Fields:
  - `id`, `planId`, `memberId`, `sharedBy`
  - `canEdit`, `canDownload`
  - `viewedAt`, `downloadedAt`
- Relations: OrgPlan, OrgMember

### 2. TypeScript Types

**File**: `/src/types/organization.ts`

Comprehensive type definitions including:
- Organization types with relations
- Member management types
- Domain verification types
- Plan generation and sharing types
- LLM integration types
- PDF export types
- API request/response types
- Permission management with `getOrgPermissions()` helper

### 3. Core Services

#### Domain Verification Service

**File**: `/src/lib/domain-verification.ts`

Features:
- Generate verification tokens (32-byte hex)
- DNS TXT record verification
- Support for multiple DNS providers (Cloudflare, GoDaddy, Namecheap)
- DNS propagation checking across multiple public DNS servers
- Email domain extraction and validation
- Provider-specific setup instructions

Key Functions:
- `generateVerificationToken()` - Create unique verification token
- `verifyDomain()` - Check DNS TXT records for verification
- `getVerificationRecord()` - Get DNS record details
- `checkDNSPropagation()` - Check propagation across DNS servers
- `isValidDomain()` - Validate domain format
- `extractDomainFromEmail()` - Extract domain from email address

#### LLM Plan Generator

**File**: `/src/lib/llm-plan-generator.ts`

Features:
- Claude AI integration (Anthropic SDK)
- Customizable prompt templates
- Token usage tracking
- Cost estimation
- Streaming support for real-time generation
- Content validation and parsing
- Structured JSON extraction from markdown

Key Functions:
- `generatePlan()` - Generate plan using Claude AI
- `generatePlanStream()` - Stream plan generation
- `buildPrompt()` - Compile prompt from context
- `parsePlanContent()` - Extract structured data
- `validatePlanContent()` - Validate generated content
- `estimateGenerationCost()` - Calculate API cost

Default Prompt Template:
- Organization details
- Industry and size context
- Current challenges
- Strategic goals
- Custom context support

Output Structure:
- Executive Summary
- Current State Assessment
- Strategic Vision
- Implementation Roadmap (phased)
- Key Success Metrics
- Risk Mitigation
- Resource Requirements
- Next Steps

#### Row-Level Security (RLS) Middleware

**File**: `/src/lib/prisma-rls.ts`

Features:
- Prisma middleware for access control
- Organization-scoped queries
- Privacy mode enforcement (PUBLIC, PRIVATE, SHARED)
- Role-based permissions
- Automatic query filtering

Key Functions:
- `createRLSMiddleware()` - Create Prisma middleware
- `verifyOrgMembership()` - Check user membership
- `getUserOrgMembership()` - Get membership details
- `checkPlanAccess()` - Verify plan access based on privacy

Privacy Mode Implementation:
- **PUBLIC**: Visible to all organization members
- **PRIVATE**: Visible only to creator
- **SHARED**: Visible to creator + explicitly shared members

### 4. API Routes

All routes include:
- Authentication checks
- Rate limiting (where applicable)
- Input validation
- Error handling
- TypeScript types

#### Organization Management

**POST** `/api/orgs` - Create organization
- Creates org + adds creator as OWNER
- Validates domain format
- Rate limited per user

**GET** `/api/orgs` - List user's organizations
- Returns all orgs where user is active member
- Includes member counts and role

**GET** `/api/orgs/[orgId]` - Get organization details
- Verifies membership
- Returns org with members, codes, plans
- Calculates statistics
- Enforces privacy filters on plans

**PATCH** `/api/orgs/[orgId]` - Update organization
- Requires ADMIN or OWNER role
- Updates basic info, domain, settings

**DELETE** `/api/orgs/[orgId]` - Delete organization
- Requires OWNER role
- Cascade deletes all relations

#### Member Management

**POST** `/api/orgs/[orgId]/members` - Add member
- Requires ADMIN or OWNER role
- Creates user if not exists
- Verifies email domain if domain verified
- Sends invitation (TODO)
- Rate limited

**GET** `/api/orgs/[orgId]/members` - List members
- Requires active membership
- Returns all active members with user details

**DELETE** `/api/orgs/[orgId]/members/[userId]` - Remove member
- Requires ADMIN or OWNER role
- Prevents removing last owner
- Sets status to REMOVED (soft delete)

**PATCH** `/api/orgs/[orgId]/members/[userId]` - Update member
- Requires ADMIN or OWNER role
- Update role, status, metadata
- Only owners can change owner roles

#### Domain Verification

**POST** `/api/orgs/[orgId]/verify-domain` - Verify domain
- Requires ADMIN or OWNER role
- Generates verification token
- Checks DNS TXT records
- Updates verification status
- Returns DNS record instructions

#### Plan Generation

**POST** `/api/orgs/[orgId]/plans` - Generate plan
- Requires MEMBER+ role (not VIEWER)
- Creates plan with GENERATING status
- Calls Claude AI API
- Validates and parses content
- Updates plan with READY status
- Rate limited (expensive operation)

**GET** `/api/orgs/[orgId]/plans` - List plans
- Requires active membership
- Filters by privacy mode
- Returns plans accessible to user

**GET** `/api/orgs/[orgId]/plans/[planId]` - Get plan details
- Verifies access based on privacy
- Increments view count
- Returns plan with shares

**PATCH** `/api/orgs/[orgId]/plans/[planId]` - Update plan
- Requires creator or ADMIN/OWNER role
- Updates title, description, status, privacy, content
- Sets publishedAt when status = PUBLISHED

**DELETE** `/api/orgs/[orgId]/plans/[planId]` - Delete plan
- Requires creator or OWNER role
- Permanently deletes plan

### 5. Dashboard UI

**File**: `/src/app/org/[orgId]/page.tsx`

Features:
- Server-side rendered with Next.js App Router
- Authentication and membership verification
- Tabbed interface with 5 sections
- Permission-based UI rendering
- Loading states with Suspense

Tabs:
1. **Overview** - Statistics and quick actions
2. **Members** - Member list and management
3. **VIP Codes** - Code usage statistics
4. **Plans** - LLM-generated plans
5. **Settings** - Organization configuration (OWNER/ADMIN only)

#### Dashboard Components

**OrganizationOverview** (`/src/components/org/OrganizationOverview.tsx`)
- Statistics cards (members, codes, plans, usage)
- Quick action buttons (permission-based)
- Organization details display

**MemberList** (`/src/components/org/MemberList.tsx`)
- Member cards with avatars
- Role badges with icons (OWNER, ADMIN, MEMBER, VIEWER)
- Add member button
- Member management (edit/remove)
- Join date display

**VIPCodeStats** (`/src/components/org/VIPCodeStats.tsx`)
- Summary statistics (total, active, redemptions)
- Code list with copy-to-clipboard
- Status and type badges
- Redemption tracking
- Expiration dates

**PlansList** (`/src/components/org/PlansList.tsx`)
- Grid layout for plans
- Status and privacy badges
- Generation metadata (model, time, tokens)
- View/download counters
- Share functionality
- Create plan button

**OrganizationSettings** (`/src/components/org/OrganizationSettings.tsx`)
- Basic information editing
- Domain verification status
- Auto-join toggle
- Delete organization (danger zone)

### 6. Permission System

Defined in `/src/types/organization.ts`

Roles and Permissions:

**OWNER**
- Full control
- Can manage organization
- Can manage members
- Can create/manage all plans
- Can invite members
- Can manage codes
- Can view analytics

**ADMIN**
- Can manage members
- Can create/manage plans
- Can invite members
- Can manage codes
- Can view analytics
- Cannot delete organization

**MEMBER**
- Can create own plans
- Limited visibility

**VIEWER**
- Read-only access
- Cannot create anything

### 7. Security Features

#### Rate Limiting

Applied to:
- Organization creation: per user + IP
- Member addition: per org + IP
- Plan generation: per org + user + IP (expensive LLM calls)

#### Input Validation

- Domain format validation
- Email validation
- Required field checks
- Type safety with TypeScript + Zod (where applicable)

#### Access Control

- Session-based authentication (Auth.js)
- Organization membership verification
- Role-based permissions
- Privacy mode enforcement
- RLS middleware for database queries

#### Data Protection

- Soft deletes for members (status = REMOVED)
- Cascade deletes for organizations
- Secure token generation (crypto.randomBytes)
- DNS verification for domain ownership

### 8. Environment Variables Required

Add to `.env`:

```env
# Anthropic API for LLM plan generation
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Existing variables used:
- `DATABASE_URL` - PostgreSQL connection
- Auth.js configuration

### 9. Database Migration

Run the following to apply schema changes:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_organization_workspace

# Or push to database without migration
npx prisma db push
```

### 10. Installation Steps

1. **Update Environment Variables**
   ```bash
   # Add to .env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **Install Dependencies**
   ```bash
   npm install @anthropic-ai/sdk
   ```

3. **Run Database Migration**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Build and Test**
   ```bash
   npm run build
   npm run dev
   ```

5. **Access Dashboard**
   - Create an organization via API or admin panel
   - Navigate to `/org/[orgId]`

## File Structure

```
/prisma
  schema.prisma                    # Extended with org workspace models

/src/types
  organization.ts                  # Complete type definitions

/src/lib
  domain-verification.ts           # DNS verification service
  llm-plan-generator.ts           # Claude AI integration
  prisma-rls.ts                   # Row-level security middleware

/src/app/api/orgs
  route.ts                        # Create/list orgs
  [orgId]/
    route.ts                      # Get/update/delete org
    members/
      route.ts                    # Add/list members
      [userId]/
        route.ts                  # Update/remove member
    verify-domain/
      route.ts                    # Domain verification
    plans/
      route.ts                    # Generate/list plans
      [planId]/
        route.ts                  # Get/update/delete plan

/src/app/org/[orgId]
  page.tsx                        # Organization dashboard

/src/components/org
  OrganizationOverview.tsx        # Stats and quick actions
  MemberList.tsx                  # Member management
  VIPCodeStats.tsx                # VIP code tracking
  PlansList.tsx                   # LLM-generated plans
  OrganizationSettings.tsx        # Settings panel
```

## API Endpoints Summary

| Method | Endpoint | Description | Auth | Rate Limited |
|--------|----------|-------------|------|--------------|
| POST | `/api/orgs` | Create organization | Required | Yes |
| GET | `/api/orgs` | List user's orgs | Required | No |
| GET | `/api/orgs/[orgId]` | Get org details | Required | No |
| PATCH | `/api/orgs/[orgId]` | Update org | ADMIN+ | No |
| DELETE | `/api/orgs/[orgId]` | Delete org | OWNER | No |
| POST | `/api/orgs/[orgId]/members` | Add member | ADMIN+ | Yes |
| GET | `/api/orgs/[orgId]/members` | List members | MEMBER+ | No |
| DELETE | `/api/orgs/[orgId]/members/[userId]` | Remove member | ADMIN+ | No |
| PATCH | `/api/orgs/[orgId]/members/[userId]` | Update member | ADMIN+ | No |
| POST | `/api/orgs/[orgId]/verify-domain` | Verify domain | ADMIN+ | No |
| POST | `/api/orgs/[orgId]/plans` | Generate plan | MEMBER+ | Yes |
| GET | `/api/orgs/[orgId]/plans` | List plans | MEMBER+ | No |
| GET | `/api/orgs/[orgId]/plans/[planId]` | Get plan | MEMBER+ | No |
| PATCH | `/api/orgs/[orgId]/plans/[planId]` | Update plan | Creator/ADMIN+ | No |
| DELETE | `/api/orgs/[orgId]/plans/[planId]` | Delete plan | Creator/OWNER | No |

## LLM Plan Generation

### Claude AI Models Supported

- `claude-3-5-sonnet-20241022` (default, recommended)
- `claude-3-opus-20240229`
- `claude-3-haiku-20240307`

### Generation Options

```typescript
{
  model: string;           // AI model to use
  maxTokens: number;      // Max response tokens (default: 4096)
  temperature: number;    // Creativity (0-1, default: 0.7)
  systemPrompt: string;   // Custom system prompt
}
```

### Cost Estimation

Claude 3.5 Sonnet (as of Oct 2024):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

Typical plan generation:
- Input: ~500-1000 tokens
- Output: ~3000-4000 tokens
- Cost: ~$0.05-$0.07 per plan

### Plan Structure

Generated plans include:
- Executive Summary
- Current State Assessment
- Strategic Vision
- Implementation Roadmap (phased approach)
- Key Success Metrics
- Risk Mitigation strategies
- Resource Requirements
- Next Steps (actionable items)

## Domain Verification Process

1. **Initiate Verification**
   - Admin/Owner adds domain to organization
   - System generates unique verification token

2. **DNS Configuration**
   - Admin adds TXT record to DNS:
     - Record Type: TXT
     - Name: `_aiborn-verify.example.com`
     - Value: `aiborn-verification=[token]`

3. **Verification**
   - Admin clicks "Verify Domain"
   - System queries DNS for TXT record
   - If found, domain is verified
   - Enables auto-join feature

4. **Auto-Join**
   - When domain verified + auto-join enabled
   - New users with matching email domain automatically added as MEMBER

## Privacy Mode Behavior

### PUBLIC Plans
- Visible to all organization members
- Appears in organization plan list
- Can be viewed by any member

### PRIVATE Plans
- Visible only to creator
- Hidden from other members
- Full control by creator

### SHARED Plans
- Visible to creator + explicitly shared members
- Requires explicit share via OrgPlanShare
- Granular permissions (view, edit, download)

## Next Steps / Future Enhancements

### Immediate Priorities

1. **Email Notifications**
   - Member invitation emails
   - Domain verification reminders
   - Plan generation completion
   - Plan share notifications

2. **PDF Export**
   - Generate PDF from plan content
   - Store in S3/R2
   - Download tracking

3. **Plan Sharing UI**
   - Share modal component
   - Member selection
   - Permission toggles

4. **Admin Panel Integration**
   - Organization management
   - Bulk code generation
   - Analytics dashboard

### Future Features

1. **Plan Collaboration**
   - Real-time editing
   - Comments and annotations
   - Version history

2. **Templates**
   - Pre-built plan templates
   - Industry-specific prompts
   - Customizable frameworks

3. **Analytics**
   - Plan view/download tracking
   - Member engagement metrics
   - Code redemption analytics

4. **Integrations**
   - Export to Google Docs
   - Slack notifications
   - Calendar integration for roadmap dates

5. **Advanced Plan Features**
   - Plan comparison
   - Merge plans
   - Extract sections
   - Custom branding/theming

## Testing

### Manual Testing Checklist

- [ ] Create organization
- [ ] Add members (various roles)
- [ ] Verify domain (add DNS TXT record)
- [ ] Generate VIP codes
- [ ] Generate plan with Claude AI
- [ ] View plan (check privacy modes)
- [ ] Share plan with members
- [ ] Update organization settings
- [ ] Remove member
- [ ] Delete organization

### API Testing

Use tools like:
- Postman
- Thunder Client (VS Code)
- cURL

Example: Create organization
```bash
curl -X POST http://localhost:3000/api/orgs \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{
    "name": "Acme Corp",
    "type": "CORPORATE",
    "contactEmail": "admin@acme.com",
    "domain": "acme.com"
  }'
```

## Troubleshooting

### Common Issues

**1. Authentication Errors**
- Ensure user is logged in
- Check session token validity
- Verify Auth.js configuration

**2. Domain Verification Fails**
- Check DNS TXT record exists
- Wait for DNS propagation (up to 48h)
- Verify record format matches exactly
- Test with `dig` or online DNS checker

**3. Plan Generation Errors**
- Verify `ANTHROPIC_API_KEY` is set
- Check API key has sufficient credits
- Verify network connectivity to Anthropic API
- Check rate limits

**4. Permission Denied**
- Verify user's role in organization
- Check membership status is ACTIVE
- Review permission requirements for endpoint

**5. Prisma Errors**
- Run `npx prisma generate`
- Check database connection
- Verify migrations are applied

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint documentation
3. Check console logs for errors
4. Verify environment variables
5. Test with minimal data first

## License

Part of the AI-Born landing page project.
Copyright © 2025 Mic Press, LLC.
