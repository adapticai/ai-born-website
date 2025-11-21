# Authentication Error Handling

Comprehensive error handling system for authentication errors using React Error Boundaries and Next.js error handling patterns.

## Overview

This implementation provides:
- React Error Boundaries for client-side error handling
- Next.js global error boundary for application-wide errors
- Standardised API error responses
- Beautiful, accessible error UI using shadcn/ui
- Automatic error logging to console and Sentry
- Type-safe error handling with TypeScript

---

## Components

### 1. AuthErrorBoundary Component

**Location:** `/src/components/auth/AuthErrorBoundary.tsx`

A React Error Boundary specifically designed for authentication errors.

#### Features

- Catches authentication-related errors in client components
- Provides contextual error messages based on error type
- Beautiful error UI using shadcn/ui Alert component
- Recovery actions (retry, sign in, go home)
- Development debug information
- Automatic logging to Sentry

#### Usage

```tsx
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

// Wrap auth-protected components
<AuthErrorBoundary>
  <ProtectedContent />
</AuthErrorBoundary>

// With custom fallback
<AuthErrorBoundary
  fallback={(error, reset) => (
    <CustomErrorUI error={error} onRetry={reset} />
  )}
>
  <ProtectedContent />
</AuthErrorBoundary>

// With error callback
<AuthErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    trackError(error);
  }}
>
  <ProtectedContent />
</AuthErrorBoundary>
```

#### Error Types Handled

The component automatically detects and handles these error types:

- `Configuration` - Authentication configuration errors
- `AccessDenied` - User lacks permission
- `Verification` - Email verification failed
- `OAuthSignin` - OAuth sign-in error
- `OAuthCallback` - OAuth callback error
- `OAuthCreateAccount` - Account creation via OAuth failed
- `EmailCreateAccount` - Account creation via email failed
- `Callback` - General callback error
- `OAuthAccountNotLinked` - Account linking error
- `EmailSignin` - Email sign-in error
- `CredentialsSignin` - Invalid credentials
- `SessionRequired` - User must be authenticated
- `Default` - Catch-all for unknown errors

#### Error Messages

Each error type has a user-friendly title and description:

```typescript
{
  SessionRequired: {
    title: "Authentication required",
    description: "You must be signed in to access this page. Please sign in to continue."
  },
  AccessDenied: {
    title: "Access denied",
    description: "You do not have permission to access this resource."
  },
  // ... etc
}
```

---

### 2. Global Error Boundary

**Location:** `/src/app/error.tsx`

Next.js global error boundary that catches all unhandled errors in the application.

#### Features

- Catches all client-side errors application-wide
- Brand-styled error UI matching AI-Born design system
- Detects authentication vs general errors
- Development debug information
- Automatic Sentry logging
- Responsive design with brand colours

#### Error Detection

Automatically detects authentication errors by checking for keywords:

```typescript
const authKeywords = [
  "auth", "session", "signin", "login",
  "unauthorized", "forbidden", "access denied",
  "verification", "oauth", "credentials"
];
```

#### UI Features

- **Brand colours:** Uses `brand-obsidian`, `brand-cyan`, `brand-ember`
- **Book branding:** Shows "AI-Born" title and subtitle
- **Action buttons:**
  - Try again (resets error boundary)
  - Go home (navigates to homepage)
  - Contact support (opens media kit page)
- **Error ID:** Shows Next.js error digest for debugging
- **Development mode:** Shows full stack trace and error details

---

### 3. API Error Handler

**Location:** `/src/lib/api-error-handler.ts`

Standardised error handling utilities for Next.js API routes.

#### Error Classes

```typescript
// Base error class
class ApiError extends Error {
  statusCode: number;
  code: string;
  type: string;
  details?: unknown;
  requestId?: string;
}

// Authentication errors
class AuthenticationError extends ApiError {
  // 401 Unauthorized
}

// Authorization errors
class AuthorizationError extends ApiError {
  // 403 Forbidden
}

// Validation errors
class ValidationError extends ApiError {
  // 400 Bad Request
}

// Not found errors
class NotFoundError extends ApiError {
  // 404 Not Found
}

// Rate limit errors
class RateLimitError extends ApiError {
  // 429 Too Many Requests
}

// Configuration errors
class ConfigurationError extends ApiError {
  // 500 Internal Server Error
}
```

