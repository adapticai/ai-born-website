# Security Implementation

This document describes the security measures implemented in the AI-Born landing page.

## Overview

The application implements comprehensive security headers and protection mechanisms to ensure:
- Protection against common web vulnerabilities (XSS, CSRF, clickjacking)
- Secure data transmission (HTTPS enforcement, HSTS)
- Privacy protection (restrictive permissions, referrer policy)
- Rate limiting and spam prevention
- Content Security Policy with nonce-based inline script execution

## Security Headers

### Implemented Headers

#### 1. Content Security Policy (CSP)
**Location**: `src/middleware.ts`

The CSP is configured with strict directives to prevent XSS attacks:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}' 'strict-dynamic' [trusted-domains]; ...
```

**Key features**:
- Nonce-based inline script execution
- Strict dynamic script loading
- Whitelisted CDNs for analytics and fonts
- No unsafe-eval or unsafe-inline (except for styles due to Tailwind)
- Blocks all mixed content
- Upgrades insecure requests

**Trusted domains**:
- Google Tag Manager / Analytics
- Vercel Analytics
- Google Fonts
- YouTube (for embeds)

#### 2. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Features**:
- 1-year max-age (31536000 seconds)
- Applies to all subdomains
- Ready for browser preload lists

#### 3. X-Frame-Options
```
X-Frame-Options: DENY
```

Prevents clickjacking by blocking all framing attempts.

#### 4. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

Prevents MIME type sniffing attacks.

#### 5. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

Sends full referrer for same-origin, only origin for cross-origin HTTPS, and nothing for HTTP destinations.

#### 6. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), ...
```

Disables all sensitive browser features:
- Camera and microphone access
- Geolocation
- FLoC (interest-cohort)
- Payment APIs
- USB, Bluetooth, Serial, HID
- All other hardware/privacy-sensitive APIs

Exceptions:
- `fullscreen=(self)` - Allows fullscreen on same origin only

### Static Asset Headers

**Location**: `next.config.ts`

#### Cache Control
- **Build assets** (`/_next/static/*`): 1 year immutable
- **Optimized images** (`/_next/image/*`): 1 year immutable
- **Fonts** (`/fonts/*`): 1 year immutable
- **Public assets** (`/logos/*`, `/images/*`): 1 week with stale-while-revalidate

## HTTPS Enforcement

**Location**: `src/middleware.ts`

In production, all HTTP requests are redirected to HTTPS with a 301 permanent redirect.

```typescript
if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
  return NextResponse.redirect(`https://${host}${pathname}`, 301);
}
```

## Rate Limiting

**Location**: `src/middleware.ts`

### Configuration
- **Window**: 1 hour (60 minutes)
- **Max requests**: 100 per IP per window
- **Scope**: All API routes (`/api/*`)

### Headers
Rate limit information is exposed via headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-18T15:30:00Z
```

### Response on Limit Exceeded
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600
}
```

HTTP Status: `429 Too Many Requests`

## CORS Configuration

**Location**: `src/middleware.ts`

CORS is configured for API routes only:

**Allowed origins**:
- Production: `https://ai-born.org`
- Development: `http://localhost:3000`, `http://localhost:3001`

**Allowed methods**: `GET, POST, PUT, DELETE, OPTIONS`

**Allowed headers**: `Content-Type, Authorization, X-Requested-With`

**Credentials**: Enabled for allowed origins

**Preflight cache**: 24 hours

## CSP Nonce Usage

For inline scripts that need to comply with CSP:

### Server Components
```tsx
import { getNonce } from '@/lib/security';

export default async function Page() {
  const nonce = await getNonce();

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `console.log('Secure inline script');`
      }}
    />
  );
}
```

### Analytics/GTM Integration
When adding Google Tag Manager or other analytics:
```tsx
const nonce = await getNonce();

<script
  nonce={nonce}
  dangerouslySetInnerHTML={{
    __html: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-XXXXXXX');
    `
  }}
/>
```

## Security Utilities

**Location**: `src/lib/security.ts`

### Input Sanitization
```typescript
import { sanitizeInput } from '@/lib/security';

const safe = sanitizeInput(userInput);
```

### Email Validation
```typescript
import { isValidEmail } from '@/lib/security';

if (!isValidEmail(email)) {
  throw new Error('Invalid email format');
}
```

### URL Safety Check
```typescript
import { isSafeURL } from '@/lib/security';

const allowedRetailers = ['amazon.com', 'barnesandnoble.com'];
if (!isSafeURL(url, allowedRetailers)) {
  throw new Error('Unsafe URL');
}
```

### File Upload Validation
```typescript
import { validateFile } from '@/lib/security';

const validation = validateFile(file, {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
});

if (!validation.valid) {
  return { error: validation.error };
}
```

### Secure Token Generation
```typescript
import { generateSecureToken } from '@/lib/security';

const csrfToken = generateSecureToken(32);
```

### Data Hashing
```typescript
import { hashString } from '@/lib/security';

const hashedOrderId = await hashString(orderId);
```

## API Route Security Best Practices

### 1. Input Validation
Always validate and sanitize inputs using Zod schemas:

```typescript
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).transform(sanitizeInput),
});
```

### 2. Rate Limiting
Check rate limits for sensitive endpoints:

```typescript
import { isRateLimited } from '@/lib/security';

const rateLimitStore = new Map();
const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

if (isRateLimited(clientIP, rateLimitStore, 10, 60000)) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

### 3. File Upload Security
Validate file uploads thoroughly:

```typescript
import { validateFile } from '@/lib/security';

const validation = validateFile(file);
if (!validation.valid) {
  return NextResponse.json(
    { error: validation.error },
    { status: 400 }
  );
}
```

### 4. Error Handling
Never expose internal errors to users:

```typescript
try {
  // Operation
} catch (error) {
  console.error('Internal error:', error);
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

## Compliance

### GDPR
- Privacy policy linked in footer
- Cookie consent implementation ready
- Data retention policies defined
- Right to erasure support in email system

### CCPA
- Privacy policy includes CCPA disclosures
- Opt-out mechanism for California residents
- Data sharing transparency

### CAN-SPAM
- One-click unsubscribe in all emails
- Physical address in email footer
- Honour opt-out requests within 10 days

## Testing Security Headers

### Using cURL
```bash
curl -I https://ai-born.org
```

### Using securityheaders.com
Visit: https://securityheaders.com/?q=https://ai-born.org

### Using Mozilla Observatory
Visit: https://observatory.mozilla.org/analyze/ai-born.org

### Expected Grades
- **securityheaders.com**: A or A+
- **Mozilla Observatory**: A or A+

## Maintenance

### Regular Tasks
- [ ] Review CSP violations (if reporting enabled)
- [ ] Update trusted domains as needed
- [ ] Monitor rate limit effectiveness
- [ ] Review and update dependencies monthly
- [ ] Test security headers after deployments

### Annual Reviews
- [ ] Security audit
- [ ] Penetration testing
- [ ] Access control review
- [ ] Compliance review (GDPR, CCPA)

## Incident Response

If a security vulnerability is discovered:

1. **Assess severity** (Critical/High/Medium/Low)
2. **Document** the vulnerability privately
3. **Develop fix** in private branch
4. **Test thoroughly** including edge cases
5. **Deploy emergency fix** if critical
6. **Notify stakeholders** as required
7. **Post-mortem** and documentation update

## Contact

For security concerns, contact:
- **Email**: security@ai-born.org (if available)
- **Project Lead**: [Contact information]

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Best Practices](https://securityheaders.com/)
- [Next.js Security Documentation](https://nextjs.org/docs/advanced-features/security-headers)
