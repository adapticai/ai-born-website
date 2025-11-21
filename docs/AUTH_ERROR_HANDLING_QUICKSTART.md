# Authentication Error Handling - Quick Start

Quick reference for implementing error handling in the AI-Born application.

## For Component Developers

### Wrap Protected Components

```tsx
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

export function MyProtectedPage() {
  return (
    <AuthErrorBoundary>
      <ProtectedContent />
    </AuthErrorBoundary>
  );
}
```

### Handle Async Errors

```tsx
"use client";

import { useEffect, useState } from "react";

export function MyComponent() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/account");
        if (!response.ok) {
          throw new Error("Failed to fetch account");
        }
        // Handle success
      } catch (err) {
        setError(err as Error);
      }
    }
    loadData();
  }, []);

  if (error) throw error; // Error boundary will catch this

  return <div>Content</div>;
}
```

---

## For API Route Developers

### Basic API Route

```typescript
import { NextRequest } from "next/server";
import {
  withErrorHandler,
  AuthenticationError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { generateRequestId } from "@/lib/logger";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // Check authentication
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError("Please sign in");
  }

  // Your logic here
  logger.info({ requestId, userId: user.id }, "Processing request");

  return createSuccessResponse({
    message: "Success!",
    data: { /* your data */ }
  });
});
```

### With Validation

```typescript
import {
  withErrorHandler,
  ValidationError,
  validateRequiredFields,
  validateEmail,
  createSuccessResponse,
} from "@/lib/api-error-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const body = await request.json();

  // Validate required fields
  validateRequiredFields(body, ["email", "name"]);

  // Validate email format
  validateEmail(body.email);

  // Your logic...

  return createSuccessResponse({ success: true });
});
```

### With Rate Limiting

```typescript
import {
  withErrorHandler,
  RateLimitError,
} from "@/lib/api-error-handler";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, { limit: 10, window: 60000 });

  if (!rateLimit.allowed) {
    throw new RateLimitError(
      `Too many requests. Try again in ${rateLimit.resetIn}s`
    );
  }

  // Your logic...
});
```

---

## Common Error Types

```typescript
import {
  AuthenticationError,    // 401 - User not signed in
  AuthorizationError,     // 403 - User lacks permission
  ValidationError,        // 400 - Invalid input
  NotFoundError,          // 404 - Resource not found
  RateLimitError,         // 429 - Too many requests
  ConfigurationError,     // 500 - Server config issue
} from "@/lib/api-error-handler";

// Usage
throw new AuthenticationError("Please sign in");
throw new AuthorizationError("Access denied");
throw new ValidationError("Invalid email", { field: "email" });
throw new NotFoundError("User not found");
throw new RateLimitError("Too many requests");
throw new ConfigurationError("Database connection failed");
```

---

## Response Helpers

### Success Response

```typescript
import { createSuccessResponse } from "@/lib/api-error-handler";

return createSuccessResponse(
  { userId: "123", name: "John" },
  { status: 200 }  // optional
);

// Returns:
// {
//   "success": true,
//   "data": { "userId": "123", "name": "John" }
// }
```

### Error Response

```typescript
import { createErrorResponse } from "@/lib/api-error-handler";

return createErrorResponse(
  "Invalid input",
  400,
  "VALIDATION_ERROR",
  { field: "email" }  // optional details
);

// Returns:
// {
//   "error": {
//     "message": "Invalid input",
//     "code": "VALIDATION_ERROR",
//     "type": "Error",
//     "timestamp": "2025-10-19T...",
//     "details": { "field": "email" }
//   }
// }
```

---

## Logging

```typescript
import { logger, generateRequestId } from "@/lib/logger";

const requestId = generateRequestId();

// Info logging
logger.info({ requestId, userId: user.id }, "User authenticated");

// Warning logging
logger.warn({ requestId, reason: "invalid token" }, "Auth failed");

// Error logging
logger.error({ requestId, err: error }, "Database error");

// With performance tracking
logger.performance({
  name: "database_query",
  value: 150,
  unit: "ms",
  context: { requestId }
});
```

---