#### Usage Examples

##### Basic Error Handling

```typescript
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  try {
    // API logic
    return NextResponse.json({ data: "..." });
  } catch (error) {
    return handleApiError(error, { requestId: "..." });
  }
}
```

##### Error Handler Wrapper

```typescript
import { withErrorHandler } from "@/lib/api-error-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Your logic here - errors are automatically handled
  return NextResponse.json({ success: true });
});
```

##### Throwing Specific Errors

```typescript
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from "@/lib/api-error-handler";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError("Please sign in");
  }

  const data = await db.findUnique({ where: { id } });

  if (!data) {
    throw new NotFoundError("Resource not found");
  }

  return createSuccessResponse(data);
});
```

##### Success Responses

```typescript
import { createSuccessResponse } from "@/lib/api-error-handler";

return createSuccessResponse(
  { userId: "123", name: "John" },
  { status: 201 }
);

// Response:
// {
//   "success": true,
//   "data": { "userId": "123", "name": "John" }
// }
```

##### Error Responses

```typescript
import { createErrorResponse } from "@/lib/api-error-handler";

return createErrorResponse(
  "Invalid input",
  400,
  "VALIDATION_ERROR",
  { field: "email" }
);

// Response:
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

#### Validation Helpers

```typescript
import {
  validateRequiredFields,
  validateEmail,
  validateMethod,
} from "@/lib/api-error-handler";

// Validate required fields
const body = await req.json();
validateRequiredFields(body, ["email", "name"]);

// Validate email format
validateEmail(email);

// Validate HTTP method
validateMethod(req.method, ["POST", "PUT"]);
```

---

## Updated API Routes

The following API routes have been updated with proper error handling:

### 1. Send Magic Link

**File:** `/src/app/api/send-magic-link/route.ts`

```typescript
export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  // Rate limiting
  const rateLimit = checkRateLimit(clientIP, EMAIL_CAPTURE_RATE_LIMIT);
  if (!rateLimit.allowed) {
    throw new RateLimitError(`Too many requests...`);
  }

  // Validation
  validateEmail(email);

  // Logic...

  return createSuccessResponse({
    message: "Magic link sent successfully"
  });
});
```

### 2. Account API

**File:** `/src/app/api/account/route.ts`

```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();

  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError("Please sign in");
  }

  const userData = await prisma.user.findUnique({...});
  if (!userData) {
    throw new NotFoundError("User not found");
  }

  return createSuccessResponse(accountData);
});
```

### 3. Excerpt Entitlement Check

**File:** `/src/app/api/excerpt/check-entitlement/route.ts`

```typescript
export const GET = withErrorHandler(async () => {
  const requestId = generateRequestId();

  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError("Please sign in");
  }

  const hasAccess = await hasEntitlement("excerpt");

  return createSuccessResponse({
    hasEntitlement: hasAccess,
    downloadUrl: hasAccess ? `/api/excerpt/download` : null
  });
});
```

---

## Layout Integration

**File:** `/src/app/layout.tsx`

The `AuthErrorBoundary` is integrated into the root layout to catch errors across the entire application:

```tsx
<body>
  <SessionProvider>
    <ThemeProvider>
      <AuthErrorBoundary>
        <StyleGlideProvider />
        {children}
        <CookieConsent />
        <GTMConditional />
        <Analytics />
        <SpeedInsights />
        <WebVitalsReporter />
      </AuthErrorBoundary>
    </ThemeProvider>
  </SessionProvider>
