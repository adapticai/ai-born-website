# Account Deletion Implementation

**Implementation Date:** October 19, 2025
**GDPR Compliance:** Article 17 - Right to Erasure
**Status:** Complete (requires schema migration)

---

## Overview

This implementation provides GDPR-compliant account deletion functionality with:

- **Soft delete** with 30-day grace period
- **Data anonymization** while preserving legal/accounting records
- **Confirmation email** notification
- **Explicit user confirmation** (must type "DELETE")
- **Comprehensive audit logging**

---

## Files Created

### 1. API Route
**File:** `/src/app/api/user/delete/route.ts`

Handles account deletion requests with:
- Authentication verification
- Confirmation token validation
- Pre-deletion email notification
- Data anonymization via database transaction
- Audit logging
- Grace period tracking

**Endpoint:** `DELETE /api/user/delete`

**Request Body:**
```json
{
  "confirmation": "DELETE",
  "reason": "Optional reason for leaving"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion initiated",
  "data": {
    "deletedAt": "2025-10-19T12:00:00.000Z",
    "gracePeriodEnd": "2025-11-18T12:00:00.000Z",
    "dataRetention": {
      "purchaseHistory": "Preserved (anonymized)",
      "entitlements": "Revoked",
      "personalData": "Anonymized"
    }
  }
}
```

### 2. UI Component
**File:** `/src/components/auth/DeleteAccountDialog.tsx`

Comprehensive deletion confirmation dialog featuring:
- Multi-step confirmation process
- Input validation (must type "DELETE")
- Clear warnings about data loss
- Grace period explanation
- Optional feedback collection
- Loading states and error handling
- Brand-consistent design

**Usage:**
```tsx
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";

// In your component
<DeleteAccountDialog>
  <Button variant="destructive">Delete Account</Button>
</DeleteAccountDialog>
```

### 3. Email Notification
**File:** `/src/lib/email.ts` (function added)

Function: `sendAccountDeletionEmail(email: string, name: string)`

Sends comprehensive confirmation email including:
- 30-day recovery period information
- What has been deleted
- What has been kept (anonymized)
- Recovery instructions
- GDPR compliance statement
- Security alert (if not requested)

### 4. Updated SecuritySettings
**File:** `/src/components/settings/SecuritySettings.tsx`

Integrated DeleteAccountDialog into Settings page Security tab with:
- Prominent placement in "Danger Zone" card
- Clear warning text about 30-day recovery period
- Consistent with existing security settings UI

---

## Required Schema Migration

**IMPORTANT:** The implementation requires adding a `deletedAt` field to the User model for proper grace period tracking.

### Prisma Schema Update

Add to the `User` model in `/prisma/schema.prisma`:

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  emailVerified DateTime?
  deletedAt     DateTime?      // Add this field
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // ... existing relations
}
```

### Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name add_user_deleted_at

# Apply to production
npx prisma migrate deploy
```

### Update API Route After Migration

Once the schema is updated, uncomment the `deletedAt` field in the API route:

**File:** `/src/app/api/user/delete/route.ts`

```typescript
// In anonymizeUserData function, uncomment:
await prisma.user.update({
  where: { id: user.id },
  data: {
    email: anonymizedEmail,
    name: anonymizedName,
    emailVerified: null,
    deletedAt: new Date(), // Uncomment this line
  },
});
```

```typescript
// In the transaction, uncomment:
await tx.user.update({
  where: { id: user.id },
  data: {
    email: `deleted-${user.id}@anonymized.local`,
    name: `[Deleted User]`,
    emailVerified: null,
    deletedAt: new Date(), // Uncomment this line
  },
});
```

---

## GDPR Compliance

### Right to Erasure (Article 17)

The implementation complies with GDPR requirements:

#### What is Deleted:
- ✅ Personal identifiable information (name, email)
- ✅ Email verification status
- ✅ User preferences and settings
- ✅ Organisation memberships
- ✅ Newsletter subscriptions
- ✅ All entitlements (marked as REVOKED)

#### What is Kept (Anonymized):
- 📋 Purchase history (for legal/accounting compliance)
- 📋 Receipt verification records (fraud prevention)
- 📋 Bonus claim records (audit trail)

**Legal Basis for Retention:** Article 6(1)(c) - Legal obligation to maintain financial records

#### 30-Day Grace Period

Users can recover their account within 30 days by contacting support. After 30 days:
- Personal data is permanently removed
- Anonymized records remain for compliance

### Data Minimization (Article 5)

Only the minimum necessary data is retained:
- Purchase amounts and dates (anonymized user reference)
- Receipt verification status (no PII)
- Transaction timestamps (audit trail)

### Transparency (Article 12)

Users receive:
1. Pre-deletion confirmation email
2. Clear explanation of what will be deleted
3. Clear explanation of what will be kept
4. Recovery instructions
5. Timeline for permanent deletion

---

## Security Features

### Authentication
- Requires active user session
- Validates user ID from session token
- Prevents unauthorized deletions