## Testing

### Test Error Boundary

```typescript
import { render, screen } from "@testing-library/react";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

test("catches and displays errors", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  render(
    <AuthErrorBoundary>
      <ThrowError />
    </AuthErrorBoundary>
  );

  expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
});
```

### Test API Error Handling

```typescript
import { GET } from "@/app/api/account/route";
import { NextRequest } from "next/server";

test("returns 401 for unauthenticated request", async () => {
  const req = new NextRequest("http://localhost/api/account");
  const response = await GET(req);
  const data = await response.json();

  expect(response.status).toBe(401);
  expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
});
```

---

## Complete API Route Example

```typescript
/**
 * User Profile API Route
 * @route GET /api/user/profile
 */

import { NextRequest } from "next/server";
import {
  withErrorHandler,
  AuthenticationError,
  NotFoundError,
  createSuccessResponse,
} from "@/lib/api-error-handler";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, generateRequestId } from "@/lib/logger";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // Step 1: Authenticate
  const user = await getCurrentUser();
  if (!user) {
    logger.warn({ requestId }, "Unauthenticated profile access attempt");
    throw new AuthenticationError("Please sign in to view your profile");
  }

  logger.info({ requestId, userId: user.id }, "Fetching user profile");

  // Step 2: Fetch data
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Step 3: Validate data exists
  if (!profile) {
    logger.error({ requestId, userId: user.id }, "Profile not found");
    throw new NotFoundError("Profile not found");
  }

  // Step 4: Return success
  logger.info({ requestId, userId: user.id }, "Profile fetched successfully");

  return createSuccessResponse({
    profile,
    metadata: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
});
```

---

## Common Patterns

### Protected Route

```typescript
export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();

  // Protected logic...
});
```

### Admin-Only Route

```typescript
import { AuthorizationError } from "@/lib/api-error-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();

  if (!user.isAdmin) {
    throw new AuthorizationError("Admin access required");
  }

  // Admin logic...
});
```

### Input Validation

```typescript
import {
  ValidationError,
  validateRequiredFields,
  validateEmail,
} from "@/lib/api-error-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Validate required fields
  validateRequiredFields(body, ["email", "name"]);

  // Validate email format
  validateEmail(body.email);

  // Additional custom validation
  if (body.age < 18) {
    throw new ValidationError("Must be 18 or older", {
      field: "age",
      value: body.age,
    });
  }

  // Process valid input...
});
```

### Database Error Handling

```typescript
export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();

  const data = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!data) {
    throw new NotFoundError("User not found");
  }

  return createSuccessResponse(data);
});
```

---

## Checklist

### For Every Protected Component
- [ ] Wrap in `<AuthErrorBoundary>`
- [ ] Handle async errors with try/catch or state
- [ ] Add loading states
- [ ] Test error scenarios

### For Every API Route
- [ ] Use `withErrorHandler` wrapper
- [ ] Generate request ID
- [ ] Check authentication if needed
- [ ] Validate input
- [ ] Log important operations
- [ ] Return typed responses
- [ ] Handle database errors
- [ ] Write tests

### For Every Error
- [ ] Use appropriate error class
- [ ] Include helpful error message
- [ ] Add context/details if relevant
- [ ] Log the error
- [ ] Return user-friendly response

---

## File Imports Reference

```typescript
// Error boundary
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

// Error handling
import {
  withErrorHandler,
  handleApiError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ConfigurationError,
  createSuccessResponse,
  createErrorResponse,
  validateRequiredFields,
  validateEmail,
  validateMethod,
} from "@/lib/api-error-handler";

// Logging
import { logger, generateRequestId } from "@/lib/logger";

// Auth
import { getCurrentUser, hasEntitlement } from "@/lib/auth";

// Types
import { AuthErrorType } from "@/types/auth";
```

---

## Need Help?

- Full documentation: [AUTH_ERROR_HANDLING.md](./AUTH_ERROR_HANDLING.md)
- Auth implementation: [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md)
- Logging guide: [LOGGING.md](./LOGGING.md)

---

**Last Updated:** 19 October 2025
