# Media Request System - Quick Start Guide

## For Developers

### Setup (5 minutes)

1. **Get Resend API Key**
   ```bash
   # Visit https://resend.com and create account
   # Go to API Keys → Create API Key
   # Copy the key (starts with re_)
   ```

2. **Configure Environment**
   ```bash
   # Create .env.local file
   cp .env.example .env.local

   # Edit .env.local and set:
   RESEND_API_KEY=re_your_actual_key_here
   EMAIL_PR_TEAM=press@micpress.com
   EMAIL_FROM=AI-Born <excerpt@ai-born.org>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For dev
   ```

3. **Verify Domain (Production only)**
   ```bash
   # In Resend dashboard:
   # 1. Go to Domains → Add Domain
   # 2. Add ai-born.org
   # 3. Add DNS records to domain provider:
   #    - SPF record
   #    - DKIM record
   #    - DMARC record (optional but recommended)
   ```

4. **Test Locally**
   ```bash
   npm run dev
   # Navigate to http://localhost:3000
   # Find "For Media & Partners" section
   # Fill out and submit form
   # Check console for email logs
   ```

### Testing Email Delivery

**Option 1: Use your own email**
```bash
# In .env.local, temporarily set:
EMAIL_PR_TEAM=your-email@gmail.com

# Submit test request through form
# Check your inbox for notification email
```

**Option 2: Use cURL**
```bash
curl -X POST http://localhost:3000/api/media-request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Journalist",
    "email": "journalist@example.com",
    "outlet": "Test Publication",
    "requestType": "interview",
    "phone": "+1 (555) 123-4567",
    "message": "This is a test media request to verify email delivery and formatting.",
    "deadline": "2025-10-25T14:00:00.000Z"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Thank you for your request. We will review it and get back to you within 24 hours.",
  "data": {
    "requestId": "MR-1729267890-XYZ123",
    "requestType": "interview"
  }
}
```

### Troubleshooting

**Email not sending?**

1. Check API key is set correctly:
   ```bash
   echo $RESEND_API_KEY
   # Should output: re_...
   ```

2. Check server logs:
   ```bash
   # Look for:
   [EMAIL SUCCESS] PR notification sent for MR-xxx
   # or
   [EMAIL ERROR] Failed to send PR notification
   ```

3. Verify domain in Resend:
   ```bash
   # For development: Use resend.dev domain (works without verification)
   # For production: Must verify ai-born.org domain
   ```

**Rate limited?**

```bash
# Wait 1 hour, or clear rate limit storage:
rm -rf data/rate-limits/  # If using file-based storage

# Or use different IP (VPN, incognito, etc.)
```

**Validation errors?**

```bash
# Check schema matches form:
# File: src/lib/schemas/contact.ts
# Ensure requestType enum matches form options

# Valid request types:
# - galley
# - interview
# - review-copy
# - speaking
# - partnership
# - other
```

---

## For PR Team

### Receiving Notifications

When someone submits a media request, you'll receive an email at `press@micpress.com` (or configured address) with:

1. **Request details**:
   - Request ID (for tracking)
   - Contact name and email
   - Phone number (if provided)
   - Outlet/publication
   - Request type
   - Deadline (if provided)
   - Full message

2. **Quick actions**:
   - "Reply to [Name]" button with pre-filled subject
   - Clickable email and phone links
   - Recommended next steps

### Responding to Requests

**Recommended timeline**:
- Standard requests: 24-48 hours
- Urgent (with deadline): Within a few hours
- Galley requests: Verify outlet credentials first

**Best practices**:
1. Reply using the request ID in subject: `Re: AI-Born Media Request (MR-xxx)`
2. Track in your CRM/spreadsheet (request ID as reference)
3. For galleys: Verify journalist's credentials before sending
4. For interviews: Coordinate with author's calendar
5. Update request status after response

### Request Types Explained

| Type | What to send | Typical response time |
|------|-------------|----------------------|
| **Galley** | Advanced reader copy (ARC) PDF | 1-2 days (after verification) |
| **Interview** | Calendar coordination email | 24 hours |
| **Review Copy** | Same as galley, post-publication | 1-2 days |
| **Speaking** | Speaker info, availability, fees | 48 hours |
| **Partnership** | Partnership deck, schedule call | 2-3 days |
| **Other** | Case-by-case | 24-48 hours |

