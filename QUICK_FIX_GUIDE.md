# Quick Fix Guide: Critical Issues

**Use this guide to quickly resolve blocking issues before deployment.**

---

## 1. Fix TypeScript Compilation Errors (30+ errors)

### Error: `Property 'createdAt' does not exist on type User`

**File:** `/Users/iroselli/ai-born-website/auth.config.ts:321`

**Issue:**
```typescript
token.createdAt = dbUser.createdAt; // ❌ Type error
```

**Fix:**
```typescript
token.createdAt = dbUser.createdAt as Date; // ✅ Type assertion
```

---

### Error: `Property 'authorized' does not exist on type Promise<AdminAuthResult>`

**Files:**
- `/Users/iroselli/ai-born-website/src/app/api/admin/codes/generate/route.ts:110`
- `/Users/iroselli/ai-born-website/src/app/api/admin/codes/list/route.ts:51`

**Issue:**
```typescript
const authResult = checkAdminAuth(request); // ❌ Missing await
if (!authResult.authorized) { ... }
```

**Fix:**
```typescript
const authResult = await checkAdminAuth(request); // ✅ Add await
if (!authResult.authorized) { ... }
```

**Apply to both files:**
```typescript
// /src/app/api/admin/codes/generate/route.ts
export async function POST(request: NextRequest) {
  try {
    // ✅ Add await here
    const authResult = await checkAdminAuth(request);

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        {
          status: authResult.rateLimited ? 429 : 401,
          headers: authResult.rateLimited ? {
            'Retry-After': '60'
          } : undefined
        }
      );
    }

    const adminId = authResult.adminId;
    // ... rest of function
  } catch (error) {
    // ... error handling
  }
}
```

---

### Error: `Property 'preferences' does not exist on type User`

**File:** `/Users/iroselli/ai-born-website/src/app/api/user/preferences/route.ts:137`

**Issue:** Stale Prisma client (schema already has `preferences Json?` field)

**Fix:**
```bash
# Regenerate Prisma client
npm run db:generate

# Restart TypeScript server in VS Code
# Press: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Verify in schema:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  preferences   Json?     // ✅ Already defined

  // ... relations
}
```

---

### Error: `Property 'sendAccountDeletionEmail' does not exist`

**File:** `/Users/iroselli/ai-born-website/src/app/api/user/delete/route.ts:85`

**Issue:**
```typescript
await sendAccountDeletionEmail(user.email, user.name || undefined); // ❌ Function doesn't exist
```

**Fix Option A: Implement the function**

Edit `/Users/iroselli/ai-born-website/src/lib/email.ts`:

```typescript
/**
 * Send account deletion confirmation email
 */
export async function sendAccountDeletionEmail(
  email: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Account Deleted - AI-Born',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a0a0f;">Account Deleted</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Your AI-Born account has been successfully deleted.</p>
          <p>All your data has been permanently removed from our systems.</p>
          <p>If this was a mistake, you can create a new account at any time.</p>
          <hr style="border: 1px solid #e5e5e5; margin: 24px 0;" />
          <p style="font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} AI-Born. All rights reserved.
          </p>
        </div>
      `,
      text: `
Account Deleted

Hi ${name || 'there'},

Your AI-Born account has been successfully deleted.
All your data has been permanently removed from our systems.

If this was a mistake, you can create a new account at any time.

© ${new Date().getFullYear()} AI-Born. All rights reserved.
      `.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send account deletion email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Fix Option B: Remove the email call (faster)**

Edit `/Users/iroselli/ai-born-website/src/app/api/user/delete/route.ts`:

```typescript
// Remove or comment out lines 84-88
// await sendAccountDeletionEmail(user.email, user.name || undefined);

// Add a TODO comment
// TODO: Implement account deletion email notification
logger.info({ userId: user.id }, 'Account deleted successfully');
```

---

### Error: Logger expects `err` property, not `error`

**File:** `/Users/iroselli/ai-born-website/src/app/api/send-magic-link/route.ts:89`

**Issue:**
```typescript
logger.error({
  requestId,
  email,
  error: error.message  // ❌ Should be 'err'
});
```

