# Excerpt Delivery API - Quick Reference

## API Endpoints

### Request Excerpt

```bash
POST /api/excerpt/request
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",        # Optional
  "source": "hero_cta"        # Optional - for analytics
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Thank you! Check your email for the excerpt.",
  "downloadUrl": "https://ai-born.org/api/excerpt/download?token=eyJhbGc..."
}
```

**Rate Limited (429):**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again after 3:45 PM.",
  "errors": {
    "_form": ["Too many requests. Limit: 10 per hour."]
  }
}
```

---

### Download Excerpt

```bash
GET /api/excerpt/download?token=<jwt>
```

**Success (200):**
- Returns PDF file stream
- Content-Type: application/pdf
- Content-Disposition: attachment

**Expired (401):**
```json
{
  "success": false,
  "message": "Download token has expired",
  "errors": {
    "token": ["This download link has expired. Please request a new excerpt."]
  }
}
```

---

## Environment Variables

```bash
# Required
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
NEXT_PUBLIC_SITE_URL=https://ai-born.org

# Optional
RESEND_API_KEY=re_your_api_key_here
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
```

---

## Files

```
Token System:       /src/lib/tokens.ts
Request Endpoint:   /src/app/api/excerpt/request/route.ts
Download Endpoint:  /src/app/api/excerpt/download/route.ts
API Types:          /src/types/api.ts
PDF Asset:          /public/assets/ai-born-excerpt.pdf
Documentation:      /docs/excerpt-delivery-system.md
```

---

## Key Features

✓ JWT tokens with HMAC-SHA256 signing
✓ 7-day token expiry
✓ Rate limiting (10 req/hour per IP)
✓ Honeypot spam protection
✓ Zod email validation
✓ Security headers on downloads
✓ Analytics logging hooks
✓ TypeScript type safety

---

## Testing

**Request excerpt:**
```bash
curl -X POST http://localhost:3000/api/excerpt/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Download PDF:**
```bash
curl -X GET "http://localhost:3000/api/excerpt/download?token=<jwt>" \
  --output excerpt.pdf
```

---

## Common Tasks

**Generate new token:**
```typescript
import { generateExcerptToken } from '@/lib/tokens';
const token = generateExcerptToken('user@example.com', 'User Name');
```

**Verify token:**
```typescript
import { verifyExcerptToken } from '@/lib/tokens';
const result = verifyExcerptToken(token);
if (result.valid) {
  console.log('Email:', result.payload.email);
}
```

**Replace placeholder PDF:**
```bash
cp your-excerpt.pdf public/assets/ai-born-excerpt.pdf
```

---

## Troubleshooting

**"TOKEN_SECRET not configured"**
→ Set NEXTAUTH_SECRET environment variable

**"PDF file not found"**
→ Add ai-born-excerpt.pdf to /public/assets/

**"Token verification failed"**
→ Check NEXTAUTH_SECRET matches between request and download

**Email not delivered**
→ Set RESEND_API_KEY and verify sender domain

---

For complete documentation, see:
`/docs/excerpt-delivery-system.md`