### Tracking Requests

**Manual tracking (temporary)**:
1. Forward notification email to ticketing system
2. Add to spreadsheet with columns:
   - Request ID
   - Date received
   - Contact name
   - Outlet
   - Request type
   - Status (pending/contacted/completed)
   - Date responded
   - Notes

**Future automated tracking**:
- Dashboard with all requests
- Status management (pending → contacted → completed)
- Analytics (requests by outlet, type, response time)

---

## For Product/Business Team

### Analytics & Metrics

Track these KPIs:

**Volume**:
- Total requests per week
- Breakdown by type (interview vs galley vs speaking)
- Top requesting outlets

**Quality**:
- Tier 1 outlets (NYT, WSJ, etc.) vs tier 2/3
- Conversion to actual coverage
- Lead time (request to coverage)

**Performance**:
- PR team response time
- Request fulfillment rate
- Media coverage generated

### Reporting

**Weekly report should include**:
1. Total requests received
2. Breakdown by type and outlet
3. Outstanding requests (>48h old)
4. Media coverage secured
5. Upcoming deadlines

**Monthly report should include**:
1. Trend analysis (month-over-month)
2. Top performing outlets
3. Coverage value estimation
4. ROI on media relations

### Optimization Opportunities

**High-value outlets**:
- Consider priority routing/faster response
- Personalized follow-up
- Direct contact information

**Common requests**:
- Create FAQ or self-service press kit
- Automated galley delivery for verified outlets
- Interview topics & questions guide

**Bottlenecks**:
- If response time >48h, consider additional PR support
- If galley verification slow, create whitelist
- If scheduling difficult, use Calendly integration

---

## Common Scenarios

### Scenario 1: Breaking News Request

**Journalist**: Major outlet, needs interview within 24 hours

**Action**:
1. Email notification arrives with 🚨 urgent indicator (if deadline set)
2. PR team responds within 2 hours
3. Coordinate with author for phone/video interview
4. Follow up with coverage links

### Scenario 2: Book Review Request

**Journalist**: Publication wants review copy for upcoming issue

**Action**:
1. Verify journalist credentials (Google their name + outlet)
2. Check publication reach and relevance
3. Send digital galley (PDF) via email
4. Add to review tracking list
5. Follow up 2 weeks before publication date

### Scenario 3: Speaking Engagement

**Organizer**: Conference wants author as keynote speaker

**Action**:
1. Check author's speaking calendar
2. Request event details (date, location, audience, fee)
3. Send speaker one-sheet and requirements
4. Negotiate terms (fee, travel, accommodations)
5. Confirm 2 weeks before event

### Scenario 4: Partnership Inquiry

**Business**: Company wants bulk orders + custom content

**Action**:
1. Forward to partnerships team
2. Schedule discovery call
3. Send partnership deck
4. Negotiate terms (volume, customization, timeline)
5. Route to bulk order fulfillment

---

## Security & Privacy

### Data Handling

**Personal data collected**:
- Name, email, phone (optional)
- Outlet/company
- Message content
- IP address (for rate limiting)

**Storage**:
- JSON file: `data/media-requests.json`
- Email: Sent to `press@micpress.com`
- Logs: Server logs (7-day retention)

**Compliance**:
- GDPR: Right to erasure (delete from JSON + email)
- CCPA: Right to know (provide copy of stored data)
- CAN-SPAM: Unsubscribe link in footer (if added to mailing list)

### Spam Prevention

**Measures in place**:
1. Honeypot field (catches bots)
2. Rate limiting (5 requests/hour per IP)
3. Input sanitization (prevents XSS)
4. CORS protection (only ai-born.org can submit)

**If spam increases**:
1. Add CAPTCHA (hCaptcha or Cloudflare Turnstile)
2. IP reputation checking
3. Content keyword filtering
4. Geographic restrictions

---

## Support Contacts

| Issue | Contact |
|-------|---------|
| Technical problems | dev@micpress.com |
| PR questions | press@micpress.com |
| Partnership inquiries | partnerships@micpress.com |
| Urgent media requests | Call PR team directly |

---

**Last Updated**: October 18, 2025
**Version**: 1.0
