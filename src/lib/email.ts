/**
 * Email Service - Resend Integration
 * Production-ready email delivery with retry logic, rate limiting, and monitoring
 *
 * Features:
 * - Transactional email sending via Resend
 * - Automatic retry with exponential backoff
 * - Per-recipient rate limiting
 * - Comprehensive error handling
 * - Email event logging
 * - CAN-SPAM compliant unsubscribe links
 */

import { Resend } from 'resend';
import { checkRateLimit } from './rate-limit';

// ============================================================================
// Configuration & Types
// ============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'AI-Born <excerpt@ai-born.org>';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@ai-born.org';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-born.org';

// Initialize Resend client
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new EmailServiceError(
      'RESEND_API_KEY environment variable is not set',
      'CONFIG_ERROR'
    );
  }

  if (!resend) {
    resend = new Resend(RESEND_API_KEY);
  }

  return resend;
}

/**
 * Custom error class for email service errors
 */
export class EmailServiceError extends Error {
  constructor(
    message: string,
    public code: EmailErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

export type EmailErrorCode =
  | 'CONFIG_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SEND_ERROR'
  | 'RETRY_EXHAUSTED'
  | 'VALIDATION_ERROR';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: EmailErrorCode;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

// Default retry configuration: exponential backoff
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
};

// Rate limiting: 5 emails per recipient per hour
const EMAIL_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

// ============================================================================
// Email Event Logging
// ============================================================================

export interface EmailEvent {
  timestamp: string;
  recipient: string;
  emailType: string;
  status: 'sent' | 'failed' | 'rate_limited';
  messageId?: string;
  error?: string;
}

/**
 * Log email events for monitoring
 * In production, send to monitoring service (Datadog, Sentry, etc.)
 */
function logEmailEvent(event: EmailEvent): void {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  if (event.status === 'failed') {
    console.error('[Email Service] Failed:', logEntry);
  } else if (event.status === 'rate_limited') {
    console.warn('[Email Service] Rate Limited:', logEntry);
  } else {
    console.info('[Email Service] Sent:', logEntry);
  }

  // TODO: In production, send to monitoring service
  // Example: await datadog.log(logEntry);
  // Example: Sentry.captureMessage('Email sent', { extra: logEntry });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep function for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.initialDelayMs * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Check if recipient is rate limited
 */
function checkEmailRateLimit(recipient: string): boolean {
  const result = checkRateLimit(
    `email:${recipient.toLowerCase()}`,
    EMAIL_RATE_LIMIT
  );

  if (!result.allowed) {
    logEmailEvent({
      timestamp: new Date().toISOString(),
      recipient,
      emailType: 'rate_limit_check',
      status: 'rate_limited',
      error: `Rate limit exceeded. Try again in ${result.resetIn} seconds.`,
    });
  }

  return result.allowed;
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(
  to: string,
  subject: string,
  html: string,
  emailType: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<EmailResult> {
  const client = getResendClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const { data, error } = await client.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        replyTo: EMAIL_REPLY_TO,
      });

      if (error) {
        throw new Error(error.message || 'Unknown Resend API error');
      }

      // Success
      logEmailEvent({
        timestamp: new Date().toISOString(),
        recipient: to,
        emailType,
        status: 'sent',
        messageId: data?.id,
      });

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on final attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delay = getRetryDelay(attempt, config);
      console.warn(
        `[Email Service] Retry ${attempt + 1}/${config.maxRetries} after ${delay}ms for ${to}`
      );
      await sleep(delay);
    }
  }

  // All retries exhausted
  const errorMessage = lastError?.message || 'Unknown error';
  logEmailEvent({
    timestamp: new Date().toISOString(),
    recipient: to,
    emailType,
    status: 'failed',
    error: errorMessage,
  });

  return {
    success: false,
    error: errorMessage,
    errorCode: 'RETRY_EXHAUSTED',
  };
}

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Get unsubscribe footer (CAN-SPAM compliant)
 */