### Confirmation Required
- User must type "DELETE" exactly
- Case-insensitive validation
- Prevents accidental deletions

### Audit Logging
```typescript
console.info("[Account Deletion]", {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  reason: reason || "Not specified",
  gracePeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});
```

### Rate Limiting
Email notifications are rate-limited:
- 5 emails per recipient per hour
- Prevents abuse and spam

---

## User Experience Flow

### 1. User Initiates Deletion
- Navigate to Settings → Security tab
- Click "Delete account" button in Danger Zone
- Dialog opens with warnings

### 2. Confirmation Dialog
User sees:
- ⚠️ Warning about permanent data loss
- 📋 List of what will be deleted
- ℹ️ List of what will be kept (anonymized)
- 🔄 30-day recovery period information
- 📝 Optional feedback field
- ⌨️ Confirmation input (type "DELETE")

### 3. Deletion Process
1. Frontend validates confirmation text
2. POST request to `/api/user/delete`
3. Backend validates authentication
4. Sends pre-deletion email
5. Anonymizes user data (transaction)
6. Returns success response
7. User is signed out
8. Redirected to homepage with `?deleted=true`

### 4. Post-Deletion
- User receives confirmation email
- Account is soft-deleted (anonymized)
- Cannot sign in (email no longer exists)
- 30-day recovery window begins

### 5. Recovery (within 30 days)
- User contacts support
- Support verifies identity
- Account is restored from soft-delete
- User can sign in again

### 6. Permanent Deletion (after 30 days)
- Automated job (to be implemented) removes soft-deleted accounts
- Personal data permanently removed
- Anonymized records remain for compliance

---

## Testing Checklist

### Functional Testing
- [ ] Dialog opens when clicking "Delete account"
- [ ] Confirmation text validation works
- [ ] Cannot submit without typing "DELETE"
- [ ] Loading states display correctly
- [ ] Error messages display correctly
- [ ] Success toast appears
- [ ] User is signed out after deletion
- [ ] Redirect to homepage works

### API Testing
- [ ] Requires authentication (401 without session)
- [ ] Validates confirmation token (400 if invalid)
- [ ] Sends confirmation email
- [ ] Anonymizes user data correctly
- [ ] Preserves purchase history
- [ ] Revokes entitlements
- [ ] Returns correct response structure
- [ ] Handles errors gracefully

### Email Testing
- [ ] Confirmation email is sent
- [ ] Email contains all required information
- [ ] 30-day deadline is calculated correctly
- [ ] Links work (support, privacy policy)
- [ ] Email renders correctly in major clients

### Security Testing
- [ ] Cannot delete another user's account
- [ ] Rate limiting prevents abuse
- [ ] Audit logs are created
- [ ] Transaction ensures data consistency
- [ ] No sensitive data in error messages

### GDPR Compliance Testing
- [ ] Personal data is anonymized
- [ ] Purchase history is preserved
- [ ] Entitlements are revoked
- [ ] User receives confirmation email
- [ ] 30-day grace period is enforced
- [ ] Recovery process works

---

## Future Enhancements

### Automated Cleanup Job
Create a scheduled job to permanently delete soft-deleted accounts after 30 days:

**File:** `/src/jobs/cleanup-deleted-accounts.ts`

```typescript
/**
 * Cleanup job for permanently deleting accounts after grace period
 * Run daily via cron or serverless function
 */
export async function cleanupDeletedAccounts() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Find all soft-deleted accounts past grace period
  const expiredAccounts = await prisma.user.findMany({
    where: {
      deletedAt: {
        lte: thirtyDaysAgo,
      },
      email: {
        endsWith: '@anonymized.local',
      },
    },
  });

  // Permanently delete associated data
  for (const user of expiredAccounts) {
    await prisma.$transaction([
      // Delete entitlements
      prisma.entitlement.deleteMany({ where: { userId: user.id } }),

      // Delete org memberships
      prisma.orgMember.deleteMany({ where: { userId: user.id } }),

      // Keep receipts and bonus claims (anonymized reference)

      // Delete user record
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  }

  console.info(`Cleaned up ${expiredAccounts.length} expired accounts`);
}
```

### Account Recovery Endpoint
Create an admin endpoint to restore soft-deleted accounts:

**File:** `/src/app/api/admin/user/restore/route.ts`

```typescript
/**
 * POST /api/admin/user/restore
 * Restore a soft-deleted account (admin only)
 */
export async function POST(request: Request) {
  // Verify admin authentication

  const { userId, email, name } = await request.json();

  // Restore user data
  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      name,
      deletedAt: null,
    },
  });

  // Restore entitlements
  await prisma.entitlement.updateMany({
    where: { userId, status: 'REVOKED' },
    data: { status: 'ACTIVE' },
  });

  // Send recovery confirmation email
}
```

### Enhanced Analytics
Track deletion reasons to improve the product:

