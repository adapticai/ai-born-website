# Migration Guide: Updating API Routes to Use Error Handling

Step-by-step guide for migrating existing API routes to use the new error handling system.

---

## Before You Start

1. Read [AUTH_ERROR_HANDLING_QUICKSTART.md](./AUTH_ERROR_HANDLING_QUICKSTART.md)
2. Have the API route file open
3. Check if route requires authentication
4. Identify what validation is needed

---

## Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
```

**After:**
```typescript
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  withErrorHandler,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  createSuccessResponse,
  validateRequiredFields,
  validateEmail,
} from "@/lib/api-error-handler";
import { logger, generateRequestId } from "@/lib/logger";
```

### Step 2: Wrap Handler

**Before:**
```typescript
export async function GET(request: NextRequest) {
  try {
    // Logic
  } catch (error) {
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```

**After:**
```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();
  // Logic
  return createSuccessResponse(data);
});
```

### Step 3: Replace Manual Error Responses

**Before:**
```typescript
if (!user) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
```

**After:**
```typescript
if (!user) {
  throw new AuthenticationError("Please sign in");
}
```

### Step 4: Replace Validation

**Before:**
```typescript
if (!email || !email.includes("@")) {
  return NextResponse.json(
    { error: "Invalid email" },
    { status: 400 }
  );
}
```

**After:**
```typescript
validateRequiredFields(body, ["email"]);
validateEmail(email);
```

### Step 5: Add Logging

**Before:**
```typescript
console.log("User authenticated");
console.error("Error:", error);
```

**After:**
```typescript
logger.info({ requestId, userId: user.id }, "User authenticated");
logger.error({ requestId, err: error }, "Operation failed");
```

### Step 6: Replace Success Responses

**Before:**
```typescript
return NextResponse.json({ success: true, data: result });
```

**After:**
```typescript
return createSuccessResponse(result);
```

---

## Complete Examples

### Example 1: Basic Protected Route

**Before:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = { userId: user.id, email: user.email };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**After:**
```typescript
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  withErrorHandler,
  AuthenticationError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { logger, generateRequestId } from "@/lib/logger";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  const user = await getCurrentUser();

  if (!user) {
    logger.warn({ requestId }, "Unauthorized access attempt");
    throw new AuthenticationError("Please sign in");
  }

  logger.info({ requestId, userId: user.id }, "User data fetched");

  return createSuccessResponse({
    userId: user.id,
    email: user.email,
  });
});
```

### Example 2: POST with Validation

**Before:**
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Process data
    const result = await saveUser(email, name);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to save user" },
      { status: 500 }
    );
  }
}
```

**After:**
```typescript
import { NextRequest } from "next/server";
import {
  withErrorHandler,
  ValidationError,
  validateRequiredFields,
  validateEmail,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { logger, generateRequestId } from "@/lib/logger";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  let body;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  // Validate required fields
  validateRequiredFields(body, ["email", "name"]);

  // Validate email format
  validateEmail(body.email);

  logger.info({ requestId, email: body.email }, "Creating user");

  // Process data
  const result = await saveUser(body.email, body.name);

  logger.info({ requestId, userId: result.id }, "User created successfully");

  return createSuccessResponse(result, { status: 201 });
});
```

### Example 3: Route with Rate Limiting

**Before:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, { limit: 10, window: 60000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rateLimit.resetIn}s` },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    // Process request
    const result = await processRequest();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**After:**
```typescript
import { NextRequest } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import {
  withErrorHandler,
  RateLimitError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { logger, generateRequestId } from "@/lib/logger";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const clientIP = getClientIP(request);

  const rateLimit = checkRateLimit(clientIP, { limit: 10, window: 60000 });

  if (!rateLimit.allowed) {
    logger.warn({ requestId, clientIP }, "Rate limit exceeded");
    throw new RateLimitError(
      `Too many requests. Try again in ${rateLimit.resetIn}s`
    );
  }

  logger.info({ requestId, clientIP }, "Processing request");

  // Process request
  const result = await processRequest();

  return createSuccessResponse(result);
});
```

### Example 4: Database Query with Not Found Handling

**Before:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
```

**After:**
```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  NotFoundError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { logger, generateRequestId } from "@/lib/logger";

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const requestId = generateRequestId();

  logger.info({ requestId, userId: params.id }, "Fetching user");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    logger.warn({ requestId, userId: params.id }, "User not found");
    throw new NotFoundError("User not found");
  }

  return createSuccessResponse(user);
});
```

---

## Common Patterns

### Pattern 1: Protected + Validation

```typescript
export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();

  // 2. Parse & Validate
  const body = await request.json();
  validateRequiredFields(body, ["field1", "field2"]);

  // 3. Process
  const result = await process(body);

  // 4. Log & Return
  logger.info({ requestId, userId: user.id }, "Success");
  return createSuccessResponse(result);
});
```