function getUnsubscribeFooter(email: string): string {
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; line-height: 1.5;">
      <p>
        <strong>AI-Born</strong><br />
        Mic Press, LLC<br />
        New York, NY
      </p>
      <p>
        You received this email because you requested content from ai-born.org.<br />
        <a href="${unsubscribeUrl}" style="color: #00d9ff; text-decoration: underline;">Unsubscribe</a> |
        <a href="${SITE_URL}/privacy" style="color: #00d9ff; text-decoration: underline;">Privacy Policy</a>
      </p>
    </div>
  `;
}

/**
 * Base email template with branding
 */
function getEmailTemplate(content: string, recipient: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI-Born</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1f; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00d9ff; letter-spacing: -0.5px;">
                AI-BORN
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #9ca3af;">
                The Machine Core, the Human Cortex, and the Next Economy of Being
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px;">
              ${getUnsubscribeFooter(recipient)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================================
// Public API - Email Sending Functions
// ============================================================================

/**
 * Send excerpt PDF email
 * Triggered when user enters email to get free chapter
 */
export async function sendExcerptEmail(email: string): Promise<EmailResult> {
  // Validate email
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const excerptUrl = `${SITE_URL}/assets/ai-born-excerpt.pdf`;

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Your Free Excerpt is Ready
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Thank you for your interest in <strong>AI-Born</strong>. Your complimentary chapter is ready to download.
    </p>

    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      This excerpt introduces the Five Planes framework—the architectural blueprint for organisations where autonomous agents execute, learn, and adapt, whilst humans provide intent, judgement, and taste.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${excerptUrl}" style="display: inline-block; padding: 16px 32px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Download Your Excerpt
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      Prefer to pre-order now? The book is available in hardcover, eBook, and audiobook formats from <a href="${SITE_URL}/#retailers" style="color: #00d9ff; text-decoration: underline;">all major retailers</a>.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Your AI-Born Excerpt is Ready',
    html,
    'excerpt'
  );
}

/**
 * Send bonus pack email with secure download links
 * Triggered when user uploads proof of purchase and claim is approved
 */
export async function sendBonusPackEmail(
  email: string,
  claimId: string,
  downloadUrls: {
    fullPack: string;
    agentCharterPack: string;
    coiDiagnostic: string;
    vpAgentTemplates: string;
    subAgentLadders: string;
    escalationProtocols: string;
    implementationGuide: string;
  }
): Promise<EmailResult> {
  // Validate inputs
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!claimId || claimId.length < 5) {
    return {
      success: false,
      error: 'Invalid claim ID',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Validate download URLs
  if (!downloadUrls.fullPack || !downloadUrls.agentCharterPack || !downloadUrls.coiDiagnostic) {
    return {
      success: false,
      error: 'Invalid download URLs',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Your Pre-order Bonus Pack is Ready
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Thank you for pre-ordering <strong>AI-Born</strong>. Your exclusive Agent Charter Pack and Cognitive Overhead Index diagnostic are now available for download.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #00d9ff;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #00d9ff;">
        What's Included:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
        <li><strong>Agent Charter Pack:</strong> VP-agent templates, sub-agent ladders, escalation/override protocols</li>
        <li><strong>Cognitive Overhead Index (COI):</strong> Interactive diagnostic tool (Excel/Google Sheets)</li>
        <li><strong>VP-Agent Templates:</strong> Ready-to-use templates for top-level autonomous agents</li>
        <li><strong>Sub-Agent Ladders:</strong> Hierarchical organization patterns and delegation protocols</li>
        <li><strong>Escalation Protocols:</strong> Human oversight frameworks and emergency intervention patterns</li>
        <li><strong>Implementation Guide:</strong> Step-by-step setup and deployment instructions</li>
      </ul>
    </div>

    <!-- Primary CTA: Download Full Pack -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${downloadUrls.fullPack}" style="display: inline-block; padding: 16px 32px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 12px;">
            Download Complete Bonus Pack
          </a>
        </td>
      </tr>
    </table>

    <div style="margin: 24px 0; padding: 16px; background-color: #1a1a1f; border-radius: 8px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #fafafa;">
        Or download individual components:
      </h3>
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr>
          <td style="padding: 4px 0;">
            <a href="${downloadUrls.agentCharterPack}" style="color: #00d9ff; text-decoration: underline; font-size: 14px;">Agent Charter Pack (PDF)</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <a href="${downloadUrls.coiDiagnostic}" style="color: #00d9ff; text-decoration: underline; font-size: 14px;">COI Diagnostic Tool (Excel)</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <a href="${downloadUrls.vpAgentTemplates}" style="color: #00d9ff; text-decoration: underline; font-size: 14px;">VP-Agent Templates (PDF)</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <a href="${downloadUrls.subAgentLadders}" style="color: #00d9ff; text-decoration: underline; font-size: 14px;">Sub-Agent Ladders (PDF)</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <a href="${downloadUrls.escalationProtocols}" style="color: #00d9ff; text-decoration: underline; font-size: 14px;">Escalation & Override Protocols (PDF)</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <a href="${downloadUrls.implementationGuide}" style="color: #00d9ff; text-decoration: underline; font-size: 14px;">Implementation Guide (PDF)</a>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin: 24px 0; padding: 16px; background-color: #1a1a1f; border-radius: 8px; border-left: 4px solid #ff9f40;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d5db;">
        <strong style="color: #ff9f40;">Important:</strong> These download links expire in 24 hours for security. Save the files to your device now. If your links expire, you can request new ones by contacting support.
      </p>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      <strong>Claim ID:</strong> ${claimId}<br />
      Questions? Reply to this email or visit our <a href="${SITE_URL}/faq" style="color: #00d9ff; text-decoration: underline;">FAQ</a>.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Your AI-Born Pre-order Bonus Pack is Ready',
    html,
    'bonus_pack'
  );
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use sendBonusPackEmail with download URLs instead
 */
export async function sendBonusPackEmailLegacy(
  email: string,
  orderId: string
): Promise<EmailResult> {
  // This is the old implementation for backwards compatibility
  // It will be removed once all callers are updated
  const bonusPackUrl = `${SITE_URL}/assets/ai-born-bonus-pack.zip`;
  const coiToolUrl = `${SITE_URL}/assets/cognitive-overhead-index.xlsx`;

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Your Pre-order Bonus Pack is Here
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Thank you for pre-ordering <strong>AI-Born</strong>. Your exclusive Agent Charter Pack and Cognitive Overhead Index diagnostic are ready for download.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #00d9ff;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #00d9ff;">
        What's Included:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
        <li><strong>Agent Charter Pack:</strong> VP-agent templates, sub-agent ladders, escalation/override protocols</li>
        <li><strong>Cognitive Overhead Index (COI):</strong> Interactive diagnostic tool (Excel/Google Sheets)</li>
        <li><strong>Implementation Guide:</strong> Step-by-step setup instructions</li>
      </ul>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${bonusPackUrl}" style="display: inline-block; padding: 16px 32px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 12px;">
            Download Agent Charter Pack
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 12px;">
          <a href="${coiToolUrl}" style="display: inline-block; padding: 16px 32px; background-color: #1a1a1f; border: 2px solid #00d9ff; color: #00d9ff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Download COI Diagnostic Tool
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      <strong>Order ID:</strong> ${orderId}<br />
      Questions? Reply to this email or visit our <a href="${SITE_URL}/faq" style="color: #00d9ff; text-decoration: underline;">FAQ</a>.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Your AI-Born Pre-order Bonus Pack',
    html,
    'bonus_pack'
  );
}

/**
 * Send organisation invite email
 * Used for corporate/bulk order coordination
 */
export async function sendOrgInviteEmail(
  email: string,
  orgName: string,
  inviteLink: string
): Promise<EmailResult> {
  // Validate inputs
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!orgName || orgName.length < 2) {
    return {
      success: false,
      error: 'Invalid organisation name',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!inviteLink || !inviteLink.startsWith('http')) {
    return {
      success: false,
      error: 'Invalid invite link',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Bulk Order Invitation from ${orgName}
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      You've been invited to participate in a bulk pre-order of <strong>AI-Born</strong> coordinated by ${orgName}.
    </p>

    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      To support NYT bestseller list eligibility, this order is being distributed across multiple retailers and locations. Click below to select your preferred retailer and complete your purchase.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${inviteLink}" style="display: inline-block; padding: 16px 32px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Order Details
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      This invitation expires in 7 days. Questions? Contact your organisation coordinator or reply to this email.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    `Bulk Order Invitation: AI-Born (${orgName})`,
    html,
    'org_invite'
  );
}

/**
 * Send bulk order inquiry confirmation email
 * Triggered when corporate/bulk order form is submitted
 */
export async function sendBulkOrderEmail(
  email: string,
  data: {
    name: string;
    company: string;
    quantity: number;
    format?: string;
    distributionStrategy?: string;
    timeline?: string;
    inquiryId: string;
  }
): Promise<EmailResult> {
  // Validate inputs
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!data.name || !data.company || !data.quantity) {
    return {
      success: false,
      error: 'Missing required bulk order data',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const isNYTEligible = data.distributionStrategy === 'multi-store';
  const formatLabel = data.format ? data.format.charAt(0).toUpperCase() + data.format.slice(1) : 'Hardcover';
  const timelineLabel = data.timeline
    ? data.timeline.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Flexible';

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Bulk Order Inquiry Received
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Thank you for your interest in bulk orders of <strong>AI-Born</strong>. We've received your inquiry and our sales team will contact you within 24-48 hours.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #00d9ff;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #00d9ff;">
        Inquiry Details:
      </h3>
      <table style="width: 100%; color: #d1d5db; font-size: 14px; line-height: 1.8;">
        <tr>
          <td style="padding: 4px 12px 4px 0;"><strong>Inquiry ID:</strong></td>
          <td style="padding: 4px 0;">${data.inquiryId}</td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0;"><strong>Organisation:</strong></td>
          <td style="padding: 4px 0;">${data.company}</td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0;"><strong>Quantity:</strong></td>
          <td style="padding: 4px 0;">${data.quantity} copies</td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0;"><strong>Format:</strong></td>
          <td style="padding: 4px 0;">${formatLabel}</td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0;"><strong>Timeline:</strong></td>
          <td style="padding: 4px 0;">${timelineLabel}</td>
        </tr>
      </table>
    </div>

    ${
      isNYTEligible
        ? `
    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #ff9f40;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #ff9f40;">
        NYT Bestseller List Eligibility
      </h3>
      <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
        You've selected <strong>multi-store distribution</strong>, which supports NYT bestseller list eligibility. Our team will coordinate:
      </p>
      <ul style="margin: 12px 0 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.8;">
        <li>Distributed purchases across multiple retailers and locations</li>
        <li>Regional store partnerships for coordinated fulfillment</li>
        <li>Multi-store invoicing that complies with NYT reporting standards</li>
      </ul>
    </div>
    `
        : `
    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #6b7280;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #9ca3af;">
        NYT List Eligibility Information
      </h3>
      <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
        For NYT bestseller list eligibility, we recommend coordinating bulk orders through multiple retailers and locations. Our sales team can provide guidance on distributed fulfillment strategies.
      </p>
    </div>
    `
    }

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      <strong>Next Steps:</strong><br />
      Our sales team will contact you at <strong>${email}</strong> within 1-2 business days to discuss pricing, distribution options, and fulfillment logistics.
    </p>

    <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      Questions? Reply to this email or visit our <a href="${SITE_URL}/contact" style="color: #00d9ff; text-decoration: underline;">contact page</a>.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    `Bulk Order Inquiry Received: ${data.company} (${data.quantity} copies)`,
    html,
    'bulk_order'
  );
}

/**
 * Send magic link email
 * Used for passwordless authentication or secure content access
 */
export async function sendMagicLinkEmail(
  email: string,
  token: string
): Promise<EmailResult> {
  // Validate inputs
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!token || token.length < 20) {
    return {
      success: false,
      error: 'Invalid authentication token',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const magicLink = `${SITE_URL}/auth/verify?token=${encodeURIComponent(token)}`;

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Your Sign-in Link
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Click the button below to securely sign in to your AI-Born account. This link will expire in 15 minutes.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 24px 0;">
          <a href="${magicLink}" style="display: inline-block; padding: 16px 32px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Sign In to AI-Born
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      If you didn't request this link, you can safely ignore this email.
    </p>

    <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
      For security reasons, this link can only be used once and expires in 15 minutes.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Your AI-Born Sign-in Link',
    html,
    'magic_link'
  );
}

// ============================================================================
// Health Check & Diagnostics
// ============================================================================

/**
 * Send media request notification to PR team
 * Triggered when journalist/media submits a request
 */
export async function sendMediaRequestNotification(data: {
  name: string;
  email: string;
  outlet: string;
  requestType: string;
  message: string;
  phone?: string;
  deadline?: string;
  requestId: string;
}): Promise<EmailResult> {
  // Validate inputs
  if (!data.email || !data.email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!data.name || data.name.length < 2) {
    return {
      success: false,
      error: 'Invalid name',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  const prEmail = process.env.EMAIL_PR_TEAM || 'press@micpress.com';

  // Format request type for display
  const requestTypeDisplay: Record<string, string> = {
    galley: 'Advanced Reader Copy (ARC)',
    interview: 'Interview Request',
    'review-copy': 'Review Copy',
    speaking: 'Speaking Engagement',
    partnership: 'Partnership Opportunity',
    other: 'Other',
  };

  const displayType = requestTypeDisplay[data.requestType] || data.requestType;

  // Format deadline if provided
  let deadlineHtml = '';
  if (data.deadline) {
    try {
      const deadlineDate = new Date(data.deadline);
      deadlineHtml = `
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #ff9f40;">Deadline:</td>
          <td style="padding: 8px 12px; color: #d1d5db;">${deadlineDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}</td>
        </tr>
      `;
    } catch {
      // Invalid date format - skip deadline
    }
  }

  const content = `
    <div style="background-color: #1a1a1f; border-left: 4px solid #ff9f40; padding: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 4px; font-size: 20px; font-weight: 600; color: #ff9f40;">
        New Media Request
      </h2>
      <p style="margin: 0; font-size: 14px; color: #9ca3af;">
        Request ID: ${data.requestId}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #374151;">
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #00d9ff; border-bottom: 1px solid #374151;">Contact Name:</td>
        <td style="padding: 8px 12px; color: #d1d5db; border-bottom: 1px solid #374151;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #00d9ff; border-bottom: 1px solid #374151;">Email:</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #374151;">
          <a href="mailto:${data.email}" style="color: #00d9ff; text-decoration: underline;">${data.email}</a>
        </td>
      </tr>
      ${data.phone ? `
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #00d9ff; border-bottom: 1px solid #374151;">Phone:</td>
        <td style="padding: 8px 12px; color: #d1d5db; border-bottom: 1px solid #374151;">
          <a href="tel:${data.phone}" style="color: #00d9ff; text-decoration: underline;">${data.phone}</a>
        </td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #00d9ff; border-bottom: 1px solid #374151;">Outlet/Publication:</td>
        <td style="padding: 8px 12px; color: #d1d5db; border-bottom: 1px solid #374151;">${data.outlet}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #00d9ff; border-bottom: 1px solid #374151;">Request Type:</td>
        <td style="padding: 8px 12px; color: #d1d5db; border-bottom: 1px solid #374151;">${displayType}</td>
      </tr>
      ${deadlineHtml}
    </table>

    <div style="background-color: #0a0a0f; padding: 16px; border-radius: 8px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #fafafa;">
        Message:
      </h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d5db; white-space: pre-wrap;">${data.message}</p>
    </div>

    <div style="margin-top: 24px; padding: 16px; background-color: #1a1a1f; border-radius: 8px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #9ca3af;">
        <strong>Recommended Actions:</strong>
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
        <li>Respond within 24-48 hours for optimal media relations</li>
        <li>For galley/review copy requests: Verify outlet credentials before sending</li>
        <li>For interview requests: Coordinate with author's calendar</li>
        <li>Track this request in your CRM/PR management system</li>
      </ul>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="mailto:${data.email}?subject=Re: AI-Born Media Request (${data.requestId})"
             style="display: inline-block; padding: 14px 28px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Reply to ${data.name}
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.6; color: #6b7280; text-align: center;">
      This request was submitted via the AI-Born media request form at ${new Date().toLocaleString('en-GB', { timeZone: 'America/New_York' })} EST
    </p>
  `;

  const html = getEmailTemplate(content, prEmail);

  return sendEmailWithRetry(
    prEmail,
    `Media Request: ${displayType} from ${data.outlet}`,
    html,
    'media_request_notification',
    {
      maxRetries: 5, // Higher retries for critical PR notifications
      initialDelayMs: 2000,
      maxDelayMs: 30000,
    }
  );
}

/**
 * Send newsletter confirmation email (double opt-in)
 * Triggered when user subscribes to newsletter
 */
export async function sendNewsletterConfirmationEmail(
  email: string,
  confirmationToken: string
): Promise<EmailResult> {
  // Validate email
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (!confirmationToken) {
    return {
      success: false,
      error: 'Missing confirmation token',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const confirmUrl = `${SITE_URL}/newsletter/confirm?token=${encodeURIComponent(confirmationToken)}`;

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Confirm Your Subscription
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Thank you for subscribing to the <strong>AI-Born</strong> newsletter. To complete your subscription and receive updates about the book launch, please confirm your email address.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 24px 0;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 16px 32px; background-color: #00d9ff; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Confirm Subscription
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      By confirming, you'll receive:
    </p>

    <ul style="margin: 0 0 24px; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
      <li>Launch announcements and pre-order updates</li>
      <li>Exclusive excerpts and early access content</li>
      <li>Speaking event invitations</li>
      <li>Insights on AI-native organisation design</li>
    </ul>

    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
      If you didn't request this subscription, you can safely ignore this email. This confirmation link will expire in 7 days.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Confirm Your AI-Born Newsletter Subscription',
    html,
    'newsletter_confirmation'
  );
}

/**
 * Send welcome email after newsletter confirmation
 * Sent immediately after user confirms subscription
 */
export async function sendNewsletterWelcomeEmail(
  email: string,
  name?: string
): Promise<EmailResult> {
  // Validate email
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const greeting = name ? `Hi ${name}` : 'Welcome';
  const excerptUrl = `${SITE_URL}/#excerpt`;
  const preorderUrl = `${SITE_URL}/#retailers`;

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      ${greeting}, You're Confirmed
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      Welcome to the <strong>AI-Born</strong> community. You're now on the list for launch updates, exclusive insights, and early access to content about building AI-native organisations.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #00d9ff;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #00d9ff;">
        What's Next?
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
        <li>Read a <a href="${excerptUrl}" style="color: #00d9ff; text-decoration: underline;">free sample chapter</a></li>
        <li><a href="${preorderUrl}" style="color: #00d9ff; text-decoration: underline;">Pre-order your copy</a> (hardcover, eBook, or audiobook)</li>
        <li>Stay tuned for launch announcements and bonus content</li>
      </ul>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      We'll send occasional updates leading up to the launch. No spam, no daily emails—just the important stuff.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'Welcome to AI-Born Updates',
    html,
    'newsletter_welcome'
  );
}

/**
 * Send account deletion confirmation email
 * Triggered when user deletes their account
 */
export async function sendAccountDeletionEmail(
  email: string,
  name: string
): Promise<EmailResult> {
  // Validate email
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Check rate limit
  if (!checkEmailRateLimit(email)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_ERROR',
    };
  }

  const supportUrl = `${SITE_URL}/contact`;
  const privacyUrl = `${SITE_URL}/privacy`;
  const recoveryDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const formattedDeadline = recoveryDeadline.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #fafafa;">
      Account Deletion Confirmed
    </h2>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      ${name ? `Hi ${name},` : 'Hello,'}
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #d1d5db;">
      We've received your request to delete your <strong>AI-Born</strong> account. Your account has been deactivated and scheduled for permanent deletion.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #1a1a1f; border-radius: 8px; border-left: 4px solid #00d9ff;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #00d9ff;">
        30-Day Recovery Period
      </h3>
      <p style="margin: 0 0 12px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
        Your account will be soft-deleted immediately, but you have until <strong>${formattedDeadline}</strong> to request account recovery.
      </p>
      <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
        To recover your account within this 30-day period, please <a href="${supportUrl}" style="color: #00d9ff; text-decoration: underline;">contact our support team</a>.
      </p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #ff9f40;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #ff9f40;">
        What Happens Next
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
        <li><strong>Immediate:</strong> Account deactivated, sign-in disabled</li>
        <li><strong>During grace period:</strong> Data retained for recovery</li>
        <li><strong>After ${formattedDeadline}:</strong> Personal data permanently deleted</li>
      </ul>
    </div>

    <div style="margin: 24px 0; padding: 16px; background-color: #1a1a1f; border-radius: 8px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #fafafa;">
        What Has Been Deleted:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.8;">
        <li>Your profile information (name, email, preferences)</li>
        <li>All entitlements and access to downloadable content</li>
        <li>Newsletter subscription and communication preferences</li>
        <li>Organisation memberships and shared plans</li>
      </ul>
    </div>

    <div style="margin: 24px 0; padding: 16px; background-color: #1a1a1f; border-radius: 8px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #fafafa;">
        What Has Been Kept (Anonymized):
      </h3>
      <ul style="margin: 0 0 12px; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.8;">
        <li>Purchase history for accounting and legal compliance (disassociated from your identity)</li>
        <li>Receipt verification records (anonymized, for fraud prevention)</li>
      </ul>
      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        This complies with GDPR Article 17 (Right to Erasure) whilst maintaining necessary legal and accounting records. For more details, see our <a href="${privacyUrl}" style="color: #00d9ff; text-decoration: underline;">Privacy Policy</a>.
      </p>
    </div>

    <div style="margin: 24px 0; padding: 16px; background-color: #0a0a0f; border-radius: 8px; border-left: 4px solid #6b7280;">
      <p style="margin: 0 0 8px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
        <strong>Didn't request this?</strong>
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
        If you did not request account deletion, please <a href="${supportUrl}" style="color: #00d9ff; text-decoration: underline;">contact support immediately</a> to secure your account.
      </p>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      We're sorry to see you go. If you have feedback on how we could have served you better, we'd appreciate hearing from you.
    </p>
  `;

  const html = getEmailTemplate(content, email);

  return sendEmailWithRetry(
    email,
    'AI-Born Account Deletion Confirmation',
    html,
    'account_deletion'
  );
}

/**
 * Test email service configuration
 * Returns diagnostic information about email service setup
 */
export async function testEmailService(): Promise<{
  configured: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  if (!RESEND_API_KEY) {
    issues.push('RESEND_API_KEY environment variable not set');
  }

  if (!EMAIL_FROM) {
    issues.push('EMAIL_FROM environment variable not set');
  }

  if (!SITE_URL) {
    issues.push('NEXT_PUBLIC_SITE_URL environment variable not set');
  }

  return {
    configured: issues.length === 0,
    issues,
  };
}