**Fix:**
```typescript
logger.error(
  {
    err: error,           // ✅ Use 'err' property
    requestId,
    email
  },
  'Failed to send magic link'
);
```

---

### Error: Framer Motion invalid ease string

**File:** `/Users/iroselli/ai-born-website/src/app/welcome/welcome-content.tsx:139, 163, 216`

**Issue:**
```typescript
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"  // ❌ String not allowed
    }
  }
};
```

**Fix:**
```typescript
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0]  // ✅ Use cubic bezier array
    }
  }
};
```

**Ease value conversions:**
- `"easeOut"` → `[0.25, 0.1, 0.25, 1.0]`
- `"easeIn"` → `[0.42, 0.0, 1.0, 1.0]`
- `"easeInOut"` → `[0.42, 0.0, 0.58, 1.0]`
- `"linear"` → `[0.0, 0.0, 1.0, 1.0]`

---

### Error: Playwright test errors (E2E)

**File:** `/Users/iroselli/ai-born-website/e2e/homepage.spec.ts:100-104`

**Issue:**
```typescript
await page.getByLabelText('Email'); // ❌ Method doesn't exist
```

**Fix:**
```typescript
await page.locator('input[name="email"]'); // ✅ Use locator
```

**Full replacement:**
```typescript
// BEFORE
await page.getByLabelText('Email').fill('test@example.com');
await page.getByLabelText('Name').fill('Test User');
await page.getByRole('button', { name: 'Submit' }).click();

// AFTER
await page.locator('input[name="email"]').fill('test@example.com');
await page.locator('input[name="name"]').fill('Test User');
await page.getByRole('button', { name: /submit/i }).click();
```

---

## 2. Batch Fix Script

Create and run this script to fix multiple files at once:

**File:** `/Users/iroselli/ai-born-website/scripts/fix-typescript-errors.sh`

```bash
#!/bin/bash

echo "🔧 Fixing TypeScript errors..."

# 1. Regenerate Prisma client
echo "📦 Regenerating Prisma client..."
npm run db:generate

# 2. Fix auth.config.ts
echo "🔐 Fixing auth.config.ts..."
sed -i.bak 's/token.createdAt = dbUser.createdAt;/token.createdAt = dbUser.createdAt as Date;/g' auth.config.ts

# 3. Fix admin API routes
echo "👮 Fixing admin API routes..."
sed -i.bak 's/const authResult = checkAdminAuth(request);/const authResult = await checkAdminAuth(request);/g' src/app/api/admin/codes/generate/route.ts
sed -i.bak 's/const authResult = checkAdminAuth(request);/const authResult = await checkAdminAuth(request);/g' src/app/api/admin/codes/list/route.ts

# 4. Fix logger error
echo "📝 Fixing logger error property..."
sed -i.bak 's/error: error.message/err: error/g' src/app/api/send-magic-link/route.ts

# 5. Clean up backup files
echo "🧹 Cleaning up..."
find . -name "*.bak" -delete

# 6. Run type check
echo "✅ Running type check..."
npx tsc --noEmit

echo "✨ Done! Review the output above for any remaining errors."
```

**Run it:**
```bash
chmod +x scripts/fix-typescript-errors.sh
./scripts/fix-typescript-errors.sh
```

---

## 3. Manual Verification Checklist

After applying all fixes:

```bash
# 1. Type check
npx tsc --noEmit
# Expected: 0 errors (or only Framer Motion errors)

# 2. Build test
npm run build
# Expected: Successful build

# 3. Start locally
npm run dev
# Expected: No runtime errors

# 4. Test sign-in
# - Visit http://localhost:3000/auth/signin
# - Try email sign-in
# - Check console for errors

# 5. Test admin routes
# - Visit http://localhost:3000/admin/codes
# - Should redirect to sign-in if not authenticated
# - Should show "Access Denied" if not admin
```

---

## 4. Create Missing Files

### Unauthorized Page

**File:** `/Users/iroselli/ai-born-website/src/app/unauthorized/page.tsx`