### Pattern 2: Admin-Only Route

```typescript
import { AuthorizationError } from "@/lib/api-error-handler";

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // Check auth
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();

  // Check admin
  if (!user.isAdmin) {
    logger.warn({ requestId, userId: user.id }, "Non-admin access denied");
    throw new AuthorizationError("Admin access required");
  }

  // Admin logic...
});
```

### Pattern 3: Rate Limited Public Route

```typescript
export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const clientIP = getClientIP(request);

  // Rate limit
  const rateLimit = checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
  if (!rateLimit.allowed) {
    throw new RateLimitError(`Try again in ${rateLimit.resetIn}s`);
  }

  // Public logic...
});
```

---

## Migration Checklist

For each API route:

- [ ] Import error handling utilities
- [ ] Import logger and generateRequestId
- [ ] Wrap handler with `withErrorHandler`
- [ ] Generate request ID at start
- [ ] Replace manual auth checks with error throws
- [ ] Replace manual validation with helpers
- [ ] Replace console.log with structured logging
- [ ] Replace NextResponse.json with createSuccessResponse
- [ ] Remove try/catch blocks (handled by wrapper)
- [ ] Update return type if using TypeScript
- [ ] Test the route
- [ ] Update any frontend code expecting old response format

---

## Response Format Changes

### Old Format (Inconsistent)

```typescript
// Success
{ success: true, data: {...} }

// Error (various formats)
{ error: "message" }
{ success: false, message: "...", error: "..." }
{ message: "error" }
```

### New Format (Standardised)

```typescript
// Success
{
  success: true,
  data: {...}
}

// Error
{
  error: {
    message: "User-friendly message",
    code: "ERROR_CODE",
    type: "ErrorType",
    timestamp: "2025-10-19T...",
    requestId: "req_...",
    details: {}  // Optional, only in dev or for validation
  }
}
```

---

## Frontend Updates

If your frontend expects old error format, update it:

**Before:**
```typescript
const response = await fetch("/api/endpoint");
const data = await response.json();

if (!response.ok) {
  alert(data.error || "Error occurred");
}
```

**After:**
```typescript
const response = await fetch("/api/endpoint");
const data = await response.json();

if (!response.ok) {
  alert(data.error.message);
  console.error("Error details:", data.error);
}
```

---

## Testing Migration

### 1. Manual Testing

```bash
# Test authenticated route
curl -X GET http://localhost:3000/api/account \
  -H "Cookie: next-auth.session-token=..."

# Expected: 200 with { success: true, data: {...} }

# Test unauthenticated
curl -X GET http://localhost:3000/api/account

# Expected: 401 with error object

# Test validation
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Expected: 400 with validation error
```

### 2. Unit Tests

```typescript
import { POST } from "@/app/api/endpoint/route";
import { NextRequest } from "next/server";

describe("POST /api/endpoint", () => {
  it("returns 400 for missing fields", async () => {
    const req = new NextRequest("http://localhost/api/endpoint", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 for unauthenticated", async () => {
    // Mock getCurrentUser to return null
    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });
});
```

---

## Troubleshooting

### "Module not found" errors

**Problem**: Import errors after adding new imports

**Solution**: Check file paths are correct:
```typescript
import { withErrorHandler } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";
```

### "Cannot find name 'NextResponse'"

**Problem**: Removed NextResponse import but still using it

**Solution**: Replace all NextResponse.json() with createSuccessResponse() or throw errors

### Type errors with route handlers

**Problem**: TypeScript complains about route handler type

**Solution**: Use const export with explicit typing:
```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  // ...
});
```

### Errors not being caught

**Problem**: Errors not handled by error handler

**Solution**: Make sure you're throwing errors, not returning them:
```typescript
// ✅ Good
if (!user) throw new AuthenticationError();

// ❌ Bad
if (!user) return new AuthenticationError();
```

---

## Batch Migration Strategy

1. **Start with high-priority routes**
   - Authentication routes
   - Payment/billing routes
   - Data modification routes

2. **Migrate by feature**
   - Update all routes for one feature
   - Test the feature end-to-end
   - Move to next feature

3. **Update tests alongside code**
   - Update tests as you migrate each route
   - Ensure tests pass before moving on

4. **Monitor after deployment**
   - Check error logs
   - Verify error tracking (Sentry)
   - Monitor error rates

---

## Need Help?

- **Quick reference**: [AUTH_ERROR_HANDLING_QUICKSTART.md](./AUTH_ERROR_HANDLING_QUICKSTART.md)
- **Full documentation**: [AUTH_ERROR_HANDLING.md](./AUTH_ERROR_HANDLING.md)
- **Implementation examples**: Check updated routes in `/src/app/api/`

---

**Last Updated:** 19 October 2025
