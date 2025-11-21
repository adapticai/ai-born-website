# Organization Workspace Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install @anthropic-ai/sdk
```

### 2. Add Environment Variable
```bash
# Add to .env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 3. Run Database Migration
```bash
npx prisma generate
npx prisma migrate dev --name add_org_workspace
```

### 4. Start Development Server
```bash
npm run dev
```

## Quick Usage Guide

### Create an Organization (API)

```typescript
// POST /api/orgs
const response = await fetch('/api/orgs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Acme Corporation',
    type: 'CORPORATE',
    contactEmail: 'admin@acme.com',
    domain: 'acme.com'
  })
});

const { orgId } = await response.json();
```

### Add a Member

```typescript
// POST /api/orgs/[orgId]/members
const response = await fetch(`/api/orgs/${orgId}/members`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@acme.com',
    role: 'MEMBER' // OWNER, ADMIN, MEMBER, VIEWER
  })
});
```

### Generate a Plan with Claude AI

```typescript
// POST /api/orgs/[orgId]/plans
const response = await fetch(`/api/orgs/${orgId}/plans`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'AI Transformation Roadmap',
    description: 'Strategic plan for AI adoption',
    privacy: 'PUBLIC', // PUBLIC, PRIVATE, SHARED
    organizationContext: {
      industry: 'Financial Services',
      size: '500-1000 employees',
      challenges: [
        'Legacy systems integration',
        'Regulatory compliance',
        'Talent shortage'
      ],
      goals: [
        'Automate 50% of manual processes',
        'Reduce operational costs by 30%',
        'Improve customer satisfaction'
      ]
    }
  })
});

const { plan } = await response.json();
console.log('Plan generated:', plan.id);
```

### Verify Domain Ownership

1. **Initiate verification:**
```typescript
// POST /api/orgs/[orgId]/verify-domain
const response = await fetch(`/api/orgs/${orgId}/verify-domain`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'acme.com'
  })
});

const { verificationStatus } = await response.json();
```

2. **Add DNS TXT record:**
```
Type: TXT
Name: _aiborn-verify.acme.com
Value: aiborn-verification=[token from response]
```

3. **Verify (after DNS propagation):**
```typescript
// Call the same endpoint again
const response = await fetch(`/api/orgs/${orgId}/verify-domain`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: 'acme.com' })
});

const { verificationStatus } = await response.json();
console.log('Verified:', verificationStatus.verified);
```

## Dashboard Access

Navigate to: `http://localhost:3000/org/[orgId]`

Tabs available:
- **Overview**: Statistics and quick actions
- **Members**: Manage team members
- **VIP Codes**: Track code usage
- **Plans**: View AI-generated plans
- **Settings**: Configure organization (Admin/Owner only)

## Permission Levels

| Role | Create Plans | Manage Members | Manage Org | Delete Org |
|------|--------------|----------------|------------|------------|
| OWNER | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ❌ | ❌ |
| MEMBER | ✅ | ❌ | ❌ | ❌ |
| VIEWER | ❌ | ❌ | ❌ | ❌ |

## Privacy Modes for Plans

- **PUBLIC**: All organization members can view
- **PRIVATE**: Only creator can view
- **SHARED**: Creator + explicitly shared members can view

## Common Code Patterns

### Check User Permissions

```typescript
import { getOrgPermissions } from '@/types/organization';
import { verifyOrgMembership } from '@/lib/prisma-rls';

const membership = await verifyOrgMembership(prisma, userId, orgId);
if (!membership.isMember) {
  throw new Error('Not a member');
}

const permissions = getOrgPermissions(membership.role);
if (!permissions.canManageMembers) {
  throw new Error('Insufficient permissions');
}
```

### Access Plan with Privacy Check

```typescript
const plan = await prisma.orgPlan.findFirst({
  where: {
    id: planId,
    orgId,
    OR: [
      { privacy: 'PUBLIC' },
      { createdBy: userId },
      {
        privacy: 'SHARED',
        shares: {
          some: {
            member: {
              userId,
              status: 'ACTIVE'
            }
          }
        }
      }
    ]
  }
});
```

### Generate Custom Plan Prompt

```typescript
import { buildPrompt, generatePlan } from '@/lib/llm-plan-generator';

const customPrompt = buildPrompt({
  organizationName: 'Acme Corp',
  organizationType: 'CORPORATE',
  industry: 'Healthcare',
  size: '1000+ employees',
  challenges: ['Data silos', 'Compliance'],
  goals: ['Unified patient records', 'AI diagnostics']
});

const result = await generatePlan(
  { /* context */ },
  {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    temperature: 0.7
  }
);

console.log('Generated plan:', result.content);
```

## Troubleshooting

### Issue: "Unauthorized" errors
**Solution**: Ensure user is authenticated via Auth.js

### Issue: Domain verification fails
**Solution**:
1. Check DNS record exists: `dig TXT _aiborn-verify.acme.com`
2. Wait for propagation (can take 24-48 hours)
3. Verify record value matches exactly

### Issue: Plan generation fails
**Solution**:
1. Check `ANTHROPIC_API_KEY` is set correctly
2. Verify API key has credits
3. Check network access to Anthropic API
4. Review rate limits

### Issue: "Insufficient permissions"
**Solution**: Check user's role in organization:
```typescript
const membership = await prisma.orgMember.findUnique({
  where: {
    orgId_userId: { orgId, userId }
  }
});
console.log('User role:', membership?.role);
```

## File Locations

### Core Files
- Schema: `/prisma/schema.prisma`
- Types: `/src/types/organization.ts`
- Services: `/src/lib/domain-verification.ts`, `/src/lib/llm-plan-generator.ts`
- Middleware: `/src/lib/prisma-rls.ts`

### API Routes
- Organizations: `/src/app/api/orgs/**`
- Members: `/src/app/api/orgs/[orgId]/members/**`
- Plans: `/src/app/api/orgs/[orgId]/plans/**`
- Verification: `/src/app/api/orgs/[orgId]/verify-domain/**`

### UI Components
- Dashboard: `/src/app/org/[orgId]/page.tsx`
- Components: `/src/components/org/**`

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run migrations
3. ✅ Create test organization
4. ✅ Add members
5. ✅ Generate first plan
6. ✅ Test domain verification
7. 📝 Add email notifications
8. 📝 Implement PDF export
9. 📝 Build plan sharing UI

## Additional Resources

- Full documentation: `/ORGANIZATION_WORKSPACE_IMPLEMENTATION.md`
- Prisma docs: https://www.prisma.io/docs
- Anthropic API: https://docs.anthropic.com
- Auth.js: https://authjs.dev

## Support

For questions or issues, refer to:
1. Main implementation docs
2. API endpoint comments
3. Type definitions in `/src/types/organization.ts`