```typescript
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-obsidian px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-brand-porcelain mb-4">
            Access Denied
          </h1>

          <p className="text-lg text-brand-porcelain/70 mb-2">
            You don't have permission to access this page.
          </p>

          <p className="text-sm text-brand-porcelain/50">
            If you believe this is an error, please contact support.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-brand-cyan text-brand-obsidian rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>

          <Link
            href="/auth/signin"
            className="block w-full px-6 py-3 border border-brand-porcelain/20 text-brand-porcelain rounded-lg font-semibold hover:bg-brand-porcelain/5 transition-colors"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Environment Setup (Quick)

**Minimum viable environment for local development:**

```bash
# Copy example
cp .env.example .env.local

# Generate secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# Add required vars
cat >> .env.local << EOF
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiborn_dev
RESEND_API_KEY=re_test_key_for_development
EMAIL_FROM=AI-Born <test@ai-born.org>
EOF
```

**For production, see `DEPLOYMENT_CHECKLIST.md`**

---

## 6. Database Quick Setup

```bash
# 1. Start local PostgreSQL (if using Docker)
docker run -d \
  --name aiborn-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aiborn_dev \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Generate Prisma client
npm run db:generate

# 3. Push schema to database
npm run db:push

# 4. Verify connection
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

---

## 7. Verify Fixes

**Run this comprehensive check:**

```bash
#!/bin/bash

echo "🔍 Running comprehensive verification..."

# Type check
echo "1️⃣ TypeScript type check..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ Type check passed"
else
  echo "❌ Type errors remain"
  exit 1
fi

# Lint
echo "2️⃣ ESLint check..."
npm run lint
if [ $? -eq 0 ]; then
  echo "✅ Lint check passed"
else
  echo "⚠️ Lint warnings (non-blocking)"
fi

# Build
echo "3️⃣ Production build..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# Database
echo "4️⃣ Database connection..."
npm run db:verify
if [ $? -eq 0 ]; then
  echo "✅ Database connected"
else
  echo "⚠️ Database connection failed (may need setup)"
fi

echo ""
echo "✨ All checks complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Test sign-in flow: http://localhost:3000/auth/signin"
echo "3. Check for runtime errors in console"
echo "4. Review DEPLOYMENT_CHECKLIST.md for production setup"
```

---

## 8. Common Runtime Errors

### Error: "NEXTAUTH_SECRET not set"

**Fix:**
```bash
# Generate and add to .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Error: "Prisma Client not generated"

**Fix:**
```bash
npm run db:generate
```

### Error: "Database connection refused"

**Fix:**
```bash
# Check DATABASE_URL in .env.local
# Start local PostgreSQL:
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16-alpine
```

### Error: "Resend API key invalid"

**Fix:**
```bash
# For development, email sending is optional
# Set a dummy key:
RESEND_API_KEY=re_test_key

# For production, get real key from https://resend.com
```

---

## 9. Quick Test After Fixes

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
open http://localhost:3000

# 3. Test sign-in
open http://localhost:3000/auth/signin

# 4. Try email sign-in
# Enter any email
# Check terminal for magic link (in dev mode)

# 5. Test protected route
open http://localhost:3000/account
# Should redirect to sign-in if not authenticated

# 6. Test admin route (if admin configured)
open http://localhost:3000/admin/codes
# Should show access denied or admin panel
```

---

## Summary

**Critical fixes in order:**

1. ✅ Regenerate Prisma client: `npm run db:generate`
2. ✅ Fix auth.config.ts type assertion
3. ✅ Add `await` to admin API routes
4. ✅ Fix logger error property
5. ✅ Fix Framer Motion ease values
6. ✅ Create unauthorized page
7. ✅ Set up environment variables
8. ✅ Run build test

**Expected time:** 1-2 hours

**After fixes:**
```bash
npx tsc --noEmit  # Should show 0 errors
npm run build     # Should succeed
npm run dev       # Should start without errors
```

**Next:** Proceed to `DEPLOYMENT_CHECKLIST.md` for production deployment.

---

**Questions?** See `FINAL_CODE_REVIEW_REPORT.md` for detailed analysis.