</body>
```

---

## Error Response Format

All API errors follow this standardised format:

```typescript
interface ApiErrorResponse {
  error: {
    message: string;          // User-friendly error message
    code: string;             // Machine-readable error code
    type: string;             // Error type/category
    details?: unknown;        // Additional details (dev/validation only)
    timestamp: string;        // ISO timestamp
    requestId?: string;       // Request correlation ID
  }
}
```

### Example Error Response

```json
{
  "error": {
    "message": "Please sign in to view your account",
    "code": "AUTHENTICATION_REQUIRED",
    "type": "SessionRequired",
    "timestamp": "2025-10-19T14:30:00.000Z",
    "requestId": "req_1729348200000_abc123"
  }
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

---

## Logging

All errors are automatically logged using the structured logger:

```typescript
import { logger } from "@/lib/logger";

// Automatic logging in error handlers
logger.error({
  err: error,
  requestId,
  statusCode: 401,
  code: "AUTHENTICATION_REQUIRED",
  type: "SessionRequired"
}, "Authentication error");

// Manual logging in routes
logger.info({
  requestId,
  userId: user.id
}, "User authenticated successfully");

logger.warn({
  requestId,
  clientIP
}, "Rate limit exceeded");
```

### Log Levels

- `trace` - Verbose debugging
- `debug` - Debugging information
- `info` - Normal operations
- `warn` - Warning conditions
- `error` - Error conditions
- `fatal` - Fatal errors (process should exit)

---

## Sentry Integration

Errors are automatically sent to Sentry if configured:

```typescript
// In error boundary
if (typeof window !== "undefined" && window.Sentry) {
  window.Sentry.captureException(error, {
    contexts: {
      react: { componentStack },
      auth: { errorType }
    }
  });
}
```

### Sentry Configuration

Ensure Sentry is configured in:
- `/instrumentation.ts` (server-side)
- `/src/app/layout.tsx` (client-side)

---

## Best Practices

### 1. Always Use Error Handler Wrapper

```typescript
// Good
export const POST = withErrorHandler(async (req) => {
  // Logic
});

// Avoid
export async function POST(req) {
  try {
    // Logic
  } catch (error) {
    // Manual error handling
  }
}
```

### 2. Throw Specific Error Types

```typescript
// Good
if (!user) {
  throw new AuthenticationError("Please sign in");
}

// Avoid
if (!user) {
  throw new Error("Please sign in");
}
```

### 3. Include Request IDs

```typescript
const requestId = generateRequestId();

logger.info({ requestId, userId }, "Processing request");

// Include in error options
throw new ValidationError("Invalid input", details, { requestId });
```

### 4. Use Validation Helpers

```typescript
// Good
validateRequiredFields(body, ["email", "name"]);
validateEmail(email);

// Avoid
if (!body.email || !body.name) {
  throw new Error("Missing fields");
}
```

### 5. Log Before Throwing

```typescript
// Good
logger.warn({ requestId, userId }, "Access denied");
throw new AuthorizationError("Access denied");

// Also good (withErrorHandler logs automatically)
throw new AuthorizationError("Access denied");
```

---

## Testing

### Test Error Boundaries

```typescript
import { render, screen } from "@testing-library/react";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

test("shows error UI when child throws", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  render(
    <AuthErrorBoundary>
      <ThrowError />
    </AuthErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Test API Error Handling

```typescript
import { POST } from "@/app/api/send-magic-link/route";

test("returns 401 for unauthenticated request", async () => {
  const req = new NextRequest("http://localhost/api/send-magic-link", {
    method: "POST",
    body: JSON.stringify({ email: "test@example.com" })
  });

  const response = await POST(req);
  const data = await response.json();

  expect(response.status).toBe(401);
  expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
});
```

---

## Troubleshooting

### Error Boundary Not Catching Errors

- Error boundaries only catch errors in client components
- Add `"use client"` directive to components
- Errors in event handlers must be caught manually

### API Errors Not Formatted Correctly

- Ensure using `withErrorHandler` wrapper
- Check that error classes are imported correctly
- Verify error is being thrown (not returned)

### Logging Not Working

- Check logger configuration in `/src/lib/logger.ts`
- Verify environment variables are set
- Check log level configuration

### Sentry Not Receiving Errors

- Verify Sentry DSN is configured
- Check instrumentation files exist
- Ensure Sentry SDK is initialised

---

## File Locations

| File | Purpose |
|------|---------|
| `/src/components/auth/AuthErrorBoundary.tsx` | React Error Boundary for auth errors |
| `/src/app/error.tsx` | Global Next.js error boundary |
| `/src/lib/api-error-handler.ts` | API error handling utilities |
| `/src/types/auth.ts` | Auth error type definitions |
| `/src/lib/logger.ts` | Structured logging |

---

## Related Documentation

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md)
- [LOGGING.md](./LOGGING.md)
- [SENTRY_SETUP.md](./SENTRY_SETUP.md)

---

**Last Updated:** 19 October 2025
**Maintainer:** Development Team
