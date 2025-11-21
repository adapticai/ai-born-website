# Authentication Testing Guide

**Version:** 1.0
**Last Updated:** 2025-10-19
**Project:** AI-Born Landing Page

---

## Overview

This guide explains how to run and maintain authentication tests for the AI-Born landing page. The test suite covers:

- **Unit Tests** (Vitest): Authentication logic, admin checks, entitlements
- **Integration Tests** (Vitest): Database queries, session management
- **E2E Tests** (Playwright): Complete user flows, UI interactions

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Unit Tests](#unit-tests)
3. [E2E Tests](#e2e-tests)
4. [Test Users](#test-users)
5. [Mock Data Setup](#mock-data-setup)
6. [Environment Configuration](#environment-configuration)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Quick Start

### Run All Tests

```bash
# Run all unit tests
npm run test

# Run all E2E tests
npm run test:e2e

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Run Specific Test Suites

```bash
# Run only authentication unit tests
npm run test src/__tests__/auth/

# Run only admin authentication tests
npm run test src/__tests__/auth/admin-auth.test.ts

# Run only E2E auth tests
npx playwright test e2e/auth.spec.ts

# Run E2E tests in headed mode (see browser)
npx playwright test e2e/auth.spec.ts --headed

# Run specific E2E test
npx playwright test e2e/auth.spec.ts -g "should display sign-in page"
```

---

## Unit Tests

### Location

- `/Users/iroselli/ai-born-website/src/__tests__/auth/auth-flow.test.ts`
- `/Users/iroselli/ai-born-website/src/__tests__/auth/admin-auth.test.ts`

### Test Coverage

#### `auth-flow.test.ts`

Tests core authentication functionality:

✅ **getCurrentUser**
- Returns user when authenticated
- Returns null when not authenticated
- Handles auth errors gracefully
- Returns null when session has no user

✅ **getSession**
- Returns full session when authenticated
- Returns null when not authenticated
- Handles session errors gracefully

✅ **requireAuth**
- Returns user when authenticated
- Redirects to sign-in when not authenticated
- Redirects with custom callback URL
- Handles special characters in URLs

✅ **Route Protection**
- Identifies protected routes correctly
- Identifies public routes correctly
- Identifies admin routes correctly

✅ **Entitlements**
- Checks preorder, excerpt, agent charter pack
- Queries database correctly
- Handles errors with fail-closed security
- Returns safe defaults on errors

✅ **Resource Access**
- Public access to press kit
- Protected access to excerpts
- Protected access to bonus packs

✅ **URL Helpers**
- Generates sign-in URLs with callbacks
- Generates sign-out URLs
- Encodes special characters

#### `admin-auth.test.ts`

Tests admin-specific functionality:

✅ **Admin Email Management**
- Parses comma-separated admin emails
- Normalizes emails to lowercase
- Trims whitespace
- Filters empty strings

✅ **Admin Checks**
- Identifies admin users correctly
- Case-insensitive matching
- Fetches session when needed
- Handles null/undefined gracefully

✅ **requireAdmin**
- Returns user when admin is authenticated
- Redirects to sign-in when not authenticated
- Redirects to unauthorized when not admin

✅ **Rate Limiting**
- Allows requests under limit
- Blocks requests over limit
- Resets after time window
- Tracks different identifiers separately

✅ **Admin API Security**
- Validates admin session
- Checks admin privileges
- Enforces rate limits
- Handles auth errors

### Running Unit Tests

```bash
# Run all unit tests with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:watch

# Run specific test file
npm run test auth-flow.test.ts

# Run tests matching pattern
npm run test -t "getCurrentUser"

# Debug tests in VS Code
# Set breakpoint, then run: npm run test:debug
```

### Test Output

```
 ✓ src/__tests__/auth/auth-flow.test.ts (120 tests) 2453ms
   ✓ Authentication Flow Tests (120)
     ✓ getCurrentUser (4)
       ✓ should return user when authenticated
       ✓ should return null when not authenticated
       ✓ should handle auth errors gracefully
       ✓ should return null when session has no user
     ✓ getSession (3)
     ✓ requireAuth (4)
     ✓ isProtectedRoute (3)
     ...

 ✓ src/__tests__/auth/admin-auth.test.ts (95 tests) 1891ms
   ✓ Admin Authentication Tests (95)
     ✓ getAdminEmails (7)
     ✓ isAdminEmail (8)
     ✓ isAdmin (6)
     ...

 Test Files  2 passed (2)
      Tests  215 passed (215)
   Duration  4.34s

 % Coverage report from v8
---------------------|---------|----------|---------|---------|
File                 | % Stmts | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
All files            |   94.23 |    89.47 |   96.15 |   94.23 |
 lib/auth.ts         |   96.77 |    91.66 |  100.00 |   96.77 |
 lib/admin-auth.ts   |   91.89 |    87.50 |   92.85 |   91.89 |
---------------------|---------|----------|---------|---------|
```

---

## E2E Tests

### Location

- `/Users/iroselli/ai-born-website/e2e/auth.spec.ts`

### Test Coverage

✅ **Sign-In Flow**
- Displays sign-in page with provider options
- Shows error for invalid email format
- Redirects to callback URL after sign-in
- Handles sign-in cancellation

✅ **Email Magic Link**
- Sends magic link email
- Displays instructions on verification page
- Allows requesting new magic link

✅ **Protected Routes**
- Redirects unauthenticated users to sign-in
- Allows access to public routes
- Denies access to admin routes for non-admin users

✅ **User Menu**
- Displays sign-in button when not authenticated
- Shows user menu when authenticated
- Displays user info in menu

✅ **Sign Out**
- Signs out user and redirects to home
- Clears session after sign-out
- Prevents navigation after sign-out

✅ **Session Persistence**
- Persists session across page reloads
- Persists session across navigation
- Restores session after closing tab

✅ **Error Handling**
- Displays error page for auth errors
- Handles network errors gracefully
- Handles expired magic link

✅ **Security**
- Includes CSRF protection
- Uses secure cookies in production
- Prevents clickjacking on auth pages

✅ **Accessibility**
- Keyboard navigable
- Proper ARIA labels
- Announces errors to screen readers

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run auth tests only
npx playwright test e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test e2e/auth.spec.ts --headed

# Run in UI mode (interactive)
npx playwright test e2e/auth.spec.ts --ui

# Run on specific browser
npx playwright test e2e/auth.spec.ts --project=chromium
npx playwright test e2e/auth.spec.ts --project=firefox
npx playwright test e2e/auth.spec.ts --project=webkit

# Debug specific test
npx playwright test e2e/auth.spec.ts --debug -g "should display sign-in page"

# Generate test report
npx playwright test e2e/auth.spec.ts --reporter=html
```

### Test Output

```
Running 48 tests using 4 workers

  ✓  [chromium] › auth.spec.ts:32:3 › Authentication - Sign In Flow › should display sign-in page (1.2s)
  ✓  [chromium] › auth.spec.ts:48:3 › Authentication - Sign In Flow › should show error for invalid email (856ms)
  ✓  [chromium] › auth.spec.ts:67:3 › Authentication - Email Magic Link › should send magic link email (1.1s)
  ✓  [chromium] › auth.spec.ts:85:3 › Authentication - Protected Routes › should redirect unauthenticated users (2.3s)
  ...

  48 passed (1.2m)

To open last HTML report run:

  npx playwright show-report
```

---

## Test Users

### Credentials for Different Scenarios

#### Regular User

```typescript
{
  email: 'test@example.com',
  name: 'Test User',
  // Entitlements: None by default
}
```

**Use for:**
- Basic authentication flows
- Testing protected routes
- Testing entitlement denial

#### Admin User

```typescript
{
  email: 'admin@example.com',
  name: 'Admin User',
  // Entitlements: All admin privileges
}
```

**Use for:**
- Admin route access tests
- Admin-only API endpoint tests
- Audit logging tests

**Configuration:**

Set in `.env.test`:

```bash
ADMIN_EMAILS=admin@example.com,support@example.com
```

#### New User

```typescript
{
  email: 'newuser@example.com',
  name: 'New User',
  // Entitlements: None
}
```

**Use for:**
- Sign-up flow tests
- First-time user experience
- Welcome page redirection

#### User with Entitlements

```typescript
{
  email: 'premium@example.com',
  name: 'Premium User',
  // Entitlements:
  // - hasPreordered: true
  // - hasExcerpt: true
  // - hasAgentCharterPack: true
}
```

**Use for:**
- Testing resource access
- Testing bonus claim flow
- Testing download permissions

---

## Mock Data Setup

### Database Seeding for Tests

Create a test seed file at `/Users/iroselli/ai-born-website/prisma/seed.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  // Clean existing test data
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'test@example.com',
          'admin@example.com',
          'newuser@example.com',
          'premium@example.com',
        ],
      },
    },
  });

  // Create test users
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      emailVerified: new Date(),
    },
  });

  const premiumUser = await prisma.user.create({
    data: {
      email: 'premium@example.com',
      name: 'Premium User',
      emailVerified: new Date(),
    },
  });

  // Create entitlements for premium user
  await prisma.entitlement.create({
    data: {
      userId: premiumUser.id,
      type: 'EARLY_EXCERPT',
      status: 'ACTIVE',
    },
  });

  // Create verified receipt (indicates pre-order)
  const receipt = await prisma.receipt.create({
    data: {
      userId: premiumUser.id,
      retailer: 'Amazon',
      status: 'VERIFIED',
      fileUrl: 'https://example.com/receipt.pdf',
      fileHash: 'test-hash-123',
    },
  });

  // Create delivered bonus claim
  await prisma.bonusClaim.create({
    data: {
      userId: premiumUser.id,
      receiptId: receipt.id,
      status: 'DELIVERED',
      deliveryEmail: 'premium@example.com',
      deliveredAt: new Date(),
    },
  });

  console.log('✅ Test data seeded successfully');
}

seedTestData()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**

```bash
npx tsx prisma/seed.test.ts
```

### Mocking NextAuth in Unit Tests

Tests automatically mock NextAuth using Vitest:

```typescript
// In test files
vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

// Use in tests
vi.mocked(auth).mockResolvedValue({
  user: { id: '123', email: 'test@example.com', name: 'Test User' },
  expires: '2025-12-31',
});
```

### Mocking Prisma in Unit Tests

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    receipt: {
      count: vi.fn(),
    },
    bonusClaim: {
      count: vi.fn(),
    },
    entitlement: {
      count: vi.fn(),
    },
  },
}));

// Use in tests
vi.mocked(prisma.receipt.count).mockResolvedValue(1);
```

---

## Environment Configuration

### Test Environment Variables

Create `/Users/iroselli/ai-born-website/.env.test`:

```bash
# Database (use separate test database)
DATABASE_URL="postgresql://user:password@localhost:5432/aiborn_test"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key-minimum-32-characters-long"

# Admin Users (comma-separated)
ADMIN_EMAILS="admin@example.com,support@example.com"

# Email Provider (use test mode)
RESEND_API_KEY="re_test_1234567890abcdef"
EMAIL_FROM="test@example.com"

# OAuth Providers (use test credentials)
GOOGLE_CLIENT_ID="test-google-client-id"
GOOGLE_CLIENT_SECRET="test-google-client-secret"
GITHUB_ID="test-github-id"
GITHUB_SECRET="test-github-secret"

# Node Environment
NODE_ENV="test"
```

### Loading Test Environment

Vitest automatically loads `.env.test` when running tests.

For E2E tests, update `playwright.config.ts`:

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      // Load test environment
      DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
      ADMIN_EMAILS: 'admin@example.com',
    },
  },
});
```

---

## Continuous Integration

### GitHub Actions Workflow

Create `/Users/iroselli/ai-born-website/.github/workflows/test-auth.yml`:

```yaml
name: Authentication Tests

on:
  push:
    branches: [main, develop]
    paths:
      - 'src/lib/auth.ts'
      - 'src/lib/admin-auth.ts'
      - 'src/__tests__/auth/**'
      - 'e2e/auth.spec.ts'
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          ADMIN_EMAILS: 'admin@example.com'

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: aiborn_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup database
        run: |
          npx prisma migrate deploy
          npx tsx prisma/seed.test.ts
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/aiborn_test

      - name: Run E2E tests
        run: npx playwright test e2e/auth.spec.ts
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/aiborn_test
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          ADMIN_EMAILS: 'admin@example.com'

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Troubleshooting

### Common Issues

#### Tests Fail with "auth is not a function"

**Problem:** Mock not set up correctly

**Solution:**

```typescript
// Ensure mock is imported before using
vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

const { auth } = await import('../../auth');
```

#### "Database connection refused" in Tests

**Problem:** Test database not running or wrong connection string

**Solution:**

```bash
# Check DATABASE_URL in .env.test
# Start test database
docker-compose up -d postgres-test

# Run migrations
npx prisma migrate deploy
```

#### E2E Tests Timeout

**Problem:** App not starting or slow network

**Solution:**

```typescript
// Increase timeout in playwright.config.ts
webServer: {
  timeout: 180000, // 3 minutes
}

// Or in specific test
test.setTimeout(60000); // 1 minute
```

#### "redirect is not a function" Error

**Problem:** Next.js redirect not mocked properly

**Solution:**

```typescript
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT: ${url}`);
  }),
}));
```

#### Tests Pass Locally but Fail in CI

**Problem:** Environment differences or missing secrets

**Solution:**

```yaml
# Ensure CI has all required environment variables
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  ADMIN_EMAILS: 'admin@example.com'
```

---

## Best Practices

### Writing Auth Tests

1. **Always mock external services** (email, OAuth providers)
2. **Use realistic test data** that matches production structure
3. **Test security boundaries** (fail-closed on errors)
4. **Verify redirects** for protected routes
5. **Check both happy and error paths**

### Test Organization

```
src/__tests__/
├── auth/
│   ├── auth-flow.test.ts      # Core auth logic
│   ├── admin-auth.test.ts     # Admin-specific
│   └── helpers.ts             # Shared test utilities
├── setup.ts                   # Global test setup
└── mocks/                     # Mock data

e2e/
├── auth.spec.ts               # E2E auth flows
└── helpers/
    └── auth.ts                # E2E auth helpers
```

### Test Naming Conventions

```typescript
// Unit tests
describe('FunctionName', () => {
  it('should [expected behavior] when [condition]', () => {
    // Test implementation
  });
});

// E2E tests
test.describe('Feature - Scenario', () => {
  test('should [expected behavior]', async ({ page }) => {
    // Test implementation
  });
});
```

### Coverage Goals

- **Statements:** ≥80%
- **Branches:** ≥75%
- **Functions:** ≥80%
- **Lines:** ≥80%

### Performance Benchmarks

- **Unit tests:** ≤5 seconds total
- **E2E tests:** ≤2 minutes total
- **Single E2E test:** ≤10 seconds

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [NextAuth.js Testing Guide](https://next-auth.js.org/configuration/testing)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

## Support

For questions or issues:

1. Check this guide first
2. Review test error messages carefully
3. Check GitHub Issues for similar problems
4. Create new issue with full error details and reproduction steps

---

**Last Updated:** 2025-10-19
**Maintained by:** Development Team