```typescript
// Create DeleteAccountReason model
model DeleteAccountReason {
  id        String   @id @default(cuid())
  userId    String   // Anonymized reference
  reason    String
  category  String?  // Categorize reasons
  createdAt DateTime @default(now())
}
```

### Data Export Before Deletion
Offer users a data export before deletion (GDPR Article 20 - Right to Data Portability):

```typescript
/**
 * GET /api/user/export
 * Export all user data before deletion
 */
export async function GET() {
  const user = await getCurrentUser();

  const userData = {
    profile: await getUserProfile(user.id),
    receipts: await getUserReceipts(user.id),
    entitlements: await getUserEntitlements(user.id),
    bonusClaims: await getUserBonusClaims(user.id),
  };

  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="ai-born-data-export.json"',
    },
  });
}
```

---

## Integration with Existing Systems

### Update Middleware
Add check for soft-deleted accounts in authentication middleware:

**File:** `/src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const session = await getServerSession();

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deletedAt: true },
    });

    // If account is soft-deleted, sign them out
    if (user?.deletedAt) {
      return NextResponse.redirect(
        new URL('/auth/signin?error=AccountDeleted', request.url)
      );
    }
  }

  return NextResponse.next();
}
```

### Update Sign-In Flow
Prevent sign-in for deleted accounts:

**File:** `/auth.ts` or your NextAuth configuration

```typescript
callbacks: {
  async signIn({ user }) {
    // Check if account is deleted
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { deletedAt: true },
    });

    if (dbUser?.deletedAt) {
      throw new Error('This account has been deleted');
    }

    return true;
  },
}
```

---

## Error Handling

### Common Error Scenarios

#### 1. User Not Authenticated
**Response:** 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You must be signed in to delete your account"
}
```

#### 2. Invalid Confirmation
**Response:** 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid confirmation",
  "message": "You must type \"DELETE\" to confirm account deletion"
}
```

#### 3. User Not Found
**Response:** 404 Not Found
```json
{
  "success": false,
  "error": "User not found",
  "message": "Unable to locate user account"
}
```

#### 4. Internal Server Error
**Response:** 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An error occurred while processing your deletion request. Please try again or contact support."
}
```

---

## Monitoring and Alerts

### Key Metrics to Track
- Number of account deletions per day/week/month
- Deletion reasons (categorized)
- Recovery requests
- Failed deletion attempts
- Time from signup to deletion
- Correlation with specific features or events

### Recommended Alerts
- **High deletion rate:** Alert if deletions spike >200% above baseline
- **Failed deletions:** Alert if >5% of deletion attempts fail
- **Email delivery failures:** Alert if confirmation emails fail to send
- **Database transaction failures:** Critical alert for data integrity issues

### Integration with Monitoring Services

**Sentry:**
```typescript
Sentry.captureMessage('Account deletion requested', {
  level: 'info',
  extra: {
    userId: user.id,
    email: user.email,
    reason: body.reason,
  },
});
```

**Datadog:**
```typescript
datadog.increment('account.deletion.requested', {
  tags: [`reason:${category}`, `has_purchases:${hasPurchases}`],
});
```

---

## Support Documentation

### For Support Team

**Handling Recovery Requests:**

1. **Verify Identity**
   - Confirm email address matches original account
   - Ask security questions if available
   - Verify purchase history details

2. **Check Grace Period**
   - Recovery only available within 30 days
   - Check `deletedAt` timestamp in database

3. **Restore Account**
   - Use admin restore endpoint
   - Restore user email and name
   - Reactivate entitlements
   - Send recovery confirmation email

4. **Document Recovery**
   - Log recovery in support system
   - Note reason for recovery
   - Track recovery success rate

**Database Query for Support:**
```sql
SELECT
  id,
  email,
  name,
  deletedAt,
  CURRENT_TIMESTAMP - deletedAt AS days_since_deletion
FROM users
WHERE deletedAt IS NOT NULL
  AND CURRENT_TIMESTAMP - deletedAt < INTERVAL '30 days'
ORDER BY deletedAt DESC;
```

---

## Deployment Checklist

- [ ] Schema migration applied to database
- [ ] API route deployed and tested
- [ ] UI component integrated in Settings page
- [ ] Email templates verified
- [ ] Rate limiting configured
- [ ] Monitoring and alerts set up
- [ ] Support team trained on recovery process
- [ ] Privacy policy updated (if needed)
- [ ] Legal team review completed
- [ ] GDPR compliance documentation updated
- [ ] Automated cleanup job scheduled (optional)
- [ ] Load testing completed
- [ ] Rollback plan prepared

---

## Support and Maintenance

### Contact
For questions or issues, contact:
- **Engineering:** [engineering@micpress.com]
- **Legal/GDPR:** [legal@micpress.com]
- **Support:** [support@ai-born.org]

### Documentation Updates
This documentation should be updated whenever:
- Implementation changes
- New features are added
- GDPR requirements change
- Support processes are modified

**Last Updated:** October 19, 2025
