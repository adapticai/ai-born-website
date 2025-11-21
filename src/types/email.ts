/**
 * Email Service Types
 * Type definitions for email-related functionality
 */

export type EmailType =
  | 'excerpt'
  | 'bonus_pack'
  | 'org_invite'
  | 'magic_link'
  | 'newsletter'
  | 'media_request'
  | 'bulk_order_inquiry';

export interface EmailMetadata {
  recipient: string;
  emailType: EmailType;
  timestamp: Date;
  messageId?: string;
  orderId?: string;
  orgName?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface UnsubscribeRequest {
  email: string;
  token: string;
  reason?: string;
}

export interface EmailStats {
  sent: number;
  failed: number;
  rateLimited: number;
  lastSent?: Date;
  lastFailed?: Date;
}
